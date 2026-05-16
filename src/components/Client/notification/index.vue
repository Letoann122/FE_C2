<template>
  <div class="container py-4">
    <!-- Header -->
    <div
      class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2 flex-wrap gap-2"
    >
      <h4 class="fw-bold mb-0">
        <i class="bi bi-bell-fill text-danger me-2"></i>
        Trung tâm thông báo
      </h4>

      <div class="d-flex flex-wrap gap-2">
        <button
          v-for="(filter, index) in filters"
          :key="index"
          class="btn btn-sm"
          :class="
            filter.value === currentFilter
              ? 'btn-danger text-white'
              : 'btn-outline-secondary'
          "
          @click="currentFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="text-center py-5"
    >
      <div class="spinner-border text-danger"></div>
    </div>

    <!-- Notification List -->
    <div v-else-if="filteredNotifications.length">
      <div
        v-for="(item, index) in filteredNotifications"
        :key="index"
        class="card mb-3 border-0 shadow-sm rounded-3 notification-item"
        :class="{ unread: !item.is_read }"
        @click="goToNotification(item)"
      >
        <div
          class="card-body d-flex justify-content-between align-items-start"
        >
          <!-- Icon -->
          <div class="me-3">
            <i
              :class="getNotificationIcon(item.type)"
              class="fs-4 text-danger"
            ></i>
          </div>

          <!-- Content -->
          <div class="flex-grow-1">
            <div
              class="d-flex justify-content-between align-items-start flex-wrap gap-2"
            >
              <h6 class="fw-bold mb-1">
                {{ item.title }}
              </h6>

              <small class="text-muted">
                {{ formatTime(item.created_at) }}
              </small>
            </div>

            <p class="mb-0 mt-1 text-secondary">
              {{ item.message }}
            </p>

            <div class="mt-2">
              <span
                class="badge"
                :class="getTypeBadge(item.type)"
              >
                {{ getTypeLabel(item.type) }}
              </span>

              <span
                v-if="item.priority === 'urgent'"
                class="badge bg-danger ms-2"
              >
                Khẩn cấp
              </span>
            </div>
          </div>

          <!-- Unread Dot -->
          <div class="ms-3">
            <span
              v-if="!item.is_read"
              class="badge bg-danger rounded-circle p-2"
            >
              &nbsp;
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else
      class="text-center text-muted py-5"
    >
      <i class="bi bi-inbox fs-1 mb-3 d-block"></i>
      Không có thông báo nào
    </div>

    <!-- Actions -->
    <div
      class="d-flex justify-content-end mt-3 gap-3"
      v-if="notifications.length"
    >
      <button
        class="btn btn-outline-secondary"
        @click="clearAll"
      >
        <i class="bi bi-trash me-2"></i>
        Xóa tất cả
      </button>

      <button
        class="btn btn-dark"
        @click="markAllAsRead"
      >
        <i class="bi bi-check2-circle me-2"></i>
        Đánh dấu đã đọc tất cả
      </button>
    </div>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";
import socket from "../../../core/socket";

export default {
  name: "NotificationCenter",

  data() {
    return {
      loading: false,

      currentFilter: "all",

      filters: [
        { label: "Tất cả", value: "all" },
        { label: "Chưa đọc", value: "unread" },
        { label: "Lịch hẹn", value: "appointment" },
        { label: "Khẩn cấp", value: "emergency" },
        { label: "Thành tích", value: "achievement" },
        { label: "Hệ thống", value: "system" },
      ],

      notifications: [],
    };
  },

  computed: {
    filteredNotifications() {
      if (this.currentFilter === "unread") {
        return this.notifications.filter(
          (n) => !n.is_read
        );
      }

      if (this.currentFilter === "all") {
        return this.notifications;
      }

      return this.notifications.filter(
        (n) => n.type === this.currentFilter
      );
    },
  },

  methods: {
    async fetchNotifications() {
      try {
        this.loading = true;

        const res = await baseRequestClient.get(
          "/donor/notifications"
        );

        if (res.data?.status) {
          this.notifications = res.data.data || [];
        }
      } catch (error) {
        console.error(
          "fetchNotifications error:",
          error
        );

        this.$toast.error(
          "Không tải được thông báo!"
        );
      } finally {
        this.loading = false;
      }
    },

    setupRealtimeNotification() {
      socket.off("new_user_notification");

      socket.on(
        "new_user_notification",
        ({ notification }) => {
          if (!notification) return;

          this.notifications.unshift(notification);

          this.$toast.success(
            notification.title || "Thông báo mới"
          );
        }
      );
    },

    async goToNotification(item) {
      try {
        if (!item.is_read) {
          await baseRequestClient.patch(
            `/donor/notifications/${item.id}/read`
          );

          item.is_read = 1;
        }

        if (item.action_url) {
          this.$router.push(item.action_url);
        }
      } catch (error) {
        console.error(
          "goToNotification error:",
          error
        );
      }
    },

    async clearAll() {
      if (
        !confirm(
          "Bạn có chắc muốn xóa tất cả thông báo?"
        )
      ) {
        return;
      }

      try {
        await baseRequestClient.delete(
          "/donor/notifications/clear-all"
        );

        this.notifications = [];

        this.$toast.success(
          "Đã xóa tất cả thông báo!"
        );
      } catch (error) {
        this.$toast.error(
          "Không thể xóa thông báo!"
        );
      }
    },

    async markAllAsRead() {
      try {
        await baseRequestClient.patch(
          "/donor/notifications/read-all"
        );

        this.notifications.forEach((n) => {
          n.is_read = 1;
        });

        this.$toast.success(
          "Đã đánh dấu tất cả là đã đọc!"
        );
      } catch (error) {
        this.$toast.error(
          "Không thể cập nhật thông báo!"
        );
      }
    },

    getNotificationIcon(type) {
      switch (type) {
        case "appointment":
          return "bi bi-calendar-check-fill";

        case "emergency":
          return "bi bi-exclamation-triangle-fill";

        case "achievement":
          return "bi bi-award-fill";

        case "campaign":
          return "bi bi-megaphone-fill";

        default:
          return "bi bi-bell-fill";
      }
    },

    getTypeBadge(type) {
      switch (type) {
        case "appointment":
          return "bg-primary";

        case "emergency":
          return "bg-danger";

        case "achievement":
          return "bg-warning text-dark";

        case "campaign":
          return "bg-success";

        default:
          return "bg-secondary";
      }
    },

    getTypeLabel(type) {
      switch (type) {
        case "appointment":
          return "Lịch hẹn";

        case "emergency":
          return "Khẩn cấp";

        case "achievement":
          return "Thành tích";

        case "campaign":
          return "Chiến dịch";

        default:
          return "Hệ thống";
      }
    },

    formatTime(date) {
      if (!date) return "";

      try {
        return new Date(date).toLocaleString("vi-VN");
      } catch {
        return "";
      }
    },
  },

  mounted() {
    this.fetchNotifications();
    this.setupRealtimeNotification();
  },
};
</script>

<style scoped>
.notification-item {
  transition:
    transform 0.2s,
    background-color 0.2s;
  cursor: pointer;
}

.notification-item:hover {
  transform: translateY(-3px);
  background-color: #fff7f7;
}

.notification-item.unread {
  border-left: 4px solid #dc3545 !important;
}

.badge {
  font-size: 11px;
}
</style>