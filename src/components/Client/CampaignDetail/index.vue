<template>
  <div class="container py-4">
    <div class="mb-3 d-flex justify-content-between align-items-center">
      <div>
        <h3 class="fw-bold text-danger mb-1">
          <i class="bi bi-heart-pulse me-2"></i>Chi tiết chiến dịch
        </h3>
        <p class="text-muted mb-0">Đăng ký tham gia chiến dịch hiến máu</p>
      </div>
      <button class="btn btn-secondary" @click="$router.go(-1)">
        <i class="bi bi-arrow-left me-1"></i>Quay lại
      </button>
    </div>

    <div v-if="loading" class="text-center text-muted py-5">
      <div class="spinner-border text-danger"></div>
      <div class="small mt-2">Đang tải...</div>
    </div>

    <div v-else-if="!campaign" class="text-center text-muted py-5">
      <i class="bi bi-inbox"></i>
      <div class="mt-2">Không tìm thấy chiến dịch</div>
    </div>

    <div v-else class="row g-4">
      <!-- LEFT -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h4 class="fw-bold mb-2">{{ campaign.title }}</h4>

            <div class="mb-2 text-secondary">
              <i class="bi bi-geo-alt-fill text-danger me-1"></i>
              {{ campaign.location_display || campaign.location || "Chưa cập nhật địa điểm" }}
            </div>

            <div class="mb-2 text-secondary">
              <i class="bi bi-calendar-event-fill text-danger me-1"></i>
              {{ formatDate(campaign.start_date) }} - {{ formatDate(campaign.end_date) }}
            </div>

            <span class="badge" :class="statusBadgeClass(campaign.status)">
              {{ statusLabel(campaign.status) }}
            </span>

            <hr />

            <div class="text-secondary" style="white-space: pre-line">
              {{ campaign.content || "Không có nội dung." }}
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-2">Đăng ký tham gia</h5>
            <p class="text-muted small mb-3">
              Chọn ngày trong thời gian chiến dịch và khung giờ bạn muốn tham gia.
            </p>

            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Ngày tham gia *</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="form.date"
                  :min="dateOnly(campaign.start_date)"
                  :max="dateOnly(campaign.end_date)"
                />
              </div>

              <div class="col-12">
                <label class="form-label">Khung giờ *</label>
                <select class="form-select" v-model="form.time_slot">
                  <option disabled value="">Chọn khung giờ</option>
                  <option>07:00 - 11:00</option>
                  <option>13:00 - 17:00</option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label">Dung tích dự kiến</label>
                <select class="form-select" v-model="form.preferred_volume_ml">
                  <option value="">Tuỳ chọn</option>
                  <option value="250">250 ml</option>
                  <option value="350">350 ml</option>
                  <option value="450">450 ml</option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label">Ghi chú</label>
                <textarea
                  class="form-control"
                  rows="3"
                  v-model.trim="form.notes"
                  placeholder="Ví dụ: muốn hiến lần đầu, có tiền sử..."
                ></textarea>
              </div>

              <div class="col-12 d-flex gap-2">
                <button
                  class="btn btn-danger w-100"
                  @click="submit"
                  :disabled="submitting || !canSubmit"
                >
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  Đăng ký chiến dịch
                </button>
              </div>

              <div class="small text-muted" v-if="campaign.status === 'ended'">
                Chiến dịch đã kết thúc nên không thể đăng ký.
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- /RIGHT -->
    </div>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";

export default {
  data() {
    return {
      loading: false,
      submitting: false,
      campaign: null,
      form: {
        date: "",
        time_slot: "",
        preferred_volume_ml: "",
        notes: "",
      },
    };
  },

  computed: {
    canSubmit() {
      if (!this.campaign) return false;
      if (this.campaign.status === "ended") return false;
      return !!this.form.date && !!this.form.time_slot;
    },
  },

  mounted() {
    this.loadCampaign();
  },

  methods: {
    async loadCampaign() {
      this.loading = true;
      try {
        const id = this.$route.params.id;
        const res = await baseRequestClient.get(`/public/campaigns/${id}`);
        if (res.data?.status) this.campaign = res.data.data;
      } catch (e) {
        this.campaign = null;
      } finally {
        this.loading = false;
      }
    },

    async submit() {
      if (!this.canSubmit) {
        if (this.campaign?.status === "ended") {
          this.$toast?.error?.("Chiến dịch đã kết thúc, không thể đăng ký.");
        } else {
          this.$toast?.error?.("Vui lòng chọn ngày và khung giờ tham gia.");
        }
        return;
      }

      this.submitting = true;
      try {
        const payload = {
          campaign_id: this.campaign.id,
          date: this.form.date,
          time_slot: this.form.time_slot,
          preferred_volume_ml: this.form.preferred_volume_ml || null,
          notes: this.form.notes || null,
        };

        const res = await baseRequestClient.post("/donor/register-campaigns", payload);

        if (res.data?.status) {
          this.$toast?.success?.(res.data.message || "Đăng ký thành công!");
          this.$router.push("/register-blooddonation");
        } else {
          this.$toast?.error?.(res.data?.message || "Đăng ký thất bại!");
        }
      } catch (err) {
        this.$toast?.error?.(err.response?.data?.message || "Lỗi server!");
      } finally {
        this.submitting = false;
      }
    },

    statusLabel(s) {
      if (s === "upcoming") return "Sắp diễn ra";
      if (s === "running") return "Đang diễn ra";
      if (s === "ended") return "Đã kết thúc";
      return s || "-";
    },

    statusBadgeClass(s) {
      if (s === "running") return "bg-danger";
      if (s === "upcoming") return "bg-warning text-dark";
      if (s === "ended") return "bg-secondary";
      return "bg-light text-dark border";
    },

    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    dateOnly(date) {
      if (!date) return "";
      return new Date(date).toISOString().slice(0, 10);
    },
  },
};
</script>

<style scoped></style>
