<template>
  <div class="content">

    <div class="headers">
      <div class="text-wrapper_7">
        <span class="text_23">Apdex评分:</span>
        <span class="text_24">{{ ApdexScore }}</span>
      </div>
      <div class="text-wrapper_7">
        <span class="text_23">请求成功率:</span>
        <span class="text_26">{{ serviceSlaS }}%</span>
      </div>
      <div class="text-wrapper_7">
        <span class="text_23">每分钟请求数:</span>
        <span class="text_28">{{ perMinute }}</span>
      </div>
    </div>
    <!-- <div class="header">
      <div class="headerDiv" tabIndex="1">
        <div class="Apdex">Apdex评分</div>
        <div class="Apdex-s">{{ ApdexScore }}</div>
      </div>
      <div class="headerDiv1" tabIndex="1">
        <div class="Apdex">请求成功率</div>
        <div class="Apdex-s">{{ serviceSlaS }}%</div>
      </div>
      <div class="headerDiv2" tabIndex="1">
        <div class="Apdex">每分钟请求数</div>
        <div class="Apdex-s">{{ perMinute }}</div>
      </div>
    </div> -->
    <!-- <div class="txt_cla">
      <div class="txt_t">111</div>
    </div> -->
    <div class="footer">
      <div class="footerEch" tabIndex="1" v-loading="fullscreenLoading">
        <div class="Apdex">平均响应延时(ms)</div>
        <div class="proCharts" ref="YEcharts"></div>
      </div>
      <!-- <div class="footerEch" tabIndex="1" v-loading="satisfactionLoading">
        <div class="Apdex">Apdex评分</div>
        <div class="proCharts" ref="satisfactionEC"></div>
      </div> -->
      <div class="footerEch" tabIndex="1" v-loading="PercentileLoading">
        <div class="Apdex">百分比响应延时</div>
        <div class="proCharts" ref="PercentileEC"></div>
      </div>
      <div class="footerEch" tabIndex="1" v-loading="minuteLoading">
        <div class="Apdex">服务每分钟请求数</div>
        <div class="proCharts" ref="loadEchart"></div>
      </div>
    </div>
    <div class="bottom">
      <div class="bottomEch1" tabIndex="1" v-loading="successLoading">
        <div class="Apdex">服务实例请求成功率(%)</div>
        <div class="proCharts" ref="SuccessYEcharts"></div>
      </div>
      <div class="bottomEch1" tabIndex="1" v-loading="MessageLoading">
        <div class="Apdex">消息队列消耗计数</div>
        <div class="proCharts" ref="MessageEcharts"></div>
      </div>
      <div class="bottomEch1" tabIndex="1" v-loading="avgLoading">
        <div class="Apdex">消息队列平均消耗延时(ms)</div>
        <div class="proCharts" ref="AvgEcharts"></div>
      </div>

      <!-- 服务实例每分钟请求数 -->
      <div class="bottomEch" tabIndex="1" v-loading="serviceLoading">
        <div class="Apdex">服务实例每分钟请求数</div>
        <el-table class="tabBox" :data="serviceInstanceCpmList" height="228">
          <el-table-column align="center" label="实例" prop="name"></el-table-column>
          <el-table-column align="center" label="请求数" prop="value"></el-table-column>
          <!-- <el-table-column label="" ></el-table-column> -->
        </el-table>

      </div>

      <!-- 慢服务实例响应时间 -->
      <div class="bottomEch" tabIndex="1" v-loading="timeLoading">
        <div class="Apdex">慢服务实例响应时间</div>
        <el-table class="tabBox" :data="serviceInstanceRespTimeList" height="228">
          <el-table-column align="center" label="实例" prop="name"></el-table-column>
          <el-table-column align="center" label="响应时间(ms)" prop="value"></el-table-column>
          <!-- <el-table-column align="center" label="时间轴">
            <template slot-scope="scope">
              <el-progress :text-inside="true" :show-text="false" :percentage="scope.row.serviceInstanceRespTimePer > 100
                ? 100
                : scope.row.serviceInstanceRespTimePer
                " color="#49BDF9"></el-progress>

            </template>
          </el-table-column> -->
        </el-table>

      </div>

      <!-- 服务实例成功率 -->
      <div class="bottomEch" tabIndex="1" v-loading="rateLoading">
        <div class="Apdex">服务实例成功率</div>
        <el-table class="tabBox" :data="serviceInstanceSlaList" height="228">
          <el-table-column align="center" label="实例" prop="name"></el-table-column>
          <el-table-column align="center" label="响应成功率(%)">
            <template slot-scope="scope">
              {{ (scope.row.value / 100).toFixed(2) }}
            </template>

          </el-table-column>
          <!-- <el-table-column align="center" label="时间轴">
            <template slot-scope="scope">
              <el-progress :text-inside="true" :show-text="false" :percentage="scope.row.serviceInstanceSlaPer > 100
                ? 100
                : scope.row.serviceInstanceSlaPer
                " color="#49BDF9"></el-progress>

            </template>
          </el-table-column> -->
        </el-table>

      </div>

      <!-- 端点每分钟请求数 -->
      <div class="bottomEch" tabIndex="1" v-loading="endpointLoading">
        <div class="Apdex">端点每分钟请求数</div>

        <el-table class="tabBox" :data="endpointCpmList" height="228">
          <el-table-column align="center" label="实例" prop="name"></el-table-column>
          <el-table-column align="center" label="请求数">
            <template slot-scope="scope">
              <!-- {{ (scope.row.value / 100).toFixed(2) }} -->
              {{ scope.row.value }}
            </template>

          </el-table-column>
          <el-table-column align="center" label=" ">
            <template slot-scope="scope">
              <el-progress :text-inside="true" :show-text="false" :percentage="scope.row.endpointCpmPer > 100
                ? 100
                : scope.row.endpointCpmPer
                " color="#49BDF9"></el-progress>

            </template>
          </el-table-column>
        </el-table>
        <!-- <div class="serve-1">
          <div class="Num" v-for="(item, index) in endpointCpmList" :key="index">
            <div style="margin-bottom: 8px;">
              <div class="numerical">{{ item.value }}</div>
              <div class="single">{{ item.name }}</div>
            </div>
            <el-progress :text-inside="true" :show-text="false" :percentage="item.endpointCpmPer > 100 ? 100 : item.endpointCpmPer
              " color="#49BDF9"></el-progress>
          </div>
          <div class="CpmContent" v-if="endpointCpmList.length == 0">
            无数据
          </div>
        </div> -->
      </div>

      <!-- 慢端点响应时间 -->
      <div class="bottomEch" tabIndex="1" v-loading="endpointRespTimeLoading">
        <div class="Apdex">慢端点响应时间</div>
        <el-table class="tabBox" :data="endpointRespTimeList" height="228">
          <el-table-column align="center" label="实例" prop="name"></el-table-column>
          <el-table-column align="center" label="响应时间(ms)">
            <template slot-scope="scope">
              <!-- {{ (scope.row.value / 100).toFixed(2) }} -->
              {{ scope.row.value }}
            </template>

          </el-table-column>
          <el-table-column align="center" label="时间轴">
            <template slot-scope="scope">
              <el-progress :text-inside="true" :show-text="false" :percentage="scope.row.endpointRespTimePer > 100
                ? 100
                : scope.row.endpointRespTimePer
                " color="#49BDF9"></el-progress>

            </template>
          </el-table-column>
        </el-table>

        <!-- <div class="serve-1">
          <div class="Num" v-for="(item, index) in endpointRespTimeList" :key="index">
            <div style="margin-bottom: 8px;">
              <div class="numerical">{{ item.value }}</div>
              <div class="single">{{ item.name }}</div>
            </div>


            <el-progress :text-inside="true" :show-text="false" :percentage="item.endpointRespTimePer > 100 ? 100 : item.endpointRespTimePer
              " color="#49BDF9"></el-progress>

          </div>
          <div class="CpmContent" v-if="endpointRespTimeList.length == 0">
            无数据
          </div>
        </div> -->
      </div>

      <!-- 端点请求成功率 -->
      <div class="bottomEch" tabIndex="1" v-loading="endpointSlaLoading">
        <div class="Apdex">端点请求成功率</div>
        <el-table class="tabBox" :data="endpointSlaList" height="228">
          <el-table-column align="center" label="实例" prop="name"></el-table-column>
          <el-table-column align="center" label="请求成功率(%)">
            <template slot-scope="scope">
              {{ (scope.row.value / 100).toFixed(2) }}
              <!-- {{ scope.row.value }} -->
            </template>

          </el-table-column>
          <el-table-column align="center" label=" ">
            <template slot-scope="scope">
              <el-progress :text-inside="true" :show-text="false" :percentage="scope.row.endpointSlaPer > 100
                ? 100
                : scope.row.endpointSlaPer
                " color="#49BDF9"></el-progress>

            </template>
          </el-table-column>
        </el-table>

        <!-- <div class="serve-1">
          <div class="Num" v-for="(item, index) in endpointSlaList" :key="index">
            <div style="margin-bottom: 8px;">
              <div class="numerical">{{ (item.value / 100).toFixed(2) }}</div>
              <div class="single">{{ item.name }}</div>
            </div>
            <el-progress :text-inside="true" :show-text="false" :percentage="item.endpointSlaPer > 100 ? 100 : item.endpointSlaPer
              " color="#49BDF9"></el-progress>
          </div>
          <div class="CpmContent" v-if="endpointSlaList.length == 0">
            无数据
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts"
import {
  servicRespTimeI,
  serviceApdexI,
  servicePercentileI,
  serviceCpmI,
  serviceSlaI,
  serviceMqConsumeCountI,
  serviceMqConsumeLatencyI,
  serviceInstanceCpmI,
  serviceInstanceRespTimeI,
  serviceInstanceSlaI,
  endpointCpmI,
  endpointRespTimeI,
  endpointSlaI,
  queryServeBaseDataI,
} from "@/api/system/monitor";
// import loginVue from "../../views/login.vue";
export default {
  name: "my-overview",
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

    // 当前tab的视图名称
    currView: {
      type: String,
      default () {
        return "";
      },
    },
  },

  components: {},
  data () {
    return {
      MessageLoading: false,
      avgLoading: false,
      serviceLoading: false,
      timeLoading: false,
      rateLoading: false,
      endpointLoading: false,
      endpointSlaLoading: false,
      endpointRespTimeLoading: false,
      successLoading: false,
      minuteLoading: false,
      PercentileLoading: false,
      satisfactionLoading: false,
      fullscreenLoading: false,
      perMinute: "",
      serviceSlaS: "",
      ApdexScore: "",
      name: "overview",
      serverId: "",
      currViewC: "",
      // 端点请求成功率
      endpointSlaList: [],

      // 慢端点响应时间
      endpointRespTimeList: [],

      // 端点每分钟请求数
      endpointCpmList: [],

      // 服务实例成功率
      serviceInstanceSlaList: [],

      // 慢服务实例
      serviceInstanceRespTimeList: [],

      //服务实例负载
      serviceInstanceCpmList: [],
      //消息队列平均消耗延时
      QueueAvg: {
        color: ["#409eff"],
        tooltip: {
          axisPointer: {
            type: "cross",
          },
        },

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
      // 消息队列消耗计数
      MessageQueue: {
        color: ["#409eff"],
        tooltip: {
          axisPointer: {
            type: "cross",
          },
        },

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
      //请求成功率
      SuccessRate: {
        color: ["#409eff"],
        tooltip: {
          axisPointer: {
            type: "cross",
          },
        },

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

      //业务负载
      ServiceLoad: {
        color: ["#409eff"],
        tooltip: {
          axisPointer: {
            type: "cross",
          },
        },

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
      //服务响应时间百分比
      Percentile: {
        color: ["#246EFF", "#00B2FF", "#80E2FF", "#8DC1D1", "#0E46B5"],
        tooltip: {
          axisPointer: {
            type: "cross",
          },
        },

        legend: {
          orient: "horizontal",
          x: "center",
          y: "top",

          // bottom:'10',
          itemHeight: 10,
          icon: "circle", //图例icon图标
          // left: '10',
          // top: '-10',
          // textStyle: {
          //       // color: "#000",
          //       fontSize: 10,
          //     },

          data: ["P50", "P75", "P90", "P95", "P99",

          ],
        },
        grid: {
          top: "10%",
          bottom: "10%",
          right: "10%",
        },

        xAxis: {
          type: 'category',
          boundaryGap: false,
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
          type: "value",
          splitLine: {
            lineStyle: {
              type: "dashed", //虚线
            },
            show: false, //隐藏
          },
          axisLabel: {
            //x轴的坐标文字
            show: true,
            textStyle: {
              color: "#000", //文字的颜色
            },
          },

          axisLine: {
            //坐标轴轴线相关设置
            show: false,
          },
          axisTick: {
            //坐标轴刻度相关设置。
            show: false,
          },
        },
        series: [
          {
            name: 'P50',
            type: 'line',
            stack: 'Total',
            data: []
          },
          {
            name: 'P75',
            type: 'line',
            stack: 'Total',
            data: []
          },
          {
            name: 'P90',
            type: 'line',
            stack: 'Total',
            data: []
          },
          {
            name: 'P95',
            type: 'line',
            stack: 'Total',
            data: []
          },
          {
            name: 'P99',
            type: 'line',
            stack: 'Total',
            data: []
          }
        ]
      },

      // Apdex评分
      satisfaction: {
        color: ["#409eff"],
        tooltip: {
          axisPointer: {
            type: "cross",
          },
        },

        grid: {
          left: "12%",
          top: 10,
          bottom: "10%",
        },
        xAxis: [
          {
            type: "category",

            axisTick: {
              show: false,
            },

            data: [],
            axisLabel: {
              //坐标轴刻度标签的相关设置
              // interval: 0,
              textStyle: {
                color: "#000",
                fontSize: 10,
              },
            },
            axisLine: {
              //坐标轴轴线相关设置
              show: false,
              lineStyle: {
                color: "#000",
              },
            },
            axisTick: {
              //坐标轴刻度相关设置。
              show: false,
            },
          },
          {
            type: "category",
          },
        ],
        yAxis: [
          {
            type: "value",
            splitLine: {
              lineStyle: {
                type: "dashed", //虚线
              },
              show: true, //隐藏
            },
            axisLabel: {
              //x轴的坐标文字
              show: true,
              textStyle: {
                color: "#000", //文字的颜色
              },
            },

            axisLine: {
              //坐标轴轴线相关设置
              show: false,
              // lineStyle: {
              //   color: "#000",
              // },
            },
            axisTick: {
              //坐标轴刻度相关设置。
              show: false,
            },
          },
        ],
        series: [
          {
            symbol: "circle",
            type: "line",
            xAxisIndex: 1,
            smooth: true,
            emphasis: {
              focus: "series",
            },
            data: [],
          },
        ],
      },
      // 平均响应延时
      echartsOpt: {
        color: ["#409eff"],
        tooltip: {
          axisPointer: {
            type: "cross",
          },
        },

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
    };
  },

  //监控data中的数据变化
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
    currentServerC: {
      handler (newVal, oldVal) {
        this.serverId = newVal;
        if (this.name == this.currViewC) {
          this.loadAllData();
        }
      },
    },
  },
  //方法集合
  methods: {
    /**
     * 加载或者刷新页面全部数据
     */
    loadAllData () {
      this.minuteLoading = true;
      this.successLoading = true;
      this.MessageLoading = true;
      this.avgLoading = true;
      this.serviceLoading = true;
      this.timeLoading = true;
      this.rateLoading = true;
      this.endpointLoading = true;
      this.endpointSlaLoading = true;
      this.endpointRespTimeLoading = true;
      this.PercentileLoading = true;
      this.satisfactionLoading = true;
      this.fullscreenLoading = true;
      this.servicRespTime();
      // this.serviceApdex();
      this.servicePercentile();
      this.serviceCpm();
      this.serviceSla();
      this.serviceMqConsumeCount();
      this.serviceMqConsumeLatency();
      this.serviceInstanceCpm();
      this.serviceInstanceRespTime();
      this.serviceInstanceSla();
      this.endpointCpm();
      this.endpointRespTime();
      this.endpointSla();
      this.queryServeBaseData();
    },

    // 查询服务基础数据（首页）
    queryServeBaseData () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      queryServeBaseDataI(data).then((res) => {
        this.ApdexScore = (res.data.values.service_apdex / 10000.0).toFixed(2);
        this.serviceSlaS = (res.data.values.service_sla / 100.0).toFixed(2);
        this.perMinute = res.data.values.service_cpm;
      });
    },

    // 端点请求成功率
    endpointSla () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      endpointSlaI(data).then((res) => {
        this.endpointSlaList = res.data.values;

        if (this.endpointSlaList.length > 0) {
          // let per = this.endpointSlaList[0].value;
          let per = 10000;

          for (let i = 0; i < this.endpointSlaList.length; i++) {
            this.endpointSlaList[i].endpointSlaPer =
              (this.endpointSlaList[i].value / per) * 100;
          }
        }
        this.endpointSlaLoading = false;
      });
    },

    // 慢端点响应时间
    endpointRespTime () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      endpointRespTimeI(data).then((res) => {
        this.endpointRespTimeList = res.data.values;

        if (this.endpointRespTimeList.length > 0) {
          // let per = 100;
          let per = this.endpointRespTimeList[0].value;
          for (let i = 0; i < this.endpointRespTimeList.length; i++) {
            this.endpointRespTimeList[i].endpointRespTimePer =
              (this.endpointRespTimeList[i].value / per) * 100;
          }
        }

        this.endpointRespTimeLoading = false;
      });
    },

    // 端点每分钟请求数
    endpointCpm () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      endpointCpmI(data).then((res) => {
        this.endpointCpmList = res.data.values;
        let tmpList = [];
        if (this.endpointCpmList.length > 0) {
          for (let i = 0; i < this.endpointCpmList.length; i++) {
            if (this.endpointCpmList[i].value > 0) {
              tmpList.push(this.endpointCpmList[i]);
            }
          }
          this.endpointCpmList = tmpList;
          if (this.endpointCpmList.length > 0) {
            let per = this.endpointCpmList[0].value;
            // let per = 100;
            for (let i = 0; i < this.endpointCpmList.length; i++) {
              this.endpointCpmList[i].endpointCpmPer =
                (this.endpointCpmList[i].value / per) * 100;
            }
          }
        }
        this.endpointLoading = false;
      });
    },

    // 服务实例成功率
    serviceInstanceSla () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      serviceInstanceSlaI(data).then((res) => {
        this.rateLoading = false;
        this.serviceInstanceSlaList = res.data.values;
        if (this.serviceInstanceSlaList.length > 0) {
          // let per = this.serviceInstanceSlaList[0].value;
          let per = 10000;
          for (let i = 0; i < this.serviceInstanceSlaList.length; i++) {
            this.serviceInstanceSlaList[i].serviceInstanceSlaPer =
              (this.serviceInstanceSlaList[i].value / per) * 100;
          }
        }
      });
    },

    // 慢服务实例响应时间
    serviceInstanceRespTime () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      serviceInstanceRespTimeI(data).then((res) => {
        this.serviceInstanceRespTimeList = res.data.values;
        if (this.serviceInstanceRespTimeList.length > 0) {
          // let per = 100;
          let per = this.serviceInstanceRespTimeList[0].value;

          for (let i = 0; i < this.serviceInstanceRespTimeList.length; i++) {
            this.serviceInstanceRespTimeList[i].serviceInstanceRespTimePer =
              (this.serviceInstanceRespTimeList[i].value / per) * 100;
          }
        }

        this.timeLoading = false;
      });
    },

    //服务实例每分钟请求数
    serviceInstanceCpm () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      serviceInstanceCpmI(data).then((res) => {
        this.serviceInstanceCpmList = res.data.values;
        let tmpList = [];
        if (this.serviceInstanceCpmList.length > 0) {
          for (let i = 0; i < this.serviceInstanceCpmList.length; i++) {
            if (this.serviceInstanceCpmList[i].value > 0) {
              tmpList.push(this.serviceInstanceCpmList[i]);
            }
          }
          this.serviceInstanceCpmList = tmpList;
          if (this.serviceInstanceCpmList.length > 0) {
            let per = this.serviceInstanceCpmList[0].value;
            // let per = 100;
            for (let i = 0; i < this.serviceInstanceCpmList.length; i++) {
              this.serviceInstanceCpmList[i].serviceInstanceCpmPer =
                (this.serviceInstanceCpmList[i].value / per) * 100;
            }
          }
        }
        this.serviceLoading = false;
      });
    },

    //消息队列平均消耗延时数据
    serviceMqConsumeLatency () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      serviceMqConsumeLatencyI(data).then((res) => {
        this.QueueAvg.series[0].data = res.data.values;
        this.QueueAvg.xAxis.data = res.data.pointTime;
        let RodChart = echarts.init(this.$refs.AvgEcharts, "macarons");
        RodChart.setOption(this.QueueAvg, true);
        this.avgLoading = false;
      });
    },

    //消息队列平均消耗延时图表
    QueueChart () {
      let RodChart = echarts.init(this.$refs.AvgEcharts, "macarons");
      RodChart.setOption(this.QueueAvg, true);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },

    // 消息队列消耗计数 数据
    serviceMqConsumeCount () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      serviceMqConsumeCountI(data).then((res) => {
        this.MessageLoading = false;

        this.MessageQueue.series[0].data = res.data.values;
        this.MessageQueue.xAxis.data = res.data.pointTime;

        let RodChart = echarts.init(this.$refs.MessageEcharts, "macarons");
        RodChart.setOption(this.MessageQueue, true);
      });
    },

    // 消息队列消耗计数图表
    MessageChart () {
      let RodChart = echarts.init(this.$refs.MessageEcharts, "macarons");
      RodChart.setOption(this.MessageQueue, true);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },

    //服务实例请求成功率数据
    serviceSla () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      serviceSlaI(data).then((res) => {
        this.successLoading = false;
        let item = []
        for (let i = 0; i < res.data.values.length; i++) {
          item.push((res.data.values[i].value / 100).toFixed(2))
        }
        this.SuccessRate.series[0].data = item;
        this.SuccessRate.xAxis.data = res.data.pointTime;
        let RodChart = echarts.init(this.$refs.SuccessYEcharts, "macarons");
        RodChart.setOption(this.SuccessRate, true);
      });
    },

    //服务实例请求成功率图表
    succChart () {
      let RodChart = echarts.init(this.$refs.SuccessYEcharts, "macarons");
      RodChart.setOption(this.SuccessRate, true);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },

    //业务负载数据

    serviceCpm () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      serviceCpmI(data).then((res) => {
        this.minuteLoading = false;
        this.ServiceLoad.series[0].data = res.data.values;
        this.ServiceLoad.xAxis.data = res.data.pointTime;
        let RodChart = echarts.init(this.$refs.loadEchart, "macarons");
        RodChart.setOption(this.ServiceLoad, true);
      });
    },

    //业务负载图表
    loadChart () {
      let RodChart = echarts.init(this.$refs.loadEchart, "macarons");
      RodChart.setOption(this.ServiceLoad, true);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },

    //百分比响应延时数据
    servicePercentile () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      servicePercentileI(data).then((res) => {
        this.PercentileLoading = false;

        this.Percentile.series[0].data = res.data[0];
        this.Percentile.series[1].data = res.data[1];
        this.Percentile.series[2].data = res.data[2];
        this.Percentile.series[3].data = res.data[3];
        this.Percentile.series[4].data = res.data[4];
        this.Percentile.xAxis.data = res.data.pointTime;
        let RodChart = echarts.init(this.$refs.PercentileEC, "macarons");
        RodChart.setOption(this.Percentile);
      });
    },

    //服务响应时间百分比图表
    PercentileEC () {
      let RodChart = echarts.init(this.$refs.PercentileEC, "macarons");
      RodChart.setOption(this.Percentile, true);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },

    // Apdex评分
    // serviceApdex () {
    //   let data = {
    //     serverName: this.currentServerC,
    //     startTime: this.timeHorizonC[0],
    //     endTime: this.timeHorizonC[1],
    //   };
    //   serviceApdexI(data).then((res) => {
    //     this.satisfactionLoading = false;
    //     this.satisfaction.series[0].data = res.data.values;
    //     this.satisfaction.xAxis[0].data = res.data.pointTime;
    //     let RodChart = echarts.init(this.$refs.satisfactionEC, "macarons");
    //     RodChart.setOption(this.satisfaction);
    //   });
    // },

    //服务满意值图表
    // satisfactionECh () {
    //   let RodChart = echarts.init(this.$refs.satisfactionEC, "macarons");
    //   RodChart.setOption(this.satisfaction, true);
    //   //图表自适应
    //   window.addEventListener("resize", function () {
    //     RodChart.resize(); // myChart 是实例对象
    //   });
    // },

    //平均响应延时(ms)数据
    servicRespTime () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      servicRespTimeI(data).then((res) => {
        this.fullscreenLoading = false;

        this.echartsOpt.series[0].data = res.data.values;
        this.echartsOpt.xAxis.data = res.data.pointTime;
        let RodChart = echarts.init(this.$refs.YEcharts, "macarons");
        RodChart.setOption(this.echartsOpt);
      });
    },

    //服务响应时间图表
    Ycharts () {
      let RodChart = echarts.init(this.$refs.YEcharts, "macarons");
      RodChart.setOption(this.echartsOpt, true);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },
  },

  mounted () {
    this.currViewC = this.currView;
    this.QueueChart();
    this.MessageChart();
    this.succChart();
    this.loadChart();
    this.PercentileEC();
    // this.satisfactionECh();
    this.Ycharts();
    this.loadAllData();
  },
};
</script>
<style scoped>
.serve-1 /deep/ .el-progress-bar__outer {
  height: 4px !important;
}

