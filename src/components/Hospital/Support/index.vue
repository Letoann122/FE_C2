<template>
  <div class="support-page-wrapper container-fluid py-4">
    <div class="mb-4">
      <h2 class="fw-bold">Tư vấn & Hỗ trợ</h2>
      <p class="text-muted">Gửi thông báo và cảnh báo đến donor.</p>
    </div>

    <div class="row g-4">
      <!-- LEFT: FILTER (GIỐNG CHECK-BOOKING) -->
      <div class="col-lg-3">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <h5 class="mb-3 fw-bold text-danger">
              <i class="bi bi-funnel me-2"></i> Lọc thông báo
            </h5>

            <div class="mb-3">
              <label class="form-label small">Tiêu đề</label>
              <input
                type="text"
                class="form-control"
                v-model="filters.title"
                placeholder="Nhập tiêu đề"
              />
            </div>

            <div class="mb-3">
              <label class="form-label small">Nhóm nhận</label>
              <select class="form-select" v-model="filters.recipient">
                <option value="">Tất cả</option>
                <option value="all">Tất cả donor</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label small">Loại</label>
              <select class="form-select" v-model="filters.type">
                <option value="">Tất cả</option>
                <option value="normal">Thường</option>
                <option value="emergency">Khẩn cấp</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label small">Ngày gửi từ</label>
              <input type="date" class="form-control" v-model="filters.from_date" />
            </div>

            <div class="mb-3">
              <label class="form-label small">Ngày gửi đến</label>
              <input type="date" class="form-control" v-model="filters.to_date" />
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-danger mt-2" @click="applyFilter">
                Lọc dữ liệu
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="col-lg-9">
        <!-- SEND FORM -->
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-4">
              <i class="bi bi-megaphone-fill text-danger me-2"></i>
              Gửi thông báo mới
            </h5>

            <form @submit.prevent="submitConsultation">
              <div class="mb-3">
                <label class="form-label">Tiêu đề</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="form.title"
                  placeholder="Nhập tiêu đề thông báo"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Gửi đến nhóm máu</label>
                <select class="form-select" v-model="form.recipient">
                  <option value="all">Tất cả donor</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div class="form-check form-switch mb-3">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="form.emergency"
                  id="emergencySwitch"
                />
                <label class="form-check-label text-danger fw-bold" for="emergencySwitch">
                  Gửi thông báo khẩn cấp (Emergency Alert)
                </label>
              </div>

              <div class="mb-3">
                <label class="form-label">Nội dung</label>
                <textarea
                  class="form-control"
                  rows="5"
                  v-model="form.content"
                  placeholder="Nhập nội dung chi tiết..."
                ></textarea>
              </div>

              <button class="btn btn-danger px-4" :disabled="sending">
                <i class="bi bi-send-fill me-2"></i>
                <span v-if="sending">Đang gửi...</span>
                <span v-else>Gửi thông báo</span>
              </button>
            </form>
          </div>
        </div>

        <!-- LIST -->
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0">
              <i class="bi bi-mailbox2 me-2"></i>Danh sách đã gửi
            </h5>
            <div class="text-muted small">
              Hiển thị: <strong>{{ pageFrom }}-{{ pageTo }}</strong> / {{ totalItems }}
            </div>
          </div>

          <div class="card-body">
            <div v-if="!loaded" class="text-center py-4">
              <div class="spinner-border text-danger"></div>
            </div>

            <div v-else class="table-responsive">
              <table class="table align-middle table-hover">
                <thead class="table-light">
                  <tr>
                    <th style="width: 70px">STT</th>
                    <th>Tiêu đề</th>
                    <th>Nhóm</th>
                    <th>Loại</th>
                    <th>Ngày gửi</th>
                    <th>SL gửi</th>
                    <th class="text-center">Xem</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(item, index) in paginatedList" :key="item.id">
                    <td>{{ rowNumber(index) }}</td>
                    <td class="fw-semibold">{{ item.title }}</td>
                    <td>{{ item.recipient === "all" ? "All" : item.recipient }}</td>
                    <td>
                      <span v-if="item.emergency" class="text-danger">Khẩn cấp</span>
                      <span v-else>Thường</span>
                    </td>
                    <td>{{ formatDate(item.created_at) }}</td>
                    <td>{{ item.sent_count }}</td>

                    <td class="text-center">
                      <button
                        class="btn btn-sm btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#notificationDetailModal"
                        @click="openDetail(item)"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>

                  <tr v-if="paginatedList.length === 0">
                    <td colspan="7" class="text-center text-muted py-3">
                      Không có thông báo phù hợp.
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- PAGINATION -->
              <div class="d-flex align-items-center justify-content-end px-2 py-3 border-top">
                <nav aria-label="Pagination">
                  <ul class="pagination mb-0">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                        ‹
                      </button>
                    </li>

                    <li
                      v-for="p in pageNumbers"
                      :key="String(p)"
                      class="page-item"
                      :class="{ active: p === currentPage, disabled: p === '...' }"
                    >
                      <button v-if="p !== '...'" class="page-link" @click="goToPage(p)">
                        {{ p }}
                      </button>
                      <span v-else class="page-link">...</span>
                    </li>

                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                        ›
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
              <!-- /PAGINATION -->
            </div>
          </div>
        </div>

        <!-- DETAIL MODAL -->
        <div class="modal fade" id="notificationDetailModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="bi bi-mailbox2 text-danger me-2"></i>
                  Chi tiết thông báo
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>

              <div class="modal-body" v-if="selectedNotification">
                <p class="mb-1"><strong>Tiêu đề:</strong> {{ selectedNotification.title }}</p>
                <p class="mb-1"><strong>Ngày gửi:</strong> {{ formatDate(selectedNotification.created_at) }}</p>
                <p class="mb-1">
                  <strong>Người nhận:</strong>
                  {{ selectedNotification.recipient === "all" ? "Tất cả donor" : selectedNotification.recipient }}
                </p>
                <p class="mb-3">
                  <strong>Loại:</strong>
                  <span class="badge bg-danger ms-1" v-if="selectedNotification.emergency">Khẩn cấp</span>
                  <span class="badge bg-secondary ms-1" v-else>Thông thường</span>
                </p>

                <p class="mb-1"><strong>Nội dung:</strong></p>
                <div class="border rounded p-3 bg-light" style="white-space: pre-line;">
                  {{ selectedNotification.content }}
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
              </div>
            </div>
          </div>
        </div>
        <!-- /DETAIL MODAL -->
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  data() {
    return {
      loaded: false,
      sending: false,

      form: {
        title: "",
        recipient: "all",
        emergency: false,
        content: "",
      },

      notifications: [],
      selectedNotification: null,

      // FILTER giống check-booking
      filters: {
        title: "",
        recipient: "",
        type: "",
        from_date: "",
        to_date: "",
      },

      filteredList: [],
      lastParams: {},

      pageSize: 15,
      currentPage: 1,
    };
  },

  computed: {
    totalItems() {
      return (this.filteredList || []).length;
    },

    totalPages() {
      const n = Math.ceil(this.totalItems / this.pageSize);
      return n <= 0 ? 1 : n;
    },

    paginatedList() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredList.slice(start, start + this.pageSize);
    },

    pageFrom() {
      if (this.totalItems === 0) return 0;
      return (this.currentPage - 1) * this.pageSize + 1;
    },

    pageTo() {
      if (this.totalItems === 0) return 0;
      return Math.min(this.currentPage * this.pageSize, this.totalItems);
    },

    pageNumbers() {
      const total = this.totalPages;
      const cur = this.currentPage;

      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

      const pages = new Set([1, 2, total - 1, total, cur - 1, cur, cur + 1]);
      const arr = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

      const out = [];
      for (let i = 0; i < arr.length; i++) {
        out.push(arr[i]);
        if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) out.push("...");
      }
      return out;
    },
  },

  mounted() {
    this.loadNotifications();
  },

  methods: {
    rowNumber(indexInPage) {
      return (this.currentPage - 1) * this.pageSize + indexInPage + 1;
    },

    goToPage(p) {
      if (p === "...") return;
      const page = Number(p);
      if (Number.isNaN(page)) return;
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    async loadNotifications() {
      this.loaded = false;
      try {
        const res = await baseRequestDoctor.get("/doctor/support/notifications");
        if (res.data.status) {
          this.notifications = res.data.data || [];
          this.filteredList = [...this.notifications];
          this.currentPage = 1;
        }
      } catch (e) {
        this.$toast?.error("Không thể tải danh sách thông báo!");
      } finally {
        this.loaded = true;
      }
    },

    applyFilter() {
      const t = (this.filters.title || "").trim().toLowerCase();
      const recipient = this.filters.recipient;
      const type = this.filters.type;
      const from = this.filters.from_date ? new Date(this.filters.from_date) : null;
      const to = this.filters.to_date ? new Date(this.filters.to_date) : null;

      this.filteredList = (this.notifications || []).filter((x) => {
        // title
        if (t && !(x.title || "").toLowerCase().includes(t)) return false;

        // recipient
        if (recipient) {
          if (recipient === "all") {
            if (x.recipient !== "all") return false;
          } else {
            if (x.recipient !== recipient) return false;
          }
        }

        // type
        if (type === "emergency" && !x.emergency) return false;
        if (type === "normal" && x.emergency) return false;

        // date range
        const created = x.created_at ? new Date(x.created_at) : null;
        if (from && created && created < from) return false;
        if (to && created) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          if (created > end) return false;
        }

        return true;
      });

      this.currentPage = 1;
    },
    async submitConsultation() {
      if (!this.form.title || !this.form.content) {
        return this.$toast.error("Tiêu đề và nội dung không được để trống!");
      }

      this.sending = true;
      try {
        // BE bạn gửi: 1 endpoint nhận cả emergency
        const res = await baseRequestDoctor.post("/doctor/support/notifications", this.form);

        if (res.data.status) this.$toast.success(res.data.message || "Gửi thông báo thành công!");
        else this.$toast.error(res.data.message || "Gửi thông báo thất bại!");

        await this.loadNotifications();

        this.form = { title: "", recipient: "all", emergency: false, content: "" };
      } catch (err) {
        this.$toast.error("Lỗi server!");
      } finally {
        this.sending = false;
      }
    },

    formatDate(d) {
      if (!d) return "-";
      return new Date(d).toLocaleDateString("vi-VN");
    },

    getStatusClass(status) {
      switch (status) {
        case "sent":
          return "badge-green";
        case "sending":
          return "badge-yellow";
        default:
          return "badge-yellow";
      }
    },

    getStatusText(status) {
      switch (status) {
        case "sent":
          return "Đã gửi";
        case "sending":
          return "Đang gửi";
        default:
          return "Khác";
      }
    },

    openDetail(item) {
      this.selectedNotification = item;
    },
  },
};
</script>

<style scoped>
.badge {
  padding: 0.4em 0.7em;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 20px;
}

.badge-green {
  background: #d1e7dd;
  color: #198754;
}

.badge-yellow {
  background: #fff3cd;
  color: #664d03;
}

.support-page-wrapper {
  min-height: 100%;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
</style>
