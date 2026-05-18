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
            @click="skipLocation"
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
            :disabled="loading"
            @click="skipLocation"
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
  },

  methods: {
    initModal() {
      this.$nextTick(() => {
        const modalEl = this.$refs.modalRef;

        if (!window.bootstrap || !modalEl) {
          console.warn("Bootstrap modal chưa sẵn sàng.");
          return;
        }

        this.modalInstance = new window.bootstrap.Modal(modalEl, {
          backdrop: "static",
          keyboard: false,
        });

        this.checkShouldAskLocation();
      });
    },

    checkShouldAskLocation() {
      const token = localStorage.getItem("token_donor");

      if (!token) return;

      const lastLocationAt = localStorage.getItem("donor_location_at");
      const skipAt = localStorage.getItem("donor_location_skip_at");

      // Nếu đã cập nhật vị trí trong 7 ngày thì không hỏi lại
      if (this.isWithinDays(lastLocationAt, 7)) return;

      // Nếu user bấm "Để sau" hoặc từ chối gần đây thì 1 ngày sau mới hỏi lại
      if (this.isWithinDays(skipAt, 1)) return;

      setTimeout(() => {
        this.modalInstance?.show();
      }, 1200);
    },

    isWithinDays(value, maxDays) {
      if (!value) return false;

      const time = new Date(value).getTime();

      if (Number.isNaN(time)) return false;

      const diff = Date.now() - time;
      const days = diff / (1000 * 60 * 60 * 24);

      return days < maxDays;
    },

    skipLocation() {
      localStorage.setItem("donor_location_skip_at", new Date().toISOString());
      this.modalInstance?.hide();
    },

    requestLocation() {
      if (!navigator.geolocation) {
        this.$toast.error("Trình duyệt không hỗ trợ GPS!");
        return;
      }

      this.loading = true;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const res = await baseRequestClient.put("/donor/location", {
              latitude,
              longitude,
            });

            if (res.data?.status) {
              localStorage.setItem("donor_location_at", new Date().toISOString());
              localStorage.removeItem("donor_location_skip_at");

              localStorage.setItem("donor_last_lat", String(latitude));
              localStorage.setItem("donor_last_lng", String(longitude));

              this.$toast.success("Đã cập nhật vị trí!");

              this.modalInstance?.hide();
            } else {
              this.$toast.error(
                res.data?.message || "Không thể cập nhật vị trí!"
              );
            }
          } catch (error) {
            console.error("Update donor location error:", error);

            this.$toast.error(
              error?.response?.data?.message || "Không thể cập nhật vị trí!"
            );
          } finally {
            this.loading = false;
          }
        },
        (error) => {
          this.loading = false;
          localStorage.setItem("donor_location_skip_at", new Date().toISOString());

          if (error.code === error.PERMISSION_DENIED) {
            this.$toast.error("Bạn chưa cho phép truy cập vị trí!");
            return;
          }

          if (error.code === error.POSITION_UNAVAILABLE) {
            this.$toast.error("Không lấy được vị trí hiện tại!");
            return;
          }

          if (error.code === error.TIMEOUT) {
            this.$toast.error("Lấy vị trí quá thời gian chờ!");
            return;
          }

          this.$toast.error("Lỗi khi lấy vị trí GPS!");
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