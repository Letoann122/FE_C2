<template>
  <div class="top-wrapper">
    <nav ref="nav" class="navbar navbar-expand-lg bg-white" :class="{ 'fixed-top shadow-sm': isSticky }">
      <div class="container-fluid">
        <router-link class="navbar-brand fw-bold ms-3" to="/home-page">
          <i class="fa-solid fa-heart text-danger"></i> Smart Blood Donation
        </router-link>

        <!-- toggler mobile -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
            <li class="nav-item mx-3">
              <router-link class="nav-link" to="/home-page" exact-active-class="active">Trang chủ</router-link>
            </li>
            <li class="nav-item mx-3">
              <router-link class="nav-link" to="/about" exact-active-class="active">Giới thiệu</router-link>
            </li>
            <li class="nav-item mx-3">
              <router-link class="nav-link" to="/register-blooddonation" exact-active-class="active">Đặt
                lịch</router-link>
            </li>
            <li class="nav-item mx-3">
              <router-link class="nav-link" to="/news" exact-active-class="active">Tin tức & chiến dịch</router-link>
            </li>
            <li class="nav-item mx-3">
              <router-link class="nav-link" to="/guide-health" exact-active-class="active">Hướng dẫn sức khoẻ</router-link>
            </li>
            <li class="nav-item mx-3">
              <router-link class="nav-link" to="/contact" exact-active-class="active">Liên hệ</router-link>
            </li>
          </ul>
          <div v-if="!isLoggedIn" class="d-flex">
            <router-link class="btn btn-outline-secondary me-2" to="/login">Đăng nhập</router-link>
            <router-link class="btn btn-danger" to="/register">Đăng ký</router-link>
          </div>
          <div v-else class="dropdown">
            <a class="d-flex align-items-center text-decoration-none dropdown-toggle text-secondary fw-semibold"
              href="#" data-bs-toggle="dropdown">
              Xin chào, {{ user.full_name }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" to="/profile">Hồ sơ cá nhân</router-link>
              </li>
              <li>
                <a class="dropdown-item text-danger" @click="logout">Đăng xuất</a>
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
import baseRequestDonor from "../../../core/baseRequestClient";
import { createToaster } from "@meforma/vue-toaster";

const toast = createToaster({ position: "top-right", duration: 3000 });

export default {
  name: "TopSBD",
  data() {
    return {
      isLoggedIn: false,
      user: {},
      isSticky: false,
      navHeight: 0,
      stickyOffset: 10,
    };
  },
  mounted() {
    this.checkLogin();
    this.handleSticky();
    window.addEventListener("scroll", this.handleSticky);
  },
  unmounted() {
    window.removeEventListener("scroll", this.handleSticky);
  },
  methods: {
    async checkLogin() {
      const token = localStorage.getItem("token_donor");
      if (!token) return;

      try {
        const res = await baseRequestDonor.get("donor/check-token");
        if (res.data.status) {
          this.isLoggedIn = true;
          this.user = { full_name: res.data.ho_ten };
        } else {
          localStorage.removeItem("token_donor");
          this.isLoggedIn = false;
        }
      } catch {
        localStorage.removeItem("token_donor");
        this.isLoggedIn = false;
        toast.error("Phiên đăng nhập đã hết hạn!");
        this.$router.push("/login");
      }
    },

    logout() {
      localStorage.removeItem("token_donor");
      this.isLoggedIn = false;
      toast.success("Đăng xuất thành công!");
      this.$router.push("/home-page");
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
  transition: box-shadow 0.2s ease, padding 0.2s ease;
}
</style>
