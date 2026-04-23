<template>
  <div class="container py-4 scanner-page">
    <div class="mb-4">
      <h3 class="fw-bold mb-1">Quét Check-in</h3>
      <p class="text-muted mb-0">
        Sử dụng camera điện thoại hoặc máy tính để quét mã QR check-in của người hiến máu.
      </p>
    </div>

    <div class="row g-4">
      <!-- LEFT -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3">Khu vực quét QR</h5>

            <div class="scanner-box mb-3">
              <div class="scanner-overlay">
                <div class="scanner-frame"></div>
              </div>

              <div class="text-center text-muted">
                <i class="bi bi-camera-video fs-1 d-block mb-2"></i>
                <div class="fw-semibold">Camera Scanner</div>
                <div class="small">
                  Mock UI trước — sau này nối camera thật bằng thư viện scan QR
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 flex-wrap mb-4">
              <button class="btn btn-danger" @click="startCamera">
                <i class="bi bi-camera-video-fill me-1"></i>Bắt đầu camera
              </button>
              <button class="btn btn-outline-secondary" @click="stopCamera">
                <i class="bi bi-stop-circle me-1"></i>Dừng camera
              </button>
            </div>

            <hr />

            <h6 class="fw-bold mb-3">Nhập mã phiếu hẹn</h6>

            <div class="row g-2">
              <div class="col-md-8">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Nhập mã check-in, ví dụ: SBDS-8842"
                  v-model.trim="manualCode"
                />
              </div>
              <div class="col-md-4">
                <button class="btn btn-danger w-100" @click="previewCheckIn">
                  Kiểm tra mã
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3">Thông tin người hiến</h5>

            <div v-if="!previewData" class="text-muted small">
              Chưa có dữ liệu. Hãy quét QR hoặc nhập mã để kiểm tra.
            </div>

            <div v-else>
              <div class="detail-row">
                <div class="text-muted small">Mã lịch</div>
                <div class="fw-semibold">{{ previewData.appointment_code }}</div>
              </div>

              <div class="detail-row">
                <div class="text-muted small">Người hiến</div>
                <div class="fw-semibold">{{ previewData.full_name }}</div>
              </div>

              <div class="detail-row">
                <div class="text-muted small">Nhóm máu</div>
                <div class="fw-semibold">{{ previewData.blood_group }}</div>
              </div>

              <div class="detail-row">
                <div class="text-muted small">Thời gian</div>
                <div class="fw-semibold">{{ previewData.time_slot }}</div>
              </div>

              <div class="detail-row">
                <div class="text-muted small">Ngày hẹn</div>
                <div class="fw-semibold">{{ previewData.date }}</div>
              </div>

              <div class="detail-row">
                <div class="text-muted small">Địa điểm</div>
                <div class="fw-semibold">{{ previewData.site_name }}</div>
              </div>

              <div class="detail-row">
                <div class="text-muted small">Trạng thái</div>
                <div class="fw-semibold text-warning">{{ previewData.status }}</div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button class="btn btn-danger flex-fill" @click="confirmCheckIn">
                  Xác nhận Check-in
                </button>
                <button class="btn btn-outline-secondary flex-fill" @click="clearPreview">
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card border-0 shadow-sm rounded-4 mt-3">
          <div class="card-body p-4">
            <h6 class="fw-bold mb-3">Quy trình xác nhận</h6>
            <ol class="small text-muted ps-3 mb-0">
              <li>Mở camera trên điện thoại/laptop.</li>
              <li>Quét QR trên thẻ check-in của donor.</li>
              <li>Hiển thị thông tin appointment.</li>
              <li>Nhân viên bấm xác nhận check-in.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CheckInScannerPage",

  data() {
    return {
      manualCode: "",
      previewData: null,
    };
  },

  methods: {
    startCamera() {
      console.log("start camera mock");
      alert("Mock UI: sau này sẽ mở camera thật để quét QR.");
    },

    stopCamera() {
      console.log("stop camera mock");
    },

    previewCheckIn() {
      if (!this.manualCode) {
        alert("Vui lòng nhập mã check-in.");
        return;
      }

      // fake data mock
      this.previewData = {
        appointment_code: this.manualCode,
        full_name: "Du Minh Thanh",
        blood_group: "O+",
        time_slot: "08:30 - 11:30",
        date: "15/04/2026",
        site_name: "Bệnh viện Đà Nẵng",
        status: "APPROVED",
      };
    },

    confirmCheckIn() {
      if (!this.previewData) return;
      alert(`Mock check-in thành công cho mã ${this.previewData.appointment_code}`);
    },

    clearPreview() {
      this.previewData = null;
      this.manualCode = "";
    },
  },
};
</script>

<style scoped>
.scanner-box {
  height: 360px;
  border: 2px dashed #d1d5db;
  border-radius: 20px;
  background: #f9fafb;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.scanner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner-frame {
  width: 220px;
  height: 220px;
  border: 3px solid #dc3545;
  border-radius: 20px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.04);
}

.detail-row {
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f1f1;
}
</style>