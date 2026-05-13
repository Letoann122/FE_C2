<template>
  <div class="container py-4">
    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
          <div>
            <h4 class="fw-bold mb-1">
              <i class="bi bi-clipboard-check text-danger me-2"></i>
              Danh sách check-in hôm nay
            </h4>
            <p class="text-muted mb-0">
              Quản lý người hiến máu đã check-in trong ngày theo ca sáng / ca chiều.
            </p>
          </div>

          <button class="btn btn-outline-danger" @click="loadAll">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Tải lại
          </button>
        </div>

        <div class="row g-3 mb-4">
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
                Còn trống: {{ slotMonitor.morning.available_count }}
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
                Còn trống: {{ slotMonitor.afternoon.available_count }}
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
                Realtime khi donor đặt / huỷ lịch
              </div>
            </div>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Khung giờ</label>
            <select class="form-select" v-model="filters.time_slot" @change="loadData">
              <option value="">Tất cả khung giờ</option>
              <option value="morning">Ca sáng</option>
              <option value="afternoon">Ca chiều</option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label fw-semibold">Trạng thái</label>
            <select class="form-select" v-model="filters.status" @change="loadData">
              <option value="">Tất cả trạng thái</option>
              <option value="CHECKED_IN">Đã check-in</option>
              <option value="SCREENING">Đang sàng lọc</option>
              <option value="DONATING">Đang hiến máu</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label fw-semibold">Tìm kiếm</label>
            <input
              v-model="keyword"
              class="form-control"
              placeholder="Tên, SĐT, mã lịch hẹn..."
            />
          </div>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-danger"></div>
          <div class="text-muted mt-2">Đang tải dữ liệu...</div>
        </div>

        <div v-else>
          <div class="d-flex gap-3 flex-wrap mb-3">
            <div class="summary-box">
              <div class="text-muted small">Tổng check-in</div>
              <div class="fw-bold fs-5">{{ filteredList.length }}</div>
            </div>

            <div class="summary-box">
              <div class="text-muted small">Ca sáng</div>
              <div class="fw-bold fs-5">{{ countBySlot("morning") }}</div>
            </div>

            <div class="summary-box">
              <div class="text-muted small">Ca chiều</div>
              <div class="fw-bold fs-5">{{ countBySlot("afternoon") }}</div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Mã lịch</th>
                  <th>Người hiến</th>
                  <th>SĐT</th>
                  <th>Nhóm máu</th>
                  <th>Khung giờ hẹn</th>
                  <th>Ca</th>
                  <th>Check-in lúc</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredList.length === 0">
                  <td colspan="10" class="text-center text-muted py-4">
                    Không có dữ liệu check-in hôm nay.
                  </td>
                </tr>

                <tr v-for="(item, index) in filteredList" :key="item.appointment_id">
                  <td>{{ index + 1 }}</td>

                  <td class="fw-bold">
                    {{ item.appointment_code }}
                  </td>

                  <td>
                    <div class="fw-semibold">
                      {{ item.donor?.full_name || "Không có dữ liệu" }}
                    </div>
                    <div class="small text-muted">
                      {{ item.donor?.email || "" }}
                    </div>
                  </td>

                  <td>{{ item.donor?.phone || "Không có dữ liệu" }}</td>

                  <td>
                    <span class="badge bg-danger">
                      {{ item.donor?.blood_group || "N/A" }}
                    </span>
                  </td>

                  <td>{{ formatDateTime(item.scheduled_at) }}</td>

                  <td>
                    <span
                      class="badge"
                      :class="item.time_slot === 'morning' ? 'bg-info' : 'bg-warning text-dark'"
                    >
                      {{ item.time_slot_label }}
                    </span>
                  </td>

                  <td>{{ formatDateTime(item.checked_in_at) }}</td>

                  <td>
                    <span class="badge" :class="statusClass(item.status)">
                      {{ statusText(item.status) }}
                    </span>
                  </td>

                  <td>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="goToProcess(item)"
                    >
                      Xử lý
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="errorMessage" class="alert alert-danger rounded-4 mt-3 mb-0">
          <i class="bi bi-exclamation-triangle-fill me-1"></i>
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";
import socket from "../../../core/socket";

export default {
  name: "HospitalTodayCheckedIn",

  data() {
    return {
      loading: false,
      errorMessage: "",
      keyword: "",
      filters: {
        time_slot: "",
        status: "",
      },
      list: [],
      slots: [],
    };
  },

  computed: {
    filteredList() {
      const key = this.keyword.trim().toLowerCase();

      if (!key) return this.list;

      return this.list.filter((item) => {
        const appointmentCode = item.appointment_code || "";
        const donorName = item.donor?.full_name || "";
        const donorPhone = item.donor?.phone || "";
        const bloodGroup = item.donor?.blood_group || "";

        return (
          appointmentCode.toLowerCase().includes(key) ||
          donorName.toLowerCase().includes(key) ||
          donorPhone.toLowerCase().includes(key) ||
          bloodGroup.toLowerCase().includes(key)
        );
      });
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
    this.loadAll();
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
      this.loadData();
    },

    loadAll() {
      this.loadData();
      this.loadSlots();
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

    async loadData() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const params = {};

        if (this.filters.time_slot) {
          params.time_slot = this.filters.time_slot;
        }

        if (this.filters.status) {
          params.status = this.filters.status;
        }

        const res = await baseRequestDoctor.get("/doctor/checkin/today", {
          params,
        });

        if (res.data.status) {
          this.list = res.data.data || [];
        } else {
          this.errorMessage = res.data.message || "Không tải được danh sách.";
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Lỗi khi tải danh sách check-in.";
      } finally {
        this.loading = false;
      }
    },

    slotBadgeClass(percent) {
      if (percent >= 100) return "bg-danger";
      if (percent >= 80) return "bg-warning text-dark";
      return "bg-success";
    },

    countBySlot(slot) {
      return this.filteredList.filter((item) => item.time_slot === slot).length;
    },

    formatDateTime(value) {
      if (!value) return "Không có dữ liệu";

      return new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },

    statusText(status) {
      const map = {
        CHECKED_IN: "Đã check-in",
        SCREENING: "Đang sàng lọc",
        DONATING: "Đang hiến máu",
        COMPLETED: "Hoàn thành",
      };

      return map[status] || status;
    },

    statusClass(status) {
      const map = {
        CHECKED_IN: "bg-success",
        SCREENING: "bg-info",
        DONATING: "bg-warning text-dark",
        COMPLETED: "bg-primary",
      };

      return map[status] || "bg-secondary";
    },

    goToProcess(item) {
      this.$router.push({
        path: "/Hospital/donation-process",
        query: {
          appointment_id: item.appointment_id,
        },
      });
    },
  },
};
</script>

<style scoped>
.summary-box,
.slot-monitor-card {
  min-width: 160px;
  padding: 14px 18px;
  border-radius: 16px;
  background: #f8f9fa;
  border: 1px solid #edf0f2;
}
</style>