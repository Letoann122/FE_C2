<template>
  <div class="container-fluid bg-body-tertiary py-5">
    <div class="row justify-content-center g-4">
      <!-- Sidebar: GIỮ NGUYÊN -->
      <div class="col-md-3 col-lg-2">
        <div class="card border-0 shadow-sm rounded-4 p-2">
          <div class="list-group list-group-flush">
            <router-link to="/profile" class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold">
              <i class="bi bi-person-fill me-2"></i> Hồ sơ cá nhân
            </router-link>

            <router-link to="/blood-donation-history" class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold">
              <i class="bi bi-arrow-counterclockwise me-2"></i> Lịch sử hiến máu
            </router-link>

            <router-link to="/account-security" class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold">
              <i class="bi bi-shield-lock-fill me-2"></i> Bảo mật tài khoản
            </router-link>
          </div>
        </div>
      </div>

      <!-- Content: CHỈ THAY PHẦN NÀY -->
      <div class="col-md-9 col-lg-9">
        <div class="card shadow-sm border-0 rounded-4 bg-white p-4">
          <!-- Header -->
          <div class="mb-4">
            <h4 class="fw-bold mb-1">
              Lịch sử Hiến máu
            </h4>
          </div>

          <!-- Stats -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <div class="card border-0 shadow-sm rounded-4 stat-card h-100">
                <div class="card-body p-4 d-flex justify-content-between align-items-start">
                  <div>
                    <div class="small text-muted mb-2">Tổng số lần hiến</div>
                    <div class="display-6 fw-bold">{{ overview.total_count }}</div>
                  </div>

                  <div class="stat-icon bg-danger-subtle text-danger">
                    <i class="bi bi-person-heart"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="card border-0 shadow-sm rounded-4 stat-card h-100">
                <div class="card-body p-4 d-flex justify-content-between align-items-start">
                  <div>
                    <div class="small text-muted mb-2">Tổng lượng máu</div>
                    <div class="display-6 fw-bold">
                      {{ Number(overview.total_volume_ml || 0).toLocaleString("vi-VN") }}ml
                    </div>
                  </div>

                  <div class="stat-icon bg-success-subtle text-success">
                    <i class="bi bi-droplet-fill"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Eligibility -->
          <div class="card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                <div>
                  <h5 class="fw-bold mb-2">Tình trạng đủ điều kiện</h5>
                  <div class="text-muted">
                    <template v-if="eligibility.next_eligible_date">
                      Lần hiến tiếp theo vào ngày:
                      <strong>{{ formatDate(eligibility.next_eligible_date) }}</strong>
                    </template>
                    <template v-else>
                      Bạn chưa có dữ liệu hiến máu trước đó
                    </template>
                  </div>
                </div>

                <div class="eligibility-badge" :class="eligibility.remaining_days > 0 ? 'warning' : 'success'">
                  <i class="bi" :class="eligibility.remaining_days > 0 ? 'bi-hourglass-split' : 'bi-check-circle'"></i>
                  <span>
                    {{
                      eligibility.remaining_days > 0
                        ? `Còn ${eligibility.remaining_days} ngày nữa`
                        : "Đủ điều kiện hiến lại"
                    }}
                  </span>
                </div>
              </div>

              <div class="small text-muted mb-2">Tiến trình thời gian chờ</div>

              <div class="progress eligibility-progress mb-2" role="progressbar">
                <div class="progress-bar" :style="{ width: `${eligibility.progress_percent}%` }"></div>
              </div>

              <div class="d-flex justify-content-between small text-muted">
                <span>Thời gian chờ tối thiểu giữa hai lần hiến máu là 90 ngày</span>
                <strong>{{ eligibility.progress_percent }}%</strong>
              </div>
            </div>
          </div>

          <!-- History Table -->
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="p-4 border-bottom">
              <h5 class="fw-bold mb-0">Danh sách lịch sử</h5>
            </div>

            <div v-if="loading" class="p-4 text-center text-muted">
              Đang tải dữ liệu...
            </div>

            <div v-else-if="donations.length === 0" class="p-4 text-center text-muted">
              Chưa có dữ liệu lịch sử hiến máu.
            </div>

            <div v-else class="table-responsive">
              <table class="table align-middle mb-0 history-table">
                <thead>
                  <tr>
                    <th>Ngày hiến</th>
                    <th>Địa điểm</th>
                    <th>Lượng máu</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in donations" :key="item.id">
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="date-icon">
                          <i class="bi bi-calendar-event-fill"></i>
                        </div>
                        <span class="fw-medium">{{ formatDate(item.collected_at) }}</span>
                      </div>
                    </td>

                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-hospital text-secondary"></i>
                        <span>{{ buildLocation(item) }}</span>
                      </div>
                    </td>

                    <td>
                      <span class="fw-semibold">{{ item.volume_ml }} ml</span>
                    </td>

                    <td>
                      <span class="status-chip success">
                        <span class="dot"></span>
                        Thành công
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer / Pagination -->
            <div class="p-3 d-flex justify-content-between align-items-center border-top flex-wrap gap-2">
              <div class="small text-muted">
                Hiển thị {{ donations.length }} kết quả
                <span v-if="meta.total_records">/ Tổng {{ meta.total_records }}</span>
              </div>

              <nav v-if="meta.total_pages > 1">
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{ disabled: meta.page <= 1 }">
                    <button class="page-link" @click="fetchHistory(meta.page - 1)" :disabled="meta.page <= 1">
                      Trước
                    </button>
                  </li>

                  <li class="page-item" v-for="p in pageNumbers" :key="p" :class="{ active: p === meta.page }">
                    <button class="page-link" @click="fetchHistory(p)">
                      {{ p }}
                    </button>
                  </li>

                  <li class="page-item" :class="{ disabled: meta.page >= meta.total_pages }">
                    <button class="page-link" @click="fetchHistory(meta.page + 1)"
                      :disabled="meta.page >= meta.total_pages">
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <!-- /History Table -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";

