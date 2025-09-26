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

      <el-form-item label="分类分级标准" prop="projectId">
        <el-select clearable v-model="queryParams.projectId" filterable @change="inputSearch" placeholder="请选择分类分级标准">
          <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="主机信息" prop="targetIpPort">
        <el-input v-model="queryParams.targetIpPort" @input="inputSearch" placeholder="请输入主机信息" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="扫描状态" prop="scanState">
        <el-select clearable v-model="queryParams.scanState" @change="inputSearch" placeholder="请选择扫描状态">
          <el-option v-for="item in executeStatus" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item class="searchBtn">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item> -->
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="medium" @click="handleAdd">新增数据库</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="medium" @click="handleEcelFn">新增Excel文件</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-close" size="medium" @click="deleteFn">删除</el-button>
      </el-col>
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>
    <el-table v-loading="loading" height="570px" class="tableBox" :data="proxysList"
      @selection-change="handleSelectionChange" ref="tableRef">
      <template slot="empty">
        <el-empty description="暂无数据"></el-empty>
      </template>
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
      <el-table-column label="分类分级标准" align="center" prop="projectName" />
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
      <el-table-column label="表数量" align="center" prop="tableCount" />
      <el-table-column label="字段数量" align="center" prop="fieldCount" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="scanStateClickFn(scope.row)"
            :disabled="scope.row.scanState == 'RUNNING' || scope.row.databaseType == 'Excel' || scope.row.databaseType == 'API'">开始扫描</el-button>
          <el-button size="mini" type="text" @click="stopScan(scope.row)"
            :disabled="scope.row.scanState == 'RUNNING' || scope.row.databaseType == 'Excel' || scope.row.databaseType == 'API'">终止扫描</el-button>
          <el-button size="mini" type="text" :disabled="scope.row.scanState == 'RUNNING'"
            @click="scanContentEdit(scope.row)">编辑</el-button>
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
            <el-option v-for="item in databaseTypeList" :key="item.id" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据源名称" prop="sourceName" :rules="rules.sourceName">
          <el-input v-model="form.sourceName" maxlength="50" placeholder="请输入数据源名称" />
        </el-form-item>
        <el-form-item label="分类分级标准" prop="projectName" :rules="rules.projectName">
          <el-select v-model="form.projectName" :disabled="editIsFlag" placeholder="请输入分类分级框架" clearable
            @change="projectChangeEdit($event)">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="来源业务系统" prop="businessName" :rules="rules.businessName">
          <!-- @input="businessNameFn(form.businessName)" -->
          <el-input v-model="form.businessName" maxlength="50" placeholder="请输入来源业务系统" />
          <div style="font-size: 12px; font-style: italic;">示例：个人健康生理信息管理系统（建议使用中文进行描述）</div>
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
          <el-input v-model="form.targetUserPassword" show-password maxlegth="100" placeholder="请输入数据库密码" />
        </el-form-item>
        <el-form-item v-show="form.databaseType == 'ORACLE'" label="服务名" prop="connectionValue"
          :rules="rules.connectionValue()">
          <el-input v-model="form.connectionValue" maxlength="50" @input="serviesNameInput()" placeholder="请输入" />
        </el-form-item>
        <el-form-item v-show="form.databaseType == 'ORACLE'" label="连接方式">
          <el-radio v-model="connectionType" label="0">SID</el-radio>
          <el-radio v-model="connectionType" label="1">Service Name</el-radio>
        </el-form-item>
        <el-form-item v-show="form.databaseType != 'ORACLE'" label="实例名/库名" prop="examplesName"
          :rules="rules.examplesName()">
          <el-input v-model="form.examplesName" placeholder="请输入实例名/库名" />
        </el-form-item>
        <el-form-item label="扫描内容" prop="tabelCheckedName">
          <div @click="scanContentFn()"><el-input style="position: relative;" readonly>
            </el-input>
            <el-tag style="position: absolute;top: 4px;left: 6px;">{{ form.tabelCheckedName ? form.tabelCheckedName :
              '点击选择扫描内容' }}</el-tag>
          </div>
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
        <el-button type="primary" plain @click="submitForm">确 定</el-button>
        <el-button @click="scanContentCanlce">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="titleExcel" v-loading="importDataLoading" :visible.sync="importData.importShow" width="700px"
      append-to-body :close-on-click-modal="false">
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
          <el-upload ref="uploadRef" class="upload-demo" :limit="1" :file-list="importData.fileList"
            :auto-upload="false" :http-request="submitFormExcelFn" action="" accept=".xls,.xlsx,csv"
            :show-file-list="false" :on-change="handleFileChange" :on-exceed="handleFileExceed">
            <el-button size="mini" type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <el-button style="margin-left: 100px;" size="small" type="text" @click="downloadFile" id="btnDownload"
        icon="el-icon-download">样例下载</el-button>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitFormExcelFn">确 定</el-button>
        <el-button @click="importcancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-drawer title="结果查看" class="dialogClass" :visible.sync="drawerShow" :destroy-on-close="true" direction="rtl"
      size="80%" :before-close="handleClose">
      <Result :treeOptions="treeOptions" :drawerData="drawerData" />
    </el-drawer>

    <el-dialog title="扫描配置" class="scanContentBox" v-loading="scanContentLoading" :visible.sync="scanContentShow"
      width="950px" append-to-body :close-on-click-modal="false">
      <TableSelector v-if="scanContentShow" :treeCheckedData="treeCheckedData"
        :scanContentTreeData="scanContentTreeData" :databaseTableNameParama="databaseTableNameParama"
        ref="scanContentTreeRef" />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="scanContentSubmitFn">确 定</el-button>
        <el-button @click="scanContentShow = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  usersAddI
} from "@/api/system/proxyUser";

