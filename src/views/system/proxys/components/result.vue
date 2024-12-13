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
      <el-form-item class="searchBtn">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="medium" @click="handleAdd"
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
      <el-table-column label="字段名" align="center" prop="aaa1" />
      <el-table-column label="字段注释" align="center" prop="aaa1" />
      <el-table-column label="来源业务系统" align="center" prop="aaa1" />
      <el-table-column label="数据源" align="center" prop="aaa1" />
      <el-table-column label="所属库" align="center" prop="aaa1" />
      <el-table-column label="所属表" align="center" prop="aaa1" />
      <el-table-column label="分类" align="center" prop="aaa1" />
      <el-table-column label="安全分级" align="center" prop="aaa1" />
      <el-table-column label="样本" align="center" prop="aaa1">
        <template slot-scope="scope">
          <el-tooltip placement="bottom" effect="light">
            <div slot="content">多行信息<br />第二行信息<br />多行信息<br />多行信息<br />多行信息<br />多行信息<br /></div>
            <el-button size="mini" type="text" >查看</el-button>
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
    <el-dialog class="deleteCla" title="系统提示" :visible.sync="deleteVisible" width="450px" append-to-body
      :close-on-click-modal="false">
    </el-dialog>
    <el-drawer title="结果查看" :visible.sync="drawerShow" :destroy-on-close="true" direction="rtl" size="80%"
      :before-close="handleClose">
    </el-drawer>
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
    this.getProjectListEdit()
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
    submitFormExcelFn() {
      this.$refs["importData"].validate(async (valid) => {
        if (valid) {
          this.importDataLoading = true
          // await this.rulsNameIsRight(this.importData.categoryId, params.name)
          if (!true) {
            this.$modal.msgError("框架名称重复,请更改");
            this.importDataLoading = false
            return
          } else {
            const formData = new FormData();
            // 将文件数组添加到 FormData 对象中
            formData.append('file', this.importData.fileList[0].raw);
            formData.append('categoryId', this.importData.categoryId);
            formData.append('sourceName', this.importData.sourceName);
            await importExcel(formData).then(res => {
              this.messsucc(res, '导入条目数量共');
              // this.getList();
              this.importData.categoryName = ''
              this.importData.importFile = ''
              this.importData.fileList = []
              this.importData.importShow = false
              this.gettreeOptionsList()
              this.importDataLoading = false
            })
              .catch((err) => {
                this.importDataLoading = false
              })
          }
        } else {
          return false
        }
      });
    },
    handleClose() {
      this.drawerShow = false
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
        this.getList()
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
            this.addUserVisible = false;
            this.getList();
          });
        }
      });

    },
    // 取消按钮
    addCancel() {
      this.addUserVisible = false;
      this.addReset();
    },
    //添加用户
    addUsers(row) {
      this.addReset();
      this.addUserId = row.id
      this.addUserVisible = true
    },
    // 运行状态
    handleSwitchChange(row) {
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
    switchShowTagFunc(row) {
      if (row.showTag == 1) {
        row.showTag = 0
        row.targetUserPassword = '******'
      } else {
        row.showTag = 1
        row.targetUserPassword = row.oldPassword
      }
    },
    strategyPush(row) {
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
    dataMarking(row) {
      this.markingI = row.id
      this.samplingNum = 10
      this.radio = "1"
      this.checkList = true
      if (row.state == "COMPLETE") {
        this.$confirm('您已经扫描成功,是否要重新开始数据扫描？', '提示', {
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
        this.$confirm('数据扫描失败,是否重新开始扫描？', '提示', {
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
    // 连接测试
    connectTest(formName) {
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
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
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
    handleDelete(row) {
      this.serialNumber = row.id || this.ids;
      this.deleteVisible = true

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
      this.importData.fileList = []
      this.importData.importShow = false
    },
    downloadFile() {
      const link = document.createElement('a');
      link.href = '/2.xlsx'; // 替换为你的文件路径
      link.download = '分类分级框架模板.xlsx'; // 设置下载后的文件名
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
      if (dataS && dataS.length > 0) {
        this.$confirm(`确定执行所选中的项吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          for (let val of dataS) {
            if (val.status == '已完成') {
              isWancheng = true
            }
          }
          let ids = dataS.map(item => {
            return item.id
          })
          let data = {
            ids: ids.join(',')
          }
          if (isWancheng) {
            this.$confirm(`重新执行任务，将会覆盖数据源上一次执行的所有结果`, '提示', {
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
        })
      } else {
        this.$message({ message: '至少选择一条数据', type: 'warning' })
      }
    },
    resultExdit(row) {

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
  margin-left: 240px
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
</style>
