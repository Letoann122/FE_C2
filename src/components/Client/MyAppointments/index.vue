<template>
  <div class="container py-5 my-appointments-page">
    <div class="mb-4 border-bottom pb-3">
      <h3 class="fw-bold text-danger">
        <i class="bi bi-calendar-check me-2"></i>Lịch hẹn của tôi
      </h3>
      <p class="text-muted mb-0">
        Theo dõi tất cả lịch hẹn hiến máu, xem chi tiết, thẻ check-in và hàng đợi.
      </p>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card">
          <div class="card-body">
            <div class="small text-muted">Tổng lịch hẹn</div>
            <div class="display-6 fw-bold text-danger">{{ appointments.length }}</div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card">
          <div class="card-body">
            <div class="small text-muted">Đang chờ duyệt</div>
            <div class="display-6 fw-bold text-warning">{{ countByStatus("REQUESTED") }}</div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card">
          <div class="card-body">
            <div class="small text-muted">Đã duyệt</div>
            <div class="display-6 fw-bold text-success">{{ countByStatus("APPROVED") }}</div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card">
          <div class="card-body">
            <div class="small text-muted">Hoàn thành</div>
            <div class="display-6 fw-bold text-primary">{{ countByStatus("COMPLETED") }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 class="fw-bold mb-0">Danh sách lịch hẹn</h5>

          <div class="d-flex gap-2">
            <select class="form-select" v-model="filterStatus" style="width: 180px">
              <option value="">Tất cả trạng thái</option>
              <option value="REQUESTED">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="BOOKED">Đã đặt</option>
              <option value="CHECKED_IN">Đã check-in</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div v-if="filteredAppointments.length === 0" class="text-muted small">
          Không có lịch hẹn phù hợp.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Mã lịch</th>
                <th>Ngày hẹn</th>
                <th>Điểm hiến</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th class="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in filteredAppointments" :key="a.id">
                <td>
                  <span class="badge bg-light text-dark border">
                    {{ a.appointment_code }}
                  </span>
                </td>
                <td>
                  <div class="fw-semibold">{{ formatDate(a.scheduled_at) }}</div>
                  <div class="small text-muted">{{ a.time_slot }}</div>
                </td>
                <td>
                  <div class="fw-semibold">{{ a.site_name }}</div>
                  <div class="small text-muted">{{ a.address }}</div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">
                    {{ a.type === "campaign" ? "Chiến dịch" : "Điểm cố định" }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="statusBadgeClass(a.status)">
                    {{ statusLabel(a.status) }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="d-flex justify-content-end gap-2 flex-wrap">
                    <button class="btn btn-sm btn-outline-secondary" @click="goDetail(a)">
                      Xem chi tiết
                    </button>

                    <button
                      v-if="canCancel(a)"
                      class="btn btn-sm btn-outline-danger"
                      @click="cancelAppointment(a)"
                    >
                      Hủy
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-4 d-flex justify-content-end">
      <router-link to="/register-blooddonation" class="btn btn-danger">
        <i class="bi bi-plus-circle me-1"></i>Đặt lịch mới
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "MyAppointmentsPage",

  data() {
    return {
      filterStatus: "",
      appointments: [
        {
          id: 1,
          appointment_code: "SBDS-8842",
          scheduled_at: "2026-04-15T08:30:00",
          time_slot: "08:30 - 11:30",
          site_name: "Bệnh viện Đà Nẵng",
          address: "124 Hải Phòng, Đà Nẵng",
          type: "site",
          status: "APPROVED",
        },
        {
          id: 2,
          appointment_code: "SBDS-8891",
          scheduled_at: "2026-04-20T13:00:00",
          time_slot: "13:00 - 17:00",
          site_name: "Chiến dịch Hiến máu Thanh niên",
          address: "Nhà văn hoá Thanh niên, Đà Nẵng",
          type: "campaign",
          status: "CHECKED_IN",
        },
        {
          id: 3,
          appointment_code: "SBDS-8720",
          scheduled_at: "2026-04-10T07:00:00",
          time_slot: "07:00 - 11:00",
          site_name: "Bệnh viện C Đà Nẵng",
          address: "122 Hải Phòng, Đà Nẵng",
          type: "site",
          status: "COMPLETED",
        },
      ],
    };
  },

  computed: {
    filteredAppointments() {
      if (!this.filterStatus) return this.appointments;
      return this.appointments.filter((item) => item.status === this.filterStatus);
    },
  },

  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN");
    },

    countByStatus(status) {
      return this.appointments.filter((item) => item.status === status).length;
    },

    statusLabel(status) {
      if (status === "REQUESTED") return "Chờ duyệt";
      if (status === "APPROVED") return "Đã duyệt";
      if (status === "BOOKED") return "Đã đặt";
      if (status === "CHECKED_IN") return "Đã check-in";
      if (status === "COMPLETED") return "Hoàn thành";
      if (status === "CANCELLED") return "Đã hủy";
      if (status === "REJECTED") return "Từ chối";
      return status;
    },

    statusBadgeClass(status) {
      if (status === "REQUESTED") return "bg-warning text-dark";
      if (status === "APPROVED") return "bg-success";
      if (status === "BOOKED") return "bg-info text-dark";
      if (status === "CHECKED_IN") return "bg-primary";
      if (status === "COMPLETED") return "bg-dark";
      if (status === "CANCELLED") return "bg-secondary";
      if (status === "REJECTED") return "bg-danger";
      return "bg-light text-dark border";
    },

    canCancel(item) {
      return ["REQUESTED", "APPROVED", "BOOKED"].includes(item.status);
    },

    cancelAppointment(item) {
      alert(`Mock hủy lịch: ${item.appointment_code}`);
    },

    goDetail(item) {
      this.$router.push(`/my-appointments/${item.id}`);
    },
  },
};
</script>

<style scoped>
.stat-card {
  min-height: 120px;
}
</style>