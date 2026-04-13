<template>
  <div class="top-wrapper">
    <nav
      ref="nav"
      class="navbar navbar-expand-lg bg-white"
      :class="{ 'fixed-top shadow-sm': isSticky }"
    >
      <div class="container-fluid">
        <!-- BRAND -->
        <router-link class="navbar-brand fw-bold ms-3" to="/Hospital/dashboard">
          <i class="fa-solid fa-hospital text-danger"></i>
          Smart Blood Donation
        </router-link>

        <!-- Mobile Toggler -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <!-- NAV MENU -->
          <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
            <li class="nav-item mx-3">
              <router-link
                class="nav-link"
                to="/Hospital/dashboard"
                exact-active-class="active"
              >
                Dashboard
              </router-link>
            </li>

            <li class="nav-item mx-3">
              <router-link
                class="nav-link"
                to="/Hospital/blood-inventory"
                exact-active-class="active"
              >
                Quản lý kho máu
              </router-link>
            </li>

            <li class="nav-item mx-3">
              <router-link
                class="nav-link"
                to="/Hospital/donor-management"
                exact-active-class="active"
              >
                Quản lý Donor
              </router-link>
            </li>

            <li class="nav-item mx-3">
              <router-link
                class="nav-link"
                to="/Hospital/check-booking"
                exact-active-class="active"
              >
                Quản lý đặt lịch
              </router-link>
            </li>

            <li class="nav-item mx-3">
              <router-link
                class="nav-link"
                to="/Hospital/donation-complete"
                exact-active-class="active"
              >
                Ghi nhận hiến máu
              </router-link>
            </li>

            <!-- DROPDOWN: CHIẾN DỊCH -->
            <li class="nav-item dropdown mx-3">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                data-bs-toggle="dropdown"
                :class="{ active: isCampaignActive || isNewsActive }"
                @click.prevent
              >
                Chiến dịch
              </a>
              <ul class="dropdown-menu">
                <li>
                  <router-link class="dropdown-item" to="/Hospital/campaign-management">
                    Chiến dịch
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/Hospital/news">
                    Tin tức
                  </router-link>
                </li>
              </ul>
            </li>

            <li class="nav-item mx-3">
              <router-link
                class="nav-link"
                to="/Hospital/support"
                exact-active-class="active"
              >
                Tư vấn & Hỗ trợ
              </router-link>
            </li>

            <!-- ✅ DROPDOWN: BÁO CÁO -->
            <li class="nav-item dropdown mx-3">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                data-bs-toggle="dropdown"
                :class="{ active: isReportActive || isBloodLogActive }"
                @click.prevent
              >
                Báo cáo
              </a>

              <ul class="dropdown-menu">
                <li>
                  <router-link class="dropdown-item" to="/Hospital/report">
                    Báo cáo & Thống kê
                  </router-link>
                </li>

                <li><hr class="dropdown-divider" /></li>

                <li>
                  <router-link
                    class="dropdown-item"
                    to="/Hospital/blood-inventory/log"
                  >
                    Nhật ký kho máu
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>

          <!-- AUTH -->
          <div v-if="!isLoggedIn" class="d-flex">
            <router-link class="btn btn-outline-secondary me-2" to="/login">
              Đăng nhập
            </router-link>
          </div>

          <div v-else class="dropdown">
            <a
              class="d-flex align-items-center text-decoration-none dropdown-toggle text-secondary fw-semibold"
              href="#"
              data-bs-toggle="dropdown"
            >
              Xin chào, {{ user.full_name }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" to="/Hospital/profile">
                  Thông tin cá nhân
                </router-link>
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

    <!-- Spacer khi navbar fixed -->
    <div v-show="isSticky" :style="{ height: navHeight + 'px' }"></div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "HospitalHeader",

  data() {
    return {
      isLoggedIn: false,
      user: {},
      isSticky: false,
      navHeight: 0,
      stickyOffset: 10,
    };
  },

  computed: {
    isCampaignActive() {
      return this.$route.path.startsWith("/Hospital/campaign");
    },
    isNewsActive() {
      return this.$route.path.startsWith("/Hospital/news");
    },
    isReportActive() {
      return this.$route.path.startsWith("/Hospital/report");
    },
    isBloodLogActive() {
      return this.$route.path.startsWith("/Hospital/blood-inventory/log");
    },
  },

  mounted() {
    this.checkLoginDoctor();
    this.handleSticky();
    window.addEventListener("scroll", this.handleSticky);
  },

  unmounted() {
    window.removeEventListener("scroll", this.handleSticky);
  },

  methods: {
    async checkLoginDoctor() {
      const token = localStorage.getItem("token_doctor");
      if (!token) return;

      try {
        const res = await baseRequestDoctor.get("doctor/check-token");
        if (res.data.status) {
          this.isLoggedIn = true;
          this.user = { full_name: res.data.ho_ten };
        } else {
          localStorage.removeItem("token_doctor");
          this.isLoggedIn = false;
        }
      } catch {
        localStorage.removeItem("token_doctor");
        this.isLoggedIn = false;
        this.$toast.error("Phiên đăng nhập đã hết hạn!");
        this.$router.push("/login");
      }
    },

    logout() {
      localStorage.removeItem("token_doctor");
      this.isLoggedIn = false;
      this.$toast.success("Đăng xuất thành công!");
      this.$router.push("/login");
    },

    handleSticky() {
      const nav = this.$refs.nav;
      if (!nav) return;
      this.navHeight = nav.offsetHeight;
      this.isSticky = window.scrollY > this.stickyOffset;
    },
  },
};
</script>

<style scoped>
.navbar {
  transition: box-shadow 0.2s ease;
}

.nav-link.active {
  color: #dc3545 !important;
  font-weight: bold;
}

.dropdown-menu a:hover {
  background-color: #f8d7da;
  color: #842029;
}
</style>
