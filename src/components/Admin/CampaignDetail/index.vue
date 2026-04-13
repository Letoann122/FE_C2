<template>
  <div class="container-fluid py-4" v-if="loaded">
    <h3 class="fw-bold text-danger mb-3">
      <i class="bi bi-bullseye me-2"></i>Chi tiết chiến dịch
    </h3>

    <!-- ====================== THÔNG TIN CHIẾN DỊCH ====================== -->
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <div class="fw-bold fs-4">{{ campaign.title }}</div>

        <div class="text-muted mb-3">
          Tạo bởi: {{ campaign.creator?.full_name || "-" }}
        </div>

        <div class="mt-2">
          <span class="badge me-2" :class="campaign.is_emergency ? 'bg-danger' : 'bg-primary'">
            {{ campaign.is_emergency ? "Khẩn cấp" : "Định kỳ" }}
          </span>

          <span class="badge bg-success" v-if="campaign.approval_status==='approved'">Đã duyệt</span>
          <span class="badge bg-warning text-dark" v-else-if="campaign.approval_status==='pending'">Chờ duyệt</span>
          <span class="badge bg-danger" v-else>Từ chối</span>
        </div>

        <div class="mt-3">
          <div>
            <b>Thời gian:</b> {{ fmt(campaign.start_date) }} - {{ fmt(campaign.end_date) }}
          </div>

          <div>
            <b>Địa điểm:</b>
            <span v-if="campaign.locate_type==='custom'">{{ campaign.location || "-" }}</span>
            <span v-else>{{ campaign.donation_site?.name || "-" }}</span>
          </div>

          <div class="mt-2">
            <b>Mô tả:</b> {{ campaign.content || "Không có" }}
          </div>
        </div>

        <div class="mt-3">
          <router-link to="/admin/create-campaign" class="btn btn-secondary btn-sm">
            Quay lại
          </router-link>
        </div>
      </div>
    </div>

    <!-- ====================== DANH SÁCH ĐĂNG KÝ ====================== -->
    <div class="card shadow-sm border-0 mt-4">
      <div class="card-header bg-white fw-bold">
        <i class="bi bi-people-fill text-danger me-2"></i>
        Danh sách người hiến đã đăng ký ({{ registrations.length }})
      </div>

      <div class="card-body p-0">
        <div v-if="registrations.length === 0" class="text-center text-muted py-3">
          Chưa có người hiến nào đăng ký.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Họ tên</th>
                <th>Điện thoại</th>
                <th>Nhóm máu</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(r, i) in registrations" :key="r.id">
                <td>{{ i + 1 }}</td>
                <td>{{ r.donorName }}</td>
                <td>{{ r.donorPhone }}</td>
                <td>{{ r.bloodType }}</td>
                <td>{{ r.date }}</td>
                <td>{{ r.time }}</td>
                <td>
                  <span :class="['badge', r.statusClass]">
                    {{ r.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </div>

  <!-- LOADING -->
  <div v-else class="text-center py-5">
    <div class="spinner-border text-danger"></div>
  </div>
</template>

<script>
import baseRequestAdmin from "../../../core/baseRequestAdmin";

export default {
  name: "AdminCampaignDetailView",

  data() {
    return {
      loaded: false,
      campaign: {},
      registrations: [],
    };
  },

  async mounted() {
    const id = this.$route.params.id;

    // Load chi tiết chiến dịch
    const res = await baseRequestAdmin.get(`/admin/campaigns/${id}`);
    if (res.data?.status) this.campaign = res.data.data;

    // Load danh sách đăng ký
    const res2 = await baseRequestAdmin.get(`/admin/campaigns/${id}/appointments`);
    if (res2.data?.status) this.registrations = res2.data.data;

    this.loaded = true;
  },

  methods: {
    fmt(d) {
      if (!d) return "-";
      return new Date(d).toLocaleDateString("vi-VN");
    },
  },
};
</script>

<style scoped>
.table th {
  font-weight: 600;
}
</style>
