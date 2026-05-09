<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="5" :xs="24">
        <el-card class="left-card" shadow="never">
          <div class="head-container select-container">
            <span class="select-label">{{ $t('protectTableField.standardBelong') }}：</span>
            <el-select v-model="projectId" class="serachInput" @change="treeOptionsSelectChange"
              :placeholder="$t('all')" filterable>
              <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
              </el-option>
            </el-select>
          </div>
          <div class="head-container" v-loading="treeLoading">
            <div class="tree-scroll-container">
              <el-tree :data="dataCategoryList" :props="dataDefaultProps" show-checkbox :expand-on-click-node="false"
                :filter-node-method="filterNode" ref="tree" node-key="id" @check="treeCheck"
                @node-click="handleNodeClick" :highlightCurrent="isHighlight" :render-content="renderContent" />
            </div>
          </div>
        </el-card>

      </el-col>
      <el-col :span="19" :xs="24">
        <el-card class="search-card" shadow="never">
          <el-form :model="queryParams" ref="queryParams" class="yuanDataClass" size="small" :inline="true">
            <el-form-item v-if="currentNodeType !== 1" :label="$t('protectTableField.sourceBusinessSystem')"
              prop="businessName">
              <el-input v-model="queryParams.businessName" clearable @input="inputSearch"
                :placeholder="$t('protectTableField.enterSourceBusinessSystem')" @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item :label="currentNodeType === 1 ? $t('protectTableField.fileName') : $t('protectTableField.tableName')" prop="tableName">
              <el-input v-model="queryParams.tableName" clearable @input="inputSearch"
                :placeholder="currentNodeType === 1 ? $t('protectTableField.enterFileName') : $t('protectTableField.enterTableName')" @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('protectTableField.securityLevel')" prop="securityLevel">
              <el-select v-model="queryParams.securityLevel" clearable multiple @change="handleQuery"
                :placeholder="$t('all')">
                <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('protectTableField.category')" class="addSelectClass">
              <el-select ref="categorySelectRef" v-model="resultFormNodeName" @change="handleQuery" filterable
                :placeholder="$t('protectTableField.searchCategory')" :filter-method="handleCategoryFilter">
                <el-option style="height: 100%; padding: 0" value="">
                  <el-tree :data="categoryList" :props="defaultProps" show-checkbox :expand-on-click-node="true"
                    :filter-node-method="filterCategoryNode" ref="categoryTreeRef" node-key="id" highlight-current
                    @check="resultHandleNodeClick" />
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="currentNodeType !== 1" :label="$t('protectTableField.piiComplianceReview')"
              class="addSelectClass">
              <el-select ref="piiSelectRef" v-model="piiNodeName" filterable
                :placeholder="$t('protectTableField.searchPiiComplianceReview')" :filter-method="handlePiiFilter">
                <el-option style="height: 100%; padding: 0" value="">
                  <el-tree :data="piiList" :props="defaultProps" show-checkbox :expand-on-click-node="true"
                    :filter-node-method="filterPiiNode" ref="piiTreeRef" node-key="id" highlight-current
                    @check="piiHandleNodeCheck" />
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
        <div>
          <el-button type="primary" plain icon="el-icon-document" size="medium" @click="downloadFile()">{{
            $t('protectTableField.exportList') }}</el-button>
          <el-popover popper-class="popoverColumn" placement="bottom" width="150" trigger="click"
            style="float: inline-end; margin-right: 10px;">
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">{{
              $t('selectAll') }}</el-checkbox>
            <el-checkbox-group v-model="checkedColumnProps" @change="handleCheckedCitiesChange" class="checkboxGroup"
              style="display: flex;flex-direction: column;flex-wrap: nowrap;height: 180px;margin-top: 10px; overflow-y: auto;">
              <el-checkbox style="margin-bottom: 10px;" v-for="item in setList" :label="item.prop" :key="item.prop">{{
                item.label }}</el-checkbox>
            </el-checkbox-group>
            <el-button slot="reference">{{ $t('protectTableField.columnSettings') }}</el-button>
          </el-popover>
        </div>
        <el-card class="table-card" shadow="never">
          <el-table v-loading="loading" height="620px" :data="protectTableFieldList"
            @selection-change="handleSelectionChange" class="tableBox" ref="tableRef" :key="checkedColumnProps.length">
            <template slot="empty">
              <el-empty :description="$t('noData')"></el-empty>
            </template>
            <!-- <el-table-column type="selection" width="60" align="center" /> -->
            <el-table-column v-for="item in checkedColumn" :key="item.prop" :label="item.label"
              :align="item.prop === 'categoryName' ? 'left' : 'center'" :prop="item.prop" :width="item.width"
              show-overflow-tooltip>
              <template slot-scope="scope">
                <template v-if="item.prop === 'securityLevelName'">
                  <el-tag :style="getRiskStyle(Number(scope.row.securityLevel))">
                    {{ scope.row.securityLevelName }}
                  </el-tag>
                </template>
                <template v-else-if="item.prop === 'categoryName'">
                  <el-tag :type="isNeutralCategory(scope.row.categoryName) ? 'info' : 'primary'">
                    {{ scope.row.categoryName }}
                  </el-tag>
                </template>
                <template v-else-if="item.prop === 'protectMethod'">
                  <el-tag class="protect-tag" v-for="(protectItem, index) in scope.row.protectMethodNameList"
                    :key="protectItem + index" type="primary">
                    {{ protectItem }}
                  </el-tag>
                </template>
                <template v-else-if="item.prop === 'sampleData'">
                  <el-tooltip placement="bottom" effect="light">
                    <div slot="content">
                      <el-table :data="scope.row.sampleList" height="250" border class="tableCla" style="width: 100%">
                        <el-table-column type="index" :label="$t('protectTableField.columnLabels.index')" width="50" />
                        <el-table-column prop="value" :label="$t('protectTableField.columnLabels.fieldValue')"
                          width="100" show-overflow-tooltip>
                        </el-table-column>
                      </el-table>
                    </div>
                    <i class="el-icon-view"></i>
                  </el-tooltip>
                </template>
                <template v-else-if="item.prop === 'confirmName'">
                  <el-tag v-if="scope.row.confirm !== undefined && scope.row.confirm !== null" :type="scope.row.confirm == 0 ? 'info' : 'primary'">
                    {{ scope.row.confirm == 0 ? $t('protectTableField.unconfirmed') : $t('protectTableField.confirmed') }}
                  </el-tag>
                  <span v-else>{{ scope.row.confirmName }}</span>
                </template>
                <template v-else>
                  {{ scope.row[item.prop] }}
                </template>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :pageSize.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>
    </el-row>
    <el-dialog :title="$t('protectTableField.getLabelResult')" v-loading="apiDialogLoading"
      :visible.sync="apiDialogShow" width="800px" append-to-body :close-on-click-modal="true">
      <div class="apiDialogMain">
        <div class="apiDialogMain_head">
          <div>{{ $t('protectTableField.requestExample') }}：</div>
          <div><el-input type="textarea" :rows="7" readonly :placeholder="$t('protectTableField.enterContent')"
              v-model="textarea">
            </el-input></div>
        </div>
        <div class="apiDialogMain_body">
          <div>{{ $t('protectTableField.responseExample') }}：</div>
          <!-- <pre v-html="textarea2"></pre>
          <div><el-input readonly resize="none" type="textarea" :rows="16" placeholder="请输入内容" v-model="textarea2">
            </el-input></div> -->
          <vue-json-viewer preview-mode :value="textarea2" :copyable="copyableConfig">
            <template slot="copy">
              <i class="el-icon-document-copy" :title="$t('copy')" @click="mgsElemesFn"></i>
            </template>
          </vue-json-viewer>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="apiCancel">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$t('protectTableField.adjustExportColumns')" :visible.sync="exportColumnDialog.visible"
      width="760px" append-to-body :close-on-click-modal="false" custom-class="export-column-dialog-wrapper"
      @close="cancelExport">

      <div v-loading="exportColumnDialog.loading" class="export-column-dialog">
        <div class="column-options">
          <div v-for="column in exportAllColumns" :key="column.value"
            :class="['column-btn', { active: exportColumnDialog.selectedColumns.includes(column.value) }]"
            @click="toggleExportColumn(column)">
            {{ column.label }}
          </div>
        </div>

        <div class="dialog-footer-custom">
          <div class="footer-left">
            <el-checkbox v-model="exportColumnDialog.saveAsDefault">{{ $t('saveAsDefault') }}</el-checkbox>
            <a class="restore-link" @click="restoreInitialConfig"><i class="el-icon-refresh-right"></i>{{
              $t('restoreInitial') }}</a>
          </div>
          <div class="footer-right">
            <el-button @click="cancelExport">{{ $t('cancel') }}</el-button>
            <el-button type="primary" plain @click="confirmExport">{{ $t('confirm') }}</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getDatabaseList, protectTableFieldList, exportReport, getDatabaseSource, listByPublished, listFileByPublished } from "@/api/system/protectTableField";
