<template>
  <div class="content" tabIndex="1" v-loading="fullscreenLoading">
    <!-- <div class="seek">
      <el-input placeholder="请输入内容" class="input-with-select">
        <el-button
          class="common-el-button"
          slot="append"
          icon="el-icon-search"
        ></el-button>
      </el-input>
      <span class="seekP">这里最多显示20条endpoint</span>
    </div> -->
    <div>
      <div>
        <div class="titles">
          <div class="title-1">端点</div>
          <div>每分钟请求数</div>
          <div>请求成功率(%)</div>
          <div>响应时间(ms)</div>
        </div>

        <div class="titleSS" v-for="(item, index) in endpointList" :key="index">
          <div class="title-2">{{ item.label }}</div>
          <div class="ins-w">
            <a @click="LoadEch(item.label)" class="tltBtn">
              <i><svg t="1670811643321" class="icon" viewBox="0 0 1024 1024" version="1.1"
                  xmlns="http://www.w3.org/2000/svg" p-id="810" width="20" height="15">
                  <path
                    d="M1023.704765 95.970676c0-52.983672-42.987004-95.970676-95.970676-95.970676s-95.969653 42.987004-95.969653 95.970676c0 31.928145 15.744573 60.012755 39.73801 77.41406L731.108046 640.240093c-12.747313 0.623193-24.743519 3.686969-35.677535 8.747213L376.592154 324.494164c4.686738-11.246124 7.310492-23.586161 7.310492-36.582137 0-52.982649-42.985981-95.970676-95.969653-95.970676-52.983672 0-95.970676 42.988027-95.970676 95.970676 0 31.021496 14.932069 58.293603 37.738472 75.821797L90.930375 832.24182c-50.609604 2.686176-90.909409 44.238506-90.909409 95.47028 0 52.983672 42.985981 95.971699 95.970676 95.971699 52.983672 0 95.969653-42.988027 95.969653-95.971699 0-31.926098-15.744573-59.917588-39.674565-77.412013l138.270019-466.667069c15.61973-0.468674 30.052426-4.750183 42.924582-11.715821l316.339446 321.99423c-6.248301 12.683868-9.996668 26.741011-9.996668 41.863415 0 52.980602 42.985981 95.968629 95.969653 95.968629 52.982649 0 95.969653-42.988027 95.969653-95.968629 0-31.805348-15.620754-59.671995-39.424879-77.16335l140.456822-467.168489C983.40496 188.755803 1023.704765 147.205519 1023.704765 95.970676"
                    fill="#409eff" p-id="811"></path>
                </svg></i>
              {{ item.number.toFixed(2) }}
            </a>
          </div>

          <div class="ins-w">
            <a @click="RateEch(item.label)" class="tltBtn">
              <i><svg t="1670811643321" class="icon" viewBox="0 0 1024 1024" version="1.1"
                  xmlns="http://www.w3.org/2000/svg" p-id="810" width="20" height="15">
                  <path
                    d="M1023.704765 95.970676c0-52.983672-42.987004-95.970676-95.970676-95.970676s-95.969653 42.987004-95.969653 95.970676c0 31.928145 15.744573 60.012755 39.73801 77.41406L731.108046 640.240093c-12.747313 0.623193-24.743519 3.686969-35.677535 8.747213L376.592154 324.494164c4.686738-11.246124 7.310492-23.586161 7.310492-36.582137 0-52.982649-42.985981-95.970676-95.969653-95.970676-52.983672 0-95.970676 42.988027-95.970676 95.970676 0 31.021496 14.932069 58.293603 37.738472 75.821797L90.930375 832.24182c-50.609604 2.686176-90.909409 44.238506-90.909409 95.47028 0 52.983672 42.985981 95.971699 95.970676 95.971699 52.983672 0 95.969653-42.988027 95.969653-95.971699 0-31.926098-15.744573-59.917588-39.674565-77.412013l138.270019-466.667069c15.61973-0.468674 30.052426-4.750183 42.924582-11.715821l316.339446 321.99423c-6.248301 12.683868-9.996668 26.741011-9.996668 41.863415 0 52.980602 42.985981 95.968629 95.969653 95.968629 52.982649 0 95.969653-42.988027 95.969653-95.968629 0-31.805348-15.620754-59.671995-39.424879-77.16335l140.456822-467.168489C983.40496 188.755803 1023.704765 147.205519 1023.704765 95.970676"
                    fill="#409eff" p-id="811"></path>
                </svg></i>
              {{ (item.rate / 100.0).toFixed(2) }}
            </a>
          </div>
          <div class="ins-w">
            <a @click="Latency(item.label)" class="tltBtn">
              <i><svg t="1670811643321" class="icon" viewBox="0 0 1024 1024" version="1.1"
                  xmlns="http://www.w3.org/2000/svg" p-id="810" width="20" height="15">
                  <path
                    d="M1023.704765 95.970676c0-52.983672-42.987004-95.970676-95.970676-95.970676s-95.969653 42.987004-95.969653 95.970676c0 31.928145 15.744573 60.012755 39.73801 77.41406L731.108046 640.240093c-12.747313 0.623193-24.743519 3.686969-35.677535 8.747213L376.592154 324.494164c4.686738-11.246124 7.310492-23.586161 7.310492-36.582137 0-52.982649-42.985981-95.970676-95.969653-95.970676-52.983672 0-95.970676 42.988027-95.970676 95.970676 0 31.021496 14.932069 58.293603 37.738472 75.821797L90.930375 832.24182c-50.609604 2.686176-90.909409 44.238506-90.909409 95.47028 0 52.983672 42.985981 95.971699 95.970676 95.971699 52.983672 0 95.969653-42.988027 95.969653-95.971699 0-31.926098-15.744573-59.917588-39.674565-77.412013l138.270019-466.667069c15.61973-0.468674 30.052426-4.750183 42.924582-11.715821l316.339446 321.99423c-6.248301 12.683868-9.996668 26.741011-9.996668 41.863415 0 52.980602 42.985981 95.968629 95.969653 95.968629 52.982649 0 95.969653-42.988027 95.969653-95.968629 0-31.805348-15.620754-59.671995-39.424879-77.16335l140.456822-467.168489C983.40496 188.755803 1023.704765 147.205519 1023.704765 95.970676"
                    fill="#409eff" p-id="811"></path>
                </svg></i>
              {{ item.time.toFixed(2) }}
            </a>
          </div>
          <!-- <div class="tlt">查看</div> -->
        </div>

        <div class="CpmContent" v-if="showSon">暂无数据</div>
        <el-dialog v-if="centerDialogVisible" class="dialogClass" :show-close="false" :modal="false"
          :close-on-click-modal="true" :append-to-body="false" width="30%" :visible.sync="centerDialogVisible"
          @opened="opens">
          <div ref="YEcharts" style="width: 100%; height: 300px"></div>
        </el-dialog>
        <el-dialog v-if="successRateVisible" class="dialogClass" :show-close="false" :modal="false"
          :close-on-click-modal="true" :append-to-body="false" width="30%" :visible.sync="successRateVisible"
          @opened="successRateopens">
          <div ref="successRateEchart" style="width: 100%; height: 300px"></div>
        </el-dialog>
        <el-dialog v-if="LatencyVisible" class="dialogClass" :show-close="false" :modal="false" width="30%"
          :close-on-click-modal="true" :append-to-body="false" :visible.sync="LatencyVisible" @opened="LatencyOpens">
          <div ref="LatencyEch" style="width: 100%; height: 300px"></div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts"
