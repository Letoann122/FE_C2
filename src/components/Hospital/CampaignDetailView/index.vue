<template>
  <div class="container-fluid py-4" v-if="loaded">
    <!-- TITLE -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-1 text-danger">
          <i class="bi bi-bullseye me-2"></i>Chi tiết chiến dịch
        </h3>
        <p class="text-muted mb-0">
          Thông tin chi tiết và danh sách donor tham gia.
        </p>
      </div>

      <div>
        <button class="btn btn-secondary me-2" @click="$router.go(-1)">
          <i class="bi bi-arrow-left me-1"></i>Quay lại
        </button>

        <button
          class="btn btn-warning me-2"
          :disabled="isClosed"
          data-bs-toggle="modal"
          data-bs-target="#editCampaignModal"
          @click="prepareEdit"
        >
          <i class="bi bi-pencil me-1"></i>Sửa
        </button>

        <button
          class="btn btn-danger"
          v-if="!isClosed"
          data-bs-toggle="modal"
          data-bs-target="#closeCampaignModal"
        >
          <i class="bi bi-x-circle me-1"></i>Đóng chiến dịch
        </button>
      </div>
    </div>

    <div class="row g-4">
      <!-- LEFT -->
      <div class="col-lg-4">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h5 class="fw-bold text-danger">{{ campaign.title }}</h5>
            <p class="text-muted small mb-3">
              Tạo bởi:
              <strong>{{ campaign.creator?.full_name }}</strong>
            </p>

            <ul class="list-group list-group-flush small">
              <li class="list-group-item d-flex justify-content-between">
                <span>Loại chiến dịch</span>
                <button
                  class="btn btn-sm"
                  :class="campaign.is_emergency ? 'btn-danger' : 'btn-info'"
                >
                  {{ campaign.is_emergency ? "Khẩn cấp" : "Định kỳ" }}
                </button>
              </li>

              <li class="list-group-item d-flex justify-content-between">
                <span>Thời gian</span>
                <strong>
                  {{ formatRange(campaign.start_date, campaign.end_date) }}
                </strong>
              </li>

              <li class="list-group-item d-flex justify-content-between">
                <span>Địa điểm</span>
                <strong>
                  <span v-if="campaign.locate_type === 'custom'">
                    {{ campaign.location }}
                  </span>
                  <span v-else>
                    {{ campaign.donation_site?.name }}
                  </span>
                </strong>
              </li>

              <li class="list-group-item d-flex justify-content-between bg-light">
                <span>Trạng thái</span>
                <button
                  class="btn btn-sm"
                  :class="{
                    'btn-secondary': getCampaignStatus(campaign) === 'Đã kết thúc',
                    'btn-warning': getCampaignStatus(campaign) === 'Sắp diễn ra',
                    'btn-success': getCampaignStatus(campaign) === 'Đang diễn ra'
                  }"
                >
                  {{ getCampaignStatus(campaign) }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="col-lg-8">
        <!-- DESCRIPTION -->
        <div class="card shadow-sm mb-4 border-0">
          <div class="card-header bg-white fw-bold">
            <i class="bi bi-card-text text-danger me-2"></i>Mô tả chiến dịch
          </div>
          <div class="card-body">
            <p class="text-muted">
              {{ campaign.content || "Không có mô tả" }}
            </p>
          </div>
        </div>

        <!-- SLOT LIST -->
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
            <span>
              <i class="bi bi-clock-history text-danger me-2"></i>
              Slot chiến dịch
            </span>

            <button class="btn btn-sm btn-outline-secondary" @click="loadCampaignSlots">
              <i class="bi bi-arrow-clockwise me-1"></i>Tải lại
            </button>
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Ngày</th>
                    <th>Khung giờ</th>
                    <th>Đã đăng ký</th>
                    <th>Số lượng</th>
                    <th>Còn trống</th>
                    <th>Full %</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="slot in campaignSlots" :key="slot.id">
                    <td>
                      {{ formatDate(slot.slot_date) }}
                    </td>

                    <td>
                      {{ String(slot.start_time).slice(0, 5) }}
                      -
                      {{ String(slot.end_time).slice(0, 5) }}
                    </td>

                    <td>{{ slot.current_count }}</td>
                    <td>{{ slot.slot_capacity }}</td>
                    <td>{{ slot.available_count }}</td>

                    <td>
                      <span
                        class="fw-bold"
                        :class="slot.percent >= 80 ? 'text-danger' : 'text-success'"
                      >
                        {{ slot.percent }}%
                      </span>
                    </td>
                  </tr>

                  <tr v-if="campaignSlots.length === 0">
                    <td colspan="6" class="text-center text-muted py-3">
                      Chưa có slot chiến dịch
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- LIST -->
        <div class="card shadow-sm border-0">
          <div
            class="card-header bg-white fw-bold d-flex justify-content-between align-items-center"
          >
            <span>
              <i class="bi bi-people-fill text-danger me-2"></i>Danh sách lịch
              hẹn
            </span>
          </div>

          <div v-if="!canViewAppointments" class="p-4 text-center text-muted">
            <i class="bi bi-shield-lock fs-3 d-block mb-2"></i>
            Chiến dịch <strong>chưa được Admin duyệt</strong> nên chưa hiển thị
            danh sách lịch hẹn.
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Donor</th>
                  <th>Số điện thoại</th>
                  <th>Nhóm máu</th>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in appointments" :key="item.id">
                  <td>{{ item.donorName }}</td>
                  <td>{{ item.donorPhone }}</td>
                  <td>{{ item.bloodType }}</td>
                  <td>{{ item.date }}</td>
                  <td>{{ item.time }}</td>
                  <td>
                    <span class="badge" :class="item.statusClass">
                      {{ item.status }}
                    </span>
                  </td>
                </tr>

                <tr v-if="appointments.length === 0">
                  <td colspan="6" class="text-center text-muted py-3">
                    Chưa có lịch hẹn nào
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- CLOSE MODAL -->
    <div
      class="modal fade"
      id="closeCampaignModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">Xác nhận đóng chiến dịch</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body">
            <p>Bạn có chắc chắn muốn đóng chiến dịch này?</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Huỷ
            </button>
            <button
              class="btn btn-danger"
              @click="confirmClose"
              data-bs-dismiss="modal"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div
      class="modal fade"
      id="editCampaignModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">Sửa chiến dịch</h5>
            <button
              class="btn-close"
              type="button"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Tiêu đề</label>
              <input
                type="text"
                class="form-control"
                v-model="form.title"
                :disabled="!canEditFull"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Mô tả</label>
              <textarea
                class="form-control"
                rows="3"
                v-model="form.content"
              ></textarea>
            </div>

            <div class="row g-3">
              <div class="col-6">
                <label class="form-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="form.start_date"
                  :disabled="!canEditFull"
                />
              </div>

              <div class="col-6">
                <label class="form-label">Ngày kết thúc</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="form.end_date"
                  :disabled="!canEditFull"
                />
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
              data-bs-dismiss="modal"
            >
              <i class="bi bi-save me-1"></i>Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- LOADING -->
  <div v-else class="text-center py-5">
    <div class="spinner-border text-danger"></div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";
import socket from "../../../core/socket";

export default {
  data() {
    return {
      loaded: false,
      campaign: {},
      appointments: [],
      campaignSlots: [],
      form: {},
      canEditFull: true,
    };
  },

  mounted() {
    const id = this.$route.params.id;
    this.loadDetail(id);
    this.loadCampaignSlots();
    this.initSocket();
  },

  beforeUnmount() {
    socket.off("slot_capacity_updated", this.handleSlotCapacityUpdated);
  },

  computed: {
    isClosed() {
      return this.campaign.status === "ended";
    },
    canViewAppointments() {
      return this.campaign.approval_status === "approved";
    },
  },

  methods: {
    initSocket() {
      if (!socket.connected) socket.connect();

      socket.on("slot_capacity_updated", this.handleSlotCapacityUpdated);
    },

    handleSlotCapacityUpdated() {
      this.loadCampaignSlots();
    },

    async loadDetail(id) {
      try {
        const res = await baseRequestDoctor.get(`/doctor/campaigns/${id}`);
        if (res.data.status) {
          this.campaign = res.data.data;

          if (this.campaign.approval_status === "approved") {
            const rs2 = await baseRequestDoctor.get(
              `/doctor/campaigns/${id}/appointments`
            );
            this.appointments = rs2.data.status ? rs2.data.data : [];
          } else {
            this.appointments = [];
          }
        }
      } catch (e) {
        this.$toast?.error?.("Lỗi tải dữ liệu!");
      } finally {
        this.loaded = true;
      }
    },

    async loadCampaignSlots() {
      try {
        const res = await baseRequestDoctor.get(
          "/doctor/appointment-slots",
          {
            params: {
              type: "campaign",
              campaign_id: this.$route.params.id,
            },
          }
        );

        if (res.data.status) {
          this.campaignSlots = res.data.data || [];

          this.campaignSlots.forEach((slot) => {
            socket.emit("join_slot", slot.id);
          });
        }
      } catch (error) {
        console.error("loadCampaignSlots error:", error);
      }
    },

    prepareEdit() {
      if (this.isClosed) {
        this.$toast?.error?.("Chiến dịch đã đóng — không thể sửa!");
        return;
      }

      this.form = { ...this.campaign };

      const now = new Date();
      const start = new Date(this.campaign.start_date);
      this.canEditFull = start > now;
    },

    confirmEdit() {
      baseRequestDoctor
        .put(`/doctor/campaigns/${this.campaign.id}`, this.form)
        .then((res) => {
          if (res.data.status) {
            this.$toast?.success?.(
              res.data.message || "Cập nhật chiến dịch thành công!"
            );
            this.loadDetail(this.campaign.id);
            this.loadCampaignSlots();
          } else {
            this.$toast?.error?.(
              res.data.message || "Không thể cập nhật chiến dịch"
            );
          }
        })
        .catch(() => this.$toast?.error?.("Lỗi server!"));
    },

    confirmClose() {
      baseRequestDoctor
        .patch(`/doctor/campaigns/${this.campaign.id}/close`)
        .then((res) => {
          if (res.data.status) {
            this.$toast?.success?.("Đã đóng chiến dịch!");
            this.loadDetail(this.campaign.id);
            this.loadCampaignSlots();
          } else {
            this.$toast?.error?.(
              res.data.message || "Không thể đóng chiến dịch"
            );
          }
        })
        .catch(() => this.$toast?.error?.("Lỗi server!"));
    },

    formatRange(s, e) {
      if (!s || !e) return "-";
      return (
        new Date(s).toLocaleDateString("vi-VN") +
        " - " +
        new Date(e).toLocaleDateString("vi-VN")
      );
    },

    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    getCampaignStatus(item) {
      if (!item || !item.status) return "";
      switch (item.status) {
        case "ended":
          return "Đã kết thúc";
        case "running":
          return "Đang diễn ra";
        case "upcoming":
        default:
          return "Sắp diễn ra";
      }
    },
  },
};
</script>

<style scoped>
.form-label {
  font-weight: 500;
}
</style>