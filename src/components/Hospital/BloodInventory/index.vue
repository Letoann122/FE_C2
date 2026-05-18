<template>
  <div class="container-fluid py-4 min-vh-100 inventory-intel-page">
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h3 class="fw-bold mb-1">Quản lý kho máu</h3>
        <p class="text-muted mb-0">
          Giám sát tồn kho, cảnh báo hết hạn, ưu tiên lô gần hết hạn, dự báo sử dụng và gợi ý xử lý khẩn cấp.
        </p>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-danger" :disabled="loadingExpired" @click="openExpiredModal">
          <span v-if="loadingExpired" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-trash3 me-1"></i>
          Xử lý lô hết hạn
        </button>

        <button class="btn btn-outline-danger" :disabled="loading" @click="loadDashboard">
          <i class="bi bi-arrow-clockwise me-1"></i>Làm mới
        </button>
      </div>
    </div>

    <div v-if="loading" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5 text-muted">
        <span class="spinner-border spinner-border-sm me-2"></span>
        Đang tải dữ liệu kho máu thông minh...
      </div>
    </div>

    <template v-else>
      <!-- SUMMARY CARDS -->
      <div class="row g-3 mb-4">
        <div class="col-xl col-md-6" v-for="card in summaryCards" :key="card.label">
          <div class="card border-0 shadow-sm intel-card h-100">
            <div class="card-body d-flex align-items-center">
              <div class="intel-icon me-3" :class="card.class">
                <i :class="card.icon"></i>
              </div>
              <div>
                <div class="text-muted small">{{ card.label }}</div>
                <div class="fs-4 fw-bold">{{ card.value }}</div>
                <div class="small text-muted">{{ card.sub }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BLOOD GROUP STATUS FULL WIDTH -->
      <div class="row g-3 mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3">
              <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div>
                  <h5 class="fw-bold mb-0">Tình trạng từng nhóm máu</h5>
                  <small class="text-muted">Theo dõi mức tồn kho: nguy cấp, thấp, bình thường, dư và sắp hết hạn</small>
                </div>
              </div>
            </div>

            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Nhóm máu</th>
                      <th>Khả dụng</th>
                      <th>Testing</th>
                      <th>Sắp hết hạn</th>
                      <th>Dự báo</th>
                      <th>Trạng thái</th>
                      <th class="text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="group in filteredGroups" :key="group.blood_group">
                      <td class="fw-bold text-danger fs-6">{{ group.blood_group }}</td>
                      <td class="fw-bold">{{ group.available_units }} túi</td>
                      <td>{{ group.testing_units }}</td>
                      <td>
                        <span :class="group.expiring_batches > 0 ? 'text-warning fw-bold' : ''">
                          {{ group.expiring_batches }} lô
                        </span>
                      </td>
                      <td>
                        <span v-if="group.days_remaining !== null">
                          còn khoảng {{ Math.ceil(Number(group.days_remaining || 0)) }} ngày
                        </span>
                        <span v-else class="text-muted">Chưa có dữ liệu sử dụng</span>
                      </td>
                      <td>
                        <span class="badge rounded-pill" :class="statusBadgeClass(group.status)">
                          {{ group.status_text }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button v-if="group.status === 'critical' || group.status === 'low'"
                          class="btn btn-sm btn-danger me-2" @click="openEmergencyModal(group)"
                          :disabled="creatingEmergency === group.blood_group">
                          <span v-if="creatingEmergency === group.blood_group"
                            class="spinner-border spinner-border-sm me-1"></span>
                          Cảnh báo
                        </button>

                        <button class="btn btn-sm btn-outline-primary" @click="goGroup(group)">
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                    <tr v-if="filteredGroups.length === 0">
                      <td colspan="7" class="text-center text-muted py-4">Không có dữ liệu phù hợp</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RECOMMENDATIONS + EXPIRING + PRIORITY -->
      <div class="row g-3">
        <div class="col-xl-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3">
              <h5 class="fw-bold mb-0">Khuyến nghị thông minh</h5>
              <small class="text-muted">Gợi ý tạo chiến dịch, cảnh báo và ưu tiên lô sắp hết hạn</small>
            </div>
            <div class="card-body recommendation-list">
              <div v-for="group in topRecommendations" :key="group.blood_group" class="recommend-card mb-3">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <span class="badge rounded-pill me-2" :class="statusBadgeClass(group.status)">
                      {{ group.blood_group }}
                    </span>
                    <span class="fw-bold">{{ group.status_text }}</span>
                  </div>
                  <i class="bi bi-lightbulb text-warning fs-5"></i>
                </div>
                <p class="small text-muted mb-1 mt-2">{{ group.recommendation }}</p>
                <p class="small mb-0"><b>Đề xuất:</b> {{ group.campaign_suggestion }}</p>
              </div>

              <div v-if="topRecommendations.length === 0" class="text-muted text-center py-4">
                Chưa có khuyến nghị đặc biệt.
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3">
              <h5 class="fw-bold mb-0">Lô sắp hết hạn</h5>
              <small class="text-muted">Cảnh báo trong {{ thresholds.EXPIRING_DAYS || 7 }} ngày</small>
            </div>
            <div class="card-body batch-list">
              <div v-for="batch in expiringBatches" :key="batch.id" class="batch-row" @click="goBatch(batch.id)">
                <div>
                  <div class="fw-bold">{{ batch.code || batchCode(batch.id) }} · {{ batch.blood_group }}</div>
                  <div class="small text-muted">Hạn: {{ batch.expiry_date_fmt }} · còn {{ batch.days_left }} ngày</div>
                </div>
                <span class="badge bg-warning text-dark">{{ batch.units }} túi</span>
              </div>

              <div v-if="expiringBatches.length === 0" class="text-muted text-center py-4">
                Không có lô sắp hết hạn.
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3">
              <h5 class="fw-bold mb-0">Ưu tiên lô gần hết hạn</h5>
              <small class="text-muted">Hết hạn trước - dùng trước</small>
            </div>
            <div class="card-body batch-list">
              <div v-for="item in fefoSuggestions" :key="item.id" class="batch-row" @click="goBatch(item.id)">
                <div>
                  <div class="fw-bold">{{ item.code }} · {{ item.blood_group }}</div>
                  <div class="small text-muted">{{ item.suggestion }}</div>
                </div>
                <i class="bi bi-chevron-right text-muted"></i>
              </div>

              <div v-if="fefoSuggestions.length === 0" class="text-muted text-center py-4">
                Chưa có gợi ý ưu tiên theo hạn dùng.
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- EXPIRED BATCHES MODAL -->
    <div v-if="expiredModal.open" class="modal-backdrop-custom" @click.self="closeExpiredModal">
      <div class="modal-card modal-card-lg">
        <div class="modal-header border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0 fw-bold text-danger">
              <i class="bi bi-trash3 me-2"></i>
              Xử lý lô máu hết hạn
            </h5>
            <div class="text-muted small mt-1">
              Loại các lô máu hết hạn khỏi kho khả dụng nhưng vẫn giữ lịch sử truy vết.
            </div>
          </div>

          <button class="btn btn-sm btn-light" :disabled="processingExpired" @click="closeExpiredModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="alert alert-warning">
            <div class="fw-bold mb-1">
              Có {{ expiredModal.summary.total_batches }} lô máu hết hạn,
              tổng cộng {{ expiredModal.summary.total_units }} túi.
            </div>
            <div class="small">
              Nhóm máu ảnh hưởng:
              <b>{{ expiredAffectedGroupsText || "Không có" }}</b>
            </div>
          </div>

          <div v-if="expiredModal.batches.length === 0" class="text-center text-muted py-4">
            Không có lô máu hết hạn cần xử lý.
          </div>

          <template v-else>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="small text-muted">
                Đã chọn {{ expiredModal.selectedIds.length }}/{{ expiredModal.batches.length }} lô
              </div>

              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" @click="selectAllExpired">
                  Chọn tất cả
                </button>
                <button class="btn btn-sm btn-outline-secondary" @click="clearExpiredSelection">
                  Bỏ chọn
                </button>
              </div>
            </div>

            <div class="table-responsive expired-table-wrap">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="width: 48px"></th>
                    <th>Lô máu</th>
                    <th>Nhóm máu</th>
                    <th>Số túi</th>
                    <th>Hạn sử dụng</th>
                    <th>Quá hạn</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="batch in sortedExpiredBatches" :key="batch.id">
                    <td>
                      <input class="form-check-input" type="checkbox" :value="batch.id"
                        v-model="expiredModal.selectedIds" />
                    </td>
                    <td class="fw-bold text-danger">{{ batch.code }}</td>
                    <td>{{ batch.blood_group }}</td>
                    <td>{{ batch.units }} túi</td>
                    <td>{{ batch.expiry_date_fmt }}</td>
                    <td>
                      <span class="badge bg-danger">
                        {{ batch.warning_text }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" :class="inventoryStatusClass(batch.status)">
                        {{ inventoryStatusText(batch.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <label class="form-label small fw-semibold mt-3">Lý do xử lý</label>
            <textarea v-model.trim="expiredModal.reason" rows="3" class="form-control"
              placeholder="Nhập lý do xử lý lô máu hết hạn..."></textarea>
          </template>
        </div>

        <div class="modal-footer border-top d-flex justify-content-end gap-2">
          <button class="btn btn-light" :disabled="processingExpired" @click="closeExpiredModal">
            Hủy
          </button>

          <button class="btn btn-danger" :disabled="processingExpired || !hasSelectedExpiredBatches"
            @click="processExpiredBatches">
            <span v-if="processingExpired" class="spinner-border spinner-border-sm me-2"></span>
            Xác nhận loại khỏi kho khả dụng
          </button>
        </div>
      </div>
    </div>

    <!-- EMERGENCY CONFIRM MODAL -->
    <div v-if="emergencyModal.open" class="modal fade show d-block emergency-modal" tabindex="-1" role="dialog"
      @click.self="closeEmergencyModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-danger text-white">
            <div>
              <h5 class="modal-title fw-bold mb-0">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                Tạo cảnh báo khẩn cấp
              </h5>
              <small>Gửi yêu cầu hiến máu cho nhóm máu đang thiếu</small>
            </div>

            <button type="button" class="btn-close btn-close-white" :disabled="Boolean(creatingEmergency)"
              @click="closeEmergencyModal"></button>
          </div>

          <div class="modal-body">
            <div class="alert alert-danger d-flex align-items-start">
              <i class="bi bi-droplet-fill me-2 mt-1"></i>
              <div>
                <div class="fw-bold">
                  Nhóm máu {{ emergencyModal.group?.blood_group }}
                  đang ở trạng thái
                  {{ emergencyModal.group?.status_text || "nguy cấp" }}.
                </div>
                <div class="small mt-1">
                  Hệ thống sẽ tạo yêu cầu hiến máu khẩn cấp để hỗ trợ bổ sung kho máu.
                </div>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">Số ml cần bổ sung</label>
                <input v-model.number="emergencyModal.required_volume_ml" type="number" min="250" step="50"
                  class="form-control" placeholder="VD: 500" />
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-semibold">Cần trong bao nhiêu giờ</label>
                <input v-model.number="emergencyModal.needed_in_hours" type="number" min="1" max="168"
                  class="form-control" placeholder="VD: 24" />
              </div>

              <div class="col-12">
                <label class="form-label small fw-semibold">Lý do cảnh báo</label>
                <textarea v-model.trim="emergencyModal.reason" rows="3" class="form-control"
                  placeholder="VD: Kho máu đang dưới ngưỡng an toàn, cần bổ sung khẩn cấp..."></textarea>
              </div>
            </div>

            <div class="mt-3 small text-muted">
              <i class="bi bi-info-circle me-1"></i>
              Sau khi xác nhận, hệ thống sẽ tạo yêu cầu khẩn cấp cho nhóm máu này.
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-light" :disabled="Boolean(creatingEmergency)"
              @click="closeEmergencyModal">
              Hủy
            </button>

            <button type="button" class="btn btn-danger" :disabled="Boolean(creatingEmergency)"
              @click="submitEmergency">
              <span v-if="creatingEmergency" class="spinner-border spinner-border-sm me-2"></span>
              Xác nhận tạo cảnh báo
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="emergencyModal.open" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "BloodInventoryView",

  data() {
    return {
      loading: false,
      loadingExpired: false,
      processingExpired: false,
      creatingEmergency: null,
      dashboard: {
        overview: {},
        groups: [],
        expiring_batches: [],
        fefo_suggestions: [],
        quick_filters: [],
        thresholds: {},
      },
      selectedQuickFilter: "all",

      expiredModal: {
        open: false,
        batches: [],
        summary: {
          total_batches: 0,
          total_units: 0,
          affected_groups: [],
        },
        selectedIds: [],
        reason: "Xác nhận loại khỏi kho khả dụng do lô máu đã hết hạn.",
      },

      emergencyModal: {
        open: false,
        group: null,
        required_volume_ml: 500,
        needed_in_hours: 24,
        reason: "",
      },
    };
  },

  computed: {
    thresholds() {
      return this.dashboard.thresholds || {};
    },

    overview() {
      return this.dashboard.overview || {};
    },

    groups() {
      return this.dashboard.groups || [];
    },

    hasSelectedExpiredBatches() {
      return this.expiredModal.selectedIds.length > 0;
    },

    filteredGroups() {
      if (this.selectedQuickFilter === "critical") {
        return this.groups.filter((g) => g.status === "critical" || g.status === "low");
      }

      if (this.selectedQuickFilter === "testing") {
        return this.groups.filter((g) => Number(g.testing_units || 0) > 0);
      }

      if (this.selectedQuickFilter === "expiring") {
        return this.groups.filter((g) => Number(g.expiring_batches || 0) > 0);
      }

      if (this.selectedQuickFilter === "expired") {
        return this.groups.filter(
          (g) => Number(g.expired_units || 0) > 0 || Number(g.expired_batches || 0) > 0
        );
      }

      if (this.selectedQuickFilter === "available") {
        return this.groups.filter((g) => Number(g.available_units || 0) > 0);
      }

      return this.groups;
    },

    expiringBatches() {
      return this.dashboard.expiring_batches || [];
    },

    fefoSuggestions() {
      return this.dashboard.fefo_suggestions || [];
    },

    quickFilters() {
      return this.dashboard.quick_filters || [];
    },

    topRecommendations() {
      return this.groups
        .filter((g) => ["critical", "low", "expiring_risk", "overstock"].includes(g.status))
        .slice(0, 5);
    },

    summaryCards() {
      return [
        {
          label: "Túi khả dụng",
          value: this.overview.total_available_units || 0,
          sub: "Có thể sử dụng",
          icon: "bi bi-droplet-half",
          class: "icon-danger",
        },
        {
          label: "Chờ xét nghiệm",
          value: this.overview.total_testing_units || 0,
          sub: "Đang kiểm định",
          icon: "bi bi-clipboard2-pulse",
          class: "icon-primary",
        },
        {
          label: "Sắp hết hạn",
          value: this.overview.total_expiring_batches || 0,
          sub: "Cần ưu tiên lô sắp hết hạn",
          icon: "bi bi-hourglass-split",
          class: "icon-warning",
        },
        {
          label: "Đã hết hạn",
          value: this.overview.pending_expired_batches || this.overview.total_expired_batches || 0,
          sub: "Cần xử lý khỏi kho khả dụng",
          icon: "bi bi-trash3",
          class: "icon-expired",
        },
        {
          label: "Nhóm nguy cấp",
          value: this.overview.critical_groups || 0,
          sub: "Cần hành động nhanh",
          icon: "bi bi-exclamation-triangle",
          class: "icon-dark",
        },
      ];
    },

    sortedExpiredBatches() {
      const order = {
        "A+": 1,
        "A-": 2,
        "B+": 3,
        "B-": 4,
        "AB+": 5,
        "AB-": 6,
        "O+": 7,
        "O-": 8,
      };

      return [...(this.expiredModal.batches || [])].sort((a, b) => {
        const aOrder = order[a.blood_group] || 99;
        const bOrder = order[b.blood_group] || 99;

        if (aOrder !== bOrder) return aOrder - bOrder;

        const aDate = new Date(a.expiry_date || 0).getTime();
        const bDate = new Date(b.expiry_date || 0).getTime();

        if (aDate !== bDate) return aDate - bDate;

        return Number(a.id || 0) - Number(b.id || 0);
      });
    },

    expiredAffectedGroupsText() {
      const order = {
        "A+": 1,
        "A-": 2,
        "B+": 3,
        "B-": 4,
        "AB+": 5,
        "AB-": 6,
        "O+": 7,
        "O-": 8,
      };

      const groups = this.expiredModal.summary?.affected_groups || [];

      return [...groups]
        .sort((a, b) => (order[a] || 99) - (order[b] || 99))
        .join(", ");
    },
  },

  mounted() {
    this.loadDashboard();
  },

  methods: {
    inventoryStatusText(status) {
      return {
        available: "Có thể sử dụng",
        testing: "Đang xét nghiệm",
        discarded: "Đã loại bỏ",
        expired: "Đã hết hạn",
      }[status] || "Không rõ";
    },

    inventoryStatusClass(status) {
      return {
        available: "bg-success",
        testing: "bg-primary",
        discarded: "bg-secondary",
        expired: "bg-danger",
      }[status] || "bg-light text-dark border";
    },

    async loadDashboard() {
      this.loading = true;
      try {
        const res = await baseRequestDoctor.get("/doctor/blood-inventory/intelligence/dashboard");
        if (res.data.status) {
          this.dashboard = res.data.data || this.dashboard;
        } else {
          this.$toast?.error(res.data.message || "Không tải được dashboard kho máu!");
        }
      } catch (e) {
        console.error(e);
        this.$toast?.error("Lỗi tải dashboard kho máu thông minh!");
      } finally {
        this.loading = false;
      }
    },

    async openExpiredModal() {
      this.loadingExpired = true;

      try {
        const res = await baseRequestDoctor.get(
          "/doctor/blood-inventory/intelligence/expired"
        );

        if (res.data.status) {
          const data = res.data.data || {};

          this.expiredModal = {
            open: true,
            batches: data.batches || [],
            summary: data.summary || {
              total_batches: 0,
              total_units: 0,
              affected_groups: [],
            },
            selectedIds: (data.batches || []).map((item) => item.id),
            reason: "Xác nhận loại khỏi kho khả dụng do lô máu đã hết hạn.",
          };
        } else {
          this.$toast?.error(res.data.message || "Không tải được danh sách lô hết hạn!");
        }
      } catch (e) {
        console.error(e);
        this.$toast?.error("Lỗi tải danh sách lô máu hết hạn!");
      } finally {
        this.loadingExpired = false;
      }
    },

    closeExpiredModal() {
      if (this.processingExpired) return;

      this.closeExpiredModalForce();
    },

    closeExpiredModalForce() {
      this.expiredModal = {
        open: false,
        batches: [],
        summary: {
          total_batches: 0,
          total_units: 0,
          affected_groups: [],
        },
        selectedIds: [],
        reason: "Xác nhận loại khỏi kho khả dụng do lô máu đã hết hạn.",
      };
    },

    selectAllExpired() {
      this.expiredModal.selectedIds = this.expiredModal.batches.map((item) => item.id);
    },

    clearExpiredSelection() {
      this.expiredModal.selectedIds = [];
    },

    async processExpiredBatches() {
      if (!this.expiredModal.selectedIds.length) {
        return this.$toast?.error("Vui lòng chọn ít nhất một lô máu cần xử lý!");
      }

      this.processingExpired = true;

      try {
        const res = await baseRequestDoctor.post(
          "/doctor/blood-inventory/intelligence/expired/process",
          {
            inventory_ids: this.expiredModal.selectedIds,
            reason:
              this.expiredModal.reason ||
              "Xác nhận loại khỏi kho khả dụng do lô máu đã hết hạn.",
          }
        );

        if (res.data.status) {
          this.$toast?.success(res.data.message || "Đã xử lý lô máu hết hạn!");

          await this.loadDashboard();

          const expiredRes = await baseRequestDoctor.get(
            "/doctor/blood-inventory/intelligence/expired"
          );

          if (expiredRes.data.status) {
            const data = expiredRes.data.data || {};
            const batches = data.batches || [];

            this.expiredModal = {
              open: batches.length > 0,
              batches,
              summary: data.summary || {
                total_batches: 0,
                total_units: 0,
                affected_groups: [],
              },
              selectedIds: batches.map((item) => item.id),
              reason: "Xác nhận loại khỏi kho khả dụng do lô máu đã hết hạn.",
            };

            if (batches.length === 0) {
              this.$toast?.success("Tất cả lô máu hết hạn đã được xử lý.");
            }
          } else {
            this.closeExpiredModalForce();
          }
        } else {
          this.$toast?.error(res.data.message || "Không xử lý được lô máu hết hạn!");
        }
      } catch (e) {
        console.error(e);
        this.$toast?.error("Lỗi xử lý lô máu hết hạn!");
      } finally {
        this.processingExpired = false;
      }
    },

    openEmergencyModal(group) {
      if (!group?.blood_group) return;

      this.emergencyModal = {
        open: true,
        group,
        required_volume_ml: 500,
        needed_in_hours: 24,
        reason:
          group.status === "critical"
            ? `Kho máu nhóm ${group.blood_group} đang ở mức nguy cấp.`
            : `Kho máu nhóm ${group.blood_group} đang thấp hơn ngưỡng an toàn.`,
      };
    },

    closeEmergencyModal() {
      if (this.creatingEmergency) return;

      this.emergencyModal = {
        open: false,
        group: null,
        required_volume_ml: 500,
        needed_in_hours: 24,
        reason: "",
      };
    },

    async submitEmergency() {
      const group = this.emergencyModal.group;

      if (!group?.blood_group) {
        return this.$toast?.error("Không xác định được nhóm máu cần cảnh báo!");
      }

      const requiredVolume = Number(this.emergencyModal.required_volume_ml || 0);
      const neededHours = Number(this.emergencyModal.needed_in_hours || 0);

      if (requiredVolume <= 0) {
        return this.$toast?.error("Số ml cần bổ sung phải lớn hơn 0!");
      }

      if (requiredVolume < 250) {
        return this.$toast?.error("Số ml cần bổ sung tối thiểu là 250ml!");
      }

      if (neededHours <= 0) {
        return this.$toast?.error("Thời gian cần máu phải lớn hơn 0 giờ!");
      }

      if (neededHours > 168) {
        return this.$toast?.error("Thời gian cần máu không nên vượt quá 168 giờ!");
      }

      this.creatingEmergency = group.blood_group;

      try {
        const res = await baseRequestDoctor.post(
          "/doctor/blood-inventory/intelligence/emergency-request",
          {
            blood_group: group.blood_group,
            required_volume_ml: requiredVolume,
            needed_in_hours: neededHours,
            reason: this.emergencyModal.reason || null,
          }
        );

        if (res.data.status) {
          this.$toast?.success(res.data.message || "Đã tạo yêu cầu khẩn cấp!");
          this.closeEmergencyModal();
          await this.loadDashboard();
        } else {
          this.$toast?.error(res.data.message || "Không tạo được yêu cầu khẩn cấp!");
        }
      } catch (e) {
        console.error(e);
        this.$toast?.error("Lỗi tạo yêu cầu khẩn cấp!");
      } finally {
        this.creatingEmergency = null;
      }
    },

    goGroup(group) {
      this.$router.push({
        path: "/Hospital/blood-inventory-by-type",
        query: { type: group.blood_group },
      });
    },

    goBatch(id) {
      this.$router.push({
        name: "BloodBatchDetail",
        params: { id },
      });
    },

    batchCode(id) {
      return id ? `BL${String(id).padStart(6, "0")}` : "-";
    },

    statusBadgeClass(status) {
      return {
        critical: "bg-danger",
        low: "bg-secondary",
        normal: "bg-success",
        overstock: "bg-info text-dark",
        expiring_risk: "bg-warning text-dark",
      }[status] || "bg-light text-dark border";
    },
  },
};
</script>

<style scoped>
.inventory-intel-page {
  background: #f7f8fa;
}

.intel-card,
.card {
  border-radius: 16px;
}

.intel-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.icon-danger {
  background: #fee2e2;
  color: #dc3545;
}

.icon-primary {
  background: #dbeafe;
  color: #0d6efd;
}

.icon-warning {
  background: #fff3cd;
  color: #b45309;
}

.icon-expired {
  background: #fee2e2;
  color: #991b1b;
}

.icon-dark {
  background: #e5e7eb;
  color: #111827;
}

.blood-filter-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  max-width: 760px;
}

.recommendation-list,
.batch-list {
  max-height: 520px;
  overflow-y: auto;
}

.recommend-card {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #f1f3f5;
  background: linear-gradient(180deg, #fff, #fff7f7);
}

.batch-row {
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
}

.batch-row:hover {
  color: #dc3545;
}

.batch-row:last-child {
  border-bottom: 0;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
}

.modal-card-lg {
  max-width: 920px;
}

.modal-header,
.modal-footer {
  padding: 14px 18px;
}

.modal-body {
  padding: 18px;
}

.expired-table-wrap {
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid #f1f3f5;
  border-radius: 12px;
}

.emergency-modal {
  background: rgba(15, 23, 42, 0.25);
  z-index: 1055;
}

.emergency-modal .modal-content {
  border-radius: 18px;
  overflow: hidden;
}

.emergency-modal .modal-header {
  border-bottom: 0;
  padding: 18px 20px;
}

.emergency-modal .modal-body {
  padding: 20px;
}

.emergency-modal .modal-footer {
  border-top: 1px solid #f1f3f5;
  padding: 14px 20px;
}

.modal-backdrop {
  z-index: 1050;
}

@media (max-width: 768px) {
  .blood-filter-tabs {
    justify-content: flex-start;
    max-width: 100%;
  }
}
</style>
