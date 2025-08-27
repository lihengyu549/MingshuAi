<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="px">
      <el-form-item label="数据源名称" prop="targetDatabase">
        <el-input v-model="queryParams.targetDatabase" placeholder="请输入数据源名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="数据源类型">
        <el-select v-model="queryParams.selectProjectName" placeholder="请选择" filterable remote clearable>
          <el-option v-for="item in selectProjectListEdit" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="扫描状态">
        <el-select v-model="queryParams.scanId" placeholder="请选择" filterable remote clearable>
          <el-option v-for="item in scanStatusList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <!-- <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button> -->
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:proxys:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="deliveryStrategy"
          v-hasPermi="['system:proxys:export']">一键下发策略</el-button>
      </el-col>


      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:proxys:export']"
        >导出</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="proxysList" @selection-change="handleSelectionChange">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <!-- <el-table-column label="id" align="center" prop="id" /> -->
      <el-table-column label="项目名称" align="center" prop="projectName" />
      <el-table-column label="数据库名称" align="center" prop="targetDatabase" />
      <el-table-column label="数据库地址" align="center" prop="targetIp" />
      <el-table-column label="数据库端口" align="center" prop="targetPort" />
      <el-table-column label="数据库用户" align="center" prop="targetUserName" />
      <el-table-column label="数据库密码" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.targetUserPassword }}</div>
          <span v-if="scope.row.showTag == 1"><img style="width: 20px;
          height: 15px;" @click="switchShowTagFunc(scope.row)" src="@/assets/images/hide-icon.png"></span>
          <span v-if="scope.row.showTag == 0">
            <img style="width: 20px;
          height: 15px;" @click="switchShowTagFunc(scope.row)" src="@/assets/images/show-icon.png">
          </span>
        </template>
      </el-table-column>
      <el-table-column label="代理ip" align="center" prop="proxyIp" />
      <el-table-column label="代理端口" align="center" prop="">
        <template slot-scope="scope">
          {{ scope.row.proxyPort || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="用户数量" align="center" prop="proxyIp">
        <template slot-scope="scope">
          <a style="color: #409eff;" @click="databasesNum(scope.row.targetDatabase, scope.row.id)">
            {{ scope.row.userCount }}
          </a>
        </template>

      </el-table-column>
      <el-table-column label="运行状态" align="center" prop="">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.proxyStatus" @change="handleSwitchChange(scope.row)" active-color="#1890ff"
            inactive-color="#999">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="打标状态" align="center" prop="">
        <template slot-scope="scope">
          <!-- <span>{{ scope.row.state }}</span> -->
          <div v-if="scope.row.state == 'COMPLETE'">
            <!-- 防护中 -->

            <el-tooltip content="打标成功" placement="top">
              <div class="agentClass"></div>
            </el-tooltip>
          </div>

          <div v-if="scope.row.state == 'RUNNING'">

            <el-tooltip content="打标中,请稍后..." placement="top">
              <div class="agentClassBack"></div>
            </el-tooltip>
          </div>
          <div v-if="scope.row.state == 'NONE'">

            <el-tooltip content="未打标" placement="top">
              <div class="agentNONE"></div>
            </el-tooltip>
          </div>
          <div v-if="scope.row.state == 'ERR'">

            <el-tooltip content="打标失败" placement="top">
              <div class="agentERR"></div>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:proxys:edit']"
          >修改</el-button> -->
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:proxys:remove']">删除</el-button>

          <el-button size="mini" type="text" icon="el-icon-edit-outline" @click="dataMarking(scope.row)"
            v-hasPermi="['system:proxys:remove']"> 开始扫描</el-button>
          <el-button size="mini" type="text" icon="el-icon-user" @click="addUsers(scope.row)"
            v-hasPermi="['system:proxyUser:add']">添加用户</el-button>
          <el-button size="mini" type="text" icon="el-icon-folder-opened" @click="strategyPush(scope.row)"
            v-hasPermi="['system:proxys:remove']"> 策略下发</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <!-- 添加用户 -->
    <el-dialog title="添加用户" :visible.sync="addUserVisible" width="450px" append-to-body :close-on-click-modal="false">
      <el-form ref="addForm" :model="addForm" :rules="rules" label-width="80px" @submit.native.prevent>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="addForm.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="用户密码" prop="userPassword">
          <el-input type="password" v-model="addForm.userPassword" placeholder="请输入用户密码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="addSubmitForm()">确 定</el-button>
        <el-button @click="addCancel">取 消</el-button> 
      </div>
    </el-dialog>
    <!-- 添加或修改数据库代理对话框 -->
    <el-dialog class="addMsg" :title="title" :visible.sync="open" width="450px" append-to-body
      :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="auto" @submit.native.prevent>
        <el-form-item label="项目名称" prop="projectName" :rules="rules.projectName">
          <!-- <el-input v-model="form.projectId" placeholder="请输入项目名称" />
           -->
          <el-select v-model="form.projectName" placeholder="请输入项目名称" filterable remote clearable
            @change="projectChangeEdit($event)">
            <el-option v-for="item in formProjectListEdit" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="数据库地址" prop="targetIp" :rules="rules.targetIp">
          <el-input v-model="form.targetIp" placeholder="请输入数据库地址" />
        </el-form-item>
        <el-form-item label="数据库类型" prop="databaseType" :rules="rules.databaseType">
          <el-select v-model="form.databaseType" placeholder="请选择数据库类型">
            <el-option v-for="item in databaseTypeList" :key="item.id" :label="item.name" :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据库端口" prop="targetPort" :rules="rules.targetPort">
          <el-input v-model="form.targetPort" placeholder="请输入数据库端口" />
        </el-form-item>
        <el-form-item label="数据库用户" prop="targetUserName" :rules="rules.targetUserName">
          <el-input v-model="form.targetUserName" placeholder="请输入数据库用户名称" />
        </el-form-item>
        <el-form-item label="数据库密码" prop="targetUserPassword" :rules="rules.targetUserPassword">
          <el-input v-model="form.targetUserPassword" placeholder="请输入数据库密码" />
        </el-form-item>
        <el-form-item label="数据库名称" prop="targetDatabase" class="passwordBtn" :rules="rules.targetDatabase">
          <!-- 
          <el-input v-if="show" v-model="form.targetDatabase" placeholder="请输入数据库名称" /> -->
          <el-select ref="selectRef" allow-create filterable multiple clearable v-model="form.targetDatabase"
            placeholder="请选择数据库名称">
            <el-option v-for="item in targetDataList" :key="item.id" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
          <div class="getDiv">
            <el-button type="primary" plain @click="getDatabaseName">获 取</el-button>
          </div>
        </el-form-item>
        <div class="impShow" v-show="showSucType > 0">
          <div class="success" v-if="showSucType == 1">连接成功</div>
          <div class="error" v-if="showSucType == 2">连接失败</div>
        </div>
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
        <el-button @click="connectTest('form')">测试</el-button>
        <!-- <el-button @click="cancel">取 消</el-button> -->
      </div>
    </el-dialog>
    <!-- 开始扫描 -->
    <el-dialog class="marking" title="开始扫描" :visible.sync="markingVisible" width="450px" append-to-body
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
        <!-- <div style="margin-top: 10px;">
          <el-checkbox v-model="checkList" label="启用NLP打标规则（姓名、民族、地址）"></el-checkbox>
        </div> -->
        <div style="text-align: right;">
          <el-button type="primary" plain @click="markingCli">确定</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog class="deleteCla" title="系统提示" :visible.sync="deleteVisible" width="450px" append-to-body
      :close-on-click-modal="false">
      <div style="position: relative; ">
        <div style="height: 66px;">
          <i class="el-icon-warning" style="color: #ffba00; font-size: 30px;margin-right: 5px;"></i>
          <span style="position: absolute; top: 5px; ">是否确认删除数据库代理编号为{{ serialNumber }}的数据项,<span
              style="color: red;">并同时关联删除打标记录、API关联记录、数据库用户?</span></span>
        </div>
        <div style="text-align: right;">
          <el-button @click="deleteVisible = false">取消</el-button>
          <el-button type="primary" plain @click="deleteClick(serialNumber)">确定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  usersAddI
} from "@/api/system/proxyUser";

import { listProxys, getProxys, connectTestI, delProxys, addProxys, updateProxys, createProxys, startI, stopI, databaseMaskI, strategyPushI, strategyAll, databaseListI } from "@/api/system/proxys";
import { listAllProject, } from "@/api/system/project";
import Log from "@/views/monitor/job/log.vue";

export default {
  name: "Proxys",
  data () {
    return {
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
      databaseTypeList: [{ name: "MYSQL", id: 0, value: "MYSQL" }, { name: "SQL_SERVER", id: 1, value: "SQL_SERVER" }, { name: "TIDB", id: 2, value: "TIDB" }, { name: "POSTGRESQL", id: 3, value: "POSTGRESQL" }, { name: "达梦", id: 4, value: "DM" }, { name: "PolarDB For Mysql", id: 5, value: "MYSQL" }],
      formProjectListEdit: [],
      selectProjectListEdit: [{ name: "全部", id: 0 }, { name: "Excel文件", id: 1 },{ name: "数据库", id: 2 }], // 数据源类型
      scanStatusList: [{ name: "全部", id: 0 }, { name: "扫描中", id: 1 },{ name: "扫描成功", id: 2 },{ name: "扫描失败", id: 3 },{ name: "待扫描", id: 4 }], // 扫描类型
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
        selectProjectName: 0,
        saomiaoId:0,
        scanId:0,


        proxyId: null,
        proxyPort: null,
        proxyUserName: null,
        proxyUserPassword: null,
        proxyIp: null,
        targetIp: null,
        targetPort: null,
        targetDatabase: "",
        targetUserName: null,
        targetUserPassword: null,
        protocolPort: null,
        projectId: null,
        proxyStatus: null
      },
      // 表单参数
      form: {
        // projectName: null,
        projectId: null
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
        databaseType: [{ required: true, message: '请选择数据库类型', trigger: 'blur' }],
        projectName: [{ required: true, message: '请选择选项目名称', trigger: 'blur' }],
        targetUserName: [
          { required: true, message: "请输入数据库用户名称", trigger: "change" },
        ],
        targetDatabase: [
          { required: true, message: "请输入数据库名称", trigger: "change" },
        ],
        targetUserPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        targetIp: [
          { required: true, message: "请输入数据库地址", trigger: "change" },
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
      }
    };
  },

  created () {
    // this.queryParams.selectProjectName = "全部"
    // this.queryParams.projectId = 0
    // this.getList();
    // this.getProjectListEdit()
  },
  methods: {
    findDatabaseValueByName (name) {
      let value;
      for (let i = 0; i < this.databaseTypeList.length; i++) {
        if (name == this.databaseTypeList[i].name) {
          value = this.databaseTypeList[i].value
        }
      }
      return value
    },
    // 获取数据库名称
    getDatabaseName () {
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
    handleInput (e) {
      this.samplingNum = e
    },
    markingCli () {
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
          this.$alert('数据已提交', '开始扫描', {
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
    handleChange (value) {
      this.radio = value
    },
    deliveryStrategy () {
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

    databasesNum (name, id) {
      this.$router.push({
        path: "/risk/proxyUser",
        query: { id: id, name: name },
      });
    },
    addSubmitForm () {
      this.$refs["addForm"].validate((valid) => {
        if (valid) {
          this.addForm.proxyDatabaseId = this.addUserId
          usersAddI(this.addForm).then((response) => {
            this.$message({
              message: "添加成功",
              duration: 3000,
              type: 'success'
            });
            this.addUserVisible = false;
            this.getList();
          });
        }
      });

    },
    // 取消按钮
    addCancel () {
      this.addUserVisible = false;
      this.addReset();
    },
    //添加用户
    addUsers (row) {
      this.addReset();
      this.addUserId = row.id
      this.addUserVisible = true
    },
    // 运行状态
    handleSwitchChange (row) {
      row.proxyStatus = !row.proxyStatus
      if (row.proxyStatus == true) {
        this.$confirm('您是否要关闭运行状态？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let data = {
            proxyId: row.id,
          }
          stopI(data).then((res => {
            row.proxyStatus = false
            this.getList()
          }))

          // 用户点击确定按钮，执行相关操作
        }).catch(() => {
          // 用户点击了取消按钮，不做任何操作
        });
      } else {
        this.$confirm('您是否要开启运行状态？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let data = {
            proxyId: row.id,
          }
          startI(data).then((res => {
            row.proxyStatus = true
            this.getList()
          }))
          // 用户点击确定按钮，执行相关操作
        }).catch(() => {
          // 用户点击了取消按钮，不做任何操作
        });

      }

    },
    switchShowTagFunc (row) {
      if (row.showTag == 1) {
        row.showTag = 0
        row.targetUserPassword = '******'
      } else {
        row.showTag = 1
        row.targetUserPassword = row.oldPassword
      }
    },
    strategyPush (row) {
      this.$confirm('您是否要开始策略下发？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          proxyId: row.id,
        }
        strategyPushI(data).then((res => {

          this.$alert(res.msg, '策略下发', {
            confirmButtonText: '确定',
          });
        }))
        // 用户点击确定按钮，执行相关操作
      }).catch(() => {
        // 用户点击了取消按钮，不做任何操作
      });

    },
    dataMarking (row) {
      this.markingI = row.id
      this.samplingNum = 10
      this.radio = "1"
      this.checkList = true
      if (row.state == "COMPLETE") {
        this.$confirm('您已经打标成功,是否要重新开始开始扫描？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

          this.markingVisible = true
          // 用户点击确定按钮，执行相关操作
        }).catch(() => {
          // 用户点击了取消按钮，不做任何操作
        });
      } else if (row.state == "RUNNING") {
        this.$message({
          message: '数据正在扫描中,请稍后...',
          type: 'warning'
        });
      } else if (row.state == "NONE") {

        this.markingVisible = true
      } else if (row.state == "ERR") {
        this.$confirm('开始扫描失败,是否重新开始扫描？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          this.markingVisible = true
          // 用户点击确定按钮，执行相关操作
        }).catch(() => {
          // 用户点击了取消按钮，不做任何操作
        });

      }


    },
    getProjectListEdit (key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        name: key,
      };
      listAllProject(params).then((resp) => {
        this.formProjectListEdit = resp.data;
        let data = JSON.parse(JSON.stringify(this.formProjectListEdit))

        this.selectProjectListEdit = data;
        this.selectProjectListEdit.unshift({ name: "全部", id: 0 })
        // if (this.formProjectListEdit == null) {
        //   this.formProjectListEdit = this.projectList;
        // }
      });
    },
    selectProjectChangeEdit (e) {
      this.projectNameEdit = e
      // this.form.projectName = 
      this.queryParams.projectId = e

    },

    projectChangeEdit (e) {
      this.projectNameEdit = e
      // this.form.projectName = 
      this.form.projectId = e

    },
    /** 查询数据库代理列表 */
    getList () {
      this.loading = true;

      if (this.queryParams.projectId == 0) {
        this.queryParams.projectId = null
      }
      listProxys(this.queryParams).then(response => {
        this.proxysList = response.rows;
        for (let item of this.proxysList) {
          item.showTag = 0
          item.oldPassword = item.targetUserPassword
          item.targetUserPassword = '******'
        }
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel () {
      this.open = false;
      this.showSucType = 0
      this.reset();
    },
    // 表单重置
    addReset () {
      this.addForm = {
        userName: null,
        userPassword: null,
      }
      this.resetForm("addForm");
    },
    reset () {
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
    // 连接测试
    connectTest (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let data = JSON.parse(JSON.stringify(this.form))
          delete data.projectName
          data.targetDatabase = JSON.stringify(data.targetDatabase)
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
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.queryParams.selectProjectName = "全部"
      this.queryParams.projectId = null
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      // this.show = true
      // this.form.projectName = "ruoyi-auth"
      // this.form.targetIp = "192.168.3.14"
      // this.form.databaseType = "MYSQL"
      // this.form.targetPort = "3306"
      // this.form.targetUserName = "root"
      // this.form.targetUserPassword = "Mysql123!@#"
      this.showSucType = 0
      this.projectNameEdit = null
      this.targetDataList = []
      this.reset();
      this.open = true;
      this.title = "添加数据库";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const id = row.id || this.ids
      getProxys(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据库";
      });
    },
    /** 提交按钮 */
    submitForm () {
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
    deleteClick (ids) {
      delProxys(ids).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
        this.deleteVisible = false
      }).catch(() => { })
    },
    handleDelete (row) {
      this.serialNumber = row.id || this.ids;
      this.deleteVisible = true

    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/proxys/export', {
        ...this.queryParams
      }, `proxys_${new Date().getTime()}.xlsx`)
    }
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
  width: 92px !important;
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
</style>
