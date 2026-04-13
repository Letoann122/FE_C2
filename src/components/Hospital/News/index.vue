<template>
  <div class="news-submission-page container-fluid py-4">
    <div class="row g-4">
      <div class="col-lg-3">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h6 class="card-title mb-3">
              <i class="bi bi-funnel-fill me-2"></i>Bộ lọc
            </h6>

            <div class="row g-3">
              <div class="col-12">
                <label class="form-label small">Trạng thái</label>
                <select v-model="filters.status" class="form-select form-select-sm">
                  <option value="">Tất cả</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label small">Từ khóa (tiêu đề)</label>
                <input
                  v-model="filters.keyword"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="Nhập tiêu đề..."
                />
              </div>

              <div class="col-12">
                <label class="form-label small">Thời gian</label>
                <select v-model="filters.time" class="form-select form-select-sm">
                  <option value="">Tất cả</option>
                  <option value="this_month">Tháng này</option>
                  <option value="last_month">Tháng trước</option>
                  <option value="this_year">Năm nay</option>
                  <option value="custom">Tùy chỉnh</option>
                </select>
              </div>

              <div class="col-12" v-if="filters.time === 'custom'">
                <label class="form-label small">Từ ngày</label>
                <input type="date" class="form-control form-control-sm" v-model="filters.start_from" />
              </div>

              <div class="col-12" v-if="filters.time === 'custom'">
                <label class="form-label small">Đến ngày</label>
                <input type="date" class="form-control form-control-sm" v-model="filters.start_to" />
              </div>

              <div class="col-12 d-grid">
                <button class="btn btn-danger btn-sm" @click="applyFilter">
                  <i class="bi bi-search"></i> Lọc
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="card-title mb-3">
              <i class="bi bi-graph-up me-2"></i>Thống kê nhanh
            </h6>

            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Tổng bài</span>
              <span class="fw-bold fs-5">{{ stats.total }}</span>
            </div>

            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Chờ duyệt</span>
              <span class="fw-bold fs-5 text-warning">{{ stats.pending }}</span>
            </div>

            <div class="d-flex justify-content-between">
              <span class="text-muted">Đã duyệt</span>
              <span class="fw-bold fs-5 text-success">{{ stats.approved }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-9">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="card-title mb-0">
                <i class="bi bi-newspaper me-2"></i>
                {{ isEditing ? "Cập nhật & Gửi lại" : "Đăng bài báo mới" }}
              </h5>

              </div>

            <form class="row g-3" @submit.prevent="submitForm">
              <div class="col-md-8">
                <label class="form-label">Tiêu đề</label>
                <input
                  v-model="form.title"
                  type="text"
                  class="form-control"
                  placeholder="Nhập tiêu đề bài báo"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Ngày hiển thị</label>
                <input v-model="form.published_date" type="date" class="form-control" />
              </div>

              <div class="col-12">
                <label class="form-label">Ảnh (URL)</label>
                <input
                  v-model="form.image_url"
                  type="text"
                  class="form-control"
                  placeholder="https://..."
                />
              </div>

              <div class="col-12">
                <label class="form-label">Nội dung</label>
                <textarea
                  v-model="form.content"
                  rows="6"
                  class="form-control"
                  placeholder="Nhập nội dung bài báo..."
                ></textarea>
              </div>

              <div class="col-12 d-flex justify-content-end">
                <button type="submit" class="btn btn-danger" :disabled="loading">
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  <i v-else class="bi bi-send me-1"></i>
                  {{ isEditing ? "Cập nhật & Gửi duyệt lại" : "Gửi duyệt" }}
                </button>
              </div>

              <div class="col-12" v-if="form.id && form.status === 'rejected' && form.review_note">
                <div class="alert alert-danger mb-0">
                  <div class="fw-bold mb-1">
                    <i class="bi bi-exclamation-triangle me-1"></i>Bị từ chối
                  </div>
                  <div>Lý do: {{ form.review_note }}</div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="card-title mb-0">
                <i class="bi bi-table me-2"></i>Danh sách bài của tôi
              </h5>

              </div>

            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Ngày</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú duyệt</th>
                    <th class="text-end">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in newsList" :key="item.id">
                    <td class="fw-bold">{{ item.title }}</td>

                    <td>{{ formatDate(item.published_date) }}</td>

                    <td>
                      <span v-if="item.status === 'approved'" class="badge bg-success">Đã duyệt</span>
                      <span v-else-if="item.status === 'rejected'" class="badge bg-danger">Từ chối</span>
                      <span v-else class="badge bg-warning text-dark">Chờ duyệt</span>
                    </td>

                    <td class="text-muted small">
                      <span v-if="item.status === 'rejected'" class="text-danger">
                        {{ item.review_note || "Không có ghi chú" }}
                      </span>
                      <span v-else>-</span>
                    </td>

                    <td class="text-end">
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="startEdit(item)"
                        title="Sửa lại để gửi duyệt"
                      >
                        <i class="bi bi-pencil-square me-1"></i>Sửa
                      </button>
                    </td>
                  </tr>

                  <tr v-if="newsList.length === 0">
                    <td colspan="5" class="text-center text-muted py-3">
                      Chưa có bài nào
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-end mt-3" v-if="pagination.totalPages > 1">
              <nav>
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
                    <button class="page-link" @click="goPage(pagination.page - 1)">Prev</button>
                  </li>

                  <li
                    class="page-item"
                    v-for="p in pageNumbers"
                    :key="p"
                    :class="{ active: p === pagination.page }"
                  >
                    <button class="page-link" @click="goPage(p)">{{ p }}</button>
                  </li>

                  <li class="page-item" :class="{ disabled: pagination.page >= pagination.totalPages }">
                    <button class="page-link" @click="goPage(pagination.page + 1)">Next</button>
                  </li>
                </ul>
              </nav>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "DoctorNewsSubmissionView",

  data() {
    return {
      loading: false,
      newsList: [],

      stats: { total: 0, pending: 0, approved: 0 },

      filters: {
        status: "",
        keyword: "",
        time: "",
        start_from: "",
        start_to: "",
        page: 1,
        limit: 10,
      },

      pagination: { page: 1, totalPages: 1 },

      form: {
        id: null,
        title: "",
        content: "",
        image_url: "",
        published_date: "",
        status: "",
        review_note: "",
      },
    };
  },

  computed: {
    isEditing() {
      return !!this.form.id;
    },

    pageNumbers() {
      const total = this.pagination.totalPages || 1;
      const current = this.pagination.page || 1;

      const windowSize = 5;
      let start = Math.max(1, current - Math.floor(windowSize / 2));
      let end = Math.min(total, start + windowSize - 1);
      start = Math.max(1, end - windowSize + 1);

      const pages = [];
      for (let p = start; p <= end; p++) pages.push(p);
      return pages;
    },
  },

  watch: {
    "filters.time"(val) {
      if (val !== "custom") {
        this.filters.start_from = "";
        this.filters.start_to = "";
      }
    },
  },

  mounted() {
    this.resetForm();
    this.applyFilter();
  },

  methods: {
    todayISO() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    },

    buildFilterParams() {
      const params = {
        status: this.filters.status || undefined,
        keyword: this.filters.keyword || undefined,
        time: this.filters.time || undefined,
        start_from: this.filters.start_from || undefined,
        start_to: this.filters.start_to || undefined,
        page: this.filters.page,
        limit: this.filters.limit,
      };

      if (!this.filters.time) {
        delete params.time;
        delete params.start_from;
        delete params.start_to;
      } else if (this.filters.time !== "custom") {
        delete params.start_from;
        delete params.start_to;
      } else {
        if (!this.filters.start_from || !this.filters.start_to) {
          delete params.start_from;
          delete params.start_to;
        }
      }

      return params;
    },

    applyFilter() {
      this.filters.page = 1;
      this.fetchData();
    },

    goPage(p) {
      const next = Math.max(1, Math.min(p, this.pagination.totalPages || 1));
      this.filters.page = next;
      this.fetchData();
    },

    fetchData() {
      const params = this.buildFilterParams();
      const fallback = "Lỗi tải danh sách bài báo!";

      baseRequestDoctor
        .get("/doctor/news", { params })
        .then((res) => {
          if (res.data.status) {
            const payload = res.data.data;
            const items = Array.isArray(payload) ? payload : payload?.items || [];
            this.newsList = items;

            this.pagination.page = payload?.page || params.page || 1;
            this.pagination.totalPages = payload?.totalPages || 1;

            this.recalcStats(items);
          } else {
            this.newsList = [];
            this.recalcStats([]);
            this.$toast.error(res.data.message || fallback);
          }
        })
        .catch((error) => {
          this.newsList = [];
          this.recalcStats([]);
          this.$toast.error(error.response?.data?.message || fallback);
        });
    },

    recalcStats(items) {
      this.stats.total = items.length;
      this.stats.pending = items.filter((x) => x.status === "pending").length;
      this.stats.approved = items.filter((x) => x.status === "approved").length;
    },

    validateFormBasic() {
      if (!this.form.title?.trim() || !this.form.content?.trim()) {
        this.$toast.error("Vui lòng nhập tiêu đề và nội dung!");
        return false;
      }
      if (!this.form.published_date) this.form.published_date = this.todayISO();
      return true;
    },

    submitForm() {
      if (!this.validateFormBasic()) return;

      this.loading = true;
      const fallback = "Có lỗi xảy ra!";

      const payload = {
        title: this.form.title,
        content: this.form.content,
        image_url: this.form.image_url || null,
        published_date: this.form.published_date,
        status: "pending",
      };

      const req = this.isEditing
        ? baseRequestDoctor.put(`/doctor/news/${this.form.id}`, payload)
        : baseRequestDoctor.post("/doctor/news", payload);

      req
        .then((res) => {
          if (res.data.status) {
            this.$toast.success(res.data.message || "Gửi duyệt thành công!");
            this.resetForm();
            this.applyFilter();
          } else {
            this.$toast.error(res.data.message || fallback);
          }
        })
        .catch((error) => {
          this.$toast.error(error.response?.data?.message || fallback);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    startEdit(item) {
      // Logic kiểm tra trạng thái trước khi cho sửa:
      if (item.status === "approved") {
        this.$toast.error("Bạn không thể sửa bài đã duyệt!");
        return;
      }
      if (item.status === "pending") {
        this.$toast.error("Bài viết đang chờ duyệt, không thể sửa!");
        return;
      }

      // Chỉ cho phép sửa khi bị từ chối (rejected)
      if (item.status !== "rejected") {
        this.$toast.error("Bài viết không ở trạng thái có thể chỉnh sửa.");
        return;
      }

      this.form = {
        id: item.id,
        title: item.title || "",
        content: item.content || "",
        image_url: item.image_url || "",
        published_date: (item.published_date || "").slice(0, 10),
        status: item.status || "",
        review_note: item.review_note || "",
      };
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    resetForm() {
      this.form = {
        id: null,
        title: "",
        content: "",
        image_url: "",
        published_date: this.todayISO(),
        status: "",
        review_note: "",
      };
    },

    formatDate(d) {
      if (!d) return "-";
      const date = new Date(d);
      if (Number.isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("vi-VN");
    },
  },
};
</script>

<style scoped>
.form-label {
  font-weight: 500;
}
</style>