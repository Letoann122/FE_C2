<template>
  <div class="blood-batch-detail-wrapper container-fluid py-4">
    <!-- HEADER + NÚT QUAY LẠI -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Chi tiết lô máu #{{ idText }}</h2>
        <p class="text-muted">Thông tin chi tiết và lịch sử hoạt động của lô máu.</p>
      </div>

      <!-- Nút quay lại -->
      <router-link class="btn btn-secondary btn-sm" :to="backLink">
        <i class="bi bi-arrow-left me-1"></i>Quay lại
      </router-link>
    </div>

    <!-- INFO CARDS -->
    <div class="row g-3 mb-4">
      <div class="col-md-3" v-for="card in infoCards" :key="card.label">
        <div class="card info-card border-0 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <div class="info-icon me-3" :class="card.class">
              <i :class="card.icon"></i>
            </div>
            <div>
              <small class="text-muted">{{ card.label }}</small>
              <p class="fw-bold mb-0">{{ card.value }}</p>
              <small v-if="card.sub" class="text-muted">{{ card.sub }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- STATUS CARD -->
    <div class="card border-0 shadow-sm mb-4" v-if="loaded">
      <div class="card-body d-flex align-items-center">
        <span class="badge rounded-pill me-3" :class="uiStatus.badgeClass">
          <i class="bi bi-circle-fill me-2"></i>{{ uiStatus.label }}
        </span>
        <span class="text-muted">
          Hạn sử dụng: {{ formatDate(batch.expiry_date) }}
        </span>
      </div>
    </div>

    <!-- NOTE -->
    <div class="card border-0 shadow-sm mb-4" v-if="loaded">
      <div class="card-body">
        <h5 class="fw-bold mb-3">Ghi chú</h5>
        <div class="alert alert-warning-light mb-0">
          <i class="bi bi-info-circle-fill me-2"></i>
          {{ note }}
        </div>
      </div>
    </div>

    <!-- TIMELINE -->
    <div class="card border-0 shadow-sm" v-if="loaded">
      <div class="card-body">
        <h5 class="fw-bold mb-4">Nhật ký hoạt động</h5>

        <div class="timeline">
          <div v-for="(item, idx) in logs" :key="idx" class="timeline-item">
            <div class="timeline-icon">
              <i :class="item.icon"></i>
            </div>

            <div class="timeline-content">
              <p class="fw-bold mb-1">{{ item.title }}</p>
              <p class="text-muted small mb-1">{{ item.description }}</p>
              <p class="very-small text-muted mb-0">
                Người thực hiện: {{ item.actor }}
              </p>
            </div>

            <div class="timeline-time">
              {{ formatDateTime(item.time) }}
            </div>
          </div>

          <p v-if="logs.length === 0" class="text-muted text-center py-3">
            Chưa có nhật ký cho lô máu này.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "BloodBatchDetailView",

  data() {
    return {
      id: null,
      batch: {},
      infoCards: [],
      note: "",
      logs: [],
      loaded: false,
    };
  },

  computed: {
    idText() {
      return this.id ? "BL" + this.id.toString().padStart(6, "0") : "";
    },

    // LINK QUAY LẠI
    backLink() {
      const bt = this.batch?.blood_type || null;

      // Nếu chưa có thông tin nhóm máu (lúc mới load) thì quay về trang tổng kho
      if (!bt || (!bt.abo && !bt.rh)) {
        return { path: "/Hospital/blood-inventory" };
      }

      const type = `${bt.abo || ""}${bt.rh || ""}`;

      // Quay lại trang danh sách lô theo nhóm máu
      return {
        path: "/Hospital/blood-inventory-by-type",
        query: { type },
      };
    },

    uiStatus() {
      const b = this.batch || {};
      const units = Number(b.units || 0);

      if (units <= 0) {
        return { key: "empty", label: "Đã xuất hết", badgeClass: "bg-secondary" };
      }

      const today = this.toDate0(new Date());
      const exp = this.toDate0(b.expiry_date);

      if (exp && exp < today) return { key: "expired", label: "Hết hạn", badgeClass: "bg-danger" };

      if (exp) {
        const days = (exp - today) / (1000 * 3600 * 24);
        if (days <= 3) return { key: "expiring", label: "Sắp hết hạn", badgeClass: "bg-warning text-dark" };
      }

      if (units < 5) return { key: "low", label: "Ít máu", badgeClass: "bg-secondary" };

      return { key: "full", label: "Đầy đủ", badgeClass: "bg-success" };
    },
  },

  mounted() {
    this.id = this.$route.params.id;
    this.loadBatch();
    this.loadLogs();
  },

  methods: {
    async loadBatch() {
      try {
        const res = await baseRequestDoctor.get(`/doctor/blood-inventory/${this.id}`);
        if (res.data.status) {
          this.batch = res.data.data || {};
          this.setupInfoCards();

          const apiNote = this.batch.note?.trim();
          this.note = apiNote || this.buildAutoNote();

          this.loaded = true;
        } else {
          this.$toast?.error("Không tải được dữ liệu lô máu!");
        }
      } catch (e) {
        this.$toast?.error("Lỗi tải chi tiết lô máu!");
      }
    },

    async loadLogs() {
      try {
        const res = await baseRequestDoctor.get(`/doctor/blood-inventory/logs/${this.id}`);
        if (res.data.status) this.logs = res.data.data || [];
      } catch (e) {}
    },

    setupInfoCards() {
      this.infoCards = [
        {
          label: "Nhóm máu",
          value: `${this.batch.blood_type?.abo || ""}${this.batch.blood_type?.rh || ""}` || "-",
          icon: "bi bi-droplet-half",
          class: "icon-danger",
        },
        {
          label: "Ngày nhập",
          value: this.formatDate(this.batch.donation_date),
          icon: "bi bi-calendar-heart",
          class: "icon-primary",
        },
        {
          label: "Hạn sử dụng",
          value: this.formatDate(this.batch.expiry_date),
          icon: "bi bi-hourglass-split",
          class: "icon-warning",
        },
        {
          label: "Số lượng",
          value: Number(this.batch.units || 0) + " túi",
          icon: "bi bi-box-seam",
          class: "icon-success",
        },
      ];
    },

    buildAutoNote() {
      const units = Number(this.batch.units || 0);
      if (units <= 0) return "Lô máu đã được xuất hết (0 túi).";

      const today = this.toDate0(new Date());
      const exp = this.toDate0(this.batch.expiry_date);

      if (exp && exp < today) return "Lô máu đã hết hạn. Vui lòng kiểm tra quy trình xử lý.";
      if (exp) {
        const days = (exp - today) / (1000 * 3600 * 24);
        if (days <= 3) return "Lô máu sắp hết hạn. Ưu tiên sử dụng theo FIFO.";
      }
      if (units < 5) return "Số lượng còn ít, cân nhắc nhập bổ sung.";
      return "Không có ghi chú.";
    },

    toDate0(input) {
      if (!input) return null;

      const s = typeof input === "string" ? input : null;
      if (s && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        dt.setHours(0, 0, 0, 0);
        return dt;
      }

      const dt = new Date(input);
      if (Number.isNaN(dt.getTime())) return null;
      dt.setHours(0, 0, 0, 0);
      return dt;
    },

    formatDate(date) {
      if (!date) return "-";
      const dt = this.toDate0(date);
      return dt ? dt.toLocaleDateString("vi-VN") : "-";
    },

    formatDateTime(dt) {
      if (!dt) return "-";
      const d = new Date(dt);
      if (Number.isNaN(d.getTime())) return "-";
      return d.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    },
  },
};
</script>

<style scoped>
.breadcrumb a {
  text-decoration: none;
  color: #dc3545;
}
.breadcrumb a:hover {
  text-decoration: underline;
}

/* INFO CARDS */
.info-card .info-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
}
.icon-danger { background:#fde2e2; color:#c81e1e; }
.icon-primary { background:#cfe2ff; color:#0d6efd; }
.icon-warning { background:#fff3cd; color:#664d03; }
.icon-success { background:#d1e7dd; color:#198754; }

/* TIMELINE */
.timeline { position: relative; }
.timeline-item {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding: 0 0 24px 64px;
}
.timeline-item:last-child { padding-bottom: 0; }
.timeline-item::before {
  content: "";
  position: absolute;
  left: 32px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e9ecef;
}
.timeline-icon {
  position: absolute;
  left: 20px;
  top: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #6c757d;
}
.timeline-content { flex: 1; }
.timeline-time {
  min-width: 140px;
  text-align: right;
  font-size: 0.85rem;
  color: #6c757d;
  margin-left: 16px;
  padding-top: 2px;
}
.very-small { font-size: 0.75rem; }
</style>
