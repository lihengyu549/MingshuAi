<template>
  <div class="app-container" v-loading="fullscreenLoading">
    <!-- <div class="app-container" > -->
    <div class="apiHead">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="70px">
        <el-form-item label="项目名称" prop="project">
          <!-- <el-input
          v-model="queryParams.project"
          placeholder="请输入项目"
          clearable
          @keyup.enter.native="handleQuery"
        /> -->
          <el-select v-model="selectProject" filterable remote clearable reserve-keyword placeholder="请输入项目名称"
            :remote-method="queryProjectList" :loading="loading" @change="projectChange($event)">
            <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="请求方法" prop="method">
          <el-input v-model="queryParams.method" placeholder="请输入限定请求方法" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="路由" prop="patterns">
          <el-input v-model="queryParams.patterns" placeholder="请输入路由" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="类名" prop="className">
          <el-input v-model="queryParams.className" placeholder="请输入类名" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="方法名" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入方法名" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="参数列表" prop="descriptor">
          <el-input v-model="queryParams.descriptor" placeholder="请输入参数列表" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="添加时间" prop="descriptor">
          <div class="block">
            <el-date-picker size="mini" prefix-icon="el-icon-date" :clearable="false" v-model="range" type="datetimerange"
              :picker-options="pickerOptions" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期"
              align="right" @change="handleDateRangeChange">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item class="seek">
          <el-button type="primary" plain icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <!-- <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button> -->
        </el-form-item>
      </el-form>
      <el-row :gutter="10" class="mb8">
        <!-- <el-col :span="1.5">
          <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
            v-hasPermi="['system:api:add']">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
            v-hasPermi="['system:api:edit']">修改</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
            v-hasPermi="['system:api:remove']">删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
            v-hasPermi="['system:api:export']">导出</el-button>
        </el-col> -->
        <el-col :span="1.5">
          <el-button type="primary" plain icon="el-icon-upload2" size="mini" @click="handleImport"
            v-hasPermi="['system:api:edit']">导入</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
    </div>
    <el-table v-loading="loading" :data="apiList" @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'apiCount', order: 'descending' }" @sort-change="handleSortChange">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <!-- <el-table-column label="ID" align="center" prop="id" /> -->
      <el-table-column label="项目" align="center" prop="projectName" />
      <el-table-column label="请求方法" show-overflow-tooltip align="center" prop="method" />
      <el-table-column label="路由" show-overflow-tooltip align="center" prop="patterns" />
      <el-table-column label="类名" show-overflow-tooltip align="center" prop="className" />
      <el-table-column label="方法名" align="center" prop="name" />
      <el-table-column label="参数列表" show-overflow-tooltip align="center" prop="descriptor" />
      <el-table-column label="来源" align="center">
        <template slot-scope="scope">
          <span class="sourceClass" v-if="scope.row.platformImport">平台导入</span>
          <span class="sourceClass" v-if="scope.row.autoImport">自动发现</span>
        </template>
      </el-table-column>
      <el-table-column label="API添加时间" align="center">
        <template slot-scope="scope">
          <span>{{ timeFormat(addTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="">
        <template slot-scope="scope">
          <span>{{ scope.row.remark }}</span>
          <i class="el-icon-edit" style="cursor:pointer ;" @click="modifyRemarks(scope.row)"></i>
        </template>
      </el-table-column>
      <el-table-column label="调用次数" sortable="custom" align="center" prop="apiCount" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-document" @click="handlerMonitor(scope.row)">调用记录</el-button>
          <!-- <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:api:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:api:remove']">删除</el-button> -->
          <el-button size="mini" type="text" icon="el-icon-tickets" @click="associatedField(scope.row)"
            v-hasPermi="['system:project:remove']">关联字段</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 修改备注 -->
    <el-dialog :close-on-click-modal="false" title=" 修改API备注" :visible.sync="openModifiedRemarksvisible" width="500px"
      append-to-body>
      <el-form ref="form" :model="form" label-width="80px" @submit.native.prevent>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入API备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="revampRember">确 定</el-button>
        <el-button @click="openModifiedRemarksvisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-drawer class="importCla" title="" :wrapperClosable="false" :visible.sync="importOpen" width="550px"
      append-to-body>
      <div class="text_62">
        导入API
      </div>
      <button @click="importCancel" class="close_t">
        ×
      </button>
      <el-form ref="form" :model="form" label-width="80px" append-to-body>
        <div class="text-wrapper">
          <el-form-item label="项目名称" :rules="rules.formProject" prop="formProject">
            <el-select v-model="form.formProject" filterable remote reserve-keyword placeholder="请输入项目名称"
              @change="projectNameChange($event)" :remote-method="queryFormProjectList" :loading="loading">
              <el-option v-for="item in formProjectList" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="上传格式" prop="">
            <el-radio-group v-model="importType" @change="impType">
              <el-radio :label="item.platformName" v-for="item in apiImpList" :key="item.id"></el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <div class="flex-col">
          <el-form-item label="导入类型">
            <el-radio-group v-model="radio">
              <el-radio label="file" v-if="selectImputItem.fileInput">文件导入</el-radio>
              <el-radio label="apifoxUrl" v-if="selectImputItem.urlInput">url导入</el-radio>
            </el-radio-group>
          </el-form-item>
          <div>
            <el-upload v-if="radio == 'file'" style="margin-top: 50px" ref="upload" :headers="upload.headers" :action="upload.url +
              '?type=' +
              importType +
              '&projectId=' +
              form.projectId
              " :on-success="handleFileSuccess" :file-list="fileList" class="upload-demo" :auto-upload="false"
              :limit="1" drag>
              <i>
                <svg-icon class="filePic" slot="prefix" icon-class="file" />
              </i>
              <div class="el-upload__text">
                点击或将文件拖拽到这里上传 <br>
                <!-- <span class="text_128">支持扩展名：.rar&nbsp;.zip&nbsp;.doc&nbsp;.docx&nbsp;.pdf&nbsp;.jpg...</span> -->
              </div>
            </el-upload>
          </div>

          <div class="apiDiv" v-if="radio == 'apifoxUrl'">
            <el-form-item label="api地址:" prop="urlInput" :rules="rules.urlInput">
              <el-input placeholder="请输入api地址" v-model="form.urlInput" clearable>
              </el-input>
            </el-form-item>
          </div>
          <!-- <div class="apiDiv" v-if="apiUrl">
        <div class="apiAddress">api地址:</div> -->
          <!-- <input type="text" placeholder="请输入内容" v-model="urlInput" clearable > 
       <el-input placeholder="请输入api地址" v-model="form.urlInput" clearable>
        </el-input>
      </div> -->
          <div class="dialog-footer">
            <el-button :disabled="!formProject" type="primary" @click="submitUpload">确 定</el-button>
            <el-button @click="importCancel">取 消</el-button>
          </div>
        </div>
      </el-form>
    </el-drawer>
    <!-- 添加或修改api信息对话框 -->
    <!-- <el-dialog class="addMsg" :close-on-click-modal="false" :title="title" :visible.sync="open" width="500px"
      append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="项目名称" prop="projectName" :rules="rules.projectName">
          <el-select v-model="form.projectName" filterable remote reserve-keyword placeholder="请输入项目名称"
            @change="projectNameChange($event)" :remote-method="queryFormProjectList" :loading="loading">
            <el-option v-for="item in formProjectList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="请求方法" prop="method">
          <el-input v-model="form.method" placeholder="请输入限定请求方法" />
        </el-form-item>
        <el-form-item label="路由" prop="patterns" :rules="rules.patterns">
          <el-input v-model="form.patterns" placeholder="请输入路由" />
        </el-form-item>
        <el-form-item label="类名" prop="className">
          <el-input v-model="form.className" placeholder="请输入类名" />
        </el-form-item>
        <el-form-item label="方法名" prop="name">
          <el-input v-model="form.name" placeholder="请输入方法名" />
        </el-form-item>
        <el-form-item label="参数列表" prop="descriptor">
          <el-input v-model="form.descriptor" placeholder="请输入参数列表" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog> -->

    <!-- 调用记录 -->
    <div class="drawerdiv">
      <el-drawer :visible.sync="drawer" :with-header="false" @close="handleClose" width="80%">
        <span>
          <callRecord ref="callRecord" :selectRow="selectRow"></callRecord>
        </span>
      </el-drawer>
    </div>

    <!-- 关联字段 -->

    <div>
      <el-dialog class="associatedTxt" :title="title" :modal="true" :close-on-click-modal="true"
        :close-on-press-escape="false" :visible.sync="associatedVisible" width="40%">

        <el-table :data="tableData" style="width: 100%; height: 700px; overflow: auto; border-bottom: 0px !important;">
          <el-table-column prop="databaseName" label="数据库名">
          </el-table-column>
          <el-table-column prop="tableName" label="表名">
          </el-table-column>
          <el-table-column prop="fieldName" label="字段名">
          </el-table-column>
          <el-table-column prop="fieldType" label="字段类型">
          </el-table-column>
          <el-table-column prop="fieldRemark" label="字段备注">
          </el-table-column>
          <el-table-column prop="securityRule" label="命中策略">
            <template slot-scope="scope">
              <div class="sourceClass" v-for="item in JSON.parse(scope.row.securityRule)">{{ item }}</div>
            </template>

          </el-table-column>
          <el-table-column prop="securityLevel" label="安全级别">
          </el-table-column>
          <el-table-column prop="securityRule" label="操作">
            <template slot-scope="scope">
              <a style="color: #1890ff;" @click="sampleValue(scope.row)"> 示例值</a>
            </template>

          </el-table-column>
        </el-table>


      </el-dialog>

    </div>

    <div>
      <el-dialog :modal="true" :title=title :close-on-click-modal="true" :close-on-press-escape="false"
        :visible.sync="markingVisible" width="40%" :before-close="closeLoading">
        <el-table :data="sampleTableData" style="width: 100%">
          <el-table-column prop="data" :label="columnName">
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>



  </div>
</template>

<script>
import {
  listApi,
  getApi,
  delApi,
  addApi,
  updateApi,
  importDataByUrlI,
  apiPlatformI,
  levelApi,
  modifyRemarkI

} from "@/api/system/api";
import { listAllProject } from "@/api/system/project";
import { getToken } from "@/utils/auth";
import callRecord from "@/components/callRecord/index";
import { fieldDataI } from "@/api/system/protectTableField";
export default {
  name: "Api",
  components: {
    callRecord: callRecord,
  },
  data () {
    return {
      columnName: "",
      markingVisible: false,
      sampleTableData: [],
      sortScore: (a, b) => {
        return a.score - b.score;
      },
      endTime: '',
      startTime: '',
      range: [],
      pickerOptions: {
        disabledDate (time) {
          // 禁用以后的时间
          return time.getTime() > Date.now() - 8.64e6;
        },

        shortcuts: [
          {
            text: "最近一周",
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      addTime: '',
      newRember: '',
      remberApiId: '',
      openModifiedRemarksvisible: false,
      associatedVisible: false,
      tableData: [],
      apiImpList: "",
      callRecordLoading: false,
      selectImputItem: {
      },
      //  timeHorizon: [],
      firstShow: true,
      selectRow: {},
      drawer: false,
      urlImp: false,
      fileImp: true,
      fullscreenLoading: false,
      radio: "file",
      apiUrl: false,
      port: true,
      urlInput: "",
      projectList: [{ name: "全部", id: 0 }],
      formProjectList: null,
      fileList: [],
      selectProject: "",
      selectProjectId: 0,
      importType: '',
      //  impTable: [{label:"swagger",id: 1},{label:"postman",id: 2},{label:"tools",id: 3},{label:"apifox",id: 4}],
      formProject: "",
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
      // api信息表格数据
      apiList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      importOpen: false,
      // 导入参数
      upload: {
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/api/importData",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        method: null,
        patterns: null,
        className: null,
        name: null,
        descriptor: null,
        projectId: 0,
        startTime: null,
        endTime: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        formProject: [
          { required: true, message: "请输入项目名称", trigger: "change" },
        ],
        urlInput: [
          { required: true, message: "请输入api地址", trigger: "change" },
          {
            pattern: /(http|https):\/\/([\w.]+\/?)\S*/,
            message: "请输入以http或者https的网址.例:http://www.xxx.com",
          },
        ],
        patterns: [
          { required: true, message: "请输入路由", trigger: "change" },
        ],
        projectName: [
          { required: true, message: "请输入项目名称", trigger: "change" },
        ],
      },
    };
  },
  watch: {
    $route (to, from) {
      if (to.path == "/systemInfo/api") {
        if (this.$route.query.id) {
          this.selectProjectId = this.$route.query.id;
          this.selectProject = this.$route.query.name;
        }
        this.queryParams.pageNum = 1;
        this.getList();
      }
    },

    $route (to, from) {
      if (to.path == "/systemInfo/api") {
        if (this.$route.query.id) {
          this.selectProjectId = this.$route.query.id;
          this.selectProject = this.$route.query.url;
        }
        this.queryParams.pageNum = 1;
        this.getList();
      }
    },
  },
  created () {
    this.selectProject = "全部";
    if (this.$route.query.id) {
      this.selectProjectId = this.$route.query.id;
      this.selectProject = this.$route.query.name;
    }
    if (this.$route.query.id) {
      this.selectProjectId = this.$route.query.id;
      listAllProject().then((resp) => {
        this.projectList = resp.data;
        this.projectList.unshift({ name: "全部", id: 0 })
        if (this.formProjectList == null) {
          this.formProjectList = JSON.parse(JSON.stringify(this.projectList))
        }
        for (let item = 0; item < this.projectList.length; item++) {
          if (this.projectList[item].id == this.$route.query.id) {
            this.selectProject = this.projectList[item].name
          }
        }
      });
      this.queryParams.patterns = this.$route.query.url;
    } else {
      this.getProjectList();
    }
    this.getList();
    this.apiPlatform();
  },
  methods: {
    closeLoading () {
      this.markingVisible = false
    },
    // 示例值
    sampleValue (row) {
      this.sampleTableData = []
      let data = {
        fieldId: row.id
      }
      fieldDataI(data).then((res => {

        this.columnName = res.data.columnName
        let valueList = JSON.parse(res.data.data)
        for (let i in valueList) {
          if (valueList[i]) {
            this.sampleTableData.push({ "data": valueList[i] })
          }
        }
        this.title = row.fieldName + " 示例值";
        this.markingVisible = true
      }))
    },
    handleClose () {
      this.$refs.callRecord.detailsVisible = false
    },
    handleSortChange (column) {
      switch (column.order) {
        case "ascending":
          this.queryParams.orderDir = "asc";
          break;
        case "descending":
          this.queryParams.orderDir = "desc";
          break;
        default:
          this.queryParams.orderDir = "desc";
      }
      this.queryParams.orderColumn = column.prop;
      this.getList();
    },
    handleDateRangeChange (val) {
      this.startTime = this.timeFormat(val[0])
      this.endTime = this.timeFormat(val[1])
      // 在这里根据选择的时间范围进行筛选
    },
    revampRember () {
      let data = {
        apiId: this.form.apiId,
        remark: this.form.remark
      }
      modifyRemarkI(data).then((res => {
        if (res.code == 200) {
          this.$message({
            message: res.msg,
            type: 'success'
          });
          this.getList()
          this.openModifiedRemarksvisible = false
        } else {
          this.$message.error(res.msg);
          this.openModifiedRemarksvisible = false
        }
      }))
    },
    //修改备注
    modifyRemarks (row) {
      this.form = { 'remark': row.remark, "apiId": row.id }
      this.openModifiedRemarksvisible = true
    },
    // 关联字段
    associatedField (row) {
      this.title = row.patterns + " 关联字段";
      this.fullscreenLoading = true
      let data = {
        apiId: row.id,
      }
      levelApi(data).then((res => {
        this.tableData = res.data
        this.associatedVisible = true
        this.fullscreenLoading = false
      }))
    },
    submitUpload () {
      // debugger
      if (this.radio == "file") {
        this.$refs.upload.submit();
        // this.fullscreenLoading = true;
        this.form.formProject = "";
        this.form.urlInput = "";
        this.radio = "file";
        this.port = true;
        this.apiUrl = false;
        this.fileImp = true;
        this.urlImp = false;
        // this.importOpen = false;
        // this.fullscreenLoading = true;
        // this.apiPlatform();
        // this.selectImputItem = this.apiImpList[0]
        // this.fullscreenLoading = false;
      } else {
        this.fullscreenLoading = true;
        this.importOpen = false;
        let data = {
          url: this.form.urlInput,
          type: "apifox",
          projectId: this.form.projectId,
        };
        importDataByUrlI(data)
          .then((res) => {
            this.$alert(res.msg);
            // this.$alert(res.msg);
            this.urlImp = false;
            this.fileImp = true;
            this.form.formProject = "";
            this.form.urlInput = "";
            this.apiPlatform();
            // this.radio = "file";
            // this.port = true;
            // this.apiUrl = false;
            this.fullscreenLoading = false;
          })
          .catch((e) => {
            this.urlImp = false;
            this.fileImp = true;
            this.form.formProject = "";
            this.form.urlInput = "";
            this.apiPlatform();
            // this.radio = "file";
            // this.port = true;
            // this.apiUrl = false;
            this.fullscreenLoading = false;
          });
      }
    },
    apiPlatform () {
      apiPlatformI().then((res => {
        this.apiImpList = res.data
        this.importType = this.apiImpList[0].platformName
        this.selectImputItem = this.apiImpList[0]
        if (this.selectImputItem.fileInput) {
          this.radio = 'file'
        } else if (this.selectImputItem.urlInput) {
          this.radio = 'apifoxUrl'
        }
      }))
    },
    importCancel () {
      this.importOpen = false;
      this.form.formProject = "";
      this.form.urlInput = "";
      this.apiPlatform();
    },

    handlerMonitor (row) {
      this.selectRow = []
      this.drawer = true;
      this.selectRow = row;
      if (this.firstShow) {
        setTimeout(() => {
          this.$refs.callRecord.loadAllData(this.selectRow);
        }, 1);
        this.firstShow = false;
      } else {
        this.$refs.callRecord.loadAllData(this.selectRow);
      }
      // this.$refs.callRecord;
    },
    impType (val) {
      this.selectImputItem = this.apiImpListByName(val)
      if (this.selectImputItem.fileInput) {
        this.radio = 'file'
      } else if (this.selectImputItem.urlInput) {
        this.radio = 'apifoxUrl'
      }
    },
    apiImpListByName (name) {
      let item = {};
      this.apiImpList.forEach((p) => {
        if (p.platformName == name) {
          item = p;
        }
      });
      return item;
    },
    apiRadio (value) {
      if (value == "apifoxUrl") {
        this.port = false;
        this.apiUrl = true;
      } else {
        this.port = true;
        this.apiUrl = false;
      }
    },
    projectNameChange (e) {
      this.form.projectName = this.findProjectById(e);
      this.formProject = this.findProjectById(e);
      this.form.projectId = e;
    },

    projectChange (value) {
      this.selectProjectId = value;
    },

    findProjectById (id) {
      let name = "";
      this.formProjectList.forEach((p) => {
        if (p.id == id) {
          name = p.name;
        }
      });
      return name;
    },
    timeFormat (value) {
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d + " " + h + ":" + m;
    },

    /** 查询api信息列表 */
    getList () {
      this.loading = true;
      this.queryParams.projectId = this.selectProjectId;
      this.queryParams.startTime = this.startTime
      this.queryParams.endTime = this.endTime
      listApi(this.queryParams).then((response) => {
        this.apiList = response.rows;
        for (let i = 0; i < this.apiList.length; i++) {
          this.addTime = this.apiList[i].addTime
        }
        this.total = response.total;
        this.loading = false;
      });
    },
    getProjectList (key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        name: key,
      };
      listAllProject(params).then((resp) => {
        this.projectList = resp.data;
        this.projectList.unshift({ name: "全部", id: 0 })
        if (this.formProjectList == null) {
          this.formProjectList = JSON.parse(JSON.stringify(this.projectList))
        }
      });
    },
    getFormProjectList (key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        name: key,
      };
      listAllProject(params).then((resp) => {
        this.formProjectList = resp.data;
      });
    },
    queryProjectList (query) {

      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.getProjectList(query);
        }, 200);
      } else {
        this.getProjectList();
      }
    },
    queryFormProjectList (query) {
      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.getFormProjectList(query);
        }, 200);
      } else {
        this.getFormProjectList();
      }
    },
    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        id: null,
        method: null,
        selectProject: null,
        patterns: null,
        className: null,
        name: null,
        descriptor: null,
        remark: null,
        apiCount: null,
        formProject: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.form.projectId = 0;
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.range = []
      this.startTime = ''
      this.endTime = ''
      this.selectProject = "全部";
      this.selectProjectId = 0;
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "添加API信息";
      this.formProjectList = [];
      this.formProject = "";
      this.getFormProjectList();
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const id = row.id || this.ids;
      getApi(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改API信息";
        let project = {
          name: row.projectName,
          id: row.projectId,
        };

        this.formProject = row.projectId;
        this.form.projectName = this.findProjectById(row.projectId);
        this.getFormProjectList();
      });
    },
    handleImport () {
      this.reset();
      // this.importType = "swagger";
      this.importOpen = true;
      this.formProjectList = [];
      this.formProject = "";
      this.getFormProjectList();
      this.apiPlatform();
    },
    // 文件上传成功处理
    handleFileSuccess (response, file, fileList) {
      this.importOpen = false;
      this.$refs.upload.clearFiles();
      this.$alert(
        "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
        response.msg +
        "</div>",
        "导入结果",
        { dangerouslyUseHTMLString: true }
      );

      this.getList();
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate((valid) => {
        this.loading = true;
        if (valid) {
          if (this.form.id != null) {
            // this.form.projectId = this.projectId
            updateApi(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.loading = false;
            });
          } else {
            // this.form.projectId = this.projectId
            addApi(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              this.loading = false;
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除API信息编号为"' + ids + '"的数据项？')
        .then(function () {
          return delApi(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download(
        "system/api/export",
        {
          ...this.queryParams,
        },
        `api_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
<style scoped>
/* .seek {
  display: block;
} */

/* .sourceClass {
  margin: 5px;
  height: 30px;
  line-height: 30px;
  color: #1890ff;
  background-color: #e8f4ff;
  /* border-color: #d1e9ff; */
/* border: 1px solid #d1e9ff;
  padding: 5px;
  border-radius: 5px;
  box-shadow: -2px 2px 5px 0px #e5f3ff; */




/* } */

.close_t {
  position: absolute;
  right: 60px;
  top: 25px;
  font-size: 20px;
  border: 0;
  background-color: #fff;
  color: #d6d7da;
}

.apiDiv {
  position: relative;
  display: flex;
  width: 100%;
  height: 184px;
  margin-bottom: 27px;
  /* background-color: #df0a0a; */
}

.apiDiv /deep/.el-input__inner {
  display: flex;
  width: 223px !important;
}

.apiAddress {
  /* float: left; */
  width: 90px;
  padding-left: 20px;
  font-weight: 700;
  padding-top: 5px;
}

/* .apiDiv /deep/.el-input {
  width: 44%;
  height: 20px;
} */
.upload-demo {
  text-align: center;
}

.drawerdiv /deep/ .el-drawer {
  width: 60% !important;
}

.apiHead {
  background-color: #fff;
  padding: 24px;
  /* margin-top: 10px; */
}

/* .app-container {
  background: #f0f2f5;
} */

.app-container /deep/ .el-form-item {
  /* width: 500px; */
  /* padding-left: 150px; */
}

.importCla /deep/ .el-drawer {
  /* margin-top:221px !important;
  height: 508px; */
  width: 800px !important;
  /* background-color: #EFF1F4; */
  box-shadow: -6px 3px 21px 0px rgba(0, 0, 0, 0.13);
  /* position: relative; */
}

.importCla /deep/ .el-drawer__header {
  display: none;
}

.importCla /deep/ .el-radio {
  width: 138px;
  margin-bottom: 20px;
}

.importCla /deep/ .el-radio-group {
  padding-top: 11px;
}

.importCla /deep/ .upload-demo {
  margin: 0 !important;
}

.flex-col /deep/ .el-form-item {
  margin-bottom: 0;
}

.importCla /deep/ .el-upload-dragger {
  margin-top: 10px;
  width: 602px;
  height: 349px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.15);
}


.text_62 {
  /* width: 64px; */
  height: 24px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
  line-height: 24px;
  padding: 24px;
  background-color: #fff;
}

.text-wrapper {
  background-color: #fff;
  height: 210px;
  padding: 20px 0 0 45px;
}

/* .importCla /deep/ .el-upload-dragger{
  margin-top:0 !important;
  position: absolute;
  bottom: 20px;
  transform: translateY(-37%) translateX(-50%);
  
}

.importCla /deep/ .el-dialog__footer{
  position: absolute;
  bottom: 10px;
  right:37px;

} */
.text_128 {
  width: 275px;
  height: 22px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  font-family: PingFangSC-Regular;
  font-weight: NaN;
  text-align: center;
  white-space: nowrap;
  line-height: 22px;
  margin-top: 4px;
}

.flex-col {
  padding: 40px;
  background-color: #fff;
  height: 659px;
  margin-top: 20px;
  position: relative;
}

.flex-col /deep/ .dialog-footer {
  position: absolute;
  bottom: 49px;
  right: 37px;
}

.filePic {
  width: 64px;
  height: 64px;
  margin-top: 94px;
}

.addMsg /deep/ .el-dialog:not(.is-fullscreen) {
  margin-top: 15% !important;
}

.addMsg /deep/ .el-dialog__body {
  padding-bottom: 0;

}

.sourceClass {
  margin: 5px;
  display: inline-block;
  height: 30px;
  line-height: 28px;
  color: #1890ff;
  background-color: #e8f4ff;
  /* border-color: #d1e9ff; */
  border: 1px solid #d1e9ff;
  padding: 0 5px 0 5px;
  border-radius: 5px;
  box-shadow: -2px 2px 5px 0px #e5f3ff;
}

.addMsg /deep/ .el-dialog__footer {
  padding-bottom: 32px;

}

.associatedTxt /deep/ .el-table::before {
  background-color: transparent;
}
</style>
