<template>
  <div class="matching-strategy-container" v-loading="Loading">
    <el-row :gutter="20" class="matching-layout">
      <el-col :span="5" :xs="24" class="left-panel">
        <el-card class="left-card" shadow="never">
          <div class="head-container">
            <el-select v-model="queryParams.categoryId" class="serachInput" @change="treeOptionsSelectChange"
              :placeholder="$t('all')" style="margin-bottom: 20px; width: 100%;">
              <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
              </el-option>
            </el-select>
          </div>
          <div class="head-container" v-loading="treeLoading">
            <el-input class="serachInput" v-model="filterName"
              :placeholder="$t('matchingStrategy.treeSearchPlaceholder')" clearable />
            <div class="tree-scroll-container">
              <el-tree style="overflow-y: auto;" :data="categoryList" :props="defaultProps"
                :default-expanded-keys="[treeID]" :current-node-key="treeID" :expand-on-click-node="false"
                :filter-node-method="filterNode" ref="tree" node-key="id" highlight-current
                @node-click="handleNodeClick" :render-content="renderContent" />
            </div>
          </div>
        </el-card>
      </el-col>
      <!--用户数据-->
      <el-col :span="19" :xs="24" class="right-panel">
        <el-card class="search-card" shadow="never">
          <el-form :model="queryParams" ref="queryParams" class="yuanDataClass" size="small" :inline="false"
            v-show="showSearch" label-width="90px">
            <el-form-item :label="$t('matchingStrategy.ruleName')" prop="ruleName">
              <el-input v-model="queryParams.ruleName" @input="inputSearch"
                :placeholder="$t('matchingStrategy.pleaseInputRuleName')" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('matchingStrategy.recognizeObject')" prop="recognizeObject">
              <el-select v-model="queryParams.recognizeObject" clearable @change="dataSourceIdIdChange"
                :placeholder="$t('all')" :loading="loading">
                <el-option v-for="item in recognizeObjectList" :key="item.value" :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('matchingStrategy.recognizeWay')" prop="recognizeWay">
              <el-select v-model="queryParams.recognizeWay" @change="selectProjectIdChange" :placeholder="$t('all')">
                <el-option v-for="item in addOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item> -->
            <!-- <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button> -->
            <!-- <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button> -->
            <!-- </el-form-item> -->
          </el-form>
        </el-card>
        <div class="search-actions">
          <el-button type="primary" plain icon="el-icon-plus" size="medium" :disabled="isChildrenNode !== 4"
            @click="addFn">{{ $t('add') }}</el-button>
          <el-button type="danger" plain icon="el-icon-close" size="medium" @click="enabledFn('delete')">{{ $t('delete')
            }}</el-button>
          <el-button type="primary" plain icon="el-icon-refresh" size="medium" @click="enabledFn('enable')">{{
            $t('enable') }}</el-button>
          <el-button type="danger" plain icon="el-icon-warning-outline" size="medium" @click="enabledFn('disable')">{{
            $t('disable') }}</el-button>
        </div>
        <el-card class="table-card" shadow="never">
          <el-table v-loading="loading" :data="protectTableFieldList" ref="tableRef" height="630px" class="tableBox">
            <!-- <el-table-column width="55" align="center" /> -->
            <template slot="empty">
              <el-empty :description="$t('noData')"></el-empty>
            </template>
            <el-table-column type="selection" width="60" align="center">
            </el-table-column>
            <el-table-column :label="$t('matchingStrategy.ruleName')" align="center" prop="ruleName"
              show-overflow-tooltip />
            <el-table-column :label="$t('matchingStrategy.standardBelong')" align="center" prop="attachData"
              show-overflow-tooltip />
            <el-table-column :label="$t('matchingStrategy.recognizeObject')" align="center" prop="recognizeObject"
              show-overflow-tooltip>
              <template slot-scope="scope">
                <span>
                  {{ recognizeObjectMsg(scope.row.recognizeObject) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('matchingStrategy.recognizeWay')" align="center" prop="recognizeWay"
              show-overflow-tooltip>
              <template slot-scope="scope">
                <span>
                  {{ recognizeWayMsg(scope.row.recognizeWay) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('status')" align="center" prop="state">
              <template slot-scope="scope">
                <span>
                  {{ scope.row.state === '0' ? $t('enable') : $t('disable') }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('updateTime')" align="center" prop="updateTime" />
            <el-table-column :label="$t('operation')" align="center">
              <template slot-scope="scope">
                <el-button type="text" size="medium" :disabled="scope.row.dataSource === '内置'"
                  @click="editFn(scope.row)">{{ $t('edit') }}</el-button>
                <el-button type="text" size="medium" @click="lookFn(scope.row)">{{ $t('view') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :page-size.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>
    </el-row>
    <!-- 新增编辑框 -->
    <el-dialog class="addMsg" :title="addOrEdit.title" v-loading="importDataLoading" :visible.sync="addOrEdit.show"
      append-to-body :close-on-click-modal="addOrEdit.flag == 3" width="700px">
      <el-form :model="addOrEditDataRuls" size="medium" v-if="addOrEdit.show" :rules="addOrEditRules" ref="addOrEdit"
        label-width="120px" label-position="top">
        <el-form-item :label="$t('matchingStrategy.ruleName')" prop="ruleName">
          <el-input v-model="addOrEditDataRuls.ruleName" :disabled="addOrEdit.flag == 3" maxlength="50"
            :placeholder="$t('matchingStrategy.pleaseInputRuleName')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('matchingStrategy.recognizeObject')" class="addSelectClass" prop="recognizeObject">
          <el-select v-model="addOrEditDataRuls.recognizeObject" :disabled="addOrEdit.flag == 3"
            :placeholder="$t('all')">
            <el-option v-for="item in recognizeObjectList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="recognizeWay" class="addSelectClass" :label="$t('matchingStrategy.recognizeWay')">
          <el-select v-model="addOrEditDataRuls.recognizeWay" :disabled="addOrEdit.flag == 3" :placeholder="$t('all')">
            <el-option v-for="item in addOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('matchingStrategy.similarity')" v-if="addOrEditDataRuls.recognizeObject == '3'"
          prop="ruleValue" class="ruleValueClass">
          <el-input v-model="addOrEditDataRuls.ruleValue" :disabled="addOrEdit.flag == 3"
            :placeholder="$t('matchingStrategy.pleaseInputSimilarity')" @input="numberInputFn" />
          <span style="font-size: 18px;margin-left: 10px;">%</span>
          <span style="margin-left: 30px;font-size: 14px;"><i class="el-icon-warning"></i>
            {{ $t('matchingStrategy.contentMatchThreshold') }}</span>
        </el-form-item>
        <el-form-item class="rulesContClass" prop="ruleContent">
          <template slot="label">
            <span style="margin-right: 10px;">{{ $t('matchingStrategy.ruleContent') }}</span>
            <span style="color: rgb(188 188 188);font-size:12px;font-style: italic;">{{
              $t('matchingStrategy.matchAnyRule') }}</span>
            <span class="addTextBtn" v-if="addOrEdit.flag !== 3" @click="rulesContAddFn">{{ $t('add') }}</span>
          </template>
          <div class="forDiv">
            <div v-for="(item, index) in ruleContent" :key="index" style="margin-bottom: 15px;">
              <!-- 当识别方式为正则(3)时显示带建议的输入框 -->
              <el-autocomplete v-if="addOrEditDataRuls.recognizeWay === '3'" v-model="item.name"
                :disabled="addOrEdit.flag == 3" :fetch-suggestions="queryRegexSuggestions"
                :placeholder="$t('matchingStrategy.pleaseInputRegex')" clearable value-key="name"
                :popper-append-to-body="false">
                <template slot-scope="{ item }">
                  <div class="value-text">{{ item.value }}</div>
                </template>
              </el-autocomplete>

              <!-- 其他识别方式显示普通输入框 -->
              <el-input v-else v-model="item.name" :disabled="addOrEdit.flag == 3"
                :placeholder="getInputPlaceholder()" />
              <span @click="delAddSelect(index)" v-if="addOrEdit.flag !== 3"
                style="margin-left: 20px; color: red;cursor: pointer;">{{ $t('delete') }}</span>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="addSubmitForm">{{ $t('confirm') }}</el-button>
        <el-button @click="addCancel">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getParentIdTree, getListitem, enableDataItem, deleteDataItem, updateAttachDataItme, nameTesting, getFrameworks, addAttachDataItme, nameRules, getFeatureItemSelect } from "@/api/system/protectCategory";
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
        title: this.$t('add'),
        show: false,
        flag: 1,// 1新增 2编辑 3查看
      },
      ruleContent: [
      ],
      treeLoading: false,
      // 表单校验
      addOrEditRules: {
        ruleName: [
          { required: true, message: this.$t('matchingStrategy.pleaseInputRuleName'), trigger: "blur" }
        ],
        recognizeObject: [
          { required: true, message: this.$t('matchingStrategy.pleaseSelectRecognizeObject'), trigger: "change" }
        ],
        recognizeWay: [
          { required: true, message: this.$t('matchingStrategy.pleaseSelectRecognizeWay'), trigger: "change" }
        ],
        ruleValue: [
          { required: true, message: this.$t('matchingStrategy.pleaseInputSimilarity'), trigger: "blur" },
          { pattern: /^(?:[1-9]|[1-9][0-9]|100)$/, message: this.$t('matchingStrategy.pleaseInputPositiveInt1To100'), trigger: "blur" }
        ],
        ruleContent: [
          { required: true, validator: this.validateRuleContent, trigger: "change" }
        ]
      },
      // 表单校验
      importDataRules: {
        categoryName: [
          {
            required: true, message: this.$t('matchingStrategy.pleaseInputFrameworkName'), trigger: "blur"
          }
        ],
        importFile: [
          { required: true, message: this.$t('matchingStrategy.pleaseSelectImportFrameworkFile'), trigger: "blur" },
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
          label: this.$t('matchingStrategy.fieldNameMatch')
        },
        {
          value: '2',
          label: this.$t('matchingStrategy.fieldRemarkMatch')
        },
        {
          value: '3',
          label: this.$t('matchingStrategy.fieldContentMatch')
        },
        {
          value: '4',
          label: this.$t('matchingStrategy.aiFieldRemarkMatch')
        },
        {
          value: '5',
          label: this.$t('matchingStrategy.tableNameMatch')
        },
        {
          value: '6',
          label: this.$t('matchingStrategy.tableRemarkMatch')
        },
        {
          value: '7',
          label: this.$t('matchingStrategy.aiTableRemarkMatch')
        },
      ],
      addOptions: [
        {
          value: '1',
          label: this.$t('matchingStrategy.exact')
        }, {
          value: '2',
          label: this.$t('matchingStrategy.contains')
        }, {
          value: '3',
          label: this.$t('matchingStrategy.regex')
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
      this.addOrEdit.title = this.$t('matchingStrategy.addMatchingRule')
      this.addOrEdit.show = true
      this.addOrEditDataRuls = {}
      this.ruleContent = []
    },
    // 正则表达式建议列表（可根据实际需求扩展）
    async queryRegexSuggestions(queryString, callback) {
      // 常用正则表达式建议列表
      let regexSuggestions = [];
      try {
        let res = await getFeatureItemSelect()
        res.data.forEach(item => {
          regexSuggestions.push({
            value: item.featureName,  // 建议列表中显示的值
            name: item.featureValue   // 点击后输入框显示的值
          })
        })
      } catch (error) {
        console.error('获取特性项目选择数据失败:', error);
        this.$message.error(this.$t('matchingStrategy.getDataFailedRetry'));
      }

      // 根据输入过滤建议 - 仍然基于value进行过滤
      const results = queryString
        ? regexSuggestions.filter(suggestion =>
          suggestion.value.toLowerCase().includes(queryString.toLowerCase())
        )
        : regexSuggestions;

      // 调用回调返回结果
      callback(results);
    },

    // 获取输入框占位符
    getInputPlaceholder() {
      switch (this.addOrEditDataRuls.recognizeWay) {
        case '1':
          return this.$t('matchingStrategy.pleaseInputExactMatchContent');
        case '2':
          return this.$t('matchingStrategy.pleaseInputContainsMatchContent');
        default:
          return this.$t('matchingStrategy.pleaseInputContent');
      }
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
        callback(new Error(this.$t('matchingStrategy.atLeastOneRuleContent')));
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
              this.$modal.msgSuccess(this.$t('matchingStrategy.updatedSuccess'));
              this.getList();
              this.addOrEdit.show = false
              this.importDataLoading = false
            })
              .catch((err) => {
                this.importDataLoading = false
              })
          } else {
            addAttachDataItme(params).then((response) => {
              this.$modal.msgSuccess(this.$t('matchingStrategy.addedSuccess'));
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
      this.addOrEdit.title = this.$t('edit')
    },
    lookFn(row) {
      this.addOrEdit.flag = 3
      this.addOrEditDataRuls = row
      let ruleContentList = JSON.parse(JSON.stringify(row.ruleContent)).split(',')
      this.ruleContent = ruleContentList.map(item => {
        return { name: item }
      })
      this.addOrEdit.show = true
      this.addOrEdit.title = this.$t('view')
    },
    messsucc(res, flag) {
      this.$message.success(this.$t('matchingStrategy.batchActionSuccess', {
        msg: res.msg,
        action: this.$t(flag),
        count: res.data
      }))
    },
    enabledFn(flag) {
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(this.$t('matchingStrategy.confirmBatchAction', { action: this.$t(flag) }), this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let data = {
            ids: ids
          }
          if (flag == 'enable') {
            data.state = '0'
            enableDataItem(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.getList()
              }
            })
          } else if (flag == 'disable') {
            data.state = '1'
            enableDataItem(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.getList()
              }
            })
          } else if (flag == 'delete') {
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
            this.$message({ message: this.$t('matchingStrategy.unknownException'), type: 'warning' })
          }
          // 接口
        }).catch(() => {

        });
      } else {
        this.$message({ message: this.$t('matchingStrategy.pleaseSelectAtLeastOneData'), type: 'warning' })
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
        } else {
          this.Loading = false
        }
      });
    },
    // 修改过滤方法以支持最下级节点匹配
    filterNode(value, data) {
      if (!value) return true; // 无搜索值时全部显示
      const lowerValue = value.toLowerCase();

      // 1. 检查当前节点自身是否匹配（无论是否为叶子节点）
      if (data.categoryName && data.categoryName.toLowerCase().includes(lowerValue)) {
        return true;
      }

      // 2. 检查当前节点的祖先节点是否有匹配（若有，则当前节点强制显示）
      if (this.hasMatchingAncestor(data, this.categoryList, lowerValue)) {
        return true;
      }

      // 3. 检查当前节点的子节点是否有匹配（若有，则当前节点显示）
      if (data.children && data.children.length > 0) {
        return this.checkChildrenMatch(data.children, lowerValue);
      }

      return false;
    },
    hasMatchingAncestor(node, tree, searchValue) {
      let parent = this.findParentNode(tree, node.parentId); // 找到父节点
      while (parent) {
        // 若父节点自身匹配，则当前节点有匹配的祖先
        if (parent.categoryName && parent.categoryName.toLowerCase().includes(searchValue)) {
          return true;
        }
        // 继续向上查找祖先
        parent = this.findParentNode(tree, parent.parentId);
      }
      return false;
    },
    findParentNode(tree, parentId) {
      for (const node of tree) {
        if (node.id === parentId) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = this.findParentNode(node.children, parentId);
          if (found) return found;
        }
      }
      return null;
    },

    // 递归检查子节点是否匹配
    checkChildrenMatch(children, searchValue) {
      for (let child of children) {
        // 子节点自身匹配
        if (child.categoryName && child.categoryName.toLowerCase().includes(searchValue)) {
          return true;
        }
        // 递归检查子节点的后代
        if (child.children && child.children.length > 0) {
          if (this.checkChildrenMatch(child.children, searchValue)) {
            return true;
          }
        }
      }
      return false;
    },
    handleNodeClick(data) {
      this.treeID = data.id;
      this.isChildrenNode = data.nodeLayerIndex
      this.handleQuery();
    },

    renderContent(h, { node, data }) {
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
          // Original problematic code
          this.$nextTick(function () {
            this.$refs.tree.setCurrentKey(this.treeID);
          });

          // Fixed code with null check and better error handling
          this.$nextTick(function () {
            // Add a safety check to ensure the tree component exists
            if (this.$refs.tree && typeof this.$refs.tree.setCurrentKey === 'function') {
              this.$refs.tree.setCurrentKey(this.treeID);
            } else {
              // Optional: Log for debugging (can be removed in production)
              console.log('Tree component not ready yet, skipping setCurrentKey');
            }
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
        this.$message.error(this.$t('matchingStrategy.ruleNameExists'));
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
.matching-strategy-container {
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.matching-layout {
  height: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.left-panel,
.right-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.el-popup-parent--hidden /deep/ .el-loading-mask {
  background: "rgba(0, 0, 0, 0.7)" !important;
}

.left-card {
  border-radius: 10px;
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .el-card__body {
    flex: 1;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.search-card {
  border-radius: 10px;
  flex-shrink: 0;
  margin-bottom: 20px;
}

.table-card {
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .el-card__body {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.head-container:last-child {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.search-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.addMsg /deep/ .el-input--medium {
  width: 237px;
}

.addMsg ::v-deep .el-input {
  width: 100%;
}

.addMsg ::v-deep .el-select {
  width: 100%;
}

.addMsg .el-select ::v-deep .el-input {
  width: 100%;
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

.addMsg ::v-deep.el-dialog__body {
  padding: 30px;
}

.addMsg ::v-deep.el-form {
  margin-bottom: 0;
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

.yuanDataClass {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.yuanDataClass /deep/ .el-form-item {
  width: 30%;
  margin-bottom: 0;
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

.rulesContClass /deep/ .el-input,
.el-autocomplete {
  width: calc(100% - 48px);
}

.rulesContClass /deep/ .el-autocomplete .el-input {
  width: 100%;
}

.rulesContClass /deep/ .el-form-item__label {
  white-space: nowrap;
  width: 100%;
}

.ruleValueClass /deep/ .el-input {
  width: calc(20%);
}

.tableBox {
  overflow-y: auto;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #e2e8f0;
}

.addTextBtn {
  font-weight: 700;
  color: #1890ff;
  float: inline-end;
}

.addTextBtn:hover {
  cursor: pointer;
}

.serachInput {
  margin-bottom: 20px;

  .el-input__inner {
    background-color: #f8fafc;
  }
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

.tree-node-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 8px;
}

.node-level {
  font-size: 12px;
  font-weight: 500;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.node-label-wrapper {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-label {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-scroll-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  max-height: none;
}

/* ::v-deep
  .el-tree--highlight-current
  .el-tree-node.is-current
  > .el-tree-node__content {
  background-color: #baf !important;
} */
::v-deep .el-row {
  display: flex;
  height: 100%;
  align-items: stretch;
  flex: 1;
  overflow: hidden;
}

::v-deep .el-col {
  display: flex;
  height: 100%;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}
</style>