export default {
  name: "BloodDonationHistoryPage",

  data() {
    return {
      loading: false,
      donations: [],
      overview: {
        total_count: 0,
        total_volume_ml: 0,
      },
      eligibility: {
        next_eligible_date: null,
        remaining_days: 0,
        progress_percent: 0,
      },
      meta: {
        page: 1,
        limit: 10,
        total_records: 0,
        total_pages: 1,
      },
    };
  },

  computed: {
    pageNumbers() {
      const total = this.meta.total_pages || 1;
      const current = this.meta.page || 1;

      const start = Math.max(1, current - 2);
      const end = Math.min(total, start + 4);

      const pages = [];
      for (let p = start; p <= end; p++) pages.push(p);
      return pages;
    },
  },

  mounted() {
    this.fetchHistory(1);
  },

  methods: {
    async fetchHistory(page = 1) {
      this.loading = true;

      try {
        const res = await baseRequestClient.get("/donor/donation-history", {
          params: {
            page,
            limit: this.meta.limit,
          },
        });

        if (res.data?.status) {
          this.donations = res.data.data || [];

          this.overview = {
            total_count: res.data.overview?.total_count || 0,
            total_volume_ml: res.data.overview?.total_volume_ml || 0,
          };

          this.eligibility = {
            next_eligible_date: res.data.eligibility?.next_eligible_date || null,
            remaining_days: res.data.eligibility?.remaining_days || 0,
            progress_percent: res.data.eligibility?.progress_percent || 0,
          };

          this.meta = {
            page: res.data.meta?.page || page,
            limit: res.data.meta?.limit || 10,
            total_records: res.data.meta?.total_records || 0,
            total_pages: res.data.meta?.total_pages || 1,
          };
        } else {
          this.$toast?.error?.(res.data?.message || "Không thể tải lịch sử hiến máu!");
        }
      } catch (err) {
        this.$toast?.error?.(
          err.response?.data?.message || "Không thể tải lịch sử hiến máu!"
        );
      } finally {
        this.loading = false;
      }
    },

    formatDate(dateVal) {
      if (!dateVal) return "-";
      const d = new Date(dateVal);
      return d.toLocaleDateString("vi-VN");
    },

    buildLocation(item) {
      if (item.location_display && String(item.location_display).trim()) {
        return String(item.location_display).trim();
      }

      const name = item.donation_site_name || item.hospital_name || "";
      const addr = item.donation_site_address || "";
      return [name, addr].filter(Boolean).join(" - ");
    },
  },
};
</script>

<style scoped>
.list-group-item.active {
  background-color: #ffecec !important;
  color: #dc3545 !important;
}

.donation-history-page .card {
  border-radius: 18px;
}

.stat-card {
  min-height: 120px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.eligibility-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

.eligibility-badge.warning {
  background: #fff7e6;
  color: #d97706;
  border: 1px solid #fde68a;
}

.eligibility-badge.success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.eligibility-progress {
  height: 8px;
  background: #eceff3;
  border-radius: 999px;
  overflow: hidden;
}

.eligibility-progress .progress-bar {
  background: #d6a94a;
  border-radius: 999px;
}

.history-table thead th {
  background: #f8f9fb;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  border-bottom: none;
  padding: 16px 20px;
}

.history-table tbody td {
  padding: 18px 20px;
  border-top: 1px solid #f1f3f5;
  vertical-align: middle;
}

.date-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #fee2e2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
}

.status-chip.success {
  background: #ecfdf5;
  color: #10b981;
}

.status-chip .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.page-link {
  border-radius: 8px;
}
</style>