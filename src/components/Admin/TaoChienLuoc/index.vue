<template>
  <div class="container-fluid py-4">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-1 text-danger">
          <i class="bi bi-check2-circle me-2"></i>Quản lý & Xét duyệt chiến dịch
        </h3>
        <p class="text-muted mb-0">
          Admin xét duyệt chiến dịch do bệnh viện/bác sĩ tạo, và quản lý chiến
          dịch toàn hệ thống.
        </p>
      </div>

      <button class="btn btn-outline-secondary" @click="reloadAll">
        <i class="bi bi-arrow-clockwise me-1"></i>Làm mới
      </button>
    </div>

    <!-- ===================== PENDING ===================== -->
    <div class="card shadow-sm mb-4 border-0">
      <div
        class="card-header bg-white d-flex justify-content-between align-items-center"
      >
        <div class="fw-bold">
          <i class="bi bi-shield-check text-danger me-2"></i>Xét duyệt chiến
          dịch (Pending)
        </div>

        <div class="d-flex gap-2">
          <input
            v-model="pendingFilters.q"
            type="text"
            class="form-control form-control-sm"
            placeholder="Tìm theo tiêu đề / địa điểm..."
            style="width: 260px"
          />

          <select
            v-model="pendingFilters.type"
            class="form-select form-select-sm"
            style="width: 150px"
          >
            <option value="">Tất cả loại</option>
            <option value="0">Định kỳ</option>
            <option value="1">Khẩn cấp</option>
          </select>

          <button class="btn btn-sm btn-danger" @click="fetchPending">
            <i class="bi bi-search me-1"></i>Lọc
          </button>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loadingPending" class="text-center py-4">
          <div class="spinner-border text-danger"></div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 55px">#</th>
                <th>Chiến dịch</th>
                <th>Loại</th>
                <th>Thời gian</th>
                <th>Địa điểm</th>
                <th>Người tạo</th>
                <th class="text-end" style="width: 170px">Hành động</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(c, idx) in pendingCampaigns" :key="c.id">
                <td>{{ idx + 1 }}</td>

                <td class="fw-semibold">
                  {{ c.title }}
                  <div class="text-muted small">
                    {{ truncate(c.content, 60) }}
                  </div>
                </td>

                <td>
                  <span
                    :class="[
                      'badge',
                      c.is_emergency ? 'bg-danger' : 'bg-primary',
                    ]"
                  >
                    {{ c.is_emergency ? "Khẩn cấp" : "Định kỳ" }}
                  </span>
                </td>

                <td>{{ c.start_date_fmt }} - {{ c.end_date_fmt }}</td>

                <td>
                  <span v-if="c.locate_type === 'custom'"
                    >{{ c.location || "-" }}</span
                  >
                  <span v-else>{{ c.donation_site?.name || "-" }}</span>
                </td>

                <td>{{ c.creator?.full_name || "-" }}</td>

                <td class="text-end">
                  <button
                    class="btn btn-sm btn-primary me-2"
                    data-bs-toggle="modal"
                    data-bs-target="#approveCampaignModal"
                    @click="openApproveModal(c)"
                  >
                    Duyệt
                  </button>
                  <button
                    class="btn btn-sm btn-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#rejectCampaignModal"
                    @click="openRejectModal(c)"
                  >
                    Từ chối
                  </button>
                </td>
              </tr>

              <tr v-if="pendingCampaigns.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  Không có chiến dịch nào đang chờ duyệt.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===================== TẤT CẢ CHIẾN DỊCH ===================== -->
    <div class="card shadow-sm border-0">
      <div
        class="card-header bg-white d-flex justify-content-between align-items-center"
      >
        <div class="fw-bold">
          <i class="bi bi-table text-danger me-2"></i>Quản lý chiến dịch
        </div>

        <div class="d-flex gap-2">
          <input
            v-model="allFilters.q"
            type="text"
            class="form-control form-control-sm"
            placeholder="Tìm theo tiêu đề / địa điểm..."
            style="width: 260px"
          />

          <select
            v-model="allFilters.approval_status"
            class="form-select form-select-sm"
            style="width: 160px"
          >
            <option value="">Duyệt: Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>

          <select
            v-model="allFilters.status"
            class="form-select form-select-sm"
            style="width: 160px"
          >
            <option value="">Trạng thái: Tất cả</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="running">Đang diễn ra</option>
            <option value="ended">Đã kết thúc</option>
          </select>

          <button class="btn btn-sm btn-danger" @click="fetchAllCampaigns">
            <i class="bi bi-search me-1"></i>Lọc
          </button>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loadingAll" class="text-center py-4">
          <div class="spinner-border text-danger"></div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Chiến dịch</th>
                <th>Loại</th>
                <th>Thời gian</th>
                <th>Địa điểm</th>
                <th class="text-center">Đăng ký</th>
                <th class="text-center">Duyệt</th>
                <th class="text-center">Trạng thái</th>
                <th class="text-end" style="width: 220px">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="c in campaigns" :key="c.id">
                <td class="fw-semibold">
                  <div>{{ c.title }}</div>
                  <div class="campaign-meta">
                    Tạo bởi: {{ c.creator?.full_name }}
                  </div>
                </td>

                <td>
                  <span
                    :class="[
                      'badge',
                      c.is_emergency ? 'bg-danger' : 'bg-primary',
                    ]"
                  >
                    {{ c.is_emergency ? "Khẩn cấp" : "Định kỳ" }}
                  </span>
                </td>

                <td>{{ c.start_date_fmt }} - {{ c.end_date_fmt }}</td>

                <td>
                  <span v-if="c.locate_type === 'custom'"
                    >{{ c.location || "-" }}</span
                  >
                  <span v-else>{{ c.donation_site?.name || "-" }}</span>
                </td>

                <td class="text-center">
                  {{ c.registration_count || 0 }}
                </td>

                <td class="text-center">
                  <span
                    v-if="c.approval_status === 'approved'"
                    class="badge bg-success"
                    >Đã duyệt</span
                  >
                  <span
                    v-else-if="c.approval_status === 'rejected'"
                    class="badge bg-danger"
                    :title="
                      c.rejected_reason ? `Lý do: ${c.rejected_reason}` : ''
                    "
                  >
                    Từ chối
                  </span>
                  <span v-else class="badge bg-warning text-dark"
                    >Chờ duyệt</span
                  >
                </td>

                <td class="text-center">
                  <span
                    v-if="c.status === 'ended'"
                    class="badge bg-secondary"
                    >Đã kết thúc</span
                  >
                  <span
                    v-else-if="c.status === 'running'"
                    class="badge bg-success"
                    >Đang diễn ra</span
                  >
                  <span v-else class="badge bg-warning text-dark"
                    >Sắp diễn ra</span
                  >
                </td>

                <td class="text-end">
                  <router-link
                    :to="`/admin/campaigns/${c.id}`"
                    class="btn btn-sm btn-outline-primary me-2"
                  >
                    Chi tiết
                  </router-link>

                  <button
                    class="btn btn-sm btn-warning me-2"
                    data-bs-toggle="modal"
                    data-bs-target="#editCampaignModal"
                    @click="openEditModal(c)"
                    :disabled="c.status === 'ended'"
                  >
                    Sửa
                  </button>

                  <button
                    class="btn btn-sm btn-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#closeCampaignModal"
                    @click="openCloseModal(c)"
                    :disabled="c.status === 'ended'"
                  >
                    Đóng
                  </button>
                </td>
              </tr>

              <tr v-if="campaigns.length === 0">
                <td colspan="8" class="text-center text-muted py-4">
                  Không có chiến dịch nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===================== MODALS ===================== -->
    <!-- APPROVE -->
    <div class="modal fade" id="approveCampaignModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-primary">Xác nhận duyệt chiến dịch</h5>
            <button
              class="btn-close"
              data-bs-dismiss="modal"
              ref="approveCloseBtn"
            ></button>
          </div>

          <div class="modal-body">
            <p>Bạn có chắc chắn muốn <strong>DUYỆT</strong> chiến dịch:</p>

            <div class="border rounded p-3 bg-light">
              <div class="fw-bold">{{ selected?.title }}</div>
              <div class="text-muted small">
                {{ selected?.start_date_fmt }} - {{ selected?.end_date_fmt }}
              </div>
              <div class="text-muted small">
                Địa điểm:
                <span v-if="selected?.locate_type === 'custom'"
                  >{{ selected?.location }}</span
                >
                <span v-else>{{ selected?.donation_site?.name }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Huỷ
            </button>
            <button
              class="btn btn-primary"
              @click="confirmApprove"
              :disabled="submitting"
            >
              <i class="bi bi-check2 me-1"></i>Xác nhận duyệt
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- REJECT -->
    <div class="modal fade" id="rejectCampaignModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              Xác nhận từ chối chiến dịch
            </h5>
            <button
              class="btn-close"
              data-bs-dismiss="modal"
              ref="rejectCloseBtn"
            ></button>
          </div>

          <div class="modal-body">
            <p>Bạn có chắc chắn muốn <strong>TỪ CHỐI</strong> chiến dịch:</p>

            <div class="border rounded p-3 bg-light mb-3">
              <div class="fw-bold">{{ selected?.title }}</div>
              <div class="text-muted small">
                {{ selected?.start_date_fmt }} - {{ selected?.end_date_fmt }}
              </div>
            </div>

            <label class="form-label fw-semibold">Lý do từ chối</label>
            <textarea
              v-model="rejectReason"
              rows="3"
              class="form-control"
              placeholder="Nhập lý do (bắt buộc)..."
            ></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Huỷ
            </button>

            <button
              class="btn btn-danger"
              @click="confirmReject"
              :disabled="submitting || !rejectReason.trim()"
            >
              <i class="bi bi-x-lg me-1"></i>Xác nhận từ chối
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- EDIT -->
    <div class="modal fade" id="editCampaignModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-warning">Sửa chiến dịch</h5>
            <button
              class="btn-close"
              data-bs-dismiss="modal"
              ref="editCloseBtn"
            ></button>
          </div>

          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Tiêu đề</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="editForm.title"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Loại</label>
                <select v-model="editForm.is_emergency" class="form-select">
                  <option :value="0">Định kỳ</option>
                  <option :value="1">Khẩn cấp</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Ngày bắt đầu</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="editForm.start_date"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Ngày kết thúc</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="editForm.end_date"
                />
              </div>

              <div class="col-12">
                <label class="form-label fw-semibold">Mô tả</label>
                <textarea
                  class="form-control"
                  rows="3"
                  v-model="editForm.content"
                ></textarea>
              </div>

              <div class="col-12">
                <label class="form-label fw-semibold">Địa điểm</label>

                <div class="form-check">
                  <input
                    type="radio"
                    v-model="editForm.locate_type"
                    value="custom"
                    class="form-check-input"
                  />
                  <label class="form-check-label">Địa điểm tùy chỉnh</label>
                </div>

                <div class="form-check">
                  <input
                    type="radio"
                    v-model="editForm.locate_type"
                    value="donation_site"
                    class="form-check-input"
                  />
                  <label class="form-check-label">Theo điểm hiến máu</label>
                </div>
              </div>

              <div class="col-12" v-if="editForm.locate_type === 'custom'">
                <input
                  type="text"
                  class="form-control"
                  v-model="editForm.location"
                  placeholder="Nhập địa điểm..."
                />
              </div>

              <div class="col-12" v-else>
                <select v-model="editForm.donation_site_id" class="form-select">
                  <option value="">-- Chọn điểm hiến máu --</option>
                  <option v-for="s in donationSites" :key="s.id" :value="s.id">
                    {{ s.name }} – {{ s.address }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Huỷ
            </button>

            <button
              class="btn btn-warning"
              @click="confirmEdit"
              :disabled="submitting"
            >
              <i class="bi bi-save me-1"></i>Lưu
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CLOSE -->
    <div class="modal fade" id="closeCampaignModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">Xác nhận đóng chiến dịch</h5>
            <button
              class="btn-close"
              data-bs-dismiss="modal"
              ref="closeCloseBtn"
            ></button>
          </div>

          <div class="modal-body">
            <p>
              Bạn có chắc chắn muốn
              <strong>ĐÓNG</strong> chiến dịch
              <strong class="text-danger">{{ selected?.title }}</strong>?
            </p>
            <div class="text-muted small">
              Sau khi đóng, chiến dịch sẽ ở trạng thái
              <strong>ended</strong>.
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Huỷ
            </button>
            <button
              class="btn btn-danger"
              @click="confirmClose"
              :disabled="submitting"
            >
              <i class="bi bi-x-circle me-1"></i>Xác nhận đóng
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
  name: "CampaignManagementAdmin",

  data() {
    return {
      pendingCampaigns: [],
      campaigns: [],
      donationSites: [],

      pendingFilters: { q: "", type: "" },
      allFilters: { q: "", approval_status: "", status: "" },

      loadingPending: false,
      loadingAll: false,
      submitting: false,

      selected: null,
      rejectReason: "",

      editForm: {
        id: null,
        title: "",
        content: "",
        start_date: "",
        end_date: "",
        is_emergency: 0,
        locate_type: "custom",
        location: "",
        donation_site_id: "",
      },
    };
  },

  mounted() {
    this.reloadAll();
    this.loadDonationSites();
  },

  methods: {
    fmtDate(d) {
      if (!d) return "-";
      const dt = new Date(d);
      const dd = String(dt.getDate()).padStart(2, "0");
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const yyyy = dt.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    },

    fmtRange(s, e) {
      return `${this.fmtDate(s)} - ${this.fmtDate(e)}`;
    },

    async reloadAll() {
      await Promise.all([this.fetchPending(), this.fetchAllCampaigns()]);
    },

    async loadDonationSites() {
      try {
        const res = await baseRequestAdmin.get("/admin/donation-sites");
        if (res.data.status) this.donationSites = res.data.data;
      } catch (_) {}
    },

    async fetchPending() {
      this.loadingPending = true;
      try {
        const res = await baseRequestAdmin.get("/admin/campaigns/pending", {
          params: this.pendingFilters,
        });

        if (res.data.status) {
          this.pendingCampaigns = res.data.data.map((c) => ({
            ...c,
            start_date_fmt: this.fmtDate(c.start_date),
            end_date_fmt: this.fmtDate(c.end_date),
          }));
        } else this.$toast.error(res.data.message);
      } finally {
        this.loadingPending = false;
      }
    },

    openApproveModal(c) {
      this.selected = c;
    },

    async confirmApprove() {
      if (!this.selected) return;
      this.submitting = true;

      try {
        const res = await baseRequestAdmin.patch(
          `/admin/campaigns/${this.selected.id}/approve`
        );
        if (res.data.status) {
          this.$toast.success("Duyệt thành công");
          this.$refs.approveCloseBtn?.click();
          this.reloadAll();
        } else this.$toast.error(res.data.message);
      } finally {
        this.submitting = false;
      }
    },

    openRejectModal(c) {
      this.selected = c;
      this.rejectReason = "";
    },

    async confirmReject() {
      if (!this.rejectReason.trim())
        return this.$toast.error("Nhập lý do!");

      this.submitting = true;

      try {
        const res = await baseRequestAdmin.patch(
          `/admin/campaigns/${this.selected.id}/reject`,
          {
            reason: this.rejectReason.trim(),
          }
        );

        if (res.data.status) {
          this.$toast.success("Đã từ chối chiến dịch");
          this.$refs.rejectCloseBtn?.click();
          this.reloadAll();
        } else this.$toast.error(res.data.message);
      } finally {
        this.submitting = false;
      }
    },

    async fetchAllCampaigns() {
      this.loadingAll = true;
      try {
        const res = await baseRequestAdmin.get("/admin/campaigns", {
          params: this.allFilters,
        });

        if (res.data.status) {
          this.campaigns = res.data.data.map((c) => ({
            ...c,
            start_date_fmt: this.fmtDate(c.start_date),
            end_date_fmt: this.fmtDate(c.end_date),
          }));
        } else this.$toast.error(res.data.message);
      } finally {
        this.loadingAll = false;
      }
    },

    openEditModal(c) {
      this.selected = c;

      const toDate = (d) => {
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
      };

      this.editForm = {
        id: c.id,
        title: c.title,
        content: c.content,
        start_date: toDate(c.start_date),
        end_date: toDate(c.end_date),
        is_emergency: c.is_emergency ? 1 : 0,
        locate_type: c.locate_type,
        location: c.location,
        donation_site_id: c.donation_site_id,
      };
    },

    async confirmEdit() {
      const f = this.editForm;

      if (!f.title || !f.start_date || !f.end_date)
        return this.$toast.error("Thiếu thông tin!");

      if (f.locate_type === "custom" && !f.location)
        return this.$toast.error("Nhập địa điểm!");

      if (f.locate_type === "donation_site" && !f.donation_site_id)
        return this.$toast.error("Chọn điểm hiến máu!");

      this.submitting = true;

      try {
        const res = await baseRequestAdmin.put(
          `/admin/campaigns/${f.id}`,
          f
        );
        if (res.data.status) {
          this.$toast.success("Cập nhật thành công");
          this.$refs.editCloseBtn?.click();
          this.fetchAllCampaigns();
        } else this.$toast.error(res.data.message);
      } finally {
        this.submitting = false;
      }
    },

    openCloseModal(c) {
      this.selected = c;
    },

    async confirmClose() {
      this.submitting = true;
      try {
        const res = await baseRequestAdmin.patch(
          `/admin/campaigns/${this.selected.id}/close`
        );
        if (res.data.status) {
          this.$toast.success("Đã đóng chiến dịch");
          this.$refs.closeCloseBtn?.click();
          this.fetchAllCampaigns();
        } else this.$toast.error(res.data.message);
      } finally {
        this.submitting = false;
      }
    },

    truncate(s, n = 80) {
      return s?.length > n ? s.slice(0, n) + "..." : s;
    },
  },
};
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle !important;
}

.campaign-meta {
  font-size: 12px;
  margin-top: 2px;
  color: #6c757d;
}
</style>
