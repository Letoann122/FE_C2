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
                <input type="text" v-model.trim="form.full_name" class="form-control" />
              </div>

              <div class="col-lg-6">
                <label class="form-label">Nhóm máu *</label>
                <select class="form-select" v-model="form.blood_group">
                  <option disabled value="">Chọn nhóm máu</option>
                  <option v-for="g in bloodGroups" :key="g" :value="g">
                    {{ g }}
                  </option>
                </select>
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

              <div class="col-lg-6">
                <label class="form-label">Khung giờ *</label>
                <select class="form-select" v-model="form.time_slot">
                  <option disabled value="">Chọn khung giờ</option>
                  <option>7:00 - 11:00</option>
                  <option>13:00 - 17:00</option>
                </select>
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
            <i class="bi bi-geo-alt-fill text-danger me-2"></i> Địa điểm hiến
            máu đã chọn
          </h5>
          <div class="d-flex justify-content-between align-items-start border rounded-3 p-3 bg-white">
            <div class="me-3">
              <p class="fw-semibold mb-1">{{ selectedSite.name }}</p>
              <small class="text-secondary d-block mb-1">{{
                selectedSite.address
                }}</small>
              <small class="text-muted">({{ selectedSite.hospital_name }})</small>
            </div>
            <span class="badge rounded-pill px-3 py-2" :class="selectedSite.is_active
                ? 'bg-success-subtle text-success'
                : 'bg-secondary-subtle text-muted'
              ">
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
              <i class="bi bi-clock-history text-danger me-2"></i>Lịch hiến máu
              của bạn
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
                  <th>Điểm hiến</th>
                  <th>Trạng thái</th>
                  <th class="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in myAppointments" :key="a.id">
                  <td>
                    <span class="badge bg-light text-dark border">{{
                      a.appointment_code
                      }}</span>
                  </td>
                  <td>{{ formatDate(a.scheduled_at) }}</td>
                  <td>{{ a.donation_site?.name }}</td>
                  <td>
                    <span class="badge" :class="{
                      'bg-warning text-dark': a.status === 'REQUESTED',
                      'bg-success': a.status === 'APPROVED',
                      'bg-secondary': a.status === 'REJECTED',
                      'bg-dark': a.status === 'CANCELLED',
                      'bg-info text-dark': a.status === 'BOOKED',
                      'bg-primary': a.status === 'COMPLETED',
                    }">
                      {{
                        a.status === "REQUESTED"
                        ? "Chờ duyệt"
                        :a.status === "APPROVED"
                        ?"Đã duyệt"
                        :a.status === "REJECTED"
                        ?"Từ chối"
                        :a.status === "CANCELLED"
                        ?"Đã hủy"
                        :a.status === "BOOKED"
                        ?"Đã đặt"
                        :a.status
                        ?"Hoàn thành"
                        :a.status === "COMPLETED"
                      }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button v-if="
                      ['REQUESTED', 'APPROVED', 'BOOKED'].includes(a.status)
                    " class="btn btn-sm btn-outline-danger" @click="cancelAppointment(a)"
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

export default {
  data() {
    return {
      loadingProfile: false,
      loadingAppointments: false,
      submitting: false,
      submittingCancelId: null,
      donation_sites: [],
      myAppointments: [],
      form: {
        full_name: "",
        blood_group: "",
        donation_site_id: "",
        date: "",
        time_slot: "",
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
    minDate() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
    },
  },

  mounted() {
    this.loadDonationSites();
    this.loadProfile();
    this.loadMyAppointments();
  },

  methods: {
    formatDate(date) {
      const d = new Date(date);
      const pad = (n) => (n < 10 ? "0" + n : n);
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
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
    },

    loadProfile() {
      this.loadingProfile = true;
      baseRequestClient
        .get("/donor/me")
        .then((res) => {
          if (!res.data.status) return;
          const u = res.data.data || {};
          if (!this.form.full_name) this.form.full_name = u.full_name;
          if (
            !this.form.blood_group &&
            this.bloodGroups.includes(u.blood_group)
          ) {
            this.form.blood_group = u.blood_group;
          }
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Lỗi tải thông tin";
          this.$toast.error(message);
        })
        .finally(() => (this.loadingProfile = false));
    },

    loadDonationSites() {
      baseRequestClient
        .get("/donor/donation-sites")
        .then((res) => {
          if (res.data.status) this.donation_sites = res.data.data || [];
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Lỗi tải danh sách địa điểm";
          this.$toast.error(message);
        });
    },

    buildScheduledAt(dateStr, slot) {
      if (!dateStr || !slot) return null;
      const h = slot.split("-")[0].trim().split(":")[0];
      const pad = (n) => (n < 10 ? "0" + n : n);
      return `${dateStr} ${pad(h)}:00:00`;
    },

    submitBooking() {
      const scheduled_at = this.buildScheduledAt(
        this.form.date,
        this.form.time_slot
      );

      const payload = {
        donation_site_id: Number(this.form.donation_site_id),
        scheduled_at,
        time_slot: this.form.time_slot,
        volume: this.form.volume,
        notes: this.form.note || null,
      };

      this.submitting = true;

      baseRequestClient
        .post("/donor/donation-appointments", payload)
        .then((res) => {
          if (res.data.status) {
            this.$toast.success(res.data.message);
            this.resetForm();
            this.loadMyAppointments();
          } else {
            this.$toast.error(res.data.message);
          }
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Đã có lỗi xảy ra";
          this.$toast.error(message);
        })
        .finally(() => (this.submitting = false));
    },

    resetForm() {
      this.form.donation_site_id = "";
      this.form.date = "";
      this.form.time_slot = "";
      this.form.volume = "";
      this.form.note = "";
    },

    loadMyAppointments() {
      this.loadingAppointments = true;
      baseRequestClient
        .get("/donor/donation-appointments")
        .then((res) => {
          if (res.data.status) this.myAppointments = res.data.data;
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Lỗi tải lịch sử";
          this.$toast.error(message);
        })
        .finally(() => (this.loadingAppointments = false));
    },

    cancelAppointment(a) {
      this.submittingCancelId = a.id;
      baseRequestClient
        .post(`/donor/donation-appointments/${a.id}/cancel`)
        .then((res) => {
          if (res.data.status) {
            this.$toast.success(res.data.message);
            this.loadMyAppointments();
          } else {
            this.$toast.error(res.data.message);
          }
        })
        .catch((err) => {
          const message = err.response?.data?.message || "Lỗi hủy lịch";
          this.$toast.error(message);
        })
        .finally(() => (this.submittingCancelId = null));
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
</style>