.text_28 {
  color: rgba(245, 34, 45, 1);
}

.text_26 {
  color: rgba(82, 196, 26, 1);
}

.text_24 {
  color: rgba(24, 144, 255, 1);
}

.text_23 {
  color: rgba(134, 144, 156, 0.65);
  width: 112px !important;
  margin-right: 10px;
}

.text-wrapper_7 {
  /* width: 112px; */
  height: 24px;
  font-size: 14px;
  padding-right: 10px;
}

.serve-1 {
  overflow: auto;
  height: 80%;
}

.CpmContent {
  text-align: center;
}

.single {
  text-align: right;
  position: absolute;
  font-size: 16px;
  width: 75%;
  top: 14px;
  right: 14px;
  /* 文本不换行 */
  white-space: nowrap;
  /* 超出隐藏 */
  overflow: hidden;
  /* 超出的文字省略号表示 */
  text-overflow: ellipsis;
}

.Num {
  /* display: flex;
  flex-wrap: wrap; */
  position: relative;
  padding: 5px 10px;
  width: 100%;
  /* height: calc(100% - 30px); */
}

.numerical {
  /* position: absolute; */
  font-size: 12px;
  padding: 0 5px;
  margin-top: 5px;
  display: inline-block;
  color: rgba(0, 0, 0, 0.65);

  background: #CDEDFF;
  border-radius: 2px;
  border: 1px solid #4D7FFC;
}

