<template>
  <div class="container-fluid py-4 min-vh-100">
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <div>
          <h4 class="fw-bold mb-1">Nhóm máu: {{ typeLabel }}</h4>
          <p class="text-muted mb-0">Danh sách các lô máu thuộc nhóm {{ typeLabel }}</p>
        </div>

        <div class="d-flex align-items-center">
          <select v-model="selectedStatus" class="form-select form-select-sm me-3" style="width: 170px">
            <option value="all">Tất cả</option>
            <option value="full">Đầy đủ</option>
            <option value="low">Ít máu (Dưới 5)</option>
            <option value="expiring">Sắp hết hạn</option>
            <option value="expired">Đã hết hạn</option>
          </select>

          <router-link class="btn btn-secondary btn-sm" to="/Hospital/blood-inventory">
            <i class="bi bi-arrow-left me-1"></i>Quay lại
          </router-link>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 table-batches">
            <thead class="table-light">
              <tr>
                <th>ID Lô máu</th>
                <th>Số lượng</th>
                <th>Ngày nhập</th>
                <th>Hạn sử dụng</th>
                <th class="text-center">Tình trạng</th>
                <th>Chi tiết</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="batch in filteredList" :key="batch.id">
                <!-- ID lô máu: nếu lô KHÔNG ĐẠT thì tô vàng -->
                <td :class="['fw-bold', batch.quality_note ? 'text-warning' : '']">
                  BL{{ batch.id.toString().padStart(6, '0') }}
                </td>

                <td>
                  <!-- chữ đen -->
                  <span class="fw-bold text-dark">{{ batch.units }} túi</span>
                </td>

                <td>{{ formatDate(batch.donation_date) }}</td>

                <td :class="{ 'text-danger fw-bold': isExpired(batch.expiry_date) }">
                  {{ formatDate(batch.expiry_date) }}
                  <i v-if="isExpired(batch.expiry_date)" class="bi bi-exclamation-circle-fill ms-1"
                    title="Đã hết hạn"></i>
                </td>

                <td class="text-center">
                  <span class="badge rounded-pill" :class="statusBadgeClass(batch.ui_status)">
                    {{ translateStatus(batch.ui_status) }}
                  </span>
                </td>

                <td>
                  <button class="btn btn-sm btn-primary me-2"
                    @click="$router.push({ name: 'BloodBatchDetail', params: { id: batch.id } })">
                    Xem
                  </button>

                  <button class="btn btn-danger btn-sm" :disabled="Number(batch.units || 0) <= 0 || loadingExport"
                    @click="openExportModal(batch)">
                    Xuất
                  </button>
                </td>
              </tr>

              <tr v-if="filteredList.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  Không có lô máu nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL XUẤT TÚI MÁU (giống bên tổng quan) -->
    <div v-if="exportModal.open" class="modal-backdrop-custom" @click.self="closeExportModal">
      <div class="modal-card">
        <div class="modal-header border-bottom">
          <div>
            <h5 class="mb-0 fw-bold">Xuất túi máu</h5>
            <div class="text-muted small mt-1">
              Nhóm máu: <b>{{ typeLabel }}</b> ·
              Lô: <b>BL{{ String(exportModal.batchId).padStart(6, '0') }}</b>
            </div>
          </div>
          <button class="btn btn-sm btn-light" @click="closeExportModal" :disabled="loadingExport">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label small">Số lượng cần xuất (túi)</label>
              <input v-model.number="exportModal.units" type="number" class="form-control" min="1"
                :max="exportModal.maxUnits" :disabled="loadingExport" />
              <div class="text-muted small mt-1">
                Tồn trong lô: <b>{{ exportModal.maxUnits }}</b> túi
              </div>
            </div>

            <div class="col-12">
              <label class="form-label small">Lý do (tuỳ chọn)</label>
              <textarea v-model="exportModal.reason" rows="3" class="form-control"
                placeholder="VD: Cấp cứu, chuyển kho, tiêu huỷ túi máu không đạt chuẩn..."
                :disabled="loadingExport"></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer border-top d-flex justify-content-end gap-2">
          <button class="btn btn-light" @click="closeExportModal" :disabled="loadingExport">
            Hủy
          </button>
          <button class="btn btn-dark" @click="submitExport" :disabled="loadingExport">
            <span v-if="loadingExport" class="spinner-border spinner-border-sm me-2" role="status"></span>
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
      selectedStatus: "all",
      rawList: [],
      loading: false,

      loadingExport: false,
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

    mappedList() {
      return (this.rawList || []).map((b) => ({
        ...b,
        ui_status: this.computeUiStatus(b),
      }));
    },

    filteredList() {
      const activeBatches = this.mappedList.filter(
        (b) => Number(b.units || 0) > 0
      );
      if (this.selectedStatus === "all") return activeBatches;
      return activeBatches.filter((b) => b.ui_status === this.selectedStatus);
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
    normalizeType(x) {
      return (x || "").trim().replace(/\s+/g, "+");
    },

    async loadData() {
      const type = this.normalizeType(this.bloodType);
      if (!type) {
        this.rawList = [];
        return;
      }

      this.loading = true;
      try {
        const res = await baseRequestDoctor.post(
          "/doctor/blood-inventory/filter",
          {
            bloodType: type,
            status: "all",
          }
        );

        if (res.data.status) {
          this.rawList = res.data.data || [];
        } else {
          this.rawList = [];
          this.$toast?.info(res.data.message || "Không tìm thấy lô máu!");
        }
      } catch (e) {
        this.$toast?.error("Lỗi tải dữ liệu!");
        this.rawList = [];
      } finally {
        this.loading = false;
      }
    },

    openExportModal(batch) {
      if (!batch || !batch.id) return;

      const maxUnits = Number(batch.units || 0);
      if (maxUnits <= 0) {
        this.$toast?.error("Lô này không còn túi để xuất!");
        return;
      }

      this.exportModal = {
        open: true,
        batchId: batch.id,
        units: 1,
        maxUnits,
        reason: batch.quality_note
          ? `Tiêu huỷ túi máu không đạt chuẩn: ${batch.quality_note}`
          : "",
      };
    },

    closeExportModal() {
      if (this.loadingExport) return;
      this.exportModal.open = false;
    },

    async submitExport() {
      if (!this.exportModal.batchId) {
        this.$toast?.error("Không xác định được lô máu để xuất!");
        return;
      }

      const u = Number(this.exportModal.units || 0);
      if (u <= 0) {
        this.$toast?.error("Số lượng xuất phải lớn hơn 0!");
        return;
      }
      if (u > this.exportModal.maxUnits) {
        this.$toast?.error("Số lượng xuất vượt quá số túi trong lô!");
        return;
      }

      this.loadingExport = true;
      try {
        const payload = {
          inventory_id: this.exportModal.batchId, // xuất theo lô cụ thể
          units: u,
          reason: this.exportModal.reason?.trim() || null,
        };

        const res = await baseRequestDoctor.post(
          "/doctor/blood-inventory/export",
          payload
        );

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

    computeUiStatus(batch) {
      const units = Number(batch?.units || 0);
      const today = this.toDate0(new Date());
      const exp = this.toDate0(batch?.expiry_date);

      if (exp && exp < today) return "expired";

      if (exp) {
        const days = (exp - today) / (1000 * 3600 * 24);
        if (days <= 3) return "expiring";
      }

      if (units < 5) return "low";
      return "full";
    },

    statusBadgeClass(ui) {
      return {
        full: "bg-success",
        low: "bg-secondary",
        expiring: "bg-warning text-dark",
        expired: "bg-danger",
      }[ui] || "bg-secondary";
    },

    translateStatus(ui) {
      return {
        full: "Đầy đủ",
        low: "Ít máu",
        expiring: "Sắp hết hạn",
        expired: "Hết hạn",
      }[ui] || "Không rõ";
    },

    isExpired(dateStr) {
      const today = this.toDate0(new Date());
      const exp = this.toDate0(dateStr);
      return exp && exp < today;
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

    formatDate(date) {
      const dt = this.toDate0(date);
      return dt ? dt.toLocaleDateString("vi-VN") : "-";
    },
  },
};
</script>

<style scoped>
.breadcrumb a {
  color: #dc3545;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

/* Cho table phủ đều card hơn (các cột chia đều) */
.table-batches {
  width: 100%;
  table-layout: fixed;
}

/* Giữ căn giữa dọc, giống align-middle */
.table-batches th,
.table-batches td {
  vertical-align: middle;
}

/* Modal giống màn tổng quan */
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
