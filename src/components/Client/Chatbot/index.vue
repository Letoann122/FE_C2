<template>
  <div class="sbb-chatbot">
    <!-- FLOAT GROUP BUTTON -->
    <div
      v-if="!isOpen"
      class="sbb-fab-group"
      :class="{ 'is-open': fabOpen }"
      @mouseenter="fabOpen = true"
      @mouseleave="fabOpen = false"
    >
      <div class="sbb-fab-menu">
        <button
          class="sbb-fab-action"
          type="button"
          @click="openChatbot"
        >
          <span class="sbb-fab-action-icon bot">
            <i class="bi bi-robot"></i>
          </span>

          <span class="sbb-fab-action-text">
            <strong>Smart Blood Bot</strong>
            <small>Trợ lý hiến máu AI</small>
          </span>
        </button>

        <button
          class="sbb-fab-action"
          type="button"
          @click="openTawk"
        >
          <span class="sbb-fab-action-icon support">
            <i class="bi bi-headset"></i>
          </span>

          <span class="sbb-fab-action-text">
            <strong>Hỗ trợ trực tuyến</strong>
            <small>Chat với nhân viên</small>
          </span>
        </button>
      </div>

      <button
        class="sbb-toggle"
        type="button"
        @click="toggleFab"
        aria-label="Open support menu"
      >
        <span class="sbb-toggle-glow"></span>

        <span class="sbb-toggle-icon">
          <i class="bi" :class="fabOpen ? 'bi-x-lg' : 'bi-chat-heart-fill'"></i>
        </span>

        <span class="sbb-toggle-pulse"></span>
      </button>
    </div>

    <!-- CHATBOT PANEL -->
    <transition name="sbb-slide">
      <section v-if="isOpen" class="sbb-panel">
        <!-- HEADER -->
        <header class="sbb-header">
          <div class="sbb-header-bg"></div>

          <div class="sbb-header-content">
            <div class="sbb-avatar-wrap">
              <div class="sbb-avatar">
                <i class="bi bi-robot"></i>
              </div>
              <span class="sbb-online-dot"></span>
            </div>

            <div class="sbb-title-wrap">
              <h4>Smart Blood Bot</h4>
              <p>Trợ lý hiến máu thông minh</p>
            </div>

            <button
              class="sbb-close"
              type="button"
              @click="toggleChat"
              aria-label="Close chatbot"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </header>

        <!-- BODY -->
        <main ref="messagesBox" class="sbb-body">
          <div class="sbb-welcome-card">
            <div class="sbb-mini-avatar">
              <i class="bi bi-droplet-half"></i>
            </div>

            <div>
              <strong>Xin chào!</strong>
              <p>
                Mình có thể hỗ trợ bạn về lịch hẹn, lịch sử hiến máu,
                chiến dịch, slot còn chỗ và thông tin hiến máu chung.
              </p>
            </div>
          </div>

          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="sbb-message-row"
            :class="msg.role === 'user' ? 'is-user' : 'is-bot'"
          >
            <div v-if="msg.role !== 'user'" class="sbb-message-avatar">
              <i class="bi bi-robot"></i>
            </div>

            <div class="sbb-message-content">
              <div
                class="sbb-bubble"
                :class="msg.role === 'user' ? 'sbb-user-bubble' : 'sbb-bot-bubble'"
              >
                <div v-html="formatMessage(msg.text)"></div>
              </div>

              <span class="sbb-time">{{ getTimeLabel() }}</span>
            </div>
          </div>

          <div v-if="loading" class="sbb-message-row is-bot">
            <div class="sbb-message-avatar">
              <i class="bi bi-robot"></i>
            </div>

            <div class="sbb-message-content">
              <div class="sbb-bubble sbb-bot-bubble sbb-typing-bubble">
                <span class="sbb-dot"></span>
                <span class="sbb-dot"></span>
                <span class="sbb-dot"></span>
              </div>
            </div>
          </div>
        </main>

        <!-- SUGGESTIONS -->
        <section class="sbb-suggestions">
          <button
            v-for="item in suggestions"
            :key="item.text"
            class="sbb-suggestion"
            type="button"
            @click="sendSuggestion(item.text)"
          >
            <span class="sbb-suggestion-icon">
              <i :class="item.icon"></i>
            </span>

            <span>{{ item.label }}</span>

            <i class="bi bi-chevron-right sbb-chevron"></i>
          </button>
        </section>

        <!-- FOOTER -->
        <footer class="sbb-footer">
          <div class="sbb-input-wrap">
            <i class="bi bi-chat-left-text sbb-input-icon"></i>

            <input
              v-model.trim="message"
              class="sbb-input"
              placeholder="Nhập câu hỏi của bạn..."
              @keyup.enter="sendMessage"
            />

            <button
              v-if="message"
              class="sbb-clear"
              type="button"
              @click="message = ''"
            >
              <i class="bi bi-x-circle"></i>
            </button>
          </div>

          <button
            class="sbb-send"
            type="button"
            :disabled="loading || !message"
            @click="sendMessage"
          >
            <i class="bi bi-send-fill"></i>
          </button>
        </footer>

        <div class="sbb-security">
          <i class="bi bi-shield-lock-fill"></i>
          <span>Thông tin của bạn được bảo mật tuyệt đối</span>
        </div>
      </section>
    </transition>
  </div>
