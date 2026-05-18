<template>
  <div
    class="modal fade"
    id="locationPermissionModal"
    tabindex="-1"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title text-white">
            <i class="bi bi-geo-alt-fill me-2"></i>
            Cho phép cập nhật vị trí
          </h5>

          <button
            type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="modal"
          ></button>
        </div>

        <div class="modal-body">
          <p class="mb-2">
            Hệ thống có thể sử dụng vị trí hiện tại để ưu tiên đề xuất hiến máu khẩn cấp gần bạn.
          </p>

          <div class="alert alert-light border small mb-0">
            Vị trí chỉ dùng để tính khoảng cách đến điểm tiếp nhận máu.
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="btn btn-secondary"
            data-bs-dismiss="modal"
            :disabled="loading"
          >
            Để sau
          </button>

          <button
            class="btn btn-danger"
            @click="requestLocation"
            :disabled="loading"
          >
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-1"
            ></span>

            Cho phép
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";

export default {
  name: "LocationPermission",

  data() {
    return {
      modalInstance: null,
      loading: false,
    };
  },

  mounted() {
    this.initModal();
    this.checkShouldAskLocation();
  },

  methods: {
    initModal() {
      this.$nextTick(() => {
        const modalEl = this.$refs.modalRef;

        if (window.bootstrap && modalEl) {
          this.modalInstance = new window.bootstrap.Modal(modalEl);
        }
      });
    },

    checkShouldAskLocation() {
      const token = localStorage.getItem("token_donor");

      if (!token) return;

      const lastLocationAt = localStorage.getItem(
        "donor_location_at"
      );

      // hỏi lại sau 7 ngày
      if (lastLocationAt) {
        const diff =
          Date.now() -
          new Date(lastLocationAt).getTime();

        const days = diff / (1000 * 60 * 60 * 24);

        if (days < 7) return;
      }

      setTimeout(() => {
        this.modalInstance?.show();
      }, 1200);
    },

    requestLocation() {
      if (!navigator.geolocation) {
        this.$toast.error(
          "Trình duyệt không hỗ trợ GPS!"
        );
        return;
      }

      this.loading = true;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude =
              position.coords.latitude;

            const longitude =
              position.coords.longitude;

            const res =
              await baseRequestClient.put(
                "/donor/location",
                {
                  latitude,
                  longitude,
                }
              );

            if (res.data?.status) {
              localStorage.setItem(
                "donor_location_at",
                new Date().toISOString()
              );

              localStorage.setItem(
                "donor_last_lat",
                latitude
              );

              localStorage.setItem(
                "donor_last_lng",
                longitude
              );

              this.$toast.success(
                "Đã cập nhật vị trí!"
              );

              this.modalInstance?.hide();
            } else {
              this.$toast.error(
                res.data?.message ||
                  "Không thể cập nhật vị trí!"
              );
            }
          } catch (error) {
            this.$toast.error(
              error?.response?.data?.message ||
                "Không thể cập nhật vị trí!"
            );
          } finally {
            this.loading = false;
          }
        },
        () => {
          this.loading = false;

          this.$toast.error(
            "Bạn chưa cho phép truy cập vị trí!"
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000,
        }
      );
    },
  },
};
</script>

<style scoped>
/* giữ bootstrap mặc định */
</style>