<!-- 分类分级标准---标准管理 -->

<template>
  <div class="app-container management-container" v-loading="mainLoading">
    <el-card class="searchCard" shadow="hover">
      <el-form :model="queryParams" ref="queryParams" v-show="showSearch" class="yuanDataClass" size="small"
        :inline="true" label-width="auto">
        <!-- <el-form-item label="标准编号" prop="standardDescription">
        <el-input v-model="queryParams.standardDescription" @input="inputSearch" placeholder="请输入标准编号" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item> -->
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
        <!-- <el-form-item class="searchBtn">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item> -->
      </el-form>
    </el-card>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="medium" @click="managementImport">标准导入</el-button>
        <!-- <el-button type="primary" plain size="medium" @click="push">智能生成</el-button> -->
      </el-col>
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>
    <div class="listBox">
      <el-card class="listBox_item" v-for="item in proxysList" :key="item.id" shadow="hover"
        :body-style="{ display: 'flex', flexDirection: 'column', height: '100%' }">
        <div class="card-header">
          <svg-icon icon-class="dunpai-2" class="card-icon"></svg-icon>
          <div class="card-title-area">
            <!-- <el-tooltip effect="dark" :content="item.categoryName" placement="top-start"> -->
            <h3 class="card-title">{{ item.categoryName }}</h3>
            <!-- </el-tooltip> -->
            <div class="card-tags">
              <el-tag size="small" type="primary">{{ item.standardTypeName }}</el-tag>
              <el-tag size="small" type="info">现行</el-tag>
              <el-tag size="small" type="info">{{ item.dataSource }}</el-tag>
            </div>
          </div>
        </div>
        <p class="card-desc" style="flex: 1;">{{ item.standardDescription || '' }}</p>
        <div class="card-info">
          <span>{{ item.industryCategory }}</span>
          <span>{{ item.implementTime }}实施</span>
        </div>
        <div class="card-actions">
          <el-button type="text" size="small" class="btn-delete" @click="deleteFn(item)">
            <i class="el-icon-delete"></i> 删除
          </el-button>
          <el-button type="text" size="small" class="btn-primary" :disabled="item.dataSource === '内置'"
            @click="editFn(item)">
            <i class="el-icon-edit-outline"></i> 编辑
          </el-button>
          <el-button type="text" size="small" class="btn-primary" @click="detailFn(item)">
            <i class="el-icon-warning-outline"></i> 查看详情
          </el-button>
        </div>
      </el-card>
      <div v-if="proxysList.length == 0" style="margin: 0 auto;">
        <el-empty description="暂无数据"></el-empty>
      </div>
    </div>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :pageSizes="[8]"
      :page-size.sync="queryParams.pageSize" @pagination="getList" />
    <!-- 添加或修改数据库代理对话框 -->
    <el-dialog class="custom-dialog" :title="title" v-loading="formLoading" :visible.sync="open" append-to-body
      :close-on-click-modal="false" width="700px">
      <el-form ref="addForm" :model="form" :rules="rules" label-width="auto" @submit.native.prevent class="importForm"
        label-position="top">
        <!-- <Title title="基本信息" /> -->
        <el-form-item label="标准名称" prop="categoryName" :rules="rules.tasksName">
          <el-input v-model="form.categoryName" maxlength="50" placeholder="请输入标准名称" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="标准类型" prop="standardType">
              <el-select clearable v-model="form.standardType" @change="inputSearch" placeholder="请选择">
                <el-option v-for="item in dict.type.sys_standard_type" :key="item.value" :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="行业类别" prop="industryCategory">
              <el-input v-model="form.industryCategory" maxlength="50" placeholder="请输入行业类别" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="标准来源" prop="source">
              <el-input v-model="form.source" maxlength="50" placeholder="请输入来源" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标准实施时间" prop="implementTime">
              <el-date-picker class="managementDate" v-model="form.implementTime" type="date" value-format="yyyy-MM-dd"
                format="yyyy-MM-dd" placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="标准描述" prop="standardDescription" :rules="rules.tasksName">
              <el-input type="textarea" v-model="form.standardDescription" maxlength="1000" placeholder="请输入标准描述" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="导入标准" prop="importFile" class="uploadClassName">
              <el-input v-model="form.importFile" readonly placeholder="支持EXCEL格式文件导入（.xls, .xlsx)"></el-input>
              <el-upload ref="uploadRef" class="upload-demoupload-demo" :limit="1" :file-list="fileList"
                :auto-upload="false" :http-request="submitForm" action="" accept=".xls,.xlsx" :show-file-list="false"
                :on-change="handleFileChange" :on-exceed="handleFileExceed">
                <el-button size="mini" type="primary" plain>选择文件</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="drawer-footer">
        <el-button style="margin-left: 15px;" size="small" type="text" @click="downloadFile" id="btnDownload"
          icon="el-icon-download">样例下载</el-button>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" plain @click="submitForm">确 定</el-button>
          <el-button @click="closeFn">取消</el-button>
        </div>
      </div>
    </el-dialog>
    <!-- <el-dialog class="addMsg" :title="title" v-loading="formLoading" :visible.sync="open" width="580px" append-to-body
      :close-on-click-modal="false">
      <el-form ref="addForm" :model="form" :rules="rules" label-width="auto" @submit.native.prevent class="importForm">
        <el-form-item label="标准名称" prop="categoryName" :rules="rules.tasksName">
          <el-input v-model="form.categoryName" maxlength="50" placeholder="请输入标准名称" />
        </el-form-item>
        <el-form-item label="标准编号" prop="standardDescription" :rules="rules.tasksName">
          <el-input v-model="form.standardDescription" maxlength="50" placeholder="请输入标准编号" />
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
    </el-dialog> -->
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
        pageSize: 8,
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
        standardDescription: '',
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
        standardDescription: [
          { required: true, message: "标准描述不能为空", trigger: "blur" },
        ],
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
    // 跳转
    push() {
      this.$router.push({ path: '/standard/hierarchicalStructure' })
    },
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
      this.$router.push({ path: '/standard/jobMonitoring', query: { id: row.id, dataSource: row.dataSource } })
    },
    deleteFn(row) {
      this.$confirm(`删除任务，将会删除数据源所关联的所有执行结果,确定删除吗`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteStandardById({ id: row.id }).then(res => {
          if (res.code == 200) {
            this.$message.success(res.msg);

            // 检查当前页是否只剩一条数据
            const isLastItem = this.proxysList.length === 1;
            // 检查是否是第一页（第一页不需要向前跳转）
            const isFirstPage = this.queryParams.pageNum === 1;

            // 如果是最后一条且不是第一页，删除后跳转到上一页
            if (isLastItem && !isFirstPage) {
              this.queryParams.pageNum--;
            }

            this.getList(); // 重新获取列表数据
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
          formData.append('categoryName', this.form.categoryName);
          formData.append('inner', this.form.inner || '');
          formData.append('standardDescription', this.form.standardDescription);
          formData.append('standardType', this.form.standardType);
          if (this.form.implementTime) {
            formData.append('implementTime', this.form.implementTime);
          }
          formData.append('source', this.form.source);
          formData.append('industryCategory', this.form.industryCategory);
          await categoryImport(formData).then(res => {
            this.$message.success('操作成功');
            // this.getList();
            this.fileList = []
            this.reset()
            this.open = false
            this.handleQuery()
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

/deep/.searchCard {
  border-radius: 10px;
  margin-bottom: 30px;
}

.yuanDataClass {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.yuanDataClass /deep/ .el-form-item {
  width: 30%;
  margin-bottom: 0px;
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

.custom-dialog {
  .el-dialog {
    border-radius: 10px;
  }

  .el-dialog__header {
    border-bottom: 1px solid #e6e6e6;
  }
}

.importForm /deep/.el-form-item,
.importForm /deep/.el-form-item__content,
.importForm /deep/.el-select,
.importForm /deep/.el-date-editor {
  width: 100%;
}

.importForm /deep/.el-form-item__content {
  padding-right: 15px;
}

.uploadClassName /deep/.el-form-item__content {
  display: flex;
  justify-content: space-between;
}

.upload-demoupload-demo {
  margin-left: 15px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
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
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  background-color: #fafafa;
  padding: 30px 0px;
  gap: 20px;
  overflow: auto;
}

.listBox_item {
  width: calc((100% - 60px) / 4);
  height: 280px;
  background-color: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid #f1f5f9;
  box-sizing: border-box;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
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

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.card-icon {
  width: 50px;
  height: 50px;
  margin-right: 15px;
  background-color: #e1f2fe;
  padding: 8px;
  border-radius: 8px;
}

.card-title-area {
  flex: 1;
  overflow: hidden;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card-tags .el-tag {
  height: 22px;
  line-height: 20px;
  padding: 0 8px;
  font-size: 12px;
}

.card-desc {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  min-height: 0;
}

.card-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.card-actions {
  display: flex;
  padding-top: 12px;
  border-top: 1px solid #e6e6e6;
  justify-content: space-between;
}

.card-actions .el-button {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 6px;
}

.card-actions .btn-delete {
  color: #909399;
}

.card-actions .btn-delete:hover {
  background-color: #fef0f0;
  color: #f56c6c;
}

.card-actions .btn-primary {
  color: #606266;
}

.card-actions .btn-primary:hover {
  background-color: #ecf5ff;
  color: #3b82f6;
}

.management-container {
  container-type: size;
  container-name: management;
}

@media screen and (max-width: 768px) {
  .yuanDataClass /deep/ .el-form-item {
    width: 100%;
    margin-bottom: 10px;
  }

  .yuanDataClass /deep/ .el-form-item__label {
    width: auto;
    padding-right: 10px;
  }

  .yuanDataClass /deep/ .el-form-item__content {
    width: 100%;
  }
}

@container management (max-height: 800px) {
  .listBox {
    max-height: 400px;
  }
}
</style>