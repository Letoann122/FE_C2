<template>
  <div class="container py-5" v-if="campaign">
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-body p-4">
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

            <div class="row g-3 mb-4">
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

            <div class="campaign-content">
              <h5 class="fw-bold mb-3">Nội dung chiến dịch</h5>
              <div class="content-render" v-html="campaign.content"></div>
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

            <div v-if="isCampaignEnded" class="alert alert-secondary small">
              Chiến dịch đã kết thúc, không thể đăng ký.
            </div>

            <div class="mb-3">
              <label class="form-label">Chọn ngày hiến máu *</label>

              <select
                class="form-select"
                v-model="form.slot_date"
                :disabled="isCampaignEnded || loadingSlots"
                @change="onChangeDate"
              >
                <option value="">-- Chọn ngày --</option>
                <option
                  v-for="date in availableDates"
                  :key="date"
                  :value="date"
                >
                  {{ formatDate(date) }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Khung giờ hiến máu *</label>

              <div v-if="loadingSlots" class="small text-muted">
                <span class="spinner-border spinner-border-sm me-1"></span>
                Đang tải slot...
              </div>

              <div v-else-if="!form.slot_date" class="alert alert-light border small">
                Vui lòng chọn ngày hiến máu trước.
              </div>

              <div v-else-if="filteredSlots.length === 0" class="alert alert-warning small">
                Ngày này chưa có slot khả dụng.
              </div>

              <div v-else class="d-flex flex-column gap-2">
                <button
                  v-for="slot in filteredSlots"
                  :key="slot.id"
                  type="button"
                  class="slot-card text-start"
                  :class="{
                    active: String(form.appointment_slot_id) === String(slot.id),
                    disabled: slot.is_full || isCampaignEnded || isSlotExpired(slot),
                  }"
                  :disabled="slot.is_full || isCampaignEnded || isSlotExpired(slot)"
                  @click="selectSlot(slot)"
                >
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong>{{ formatSlotTime(slot) }}</strong>

                    <span
                      class="badge"
                      :class="
                        slot.is_full || isCampaignEnded || isSlotExpired(slot)
                          ? 'bg-secondary'
                          : 'bg-success'
                      "
                    >
                      {{
                        isCampaignEnded
                          ? "Đã kết thúc"
                          : isSlotExpired(slot)
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
                    :disabled="isCampaignEnded"
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
                :disabled="isCampaignEnded"
              ></textarea>
            </div>

            <button
              class="btn btn-danger w-100"
              @click="submitRegister"
              :disabled="submitting || isCampaignEnded"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
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
        slot_date: "",
        appointment_slot_id: "",
        preferred_volume_ml: "350ml",
        notes: "",
      },

      volumes: ["250ml", "350ml", "450ml"],
    };
  },

  computed: {
    campaignStatusLabel() {
      const map = {
        upcoming: "Sắp diễn ra",
        running: "Đang diễn ra",
        ended: "Đã kết thúc",
      };

      return map[this.campaign?.status] || this.campaign?.status || "";
    },

    isCampaignEnded() {
      return this.campaign?.status === "ended";
    },

    availableDates() {
      const dates = this.slots
        .map((slot) => this.getDateKey(slot.slot_date))
        .filter(Boolean);

      return [...new Set(dates)].sort();
    },

    filteredSlots() {
      if (!this.form.slot_date) return [];

      return this.slots.filter(
        (slot) => this.getDateKey(slot.slot_date) === this.form.slot_date
      );
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

      socket.off("slot_capacity_updated", this.handleSlotUpdated);
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

    getDateKey(value) {
      if (!value) return "";

      if (typeof value === "string") {
        return value.slice(0, 10);
      }

      const d = new Date(value);

      if (Number.isNaN(d.getTime())) return "";

      return d.toISOString().slice(0, 10);
    },

    formatDate(date) {
      if (!date) return "-";

      return new Date(date).toLocaleDateString("vi-VN");
    },

    formatSlotTime(slot) {
      if (!slot) return "";

      return `${String(slot.start_time).slice(0, 5)} - ${String(
        slot.end_time
      ).slice(0, 5)}`;
    },

    isSlotExpired(slot) {
      if (!slot?.slot_date || !slot?.end_time) return false;

      const dateKey = this.getDateKey(slot.slot_date);
      const endTime = String(slot.end_time).slice(0, 8);
      const endAt = new Date(`${dateKey}T${endTime}+07:00`);

      return Date.now() > endAt.getTime();
    },

    normalizeVolume(value) {
      if (!value) return null;

      return Number(String(value).replace(/[^\d]/g, ""));
    },

    onChangeDate() {
      this.form.appointment_slot_id = "";
    },

    selectSlot(slot) {
      if (this.isCampaignEnded) {
        this.$toast?.error?.("Chiến dịch đã kết thúc!");
        return;
      }

      if (slot.is_full) {
        this.$toast?.error?.("Slot này đã đầy!");
        return;
      }

      if (this.isSlotExpired(slot)) {
        this.$toast?.error?.("Khung giờ này đã kết thúc!");
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
        const res = await baseRequestClient.get("/donor/appointment-slots", {
          params: {
            type: "campaign",
            campaign_id: this.campaign.id,
          },
        });

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
      if (this.isCampaignEnded) {
        this.$toast?.error?.("Chiến dịch đã kết thúc!");
        return;
      }

      if (!this.form.slot_date) {
        this.$toast?.error?.("Vui lòng chọn ngày hiến máu!");
        return;
      }

      if (!this.form.appointment_slot_id) {
        this.$toast?.error?.("Vui lòng chọn khung giờ!");
        return;
      }

      const selectedSlot = this.slots.find(
        (slot) => String(slot.id) === String(this.form.appointment_slot_id)
      );

      if (!selectedSlot) {
        this.$toast?.error?.("Khung giờ không hợp lệ!");
        return;
      }

      if (this.getDateKey(selectedSlot.slot_date) !== this.form.slot_date) {
        this.$toast?.error?.("Khung giờ không thuộc ngày đã chọn!");
        return;
      }

      if (selectedSlot.is_full) {
        this.$toast?.error?.("Slot này đã đầy!");
        return;
      }

      if (this.isSlotExpired(selectedSlot)) {
        this.$toast?.error?.("Khung giờ này đã kết thúc!");
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

          this.form.slot_date = "";
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