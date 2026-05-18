<template>
  <div class="container-fluid py-4">
    <!-- HEADER -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-4">
        <div
          class="d-flex justify-content-between align-items-start flex-wrap gap-3"
        >
          <div>
            <h3 class="fw-bold text-danger mb-1">
              <i class="bi bi-magic me-2"></i>
              AI Emergency Recommendation
            </h3>

            <p class="text-muted mb-0">
              Hệ thống đề xuất donor phù hợp cho yêu cầu máu khẩn cấp.
            </p>
          </div>

          <div class="badge bg-danger fs-6 px-3 py-2">
            <i class="bi bi-cpu-fill me-1"></i>
            AI Matching Engine
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- LEFT -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-4">
              <i class="bi bi-exclamation-diamond-fill text-danger me-2"></i>
              Tạo yêu cầu khẩn cấp
            </h5>

            <div class="mb-3">
              <label class="form-label fw-semibold">
                Điểm tiếp nhận máu
              </label>

              <select
                v-model="form.donation_site_id"
                class="form-select"
              >
                <option value="">
                  Chọn điểm tiếp nhận
                </option>

                <option
                  v-for="site in donationSites"
                  :key="site.id"
                  :value="site.id"
                >
                  {{ site.name }}
                </option>
              </select>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Nhóm máu
                </label>

                <select
                  v-model="form.blood_group"
                  class="form-select"
                >
                  <option
                    v-for="item in bloodGroups"
                    :key="item"
                    :value="item"
                  >
                    {{ item }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Mức độ
                </label>

                <select
                  v-model="form.urgency_level"
                  class="form-select"
                >
                  <option value="normal">
                    Bình thường
                  </option>

                  <option value="high">
                    Cao
                  </option>

                  <option value="critical">
                    Khẩn cấp
                  </option>
                </select>
              </div>
            </div>

            <div class="row g-3 mt-1">
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Lượng máu cần (ml)
                </label>

                <input
                  v-model.number="form.required_volume_ml"
                  type="number"
                  class="form-control"
                  min="250"
                  step="50"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Trong bao lâu
                </label>

                <select
                  v-model.number="form.needed_in_hours"
                  class="form-select"
                >
                  <option :value="1">1 giờ</option>
                  <option :value="2">2 giờ</option>
                  <option :value="4">4 giờ</option>
                  <option :value="6">6 giờ</option>
                  <option :value="12">12 giờ</option>
                  <option :value="24">24 giờ</option>
                </select>
              </div>
            </div>

            <div class="mt-3">
              <label class="form-label fw-semibold">
                Tiêu đề
              </label>

              <input
                v-model="form.title"
                class="form-control"
                placeholder="Ví dụ: Khẩn cấp cần máu O-"
              />
            </div>

            <div class="mt-3">
              <label class="form-label fw-semibold">
                Nội dung
              </label>

              <textarea
                v-model="form.message"
                class="form-control"
                rows="4"
                placeholder="Mô tả yêu cầu khẩn cấp..."
              ></textarea>
            </div>

            <div class="d-grid mt-4">
              <button
                class="btn btn-danger"
                @click="createEmergencyRequest"
                :disabled="creating"
              >
                <span
                  v-if="creating"
                  class="spinner-border spinner-border-sm me-2"
                ></span>

                <i
                  v-else
                  class="bi bi-lightning-charge-fill me-2"
                ></i>

                Tạo yêu cầu khẩn cấp
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="col-lg-8">
        <!-- PANEL -->
        <div
          v-if="currentRequest"
          class="card border-0 shadow-sm rounded-4 mb-4"
        >
          <div class="card-body p-4">
            <div
              class="d-flex justify-content-between align-items-start flex-wrap gap-3"
            >
              <div>
                <div class="d-flex align-items-center gap-2 flex-wrap mb-2">
                  <span class="badge bg-danger fs-6 px-3 py-2">
                    {{ currentRequest.blood_group }}
                  </span>

                  <span
                    class="badge fs-6 px-3 py-2"
                    :class="urgencyClass(currentRequest.urgency_level)"
                  >
                    {{ urgencyLabel(currentRequest.urgency_level) }}
                  </span>

                  <span
                    class="badge fs-6 px-3 py-2"
                    :class="statusClass(currentRequest.status)"
                  >
                    {{ statusLabel(currentRequest.status) }}
                  </span>
                </div>

                <h4 class="fw-bold mb-1">
                  {{ currentRequest.title }}
                </h4>

                <p class="text-muted mb-2">
                  {{ currentRequest.message }}
                </p>

                <div class="small text-muted">
                  <i class="bi bi-geo-alt-fill me-1"></i>
                  {{ currentRequest.donation_site_name || currentRequest.donation_site?.name || "Chưa có điểm tiếp nhận" }}
                </div>
              </div>

              <div class="text-end">
                <div class="fw-bold fs-2 text-danger">
                  {{ currentRequest.required_volume_ml }}ml
                </div>

                <div class="text-muted small">
                  cần trước
                  {{ formatDate(currentRequest.needed_before) }}
                </div>

                <div class="text-muted small mt-1">
                  Đã đáp ứng:
                  {{ currentRequest.fulfilled_volume_ml || 0 }}ml
                </div>
              </div>
            </div>

            <div class="row g-3 mt-4">
              <div class="col-md-3">
                <div class="card border">
                  <div class="card-body text-center py-3">
                    <div class="small text-muted">
                      Đã gửi
                    </div>

                    <div class="fs-4 fw-bold text-primary">
                      {{ stats.total }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card border">
                  <div class="card-body text-center py-3">
                    <div class="small text-muted">
                      Đang chờ
                    </div>

                    <div class="fs-4 fw-bold text-warning">
                      {{ stats.pending }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card border">
                  <div class="card-body text-center py-3">
                    <div class="small text-muted">
                      Đồng ý
                    </div>

                    <div class="fs-4 fw-bold text-success">
                      {{ stats.accepted }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card border">
                  <div class="card-body text-center py-3">
                    <div class="small text-muted">
                      Từ chối
                    </div>

                    <div class="fs-4 fw-bold text-danger">
                      {{ stats.declined }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 flex-wrap mt-4">
              <button
                class="btn btn-outline-danger"
                @click="loadRecommendations"
                :disabled="loadingRecommendations"
              >
                <span
                  v-if="loadingRecommendations"
                  class="spinner-border spinner-border-sm me-2"
                ></span>

                <i
                  v-else
                  class="bi bi-stars me-2"
                ></i>

                AI đề xuất donor
              </button>

              <button
                class="btn btn-outline-primary"
                @click="saveRecommendations"
                :disabled="savingRecommendations || recommendations.length === 0"
              >
                <span
                  v-if="savingRecommendations"
                  class="spinner-border spinner-border-sm me-2"
                ></span>

                <i
                  v-else
                  class="bi bi-save2 me-2"
                ></i>

                Lưu danh sách đề xuất
              </button>

              <button
                class="btn btn-danger"
                @click="sendEmergency"
                :disabled="sendingEmergency || !currentRequest"
              >
                <span
                  v-if="sendingEmergency"
                  class="spinner-border spinner-border-sm me-2"
                ></span>

                <i
                  v-else
                  class="bi bi-broadcast me-2"
                ></i>

                Gửi popup donor
              </button>
            </div>
          </div>
        </div>

        <!-- EMPTY CURRENT REQUEST -->
        <div
          v-else
          class="alert alert-light border rounded-4 mb-4"
        >
          <i class="bi bi-info-circle text-danger me-1"></i>
          Vui lòng tạo yêu cầu khẩn cấp để hệ thống đề xuất donor phù hợp.
        </div>

        <!-- RECOMMENDATIONS -->
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <div
              class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4"
            >
              <div>
                <h5 class="fw-bold mb-1">
                  <i class="bi bi-people-fill text-danger me-2"></i>
                  Donor được AI đề xuất
                </h5>

                <div class="text-muted small">
                  Xếp hạng donor dựa trên nhóm máu, khoảng cách, lịch sử hiến máu và điều kiện hỗ trợ.
                </div>
              </div>

              <div class="badge bg-light text-dark border px-3 py-2">
                {{ recommendations.length }} donor
              </div>
            </div>

            <div
              v-if="loadingRecommendations"
              class="text-center py-5"
            >
              <div class="spinner-border text-danger"></div>

              <div class="mt-3 text-muted">
                Hệ thống đang phân tích donor phù hợp...
              </div>
            </div>

            <div
              v-else-if="recommendations.length === 0"
              class="text-center py-5"
            >
              <i class="bi bi-search-heart display-4 text-muted"></i>

              <div class="mt-3 fw-semibold">
                Chưa có donor đề xuất
              </div>

              <div class="text-muted">
                Hãy tạo emergency request và chạy AI recommendation.
              </div>
            </div>

            <div v-else>
              <div
  v-for="(item, index) in recommendations"
  :key="item.donor_id"
  class="recommend-card"
>
  <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
    <div class="d-flex gap-3">
      <div class="rank-circle">
        #{{ index + 1 }}
      </div>

      <div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <h5 class="fw-bold mb-0">
            {{ item.full_name }}
          </h5>

          <span class="badge bg-danger">
            {{ item.blood_group }}
          </span>
        </div>

        <div class="small text-muted mt-1">
          <i class="bi bi-envelope me-1"></i>
          {{ item.email }}
        </div>

        <div class="small text-muted">
          <i class="bi bi-telephone me-1"></i>
          {{ item.phone }}
        </div>

        <div class="small text-muted">
          <i class="bi bi-geo-alt me-1"></i>
          {{ item.address || "Chưa cập nhật địa chỉ" }}
        </div>

        <div class="d-flex gap-2 flex-wrap mt-3">
          <span class="mini-badge">
            {{ item.donation_count }} lần hiến
          </span>

          <span class="mini-badge">
            {{ item.last_donation_days }} ngày
          </span>

          <span
            v-if="item.distance_km !== null"
            class="mini-badge"
          >
            {{ item.distance_km }} km
          </span>

          <span
            v-if="item.eligible"
            class="mini-badge success"
          >
            Đủ điều kiện
          </span>
        </div>
      </div>
    </div>

    <div class="text-end">
      <div class="score-circle">
        {{ item.score }}%
      </div>

      <div class="small text-muted mt-2">
        AI Match Score
      </div>
    </div>
  </div>

  <div class="mt-4">
    <div class="fw-semibold mb-2">
      AI phân tích:
    </div>

    <div class="d-flex flex-column gap-2">
      <div
        v-for="(reason, idx) in item.reasons"
        :key="idx"
        class="reason-item"
      >
        <i class="bi bi-check-circle-fill text-success me-2"></i>
        {{ reason }}
      </div>
    </div>
  </div>
</div>

              <div class="alert alert-light border small mb-0">
                <i class="bi bi-info-circle text-danger me-1"></i>
                Điểm đề xuất chỉ hỗ trợ bác sĩ tham khảo, quyết định cuối cùng vẫn theo quy trình y tế.
              </div>
            </div>

            <div
              v-if="errorMessage"
              class="alert alert-danger rounded-4 mt-4 mb-0"
            >
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";
import socket from "../../../core/socket";

export default {
  name: "EmergencyAI",

  data() {
    return {
      creating: false,
      loadingRecommendations: false,
      savingRecommendations: false,
      sendingEmergency: false,

      errorMessage: "",

      donationSites: [],
      recommendations: [],
      currentRequest: null,

      stats: {
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
      },

      bloodGroups: [
        "O-",
        "O+",
        "A-",
        "A+",
        "B-",
        "B+",
        "AB-",
        "AB+",
      ],

      form: {
        donation_site_id: "",
        blood_group: "O-",
        required_volume_ml: 500,
        urgency_level: "critical",
        needed_in_hours: 2,
        title: "",
        message: "",
      },
    };
  },

  mounted() {
    this.loadDonationSites();
    this.initSocket();
  },

  beforeUnmount() {
    socket.off(
      "emergency_request_stats_updated",
      this.handleEmergencyStatsRealtime
    );
  },

  methods: {
    initSocket() {
      if (!socket.connected) {
        socket.connect();
      }

      socket.on(
        "emergency_request_stats_updated",
        this.handleEmergencyStatsRealtime
      );
    },

    handleEmergencyStatsRealtime(payload) {
      if (!payload?.emergency_request_id || !this.currentRequest?.id) {
        return;
      }

      if (
        String(payload.emergency_request_id) !==
        String(this.currentRequest.id)
      ) {
        return;
      }

      this.stats = {
        total: payload.total || 0,
        pending: payload.pending || 0,
        accepted: payload.accepted || 0,
        declined: payload.declined || 0,
      };
    },

    async loadDonationSites() {
      try {
        const res = await baseRequestDoctor.get("/doctor/donation-sites");

        if (res.data?.status) {
          this.donationSites = res.data.data || [];
        }
      } catch (error) {
        console.error("loadDonationSites error:", error);
      }
    },

    async createEmergencyRequest() {
      this.errorMessage = "";

      if (!this.form.donation_site_id) {
        this.$toast.error("Vui lòng chọn điểm tiếp nhận!");
        return;
      }

      this.creating = true;

      try {
        const payload = {
          donation_site_id: this.form.donation_site_id,
          blood_group: this.form.blood_group,
          required_volume_ml: this.form.required_volume_ml,
          urgency_level: this.form.urgency_level,
          needed_in_hours: this.form.needed_in_hours,
          title:
            this.form.title ||
            `Khẩn cấp cần máu ${this.form.blood_group}`,
          message:
            this.form.message ||
            `Điểm hiến máu đang cần máu ${this.form.blood_group} gấp.`,
        };

        const res = await baseRequestDoctor.post(
          "/doctor/emergency-requests",
          payload
        );

        if (res.data?.status) {
          this.currentRequest = res.data.data;

          this.stats = {
            total: 0,
            pending: 0,
            accepted: 0,
            declined: 0,
          };

          this.$toast.success(
            res.data.message || "Tạo emergency request thành công!"
          );

          this.recommendations = [];

          await this.loadRecommendations();
        } else {
          this.errorMessage =
            res.data?.message || "Không tạo được emergency request!";
        }
      } catch (error) {
        console.error("createEmergencyRequest error:", error);

        this.errorMessage =
          error?.response?.data?.message ||
          "Không tạo được emergency request!";
      } finally {
        this.creating = false;
      }
    },

    async loadRecommendations() {
      if (!this.currentRequest?.id) return;

      this.loadingRecommendations = true;
      this.errorMessage = "";

      try {
        const res = await baseRequestDoctor.get(
          `/doctor/emergency-requests/${this.currentRequest.id}/recommendations`,
          {
            params: {
              limit: 10,
            },
          }
        );

        if (res.data?.status) {
          this.recommendations =
            res.data?.data?.recommendations || [];

          this.currentRequest = {
            ...this.currentRequest,
            ...res.data?.data?.request,
          };

          await this.loadStats();
        } else {
          this.errorMessage =
            res.data?.message || "Không lấy được donor đề xuất!";
        }
      } catch (error) {
        console.error("loadRecommendations error:", error);

        this.errorMessage =
          error?.response?.data?.message ||
          "Không lấy được donor đề xuất!";
      } finally {
        this.loadingRecommendations = false;
      }
    },

    async saveRecommendations() {
      if (!this.currentRequest?.id) return;

      this.savingRecommendations = true;

      try {
        const res = await baseRequestDoctor.post(
          `/doctor/emergency-requests/${this.currentRequest.id}/recommendations/save`,
          {
            limit: 10,
          }
        );

        if (res.data?.status) {
          this.$toast.success(
            res.data.message || "Đã lưu danh sách donor đề xuất!"
          );

          if (res.data?.data?.stats) {
            this.stats = res.data.data.stats;
          } else {
            await this.loadStats();
          }
        } else {
          this.$toast.error(
            res.data?.message || "Không thể lưu donor đề xuất!"
          );
        }
      } catch (error) {
        console.error("saveRecommendations error:", error);

        this.$toast.error(
          error?.response?.data?.message ||
            "Không thể lưu donor đề xuất!"
        );
      } finally {
        this.savingRecommendations = false;
      }
    },

    async sendEmergency() {
      if (!this.currentRequest?.id) return;

      this.sendingEmergency = true;

      try {
        const res = await baseRequestDoctor.post(
          `/doctor/emergency-requests/${this.currentRequest.id}/send`
        );

        if (res.data?.status) {
          this.$toast.success(
            res.data.message || "Đã gửi popup emergency!"
          );

          if (res.data?.data?.stats) {
            this.stats = res.data.data.stats;
          } else {
            await this.loadStats();
          }
        } else {
          this.$toast.error(
            res.data?.message || "Không gửi được popup!"
          );
        }
      } catch (error) {
        console.error("sendEmergency error:", error);

        this.$toast.error(
          error?.response?.data?.message || "Không gửi được popup!"
        );
      } finally {
        this.sendingEmergency = false;
      }
    },

    async loadStats() {
      if (!this.currentRequest?.id) return;

      try {
        const res = await baseRequestDoctor.get(
          `/doctor/emergency-requests/${this.currentRequest.id}/stats`
        );

        if (res.data?.status) {
          this.stats = res.data?.data?.stats || {
            total: 0,
            pending: 0,
            accepted: 0,
            declined: 0,
          };

          if (res.data?.data?.request) {
            this.currentRequest = {
              ...this.currentRequest,
              ...res.data.data.request,
            };
          }
        }
      } catch (error) {
        console.error("loadStats error:", error);
      }
    },

    urgencyLabel(level) {
      const map = {
        normal: "Bình thường",
        high: "Ưu tiên cao",
        critical: "Khẩn cấp",
      };

      return map[level] || level || "--";
    },

    urgencyClass(level) {
      const map = {
        normal: "bg-secondary",
        high: "bg-warning text-dark",
        critical: "bg-danger",
      };

      return map[level] || "bg-secondary";
    },

    statusLabel(status) {
      const map = {
        open: "Đang mở",
        fulfilled: "Đã đáp ứng",
        cancelled: "Đã huỷ",
        expired: "Hết hạn",
      };

      return map[status] || status || "--";
    },

    statusClass(status) {
      const map = {
        open: "bg-success",
        fulfilled: "bg-primary",
        cancelled: "bg-secondary",
        expired: "bg-dark",
      };

      return map[status] || "bg-secondary";
    },

    formatDate(value) {
      if (!value) return "--";

      return new Date(value).toLocaleString("vi-VN");
    },
  },
};
</script>

<style scoped>
.recommend-card {
  border: 1px solid #eee;
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 20px;
  transition: all 0.2s ease;
  background: #fff;
}

.recommend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.rank-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.score-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
}

.mini-badge {
  background: #f8f9fa;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
}

.mini-badge.success {
  background: #d1e7dd;
  color: #146c43;
}

.reason-item {
  background: #f8f9fa;
  border-radius: 14px;
  padding: 10px 14px;
}
</style>