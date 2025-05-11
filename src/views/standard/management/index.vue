<!-- 分类分级标准---标准管理 -->

<template>
  <div class="app-container" v-loading="mainLoading">
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small" :inline="true"
      label-width="auto">
      <el-form-item label="标准编号" prop="standardId">
        <el-input v-model="queryParams.standardId" @input="inputSearch" placeholder="请输入标准编号" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="标准名称" prop="standardName">
        <el-input v-model="queryParams.standardName" @input="inputSearch" placeholder="请输入标准名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="标准类型" prop="standardType">
        <el-select clearable v-model="queryParams.standardType" @change="inputSearch" placeholder="请选择">
          <el-option v-for="item in dict.type.sys_standard_type" :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="行业类别" prop="industryCategory">
        <el-input v-model="queryParams.industryCategory" @input="inputSearch" placeholder="请输入行业类别" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item class="searchBtn">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="medium" @click="managementImport">标准导入</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <div class="listBox">
      <div class="listBox_item" v-for="item in proxysList">
        <div class="listBox_title">
          <div style="font-weight: 700; font-size: 18px;">{{ item.standardId }}</div>
          <div>实施时间：{{ item.implementTime }}</div>
        </div>
        <div class="listBox_body">
          <el-tooltip class="item" effect="dark" :content="item.categoryName" placement="top-start">
            <div class="listBox_itemTitle">{{ item.categoryName }}</div>
          </el-tooltip>
          <div style="font-size: 14px; display: flex; justify-content: space-between;align-items: center;">
            <span></span>
            <el-tooltip class="item" effect="dark" :content="item.source" placement="top-start">
              <span class="listBox_msg">来源：{{ item.source }}</span>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" :content="item.industryCategory" placement="top-start">
              <span class="listBox_msg">行业类别：{{ item.industryCategory }}</span>
            </el-tooltip>
            <span></span>
          </div>
          <div
            style="margin-top: 20px;text-align: center; display: flex; justify-content: center; align-items: center;">

            <el-tag class="div_btn" size="medium" style="border: none;" color="#e53416" round>{{ item.standardTypeName
            }}</el-tag>
            <el-tag class="div_btn" size="medium" style="border: none;" color="#1890ff" round>{{ item.current
            }}</el-tag>
            <el-tag class="div_btn" size="medium" style="border: none;" color="#a9a9a9" round>{{ item.dataSource
            }}</el-tag>
          </div>
          <div class="listBox_btn">
            <el-button type="text" size="medium" @click="editFn(item)">编辑</el-button>
            <el-button type="text" size="medium" @click="detailFn(item)">详情</el-button>
            <el-button type="text" size="medium" :disabled="item.dataSource === '内置'"
              @click="deleteFn(item)">删除</el-button>
          </div>
        </div>
      </div>
    </div>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :pageSizes="[6]"
      :limit.sync="queryParams.pageSize" @pagination="getList" />
    <!-- 添加或修改数据库代理对话框 -->
    <el-dialog class="addMsg" :title="title" v-loading="formLoading" :visible.sync="open" width="580px" append-to-body
      :close-on-click-modal="false">
      <el-form ref="addForm" :model="form" :rules="rules" label-width="auto" @submit.native.prevent class="importForm">
        <el-form-item label="标准名称" prop="categoryName" :rules="rules.tasksName">
          <el-input v-model="form.categoryName" maxlength="50" placeholder="请输入标准名称" />
        </el-form-item>
        <el-form-item label="标准编号" prop="standardId" :rules="rules.tasksName">
          <el-input v-model="form.standardId" maxlength="50" placeholder="请输入标准编号" />
        </el-form-item>
        <el-form-item label="标准类型" prop="standardType">
          <el-select clearable v-model="form.standardType" @change="inputSearch" placeholder="请选择">
            <el-option v-for="item in dict.type.sys_standard_type" :key="item.value" :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="实施时间" prop="implementTime">
          <el-date-picker class="managementDate" v-model="form.implementTime" type="date" value-format="yyyy-MM-dd"
            format="yyyy-MM-dd" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="来源" prop="source">
          <el-input v-model="form.source" maxlength="50" placeholder="请输入来源" />
        </el-form-item>
        <el-form-item label="行业类别" prop="industryCategory">
          <el-input v-model="form.industryCategory" maxlength="50" placeholder="请输入行业类别" />
        </el-form-item>
        <el-form-item label="导入标准" prop="importFile" class="uploadClassName">
          <el-input v-model="form.importFile" readonly placeholder="支持EXCEL格式文件导入（.xls, .xlsx)"></el-input>
        </el-form-item>
        <el-form-item class="uploadClass">
          <el-upload ref="uploadRef" class="upload-demoupload-demo" :limit="1" :file-list="fileList"
            :auto-upload="false" :http-request="submitForm" action="" accept=".xls,.xlsx" :show-file-list="false"
            :on-change="handleFileChange" :on-exceed="handleFileExceed">
            <el-button size="mini" type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <el-button style="margin-left: 100px;" size="small" type="text" @click="downloadFile" id="btnDownload"
        icon="el-icon-download">样例下载</el-button>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="closeFn">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getScanCompleteData,
  getTasksListByName,
  verifyTasksName,
} from "@/api/system/proxys";
import { getStandardByList, categoryImport, selectStandardNameVerification, updateStandardById, deleteStandardById } from "@/api/standard"
import dict from "@/utils/dict";
import {
  listByDataType
} from "@/api/dictData";
export default {
  name: "management",
  dicts: ['sys_standard_type', 'sys_classification_state'],
  data() {
    return {
      currentList: [
      ],
      // 总条数
      total: 0,
      // 表格数据
      proxysList: [],
      fileList: [],//文件数据
      drawerData: null,
      mainLoading: false,
      aiAnalyticsEngine: '1',
      databaseTypeList: [],
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 6,
        sourceType: '',
        sourceName: '',
        businessName: '',
        proxyId: '',
        publishStatus: '',
        maskComplete: '',
        projectId: '',

      },
      // 表单参数
      form: {
        standardType: '',
        standardId: '',
        categoryName: '',
        implementTime: '',
        source: '',
        industryCategory: '',
        importFile: '',
      },
      // 表单校验
      rules: {
        standardType: [
          { required: true, message: "标准类型不能为空", trigger: "blur" },
        ],
        // standardId: [
        //   { required: true, message: "标准编号不能为空", trigger: "blur" },
        // ],
        categoryName: [{
          required: true, message: "标准名称不能为空", trigger: "blur"
        }],
        // implementTime: [{
        //   required: true, message: "实施时间不能为空", trigger: "blur"
        // }],
        source: [{
          required: true, message: "来源不能为空", trigger: "blur"
        }],
        industryCategory: [{
          required: true, message: "行业类别不能为空", trigger: "blur"
        }],
        importFile: [{
          required: true, validator: this.validateRuleContent, message: "请上传导入标准文件", trigger: "blur"
        }],
      },
      debounceTimeout: null,
      formLoading: false,
    };
  },

  created() {
    this.getList()
    this.getDictData()
  },
  mounted() {
  },
  methods: {

    // 自定义校验规则
    validateRuleContent(rule, value, callback) {
      if (this.form.importFile) {
        callback();
      } else {
        callback(new Error("至少需要一条规则内容"));
      }
    },
    handleFileExceed(files, fileList) {
      this.$refs.uploadRef.clearFiles();
      this.$nextTick(() => {
        this.$refs.uploadRef.handleStart(files[0]); // 开始上传新文件
      });
    },
    handleFileChange(file, fileList) {
      this.form.importFile = file.name
      this.fileList = fileList;
    },
    // 标准导入
    managementImport() {
      this.reset()
      this.open = true
      this.title = '新增'
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 样例下载
    downloadFile() {
      const link = document.createElement('a');
      link.href = '/file.xlsx'; // 替换为你的文件路径
      link.download = '分类分级框架模板.xlsx'; // 设置下载后的文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // 获取新增任务中 数据源名称
    getScanCompleteDataFn(id) {
      getScanCompleteData({ editId: id || '' }).then((res) => {
        this.databaseTypeList = res.data
      })
    },
    async getNameTestingFn() {
      let params = {
        categoryName: this.form.categoryName,
        id: this.form.id || ''
      }
      let res = await selectStandardNameVerification(params)
      return res.code == 200
    },
    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}个`)
    },
    editFn(row) {
      this.open = true
      this.title = '编辑'
      this.form = JSON.parse(JSON.stringify(row))
      this.form.importFile = row.fileName
    },
    detailFn(row) {
      this.$router.push({ path: '/standard/jobMonitorings', query: { id: row.id } })
    },
    deleteFn(row) {
      this.$confirm(`删除任务，将会删除数据源所关联的所有执行结果,确定删除吗`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteStandardById({ id: row.id }).then(res => {
          if (res.code == 200) {
            this.$message.success(res.msg)
            this.getList()
          }
        })
      })
    },
    getDictData() {
      listByDataType({ type: 'sys_standard_type' }).then(res => {
        this.currentList = res.data;
      })
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.treeID = this.categoryList[0].id
      this.$refs.tree.setCurrentKey(this.treeID);
      this.resetForm("queryParams");
      this.handleQuery();
    },
    /** 提交按钮 */
    async submitForm() {
      this.$refs["addForm"].validate(async (valid) => {
        if (valid) {
          if (!await this.getNameTestingFn()) {
            return
          }
          this.formLoading = true
          const formData = new FormData();
          if (this.form.id) {
            formData.append('id', this.form.id || '');
          }
          // 将文件数组添加到 FormData 对象中
          if (this.fileList && this.fileList.length) {
            formData.append('file', this.fileList[0].raw);
          }
          formData.append('file', this.fileList[0].raw);
          formData.append('categoryName', this.form.categoryName);
          formData.append('inner', this.form.inner || '');
          formData.append('standardId', this.form.standardId);
          formData.append('standardType', this.form.standardType);
          formData.append('implementTime', this.form.implementTime);
          formData.append('source', this.form.source);
          formData.append('industryCategory', this.form.industryCategory);
          await categoryImport(formData).then(res => {
            this.messsucc(res, '导入条目数量共');
            // this.getList();
            this.fileList = []
            this.reset()
            this.open = false
            this.gettreeOptionsList()
            this.formLoading = false
          })
            .catch((err) => {
              this.formLoading = false
            })

        }
      });
    },
    closeFn() {
      this.open = false
      this.reset()
    },
    // 定时器，防抖使用
    inputSearch(data) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleQuery()
      }, 500); // 设置防抖的时间间隔为300毫秒
    },
    /** 查询数据库代理列表 */
    getList() {
      // this.mainLoading = true;
      getStandardByList(this.queryParams).then(response => {
        this.proxysList = response.data.rows;
        this.total = response.data.total;
        this.mainLoading = false;
      });
    },
    reset() {
      // 使用 Object.keys() 处理可枚举属性
      Object.keys(this.form).forEach(key => {
        this.form[key] = '';
      });
      // this.$set(this.form, 'confirm', "0")
    },
    // 执行状态中文
    stateMsg(val) {
      let msg = ''
      for (let item of this.executeStatus) {
        if (item.value == val) {
          msg = item.label
        }
      }
      return msg
    },
    getColorFn(row) {
      for (let item of this.currentList) {
        if (row == item.dictLabel) {
          return item.cssClass
        }
      }
    }
  }
};
</script>
<style>
input[aria-hidden=true] {
  display: none !important;
}
</style>
<style scoped>
.addMsg /deep/ .el-input--medium {
  width: 237px;
}

.addMsg /deep/ .el-dialog:not(.is-fullscreen) {
  margin-top: 10% !important;
}

.addMsg /deep/ .el-dialog__body {
  padding-bottom: 0;

}

.addMsg /deep/ .el-dialog__footer {
  padding-bottom: 32px;

}

.addMsg /deep/ .el-form-item__label {
  text-align: left;
}

.success {
  color: #67c23a;
}

.addMsg /deep/ .el-input {
  width: 100%;
}

.addMsg /deep/ .el-select {
  width: 100%;
}

.addMsg .el-select /deep/ .el-input {
  width: 100%;
}

.yuanDataClass {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.yuanDataClass /deep/ .el-form-item {
  width: 30%;
}

.yuanDataClass /deep/ .el-form-item__label {
  width: 25%;
}

.yuanDataClass /deep/ .el-form-item__content {
  width: 75%;
}

.yuanDataClass /deep/ .el-select {
  width: 100%;
}

.searchBtn {
  margin-left: auto;
  height: 100%;
}

.searchBtn /deep/ .el-form-item__content {
  margin-left: 263px
}

.importForm .el-form-item {
  width: 70%;
}

.uploadClassName {
  display: inline-block;
}

.uploadClass {
  width: 20% !important;
  display: inline-block;
}

.uploadClass /deep/ .el-form-item__content {
  margin-left: 30px !important;
}

.btnText {
  color: #1890FF;
}

.btnText:hover {
  cursor: pointer;
}

.listBox {
  max-height: 700px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  overflow-y: auto;
  background-color: #fefefe;
  padding: 40px 20px;
  margin-top: 20px;
}

.listBox::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.listBox::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.listBox::-webkit-scrollbar-track {
  border-radius: 10px;
}

.listBox_item {
  width: 30%;
  height: 250px;
  background-color: #fff;
  /* 添加立体阴影 */
  box-shadow: 5px 5px 10px 1px rgba(141, 141, 141, 0.5);
  margin-bottom: 20px;
  border-radius: 10px;
}

.listBox_item:nth-child(2) {
  margin: 0 60px;
}

.listBox_item:nth-child(5) {
  margin: 0 60px;
}

.listBox_title {
  background-color: #f1fafe;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.listBox_body {
  padding: 20px;
}

.div_btn {
  /* padding: 10px; */
  margin-right: 10px;
  width: 80px;
  height: 30px;
  line-height: 30px;
  border-radius: 15px;
  color: rgb(255, 255, 255);
}

.listBox_btn {
  text-align: right;
  margin-top: 10px;
}

.listBox_itemTitle {
  width: 100%;
  text-align: center;
  margin-bottom: 15px;
  padding: 10px 0;
  white-space: nowrap;
  /* 文字不换行 */
  overflow: hidden;
  /* 隐藏超出部分 */
  text-overflow: ellipsis;
  /* 超出部分显示为省略号 */
}

.listBox_msg {

  width: 100%;
  white-space: nowrap;
  /* 文字不换行 */
  overflow: hidden;
  /* 隐藏超出部分 */
  text-overflow: ellipsis;
  /* 超出部分显示为省略号 */
}
</style>
