<template>
  <section
    class="position-relative d-flex align-items-center justify-content-center text-center"
    style="
      background: url('https://benhvientinh.caobang.gov.vn/uploads/news/2022_04/hien-mau-060422-2.jpg')
        center/cover no-repeat;
      height: 400px;
    "
  >
    <div
      class="position-absolute top-0 start-0 w-100 h-100 bg-white"
      style="opacity: 0.7"
    ></div>

    <div class="position-relative z-1 container">
      <h1 class="fw-bold display-5">
        Về Hệ Thống
        <span class="text-danger">Hiến Máu</span>
        <span class="text-dark"> Thông Minh</span>
      </h1>
      <p class="mt-3 fs-5 text-secondary" style="color: FEF2F2">
        Kết nối người hiến máu, bệnh viện và ngân hàng máu trên nền tảng trực
        tuyến hiện đại, an toàn và minh bạch.
      </p>
    </div>
  </section>
  <div class="container my-5">
    <div class="text-center mb-5">
      <h2 class="fw-bold">Dự Án</h2>
      <p class="text-muted">
        Chúng tôi hướng đến việc xây dựng một hệ thống hiến máu hiện đại, kết
        nối và hỗ trợ cộng đồng
      </p>
    </div>

    <div class="row g-4 mb-5 text-center">
      <div class="col-lg-3 col-md-6" v-for="(item, index) in projectItems" :key="index">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <div class="mb-3">
              <i :class="item.icon" class="fs-1 text-danger"></i>
            </div>
            <h5 class="fw-bold">{{ item.title }}</h5>
            <p class="text-muted small">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mb-5">
      <h2 class="fw-bold">Đối Tượng & Lợi Ích</h2>
      <p class="text-muted">
        Hệ thống được thiết kế để phục vụ tất cả đối tượng trong hệ sinh thái
        hiến máu
      </p>
    </div>

    <div class="row g-4 text-center">
      <div class="col-lg-4 col-md-6" v-for="(item, index) in benefitItems" :key="index">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <div class="mb-3">
              <i :class="item.icon" class="fs-1 text-primary"></i>
            </div>
            <h5 class="fw-bold">{{ item.title }}</h5>
            <ul class="list-unstyled text-start ms-5">
              <li v-for="(point, idx) in item.points" :key="idx">
                ✅ {{ point }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="container my-5">
    <div class="text-center mb-5">
      <h2 class="fw-bold">Giá trị cốt lõi</h2>
      <p class="text-muted">
        Những nguyên tắc chúng tôi luôn giữ vững để phát triển hệ thống bền vững
      </p>
    </div>

    <div class="row g-4 justify-content-center">
      <div
        class="col-lg-3 col-md-6"
        v-for="(value, idx) in coreValues"
        :key="idx"
      >
        <div class="card border-0 shadow-sm h-100 rounded-4 text-center p-4">
          <span
            class="d-flex justify-content-center align-items-center rounded-circle mb-3 mx-auto"
            :class="value.bg"
            style="width: 64px; height: 64px"
          >
            <i :class="value.icon"></i>
          </span>
          <h5 class="fw-bold mb-2">{{ value.title }}</h5>
          <p class="text-muted mb-0 small">{{ value.desc }}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="container my-5">
    <div class="text-center mb-5">
      <h2 class="fw-bold">Thành tựu & Thống kê</h2>
      <p class="text-muted">
        Những con số biết nói về hệ thống Smart Blood Donation
      </p>
    </div>

    <div class="row g-4">
      <div
        class="col-lg-3 col-md-6"
        v-for="(stat, idx) in statistics"
        :key="idx"
      >
        <div
          class="card h-100 border-0 rounded-4 shadow text-white"
          :class="stat.bg"
        >
          <div class="card-body text-center p-4">
            <i :class="stat.icon" class="fa-2x mb-3"></i>
            <h2 class="fw-bold mb-2">{{ stat.value }}</h2>
            <p class="mb-0">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="container my-5">
    <div class="text-center mb">
      <h2 class="fw-bold">Đội Ngũ Phát Triển</h2>
      <p class="text-muted">
        Những con người tận tâm đứng sau dự án Smart Blood Donation System
      </p>
    </div>

    <div class="row justify-content-center g-4 mb-5 text-center">
      <div class="col-6 col-md-2" v-for="(member, index) in team" :key="index">
        <div class="team-member">
          <img
            :src="member.image"
            class="rounded-circle mb-3 img-fluid shadow"
            alt="avatar"
          />
          <h6 class="fw-bold">{{ member.name }}</h6>
          <p class="text-muted small mb-1">{{ member.role }}</p>
          <p class="small text-primary">{{ member.email }}</p>
        </div>
      </div>
    </div>

    <div class="cta-section text-center p-5 rounded shadow-sm">
      <h4 class="fw-bold mb-3">Hãy cùng chúng tôi chung tay vì sự sống</h4>
      <p class="text-muted mb-4">
        Mỗi giọt máu hiến tặng là một cơ hội cứu sống. Hãy tham gia cộng đồng
        hiến máu ngay hôm nay!
      </p>
      <router-link
        to="/register-blooddonation"
        class="btn btn-danger btn-lg rounded-pill text-decoration-none"
      >
        ❤️ Đăng ký hiến máu ngay hôm nay
      </router-link>
    </div>
  </div>
</template>

<script>
import leaderImg from "../../../assets/img/avatar.jpg";
import Luong from "../../../assets/img/Luong.jpeg";
import Thanh from "../../../assets/img/Thanh.jpeg";
import Tai from "../../../assets/img/Tai.jpeg";
import Chi from "../../../assets/img/Chi.jpeg";
import Toan from "../../../assets/img/Toan.jpeg";
export default {
  // Thay thế setup() bằng data() trong Options API
  data() {
    return {
      // Các mảng dữ liệu đã được định nghĩa
      projectItems: [
        {
          icon: "bi bi-people-fill",
          title: "Kết nối cộng đồng hiến máu",
          desc: "Tạo cầu nối giữa hiến máu tình nguyện/tiếp nhận máu",
        },
        {
          icon: "bi bi-clipboard2-data-fill",
          title: "Quản lý kho máu minh bạch",
          desc: "Theo dõi, quản lý dữ liệu kho máu rõ ràng",
        },
        {
          icon: "bi bi-bell-fill",
          title: "Cảnh báo và hỗ trợ kịp thời",
          desc: "Đảm bảo máu sẵn sàng cho các tình huống khẩn cấp",
        },
        {
          icon: "bi bi-heart-pulse-fill",
          title: "Đóng góp cho sức khỏe cộng đồng",
          desc: "Những giọt máu hiến tặng giúp cứu sống nhiều người",
        },
      ],

      benefitItems: [
        {
          icon: "bi bi-heart-fill",
          title: "Người hiến máu",
          points: [
            "Dễ dàng đăng ký hiến máu",
            "Theo dõi lịch sử hiến máu",
            "Nhận thông báo nhắc lịch",
            "Quản lý thông tin cá nhân",
          ],
        },
        {
          icon: "bi bi-hospital-fill",
          title: "Bệnh viện / Ngân hàng máu",
          points: [
            "Quản lý kho máu hiệu quả",
            "Tự động quản lý kho máu",
            "Tìm người hiến phù hợp",
            "Báo cáo và thống kê",
          ],
        },
        {
          icon: "bi bi-person-badge-fill",
          title: "Quản trị viên",
          points: [
            "Quản lý toàn hệ thống",
            "Theo dõi công việc",
            "Quản lý thông tin",
            "Kiểm duyệt & xét duyệt",
          ],
        },
      ],

      // **ĐÃ CHỈNH SỬA**: Sửa lại class icon trong đây, và thêm class `mx-auto` + `d-flex justify-content-center` trong template
      coreValues: [
        {
          icon: "fas fa-heart fa-2x text-danger",
          title: "Tận tâm",
          desc: "Luôn đặt sức khỏe và sự an toàn của bệnh nhân lên hàng đầu",
          bg: "bg-danger bg-opacity-10",
        },
        {
          icon: "fas fa-star fa-2x text-warning",
          title: "Chất lượng",
          desc: "Cam kết cung cấp dịch vụ y tế chất lượng cao nhất",
          bg: "bg-warning bg-opacity-10",
        },
        {
          icon: "fas fa-users fa-2x text-primary",
          title: "Đồng đội",
          desc: "Làm việc nhóm hiệu quả, hỗ trợ lẫn nhau vì mục tiêu chung",
          bg: "bg-primary bg-opacity-10",
        },
        {
          icon: "fas fa-sync fa-2x text-success",
          title: "Đổi mới",
          desc: "Không ngừng cải tiến và áp dụng công nghệ mới",
          bg: "bg-success bg-opacity-10",
        },
      ],

      statistics: [
        {
          icon: "fas fa-users",
          value: "500+",
          label: "Người hiến máu đã đăng ký",
          bg: "bg-primary",
        },
        {
          icon: "fas fa-calendar-check",
          value: "1K+",
          label: "Lịch hẹn hiến máu",
          bg: "bg-info",
        },
        {
          icon: "fas fa-tint",
          value: "3K+",
          label: "Đơn vị máu được tiếp nhận",
          bg: "bg-success",
        },
        {
          icon: "fas fa-bullhorn",
          value: "20+",
          label: "Chiến dịch hiến máu",
          bg: "bg-warning",
        },
      ],

      team: [
        {
          name: "Tài Phạm",
          role: "Project Manager",
          email: "phamtantaihocsinh@gmail.com",
          image: Tai,
        },
        {
          name: "Lê Toàn",
          role: "Full-stack Developer",
          email: "Lvt1222003@gmail.com",
          image: Toan,
        },
        {
          name: "Dương Lượng",
          role: "Frontend Developer",
          email: "luong0701qb@gmail.com",
          image: Luong,
        },
        {
          name: "Quỳnh Chi",
          role: "Frontend Developer",
          email: "quynhchihtk84@gmail.com",
          image: Chi,
        },
        {
          name: "Minh Thành",
          role: "Frontend Developer",
          email: "duminhthanh.dmx2@gmail.com",
          image: Thanh,
        },
      ],
    };
  },
};
</script>

<style scoped>
.card {
  border-radius: 1rem;
}

.team-member img {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.cta-section {
  background: #fff5f5;
}
</style>