</template>

<script>
import baseRequestClient from "../../../core/baseRequestClient";
import { showTawk, hideTawk } from "../../../core/tawk";

export default {
  name: "ClientChatbot",

  data() {
    return {
      isOpen: false,
      fabOpen: false,
      loading: false,
      message: "",
      tawkHideTimer: null,

      messages: [
        {
          role: "bot",
          text: "Mình là Smart Blood Bot. Bạn có thể hỏi mình về quy trình hiến máu, điều kiện hiến máu, lịch hẹn, lịch sử hiến máu hoặc các chiến dịch đang diễn ra.",
        },
      ],

      suggestions: [
        {
          label: "Điều kiện hiến máu",
          text: "Điều kiện hiến máu là gì?",
          icon: "bi bi-droplet",
        },
        {
          label: "Nhóm máu của tôi?",
          text: "Nhóm máu của tôi là gì?",
          icon: "bi bi-calendar-check",
        },
        {
          label: "Lịch hẹn của tôi",
          text: "Tôi có lịch hẹn nào không?",
          icon: "bi bi-clock-history",
        },
        {
          label: "Bao lâu được hiến lại?",
          text: "Bao lâu được hiến máu lại?",
          icon: "bi bi-arrow-repeat",
        },
      ],
    };
  },

  mounted() {
    this.hideTawkWidget();

    this.tawkHideTimer = setInterval(() => {
      this.hideTawkWidget();
    }, 1000);

    setTimeout(() => {
      if (this.tawkHideTimer) {
        clearInterval(this.tawkHideTimer);
        this.tawkHideTimer = null;
      }
    }, 10000);
  },

  beforeUnmount() {
    if (this.tawkHideTimer) {
      clearInterval(this.tawkHideTimer);
      this.tawkHideTimer = null;
    }
  },

  methods: {
    toggleFab() {
      this.fabOpen = !this.fabOpen;
    },

    openChatbot() {
      this.fabOpen = false;
      this.isOpen = true;

      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    async openTawk() {
      this.fabOpen = false;

      try {
        await showTawk({ maximize: true });
      } catch (error) {
        console.warn("Cannot open Tawk widget:", error);
      }
    },

    hideTawkWidget() {
      try {
        hideTawk();
      } catch (error) {
        console.warn("Cannot hide Tawk widget:", error);
      }
    },

    toggleChat() {
      this.isOpen = !this.isOpen;
      this.fabOpen = false;

      if (!this.isOpen) {
        this.hideTawkWidget();
      }

      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    sendSuggestion(text) {
      if (this.loading) return;

      this.message = text;
      this.sendMessage();
    },

    async sendMessage() {
      if (!this.message || this.loading) return;

      const userMessage = this.message;

      this.messages.push({
        role: "user",
        text: userMessage,
      });

      this.message = "";
      this.loading = true;

      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        const res = await baseRequestClient.post("/chatbot/message", {
          message: userMessage,
        });

        if (res.data?.status) {
          this.messages.push({
            role: "bot",
            text: res.data.reply || "Mình chưa có câu trả lời phù hợp.",
          });
        } else {
          this.messages.push({
            role: "bot",
            text: res.data?.message || "Chatbot chưa thể trả lời lúc này.",
          });
        }
      } catch (error) {
        this.messages.push({
          role: "bot",
          text:
            error.response?.data?.message ||
            "Không thể kết nối chatbot. Vui lòng thử lại sau.",
        });
      } finally {
        this.loading = false;

        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },

    scrollToBottom() {
      const box = this.$refs.messagesBox;

      if (box) {
        box.scrollTop = box.scrollHeight;
      }
    },

    getTimeLabel() {
      const now = new Date();

      return now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    escapeHtml(text) {
      return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    formatMessage(text) {
      let safeText = this.escapeHtml(text);

      safeText = safeText
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br />");

      safeText = safeText.replace(
        /(^|<br \/>)-\s/g,
        '$1<span class="sbb-list-dash">•</span> '
      );

      return safeText;
    },
  },
};
</script>

<style scoped>
.sbb-chatbot {
  position: relative;
  z-index: 1060;
}

/* FLOAT GROUP */
.sbb-fab-group {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1060;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.sbb-fab-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
  opacity: 0;
  transform: translateY(12px) scale(0.96);
  pointer-events: none;
  transition: all 0.22s ease;
}

.sbb-fab-group:hover .sbb-fab-menu,
.sbb-fab-group.is-open .sbb-fab-menu {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.sbb-fab-action {
  width: 245px;
  border: none;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  color: #0f172a;
  box-shadow:
    0 18px 40px rgba(15, 23, 42, 0.16),
    0 0 0 1px rgba(226, 232, 240, 0.9);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  backdrop-filter: blur(12px);
  transition: all 0.2s ease;
}

.sbb-fab-action:hover {
  transform: translateX(-4px);
  box-shadow:
    0 22px 44px rgba(15, 23, 42, 0.2),
    0 0 0 1px rgba(251, 113, 133, 0.45);
}

.sbb-fab-action-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 21px;
}

.sbb-fab-action-icon.bot {
  background: #fee2e2;
  color: #dc2626;
}

.sbb-fab-action-icon.support {
  background: #dcfce7;
  color: #16a34a;
}

.sbb-fab-action-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sbb-fab-action-text strong {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
}

.sbb-fab-action-text small {
  margin-top: 3px;
  font-size: 12px;
  color: #64748b;
}

.sbb-toggle {
  position: relative;
  width: 64px;
  height: 64px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #e11d48 0%, #dc2626 55%, #991b1b 100%);
  color: #fff;
  box-shadow: 0 18px 36px rgba(220, 38, 38, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: visible;
  transition: all 0.22s ease;
}

.sbb-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 44px rgba(220, 38, 38, 0.42);
}

.sbb-toggle-icon {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  position: relative;
  z-index: 2;
}

.sbb-toggle-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.18);
  filter: blur(8px);
}

.sbb-toggle-pulse {
  position: absolute;
  right: 7px;
  top: 7px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid #fff;
  z-index: 3;
}

/* PANEL */
.sbb-panel {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 390px;
  max-width: calc(100vw - 32px);
  height: 650px;
  max-height: calc(100vh - 48px);
  border-radius: 28px;
  background: #fff;
  box-shadow:
    0 28px 70px rgba(15, 23, 42, 0.22),
    0 0 0 1px rgba(226, 232, 240, 0.9);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.sbb-header {
  position: relative;
  padding: 20px;
  min-height: 104px;
  overflow: hidden;
  background: linear-gradient(135deg, #e11d48 0%, #dc2626 58%, #991b1b 100%);
}

.sbb-header-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.28), transparent 26%),
    radial-gradient(circle at 30% 90%, rgba(255, 255, 255, 0.18), transparent 22%);
  opacity: 0.9;
}

.sbb-header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 14px;
}

