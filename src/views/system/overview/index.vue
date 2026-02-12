<template>
  <div class="content">
    <el-form>
      <div class="server br2 ng-waf-details" data-type="home">
        <div class="ng-waf-information">
          <span>总拦截</span><span class="all_intercept">{{ overviewTable.totalNum }}</span>
        </div>
        <div class="ng-waf-information">
          <span>POST拦截</span><span class="day_intercept">{{ overviewTable.postNum }}</span>
        </div>
        <div class="ng-waf-information">
          <span>GET拦截</span><span class="day_intercept">{{ overviewTable.getNum }}</span>
        </div>
        <div class="ng-waf-logo">
          <div class="logo_mask"></div>
          <div class="ng-logo"></div>
        </div>
        <div class="ng-waf-information">
          <span>CC拦截</span><span class="cc_defense">{{ overviewTable.ccNum }}</span>
        </div>
        <div class="ng-waf-information">
          <span>恶意扫描</span><span class="protect_day">{{ overviewTable.scanNum }}</span>
        </div>
        <div class="ng-waf-information">
          <span>恶意User-Agent</span><span class="protect_day">{{ overviewTable.userAgentNum }}</span>
        </div>
      </div>
      <div class="ipClass">
        <div class="col-xs-12 col-sm-12 col-md-6 ng-waf-content0">
          <div class="pr8">
            <div class="bgw ng-border">
              <div class="title c6 f131 plr15">封锁IP列表</div>
              <div class="ng-waf-info" style="height: 305px">
                <div class="info-data day-block-ip">
                  <span>24小时ip封锁数</span><span>{{ ipNum }}</span>
                </div>
                <div class="info-data blocking-ip">
                  <span>正在封锁的IP</span><span>{{ ipNumCur }}</span>
                </div>
                <div id="blockTableBody" class="ng-table ng-ip-table">
                  <el-table class="tableCla" :data="ipList" height="234" style="width: 100%">
                    <el-table-column align="center" prop="time" label="开始时间">
                    </el-table-column>
                    <el-table-column align="center" prop="ip" label="攻击IP"></el-table-column>
                    <el-table-column align="center" prop="site_name" label="项目名称">
                    </el-table-column>
                    <el-table-column align="center" prop="site_url" label="代理网址">
                    </el-table-column>
                    <el-table-column align="center" prop="blockingTime" label="封锁时间">
                    </el-table-column>
                    <el-table-column label="操作" align="center">
                      <template slot-scope="scope">
                        <el-button v-if="scope.row.status == true" @click="deblocking(scope.row)"
                          class="operation">解封</el-button>
                        <el-button v-else class="operation">--</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-6 ng-waf-content0" style=" box-shadow: 0px 1px 3px 1px rgb(0 0 0 / 5%);">
          <div>
            <div class="title c6 f13 plr15 ng-map-title">攻击地图</div>
            <div class="ng-waf-info ng-tendency" style="height: 303px">
              <div ref="openingChart" style="height: 100%"></div>
            </div>
            <div class="district-legend">低
              <span style="background:#EBF3FC"></span>
              <span style="background:#92BDEE"></span>
              <span style="background:#3887E0"></span>
              高
            </div>
          </div>
          <div class="gongji">
            <div>
              <div :class="topList.length == 0 ? 'indTab1' : 'title c6 f13'" class="title c6 f13"
                style="height: 40px;border-bottom: 0;">攻击IP排行榜</div>
              <div class="ranking" style="height: 100%; overflow: auto;">
                <div style=" margin: 5px  5px 15px 0; " class="ng-attack-list" v-for="(item, index) in topList"
                  :key="index">
                  <a @click="ipRanking(item[0])" style="color: #4885ff; margin: 5px  5px 15px 0;   cursor: pointer;">{{
                    item[0] }}</a>
                  <span>( {{ item[1] }} )次</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ipClass">
        <div class="col-xs-12 col-sm-12 col-md-4 ng-waf-content">
          <div class="pr8">
            <div class="bgw ng-border">
              <div class="title c6 f13 plr15">7天拦截趋势图</div>
              <div class="ng-waf-info ng-tendency" id="ng-tendency" v-loading="bottomLoading">
                <div class="proCharts" ref="YEcharts"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-4 ng-waf-content">
          <div class="pr8" style="margin-left: 7px">
            <div class="bgw ng-border">
              <div class="title c6 f13 plr15">今日网站拦截TOP5</div>
              <div class="ng-waf-info">
                <div class="divtable ng-table ng-ranking-table" v-loading="bottomLoading">
                  <el-table class="tableCla" :data="top" height="285" style="width: 100%">
                    <el-table-column align="center" prop="site_name" label="项目名称">
                    </el-table-column>
                    <el-table-column align="center" prop="site_url" label="网站"></el-table-column>
                    <el-table-column align="center" prop="num" label="拦截次数">
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-4 ng-waf-content" id="waf_ranking">
          <div class="bgw ng-border" style="margin-left: 7px">
            <div class="title c6 f13 plr15">防护动态</div>
            <div class="ng-waf-info" v-loading="bottomLoading">
              <div class="divtable ng-table ng-ranking-table">
                <el-table class="tableCla" :data="tableData" height="285" style="width: 100%">
                  <el-table-column align="center" prop="time" label="开始时间" width="180">
                  </el-table-column>
                  <el-table-column align="center" label="IP" width="260">
                    <template slot-scope="scope">{{ scope.row.ip }}攻击了网站
                      {{ scope.row.site_url }}已被拦截,触发规则是:{{
                        scope.row.filter_rule
                      }}</template>
                  </el-table-column>
                  <el-table-column align="center" label="操作">
                    <template slot-scope="scope">
                      <el-button @click="particulars(scope.row)" class="operation">详情</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-form>
    <!-- 解封弹窗 -->
    <el-dialog title="解封IP地址" style="margin-top: 15vh;" append-to-body :close-on-click-modal="false"
      :visible.sync="deblockingVisible" width="20%">
      <div style="display: flex;">
        <i class="el-icon-warning-outline custom-icon1"></i>
        <span style="font-size: 15px;padding-left: 10px;">是否要从防火墙解封IP【{{ deblockingIp }}】</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deblockingVisible = false">取 消</el-button>
        <el-button type="primary" plain @click="definiteUnsealing(deblockingIp)">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 攻击IP排行榜 -->
    <el-dialog title="加入IP黑名单" style="margin-top: 15vh;" append-to-body :close-on-click-modal="false"
      :visible.sync="blacklistVisible" width="20%">
      <div style="display: flex;">
        <i class="el-icon-warning-outline custom-icon1"></i>
        <span style="font-size: 15px;padding-left: 10px;">是否将 {{ blackIp }} 添加到黑名单</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="blacklistVisible = false">取 消</el-button>
        <el-button type="primary" plain @click="requireBlack(blackIp)">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 详情 -->
    <el-dialog width="40%" title="详情" :close-on-click-modal="false" :visible.sync="particularsVisible" append-to-body>
      <div class="xiangqing">
        <div class="shijian">
          <div style="width: 50%; ">
            <span style="padding:0 30px 0 10px; font-weight: 700; ">时间</span>
            <span>{{ particularsTab.starTime }}</span>
          </div>
          <div style="width: 50%; ">
            <span style="padding:0 30px 0 10px; font-weight: 700; ">攻击IP</span>
            <a style="color: #3b82f6;" @click="ipRanking(particularsTab.ip)">{{ particularsTab.ip }}</a>
          </div>
        </div>
        <div class="shijian1">
          <div style="width: 50%; ">
            <span style="padding:0 30px 0 10px; font-weight: 700; ">类型</span>
            <span>{{ particularsTab.type }}</span>
          </div>
          <div style="width: 50%; ">
            <span style="padding:0 30px 0 10px; font-weight: 700; ">过滤器</span>
            <span>{{ particularsTab.filter }}</span>
          </div>
        </div>
      </div>
      <div style="margin: 20px  0 10px 10px; font-weight: 700;">URI地址</div>
      <div class="dizhi">{{ particularsTab.uri }}</div>
      <div style="margin: 20px  0 10px 10px; font-weight: 700;">User-Agent</div>
      <div class="dizhi">{{ particularsTab.userAgent }}</div>

      <div style=" display: flex;justify-content: space-between;">
        <div style="margin: 20px  0 10px 10px; font-weight: 700;">过滤规则</div>
        <div style="margin: 20px  10px 10px 10px; font-weight: 700; color: #3b82f6; cursor: pointer;" @click="whiteList">
          URL加白</div>
      </div>
      <div class="dizhi">{{ particularsTab.filterRule }}</div>

      <div style="margin: 20px  0 10px 10px; font-weight: 700;">传入值</div>
      <div class="dizhi">{{ particularsTab.incomingValue }}</div>

      <div style="margin: 20px  0 10px 10px; font-weight: 700;">风险值</div>
      <div class="dizhi">{{ particularsTab.riskValue }}</div>
      <el-dialog title="加入URL白名单" style="margin-top: 15vh;" append-to-body :close-on-click-modal="false"
        :visible.sync="whiteVisible" width="20%">
        <div style="display: flex;">
          <i class="el-icon-question custom-icon1"></i>
          <span style="font-size: 15px;padding-left: 10px;;">加入URL白名单后此URL将不再进行防护，是否继续操作？</span>
        </div>

        <span slot="footer" class="dialog-footer">
          <el-button @click="whiteVisible = false">取 消</el-button>
          <el-button type="primary" plain @click="reqWhiteList(particularsTab.uri)">确 定</el-button>
        </span>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import {
  statisticsI,
  getIpStatisticsI,
  getTopAttitudeI,
  unlockIPI,
  lockIpI,
  getLogDetailI,
  addWhiteUrlI,
  features
} from "@/api/system/overview";
import * as echarts from "echarts";
// import * as china  from "@/src/utils/world.js"
// const chinaJson = require("./chinaChange.json")
export default {
  name: "",
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data () {
    return {
      bottomLoading: false,
      whiteVisible: false,
      particularsTab: {},
      particularsVisible: false,
      blackIp: '',
      blacklistVisible: false,
      deblockingVisible: false,
      deblockingIp: '',
      ipNumCur: "",
      ipNum: "",
      topList: [],
      top: [],
      ipList: [],
      overviewTable: {},
      earthOption: {},
      option: {
        color: ["#3b82f6"],
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
          type: "category",

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
            smooth: true,
            symbol: "circle",
            data: [],
            type: "line",
            lineStyle: {
              color: {
                type: "linear", // 设置渐变类型
                x: 0, // 渐变起点 x 坐标
                y: 0, // 渐变起点 y 坐标
                x2: 0, // 渐变终点 x 坐标
                y2: 1, // 渐变终点 y 坐标
                colorStops: [
                  // 颜色渐变配置项
                  { offset: 0, color: "#7bf8ff" },
                  { offset: 0.5, color: "#62bce1" },
                  { offset: 1, color: "#0d93bf" },
                ],
              },
            },
          },
        ],
      },
      tableData: [],
      activeName: "overview",
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    // 添加url白名单
    reqWhiteList (url) {
      let data = {
        url: url
      }
      addWhiteUrlI(data).then((res => {
        if (res.code == 200) {
          this.$message({
            message: "已添加到黑名单",
            duration: 3000,
            type: 'success'
          });
          this.whiteVisible = false

        } else {
          this.$message.error({
            message: res.msg,
            duration: 3000,
          });
          this.whiteVisible = false
        }
      }))
    },
    whiteList () {
      this.whiteVisible = true
    },
    // 详情
    particulars (row) {
      this.particularsTab = {}
      let data = {
        id: row.id
      }
      getLogDetailI(data).then((res => {
        this.particularsTab = res.data
        this.particularsVisible = true
      }))
    },
    // 确定加入黑名单
    requireBlack (ip) {
      let data = { ip: ip }
      lockIpI(data).then((res => {
        if (res.code == 200) {
          this.$message({
            message: "已添加到黑名单",
            duration: 3000,
            type: 'success'
          });
          this.blacklistVisible = false
        } else {
          this.$message.error({
            message: res.msg,
            duration: 3000,
          });
          this.blacklistVisible = false
        }

      }))


    },
    // 确定解封
    definiteUnsealing (ip) {
      let data = { ip: ip }
      unlockIPI(data).then((res => {
        this.$message({
          message: res.msg,
          duration: 3000,
          type: 'success'
        });
        this.deblockingVisible = false
        this.getIpStatistics()
      }))

    },
    // 解封
    deblocking (row) {
      this.deblockingIp = row.ip
      this.deblockingVisible = true

    },
    // 攻击IP排行榜
    ipRanking (i) {
      this.blackIp = i
      this.blacklistVisible = true

    },
    getTopAttitude () {
      this.bottomLoading = true
      getTopAttitudeI().then((res) => {
        if (res.data.top == [] || res.data.protectList == [] || res.data.attitude == null) {
          this.option.series[0].data = ['1', '0.2', '0.5', '0.1', '0.7', '0', '1']
          this.option.xAxis.data = ["2023-04-11", "2023-04-10", "2023-04-09", "2023-04-08", "2023-04-07", "2023-04-06", "2023-04-05"]
          this.bottomLoading = false

        } else {
          this.top = res.data.top;
          this.tableData = res.data.protectList;
          let attitude = res.data.attitude;
          let dateList = [];
          let numList = [];
          for (let i = 0; i < attitude.length; i++) {
            let str = attitude[i][0]
            let result = str.substring(0, 10)
            dateList.push(result);
            // dateList.push("aa");
            numList.push(attitude[i][1]);
          }
          this.option.series[0].data = numList;
          this.option.xAxis.data = dateList;
          let RodChart = echarts.init(this.$refs.YEcharts, "macarons");
          RodChart.setOption(this.option, true);
          this.bottomLoading = false
        }
      });
    },
    // 封锁ip列表+地图数据
    getIpStatistics () {
      getIpStatisticsI().then((res) => {
        if (res.data.ipList == [] || res.data.map == null) {
          res.data.map = {
            // 1_day_count:0,
            // 24_day_count:0,
            info: {},
            top10_ip: {}
          }
          this.ipNum = res.data.ipNum
          this.ipNumCur = res.data.ipNumCur
          this.ipList = res.data.ipList;
          this.topList = res.data.map.top10_ip
          this.createMap(res.data.map);
        } else {
          this.ipNum = res.data.ipNum
          this.ipNumCur = res.data.ipNumCur
          this.ipList = res.data.ipList;
          this.topList = res.data.map.top10_ip
          this.createMap(res.data.map);
        }
      });
    },
    // 头部数据
    getoverview () {
      statisticsI().then((res) => {
        this.overviewTable = res.data;
        console.log(this.overviewTable);
        if (this.overviewTable.postNum == "null") {
          this.overviewTable.postNum = 0
        }
        if (this.overviewTable.getNum == "null") {
          this.overviewTable.getNum = 0
        }
      });
    },
    createMap (data) {
      var that = this;
      let map = [];
      for (let i = 0; i < data.info.length; i++) {
        var _list = { name: data.info[i][0], value: data.info[i][1] };
        map.push(_list);
      }
      // 初始化中国地图
      // this.$echarts.registerMap("china", this.china);

      // 获取dom节点
      let openingChart = this.$echarts.init(this.$refs.openingChart);

      var option = {
        title: {
          left: "center",
          top: "top",
        },
        tooltip: {

          trigger: "item",
          formatter: function (params) {
            var a;
            var value = (params.value + "").split(".");
            value[0] == "NaN"
              ? (a = "国家：" + params.name)
              : (a =
                "国家:" +
                params.name +
                " </br> " +
                "时间:" +
                that.option.xAxis.data[6].substring(0, 10) +
                "&nbsp;-&nbsp;" +
                that.option.xAxis.data[0].substring(0, 10) +
                " </br> " +
                "攻击次数:" +
                value);
            return a;
          },
        },
        grid: {
          top: 70,
          bottom: 40,
          left: 0,
          right: 100,
        },
        visualMap: {
          min: 0,
          max: 100,
          left: -200,
          range: null,
          inRange: {
            color: ["#EBF3FC", "#92BDEE", "#3887E0"],
          },
        },
        select: {//这个就是鼠标点击后，地图想要展示的配置
          disabled: true,//可以被选中
          itemStyle: {//相关配置项很多，可以参考echarts官网
            areaColor: "#cdfaec"//选中
          }
        },
        series: [
          {
            name: "World Population (2010)",
            type: "map",
            mapType: "world",
            zoom: 1.2,
            itemStyle: {
              emphasis: {
                borderColor: "#ffffff",
                areaColor: " #cdfaec",
              },

              normal: {

                borderColor: "#ffffff",
                areaColor: "#E6E6E6",
              },
            },
            data: map,
          },
        ],
      };

      // option配置写在最下面的
      openingChart.setOption(option, true);
      window.addEventListener("resize", () => {
        openingChart.resize();
      });
    },

    // 7天拦截趋势图
    Ycharts () {
      let RodChart = echarts.init(this.$refs.YEcharts, "macarons");
      RodChart.setOption(this.option, true);
      //图表自适应
      window.addEventListener("resize", function () {
        RodChart.resize(); // myChart 是实例对象
      });
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created () {
    echarts.registerMap("world", {
      type: "FeatureCollection",
      crs: {
        type: "name",
        properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
      },
      features: features,
    });
    this.getoverview();
    this.getTopAttitude();
    this.getIpStatistics();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted () {
    this.Ycharts();
    // this.getIpStatistics();
  },
  beforeCreate () { }, //生命周期 - 创建之前
  beforeMount () { }, //生命周期 - 挂载之前
  beforeUpdate () { }, //生命周期 - 更新之前
  updated () { }, //生命周期 - 更新之后
  beforeDestroy () { }, //生命周期 - 销毁之前
  destroyed () { }, //生命周期 - 销毁完成
  activated () { }, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>

<style lang="scss" scoped>
@import url("../../../assets/styles/btwaf.css");

// @import url('http://192.168.3.70:35211/btwaf/static/js/world_fix.js?version=9.0.9');
.operation {
  color: #1890ff;
  border: 0;
  background-color: transparent;
}

.el-table::before {
  height: 0;
}

.ranking::-webkit-scrollbar {
  width: 10px;
  height: 10px;

}

.ranking::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 1vh;
}

.ranking::-webkit-scrollbar-track {
  background: rgba(#ccc, 0.3);
}

.tableCla {

  // width: 19px;
  //  margin-left: 0.8vh;
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 1vh;
  }

  ::-webkit-scrollbar-track {
    background: rgba(#ccc, 0.3);
  }
}

/* @import url(); 引入公共css类 */
.content {
  padding-left: 20px;
  padding-right: 20px;
}

.ipClass {
  // margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.title {
  height: 50px;
  line-height: 50px;
  border-bottom: 1px solid #eee;
  margin: 0px;
}

.plr15 {
  padding: 0 15px;
}

.proCharts {
  width: 100%;
  height: 100%;
  background: #fff;
}

.custom-icon1 {
  font-size: 2em;
  color: #f89d42;
  /* 修改为你需要的颜色 */
}


.xiangqing {
  width: 100%;
  height: 80px;
  border: 1px solid #eee;
}

.shijian1 {
  display: flex;
  height: 40px;
  line-height: 40px;
}

.shijian {
  display: flex;
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid #eee;
}

.dizhi {
  width: 100%;
  line-height: 40px;
  background-color: #f6f6f6;
  border-radius: 5px;
  padding: 10px;
}

.wenben {
  padding: 10px;
  width: 100%;
  background-color: #f6f6f6;
  border: 1px solid #eee;
  border-radius: 5px;
}

.indTab1 {
  display: none;
  visibility: hidden;
}
</style>
