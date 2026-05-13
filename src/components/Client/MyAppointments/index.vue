<template>
  <div class="container py-5 my-appointments-page">
    <div class="mb-4 border-bottom pb-3">
      <h3 class="fw-bold text-danger">
        <i class="bi bi-calendar-check me-2"></i>Lịch hẹn của tôi
      </h3>
      <p class="text-muted mb-0">
        Theo dõi tất cả lịch hẹn hiến máu, xem chi tiết, thẻ check-in và trạng thái lịch hẹn.
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
            <div class="display-6 fw-bold text-warning">
              {{ countByStatus("REQUESTED") }}
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card">
          <div class="card-body">
            <div class="small text-muted">Đã duyệt</div>
            <div class="display-6 fw-bold text-success">
              {{ countByStatus("APPROVED") }}
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card border-0 shadow-sm rounded-4 stat-card">
          <div class="card-body">
            <div class="small text-muted">Hoàn thành</div>
            <div class="display-6 fw-bold text-primary">
              {{ countByStatus("COMPLETED") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 class="fw-bold mb-0">Danh sách lịch hẹn</h5>

          <select class="form-select" v-model="filterStatus" style="width: 210px">
            <option value="">Tất cả trạng thái</option>
            <option value="REQUESTED">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="BOOKED">Đã đặt</option>
            <option value="CHECKED_IN">Đã check-in</option>
            <option value="SCREENING">Đang sàng lọc</option>
            <option value="FAILED_SCREENING">Không đủ điều kiện</option>
            <option value="DONATING">Đang hiến máu</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="NO_SHOW">Không đến</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>

        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-danger"></div>
          <div class="small text-muted mt-2">Đang tải lịch hẹn...</div>
        </div>

        <div v-else-if="filteredAppointments.length === 0" class="text-muted small">
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
                    {{ a.appointment_code || `#${a.id}` }}
                  </span>
                </td>

                <td>
                  <div class="fw-semibold">{{ formatDate(a.scheduled_at) }}</div>
                  <div class="small text-muted">{{ getTimeSlot(a) }}</div>
                  <div v-if="a.slot" class="small text-danger">
                    Slot: {{ a.slot.current_count }}/{{ a.slot.slot_capacity }}
                    <span v-if="a.slot.percent !== undefined">({{ a.slot.percent }}%)</span>
                  </div>
                </td>

                <td>
                  <div class="fw-semibold">{{ getSiteName(a) }}</div>
                  <div class="small text-muted">{{ getSiteAddress(a) }}</div>
                </td>

                <td>
                  <span class="badge bg-light text-dark border">
                    {{ a.campaign_id ? "Chiến dịch" : "Điểm cố định" }}
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

                    <button v-if="canShowQr(a)" class="btn btn-sm btn-danger" @click="goQrCheckin(a)">
                      <i class="bi bi-qr-code me-1"></i>Mã QR
                    </button>

                    <button v-if="canCancel(a)" class="btn btn-sm btn-outline-danger" @click="openCancelModal(a)"
                      :disabled="isCancelling">
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

    <!-- CANCEL MODAL -->
    <div class="modal fade" id="cancelAppointmentModal" tabindex="-1" aria-hidden="true" ref="cancelModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Xác nhận hủy lịch hẹn
            </h5>

            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
              :disabled="isCancelling"></button>
          </div>

          <div class="modal-body">
            <p class="mb-2">
              Bạn có chắc chắn muốn hủy lịch hẹn này không?
            </p>

            <div v-if="selectedCancelAppointment" class="alert alert-light border rounded-4 small mb-0">
              <div>
                <strong>Mã lịch:</strong>
                {{ selectedCancelAppointment.appointment_code || `#${selectedCancelAppointment.id}` }}
              </div>
              <div>
                <strong>Ngày hẹn:</strong>
                {{ formatDate(selectedCancelAppointment.scheduled_at) }}
              </div>
              <div>
                <strong>Khung giờ:</strong>
                {{ getTimeSlot(selectedCancelAppointment) }}
              </div>
              <div>
                <strong>Địa điểm:</strong>
                {{ getSiteName(selectedCancelAppointment) }}
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal" :disabled="isCancelling">
              Đóng
            </button>

            <button class="btn btn-danger" @click="confirmCancelAppointment"
              :disabled="isCancelling || !selectedCancelAppointment">
              <span v-if="isCancelling" class="spinner-border spinner-border-sm me-1"></span>
              Xác nhận hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";
import socket from "../../../core/socket";
import { createToaster } from "@meforma/vue-toaster";

import {
  getAppointmentStatusLabel,
  getAppointmentStatusBadge,
} from "../../../utils/appointmentStatus";

const toast = createToaster();

export default {
  name: "MyAppointmentsPage",

  data() {
    return {
      isLoading: false,
      isCancelling: false,
      filterStatus: "",
      appointments: [],
      selectedCancelAppointment: null,
      cancelModalInstance: null,
    };
  },

  computed: {
    filteredAppointments() {
      if (!this.filterStatus) return this.appointments;
      return this.appointments.filter((item) => item.status === this.filterStatus);
    },
  },

  mounted() {
    this.getMyAppointments();
    this.initSocket();
    this.initCancelModal();
  },

  beforeUnmount() {
    socket.off("appointment_updated", this.handleAppointmentUpdated);
    socket.off("slot_capacity_updated", this.handleSlotCapacityUpdated);

    if (this.cancelModalInstance) {
      this.cancelModalInstance.hide();
      this.cancelModalInstance.dispose();
      this.cancelModalInstance = null;
    }
  },

  methods: {
    initSocket() {
      if (!socket.connected) socket.connect();

      socket.on("appointment_updated", this.handleAppointmentUpdated);
      socket.on("slot_capacity_updated", this.handleSlotCapacityUpdated);
    },

    initCancelModal() {
      this.$nextTick(() => {
        const modalEl = this.$refs.cancelModalRef;

        if (window.bootstrap && modalEl) {
          this.cancelModalInstance = new window.bootstrap.Modal(modalEl, {
            backdrop: "static",
            keyboard: false,
          });

          modalEl.addEventListener("hidden.bs.modal", () => {
            if (!this.isCancelling) {
              this.selectedCancelAppointment = null;
            }
          });
        }
      });
    },

    handleAppointmentUpdated() {
      this.getMyAppointments();
    },

    handleSlotCapacityUpdated(payload) {
      if (!payload?.slot_id) return;

      this.appointments = this.appointments.map((item) => {
        if (item.slot && String(item.slot.id) === String(payload.slot_id)) {
          return {
            ...item,
            slot: {
              ...item.slot,
              ...payload,
              id: payload.slot_id,
            },
          };
        }

        return item;
      });
    },

    async getMyAppointments() {
      this.isLoading = true;

      try {
        const res = await baseRequestClient.get("/donor/donation-appointments");

        if (res.data?.status) {
          this.appointments = res.data.data || [];
        } else {
          toast.error(res.data?.message || "Không tải được danh sách lịch hẹn!");
        }
      } catch (error) {
        console.error("getMyAppointments error:", error);
        toast.error("Không tải được danh sách lịch hẹn!");
      } finally {
        this.isLoading = false;
      }
    },

    openCancelModal(item) {
      if (this.isCancelling) return;

      this.selectedCancelAppointment = item;

      this.$nextTick(() => {
        if (!this.cancelModalInstance) {
          this.initCancelModal();
        }

        this.cancelModalInstance?.show();
      });
    },

    async confirmCancelAppointment() {
      if (!this.selectedCancelAppointment || this.isCancelling) return;

      this.isCancelling = true;

      try {
        const res = await baseRequestClient.post(
          `/donor/donation-appointments/${this.selectedCancelAppointment.id}/cancel`
        );

        if (res.data?.status) {
          toast.success(res.data.message || "Đã hủy lịch hẹn!");

          this.cancelModalInstance?.hide();
          this.selectedCancelAppointment = null;

          await this.getMyAppointments();
        } else {
          toast.error(res.data?.message || "Không thể hủy lịch hẹn!");
        }
      } catch (error) {
        console.error("confirmCancelAppointment error:", error);
        toast.error("Không thể hủy lịch hẹn!");
      } finally {
        this.isCancelling = false;
      }
    },

    goDetail(item) {
      this.$router.push(`/my-appointments/${item.id}`);
    },

    goQrCheckin(item) {
      this.$router.push({
        name: "QRCodeCheckin",
        params: {
          appointmentId: item.id,
        },
      });
    },

    canShowQr(item) {
      return ["APPROVED", "BOOKED", "CHECKED_IN"].includes(item.status);
    },

    canCancel(item) {
      return ["REQUESTED", "APPROVED", "BOOKED"].includes(item.status);
    },

    countByStatus(status) {
      return this.appointments.filter((item) => item.status === status).length;
    },

    statusLabel(status) {
      return getAppointmentStatusLabel(status);
    },

    statusBadgeClass(status) {
      return getAppointmentStatusBadge(status);
    },

    formatDate(date) {
      if (!date) return "Chưa có ngày";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    getTimeSlot(item) {
      if (item.slot?.start_time && item.slot?.end_time) {
        const start = String(item.slot.start_time).slice(0, 5);
        const end = String(item.slot.end_time).slice(0, 5);

        return `${start} - ${end}`;
      }

      return item.time_slot || "Chưa có khung giờ";
    },

    getSiteName(item) {
      return (
        item.donation_site?.name ||
        item.campaign?.title ||
        item.campaign?.name ||
        item.campaign?.location ||
        "Chưa có địa điểm"
      );
    },

    getSiteAddress(item) {
      return (
        item.donation_site?.address ||
        item.campaign?.location ||
        "Chưa có địa chỉ"
      );
    },
  },
};
</script>

<style scoped>
.stat-card {
  min-height: 120px;
}
</style>