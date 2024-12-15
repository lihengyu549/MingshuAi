<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" class="yuanDataClass" size="small" :inline="true" v-show="showSearch"
      label-width="auto">
      <el-form-item label="分类" prop="aaa1">
        <el-input v-model="queryParams.aaa1" @input="inputSearch" placeholder="请输入分类" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="安全分级" prop="aaa2">
        <el-select clearable v-model="queryParams.aaa2" @change="inputSearch" placeholder="请选择">
          <el-option v-for="item in addOptions" :key="item.id" :label="item.label" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="确认状态" prop="aaa3">
        <el-select clearable v-model="queryParams.aaa3" @change="inputSearch" placeholder="请选择">
          <el-option v-for="item in aaa3List" :key="item.id" :label="item.label" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属库" prop="aaa4">
        <el-select clearable v-model="queryParams.aaa4" @change="inputSearch" placeholder="请选择">
          <el-option v-for="item in databaseTypeList" :key="item.id" :label="item.name" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属表" prop="aaa5">
        <el-select clearable v-model="queryParams.aaa5" @change="inputSearch" placeholder="请选择">
          <el-option v-for="item in publishStatus" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="来源业务系统" prop="aaa6">
        <el-input v-model="queryParams.aaa6" @input="inputSearch" placeholder="请输入来源业务系统" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      
      <el-form-item>
      </el-form-item>
      <el-form-item>
      </el-form-item>
      <el-form-item label=" " class="searchBtn">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="medium" @click="handleAdda"
          v-hasPermi="['system:proxys:add']">确认勾选项</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="medium" @click="handleEcelFn"
          v-hasPermi="['system:proxys:addExcel']">确认过滤项</el-button>
      </el-col>
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>
    <el-table v-loading="loading" :data="proxysList" @selection-change="handleSelectionChange" ref="tableRef">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <!-- <el-table-column label="id" align="center" prop="id" /> -->
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="字段名" align="center" prop="aaa1" show-overflow-tooltip />
      <el-table-column label="字段注释" align="center" prop="aaa2" show-overflow-tooltip />
      <el-table-column label="来源业务系统" align="center" prop="aaa3" show-overflow-tooltip />
      <!-- <el-table-column label="数据源" align="center" prop="aaa4" show-overflow-tooltip /> -->
      <el-table-column label="所属库" align="center" prop="aaa5" show-overflow-tooltip />
      <el-table-column label="所属表" align="center" prop="aaa6" show-overflow-tooltip />
      <el-table-column label="分类" align="center" prop="aaa7" show-overflow-tooltip />
      <el-table-column label="安全分级" align="center" prop="aaa8" show-overflow-tooltip />
      <el-table-column label="样本" align="center" prop="aaa9" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-tooltip placement="bottom" effect="light">
            <div slot="content">
              <el-table :data="tableData" height="250" border class="tableCla" style="width: 100%">
                <el-table-column type="index" label="序号" width="50" />
                <el-table-column prop="date" label="字段值" width="100">
                </el-table-column>
              </el-table>
            </div>
            <el-button size="mini" type="text">查看</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="确认状态" align="center" prop="aaa1" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="resultExdit(scope.row)"
            v-hasPermi="['system:proxys:resultLook']">结果修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <el-dialog title="分类分级框架结果修改" :visible.sync="deleteVisible" width="650px" style="padding: 0 20px;" append-to-body
      :close-on-click-modal="false">
      <el-form v-if="deleteVisible" :model="resultForm" ref="resultForm" size="small" label-width="auto">
        <el-form-item label="分类" prop="aaa1">
          <el-input v-model="resultForm.aaa1" placeholder="请输入分类" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="安全分级" class="addSelectClass" prop="aaa2">
        <el-select v-model="resultForm.aaa2" placeholder="请选择">
            <el-option v-for="item in addOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button type="primary" @click="deleteVisible = false"> 确定 </el-button>
          <el-button @click="deleteVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  usersAddI
} from "@/api/system/proxyUser";

import { listProxys, getProxys, connectTestI, delProxys, addProxys, updateProxys, importExcel, createProxys, startI, stopI, databaseMaskI, strategyPushI, strategyAll, databaseListI } from "@/api/system/proxys";
import { listAllProject, } from "@/api/system/project";
import { treeListI, categoryImport, getAttachData, attachStatus, forceLogout, updataAttach, nameTesting, addData, getFrameworks } from "@/api/system/protectCategory"