import { getFrameworks, treeListI, } from "@/api/system/protectCategory";
import Cookies from "js-cookie";
import 'vue-json-viewer/style.css'
import { getDicts } from "@/api/system/dict/data";
import { attachStatus, forceLogout } from "@/api/system/protectTableField"; // Declare the variables here
import { getCategorySchemaLevelList } from "@/api/data";

export default {
  name: "ProtectTableField",
  components: { Treeselect },

  dicts: ['sys_export_column'],
  data() {
    return {
      levelOptions: [],
      importData: {
        importFile: '', // 导入魔板文件名
        fileList: [],//导入模板的文件数据
        categoryName: '',//框架名称
        importShow: false,
      },
      isHighlight: false,
      apiDialogLoading: false,
      apiDialogShow: false,
      debounceTimeout: null,//防抖动
      changeTimeout: null, // 用于下拉选择防抖的定时器
      treeOptions: [],
      treeLoading: false,
      treeID: '',
      textarea2: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryId: '',//左侧树id
        name: '',//子类名称
        securityLevel: [],//安全级别
        businessName: '',
        piiDetection: '',//个人信息识别
        tableName: '',//表名
      },
      projectId: '',
      apiDialogLoading: false,
      filterName: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      dataDefaultProps: {
        children: "list",
        label: "name"
      },
      Loading: false,
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
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      // 数据库字段名表格数据
      protectTableFieldList: [],
      dataCategoryList: [],
      categoryListEdit: null,
      categoryList: [],
      piiList: [],
      resultFormNodeName: '',
      piiNodeName: '',
      Token: '',
      textarea: ``,
      routeDataShow: false,
      treeIds: [],
      databaseNames: [], // 新增：存储选中的数据库名称
      currentNodeType: -1, // -1未初始化，0结构化，1非结构化
      currentNodeData: null,
      // 列设置相关数据
      isIndeterminate: false,
      checkedColumnProps: [],
      checkAll: false,
      columnList: [
        { labelKey: "fieldName", prop: "fieldName", width: "200" },
        { labelKey: "fieldRemark", prop: "fieldRemark", width: "200" },
        { labelKey: "sourceBusinessSystem", prop: "businessName", width: "150" },
        { labelKey: "dataSource", prop: "sourceName", width: "150" },
        { labelKey: "databaseName", prop: "databaseName", width: "200" },
        { labelKey: "tableName", prop: "tableName" },
        { labelKey: "category", prop: "categoryName", width: "250" },
        { labelKey: "piiComplianceReview", prop: "piiDetectionName", width: "200" },
        { labelKey: "securityLevel", prop: "securityLevelName", width: "200" },
        { labelKey: "suggestedProtection", prop: "protectMethod", width: "200" },
        { labelKey: "sample", prop: "sampleData", width: "100" }
      ],
      unstructuredColumnList: [
        { labelKey: "fileName", prop: "fileName", width: "200" },
        { labelKey: "fileFormat", prop: "fileFormat", width: "150" },
        { labelKey: "fileParentPath", prop: "fileParentPath", width: "200" },
        { labelKey: "fileSize", prop: "fileSize", width: "150" },
        { labelKey: "category", prop: "categoryName", width: "200" },
        { labelKey: "securityLevel", prop: "securityLevelName" },
        { labelKey: "confirmName", prop: "confirmName", width: "150" },
        { labelKey: "sourceBusinessSystem", prop: "businessName", width: "150" },
        { labelKey: "classificationReason", prop: "classificationReasons", width: "150" },
        { labelKey: "confidenceLevel", prop: "confidenceLevel", width: "150" },
        { labelKey: "confidenceScore", prop: "confidenceScore", width: "150" },
        { labelKey: "sensitiveData", prop: "sensitiveDataName", width: "150" }
      ],
      // 导出列配置相关数据
      exportColumnDialog: {
        visible: false,
        loading: false,
        selectedColumns: [], // 当前选中的导出列
        saveAsDefault: false, // 是否保存为默认配置
      },
      exportColumnList: [
        { labelKey: "fieldName", value: "fieldName" },
        { labelKey: "fieldType", value: "fieldType" },
        { labelKey: "fieldRemark", value: "fieldRemark" },
        { labelKey: "aiFieldRemark", value: "craftRemark" },
        { labelKey: "sourceBusinessSystem", value: "businessName" },
        { labelKey: "databaseName", value: "databaseName" },
        { labelKey: "tableName", value: "tableName" },
        { labelKey: "tableRemark", value: "tableRemark" },
        { labelKey: "aiTableRemark", value: "tableCraftRemark" },
        { labelKey: "category", value: "categoryName" },
        { labelKey: "classificationStatus", value: "classificationStateName" },
        { labelKey: "classificationReason", value: "classificationReasons" },
        { labelKey: "reasoningProcess", value: "reasoningProcess" },
        { labelKey: "piiComplianceReview", value: "piiDetectionName" },
        { labelKey: "detectionProcess", value: "detectionProcess" },
        { labelKey: "confidenceLevel", value: "confidenceLevel" },
        { labelKey: "confidenceScore", value: "confidenceScore" },
        { labelKey: "securityLevel", value: "securityLevelName" },
        { labelKey: "sensitiveData", value: "sensitiveDataName" },
        { labelKey: "sample", value: "sampleData" },
        { labelKey: "manualConfirmStatus", value: "confirmName" },
        { labelKey: "sampleFeature", value: "regularExpression" },
        { labelKey: "tableTopic", value: "tableTopic" },
        { labelKey: "fieldTopic", value: "fieldTopic" },
        { labelKey: "fileName", value: "fileName" },
        { labelKey: "fileFormat", value: "fileFormat" },
        { labelKey: "fileSize", value: "fileSize" },
        { labelKey: "fileAbsolutePath", value: "fileAbsolutePath" },
        { labelKey: "fileParentPath", value: "fileParentPath" },
        { labelKey: "updateTime", value: "updateTime" },
        { labelKey: "createTime", value: "createTime" },
      ],
      // 初始默认配置（固定不变，用于恢复初始配置）
      initialDefaultColumns: [
        "fieldName",
        "fieldRemark",
        "businessName",
        "databaseName",
        "tableName",
        "categoryName",
        "classificationReasons",
        "piiDetectionName",
        "securityLevelName",
        "sampleData",
        "fileName",
        "fileFormat",
        "fileParentPath",
        "fileSize",
      ],
    };
  },
  watch: {
    filterName(val) {
      this.$refs.tree.filter(val);
    },
    projectId(val) {
      this.fetchLevelOptions(val)
    }
  },
  computed: {
    copyableConfig() {
      return {
        copyText: this.$t('copy'),
        copiedText: this.$t('protectTableField.copySuccess')
      }
    },
    setList() {
      if (this.currentNodeType === 1) {
        return this.unstructuredColumnList.map(item => ({
          ...item,
          label: this.$t(`protectTableField.columnLabels.${item.labelKey}`)
        }))
      }
      return this.columnList.map(item => ({
        ...item,
        label: this.$t(`protectTableField.columnLabels.${item.labelKey}`)
      }))
    },
    checkedColumn() {
      return this.setList.filter(item => this.checkedColumnProps.includes(item.prop))
    },
    exportAllColumns() {
      return this.exportColumnList.map(item => ({
        ...item,
        label: item.label || this.$t(`protectTableField.columnLabels.${item.labelKey}`)
      }))
    }
  },
  created() {
    this.checkedColumnProps = ['fieldName', 'businessName', 'sourceName', 'databaseName', 'tableName', 'categoryName', 'securityLevelName'];
    this.init()
  },
  methods: {
    fetchLevelOptions(projectId) {
      const params = {}
      if (projectId) params.projectId = projectId
      getCategorySchemaLevelList(params).then(res => {
        const payload = res && res.data ? res.data : res
        const list = payload.records || payload.rows || payload.list || payload || []
        this.levelOptions = list.map(it => ({
          value: it.level,
          label: it.levelName
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
    isNeutralCategory(categoryName) {
      return ['未分类', '噪音数据', this.$t('protectTableField.unclassified'), this.$t('protectTableField.noiseData')].includes(categoryName)
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
    /**
     * 自定义树节点渲染，为不同层级节点添加不同的SVG图标
     * 第一层：sysBusiness，第二层：database1，第三层：table1
     */
    renderContent(h, { node, data }) {
      let iconClass = 'sysBusiness';
      if (data.type == 1) {
        iconClass = 'file-o';
      } else if (node.level === 2) {
        iconClass = 'database1';
      } else if (node.level === 3) {
        iconClass = 'table1';
      }

      const labelPart = h('span', {
        class: 'node-label',
        attrs: { title: node.label },
        style: {
          fontSize: '14px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, node.label);

      const nodeContent = [
        h('svg-icon', {
          class: 'tree-node-icon',
          attrs: {
            iconClass: iconClass
          },
          style: { marginRight: '8px' }
        }),
        h('div', {
          class: 'node-label-wrapper',
          style: { flex: '1', minWidth: '0', overflow: 'hidden', display: 'flex', alignItems: 'center' }
        }, [labelPart])
      ];

      return h('span', {
        class: 'custom-tree-node',
        style: {
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
          overflow: 'hidden',
          paddingTop: '10px',
          paddingBottom: '10px',
          borderRadius: '6px',
          transition: 'background-color 0.2s'
        }
      }, nodeContent);
    },
    async init() {
      if (this.$route.params && this.$route.params.id) {
        this.routeDataShow = true
      }
      await this.gettreeOptionsList()
    },
    httpDemo() {

      this.Token = Cookies.get("Admin-Token")
      this.textarea = `GET /system/protectTableField/getDatabaseSource?projectId=${this.projectId}
Host: 172.0.0.1:8080
accept:application/json, text/plain, */*
Authorization:Bearer ${this.Token}`
    },
    mgsElemesFn() {
      this.$message.success(this.$t('protectTableField.copySuccess'));
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },

    // api 取消
    apiCancel() {
      this.apiDialogShow = false
    },
    messsucc(res, flag) {
      this.$message.success(`${res.msg},${this.$t('protectTableField.actionCountText', { action: flag, count: res.data })}`)
    },
    //api调用
    apiSumbit() {
      // 调接口拿api里的值
      let projectId = this.projectId
      getDatabaseSource(projectId).then(res => {
        this.textarea2 = JSON.parse(JSON.stringify(res))
      })
      this.apiDialogShow = true
    },
    enabledFn(flag) {
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(this.$t('protectTableField.batchConfirm', { action: flag }), this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let data = {
            ids: ids.join(',')
          }
          if (flag == '启用' || flag == this.$t('protectTableField.enable')) {
            data.enable = true
            attachStatus(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.getList()
              }
            })
          } else if (flag == '禁用' || flag == this.$t('protectTableField.disable')) {
            data.enable = false
            attachStatus(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.getList()
              }
            })
          } else if (flag == '删除' || flag == this.$t('delete')) {
            for (let item of dataS) {
              if (item.dataSource === '内置' || item.dataSource === this.$t('protectTableField.builtin')) {
                this.$message({
                  type: 'warning',
                  message: this.$t('protectTableField.builtinDataSourceCannotDelete'),
                });
                return
              }
            }
            forceLogout(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.getList()
              }
            })
          } else {
            this.$message({ message: this.$t('protectTableField.unknownException'), type: 'warning' })
          }
          // 接口
        }).catch(() => {

        });
      } else {
        this.$message({ message: this.$t('protectTableField.pleaseSelectAtLeastOne'), type: 'warning' })
      }
    },
    // 左侧树下拉选change事件 - 添加防抖处理
    treeOptionsSelectChange(val) {
      // 清除之前的定时器
      if (this.changeTimeout) {
        clearTimeout(this.changeTimeout);
      }

      // 设置新的定时器，延迟执行，避免频繁切换导致性能问题
      this.changeTimeout = setTimeout(() => {
        this.queryParams.pageNum = 1
        this.queryParams.pageSize = 10
        this.resetQuery()
        this.routeDataShow = false
        this.httpDemo()

        // 使用Promise.all协调多个异步请求，确保数据加载完成后再更新界面
        Promise.all([
          this.getProtectCategoryAsync(val),
          this.getProtectCategoryQueryAsync(val),
          this.getPiiListAsync(val)
        ]).then(() => {
          // 所有请求完成后再获取列表数据
          if (this.dataCategoryList.length > 0) {
            this.$nextTick(() => {
              this.selectAllFirstLevelNodes(this.dataCategoryList)
            });
          } else {
            this.treeIds = []
            this.databaseNames = [] // 清空数据库名称数组
            this.getList()
          }
          this.Loading = false
          this.treeLoading = false
        }).catch(error => {
          console.error('数据加载失败:', error)
          this.Loading = false
          this.treeLoading = false
        });
      }, 300); // 300ms防抖延迟
    },
    gettreeOptionsList() {
      this.Loading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        this.Loading = false
        if (this.$route.params && this.$route.params.id) {
          this.projectId = this.$route.params.projectId
        } else {
          this.projectId = response.data[0].id
        }
        this.getProtectCategory(this.projectId)
        this.httpDemo()
        this.getProtectCategoryQuery(this.projectId)
        this.getPiiList(this.projectId)
      });
    },
    // 分类选择器过滤方法
    handleCategoryFilter(query) {
      if (!query) {
        // 清空搜索时恢复原始数据
        this.$refs.categoryTreeRef.filter('');
        return;
      }
      // 触发树过滤
      this.$refs.categoryTreeRef.filter(query);
      // 展开所有匹配节点及其父节点
      this.expandMatchingNodes(this.categoryList, query, this.$refs.categoryTreeRef);
    },

    // 个人信息识别选择器过滤方法
    handlePiiFilter(query) {
      if (!query) {
        this.$refs.piiTreeRef.filter('');
        return;
      }
      this.$refs.piiTreeRef.filter(query);
      this.expandMatchingNodes(this.piiList, query, this.$refs.piiTreeRef);
    },

    // 分类节点过滤逻辑（支持中间层级匹配）
    filterCategoryNode(value, data) {
      if (!value) return true;
      // 检查当前节点或其任何祖先节点是否包含关键字
      return this.checkNodeOrAncestors(data, value, this.categoryList);
    },

    // 个人信息节点过滤逻辑（支持中间层级匹配）
    filterPiiNode(value, data) {
      if (!value) return true;
      return this.checkNodeOrAncestors(data, value, this.piiList);
    },

    // 检查节点或其祖先节点是否包含关键字
    checkNodeOrAncestors(node, keyword, tree) {
      // 检查当前节点
      if (node.categoryName && node.categoryName.includes(keyword)) {
        return true;
      }

      // 检查所有祖先节点
      let parent = this.findParentNode(tree, node.parentId);
      while (parent) {
        if (parent.categoryName && parent.categoryName.includes(keyword)) {
          return true;
        }
        parent = this.findParentNode(tree, parent.parentId);
      }

      return false;
    },

    // 查找父节点
    findParentNode(tree, parentId) {
      for (const node of tree) {
        if (node.id === parentId) {
          return node;
        }
        if (node.children && node.children.length) {
          const found = this.findParentNode(node.children, parentId);
          if (found) return found;
        }
      }
      return null;
    },

    // 展开所有匹配节点
    expandMatchingNodes(tree, keyword, treeInstance) {
      if (!keyword || !treeInstance) return;

      const expand = (nodes) => {
        nodes.forEach(node => {
          if (node.children && node.children.length) {
            expand(node.children);
          }
        });
      };

      expand(tree);
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.categoryName.indexOf(value) !== -1;
    },
    treeCheck(data, node) {
      let list = this.$refs.tree.getCheckedNodes()
      let treeList = []
      if (list.length > 0) {
        treeList = list.filter(item => item.level === 1)
        this.treeID = treeList.map(item => item.id).join()
        this.treeIds = treeList.map(item => item.id)
        // 收集选中的数据库名称用于导出，不再触发查询
        // this.databaseNames = treeList.map(item => item.name).filter(name => name)
        // this.handleQuery();
      } else {
        // this.protectTableFieldList = []
        // this.queryParams.pageNum = 1
        // this.queryParams.pageSize = 10
        // this.total = 0
        // this.databaseNames = []
        this.treeIds = []
      }
    },
    handleNodeClick(data) {
      const newType = data.type || 0;
      const typeChanged = this.currentNodeType !== newType;
      this.currentNodeType = newType;
      this.currentNodeData = data;
      this.databaseNames = [data.databaseName || data.categoryName || data.name || ''];

      // Update checkedColumnProps based on type only if type changed or first load
      if (typeChanged || this.checkedColumnProps.length === 0) {
        if (this.currentNodeType === 1) {
          this.checkedColumnProps = ['fileName', 'fileFormat', 'fileParentPath', 'fileSize', 'categoryName', 'securityLevelName'];
        } else {
          this.checkedColumnProps = ['fieldName', 'businessName', 'sourceName', 'databaseName', 'tableName', 'categoryName', 'securityLevelName'];
        }

        // Ensure checkAll and isIndeterminate states are updated correctly
        this.$nextTick(() => {
          this.handleCheckedCitiesChange(this.checkedColumnProps);
        });
      }

      // Update queryParams.pageNum to 1 when clicking a node
      this.queryParams.pageNum = 1;
      this.queryParams.tableName = ''; // 清空搜索框内容
      this.handleQuery();
    },

    // getSimpleCheckedNodeIds(originData) {
    //   // 定义数组
    //   const checkedNodeIds = []
    //   // 判断是否为全选，若为全选状态返回被选中的父节点数据，不为全选状态正常返回被选中的子节点的数据
    //   const isAllChecked = function (node) {
    //     const childNodes = node.root ? node.root.childNodes : node.childNodes || []
    //     childNodes.forEach(child => {
    //       if (child.checked) {
    //         checkedNodeIds.push(child.data)
    //       }
    //       if (child.indeterminate) {
    //         isAllChecked(child)
    //       }
    //     })
    //   }
    //   isAllChecked(originData)
    //   return checkedNodeIds
    // },
    // HandleNodeClickFn(node) {

    //   // 获取当前选中的节点
    //   const checkedNodes = this.$refs.tree.getCheckedNodes();

    //   // 检查当前节点是否已经选中
    //   const isChecked = checkedNodes.some(cn => cn.id === node.id);
    //   if (isChecked) {
    //     // 如果当前节点已经选中，则取消选中
    //     const newCheckedNodes = checkedNodes.filter(cn => cn.id !== node.id);
    //     // 取消选中当前节点及其所有子节点
    //     const childNodes = this.getAllChildNodes(node);
    //     const nodesToUncheck = [node, ...childNodes];
    //     const finalCheckedNodes = newCheckedNodes.filter(cn => !nodesToUncheck.some(n => n.id === cn.id));
    //     this.$refs.tree.setCheckedNodes(finalCheckedNodes);
    //   } else {
    //     // 如果当前节点未选中，则选中
    //     const childNodes = this.getAllChildNodes(node);
    //     const nodesToCheck = [node, ...childNodes];
    //     const allCheckedNodes = [...checkedNodes, ...nodesToCheck];
    //     this.$refs.tree.setCheckedNodes(allCheckedNodes);
    //   }
    //   let list = this.$refs.tree.getCheckedNodes()
    //   let treeList = []
    //   if (list.length > 0) {
    //     treeList = list.filter(item => item.level === 2)
    //   }
    //   this.treeID = treeList.map(item => item.id)
    //   // this.handleQuery()      
    // },
    getAllChildNodes(node) {
      let children = [];
      if (node.children && node.children.length > 0) {
        children = node.children;
        for (let child of node.children) {
          children = children.concat(this.getAllChildNodes(child));
        }
      }
      return children;
    },
    // 定时器，防抖使用
    inputSearch(data) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleQuery()
      }, 500); // 设置防抖的时间间隔为300毫秒
    },
    selectAllFirstLevelNodes(data) {
      if (this.routeDataShow) {
        data = data.map(item => {
          if (item.id == this.$route.params.id) {
            return item
          }
        })
      }
      // 设置这些节点为选中状态
      this.$nextTick(() => {
        if (this.$refs.tree) {
          this.$refs.tree.setCheckedNodes(data);
        }
      });
      let treeList = []
      let list = []
      if (this.$refs.tree) {
        list = this.$refs.tree.getCheckedNodes()
      }
      treeList = list.filter(item => item.level === 1 && item.id && item.id !== '')
      this.treeID = treeList.map(item => item.id).join()
      this.treeIds = treeList.map(item => item.id)

      // 选中第一条
      if (this.dataCategoryList && this.dataCategoryList.length > 0) {
        const firstNode = this.dataCategoryList[0];
        this.$nextTick(() => {
          if (this.$refs.tree) {
            this.$refs.tree.setCurrentKey(firstNode.id);
          }
          this.handleNodeClick(firstNode);
        });
      } else {
        this.currentNodeType = 0; // 重置为默认结构化
        this.getList();
      }
    },
    // 返回Promise的异步版本
    getProtectCategoryAsync(key) {
      return new Promise((resolve, reject) => {
        this.treeLoading = true
        let data = {
          projectId: key,
        };
        getDatabaseList(data).then((resp) => {
          this.dataCategoryList = resp.data
          if (resp.data.length > 0) {
            let tempList = JSON.parse(JSON.stringify(this.dataCategoryList))
            for (let item of tempList) {
              item.label = item.categoryName
            }
            this.dataCategoryList = this.handleTree(tempList, "id")
            this.categoryListEdit = this.handleTree(tempList, "id")
          }
          resolve(resp.data)
        }).catch(error => {
          console.error('获取保护分类失败:', error)
          reject(error)
        });
      });
    },

    // 保留原方法以兼容其他调用
    getProtectCategory(key) {
      this.getProtectCategoryAsync(key).then(data => {
        if (data.length == 0) {
          this.Loading = false
          this.treeIds = []
          this.databaseNames = [] // 清空数据库名称数组
          this.getList()
        } else {
          this.$nextTick(() => {
            this.selectAllFirstLevelNodes(this.dataCategoryList)
          });
        }
        this.Loading = false
        this.treeLoading = false
      }).catch(() => {
        this.Loading = false
        this.treeLoading = false
      });
    },
    getList() {
      this.loading = true;
      let params = {
        projectId: this.projectId,
        securityLevelIds: this.queryParams.securityLevel.length ? this.queryParams.securityLevel : null,
        businessName: this.queryParams.businessName,
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        categoryIds: this.queryParams.categoryId,
        piiDetection: this.queryParams.piiDetection,
        sourceType: this.currentNodeType === 1 ? 'FILE_CATALOGUE' : null
      }

      // 判断结构化或非结构化，传递不同的参数名称
      if (this.currentNodeType === 1) {
        params.fileName = this.queryParams.tableName; // 非结构化时复用了 tableName 变量作为 fileName 输入
        params.databaseId = this.currentNodeData ? this.currentNodeData.id : null;
      } else {
        params.tableName = this.queryParams.tableName;
        // 如果选中了节点，则传递该节点的databaseId
        if (this.currentNodeData && this.currentNodeData.id) {
          params.databaseId = this.currentNodeData.id;
        }
      }

      // 根据类型动态判断使用哪个接口
      const requestApi = this.currentNodeType === 1 ? listFileByPublished : listByPublished;

      requestApi(params).then((response) => {
        try {
          if (response.code == 200 && response.rows) {
            // 确保数组安全
            const rows = response.rows || [];

            // 使用map创建新数组，避免直接修改原数据
            this.protectTableFieldList = rows.map(ele => {
              const newEle = { ...ele };

              // 安全处理sampleData解析
              if (newEle.sampleData) {
                try {
                  newEle.sampleList = JSON.parse(newEle.sampleData).map(item => ({ value: item }));
                } catch (e) {
                  newEle.sampleList = [];
                  console.warn('解析样本数据失败:', e);
                }
              }

              // 修复错误引用：将item改为ele
              if (newEle.protectMethod) {
                newEle.protectMethodNameList = newEle.protectMethod.split(',');
              }

              return newEle;
            });

            this.total = response.total || 0;
          } else {
            // 重置为空数组，避免显示错误数据
            this.protectTableFieldList = [];
            this.total = 0;
          }
        } catch (error) {
          console.error('处理列表数据时发生错误:', error);
          this.protectTableFieldList = [];
          this.total = 0;
        } finally {
          // 确保在任何情况下都关闭loading
          this.loading = false;
        }
      }).catch(error => {
        console.error('获取列表数据失败:', error);
        this.protectTableFieldList = [];
        this.total = 0;
        this.loading = false;
      });
    },
    // 表单重置
    reset() {
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      // this.$refs.tree.setCurrentKey(null);
      this.resultFormNodeName = ''
      this.piiNodeName = ''
      this.queryParams.categoryId = ''
      this.queryParams.piiDetection = ''
      this.resetForm("queryParams");
      this.handleQuery();
    },
    async downloadFile() {
      this.openExportColumnDialog();
    },
    async openExportColumnDialog() {
      this.exportColumnDialog.visible = true;
      this.exportColumnDialog.loading = true;

      try {
        const allColumns = this.exportAllColumns;
        let finalSelectedColumns = [];

        const res = await getDicts('sys_export_column');
        if (res.data && res.data.length > 0) {
          const dictItem = res.data.find(item => item.dictValue == '1');
          if (dictItem && dictItem.remark) {
            finalSelectedColumns = dictItem.remark.split(',').map(item => item.trim());
          }
        }

        if (finalSelectedColumns.length === 0) {
          finalSelectedColumns = [...this.initialDefaultColumns];
        }

        this.exportColumnDialog.selectedColumns = [...finalSelectedColumns];

      } catch (error) {
        console.error('获取导出列配置失败:', error);
        this.$message.warning(this.$t('protectTableField.fetchExportColumnsConfigFailedUsingDefault'));
        this.exportColumnDialog.selectedColumns = [...this.initialDefaultColumns];
      } finally {
        this.exportColumnDialog.loading = false;
      }
    },

    toggleExportColumn(column) {
      const index = this.exportColumnDialog.selectedColumns.indexOf(column.value);
      if (index > -1) {
        this.exportColumnDialog.selectedColumns.splice(index, 1);
      } else {
        this.exportColumnDialog.selectedColumns.push(column.value);
      }
      // 强制更新，确保UI同步
      this.$forceUpdate();
    },

    restoreInitialConfig() {
      this.exportColumnDialog.selectedColumns = [...this.initialDefaultColumns];
      this.exportColumnDialog.saveAsDefault = false;
      this.$message.success(this.$t('protectTableField.restoredInitialConfig'));
    },

    async confirmExport() {
      if (this.exportColumnDialog.selectedColumns.length === 0) {
        this.$message.warning(this.$t('protectTableField.pleaseSelectAtLeastOneExportColumn'));
        return;
      }

      if (this.exportColumnDialog.loading) return;
      this.exportColumnDialog.loading = true;

      try {
        if (this.exportColumnDialog.saveAsDefault) {
          this.$message.success(this.$t('protectTableField.savedAsDefaultConfig'));
        }
        this.exportColumnDialog.visible = false;
        await this.performExport();
      } finally {
        this.exportColumnDialog.loading = false;
      }
    },

    cancelExport() {
      this.exportColumnDialog.visible = false;
      this.exportColumnDialog.saveAsDefault = false;
    },

    async performExport() {
      try {
        this.loading = true;
        const allColumns = this.exportAllColumns.map(item => item.value);
        const unselectedColumns = allColumns.filter(value => !this.exportColumnDialog.selectedColumns.includes(value));

        let list = this.$refs.tree.getCheckedNodes();
        let treeListLevel0 = list.filter(item => item.level === 0);
        let treeListLevel1 = list.filter(item => item.level === 1);
        
        let checkedDatabaseNames = treeListLevel1.map(item => item.databaseName || item.categoryName || item.name || '').filter(name => name);
        if (checkedDatabaseNames.length === 0) {
          checkedDatabaseNames = this.databaseNames;
        }
        let checkedDatabaseIds = treeListLevel0.map(item => item.id);
        if (checkedDatabaseIds.length === 0) {
          checkedDatabaseIds = this.dataCategoryList.map(item => item.id);
        }
        const params = {
          databaseIds: checkedDatabaseIds,
          databaseNames: checkedDatabaseNames,
          projectId: this.projectId,
          securityLevelIds: this.queryParams.securityLevel.length ? this.queryParams.securityLevel : null,
          businessName: this.queryParams.businessName,
          pageNum: this.queryParams.pageNum,
          pageSize: this.queryParams.pageSize,
          categoryId: this.queryParams.categoryId,
          columnList: unselectedColumns,
          saveAsDefault: this.exportColumnDialog.saveAsDefault,
          sourceType: this.currentNodeType === 1 ? 'FILE_CATALOGUE' : null
        };
        await exportReport(params);
        // if (res.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        //   this.$message.error('导出失败')
        //   this.getList()
        //   return
        // }
        // // 创建一个Blob对象
        // const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        // // 创建一个URL对象
        // const url = window.URL.createObjectURL(blob);
        // // 创建一个a标签并设置href属性
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = '数据资产目录.xlsx';
        // document.body.appendChild(link);
        // // 触发点击事件
        // link.click();
        // // 移除a标签
        // document.body.removeChild(link);
        // // 释放URL对象
        // window.URL.revokeObjectURL(url);
        // this.loading = false;
        this.getList()
        this.loading = false;
        this.$message.success(this.$t('protectTableField.exportSuccess'));

      } catch (error) {
        this.loading = false;
        this.$message.error(this.$t('protectTableField.exportFailedRetry'));
      }
    },
    // 返回Promise的异步版本
    getPiiListAsync(key) {
      return new Promise((resolve, reject) => {
        let data = {
          parentId: 1,
          needSub: 1,
          ifAddUnclassified: 2,
        };
        treeListI(data).then((resp) => {
          this.piiList = resp.data
          this.yuanCategoryList = resp.data
          if (resp.data.length > 0) {
            let tempList = JSON.parse(JSON.stringify(this.piiList))
            for (let item of tempList) {
              item.label = item.categoryName
            }
            this.piiList = this.handleTree(tempList, "id")
            this.categoryListEdit = this.handleTree(tempList, "id")
          }
          resolve(resp.data)
        }).catch(error => {
          console.error('获取PII列表失败:', error)
          reject(error)
        });
      });
    },

    // 保留原方法以兼容其他调用
    getPiiList(key) {
      this.getPiiListAsync(key).then(() => {
        this.Loading = false
        this.treeLoading = false
      }).catch(() => {
        this.Loading = false
        this.treeLoading = false
      });
    },
    // 返回Promise的异步版本
    getProtectCategoryQueryAsync(key) {
      return new Promise((resolve, reject) => {
        this.treeLoading = true
        let data = {
          parentId: key,
          needSub: 1,
          ifAddUnclassified: 1,
        };
        treeListI(data).then((resp) => {
          this.categoryList = resp.data
          this.yuanCategoryList = resp.data
          if (resp.data.length > 0) {
            let tempList = JSON.parse(JSON.stringify(this.categoryList))
            for (let item of tempList) {
              item.label = item.categoryName
            }
            this.categoryList = this.handleTree(tempList, "id")
            this.categoryListEdit = this.handleTree(tempList, "id")
          }
          resolve(resp.data)
        }).catch(error => {
          console.error('获取保护分类查询数据失败:', error)
          reject(error)
        });
      });
    },

    // 保留原方法以兼容其他调用
    getProtectCategoryQuery(key) {
      this.getProtectCategoryQueryAsync(key).then(() => {
        this.Loading = false
        this.treeLoading = false
      }).catch(() => {
        this.Loading = false
        this.treeLoading = false
      });
    },
    // 单选click事件
    // resultHandleNodeClick(node) {
    //   if (node.children && node.children.length > 0) {
    //     node.disabled = true;
    //   } else {
    //     const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
    //     if (parentLabels) {
    //       this.resultFormNodeName = parentLabels.join('-') + '-' + node.categoryName;
    //     } else {
    //       this.resultFormNodeName = node.categoryName;
    //     }
    //     this.queryParams.categoryId = node.id
    //     this.$refs.resultSelectRef.blur()
    //     this.handleQuery()
    //   }
    // },

    // 多选事件
    resultHandleNodeClick(node, checkData) {
      const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
      if (parentLabels) {
        this.resultFormNodeName = parentLabels.join('-') + '-' + node.categoryName;
      } else {
        this.resultFormNodeName = node.categoryName;
      }
      // let data = this.$refs.treeSelect.getCheckedNodes()
      // let childrenData = data.filter((item) => {
      //   return !item.children
      // })
      // this.queryParams.categoryId = childrenData.map((item) => {
      //   return item.id
      // }).join()
      let lastNodeData = checkData.checkedNodes.filter(item => !item.children)
      this.queryParams.categoryId = lastNodeData.map(item => item.id).join()
      // this.$refs.resultSelectRef.blur()
      this.handleQuery()
    },
    piiHandleNodeCheck(node, checkData) {
      const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
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
      this.handleQuery()
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
  },
};
</script>

