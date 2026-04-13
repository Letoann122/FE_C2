<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
      <h4 class="fw-bold mb-0">
        <i class="bi bi-bell-fill text-danger me-2"></i> Trung tâm thông báo
      </h4>
      <div>
        <button
          v-for="(filter, index) in filters"
          :key="index"
          class="btn btn-sm me-2"
          :class="filter.value === currentFilter ? 'btn-danger text-white' : 'btn-outline-secondary'"
          @click="currentFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Notification list -->
    <div v-if="filteredNotifications.length">
      <div
        v-for="(item, index) in filteredNotifications"
        :key="index"
        class="card mb-3 border-0 shadow-sm rounded-3 notification-item"
        @click="goToNotification(item)"
      >
        <div class="card-body d-flex justify-content-between align-items-start">
          <div class="me-3">
            <i :class="item.icon + ' fs-4 text-danger'"></i>
          </div>

          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1">{{ item.title }}</h6>
            <small class="text-muted">{{ item.time }}</small>
            <p class="mb-0 mt-1 text-secondary">{{ item.message }}</p>
          </div>

          <div>
            <span v-if="!item.read" class="badge bg-danger rounded-circle p-2">&nbsp;</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-muted py-5">
      <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
      Không có thông báo nào
    </div>

    <!-- Actions -->
    <div class="d-flex justify-content-end mt-3 gap-3" v-if="notifications.length">
      <button class="btn btn-outline-secondary" @click="clearAll">
        <i class="bi bi-trash me-2"></i> Xóa tất cả
      </button>
      <button class="btn btn-dark" @click="markAllAsRead">
        <i class="bi bi-check2-circle me-2"></i> Đánh dấu đã đọc tất cả
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "NotificationCenter",
  data() {
    return {
      
      currentFilter: "all",
      filters: [
        { label: "Tất cả", value: "all" },
        { label: "Chưa đọc", value: "unread" },
        { label: "Đã đọc", value: "read" },
      ],

      // 🔹 Dữ liệu giả lập (mock) — sẽ bị thay thế bằng API khi backend xong
      notifications: [
        {
          title: "Nhắc nhở lịch hiến máu",
          message: "Bạn có lịch hiến máu vào ngày mai tại Bệnh viện Bạch Mai. Vui lòng chuẩn bị sức khỏe tốt nhất.",
          time: "2 giờ trước",
          icon: "bi bi-calendar-event-fill",
          read: false,
          link: "/lich-hien-mau",
        },
        {
          title: "Chiến dịch hiến máu mới",
          message: "Chiến dịch 'Giọt máu yêu thương' sẽ diễn ra tại ĐH Hà Nội từ 15-20/01/2025.",
          time: "5 giờ trước",
          icon: "bi bi-megaphone-fill",
          read: false,
          link: "/chien-dich-moi",
        },
        {
          title: "Thông báo khẩn cấp",
          message: "Thiếu hụt máu nhóm O- tại các bệnh viện. Kêu gọi người hiến máu tình nguyện đăng ký ngay.",
          time: "1 ngày trước",
          icon: "bi bi-exclamation-triangle-fill",
          read: true,
          link: "/tin-khan",
        },
      ],
    };
  },
  computed: {
    filteredNotifications() {
      if (this.currentFilter === "unread") {
        return this.notifications.filter((n) => !n.read);
      } else if (this.currentFilter === "read") {
        return this.notifications.filter((n) => n.read);
      }
      return this.notifications;
    },
  },
  methods: {
    // 🔹 Khi backend xong, thay phần mock này bằng API thật
    async fetchNotifications() {
      try {
        const res = await axios.get("/api/notifications");
        this.notifications = res.data;
      } catch (error) {
        console.error("Không thể tải danh sách thông báo:", error);
      }
    },

    goToNotification(item) {
      item.read = true;
      if (item.link) {
        this.$router.push(item.link);
      }
    },

    clearAll() {
      if (confirm("Bạn có chắc muốn xóa tất cả thông báo?")) {
        this.notifications = [];
      }
    },

    markAllAsRead() {
      this.notifications.forEach((n) => (n.read = true));
    },
  },

  mounted() {
    // Khi backend hoàn thiện, chỉ cần bật dòng này:
    // this.fetchNotifications();
  },
};
</script>

<style scoped>
.card {
  transition: transform 0.2s, background-color 0.2s;
  cursor: pointer;
}
.card:hover {
  transform: translateY(-3px);
  background-color: #fff7f7;
}
.badge {
  width: 10px;
  height: 10px;
}
</style>
