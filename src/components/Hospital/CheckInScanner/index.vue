<template>
  <div class="container py-4">
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <div
          class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3"
        >
          <div>
            <h4 class="fw-bold mb-1">
              <i class="bi bi-qr-code-scan text-danger me-2"></i>
              Check-in bằng QR Code
            </h4>
            <p class="text-muted mb-0">
              Bác sĩ dùng camera để quét mã QR của người hiến máu.
            </p>
          </div>

          <span class="badge bg-danger-subtle text-danger px-3 py-2">
            Doctor
          </span>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
            <div class="scanner-box rounded-4 overflow-hidden border bg-light">
              <div id="qr-reader"></div>
            </div>

            <div class="d-flex gap-2 mt-3 flex-wrap">
              <button
                class="btn btn-danger"
                :disabled="cameraRunning || loading"
                @click="startCamera"
              >
                <i class="bi bi-camera-video me-1"></i>
                Bật camera
              </button>

              <button
                class="btn btn-outline-secondary"
                :disabled="!cameraRunning"
                @click="stopCamera"
              >
                <i class="bi bi-camera-video-off me-1"></i>
                Tắt camera
              </button>
            </div>

            <div class="alert alert-info rounded-4 mt-3 mb-0 small">
              <i class="bi bi-info-circle me-1"></i>
              Nếu trình duyệt hỏi quyền camera, chọn <b>Allow / Cho phép</b>.
              Trên điện thoại nên dùng camera sau để quét rõ hơn.
            </div>
          </div>

          <div class="col-lg-5">
            <div class="card border-0 bg-light rounded-4 h-100">
              <div class="card-body">
                <h6 class="fw-bold mb-3">Kết quả quét</h6>

                <label class="form-label fw-semibold">Mã QR đọc được</label>
                <textarea
                  v-model="qr_code"
                  class="form-control"
                  rows="4"
                  placeholder="Camera quét xong sẽ tự điền mã vào đây"
                ></textarea>

                <button
                  class="btn btn-danger w-100 mt-3"
                  :disabled="loading || !qr_code"
                  @click="submitCheckin(qr_code)"
                >
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  <i v-else class="bi bi-check-circle me-2"></i>
                  Xác nhận check-in
                </button>

                <button
                  class="btn btn-outline-secondary w-100 mt-2"
                  :disabled="loading"
                  @click="resetResult"
                >
                  Quét mã khác
                </button>

                <div
                  v-if="errorMessage"
                  class="alert alert-danger rounded-4 mt-3 mb-0"
                >
                  <i class="bi bi-exclamation-triangle-fill me-1"></i>
                  {{ errorMessage }}
                </div>

                <div
                  v-if="successMessage"
                  class="alert alert-success rounded-4 mt-3 mb-0"
                >
                  <i class="bi bi-check-circle-fill me-1"></i>
                  {{ successMessage }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="result" class="card border-0 shadow-sm rounded-4 mt-4">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3">
              <i class="bi bi-person-check text-success me-2"></i>
              Thông tin check-in
            </h5>

            <div class="row g-3">
              <div class="col-md-4">
                <div class="small text-muted">Mã lịch hẹn</div>
                <div class="fw-bold">{{ result.appointment_code }}</div>
              </div>

              <div class="col-md-4">
                <div class="small text-muted">Trạng thái</div>
                <span class="badge bg-success">{{ result.status }}</span>
              </div>

              <div class="col-md-4">
                <div class="small text-muted">Thời gian check-in</div>
                <div class="fw-semibold">
                  {{ formatDateTime(result.checked_in_at) }}
                </div>
              </div>

              <div class="col-md-4">
                <div class="small text-muted">Người hiến</div>
                <div class="fw-semibold">
                  {{ result.donor?.full_name || "Không có dữ liệu" }}
                </div>
              </div>

              <div class="col-md-4">
                <div class="small text-muted">Số điện thoại</div>
                <div class="fw-semibold">
                  {{ result.donor?.phone || "Không có dữ liệu" }}
                </div>
              </div>

              <div class="col-md-4">
                <div class="small text-muted">Nhóm máu</div>
                <div class="fw-semibold">
                  {{ result.donor?.blood_group || "Chưa xác định" }}
                </div>
              </div>

              <div class="col-md-6">
                <div class="small text-muted">Điểm hiến máu</div>
                <div class="fw-semibold">
                  {{ result.donation_site?.name || "Không có dữ liệu" }}
                </div>
                <div class="small text-muted">
                  {{ result.donation_site?.address || "" }}
                </div>
              </div>

              <div class="col-md-6">
                <div class="small text-muted">Khung giờ hẹn</div>
                <div class="fw-semibold">
                  {{ formatSchedule(result.scheduled_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { Html5Qrcode } from "html5-qrcode";
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "HospitalCheckInScanner",

  data() {
    return {
      html5QrCode: null,
      cameraRunning: false,
      isProcessing: false,
      loading: false,

      qr_code: "",
      result: null,
      successMessage: "",
      errorMessage: "",
    };
  },

  mounted() {
    this.html5QrCode = new Html5Qrcode("qr-reader");
  },

  beforeUnmount() {
    this.stopCamera();
  },

  methods: {
    async startCamera() {
      this.errorMessage = "";
      this.successMessage = "";

      if (this.cameraRunning) return;

      try {
        if (!this.html5QrCode) {
          this.html5QrCode = new Html5Qrcode("qr-reader");
        }

        const config = {
          fps: 10,
          qrbox: {
            width: 260,
            height: 260,
          },
        };

        await this.html5QrCode.start(
          {
            facingMode: "environment",
          },
          config,
          this.onScanSuccess,
          this.onScanFailure
        );

        this.cameraRunning = true;
      } catch (error) {
        console.error("START CAMERA ERROR:", error);
        this.errorMessage =
          "Không mở được camera. Hãy kiểm tra quyền camera hoặc chạy bằng localhost/HTTPS.";
      }
    },

    async stopCamera() {
      try {
        if (this.html5QrCode && this.cameraRunning) {
          await this.html5QrCode.stop();
          await this.html5QrCode.clear();
        }
      } catch (error) {
        console.error("STOP CAMERA ERROR:", error);
      } finally {
        this.cameraRunning = false;
        this.isProcessing = false;
      }
    },

    async onScanSuccess(decodedText) {
      if (this.isProcessing) return;

      this.isProcessing = true;
      this.qr_code = decodedText;

      await this.stopCamera();
      await this.submitCheckin(decodedText);
    },

    onScanFailure() {},

    async submitCheckin(qrCode) {
      this.errorMessage = "";
      this.successMessage = "";
      this.result = null;

      if (!qrCode || !String(qrCode).trim()) {
        this.errorMessage = "Chưa có mã QR để check-in!";
        return;
      }

      this.loading = true;

      try {
        const res = await baseRequestDoctor.post("/doctor/checkin", {
          qr_code: String(qrCode).trim(),
        });

        if (res.data.status) {
          this.successMessage = res.data.message || "Check-in thành công!";
          this.result = res.data.data;
        } else {
          this.errorMessage = res.data.message || "Check-in thất bại!";
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Có lỗi xảy ra khi check-in!";
      } finally {
        this.loading = false;
        this.isProcessing = false;
      }
    },

    resetResult() {
      this.qr_code = "";
      this.result = null;
      this.successMessage = "";
      this.errorMessage = "";
      this.isProcessing = false;
    },

    formatDateTime(value) {
      if (!value) return "Không có dữ liệu";

      return new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },

    formatSchedule(value) {
      if (!value) return "Không có dữ liệu";

      return new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
};
</script>

<style scoped>
.scanner-box {
  min-height: 360px;
}

#qr-reader {
  width: 100%;
  min-height: 360px;
}

:deep(#qr-reader video) {
  width: 100% !important;
  border-radius: 16px;
}

:deep(#qr-reader__scan_region) {
  background: #f8f9fa;
}

:deep(#qr-reader__dashboard_section_csr button) {
  border: 0;
  background: #dc3545;
  color: #fff;
  padding: 8px 14px;
  border-radius: 8px;
}

:deep(#qr-reader__dashboard_section_swaplink) {
  color: #dc3545 !important;
}
</style>