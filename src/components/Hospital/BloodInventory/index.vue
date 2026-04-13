<template>
  <div class="container-fluid py-4 min-vh-100">
    <div class="row gx-4">
      <div class="col-xl-3 col-lg-4">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h5 class="fw-bold mb-3">Nhập lô máu mới</h5>

            <form class="row g-3 align-items-end" @submit.prevent="createBloodBatch">
              <div class="col-12">
                <label class="form-label small">Nhóm máu</label>
                <select v-model="form.blood_type_id" class="form-select" :disabled="loadingCreate">
                  <option disabled value="">Chọn nhóm máu</option>
                  <option v-for="type in bloodTypes" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label small">Ngày nhập</label>
                <input v-model="form.donation_date" type="date" class="form-control" :disabled="loadingCreate" />
              </div>

              <div class="col-12">
                <label class="form-label small">Hạn sử dụng</label>
                <input v-model="form.expiry_date" type="date" class="form-control" :disabled="loadingCreate" />
              </div>

              <div class="col-12">
                <label class="form-label small">Số lượng (túi)</label>
                <input
                  v-model.number="form.units"
                  type="number"
                  class="form-control"
                  :disabled="loadingCreate"
                  placeholder="Nhập số lượng túi"
                />
              </div>

              <div class="col-12 text-end">
                <button type="submit" class="btn btn-danger mt-2" :disabled="loadingCreate">
                  <span v-if="loadingCreate" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Thêm
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>

      <div class="col-xl-9 col-lg-8">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-0 fw-bold">Tổng quan tồn kho máu</h5>
            </div>
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Nhóm máu</th>
                    <th>Tổng túi</th>
                    <th>Hạn sớm nhất</th>
                    <th>Hạn muộn nhất</th>
                    <th>Không đạt</th>
                    <th>Sắp hết hạn</th>
                    <th>Hết hạn</th>
                    <th>Tình trạng</th>
                    <th class="text-end">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="loadingList">
                    <td colspan="9" class="py-4 text-center text-muted">
                      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang tải dữ liệu...
                    </td>
                  </tr>

                  <tr v-else v-for="blood in aggregated" :key="blood.type">
                    <td class="fw-bold text-danger">{{ blood.type }}</td>
                    <td>{{ blood.total_units }}</td>
                    <td>{{ formatDateCell(blood.earliest_expiry) }}</td>
                    <td>{{ formatDateCell(blood.latest_expiry) }}</td>
                    <td>{{ blood.failed_units }}</td>
                    <td>{{ blood.expiring_count }}</td>
                    <td>{{ blood.expired_count }}</td>

                    <td>
                      <span
                        class="badge rounded-pill"
                        :class="{
                          'bg-success': blood.status === 'full',
                          'bg-warning text-dark': blood.status === 'expiring',
                          'bg-danger': blood.status === 'critical',
                          'bg-secondary': blood.status === 'low'
                        }"
                      >
                        {{ translateStatus(blood.status) }}
                      </span>
                    </td>

                    <td class="text-end">
                      <button
                        class="btn btn-sm btn-outline-primary me-2"
                        @click="$router.push({ path: '/Hospital/blood-inventory-by-type', query: { type: blood.type } })"
                      >
                        Xem
                      </button>

                      <button
                        class="btn btn-sm btn-outline-dark"
                        :disabled="blood.total_units <= 0"
                        @click="openExportModal(blood)"
                      >
                        Xuất
                      </button>
                    </td>
                  </tr>

                  <tr v-if="!loadingList && aggregated.length === 0">
                    <td colspan="9" class="py-4 text-center text-muted">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div v-if="exportModal.open" class="modal-backdrop-custom" @click.self="closeExportModal">
      <div class="modal-card">
        <div class="modal-header border-bottom">
          <div>
            <h5 class="mb-0 fw-bold">Xuất túi máu</h5>
            <div class="text-muted small mt-1">Nhóm máu: <b>{{ exportModal.typeLabel }}</b></div>
          </div>
          <button class="btn btn-sm btn-light" @click="closeExportModal" :disabled="loadingExport">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="alert alert-warning py-2 small mb-3">
            <i class="bi bi-exclamation-triangle me-1"></i>
            Hệ thống sẽ xuất theo <b>lô có hạn sớm nhất</b> trước.
          </div>

          <div class="row g-3">
            <div class="col-12">
              <label class="form-label small">Số lượng cần xuất (túi)</label>
              <input
                v-model.number="exportModal.units"
                type="number"
                class="form-control"
                min="1"
                :max="exportModal.maxUnits"
                :disabled="loadingExport"
              />
              <div class="text-muted small mt-1">
                Tồn hiện tại: <b>{{ exportModal.maxUnits }}</b> túi
              </div>
            </div>

            <div class="col-12">
              <label class="form-label small">Lý do (tuỳ chọn)</label>
              <textarea
                v-model="exportModal.reason"
                rows="3"
                class="form-control"
                placeholder="VD: Cấp cứu, chuyển kho, điều phối chiến dịch..."
                :disabled="loadingExport"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer border-top d-flex justify-content-end gap-2">
          <button class="btn btn-light" @click="closeExportModal" :disabled="loadingExport">Hủy</button>
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
  name: "BloodInventoryView",

  data() {
    return {
      list_blood: [],
      loadingList: false,
      loadingCreate: false,
      loadingExport: false,

      form: {
        blood_type_id: "",
        donation_date: "",
        expiry_date: "",
        units: "",
      },

      bloodTypes: [
        { id: 1, name: "A+" },
        { id: 2, name: "A-" },
        { id: 3, name: "B+" },
        { id: 4, name: "B-" },
        { id: 5, name: "AB+" },
        { id: 6, name: "AB-" },
        { id: 7, name: "O+" },
        { id: 8, name: "O-" },
      ],

      exportModal: {
        open: false,
        typeLabel: "",
        blood_type_id: null,
        units: 1,
        maxUnits: 0,
        reason: "",
      },
    };
  },

  computed: {
    aggregated() {
      const groups = {};
      const today = this.toDate0(new Date());

      this.bloodTypes.forEach((t) => {
        groups[t.name] = {
          type: t.name,
          total_units: 0,
          failed_units: 0,        // 👈 số túi không đạt
          earliest_expiry: null,
          latest_expiry: null,
          expiring_count: 0,
          expired_count: 0,
          status: "full",
        };
      });

      (this.list_blood || []).forEach((batch) => {
        const type = (batch.blood_type?.abo || "") + (batch.blood_type?.rh || "");
        if (!type || !groups[type]) return;

        const g = groups[type];
        const units = Number(batch.units || 0);
        const exp = this.toDate0(batch.expiry_date);

        if (units > 0) g.total_units += units;

        // 👉 nếu batch có quality_note (VD: "Không đạt sàng lọc") thì cộng vào failed_units
        if (batch.quality_note && units > 0) {
          g.failed_units += units;
        }

        if (units > 0 && exp) {
          if (!g.earliest_expiry || exp < this.toDate0(g.earliest_expiry)) g.earliest_expiry = batch.expiry_date;
          if (!g.latest_expiry || exp > this.toDate0(g.latest_expiry)) g.latest_expiry = batch.expiry_date;

          if (exp < today) g.expired_count += 1;
          else {
            const days = (exp - today) / (1000 * 3600 * 24);
            if (days <= 3) g.expiring_count += 1;
          }
        }
      });

      Object.values(groups).forEach((g) => {
        if (g.total_units <= 0) g.status = "critical";
        else if (g.expired_count > 0) g.status = "critical";
        else if (g.expiring_count > 0) g.status = "expiring";
        else if (g.total_units < 5) g.status = "low";
        else g.status = "full";
      });

      return Object.values(groups);
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    async loadData() {
      this.loadingList = true;
      try {
        const res = await baseRequestDoctor.get("/doctor/blood-inventory");
        if (res.data.status) {
          this.list_blood = res.data.data || [];
        } else {
          this.$toast?.error(res.data.message || "Không thể tải danh sách kho máu!");
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingList = false;
      }
    },

    async createBloodBatch() {
      if (!this.form.blood_type_id || !this.form.donation_date || !this.form.expiry_date) {
        this.$toast?.error("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      if (!this.form.units || Number(this.form.units) <= 0) {
        this.$toast?.error("Số lượng túi máu phải lớn hơn 0!");
        return;
      }

      this.loadingCreate = true;
      try {
        const res = await baseRequestDoctor.post("/doctor/blood-inventory", this.form);
        
        if (res.data.status) {
          this.$toast?.success(res.data.message || "Thêm lô máu thành công!");
          await this.loadData();
          this.form = { blood_type_id: "", donation_date: "", expiry_date: "", units: "" };
        } else {
          this.$toast?.error(res.data.message || "Không thể thêm lô máu!");
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingCreate = false;
      }
    },

    getTypeIdByLabel(label) {
      const found = this.bloodTypes.find((x) => x.name === label);
      return found ? found.id : null;
    },

    openExportModal(row) {
      const id = this.getTypeIdByLabel(row.type);
      if (!id) return this.$toast?.error("Không xác định được blood_type_id từ nhóm máu!");

      this.exportModal = {
        open: true,
        typeLabel: row.type,
        blood_type_id: id,
        units: 1,
        maxUnits: row.total_units || 0,
        reason: "",
      };
    },

    closeExportModal() {
      if (this.loadingExport) return;
      this.exportModal.open = false;
    },

    async submitExport() {
      if (!this.exportModal.blood_type_id) return this.$toast?.error("Thiếu nhóm máu để xuất!");
      if (!this.exportModal.units || this.exportModal.units <= 0) return this.$toast?.error("Số lượng xuất phải lớn hơn 0!");
      if (this.exportModal.units > this.exportModal.maxUnits) return this.$toast?.error("Số lượng xuất vượt quá tồn hiện tại!");

      this.loadingExport = true;
      try {
        const payload = {
          blood_type_id: this.exportModal.blood_type_id,
          units: this.exportModal.units,
          reason: this.exportModal.reason?.trim() || null,
        };

        const res = await baseRequestDoctor.post("/doctor/blood-inventory/export", payload);

        if (res.data.status) {
          this.$toast?.success(res.data.message || "Xuất túi máu thành công!");
          this.exportModal.open = false;
          await this.loadData();
        } else {
          this.$toast?.error(res.data.message || "Xuất túi máu thất bại!");
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingExport = false;
      }
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

    formatDateCell(date) {
      if (!date) return "-";
      const dt = this.toDate0(date);
      return dt ? dt.toLocaleDateString("vi-VN") : "-";
    },

    translateStatus(status) {
      return {
        full: "Đầy đủ",
        expiring: "Sắp hết hạn",
        critical: "Cần nhập",
        low: "Ít máu",
      }[status] || "Không xác định";
    },
  },
};
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
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
