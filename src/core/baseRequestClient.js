import axios from "axios";
import { createToaster } from "@meforma/vue-toaster";

const toast = createToaster();

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const baseRequestClient = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 8000,
});

// 🧩 Gắn token vào mọi request
baseRequestClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token_donor");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚙️ Xử lý lỗi trả về từ BE
baseRequestClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // DEV MODE skip
    if (import.meta.env.VITE_SKIP_TOKEN === "true") {
      console.log("⚙️ DEV MODE: Bỏ qua lỗi token (client)");
      return Promise.resolve({ data: { status: true, data: [] } });
    }

    const requestUrl = error.config?.url || "";
    const status = error.response?.status;

    // ❗ KHÔNG xử lý token nếu request là /login
    if (requestUrl.includes("/login")) {
      return Promise.reject(error);
    }

    if (error.response) {
      const data = error.response.data;
      const hasValidationErrors =
        status === 422 &&
        data &&
        data.errors &&
        typeof data.errors === "object";

      // 🔥 Token hết hạn / bị khóa / không hợp lệ → redirect
      if (status === 401 || status === 403) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token_donor");
        localStorage.removeItem("user_donor");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return Promise.reject(error);
      }

      if (status >= 500) {
        toast.error("Lỗi máy chủ. Vui lòng thử lại sau!");
      } else if (!hasValidationErrors && data?.message) {
        toast.error(data.message);
      } else if (!hasValidationErrors) {
        toast.error("Có lỗi xảy ra!");
      }
    } else {
      toast.error("Không thể kết nối đến máy chủ!");
    }

    return Promise.reject(error);
  }
);

export default baseRequestClient;
