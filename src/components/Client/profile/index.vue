<template>
  <div class="container-fluid bg-body-tertiary py-5">
    <div class="row justify-content-center g-4">
      <!-- SIDEBAR -->
      <div class="col-md-3 col-lg-2">
        <div class="card border-0 shadow-sm rounded-4 p-2">
          <div class="list-group list-group-flush">
            <router-link
              to="/profile"
              class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold"
            >
              <i class="bi bi-person-fill me-2"></i>
              Hồ sơ cá nhân
            </router-link>

            <router-link
              to="/blood-donation-history"
              class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold"
            >
              <i class="bi bi-arrow-counterclockwise me-2"></i>
              Lịch sử hiến máu
            </router-link>

            <router-link
              to="/account-security"
              class="list-group-item list-group-item-action rounded-3 my-1"
              active-class="active text-danger fw-bold"
            >
              <i class="bi bi-shield-lock-fill me-2"></i>
              Bảo mật tài khoản
            </router-link>
          </div>
        </div>
      </div>

      <!-- CONTENT -->
      <div class="col-md-9 col-lg-9">
        <!-- PROFILE CARD -->
        <div class="card shadow-sm border-0 rounded-4 mb-4">
          <div class="card-body p-4">
            <div
              class="d-flex flex-column flex-lg-row justify-content-between align-items-start"
            >
              <div>
                <h4 class="fw-bold mb-1">
                  <i
                    class="fa-solid fa-user me-2"
                    style="color: #ff0000"
                  ></i>
                  Hồ sơ cá nhân
                </h4>

                <p class="text-muted mb-0">
                  Thông tin cá nhân và thành tích hiến máu
                </p>
              </div>

              <button
                class="btn btn-danger mt-3 mt-lg-0"
                data-bs-toggle="modal"
                data-bs-target="#editProfileModal"
              >
                <i class="bi bi-pencil-square me-2"></i>
                Chỉnh sửa
              </button>
            </div>

            <hr class="my-4" />

            <div class="row g-4">
              <div class="col-lg-4">
                <div class="profile-stat-card">
                  <div class="stat-label">Hạng hiện tại</div>

                  <div class="rank-badge mt-2">
                    {{ rankLabel }}
                  </div>

                  <div class="small text-muted mt-2">
                    {{ achievementSummary.exp_points || 0 }} EXP
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <div class="profile-stat-card">
                  <div class="stat-label">Số lần hiến máu</div>

                  <div class="stat-number text-danger">
                    {{ achievementSummary.donation_count || 0 }}
                  </div>

                  <div class="small text-muted">
                    Tổng lượt hiến thành công
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <div class="profile-stat-card">
                  <div class="stat-label">Tổng lượng máu</div>

                  <div class="stat-number text-danger">
                    {{ formatNumber(achievementSummary.total_blood_ml || 0) }}
                    ml
                  </div>

                  <div class="small text-muted">
                    Đã đóng góp cho cộng đồng
                  </div>
                </div>
              </div>
            </div>

            <div class="row mt-4">
              <div class="col-lg-6">
                <div class="info-item">
                  <div class="info-label">Họ và tên</div>
                  <div class="info-value">
                    {{ profile.full_name || "-" }}
                  </div>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="info-item">
                  <div class="info-label">Ngày sinh</div>
                  <div class="info-value">
                    {{ profile.birthday || "-" }}
                  </div>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="info-item">
                  <div class="info-label">Số điện thoại</div>
                  <div class="info-value">
                    {{ profile.phone || "-" }}
                  </div>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="info-item">
                  <div class="info-label">Nhóm máu</div>
                  <div class="info-value blood-group">
                    {{ profile.blood_group || "-" }}
                  </div>
                </div>
              </div>

              <div class="col-lg-12">
                <div class="info-item">
                  <div class="info-label">Địa chỉ</div>
                  <div class="info-value">
                    {{ profile.address || "-" }}
                  </div>
                </div>
              </div>

              <div class="col-lg-12">
                <div class="info-item">
                  <div class="info-label">Tiền sử y tế</div>
                  <div class="info-value">
                    {{ profile.medical_history || "Không có" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ACHIEVEMENTS -->
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body p-4">
            <div
              class="d-flex justify-content-between align-items-center mb-4"
            >
              <div>
                <h5 class="fw-bold mb-1">
                  <i class="bi bi-trophy-fill text-warning me-2"></i>
                  Thành tích hiến máu
                </h5>

                <div class="text-muted small">
                  {{ achievementSummary.unlocked_achievements || 0 }}/{{ achievementSummary.total_achievements || 0 }}
                  thành tích đã mở khóa
                </div>
              </div>
            </div>

            <div class="row g-3">
              <div
                v-for="item in achievements"
                :key="item.id"
                class="col-md-6 col-xl-4"
              >
                <div
                  class="achievement-card"
                  :class="{
                    locked: !item.is_unlocked,
                  }"
                >
                  <div
                    class="achievement-icon"
                    :class="`bg-${item.badge_color || 'danger'}`"
                  >
                    <i :class="`bi ${item.icon}`"></i>
                  </div>

                  <div class="achievement-content">
                    <div class="achievement-name">
                      {{ item.name }}
                    </div>

                    <div class="achievement-description">
                      {{ item.description }}
                    </div>

                    <div class="achievement-progress mt-2">
                      <div
                        class="progress"
                        style="height: 8px;"
                      >
                        <div
                          class="progress-bar bg-danger"
                          :style="{
                            width:
                              item.progress_percent + '%',
                          }"
                        ></div>
                      </div>

                      <div
                        class="d-flex justify-content-between mt-1 small text-muted"
                      >
                        <span>
                          {{ item.display_current_value ?? item.current_value }}/{{ item.requirement_value }}
                        </span>

                        <span>
                          {{ item.progress_percent }}%
                        </span>
                      </div>
                    </div>

                    <div
                      v-if="item.is_unlocked"
                      class="unlock-date"
                    >
                      <i class="bi bi-check-circle-fill text-success me-1"></i>
                      Đã mở khóa
                    </div>

                    <div
                      v-else
                      class="unlock-date text-muted"
                    >
                      <i class="bi bi-lock-fill me-1"></i>
                      Chưa mở khóa
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div
      class="modal fade"
      id="editProfileModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 rounded-4">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">
              Chỉnh sửa hồ sơ
            </h5>

            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div class="modal-body">
            <div class="row">
              <div class="col-lg-6">
                <label class="mb-2">Họ và tên</label>

                <input
                  v-model="profile.full_name"
                  type="text"
                  class="form-control"
                />
              </div>

              <div class="col-lg-6">
                <label class="mb-2">Ngày sinh</label>

                <input
                  v-model="profile.birthday"
                  type="date"
                  class="form-control"
                />
              </div>

              <div class="col-lg-6">
                <label class="mt-3 mb-2">Số điện thoại</label>

                <input
                  v-model="profile.phone"
                  type="text"
                  class="form-control"
                />
              </div>

              <div class="col-lg-6">
                <label class="mt-3 mb-2">Nhóm máu</label>

                <input
                  :value="profile.blood_group"
                  disabled
                  class="form-control"
                />
              </div>

              <div class="col-lg-12">
                <label class="mt-3 mb-2">Địa chỉ</label>

                <textarea
                  v-model="profile.address"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div class="col-lg-12">
                <label class="mt-3 mb-2">Tiền sử y tế</label>

                <textarea
                  v-model="profile.medical_history"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer border-0">
            <button
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Đóng
            </button>

            <button
              class="btn btn-danger"
              @click="updateProfile"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";

