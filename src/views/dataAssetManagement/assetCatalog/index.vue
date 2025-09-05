<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <!-- 1. 原有搜索输入框（保持不变，位于最上方） -->
        <div class="head-container" style="margin-bottom: 15px;">
          <el-input v-model="filterText" placeholder="请输入库名搜索" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>

        <!-- 2. 新增：全选框（左） + 导出按钮（右） 区域 -->
        <div class="tree-operation-bar"
          style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <!-- 左侧全选框（带文字说明） -->
          <el-checkbox v-model="isTreeAllChecked" @change="handleTreeAllCheck"
            style="font-size: 14px; margin-left: 20px;">
            全选
          </el-checkbox>
          <!-- 右侧导出按钮（无选中节点时禁用） -->
          <el-button type="text" @click="handleTreeExport" :disabled="selectedTreeNodeIds.length === 0"
            style="color: #26244ce0;">
            <svg-icon icon-class="导出" />
            导出
          </el-button>
        </div>

        <div class="head-container" v-loading="treeLoading">
          <el-tree class="treeBox" style="overflow-y: auto;height: 785px;" :data="categoryList" :props="defaultProps"
            :default-expanded-keys="[treeID]" :current-node-key="treeID" :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" node-key="id" highlight-current show-checkbox
            :check-strictly="false" :default-checked-keys="defaultCheckedKeys" @check="handleTreeCheck" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" class="yuanDataClass" ref="queryParams" size="small" :inline="true"
          label-width="100px">
          <el-form-item label="表名" prop="tableName">
            <el-select v-model="queryParams.tableName" @change="selectProjectIdChange" filterable placeholder="全部">
              <el-option v-for="item in tableNameList" :key="item.tableId" :label="item.label" :value="item.tableId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="注释填充" prop="paddingStatus">
            <el-select v-model="queryParams.paddingStatus" @change="selectProjectIdChange" placeholder="全部">
              <el-option label="未开始" value="1"></el-option>
              <el-option label="成功" value="2"></el-option>
              <el-option label="失败" value="3"></el-option>
              <el-option label="执行中" value="4"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="样本特征提取" prop="featureExtractionStatus">
            <el-select v-model="queryParams.featureExtractionStatus" @change="selectProjectIdChange" placeholder="全部">
              <el-option label="未开始" value="1"></el-option>
              <el-option label="成功" value="2"></el-option>
              <el-option label="失败" value="3"></el-option>
              <el-option label="执行中" value="4"></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item> -->
          <!-- <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button> -->
          <!-- <el-button icon="el-icon-s-opportunity" type="primary" size="small" @click="allFill">一键填充</el-button>
            <el-button icon="el-icon-s-help" type="primary" size="small" @click="allAssess">一键评估</el-button> -->
          <!-- </el-form-item> -->
        </el-form>
        <div class="mian_box" id="main_box">
          <div v-for="(item, index) in dataAll" v-loading="loading" :key="index" class="table-info-card">
            <!-- 头部区域：表名 + 字段信息按钮 -->
            <div class="card-header">
              <h3 class="table-name">{{ item.tableName }}</h3>
              <button class="field-info-btn" @click="fieldInformationFn(item)">
                <i class="el-icon-warning-outline" style="margin-right: 5px;"></i>字段信息
              </button>
            </div>

            <!-- 内容区域：分三行布局 -->
            <div class="card-content">
              <!-- 第一行：4 列 -->
              <div class="row row-1">
                <div class="col col-4">
                  <div class="label">数据质量评分</div>
                  <div class="value" :title="item.score || '--'">{{ item.score ? item.score : '--' }}</div>
                  <svg-icon icon-class="xingxing" class="info-icon" />
                  <div class="progress-bar">
                    <el-progress :percentage="Number(item.score)" color="#f4a63e" :show-text="false"></el-progress>
                  </div>
                </div>
                <div class="col col-1">
                  <div class="label">表注释</div>
                  <div class="value" :title="item.oldTableRemark || '--'">{{ item.oldTableRemark ? item.oldTableRemark :
                    '--' }}</div>
                  <svg-icon icon-class="xinxi" class="info-icon" />
                </div>
                <div class="col col-2">
                  <div class="label">数据大小</div>
                  <div class="value" :title="item.dataSize || '--'">{{ item.dataSize ? item.dataSize : '--' }}</div>
                  <svg-icon icon-class="database" class="info-icon" />
                </div>
                <div class="col col-3">
                  <div class="label">数据量级</div>
                  <div class="value" :title="item.dataMagnitude ? item.dataMagnitude + ' 行' : '--'">{{
                    item.dataMagnitude ? item.dataMagnitude + ' 行' : '--' }}</div>
                  <svg-icon icon-class="list2" class="info-icon" />
                </div>
              </div>

              <!-- 第二行：6 列 -->
              <div class="row row-2">
                <div class="col">
                  <div class="label">AI表注释</div>
                  <div class="value" :title="item.craftTableRemark || '--'">{{ item.craftTableRemark ?
                    item.craftTableRemark : '--' }}</div>
                </div>
                <div class="col">
                  <div class="label">数据源名称</div>
                  <div class="value" :title="item.dataSourceName || '--'">{{ item.dataSourceName ?
                    item.dataSourceName : '--' }}</div>
                </div>
                <div class="col">
                  <div class="label">分类分级标准</div>
                  <div class="value" :title="item.categoryName || '--'">{{ item.categoryName ?
                    item.categoryName : '--' }}</div>
                </div>
                <div class="col">
                  <div class="label">来源业务系统</div>
                  <div class="value" :title="item.businessName || '--'">{{ item.businessName ?
                    item.businessName : '--' }}</div>
                </div>
                <div class="col">
                  <div class="label">所属库名</div>
                  <div class="value" :title="item.affiliationDatabaseName || '--'">{{ item.affiliationDatabaseName ?
                    item.affiliationDatabaseName : '--' }}</div>
                </div>
                <div class="col">
                  <div class="label">表分类</div>
                  <div class="value" :title="item.tableCategoryName || '--'">{{ item.tableCategoryName ?
                    item.tableCategoryName : '--' }}</div>
                </div>
              </div>

              <!-- 第三行：6 列 -->
              <div class="row row-3">
                <div class="col">
                  <div class="label">表分级</div>
                  <div class="value" :title="item.tableSecurityLevel || '--'">{{ item.tableSecurityLevel ?
                    item.tableSecurityLevel : '--' }}</div>
                </div>
                <div class="col">
                  <div class="label">个人信息条数</div>
                  <div class="value green" :title="item.personalInformation ? item.personalInformation + ' 条' : '--'">{{
                    item.personalInformation ? item.personalInformation + ' 条' : '--' }}</div>
                </div>
                <div class="col">
                  <div class="label">未成年人信息条数</div>
                  <div class="value" :title="item.minorsInformation || '--'">{{ item.minorsInformation ?
                    item.minorsInformation : '--' }}</div>
                </div>
                <div class="col">
                  <div class="label">字段数量</div>
                  <div class="value" :title="item.fieldCount || '--'">{{ item.fieldCount ? item.fieldCount : '--' }}
                  </div>
                </div>
                <div class="col">
                  <div class="label">注释填充</div>
                  <el-tag
                    :type="item.paddingStatus == '未开始' ? 'info' : item.paddingStatus == '成功' ? 'success' : item.paddingStatus == '失败' ? 'danger' : item.paddingStatus == '执行中' ? 'primary' : 'info'"
                    class="status-tag" :title="item.paddingStatus">
                    <i
                      :class="item.paddingStatus == '未开始' ? 'el-icon-time' : item.paddingStatus == '成功' ? 'el-icon-circle-check' : item.paddingStatus == '失败' ? 'el-icon-warning-outline' : item.paddingStatus == '执行中' ? 'el-icon-refresh' : 'el-icon-time'"></i>
                    {{ item.paddingStatus }}
                  </el-tag>
                </div>
                <div class="col">
                  <div class="label">样本特征提取</div>
                  <el-tag
                    :type="item.featureExtractionStatus == '未开始' ? 'info' : item.featureExtractionStatus == '成功' ? 'success' : item.featureExtractionStatus == '失败' ? 'danger' : item.featureExtractionStatus == '执行中' ? 'primary' : 'primary'"
                    class="status-tag" :title="item.featureExtractionStatus">
                    <i
                      :class="item.featureExtractionStatus == '未开始' ? 'el-icon-time' : item.featureExtractionStatus == '成功' ? 'el-icon-circle-check' : item.featureExtractionStatus == '失败' ? 'el-icon-warning-outline' : item.featureExtractionStatus == '执行中' ? 'el-icon-refresh' : 'el-icon-time'"></i>
                    {{ item.featureExtractionStatus }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
          <div v-if="dataAll.length === 0" class="no-data">
            <el-empty description="暂无数据"></el-empty>
          </div>
        </div>
      </el-col>
      <pagination class="paginationClass" v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize" @pagination="getList" />
    </el-row>
    <el-drawer custom-class="assetCatalogDrawer" :title="drawerTitle" :visible.sync="drawerShow"
      :destroy-on-close="true" direction="rtl" size="51%">
      <!-- 新增筛选区域 -->
      <el-form :model="drawerQueryParams" ref="drawerQueryForm" size="small" :inline="true" label-width="80px"
        style="margin: 15px 0;">
        <el-form-item label="字段名称" prop="fieldName"> <!-- 添加prop -->
          <el-input v-model="drawerQueryParams.fieldName" placeholder="请输入字段名称搜索" @input="handleDrawerSearch"
            size="mini"></el-input>
        </el-form-item>
        <el-form-item label="字段类型" prop="fieldType"> <!-- 添加prop -->
          <el-input v-model="drawerQueryParams.fieldType" placeholder="请输入字段类型搜索" @input="handleDrawerSearch"
            size="mini"></el-input>
        </el-form-item>
        <el-form-item label="字段注释" prop="oldFieldRemark"> <!-- 添加prop -->
          <el-input v-model="drawerQueryParams.oldFieldRemark" placeholder="请输入字段注释搜索" @input="handleDrawerSearch"
            size="mini"></el-input>
        </el-form-item>
        <!-- <el-form-item label="脏数据" prop="dirtyData">
          <el-select v-model="drawerQueryParams.dirtyData" placeholder="全部" @change="handleDrawerSearch"
            style="width: 120px;">
            <el-option label="是" value="是"></el-option>
            <el-option label="否" value="否"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="样本特征" prop="sampleFeature">
          <el-select v-model="drawerQueryParams.sampleFeature" placeholder="全部" @change="handleDrawerSearch"
            style="width: 120px;">
            <el-option label="包含" value="包含"></el-option>
            <el-option label="不包含" value="不包含"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <!-- <el-button icon="el-icon-refresh" size="small" @click="resetDrawerSearch">重置</el-button> -->
        </el-form-item>
      </el-form>
      <el-table :data="filteredDrawerData" ref="tableRef" height="calc(100% - 100px)" :key="tableKey" border
        class="tableBox">
        <el-table-column label="字段名称" align="center" prop="fieldName" width="200" show-overflow-tooltip />
        <el-table-column label="字段类型" align="center" prop="fieldType" width="200" show-overflow-tooltip />
        <el-table-column label="字段注释" align="center" width="200" prop="oldFieldRemark" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.oldFieldRemark }}</span>
          </template>
        </el-table-column>
        <el-table-column label="AI字段注释（可编辑）" align="center" prop="aiFieldRemark" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="!scope.row.drawerEdit" @click="drawerEditFn(scope.row, 'aiFieldRemark')">{{
              scope.row.aiFieldRemark }}</span>
            <el-input v-else id="editInput" v-model="editMsg" @blur="drawerEditBlurFn(scope.row, 'aiFieldRemark')"
              size="small" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="样本是否为空" align="center" prop="dataIsNull" width="100" show-overflow-tooltip />
        <el-table-column label="样本重复率" align="center" prop="dataIsRepeat" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.dataIsRepeat ? scope.row.dataIsRepeat + '%' : '' }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="样本长度过短" align="center" prop="sampleLengthShort" width="100" show-overflow-tooltip />
        <el-table-column label="是否为脏数据（可编辑）" align="center" prop="dirtyData" width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="!scope.row.drawerEditDirtyData" @click="drawerEditFn(scope.row, 'dirtyData')">{{
              scope.row.dirtyData }}</span>
            <el-select v-else v-model="scope.row.dirtyDataEditMsg" placeholder="全部"
              @change="drawerEditBlurFn(scope.row, 'dirtyData')">
              <el-option v-for="item in dirtyDataList" :key="item.value" :label="item.label" :value="item.label">
              </el-option>
            </el-select>
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
        <!-- <el-table-column label="是否包含特征" align="center" prop="featureData" width="100" show-overflow-tooltip />
        <el-table-column label="数据特征" align="center" min-width="150" prop="dataFeature" show-overflow-tooltip /> -->
        <!-- <el-table-column label="是否添加为匹配策略" align="center" min-width="150" prop="isMatchStrategy"
          show-overflow-tooltip /> -->
      </el-table>

      <!-- 新增分页组件 -->
      <Pagination v-show="drawerTotal > 0" :total="drawerTotal" :page.sync="drawerQueryParams.pageNum"
        :limit.sync="drawerQueryParams.pageSize" @pagination="handleDrawerPagination" style="margin-top: 15px;" />
    </el-drawer>
  </div>
