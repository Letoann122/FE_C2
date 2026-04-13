<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script>
import { showTawk, hideTawk } from "./core/tawk";

const default_layout = "blank";

function hasValidToken(key) {
  const v = localStorage.getItem(key);
  return !!v && v !== "null" && v !== "undefined";
}

export default {
  name: "App",

  computed: {
    layout() {
      return (this.$route.meta.layout || default_layout) + "-layout";
    },
  },

  mounted() {
    this.applyTawkRule();
    window.addEventListener("storage", this.applyTawkRule);
  },

  beforeUnmount() {
    window.removeEventListener("storage", this.applyTawkRule);
  },

  watch: {
    $route() {
      this.applyTawkRule();
    },
  },

  methods: {
    async applyTawkRule() {
      const isAdmin = hasValidToken("token_admin");
      const isDoctor = hasValidToken("token_doctor");

      if (isAdmin || isDoctor) {
        hideTawk();
        return;
      }

      // guest hoặc donor => hiện
      await showTawk();
    },
  },
};
</script>
