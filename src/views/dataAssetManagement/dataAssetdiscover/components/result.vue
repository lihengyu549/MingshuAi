<template>
  <div class="app-container" v-loading="loading">
    <el-card shadow="never" class="searchCard">
      <el-form :model="queryParams" ref="queryParams" class="yuanDataClass" size="small" label-position="left"
        v-show="showSearch" label-width="auto">
        <el-form-item :label="$t('dataAssetdiscover.result.host')" prop="ip">
          <el-input v-model="queryParams.ip" @input="inputSearch"
            :placeholder="$t('dataAssetdiscover.result.pleaseInputIp')" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('dataAssetdiscover.result.databaseType')" prop="databaseType">
          <el-select v-model="queryParams.databaseType" :placeholder="$t('dataAssetdiscover.result.selectDatabaseType')"
            @change="inputSearch" clearable>
            <el-option v-for="item in databaseTypeList" :key="item.id" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dataAssetdiscover.result.fileServerType')" prop="fileServerType">
          <el-select v-model="queryParams.fileServerType"
            :placeholder="$t('dataAssetdiscover.result.selectFileServerType')" @change="inputSearch" clearable>
            <el-option v-for="item in fileServerTypeList" :key="item.id" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="" class="searchBtn">
          <!-- <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button> -->
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" class="table-card">
      <el-table class="tableBox" height="860px" v-loading="loading" :data="proxysList"
        @selection-change="handleSelectionChange" ref="tableRef">
        <el-table-column :label="$t('dataAssetdiscover.result.host')" align="center" prop="ip" show-overflow-tooltip />
        <el-table-column :label="$t('dataAssetdiscover.result.port')" align="center" prop="port"
          show-overflow-tooltip />
        <el-table-column :label="$t('dataAssetdiscover.result.databaseType')" align="center" prop="databaseType"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ findDatabaseValueByValue(scope.row.databaseType) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dataAssetdiscover.result.databaseVersion')" align="center" prop="databaseVersion"
          show-overflow-tooltip />
        <el-table-column :label="$t('dataAssetdiscover.result.fileServerType')" align="center" prop="fileServerType"
          show-overflow-tooltip />
        <el-table-column :label="$t('dataAssetdiscover.result.state')" align="center" min-width="250" prop="state">
          <template slot-scope="scope">
            <div style="display: flex; align-items: center;justify-content: center;">
              <img style="display: block; width: 20px;margin-right: 10px;"
                :src="imgSrc[scope.row.state ? scope.row.state : 'NONE']" alt="">
              <span> {{ scope.row.state == 1 ? $t('dataAssetdiscover.result.completed') :
                $t('dataAssetdiscover.result.notCompleted') }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dataAssetdiscover.result.operation')" align="center"
          class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" :disabled="scope.row.state == '1'" @click="resultExdit(scope.row)">{{
              $t('dataAssetdiscover.result.importDataSource') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
        :page-size.sync="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改数据库代理对话框 -->
    <el-dialog class="addMsg unified-dialog" :title="title" :visible.sync="open" width="700px" append-to-body
      :close-on-click-modal="false">
      <el-form class="dialogForm" v-if="open" ref="form" :model="form" :rules="rules" label-width="auto"
        @submit.native.prevent label-position="top">
        <el-form-item :label="$t('dataAssetdiscover.result.databaseType')" prop="databaseType"
          :rules="rules.databaseType">
          <el-select v-model="form.databaseType" :placeholder="$t('dataAssetdiscover.result.selectDatabaseType')"
            @change="databaseTypeChange($event)">
            <el-option v-for="item in databaseTypeList" :key="item.id" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dataAssetdiscover.result.sourceName')" prop="sourceName" :rules="rules.sourceName">
          <el-input v-model="form.sourceName" maxlength="50"
            :placeholder="$t('dataAssetdiscover.result.pleaseInputSourceName')" />
        </el-form-item>
        <el-form-item :label="$t('dataAssetdiscover.result.classificationFramework')" prop="projectName"
          :rules="rules.projectName">
          <el-select v-model="form.projectName"
            :placeholder="$t('dataAssetdiscover.result.pleaseSelectClassificationFramework')" clearable
            @change="projectChangeEdit($event)">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dataAssetdiscover.result.businessSystem')" prop="businessName"
          :rules="rules.businessName">
          <el-input v-model="form.businessName" maxlength="50"
            :placeholder="$t('dataAssetdiscover.result.pleaseInputBusinessSystem')" />
          <div style="font-size: 12px; font-style: italic;">{{ $t('dataAssetdiscover.result.example') }}</div>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('dataAssetdiscover.result.targetIp')" prop="targetIp" :rules="rules.targetIp">
              <el-input v-model="form.targetIp" :placeholder="$t('dataAssetdiscover.result.pleaseInputHostIP')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dataAssetdiscover.result.portField')" prop="targetPort" :rules="rules.targetPort">
              <el-input v-model="form.targetPort"
                :placeholder="$t('dataAssetdiscover.result.pleaseInputDatabasePort')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('dataAssetdiscover.result.user')" prop="targetUserName"
              :rules="rules.targetUserName">
              <el-input v-model="form.targetUserName"
                :placeholder="$t('dataAssetdiscover.result.pleaseInputDatabaseUser')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dataAssetdiscover.result.password')" prop="targetUserPassword"
              :rules="rules.targetUserPassword">
              <el-input type="password" v-model="form.targetUserPassword" maxlength="100"
                :placeholder="$t('dataAssetdiscover.result.pleaseInputDatabasePassword')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-show="form.databaseType == 'ORACLE'" :label="$t('dataAssetdiscover.result.serviceName')"
          prop="connectionValue" :rules="rules.connectionValue()">
          <el-input v-model="form.connectionValue" maxlength="50" @input="serviesNameInput(form.connectionValue)"
            :placeholder="$t('dataAssetdiscover.result.pleaseInput')" />
        </el-form-item>
        <el-form-item v-show="form.databaseType == 'ORACLE'" :label="$t('dataAssetdiscover.result.connectionMethod')">
          <el-radio v-model="connectionType" label="0">{{ $t('dataAssetdiscover.result.SID') }}</el-radio>
          <el-radio v-model="connectionType" label="1">{{ $t('dataAssetdiscover.result.serviceNameConnection')
          }}</el-radio>
        </el-form-item>
        <el-form-item v-show="form.databaseType != 'ORACLE'" :label="$t('dataAssetdiscover.result.instanceName')"
          prop="examplesName" :rules="rules.examplesName()">
          <el-input v-model="form.examplesName" :placeholder="$t('dataAssetdiscover.result.pleaseInputInstanceName')" />
        </el-form-item>
        <el-form-item :label="$t('dataAssetdiscover.result.scanContent')" prop="tabelCheckedName">
          <div @click="scanContentFn()"><el-input style="position: relative;" readonly>
            </el-input>
            <el-tag style="position: absolute;top: 4px;left: 6px;">{{ form.tabelCheckedName ? form.tabelCheckedName :
              $t('dataAssetdiscover.result.clickToSelectScanContent') }}</el-tag>
          </div>
        </el-form-item>
        <el-form-item :label="$t('dataAssetdiscover.result.cycle')" prop="scheduleType">
          <el-select v-model="form.scheduleType" @change="scheduleTypeChange">
            <el-option v-for="item in weekTimeList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-select v-show="form.scheduleType == '2' || form.scheduleType == '3'" v-model="form.scheduleInterval">
            <el-option v-for="item in weekList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <el-time-picker v-show="form.scheduleType != '0' && form.scheduleType != ''" v-model="form.scheduleTime"
            @input="handleTimeChange" value-format='HH:mm' format="HH:mm"
            :placeholder="$t('dataAssetdiscover.result.anyTimePoint')">
          </el-time-picker>
        </el-form-item>

      </el-form>
      <div slot="footer">
        <el-button type="primary" plain @click="submitForm">{{ $t('dataAssetdiscover.result.confirm') }}</el-button>
        <el-button @click="cancleFn">{{ $t('dataAssetdiscover.result.cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$t('dataAssetdiscover.result.scanConfiguration')" class="addMsg" v-loading="scanContentLoading"
      :visible.sync="scanContentShow" width="950px" append-to-body :close-on-click-modal="false">
      <TableSelector v-if="scanContentShow" :treeCheckedData="treeCheckedData"
        :scanContentTreeData="scanContentTreeData" :databaseTableNameParama="databaseTableNameParama"
        ref="scanContentTreeRef" />
      <div slot="footer">
        <el-button type="primary" plain @click="scanContentSubmitFn">{{ $t('dataAssetdiscover.result.confirm')
        }}</el-button>
        <el-button @click="scanContentShow = false">{{ $t('dataAssetdiscover.result.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TableSelector from './TableSelector.vue'
import { getListTables, saveDatabaseAndTables, getDatabaseNameList } from "@/api/system/proxys";
import {
  getFrameworks, checkSourceName
} from "@/api/system/protectCategory"
import {
  getDatabaseProxysScanItemById
} from "@/api/dataAssetManagement";

export default {
  name: "DataAssetdiscoverResult",
  components: { TableSelector, },

  props: {
    drawerData: {
      type: Object,
      default: {},
    }
  },
  data() {
    return {
      databaseTableNameParama: {}, // 数据库表名传参
      imgSrc: {
        '1': require('@/assets/stateImg/stateSuess.png'),
        '0': require('@/assets/stateImg/stateWaiting.png'),
      },
      connectionType: '1',
      treeOptions: [],
      scanContentShow: false, // 扫描配置弹框
      scanContentLoading: false,
      treeCheckedData: [],//树节点已选中数据
      scanContentTreeData: [],//// 扫描配置树数据
      weekTimeList: [
        {
          value: '0',
          label: '手动'
        }, {
          value: '1',
          label: '每天'
        }, {
          value: '2',
          label: '每周'
        }, {
          value: '3',
          label: '每月'
        }
      ],
      weekList: ['周一', '周二', '周三', '周四', '周五', '周六', '周日',],
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
            required: this.form.databaseType == 'DM' || this.form.databaseType == 'POSTGRESQL',
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
        scheduleType: [{
          required: true,
          message: '请选择扫描周期',
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
      resultFormNodeName: '',
      isServiesNameRequired: false,
      treeID: '',
      categoryList: [],
      yuanCategoryList: [],
      addNodeName: '',
      categoryListEdit: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      resultForm: {
        categoryId: '',
        securityLevel: '',
        id: '',
      },
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
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
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
        projectId: this.drawerData.projectId,
        securityLevel: [],
        confirm: '',
        databaseId: this.drawerData.id,
        tableId: '',
        businessName: '',
        databaseName: '',
        categoryId: '',
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
        projectName: '',
        projectId: null,
        sourceName: '',
        businessName: '',
        examplesName: '',
        databaseType: '',
        connectionValue: '',
        targetIp: '',
        targetPort: '',
        targetUserName: '',
        targetUserPassword: '',
        scheduleType: '0',
        scheduleInterval: '',
        scheduleTime: '00:00',
      },
      addForm: {},
      importDataLoading: false,
      importData: {
        importFile: '', // 导入魔板文件名
        fileList: [],//导入模板的文件数据
        categoryId: '',//框架名称
        importShow: false,
      },
      tableList: [],
      debounceTimeout: null,
      databaseTypeList: [
        { name: "MYSQL", id: 0, value: "MYSQL" },
        { name: "SQL_SERVER", id: 1, value: "SQL_SERVER" },
        { name: "ORACLE", id: 2, value: "ORACLE" },
        { name: "POSTGRESQL", id: 3, value: "POSTGRESQL" },
        { name: "达梦", id: 4, value: "DM" },
        { name: "GREENPLUM", id: 5, value: "GREENPLUM" },
      ],
      fileServerTypeList: [
        { name: "FTP", value: "FTP" },
        { name: "SMB", value: "SMB" },
      ],
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
    this.gettreeOptionsList()
    this.getList();
  },
  mounted() {
  },
  methods: {
    // 周期类型变化
    scheduleTypeChange(val) {
      if (val == '3') {
        // 获取当前月的天数
        this.form.scheduleInterval = '1'
        const daysInMonth = this.getDaysInCurrentMonth();
        // 将天数转换为数组
        this.weekList = this.createDaysArray(daysInMonth);
      } else if (val == '2') {
        this.form.scheduleInterval = '周一'
        this.weekList = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      } else {
        this.form.scheduleInterval = ''
      }
    },
    createDaysArray(days) {
      const daysArray = [];
      for (let i = 1; i <= days; i++) {
        daysArray.push(i);
      }
      return daysArray;
    },
    getDaysInCurrentMonth() {
      const now = new Date(); // 获取当前日期
      const year = now.getFullYear(); // 当前年份
      const month = now.getMonth(); // 当前月份（0-11，0表示1月）

      // 创建下个月的第一天的日期对象
      const firstDayNextMonth = new Date(year, month + 1, 1);
      // 减去一天，得到当前月的最后一天
      const lastDayCurrentMonth = new Date(firstDayNextMonth - 1);

      // 返回当前月的天数
      return lastDayCurrentMonth.getDate();
    },

    // 时间变化处理
    handleTimeChange(time) {
      // 确保时间值正确更新到表单数据中
      this.form.scheduleTime = time;
      // 强制触发视图更新（解决可能的响应式问题）
      this.$forceUpdate();
    },

    // 自定义校验规则
    tabelCheckedNameRules(rule, value, callback) {
      callback();
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
            this.$message({ message: this.$t('dataAssetdiscover.tableSelector.noDataPleaseTryLater'), type: 'warning' })
          } else {
            this.scanContentTreeData = res.data
            this.scanContentShow = true
          }
        }
      })

    },
    serviesNameInput(val) {
      this.form.connectionValue = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    gettreeOptionsList() {
      this.mainLoading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        this.mainLoading = false
      });
    },
    databaseTypeChange(val) {
      if (val == 'ORACLE') {
        this.isServiesNameRequired = true
      } else {
        this.isServiesNameRequired = false
      }
    },
    scanContentSubmitFn() {
      let returnArr = this.$refs.scanContentTreeRef.returnArr
      let result = {}
      returnArr.forEach(element => {
        if ((element.checked || element.isBanxuan) && element.children.length > 0) {
          result[element.name] = [...element.children.filter(item => item.checked)]
        }
      });
      this.form.targetDatabase = []
      // if(typeof this.form.targetDatabase == 'string'){
      //   this.form.targetDatabase = this.form.targetDatabase.trim().replace(/^"|"$/g, '').split(',').filter(Boolean);
      // }
      returnArr.forEach((item) => {
        if ((item.checked || item.isBanxuan) && item.children.length > 0) {
          this.form.targetDatabase.push(item.name)
        }
      })
      this.form.tables = result
      this.form.tabelCheckedName = this.$t('dataAssetdiscover.tableSelector.selectedTablesWithCount', { count: this.$refs.scanContentTreeRef.selectedTableCount })
      this.scanContentShow = false
    },
    handleAdda() {
      this.loading = true
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(this.$t('dataAssetdiscover.tableSelector.confirmCurrentSelection'), this.$t('dataAssetdiscover.tableSelector.tip'), {
          confirmButtonText: this.$t('dataAssetdiscover.result.confirm'),
          cancelButtonText: this.$t('dataAssetdiscover.result.cancel'),
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
          // 接口
        }).catch(() => {
          this.loading = false
        });
      } else {
        this.$message({ message: this.$t('dataAssetdiscover.result.selectAtLeastOne'), type: 'warning' })
      }
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
          this.$message({ message: this.$t('dataAssetdiscover.result.selectScanContent'), type: 'warning' })
          return
        } else if (this.editIsFlag && data.targetDatabase == '[]' || this.editIsFlag && !data.targetDatabase) {
          this.$message({ message: this.$t('dataAssetdiscover.result.selectScanContent'), type: 'warning' })
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
    cancleFn() {
      this.reset()
      this.open = false
    },
    async getNameTestingFn() {
      let params = {
        sourceName: this.form.sourceName,
        id: this.form.id || ''
      }
      let res = await checkSourceName(params)
      return res.code == 200
    },
    handleEcelFn() {
      this.loading = true
      let params = {
        ...this.queryParams,
        securityLevelIds: this.queryParams.securityLevel.join()
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

    projectChangeEdit(e) {
      this.form.projectId = e
      this.form.projectName = e
    },
    findDatabaseValueByValue(value) {
      let name;
      for (let i = 0; i < this.databaseTypeList.length; i++) {
        if (value == this.databaseTypeList[i].value) {
          name = this.databaseTypeList[i].name
        }
      }
      return name
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
        id: this.drawerData.id
      }
      getDatabaseProxysScanItemById(params).then(response => {
        this.proxysList = response.data.rows;
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
      this.resetForm("queryParams");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    reset() {
      // this.form = {
      //   targetIp: null,
      //   targetPort: null,
      //   targetDatabase: [],
      //   targetUserName: null,
      //   targetUserPassword: null,
      //   //  protocolPort: null,
      //   projectId: null,
      //   targetDatabase:[],
      //   tables: {},
      //   tabelCheckedName:'',
      //   // proxyStatus: "0"
      // };
      this.isServiesNameRequired = false
      this.resetForm("form");
    },
    resultExdit(row) {
      this.resetForm("form");
      this.title = "添加数据库";
      this.form.databaseType = row.databaseType || ''
      this.form.sourceName = row.sourceName || ''
      this.form.projectName = row.projectName || ''
      this.form.targetIp = row.ip || ''
      this.form.targetPort = row.port || ''
      this.form.connectionValue = row.connectionValue || ''
      this.form.connectionType = row.connectionType || ''
      this.form.examplesName = row.examplesName || ''
      this.form.businessName = row.businessName || ''
      this.form.tabelCheckedName = row.tabelCheckedName || ''
      this.form.targetUserName = row.targetUserName || ''
      this.form.targetUserPassword = row.targetUserPassword || ''
      this.form.scheduleType = row.databaseProxysTimer?.scheduleType || '0'
      this.form.scheduleInterval = row.databaseProxysTimer?.scheduleInterval || ''
      this.form.scheduleTime = row.databaseProxysTimer?.scheduleTime || '00:00'
      this.treeCheckedData = []
      this.open = true;
    },
  }
};
</script>
<style scoped>
.app-container {
  height: calc(100vh - 70px);
}

.searchCard {
  border-radius: 10px;
  margin-bottom: 30px;

  & .el-card__body {
    padding: 24px;
  }
}

.table-card {
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .el-card__body {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.tableBox {
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #e2e8f0;
}

.addMsg ::v-deep .el-dialog__title {
  font-weight: bold;
}

.addMsg ::v-deep .el-dialog__body {
  padding: 30px;
}

.addMsg ::v-deep .el-form {
  margin-bottom: 0;
}

.dialogForm .el-form-item {
  width: 100%;
}

.dialogForm .el-form-item /deep/ .el-form-item__content {
  width: 100%;
  padding-right: 15px;
}

.dialogForm .el-form-item /deep/ .el-select {
  width: 100%;
}

.unified-dialog ::v-deep .el-dialog {
  width: 860px !important;
  max-width: 92vw;
  border-radius: 10px;
}

.unified-dialog ::v-deep .el-dialog__header {
  border-bottom: 1px solid #e6e6e6;
}

.unified-dialog ::v-deep .el-dialog__body {
  max-height: calc(70vh - 120px);
  overflow: auto;
  padding: 20px 24px;
}

.unified-dialog ::v-deep .el-dialog__footer {
  border-top: 1px solid #e6e6e6;
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
  justify-content: space-around;
  align-items: center;
}

.yuanDataClass /deep/ .el-form-item {
  width: 35%;
  margin-bottom: 0;
}

.yuanDataClass /deep/ .el-form-item__content {
  width: 70%;
}

.yuanDataClass /deep/ .el-select {
  width: 100%;
}

.searchBtn {
  height: 100%;
  width: 25% !important;
}

.searchBtn /deep/ .el-form-item__content {
  /* margin-left: 385px */
  /* width: 75%; */
  /* display: flex;
  justify-content: flex-end */
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

.tableCla {
  height: 266px !important;
}
</style>
