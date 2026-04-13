<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-1">
          <i class="fa-solid fa-calendar-check text-danger me-2"></i>
          Quản Lí Lịch Hẹn
        </h3>
        <p class="text-muted mb-0">Điều phối lịch hẹn toàn hệ thống</p>
      </div>
    </div>

    <!-- BỘ LỌC -->
    <div class="card shadow-sm border-0 rounded-4 mb-3">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-2">
            <label class="form-label small">Keyword</label>
            <input class="form-control" v-model="filters.keyword" placeholder="Tên / mã / SĐT" />
          </div>

          <div class="col-md-2">
            <label class="form-label small">Trạng thái</label>
            <select class="form-select" v-model="filters.status">
              <option value="">Tất cả</option>
              <option v-for="(opt, i) in statusOptions" :key="i" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label small">Site</label>
            <select class="form-select" v-model.number="filters.siteId">
              <option :value="0">Tất cả</option>
              <option v-for="site in sites" :key="site.id" :value="site.id">
                {{ site.name }}
              </option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label small">Khung giờ</label>
            <select class="form-select" v-model="filters.slot">
              <option value="">Tất cả</option>
              <option v-for="(slot, idx) in slots" :key="idx" :value="slot">
                {{ slot }}
              </option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label small">Từ ngày</label>
            <input type="date" class="form-control" v-model="filters.fromDate" />
          </div>

          <div class="col-md-2">
            <label class="form-label small">Đến ngày</label>
            <input type="date" class="form-control" v-model="filters.toDate" />
          </div>
        </div>

        <div class="mt-3 d-flex justify-content-end">
          <button class="btn btn-primary mt-3" @click="applyFilter">
            <i class="fa-solid fa-filter me-2"></i>
            Tìm
          </button>
        </div>

        <hr />

        <div class="d-flex justify-content-between align-items-center">
          <div class="small text-muted">
            Tổng: <b>{{ filtered.length }}</b> lịch
          </div>

          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-primary btn-sm"
              @click="openModal('approve')"
              :data-bs-toggle="selectedIds.length ? 'modal' : null"
              :data-bs-target="selectedIds.length ? '#bulkActionModal' : null"
            >
              Duyệt hàng loạt
            </button>

            <button
              class="btn btn-outline-danger btn-sm"
              @click="openModal('cancel')"
              :data-bs-toggle="selectedIds.length ? 'modal' : null"
              :data-bs-target="selectedIds.length ? '#bulkActionModal' : null"
            >
              Huỷ hàng loạt
            </button>

            <button
              class="btn btn-outline-secondary btn-sm"
              @click="openModal('notify')"
              :data-bs-toggle="selectedIds.length ? 'modal' : null"
              :data-bs-target="selectedIds.length ? '#bulkActionModal' : null"
            >
              Gửi thông báo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- DANH SÁCH -->
    <div class="card shadow-sm border-0 rounded-4">
      <div class="card-body table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>
                <input
                  type="checkbox"
                  class="form-check-input"
                  :checked="allChecked"
                  @change="toggleAll"
                />
              </th>
              <th>STT</th>
              <th>Mã lịch</th>
              <th>Donor</th>
              <th>SĐT</th>
              <th>Nhóm máu</th>
              <th>Site</th>
              <th>Slot</th>
              <th>Ngày</th>
              <th>Trạng thái</th>
              <th>Bác sĩ</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in paged" :key="item.id">
              <td>
                <input
                  type="checkbox"
                  class="form-check-input"
                  :checked="selectedMap[item.id]"
                  @change="toggleOne(item.id)"
                />
              </td>

              <td>{{ (page - 1) * perPage + index + 1 }}</td>
              <td class="fw-semibold">{{ item.code }}</td>
              <td>{{ item.donor?.name }}</td>
              <td>{{ item.donor?.phone }}</td>
              <td>{{ item.donor?.blood }}</td>
              <td>{{ item.site }}</td>
              <td>{{ item.slot }}</td>
              <td>{{ item.date }}</td>

              <td>
                <span class="badge rounded-pill" :class="statusBadge(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
              </td>

              <td>{{ item.doctorName || "—" }}</td>

              <td>
                <button
                  class="btn btn-sm btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#detailModal"
                  @click="openDetail(item)"
                >
                  Chi tiết
                </button>
              </td>
            </tr>

            <tr v-if="!filtered.length">
              <td colspan="12" class="text-center text-muted py-3">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>

        <!-- PAGINATION -->
        <div class="d-flex justify-content-between align-items-center mt-3 px-2">
          <div class="text-muted small">
            Trang <b>{{ page }}</b> / <b>{{ totalPages }}</b>
          </div>

          <div class="btn-group">
            <button class="btn btn-outline-secondary btn-sm" :disabled="page === 1" @click="prevPage">
              ‹
            </button>

            <button
              v-for="p in totalPages"
              :key="p"
              class="btn btn-sm"
              :class="p === page ? 'btn-primary' : 'btn-outline-secondary'"
              @click="goPage(p)"
            >
              {{ p }}
            </button>

            <button class="btn btn-outline-secondary btn-sm" :disabled="page === totalPages" @click="nextPage">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <div class="modal fade" id="detailModal" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="fa-solid fa-circle-info me-2"></i> Chi tiết lịch hẹn
            </h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <table class="table table-bordered">
              <tbody>
                <tr><th>Mã lịch:</th><td>{{ detail?.code || "—" }}</td></tr>
                <tr><th>Donor:</th><td>{{ detail?.donor?.name || "—" }}</td></tr>
                <tr><th>SĐT:</th><td>{{ detail?.donor?.phone || "—" }}</td></tr>
                <tr><th>Email:</th><td>{{ detail?.donor?.email || "—" }}</td></tr>
                <tr><th>Nhóm máu:</th><td>{{ detail?.donor?.blood || "—" }}</td></tr>
                <tr><th>Site:</th><td>{{ detail?.site || "—" }}</td></tr>
                <tr><th>Slot:</th><td>{{ detail?.slot || "—" }}</td></tr>
                <tr><th>Ngày:</th><td>{{ detail?.date || "—" }}</td></tr>

                <tr v-if="detail?.status === 'REQUESTED' || detail?.status === 'APPROVED'">
                  <th>Dự kiến (ml):</th>
                  <td>{{ detail?.preferred_volume_ml || "—" }}</td>
                </tr>

                <tr v-if="detail?.status === 'REJECTED'">
                  <th>Lý do từ chối:</th>
                  <td>{{ detail?.rejected_reason || "—" }}</td>
                </tr>

                <tr v-if="detail?.status === 'COMPLETED'">
                  <th>Thực nhận (ml):</th>
                  <td>{{ detail?.actual_volume_ml || "—" }}</td>
                </tr>

                <tr v-if="detail?.campaign_name">
                  <th>Chiến dịch:</th>
                  <td>{{ detail?.campaign_name }}</td>
                </tr>

                <tr>
                  <th>Trạng thái:</th>
                  <td>{{ statusLabel(detail?.status) }}</td>
                </tr>

                <tr><th>Bác sĩ duyệt:</th><td>{{ detail?.doctorName || "—" }}</td></tr>
                <tr><th>Ghi chú:</th><td>{{ detail?.notes || "—" }}</td></tr>
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- BULK ACTION MODAL -->
    <div class="modal fade" id="bulkActionModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">{{ modalTitle }}</h5>
            <button class="btn-close" data-bs-dismiss="modal" ref="bulkCloseBtn"></button>
          </div>

          <div class="modal-body">
            <p>Số lịch xử lý: <b>{{ selectedIds.length }}</b></p>

            <template v-if="action === 'approve'">
              <div class="alert alert-info small">
                Admin duyệt lịch — không cần chỉ định bác sĩ.
              </div>
            </template>

            <label class="form-label fw-bold mt-3">Ghi chú</label>
            <textarea class="form-control" rows="3" v-model="bulkForm.note"></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Huỷ</button>
            <button class="btn btn-danger fw-bold" @click="submitBulk">Xác nhận</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestAdmin from "../../../core/baseRequestAdmin";

