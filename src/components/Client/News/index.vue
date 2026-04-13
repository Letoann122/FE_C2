<template>
  <section class="position-relative text-center d-flex align-items-center justify-content-center">
    <img src="../../../assets/img/banner2.jpg" alt="Banner hiến máu" class="w-100"
      style="height: 500px; opacity: 0.5" />
    <div class="position-absolute">
      <h2 class="fw-bold display-5">Tin tức & Chiến dịch Hiến Máu</h2>
      <p class="text-dark fw-semibold">Cập nhật nhanh các hoạt động hiến máu, sự kiện và thông báo quan trọng</p>
    </div>
  </section>

  <div class="container-fluid my-5">
    <div class="row g-4">
      <div class="col-lg-2">
        <div class="bg-white p-3 rounded shadow-sm border">
          <h6 class="fw-bold mb-3">Bộ lọc theo thời gian</h6>

          <div class="mb-3">
            <label class="form-label">Từ ngày</label>
            <input type="date" class="form-control" v-model="dateStart" />
          </div>
          <div class="mb-3">
            <label class="form-label">Đến ngày</label>
            <input type="date" class="form-control" v-model="dateEnd" />
          </div>

          <button class="btn btn-danger w-100 mt-2" @click="fetchNews(1)">
            <i class="bi bi-funnel me-1"></i> Lọc tin
          </button>
          <button class="btn btn-outline-secondary w-100 mt-2" @click="clearFilter">
            <i class="bi bi-x-circle me-1"></i> Xóa lọc
          </button>

          <hr />

          <h6 class="fw-bold mb-2">Lọc chiến dịch</h6>
          <select class="form-select" v-model="campaignStatus" @change="fetchCampaigns">
            <option value="active">Đang hoạt động</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="running">Đang diễn ra</option>
            <option value="ended">Đã kết thúc</option>
          </select>
        </div>
      </div>

      <!-- Danh sách tin -->
      <div class="col-lg-10">
        <div class="card border-0 bg-light p-3">
          <div class="d-flex align-items-center mb-3">
            <i class="bi bi-newspaper text-danger fs-4"></i>
            <h3 class="ms-2 mb-0">Tin tức mới nhất</h3>
          </div>

          <!-- Grid tin -->
          <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            <div v-for="(news, index) in newsList" :key="index">
              <div class="card h-100 shadow-sm">
                <img :src="news.image_url || defaultImage" alt="news" class="card-img-top"
                  style="height: 160px; object-fit: cover" />
                <div class="card-body d-flex flex-column">
                  <h6 class="fw-bold text-truncate" :title="news.title">{{ news.title }}</h6>
                  <small class="text-muted mb-2">{{ formatDate(news.published_date) }}</small>
                  <p class="card-text flex-grow-1 text-secondary small mb-3">
                    {{ truncate(news.content, 80) }}
                  </p>
                  <router-link :to="`/news/${news.id}`" class="btn btn-outline-danger btn-sm mt-auto align-self-end">
                    Xem chi tiết
                  </router-link>
                </div>
              </div>
            </div>

            <div v-if="newsList.length === 0" class="text-center text-muted my-5">
              <i class="bi bi-journal-x fs-3"></i>
              <p class="mt-2">Không có tin tức nào trong khoảng thời gian này.</p>
            </div>
          </div>

          <nav class="mt-4" v-if="totalPages > 1">
            <ul class="pagination justify-content-center mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="fetchNews(currentPage - 1)">«</a>
              </li>
              <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <a class="page-link" href="#" @click.prevent="fetchNews(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="fetchNews(currentPage + 1)">»</a>
              </li>
            </ul>
          </nav>
        </div>

        <!-- CAMPAIGNS -->
        <div class="card border-0 bg-white mt-4 shadow-sm">
          <div class="card-header bg-danger text-white fw-bold d-flex align-items-center justify-content-between">
            <div><i class="bi bi-heart-pulse me-2"></i>Chiến dịch hiến máu</div>
          </div>

          <div class="card-body">
            <div v-if="loadingCampaigns" class="text-center text-muted py-4">
              <div class="spinner-border text-danger"></div>
              <div class="small mt-2">Đang tải chiến dịch...</div>
            </div>

            <div v-else-if="campaigns.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-inbox fs-4"></i>
              <div class="mt-2">Chưa có chiến dịch phù hợp.</div>
            </div>

            <div v-else class="list-group">
              <div v-for="(c, i) in campaigns" :key="c.id || i"
                class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="fw-bold mb-1">{{ c.title }}</h6>

                  <div class="text-secondary">
                    <i class="bi bi-geo-alt-fill text-danger"></i>
                    {{ c.location_display || c.location || "Chưa cập nhật địa điểm" }}
                  </div>

                  <div class="text-secondary">
                    <i class="bi bi-calendar-event-fill text-danger"></i>
                    {{ formatDate(c.start_date) }} - {{ formatDate(c.end_date) }}
                  </div>

                  <span class="badge mt-2" :class="statusBadgeClass(c.status)">
                    {{ statusLabel(c.status) }}
                  </span>
                </div>

                <div class="d-flex gap-2">
                  <router-link :to="`/campaigns/${c.id}`" class="btn btn-danger btn-sm"
                    :class="{ disabled: c.status === 'ended' }">
                    Đăng ký tham gia
                  </router-link>
                </div>
              </div>
            </div>

            <div v-if="campaignError" class="alert alert-danger mt-3 mb-0">
              {{ campaignError }}
            </div>
          </div>
        </div>
        <!-- /CAMPAIGNS -->
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import baseRequestClient from "../../../core/baseRequestClient";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default {
  data() {
    return {
      // news
      newsList: [],
      currentPage: 1,
      totalPages: 1,
      dateStart: "",
      dateEnd: "",
      defaultImage: new URL("../../../assets/img/hienmau.jpg", import.meta.url).href,

      // campaigns
      campaignStatus: "active",
      campaigns: [],
      loadingCampaigns: false,
      campaignError: "",
    };
  },

  methods: {
    // ---------------- NEWS ----------------
    async fetchNews(page = 1) {
      try {
        const params = { page, limit: 8 };
        if (this.dateStart) params.start = this.dateStart;
        if (this.dateEnd) params.end = this.dateEnd;

        const res = await axios.get(`${API_BASE}/api/news`, { params });

        if (res.data.status) {
          this.newsList = res.data.data;
          this.currentPage = res.data.currentPage;
          this.totalPages = res.data.totalPages;
        }
      } catch (err) {
        console.error("Lỗi tải tin tức:", err);
        this.$toast?.error("Không thể tải tin tức!");
      }
    },

    clearFilter() {
      this.dateStart = "";
      this.dateEnd = "";
      this.fetchNews(1);
    },

    truncate(text, length) {
      if (!text) return "";
      return text.length > length ? text.substring(0, length) + "..." : text;
    },

    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    // --------------- CAMPAIGNS ---------------
    async fetchCampaigns() {
      this.loadingCampaigns = true;
      this.campaignError = "";
      try {
        const res = await baseRequestClient.get("/public/campaigns", {
          params: { status: this.campaignStatus },
        });

        if (res.data?.status) {
          this.campaigns = res.data.data || [];
        } else {
          this.campaigns = [];
          this.campaignError = res.data?.message || "Không thể tải chiến dịch!";
        }
      } catch (err) {
        this.campaigns = [];
        this.campaignError = err.response?.data?.message || "Lỗi server khi tải chiến dịch!";
      } finally {
        this.loadingCampaigns = false;
      }
    },

    statusLabel(s) {
      if (s === "upcoming") return "Sắp diễn ra";
      if (s === "running") return "Đang diễn ra";
      if (s === "ended") return "Đã kết thúc";
      return s || "-";
    },

    statusBadgeClass(s) {
      if (s === "running") return "bg-danger";
      if (s === "upcoming") return "bg-warning text-dark";
      if (s === "ended") return "bg-secondary";
      return "bg-light text-dark border";
    },
  },

  mounted() {
    this.fetchNews();
    this.fetchCampaigns();
  },
};
</script>

<style scoped></style>
