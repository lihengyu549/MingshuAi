<template>
  <div class="app-container">
    <div class="header">
      <div class="header_left_titleClass">
        <img src="../../../assets/icons/jobWork/renwu.png"></img>
        <span>{{ allData.databaseName }}</span>
      </div>
      <div class="header_center_titleClass">
        <span>行业模版：{{ routeData.categoryName }}</span>
        <span>字段总数：{{ routeData.filedCount }}</span>
      </div>
      <div class="header_right_titleClass">
        <span>进度：</span>
        <el-progress :percentage="allData.schedule" color="#409eff" :stroke-width="26" :format="progressFormat"></el-progress>
      </div>
    </div>
    <div class="timeBox">
      <div class="timeBox_left">
        <img src="../../../assets/icons/jobWork/kaishishijian.png" alt="">
        <span>开始时间：{{ allData.startTime }}</span>
      </div>
      <div class="timeBox_right">
        <img src="../../../assets/icons/jobWork/yinghaoshi.png" alt="">
        <span>处理耗时：{{ allData.processingTime }}</span>
      </div>
    </div>
    <div class="stepsBox">
      <el-steps direction="vertical" :active="allData.schedule" finish-status="success">
        <el-step class="step_text" icon="el-icon-loading" v-for="item in directionData" :title="item.title"
          >
        </el-step>
      </el-steps>
    </div>
  </div>
</template>

<script>
import { getTaskMonitoring } from "@/api/system/proxys";
export default {
  name: "jobMonitoring",
  data() {
    return {
      routeData: this.$route.query || {},
      allData:{},
      aaaa:0,
      directionData:[
        {
        title:'数据质量评估',
        description:'描述',
        status:'scuccess',
        },
        {
        title:'关键字/正则精确匹配',
        description:'描述',
        status:'process',
        },
        {
        title:'AI推理',
        description:'描述',
        status:'finish',
        },
        {
        title:'AI审核',
        description:'描述',
        status:'error',
        },
    ]
    };
  },

  created() {
    this.getTaskMonitoringFn()
  },
  methods: {
    getTaskMonitoringFn(){
      let timer = setInterval(() => {
        getTaskMonitoring({ proxyId: this.routeData.id }).then(res => {
          if(res.code == 200){
            this.allData = res.data
            if(this.allData.schedule == 100){
              clearInterval(timer)
            }
          }
        })
        .catch(err => {
          clearInterval(timer)
        });
      }, 1000);
    },
    // 进度条完成提示
    progressFormat() {
      return this.allData.schedule == 100 ? '已完成' : `${this.allData.schedule || 0}%`;
    }
  },
}
</script>
<style scoped lang="scss">
.app-container {
  padding: 20px 0;
}

.header {
  height: 100px;
  width: 100%;
  background-color: #e6f6fe;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header_left_titleClass {
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

.header_center_titleClass {
  width: 30%;
  font-size: 25px;
}

.header_center_titleClass span {
  margin-right: 25px;
}

.header_right_titleClass {
  display: flex;
  align-items: center;
  width: 30%;
  font-size: 25px;
}

.header_right_titleClass .el-progress {
  display: flex;
  width: 40%;
  ::v-deep .el-progress__text{
    width: 100px;
  }
}

.timeBox {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 40px;
  margin-top: 30px;
}

.timeBox img {
  width: 40px;
  height: 40px;
  margin-right: 20px;
}

.timeBox .timeBox_left {
  font-size: 23px;
  display: flex;
  align-items: center;
}

.timeBox .timeBox_right {
  font-size: 23px;
  margin-left: 30px;
  display: flex;
  align-items: center;
}
.stepsBox{
  height: 500px;
  width: 100%;
  padding-left: 100px;
  margin-top: 100px;
}
.stepsBox ::deep .el-step__title{
  font-size: 25px;
}
.step_text{
  ::v-deep .el-step__title{
    font-size: 25px!important;
    height: 90%;
    border-bottom: 1px solid #dbdbdb;
  }
}
.step_text{
  ::v-deep .el-step__main{
    height: 100px;
  }
}
.step_text{
  ::v-deep .el-step__icon-inner{
    font-size: 30px;
  }
}
</style>
