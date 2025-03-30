<template>
  <div class="app-container" v-loading="mainLoading">
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small" :inline="true"
      label-width="auto">
      <el-form-item label="任务名称" prop="tasksName">
        <el-input v-model="queryParams.tasksName" @input="inputSearch" placeholder="请输入数据源名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="数据源类型" prop="sourceType">
        <el-select clearable v-model="queryParams.sourceType" @change="inputSearch" placeholder="请选择数据库类型">
          <el-option v-for="item in dataYTpeList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="来源业务系统" prop="businessName">
        <el-input v-model="queryParams.businessName" @input="inputSearch" placeholder="请输入数据源名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item label="分类分级框架" prop="projectId">
        <el-select clearable v-model="queryParams.projectId" @change="inputSearch" placeholder="请选择分类分级框架">
          <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="maskComplete">
        <el-select clearable v-model="queryParams.maskComplete" @change="inputSearch" placeholder="请选择扫描状态">
          <el-option v-for="item in executeStatus" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="发布状态" prop="publishStatus">
        <el-select clearable v-model="queryParams.publishStatus" @change="inputSearch" placeholder="请选择扫描状态">
          <el-option v-for="item in publishStatus" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="searchBtn">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="medium" @click="handleAdd">新增任务</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-close" size="medium" @click="deleteFn">删除任务</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="proxysList" @selection-change="handleSelectionChange" ref="tableRef">
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="任务名称" align="center" prop="tasksName" />
      <el-table-column label="数据源" align="center" prop="sourceName" />
      <el-table-column label="来源业务系统" align="center" prop="businessName" />
      <el-table-column label="来源业务系统" align="center" prop="projectName" />
      <el-table-column label="AI分析引擎" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.aiAnalyticsEngine == 1 ? '快速响应' : '深度思考' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务字段数" align="center" prop="fieldCount" />
      <el-table-column label="执行状态" align="center" prop="maskComplete">
        <template slot-scope="scope">
          <span>{{ stateMsg(scope.row.maskComplete) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布状态" align="center" prop="publishStatus">
        <template slot-scope="scope">
          <span>{{ scope.row.publishStatus == 0 ? '未发布' : '已发布' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" />
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="implementFn(scope.row)">执行</el-button>
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button size="mini" type="text" @click="resultLookFn(scope.row)">结果查看</el-button>
          <el-button size="mini" type="text" :disabled="scope.row.publishStatus == 1"
            @click="resultReleaseFn(scope.row)">结果发布</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <!-- 添加或修改数据库代理对话框 -->
    <el-dialog class="addMsg" :title="title" :visible.sync="open" width="580px" append-to-body
      :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="auto" @submit.native.prevent>
        <el-form-item label="任务名称" prop="tasksName" :rules="rules.tasksName">
          <el-input v-model="form.tasksName" @blur="getNameTestingFn(form.tasksName)" maxlength="50"
            placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="数据源名称" prop="id" :rules="rules.id">
          <el-select v-model="form.id" clearable @change="projectChangeEdit($event)">
            <el-option v-for="item in databaseTypeList" :key="item.id" :label="item.sourceName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类分级框架">
          <el-input v-model="form.projectName" :disabled="true" />
        </el-form-item>
        <el-form-item label="ai分析引擎" prop="aiAnalyticsEngine">
          <el-radio-group v-model="form.aiAnalyticsEngine">
            <el-radio label="1">快速响应</el-radio>
            <el-radio label="2">深度思考</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="置信度" prop="confidenceLevel" :rules="rules.confidenceLevel">
          <el-select v-model="form.confidenceLevel" clearable>
            <el-option v-for="item in confidenceLevelList" :key="item.id" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="人工确认" prop="confirm" :rules="rules.confirm">
          <el-select v-model="form.confirm" clearable>
            <el-option v-for="item in confirmList" :key="item.id" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="closeFn">取消</el-button>
      </div>
    </el-dialog>
    <el-drawer title="结果查看" class="dialogClass" :visible.sync="drawerShow" :destroy-on-close="true" direction="rtl"
      size="80%" :before-close="handleClose">
      <Result :treeOptions="treeOptions" :drawerData="drawerData" />
    </el-drawer>
  </div>
</template>

<script>
import {
  importExcel, publish, createProxys, databaseMaskI, strategyAll, databaseMask, databaseListI,
  getScanCompleteData,
  addScanCompleteDataTasks,
  deleteScanCompleteDataTasks,
  editScanCompleteDataTasks,
  dataMark,
  getTasksListByName,
  verifyTasksName,
} from "@/api/system/proxys";
import {
  treeListI, categoryImport, getAttachData, attachStatus,
  forceLogout, updataAttach, nameTesting, addData, getFrameworks,
} from "@/api/system/protectCategory"
import Result from './components/result.vue'
import Vue from 'vue';
export default {
  name: "Proxys",
  components: { Result },
  data() {
    return {
      treeOptions: [],
      drawerShow: false,
      drawerData: null,
      mainLoading: false,
      confidenceLevelList: [
        { name: "低", id: 0, value: "0" },
        { name: "中", id: 1, value: "1" },
        { name: "高", id: 2, value: "2" },
      ],
      confirmList: [
        { name: "全部", id: 0, value: "0" },
        { name: "未确认", id: 1, value: "1" },
        { name: "已确认", id: 2, value: "2" },
      ],
      dataYTpeList: [
        {
          value: 'DATABASE',
          label: '数据库'
        }, {
          value: 'FILE',
          label: 'Excel表'
        }
      ],
      databaseTypeList: [],
      publishStatus: [
        {
          value: 0,
          label: '未发布'
        }, {
          value: 1,
          label: '已发布'
        },
      ],
      executeStatus: [
        {
          value: 'COMPLETE',
          label: '执行完成'
        }, {
          value: 'RUNNING',
          label: '执行中'
        }, {
          value: 'NONE',
          label: '待执行'
        }, {
          value: 'ERR',
          label: '执行失败'
        }
      ],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 数据库代理表格数据
      proxysList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
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
        aiAnalyticsEngine: "1",
        confidenceLevel: '',
        confirm: '',
        projectName: '',
        tasksName: '',
        id: '',
      },
      // 表单校验
      rules: {
        tasksName: [
          { required: true, message: "任务名称不能为空", trigger: "blur" },
        ],
        id: [
          { required: true, message: "数据源名称不能为空", trigger: "blur" },
        ],
        confidenceLevel: [{
          required: true, message: "置信度不能为空", trigger: "blur"
        }],

        confirm: [{
          required: true, message: "人工确认状态不能为空", trigger: "blur"
        }],
      },
      debounceTimeout: null,
    };
  },

  created() {
    this.gettreeOptionsList()
    this.getList()
    this.getScanCompleteDataFn()
  },
  methods: {
    // 获取新增任务中 数据源名称
    getScanCompleteDataFn() {
      getScanCompleteData().then((res) => {
        this.databaseTypeList = res.data
      })
    },
    getNameTestingFn(val, from) {
      this.importDataLoading = true
      let params = {
        tasksName: val,
        id:this.form.id || ''
      }
      if (val) {
        verifyTasksName(params).then((res) => {
          return res.msg == '可以使用'
        })
          .catch((err) => {
            this.form.tasksName = ''
            this.importDataLoading = false
            return false
          })
      } else {
        this.form.tasksName = ''
        this.importDataLoading = false
        return false
      }
    },
    gettreeOptionsList() {
      this.mainLoading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        this.mainLoading = false
      });
    },
    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}个`)
    },
    handleClose() {
      this.drawerShow = false
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
    implementFn(row) {
      if(row.maskComplete== 'RUNNING'){
        this.$message({
          message: '当前任务执行中，请等待执行完成后再执行',
          type: 'warning'
        })
        return
      } 
      if (row.maskComplete !== 'NONE') {
        this.$confirm(`重新执行任务前，⚠️ 请注意任务细节，否则可能将会覆盖改数据源上一次执行的所有结果`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          dataMark(row.id).then(res => {
            if (res.code == 200) {
              this.$message.success(res.msg)
              this.getList()
            }
          })
        })
        return
      } else {
        this.$confirm(`确定执行所选中的项吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          dataMark(row.id).then(res => {
            if (res.code == 200) {
              this.$message.success(res.msg)
              this.getList()
            }
          })
        })
      }
    },

    projectChangeEdit(e) {
      this.databaseTypeList.forEach((item) => {
        if (item.id == e) {
          this.form.projectName = item.projectName
        }
      })
    },
    /** 查询数据库代理列表 */
    getList() {
      this.loading = true;
      getTasksListByName(this.queryParams).then(response => {
        this.proxysList = response.rows;
        // for (let item of this.proxysList) {
        //   item.showTag = 0
        //   item.oldPassword = item.targetUserPassword
        //   item.targetUserPassword = '******'
        // }
        this.total = response.total;
        this.loading = false;
      });
    },
    reset() {
      this.form = {}      
      this.form.aiAnalyticsEngine = '1'
      this.form.projectName = ''
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.projectId = null
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加任务";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.form = JSON.parse(JSON.stringify(row));
      this.open = true;
      this.title = "修改任务";
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.isAddTasks === '1') {
            editScanCompleteDataTasks(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            let data = JSON.parse(JSON.stringify(this.form))
            addScanCompleteDataTasks(data).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    deleteClick() {
      let params = {
        ids: this.ids.join(',')
      }
      deleteScanCompleteDataTasks(params).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { })
    },
    deleteFn() {
      let dataS = this.$refs.tableRef.selection
      let flagList // 为1 代表选中数据中有执行中的，2为没有执行中，但是有执行完成的
      if (dataS && dataS.length > 0) {
        flagList = dataS.map(item => {
          return item.maskComplete
        })
        if (flagList.includes('RUNNING')) {
          this.$message({ message: '选中任务包含执行中任务，无法批量删除', type: 'warning' })
          return
        }
        if (flagList.includes('COMPLETE')) {
          this.$confirm(`删除任务，将会删除数据源所关联的所有执行结果,确定删除吗`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let ids = dataS.map(item => {
              return item.id
            })
            let idsParams = ids.join(',')
            deleteScanCompleteDataTasks(idsParams).then(res => {
              if (res.code == 200) {
                this.$message.success(res.msg)
                this.getList()
              }
            })
          })
          return
        }
        this.$confirm(`确定删除所选中的项吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let idsParams = ids.join(',')
          deleteScanCompleteDataTasks(idsParams).then(res => {
            if (res.code == 200) {
              this.$message.success(res.msg)
              this.getList()
            }
          })
        })
      } else {
        this.$message({ message: '至少选择一条数据', type: 'warning' })
      }
    },
    resultLookFn(row) {
      if (row.state == 'RUNNING') {
        this.$message({ message: '当前状态为运行中，无法查看', type: 'warning' })
        return
      }
      if (row.publishStatus == 0) {
        this.drawerData = row
        this.drawerShow = true
      } else {
        this.$router.push({ name: 'ProtectTableField', params: row })
      }
    },
    resultReleaseFn(row) {
      if (row.state == 'RUNNING') {
        this.$message({ message: '当前状态为运行中，无法发布', type: 'warning' })
        return
      }
      this.loading = true
      publish(row.id).then(res => {
        if (res.code == 200) {
          this.$message({ message: res.msg, type: 'success' })
          this.getList()
          this.loading = false
        }
      })
        .catch(err => {
          this.loading = false
        })
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

.spanClass {
  position: absolute;
  left: -58px;
  color: red;
  top: 1px;
}

.spanClass1 {
  position: absolute;
  left: -71px;
  color: red;
}

.impShow {
  text-align: center;
}

.success {
  color: #67c23a;
}

.error {
  color: #f56c6c;
}

.marking /deep/ .el-dialog:not(.is-fullscreen) {
  margin-top: 25vh !important;
}

.deleteCla /deep/ .el-dialog__body {
  padding-top: 0;
}

.getDiv {
  display: inline-block;
  margin-left: 5px;
}

.getDiv /deep/ .el-button {
  width: 60px;
  padding: 10px 13px
}

.agentClass {
  width: 15px;
  height: 15px;
  margin: 0 auto;
  border-radius: 50%;
  background-color: #13ce66;
}

.agentClassBack {
  width: 15px;
  height: 15px;
  margin: 0 auto;
  border-radius: 50%;
  background-color: #ffba00;
}

.agentERR {
  margin: 0 auto;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: red;
}

.agentNONE {
  margin: 0 auto;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #ccc;
}

.addMsg /deep/ .el-input {
  width: 80%;
}

.addMsg /deep/ .el-select {
  width: 80%;
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

.importForm /deep/ .el-form-item--medium {
  width: 75%;

}

.importForm /deep/ .el-form-item__content {
  width: calc(100% - 145px);
}

.uploadClass {
  width: 20% !important;
}

.addSelectClass /deep/ .el-select {
  width: calc(100%);
}

.dialogClass /deep/ .el-drawer__header {
  margin-bottom: 15px;
  /* overflow: hidden!important; */
}
</style>
