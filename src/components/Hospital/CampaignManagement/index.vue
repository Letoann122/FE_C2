<template>
  <div class="campaign-management-page container-fluid py-4">
    <!-- ROW 1: FILTER + CREATE -->
    <div class="row g-4">
      <!-- LEFT: FILTER + STATS -->
      <div class="col-lg-3">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h6 class="card-title mb-3">
              <i class="bi bi-funnel-fill me-2"></i>Bộ lọc
            </h6>

            <div class="row g-3">
              <div class="col-12">
                <label class="form-label small">Loại chiến dịch</label>
                <select v-model="filters.type" class="form-select form-select-sm">
                  <option value="">Tất cả</option>
                  <option value="0">Định kỳ</option>
                  <option value="1">Khẩn cấp</option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label small">Trạng thái</label>
                <select v-model="filters.status" class="form-select form-select-sm">
                  <option value="">Tất cả</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="running">Đang diễn ra</option>
                  <option value="ended">Đã kết thúc</option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label small">Tình trạng</label>
                <select v-model="filters.approval_status" class="form-select form-select-sm">
                  <option value="">Tất cả</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>
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

              <div class="col-12 d-flex justify-content-end mt-3">
                <button class="btn btn-danger" @click="applyFilter">
                  <i class="fa-solid fa-magnifying-glass" style="color: #ffffff;"></i> Lọc
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
              <span class="text-muted">Tổng chiến dịch</span>
              <span class="fw-bold fs-5">{{ stats.totalCampaigns }}</span>
            </div>

            <div class="d-flex justify-content-between">
              <span class="text-muted">Donor đăng ký</span>
              <span class="fw-bold fs-5 text-danger">{{ stats.totalRegistrations }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: CREATE -->
      <div class="col-lg-9">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5 class="card-title mb-4">
              <i class="bi bi-pencil-square me-2"></i>Tạo chiến dịch mới
            </h5>

            <form class="row g-3" @submit.prevent="createCampaign">
              <div class="col-md-6">
                <label class="form-label">Tên chiến dịch</label>
                <input
                  v-model="form.title"
                  type="text"
                  class="form-control"
                  placeholder="Nhập tên chiến dịch"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Loại chiến dịch</label>
                <select v-model="form.is_emergency" class="form-select">
                  <option value="0">Định kỳ</option>
                  <option value="1">Khẩn cấp</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Ngày bắt đầu</label>
                <input v-model="form.start_date" type="date" class="form-control" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Ngày kết thúc</label>
                <input v-model="form.end_date" type="date" class="form-control" />
              </div>

              <div class="col-12">
                <label class="form-label">Loại địa điểm</label>

                <div class="form-check">
                  <input class="form-check-input" type="radio" value="custom" v-model="form.locate_type" />
                  <label class="form-check-label">Địa điểm tùy chỉnh</label>
                </div>

                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    value="donation_site"
                    v-model="form.locate_type"
                  />
                  <label class="form-check-label">Chọn từ điểm hiến máu</label>
                </div>
              </div>

              <div v-if="form.locate_type === 'custom'" class="col-12">
                <label class="form-label">Địa điểm tổ chức</label>
                <input
                  v-model="form.location"
                  type="text"
                  class="form-control"
                  placeholder="Nhập địa điểm tổ chức"
                />
              </div>

              <div v-if="form.locate_type === 'donation_site'" class="col-12">
                <label class="form-label">Điểm hiến máu</label>
                <select v-model="form.donation_site_id" class="form-select">
                  <option value="">-- Chọn điểm hiến máu --</option>
                  <option v-for="site in donationSites" :key="site.id" :value="site.id">
                    {{ site.name }} – {{ site.address }}
                  </option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label">Mô tả</label>
                <textarea
                  v-model="form.content"
                  rows="3"
                  class="form-control"
                  placeholder="Nhập mô tả"
                ></textarea>
              </div>

              <div class="col-12 text-end">
                <button class="btn btn-danger">
                  <i class="bi bi-plus-circle me-1"></i>Tạo chiến dịch mới
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- ROW 2: LIST FULL WIDTH -->
    <div class="row g-4 mt-0 mt-lg-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-3">
              <i class="bi bi-table me-2"></i>Danh sách chiến dịch
            </h5>

            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Tên chiến dịch</th>
                    <th>Loại</th>
                    <th>Thời gian</th>
                    <th>Địa điểm</th>
                    <th>Đăng ký</th>
                    <th>Duyệt</th>
                    <th>Trạng thái</th>
                    <th class="text-end">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in campaigns" :key="item.id">
                    <td class="fw-bold">{{ item.title }}</td>

                    <td>
                      <span :class="['badge', item.is_emergency ? 'bg-danger' : 'bg-primary']">
                        {{ item.is_emergency ? "Khẩn cấp" : "Định kỳ" }}
                      </span>
                    </td>

                    <td>{{ formatRange(item.start_date, item.end_date) }}</td>

                    <td>
                      <span v-if="item.locate_type === 'custom'">{{ item.location }}</span>
                      <span v-else>{{ item.donation_site?.name || "Không rõ" }}</span>
                    </td>

                    <td>{{ item.registration_count || 0 }}</td>

                    <td>
                      <span v-if="item.approval_status === 'approved'" class="badge bg-success">Đã duyệt</span>
                      <span
                        v-else-if="item.approval_status === 'rejected'"
                        class="badge bg-danger"
                        :title="item.rejected_reason ? `Lý do: ${item.rejected_reason}` : 'Đã bị từ chối'"
                      >
                        Từ chối
                      </span>
                      <span v-else class="badge bg-warning text-dark">Chờ duyệt</span>
                    </td>

                    <td>
                      <span v-if="item.status === 'ended'" class="badge bg-secondary">Đã kết thúc</span>
                      <span v-else-if="item.status === 'running'" class="badge bg-success">Đang diễn ra</span>
                      <span v-else class="badge bg-warning text-dark">Sắp diễn ra</span>
                    </td>

                    <td class="text-end">
                      <button
                        class="btn btn-sm btn-outline-danger me-2"
                        @click="openGenerateSlotModal(item)"
                      >
                        Tạo Slot
                      </button>

                      <router-link
                        :to="`/Hospital/campaigns/${item.id}`"
                        class="btn btn-sm btn-outline-primary"
                      >
                        Chi tiết
                      </router-link>
                    </td>
                  </tr>

                  <tr v-if="campaigns.length === 0">
                    <td colspan="8" class="text-center text-muted py-3">
                      Không có chiến dịch nào
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- GENERATE SLOT MODAL -->
    <div
      class="modal fade"
      id="generateSlotModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              Tạo slot chiến dịch
            </h5>

            <button
              class="btn-close"
              type="button"
              data-bs-dismiss="modal"
              aria-label="Close"
              ref="generateSlotCloseBtn"
            ></button>
          </div>

          <div class="modal-body">
            <div v-if="selectedCampaign" class="alert alert-light border small">
              <strong>Chiến dịch:</strong> {{ selectedCampaign.title }}<br />
              <span>
                <strong>Thời gian:</strong>
                {{ formatRange(selectedCampaign.start_date, selectedCampaign.end_date) }}
              </span>
            </div>

            <div class="mb-3">
              <label class="form-label">
                Số người hiến mỗi ca
              </label>

              <input
                type="number"
                class="form-control"
                v-model.number="generateSlotForm.slot_capacity"
                min="1"
              />
            </div>

            <div class="form-check mb-2">
              <input
                id="includeMorning"
                class="form-check-input"
                type="checkbox"
                v-model="generateSlotForm.include_morning"
              />

              <label class="form-check-label" for="includeMorning">
                Ca sáng (07:00 - 11:00)
              </label>
            </div>

            <div class="form-check">
              <input
                id="includeAfternoon"
                class="form-check-input"
                type="checkbox"
                v-model="generateSlotForm.include_afternoon"
              />

              <label class="form-check-label" for="includeAfternoon">
                Ca chiều (13:00 - 17:00)
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              :disabled="generatingSlot"
            >
              Đóng
            </button>

            <button
              class="btn btn-danger"
              @click="generateCampaignSlots"
              :disabled="generatingSlot"
            >
              <span v-if="generatingSlot" class="spinner-border spinner-border-sm me-1"></span>
              Tạo slot
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "CampaignManagementView",

  data() {
    return {
      campaigns: [],
      donationSites: [],
      selectedCampaign: null,
      generatingSlot: false,
      generateSlotForm: {
        slot_capacity: 10,
        include_morning: true,
        include_afternoon: true,
      },
      stats: {
        totalCampaigns: 0,
        totalRegistrations: 0,
      },
      filters: {
        type: "",
        status: "",
        approval_status: "",
        time: "",
        start_from: "",
        start_to: "",
      },
      form: {
        title: "",
        content: "",
        start_date: "",
        end_date: "",
        is_emergency: "0",
        locate_type: "custom",
        location: "",
        donation_site_id: "",
      },
    };
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
    this.applyFilter();
    this.loadDonationSites();
  },

  methods: {
    buildFilterParams() {
      const params = { ...this.filters };

      if (!params.time) delete params.time;

      if (params.time !== "custom") {
        delete params.start_from;
        delete params.start_to;
      } else {
        if (!params.start_from || !params.start_to) {
          delete params.start_from;
          delete params.start_to;
        }
      }

      return params;
    },

    applyFilter() {
      const params = this.buildFilterParams();

      baseRequestDoctor
        .get("/doctor/campaigns", { params })
        .then((res) => {
          if (res.data.status) {
            this.campaigns = res.data.data || [];
            this.stats.totalCampaigns = this.campaigns.length;

            this.stats.totalRegistrations = this.campaigns.reduce(
              (sum, c) => sum + (c.registration_count || 0),
              0
            );
          } else {
            this.campaigns = [];
            this.stats.totalCampaigns = 0;
            this.stats.totalRegistrations = 0;
          }
        })
        .catch(() => this.$toast?.error?.("Lỗi tải danh sách chiến dịch!"));
    },

    loadDonationSites() {
      baseRequestDoctor
        .get("/doctor/donation-sites")
        .then((res) => {
          if (res.data.status) this.donationSites = res.data.data || [];
        })
        .catch(() => {});
    },

    createCampaign() {
      if (!this.form.title || !this.form.start_date || !this.form.end_date) {
        this.$toast.error("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      if (this.form.locate_type === "custom" && !this.form.location) {
        this.$toast.error("Vui lòng nhập địa điểm!");
        return;
      }

      if (this.form.locate_type === "donation_site" && !this.form.donation_site_id) {
        this.$toast.error("Vui lòng chọn điểm hiến máu!");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(this.form.start_date);
      const end = new Date(this.form.end_date);

      if (start < today) return this.$toast.error("Ngày bắt đầu không được nhỏ hơn hôm nay!");
      if (end < start) return this.$toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!");
      if (end < today) return this.$toast.error("Ngày kết thúc không được nhỏ hơn hôm nay!");

      baseRequestDoctor
        .post("/doctor/campaigns", this.form)
        .then((res) => {
          if (res.data.status) {
            this.$toast.success(res.data.message || "Tạo chiến dịch thành công!");
            this.applyFilter();

            this.form = {
              title: "",
              content: "",
              start_date: "",
              end_date: "",
              is_emergency: "0",
              locate_type: "custom",
              location: "",
              donation_site_id: "",
            };
          } else {
            this.$toast.error(res.data.message || "Không thể tạo chiến dịch");
          }
        })
        .catch((error) => {
          console.error("createCampaign error:", error);
        });
    },

    openGenerateSlotModal(campaign) {
      this.selectedCampaign = campaign;

      this.generateSlotForm = {
        slot_capacity: 10,
        include_morning: true,
        include_afternoon: true,
      };

      const modalEl = document.getElementById("generateSlotModal");

      if (window.bootstrap && modalEl) {
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
      }
    },

    async generateCampaignSlots() {
      try {
        if (!this.selectedCampaign) {
          this.$toast.error("Không tìm thấy chiến dịch!");
          return;
        }

        if (!this.generateSlotForm.include_morning && !this.generateSlotForm.include_afternoon) {
          this.$toast.error("Vui lòng chọn ít nhất một khung giờ!");
          return;
        }

        if (!this.generateSlotForm.slot_capacity || Number(this.generateSlotForm.slot_capacity) <= 0) {
          this.$toast.error("Số người phải lớn hơn 0!");
          return;
        }

        this.generatingSlot = true;

        const res = await baseRequestDoctor.post(
          `/doctor/campaigns/${this.selectedCampaign.id}/generate-slots`,
          {
            slot_capacity: Number(this.generateSlotForm.slot_capacity),
            include_morning: Boolean(this.generateSlotForm.include_morning),
            include_afternoon: Boolean(this.generateSlotForm.include_afternoon),
          }
        );

        if (res.data.status) {
          this.$toast.success(res.data.message || "Tạo slot thành công!");
          this.$refs.generateSlotCloseBtn?.click();
        } else {
          this.$toast.error(res.data.message || "Không thể tạo slot!");
        }
      } catch (error) {
        console.error("generateCampaignSlots error:", error);
      } finally {
        this.generatingSlot = false;
      }
    },

    formatRange(s, e) {
      if (!s || !e) return "-";
      return `${new Date(s).toLocaleDateString("vi-VN")} - ${new Date(e).toLocaleDateString("vi-VN")}`;
    },
  },
};
</script>

<style scoped>
.form-label {
  font-weight: 500;
}
</style>