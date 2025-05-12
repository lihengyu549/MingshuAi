<template>
  <div class="app-container" v-loading="mainLoading">
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small" :inline="true"
      label-width="auto">
      <el-form-item label="任务名称" prop="sourceName">
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
          <el-input v-model="form.sourceName" 
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
        <el-form-item v-show="isServiesNameRequired" label="服务名" prop="connectionValue" :rules="rules.connectionValue()">
          <el-input v-model="form.connectionValue" maxlength="50" @input="serviesNameInput(form.connectionValue)"
            placeholder="请输入" />
        </el-form-item>
        <el-form-item v-show="isServiesNameRequired" label="连接方式">
          <el-radio v-model="connectionType" label="0">SID</el-radio>
          <el-radio v-model="connectionType" label="1">Service Name</el-radio>
        </el-form-item>
        <el-form-item label="表名" prop="targetDatabase" :rules="rules.targetDatabase">
          <!-- 
          <el-input v-if="show" v-model="form.targetDatabase" placeholder="请输入数据库名称" /> -->
          <el-select ref="selectRef" allow-create @change="targetDatabaseChange" filterable multiple clearable
            v-model="form.targetDatabase" placeholder="请选择数据库名称">
            <el-option v-if="targetDataList.length" key="all" label="全选" value="all"></el-option>
            <el-option v-for="item in targetDataList" :key="item.value" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
          <div class="getDiv">
            <el-button type="primary" @click="getDatabaseName">获 取</el-button>
          </div>
        </el-form-item>
        <div class="impShow" v-show="showSucType > 0">
          <div class="success" v-if="showSucType == 1">连接成功</div>
          <div class="error" v-if="showSucType == 2">连接失败</div>
        </div>
        <el-form-item label="来源业务系统" prop="businessName" :rules="rules.businessName">
          <!-- @input="businessNameFn(form.businessName)" -->
          <el-input v-model="form.businessName" maxlength="50" 
            placeholder="请输入来源业务系统" />
            <div style="font-size: 12px; font-style: italic;">示例：个人健康生理信息管理系统（建议使用中文进行描述）</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="connectTest('form')">测试</el-button>
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
          <!-- @input="importNameTestingFn(importData.sourceName)" -->
          <el-input v-model="importData.sourceName" maxlength="50"
            @blur="getimortantNameTestingFn(importData.sourceName)" 
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
            <div style="font-size: 12px; font-style: italic;">示例：个人健康生理信息管理系统（建议使用中文进行描述）</div>
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
  </div>
</template>

<script>
import {
  usersAddI
} from "@/api/system/proxyUser";

import {
  listProxys, getProxys, connectTestI, delProxys, addProxys, updateProxys,
  importExcel, publish, createProxys, startI, stopI, databaseMaskI, strategyPushI, strategyAll, databaseMask, databaseListI
} from "@/api/system/proxys";
import { listAllProject, } from "@/api/system/project";
import {
  treeListI, categoryImport, getAttachData, attachStatus,
  forceLogout, updataAttach, nameTesting, addData, getFrameworks, checkSourceName
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
      databaseTypeList: [
      { name: "MYSQL", id: 0, value: "MYSQL" },
       { name: "SQL_SERVER", id: 1, value: "SQL_SERVER" }, 
       { name: "ORACLE", id: 2, value: "ORACLE" }, 
      //  { name: "TIDB", id: 2, value: "TIDB" }, 
       { name: "POSTGRESQL", id: 3, value: "POSTGRESQL" }, 
       { name: "达梦", id: 4, value: "DM" }, 
      //  { name: "PolarDB For Mysql", id: 5, value: "MYSQL" }
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
        // proxyPort: null,
        // proxyUserName: null,
        // proxyUserPassword: null,
        // proxyIp: null,
        // targetIp: null,
        // targetPort: null,
        // targetDatabase: "",
        // targetUserName: null,
        // targetUserPassword: null,
        // protocolPort: null,
        // projectId: null,
        // proxyStatus: null
      },
      // 表单参数
      form: {
        // projectName: null,
        aaa:'1',
        projectId: null,
        sourceName: '',
        databaseType:'',
    },
      connectionType:'1',
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
          { required: true, message: "请选择数据库名称", trigger: "blur" },
        ],
        targetUserPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        connectionValue: () => {
          return [{ 
            required:this.isServiesNameRequired,
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
      isServiesNameRequired:false,
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

  created() {
    // this.queryParams.projectId = 0
    // this.getProjectListEdit()
    this.gettreeOptionsList()
    this.getList()
  },
  methods: {
    databaseTypeChange(val){
      if(val =='ORACLE'){
        this.isServiesNameRequired = true
      }else{
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

.dialogClass /deep/ .el-drawer__body {
  /* overflow: hidden!important; */
}
</style>
