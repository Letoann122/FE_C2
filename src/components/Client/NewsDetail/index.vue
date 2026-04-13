<template>
    <div class="container py-5" v-if="news">
        <h2 class="fw-bold mb-2">{{ news.title }}</h2>
        <div class="text-muted mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-calendar-event"></i>
            {{ formatDate(news.published_date) }}
        </div>
        <div class="news-image-wrapper mb-4">
            <img
                :src="news.image_url || defaultImage"
                alt="news"
                class="news-image"
                loading="lazy"
                @error="onImgError"
            />
        </div>
        <div class="fs-6 text-secondary" v-html="formattedContent"></div>
    </div>
    <div v-else class="text-center py-5 text-muted">
        <div class="spinner-border text-danger"></div>
        <p class="mt-3">Đang tải nội dung...</p>
    </div>
</template>

<script>
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default {
    data() {
        return {
            news: null,
            defaultImage: new URL("../../../assets/img/hienmau.jpg", import.meta.url).href,
        };
    },
    computed: {
        formattedContent() {
            if (!this.news?.content) return "";
            return this.news.content.replace(/\n/g, "<br>");
        },
    },
    methods: {
        async fetchDetail() {
            try {
                const id = this.$route.params.id;
                const res = await axios.get(`${API_BASE}/api/news/${id}`);

                if (res.data?.status) this.news = res.data.data;
                else this.$toast?.error("Không thể tải bài viết!");
            } catch (err) {
                console.error(err);
                this.$toast?.error("Lỗi server!");
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString("vi-VN");
        },
        onImgError(e) {
            e.target.src = this.defaultImage;
        }
    },
    mounted() {
        this.fetchDetail();
    },
};
</script>

<style scoped>
.news-image-wrapper {
    width: 100%;
    aspect-ratio: 16 / 9; /* giữ tỷ lệ vàng hiển thị */
    overflow: hidden;
    border-radius: 14px;
    background: #eee;
}
.news-image {
    width: 100%;
    height: 100%;
    object-fit: cover; /* tránh méo hình */
    border-radius: 14px;
    display: block;
    transition: transform 0.3s ease;
}


</style>
