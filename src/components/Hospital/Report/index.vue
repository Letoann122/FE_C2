<template>
  <div class="container-fluid py-3">
    <!-- Header -->
    <div class="mb-4 d-flex flex-wrap align-items-start justify-content-between gap-2">
      <div>
        <h2 class="fw-bold mb-1">Báo cáo & Thống kê</h2>
        <p class="text-muted mb-0">
          Theo dõi chi tiết tình hình kho máu, lịch hẹn và hiệu suất chiến dịch
          theo khoảng thời gian.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2"></div>
    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger rounded-4 shadow-sm">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
    </div>

    <!-- ================== 1) INVENTORY IN/OUT LINE ================== -->
    <div class="card shadow-sm border-0 mb-4 rounded-4">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center rounded-top-4">
        <h5 class="card-title fw-bold mb-0">
          <i class="bi bi-graph-up me-2"></i>Biểu đồ nhập - xuất máu
        </h5>

        <div class="btn-group" role="group" aria-label="Inventory range">
          <button
            class="btn btn-sm"
            :class="range === '7d' ? 'btn-danger' : 'btn-outline-secondary'"
            @click="setRange('7d')"
            :disabled="loading"
          >
            7 ngày
          </button>
          <button
            class="btn btn-sm"
            :class="range === '1m' ? 'btn-danger' : 'btn-outline-secondary'"
            @click="setRange('1m')"
            :disabled="loading"
          >
            30 ngày
          </button>
          <button
            class="btn btn-sm"
            :class="range === '3m' ? 'btn-danger' : 'btn-outline-secondary'"
            @click="setRange('3m')"
            :disabled="loading"
          >
            3 tháng
          </button>
          <button
            class="btn btn-sm"
            :class="range === '1y' ? 'btn-danger' : 'btn-outline-secondary'"
            @click="setRange('1y')"
            :disabled="loading"
          >
            1 năm
          </button>
        </div>
      </div>

      <div class="card-body p-4">
        <div class="w-100" style="height: 340px">
          <Line v-if="hasInventoryTrend" :data="inventoryLineData" :options="inventoryLineOptions" />
          <div v-else class="text-center py-5 bg-light rounded-4 border">
            <p class="text-muted mb-0">Chưa có dữ liệu nhập/xuất trong khoảng thời gian này.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ================== 2) APPOINTMENTS DONUT + CAMPAIGN PERFORMANCE ================== -->
    <div class="row g-4 mb-4 align-items-stretch">
      <!-- Left -->
      <div class="col-lg-5">
        <div class="card shadow-sm border-0 h-100 rounded-4">
          <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center rounded-top-4">
            <h5 class="card-title fw-bold mb-0">
              <i class="bi bi-pie-chart-fill me-2"></i>Thống kê Lịch hẹn
            </h5>
            <span class="badge bg-light text-dark border">{{ rangeLabel }}</span>
          </div>

          <div class="card-body d-flex flex-column gap-3">
            <!-- Donut -->
            <div class="w-100" style="height: 260px">
              <Doughnut
                v-if="hasAppointmentSummary"
                :data="appointmentDonutData"
                :options="appointmentDonutOptions"
              />
              <div v-else class="text-center py-4 bg-light rounded-4 border">
                <p class="text-muted mb-0">Chưa có dữ liệu lịch hẹn trong khoảng thời gian này.</p>
              </div>
            </div>

            <!-- KPI -->
            <div class="row g-3">
              <div class="col-6">
                <div class="p-3 bg-light rounded-4 text-center border">
                  <h4 class="fw-bold mb-1">{{ kpi.pending }}</h4>
                  <small class="text-muted">Chờ duyệt (REQUESTED)</small>
                </div>
              </div>
              <div class="col-6">
                <div class="p-3 bg-light rounded-4 text-center border">
                  <h4 class="fw-bold mb-1">{{ kpi.completionRate }}%</h4>
                  <small class="text-muted">Tỷ lệ hoàn thành</small>
                </div>
              </div>
            </div>

            <!-- badge tổng trạng thái -->
            <div class="d-flex flex-wrap gap-2 justify-content-center mt-3">
              <span class="badge rounded-pill bg-secondary">Chờ duyệt: {{ apCount.requested }}</span>
              <span class="badge rounded-pill bg-primary">Đã duyệt: {{ apCount.approved }}</span>
              <span class="badge rounded-pill bg-success">Hoàn thành: {{ apCount.completed }}</span>
              <span class="badge rounded-pill bg-danger">Từ chối: {{ apCount.rejected }}</span>
              <span class="badge rounded-pill bg-warning text-dark">Đã huỷ: {{ apCount.cancelled }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right -->
      <div class="col-lg-7">
        <div class="card shadow-sm border-0 h-100 rounded-4">
          <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center rounded-top-4">
            <h5 class="card-title fw-bold mb-0">
              <i class="bi bi-clipboard-data-fill me-2"></i>Hiệu suất chiến dịch
            </h5>
            <span class="badge bg-light text-dark border">{{ rangeLabel }}</span>
          </div>

          <div class="card-body">
            <div class="w-100" style="height: 260px">
              <Bar v-if="hasCampaigns" :data="campaignBarData" :options="campaignBarOptions" />
              <div v-else class="text-center py-5 bg-light rounded-4 border">
                <p class="text-muted mb-0">
                  Chưa có chiến dịch hoặc chưa có dữ liệu trong khoảng thời gian này.
                </p>
              </div>
            </div>

            <!-- Scroll list campaign -->
            <div class="mt-3 overflow-auto" style="max-height: 285px">
              <div v-if="campaignList.length">
                <div v-for="c in campaignList" :key="c.id" class="mb-3 p-3 bg-light rounded-4">
                  <div class="d-flex justify-content-between align-items-center gap-2">
                    <div class="fw-bold text-truncate" style="max-width: 70%">
                      {{ c.title }}
                      <div class="text-muted small fw-normal mt-1">
                        {{ formatDate(c.start_date) }} - {{ formatDate(c.end_date) }}
                      </div>
                    </div>

                    <div class="text-end">
                      <div class="text-muted small">Thu được</div>
                      <div class="fw-semibold" style="line-height: 1.2">
                        {{ formatNumber(c.volume_ml || 0) }}
                        <span class="small text-muted ms-1">ml</span>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex flex-wrap gap-2 mt-2 text-muted small">
                    <span>Chờ duyệt: <b class="text-dark">{{ Number(c.requested || 0) }}</b></span>
                    <span>Đã duyệt: <b class="text-dark">{{ Number(c.approved || 0) }}</b></span>
                    <span>Hoàn thành: <b class="text-dark">{{ Number(c.completed || 0) }}</b></span>
                    <span>Từ chối: <b class="text-dark">{{ Number(c.rejected || 0) }}</b></span>
                    <span>Đã huỷ: <b class="text-dark">{{ Number(c.cancelled || 0) }}</b></span>
                  </div>
                </div>
              </div>

              <div v-else class="text-muted small">* Không có campaign phù hợp trong khoảng thời gian đang chọn.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================== 3) WARNINGS / ALERTS ================== -->
    <div class="card shadow-sm border-0 mb-4 rounded-4">
      <div class="card-header bg-white py-3 rounded-top-4">
        <h5 class="card-title fw-bold mb-0">
          <i class="bi bi-exclamation-triangle-fill me-2 text-danger"></i>Cảnh báo nhóm máu
        </h5>
      </div>

      <div class="card-body">
        <div class="row g-3">
          <div v-for="w in warnings" :key="w.key" class="col-md-3">
            <div :class="w.class">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">{{ w.title }}</span>
                <span class="text-muted">{{ w.value }}</span>
              </div>
              <p class="small mb-0">{{ w.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Inventory by type (mini table) -->
        <div class="mt-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="fw-bold">Tồn kho theo nhóm máu</div>
          </div>

          <div class="table-responsive">
            <table class="table table-sm align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Nhóm máu</th>
                  <th class="text-end">Đơn vị</th>
                  <th class="text-end">Mức</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="x in inventoryByTypeRows" :key="x.key">
                  <td class="fw-semibold">{{ x.type }}</td>
                  <td class="text-end">{{ x.units }}</td>
                  <td class="text-end">
                    <span class="badge" :class="x.badgeClass">{{ x.levelLabel }}</span>
                  </td>
                </tr>
                <tr v-if="inventoryByTypeRows.length === 0">
                  <td colspan="3" class="text-center text-muted py-3">Chưa có dữ liệu tồn kho.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3 text-muted small" v-if="loading">
      <i class="bi bi-arrow-repeat me-2"></i>Đang tải dữ liệu...
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "vue-chartjs";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Filler
);

export default {
  name: "ReportView",
  components: { Line, Doughnut, Bar },
  data() {
    return {
      loading: false,
      error: null,
      dashboard: null,
      campaignPerf: null,
      range: "7d",

      // ✅ ép thứ tự hiển thị tồn kho theo nhóm máu
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
    };
  },
  computed: {
    rangeLabel() {
      const m = { "7d": "7 ngày", "1m": "30 ngày", "3m": "3 tháng", "1y": "1 năm" };
      return m[this.range] || this.range;
    },

    palette() {
      return {
        in: "#22c55e",
        out: "#ef4444",
        blue: "#3b82f6",
        amber: "#f59e0b",
        purple: "#a855f7",
        teal: "#14b8a6",
        gray: "#94a3b8",
        grid: "rgba(148,163,184,0.25)",
      };
    },

    hasInventoryTrend() {
      const t = this.dashboard?.inventory?.trend;
      return !!(t && Array.isArray(t.labels) && t.labels.length);
    },

    hasAppointmentSummary() {
      const s = this.dashboard?.appointments?.summary;
      if (!s) return false;
      const total =
        Number(s.requested || 0) +
        Number(s.approved || 0) +
        Number(s.rejected || 0) +
        Number(s.completed || 0) +
        Number(s.cancelled || 0);
      return total > 0;
    },

    apCount() {
      const s = this.dashboard?.appointments?.summary || {};
      return {
        requested: Number(s.requested || 0),
        approved: Number(s.approved || 0),
        rejected: Number(s.rejected || 0),
        completed: Number(s.completed || 0),
        cancelled: Number(s.cancelled || 0),
      };
    },

    kpi() {
      const s = this.dashboard?.appointments?.summary || {};
      const requested = Number(s.requested || 0);
      const approved = Number(s.approved || 0);
      const completed = Number(s.completed || 0);
      const denom = approved + completed;
      const rate = denom > 0 ? Math.round((completed / denom) * 100) : 0;
      return { pending: requested, completionRate: rate };
    },

    // Inventory line
    inventoryLineData() {
      const trend = this.dashboard?.inventory?.trend || {};
      const labels = (trend.labels || []).map(this.formatDM);
      const inUnits = trend.in_units || [];
      const outUnits = trend.out_units || [];

      return {
        labels,
        datasets: [
          {
            label: "Nhập",
            data: inUnits,
            tension: 0.35,
            pointRadius: 2,
            borderWidth: 3,
            borderColor: this.palette.in,
            backgroundColor: "rgba(34,197,94,0.12)",
            pointBackgroundColor: this.palette.in,
            fill: true,
          },
          {
            label: "Xuất",
            data: outUnits,
            tension: 0.35,
            pointRadius: 2,
            borderWidth: 3,
            borderColor: this.palette.out,
            backgroundColor: "rgba(239,68,68,0.10)",
            pointBackgroundColor: this.palette.out,
            fill: true,
          },
        ],
      };
    },
    inventoryLineOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true } },
          tooltip: { mode: "index", intersect: false },
        },
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { grid: { color: this.palette.grid } },
          y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: this.palette.grid } },
        },
      };
    },

    // Donut
    appointmentDonutData() {
      const s = this.dashboard?.appointments?.summary || {};
      const values = [
        Number(s.requested || 0),
        Number(s.approved || 0),
        Number(s.rejected || 0),
        Number(s.completed || 0),
        Number(s.cancelled || 0),
      ];

      return {
        labels: ["Chờ duyệt", "Đã duyệt", "Từ chối", "Hoàn thành", "Đã huỷ"],
        datasets: [
          {
            data: values,
            backgroundColor: [
              this.palette.gray,
              this.palette.blue,
              this.palette.out,
              this.palette.in,
              this.palette.amber,
            ],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      };
    },
    appointmentDonutOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 10 } },
          tooltip: { enabled: true },
        },
      };
    },

    // Campaigns
    hasCampaigns() {
      const arr = this.campaignPerf?.campaigns;
      if (!Array.isArray(arr) || !arr.length) return false;
      return arr.some((c) => {
        const totalAp =
          Number(c.requested || 0) +
          Number(c.approved || 0) +
          Number(c.rejected || 0) +
          Number(c.completed || 0) +
          Number(c.cancelled || 0);
        const vol = Number(c.volume_ml || 0);
        return totalAp > 0 || vol > 0;
      });
    },

    campaignList() {
      const arr = (this.campaignPerf?.campaigns || []).slice();
      arr.sort(
        (a, b) =>
          Number(b.volume_ml || 0) - Number(a.volume_ml || 0) ||
          Number(b.completion_rate || 0) - Number(a.completion_rate || 0)
      );
      return arr;
    },

    campaignBarData() {
      const list = this.campaignList.slice(0, 8);
      return {
        labels: list.map((c) => this.trimLabel(c.title)),
        datasets: [
          {
            label: "Tổng máu thu (ml)",
            data: list.map((c) => Number(c.volume_ml || 0)),
            backgroundColor: "rgba(59,130,246,0.35)",
            borderColor: this.palette.blue,
            borderWidth: 2,
            borderRadius: 10,
          },
        ],
      };
    },
    campaignBarOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true } },
          tooltip: { mode: "index", intersect: false },
        },
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: this.palette.grid } },
        },
      };
    },

    // Warnings → dùng class Bootstrap alert
    warnings() {
      const lowGroups = this.dashboard?.alerts?.lowGroups || [];
      const exp = this.dashboard?.alerts?.expiring?.units ?? 0;
      const pending =
        this.dashboard?.topCards?.find((x) => x.key === "pending_appointments")?.value ?? null;
      const totalUnits = this.dashboard?.topCards?.find((x) => x.key === "total_units")?.value ?? null;

      const first = lowGroups[0];
      const arr = [];

      arr.push({
        key: "low_inventory",
        title: first?.blood_type?.type_name ? `Thiếu máu ${first.blood_type.type_name}` : "Thiếu máu",
        value: first ? `${first.units} túi` : "—",
        desc: first ? "Tồn kho đang thấp, cần bổ sung." : "Không có cảnh báo thiếu máu.",
        class: first ? "alert alert-danger rounded-4" : "alert alert-warning rounded-4",
      });

      arr.push({
        key: "expiring",
        title: "Sắp hết hạn",
        value: `${Number(exp || 0)} túi`,
        desc: "Tổng túi máu sẽ hết hạn trong 3 ngày.",
        class: Number(exp || 0) > 0 ? "alert alert-warning rounded-4" : "alert alert-primary rounded-4",
      });

      arr.push({
        key: "pending",
        title: "Chờ duyệt",
        value: pending === null ? "—" : `${Number(pending)} lịch`,
        desc: "Số lịch chờ duyệt trong kỳ.",
        class: pending && pending >= 10 ? "alert alert-warning rounded-4" : "alert alert-success rounded-4",
      });

      arr.push({
        key: "total_units",
        title: "Tổng túi máu",
        value: totalUnits === null ? "—" : `${Number(totalUnits)} túi`,
        desc: "Tổng túi máu máu thống kê trên dashboard.",
        class: "alert alert-primary rounded-4",
      });

      return arr;
    },

    // ✅ SORT theo bloodTypes (A+, A-, B+...)
    inventoryByTypeRows() {
      const rows = this.dashboard?.inventory?.byType || [];

      const mapLevel = {
        critical: { label: "Nguy cấp", cls: "bg-danger" },
        low: { label: "Ít", cls: "bg-warning text-dark" },
        full: { label: "Đủ", cls: "bg-success" },
        expiring: { label: "Sắp hết hạn", cls: "bg-warning text-dark" },
      };

      // 1) lookup theo typeName
      const lookup = Object.create(null);
      rows.forEach((x) => {
        const type =
          x?.blood_type?.type_name ||
          `${x?.blood_type?.abo || ""}${x?.blood_type?.rh || ""}` ||
          "";
        const key = String(type).toUpperCase().trim();
        if (!key) return;

        const units = Number(x?.units || 0);
        const level = String(x?.level || "full");
        const info = mapLevel[level] || mapLevel.full;

        lookup[key] = {
          key,
          type: key,
          units,
          levelLabel: info.label,
          badgeClass: info.cls,
        };
      });

      // 2) ép thứ tự theo bloodTypes, thiếu thì fill 0
      const ordered = this.bloodTypes.map((bt) => {
        const key = String(bt.name).toUpperCase().trim();
        return (
          lookup[key] || {
            key,
            type: bt.name,
            units: 0,
            levelLabel: "Đủ",
            badgeClass: "bg-success",
          }
        );
      });

      // 3) append loại máu lạ (nếu BE trả thêm)
      const extra = Object.keys(lookup)
        .filter((k) => !this.bloodTypes.some((bt) => String(bt.name).toUpperCase().trim() === k))
        .sort((a, b) => a.localeCompare(b))
        .map((k) => lookup[k]);

      const hasAny = rows.length > 0;
      return hasAny ? [...ordered, ...extra] : [];
    },
  },

  created() {
    this.fetchAll();
  },

  methods: {
    async fetchAll() {
      await Promise.allSettled([this.fetchDashboard(), this.fetchCampaignPerformance()]);
    },

    async fetchDashboard() {
      this.loading = true;
      this.error = null;

      try {
        const params = { inventory_range: this.range, appointment_range: this.range };
        const res = await baseRequestDoctor.get("/doctor/dashboard", { params });

        if (!res?.data?.status) throw new Error(res?.data?.message || "Tải dữ liệu dashboard thất bại");
        this.dashboard = res.data.data || null;
      } catch (e) {
        this.dashboard = null;
        this.error = e?.message || "Có lỗi xảy ra khi tải dashboard";
      } finally {
        this.loading = false;
      }
    },

    async fetchCampaignPerformance() {
      try {
        const params = { range: this.range };
        const res = await baseRequestDoctor.get("/doctor/reports/campaign-performance", { params });
        if (!res?.data?.status) {
          this.campaignPerf = { campaigns: [] };
          return;
        }
        this.campaignPerf = res.data.data || { campaigns: [] };
      } catch {
        this.campaignPerf = { campaigns: [] };
      }
    },

    setRange(rangeKey) {
      this.range = rangeKey;
      this.fetchAll();
    },
    reload() {
      this.fetchAll();
    },

    formatDM(ymd) {
      if (!ymd) return "";
      const s = String(ymd).slice(0, 10);
      const parts = s.split("-");
      if (parts.length !== 3) return s;
      return `${parts[2]}/${parts[1]}`;
    },
    formatDate(ymd) {
      if (!ymd) return "—";
      const s = String(ymd).slice(0, 10);
      const p = s.split("-");
      if (p.length !== 3) return s;
      return `${p[2]}/${p[1]}/${p[0]}`;
    },
    formatNumber(n) {
      return Number(n || 0).toLocaleString("vi-VN");
    },
    trimLabel(str) {
      const s = String(str || "");
      return s.length <= 14 ? s : s.slice(0, 14) + "…";
    },
  },
};
</script>
