<template>
  <div>
    <div class="modal fade" id="emergencyRequestModal" tabindex="-1" aria-labelledby="emergencyRequestModalLabel"
      aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title text-white" id="emergencyRequestModalLabel">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Yêu cầu hiến máu khẩn cấp
            </h5>

            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div v-if="currentRequest" class="modal-body">
            <div class="alert alert-danger">
              <div class="fw-bold fs-5">
                {{ currentRequest.request.title }}
              </div>

              <div>
                {{ currentRequest.request.message }}
              </div>
            </div>

            <table class="table table-bordered align-middle">
              <tbody>
                <tr>
                  <th width="40%">
                    Nhóm máu cần
                  </th>

                  <td>
                    <span class="badge bg-danger">
                      {{ currentRequest.request.blood_group }}
                    </span>
                  </td>
                </tr>

                <tr>
                  <th>
                    Lượng máu cần
                  </th>

                  <td>
                    {{ currentRequest.request.required_volume_ml }} ml
                  </td>
                </tr>

                <tr>
                  <th>
                    Mức độ
                  </th>

                  <td>
                    {{ urgencyLabel(currentRequest.request.urgency_level) }}
                  </td>
                </tr>

                <tr>
                  <th>
                    Cần trước
                  </th>

                  <td>
                    {{ formatDate(currentRequest.request.needed_before) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="mb-3">
              <div class="fw-bold mb-2">
                Lưu ý khi hỗ trợ:
              </div>

              <div class="border rounded p-3 bg-light small">
                <ul class="mb-0">
                  <li>
                    Vui lòng chỉ đồng ý nếu bạn có thể đến điểm tiếp nhận trong thời gian yêu cầu.
                  </li>

                  <li>
                    Bác sĩ sẽ ghi nhận phản hồi và tiếp tục hướng dẫn quy trình hiến máu.
                  </li>

                  <li>
                    Nếu hiện tại chưa sẵn sàng, bạn có thể chọn từ chối yêu cầu này.
                  </li>
                </ul>
              </div>
            </div>

            <div class="text-muted small">
              Nếu bạn đồng ý, bác sĩ sẽ thấy phản hồi và tiếp tục hướng dẫn hỗ trợ.
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="decline" :disabled="loading">
              <span v-if="loading && actionType === 'decline'" class="spinner-border spinner-border-sm me-1"></span>

              Từ chối
            </button>

            <button type="button" class="btn btn-danger" @click="accept" :disabled="loading">
              <span v-if="loading && actionType === 'accept'" class="spinner-border spinner-border-sm me-1"></span>

              Tôi có thể hỗ trợ
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
  name: "EmergencyRequestPopup",

  data() {
    return {
      currentRequest: null,
      loading: false,
      actionType: "",
      modalInstance: null,
    };
  },

  mounted() {
    this.initModal();
    this.setupSocket();
    this.loadPendingEmergency();
  },

  beforeUnmount() {
    socket.off(
      "emergency_request_received",
      this.handleEmergencyRequest
    );

    socket.off(
      "emergency_request_ping",
      this.handleEmergencyPing
    );

    socket.off("connect");

    if (this.modalInstance) {
      this.modalInstance.hide();
      this.modalInstance.dispose();
      this.modalInstance = null;
    }
  },

  methods: {
    initModal() {
      this.$nextTick(() => {
        const modalEl = this.$refs.modalRef;

        if (window.bootstrap && modalEl) {
          this.modalInstance = new window.bootstrap.Modal(modalEl, {
            backdrop: "static",
            keyboard: false,
          });
        }
      });
    },

    getCurrentDonorId() {
      const token = localStorage.getItem("token_donor");

      if (token && token.split(".").length === 3) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url
            .replace(/-/g, "+")
            .replace(/_/g, "/");

          const paddedBase64 =
            base64 + "=".repeat((4 - (base64.length % 4)) % 4);

          const jsonPayload = decodeURIComponent(
            atob(paddedBase64)
              .split("")
              .map((c) => {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );

          const payload = JSON.parse(jsonPayload);

          return (
            payload?.userId ||
            payload?.user_id ||
            payload?.id ||
            payload?.sub ||
            null
          );
        } catch (e) {
          console.error("Decode donor token error:", e);
        }
      }

      const userInfo = localStorage.getItem("user_info");

      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);

          return parsed?.userId || parsed?.user_id || parsed?.id || null;
        } catch (e) {
          console.error("Parse user_info error:", e);
        }
      }

      return null;
    },

    setupSocket() {
      const donorId = this.getCurrentDonorId();

      const joinRoom = () => {
        if (donorId) {
          socket.emit("join_user", donorId);
          socket.emit("join_donor", donorId);

          console.log(
            "Joined emergency donor room:",
            donorId
          );
        }
      };

      if (!socket.connected) {
        socket.connect();
      } else {
        joinRoom();
      }

      socket.off("connect", joinRoom);
      socket.on("connect", joinRoom);

      socket.off(
        "emergency_request_received",
        this.handleEmergencyRequest
      );

      socket.on(
        "emergency_request_received",
        this.handleEmergencyRequest
      );

      socket.off(
        "emergency_request_ping",
        this.handleEmergencyPing
      );

      socket.on(
        "emergency_request_ping",
        this.handleEmergencyPing
      );
    },

    handleEmergencyPing() {
      this.loadPendingEmergency();
    },

    handleEmergencyRequest(payload) {
      console.log(
        "Realtime emergency request received:",
        payload
      );

      if (!payload?.request) return;

      this.currentRequest = payload;

      this.$nextTick(() => {
        this.modalInstance?.show();
      });
    },

    async loadPendingEmergency() {
      try {
        const res = await baseRequestClient.get(
          "/donor/emergency-responses/pending"
        );

        const pendingList = res.data?.data || [];

        const first = pendingList.find((item) => {
          const request =
            item.EmergencyRequest ||
            item.emergency_request;

          const neededBefore = request?.needed_before
            ? new Date(request.needed_before)
            : null;

          const isExpired =
            neededBefore && neededBefore.getTime() < Date.now();

          return (
            item.response_status === "pending" &&
            request?.status === "open" &&
            !isExpired
          );
        });

        if (!first) {
          this.currentRequest = null;

          this.modalInstance?.hide();

          return;
        }

        this.currentRequest = {
          response_id: first.id,
          ai_score: first.ai_score,
          distance_km: first.distance_km,
          reason_summary: first.reason_summary,
          request:
            first.EmergencyRequest ||
            first.emergency_request,
        };

        this.$nextTick(() => {
          this.modalInstance?.show();
        });
      } catch (error) {
        console.error(
          "loadPendingEmergency error:",
          error
        );
      }
    },

    async accept() {
      if (!this.currentRequest?.response_id) return;

      this.loading = true;
      this.actionType = "accept";

      try {
        const res = await baseRequestClient.post(
          "/donor/emergency-responses/accept",
          {
            response_id:
              this.currentRequest.response_id,
          }
        );

        if (res.data?.status) {
          this.$toast.success(
            res.data.message ||
            "Bạn đã đồng ý hỗ trợ!"
          );

          this.currentRequest = null;

          this.modalInstance?.hide();

          setTimeout(() => {
            this.loadPendingEmergency();
          }, 300);
        } else {
          this.$toast.error(
            res.data?.message ||
            "Không thể xác nhận hỗ trợ!"
          );
        }
      } catch (error) {
        console.error("accept error:", error);

        this.$toast.error(
          error?.response?.data?.message ||
          "Không thể xác nhận hỗ trợ!"
        );
      } finally {
        this.loading = false;
        this.actionType = "";
      }
    },

    async decline() {
      if (!this.currentRequest?.response_id) return;

      this.loading = true;
      this.actionType = "decline";

      try {
        const res = await baseRequestClient.post(
          "/donor/emergency-responses/decline",
          {
            response_id:
              this.currentRequest.response_id,
          }
        );

        if (res.data?.status) {
          this.$toast.success(
            res.data.message ||
            "Bạn đã từ chối yêu cầu!"
          );

          this.currentRequest = null;

          this.modalInstance?.hide();

          setTimeout(() => {
            this.loadPendingEmergency();
          }, 300);
        } else {
          this.$toast.error(
            res.data?.message ||
            "Không thể từ chối yêu cầu!"
          );
        }
      } catch (error) {
        console.error("decline error:", error);

        this.$toast.error(
          error?.response?.data?.message ||
          "Không thể từ chối yêu cầu!"
        );
      } finally {
        this.loading = false;
        this.actionType = "";
      }
    },

    urgencyLabel(level) {
      const map = {
        normal: "Bình thường",
        high: "Ưu tiên cao",
        critical: "Khẩn cấp",
      };

      return map[level] || level;
    },

    formatDate(value) {
      if (!value) return "--";

      return new Date(value).toLocaleString("vi-VN");
    },
  },
};
</script>

<style scoped>
/* Giữ style bootstrap đơn giản */
</style>