<template>
  <div class="container py-4 checkin-page">
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
      <div>
        <h3 class="fw-bold mb-1">Mã QR Check-in</h3>
        <p class="text-muted mb-0">
          Xuất trình mã QR này cho nhân viên y tế khi đến điểm hiến máu.
        </p>
      </div>

      <router-link to="/my-appointments" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i>Quay lại lịch hẹn
      </router-link>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-danger"></div>
      <div class="small text-muted mt-2">Đang tải thẻ check-in...</div>
    </div>

    <div v-else-if="!appointment" class="alert alert-warning rounded-4">
      Không tìm thấy lịch hẹn này hoặc lịch hẹn không thuộc tài khoản của bạn.
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3">Thông tin lịch hẹn</h5>

            <div class="info-list">
              <div class="info-row">
                <div class="info-icon bg-danger-subtle text-danger">
                  <i class="bi bi-ticket-perforated-fill"></i>
                </div>
                <div>
                  <div class="small text-muted">Mã lịch hẹn</div>
                  <div class="fw-semibold">{{ card.appointment_code }}</div>
                </div>
              </div>

              <div class="info-row">
                <div class="info-icon bg-danger-subtle text-danger">
                  <i class="bi bi-person-fill"></i>
                </div>
                <div>
                  <div class="small text-muted">Người hiến</div>
                  <div class="fw-semibold">{{ card.full_name }}</div>
                </div>
              </div>

              <div class="info-row">
                <div class="info-icon bg-danger-subtle text-danger">
                  <i class="bi bi-droplet-fill"></i>
                </div>
                <div>
                  <div class="small text-muted">Nhóm máu</div>
                  <div class="fw-semibold">{{ card.blood_group }}</div>
                </div>
              </div>

              <div class="info-row">
                <div class="info-icon bg-danger-subtle text-danger">
                  <i class="bi bi-clock-fill"></i>
                </div>
                <div>
                  <div class="small text-muted">Thời gian</div>
                  <div class="fw-semibold">{{ card.time_slot }}</div>
                  <div class="small text-muted">{{ formatDate(card.date) }}</div>
                </div>
              </div>

              <div class="info-row">
                <div class="info-icon bg-danger-subtle text-danger">
                  <i class="bi bi-geo-alt-fill"></i>
                </div>
                <div>
                  <div class="small text-muted">Địa điểm</div>
                  <div class="fw-semibold">{{ card.site_name }}</div>
                  <div class="small text-muted">{{ card.address }}</div>
                </div>
              </div>

              <div class="info-row">
                <div class="info-icon bg-danger-subtle text-danger">
                  <i class="bi bi-activity"></i>
                </div>
                <div>
                  <div class="small text-muted">Trạng thái</div>
                  <span class="badge" :class="statusBadgeClass(card.status)">
                    {{ statusLabel(card.status) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 mt-4 flex-wrap">
              <button
                class="btn btn-danger flex-fill"
                :disabled="!qrCodeDataUrl || !canUseQr"
                @click="downloadQrImage"
              >
                <i class="bi bi-download me-1"></i>Tải mã QR
              </button>

              <button
                class="btn btn-outline-secondary flex-fill"
                :disabled="!qrCodeDataUrl || !canUseQr"
                @click="printCard"
              >
                <i class="bi bi-printer me-1"></i>In thẻ
              </button>
            </div>

            <div class="alert alert-primary mt-4 mb-0 small rounded-4">
              <i class="bi bi-info-circle-fill me-1"></i>
              <strong>Lưu ý:</strong> Vui lòng mang theo giấy tờ tùy thân và đến đúng giờ hẹn.
              Mã QR chỉ dùng để nhân viên bệnh viện check-in cho bạn.
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 qr-card-wrapper">
          <div class="card-body p-4">
            <div class="text-center mb-3">
              <div class="brand-dot mb-2"></div>
              <div class="small text-danger fw-bold">SBDS</div>
              <h5 class="fw-bold mb-1">Thẻ Check-in</h5>
              <div class="small text-muted">Hiến máu nhân đạo</div>
            </div>

            <div class="divider-line"></div>

            <div v-if="canUseQr" class="qr-box">
              <img
                v-if="qrCodeDataUrl"
                :src="qrCodeDataUrl"
                alt="QR Check-in"
                class="qr-image"
              />
            </div>

            <div v-else class="alert alert-warning rounded-4 mb-0">
              <div class="fw-bold mb-1">Chưa thể sử dụng mã QR</div>
              <div class="small">
                Mã QR chỉ hiển thị khi lịch hẹn đã được duyệt hoặc đã đặt.
              </div>
            </div>

            <div class="text-center mt-3">
              <div class="small text-muted">Mã cuộc hẹn</div>
              <div class="fw-bold qr-code-text">{{ card.appointment_code }}</div>
            </div>

            <div class="detail-table mt-4">
              <div class="detail-item">
                <div class="small text-muted">Người hiến</div>
                <div class="fw-semibold">{{ card.full_name }}</div>
              </div>

              <div class="detail-item">
                <div class="small text-muted">Ngày hẹn</div>
                <div class="fw-semibold">{{ formatDate(card.date) }}</div>
              </div>

              <div class="detail-item">
                <div class="small text-muted">Giờ</div>
                <div class="fw-semibold">{{ card.time_slot }}</div>
              </div>

              <div class="detail-item">
                <div class="small text-muted">Điểm hiến</div>
                <div class="fw-semibold">{{ card.site_name }}</div>
              </div>
            </div>

            <div class="small text-center text-muted mt-4">
              Vui lòng trình thẻ này tại bàn check-in hiến máu
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from "qrcode";
import baseRequestClient from "../../../core/baseRequestClient";

import {
  getAppointmentStatusLabel,
  getAppointmentStatusBadge,
} from "../../../utils/appointmentStatus";

export default {
  name: "QRCodeCheckinPage",

  data() {
    return {
      isLoading: false,
      appointment: null,
      qrCodeDataUrl: "",
    };
  },

  computed: {
    appointmentId() {
      return this.$route.params.appointmentId;
    },

    canUseQr() {
      return ["APPROVED", "BOOKED", "CHECKED_IN"].includes(this.card.status);
    },

    card() {
      if (!this.appointment) {
        return {
          appointment_code: "",
          full_name: "",
          blood_group: "Chưa xác định",
          time_slot: "",
          date: "",
          site_name: "",
          address: "",
          status: "",
        };
      }

      const donor =
        this.appointment.donor ||
        this.appointment.user ||
        this.appointment.User ||
        {};

      return {
        appointment_code:
          this.appointment.appointment_code || `#${this.appointment.id}`,

        full_name:
          donor.full_name ||
          this.appointment.donor_name ||
          this.appointment.full_name ||
          "Người hiến máu",

        blood_group:
          donor.blood_group ||
          this.appointment.blood_group ||
          "Chưa xác định",

        time_slot:
          this.appointment.time_slot ||
          this.appointment.slot?.time_slot ||
          this.getTimeRangeFromSlot(this.appointment.slot) ||
          "Chưa có khung giờ",

        date: this.appointment.scheduled_at,

        site_name:
          this.appointment.donation_site?.name ||
          this.appointment.campaign?.title ||
          this.appointment.campaign?.name ||
          this.appointment.campaign?.location ||
          "Chưa có địa điểm",

        address:
          this.appointment.donation_site?.address ||
          this.appointment.campaign?.location ||
          "Chưa có địa chỉ",

        status: this.appointment.status,
      };
    },
  },

  async mounted() {
    await this.getAppointment();
  },

  methods: {
    async getAppointment() {
      this.isLoading = true;

      try {
        const res = await baseRequestClient.get("/donor/donation-appointments");
        const appointments = res.data?.data || [];

        this.appointment = appointments.find(
          (item) => String(item.id) === String(this.appointmentId)
        );

        if (this.appointment && this.canUseQr) {
          await this.generateQr();
        }
      } catch (error) {
        console.error("getAppointment error:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async generateQr() {
      try {
        const payload = {
          type: "DONOR_CHECKIN",
          appointment_id: this.appointment.id,
          appointment_code: this.appointment.appointment_code,
          donor_id: this.appointment.donor_id,
          appointment_slot_id: this.appointment.appointment_slot_id,
          issued_at: new Date().toISOString(),
        };

        this.qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
          width: 260,
          margin: 2,
          errorCorrectionLevel: "M",
        });
      } catch (error) {
        console.error("generateQr error:", error);
      }
    },

    getTimeRangeFromSlot(slot) {
      if (!slot?.start_time || !slot?.end_time) return "";

      const start = String(slot.start_time).slice(0, 5);
      const end = String(slot.end_time).slice(0, 5);

      return `${start} - ${end}`;
    },

    formatDate(date) {
      if (!date) return "Chưa có ngày";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    downloadQrImage() {
      if (!this.qrCodeDataUrl) return;

      const link = document.createElement("a");
      link.href = this.qrCodeDataUrl;
      link.download = `${this.card.appointment_code || "qr-checkin"}.png`;
      link.click();
    },

    printCard() {
      window.print();
    },

    statusLabel(status) {
      return getAppointmentStatusLabel(status);
    },

    statusBadgeClass(status) {
      return getAppointmentStatusBadge(status);
    },
  },
};
</script>

<style scoped>
.info-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qr-card-wrapper {
  max-width: 430px;
  margin: 0 auto;
}

.brand-dot {
  width: 42px;
  height: 12px;
  border-radius: 999px;
  background: #dc3545;
  margin: 0 auto;
}

.divider-line {
  width: 100%;
  height: 1px;
  background: #ececec;
  margin: 16px 0 20px;
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
  width: 230px;
  height: 230px;
  object-fit: contain;
}

.qr-code-text {
  letter-spacing: 1px;
  font-size: 20px;
}

.detail-table {
  border-top: 1px solid #ececec;
  padding-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.detail-item {
  min-width: 0;
}

@media print {
  .btn,
  .alert,
  .container > .d-flex {
    display: none !important;
  }

  .qr-card-wrapper {
    max-width: 100%;
  }
}
</style>