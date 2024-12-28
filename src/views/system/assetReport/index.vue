<template>
  <div class="app-container main">

    <div class="writeBgc">
      <div style="display: flex;justify-content: space-between;align-items: center;padding: 10px;">
        <div style="height: 36px;display: flex;">
          <span class="selectLabel">所属框架</span>
          <el-select v-model="queryParams.categoryId" class="serachInput" @change="treeOptionsSelectChange"
            placeholder="全部">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div style="height: 100%;"><el-button type="primary" size="medium" @click="editFn(scope.row)">导出报告</el-button>
        </div>
      </div>
      <div class="hede_bgc">
        <div class="hede_bgc-text">数据资产概览 分类分级报告</div>
      </div>
      <div class="box1">
        <div class="head">
          <div>数据资产概况</div>
          <div>01</div>
        </div>
        <el-table v-loading="tableBoxloading" :data="tableData" class="tableBox" ref="tableRef">
          <el-table-column label="数据源（个）" align="center" prop="datasourceCount" show-overflow-tooltip />
          <el-table-column label="数据库（个）" align="center" prop="databaseCount" show-overflow-tooltip />
          <el-table-column label="数据表（张）" align="center" prop="dataTableCount" show-overflow-tooltip />
          <el-table-column label="字段（个）" align="center" prop="dataFieldCount" show-overflow-tooltip />
          <el-table-column label="未梳理字段（个）" align="center" prop="notConfirmFieldCount" show-overflow-tooltip />
          <el-table-column label="梳理率（%）" align="center" prop="confirmProportion" show-overflow-tooltip>
            <!-- <template slot-scope="scope">
              <span>{{ (scope.confirmProportion) }}%</span>
            </template> -->
          </el-table-column>
        </el-table>
        <div style="display: flex;justify-content: space-between;align-items: center;padding:10px 30px;">
          <div id="echartsOne" class="echartsOneClass"></div>
          <div id="echartsTwo" class="echartsTwoClass"></div>
        </div>
      </div>
      <div class="box1">
        <div class="head">
          <div>数据资产统计</div>
          <div>02</div>
        </div>
        <div class="ul_box">
          <div style="display: flex; justify-content: space-between;">
            <div style="margin-right: 20px;">
              <h4>数据库排行</h4>
              <ul>
                <li v-for="(item, i) in datasourceTop" :key="i" :class="{ 'even': i % 2 === 0, 'odd': i % 2 !== 0 }">
                  <span :class="i >= 3 ? 'pentagon' : `pentagon${i + 1}`"> <span>{{ i + 1 }}</span></span>
                  {{ item.databaseType }}
                </li>
              </ul>
            </div>
            <div style="margin-right: 20px;">
              <h4>数据表排行</h4>
              <ul>
                <li v-for="(item, i) in tableTop" :key="i" :class="{ 'even': i % 2 === 0, 'odd': i % 2 !== 0 }">
                  <span :class="i >= 3 ? 'pentagon' : `pentagon${i + 1}`"> <span>{{ i + 1 }}</span></span>
                  {{ item.sourceName }}
                </li>
              </ul>
            </div>
            <div>
              <h4>字段数量排行</h4>
              <ul>
                <li v-for="(item, i) in fieldTop" :key="i" :class="{ 'even': i % 2 === 0, 'odd': i % 2 !== 0 }">
                  <span :class="i >= 3 ? 'pentagon' : `pentagon${i + 1}`"> <span>{{ i + 1 }}</span></span>
                  {{ item.sourceName }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="progress_echarts">
          <div class="progress-box left-box">
            <h4 class="progress_echarts_text">数据库主机排行</h4>
            <div v-for="item in ipTop">
              <span>{{ item.label }}</span>
              <el-progress :stroke-width="26" :percentage="item.value" :format="format">
              </el-progress>
            </div>
          </div>
          <div class="progress-box right-box">
            <h4 class="progress_echarts_text">数据库类型数量排行</h4>
            <div id="echartsThree" class="echartsBoxThree"></div>
          </div>
        </div>
      </div>
      <div class="box1">
        <div>
          <div class="head">
            <div>分类分级统计</div>
            <div>03</div>
          </div>
          <div class="boxThreeMain">
            <div style="width: 48%;">
              <h4 style="color: #bbcefd;">数据分类分布</h4>
              <div id="zhuSort" style="width: 100%;height: 300px;"></div>
            </div>
            <div style="width: 48%;">
              <h4 style="color: #bbcefd;">数据分类分布</h4>
              <div id="chartDomLast" style="width: 100%;height: 300px;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getFrameworks,dashboardList } from "@/api/system/protectCategory";
export default {
  name: "Post",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      // 查询参数
      queryParams: {
        categoryId: '',
      },
      allData:{},
      treeOptions: [],
      tableBoxloading: false,
      months: [],
      last6MonthsConfirmCounts:[],
      last6MonthsAddCounts:[],
      tableData: [
        {
          aaa1: 6,
          aaa2: 10,
          aaa3: 266,
          aaa4: 3140,
          aaa5: 3131,
          aaa6: 0.2,
        }
      ],
      fieldTop:[],
      tableTop:[],
      datasourceTop:[],
      ipTop: [],
      dataTypeList:[],
      dataTypeListData:[],
    }
  },
  created() {
    this.gettreeOptionsList();
  },
  mounted() {
  },
  methods: {
    earchsInit() {
      var echarts = require('echarts');
      var chartDomOne = document.getElementById('echartsOne');
      var myChartOne = echarts.init(chartDomOne);
      var optionOne;
      optionOne = {
        title: {
          text: '资产/梳理新增趋势（最近6个月）',
          textStyle: {
            fontSize: '14'
          }
        },
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
          data: ['新增字段数', '梳理字段数'],
          right: 0,
          top: 20,
        },
        xAxis: [
          {
            type: 'category',
            data: this.months,
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '',
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '',
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: [
          {
            name: '新增字段数',
            type: 'bar',
            color: '#3d86ff',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' ml';
              }
            },
            // 最近6个月得数据
            data: this.getLast6MonthsAddCounts()
          },
          {
            name: '梳理字段数',
            type: 'bar',
            color: '#0fd2f7',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' ml';
              }
            },
            // 最近6个月得数据
            data:this.getLast6MonthsConfirmCounts()
          }
        ]
      };
      optionOne && myChartOne.setOption(optionOne);

      var chartDomTwo = document.getElementById('echartsTwo');
      var myChartTwo = echarts.init(chartDomTwo);
      var optionTwo;

      optionTwo = {
        color: ['#1e8ff8', '#32c5ff'],
        title: {
          text: '资产/梳理新增趋势（最近6个月）',
          textStyle: {
            fontSize: '14'
          }
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          top: '50%',
          right: '-1px'
        },
        series: [
          {
            type: 'pie',
            radius: ['55%', '70%'],
            avoidLabelOverlap: false,
            padAngle: 5,
            itemStyle: {
              borderRadius: 10
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: false,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.allData.notConfirmFieldCount, name: `未梳理 ${this.allData.notConfirmFieldCount}` },
              { value: this.allData.confirmCount, name: `已梳理 ${this.allData.confirmCount}` }
            ]
          }
        ],
        graphic: [
          {
            type: 'circle',
            shape: {
              r: 75 // 外层空心圆的半径
            },
            style: {
              fill: 'none', // 填充颜色为无
              stroke: '#d2e9fe', // 边框颜色
              lineWidth: 2 // 边框宽度
            },
            left: 'center',
            top: 'center'
          },
          {
            type: 'circle',
            shape: {
              r: 70 // 内层空心圆的半径
            },
            style: {
              fill: 'none', // 填充颜色为无
              stroke: '#d2e9fe', // 边框颜色
              lineWidth: 2 // 边框宽度
            },
            left: 'center',
            top: 'center'
          },
          {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: `${this.allData.confirmProportion}

已梳理`, // 你想要显示的文字
              textAlign: 'center',
              fill: '#333',
              fontSize: 20,
              fontWeight: 600,
              overflow: 'break',
            }
          }
        ]
      };
      optionTwo && myChartTwo.setOption(optionTwo);

      var chartDomThree = document.getElementById('echartsThree');
      var myChartThree = echarts.init(chartDomThree);
      var optionThree;

      optionThree = {
        xAxis: {
          axisLabel: { interval: 0, rotate: 30 },
          name: '类型',
          type: 'category',
          data: this.dataTypeList
        },
        yAxis: {
          name: '数量',
          type: 'value'
        },
        series: [
          {
            data: this.dataTypeListData,
            type: 'bar'
          }
        ]
      };

      optionThree && myChartThree.setOption(optionThree);

      var chartDomSort = document.getElementById('zhuSort');
      var myChartSort = echarts.init(chartDomSort);
      var optionSort;

      optionSort = {
        dataset: [
          {
            dimensions: ['name', 'score'],
            source: [
              ['单位联系信息', 41,],
              ['交易基本信息', 20,],
              ['一般员工信息', 52],
              ['单位基本概况', 37,],
              ['基础标签信息', 25],
              ['音效管理信息', 19],
              ['个人基本信息概况', 71],
            ]
          },

          {
            transform: {
              type: 'sort',
              config: { dimension: 'score', order: 'asc' }
            }
          }
        ],
        xAxis: {
          type: 'category',
          axisLabel: { interval: 0, rotate: 30 }
        },
        yAxis: {},
        series: {
          type: 'bar',
          encode: { x: 'name', y: 'score' },
          datasetIndex: 1
        }
      };

      optionSort && myChartSort.setOption(optionSort);

      var chartDomLast = document.getElementById('chartDomLast');
      var myChartLast = echarts.init(chartDomLast);
      var optionLast;

      optionLast = {
        color: ['#50d7dc', '#61bee5', '#fabe3d', '#fa893d', '#fb461d'],
        tooltip: {
          trigger: 'item',
          color: '#fff',
        },
        legend: {
          icon: 'circle',
          //（顺时针左上，右上，右下，左下）
          orient: 'vertical',
          top: 'center',
          right: '2%',
          textStyle: {
            color: '#fff',
          },
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '60%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: false,
                fontSize: 40,
                fontWeight: 'bold',
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 1048, name: '1级' },
              { value: 735, name: '2级' },
              { value: 580, name: '3级' },
              { value: 484, name: '4级' },
              { value: 300, name: '5级' }
            ]
          }
        ],

        graphic: [

          {
            type: 'circle',
            shape: {
              r: 55 // 内层空心圆的半径
            },
            style: {
              fill: 'none', // 填充颜色为无
              stroke: '#fff', // 边框颜色
              lineWidth: 4 // 边框宽度
            },
            left: 'center',
            top: 'center'
          },
          {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: `${4140}

数据总量`, // 你想要显示的文字
              textAlign: 'center',
              fill: '#fff',
              fontSize: 20,
              fontWeight: 600,
              overflow: 'break',
            }
          }
        ]
      };

      optionLast && myChartLast.setOption(optionLast);
    },
    // getPreviousMonths() {
    //   const months = [];
    //   const currentDate = new Date();
    //   for (let i = 0; i < 6; i++) {
    //     const date = new Date(currentDate);
    //     date.setMonth(currentDate.getMonth() - i);
    //     const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1，并补零
    //     months.push(`${month}月`);
    //   }
    //   return months.reverse(); // 反转数组，使当前月份在最后
    // },
    getLast6MonthsAddCounts(){
      return this.last6MonthsAddCounts
    },
    getLast6MonthsConfirmCounts(){
      return this.last6MonthsConfirmCounts
    },
    getAddMonthAndData(data){
      for(let key in data) {
        this.last6MonthsAddCounts.push(data[key])
        this.months.push(key.slice(-2)+'月')
      }
    },
    getMonthAndData(data){
      for(let key in data) {
        this.last6MonthsConfirmCounts.push(data[key])
      }
    },
    dashboardList() {
      dashboardList({categoryId:this.queryParams.categoryId}).then(res=>{
        this.allData = res.data
        let item = res.data
        let obj = {
            dataTableCount: item.dataTableCount,
            databaseCount: item.databaseCount,
            datasourceCount: item.datasourceCount,
            dataFieldCount: item.dataFieldCount,
            notConfirmFieldCount: item.notConfirmFieldCount,
            confirmCount: item.confirmCount,
            confirmCount: item.confirmCount,
            confirmProportion:item.confirmProportion
        }
        this.tableData = [obj]
        this.getAddMonthAndData(res.data.last6MonthsAddCounts)
        this.getMonthAndData(res.data.last6MonthsConfirmCounts)
        this.getIpAndData(res.data.ipTop)
        this.getDataTypeAndData(res.data.dataTypeTop)
        this.datasourceTop = res.data.datasourceTop
        this.fieldTop = res.data.fieldTop
        this.tableTop = res.data.tableTop
        this.earchsInit()
      })
    },
    getIpAndData(data){
      for(let key in data) {
        this.ipTop.push({
          value: data[key] * 10,
          label:key
        })
      }
    },
    
    getDataTypeAndData(data){
      for(let key in data) {
        this.dataTypeList.push(key)
        this.dataTypeListData.push(data[key])
      }
    },
    format(percentage) {
      return `${percentage / 10}个`;
    },
    gettreeOptionsList() {
      this.Loading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        if (response.data.length > 0) {
          this.queryParams.categoryId = response.data[0].id;
          this.dashboardList()
        }
      });
    },

    // 左侧树下拉选change事件
    treeOptionsSelectChange(val) {
    },
  }
};
</script>
<style scoped>
.main {
  background-color: #eee;
}

