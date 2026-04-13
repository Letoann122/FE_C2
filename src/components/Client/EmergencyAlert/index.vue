<template>
    <div v-if="alert && canShow" class="alert alert-custom text-white mb-0" role="alert">
        <div class="d-flex justify-content-between align-items-center">

            <!-- LEFT -->
            <div class="d-flex align-items-center">
                <i class="fa-solid fa-circle ms-3 text-white"></i>
                <i class="fa-solid fa-triangle-exclamation ms-2" style="color:#ffd43b"></i>
                <strong class="ms-2">KHẨN CẤP:</strong>
                <span class="ms-2">{{ alert.title }}</span>
            </div>

            <!-- RIGHT -->
            <div class="d-flex align-items-center">

                <!-- CLIENT -->
                <router-link v-if="role === null" to="/register"
                    class="btn btn-light text-danger fw-bold rounded-pill me-3">
                    <i class="fa-solid fa-heart-circle-plus me-1 text-danger"></i>
                    Đăng ký ngay
                </router-link>

                <!-- DONOR -->
                <router-link v-if="role === 'donor'" to="/register-blooddonation"
                    class="btn btn-light text-danger fw-bold rounded-pill me-3">
                    <i class="fa-solid fa-calendar-check me-1 text-danger"></i>
                    Đặt lịch ngay
                </router-link>

                <!-- CLOSE -->
                <button class="btn btn-link text-white fw-bold p-0 me-3" style="font-size:18px" @click="closeAlert">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default {
    data() {
        return {
            alert: null,
            role: null,
        };
    },

    computed: {
        // Chỉ hiển thị cho client & donor
        canShow() {
            return this.role === null || this.role === "donor";
        },
    },

    async mounted() {
        // ==============================
        // LẤY ROLE ĐÚNG CÁCH
        // ==============================
        try {
            let user = null;

            // donor FE chuẩn
            user = JSON.parse(localStorage.getItem("user_donor"));

            // fallback
            if (!user) {
                user = JSON.parse(localStorage.getItem("user"));
            }

            this.role = user?.role || null;

        } catch {
            this.role = null;
        }

        // ==============================
        // GỌI API ALERT
        // ==============================
        try {
            const res = await axios.get(`${API_BASE}/public/emergency-alert`);

            if (res.data.status && res.data.data) {
                this.alert = res.data.data;
            }
        } catch (err) {
            console.error("❌ Không thể load emergency alert", err);
        }
    },

    methods: {
        closeAlert() {
            this.alert = null;
        },
    },
};
</script>

<style scoped>
.alert-custom {
    background: #c62828;
    padding: 15px 0;
    border-radius: 0;
}
</style>
