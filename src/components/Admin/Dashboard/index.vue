<template>
  <div class="container-fluid p-4 bg-light min-vh-100">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-0">Dashboard Quản Trị</h3>
        <p class="text-muted small mb-0">
          Tổng quan hoạt động toàn hệ thống Smart Blood Donation
        </p>
      </div>
      <div class="d-flex gap-2">
        <select class="form-select form-select-sm" v-model="filterTime">
          <option value="today">Hôm nay</option>
          <option value="week">7 ngày qua</option>
          <option value="month">Tháng này</option>
          <option value="year">Năm nay</option>
        </select>
      </div>
    </div>

    <!-- KPI -->
    <div class="row g-3 mb-4">
      <div class="col-md-6 col-lg-3" v-for="(card, i) in kpiCards" :key="i">
        <div :class="['card border-0 shadow-sm rounded-3 h-100', card.borderClass || '']">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="text-muted small fw-bold text-uppercase">{{ card.title }}</div>
              <div :class="['icon-box', card.iconBg, 'text-' + card.iconColor, 'rounded-circle p-2']">
                <i :class="card.icon"></i>
              </div>
            </div>
            <h3 class="fw-bold mb-1">{{ card.value }}</h3>
            <div class="small text-muted" v-html="card.sub || ''"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="row g-4 mb-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-3 h-100">
          <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h6 class="fw-bold m-0">Thống kê người dùng mới và lượt hiến</h6>
          </div>

          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-danger"></div>
            </div>

            <div v-else class="chart-container" style="height: 300px">
              <Line :data="growthChartData" :options="chartOptions" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-3 h-100">
          <div class="card-header bg-white py-3">
            <h6 class="fw-bold m-0">Tỷ lệ nhóm máu hệ thống</h6>
          </div>

          <div class="card-body d-flex flex-column justify-content-center align-items-center">
            <div v-if="loading" class="w-100 text-center py-3">
              <div class="spinner-border text-danger"></div>
            </div>

            <div v-else class="chart-container" style="height: 250px; width: 100%">
              <Doughnut :data="bloodTypeChartData" :options="pieOptions" />
            </div>

            <div class="mt-3 text-center small text-muted">
              *Dữ liệu tổng hợp từ tất cả bệnh viện
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending + Logs -->
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-3 h-100">
          <!-- Tabs -->
          <div class="card-header bg-white p-0 border-bottom-0">
            <ul class="nav nav-tabs px-3 pt-3 border-bottom-0" role="tablist">
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link fw-bold"
                  :class="activeTab === 'news' ? 'active text-dark' : 'text-muted'"
                  @click="activeTab = 'news'"
                >
                  Tin tức
                  <span class="badge bg-danger rounded-pill ms-1">{{ pendingNews.length }}</span>
                </button>
              </li>

              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link fw-bold"
                  :class="activeTab === 'campaigns' ? 'active text-dark' : 'text-muted'"
                  @click="activeTab = 'campaigns'"
                >
                  Chiến dịch
                  <span class="badge bg-warning text-dark rounded-pill ms-1">{{ pendingCampaigns.length }}</span>
                </button>
              </li>

              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link fw-bold"
                  :class="activeTab === 'doctors' ? 'active text-dark' : 'text-muted'"
                  @click="activeTab = 'doctors'"
                >
                  Bác sĩ mới
                  <span class="badge bg-secondary rounded-pill ms-1">{{ pendingDoctors.length }}</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Content -->
          <div class="card-body p-0">
            <!-- NEWS -->
            <div v-if="activeTab === 'news'" class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr>
                    <th class="ps-4">Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Ngày gửi</th>
                    <th class="text-end pe-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in pendingNews" :key="item.id">
                    <td class="ps-4 fw-semibold">{{ item.title }}</td>
                    <td>{{ item.author }}</td>
                    <td>{{ formatDate(item.date) }}</td>
                    <td class="text-end pe-4">
                      <button class="btn btn-sm btn-outline-primary me-2" @click="viewNews(item.id)">Xem</button>
                      <button
                        class="btn btn-sm btn-success"
                        :disabled="approvingKey === `news-${item.id}`"
                        @click="approveNews(item.id)"
                      >
                        <span v-if="approvingKey === `news-${item.id}`" class="spinner-border spinner-border-sm"></span>
                        <span v-else>Duyệt</span>
                      </button>
                    </td>
                  </tr>

                  <tr v-if="pendingNews.length === 0">
                    <td colspan="4" class="text-center text-muted py-4">Không có bài chờ duyệt.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CAMPAIGNS -->
            <div v-if="activeTab === 'campaigns'" class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr>
                    <th class="ps-4">Tên chiến dịch</th>
                    <th>Bệnh viện / Địa điểm</th>
                    <th>Ngày gửi</th>
                    <th class="text-end pe-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in pendingCampaigns" :key="item.id">
                    <td class="ps-4 fw-semibold">{{ item.title }}</td>
                    <td>{{ item.hospital || "—" }}</td>
                    <td>{{ formatDate(item.date) }}</td>
                    <td class="text-end pe-4">
                      <button class="btn btn-sm btn-outline-primary me-2" @click="viewCampaign(item.id)">Xem</button>
                      <button
                        class="btn btn-sm btn-success"
                        :disabled="approvingKey === `camp-${item.id}`"
                        @click="approveCampaign(item.id)"
                      >
                        <span v-if="approvingKey === `camp-${item.id}`" class="spinner-border spinner-border-sm"></span>
                        <span v-else>Duyệt</span>
                      </button>
                    </td>
                  </tr>

                  <tr v-if="pendingCampaigns.length === 0">
                    <td colspan="4" class="text-center text-muted py-4">Không có chiến dịch chờ duyệt.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- DOCTORS -->
            <div v-if="activeTab === 'doctors'" class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr>
                    <th class="ps-4">Họ tên</th>
                    <th>Email</th>
                    <th>Ngày đăng ký</th>
                    <th class="text-end pe-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in pendingDoctors" :key="item.id">
                    <td class="ps-4 fw-semibold">{{ item.fullName }}</td>
                    <td>{{ item.email }}</td>
                    <td>{{ formatDate(item.date) }}</td>
                    <td class="text-end pe-4">
                      <button class="btn btn-sm btn-outline-primary me-2" @click="viewDoctor(item.id)">Xem</button>
                      <button
                        class="btn btn-sm btn-success"
                        :disabled="approvingKey === `doc-${item.id}`"
                        @click="approveDoctor(item.id)"
                      >
                        <span v-if="approvingKey === `doc-${item.id}`" class="spinner-border spinner-border-sm"></span>
                        <span v-else>Duyệt</span>
                      </button>
                    </td>
                  </tr>

                  <tr v-if="pendingDoctors.length === 0">
                    <td colspan="4" class="text-center text-muted py-4">Không có bác sĩ mới.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Footer -->
          <div class="card-footer bg-white border-top-0 text-center py-3">
            <router-link :to="moreUrl" class="text-decoration-none small fw-bold">
              Xem thêm <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Logs -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-3 h-100">
          <div class="card-header bg-white py-3">
            <h6 class="fw-bold m-0"><i class="bi bi-activity me-2 text-primary"></i>Hoạt động gần đây</h6>
          </div>

          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div v-for="(log, i) in systemLogs" :key="i" class="list-group-item px-4 py-3">
                <div class="d-flex justify-content-between">
                  <div>
                    <div class="small fw-bold text-dark">{{ log.action }}</div>
                    <div class="text-muted" style="font-size: 0.8rem">
                      {{ log.user }} - {{ log.role }}
                    </div>
                  </div>
                  <small class="text-muted">{{ formatDate(log.time) }}</small>
                </div>
              </div>

              <div v-if="systemLogs.length === 0" class="text-center text-muted p-3">
                Không có hoạt động gần đây.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Line, Doughnut } from "vue-chartjs";
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
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

