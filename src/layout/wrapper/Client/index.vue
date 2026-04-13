<template>
  <div class="client-wrapper">
    <TopSBD />
    <EmergencyAlert />
    <main>
      <router-view />
    </main>
    <BotSBD />
  </div>
</template>

<script>
import TopSBD from "../../components/Client/Header.vue";
import BotSBD from "../../components/Client/Footer.vue";
import EmergencyAlert from "../../../components/Client/EmergencyAlert/index.vue"; 
import "../../../assets/js/bootstrap.bundle.min.js";

export default {
  name: "ClientLayout",
  components: {
    TopSBD,
    BotSBD,
    EmergencyAlert,
  },
};
</script>
<style>
@import "../../../assets/css/bootstrap.min.css";
@import "../../../assets/css/all.min.css";
.client-wrapper {
  background-color: #f5f6f7;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1;
}
</style>
