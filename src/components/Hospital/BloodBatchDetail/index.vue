<template>
  <div class="container-fluid py-4 blood-batch-detail-page">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
      <div>
        <h3 class="fw-bold mb-1">
          Chi tiết lô máu
          <span v-if="batch.id" class="text-danger">{{ batchCode }}</span>
        </h3>
        <p class="text-muted mb-0">
          Theo dõi thông tin lô máu, hạn sử dụng, trạng thái kiểm định và lịch sử giao dịch.
        </p>
      </div>

      <button class="btn btn-secondary" @click="$router.push('/Hospital/blood-inventory')">
        <i class="bi bi-arrow-left me-1"></i>
        Quay lại
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="card border-0 shadow-sm rounded-4">
      <div class="card-body text-center py-5 text-muted">
        <span class="spinner-border spinner-border-sm me-2"></span>
        Đang tải chi tiết lô máu...
      </div>
    </div>

    <!-- NOT FOUND -->
    <div v-else-if="!batch.id" class="alert alert-danger rounded-4">
      Không tìm thấy thông tin lô máu.
    </div>

    <template v-else>
      <!-- SUMMARY CARDS -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body d-flex align-items-center">
              <div class="batch-icon icon-danger me-3">
                <i class="bi bi-droplet-fill"></i>
              </div>
              <div>
                <div class="small text-muted">Nhóm máu</div>
                <div class="fs-4 fw-bold text-danger">{{ bloodGroup }}</div>
                <div class="small text-muted">Mã lô {{ batchCode }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body d-flex align-items-center">
              <div class="batch-icon icon-primary me-3">
                <i class="bi bi-box-seam"></i>
              </div>
              <div>
                <div class="small text-muted">Số lượng</div>
                <div class="fs-4 fw-bold">{{ batch.units || 0 }} túi</div>
                <div class="small text-muted">Dung tích: {{ volumeLabel }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body d-flex align-items-center">
              <div class="batch-icon icon-warning me-3">
                <i class="bi bi-hourglass-split"></i>
              </div>
              <div>
                <div class="small text-muted">Hạn sử dụng</div>
                <div class="fs-5 fw-bold">{{ formatDate(batch.expiry_date) }}</div>
                <div class="small" :class="expiryTextClass">
                  {{ expiryText }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body d-flex align-items-center">
              <div class="batch-icon icon-status me-3">
                <i class="bi bi-clipboard-check"></i>
              </div>
              <div>
                <div class="small text-muted">Trạng thái</div>
                <div>
                  <span class="badge rounded-pill" :class="statusBadgeClass(batch.status)">
                    {{ statusLabel(batch.status) }}
                  </span>
                </div>
                <div class="small text-muted mt-1">{{ statusSubText }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN DETAIL -->
      <div class="row g-4 mb-4">
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-white py-3">
              <h5 class="fw-bold mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Thông tin lô máu
              </h5>
            </div>

            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="detail-box">
                    <div class="small text-muted">Mã lô</div>
                    <div class="fw-bold text-danger">{{ batchCode }}</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="detail-box">
                    <div class="small text-muted">ID trong hệ thống</div>
                    <div class="fw-bold">#{{ batch.id }}</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="detail-box">
                    <div class="small text-muted">Nhóm máu</div>
                    <div class="fw-bold">{{ bloodGroup }}</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="detail-box">
                    <div class="small text-muted">Số túi</div>
                    <div class="fw-bold">{{ batch.units || 0 }} túi</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="detail-box">
                    <div class="small text-muted">Ngày nhập / ngày hiến</div>
                    <div class="fw-bold">{{ formatDate(batch.donation_date || batch.created_at) }}</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="detail-box">
                    <div class="small text-muted">Hạn sử dụng</div>
                    <div class="fw-bold">{{ formatDate(batch.expiry_date) }}</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="detail-box">
                    <div class="small text-muted">Ngày kiểm định</div>
                    <div class="fw-bold">{{ formatDateTime(batch.tested_at) }}</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="detail-box">
                    <div class="small text-muted">Bác sĩ kiểm định</div>
                    <div class="fw-bold">
                      {{ batch.tested_by?.full_name || batch.tested_by_name || "-" }}
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="detail-box">
                    <div class="small text-muted">Bệnh viện / điểm tiếp nhận</div>
                    <div class="fw-bold">
                      {{ batch.hospital?.name || batch.hospital_name || "-" }}
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="detail-box">
                    <div class="small text-muted">Mã donation</div>
                    <div class="fw-bold">
                      {{ batch.donation_id ? "#" + batch.donation_id : "-" }}
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="detail-box">
                    <div class="small text-muted">Ghi chú chất lượng</div>
                    <div class="fw-semibold">
                      {{ batch.quality_note || batch.note || "Không có ghi chú." }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-white py-3">
              <h5 class="fw-bold mb-0">
                <i class="bi bi-lightbulb me-2"></i>
                Cảnh báo & khuyến nghị
              </h5>
            </div>

            <div class="card-body">
              <div class="alert rounded-4 mb-3" :class="alertClass">
                <div class="fw-bold mb-1">
                  <i class="bi bi-exclamation-triangle me-1"></i>
                  {{ alertTitle }}
                </div>
                <div class="small">
                  {{ alertMessage }}
                </div>
              </div>

              <div class="recommend-box">
                <div class="fw-bold mb-2">
                  <i class="bi bi-check2-circle text-success me-1"></i>
                  Gợi ý xử lý
                </div>

                <ul class="small text-muted mb-0 ps-3">
                  <li v-for="(item, index) in recommendations" :key="index">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TRANSACTION HISTORY -->
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 class="fw-bold mb-1">
              <i class="bi bi-clock-history me-2"></i>
              Lịch sử giao dịch của lô
            </h5>
            <small class="text-muted">
              Theo dõi các lần nhập kho, xuất kho, kiểm định, hết hạn hoặc loại bỏ.
            </small>
          </div>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Thời gian</th>
                  <th>Loại</th>
                  <th>Số lượng</th>
                  <th>Người thực hiện</th>
                  <th>Lý do / ghi chú</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(tx, index) in transactions" :key="tx.id || index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ formatDateTime(tx.occurred_at || tx.created_at) }}</td>
                  <td>
                    <span class="badge" :class="txBadgeClass(tx.tx_type)">
                      {{ txLabel(tx.tx_type) }}
                    </span>
                  </td>
                  <td>{{ tx.units || 0 }}</td>
                  <td>{{ tx.user?.full_name || tx.User?.full_name || tx.by?.full_name || "-" }}</td>
                  <td>{{ tx.reason || tx.note || "-" }}</td>
                </tr>

                <tr v-if="transactions.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">
                    Chưa có lịch sử giao dịch cho lô này.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "BloodBatchDetail",

  data() {
    return {
      loading: false,
      batch: {},
      transactions: [],
    };
  },

  computed: {
    batchId() {
      return this.$route.params.id || this.$route.query.id;
    },

    batchCode() {
      if (!this.batch?.id) return "-";
      return this.batch.code || this.batch.batch_code || `BL${String(this.batch.id).padStart(6, "0")}`;
    },

    bloodGroup() {
      if (this.batch.blood_group) return this.batch.blood_group;
      if (this.batch.blood_type) {
        if (typeof this.batch.blood_type === "string") return this.batch.blood_type;
        return `${this.batch.blood_type.abo || ""}${this.batch.blood_type.rh || ""}`;
      }
      if (this.batch.BloodType) {
        return `${this.batch.BloodType.abo || ""}${this.batch.BloodType.rh || ""}`;
      }
      return "-";
    },

    volumeLabel() {
      return this.batch.volume_ml ? `${this.batch.volume_ml} ml` : "Theo đơn vị túi";
    },

    daysLeft() {
      if (!this.batch.expiry_date) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiry = new Date(this.batch.expiry_date);
      expiry.setHours(0, 0, 0, 0);

      return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    },

    isExpired() {
      return this.daysLeft !== null && this.daysLeft < 0;
    },

    isExpiringSoon() {
      return this.daysLeft !== null && this.daysLeft >= 0 && this.daysLeft <= 7;
    },

    expiryText() {
      if (this.daysLeft === null) return "Chưa có hạn sử dụng";
      if (this.daysLeft < 0) return `Đã hết hạn ${Math.abs(this.daysLeft)} ngày`;
      if (this.daysLeft === 0) return "Hết hạn hôm nay";
      return `Còn ${this.daysLeft} ngày`;
    },

    expiryTextClass() {
      if (this.isExpired) return "text-danger fw-semibold";
      if (this.isExpiringSoon) return "text-warning fw-semibold";
      return "text-muted";
    },

    statusSubText() {
      const status = String(this.batch.status || "").toLowerCase();

      if (status === "available") return "Lô máu có thể sử dụng";
      if (status === "testing") return "Lô máu đang chờ kiểm định";
      if (status === "discarded") return "Lô máu đã bị loại bỏ";
      if (status === "expired") return "Lô máu đã hết hạn";
      return "Trạng thái đang được cập nhật";
    },

    alertClass() {
      if (this.isExpired) return "alert-danger";
      if (this.isExpiringSoon) return "alert-warning";
      if (String(this.batch.status || "").toLowerCase() === "testing") return "alert-info";
      if (String(this.batch.status || "").toLowerCase() === "available") return "alert-success";
      return "alert-secondary";
    },

    alertTitle() {
      if (this.isExpired) return "Lô máu đã hết hạn";
      if (this.isExpiringSoon) return "Lô máu sắp hết hạn";
      if (String(this.batch.status || "").toLowerCase() === "testing") return "Đang chờ kiểm định";
      if (String(this.batch.status || "").toLowerCase() === "available") return "Lô máu khả dụng";
      return "Cần kiểm tra trạng thái";
    },

    alertMessage() {
      if (this.isExpired) {
        return "Lô máu này đã quá hạn sử dụng, không nên xuất kho sử dụng và cần được xử lý theo quy trình.";
      }

      if (this.isExpiringSoon) {
        return "Lô máu này sắp hết hạn, nên ưu tiên sử dụng theo nguyên tắc hạn gần dùng trước.";
      }

      if (String(this.batch.status || "").toLowerCase() === "testing") {
        return "Lô máu đang trong trạng thái kiểm định, cần hoàn tất xét nghiệm trước khi chuyển sang khả dụng.";
      }

      if (String(this.batch.status || "").toLowerCase() === "available") {
        return "Lô máu đang khả dụng và có thể được sử dụng khi cần.";
      }

      return "Vui lòng kiểm tra thêm thông tin lô máu trước khi thao tác.";
    },

    recommendations() {
      if (this.isExpired) {
        return [
          "Không xuất kho lô máu đã hết hạn.",
          "Chuyển lô máu khỏi kho khả dụng nếu chưa được xử lý.",
          "Ghi nhận lý do xử lý để phục vụ truy vết.",
        ];
      }

      if (this.isExpiringSoon) {
        return [
          "Ưu tiên sử dụng lô máu này trước các lô có hạn xa hơn.",
          "Theo dõi nhu cầu sử dụng của nhóm máu tương ứng.",
          "Nếu không thể sử dụng kịp, cần chuẩn bị phương án xử lý trước hạn.",
        ];
      }

      if (String(this.batch.status || "").toLowerCase() === "testing") {
        return [
          "Hoàn tất kiểm định trước khi đưa vào kho khả dụng.",
          "Cập nhật kết quả xét nghiệm đầy đủ.",
          "Không xuất kho khi lô máu chưa đạt kiểm định.",
        ];
      }

      return [
        "Theo dõi hạn sử dụng định kỳ.",
        "Ưu tiên lô có hạn gần hơn khi cần xuất kho.",
        "Ghi nhận đầy đủ giao dịch nhập/xuất để đảm bảo truy vết.",
      ];
    },
  },

  mounted() {
    this.loadBatchDetail();
  },

  methods: {
    async loadBatchDetail() {
      this.loading = true;

      try {
        const id = this.batchId;

        if (!id) {
          this.batch = {};
          return;
        }

        const endpoints = [
          `/doctor/blood-inventory/${id}`,
          `/doctor/blood-inventory/detail/${id}`,
          `/doctor/blood-inventory/batch/${id}`,
        ];

        let payload = null;

        for (const endpoint of endpoints) {
          try {
            const res = await baseRequestDoctor.get(endpoint);

            if (res.data?.status) {
              payload = res.data.data;
              break;
            }
          } catch (error) {
            // thử endpoint tiếp theo
          }
        }

        if (!payload) {
          this.batch = {};
          this.$toast?.error("Không tải được chi tiết lô máu!");
          return;
        }

        this.batch = payload.batch || payload.inventory || payload.data || payload;
        this.transactions =
          payload.transactions ||
          payload.logs ||
          payload.inventory_transactions ||
          this.batch.transactions ||
          this.batch.inventory_transactions ||
          [];
      } catch (error) {
        console.error("loadBatchDetail error:", error);
        this.$toast?.error("Lỗi tải chi tiết lô máu!");
      } finally {
        this.loading = false;
      }
    },

    formatDate(value) {
      if (!value) return "-";

      return new Date(value).toLocaleDateString("vi-VN");
    },

    formatDateTime(value) {
      if (!value) return "-";

      return new Date(value).toLocaleString("vi-VN");
    },

    statusLabel(status) {
      const text = String(status || "").toLowerCase();

      const map = {
        available: "Có thể sử dụng",
        testing: "Đang kiểm định",
        discarded: "Đã loại bỏ",
        expired: "Hết hạn",
      };

      return map[text] || status || "-";
    },

    statusBadgeClass(status) {
      const text = String(status || "").toLowerCase();

      const map = {
        available: "bg-success",
        testing: "bg-primary",
        discarded: "bg-secondary",
        expired: "bg-danger",
      };

      return map[text] || "bg-light text-dark border";
    },

    isDestroyTx(type) {
      const text = String(type || "").toUpperCase();

      return ["EXPIRE", "EXPIRED", "DISCARD", "DISCARDED", "DESTROY", "DESTROYED"].includes(text);
    },

    txLabel(type) {
  const text = String(type || "").toUpperCase();

  if (text === "IN") return "Nhập";
  if (text === "OUT") return "Xuất";
  if (text === "ADJUST") return "Kiểm định";
  if (text === "EXPIRE" || text === "EXPIRED") return "Hết hạn";

  if (
    text === "DISCARD" ||
    text === "DISCARDED" ||
    text === "DESTROY" ||
    text === "DESTROYED"
  ) {
    return "Tiêu hủy";
  }

  return text || "-";
},

    txBadgeClass(type) {
  const text = String(type || "").toUpperCase();

  if (text === "IN") return "bg-success";
  if (text === "OUT") return "bg-primary";
  if (text === "ADJUST") return "bg-info text-dark";
  if (text === "EXPIRE" || text === "EXPIRED") return "bg-danger";

  if (
    text === "DISCARD" ||
    text === "DISCARDED" ||
    text === "DESTROY" ||
    text === "DESTROYED"
  ) {
    return "bg-dark";
  }

  return "bg-secondary";
},
  },
};
</script>

<style scoped>
.blood-batch-detail-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.card {
  border-radius: 16px;
}

.batch-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
  flex-shrink: 0;
}

.icon-danger {
  background: #fee2e2;
  color: #dc3545;
}

.icon-primary {
  background: #dbeafe;
  color: #0d6efd;
}

.icon-warning {
  background: #fff3cd;
  color: #b45309;
}

.icon-status {
  background: #e5e7eb;
  color: #111827;
}

.detail-box {
  border: 1px solid #f1f3f5;
  border-radius: 14px;
  padding: 14px;
  background: #fff;
  height: 100%;
}

.recommend-box {
  border: 1px solid #f1f3f5;
  border-radius: 14px;
  padding: 14px;
  background: #fff;
}

.table {
  font-size: 15px;
}
</style>