import baseRequestAdmin from "../../../core/baseRequestAdmin";

export default {
  name: "AdminDashboard",
  components: { Line, Doughnut },

  data() {
    return {
      loading: false,
      approvingKey: null,
      filterTime: "week",
      activeTab: "news",

      stats: {
        totalUsers: 0,
        newUsers: 0,
        activeHospitals: 0,
        pendingRequests: 0,
        totalBloodUnits: 0,
      },

      pendingNews: [],
      pendingCampaigns: [],
      pendingDoctors: [],
      systemLogs: [],

      // ✅ giữ màu line chart
      growthChartData: {
        labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
        datasets: [
          {
            label: "Người dùng mới",
            data: [0, 0, 0, 0, 0, 0, 0],
            borderColor: "#0d6efd",
            backgroundColor: "#0d6efd",
            pointBackgroundColor: "#0d6efd",
            pointBorderColor: "#0d6efd",
            tension: 0.4,
          },
          {
            label: "Lượt hiến máu",
            data: [0, 0, 0, 0, 0, 0, 0],
            borderColor: "#dc3545",
            backgroundColor: "#dc3545",
            pointBackgroundColor: "#dc3545",
            pointBorderColor: "#dc3545",
            tension: 0.4,
          },
        ],
      },

      bloodTypeChartData: {
        labels: ["O", "A", "B", "AB"],
        datasets: [{ data: [0, 0, 0, 0], backgroundColor: ["#0dcaf0", "#0d6efd", "#198754", "#6610f2"] }],
      },

      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true } },
      },

      pieOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "right" } },
      },
    };
  },

  watch: {
    filterTime() {
      this.fetchDashboardData();
    },
  },

  computed: {
    kpiCards() {
      return [
        {
          title: "Tổng User",
          value: this.formatNumber(this.stats.totalUsers),
          sub: `<i class="bi bi-arrow-up"></i> ${this.formatNumber(this.stats.newUsers)} mới`,
          icon: "bi bi-people-fill fs-5",
          iconBg: "bg-primary-subtle",
          iconColor: "primary",
        },
        {
          title: "Bệnh viện / Cơ sở",
          value: this.stats.activeHospitals,
          sub: "Đang hoạt động",
          icon: "bi bi-hospital fs-5",
          iconBg: "bg-success-subtle",
          iconColor: "success",
        },
        {
          title: "Chờ phê duyệt",
          value: this.stats.pendingRequests,
          sub: '<span class="text-danger fw-bold">Cần xử lý ngay</span>',
          icon: "bi bi-hourglass-split fs-5",
          iconBg: "bg-warning-subtle",
          iconColor: "warning",
        },
        {
          title: "Kho máu toàn quốc",
          value: this.formatNumber(this.stats.totalBloodUnits),
          sub: "Đơn vị (túi)",
          icon: "bi bi-droplet-fill fs-5",
          iconBg: "bg-danger-subtle",
          iconColor: "danger",
        },
      ];
    },

    moreUrl() {
      switch (this.activeTab) {
        case "campaigns":
          return "/admin/campaigns/pending";
        case "doctors":
          return "/admin/doctor-approve";
        case "news":
        default:
          return "/admin/news/pending";
      }
    },
  },

  methods: {
    formatNumber(num) {
      const n = Number(num);
      if (Number.isNaN(n)) return "0";
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    formatDate(v) {
      if (!v) return "—";
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return String(v);
      const pad = (x) => String(x).padStart(2, "0");
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(
        d.getMinutes()
      )}:${pad(d.getSeconds())}`;
    },

    // ✅ FIX: pending campaigns lấy từ endpoint chuẩn
    async fetchPendingCampaigns() {
      try {
        const res = await baseRequestAdmin.get("/admin/campaigns/pending", {
          params: { q: "", type: "" },
        });

        if (!res?.data?.status) {
          this.pendingCampaigns = [];
          return;
        }

        const raw = res.data.data || [];

        this.pendingCampaigns = raw.map((c) => {
          const hospital =
            c.locate_type === "donation_site"
              ? c?.donation_site?.name || "—"
              : c.location || "—";

          return {
            id: c.id,
            title: c.title,
            hospital,
            date: c.created_at || c.createdAt || new Date(),
          };
        });
      } catch (e) {
        console.error("fetchPendingCampaigns error:", e);
        this.pendingCampaigns = [];
      }
    },

    async fetchDashboardData() {
      try {
        this.loading = true;

        const res = await baseRequestAdmin.get("/admin/dashboard", {
          params: { filter: this.filterTime },
        });

        if (!res?.data?.status) throw new Error(res?.data?.message || "Không thể tải dữ liệu dashboard");

        const payload = res.data.data || {};

        const s = payload.stats || {};
        this.stats.totalUsers = s.totalUsers || 0;
        this.stats.newUsers = s.newUsers || 0;
        this.stats.activeHospitals = s.activeHospitals || 0;
        this.stats.pendingRequests = s.pendingRequests || 0;
        this.stats.totalBloodUnits = s.totalBloodUnits || 0;

        this.pendingNews = payload.pendingNews || [];
        this.pendingDoctors = payload.pendingDoctors || [];
        this.systemLogs = payload.systemLogs || [];

        // ✅ luôn sync pending campaigns từ endpoint chuẩn
        await this.fetchPendingCampaigns();

        // ✅ Giữ màu line chart kể cả backend trả về data
        if (payload.growthChartData) {
          const g = payload.growthChartData;
          const ds0 = g?.datasets?.[0] || {};
          const ds1 = g?.datasets?.[1] || {};
          this.growthChartData = {
            labels: g.labels || [],
            datasets: [
              {
                label: ds0.label || "Người dùng mới",
                data: ds0.data || [],
                borderColor: "#0d6efd",
                backgroundColor: "#0d6efd",
                pointBackgroundColor: "#0d6efd",
                pointBorderColor: "#0d6efd",
                tension: 0.4,
              },
              {
                label: ds1.label || "Lượt hiến máu",
                data: ds1.data || [],
                borderColor: "#dc3545",
                backgroundColor: "#dc3545",
                pointBackgroundColor: "#dc3545",
                pointBorderColor: "#dc3545",
                tension: 0.4,
              },
            ],
          };
        }

        // ✅ Doughnut màu theo nhóm máu
        if (payload.bloodTypeChartData) {
          const b = payload.bloodTypeChartData;
          const labels = b.labels || ["O", "A", "B", "AB"];
          const data = b?.datasets?.[0]?.data || labels.map(() => 0);

          const colorMap = {
            "A+": "#0d6efd",
            "A-": "#6c757d",
            "B+": "#198754",
            "B-": "#20c997",
            "AB+": "#6610f2",
            "AB-": "#d63384",
            "O+": "#ffc107",
            "O-": "#fd7e14",
          };

          const fallbackPalette = ["#0dcaf0", "#6f42c1", "#fd7e14", "#198754", "#0d6efd", "#dc3545", "#ffc107", "#6c757d"];
          const backgroundColor = labels.map((lb, idx) => colorMap[lb] || fallbackPalette[idx % fallbackPalette.length]);

          this.bloodTypeChartData = {
            labels,
            datasets: [{ label: "Tỷ lệ nhóm máu", data, backgroundColor }],
          };
        }
      } catch (err) {
        console.error("Fetch dashboard error:", err);
        this.$toast?.error(err?.response?.data?.message || err?.message || "Lỗi khi tải dashboard");
      } finally {
        this.loading = false;
      }
    },

    // NEWS
    viewNews(id) {
      this.$router.push(`/admin/news/${id}`);
    },
    async approveNews(id) {
      try {
        this.approvingKey = `news-${id}`;
        const res = await baseRequestAdmin.patch(`/admin/news/${id}/approve`);
        if (!res?.data?.status) throw new Error(res?.data?.message || "Không thể duyệt bài");
        this.$toast?.success("Duyệt tin tức thành công");
        await this.fetchDashboardData();
      } catch (e) {
        this.$toast?.error(e?.response?.data?.message || e?.message || "Không thể duyệt bài");
      } finally {
        this.approvingKey = null;
      }
    },

    // CAMPAIGN
    viewCampaign(id) {
      this.$router.push(`/admin/campaigns/${id}`);
    },
    async approveCampaign(id) {
      try {
        this.approvingKey = `camp-${id}`;
        const res = await baseRequestAdmin.patch(`/admin/campaigns/${id}/approve`);
        if (!res?.data?.status) throw new Error(res?.data?.message || "Không thể duyệt chiến dịch");
        this.$toast?.success("Duyệt chiến dịch thành công");
        await this.fetchDashboardData();
      } catch (e) {
        this.$toast?.error(e?.response?.data?.message || e?.message || "Không thể duyệt chiến dịch");
      } finally {
        this.approvingKey = null;
      }
    },

    // DOCTOR
    viewDoctor() {
      this.$router.push("/admin/doctor-approve");
    },
    async approveDoctor(id) {
      try {
        this.approvingKey = `doc-${id}`;
        const res = await baseRequestAdmin.put(`/admin/doctors/${id}/approve`);
        if (!res?.data?.status) throw new Error(res?.data?.message || "Không thể duyệt bác sĩ");
        this.$toast?.success("Duyệt bác sĩ thành công");
        await this.fetchDashboardData();
      } catch (e) {
        this.$toast?.error(e?.response?.data?.message || e?.message || "Không thể duyệt bác sĩ");
      } finally {
        this.approvingKey = null;
      }
    },
  },

  mounted() {
    this.fetchDashboardData();
  },
};
</script>

<style scoped>
.bg-primary-subtle { background-color: #cfe2ff; }
.bg-success-subtle { background-color: #d1e7dd; }
.bg-warning-subtle { background-color: #fff3cd; }
.bg-danger-subtle  { background-color: #f8d7da; }

.nav-tabs .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
}
.nav-tabs .nav-link.active {
  border-bottom: 3px solid #0d6efd;
  color: #0d6efd !important;
  background: transparent;
}
.nav-tabs .nav-link:hover {
  border-color: transparent;
  color: #0d6efd;
}
</style>
