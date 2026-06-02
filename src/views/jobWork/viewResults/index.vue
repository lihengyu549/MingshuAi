<template>
  <div class="app-container view-results-page" v-loading="loading">
    <el-row :gutter="20" class="page-layout">
      <el-col :span="5" :xs="24">
        <el-card class="left-card" shadow="never">
          <div class="head-container">
            <el-input v-model="treeFilterText" clearable placeholder="搜索左侧节点">
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
          </div>
          <div class="head-container tree-container" v-loading="treeLoading">
            <el-tree class="treeBox" :data="treeList" :props="defaultProps" :current-node-key="treeID"
              :expand-on-click-node="false" :filter-node-method="filterNode" ref="resultTree" node-key="id"
              highlight-current @node-click="handleTreeNodeClick">
              <span class="custom-tree-node" slot-scope="{ node, data }"
                style="display: flex; justify-content: space-between; align-items: center; flex: 1; min-width: 0; padding-right: 8px;">
                <span style="display: flex; align-items: center; min-width: 0;">
                  <!-- 呼吸灯动效 (非根节点且当前用户为该节点负责人时展示) -->
                  <span v-if="node.level > 1 && isCurrentUserOwner(data.dataOwner)" class="breathing-light"
                    style="margin-right: 6px;"></span>

                  <!-- 根节点图标 -->
                  <template v-if="node.level === 1">
                    <i v-if="data.treeType == '0'" class="el-icon-circle-plus"
                      style="margin-right: 5px; color: #409EFF; font-size: 16px;"></i>
                    <i v-else-if="data.treeType == '1'" class="el-icon-success"
                      style="margin-right: 5px; color: #409EFF; font-size: 16px;"></i>
                    <i v-else-if="data.treeType == '2'" class="el-icon-error"
                      style="margin-right: 5px; color: #409EFF; font-size: 16px;"></i>
                  </template>
                  <!-- 非根节点图标 -->
                  <template v-else>
                    <svg-icon :icon-class="node.expanded ? 'openFile' : 'closeFile'"
                      style="margin-right: 5px; font-size: 16px; color: #909399;" />
                  </template>

                  <span class="node-label" :title="node.label"
                    style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; color: #303133;">{{
                      node.label
                    }}</span>
                  <span style="color: #909399; margin-left: 5px; font-size: 14px; flex-shrink: 0;">({{ data.fieldCount
                    || 0 }})</span>
                </span>
                <div style="display: flex; align-items: center; flex-shrink: 0;">
                  <span v-if="node.level > 1"
                    style="color: #909399; font-size: 12px; margin-left: 10px; flex-shrink: 0; background-color: #f4f4f5; padding: 2px 6px; border-radius: 4px;">
                    L{{ node.level - 1 }}
                  </span>
                  <!-- <span v-if="treeList.length > 0 && data.id === treeList[0].id" class="expand-all-btn"
                    @click.stop="handleExpandAll(node, data)">
                    <svg-icon icon-class="全部展开" style="font-size: 14px;" />
                  </span> -->
                </div>
              </span>
            </el-tree>
          </div>
        </el-card>
      </el-col>
      <el-col :span="19" :xs="24">
        <el-collapse-transition>
          <div v-show="showSearch" class="search-wrapper">
            <el-card class="searchCard" shadow="never">
              <el-form :model="queryParams" ref="queryParams" class="yuanDataClass" size="small" :inline="true">
                <template v-if="isFileSource">
                  <el-form-item :label="$t('viewResults.search.fileName')" prop="fileName">
                    <el-input v-model="queryParams.fileName" @input="inputSearch"
                      :placeholder="$t('viewResults.search.enterFileName')" clearable
                      @keyup.enter.native="handleQuery" />
                  </el-form-item>
                </template>
                <template v-else>
                  <el-form-item :label="$t('viewResults.search.fieldName')" prop="fieldName">
                    <el-input v-model="queryParams.fieldName" @input="inputSearch"
                      :placeholder="$t('viewResults.search.enterFieldName')" clearable
                      @keyup.enter.native="handleQuery" />
                  </el-form-item>
                </template>
                <el-form-item :label="$t('viewResults.search.category')" prop="categoryId">
                  <el-select ref="addSelectRef" v-model="addNodeName" :filter-method="filterCategoryTree">
                    <el-option style="height: 100%; padding: 0" value="">
                      <el-tree :data="categoryList" :props="defaultProps" show-checkbox :expand-on-click-node="true"
                        :filter-node-method="filterNode" ref="treeSelectQuery" node-key="id" highlight-current
                        @check="addHandleNodeCheck" />
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('viewResults.search.classificationStatus')" class="addSelectClass"
                  prop="classificationStateIds">
                  <el-select v-model="queryParams.classificationStateIds" multiple @change="inputSearch"
                    :placeholder="$t('pleaseSelect')">
                    <el-option v-for="item in dict.type.sys_classification_state" :key="item.value" :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('viewResults.search.securityLevel')" prop="securityLevel">
                  <el-select clearable v-model="queryParams.securityLevel" multiple @change="inputSearch"
                    :placeholder="$t('pleaseSelect')">
                    <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('viewResults.search.confirmStatus')" prop="confirm">
                  <el-select clearable v-model="queryParams.confirm" @change="inputSearch"
                    :placeholder="$t('pleaseSelect')">
                    <el-option v-for="item in confirmList" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <template v-if="isFileSource">
                  <el-form-item :label="$t('viewResults.search.folder')" prop="filePath">
                    <el-input v-model="queryParams.fileParentPath" @input="inputSearch"
                      :placeholder="$t('viewResults.search.enterFolder')" clearable
                      el-ineyup.enter.native="handleQuery" />
                  </el-form-item>
                </template>
                <template v-else>
                  <el-form-item :label="$t('viewResults.search.database')" prop="databaseName">
                    <el-select clearable v-model="queryParams.databaseName" @change="databaseNameFn"
                      :placeholder="$t('pleaseSelect')">
                      <el-option v-for="item in surfaceList" :key="item" :label="item" :value="item">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item :label="$t('viewResults.search.table')" prop="tableName">
                    <el-select clearable v-model="queryParams.tableName" filterable
                      :disabled="!queryParams.databaseName" @change="inputSearch" :placeholder="$t('all')">
                      <el-option v-for="item in tableList" :key="item.id" :label="item.tableName"
                        :value="item.tableName">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </template>
                <el-form-item :label="$t('viewResults.search.classificationReason')" prop="classificationReasons">
                  <el-select clearable v-model="queryParams.classificationReasons" @change="inputSearch"
                    :placeholder="$t('pleaseSelect')">
                    <template v-if="isFileSource">
                      <el-option v-for="item in dict.type.sys_classification_reasons_un" :key="item.value"
                        :label="item.label" :value="item.value">
                      </el-option>
                    </template>
                    <template v-else>
                      <el-option v-for="item in dict.type.sys_classification_reasons" :key="item.value"
                        :label="item.label" :value="item.value">
                      </el-option>
                    </template>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('viewResults.search.confidenceLevel')" prop="confidenceLevel">
                  <el-select clearable v-model="queryParams.confidenceLevel" @change="inputSearch"
                    :placeholder="$t('pleaseSelect')">
                    <el-option v-for="item in confidenceLevelList" :key="item.value" :label="item.name"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <template v-if="!isFileSource">
                  <el-form-item :label="$t('viewResults.search.piiReview')" prop="piiDetection">
                    <el-select ref="addSelectRef" v-model="piiNodeName">
                      <el-option style="height: 100%; padding: 0" value="">
                        <el-tree :data="piiList" :props="defaultProps" show-checkbox :expand-on-click-node="true"
                          :filter-node-method="filterNode" ref="treeSelectPii" node-key="id" highlight-current
                          @check="piiHandleNodeCheck" />
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item :label="$t('viewResults.search.sampleFeature')" prop="featureData">
                    <el-select clearable v-model="queryParams.featureData" @change="inputSearch"
                      :placeholder="$t('pleaseSelect')">
                      <el-option :label="$t('viewResults.options.yes')" value="1" />
                      <el-option :label="$t('viewResults.options.no')" value="0" />
                    </el-select>
                  </el-form-item>
                </template>
              </el-form>
            </el-card>
          </div>
        </el-collapse-transition>

        <el-card class="table-card" shadow="never">
          <div slot="header" class="table-card-header">
            <div class="content-header">
              <div class="content-header-main">
                <span class="content-title">
                  <svg-icon :icon-class="currentTreeLevel > 0 ? '表格' : '组织架构'" style="font-size: 20px;" />
                  {{ contentTitle }}
                </span>
                <div class="content-count">共 {{ total }} 条结果</div>
                <div class="content-desc">{{ contentDescription }}</div>
              </div>
            </div>
            <div v-if="showNodeOverview" class="overview-grid">
              <div v-for="item in nodeOverviewCards" :key="item.label" class="overview-item">
                <div class="overview-label">
                  <i :class="item.icon" v-if="item.icon" style="margin-right: 4px;"></i>
                  {{ item.label }}
                </div>
                <div class="overview-value" :title="item.value">
                  <el-tag v-if="item.isTag" :style="getRiskStyle(Number(item.level))" size="small">{{ item.value
                  }}</el-tag>
                  <span v-else>{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="table-card-content">
            <div class="table-toolbar">
              <div class="toolbar-group">
                <el-dropdown trigger="click">
                  <el-button type="primary" plain size="medium">{{ $t('viewResults.buttons.confirmResult') }}<i
                      class="el-icon-arrow-down el-icon--right"></i></el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="handleAdd">
                      <i class="el-icon-aim"></i> {{ $t('viewResults.buttons.confirmChecked') }}
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="handleEcelFn">
                      <i class="el-icon-more"></i> {{ $t('viewResults.buttons.confirmFiltered') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-dropdown trigger="click">
                  <el-button type="danger" plain size="medium">{{ $t('viewResults.buttons.cancelAction') }}<i
                      class="el-icon-arrow-down el-icon--right"></i></el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="handleAddFnClose">
                      <i class="el-icon-refresh-left"></i> {{ $t('viewResults.buttons.cancelChecked') }}
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="handleEcelFnClose">
                      <i class="el-icon-magic-stick"></i> {{ $t('viewResults.buttons.cancelFiltered') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-button type="primary" plain size="medium" @click="handleBatchFix">{{
                  $t('viewResults.buttons.batchEdit') }}</el-button>
              </div>
              <div class="toolbar-group toolbar-group-right">
                <el-button plain size="medium" @click="toggleFilters">
                  <i class="el-icon-s-finance"></i>
                  {{ showSearch ? '收起筛选' : '展开筛选' }}
                </el-button>
                <el-popover popper-class="popoverColumn" placement="bottom" width="150" trigger="click">
                  <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">{{
                    $t('selectAll') }}</el-checkbox>
                  <el-checkbox-group v-model="checkedColumnProps" @change="handleCheckedCitiesChange"
                    class="checkboxGroup"
                    style="display: flex;flex-direction: column;flex-wrap: nowrap;height: 180px;margin-top: 10px; overflow-y: auto;">
                    <el-checkbox style="margin-bottom: 10px;" v-for="item in setList" :label="item.prop"
                      :key="item.prop">{{
                        item.label }}</el-checkbox>
                  </el-checkbox-group>
                  <el-button size="medium" icon="el-icon-s-tools" slot="reference">{{ $t('columnSettings') }}</el-button>
                </el-popover>
                <el-button type="info" plain size="medium" @click="handleBack">{{ $t('return') }}</el-button>
              </div>
            </div>
            <el-table class="tableBox" style="flex: 1;" height="100%" v-loading="loading"
              :key="checkedColumnProps.length" :data="proxysList" @selection-change="handleSelectionChange"
              ref="tableRef">
              <el-table-column type="selection" width="60" align="center" />
              <el-table-column v-for="item in checkedColumn" :key="item.prop" :label="item.label"
                :align="item.prop === 'categoryName' ? 'left' : 'center'" :prop="item.prop" :width="item.width"
                show-overflow-tooltip>
                <template slot-scope="scope">
                  <template v-if="item.prop === (isFileSource ? 'fileName' : 'fieldName')">
                    <span @click="resultExdit(scope.row)" style="cursor: pointer; color: #409EFF;">
                      <svg-icon icon-class="text" style="font-size: 14px; margin-right: 5px;" />
                      {{ scope.row[item.prop] }}</span>
                  </template>
                  <template v-else-if="item.prop === 'securityLevelName'">
                    <el-tag :style="getRiskStyle(Number(scope.row.securityLevel))">
                      {{ scope.row.securityLevelName }}
                    </el-tag>
                  </template>
                  <template v-else-if="item.prop === 'categoryName'">
                    <el-tag
                      :type="scope.row.categoryName == $t('viewResults.options.unclassified') || scope.row.categoryName == $t('viewResults.options.noiseData') ? 'info' : 'primary'">
                      {{ scope.row.categoryName }}</el-tag>
                  </template>
                  <template v-else-if="item.prop === 'confirm'">
                    <el-tag :type="scope.row.confirm == 0 ? 'info' : 'primary'">{{ scope.row.confirm == 0 ?
                      $t('viewResults.options.confirm.unconfirmed') :
                      $t('viewResults.options.confirm.confirmed') }}</el-tag>
                  </template>
                  <template v-else-if="item.prop === 'sampleData'">
                    <el-tooltip placement="bottom" effect="light">
                      <div slot="content">
                        <el-table :data="scope.row.sampleList" height="250" border class="tableCla" style="width: 100%">
                          <el-table-column type="index" :label="$t('index')" width="50" />
                          <el-table-column prop="value" :label="$t('fieldValue')" width="100" show-overflow-tooltip>
                          </el-table-column>
                        </el-table>
                      </div>
                      <i class="el-icon-view" style="font-size: 18px; cursor: pointer;"></i>
                    </el-tooltip>
                  </template>
                  <template v-else>
                    {{ scope.row[item.prop] }}
                  </template>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
              :pageSize.sync="queryParams.pageSize" @pagination="getList" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog :title="$t('viewResults.dialog.title')" class="addMsg" :visible.sync="deleteVisible" width="700px"
      append-to-body :close-on-click-modal="false">
      <el-form v-if="deleteVisible" :model="resultForm" ref="resultForm" size="small" label-width="auto"
        label-position="top">
        <el-form-item :label="$t('viewResults.dialog.category')" class="addSelectClass">
          <el-select ref="resultSelectRef" v-model="resultFormNodeName" filterable :filter-method="handleSearch">
            <el-option style="height: 100%; padding: 0" value="">
              <el-tree :data="categoryList" :props="defaultProps" filterable :expand-on-click-node="true"
                :filter-node-method="filterNode" ref="treeSelectSec" node-key="id" highlight-current
                @node-click="resultHandleNodeClick" />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('viewResults.dialog.securityLevel')" class="addSelectClass" prop="securityLevel">
          <el-select v-model="resultForm.securityLevel" disabled :placeholder="$t('pleaseSelect')">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="推理过程" prop="reasoningProcess">
          <el-input v-model="resultForm.reasoningProcess" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }"
            maxlength="500" placeholder="请输入推理过程"></el-input>
        </el-form-item> -->
        <!-- <el-form-item label="审核建议" prop="auditRecommendation">
          <el-input v-model="resultForm.auditRecommendation" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }"
            maxlength="500" placeholder="请输入审核建议"></el-input>
        </el-form-item> -->
        <!-- <el-form-item label="置信度" prop="confidenceLevel">
          <el-select v-model="resultForm.confidenceLevel" clearable>
            <el-option v-for="item in confidenceLevelList" :key="item.id" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item> -->
        <template v-if="!isFileSource">
          <el-form-item :label="$t('viewResults.dialog.piiReview')" class="addSelectClass" prop="piiDetection">
            <el-select ref="piiSelectRef" v-model="piiNodeName">
              <el-option style="height: 100%; padding: 0" value="">
                <el-tree :data="piiList" :props="defaultProps" :expand-on-click-node="true"
                  :filter-node-method="filterNode" ref="treeSelect" node-key="id" highlight-current
                  @node-click="piiHandleNodeClick" />
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        <!-- <el-form-item label="识别方式" prop="detectionProcess">
          <el-input v-model="resultForm.detectionProcess" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }"
            maxlength="500" placeholder="请输入识别方式"></el-input>
        </el-form-item> -->
      </el-form>
      <template #footer>
        <span>
          <el-button type="primary" plain @click="updataResultFn">{{ $t('confirm') }}</el-button>
          <el-button @click="updataResultCanelFn">{{ $t('cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { selectFileResult, updateResultByFile, confirmListByFile, cancelConfirmByFile } from "@/api/system/unstructured"
import {
  listProxys, getProxys, connectTestI, delProxys, addProxys, updateProxys, importExcel, createProxys,
  startI, stopI, databaseMaskI, strategyPushI, strategyAll,
  databaseListI, confirmIds, selectResultsById, confirmList, updateFiledRule,
  cancelConfirm, cancelConfirmData, getCategoryAttachData, getStandardByProjectId, getStandardTreeByProjectId
} from "@/api/system/proxys";
import {
  treeListI, categoryImport, getAttachData, attachStatus,
  forceLogout, updataAttach, nameTesting, addData,
  getFrameworks, listTableByProject
} from "@/api/system/protectCategory"
import { getCategorySchemaLevelList } from "@/api/data"

export default {
  dicts: ['sys_classification_state', 'sys_classification_reasons', 'sys_classification_reasons_un'],
  name: "ProxysResult",
  data() {
    return {
      levelOptions: [],
      updataLoading: false,
      isIndeterminate: false,
      checkedColumnProps: [],
      checkAll: false,
      treeLoading: false,
      Loading: false,
      treeFilterText: '',
      currentTreeNode: null,
      drawerDataInfo: {},
      // classificationReasonsList: ['策略匹配', 'AI推理', '脏数据识别'],
      confidenceLevelList: [
        { name: this.$t('viewResults.options.confidence.low'), id: 1, value: "1" },
        { name: this.$t('viewResults.options.confidence.high'), id: 2, value: "2" }
      ],
      resultFormNodeName: '',
      treeID: '',
      treeList: [],
      isAllExpanded: false,
      categoryList: [],
      yuanCategoryList: [],
      addNodeName: '',
      piiNodeName: '',
      categoryListEdit: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      resultForm: {
        categoryId: '',
        securityLevel: '',
        id: '',
        piiDetection: '',
        classificationLogic: '',
        selectedIds: null,
      },
      tableData: [],
      addOptions: [
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
        },
      ],
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
      databaseTypeList: [
        { name: "MYSQL", id: 0, value: "MYSQL" },
        { name: "SQL_SERVER", id: 1, value: "SQL_SERVER" },
        { name: "TIDB", id: 2, value: "TIDB" },
        { name: "POSTGRESQL", id: 3, value: "POSTGRESQL" },
        { name: this.$t('viewResults.options.dm'), id: 4, value: "DM" },
        { name: "PolarDB For Mysql", id: 5, value: "MYSQL" }],
      maskCompleteStatus: [{
        value: 'COMPLETE',
        label: 'COMPLETE'
      }, {
        value: 'RUNNING',
        label: 'RUNNING'
      }, {
        value: 'NONE',
        label: 'NONE'
      }, {
        value: 'ERR',
        label: 'ERR'
      }
      ],
      surfaceList: [
      ],
      executeStatus: [
        {
          value: 'COMPLETE',
          label: 'PENDING'
        }, {
          value: 'RUNNING',
          label: 'RUNNING'
        }, {
          value: 'NONE',
          label: 'COMPLETE'
        }, {
          value: 'ERR',
          label: 'ERR'
        }
      ],
      formProjectListEdit: [],
      selectProjectListEdit: [{ name: this.$t('all'), id: 0 }],
      projectNameEdit: "",
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      showSucType: 0,
      // 显示搜索条件
      showSearch: false,
      // 总条数
      total: 0,
      // 数据库代理表格数据
      proxysList: [],
      // 结构化（数据库）列配置
      columnList: [
        { labelKey: "fieldName", prop: "fieldName", width: "150" },
        { labelKey: "fieldType", prop: "fieldType", width: "200" },
        { labelKey: "fieldRemark", prop: "fieldRemark", width: "150" },
        { labelKey: "aiFieldRemark", prop: "craftRemark", width: "200" },
        { labelKey: "category", prop: "categoryName" },
        { labelKey: "securityLevel", prop: "securityLevelName" },
        { labelKey: "sampleData", prop: "sampleData", width: "100" },
        { labelKey: "confirm", prop: "confirm", width: "120" },
        { labelKey: "database", prop: "databaseName", width: "150" },
        { labelKey: "table", prop: "tableName", width: "150" },
        { labelKey: "tableRemark", prop: "tableRemark", width: "200" },
        { labelKey: "aiTableRemark", prop: "tableCraftRemark", width: "200" },
        { labelKey: "classificationStatus", prop: "classificationStateName", width: "250" },
        { labelKey: "classificationReason", prop: "classificationReasons", width: "150" },
        { labelKey: "piiReview", prop: "piiDetectionName", width: "250" },
        { labelKey: "detectionProcess", prop: "detectionProcess", width: "250" },
        { labelKey: "confidenceScore", prop: "confidenceScore", width: "100" },
        { labelKey: "confidenceLevel", prop: "confidenceLevel", width: "100" },
        { labelKey: "sensitiveData", prop: "sensitiveDataName", width: "150" },
        { labelKey: "sampleFeature", prop: "regularExpression", width: "150" }
      ],
      // 非结构化（文件）列配置
      unstructuredColumnList: [
        { labelKey: "fileName", prop: "fileName", width: "200" },
        { labelKey: "fileSize", prop: "fileSizeName", width: "100" },
        { labelKey: "fileType", prop: "fileType", width: "150" },
        { labelKey: "fileContext", prop: "fileContext", width: "200" },
        { labelKey: "category", prop: "categoryName" },
        { labelKey: "securityLevel", prop: "securityLevelName" },
        { labelKey: "confirm", prop: "confirm", width: "120" },
        { labelKey: "classificationReason", prop: "classificationReasons", width: "150" },
        { labelKey: "confidenceLevel", prop: "confidenceLevel", width: "100" },
        { labelKey: "confidenceScore", prop: "confidenceScore", width: "100" },
        { labelKey: "sensitiveData", prop: "sensitiveDataName", width: "150" },
        { labelKey: "lastModifiedTime", prop: "fileModifiedTime", width: "180" },
        { labelKey: "fileUploadTime", prop: "fileUploadTime", width: "180" }
      ],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        projectId: '',
        securityLevel: [],
        confirm: '',
        databaseId: '',
        businessName: '',
        databaseName: '',
        categoryId: '',
        categoryIds: '',
        piiDetection: '',
        sourceType: ''
      },
      confirmList: [
        {
          value: '1',
          label: this.$t('viewResults.options.confirm.confirmed')
        },
        {
          value: '0',
          label: this.$t('viewResults.options.confirm.unconfirmed')
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
      piiList: [],
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
      lastQueryParams: {}
    };
  },

  created() {
    this.initDrawerData();
    this.initSearchState();
    this.initDefaultColumns();
    // 初始化的时候直接调用之前写好的mock数据填充到树形结构中
    this.getProtectCategory();
    this.fetchInitialData();
  },
  computed: {
    isFileSource() {
      return this.queryParams.sourceType === 'FILE_CATALOGUE' || this.queryParams.sourceType === 'FILE_SERVER';
    },
    // 列设置列表（根据类型返回不同列表）
    setList() {
      if (this.isFileSource) {
        return this.unstructuredColumnList.map(item => ({
          ...item,
          label: this.$t(`viewResults.columnLabels.${item.labelKey}`)
        }))
      }
      return this.columnList.map(item => ({
        ...item,
        label: this.$t(`viewResults.columnLabels.${item.labelKey}`)
      }))
    },
    // 当前选中的列
    checkedColumn() {
      return this.setList.filter(item => this.checkedColumnProps.includes(item.prop))
    },
    contentTitle() {
      const currentLabel = this.currentTreeNode?.categoryName || this.currentTreeNode?.label
      const sourceName = this.drawerDataInfo?.sourceName || this.drawerDataInfo?.tasksName
      return currentLabel || sourceName || '识别结果'
    },
    contentDescription() {
      const description = this.currentTreeNode?.categoryDescribe || ''
      if (description) return description
    },
    currentTreeLevel() {
      // 通过当前树节点的实际层级（node.level）来计算
      if (!this.currentTreeNode) return 0;
      const node = this.$refs.resultTree?.getNode(this.currentTreeNode.id);
      return node ? node.level - 1 : 0;
    },
    showNodeOverview() {
      if (!this.currentTreeNode) return false
      // 树节点如果有 showCard 标识，优先根据标识判断是否展示 overview-grid
      if (typeof this.currentTreeNode.showCard !== 'undefined') {
        return !!this.currentTreeNode.showCard
      }
      return false
    },
    nodeOverviewCards() {
      const node = this.currentTreeNode || {}

      // 根据 securityLevel 从 levelOptions 中获取 securityLevelName 和 defaultProtectMethod
      let securityLevelName = node.securityLevelName
      let suggestedProtection = ''

      if (node.securityLevel && this.levelOptions.length > 0) {
        const levelOption = this.levelOptions.find(item => Number(item.value) === Number(node.securityLevel))
        if (levelOption) {
          if (!securityLevelName) {
            securityLevelName = levelOption.label
          }
          suggestedProtection = levelOption.defaultProtectMethod
        }
      }

      return [
        {
          label: '数据所有者',
          value: node.dataOwner || '--',
          icon: 'el-icon-user-solid'
        },
        {
          label: '安全分级',
          value: securityLevelName || '--',
          icon: 'el-icon-s-order',
          isTag: !!securityLevelName,
          level: node.securityLevel || 0
        },
        {
          label: '建议防护措施',
          value: suggestedProtection || '--',
          icon: 'el-icon-s-opportunity'
        },
        {
          label: '确认防护措施',
          value: node.confirmedProtection || node.confirmedMeasures || '--',
          icon: 'el-icon-success'
        }
      ]
    }
  },
  watch: {
    treeFilterText(val) {
      if (this.$refs.resultTree) {
        this.$refs.resultTree.filter(val);
      }
    }
  },
  mounted() {

  },
  methods: {
    // 判断当前登录用户是否为该节点负责人
    isCurrentUserOwner(dataOwner) {
      if (!dataOwner) return false;
      const currentUser = this.$store.state.user.name;
      // 支持完全匹配或者包含（例如 dataOwner 是 '张华 (业务中台)'，而 currentUser 是 '张华'）
      return dataOwner.includes(currentUser);
    },

    // 初始化路由参数带来的抽屉数据
    initDrawerData() {
      const drawerData = this.$route.query?.drawerData;
      if (!drawerData) return;

      const drawerDataObj = typeof drawerData === 'string' ? JSON.parse(drawerData) : drawerData;
      this.drawerDataInfo = drawerDataObj || {};

      // 初始化 queryParams
      this.queryParams.projectId = drawerDataObj.projectId || '';
      this.queryParams.databaseId = drawerDataObj.databaseId || drawerDataObj.id || '';
      this.queryParams.sourceType = drawerDataObj.sourceType || '';

      // 处理数据库列表
      if (drawerDataObj.targetDatabase && typeof drawerDataObj.targetDatabase === 'string') {
        const cleanedDatabase = drawerDataObj.targetDatabase.replace(/,$/, '');
        this.surfaceList = cleanedDatabase ? cleanedDatabase.split(',') : [];
      }

      // 存储到sessionStorage
      if (drawerDataObj.projectId) {
        sessionStorage.setItem('projectId', String(drawerDataObj.projectId));
      }
      if (drawerDataObj.databaseId || drawerDataObj.id) {
        sessionStorage.setItem('databaseId', String(drawerDataObj.databaseId || drawerDataObj.id));
      }
    },

    // 初始化搜索状态（如果是从详情页返回）
    initSearchState() {
      if (this.$route.query.isReturn) {
        const savedState = sessionStorage.getItem('viewResults_search_state');
        if (savedState) {
          try {
            const state = JSON.parse(savedState);
            this.queryParams = { ...this.queryParams, ...state.queryParams };
            this.addNodeName = state.addNodeName || '';
            this.piiNodeName = state.piiNodeName || '';
            this.treeID = state.treeID || '';
            this.showSearch = typeof state.showSearch === 'boolean' ? state.showSearch : this.showSearch;
          } catch (e) {
            console.error('解析保存的查询条件失败:', e);
          }
        }
      } else {
        sessionStorage.removeItem('viewResults_search_state');
      }
    },

    // 初始化默认展示的列
    initDefaultColumns() {
      // 设置默认展示的列（与ProtectTableField保持一致）
      this.checkedColumnProps = this.isFileSource
        ? ['fileName', 'fileSizeName', 'fileType', 'fileContext', 'categoryName', 'securityLevelName', 'confirm']
        : ['fieldName', 'fieldType', 'fieldRemark', 'craftRemark', 'categoryName', 'securityLevelName', 'sampleData', 'confirm'];
      this.checkAll = false;
    },

    // 获取页面初始所需的数据
    fetchInitialData() {
      // 因为没有接口了，所以注释掉获取分类数据的方法
      // this.getProtectCategory();
      this.getInitialTreeData();
      this.getPiiList();
      this.getList();
      this.getListTableByProject();

      if (this.drawerDataInfo && this.drawerDataInfo.projectId) {
        this.fetchLevelOptions(this.drawerDataInfo.projectId);
      } else if (this.$route.query.drawerData && this.$route.query.drawerData.projectId) {
        this.fetchLevelOptions(this.$route.query.drawerData.projectId);
      }
    },

    // 获取左侧树初始数据
    getInitialTreeData() {
      this.treeLoading = true;
      let params = {
        databaseId: this.drawerDataInfo.databaseId || this.drawerDataInfo.id || sessionStorage.getItem('databaseId'),
        projectId: this.drawerDataInfo.projectId || sessionStorage.getItem('projectId'),
        isInner: 0
      };
      getStandardByProjectId(params).then(res => {
        this.treeLoading = false;
        if (res.code == 200 && res.data) {
          this.treeList = res.data.map(item => {
            return {
              ...item,
              label: item.categoryName || item.label || item.name,
              children: [] // 初始化空子节点数组
            }
          });
        }
      }).catch(() => {
        this.treeLoading = false;
      });
    },

    // 全部展开/收起
    handleExpandAll(node, data) {
      if (!this.isAllExpanded) {
        // 执行全部展开
        this.treeLoading = true;
        let params = {
          databaseId: this.drawerDataInfo.databaseId || this.drawerDataInfo.id || sessionStorage.getItem('databaseId'),
          projectId: this.drawerDataInfo.projectId || sessionStorage.getItem('projectId'),
          isInner: 0
        };
        getStandardTreeByProjectId(params).then(res => {
          this.treeLoading = false;
          if (res.code == 200 && res.data) {
            // 递归格式化返回的完整树结构，确保 node-key 唯一
            const generateUniqueId = () => {
              return 'node_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            };

            const formatTree = (list, parentIds = new Set()) => {
              return list.map(item => {
                let children = item.children || [];
                // 如果后端返回的数据中 id 有重复的（或者为空），前端给它分配一个唯一ID
                let nodeId = item.id;
                if (!nodeId || parentIds.has(nodeId)) {
                  nodeId = item.id ? item.id + '_' + generateUniqueId() : generateUniqueId();
                }
                parentIds.add(nodeId);

                return {
                  ...item,
                  id: nodeId, // 覆盖可能重复的id
                  label: item.categoryName || item.label || item.name,
                  children: formatTree(children, new Set(parentIds)),
                  _loaded: true
                };
              });
            };
            this.treeList = formatTree(res.data);
            this.isAllExpanded = true;

            // 展开所有节点
            this.$nextTick(() => {
              const nodesMap = this.$refs.resultTree.store.nodesMap;
              for (let key in nodesMap) {
                nodesMap[key].expanded = true;
              }
            });
          }
        }).catch(() => {
          this.treeLoading = false;
        });
      } else {
        // 执行全部收起
        this.isAllExpanded = false;
        const nodesMap = this.$refs.resultTree.store.nodesMap;
        for (let key in nodesMap) {
          // 如果想保留根节点展开，可以判断 nodesMap[key].level === 1
          nodesMap[key].expanded = false;
        }
        // 如果想让第一个根节点依然保持展开，可以单独设置
        // const rootNode = this.$refs.resultTree.getNode(this.treeList[0].id);
        // if (rootNode) rootNode.expanded = true;
      }
    },

    fetchLevelOptions(categoryId) {
      const params = {}
      if (categoryId) params.projectId = categoryId
      getCategorySchemaLevelList(params).then(res => {
        const payload = res && res.data ? res.data : res
        const list = payload.records || payload.rows || payload.list || payload || []
        this.levelOptions = list.map(it => ({
          value: it.level,
          label: it.levelName,
          defaultProtectMethod: it.defaultProtectMethod || ''
        }))
      })
    },
    // 获取风险等级颜色
    getRiskStyle(level) {
      const styles = {
        1: { color: '#16a34a', backgroundColor: '#f0fdf4', border: 'none' },
        2: { color: '#f97316', backgroundColor: '#fff7ed', border: 'none' },
        3: { color: '#c2410c', backgroundColor: '#ffedd5', border: 'none' },
        4: { color: '#dc2626', backgroundColor: '#fee2e2', border: 'none' },
        5: { color: '#991b1b', backgroundColor: '#fecaca', border: 'none' }
      };
      return styles[level] || { color: '#6b7280', backgroundColor: '#f3f4f6', border: 'none' };
    },
    // 切换筛选条件的显示/隐藏
    toggleFilters() {
      this.showSearch = !this.showSearch;
    },
    handleSearch(val) {
      this.$refs.treeSelectSec.filter(val);
    },
    handleCheckAllChange(val) {
      this.checkedColumnProps = val ? this.setList.map(item => item.prop) : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.setList.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.setList.length;
    },
    handleTreeNodeClick(node) {
      this.currentTreeNode = node
      this.treeID = node.id
      this.addNodeName = this.getNodePathLabel(node.id)
      this.queryParams.categoryId = node.id
      this.queryParams.categoryIds = this.collectTreeNodeFilterIds(node).join(',')

      // 更新右侧表格数据
      this.handleQuery()

      // 动态加载子节点
      let params = {
        databaseId: this.drawerDataInfo.databaseId || this.drawerDataInfo.id || sessionStorage.getItem('databaseId'),
        projectId: node.id,
        isInner: 1
      };

      // 记录点击前该节点的展开状态
      const treeNodeBefore = this.$refs.resultTree.getNode(node.id);
      const isExpandedBefore = treeNodeBefore ? treeNodeBefore.expanded : false;

      getStandardByProjectId(params).then(res => {
        this.$set(node, '_loaded', true);
        if (res.code == 200 && res.data && res.data.length > 0) {
          let children = res.data.map(item => {
            return {
              ...item,
              label: item.categoryName || item.label || item.name,
              children: [] // 初始化空子节点数组
            };
          });
          this.$set(node, 'children', children);

          this.$nextTick(() => {
            const treeNode = this.$refs.resultTree.getNode(node.id);
            if (treeNode) {
              // 1. 如果节点之前没有展开（首次加载），请求完毕后将其展开
              // 2. 如果节点之前已经展开（重复点击刷新），则保持展开状态（避免收起又展开）
              treeNode.expanded = true;
            }
          });
        } else {
          // 如果没有查到数据，根据 el-tree 的 expand-on-click-node 逻辑，
          // 它可能会被默认收起。如果希望即使没数据也恢复它之前的展开状态（如果它原来是展开的）：
          this.$nextTick(() => {
            const treeNode = this.$refs.resultTree.getNode(node.id);
            if (treeNode && isExpandedBefore) {
              treeNode.expanded = true;
            }
          });
        }
      });
    },
    collectTreeNodeFilterIds(node) {
      const ids = new Set()
      const walkChildren = (currentNode) => {
        if (!currentNode) return
        ids.add(currentNode.id)
        if (Array.isArray(currentNode.children)) {
          currentNode.children.forEach(child => walkChildren(child))
        }
      }
      walkChildren(node)
      this.findAllAncestors(this.treeList, node.id).forEach(id => ids.add(id))
      return Array.from(ids)
    },
    getNodePathLabel(nodeId) {
      const node = this.findNodeById(this.treeList, nodeId)
      if (!node) return ''
      const parentLabels = this.findParentLabelsById(this.treeList, nodeId)
      return parentLabels ? `${parentLabels.join('-')}-${node.categoryName || node.label}` : (node.categoryName || node.label || '')
    },
    findNodeById(tree, nodeId) {
      if (!Array.isArray(tree)) return null
      for (const node of tree) {
        if (node.id === nodeId) return node
        if (node.children && node.children.length) {
          const childNode = this.findNodeById(node.children, nodeId)
          if (childNode) return childNode
        }
      }
      return null
    },
    getListTableByProject() {
      let data = {
        databaseId: this.drawerDataInfo.databaseId || this.drawerDataInfo.id || Number(sessionStorage.getItem('databaseId')),
        databaseName: this.queryParams.databaseName
      }
      listTableByProject(data).then(res => {
        if (res.code == 200) {
          this.tableList = res.data
        }
      })
    },
    addcountInit() { },

    nameTestingFn(val) {
      this.form.sourceName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },

    businessNameFn(val) {
      this.form.businessName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    targetIpRulesFn() {

    },
    importNameTestingFn(val) {
      this.importData.sourceName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },

    handleAdd() {
      this.loading = true
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(this.$t('viewResults.buttons.confirmChecked'), this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
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
            .catch(() => {
              this.loading = false
            });
          // 接口
        }).catch(() => {
          this.loading = false
        });
      } else {
        this.$message({ message: this.$t('viewResults.messages.selectAtLeastOne'), type: 'warning' })
        this.loading = false
      }
    },
    handleAddFnClose() {
      this.loading = true
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(this.$t('viewResults.buttons.cancelChecked'), this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let data = ids.join(',')
          cancelConfirm(data).then(res => {
            if (res.code == 200) {
              this.$message({ message: res.msg, type: 'success' })
              this.getList()
              this.loading = false
            }
          })
            .catch(() => {
              this.loading = false
            });
          // 接口
        }).catch(() => {
          this.loading = false
        });
      } else {
        this.$message({ message: this.$t('viewResults.messages.selectAtLeastOne'), type: 'warning' })
        this.loading = false
      }
    },
    handleEcelFn() {
      this.loading = true
      let params = {
        ...this.queryParams,
        securityLevelIds: [...this.queryParams.securityLevel],
        securityLevel: toString(this.queryParams.securityLevel)
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
    handleBack() {
      this.$router.push({
        path: '/classificationTask/hierarchicalTask',
        query: { isReturn: true }
      });
    },
    handleEcelFnClose() {
      this.loading = true
      let params = {
        ...this.queryParams,
        securityLevelIds: [...this.queryParams.securityLevel],
        securityLevel: toString(this.queryParams.securityLevel)
      }
      cancelConfirmData(params).then(res => {
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
          }
          databaseListI(data).then((res => {
            if (res.code == 200) {
              this.targetDataList = []
              let list = res.data
              for (let i = 0; i < list.length; i++) {
                this.targetDataList.push({ id: i, value: list[i], label: list[i] })
              }
              this.targetDataList.unshift({ id: -1, value: -1, label: this.$t('all') })
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
      this.queryParams.tableName = ''
      this.inputSearch()
      this.getListTableByProject()
    },
    handleBatchFix() {
      // 使用表格ref直接获取选中的数据
      const selection = this.$refs.tableRef.selection
      // 检查是否有选中的数据
      if (!selection || selection.length === 0) {
        this.$message.warning(this.$t('viewResults.messages.batchEditSelectOne'))
        return
      }
      // 获取选中的ID数组
      const selectedIds = selection.map(row => row.id)
      // 设置到表单中
      this.resultForm.selectedIds = selectedIds

      // 为分类下拉框设置默认选中未分类id-100
      if (this.categoryList && this.categoryList.length > 0) {
        this.resultFormNodeName = this.categoryList.find(item => item.id == '-100').categoryName
      }

      // 为安全分级下拉框设置默认选中第一项
      if (this.levelOptions && this.levelOptions.length > 0) {
        this.resultForm.securityLevel = this.levelOptions[0].value;
      }

      this.deleteVisible = true
    },
    updataResultFn() {
      this.updataLoading = true
      let params = {
        reasoningProcess: this.resultForm.reasoningProcess,
        // 传递数组格式的tableFieldIds
        tableFieldIds: this.resultForm.selectedIds || [this.resultForm.tableFieldId],
        categoryId: this.resultForm.categoryId,
        securityLevel: this.resultForm.securityLevel,
        auditRecommendation: this.resultForm.auditRecommendation,
        confidenceLevel: this.resultForm.confidenceLevel,
        piiDetection: this.resultForm.piiDetection,
        detectionProcess: this.resultForm.detectionProcess,
      }
      updateFiledRule(params).then(res => {
        if (res.code == 200) {
          this.$message({
            message: res.msg,
            type: 'success'
          })
        }
        this.deleteVisible = false
        this.resultFormNodeName = ''
        this.resetForm('resultForm')
        this.resultForm.selectedIds = null
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
      this.resultForm.selectedIds = null
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
      let treeId = this.currentTreeNode ? this.currentTreeNode.id : (this.drawerDataInfo.projectId || sessionStorage.getItem('projectId'));
      let params = {
        ...this.queryParams,
        treeId: treeId,
        securityLevel: '',
        securityLevelIds: this.queryParams.securityLevel,
      }
      delete params.categoryId
      selectResultsById(params).then(response => {
        this.proxysList = response.data.rows;
        this.proxysList.forEach(ele => {
          if (ele.sampleData) {
            if (this.isFileSource) {
              try {
                const parsedData = JSON.parse(ele.sampleData);
                if (Array.isArray(parsedData)) {
                  ele.sampleList = parsedData.map(item => ({ key: Object.keys(item)[0], value: Object.values(item)[0] }));
                }
              } catch (e) {
                ele.sampleList = [];
              }
            } else {
              try {
                ele.sampleList = JSON.parse(ele.sampleData).map((item => ({ value: item })));
              } catch (e) {
                ele.sampleList = [];
              }
            }
          }
        })
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
      this.addNodeName = ''
      this.piiNodeName = ''
      this.resetForm("queryParams");
      // 重置分类树形组件的勾选状态
      if (this.$refs.treeSelectQuery) {
        // 清除所有勾选
        this.$refs.treeSelectQuery.setCheckedKeys([]);
      }
      // 重置PII树形组件的勾选状态
      if (this.$refs.treeSelectPii) {
        // 清除所有勾选
        this.$refs.treeSelectPii.setCheckedKeys([]);
      }
      if (this.queryParams.categoryIds) {
        this.queryParams.categoryIds = ''
      }
      if (this.currentTreeNode) {
        this.queryParams.categoryId = this.currentTreeNode.id
        this.queryParams.categoryIds = this.collectTreeNodeFilterIds(this.currentTreeNode).join(',')
        this.addNodeName = this.getNodePathLabel(this.currentTreeNode.id)
      }
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    resultExdit(row) {
      // 保存当前页面的查询条件和树节点状态
      const stateToSave = {
        queryParams: this.queryParams,
        addNodeName: this.addNodeName,
        piiNodeName: this.piiNodeName,
        treeID: this.treeID,
        showSearch: this.showSearch
      };
      sessionStorage.setItem('viewResults_search_state', JSON.stringify(stateToSave));

      this.$router.push({
        path: '/classificationTask/fixResults',
        query: { row: row, categoryList: this.categoryList, drawerData: this.$route.query.drawerData }
      });
    },
    addHandleNodeCheck(node, checkData) {
      // 筛选出选中的叶子节点（无children的节点）
      const checkedLeafNodes = checkData.checkedNodes.filter(item => !item.children);

      // 无选中节点或无选中子项（叶子节点），清空展示
      if (checkData.checkedKeys.length === 0 || checkedLeafNodes.length === 0) {
        this.addNodeName = '';
        this.queryParams.categoryIds = '';
        this.getList();
        return;
      }

      // 收集所有选中叶子节点对应的根节点（去重）
      const rootNodeNames = new Set();
      checkedLeafNodes.forEach(leafNode => {
        const rootNode = this.findRootNode(this.categoryList, leafNode.id);
        if (rootNode) {
          rootNodeNames.add(rootNode.categoryName); // 根节点名称
        }
      });

      // 展示根节点名称（用逗号分隔）
      this.addNodeName = Array.from(rootNodeNames).join(',');

      // 收集叶子节点及其所有祖先节点的ID
      const allCategoryIds = new Set();
      checkedLeafNodes.forEach(leafNode => {
        // 添加叶子节点自身
        allCategoryIds.add(leafNode.id);

        // 递归收集所有祖先节点（包括父节点、爷节点等）
        const ancestors = this.findAllAncestors(this.categoryList, leafNode.id);
        ancestors.forEach(ancestorId => allCategoryIds.add(ancestorId));
      });

      // 更新查询参数，包含叶子节点和所有祖先节点ID
      this.queryParams.categoryIds = Array.from(allCategoryIds).join(',');
      this.getList();
    },
    // 查找节点对应的根节点
    findRootNode(tree, nodeId) {
      // 递归查找节点本身
      const findNode = (nodes, id) => {
        for (const node of nodes) {
          if (node.id === id) {
            return node;
          }
          if (node.children && node.children.length) {
            const found = findNode(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      // 先找到当前节点
      const node = findNode(tree, nodeId);
      if (!node) return null;

      // 向上追溯到根节点（根节点的parentId为初始的projectId）
      let currentNode = node;
      while (currentNode.parentId !== this.drawerDataInfo.projectId && currentNode.parentId) {
        const parentNode = findNode(tree, currentNode.parentId);
        if (!parentNode) break; // 防止死循环
        currentNode = parentNode;
      }
      return currentNode;
    },

    // 查找节点的所有祖先节点ID（父节点、爷节点等）
    findAllAncestors(tree, nodeId) {
      const ancestors = [];

      // 递归查找节点本身
      const findNode = (nodes, id) => {
        for (const node of nodes) {
          if (node.id === id) {
            return node;
          }
          if (node.children && node.children.length) {
            const found = findNode(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      // 先找到当前节点
      const currentNode = findNode(tree, nodeId);
      if (!currentNode) return ancestors;

      // 向上追溯所有祖先节点
      let parentId = currentNode.parentId;
      while (parentId) {
        const parentNode = findNode(tree, parentId);
        if (parentNode) {
          ancestors.push(parentNode.id);
          parentId = parentNode.parentId;
        } else {
          break; // 如果找不到父节点，停止循环
        }
      }

      return ancestors;
    },
    piiHandleNodeCheck(node, checkData) {
      const parentLabels = this.findParentLabelsById(this.piiList, node.id);
      if (parentLabels) {
        this.piiNodeName = parentLabels.join('-') + '-' + node.categoryName;
      } else {
        this.piiNodeName = node.categoryName;
      }

      if (checkData.checkedKeys.length == 0) {
        this.piiNodeName = ''
      }
      let lastNodeData = checkData.checkedNodes.filter(item => !item.children)
      this.queryParams.piiDetection = lastNodeData.map(item => item.id).join()
      this.getList()
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
        getCategoryAttachData({ categoryId: node.id, piiId: this.resultForm.piiDetection }).then(res => {
          this.resultForm.securityLevel = res.data.minSecurityLevel + ''

        })
      }
    },
    piiHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
        if (parentLabels) {
          this.piiNodeName = parentLabels.join('-') + '-' + node.categoryName;
        } else {
          this.piiNodeName = node.categoryName;
        }
        this.resultForm.piiDetection = node.id
        this.$refs.piiSelectRef.blur()
        getCategoryAttachData({ piiId: node.id, categoryId: this.resultForm.categoryId }).then(res => {
          this.resultForm.securityLevel = res.data.minSecurityLevel + ''

        })
      }
    },
    filterNode(value, data, node) {
      if (!value) return true; // 无搜索值时显示所有节点

      // 1. 检查当前节点是否匹配
      const isCurrentMatch = data.label && data.label.toLowerCase().includes(value.toLowerCase());
      if (isCurrentMatch) return true;

      // 2. 检查所有父节点是否有匹配（确保子节点在父节点匹配时显示）
      let parent = node.parent;
      while (parent) {
        if (parent.data?.label && parent.data.label.toLowerCase().includes(value.toLowerCase())) {
          return true;
        }
        parent = parent.parent;
      }

      // 3. 检查所有子节点是否有匹配（确保父节点在子节点匹配时显示）
      const hasMatchingChild = (children) => {
        if (!children || !children.length) return false;
        return children.some(child => {
          // 子节点自身匹配
          if (child.label && child.label.toLowerCase().includes(value.toLowerCase())) {
            return true;
          }
          // 递归检查子节点的后代
          return hasMatchingChild(child.children);
        });
      };

      return hasMatchingChild(data.children);
    },
    filterCategoryTree(val) {
      this.$refs.treeSelectQuery.filter(val); // 触发树组件过滤
    },

    getPiiList(key) {
      this.treeLoading = true
      let data = {
        parentId: 1,
        needSub: 1,
        ifAddUnclassified: 2
      };
      treeListI(data).then((resp) => {
        this.piiList = resp.data
        this.yuanCategoryList = resp.data
        if (resp.data.length == 0) {
          this.Loading = false
        } else {
          let tempList = JSON.parse(JSON.stringify(this.piiList))
          for (let item of tempList) {
            item.label = item.categoryName
          }
          this.piiList = this.handleTree(tempList, "id")
          this.categoryListEdit = this.handleTree(tempList, "id")
        }
        this.Loading = false
        this.treeLoading = false
        this.$nextTick(() => {
          if (this.$route.query.isReturn && this.queryParams.piiDetection && this.$refs.treeSelectPii) {
            this.$refs.treeSelectPii.setCheckedKeys(this.queryParams.piiDetection.split(','));
          }
        });
      });
    },
    getProtectCategory(key) {
      this.treeLoading = true
      let data = {
        parentId: this.drawerDataInfo.projectId ? this.drawerDataInfo.projectId : Number(sessionStorage.getItem('projectId')),
        needSub: 1,
        ifAddUnclassified: 1,
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
        this.$nextTick(() => {
          if (this.$refs.resultTree) {
            const selectedId = this.treeID || this.queryParams.categoryId
            if (selectedId) {
              this.$refs.resultTree.setCurrentKey(selectedId)
              this.currentTreeNode = this.findNodeById(this.categoryList, selectedId)
            }
          }
          if (this.$route.query.isReturn && this.queryParams.categoryIds && this.$refs.treeSelectQuery) {
            this.$refs.treeSelectQuery.setCheckedKeys(this.queryParams.categoryIds.split(','));
          }
        });
      });
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
<style lang="scss" scoped>
::v-deep .el-row {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

::v-deep .el-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

::v-deep .left-card {
  border-radius: 10px;
  height: 100%;

  & .el-card__body {
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
}

::v-deep .searchCard {
  border-radius: 10px;
  margin-bottom: 16px;

  & .el-card__body {
    padding: 24px;
  }
}



.search-wrapper {
  flex-shrink: 0;
}

.head-container+.head-container {
  margin-top: 16px;
}

.tree-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.treeBox {
  height: 100%;
  overflow-y: auto;
}

.treeBox ::v-deep .el-tree-node__content {
  min-height: 32px;
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

.addMsg ::v-deep.el-form-item__content {
  padding-right: 15px;
}

.addMsg ::v-deep.el-select--medium,
.addMsg ::v-deep.el-select--small {
  width: 100%;
}

.addMsg ::v-deep.el-dialog__body {
  padding: 30px;
}

.addMsg ::v-deep .el-dialog:not(.is-fullscreen) {
  margin-top: 10% !important;
}

.addMsg ::v-deep .el-dialog__body {
  padding-bottom: 0;

}

.addMsg ::v-deep .el-dialog__footer {
  padding-bottom: 32px;

}

.addMsg ::v-deep .el-form-item__label {
  text-align: left;
}

.addMsg ::v-deep .el-select--medium {
  width: 100%;
}

.table-card {
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  ::v-deep .el-card__body {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.table-card ::v-deep .el-card__header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #ebeef5;
}

.table-card-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-header {
}

.content-header-main {
  min-width: 0;
}

.content-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.content-desc {
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
  line-height: 20px;
}

.content-count {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-group-right {
  margin-left: auto;
}

.table-card-content {
  padding: 0 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.overview-item {
  padding: 16px 18px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  min-width: 0;
}

.overview-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 15px;
  color: #303133;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tableBox {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.tableBox ::v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 10px;
}

.tableBox ::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.tableBox ::v-deep .el-table__body-wrapper::-webkit-scrollbar-track {
  border-radius: 10px;
}

.addMsg ::v-deep .el-dialog:not(.is-fullscreen) {
  margin-top: 10% !important;
}

.addMsg ::v-deep .el-dialog__body {
  padding-bottom: 0;

}

.addMsg ::v-deep .el-dialog__footer {
  padding-bottom: 32px;

}

.addMsg ::v-deep .el-form-item__label {
  text-align: left;
}

.addSelectClass ::v-deep .el-select {
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

.marking ::v-deep .el-dialog:not(.is-fullscreen) {
  margin-top: 25vh !important;
}

.getDiv {
  display: inline-block;
  margin-left: 5px;
}

.getDiv ::v-deep .el-button {
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

.yuanDataClass ::v-deep .el-form-item {
  width: 30%;
}

.yuanDataClass ::v-deep .el-form-item:nth-child(3n) {
  margin-right: 0;
}

.yuanDataClass ::v-deep .el-form-item:nth-last-child(-n+3) {
  margin-bottom: 0;
}

.yuanDataClass ::v-deep .el-form-item__label {
  width: 25%;
  white-space: nowrap;
}

.yuanDataClass ::v-deep .el-form-item__content {
  width: 75%;
}

.yuanDataClass ::v-deep .el-select {
  width: 100%;
}

.searchBtn {
  height: 100%;
}

.searchBtn ::v-deep .el-form-item__content {
  display: flex;
  justify-content: flex-end
}

.importForm ::v-deep .el-form-item--medium {
  width: 70%;

}

.importForm ::v-deep .el-form-item__content {
  width: calc(100% - 145px);
}

.uploadClass {
  width: 20% !important;
}

.addSelectClass ::v-deep .el-select {
  width: calc(100%);
}

.tableCla {
  height: 266px !important;
}

/* 呼吸灯动效 */
.breathing-light {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #409EFF;
  box-shadow: 0 0 4px #409EFF;
  animation: breathing 2s infinite ease-in-out;
}

@keyframes breathing {
  0% {
    opacity: 0.3;
    transform: scale(0.8);
    box-shadow: 0 0 2px rgba(64, 158, 255, 0.3);
  }

  50% {
    opacity: 1;
    transform: scale(1.2);
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.8);
  }

  100% {
    opacity: 0.3;
    transform: scale(0.8);
    box-shadow: 0 0 2px rgba(64, 158, 255, 0.3);
  }
}

@media screen and (max-width: 1400px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .page-layout {
    min-height: auto;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-group-right {
    margin-left: 0;
  }
}

.custom-tree-node .expand-all-btn {
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.custom-tree-node .expand-all-btn svg {
  color: #ffffff;
  transition: color 0.3s;
}

.custom-tree-node:hover .expand-all-btn svg {
  color: #9ca3af;
}

.custom-tree-node .expand-all-btn:hover svg {
  color: #3b82f6 !important;
}
</style>
