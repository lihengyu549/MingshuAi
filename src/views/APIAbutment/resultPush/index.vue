<template>
  <div class="app-container" v-loading="mainLoading">
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small" :inline="true"
      label-width="auto">
      <el-form-item label="目标名称" prop="taskName">
        <el-input v-model="queryParams.taskName" @input="inputSearch" placeholder="请输入数据源名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="推送类型" prop="pushType">
        <el-select clearable v-model="queryParams.pushType" @change="inputSearch" placeholder="请选择数据库类型">
          <el-option v-for="item in pushList" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
      </el-form-item>
      <el-form-item class="searchBtn" label-width="0">
        <!-- <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button> -->
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="medium" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-close" size="medium" @click="deleteFn">删除</el-button>
      </el-col>
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>
    <el-table v-loading="loading" height="700px" class="tableBox" :data="proxysList"
      @selection-change="handleSelectionChange" ref="tableRef">
      <template slot="empty">
        <el-empty description="暂无数据"></el-empty>
      </template>
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="任务名称" align="center" prop="taskName" width="150" show-overflow-tooltip />
      <el-table-column label="对接厂商" align="center" prop="providerName" width="150" show-overflow-tooltip />
      <el-table-column label="推送类型" align="center" prop="pushTypeName" width="150" show-overflow-tooltip />
      <el-table-column label="发布数据源名称" align="center" prop="sourceName" width="250" show-overflow-tooltip />
      <el-table-column label="分类分级标准" align="center" prop="standardName" show-overflow-tooltip />
      <el-table-column label="推送状态" align="center" prop="pushStatusName" width="150" show-overflow-tooltip />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="250" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleEcelFn(scope.row)">编辑</el-button>
          <el-button size="mini" type="text" @click="scanStateClickFn(scope.row)">推送</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <el-dialog :title="title" class="addMsg" v-loading="dialogLoading" :visible.sync="dialogDataShow" append-to-body
      :close-on-click-modal="true">
      <el-form class="dialogForm" :rules="dialogDataRules" :model="dialogData" size="medium" ref="dialogData"
        :inline="true" label-width="110px" label-position="top">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="dialogData.taskName" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="推送类型" prop="pushType">
              <el-select clearable v-model="dialogData.pushType" placeholder="请选择">
                <el-option v-for="item in pushList" :key="item.dictValue" :label="item.dictLabel"
                  :value="item.dictValue">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="对接厂商" prop="provider">
              <el-select clearable v-model="dialogData.provider" placeholder="请选择">
                <el-option v-for="item in providerList" :key="item.dictValue" :label="item.dictLabel"
                  :value="item.dictValue">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="主机" prop="host">
              <el-input v-model="dialogData.host" placeholder="请输入主机"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端口" prop="port">
              <el-input v-model="dialogData.port" placeholder="请输入端口"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="账号" prop="userName">
              <el-input v-model="dialogData.userName" placeholder="请输入账号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="passWord">
              <el-input v-model="dialogData.passWord" show-password placeholder="请输入密码"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="分类分级标准" prop="standardId">
          <el-select clearable v-model="dialogData.standardId" placeholder="请选择">
            <el-option v-for="item in standardList" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推送内容" prop="pushBodyList">
          <el-input readonly placeholder="请选择推送内容">
          </el-input>
          <el-tag type="info" style="position: absolute; top: 3px;left: 2px; background-color: #e5e5e5;"
            @click="pushBodyClickFn">已选{{ dialogData.pushBodyList && dialogData.pushBodyList.length
              ? dialogData.pushBodyList.length : 0 }}个子类</el-tag>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitFormFn">确 定</el-button>
        <el-button @click="importcancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="推送内容" :visible.sync="contentShow" width="850px">
      <Result v-if="contentShow" ref="ResultSon" :treeData="categoryList" :checkList="dialogData.pushBodyList" />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="pushBodySumbit">确 定</el-button>
        <el-button @click="pushBodycancel">取 消</el-button>
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
} from "@/api/APIAbutment";
import { treeListI } from "@/api/system/protectCategory";
import Result from './components/result.vue'
import {
  listByDataType
} from "@/api/dictData";
import d from "highlight.js/lib/languages/d";
export default {
  name: "resultPush",
  components: { Result },
  data() {
    return {
      pushList: [
        { label: "关键字字典", value: "1" },
        { label: "正则表达式", value: "2" }],

      pushList: [
        { label: "关键字字典", value: "1" },
        { label: "正则表达式", value: "2" }],
      // 遮罩层
      loading: false,
      contentShow: false,
      mainLoading: false,
      dialogLoading: false,
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
      dialogDataShow: false,
      // 查询参数
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
        taskName: '',//任务名称
        pushType: '',//推送类型（字典表维护）
        provider: '',//对接厂商（字典表维护）
        pushVersion: '',//对接版本（字段表维护）
        host: '',//主机
        port: '',//端口
        id: '',
        userName: '',//账号
        passWord: '',//密码
        standardId: '',//行业标准ID
        pushBodyList: [],//推送内容
        pushVersion: '',
      },
      debounceTimeout: null,
      // 表单校验
      dialogDataRules: {
        taskName: [
          {
            required: true, message: "请输入任务名称", trigger: "blur"
          }
        ],
        pushType: [
          {
            required: true, message: "请选择推送类型", trigger: "blur"
          }
        ],
        provider: [
          {
            required: true, message: "请选择对接厂商", trigger: "blur"
          }
        ],
        host: [
          { required: true, message: "请输入主机", trigger: "blur" },
        ],
        port: [
          { required: true, message: "请输入端口", trigger: "blur" },
        ],
        userName: [
          { required: true, message: "请输入账号", trigger: "blur" },
        ],
        passWord: [
          { required: true, message: "请输入密码", trigger: "blur" },
        ],
        standardId: [
          { required: true, message: "请选择分类分级标准", trigger: "blur" },
        ],
        pushBodyList: [
          { required: true, message: "请选择推送内容", trigger: "blur" },
        ],
      },
      providerList: [],
      standardList: [],
      categoryList: [],
    };
  },
  computed: {
  },
  created() {
    // 分类分级标准列表
    this.getStandardListFn()
    // 字典数据
    this.getDictDataFn()
  },
  mounted() {
    this.getList();
  },
  methods: {
    getProtectCategory() {
      this.treeLoading = true
      let data = {
        parentId: this.dialogData.standardId,
        needSub: 1
      };
      treeListI(data).then((resp) => {
        this.categoryList = this.handleTree(resp.data, "id")
        // this.categoryList = resp.data
      });
    },
    getDictDataFn() {
      listByDataType({ type: 'sys_provider_type' }).then(res => {
        this.providerList = res.data;// 此字典只给新增子类的建议防护措施用
      })
      listByDataType({ type: 'sys_push_type' }).then(res => {
        this.pushList = res.data;// 此字典只给新增子类的建议防护措施用
      })
    },
    getStandardListFn() {
      getStandardList().then(res => {
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
      getResultPushList(this.queryParams).then(res => {
        this.proxysList = res.data.rows;
        this.total = res.data.total;
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
      this.resetAddData()
      this.dialogDataShow = true;
      this.title = "新增";
    },
    pushBodySumbit() {
      this.dialogData.pushBodyList = this.$refs.ResultSon.lastChildList.map(item => {
        return item.id
      })
      this.contentShow = false
    },
    /** 提交按钮 */
    async submitFormFn() {
      this.$refs["dialogData"].validate(async valid => {
        if (valid) {
          let data = {
            ...this.dialogData,
            pushBody: this.dialogData.pushBodyList.join()
          }
          delete data.pushBodyList
          if (this.dialogData.id) {
            updateResultPush(data).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.dialogDataShow = false;
              this.getList();
            });
          } else {
            addResultPush(data).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.dialogDataShow = false;
              this.getList();
            });
          }
        }
      });
    },
    handleEcelFn(row) {
      this.editIsFlag = false
      this.dialogDataShow = true
      this.dialogData = JSON.parse(JSON.stringify(row))
      this.dialogData.pushBodyList = row.pushBody.split(',')
      this.title = '编辑'
    },
    deleteFn() {
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(`确定删除所选中的项吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let idsParams = ids
          deleteResultPush({ ids, }).then(res => {
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
    resetAddData() {
      this.dialogData = {
        taskName: '',//任务名称
        pushType: '',//推送类型（字典表维护）
        provider: '',//对接厂商（字典表维护）
        pushVersion: '',//对接版本（字段表维护）
        host: '',//主机
        port: '',//端口
        id: '',
        userName: '',//账号
        passWord: '',//密码
        standardId: '',//行业标准ID
        pushBodyList: '',//推送内容
        pushVersion: '',
      }
    },
    scanStateClickFn(row) {
      this.$confirm(`确定推送吗`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 接口
        pushResult({ id: row.id }).then(res => {
          if (res.code == 200) {
            this.$message.success('推送成功')
            this.getList()
          }
        })
      }).catch(() => {
      });
    },
    async pushBodyClickFn() {
      if (!this.dialogData.standardId) {
        this.$message({ message: '请选择分类分级标准后点击', type: 'warning' })
        return
      }
      await this.getProtectCategory()
      this.contentShow = true
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
  /* margin-left: auto; */
  height: 100%;
}

.tableBox {
  height: calc(100% - 36px - 50px -51px);
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
</style>
