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
    <el-dialog class="addMsg unified-dialog" :title="titleFileShareServer" :visible.sync="fileShareServerOpen"
      width="700px" append-to-body :close-on-click-modal="false">
      <el-form class="dialogForm" v-if="fileShareServerOpen" ref="fileShareServerForm" :model="fileShareServerForm"
        :rules="computedFileShareServerRules" label-width="auto" label-position="top" @submit.native.prevent>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.sourceName')" prop="sourceName">
              <el-input v-model="fileShareServerForm.sourceName" maxlength="50"
                :placeholder="$t('dataFrom.pleaseInputSourceName')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.fileDirectoryType')" prop="databaseType">
              <el-select v-model="fileShareServerForm.databaseType"
                :placeholder="$t('dataFrom.pleaseSelectFileDirectoryType')">
                <el-option :label="$t('dataFrom.SMB')" value="SMB"></el-option>
                <el-option :label="$t('dataFrom.FTP')" value="FTP"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('dataFrom.businessName')" prop="businessName">
          <el-input v-model="fileShareServerForm.businessName" maxlength="50"
            :placeholder="$t('dataFrom.pleaseInputBusinessName')" />
        </el-form-item>

        <el-form-item :label="$t('dataFrom.businessSystemDescription')" prop="businessComment">
          <el-input type="textarea" v-model="fileShareServerForm.businessComment" maxlength="1000" show-word-limit
            :placeholder="$t('dataFrom.pleaseInputBusinessDescription')" />
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.host')" prop="targetIp">
              <el-input v-model="fileShareServerForm.targetIp" :placeholder="$t('dataFrom.pleaseInputHostIP')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.port')" prop="targetPort">
              <el-input v-model="fileShareServerForm.targetPort" :placeholder="$t('dataFrom.pleaseInputPort')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.user')" prop="targetUserName">
              <el-input v-model="fileShareServerForm.targetUserName"
                :placeholder="$t('dataFrom.pleaseInputUserName')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.password')" prop="targetUserPassword">
              <el-input type="password" v-model="fileShareServerForm.targetUserPassword" :show-password="true"
                maxlength="100" :placeholder="$t('dataFrom.pleaseInputPassword')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="fileShareServerForm.databaseType == 'SMB'" :label="$t('dataFrom.share')" prop="share">
          <el-input v-model="fileShareServerForm.share" :placeholder="$t('dataFrom.shareExample')" />
        </el-form-item>

        <el-form-item :label="$t('dataFrom.startingPath')" prop="targetDatabase">
          <el-input v-model="fileShareServerForm.targetDatabase" :placeholder="$t('dataFrom.folderPathExample')" />
        </el-form-item>

        <el-form-item :label="$t('dataFrom.scanContent')" prop="fileDataList">
          <div @click="openFileDirectoryDialog" style="cursor: pointer;">
            <el-input style="position: relative;" readonly></el-input>
            <el-tag style="position: absolute;top: 4px;left: 6px;" v-if="fileShareServerForm.fileDataList">
              {{ getFileShareScanContentDisplay() }}
            </el-tag>
            <el-tag style="position: absolute;top: 4px;left: 6px;" v-else type="info">
              {{ $t('dataFrom.clickToSelectScanContent') }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item :label="$t('dataFrom.executionCycle')" prop="scheduleType">
          <el-select v-model="fileShareServerForm.scheduleType" @change="fileShareServerScheduleTypeChange">
            <el-option v-for="item in weekTimeList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-select v-show="fileShareServerForm.scheduleType == '2' || fileShareServerForm.scheduleType == '3'"
            v-model="fileShareServerForm.scheduleInterval">
            <el-option v-for="item in weekList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <el-time-picker v-show="fileShareServerForm.scheduleType != '0' && fileShareServerForm.scheduleType != ''"
            v-model="fileShareServerForm.scheduleTime" value-format='HH:mm' format="HH:mm"
            :placeholder="$t('dataFrom.anyTimePoint')" :append-to-body="true">
          </el-time-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitFileShareServerForm" :loading="fileShareServerSubmitLoading">
          {{ $t('confirm') }}
        </el-button>
        <el-button @click="fileShareServerCancel">{{ $t('cancel') }}</el-button>
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
    <FileDirectoryTransfer ref="fileDirectoryTransferRef" @confirm="handleFileDirectoryConfirm" />
  </div>
</template>

<script>
import TableSelector from './TableSelector.vue'
import FileDirectoryTransfer from '../../dataFrom/components/FileDirectoryTransfer.vue'
import { saveDatabaseAndTables, getDatabaseNameList } from "@/api/system/proxys";
import {
  getFrameworks, checkSourceName, updateDatabaseAndTables, saveFileServer, updateFileServer
} from "@/api/system/protectCategory"
import {
  getDatabaseProxysScanItemById
} from "@/api/dataAssetManagement";

export default {
  name: "DataAssetdiscoverResult",
  components: { TableSelector, FileDirectoryTransfer },

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
          label: this.$t('dataAssetdiscover.manual')
        }, {
          value: '1',
          label: this.$t('dataAssetdiscover.daily')
        }, {
          value: '2',
          label: this.$t('dataAssetdiscover.weekly')
        }, {
          value: '3',
          label: this.$t('dataAssetdiscover.monthly')
        }
      ],
      weekList: [this.$t('dataAssetdiscover.monday'), this.$t('dataAssetdiscover.tuesday'), this.$t('dataAssetdiscover.wednesday'), this.$t('dataAssetdiscover.thursday'), this.$t('dataAssetdiscover.friday'), this.$t('dataAssetdiscover.saturday'), this.$t('dataAssetdiscover.sunday')],
      // 表单校验
      rules: {
        userPassword: [
          { required: true, message: this.$t('dataAssetdiscover.result.inputPassword'), trigger: 'blur' },
        ],
        userName: [
          { required: true, message: this.$t('dataAssetdiscover.result.pleaseInputDatabaseUser'), trigger: 'blur' },
        ],
        sourceName: [{
          required: true, message: this.$t('dataAssetdiscover.result.pleaseInputSourceName'), trigger: 'blur'
        }],
        businessName: [{
          required: true, message: this.$t('dataAssetdiscover.result.pleaseInputBusinessSystem'), trigger: 'blur'
        }],
        databaseType: [{ required: true, message: this.$t('dataAssetdiscover.result.selectDatabaseType'), trigger: 'blur' }],
        projectName: [{ required: true, message: this.$t('dataAssetdiscover.result.pleaseSelectClassificationFramework'), trigger: 'blur' }],
        targetUserName: [
          { required: true, message: this.$t('dataAssetdiscover.result.pleaseInputDatabaseUser'), trigger: 'change' },
        ],
        targetDatabase: [
          { required: true, message: this.$t('dataFrom.pleaseSelectDatabaseName'), trigger: 'change' },
        ],
        targetUserPassword: [
          { required: true, message: this.$t('dataAssetdiscover.result.inputPassword'), trigger: 'blur' }
        ],
        examplesName: () => {
          return [{
            required: this.form.databaseType == 'DM' || this.form.databaseType == 'POSTGRESQL',
            message: this.$t('dataAssetdiscover.result.pleaseInput'),
            trigger: 'blur'
          }]
        },
        connectionValue: () => {
          return [{
            required: this.isServiesNameRequired,
            message: this.$t('dataAssetdiscover.result.pleaseInput'),
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
          message: this.$t('dataAssetdiscover.result.selectScanPeriod'),
          trigger: 'blur'
        }],
        targetIp: [
          { required: true, message: this.$t('dataAssetdiscover.result.pleaseInputHostIP'), trigger: 'blur' },
          {
            pattern: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            message: this.$t('dataAssetdiscover.result.inputValidIP')
          },
        ],
        targetPort: [
          { required: true, message: this.$t('dataAssetdiscover.result.inputPortNumber'), trigger: 'blur' },
          {
            pattern:
              /^([1-9]\d{0,3}|0)$|^([1-5]\d{4})$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/,
            message: this.$t('dataAssetdiscover.result.inputPortRange'),
          },
          // {
          //   min: 1,
          //   max: 5,
          //   message: 'Length should be between 1 and 5 characters',
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
        label: this.$t('dataAssetdiscover.scanComplete')
      }, {
        value: 'RUNNING',
        label: this.$t('dataAssetdiscover.scanning')
      }, {
        value: 'NONE',
        label: this.$t('dataAssetdiscover.pendingScan')
      }, {
        value: 'ERR',
        label: this.$t('dataAssetdiscover.scanFailed')
      }
      ],
      surfaceList: [
      ],
      executeStatus: [
        {
          value: 'COMPLETE',
          label: this.$t('dataAssetdiscover.pendingScan')
        }, {
          value: 'RUNNING',
          label: this.$t('dataAssetdiscover.scanning')
        }, {
          value: 'NONE',
          label: this.$t('dataAssetdiscover.scanComplete')
        }, {
          value: 'ERR',
          label: this.$t('dataAssetdiscover.scanFailed')
        }
      ],
      formProjectListEdit: [],
      selectProjectListEdit: [{ name: this.$t('all'), id: 0 }],
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
      titleFileShareServer: this.$t('dataFrom.addFileShareServer'),
      // 是否显示弹出层
      open: false,
      fileShareServerOpen: false,
      fileShareServerSubmitLoading: false,
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
          label: this.$t('dataFrom.result.confirmed')
        },
        {
          value: '0',
          label: this.$t('dataFrom.result.notConfirmed')
        },
      ],
      // 表单参数
      form: {
        id: null,
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
        targetDatabase: [],
        tables: {},
        tabelCheckedName: '',
        scheduleType: '0',
        scheduleInterval: '',
        scheduleTime: '00:00',
      },
      fileShareServerForm: {
        sourceName: '',
        databaseType: 'SMB',
        share: '',
        targetDatabase: '',
        businessName: '',
        businessComment: '',
        targetIp: '',
        targetPort: '',
        targetUserName: '',
        targetUserPassword: '',
        fileDataList: '',
        scheduleType: '0',
        scheduleInterval: '',
        scheduleTime: '00:00',
        proceedOrOverwrite: '0',
        id: null,
      },
      fileShareServerRules: {
        sourceName: [
          { required: true, message: this.$t('dataFrom.pleaseInputSourceName'), trigger: 'blur' }
        ],
        databaseType: [
          { required: true, message: this.$t('dataFrom.pleaseSelectFileDirectoryType'), trigger: 'change' }
        ],
        businessName: [
          { required: true, message: this.$t('dataFrom.pleaseInputBusinessName'), trigger: 'blur' }
        ],
        businessComment: [
          { required: true, message: this.$t('dataFrom.pleaseInputBusinessDescription'), trigger: 'blur' }
        ],
        targetIp: [
          { required: true, message: this.$t('dataFrom.pleaseInputHostIP'), trigger: 'blur' },
          {
            pattern: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            message: this.$t('dataFrom.pleaseInputValidIp')
          },
        ],
        targetPort: [
          { required: true, message: this.$t('dataFrom.pleaseInputPort'), trigger: 'blur' },
          {
            pattern: /^([1-9]\d{0,3}|0)$|^([1-5]\d{4})$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/,
            message: this.$t('dataFrom.pleaseInputValidPort'),
          },
        ],
        targetUserName: [
          { required: true, message: this.$t('dataFrom.pleaseInputUserName'), trigger: 'blur' }
        ],
        targetUserPassword: [
          { required: true, message: this.$t('dataFrom.pleaseInputPassword'), trigger: 'blur' }
        ],
        share: [
          { required: true, message: this.$t('dataFrom.pleaseInputShare'), trigger: 'blur' }
        ],
        targetDatabase: [
          { required: true, message: this.$t('dataFrom.pleaseInputFolderPath'), trigger: 'blur' }
        ],
        fileDataList: [
          { required: true, message: this.$t('dataFrom.pleaseInputScanContent'), trigger: 'change' }
        ],
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
        { name: this.$t('dameng'), id: 4, value: "DM" },
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
            required: true, message: this.$t('dataAssetdiscover.result.pleaseInputSourceName'), trigger: 'blur'
          }
        ],
        categoryId: [
          {
            required: true, message: this.$t('dataAssetdiscover.result.selectCategory'), trigger: 'blur'
          }
        ],
        importFile: [
          { required: true, message: this.$t('dataAssetdiscover.result.importFrameworkFile'), trigger: 'blur' },
        ],
      },
    };
  },

  computed: {
    // 动态计算 fileShareServerRules，使 targetDatabase 的 required 随 databaseType 变化
    computedFileShareServerRules() {
      return {
        ...this.fileShareServerRules,
        targetDatabase: [
          {
            required: this.fileShareServerForm.databaseType !== 'SMB',
            message: this.$t('dataFrom.pleaseInputFolderPath'),
            trigger: 'blur'
          }
        ]
      };
    }
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
        this.form.scheduleInterval = this.$t('dataAssetdiscover.monday')
        this.weekList = [this.$t('dataAssetdiscover.monday'), this.$t('dataAssetdiscover.tuesday'), this.$t('dataAssetdiscover.wednesday'), this.$t('dataAssetdiscover.thursday'), this.$t('dataAssetdiscover.friday'), this.$t('dataAssetdiscover.saturday'), this.$t('dataAssetdiscover.sunday')]
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
    getFileShareScanContentDisplay() {
      if (!this.fileShareServerForm.fileDataList) return ''
      try {
        let parsed = this.fileShareServerForm.fileDataList
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed)
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0].fileName || ''
          if (parsed.length === 1) return firstItem
          return this.$t('dataFrom.fileShareSelectedSummary', { name: firstItem, count: parsed.length - 1 })
        }
      } catch (e) {
        return ''
      }
      return ''
    },
    openFileDirectoryDialog() {
      const form = this.fileShareServerForm;
      const isSMB = form.databaseType === 'SMB';

      // 手动校验必填字段，避免 validateField 因动态 prop 导致回调断链
      const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const portPattern = /^([1-9]\d{0,3}|0)$|^([1-5]\d{4})$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/;

      if (!form.targetIp) {
        this.$message.warning(this.$t('dataFrom.pleaseInputHostIP'));
        this.$refs.fileShareServerForm.validateField('targetIp');
        return;
      }
      if (!ipPattern.test(form.targetIp)) {
        this.$message.warning(this.$t('dataFrom.pleaseInputValidIp'));
        this.$refs.fileShareServerForm.validateField('targetIp');
        return;
      }
      if (!form.targetPort) {
        this.$message.warning(this.$t('dataFrom.pleaseInputPort'));
        this.$refs.fileShareServerForm.validateField('targetPort');
        return;
      }
      if (!portPattern.test(String(form.targetPort))) {
        this.$message.warning(this.$t('dataFrom.pleaseInputValidPort'));
        this.$refs.fileShareServerForm.validateField('targetPort');
        return;
      }
      if (!form.targetUserName) {
        this.$message.warning(this.$t('dataFrom.pleaseInputUserName'));
        this.$refs.fileShareServerForm.validateField('targetUserName');
        return;
      }
      if (!form.targetUserPassword) {
        this.$message.warning(this.$t('dataFrom.pleaseInputPassword'));
        this.$refs.fileShareServerForm.validateField('targetUserPassword');
        return;
      }
      if (isSMB && !form.share) {
        this.$message.warning(this.$t('dataFrom.pleaseInputShare'));
        this.$refs.fileShareServerForm.validateField('share');
        return;
      }
      if (!isSMB && !form.targetDatabase) {
        this.$message.warning(this.$t('dataFrom.pleaseInputFolderPath'));
        this.$refs.fileShareServerForm.validateField('targetDatabase');
        return;
      }

      // 校验通过，解析已有的扫描内容作为初始选中值
      let initialSelected = [];
      if (form.fileDataList) {
        try {
          let parsed = form.fileDataList;
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
          }
          initialSelected = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          initialSelected = [];
        }
      }

      const requestParams = {
        targetIp: form.targetIp,
        targetPort: form.targetPort,
        targetUserName: form.targetUserName,
        targetUserPassword: form.targetUserPassword,
        startingPath: form.targetDatabase,
        databaseType: form.databaseType,
        share: form.share,
      };

      this.$refs.fileDirectoryTransferRef.open(initialSelected, requestParams);
    },
    handleFileDirectoryConfirm(selectedData) {
      if (selectedData && selectedData.length > 0) {
        this.fileShareServerForm.fileDataList = JSON.stringify(selectedData)
      } else {
        this.fileShareServerForm.fileDataList = ''
      }
      if (this.$refs.fileShareServerForm) {
        this.$refs.fileShareServerForm.validateField('fileDataList')
      }
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
          let str = data.targetDatabase || ''
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
              this.$modal.msgSuccess(this.$t('editSuccess'));
              this.open = false;
              this.getList();
            });
          } else {
            saveDatabaseAndTables(data).then(response => {
              this.$modal.msgSuccess(this.$t('dataAssetdiscover.addSuccess'));
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
    async checkFileShareServerNameFn() {
      let params = {
        sourceName: this.fileShareServerForm.sourceName,
        id: this.fileShareServerForm.id || ''
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
      }, 500); // 闂佽崵濮崇粈浣规櫠娴犲鍋柛鈩冪⊕閳锋捇鏌涘▎蹇ｆЦ妞ゎ偄绉归弻锝夊Ω閵夈儺浠惧┑锛勫仜閸婂灝顫忔繝姘妞ゆ梹鏋荤槐鐢告⒒閸屾碍鍣洪柡灞熷懏瀚?00婵犳鍣紞鍡涘磻閸℃冻缍?
    },
    /** 闂備礁鎼悮顐﹀磿閹绢噮鏁嬫俊銈呮噹閺嬩線鏌ｅΔ鈧悧鍡欑矈閿曞倸绠归悗娑櫳戠亸顐︽煕閻戝棗澧撮柟顔肩埣瀹曞崬螖閳ь剟鎮樺▎鎾村仩?*/
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
      this.form = {
        id: null,
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
        targetDatabase: [],
        tables: {},
        tabelCheckedName: '',
        scheduleType: '0',
        scheduleInterval: '',
        scheduleTime: '00:00',
      }
      this.isServiesNameRequired = false
      this.resetForm("form");
    },
    resultExdit(row) {
      const isFileServer = (row.databaseType === null || row.databaseType === undefined || row.databaseType === '') && !!row.fileServerType
      if (isFileServer) {
        this.resetFileShareServerForm()
        this.titleFileShareServer = this.$t('dataFrom.editFileShareServerTitle')
        this.fileShareServerForm.sourceName = row.sourceName || ''
        this.fileShareServerForm.databaseType = row.fileServerType || 'SMB'
        this.fileShareServerForm.businessName = row.businessName || ''
        this.fileShareServerForm.businessComment = row.businessComment || ''
        this.fileShareServerForm.targetIp = row.ip || row.targetIp || ''
        this.fileShareServerForm.targetPort = row.port || row.targetPort || ''
        this.fileShareServerForm.targetUserName = row.targetUserName || ''
        this.fileShareServerForm.targetUserPassword = row.targetUserPassword || ''
        this.fileShareServerForm.targetDatabase = row.targetDatabase || ''
        this.fileShareServerForm.fileDataList = row.fileDataList ? (typeof row.fileDataList === 'string' ? row.fileDataList : JSON.stringify(row.fileDataList)) : ''
        this.fileShareServerForm.scheduleType = row.databaseProxysTimer?.scheduleType || '0'
        this.fileShareServerForm.scheduleInterval = row.databaseProxysTimer?.scheduleInterval || ''
        this.fileShareServerForm.scheduleTime = row.databaseProxysTimer?.scheduleTime || '00:00'
        this.fileShareServerForm.share = row.share || ''
        this.fileShareServerOpen = true
        return
      }

      this.reset()
      this.title = this.$t('dataAssetdiscover.result.importDataSource')
      this.form.databaseType = row.databaseType || ''
      this.form.sourceName = row.sourceName || ''
      this.form.projectName = row.projectName || ''
      this.form.targetIp = row.ip || row.targetIp || ''
      this.form.targetPort = row.port || row.targetPort || ''
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
    async submitFileShareServerForm() {
      if (this.fileShareServerSubmitLoading) return

      this.$refs["fileShareServerForm"].validate(async valid => {
        if (valid) {
          if (!await this.checkFileShareServerNameFn()) {
            this.fileShareServerSubmitLoading = false
            return
          }

          this.fileShareServerSubmitLoading = true

          let fileDataListArray = []
          if (this.fileShareServerForm.fileDataList) {
            try {
              let parsed = this.fileShareServerForm.fileDataList
              if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed)
              }
              fileDataListArray = parsed
            } catch (e) {
              console.error(e)
            }
          }

          const params = {
            ...this.fileShareServerForm,
            targetIpPort: this.fileShareServerForm.targetIp + ":" + this.fileShareServerForm.targetPort,
            fileDataList: fileDataListArray,
            sourceType: 'FILE_SERVER',
          }

          const request = this.fileShareServerForm.id ? updateFileServer({ ...params, id: this.fileShareServerForm.id }) : saveFileServer(params)
          request.then(() => {
            this.$modal.msgSuccess(this.fileShareServerForm.id ? this.$t('editSuccess') : this.$t('addSuccess'))
            this.fileShareServerOpen = false
            this.fileShareServerSubmitLoading = false
            this.resetFileShareServerForm()
            this.getList()
          }).catch(() => {
            this.fileShareServerSubmitLoading = false
          })
        } else {
          this.fileShareServerSubmitLoading = false
          return false
        }
      })
    },
    fileShareServerCancel() {
      this.fileShareServerOpen = false
      this.resetFileShareServerForm()
    },
    fileShareServerScheduleTypeChange(val) {
      if (val === '0') {
        this.fileShareServerForm.scheduleInterval = ''
        this.fileShareServerForm.scheduleTime = '00:00'
      }
    },
    resetFileShareServerForm() {
      this.fileShareServerForm = {
        sourceName: '',
        databaseType: 'SMB',
        share: '',
        targetDatabase: '',
        businessName: '',
        businessComment: '',
        targetIp: '',
        targetPort: '',
        targetUserName: '',
        targetUserPassword: '',
        fileDataList: '',
        scheduleType: '0',
        scheduleInterval: '',
        scheduleTime: '00:00',
        proceedOrOverwrite: '0',
        id: null,
      }
      if (this.$refs.fileShareServerForm) {
        this.$refs.fileShareServerForm.resetFields()
      }
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
