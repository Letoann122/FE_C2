<template>
  <div class="container-fluid py-4 blood-admin-dashboard">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-1">🩸 Quản lý kho máu (Admin)</h3>
      </div>
    </div>

    <!-- TOP CARDS -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-6 col-lg-3" v-for="(card, idx) in topCards" :key="idx">
        <div class="card shadow-sm border-0 rounded-4 h-100">
          <div class="card-body d-flex align-items-center justify-content-between">
            <div>
              <h6 class="mb-1 text-muted">{{ card.title }}</h6>
              <h3 class="fw-bold mb-0">{{ card.value }}</h3>
            </div>
            <div class="display-6">{{ card.icon }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- KHO MÁU -->
    <div class="card shadow-sm border-0 rounded-4 mb-4">
      <div class="card-header bg-white py-3">
        <h5 class="fw-bold mb-0">
          <i class="bi bi-grid-3x3-gap me-2"></i>Tổng quan kho máu
        </h5>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Nhóm máu</th>
                <th>Số lượng</th>
                <th>Sắp hết hạn</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(row, index) in sortedInventorySummary" :key="row.blood_type">
                <td>{{ index + 1 }}</td>
                <th>{{ row.blood_type }}</th>
                <td>{{ row.total_units }}</td>
                <td>
                  <span
                    class="badge rounded-pill"
                    :class="row.expiring_units > 0 ? 'bg-warning text-dark' : 'bg-success'"
                  >
                    {{ row.expiring_units }}
                  </span>
                </td>
              </tr>

              <tr v-if="sortedInventorySummary.length === 0">
                <td colspan="4" class="text-center text-muted py-4">Chưa có dữ liệu kho máu.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- BIỂU ĐỒ NHẬP - XUẤT -->
    <div class="card shadow-sm border-0 rounded-4 mb-4">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="fw-bold mb-0">
          <i class="bi bi-graph-up me-2"></i>Biểu đồ nhập - xuất máu
        </h5>

        <div class="d-flex gap-2 align-items-center">
          <input
            v-model="chartFilter.from"
            type="date"
            class="form-control form-control-sm"
            style="width: 150px"
          />

          <input
            v-model="chartFilter.to"
            type="date"
            class="form-control form-control-sm"
            style="width: 150px"
          />

          <button class="btn btn-sm btn-danger" @click="filterByDate">
            Lọc
          </button>
        </div>
      </div>

      <div class="card-body" style="min-height: 260px">
        <Line :data="chartData" :options="chartOptions" height="110" />
      </div>
    </div>

    <!-- DANH SÁCH LÔ MÁU MỚI NHẬP -->
    <div class="card shadow-sm border-0 rounded-4 mb-4">
      <div class="card-header bg-white py-3">
        <h5 class="fw-bold mb-0">
          <i class="bi bi-droplet-half me-2"></i>Danh sách lô máu mới nhập
        </h5>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Mã lô</th>
                <th>Nhóm máu</th>
                <th>Số lượng</th>
                <th>Ngày nhập</th>
                <th>Hạn sử dụng</th>
                <th>Người nhập</th>
                <th class="text-nowrap" style="width: 110px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(batch, index) in latestBatches" :key="index">
                <td>{{ index + 1 }}</td>
                <td class="fw-bold">{{ formatBatchCode(batch.id) }}</td>
                <td class="fw-bold">{{ batch.blood_type }}</td>
                <td>{{ batch.units }}</td>
                <td>{{ formatDate(batch.donation_date) }}</td>
                <td>{{ formatDate(batch.expiry_date) }}</td>
                <td>{{ batch.imported_by?.full_name || "-" }}</td>
                <td class="text-nowrap">
                  <button
                    class="btn btn-sm btn-outline-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#batchDetailModal"
                    @click="openBatchDetail(batch)"
                  >
                    Xem
                  </button>
                </td>
              </tr>

              <tr v-if="latestBatches.length === 0">
                <td colspan="8" class="text-center text-muted py-4">Chưa có lô máu mới.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- NHẬT KÝ NHẬP/XUẤT KHO -->
    <div class="card shadow-sm border-0 rounded-4 mb-4">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="fw-bold mb-0">
          <i class="bi bi-journal-check me-2"></i>Nhật ký nhập/xuất kho
        </h5>

        <div class="d-flex gap-2 align-items-center">
          <select v-model="txFilters.type" class="form-select form-select-sm">
            <option value="">Tất cả</option>
            <option value="IN">Nhập</option>
            <option value="OUT">Xuất</option>
          </select>

          <input
            v-model="txFilters.q"
            type="text"
            class="form-control form-control-sm"
            style="min-width: 220px"
            placeholder="Tìm theo nhóm máu, ghi chú, người làm..."
          />

          <input v-model="txFilters.from" type="date" class="form-control form-control-sm" />
          <input v-model="txFilters.to" type="date" class="form-control form-control-sm" />
        </div>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Thời gian</th>
                <th>Loại</th>
                <th>Nhóm</th>
                <th>Số lượng</th>
                <th>Ghi chú</th>
                <th>Bởi</th>
                <th class="text-nowrap" style="width: 110px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tx, index) in paginatedTransactions" :key="index">
                <td>{{ (txPage - 1) * txPageSize + index + 1 }}</td>
                <td style="white-space: nowrap">{{ formatDateTime(tx.occurred_at) }}</td>
                <td>
                  <span class="badge" :class="tx.tx_type === 'IN' ? 'bg-success' : 'bg-danger'">
                    {{ txLabel(tx.tx_type) }}
                  </span>
                </td>
                <td class="fw-bold">{{ tx.blood_type }}</td>
                <td>{{ tx.units }}</td>
                <td>{{ tx.reason || "-" }}</td>
                <td>{{ tx.by?.full_name || "-" }}</td>
                <td class="text-nowrap">
                  <button
                    class="btn btn-sm btn-outline-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#txDetailModal"
                    @click="openTxDetail(tx)"
                  >
                    Xem
                  </button>
                </td>
              </tr>

              <tr v-if="filteredTransactions.length === 0">
                <td colspan="8" class="text-center text-muted py-4">Không có giao dịch phù hợp.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-footer bg-white d-flex justify-content-end">
        <div class="d-flex gap-2 align-items-center">
          <button class="btn btn-sm btn-outline-secondary" :disabled="txPage === 1" @click="txPage -= 1">Trước</button>
          <span class="small">Trang {{ txPage }} / {{ txTotalPages }}</span>
          <button class="btn btn-sm btn-outline-secondary" :disabled="txPage === txTotalPages" @click="txPage += 1">
            Sau
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: Batch detail -->
  <div class="modal fade" id="batchDetailModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">Chi tiết lô máu</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="border rounded-3 p-3 h-100">
                <div class="text-muted small">Mã lô</div>
                <div class="fw-bold">{{ formatBatchCode(activeBatch.id) }}</div>
                <hr />
                <div class="text-muted small">Nhóm máu</div>
                <div class="fw-bold">{{ activeBatch.blood_type || "-" }}</div>
                <hr />
                <div class="text-muted small">Số lượng</div>
                <div class="fw-bold">{{ activeBatch.units ?? "-" }}</div>
              </div>
            </div>

            <div class="col-md-8">
              <div class="border rounded-3 p-3 h-100">
                <div class="row">
                  <div class="col-md-6">
                    <div class="text-muted small">Ngày nhập</div>
                    <div class="fw-semibold">{{ formatDate(activeBatch.donation_date) }}</div>
                  </div>
                  <div class="col-md-6">
                    <div class="text-muted small">Hạn sử dụng</div>
                    <div class="fw-semibold">{{ formatDate(activeBatch.expiry_date) }}</div>
                  </div>
                </div>

                <hr />

                <div class="row">
                  <div class="col-md-6">
                    <div class="text-muted small">Người nhập</div>
                    <div class="fw-semibold">{{ activeBatch.imported_by?.full_name || "-" }}</div>
                  </div>
                  <div class="col-md-6">
                    <div class="text-muted small">Hospital</div>
                    <div class="fw-semibold">{{ activeBatch.hospital_name || "-" }}</div>
                  </div>
                </div>

                <hr />

                <div class="text-muted small">Người hiến (username)</div>
                <div class="fw-semibold">{{ activeBatch.donor_username || "-" }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: Transaction detail -->
  <div class="modal fade" id="txDetailModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">Chi tiết giao dịch kho</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="border rounded-3 p-3 h-100">
                <div class="text-muted small">Mã giao dịch</div>
                <div class="fw-bold">{{ activeTx.id || "-" }}</div>
                <hr />
                <div class="text-muted small">Loại</div>
                <div>
                  <span class="badge" :class="activeTx.tx_type === 'IN' ? 'bg-success' : 'bg-danger'">
                    {{ txLabel(activeTx.tx_type) }}
                  </span>
                </div>
                <hr />
                <div class="text-muted small">Thời gian</div>
                <div class="fw-semibold">{{ formatDateTime(activeTx.occurred_at) }}</div>
              </div>
            </div>

            <div class="col-md-8">
              <div class="border rounded-3 p-3 h-100">
                <div class="row">
                  <div class="col-md-6">
                    <div class="text-muted small">Nhóm máu</div>
                    <div class="fw-semibold">{{ activeTx.blood_type || "-" }}</div>
                  </div>
                  <div class="col-md-6">
                    <div class="text-muted small">Số lượng</div>
                    <div class="fw-semibold">{{ activeTx.units ?? "-" }}</div>
                  </div>
                </div>

                <hr />

                <div class="row">
                  <div class="col-md-6">
                    <div class="text-muted small">Bởi</div>
                    <div class="fw-semibold">{{ activeTx.by?.full_name || "-" }}</div>
                  </div>
                  <div class="col-md-6">
                    <div class="text-muted small">Lô máu</div>
                    <div class="fw-semibold">{{ formatBatchCode(activeTx.inventory_id) }}</div>
                  </div>
                </div>

                <hr />

                <div class="text-muted small">Ghi chú</div>
                <div class="fw-semibold">{{ activeTx.reason || "-" }}</div>

                <hr />

                <div class="text-muted small">Thông tin lô (nếu có)</div>
                <div class="fw-semibold">
                  Nhập: {{ formatDate(activeTx.batch_donation_date) }} — Hết hạn:
                  {{ formatDate(activeTx.batch_expiry_date) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestAdmin from "../../../core/baseRequestAdmin";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "vue-chartjs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default {
  name: "AdminBloodInventory",
  components: { Line },
  data() {
    return {
      chartFilter: {
        from: "",
        to: "",
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

      topCards: [
        { title: "Tổng túi máu", value: 0, icon: "🩸" },
        { title: "Nhập trong kỳ", value: 0, icon: "📥" },
        { title: "Xuất trong kỳ", value: 0, icon: "📤" },
        { title: "Sắp hết hạn", value: 0, icon: "⏳" },
      ],

      inventorySummary: [],
      latestBatches: [],
      transactions: [],

      txFilters: { type: "", q: "", from: "", to: "" },
      txPage: 1,
      txPageSize: 8,

      activeBatch: {},
      activeTx: {},

      chartData: {
        labels: [],
        datasets: [
          { label: "Nhập kho", data: [] },
          { label: "Xuất kho", data: [] },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
      },
    };
  },

  mounted() {
    this.setDefaultChartDate();
    this.loadData();
  },

  computed: {
    sortedInventorySummary() {
      const map = Object.create(null);
      (this.inventorySummary || []).forEach((row) => {
        const k = String(row.blood_type || "").toUpperCase().trim();
        if (k) map[k] = row;
      });

      const result = this.bloodTypes.map((t) => {
        const key = String(t.name || "").toUpperCase().trim();
        return (
          map[key] || {
            blood_type: t.name,
            total_units: 0,
            expiring_units: 0,
          }
        );
      });

      const hasAny = (this.inventorySummary || []).length > 0;
      return hasAny ? result : [];
    },

    filteredTransactions() {
      const type = (this.txFilters.type || "").trim().toUpperCase();
      const q = (this.txFilters.q || "").trim().toLowerCase();
      const from = this.txFilters.from ? new Date(this.txFilters.from) : null;
      const to = this.txFilters.to ? new Date(this.txFilters.to) : null;

      return (this.transactions || []).filter((tx) => {
        if (type && tx.tx_type !== type) return false;

        if (q) {
          const hay = [tx.blood_type, tx.reason, tx.by?.full_name, String(tx.id)]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }

        if (from) {
          const d = new Date(tx.occurred_at);
          d.setHours(0, 0, 0, 0);
          const f = new Date(from);
          f.setHours(0, 0, 0, 0);
          if (d < f) return false;
        }

        if (to) {
          const d = new Date(tx.occurred_at);
          d.setHours(0, 0, 0, 0);
          const t = new Date(to);
          t.setHours(0, 0, 0, 0);
          if (d > t) return false;
        }

        return true;
      });
    },

    txTotalPages() {
      const total = this.filteredTransactions.length;
      return Math.max(1, Math.ceil(total / this.txPageSize));
    },

    paginatedTransactions() {
      const page = Math.min(this.txPage, this.txTotalPages);
      const start = (page - 1) * this.txPageSize;
      return this.filteredTransactions.slice(start, start + this.txPageSize);
    },
  },

  watch: {
    txFilters: {
      deep: true,
      handler() {
        this.txPage = 1;
      },
    },
    filteredTransactions() {
      if (this.txPage > this.txTotalPages) this.txPage = this.txTotalPages;
    },
  },

  methods: {
    reload() {
      this.loadData();
    },

    setDefaultChartDate() {
      const today = new Date();
      const before = new Date();

      before.setDate(before.getDate() - 6);

      this.chartFilter.from = this.toInputDate(before);
      this.chartFilter.to = this.toInputDate(today);
    },

    toInputDate(date) {
      const d = new Date(date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd}`;
    },

    filterChartByDate() {
      if (!this.chartFilter.from || !this.chartFilter.to) {
        this.$toast.error("Vui lòng chọn đầy đủ từ ngày và đến ngày!");
        return;
      }

      const from = new Date(this.chartFilter.from);
      const to = new Date(this.chartFilter.to);

      if (from > to) {
        this.$toast.error("Từ ngày không được lớn hơn đến ngày!");
        return;
      }

      this.loadData();
    },

    txLabel(type) {
      const t = String(type || "").toUpperCase();
      if (t === "IN") return "Nhập";
      if (t === "OUT") return "Xuất";
      return t || "-";
    },

    loadData() {
      const fallback = "Không thể tải dữ liệu kho máu!";
      const params = new URLSearchParams();

      params.set("chart_mode", "date");

      if (this.chartFilter.from) {
        params.set("from", this.chartFilter.from);
      }

      if (this.chartFilter.to) {
        params.set("to", this.chartFilter.to);
      }

      baseRequestAdmin
        .get(`admin/blood-inventory/dashboard?${params.toString()}`)
        .then((res) => {
          if (res.data.status) {
            const data = res.data.data || {};

            const cards = data.cards || {};
            this.topCards = [
              { title: "Tổng túi máu", value: cards.total_units ?? 0, icon: "🩸" },
              { title: "Nhập trong kỳ", value: cards.in_units ?? 0, icon: "📥" },
              { title: "Xuất trong kỳ", value: cards.out_units ?? 0, icon: "📤" },
              { title: "Sắp hết hạn", value: cards.expiring_units ?? 0, icon: "⏳" },
            ];

            this.inventorySummary = data.inventory || [];

            const chart = data.chart || {};
            this.chartData = {
              labels: chart.labels || [],
              datasets: [
                {
                  label: "Nhập kho",
                  data: chart.in_series || [],
                  borderColor: "#dc2626",
                  backgroundColor: "rgba(220,38,38,0.15)",
                  pointBackgroundColor: "#dc2626",
                  pointBorderColor: "#dc2626",
                  borderWidth: 2,
                  tension: 0.35,
                  fill: true,
                },
                {
                  label: "Xuất kho",
                  data: chart.out_series || [],
                  borderColor: "#f59e0b",
                  backgroundColor: "rgba(245,158,11,0.18)",
                  pointBackgroundColor: "#f59e0b",
                  pointBorderColor: "#f59e0b",
                  borderWidth: 2,
                  tension: 0.35,
                  fill: true,
                },
              ],
            };

            this.latestBatches = data.latest_batches || [];
            this.transactions = data.transactions || [];
          } else {
            this.$toast.error(res.data.message || fallback);
          }
        })
        .catch((error) => {
          const message = error.response?.data?.message || fallback;
          this.$toast.error(message);
        });
    },

    openBatchDetail(batch) {
      this.activeBatch = { ...(batch || {}) };
    },

    openTxDetail(tx) {
      this.activeTx = { ...(tx || {}) };
    },

    formatBatchCode(id) {
      if (id === null || id === undefined) return "-";
      const num = Number(id);
      if (Number.isNaN(num)) return `BL${String(id)}`;
      return `BL${String(num).padStart(6, "0")}`;
    },

    formatDate(d) {
      if (!d) return "-";
      return new Date(d).toLocaleDateString("vi-VN");
    },

    formatDateTime(d) {
      if (!d) return "-";
      return new Date(d).toLocaleString("vi-VN");
    },
  },
};
</script>

<style scoped>
.table {
  font-size: 15px;
}

.modal-content {
  border-radius: 1rem;
}
</style>