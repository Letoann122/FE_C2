<template>
  <div class="container py-5 appointment-detail-page">
    <div
      class="mb-4 border-bottom pb-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
    >
      <div>
        <h3 class="fw-bold text-danger mb-1">
          <i class="bi bi-calendar-event me-2"></i>
          Chi tiết lịch hẹn
        </h3>
        <p class="text-muted mb-0">
          Theo dõi trạng thái hiến máu theo thời gian thực.
        </p>
      </div>

      <button
        class="btn btn-outline-secondary"
        @click="$router.push('/my-appointments')"
      >
        <i class="bi bi-arrow-left me-1"></i>
        Quay lại danh sách
      </button>
    </div>

    <div v-if="realtimeMessage" class="alert alert-success rounded-4 shadow-sm">
      <i class="bi bi-broadcast me-1"></i>
      {{ realtimeMessage }}
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger"></div>
      <div class="text-muted mt-2">Đang tải lịch hẹn...</div>
    </div>

    <div v-else-if="appointment" class="row g-4">
      <!-- LEFT -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3">Thông tin lịch hẹn</h5>

            <div class="detail-row">
              <div class="small text-muted">Mã lịch</div>
              <div class="fw-semibold">{{ appointment.appointment_code }}</div>
            </div>

            <div class="detail-row">
              <div class="small text-muted">Ngày giờ hẹn</div>
              <div class="fw-semibold">
                {{ formatDateTime(appointment.scheduled_at) }}
              </div>
            </div>

            <div class="detail-row">
              <div class="small text-muted">Ca hiến máu</div>
              <div class="fw-semibold">{{ timeSlotLabel }}</div>
            </div>

            <div class="detail-row">
              <div class="small text-muted">Địa điểm</div>
              <div class="fw-semibold">
                {{
                  appointment.site_name ||
                  appointment.donation_site?.name ||
                  "Không có dữ liệu"
                }}
              </div>
              <div class="small text-muted">
                {{
                  appointment.address ||
                  appointment.donation_site?.address ||
                  ""
                }}
              </div>
            </div>

            <div
              v-if="
                appointment.status === 'COMPLETED' &&
                appointment.donation?.volume_ml
              "
              class="detail-row"
            >
              <div class="small text-muted">Lượng máu đã hiến</div>
              <div class="fw-semibold text-danger">
                {{ appointment.donation.volume_ml }} ml
              </div>
            </div>
            <div
              v-if="
                appointment.status === 'COMPLETED' && appointment.completed_at
              "
              class="detail-row"
            >
              <div class="small text-muted">Thời gian hoàn tất</div>
              <div class="fw-semibold">
                {{ formatDateTime(appointment.completed_at) }}
              </div>
            </div>
            <div class="detail-row border-0 mb-0 pb-0">
              <div class="small text-muted">Trạng thái hiện tại</div>
              <div>
                <span
                  class="badge"
                  :class="statusBadgeClass(appointment.status)"
                >
                  {{ statusLabel(appointment.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="canShowQr" class="card border-0 shadow-sm rounded-4 mt-3">
          <div class="card-body p-4">
            <h6 class="fw-bold mb-3">Thẻ QR Check-in</h6>

            <div class="qr-box">
              <img
                v-if="qrCodeDataUrl"
                :src="qrCodeDataUrl"
                alt="QR"
                class="qr-image"
              />
            </div>

            <div class="text-center mt-3">
              <div class="small text-muted">Mã check-in</div>
              <div class="fw-bold fs-5">
                {{ appointment.appointment_code }}
              </div>
            </div>

            <div class="d-grid gap-2 mt-3">
              <button class="btn btn-danger" @click="downloadQr">
                <i class="bi bi-download me-1"></i>
                Tải QR
              </button>

              <button class="btn btn-outline-secondary" @click="printCard">
                <i class="bi bi-printer me-1"></i>
                In thẻ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="col-lg-8">
        <div class="row g-4">
          <!-- LIVE STATUS -->
          <div class="col-12">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4">
                <div class="d-flex align-items-start gap-3">
                  <div class="live-icon" :class="currentStatusInfo.iconClass">
                    <i :class="currentStatusInfo.icon"></i>
                  </div>

                  <div>
                    <h5 class="fw-bold mb-1">
                      {{ currentStatusInfo.title }}
                    </h5>

                    <p class="text-muted mb-0">
                      {{ currentStatusInfo.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- QUEUE / CURRENT STATE -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">Tình trạng hiện tại</h5>

                <div
                  v-if="
                    appointment.status === 'APPROVED' ||
                    appointment.status === 'BOOKED'
                  "
                >
                  <div class="alert alert-success rounded-4 small mb-0">
                    Lịch hẹn đã được xác nhận. Vui lòng đến đúng khung giờ và
                    trình QR để check-in.
                  </div>
                </div>

                <div v-else-if="appointment.status === 'CHECKED_IN'">
                  <div class="queue-card text-center mb-3">
                    <div class="small text-muted">Bạn đã check-in</div>
                    <div class="queue-number text-danger">
                      <i class="bi bi-check2-circle"></i>
                    </div>
                    <div class="small text-muted">
                      Vui lòng chờ bác sĩ gọi vào khu vực sàng lọc.
                    </div>
                  </div>
                </div>

                <div v-else-if="appointment.status === 'SCREENING'">
                  <div class="active-process-box">
                    <div class="fw-bold text-info mb-1">
                      <i class="bi bi-heart-pulse me-1"></i>
                      Đang khám sàng lọc
                    </div>
                    <div class="small text-muted">
                      Bác sĩ đang kiểm tra huyết áp, nhịp tim, hemoglobin và
                      điều kiện hiến máu.
                    </div>
                  </div>
                </div>

                <div v-else-if="appointment.status === 'DONATING'">
                  <div class="active-process-box">
                    <div class="fw-bold text-danger mb-1">
                      <i class="bi bi-droplet-fill me-1"></i>
                      Đang hiến máu
                    </div>
                    <div class="small text-muted">
                      Hãy thư giãn, giữ tay ổn định và báo nhân viên nếu thấy
                      mệt.
                    </div>
                  </div>
                </div>

                <div v-else-if="appointment.status === 'COMPLETED'">
                  <div class="alert alert-primary rounded-4 mb-0">
                    <i class="bi bi-stars me-1"></i>
                    Cảm ơn bạn đã hoàn tất buổi hiến máu.
                  </div>
                </div>

                <div v-else-if="appointment.status === 'FAILED_SCREENING'">
                  <div class="alert alert-danger rounded-4 mb-0">
                    Bạn chưa đủ điều kiện hiến máu trong lần này.
                  </div>
                </div>

                <div v-else-if="appointment.status === 'NO_SHOW'">
                  <div class="alert alert-secondary rounded-4 mb-0">
                    Lịch hẹn đã được ghi nhận là vắng mặt.
                  </div>
                </div>

                <div v-else>
                  <div class="text-muted small">
                    Trạng thái đang được cập nhật.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- HEALTH NOTE -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">
                  <i class="bi bi-heart-pulse-fill text-success me-2"></i>
                  Hướng dẫn cho bạn
                </h5>

                <p class="small text-muted mb-3">
                  {{ healthAdvice }}
                </p>

                <ul class="small text-muted mb-0 ps-3">
                  <li v-for="(item, index) in healthTips" :key="index">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- STEP TRACKER -->
          <div class="col-12">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">Tiến trình hiến máu</h5>

                <div class="small text-muted mb-4">
                  Hệ thống sẽ tự cập nhật khi bác sĩ xử lý từng bước.
                </div>

                <div class="queue-steps">
                  <template v-for="(step, index) in steps" :key="step.key">
                    <div class="queue-step" :class="stepClass(step.key)">
                      <div class="step-icon">
                        <i :class="step.icon"></i>
                      </div>
                      <div class="step-title">{{ step.title }}</div>
                      <div class="step-sub">{{ stepSubText(step.key) }}</div>
                    </div>

                    <div
                      v-if="index < steps.length - 1"
                      class="queue-line"
                      :class="lineClass(step.key)"
                    ></div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- TIMELINE -->
          <div class="col-12">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">Dòng thời gian</h5>

                <div class="timeline">
                  <div
                    v-for="item in timelineItems"
                    :key="item.key"
                    class="timeline-item"
                  >
                    <div
                      class="timeline-dot"
                      :class="{ active: item.value }"
                    ></div>
                    <div>
                      <div class="fw-semibold">{{ item.label }}</div>
                      <div class="small text-muted">
                        {{
                          item.value
                            ? formatDateTime(item.value)
                            : "Chưa có dữ liệu"
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-danger rounded-4">
      Không tìm thấy lịch hẹn.
    </div>
  </div>
</template>

<script>
import QRCode from "qrcode";
import socket from "../../../core/socket";
import baseRequestClient from "../../../core/baseRequestClient";

export default {
  name: "AppointmentDetailRealtimePage",

  data() {
    return {
      loading: false,
      qrCodeDataUrl: "",
      appointment: null,
      realtimeMessage: "",
      socketJoined: false,

      steps: [
  {
    key: "REQUESTED",
    title: "Chờ duyệt",
    icon: "bi bi-hourglass-split",
  },
  {
    key: "APPROVED",
    title: "Xác nhận lịch",
    icon: "bi bi-calendar-check",
  },
  {
    key: "CHECKED_IN",
    title: "Check-in",
    icon: "bi bi-qr-code-scan",
  },
  {
    key: "SCREENING",
    title: "Sàng lọc",
    icon: "bi bi-heart-pulse",
  },
  {
    key: "DONATING",
    title: "Hiến máu",
    icon: "bi bi-droplet-fill",
  },
  {
    key: "COMPLETED",
    title: "Hoàn tất",
    icon: "bi bi-stars",
  },
],
    };
  },

  computed: {
    appointmentId() {
      return (
        this.$route.params.id ||
        this.$route.params.appointment_id ||
        this.$route.query.appointment_id ||
        this.$route.query.id
      );
    },

    canShowQr() {
      return ["APPROVED", "BOOKED", "CHECKED_IN"].includes(
        this.appointment?.status
      );
    },

    timeSlotLabel() {
      if (!this.appointment?.scheduled_at) return "Không có dữ liệu";

      const hour = new Date(this.appointment.scheduled_at).getHours();

      if (hour < 12) return "Ca sáng";
      return "Ca chiều";
    },

    currentStatusInfo() {
      const status = this.appointment?.status;

      const map = {
        REQUESTED: {
          title: "Lịch hẹn đang chờ duyệt",
          description: "Hệ thống đang chờ bệnh viện xác nhận lịch hẹn của bạn.",
          icon: "bi bi-hourglass-split",
          iconClass: "bg-warning text-dark",
        },
        APPROVED: {
          title: "Lịch hẹn đã được xác nhận",
          description:
            "Vui lòng đến đúng khung giờ và trình QR cho nhân viên y tế.",
          icon: "bi bi-calendar-check",
          iconClass: "bg-success text-white",
        },
        BOOKED: {
          title: "Lịch hẹn đã được đặt",
          description: "Vui lòng đến điểm hiến máu đúng thời gian đã đăng ký.",
          icon: "bi bi-calendar2-check",
          iconClass: "bg-success text-white",
        },
        CHECKED_IN: {
          title: "Bạn đã check-in thành công",
          description:
            "Vui lòng ngồi chờ tại khu vực hướng dẫn để được gọi vào sàng lọc.",
          icon: "bi bi-qr-code-scan",
          iconClass: "bg-primary text-white",
        },
        SCREENING: {
          title: "Đang khám sàng lọc",
          description:
            "Bác sĩ đang kiểm tra điều kiện sức khỏe trước khi hiến máu.",
          icon: "bi bi-heart-pulse",
          iconClass: "bg-info text-white",
        },
        DONATING: {
          title: "Đang hiến máu",
          description:
            "Bạn đang trong quá trình hiến máu. Hãy giữ tinh thần thoải mái.",
          icon: "bi bi-droplet-fill",
          iconClass: "bg-danger text-white",
        },
        COMPLETED: {
          title: "Hoàn tất hiến máu",
          description:
            "Cảm ơn bạn đã tham gia hiến máu và lan tỏa giá trị tốt đẹp.",
          icon: "bi bi-stars",
          iconClass: "bg-dark text-white",
        },
        FAILED_SCREENING: {
          title: "Chưa đủ điều kiện hiến máu",
          description:
            "Bác sĩ đã ghi nhận bạn chưa phù hợp để hiến máu trong lần này.",
          icon: "bi bi-exclamation-triangle",
          iconClass: "bg-danger text-white",
        },
        NO_SHOW: {
          title: "Lịch hẹn vắng mặt",
          description:
            "Bạn chưa check-in trong khung giờ quy định của lịch hẹn.",
          icon: "bi bi-calendar-x",
          iconClass: "bg-secondary text-white",
        },
        CANCELLED: {
          title: "Lịch hẹn đã hủy",
          description: "Lịch hẹn này đã được hủy.",
          icon: "bi bi-x-circle",
          iconClass: "bg-secondary text-white",
        },
        REJECTED: {
          title: "Lịch hẹn bị từ chối",
          description: "Lịch hẹn này chưa được bệnh viện chấp nhận.",
          icon: "bi bi-x-octagon",
          iconClass: "bg-danger text-white",
        },
      };

      return (
        map[status] || {
          title: "Đang cập nhật trạng thái",
          description: "Hệ thống đang cập nhật thông tin mới nhất.",
          icon: "bi bi-info-circle",
          iconClass: "bg-secondary text-white",
        }
      );
    },

    healthAdvice() {
      const status = this.appointment?.status;

      const map = {
        APPROVED:
          "Trước khi đến hiến máu, bạn nên ăn nhẹ, uống đủ nước và mang theo giấy tờ tùy thân.",
        BOOKED:
          "Hãy đến đúng khung giờ đã đăng ký để quá trình check-in diễn ra thuận lợi.",
        CHECKED_IN:
          "Bạn đã check-in. Hãy ngồi chờ, uống nước và giữ tinh thần thoải mái.",
        SCREENING:
          "Bác sĩ đang kiểm tra sức khỏe. Hãy trả lời trung thực các câu hỏi sàng lọc.",
        DONATING:
          "Trong lúc hiến máu, hãy thư giãn, tránh cử động mạnh và báo nhân viên nếu thấy mệt.",
        COMPLETED:
          "Sau khi hiến máu, hãy nghỉ ngơi, uống nước và tránh vận động mạnh trong ngày.",
        FAILED_SCREENING:
          "Bạn chưa đủ điều kiện hiến máu lần này. Hãy nghỉ ngơi và theo dõi sức khỏe.",
        NO_SHOW:
          "Lịch hẹn đã quá thời gian check-in. Bạn có thể đặt lịch mới nếu vẫn muốn hiến máu.",
      };

      return map[status] || "Vui lòng theo dõi hướng dẫn từ nhân viên y tế.";
    },

    healthTips() {
      const status = this.appointment?.status;

      if (status === "COMPLETED") {
        return [
          "Nghỉ ngơi tại chỗ ít nhất 10–15 phút.",
          "Uống đủ nước trong 24 giờ tiếp theo.",
          "Tránh vận động mạnh hoặc nâng vật nặng trong ngày.",
        ];
      }

      if (status === "DONATING") {
        return [
          "Giữ tay ổn định.",
          "Báo ngay với nhân viên nếu chóng mặt hoặc khó chịu.",
          "Thở đều và giữ tâm lý thoải mái.",
        ];
      }

      return [
        "Uống đủ nước.",
        "Không để bụng quá đói trước khi hiến máu.",
        "Báo với nhân viên nếu cần hỗ trợ.",
      ];
    },

    timelineItems() {
      return [
        {
          key: "checked_in_at",
          label: "Check-in",
          value: this.appointment?.checked_in_at,
        },
        {
          key: "screening_started_at",
          label: "Bắt đầu sàng lọc",
          value: this.appointment?.screening_started_at,
        },
        {
          key: "donation_started_at",
          label: "Bắt đầu hiến máu",
          value: this.appointment?.donation_started_at,
        },
        {
          key: "completed_at",
          label: "Hoàn tất hiến máu",
          value: this.appointment?.completed_at,
        },
      ];
    },
  },

  async mounted() {
    await this.loadAppointmentDetail();
    this.setupSocket();
  },

  beforeUnmount() {
    this.disconnectSocket();
  },

  methods: {
    async loadAppointmentDetail() {
      this.loading = true;

      try {
        const id = this.appointmentId;

        if (!id) {
          this.appointment = null;
          return;
        }

        // ĐỔI ENDPOINT NÀY CHO ĐÚNG API DETAIL CỦA PROJECT BẠN NẾU KHÁC
        const res = await baseRequestClient.get(
          "/donor/appointment-process/detail",
          {
            params: {
              appointment_id: id,
            },
          }
        );

        if (res.data.status) {
          this.appointment = res.data.data;
          await this.generateQr();
        }
      } catch (error) {
        console.error("loadAppointmentDetail error:", error);
      } finally {
        this.loading = false;
      }
    },

    setupSocket() {
      if (!this.appointmentId || this.socketJoined) return;

      socket.connect();

      socket.emit("join_appointment", this.appointmentId);

      socket.on("appointment_updated", this.handleAppointmentUpdated);

      this.socketJoined = true;
    },

    disconnectSocket() {
      if (this.appointmentId) {
        socket.emit("leave_appointment", this.appointmentId);
      }

      socket.off("appointment_updated", this.handleAppointmentUpdated);

      this.socketJoined = false;
    },

    async handleAppointmentUpdated(payload) {
      if (String(payload.appointment_id) !== String(this.appointmentId)) {
        return;
      }

      this.realtimeMessage =
        payload.message || "Trạng thái lịch hẹn đã được cập nhật.";

      if (this.appointment) {
        this.appointment.status = payload.status || this.appointment.status;
      }

      await this.loadAppointmentDetail();

      setTimeout(() => {
        this.realtimeMessage = "";
      }, 6000);
    },

    async generateQr() {
      try {
        if (!this.appointment?.appointment_code) return;

        this.qrCodeDataUrl = await QRCode.toDataURL(
          this.appointment.appointment_code,
          {
            width: 220,
            margin: 2,
          }
        );
      } catch (error) {
        console.error("generateQr error:", error);
      }
    },

    statusIndex(status) {
  const map = {
    REQUESTED: 0,
    APPROVED: 1,
    BOOKED: 1,
    CHECKED_IN: 2,
    SCREENING: 3,
    DONATING: 4,
    COMPLETED: 5,
  };

  return map[status] ?? -1;
},

    stepClass(stepKey) {
      const currentIndex = this.statusIndex(this.appointment?.status);
      const stepIndex = this.statusIndex(stepKey);

      if (
        ["FAILED_SCREENING", "NO_SHOW", "CANCELLED", "REJECTED"].includes(
          this.appointment?.status
        )
      ) {
        return "";
      }

      if (stepIndex < currentIndex) return "done";
      if (stepIndex === currentIndex) return "active";
      return "";
    },

    lineClass(stepKey) {
      const currentIndex = this.statusIndex(this.appointment?.status);
      const stepIndex = this.statusIndex(stepKey);

      if (stepIndex < currentIndex) return "active";
      return "";
    },

    stepSubText(stepKey) {
      const currentIndex = this.statusIndex(this.appointment?.status);
      const stepIndex = this.statusIndex(stepKey);

      if (stepIndex < currentIndex) return "Hoàn thành";
      if (stepIndex === currentIndex) return "Đang xử lý";
      return "Chờ đến lượt";
    },

    formatDateTime(value) {
      if (!value) return "Không có dữ liệu";

      return new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },

    statusLabel(status) {
      const map = {
        REQUESTED: "Chờ duyệt",
        APPROVED: "Đã duyệt",
        BOOKED: "Đã đặt",
        CHECKED_IN: "Đã check-in",
        SCREENING: "Đang sàng lọc",
        DONATING: "Đang hiến máu",
        COMPLETED: "Hoàn thành",
        FAILED_SCREENING: "Không đạt sàng lọc",
        NO_SHOW: "Vắng mặt",
        CANCELLED: "Đã hủy",
        REJECTED: "Từ chối",
      };

      return map[status] || status;
    },

    statusBadgeClass(status) {
      const map = {
        REQUESTED: "bg-warning text-dark",
        APPROVED: "bg-success",
        BOOKED: "bg-info text-dark",
        CHECKED_IN: "bg-primary",
        SCREENING: "bg-info",
        DONATING: "bg-danger",
        COMPLETED: "bg-dark",
        FAILED_SCREENING: "bg-danger",
        NO_SHOW: "bg-secondary",
        CANCELLED: "bg-secondary",
        REJECTED: "bg-danger",
      };

      return map[status] || "bg-light text-dark border";
    },

    downloadQr() {
      if (!this.qrCodeDataUrl) return;

      const link = document.createElement("a");
      link.href = this.qrCodeDataUrl;
      link.download = `${this.appointment.appointment_code}.png`;
      link.click();
    },

    printCard() {
      window.print();
    },
  },
};
</script>

<style scoped>
.detail-row {
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f1f1;
}

.qr-box {
  border: 1px solid #ececec;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
}

.qr-image {
  width: 220px;
  height: 220px;
  object-fit: contain;
}

.live-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.queue-card {
  border-radius: 18px;
  background: #fff5f5;
  padding: 20px;
}

.queue-number {
  font-size: 64px;
  line-height: 1;
  font-weight: 800;
}

.active-process-box {
  border-radius: 18px;
  background: #f8f9fa;
  padding: 20px;
  border: 1px solid #edf0f2;
}

.queue-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.queue-step {
  flex: 1;
  min-width: 130px;
  text-align: center;
}

.step-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-size: 20px;
}

.queue-step.done .step-icon {
  background: #16a34a;
  color: #fff;
}

.queue-step.active .step-icon {
  background: #dc3545;
  color: #fff;
}

.step-title {
  font-weight: 700;
  font-size: 14px;
}

.step-sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.queue-line {
  flex: 0.7;
  height: 3px;
  background: #d1d5db;
  border-radius: 999px;
}

.queue-line.active {
  background: #16a34a;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.timeline-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #d1d5db;
  margin-top: 4px;
}

.timeline-dot.active {
  background: #dc3545;
}

@media (max-width: 992px) {
  .queue-steps {
    flex-direction: column;
    align-items: stretch;
  }

  .queue-line {
    width: 3px;
    height: 24px;
    margin: 0 auto;
  }
}

@media print {
  .btn {
    display: none !important;
  }
}
</style>