.bottomEch:focus {
  border: 1px solid #409eff;
}

.bottomEch {
  /* overflow: auto; */
  margin-top: 20px;
  /* transform: translate3d(10px, 110px, 0px); */
  width: 32%;
  height: 270px;
  margin-bottom: 10px;
  transform: translate3d(10px, 10px, 0px);
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
  background: #fff;
}

/* .tabBox /deep/ .el-table {
  border: 0px !important;
} */

.tabBox ::-webkit-scrollbar {
  width: 10px;
}

.tabBox ::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 5px;
}

.tabBox ::-webkit-scrollbar-track {
  background-color: #f2f2f2;
}

.bottomEch1:focus {
  border: 1px solid #409eff;
}

.bottomEch1 {
  /* transform: translate3d(10px, 110px, 0px); */
  width: 32%;
  height: 270px;
  transform: translate3d(10px, 10px, 0px);
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
  background: #fff;
}

.bottom {
  align-content: flex-start;
  flex-wrap: wrap;
  /* padding-right: 12px; */
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 10px;
}

.proCharts {
  width: 100%;
  height: 228px;
  background: #fff;
}

.footerEch:focus {
  border: 1px solid #409eff;

}

.footerEch {
  /* transform: translate3d(10px, 110px, 0px); */
  width: 32%;
  height: 280px;
  transform: translate3d(10px, 10px, 0px);
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
  background: #fff;
}