import {
  listProxys, getProxys, connectTestI, delProxys, addProxys, updateProxys,
  importExcel, publish, saveDatabaseAndTables, startI, stopI, databaseMaskI, strategyPushI, strategyAll, databaseMask, getListTables, databaseListI, getDatabaseNameList, getDatabaseTableNameList, stopDataScan
} from "@/api/system/proxys";
import {
  forceLogout, nameTesting, dataSacn, getFrameworks, checkSourceName, getDatabaseAndTablesById, updateDatabaseAndTables
} from "@/api/system/protectCategory"
import Result from './components/result.vue'
import TableSelector from './components/TableSelector.vue'
import Vue from 'vue';
import { js } from "js-beautify";
import { index, timeThursdays } from "d3";
export default {
  name: "Proxys",
  components: { Result, TableSelector, },
  data() {
    return {
      databaseTableNameParama: {}, // 数据库表名传参
      scanContentShow: false, // 扫描配置弹框
      scanStateName: false,// 扫描中展示
      scanContentLoading: false,
      editIsFlag: false,
      treeOptions: [],
      scanStateBtnDisabled: false,// 扫描按钮禁用条件
      treeCheckedData: [],//树节点已选中数据
      scanContentTreeData: [],//// 扫描配置树数据
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
      imgSrc: {
        'ERR': require('@/assets/stateImg/stateDanger.png'),
        'COMPLETE': require('@/assets/stateImg/stateSuess.png'),
        'NONE': require('@/assets/stateImg/stateWaiting.png'),
        'RUNNING': require('@/assets/stateImg/stateing.png'),
      },
      dataYTpeList: [
        {
          value: 'DATABASE',
          label: '数据库'
        }, {
          value: 'FILE',
          label: 'Excel表'
        }
        , {
          value: 'API',
          label: 'API'
        }
      ],
      databaseTypeList: [
        { name: "MYSQL", id: 0, value: "MYSQL", defaultPort: '3306' },
        { name: "SQL_SERVER", id: 1, value: "SQL_SERVER", defaultPort: '1433' },
        { name: "ORACLE", id: 2, value: "ORACLE", defaultPort: '1521' },
        { name: "POSTGRESQL", id: 3, value: "POSTGRESQL", defaultPort: '5432' },
        { name: "DM", id: 4, value: "DM", defaultPort: '5236' },
        { name: "GREENPLUM", id: 5, value: "GREENPLUM", defaultPort: '5432' },
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
          label: '扫描完成'
        }, {
          value: 'RUNNING',
          label: '扫描中'
        }, {
          value: 'NONE',
          label: '待扫描'
        }, {
          value: 'ERR',
          label: '扫描失败'
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
        // targetPort:'3306',
        // targetIp:'192.168.2.38',
        // targetUserName:'root',
        // targetUserPassword:'your_password',
        tables: {},
      },
      connectionType: '1',
      titleExcel: '新增Excel文件',
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
        examplesName: () => {
          return [{
            required: ['SQL_SERVER', 'POSTGRESQL', 'GREENPLUM'].includes(this.form.databaseType),
            message: '请输入',
            trigger: 'blur'
          }]
        },
        connectionValue: () => {
          return [{
            required: this.isServiesNameRequired,
            message: '请输入',
            trigger: 'blur'
          }]
        },
        tabelCheckedName: [{
          required: true,
          validator: this.tabelCheckedNameRules,
          trigger: 'blur'
        }],
        targetIp: [
          { required: true, message: "请输入数据库地址", trigger: "blur" },
          {
            pattern: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            message: "请输入有效的IP地址"
          },
        ],
        targetPort: [
          { required: true, message: "请输入端口号", trigger: "blur" },
          {
            pattern:
              /^([1-9]\d{0,3}|0)$|^([1-5]\d{4})$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/,
            message:
              "请输入0~65535之间的5个数字",
          },
          // {
          //   min: 1,
          //   max: 5,
          //   message: "长度在 1 ~ 5 个字符",
          // },
        ],
      },
      importDataLoading: false,
      importData: {
        importFile: '', // 导入魔板文件名
        fileList: [],//导入模板的文件数据
        categoryId: '',//框架名称
        importShow: false,
        businessName: '',
        sourceName: '',
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
      tabelCheckedName: '',
    };
  },
  computed: {
  },
  created() {
    // this.queryParams.projectId = 0
    this.gettreeOptionsList()
    this.getList()
  },
  methods: {
    // 自定义校验规则
    tabelCheckedNameRules(rule, value, callback) {
      callback();
    },
    databaseTypeChange(e) {
      if (e == 'ORACLE') {
        this.isServiesNameRequired = true
      } else {
        this.isServiesNameRequired = false
      }
      this.form.targetPort = this.databaseTypeList.find(item => item.name === e)?.defaultPort || ''
    },
    scanContentCanlce() {
      this.open = false
      this.reset()
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
      if (val === 'Excel') {
        return 'Excel'
      }
      if (val === 'API') {
        return 'API'
      }
      let msg = ''
      for (let item of this.databaseTypeList) {
        if (item.value == val) {
          msg = item.name
        }
      }
      return msg || '未知来源'
    },
    businessNameFn(val) {
      this.form.businessName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    serviesNameInput(val) {
      this.form.connectionValue = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    targetIpRulesFn() {

    },
    importNameTestingFn(val) {
      this.importData.sourceName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    gettreeOptionsList() {
      this.mainLoading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        this.mainLoading = false
      });
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
    async submitFormExcelFn() {
      this.$refs["importData"].validate(async valid => {
        if (valid) {
          if (!await this.getimortantNameTestingFn()) {
            return
          }
          this.importDataLoading = true
          const formData = new FormData();
          if (this.importData.id) {
            formData.append('id', this.importData.id || '');
            // updateDatabaseAndTables(data)
          }
          // 将文件数组添加到 FormData 对象中
          if (this.importData.fileList && this.importData.fileList.length) {
            formData.append('file', this.importData.fileList[0].raw);
          }
          formData.append('frameworkNameId', this.importData.categoryId);
          formData.append('sourceName', this.importData.sourceName);
          formData.append('businessName', this.importData.businessName);
          formData.append('tabelCheckedName', this.importData.importFile);
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
          // await this.rulsNameIsRight(this.importData.categoryId, params.name)

        } else {
          return false
        }
      });
    },
    handleClose() {
      this.drawerShow = false
    },
    handleFileExceed(files, fileList) {
      this.$refs.uploadRef.clearFiles();
      this.$nextTick(() => {
        this.$refs.uploadRef.handleStart(files[0]); // 开始上传新文件
      });
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
    projectChangeEdit(e) {
      this.projectNameEdit = e
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
        databaseType: '',
        //  protocolPort: null,
        projectId: null,
        // proxyStatus: "0"
      };
      this.isServiesNameRequired = false
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
      this.showSucType = 0
      this.projectNameEdit = null
      this.connectionType = '1'
      this.reset();
      this.open = true;
      this.title = "添加数据库";
    },
    /** 提交按钮 */
    async submitForm() {
      this.$refs["form"].validate(async valid => {
        let data = JSON.parse(JSON.stringify(this.form))
        delete data.projectName
        if (!Array.isArray(data.targetDatabase)) {
          let str = data.targetDatabase
          data.targetDatabase = str.trim() // 去除字符串首尾的空白字符
            .replace(/^"|"$/g, '') // 移除首尾的引号
            .split(',') // 按逗号分割字符串
            .filter(Boolean); // 过滤掉空字符串
        }
        data.targetDatabase = JSON.stringify(data.targetDatabase)
        data.connectionType = this.connectionType
        data.targetIpPort = this.form.targetIp + ":" + this.form.targetPort
        console.log(data);
        if (!this.editIsFlag && !data.tables) {
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
    /** 删除按钮操作 */
    deleteClick(ids) {
      delProxys(ids).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
        this.deleteVisible = false
      }).catch(() => { })
    },
    handleEcelFn() {
      this.editIsFlag = false
      this.importData.importShow = true
      this.importData.categoryId = ''
      this.importData.importFile = ''
      this.importData.sourceName = ''
      this.importData.businessName = ''
      this.importData.id = ''
      this.titleExcel = '新增Excel文件'
      this.importData.fileList = []
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
    scanStateClickFn(row) {
      if (row.scanState == 'COMPLETE') {
        this.$confirm(`再次扫描将会覆盖之前的所有扫描结果，确定继续吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          dataSacn({ proxyIds: row.id }).then(async res => {
            // this.scanStateName = false
            await this.getList()
          }).finally(() => {
            this.loading = false
          })
        })
          .catch(() => {
            this.getList()
          })
      } else {
        this.loading = true
        dataSacn({ proxyIds: row.id }).then(async res => {
          // this.scanStateName = false
          await this.getList()
        }).finally(() => {
          this.loading = false
        })
          .catch(() => {
            this.getList()
          })
      }
    },
    stopScan(row) {
      this.$confirm(`确定要终止"${row.sourceName}"的扫描任务吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        stopDataScan({ proxyIds: row.id }).then(async res => {
          this.$message.success(res.msg || '终止扫描成功')
          await this.getList()
        }).catch(() => {
          this.$message.error('终止扫描失败')
        }).finally(() => {
          this.loading = false
        })
      }).catch(() => {
        // 用户取消操作，不做处理
      })
    },
    scanContentEdit(row) {
      if (row.isAddTasks == 1) {
        this.editIsFlag = true
      } else {
        this.editIsFlag = false
      }
      if (row.databaseType == "Excel") {
        this.importData.importFile = row.fileName
        this.titleExcel = "编辑Excel";
        this.importData.categoryId = row.projectId
        this.importData.id = row.id
        this.importData.sourceName = row.sourceName
        this.importData.businessName = row.businessName
        this.importData.importShow = true
      } else {
        this.form = JSON.parse(JSON.stringify(row))
        this.form.tabelCheckedName = row.scanContent
        let targetDatabaseCopy = row.targetDatabase
        let targetDatabaseArr
        if (targetDatabaseCopy.length > 1) {
          targetDatabaseArr = targetDatabaseCopy.split(',')
          targetDatabaseArr.splice(targetDatabaseArr.length - 1, 1)
        }
        // this.form.targetDatabase = targetDatabaseArr
        this.form.tables = row.tables || {}
        this.title = "编辑数据库";
        this.open = true
        this.scanContentLoading = true
        getDatabaseAndTablesById(row.id).then(res => {
          this.scanContentLoading = false
          if (res.data && res.data.options && res.data.options.length) {
            this.treeCheckedData = res.data.options.map(item => {
              return item.value
            })
          } else {
            this.treeCheckedData = ['0']
          }
        })
        // if (row.state == 'RUNNING') {
        //   this.$message({ message: '当前状态为运行中，无法发布', type: 'warning' })
        //   return
        // }
        // this.form = row

      }
    },
    // 扫描内容点击事件
    async scanContentFn() {
      this.$refs["form"].validate(async valid => {
        if (valid) {
          this.databaseTableNameParama = {
            targetIp: this.form.targetIp,
            targetPort: this.form.targetPort,
            targetUserName: this.form.targetUserName,
            targetUserPassword: this.form.targetUserPassword,
            connectionType: this.connectionType,
            connectionValue: this.form.connectionValue,
            databaseType: this.form.databaseType,
            examplesName: this.form.examplesName,
            sourceName: this.form.sourceName,
          }
          let res = await getDatabaseNameList(this.databaseTableNameParama)
          if (res.data.length == 0) {
            this.$message({ message: '暂无数据，请稍后再试', type: 'warning' })
          } else {
            this.scanContentTreeData = res.data
            this.scanContentShow = true
          }
        }
      })

    },
    scanContentSubmitFn() {
      let returnArr = this.$refs.scanContentTreeRef.returnArr
      let result = {}
      returnArr.forEach(element => {
        if (element.checked && element.children.length > 0) {
          result[element.name] = [...element.children.filter(item => item.checked)]
        }
      });
      this.form.targetDatabase = []
      // if(typeof this.form.targetDatabase == 'string'){
      //   this.form.targetDatabase = this.form.targetDatabase.trim().replace(/^"|"$/g, '').split(',').filter(Boolean);
      // }
      returnArr.forEach((item) => {
        if (item.checked && item.children.length > 0) {
          this.form.targetDatabase.push(item.name)
        }
      })
      this.form.tables = result
      this.form.tabelCheckedName = `已选${this.$refs.scanContentTreeRef.selectedTableCount}张表`  //共${this.$refs.scanContentTreeRef.fieldCount}个字段
      this.scanContentShow = false
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

.scanContentBox /deep/ .el-dialog__body {
  padding: 20px;
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
