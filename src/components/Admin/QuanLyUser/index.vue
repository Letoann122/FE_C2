<template>
  <div class="container-fluid um py-4">
    <!-- TITLE -->
    <div class="mb-4 border-bottom pb-3">
      <h3 class="fw-bold text-primary">
        <i class="fas fa-users me-2"></i> Quản lý Người dùng
      </h3>
      <p class="text-muted mb-0">Quản lý tài khoản và quyền hạn người dùng.</p>
    </div>

    <!-- SEARCH + FILTER -->
    <div class="d-flex gap-3 border-bottom pb-3 mb-4">
      <div class="position-relative">
        <input
          type="text"
          v-model="tim_kiem.noi_dung_tim"
          placeholder="Tìm kiếm người dùng..."
          class="form-control ps-5"
          style="width: 260px"
        />
        <i
          class="fas fa-search position-absolute top-50 translate-middle-y start-0 ms-2 text-muted"
        ></i>
      </div>

      <select
        class="form-select"
        v-model="tim_kiem.vai_tro"
        style="width: 150px"
      >
        <option value="">Tất cả vai trò</option>
        <option value="doctor">Bác sĩ</option>
        <option value="donor">Người hiến máu</option>
      </select>
    </div>

    <!-- TABLE -->
    <div class="table-responsive bg-white rounded shadow-sm">
      <table class="table align-middle table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Họ và Tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Ngày tham gia</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody v-if="users.length > 0">
          <tr v-for="(user, index) in users" :key="index">
            <td>{{ user.full_name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span
                v-if="user.role === 'doctor'"
                class="badge bg-primary"
                >Doctor</span
              >
              <span v-else class="badge bg-secondary">Donor</span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>

            <td class="text-center">
              <button
                class="btn btn-info btn-sm me-1"
                data-bs-toggle="modal"
                data-bs-target="#quickViewModal"
                @click="openQuickView(user)"
              >
                Xem
              </button>
              <button
                class="btn btn-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#editUserModal"
                @click="openEditModal(user)"
              >
                Sửa
              </button>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="5" class="text-center py-4 text-muted">
              Không có người dùng nào.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PAGINATION -->
    <div
      class="d-flex justify-content-center mt-4"
      v-if="pagination.totalPages > 1"
    >
      <ul class="pagination">
        <li
          class="page-item"
          :class="{ disabled: pagination.currentPage === 1 }"
        >
          <button
            class="page-link"
            @click="changePage(pagination.currentPage - 1)"
          >
            «
          </button>
        </li>

        <li
          v-for="p in pagination.totalPages"
          :key="p"
          class="page-item"
          :class="{ active: pagination.currentPage === p }"
        >
          <button class="page-link" @click="changePage(p)">{{ p }}</button>
        </li>

        <li
          class="page-item"
          :class="{
            disabled: pagination.currentPage === pagination.totalPages,
          }"
        >
          <button
            class="page-link"
            @click="changePage(pagination.currentPage + 1)"
          >
            »
          </button>
        </li>
      </ul>
    </div>

    <!-- ========================= QUICK VIEW MODAL ========================= -->
    <div class="modal fade" id="quickViewModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-md">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-secondary text-white">
            <h5 class="modal-title">
              <i class="fas fa-eye me-2"></i> Thông tin người dùng
            </h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body p-4" v-if="quickUser">
            <div class="row g-3">
              <div class="col-12"><b>Họ tên:</b> {{ quickUser.full_name }}</div>
              <div class="col-12"><b>Email:</b> {{ quickUser.email }}</div>
              <div class="col-md-6"><b>Vai trò:</b> {{ quickUser.role }}</div>
              <div class="col-md-6">
                <b>Nhóm máu:</b> {{ quickUser.blood_group || "—" }}
              </div>
              <div class="col-md-6">
                <b>Điện thoại:</b> {{ quickUser.phone }}
              </div>
              <div class="col-md-6">
                <b>Tình trạng:</b>
                {{ quickUser.tinh_trang === 2 ? "Bị khóa" : "Hoạt động" }}
              </div>
              <div class="col-12">
                <b>Địa chỉ:</b> {{ quickUser.address }}
              </div>
              <div class="col-12">
                <b>Ngày tham gia:</b> {{ formatDate(quickUser.created_at) }}
              </div>

              <template v-if="quickUser.role === 'donor'">
                <hr />
                <div class="col-md-6">
                  <b>Số lần hiến máu:</b> {{ quickUser.donation_count }}
                </div>
                <div class="col-md-6">
                  <b>Hiến gần nhất:</b>
                  {{
                    quickUser.last_donation_date
                      ? formatDate(quickUser.last_donation_date)
                      : "—"
                  }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================= EDIT MODAL ========================= -->
    <div class="modal fade" id="editUserModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-md">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="fas fa-user-edit me-2"></i> Cập nhật người dùng
            </h5>
            <button
              class="btn-close"
              data-bs-dismiss="modal"
              ref="editModalCloseBtn"
            ></button>
          </div>

          <div class="modal-body p-4" v-if="editingUser">
            <form @submit.prevent="saveChanges">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Họ và tên</label>
                  <input v-model="editingUser.full_name" class="form-control" />
                </div>

                <div class="col-12">
                  <label class="form-label">Email</label>
                  <input
                    type="email"
                    v-model="editingUser.email"
                    class="form-control"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Số điện thoại</label>
                  <input v-model="editingUser.phone" class="form-control" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Giới tính</label>
                  <select v-model="editingUser.gender" class="form-select">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>

                <div class="col-md-6" v-if="editingUser.role === 'donor'">
                  <label class="form-label">Ngày sinh</label>
                  <input
                    type="date"
                    v-model="editingUser.birthday"
                    class="form-control"
                  />
                </div>

                <div class="col-md-6" v-if="editingUser.role === 'donor'">
                  <label class="form-label">Nhóm máu</label>
                  <select v-model="editingUser.blood_group" class="form-select">
                    <option value="">— Chọn —</option>
                    <option
                      v-for="(b, i) in bloodGroups"
                      :key="i"
                      :value="b"
                      >{{ b }}</option
                    >
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label">Địa chỉ</label>
                  <input v-model="editingUser.address" class="form-control" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Tình trạng</label>
                  <select
                    v-model="editingUser.tinh_trang"
                    class="form-select"
                  >
                    <option :value="1">Hoạt động</option>
                    <option :value="2">Bị khóa</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Ngày tham gia</label>
                  <input
                    disabled
                    class="form-control"
                    :value="formatDate(editingUser.created_at)"
                  />
                </div>
              </div>

              <div class="d-flex justify-content-end mt-4">
                <button class="btn btn-secondary me-2" data-bs-dismiss="modal">
                  Hủy
                </button>
                <button class="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestAdmin from "../../../core/baseRequestAdmin";

export default {
  data() {
    return {
      users: [],
      quickUser: null,
      editingUser: null,

      bloodGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],

      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 15,
      },

      tim_kiem: { noi_dung_tim: "", vai_tro: "" },
    };
  },

  mounted() {
    this.loadData();
  },

  methods: {
    loadData() {
      baseRequestAdmin
        .get("/admin/users", {
          params: {
            page: this.pagination.currentPage,
            limit: this.pagination.limit,
            search: this.tim_kiem.noi_dung_tim,
            role: this.tim_kiem.vai_tro,
          },
        })
        .then((res) => {
          this.users = res.data.data || [];
          this.pagination.totalItems = res.data.totalItems;
          this.pagination.totalPages = res.data.totalPages;
        });
    },

    changePage(p) {
      if (p < 1 || p > this.pagination.totalPages) return;
      this.pagination.currentPage = p;
      this.loadData();
    },

    openQuickView(user) {
      this.quickUser = { ...user };
      // Modal mở bằng data-bs-toggle
    },

    openEditModal(user) {
      const genderFix = user.gender === "Nam" ? "male" : "female";
      this.editingUser = { ...user, gender: genderFix };
      // Modal mở bằng data-bs-toggle
    },

    saveChanges() {
      baseRequestAdmin
        .put(`/admin/users/${this.editingUser.id}`, this.editingUser)
        .then(() => {
          this.$toast.success("Cập nhật thành công!");
          this.$refs.editModalCloseBtn?.click(); // đóng modal qua button có data-bs-dismiss
          this.loadData();
        })
        .catch(() => this.$toast.error("Lỗi cập nhật!"));
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN");
    },
  },

  watch: {
    "tim_kiem.noi_dung_tim"() {
      this.pagination.currentPage = 1;
      this.loadData();
    },
    "tim_kiem.vai_tro"() {
      this.pagination.currentPage = 1;
      this.loadData();
    },
  },
};
</script>
