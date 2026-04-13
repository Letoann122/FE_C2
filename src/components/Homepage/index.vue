<template>
  <div class="container my-5">
    <div class="row align-items-center">
      <div class="col-md-6 mt-5 mb-5">
        <h1 class="fw-bold display-5 mt-5">
          Hệ Thống <span class="text-danger">Hiến Máu</span> Thông Minh
        </h1>
        <p class="text-secondary mt-3">
          Kết nối người hiến máu, bệnh viện và ngân hàng máu trên một nền tảng
          trực tuyến an toàn, tiện lợi, minh bạch
        </p>
        <div class="mt-4 mb-5">
          <router-link to="/register" class="btn btn-danger me-3">
            Bắt đầu ngay
          </router-link>

          <router-link to="/about" class="btn btn-outline-danger">
            Tìm hiểu thêm
          </router-link>
        </div>
      </div>
      <div class="col-md-6 text-center">
        <img
          src="https://benhvientinh.quangtri.gov.vn/uploads/news/2025_02/loi-ich-hien-mau.jpg"
          class="img-fluid" alt="Blood Donation" />
      </div>
    </div>
  </div>
  <div class="card border-0 bg-light">
    <!-- mục tiêu -->
    <div class="card-body text-center">
      <h2 class="fw-bold">Mục Tiêu</h2>
      <p class="text-muted">Xây dựng hệ thống hiến máu toàn diện và hiệu quả</p>
    </div>
    <div class="row g-4 px-4 pb-4">
      <div class="col-md-4">
        <div class="d-flex p-3 bg-light rounded shadow-sm h-100">
          <div class="me-3 mt-2">
            <span class="bg-danger text-white p-3 rounded">
              <i class="fa-solid fa-diagram-project fa-lg"></i>
            </span>
          </div>
          <div>
            <h6 class="fw-bold mb-1">Nền Tảng Kết Nối</h6>
            <p class="text-muted mb-0">
              Xây dựng nền tảng quản lý hiến máu và kết nối bệnh viện
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-flex p-3 bg-light rounded shadow-sm h-100">
          <div class="me-3 mt-2">
            <span class="bg-danger text-white p-3 rounded">
              <i class="fa-solid fa-calendar-check fa-lg"></i>
            </span>
          </div>
          <div>
            <h6 class="fw-bold mb-1">Đăng Ký & Đặt Lịch</h6>
            <p class="text-muted mb-0">
              Đăng ký, đặt lịch, theo dõi lịch sử hiến máu dễ dàng
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-flex p-3 bg-light rounded shadow-sm h-100">
          <div class="me-3 mt-2">
            <span class="bg-danger text-white p-3 rounded">
              <i class="fa-solid fa-database fa-lg"></i>
            </span>
          </div>
          <div>
            <h6 class="fw-bold mb-1">Quản Lý Tồn Kho</h6>
            <p class="text-muted mb-0">
              Quản lý tồn kho máu, thông tin người hiến, chiến dịch
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-flex p-3 bg-light rounded shadow-sm h-100">
          <div class="me-3 mt-2">
            <span class="bg-danger text-white p-3 rounded">
              <i class="fa-solid fa-comments fa-lg"></i>
            </span>
          </div>
          <div>
            <h6 class="fw-bold mb-1">Liên Lạc Thời Gian Thực</h6>
            <p class="text-muted mb-0">
              Kết nối và trao đổi thông tin nhanh chóng, hiệu quả
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-flex p-3 bg-light rounded shadow-sm h-100">
          <div class="me-3 mt-2">
            <span class="bg-danger text-white p-3 rounded">
              <i class="fa-solid fa-shield-halved fa-lg"></i>
            </span>
          </div>
          <div>
            <h6 class="fw-bold mb-1">An Toàn & Bảo Mật</h6>
            <p class="text-muted mb-0">
              Minh bạch, an toàn, bảo mật thông tin người dùng
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-flex p-3 bg-light rounded shadow-sm h-100">
          <div class="me-3 mt-2">
            <span class="bg-danger text-white p-3 rounded">
              <i class="fa-solid fa-users fa-lg"></i>
            </span>
          </div>
          <div>
            <h6 class="fw-bold mb-1">Trải Nghiệm Tối Ưu</h6>
            <p class="text-muted mb-0">
              Tăng sự tiện lợi, tin cậy và trải nghiệm người dùng
            </p>
          </div>
        </div>
      </div>
    </div>
    <!--Tính năng-->
    <div class="container my-5">
      <div class="text-center mb-4">
        <h2 class="fw-bold">Tính Năng Nổi Bật</h2>
        <p class="text-muted">
          Những tính năng đặc biệt giúp tối ưu hóa quy trình hiến máu
        </p>
      </div>
      <div class="row g-4">
        <div class="col-md-3">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body text-center">
              <i class="fa-solid fa-calendar-check fa-2x text-danger mb-3"></i>
              <h6 class="fw-bold">Đăng Ký & Đặt Lịch</h6>
              <p class="text-muted">
                Đăng ký tài khoản và đặt lịch hiến máu nhanh chóng, thuận tiện
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body text-center">
              <i class="fa-solid fa-database fa-2x text-danger mb-3"></i>
              <h6 class="fw-bold">Quản Lý Tồn Kho Máu</h6>
              <p class="text-muted">
                Theo dõi và quản lý tồn kho máu theo thời gian thực tại các bệnh
                viện
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body text-center">
              <i class="fa-solid fa-comments fa-2x text-danger mb-3"></i>
              <h6 class="fw-bold">Liên Lạc Trực Tuyến</h6>
              <p class="text-muted">
                Kết nối trực tiếp giữa người hiến máu, bệnh viện và ngân hàng
                máu
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body text-center">
              <i class="fa-solid fa-clock-rotate-left fa-2x text-danger mb-3"></i>
              <h6 class="fw-bold">Theo Dõi Lịch Sử</h6>
              <p class="text-muted">
                Lưu trữ và theo dõi lịch sử hiến máu chi tiết của từng người
                dùng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--Sẵn sàng tham gia-->
    <div class="container text-center my-5 py-5">
      <h2 class="fw-bold mb-3">Sẵn Sàng Tham Gia?</h2>
      <p class="text-muted mb-4">
        Hãy cùng chúng tôi xây dựng một hệ thống hiến máu thông minh, giúp cứu
        sống nhiều người hơn mỗi ngày
      </p>

      <router-link to="/contact" class="btn btn-danger btn-lg">
        Liên hệ ngay
      </router-link>
    </div>
  </div>
</template>

<script>
import baseRequestClient from '../../core/baseRequestClient';
export default {
  name: "TrangChu",
  data() {
    return {
      news: [],
      loading: true,
      showAlert: true,
    };
  },
  async created() {
    try {
      const res = await baseRequestClient.get("/news");
      this.news = res.data;
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      this.loading = false;
    }
  },
};
</script>
<style>
.alert-custom {
  background: linear-gradient(90deg, #d32f2f, #b71c1c);
  border: none;
  color: #fff;
}
</style>