.writeBgc {
  background-color: #fff;
  width: 60%;
  margin: 0 auto;
}

.selectLabel {
  display: inline-block;
  padding: 10px;
  background-color: #eee;
  height: 36px;
  font-size: 14px;
  color: rgb(39, 39, 39);
}

.hede_bgc {
  width: 100%;
  height: 180px;
  background: url('../../../assets/images/assetReportBgc.png');
  background-size: 100% 100%;
  /* 修改背景图大小 */
  background-position: 0 60%;
  background-repeat: no-repeat;
  position: relative;
  /* 添加相对定位 */
}

.hede_bgc-text {
  font-size: 48px;
  text-align: center;
  width: 100%;
  position: absolute;
  /* 使用绝对定位 */
  top: 50%;
  /* 调整文字垂直位置 */
  left: 50%;
  /* 调整文字水平位置 */
  transform: translate(-50%, -50%);
  /* 使文字居中 */
  color: white;
  /* 设置文字颜色 */
  z-index: 1;
  /* 确保文字在背景图上面 */
}

.box1 {
  width: 100%;
  padding: 0 15px;

  .head {
    display: flex;
    justify-content: space-between;
    font-size: 20px;
    color: #3871ff;
    align-items: center;
    font-weight: 600;
    border-bottom: 1px solid #3871ff;
    padding: 10px 0;
  }

  td {
    color: #3871ff;
    font-weight: 600;
    font-size: 18px;
  }
}