.sbb-avatar-wrap {
  position: relative;
}

.sbb-avatar {
  width: 58px;
  height: 58px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 14px 26px rgba(127, 29, 29, 0.24);
}

.sbb-online-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 16px;
  height: 16px;
  background: #22c55e;
  border: 3px solid #fff;
  border-radius: 50%;
}

.sbb-title-wrap {
  color: #fff;
  flex: 1;
  min-width: 0;
}

.sbb-title-wrap h4 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.sbb-title-wrap p {
  margin: 3px 0 0;
  font-size: 13px;
  opacity: 0.92;
}

.sbb-close {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sbb-close:hover {
  background: rgba(255, 255, 255, 0.22);
}

/* BODY */
.sbb-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 18px 10px;
  background:
    linear-gradient(180deg, #fff 0%, #fff7f8 100%);
}

.sbb-body::-webkit-scrollbar {
  width: 6px;
}

.sbb-body::-webkit-scrollbar-thumb {
  background: #fecdd3;
  border-radius: 999px;
}

.sbb-welcome-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: 22px;
  background: linear-gradient(135deg, #fff 0%, #fff1f2 100%);
  border: 1px solid #ffe4e6;
  box-shadow: 0 10px 24px rgba(225, 29, 72, 0.08);
  margin-bottom: 16px;
}

.sbb-mini-avatar {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sbb-welcome-card strong {
  display: block;
  font-size: 14px;
  color: #0f172a;
  margin-bottom: 3px;
}

.sbb-welcome-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #64748b;
}

.sbb-message-row {
  display: flex;
  gap: 9px;
  margin-bottom: 14px;
}

.sbb-message-row.is-user {
  justify-content: flex-end;
}

.sbb-message-avatar {
  width: 30px;
  height: 30px;
  border-radius: 12px;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
  margin-top: 4px;
}

.sbb-message-content {
  max-width: 82%;
}

.is-user .sbb-message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.sbb-bubble {
  padding: 12px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.58;
  word-break: break-word;
}

.sbb-bot-bubble {
  background: #fff;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 6px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.sbb-user-bubble {
  background: linear-gradient(135deg, #e11d48 0%, #dc2626 100%);
  color: #fff;
  border-bottom-right-radius: 6px;
  box-shadow: 0 12px 22px rgba(220, 38, 38, 0.2);
}

.sbb-bubble strong {
  font-weight: 800;
}

.sbb-time {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #94a3b8;
}

.sbb-list-dash {
  color: #dc2626;
  font-weight: 800;
}

.sbb-typing-bubble {
  display: flex;
  align-items: center;
  gap: 5px;
  width: fit-content;
  min-width: 60px;
}

.sbb-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fb7185;
  animation: sbbTyping 1.1s infinite ease-in-out;
}

.sbb-dot:nth-child(2) {
  animation-delay: 0.16s;
}

.sbb-dot:nth-child(3) {
  animation-delay: 0.32s;
}

@keyframes sbbTyping {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }

  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* SUGGESTIONS */
.sbb-suggestions {
  padding: 12px 16px 14px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.sbb-suggestion {
  border: 1px solid #fecdd3;
  background: #fff;
  color: #1f2937;
  border-radius: 18px;
  padding: 10px 10px;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  box-shadow: 0 8px 16px rgba(225, 29, 72, 0.05);
}

.sbb-suggestion:hover {
  background: #fff1f2;
  border-color: #fb7185;
  transform: translateY(-1px);
}

.sbb-suggestion-icon {
  width: 26px;
  height: 26px;
  border-radius: 10px;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sbb-chevron {
  margin-left: auto;
  color: #94a3b8;
  font-size: 12px;
}

/* FOOTER */
.sbb-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 8px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
}

.sbb-input-wrap {
  height: 48px;
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  transition: 0.2s ease;
}

.sbb-input-wrap:focus-within {
  background: #fff;
  border-color: #fb7185;
  box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.1);
}

.sbb-input-icon {
  color: #94a3b8;
  margin-right: 8px;
}

.sbb-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #0f172a;
  min-width: 0;
}

