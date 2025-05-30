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
      <el-form-item>
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
    <el-table v-loading="loading" height="670px" class="tableBox" :data="proxysList"
      @selection-change="handleSelectionChange" ref="tableRef">
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="任务名称" align="center" prop="taskName" />
      <el-table-column label="对接厂商" align="center" prop="providerName" />
      <el-table-column label="推送类型" align="center" prop="pushTypeName" />
      <el-table-column label="发布数据源名称" align="center" prop="sourceName" />
      <el-table-column label="分类分级标准" align="center" prop="standardName" />
      <el-table-column label="推送状态" align="center" prop="pushStatusName" />
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
    <el-dialog :title="title" class="addMsg" v-loading="dialogLoading" :visible.sync="dialogDataShow" width="580px" append-to-body
      :close-on-click-modal="true">
      <el-form class="dialogForm" :rules="dialogDataRules" :model="dialogData" size="medium" ref="dialogData"
        :inline="true" label-width="110px">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="dialogData.taskName" maxlength="50" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-form-item label="推送类型" prop="pushType">
          <el-select clearable v-model="queryParams.pushType" @change="inputSearch" placeholder="请选择">
            <el-option v-for="item in pushList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="对接厂商" prop="provider">
          <el-select clearable v-model="queryParams.provider" @change="inputSearch" placeholder="请选择">
            <el-option v-for="item in pushList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="主机" prop="host">
          <el-input v-model="dialogData.host" maxlength="50" placeholder="请输入主机"></el-input>
        </el-form-item>

        <el-form-item label="端口" prop="port">
          <el-input v-model="dialogData.port" maxlength="50" placeholder="请输入端口"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="userName">
          <el-input v-model="dialogData.userName" maxlength="50" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="passWord">
          <el-input v-model="dialogData.passWord" maxlength="50" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="分类分级标准" prop="standardId">
          <el-select clearable v-model="queryParams.standardId" @change="inputSearch" placeholder="请选择">
            <el-option v-for="item in pushList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推送内容" prop="businessName">
          <el-input v-model="dialogData.businessName" maxlength="50" placeholder="请选择推送内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormFn">确 定</el-button>
        <el-button @click="importcancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getResultPushList
} from "@/api/APIAbutment";
export default {
  name: "resultPush",
  components: {},
  data() {
    return {
      pushList: [{ label: "关键字字典", value: 0 }, { label: "正则表达式", value: 1 }],
      // 遮罩层
      loading: false,
      mainLoading: false,
      dialogLoading: false,
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
      dialogDataShow: false,
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
      dialogData:{
        taskName:'',//任务名称
        pushType:'',//推送类型（字典表维护）
        provider:'',//对接厂商（字典表维护）
        pushVersion:'',//对接版本（字段表维护）
        host:'',//主机
        port:'',//端口
        userName:'',//账号
        passWord:'',//密码
        standardId:'',//行业标准ID
        pushBodyList:'',//推送内容
      },
      debounceTimeout: null,
      // 表单校验
      dialogDataRules: {
        taskName: [
          {
            required: true, message: "请输入任务名称", trigger: "blur"
          }
        ],
        pushType: [
          {
            required: true, message: "请选择推送类型", trigger: "blur"
          }
        ],
        provider: [
          {
            required: true, message: "请选择对接厂商", trigger: "blur"
          }
        ],
        host: [
          { required: true, message: "请输入主机", trigger: "blur" },
        ],
        port: [
          { required: true, message: "请输入端口", trigger: "blur" },
        ],
        userName: [
          { required: true, message: "请输入账号", trigger: "blur" },
        ],
        passWord: [
          { required: true, message: "请输入密码", trigger: "blur" },
        ],
        standardId: [
          { required: true, message: "请选择分类分级标准", trigger: "blur" },
        ],
        businessName: [
          { required: true, message: "请选择推送内容", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
  },
  created() {
  },
  mounted() {
    this.getList();
  },
  methods: {
    importcancel(){
      this.dialogDataShow = false
      this.resetForm('dialogData')
    },
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
    nameTestingFn(val) {
      this.form.sourceName = val.replace(/[^a-zA-Z0-9]/g, "")
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
      this.loading = true;
      getResultPushList(this.queryParams).then(res => {
        // console.log();
        this.proxysList = res.data.rows;
        this.total = res.data.total;
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
      this.resetForm("dialogData");
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
      this.resetForm('dialogData');
      this.dialogDataShow = true;
      this.title = "添加数据库";
    },
    /** 提交按钮 */
    async submitFormFn() {
      this.$refs["dialogData"].validate(async valid => {
        let data = JSON.parse(JSON.stringify(this.form))
        delete data.projectName
        data.targetDatabase = JSON.stringify(data.targetDatabase)
        data.targetIpPort = this.form.targetIp + ":" + this.form.targetPort
        console.log(data);

        if (!this.editIsFlag && Object.keys(data.tables).length == 0) {
          this.$message({ message: '请选择扫描内容', type: 'warning' })
          return
        } else if (this.editIsFlag && data.targetDatabase == '[]' || this.editIsFlag && !data.targetDatabase) {
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
      this.dialogDataShow = true
      this.dialogData.categoryId = ''
      this.dialogData.importFile = ''
      this.dialogData.sourceName = ''
      this.dialogData.businessName = ''
      this.title = '新增Excel文件'
      this.dialogData.fileList = []
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
.dialogForm .el-form-item{
  width: 80%;
}
.dialogForm .el-form-item /deep/ .el-form-item__label-wrap{
}
.dialogForm .el-form-item /deep/ .el-form-item__content{
  width: 70%;
}
.dialogForm .el-form-item  /deep/ .el-select{
  width: 100%;
}
.searchBtn {
  /* margin-left: auto; */
  height: 100%;
}

.tableBox {
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