.echartsOneClass {
  height: 300px;
  width: 40%;
  margin-top: 20px;
  margin-right: 40px;
}

.echartsTwoClass {
  height: 300px;
  margin-top: 20px;
  flex: 1;
}

.ul_box {
  display: flex;
  justify-content: space-between;
}

.ul_box div {
  flex: 1;
  margin-right: 20px;
}

.ul_box div:last-child {
  margin-right: 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

ul li {
  padding: 8px;
  border-bottom: 1px solid #ddd;
}

ul li.even {
  background-color: #f2f4f8;
}

ul li.odd {
  background-color: #ffffff;
}

.pentagon1 {
  display: inline-block;
  color: #fff;
  width: 25px;
  height: 25px;
  background: #1890ff;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
  transition: all 0.3s ease;
  line-height: 25px;
  text-align: center;
}

.pentagon2 {
  display: inline-block;
  color: #fff;
  width: 25px;
  height: 25px;
  background: #07aac8;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
  transition: all 0.3s ease;
  line-height: 25px;
  text-align: center;

  span {
    color: #fff;
    font-size: 16px;
    /* 如果文字会旋转,可以添加以下样式保持文字方向 */
    transform: rotate(0deg);
  }
}

.pentagon3 {
  display: inline-block;
  color: #fff;
  width: 25px;
  height: 25px;
  background: #9640ff;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
  transition: all 0.3s ease;
  line-height: 25px;
  text-align: center;

  span {
    color: #fff;
    font-size: 16px;
    /* 如果文字会旋转,可以添加以下样式保持文字方向 */
    transform: rotate(0deg);
  }
}

.pentagon {
  display: inline-block;
  color: #fff;
  width: 25px;
  height: 25px;
  background: #a6b2d4;
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
  transition: all 0.3s ease;
  line-height: 25px;
  text-align: center;

  span {
    color: #fff;
    font-size: 16px;
    /* 如果文字会旋转,可以添加以下样式保持文字方向 */
    transform: rotate(0deg);
  }
}

.progress_echarts {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 300px;
  margin-top: 20px;
  background-color: #e8f5fe;
  padding: 20px;
}

.progress-box {
  width: 49%;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background-color: #fff;
}

.el-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.el-progress /deep/ .el-progress__text {
  font-size: 16px !important;
}

.progress_echarts_text {
  color: #696969;
  margin: 0;
}

.echartsBoxThree {
  width: 100%;
  height: 100%;
}

.boxThreeMain {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 350px;
  background-color: #09102b;
  padding: 10px 0;
  margin-top: 10px;

  h4 {
    padding: 10px 0 10px 5px;
    background-color: #0c1743;
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    text-shadow:
      1px 1px 2px #888,
      2px 2px 2px #888,
      3px 3px 2px #888;
  }
}
</style>