<template>
  <div class="support-page-wrapper container-fluid py-4">
    <div class="mb-4">
      <h2 class="fw-bold">Tư vấn & Hỗ trợ</h2>
      <p class="text-muted">Gửi thông báo và cảnh báo đến donor.</p>
    </div>

    <div class="row g-4">
      <!-- FILTER -->
      <div class="col-lg-3">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <h5 class="mb-3 fw-bold text-danger">
              <i class="bi bi-funnel me-2"></i>
              Lọc thông báo
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
                <option v-for="b in bloodGroups" :key="b" :value="b">
                  {{ b }}
                </option>
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
              <label class="form-label small">Trạng thái</label>
              <select class="form-select" v-model="filters.status">
                <option value="">Tất cả</option>
                <option value="active">Đang diễn ra</option>
                <option value="ended">Kết thúc</option>
              </select>
            </div>

            <button class="btn btn-danger mt-2" @click="applyFilter">
              Lọc dữ liệu
            </button>
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
                  <option v-for="b in bloodGroups" :key="b" :value="b">
                    {{ b }}
                  </option>
                </select>
              </div>

              <div class="form-check form-switch mb-3">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="form.emergency"
                  id="emergencySwitch"
                />
                <label
                  class="form-check-label text-danger fw-bold"
                  for="emergencySwitch"
                >
                  Gửi thông báo khẩn cấp
                </label>
              </div>

              <div v-if="form.emergency" class="mb-3">
                <label class="form-label">Thời gian hết hạn cảnh báo</label>
                <input
                  type="datetime-local"
                  class="form-control"
                  v-model="form.expires_at"
                />
                <div class="form-text">
                  Sau thời gian này, cảnh báo sẽ tự ẩn. Bạn vẫn có thể tắt thủ
                  công trước hạn.
                </div>
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
                {{ sending ? "Đang gửi..." : "Gửi thông báo" }}
              </button>
            </form>
          </div>
        </div>

        <!-- LIST -->
        <div class="card shadow-sm border-0 mb-4">
          <div
            class="card-header bg-white py-3 d-flex justify-content-between align-items-center"
          >
            <h5 class="fw-bold mb-0">
              <i class="bi bi-mailbox2 me-2"></i>
              Danh sách đã gửi
            </h5>

            <div class="text-muted small">
              Hiển thị:
              <strong>{{ pageFrom }}-{{ pageTo }}</strong> /
              {{ totalItems }}
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
                    <th>Trạng thái</th>
                    <th>SL gửi</th>
                    <th class="text-center">Xem</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(item, index) in paginatedList" :key="item.id">
                    <td>{{ rowNumber(index) }}</td>

                    <td class="fw-semibold">
                      {{ item.title }}
                    </td>

                    <td>
                      {{ item.recipient === "all" ? "All" : item.recipient }}
                    </td>

                    <td>
                      <span
                        v-if="item.emergency"
                        class="text-danger fw-semibold"
                      >
                        Khẩn cấp
                      </span>
                      <span v-else>Thường</span>
                    </td>

                    <td>{{ formatDateTime(item.created_at) }}</td>

                    <td>
                      <span
                        class="badge"
                        :class="notificationStatus(item).class"
                      >
                        {{ notificationStatus(item).text }}
                      </span>
                    </td>

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
                    <td colspan="8" class="text-center text-muted py-3">
                      Không có thông báo phù hợp.
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- PAGINATION -->
              <div
                class="d-flex align-items-center justify-content-end px-2 py-3 border-top"
              >
                <nav aria-label="Pagination">
                  <ul class="pagination mb-0">
                    <li
                      class="page-item"
                      :class="{ disabled: currentPage === 1 }"
                    >
                      <button
                        class="page-link"
                        @click="goToPage(currentPage - 1)"
                        :disabled="currentPage === 1"
                      >
                        ‹
                      </button>
                    </li>

                    <li
                      v-for="p in pageNumbers"
                      :key="String(p)"
                      class="page-item"
                      :class="{
                        active: p === currentPage,
                        disabled: p === '...',
                      }"
                    >
                      <button
                        v-if="p !== '...'"
                        class="page-link"
                        @click="goToPage(p)"
                      >
                        {{ p }}
                      </button>

                      <span v-else class="page-link">...</span>
                    </li>

                    <li
                      class="page-item"
                      :class="{ disabled: currentPage === totalPages }"
                    >
                      <button
                        class="page-link"
                        @click="goToPage(currentPage + 1)"
                        :disabled="currentPage === totalPages"
                      >
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
        <div
          class="modal fade"
          id="notificationDetailModal"
          tabindex="-1"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="bi bi-mailbox2 text-danger me-2"></i>
                  Chi tiết thông báo
                </h5>

                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>

              <div class="modal-body" v-if="selectedNotification">
                <p class="mb-1">
                  <strong>Tiêu đề:</strong>
                  {{ selectedNotification.title }}
                </p>

                <p class="mb-1">
                  <strong>Ngày gửi:</strong>
                  {{ formatDateTime(selectedNotification.created_at) }}
                </p>

                <p class="mb-1">
                  <strong>Người nhận:</strong>
                  {{
                    selectedNotification.recipient === "all"
                      ? "Tất cả donor"
                      : selectedNotification.recipient
                  }}
                </p>

                <p class="mb-1">
                  <strong>Loại:</strong>
                  <span
                    class="badge bg-danger ms-1"
                    v-if="selectedNotification.emergency"
                  >
                    Khẩn cấp
                  </span>
                  <span class="badge bg-secondary ms-1" v-else>
                    Thông thường
                  </span>
                </p>

                <p class="mb-1">
                  <strong>Trạng thái:</strong>
                  <span
                    class="badge ms-1"
                    :class="notificationStatus(selectedNotification).class"
                  >
                    {{ notificationStatus(selectedNotification).text }}
                  </span>
                </p>

                <p v-if="selectedNotification.emergency" class="mb-3">
                  <strong>Hết hạn:</strong>
                  {{ formatDateTime(selectedNotification.expires_at) }}
                </p>

                <p class="mb-1">
                  <strong>Nội dung:</strong>
                </p>

                <div
                  class="border rounded p-3 bg-light"
                  style="white-space: pre-line"
                >
                  {{ selectedNotification.content }}
                </div>
              </div>

              <div class="modal-footer">
                <button
                  v-if="
                    selectedNotification &&
                    selectedNotification.emergency &&
                    notificationStatus(selectedNotification).text ===
                      'Đang diễn ra'
                  "
                  type="button"
                  class="btn btn-danger"
                  :disabled="closing"
                  @click="openCloseConfirmModal(selectedNotification)"
                >
                  Tắt cảnh báo
                </button>

                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- /DETAIL MODAL -->

        <!-- CLOSE CONFIRM MODAL -->
        <div
          class="modal fade"
          id="closeEmergencyModal"
          tabindex="-1"
          aria-hidden="true"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title text-danger">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  Xác nhận tắt cảnh báo
                </h5>

                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  :disabled="closing"
                ></button>
              </div>

              <div class="modal-body">
                <p class="mb-2">
                  Bạn có chắc muốn tắt cảnh báo khẩn cấp:
                  <strong class="text-danger">
                    "{{ closeTarget?.title }}"
                  </strong>
                  ?
                </p>

                <div class="small text-muted">
                  Banner donor sẽ biến mất realtime ngay lập tức.
                </div>
              </div>

              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                  :disabled="closing"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  class="btn btn-danger"
                  :disabled="closing"
                  @click="confirmCloseEmergency"
                >
                  <span
                    v-if="closing"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  Xác nhận tắt
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- /CLOSE CONFIRM MODAL -->
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";
import { Modal } from "bootstrap";

