<template>
  <div class="container-fluid py-4 min-vh-100 group-detail-page">
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h3 class="fw-bold mb-1">Chi tiết nhóm máu {{ typeLabel }}</h3>
        <p class="text-muted mb-0">Theo dõi lô máu, ưu tiên lô gần hết hạn, cảnh báo hết hạn và khuyến nghị bổ sung.</p>
      </div>

      <router-link class="btn btn-secondary" to="/Hospital/blood-inventory">
        <i class="bi bi-arrow-left me-1"></i>Quay lại
      </router-link>
    </div>

    <div v-if="loading" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5 text-muted">
        <span class="spinner-border spinner-border-sm me-2"></span>
        Đang tải chi tiết nhóm máu...
      </div>
    </div>

    <template v-else>
      <div class="row g-3 mb-4">
        <div class="col-lg-3 col-md-6" v-for="card in summaryCards" :key="card.label">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body d-flex align-items-center">
              <div class="metric-icon me-3" :class="card.class">
                <i :class="card.icon"></i>
              </div>
              <div>
                <small class="text-muted">{{ card.label }}</small>
                <div class="fs-4 fw-bold">{{ card.value }}</div>
                <small class="text-muted">{{ card.sub }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-xl-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h5 class="fw-bold mb-2">Khuyến nghị cho nhóm {{ typeLabel }}</h5>
                  <p class="text-muted mb-0">{{ group.recommendation || "Chưa có khuyến nghị." }}</p>
                </div>
                <span class="badge rounded-pill fs-6" :class="statusBadgeClass(group.status)">
                  {{ group.status_text || "Không rõ" }}
                </span>
              </div>

              <div class="alert alert-light border mt-3 mb-0">
                <i class="bi bi-lightbulb text-warning me-2"></i>
                <b>Đề xuất chiến dịch:</b> {{ group.campaign_suggestion || "Chưa cần hành động." }}
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <h5 class="fw-bold mb-3">Ưu tiên lô gần hết hạn</h5>
              <div v-if="fefoBatch" class="fefo-box" @click="goBatch(fefoBatch.id)">
                <div class="fw-bold">{{ batchCode(fefoBatch.id) }}</div>
                <div class="small text-muted">Hạn: {{ fefoBatch.expiry_date_fmt }} · còn {{ fefoBatch.days_left }} ngày
                </div>
                <div class="small mt-2">Nên ưu tiên xuất/sử dụng lô này trước.</div>
              </div>
              <div v-else class="text-muted">Chưa có lô khả dụng để đề xuất ưu tiên theo hạn dùng.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h5 class="fw-bold mb-0">Danh sách lô máu {{ typeLabel }}</h5>
            <small class="text-muted">Lọc theo trạng thái kho và hạn sử dụng</small>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <select v-model="selectedStatus" class="form-select form-select-sm filter-select">
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Có thể sử dụng</option>
              <option value="testing">Đang kiểm định</option>
              <option value="discarded">Đã loại bỏ</option>
              <option value="expired">Hết hạn</option>
            </select>

            <select v-model="selectedExpiry" class="form-select form-select-sm filter-select">
              <option value="all">Tất cả hạn dùng</option>
              <option value="valid">Còn hạn</option>
              <option value="expiring_soon">Sắp hết hạn</option>
              <option value="expired">Đã hết hạn</option>
              <option value="empty">Đã xuất hết</option>
            </select>
          </div>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID lô</th>
                  <th>Số lượng</th>
                  <th>Ngày nhập</th>
                  <th>Hạn sử dụng</th>
                  <th>Tình trạng</th>
                  <th>Cảnh báo hạn</th>
                  <th>Ưu tiên hạn dùng</th>
                  <th class="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="batch in filteredBatches" :key="batch.id">
                  <td class="fw-bold text-danger">{{ batchCode(batch.id) }}</td>
                  <td>{{ batch.units }} túi</td>
                  <td>{{ batch.donation_date_fmt || formatDate(batch.donation_date) }}</td>
                  <td>{{ batch.expiry_date_fmt || formatDate(batch.expiry_date) }}</td>
                  <td>
                    <span class="badge rounded-pill" :class="dbStatusClass(batch.status)">
                      {{ dbStatusText(batch.status) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge rounded-pill" :class="expiryBadgeClass(batch.expiry_status)">
                      {{ batch.expiry_label }}
                    </span>
                  </td>
                  <td>
                    <span v-if="batch.id === fefoBatch?.id" class="badge bg-warning text-dark">
                      Ưu tiên
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-2" @click="goBatch(batch.id)">
                      Chi tiết
                    </button>
                    <button class="btn btn-sm btn-outline-dark"
                      :disabled="batch.status !== 'available' || batch.expiry_status === 'expired' || Number(batch.units || 0) <= 0"
                      @click="openExportModal(batch)">
                      Xuất
                    </button>
                  </td>
                </tr>

                <tr v-if="filteredBatches.length === 0">
                  <td colspan="8" class="text-center text-muted py-4">Không có lô máu phù hợp</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <div v-if="exportModal.open" class="modal-backdrop-custom" @click.self="closeExportModal">
      <div class="modal-card">
        <div class="modal-header border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0 fw-bold">Xuất túi máu theo lô</h5>
            <div class="text-muted small mt-1">Lô: <b>{{ batchCode(exportModal.batchId) }}</b></div>
          </div>
          <button class="btn btn-sm btn-light" @click="closeExportModal" :disabled="loadingExport">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="alert alert-warning small">
            <i class="bi bi-exclamation-triangle me-1"></i>
            Nên ưu tiên xuất lô có hạn sử dụng gần nhất.
          </div>

          <label class="form-label small">Số lượng cần xuất</label>
          <input v-model.number="exportModal.units" type="number" class="form-control mb-3" min="1"
            :max="exportModal.maxUnits" />

          <label class="form-label small">Lý do</label>
          <textarea v-model="exportModal.reason" rows="3" class="form-control"
            placeholder="VD: Cấp cứu, điều phối, xuất lô gần hết hạn trước..."></textarea>
        </div>

        <div class="modal-footer border-top d-flex justify-content-end gap-2">
          <button class="btn btn-light" @click="closeExportModal" :disabled="loadingExport">Hủy</button>
          <button class="btn btn-dark" @click="submitExport" :disabled="loadingExport">
            <span v-if="loadingExport" class="spinner-border spinner-border-sm me-2"></span>
            Xác nhận xuất
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "BloodInventoryByTypeView",

  data() {
    return {
      bloodType: "",
      loading: false,
      loadingExport: false,
      group: {},
      batches: [],
      fefoBatch: null,
      selectedStatus: "all",
      selectedExpiry: "all",
      exportModal: {
        open: false,
        batchId: null,
        units: 1,
        maxUnits: 0,
        reason: "",
      },
    };
  },

  computed: {
    typeLabel() {
      return this.normalizeType(this.bloodType);
    },

    filteredBatches() {
      return (this.batches || []).filter((b) => {
        const matchStatus = this.selectedStatus === "all" || b.status === this.selectedStatus;
        const matchExpiry = this.selectedExpiry === "all" || b.expiry_status === this.selectedExpiry;
        return matchStatus && matchExpiry;
      });
    },

    summaryCards() {
      return [
        {
          label: "Khả dụng",
          value: `${this.group.available_units || 0} túi`,
          sub: `${this.group.available_batches || 0} lô`,
          icon: "bi bi-droplet-half",
          class: "icon-danger",
        },
        {
          label: "Đang kiểm định",
          value: `${this.group.testing_units || 0} túi`,
          sub: `${this.group.testing_batches || 0} lô`,
          icon: "bi bi-clipboard2-pulse",
          class: "icon-primary",
        },
        {
          label: "Sắp hết hạn",
          value: `${this.group.expiring_batches || 0} lô`,
          sub: "Cần ưu tiên lô sắp hết hạn",
          icon: "bi bi-hourglass-split",
          class: "icon-warning",
        },
        {
          label: "Dự báo",
          value:
            this.group.days_remaining !== null
              ? `${Math.ceil(Number(this.group.days_remaining || 0))} ngày`
              : "-",
          sub: `TB dùng ${this.group.avg_daily_usage_7d || 0} túi/ngày`,
          icon: "bi bi-graph-down-arrow",
          class: "icon-success",
        },
      ];
    },
  },

  mounted() {
    this.bloodType = this.$route.query.type || "";
    this.loadData();
  },

  watch: {
    "$route.query.type"(val) {
      this.bloodType = val || "";
      this.loadData();
    },
  },

  methods: {
    normalizeType(value) {
      return String(value || "").trim().replace(/\s+/g, "+").toUpperCase();
    },

    async loadData() {
      const type = this.normalizeType(this.bloodType);
      if (!type) return;

      this.loading = true;
      try {
        const res = await baseRequestDoctor.get(`/doctor/blood-inventory/intelligence/group/${encodeURIComponent(type)}`);
        if (res.data.status) {
          this.group = res.data.data?.group || {};
          this.batches = res.data.data?.batches || [];
          this.fefoBatch = res.data.data?.fefo_batch || null;
        } else {
          this.$toast?.error(res.data.message || "Không tải được chi tiết nhóm máu!");
        }
      } catch (e) {
        console.error(e);
        this.$toast?.error("Lỗi tải chi tiết nhóm máu!");
      } finally {
        this.loading = false;
      }
    },

    openExportModal(batch) {
      this.exportModal = {
        open: true,
        batchId: batch.id,
        units: 1,
        maxUnits: Number(batch.units || 0),
        reason: batch.id === this.fefoBatch?.id ? "Xuất lô gần hết hạn trước" : "",
      };
    },

    closeExportModal() {
      if (this.loadingExport) return;
      this.exportModal.open = false;
    },

    async submitExport() {
      const units = Number(this.exportModal.units || 0);
      if (units <= 0) return this.$toast?.error("Số lượng xuất phải lớn hơn 0!");
      if (units > Number(this.exportModal.maxUnits || 0)) return this.$toast?.error("Số lượng xuất vượt quá tồn trong lô!");

      this.loadingExport = true;
      try {
        const res = await baseRequestDoctor.post("/doctor/blood-inventory/export", {
          inventory_id: this.exportModal.batchId,
          units,
          reason: this.exportModal.reason?.trim() || null,
        });

        if (res.data.status) {
          this.$toast?.success(res.data.message || "Xuất túi máu thành công!");
          this.exportModal.open = false;
          await this.loadData();
        } else {
          this.$toast?.error(res.data.message || "Xuất túi máu thất bại!");
        }
      } catch (e) {
        console.error(e);
        this.$toast?.error("Lỗi server khi xuất túi máu!");
      } finally {
        this.loadingExport = false;
      }
    },

    goBatch(id) {
      this.$router.push({
        name: "BloodBatchDetail",
        params: { id },
      });
    },

    batchCode(id) {
      return id ? `BL${String(id).padStart(6, "0")}` : "-";
    },

    formatDate(value) {
      if (!value) return "-";
      const text = String(value).slice(0, 10);
      const parts = text.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
      }
      return "-";
    },

    statusBadgeClass(status) {
      return {
        critical: "bg-danger",
        low: "bg-secondary",
        normal: "bg-success",
        overstock: "bg-info text-dark",
        expiring_risk: "bg-warning text-dark",
      }[status] || "bg-light text-dark border";
    },

    dbStatusClass(status) {
      return {
        available: "bg-success",
        testing: "bg-primary",
        discarded: "bg-secondary",
        expired: "bg-danger",
      }[status] || "bg-light text-dark border";
    },

    dbStatusText(status) {
      return {
        available: "Có thể sử dụng",
        testing: "Đang kiểm định",
        discarded: "Đã loại bỏ",
        expired: "Hết hạn",
      }[status] || "Không rõ";
    },

    expiryBadgeClass(status) {
      return {
        valid: "bg-success",
        expiring_soon: "bg-warning text-dark",
        expired: "bg-danger",
        empty: "bg-secondary",
        unknown: "bg-light text-dark border",
      }[status] || "bg-light text-dark border";
    },
  },
};
</script>

<style scoped>
.group-detail-page {
  background: #f7f8fa;
}

.card {
  border-radius: 16px;
}

.metric-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
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

.icon-success {
  background: #d1e7dd;
  color: #198754;
}

.fefo-box {
  border: 1px solid #ffe08a;
  background: #fff8e1;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
}

.filter-select {
  width: 180px;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.modal-header,
.modal-footer {
  padding: 14px 16px;
}

.modal-body {
  padding: 16px;
}
</style>
