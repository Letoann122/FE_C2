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

          <button class="btn btn-outline-danger" @click="loadData">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Tải lại
          </button>
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
  },

  mounted() {
    this.loadData();
  },

  methods: {
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
.summary-box {
  min-width: 160px;
  padding: 14px 18px;
  border-radius: 16px;
  background: #f8f9fa;
  border: 1px solid #edf0f2;
}
</style>