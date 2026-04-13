<template>
  <div class="d-flex justify-content-center align-items-center text-center  flex-column vh-100 bg-light ">
   
    <div class="rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center mb-4" 
         style="width: 80px; height: 80px;">
      <i class="bi bi-search fs-2 text-secondary"></i>
    </div>

    
    <h1 class="fw-bold display-3 text-dark mb-2">404</h1>
    <h5 class="text-muted mb-3">Trang bạn tìm kiếm không tồn tại</h5>
    <p class="text-secondary mb-4">
      Vui lòng kiểm tra lại liên kết hoặc quay về trang chủ.
    </p>

    
    <div class="d-flex gap-3 mb-4">
      <router-link to="/" class="btn btn-dark d-flex align-items-center">
        <i class="bi bi-arrow-left-short fs-5 me-1"></i> Quay lại Trang chủ
      </router-link>
      <button class="btn btn-outline-secondary d-flex align-items-center" @click="reloadPage">
        <i class="bi bi-arrow-clockwise fs-5 me-1"></i> Thử lại
      </button>
    </div>

    
    <div class="border-top pt-3 text-muted small">
      <p class="mb-1">Cần hỗ trợ?</p>
      <div class="d-flex justify-content-center gap-4">
        <a href="#" class="text-decoration-none text-dark">
          <i class="bi bi-envelope-fill me-1 text-danger"></i> Liên hệ hỗ trợ
        </a>
        <a href="#" class="text-decoration-none text-dark">
          <i class="bi bi-info-circle-fill me-1 text-primary"></i> Trung tâm trợ giúp
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFound",
  methods: {
    reloadPage() {
      window.location.reload();
    },
  },
};
</script>

<style scoped>
.btn-dark:hover {
  background-color: #343a40 !important;
}
</style>
