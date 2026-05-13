<template>
  <div class="container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div>
        <h3 class="fw-bold mb-1">Slot Capacity Dashboard</h3>
        <div class="text-muted small">
          Theo dõi tình trạng slot hiến máu realtime
        </div>
      </div>

      <div class="d-flex gap-2 flex-wrap">
        <input type="date" class="form-control" v-model="filters.from_date" />
        <input type="date" class="form-control" v-model="filters.to_date" />

        <select class="form-select" v-model="filters.type">
          <option value="">Tất cả</option>
          <option value="fixed_point">Điểm cố định</option>
          <option value="campaign">Chiến dịch</option>
        </select>

        <button class="btn btn-danger" @click="loadDashboard" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
          Tải dữ liệu
        </button>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card">
          <div class="card-body">
            <div class="small text-muted">Tổng slot</div>
            <div class="stat-value">{{ overview.total_slots || 0 }}</div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card">
          <div class="card-body">
            <div class="small text-muted">Tổng capacity</div>
            <div class="stat-value text-primary">{{ overview.total_capacity || 0 }}</div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card">
          <div class="card-body">
            <div class="small text-muted">Đã đăng ký</div>
            <div class="stat-value text-danger">{{ overview.current_count || 0 }}</div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card">
          <div class="card-body">
            <div class="small text-muted">Full %</div>
            <div class="stat-value text-success">{{ overview.percent || 0 }}%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body">
            <div class="fw-bold mb-3">
              <i class="bi bi-bar-chart-line text-danger me-1"></i>
              Biểu đồ đăng ký theo ngày
            </div>

            <div v-if="dashboard.by_date.length === 0" class="text-muted small">
              Chưa có dữ liệu biểu đồ.
            </div>

            <div v-else class="chart-bars">
              <div v-for="item in dashboard.by_date" :key="item.date" class="chart-row">
                <div class="chart-label">{{ formatShortDate(item.date) }}</div>
                <div class="chart-track">
                  <div
                    class="chart-fill bg-danger"
                    :style="{ width: `${Math.min(item.percent || 0, 100)}%` }"
                  ></div>
                </div>
                <div class="chart-value">
                  {{ item.current_count }}/{{ item.slot_capacity }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body">
            <div class="fw-bold mb-3">
              <i class="bi bi-graph-up-arrow text-danger me-1"></i>
              Peak Time
            </div>

            <div class="mb-4">
              <div class="d-flex justify-content-between mb-1">
                <span>Ca sáng 07:00 - 11:00</span>
                <strong>
                  {{ peakTime.morning.current_count || 0 }}/{{ peakTime.morning.slot_capacity || 0 }}
                  ({{ peakTime.morning.percent || 0 }}%)
                </strong>
              </div>

              <div class="progress" style="height: 8px">
                <div
                  class="progress-bar bg-danger"
                  :style="{ width: `${Math.min(peakTime.morning.percent || 0, 100)}%` }"
                ></div>
              </div>
            </div>

            <div>
              <div class="d-flex justify-content-between mb-1">
                <span>Ca chiều 13:00 - 17:00</span>
                <strong>
                  {{ peakTime.afternoon.current_count || 0 }}/{{ peakTime.afternoon.slot_capacity || 0 }}
                  ({{ peakTime.afternoon.percent || 0 }}%)
                </strong>
              </div>

              <div class="progress" style="height: 8px">
                <div
                  class="progress-bar bg-primary"
                  :style="{ width: `${Math.min(peakTime.afternoon.percent || 0, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body">
            <div class="fw-bold mb-3">
              <i class="bi bi-hospital text-danger me-1"></i>
              Top điểm hiến đông nhất
            </div>

            <div v-if="dashboard.top_sites.length === 0" class="text-muted small">
              Chưa có dữ liệu.
            </div>

            <div v-for="site in dashboard.top_sites" :key="site.donation_site_id" class="top-site-item">
              <div class="d-flex justify-content-between">
                <div class="fw-semibold">{{ site.name }}</div>
                <div class="text-danger fw-bold">{{ site.percent }}%</div>
              </div>

              <div class="small text-muted">
                {{ site.current_count }}/{{ site.slot_capacity }} người
              </div>

              <div class="progress mt-1" style="height: 6px">
                <div
                  class="progress-bar bg-danger"
                  :style="{ width: `${Math.min(site.percent || 0, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body">
            <div class="fw-bold mb-3">
              <i class="bi bi-exclamation-triangle text-warning me-1"></i>
              Slot gần đầy
            </div>

            <div v-if="dashboard.alert_slots.length === 0" class="text-muted small">
              Không có slot cảnh báo.
            </div>

            <div v-for="slot in dashboard.alert_slots" :key="slot.id" class="alert-slot-item">
              <div class="d-flex justify-content-between">
                <div>
                  <div class="fw-semibold">
                    {{ slot.donation_site_name || slot.campaign_title || "Slot" }}
                  </div>
                  <div class="small text-muted">
                    {{ formatDate(slot.slot_date) }} • {{ slot.time_range }}
                  </div>
                  <div class="small text-muted">
                    {{ slot.current_count }}/{{ slot.slot_capacity }} người
                  </div>
                </div>

                <div class="text-danger fw-bold">{{ slot.percent }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4 mb-3">
      <div class="card-body">
        <div class="fw-bold mb-3">
          <i class="bi bi-grid-3x3-gap text-danger me-1"></i>
          Heatmap
        </div>

        <div class="table-responsive">
          <table class="table align-middle">
            <thead class="table-light">
              <tr>
                <th>Ngày</th>
                <th>Ca sáng</th>
                <th>Ca chiều</th>
                <th>Tổng</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in dashboard.heatmap" :key="item.date">
                <td>{{ formatDate(item.date) }}</td>

                <td>
                  <div class="heatmap-box">
                    <div>
                      {{ item.morning.current_count }}/{{ item.morning.slot_capacity }}
                      <span class="text-muted small">({{ item.morning.percent }}%)</span>
                    </div>
                    <div class="progress mt-1" style="height: 5px">
                      <div
                        class="progress-bar bg-danger"
                        :style="{ width: `${Math.min(item.morning.percent, 100)}%` }"
                      ></div>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="heatmap-box">
                    <div>
                      {{ item.afternoon.current_count }}/{{ item.afternoon.slot_capacity }}
                      <span class="text-muted small">({{ item.afternoon.percent }}%)</span>
                    </div>
                    <div class="progress mt-1" style="height: 5px">
                      <div
                        class="progress-bar bg-primary"
                        :style="{ width: `${Math.min(item.afternoon.percent, 100)}%` }"
                      ></div>
                    </div>
                  </div>
                </td>

                <td>
                  <strong>
                    {{ item.total.current_count }}/{{ item.total.slot_capacity }}
                  </strong>
                  <span class="text-muted small">({{ item.total.percent }}%)</span>
                </td>
              </tr>

              <tr v-if="dashboard.heatmap.length === 0">
                <td colspan="4" class="text-center text-muted">
                  Chưa có dữ liệu heatmap.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body">
        <div class="fw-bold mb-3">
          <i class="bi bi-list-ul text-danger me-1"></i>
          Danh sách slot
        </div>

        <div class="table-responsive">
          <table class="table align-middle">
            <thead class="table-light">
              <tr>
                <th>Ngày</th>
                <th>Khung giờ</th>
                <th>Loại</th>
                <th>Địa điểm / Chiến dịch</th>
                <th>Đã đăng ký</th>
                <th>Capacity</th>
                <th>Full %</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="slot in dashboard.slots" :key="slot.id">
                <td>{{ formatDate(slot.slot_date) }}</td>

                <td>
                  {{ String(slot.start_time).slice(0, 5) }}
                  -
                  {{ String(slot.end_time).slice(0, 5) }}
                </td>

                <td>
                  <span
                    class="badge"
                    :class="
                      slot.type === 'campaign'
                        ? 'bg-danger-subtle text-danger'
                        : 'bg-primary-subtle text-primary'
                    "
                  >
                    {{ slot.type === "campaign" ? "Chiến dịch" : "Điểm cố định" }}
                  </span>
                </td>

                <td>
                  {{ slot.donation_site?.name || slot.campaign?.title || "-" }}
                </td>

                <td>{{ slot.current_count }}</td>
                <td>{{ slot.slot_capacity }}</td>

                <td>
                  <span
                    class="fw-bold"
                    :class="slot.percent >= 80 ? 'text-danger' : 'text-success'"
                  >
                    {{ slot.percent }}%
                  </span>
                </td>

                <td>
                  <span v-if="slot.is_expired" class="badge bg-secondary">
                    Đã qua giờ
                  </span>
                  <span v-else-if="slot.is_full" class="badge bg-danger">
                    Đầy
                  </span>
                  <span v-else class="badge bg-success">
                    Còn chỗ
                  </span>
                </td>
              </tr>

              <tr v-if="dashboard.slots.length === 0">
                <td colspan="8" class="text-center text-muted">
                  Chưa có dữ liệu slot.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestAdmin from "../../../core/baseRequestAdmin";
import socket from "../../../core/socket";

export default {
  name: "SlotDashboard",

  data() {
    return {
      loading: false,
      filters: {
        from_date: "",
        to_date: "",
        type: "",
      },
      dashboard: {
        overview: {},
        peak_time: {
          morning: {},
          afternoon: {},
        },
        by_date: [],
        heatmap: [],
        top_sites: [],
        status_distribution: [],
        alert_slots: [],
        slots: [],
      },
    };
  },

  computed: {
    overview() {
      return this.dashboard.overview || {};
    },

    peakTime() {
      return (
        this.dashboard.peak_time || {
          morning: {},
          afternoon: {},
        }
      );
    },
  },

  mounted() {
    this.setDefaultDateRange();
    this.loadDashboard();
    this.initSocket();
  },

  beforeUnmount() {
    socket.off("slot_capacity_updated", this.handleRealtime);
    socket.off("appointment_updated", this.handleRealtime);
  },

  methods: {
    setDefaultDateRange() {
      const today = new Date();
      const next7 = new Date();
      next7.setDate(today.getDate() + 7);

      this.filters.from_date = this.toDateInput(today);
      this.filters.to_date = this.toDateInput(next7);
    },

    toDateInput(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    },

    initSocket() {
      if (!socket.connected) socket.connect();

      socket.on("slot_capacity_updated", this.handleRealtime);
      socket.on("appointment_updated", this.handleRealtime);
    },

    handleRealtime() {
      this.loadDashboard();
    },

    async loadDashboard() {
      this.loading = true;

      try {
        const res = await baseRequestAdmin.get("/admin/slot-analytics", {
          params: this.filters,
        });

        if (res.data?.status) {
          this.dashboard = {
            ...this.dashboard,
            ...(res.data.data || {}),
          };
        } else {
          this.$toast?.error?.(res.data?.message || "Không tải được dashboard slot!");
        }
      } catch (error) {
        console.error("loadDashboard error:", error);
        this.$toast?.error?.("Không tải được dashboard slot!");
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    formatShortDate(date) {
      if (!date) return "-";

      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.stat-card {
  min-height: 120px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-top: 8px;
}

.alert-slot-item,
.top-site-item {
  padding: 12px;
  border-radius: 12px;
  background: #fff5f5;
  border: 1px solid #f1c2c2;
  margin-bottom: 12px;
}

.heatmap-box {
  min-width: 160px;
}

.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-row {
  display: grid;
  grid-template-columns: 70px 1fr 90px;
  align-items: center;
  gap: 10px;
}

.chart-label {
  font-size: 13px;
  color: #6c757d;
}

.chart-track {
  height: 10px;
  background: #f1f1f1;
  border-radius: 999px;
  overflow: hidden;
}

.chart-fill {
  height: 100%;
  border-radius: 999px;
}

.chart-value {
  font-size: 13px;
  text-align: right;
  color: #6c757d;
}
</style>