<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container" style="margin-bottom: 15px;">
          <el-input v-model="filterText" placeholder="请输入库名搜索"> <i slot="prefix"
              class="el-input__icon el-icon-search"></i></el-input>
        </div>
        <div class="head-container" v-loading="treeLoading">
          <el-tree style="overflow-y: auto;height: 785px;" :data="categoryList" :props="defaultProps"
            :default-expanded-keys="[treeID]" :current-node-key="treeID" :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" node-key="id" highlight-current @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryParams" size="small" :inline="true" label-width="90px">
          <!-- <el-form-item label="规则名称" prop="ruleName">
            <el-input v-model="queryParams.ruleName" @input="inputSearch" placeholder="请输入规则名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item> -->

          <el-form-item label="表名" prop="tableName">
            <el-select v-model="queryParams.tableName" @change="selectProjectIdChange" placeholder="全部">
              <el-option v-for="item in tableNameList" :key="item.tableId" :label="item.label" :value="item.label">
              </el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="数据质量" prop="recognizeObject">
            <el-input v-model="queryParams.ruleName" @input="inputSearch" placeholder="请输入规则名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item> -->
          <el-form-item>
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="mian_box">
          <div v-for="(item, index) in dataAll" v-loading="loading" :key="index" class="mian_box_item">
            <el-card class="box-card">
              <div class="mian_box_head">
                <div><span style="margin-right: 10px;">{{ index + 1 }} </span><span>{{ item.tableName }}</span><span
                    style="font-size: 14px;">（字段总数{{ item.fieldCount }}）</span></div>
                <div></div>
                <div style="display: flex; align-items: center;">
                  <div class="btnItem" @click="aiDataSetFn(item)"><img class="btnImg"
                      src="../../../assets/images/ai.png" alt=""><span>数据填充</span></div>
                  <div class="btnItem" @click="qualityEvaluationFn(item)"><img class="btnImg"
                      src="../../../assets/images/cz-zlpg.png" alt=""><span>质量评估</span></div>
                  <div class="btnItem" @click="fieldInformationFn(item)"><img class="btnImg"
                      src="../../../assets/images/chaxun.png" alt=""><span>字段信息</span></div>
                </div>
              </div>
              <div class="mian_box_center">
                <div>数据质量评分:{{ item.score }}</div>
                <div>数据量级:{{ item.dataMagnitude }}</div>
                <div>原生表注释:{{ item.oldTableRemark }}</div>
                <div>合成表注释:{{ item.craftTableRemark }}</div>
                <div>原生字段注释占比:{{ item.oldFieldRemark ? item.oldFieldRemark + '%' : '' }}</div>
                <div>空值字段比例:{{ item.nullValueField ? item.nullValueField + '%' : '' }}</div>
                <div>样本长度过短比例:{{ item.onlyOneValueField ? item.onlyOneValueField + '%' : '' }}</div>
                <div>样本重复率过高比例:{{ item.repeatValueField ? item.repeatValueField + '%' : '' }}</div>
                <div>有效字段数:{{ item.effectiveCount }}</div>
                <div>脏数据字段数:{{ item.dirtyData }}</div>
                <div>数据来源:{{ item.dataType }}</div>
              </div>
            </el-card>
          </div>
        </div>
      </el-col>
      <pagination class="paginationClass" v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize" @pagination="getList" />
    </el-row>
    <el-drawer custom-class="assetCatalogDrawer" :title="drawerTitle" :visible.sync="drawerShow"
      :destroy-on-close="true" direction="rtl" size="55%">
      <el-table :data="drawerData" ref="tableRef" :key="tableKey" border class="tableBox">
        <el-table-column label="字段名称" align="center" prop="fieldName" width="150" show-overflow-tooltip />
        <el-table-column label="原生字段注释" align="center" min-width="200" prop="oldFieldRemark" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.oldFieldRemark }}</span>
          </template>
        </el-table-column>
        <el-table-column label="合成字段注释" align="center" prop="aiFieldRemark" width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="!scope.row.drawerEdit" @click="drawerEditFn(scope.row, scope.$index)">{{
              scope.row.aiFieldRemark }}</span>
            <el-input v-else id="editInput" v-model="editMsg"
              @blur="drawerEditBlurFn(scope.row, scope.$index)" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="样本是否为空" align="center" prop="dataIsNull" width="100" show-overflow-tooltip />
        <el-table-column label="样本重复率" align="center" prop="dataIsRepeat" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.dataIsRepeat ? scope.row.dataIsRepeat + '%' : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="样本长度过短" align="center" prop="sampleLengthShort" width="100" show-overflow-tooltip />
        <el-table-column label="是否为脏数据" align="center" prop="dirtyData" width="100" show-overflow-tooltip />
        <!-- <el-table-column label="样本重复率" align="center" prop="dataIsRepeat" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.ggg }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="样本" align="center" width="80" class-name="small-padding fixed-width">
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
      </el-table>
    </el-drawer>
  </div>
