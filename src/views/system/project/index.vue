<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input v-model="filterName" placeholder="请输入行业分类" clearable size="small" prefix-icon="el-icon-search"
            style="margin-bottom: 20px" class="serachInput" />
          <el-button type="primary" size="mini" @click="importCli">框架导入</el-button>
        </div>
        <div class="head-container">
          <el-tree :data="categoryList" :props="defaultProps" :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" node-key="id" highlight-current @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
          label-width="90px">
          <el-form-item label="子类名称" prop="fieldName">
            <el-input v-model="queryParams.fieldName" placeholder="请输入子类名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="来源" prop="project">
            <el-select v-model="selectProjectId" placeholder="请选择项目名称" :loading="loading">
              <el-option v-for="item in sourceList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分级" prop="securityLevel">
            <el-select v-model="queryParams.securityLevel" placeholder="全部">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
          <div style="margin: 20px 0 20px 25px;">
            <el-button type="primary" icon="el-icon-plus" size="medium" @click="handleQuery">新增</el-button>
            <el-button type="primary" icon="el-icon-edit" size="medium" @click="handleQuery">编辑</el-button>
            <el-button type="info" icon="el-icon-delete" size="medium" @click="handleQuery">删除</el-button>
            <el-button type="info" icon="el-icon-warning" size="medium" @click="handleQuery">禁用</el-button>
          </div>
        </el-form>
        <el-table v-loading="loading" :data="protectTableFieldList">
          <!-- <el-table-column width="55" align="center" /> -->
          <el-table-column label="子类名称" align="center" prop="fieldName" />
          <el-table-column label="所属分级" align="center" prop="securityLevelName" />
          <el-table-column label="来源" align="center" prop="selectProjectId">
            <template slot-scope="scope">
              <span>
                {{ scope.row.selectProjectId == 1 ? '内置' : '自定义' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="state">
            <template slot-scope="scope">
              <span>
                {{ scope.row.state ? '启用' : '禁用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" align="center" prop="updataTime" />
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>
    <el-dialog title="导入框架" :visible.sync="importShow" width="500px" append-to-body :close-on-click-modal="false">
      <div style="padding: 20px; display: flex; align-items: center;">
        <span style="width:30%;">导入模板</span>
        <el-input v-model="importFile" disabled placeholder="支持EXCEL格式文件导入（.xls, .xlsx)" style="margin-right: 10px;"></el-input>
        <el-upload class="upload-demo" action="https://jsonplaceholder.typicode.com/posts/"
          :limit="1"
          :file-list="fileList" :show-file-list="false">
          <el-button size="mini" type="primary">选择文件</el-button>
        </el-upload>
        </div>
        <el-button style="margin-left: 100px;" size="small" type="text"  icon="el-icon-download">样例下载</el-button>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="importcancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 添加或修改数据库字段名对话框 -->
    <el-dialog class="addDialog" :title="title" :visible.sync="open" width="400px" append-to-body
      :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="安全级别" prop="securityLevel">
          <!-- <el-input v-model="form.securityLevel" placeholder="请输入安全级别" /> -->
          <el-select v-model="form.securityLevel" placeholder="请选择">
            <el-option v-for="item in securityOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="打标信息" prop="securityRule">
          <el-select multiple filterable remote clearable reserve-keyword v-model="securityRuleList" placeholder="请选择"
            :remote-method="securityList">
            <el-option v-for="item in securityRuleOptions" :key="item.id" :label="item.sensitiveName"
              :value="item.sensitiveName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="行业分类" prop="categoryId">
          <treeselect style="width: 85%;" v-model="form.categoryId" :options="categoryListEdit" :show-count="true"
            placeholder="请选择行业分类" />
        </el-form-item>
        <el-form-item label="备注" prop="fieldRemark">
          <el-input v-model="form.fieldRemark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  listProtectTableField,
  getProtectTableField,
  delProtectTableField,
  addProtectTableField,
  updateProtectTableField,
  getProtectCategoryI,
  getProtectSensitiveRuleI,
  importI,
  testI,
  fieldDataI,
  queryApisI
} from "@/api/system/protectTableField";
import { addProtectSensitiveRule } from "@/api/system/protectSensitiveRule";
import { listAllProject } from "@/api/system/project";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

import { treeListI } from "@/api/system/protectCategory"
import { listTableByProject, getDatabaseListI } from "@/api/system/protectTableField";
export default {
  name: "ProtectTableField",
  components: { Treeselect },

  data() {
    return {
      importFile:'', // 导入魔板文件名
      fileList:[],//导入模板的文件数据
      relevanceTable: [],
      associatedVisible: false,
      addSensitiveName: '',
      addFormRule: {
        sensitiveName: '',
        maskRule: '',
        enableStatus: true
      },
      remberNameRule: {},
      fieldNameRule: {},
      // 是否显示弹出层
      openRule: false,
      filterName: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      showSucType: 0,
      Loading: false,
      columnName: "",
      tableData: [],
      markingVisible: false,
      fullscreenLoading: false,
      dataType: "",
      // projectNameId:0,
      selectProjectId: 0,
      formProjectList: null,
      sourceList: [
        {
          value: 0,
          label: '全部'
        },
        {
          value: 1,
          label: '内置'
        },
        {
          value: 2,
          label: '自定义'
        },
      ],
      dialogVisible: false,
      securityRuleOptions: [],
      ruleOptions: [
        {
          value: 1,
          label: "1"
        }, {
          value: 2,
          label: "2"
        }, {
          value: 3,
          label: "3"
        }, {
          value: 4,
          label: "4"
        }, {
          value: 5,
          label: "5"
        }],
      securityOptions: [
        {
          value: 1,
          label: "1"
        }, {
          value: 2,
          label: "2"
        }, {
          value: 3,
          label: "3"
        }, {
          value: 4,
          label: "4"
        }, {
          value: 5,
          label: "5"
        }],

      options: [
        {
          value: 0,
          label: "全部"
        }, {
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
        }],
      safetyValue: '',
      safetyValueId: 0,
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
      // 数据库字段名表格数据
      protectTableFieldList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      securityRuleList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryId: '',//左侧树id
        fieldName: '',//子类名称
        selectProjectId: 0,//来源
        securityLevel: 0,//安全级别
      },
      selectTable: "",
      databaseName: '',
      selectDatabaseId: 0,
      selectTableId: 0,
      categoryTable: "",
      categoryTableEdit: "",
      projectNameEdit: "",
      tableList: [{ tableName: "全部", id: 0 }],
      databasetableList: [{ targetDatabase: "全部", id: 0 }],
      categoryList: [],
      categoryListEdit: null,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        sensitiveName: [
          {
            required: true, message: "规则名不能为空", trigger: "blur"
          }
        ],
        sensitiveLevel: [
          { required: true, message: "规则等级不能为空", trigger: "blur" }
        ],
        user: [
          { required: true, message: "请输入数据库用户名称", trigger: "change" },
        ],
        databaseName: [
          { required: true, message: "请输入数据库名称", trigger: "change" },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        method: [
          { required: true, message: "请输入数据库地址", trigger: "change" },
          {
            pattern:
              /(?:(?:1[0-9][0-9]\.)|(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:1[0-9][0-9])|(?:2[0-4][0-9])|(?:25[0-5])|(?:[1-9][0-9])|(?:[0-9]))/,
            message: "请输入正确的Ipv4地址。例如:Ipv4地址:192.168.0.1",
          },
        ],
        port: [
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
      importShow: false,
    };
  },
  watch: {
    filterName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.categoryTable = "";
    this.selectProject = "全部";
    this.markingNume = 0;
    this.selectTable = "全部";
    this.databaseName = "全部";
    this.getList();
    this.getProjectList();
    this.getProtectCategory()
    this.getProtectSensitiveRule()
  },
  methods: {
    importcancel(){
      this.fileList.length = 0,
      this.importFile = '',
      this.importShow = false
    },
    importCli() {
      this.importShow = true
    },
    jumpApi(url, id) {
      const routeData = this.$router.resolve({
        path: "/systemInfo/api",
        query: { id: id, url: url },
      });
      window.open(routeData.href, '_blank')
    },
    timeFormat(value) {
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
    fieldCli() {
      this.fieldNameRule.unshift('')
    },
    deletfield(i) {
      this.fieldNameRule.splice(i, 1)
    },
    deletCli(i) {
      this.remberNameRule.splice(i, 1)
    },
    remberCli() {
      if (this.remberNameRule == null) {
        this.remberNameRule = []
      }
      this.remberNameRule.unshift('')

    },
    handleAddRule(row) {
      this.reset();
      this.openRule = true
      this.fieldNameRule = new Array(row.fieldName)
      this.remberNameRule = []
      this.remberNameRule.unshift('')
      this.addFormRule.sensitiveName = row.fieldRemark
      this.addFormRule.maskRule = row.fieldRemark

    },
    filterNode(value, data) {
      if (!value) return true;
      return data.categoryName.indexOf(value) !== -1;
    },
    handleNodeClick(data) {
      this.queryParams.categoryId = data.id;
      this.handleQuery();
    },
    closeLoading() {
      this.markingVisible = false

    },
    closeDialog() {
      // this.reset()
      this.showSucType = 0

    },

    // 导入
    handleImport() {
      this.showSucType = 0
      this.projectNameEdit = null
      this.dialogVisible = true
      this.reset()
    },
    // 打标信息检索打标规则列表


    securityList(query) {
      if (query) {
        // this.loading = true;
        setTimeout(() => {
          // this.loading = false;
          this.getProtectSensitiveRule(query);
        }, 200);
      } else {
        this.getProtectSensitiveRule("");
      }

    },

    getProtectSensitiveRule(key) {
      if (key) {
        key = key.trim();
      }
      let data = {
        name: key
      };
      getProtectSensitiveRuleI(data).then((res => {
        this.securityRuleOptions = res.data

      }))
    },

    projectChangeEdit(e) {
      this.projectNameEdit = e
      this.form.projectName = e
    },


    /**
    * 打标信息检索行业分类列表
    */
    categoryChangeEdit(value) {
      this.categoryTableEdit = value;
      this.form.categoryId = value
    },
    categoryChange(value) {
      this.queryParams.categoryId = value;
    },
    categoryTableList(query) {
      if (query) {
        // this.loading = true;
        setTimeout(() => {
          // this.loading = false;
          this.getProtectCategory(query);
        }, 200);
      } else {
        this.getProtectCategory("");
      }
    },
    getProtectCategory(key) {
      if (key) {
        key = key.trim();
      }
      let data = {
        name: key
      };
      treeListI(data).then((resp) => {
        this.categoryList = resp.data;
        if (this.categoryListEdit == null) {
          let tempList = JSON.parse(JSON.stringify(this.categoryList))
          for (let item of tempList) {
            item.label = item.categoryName
          }
          this.categoryList = this.handleTree(tempList, "id")
          this.categoryListEdit = this.handleTree(tempList, "id")

        }

      });
    },
    categoryTableListEdit(query) {
      if (query) {
        // this.loading = true;
        setTimeout(() => {
          // this.loading = false;
          this.getProtectCategoryEdit(query);
        }, 200);
      } else {
        this.getProtectCategoryEdit("");
      }
    },
    getProtectCategoryEdit(key) {
      if (key) {
        key = key.trim();
      }
      let data = {
        name: key
      };
      getProtectCategoryI(data).then((resp) => {
        let tempList = resp.data
        for (let item of tempList) {
          item.label = item.categoryName
        }
        this.categoryListEdit = this.handleTree(tempList, "id")
        // this.categoryListEdit = this.handleTree(resp.data,"id")
      });
    },
    //数据库名称
    databaseList(query) {
      if (query) {
        // this.loading = true;
        setTimeout(() => {
          // this.loading = false;
          this.getDatabaseList(query)
        }, 200);
      } else {
        this.getDatabaseList("");
      }
    },

    getDatabaseList(key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        projectId: this.selectProjectId,
        databaseName: key,
      };
      getDatabaseListI(params).then((resp) => {
        this.databasetableList = resp.data;
        this.databasetableList.unshift({ targetDatabase: "全部", id: 0 })

      });

    },


    // 表名
    queryTableList(query) {
      if (query) {
        // this.loading = true;
        setTimeout(() => {
          // this.loading = false;
          this.getTableList(query);
        }, 200);
      } else {
        this.getTableList("");
      }
    },

    /** 查询数据库字段名列表 */
    getList() {
      this.loading = true;
      let res = {
        data: [
          {
            fieldName: '个人基本概况信息',//子类名称
            selectProjectId: '内置',//来源
            securityLevelName: '3级',//分级
            id: 0,
            state: true,
            updataTime: '2024-11-13 23:31',
          }
        ],
        total: 10,
      }
      this.protectTableFieldList = res.data;
      this.loading = false;
      // listProtectTableField(this.queryParams).then((response) => {
      //   this.protectTableFieldList = response.rows;
      //   this.total = response.total;
      //   this.loading = false;
      // });
    },
    databaseChange(value) {
      this.selectDatabaseId = value
      if (value == 0) {
        this.selectTable = "全部";
        this.selectTableId = ''
        this.tableList = new Array({ tableName: "全部", id: 0 })
      } else {
        this.queryTableList()
      }
    },
    projectChange(value) {
      this.selectProjectId = value;
      this.databaseName = "全部";
      this.databaseList("")

      this.tableList = new Array({ tableName: "全部", id: 0 })
      this.selectTable = "全部";
      this.selectTableId = ''
    },
    tableChange(value) {
      this.selectTableId = value;
    },
    getProjectList(key) {
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
          this.formProjectList = this.projectList;
        }
      });
    },
    getProjectListEdit(key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        name: key,
      };
      listAllProject(params).then((resp) => {
        this.formProjectListEdit = resp.data;
        // this.projectList.unshift({ name: "全部", id: 0 })
        if (this.formProjectListEdit == null) {
          this.formProjectListEdit = this.projectList;
        }
      });
    },
    getTableList(key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        databaseId: this.selectDatabaseId,
        tableName: key,
      };
      listTableByProject(params).then((resp) => {
        this.tableList = resp.data;
        this.tableList.unshift({ tableName: "全部", id: 0 })

      });
    },
    queryProjectList(query) {
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
    // 取消按钮
    cancel() {
      this.open = false;
      // this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        projectId: null,
        tableId: null,
        fieldName: null,
        fieldType: null,
        fieldRemark: null,
        addTime: null,
        securityLevel: null,
        tag: null,
        securityRule: [],
        categoryId: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();

    },
    /** 重置按钮操作 */
    resetQuery() {
      this.databaseName = "全部";
      this.categoryTable = "全部";
      this.selectTable = "全部";
      this.markingNume = 0;
      this.selectProjectId = 0;
      this.queryParams.categoryId = undefined
      this.$refs.tree.setCurrentKey(null);
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加数据库字段名";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.securityRuleList = JSON.parse(row.securityRule)
      this.reset();
      const id = row.id || this.ids;
      this.categoryTableEdit = row.categoryId
      getProtectTableField(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改" + row.fieldName + "打标信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.form.securityRule = JSON.stringify(this.securityRuleList)
          if (this.form.id != null) {
            updateProtectTableField(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProtectTableField(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });

    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除数据库字段名编号为"' + ids + '"的数据项？')
        .then(function () {
          return delProtectTableField(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "system/protectTableField/export",
        {
          ...this.queryParams,
        },
        `protectTableField_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>

<style scoped>
.el-popup-parent--hidden /deep/ .el-loading-mask {
  background: "rgba(0, 0, 0, 0.7)" !important;
}

.addDialog /deep/ .el-input--medium {
  width: 237px;
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

.success {
  color: #67c23a;
}

.error {
  color: #f56c6c;
}

.impShow {
  text-align: center;
}

.el-tree-node /deep/ .el-tree-node {
  display: none;
}

.addDialog /deep/ .el-select {
  /* width:520px; */
  width: 78%;
}

.addDialog /deep/ .vue-treeselect__control {
  /* width:520px; */
  width: 111%;
  margin: 0 !important;
}

.addDialog /deep/ .selectClass {
  /* width: 520px; */
  width: 80%;
}

.addDialog /deep/ .el-input--medium {
  /* width: 520px; */
  width: 80%;
  /* margin-right: 0 !important; */

}

.addDialog /deep/ .el-form-item__label {
  width: 110px !important;
}

.addDialog /deep/ .el-form-item__content {
  margin-left: 110px !important;
}

.fielRul {
  margin-left: -10px;
}

.fielRul ::-webkit-scrollbar {
  width: 10px;
}

.fielRul ::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 5px;
}

.fielRul ::-webkit-scrollbar-track {
  background-color: #f2f2f2;
}

.serclass /deep/ .el-input {
  width: 64% !important;
}

.btn {
  border: 0;
  color: #409eff;
  text-align: right;
  padding-left: 20px;


}

.btn1 {
  color: #409eff;
  text-align: right;
  margin-left: 90%;
}

.fieldName {
  height: 150px !important;
  overflow: auto !important;

}

.div1 {
  position: relative;
  /* width: 581px; */
  width: 80%;


}

.spRul {
  color: #ff4949;
  width: 5px;
  height: 5px;
  /* margin-right: 5px; */
  float: left;
  margin-top: 10px;
  margin-left: 5px;
  /* position: absolute;
  left: -14px;
  z-index: 999;
  top: 10px; */


}

.associatedTxt /deep/ .el-table::before {
  background-color: transparent;
}

.btns {
  font-size: 14px;
}

.serachInput {
  width: 60%;
  margin-right: 10px;

  input {
    height: 28px !important;
    line-height: 28px !important;
  }
}
</style>
