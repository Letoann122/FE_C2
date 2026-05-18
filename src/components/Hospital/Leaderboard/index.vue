<template>
  <div class="container py-4">
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h4 class="fw-bold mb-1 text-danger">
              <i class="bi bi-trophy-fill me-2"></i>
              Bảng xếp hạng người hiến máu
            </h4>

            <p class="text-muted mb-0">
              Theo dõi những donor tích cực nhất trong hệ thống theo tháng, năm hoặc tổng kết.
            </p>
          </div>

          <button
            class="btn btn-outline-danger"
            @click="loadDetail"
            :disabled="loadingDetail"
          >
            <span
              v-if="loadingDetail"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            <i v-else class="bi bi-arrow-clockwise me-1"></i>
            Tải lại
          </button>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 class="fw-bold mb-0">
            <i class="bi bi-table text-danger me-2"></i>
            Bảng xếp hạng chi tiết
          </h5>

          <div class="d-flex gap-2 flex-wrap">
            <select
              class="form-select"
              style="width: 230px"
              v-model="filterType"
              @change="loadDetail"
            >
              <option value="all_time">Top tổng số lần</option>
              <option value="volume">Top tổng lượng máu</option>
              <option value="campaign">Top tham gia chiến dịch</option>
              <option value="emergency">Top khẩn cấp</option>
            </select>

            <select
              class="form-select"
              style="width: 150px"
              v-model="filterMonth"
              @change="loadDetail"
            >
              <option value="">Tất cả tháng</option>
              <option v-for="m in 12" :key="m" :value="m">
                Tháng {{ m }}
              </option>
            </select>

            <select
              class="form-select"
              style="width: 140px"
              v-model="filterYear"
              @change="loadDetail"
            >
              <option value="">Tất cả năm</option>
              <option v-for="y in yearOptions" :key="y" :value="y">
                {{ y }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="loadingDetail" class="text-center py-5">
          <div class="spinner-border text-danger"></div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Hạng</th>
                <th>Donor</th>
                <th>Nhóm máu</th>
                <th>Số lần hiến</th>
                <th>Tổng lượng máu</th>
                <th>Chiến dịch</th>
                <th>Khẩn cấp</th>
                <th>EXP</th>
                <th>Rank</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="detailList.length === 0">
                <td colspan="9" class="text-center text-muted py-4">
                  Chưa có dữ liệu bảng xếp hạng.
                </td>
              </tr>

              <tr v-for="(item, index) in detailList" :key="item.donor_id">
                <td>
                  <span class="rank-number small-rank" :class="rankClass(index)">
                    {{ index + 1 }}
                  </span>
                </td>

                <td>
                  <div class="fw-bold">
                    {{ item.full_name || "Không rõ" }}
                  </div>

                  <div class="small text-muted">
                    {{ item.phone || item.email || "" }}
                  </div>
                </td>

                <td>
                  <span class="badge bg-danger">
                    {{ item.blood_group || "N/A" }}
                  </span>
                </td>

                <td>
                  {{ getDonationCount(item) }}
                </td>

                <td>
                  {{ formatNumber(getVolume(item)) }} ml
                </td>

                <td>
                  {{ item.campaign_donation_count || 0 }}
                </td>

                <td>
                  {{ getEmergencyCount(item) }}
                </td>

                <td>
                  {{ formatNumber(item.exp_points || 0) }}
                </td>

                <td>
  <span class="badge" :class="leaderboardRankBadgeClass(index)">
    {{ leaderboardRankLabel(index) }}
  </span>
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
  </div>
</template>

<script>
import baseRequestDoctor from "../../../core/baseRequestDoctor";

export default {
  name: "DoctorLeaderboard",

  data() {
    const currentYear = new Date().getFullYear();

    return {
      loadingDetail: false,
      errorMessage: "",
      filterType: "all_time",
      filterMonth: "",
      filterYear: currentYear,
      detailList: [],
      yearOptions: Array.from({ length: 7 }, (_, i) => currentYear - i),
    };
  },

  mounted() {
    this.loadDetail();
  },

  methods: {
    async loadDetail() {
      this.loadingDetail = true;
      this.errorMessage = "";

      try {
        let endpoint = "/doctor/leaderboard";

        if (this.filterType === "campaign") {
          endpoint = "/doctor/leaderboard/campaign";
        }

        if (this.filterType === "emergency") {
          endpoint = "/doctor/leaderboard/emergency";
        }

        const params = {
          type: this.filterType,
          limit: 50,
        };

        if (this.filterMonth) {
          params.month = this.filterMonth;
        }

        if (this.filterYear) {
          params.year = this.filterYear;
        }

        const res = await baseRequestDoctor.get(endpoint, {
          params,
        });

        if (res.data?.status) {
          this.detailList = (res.data.data || []).filter(
            (item) => this.getDonationCount(item) > 0
          );
        } else {
          this.errorMessage =
            res.data?.message || "Không tải được bảng xếp hạng.";
        }
      } catch (error) {
        console.error("loadDetail error:", error);
        this.errorMessage = "Không tải được bảng xếp hạng.";
      } finally {
        this.loadingDetail = false;
      }
    },

    getDonationCount(item) {
      return Number(
        item.donation_count ||
          item.campaign_donation_count ||
          item.emergency_donation_count ||
          0
      );
    },

    getVolume(item) {
      return Number(
        item.total_blood_ml ||
          item.campaign_volume_ml ||
          item.emergency_volume_ml ||
          0
      );
    },

    getEmergencyCount(item) {
      return Number(item.emergency_donation_count || 0);
    },

    formatNumber(value) {
      return Number(value || 0).toLocaleString("vi-VN");
    },

    rankLabel(rank) {
      const value = String(rank || "bronze").toLowerCase();

      switch (value) {
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

    rankBadgeClass(rank) {
      const value = String(rank || "bronze").toLowerCase();

      switch (value) {
        case "diamond":
          return "bg-info";
        case "gold":
          return "bg-warning text-dark";
        case "silver":
          return "bg-secondary";
        default:
          return "bg-danger";
      }
    },

    leaderboardRankLabel(index) {
  if (index === 0) return "Top 1";
  if (index === 1) return "Top 2";
  if (index === 2) return "Top 3";
  return `Top ${index + 1}`;
},

leaderboardRankBadgeClass(index) {
  if (index === 0) return "bg-warning text-dark";
  if (index === 1) return "bg-secondary";
  if (index === 2) return "bg-bronze";
  return "bg-light text-dark border";
},

    rankClass(index) {
      if (index === 0) return "top-1";
      if (index === 1) return "top-2";
      if (index === 2) return "top-3";

      return "";
    },
  },
};
</script>

<style scoped>
.rank-number {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #f1f1f1;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}

.small-rank {
  width: 30px;
  height: 30px;
}

.rank-number.top-1 {
  background: #ffd700;
  color: #5c4200;
}

.rank-number.top-2 {
  background: #c0c0c0;
  color: #333;
}

.rank-number.top-3 {
  background: #cd7f32;
  color: #fff;
}
.bg-bronze {
  background-color: #cd7f32 !important;
  color: #fff !important;
}
</style>