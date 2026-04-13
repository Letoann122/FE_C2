<template>
  <div class="container py-5">
    <h2 class="mb-4">Câu hỏi thường gặp</h2>
    <div class="accordion" id="faqAccordion">
      <div class="accordion-item" v-for="(item, index) in faqs" :key="index">
        <h2 class="accordion-header" :id="'heading'+index">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                  :data-bs-target="'#collapse'+index" aria-expanded="false" 
                  :aria-controls="'collapse'+index">
            {{ item.question }}
          </button>
        </h2>
        <div :id="'collapse'+index" class="accordion-collapse collapse" :aria-labelledby="'heading'+index" data-bs-parent="#faqAccordion">
          <div class="accordion-body">
            {{ item.answer }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      faqs: [
  { 
    question: "Làm thế nào để đăng ký hiến máu?", 
    answer: "Bạn có thể đăng ký hiến máu bằng nhiều cách: 1) Trực tiếp trên website của chúng tôi bằng cách điền đầy đủ thông tin cá nhân, chọn ngày và địa điểm hiến máu; 2) Qua ứng dụng di động của hệ thống, nơi bạn có thể đặt lịch hiến máu, nhận thông báo nhắc nhở và theo dõi lịch sử hiến máu; 3) Gọi hotline hoặc đến trực tiếp trung tâm hiến máu. Sau khi đăng ký, bạn sẽ nhận được xác nhận và hướng dẫn chi tiết trước ngày hiến máu." 
  },
  { 
    question: "Tôi có thể hiến máu bao nhiêu lần mỗi năm?", 
    answer: "Theo hướng dẫn của Bộ Y tế và các tổ chức hiến máu quốc tế, mỗi người trưởng thành có thể hiến máu tình nguyện tối đa 4-6 lần mỗi năm đối với hiến máu toàn phần, và khoảng 12 lần/năm đối với hiến máu tách thành phần (như tiểu cầu). Khoảng cách giữa các lần hiến máu nên từ 8 tuần trở lên để cơ thể hồi phục đầy đủ. Người hiến máu cần đảm bảo sức khỏe tốt, có chế độ ăn uống hợp lý và ngủ đủ giấc trước mỗi lần hiến máu." 
  },
  { 
    question: "Có bị ảnh hưởng sức khỏe khi hiến máu không?", 
    answer: "Hiến máu là một quá trình an toàn đối với người sức khỏe bình thường. Khi hiến máu, cơ thể mất một lượng máu tạm thời nhưng sẽ tự động tái tạo trong vòng 24-48 giờ đối với huyết tương và vài tuần đối với hồng cầu. Trước khi hiến máu, bạn sẽ được kiểm tra sức khỏe và cân nặng, đo huyết áp, kiểm tra nhịp tim và nồng độ hemoglobin để đảm bảo đủ điều kiện hiến. Một số người có thể cảm thấy chóng mặt nhẹ hoặc mệt sau khi hiến máu, nhưng thường sẽ hồi phục nhanh nếu nghỉ ngơi và uống nước đầy đủ." 
  }
]

    };
  }
};
</script>
