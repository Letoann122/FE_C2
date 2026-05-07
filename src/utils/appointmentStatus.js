export const APPOINTMENT_STATUS_LABEL = {
  REQUESTED: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  BOOKED: "Đã đặt",
  CHECKED_IN: "Đã check-in",
  SCREENING: "Đang sàng lọc",
  FAILED_SCREENING: "Không đủ điều kiện",
  DONATING: "Đang hiến máu",
  COMPLETED: "Hoàn thành",
  NO_SHOW: "Không đến",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

export const APPOINTMENT_STATUS_BADGE = {
  REQUESTED: "bg-warning text-dark",
  APPROVED: "bg-success",
  BOOKED: "bg-info text-dark",
  CHECKED_IN: "bg-primary",
  SCREENING: "bg-secondary",
  FAILED_SCREENING: "bg-danger",
  DONATING: "bg-danger-subtle text-danger",
  COMPLETED: "bg-dark",
  NO_SHOW: "bg-dark-subtle text-dark",
  REJECTED: "bg-danger",
  CANCELLED: "bg-secondary",
};

export const getAppointmentStatusLabel = (status) => {
  return APPOINTMENT_STATUS_LABEL[status] || status || "Không xác định";
};

export const getAppointmentStatusBadge = (status) => {
  return APPOINTMENT_STATUS_BADGE[status] || "bg-light text-dark border";
};