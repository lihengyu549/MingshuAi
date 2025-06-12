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
        <div style="padding: 35px 15px;background-color: #fff; border-radius: 8px;">
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
        <div style="padding:40px; background-color: #fff;margin-top: 20px;position: relative; border-radius: 8px;">
          <div class="data-stats-container">
            <div class="data-stat-item">
              <img src="../assets/newDataImg/shujuzongliang-2.png" alt="">
              <div>
                <div class="stat-label">数据总量</div>
                <div class="stat-value">100MB</div>
              </div>
            </div>
            <div class="data-stat-item">
              <div>
                <div class="stat-label">个人信息条数</div>
                <div class="stat-value">5000</div>
              </div>
              <img src="../assets/newDataImg/gerenxinxi.png" alt="">
            </div>
            <div class="data-stat-item">
              <img src="../assets/newDataImg/shujuyuan.png" alt="">
              <div>
                <div class="stat-label">数据源数量</div>
                <div class="stat-value">100</div>
              </div>
            </div>
            <div class="data-stat-item">
              <div>
                <div class="stat-label">未成年信息条数</div>
                <div class="stat-value">4500</div>
              </div>
              <img src="../assets/newDataImg/shilingertong.png" alt="">
            </div>
            <div class="data-stat-item">
              <img src="../assets/newDataImg/teshukunjingertong.png" alt="">
              <div>
                <div class="stat-label">一般个人信息字段数</div>
                <div class="stat-value">300</div>
              </div>
            </div>
            <div class="data-stat-item">
              <div>
                <div class="stat-label">数据表数量</div>
                <div class="stat-value">1000</div>
              </div>
              <img src="../assets/newDataImg/shujubiao-2.png" alt="">
            </div>

            <div class="data-stat-item">
              <img src="../assets/newDataImg/ertongsiwangrenshu.png" alt="">
              <div>
                <div class="stat-label">敏感个人信息字段数</div>
                <div class="stat-value">200</div>
              </div>
            </div>

            <div class="data-stat-item">
              <div>
                <div class="stat-label">数据库数量</div>
                <div class="stat-value">222</div>
              </div>
              <img src="../assets/newDataImg/shujuzongliang.png" alt="">
            </div>
          </div>
          <div class="centerCircle">
            <div>累计分析字段数量</div> <span>12030218531</span>
          </div>
        </div>
        <div style="padding:20px; background-color: #fff;margin-top: 20px;position: relative; border-radius: 8px;">
          <div style="margin-bottom: 15px;">分类分级任务</div>
          <el-table :data="tracesList" height="200">
            <el-table-column prop="apiStartTime" label="任务名称"></el-table-column>
            <el-table-column prop="apiPath" label="来源业务系统"></el-table-column>
            <el-table-column prop="httpMethod" label="分类分级标准"></el-table-column>
            <el-table-column prop="apiDuration" label="任务字段数量" />
            <el-table-column prop="" label="执行状态">
              <template slot-scope="scope">
                <a style="color: #409eff;" @click="TracesClk(scope.row)">详情</a>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="main_box">
        <div id="sensitiveData" class="leftEchartsBox"></div>
        <div id="dataDistribution" class="leftEchartsBox"></div>
        <div id="dataClassification" class="leftEchartsBox"></div>
      </div>
    </div>
  </div>
