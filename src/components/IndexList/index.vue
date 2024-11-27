<template>
  <div class="content1" :class="endpointList.length == 0 ? 'indTab1' : 'content1'" v-loading="fullscreenLoading">
    <div>
      <table class="indTab">
        <tr>
          <th>服务实例</th>
          <th>每分钟请求数</th>
          <th>请求成功率(%)</th>
          <th>响应时间(ms)</th>
          <th>性能指数</th>
        </tr>
        <tr v-for="(item, index) in endpointList" :key="index">
          <a class="Btn" @click="serveBtn(item.label, item.id, item.custom_value)">
            <td class="indTd">{{ item.label }}</td>
          </a>

          <td>
            <el-popover placement="bottom" width="330" trigger="click">
              <div :id="'display-wrappera' + index" ref="YEcharts" style="width: 300px; height: 300px"></div>
              <a slot="reference" @click="LoadEch(item.custom_value, 'display-wrappera' + index)" class="tltBtn">
                <i><svg t="1670811643321" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="810" width="20" height="15">
                    <path
                      d="M1023.704765 95.970676c0-52.983672-42.987004-95.970676-95.970676-95.970676s-95.969653 42.987004-95.969653 95.970676c0 31.928145 15.744573 60.012755 39.73801 77.41406L731.108046 640.240093c-12.747313 0.623193-24.743519 3.686969-35.677535 8.747213L376.592154 324.494164c4.686738-11.246124 7.310492-23.586161 7.310492-36.582137 0-52.982649-42.985981-95.970676-95.969653-95.970676-52.983672 0-95.970676 42.988027-95.970676 95.970676 0 31.021496 14.932069 58.293603 37.738472 75.821797L90.930375 832.24182c-50.609604 2.686176-90.909409 44.238506-90.909409 95.47028 0 52.983672 42.985981 95.971699 95.970676 95.971699 52.983672 0 95.969653-42.988027 95.969653-95.971699 0-31.926098-15.744573-59.917588-39.674565-77.412013l138.270019-466.667069c15.61973-0.468674 30.052426-4.750183 42.924582-11.715821l316.339446 321.99423c-6.248301 12.683868-9.996668 26.741011-9.996668 41.863415 0 52.980602 42.985981 95.968629 95.969653 95.968629 52.982649 0 95.969653-42.988027 95.969653-95.968629 0-31.805348-15.620754-59.671995-39.424879-77.16335l140.456822-467.168489C983.40496 188.755803 1023.704765 147.205519 1023.704765 95.970676"
                      fill="#409eff" p-id="811"></path>
                  </svg>
                </i>

                {{
                  (instancesData[item.value] &&
                    instancesData[item.value].service_cpm_number &&
                    instancesData[item.value].service_cpm_number.toFixed(2)) ||
                  0.0
                }}
              </a>
            </el-popover>
          </td>
          <td>
            <el-popover placement="bottom" width="330" trigger="click">
              <div :id="'display-wrapperb' + index" ref="successRateEchart" style="width: 300px; height: 300px"></div>
              <a slot="reference" @click="RateEch(item.custom_value, 'display-wrapperb' + index)" class="tltBtn">
                <i><svg t="1670811643321" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="810" width="20" height="15">
                    <path
                      d="M1023.704765 95.970676c0-52.983672-42.987004-95.970676-95.970676-95.970676s-95.969653 42.987004-95.969653 95.970676c0 31.928145 15.744573 60.012755 39.73801 77.41406L731.108046 640.240093c-12.747313 0.623193-24.743519 3.686969-35.677535 8.747213L376.592154 324.494164c4.686738-11.246124 7.310492-23.586161 7.310492-36.582137 0-52.982649-42.985981-95.970676-95.969653-95.970676-52.983672 0-95.970676 42.988027-95.970676 95.970676 0 31.021496 14.932069 58.293603 37.738472 75.821797L90.930375 832.24182c-50.609604 2.686176-90.909409 44.238506-90.909409 95.47028 0 52.983672 42.985981 95.971699 95.970676 95.971699 52.983672 0 95.969653-42.988027 95.969653-95.971699 0-31.926098-15.744573-59.917588-39.674565-77.412013l138.270019-466.667069c15.61973-0.468674 30.052426-4.750183 42.924582-11.715821l316.339446 321.99423c-6.248301 12.683868-9.996668 26.741011-9.996668 41.863415 0 52.980602 42.985981 95.968629 95.969653 95.968629 52.982649 0 95.969653-42.988027 95.969653-95.968629 0-31.805348-15.620754-59.671995-39.424879-77.16335l140.456822-467.168489C983.40496 188.755803 1023.704765 147.205519 1023.704765 95.970676"
                      fill="#409eff" p-id="811"></path>
                  </svg></i>

                {{
                  (instancesData[item.value] &&
                    instancesData[item.value].service_sla_number &&
                    (
                      instancesData[item.value].service_sla_number / 100.0
                    ).toFixed(2)) ||
                  0.0
                }}
              </a>
            </el-popover>
            <!-- <a @click="RateEch(item.label)" class="tltBtn">
              <i><svg t="1670811643321" class="icon" viewBox="0 0 1024 1024" version="1.1"
                  xmlns="http://www.w3.org/2000/svg" p-id="810" width="20" height="15">
                  <path
                    d="M1023.704765 95.970676c0-52.983672-42.987004-95.970676-95.970676-95.970676s-95.969653 42.987004-95.969653 95.970676c0 31.928145 15.744573 60.012755 39.73801 77.41406L731.108046 640.240093c-12.747313 0.623193-24.743519 3.686969-35.677535 8.747213L376.592154 324.494164c4.686738-11.246124 7.310492-23.586161 7.310492-36.582137 0-52.982649-42.985981-95.970676-95.969653-95.970676-52.983672 0-95.970676 42.988027-95.970676 95.970676 0 31.021496 14.932069 58.293603 37.738472 75.821797L90.930375 832.24182c-50.609604 2.686176-90.909409 44.238506-90.909409 95.47028 0 52.983672 42.985981 95.971699 95.970676 95.971699 52.983672 0 95.969653-42.988027 95.969653-95.971699 0-31.926098-15.744573-59.917588-39.674565-77.412013l138.270019-466.667069c15.61973-0.468674 30.052426-4.750183 42.924582-11.715821l316.339446 321.99423c-6.248301 12.683868-9.996668 26.741011-9.996668 41.863415 0 52.980602 42.985981 95.968629 95.969653 95.968629 52.982649 0 95.969653-42.988027 95.969653-95.968629 0-31.805348-15.620754-59.671995-39.424879-77.16335l140.456822-467.168489C983.40496 188.755803 1023.704765 147.205519 1023.704765 95.970676"
                    fill="#409eff" p-id="811"></path>
                </svg></i>

              {{
                (instancesData[item.value] &&
                  instancesData[item.value].service_sla_number &&
                  (
                    instancesData[item.value].service_sla_number / 100.0
                  ).toFixed(2)) ||
                0.0
              }}
            </a> -->
          </td>
          <td>
            <el-popover placement="bottom" width="330" trigger="click">
              <div :id="'display-wrapperc' + index" ref="LatencyEch" style="width: 300px; height: 300px"></div>
              <a slot="reference" @click="Latency(item.custom_value, 'display-wrapperc' + index)" class="tltBtn">
                <i><svg t="1670811643321" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="810" width="20" height="15">
                    <path
                      d="M1023.704765 95.970676c0-52.983672-42.987004-95.970676-95.970676-95.970676s-95.969653 42.987004-95.969653 95.970676c0 31.928145 15.744573 60.012755 39.73801 77.41406L731.108046 640.240093c-12.747313 0.623193-24.743519 3.686969-35.677535 8.747213L376.592154 324.494164c4.686738-11.246124 7.310492-23.586161 7.310492-36.582137 0-52.982649-42.985981-95.970676-95.969653-95.970676-52.983672 0-95.970676 42.988027-95.970676 95.970676 0 31.021496 14.932069 58.293603 37.738472 75.821797L90.930375 832.24182c-50.609604 2.686176-90.909409 44.238506-90.909409 95.47028 0 52.983672 42.985981 95.971699 95.970676 95.971699 52.983672 0 95.969653-42.988027 95.969653-95.971699 0-31.926098-15.744573-59.917588-39.674565-77.412013l138.270019-466.667069c15.61973-0.468674 30.052426-4.750183 42.924582-11.715821l316.339446 321.99423c-6.248301 12.683868-9.996668 26.741011-9.996668 41.863415 0 52.980602 42.985981 95.968629 95.969653 95.968629 52.982649 0 95.969653-42.988027 95.969653-95.968629 0-31.805348-15.620754-59.671995-39.424879-77.16335l140.456822-467.168489C983.40496 188.755803 1023.704765 147.205519 1023.704765 95.970676"
                      fill="#409eff" p-id="811"></path>
                  </svg></i>

                {{
                  (instancesData[item.value] &&
                    instancesData[item.value].service_resp_time_number &&
                    instancesData[item.value].service_resp_time_number.toFixed(
                      2
                    )) ||
                  0.0
                }}</a>
            </el-popover>
          </td>
          <td>
            <el-popover placement="bottom" width="330" trigger="click">
              <div :id="'display-wrapperd' + index" ref="apdexEch" style="width: 300px; height: 300px"></div>
              <a slot="reference" @click="apdexBtn(item.custom_value, 'display-wrapperd' + index)" class="tltBtn">
                <i><svg t="1670811643321" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="810" width="20" height="15">
                    <path
                      d="M1023.704765 95.970676c0-52.983672-42.987004-95.970676-95.970676-95.970676s-95.969653 42.987004-95.969653 95.970676c0 31.928145 15.744573 60.012755 39.73801 77.41406L731.108046 640.240093c-12.747313 0.623193-24.743519 3.686969-35.677535 8.747213L376.592154 324.494164c4.686738-11.246124 7.310492-23.586161 7.310492-36.582137 0-52.982649-42.985981-95.970676-95.969653-95.970676-52.983672 0-95.970676 42.988027-95.970676 95.970676 0 31.021496 14.932069 58.293603 37.738472 75.821797L90.930375 832.24182c-50.609604 2.686176-90.909409 44.238506-90.909409 95.47028 0 52.983672 42.985981 95.971699 95.970676 95.971699 52.983672 0 95.969653-42.988027 95.969653-95.971699 0-31.926098-15.744573-59.917588-39.674565-77.412013l138.270019-466.667069c15.61973-0.468674 30.052426-4.750183 42.924582-11.715821l316.339446 321.99423c-6.248301 12.683868-9.996668 26.741011-9.996668 41.863415 0 52.980602 42.985981 95.968629 95.969653 95.968629 52.982649 0 95.969653-42.988027 95.969653-95.968629 0-31.805348-15.620754-59.671995-39.424879-77.16335l140.456822-467.168489C983.40496 188.755803 1023.704765 147.205519 1023.704765 95.970676"
                      fill="#409eff" p-id="811"></path>
                  </svg></i>

                {{
                  (instancesData[item.value] &&
                    instancesData[item.value].service_apdex_number &&
                    (
                      instancesData[item.value].service_apdex_number / 10000.0
                    ).toFixed(2)) ||
                  0.0
                }}
              </a>
            </el-popover>
          </td>
        </tr>

      </table>

    </div>
  </div>
