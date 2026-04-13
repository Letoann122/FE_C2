<template>
  <div class="container-fluid bg-body-tertiary py-5">
    <div class="row justify-content-center g-4">
      <!-- Sidebar -->
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

      <!-- Content -->
      <div class="col-md-9 col-lg-9">
        <div class="card shadow-sm border-0 rounded-4 bg-white p-4">
          <h4 class="fw-bold mb-1">
            <i class="bi bi-arrow-counterclockwise me-2 text-danger"></i>
            Lịch sử hiến máu
          </h4>
          <p class="text-muted mb-3">Theo dõi toàn bộ hành trình hiến máu của bạn</p>
          <hr class="border border-1 border-light-subtle my-3" />

          <!-- Stats -->
          <div class="row g-3 mb-4">
            <div v-for="(item, index) in stats" :key="index" class="col-md-4">
              <div class="card border-0 shadow-sm rounded-4 py-3 px-4 d-flex align-items-center">
                <div :class="[
                  'icon-box rounded-circle d-flex align-items-center justify-content-center me-3',
                  item.bg,
                ]" style="width: 45px; height: 45px">
                  <i :class="item.icon" class="fs-5"></i>
                </div>
                <div>
                  <p class="mb-1 text-muted small">{{ item.label }}</p>
                  <h5 class="fw-bold mb-0">{{ item.value }}</h5>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="card border-0 shadow-sm rounded-4 mb-4 p-3">
            <div class="row g-2 align-items-center">
              <div class="col-md-2">
                <select class="form-select" v-model="filters.year" @change="fetchHistory(1)">
                  <option value="">Tất cả năm</option>
                  <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
                </select>
              </div>

              <div class="col-md-2">
                <select class="form-select" v-model="filters.month" @change="fetchHistory(1)">
                  <option value="">Tất cả tháng</option>
                  <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
                </select>
              </div>

              <div class="col-md-8">
                <input type="text" class="form-control" placeholder="Tìm theo địa điểm / tên chiến dịch..."
                  v-model="filters.q" @input="onSearchInput" />
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="card border-0 shadow-sm rounded-4">
            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th><i class="bi bi-calendar3 me-2"></i>Ngày hiến</th>
                    <th><i class="bi bi-geo-alt me-2"></i>Địa điểm</th>
                    <th><i class="bi bi-droplet me-2"></i>Số lượng máu</th>
                    <th><i class="bi bi-chat-square-text me-2"></i>Ghi chú</th>
                  </tr>
                </thead>

                <tbody v-if="loading">
                  <tr>
                    <td colspan="4" class="text-center text-muted py-4">Đang tải dữ liệu...</td>
                  </tr>
                </tbody>

                <tbody v-else>
                  <tr v-if="donations.length === 0">
                    <td colspan="4" class="text-center text-muted py-4">
                      Chưa có dữ liệu lịch sử hiến máu.
                    </td>
                  </tr>

                  <tr v-for="item in donations" :key="item.id">
                    <td>{{ formatDate(item.collected_at) }}</td>

                    <td>
                      {{ buildLocation(item) }}
                      <div v-if="item.is_campaign && item.campaign_title" class="small text-muted mt-1">
                        <i class="bi bi-bullseye me-1"></i> Chiến dịch: {{ item.campaign_title }}
                      </div>
                    </td>

                    <td>
                      <span class="badge bg-light text-danger fw-semibold px-3 py-2">
                        {{ item.volume_ml }}ml
                      </span>
                    </td>
                    <td>{{ item.notes || "-" }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="p-3 d-flex justify-content-between align-items-center text-muted small border-top">
              <div>
                Hiển thị {{ donations.length }} kết quả
                <span v-if="meta.total_records">/ Tổng {{ meta.total_records }}</span>
              </div>

              <!-- Pagination -->
              <nav v-if="meta.total_pages > 1">
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{ disabled: meta.page <= 1 }">
                    <button class="page-link" @click="fetchHistory(meta.page - 1)" :disabled="meta.page <= 1">
                      Trước
                    </button>
                  </li>

                  <li class="page-item" v-for="p in pageNumbers" :key="p" :class="{ active: p === meta.page }">
                    <button class="page-link" @click="fetchHistory(p)">{{ p }}</button>
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
          <!-- /Table -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";

export default {
  name: "LichSuHienMau",
  data() {
    const now = new Date();
    return {
      loading: false,
      searchTimer: null,

      filters: { year: "", month: "", q: "" },

      stats: [
        {
          label: "Tổng số lần hiến",
          value: "0 lần",
          icon: "bi bi-droplet-fill text-danger",
          bg: "bg-light-danger",
        },
        {
          label: "Tổng lượng máu",
          value: "0ml",
          icon: "bi bi-beaker-fill text-primary",
          bg: "bg-light-primary",
        },
        {
          label: "Lần hiến gần nhất",
          value: "-",
          icon: "bi bi-calendar-check text-success",
          bg: "bg-light-success",
        },
      ],

      donations: [],

      meta: {
        page: 1,
        limit: 10,
        total_records: 0,
        total_pages: 1,
      },

      yearOptions: Array.from({ length: 6 }, (_, i) => now.getFullYear() - i),
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
    buildParams(page = 1) {
      const params = { page, limit: this.meta.limit };
      if (this.filters.year) params.year = this.filters.year;
      if (this.filters.month) params.month = this.filters.month;
      if (this.filters.q && this.filters.q.trim()) params.q = this.filters.q.trim();
      return params;
    },

    async fetchHistory(page = 1) {
      try {
        this.loading = true;

        const res = await baseRequestClient.get("/donor/donation-history", {
          params: this.buildParams(page),
        });

        if (res.data.status) {
          this.donations = res.data.data || [];
          this.meta = {
            page: res.data.meta?.page || page,
            limit: res.data.meta?.limit || this.meta.limit,
            total_records: res.data.meta?.total_records || 0,
            total_pages: res.data.meta?.total_pages || 1,
          };

          const s = res.data.stats || {};
          const totalCount = s.total_count || 0;
          const totalVolume = s.total_volume_ml || 0;
          const lastAt = s.last_donation_at || null;

          this.stats = [
            {
              label: "Tổng số lần hiến",
              value: `${totalCount} lần`,
              icon: "bi bi-droplet-fill text-danger",
              bg: "bg-light-danger",
            },
            {
              label: "Tổng lượng máu",
              value: `${Number(totalVolume).toLocaleString("vi-VN")}ml`,
              icon: "bi bi-beaker-fill text-primary",
              bg: "bg-light-primary",
            },
            {
              label: "Lần hiến gần nhất",
              value: lastAt ? this.formatDate(lastAt) : "-",
              icon: "bi bi-calendar-check text-success",
              bg: "bg-light-success",
            },
          ];
        } else {
          this.$toast?.error(res.data.message || "Không thể tải lịch sử hiến máu!");
        }
      } catch (err) {
        this.$toast?.error(err.response?.data?.message || "Không thể tải lịch sử hiến máu!");
      } finally {
        this.loading = false;
      }
    },

    onSearchInput() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => this.fetchHistory(1), 400);
    },

    formatDate(dateVal) {
      if (!dateVal) return "-";
      const d = new Date(dateVal);
      return d.toLocaleDateString("vi-VN");
    },

    // ✅ NEW: ưu tiên location_display từ BE (đã xử lý campaign location)
    buildLocation(item) {
      if (item.location_display && String(item.location_display).trim()) {
        return String(item.location_display).trim();
      }

      // fallback dữ liệu cũ
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

.bg-light-danger {
  background-color: rgba(255, 99, 132, 0.1);
}

.bg-light-primary {
  background-color: rgba(54, 162, 235, 0.1);
}

.bg-light-success {
  background-color: rgba(75, 192, 192, 0.1);
}

.table th {
  font-weight: 600;
  color: #333;
}

.table td {
  color: #444;
}

.badge {
  border-radius: 12px;
}
</style>
