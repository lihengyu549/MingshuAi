<template>
  <div id="body-content">
    <div>
      <header class="header">
        <h3>数据安全分类分级展示</h3>
      </header>
      <el-button icon="el-icon-s-home" style="
        position: absolute;
        background-color: transparent;
        color: #25FFE8;
        font-size: 30px;
        border: 0;
        left: 0%;
        top: 34px;
      " @click="goHome">
      </el-button>
      <div class="time-content">
        <span>当前时间: </span><span id="time-content">{{ parseTime(new Date()) }}</span>
      </div>
      <div class="wrapper">
        <div class="container-fluid">
          <div class="row fill-h">
            <div class="col-lg-9 fill-h">
              <div class="xpanel-wrapper xpanel-wrapper-30">
                <div class="fiveBox1">
                  <div class="textFa">
                    <span class="lightText">数据源数</span> <span class="footText">123</span>
                  </div>
                </div>
                <div class="fiveBox2">
                  <div class="textFa"><span class="lightText">表数</span> <span class="footText">22</span></div>
                </div>
                <div class="fiveBox3">
                  <div class="textFa"><span class="lightText">字段数</span> <span class="footText">3</span></div>
                </div>
                <div class="fiveBox4">
                  <div class="textFa"><span class="lightText">文件数</span> <span class="footText">455</span></div>
                </div>
                <div class="fiveBox5">
                  <div class="textFa"><span class="lightText">已梳理占比</span> <span class="footText">123123</span></div>
                </div>
              </div>
              <div id="chartDomP"></div>
            </div>
            <div class="col-lg-lzh fill-h">
              <div class="xpanel-wrapper xpanel-wrapper-lzh">
                <div class="xpanel">
                  <div class="title">数据分级分布</div>
                  <div class="fill-h attackTypes" id="dataBing" ref="main4"></div>
                </div>
              </div>
              <div class="xpanel-wrapper xpanel-wrapper-lzh">
                <div class="xpanel">
                  <div class="title">数据源敏感字段数</div>
                  <div class="fill-h accountStatistics" id="dataZhu" ref="main5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import $ from "jquery";
export default {
  components: {
  },
  data() {
    return {
      show: true,
      attackList: [],
      topNum: [],
      topName: [],
      apiTopList: [],
      attackDynamicList: [],
      topTab: {},
      top: [{ site_name: "4444", site_url: "wangzhan", num: "222" }],
      timeout: null,
      data1: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
        datasets: [
          {
            label: '# of Votes',
            data: [12, 19, 3, 5, 2],
            backgroundColor: ['Red', 'Blue', 'Yellow', 'Green', 'Purple']
          }
        ]
      },
      options: {
        // 配置项
      }
    };
  },
  created() {
  },
  mounted() {
    this.initChart()
    this.timeoutTop = setInterval(() => {
      document.querySelector("#time-content").textContent = parseTime(
        new Date()
      );
    }, 1000);
  },
  watch: {
    $route() {
      this.$router.go();
    },
  },
  methods: {
    initChart() {
      var chartDom = document.getElementById('dataBing');
      var myChart = echarts.init(chartDom);
      var option;
      option = {
        legend: {
          top: 'bottom'
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: false, readOnly: false },
          }
        },
        series: [
          {
            name: 'Nightingale Chart',
            type: 'pie',
            radius: [20, 150],
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
              { value: 28, name: 'rose 5' },
              { value: 26, name: 'rose 6' },
              { value: 22, name: 'rose 7' },
              { value: 18, name: 'rose 8' }
            ]
          }
        ]
      };
      option && myChart.setOption(option);

      var chartZhu = document.getElementById('dataZhu');
      var myChartZhu = echarts.init(chartZhu);
      var optionZhu;

      optionZhu = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: ['text1', 'text2', 'text3', 'text4', 'China', 'text5']
        },

        series: [
          {
            type: 'bar',
            data: [1, 2, 3, 4, 4, 5],
          }
        ]
      };

      optionZhu && myChartZhu.setOption(optionZhu);
      var ROOT_PATH = '/examples';
var chartDomP = document.getElementById('chartDomP');
var myChartP = echarts.init(chartDomP);
var optionP;

myChart.showLoading();
$.getJSON(
  ROOT_PATH + '/data/asset/data/npmdepgraph.min10.json',
  function (json) {
    myChartP.hideLoading();
    myChartP.setOption(
      (optionP = {
        title: {
          text: 'NPM Dependencies'
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'none',
            // progressiveThreshold: 700,
            data: json.nodes.map(function (node) {
              return {
                x: node.x,
                y: node.y,
                id: node.id,
                name: node.label,
                symbolSize: node.size,
                itemStyle: {
                  color: node.color
                }
              };
            }),
            edges: json.edges.map(function (edge) {
              return {
                source: edge.sourceID,
                target: edge.targetID
              };
            }),
            emphasis: {
              focus: 'adjacency',
              label: {
                position: 'right',
                show: true
              }
            },
            roam: true,
            lineStyle: {
              show: false,
              width: 0,
              curveness: 0.3,
              opacity: 0.7
            }
          }
        ]
      }),
      true
    );
  }
);

optionP && myChartP.setOption(optionP);
    },
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
  },
};
</script>
<style scoped lang="scss">
// .walMap{
//   width: 100%;
//   height: 100%;
// }

#datamian {
  color: #fff;
  overflow-y: auto;

}

#datamian::-webkit-scrollbar {
  width: 10px;
  // height: 20px;
}