.footer {

  position: relative;
  /* padding-right: 12px; */
  display: flex;
  justify-content: space-evenly;
  /* margin-top: 10px; */
  width: 100%;
  /* height: 500px; */
  /* background-color: #efb; */
}

.Apdex-s {
  text-align: center;
  margin-top: 20px;
}

.Apdex {
  margin-bottom: 10px;
  padding-left: 5px;
  height: 30px;
  line-height: 30px;
  font-size: 12px;
  color: #2c3e50;
}

.headerDiv2 {
  /* margin-right: 10px; */
  transform: translate3d(10px, 10px, 0px);
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
  background: #fff;
  width: 32%;
  height: 80px;
}

.headerDiv1 {
  transform: translate3d(10px, 10px, 0px);
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
  background: #fff;
  width: 33%;
  height: 80px;
}

.headerDiv2:focus {
  border: 1px solid #409eff;
}

.headerDiv1:focus {
  border: 1px solid #409eff;
}

.headerDiv:focus {
  border: 1px solid #409eff;
}

.headerDiv {
  transform: translate3d(10px, 10px, 0px);
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
  background: #fff;
  width: 33%;
  height: 80px;
  /* background-color: rgb(228, 19, 19); */
}

.header {
  margin-bottom: 10px;
  padding-right: 12px;
  display: flex;
  justify-content: space-between;
  height: 100%;
}

.headers {
  display: flex;
  /* position: absolute;*/
  right: 30px;
  top: 107px;
  z-index: 9999;
  position: fixed !important;



}

.content {
  margin-top: 50px;
  padding-right: 10px;
  position: relative;
}

.txt_t {
  background-color: #19ecd0;
}


.el-table::before {
  height: 0px !important;
}
</style>
