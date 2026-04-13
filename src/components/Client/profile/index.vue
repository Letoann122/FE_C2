<template>
  <div class="container-fluid bg-body-tertiary py-5">
    <div class="row justify-content-center g-4">
      <div class="col-md-3 col-lg-2">
        <div class="card border-0 shadow-sm rounded-4 p-2">
          <div class="list-group list-group-flush">
            <router-link
              to="/profile"
              class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold"
            >
              <i class="bi bi-person-fill me-2"></i> Hồ sơ cá nhân
            </router-link>

            <router-link
              to="/blood-donation-history"
              class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold"
            >
              <i class="bi bi-arrow-counterclockwise me-2"></i> Lịch sử hiến máu
            </router-link>

            <router-link
              to="/account-security"
              class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold"
            >
              <i class="bi bi-shield-lock-fill me-2"></i> Bảo mật tài khoản
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-md-9 col-lg-9">
        <div class="card shadow-sm border-0">
          <div class="card-body">
            <h4 class="fw-bold mb-1">
              <i class="fa-solid fa-user me-2" style="color: #ff0000"></i>
              Hồ sơ cá nhân
            </h4>
            <p class="text-muted mb-3">Cập nhật thông tin cá nhân của bạn</p>

            <hr class="border border-1 border-light-subtle my-3" />

            <div class="row">
              <!-- CHO SỬA họ tên -->
              <div class="col-lg-6">
                <label class="mb-2">Họ và tên</label>
                <input
                  v-model="profile.full_name"
                  type="text"
                  class="form-control"
                />
              </div>

              <!-- CHO SỬA ngày sinh -->
              <div class="col-lg-6">
                <label class="mb-2">Ngày sinh</label>
                <input
                  v-model="profile.birthday"
                  type="date"
                  class="form-control"
                />
              </div>

              <div class="col-lg-12">
                <label class="mt-3 mb-2">Địa chỉ</label>
                <textarea
                  v-model="profile.address"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>

              <!-- CHỈ KHOÁ NHÓM MÁU -->
              <div class="col-md-6">
                <label class="form-label mt-3 mb-2">Nhóm máu *</label>
                <select
                  v-model="profile.blood_group"
                  class="form-select"
                  disabled
                >
                  <option value="">Chọn nhóm máu</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                <div class="form-text">
                  Nhóm máu được cập nhật theo kết quả xét nghiệm tại điểm hiến,
                  bạn không thể tự chỉnh sửa.
                </div>
              </div>

              <div class="col-lg-6">
                <label class="mt-3 mb-2">Số điện thoại</label>
                <input
                  v-model="profile.phone"
                  type="text"
                  class="form-control"
                />
              </div>

              <div class="col-lg-12">
                <label class="mt-3 mb-2">Tiền sử y tế</label>
                <textarea
                  v-model="profile.medical_history"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div class="group-input text-end mt-5">
                <button class="btn btn-danger" type="button" @click="updateProfile">
                  Lưu thay đổi
                </button>
                <button class="btn btn-secondary ms-2" type="button" @click="loadProfile">
                  Huỷ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";

export default {
  name: "ProfileClient",
  data() {
    return {
      profile: {
        full_name: "",
        birthday: "",
        gender: "",
        phone: "",
        address: "",
        blood_group: "",
        medical_history: "",
      },
    };
  },
  mounted() {
    this.loadProfile();
  },
  methods: {
    async loadProfile() {
      try {
        const res = await baseRequestClient.get("/donor/profile");
        if (res.data.status) {
          this.profile = res.data.data;
        } else {
          this.$toast?.error(res.data.message || "Không thể tải hồ sơ!");
        }
      } catch (err) {
        this.$toast?.error("Không thể tải thông tin hồ sơ!");
      }
    },

    async updateProfile() {
      try {
        // Validate theo BE: full_name, birthday, phone
        if (!this.profile.full_name || !this.profile.full_name.trim()) {
          this.$toast?.error("Họ và tên không được để trống!");
          return;
        }
        if (!this.profile.birthday) {
          this.$toast?.error("Ngày sinh không được để trống!");
          return;
        }
        if (!this.profile.phone) {
          this.$toast?.error("Vui lòng điền số điện thoại!");
          return;
        }

        // Không gửi blood_group (đã khóa)
        const payload = {
          full_name: this.profile.full_name,
          birthday: this.profile.birthday,
          gender: this.profile.gender,
          phone: this.profile.phone,
          address: this.profile.address,
          medical_history: this.profile.medical_history,
        };

        const res = await baseRequestClient.put("/donor/profile", payload);

        if (res.data.status) {
          this.$toast?.success(res.data.message || "Cập nhật hồ sơ thành công!");
          this.loadProfile();
        } else {
          this.$toast?.error(res.data.message || "Không thể cập nhật hồ sơ!");
        }
      } catch (err) {
        if (err.response?.data?.errors) {
          Object.values(err.response.data.errors).forEach((msg) =>
            this.$toast?.error(msg)
          );
        } else {
          this.$toast?.error(err.response?.data?.message || "Lỗi khi cập nhật hồ sơ!");
        }
      }
    },
  },
};
</script>

<style scoped>
.list-group-item.active {
  background-color: #ffecec !important;
  color: #dc3545 !important;
}

.form-control:disabled,
.form-select:disabled {
  opacity: 0.85;
  cursor: not-allowed;
}
</style>
