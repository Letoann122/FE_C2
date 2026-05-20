<template>
  <main class="dashboard-content p-4">
    <!-- ===== ALERT (API) ===== -->
    <div v-if="loaded && alerts.lowGroups && alerts.lowGroups.length > 0"
      class="alert alert-danger d-flex align-items-center mb-4 rounded-3 shadow-sm">
      <i class="fas fa-bell me-2 fs-5"></i>
      <div>
        Cảnh báo khẩn cấp: Nhóm máu
        <b>{{ alerts.lowGroups[0].blood_type.type_name }}</b>
        sắp cạn! Còn <b>{{ formatNumber(alerts.lowGroups[0].units) }}</b> túi, cần bổ sung ngay.
      </div>
    </div>

    <!-- ===== TOP CARDS ===== -->
    <div class="row g-4 mb-4">
      <div class="col-lg-3 col-md-6" v-for="item in topCardsUI" :key="item.key">
        <div class="card shadow-sm border-0 h-100 rounded-3 p-3">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h5 class="card-title text-muted mb-0">{{ item.title }}</h5>
              <span class="fs-4">{{ item.icon }}</span>
            </div>
            <h2 class="card-value fw-bold mb-0">{{ item.value }}</h2>
            <p class="small mb-0" :class="item.changeColor">{{ item.change }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <!-- LEFT -->
      <div class="col-lg-8">
        <!-- ====================== TỔNG QUAN KHO MÁU ====================== -->
        <div class="card shadow-sm border-0 rounded-3 mb-4">
          <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold">Tổng quan Kho máu</h5>

            <div class="btn-group btn-group-sm">
              <button v-for="btn in timeFilters" :key="btn.value" class="btn"
                :class="activeInventoryFilter === btn.value ? 'btn-primary' : 'btn-outline-primary'"
                @click="changeInventoryFilter(btn.value)">
                {{ btn.label }}
              </button>
            </div>
          </div>

          <div class="card-body">
            <div class="row text-center mb-4">
              <div v-for="g in bloodGroupsUI" :key="g.key" class="col-6 col-md-3 mb-3 mb-md-0">
                <div class="blood-group-card p-3 rounded-3" :style="{ backgroundColor: g.bg }">
                  <h5 class="fw-bold mb-1">{{ g.name }}</h5>
                  <p class="fw-bold mb-0" :style="{ color: g.color }">
                    {{ formatNumber(g.value) }} túi
                  </p>
                  <small class="text-muted">{{ g.status }}</small>
                </div>
              </div>
            </div>

            <p class="text-muted small text-center mb-2">
              Xu hướng nhập - xuất máu ({{ getFilterLabel(activeInventoryFilter) }})
            </p>

            <div class="chart-wrap">
              <div v-if="!loaded" class="text-center text-muted small py-4">Đang tải...</div>
              <div v-else-if="inventoryChartData.labels.length === 0" class="text-center text-muted small py-4">
                Không có dữ liệu
              </div>
              <div v-else class="chart-box">
                <Line :data="inventoryChartData" :options="inventoryChartOptions" />
              </div>
            </div>
          </div>
        </div>

        <!-- ====================== TỔNG QUAN LỊCH HẸN ====================== -->
        <div class="card shadow-sm border-0 rounded-3 mb-4">
          <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold">Tổng quan Lịch hẹn</h5>

            <div class="btn-group btn-group-sm">
              <button v-for="btn in timeFilters" :key="btn.value" class="btn"
                :class="activeAppointmentFilter === btn.value ? 'btn-primary' : 'btn-outline-primary'"
                @click="changeAppointmentFilter(btn.value)">
                {{ btn.label }}
              </button>
            </div>
          </div>

          <div class="card-body">
            <!-- Summary -->
            <div class="row text-center">
              <div class="col-6 col-md-4 col-xl mb-3">
                <h3 class="fw-bold mb-1">{{ formatNumber(appointments.summary.today) }}</h3>
                <p class="text-muted mb-0 small">Hôm nay</p>
              </div>

              <div class="col-6 col-md-4 col-xl mb-3">
                <h3 class="fw-bold mb-1 text-warning">{{ formatNumber(appointments.summary.requested) }}</h3>
                <p class="text-muted mb-0 small">Chờ duyệt</p>
              </div>

              <div class="col-6 col-md-4 col-xl mb-3">
                <h3 class="fw-bold mb-1 text-primary">{{ formatNumber(appointments.summary.approved) }}</h3>
                <p class="text-muted mb-0 small">Đã duyệt</p>
              </div>

              <div class="col-6 col-md-4 col-xl mb-3">
                <h3 class="fw-bold mb-1 text-danger">{{ formatNumber(appointments.summary.rejected) }}</h3>
                <p class="text-muted mb-0 small">Từ chối</p>
              </div>

              <div class="col-6 col-md-4 col-xl mb-3">
                <h3 class="fw-bold mb-1 text-info">{{ formatNumber(appointments.summary.processing) }}</h3>
                <p class="text-muted mb-0 small">Đang xử lý</p>
              </div>

              <div class="col-6 col-md-4 col-xl mb-3">
                <h3 class="fw-bold mb-1 text-success">{{ formatNumber(appointments.summary.completed) }}</h3>
                <p class="text-muted mb-0 small">Hoàn thành</p>
              </div>

              <div class="col-6 col-md-4 col-xl mb-3">
                <h3 class="fw-bold mb-1">{{ formatNumber(appointments.summary.cancelled) }}</h3>
                <p class="text-muted mb-0 small">Đã hủy</p>
              </div>
            </div>

            <p class="text-center text-muted mt-2 small mb-2">
              Xu hướng lịch theo trạng thái ({{ getFilterLabel(activeAppointmentFilter) }})
            </p>

            <div class="chart-wrap">
              <div v-if="!loaded" class="text-center text-muted small py-4">Đang tải...</div>
              <div v-else-if="appointmentChartData.labels.length === 0" class="text-center text-muted small py-4">
                Không có dữ liệu
              </div>
              <div v-else class="chart-box">
                <Bar :data="appointmentChartData" :options="appointmentChartOptions" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="col-lg-4">
        <!-- ==== Chiến dịch ==== -->
        <div class="card shadow-sm border-0 rounded-3 mb-4">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0 fw-bold">Chiến dịch sắp tới</h5>
          </div>

          <div class="card-body">
            <div v-for="item in campaignsUI" :key="item.id" class="campaign-item p-3 mb-3 rounded-3"
              :style="{ backgroundColor: item.bg, borderLeftColor: item.border }">
              <h6 class="fw-bold mb-1">{{ item.name }}</h6>
              <p class="small text-muted mb-1">{{ item.time }}</p>
              <span :class="'badge ' + item.badgeClass">{{ item.badge }}</span>
            </div>

            <div v-if="campaignsUI.length === 0" class="text-center text-muted small">
              Chưa có chiến dịch sắp tới
            </div>

            <div class="text-center mt-3">
              <button class="btn btn-outline-primary btn-sm" @click="goCampaigns">
                Xem tất cả chiến dịch
              </button>
            </div>
          </div>
        </div>

        <!-- ==== Thông báo ==== -->
        <div class="card shadow-sm border-0 rounded-3 mb-4">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0 fw-bold">Thông báo & Cảnh báo</h5>
          </div>

          <div class="card-body">
            <div v-for="(n, i) in notificationsUI" :key="i" class="alert p-3 mb-3 rounded-3 small"
              :class="alertClass(n.severity)">
              <i :class="iconClass(n.severity) + ' me-2'"></i>
              {{ n.message }}
            </div>

            <div v-if="notificationsUI.length === 0" class="text-center text-muted small">
              Không có cảnh báo
            </div>
          </div>
        </div>

        <div v-if="!loaded && !error" class="text-center text-muted small">Đang tải dashboard...</div>
        <div v-if="error" class="text-center text-danger small">{{ error }}</div>
      </div>
    </div>
  </main>
</template>

<script>
import { createToaster } from "@meforma/vue-toaster";
const toaster = createToaster({ position: "top-right" });

// chartjs
import { Line, Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";

import baseRequestDoctor from "../../../core/baseRequestDoctor";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

export default {
  name: "DoctorDashboard",
  components: { Line, Bar },

  data() {
    return {
      loaded: false,
      loading: false,
      error: "",

      timeFilters: [
        { label: "7 ngày", value: "7d" },
        { label: "1 tháng", value: "1m" },
        { label: "3 tháng", value: "3m" },
        { label: "1 năm", value: "1y" },
      ],

      activeInventoryFilter: "7d",
      activeAppointmentFilter: "7d",

      // ===== API state =====
      hospital_id: null,
      alerts: {
        lowGroups: [],
        expiring: { units: 0, within_days: 3 },
        busyAppointments: { count: 0, within_days: 7 },
      },
      topCards: [],
      inventory: {
        byType: [],
        trend: { range: "7d", labels: [], in_units: [], out_units: [] },
      },
      appointments: {
        summary: {
          today: 0,
          requested: 0,
          approved: 0,
          rejected: 0,
          processing: 0,
          completed: 0,
          cancelled: 0,
        },
        trend: {
          range: "7d",
          labels: [],
          requested: [],
          approved: [],
          rejected: [],
          processing: [],
          completed: [],
          cancelled: [],
        },
      },
      campaigns: { upcoming: [] },
      notifications: [],

      // ===== charts =====
      inventoryChartData: {
        labels: [],
        datasets: [
          { label: "Nhập", data: [] },
          { label: "Xuất", data: [] },
        ],
      },
      inventoryChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          tooltip: { enabled: true },
        },
        scales: {
          x: { ticks: { maxRotation: 0 } },
          y: { beginAtZero: true },
        },
      },

      appointmentChartData: {
        labels: [],
        datasets: [
          { label: "Chờ duyệt", data: [] },
          { label: "Đã duyệt", data: [] },
          { label: "Từ chối", data: [] },
          { label: "Đang xử lý", data: [] },
          { label: "Hoàn thành", data: [] },
          { label: "Huỷ", data: [] },
        ],
      },
      appointmentChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          tooltip: { enabled: true },
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true },
        },
      },
    };
  },

  computed: {
    topCardsUI() {
      const mapTitle = {
        total_units: "Tổng túi máu",
        pending_appointments: "Tổng lịch chờ duyệt",
        expiring_units: "Máu sắp hết hạn",
        collected_today_ml: "Tổng máu thu hôm nay",
      };

      const mapIcon = {
        total_units: "🩸",
        pending_appointments: "⏳",
        expiring_units: "⏰",
        collected_today_ml: "📥",
      };

      const formatDelta = (pct) => {
        if (pct === null || pct === undefined) return "";
        const sign = pct >= 0 ? "+" : "";
        return `${sign}${pct.toFixed(0)}% so với kỳ trước`;
      };

      const colorByPct = (pct) => {
        if (pct === null || pct === undefined) return "text-muted";
        return pct >= 0 ? "text-success" : "text-danger";
      };

      const formatValue = (key, v) => {
        if (key === "collected_today_ml") return `${this.formatNumber(v)} ml`;
        return this.formatNumber(v);
      };

      const base = Array.isArray(this.topCards) ? this.topCards : [];
      if (!base.length) {
        return [
          { key: "total_units", title: mapTitle.total_units, icon: mapIcon.total_units, value: "0", change: "", changeColor: "text-muted" },
          { key: "pending_appointments", title: mapTitle.pending_appointments, icon: mapIcon.pending_appointments, value: "0", change: "", changeColor: "text-muted" },
          { key: "expiring_units", title: mapTitle.expiring_units, icon: mapIcon.expiring_units, value: "0", change: "", changeColor: "text-muted" },
          { key: "collected_today_ml", title: mapTitle.collected_today_ml, icon: mapIcon.collected_today_ml, value: "0 ml", change: "", changeColor: "text-muted" },
        ];
      }

      return base.map((x) => ({
        key: x.key,
        title: mapTitle[x.key] || x.title || x.key,
        icon: mapIcon[x.key] || "📌",
        value: formatValue(x.key, x.value),
        change: x.delta_pct === null || x.delta_pct === undefined ? "" : formatDelta(x.delta_pct),
        changeColor: colorByPct(x.delta_pct),
      }));
    },

    // gộp ABO: A/B/AB/O
    bloodGroupsUI() {
      const byType = Array.isArray(this.inventory.byType) ? this.inventory.byType : [];
      const sum = { A: 0, B: 0, AB: 0, O: 0 };

      for (const item of byType) {
        const abo = item?.blood_type?.abo;
        const units = Number(item?.units || 0);
        if (abo && sum[abo] !== undefined) sum[abo] += units;
      }

      const buildStatus = (units) => {
        if (units <= 10) return "nguy cấp";
        if (units <= 30) return "thiếu";
        return "đủ";
      };

      return [
        { key: "A", name: "Nhóm A", value: sum.A, status: buildStatus(sum.A), bg: "#fdecec", color: "#d32f2f" },
        { key: "B", name: "Nhóm B", value: sum.B, status: buildStatus(sum.B), bg: "#e0f2f7", color: "#0288d1" },
        { key: "AB", name: "Nhóm AB", value: sum.AB, status: buildStatus(sum.AB), bg: "#eee", color: "#6c757d" },
        { key: "O", name: "Nhóm O", value: sum.O, status: buildStatus(sum.O), bg: "#fff3e0", color: "#ffa000" },
      ];
    },

    campaignsUI() {
      const arr = Array.isArray(this.campaigns.upcoming) ? this.campaigns.upcoming : [];
      const locateText = (c) => (c.donation_site?.name ? c.donation_site.name : (c.location || "Chưa rõ địa điểm"));

      return arr.map((c) => ({
        id: c.id,
        name: c.title,
        time: `${this.formatDateDMY(c.start_date)} - ${locateText(c)}`,
        bg: c.is_emergency ? "#fdecec" : "#e0f2f7",
        border: c.is_emergency ? "#dc3545" : "#2196f3",
        badge: c.is_emergency ? "Khẩn cấp" : "Sắp diễn ra",
        badgeClass: c.is_emergency ? "bg-danger" : "bg-primary",
      }));
    },

    notificationsUI() {
      const arr = Array.isArray(this.notifications) ? this.notifications : [];
      if (arr.length) return arr;

      const fallback = [];
      if (this.alerts.lowGroups?.length) {
        const first = this.alerts.lowGroups[0];
        fallback.push({
          severity: first.level === "critical" ? "danger" : "warning",
          message: `Thiếu máu ${first.blood_type.type_name}: Còn ${first.units} túi`,
        });
      }
      if (Number(this.alerts.expiring?.units || 0) > 0) {
        fallback.push({
          severity: "warning",
          message: `Lô máu sắp hết hạn: ${this.alerts.expiring.units} túi trong ${this.alerts.expiring.within_days} ngày`,
        });
      }
      if (Number(this.alerts.busyAppointments?.count || 0) > 0) {
        fallback.push({
          severity: "info",
          message: `Lịch hẹn nhiều: ${this.alerts.busyAppointments.count} lịch trong ${this.alerts.busyAppointments.within_days} ngày tới`,
        });
      }
      return fallback;
    },
  },

  async mounted() {
    this.loaded = false;
    this.loadData();
  },

  methods: {
    loadData() {
      this.loading = true;
      this.error = "";
      this.loaded = false;

      const params = {
        inventory_range: this.activeInventoryFilter,
        appointment_range: this.activeAppointmentFilter,
      };

      const token =
        localStorage.getItem("token_doctor") ||
        localStorage.getItem("token_hospital") ||
        localStorage.getItem("token");

      baseRequestDoctor
        .get("/doctor/dashboard", {
          params,
          headers: token ? { Authorization: "Bearer " + token } : {},
        })
        .then((res) => {
          if (res.data && res.data.status) {
            const d = res.data.data || {};

            this.hospital_id = d.hospital_id ?? null;
            this.alerts = d.alerts || this.alerts;
            this.topCards = d.topCards || [];
            this.inventory = d.inventory || this.inventory;
            this.appointments = d.appointments || this.appointments;
            this.campaigns = d.campaigns || this.campaigns;
            this.notifications = d.notifications || [];

            this.buildInventoryChart();
            this.buildAppointmentChart();

            this.loaded = true;
          } else {
            toaster.error(res.data?.message || "Không load được dashboard");
            this.error = res.data?.message || "Không load được dashboard";
          }
        })
        .catch((err) => {
          this.loaded = false;
          this.error = err?.response?.data?.message || err.message || "Lỗi hệ thống";
          toaster.error(this.error);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    buildInventoryChart() {
      const labels = (this.inventory?.trend?.labels || []).map((x) => this.formatDateDMY(x));
      const inUnits = this.inventory?.trend?.in_units || [];
      const outUnits = this.inventory?.trend?.out_units || [];

      this.inventoryChartData.labels = labels;
      this.inventoryChartData.datasets[0].data = inUnits;
      this.inventoryChartData.datasets[1].data = outUnits;

      this.inventoryChartData.datasets[0].borderColor = "#36A2EB";
      this.inventoryChartData.datasets[0].backgroundColor = "rgba(54, 162, 235, 0.2)";
      this.inventoryChartData.datasets[0].tension = 0.35;

      this.inventoryChartData.datasets[1].borderColor = "#FF6384";
      this.inventoryChartData.datasets[1].backgroundColor = "rgba(255, 99, 132, 0.2)";
      this.inventoryChartData.datasets[1].tension = 0.35;
    },

    buildAppointmentChart() {
      const t = this.appointments?.trend || {};
      const labels = (t.labels || []).map((x) => this.formatDateDMY(x));

      this.appointmentChartData.labels = labels;

      const ds = this.appointmentChartData.datasets;

      ds[0].data = t.requested || [];
      ds[1].data = t.approved || [];
      ds[2].data = t.rejected || [];
      ds[3].data = t.processing || [];
      ds[4].data = t.completed || [];
      ds[5].data = t.cancelled || [];

      ds[0].backgroundColor = "#FFCE56"; // requested
      ds[1].backgroundColor = "#36A2EB"; // approved
      ds[2].backgroundColor = "#FF6384"; // rejected
      ds[3].backgroundColor = "#17A2B8"; // processing
      ds[4].backgroundColor = "#4BC0C0"; // completed
      ds[5].backgroundColor = "#9966FF"; // cancelled
      ds.forEach((x) => (x.borderWidth = 0));
    },

    changeInventoryFilter(val) {
      this.activeInventoryFilter = val;
      this.loadData();
    },

    changeAppointmentFilter(val) {
      this.activeAppointmentFilter = val;
      this.loadData();
    },

    getFilterLabel(val) {
      switch (val) {
        case "7d": return "7 ngày qua";
        case "1m": return "1 tháng qua";
        case "3m": return "3 tháng qua";
        case "1y": return "1 năm qua";
        default: return "";
      }
    },

    formatNumber(n) {
      const x = Number(n || 0);
      return x.toLocaleString("vi-VN");
    },

    formatDateDMY(s) {
      if (!s) return "";
      const str = String(s).slice(0, 10);
      const [y, m, d] = str.split("-");
      if (!y || !m || !d) return str;
      return `${d}/${m}/${y}`;
    },

    alertClass(sev) {
      if (sev === "danger") return "alert-danger";
      if (sev === "warning") return "alert-warning";
      if (sev === "info") return "alert-info";
      return "alert-secondary";
    },

    iconClass(sev) {
      if (sev === "danger") return "fas fa-bell";
      if (sev === "warning") return "fas fa-clock";
      if (sev === "info") return "fas fa-exclamation-triangle";
      return "fas fa-info-circle";
    },

    goCampaigns() {
      this.$router.push("/Hospital/campaign-management");
    },
  },
};
</script>

<style scoped>
.dashboard-content {
  max-width: 1300px;
  margin: 0 auto;
}

.blood-group-card {
  border: 1px solid #e0e0e0;
}

.campaign-item {
  border-left: 5px solid;
}

.chart-wrap {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
}

.chart-box {
  height: 260px;
}
</style>