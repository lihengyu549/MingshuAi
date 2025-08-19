<template>
  <div class="app-container" v-loading="mainLoading">
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small" :inline="true"
      label-width="auto">
      <el-form-item label="任务名称" prop="tasksName">
        <el-input v-model="queryParams.tasksName" @input="inputSearch" placeholder="请输入数据源名称" clearable
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
        <el-select clearable v-model="queryParams.projectId" @change="inputSearch" placeholder="请选择分类分级框架">
          <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="maskComplete">
        <el-select clearable v-model="queryParams.maskComplete" @change="inputSearch" placeholder="请选择执行状态">
          <el-option v-for="item in dict.type.sys_executing_state" :key="item.value" :label="item.label"
            :value="item.value">
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
        <el-button type="primary" icon="el-icon-plus" size="medium" @click="handleAdd">新增任务</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-close" size="medium" @click="deleteFn">删除任务</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" height="570px" class="tableBox" :data="proxysList"
      @selection-change="handleSelectionChange" ref="tableRef">
      <el-table-column type="selection" width="60" align="center" :selectable="selectableFn" />
      <el-table-column label="任务名称" align="center" prop="tasksName">
        <template slot-scope="scope">
          <span class="btnText" @click="handleUpdate(scope.row)">{{ scope.row.tasksName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据源" align="center" prop="sourceName" />
      <el-table-column label="来源业务系统" align="center" prop="businessName" />
      <el-table-column label="分类分级标准" align="center" prop="projectName" />
      <el-table-column label="AI分析引擎" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.aiAnalyticsEngine == 1 ? '快速响应' : '深度思考' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务字段数" align="center" prop="fieldCount" />
      <el-table-column label="执行状态" align="center" prop="maskComplete">
        <template slot-scope="scope">
          <span>{{ stateMsg(scope.row.maskComplete) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布状态" align="center" prop="publishStatus">
        <template slot-scope="scope">
          <span>{{ scope.row.publishStatus == 0 ? '未发布' : '已发布' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" />
      <el-table-column label="任务操作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <div class="iconBtnBox">
            <el-tooltip class="item" effect="dark" content="执行任务" placement="top-start">
              <i class="el-icon-video-play" @click="implementFn(scope.row)"></i>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="暂停任务" placement="top-start">
              <i class="el-icon-video-pause" @click="suspendWorkFn(scope.row)"></i>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="终止任务" placement="top-start">
              <i class="el-icon-switch-button" @click="terminationWorkFn(scope.row)"></i>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="任务监控" placement="top-start">
              <i class="el-icon-view" @click="toJobMonitoring(scope.row)"></i>
            </el-tooltip>
            <!-- <i class="el-icon-refresh-left" @click="recoverWorkFn(scope.row)"></i> -->
          </div>
        </template>
      </el-table-column>
      <el-table-column label="结果操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="resultLookFn(scope.row)">结果查看</el-button>
          <el-button size="mini" type="text" :disabled="scope.row.publishStatus == 1"
            @click="resultReleaseFn(scope.row)">结果发布</el-button>
          <el-button size="mini" type="text" :disabled="scope.row.publishStatus != 1"
            @click="resultWithdraw(scope.row)">发布撤回</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <!-- 添加或修改数据库代理对话框 -->
    <Drawer :title="title" v-loading="formLoading" :visible.sync="open">
      <el-form slot="body" ref="form" :model="form" :rules="rules" label-width="auto" @submit.native.prevent
        label-position="top">
        <Title title="基本信息" />
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="tasksName" :rules="rules.tasksName">
              <el-input v-model="form.tasksName" maxlength="50" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据源名称" prop="id" :rules="rules.id">
              <el-select v-model="form.id" clearable @change="projectChangeEdit($event)">
                <el-option v-for="item in databaseTypeList" :key="item.id" :label="item.sourceName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="分类分级框架" prop="projectName" :rules="rules.projectName">
              <el-input v-model="form.projectName" :disabled="true" />
            </el-form-item>
          </el-col>
        </el-row>

        <Title title="脏数据过滤" />
        <!-- <el-form-item label="分类分级标准" prop="projectName" :rules="rules.projectName">
          <el-select v-model="form.projectName" :disabled="editIsFlag" placeholder="请选择分类分级标准" clearable
            @change="projectChangeEdit($event)">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-row>
          <el-col :span="12">
            <el-form-item>
              <el-switch v-model="form.ifStartDataNull" active-text="样本全部为空" />
            </el-form-item>
            <el-form-item prop="dataRepetitionValue">
              <el-switch v-model="form.ifStartDataRepetition" active-text="样本重复率高于" @change="handleRepetitionChange" />
              <el-input v-model="form.dataRepetitionValue" size="mini" style="width: 15%;margin-left:15px;" /> %
              <el-tooltip class="item" effect="dark" content="样本重复率" placement="top-start">
                <svg-icon icon-class="dengpao" style="margin-left:8px;" />
              </el-tooltip>
            </el-form-item>
            <el-form-item>
              <el-switch v-model="form.ifConfigurationParameters" active-text="配置参数" />
              <el-tooltip class="item" effect="dark" content="配置参数" placement="top-start">
                <svg-icon icon-class="dengpao" style="margin-left:8px;" />
              </el-tooltip>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-switch v-model="form.ifStartDataShort" active-text="样本内容为单字符或数字" />
            </el-form-item>
            <el-form-item>
              <el-switch v-model="form.ifTechnicalIdentifier" active-text="技术标识符" />
              <el-tooltip class="item" effect="dark" content="技术标识符" placement="top-start">
                <svg-icon icon-class="dengpao" style="margin-left:8px;" />
              </el-tooltip>
            </el-form-item>
            <el-form-item>
              <el-switch v-model="form.ifRedundantFields" active-text="冗余字段" />
              <el-tooltip class="item" effect="dark" content="冗余字段" placement="top-start">
                <svg-icon icon-class="dengpao" style="margin-left:8px;" />
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>

        <Title title="注释填充" />
        <el-row>
          <el-col :span="12">
            <el-form-item>
              <el-switch v-model="form.ifStartAiFill" active-text="是否启用" />
            </el-form-item>
          </el-col>
        </el-row>

        <Title title="分类任务" />
        <el-row>
          <el-col :span="12">
            <el-form-item>
              <el-switch v-model="form.ifStartTask" active-text="是否启用" />
            </el-form-item>
          </el-col>
        </el-row>
        <div style="padding-left: 40px;">
          <el-row>
            <el-col :span="12">
              <el-form-item label="分类逻辑" prop="classificationLogic" :rules="rules.classificationLogic">
                <el-radio v-model="form.classificationLogic" label="1" :disabled="!form.ifStartTask">基于表</el-radio>
                <el-radio v-model="form.classificationLogic" label="2" :disabled="!form.ifStartTask">基于字段</el-radio>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item>
                <el-switch v-model="form.piiDetectionFlag" active-text="个人信息识别" :disabled="!form.ifStartTask" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="分类状态">
                <el-select v-model="form.classificationState" multiple clearable placeholder="请选择内容" style="width: 100%"
                  :disabled="!form.ifStartTask">
                  <el-option v-for="item in dict.type.sys_classification_state" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="置信度" prop="confidenceLevel" :rules="rules.confidenceLevel">
                <el-select v-model="form.confidenceLevel" :disabled="!form.ifStartTask">
                  <el-option v-for="item in confidenceLevelList" :key="item.value" :label="item.name"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="确认状态" prop="confirm" :rules="rules.confirm">
                <el-select v-model="form.confirm" placeholder="全部" :disabled="!form.ifStartTask">
                  <el-option v-for="item in confirmList" :key="item.value" :label="item.name" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <Title title="样本特征提取" />
        <el-row>
          <el-col :span="12">
            <el-form-item prop="id" :rules="rules.id">
              <el-switch v-model="form.ifStartFeatureExtract" active-text="是否启用" />
            </el-form-item>
          </el-col>
        </el-row>

        <Title title="调度周期" />
        <el-row>
          <el-col :span="12">
            <el-form-item label="执行周期" prop="executeCycle" :rules="rules.executeCycle">
              <el-select v-model="executeCycle" clearable>
                <el-option label="手动执行" value="1">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" style="display: flex;justify-content: flex-end;">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="closeFn">取消</el-button>
      </div>
    </Drawer>
    <Drawer title="结果查看" class="dialogClass" :visible.sync="drawerShow" :destroy-on-close="true" direction="rtl"
      size="100%" :before-close="handleClose">
      <template slot="body">
        <Result :treeOptions="treeOptions" :drawerData="drawerData" />
      </template>
    </Drawer>
  </div>
</template>

<script>
import {
  publish,
  getScanCompleteData,
  addScanCompleteDataTasks,
  deleteScanCompleteDataTasks,
  editScanCompleteDataTasks,
  dataMark,
  getTasksListByName,
  verifyTasksName,
  pauseTask,
  recoveryTask,
  terminateTask,
  withdrawReleaseState,
} from "@/api/system/proxys";
import { getFrameworks, } from "@/api/system/protectCategory"
import Result from './components/result.vue'
import { path } from "d3";
export default {
  name: "hierarchicalTask",
  dicts: ['sys_risk_level', 'sys_classification_state', 'sys_executing_state'],
  components: { Result },
  data() {
    return {
      treeOptions: [],
      drawerShow: false,
      drawerData: null,
      mainLoading: false,
      editIsFlag: false,
      // aiAnalyticsEngine: '1',
      confidenceLevelList: [
        { name: "全部", value: "0" },
        { name: "低", value: "1" },
        { name: "高", value: "2" },
      ],
      confirmList: [
        { name: "全部", value: "0" },
        { name: "未确认", value: "1" },
        { name: "已确认", value: "2" },
      ],
      dataYTpeList: [
        {
          value: 'DATABASE',
          label: '数据库'
        }, {
          value: 'FILE',
          label: 'Excel表'
        }
      ],
      databaseTypeList: [],
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
        { value: 'NONE', label: '未开始' },       // 字典键值NONE → 标签未开始
        { value: 'RUNNING', label: '执行中' },    // 字典键值RUNNING → 标签执行中
        { value: 'COMPLETE', label: '执行完成' }, // 字典键值COMPLETE → 标签执行完成
        { value: 'ERR', label: '执行失败' },      // 字典键值ERR → 标签执行失败
        { value: 'PAUSEDING', label: '正在暂停中' },// 字典键值PAUSING → 标签正在暂停中
        { value: 'PAUSED', label: '暂停成功' },   // 字典键值PAUSED → 标签暂停成功
        { value: 'KILLEDING', label: '正在终止中' },// 字典键值KILLING → 标签正在终止中
        { value: 'KILLED', label: '终止成功' }    // 字典键值KILLED → 标签终止成功
      ],
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
        confidenceLevel: '',
        confirm: '',
        projectName: '',
        projectId: '',
        tasksName: '',
        id: '',
        classificationState: [],
        piiDetectionFlag: false,
        classificationLogic: '2',
        ifStartDataNull: false,
        ifStartDataRepetition: false,
        dataRepetitionValue: '',
        ifStartDataShort: false,
        ifConfigurationParameters: false,
        ifTechnicalIdentifier: false,
        ifRedundantFields: false,
        ifStartAiFill: false,
        ifStartTask: false,
        ifStartFeatureExtract: false,
      },
      executeCycle: '1',
      // 表单校验
      rules: {
        tasksName: [
          { required: true, message: "任务名称不能为空", trigger: "blur" },
        ],
        id: [
          { required: true, message: "数据源名称不能为空", trigger: "blur" },
        ],
        projectName: [
          { required: true, message: "分类分级框架不能为空", trigger: "blur" },
        ],
        classificationLogic: [{
          required: true, message: "分类逻辑不能为空", trigger: "blur"
        }],
        // classificationState: [{
        //   validator: (rule, value, callback) => {
        //     if (this.form.ifStartTask) {
        //       // 由于是多选，判断数组是否为空
        //       if (!value || value.length === 0) {
        //         return callback(new Error('分类状态不能为空'));
        //       }
        //     }
        //     callback();
        //   },
        //   trigger: ['blur', 'change']
        // }],
        confidenceLevel: [{
          required: true, message: "置信度不能为空", trigger: "blur"
        }],
        confirm: [{
          required: true, message: "确认状态不能为空", trigger: "blur"
        }],
        dataRepetitionValue: [
          {
            validator: (rule, value, callback) => {
              // 只有当开关开启时才校验
              if (this.form.ifStartDataRepetition) {
                // 验证是否为空
                if (!value) {
                  return callback(new Error('请输入样本重复率阈值'));
                }
                // 验证数值是否在1-100之间
                const num = parseInt(value);
                if (num < 1 || num > 100) {
                  return callback(new Error('请输入1-100之间的数值'));
                }
              }
              callback();
            },
            trigger: ['blur', 'change']
          }
        ],
      },
      debounceTimeout: null,
      formLoading: false,
    };
  },

  created() {
    this.gettreeOptionsList()
    this.getList()
    this.getScanCompleteDataFn()
  },
  mounted() {
  },
  watch: {
    // 'form.ifStartTask'(newVal) {
    //   // 确保表单实例已存在再调用校验方法
    //   if (this.$refs.form) {
    //     this.$refs.form.validateField([
    //       'classificationState'
    //     ]);
    //   }
    // }
  },
  methods: {
    handleRepetitionChange() {
      // 当开关状态变化时，手动触发输入框的校验
      this.$refs.form.validateField('dataRepetitionValue');
      if (!this.form.ifStartDataRepetition) {
        this.form.dataRepetitionValue = ''
      }
    },
    //控制多选框是否可选
    selectableFn(row, index) {
      if (row.publishStatus == 1) {
        return false
      } else {
        return true
      }
    },
    // 发布撤回
    resultWithdraw(row) {
      this.$confirm(`确定撤回已发布的结果？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        withdrawReleaseState({ proxyId: row.id }).then(res => {
          if (res.code == 200) {
            this.$message.success(res.msg)
            this.getList()
          }
        })
      })
    },
    // 获取新增任务中 数据源名称
    getScanCompleteDataFn(id) {
      this.formLoading = true
      getScanCompleteData({ editId: id || '' }).then((res) => {
        this.databaseTypeList = res.data
        this.formLoading = false
      })
    },
    async getNameTestingFn() {
      this.importDataLoading = true
      let params = {
        tasksName: this.form.tasksName,
        id: this.form.id || ''
      }
      let res = await verifyTasksName(params)
      return res.code == 200
    },
    gettreeOptionsList() {
      this.mainLoading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        this.mainLoading = false
      });
    },
    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}个`)
    },
    handleClose() {
      this.drawerShow = false
    },
    closeFn() {
      this.open = false
      this.reset()
    },
    // 定时器，防抖使用
    inputSearch(data) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleQuery()
      }, 500); // 设置防抖的时间间隔为300毫秒
    },
    implementFn(row) {
      // 核心：拦截「正在进行中」的状态（执行中/正在暂停/正在终止），禁止执行操作
      const processingStates = ['RUNNING', 'PAUSING', 'KILLING'];
      if (processingStates.includes(row.maskComplete)) {
        this.$message.warning(`当前任务${this.stateMsg(row.maskComplete)}，请等待操作完成后再执行`);
        return;
      }

      // 暂停成功（PAUSED）：执行 = 恢复任务
      if (row.maskComplete === 'PAUSED') {
        this.$confirm(`当前任务已暂停，确定继续执行？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          recoveryTask({ proxyId: row.id }).then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.getList();
            }
          });
        });
        return;
      }

      // 终止成功（KILLED）：执行 = 重新执行
      if (row.maskComplete === 'KILLED') {
        this.$confirm(`当前任务已终止，确定重新执行？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          dataMark(row.id).then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.getList();
            }
          });
        });
        return;
      }

      // 非初始状态（如执行完成/失败）：执行 = 覆盖历史结果
      if (row.maskComplete !== 'NONE') {
        this.$confirm(`重新执行任务前，⚠️ 请注意任务细节，否则可能将会覆盖该数据源上一次执行的所有结果`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          dataMark(row.id).then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.getList();
            }
          });
        });
        return;
      }

      // 初始状态（NONE）：直接执行
      this.$confirm(`确定执行所选中的项吗`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        dataMark(row.id).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.getList();
          }
        });
      });
    },

    projectChangeEdit(e) {
      this.form.projectName = this.databaseTypeList.find(item => item.id == e).projectName
      this.form.projectId = e
      this.$forceUpdate()
    },
    /** 查询数据库代理列表 */
    getList() {
      this.loading = true;
      getTasksListByName(this.queryParams).then(response => {
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
      this.form = {}
      // this.aiAnalyticsEngine = "1"
      this.form.projectName = ''
      this.$set(this.form, 'piiDetectionFlag', false)
      this.$set(this.form, 'confidenceLevel', "0")
      this.$set(this.form, 'classificationLogic', "2")
      this.$set(this.form, 'confirm', "0")
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
      this.reset();
      this.getScanCompleteDataFn()
      this.open = true;
      this.title = "添加任务";
      this.editIsFlag = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.getScanCompleteDataFn(row.id)
      this.form = JSON.parse(JSON.stringify(row));
      this.$set(this.form, 'ifStartDataNull', row.ifStartDataNull == "1");
      this.$set(this.form, 'ifStartDataShort', row.ifStartDataShort == "1");
      this.$set(this.form, 'ifStartDataRepetition', row.ifStartDataRepetition == "1");
      this.$set(this.form, 'ifStartAiFill', row.ifStartAiFill == "1");
      this.$set(this.form, 'ifStartTask', row.ifStartTask == "1");
      this.$set(this.form, 'piiDetectionFlag', row.piiDetectionFlag == "1");
      this.$set(this.form, 'ifStartFeatureExtract', row.ifStartFeatureExtract == "1");
      this.$set(this.form, 'ifConfigurationParameters', row.ifConfigurationParameters == "1");
      this.$set(this.form, 'ifTechnicalIdentifier', row.ifTechnicalIdentifier == "1");
      this.$set(this.form, 'ifRedundantFields', row.ifRedundantFields == "1");
      this.form.classificationState = row.classificationState.split(',').map(item => {
        return item
      })
      if (row.classificationState == '0') {
        this.form.classificationState = []
      }
      this.open = true;
      this.editIsFlag = true;
      this.title = "编辑任务";
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(async valid => {
        if (valid) {
          if (!await this.getNameTestingFn()) {
            return
          }
          const params = {
            ...this.form,
            ifStartDataNull: this.form.ifStartDataNull ? '1' : '0',
            ifStartDataShort: this.form.ifStartDataShort ? '1' : '0',
            ifStartDataRepetition: this.form.ifStartDataRepetition ? '1' : '0',
            ifStartAiFill: this.form.ifStartAiFill ? '1' : '0',
            ifStartTask: this.form.ifStartTask ? '1' : '0',
            piiDetectionFlag: this.form.piiDetectionFlag ? '1' : '0',
            ifStartFeatureExtract: this.form.ifStartFeatureExtract ? '1' : '0',
            ifConfigurationParameters: this.form.ifConfigurationParameters ? '1' : '0',
            ifTechnicalIdentifier: this.form.ifTechnicalIdentifier ? '1' : '0',
            ifRedundantFields: this.form.ifRedundantFields ? '1' : '0',
            classificationState: this.form.classificationState.join(',') ? this.form.classificationState.join(',') : '0',

          }
          if (this.form.isAddTasks === '1') {
            // this.form.piiDetectionFlag = this.form.piiDetectionFlag + ''
            // this.form.aiAnalyticsEngine = this.aiAnalyticsEngine
            editScanCompleteDataTasks(params).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            // let data = JSON.parse(JSON.stringify(this.form))
            // data.aiAnalyticsEngine = this.aiAnalyticsEngine
            // data.piiDetectionFlag = this.form.piiDetectionFlag + ''
            addScanCompleteDataTasks(params).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
          this.getList()
        }
      });
    },
    /** 删除按钮操作 */
    deleteClick() {
      let params = {
        ids: this.ids.join(',')
      }
      deleteScanCompleteDataTasks(params).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { })
    },
    deleteFn() {
      let dataS = this.$refs.tableRef.selection
      let flagList // 为1 代表选中数据中有执行中的，2为没有执行中，但是有执行完成的
      if (dataS && dataS.length > 0) {
        flagList = dataS.map(item => {
          return item.maskComplete
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
            deleteScanCompleteDataTasks(idsParams).then(res => {
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
          deleteScanCompleteDataTasks(idsParams).then(res => {
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
      // if (row.state == 'RUNNING') {
      //   this.$message({ message: '当前状态为运行中，无法查看', type: 'warning' })
      //   return
      // }
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
    // 执行状态中文
    stateMsg(val) {
      let msg = ''
      for (let item of this.executeStatus) {
        if (item.value == val) {
          msg = item.label
        }
      }
      return msg
    },
    // 暂停任务
    suspendWorkFn(row) {
      const processingStates = ['RUNNING', 'KILLING'];
      if (!processingStates.includes(row.maskComplete)) {
        this.$message.warning(`当前任务${this.stateMsg(row.maskComplete)}，请等待操作完成后再执行`);
        return;
      }

      if (row.maskComplete !== 'RUNNING') {
        this.$message({ message: `当前状态为${this.stateMsg(row.maskComplete)}，无法执行暂停操作`, type: 'warning' })
        return
      } else {
        this.$confirm(`确定暂停任务吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          pauseTask({ proxyId: row.id }).then(res => {
            if (res.code == 200) {
              this.$message({ message: res.msg, type: 'success' })
              this.getList()
            }
          })
        })
      }
    },
    // 恢复任务
    recoverWorkFn(row) {
    },
    // 终止任务
    terminationWorkFn(row) {
      const processingStates = ['RUNNING', 'KILLING'];
      if (!processingStates.includes(row.maskComplete)) {
        this.$message.warning(`当前任务${this.stateMsg(row.maskComplete)}，请等待操作完成后再执行`);
        return;
      }

      if (row.maskComplete === 'PAUSED' || row.maskComplete === 'RUNNING') {
        this.$confirm(`确定终止任务吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          terminateTask({ proxyId: row.id }).then(res => {
            if (res.code == 200) {
              this.$message({ message: res.msg, type: 'success' })
              this.getList()
            }
          })
        })
      } else {
        this.$message({ message: `当前状态为${this.stateMsg(row.maskComplete)}，无法执行终止操作`, type: 'warning' })
        return
      }
    },
    // 跳转任务监控
    toJobMonitoring(row) {
      if (row.maskComplete == 'NONE') {
        this.$message({ message: `当前状态为${this.stateMsg(row.maskComplete)}，无法查看任务监控`, type: 'warning' })
        return
      }
      this.$router.push({ path: '/jobMonitoring', query: row })
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

.addMsg /deep/ .el-input {
  width: 80%;
}

.addMsg /deep/ .el-select {
  width: 80%;
}

.addMsg .el-select /deep/ .el-input {
  width: 100%;
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

.tableBox {
  overflow-y: auto;
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

.dialogClass /deep/ .el-drawer__header {
  margin-bottom: 15px;
  /* overflow: hidden!important; */
}

.btnText {
  color: #1890FF;
}

.btnText:hover {
  cursor: pointer;
}

.iconBtnBox i {
  font-size: 25px;
  margin: 0 5px;
}

.iconBtnBox i:hover {
  cursor: pointer;
  color: #1890FF;
}

/deep/.el-form-item__content {
  padding-right: 15px;
}

.el-select.el-select--medium {
  width: 100%;
}

/deep/.el-form-item__label,
.el-switch__label span {
  font-size: 16px;
}
</style>
