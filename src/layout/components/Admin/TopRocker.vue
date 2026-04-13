<template>
  <header>
    <div class="topbar d-flex align-items-center">
      <nav class="navbar navbar-expand">
        <div class="topbar-logo-header">
          <h4 class="logo-text text-danger">Admin</h4>
        </div>
        <div class="ms-auto user-box dropdown">
          <a class="d-flex align-items-center nav-link dropdown-toggle dropdown-toggle-nocaret" href="#"
            data-bs-toggle="dropdown">
            <div class="user-info ps-3">
              <p class="user-name mb-0">
                {{ user.full_name || "Đang tải..." }}
              </p>
            </div>
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item text-danger" @click="logout"><i class="fa-solid fa-right-from-bracket"></i> Đăng
                xuất</a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
import baseRequestAdmin from "../../../core/baseRequestAdmin";
import { createToaster } from "@meforma/vue-toaster";
const toast = createToaster({ position: "top-right" });

export default {
  name: "TopRocker",
  data() {
    return { user: {} };
  },
  mounted() {
    this.checkTokenAdmin();
  },
  methods: {
    async checkTokenAdmin() {
      try {
        const res = await baseRequestAdmin.get("admin/check-token");
        if (res.data.status) {
          this.user = { full_name: res.data.ho_ten };
        } else {
          toast.error(res.data.message);
          this.$router.push("/login");
        }
      } catch (err) {
        toast.error("Phiên đăng nhập đã hết hạn!");
        localStorage.removeItem("token_admin");
        this.$router.push("/login");
      }
    },
    async logout() {
      localStorage.removeItem("token_admin");
      toast.success("Đăng xuất thành công!");
      this.$router.push("/login");
    },
  },
};
</script>
