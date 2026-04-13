<template>
    <div class="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <div class="text-center mb-3">
            <i class="fa-solid fa-lock fa-2xl mb-3" style="color: #0d6efd;"></i>
            <h4 class="fw-bold">Thay đổi mật khẩu</h4>
            <p class="text-muted">Nhập mật khẩu mới để cập nhật tài khoản của bạn</p>
        </div>
        <div class="card shadow-sm p-4 rounded-4 w-100" style="max-width: 400px;">
            <form>
                <div class="mb-3">
                    <label for="password" class="form-label">Mật khẩu mới *</label>
                    <input v-model="form.password" id="password" type="password" class="form-control"
                        placeholder="Nhập mật khẩu mới" required />
                </div>
                <div class="mb-3">
                    <label for="password_confirmation" class="form-label">Xác nhận mật khẩu *</label>
                    <input v-model="form.password_confirmation" id="password_confirmation" type="password"
                        class="form-control" placeholder="Nhập lại mật khẩu" required />
                </div>
                <div class="d-grid mb-3">
                    <button type="button" class="btn btn-primary" @click="DoiMatKhau()">
                        <i class="bi bi-send-check me-2"></i> Cập nhật mật khẩu
                    </button>
                </div>
                <div class="text-center">
                    <router-link to="/login" class="text-muted small">
                        <i class="bx bx-arrow-back me-1"></i> Quay lại đăng nhập
                    </router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default {
  data() {
    return {
      form: {
        password: "",
        password_confirmation: "",
      },
      token: null,
    };
  },
  created() {
    const query = new URLSearchParams(window.location.search);
    this.token = query.get("token");
  },
  methods: {
    async DoiMatKhau() {
      if (this.form.password !== this.form.password_confirmation) {
        this.$toast.error("Mật khẩu xác nhận không khớp!");
        return;
      }
      if (!this.token) {
        this.$toast.error("Token không hợp lệ hoặc đã hết hạn!");
        return;
      }
      try {
        const res = await axios.post(`${API_BASE}/reset-password`, {
          token: this.token,
          password: this.form.password,
          password_confirmation: this.form.password_confirmation,
        });

        if (res.data.status) {
          this.$toast.success("Đổi mật khẩu thành công! Mời bạn đăng nhập lại.");
          this.$router.push("/login");
        } else {
          this.$toast.error(res.data.message || "Có lỗi xảy ra!");
        }
      } catch (err) {
        console.error("Change password error:", err);
        this.$toast.error("Lỗi server khi đổi mật khẩu!");
      }
    },
  },
};
</script>


<style></style>
