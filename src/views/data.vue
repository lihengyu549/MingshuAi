<template>
  <div id="body-content">
    <div>
      <header class="header">
        <h3>DSM数据安全地图</h3>
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
                <div class="fiveBox"></div>
                <div class="fiveBox"></div>
                <div class="fiveBox"></div>
                <div class="fiveBox"></div>
                <div class="fiveBox"></div>
              </div>
            </div>
            <div class="col-lg-3 fill-h">
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
              <div class="xpanel-wrapper xpanel-wrapper-lzh">
                <div class="xpanel">
                  <div class="title">敏感级别数统计</div>
                  <div v-if="show" class="fill-h ipTop" ref="main3"></div>
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
    };
  },
  created() {
    echarts.registerMap("world", {
      type: "FeatureCollection",
      crs: {
        type: "name",
        properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
      },
      features: features,
    });
    this.timeoutTop = setInterval(() => {
      document.querySelector("#time-content").textContent = parseTime(
        new Date()
      );
    }, 1000);
    this.timeout = setInterval(() => {
      this.initInfoListFunc();
    }, 5000);
    this.$nextTick(() => {
      this.worldMapFunc();
      this.apiStatistic();
      this.protectStatistic();
      this.levelStatistic();
      // this.getTopAttitude();
    });
    this.initInfoListFunc();
  },
  mounted() {
    this.initChart()
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
          top:'10%',
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
            data: [1, 2, 3, 4, 4, 5]
          }
        ]
      };

      optionZhu && myChartZhu.setOption(optionZhu);

    },
    levelStatistic() {
      levelStatisticI().then((res) => {
        let leveTab = res.data;
        if (leveTab.length == 0) {
          this.show = false
        } else {
          this.show = true
          let levelStatisticList = [];
          for (let i = 0; i < leveTab.length; i++) {
            levelStatisticList.push({
              value: leveTab[i].number,
              name: leveTab[i].securityLevel + "级"
            });
          }

          console.log(levelStatisticList);
          let main3 = echarts.init(this.$refs.main3, "macarons");
          var option = {
            legend: {
              top: '2%',
              left: 'center',
              textStyle: {
                color: '#fff',
                fontSize: 12
              }
            },

            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b} : {c} ({d}%)",
            },
            color: [
              new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                offset: 0,
                color: '#0075FF'
              }, {
                offset: 1,
                color: '#00DFFF'
              }]),
              new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                offset: 0,
                color: '#8E98FF'
              }, {
                offset: 1,
                color: '#436BFD'
              }]),
              new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                offset: 0,
                color: '#005CFF'
              }, {
                offset: 1,
                color: '#097FFB'
              }]),

              new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                offset: 0,
                color: '#11E8D8'
              }, {
                offset: 1,
                color: '#2DD700'
              }])
            ],
            series: [
              {
                name: "敏感级别字段分布",
                type: "pie",
                radius: "60%",
                center: ["50%", "50%"],
                label: {
                  normal: {
                    show: true, //展示
                    position: "outside", // outside表示文本显示位置为外部
                  },
                  emphasis: {
                    //文本样式
                    show: true, //展示
                    textStyle: {
                      //文本样式
                      fontSize: "14",
                      fontWeight: "600",
                    },
                  },
                },
                labelLine: {
                  //引导线设置
                  normal: {
                    show: true, //引导线显示
                  },
                },
                data: levelStatisticList,
                itemStyle: {
                  emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                  },
                },
              },
            ],
          };

          main3.setOption(option);
          //图表自适应
          window.addEventListener("resize", function () {
            var chartcontent = document.querySelector(".ipTop");
            if (chartcontent != null) {
              main3.resize(); // myChart 是实例对象
            }
          });

        }


      });
    },
    protectStatistic() {
      protectStatisticI().then((res) => {
        let num = [];
        let name = [];
        let tab = res.data;
        for (let i = 0; i < tab.length; i++) {
          num.push(tab[i].number);
          name.push(tab[i].categoryName);
        }
        let lens = 9 - num.length;
        for (let i = 0; i <= lens; i++) {
          num.push('')
          name.push('')
        }
        num.reverse()
        name.reverse()
        let main4 = echarts.init(this.$refs.main4, "macarons");
        var option = {
          tooltip: {},
          xAxis: {
            type: "value",
            show: false,
          },
          yAxis: {

            data: name,
            axisLine: {
              show: false // 隐藏纵轴线
            },
            axisTick: {
              show: false // 隐藏纵轴刻度线
            },
            splitLine: { show: false },
            // type: "category",

            axisLabel: {
              textStyle: {
                color: '#fff' // Y 轴刻度标签字体颜色
              },
              formatter: function (value, index) {
                // 根据名称长度决定是否显示完整名称或者只显示部分名称
                var threshold = 5;
                if (value.length > threshold) {
                  return value.substring(0, threshold) + "...";
                } else {
                  return value;
                }
              },
            },
          },
          grid: {
            left: "0%",
            right: "10%",
            bottom: "5%",
            top: "3%",
            containLabel: true,
          },
          series: [
            {
              barWidth: 20,
              data: num,
              type: "bar",
              label: {
                normal: {
                  show: true,
                  position: "outside",//将文字显示在柱状图内部
                  color: "#fff",

                },
              },
              itemStyle: {
                normal: {
                  barBorderRadius: 5,
                  // color: "#49b2c0",
                  color: new echarts.graphic.LinearGradient(
                    1, 0, 0, 0, // 渐变色的起止位置，可以自己调整
                    [
                      { offset: 0, color: '#00C4FF' }, // 渐变色的起始颜色
                      { offset: 1, color: '#008AFE' } // 渐变色的结束颜色
                    ]
                  ),
                },
              },
            },
          ],
        };
        main4.setOption(option);
        //图表自适应
        window.addEventListener("resize", function () {
          main4.resize(); // myChart 是实例对象
        });
      });
    },
    goHome() {
      this.$router.push({ path: "/index" });
    },
    apiStatistic() {
      apiStatisticI().then((res) => {
        let topNum = [];
        let topName = [];
        let topTab = res.data;
        for (let i = 0; i < topTab.length; i++) {
          topNum.push(topTab[i].number);
          topName.push(topTab[i].projectName);
        }
        let lens = 9 - topNum.length
        for (let i = 0; i <= lens; i++) {
          topNum.push("")
          topName.push("")
        }
        topNum.reverse()
        topName.reverse()
        let main1 = echarts.init(this.$refs.main1, "macarons");
        var option = {
          tooltip: {},
          xAxis: {
            type: "value",
            show: false,
          },
          yAxis: {
            axisLine: {
              show: false // 隐藏纵轴线
            },
            axisTick: {
              show: false // 隐藏纵轴刻度线
            },
            // splitLine: {
            //   show: false // 隐藏网格线
            // },
            // show: false,
            data: topName,
            splitLine: { show: false },
            type: "category",

            axisLabel: {
              textStyle: {
                color: '#fff' // Y 轴刻度标签字体颜色
              },
              formatter: function (value, index) {
                // 根据名称长度决定是否显示完整名称或者只显示部分名称
                var threshold = 5;
                if (value.length > threshold) {
                  return value.substring(0, threshold) + "...";
                } else {
                  return value;
                }
              },
            },
          },
          grid: {
            left: "0%",
            right: "0%",
            bottom: "5%",
            top: "3%",
            containLabel: true,
          },
          series: [
            {
              barWidth: 20,
              data: topNum,
              type: "bar",
              label: {
                show: true,
                position: 'outside', // 将文字显示在柱状图外部
                fontSize: 14, // 设置字体大小
                color: '#fff', // 设置文字颜色
                // normal: {
                //   show: true,
                //   position: "inside",//将文字显示在柱状图内部
                //   color: "#fff",

                // },
              },
              itemStyle: {
                normal: {
                  barBorderRadius: 10,
                  // color: "#49b2c0",
                  color: new echarts.graphic.LinearGradient(
                    1, 0, 0, 0, // 渐变色的起止位置，可以自己调整
                    [
                      { offset: 0, color: '#00AC98' }, // 渐变色的起始颜色
                      { offset: 1, color: '#008AFE' } // 渐变色的结束颜色
                    ]
                  ),
                },
              },
            },
          ],
        };
        main1.setOption(option);
        window.addEventListener("resize", function () {
          main1.resize();
        });
      });
    },

    initInfoListFunc() {
      getTopAttitudeI().then((res) => {
        this.attackList = res.data.top;
        let protectList = res.data.protectList;
        if (protectList.length > 0) {
          protectList.reverse();
        }
        if (this.attackDynamicList.length == 0) {
          for (let i = 0; i < protectList.length; i++) {
            var _h = "";
            _h += '    <tr class="data_list">';
            _h += "        <td>" + protectList[i].site_name + "</td>";
            _h += "        <td>" + protectList[i].site_url + "</td>";
            _h += "        <td>" + protectList[i].ip + "</td>";
            _h += "        <td>" + protectList[i].filter_rule + "</td>";
            _h += "        <td>" + protectList[i].time + "</td>";
            _h += "    </tr>";
            $("#info_list").append(_h);
            this.attackDynamicList = protectList;
          }

          var h4 = $("#datamian").prop("scrollHeight"); //等同 $('.out-box')[0].scrollHeight
          $("#datamian").scrollTop(h4);
        } else {
          let lastMaxId =
            this.attackDynamicList[this.attackDynamicList.length - 1].id;
          let curMaxId = protectList[protectList.length - 1].id;
          // 大数在最后面 [1,2,3] [1,2,3,4]

          if (curMaxId > lastMaxId) {
            for (let i = 0; i < protectList.length; i++) {
              if (protectList[i].id > lastMaxId) {
                var _h = "";
                _h += '    <tr class="data_list">';
                _h += "        <td>" + protectList[i].site_name + "</td>";
                _h += "        <td>" + protectList[i].site_url + "</td>";
                _h += "        <td>" + protectList[i].ip + "</td>";
                _h += "        <td>" + protectList[i].filter_rule + "</td>";
                _h += "        <td>" + protectList[i].time + "</td>";
                _h += "    </tr>";
                $("#info_list").append(_h);
                this.attackDynamicList.push(protectList[i]);
              }
            }
            var h4 = $("#datamian").prop("scrollHeight"); //等同 $('.out-box')[0].scrollHeight
            $("#datamian").scrollTop(h4);
          }
        }
      });
    },

    worldMapFunc() {
      var convertData = function (data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
          var dataItem = data[i];
          var fromCoord = geoCoordMap[dataItem[0].name];
          var toCoord = geoCoordMap[dataItem[1].name];
          if (fromCoord && toCoord) {
            res.push([
              {
                coord: fromCoord,
                value: dataItem[0].value,
              },
              {
                coord: toCoord,
              },
            ]);
          }
        }
        return res;
      };
      let worldMap = echarts.init(this.$refs.worldMap, "macarons");
      var geoCoordArry = [];
      for (var item in geoCoordMap) {
        geoCoordArry.push(item);
      }
      var attckData = [];
      // var attckCityList = [{ name: "中国", value: "12" },
      //   { name: "美国", value: "52" },
      //   { name: "英国", value: "52" },
      //   { name: "俄罗斯", value: "52" },
      //   { name: "巴西", value: "52" },
      //   { name: "澳大利亚", value: "52" },
      // ];

      var series = [];
      getMapDataI().then((res) => {
        // 攻击点
        let attckCityList = [];
        if (res.data.map && JSON.stringify(res.data.map.info) != "{}") {
          for (let item of res.data.map.info) {
            attckCityList.push({ name: item[0], value: item[1] });
          }
        }
        // 被攻击地点
        var attckCity = ["北京"];
        for (var i = 0; i < attckCityList.length; i++) {
          if (geoCoordArry.indexOf(attckCityList[i].name) > -1) {
            var acctckJson = [
              {
                name: attckCityList[i].name,
                value: attckCityList[i].value,
              },
              {
                name: attckCity,
              },
            ];

            attckData.push(acctckJson);
          }
        }
        [[attckCity, attckData]].forEach(function (item, i) {
          series.push(
            {
              name: "",
              type: "lines",
              zlevel: 1,
              effect: {
                show: true,
                color: "#0bc7f3",
                period: 2.5, //箭头指向速度，值越小速度越快
                trailLength: 0.05, //特效尾迹长度[0,1]值越大，尾迹越长重
                symbol: "arrow", //箭头图标
                symbolSize: 5, //图标大小
              },
              lineStyle: {
                normal: {
                  color: "#0bc7f3",
                  width: 1, //尾迹线条宽度
                  opacity: 0, //尾迹线条透明度
                  curveness: 0.3, //尾迹线条曲直度
                },
              },
              data: convertData(item[1]),
            },
            {
              type: "effectScatter",
              coordinateSystem: "geo",
              zlevel: 2,
              rippleEffect: {
                //涟漪特效
                period: 4, //动画时间，值越小速度越快
                brushType: "stroke", //波纹绘制方式 stroke, fill
                scale: 4, //波纹圆环最大限制，值越大波纹越大
              },
              symbol: "circle",
              symbolSize: function (val) {
                return 4 + val[2] / 1000; //圆环大小
              },
              itemStyle: {
                normal: {
                  show: true,
                },
                emphasis: {
                  show: true,
                  color: "#FF6A6A",
                },
              },
              data: item[1].map(function (dataItem) {
                return {
                  name: dataItem[0].name,
                  value: geoCoordMap[dataItem[0].name].push([
                    dataItem[0].value,
                  ]),
                  // value: "写死".concat([dataItem[0].value]),
                };
              }),
            },
            //被攻击点
            {
              type: "scatter",
              coordinateSystem: "geo",
              zlevel: 2,
              rippleEffect: {
                period: 4,
                brushType: "stroke",
                scale: 4,
              },
              label: {
                normal: {
                  show: true,
                  color: "red",
                  position: "right",
                  formatter: "{b}",
                },
                emphasis: {
                  show: true,
                  color: "#FF6A6A",
                },
              },
              symbol: "pin",
              symbolSize: 25,
              itemStyle: {
                normal: {
                  show: true,
                  color: "red",
                },
                emphasis: {
                  show: true,
                  color: "#FF6A6A",
                },
              },
              data: [
                {
                  name: item[0],
                  value: geoCoordMap[item[0]].concat([100]),
                  // value: "写2死".concat([100]),
                  visualMap: false,
                },
              ],
            }
          );
        });
        var worldMapOpt = {
          tooltip: {
            trigger: "item",
            backgroundColor: "#1540a1",
            borderColor: "#FFFFCC",
            showDelay: 0,
            hideDelay: 0,
            enterable: true,
            transitionDuration: 0,
            extraCssText: "z-index:100",
            formatter: function (params, ticket, callback) {
              var res = "";
              var name = params.name;
              var value =
                typeof params.value[params.seriesIndex + 1] == "undefined"
                  ? 0
                  : params.value[params.seriesIndex + 1];
              res =
                "<span style='color:#fff;'>" +
                name +
                "</span><br/>数据：" +
                value;
              return params.data.name && params.data.name[0];
            },
          },
          visualMap: {
            //图例值控制
            show: false,
            type: "piecewise",
            pieces: [
              {
                max: 80,
                color: "#00e200",
              },
              {
                min: 80,
                max: 120,
                color: "#f5ff00",
              },
              {
                min: 120,
                color: "#ff0500",
              },

            ],
            calculable: true,
          },
          geo: {
            map: "world",
            show: true,
            label: {
              emphasis: {
                show: false,
              },
            },
            roam: true,
            layoutCenter: ["50%", "50%"], //地图位置
            layoutSize: "190%",
            itemStyle: {
              normal: {
                show: "true",
                color: "#04284e", //地图背景色
                borderColor: "#5bc1c9", //省市边界线
              },
              emphasis: {
                show: "true",
                color: "rgba(37, 43, 61, .5)", //悬浮背景
              },
            },
          },
          legend: {
            orient: "vertical",
            top: "30",
            left: "center",
            align: "right",
            textStyle: {
              color: "#fff",
              fontSize: 20,
            },
            itemWidth: 50,
            itemHeight: 30,
            selectedMode: "multiple",
          },
          series: series,
        };

        worldMap.setOption(worldMapOpt);
      });

      //图表自适应
      // window.addEventListener("resize", function () {
      // var chartcontent = document.querySelector(".walMap");
      //   if (chartcontent != null) {

      //   }
      // worldMap.resize(); // myChart 是实例对象
      // });
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
  min-height: 555px;
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
  height: 32%;
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
  background-image: url("../assets/images/dataBgc.jpg");
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
  height: 30%;
  position: relative;
  display: flex;
  justify-content: space-around
}

.fiveBox {
  height: 140px;
  width: 80px;
  background: url('../assets/images/light.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  overflow: hidden;
}
</style>