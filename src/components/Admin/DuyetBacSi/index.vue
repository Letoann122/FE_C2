<template>
  <div class="container py-5">
    <div class="mb-4 border-bottom pb-3">
      <h3 class="fw-bold text-danger">
        <i class="bi bi-person-badge me-2"></i> Xét duyệt bác sĩ đăng ký
      </h3>
      <p class="text-muted mb-0">
        Danh sách bác sĩ đang chờ phê duyệt để tham gia hệ thống hiến máu.
      </p>
    </div>

    <div class="mb-4 border-bottom">
      <div class="col-md-12 col-lg-3 d-flex gap-1 mb-4">
        <input type="text" v-model="tim_kiem.noi_dung_tim" class="form-control" placeholder="Nhập tên bác sĩ..." />
        <button class="btn btn-primary text-nowrap" @click="searchDoctor">
          Tìm kiếm
        </button>
      </div>
    </div>

    <div class="table-responsive bg-white rounded shadow-sm">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Ngày sinh</th>
            <th>Địa chỉ</th>
            <th class="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(doctor, index) in list_bac_si" :key="doctor.id">
            <td>{{ index + 1 }}</td>
            <td>{{ doctor.full_name }}</td>
            <td>{{ doctor.email }}</td>
            <td>{{ formatDate(doctor.birthday) }}</td>
            <td>{{ doctor.address }}</td>
            <td class="text-center">
              <button class="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#approveModal"
                @click="Object.assign(selectedDoctor, doctor)">
                Duyệt
              </button>
              <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#rejectModal"
                @click="Object.assign(selectedDoctor, doctor)">
                Từ chối
              </button>
            </td>
          </tr>
          <tr v-if="list_bac_si.length === 0">
            <td colspan="6" class="text-center text-muted py-4">
              Không có bác sĩ nào đang chờ duyệt.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="text-start mt-4">
      <small class="text-muted">
        Tổng số bác sĩ chờ duyệt: {{ list_bac_si.length }}
      </small>
    </div>
  </div>

  <div class="modal fade" id="approveModal" tabindex="-1" aria-labelledby="approveModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title" id="approveModalLabel">Xác nhận duyệt bác sĩ</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p>
            Bạn có chắc chắn muốn <b>DUYỆT</b> bác sĩ
            <strong>{{ selectedDoctor.full_name }}</strong> không?
          </p>
          <ul class="list-unstyled">
            <li><b>Email:</b> {{ selectedDoctor.email }}</li>
            <li><b>Ngày sinh:</b> {{ formatDate(selectedDoctor.birthday) }}</li>
            <li><b>Địa chỉ:</b> {{ selectedDoctor.address }}</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal"
            @click="confirmApprove(selectedDoctor.id)">
            Xác nhận duyệt
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="rejectModal" tabindex="-1" aria-labelledby="rejectModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-secondary text-white">
          <h5 class="modal-title" id="rejectModalLabel">Xác nhận từ chối bác sĩ</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p>
            Bạn có chắc chắn muốn <b>TỪ CHỐI</b> bác sĩ
            <strong>{{ selectedDoctor.full_name }}</strong> không?
          </p>
          <ul class="list-unstyled">
            <li><b>Email:</b> {{ selectedDoctor.email }}</li>
            <li><b>Ngày sinh:</b> {{ formatDate(selectedDoctor.birthday) }}</li>
            <li><b>Địa chỉ:</b> {{ selectedDoctor.address }}</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
            @click="confirmReject(selectedDoctor.id)">
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestAdmin from "../../../core/baseRequestAdmin";

export default {
  name: "DoctorApproval",
  data() {
    return {
      list_bac_si: [],
      tim_kiem: { noi_dung_tim: "" },
      selectedDoctor: {},
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      baseRequestAdmin
        .get("admin/doctors/pending")
        .then((res) => {
          if (res.data.status) {
            this.list_bac_si = res.data.data;
          } else {
            this.$toast.error(res.data.message || "Không thể tải danh sách bác sĩ!");
          }
        })
        .catch((error) => {
          const message =
            error.response?.data?.message || "Không thể tải danh sách bác sĩ!";
          this.$toast.error(message);
        });
    },

    searchDoctor() {
      const keyword = this.tim_kiem.noi_dung_tim.trim();
      if (!keyword) {
        this.$toast.info("Vui lòng nhập tên bác sĩ cần tìm!");
        return;
      }
      baseRequestAdmin
        .post("admin/doctors/search", this.tim_kiem)
        .then((res) => {
          if (res.data.status) {
            this.list_bac_si = res.data.data;
          } else {
            this.list_bac_si = [];
            this.$toast.info("Không tìm thấy bác sĩ phù hợp!");
          }
        })
        .catch((error) => {
          const message =
            error.response?.data?.message || "Lỗi khi tìm kiếm bác sĩ!";
          this.$toast.error(message);
        });
    },

    confirmApprove(id) {
      baseRequestAdmin
        .put(`admin/doctors/${id}/approve`)
        .then((res) => {
          if (res.data.status) {
            this.$toast.success("Duyệt bác sĩ thành công!");
            this.loadData();
          } else {
            this.$toast.error(res.data.message || "Không thể duyệt bác sĩ!");
          }
        })
        .catch((error) => {
          const message =
            error.response?.data?.message || "Lỗi khi duyệt bác sĩ!";
          this.$toast.error(message);
        });
    },

    confirmReject(id) {
      baseRequestAdmin
        .put(`admin/doctors/${id}/reject`)
        .then((res) => {
          if (res.data.status) {
            this.$toast.info("Đã từ chối bác sĩ.");
            this.loadData();
          } else {
            this.$toast.error(res.data.message || "Không thể từ chối bác sĩ!");
          }
        })
        .catch((error) => {
          const message =
            error.response?.data?.message || "Lỗi khi từ chối bác sĩ!";
          this.$toast.error(message);
        });
    },

    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("vi-VN");
    },
  },
};
</script>

<style scoped>
.table {
  font-size: 15px;
}

.modal-content {
  border-radius: 1rem;
}
</style>
