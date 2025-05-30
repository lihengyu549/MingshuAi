<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-select v-model="queryParams.categoryId" class="serachInput" @change="treeOptionsSelectChange"
            placeholder="全部" style="margin-bottom: 20px">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="head-container" v-loading="treeLoading">
          <el-tree style="overflow-y: auto;height: 785px;" :data="categoryList" :props="defaultProps"
            :default-expanded-keys="[treeID]" :current-node-key="treeID" :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" node-key="id" highlight-current @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryParams" size="small" :inline="true" v-show="showSearch"
          label-width="90px">
          <el-form-item label="规则名称" prop="ruleName">
            <el-input v-model="queryParams.ruleName" @input="inputSearch" placeholder="请输入规则名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="识别对象" prop="recognizeObject">
            <el-select v-model="queryParams.recognizeObject" clearable @change="dataSourceIdIdChange" placeholder="全部"
              :loading="loading">
              <el-option v-for="item in recognizeObjectList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="识别方式" prop="recognizeWay">
            <el-select v-model="queryParams.recognizeWay" @change="selectProjectIdChange" placeholder="全部">
              <el-option v-for="item in addOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <!-- <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button> -->
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          </el-form-item>
          <div style="margin: 20px 0 20px 25px;">
            <el-button type="primary" icon="el-icon-plus" size="medium" :disabled="isChildrenNode !== 4"
              @click="addFn">新增</el-button>
            <el-button type="primary" icon="el-icon-delete" size="medium" @click="enabledFn('删除')">删除</el-button>
            <el-button type="primary" icon="el-icon-refresh" size="medium" @click="enabledFn('启用')">启用</el-button>
            <el-button type="primary" icon="el-icon-warning" size="medium" @click="enabledFn('禁用')">禁用</el-button>
          </div>
        </el-form>
        <el-table v-loading="loading" :data="protectTableFieldList" ref="tableRef" height="630px" class="tableBox">
          <!-- <el-table-column width="55" align="center" /> -->
          <el-table-column type="selection" width="60" align="center">
          </el-table-column>
          <el-table-column label="规则名称" align="center" prop="ruleName" show-overflow-tooltip />
          <el-table-column label="所属标准" align="center" prop="attachData" show-overflow-tooltip />
          <el-table-column label="识别对象" align="center" prop="recognizeObject" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>
                {{ recognizeObjectMsg(scope.row.recognizeObject) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="识别方式" align="center" prop="recognizeWay" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>
                {{ recognizeWayMsg(scope.row.recognizeWay) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="state">
            <template slot-scope="scope">
              <span>
                {{ scope.row.state === '0' ? '启用' : '禁用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" align="center" prop="updateTime" />
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="medium" :disabled="scope.row.dataSource === '内置'"
                @click="editFn(scope.row)">编辑</el-button>
              <el-button type="text" size="medium" @click="lookFn(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>
    <!-- 新增编辑框 -->
    <el-dialog :title="addOrEdit.title" v-loading="importDataLoading" :visible.sync="addOrEdit.show" width="700px"
      append-to-body :close-on-click-modal="addOrEdit.flag == 3">
      <el-form :model="addOrEditDataRuls" size="medium" v-if="addOrEdit.show" :rules="addOrEditRules" ref="addOrEdit"
        label-width="120px" style="padding-right: 60px;">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="addOrEditDataRuls.ruleName" :disabled="addOrEdit.flag == 3" maxlength="50"
            placeholder="请输入规则名称"></el-input>
        </el-form-item>
        <el-form-item label="识别对象" class="addSelectClass" prop="recognizeObject">
          <el-select v-model="addOrEditDataRuls.recognizeObject" :disabled="addOrEdit.flag == 3" placeholder="全部">
            <el-option v-for="item in recognizeObjectList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="recognizeWay" class="addSelectClass" label="识别方式">
          <el-select v-model="addOrEditDataRuls.recognizeWay" :disabled="addOrEdit.flag == 3" placeholder="全部">
            <el-option v-for="item in addOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="相似度" v-if="addOrEditDataRuls.recognizeObject == '3'" prop="ruleValue"
          class="ruleValueClass">
          <el-input v-model="addOrEditDataRuls.ruleValue" :disabled="addOrEdit.flag == 3" placeholder="请输入"
            @input="numberInputFn" />
          <span style="font-size: 18px;margin-left: 10px;">%</span>
          <span style="margin-left: 30px;font-size: 14px;"><i class="el-icon-warning"></i>
            设置与字段内容匹配的阈值</span>
        </el-form-item>
        <el-form-item class="rulesContClass" label="规则内容" prop="ruleContent">
          <div style="display: flex; justify-content: space-between; align-items: center;margin-bottom: 15px;">
            <span style="color: rgb(188 188 188);font-size:15px;font-style: italic;">(匹配以下任意一条)</span>
            <span class="addTextBtn" v-if="addOrEdit.flag !== 3" @click="rulesContAddFn">添加</span>
          </div>
          <div class="forDiv">
            <div v-for="(item, index) in ruleContent" :key="index" style="margin-bottom: 15px;">
              <el-input v-model="item.name" :disabled="addOrEdit.flag == 3" />
              <span @click="delAddSelect(index)" v-if="addOrEdit.flag !== 3"
                style="margin-left: 20px; color: red;">删除</span>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addSubmitForm">确
          定</el-button>
        <el-button @click="addCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getParentIdTree, getListitem, enableDataItem, deleteDataItem, updateAttachDataItme, nameTesting, getFrameworks, addAttachDataItme, nameRules } from "@/api/system/protectCategory";
import { number } from "echarts";
import r from "highlight.js/lib/languages/r";
export default {
  name: "ProtectTableField",
  components: { Treeselect },
  dicts: ['sys_risk_level'],
  data() {
    return {
      importData: {
        importFile: '', // 导入魔板文件名
        fileList: [],//导入模板的文件数据
        categoryName: '',//框架名称
        importShow: false,
      },
      categoryName: '',
      isChildrenNode: true,
      debounceTimeout: null,//防抖动
      treeOptions: [],
      addOrEdit: {
        title: '新增',
        show: false,
        flag: 1,// 1新增 2编辑 3查看
      },
      ruleContent: [
      ],
      treeLoading: false,
      // 表单校验
      addOrEditRules: {
        ruleName: [
          { required: true, message: "请输入规则名称", trigger: "blur" }
        ],
        recognizeObject: [
          { required: true, message: "请选择识别对象", trigger: "change" }
        ],
        recognizeWay: [
          { required: true, message: "请选择识别方式", trigger: "change" }
        ],
        ruleValue: [
          { required: true, message: "请输入相似度", trigger: "blur" },
          { pattern: /^(?:[1-9]|[1-9][0-9]|100)$/, message: "请输入1到100之间的正整数", trigger: "blur" }
        ],
        ruleContent: [
          { required: true, validator: this.validateRuleContent, trigger: "change" }
        ]
      },
      // 表单校验
      importDataRules: {
        categoryName: [
          {
            required: true, message: "请输入框架名称", trigger: "blur"
          }
        ],
        importFile: [
          { required: true, message: "请选择导入框架文件", trigger: "blur" },
        ],
      },
      treeID: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryId: '',//左侧树id
        name: '',//子类名称
        dataSourceId: '',//来源
        levelId: [],//安全级别
      },
      addOrEditDataRuls: {
        ruleName: '',
        recognizeObject: '',
        recognizeWay: '',
        ruleValue: '',
        ruleName: '',
      }, // 新增得弹出框数据
      importDataLoading: false,
      filterName: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      isName: true,
      Loading: false,
      url: `${process.env.VUE_APP_BASE_API}/static/file/auth.zip`,
      recognizeObjectList: [
        {
          value: '1',
          label: '名称匹配'
        },
        {
          value: '2',
          label: '注释匹配'
        },
        {
          value: '3',
          label: '内容匹配'
        },
      ],
      addOptions: [
        {
          value: '1',
          label: "精准"
        }, {
          value: '2',
          label: "包含"
        }, {
          value: '3',
          label: "正则"
        }
      ],
      // 遮罩层
      loading: false,
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
      categoryList: [],
      yuanCategoryList: [],
      categoryListEdit: null,
    };
  },
  watch: {
    filterName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.gettreeOptionsList()

  },
  mounted() {

  },
  methods: {
    addFn() {
      this.addOrEdit.flag = 1
      this.addOrEdit.title = '新增匹配规则'
      this.addOrEdit.show = true
      this.addOrEditDataRuls = {}
      this.ruleContent = []
    },
    // 数字输入框input事件
    numberInputFn(val) {
      this.addOrEditDataRuls.ruleValue = val.replace(/[^0-9]/g, '');
      let numberVal = parseInt(val)
      if (numberVal > 100) {
        this.addOrEditDataRuls.ruleValue = '100'
      }
    },
    // 新增规则内容
    rulesContAddFn() {
      this.ruleContent.push({ name: '' })
    },
    recognizeObjectMsg(val) {
      for (let item of this.recognizeObjectList) {
        if (val == item.value) {
          return item.label

        }
      }
    },
    recognizeWayMsg(val) {
      for (let item of this.addOptions) {
        if (val == item.value) {
          return item.label

        }
      }
    },
    delAddSelect(index) {
      this.ruleContent.splice(index, 1)
    },
    // 自定义校验规则
    validateRuleContent(rule, value, callback) {
      let nameList = this.ruleContent.filter((item) => {
        return item.name
      })
      if (this.ruleContent.length === 0 || nameList.length === 0) {
        callback(new Error("至少需要一条规则内容"));
      } else {
        callback();
      }
    },
    /** 新增确定方法 */
    async addSubmitForm() {
      if (this.addOrEdit.flag === 3) {
        this.addOrEdit.show = false
        return
      }
      this.$refs["addOrEdit"].validate(async (valid) => {
        let nameList = this.ruleContent.filter(item => item.name !== '').map(item => item.name)
        let params = {
          categoryDataId: this.treeID,
          ruleName: this.addOrEditDataRuls.ruleName,
          recognizeObject: this.addOrEditDataRuls.recognizeObject,
          recognizeWay: this.addOrEditDataRuls.recognizeWay,
          ruleValue: this.addOrEditDataRuls.ruleValue,
          ruleContent: nameList.join(),
          state: 0,
        }
        if (valid) {
          if (await this.getNameTestingFn()) {
            return
          }
          this.importDataLoading = true
          if (this.addOrEditDataRuls.id) {
            params.id = this.addOrEditDataRuls.id
            updateAttachDataItme(params).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.getList();
              this.addOrEdit.show = false
              this.importDataLoading = false
            })
              .catch((err) => {
                this.importDataLoading = false
              })
          } else {
            addAttachDataItme(params).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.getList();
              this.addOrEdit.show = false
              this.importDataLoading = false
            })
              .catch((err) => {
                this.importDataLoading = false
              })
          }
        } else {
          return false
        }
      });
    },

    // 新增取消
    addCancel() {
      this.addOrEditDataRuls = {}
      this.addOrEdit.show = false
    },
    editFn(row) {
      this.addOrEdit.flag = 2
      this.addOrEditDataRuls = JSON.parse(JSON.stringify(row))
      let ruleContentList = JSON.parse(JSON.stringify(row.ruleContent)).split(',')
      this.ruleContent = ruleContentList.map(item => {
        return { name: item }
      })
      this.addOrEdit.show = true
      this.addOrEdit.title = '编辑'
    },
    lookFn(row) {
      this.addOrEdit.flag = 3
      this.addOrEditDataRuls = row
      let ruleContentList = JSON.parse(JSON.stringify(row.ruleContent)).split(',')
      this.ruleContent = ruleContentList.map(item => {
        return { name: item }
      })
      this.addOrEdit.show = true
      this.addOrEdit.title = '查看'
    },
    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}个`)
    },
    enabledFn(flag) {
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(`确定批量${flag}吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let data = {
            ids: ids
          }
          if (flag == '启用') {
            data.state = '0'
            enableDataItem(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.getList()
              }
            })
          } else if (flag == '禁用') {
            data.state = '1'
            enableDataItem(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.getList()
              }
            })
          } else if (flag == '删除') {
            // for (let item of dataS) {
            //   if (item.dataSource === '内置') {
            //     this.$message({
            //       type: 'warning',
            //       message: '内置数据源不允许删除',
            //     });
            //     return
            //   }
            // }
            deleteDataItem(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.getList()
              }
            })
          } else {
            this.$message({ message: '未知异常', type: 'warning' })
          }
          // 接口
        }).catch(() => {

        });
      } else {
        this.$message({ message: '请选择至少一条数据', type: 'warning' })
      }
    },
    // 左侧树下拉选change事件
    treeOptionsSelectChange(val) {
      this.resetQuery()
      this.getProtectCategory(val)
    },
    gettreeOptionsList() {
      this.Loading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        if (response.data.length > 0) {
          this.queryParams.categoryId = response.data[0].id;
          this.getProtectCategory(this.queryParams.categoryId);
        }else {
          this.Loading = false
        }
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.categoryName.indexOf(value) !== -1;
    },
    handleNodeClick(data) {
      this.treeID = data.id;
      this.isChildrenNode = data.nodeLayerIndex
      this.handleQuery();
    },

    // 定时器，防抖使用
    inputSearch(data) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleQuery()
      }, 500); // 设置防抖的时间间隔为300毫秒
    },
    selectProjectIdChange(val) {
      this.handleQuery()
    },
    dataSourceIdIdChange(val) {
      this.recognizeObjectList.forEach((item) => {
        if (val == item.value)
          this.queryParams.dataSource = item.label
      })
      this.handleQuery()
    },
    getProtectCategory(key) {
      this.treeLoading = true
      getParentIdTree(key).then((resp) => {
        this.categoryList = resp.data
        this.yuanCategoryList = resp.data
        if (resp.data.length == 0) {
          this.Loading = false
        } else {
          for (let index in resp.data) {
            if (resp.data[index].parentId === 0) {
              this.categoryList.splice(index, 1)
              break
            }
          }
          this.treeID = this.categoryList[0].id;
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(this.treeID);
          });
          let tempList = JSON.parse(JSON.stringify(this.categoryList))
          for (let item of tempList) {
            item.label = item.categoryName
          }
          this.categoryList = this.handleTree(tempList, "id")
          this.categoryListEdit = this.handleTree(tempList, "id")
        }
        this.Loading = false
        this.treeLoading = false
        this.getList()
      });
    },
    getList() {
      this.loading = true;
      let params = {
        ...this.queryParams,
        dataId: this.treeID,
      }
      getListitem(params).then((response) => {
        this.protectTableFieldList = response.data.rows;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();

    },
    // 校验名称是否重复
    async getNameTestingFn() {
      this.importDataLoading = true
      let params = {
        ruleName: this.addOrEditDataRuls.ruleName,
        dataId: this.addOrEditDataRuls.categoryDataId || this.treeID,
        id: this.addOrEditDataRuls.id || ''
      }
      let res = await nameRules(params)
      if (res.data) {
        this.$message.error('该规则名称已存在');
      }
      this.importDataLoading = false
      return res.data

    },
    /** 重置按钮操作 */
    resetQuery() {
      // this.$refs.tree.setCurrentKey(null);
      this.treeID = this.categoryList[0].id
      this.isChildrenNode = this.categoryList[0].nodeLayerIndex
      this.$refs.tree.setCurrentKey(this.treeID);
      this.resetForm("queryParams");
      this.handleQuery();
    },
  },
};
</script>
<style>
.rulesContClass ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.rulesContClass ::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.rulesContClass ::-webkit-scrollbar-track {
  border-radius: 10px;
}
</style>
<style scoped>
.el-popup-parent--hidden /deep/ .el-loading-mask {
  background: "rgba(0, 0, 0, 0.7)" !important;
}

.app-container /deep/ ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.app-container /deep/::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.app-container /deep/::-webkit-scrollbar-track {
  border-radius: 10px;
}

.addMsg /deep/ .el-input--medium {
  width: 237px;
}

.success {
  color: #67c23a;
}

.error {
  color: #f56c6c;
}

.el-tree-node /deep/ .el-tree-node {
  display: none;
}

.serachInput {
  width: 100%;
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

.rulesContClass {
  height: 300px;
}

.forDiv {
  overflow-y: auto;
  max-height: 300px;
}

.rulesContClass /deep/ .el-input {
  width: calc(80%);
}

.rulesContClass /deep/ .el-form-item__label {
  width: 100%;
}

.ruleValueClass /deep/ .el-input {
  width: calc(20%);
}

.tableBox {
  overflow-y: auto;
}

.addTextBtn {
  font-weight: 700;
  color: #1890ff;
}

.addTextBtn:hover {
  cursor: pointer;
}

/* ::v-deep
  .el-tree--highlight-current
  .el-tree-node.is-current
  > .el-tree-node__content {
  background-color: #baf !important;
} */
</style>
