<template>
  <div class="app-container" v-loading="Loading">
    <div class="header">
      <div class="header_left_titleClass">
        <img src="../../../assets/icons/jobWork/renwu.png"></img>
        <span>{{ allData.databaseName }}</span>
      </div>
      <div class="header_center_titleClass">
        <span>行业模版：{{ allData.categoryName }}</span>
        <span>字段总数：{{ allData.filedCount }}</span>
      </div>
      <div class="header_right_titleClass">
        <span>进度：</span>
        <el-progress :percentage="allData.schedule" :color="allData.maskComplete == 'ERR' ? 'red' : '#409eff'"
          :stroke-width="26" :format="progressFormat"></el-progress>
      </div>
    </div>
    <div class="timeBox">
      <div class="timeBox_left">
        <img src="../../../assets/icons/jobWork/kaishishijian.png" alt="">
        <span>开始时间：{{ allData.startTime }}</span>
      </div>
      <div class="timeBox_center">
        <img src="../../../assets/icons/jobWork/yinghaoshi.png" alt="">
        <span>处理耗时：{{ allData.processingTime }}</span>
      </div>
      <div class="timeBox_right">
        <img src="../../../assets/icons/jobWork/state.png" alt="">
        <span>任务状态：{{ stateMsg(allData.maskComplete) }}</span>
      </div>
    </div>
    <div class="stepsBox">
      <el-steps direction="vertical" :active="allData.taskStepState" :process-status="processStatus"
        :finish-status="allData.maskComplete == 'ERR'?'error':'success'">
        <el-step class="step_text" icon="el-icon-loading" v-for="(item, index) in directionData" :title="item.title">
          <template slot="description">
            <el-popover id="popover" popper-class="popoverClass" placement="left" :title="item.titlepop" width="200"
              trigger="click">
              <div>
                <pre>{{ item.content }}</pre>
              </div>
              <i class="el-icon-warning-outline" @click.stop="handleMouseOver(item, index)"
                style="color:rgb(168 168 168);" circle slot="reference"></i>
            </el-popover>
          </template>
        </el-step>
      </el-steps>
    </div>
    <div
      style="width: 100%;height: 60px; display: flex; justify-content: flex-end;align-items: center; padding-right: 100px;">
      <el-button size="medium" style="font-size: 18px;" type="primary" round @click="goBack()">返 回</el-button>
    </div>
  </div>
</template>

