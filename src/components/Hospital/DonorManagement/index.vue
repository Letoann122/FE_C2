<template>
  <div class="container-fluid my-4 px-4">
    <div class="row g-4">
      <div class="col-lg-3">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <h5 class="fw-bold text-danger mb-3">
              <i class="bi bi-funnel-fill me-2"></i>
              Bộ lọc donor
            </h5>
            <label class="form-label small">Tìm theo tên hoặc số điện thoại</label>
            <input type="text" class="form-control mb-3" placeholder="Nhập tên hoặc số điện thoại"
              v-model="filters.keyword" @keyup.enter="applyFilter" />
            <label class="form-label small">Nhóm máu</label>
            <select class="form-select mb-3" v-model="filters.bloodType">
              <option value="">Tất cả</option>
              <option v-for="group in bloodGroups" :key="group" :value="group">
                {{ group }}
              </option>
            </select>
            <label class="form-label small">Ngày hiến từ</label>
            <input type="date" class="form-control mb-3" v-model="filters.fromDate" />
            <label class="form-label small">Ngày hiến đến</label>
            <input type="date" class="form-control mb-4" v-model="filters.toDate" />
            <div class="d-flex justify-content-end">
              <button class="btn btn-danger fw-bold" @click="applyFilter">
                Lọc dữ liệu
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-9">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="fw-bold mb-0">
                <i class="bi bi-people me-2"></i>Danh sách Donor
              </h5>

              <!-- Dùng data-bs-toggle/data-bs-target để mở modal -->
              <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#createDonorModal"
                @click="prepareCreateModal">
                <i class="bi bi-plus-lg me-2"></i>Thêm donor mới
              </button>
            </div>

            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>STT</th>
                    <th>Tên Donor</th>
                    <th>Nhóm máu</th>
                    <th>Địa chỉ</th>
                    <th>Liên hệ</th>
                    <th>Lần cuối</th>
                    <th>Số lần</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(value, index) in filteredDonors" :key="value.id">
                    <td>{{ index + 1 }}</td>
                    <td class="fw-bold">{{ value.name }}</td>
                    <td>
                      <span class="badge bg-danger-light text-danger p-2">
                        {{ value.bloodType }}
                      </span>
                    </td>
                    <td>{{ value.address }}</td>
                    <td>
                      <div>{{ value.phone }}</div>
                      <small class="text-muted">{{ value.email }}</small>
                    </td>
                    <td>
                      <span v-if="value.lastDonation !== 'Chưa hiến'">
                        {{ value.lastDonation }}
                      </span>
                      <span v-else class="text-muted small">Chưa hiến</span>
                    </td>
                    <td>{{ value.totalDonation }}</td>
                    <td>
                      <span :class="[
                        'badge rounded-pill px-3',
                        value.status === 'Hoạt động'
                          ? 'bg-success-light text-success'
                          : 'bg-warning-light text-warning',
                      ]">
                        {{ value.status }}
                      </span>
                    </td>
                    <td>
                      <RouterLink :to="`/Hospital/donor-management/${value.id}`" class="btn btn-sm btn-outline-danger">
                        Xem chi tiết
                      </RouterLink>
                    </td>
                  </tr>

                  <tr v-if="filteredDonors.length === 0">
                    <td colspan="9" class="text-center text-muted py-3">
                      Không tìm thấy donor nào
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TẠO DONOR -->
    <div class="modal fade" id="createDonorModal" tabindex="-1" aria-labelledby="createDonorModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold" id="createDonorModalLabel">
              <i class="bi bi-person-plus-fill text-danger me-2"></i> Tạo donor
              mới
            </h5>
            <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-bold">Họ tên *</label>
                <input type="text" class="form-control" v-model="newDonor.full_name" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Email *</label>
                <input type="email" class="form-control" v-model="newDonor.email" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Số điện thoại *</label>
                <input type="text" class="form-control" v-model="newDonor.phone" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Ngày sinh *</label>
                <input type="date" class="form-control" v-model="newDonor.birthday" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Giới tính *</label>
                <select class="form-select" v-model="newDonor.gender">
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Nhóm máu *</label>
                <select class="form-select" v-model="newDonor.blood_type_id">
                  <option disabled value="">Chọn nhóm máu</option>
                  <option v-for="bt in bloodTypeList" :key="bt.id" :value="bt.id">
                    {{ bt.display }}
                  </option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label fw-bold">Địa chỉ *</label>
                <input type="text" class="form-control" v-model="newDonor.address" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" data-bs-dismiss="modal" :disabled="creating">
              Hủy
            </button>
            <!-- Nút tạo: KHÔNG data-bs-dismiss, chỉ đóng khi API thành công -->
            <button class="btn btn-danger fw-bold" type="button" @click="createNewDonor" :disabled="creating">
              <span v-if="!creating">
                <i class="bi bi-check2-circle me-1"></i> Tạo donor
              </span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2"></span>
                Đang tạo...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "QuanLyDonor",
  data() {
    return {
      donors: [],
      filteredDonors: [],
      creating: false,
      loadingTable: false,
      bloodGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      bloodTypeList: [
        { id: 1, display: "A+" },
        { id: 2, display: "A-" },
        { id: 3, display: "B+" },
        { id: 4, display: "B-" },
        { id: 5, display: "AB+" },
        { id: 6, display: "AB-" },
        { id: 7, display: "O+" },
        { id: 8, display: "O-" },
      ],
      newDonor: {
        full_name: "",
        email: "",
        phone: "",
        birthday: "",
        gender: "Nam",
        address: "",
        blood_type_id: "",
      },
      filters: {
        keyword: "",
        bloodType: "",
        fromDate: "",
        toDate: "",
      },
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    toDateOnlyStr(val) {
      if (!val || val === "Chưa hiến") return null;
      return String(val).slice(0, 10);
    },

    validateNewDonor() {
      const d = this.newDonor;
      if (!d.full_name.trim()) return "Vui lòng nhập họ tên.";
      if (!d.email.trim()) return "Vui lòng nhập email.";
      if (!d.phone.trim()) return "Vui lòng nhập số điện thoại.";
      if (!d.birthday) return "Vui lòng chọn ngày sinh.";
      if (!d.gender) return "Vui lòng chọn giới tính.";
      if (!d.blood_type_id) return "Vui lòng chọn nhóm máu.";
      if (!d.address.trim()) return "Vui lòng nhập địa chỉ.";
      return null;
    },

    resetNewDonor() {
      this.newDonor = {
        full_name: "",
        email: "",
        phone: "",
        birthday: "",
        gender: "Nam",
        address: "",
        blood_type_id: "",
      };
    },

    hideCreateModal() {
      const el = document.getElementById("createDonorModal");
      // chỉ dùng Bootstrap JS, không tạo thêm instance mới
      if (!el || typeof bootstrap === "undefined") return;
      const modal = bootstrap.Modal.getInstance(el); // lấy instance do data-bs-toggle tạo
      if (modal) modal.hide();
    },

    async loadData() {
      try {
        this.loadingTable = true;
        const res = await baseRequestDoctor.get("doctor/donors");
        if (res.data?.status) {
          this.donors = res.data.data || [];
          this.filteredDonors = this.donors;
        } else {
          this.$toast?.error(
            res.data?.message || "Không tải được danh sách donor!"
          );
        }
      } catch (e) {
        this.$toast?.error("Lỗi tải danh sách donor!");
      } finally {
        this.loadingTable = false;
      }
    },

    applyFilter() {
      let result = [...this.donors];

      if (this.filters.keyword.trim()) {
        const raw = this.filters.keyword.trim();
        const key = raw.toLowerCase();
        result = result.filter(
          (d) =>
            String(d.name || "")
              .toLowerCase()
              .includes(key) || String(d.phone || "").includes(raw)
        );
      }

      if (this.filters.bloodType) {
        result = result.filter((d) => d.bloodType === this.filters.bloodType);
      }

      const from = this.filters.fromDate || null;
      const to = this.filters.toDate || null;

      if (from) {
        result = result.filter((d) => {
          const last = this.toDateOnlyStr(d.lastDonation);
          return last && last >= from;
        });
      }

      if (to) {
        result = result.filter((d) => {
          const last = this.toDateOnlyStr(d.lastDonation);
          return last && last <= to;
        });
      }

      this.filteredDonors = result;
    },

    prepareCreateModal() {
      this.resetNewDonor();
    },

    async createNewDonor() {
      const err = this.validateNewDonor();
      if (err) return this.$toast?.warning(err);

      try {
        this.creating = true;
        const payload = {
          ...this.newDonor,
          full_name: this.newDonor.full_name.trim(),
          email: this.newDonor.email.trim(),
          phone: this.newDonor.phone.trim(),
          address: this.newDonor.address.trim(),
        };

        const res = await baseRequestDoctor.post(
          "doctor/donors/create",
          payload
        );

        if (res.data?.status) {
          this.$toast?.success(res.data?.message || "Tạo donor thành công!");
          await this.loadData(); // refresh bảng
          this.hideCreateModal(); // đóng modal đúng cách
          this.resetNewDonor(); // clear form
          return;
        }

        this.$toast?.error(res.data?.message || "Tạo donor thất bại!");
      } catch (e) {
        this.$toast?.error("Lỗi tạo donor!");
      } finally {
        this.creating = false;
      }
    },
  },
};
</script>

<style scoped>
.badge.bg-danger-light {
  background-color: #fde2e2 !important;
  color: #c81e1e !important;
}

.badge.bg-success-light {
  background-color: #def7ec !important;
  color: #03543f !important;
}

.badge.bg-warning-light {
  background-color: #fdf3e2 !important;
  color: #723b13 !important;
}
</style>
