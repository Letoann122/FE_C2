<template>
    <div class="container-fluid bg-body-tertiary py-5">
        <div class="row justify-content-center g-4">
            <!-- MENU BÊN TRÁI -->
            <div class="col-md-3 col-lg-2">
                <div class="card border-0 shadow-sm rounded-4 p-2">
                    <div class="list-group list-group-flush">
                        <router-link to="/Hospital/profile" class="list-group-item list-group-item-action my-1"
                            active-class="active text-danger fw-bold">
                            <i class="bi bi-person-fill me-2"></i> Hồ sơ bác sĩ
                        </router-link>
                        <router-link to="/Hospital/doi-mat-khau" class="list-group-item list-group-item-action my-1"
                            active-class="active text-danger fw-bold">
                            <i class="bi bi-shield-lock-fill me-2"></i> Bảo mật tài khoản
                        </router-link>
                    </div>
                </div>
            </div>

            <!-- FORM HỒ SƠ -->
            <div class="col-md-9 col-lg-9">
                <div class="card shadow-sm border-0 position-relative">
                    <!-- Loading overlay -->
                    <div v-if="loading"
                        class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-50 rounded-3">
                        <div class="spinner-border text-danger" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>

                    <div class="card-body">
                        <h4 class="fw-bold mb-1">
                            <i class="bi bi-person-badge-fill me-2 text-danger"></i> Hồ sơ bác sĩ
                        </h4>
                        <p class="text-muted mb-3">
                            Cập nhật thông tin cá nhân và liên hệ của bạn
                        </p>
                        <hr class="my-3" />

                        <div class="row">
                            <div class="col-lg-6 mb-3">
                                <label class="form-label">Họ và tên</label>
                                <input v-model="profile.full_name" type="text" class="form-control" />
                            </div>
                            <div class="col-lg-6 mb-3">
                                <label class="form-label">Ngày sinh</label>
                                <input v-model="profile.birthday" type="date" class="form-control" />
                            </div>
                            <div class="col-lg-6 mb-3">
                                <label class="form-label">Giới tính</label>
                                <select v-model="profile.gender" class="form-select">
                                    <option disabled>Chọn giới tính</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                            <div class="col-lg-6 mb-3">
                                <label class="form-label">Số điện thoại</label>
                                <input v-model="profile.phone" type="text" class="form-control" />
                            </div>
                            <div class="col-lg-12 mb-3">
                                <label class="form-label">Email</label>
                                <input v-model="profile.email" type="email" class="form-control" readonly />
                            </div>
                            <div class="col-lg-12 mb-3">
                                <label class="form-label">Địa chỉ</label>
                                <textarea v-model="profile.address" class="form-control" rows="2"
                                    placeholder="Nhập địa chỉ nơi công tác hoặc sinh sống"></textarea>
                            </div>

                            <div class="text-end mt-4">
                                <button class="btn btn-danger" type="button" @click="updateProfile" :disabled="loading">
                                    <span v-if="!loading">
                                        Lưu thay đổi
                                    </span>
                                    <span v-else>
                                        <span class="spinner-border spinner-border-sm me-2"></span>
                                        Đang lưu...
                                    </span>
                                </button>
                                <button class="btn btn-secondary ms-2" type="button" @click="loadProfile"
                                    :disabled="loading">
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
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
    name: "DoctorProfile",
    data() {
        return {
            loading: false,
            profile: {
                full_name: "",
                birthday: "",
                gender: "",
                phone: "",
                email: "",
                address: "",
            },
        };
    },
    mounted() {
        this.loadProfile();
    },
    methods: {
        async loadProfile() {
            this.loading = true;
            try {
                const res = await baseRequestDoctor.get("/doctor/profile");
                if (res.data.status) {
                    this.profile = res.data.data;
                } else {
                    this.$toast?.error(res.data.message || "Không thể tải hồ sơ bác sĩ!");
                }
            } catch {
                this.$toast?.error("Lỗi khi tải thông tin hồ sơ bác sĩ!");
            } finally {
                this.loading = false;
            }
        },

        async updateProfile() {
            if (!this.profile.full_name || !this.profile.phone || !this.profile.address) {
                this.$toast?.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
                return;
            }

            this.loading = true;
            try {
                const res = await baseRequestDoctor.put("/doctor/profile", this.profile);
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
                    this.$toast?.error(
                        err.response?.data?.message || "Lỗi khi cập nhật hồ sơ!"
                    );
                }
            } finally {
                this.loading = false;
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

.list-group-item:hover {
    background-color: #fff0f0 !important;
}
</style>
