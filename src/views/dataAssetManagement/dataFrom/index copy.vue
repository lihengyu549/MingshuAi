<template>
  <div class="app-container" v-loading="mainLoading">
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small" :inline="true"
      label-width="auto">
      <el-form-item label="数据源名称" prop="sourceName">
        <el-input v-model="queryParams.sourceName" @input="inputSearch" placeholder="请输入数据源名称" clearable
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
        <el-select clearable v-model="queryParams.projectId" @change="inputSearch" placeholder="请选择数据库类型">
          <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="主机信息" prop="aaaa">
        <el-input v-model="queryParams.aaaa" @input="inputSearch" placeholder="请输入数据源名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="扫描状态" prop="bbbb">
        <el-select clearable v-model="queryParams.bbbb" @change="inputSearch" placeholder="请选择扫描状态">
          <el-option v-for="item in scanPlanStateList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="searchBtn">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="medium" @click="handleAdd">新增数据库</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="medium" @click="handleEcelFn">新增Excel文件</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-thumb" size="medium" @click="implementFn">执行</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-close" size="medium" @click="deleteFn">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="proxysList" @selection-change="handleSelectionChange" ref="tableRef">
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="数据源名称" align="center" prop="sourceName" />
      <el-table-column label="数据源类型" align="center" prop="databaseType" />
      <el-table-column label="来源业务系统" align="center" prop="businessName" />
      <el-table-column label="分类分级框架" align="center" prop="projectName" />
      <el-table-column label="字段数量" align="center" prop="fieldCount" />
      <el-table-column label="执行状态" align="center" prop="state">

        <template slot-scope="scope">
          <span>{{ stateMsg(scope.row.state) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布状态" align="center" prop="publishStatus">
        <template slot-scope="scope">
          <span>{{ scope.row.publishStatus == 0 ? '未发布' : '已发布' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
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
        <el-form-item label="数据库类型" prop="databaseType" :rules="rules.databaseType">
          <el-select v-model="form.databaseType" placeholder="请选择数据库类型" @change="databaseTypeChange($event)">
            <el-option v-for="item in databaseTypeList" :key="item.id" :label="item.name" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据源名称" prop="sourceName" :rules="rules.sourceName">
          <el-input v-model="form.sourceName" @input="nameTestingFn(form.sourceName)"
            @blur="getNameTestingFn(form.sourceName)" maxlength="50" placeholder="请输入数据源名称" />
        </el-form-item>
        <el-form-item label="分类分级框架" prop="projectName" :rules="rules.projectName">
          <el-select v-model="form.projectName" placeholder="请输入分类分级框架" clearable @change="projectChangeEdit($event)">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="主机" prop="targetIp" :rules="rules.targetIp">
          <el-input v-model="form.targetIp" @input="targetIpRulesFn" placeholder="请输入主机IP地址" />
        </el-form-item>

        <el-form-item label="端口" prop="targetPort" :rules="rules.targetPort">
          <el-input v-model="form.targetPort" placeholder="请输入数据库端口" />
        </el-form-item>
        <el-form-item label="用户" prop="targetUserName" :rules="rules.targetUserName">
          <el-input v-model="form.targetUserName" placeholder="请输入数据库用户名称" />
        </el-form-item>
        <el-form-item label="密码" prop="targetUserPassword" :rules="rules.targetUserPassword">
          <el-input v-model="form.targetUserPassword" maxlegth="100" placeholder="请输入数据库密码" />
        </el-form-item>
        <el-form-item v-show="isServiesNameRequired" label="服务名" prop="connectionValue"
          :rules="rules.connectionValue()">
          <el-input v-model="form.connectionValue" maxlength="50" @input="serviesNameInput(form.connectionValue)"
            placeholder="请输入" />
        </el-form-item>
        <el-form-item v-show="isServiesNameRequired" label="连接方式">
          <el-radio v-model="connectionType" label="0">SID</el-radio>
          <el-radio v-model="connectionType" label="1">Service Name</el-radio>
        </el-form-item>
        <el-form-item label="扫描内容" prop="scanContentMsg" :rules="rules.scanContentMsg">
          <div @click="scanContentFn()"><el-input v-model="form.scanContentMsg" readonly placeholder="点击获取扫描配置" /></div>
          <!-- <el-select ref="selectRef" allow-create @change="targetDatabaseChange" filterable multiple clearable
            v-model="form.targetDatabase" placeholder="请选择数据库名称">
            <el-option v-if="targetDataList.length" key="all" label="全选" value="all"></el-option>
            <el-option v-for="item in targetDataList" :key="item.value" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
          <div class="getDiv">
            <el-button type="primary" @click="getDatabaseName">获 取</el-button>
          </div> -->
        </el-form-item>
        <el-form-item label="来源业务系统" prop="businessName" :rules="rules.businessName">
          <el-input v-model="form.businessName" maxlength="50" @input="businessNameFn(form.businessName)"
            placeholder="请输入来源业务系统" />
        </el-form-item>
        <!-- <p>代理数据库信息</p>
        <el-form-item label="代理端口" prop="proxyPort">
          <el-input v-model="form.proxyPort" placeholder="请输入代理端口" />
        </el-form-item>
        <el-form-item label="代理ip" prop="proxyIp">
          <el-input v-model="form.proxyIp" placeholder="请输入代理ip" />
        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="connectTest('form')">测试</el-button>
      </div>
    </el-dialog>
    <!-- 数据扫描 -->
    <el-dialog class="marking" title="数据扫描" :visible.sync="markingVisible" width="450px" append-to-body
      :close-on-click-modal="false">
      <div style="text-align: center;">
        <el-radio-group v-model="radio" @change="handleChange">
          <el-radio label="1">追加</el-radio>
          <el-radio label="0">覆盖</el-radio>
        </el-radio-group>
        <div style="display: flex; justify-content: center; margin-top: 10px; ">
          <div style="margin-right: 5px;line-height: 36px; ">抽样数量:</div>
          <el-input style="width: 60%;" type="number" v-model="samplingNum" placeholder="请输入抽样数量"
            @input="handleInput"></el-input>
        </div>
        <div style="text-align: right;">
          <el-button type="primary" @click="markingCli">确定</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog class="deleteCla" title="系统提示" :visible.sync="deleteVisible" width="450px" append-to-body
      :close-on-click-modal="false">
      <div style="position: relative; ">
        <div style="height: 66px;">
          <i class="el-icon-warning" style="color: #ffba00; font-size: 30px;margin-right: 5px;"></i>
          <span style="position: absolute; top: 5px; ">是否确认删除数据库代理编号为{{ serialNumber }}的数据项,<span
              style="color: red;">并同时关联删除扫描记录</span></span>
        </div>
        <div style="text-align: right;">
          <el-button @click="deleteVisible = false">取消</el-button>
          <el-button type="primary" @click="deleteClick(serialNumber)">确定</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="新增Excel文件" v-loading="importDataLoading" :visible.sync="importData.importShow" width="700px"
      append-to-body :close-on-click-modal="false">
      <el-form class="importForm" :rules="importDataRules" :model="importData" size="medium" ref="importData"
        :inline="true" label-width="120px">
        <el-form-item label="数据源名称" prop="sourceName">
          <el-input v-model="importData.sourceName" maxlength="50"
            @blur="getimortantNameTestingFn(importData.sourceName)" @input="importNameTestingFn(importData.sourceName)"
            placeholder="请输入数据源名称"></el-input>
        </el-form-item>
        <el-form-item class="addSelectClass" label="分类分级框架" prop="categoryId">
          <el-select v-model="importData.categoryId" class="serachInput" placeholder="全部">
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
          <el-upload class="upload-demo" :limit="1" :file-list="importData.fileList" :auto-upload="false"
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
    </el-dialog>
    <el-drawer title="结果查看" class="dialogClass" :visible.sync="drawerShow" :destroy-on-close="true" direction="rtl"
      size="80%" :before-close="handleClose">
      <Result :treeOptions="treeOptions" :drawerData="drawerData" />
    </el-drawer>

    <el-dialog class="deleteCla" title="扫描配置" :visible.sync="scanContentShow" width="750px" append-to-body
      :close-on-click-modal="false">
      <div style="position: relative;">
        <div class="data-selector">
          <!-- 左侧可选列表和中间搜索框 -->
          <el-card class="combined-panel">
            <div class="left-panel">
              <div slot="header" class="clearfix">
                <span>可选</span>
              </div>
              <el-checkbox v-model="checkAll" @change="handleCheckAllChange" class="leftCheckAll">全选</el-checkbox>
              <div v-for="option in options" :key="option.value" class="option-item leftCheckAll"
                :class="{ 'active': option === activeOption }" @click.stop="expandOption(option)">
                <el-checkbox v-model="checkedOptions" :label="option.value" @change="toggleMiddleOptions(option)"
                  :indeterminate="option.indeterminate">
                  {{ option.label }}
                </el-checkbox>
                <i class="el-icon-arrow-right expand-icon"></i>
              </div>
            </div>
            <div class="middle-panel">
              <el-input placeholder="请输入表名" v-model="searchQuery" clearable>
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
              </el-input>
              <el-checkbox v-if="middleCheckVisible" v-model="checkAllMiddle" :indeterminate="isIndeterminate"
                @change="handleMiddleCheckAllChange">
                全选
              </el-checkbox>
              <el-checkbox-group v-model="checkedTables" @change="handleCheckedTablesChange">
                <el-checkbox v-for="table in filteredTables" :label="table.value" :key="table.value">{{ table.label
                }}</el-checkbox>
              </el-checkbox-group>
            </div>
          </el-card>
          <!-- 右侧已选列表 -->
          <el-card class="right-panel">
            <div slot="header" class="clearfix">
              <span>已选 ({{ selectedCount }}张数据表 + {{ fieldCount }}个字段)</span>
              <el-button style="float: right; padding: 3px 0" type="text" @click="clearSelection">清空</el-button>
            </div>
            <ul>
              <li v-for="item in selectedItems" :key="item.label">
                {{ item.label }} ({{ item.fieldCount }}个字段)
                <el-button type="text" icon="el-icon-close" @click="removeItemByLabel(item.label)"></el-button>
              </li>
            </ul>
          </el-card>
        </div>
        <div style="text-align: right;">
          <el-button @click="scanContentShow = false">取消</el-button>
          <el-button type="primary" @click="confirmSelection">确定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  usersAddI
} from "@/api/system/proxyUser";

import {
  listProxys, getProxys, connectTestI, delProxys, updateProxys,
  importExcel, publish, createProxys, databaseMaskI, strategyAll, databaseMask, getListTables, databaseListI
} from "@/api/system/proxys";
import {
  forceLogout, nameTesting,getFrameworks, checkSourceName
} from "@/api/system/protectCategory"
import Result from './components/result.vue'
import Vue from 'vue';
export default {
  name: "Proxys",
  components: { Result },
  data() {
    return {
      checkAll: false, // 左侧全选
      isIndeterminateLeft: false, // 左侧半选数据
      isIndeterminate: false, // 中间半选数据
      checkAllMiddle: false, // 中间全选框
      checkedOptions: [], // 左侧绑定数据
      options: [
        {
          value: '1',
          label: 'kms',
          children: [
            { value: 'kms_certificate', label: 'kms_certificate (100字段)', count: 200, parentID: '1', },
            { value: 'ksm_config', label: 'ksm_config (300字段)', count: 300, },
            { value: 'ksm_dcit', label: 'ksm_dcit (400字段)' },
            { value: 'kms_hadoop_key', label: 'kms_hadoop_key (200字段)' },
            { value: 'kms_key_pair', label: 'kms_key_pair (600字段)' }
          ]
        },
        {
          value: '2',
          label: 'scheduler',
          children: [
            { value: 'scheduler_task', label: 'scheduler_task (50字段)' },
            { value: 'scheduler_log', label: 'scheduler_log (200字段)' }
          ]
        },
        {
          value: '3',
          label: 'uim',
          children: [
            { value: 'uim_user', label: 'uim_user (300字段)' },
            { value: 'uim_role', label: 'uim_role (150字段)' }
          ]
        },
        {
          value: '4',
          label: 'sem',
          children: [
            { value: 'sem_data', label: 'sem_data (400字段)' },
            { value: 'sem_config', label: 'sem_config (100字段)' }
          ]
        },
        {
          value: '5',
          label: 'demo',
          children: [
            { value: 'demo_table', label: 'demo_table (200字段)' }
          ]
        }
      ], // 左侧复选数据
      searchQuery: '', // 中间搜索
      checkedTables: [], // 中间绑定数据
      tables: [], // 中间数据
      selectedItems: [], // 右侧数据
      scanContentShow: false, // 扫描配置弹框
      treeOptions: [],
      drawerShow: false,
      samplingNum: 10,
      drawerData: null,
      checkList: true,
      show: true,
      serialNumber: "",
      deleteVisible: false,
      markingId: '',
      radio: '0',
      markingVisible: false,
      addUserId: 0,
      mainLoading: false,
      targetDataList: [],
      dataYTpeList: [
        {
          value: 'DATABASE',
          label: '数据库'
        }, {
          value: 'FILE',
          label: 'Excel表'
        }
      ],
      scanPlanStateList: [{ name: "全部", id: 0 }, { name: "扫描中", id: 1 }, { name: "扫描成功", id: 2 }, { name: "扫描失败", id: 3 }, { name: "待扫描", id: 4 }], // 扫描类型
      databaseTypeList: [
        { name: "MYSQL", id: 0, value: "MYSQL" },
        { name: "SQL_SERVER", id: 1, value: "SQL_SERVER" },
        { name: "ORACLE", id: 2, value: "ORACLE" },
        { name: "POSTGRESQL", id: 3, value: "POSTGRESQL" },
        { name: "达梦", id: 4, value: "DM" }
      ],
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
      formProjectListEdit: [],
      selectProjectListEdit: [{ name: "全部", id: 0 }],
      projectNameEdit: "",
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
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
      },
      connectionType: '1',
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
        connectionValue: () => {
          return [{
            required: this.isServiesNameRequired,
            message: '请输入',
            trigger: 'blur'
          }]
        },
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
        businessName: '',
      },
      isServiesNameRequired: false,
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
      middleCheckVisible: false, // 新增属性，控制中间全选复选框的显示与隐藏
    };
  },
  computed: {
    filteredTables() {
      return this.tables.filter(table => table.label.toLowerCase().includes(this.searchQuery.toLowerCase()));
    },
    selectedCount() {
      return this.selectedItems.length;
    },
    fieldCount() {
      return this.selectedItems.reduce((total, item) => total + item.fieldCount, 0);
    },
  },
  created() {
    // this.queryParams.projectId = 0
    // this.getProjectListEdit()
    this.gettreeOptionsList()
    this.getList()
  },
  methods: {
    toggleMiddleOptions(option) {
      if (this.checkedOptions.includes(option.value)) {
        // 如果左侧复选框被选中，自动选中其对应的中间复选框
        option.children.forEach(child => {
          if (!this.checkedTables.includes(child.value)) {
            this.checkedTables.push(child.value);
            child.checked = true;
          }
        });
      } else {
        // 如果左侧复选框被取消选中，取消选中其对应的中间复选框
        option.children.forEach(child => {
          this.checkedTables = this.checkedTables.filter(tableValue => tableValue !== child.value);
          child.checked = false;
        });
      }

      this.updateCheckAllState();
      this.updateMiddleCheckAllState();
      this.updateLeftPanelState();
      this.updateSelectedItems(); // 更新右侧数据
    },
    handleCheckAllChange(value) {
      if (value) {
        this.checkedOptions = this.options.map(option => option.value);
        this.options.forEach(option => {
          option.children.forEach(child => {
            if (!this.checkedTables.includes(child.value)) {
              this.checkedTables.push(child.value);
              child.checked = true;
            }
          });
        });
      } else {
        this.checkedOptions = [];
        this.checkedTables = [];
        this.options.forEach(option => {
          option.children.forEach(child => {
            child.checked = false;
          });
        });
      }

      this.updateMiddleCheckAllState();
      this.updateLeftPanelState();
      this.updateSelectedItems(); // 更新右侧数据
    },
    handleMiddleCheckAllChange(value) {
      if (value) {
        this.checkedTables = this.tables.map(table => table.value);
        this.tables.forEach(table => {
          table.checked = true;
        });
      } else {
        this.checkedTables = [];
        this.tables.forEach(table => {
          table.checked = false;
        });
      }

      this.updateCheckAllState();
      this.updateMiddleCheckAllState();
      this.updateLeftPanelState();
      this.updateSelectedItems(); // 更新右侧数据
    },
    expandOption(option) {
      console.log(option);

      // 直接从 options 的 children 中获取数据并填充到 middle-panel 中
      this.tables = option.children;
      this.middleCheckVisible = true; // 显示中间全选复选框
      this.updateMiddleCheckAllState();
      this.updateSelectedItems(); // 更新右侧数据

      // 设置当前活跃的选项
      this.activeOption = option;
    },
    handleCheckedTablesChange(value) {
      this.selectedItems = this.tables.filter(table => value.includes(table.value)).map(table => ({
        value: table.value,
        label: table.label,
        fieldCount: parseInt(table.label.match(/\d+/)[0]) || 0
      }));

      // 更新左侧父节点复选框的状态
      this.updateLeftPanelState();

      // 更新右侧展示的数据
      this.updateSelectedItems();

      this.updateCheckAllState();
      this.updateMiddleCheckAllState();
    },
    removeItem(item) {
      this.checkedTables = this.checkedTables.filter(value => value !== item.value);
      this.tables.find(table => table.value === item.value).checked = false;

      // 更新右侧展示的数据
      this.updateSelectedItems();

      this.updateCheckAllState();
      this.updateMiddleCheckAllState();
      this.updateLeftPanelState();
    },
    clearSelection() {
      this.checkedTables = [];
      this.selectedItems = [];
      this.checkAllMiddle = false;
      this.checkedOptions = [];
      this.options.forEach(option => {
        option.children.forEach(child => {
          child.checked = false;
        });
      });

      // 更新右侧展示的数据
      this.updateSelectedItems();

      this.updateLeftPanelState();
    },
    /**
     * 更新左侧全选复选框的状态
     * 根据当前已选中的选项数量来决定左侧全选复选框的状态（选中、未选中）
     */
    updateCheckAllState() {
      // 计算已选中的选项数量
      const checkedCount = this.checkedOptions.length;
      // 获取所有可选项的总数
      const totalOptionsCount = this.options.length;

      // 如果没有任何选项被选中，则将左侧全选复选框设置为未选中状态
      if (checkedCount === 0) {
        this.checkAll = false;
      }
      // 如果所有选项都被选中，则将左侧全选复选框设置为选中状态
      else if (checkedCount === totalOptionsCount) {
        this.checkAll = true;
      }
      // 如果部分选项被选中，则保持左侧全选复选框为未选中状态
      else {
        this.checkAll = false;
      }
    },
    /**
     * 更新中间面板的全选状态和半选状态
     * 根据当前选中的子节点数量来决定中间面板的全选复选框和半选状态
     */
    updateMiddleCheckAllState() {
      // 获取当前选中的子节点数量
      const checkedCount = this.checkedTables.length;
      // 获取中间面板中所有子节点的总数
      const totalTablesCount = this.tables.length;

      // 如果没有子节点被选中
      if (checkedCount === 0) {
        this.checkAllMiddle = false; // 中间全选复选框不选中
        this.isIndeterminate = false; // 中间复选框不处于半选状态
      }
      // 如果所有子节点都被选中
      else if (checkedCount === totalTablesCount) {
        this.checkAllMiddle = true; // 中间全选复选框选中
        this.isIndeterminate = false; // 中间复选框不处于半选状态
      }
      // 如果部分子节点被选中
      else {
        this.checkAllMiddle = false; // 中间全选复选框不选中
        this.isIndeterminate = true; // 中间复选框处于半选状态
      }
    },
    /**
     * 更新左侧面板的状态
     * 根据当前选中的子节点数量来决定左侧父节点的全选、半选状态和高亮显示
     */
    updateLeftPanelState() {
      // 遍历所有左侧选项
      for (let i = 0; i < this.options.length; i++) {
        const option = this.options[i];
        // 获取当前选项的所有子节点值
        const childrenValues = option.children.map(child => child.value);
        // 获取当前选中的子节点
        const checkedChildren = this.checkedTables.filter(value => childrenValues.includes(value));

        if (checkedChildren.length === 0) {
          // 如果没有子节点被选中
          this.checkedOptions = this.checkedOptions.filter(opt => opt !== option.value); // 移除该选项的选中状态
          option.indeterminate = false; // 设置非半选状态
        } else if (checkedChildren.length === option.children.length) {
          // 如果所有子节点都被选中
          if (!this.checkedOptions.includes(option.value)) {
            this.checkedOptions.push(option.value); // 添加该选项到选中状态
          }
          option.indeterminate = false; // 设置非半选状态
        } else {
          // 如果部分子节点被选中
          if (!this.checkedOptions.includes(option.value)) {
            this.checkedOptions.push(option.value); // 添加该选项到选中状态
          }
          option.indeterminate = true; // 设置半选状态
        }
      }
      // 更新左侧全选复选框的半选状态
      this.isIndeterminateLeft = this.checkedOptions.length > 0 && this.checkedOptions.length < this.options.length;
    },
    /**
     * 根据标签移除对应的子节点
     * 通过标签找到父节点，然后移除该父节点下的所有子节点
     * @param {string} label - 父节点的标签
     */
    removeItemByLabel(label) {
      // 根据标签找到对应的父节点
      const parentOption = this.options.find(option => option.label === label);
      if (parentOption) {
        // 遍历父节点的所有子节点并移除它们
        parentOption.children.forEach(child => {
          this.removeItem(child);
        });
      }
    },
    /**
     * 更新选中的项目列表
     * 根据已选中的表（checkedTables）更新右侧已选列表（selectedItems）
     * 计算每个父节点的字段总数
     */
    updateSelectedItems() {
      // 创建一个 Set 来存储选中的父节点标签，确保唯一性
      const selectedParentLabels = new Set();
      // 创建一个对象来存储每个父节点的字段总数
      const fieldCountMap = {};

      // 清空当前的选中项目列表
      this.selectedItems = [];
      // 遍历所有已选中的表
      this.checkedTables.forEach(tableValue => {
        // 根据表值找到对应的表对象
        const table = this.tables.find(table => table.value === tableValue);
        if (table) {
          // 找到包含该表的父节点
          const parentOption = this.options.find(option => option.children.some(child => child.value === tableValue));
          if (parentOption) {
            // 将父节点的标签添加到 Set 中
            selectedParentLabels.add(parentOption.label);
            // 初始化或累加该父节点的字段总数
            if (!fieldCountMap[parentOption.label]) {
              fieldCountMap[parentOption.label] = 0;
            }
            fieldCountMap[parentOption.label] += parseInt(table.label.match(/\d+/)[0]) || 0;
          }
        }
      });

      // 将 Set 转换为数组，并为每个父节点创建一个对象，包含标签和字段总数
      this.selectedItems = Array.from(selectedParentLabels).map(label => ({
        label: label,
        fieldCount: fieldCountMap[label]
      }));
    },
    databaseTypeChange(val) {
      if (val == 'ORACLE') {
        this.isServiesNameRequired = true
      } else {
        this.isServiesNameRequired = false
      }
    },
    getNameTestingFn(val, from) {
      this.importDataLoading = true
      let params = {
        sourceName: val
      }
      if (val) {
        checkSourceName(params).then((res) => {
          return res.msg == '可以使用'
        })
          .catch((err) => {
            this.form.sourceName = ''
            this.importDataLoading = false
            return false
          })
      } else {
        this.form.sourceName = ''
        this.importDataLoading = false
        return false
      }
    },

    getimortantNameTestingFn(val, from) {
      this.importDataLoading = true
      let params = {
        sourceName: val
      }
      if (val) {
        checkSourceName(params).then((res) => {
          this.importDataLoading = false
          return res.msg == '可以使用'
        })
          .catch((err) => {
            this.importData.sourceName = ''
            this.importDataLoading = false
            return false
          })
      } else {
        this.importData.sourceName = ''
        this.importDataLoading = false
        return false
      }
    },
    nameTestingFn(val) {
      this.form.sourceName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    stateMsg(val) {
      let msg = ''
      for (let item of this.executeStatus) {
        if (item.value == val) {
          msg = item.label
        }
      }
      return msg
    },
    businessNameFn(val) {
      this.form.businessName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
      // nameTesting().then(res=>{
      //   console.log(res);
      // })
    },
    serviesNameInput(val) {
      this.form.connectionValue = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
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
    gettreeOptionsList() {
      this.mainLoading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        this.mainLoading = false
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
            connectionType: this.connectionType,
            connectionValue: this.form.connectionValue,
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
    submitFormExcelFn() {
      this.$refs["importData"].validate(async (valid) => {
        if (valid) {
          this.importDataLoading = true
          // await this.rulsNameIsRight(this.importData.categoryId, params.name)

          const formData = new FormData();
          // 将文件数组添加到 FormData 对象中
          formData.append('file', this.importData.fileList[0].raw);
          formData.append('frameworkNameId', this.importData.categoryId);
          formData.append('sourceName', this.importData.sourceName);
          formData.append('businessName', this.importData.businessName);
          await importExcel(formData).then(res => {
            this.messsucc(res, '导入条目数量共');
            // this.getList();
            this.importData.categoryName = ''
            this.importData.importFile = ''
            this.importData.sourceName = ''
            this.importData.categoryId = ''
            this.importData.fileList = []
            this.importData.businessName = ''
            this.resetQuery()
            this.importData.importShow = false
            this.importDataLoading = false
          })
            .catch((err) => {
              this.importDataLoading = false
              this.importData.importFile = ''
              this.importData.fileList = []
            })
        } else {
          return false
        }
      });
    },
    handleClose() {
      this.drawerShow = false
    },
    handleFileExceed(files, fileList) {
      this.importData.importFile = files[0].name
      this.importData.fileList = fileList;
    },
    markingCli() {
      this.$confirm('您是否要开始数据扫描？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ck = ''
        if (this.checkList == true) {
          ck = '1'
        } else {
          ck = '0'
        }
        let data = {
          nlp: ck,
          proxyId: this.markingI,
          type: this.radio,
          samplingSize: this.samplingNum

        }
        databaseMaskI(data).then((res => {
          this.$alert('数据已提交', '数据扫描', {
            confirmButtonText: '确定',
            type: 'success'
          });
          this.markingVisible = false
          this.getList();
        }))
        // 用户点击确定按钮，执行相关操作
      }).catch(() => {
        // 用户点击了取消按钮，不做任何操作
      });

    },

    // 定时器，防抖使用
    inputSearch(data) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleQuery()
      }, 500); // 设置防抖的时间间隔为300毫秒
    },
    handleChange(value) {
      this.radio = value
    },
    deliveryStrategy() {
      this.$confirm('您是否要一键下发策略？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        strategyAll().then((res => {
          this.$message({
            message: "一键下发策略成功",
            duration: 5000,
            type: 'success'
          });

        }))
        // 用户点击确定按钮，执行相关操作
      }).catch(() => {
        // 用户点击了取消按钮，不做任何操作
      });
    },

    databasesNum(name, id) {
      this.$router.push({
        path: "/risk/proxyUser",
        query: { id: id, name: name },
      });
    },
    addSubmitForm() {
      this.$refs["addForm"].validate((valid) => {
        if (valid) {
          this.addForm.proxyDatabaseId = this.addUserId
          usersAddI(this.addForm).then((response) => {
            this.$message({
              message: "添加成功",
              duration: 3000,
              type: 'success'
            });
            this.getList();
          });
        }
      });

    },
    implementFn() {
      let dataS = this.$refs.tableRef.selection
      let flagList // 状态数据
      if (dataS && dataS.length > 0) {
        flagList = dataS.map(item => {
          return item.state
        })
        if (flagList.includes('RUNNING')) {
          this.$message({ message: '选中任务包含执行中任务，无法批量执行', type: 'warning' })
          return
        }
        if (flagList.includes('COMPLETE')) {
          this.$confirm(`选中任务包含已完成任务，重新执行任务，将会覆盖数据源上一次执行的所有结果`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let ids = dataS.map(item => {
              return item.id
            })
            let params = {
              proxyIds: ids.join(',')
            }
            databaseMask(params).then(res => {
              if (res.code == 200) {
                this.$message.success(res.msg)
                this.getList()
              }
            })
          })
          return
        }
        this.$confirm(`确定执行所选中的项吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let params = {
            proxyIds: ids.join(',')
          }
          databaseMask(params).then(res => {
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
    getProjectListEdit(key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        name: key,
      };
      getFrameworks(params).then((resp) => {
        this.formProjectListEdit = resp.data;
        let data = JSON.parse(JSON.stringify(this.formProjectListEdit))
        this.selectProjectListEdit = data;
        this.selectProjectListEdit.unshift({ name: "全部", id: 0 })
        // if (this.formProjectListEdit == null) {
        //   this.formProjectListEdit = this.projectList;
        // }
      });
    },
    selectProjectChangeEdit(e) {
      this.projectNameEdit = e
      // this.form.projectName = 
      this.queryParams.projectId = e

    },

    projectChangeEdit(e) {
      this.projectNameEdit = e
      // this.form.projectName = 
      this.form.projectId = e
    },
    /** 查询数据库代理列表 */
    getList() {
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
    // 连接测试
    connectTest(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let data = JSON.parse(JSON.stringify(this.form))
          delete data.projectName
          data.targetDatabase = JSON.stringify(data.targetDatabase)
          data.connectionType = this.connectionType
          data.databaseType = this.findDatabaseValueByName(this.form.databaseType)
          // for (let i = 0; i < this.databaseTypeList.length; i++) {
          //   if (this.form.databaseType == this.databaseTypeList[i].name) {
          //     data.databaseType = this.databaseTypeList[i].value
          //   }
          // }
          connectTestI(data).then((res => {
            if (res.code == 200) {
              this.showSucType = 1
            } else {
              this.showSucType = 2
            }

          })).catch(() => {
            this.showSucType = 2
          })

        } else {
          // console.log('error submit!!');
          return false;
        }

      })
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
      this.showSucType = 0
      this.projectNameEdit = null
      this.targetDataList = []
      this.connectionType = '1'
      this.reset();
      this.open = true;
      this.title = "添加数据库";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getProxys(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据库";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateProxys(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            let data = JSON.parse(JSON.stringify(this.form))
            delete data.projectName
            data.connectionType = this.connectionType
            data.targetDatabase = JSON.stringify(data.targetDatabase)
            data.databaseType = this.findDatabaseValueByName(this.form.databaseType)
            // for (let i = 0; i < this.databaseTypeList.length; i++) {
            //   if (this.form.databaseType == this.databaseTypeList[i].name) {
            //     data.databaseType = this.databaseTypeList[i].value
            //   }
            // }
            createProxys(data).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    deleteClick(ids) {
      delProxys(ids).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
        this.deleteVisible = false
      }).catch(() => { })
    },
    handleEcelFn() {
      this.importData.importShow = true
      this.resetForm("importData");
    },
    handleFileChange(file, fileList) {
      this.importData.importFile = file.raw.name
      this.importData.fileList = fileList;
    },
    // 导入取消
    importcancel() {
      this.importData.categoryId = ''
      this.importData.importFile = ''
      this.importData.sourceName = ''
      this.importData.businessName = ''
      this.importData.fileList = []
      this.importData.importShow = false
    },
    downloadFile() {
      const link = document.createElement('a');
      link.href = '/importFile.xlsx'; // 替换为你的文件路径
      link.download = '元数据导入样例.xlsx'; // 设置下载后的文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/proxys/export', {
        ...this.queryParams
      }, `proxys_${new Date().getTime()}.xlsx`)
    },

    executeFn() {
      let dataS = this.$refs.tableRef.selection
      let isWancheng
      let isZhixingzhong
      if (dataS && dataS.length > 0) {
        for (let val of dataS) {
          if (val.status == '执行中') {
            isZhixingzhong = true
            return
          } else if (val.status == '已完成') {
            isWancheng = true
          }
        }
        if (isZhixingzhong) {
          this.$message({ message: '选中任务包含执行中任务，无法批量执行', type: 'warning' })
        } else if (isWancheng) {
          this.$confirm(`选中任务包含已完成任务，重新执行任务，将会覆盖数据源上一次执行的所有结果`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            forceLogout(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.getList()
              }
            })
          })
        } else {
          forceLogout(data).then(res => {
            if (res.code == 200) {
              this.messsucc(res, flag)
              this.getList()
            }
          })
        }
      } else {
        this.$message({ message: '至少选择一条数据', type: 'warning' })
      }
    },
    deleteFn() {
      let dataS = this.$refs.tableRef.selection
      let flagList // 为1 代表选中数据中有执行中的，2为没有执行中，但是有执行完成的
      if (dataS && dataS.length > 0) {
        flagList = dataS.map(item => {
          return item.state
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
    // 扫描内容点击事件
    async scanContentFn() {
      let data = {
        targetIp: this.form.targetIp,
        targetPort: this.form.targetPort,
        targetUserName: this.form.targetUserName,
        targetUserPassword: this.form.targetUserPassword,
        connectionType: this.connectionType,
        connectionValue: this.form.connectionValue,
        sourceName: this.form.sourceName,
        databaseType: this.findDatabaseValueByName(this.form.databaseType)
      }
      let res = await getListTables(data)
      this.scanContentShow = true
    },
    confirmSelection() {
      this.scanContentShow = false;
      // 确保右侧已选列表中的内容正确
      this.selectedItems = this.tables.filter(table => this.checkedTables.includes(table.value)).map(table => ({
        value: table.value,
        label: table.label,
        fieldCount: parseInt(table.label.match(/\d+/)[0]) || 0
      }));

      // 更新右侧展示的数据
      this.updateSelectedItems();
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

.dialogClass /deep/ .el-drawer__body {
  /* overflow: hidden!important; */
}

.data-selector {
  display: flex;
  height: 400px;
}

.combined-panel {
  display: flex;
  width: 100%;
  margin: 10px;
  flex-direction: row;
  /* 确保是水平排列 */
}

.left-panel {
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
  margin-right: 10px;
  /* 添加右侧间距 */
}

.middle-panel {
  width: 55%;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
  margin-right: 10px;
  /* 添加右侧间距 */
}

.left-panel {
  border-right: 1px solid #ebeef5;
}

.middle-panel {
  border-left: 1px solid #ebeef5;
}

.right-panel {
  width: calc(33.33% - 20px);
  margin: 10px;
}

.middle-panel .el-input {
  margin-bottom: 10px;
}

.right-panel ul {
  list-style-type: none;
  padding: 0;
}

.right-panel li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

/* 添加复选框的上下外边距 */
.left-panel /deep/ .el-checkbox,
.middle-panel /deep/ .el-checkbox,
.right-panel /deep/ .el-checkbox {
  margin-top: 8px;
  margin-bottom: 8px;
  display: block;
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.expand-icon {
  cursor: pointer;
  margin-left: 10px;
}

.combined-panel /deep/ .el-card__body {
  display: flex !important;
  width: 100%;
}

.option-item.selected {
  background-color: #e6f7ff;
  /* 高亮颜色 */
}

.leftCheckAll {
  padding: 0 10px;
}

.option-item.active {
  background-color: #e6f7ff;
  /* 当前活跃的背景颜色 */
}
</style>