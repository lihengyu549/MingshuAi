<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container" style="margin-bottom: 15px;">
          <el-input v-model="filterText" placeholder="请输出库名搜索"> <i slot="prefix"
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
        <el-form :model="queryParams" ref="queryParams" size="small" :inline="true"
          label-width="90px">
          <!-- <el-form-item label="规则名称" prop="ruleName">
            <el-input v-model="queryParams.ruleName" @input="inputSearch" placeholder="请输入规则名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item> -->

          <el-form-item label="表名" prop="recognizeWay">
            <el-select v-model="queryParams.recognizeWay" @change="selectProjectIdChange" placeholder="全部">
              <el-option v-for="item in dataQualityList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据质量" prop="recognizeObject">
            <el-input v-model="queryParams.ruleName" @input="inputSearch" placeholder="请输入规则名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="mian_box" v-loading="loading">
          <div v-for="(item, index) in dataAll" :key="index" class="mian_box_item">
            <el-card class="box-card">
              <div class="mian_box_head">
                <div><span style="margin-right: 10px;">{{ index + 1 }} </span><span>{{ item.tableName }}</span><span style="font-size: 14px;">（字段总数{{ item.fieldCount }}）</span></div>
                <div></div>
                <div style="display: flex; align-items: center;">
                  <div class="btnItem" @click="aiDataSetFn"><img class="btnImg" src="../../../assets/images/ai.png"
                      alt=""><span>数据填充</span></div>
                  <div class="btnItem" @click="qualityEvaluationFn"><img class="btnImg"
                      src="../../../assets/images/cz-zlpg.png" alt=""><span>质量评估</span></div>
                  <div class="btnItem" @click="fieldInformationFn"><img class="btnImg"
                      src="../../../assets/images/chaxun.png" alt=""><span>字段信息</span></div>
                </div>
              </div>
              <div class="mian_box_center">
                <div>数据质量评分:{{ item.score }}</div>
                <div>数据量级:{{ item.dataMagnitude }}</div>
                <div>原生表注释:{{ item.oldTableRemark }}</div>
                <div>合成表注释:{{ item.craftTableRemark }}</div>
                <div>原生字段注释占比:{{ item.oldFieldRemark }}</div>
                <div>空值字段比例:{{ item.nullValueField }}</div>
                <div>样本长度过短比例:{{ item.onlyOneValueField }}</div>
                <div>样本重复率过高比例:{{ item.repeatValueField }}</div>
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
  </div>
</template>
<script>
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getAllProxys,getTableListByProxysId } from "@/api/system/protectCategory";
export default {
  name: "assetCatalog",
  components: {},
  data() {
    return {
      filterText: '',// 过滤条件tree
      Loading: false,// 全局loading
      total: 10,
      loading: false,
      dataQualityList: [
        {
          value: '1',
          label: '高'
        },
        {
          value: '2',
          label: '中'
        },
        {
          value: '3',
          label: '低'
        },
      ],
      dataAll: [
       
      ],
      categoryList: '',
      isChildrenNode: true,
      debounceTimeout: null,//防抖动
      treeLoading: false,
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
      defaultProps: {
        children: "children",
        label: "label"
      },
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
    // 数据质量文字展示
    recognizeWayMsg(val) {
      for (let item of this.dataQualityList) {
        if (val == item.value) {
          return item.label

        }
      }
    },
    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}个`)
    },
    // ai数据填充
    aiDataSetFn() { },
    // 质量评估
    qualityEvaluationFn() { },
    // 字段信息
    fieldInformationFn() { },
    // 树节点过滤方法
    filterNode(value, data) {
      if (!value) return true;
      return data.categoryName.indexOf(value) !== -1;
    },
    // 左侧树点击事件
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
    // 左侧树数据
    getProtectCategory(key) {
      this.treeLoading = true
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
        this.Loading = false
        this.treeLoading = false
        this.getList()
      });
    },
    // 列表数据
    getList() {
      this.loading = true;
      let params = {
        ...this.queryParams,
        proxysId: this.treeID,
      }
      getTableListByProxysId(params).then((response) => {
        this.dataAll = response.data.rows;
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