<style scoped>
.el-popup-parent--hidden /deep/ .el-loading-mask {
  background: "rgba(0, 0, 0, 0.7)" !important;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

::-webkit-scrollbar-track {
  border-radius: 10px;
}

.addMsg /deep/ .el-input--medium {
  width: 237px;
}

.left-card {
  border-radius: 10px;
  height: 100%;
  max-height: 100%;
  overflow: auto;

  .el-card__body {
    height: 100%;
    max-height: 100%;
    overflow: auto;
  }
}

.search-card {
  border-radius: 10px;
  margin-bottom: 20px;
}

.table-card {
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: 20px;

  .el-card__body {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.select-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
}

.select-label {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  margin-right: 8px;
  flex-shrink: 0;
}

.select-container .serachInput {
  flex: 1;
  min-width: 0;
}

.select-container .serachInput .el-input__inner {
  text-overflow: ellipsis;
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

.serachInput {}

.yuanDataClass /deep/ .el-form-item {
  width: 30%;
}

.yuanDataClass /deep/ .el-form-item:nth-child(3n) {
  margin-right: 0;
}

.yuanDataClass /deep/ .el-form-item:nth-last-child(-n+3) {
  margin-bottom: 0;
}

.yuanDataClass /deep/ .el-form-item__label {
  width: 25%;
  white-space: nowrap;
}

.yuanDataClass /deep/ .el-form-item__content {
  width: 75%;
}

.yuanDataClass /deep/ .el-select {
  width: 100%;
}

.uploadClass {
  width: 20% !important;
}

.addSelectClass /deep/ .el-select {
  width: calc(100%);
}

.tableBox {
  overflow-y: auto;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #e2e8f0;
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

.apiDialogMain {
  padding: 20px;
}

.apiDialogMain_body /deep/ .jv-container {
  max-height: 350px;
  overflow-y: scroll;

}

.tableCla {
  height: 266px !important;
}

.protect-tag {
  margin-right: 8px;
}

.protect-tag:last-child {
  margin-right: 0;
}

/* 自定义树节点样式 */
.custom-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.tree-node-icon {
  width: 16px;
  height: 16px;
  font-size: 16px;
}

.tree-node-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-label-wrapper {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.node-label {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-scroll-container {
  overflow-y: auto;
  max-height: calc(100vh - 350px);
}

::v-deep .el-tree-node__content {
  height: auto;
  min-height: 28px;
  line-height: 1.5;
  border-radius: 10px;
}

::v-deep .el-tree-node.is-current>.el-tree-node__content {
  background-color: #eff6ff;
  color: #3b84f6;
  border-radius: 10px;
}

::v-deep .el-tree-node__content:hover {
  background-color: #f8fafc !important;
  border-radius: 10px;
}

::v-deep .el-tree-node {
  padding: 0;
}

/* 添加导出列配置弹窗样式 */
/deep/.export-column-dialog-wrapper {
  border-radius: 10px;
}

.export-column-dialog-wrapper .dialog-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.export-column-dialog-wrapper .dialog-header .title-bar {
  width: 4px;
  height: 16px;
  background: #1890ff;
  margin-right: 8px;
}

.export-column-dialog-wrapper .dialog-header .title-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.export-column-dialog-wrapper .column-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.export-column-dialog-wrapper .column-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  white-space: nowrap;
}

.export-column-dialog-wrapper .column-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.export-column-dialog-wrapper .column-btn.active {
  border-color: #1890ff;
  background: #e6f7ff;
  color: #1890ff;
}

.export-column-dialog-wrapper .dialog-footer-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.export-column-dialog-wrapper .footer-left {
  display: flex;
  align-items: center;
}

.export-column-dialog-wrapper .footer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.export-column-dialog-wrapper .restore-link {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  margin-left: 12px;
}

.export-column-dialog-wrapper .restore-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

::v-deep .el-row {
  display: flex;
  align-items: stretch;
  flex: 1;
  overflow: hidden;
}

::v-deep .el-col {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}
</style>
