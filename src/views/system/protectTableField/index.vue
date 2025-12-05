<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24" style="height: calc(100vh - 75px); overflow-y: auto;">
        <div class="head-container">
          <span style="display: inline-block;background-color: #eee; font-size: 14px; padding: 5px 10px;">所属标准</span>
          <el-select v-model="projectId" class="serachInput" @change="treeOptionsSelectChange" placeholder="全部"
            style="margin-bottom: 20px">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="head-container" v-loading="treeLoading">
          <el-tree :data="dataCategoryList" :props="dataDefaultProps" show-checkbox :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" node-key="id" @check="treeCheck"
            :highlightCurrent="isHighlight" :render-content="renderContent" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryParams" class="yuanDataClass" size="small" :inline="true">
          <el-form-item label="来源业务系统" prop="businessName">
            <el-input v-model="queryParams.businessName" clearable @input="inputSearch" placeholder="请输入来源业务系统"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="安全分级" prop="securityLevel">
            <el-select v-model="queryParams.securityLevel" clearable multiple @change="handleQuery" placeholder="全部">
              <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分类" class="addSelectClass">
            <el-select ref="categorySelectRef" v-model="resultFormNodeName" @change="handleQuery" filterable
              placeholder="搜索分类..." :filter-method="handleCategoryFilter">
              <el-option style="height: 100%; padding: 0" value="">
                <el-tree :data="categoryList" :props="defaultProps" show-checkbox :expand-on-click-node="true"
                  :filter-node-method="filterCategoryNode" ref="categoryTreeRef" node-key="id" highlight-current
                  @check="resultHandleNodeClick" />
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="个人信息识别" class="addSelectClass">
            <el-select ref="piiSelectRef" v-model="piiNodeName" filterable placeholder="搜索个人信息识别..."
              :filter-method="handlePiiFilter">
              <el-option style="height: 100%; padding: 0" value="">
                <el-tree :data="piiList" :props="defaultProps" show-checkbox :expand-on-click-node="true"
                  :filter-node-method="filterPiiNode" ref="piiTreeRef" node-key="id" highlight-current
                  @check="piiHandleNodeCheck" />
              </el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item> -->
          <!-- <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button> -->
          <!-- <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button> -->
          <!-- </el-form-item> -->
        </el-form>
        <div style="margin-bottom: 8px; display: flex;justify-content: flex-start;">
          <!-- <el-button type="primary" icon="el-icon-link" size="medium" @click="apiSumbit()">API调用</el-button> -->
          <el-button type="primary" plain icon="el-icon-document" size="medium" @click="downloadFile()">清单导出</el-button>
        </div>
        <el-table v-loading="loading" height="620px" :data="protectTableFieldList"
          @selection-change="handleSelectionChange" class="tableBox" ref="tableRef">
          <template slot="empty">
            <el-empty description="暂无数据"></el-empty>
          </template>
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="字段名" align="center" prop="fieldName" show-overflow-tooltip />
          <el-table-column label="字段注释" align="center" prop="fieldRemark" show-overflow-tooltip />
          <el-table-column label="来源业务系统" align="center" prop="businessName" show-overflow-tooltip />
          <el-table-column label="数据源" align="center" prop="sourceName" show-overflow-tooltip />
          <el-table-column label="所属库" align="center" prop="databaseName" show-overflow-tooltip />
          <el-table-column label="所属表" align="center" prop="tableName" show-overflow-tooltip />
          <el-table-column label="分类" align="center" prop="categoryName" min-width="250" show-overflow-tooltip />
          <el-table-column label="个人信息识别" align="center" prop="piiDetectionName" show-overflow-tooltip />
          <el-table-column label="安全分级" align="center" prop="securityLevelName" show-overflow-tooltip />
          <el-table-column label="建议防护措施" prop="protectMethod" width="200">
            <!-- 自定义标题样式 -->
            <template slot="header">
              <div style="text-align: center;">建议防护措施</div>
            </template>
            <!-- 内容保持默认靠左 -->
            <template slot-scope="scope">
              <el-tag class="tagsBox custom-plain-tag" v-for="(item, index) in scope.row.protectMethodNameList"
                :key="item + index" :style="{
                  '--tag-color': colorFn(item),
                  '--tag-rgb': hexToRgb(colorFn(item))
                }" plain>
                {{ item }}
              </el-tag>
            </template>
          </el-table-column>
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
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>
    <!-- 新增编辑框 -->
    <el-dialog title="获取打标结果" v-loading="apiDialogLoading" :visible.sync="apiDialogShow" width="800px" append-to-body
      :close-on-click-modal="true">
      <div class="apiDialogMain">
        <div class="apiDialogMain_head">
          <div>请求示例：</div>
          <div><el-input type="textarea" :rows="7" readonly placeholder="请输入内容" v-model="textarea">
            </el-input></div>
        </div>
        <div class="apiDialogMain_body">
          <div>响应示例：</div>
          <!-- <pre v-html="textarea2"></pre>
          <div><el-input readonly resize="none" type="textarea" :rows="16" placeholder="请输入内容" v-model="textarea2">
            </el-input></div> -->
          <vue-json-viewer preview-mode :value="textarea2" :copyable="copyable">
            <template slot="copy">
              <i class="el-icon-document-copy" title="复制" @click="mgsElemesFn"></i>
            </template>
          </vue-json-viewer>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="apiCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getDatabaseList, protectTableFieldList, exportReport, getDatabaseSource, listByPublished } from "@/api/system/protectTableField";
