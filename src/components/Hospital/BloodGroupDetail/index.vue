<template>
  <div class="container-fluid py-4 min-vh-100 group-detail-page">
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h3 class="fw-bold mb-1">Chi tiết nhóm máu {{ typeLabel }}</h3>
        <p class="text-muted mb-0">
          Theo dõi lô máu, cảnh báo sắp hết hạn, hết hạn và khuyến nghị bổ sung.
        </p>
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
                  <p class="text-muted mb-0">
                    {{ group.recommendation || autoRecommendation }}
                  </p>
                </div>

                <span class="badge rounded-pill fs-6" :class="groupStatusClass">
                  {{ groupStatusText }}
                </span>
              </div>

              <div class="alert alert-light border mt-3 mb-0">
                <i class="bi bi-lightbulb text-warning me-2"></i>
                <b>Đề xuất chiến dịch:</b>
                {{ group.campaign_suggestion || autoCampaignSuggestion }}
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <h5 class="fw-bold mb-3">Ưu tiên xuất theo FEFO</h5>

              <div
                v-if="fefoBatchFixed"
                class="fefo-box"
                @click="goBatch(fefoBatchFixed.id)"
              >
                <div class="fw-bold">{{ batchCode(fefoBatchFixed.id) }}</div>

                <div class="small text-muted">
                  Hạn:
                  {{ fefoBatchFixed.expiry_date_fmt || formatDate(fefoBatchFixed.expiry_date) }}
                  · còn {{ daysLeft(fefoBatchFixed) }} ngày
                </div>

                <div class="small mt-2">
                  Đây là lô còn hạn gần nhất trong các lô có thể sử dụng, nên ưu tiên xuất trước.
                </div>
              </div>

              <div v-else class="text-muted">
                Chưa có lô khả dụng để đề xuất ưu tiên theo FEFO.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h5 class="fw-bold mb-0">Danh sách lô máu {{ typeLabel }}</h5>
            <small class="text-muted">Lọc theo tình trạng túi máu và hạn sử dụng</small>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <select v-model="selectedStatus" class="form-select form-select-sm filter-select">
              <option value="all">Tất cả tình trạng</option>
              <option value="full">Có thể sử dụng</option>
              <option value="expiring">Sắp hết hạn</option>
              <option value="expired">Hết hạn</option>
              <option value="empty">Đã xuất hết</option>
              <option value="testing">Đang kiểm định</option>
              <option value="discarded">Đã loại bỏ</option>
            </select>

            <select v-model="selectedExpiry" class="form-select form-select-sm filter-select">
              <option value="all">Tất cả hạn dùng</option>
              <option value="valid">Còn hạn</option>
              <option value="expiring">Sắp hết hạn</option>
              <option value="expired">Đã hết hạn</option>
              <option value="empty">Đã xuất hết</option>
              <option value="not_applicable">Không áp dụng</option>
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
                  <td class="fw-bold text-danger">
                    {{ batchCode(batch.id) }}
                  </td>

                  <td>{{ Number(batch.units || 0) }} túi</td>

                  <td>
                    {{ batch.donation_date_fmt || formatDate(batch.donation_date) }}
                  </td>

                  <td>
                    <span :class="{ 'text-danger fw-bold': computeUiStatus(batch) === 'expired' }">
                      {{ batch.expiry_date_fmt || formatDate(batch.expiry_date) }}
                    </span>
                  </td>

                  <td>
                    <span class="badge rounded-pill" :class="statusBadgeClass(computeUiStatus(batch))">
                      {{ translateUiStatus(computeUiStatus(batch)) }}
                    </span>
                  </td>

                  <td>
                    <span class="badge rounded-pill" :class="expiryBadgeClass(computeExpiryStatus(batch))">
                      {{ translateExpiryStatus(computeExpiryStatus(batch)) }}
                    </span>
                  </td>

                  <td>
                    <span
                      v-if="batch.id === fefoBatchFixed?.id"
                      class="badge bg-warning text-dark"
                    >
                      Ưu tiên
                    </span>

                    <span v-else class="text-muted">-</span>
                  </td>

                  <td class="text-end">
                    <button
                      class="btn btn-sm btn-outline-primary me-2"
                      @click="goBatch(batch.id)"
                    >
                      Chi tiết
                    </button>

                    <button
                      class="btn btn-sm btn-outline-dark"
                      :disabled="!canExportBatch(batch)"
                      @click="openExportModal(batch)"
                    >
                      Xuất
                    </button>
                  </td>
                </tr>

                <tr v-if="filteredBatches.length === 0">
                  <td colspan="8" class="text-center text-muted py-4">
                    Không có lô máu phù hợp
                  </td>
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
            <div class="text-muted small mt-1">
              Lô: <b>{{ batchCode(exportModal.batchId) }}</b>
            </div>
          </div>

          <button class="btn btn-sm btn-light" @click="closeExportModal" :disabled="loadingExport">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="alert alert-warning small">
            <i class="bi bi-exclamation-triangle me-1"></i>
            Nên ưu tiên xuất lô có hạn sử dụng gần nhất theo FEFO.
          </div>

          <label class="form-label small">Số lượng cần xuất</label>
          <input
            v-model.number="exportModal.units"
            type="number"
            class="form-control mb-3"
            min="1"
            :max="exportModal.maxUnits"
          />

          <label class="form-label small">Lý do</label>
          <textarea
            v-model="exportModal.reason"
            rows="3"
            class="form-control"
            placeholder="VD: Cấp cứu, điều phối, xuất lô gần hết hạn trước..."
          ></textarea>
        </div>

        <div class="modal-footer border-top d-flex justify-content-end gap-2">
          <button class="btn btn-light" @click="closeExportModal" :disabled="loadingExport">
            Hủy
          </button>

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

      expireWarningDays: 7,

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

    mappedBatches() {
      return (this.batches || []).map((batch) => ({
        ...batch,
        ui_status: this.computeUiStatus(batch),
        expiry_ui_status: this.computeExpiryStatus(batch),
        days_left_fixed: this.daysLeft(batch),
      }));
    },

    usableBatches() {
      return this.mappedBatches.filter((batch) => {
        return ["full", "expiring"].includes(batch.ui_status);
      });
    },

    testingBatches() {
      return this.mappedBatches.filter((batch) => batch.ui_status === "testing");
    },

    discardedBatches() {
      return this.mappedBatches.filter((batch) => batch.ui_status === "discarded");
    },

    expiredBatches() {
      return this.mappedBatches.filter((batch) => batch.ui_status === "expired");
    },

    emptyBatches() {
      return this.mappedBatches.filter((batch) => batch.ui_status === "empty");
    },

    expiringBatches() {
      return this.mappedBatches.filter((batch) => batch.ui_status === "expiring");
    },

    usableUnits() {
      return this.usableBatches.reduce((sum, batch) => {
        return sum + Number(batch.units || 0);
      }, 0);
    },

    testingUnits() {
      return this.testingBatches.reduce((sum, batch) => {
        return sum + Number(batch.units || 0);
      }, 0);
    },

    fefoBatchFixed() {
      const list = [...this.usableBatches];

      list.sort((a, b) => {
        const da = this.toDate0(a.expiry_date)?.getTime() || 0;
        const db = this.toDate0(b.expiry_date)?.getTime() || 0;

        if (da !== db) return da - db;

        return Number(a.id || 0) - Number(b.id || 0);
      });

      return list[0] || null;
    },

    filteredBatches() {
      return this.mappedBatches.filter((batch) => {
        const matchStatus =
          this.selectedStatus === "all" || batch.ui_status === this.selectedStatus;

        const matchExpiry =
          this.selectedExpiry === "all" ||
          batch.expiry_ui_status === this.selectedExpiry;

        return matchStatus && matchExpiry;
      });
    },

    groupStatusText() {
      if (this.usableUnits <= 0) return "Cần nhập";
      if (this.expiredBatches.length > 0) return "Có lô hết hạn";
      if (this.expiringBatches.length > 0) return "Sắp hết hạn";
      return "Ổn định";
    },

    groupStatusClass() {
      if (this.usableUnits <= 0) return "bg-danger";
      if (this.expiredBatches.length > 0) return "bg-danger";
      if (this.expiringBatches.length > 0) return "bg-warning text-dark";
      return "bg-success";
    },

    autoRecommendation() {
      if (this.usableUnits <= 0) {
        return `Nhóm máu ${this.typeLabel} đang hết túi khả dụng, cần bổ sung sớm.`;
      }

      if (this.expiredBatches.length > 0) {
        return `Nhóm máu ${this.typeLabel} có lô đã hết hạn, cần kiểm tra và xử lý.`;
      }

      if (this.expiringBatches.length > 0) {
        return `Nhóm máu ${this.typeLabel} có lô sắp hết hạn, cần ưu tiên xuất/sử dụng trước.`;
      }

      return `Nhóm máu ${this.typeLabel} đang ở mức ổn định.`;
    },

    autoCampaignSuggestion() {
      if (this.usableUnits <= 0) {
        return "Nên tạo chiến dịch hoặc kêu gọi donor phù hợp để bổ sung kho máu.";
      }

      if (this.expiringBatches.length > 0) {
        return "Nên ưu tiên điều phối/xuất các lô sắp hết hạn trước khi nhập thêm.";
      }

      return "Chưa cần tạo chiến dịch bổ sung ngay.";
    },

    summaryCards() {
      return [
        {
          label: "Khả dụng",
          value: `${this.usableUnits} túi`,
          sub: `${this.usableBatches.length} lô`,
          icon: "bi bi-droplet-half",
          class: "icon-danger",
        },
        {
          label: "Đang kiểm định",
          value: `${this.testingUnits} túi`,
          sub: `${this.testingBatches.length} lô`,
          icon: "bi bi-clipboard2-pulse",
          class: "icon-primary",
        },
        {
          label: "Sắp hết hạn",
          value: `${this.expiringBatches.length} lô`,
          sub: `Cảnh báo trong ${this.expireWarningDays} ngày tới`,
          icon: "bi bi-hourglass-split",
          class: "icon-warning",
        },
        {
          label: "Hết hạn / Xuất hết",
          value: `${this.expiredBatches.length + this.emptyBatches.length} lô`,
          sub: `${this.expiredBatches.length} hết hạn · ${this.emptyBatches.length} xuất hết`,
          icon: "bi bi-exclamation-triangle",
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
        const res = await baseRequestDoctor.get(
          `/doctor/blood-inventory/intelligence/group/${encodeURIComponent(type)}`
        );

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

    computeUiStatus(batch) {
      const units = Number(batch?.units || 0);
      const dbStatus = String(batch?.status || "").toLowerCase();
      const today = this.toDate0(new Date());
      const exp = this.toDate0(batch?.expiry_date);

      if (dbStatus === "testing") return "testing";

      if (dbStatus === "discarded") return "discarded";

      if (units <= 0) return "empty";

      if (dbStatus === "expired") return "expired";

      if (exp && exp < today) return "expired";

      if (exp) {
        const days = (exp - today) / (1000 * 3600 * 24);

        if (days <= this.expireWarningDays) {
          return "expiring";
        }
      }

      return "full";
    },

    computeExpiryStatus(batch) {
      const status = this.computeUiStatus(batch);

      if (status === "empty") return "empty";
      if (status === "expired") return "expired";
      if (status === "testing" || status === "discarded") return "not_applicable";
      if (status === "expiring") return "expiring";

      return "valid";
    },

    canExportBatch(batch) {
      const status = this.computeUiStatus(batch);

      return ["full", "expiring"].includes(status);
    },

    openExportModal(batch) {
      if (!this.canExportBatch(batch)) {
        this.$toast?.error("Lô máu này không đủ điều kiện để xuất!");
        return;
      }

      this.exportModal = {
        open: true,
        batchId: batch.id,
        units: 1,
        maxUnits: Number(batch.units || 0),
        reason: batch.id === this.fefoBatchFixed?.id ? "Xuất theo FEFO" : "",
      };
    },

    closeExportModal() {
      if (this.loadingExport) return;
      this.exportModal.open = false;
    },

    async submitExport() {
      const units = Number(this.exportModal.units || 0);

      if (units <= 0) {
        return this.$toast?.error("Số lượng xuất phải lớn hơn 0!");
      }

      if (units > Number(this.exportModal.maxUnits || 0)) {
        return this.$toast?.error("Số lượng xuất vượt quá tồn trong lô!");
      }

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

    toDate0(input) {
      if (!input) return null;

      const s = typeof input === "string" ? input : null;

      if (s && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        dt.setHours(0, 0, 0, 0);
        return dt;
      }

      const dt = new Date(input);

      if (Number.isNaN(dt.getTime())) return null;

      dt.setHours(0, 0, 0, 0);
      return dt;
    },

    daysLeft(batch) {
      const today = this.toDate0(new Date());
      const exp = this.toDate0(batch?.expiry_date);

      if (!exp || !today) return null;

      return Math.ceil((exp - today) / (1000 * 3600 * 24));
    },

    formatDate(value) {
      if (!value) return "-";

      const dt = this.toDate0(value);

      return dt ? dt.toLocaleDateString("vi-VN") : "-";
    },

    statusBadgeClass(status) {
      return {
        full: "bg-success",
        expiring: "bg-warning text-dark",
        expired: "bg-danger",
        empty: "bg-secondary",
        testing: "bg-primary",
        discarded: "bg-dark",
      }[status] || "bg-light text-dark border";
    },

    translateUiStatus(status) {
      return {
        full: "Có thể sử dụng",
        expiring: "Sắp hết hạn",
        expired: "Hết hạn",
        empty: "Đã xuất hết",
        testing: "Đang kiểm định",
        discarded: "Đã loại bỏ",
      }[status] || "Không rõ";
    },

    expiryBadgeClass(status) {
      return {
        valid: "bg-success",
        expiring: "bg-warning text-dark",
        expired: "bg-danger",
        empty: "bg-secondary",
        not_applicable: "bg-light text-dark border",
      }[status] || "bg-light text-dark border";
    },

    translateExpiryStatus(status) {
      return {
        valid: "Còn hạn",
        expiring: "Sắp hết hạn",
        expired: "Đã hết hạn",
        empty: "Đã xuất hết",
        not_applicable: "Không áp dụng",
      }[status] || "Không rõ";
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
  width: 190px;
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