<template>
  <div class="container py-4">
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="slot-monitor-card">
          <div class="small text-muted">Ca sáng 07:00 - 11:00</div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="fw-bold fs-5">
              {{ slotMonitor.morning.current_count }}/{{ slotMonitor.morning.slot_capacity }}
            </div>
            <span class="badge" :class="slotBadgeClass(slotMonitor.morning.percent)">
              {{ slotMonitor.morning.percent }}%
            </span>
          </div>
          <div class="progress mt-2" style="height: 6px">
            <div
              class="progress-bar bg-danger"
              :style="{ width: `${Math.min(slotMonitor.morning.percent, 100)}%` }"
            ></div>
          </div>
          <div class="small text-muted mt-1">
            Completed ca sáng: {{ completedBySlot("morning") }}
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="slot-monitor-card">
          <div class="small text-muted">Ca chiều 13:00 - 17:00</div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="fw-bold fs-5">
              {{ slotMonitor.afternoon.current_count }}/{{ slotMonitor.afternoon.slot_capacity }}
            </div>
            <span class="badge" :class="slotBadgeClass(slotMonitor.afternoon.percent)">
              {{ slotMonitor.afternoon.percent }}%
            </span>
          </div>
          <div class="progress mt-2" style="height: 6px">
            <div
              class="progress-bar bg-primary"
              :style="{ width: `${Math.min(slotMonitor.afternoon.percent, 100)}%` }"
            ></div>
          </div>
          <div class="small text-muted mt-1">
            Completed ca chiều: {{ completedBySlot("afternoon") }}
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="slot-monitor-card">
          <div class="small text-muted">Tổng slot hôm nay</div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="fw-bold fs-5">
              {{ slotMonitor.total.current_count }}/{{ slotMonitor.total.slot_capacity }}
            </div>
            <span class="badge" :class="slotBadgeClass(slotMonitor.total.percent)">
              {{ slotMonitor.total.percent }}%
            </span>
          </div>
          <div class="progress mt-2" style="height: 6px">
            <div
              class="progress-bar bg-success"
              :style="{ width: `${Math.min(slotMonitor.total.percent, 100)}%` }"
            ></div>
          </div>
          <div class="small text-muted mt-1">
            Realtime slot monitor
          </div>
        </div>
      </div>
    </div>

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
              <input
                type="text"
                class="form-control"
                placeholder="Nhập mã lịch hiến máu"
                v-model="loc_lich.ma_lich"
              />
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

      <div class="col-lg-8">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-header bg-white border-0">
            <h5 class="fw-bold text-danger mb-1">
              <i class="bi bi-droplet-half me-2"></i> Ghi nhận hiến máu
            </h5>
          </div>

          <div class="card-body p-0">
            <div v-if="dang_tai" class="p-4 text-center">
              <div class="spinner-border text-danger"></div>
            </div>

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
                  <tr v-if="paginatedData.length === 0">
                    <td colspan="6" class="text-center text-muted py-4">
                      Không có lịch phù hợp.
                    </td>
                  </tr>

                  <tr v-for="(value, index) in paginatedData" :key="value.id">
                    <td>{{ index + 1 + (page - 1) * per_page }}</td>

                    <td>
                      <span class="badge bg-light text-dark">
                        {{ value.appointment_code }}
                      </span>
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

            <div class="d-flex justify-content-between align-items-center p-3">
              <button class="btn btn-outline-secondary btn-sm" :disabled="page === 1" @click="page--">
                « Trang trước
              </button>

              <span>Trang {{ page }} / {{ totalPages || 1 }}</span>

              <button class="btn btn-outline-secondary btn-sm" :disabled="page === totalPages || totalPages === 0" @click="page++">
                Trang sau »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="modalGhiNhan" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4">
          <div class="modal-header">
            <h5 class="fw-bold mb-0">
              <i class="bi bi-check2-circle text-success me-2"></i> Ghi nhận
              hiến máu
            </h5>
            <button class="btn-close" data-bs-dismiss="modal" :disabled="dang_luu"></button>
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
import socket from "../../../core/socket";

export default {
  data() {
    return {
      loc_lich: { ma_lich: "", from_date: "", to_date: "" },
      danh_sach_lich: [],
      slots: [],
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

    slotMonitor() {
      const monitor = {
        morning: this.emptySlotMonitor(),
        afternoon: this.emptySlotMonitor(),
        total: this.emptySlotMonitor(),
      };

      this.slots.forEach((slot) => {
        const key = String(slot.start_time || "").slice(0, 5) < "12:00"
          ? "morning"
          : "afternoon";

        monitor[key].current_count += Number(slot.current_count || 0);
        monitor[key].slot_capacity += Number(slot.slot_capacity || 0);
        monitor[key].available_count += Number(slot.available_count || 0);

        monitor.total.current_count += Number(slot.current_count || 0);
        monitor.total.slot_capacity += Number(slot.slot_capacity || 0);
        monitor.total.available_count += Number(slot.available_count || 0);
      });

      ["morning", "afternoon", "total"].forEach((key) => {
        const item = monitor[key];

        item.percent =
          item.slot_capacity > 0
            ? Math.round((item.current_count / item.slot_capacity) * 100)
            : 0;
      });

      return monitor;
    },
  },

  mounted() {
    this.taiDanhSach();
    this.loadSlots();
    this.initSocket();
  },

  beforeUnmount() {
    socket.off("slot_capacity_updated", this.handleSlotRealtime);
    socket.off("appointment_updated", this.handleAppointmentRealtime);
  },

  methods: {
    initSocket() {
      if (!socket.connected) socket.connect();

      socket.on("slot_capacity_updated", this.handleSlotRealtime);
      socket.on("appointment_updated", this.handleAppointmentRealtime);
    },

    handleSlotRealtime(payload) {
      if (!payload?.slot_id) return;

      const index = this.slots.findIndex(
        (slot) => String(slot.id) === String(payload.slot_id)
      );

      if (index !== -1) {
        this.slots.splice(index, 1, {
          ...this.slots[index],
          ...payload,
          id: payload.slot_id,
        });
      } else {
        this.loadSlots();
      }
    },

    handleAppointmentRealtime() {
      this.taiDanhSach();
    },

    emptySlotMonitor() {
      return {
        current_count: 0,
        slot_capacity: 0,
        available_count: 0,
        percent: 0,
      };
    },

    today() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    },

    async loadSlots() {
      try {
        const res = await baseRequestDoctor.get("/doctor/appointment-slots", {
          params: {
            date: this.today(),
          },
        });

        if (res.data?.status) {
          this.slots = res.data.data || [];

          this.slots.forEach((slot) => {
            socket.emit("join_slot", slot.id);
          });
        }
      } catch (error) {
        console.error("loadSlots error:", error);
      }
    },

    completedBySlot(slot) {
      return this.danh_sach_lich.filter((item) => {
        const time = item.time_range || "";
        const isMorning = time.startsWith("07") || time.includes("07:00");

        return slot === "morning" ? isMorning : !isMorning;
      }).length;
    },

    slotBadgeClass(percent) {
      if (percent >= 100) return "bg-danger";
      if (percent >= 80) return "bg-warning text-dark";
      return "bg-success";
    },

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
      const [y, m, d] = String(dateStr).split("-");
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
            this.loadSlots();
          }
        })
        .catch(() => this.$toast.error("Lỗi server!"))
        .finally(() => (this.dang_luu = false));
    },
  },
};
</script>

<style scoped>
.slot-monitor-card {
  min-width: 160px;
  padding: 14px 18px;
  border-radius: 16px;
  background: #f8f9fa;
  border: 1px solid #edf0f2;
}
</style>