import { getFrameworks, treeListI, } from "@/api/system/protectCategory";
import Cookies from "js-cookie";
import 'vue-json-viewer/style.css'
import router from "@/router";
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
      copyable: { copyText: '复制', copiedText: '复制成功' },
      routeDataShow: false,
      treeIds: []
    };
  },
  watch: {
    filterName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.init()
  },
  methods: {
    colorFn(item) {
      switch (item) {
        case '加密':
          return '#70b503';
        case 'DLP':
          return '#0600ff';
        case '脱敏':
          return '#f59b22';
        case '无保护':
          return '#409eff';
        case '空':
          return '#909399';
        default:
          return '#909399';
      }
    },
    hexToRgb(hex) {
      if (!hex || typeof hex !== 'string' || hex.length !== 7 || hex[0] !== '#') {
        return '0, 0, 0';
      }
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    },
    /**
     * 自定义树节点渲染，为不同层级节点添加不同的SVG图标
     * 第一层：sysBusiness，第二层：database1，第三层：table1
     */
    renderContent(h, { node, data }) {
      // 根据节点层级确定图标类型
      let iconClass = 'sysBusiness'; // 默认第一层图标
      if (node.level === 2) {
        iconClass = 'database1'; // 第二层图标
      } else if (node.level === 3) {
        iconClass = 'table1'; // 第三层图标
      }
      
      return h('span', { class: 'custom-tree-node' }, [
        h('svg-icon', { 
          class: 'tree-node-icon',
          attrs: { 
            iconClass: iconClass 
          },
          style: { marginRight: '8px' }
        }),
        h('span', { class: 'tree-node-label' }, node.label)
      ]);
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
      this.$message.success('复制成功');
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
      this.$message.success(`${res.msg},${flag}${res.data}个`)
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
        this.$confirm(`确定批量${flag}吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let data = {
            ids: ids.join(',')
          }
          if (flag == '启用') {
            data.enable = true
            attachStatus(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.getList()
              }
            })
          } else if (flag == '禁用') {
            data.enable = false
            attachStatus(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.getList()
              }
            })
          } else if (flag == '删除') {
            for (let item of dataS) {
              if (item.dataSource === '内置') {
                this.$message({
                  type: 'warning',
                  message: '内置数据源不允许删除',
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
            this.$message({ message: '未知异常', type: 'warning' })
          }
          // 接口
        }).catch(() => {

        });
      } else {
        this.$message({ message: '请选择至少一条数据', type: 'warning' })
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
              this.getList()
            });
          } else {
            this.treeIds = []
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
        treeList = list.filter(item => item.level === 2)
        this.treeID = treeList.map(item => item.id).join()
        this.treeIds = treeList.map(item => item.id)
        this.handleQuery();
      } else {
        this.protectTableFieldList = []
        this.queryParams.pageNum = 1
        this.queryParams.pageSize = 10
        this.total = 0
      }
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
      this.$refs.tree.setCheckedNodes(data);
      let treeList = []
      let list = this.$refs.tree.getCheckedNodes()
      treeList = list.filter(item => item.level === 2)
      this.treeID = treeList.map(item => item.id).join()
      this.treeIds = treeList.map(item => item.id)
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
          this.getList()
        } else {
          this.$nextTick(() => {
            this.selectAllFirstLevelNodes(this.dataCategoryList)
            this.getList()
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
        // tableIds: this.treeID,
        tableIds: this.treeIds,
        projectId: this.projectId,
        securityLevelIds: this.queryParams.securityLevel.length ? this.queryParams.securityLevel : null,
        // securityLevelIds: this.queryParams.securityLevel.length ? this.queryParams.securityLevel.join() : null,
        businessName: this.queryParams.businessName,
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        // categoryId: this.queryParams.categoryId
        categoryIds: this.queryParams.categoryId,
        piiDetection: this.queryParams.piiDetection
      }
      listByPublished(params).then((response) => {
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
      try {
        this.loading = true;
        const params = {
          tableIds: this.treeIds,
          projectId: this.projectId,
          securityLevelIds: this.queryParams.securityLevel.length ? this.queryParams.securityLevel : null,
          // securityLevelIds: this.queryParams.securityLevel.length ? this.queryParams.securityLevel.join() : null,
          businessName: this.queryParams.businessName,
          pageNum: this.queryParams.pageNum,
          pageSize: this.queryParams.pageSize,
          categoryId: this.queryParams.categoryId
        };
        const res = await exportReport(params);
        if (res.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          this.$message.error('导出失败')
          this.getList()
          return
        }
        // 创建一个Blob对象
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        // 创建一个URL对象
        const url = window.URL.createObjectURL(blob);
        // 创建一个a标签并设置href属性
        const link = document.createElement('a');
        link.href = url;
        link.download = '数据资产目录.xlsx'; // 设置下载后的文件名
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

      } catch (error) {
        this.loading = false;
        this.$message.error('导出失败，请稍后再试');
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
  width: 60%;
  margin-right: 10px;

  input {
    height: 28px !important;
    line-height: 28px !important;
  }
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

.uploadClass {
  width: 20% !important;
}

.addSelectClass /deep/ .el-select {
  width: calc(100%);
}

.tableBox {
  overflow-y: auto;
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

/* 自定义plain标签样式 */
::v-deep .custom-plain-tag {
  /* 使用CSS变量设置颜色 */
  color: var(--tag-color) !important;
  border-color: var(--tag-color) !important;
  /* 背景色使用RGB值加透明度实现浅色效果 */
  background-color: rgba(var(--tag-rgb), 0.1) !important;
  margin-right: 5px;
}

/* 去除默认hover样式干扰 */
::v-deep .custom-plain-tag:hover {
  background-color: rgba(var(--tag-rgb), 0.15) !important;
}

/* 自定义树节点样式 */
.custom-tree-node {
  display: flex;
  align-items: center;
  height: 24px;
  line-height: 24px;
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
</style>
