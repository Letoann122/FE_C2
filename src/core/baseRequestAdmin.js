import axios from "axios";
import { createToaster } from "@meforma/vue-toaster";

const toast = createToaster();

// Lấy base URL từ env, fallback localhost cho chắc
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const baseRequestAdmin = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 8000,
});

// 🧩 Gắn token vào mọi request
baseRequestAdmin.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token_admin");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚙️ Xử lý lỗi trả về từ BE
baseRequestAdmin.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Nếu đang bật DEV MODE thì bỏ qua toàn bộ lỗi xác thực
    if (import.meta.env.VITE_SKIP_TOKEN === "true") {
      console.log("⚙️ DEV MODE: Bỏ qua lỗi token (admin)");
      return Promise.resolve({ data: { status: true, data: [] } });
    }

    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        toast.error("Phiên đăng nhập admin đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token_admin");
        localStorage.removeItem("user_admin");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else if (status >= 500) {
        toast.error("Lỗi máy chủ. Vui lòng thử lại sau!");
      } else if (error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra!");
      }
    } else {
      toast.error("Không thể kết nối đến máy chủ!");
    }
    return Promise.reject(error);
  }
);

export default baseRequestAdmin;
