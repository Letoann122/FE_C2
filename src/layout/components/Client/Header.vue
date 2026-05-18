<template>
  <div class="top-wrapper">
    <nav ref="nav" class="navbar navbar-expand-lg bg-white" :class="{ 'fixed-top shadow-sm': isSticky }">
      <div class="container-fluid">
        <router-link class="navbar-brand fw-bold ms-3" to="/home-page">
          <i class="fa-solid fa-heart text-danger"></i>
          Smart Blood Donation
        </router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <!-- MENU -->
          <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
            <li class="nav-item mx-2">
              <router-link class="nav-link" to="/home-page" exact-active-class="active">
                Trang chủ
              </router-link>
            </li>

            <li class="nav-item mx-2">
              <router-link class="nav-link" to="/about" exact-active-class="active">
                Giới thiệu
              </router-link>
            </li>

            <li class="nav-item mx-2">
              <router-link class="nav-link" to="/news" exact-active-class="active">
                Tin tức
              </router-link>
            </li>

            <li class="nav-item mx-2">
              <router-link class="nav-link" to="/guide-health" exact-active-class="active">
                Hướng dẫn sức khoẻ
              </router-link>
            </li>

            <li class="nav-item mx-2">
              <router-link class="nav-link" to="/contact" exact-active-class="active">
                Liên hệ
              </router-link>
            </li>

            <li v-if="isLoggedIn" class="nav-item mx-2">
              <router-link class="nav-link" to="/register-blooddonation" exact-active-class="active">
                Đặt lịch
              </router-link>
            </li>

            <li v-if="isLoggedIn" class="nav-item mx-2">
              <router-link class="nav-link" to="/find-nearby" exact-active-class="active">
                Tìm điểm hiến
              </router-link>
            </li>
          </ul>

          <!-- RIGHT -->
          <div v-if="!isLoggedIn" class="d-flex">
            <router-link class="btn btn-outline-secondary me-2" to="/login">
              Đăng nhập
            </router-link>

            <router-link class="btn btn-danger" to="/register">
              Đăng ký
            </router-link>
          </div>

          <div v-if="isLoggedIn" class="me-3 position-relative">
            <router-link to="/notification" class="text-decoration-none text-dark position-relative" @click="
              unreadNotificationCount = 0
              ">
              <i class="bi bi-bell fs-5"></i>

              <span v-if="unreadNotificationCount > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{
                  unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount
                }}
              </span>
            </router-link>
          </div>

          <div v-if="isLoggedIn" class="dropdown">
            <a class="d-flex align-items-center text-decoration-none dropdown-toggle text-secondary fw-semibold"
              href="#" data-bs-toggle="dropdown" :class="{ active: isAccountActive }" @click.prevent>
              Xin chào,
              {{ user.full_name || "Donor" }}
            </a>

            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" to="/my-appointments">
                  Lịch hẹn của tôi
                </router-link>
              </li>

              <li>
                <router-link class="dropdown-item" to="/blood-donation-history">
                  Lịch sử hiến máu
                </router-link>
              </li>

              <li>
                <router-link class="dropdown-item" to="/notification">
                  Thông báo
                </router-link>
              </li>

              <li>
                <hr class="dropdown-divider" />
              </li>

              <li>
                <router-link class="dropdown-item" to="/profile">
                  Hồ sơ cá nhân
                </router-link>
              </li>

              <li>
                <router-link class="dropdown-item" to="/account-security">
                  Bảo mật tài khoản
                </router-link>
              </li>

              <li>
                <hr class="dropdown-divider" />
              </li>

              <li>
                <a class="dropdown-item text-danger" @click="logout">
                  Đăng xuất
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>

    <div v-show="isSticky" :style="{ height: navHeight + 'px' }"></div>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";
import socket from "../../../core/socket";

export default {
  name: "TopSBD",

  data() {
    return {
      isLoggedIn: false,

      user: {},

      unreadNotificationCount: 0,

      isSticky: false,
      navHeight: 0,
      stickyOffset: 10,
    };
  },

  computed: {
    isAccountActive() {
      return [
        "/my-appointments",
        "/blood-donation-history",
        "/notification",
        "/profile",
        "/account-security",
      ].some((path) =>
        this.$route.path.startsWith(path)
      );
    },
  },

  mounted() {
    this.loadCachedUser();

    this.checkLogin();

    this.loadUnreadNotificationCount();

    this.setupNotificationRealtime();

    this.handleSticky();

    window.addEventListener(
      "scroll",
      this.handleSticky
    );
  },

  unmounted() {
    window.removeEventListener(
      "scroll",
      this.handleSticky
    );
  },

  methods: {
    loadCachedUser() {
      const token =
        localStorage.getItem("token_donor");

      if (!token) return;

      const cachedName =
        localStorage.getItem("ho_ten") ||
        localStorage.getItem("full_name") ||
        "";

      this.isLoggedIn = true;

      this.user = {
        full_name: cachedName,
      };
    },

    async checkLogin() {
      const token =
        localStorage.getItem("token_donor");

      if (!token) return;

      try {
        const res =
          await baseRequestClient.get(
            "donor/check-token"
          );

        if (res.data.status) {
          this.isLoggedIn = true;

          this.user = {
            full_name:
              res.data.ho_ten ||
              this.user.full_name ||
              "Donor",
          };

          if (res.data.ho_ten) {
            localStorage.setItem(
              "ho_ten",
              res.data.ho_ten
            );
          }
        } else {
          this.clearDonorAuth();
        }
      } catch (error) {
        console.error(
          "checkLogin donor error:",
          error
        );

        this.clearDonorAuth();

        this.$toast.error(
          "Phiên đăng nhập đã hết hạn!"
        );

        this.$router.push("/login");
      }
    },

    async loadUnreadNotificationCount() {
      try {
        const res =
          await baseRequestClient.get(
            "/donor/notifications/unread-count"
          );

        if (res.data?.status) {
          this.unreadNotificationCount =
            res.data.data?.unread_count || 0;
        }
      } catch (error) {
        console.error(
          "loadUnreadNotificationCount error:",
          error
        );
      }
    },

    setupNotificationRealtime() {
      socket.off("new_user_notification");

      socket.on(
        "new_user_notification",
        ({ notification }) => {
          if (!notification) return;

          this.unreadNotificationCount += 1;

          this.$toast.success(
            notification.title ||
            "Thông báo mới"
          );
        }
      );
    },

    clearDonorAuth() {
      localStorage.removeItem("token_donor");

      localStorage.removeItem("ho_ten");

      localStorage.removeItem("full_name");

      this.isLoggedIn = false;

      this.user = {};
    },

    logout() {
      this.clearDonorAuth();

      this.$toast.success(
        "Đăng xuất thành công!"
      );

      this.$router.push("/home-page");
    },

    handleSticky() {
      const nav = this.$refs.nav;

      if (!nav) return;

      this.navHeight = nav.offsetHeight;

      this.isSticky =
        window.scrollY > this.stickyOffset;
    },
  },
};
</script>

<style scoped>
.navbar {
  transition:
    box-shadow 0.2s ease,
    padding 0.2s ease;
}

.nav-link {
  color: #6c757d;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.active {
  color: #dc3545 !important;
  font-weight: 700;
}

.dropdown>a.active {
  color: #dc3545 !important;
}

.dropdown-menu a:hover {
  background-color: #f8d7da;
  color: #842029;
}
</style>