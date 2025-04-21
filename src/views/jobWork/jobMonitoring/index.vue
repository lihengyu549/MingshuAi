<template>
  <div class="app-container">
    <div class="header">
      <div class="header_left_titleClass">
        <img src="../../../assets/images/loginIcon.png"></img>
        <span>{{ routeData.tasksName }}</span>
      </div>
      <div class="header_center_titleClass">
        <span>行业模版：{{ routeData.projectName }}</span>
        <span>字段总数：{{ routeData.fieldCount }}</span>
      </div>
      <div class="header_right_titleClass">
        <span>进度：</span>
        <el-progress :percentage="percentage" color="#409eff" :stroke-width="26" :format="progressFormat"></el-progress>
      </div>
    </div>
    <div class="timeBox">
      <div class="timeBox_left">
        <img src="../../../assets/images/loginIcon.png" alt="">
        <span>开始时间：{{ routeData.updateTime }}</span>
      </div>
      <div class="timeBox_right">
        <img src="../../../assets/images/loginIcon.png" alt="">
        <span>处理耗时：{{ routeData.updateTime }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  usersAddI
} from "@/api/system/proxyUser";
import router from "@/router";
export default {
  name: "jobMonitoring",
  data() {
    return {
      routeData: this.$route.query||{},
      percentage: 20,
    };
  },

  created() {
    console.log(this.$route);
    
  },
  methods: {
    // 进度条完成提示
    progressFormat(){
      return this.percentage === 100 ? '已完成' : `${this.percentage}%`;
    }
  },
}
</script>
<style scoped lang="scss">
.app-container {
  padding: 20px 0;
}
.header{
  height: 100px;
  width: 100%;
  background-color: #e6f6fe;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header_left_titleClass{
  width: 30%;
  font-size: 25px;
  padding: 0 25px;
  display: flex;
  align-items: center;
}
.header_left_titleClass img {
  width: 60px;
  height: 60px;
  display: block;
}
.header_center_titleClass{
  width: 30%;
  font-size: 25px;
}
.header_center_titleClass span{
  margin-right: 25px;
}
.header_right_titleClass{
  display: flex;
  align-items: center;
  width: 30%;
  font-size: 25px;
}
.header_right_titleClass .el-progress{
  width: 40%;
}
.timeBox{
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 40px;
  margin-top: 30px;
}
.timeBox img{
  width: 40px;
  height: 40px;
  margin-right: 20px;
}
.timeBox .timeBox_left{
  font-size: 23px;
  display: flex;
  align-items: center;
}
.timeBox .timeBox_right{
  font-size: 23px;
  margin-left: 30px;
  display: flex;
  align-items: center;
}
</style>
