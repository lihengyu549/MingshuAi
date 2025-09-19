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
import { getFrameworks } from "@/api/system/protectCategory";
import { downloadPDF } from "@/utils/pdf.js"  //工具方法，导出操作
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
        categoryId: 0,
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
      if (this.activeName === '分类分级报告') {
        let obj = {
          title: '分类分级分析报告',
          className: 'aaa'
        }
        downloadPDF(obj)
      } else if (this.activeName === '数据摸底调查表') {
        this.dataBaselineExport();
      }
    },

    async dataBaselineExport() {
      // 1. 获取子组件实例
      const dataBaselineComp = this.$refs.dataBaseline;
      if (!dataBaselineComp) return;

      // 2. 获取所有数据
      const allData = await dataBaselineComp.getAllOptionsData();
      if (allData.length === 0) {
        this.$message.warning('没有可导出的数据');
        return;
      }

      // 3. 生成HTML内容
      const htmlContent = this.generateExportHtml(allData);

      // 4. 导出为HTML文件
      this.exportToHtml(htmlContent);
    },

    // 生成导出的HTML结构（复用页面样式）
    generateExportHtml(allData) {
      // 添加完整的HTML文档结构
      let html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>数据摸底调查表</title>
  `;

      // 引入页面使用的主样式
      html += this.generateBaseStyles();

      html += `
    </head>
    <body>
      <div class="export-container" style="padding: 20px; font-family: sans-serif; max-width: 1000px; margin: 0 auto;">
  `;

      allData.forEach(item => {
        // 每个下拉项作为一个section
        html += `
      <div class="export-section" style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
        <h2 style="color: #01a7f0; margin-bottom: 15px;">${item.title}</h2>
        ${this.generateFormHtml(item.formData)}
      </div>
    `;
      });

      html += `
      </div>
    </body>
    </html>
  `;
      return html;
    },

    // 生成基础样式
    generateBaseStyles() {
      return `
      <style>
        .form-section { margin-bottom: 24px; padding: 16px; border-radius: 4px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .form-section-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 16px; padding-left: 8px; border-left: 3px solid #409eff; }
        .form-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .form-table th, .form-table td { border: 1px solid #e0e0e0; padding: 12px 16px; text-align: left; }
        .form-table th { background-color: #f5f7fa; font-weight: 500; width: 20%; }
        .form-table td { width: 80%; }
        .sub-table { margin-left: 20px; margin-top: 8px; width: calc(100% - 20px); }
        .tag { display: inline-block; padding: 2px 8px; margin-right: 8px; border-radius: 4px; font-size: 12px; }
        .tag-primary { background: #ecf5ff; color: #409eff; }
        .list-item { margin-bottom: 8px; padding: 8px; border: 1px solid #f0f0f0; border-radius: 4px; }
        .checkbox-group { display: flex; flex-wrap: wrap; gap: 16px; }
        .checkbox-item { display: inline-flex; align-items: center; }
        .checkbox-item::before { content: "☑️"; margin-right: 4px; }
      </style>
    `;
    },

    // 生成表格与页面样式完全一致的表单HTML
    generateFormHtml(formData) {
      // 基础数据信息表格
      const basicInfoTable = `
    <div class="form-section">
      <div class="form-section-title">基础数据信息</div>
      <table class="form-table">
        <tr>
          <th>数据名称</th>
          <td>${formData.dataName || '-'}</td>
        </tr>
        <tr>
          <th>拟定数据级别</th>
          <td>
            <span class="tag tag-primary">${formData.dataLevel}</span>
          </td>
        </tr>
        <tr>
          <th>数据类别</th>
          <td>${formData.dataType || '-'}</td>
        </tr>
        <tr>
          <th>数据安全责任部门</th>
          <td>${formData.deptName || '-'}</td>
        </tr>
        <tr>
          <th>数据安全负责人</th>
          <td>${formData.dataOwner || '-'}</td>
        </tr>
        <tr>
          <th>个人信息涉及情况</th>
          <td>
            <div class="checkbox-group">
              ${formData.sensitivePersonalData ? '<div class="checkbox-item">涉及敏感个人信息</div><br>' : ''}
              ${formData.noPersonalData ? '<div class="checkbox-item">涉及未成年人的个人信息</div><br>' : ''}
              ${formData.ordinaryPersonalData ? '<div class="checkbox-item">涉及一般个人信息</div><br>' : ''}
              ${formData.personalData ? '<div class="checkbox-item">不涉及</div>' : ''}
            </div>
          </td>
        </tr>
        <tr>
          <th>数据总量</th>
          <td>
            数据总量：<span class="tag tag-primary">${formData.dataSize || '-'}</span><br>
            涉及个人信息：<span class="tag tag-primary">${formData.piiCount || '-'}</span>
          </td>
        </tr>
        <tr>
          <th>数据月增长量</th>
          <td>
            <span class="tag tag-primary">${formData.monthAmountOfIncrease || '-'}</span>
          </td>
        </tr>
      </table>
    </div>
  `;

      // 数据来源
      const dataSourceTable = `
    <div class="form-section">
      <div class="form-section-title">数据来源</div>
      <table class="form-table">
        <tr>
          <th>数据的产生方式/获取方式</th>
          <td>
            <div class="checkbox-group">
              ${formData.systemGather ? '<div class="checkbox-item">系统采集</div><br>' : ''}
              ${formData.systemProduction ? '<div class="checkbox-item">系统生产</div><br>' : ''}
              ${formData.artificialFillIn ? '<div class="checkbox-item">人工填报</div><br>' : ''}
              ${formData.dealBuy ? '<div class="checkbox-item">交换购买</div><br>' : ''}
              ${formData.shareExchange ? '<div class="checkbox-item">共享交换</div><br>' : ''}
              ${formData.other ? `<div class="checkbox-item">其他: ${formData.otherInput}</div>` : ''}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

      // 单位间数据流转情况表格
      let dataSourcesHtml = '';
      formData.dataSources.forEach((item, index) => {
        dataSourcesHtml += `
      <tr>
        <th>来源 ${index + 1}</th>
        <td>${item.content || '-'}</td>
      </tr>
    `;
      });
      // 数据流出表格
      let dataflowHtml = '';
      formData.dataflow.forEach((item, index) => {
        dataflowHtml += `
      <tr>
        <th>流转节点 ${index + 1}</th>
        <td>${item.content || '-'}</td>
      </tr>
    `;
      });
      const dataFlowTable = `
        <div class="form-section">
          <div class="form-section-title">单位间数据流转情况</div>
          ${dataSourcesHtml ? `
            <table class="form-table">
              <tr><th colspan="2">数据来源单位</th></tr>
              ${dataSourcesHtml}
            </table>
          ` : ''}
        </div>
        <div class="form-section">
          ${dataflowHtml ? `
            <table class="form-table">
              <tr><th colspan="2">数据流出单位</th></tr>
              ${dataflowHtml}
            </table>
          ` : ''}
        </div>
      `;

      // 与其他数据处理者的交互表格
      const interactionTable = `
    <div class="form-section">
      <div class="form-section-title">与其他数据处理者的交互</div>
      <table class="form-table">
        <tr>
          <th>交互类型</th>
          <td>
            <div class="checkbox-group">
              ${formData.externalProvisionBox ? `<div class="checkbox-item">对外提供给: ${formData.externalProvision || '-'}</div><br>` : ''}
              ${formData.entrustBox ? `<div class="checkbox-item">委托: ${formData.entrust || '-'}</div><br>` : ''}
              ${formData.jointDisposalBox ? `<div class="checkbox-item">与....共同处理: ${formData.jointDisposal || '-'}</div><br>` : ''}
              ${formData.noInteraction ? '<div class="checkbox-item">无交互</div>' : ''}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

      // 数据存储位置表格
      const storageLocationTable = `
    <div class="form-section">
      <div class="form-section-title">数据存储位置</div>
      <table class="form-table">
        <tr>
          <th>云类型</th>
          <td>
            <div class="checkbox-group">
              ${formData.privateCloudBox ? `<div class="checkbox-item">私有云: ${formData.privateCloud || '-'}</div>` : ''}
              ${formData.publicCloudBox ? `<div class="checkbox-item">公有云: ${formData.publicCloud || '-'}</div>` : ''}
              ${formData.mixtureCloudBox ? `<div class="checkbox-item">混合云: ${formData.mixtureCloud || '-'}</div>` : ''}
              ${formData.governmentCloudBox ? `<div class="checkbox-item">政务云: ${formData.governmentCloud || '-'}</div>` : ''}
              ${formData.noCloudComputingPlatformBox ? `<div class="checkbox-item">非云计算平台: ${formData.noCloudComputingPlatform || '-'}</div>` : ''}
            </div>
          </td>
        </tr>
      </table>

      <table class="form-table">
        <tr>
          <th>机房类型</th>
          <td>
            <div class="checkbox-group">
              ${formData.thisUnitMachineRoomBox ? `<div class="checkbox-item">本单位机器机房: ${formData.thisUnitMachineRoom || '-'}</div>` : ''}
              ${formData.outerUnitMachineRoomBox ? `<div class="checkbox-item">外部单位机器机房: ${formData.outerUnitMachineRoom || '-'}</div>` : ''}
              ${formData.thirdPartyTrusteeshipMachineRoomBox ? `<div class="checkbox-item">第三方托管机房: ${formData.thirdPartyTrusteeshipMachineRoom || '-'}</div>` : ''}
            </div>
          </td>
        </tr>
      </table>

      <table class="form-table">
        <tr>
          <th>存储地域</th>
          <td>
            <div class="checkbox-group">
              ${formData.domesticBox ? `<div class="checkbox-item">境内: ${formData.domestic || '-'}</div>` : ''}
              ${formData.overseasBox ? `<div class="checkbox-item">境外: ${formData.overseas || '-'}</div>` : ''}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

      // 组合所有表格部分    
      return basicInfoTable + dataSourceTable + dataFlowTable + interactionTable + storageLocationTable;
    },

    // 导出为HTML文件
    exportToHtml(htmlContent) {
      // 创建Blob对象
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '数据摸底调查表.html';
      document.body.appendChild(a);

      // 触发下载
      a.click();

      // 清理资源
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
  background-position: 0 60%;
  background-repeat: no-repeat;
  position: relative;
}

.hede_bgc-text {
  font-size: 48px;
  text-align: center;
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  z-index: 1;
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
  table-layout: fixed;
}

.loading-spinner {
  width: 40px;
  height: 40px;
}
</style>