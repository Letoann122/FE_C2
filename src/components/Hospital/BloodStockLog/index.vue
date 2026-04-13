<template>
  <div class="container-fluid py-4">
    <!-- BREADCRUMB -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/Hospital/blood-inventory">Quản lý kho máu</router-link>
        </li>
        <li class="breadcrumb-item active">Nhật ký kho máu</li>
      </ol>
    </nav>

    <!-- TITLE -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Nhật ký Thao tác Kho máu</h2>
        <p class="text-muted">Theo dõi lịch sử mọi hoạt động trong kho máu.</p>
      </div>
    </div>

    <!-- FILTER -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body row g-3 align-items-end">
        <div class="col-md-3">
          <label class="form-label">Thao tác</label>
          <select class="form-select" v-model="filterAction" @change="filterLogs">
            <option value="all">Tất cả</option>
            <option value="import">Nhập kho</option>
            <option value="export">Xuất kho</option>
            <option value="update">Chỉnh sửa</option>
            <option value="expire">Hết hạn</option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Từ ngày</label>
          <input type="date" v-model="fromDate" class="form-control" @change="filterLogs" />
        </div>

        <div class="col-md-3">
          <label class="form-label">Đến ngày</label>
          <input type="date" v-model="toDate" class="form-control" @change="filterLogs" />
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white py-3">
        <h5 class="mb-0 fw-bold">Danh sách thao tác</h5>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th>Hành động</th>
                <th>Lô</th>
                <th>Người thực hiện</th>
                <th>Thời gian</th>
                <th>Ghi chú</th>
                <th>Chi tiết</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="log in filtered" :key="log.id">
                <td>
                  <span class="text" >
                    {{ translateAction(log.action) }}
                  </span>
                </td>

                <td class="fw-bold">
                  <span class="text-danger pointer"
                    @click="$router.push({ name: 'BloodBatchDetail', params: { id: log.batch_id } })">
                    BL{{ String(log.batch_id).padStart(6, "0") }}
                  </span>
                </td>

                <td>
                  <div class="d-flex align-items-center">

                    <div>
                      <div class="fw-bold small">{{ log.actor_name }}</div>
                      <div class="text-muted very-small">{{ log.actor_role }}</div>
                    </div>
                  </div>
                </td>

                <td>{{ formatDateTime(log.time) }}</td>
                <td>{{ log.notes }}</td>

                <td>
                  <button class="btn btn-sm btn-outline-secondary"
                    @click="$router.push({ name: 'BloodBatchDetail', params: { id: log.batch_id } })">
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>

              <tr v-if="filtered.length === 0">
                <td colspan="6" class="text-center py-3 text-muted">Không có dữ liệu phù hợp.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "BloodStockLogView",

  data() {
    return {
      logs: [],
      filtered: [],
      filterAction: "all",
      fromDate: "",
      toDate: "",
    };
  },

  mounted() {
    this.loadLogs();
  },

  methods: {
    async loadLogs() {
      try {
        const res = await baseRequestDoctor.get("/doctor/blood-inventory/logs");
        if (res.data.status) {
          this.logs = res.data.data || [];
          this.filtered = this.logs;
        } else {
          this.$toast?.error(res.data.message || "Không tải được nhật ký kho máu!");
          this.logs = [];
          this.filtered = [];
        }
      } catch (e) {
        this.$toast?.error("Lỗi tải nhật ký kho máu!");
        this.logs = [];
        this.filtered = [];
      }
    },

    translateAction(a) {
      return {
        import: "Nhập kho",
        export: "Xuất kho",
        update: "Chỉnh sửa",
        expire: "Hết hạn",
      }[a] || "Khác";
    },

    badgeClass(a) {
      return {
        import: "badge-success",
        export: "badge-primary",
        update: "badge-warning text-dark",
        expire: "badge-danger",
      }[a] || "badge-secondary";
    },

    formatDateTime(dt) {
      if (!dt) return "-";
      const d = new Date(dt);
      if (Number.isNaN(d.getTime())) return "-";
      return d.toLocaleString("vi-VN");
    },

    filterLogs() {
      let result = [...(this.logs || [])];

      if (this.filterAction !== "all") {
        result = result.filter((l) => l.action === this.filterAction);
      }

      if (this.fromDate) {
        const from = new Date(this.fromDate);
        from.setHours(0, 0, 0, 0);
        result = result.filter((l) => new Date(l.time) >= from);
      }

      if (this.toDate) {
        const to = new Date(this.toDate);
        to.setHours(23, 59, 59, 999);
        result = result.filter((l) => new Date(l.time) <= to);
      }

      this.filtered = result;
    },
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}

.badge {
  padding: 0.5em 0.8em;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 6px;
}

.badge-success {
  background-color: #d1e7dd;
  color: #198754;
}

.badge-primary {
  background-color: #cfe2ff;
  color: #0d6efd;
}

.badge-danger {
  background-color: #f8d7da;
  color: #dc3545;
}

.badge-warning {
  background-color: #fff3cd;
}

.very-small {
  font-size: 0.75rem;
}
</style>
