<template>
  <div class="container py-5">
    <div class="mb-4 border-bottom pb-3">
      <h3 class="fw-bold text-danger">
        <i class="bi bi-calendar2-heart me-2"></i> Đặt lịch hiến máu
      </h3>
      <p class="text-muted mb-0">
        Đăng ký lịch hẹn tại các điểm hiến máu gần bạn.
      </p>
    </div>

    <div class="row g-4">
      <div class="col-lg-6">
        <div class="card p-4 shadow-sm border-0 rounded-4">
          <h5 class="fw-bold mb-2">Thông tin đặt lịch</h5>
          <p class="text-muted">Vui lòng điền đầy đủ thông tin bên dưới</p>

          <form @submit.prevent="submitBooking" novalidate>
            <div class="row g-3">
              <div class="col-lg-12">
                <label class="form-label">Họ và tên *</label>
                <input type="text" v-model.trim="form.full_name" class="form-control bg-light" readonly />
                <small class="text-muted">
                  Họ tên được lấy từ hồ sơ, không thể chỉnh tại đây.
                </small>
              </div>

              <div class="col-lg-6">
                <label class="form-label">Nhóm máu *</label>
                <input type="text" v-model="form.blood_group" class="form-control bg-light" readonly />
                <small class="text-muted">
                  Nhóm máu được lấy từ hồ sơ, không thể chỉnh tại đây.
                </small>
              </div>

              <div class="col-lg-6">
                <label class="form-label">Địa điểm hiến máu *</label>
                <select class="form-select" v-model="form.donation_site_id">
                  <option disabled value="">Chọn địa điểm</option>
                  <option v-for="site in donation_sites" :key="site.id" :value="String(site.id)">
                    {{ site.name }} – {{ site.hospital_name }}
                  </option>
                </select>
              </div>

              <div class="col-lg-6">
                <label class="form-label">Ngày hiến *</label>
                <input type="date" v-model="form.date" class="form-control" :min="minDate" />
              </div>

              <div class="col-lg-12">
                <label class="form-label">Khung giờ *</label>

                <div v-if="loadingSlots" class="text-muted small">
                  <span class="spinner-border spinner-border-sm me-1"></span>
                  Đang tải slot...
                </div>

                <div v-else-if="!form.donation_site_id || !form.date" class="alert alert-light border small mb-0">
                  Vui lòng chọn địa điểm và ngày hiến để xem khung giờ còn chỗ.
                </div>

                <div v-else-if="slots.length === 0" class="alert alert-warning small mb-0">
                  Chưa có slot khả dụng cho ngày và địa điểm này.
                </div>

                <div v-else class="row g-2">
                  <div class="col-md-6" v-for="slot in slots" :key="slot.id">
                    <button type="button" class="slot-card w-100 text-start" :class="{
                      active: String(form.appointment_slot_id) === String(slot.id),
                      disabled: slot.is_full || isSlotExpired(slot),
                    }" :disabled="slot.is_full || isSlotExpired(slot)" @click="selectSlot(slot)">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <strong>{{ formatSlotTime(slot) }}</strong>

                        <span class="badge" :class="slot.is_full || isSlotExpired(slot)
                            ? 'bg-secondary'
                            : 'bg-success'
                          ">
                          {{
                            isSlotExpired(slot)
                              ? "Đã kết thúc"
                              : slot.is_full
                                ? "Đã đầy"
                          : "Còn chỗ"
                          }}
                        </span>
                      </div>

                      <div class="small text-muted mb-2">
                        {{ slot.current_count }} / {{ slot.slot_capacity }} người
                        <span v-if="slot.percent !== undefined">
                          ({{ slot.percent }}%)
                        </span>
                      </div>

                      <div class="progress" style="height: 6px">
                        <div class="progress-bar bg-danger" :style="{ width: `${Math.min(slot.percent || 0, 100)}%` }">
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div class="col-lg-12">
                <label class="form-label d-block mb-2">Dung tích máu hiến *</label>
                <div class="d-flex gap-4 flex-wrap">
                  <label v-for="vol in volumes" :key="vol" class="form-check">
                    <input type="radio" class="form-check-input" :value="vol" v-model="form.volume" />
                    <span class="form-check-label">{{ vol }}</span>
                  </label>
                </div>
              </div>

              <div class="col-lg-12">
                <label class="form-label">Ghi chú</label>
                <textarea class="form-control" v-model.trim="form.note"></textarea>
              </div>

              <div class="text-end mt-4">
                <button class="btn btn-danger me-2" :disabled="submitting">
                  {{ submitting ? "Đang gửi..." : "Đăng ký" }}
                </button>
                <button type="button" class="btn btn-secondary" @click="resetForm" :disabled="submitting">
                  Huỷ
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="col-lg-6" v-if="selectedSite">
        <div class="card p-4 shadow-sm border-0 rounded-4">
          <h5 class="fw-bold mb-3">
            <i class="bi bi-geo-alt-fill text-danger me-2"></i>
            Địa điểm hiến máu đã chọn
          </h5>

          <div class="d-flex justify-content-between align-items-start border rounded-3 p-3 bg-white">
            <div class="me-3">
              <p class="fw-semibold mb-1">{{ selectedSite.name }}</p>
              <small class="text-secondary d-block mb-1">{{ selectedSite.address }}</small>
              <small class="text-muted">({{ selectedSite.hospital_name }})</small>
            </div>
            <span class="badge rounded-pill px-3 py-2" :class="selectedSite.is_active
              ? 'bg-success-subtle text-success'
              : 'bg-secondary-subtle text-muted'">
              {{ selectedSite.is_active ? "Đang hoạt động" : "Tạm ngưng" }}
            </span>
          </div>

          <div class="mt-3 rounded overflow-hidden shadow-sm">
            <iframe :src="mapEmbedUrl(selectedSite)" width="100%" height="220" style="border: 0"
              loading="lazy"></iframe>
          </div>

          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-outline-danger btn-sm" @click="openInMaps(selectedSite)">
              <i class="bi bi-map me-1"></i>Mở Google Maps
            </button>
            <button class="btn btn-outline-secondary btn-sm" @click="clearSelectedSite">
              <i class="bi bi-x-circle me-1"></i>Chọn lại địa điểm
            </button>
          </div>
        </div>
      </div>

      <div v-else class="col-lg-6">
        <div class="card p-4 text-center text-muted shadow-sm border-0 rounded-4">
          <i class="bi bi-geo-alt fs-3 d-block mb-2"></i>
          Vui lòng chọn <b>Địa điểm hiến máu</b> ở bảng bên trái.
        </div>
      </div>

      <div class="col-lg-12 mt-4">
        <div class="card p-4 shadow-sm border-0 rounded-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="fw-bold mb-0">
              <i class="bi bi-clock-history text-danger me-2"></i>
              Lịch hiến máu của bạn
            </h5>

            <button class="btn btn-sm btn-outline-secondary" @click="loadMyAppointments"
              :disabled="loadingAppointments">
              <span v-if="loadingAppointments" class="spinner-border spinner-border-sm me-1"></span>
              Tải lại
            </button>
          </div>

          <div v-if="myAppointments.length === 0" class="text-muted small">
            Bạn chưa có lịch hiến máu nào.
          </div>

          <div v-else class="table-responsive mt-3">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Mã lịch</th>
                  <th>Ngày</th>
                  <th>Khung giờ</th>
                  <th>Điểm hiến</th>
                  <th>Trạng thái</th>
                  <th class="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in myAppointments" :key="a.id">
                  <td>
                    <span class="badge bg-light text-dark border">
                      {{ a.appointment_code }}
                    </span>
                  </td>
                  <td>{{ formatDate(a.scheduled_at) }}</td>
                  <td>{{ formatSlotTime(a.slot) || formatTime(a.scheduled_at) }}</td>
                  <td>{{ a.donation_site?.name || a.campaign?.title || "-" }}</td>
                  <td>
                    <span class="badge" :class="statusBadgeClass(a.status)">
                      {{ statusLabel(a.status) }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button v-if="['REQUESTED', 'APPROVED', 'BOOKED'].includes(a.status)"
                      class="btn btn-sm btn-outline-danger" @click="cancelAppointment(a)"
                      :disabled="submittingCancelId === a.id">
                      <span v-if="submittingCancelId === a.id" class="spinner-border spinner-border-sm me-1"></span>
                      Huỷ
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";
import socket from "../../../core/socket";

export default {
  data() {
    return {
      loadingProfile: false,
      loadingAppointments: false,
      loadingSlots: false,
      submitting: false,
      submittingCancelId: null,
      donation_sites: [],
      myAppointments: [],
      slots: [],
      form: {
        full_name: "",
        blood_group: "",
        donation_site_id: "",
        date: "",
        appointment_slot_id: "",
        volume: "",
        note: "",
      },
      bloodGroups: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      volumes: ["250ml", "350ml", "450ml"],
    };
  },

  computed: {
    selectedSite() {
      return (
        this.donation_sites.find(
          (s) => String(s.id) === String(this.form.donation_site_id)
        ) || null
      );
    },

    selectedSlot() {
      return (
        this.slots.find((s) => String(s.id) === String(this.form.appointment_slot_id)) ||
        null
      );
    },

    minDate() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
    },
  },

  watch: {
    "form.donation_site_id"() {
      this.form.appointment_slot_id = "";
      this.loadSlots();
    },

    "form.date"() {
      this.form.appointment_slot_id = "";
      this.loadSlots();
    },
  },

  mounted() {
    this.loadDonationSites();
    this.loadProfile();
    this.loadMyAppointments();
    this.initSocket();
  },

  beforeUnmount() {
    socket.off("slot_capacity_updated", this.handleSlotCapacityUpdated);
    socket.off("appointment_updated", this.handleAppointmentUpdated);
  },

  methods: {
    initSocket() {
      if (!socket.connected) socket.connect();

      socket.on("slot_capacity_updated", this.handleSlotCapacityUpdated);
      socket.on("appointment_updated", this.handleAppointmentUpdated);
    },

    handleSlotCapacityUpdated(payload) {
      if (!payload?.slot_id) return;

      const index = this.slots.findIndex(
        (slot) => String(slot.id) === String(payload.slot_id)
      );

      if (index !== -1) {
        this.slots.splice(index, 1, {
          ...this.slots[index],
          ...payload,
          id: payload.slot_id,
        });
      }
    },

    handleAppointmentUpdated() {
      this.loadMyAppointments();
    },

    statusLabel(status) {
      const map = {
        REQUESTED: "Chờ duyệt",
        APPROVED: "Đã duyệt",
        REJECTED: "Từ chối",
        CANCELLED: "Đã hủy",
        BOOKED: "Đã đặt",
        CHECKED_IN: "Đã check-in",
        SCREENING: "Đang sàng lọc",
        FAILED_SCREENING: "Không đủ điều kiện",
        DONATING: "Đang hiến máu",
        COMPLETED: "Hoàn thành",
        NO_SHOW: "Vắng mặt",
      };

      return map[status] || status;
    },

    statusBadgeClass(status) {
      return {
        "bg-warning text-dark": status === "REQUESTED",
        "bg-success": status === "APPROVED",
        "bg-secondary": ["REJECTED", "NO_SHOW"].includes(status),
        "bg-dark": status === "CANCELLED",
        "bg-info text-dark": ["BOOKED", "CHECKED_IN", "SCREENING"].includes(status),
        "bg-danger": status === "FAILED_SCREENING",
        "bg-primary": ["DONATING", "COMPLETED"].includes(status),
      };
    },

    formatDate(date) {
      if (!date) return "-";
      const d = new Date(date);
      const pad = (n) => (n < 10 ? "0" + n : n);
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    },

    formatTime(date) {
      if (!date) return "-";
      const d = new Date(date);
      return `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;
    },

    formatSlotTime(slot) {
      if (!slot?.start_time || !slot?.end_time) return "";
      return `${String(slot.start_time).slice(0, 5)} - ${String(slot.end_time).slice(0, 5)}`;
    },

    normalizeVolume(value) {
      if (!value) return null;
      return Number(String(value).replace(/[^\d]/g, ""));
    },

    isSlotExpired(slot) {
      if (!slot?.slot_date || !slot?.end_time) return false;

      const dateKey = String(slot.slot_date).slice(0, 10);
      const endTime = String(slot.end_time).slice(0, 8);

      const endAt = new Date(`${dateKey}T${endTime}+07:00`);

      return Date.now() > endAt.getTime();
    },

    async submitAppointment() {

    },

    selectSlot(slot) {
      if (slot.is_full) {
        this.$toast?.error?.("Khung giờ này đã đủ số lượng người đăng ký!");
        return;
      }

      this.form.appointment_slot_id = slot.id;
    },

    loadSlots() {
      if (!this.form.donation_site_id || !this.form.date) {
        this.slots = [];
        return;
      }

      this.loadingSlots = true;

      baseRequestClient
        .get("/donor/appointment-slots", {
          params: {
            type: "fixed_point",
            donation_site_id: this.form.donation_site_id,
            date: this.form.date,
          },
        })
        .then((res) => {
          if (res.data.status) {
            this.slots = res.data.data || [];

            this.slots.forEach((slot) => {
              socket.emit("join_slot", slot.id);
            });
          }
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Lỗi tải danh sách slot";
          this.$toast?.error?.(message);
        })
        .finally(() => {
          this.loadingSlots = false;
        });
    },

    mapEmbedUrl(site) {
      return `https://www.google.com/maps?q=${encodeURIComponent(
        site.name + " " + site.address
      )}&output=embed`;
    },

    openInMaps(site) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          site.name + " " + site.address
        )}`,
        "_blank"
      );
    },

    clearSelectedSite() {
      this.form.donation_site_id = "";
      this.form.appointment_slot_id = "";
      this.slots = [];
      this.$router.replace({
        path: this.$route.path,
        query: {},
      });
    },

    applyPrefillDonationSite() {
      const querySiteId = this.$route.query.donation_site_id;
      if (!querySiteId) return;

      const found = this.donation_sites.find(
        (site) => String(site.id) === String(querySiteId)
      );

      if (found) {
        this.form.donation_site_id = String(found.id);
      }
    },

    loadProfile() {
      this.loadingProfile = true;

      baseRequestClient
        .get("/donor/me")
        .then((res) => {
          if (!res.data.status) return;

          const u = res.data.data || {};

          if (!this.form.full_name) this.form.full_name = u.full_name;

          if (!this.form.blood_group && this.bloodGroups.includes(u.blood_group)) {
            this.form.blood_group = u.blood_group;
          }
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Lỗi tải thông tin";
          this.$toast?.error?.(message);
        })
        .finally(() => {
          this.loadingProfile = false;
        });
    },

    loadDonationSites() {
      baseRequestClient
        .get("/donor/donation-sites")
        .then((res) => {
          if (res.data.status) {
            this.donation_sites = res.data.data || [];
            this.applyPrefillDonationSite();
          }
        })
        .catch((err) => {
          const message =
            err.response?.data?.message || "Lỗi tải danh sách địa điểm";
          this.$toast?.error?.(message);
        });
    },

    submitBooking() {
      if (
        !this.form.donation_site_id ||
        !this.form.date ||
        !this.form.appointment_slot_id ||
        !this.form.volume
      ) {
        this.$toast?.error?.("Vui lòng điền đầy đủ thông tin bắt buộc.");
        return;
      }

      const payload = {
        donation_site_id: Number(this.form.donation_site_id),
        appointment_slot_id: Number(this.form.appointment_slot_id),
        slot_id: Number(this.form.appointment_slot_id),
        preferred_volume_ml: this.normalizeVolume(this.form.volume),
        volume: this.form.volume,
        notes: this.form.note || null,
      };

      this.submitting = true;

      baseRequestClient
        .post("/donor/donation-appointments", payload)
        .then((res) => {
          if (res.data.status) {
            this.$toast?.success?.(res.data.message || "Đăng ký thành công!");
            this.resetForm();
            this.loadMyAppointments();
          } else {
            this.$toast?.error?.(res.data.message || "Đăng ký thất bại!");
          }
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Đã có lỗi xảy ra";
          this.$toast?.error?.(message);
        })
        .finally(() => {
          this.submitting = false;
        });
    },

    resetForm() {
      this.form.donation_site_id = "";
      this.form.date = "";
      this.form.appointment_slot_id = "";
      this.form.volume = "";
      this.form.note = "";
      this.slots = [];

      this.$router.replace({
        path: this.$route.path,
        query: {},
      });
    },

    loadMyAppointments() {
      this.loadingAppointments = true;

      baseRequestClient
        .get("/donor/donation-appointments")
        .then((res) => {
          if (res.data.status) this.myAppointments = res.data.data || [];
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Lỗi tải lịch sử";
          this.$toast?.error?.(message);
        })
        .finally(() => {
          this.loadingAppointments = false;
        });
    },

    cancelAppointment(a) {
      this.submittingCancelId = a.id;

      baseRequestClient
        .post(`/donor/donation-appointments/${a.id}/cancel`)
        .then((res) => {
          if (res.data.status) {
            this.$toast?.success?.(res.data.message);
            this.loadMyAppointments();
            this.loadSlots();
          } else {
            this.$toast?.error?.(res.data.message);
          }
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Lỗi hủy lịch";
          this.$toast?.error?.(message);
        })
        .finally(() => {
          this.submittingCancelId = null;
        });
    },
  },
};
</script>

<style scoped>
.table {
  font-size: 15px;
}

.form-check-input:checked {
  background-color: #dc3545;
  border-color: #dc3545;
}

.slot-card {
  border: 1px solid #dee2e6;
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  transition: 0.2s ease;
}

.slot-card:hover {
  border-color: #dc3545;
  box-shadow: 0 0.25rem 0.75rem rgba(220, 53, 69, 0.08);
}

.slot-card.active {
  border-color: #dc3545;
  background: #fff5f5;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.12);
}

.slot-card.disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>