</template>
<script>
import { parseTime } from "@/utils/ruoyi";
import {
  getDataBigScreen
} from "../api/data";
import * as echarts from "echarts";
import "echarts-wordcloud";
import "../assets/styles/bootstrap.css";
import DataPupop from "./dataPupop";
import { get } from "sortablejs";
export default {
  components: {
    DataPupop
  },
  data() {
    return {
      tracesList: [],
      dataGrowthTrend: [],// 数据增长趋势
      cleanDataNum: [],// 脏数据清洗
      classifyReasonNum: [],// 归类原因
      fieldRemarkCoverage: [],// 字段注释覆盖情况
      cumulativeFieldNum: [],// 累计字段数量
      classifyTaskNum: [],// 分类分级任务
      sensitiveDataProportion: [],// 敏感数据占比
      dataClassificationDistribution: [],// 数据分级分布
      allData:{},
    };
  },
  created() {
    this.getDataFn()
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
    getDataFn() {
      getDataBigScreen().then(res => {
        this.allData = res.data
      })
    },
    dataGrowthTrendFn(data) {

    },
    goHome() {
      this.$router.push({ path: "/index" });
    },
    initEcharts() {
      this.dataAddEchartsFn()
      this.funnelEchartsFn()
      this.radarEchartsFn()
      this.sensitiveDataEchartsFn()
      this.dataDistributionEchartsFn()
      this.dataClassificationEchartsFn()
    },
    dataAddEchartsFn() {
      var chartDom = document.getElementById('lineGraph');
      var myChart = echarts.init(chartDom);
      var option;

      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        legend: {
          bottom: '5%',
          data: ['新增字段数', '数据总量（MB）']
        },
        xAxis: [
          {
            type: 'category',
            data:allData.dataGrowthTrend.monthNames,
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            min: 0,
            interval: 10
          },
          {
            type: 'value',
            min: 0,
            interval: 30
          }
        ],
        series: [
          {
            name: '新增字段数',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value) {
                return value;
              }
            },
            data: allData.dataGrowthTrend.dataNum
          },
          {
            name: '数据总量（MB）',
            type: 'line',
            yAxisIndex: 1,
            tooltip: {
              valueFormatter: function (value) {
                return value;
              }
            },
            data: allData.dataGrowthTrend.dataSize
          }
        ]
      };

      option && myChart.setOption(option);
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
          textStyle: {
            fontSize: '14'
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
            width: '100%',
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
    dataDistributionEchartsFn() {
      var chartDom = document.getElementById('dataDistribution');
      var myChart = echarts.init(chartDom);
      var option;

      option = {
        legend: {
          top: 'bottom'
        },
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        series: [
          {
            name: 'Nightingale Chart',
            type: 'pie',
            radius: [10, 50],
            center: ['50%', '50%'],
            roseType: 'area',
            itemStyle: {
              borderRadius: 8
            },
            data: [
              { value: 40, name: 'rose 1' },
              { value: 38, name: 'rose 2' },
              { value: 32, name: 'rose 3' },
              { value: 30, name: 'rose 4' },
              { value: 30, name: 'rose 4' },
            ]
          }
        ]
      };

      option && myChart.setOption(option);
    },
    dataClassificationEchartsFn() {
      var chartDom = document.getElementById('dataClassification');
      var myChart = echarts.init(chartDom);
      var option;

      const data = [];
      for (let i = 0; i < 5; ++i) {
        data.push(Math.round(Math.random() * 200));
      }
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          max: 'dataMax'
        },
        yAxis: {
          type: 'category',
          data: ['A', 'B', 'C'],
          inverse: true,
          max: 2 // only the largest 3 bars will be displayed
        },
        series: [
          {
            realtimeSort: true,
            type: 'bar',
            data: ['10', '12', '22'],
          }
        ],
        legend: {
          show: true
        }
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
      width: 100%;
      height: 250px;
      background-color: #fff;
      margin-bottom: 15px;
      border-radius: 8px;
    }
  }

  .main_boxFlex {
    width: 45%;
  }
}

.fieldConditions {
  display: flex;
  font-size: 20px;
  font-weight: 600;

  .titleBox {
    width: 50%;
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
  // display: flex;
  // justify-content: space-evenly;
  // align-items: center;
  // flex-wrap: wrap;
}

.data-stat-item {
  // padding: 16px;
  border-radius: 4px;
  background-color: #def3fd;
  display: flex;
  align-items: center;
  border-radius: 8px;
  padding: 10px;
  width: 100%;

  img {
    width: 45px;
    height: 45px;
    display: block;
  }
}

.data-stat-item:nth-child(odd) {
  justify-content: flex-start;
  text-align: left;
  margin-left: auto;

  img {
    margin-right: 15px;
  }
}

.data-stat-item:nth-child(even) {
  justify-content: flex-end;
  text-align: right;

  img {
    margin-left: 15px;
  }
}

.data-stat-item:nth-child(1) {
  width: 90%;
}

.data-stat-item:nth-child(2) {
  width: 90%;
}

.data-stat-item:nth-child(7) {
  width: 90%;
}

.data-stat-item:nth-child(8) {
  width: 90%;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.centerCircle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 330px;
  height: 330px;
  border-radius: 50%;
  font-size: 24px;
  text-align: center;
  line-height: 200px;
  font-weight: 700;
  background: linear-gradient(to bottom, #e1f1f8, #ffffff, #e1f1f8);
  border: 30px solid #fff;

  div {
    height: 50px;
  }
}
</style>