#datamian::-webkit-scrollbar-thumb {
  background-color: #438def;
  border-radius: 5px;
}

#datamian::-webkit-scrollbar-track {
  background-color: transparent;
}

.header {
  margin: 0 auto;
  width: 100%;
  height: 68px;
  // max-width: 1920px;
  background: url("../assets/images/data-header.png");
  background-size: 100% 100%;
}

.header h3 {
  margin: 0;
  padding: 0;
  line-height: 50px;
  text-align: center;
  font-size: 24px;
  color: #fff;
}

.row {
  margin-left: -7px;
  margin-right: -8px;
}

.data_ul_head {
  height: 50px;
  // background: #175165;
}

.data_ul_head li {
  float: left;
  list-style-type: none;
  margin-right: 55px;
}

.table {
  width: 100%;
  margin-bottom: 8px;
  color: #e1e8ef;
}

.look {
  color: #49addc;
  cursor: pointer;
}

.wrapper {
  position: absolute;
  top: 80px;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 605px;
}

.data_list:hover {
  background: rgba(55, 138, 177, 0.2);
}

.container-fluid {
  height: 100%;
  min-height: 100%;
  overflow: hidden;
}

td {
  padding-left: 7px;
}


.title {
  color: #25FFE8;
  text-align: left;
  margin-top: 10px;
  font-weight: bold;
  background-color: rgb(13, 27, 62);
  padding: 10px;
  width: 100%;
}

.homex {
  color: #4cb5f3;
  position: absolute;
  margin-top: 46px;
  margin-left: 15px;
  font-size: 16px;
  cursor: pointer;
}

.time-content {
  color: #45b4f5;
  float: right;
  position: absolute;
  margin-top: -21px;
  font-size: 16px;
  right: 0;
  margin-right: 22px;
}

.xpanel-wrapper {
  padding-bottom: 15px;
  box-sizing: border-box;
}

.xpanel-wrapper-1 {
  height: 100%;
}

.xpanel-wrapper-2 {
  height: 50%;
}

.xpanel-wrapper-3 {
  height: 50%;
}

.xpanel-wrapper-lzh {
  height: 50%;
  background-color: rgba(5, 18, 56, 0.3);
}

.xpanel-X {
  padding: 15px;
  height: 100%;
  min-height: 170px;
  background: url("../assets/images/panel-frame.png") center no-repeat;
  background-size: 100% 100%;
  box-sizing: border-box;

}

.xpanel-tab {
  padding: 15px;
  height: 100%;
  min-height: 170px;
  background: url("../assets/images/xpanel-tab.png") center no-repeat;
  background-size: 100% 100%;
  box-sizing: border-box;
}

.xpanel {
  padding: 15px;
  height: 100%;
  min-height: 170px;
  background-size: 100% 100%;
  box-sizing: border-box;
}

#body-content {
  height: 100%;
  width: 100%;
  // background-color: #020051;
  background-image: url("../assets/images/dataBgc.png");
  background-size: 100% 100%;
  background-position: 100px, 100px;
  overflow: hidden;
  // overflow-y: hidden !important;
}

.fill-h {
  height: 100%;
  min-height: 100%;
}

html {
  font-family: sans-serif;
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

}

html,
body {
  width: 100% !important;
  height: 100%;
  min-height: 635px;
  font-family: "microsoft yahei", arial, sans-serif;
  background-color: #192440;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  overflow: hidden !important;
  // overflow-x: hidden;
  // overflow-y: hidden;
}

.interception {
  color: #fff;
  text-align: center;
  font-size: 14px;
  // background-color: #e80505;
}

// .interception .el-table {
//   background-color: #e80505 !important;
// }

.el-table {
  background-color: rgba(38, 38, 38, 0.75);
  // border-radius: 9px;
}

.tableCla,
.el-table__header-wrapper {
  background-color: #c51d1d !important;
}

.tableCla,
.el-table :hover {
  background-color: #e6f7ff;
}

.tableCla,
.el-table .is-selected {
  background-color: #91d5ff;
}

.lock {
  float: right;
  color: #25FFE8;
  font-size: 20px;
}

.xpanel-wrapper-30 {
  height: 40%;
  position: relative;
  display: flex;
  justify-content: space-around
}

.fiveBox1 {
  position: absolute;
  top: 100px;
  left: 100px;
  height: 160px;
  width: 120px;
  background: url('../assets/images/lightFoot.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.fiveBox2 {
  position: absolute;
  top: 50px;
  left: 350px;
  height: 160px;
  width: 120px;
  background: url('../assets/images/lightFoot.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.fiveBox3 {
  position: absolute;
  top: 0px;
  left: 600px;
  height: 160px;
  width: 120px;
  background: url('../assets/images/lightFoot.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.fiveBox4 {
  position: absolute;
  top: 50px;
  left: 850px;
  height: 160px;
  width: 120px;
  background: url('../assets/images/lightFoot.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.fiveBox5 {
  position: absolute;
  top: 100px;
  left: 1100px;
  height: 160px;
  width: 120px;
  background: url('../assets/images/lightFoot.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.lightText {
  color: #fff;
  position: absolute;
  top: 140px;
  left: 10px;
  text-align: center;
  width: 100px;
  display: inline-block;
  font-size: 20px;
  font-weight: 700;
}

.footText {
  color: #fff;
  position: absolute;
  top: 50px;
  left: 7px;
  text-align: center;
  width: 100px;
  display: inline-block;
  font-size: 20px;
  font-weight: 700;
}

.textFa {
  position: relative;
}
</style>