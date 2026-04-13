<template>
  <div class="nav-container primary-menu">
    <div class="mobile-topbar-header">
      <div>
        <img src="../../../assets/images/logo-icon.png" class="logo-icon" alt="logo icon" />
      </div>
      <div>
        <h4 class="logo-text">Admin</h4>
      </div>
      <div class="toggle-icon ms-auto"><i class="bx bx-arrow-to-left"></i></div>
    </div>

    <nav class="navbar navbar-expand-xl w-100">
      <ul class="navbar-nav justify-content-start flex-grow-1 gap-1">
        <li class="nav-item">
          <router-link
            to="/admin/dashboard"
            class="nav-link"
            exact-active-class="is-active"
          >
            <div class="parent-icon"><i class="fa-solid fa-house"></i></div>
            <div class="menu-title">Dashboard</div>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/admin/content-management"
            class="nav-link"
            exact-active-class="is-active"
          >
            <div class="parent-icon"><i class="fa-solid fa-newspaper"></i></div>
            <div class="menu-title">Nội dung & tin tức</div>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/admin/doctor-approve"
            class="nav-link"
            exact-active-class="is-active"
          >
            <div class="parent-icon"><i class="fa-solid fa-user-doctor"></i></div>
            <div class="menu-title">Xét duyệt bác sĩ</div>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/admin/create-campaign"
            class="nav-link"
            exact-active-class="is-active"
          >
            <div class="parent-icon"><i class="fa-solid fa-bullhorn"></i></div>
            <div class="menu-title">Chiến dịch</div>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/admin/user-management"
            class="nav-link"
            exact-active-class="is-active"
          >
            <div class="parent-icon"><i class="fa-solid fa-users"></i></div>
            <div class="menu-title">Quản lý người dùng</div>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/admin/blood-inventory"
            class="nav-link"
            exact-active-class="is-active"
          >
            <div class="parent-icon"><i class="fa-solid fa-droplet"></i></div>
            <div class="menu-title">Quản lý kho máu</div>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/admin/appoint-control"
            class="nav-link"
            exact-active-class="is-active"
          >
            <div class="parent-icon"><i class="fa-solid fa-calendar-check"></i></div>
            <div class="menu-title">Quản lý lịch hẹn</div>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: "MenuRocker",
};
</script>

<style scoped>
/* link base */
.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  color: #6c757d;
  border-radius: 10px;
  transition: color 0.2s ease, background 0.2s ease;
  text-decoration: none;
}

/* hover nhẹ thôi (không fill gắt) */
.nav-link:hover {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.06);
}

/* ACTIVE: chỉ đỏ + gạch chân mảnh (giống Hospital, gọn hơn ảnh 1) */
.nav-link.is-active {
  color: #dc3545 !important;
  font-weight: 700;
  background: transparent !important;
  box-shadow: none !important;
  position: relative;
}
.parent-icon {
  font-size: 18px;
  line-height: 1;
}

.menu-title {
  font-size: 14px;
  white-space: nowrap;
}
</style>