<script>
import { getTaskMonitoring, taskProgressQuery } from "@/api/system/proxys";
export default {
  name: "jobMonitoring",
  data() {
    return {
      routeData: this.$route.query || {},
      allData: {},
      timer: null,
      Loading: false,
      processStatus: 'finish',
      executeStatus: [
        {
          value: 'COMPLETE',
          label: '执行完成'
        },
        {
          value: 'RUNNING',
          label: '执行中'
        },
        {
          value: 'NONE',
          label: '待执行'
        },
        {
          value: 'PAUSED',
          label: '暂停执行'
        }
        ,
        {
          value: 'KILLED',
          label: '执行终止'
        },
        {
          value: 'ERR',
          label: '执行失败'
        },
      ],
      directionData: [
        {
          title: '数据质量评估',
          titlepop: '数据质量评估',
          description: '描述',
          status: 1,
          content: '',
        },
        {
          title: '关键字/正则精确匹配',
          titlepop: '策略精确匹配',
          description: '描述',
          status: 2,
          content: '',
        },
        {
          title: 'AI推理',
          titlepop: 'AI推理',
          description: '描述',
          status: 3,
          content: '',
        },
        {
          title: 'AI审核',
          titlepop: 'AI审核',
          description: '描述',
          status: 4,
          content: '',
        },
      ],
      iIndex: 0,
    };
  },

  created() {
    this.fristGetTaskMonitoringFn()
  },
  mounted() {
    // this.getBtnClick()
  },
  methods: {
    handleMouseOver(item) {
      if (item.status > this.allData.taskStepState) {
        item.content = '未开始'
      } else if (item.status == this.allData.taskStepState) {
        item.content = '进行中'
      } else {
        switch (item.status) {
          case 1:
            return item.content = `高质量数据表：${this.allData.heightTableNum}个\n高质量数据表占比：${this.allData.heightTableScale}%`

          case 2:
            return item.content = `关键字/正则命中数量：${this.allData.ruleHitNum}个\n关键字/正则命中占比：${this.allData.ruleHitScale}%`

          case 3:
            return item.content = `推理成功数量：${this.allData.successNum}个\n无法分类数量：${this.allData.falseNum}个\n无法分类占比：${this.allData.falseScale}%`

          case 1:
            return item.content = `置信度高数量：${this.allData.trustNum}个\n置信度高占比：${this.allData.trustScale}%`
          default:
            break;
        }
      }
    },
    handleMouseOut() { },
    getBtnClick() {
      let Ele = document.querySelectorAll('.el-step__main')
      Ele.forEach((item, index) => {
        const newParagraph = document.createElement("i");
        newParagraph.style.position = 'absolute';
        newParagraph.style.top = '25px';
        newParagraph.style.right = '15%';
        newParagraph.style.color = '#b9b9b9';
        newParagraph.style.fontSize = '40px';
        newParagraph.className = 'el-icon-warning-outline iconClassBox';
        Ele[index].appendChild(newParagraph)
        newParagraph.style.display = 'none'
        item.addEventListener("click", function (ele) {
          let iEle = document.querySelectorAll('.iconClassBox')
          iEle.forEach((iItem, i) => {
            iItem.style.display = 'none'
          })
          let paraentEle = ele.target.parentNode
          paraentEle.children[2].style.display = ''
        });

      });
      let iEle = document.querySelectorAll('.iconClassBox')
      iEle.forEach((iItem, i) => {
        iItem.addEventListener("click", function (iItem) {
          let popover = document.getElementById('popover')
          popover.style.position = 'absolute';
          let ipostion = iItem.srcElement.getBoundingClientRect();
          popover.style.top = ipostion.top - 50 + 'px';
          popover.style.right = '28%';
        })
      })

    },
    fristGetTaskMonitoringFn() {
      this.Loading = true
      getTaskMonitoring({ proxyId: this.routeData.id }).then(res => {
        if (res.code == 200) {
          this.Loading = false
          this.allData = res.data
          if (this.allData.maskComplete == 'RUNNING') {
            this.getTaskMonitoringFn()
            return
          }
        }
      })
    },
    getTaskMonitoringFn() {
      this.timer = setInterval(() => {
        getTaskMonitoring({ proxyId: this.routeData.id }).then(res => {
          if (res.code == 200) {
            this.allData = res.data
            if (this.allData.schedule == 100 || this.allData.maskComplete != 'RUNNING') {
              clearInterval(this.timer)
            }

            if (this.allData.maskComplete == 'ERROR') {
              this.processStatus = 'error'
              clearInterval(this.timer)
            }
          }
        })
          .catch(err => {
            clearInterval(this.timer)
          });
      }, 1500);
    },
    // 进度条完成提示
    progressFormat() {
      if (this.allData.maskComplete == 'ERR') {
        return '失败'
      } else {
        return this.allData.schedule == 100 ? '已完成' : `${this.allData.schedule || 0}%`;
      }
    },
    // 执行状态中文
    stateMsg(val) {
      let msg = ''
      for (let item of this.executeStatus) {
        if (item.value == val) {
          msg = item.label
        }
      }
      return msg
    },

    goBack() {
      this.$router.go(-1)
    },
  },
  beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>
<style>
.popoverClass {
  border-radius: 15px !important;
}
</style>
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

  ::v-deep .el-progress__text {
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

.timeBox .timeBox_center {
  font-size: 23px;
  margin-left: 30px;
  display: flex;
  align-items: center;
}

.timeBox .timeBox_right {
  font-size: 23px;
  margin-left: 30px;
  display: flex;
  align-items: center;
}

.stepsBox {
  height: 500px;
  width: 100%;
  padding-left: 100px;
  margin-top: 100px;
}

.stepsBox ::deep .el-step__title {
  font-size: 25px;
}

.step_text {
  ::v-deep .el-step__title {
    font-size: 25px !important;
    height: 90%;
    border-bottom: 1px solid #dbdbdb;
  }
}

.step_text {
  ::v-deep .el-step__main {
    height: 100px;
    position: relative;
  }
}

.step_text {
  ::v-deep .el-step__icon-inner {
    font-size: 30px;
  }
}

.step_text {
  ::v-deep .el-step__description {
    position: absolute;
    top: 20px;
    right: 20%;
    ;
    font-size: 30px;
    padding: 0;
  }
}
</style>