export default {
  name: "ProfileClient",

  data() {
    return {
      profile: {
        full_name: "",
        birthday: "",
        gender: "",
        phone: "",
        address: "",
        blood_group: "",
        medical_history: "",
      },

      achievementSummary: {},

      achievements: [],
    };
  },

  computed: {
    rankLabel() {
      const rank = String(
        this.achievementSummary.donor_rank || "bronze"
      ).toLowerCase();

      switch (rank) {
        case "diamond":
          return "Kim Cương";

        case "gold":
          return "Vàng";

        case "silver":
          return "Bạc";

        default:
          return "Đồng";
      }
    },
  },

  mounted() {
    this.loadProfile();
    this.loadAchievements();
  },

  methods: {
    formatNumber(number) {
      return Number(number || 0).toLocaleString("vi-VN");
    },

    async loadProfile() {
      try {
        const res = await baseRequestClient.get("/donor/profile");

        if (res.data.status) {
          this.profile = res.data.data;
        }
      } catch (err) {
        this.$toast?.error(
          "Không thể tải thông tin hồ sơ!"
        );
      }
    },

    async loadAchievements() {
      try {
        const res = await baseRequestClient.get(
          "/donor/achievements/profile"
        );

        if (res.data.status) {
          this.achievementSummary =
            res.data.data.summary || {};

          this.achievements =
            res.data.data.achievements || [];
        }
      } catch (err) {
        console.error(err);
      }
    },

    async updateProfile() {
      try {
        if (
          !this.profile.full_name ||
          !this.profile.full_name.trim()
        ) {
          this.$toast?.error(
            "Họ và tên không được để trống!"
          );
          return;
        }

        if (!this.profile.birthday) {
          this.$toast?.error(
            "Ngày sinh không được để trống!"
          );
          return;
        }

        if (!this.profile.phone) {
          this.$toast?.error(
            "Vui lòng nhập số điện thoại!"
          );
          return;
        }

        const payload = {
          full_name: this.profile.full_name,
          birthday: this.profile.birthday,
          gender: this.profile.gender,
          phone: this.profile.phone,
          address: this.profile.address,
          medical_history:
            this.profile.medical_history,
        };

        const res = await baseRequestClient.put(
          "/donor/profile",
          payload
        );

        if (res.data.status) {
          this.$toast?.success(
            res.data.message ||
              "Cập nhật hồ sơ thành công!"
          );

          const modal =
            bootstrap.Modal.getInstance(
              document.getElementById(
                "editProfileModal"
              )
            );

          if (modal) {
            modal.hide();
          }

          this.loadProfile();
        } else {
          this.$toast?.error(
            res.data.message ||
              "Không thể cập nhật hồ sơ!"
          );
        }
      } catch (err) {
        this.$toast?.error(
          err.response?.data?.message ||
            "Lỗi cập nhật hồ sơ!"
        );
      }
    },
  },
};
</script>

