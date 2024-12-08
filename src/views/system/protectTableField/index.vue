<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input v-model="filterName" placeholder="请输入行业分类" clearable size="small" prefix-icon="el-icon-search"
            style="margin-bottom: 20px" />
        </div>
        <div class="head-container">
          <el-tree :data="categoryList" :props="defaultProps" :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" node-key="id" highlight-current @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="90px">
          <el-form-item label="行业分类" prop="project">
            <el-select v-model="selectProject" filterable remote reserve-keyword placeholder="请选择行业分类"
              :remote-method="queryProjectList" :loading="loading" @change="projectChange($event)">
              <el-option v-for="item in projectList" :key="item.id" :label="item.categoryName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据库名称" prop="">
            <el-select v-model="databaseName" filterable remote reserve-keyword placeholder="请选择数据库名称"
              :remote-method="databaseList" :loading="loading" @change="databaseChange($event)">
              <el-option v-for="item in databasetableList" :key="item.id" :label="item.targetDatabase" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="表名" prop="table">
            <el-select v-model="selectTable" filterable remote reserve-keyword placeholder="请选择表名"
              :remote-method="queryTableList" :loading="loading" @change="tableChange($event)">
              <el-option v-for="item in tableList" :key="item.id" :label="item.tableName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="字段名" prop="fieldName">
            <el-input v-model="queryParams.fieldName" placeholder="请输入字段名" clearable @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="字段备注" prop="fieldRemark">
            <el-input v-model="queryParams.fieldRemark" placeholder="请输入字段备注" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="来源业务系统" prop="businessName">
            <el-input v-model="queryParams.businessName" placeholder="请输入来源业务系统" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="安全级别" prop="securityLevel">
            <!-- <el-input v-model="queryParams.securityLevel" placeholder="请输入安全级别" clearable @keyup.enter.native="handleQuery" /> -->
            <el-select v-model="queryParams.securityLevel" placeholder="全部">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分类" prop="tag">
            <el-input v-model="queryParams.tag" placeholder="请输入分类" clearable @keyup.enter.native="handleQuery" />
          </el-form-item>
          <!-- <el-form-item label="打标结果">
            <el-select v-model="markingNume" placeholder="全部">
              <el-option v-for="item in markingOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">

          <!-- <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:protectTableField:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:protectTableField:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:protectTableField:remove']">删除</el-button>
      </el-col> -->
          <!-- <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['system:protectTableField:export']">导出</el-button>
      </el-col> -->
          <!-- <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-upload2" size="mini" @click="handleImport"
          v-hasPermi="['system:api:edit']">导入</el-button>
      </el-col> -->
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <el-table v-loading="loading" :data="protectTableFieldList" @selection-change="handleSelectionChange">
          <!-- <el-table-column width="55" align="center" /> -->
          <el-table-column label="行业框架" align="center" prop="projectName" />
          <el-table-column label="库名" align="center" prop="databaseName" />
          <el-table-column label="表名" align="center" prop="tableName" />
          <el-table-column label="字段名" align="center" prop="fieldName" />
          <el-table-column label="字段类型" align="center" prop="fieldType" />
          <el-table-column label="字段备注" align="center" prop="fieldRemark" />
          <el-table-column label="安全级别" align="center" prop="securityLevel" />
          <el-table-column label="来源业务系统" align="center" prop="businessName" />
          <!-- <el-table-column label="打标信息" align="center" prop="securityRule">
            <template slot-scope="scope">
              <div class="sourceClass" v-for="item in JSON.parse(scope.row.securityRule)">{{ item }}</div>
            </template>
          </el-table-column> -->
          <el-table-column label="分类" align="center" prop="categoryName" />
          <el-table-column label="添加时间" align="center" prop="addTime" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.addTime, "{y}-{m}-{d} {h}:{m}:{s}") }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button class="btns" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                v-hasPermi="['system:protectTableField:edit']">修改</el-button>
              <!-- <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:protectTableField:remove']">删除</el-button> -->
              <el-button class="btns" size="mini" type="text" icon="el-icon-edit-outline" @click="sampleValue(scope.row)"
                v-hasPermi="['system:protectSensitiveRule:edit']">查看样本</el-button>

              <!-- <el-button class="btns" size="mini" type="text" icon="el-icon-document"
                @click="handleAddRule(scope.row)">添加规则</el-button> -->
              <!-- <el-button class="btns" size="mini" type="text" icon="el-icon-attract"
                @click="relevanceApi(scope.row)">关联API</el-button> -->
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
          @pagination="getList" />
      </el-col>
    </el-row>
    <!-- 添加或修改数据库字段名对话框 -->
    <el-dialog class="addDialog" :title="title" :visible.sync="open" width="400px" append-to-body
      :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="安全级别" prop="securityLevel">
          <!-- <el-input v-model="form.securityLevel" placeholder="请输入安全级别" /> -->
          <el-select v-model="form.securityLevel" placeholder="请选择">
            <el-option v-for="item in securityOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="打标信息" prop="securityRule">
          <el-select multiple filterable remote clearable reserve-keyword v-model="securityRuleList" placeholder="请选择"
            :remote-method="securityList">
            <el-option v-for="item in securityRuleOptions" :key="item.id" :label="item.sensitiveName"
              :value="item.sensitiveName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="行业分类" prop="categoryId">
          <treeselect style="width: 85%;" v-model="form.categoryId" :options="categoryListEdit" :show-count="true"
            placeholder="请选择行业分类" />
        </el-form-item>
        <!-- <el-form-item label="行业分类" prop="categoryId">
          <el-select v-model="categoryTableEdit" filterable remote clearable reserve-keyword placeholder="请输入行业分类"
            :remote-method="categoryTableListEdit"  @change="categoryChangeEdit($event)">
            <el-option v-for="item in categoryListEdit" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="备注" prop="fieldRemark">
          <el-input v-model="form.fieldRemark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 导入 -->
    <!-- <el-dialog class="addMsg" title="导入数据" @close="closeDialog" :close-on-click-modal="false"
      :visible.sync="dialogVisible" width="450px">
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="项目名称" prop="projectName" :rules="rules.projectName">
          <el-select v-model="projectNameEdit" placeholder="请输入项目名称" @change="projectChangeEdit($event)">
            <el-option v-for="item in formProjectListEdit" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据库名称" prop="databaseName" :rules="rules.databaseName">
          <el-input v-model="form.databaseName" placeholder="请输入数据库名称" />
        </el-form-item>
        <el-form-item label="数据库地址" prop="method" :rules="rules.method">
          <el-input v-model="form.method" placeholder="请输入服务器地址" />
        </el-form-item>
        <el-form-item label="数据库类型" prop="patterns" :rules="rules.patterns">
          <el-select v-model="form.databaseType" placeholder="请选择数据库类型">
            <el-option v-for="item in databaseTypeList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据库端口" prop="port" :rules="rules.port">
          <el-input v-model="form.port" placeholder="请输入数据库端口" />
        </el-form-item>
        <el-form-item label="数据库用户" prop="user" :rules="rules.user">
          <el-input v-model="form.user" placeholder="请输入数据库用户名称" />
        </el-form-item>
        <el-form-item label="数据库密码" prop="password" :rules="rules.password">
          <el-input type="password" v-model="form.password" placeholder="请输入数据库密码" />
        </el-form-item>
        <div class="impShow" v-show="showSucType > 0">
          <div class="success" v-if="showSucType == 1">连接成功</div>
          <div class="error" v-if="showSucType == 2">连接失败</div>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="startMarking('form')"
          v-loading.fullscreen.lock="fullscreenLoading">开始打标</el-button>
        <el-button @click="markingtest('form')">测试</el-button>
      </span>
    </el-dialog> -->
    <!-- 关联api -->
    <div>
      <el-dialog class="associatedTxt" :modal="true" :title=title :close-on-click-modal="true"
        :close-on-press-escape="false" :visible.sync="associatedVisible" width="60%">

        <el-table :data="relevanceTable" style="width: 100%; height: 700px; overflow: auto; ">
          <el-table-column prop="name" align="center" label="方法名">
          </el-table-column>
          <el-table-column prop="method" align="center" label="请求方法">
          </el-table-column>
          <el-table-column align="center" label="路由">
            <template slot-scope="scope">
              <a @click="jumpApi(scope.row.patterns, scope.row.projectId)" style="color: #1890ff;" target="blank">{{
                scope.row.patterns }}</a>
            </template>
          </el-table-column>
          <el-table-column prop="className" align="center" show-overflow-tooltip label="类名">
          </el-table-column>
          <el-table-column label="参数列表" show-overflow-tooltip align="center" prop="descriptor" />
          <el-table-column label="API添加时间" align="center">
            <template slot-scope="scope">
              <span>{{ timeFormat(scope.row.addTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center" prop="remark">
          </el-table-column>
          <el-table-column prop="invokeCount" align="center" label="调用次数">
          </el-table-column>
        </el-table>


      </el-dialog>

    </div>

    <!-- 添加或修改打标规则对话框 -->
    <el-dialog class="addDialog" title="添加打标规则" :close-on-click-modal="false" :visible.sync="openRule" width="40%"
      append-to-body>
      <el-form ref="addFormRule" :model="addFormRule" :rules="rules" @submit.native.prevent>
        <el-form-item label="规则名" prop="sensitiveName">
          <div class="serclass">
            <el-input v-model="addFormRule.sensitiveName" placeholder="请输入规则名" />
          </div>
        </el-form-item>
        <el-form-item label="规则等级" prop="sensitiveLevel">
          <!-- <el-input v-model="form.sensitiveLevel" placeholder="请输入规则等级" /> -->
          <el-select class="selectClass" width="100%" v-model="addFormRule.sensitiveLevel" placeholder="请选择">
            <el-option v-for="item in ruleOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>

        </el-form-item>
        <el-form-item label="字段名匹配规则" prop="keyRule">
          <div class="fielRul">
            <a class="btn1" @click="fieldCli()">添加</a>
            <div class="fieldName">
              <div class="div1" v-for="item, index in fieldNameRule" :key="index">
                <span class="spRul">*</span>
                <el-input class="textarea" type="textarea" v-model="fieldNameRule[index]" />
                <a class="btn" @click="deletfield(index)">删除</a>
              </div>
              <!-- <el-input v-model="form.keyRule"  /> -->
            </div>
          </div>

        </el-form-item>
        <el-form-item label="记录匹配规则" prop="valueRule">
          <div class="fielRul">
            <a class="btn1" @click="remberCli()">添加</a>
            <div class="fieldName">
              <div class="div1" v-for="item, index in remberNameRule" :key="index">
                <span class="spRul">*</span>
                <el-input class="textarea" type="textarea" v-model="remberNameRule[index]" />
                <a class="btn" @click="deletCli(index)">删除</a>
              </div>
            </div>
          </div>
          <!-- <el-input v-model="form.valueRule" type="textarea" placeholder="请输入内容" /> -->
        </el-form-item>
        <el-form-item label="脱敏规则">
          <div class="serclass">
            <el-input v-model="addFormRule.maskRule" placeholder="请输入脱敏规则" />
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="sensitiveRemark">
          <div class="serclass">
            <el-input v-model="addFormRule.sensitiveRemark" placeholder="请输入备注" />
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="sensitiveRemark">
          <div class="serclass">
            <el-switch v-model="addFormRule.enableStatus" active-text="启用" inactive-text="禁用">
            </el-switch>

          </div>
        </el-form-item>


        <ul>
          <li style="color: red;">
            注意:如果您不了解正则表达式,请不要随意修改规则内容
          </li>
          <li>
            您可以添加或修改规则内容,但请使用正则表达式
          </li>
          <li> 脱敏规则:用于指定一个规则，将应用程序通过数据库查询时，将敏感字段使用'*'号代替。</li>
          <ol>
            <li>全部替换 <br>
              规则：ALL，即数据返回时全部为*号</li>
            <li>区间替换 <br>

              区间替换格式为：开头保留位数:结尾保留位数，如2:2表示将开头保留2位，末尾保留2位。<br>
              例：
              规则2:1表示将开头保留2位，末尾保留1位。
              原数据为：中华人民
              打码数据为：**人*</li>
          </ol>
        </ul>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="ruleSubmitForm">确 定</el-button>
        <el-button @click="openRule = false">取 消</el-button>
      </div>
    </el-dialog>
    <div>
      <el-dialog :modal="true" :title=title :close-on-click-modal="true" :close-on-press-escape="false"
        :visible.sync="markingVisible" width="40%" :before-close="closeLoading">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="data" :label="columnName">
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import {
  listProtectTableField,
  getProtectTableField,
  delProtectTableField,
  addProtectTableField,
  updateProtectTableField,
  getProtectCategoryI,
  getProtectSensitiveRuleI,
  importI,
  testI,
  fieldDataI,
  queryApisI
} from "@/api/system/protectTableField";
import { addProtectSensitiveRule } from "@/api/system/protectSensitiveRule";
import { listAllProject } from "@/api/system/project";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { treeListI, categoryImport, getAttachData, attachStatus, forceLogout, updataAttach, nameTesting, addData, getFrameworks } from "@/api/system/protectCategory"
import { listTableByProject, getDatabaseListI } from "@/api/system/protectTableField";
export default {
  name: "ProtectTableField",
  components: { Treeselect },

  data () {
    return {
      markingNume: 0,
      markingOptions: [
        {
          value: 0,
          label: "全部"
        }, {
          value: 1,
          label: "已打标"
        }, {
          value: 2,
          label: "未打标"
        }],
      addTime: '',
      relevanceTable: [],
      associatedVisible: false,
      addSensitiveName: '',
      addFormRule: {
        sensitiveName: '',
        maskRule: '',
        enableStatus: true
      },
      remberNameRule: {},
      fieldNameRule: {},
      // 是否显示弹出层
      openRule: false,
      filterName: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      showSucType: 0,
      Loading: false,
      columnName: "",
      tableData: [],
      markingVisible: false,
      fullscreenLoading: false,
      dataType: "",
      // projectNameId:0,
      formProjectList: null,
      formProjectListEdit: [],
      databaseTypeList: [{ name: "MYSQL", id: 0 }, { name: "SQL_SERVER", id: 1 }],
      dialogVisible: false,
      securityRuleOptions: [],
      ruleOptions: [
        {
          value: 1,
          label: "1"
        }, {
          value: 2,
          label: "2"
        }, {
          value: 3,
          label: "3"
        }, {
          value: 4,
          label: "4"
        }, {
          value: 5,
          label: "5"
        }],
      securityOptions: [
        {
          value: 1,
          label: "1"
        }, {
          value: 2,
          label: "2"
        }, {
          value: 3,
          label: "3"
        }, {
          value: 4,
          label: "4"
        }, {
          value: 5,
          label: "5"
        }],

      options: [
        {
          value: 0,
          label: "全部"
        }, {
          value: 1,
          label: "1"
        }, {
          value: 2,
          label: "2"
        }, {
          value: 3,
          label: "3"
        }, {
          value: 4,
          label: "4"
        }, {
          value: 5,
          label: "5"
        }],
      safetyValue: '',
      safetyValueId: 0,
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
      // 数据库字段名表格数据
      protectTableFieldList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      securityRuleList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        projectId: null,
        tableId: null,
        fieldName: null,
        fieldType: null,
        fieldRemark: null,
        securityLevel: null,
        securityRule: null,
        categoryId: null,
        fieldRemark: null,
        status: null,
      },
      selectProject: "",
      selectProjectId: 0,
      selectTable: "",
      databaseName: '',
      selectDatabaseId: 0,
      selectTableId: 0,
      categoryTable: "",
      categoryTableEdit: "",
      projectNameEdit: "",
      projectList: [{ name: "全部", id: 0 }],
      tableList: [{ tableName: "全部", id: 0 }],
      databasetableList: [{ targetDatabase: "全部", id: 0 }],
      categoryList: [],
      categoryListEdit: null,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        sensitiveName: [
          {
            required: true, message: "规则名不能为空", trigger: "blur"
          }
        ],
        sensitiveLevel: [
          { required: true, message: "规则等级不能为空", trigger: "blur" }
        ],
        user: [
          { required: true, message: "请输入数据库用户名称", trigger: "change" },
        ],
        databaseName: [
          { required: true, message: "请输入数据库名称", trigger: "change" },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        method: [
          { required: true, message: "请输入数据库地址", trigger: "change" },
          {
            pattern:
              /(?:(?:1[0-9][0-9]\.)|(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:1[0-9][0-9])|(?:2[0-4][0-9])|(?:25[0-5])|(?:[1-9][0-9])|(?:[0-9]))/,
            message: "请输入正确的Ipv4地址。例如:Ipv4地址:192.168.0.1",
          },
        ],
        port: [
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
    };
  },
  watch: {
    filterName (val) {
      this.$refs.tree.filter(val);
    }
  },
  created () {
    this.categoryTable = "";
    this.queryParams.securityLevel = 0;
    this.selectProject = "全部";
    this.markingNume = 0;
    this.selectTable = "全部";
    this.databaseName = "全部";
    this.getList();
    this.getProjectList();
    // this.getTableList();
    this.getProtectCategory()
    // this.getProtectCategoryEdit()
    this.getProtectSensitiveRule()
    // this.getProjectListEdit()
    // this.getDatabaseList()
  },
  methods: {
    jumpApi (url, id) {
      const routeData = this.$router.resolve({
        path: "/systemInfo/api",
        query: { id: id, url: url },
      });
      window.open(routeData.href, '_blank')
    },
    timeFormat (value) {
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d + " " + h + ":" + m;
    },
    relevanceApi (row) {
      this.title = row.fieldName + "关联API";
      let data = {
        tableId: row.tableId,
        fieldId: row.id,
        // tableId: "1886",
        // fieldId: "12103",
      }
      queryApisI(data).then((res => {
        this.relevanceTable = res.rows
        // this.addTime = this.relevanceTable.addTime
        this.associatedVisible = true
      }))
    },
    ruleSubmitForm () {
      this.$refs["addFormRule"].validate(valid => {
        if (valid) {
          this.addFormRule.keyRule = JSON.stringify(this.fieldNameRule)
          this.addFormRule.valueRule = JSON.stringify(this.remberNameRule)
          if (this.fieldNameRule !== null && this.fieldNameRule.length > 0) {
            for (let i = 0; i < this.fieldNameRule.length; i++) {
              if (this.fieldNameRule[i] == '' || this.fieldNameRule[i] == null) {
                this.$message.error(`字段名匹配规则的第${i + 1}个框不能为空`);
                return
              }
            }
          }
          if (this.remberNameRule !== null && this.remberNameRule.length > 0) {
            for (let i = 0; i < this.remberNameRule.length; i++) {
              if (this.remberNameRule[i] == '' || this.remberNameRule[i] == null) {
                this.$message.error(`记录匹配规则的第${i + 1}个框不能为空`);
                return
              }
            }
          }
          addProtectSensitiveRule(this.addFormRule).then(response => {
            this.$modal.msgSuccess("添加成功");
            this.openRule = false;
          });

        }
      });

    },
    fieldCli () {
      this.fieldNameRule.unshift('')
    },
    deletfield (i) {
      this.fieldNameRule.splice(i, 1)
    },
    deletCli (i) {
      this.remberNameRule.splice(i, 1)
    },
    remberCli () {
      if (this.remberNameRule == null) {
        this.remberNameRule = []
      }
      this.remberNameRule.unshift('')

    },
    handleAddRule (row) {
      this.reset();
      this.openRule = true
      this.fieldNameRule = new Array(row.fieldName)
      this.remberNameRule = []
      this.remberNameRule.unshift('')
      this.addFormRule.sensitiveName = row.fieldRemark
      this.addFormRule.maskRule = row.fieldRemark

    },
    filterNode (value, data) {
      if (!value) return true;
      return data.categoryName.indexOf(value) !== -1;
    },
    handleNodeClick (data) {
      this.queryParams.categoryId = data.id;
      this.handleQuery();
    },
    closeLoading () {
      this.markingVisible = false

    },
    // 示例值
    sampleValue (row) {
      this.tableData = []

      let data = {
        fieldId: row.id
      }
      fieldDataI(data).then((res => {

        this.columnName = res.data.columnName
        let valueList = JSON.parse(res.data.data)
        for (let i in valueList) {
          if (valueList[i]) {
            this.tableData.push({ "data": valueList[i] })
          }
        }
        this.title = row.fieldName + " 样本";
        this.markingVisible = true
        // this.Loading = false
      }))
    },
    closeDialog () {
      // this.reset()
      this.showSucType = 0

    },
    // 打标测试
    markingtest (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.form.databaseType == "0") {
            this.dataType = "MYSQL"
          } else {
            this.dataType = "SQL_SERVER"
          }
          let data = {
            projectId: this.selectProjectId,
            host: this.form.method,
            serverType: this.dataType,
            databaseName: this.form.databaseName,
            port: this.form.port,
            user: this.form.user,
            password: this.form.password
          }
          testI(data).then((res => {
            if (res.data == true) {
              this.showSucType = 1
            } else {
              this.showSucType = 2
            }

          }))

        } else {
          // console.log('error submit!!');
          return false;
        }

      })
    },
    // 开始打标
    // startMarking (formName) {
    //   this.$refs[formName].validate((valid) => {
    //     if (valid) {
    //       this.fullscreenLoading = true;
    //       if (this.form.databaseType == "0") {
    //         this.dataType = "MYSQL"
    //       } else {
    //         this.dataType = "SQL_SERVER"
    //       }
    //       let data = {
    //         projectId: this.selectProjectId,
    //         host: this.form.method,
    //         serverType: this.dataType,
    //         databaseName: this.form.databaseName,
    //         port: this.form.port,
    //         user: this.form.user,
    //         password: this.form.password
    //       }
    //       importI(data).then((res => {
    //         if (res.code == 200) {

    //           this.$alert(res.msg, '打标信息', {
    //             confirmButtonText: '确定',
    //             type: 'success'
    //           });

    //           // this.$message({
    //           //   message: res.msg,
    //           //   type: 'success'
    //           // });
    //           this.fullscreenLoading = false;
    //           // this.reset()
    //           this.show = false
    //           this.showEr = false
    //           this.loading = true;
    //           setInterval(() => {
    //             this.loading = false;
    //           }, 1000)

    //         } else {
    //           this.$alert(res.msg, '打标信息', {
    //             confirmButtonText: '确定',
    //             type: 'error'
    //           });
    //           this.show = false
    //           this.showEr = false
    //           // this.$message.error(e.message);
    //           // this.dialogVisible = false
    //           this.fullscreenLoading = false;

    //         }

    //       }))

    //     } else {
    //       // console.log('error submit!!');
    //       return false;
    //     }
    //   });
    // },

    // 导入
    handleImport () {
      this.showSucType = 0
      this.projectNameEdit = null
      this.dialogVisible = true
      this.reset()
    },
    // 打标信息检索打标规则列表


    securityList (query) {
      if (query) {
        // this.loading = true;
        setTimeout(() => {
          // this.loading = false;
          this.getProtectSensitiveRule(query);
        }, 200);
      } else {
        this.getProtectSensitiveRule("");
      }

    },

    getProtectSensitiveRule (key) {
      if (key) {
        key = key.trim();
      }
      let data = {
        name: key
      };
      getProtectSensitiveRuleI(data).then((res => {
        this.securityRuleOptions = res.data

      }))
    },

    projectChangeEdit (e) {
      this.projectNameEdit = e
      this.form.projectName = e
    },


    /**
    * 打标信息检索行业分类列表
    */
    categoryChangeEdit (value) {
      this.categoryTableEdit = value;
      this.form.categoryId = value
    },
    categoryChange (value) {
      this.queryParams.categoryId = value;
    },
    categoryTableList (query) {
      if (query) {
        // this.loading = true;
        setTimeout(() => {
          // this.loading = false;
          this.getProtectCategory(query);
        }, 200);
      } else {
        this.getProtectCategory("");
      }
    },
    getProtectCategory (key) {
      if (key) {
        key = key.trim();
      }
      let data = {
        name: key
      };
      treeListI(data).then((resp) => {
        this.categoryList = resp.data;
        if (this.categoryListEdit == null) {
          let tempList = JSON.parse(JSON.stringify(this.categoryList))
          for (let item of tempList) {
            item.label = item.categoryName
          }
          this.categoryList = this.handleTree(tempList, "id")
          this.categoryListEdit = this.handleTree(tempList, "id")

        }

      });
    },
    categoryTableListEdit (query) {
      if (query) {
        // this.loading = true;
        setTimeout(() => {
          // this.loading = false;
          this.getProtectCategoryEdit(query);
        }, 200);
      } else {
        this.getProtectCategoryEdit("");
      }
    },
    getProtectCategoryEdit (key) {
      if (key) {
        key = key.trim();
      }
      let data = {
        name: key
      };
      getProtectCategoryI(data).then((resp) => {
        let tempList = resp.data
        for (let item of tempList) {
          item.label = item.categoryName
        }
        this.categoryListEdit = this.handleTree(tempList, "id")
        // this.categoryListEdit = this.handleTree(resp.data,"id")
      });
    },
    //数据库名称
    databaseList (query) {
      if (query) {
        // this.loading = true;
        setTimeout(() => {
          // this.loading = false;
          this.getDatabaseList(query)
        }, 200);
      } else {
        this.getDatabaseList("");
      }
    },

    getDatabaseList (key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        projectId: this.selectProjectId,
        databaseName: key,
      };
      getDatabaseListI(params).then((resp) => {
        this.databasetableList = resp.data;
        this.databasetableList.unshift({ targetDatabase: "全部", id: 0 })

      });

    },


    // 表名
    queryTableList (query) {
      if (query) {
        // this.loading = true;
        setTimeout(() => {
          // this.loading = false;
          this.getTableList(query);
        }, 200);
      } else {
        this.getTableList("");
      }
    },

    /** 查询数据库字段名列表 */
    getList () {
      this.loading = true;
      if (this.selectProjectId == "0") {
        this.selectDatabaseId = ''
        this.selectTableId = ''
      }
      if (this.databaseName == "0") {
        this.selectTableId = ''
      }
      this.queryParams.projectId = this.selectProjectId;
      this.queryParams.tableId = this.selectTableId;
      this.queryParams.databaseId = this.selectDatabaseId;
      this.queryParams.status = this.markingNume;
      listProtectTableField(this.queryParams).then((response) => {
        this.protectTableFieldList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    databaseChange (value) {
      this.selectDatabaseId = value
      if (value == 0) {
        this.selectTable = "全部";
        this.selectTableId = ''
        this.tableList = new Array({ tableName: "全部", id: 0 })
      } else {
        this.queryTableList()
      }
    },
    projectChange (value) {
      this.selectProjectId = value;
      this.databaseName = "全部";
      this.databaseList("")

      this.tableList = new Array({ tableName: "全部", id: 0 })
      this.selectTable = "全部";
      this.selectTableId = ''
    },
    tableChange (value) {
      this.selectTableId = value;
    },
    getProjectList (key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        name: key,
      };
      getFrameworks(params).then((resp) => {
        this.projectList = resp.data;
        this.projectList.unshift({ categoryName: "全部", id: 0 })
        if (this.formProjectList == null) {
          this.formProjectList = this.projectList;
        }
      });
    },
    getProjectListEdit (key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        name: key,
      };
      getFrameworks(params).then((resp) => {
        this.formProjectListEdit = resp.data;
        // this.projectList.unshift({ name: "全部", id: 0 })
        if (this.formProjectListEdit == null) {
          this.formProjectListEdit = this.projectList;
        }
      });
    },
    getTableList (key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        databaseId: this.selectDatabaseId,
        tableName: key,
      };
      listTableByProject(params).then((resp) => {
        this.tableList = resp.data;
        this.tableList.unshift({ tableName: "全部", id: 0 })

      });
    },
    queryProjectList (query) {
      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.getProjectList(query);
        }, 200);
      } else {
        this.getProjectList();
      }
    },
    // 取消按钮
    cancel () {
      this.open = false;
      // this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        id: null,
        projectId: null,
        tableId: null,
        fieldName: null,
        fieldType: null,
        fieldRemark: null,
        addTime: null,
        securityLevel: null,
        tag: null,
        securityRule: [],
        categoryId: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList();

    },
    /** 重置按钮操作 */
    resetQuery () {
      this.databaseName = "全部";
      this.categoryTable = "全部";
      this.selectProject = "全部";
      this.selectTable = "全部";
      this.markingNume = 0;
      this.selectProjectId = 0;
      this.queryParams.categoryId = undefined
      this.$refs.tree.setCurrentKey(null);
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "添加数据库字段名";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.securityRuleList = JSON.parse(row.securityRule)
      this.reset();
      const id = row.id || this.ids;
      this.categoryTableEdit = row.categoryId
      getProtectTableField(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改" + row.fieldName + "打标信息";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.securityRule = JSON.stringify(this.securityRuleList)
          if (this.form.id != null) {
            updateProtectTableField(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProtectTableField(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });

    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除数据库字段名编号为"' + ids + '"的数据项？')
        .then(function () {
          return delProtectTableField(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download(
        "system/protectTableField/export",
        {
          ...this.queryParams,
        },
        `protectTableField_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>

<style scoped>
.el-popup-parent--hidden /deep/ .el-loading-mask {
  background: "rgba(0, 0, 0, 0.7)" !important;
}

.addDialog /deep/ .el-input--medium {
  width: 237px;
}

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

.sourceClass {
  margin: 5px;
  display: inline-block;
  height: 30px;
  line-height: 28px;
  color: #1890ff;
  background-color: #e8f4ff;
  /* border-color: #d1e9ff; */
  border: 1px solid #d1e9ff;
  padding: 0 5px 0 5px;
  border-radius: 5px;
  box-shadow: -2px 2px 5px 0px #e5f3ff;
}

.success {
  color: #67c23a;
}

.error {
  color: #f56c6c;
}

.impShow {
  text-align: center;
}

.el-tree-node /deep/ .el-tree-node {
  display: none;
}

.addDialog /deep/ .el-select {
  /* width:520px; */
  width: 78%;
}

.addDialog /deep/ .vue-treeselect__control {
  /* width:520px; */
  width: 111%;
  margin: 0 !important;
}

.addDialog /deep/ .selectClass {
  /* width: 520px; */
  width: 80%;
}

.addDialog /deep/ .el-input--medium {
  /* width: 520px; */
  width: 80%;
  /* margin-right: 0 !important; */

}

.addDialog /deep/ .el-form-item__label {
  width: 110px !important;
}

.addDialog /deep/ .el-form-item__content {
  margin-left: 110px !important;
}

.fielRul {
  margin-left: -10px;
}

.fielRul ::-webkit-scrollbar {
  width: 10px;
}

.fielRul ::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 5px;
}

.fielRul ::-webkit-scrollbar-track {
  background-color: #f2f2f2;
}

.serclass /deep/ .el-input {
  width: 64% !important;
}

.btn {
  border: 0;
  color: #409eff;
  text-align: right;
  padding-left: 20px;


}

.btn1 {
  color: #409eff;
  text-align: right;
  margin-left: 90%;
}

.fieldName {
  height: 150px !important;
  overflow: auto !important;

}

.div1 {
  position: relative;
  /* width: 581px; */
  width: 80%;


}

.spRul {
  color: #ff4949;
  width: 5px;
  height: 5px;
  /* margin-right: 5px; */
  float: left;
  margin-top: 10px;
  margin-left: 5px;
  /* position: absolute;
  left: -14px;
  z-index: 999;
  top: 10px; */


}

.associatedTxt /deep/ .el-table::before {
  background-color: transparent;
}

.btns {
  font-size: 14px;
}
</style>
