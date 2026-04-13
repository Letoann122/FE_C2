import axios from "axios";
import { createToaster } from "@meforma/vue-toaster";

const toast = createToaster();

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const baseRequestDoctor = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 8000,
});

// ==================== TOKEN CHUẨN CHO DOCTOR ====================
baseRequestDoctor.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token_doctor");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== HANDLE ERROR ====================
baseRequestDoctor.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip khi DEV MODE
    if (import.meta.env.VITE_SKIP_TOKEN === "true") {
      console.log("⚙ DEV MODE: Bỏ qua lỗi token (doctor)");
      return Promise.resolve({ data: { status: true, data: [] } });
    }

    const requestUrl = error.config?.url || "";
    const status = error.response?.status;

    // ❗ KHÔNG xử lý token nếu đang login
    if (requestUrl.includes("/login")) {
      return Promise.reject(error);
    }

    if (error.response) {
      const data = error.response.data;

      // 🔥 Token hết hạn / bị khóa / không hợp lệ
      if (status === 401 || status === 403) {
        toast.error("Phiên đăng nhập bác sĩ đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token_doctor");
        localStorage.removeItem("user_doctor");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);

        return Promise.reject(error);
      }

      if (status >= 500) {
        toast.error("Lỗi máy chủ, vui lòng thử lại!");
      } else if (data?.message) {
        toast.error(data.message);
      } else {
        toast.error("Có lỗi xảy ra!");
      }
    } else {
      toast.error("Không thể kết nối đến máy chủ!");
    }

    return Promise.reject(error);
  }
);

export default baseRequestDoctor;
