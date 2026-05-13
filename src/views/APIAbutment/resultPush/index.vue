<template>
  <div class="app-container" v-loading="mainLoading">
    <el-card shadow="never" class="searchCard">
      <el-form ref="queryForm" :model="queryParams" v-show="showSearch" class="yuanDataClass" size="small"
        :inline="true" label-width="auto">
        <el-form-item :label="$t('resultPush.taskName')" prop="taskName">
          <el-input v-model="queryParams.taskName" @input="inputSearch" :placeholder="$t('resultPush.enterTaskName')"
            clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('resultPush.pushType')" prop="pushType">
          <el-select clearable v-model="queryParams.pushType" @change="inputSearch"
            :placeholder="$t('resultPush.selectPushType')">
            <el-option v-for="item in dict.type.sys_push_type" :key="item.value" :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item></el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="medium" @click="handleAdd">{{ $t('add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-close" size="medium" @click="deleteFn">{{ $t('delete')
        }}</el-button>
      </el-col>
    </el-row>

    <el-card class="table-card" shadow="never">
      <el-table ref="tableRef" v-loading="loading" height="700px" class="tableBox" :data="proxysList"
        @selection-change="handleSelectionChange">
        <template slot="empty">
          <el-empty :description="$t('noData')"></el-empty>
        </template>
        <el-table-column type="selection" width="60" align="center" :selectable="checkSelectable" />
        <el-table-column :label="$t('resultPush.taskName')" prop="taskName" width="250" show-overflow-tooltip>
          <template slot-scope="scope">
            <svg-icon icon-class="jobs" style="font-size: 16px; margin-right: 5px;" />
            {{ scope.row.taskName }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('resultPush.taskType')" align="center" prop="taskType" width="150"
          show-overflow-tooltip>
          <template slot-scope="scope">
            {{ getTaskTypeLabel(scope.row.taskType) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('resultPush.provider')" align="center" prop="providerName" width="150"
          show-overflow-tooltip />
        <el-table-column :label="$t('resultPush.classificationResult')" align="center" prop="pushTypeName" width="150"
          show-overflow-tooltip />
        <el-table-column :label="$t('resultPush.connectionStatus')" align="center" prop="connectStatus" width="150"
          show-overflow-tooltip>
          <template slot-scope="scope">
            {{ getConnectStatusLabel(scope.row.connectStatus) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('resultPush.pushStatus')" align="center" prop="pushStatusName" width="150"
          show-overflow-tooltip />
        <el-table-column :label="$t('updateTime')" align="center" prop="updateTime" show-overflow-tooltip />
        <el-table-column :label="$t('operation')" align="center" class-name="small-padding fixed-width" width="150">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="handleEcelFn(scope.row)">{{ $t('edit') }}</el-button>
            <el-button size="mini" type="text" @click="testClick(scope.row)">{{ $t('resultPush.test') }}</el-button>
            <el-button size="mini" type="text" :disabled="scope.row.taskType == '0'"
              @click="scanStateClickFn(scope.row)">
              {{ $t('resultPush.push') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
        :page-size.sync="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog class="addMsg" :title="$t(titleKey)" v-loading="dialogLoading" :visible.sync="dialogDataShow"
      append-to-body :close-on-click-modal="false" width="700px">
      <el-form ref="dialogData" class="dialogForm" :rules="dialogDataRules" :model="dialogData" size="medium"
        :inline="true" label-width="110px" label-position="top">
        <el-form-item :label="$t('resultPush.taskName')" prop="taskName">
          <el-input v-model="dialogData.taskName" :disabled="dialogData.taskType == '0'"
            :placeholder="$t('resultPush.enterTaskName')"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('resultPush.pushType')" prop="pushType">
              <el-select clearable v-model="dialogData.pushType" :disabled="dialogData.taskType == '0'"
                :placeholder="$t('resultPush.selectPushType')" @change="handlePushTypeChange">
                <el-option v-for="item in dict.type.sys_push_type" :key="item.value" :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('resultPush.provider')">
              <el-select clearable v-model="dialogData.provider" disabled :placeholder="$t('resultPush.pleaseSelect')">
                <el-option v-for="item in dict.type.sys_provider_type" :key="item.value" :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('resultPush.host')" prop="host">
              <el-input v-model="dialogData.host" :placeholder="$t('resultPush.enterHost')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('resultPush.port')" prop="port">
              <el-input v-model="dialogData.port" :placeholder="$t('resultPush.enterPort')"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('resultPush.account')" prop="userName">
              <el-input v-model="dialogData.userName" :placeholder="$t('resultPush.enterAccount')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('resultPush.password')" prop="passWord">
              <el-input type="password" v-model="dialogData.passWord" :show-password="passwordVisible"
                :placeholder="$t('resultPush.enterPassword')"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="dialogData.pushType == '1'" :label="$t('resultPush.classificationStandard')"
          prop="standardId">
          <el-select clearable v-model="dialogData.standardId" :placeholder="$t('resultPush.pleaseSelect')" filterable>
            <el-option v-for="item in standardList" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogData.pushType == '2'" :label="$t('resultPush.dataSourceName')" prop="sourceId">
          <el-select clearable v-model="dialogData.sourceId" :placeholder="$t('resultPush.pleaseSelect')" filterable
            @change="handleSourceIdChange">
            <el-option v-for="item in sourceNameList" :key="item.id" :label="item.sourceName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('resultPush.pushContent')">
          <el-input :disabled="dialogData.pushType == '3'"
            :placeholder="dialogData.pushType == '3' ? $t('resultPush.defaultPushContent') : ''">
          </el-input>
          <el-tag v-if="dialogData.pushType != '3'" type="info"
            style="position: absolute; top: 2px;left: 2px; background-color: #e5e5e5;" @click="pushBodyClickFn">
            {{ $t('resultPush.selectedCount', { count: dialogData.pushBodyList ? dialogData.pushBodyList.length : 0 })
            }}
          </el-tag>
        </el-form-item>
        <el-form-item v-if="dialogData.pushType == '3'" :label="$t('resultPush.certificateSource')" prop="useInnerCert">
          <div style="display: flex; align-items: center;">
            <span>{{ $t('resultPush.useBuiltInCertificate') }}</span>
            <el-switch v-model="dialogData.useInnerCert" style="margin: 0 15px;" />
            <span>
              {{
                $t('resultPush.currentCertificateSource', {
                  value: dialogData.useInnerCert
                    ? $t('resultPush.builtInCertificate')
                    : $t('resultPush.manualUpload')
                })
              }}
            </span>
          </div>
          <el-upload v-if="!dialogData.useInnerCert" ref="p12Upload" class="upload-demo" action="" :limit="1" drag
            :auto-upload="false" accept=".p12">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text" style="color: #999;">
              <em style="font-size: 16px;">{{ $t('resultPush.selectP12File') }}</em>
              <span>{{ $t('resultPush.onlySupportP12') }}</span>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="dialogData.pushType == '3' && !dialogData.useInnerCert"
          :label="$t('resultPush.certificateKey')" prop="p12Password">
          <el-input type="password" v-model="dialogData.p12Password"
            :placeholder="$t('resultPush.enterCertificateKey')"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitFormFn">{{ $t('confirm') }}</el-button>
        <el-button @click="importcancel">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="$t('resultPush.pushContent')" :visible.sync="contentShow" width="950px">
      <template v-if="dialogData.pushType == '1'">
        <Result v-if="contentShow" ref="ResultSon" :treeData="categoryList" :checkList="dialogData.pushBodyList" />
      </template>
      <template v-else>
        <Result2 v-if="contentShow" ref="Result2Son" :id="dialogData.id" :databaseId="dialogData.sourceId" />
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="pushBodySumbit">{{ $t('confirm') }}</el-button>
        <el-button @click="pushBodycancel">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getResultPushList,
  getStandardList,
  addResultPush,
  updateResultPush,
  pushResult,
  deleteResultPush,
  selectPublishDataBase,
  testLink,
} from "@/api/APIAbutment";
import { resultPushByParentId } from "@/api/system/protectCategory";
import Result from './components/result.vue'
import Result2 from './components/result2.vue'

export default {
  dicts: ['sys_provider_type', 'sys_push_type'],
  name: "resultPush",
  components: { Result, Result2 },
  data() {
    return {
      loading: false,
      contentShow: false,
      mainLoading: false,
      dialogLoading: false,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      proxysList: [],
      titleKey: 'add',
      dialogDataShow: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        pushType: '',
        taskName: '',
        proxyId: '',
        publishStatus: '',
        maskComplete: '',
      },
      dialogData: {
        taskName: '',
        pushType: '',
        provider: '',
        pushVersion: '',
        host: '',
        port: '',
        id: '',
        userName: '',
        passWord: '',
        standardId: '',
        sourceId: '',
        pushBodyList: [],
        useInnerCert: true,
        p12Password: '',
      },
      debounceTimeout: null,
      standardList: [],
      sourceNameList: [],
      categoryList: [],
      passwordVisible: true,
    };
  },
  computed: {
    dialogDataRules() {
      return {
        taskName: [
          { required: true, message: this.$t('resultPush.validation.taskNameRequired'), trigger: "blur" }
        ],
        pushType: [
          { required: true, message: this.$t('resultPush.validation.pushTypeRequired'), trigger: "blur" }
        ],
        provider: [
          { required: true, message: this.$t('resultPush.validation.providerRequired'), trigger: "blur" }
        ],
        host: [
          { required: true, message: this.$t('resultPush.validation.hostRequired'), trigger: "blur" },
        ],
        port: [
          { required: true, message: this.$t('resultPush.validation.portRequired'), trigger: "blur" },
        ],
        userName: [
          { required: true, message: this.$t('resultPush.validation.accountRequired'), trigger: "blur" },
        ],
        passWord: [
          { required: true, message: this.$t('resultPush.validation.passwordRequired'), trigger: "blur" },
        ],
        standardId: [
          { required: true, message: this.$t('resultPush.validation.classificationStandardRequired'), trigger: "blur" },
        ],
        sourceId: [
          { required: true, message: this.$t('resultPush.validation.dataSourceNameRequired'), trigger: "blur" },
        ],
        pushBodyList: [
          { required: true, message: this.$t('resultPush.validation.pushContentRequired'), trigger: "blur" },
        ],
      }
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    getTaskTypeLabel(taskType) {
      if (taskType === '0') return this.$t('resultPush.builtIn')
      if (taskType === '1') return this.$t('resultPush.custom')
      return '--'
    },
    getConnectStatusLabel(connectStatus) {
      if (connectStatus === '0') return this.$t('resultPush.notConnected')
      if (connectStatus === '1') return this.$t('resultPush.connected')
      if (connectStatus === '2') return this.$t('resultPush.disconnected')
      return '--'
    },
    checkSelectable(row) {
      return row.taskType != '0'
    },
    initList() {
      this.getStandardListFn()
      this.getSourceNameListFn()
    },
    getSourceNameListFn() {
      return selectPublishDataBase().then(res => {
        this.sourceNameList = res.data.map(item => ({
          ...item,
          id: String(item.id)
        }))
      })
    },
    getProtectCategory() {
      this.treeLoading = true
      const data = {
        parentId: this.dialogData.standardId,
        needSub: 1
      };
      return resultPushByParentId(data).then(resp => {
        this.categoryList = this.handleTree(resp.data, "id")
      });
    },
    getStandardListFn() {
      return getStandardList().then(res => {
        this.standardList = res.data.map(item => {
          return { ...item, categoryName: item.categoryName, id: item.id + '' }
        })
      })
    },
    importcancel() {
      this.dialogDataShow = false
    },
    pushBodycancel() {
      this.contentShow = false
    },
    inputSearch() {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleQuery()
      }, 500);
    },
    getList() {
      this.loading = true;
      getResultPushList(this.queryParams).then(res => {
        this.proxysList = res.data.rows;
        this.proxysList.forEach(item => {
          const value = item.useInnerCert
          item.useInnerCert = !(value === '0' || value === 0 || value === false)
        })
        this.total = res.data.total;
        this.loading = false;
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.initList()
      this.resetAddData()
      this.passwordVisible = true
      this.dialogDataShow = true;
      this.titleKey = "add";
    },
    pushBodySumbit() {
      if (this.dialogData.pushType == '1') {
        this.dialogData.pushBodyList = this.$refs.ResultSon.lastChildList.map(item => item.id)
      } else {
        this.dialogData.pushBodyList = this.$refs.Result2Son.lastChildList.map(item => item.id)
      }
      this.contentShow = false
    },
    async submitFormFn() {
      this.$refs["dialogData"].validate(async valid => {
        if (valid) {
          const isEdit = !!this.dialogData.id
          const formData = new FormData()

          if (String(this.dialogData.pushType) === '3' && this.dialogData.useInnerCert === false) {
            const uploader = this.$refs.p12Upload
            const files = uploader && uploader.uploadFiles ? uploader.uploadFiles : []
            if (!files || files.length === 0 || !files[0] || !files[0].raw) {
              this.$message.error(this.$t('resultPush.uploadCertificateFile'))
              return
            }
            formData.append('file', files[0].raw)
          }

          formData.append('useInnerCert', this.dialogData.useInnerCert ? '1' : '0')
          formData.append('pushBody', this.dialogData.pushBodyList.join())
          formData.append('taskName', this.dialogData.taskName)
          formData.append('pushType', this.dialogData.pushType)
          formData.append('provider', this.dialogData.provider)
          formData.append('host', this.dialogData.host)
          formData.append('port', this.dialogData.port)
          formData.append('userName', this.dialogData.userName)
          formData.append('passWord', this.dialogData.passWord)
          formData.append('standardId', this.dialogData.standardId)
          formData.append('p12Password', this.dialogData.p12Password)

          if (isEdit) {
            formData.append('id', this.dialogData.id)
          }

          if (this.dialogData.pushType == '2') {
            const selectedSource = this.sourceNameList.find(item => item.id == this.dialogData.sourceId)
            if (selectedSource) {
              formData.append('standardId', this.dialogData.sourceId)
              formData.append('sourceName', selectedSource.sourceName)
            }
          }

          if (isEdit) {
            updateResultPush(formData).then(() => {
              this.$modal.msgSuccess(this.$t('resultPush.editSuccess'));
              this.dialogDataShow = false;
              this.getList();
            });
          } else {
            addResultPush(formData).then(() => {
              this.$modal.msgSuccess(this.$t('resultPush.addSuccess'));
              this.dialogDataShow = false;
              this.getList();
            });
          }
        }
      });
    },
    handleEcelFn(row) {
      this.initList()
      this.editIsFlag = false
      this.passwordVisible = false
      this.dialogDataShow = true
      this.dialogData = JSON.parse(JSON.stringify(row))
      if (String(this.dialogData.pushType) == '2') {
        this.$set(this.dialogData, 'sourceId', String(row.standardId))
        this.$set(this.dialogData, 'sourceName', row.sourceName)
      }
      this.dialogData.pushBodyList = row.pushBody ? row.pushBody.split(',') : []
      this.titleKey = 'edit'
    },
    handlePushTypeChange(value) {
      if (value === '1' || value === '2') {
        this.dialogData.provider = '1'
        this.dialogData.useInnerCert = true
        this.dialogData.p12Password = ''
        const uploader = this.$refs.p12Upload
        if (uploader && uploader.clearFiles) {
          uploader.clearFiles()
        }
      } else if (value === '3') {
        this.dialogData.provider = '2'
      }
    },
    testClick(row) {
      testLink({ id: row.id }).then(res => {
        if (res.code == 200) {
          this.$message.success(this.$t('resultPush.testSuccess'))
        }
      })
    },
    handleSourceIdChange(value) {
      this.$set(this.dialogData, 'sourceId', String(value))
      const selected = this.sourceNameList.find(item => item.id === String(value))
      if (selected) {
        this.$set(this.dialogData, 'sourceName', selected.sourceName)
      }
    },
    deleteFn() {
      const dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(this.$t('resultPush.deleteConfirm'), this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          const ids = dataS.map(item => item.id)
          deleteResultPush({ ids }).then(res => {
            if (res.code == 200) {
              this.$message.success(this.$t('resultPush.deleteSuccess'))
              this.getList()
            }
          })
        })
      } else {
        this.$message({ message: this.$t('resultPush.selectAtLeastOne'), type: 'warning' })
      }
    },
    resetAddData() {
      this.dialogData = {
        taskName: '',
        pushType: '',
        provider: '',
        pushVersion: '',
        host: '',
        port: '',
        id: '',
        userName: '',
        passWord: '',
        standardId: '',
        sourceId: '',
        pushBodyList: [],
        useInnerCert: true,
        p12Password: '',
      }
    },
    scanStateClickFn(row) {
      this.$confirm(this.$t('resultPush.pushConfirm'), this.$t('tip'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        pushResult({ id: row.id }).then(res => {
          if (res.code == 200) {
            this.$message.success(this.$t('resultPush.pushSuccess'))
            this.getList()
          }
        })
      }).catch(() => {
      });
    },
    async pushBodyClickFn() {
      if (this.dialogData.pushType == '1') {
        if (!this.dialogData.standardId) {
          this.$message({ message: this.$t('resultPush.chooseStandardThenClick'), type: 'warning' })
          return
        }
        await this.getProtectCategory()
        this.contentShow = true
      } else {
        if (!this.dialogData.sourceId) {
          this.$message({ message: this.$t('resultPush.chooseSourceThenClick'), type: 'warning' })
          return
        }
        this.contentShow = true
      }
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
.searchCard {
  border-radius: 10px;
  margin-bottom: 20px;
}

.yuanDataClass {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.yuanDataClass /deep/ .el-form-item {
  width: 30%;
  margin-bottom: 0;
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

.searchBtn {
  height: 100%;
}

.table-card {
  margin-top: 20px;
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.table-card>>>.el-card__body {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tableBox {
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #e2e8f0;
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

.addMsg ::v-deep .el-input {
  width: 100%;
}

.addMsg ::v-deep .el-select {
  width: 100%;
}

.addMsg .el-select ::v-deep .el-input {
  width: 100%;
}

.addMsg ::v-deep.el-dialog {
  border-radius: 10px;
}

.addMsg ::v-deep.el-dialog__header {
  border-bottom: 1px solid #e6e6e6;
}

.addMsg ::v-deep.el-dialog__title {
  font-weight: bold;
}

.addMsg ::v-deep.el-dialog__body {
  padding: 30px;
}

.addMsg ::v-deep.el-form {
  margin-bottom: 0;
}

.upload-demo {
  margin-top: 20px;

  .el-upload--text {
    width: 100%;
  }

  .el-upload-dragger {
    width: 100%;
  }
}
</style>
