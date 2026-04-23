<template>
  <div class="app-container" v-loading="mainLoading">
    <el-card shadow="never" class="searchCard">
      <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small"
        :inline="true" label-width="auto">
        <el-form-item :label="$t('dataAssetdiscover.taskName')" prop="taskName">
          <el-input v-model="queryParams.taskName" @input="inputSearch" :placeholder="$t('dataAssetdiscover.taskName')" clearable
            @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('dataAssetdiscover.taskState')" prop="taskState">
          <el-select clearable v-model="queryParams.taskState" @change="inputSearch" :placeholder="$t('dataAssetdiscover.taskState')">
            <el-option v-for="item in executeStatus" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="medium" @click="handleAdd">
          {{ $t('dataAssetdiscover.addTask') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-video-play" size="medium" @click="scanSMFn">
          {{ $t('dataAssetdiscover.scanTask') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-close" size="medium" @click="deleteFn">
          {{ $t('dataAssetdiscover.deleteTask') }}
        </el-button>
      </el-col>
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" height="860px" class="tableBox" :data="proxysList"
        @selection-change="handleSelectionChange" ref="tableRef">
        <template slot="empty">
          <el-empty :description="$t('noData')"></el-empty>
        </template>
        <el-table-column type="selection" width="60" align="center" :selectable="selectableFn" />
        <el-table-column :label="$t('dataAssetdiscover.taskName')" align="left" width="140" prop="taskName" show-overflow-tooltip>
          <template slot-scope="scope">
            <svg-icon icon-class="jobs" style="font-size: 16px; margin-right: 5px;" />
            {{ scope.row.taskName }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('dataAssetdiscover.ipScope')" align="center" prop="ipScope" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.ipScope }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dataAssetdiscover.ports')" align="center" prop="ports" show-overflow-tooltip />  
        <el-table-column :label="$t('dataAssetdiscover.scheduleType')" align="center" prop="scheduleType" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.scheduleType == '0' ? $t('dataAssetdiscover.manual') : scope.row.scheduleType == '1' ? $t('dataAssetdiscover.daily') :
              scope.row.scheduleType
                == '2' ? $t('dataAssetdiscover.weekly') : scope.row.scheduleType == '3' ? $t('dataAssetdiscover.monthly') : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dataAssetdiscover.servicesNum')" align="center" prop="servicesNum" show-overflow-tooltip />
        <el-table-column :label="$t('dataAssetdiscover.taskState')" align="center" prop="taskState" show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="display: flex; align-items: center;justify-content: center;">
              <img style="display: block; width: 20px;margin-right: 10px;"
                :src="imgSrc[scope.row.taskState ? scope.row.taskState : 'NONE']" alt="">
              <span> {{ stateMsg(scope.row.taskState) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dataAssetdiscover.updateTime')" align="center" prop="updateTime" show-overflow-tooltip />
        <el-table-column :label="$t('dataAssetdiscover.operation')" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" :disabled="scope.row.scanState == 'RUNNING'"
              @click="handleEcelFn(scope.row)">{{ $t('dataAssetdiscover.editTask') }}</el-button>
            <el-button size="mini" type="text" @click="scanStateClickFn(scope.row)">{{ $t('dataAssetdiscover.scanResult') }}</el-button>
            <el-button size="mini" type="text" @click="stopSMFn(scope.row)" :disabled="scope.row.taskState != 'RUNNING'">{{ $t('dataAssetdiscover.stopTask') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
        :page-size.sync="queryParams.pageSize" @pagination="getList" />
    </el-card>


    <!-- 新增编辑框 -->
    <el-dialog class="custom-dialog" :title="addOrEdit.title" v-loading="addOrEditLoading"
      :visible.sync="addOrEdit.show" append-to-body :close-on-click-modal="false" width="700px">
      <el-form :model="addOrEditFormData" size="medium" v-if="addOrEdit.show" :rules="addOrEditRules"
        ref="addOrEditForm" label-width="80px" label-position="top" class="dialog-form">
        <el-form-item :label="$t('dataAssetdiscover.taskName')" prop="taskName">
          <el-input v-model="addOrEditFormData.taskName" maxlength="50" :placeholder="$t('dataAssetdiscover.taskName')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('dataAssetdiscover.ipScope')" prop="ipScope">
          <el-input v-model="addOrEditFormData.ipScope" maxlength="50" :placeholder="$t('dataAssetdiscover.ipScope')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('dataAssetdiscover.ports')" prop="ports">
          <el-input v-model="addOrEditFormData.ports" maxlength="50" :placeholder="$t('dataAssetdiscover.ports')"></el-input>
          <div style="font-size: 12px; font-style: italic;">{{ $t('dataAssetdiscover.portsExample') }}</div>
        </el-form-item>
        <el-form-item :label="$t('dataAssetdiscover.scheduleType')" prop="scheduleType">
          <el-select v-model="addOrEditFormData.scheduleType" @change="scheduleTypeChange">
            <el-option v-for="item in weekTimeList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-select v-show="addOrEditFormData.scheduleType == '2' || addOrEditFormData.scheduleType == '3'"
            v-model="addOrEditFormData.scheduleInterval">
            <el-option v-for="item in weekList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <el-time-picker v-show="addOrEditFormData.scheduleType != '0' && addOrEditFormData.scheduleType != ''"
            v-model="addOrEditFormData.scheduleTime" value-format='HH:mm' format="HH:mm" :placeholder="$t('dataAssetdiscover.scheduleTime')">
          </el-time-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="addSubmitForm">
          {{ $t('confirm') }}
        </el-button>
        <el-button @click="addCancel">
          {{ $t('cancel') }}
        </el-button>
      </div>
    </el-dialog>
    <Drawer :title="$t('dataAssetdiscover.scanResult')" class="dialogClass" :visible.sync="drawerShow" :destroy-on-close="true" direction="rtl"
      size="60%" :before-close="handleClose">
      <template slot="body">
        <Result :drawerData="drawerData" />
      </template>
    </Drawer>
  </div>
</template>

<script>

import {
  listDatabaseProxysScan,
  addDatabaseProxysScan,
  deleteDatabaseProxysScan,
  scanIpAndPort,
  terminationScan,
  updateDatabaseProxysScan,
} from "@/api/dataAssetManagement"
import {
  nameTesting, checkSourceName,
} from "@/api/system/protectCategory"
import Result from './components/result.vue'
export default {
  name: "dataAssetdiscover",
  components: { Result },
  data() {
    return {
      addOrEdit: {
        title: '',
        flag: 1,
        show: false,
      },//新增编辑数据
      addOrEditFormData: {
        taskName: '',
        ipScope: '',
        ports: '',
        scheduleType: '',
        scheduleInterval: '',
        scheduleTime: '00:00',
      },// 表单数据
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
      weekList: [
        this.$t('dataAssetdiscover.monday'),
        this.$t('dataAssetdiscover.tuesday'),
        this.$t('dataAssetdiscover.wednesday'),
        this.$t('dataAssetdiscover.thursday'),
        this.$t('dataAssetdiscover.friday'),
        this.$t('dataAssetdiscover.saturday'),
        this.$t('dataAssetdiscover.sunday'),
      ],
      editIsFlag: false,
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
      executeStatus: [
        {
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
      titleExcel: this.$t('dataFrom.addExcelFile'),
      addOrEditLoading: false,
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
      addOrEditRules: {
        taskName: [
          {
            required: true, message: this.$t('dataAssetdiscover.inputTaskName'), trigger: "blur"
          }
        ],
        ipScope: [
          {
            required: true, message: this.$t('dataAssetdiscover.inputIpScope'), trigger: "blur"
          }
        ],
        ports: [
          {
            required: true, message: this.$t('dataAssetdiscover.inputPorts'), trigger: "blur"
          }
        ],
        scheduleType: [
          {
            required: true, message: this.$t('dataAssetdiscover.selectSchedule'), trigger: "blur"
          }
        ],
        scheduleInterval: [
          {
            required: true, validator: this.validateScheduleInterval, message: this.$t('dataAssetdiscover.selectInterval'), trigger: "blur"
          }
        ],
        scheduleTime: [
          {
            required: true, validator: this.validateScheduleTime, message: this.$t('dataAssetdiscover.selectTime'), trigger: "blur"
          }
        ],
      },
      tabelCheckedName: '',
    };
  },
  computed: {
  },
  created() {
    this.getList()
  },
  methods: {
    //控制多选框是否可选
    selectableFn(row, index) {
      const processingStates = ['RUNNING', 'STAYEXECUTE', 'PAUSEDING', 'KILLEDING'];
      if (processingStates.includes(row.taskState)) {
        return false
      } else {
        return true
      }
    },
    // 自定义校验规则
    //  validateScheduleTime(rule, value, callback) {
    //   if(this.addOrEditFormData.scheduleType != '0'){
    //     callback(new Error("请选择"));
    //   }else {
    //     callback();
    //   }
    // },
    scheduleTypeChange(val) {
      console.log(val);

      if (val == '3') {
        // 获取当前月的天数
        this.addOrEditFormData.scheduleInterval = '1'
        const daysInMonth = this.getDaysInCurrentMonth();
        // 将天数转换为数组
        this.weekList = this.createDaysArray(daysInMonth);
      } else if (val == '2') {
        this.addOrEditFormData.scheduleInterval = this.$t('dataAssetdiscover.monday')
        this.weekList = [
          this.$t('dataAssetdiscover.monday'),
          this.$t('dataAssetdiscover.tuesday'),
          this.$t('dataAssetdiscover.wednesday'),
          this.$t('dataAssetdiscover.thursday'),
          this.$t('dataAssetdiscover.friday'),
          this.$t('dataAssetdiscover.saturday'),
          this.$t('dataAssetdiscover.sunday'),
        ]
      } else {
        this.addOrEditFormData.scheduleInterval = ''
      }
    },
    addCancel() {
      this.addOrEdit.show = false
      this.reset()
    },
    addSubmitForm() {
      this.$refs["addOrEditForm"].validate((valid) => {
        if (valid) {
          if (this.addOrEditFormData.id) {
            updateDatabaseProxysScan(this.addOrEditFormData).then((response) => {
              this.$message({
                message: this.$t('dataAssetdiscover.editSuccess'),
                duration: 3000,
                type: 'success'
              });
              this.getList();
              this.addOrEdit.show = false
            });
          } else {
            addDatabaseProxysScan(this.addOrEditFormData).then((response) => {
              this.$message({
                message: this.$t('dataAssetdiscover.addSuccess'),
                duration: 3000,
                type: 'success'
              });
              this.getList();
              this.addOrEdit.show = false
            });
          }
        }
      });

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
      return msg || this.$t('dataAssetdiscover.pendingScan')
    },
    businessNameFn(val) {
      this.form.businessName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    async rulsNameIsRight(id, name) {
      let params = {
        nodeId: id,
        name,
      }
      let res = await nameTesting(params)
      this.isName = res.data
    },

    handleClose() {
      this.drawerShow = false
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
      listDatabaseProxysScan(this.queryParams).then(response => {
        this.proxysList = response.data.rows;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    reset() {
      this.addOrEditFormData.scheduleTime = '00:00'
      this.addOrEditFormData.scheduleInterval = ''
      this.addOrEditFormData.scheduleType = ''
      this.addOrEditFormData.taskName = ''
      this.addOrEditFormData.ipScope = ''
      this.addOrEditFormData.ports = ''
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
      this.addOrEdit.title = this.$t('dataAssetdiscover.newTask')
      this.addOrEdit.show = true
      this.addOrEdit.flag = 1 // 1新增2编辑
    },
    handleEcelFn(row) {
      this.addOrEdit.title = this.$t('dataAssetdiscover.editTaskDialog')
      this.addOrEdit.show = true
      this.addOrEdit.flag = 2 // 1新增2编辑
      this.addOrEditFormData = JSON.parse(JSON.stringify(row))
    },
    // 删除
    deleteFn() {
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(this.$t('dataAssetdiscover.confirmDelete'), this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          console.log(ids);

          deleteDatabaseProxysScan({ ids }).then(res => {
            if (res.code == 200) {
              this.$message.success(res.msg)
              this.getList()
            }
          })
        })
      } else {
        this.$message({ message: this.$t('dataAssetdiscover.selectAtLeastOne'), type: 'warning' })
      }
    },
    // 扫描
    scanSMFn() {
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(this.$t('dataAssetdiscover.confirmScan'), this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          console.log(ids);

          scanIpAndPort({ ids }).then(res => {
            if (res.code == 200) {
              this.$message.success(res.msg)
              this.getList()
            }
          })
        })
      } else {
        this.$message({ message: this.$t('dataAssetdiscover.selectAtLeastOne'), type: 'warning' })
      }
    },
    // 终止任务
    stopSMFn(row) {
      this.$confirm(this.$t('dataAssetdiscover.confirmStopTask'), this.$t('tip'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        let id = row.id
        
        terminationScan({ id }).then(res => {
          if (res.code == 200) {
            this.$message.success(res.msg)
            this.getList()
          }
        })
      })
    },
    scanStateClickFn(row) {
      this.drawerData = JSON.parse(JSON.stringify(row))
      this.drawerShow = true
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

    createDaysArray(days) {
      const daysArray = [];
      for (let i = 1; i <= days; i++) {
        daysArray.push(i);
      }
      return daysArray;
    }
  }
};
</script>
<style>
input[aria-hidden=true] {
  display: none !important;
}
</style>
<style scoped>
/deep/.searchCard {
  border-radius: 10px;
  margin-bottom: 30px;

  & .el-card__body {
    padding: 24px;
  }
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
  margin-bottom: 0px;
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
  /* margin-left: auto; */
  height: 100%;
}

/* .searchBtn /deep/ .el-form-item__content {
  margin-left: 263px
} */

.importForm /deep/ .el-form-item--medium {
  width: 70%;

}

.importForm /deep/ .el-form-item__content {
  width: calc(100% - 145px);
}

.uploadClass {
  width: 20% !important;
}

.weekTimeClass /deep/ .el-form-item__content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: calc(100% - 80px);
  /* width: calc(100%); */
}

.weekTimeClass /deep/ .el-select {
  width: 30%;
  margin-right: 10px;
  /* width: calc(100%); */
}

.weekTimeClass /deep/ .el-date-editor {
  width: 30%;
  /* width: calc(100%); */
}

.table-card {
  margin-top: 20px;
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

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #0003;
  transition: all .2s ease-in-out;
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar-track {
  border-radius: 10px;
}

.dialogClass /deep/ .el-drawer__header {
  margin-bottom: 0px;
  /* padding: 0px; */
  /* display: none; */
}

.dialogClass /deep/ .el-drawer__body {
  padding: 0px;
  background-color: #f1f5f9;
}

.custom-dialog /deep/.el-dialog {
  border-radius: 10px;
}

.custom-dialog /deep/.el-dialog__header {
  border-bottom: 1px solid #e6e6e6;
}

.custom-dialog /deep/.el-dialog__title {
  font-weight: bold;
}

.custom-dialog /deep/.el-dialog__body {
  padding: 30px;
}

.dialog-form /deep/.el-form-item__content {
  padding-right: 15px;
}

.dialog-form /deep/.el-select--medium {
  width: 100%;
}
</style>