</template>

<script>
import * as echarts from "echarts"
import { serverListI, serverListEchI } from "@/api/system/monitor";

export default {
  name: "my-indexlist",
  //import引入的组件需要注入到对象中才能使用

  data () {
    return {
      queryData: [],
      serveNum: "",
      fullscreenLoading: false,
      instancesData: {},
      instancesStr: "",
      apdexVisible: false,
      LatencyVisible: false,
      successRateVisible: false,
      name: "indexList",
      currViewC: "",
      serverId: "",
      centerDialogVisible: false,

      //每分钟请求数图表
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
          data: ['1', '2', '3', '1', '2', '3', '1', '2', '3',],
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            formatter: function (value) {
              if (value.length > 7) {
                value = value.substr(0, 7) + '...';
              }
              return value;
            },
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
            data: [3, 6, 3, 6, 3, 6, 3, 6, 5, 5, 5],
            type: "line",
          },
        ],
      },
      tableData: [],
      endpointList: [],
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {
    currView: {
      handler (newVal, oldVal) {
        // this.currViewC = newVal;
        // if (this.name == this.currViewC) {
        //   this.loadAllData();
        // }
      },
    },
  },
  mounted () {
    // this.currViewC = this.currView;
    // this.serverId = this.currentServerIdC;
    this.loadAllData();
  },
  //方法集合
  methods: {
    loadAllData () {
      this.fullscreenLoading = true;
      this.serverList();


    },
    serveBtn (i, id, agentServerId) {
      this.$router.push({
        path: "/systemInfo/monitor",
        query: { name: i, id: id, agentServerId: agentServerId },
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

    apdexBtn (i, domName) {
      i = i.replaceAll(".", "");
      let ApdexEchOpt = {
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
            formatter: function (value) {
              if (value.length > 7) {
                value = value.substr(0, 7) + '...';
              }
              return value;
            },
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
      }
      ApdexEchOpt.series[0].data = this.instancesData[i]["service_apdex"];
      ApdexEchOpt.xAxis.data = this.instancesData.pointTime;
      this.apdexOpens(ApdexEchOpt, domName);
    },
    apdexEch (ApdexEchOpt, domName) {
      let RodChart = echarts.init(document.getElementById(domName));
      RodChart.setOption(ApdexEchOpt);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },
    apdexOpens (ApdexEchOpt, domName) {
      this.apdexVisible = true;
      this.$nextTick(() => {
        this.apdexEch(ApdexEchOpt, domName);
      });
    },

    // 响应时间
    Latency (i, domName) {
      i = i.replaceAll(".", "");
      let LatencyEchOpt = {
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
            formatter: function (value) {
              if (value.length > 7) {
                value = value.substr(0, 7) + '...';
              }
              return value;
            },
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
      }

      LatencyEchOpt.series[0].data = this.instancesData[i]["service_resp_time"];
      LatencyEchOpt.xAxis.data = this.instancesData.pointTime;
      this.LatencyOpens(LatencyEchOpt, domName);
    },

    LatencyEch (LatencyEchOpt, domName) {
      let RodChart = echarts.init(document.getElementById(domName));
      RodChart.setOption(LatencyEchOpt);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(LatencyEchOpt); // myChart 是实例对象
      });
    },
    LatencyOpens (LatencyEchOpt, domName) {
      this.LatencyVisible = true;
      this.$nextTick(() => {
        this.LatencyEch(LatencyEchOpt, domName);
      });
    },

    //成功率折线图
    RateEch (i, domName) {
      i = i.replaceAll(".", "");
      let successRateEchOpt = {
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
            formatter: function (value) {
              if (value.length > 7) {
                value = value.substr(0, 7) + '...';
              }
              return value;
            },
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
      }
      successRateEchOpt.series[0].data = this.instancesData[i]["service_sla"];
      successRateEchOpt.xAxis.data = this.instancesData.pointTime;
      this.successRateopens(successRateEchOpt, domName);
    },

    successRateEch (successRateEchOpt, domName) {
      let RodChart = echarts.init(document.getElementById(domName));
      RodChart.setOption(successRateEchOpt);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },
    successRateopens (successRateEchOpt, domName) {
      this.successRateVisible = true;
      this.$nextTick(() => {
        this.successRateEch(successRateEchOpt, domName);
      });
    },

    //加载折线图按钮
    LoadEch (i, domName) {
      i = i.replaceAll(".", "");
      let echartsOpt = {
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
          data: ['1', '2', '3', '1', '2', '3', '1', '2', '3',],
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            formatter: function (value) {
              if (value.length > 7) {
                value = value.substr(0, 7) + '...';
              }
              return value;
            },
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
            data: [3, 6, 3, 6, 3, 6, 3, 6, 5, 5, 5],
            type: "line",
          },
        ],
      }
      echartsOpt.series[0].data = this.instancesData[i]["service_cpm"];
      // echartsOpt.series[0].data = tmpData;
      echartsOpt.xAxis.data = this.instancesData.pointTime;
      this.opens(echartsOpt, domName);
    },

    opens (echartsOpt, domName) {
      this.centerDialogVisible = true;
      this.$nextTick(() => {
        this.Ycharts(echartsOpt, domName);
      });
    },

    Ycharts (echartsOpt, domName) {
      // echarts.init(document.getElementById('display-wrapper')).dispose();
      let RodChart = echarts.init(document.getElementById(domName));
      RodChart.setOption(echartsOpt);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },

    // 实例列表
    serverList () {
      serverListI().then((res) => {
        this.endpointList = res.data;
        for (let i = 0; i < this.endpointList.length; i++) {
          this.instancesStr += this.endpointList[i].custom_value + ",";
        }
        let data = {
          serverName: this.instancesStr,
          startTime: parseInt(new Date().getTime() / 1000 - 1800),
          endTime: parseInt(new Date().getTime() / 1000),
        };
        serverListEchI(data).then((res) => {
          this.instancesData = res.data;
          for (let i in this.instancesData) {
            if (i !== "pointTime") {
              this.instancesData[i]["service_sla_number"] = this.avgFun(
                this.instancesData[i].service_sla
              );
              this.instancesData[i]["service_apdex_number"] = this.avgFun(
                this.instancesData[i].service_apdex
              );
              this.instancesData[i]["service_cpm_number"] = this.avgFun(
                this.instancesData[i].service_cpm
              );
              this.instancesData[i]["service_resp_time_number"] = this.avgFun(
                this.instancesData[i].service_resp_time
              );
            }
          }
        });
        this.fullscreenLoading = false;

      });
    },
  },
};
</script>
<style scoped>
.Btn {
  border: 0;
  background-color: #fff;
}

.tltBtn {
  border: 0px;
  background-color: #fff;
}

.indTd {
  color: #409eff;
  border: 0;
}

.indTab {
  width: 100%;
  /* box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); */
  border-collapse: collapse;
  /* 取消表格边框 */
  letter-spacing: 1px;
  /* 文字缩进 */
}

table,
th,
tr,
td {
  border: 0.1px solid #dfe6ec;
  border-right: 0;
  border-left: 0;
  border-top: 0;
  /* 表格横线 */
  padding: 13px;
  text-align: center;
}


.endpointCla {
  width: 100%;
  height: 100%;
  text-align: center;
}

.content1 {
  margin-left: 8px;
  margin-right: 10px;
  margin-top: 10px;
  margin-bottom: 13px;
  transform: translate3d(10px, 10px, 0px);
  width: 99%;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  border: 1px solid #e6ebf5;
  border-radius: 3px;
  text-align: center;
}

.indTab1 {
  display: none;
  visibility: hidden;
  margin-top: 120px;
}

/* @import url(); 引入公共css类 */
</style>
