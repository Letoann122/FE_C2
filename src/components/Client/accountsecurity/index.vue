<template>
  <div class="container-fluid bg-body-tertiary py-5">
    <div class="row justify-content-center g-4">
      <div class="col-md-3 col-lg-2">
        <div class="card border-0 shadow-sm rounded-4 p-2">
          <div class="list-group list-group-flush">
            <router-link to="/profile" class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold">
              <i class="bi bi-person-fill me-2"></i> Hồ sơ cá nhân
            </router-link>
            <router-link to="/blood-donation-history" class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold">
              <i class="bi bi-arrow-counterclockwise me-2"></i> Lịch sử hiến máu
            </router-link>
            <router-link to="/account-security" class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold">
              <i class="bi bi-shield-lock-fill me-2"></i> Bảo mật tài khoản
            </router-link>
          </div>
        </div>
      </div>
      <div class="col-md-8 col-lg-9">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <h4 class="fw-bold mb-1">
              <i class="bi bi-shield-lock-fill text-danger me-2"></i>Đổi mật khẩu
            </h4>
            <p class="text-muted mb-4">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label class="form-label">Mật khẩu hiện tại</label>
                <input type="password" v-model="passwords.current_password" class="form-control"
                  placeholder="Nhập mật khẩu hiện tại" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Mật khẩu mới</label>
                <input type="password" v-model="passwords.new_password" class="form-control"
                  placeholder="Nhập mật khẩu mới" required />
              </div>
              <div class="mb-4">
                <label class="form-label">Xác nhận mật khẩu mới</label>
                <input type="password" v-model="passwords.confirm_password" class="form-control"
                  placeholder="Nhập lại mật khẩu mới" required />
              </div>
              <div class="text-end">
                <button type="submit" class="btn btn-danger">
                  Lưu thay đổi
                </button>
                <button type="button" class="btn btn-secondary ms-2" @click="resetForm">
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";

export default {
  name: "AccountSecurity",
  data() {
    return {
      passwords: {
        current_password: "",
        new_password: "",
        confirm_password: "",
      },
    };
  },
  methods: {
    async changePassword() {
      if (!this.passwords.current_password || !this.passwords.new_password) {
        this.$toast.error("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      if (this.passwords.new_password !== this.passwords.confirm_password) {
        this.$toast.error("Mật khẩu xác nhận không khớp!");
        return;
      }

      try {
        const res = await baseRequestClient.put("/donor/change-password", this.passwords);
        if (res.data.status) {
          this.$toast.success(res.data.message || "Đổi mật khẩu thành công!");
          this.resetForm();
        } else {
          this.$toast.error(res.data.message || "Không thể đổi mật khẩu!");
        }
      } catch (err) {
        this.$toast.error(err.response?.data?.message || "Lỗi khi đổi mật khẩu!");
      }
    },
    resetForm() {
      this.passwords = {
        current_password: "",
        new_password: "",
        confirm_password: "",
      };
    },
  },
};
</script>

<style scoped>
.list-group-item.active {
  background-color: #ffecec !important;
  color: #dc3545 !important;
}
.list-group-item:hover {
  background-color: #fff0f0 !important;
}
.form-check-input {
  width: 2em;
  height: 1em;
}
.table td,
.table th {
  vertical-align: middle;
}
.badge {
  font-size: 0.8rem;
  border-radius: 6px;
  padding: 4px 8px;
}
</style>
