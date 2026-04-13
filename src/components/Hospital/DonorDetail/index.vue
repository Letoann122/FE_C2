<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Chi tiết Donor</h2>
        <p class="text-muted mb-0">Thông tin đầy đủ và lịch sử hiến máu.</p>
      </div>

      <!-- ✅ Return -->
      <router-link to="/Hospital/donor-management" class="btn btn-secondary">
        <i class="bi bi-arrow-left me-2"></i>Quay lại
      </router-link>
    </div>

    <div v-if="!loaded" class="text-center py-5">
      <div class="spinner-border text-danger"></div>
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-4">
        <div class="card text-center shadow-sm">
          <div class="bg-danger text-white p-3">
            <h5 class="fw-bold mb-0">{{ donor.name }}</h5>
            <p class="mb-0 small">ID: {{ donor.id }}</p>
            <span class="badge bg-light text-danger">{{ donor.bloodType }}</span>
          </div>

          <div class="card-body text-start">
            <h6 class="text-secondary text-uppercase mb-2">Thông tin cá nhân</h6>
            <ul class="list-unstyled small">
              <li><i class="bi bi-calendar-event me-2"></i> Ngày sinh: {{ donor.birthday }}</li>
              <li><i class="bi bi-gender-ambiguous me-2"></i> Giới tính: {{ donor.gender }}</li>
              <li><i class="bi bi-telephone me-2"></i> SĐT: {{ donor.phone }}</li>
              <li><i class="bi bi-envelope me-2"></i> Email: {{ donor.email }}</li>
              <li><i class="bi bi-geo-alt me-2"></i> Địa chỉ: {{ donor.address }}</li>
            </ul>
            <hr />
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted small">Trạng thái</span>
              <span class="badge bg-success" v-if="donor.status === 'Hoạt động'">Hoạt động</span>
              <span class="badge bg-warning text-dark" v-else>Tạm ngừng</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="card mb-4 shadow-sm">
          <div class="card-header bg-white">
            <h6 class="fw-bold mb-0">
              <i class="bi bi-calendar-heart-fill text-danger me-2"></i>
              Lịch sử hiến máu
            </h6>
          </div>

          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Ngày hiến</th>
                    <th>Địa điểm</th>
                    <th>Bệnh viện / Chiến dịch</th>
                    <th>Thể tích</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(item, i) in history" :key="i">
                    <td>{{ item.date }}</td>
                    <!-- ✅ fallback nếu data cũ bị trống -->
                    <td>{{ item.site || item.location || "—" }}</td>
                    <td>{{ item.hospital || item.campaign_title || "—" }}</td>
                    <td>{{ item.volume || 0 }} ml</td>
                  </tr>

                  <tr v-if="history.length === 0">
                    <td colspan="4" class="text-center text-muted py-3">
                      Chưa có lịch sử hiến máu
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card mb-4 shadow-sm" v-if="lastDonation">
          <div class="card-header bg-white">
            <h6 class="fw-bold mb-0">
              <i class="bi bi-heart-pulse-fill text-danger me-2"></i>
              Lần hiến gần nhất
            </h6>
          </div>

          <div class="card-body">
            <ul class="list-group list-group-flush small">
              <li class="list-group-item d-flex justify-content-between">
                <strong>Ngày hiến:</strong>
                <span>{{ lastDonation.date }}</span>
              </li>

              <!-- ✅ nếu là chiến dịch: site = location -->
              <li class="list-group-item d-flex justify-content-between">
                <strong>Địa điểm:</strong>
                <span>{{ lastDonation.site || lastDonation.location || "—" }}</span>
              </li>

              <!-- ✅ nếu là chiến dịch: hospital = tên chiến dịch -->
              <li class="list-group-item d-flex justify-content-between">
                <strong>Bệnh viện / Chiến dịch:</strong>
                <span>{{ lastDonation.hospital || lastDonation.campaign_title || "—" }}</span>
              </li>

              <li class="list-group-item d-flex justify-content-between">
                <strong>Thể tích:</strong>
                <span>{{ lastDonation.volume || 0 }} ml</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>


<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "DonorDetail",
  data() {
    return {
      loaded: false,
      donor: {},
      history: [],
      lastDonation: null,
    };
  },
  mounted() {
    const id = this.$route.params.id;
    this.loadDetail(id);
  },
  methods: {
    loadDetail(id) {
      baseRequestDoctor.get(`doctor/donors/${id}`).then((res) => {
        if (res.data.status) {
          this.donor = res.data.data.donor;
          this.history = res.data.data.history;
          this.lastDonation = res.data.data.lastDonation;
          this.loaded = true;
        }
      });
    },
  },
};
</script>
