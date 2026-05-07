<template>
  <div class="container py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger"></div>
      <div class="text-muted mt-2">Đang tải dữ liệu...</div>
    </div>

    <div v-else-if="appointment">
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
          <div
            class="d-flex justify-content-between align-items-start flex-wrap gap-3"
          >
            <div>
              <h4 class="fw-bold mb-1">
                <i class="bi bi-heart-pulse text-danger me-2"></i>
                Quy trình hiến máu
              </h4>

              <p class="text-muted mb-0">
                Workflow: CHECKED_IN → SCREENING → DONATING → COMPLETED
              </p>
            </div>

            <span class="badge fs-6" :class="statusClass(appointment.status)">
              {{ statusText(appointment.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- donor info -->
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4">
              <h5 class="fw-bold mb-4">
                <i class="bi bi-person-vcard me-2"></i>
                Thông tin người hiến
              </h5>

              <div class="info-item">
                <div class="label">Mã lịch hẹn</div>
                <div class="value fw-bold">
                  {{ appointment.appointment_code }}
                </div>
              </div>

              <div class="info-item">
                <div class="label">Họ tên</div>
                <div class="value">
                  {{ appointment.donor?.full_name || "Không có dữ liệu" }}
                </div>
              </div>

              <div class="info-item">
                <div class="label">Số điện thoại</div>
                <div class="value">
                  {{ appointment.donor?.phone || "Không có dữ liệu" }}
                </div>
              </div>

              <div class="info-item">
                <div class="label">Email</div>
                <div class="value">
                  {{ appointment.donor?.email || "Không có dữ liệu" }}
                </div>
              </div>

              <div class="info-item">
                <div class="label">Nhóm máu</div>
                <div class="value">
                  <span class="badge bg-danger fs-6">
                    {{ appointment.donor?.blood_group || "N/A" }}
                  </span>
                </div>
              </div>

              <div class="info-item">
                <div class="label">Giới tính</div>
                <div class="value">
                  {{ appointment.donor?.gender || "Không có dữ liệu" }}
                </div>
              </div>

              <div class="info-item">
                <div class="label">Địa chỉ</div>
                <div class="value">
                  {{ appointment.donor?.address || "Không có dữ liệu" }}
                </div>
              </div>

              <div class="info-item">
                <div class="label">Tiền sử bệnh</div>
                <div class="value">
                  {{ appointment.donor?.medical_history || "Không có dữ liệu" }}
                </div>
              </div>

              <div class="info-item">
                <div class="label">Địa điểm hiến máu</div>
                <div class="value">
                  {{ appointment.donation_site?.name || "Không có dữ liệu" }}
                </div>
              </div>

              <div class="info-item">
                <div class="label">Lịch hẹn</div>
                <div class="value">
                  {{ formatDateTime(appointment.scheduled_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- workflow -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm rounded-4">
            <div class="card-body p-4">
              <h5 class="fw-bold mb-4">
                <i class="bi bi-diagram-3 me-2"></i>
                Thông tin hiến máu
              </h5>

              <!-- checked in -->
              <div v-if="appointment.status === 'CHECKED_IN'">
                <div class="alert alert-success rounded-4">
                  Người hiến đã check-in và đang chờ sàng lọc.
                </div>

                <button
                  class="btn btn-danger"
                  :disabled="processing"
                  @click="startScreening"
                >
                  <span
                    v-if="processing"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>

                  <i v-else class="bi bi-play-circle me-2"></i>

                  Bắt đầu sàng lọc
                </button>
              </div>

              <!-- screening -->
              <div v-if="appointment.status === 'SCREENING'">
                <div class="alert alert-info rounded-4">
                  Bác sĩ nhập kết quả sàng lọc để quyết định người hiến có đủ
                  điều kiện hay không.
                </div>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Huyết áp</label>
                    <input
                      v-model="screening.blood_pressure"
                      class="form-control"
                      placeholder="120/80"
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Nhịp tim</label>
                    <input
                      v-model="screening.heart_rate"
                      class="form-control"
                      placeholder="75"
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Hemoglobin</label>
                    <input
                      v-model="screening.hemoglobin"
                      class="form-control"
                      placeholder="13.5"
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Cân nặng</label>
                    <input
                      v-model="screening.weight"
                      class="form-control"
                      placeholder="60"
                    />
                  </div>

                  <div class="col-12">
                    <label class="form-label fw-semibold">Ghi chú</label>
                    <textarea
                      v-model="screening.screening_note"
                      class="form-control"
                      rows="3"
                    ></textarea>
                  </div>
                </div>

                <div class="d-flex gap-2 mt-4 flex-wrap">
                  <button
                    class="btn btn-danger"
                    :disabled="processing"
                    @click="startDonation"
                  >
                    <span
                      v-if="processing"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>

                    <i v-else class="bi bi-check-circle me-2"></i>

                    Đủ điều kiện hiến máu
                  </button>

                  <button
                    class="btn btn-outline-secondary"
                    :disabled="processing"
                    @click="failScreening"
                  >
                    Không đạt sàng lọc
                  </button>
                </div>
              </div>

              <!-- donating -->
              <div v-if="appointment.status === 'DONATING'">
                <div class="alert alert-warning rounded-4">
                  Người hiến đang trong quá trình hiến máu.
                </div>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold"
                      >Lượng máu thực tế (ml)</label
                    >

                    <select v-model="donation.volume_ml" class="form-select">
                      <option value="250">250ml</option>
                      <option value="350">350ml</option>
                      <option value="450">450ml</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Nhóm máu</label>

                    <input
                      v-model="donation.blood_group"
                      class="form-control"
                    />
                  </div>

                  <div class="col-12">
                    <label class="form-label fw-semibold">Ghi chú</label>

                    <textarea
                      v-model="donation.notes"
                      class="form-control"
                      rows="3"
                    ></textarea>
                  </div>
                </div>

                <button
                  class="btn btn-danger mt-4"
                  :disabled="processing"
                  @click="completeDonation"
                >
                  <span
                    v-if="processing"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>

                  <i v-else class="bi bi-heart-fill me-2"></i>

                  Hoàn tất hiến máu
                </button>
              </div>

              <!-- completed -->
              <div v-if="appointment.status === 'COMPLETED'">
                <div class="alert alert-primary rounded-4">
                  Quy trình hiến máu đã hoàn tất và máu đã được nhập kho.
                </div>

                <div
                  v-if="appointment.donation"
                  class="border rounded-4 p-3 bg-light"
                >
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="small text-muted">Donation ID</div>
                      <div class="fw-bold">#{{ appointment.donation.id }}</div>
                    </div>

                    <div class="col-md-6">
                      <div class="small text-muted">Thể tích máu</div>
                      <div class="fw-bold">
                        {{ appointment.donation.volume_ml }}ml
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="small text-muted">Thời gian hoàn tất</div>
                      <div class="fw-semibold">
                        {{ formatDateTime(appointment.completed_at) }}
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="small text-muted">Xác nhận bởi bác sĩ</div>
                      <div class="fw-semibold">
                        {{
                          appointment.donation?.confirmed_by_doctor
                            ?.full_name ||
                          appointment.donation?.confirmed_by_doctor?.email ||
                          "Không có dữ liệu"
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- failed -->
              <div v-if="appointment.status === 'FAILED_SCREENING'">
                <div class="alert alert-danger rounded-4">
                  Người hiến không đạt điều kiện sàng lọc.
                </div>
              </div>

              <!-- notes -->
              <div
                v-if="appointment.notes"
                class="border rounded-4 p-3 bg-light mt-4"
              >
                <div class="fw-bold mb-2">Ghi chú hệ thống</div>

                <pre class="mb-0 note-pre">{{ appointment.notes }}</pre>
              </div>

              <div
                v-if="errorMessage"
                class="alert alert-danger rounded-4 mt-4 mb-0"
              >
                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                {{ errorMessage }}
              </div>

              <div
                v-if="successMessage"
                class="alert alert-success rounded-4 mt-4 mb-0"
              >
                <i class="bi bi-check-circle-fill me-1"></i>
                {{ successMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-danger rounded-4">
      Không tìm thấy dữ liệu lịch hẹn.
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "HospitalDonationProcess",

  data() {
    return {
      loading: false,
      processing: false,

      appointment: null,

      successMessage: "",
      errorMessage: "",

      screening: {
        blood_pressure: "",
        heart_rate: "",
        hemoglobin: "",
        weight: "",
        screening_note: "",
      },

      donation: {
        volume_ml: "350",
        blood_group: "",
        notes: "",
      },
    };
  },

  mounted() {
    this.loadDetail();
  },

  methods: {
    async loadDetail() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const appointmentId = this.$route.query.appointment_id;

        const res = await baseRequestDoctor.get(
          "/doctor/donation-process/detail",
          {
            params: {
              appointment_id: appointmentId,
            },
          }
        );

        if (res.data.status) {
          this.appointment = res.data.data;

          this.donation.blood_group =
            this.appointment?.donor?.blood_group || "";
        } else {
          this.errorMessage = res.data.message || "Không tải được dữ liệu!";
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Lỗi khi tải dữ liệu workflow!";
      } finally {
        this.loading = false;
      }
    },

    async startScreening() {
      this.processing = true;
      this.clearMessage();

      try {
        const res = await baseRequestDoctor.post(
          "/doctor/donation-process/start-screening",
          {
            appointment_id: this.appointment.appointment_id,
          }
        );

        if (res.data.status) {
          this.successMessage = res.data.message;
          await this.loadDetail();
        } else {
          this.errorMessage = res.data.message;
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Lỗi khi bắt đầu sàng lọc!";
      } finally {
        this.processing = false;
      }
    },

    async failScreening() {
      this.processing = true;
      this.clearMessage();

      try {
        const res = await baseRequestDoctor.post(
          "/doctor/donation-process/fail-screening",
          {
            appointment_id: this.appointment.appointment_id,
            reason:
              this.screening.screening_note || "Không đủ điều kiện hiến máu",
          }
        );

        if (res.data.status) {
          this.successMessage = res.data.message;
          await this.loadDetail();
        } else {
          this.errorMessage = res.data.message;
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          "Lỗi khi cập nhật không đạt sàng lọc!";
      } finally {
        this.processing = false;
      }
    },

    async startDonation() {
      this.processing = true;
      this.clearMessage();

      try {
        const res = await baseRequestDoctor.post(
          "/doctor/donation-process/start-donation",
          {
            appointment_id: this.appointment.appointment_id,
            ...this.screening,
          }
        );

        if (res.data.status) {
          this.successMessage = res.data.message;
          await this.loadDetail();
        } else {
          this.errorMessage = res.data.message;
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Lỗi khi bắt đầu hiến máu!";
      } finally {
        this.processing = false;
      }
    },

    async completeDonation() {
      this.processing = true;
      this.clearMessage();

      try {
        const res = await baseRequestDoctor.post(
          "/doctor/donation-process/complete",
          {
            appointment_id: this.appointment.appointment_id,
            ...this.donation,
          }
        );

        if (res.data.status) {
          this.successMessage = res.data.message;
          await this.loadDetail();
        } else {
          this.errorMessage = res.data.message;
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Lỗi khi hoàn tất hiến máu!";
      } finally {
        this.processing = false;
      }
    },

    clearMessage() {
      this.successMessage = "";
      this.errorMessage = "";
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

    statusText(status) {
      const map = {
        CHECKED_IN: "Đã check-in",
        SCREENING: "Đang sàng lọc",
        DONATING: "Đang hiến máu",
        COMPLETED: "Hoàn tất",
        FAILED_SCREENING: "Không đạt sàng lọc",
      };

      return map[status] || status;
    },

    statusClass(status) {
      const map = {
        CHECKED_IN: "bg-success",
        SCREENING: "bg-info",
        DONATING: "bg-warning text-dark",
        COMPLETED: "bg-primary",
        FAILED_SCREENING: "bg-danger",
      };

      return map[status] || "bg-secondary";
    },
  },
};
</script>

<style scoped>
.info-item {
  margin-bottom: 18px;
}

.info-item .label {
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 4px;
}

.info-item .value {
  font-weight: 500;
}

.note-pre {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 14px;
}
</style>