.sbb-input::placeholder {
  color: #94a3b8;
}

.sbb-clear {
  border: none;
  background: transparent;
  color: #94a3b8;
  padding: 0;
  display: flex;
  align-items: center;
}

.sbb-send {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #e11d48 0%, #dc2626 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  box-shadow: 0 14px 24px rgba(220, 38, 38, 0.25);
}

.sbb-send:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 30px rgba(220, 38, 38, 0.32);
}

.sbb-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.sbb-security {
  padding: 0 16px 14px;
  background: #fff;
  color: #94a3b8;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.sbb-security i {
  color: #dc2626;
}

/* TRANSITION */
.sbb-slide-enter-active,
.sbb-slide-leave-active {
  transition: all 0.24s ease;
}

.sbb-slide-enter-from,
.sbb-slide-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}

/* RESPONSIVE */
@media (max-width: 576px) {
  .sbb-panel {
    right: 12px;
    left: 12px;
    bottom: 12px;
    width: auto;
    height: 78vh;
    max-width: none;
    border-radius: 24px;
  }

  .sbb-fab-group {
    right: 18px;
    bottom: 18px;
  }

  .sbb-fab-action {
    width: calc(100vw - 48px);
    max-width: 280px;
  }

  .sbb-suggestions {
    grid-template-columns: 1fr;
  }

  .sbb-title-wrap h4 {
    font-size: 18px;
  }

  .sbb-message-content {
    max-width: 86%;
  }
}
</style>