</template>
<script>
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {
  getAllProxys, getTableListByProxysId, getAllFieldListByTableIdAndDatabaseId,
  getSelectTableNames, callAIPaddingComments, updateDataQualityAssessment, updateFieldListByFieldId,
  callAIPaddingCommentsByAll, updateDataQualityAssessmentByAll, propertyCatalogueExport
} from "@/api/system/protectCategory";
import { tree } from "d3";
export default {
  name: "assetCatalog",
  components: {},
  data() {
    return {
      drawerShow: false,
      drawerTitle: '',
      drawerData: [],
      overflowStatus: {}, // 用于存储每个盒子的溢出状态
      dirtyDataEditMsg: '',
      filterText: '',// 过滤条件tree
      Loading: false,// 全局loading
      loading: false,
      total: 10,
      tableNameList: [],
      filedRowData: {},// 字段信息用来记录目录的rowdata
      dataAll: [
      ],
      dirtyDataList: [
        {
          label: '是',
          value: 1,
        },
        {
          label: '否',
          value: 0,
        }
      ],
      categoryList: [],
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
      // 抽屉筛选参数
      drawerQueryParams: {
        fieldName: '',
        dirtyData: '',
        sampleFeature: '',
        fieldType: '',
        oldFieldRemark: '',
        pageNum: 1,
        pageSize: 10
      },
      filteredDrawerData: [],
      drawerTotal: 0,
      defaultProps: {
        children: "children",
        label: "label"
      },
      tableKey: 0,
      editMsg: '',
      scrollTop: '',
      scrollLeft: '',

      // 新增：树复选框相关状态
      isTreeAllChecked: false, // 全选框的勾选状态（双向绑定）
      selectedTreeNodeIds: [], // 存储所有勾选的节点ID（用于导出和状态判断）
      defaultCheckedKeys: [], // 树初始化时默认勾选的节点ID（可空）
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    // 监听“全选框状态”变化，同步树的勾选状态（避免手动勾选节点后全选框状态不一致）
    isTreeAllChecked(newVal) {
      const treeRef = this.$refs.tree;
      if (!treeRef) return;

      if (newVal) {
        // 全选：勾选所有树节点
        const allNodeIds = this.getAllTreeIds(this.categoryList); // 递归获取所有节点ID
        treeRef.setCheckedKeys(allNodeIds);
        this.selectedTreeNodeIds = allNodeIds;
      } else {
        // 取消全选：清空所有勾选
        treeRef.setCheckedKeys([]);
        this.selectedTreeNodeIds = [];
      }
    },

    // 监听“选中节点ID数组”变化，同步全选框状态
    selectedTreeNodeIds(newVal) {
      const allNodeIds = this.getAllTreeIds(this.categoryList);
      // 当所有节点都被勾选时，全选框自动勾选；否则取消
      this.isTreeAllChecked = newVal.length === allNodeIds.length && allNodeIds.length > 0;
    }
  },
  created() {
    this.getProtectCategory()
  },
  mounted() {
  },
  methods: {
    /**
     * 新增：递归获取所有树节点的ID（适配 DataSource → Database 二级结构）
     * @param {Array} treeData - 树数据源（categoryList）
     * @returns {Array} 所有节点的ID数组
     */
    getAllTreeIds(treeData) {
      let ids = [];
      treeData.forEach(node => {
        ids.push(node.id);
        // 若节点有子节点（如 DataSource01 下的 CoreDatabase），递归获取子节点ID
        if (node.children && node.children.length > 0) {
          ids = [...ids, ...this.getAllTreeIds(node.children)];
        }
      });
      return ids;
    },


    /**
     * 新增：全选框点击事件（与 watch 配合确保状态同步）
     * @param {Boolean} checked - 全选框的新状态
     */
    handleTreeAllCheck(checked) {
      this.isTreeAllChecked = checked;
      if (checked) {
        const allChildren = this.collectAllChildren(this.categoryList);
        this.getList(allChildren)
      }else{
        this.getList([])
      }
      // 全选状态变更后调用getList方法
    },
    /**
     * 新增：树节点复选框状态变更事件（勾选/取消勾选时触发）
     * @param {Object} currentNode - 当前操作的节点
     * @param {Array} selectedNodes - 所有已勾选的节点数组
     */
    handleTreeCheck(currentNode, selectedNodes) {
      // 同步“选中节点ID数组”（从选中节点数组中提取ID）
      console.log('selectedNodes', selectedNodes);
      // 恢复这行代码，确保选中节点ID被正确存储

      // 获取完整的选中节点数据
      const checkedNodeData = this.getCheckedNodeData(selectedNodes.checkedNodes);
      console.log('完整的选中节点数据:', checkedNodeData);
      this.selectedTreeNodeIds = checkedNodeData
      // 可以根据需要在这里使用完整的选中节点数据
      // 例如将其保存到组件的某个属性中供其他地方使用
      // this.checkedNodeData = checkedNodeData;

      // 节点勾选状态变更后调用getList方法
      this.getList(checkedNodeData);
    },

    /**
     * 新增：导出选中的树节点数据（按图片层级格式化为 DataSource → Databases）
     */
    handleTreeExport() {
      if (this.selectedTreeNodeIds.length === 0) {
        this.$message.warning("请先勾选要导出的节点");
        return;
      }

      this.loading = true;
      // 构造请求参数
      const params = {
        tableNam: this.queryParams.tableName,
        paddingstatus: this.queryParams.paddingStatus,
        featureExtractionstatus: this.queryParams.featureExtractionStatus,
        databaseList: this.selectedTreeNodeIds,
      };

      // 调用导出接口，注意需要指定responseType为blob
      propertyCatalogueExport(params)
        .then(res => {
          this.loading = false;

          // 处理文件流
          const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          // 创建一个URL对象
          const url = window.URL.createObjectURL(blob);
          // 创建一个a标签并设置href属性
          const link = document.createElement('a');
          link.href = url;
          link.download = '资产目录.xlsx'; // 设置下载后的文件名
          // 将a标签添加到DOM中
          document.body.appendChild(link);
          // 触发点击事件
          link.click();
          // 移除a标签
          document.body.removeChild(link);
          // 释放URL对象
          window.URL.revokeObjectURL(url);
          this.loading = false;
          this.$message.success('导出成功');
        })
        .catch(error => {
          this.loading = false;
          this.$message.error('导出失败: ' + (error.message || '未知错误'));
        });
    },

    /**
     * 工具方法：根据选中的ID数组，筛选出对应的节点完整数据
     * @param {Array} treeData - 树数据源
     * @param {Array} checkedIds - 选中的节点ID数组
     * @returns {Array} 选中节点的完整数据
     */
    getCheckedNodeData(checkedIds) {
      let checkedNodes = [];
      checkedIds.forEach(node => {
        if (node.children) {
          node.children.forEach(child => {
            checkedNodes.push(child);
          })
        } else {
          checkedNodes.push(node);
        }
        // 递归处理子节点
        // if (node.children && node.children.length > 0) {
        //   checkedNodes = [...checkedNodes, ...this.getCheckedNodeData(node.children, checkedIds)];
        // }
      });
      console.log('checkedNodes', checkedNodes);
      return checkedNodes;
    },

    /**
     * 工具方法：格式化导出数据（按图片层级分组，如 DataSource01 → [CoreDatabase, UserDatabase]）
     * @param {Array} selectedNodes - 选中节点的完整数据
     * @returns {Array} 格式化后的导出数据
     */
    formatExportData(selectedNodes) {
      // 1. 筛选顶级节点（图片中的 DataSource01、DataSource02，特征：无 parentId）
      const topNodes = selectedNodes.filter(node => !node.parentId);
      // 2. 为每个顶级节点匹配其子节点（图片中的 CoreDatabase 等，特征：parentId = 顶级节点ID）
      return topNodes.map(topNode => ({
        数据源名称: topNode.label, // 如 "DataSource01"
        数据源ID: topNode.id,
        包含数据库: selectedNodes
          .filter(node => node.parentId === topNode.id)
          .map(dbNode => ({
            数据库名称: dbNode.label, // 如 "CoreDatabase"
            数据库ID: dbNode.id
          }))
      }));
    },

    //一键填充
    allFill() {
      this.$confirm('确定执行一键填充操作？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        // 用户点击确定按钮，执行相关操作
        .then(() => {
          this.loading = true
          let params = {
            proxysId: this.treeID,
            databaseName: this.databaseName,
          }
          callAIPaddingCommentsByAll(params).then(res => {
            // 获取已选节点数据并传入
            const checkedNodeData = this.getCheckedNodeData(this.selectedTreeNodeIds);
            this.getList(checkedNodeData)
            this.$message.success(`填充成功`)
            this.loading = false
          })
            .catch(() => {
              this.loading = false
            });
        }).catch(() => {
          // 用户点击了取消按钮，不做任何操作
        });
    },
    //一键评估
    allAssess() {
      this.$confirm('确定执行一键评估操作？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        // 用户点击确定按钮，执行相关操作
        .then(() => {
          this.loading = true
          let params = {
            proxysId: this.treeID,
            databaseName: this.databaseName,
          }
          updateDataQualityAssessmentByAll(params).then(res => {
            // 获取已选节点数据并传入
            const checkedNodeData = this.getCheckedNodeData(this.selectedTreeNodeIds);
            this.getList(checkedNodeData)
            this.$message.success(`评估成功`)
            this.loading = false
          })
            .catch(() => {
              this.loading = false
            });
        }).catch(() => {
          // 用户点击了取消按钮，不做任何操作
        });
    },
    checkOverflow(item, index) {
      // 检查 ref 是否存在，避免访问 undefined 的属性
      const containerRef = this.$refs[`container-${index}`];
      if (!containerRef || !containerRef[0]) {
        this.$set(this.overflowStatus, index, false);
        return;
      }
      const container = containerRef[0];
      const isOverflowing = container.scrollWidth > container.clientWidth;
      this.$set(this.overflowStatus, index, isOverflowing);
    },
    isOverflow(index) {
      return this.overflowStatus[index] || false; // 返回当前盒子的溢出状态
    },
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
          // 获取已选节点数据并传入
          const checkedNodeData = this.getCheckedNodeData(this.selectedTreeNodeIds);
          this.getList(checkedNodeData)
          this.loading = false
          this.$message.success(`填充成功`)
        }
      }).catch(err => {
        this.loading = false
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
          // 获取已选节点数据并传入
          const checkedNodeData = this.getCheckedNodeData(this.selectedTreeNodeIds);
          this.getList(checkedNodeData)
          this.loading = false
          this.$message.success(`评估完成`)
        }
      })
        .catch(err => {
          this.loading = false
        })
    },
    drawerEditFn(row, flag) {
      const tableBody = this.$refs.tableRef.$el.querySelector('.el-table__body-wrapper');
      let scrollTop = tableBody.scrollTop;
      let scrollLeft = tableBody.scrollLeft;
      this.tableKey += 1
      // 数据更新后恢复滚动位置
      this.$nextTick(() => {
        setTimeout(() => {
          const tableBody = this.$refs.tableRef.$el.querySelector('.el-table__body-wrapper');
          tableBody.scrollTo({
            top: scrollTop,
            left: scrollLeft,
            behavior: 'smooth'
          });
        }, 0);
      });
      if (flag == 'aiFieldRemark') {
        row.drawerEdit = true
        this.editMsg = row.aiFieldRemark
        this.$nextTick(() => {
          document.getElementById('editInput').focus();
        })
      } else {
        row.drawerEditDirtyData = true
        row.dirtyDataEditMsg = row.dirtyData
      }
    },
    async drawerEditBlurFn(row) {
      let params = {
        craftRemark: this.editMsg || row.aiFieldRemark,
        dirtyData: row.dirtyDataEditMsg || row.dirtyData,
        fieldId: row.fieldId,
      }
      await updateFieldListByFieldId(params).then(res => {
        this.$message({
          type: 'success',
          message: '修改成功!'
        });
        row.drawerEdit = false
        row.dirtyDataEditMsg = ''
        this.editMsg = ''
        this.tableKey += 1
      })
      this.fieldInformationFn(this.filedRowData)
      return
      // this.$confirm('是否保存编辑数据?', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(async () => {
      //   row.aiFieldRemark = this.editMsg
      //   let params = {
      //     craftRemark: this.editMsg,
      //     dirtyData: row.dirtyData,
      //     fieldId: row.fieldId,
      //   }
      //   await updateFieldListByFieldId(params).then(res => {
      //     this.$message({
      //       type: 'success',
      //       message: '修改成功!'
      //     });
      //     row.drawerEdit = false
      //     this.tableKey = 0
      //   })
      //   this.$nextTick(() => {
      //     row.drawerEdit = false
      //     this.tableKey = 0
      //   })
      // }).catch(() => {
      //   this.$message({
      //     type: 'info',
      //     message: '已取消'
      //   });
      //   row.drawerEdit = false
      //   this.tableKey += 1
      // });
    },
    // 字段信息
    async fieldInformationFn(row) {
      this.filedRowData = row
      this.drawerTitle = '表名称：' + row.tableName
      let params = {
        tableId: row.tableId,
        databaseId: row.databaseId,
      }
      getAllFieldListByTableIdAndDatabaseId(params).then(res => {
        if (res.code == 200) {
          // 处理原始数据，补充必要字段
          this.drawerData = res.data.map(ele => {
            if (ele.data) {
              ele.sampleList = JSON.parse(ele.data).map(item => ({ value: item }))
            }
            ele.drawerEdit = false
            ele.drawerEditDirtyData = false
            ele.aiFieldRemarkEdit = ''
            ele.dirtyDataEditMsg = ''
            // 确保状态字段有默认值
            ele.dirtyData = ele.dirtyData || '否'
            ele.featureData = ele.featureData || '不包含'
            return ele
          })
          this.drawerShow = true
          // 初始化筛选
          this.handleDrawerSearch()
        }
      })
    },
    // 抽屉筛选处理
    handleDrawerSearch() {
      // 重置页码
      this.drawerQueryParams.pageNum = 1
      // 执行筛选
      let filtered = this.drawerData.filter(item => {
        // 字段名称筛选
        const matchField = !this.drawerQueryParams.fieldName ||
          (item.fieldName && item.fieldName.includes(this.drawerQueryParams.fieldName))

        // 字段类型筛选
        const matchType = !this.drawerQueryParams.fieldType ||
          (item.fieldType && item.fieldType.includes(this.drawerQueryParams.fieldType))

        // 字段注释筛选
        const matchRemark = !this.drawerQueryParams.oldFieldRemark ||
          (item.oldFieldRemark && item.oldFieldRemark.includes(this.drawerQueryParams.oldFieldRemark))

        return matchField && matchType && matchRemark
      })

      // 计算总条数和分页数据
      this.drawerTotal = filtered.length
      this.filteredDrawerData = this.getPagedData(filtered)
    },
    // 分页处理
    getPagedData(data) {
      const start = (this.drawerQueryParams.pageNum - 1) * this.drawerQueryParams.pageSize
      const end = start + this.drawerQueryParams.pageSize
      return data.slice(start, end)
    },
    // 分页切换
    handleDrawerPagination() {
      this.filteredDrawerData = this.getPagedData(
        this.drawerData.filter(item => {
          const matchField = !this.drawerQueryParams.fieldName ||
            (item.fieldName && item.fieldName.includes(this.drawerQueryParams.fieldName))

          // 字段类型筛选
          const matchType = !this.drawerQueryParams.fieldType ||
            (item.fieldType && item.fieldType.includes(this.drawerQueryParams.fieldType))

          // 字段注释筛选
          const matchRemark = !this.drawerQueryParams.oldFieldRemark ||
            (item.oldFieldRemark && item.oldFieldRemark.includes(this.drawerQueryParams.oldFieldRemark))

          return matchField && matchType && matchRemark
        })
      )
    },
    // 重置筛选条件
    resetDrawerSearch() {
      // 先手动重置筛选参数
      this.drawerQueryParams = {
        fieldName: '',
        fieldType: '',
        oldFieldRemark: '',
        pageNum: 1,
        pageSize: 10
      };
      // 再调用表单重置方法（双重保障）
      if (this.$refs.drawerQueryForm) {
        this.$refs.drawerQueryForm.resetFields();
      }
      // 重新执行筛选
      this.handleDrawerSearch();
    },
    // 树节点过滤方法
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 左侧树点击事件
    // handleNodeClick(data) {
    //   console.log(data);
    //   if (data.parentId) {
    //     this.databaseName = data.label
    //     this.treeID = data.parentId;
    //   } else {
    //     this.treeID = data.id;
    //     this.databaseName = ''
    //   }
    //   this.queryParams.tableName = ''
    //   this.queryParams.paddingStatus = ''
    //   this.queryParams.featureExtractionStatus = ''
    //   this.isChildrenNode = data.nodeLayerIndex
    //   this.handleQuery();
    //   this.getSelectTableNamesFn()
    // },
    // 定时器，防抖使用
    inputSearch(data) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleQuery()
      }, 500); // 设置防抖的时间间隔为300毫秒
    },
    selectProjectIdChange(val) {
      console.log('val', val);
      console.log('queryParams', this.queryParams);
      this.handleQuery()
    },
    // 左侧树数据
    getProtectCategory() {
      this.treeLoading = true;
      this.Loading = true;
      getAllProxys().then((resp) => {
        if (resp.data.length === 0) {
          this.Loading = false;
        } else {
          this.categoryList = resp.data;
          this.treeID = resp.data[0].id;
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey(this.treeID);
            // 页面初次加载时全选所有节点
            this.isTreeAllChecked = true;

            // 示例：获取所有children并打印（可根据需要调整调用时机）
            const allChildren = this.collectAllChildren(this.categoryList);
            console.log('所有children节点数组：', allChildren);
            this.getList(allChildren);
          });
        }
        this.treeLoading = false;
        this.getSelectTableNamesFn();
      });
    },
    /**
 * 收集所有树节点的children，构建成指定结构数组
 * @param {Array} treeData - 树数据源
 * @returns {Array} 包含所有children节点的label和parentId的数组
 */
    collectAllChildren(treeData) {
      const result = [];
      const traverse = (nodes) => {
        nodes.forEach(node => {
          // 如果当前节点有children，处理每个child
          if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
              // 构建目标结构并添加到结果数组
              result.push({
                label: child.label,
                parentId: node.id // parentId为当前节点的id
              });
              // 递归处理子节点的children（如果有多层嵌套）
              if (child.children && child.children.length > 0) {
                traverse([child]);
              }
            });
          }
        });
      };
      // 开始遍历整棵树
      traverse(treeData);
      return result;
    },
    // 请求列表数据
    getList(treeNode) {
      this.loading = true;
      let params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
      }
      const response = {
        tableNam: this.queryParams.tableName,
        paddingstatus: this.queryParams.paddingStatus,
        featureExtractionstatus: this.queryParams.featureExtractionStatus,
        databaseList: treeNode,
      }
      getTableListByProxysId(params, response).then((response) => {
        this.dataAll = response.data?.rows || [];
        this.dataAll.forEach(ele => {
          ele.isShowTooltip = true
        })
        this.total = response.data?.total || 0;
        this.overflowStatus = {}
        this.Loading = false
        this.loading = false
        document.getElementById('main_box').scrollTop = 0;
        this.$nextTick(() => {
          this.dataAll.forEach((ele, index) => {
            this.checkOverflow(ele, index)
          })
        })
      });
    },
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
      // 获取已选节点数据并传入
      const checkedNodeData = this.getCheckedNodeData(this.selectedTreeNodeIds);
      this.getList(checkedNodeData);
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
.el-drawer__wrapper /deep/ .el-drawer__body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.el-drawer__wrapper /deep/ .el-drawer__body::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.el-drawer__wrapper /deep/ .el-drawer__body::-webkit-scrollbar-track {
  border-radius: 10px;
}