</template>
<script>
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {
  getAllProxys, getTableListByProxysId, getAllFieldListByTableIdAndDatabaseId,
  getSelectTableNames, callAIPaddingComments, updateDataQualityAssessment
} from "@/api/system/protectCategory";
export default {
  name: "assetCatalog",
  components: {},
  data() {
    return {
      drawerShow: false,
      drawerTitle: '',
      drawerData: [],
      filterText: '',// 过滤条件tree
      Loading: false,// 全局loading
      total: 10,
      loading: false,
      tableNameList: [],
      dataAll: [

      ],
      categoryList: '',
      isChildrenNode: true,
      debounceTimeout: null,//防抖动
      treeLoading: false,
      treeID: '', //tree 父节点id
      databaseName: '',// tree 子节点label
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryId: '',//左侧树id
        name: '',//子类名称
        dataSourceId: '',//来源
        levelId: [],//安全级别
      },
      defaultProps: {
        children: "children",
        label: "label"
      },
      tableKey: 0,
      editMsg:'',
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getProtectCategory()
  },
  mounted() {
  },
  methods: {

    // 数字输入框input事件
    numberInputFn(val) {
      this.addOrEditDataRuls.ruleValue = val.replace(/[^0-9]/g, '');
      let numberVal = parseInt(val)
      if (numberVal > 100) {
        this.addOrEditDataRuls.ruleValue = '100'
      }
    },
    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}个`)
    },
    // ai数据填充
    aiDataSetFn(row) {
      this.loading = true
      let params = {
        tableId: row.tableId,
        databaseId: row.databaseId,
      }
      callAIPaddingComments(params).then(res => {
        if (res.code == 200) {
          this.getList()
          this.loading = false
          this.$message.success(`填充成功`)
        }
      })
    },
    // 质量评估
    qualityEvaluationFn(row) {
      this.loading = true
      let params = {
        tableId: row.tableId,
        databaseId: row.databaseId,
      }
      updateDataQualityAssessment(params).then(res => {
        if (res.code == 200) {
          this.getList()
          this.loading = false
          this.$message.success(`评估完成`)
        }
      })
    },
    drawerEditFn(row, index) {
      this.tableKey += 1
      row.drawerEdit = true
      this.editMsg = row.aiFieldRemark
      this.$nextTick(() => {
        document.getElementById('editInput').focus();
      })
    },
    drawerEditBlurFn(row, index) {
      this.$confirm('是否保存编辑数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.aiFieldRemark = this.editMsg
        this.$message({
          type: 'success',
          message: '修改成功!'
        });
        row.drawerEdit = false
        this.tableKey = 0
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
        row.drawerEdit = false
        this.tableKey += 1
      });
    },
    // 字段信息
    async fieldInformationFn(row) {
      this.drawerTitle = '表名称：' + row.tableName
      let params = {
        tableId: row.tableId,
        databaseId: row.databaseId,
      }
      getAllFieldListByTableIdAndDatabaseId(params).then(res => {
        if (res.code == 200) {
          this.drawerData = res.data
          this.drawerData.forEach(ele => {
            if (ele.data) {
              ele.sampleList = JSON.parse(ele.data).map((item => ({ value: item })))
            }
            ele.drawerEdit = false
            ele.aiFieldRemarkEdit = ''
          })
          this.drawerShow = true
        }
      })
    },
    // 树节点过滤方法
    filterNode(value, data) {
      if (!value) return true;
      return data.categoryName.indexOf(value) !== -1;
    },
    // 左侧树点击事件
    handleNodeClick(data) {
      if (data.parentId) {
        this.databaseName = data.label
        this.treeID = data.parentId;
      } else {
        this.treeID = data.id;
        this.databaseName = ''
      }
      this.isChildrenNode = data.nodeLayerIndex
      this.handleQuery();
      this.getSelectTableNamesFn()
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
    // 左侧树数据
    getProtectCategory(key) {
      this.treeLoading = true
      this.Loading = true
      getAllProxys(key).then((resp) => {
        if (resp.data.length == 0) {
          this.Loading = false
        } else {
          this.categoryList = resp.data
          this.treeID = resp.data[0].id
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(this.treeID);
          });
        }
        this.treeLoading = false
        this.getSelectTableNamesFn()
        this.getList()
      });
    },
    // 列表数据
    getList() {
      this.loading = true;
      let params = {
        ...this.queryParams,
        proxysId: this.treeID,
        databaseName: this.databaseName,
      }
      getTableListByProxysId(params).then((response) => {
        this.dataAll = response.data.rows;
        this.total = response.data.total;
        this.Loading = false
        this.loading = false
      });
    },
    // 字段信息
    async getSelectTableNamesFn() {
      let params = {
        proxysId: this.treeID,
        databaseName: this.databaseName,
      }
      getSelectTableNames(params).then(res => {
        if (res.code == 200) {
          this.tableNameList = res.data
        }
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();

    },
    /** 重置按钮操作 */
    resetQuery() {
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
.mian_box::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.mian_box::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.mian_box::-webkit-scrollbar-track {
  border-radius: 10px;
}
</style>
<style scoped>
.tableBox {
  max-height: 800px;
  overflow-y: auto;
}

.tableBox::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tableBox::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.tableBox::-webkit-scrollbar-track {
  border-radius: 10px;
}

.el-drawer__wrapper /deep/.el-drawer__body {
  padding: 0 20px;
}

.mian_box_item {
  margin-top: 15px;
  margin-right: 10px;
  margin-left: 10px;
}

.addMsg /deep/ .el-input--medium {
  width: 237px;
}

.paginationClass {
  position: fixed;
  bottom: 15px;
  left: 70%;
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

.mian_box {
  width: 100%;
  border: 7px solid #f7f7f7;
  height: 700px;
  overflow: auto;
  margin-bottom: 50px;
}

.mian_box_head {
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f1fafe;
}

.mian_box_center {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  padding: 20px;
}

.mian_box_center div {
  width: 25%;
  margin: 10px 0;
  font-size: 14px;
}

.box-card /deep/ .el-card__body {
  padding: 0;
}

.btnImg {
  width: 25px;
  height: 25px;
  display: block;
}

.btnItem {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-right: 15px;
  font-size: 14px;
}

.btnItem:hover {
  cursor: pointer;
}
</style>
