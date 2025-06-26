<template>
  <div id="body-content" v-loading="isShow">
    <div class="body_head">
      <div class="head_left">
        <div style="margin-right: 20px;">
          <img :src="$store.state.user.projectData.img" alt="">
        </div>
        <div class="head_right">
          <div style="font-weight: 700;font-size: 20px;margin-bottom: 10px;">数据安全分类分级看板</div>
          <div>Data Security Classification and Grading Dashboard</div>
        </div>
      </div>
      <div style="display: flex;align-items: center;">
        <div><el-button type="primary" @click="goHome">首页</el-button></div>
        <div style="padding-right: 30px; margin-left: 30px;">
          <div style="font-weight: 700;font-size: 22px;">{{ formattedTime }} </div>
          <div>{{ currentDate }}</div>
        </div>
      </div>
    </div>
    <div class="body_main">
      <div class="main_box">
        <div class="main_body">
          <div class="titleBox_echarts">
            <div class="title">数据增长趋势（最近6个月）</div>
          </div>
          <div id="lineGraph" class="leftEchartsBox"></div>
        </div>

        <div class="main_body">
          <div class="titleBox_echarts">
            <div class="title">脏数据清洗</div>
          </div>
          <div id="funnelEcharts" class="leftEchartsBox"></div>
        </div>

        <div class="main_body">
          <div class="titleBox_echarts">
            <div class="title">归类原因</div>
          </div>
          <div id="radarEcharts" class="leftEchartsBox"></div>
        </div>
      </div>
      <div class="main_boxFlex">
        <div style="padding: 35px 15px;background-color: #fff; border-radius: 8px;">
          <div class="fieldConditions">
            <div></div>
            <div class="titleBox">字段注释覆盖情况</div>
            <div></div>
            <div style="display: flex;">
              <div class="titleOneText">{{ allData.fieldRemarkCoverage &&
                allData.fieldRemarkCoverage.oldAnnotationProportion ?
                allData.fieldRemarkCoverage.oldAnnotationProportion :0 }}
              </div>
              <div class="titleTwoText">
                {{ allData.fieldRemarkCoverage && allData.fieldRemarkCoverage.AIAnnotationNum ?
                  allData.fieldRemarkCoverage.AIAnnotationNum : 0 }}
              </div>
            </div>
          </div>
        </div>
        <div style="padding:40px; background-color: #fff;margin-top: 20px;position: relative; border-radius: 8px;">
          <!-- // 后期可优化为数组方式，图标上下各加一个标签，通过下标取余展示其一 -->
          <div class="data-stats-container">
            <div class="data-stat-item">
              <img src="../assets/newDataImg/shujuzongliang-2.png" alt="">
              <div class="data-stat-item_box">
                <div class="stat-label">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.aname ?
                  allData.cumulativeFieldNum.aname : 0 }}</div>
                <div class="stat-value">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.avalue ?
                  allData.cumulativeFieldNum.avalue : 0 }}</div>
              </div>
            </div>
            <div class="data-stat-item">
              <div class="data-stat-item_box">
                <div class="stat-label">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.bname ?
                  allData.cumulativeFieldNum.bname : 0 }}</div>
                <div class="stat-value">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.bvalue ?
                  allData.cumulativeFieldNum.bvalue : 0 }}</div>
              </div>
              <img src="../assets/newDataImg/gerenxinxi.png" alt="">
            </div>
            <div class="data-stat-item">
              <img src="../assets/newDataImg/shujuyuan.png" alt="">
              <div class="data-stat-item_box">
                <div class="stat-label">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.cname ?
                  allData.cumulativeFieldNum.cname : 0 }}</div>
                <div class="stat-value">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.cvalue ?
                  allData.cumulativeFieldNum.cvalue : 0 }}</div>
              </div>
            </div>
            <div class="data-stat-item">
              <div class="data-stat-item_box">
                <div class="stat-label">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.dname ?
                  allData.cumulativeFieldNum.dname : 0 }}</div>
                <div class="stat-value">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.dvalue ?
                  allData.cumulativeFieldNum.dvalue : 0 }}</div>
              </div>
              <img src="../assets/newDataImg/shilingertong.png" alt="">
            </div>
            <div class="data-stat-item">
              <img src="../assets/newDataImg/shujuzongliang.png" alt="">
              <div class="data-stat-item_box">
                <div class="stat-label">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.ename ?
                  allData.cumulativeFieldNum.ename : 0 }}</div>
                <div class="stat-value">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.evalue ?
                  allData.cumulativeFieldNum.evalue : 0 }}</div>
              </div>
            </div>
            <div class="data-stat-item">
              <div class="data-stat-item_box">
                <div class="stat-label">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.fname ?
                  allData.cumulativeFieldNum.fname : 0 }}</div>
                <div class="stat-value">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.fvalue ?
                  allData.cumulativeFieldNum.fvalue : 0 }}</div>
              </div>
              <img src="../assets/newDataImg/teshukunjingertong.png" alt="">
            </div>
            <div class="data-stat-item">
              <img src="../assets/newDataImg/shujubiao-2.png" alt="">
              <div class="data-stat-item_box">
                <div class="stat-label">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.gname ?
                  allData.cumulativeFieldNum.gname : 0 }}</div>
                <div class="stat-value">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.gvalue ?
                  allData.cumulativeFieldNum.gvalue : 0 }}</div>
              </div>
            </div>
            <div class="data-stat-item">
              <div class="data-stat-item_box">
                <div class="stat-label">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.hname ?
                  allData.cumulativeFieldNum.hname : 0 }}</div>
                <div class="stat-value">{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.hvalue ?
                  allData.cumulativeFieldNum.hvalue : 0 }}</div>
              </div>
              <img src="../assets/newDataImg/ertongsiwangrenshu.png" alt="">
            </div>
          </div>
          <div class="centerCircle">
            <div>{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.iname ? allData.cumulativeFieldNum.iname :
              0
            }}</div>
            <span>{{ allData.cumulativeFieldNum && allData.cumulativeFieldNum.ivalue ?
              allData.cumulativeFieldNum.ivalue : 0 }}</span>
          </div>
        </div>
        <div style="padding:20px; background-color: #fff;margin-top: 20px;position: relative; border-radius: 8px;">
          <div class="title" style="margin-bottom: 15px; ">分类分级任务</div>
          <el-table :data="allData.classifyTaskNum" height="175" ref="tableRef">
            <el-table-column align="center" show-overflow-tooltip prop="tasksName" label="任务名称"></el-table-column>
            <el-table-column align="center" show-overflow-tooltip prop="sourceName" label="来源业务系统"></el-table-column>
            <el-table-column align="center" show-overflow-tooltip prop="projectName" label="分类分级标准"></el-table-column>
            <el-table-column align="center" show-overflow-tooltip prop="fieldCount" label="任务字段数量" />
            <el-table-column align="center" show-overflow-tooltip prop="maskComplete" label="执行状态">
              <template slot-scope="scope">
                <el-tag :color="scope.row.tagColor" style="color: #fff;border: none;">{{ scope.row.maskCompleteName
                }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="main_box">
        <div class="main_body">
          <div class="titleBox_echarts">
            <div class="title">敏感数据占比</div>
          </div>
          <div id="sensitiveData" class="leftEchartsBox"></div>
        </div>
        <div class="main_body">
          <div class="titleBox_echarts">
            <div class="title">数据分级分布</div>
          </div>
          <div id="dataDistribution" class="leftEchartsBox"></div>

        </div>
        <div class="main_body">
          <div class="titleBox_echarts">
            <div class="title">数据分类分布</div>
            <el-select clearable v-model="categoryId" @change="selectChange">
              <el-option v-for="(item, index) of selectList" :key="item.id" :label="item.categoryName"
                :value="item.id">{{
                  item.categoryName
                }}</el-option>
            </el-select>
          </div>
          <div id="dataClassification" class="leftEchartsBox"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { parseTime } from "@/utils/ruoyi";
import {
  getDataBigScreen,
  getDataClassDistribution,
  getFieldMaxStandard
} from "../api/data";
import * as echarts from "echarts";
import "echarts-wordcloud";
import DataPupop from "./dataPupop";
import { Avatar } from "element-ui";
export default {
  components: {
    DataPupop
  },
  data() {
    return {
      allData: {},
      isShow: true,
      selectList: [],
      categoryId: '',
      currentTime: new Date(), // 当前时间
      selectData: {},
      timer: null,//  定时器
      currentDate: '',// 当前日期
      tooltipDiv:null,
    };
  },
  computed: {
    // 计算属性，格式化时间
    formattedTime() {
      const hours = this.currentTime.getHours().toString().padStart(2, '0');
      const minutes = this.currentTime.getMinutes().toString().padStart(2, '0');
      const seconds = this.currentTime.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    },
  },
  created() {
    this.getSelectList()
    this.getDataFn()
  },
  mounted() {
    this.startAutoScroll();
    this.getCurrentDate()
    // 每秒更新一次时间
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  watch: {
    $route() {
      this.$router.go();
    },
  },
  methods: {
    getCurrentDate() {
      const now = new Date(); // 获取当前日期和时间
      const year = now.getFullYear(); // 获取年份
      const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 获取月份，+1 是因为 getMonth() 返回的月份是从 0 开始的
      const day = now.getDate().toString().padStart(2, '0'); // 获取日期
      this.currentDate = `${year}-${month}-${day}`; // 格式化为 YYYY-MM-DD
    },
    goHome() {
      this.$router.push({ path: "/index" });
    },
    startAutoScroll() {
      let scrollInterval;
      let scrollPosition = 0;
      const tableBody = this.$refs.tableRef.$el.querySelector('.el-table__body-wrapper');
      scrollInterval = setInterval(() => {
        // 每次向下滚动 1px
        scrollPosition += 1;
        tableBody.scrollTop = scrollPosition;

        // 如果滚动到底部，重置滚动位置
        if (scrollPosition >= tableBody.scrollHeight - tableBody.clientHeight) {
          setTimeout(() => {
            scrollPosition = 0;
          }, 1000);
        }
      }, 80); // 每 20ms 滚动一次
    },
    selectChange(value) {
      this.getDataClassDistributionFn(value)
      setTimeout(() => {
        this.dataClassificationEchartsFn()
      }, 500)
    },
    getDataClassDistributionFn(value) {
      getDataClassDistribution({ categoryId: value }).then(res => {
        this.selectData = res.data
      })
    },
    getDataFn() {
      getDataBigScreen().then(res => {
        this.allData = res.data
        this.isShow = false
        this.initEcharts()
      })
    },
    getSelectList() {
      getFieldMaxStandard().then(async res => {
        this.selectList = res.data
        this.categoryId = res.data[0].id
        this.getDataClassDistributionFn(this.categoryId)
        setTimeout(() => {
          this.dataClassificationEchartsFn()
        }, 500)
      })
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
        grid: {
          right: '50',
        },
        legend: {
          bottom: '5%',
          data: ['新增字段数', '数据总量（MB）']
        },
        xAxis: [
          {
            type: 'category',
            data: this.allData.dataGrowthTrend.monthNames,
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            min: 0,
          },
          {
            type: 'value',
            min: 0,
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
            data: this.allData.dataGrowthTrend.dataNum
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
            data: this.allData.dataGrowthTrend.dataSize
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
        tooltip: {
          trigger: 'item',
          formatter: '{b}'
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
            type: 'funnel',
            left: '10%',
            top: 60,
            bottom: 60,
            width: '60%',
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
              length: 30,
              lineStyle: {
                width: 1,
                type: 'solid'
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            emphasis: {
              label: {
                fontSize: 20
              }
            },
            data: this.allData.cleanDataNum
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
        legend: {
        },
        toolbox: {
          show: false,
        },
        radar: {
          // shape: 'circle',
          indicator: this.allData.classifyReasonNum.indicator
        },
        series: [
          {
            name: 'Budget vs spending',
            type: 'radar',
            data: [
              {
                value:this.allData.classifyReasonNum.total,
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
          textStyle: {
            fontSize: '14'
          }
        },
        grid: {
          bottom: '100',
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
            type: 'pie',
            radius: ['50%', '70%'],
            width: '100%',
            data: this.allData.sensitiveDataProportion,
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
          bottom: 'bottom'
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
            center: ['50%', '40%'],
            roseType: 'area',
            itemStyle: {
              borderRadius: 8
            },
            data: this.allData.dataClassificationDistribution
          }
        ]
      };

      option && myChart.setOption(option);
    },
    dataClassificationEchartsFn() {
      var chartDom = document.getElementById('dataClassification');
      var myChart = echarts.init(chartDom);
      var option;
      option = {
        grid: {
          left: '80',
        },
        tooltip: {
          trigger: 'axis',
        },
        xAxis: {
          max: 'dataMax'
        },
        yAxis: {
          type: 'category',
          data: this.selectData.names,
          inverse: true,
          triggerEvent: true, // 允许触发事件
          axisLabel: {
            formatter: function (value) {
              if (value.length > 4) { // 如果文字长度超过8个字符
                return value.slice(0, 4) + '...'; // 截取前8个字符并添加省略号
              }
              return value;
            }
          }
        },
        series: [
          {
            realtimeSort: true,
            type: 'bar',
            data: this.selectData.counts,
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
    width: 23%;
    height: 829px;
    .leftEchartsBox {
      width: 100%;
      height: 215px;
      background-color: #fff;
      margin-bottom: 15px;
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;
    }
  }

  .main_boxFlex {
    width: 50%;
    height: 829px;
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

.data-stat-item_box {
  text-align: center;
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

.main_body {
  height: 266px;
  .titleBox_echarts {
    height: 40px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #e7f0f7;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
}


.title {
  border-left: 8px solid #01a7f0;
  padding-left: 15px;
  height: 20px;
}

.scroll-container {
  overflow: hidden;
  position: relative;
}
</style>