.el-drawer__wrapper /deep/.el-drawer__body {
  padding: 0 20px 10px 20px;
}

.mian_box_item {
  margin-top: 15px;
  margin-right: 10px;
  margin-left: 10px;
}

.mian_box_item /deep/ .el-card {
  box-shadow: none;
}

.addMsg /deep/ .el-input--medium {
  width: 237px;
}

.paginationClass {
  position: absolute;
  bottom: -3%;
  right: 0;
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
  /* border: 7px solid #f7f7f7; */
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
  width: 23%;
  margin: 10px 5px 10px 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.treeBox::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.treeBox::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.treeBox::-webkit-scrollbar-track {
  border-radius: 10px;
}

.status-tag {
  border-radius: 50px;
  font-size: 10px;
  height: 20px;
  line-height: 20px;
}

/deep/.el-drawer__header {
  padding-bottom: 20px;
  margin-bottom: 0;
  background-color: rgb(230, 242, 255);
}

/deep/.el-drawer__header> :first-child {
  font-size: 18px;
  color: black;
  font-weight: bold;
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

/* 新增：树操作栏（全选框+导出按钮）样式 */
.tree-operation-bar {
  padding: 0 3px;
  /* 与输入框、树组件保持一致的内边距 */
}

/* 优化：树复选框与文字的间距（避免拥挤） */
.treeBox /deep/ .el-tree-node__content .el-checkbox {
  margin-right: 7px;
}

.table-info-card {
  background-color: #fff;
  /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); */
  /* padding: 20px; */
  font-family: "Microsoft YaHei", sans-serif;
  border: 0.5px solid #e6e8ee;
  border-radius: 15px;
  margin-bottom: 50px;
  overflow: hidden;
  /* 新增：添加最大宽度和水平滚动 */
  max-width: 100%;
  overflow-x: auto;
}

/* 头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f9fafd;

}

.table-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.field-info-btn {
  display: flex;
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.field-info-btn .icon {
  margin-right: 6px;
}

/* 内容区域样式 */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  /* 新增：确保内容区域有足够空间 */
  min-width: 0;
}