import { queryEndpointsI, endpointsListDataI } from "@/api/system/monitor";

export default {
  name: "my-endpoint",
  props: {
    timeHorizonC: {
      type: Array,
      default () {
        return [];
      },
    },
    currentServerC: {
      type: String,
      default () {
        return "";
      },
    },
    currentServerIdC: {
      type: String,
      default () {
        return "";
      },
    },
    // 当前tab的视图名称
    currView: {
      type: String,
      default () {
        return "";
      },
    },
  },

  data () {
    return {
      showSon: false,
      fullscreenLoading: false,
      instancesData: {},
      instancesStr: "",
      LatencyVisible: "",
      successRateVisible: "",
      name: "endpoint",
      currViewC: "",
      serverId: "",
      centerDialogVisible: false,
      //加载图表
      echartsOpt: {
        color: ["#409eff"],
        tooltip: {
          axisPointer: {
            type: "cross",
          },
        },

        legend: {},
        grid: {
          top: "10%",
          bottom: "10%",
          right: "10%",
          // containLabel: true,
        },
        xAxis: {
          data: [],
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            //x轴的坐标文字
            show: true,
            textStyle: {
              color: "#a0a8b5", //文字的颜色
            },
          },
        },
        yAxis: {
          axisLabel: {
            //y轴的坐标文字
            show: true,
            textStyle: {
              color: "#a0a8b5", //文字的颜色
            },
          },

          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              type: "dashed", //虚线
            },
            show: true, //隐藏
          },
        },
        series: [
          {
            symbol: "circle",
            data: [],
            type: "line",
          },
        ],
      },
      //成功率图表
      successRateEchOpt: {
        color: ["#409eff"],
        tooltip: {
          axisPointer: {
            type: "cross",
          },
        },

        legend: {},
        grid: {
          top: "10%",
          bottom: "10%",
          right: "10%",
          // containLabel: true,
        },
        xAxis: {
          data: [],
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            //x轴的坐标文字
            show: true,
            textStyle: {
              color: "#a0a8b5", //文字的颜色
            },
          },
        },
        yAxis: {
          axisLabel: {
            //y轴的坐标文字
            show: true,
            textStyle: {
              color: "#a0a8b5", //文字的颜色
            },
          },

          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              type: "dashed", //虚线
            },
            show: true, //隐藏
          },
        },
        series: [
          {
            symbol: "circle",
            data: [],
            type: "line",
          },
        ],
      },
      //延时图表
      LatencyEchOpt: {
        color: ["#409eff"],
        tooltip: {
          axisPointer: {
            type: "cross",
          },
        },

        legend: {},
        grid: {
          top: "10%",
          bottom: "10%",
          right: "10%",
          // containLabel: true,
        },
        xAxis: {
          data: [],
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            //x轴的坐标文字
            show: true,
            textStyle: {
              color: "#a0a8b5", //文字的颜色
            },
          },
        },
        yAxis: {
          axisLabel: {
            //y轴的坐标文字
            show: true,
            textStyle: {
              color: "#a0a8b5", //文字的颜色
            },
          },

          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              type: "dashed", //虚线
            },
            show: true, //隐藏
          },
        },
        series: [
          {
            symbol: "circle",
            data: [],
            type: "line",
          },
        ],
      },
      tableData: [],
      endpointList: [],
    };
  },

  watch: {
    currView: {
      handler (newVal, oldVal) {
        this.currViewC = newVal;
        if (this.name == this.currViewC) {
          this.loadAllData();
        }
      },
    },
    timeHorizonC () {
      if (this.name == this.currViewC) {
        this.loadAllData();
      }
    },
    currentServerIdC: {
      handler (newVal, oldVal) {
        this.serverId = newVal;
        if (this.name == this.currViewC) {
          this.loadAllData();
        }
      },
    },
    currentServerIdC () {
      if (this.name == this.currViewC) {
        this.loadAllData();
      }
    },
  },
  mounted () {
    this.currViewC = this.currView;
    this.serverId = this.currentServerIdC;
    this.loadAllData();
  },
  //方法集合
  methods: {
    loadAllData () {
      this.fullscreenLoading = true;
      if (this.name == this.currViewC) {
        this.queryEndpoints();
        this.centerDialogVisible = false;
        this.successRateVisible = false;
        this.LatencyVisible = false;
      }
    },
    // 服务端点列表（端点）
    queryEndpoints () {
      let data = {
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
        serverId: this.currentServerIdC,
        keywork: "",
      };
      queryEndpointsI(data).then((res) => {
        this.endpointList = [];

        this.instancesStr = "";
        this.tableData = res.data;
        for (let i = 0; i < this.tableData.length; i++) {
          this.instancesStr = this.instancesStr + this.tableData[i].label + ",";
        }
        this.endpointsListData();
      });
    },
    // 求平均数
    avgFun (arry) {
      if (arry.length == 0) return 0;
      let sum = 0;
      for (let item in arry) {
        sum = sum + arry[item]["value"];
      }
      return sum / arry.length;
    },
    //服务端点行内指标数据（端点）
    endpointsListData () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
        endpointName: this.instancesStr,
      };

      endpointsListDataI(data).then((res) => {
        this.instancesData = res.data;
        for (let item in this.tableData) {
          let key = this.tableData[item]["label"]
            .replaceAll(".", "")
            .replaceAll(":", "");
          this.tableData[item]["number"] = this.avgFun(
            this.instancesData[key]["endpoint_cpm"]
          );
          this.tableData[item].rate = this.avgFun(
            this.instancesData[key]["endpoint_sla"]
          );
          this.tableData[item].time = this.avgFun(
            this.instancesData[key]["endpoint_resp_time"]
          );
        }
        this.endpointList = this.tableData;
        if (this.endpointList.length == 0) {
          this.showSon = true;
        } else {
          this.showSon = false;
        }

        this.fullscreenLoading = false;
      });
    },

    // 延时
    Latency (i) {
      i = i.replaceAll(".", "").replaceAll(":", "");
      this.LatencyEchOpt.series[0].data =
        this.instancesData[i]["endpoint_resp_time"];
      this.LatencyEchOpt.xAxis.data = this.instancesData.pointTime;
      this.LatencyOpens();
    },

    LatencyEch () {
      let RodChart = echarts.init(this.$refs.LatencyEch, "macarons");
      RodChart.setOption(this.LatencyEchOpt);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },
    LatencyOpens () {
      this.LatencyVisible = true;
      this.$nextTick(() => {
        this.LatencyEch();
      });
    },

    //成功率折线图
    RateEch (i) {
      i = i.replaceAll(".", "").replaceAll(":", "");

      this.successRateEchOpt.series[0].data =
        this.instancesData[i]["endpoint_sla"];
      this.successRateEchOpt.xAxis.data = this.instancesData.pointTime;
      this.successRateopens();
    },

    successRateEch () {
      let RodChart = echarts.init(this.$refs.successRateEchart, "macarons");
      RodChart.setOption(this.successRateEchOpt);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },
    successRateopens () {
      this.successRateVisible = true;
      this.$nextTick(() => {
        this.successRateEch();
      });
    },

    //加载折线图按钮
    LoadEch (i) {
      i = i.replaceAll(".", "").replaceAll(":", "");
      this.echartsOpt.series[0].data = this.instancesData[i]["endpoint_cpm"];
      this.echartsOpt.xAxis.data = this.instancesData.pointTime;
      this.opens();
    },

    opens () {
      this.centerDialogVisible = true;
      this.$nextTick(() => {
        this.Ycharts();
      });
    },

    Ycharts () {
      let RodChart = echarts.init(this.$refs.YEcharts, "macarons");
      RodChart.setOption(this.echartsOpt);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created () { },
  //生命周期 - 挂载完成（可以访问DOM元素）

  beforeCreate () { }, //生命周期 - 创建之前
  beforeMount () { }, //生命周期 - 挂载之前
  beforeUpdate () { }, //生命周期 - 更新之前
  updated () { }, //生命周期 - 更新之后
  beforeDestroy () { }, //生命周期 - 销毁之前
  destroyed () { }, //生命周期 - 销毁完成
  activated () { }, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style scoped>
.ins-w {
  width: 90px;
}

.CpmContent {
  text-align: center;
  padding: 10px;
}

.dialogClass /deep/.el-dialog__header {
  padding-top: 2px;
}

.dialogClass /deep/.el-dialog__body {
  padding: 0px;
}

.dialogClass /deep/.el-dialog__footer {
  text-align: right;
}

.tltBtn {
  border: 0px;
  background-color: #fff;
}

.tlt {
  color: #000;
}

.title-2 {
  width: 35%;
  color: #000;
}

.titleSS {
  display: flex;
  justify-content: space-between;
  height: 60px;
  line-height: 60px;
  font-size: 14px;
  border-bottom: 1px solid #ebeef5;
  padding-right: 50px;
  color: #000;
}

.title-1 {
  width: 35%;
}

.titles {
  display: flex;
  justify-content: space-between;
  height: 40px;
  line-height: 40px;
  color: #909399;
  font-size: 14px;
  font-weight: 700;
  border-bottom: 1px solid #ebeef5;
  padding-right: 50px;
}

/* .content:focus {
  border: 1px solid #409eff;
} */
.content {
  margin-bottom: 13px;
  transform: translate3d(20px, 10px, 0px);
  width: 98%;
  height: 900px;
  padding: 10px;
  background: #fff;
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
  margin-top: 50px;
  /* padding-right: 10px; */
}

.seekP {
  color: rgba(255, 0, 0, 0.5);
  margin-left: 5px;
  font-size: 12px;
}



/* @import url(); 引入公共css类 */
.el-input-group {
  width: 300px !important;
}
</style>
