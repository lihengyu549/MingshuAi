<template>
  <div id="body-content">
    <div class="body_head">
      <div class="head_left">
        <div style="margin-right: 20px;">
          <img src="../assets/logo/logo.png" alt="">
        </div>
        <div class="head_right">
          <div style="font-weight: 700;font-size: 20px;margin-bottom: 10px;">数据安全分类分级看板</div>
          <div>Data Security Classification and Grading Dashboard</div>
        </div>
      </div>
      <div style="padding-right: 10px;">
        <div style="font-weight: 700;font-size: 22px;">22:33:33</div>
        <div>2025-06-06</div>
      </div>
    </div>
  </div>
</template>
<script>
import { parseTime } from "@/utils/ruoyi";
import {
  apiStatisticI,
  protectStatisticI,
  levelStatisticI,
  getTopAttitudeI,
  geoCoordMap,
  features,
  getMapDataI,
} from "../api/system/statisticlData";
import * as echarts from "echarts";
import "echarts-wordcloud";
import "../assets/styles/bootstrap.css";
import DataPupop from "./dataPupop";
import $ from "jquery";
export default {
  components: {
    DataPupop
  },
  data() {
    return {
    };
  },
  created() {
  },
  mounted() {

  },
  watch: {
    $route() {
      this.$router.go();
    },
  },
  methods: {
    goHome() {
      this.$router.push({ path: "/index" });
    },
  },

  beforeDestroy() {
    if (this.timeoutTop) {
      clearInterval(this.timeoutTop);
    }
    if (this.timeout) {
      clearInterval(this.timeout);
    }

    if (this.chart) {
      this.chart.dispose();
    }
    window.removeEventListener('resize', this.chart && this.chart.resize);
  },
};
</script>
<style scoped lang="scss">
#body-content {
  background-color: #e7f0f7;
  height: 100vh;
  width: 100%;
  padding: 1px 0;
}

.body_head {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  margin: 10px 10px 0 10px;
  align-items: center;
  padding: 20px;
  border-radius: 5px;
  .head_left{
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  img {
    width: 50px;
    height: 50px;
  }
}
</style>