export default {
  name: "ProxysResult",
  data() {
    return {
      addOptions: [
        {
          value: 1,
          label: "1级"
        }, {
          value: 2,
          label: "2级"
        }, {
          value: 3,
          label: "3级"
        }, {
          value: 4,
          label: "4级"
        }, {
          value: 5,
          label: "5级"
        },
      ],
      resultForm: {
        aaa1: '',
        aaa2: '',
      },
      tableData: [{
        date: '安徽',
        name: '阿吉',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '河南',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '山东',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '北京',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '北京',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }],
      addOptions: [
        {
          value: 1,
          label: "1级"
        }, {
          value: 2,
          label: "2级"
        }, {
          value: 3,
          label: "3级"
        }, {
          value: 4,
          label: "4级"
        }, {
          value: 5,
          label: "5级"
        },
      ],
      databaseTypeList: [{ name: "MYSQL", id: 0, value: "MYSQL" }, { name: "SQL_SERVER", id: 1, value: "SQL_SERVER" }, { name: "TIDB", id: 2, value: "TIDB" }, { name: "POSTGRES", id: 3, value: "POSTGRES" }, { name: "达梦", id: 4, value: "DM" }, { name: "PolarDB For Mysql", id: 5, value: "MYSQL" }],

      treeOptions: [],
      drawerShow: false,
      samplingNum: 10,
      checkList: true,
      show: true,
      serialNumber: "",
      deleteVisible: false,
      markingId: '',
      radio: '0',
      markingVisible: false,
      addUserId: 0,
      addUserVisible: false,
      dataType: "",
      targetDataList: [],
      databaseTypeList: [{ name: "MYSQL", id: 0, value: "MYSQL" }, { name: "SQL_SERVER", id: 1, value: "SQL_SERVER" }, { name: "TIDB", id: 2, value: "TIDB" }, { name: "POSTGRES", id: 3, value: "POSTGRES" }, { name: "达梦", id: 4, value: "DM" }, { name: "PolarDB For Mysql", id: 5, value: "MYSQL" }],
      maskCompleteStatus: [{
        value: 'COMPLETE',
        label: '扫描完成'
      }, {
        value: 'RUNNING',
        label: '扫描中'
      }, {
        value: 'NONE',
        label: '未扫描'
      }, {
        value: 'ERR',
        label: '扫描失败'
      }
      ],
      publishStatus: [
        {
          value: 'COMPLETE',
          label: '未发布'
        }, {
          value: 'RUNNING',
          label: '已发布'
        },
      ],
      executeStatus: [
        {
          value: 'COMPLETE',
          label: '待执行'
        }, {
          value: 'RUNNING',
          label: '执行中'
        }, {
          value: 'NONE',
          label: '执行完成'
        }, {
          value: 'ERR',
          label: '执行失败'
        }
      ],
      formProjectListEdit: [],
      selectProjectListEdit: [{ name: "全部", id: 0 }],
      projectNameEdit: "",
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      showSucType: 0,
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
        aaa1: '',
        aaa2: '',
        aaa3: '',
        aaa4: '',
        aaa5: '',
        aaa6: '',
      },
      aaa3List: [
        {
          value: '1',
          label: '已确认'
        },
        {
          value: '2',
          label: '未确认'
        },
      ],
      // 表单参数
      form: {
        // projectName: null,
        projectId: null,
        sourceName: ''
      },
      addForm: {},
      // 表单校验
      rules: {
        userPassword: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
        ],
        userName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
        ],
        sourceName: [{
          required: true, message: "数据源名称不能为空", trigger: "blur"
        }],
        businessName: [{
          required: true, message: "来源业务系统不能为空", trigger: "blur"
        }],
        databaseType: [{ required: true, message: '请选择数据库类型', trigger: 'blur' }],
        projectName: [{ required: true, message: '请选择选分类分级框架', trigger: 'blur' }],
        targetUserName: [
          { required: true, message: "请输入数据库用户名称", trigger: "change" },
        ],
        targetDatabase: [
          { required: true, message: "请选择数据库名称", trigger: "change" },
        ],
        targetUserPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        targetIp: [
          { required: true, message: "请输入数据库地址", trigger: "change" },
          {
            pattern: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            message: "请输入有效的IP地址"
          },
        ],
        targetPort: [
          { required: true, message: "请输入端口号", trigger: "change" },
          {
            pattern:
              /^([1-9]\d{0,3}|0)$|^([1-5]\d{4})$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/,
            message:
              "请输入0~65535之间的5个数字",
          },

          {
            min: 1,
            max: 5,
            message: "长度在 1 ~ 5 个字符",
          },
        ],
      },
      importDataLoading: false,
      importData: {
        importFile: '', // 导入魔板文件名
        fileList: [],//导入模板的文件数据
        categoryId: '',//框架名称
        importShow: false,
      },
      debounceTimeout: null,
      // 表单校验
      importDataRules: {
        sourceName: [
          {
            required: true, message: "请输入数据源名称", trigger: "blur"
          }
        ],
        categoryId: [
          {
            required: true, message: "请选择所属分类", trigger: "blur"
          }
        ],
        importFile: [
          { required: true, message: "请选择导入框架文件", trigger: "blur" },
        ],
      },
    };
  },

  created() {
    // this.queryParams.selectProjectName = "全部"
    // this.queryParams.projectId = 0
    this.getList();
    this.gettreeOptionsList()
  },
  methods: {

    nameTestingFn(val) {
      this.form.sourceName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
      // nameTesting().then(res=>{
      //   console.log(res);
      // })
    },

    businessNameFn(val) {
      this.form.businessName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
      // nameTesting().then(res=>{
      //   console.log(res);
      // })
    },
    targetIpRulesFn() {

    },
    importNameTestingFn(val) {
      this.importData.sourceName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
      // nameTesting().then(res=>{
      //   console.log(res);
      // })
    },

    handleAdda() { },
    handleEcelFn() { },
    gettreeOptionsList() {
      this.Loading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
      });
    },
    targetDatabaseChange(value) {
      if (value.includes('all')) {
        this.form.targetDatabase = this.targetDataList.map(item => item.value);
      } else {
        // 移除全选选项
        this.form.targetDatabase = value.filter(val => val !== 'all');
      }
    },
    findDatabaseValueByName(name) {
      let value;
      for (let i = 0; i < this.databaseTypeList.length; i++) {
        if (name == this.databaseTypeList[i].name) {
          value = this.databaseTypeList[i].value
        }
      }
      return value
    },
    // 获取数据库名称
    getDatabaseName() {
      this.targetDataList = []
      this.showSucType = 0
      this.form.targetDatabase = false
      this.$refs["form"].validate(valid => {
        if (valid) {
          let data = {
            targetIp: this.form.targetIp,
            targetPort: this.form.targetPort,
            targetUserName: this.form.targetUserName,
            targetUserPassword: this.form.targetUserPassword,
            databaseType: this.findDatabaseValueByName(this.form.databaseType)
            // targetIp: "192.168.3.14",
            // targetPort: "3306",
            // targetUserName: "root",
            // targetUserPassword: "Mysql123!@#",
            // databaseType: "MYSQL"
          }
          databaseListI(data).then((res => {
            if (res.code == 200) {
              this.targetDataList = []
              let list = res.data
              for (let i = 0; i < list.length; i++) {
                this.targetDataList.push({ id: i, value: list[i], label: list[i] })
              }
              this.targetDataList.unshift({ id: -1, value: -1, label: '全部' })
              this.$message({
                message: res.msg,
                type: 'success'
              });
              this.$refs.selectRef.toggleMenu()
            }
          }))
          this.form.targetDatabase = ''
        }
      })

    },
    handleInput(e) {
      this.samplingNum = e
    },
    async rulsNameIsRight(id, name) {
      let params = {
        nodeId: id,
        name,
      }
      let res = await nameTesting(params)
      this.isName = res.data
    },

    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}个`)
    },

    // 定时器，防抖使用
    inputSearch(data) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.getList()
      }, 500); // 设置防抖的时间间隔为300毫秒
    },
    /** 查询数据库代理列表 */
    getList() {
      this.loading = true;
      if (this.queryParams.projectId == 0) {
        this.queryParams.projectId = null
      }
      this.proxysList = [{
        id: 0,
        aaa1: 'ADDRESS',
        aaa2: '通讯地址',
        aaa3: '测试系统',
        aaa4: '数据源01',
        aaa5: 'database01',
        aaa6: 'table01',
        aaa7: '未分类',
        aaa8: '未分级',
        aaa9: '未确认',
      }, {
        id: 1,
        aaa1: 'BANK_NO',
        aaa2: '银行编号',
        aaa3: '测试系统',
        aaa4: '数据源01',
        aaa5: 'database02',
        aaa6: 'table01',
        aaa7: '客户-个人-个人自然信息-信息资产管理信息',
        aaa8: '2级',
        aaa9: '已确认',
      },
      ],
        this.total = 20;
      this.loading = false;
      // listProxys(this.queryParams).then(response => {
      //   this.proxysList = response.rows;
      //   this.total = response.total;
      //   this.loading = false;
      // });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.showSucType = 0
      this.reset();
    },
    // 表单重置
    addReset() {
      this.addForm = {
        userName: null,
        userPassword: null,
      }
      this.resetForm("addForm");
    },
    reset() {
      this.form = {
        // id: null,
        //  proxyId: null,
        //  proxyPort: null,
        //  proxyUserName: null,
        //  proxyUserPassword: null,
        //   proxyIp: null,
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
      this.queryParams.selectProjectName = "全部"
      this.queryParams.projectId = null
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    handleEcelFn() {
      this.importData.importShow = true
      this.resetForm("importData");
    },
    resultExdit(row) {
      this.deleteVisible = true
    },
  }
};
</script>
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
.addSelectClass /deep/ .el-select {
  width: calc(100%);
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

.yuanDataClass {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.yuanDataClass /deep/ .el-form-item {
  width: 32%;
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
  height: 100%;
}

.searchBtn /deep/ .el-form-item__content {
  /* margin-left: 385px */
  /* width: 75%; */
  display: flex;
  justify-content: flex-end

}

.importForm /deep/ .el-form-item--medium {
  width: 70%;

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

.tableCla {
  height: 266px !important;
}
</style>
