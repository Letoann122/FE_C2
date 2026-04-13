<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-1 text-primary">
          <i class="bi bi-newspaper me-2"></i>Quản lý & Xét duyệt Tin tức
        </h3>
        <p class="text-muted mb-0">
          Admin xét duyệt các bài viết y khoa do bác sĩ gửi lên hệ thống.
        </p>
      </div>
    </div>

    <!-- PENDING -->
    <div class="card shadow-sm mb-4 border-0">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <div class="fw-bold">
          <i class="bi bi-hourglass-split me-2 text-primary"></i>Bài viết chờ duyệt (Pending)
        </div>
        <div class="d-flex gap-2">
          <input v-model="pendingFilters.q" type="text" class="form-control form-control-sm"
            placeholder="Tìm theo tiêu đề..." style="width: 260px" />
          <button class="btn btn-sm btn-warning text-dark" @click="fetchPending">
            <i class="bi bi-search me-1"></i>Lọc
          </button>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loadingPending" class="text-center py-4">
          <div class="spinner-border text-warning"></div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 50px">#</th>
                <th style="width: 100px">Ảnh</th>
                <th>Bài viết</th>
                <th>Tác giả</th>
                <th>Ngày đăng ký</th>
                <th class="text-end" style="width: 180px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in pendingNews" :key="item.id">
                <td>{{ idx + 1 }}</td>
                <td>
                  <img :src="item.image_url || 'https://via.placeholder.com/150'" class="rounded object-fit-cover"
                    width="80" height="50" alt="thumb" />
                </td>
                <td class="fw-semibold">
                  <div class="text-truncate" style="max-width: 300px" :title="item.title">
                    {{ item.title }}
                  </div>
                  <div class="text-muted small fw-normal">
                    {{ truncate(item.content, 60) }}
                  </div>
                </td>
                <td>
                  <div class="fw-bold">
                    {{ item.creator?.full_name || "Bác sĩ ẩn danh" }}
                  </div>
                  <div class="small text-muted">
                    {{ item.creator?.email || "-" }}
                  </div>
                </td>
                <td>{{ fmtDate(item.published_date) }}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-2" data-bs-toggle="modal"
                    data-bs-target="#previewNewsModal" @click="openPreviewModal(item)">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-success me-2" data-bs-toggle="modal" data-bs-target="#approveNewsModal"
                    @click="openApproveModal(item)">
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#rejectNewsModal"
                    @click="openRejectModal(item)">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="pendingNews.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  Không có bài viết nào đang chờ duyệt.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ALL NEWS -->
    <div class="card shadow-sm border-0">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <div class="fw-bold">
          <i class="bi bi-table text-primary me-2"></i>Danh sách toàn bộ tin tức
        </div>
        <div class="d-flex gap-2">
          <input v-model="allFilters.q" type="text" class="form-control form-control-sm"
            placeholder="Tìm theo tiêu đề..." style="width: 260px" />
          <select v-model="allFilters.status" class="form-select form-select-sm" style="width: 160px">
            <option value="">Trạng thái: Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="draft">Nháp</option>
          </select>
          <button class="btn btn-sm btn-primary" @click="fetchAllNews">
            <i class="bi bi-search me-1"></i>Lọc
          </button>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loadingAll" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 50px">ID</th>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Ngày đăng</th>
                <th class="text-center">Trạng thái</th>
                <th class="text-end" style="width: 150px">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in allNews" :key="item.id">
                <td>{{ item.id }}</td>
                <td class="fw-semibold">
                  <div class="text-truncate" style="max-width: 350px">
                    {{ item.title }}
                  </div>
                </td>
                <td>{{ item.creator?.full_name || "-" }}</td>
                <td>{{ fmtDate(item.published_date) }}</td>
                <td class="text-center">
                  <span v-if="item.status === 'approved'" class="badge bg-success">Đã duyệt</span>
                  <span v-else-if="item.status === 'rejected'" class="badge bg-danger" :title="item.review_note">Từ
                    chối</span>
                  <span v-else-if="item.status === 'draft'" class="badge bg-secondary">Nháp</span>
                  <span v-else class="badge bg-warning text-dark">Chờ duyệt</span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-2" data-bs-toggle="modal"
                    data-bs-target="#previewNewsModal" @click="openPreviewModal(item)">
                    Chi tiết
                  </button>
                  <button class="btn btn-sm btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deleteNewsModal"
                    @click="openDeleteModal(item)" title="Xóa vĩnh viễn">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="allNews.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  Không có tin tức nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PREVIEW MODAL -->
    <div class="modal fade" id="previewNewsModal" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-primary">Nội dung bài viết</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selected">
              <h4 class="fw-bold mb-3">{{ selected.title }}</h4>
              <div class="d-flex align-items-center text-muted mb-3 small">
                <span class="me-3">
                  <i class="bi bi-person me-1"></i>{{ selected.creator?.full_name }}
                </span>
                <span>
                  <i class="bi bi-calendar me-1"></i>{{ fmtDate(selected.published_date) }}
                </span>
              </div>
              <div v-if="selected.image_url" class="mb-3 text-center">
                <img :src="selected.image_url" class="img-fluid rounded shadow-sm" style="max-height: 400px" />
              </div>
              <div class="bg-light p-3 rounded" style="white-space: pre-wrap">
                {{ selected.content }}
              </div>
              <div v-if="selected.status === 'rejected'" class="alert alert-danger mt-3">
                <strong><i class="bi bi-exclamation-triangle"></i> Lý do
                  từ chối:</strong>
                {{ selected.review_note }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div v-if="selected?.status === 'pending'">
              <button class="btn btn-danger me-2" data-bs-toggle="modal" data-bs-target="#rejectNewsModal"
                data-bs-dismiss="modal" @click="openRejectModal(selected)">
                Từ chối
              </button>
              <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#approveNewsModal"
                data-bs-dismiss="modal" @click="openApproveModal(selected)">
                Duyệt ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- APPROVE MODAL -->
    <div class="modal fade" id="approveNewsModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-success">Xác nhận duyệt bài</h5>
            <button class="btn-close" data-bs-dismiss="modal" ref="approveCloseBtn"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xuất bản bài viết này?</p>
            <div class="alert alert-light border">
              <strong>{{ selected?.title }}</strong>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Huỷ
            </button>
            <button class="btn btn-success" @click="confirmApprove" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              Xác nhận duyệt
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- REJECT MODAL -->
    <div class="modal fade" id="rejectNewsModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">Từ chối bài viết</h5>
            <button class="btn-close" data-bs-dismiss="modal" ref="rejectCloseBtn"></button>
          </div>
          <div class="modal-body">
            <p>Nhập lý do từ chối (bác sĩ sẽ nhìn thấy):</p>
            <div class="mb-3 fw-bold text-muted">
              {{ selected?.title }}
            </div>
            <textarea v-model="reviewNote" class="form-control" rows="4"
              placeholder="Ví dụ: Nội dung không phù hợp..."></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Huỷ
            </button>
            <button class="btn btn-danger" @click="confirmReject" :disabled="submitting || !reviewNote.trim()">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              Gửi phản hồi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div class="modal fade" id="deleteNewsModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">Xóa bài viết</h5>
            <button class="btn-close" data-bs-dismiss="modal" ref="deleteCloseBtn"></button>
          </div>
          <div class="modal-body">
            <p class="text-danger fw-bold">
              <i class="bi bi-exclamation-triangle me-2"></i>Hành động này không
              thể hoàn tác!
            </p>
            <p>Bạn có chắc chắn muốn xóa vĩnh viễn bài viết:</p>
            <div class="alert alert-secondary mb-0">
              <strong>{{ selected?.title }}</strong>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Huỷ
            </button>
            <button class="btn btn-danger" @click="confirmDelete" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              Xóa vĩnh viễn
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestAdmin from "../../../core/baseRequestAdmin";

export default {
  name: "NewsManagementAdmin",

  data() {
    return {
      pendingNews: [],
      allNews: [],
      pendingFilters: { q: "" },
      allFilters: { q: "", status: "" },
      loadingPending: false,
      loadingAll: false,
      submitting: false,

      selected: null,
      reviewNote: "",
    };
  },

  mounted() {
    this.reloadAll();
  },

  methods: {
    fmtDate(d) {
      if (!d) return "-";
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return "-";
      return dt.toLocaleDateString("vi-VN");
    },
    truncate(text, length) {
      if (!text) return "";
      return text.length > length ? text.slice(0, length) + "..." : text;
    },
    async reloadAll() {
      await Promise.all([this.fetchPending(), this.fetchAllNews()]);
    },

    async fetchPending() {
      this.loadingPending = true;
      try {
        const res = await baseRequestAdmin.get("/admin/news/pending", {
          params: { q: this.pendingFilters.q },
        });
        if (res.data.status) this.pendingNews = res.data.data || [];
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingPending = false;
      }
    },

    async fetchAllNews() {
      this.loadingAll = true;
      try {
        const res = await baseRequestAdmin.get("/admin/news", {
          params: {
            q: this.allFilters.q,
            status: this.allFilters.status,
          },
        });
        if (res.data.status) {
          const data = res.data.data;
          this.allNews = Array.isArray(data) ? data : data.items || [];
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingAll = false;
      }
    },

    // --- ACTIONS ---
    openPreviewModal(item) {
      this.selected = item;
      // modal mở bằng data-bs-toggle
    },

    openApproveModal(item) {
      this.selected = item;
    },

    openRejectModal(item) {
      this.selected = item;
      this.reviewNote = "";
    },

    openDeleteModal(item) {
      this.selected = item;
    },

    async confirmApprove() {
      if (!this.selected) return;
      this.submitting = true;
      try {
        const res = await baseRequestAdmin.patch(
          `/admin/news/${this.selected.id}/approve`
        );
        if (res.data.status) {
          this.$toast.success("Duyệt bài thành công!");
          this.$refs.approveCloseBtn?.click();
          await this.reloadAll();
        } else {
          this.$toast.error(res.data.message);
        }
      } catch (e) {
        this.$toast.error("Lỗi xảy ra");
      } finally {
        this.submitting = false;
      }
    },

    async confirmReject() {
      if (!this.selected) return;
      this.submitting = true;
      try {
        const res = await baseRequestAdmin.patch(
          `/admin/news/${this.selected.id}/reject`,
          { review_note: this.reviewNote }
        );
        if (res.data.status) {
          this.$toast.success("Đã từ chối bài viết");
          this.$refs.rejectCloseBtn?.click();
          await this.reloadAll();
        } else {
          this.$toast.error(res.data.message);
        }
      } catch (e) {
        this.$toast.error("Lỗi xảy ra");
      } finally {
        this.submitting = false;
      }
    },

    async confirmDelete() {
      if (!this.selected) return;
      this.submitting = true;
      try {
        const res = await baseRequestAdmin.delete(
          `/admin/news/${this.selected.id}`
        );
        if (res.data.status) {
          this.$toast.success("Đã xóa bài viết vĩnh viễn!");
          this.$refs.deleteCloseBtn?.click();
          await this.reloadAll();
        } else {
          this.$toast.error(res.data.message || "Lỗi xóa bài");
        }
      } catch (e) {
        this.$toast.error(
          e.response?.data?.message || "Có lỗi xảy ra"
        );
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.table th {
  font-weight: 600;
  color: #495057;
}

.object-fit-cover {
  object-fit: cover;
}
</style>
