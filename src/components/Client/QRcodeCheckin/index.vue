<template>
  <div class="container py-4 checkin-page">
    <div class="mb-3">
      <h3 class="fw-bold mb-1">Thẻ Check-in Điện tử</h3>
      <p class="text-muted mb-0">
        Vui lòng in thẻ này hoặc lưu hình ảnh mã QR vào điện thoại để nhân viên y tế quét khi bạn đến điểm hiến máu.
      </p>
    </div>

    <div class="row g-4">
      <!-- LEFT MENU MOCK -->
      <div class="col-lg-2">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-body p-2">
            <div class="menu-item">
              <i class="bi bi-house-door me-2"></i>Tổng quan
            </div>
            <div class="menu-item">
              <i class="bi bi-calendar-check me-2"></i>Lịch hẹn của tôi
            </div>
            <div class="menu-item active">
              <i class="bi bi-qr-code-scan me-2"></i>Thẻ Check-in
            </div>
            <div class="menu-item">
              <i class="bi bi-clock-history me-2"></i>Lịch sử
            </div>
            <div class="menu-item">
              <i class="bi bi-person-circle me-2"></i>Hồ sơ cá nhân
            </div>
            <div class="menu-item">
              <i class="bi bi-gear me-2"></i>Cài đặt
            </div>
            <div class="menu-item text-danger">
              <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN -->
      <div class="col-lg-10">
        <div class="row g-4">
          <!-- LEFT CONTENT -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm rounded-4 h-100">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3">Thông tin chi tiết</h5>

                <div class="info-list">
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
                </div>

                <div class="d-flex gap-2 mt-4 flex-wrap">
                  <button class="btn btn-danger flex-fill" @click="downloadQrImage">
                    <i class="bi bi-download me-1"></i>Tải hình ảnh
                  </button>
                  <button class="btn btn-outline-secondary flex-fill" @click="printCard">
                    <i class="bi bi-printer me-1"></i>In thẻ
                  </button>
                </div>

                <div class="alert alert-primary mt-4 mb-0 small rounded-4">
                  <i class="bi bi-info-circle-fill me-1"></i>
                  <strong>Lưu ý:</strong> Vui lòng mang theo giấy tờ tùy thân và đến đúng giờ hẹn.
                  Nếu cần đổi lịch, vui lòng liên hệ hotline: 1900-xxxx.
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT CARD -->
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

                <div class="qr-box">
                  <img
                    v-if="qrCodeDataUrl"
                    :src="qrCodeDataUrl"
                    alt="QR Check-in"
                    class="qr-image"
                  />
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

          <!-- BENEFITS -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm rounded-4 benefit-card h-100">
              <div class="card-body p-4">
                <div class="benefit-icon bg-success-subtle text-success">
                  <i class="bi bi-shield-check"></i>
                </div>
                <div class="fw-bold mt-3 mb-2">An toàn tuyệt đối</div>
                <div class="small text-muted">
                  Quy trình hiến máu được thực hiện bởi đội ngũ y bác sĩ chuyên nghiệp với thiết bị vô trùng.
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card border-0 shadow-sm rounded-4 benefit-card h-100">
              <div class="card-body p-4">
                <div class="benefit-icon bg-primary-subtle text-primary">
                  <i class="bi bi-heart-pulse-fill"></i>
                </div>
                <div class="fw-bold mt-3 mb-2">Kiểm tra sức khỏe</div>
                <div class="small text-muted">
                  Bạn sẽ được kiểm tra sức khỏe miễn phí trước khi hiến máu để đảm bảo an toàn.
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card border-0 shadow-sm rounded-4 benefit-card h-100">
              <div class="card-body p-4">
                <div class="benefit-icon bg-purple-subtle text-purple">
                  <i class="bi bi-gift-fill"></i>
                </div>
                <div class="fw-bold mt-3 mb-2">Quà tặng tri ân</div>
                <div class="small text-muted">
                  Nhận quà tặng và giấy chứng nhận sau khi hoàn thành một lần hiến máu ý nghĩa.
                </div>
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
  name: "CheckInCardPage",

  data() {
    return {
      qrCodeDataUrl: "",
      card: {
        appointment_code: "SBDS-8842",
        full_name: "Du Minh Thanh",
        blood_group: "Chưa xác định",
        time_slot: "08:30 Sáng - 11:30 Sáng",
        date: "2026-04-15",
        site_name: "Bệnh viện Đà Nẵng",
        address: "124 Hải Phòng, Đà Nẵng",
      },
    };
  },

  mounted() {
    this.generateQr();
  },

  methods: {
    async generateQr() {
      try {
        // mock trước: encode appointment_code
        this.qrCodeDataUrl = await QRCode.toDataURL(this.card.appointment_code, {
          width: 240,
          margin: 2,
        });
      } catch (error) {
        console.error("generateQr error:", error);
      }
    },

    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    downloadQrImage() {
      if (!this.qrCodeDataUrl) return;

      const link = document.createElement("a");
      link.href = this.qrCodeDataUrl;
      link.download = `${this.card.appointment_code}.png`;
      link.click();
    },

    printCard() {
      window.print();
    },
  },
};
</script>

<style scoped>
.checkin-page .menu-item {
  padding: 10px 12px;
  border-radius: 12px;
  color: #4b5563;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 6px;
}

.checkin-page .menu-item.active {
  background: #dc3545;
  color: white;
}

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
  max-width: 420px;
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
  width: 220px;
  height: 220px;
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

.benefit-card {
  min-height: 170px;
}

.benefit-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-purple-subtle {
  background: #f3e8ff;
}
.text-purple {
  color: #9333ea;
}

@media print {
  .menu-item,
  .btn,
  .alert,
  .benefit-card {
    display: none !important;
  }

  .qr-card-wrapper {
    max-width: 100%;
  }
}
</style>