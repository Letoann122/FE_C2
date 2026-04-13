<template>
  <div class="hospital-wrapper">
    <TheHeader />
    <main>
      <router-view />
    </main>
    <TheFooter />
  </div>
</template>

<script>
import TheHeader from "../../components/Hospital/TheHeader.vue";
import TheFooter from "../../components/Hospital/TheFooter.vue";
import "../../../assets/js/bootstrap.bundle.min.js";

export default {
  name: "HospitalLayout",
  components: {
    TheHeader,
    TheFooter,
  },
};
</script>

<style>
@import "../../../assets/css/bootstrap.min.css";
@import "../../../assets/css/all.min.css"; 

.hospital-wrapper {
  background-color: #f5f6f7; /* hoặc #f7f7f8 để sáng hơn */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
