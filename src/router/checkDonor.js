import axios from "axios";
import { createToaster } from "@meforma/vue-toaster";

const toaster = createToaster({ position: "top-right" });
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function (to, from, next) {
  if (import.meta.env.VITE_SKIP_TOKEN === "true") {
    console.log("⚙️ DEV MODE: Bỏ qua checkToken (donor)");
    return next();
  }

  const token = localStorage.getItem("token_donor");
  if (!token) {
    toaster.error("Vui lòng đăng nhập tài khoản người hiến máu!");
    return next("/login");
  }

  axios
    .get(`${API_BASE}/api/donor/check-token`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((res) => {
      if (res.data.status) {
        localStorage.setItem("ho_ten_donor", res.data.ho_ten);
        localStorage.setItem("email_donor", res.data.email);
        next();
      } else {
        toaster.error(res.data.message || "Phiên đăng nhập hết hạn!");
        next("/login");
      }
    })
    .catch(() => {
      toaster.error("Không thể xác thực tài khoản người hiến máu!");
      next("/login");
    });
}