export default {
  name: "AdminAppointmentControl",

  data() {
    return {
      sites: [],
      doctors: [],
      slots: ["07:00","08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"],

      // ✅ dropdown dùng label tiếng Việt nhưng value vẫn là status code từ DB/API
      statusOptions: [
        { value: "REQUESTED", label: "Chờ Duyệt" },
        { value: "APPROVED", label: "Đã Duyệt" },
        { value: "REJECTED", label: "Từ Chối" },
        { value: "CANCELLED", label: "Đã Huỷ" },
        { value: "COMPLETED", label: "Hoàn Thành" },
      ],

      appointments: [],
      filtered: [],
      detail: {},

      filters: {
        keyword: "",
        status: "",     // ✅ sẽ là REQUESTED/APPROVED...
        siteId: 0,
        slot: "",
        fromDate: "",
        toDate: "",
      },

      selectedMap: {},
      page: 1,
      perPage: 20,

      action: "",
      bulkForm: { note: "" },
    };
  },

  mounted() {
    this.loadData();
  },

  computed: {
    selectedIds() {
      return Object.keys(this.selectedMap)
        .filter((id) => this.selectedMap[id])
        .map((id) => Number(id));
    },

    paged() {
      const start = (this.page - 1) * this.perPage;
      return this.filtered.slice(start, start + this.perPage);
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.filtered.length / this.perPage));
    },

    allChecked() {
      return this.paged.length && this.paged.every((x) => this.selectedMap[x.id]);
    },

    modalTitle() {
      return (
        {
          approve: "Duyệt hàng loạt",
          cancel: "Huỷ hàng loạt",
          notify: "Gửi thông báo hàng loạt",
        }[this.action] || ""
      );
    },
  },

  methods: {
    // ✅ map status code -> label tiếng Việt
    statusLabel(code) {
      const map = {
        REQUESTED: "Chờ Duyệt",
        APPROVED: "Đã Duyệt",
        REJECTED: "Từ Chối",
        CANCELLED: "Đã Huỷ",
        COMPLETED: "Hoàn Thành",
      };
      return map[code] || code || "—";
    },

    loadData() {
      baseRequestAdmin
        .get("/admin/appointments")
        .then((res) => {
          if (res.data.status) {
            this.appointments = res.data.data || [];
            this.doctors = res.data.doctors || [];
            this.sites = res.data.sites || [];
            this.applyFilter();
          } else {
            this.$toast.error(res.data.message);
          }
        })
        .catch(() => this.$toast.error("Lỗi tải dữ liệu!"));
    },

    applyFilter() {
      let arr = [...this.appointments];
      const kw = this.filters.keyword.trim().toLowerCase();

      if (kw) {
        arr = arr.filter(
          (x) =>
            x.code?.toLowerCase().includes(kw) ||
            x.donor?.name?.toLowerCase().includes(kw) ||
            x.donor?.phone?.includes(kw)
        );
      }

      // ✅ filters.status là REQUESTED/APPROVED... nên match đúng với x.status
      if (this.filters.status) arr = arr.filter((x) => x.status === this.filters.status);

      if (this.filters.siteId) arr = arr.filter((x) => x.siteId === this.filters.siteId);

      if (this.filters.slot) arr = arr.filter((x) => x.slot === this.filters.slot);

      if (this.filters.fromDate) arr = arr.filter((x) => x.date >= this.filters.fromDate);

      if (this.filters.toDate) arr = arr.filter((x) => x.date <= this.filters.toDate);

      this.filtered = arr;
      this.page = 1;
    },

    goPage(p) {
      if (p >= 1 && p <= this.totalPages) this.page = p;
    },
    prevPage() {
      if (this.page > 1) this.page--;
    },
    nextPage() {
      if (this.page < this.totalPages) this.page++;
    },

    toggleOne(id) {
      this.selectedMap[id] = !this.selectedMap[id];
    },
    toggleAll(e) {
      const checked = e.target.checked;
      for (const ap of this.paged) this.selectedMap[ap.id] = checked;
    },

    openDetail(item) {
      this.detail = { ...item };
    },

    openModal(type) {
      if (!this.selectedIds.length) {
        this.$toast.info("Chọn lịch trước!");
        return;
      }
      this.action = type;
      this.bulkForm = { note: "" };
    },

    submitBulk() {
      let url = "";
      const payload = { ids: this.selectedIds, note: this.bulkForm.note };

      if (this.action === "approve") url = "/admin/appointments/bulk-approve";
      else if (this.action === "cancel") url = "/admin/appointments/bulk-cancel";
      else if (this.action === "notify") url = "/admin/appointments/bulk-notify";

      baseRequestAdmin
        .post(url, payload)
        .then((res) => {
          if (!res.data.status) {
            this.$toast.error(res.data.message);
            return;
          }

          this.$toast.success(res.data.message);
          this.loadData();
          this.selectedMap = {};
          this.$refs.bulkCloseBtn?.click();
        })
        .catch(() => this.$toast.error("Lỗi xử lý!"));
    },

    statusBadge(s) {
      return (
        {
          REQUESTED: "text-bg-warning",
          APPROVED: "text-bg-success",
          CANCELLED: "text-bg-danger",
          REJECTED: "text-bg-secondary",
          COMPLETED: "text-bg-primary",
        }[s] || "text-bg-light"
      );
    },
  },
};
</script>

<style scoped>
.table th {
  width: 160px;
}
</style>
