<template>
    <div class="container py-4 nearby-page">
        <div class="mb-3">
            <h3 class="fw-bold mb-1">Tìm điểm hiến máu gần nhất</h3>
            <p class="text-muted mb-0">
                Khám phá các địa điểm hiến máu và bệnh viện gần bạn
            </p>
        </div>

        <div class="card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-body p-3">
                <div class="row g-2 align-items-center">
                    <div class="col-md-6">
                        <input
                            type="text"
                            class="form-control"
                            placeholder="Nhập địa chỉ hoặc vị trí của bạn..."
                            v-model.trim="filters.keyword"
                            @keyup.enter="search"
                        />
                    </div>

                    <div class="col-md-2">
                        <select class="form-select" v-model="filters.distance">
                            <option value="5">Trong vòng 5km</option>
                            <option value="10">Trong vòng 10km</option>
                            <option value="20">Trong vòng 20km</option>
                            <option value="50">Trong vòng 50km</option>
                        </select>
                    </div>

                    <div class="col-md-2">
                        <select class="form-select" v-model="filters.date">
                            <option value="today">Hôm nay</option>
                            <option value="tomorrow">Ngày mai</option>
                            <option value="upcoming">Sắp tới</option>
                        </select>
                    </div>

                    <div class="col-md-2">
                        <button
                            class="btn btn-danger w-100"
                            @click="search"
                            :disabled="loading"
                        >
                            {{ loading ? "Đang tải..." : "Tìm kiếm" }}
                        </button>
                    </div>
                </div>

                <div
                    v-if="showLocationFallback"
                    class="d-flex align-items-center gap-2 mt-3 small text-muted"
                >
                    <span>{{ locationHint }}</span>
                    <button
                        class="btn btn-sm btn-outline-secondary"
                        @click="retryGetCurrentLocation"
                        :disabled="gettingLocation"
                    >
                        {{ gettingLocation ? "Đang lấy vị trí..." : "Lấy vị trí lại" }}
                    </button>
                </div>

                <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0 py-2 small">
                    {{ errorMessage }}
                </div>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-lg-4">
                <div class="card border-0 shadow-sm rounded-4">
                    <div class="card-body p-3">
                        <h6 class="fw-bold mb-2">Địa điểm hiến máu</h6>
                        <div class="small text-muted mb-3">
                            Tìm thấy {{ displayedLocations.length }} địa điểm gần bạn
                        </div>

                        <div v-if="loading" class="text-center text-muted py-4">
                            Đang tải dữ liệu...
                        </div>

                        <div v-else-if="displayedLocations.length === 0" class="text-center text-muted py-4">
                            Không có dữ liệu phù hợp
                        </div>

                        <div
                            v-else
                            v-for="item in displayedLocations"
                            :key="`${item.type}-${item.id}`"
                            class="location-card mb-3 pb-3 border-bottom"
                            :class="{
                                active:
                                    selectedLocation &&
                                    selectedLocation.id === item.id &&
                                    selectedLocation.type === item.type,
                            }"
                            @click="selectLocation(item)"
                        >
                            <div class="d-flex justify-content-between align-items-start mb-1 gap-2">
                                <div class="fw-semibold">
                                    {{ item.name }}
                                </div>

                                <span
                                    class="badge rounded-pill flex-shrink-0"
                                    :class="
                                        item.type === 'site'
                                            ? 'bg-light text-danger border'
                                            : 'bg-danger-subtle text-danger border'
                                    "
                                >
                                    {{ item.type === "site" ? "Điểm hiến" : "Chiến dịch" }}
                                </span>
                            </div>

                            <div class="small text-muted mb-2">
                                {{ item.address || "Chưa cập nhật địa chỉ" }}
                            </div>

                            <div class="small mb-2 d-flex flex-wrap align-items-center gap-2">
                                <span :class="item.distance_km != null ? 'text-success' : 'text-muted'">
                                    <i class="bi bi-geo-alt-fill me-1"></i>
                                    {{ formatDistance(item.distance_km) }}
                                </span>

                                <span :class="getStatusClass(item)">
                                    {{ item.status_text }}
                                </span>
                            </div>

                            <div v-if="item.type === 'campaign'" class="small text-muted mb-2">
                                <i class="bi bi-calendar-event me-1"></i>
                                {{ formatDateRange(item.start_date, item.end_date) }}
                            </div>

                            <div v-if="hasSlotInfo(item)" class="slot-mini-box mb-2">
                                <div class="d-flex justify-content-between small">
                                    <span>Ca sáng</span>
                                    <strong>
                                        {{ item.slots.morning.available_count }}/{{ item.slots.morning.slot_capacity }}
                                    </strong>
                                </div>
                                <div class="progress mb-2" style="height: 5px">
                                    <div
                                        class="progress-bar bg-danger"
                                        :style="{ width: `${Math.min(item.slots.morning.percent || 0, 100)}%` }"
                                    ></div>
                                </div>

                                <div class="d-flex justify-content-between small">
                                    <span>Ca chiều</span>
                                    <strong>
                                        {{ item.slots.afternoon.available_count }}/{{ item.slots.afternoon.slot_capacity }}
                                    </strong>
                                </div>
                                <div class="progress" style="height: 5px">
                                    <div
                                        class="progress-bar bg-danger"
                                        :style="{ width: `${Math.min(item.slots.afternoon.percent || 0, 100)}%` }"
                                    ></div>
                                </div>
                            </div>

                            <div class="d-flex flex-wrap gap-1 mb-2">
                                <span
                                    v-for="(badge, index) in item.badges"
                                    :key="index"
                                    class="badge custom-badge"
                                    :class="getBadgeClass(item.type, index)"
                                >
                                    {{ badge }}
                                </span>
                            </div>

                            <button class="btn btn-danger w-100 btn-sm" @click.stop="handleBooking(item)">
                                Đặt lịch ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-8">
                <div class="card border-0 shadow-sm rounded-4 h-100">
                    <div class="card-body p-3">
                        <h6 class="fw-bold mb-2">Bản đồ địa điểm</h6>

                        <div class="map-placeholder bg-light rounded-3 mb-3 overflow-hidden">
                            <iframe
                                v-if="selectedMapUrl"
                                :src="selectedMapUrl"
                                width="100%"
                                height="100%"
                                style="border: 0"
                                allowfullscreen=""
                                loading="lazy"
                                referrerpolicy="no-referrer-when-downgrade"
                            ></iframe>

                            <div
                                v-else
                                class="h-100 d-flex justify-content-center align-items-center"
                            >
                                <div class="text-center text-muted">
                                    <i class="bi bi-map fs-2"></i>
                                    <div class="small mt-2">
                                        Chưa có dữ liệu bản đồ cho địa điểm này
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="selectedLocation" class="selected-detail">
                            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                                <div>
                                    <h5 class="fw-bold mb-1">{{ selectedLocation.name }}</h5>
                                    <div class="small text-muted">
                                        {{ selectedLocation.address || "Chưa cập nhật địa chỉ" }}
                                    </div>
                                </div>

                                <span
                                    class="badge rounded-pill"
                                    :class="
                                        selectedLocation.type === 'site'
                                            ? 'bg-light text-danger border'
                                            : 'bg-danger-subtle text-danger border'
                                    "
                                >
                                    {{
                                        selectedLocation.type === "site"
                                            ? "Điểm hiến cố định"
                                            : "Chiến dịch"
                                    }}
                                </span>
                            </div>

                            <div class="row g-2 mb-3">
                                <div class="col-md-4">
                                    <div class="info-box">
                                        <div class="small text-muted">Khoảng cách</div>
                                        <div class="fw-semibold">
                                            {{ formatDistance(selectedLocation.distance_km) }}
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="info-box">
                                        <div class="small text-muted">Trạng thái</div>
                                        <div class="fw-semibold" :class="getStatusClass(selectedLocation)">
                                            {{ selectedLocation.status_text }}
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-4">
                                    <div class="info-box">
                                        <div class="small text-muted">
                                            {{
                                                selectedLocation.type === "site"
                                                    ? "Slot còn trống"
                                                    : "Thông tin"
                                            }}
                                        </div>
                                        <div class="fw-semibold">
                                            {{
                                                selectedLocation.type === "site"
                                                    ? selectedLocation.available_slots
                                                    : selectedLocation.badges?.length || 0
                                            }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-if="hasSlotInfo(selectedLocation)" class="card border-0 bg-light rounded-4 mb-3">
                                <div class="card-body p-3">
                                    <div class="fw-semibold mb-2">
                                        <i class="bi bi-clock-history text-danger me-1"></i>
                                        Tình trạng khung giờ
                                    </div>

                                    <div class="row g-2">
                                        <div class="col-md-6">
                                            <div class="slot-detail-box">
                                                <div class="d-flex justify-content-between">
                                                    <span>Ca sáng</span>
                                                    <strong>
                                                        {{ selectedLocation.slots.morning.available_count }}/{{ selectedLocation.slots.morning.slot_capacity }}
                                                    </strong>
                                                </div>
                                                <div class="small text-muted mb-2">
                                                    07:00 - 11:00
                                                </div>
                                                <div class="progress" style="height: 6px">
                                                    <div
                                                        class="progress-bar bg-danger"
                                                        :style="{ width: `${Math.min(selectedLocation.slots.morning.percent || 0, 100)}%` }"
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="slot-detail-box">
                                                <div class="d-flex justify-content-between">
                                                    <span>Ca chiều</span>
                                                    <strong>
                                                        {{ selectedLocation.slots.afternoon.available_count }}/{{ selectedLocation.slots.afternoon.slot_capacity }}
                                                    </strong>
                                                </div>
                                                <div class="small text-muted mb-2">
                                                    13:00 - 17:00
                                                </div>
                                                <div class="progress" style="height: 6px">
                                                    <div
                                                        class="progress-bar bg-danger"
                                                        :style="{ width: `${Math.min(selectedLocation.slots.afternoon.percent || 0, 100)}%` }"
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-if="selectedLocation.type === 'campaign'" class="mb-3">
                                <div class="small text-muted mb-1">Thời gian diễn ra</div>
                                <div class="fw-medium">
                                    {{ formatDateRange(selectedLocation.start_date, selectedLocation.end_date) }}
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="small text-muted mb-1">Nhu cầu hiện tại</div>
                                <div class="d-flex flex-wrap gap-1">
                                    <span
                                        v-for="(badge, index) in selectedLocation.badges"
                                        :key="index"
                                        class="badge custom-badge"
                                        :class="getBadgeClass(selectedLocation.type, index)"
                                    >
                                        {{ badge }}
                                    </span>
                                </div>
                            </div>

                            <div class="d-flex gap-2 flex-wrap">
                                <button class="btn btn-danger" @click="handleBooking(selectedLocation)">
                                    Đặt lịch ngay
                                </button>

                                <button
                                    class="btn btn-outline-secondary"
                                    @click="showDirections(selectedLocation)"
                                >
                                    Chỉ đường
                                </button>
                            </div>
                        </div>

                        <div v-else class="text-muted small">
                            Chọn một địa điểm ở danh sách bên trái để xem thông tin chi tiết.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";
import socket from "../../../core/socket";

export default {
    name: "FindNearbyDonationPage",

    data() {
        return {
            loading: false,
            gettingLocation: false,
            errorMessage: "",

            filters: {
                keyword: "",
                distance: "5",
                date: "today",
            },

            userLocation: {
                lat: null,
                lon: null,
            },

            locationState: {
                requested: false,
                granted: false,
                denied: false,
                unavailable: false,
            },

            displayedLocations: [],
            selectedLocation: null,
        };
    },

    computed: {
        selectedMapUrl() {
            if (!this.selectedLocation) return "";

            const { lat, lon, name, address, hospital_name } = this.selectedLocation;

            const hasValidLatLon =
                lat != null &&
                lon != null &&
                !Number.isNaN(Number(lat)) &&
                !Number.isNaN(Number(lon));

            if (hasValidLatLon) {
                return `https://maps.google.com/maps?q=loc:${Number(lat)},${Number(lon)}&z=16&output=embed`;
            }

            const fullAddress = [name, address, hospital_name, "Việt Nam"]
                .filter(Boolean)
                .join(", ");

            if (fullAddress) {
                return `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&z=16&output=embed`;
            }

            return "";
        },

        showLocationFallback() {
            return this.locationState.denied || this.locationState.unavailable;
        },

        locationHint() {
            if (this.locationState.denied) {
                return "Bạn chưa cấp quyền vị trí. Có thể lấy lại để tính khoảng cách chính xác.";
            }

            if (this.locationState.unavailable) {
                return "Thiết bị hoặc trình duyệt chưa hỗ trợ định vị.";
            }

            return "";
        },
    },

    mounted() {
        this.initPage();
        this.initSocket();
    },

    beforeUnmount() {
        socket.off("slot_capacity_updated", this.handleSlotCapacityUpdated);
    },

    methods: {
        initSocket() {
            if (!socket.connected) socket.connect();
            socket.on("slot_capacity_updated", this.handleSlotCapacityUpdated);
        },

        handleSlotCapacityUpdated() {
            this.search();
        },

        async initPage() {
            await this.tryGetCurrentLocationSilently();
            await this.search();
        },

        async tryGetCurrentLocationSilently() {
            this.locationState.requested = true;

            if (!navigator.geolocation) {
                this.locationState.unavailable = true;
                return;
            }

            try {
                const position = await this.getBrowserLocation();
                this.userLocation.lat = position.coords.latitude;
                this.userLocation.lon = position.coords.longitude;
                this.locationState.granted = true;
                this.locationState.denied = false;
                this.locationState.unavailable = false;
            } catch (error) {
                this.locationState.granted = false;

                if (error && error.code === 1) {
                    this.locationState.denied = true;
                } else {
                    this.locationState.unavailable = true;
                }
            }
        },

        async retryGetCurrentLocation() {
            this.gettingLocation = true;

            try {
                await this.tryGetCurrentLocationSilently();
                await this.search();
            } finally {
                this.gettingLocation = false;
            }
        },

        getBrowserLocation() {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                });
            });
        },

        async search() {
            this.loading = true;
            this.errorMessage = "";

            try {
                const params = {
                    keyword: this.filters.keyword || undefined,
                    distance: this.filters.distance || undefined,
                    date: this.filters.date || "today",
                    lat: this.userLocation.lat ?? undefined,
                    lon: this.userLocation.lon ?? undefined,
                };

                const response = await baseRequestClient.get("/donor/nearby-donations", {
                    params,
                });

                const payload = response?.data?.data || [];
                this.displayedLocations = Array.isArray(payload)
                    ? payload.map(this.normalizeItem)
                    : [];

                if (
                    !this.selectedLocation ||
                    !this.displayedLocations.find(
                        (item) =>
                            item.id === this.selectedLocation.id &&
                            item.type === this.selectedLocation.type
                    )
                ) {
                    this.selectedLocation = this.displayedLocations[0] || null;
                } else {
                    this.selectedLocation =
                        this.displayedLocations.find(
                            (item) =>
                                item.id === this.selectedLocation.id &&
                                item.type === this.selectedLocation.type
                        ) || this.selectedLocation;
                }
            } catch (error) {
                console.error("search nearby donations error:", error);
                this.errorMessage =
                    error?.response?.data?.message ||
                    "Không thể tải danh sách điểm hiến máu. Vui lòng thử lại.";
                this.displayedLocations = [];
                this.selectedLocation = null;
            } finally {
                this.loading = false;
            }
        },

        emptySlots() {
            return {
                morning: {
                    label: "Ca sáng",
                    time_range: "07:00 - 11:00",
                    current_count: 0,
                    slot_capacity: 0,
                    available_count: 0,
                    percent: 0,
                    is_full: false,
                    slot_ids: [],
                },
                afternoon: {
                    label: "Ca chiều",
                    time_range: "13:00 - 17:00",
                    current_count: 0,
                    slot_capacity: 0,
                    available_count: 0,
                    percent: 0,
                    is_full: false,
                    slot_ids: [],
                },
            };
        },

        normalizeSlotPart(part) {
            return {
                label: part?.label || "",
                time_range: part?.time_range || "",
                current_count: Number(part?.current_count || 0),
                slot_capacity: Number(part?.slot_capacity || 0),
                available_count: Number(part?.available_count || 0),
                percent: Number(part?.percent || 0),
                is_full: Boolean(part?.is_full),
                slot_ids: Array.isArray(part?.slot_ids) ? part.slot_ids : [],
            };
        },

        normalizeSlots(slots) {
            const fallback = this.emptySlots();

            return {
                morning: this.normalizeSlotPart(slots?.morning || fallback.morning),
                afternoon: this.normalizeSlotPart(slots?.afternoon || fallback.afternoon),
            };
        },

        normalizeItem(item) {
            return {
                id: item.id,
                type: item.type || "site",
                name: item.name || "",
                address: item.address || "",
                lat: item.lat != null && !Number.isNaN(Number(item.lat)) ? Number(item.lat) : null,
                lon: item.lon != null && !Number.isNaN(Number(item.lon)) ? Number(item.lon) : null,
                distance_km:
                    item.distance_km != null && !Number.isNaN(Number(item.distance_km))
                        ? Number(item.distance_km)
                        : null,
                status_text: item.status_text || "",
                available_slots:
                    item.available_slots != null && !Number.isNaN(Number(item.available_slots))
                        ? Number(item.available_slots)
                        : 0,
                total_capacity:
                    item.total_capacity != null && !Number.isNaN(Number(item.total_capacity))
                        ? Number(item.total_capacity)
                        : 0,
                current_count:
                    item.current_count != null && !Number.isNaN(Number(item.current_count))
                        ? Number(item.current_count)
                        : 0,
                percent:
                    item.percent != null && !Number.isNaN(Number(item.percent))
                        ? Number(item.percent)
                        : 0,
                is_full: Boolean(item.is_full),
                slots: this.normalizeSlots(item.slots),
                badges: Array.isArray(item.badges) ? item.badges : [],
                hospital_name: item.hospital_name || null,
                start_date: item.start_date || null,
                end_date: item.end_date || null,
                is_emergency: Boolean(item.is_emergency),
                donation_site_id: item.donation_site_id || null,
            };
        },

        hasSlotInfo(item) {
            if (!item?.slots) return false;

            return (
                Number(item.slots.morning.slot_capacity || 0) > 0 ||
                Number(item.slots.afternoon.slot_capacity || 0) > 0
            );
        },

        selectLocation(item) {
            console.log("selectedLocation:", item);
            this.selectedLocation = item;
        },

        handleBooking(item) {
            if (item.type === "site") {
                this.$router.push({
                    path: "/register-blooddonation",
                    query: {
                        donation_site_id: item.id,
                    },
                });
                return;
            }

            if (item.type === "campaign") {
                this.$router.push(`/campaigns/${item.id}`);
            }
        },

        showDirections(item) {
            const hasValidLatLon =
                item.lat != null &&
                item.lon != null &&
                !Number.isNaN(Number(item.lat)) &&
                !Number.isNaN(Number(item.lon));

            if (hasValidLatLon) {
                const url = `https://www.google.com/maps?q=loc:${Number(item.lat)},${Number(item.lon)}`;
                window.open(url, "_blank");
                return;
            }

            const fullAddress = [item.name, item.address, item.hospital_name, "Việt Nam"]
                .filter(Boolean)
                .join(", ");

            if (fullAddress) {
                const url = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}`;
                window.open(url, "_blank");
            }
        },

        getStatusClass(item) {
            if (
                item.status_text === "Đang tiếp nhận" ||
                item.status_text === "Đang hoạt động"
            ) {
                return "text-success";
            }

            if (
                item.status_text === "Sắp đóng cửa" ||
                item.status_text === "Sắp diễn ra"
            ) {
                return "text-warning";
            }

            if (item.status_text === "Tạm hết chỗ") {
                return "text-danger";
            }

            return "text-muted";
        },

        getBadgeClass(type, index) {
            if (type === "campaign") {
                return index % 2 === 0
                    ? "bg-success-subtle text-success border"
                    : "bg-danger-subtle text-danger border";
            }

            return index % 2 === 0
                ? "bg-danger-subtle text-danger border"
                : "bg-primary-subtle text-primary border";
        },

        formatDateRange(startDate, endDate) {
            if (!startDate || !endDate) return "Chưa cập nhật";

            const start = this.formatDate(startDate);
            const end = this.formatDate(endDate);

            if (start === end) return start;
            return `${start} - ${end}`;
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            if (Number.isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString("vi-VN");
        },

        formatDistance(value) {
            if (value == null || Number.isNaN(value)) {
                return "Khoảng cách chưa xác định";
            }
            return `Cách ${value.toFixed(1)} km`;
        },
    },
};
</script>

<style scoped>
.nearby-page .location-card {
    cursor: pointer;
    transition: background 0.2s ease;
    border-radius: 12px;
    padding: 8px;
}

.nearby-page .location-card:hover {
    background: #fafafa;
}

.nearby-page .location-card.active {
    background: #fff5f5;
    border: 1px solid #f1c2c2;
}

.map-placeholder {
    height: 360px;
}

.info-box {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 12px;
    height: 100%;
}

.custom-badge {
    font-size: 11px;
    font-weight: 500;
}

.slot-mini-box {
    background: #fff7f7;
    border: 1px solid #f1c2c2;
    border-radius: 12px;
    padding: 10px;
}

.slot-detail-box {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 12px;
    height: 100%;
}
</style>