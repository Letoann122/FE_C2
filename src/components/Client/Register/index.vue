<template>
  <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="row shadow rounded overflow-hidden bg-white" style="max-width: 1100px; width: 100%">
      <div class="col-md-6 p-5 d-flex flex-column justify-content-center position-relative">
        <div v-if="loading" class="loading-overlay">
          <div class="spinner-border text-danger" role="status"><span class="visually-hidden">Loading...</span></div>
        </div>

        <h4 class="fw-bold text-center mb-3 text-danger">
          <i class="bi bi-heart-fill me-2"></i> Đăng ký tài khoản
        </h4>
        <p class="text-center">Tham gia hệ thống hiến máu cứu người</p>

        <form @submit.prevent="submitForm" :class="{ 'opacity-50': loading }">
          <div class="row g-3">
            <div class="col-lg-6">
              <label>Họ và tên <span class="text-danger">*</span></label>
              <input v-model="form.full_name" type="text" class="form-control" placeholder="Nhập họ và tên" />
            </div>

            <div class="col-lg-6">
              <label>Ngày sinh <span class="text-danger">*</span></label>
              <input v-model="form.birthday" type="date" class="form-control" />
            </div>

            <div class="col-lg-6">
              <label>Giới tính <span class="text-danger">*</span></label>
              <select v-model="form.gender" class="form-select" required>
                <option value="" disabled>Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div class="col-lg-6">
              <label>Số điện thoại <span class="text-danger">*</span></label>
              <input v-model="form.phone" type="text" class="form-control" placeholder="0123456789" />
            </div>

            <div class="col-6">
              <label>Email <span class="text-danger">*</span></label>
              <input v-model="form.email" type="email" class="form-control" placeholder="example@gmail.com" />
            </div>

            <div class="col-lg-6">
              <label>Bạn là <span class="text-danger">*</span></label>
              <select v-model="form.role" class="form-select" required>
                <option disabled value="">Chọn vai trò</option>
                <option value="donor">Người hiến máu</option>
                <option value="doctor">Bác sĩ</option>
              </select>
            </div>

            <div class="col-12">
              <label>Địa chỉ <span class="text-danger">*</span></label>
              <input v-model="form.address" type="text" class="form-control" placeholder="Nhập địa chỉ của bạn" />
            </div>
            <template v-if="form.role === 'donor'">
              <div class="col-lg-12">
                <label>Tiền sử bệnh lý</label>
                <textarea v-model="form.medical_history" class="form-control" placeholder="Nếu có"></textarea>
              </div>

              <div class="col-lg-12">
                <label>Nhóm máu <span class="text-danger">*</span></label>
                <select v-model="form.blood_group" class="form-select" required>
                  <option value="" disabled>Chọn nhóm máu</option>
                  <option v-for="group in bloodGroups" :key="group" :value="group">{{ group }}</option>
                </select>
              </div>
            </template>
          </div>

          <!-- Password -->
          <div class="row g-3 mt-2">
            <div class="col-lg-6">
              <label>Mật khẩu <span class="text-danger">*</span></label>
              <input v-model="form.password" type="password" class="form-control" placeholder="Tối thiểu 6 ký tự" />
            </div>
            <div class="col-lg-6">
              <label>Xác nhận mật khẩu <span class="text-danger">*</span></label>
              <input v-model="form.password_confirmation" type="password" class="form-control" placeholder="Nhập lại mật khẩu" />
            </div>
          </div>

          <div class="text-end mt-4">
            <button type="submit" class="btn btn-danger" :disabled="loading">
              <span v-if="!loading">Đăng ký</span>
              <span v-else><span class="spinner-border spinner-border-sm me-2"></span> Đang đăng ký...</span>
            </button>
             <router-link to="/home-page" class="btn btn-secondary ms-2">
              Huỷ
            </router-link>
          </div>
        </form>

        <p class="text-center mt-3">
          Đã có tài khoản? <router-link to="/login" class="text-danger fw-bold">Đăng nhập ngay</router-link>
        </p>
      </div>

      <!-- Right side -->
      <div class="col-md-6 d-flex flex-column align-items-center justify-content-center text-center p-5 bg-danger bg-opacity-10">
        <h5 class="fw-bold mb-2 text-danger">Cùng nhau cứu sống</h5>
        <p>Mỗi giọt máu bạn hiến có thể cứu sống 3 người</p>
        <img src="https://static.vecteezy.com/system/resources/previews/008/190/897/non_2x/human-blood-donate-on-white-background-free-vector.jpg" class="img-fluid mb-4 rounded" style="max-width: 350px" />
        <div class="text-start">
          <p><i class="fa-solid fa-heart text-danger me-2"></i> Quy trình hiến máu an toàn</p>
          <p><i class="fa-solid fa-people-group text-danger me-2"></i> Cộng đồng hiến máu tích cực</p>
          <p><i class="fa-solid fa-hospital text-danger me-2"></i> Kết nối với bệnh viện</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
export default {
  name: "RegisterForm",
  data() {
    return {
      loading: false,
      bloodGroups: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      form: {
        full_name: "",
        birthday: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        blood_group: "",
        role: "",
        medical_history: "",
        password: "",
        password_confirmation: "",
      },
    };
  },
  methods: {
    resetForm() {
      if (this.loading) return;
      this.form = {
        full_name: "",
        birthday: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        blood_group: "",
        role: "",
        medical_history: "",
        password: "",
        password_confirmation: "",
      };
    },
    async submitForm() {
  this.loading = true;
  try {
    const res = await axios.post(`${API_BASE}/api/register`, this.form);
    if (res.data.status) {
      this.$toast?.success(res.data.message);
      this.resetForm();
    } else {
      if (Array.isArray(res.data.errors)) {
        res.data.errors.forEach(err => this.$toast?.error(err));
      } else {
        this.$toast?.error(res.data.message || "Đăng ký thất bại!");
      }
    }
  } catch (error) {
    const errData = error.response?.data;
    if (Array.isArray(errData?.errors)) {
      errData.errors.forEach(err => this.$toast?.error(err));
    } else {
      this.$toast?.error(errData?.message || "Có lỗi xảy ra!");
    }
  } finally {
    this.loading = false;
  }
}
  },
};
</script>