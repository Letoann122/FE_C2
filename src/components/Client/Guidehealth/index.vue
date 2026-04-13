<template>
  <div class="container my-5">
    <div class="row align-items-center">
      <div class="col-lg-6">
        <h2 class="fw-bold mb-3">
          Hướng dẫn chăm sóc sức khỏe <br />
          <span class="text-danger">trước & sau khi hiến máu</span>
        </h2>
        <p class="text-muted mb-4">
          Chuẩn bị tốt trước khi hiến và chăm sóc đúng cách sau khi hiến máu sẽ
          giúp bạn khỏe mạnh và an toàn.
        </p>
        <div class="d-flex gap-3">
          <div class="d-flex gap-3">
            <a href="https://vienhuyethoc.vn/luu-y-truoc-va-sau-hien-mau/" target="_blank" rel="noopener noreferrer"
              class="btn btn-danger px-4">
              Trước khi hiến
            </a>

            <a href="https://vienhuyethoc.vn/luu-y-truoc-va-sau-hien-mau/" target="_blank" rel="noopener noreferrer"
              class="btn btn-outline-secondary px-4">
              Sau khi hiến
            </a>
          </div>
        </div>
      </div>

      <div class="col-lg-6 text-center mt-4 mt-lg-0">
        <img src="../../../assets/img/huongdan.jpg" alt="health guide" class="img-fluid rounded shadow" />
      </div>
    </div>
  </div>

  <!-- Trước khi hiến máu -->
  <div class="container my-4">
    <div class="align-items-center text-center mb-4">
      <h3>Trước khi hiến máu</h3>
      <p>Chuẩn bị kỹ lưỡng để quá trình diễn ra an toàn</p>
    </div>

    <!-- Hàng 1 -->
    <div class="d-flex gap-4 flex-column flex-md-row">
      <div class="col rounded shadow" style="background-color: #ffdee9">
        <div class="mt-3 p-3">
          <div class="rounded-circle d-flex align-items-center justify-content-center"
            style="background-color: #fff3cd; width: 56px; height: 56px">
            <i class="bi bi-moon-stars-fill fs-3 text-primary"></i>
          </div>
          <h5 class="fw-bold mt-2">Ngủ đủ giấc</h5>
          <p>
            Ngủ ít nhất 6-8 tiếng để cơ thể có đủ năng lượng và sức khỏe tốt
            nhất.
          </p>
        </div>
      </div>

      <div class="col rounded shadow" style="background-color: #d4fc79">
        <div class="mt-3 p-3">
          <div class="rounded-circle d-flex align-items-center justify-content-center"
            style="background-color: #fff3cd; width: 56px; height: 56px">
            <i class="bi bi-egg-fried fs-3 text-success"></i>
          </div>
          <h5 class="fw-bold mt-2">Ăn nhẹ</h5>
          <p>
            Ăn nhẹ trước khi hiến, tránh đồ ăn nhiều dầu mỡ để tránh buồn nôn.
          </p>
        </div>
      </div>

      <div class="col rounded shadow" style="background-color: #a1ffce">
        <div class="mt-3 p-3">
          <div class="rounded-circle d-flex align-items-center justify-content-center"
            style="background-color: #fff3cd; width: 56px; height: 56px">
            <i class="bi bi-cup-straw fs-3 text-info"></i>
          </div>
          <h5 class="fw-bold mt-2">Uống nhiều nước</h5>
          <p>Bổ sung đủ nước để duy trì thể tích máu và tránh mất nước.</p>
        </div>
      </div>
    </div>

    <!-- Hàng 2 -->
    <div class="d-flex gap-4 mt-3 flex-column flex-md-row">
      <div class="col rounded shadow" style="background-color: #ff9a9e">
        <div class="mt-3 p-3">
          <div class="rounded-circle d-flex align-items-center justify-content-center"
            style="background-color: #fff3cd; width: 56px; height: 56px">
            <i class="bi bi-slash-circle-fill fs-3 text-danger"></i>
          </div>
          <h5 class="fw-bold mt-2">Tránh rượu bia</h5>
          <p>Không uống rượu bia ít nhất 24h trước khi hiến máu.</p>
        </div>
      </div>

      <div class="col rounded shadow" style="background-color: #ffd3a5">
        <div class="mt-3 p-3">
          <div class="rounded-circle d-flex align-items-center justify-content-center"
            style="background-color: #fff3cd; width: 56px; height: 56px">
            <i class="bi bi-person-vcard-fill fs-3 text-warning"></i>
          </div>
          <h5 class="fw-bold mt-2">Giấy tờ tùy thân</h5>
          <p>Mang theo CCCD/CMND hoặc giấy tờ có ảnh để xác minh danh tính.</p>
        </div>
      </div>

      <div class="col rounded shadow" style="background-color: #c9ffbf">
        <div class="mt-3 p-3">
          <div class="rounded-circle d-flex align-items-center justify-content-center"
            style="background-color: #fff3cd; width: 56px; height: 56px">
            <i class="bi bi-alarm-fill fs-3 text-primary"></i>
          </div>
          <h5 class="fw-bold mt-2">Đến đúng giờ</h5>
          <p>
            Đến điểm hiến máu đúng thời gian đã đăng ký để tránh chờ đợi lâu.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Hỗ trợ khẩn cấp -->
  <div class="container my-3">
    <div class="card shadow-sm border-0 emergency-card p-3 mx-auto">
      <div class="card-body d-flex align-items-start">
        <div class="me-3">
          <div class="rounded-circle bg-danger bg-opacity-10 p-3">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-3"></i>
          </div>
        </div>

        <div class="flex-grow-1">
          <h5 class="fw-bold text-danger">Hỗ trợ khẩn cấp</h5>
          <p class="text-muted mb-2">
            Nếu bạn gặp bất kỳ triệu chứng bất thường nào sau khi hiến máu như
            choáng váng, chảy máu kéo dài, hãy liên hệ ngay với chúng tôi.
          </p>

          <div class="d-flex flex-wrap gap-4 mb-3">
            <span class="fw-semibold text-dark">
              <i class="bi bi-telephone-fill text-danger me-2"></i> Hotline:
              090.521.5123
            </span>
            <span class="fw-semibold text-dark">
              <i class="bi bi-clock-fill text-danger me-2"></i> Cấp cứu: 115
            </span>
          </div>

          <button class="btn btn-danger fw-semibold">Liên hệ ngay</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Tài liệu tham khảo -->
  <div class="bg-light py-5">
    <div class="container">
      <div class="text-center mb-4">
        <h4 class="fw-bold">Tài liệu tham khảo</h4>
        <p class="text-muted mb-0">Tìm hiểu thêm từ các nguồn uy tín</p>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="list-group shadow-sm rounded-3">

            <a href="https://www.cdph.ca.gov/Programs/OSPHLD/LFS/CDPH%20Document%20Library/BloodTransfusionGuideVietnamese.pdf"
              target="_blank" class="list-group-item list-group-item-action d-flex align-items-start">
              <i class="bi bi-file-earmark-pdf-fill text-danger fs-4 me-3 mt-1"></i>
              <div>
                <div class="fw-semibold">Hướng dẫn về truyền máu an toàn</div>
                <small class="text-muted">Tài liệu tham khảo (tiếng Việt)</small>
              </div>
            </a>

            <a href="https://thuvienphapluat.vn/van-ban/The-thao-Y-te/Thong-tu-26-2013-TT-BYT-huong-dan-hoat-dong-hien-mau-tinh-nguyen-206408.aspx"
              target="_blank" class="list-group-item list-group-item-action d-flex align-items-start">
              <i class="bi bi-file-earmark-text-fill text-primary fs-4 me-3 mt-1"></i>
              <div>
                <div class="fw-semibold">Quy định về hiến máu - Bộ Y tế</div>
                <small class="text-muted">Thông tư 26/2013/TT-BYT</small>
              </div>
            </a>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.emergency-card {
  border-left: 6px solid #dc3545;
  background-color: #fff5f5;
  border-radius: 12px;
  max-width: 720px;
}
</style>
