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
      <div style="padding-right: 30px;">
        <div style="font-weight: 700;font-size: 22px;">22:33:33</div>
        <div>2025-06-06</div>
      </div>
    </div>
    <div class="body_main">
      <div class="main_box">
        <div id="lineGraph" class="leftEchartsBox"></div>
        <div id="funnelEcharts" class="leftEchartsBox"></div>
        <div id="radarEcharts" class="leftEchartsBox"></div>
      </div>
      <div class="main_boxFlex">
        <div style="padding: 40px 15px;background-color: #fff;">
          <div class="fieldConditions">
            <div></div>
            <div class="titleBox">字段注释覆盖情况</div>
            <div></div>
            <div style="display: flex;">
              <div class="titleOneText">原生注释占比:32%</div>
              <div class="titleTwoText">AI数据填充数量:32</div>
            </div>
          </div>
        </div>
        <div style="padding: 20px; background-color: #fff;margin-top: 20px;">
          <div class="data-stats-container">
            <div class="data-stat-item" v-for="item in stats" :key="item.label">
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
        <div></div>
      </div>
      <div class="main_box">
        <div id="sensitiveData" class="leftEchartsBox"></div>
        <div id="funnelEcharts" class="leftEchartsBox"></div>
        <div id="radarEchartsFn" class="leftEchartsBox"></div>
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
export default {
  components: {
    DataPupop
  },
  data() {
    return {
      stats: [
        { label: '数据总量', value: '100MB' },
        { label: '个人信息条数', value: '5000' },
        { label: '数据源数量', value: '100' },
        { label: '累计分析字段数量', value: '87,654,321' },
        { label: '未成年信息条数', value: '4500' },
        { label: '一般个人信息字段数', value: '300' },
        { label: '数据表数量', value: '1000' },
        { label: '敏感个人信息字段数', value: '200' }
      ]
    };
  },
  created() {
  },
  mounted() {
    this.initEcharts()
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
    initEcharts() {
      this.dataAddEchartsFn()
      this.funnelEchartsFn()
      this.radarEchartsFn()
      this.sensitiveDataEchartsFn()
    },
    dataAddEchartsFn() {
      var lineGraphDom = document.getElementById('lineGraph');
      var lineGraphChart = echarts.init(lineGraphDom);
      var lineGraphOption;
      const categories = (function () {
        return [1, 2, 3, 4, 5, 6];
      })();
      const categories2 = (function () {
        return [1, 2, 3, 4, 5, 6];
      })();
      const data = (function () {
        return [1, 3, 4, 5, 6];
      })();
      const data2 = (function () {
        return [1, 2];
      })();
      lineGraphOption = {
        title: {
          text: '数据增长趋势（最近6个月）'
        },
        legend: {
          bottom: '4%'
        },
        tooltip: {
          trigger: 'axissss',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#283b56'
            }
          }
        },
        toolbox: {
          show: false,
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {}
          }
        },
        dataZoom: {
          show: false,
          start: 0,
          end: 100
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: true,
            data: categories
          },
          {
            type: 'category',
            boundaryGap: true,
            data: categories2
          }
        ],
        yAxis: [
          {
            type: 'value',
            scale: true,
            name: '',
            max: 30,
            min: 0,
            boundaryGap: [0.2, 0.2]
          },
          {
            type: 'value',
            scale: true,
            name: '',
            max: 1200,
            min: 0,
            boundaryGap: [0.2, 0.2]
          }
        ],
        series: [
          {
            name: '新增字段数',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: data
          },
          {
            name: '数据总量（MB）',
            type: 'line',
            data: data2
          }
        ]
      };
      lineGraphOption && lineGraphChart.setOption(lineGraphOption);
    },
    funnelEchartsFn() {
      var chartDom = document.getElementById('funnelEcharts');
      var myChart = echarts.init(chartDom);
      var option;
      option = {
        title: {
          text: '脏数据清洗'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c}%'
        },
        toolbox: {
          show: false,
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {}
          }
        },
        series: [
          {
            name: 'Funnel',
            type: 'funnel',
            left: '5%',
            top: 60,
            bottom: 60,
            width: '80%',
            min: 0,
            max: 100,
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
              position: 'right'
            },
            labelLine: {
              length: 20,
              lineStyle: {
                width: 1,
                type: 'solid'
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 20
            },
            emphasis: {
              label: {
                fontSize: 26
              }
            },
            data: [
              { value: 60, name: 'Visit' },
              { value: 40, name: 'Inquiry' },
              { value: 20, name: 'Order' },
              { value: 80, name: 'Click' },
              { value: 100, name: 'Show' }
            ]
          }
        ]
      };
      option && myChart.setOption(option);
    },
    radarEchartsFn() {
      var chartDom = document.getElementById('radarEcharts');
      var myChart = echarts.init(chartDom);
      var option;

      option = {
        title: {
          text: '归类原因'
        },
        legend: {
          data: ['Allocated Budget', 'Actual Spending']
        },
        toolbox: {
          show: false,
        },
        radar: {
          // shape: 'circle',
          indicator: [
            { name: 'Sales', max: 6500 },
            { name: 'Administration', max: 16000 },
            { name: 'Information Technology', max: 30000 },
            { name: 'Customer Support', max: 38000 },
          ]
        },
        series: [
          {
            name: 'Budget vs spending',
            type: 'radar',
            data: [
              {
                value: [4200, 3000, 20000, 35000, 50000, 18000],
              }
            ]
          }
        ]
      };

      option && myChart.setOption(option);

    },
    sensitiveDataEchartsFn() {
      var chartDom = document.getElementById('sensitiveData');
      var myChart = echarts.init(chartDom);
      var option;

      option = {
        title: {
           text: '敏感数据占比',
           textStyle:{
            fontSize:'14'
           }
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          bottom: 'bottom'
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['50%', '70%'],
            width:'100%',
            data: [
              { value: 1048, name: '敏感数据' },
              { value: 735, name: '非敏感数据' }
            ],
            label: {
              alignTo: 'edge',
              minMargin: 5,
              edgeDistance: 10,
              lineHeight: 15,
              rich: {
                time: {
                  fontSize: 10,
                  color: '#999'
                }
              }
            }
          }
        ]
      };

      option && myChart.setOption(option);
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

  .head_left {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  img {
    width: 50px;
    height: 50px;
  }
}

.body_main {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 10px;

  .main_box {
    width: 20%;

    .leftEchartsBox {
      width: 90%;
      height: 250px;
      background-color: #fff;
      margin-bottom: 15px;
    }
  }

  .main_boxFlex {
    width: 40%;
  }
}

.fieldConditions {
  display: flex;
  font-size: 20px;
  font-weight: 600;

  .titleBox {
    width: 55%;
  }

  .titleOneText {
    border-right: 5px solid #01a7f0;
    border-left: 5px solid #01a7f0;

  }

  .titleOneText,
  .titleTwoText {
    padding: 0 15px;
    color: #01a7f0;
  }

  .titleTwoText {
    border-right: 5px solid #01a7f0;
  }
}

.data-stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.data-stat-item {
  background-color: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}
</style>