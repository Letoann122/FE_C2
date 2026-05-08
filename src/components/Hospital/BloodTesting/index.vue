<template>
  <div class="container py-4">
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
          <div>
            <h4 class="fw-bold mb-1">
              <i class="bi bi-shield-check text-danger me-2"></i>
              Kiểm định túi máu
            </h4>
            <p class="text-muted mb-0">
              Duyệt các túi máu đang chờ kiểm định sau khi hiến máu hoàn tất.
            </p>
          </div>

          <button class="btn btn-outline-danger" @click="loadData(true)">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Tải lại
          </button>
        </div>

        <div v-if="successMessage" class="alert alert-success rounded-4">
          <i class="bi bi-check-circle-fill me-1"></i>
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="alert alert-danger rounded-4">
          <i class="bi bi-exclamation-triangle-fill me-1"></i>
          {{ errorMessage }}
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-danger"></div>
          <div class="text-muted mt-2">Đang tải danh sách túi máu...</div>
        </div>

        <div v-else>
          <div class="d-flex gap-3 flex-wrap mb-3">
            <div class="summary-box">
              <div class="text-muted small">Chờ kiểm định</div>
              <div class="fw-bold fs-5">{{ list.length }}</div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Mã túi</th>
                  <th>Nhóm máu</th>
                  <th>Số túi</th>
                  <th>Ngày hiến</th>
                  <th>Hạn sử dụng</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th class="text-end">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="list.length === 0">
                  <td colspan="9" class="text-center text-muted py-4">
                    Không có túi máu nào đang chờ kiểm định.
                  </td>
                </tr>

                <tr v-for="(item, index) in list" :key="item.id">
                  <td>{{ index + 1 }}</td>

                  <td class="fw-bold">#{{ item.id }}</td>

                  <td>
                    <span class="badge bg-danger">
                      {{ formatBloodType(item.blood_type) }}
                    </span>
                  </td>

                  <td>{{ item.units }}</td>

                  <td>{{ formatDate(item.donation_date) }}</td>

                  <td>{{ formatDate(item.expiry_date) }}</td>

                  <td>
                    <span class="badge" :class="statusClass(item.status)">
                      {{ statusText(item.status) }}
                    </span>
                  </td>

                  <td class="text-muted small">
                    {{ item.quality_note || "Chưa có ghi chú" }}
                  </td>

                  <td class="text-end">
                    <div class="d-flex justify-content-end gap-2 flex-wrap">
                      <button
                        class="btn btn-sm btn-success"
                        :disabled="processingId === item.id"
                        @click="approve(item)"
                      >
                        <span
                          v-if="processingId === item.id"
                          class="spinner-border spinner-border-sm me-1"
                        ></span>
                        <i v-else class="bi bi-check-circle me-1"></i>
                        Đạt
                      </button>

                      <button
                        class="btn btn-sm btn-outline-danger"
                        :disabled="processingId === item.id"
                        @click="openRejectModal(item)"
                      >
                        <i class="bi bi-x-circle me-1"></i>
                        Không đạt
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <div
      v-if="showRejectModal"
      class="modal-backdrop-custom"
    >
      <div class="modal-card">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 class="fw-bold mb-1">Loại bỏ túi máu</h5>
            <div class="text-muted small">
              Túi máu #{{ selectedItem?.id }}
            </div>
          </div>

          <button
            class="btn-close"
            :disabled="processingId"
            @click="closeRejectModal"
          ></button>
        </div>

        <label class="form-label fw-semibold">
          Lý do không đạt kiểm định
        </label>

        <textarea
          v-model="rejectReason"
          class="form-control"
          rows="4"
          placeholder="Ví dụ: Không đạt xét nghiệm, chất lượng không đảm bảo..."
          :disabled="processingId"
        ></textarea>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <button
            class="btn btn-outline-secondary"
            :disabled="processingId"
            @click="closeRejectModal"
          >
            Hủy
          </button>

          <button
            class="btn btn-danger"
            :disabled="!rejectReason.trim() || processingId"
            @click="reject"
          >
            <span
              v-if="processingId"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            Xác nhận loại bỏ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "HospitalBloodTesting",

  data() {
    return {
      loading: false,
      processingId: null,

      list: [],

      successMessage: "",
      errorMessage: "",

      showRejectModal: false,
      selectedItem: null,
      rejectReason: "",
    };
  },

  mounted() {
    this.loadData(true);
  },

  methods: {
    async loadData(shouldClearMessage = true) {
      this.loading = true;

      if (shouldClearMessage) {
        this.clearMessage();
      }

      try {
        const res = await baseRequestDoctor.get("/doctor/blood-testing/list");

        if (res.data.status) {
          this.list = res.data.data || [];
        } else {
          const message =
            res.data.message || "Không tải được danh sách túi máu.";

          this.errorMessage = message;
          this.$toast?.error(message);
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Lỗi khi tải danh sách túi máu.";

        this.errorMessage = message;
        this.$toast?.error(message);
      } finally {
        this.loading = false;
      }
    },

    async approve(item) {
      this.processingId = item.id;
      this.clearMessage();

      try {
        const res = await baseRequestDoctor.post(
          "/doctor/blood-testing/approve",
          {
            inventory_id: item.id,
            quality_note: "Túi máu đạt kiểm định",
          }
        );

        if (res.data.status) {
          const message =
            res.data.message || "Túi máu đã đạt kiểm định.";

          this.successMessage = message;
          this.$toast?.success(message);

          await this.loadData(false);
        } else {
          const message =
            res.data.message || "Không thể duyệt túi máu.";

          this.errorMessage = message;
          this.$toast?.error(message);
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Lỗi khi duyệt túi máu.";

        this.errorMessage = message;
        this.$toast?.error(message);
      } finally {
        this.processingId = null;
      }
    },

    openRejectModal(item) {
      this.selectedItem = item;
      this.rejectReason = "";
      this.showRejectModal = true;
      this.clearMessage();
    },

    closeRejectModal() {
      if (this.processingId) return;

      this.showRejectModal = false;
      this.selectedItem = null;
      this.rejectReason = "";
    },

    async reject() {
      if (!this.selectedItem) return;

      this.processingId = this.selectedItem.id;
      this.clearMessage();

      try {
        const res = await baseRequestDoctor.post(
          "/doctor/blood-testing/reject",
          {
            inventory_id: this.selectedItem.id,
            quality_note: this.rejectReason.trim(),
          }
        );

        if (res.data.status) {
          const message =
            res.data.message || "Túi máu đã được loại bỏ.";

          this.successMessage = message;
          this.$toast?.success(message);

          this.showRejectModal = false;
          this.selectedItem = null;
          this.rejectReason = "";

          await this.loadData(false);
        } else {
          const message =
            res.data.message || "Không thể loại bỏ túi máu.";

          this.errorMessage = message;
          this.$toast?.error(message);
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Lỗi khi loại bỏ túi máu.";

        this.errorMessage = message;
        this.$toast?.error(message);
      } finally {
        this.processingId = null;
      }
    },

    clearMessage() {
      this.successMessage = "";
      this.errorMessage = "";
    },

    formatBloodType(type) {
      if (!type) return "N/A";
      return `${type.abo}${type.rh}`;
    },

    formatDate(value) {
      if (!value) return "Không có dữ liệu";

      return new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },

    statusText(status) {
      const map = {
        testing: "Đang kiểm định",
        available: "Có thể sử dụng",
        discarded: "Đã loại bỏ",
        expired: "Hết hạn",
      };

      return map[status] || status;
    },

    statusClass(status) {
      const map = {
        testing: "bg-warning text-dark",
        available: "bg-success",
        discarded: "bg-danger",
        expired: "bg-secondary",
      };

      return map[status] || "bg-light text-dark border";
    },
  },
};
</script>

<style scoped>
.summary-box {
  min-width: 160px;
  padding: 14px 18px;
  border-radius: 16px;
  background: #f8f9fa;
  border: 1px solid #edf0f2;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
</style>