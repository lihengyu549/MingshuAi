<template>
  <div class="app-container main">
    <div class="writeBgc">
      <div style="display: flex;justify-content: space-between;align-items: center;padding: 10px;">
        <div style="height: 36px;display: flex;">
          <span class="selectLabel">所属标准</span>
          <el-select v-model="queryParams.categoryId" class="serachInput" placeholder="全部">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div style="height: 100%;"><el-button type="primary" plain size="medium"
            @click="handleExport()">导出报告</el-button>
        </div>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleClick" :stretch="true">
        <el-tab-pane label="分类分级报告" name="分类分级报告">
          <div>
            <div class="hede_bgc">
              <div class="hede_bgc-text">{{ activeName }}</div>
            </div>
            <oneReport v-model="queryParams.categoryId" ref="pdfDownload" class="aaa" />
          </div>
        </el-tab-pane>
        <!-- <el-tab-pane label="数据特征报告" name="数据特征报告">
          <div class="hede_bgc">
            <div class="hede_bgc-text">{{ activeName }}</div>
          </div>
        </el-tab-pane> -->
        <el-tab-pane label="数据摸底调查表" name="数据摸底调查表">
          <div class="hede_bgc">
            <div class="hede_bgc-text">{{ activeName }}</div>
          </div>
          <dataBaseline :categoryId="queryParams.categoryId" ref="dataBaseline" />
        </el-tab-pane>
      </el-tabs>

      <!-- 添加加载提示 -->
      <el-dialog title="导出中" :visible.sync="exportLoading" :close-on-click-modal="false" :show-close="false"
        width="30%">
        <div style="text-align: center; padding: 20px;">
          <el-loading-spinner class="loading-spinner"></el-loading-spinner>
          <p style="margin-top: 15px;">{{ exportMessage }}</p>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getFrameworks, dashboardList } from "@/api/system/protectCategory";
import * as echarts from "echarts";
import "echarts-wordcloud";
import { downloadPDF } from "@/utils/pdf.js"  //工具方法，导出操作
import html2pdf from 'html2pdf.js';
import oneReport from './components/oneReport.vue';
import dataBaseline from './components/dataBaseline.vue';
export default {
  name: "Post",
  dicts: ['sys_normal_disable'],
  components: { oneReport, dataBaseline },
  data() {
    return {
      echarsLoding: false,
      // 查询参数
      queryParams: {
        categoryId: 0, // Change from '' to 0
      },
      activeName: '分类分级报告',
      allData: {},
      treeOptions: [],
      xiaohuiFlag: true,
      exportLoading: false, // 导出加载状态
      exportMessage: '正在准备导出内容，请稍候...' // 导出提示信息
    }
  },
  created() {
    this.gettreeOptionsList();
  },
  mounted() {
  },
  methods: {
    handleExport() {
      // const table = document.getElementById('table');
      // table.style.width = '100%';
      // const element = this.$refs.pdfDownload;
      // console.log(element);

      // html2pdf()
      //   .from(element)
      //   .set({
      //     // margin: 0,
      //     margin: [10, 10, 10, 10],
      //     filename: '分类分级分析报告.pdf',
      //     image: { type: 'jpeg', quality: 0.98 },
      //     html2canvas: { scale: 2 },
      //     jsPDF: { unit: 'mm', format: [280, 350], orientation: 'portrait' },
      //     pagebreak: { mode: ['avoid-all'] }
      //   })
      //   .save();
      if (this.activeName === '分类分级报告') {
        let obj = {
          title: '分类分级分析报告',
          className: 'aaa'
        }
        downloadPDF(obj)
      } else if (this.activeName === '数据摸底调查表') {
        console.log('数据摸底调查表',this.$refs.dataBaseline);
        this.$refs.dataBaseline.exportAllItems();
      }
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    gettreeOptionsList() {
      this.Loading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        if (response.data.length > 0) {
          this.queryParams.categoryId = response.data[0].id;
        }
      });
    },
    resetList() {
      this.securityTotal = 0
      this.securityTop = []
      this.dataTypeListData = []
      this.dataTypeList = []
      this.ipTop = []
      this.datasourceTop = []
      this.tableTop = []
      this.fieldTop = []
      this.tableData = []
      this.last6MonthsAddCounts = []
      this.last6MonthsConfirmCounts = []
      this.months = []
    }
  }
};
</script>
<style scoped>
.main {
  background-color: #eee;
}

.writeBgc {
  background-color: #fff;
  width: 55%;
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
  margin-top: 20px;

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
  width: 50%;
  margin-top: 20px;
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

.boxThreeMain {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 350px;
  padding: 10px 0;
  margin-top: 10px;

  h4 {
    padding: 0 0 0 5px;
    margin: 0;
  }
}

.page-break {
  page-break-before: always;
}

h4 {
  font-size: 16px !important;
}

.sort-name-count {
  width: calc(100% - 25px);
  display: inline-block;
}

.tableBox {
  width: 100%;
  /* display: flex; */
  table-layout: fixed;
  /* 确保表格宽度均匀分配 */
}

.loading-spinner {
  width: 40px;
  height: 40px;
}
</style>