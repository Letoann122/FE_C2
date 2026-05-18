<template>
  <div class="container py-4">
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h4 class="fw-bold text-danger mb-1">
              <i class="fa-solid fa-award me-2"></i>
              Quản lý huy hiệu
            </h4>
            <p class="text-muted mb-0">
              Quản lý hệ thống thành tích
            </p>
          </div>

          <button class="btn btn-danger" @click="openCreateModal">
            <i class="fa-solid fa-circle-plus me-1"></i>
            Thêm huy hiệu
          </button>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 class="fw-bold mb-0">
            <i class="fa-solid fa-table text-danger me-2"></i>
            Danh sách huy hiệu
          </h5>

          <input
            v-model="keyword"
            class="form-control"
            style="max-width: 320px"
            placeholder="Tìm theo mã, tên, loại..."
          />
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-danger"></div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Icon</th>
                <th>Mã</th>
                <th>Tên huy hiệu</th>
                <th>Loại</th>
                <th>Mốc</th>
                <th>EXP</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th class="text-end">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="filteredAchievements.length === 0">
                <td colspan="9" class="text-center text-muted py-4">
                  Chưa có huy hiệu nào.
                </td>
              </tr>

              <tr v-for="item in filteredAchievements" :key="item.id">
                <td>
                  <div
                    class="achievement-icon"
                    :class="`bg-${item.badge_color || 'danger'}`"
                  >
                    <i :class="getIconClass(item.icon)"></i>
                  </div>
                </td>

                <td>
                  <span class="badge bg-light text-dark border">
                    {{ item.code }}
                  </span>
                </td>

                <td>
                  <div class="fw-bold">{{ item.name }}</div>
                  <div class="small text-muted">
                    {{ item.description || "Không có mô tả" }}
                  </div>
                </td>

                <td>
                  <span class="badge bg-danger-subtle text-danger">
                    {{ typeLabel(item.achievement_type) }}
                  </span>
                </td>

                <td>{{ item.requirement_value }}</td>
                <td>{{ item.exp_reward }}</td>
                <td>{{ item.sort_order }}</td>

                <td>
                  <span v-if="Number(item.is_active) === 1" class="badge bg-success">
                    Đang bật
                  </span>
                  <span v-else class="badge bg-secondary">
                    Đã tắt
                  </span>
                </td>

                <td class="text-end">
                  <button
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="openEditModal(item)"
                  >
                    Sửa
                  </button>

                  <button
                    class="btn btn-sm btn-outline-warning me-2"
                    @click="toggleAchievement(item)"
                  >
                    {{ Number(item.is_active) === 1 ? "Tắt" : "Bật" }}
                  </button>

                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="openDeleteModal(item)"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="errorMessage" class="alert alert-danger rounded-4 mt-3 mb-0">
          {{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- CREATE / EDIT MODAL -->
    <div
      class="modal fade"
      id="achievementModal"
      tabindex="-1"
      aria-hidden="true"
      ref="modalRef"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 rounded-4">
          <div class="modal-header">
            <h5 class="modal-title fw-bold text-danger">
              {{ isEdit ? "Cập nhật huy hiệu" : "Thêm huy hiệu" }}
            </h5>

            <button
              class="btn-close"
              data-bs-dismiss="modal"
              :disabled="saving"
            ></button>
          </div>

          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Mã huy hiệu</label>
                <input
                  v-model="form.code"
                  class="form-control"
                  placeholder="VD: DONATE_50"
                  :disabled="isEdit"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Tên huy hiệu</label>
                <input v-model="form.name" class="form-control" />
              </div>

              <div class="col-md-12">
                <label class="form-label">Mô tả</label>
                <textarea
                  v-model="form.description"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div class="col-md-4">
                <label class="form-label">Loại</label>
                <select v-model="form.achievement_type" class="form-select">
                  <option value="donation_count">Số lần hiến</option>
                  <option value="donation_volume">Tổng lượng máu</option>
                  <option value="campaign">Chiến dịch</option>
                  <option value="emergency">Khẩn cấp</option>
                  <option value="streak">Streak</option>
                  <option value="special">Đặc biệt</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">Mốc yêu cầu</label>
                <input
                  v-model.number="form.requirement_value"
                  type="number"
                  min="0"
                  class="form-control"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">EXP thưởng</label>
                <input
                  v-model.number="form.exp_reward"
                  type="number"
                  min="0"
                  class="form-control"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Font Awesome icon</label>
                <input
                  v-model="form.icon"
                  class="form-control"
                  placeholder="fa-solid fa-award"
                />
                <div class="form-text">
                  Ví dụ: fa-solid fa-heart, fa-solid fa-book, fa-solid fa-trophy
                </div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Màu badge</label>
                <select v-model="form.badge_color" class="form-select">
                  <option value="danger">Đỏ</option>
                  <option value="warning">Vàng</option>
                  <option value="success">Xanh lá</option>
                  <option value="primary">Xanh dương</option>
                  <option value="info">Info</option>
                  <option value="secondary">Xám</option>
                  <option value="dark">Đen</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">Thứ tự</label>
                <input
                  v-model.number="form.sort_order"
                  type="number"
                  class="form-control"
                />
              </div>

              <div class="col-md-12">
                <div class="border rounded-4 p-3 bg-light">
                  <div class="small text-muted mb-2">Xem trước</div>

                  <div class="d-flex align-items-center gap-3">
                    <div
                      class="achievement-icon"
                      :class="`bg-${form.badge_color || 'danger'}`"
                    >
                      <i :class="getIconClass(form.icon)"></i>
                    </div>

                    <div>
                      <div class="fw-bold">
                        {{ form.name || "Tên huy hiệu" }}
                      </div>
                      <div class="small text-muted">
                        {{ form.description || "Mô tả huy hiệu" }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              :disabled="saving"
            >
              Đóng
            </button>

            <button
              class="btn btn-danger"
              @click="saveAchievement"
              :disabled="saving"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div
      class="modal fade"
      id="deleteAchievementModal"
      tabindex="-1"
      aria-hidden="true"
      ref="deleteModalRef"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 rounded-4">
          <div class="modal-header">
            <h5 class="modal-title fw-bold text-danger">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              Xác nhận xoá huy hiệu
            </h5>

            <button
              class="btn-close"
              data-bs-dismiss="modal"
              :disabled="saving"
            ></button>
          </div>

          <div class="modal-body">
            <p class="mb-2">
              Bạn có chắc chắn muốn xoá huy hiệu này không?
            </p>

            <div class="border rounded-4 p-3 bg-light" v-if="deleteTarget">
              <div class="d-flex align-items-center gap-3">
                <div
                  class="achievement-icon"
                  :class="`bg-${deleteTarget.badge_color || 'danger'}`"
                >
                  <i :class="getIconClass(deleteTarget.icon)"></i>
                </div>

                <div>
                  <div class="fw-bold">
                    {{ deleteTarget.name }}
                  </div>
                  <div class="small text-muted">
                    Mã: {{ deleteTarget.code }}
                  </div>
                  <div class="small text-muted">
                    {{ deleteTarget.description || "Không có mô tả" }}
                  </div>
                </div>
              </div>
            </div>

            <div class="alert alert-warning mt-3 mb-0">
              Hành động này không thể hoàn tác.
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              :disabled="saving"
            >
              Huỷ
            </button>

            <button
              class="btn btn-danger"
              @click="confirmDeleteAchievement"
              :disabled="saving || !deleteTarget"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              <i v-else class="fa-solid fa-trash me-1"></i>
              Xoá huy hiệu
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import baseRequestAdmin from "../../../core/baseRequestAdmin";

export default {
  name: "AchievementManagement",

  data() {
    return {
      loading: false,
      saving: false,
      errorMessage: "",
      keyword: "",
      modalInstance: null,
      deleteModalInstance: null,
      deleteTarget: null,
      isEdit: false,
      selectedId: null,
      achievements: [],
      form: this.emptyForm(),
    };
  },

  computed: {
    filteredAchievements() {
      const key = this.keyword.trim().toLowerCase();

      if (!key) return this.achievements;

      return this.achievements.filter((item) => {
        return (
          String(item.code || "").toLowerCase().includes(key) ||
          String(item.name || "").toLowerCase().includes(key) ||
          String(item.achievement_type || "").toLowerCase().includes(key)
        );
      });
    },
  },

  mounted() {
    this.loadAchievements();
    this.initModal();
  },

  beforeUnmount() {
    if (this.modalInstance) {
      this.modalInstance.dispose();
      this.modalInstance = null;
    }

    if (this.deleteModalInstance) {
      this.deleteModalInstance.dispose();
      this.deleteModalInstance = null;
    }
  },

  methods: {
    emptyForm() {
      return {
        code: "",
        name: "",
        description: "",
        icon: "fa-solid fa-award",
        badge_color: "danger",
        achievement_type: "donation_count",
        requirement_value: 1,
        exp_reward: 100,
        sort_order: 0,
      };
    },

    getIconClass(icon) {
      const value = String(icon || "").trim();

      if (!value) {
        return "fa-solid fa-award";
      }

      const htmlClassMatch = value.match(/class=["']([^"']+)["']/);

      if (htmlClassMatch && htmlClassMatch[1]) {
        return htmlClassMatch[1];
      }

      const hasFontAwesomePrefix =
        value.includes("fa-solid") ||
        value.includes("fa-regular") ||
        value.includes("fa-brands");

      if (value.startsWith("fa-") && !hasFontAwesomePrefix) {
        return `fa-solid ${value}`;
      }

      if (value.includes("bi-")) {
        return "fa-solid fa-award";
      }

      return value;
    },

    initModal() {
      this.$nextTick(() => {
        const modalEl = this.$refs.modalRef;
        const deleteModalEl = this.$refs.deleteModalRef;

        if (window.bootstrap && modalEl) {
          this.modalInstance = new window.bootstrap.Modal(modalEl, {
            backdrop: "static",
            keyboard: false,
          });
        }

        if (window.bootstrap && deleteModalEl) {
          this.deleteModalInstance = new window.bootstrap.Modal(deleteModalEl, {
            backdrop: "static",
            keyboard: false,
          });
        }
      });
    },

    async loadAchievements() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const res = await baseRequestAdmin.get("/admin/achievements");

        if (res.data?.status) {
          this.achievements = res.data.data || [];
        } else {
          this.errorMessage = res.data?.message || "Không tải được huy hiệu!";
        }
      } catch (error) {
        console.error("loadAchievements error:", error);
        this.errorMessage = "Không tải được danh sách huy hiệu!";
      } finally {
        this.loading = false;
      }
    },

    openCreateModal() {
      this.isEdit = false;
      this.selectedId = null;
      this.form = this.emptyForm();

      this.modalInstance?.show();
    },

    openEditModal(item) {
      this.isEdit = true;
      this.selectedId = item.id;

      this.form = {
        code: item.code,
        name: item.name,
        description: item.description || "",
        icon: item.icon || "fa-solid fa-award",
        badge_color: item.badge_color || "danger",
        achievement_type: item.achievement_type || "donation_count",
        requirement_value: Number(item.requirement_value || 0),
        exp_reward: Number(item.exp_reward || 0),
        sort_order: Number(item.sort_order || 0),
        is_active: Number(item.is_active || 0),
      };

      this.modalInstance?.show();
    },

    async saveAchievement() {
      if (!this.form.code || !this.form.name) {
        this.$toast?.error?.("Vui lòng nhập mã và tên huy hiệu!");
        return;
      }

      this.saving = true;

      try {
        let res;

        const payload = {
          ...this.form,
          icon: this.getIconClass(this.form.icon),
        };

        if (this.isEdit) {
          res = await baseRequestAdmin.put(
            `/admin/achievements/${this.selectedId}`,
            payload
          );
        } else {
          res = await baseRequestAdmin.post("/admin/achievements", payload);
        }

        if (res.data?.status) {
          this.$toast?.success?.(res.data.message || "Lưu huy hiệu thành công!");
          this.modalInstance?.hide();
          await this.loadAchievements();
        } else {
          this.$toast?.error?.(res.data?.message || "Không thể lưu huy hiệu!");
        }
      } catch (error) {
        console.error("saveAchievement error:", error);
        this.$toast?.error?.(
          error?.response?.data?.message || "Không thể lưu huy hiệu!"
        );
      } finally {
        this.saving = false;
      }
    },

    async toggleAchievement(item) {
      try {
        const res = await baseRequestAdmin.patch(
          `/admin/achievements/${item.id}/toggle`
        );

        if (res.data?.status) {
          this.$toast?.success?.(res.data.message || "Đã cập nhật trạng thái!");
          await this.loadAchievements();
        } else {
          this.$toast?.error?.(res.data?.message || "Không thể cập nhật!");
        }
      } catch (error) {
        console.error("toggleAchievement error:", error);
        this.$toast?.error?.("Không thể cập nhật trạng thái!");
      }
    },

    openDeleteModal(item) {
      this.deleteTarget = item;
      this.deleteModalInstance?.show();
    },

    async confirmDeleteAchievement() {
      if (!this.deleteTarget) return;

      this.saving = true;

      try {
        const res = await baseRequestAdmin.delete(
          `/admin/achievements/${this.deleteTarget.id}`
        );

        if (res.data?.status) {
          this.$toast?.success?.(res.data.message || "Đã xoá huy hiệu!");
          this.deleteModalInstance?.hide();
          this.deleteTarget = null;
          await this.loadAchievements();
        } else {
          this.$toast?.error?.(res.data?.message || "Không thể xoá!");
        }
      } catch (error) {
        console.error("confirmDeleteAchievement error:", error);
        this.$toast?.error?.(
          error?.response?.data?.message || "Không thể xoá huy hiệu!"
        );
      } finally {
        this.saving = false;
      }
    },

    typeLabel(type) {
      const map = {
        donation_count: "Số lần hiến",
        donation_volume: "Tổng lượng máu",
        campaign: "Chiến dịch",
        emergency: "Khẩn cấp",
        streak: "Streak",
        special: "Đặc biệt",
      };

      return map[type] || type;
    },
  },
};
</script>

<style scoped>
.achievement-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
  flex-shrink: 0;
}

.bg-purple {
  background-color: #8e44ad !important;
}
</style>