<style scoped>
.list-group-item.active {
  background-color: #ffecec !important;
  color: #dc3545 !important;
}

.profile-stat-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #eee;
  padding: 20px;
  height: 100%;
}

.stat-label {
  color: #888;
  font-size: 14px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
}

.rank-badge {
  display: inline-block;
  background: linear-gradient(
    135deg,
    #dc3545,
    #ff6b6b
  );
  color: white;
  padding: 8px 18px;
  border-radius: 999px;
  font-weight: 700;
}

.info-item {
  margin-bottom: 20px;
}

.info-label {
  color: #888;
  font-size: 14px;
  margin-bottom: 4px;
}

.info-value {
  font-weight: 600;
}

.blood-group {
  color: #dc3545;
  font-size: 20px;
}

.achievement-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 18px;
  padding: 18px;
  display: flex;
  gap: 14px;
  transition: all 0.2s ease;
  height: 100%;
}

.achievement-card:hover {
  transform: translateY(-3px);
}

.achievement-card.locked {
  opacity: 0.65;
}

.achievement-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.achievement-content {
  flex: 1;
}

.achievement-name {
  font-weight: 700;
}

.achievement-description {
  font-size: 13px;
  color: #777;
  margin-top: 4px;
}

.unlock-date {
  margin-top: 10px;
  font-size: 13px;
}
</style>