.row {
  display: flex;
  gap: 20px;
  /* 新增：确保行内容不会压缩列 */
  flex-wrap: nowrap;
}

/* 第一行列样式 */
.row-1 .col {
  flex: 1;
  background-color: #fff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 0.5px solid #e6e8ee;
  border-radius: 10px;
  /* 新增：限制列的最小宽度，防止过窄 */
  min-width: 230px;
}

.row-1 .label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 6px;
}

.row-1 .label,
.value,
.row-2 .label,
.value,
.row-3 .label,
.value {
  font-weight: 600;

}

.row-1 .value {
  font-size: 16px;
  color: #333;
  padding: 10px 0;
  /* 添加单行显示和省略号样式 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.row-1 .info-icon,
.row-1 .db-icon,
.row-1 .list-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 16px;
  height: 16px;
}

.row-1 .rating-star {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 16px;
  height: 16px;
}

.progress-bar {
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #ff9f43;
  border-radius: 2px;
}

/* 第二、三行列样式 */
.row-2 .col,
.row-3 .col {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  padding: 12px;
  border: 0.5px solid #e6e8ee;
  border-radius: 10px;
  /* 新增：限制列的最小宽度，防止过窄 */
  min-width: 147px;
}

.row-2 .label,
.row-3 .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.row-2 .value,
.row-3 .value {
  font-size: 14px;
  color: #333;
  padding: 5px 0;
  /* 添加单行显示和省略号样式 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.row-3 .green {
  color: #67c23a;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-tag .status-icon {
  margin-right: 4px;
}

.status-tag.gray {
  background-color: #e4e7ed;
  color: #909399;
}

.status-tag.red {
  background-color: #ffe3e3;
  color: #f56c6c;
}

/* 调整滚动条样式，提升用户体验 */
.table-info-card::-webkit-scrollbar {
  height: 6px;
}

.table-info-card::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.table-info-card::-webkit-scrollbar-track {
  border-radius: 10px;
}
</style>