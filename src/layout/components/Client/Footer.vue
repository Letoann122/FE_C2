<template>
  <footer class="bg-dark text-white pt-5 pb-3 mt-5">
    <div class="container">
      <div class="row gy-4">
        <div class="col-md-4">
          <h5 class="fw-bold text-white mb-3">
            <i class="bi bi-droplet-fill text-danger me-2"></i> Smart Blood
            Donation
          </h5>
          <p class="text-white-50">
            Hệ thống hiến máu thông minh kết nối cộng đồng để cứu sống nhiều
            người hơn.
          </p>
          <div class="d-flex gap-3 mt-3">
            <a href="#" class="text-white-50 fs-5 hover-icon">
              <i class="bi bi-facebook"></i>
            </a>
            <a href="#" class="text-white-50 fs-5 hover-icon">
              <i class="bi bi-instagram"></i>
            </a>
            <a href="#" class="text-white-50 fs-5 hover-icon">
              <i class="bi bi-youtube"></i>
            </a>
          </div>
        </div>
        <div class="col-md-2">
          <h6 class="fw-bold text-white mb-3">Liên kết nhanh</h6>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/about" class="footer-link">
                <i class="bi bi-info-circle me-2"></i>Giới thiệu
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/register" class="footer-link">
                <i class="bi bi-person-plus me-2"></i>Đăng ký hiến máu
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/register-blooddonation" class="footer-link">
                <i class="bi bi-calendar-check me-2"></i>Đặt lịch hẹn
              </router-link>
            </li>
            <li>
              <router-link to="/contact" class="footer-link">
                <i class="bi bi-envelope-paper me-2"></i>Liên hệ
              </router-link>
            </li>
          </ul>
        </div>
        <div class="col-md-3">
          <h6 class="fw-bold text-white mb-3">Hỗ trợ</h6>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/guide-health" class="footer-link">
                <i class="bi bi-heart-pulse me-2"></i>Hướng dẫn & chăm sóc sức
                khỏe
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/fa-question" class="footer-link">
                <i class="bi bi-question-circle me-2"></i>Câu hỏi thường gặp
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/privacy-policy" class="footer-link">
                <i class="bi bi-shield-lock me-2"></i>Chính sách bảo mật
              </router-link>
            </li>
            <li>
              <router-link to="/terms-use" class="footer-link">
                <i class="bi bi-file-text me-2"></i>Điều khoản sử dụng
              </router-link>
            </li>
          </ul>
        </div>
        <div class="col-md-3">
          <h6 class="fw-bold text-white mb-3">Liên hệ</h6>
          <p class="text-white-50 mb-2">
            <i class="bi bi-envelope-fill text-danger me-2"></i> info@sbdd.com
          </p>
          <p class="text-white-50 mb-2">
            <i class="bi bi-telephone-fill text-danger me-2"></i> 1900 1234
          </p>
          <p class="text-white-50 mb-0">
            <i class="bi bi-geo-alt-fill text-danger me-2"></i> Hải Châu, Đà
            Nẵng
          </p>
        </div>
      </div>


      <!-- Dòng bản quyền -->
      <div class="text-center mt-4 pt-3 border-top border-secondary text-white-50 small">

        © 2025 Smart Blood Donation System. Tất cả quyền được bảo lưu.
      </div>
    
    </div> 
  </footer>
</template>
<style scoped>
.footer-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.3s;
}
.footer-link:hover {
  color: #dc3545;
  text-decoration: underline;
}
.hover-icon:hover {
  color: #dc3545;
  transform: scale(1.2);
  transition: 0.3s ease;
}
.list-unstyled :hover {
  cursor: pointer;
  text-decoration: underline;
}
</style>

<script>
export default {};
</script>
