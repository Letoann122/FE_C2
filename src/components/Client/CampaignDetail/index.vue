<template>
  <div class="container py-5" v-if="campaign">
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <div>
                <h2 class="fw-bold text-danger mb-2">
                  {{ campaign.title }}
                </h2>

                <div class="d-flex flex-wrap gap-2 mb-3">
                  <span class="badge bg-danger-subtle text-danger">
                    {{ campaignStatusLabel }}
                  </span>

                  <span
                    class="badge"
                    :class="campaign.is_emergency ? 'bg-warning text-dark' : 'bg-primary'"
                  >
                    {{ campaign.is_emergency ? "Khẩn cấp" : "Thông thường" }}
                  </span>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="info-box">
                    <small class="text-muted d-block">Ngày bắt đầu</small>
                    <strong>{{ formatDate(campaign.start_date) }}</strong>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="info-box">
                    <small class="text-muted d-block">Ngày kết thúc</small>
                    <strong>{{ formatDate(campaign.end_date) }}</strong>
                  </div>
                </div>

                <div class="col-12">
                  <div class="info-box">
                    <small class="text-muted d-block">Địa điểm</small>
                    <strong>{{ campaign.location_display || campaign.location }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="campaign-content">
              <h5 class="fw-bold mb-3">Nội dung chiến dịch</h5>

              <div
                class="content-render"
                v-html="campaign.content"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 sticky-top campaign-booking-card">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-3">
              <i class="bi bi-calendar2-heart me-2 text-danger"></i>
              Đăng ký hiến máu
            </h5>

            <div class="mb-3">
              <label class="form-label">Khung giờ hiến máu *</label>

              <div v-if="loadingSlots" class="small text-muted">
                <span class="spinner-border spinner-border-sm me-1"></span>
                Đang tải slot...
              </div>

              <div v-else-if="slots.length === 0" class="alert alert-warning small">
                Chưa có slot khả dụng cho chiến dịch này.
              </div>

              <div v-else class="d-flex flex-column gap-2">
                <button
                  v-for="slot in slots"
                  :key="slot.id"
                  type="button"
                  class="slot-card text-start"
                  :class="{
                    active: String(form.appointment_slot_id) === String(slot.id),
                    disabled: slot.is_full,
                  }"
                  :disabled="slot.is_full"
                  @click="selectSlot(slot)"
                >
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong>
                      {{ formatDate(slot.slot_date) }}
                    </strong>

                    <span
                      class="badge"
                      :class="slot.is_full ? 'bg-secondary' : 'bg-success'"
                    >
                      {{ slot.is_full ? "Đã đầy" : "Còn chỗ" }}
                    </span>
                  </div>

                  <div class="mb-1">
                    {{ formatSlotTime(slot) }}
                  </div>

                  <div class="small text-muted mb-2">
                    {{ slot.current_count }} / {{ slot.slot_capacity }} người
                    <span v-if="slot.percent !== undefined">
                      ({{ slot.percent }}%)
                    </span>
                  </div>

                  <div class="progress" style="height: 6px">
                    <div
                      class="progress-bar bg-danger"
                      :style="{ width: `${Math.min(slot.percent || 0, 100)}%` }"
                    ></div>
                  </div>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Dung tích máu *</label>

              <div class="d-flex flex-wrap gap-3">
                <label class="form-check" v-for="v in volumes" :key="v">
                  <input
                    type="radio"
                    class="form-check-input"
                    :value="v"
                    v-model="form.preferred_volume_ml"
                  />
                  <span class="form-check-label">{{ v }}</span>
                </label>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Ghi chú</label>

              <textarea
                class="form-control"
                rows="3"
                v-model.trim="form.notes"
              ></textarea>
            </div>

            <button
              class="btn btn-danger w-100"
              @click="submitRegister"
              :disabled="submitting"
            >
              <span
                v-if="submitting"
                class="spinner-border spinner-border-sm me-1"
              ></span>

              Đăng ký tham gia chiến dịch
            </button>
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
      campaign: null,
      slots: [],
      loading: false,
      loadingSlots: false,
      submitting: false,

      form: {
        appointment_slot_id: "",
        preferred_volume_ml: "350ml",
        notes: "",
      },

      volumes: ["250ml", "350ml", "450ml"],
    };
  },

  computed: {
    campaignStatusLabel() {
      if (!this.campaign) return "";

      const status = this.campaign.status;

      const map = {
        upcoming: "Sắp diễn ra",
        running: "Đang diễn ra",
        ended: "Đã kết thúc",
      };

      return map[status] || status;
    },
  },

  mounted() {
    this.loadCampaignDetail();
    this.initSocket();
  },

  beforeUnmount() {
    socket.off("slot_capacity_updated", this.handleSlotUpdated);
  },

  methods: {
    initSocket() {
      if (!socket.connected) socket.connect();

      socket.on("slot_capacity_updated", this.handleSlotUpdated);
    },

    handleSlotUpdated(payload) {
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

    formatDate(date) {
      if (!date) return "-";

      const d = new Date(date);

      return d.toLocaleDateString("vi-VN");
    },

    formatSlotTime(slot) {
      if (!slot) return "";

      return `${String(slot.start_time).slice(0, 5)} - ${String(
        slot.end_time
      ).slice(0, 5)}`;
    },

    normalizeVolume(value) {
      if (!value) return null;

      return Number(String(value).replace(/[^\d]/g, ""));
    },

    selectSlot(slot) {
      if (slot.is_full) {
        this.$toast?.error?.("Slot này đã đầy!");
        return;
      }

      this.form.appointment_slot_id = slot.id;
    },

    async loadCampaignDetail() {
      this.loading = true;

      try {
        const id = this.$route.params.id;

        const res = await baseRequestClient.get(`/public/campaigns/${id}`);

        if (res.data.status) {
          this.campaign = res.data.data;

          await this.loadSlots();
        }
      } catch (err) {
        const message =
          err.response?.data?.message || "Không tải được chiến dịch";

        this.$toast?.error?.(message);
      } finally {
        this.loading = false;
      }
    },

    async loadSlots() {
      if (!this.campaign?.id) return;

      this.loadingSlots = true;

      try {
        const res = await baseRequestClient.get(
          "/donor/appointment-slots",
          {
            params: {
              type: "campaign",
              campaign_id: this.campaign.id,
            },
          }
        );

        if (res.data.status) {
          this.slots = res.data.data || [];

          this.slots.forEach((slot) => {
            socket.emit("join_slot", slot.id);
          });
        }
      } catch (err) {
        const message =
          err.response?.data?.message || "Không tải được slot";

        this.$toast?.error?.(message);
      } finally {
        this.loadingSlots = false;
      }
    },

    async submitRegister() {
      if (!this.form.appointment_slot_id) {
        this.$toast?.error?.("Vui lòng chọn khung giờ!");
        return;
      }

      this.submitting = true;

      try {
        const payload = {
          campaign_id: this.campaign.id,
          appointment_slot_id: Number(this.form.appointment_slot_id),
          slot_id: Number(this.form.appointment_slot_id),
          preferred_volume_ml: this.normalizeVolume(
            this.form.preferred_volume_ml
          ),
          notes: this.form.notes || null,
        };

        const res = await baseRequestClient.post(
          "/donor/register-campaigns",
          payload
        );

        if (res.data.status) {
          this.$toast?.success?.(
            res.data.message || "Đăng ký thành công!"
          );

          this.form.appointment_slot_id = "";
          this.form.notes = "";

          this.loadSlots();
        } else {
          this.$toast?.error?.(res.data.message);
        }
      } catch (err) {
        const message =
          err.response?.data?.message || "Đăng ký thất bại";

        this.$toast?.error?.(message);
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.info-box {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 14px;
}

.slot-card {
  border: 1px solid #dee2e6;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
  transition: 0.2s ease;
}

.slot-card:hover {
  border-color: #dc3545;
}

.slot-card.active {
  border-color: #dc3545;
  background: #fff5f5;
}

.slot-card.disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.campaign-booking-card {
  top: 100px;
}
</style>