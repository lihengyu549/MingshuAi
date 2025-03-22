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
        <el-form :model="queryParams" ref="queryParams" size="small" :inline="true" v-show="showSearch"
          label-width="90px">
          <el-form-item label="规则名称" prop="ruleName">
            <el-input v-model="queryParams.ruleName" @input="inputSearch" placeholder="请输入规则名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="识别对象" prop="recognizeObject">
            <el-input v-model="queryParams.ruleName" @input="inputSearch" placeholder="请输入规则名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="识别方式" prop="recognizeWay">
            <el-select v-model="queryParams.recognizeWay" @change="selectProjectIdChange" placeholder="全部">
              <el-option v-for="item in dataQualityList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <!-- <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button> -->
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          </el-form-item>
          <div style="margin: 20px 0 20px 25px;">
          </div>
        </el-form>
        <div class="mian_box">
          <div v-for="(item, index) in dataAll" :key="index">
            <el-card class="box-card">
              <div class="mian_box_head">
                <div><span style="margin-right: 10px;">{{ index + 1 }} </span><span>{{ item.titleName }}</span></div>
                <div></div>
                <div>
                  <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
                  <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
                  <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>

                </div>
              </div>
              <div class="mian_box_center">
                <div>数据质量:{{ item.aaa }}</div>
                <div>分值:{{ item.bbb }}</div>
                <div>数据量级:{{ item.ccc }}</div>
                <div>原生表注释:{{ item.ddd }}</div>
                <div>合成表注释:{{ item.eee }}</div>
                <div>原生字段注释占比:{{ item.fff }}</div>
                <div>空值字段比例:{{ item.ggg }}</div>
                <div>样本重复率过高比例:{{ item.hhh }}</div>
                <div>有效字段数:{{ item.iii }}</div>
                <div>脏数据字段数:{{ item.jjj }}</div>
                <div>数据来源:{{ item.kkk }}</div>
              </div>
            </el-card>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getParentIdTree, getListitem, enableDataItem, deleteDataItem, updateAttachDataItme, nameTesting, getFrameworks, addAttachDataItme } from "@/api/system/protectCategory";
export default {
  name: "assetCatalog",
  components: {},
  data() {
    return {
      filterText: '',// 过滤条件tree
      Loading: false,// 全局loading
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
      dataAll: [{
        titleName: 'Username Table（字段总数 200）',
        aaa:'高',
        bbb:'85',
        ccc:'1000行',
        ddd:'保险业务单（可编辑）',
        eee:'保险系统中客户个人信息相关内容',
        fff:'70%',
        ggg:'10%',
        hhh:'20%',
        iii:'180',
        jjj:'20',
        kkk:'MYSQL',
      }],
      showSearch: true,
      categoryList: '',
      categoryName: '',
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
    this.getProtectCategory('3018')
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
    // // 文件上传前钩子
    // importFileBeforeUpload(val) {
    //   this.importData.importFile = val.name
    //   this.importData.fileList.push(val)

    //   // 暂时禁止上传，等接口
    //   return false
    // },

    // jumpApi(url, id) {
    //   const routeData = this.$router.resolve({
    //     path: "/systemInfo/api",
    //     query: { id: id, url: url },
    //   });
    //   window.open(routeData.href, '_blank')
    // },
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
.mian_box ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.mian_box ::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.mian_box ::-webkit-scrollbar-track {
  border-radius: 10px;
}
</style>
<style scoped>
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

.mian_box {
  width: 100%;
  border: 10px solid #efefef;
}

.mian_box_head {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f1fafe;
}
.mian_box_center{
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}
.mian_box_center div {
  width: 25%;
  margin: 10px 0;
  font-size: 12px;
}
.el-card__body{
  padding: 0;
}
</style>
