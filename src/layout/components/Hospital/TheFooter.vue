<template>
    <footer class="site-footer bg-dark text-white py-3">
        <div class="container">
            <div class="row">
                <div class="col-lg-4 col-md-12 mb-4">
                    <p class="footer-brand-name text-danger fw-bold d-flex align-items-center mb-2">
                        <i class="bi bi-heart-pulse-fill me-2"></i>
                        Smart Blood Donation
                    </p>
                    <p class="text-white-50 small pe-lg-3 mb-0">
                        Hệ thống quản lý hiến máu thông minh,
                    </p>
                    <p class="text-white-50 small pe-lg-3 mb-0">
                        kết nối cộng đồng vì sự sống.
                    </p>
                </div>
                <div class="col-lg-4 col-md-6 mb-4">
                    <p class="footer-heading mb-2">Liên hệ hỗ trợ</p>
                    <ul class="list-unstyled">
                        <li class="d-flex align-items-center mb-2">
                            <i class="bi bi-envelope-fill me-3"></i>
                            <a href="mailto:support@smartblood.vn" class="footer-link">support@smartblood.vn</a>
                        </li>
                        <li class="d-flex align-items-center ">
                            <i class="bi bi-telephone-fill me-3"></i>
                            <span class="text-white-50">1900 1234</span>
                        </li>
                    </ul>
                </div>
                <div class="col-lg-4 col-md-6 mb-4">
                    <p class="footer-heading mb-2">Liên kết nhanh</p>
                    <ul class="list-unstyled">
                        <li class="mb-1">
                            <a href="#" class="footer-link">Chính sách bảo mật</a>
                        </li>
                        <li class="mb-1">
                            <a href="#" class="footer-link">Điều khoản sử dụng</a>
                        </li>
                        <li class="mb-1">
                            <a href="#" class="footer-link">Hướng dẫn sử dụng</a>
                        </li>
                    </ul>
                </div>
            </div>
            <hr class="footer-divider my-3">
            <div class="text-center text-white-50 small footer-copyright">
                © {{ new Date().getFullYear() }} Smart Blood Donation. All Rights Reserved.
            </div>

        </div>
    </footer>
</template>

<script>
export default {
    name: 'TheFooter'
}
</script>

<style scoped>
.site-footer {
    font-size: 0.85rem;
}
.footer-brand-name {
    font-size: 1.1rem;
}
.footer-heading {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
    color: #ffffff;
}
.footer-link {
    color: #adb5bd;
    text-decoration: none;
    transition: color 0.2s ease-in-out;
}
.footer-link:hover {
    color: #fff !important;
}
.footer-divider {
    border-color: rgba(255, 255, 255, 0.1);
}
.footer-copyright {
    opacity: 0.8;
}
</style>