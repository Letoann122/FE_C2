<template>
  <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
    <div class="row align-items-center shadow rounded overflow-hidden bg-white">
      <div class="col-md-6 d-flex flex-column align-items-center justify-content-center text-center p-5"
        style="background-color: #fdf2f2">
        <img src="../../../assets/img/traitim.png" alt="Blood Donation" class="img-fluid mb-4"
          style="max-width: 500px" />
        <h3 class="fw-bold text-danger">Smart Blood Donation System</h3>
        <p class="text-muted">
          Kết nối những trái tim nhân ái, cứu sống những cuộc đời.
        </p>
      </div>
      <div class="col-md-6 bg-white p-5">
        <div class="text-center mb-4">
          <i class="bi bi-heart-fill text-danger fs-2"></i>
          <h4 class="fw-bold mt-2">Đăng nhập</h4>
          <p class="text-muted">Chào mừng bạn trở lại với SBDS</p>
        </div>
        <form @submit.prevent="handleLogin" novalidate>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="user.email" type="email" class="form-control" placeholder="Nhập email của bạn" />
          </div>
          <div class="mb-3">
            <label class="form-label">Mật khẩu</label>
            <input v-model="user.password" :type="showPassword ? 'text' : 'password'" class="form-control"
              placeholder="Nhập mật khẩu" />
          </div>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <input type="checkbox" v-model="showPassword" id="showPassword" />
              <label for="showPassword" class="ms-1">Hiện mật khẩu</label>
            </div>
            <router-link to="/forgot-password" class="text-danger small">
              Quên mật khẩu?
            </router-link>
          </div>
          <button type="submit" class="btn btn-danger w-100 mb-3">
            <i class="bi bi-box-arrow-in-right"></i> Đăng nhập
          </button>
        </form>
        <div class="text-center mt-4">
          <p class="small">
            Chưa có tài khoản?
            <router-link to="/register" class="text-danger fw-bold">
              Đăng ký ngay
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";

export default {
  name: "LoginClient",
  data() {
    return {
      user: {
        email: "",
        password: "",
      },
      showPassword: false,
    };
  },
  methods: {
    async handleLogin() {
      if (!this.user.email || !this.user.password) {
        this.$toast.error("Vui lòng nhập đầy đủ email và mật khẩu!");
        return;
      }
      if (!this.user.email.includes("@")) {
        this.$toast.error("Địa chỉ email không hợp lệ!");
        return;
      }
      try {
        const res = await baseRequestClient.post("/login", this.user);

        if (res.data.status) {
          const { role, token } = res.data.data;
          this.$toast.success(res.data.message || "Đăng nhập thành công!");
          localStorage.setItem("user", JSON.stringify(res.data.data));
          if (role === "admin") {
            localStorage.setItem("token_admin", token);
            this.$router.push("/admin/dashboard");
          } else if (role === "doctor") {
            localStorage.setItem("token_doctor", token);
            this.$router.push("/Hospital/dashboard");
          } else {
            localStorage.setItem("token_donor", token);
            this.$router.push("/home-page");
          }
        } else {
          this.$toast.error(res.data.message || "Đăng nhập thất bại!");
        }
      } catch (err) {
        const message =
          err.response?.data?.message ||
          (Array.isArray(err.response?.data?.errors)
            ? err.response.data.errors.join(", ")
            : "Đăng nhập thất bại, vui lòng thử lại!");
        this.$toast.error(message);
      }
    },
  },
};
</script>


<style scoped>
input.form-control {
  padding: 10px;
}

button.btn-danger {
  font-weight: 600;
  transition: all 0.3s ease;
}

button.btn-danger:hover {
  transform: translateY(-1px);
  background-color: #b02a37;
}

a.text-danger:hover {
  text-decoration: underline;
}
</style>
