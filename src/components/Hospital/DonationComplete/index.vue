<template>
  <div class="container py-4">
    <div class="row g-4">
      <div class="col-lg-4">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <h5 class="mb-3 fw-bold text-danger">
              <i class="bi bi-search-heart me-2"></i>
              Tìm lịch đã duyệt
            </h5>
            <div class="mb-3">
              <label class="form-label small">Mã lịch hiến máu</label>
              <input type="text" class="form-control" placeholder="Nhập mã lịch hiến máu" v-model="loc_lich.ma_lich" />
            </div>
            <div class="mb-3">
              <label class="form-label small">Từ ngày</label>
              <input type="date" class="form-control" v-model="loc_lich.from_date" />
            </div>
            <div class="mb-3">
              <label class="form-label small">Đến ngày</label>
              <input type="date" class="form-control" v-model="loc_lich.to_date" />
            </div>
            <div class="d-flex justify-content-end">
              <button class="btn btn-danger" @click="locDanhSach" :disabled="dang_tai">
                <span v-if="dang_tai" class="spinner-border spinner-border-sm me-1"></span>
                Lọc lịch
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="col-lg-8">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-header bg-white border-0">
            <h5 class="fw-bold text-danger mb-1">
              <i class="bi bi-droplet-half me-2"></i> Ghi nhận hiến máu
            </h5>
          </div>

          <div class="card-body p-0">
            <!-- loading -->
            <div v-if="dang_tai" class="p-4 text-center">
              <div class="spinner-border text-danger"></div>
            </div>

            <!-- table -->
            <div v-else class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã lịch</th>
                    <th>Người hiến máu</th>
                    <th>Ngày / Giờ</th>
                    <th>Trạng thái</th>
                    <th class="text-end">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(value, index) in paginatedData" :key="value.id">
                    <td>{{ index + 1 + (page - 1) * per_page }}</td>
                    <td>
                      <span class="badge bg-light text-dark">{{
                        value.appointment_code
                        }}</span>
                    </td>

                    <td>
                      <strong>{{ value.donor_name }}</strong>
                      <div class="small text-muted">
                        {{ value.donor_phone }}
                      </div>
                    </td>

                    <td>
                      {{ value.scheduled_date }}
                      <div class="small text-muted">{{ value.time_range }}</div>
                    </td>

                    <td>
                      <span class="badge bg-primary px-3">Đã duyệt</span>
                    </td>

                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-success" @click="moModal(value)">
                        Ghi nhận
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- PAGINATION -->
            <div class="d-flex justify-content-between align-items-center p-3">
              <button class="btn btn-outline-secondary btn-sm" :disabled="page === 1" @click="page--">
                « Trang trước
              </button>

              <span>Trang {{ page }} / {{ totalPages }}</span>

              <button class="btn btn-outline-secondary btn-sm" :disabled="page === totalPages" @click="page++">
                Trang sau »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal fade" id="modalGhiNhan" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4">
          <div class="modal-header">
            <h5 class="fw-bold mb-0">
              <i class="bi bi-check2-circle text-success me-2"></i> Ghi nhận
              hiến máu
            </h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <small class="text-muted">
              Mã lịch: <strong>{{ modal_data.appointment_code }}</strong>
            </small>

            <div class="fw-semibold">
              {{ modal_data.donor_name }} – {{ modal_data.scheduled_date }} ({{
                modal_data.time_range
              }})
            </div>

            <div class="small text-muted mb-3">
              {{ modal_data.donation_site_name }} –
              {{ modal_data.hospital_name }}
            </div>

            <hr />

            <div class="row g-3">
              <div class="col-lg-6">
                <h6 class="fw-bold small text-muted">Thông tin đăng ký</h6>

                <div><small class="text-muted">Nhóm máu khai báo</small></div>
                <div>{{ modal_data.blood_group }}</div>

                <div class="mt-2">
                  <small class="text-muted">Số lượng đăng ký</small>
                  <div>{{ modal_data.preferred_volume_ml }} ml</div>
                </div>
              </div>

              <div class="col-lg-6">
                <h6 class="fw-bold small text-muted">Thông tin thực tế</h6>

                <div class="mb-2">
                  <label class="form-label small">Nhóm máu thực tế *</label>
                  <select class="form-select" v-model="form.nhom_mau">
                    <option disabled value="">Chọn nhóm máu</option>
                    <option v-for="m in nhom_mau_list" :key="m">{{ m }}</option>
                  </select>
                </div>

                <div class="mb-2">
                  <label class="form-label small">Số lượng (ml) *</label>
                  <input type="number" class="form-control" v-model.number="form.so_ml" min="50" step="10" />
                </div>

                <div class="mb-2">
                  <label class="form-label small">Thời điểm lấy máu *</label>
                  <input type="datetime-local" class="form-control" v-model="form.thoi_diem_lay" />
                </div>

                <div class="form-check mt-2">
                  <input class="form-check-input" type="checkbox" v-model="form.da_sang_loc" />
                  <label class="form-check-label small">Đủ điều kiện sử dụng</label>
                </div>
              </div>
            </div>

            <hr />
            <label class="form-label small">Ghi chú</label>
            <textarea class="form-control" rows="2" v-model="form.ghi_chu"></textarea>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal" :disabled="dang_luu">
              Hủy
            </button>
            <button class="btn btn-success" :disabled="dang_luu" @click="luu">
              <span v-if="dang_luu" class="spinner-border spinner-border-sm me-1"></span>
              Xác nhận hiến máu
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
  data() {
    return {
      loc_lich: { ma_lich: "", from_date: "", to_date: "" },
      danh_sach_lich: [],
      total_items: 0,
      dang_tai: false,
      page: 1,
      per_page: 10,

      modal_data: {},
      form: {
        nhom_mau: "",
        so_ml: null,
        thoi_diem_lay: "",
        da_sang_loc: true,
        ghi_chu: "",
      },

      nhom_mau_list: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      dang_luu: false,
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.total_items / this.per_page);
    },
    paginatedData() {
      const start = (this.page - 1) * this.per_page;
      return this.danh_sach_lich.slice(start, start + this.per_page);
    },
  },

  mounted() {
    this.taiDanhSach();
  },

  methods: {
    taiDanhSach(params = {}) {
      this.dang_tai = true;
      this.page = 1;

      baseRequestDoctor
        .get("doctor/donation-appointments/approved", { params })
        .then((res) => {
          if (res.data?.status) {
            this.danh_sach_lich = res.data.data || [];
            this.total_items = this.danh_sach_lich.length;
          }
        })
        .finally(() => (this.dang_tai = false));
    },

    locDanhSach() {
      const p = {};
      if (this.loc_lich.ma_lich) p.appointment_code = this.loc_lich.ma_lich;
      if (this.loc_lich.from_date) p.from_date = this.loc_lich.from_date;
      if (this.loc_lich.to_date) p.to_date = this.loc_lich.to_date;
      this.taiDanhSach(p);
    },

    moModal(row) {
      this.modal_data = row;
      this.form.nhom_mau = row.blood_group;
      this.form.so_ml = row.preferred_volume_ml ?? 350;
      this.form.thoi_diem_lay = this.defaultDatetime(row.scheduled_date);
      new bootstrap.Modal(document.getElementById("modalGhiNhan")).show();
    },

    defaultDatetime(dateStr) {
      const now = new Date();
      const [y, m, d] = dateStr.split("-");
      return `${y}-${m}-${d}T${String(now.getHours()).padStart(
        2,
        "0"
      )}:${String(now.getMinutes()).padStart(2, "0")}`;
    },

    luu() {
      if (!this.form.nhom_mau)
        return this.$toast.error("Vui lòng chọn nhóm máu!");
      if (!this.form.so_ml) return this.$toast.error("Số ml không hợp lệ!");
      if (!this.form.thoi_diem_lay)
        return this.$toast.error("Chưa chọn thời điểm!");

      this.dang_luu = true;

      const payload = {
        appointment_id: this.modal_data.id,
        blood_group: this.form.nhom_mau,
        volume_ml: this.form.so_ml,
        collected_at: this.form.thoi_diem_lay,
        screened_ok: this.form.da_sang_loc ? 1 : 0,
        notes: this.form.ghi_chu || "",
      };

      baseRequestDoctor
        .post("doctor/donations/complete", payload)
        .then((res) => {
          if (res.data?.status) {
            this.$toast.success("Ghi nhận thành công!");
            bootstrap.Modal.getInstance(
              document.getElementById("modalGhiNhan")
            ).hide();
            this.taiDanhSach();
          }
        })
        .catch(() => this.$toast.error("Lỗi server!"))
        .finally(() => (this.dang_luu = false));
    },
  },
};
</script>
