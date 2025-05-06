<template>
  <div class="app-container" v-loading="loading">
    <el-form :model="queryParams" ref="queryParams" class="yuanDataClass" size="small" :inline="true"
      v-show="showSearch" label-width="auto">
      <el-form-item label="主机" prop="businessName">
        <el-input v-model="queryParams.businessName" @input="inputSearch" placeholder="请输入来源业务系统" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="数据库类型" prop="databaseTypeList">
        <el-select clearable v-model="queryParams.securityLevel" multiple @change="inputSearch" placeholder="请选择">
          <el-option v-for="item in dict.type.databaseTypeList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
      </el-form-item>
      <el-form-item>
      </el-form-item>
      <el-form-item label=" " class="searchBtn">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-aim" size="medium" @click="handleAdda">确认勾选项</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-more" size="medium" @click="handleEcelFn">确认过滤项</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="proxysList" @selection-change="handleSelectionChange" ref="tableRef">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <!-- <el-table-column label="id" align="center" prop="id" /> -->
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="字段名" align="center" prop="fieldName" show-overflow-tooltip />
      <el-table-column label="字段注释" align="center" prop="fieldRemark" show-overflow-tooltip />
      <el-table-column label="来源业务系统" align="center" prop="businessName" show-overflow-tooltip />
      <!-- <el-table-column label="数据源" align="center" prop="databaseId" show-overflow-tooltip /> -->
      <el-table-column label="所属库" align="center" prop="databaseName" show-overflow-tooltip />
      <el-table-column label="所属表" align="center" prop="tableName" show-overflow-tooltip />
      <el-table-column label="分类" align="center" min-width="250" prop="categoryName" show-overflow-tooltip />
      <el-table-column label="安全分级" align="center" prop="securityLevelName" show-overflow-tooltip />
      <el-table-column label="样本" align="center" prop="sampleData" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-tooltip placement="bottom" effect="light">
            <div slot="content">
              <el-table :data="scope.row.sampleList" height="250" border class="tableCla" style="width: 100%">
                <el-table-column type="index" label="序号" width="50" />
                <el-table-column prop="value" label="字段值" width="100" show-overflow-tooltip>
                </el-table-column>
              </el-table>
            </div>
            <el-button size="mini" type="text">查看</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="确认状态" align="center" prop="confirm">
        <template slot-scope="scope">
          <span>{{ scope.row.confirm == 0 ? '未确认' : '已确认' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="resultExdit(scope.row)">结果修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <el-dialog title="分类分级框架结果修改" v-loading="updataLoading" :visible.sync="deleteVisible" width="650px"
      style="padding: 0 20px;" append-to-body :close-on-click-modal="false">
      <el-form v-if="deleteVisible" :model="resultForm" ref="resultForm" size="small" label-width="auto">
        <el-form-item label="分类" class="addSelectClass">
          <el-select ref="resultSelectRef" v-model="resultFormNodeName">
            <el-option style="height: 100%; padding: 0" value="">
              <el-tree :data="categoryList" :props="defaultProps" :expand-on-click-node="true"
                :filter-node-method="filterNode" ref="treeSelect" node-key="id" highlight-current
                @node-click="resultHandleNodeClick" />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="安全分级" class="addSelectClass" prop="securityLevel">
          <el-select v-model="resultForm.securityLevel" placeholder="请选择">
            <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button type="primary" @click="updataResultFn"> 确定 </el-button>
          <el-button @click="updataResultCanelFn">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  usersAddI
} from "@/api/system/proxyUser";

export default {
  dicts: ['sys_risk_level'],
  name: "ProxysResult",
  props: {
    treeOptions: {
      type: Array,
      default: [],
    },
    drawerData: {
      type: Object,
      default: {},
    }
  },
  data() {
    return {
      updataLoading: false,
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
      resultFormNodeName: '',
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
      tableData: [{
        date: '安徽',
        name: '阿吉',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '河南',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '山东',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '北京',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '北京',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
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
      databaseTypeList: [{ name: "MYSQL", value: "MYSQL" },
       { name: "SQL_SERVER", value: "SQL_SERVER" }, { name: "TIDB", value: "TIDB" },
       { name: "POSTGRES", value: "POSTGRES" }, { name: "达梦", value: "DM" }],
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
      projectNameEdit: "",
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
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
      tableList: [],
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
    this.getProtectCategory()
    // this.queryParams.selectProjectName = "全部"
    // this.queryParams.projectId = 0
    this.getList();
  },
  mounted() {
    this.getListTableByProject()
  },
  methods: {

    handleAdda() {
      this.loading = true
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(`确定当前勾选项吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
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
        this.$message({ message: '请选择至少一条数据', type: 'warning' })
      }
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
    databaseNameFn() {
      this.queryParams.tableId = ''
      this.inputSearch()
      this.getListTableByProject()
    },
    updataResultFn() {
      this.updataLoading = true
      updateFiledRule(this.resultForm).then(res => {
        if (res.code == 200) {
          this.$message({
            message: res.msg,
            type: 'success'
          })
        }
        this.deleteVisible = false
        this.resultFormNodeName = ''
        this.resetForm('resultForm')
        this.getList()
        this.updataLoading = false
      })
        .catch(err => {
          this.updataLoading = false
        })
    },
    updataResultCanelFn() {
      this.deleteVisible = false
      this.resultFormNodeName = ''
      this.resetForm('resultForm')
    },
    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}个`)
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
        securityLevel: '',
        securityLevelIds: this.queryParams.securityLevel.join(),
        tableIds: this.queryParams.tableId
      }
      protectTableFieldList(params).then(response => {
        this.proxysList = response.rows;
        this.proxysList.forEach(ele => {
          ele.sampleList = JSON.parse(ele.sampleData).map((item => ({ value: item })))
        })
        this.total = response.total;
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
      this.addNodeName = ''
      this.resetForm("queryParams");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    resultExdit(row) {
      this.resultForm.id = row.id
      this.deleteVisible = true
    },

    addHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
        if (parentLabels) {
          this.addNodeName = parentLabels.join('-') + '-' + node.categoryName;
        } else {
          this.addNodeName = node.categoryName;
        }
        this.queryParams.categoryId = node.id
        this.$refs.addSelectRef.blur()
        this.getList()
      }
    },

    resultHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
        if (parentLabels) {
          this.resultFormNodeName = parentLabels.join('-') + '-' + node.categoryName;
        } else {
          this.resultFormNodeName = node.categoryName;
        }
        this.resultForm.categoryId = node.id
        this.$refs.resultSelectRef.blur()
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.categoryName.indexOf(value) !== -1;
    },

    getProtectCategory(key) {
      this.treeLoading = true
      let data = {
        parentId: this.drawerData.projectId,
        needSub: 1,
      };
      treeListI(data).then((resp) => {
        this.categoryList = resp.data
        this.yuanCategoryList = resp.data
        if (resp.data.length == 0) {
          this.Loading = false
        } else {
          let tempList = JSON.parse(JSON.stringify(this.categoryList))
          for (let item of tempList) {
            item.label = item.categoryName
          }
          this.categoryList = this.handleTree(tempList, "id")
          this.categoryListEdit = this.handleTree(tempList, "id")
        }
        this.Loading = false
        this.treeLoading = false
      });
    },

    handleNodeClick(data) {
      this.treeID = data.id;
      this.handleQuery();
    },

    // 递归函数，查找父节点的 label 并返回完整的路径
    findParentLabelsById(tree, nodeId, path = []) {
      if (!Array.isArray(tree)) {
        return null;
      }
      for (const node of tree) {
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            if (child.id === nodeId) {
              return [...path, node.label];
            }
          }
          const found = this.findParentLabelsById(node.children, nodeId, [...path, node.label]);
          if (found) {
            return found;
          }
        }
      }
      return null; // 如果没有找到，返回 null
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

.addSelectClass /deep/ .el-select {
  width: calc(100%);
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
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.yuanDataClass /deep/ .el-form-item {
  width: 32%;
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
  height: 100%;
}

.searchBtn /deep/ .el-form-item__content {
  /* margin-left: 385px */
  /* width: 75%; */
  display: flex;
  justify-content: flex-end
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

.tableCla {
  height: 266px !important;
}
</style>
