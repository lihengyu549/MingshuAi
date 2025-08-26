<template>
  <div class="app-container" v-loading="loading">
    <el-form :model="queryParams" ref="queryParams" class="yuanDataClass" size="small" :inline="true"
      v-show="showSearch" label-width="auto">
      <el-form-item label="字段名" prop="fieldName">
        <el-input v-model="queryParams.fieldName" @input="inputSearch" placeholder="请输入数据源名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select ref="addSelectRef" v-model="addNodeName">
          <el-option style="height: 100%; padding: 0" value="">
            <el-tree :data="categoryList" :props="defaultProps" show-checkbox :expand-on-click-node="true"
              :filter-node-method="filterNode" ref="treeSelectQuery" node-key="id" highlight-current
              @check="addHandleNodeCheck" />
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分类状态" class="addSelectClass" prop="classificationStateIds">
        <el-select v-model="queryParams.classificationStateIds" multiple @change="inputSearch" placeholder="请选择">
          <el-option v-for="item in dict.type.sys_classification_state" :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="安全分级" prop="securityLevel">
        <el-select clearable v-model="queryParams.securityLevel" multiple @change="inputSearch" placeholder="请选择">
          <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="确认状态" prop="confirm">
        <el-select clearable v-model="queryParams.confirm" @change="inputSearch" placeholder="请选择">
          <el-option v-for="item in confirmList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属库" prop="databaseName">
        <el-select clearable v-model="queryParams.databaseName" @change="databaseNameFn" placeholder="请选择">
          <el-option v-for="item in surfaceList" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属表" prop="tableName">
        <el-select clearable v-model="queryParams.tableName" filterable :disabled="!queryParams.databaseName"
          @change="inputSearch" placeholder="全部">
          <el-option v-for="item in tableList" :key="item.id" :label="item.tableName" :value="item.tableName">
          </el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="来源业务系统" prop="businessName">
        <el-input v-model="queryParams.businessName" @input="inputSearch" placeholder="请输入来源业务系统" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item> -->
      <el-form-item label="归类原因" prop="classificationReasons">
        <el-select clearable v-model="queryParams.classificationReasons" @change="inputSearch" placeholder="请选择">
          <el-option v-for="item in dict.type.sys_classification_reasons" :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="置信度" prop="confidenceLevel">
        <el-select clearable v-model="queryParams.confidenceLevel" @change="inputSearch" placeholder="请选择">
          <el-option v-for="item in confidenceLevelList" :key="item.value" :label="item.name" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="个人信息识别" prop="piiDetection">
        <el-select ref="addSelectRef" v-model="piiNodeName">
          <el-option style="height: 100%; padding: 0" value="">
            <el-tree :data="piiList" :props="defaultProps" show-checkbox :expand-on-click-node="true"
              :filter-node-method="filterNode" ref="treeSelectPii" node-key="id" highlight-current
              @check="piiHandleNodeCheck" />
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label=" " class="searchBtn">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-aim" size="medium" @click="handleAdd">确认勾选项</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-more" size="medium" @click="handleEcelFn">确认过滤项</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-refresh-left" size="medium" @click="handleAddFnClose">取消勾选项</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-magic-stick" size="medium" @click="handleEcelFnClose">取消过滤项</el-button>
      </el-col>
      <el-popover popper-class="popoverColumn" placement="bottom" width="150" trigger="click">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group v-model="checkedColumn" @change="handleCheckedCitiesChange" class="checkboxGroup"
          style="display: flex;flex-direction: column;flex-wrap: nowrap;height: 180px;margin-top: 10px; overflow-y: auto;">
          <el-checkbox style="margin-bottom: 10px;" v-for="item in setList" :label="item" :key="item.label">{{
            item.label }}</el-checkbox>
        </el-checkbox-group>
        <el-button slot="reference">列设置</el-button>
      </el-popover>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table height="550px" class="tableBox" v-loading="loading" :key="checkedColumn.length" :data="proxysList"
      @selection-change="handleSelectionChange" ref="tableRef">
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="字段名" align="center" prop="fieldName" width="150" show-overflow-tooltip fixed />
      <el-table-column label="字段类型" align="center" prop="fieldType" width="150" show-overflow-tooltip fixed />
      <el-table-column label="字段注释" align="center" prop="fieldRemark" width="150" show-overflow-tooltip fixed />
      <el-table-column label="AI字段注释" align="center" prop="craftRemark" width="100" show-overflow-tooltip fixed />
      <template>
        <el-table-column v-for="item in checkedColumn" :label="item.label" align="center" :prop="item.prop"
          :width="item.width" show-overflow-tooltip />
      </template>
      <el-table-column label="样本" align="center" prop="sampleData" fixed="right" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-tooltip placement="bottom" effect="light">
            <div slot="content">
              <el-table :data="scope.row.sampleList" height="250" border class="tableCla" style="width: 100%">
                <el-table-column type="index" label="序号" width="50" />
                <el-table-column prop="value" label="字段值" width="100" show-overflow-tooltip>
                </el-table-column>
              </el-table>
            </div>
            <el-button size="mini" type="text">查看</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="确认状态" fixed="right" align="center" prop="confirm">
        <template slot-scope="scope">
          <span>{{ scope.row.confirm == 1 ? '已确认' : '未确认' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="resultExdit(scope.row)">结果修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <el-dialog title="结果修改" v-loading="updataLoading" :visible.sync="deleteVisible" width="650px"
      style="padding: 0 20px;" append-to-body :close-on-click-modal="false">
      <el-form v-if="deleteVisible" :model="resultForm" ref="resultForm" size="small" label-width="auto">
        <el-form-item label="分类" class="addSelectClass">
          <el-select ref="resultSelectRef" v-model="resultFormNodeName" filterable :filter-method="handleSearch">
            <el-option style="height: 100%; padding: 0" value="">
              <el-tree :data="categoryList" :props="defaultProps" :expand-on-click-node="true"
                :filter-node-method="filterNode" ref="treeSelectSec" node-key="id" highlight-current
                @node-click="resultHandleNodeClick" />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="安全分级" class="addSelectClass" prop="securityLevel">
          <el-select v-model="resultForm.securityLevel" disabled placeholder="请选择">
            <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推理过程" prop="reasoningProcess">
          <el-input v-model="resultForm.reasoningProcess" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }"
            maxlength="500" placeholder="请输入推理过程"></el-input>
        </el-form-item>
        <el-form-item label="审核建议" prop="auditRecommendation">
          <el-input v-model="resultForm.auditRecommendation" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }"
            maxlength="500" placeholder="请输入审核建议"></el-input>
        </el-form-item>
        <el-form-item label="置信度" prop="confidenceLevel">
          <el-select v-model="resultForm.confidenceLevel" clearable>
            <el-option v-for="item in confidenceLevelList" :key="item.id" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="个人信息识别" class="addSelectClass" prop="piiDetection">
          <el-select ref="piiSelectRef" v-model="piiNodeName">
            <el-option style="height: 100%; padding: 0" value="">
              <el-tree :data="piiList" :props="defaultProps" :expand-on-click-node="true"
                :filter-node-method="filterNode" ref="treeSelect" node-key="id" highlight-current
                @node-click="piiHandleNodeClick" />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="识别方式" prop="detectionProcess">
          <el-input v-model="resultForm.detectionProcess" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }"
            maxlength="500" placeholder="请输入识别方式"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button type="primary" plain @click="updataResultFn"> 确定 </el-button>
          <el-button @click="updataResultCanelFn">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  usersAddI
} from "@/api/system/proxyUser";

