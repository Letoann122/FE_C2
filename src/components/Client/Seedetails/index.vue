<template>
  <div class="container my-5">
    <div class="row">
      <div class="col-lg-8">
        <img
          src="../../../assets/img/295A1559.jpg"
          alt="campaign"
          class="img-fluid rounded mb-3"
          style="height: 400px; width: 855px"
        />

        <label class="badge bg-danger mb-2">Chiến dịch</label>

        <h3 class="fw-bold">
          Chiến dịch "Giọt máu hồng - Tình người ấm" tại Bệnh viện Đa khoa Thành
          phố Đà Nẵng
        </h3>

        <div class="text-muted small mb-4">
          <i class="bi bi-calendar me-2"></i> 15 tháng 9, 2024
          <span class="mx-2">•</span>
          Ban tổ chức
          <span class="mx-2">•</span>
          5 phút đọc
        </div>

        <div class="card border-0 shadow-sm rounded-3 p-4 mb-4">
          <div class="row text-center">
            <div class="col-md-3 mb-3 mb-md-0">
              <i class="bi bi-clock-fill text-danger fs-4"></i>
              <p class="fw-bold mb-0">Thời gian</p>
              <p class="small">8:00 - 17:00,20/09/2024</p>
            </div>
            <div class="col-md-3 mb-3 mb-md-0">
              <i class="bi bi-geo-alt-fill text-danger fs-4"></i>
              <p class="fw-bold mb-0">Địa điểm</p>
              <p class="small">Bệnh viện Đa khoa TP</p>
            </div>
            <div class="col-md-3 mb-3 mb-md-0">
              <i class="bi bi-people-fill text-danger fs-4"></i>
              <p class="fw-bold mb-0">127/200</p>
              <p class="small">Đã đăng ký</p>
            </div>
            <div class="col-md-3">
              <i class="bi bi-heart-fill text-danger fs-4"></i>
              <p class="fw-bold mb-0">200 đơn vị máu</p>
              <p class="small">Mục tiêu</p>
            </div>
          </div>

          <router-link
            to="/register-blooddonation"
            class="btn btn-danger btn-lg w-100 rounded-pill text-white text-decoration-none"
          >
            Đăng ký tham gia ngay
          </router-link>
        </div>

        <div class="card border-0 shadow-sm p-4 mb-4">
          <p>
            Chiến dịch hiến máu "Giọt máu hồng - Tình người ấm" là một sự kiện ý
            nghĩa nhằm kêu gọi cộng đồng chung tay góp phần cứu sống những bệnh
            nhân đang cần được truyền máu cấp cứu.
          </p>
          <h6>Mục tiêu chiến dịch</h6>
          <label class="ms-3"
            >Thu thập 200 đơn vị máu an toàn cho ngân hàng máu bệnh viện</label
          >
          <label class="ms-3"
            >Nâng cao ý thức cộng đồng về tầm quan trọng của hiến máu</label
          >
          <label class="ms-3"
            >Tạo môi trường hiến máu an toàn và chuyên nghiệp</label
          >
          <label class="ms-3"
            >Xây dựng mạng lưới tình nguyện viên hiến máu thường xuyên</label
          >

          <h6 class="mt-3">Quy trình tham gia</h6>
          <div class="row">
            <div class="col-4 text-center bg-light">
              <i class="bi bi-1-circle-fill text-danger fs-2"></i>
              <h6>Đăng ký</h6>
              <p class="small">Điền thông tin cá nhân và đặt lịch hẹn</p>
            </div>

            <div class="col-4 text-center bg-light">
              <i class="bi bi-2-circle-fill text-danger fs-2"></i>
              <h6>Khám sàng lọc</h6>
              <p class="small">Kiểm tra sức khỏe và đánh giá điều kiện</p>
            </div>

            <div class="col-4 text-center bg-light">
              <i class="bi bi-3-circle-fill text-danger fs-2"></i>
              <h6>Hiến máu</h6>
              <p class="small">
                Thực hiện hiến máu an toàn với trang thiết bị hiện đại
              </p>
            </div>
          </div>

          <div
            class="card border-0 shadow-sm p-4 mb-4"
            style="background-color: beige"
          >
            <div class="text-danger">
              <i class="ms-3 bi bi-exclamation-square-fill"></i>
              <h6 class="d-inline ms-2">Điều kiện tham gia</h6>
            </div>
            <label class="d-block ms-3"
              >+ Tuổi từ 18-60, cân nặng từ 45kg trở lên</label
            >
            <label class="d-block ms-3"
              >+ Sức khỏe tốt, không mắc các bệnh truyền nhiễm</label
            >
            <label class="d-block ms-3"
              >+ Mang theo CCCD/CMND và giấy tờ tùy thân</label
            >
            <label class="d-block ms-3"
              >+ Không uống rượu bia 24h trước khi hiến máu</label
            >
          </div>
        </div>

        <div class="card border-0 shadow-sm p-4 mb-4">
          <div class="mb-2">
            <i class="bi bi-map-fill text-danger"></i>
            <h7 class="ms-2">Bản đồ địa điểm</h7>
          </div>
          <img src="../../../assets/img/Bando.jpg" alt="Bản đồ" />
        </div>
      </div>

      <!-- Cột phải -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm p-4 mb-4">
          <h6 class="fw-bold mb-3">Hành động nhanh</h6>
          <router-link
            to="/register-blooddonation"
            class="btn btn-danger w-100 mb-2 d-flex align-items-center justify-content-center"
          >
            <i class="bi bi-calendar-check me-2"></i> Đặt lịch hiến máu
          </router-link>

          <button class="btn btn-outline-danger w-100" @click="shareToFacebook">
            <i class="bi bi-share me-2"></i> Chia sẻ chiến dịch
          </button>
        </div>

        <div class="card border-0 shadow-sm p-4">
          <h6 class="fw-bold mb-3">Chiến dịch liên quan</h6>

          <div v-for="(item, index) in data" :key="index" class="mb-3">
            <img
              :src="item.image"
              class="rounded me-3"
              style="width: 322px; height: 130px; object-fit: cover"
            />
            <div>
              <p class="fw-bold small mt-1 mb-1">{{ item.title }}</p>
              <p class="text-muted small mb-1">{{ item.date }}</p>
              <a href="#" class="text-danger small">Xem chi tiết →</a>
            </div>
          </div>
        </div>

        <div class="card border-0 shadow-sm p-4 mb-4">
          <h6 class="fw-bold mb-3">Liên hệ hỗ trợ</h6>
          <div>
            <div>
              <div class="mb-2">
                <i class="bi bi-telephone-fill text-danger"></i>
                0123456789
              </div>
              <div class="mb-2">
                <i class="bi bi-envelope-fill text-danger"></i>
                support@smartbool.com
              </div>
              <div>
                <i class="bi bi-alarm-fill text-danger"></i>
                24/7 hỗ trợ
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="cta-section text-center p-5 rounded shadow-sm bg-light"
      style="width: max"
    >
      <h4 class="fw-bold mb-3">Hãy trở thành người hùng cứu sống</h4>
      <p class="text-muted mb-4">
        Mỗi lần hiến máu, bạn có thể cứu sống đến 3 người. Hành động nhỏ, ý
        nghĩa lớn.
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

<script setup>
function shareToFacebook() {
  const url = encodeURIComponent(window.location.href);
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  window.open(shareUrl, "_blank", "width=600,height=400");
}

const data = [
  {
    title: "Ngày hội hiến máu tại Đại học",
    date: "25 tháng 9, 2024",
    image: new URL("../../../assets/img/hienmau.jpg", import.meta.url).href,
  },
  {
    title: "Xe hiến máu lưu động",
    date: "30 tháng 9, 2024",
    image: new URL("../../../assets/img/hienmau.jpg", import.meta.url).href,
  },
];
</script>
