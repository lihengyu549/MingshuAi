<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-select v-model="queryParams.categoryId" class="serachInput" @change="treeOptionsSelectChange"
            placeholder="全部" style="margin-bottom: 20px">
            <el-option v-for="item in treeOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-button type="primary" size="mini" @click="importCli">框架导入</el-button>
        </div>
        <div class="head-container">
          <el-tree :data="categoryList" :props="defaultProps" :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" node-key="id" highlight-current @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryParams" size="small" :inline="true" v-show="showSearch"
          label-width="90px">
          <el-form-item label="子类名称" prop="fieldName">
            <el-input v-model="queryParams.fieldName" placeholder="请输入子类名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="来源" prop="selectProjectId">
            <el-select v-model="queryParams.selectProjectId" placeholder="请选择项目名称" :loading="loading">
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
            <el-button type="primary" icon="el-icon-plus" size="medium" @click="addFn">新增</el-button>
            <el-button type="primary" icon="el-icon-refresh" size="medium" @click="enabledFn">启用</el-button>
            <el-button type="primary" icon="el-icon-delete" size="medium" @click="delectFn">删除</el-button>
            <el-button type="primary" icon="el-icon-warning" size="medium" @click="disabledFn">禁用</el-button>
          </div>
        </el-form>
        <el-table v-loading="loading" :data="protectTableFieldList" ref="tableRef">
          <!-- <el-table-column width="55" align="center" /> -->
          <el-table-column type="selection" width="60" align="center">
          </el-table-column>
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
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="medium" @click="editFn(scope.row)">编辑</el-button>
              <el-button type="text" size="medium" @click="lookFn(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>
    <el-dialog title="导入框架" :visible.sync="importData.importShow" width="700px" append-to-body
      :close-on-click-modal="false">
      <el-form class="importForm" :model="importData" size="medium" ref="importData" :inline="true" label-width="120px">
        <el-form-item label="框架名称" prop="cliName">
          <el-input v-model="importData.cliName" placeholder="请输入框架名称"></el-input>
        </el-form-item>
        <el-form-item label="导入框架" prop="importFile">
          <el-input v-model="importData.importFile" readonly placeholder="支持EXCEL格式文件导入（.xls, .xlsx)"></el-input>
        </el-form-item>
        <el-form-item class="uploadClass">
          <el-upload class="upload-demo" action="https://jsonplaceholder.typicode.com/posts/" :limit="1"
            :file-list="importData.fileList" accept=".xls,.xlsx" :show-file-list="false"
            :before-upload="importFileBeforeUpload">
            <el-button size="mini" type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <el-button style="margin-left: 100px;" size="small" type="text" icon="el-icon-download">样例下载</el-button>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="importcancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="addOrEdit.title" :visible.sync="addOrEdit.show" width="700px" append-to-body
      :close-on-click-modal="false">
      <el-form :model="addOrEdit" size="medium" :rules="addOrEditRules" ref="addOrEdit" label-width="120px" style="padding-right: 60px;">
        <el-form-item label="子类名称" prop="aaa1">
          <el-input v-model="addOrEdit.aaa1" placeholder="请输入子类名称"></el-input>
        </el-form-item>
        <el-form-item class="addSelectClass" label="所属分类" prop="categoryId">
          <el-select ref="addSelectRef" v-model="categoryName">
            <el-option style="height: 100%; padding: 0" value="">
              <el-tree :data="categoryList" :props="defaultProps" :expand-on-click-node="false"
                :filter-node-method="filterNode" ref="tree" node-key="id" highlight-current
                @node-click="addHandleNodeClick" />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="addSelectClass" prop="securityLevel" label="所属分级">
          <el-select v-model="addOrEdit.securityLevel" placeholder="全部">
            <el-option v-for="item in addOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="addOrEdit.isedit || addOrEdit.islook" class="addSelectClass" label="AI自学习内容">
          <el-tag
            v-for="tag in tags"
            :key="tag.name" 
            class="mx-1"
            closable
            :type="tag.type"
            style="margin: 0 10px;"
          >
            {{ tag.name }}
          </el-tag>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="!addOrEdit.islook" @click="addSubmitForm">确 定</el-button>
        <el-button @click="addCancel">取 消</el-button>
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
      importData: {
        importFile: '', // 导入魔板文件名
        fileList: [],//导入模板的文件数据
        cliName: '',//框架名称
        importShow: false,
      },
      categoryName: '',
      treeData: {
        selectId: '0',
      },
      treeOptions: [
        {
          value: '0',
          label: '金融'
        },
        {
          value: '1',
          label: '行业'
        }],
      addOrEdit: {
        title: '新增',
        show: false,
        isedit:false,
        islook:false,
        categoryId: '',
        securityLevel: '',
        aaa1: '',//子类名称
        id: '',
        data:{},
      },
      tags: [
          { name: '标签一', type: 'info' },
          { name: '标签二', type: 'info' },
          { name: '标签三', type: 'info' },
          { name: '标签四', type: 'info' },
          { name: '标签五', type: 'info' }
        ],
      // 表单校验
      addOrEditRules: {
        categoryId: [
          {
            required: true, message: "请选择所属分类", trigger: "blur"
          }
        ],
        securityLevel: [
          { required: true, message: "请选择所属分级", trigger: "blur" },
        ],
        aaa1: [
          { required: true, message: "请输入子类名称", trigger: "blur" }
        ],
      },
      
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryId: '0',//左侧树id
        fieldName: '',//子类名称
        selectProjectId: 0,//来源
        securityLevel: 0,//安全级别
      },
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
      markingVisible: false,
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
      options: [
        {
          value: 0,
          label: "全部"
        },
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
      selectTable: "",
      selectDatabaseId: 0,
      selectTableId: 0,
      categoryTable: "全部",
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
    };
  },
  watch: {
    filterName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getList();
    this.getProjectList();
    this.getProtectCategory()
  },
  methods: {
    addFn() {
      this.addOrEdit.title = '新增'
      this.addOrEdit.show = true
      this.addOrEdit.islook = false
      this.addOrEdit.isedit = false
    },

    /** 新增确定方法 */
    addSubmitForm() {
      this.$refs["addOrEdit"].validate((valid) => {
        if (valid) {
          if (this.addOrEdit.id != null) {
            updateProtectTableField(this.addOrEdit).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProtectTableField(this.addOrEdit).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }else {
          return false
        }
      });

    },
    // 新增取消
    addCancel() {
      this.addOrEdit.categoryId = ''
      this.addOrEdit.securityLevel = ''
      this.addOrEdit.aaa1 = ''
      this.addOrEdit.show = false
      this.addOrEdit.islook = false
    },
    addHandleNodeClick(node) {
      this.$refs.addSelectRef.blur()
      this.addOrEdit.categoryId = node.id
      this.categoryName = node.label
    },
    editFn(row) {
      this.addOrEdit.data = row
      this.addOrEdit.show = true
      this.addOrEdit.title = '编辑'
      this.addOrEdit.isedit = true
      this.addOrEdit.islook = false
    },
    lookFn(row) {
      this.addOrEdit.data = row
      this.addOrEdit.show = true
      this.addOrEdit.title = '查看'
      this.addOrEdit.islook = true
    },
    enabledFn() {
      let data = this.$refs.tableRef.selection
      if (data && data.length > 0) {
        let ids = data.map(item => item.id)
        // 接口
      } else {
        this.$message({ message: '请选择至少一条数据', type: 'warning' })
      }
    },
    delectFn() {
      let data = this.$refs.tableRef.selection
      if (data && data.length > 0) {
        let ids = data.map(item => item.id)
        // 接口
      } else {
        this.$message({ message: '请选择至少一条数据', type: 'warning' })
      }
    },
    disabledFn() {
      let data = this.$refs.tableRef.selection
      if (data && data.length > 0) {
        let ids = data.map(item => item.id)
        // 接口
      } else {
        this.$message({ message: '请选择至少一条数据', type: 'warning' })
      }
    },
    // 左侧树下拉选change事件
    treeOptionsSelectChange(val) {
      if (val) {
        this.getProtectCategory(val)
      }
    },
    // 文件上传前钩子
    importFileBeforeUpload(val) {
      this.importData.importFile = val.name
      // 暂时禁止上传，等接口
      return false
    },
    // 导入取消
    importcancel() {
      this.fileList = [],
        this.importData.cliName = ''
      this.importData.importFile = ''
      this.importData.importShow = false
    },
    importCli() {
      this.importData.importShow = true
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
    filterNode(value, data) {
      if (!value) return true;
      return data.categoryName.indexOf(value) !== -1;
    },
    handleNodeClick(data) {
      this.queryParams.categoryId = data.id;
      this.handleQuery();
    },
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
      getDatabaseList(key) {
      if (key) {
        key = key.trim();
      }
      let params = {
        projectId: this.selectProjectId,
      };
      getDatabaseListI(params).then((resp) => {
        this.databasetableList = resp.data;
        this.databasetableList.unshift({ targetDatabase: "全部", id: 0 })

      });

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
      this.$refs.tree.setCurrentKey(null);
      this.resetForm("queryParams");
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