import {
  listProxys, getProxys, connectTestI, delProxys, addProxys, updateProxys, importExcel, createProxys,
  startI, stopI, databaseMaskI, strategyPushI, strategyAll,
  databaseListI, confirmIds, selectResultsById, confirmList, updateFiledRule,
  cancelConfirm, cancelConfirmData, getCategoryAttachData
} from "@/api/system/proxys";
import { listAllProject, } from "@/api/system/project";
import {
  treeListI, categoryImport, getAttachData, attachStatus,
  forceLogout, updataAttach, nameTesting, addData,
  getFrameworks, listTableByProject
} from "@/api/system/protectCategory"

export default {
  dicts: ['sys_risk_level', 'sys_classification_state', 'sys_classification_reasons'],
  name: "ProxysResult",
  props: {
    treeOptions: {
      type: Array,
      default: [],
    },
    drawerData: {
      type: Object,
      default: {},
    }
  },
  data() {
    return {
      updataLoading: false,
      isIndeterminate: false,
      checkedColumn: [],
      checkAll: false,
      // classificationReasonsList: ['策略匹配', 'AI推理', '脏数据识别'],
      confidenceLevelList: [
        { name: "低", id: 1, value: "1" },
        { name: "高", id: 2, value: "2" },
      ],
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
      resultFormNodeName: '',
      treeID: '',
      categoryList: [],
      yuanCategoryList: [],
      addNodeName: '',
      piiNodeName: '',
      categoryListEdit: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      resultForm: {
        categoryId: '',
        securityLevel: '',
        id: '',
        piiDetection: '',
        classificationLogic: '',
      },
      tableData: [],
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
      databaseTypeList: [
        { name: "MYSQL", id: 0, value: "MYSQL" },
        { name: "SQL_SERVER", id: 1, value: "SQL_SERVER" },
        { name: "TIDB", id: 2, value: "TIDB" },
        { name: "POSTGRESQL", id: 3, value: "POSTGRESQL" },
        { name: "达梦", id: 4, value: "DM" },
        { name: "PolarDB For Mysql", id: 5, value: "MYSQL" }],
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
      databaseTypeList: [
        { name: "MYSQL", id: 0, value: "MYSQL" },
        { name: "SQL_SERVER", id: 1, value: "SQL_SERVER" },
        { name: "TIDB", id: 2, value: "TIDB" },
        { name: "POSTGRESQL", id: 3, value: "POSTGRESQL" },
        { name: "达梦", id: 4, value: "DM" },
        { name: "PolarDB For Mysql", id: 5, value: "MYSQL" }],
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
      surfaceList: [
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
      // 数据库代理表格数据
      setList: [
        {
          label: "来源业务系统",
          prop: "businessName",
          width: "150"
        },
        {
          label: "所属库",
          prop: "databaseName",
          width: "150"
        },
        {
          label: "所属表",
          prop: "tableName",
          width: "150"
        },
        {
          label: "表注释",
          prop: "tableRemark",
          width: "200"
        },
        {
          label: "AI表注释",
          prop: "tableCraftRemark",
          width: "200"
        },
        {
          label: "分类",
          prop: "categoryName",
          width: "250"
        },
        {
          label: "分类状态",
          prop: "classificationStateName",
          width: "250"
        },
        {
          label: "归类原因",
          prop: "classificationReasons",
          width: "150"
        },
        {
          label: "推理过程",
          prop: "reasoningProcess",
          width: "250"
        },
        {
          label: "个人信息识别",
          prop: "piiDetectionName",
          width: "250"
        },
        {
          label: "识别过程",
          prop: "detectionProcess",
          width: "250"
        },
        {
          label: "置信度",
          prop: "confidenceLevel",
          width: "100"
        },
        {
          label: "安全分级",
          prop: "securityLevelName",
          width: "150"
        },
        {
          label: "敏感数据",
          prop: "sensitiveDataName",
          width: "150"
        },
        {
          label: "样本特征",
          prop: "regularExpression",
          width: "150"

        }
      ],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        projectId: this.drawerData.projectId,
        securityLevel: [],
        confirm: '',
        databaseId: this.drawerData.id,
        businessName: '',
        databaseName: '',
        categoryId: '',
        categoryIds: '',
        piiDetection: '',
      },
      confirmList: [
        {
          value: '1',
          label: '已确认'
        },
        {
          value: '0',
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
      piiList: [],
      tableList: [],
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
    if (this.drawerData && this.drawerData.targetDatabase) {
      const cleanedDatabase = this.drawerData.targetDatabase.replace(/,$/, '');
      this.surfaceList = cleanedDatabase.split(',')
    }
    this.getProtectCategory()
    this.getPiiList()
    this.checkedColumn = this.setList
    this.checkAll = true
    // this.queryParams.selectProjectName = "全部"
    // this.queryParams.projectId = 0
    this.getList();
  },
  mounted() {
    this.getListTableByProject()
  },
  methods: {
    handleSearch(val) {
      this.$refs.treeSelectSec.filter(val);
    },
    handleCheckAllChange(val) {
      this.checkedColumn = val ? this.setList : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.setList.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.setList.length;
    },
    getListTableByProject() {
      let data = {
        databaseId: this.drawerData.id,
        databaseName: this.queryParams.databaseName
      }
      listTableByProject(data).then(res => {
        if (res.code == 200) {
          this.tableList = res.data
        }
      })
    },
    addcountInit() { },

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

    handleAdd() {
      this.loading = true
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(`确定当前勾选项吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let data = ids.join(',')
          confirmIds(data).then(res => {
            if (res.code == 200) {
              this.$message({ message: res.msg, type: 'success' })
              this.getList()
              this.loading = false
            }
          })
            .catch(() => {
              this.loading = false
            });
          // 接口
        }).catch(() => {
          this.loading = false
        });
      } else {
        this.$message({ message: '请选择至少一条数据', type: 'warning' })
        this.loading = false
      }
    },
    handleAddFnClose() {
      this.loading = true
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(`确定取消当前勾选项吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let data = ids.join(',')
          cancelConfirm(data).then(res => {
            if (res.code == 200) {
              this.$message({ message: res.msg, type: 'success' })
              this.getList()
              this.loading = false
            }
          })
            .catch(() => {
              this.loading = false
            });
          // 接口
        }).catch(() => {
          this.loading = false
        });
      } else {
        this.$message({ message: '请选择至少一条数据', type: 'warning' })
        this.loading = false
      }
    },
    handleEcelFn() {
      this.loading = true
      let params = {
        ...this.queryParams,
        securityLevelIds: [...this.queryParams.securityLevel],
        securityLevel: toString(this.queryParams.securityLevel)
      }
      confirmList(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.getList()
          this.loading = false
        }
      })
        .catch(err => {
          this.loading = false
        })
    },
    handleEcelFnClose() {
      this.loading = true
      let params = {
        ...this.queryParams,
        securityLevelIds: [...this.queryParams.securityLevel],
        securityLevel: toString(this.queryParams.securityLevel)
      }
      cancelConfirmData(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.getList()
          this.loading = false
        }
      })
        .catch(err => {
          this.loading = false
        })
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
    databaseNameFn() {
      this.queryParams.tableName = ''
      this.inputSearch()
      this.getListTableByProject()
    },
    updataResultFn() {
      this.updataLoading = true
      let params = {
        reasoningProcess: this.resultForm.reasoningProcess,
        tableFieldId: this.resultForm.tableFieldId,
        categoryId: this.resultForm.categoryId,
        securityLevel: this.resultForm.securityLevel,
        auditRecommendation: this.resultForm.auditRecommendation,
        confidenceLevel: this.resultForm.confidenceLevel,
        piiDetection: this.resultForm.piiDetection,
        detectionProcess: this.resultForm.detectionProcess,
      }
      updateFiledRule(params).then(res => {
        if (res.code == 200) {
          this.$message({
            message: res.msg,
            type: 'success'
          })
        }
        this.deleteVisible = false
        this.resultFormNodeName = ''
        this.resetForm('resultForm')
        this.getList()
        this.updataLoading = false
      })
        .catch(err => {
          this.updataLoading = false
        })
    },
    updataResultCanelFn() {
      this.deleteVisible = false
      this.resultFormNodeName = ''
      this.resetForm('resultForm')
    },
    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}个`)
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
      let params = {
        ...this.queryParams,
        securityLevel: '',
        securityLevelIds: this.queryParams.securityLevel,
      }
      selectResultsById(params).then(response => {
        this.proxysList = response.data.rows;
        this.proxysList.forEach(ele => {
          if (ele.sampleData) {
            ele.sampleList = JSON.parse(ele.sampleData).map((item => ({ value: item })))
          }
        })
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.addNodeName = ''
      this.piiNodeName = ''
      this.resetForm("queryParams");
      // 重置分类树形组件的勾选状态
      if (this.$refs.treeSelectQuery) {
        // 清除所有勾选
        this.$refs.treeSelectQuery.setCheckedKeys([]);
      }
      // 重置PII树形组件的勾选状态
      if (this.$refs.treeSelectPii) {
        // 清除所有勾选
        this.$refs.treeSelectPii.setCheckedKeys([]);
      }
      if (this.queryParams.categoryIds) {
        this.queryParams.categoryIds = ''
      }
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    resultExdit(row) {
      this.addNodeName = ''
      this.piiNodeName = ''
      this.resultForm = JSON.parse(JSON.stringify(row))
      this.resultForm.tableFieldId = row.id
      this.piiNodeName = row.piiDetectionName
      this.resultForm.confidenceLevel = row.confidenceLevel == '高' ? '2' : '1'
      this.resultFormNodeName = row.categoryName
      this.deleteVisible = true
    },
    addHandleNodeCheck(node, checkData) {
      // 筛选出选中的叶子节点（无children的节点）
      const checkedLeafNodes = checkData.checkedNodes.filter(item => !item.children);

      // 无选中节点或无选中子项（叶子节点），清空展示
      if (checkData.checkedKeys.length === 0 || checkedLeafNodes.length === 0) {
        this.addNodeName = '';
        this.queryParams.categoryIds = '';
        this.getList();
        return;
      }

      // 收集所有选中叶子节点对应的根节点（去重）
      const rootNodeNames = new Set();
      checkedLeafNodes.forEach(leafNode => {
        const rootNode = this.findRootNode(this.categoryList, leafNode.id);
        if (rootNode) {
          rootNodeNames.add(rootNode.categoryName); // 根节点名称
        }
      });

      // 展示根节点名称（用逗号分隔）
      this.addNodeName = Array.from(rootNodeNames).join(',');

      // 保持原有逻辑：收集叶子节点ID作为查询参数
      this.queryParams.categoryIds = checkedLeafNodes.map(item => item.id).join();
      this.getList();
    },
    // 查找节点对应的根节点
    findRootNode(tree, nodeId) {
      // 递归查找节点本身
      const findNode = (nodes, id) => {
        for (const node of nodes) {
          if (node.id === id) {
            return node;
          }
          if (node.children && node.children.length) {
            const found = findNode(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      // 先找到当前节点
      const node = findNode(tree, nodeId);
      if (!node) return null;

      // 向上追溯到根节点（根节点的parentId为初始的projectId）
      let currentNode = node;
      while (currentNode.parentId !== this.drawerData.projectId && currentNode.parentId) {
        const parentNode = findNode(tree, currentNode.parentId);
        if (!parentNode) break; // 防止死循环
        currentNode = parentNode;
      }
      return currentNode;
    },
    piiHandleNodeCheck(node, checkData) {
      const parentLabels = this.findParentLabelsById(this.piiList, node.id);
      if (parentLabels) {
        this.piiNodeName = parentLabels.join('-') + '-' + node.categoryName;
      } else {
        this.piiNodeName = node.categoryName;
      }

      if (checkData.checkedKeys.length == 0) {
        this.piiNodeName = ''
      }
      let lastNodeData = checkData.checkedNodes.filter(item => !item.children)
      this.queryParams.piiDetection = lastNodeData.map(item => item.id).join()
      this.getList()
    },
    addHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
        if (parentLabels) {
          this.addNodeName = parentLabels.join('-') + '-' + node.categoryName;
        } else {
          this.addNodeName = node.categoryName;
        }
        this.queryParams.categoryId = node.id
        this.$refs.addSelectRef.blur()
        this.getList()
      }
    },

    resultHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
        if (parentLabels) {
          this.resultFormNodeName = parentLabels.join('-') + '-' + node.categoryName;
        } else {
          this.resultFormNodeName = node.categoryName;
        }
        this.resultForm.categoryId = node.id
        this.$refs.resultSelectRef.blur()
        getCategoryAttachData({ categoryId: node.id, piiId: this.resultForm.piiDetection }).then(res => {
          this.resultForm.securityLevel = res.data.minSecurityLevel + ''

        })
      }
    },
    piiHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
        if (parentLabels) {
          this.piiNodeName = parentLabels.join('-') + '-' + node.categoryName;
        } else {
          this.piiNodeName = node.categoryName;
        }
        this.resultForm.piiDetection = node.id
        this.$refs.piiSelectRef.blur()
        getCategoryAttachData({ piiId: node.id, categoryId: this.resultForm.categoryId }).then(res => {
          this.resultForm.securityLevel = res.data.minSecurityLevel + ''

        })
      }
    },
    filterNode(value, data, node) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1
    },
    getPiiList(key) {
      this.treeLoading = true
      let data = {
        parentId: 1,
        needSub: 1,
        ifAddUnclassified: 2
      };
      treeListI(data).then((resp) => {
        this.piiList = resp.data
        this.yuanCategoryList = resp.data
        if (resp.data.length == 0) {
          this.Loading = false
        } else {
          let tempList = JSON.parse(JSON.stringify(this.piiList))
          for (let item of tempList) {
            item.label = item.categoryName
          }
          this.piiList = this.handleTree(tempList, "id")
          this.categoryListEdit = this.handleTree(tempList, "id")
        }
        this.Loading = false
        this.treeLoading = false
      });
    },
    getProtectCategory(key) {
      this.treeLoading = true
      let data = {
        parentId: this.drawerData.projectId,
        needSub: 1,
        ifAddUnclassified: 1,
      };
      treeListI(data).then((resp) => {
        this.categoryList = resp.data
        this.yuanCategoryList = resp.data
        if (resp.data.length == 0) {
          this.Loading = false
        } else {
          let tempList = JSON.parse(JSON.stringify(this.categoryList))
          for (let item of tempList) {
            item.label = item.categoryName
          }
          this.categoryList = this.handleTree(tempList, "id")
          this.categoryListEdit = this.handleTree(tempList, "id")
        }
        this.Loading = false
        this.treeLoading = false
      });
    },
    // 递归函数，查找父节点的 label 并返回完整的路径
    findParentLabelsById(tree, nodeId, path = []) {
      if (!Array.isArray(tree)) {
        return null;
      }
      for (const node of tree) {
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            if (child.id === nodeId) {
              return [...path, node.label];
            }
          }
          const found = this.findParentLabelsById(node.children, nodeId, [...path, node.label]);
          if (found) {
            return found;
          }
        }
      }
      return null; // 如果没有找到，返回 null
    },

  }
};
</script>
<style>
.checkboxGroup::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.checkboxGroup::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.checkboxGroup::-webkit-scrollbar-track {
  border-radius: 10px;
}
</style>
<style scoped>
.addMsg /deep/ .el-input--medium {
  width: 237px;
}

.tableBox {
  overflow-y: auto;
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 10px;
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar-track {
  border-radius: 10px;
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
