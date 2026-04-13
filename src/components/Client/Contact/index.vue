<template>
  <div class="contact-page bg-light py-5">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="fw-bold text-danger">Liên hệ ngay với chúng tôi</h2>
        <p class="text-muted">
          Hãy gửi tin nhắn nếu bạn muốn đăng ký hiến máu, trở thành tình nguyện
          viên, hoặc cần tư vấn thêm.
        </p>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <h5 class="fw-bold text-danger mb-3">
                Gửi tin nhắn cho chúng tôi
              </h5>
              <form @submit.prevent="submitForm">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Họ và tên <span class="text-danger">*</span> </label>
                  <input v-model="form.name" type="text" class="form-control" placeholder="Nguyễn Văn A" required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Email <span class="text-danger">*</span></label>
                  <input v-model="form.email" type="email" class="form-control" placeholder="example@gmail.com"
                    required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Nội dung <span class="text-danger">*</span></label>
                  <textarea v-model="form.message" class="form-control" rows="5"
                    placeholder="Nhập nội dung tin nhắn của bạn..." required></textarea>
                </div>
                <button type="submit" class="btn btn-danger w-100 fw-bold rounded-pill" :disabled="loading">
                  {{ loading ? "Đang gửi..." : "Gửi tin nhắn" }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <h5 class="fw-bold text-danger mb-3">Thông tin liên hệ</h5>
              <ul class="list-unstyled mb-4">
                <li class="mb-2">
                  <i class="bi bi-geo-alt-fill text-danger me-2"></i>
                  120 Hoàng Minh Thảo, phường Hoà Khánh, TP. Đà Nẵng
                </li>
                <li class="mb-2">
                  <i class="bi bi-telephone-fill text-danger me-2"></i>
                  <strong>Hotline:</strong> 0901 234 567
                </li>
                <li class="mb-2">
                  <i class="bi bi-envelope-fill text-danger me-2"></i>
                  <strong>Email:</strong> Smart.blood.donation.system@gmail.com
                </li>
                <li>
                  <i class="bi bi-clock-fill text-danger me-2"></i>
                  Thời gian làm việc: 8:00 - 17:00 (T2 - T7)
                </li>
              </ul>

              <div class="map-container rounded overflow-hidden shadow-sm">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.307695418689!2d108.1591451!3d16.049514999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421938e07dc88f%3A0x7ced3a0b971c065b!2zMTIwIEhvw6BuZyBNaW5oIFRo4bqjbywgSG_DoCBLaMOhbmggTmFtLCBMacOqbiBDaGnhu4N1LCDEkMOgIE7hurVuZyA1NTAwMDA!5e0!3m2!1svi!2s!4v1766572434777!5m2!1svi!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default {
  name: "LienHe",
  data() {
    return {
      loading: false,
      form: {
        name: "",
        email: "",
        message: "",
      },
    };
  },
  methods: {
    async submitForm() {
      if (!this.form.name || !this.form.email || !this.form.message) {
        this.$toast?.error("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      this.loading = true;
      try {
        const res = await axios.post(`${API_BASE}/contact`, this.form);

        if (res.data?.status) {
          this.$toast?.success(
            res.data.message || "Đã gửi liên hệ, cảm ơn bạn!"
          );
          this.form = { name: "", email: "", message: "" };
        } else {
          this.$toast?.error(res.data.message || "Gửi liên hệ thất bại!");
        }
      } catch (err) {
        console.error("Contact error:", err);
        this.$toast?.error(
          err.response?.data?.message || "Server error khi gửi liên hệ!"
        );
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.contact-page {
  font-family: "Poppins", sans-serif;
}

.card {
  border-radius: 12px;
}

.btn-danger {
  background-color: #dc3545;
  border: none;
}

.btn-danger:hover {
  background-color: #b52b38;
}

.map-container iframe {
  border-radius: 10px;
}

.contact-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.contact-btn i {
  font-size: 26px;
  color: #dc3545;
}

.contact-btn img {
  width: 28px;
  height: 28px;
}

.contact-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}
</style>
