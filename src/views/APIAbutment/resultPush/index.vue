<template>
  <div class="app-container" v-loading="mainLoading">
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small" :inline="true"
      label-width="auto">
      <el-form-item label="目标名称" prop="sourceName">
        <el-input v-model="queryParams.sourceName" @input="inputSearch" placeholder="请输入数据源名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="推送类型" prop="sourceType">
        <el-select clearable v-model="queryParams.sourceType" @change="inputSearch" placeholder="请选择数据库类型">
          <el-option v-for="item in pushList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item >
      </el-form-item>
      <el-form-item class="searchBtn" label-width="0">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="medium" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="medium" @click="deleteFn">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" height="670px" class="tableBox" :data="proxysList" @selection-change="handleSelectionChange" ref="tableRef">
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="数据源名称" align="center" prop="sourceName" />

      <el-table-column label="主机信息" align="center" prop="targetIpPort">
        <template slot-scope="scope">
          <span>{{ scope.row.targetIpPort }}</span>
        </template>
      </el-table-column>

      <el-table-column label="数据源类型" align="center" prop="databaseType">
        <template slot-scope="scope">
            <span> {{ databaseTypeMsg(scope.row.databaseType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源业务系统" align="center" prop="businessName" />
      <el-table-column label="分类分级框架" align="center" prop="projectName" />
      <el-table-column label="扫描状态" align="center" prop="scanState">
        <template slot-scope="scope">
          <div style="display: flex; align-items: center;justify-content: center;">
            <img style="display: block; width: 20px;margin-right: 10px;"
              :src="imgSrc[scope.row.scanState ? scope.row.scanState : 'NONE']" alt="">
            <span> {{ stateMsg(scope.row.scanState) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="耗时(毫秒)" align="center" prop="scanTime" />
      <el-table-column label="更新时间" align="center" prop="updateTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleEcelFn(scope.row)">编辑</el-button>
          <el-button size="mini" type="text" @click="scanStateClickFn(scope.row)">推送</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <!-- <el-dialog :title="titleExcel" v-loading="importDataLoading" :visible.sync="importData.importShow" width="700px"
      append-to-body :close-on-click-modal="true">
      <el-form class="importForm" :rules="importDataRules" :model="importData" size="medium" ref="importData"
        :inline="true" label-width="120px">
        <el-form-item label="数据源名称" prop="sourceName">
          <el-input v-model="importData.sourceName" maxlength="50" placeholder="请输入数据源名称"></el-input>
        </el-form-item>
        <el-form-item class="addSelectClass" label="分类分级框架" prop="categoryId">
          <el-select v-model="importData.categoryId" :disabled="editIsFlag" class="serachInput" placeholder="全部">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="来源业务系统" prop="businessName">
          <el-input v-model="importData.businessName" maxlength="50" placeholder="请输入数据源名称"></el-input>
        </el-form-item>
        <el-form-item label="导入文件" prop="importFile">
          <el-input v-model="importData.importFile" readonly placeholder="支持EXCEL格式文件导入（.xls, .xlsx)"></el-input>
        </el-form-item>
        <el-form-item class="uploadClass">
          <el-upload ref="uploadRef" class="upload-demo" :limit="1" :file-list="importData.fileList" :auto-upload="false"
            :http-request="submitFormExcelFn" action="" accept=".xls,.xlsx,csv" :show-file-list="false"
            :on-change="handleFileChange" :on-exceed="handleFileExceed">
            <el-button size="mini" type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <el-button style="margin-left: 100px;" size="small" type="text" @click="downloadFile" id="btnDownload"
        icon="el-icon-download">样例下载</el-button>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormExcelFn">确 定</el-button>
        <el-button @click="importcancel">取 消</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import {
  listDatabaseProxysScan
} from "@/api/APIAbutment";
export default {
  name: "resultPush",
  components: { },
  data() {
    return {
      pushList: [{ name: "关键字字典", value: 0 },{name: "正则表达式", value: 1}],
      // 遮罩层
      loading: false,
      mainLoading:false,
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
        projectId: null,
        sourceName: '',
        databaseType: '',
        // targetPort:'3306',
        // targetIp:'192.168.2.38',
        // targetUserName:'root',
        // targetUserPassword:'your_password',
        tables: {},
      },
      debounceTimeout: null,
      // 表单校验
      importDataRules: {
        sourceName: [
          {
            required: true, message: "请输入数据源名称", trigger: "blur"
          }
        ],
        businessName: [
          {
            required: true, message: "请输入来源业务系统", trigger: "blur"
          }
        ],
        categoryId: [
          {
            required: true, message: "请选择所属分类", trigger: "blur"
          }
        ],
        importFile: [
          { required: true, message: "请选择导入文件", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
  },
  created() {
    this.getList()
  },
  methods: {
    // 自定义校验规则
    tabelCheckedNameRules(rule, value, callback) {
        callback();
    },
    async getNameTestingFn() {
      let params = {
        sourceName: this.form.sourceName,
        id: this.form.id || ''
      }
      let res = await checkSourceName(params)
      return res.code == 200
    },

    async getimortantNameTestingFn() {
      let params = {
        sourceName: this.importData.sourceName,
        id: this.importData.id || ''
      }
      let res = await checkSourceName(params)
      return res.code == 200
    },
    nameTestingFn(val) {
      this.form.sourceName = val.replace(/[^a-zA-Z0-9]/g, "")
    },
    stateMsg(val) {
      let msg = ''
      for (let item of this.executeStatus) {
        if (item.value == val) {
          msg = item.label
        }
      }
      return msg || '待扫描'
    },
    databaseTypeMsg(val) {
      let msg = ''
      for (let item of this.databaseTypeList) {
        if (item.value == val) {
          msg = item.name
        }
      }
      return msg || '未知来源'
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
      return
      this.loading = true;
      listProxys(this.queryParams).then(response => {
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
      this.form = {
        targetIp: null,
        targetPort: null,
        targetDatabase: [],
        targetUserName: null,
        targetUserPassword: null,
        //  protocolPort: null,
        projectId: null,
        // proxyStatus: "0"
      };
      this.resetForm("form");
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
      this.editIsFlag = false
      this.targetDataList = []
      this.reset();
      this.open = true;
      this.title = "添加数据库";
    },
    /** 提交按钮 */
    async submitForm() {
      this.$refs["form"].validate(async valid => {
        let data = JSON.parse(JSON.stringify(this.form))
        delete data.projectName
        data.targetDatabase = JSON.stringify(data.targetDatabase)
        data.targetIpPort = this.form.targetIp + ":" + this.form.targetPort
        console.log(data);
        
        if(!this.editIsFlag && Object.keys(data.tables).length == 0){
          this.$message({ message: '请选择扫描内容', type: 'warning' })
          return
        }else if (this.editIsFlag && data.targetDatabase == '[]' || this.editIsFlag && !data.targetDatabase){
          this.$message({ message: '请选择扫描内容', type: 'warning' })
          return
        }
        if (valid) {
          if (!await this.getNameTestingFn()) {
            return
          }
          if (this.form.id != null) {
            data.id = this.form.id
            updateDatabaseAndTables(data).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            saveDatabaseAndTables(data).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleEcelFn() {
      this.editIsFlag = false
      this.importData.importShow = true
      this.importData.categoryId = ''
      this.importData.importFile = ''
      this.importData.sourceName = ''
      this.importData.businessName = ''
      this.titleExcel = '新增Excel文件'
      this.importData.fileList = []
    },
    deleteFn() {
      let dataS = this.$refs.tableRef.selection
      let flagList // 为1 代表选中数据中有执行中的，2为没有执行中，但是有执行完成的
      if (dataS && dataS.length > 0) {
        flagList = dataS.map(item => {
          return item.scanState
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
            delProxys(idsParams).then(res => {
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
          delProxys(idsParams).then(res => {
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
  }
};
</script>
<style>
input[aria-hidden=true] {
  display: none !important;
}
</style>
<style scoped>
.yuanDataClass {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}
/* 
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
} */

.searchBtn {
  /* margin-left: auto; */
  height: 100%;
}
.tableBox{
  height: calc(100% - 36px - 50px -51px);
}
.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar-track {
  border-radius: 10px;
}
</style>
