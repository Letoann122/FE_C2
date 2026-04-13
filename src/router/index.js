import { createRouter, createWebHistory } from "vue-router";
import checkDoctor from "./checkDoctor";
import checkAdmin from "./checkAdmin";
import checkDonor from "./checkDonor";

const routes = [
  { path: "/", redirect: "/home-page" },
  // ===== CLIENT =====
  {
    path: "/home-page",
    component: () => import("../components/Homepage/index.vue"),
    meta: { layout: "client", title: "Trang chủ" },
  },
  {
    path: "/about",
    component: () => import("../components/Client/About/index.vue"),
    meta: { layout: "client", title: "Giới thiệu" },
  },
  {
    path: "/news",
    component: () => import("../components/Client/News/index.vue"),
    meta: { layout: "client", title: "Tin tức" },
  },
  {
    path: "/news/:id",
    component: () => import("../components/Client/NewsDetail/index.vue"),
    meta: { layout: "client", title: "Chi tiết tin" },
  },
  {
    path: "/see-details",
    component: () => import("../components/Client/Seedetails/index.vue"),
    meta: { layout: "client", title: "Xem chi tiết" },
  },
  {
    path: "/guide-health",
    component: () => import("../components/Client/Guidehealth/index.vue"),
    meta: { layout: "client", title: "Hướng dẫn sức khỏe" },
  },
  {
    path: "/contact",
    component: () => import("../components/Client/Contact/index.vue"),
    meta: { layout: "client", title: "Liên hệ" },
  },
  {
    path: "/login",
    component: () => import("../components/Client/Login/index.vue"),
    meta: { layout: "blank", title: "Đăng nhập" },
  },
  {
    path: "/register",
    component: () => import("../components/Client/Register/index.vue"),
    meta: { layout: "blank", title: "Đăng ký" },
  },
  {
    path: "/forgot-password",
    component: () => import("../components/Client/Forgotpassword/index.vue"),
    meta: { layout: "blank", title: "Quên mật khẩu" },
  },
  {
    path: "/change-password",
    component: () => import("../components/Client/Changepassword/index.vue"),
    meta: { layout: "blank", title: "Đổi mật khẩu" },
  },
  {
    path: "/fa-question",
    component: () => import("../components/Client/Faquestion/index.vue"),
    meta: { layout: "client", title: "FAQ" },
  },
  {
    path: "/privacy-policy",
    component: () => import("../components/Client/Privacypolicy/index.vue"),
    meta: { layout: "client", title: "Chính sách bảo mật" },
  },
  {
    path: "/terms-use",
    component: () => import("../components/Client/TermsofUse/index.vue"),
    meta: { layout: "client", title: "Điều khoản sử dụng" },
  },

  // ===== ADMIN =====
  {
    path: "/admin/dashboard",
    component: () => import("../components/Admin/Dashboard/index.vue"),
    meta: { layout: "admin", title: "Dashboard" },
    beforeEnter: checkAdmin,
  },
  {
    path: "/admin/content-management",
    component: () => import("../components/Admin/ContentManagement/index.vue"),
    meta: { layout: "admin", title: "Nội dung & tin tức" },
    beforeEnter: checkAdmin,
  },
  {
    path: "/admin/doctor-approve",
    component: () => import("../components/Admin/DuyetBacSi/index.vue"),
    meta: { layout: "admin", title: "Xét duyệt bác sĩ" },
    beforeEnter: checkAdmin,
  },
  {
    path: "/admin/create-campaign",
    component: () => import("../components/Admin/TaoChienLuoc/index.vue"),
    meta: { layout: "admin", title: "Chiến dịch" },
    beforeEnter: checkAdmin,
  },
  {
    path: "/admin/campaigns/:id",
    component: () => import("../components/Admin/CampaignDetail/index.vue"),
    meta: { layout: "admin", title: "Chi tiết chiến dịch" },
    beforeEnter: checkAdmin,
  },
  {
    path: "/admin/user-management",
    component: () => import("../components/Admin/QuanLyUser/index.vue"),
    meta: { layout: "admin", title: "Quản lý người dùng" },
    beforeEnter: checkAdmin,
  },
  {
    path: "/admin/blood-inventory",
    component: () => import("../components/Admin/BloodInventory/index.vue"),
    meta: { layout: "admin", title: "Quản lý kho máu" },
    beforeEnter: checkAdmin,
  },
  {
    path: "/admin/appoint-control",
    component: () => import("../components/Admin/AppointControl/index.vue"),
    meta: { layout: "admin", title: "Quản lý lịch hẹn" },
    beforeEnter: checkAdmin,
  },

  // ===== HOSPITAL =====
  {
    path: "/Hospital/dashboard",
    component: () => import("../components/Hospital/dashboard/index.vue"),
    meta: { layout: "Hospital", title: "Dashboard" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/blood-inventory",
    component: () => import("../components/Hospital/BloodInventory/index.vue"),
    meta: { layout: "Hospital", title: "Quản lý kho máu" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/blood-inventory-by-type",
    component: () => import("../components/Hospital/BloodGroupDetail/index.vue"),
    meta: { layout: "Hospital", title: "Chi tiết nhóm máu" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/blood-inventory/:id",
    name: "BloodBatchDetail",
    component: () => import("../components/Hospital/BloodBatchDetail/index.vue"),
    meta: { layout: "Hospital", title: "Chi tiết lô máu" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/blood-inventory/log",
    name: "BloodStockLog",
    component: () => import("../components/Hospital/BloodStockLog/index.vue"),
    meta: { layout: "Hospital", title: "Nhật ký kho" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/donor-management",
    component: () => import("../components/Hospital/DonorManagement/index.vue"),
    meta: { layout: "Hospital", title: "Quản lý Donor" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/donor-management/:id",
    name: "DonorDetail",
    component: () => import("../components/Hospital/DonorDetail/index.vue"),
    meta: { layout: "Hospital", title: "Chi tiết Donor" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/check-booking",
    component: () => import("../components/Hospital/CheckBooking/index.vue"),
    meta: { layout: "Hospital", title: "Quản lý đặt lịch" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/donation-complete",
    component: () => import("../components/Hospital/DonationComplete/index.vue"),
    meta: { layout: "Hospital", title: "Ghi nhận hiến máu" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/campaign-management",
    component: () => import("../components/Hospital/CampaignManagement/index.vue"),
    meta: { layout: "Hospital", title: "Chiến dịch" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/campaigns/:id",
    component: () => import("../components/Hospital/CampaignDetailView/index.vue"),
    meta: { layout: "Hospital", title: "Chi tiết chiến dịch" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/news",
    component: () => import("../components/Hospital/News/index.vue"),
    meta: { layout: "Hospital", title: "Tin tức" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/support",
    component: () => import("../components/Hospital/Support/index.vue"),
    meta: { layout: "Hospital", title: "Tư vấn & Hỗ trợ" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/report",
    component: () => import("../components/Hospital/Report/index.vue"),
    meta: { layout: "Hospital", title: "Báo cáo" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/profile",
    component: () => import("../components/Hospital/Profile/index.vue"),
    meta: { layout: "Hospital", title: "Hồ sơ" },
    beforeEnter: checkDoctor,
  },
  {
    path: "/Hospital/doi-mat-khau",
    component: () => import("../components/Hospital/DoiMatKhau/index.vue"),
    meta: { layout: "Hospital", title: "Đổi mật khẩu" },
    beforeEnter: checkDoctor,
  },

  // ===== DONOR =====
  {
    path: "/campaigns/:id",
    component: () => import("../components/Client/CampaignDetail/index.vue"),
    meta: { layout: "client", title: "Chi tiết chiến dịch" },
    beforeEnter: checkDonor,
  },
  {
    path: "/profile",
    component: () => import("../components/Client/profile/index.vue"),
    meta: { layout: "client", title: "Hồ sơ" },
    beforeEnter: checkDonor,
  },
  {
    path: "/blood-donation-history",
    component: () => import("../components/Client/blooddonationhistory/index.vue"),
    meta: { layout: "client", title: "Lịch sử hiến máu" },
    beforeEnter: checkDonor,
  },
  {
    path: "/account-security",
    component: () => import("../components/Client/accountsecurity/index.vue"),
    meta: { layout: "client", title: "Bảo mật tài khoản" },
    beforeEnter: checkDonor,
  },
  {
    path: "/register-blooddonation",
    component: () => import("../components/Client/Register_blooddonation/index.vue"),
    meta: { layout: "client", title: "Đăng ký hiến máu" },
    beforeEnter: checkDonor,
  },
  {
    path: "/notification",
    component: () => import("../components/Client/notification/index.vue"),
    meta: { layout: "client", title: "Thông báo" },
    beforeEnter: checkDonor,
  },

  // ===== NOT FOUND (ĐỂ CUỐI CÙNG) =====
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../components/Client/Notfound/index.vue"),
    meta: { layout: "client", title: "Không tìm thấy" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Set title theo meta.title
router.afterEach((to) => {
  const title = to.meta?.title;
  document.title = title ? String(title) : "Smart Blood Donation";
});

export default router;