export default {
  data() {
    return {
      loaded: false,
      sending: false,
      closing: false,

      bloodGroups: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],

      form: {
        title: "",
        recipient: "all",
        emergency: false,
        content: "",
        expires_at: "",
      },

      notifications: [],
      selectedNotification: null,
      closeTarget: null,

      filters: {
        title: "",
        recipient: "",
        type: "",
        status: "",
      },

      filteredList: [],

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

      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      const pages = new Set([1, 2, total - 1, total, cur - 1, cur, cur + 1]);

      const arr = [...pages]
        .filter((p) => p >= 1 && p <= total)
        .sort((a, b) => a - b);

      const out = [];

      for (let i = 0; i < arr.length; i++) {
        out.push(arr[i]);

        if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) {
          out.push("...");
        }
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

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    notificationStatus(item) {
      if (!item.emergency) {
        return {
          text: "Thông thường",
          class: "bg-light text-dark border",
        };
      }

      if (
        item.is_active &&
        item.expires_at &&
        new Date(item.expires_at) > new Date()
      ) {
        return {
          text: "Đang diễn ra",
          class: "bg-danger",
        };
      }

      return {
        text: "Kết thúc",
        class: "bg-secondary",
      };
    },

    async loadNotifications() {
      this.loaded = false;

      try {
        const res = await baseRequestDoctor.get("/doctor/support/notifications");

        if (res.data.status) {
          this.notifications = res.data.data || [];
          this.applyFilter();
        }
      } catch (e) {
        this.$toast?.error("Không thể tải danh sách thông báo!");
      } finally {
        this.loaded = true;
      }
    },

    applyFilter() {
      const title = (this.filters.title || "").trim().toLowerCase();

      this.filteredList = (this.notifications || []).filter((item) => {
        if (title && !(item.title || "").toLowerCase().includes(title)) {
          return false;
        }

        if (this.filters.recipient) {
          if (item.recipient !== this.filters.recipient) return false;
        }

        if (this.filters.type === "emergency" && !item.emergency) {
          return false;
        }

        if (this.filters.type === "normal" && item.emergency) {
          return false;
        }

        if (this.filters.status === "active") {
          if (this.notificationStatus(item).text !== "Đang diễn ra") {
            return false;
          }
        }

        if (this.filters.status === "ended") {
          if (this.notificationStatus(item).text !== "Kết thúc") {
            return false;
          }
        }

        return true;
      });

      this.currentPage = 1;
    },

    async submitConsultation() {
      if (!this.form.title || !this.form.content) {
        return this.$toast?.error("Tiêu đề và nội dung không được để trống!");
      }

      if (this.form.emergency && !this.form.expires_at) {
        return this.$toast?.error("Vui lòng chọn thời gian hết hạn cảnh báo!");
      }

      if (this.form.emergency && new Date(this.form.expires_at) <= new Date()) {
        return this.$toast?.error("Thời gian hết hạn phải lớn hơn hiện tại!");
      }

      this.sending = true;

      try {
        const res = await baseRequestDoctor.post(
          "/doctor/support/notifications",
          this.form
        );

        if (res.data.status) {
          this.$toast?.success(res.data.message || "Gửi thông báo thành công!");

          await this.loadNotifications();

          this.form = {
            title: "",
            recipient: "all",
            emergency: false,
            content: "",
            expires_at: "",
          };
        } else {
          this.$toast?.error(res.data.message || "Gửi thông báo thất bại!");
        }
      } catch (err) {
        this.$toast?.error(err.response?.data?.message || "Lỗi server!");
      } finally {
        this.sending = false;
      }
    },

    openCloseConfirmModal(item) {
      this.closeTarget = item;

      const detailEl = document.getElementById("notificationDetailModal");
      const confirmEl = document.getElementById("closeEmergencyModal");

      const detailModal = Modal.getOrCreateInstance(detailEl);
      const confirmModal = Modal.getOrCreateInstance(confirmEl);

      detailEl.addEventListener(
        "hidden.bs.modal",
        () => {
          this.clearModalBackdrop();

          setTimeout(() => {
            confirmModal.show();
          }, 150);
        },
        { once: true }
      );

      detailModal.hide();
    },

    async confirmCloseEmergency() {
      if (!this.closeTarget?.id) return;

      this.closing = true;

      try {
        const res = await baseRequestDoctor.patch(
          `/doctor/support/notifications/${this.closeTarget.id}/close`
        );

        if (res.data.status) {
          this.$toast?.success(res.data.message || "Đã tắt cảnh báo.");

          const confirmEl = document.getElementById("closeEmergencyModal");
          const confirmModal = Modal.getOrCreateInstance(confirmEl);

          confirmEl.addEventListener(
            "hidden.bs.modal",
            () => {
              this.clearModalBackdrop();
            },
            { once: true }
          );

          confirmModal.hide();

          this.selectedNotification = {
            ...this.selectedNotification,
            is_active: 0,
            closed_at: new Date().toISOString(),
          };

          this.closeTarget = null;

          await this.loadNotifications();
        } else {
          this.$toast?.error(res.data.message || "Không thể tắt cảnh báo.");
        }
      } catch (error) {
        this.$toast?.error(
          error.response?.data?.message || "Lỗi khi tắt cảnh báo."
        );
      } finally {
        this.closing = false;
      }
    },

    clearModalBackdrop() {
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");

      document.querySelectorAll(".modal-backdrop").forEach((el) => {
        el.remove();
      });
    },

    formatDateTime(d) {
      if (!d) return "-";

      return new Date(d).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
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

.support-page-wrapper {
  min-height: 100%;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
</style>