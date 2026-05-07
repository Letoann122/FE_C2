<template>
  <div class="container py-5 appointment-detail-page">
    <div class="mb-4 border-bottom pb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h3 class="fw-bold text-danger mb-1">
          <i class="bi bi-calendar-event me-2"></i>Chi tiết lịch hẹn
        </h3>
        <p class="text-muted mb-0">
          Theo dõi trạng thái lịch hẹn, thẻ check-in và hàng đợi của bạn.
        </p>
      </div>

      <button class="btn btn-outline-secondary" @click="$router.push('/my-appointments')">
        <i class="bi bi-arrow-left me-1"></i>Quay lại danh sách
      </button>
    </div>

    <div class="row g-4">
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
              <div class="small text-muted">Ngày hẹn</div>
              <div class="fw-semibold">{{ formatDate(appointment.scheduled_at) }}</div>
            </div>

            <div class="detail-row">
              <div class="small text-muted">Khung giờ</div>
              <div class="fw-semibold">{{ appointment.time_slot }}</div>
            </div>

            <div class="detail-row">
              <div class="small text-muted">Địa điểm</div>
              <div class="fw-semibold">{{ appointment.site_name }}</div>
              <div class="small text-muted">{{ appointment.address }}</div>
            </div>

            <div class="detail-row">
              <div class="small text-muted">Loại</div>
              <div class="fw-semibold">
                {{ appointment.type === "campaign" ? "Chiến dịch" : "Điểm hiến cố định" }}
              </div>
            </div>

            <div class="detail-row border-0 mb-0 pb-0">
              <div class="small text-muted">Trạng thái</div>
              <div>
                <span class="badge" :class="statusBadgeClass(appointment.status)">
                  {{ statusLabel(appointment.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="card border-0 shadow-sm rounded-4 mt-3">
          <div class="card-body p-4">
            <h6 class="fw-bold mb-3">Hành động nhanh</h6>

            <div class="d-grid gap-2">
              <button class="btn btn-danger" @click="downloadQr">
                <i class="bi bi-download me-1"></i>Tải QR Check-in
              </button>
              <button class="btn btn-outline-secondary" @click="printCard">
                <i class="bi bi-printer me-1"></i>In thẻ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="col-lg-8">
        <div class="row g-4">
          <!-- QR CHECKIN -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">QR Check-in</h5>
                <p class="small text-muted mb-3">
                  Trình mã này cho nhân viên y tế khi đến điểm hiến máu.
                </p>

                <div class="qr-box">
                  <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="QR" class="qr-image" />
                </div>

                <div class="text-center mt-3">
                  <div class="small text-muted">Mã check-in</div>
                  <div class="fw-bold fs-5">{{ appointment.appointment_code }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- QUEUE SUMMARY -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">Tình trạng hàng đợi</h5>

                <div v-if="!canShowQueue" class="text-muted small">
                  Hàng đợi sẽ hiển thị khi bạn đã check-in tại điểm hiến máu.
                </div>

                <div v-else>
                  <div class="queue-card text-center mb-3">
                    <div class="small text-muted">Số của bạn</div>
                    <div class="queue-number text-danger">{{ queue.my_number }}</div>
                    <div class="small text-muted">Vui lòng chờ đến lượt</div>
                  </div>

                  <div class="row g-2">
                    <div class="col-6">
                      <div class="mini-box text-center">
                        <div class="small text-muted">Đang gọi số</div>
                        <div class="fw-bold text-success fs-2">{{ queue.current_number }}</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="mini-box text-center">
                        <div class="small text-muted">Chờ dự kiến</div>
                        <div class="fw-bold text-primary fs-2">{{ queue.estimated_wait }}</div>
                        <div class="small text-muted">phút</div>
                      </div>
                    </div>
                  </div>

                  <div class="alert alert-primary mt-3 mb-0 small">
                    <i class="bi bi-info-circle-fill me-1"></i>
                    Thời gian chờ chỉ mang tính chất tham khảo và có thể thay đổi theo tình hình thực tế.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP TRACKER -->
          <div class="col-12">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">Bảng theo dõi hàng đợi</h5>
                <div class="small text-muted mb-4">
                  {{ appointment.site_name }} - Theo dõi trạng thái hiến máu theo thời gian thực
                </div>

                <div class="queue-steps">
                  <div class="queue-step done">
                    <div class="step-icon"><i class="bi bi-check-lg"></i></div>
                    <div class="step-title">Đăng ký</div>
                    <div class="step-sub">Hoàn thành</div>
                  </div>

                  <div class="queue-line active"></div>

                  <div class="queue-step active">
                    <div class="step-icon"><i class="bi bi-heart-pulse"></i></div>
                    <div class="step-title">Sàng lọc y tế</div>
                    <div class="step-sub">Đang chờ</div>
                  </div>

                  <div class="queue-line"></div>

                  <div class="queue-step">
                    <div class="step-icon"><i class="bi bi-droplet-fill"></i></div>
                    <div class="step-title">Hiến máu</div>
                    <div class="step-sub">Chờ đến lượt</div>
                  </div>

                  <div class="queue-line"></div>

                  <div class="queue-step">
                    <div class="step-icon"><i class="bi bi-cup-hot-fill"></i></div>
                    <div class="step-title">Phục hồi</div>
                    <div class="step-sub">Chờ đến lượt</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- HEALTH NOTE -->
          <div class="col-12">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4">
                <h6 class="fw-bold mb-3">
                  <i class="bi bi-heart-pulse-fill text-success me-2"></i>Lời khuyên sức khỏe
                </h6>

                <div class="small text-muted">
                  Chào <strong>{{ appointment.full_name }}</strong>, bạn vui lòng ngồi chờ tại khu vực sảnh A.
                  Hãy uống một chút nước trà đường đã được chuẩn bị sẵn nhé!
                </div>

                <ul class="small text-muted mt-3 mb-0 ps-3">
                  <li>Uống đủ nước để duy trì hydration</li>
                  <li>Thư giãn và tránh căng thẳng</li>
                  <li>Báo với nhân viên nếu cần hỗ trợ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <!-- /row -->
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from "qrcode";

export default {
  name: "AppointmentDetailHubPage",

  data() {
    return {
      qrCodeDataUrl: "",
      appointment: {
        id: 1,
        appointment_code: "SBDS-8842",
        full_name: "Minh Thanh",
        scheduled_at: "2026-04-15T08:30:00",
        time_slot: "08:30 - 11:30",
        site_name: "Bệnh viện Đà Nẵng",
        address: "124 Hải Phòng, Đà Nẵng",
        type: "site",
        status: "CHECKED_IN",
      },
      queue: {
        my_number: "042",
        current_number: "038",
        estimated_wait: 10,
      },
    };
  },

  computed: {
    canShowQueue() {
      return ["CHECKED_IN", "BOOKED", "COMPLETED"].includes(this.appointment.status);
    },
  },

  mounted() {
    this.generateQr();
  },

  methods: {
    async generateQr() {
      try {
        this.qrCodeDataUrl = await QRCode.toDataURL(this.appointment.appointment_code, {
          width: 220,
          margin: 2,
        });
      } catch (error) {
        console.error("generateQr error:", error);
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN");
    },

    statusLabel(status) {
      if (status === "REQUESTED") return "Chờ duyệt";
      if (status === "APPROVED") return "Đã duyệt";
      if (status === "BOOKED") return "Đã đặt";
      if (status === "CHECKED_IN") return "Đã check-in";
      if (status === "COMPLETED") return "Hoàn thành";
      if (status === "CANCELLED") return "Đã hủy";
      if (status === "REJECTED") return "Từ chối";
      return status;
    },

    statusBadgeClass(status) {
      if (status === "REQUESTED") return "bg-warning text-dark";
      if (status === "APPROVED") return "bg-success";
      if (status === "BOOKED") return "bg-info text-dark";
      if (status === "CHECKED_IN") return "bg-primary";
      if (status === "COMPLETED") return "bg-dark";
      if (status === "CANCELLED") return "bg-secondary";
      if (status === "REJECTED") return "bg-danger";
      return "bg-light text-dark border";
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

.queue-card {
  border-radius: 18px;
  background: #fff5f5;
  padding: 20px;
}

.queue-number {
  font-size: 72px;
  line-height: 1;
  font-weight: 800;
}

.mini-box {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 18px 12px;
  height: 100%;
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