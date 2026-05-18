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
          @click="mobileOpen = !mobileOpen"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div
          class="collapse navbar-collapse"
          :class="{ show: mobileOpen }"
          id="navbarSupportedContent"
        >
          <!-- NAV MENU -->
          <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
            <li class="nav-item mx-2">
              <router-link
                class="nav-link"
                to="/Hospital/dashboard"
                exact-active-class="active"
                @click="closeAllMenus"
              >
                Dashboard
              </router-link>
            </li>

            <li class="nav-item mx-2">
              <router-link
                class="nav-link"
                to="/Hospital/emergency-ai"
                exact-active-class="active"
                @click="closeAllMenus"
              >
                AI Emergency
              </router-link>
            </li>

            <!-- Dropdown: Hiến máu -->
            <li class="nav-item dropdown mx-2" :class="{ show: openMenu === 'donation' }">
              <button
                type="button"
                class="nav-link dropdown-toggle btn btn-link nav-dropdown-btn"
                :class="{ active: isDonationFlowActive }"
                @click.stop="toggleMenu('donation')"
              >
                Hiến máu
              </button>

              <ul class="dropdown-menu" :class="{ show: openMenu === 'donation' }">
                <li>
                  <router-link class="dropdown-item" to="/Hospital/check-booking" @click="closeAllMenus">
                    Quản lý đặt lịch
                  </router-link>
                </li>

                <li>
                  <router-link class="dropdown-item" to="/Hospital/check-in-scanner" @click="closeAllMenus">
                    Quét mã check-in
                  </router-link>
                </li>

                <li>
                  <router-link class="dropdown-item" to="/Hospital/today-checked-in" @click="closeAllMenus">
                    Check-in hôm nay
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/Hospital/blood-testing" @click="closeAllMenus">
                    Kiểm định máu
                  </router-link>
                </li>
              </ul>
            </li>

            <!-- Dropdown: Kho máu -->
            <li class="nav-item dropdown mx-2" :class="{ show: openMenu === 'inventory' }">
              <button
                type="button"
                class="nav-link dropdown-toggle btn btn-link nav-dropdown-btn"
                :class="{ active: isInventoryActive }"
                @click.stop="toggleMenu('inventory')"
              >
                Kho máu
              </button>

              <ul class="dropdown-menu" :class="{ show: openMenu === 'inventory' }">
                <li>
                  <router-link class="dropdown-item" to="/Hospital/blood-inventory" @click="closeAllMenus">
                    Quản lý kho máu
                  </router-link>
                </li>

                <li>
                  <router-link class="dropdown-item" to="/Hospital/blood-inventory/log" @click="closeAllMenus">
                    Nhật ký kho máu
                  </router-link>
                </li>
              </ul>
            </li>

            <li class="nav-item mx-2">
              <router-link
                class="nav-link"
                to="/Hospital/donor-management"
                exact-active-class="active"
                @click="closeAllMenus"
              >
                Quản lý Donor
              </router-link>
            </li>

            <!-- Dropdown: Chiến dịch -->
            <li class="nav-item dropdown mx-2" :class="{ show: openMenu === 'campaign' }">
              <button
                type="button"
                class="nav-link dropdown-toggle btn btn-link nav-dropdown-btn"
                :class="{ active: isCampaignActive || isNewsActive }"
                @click.stop="toggleMenu('campaign')"
              >
                Chiến dịch
              </button>

              <ul class="dropdown-menu" :class="{ show: openMenu === 'campaign' }">
                <li>
                  <router-link class="dropdown-item" to="/Hospital/campaign-management" @click="closeAllMenus">
                    Quản lý chiến dịch
                  </router-link>
                </li>

                <li>
                  <router-link class="dropdown-item" to="/Hospital/news" @click="closeAllMenus">
                    Tin tức
                  </router-link>
                </li>
              </ul>
            </li>

            <!-- Dropdown: Hỗ trợ -->
            <li class="nav-item dropdown mx-2" :class="{ show: openMenu === 'support' }">
              <button
                type="button"
                class="nav-link dropdown-toggle btn btn-link nav-dropdown-btn"
                :class="{ active: isSupportActive }"
                @click.stop="toggleMenu('support')"
              >
                Hỗ trợ
              </button>

              <ul class="dropdown-menu" :class="{ show: openMenu === 'support' }">
                <li>
                  <router-link class="dropdown-item" to="/Hospital/support" @click="closeAllMenus">
                    Tư vấn & Hỗ trợ
                  </router-link>
                </li>

                <li>
                  <router-link class="dropdown-item" to="/Hospital/leaderboard" @click="closeAllMenus">
                    Bảng xếp hạng
                  </router-link>
                </li>
              </ul>
            </li>

            <!-- Dropdown: Báo cáo -->
            <li class="nav-item dropdown mx-2" :class="{ show: openMenu === 'report' }">
              <button
                type="button"
                class="nav-link dropdown-toggle btn btn-link nav-dropdown-btn"
                :class="{ active: isReportActive }"
                @click.stop="toggleMenu('report')"
              >
                Báo cáo
              </button>

              <ul class="dropdown-menu" :class="{ show: openMenu === 'report' }">
                <li>
                  <router-link class="dropdown-item" to="/Hospital/report" @click="closeAllMenus">
                    Báo cáo & Thống kê
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>

          <!-- AUTH -->
          <div v-if="!isLoggedIn" class="d-flex">
            <router-link class="btn btn-outline-secondary me-2" to="/login" @click="closeAllMenus">
              Đăng nhập
            </router-link>
          </div>

          <div v-else class="dropdown" :class="{ show: openMenu === 'user' }">
            <button
              type="button"
              class="d-flex align-items-center text-decoration-none dropdown-toggle text-secondary fw-semibold btn btn-link nav-dropdown-btn"
              @click.stop="toggleMenu('user')"
            >
              Xin chào, {{ user.full_name }}
            </button>

            <ul class="dropdown-menu dropdown-menu-end" :class="{ show: openMenu === 'user' }">
              <li>
                <router-link class="dropdown-item" to="/Hospital/profile" @click="closeAllMenus">
                  Thông tin cá nhân
                </router-link>
              </li>

              <li>
                <router-link class="dropdown-item" to="/Hospital/doi-mat-khau" @click="closeAllMenus">
                  Đổi mật khẩu
                </router-link>
              </li>

              <li><hr class="dropdown-divider" /></li>

              <li>
                <button type="button" class="dropdown-item text-danger" @click="logout">
                  Đăng xuất
                </button>
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
      openMenu: null,
      mobileOpen: false,
      lastStickyState: false,
    };
  },

  computed: {
    isDonationFlowActive() {
      return (
        this.$route.path.startsWith("/Hospital/check-booking") ||
        this.$route.path.startsWith("/Hospital/check-in-scanner") ||
        this.$route.path.startsWith("/Hospital/today-checked-in") ||
        this.$route.path.startsWith("/Hospital/donation-process") ||
        this.$route.path.startsWith("/Hospital/blood-testing")
      );
    },

    isInventoryActive() {
      return this.$route.path.startsWith("/Hospital/blood-inventory");
    },

    isCampaignActive() {
      return this.$route.path.startsWith("/Hospital/campaign");
    },

    isNewsActive() {
      return this.$route.path.startsWith("/Hospital/news");
    },

    isSupportActive() {
      return (
        this.$route.path.startsWith("/Hospital/support") ||
        this.$route.path.startsWith("/Hospital/leaderboard")
      );
    },

    isReportActive() {
      return this.$route.path.startsWith("/Hospital/report");
    },
  },

  watch: {
    "$route.path"() {
      this.closeAllMenus();
    },
  },

  mounted() {
    this.checkLoginDoctor();
    this.handleSticky();

    window.addEventListener("scroll", this.handleSticky, { passive: true });
    document.addEventListener("click", this.closeAllMenus);
  },

  unmounted() {
    window.removeEventListener("scroll", this.handleSticky);
    document.removeEventListener("click", this.closeAllMenus);
  },

  methods: {
    async checkLoginDoctor() {
      const token = localStorage.getItem("token_doctor");
      if (!token) return;

      try {
        const res = await baseRequestDoctor.get("doctor/check-token");

        if (res.data.status) {
          this.isLoggedIn = true;
          this.user = {
            full_name: res.data.ho_ten || res.data.full_name || "bác sĩ",
          };
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

    toggleMenu(menuName) {
      this.openMenu = this.openMenu === menuName ? null : menuName;
    },

    closeAllMenus() {
      this.openMenu = null;
    },

    logout() {
      localStorage.removeItem("token_doctor");
      this.isLoggedIn = false;
      this.closeAllMenus();
      this.$toast.success("Đăng xuất thành công!");
      this.$router.push("/login");
    },

    handleSticky() {
      const nav = this.$refs.nav;
      if (!nav) return;

      const nextSticky = window.scrollY > this.stickyOffset;

      if (nextSticky !== this.lastStickyState) {
        this.lastStickyState = nextSticky;
        this.isSticky = nextSticky;
        this.navHeight = nav.offsetHeight;
      }
    },
  },
};
</script>

<style scoped>
.navbar {
  transition: box-shadow 0.2s ease;
  z-index: 1030;
}

.nav-link.active {
  color: #dc3545 !important;
  font-weight: bold;
}

.nav-dropdown-btn {
  border: 0;
  background: transparent;
  padding: 0.5rem 0;
  color: inherit;
  box-shadow: none !important;
}

.nav-dropdown-btn:hover,
.nav-dropdown-btn:focus {
  color: #dc3545;
  text-decoration: none;
}

.dropdown-menu {
  margin-top: 0;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-menu a:hover,
.dropdown-menu button:hover {
  background-color: #f8d7da;
  color: #842029;
}

@media (min-width: 992px) {
  .navbar .dropdown-menu {
    position: absolute;
  }
}

@media (max-width: 991.98px) {
  .navbar-nav {
    padding-top: 12px;
  }

  .dropdown-menu {
    border: 0;
    box-shadow: none;
    padding-left: 12px;
  }

  .nav-dropdown-btn {
    width: 100%;
    text-align: left;
  }
}
</style>