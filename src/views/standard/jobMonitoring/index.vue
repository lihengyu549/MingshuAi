<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-select v-model="queryParams.categoryId" class="serachInput" @change="treeOptionsSelectChange"
            placeholder="全部" style="margin-bottom: 20px" filterable>
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="head-container" v-loading="treeLoading">
          <el-input v-model="filterName" placeholder="搜索树节点..." clearable size="mini" style="margin-bottom: 20px;" />
          <el-tree :indent="8" :data="categoryList" :props="defaultProps" :default-expanded-keys="[treeID]"
            :current-node-key="treeID" :expand-on-click-node="false" :filter-node-method="filterNode" ref="tree"
            node-key="id" highlight-current @node-click="handleNodeClick">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span class="node-label" :title="node.label">{{ node.label }}</span>
              <!-- 只在根节点显示齿轮按钮 -->
              <!-- <el-button v-if="isRootNode(data)" type="text" size="large" icon="el-icon-setting"
                @click.stop="goToMenuEdit(data)" style="color: #26244ce0;">
              </el-button> -->
              <svg-icon icon-class="setting" v-if="isRootNode(data)" @click.stop="goToMenuEdit(data)" />
            </span>
          </el-tree>
        </div>
      </el-col>
      <!-- 用户数据部分保持不变 -->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryParams" class="yuanDataClass" size="small" :inline="true"
          v-show="showSearch" label-width="auto">
          <el-form-item label="子类名称" prop="name">
            <el-input v-model="queryParams.name" @input="inputSearch" placeholder="请输入子类名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="确认防护措施" prop="confirmProtectMethod">
            <el-select v-model="queryParams.confirmProtectMethod" @change="selectProjectIdChange" multiple
              placeholder="全部">
              <el-option v-for="item in confirmProtectMethodList" :key="item.dictValue" :label="item.dictLabel"
                :value="item.dictLabel">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="来源" prop="dataSourceId">
            <el-select v-model="queryParams.dataSourceId" clearable @change="dataSourceIdIdChange" placeholder="全部"
              :loading="loading">
              <el-option v-for="item in sourceList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="安全分级" prop="levelId">
            <el-select v-model="queryParams.levelId" @change="selectProjectIdChange" multiple placeholder="全部">
              <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="dataOwner" label="数据持有者">
            <el-select v-model="queryParams.dataOwner" @change="selectProjectIdChange" clearable placeholder="全部">
              <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.userName">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="medium" @click="addFn">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-close" size="medium" @click="enabledFn('删除')">删除</el-button>
          </el-col>
        </el-row>
        <el-table v-loading="loading" :data="protectTableFieldList" height="650px" ref="tableRef" class="tableBox">
          <el-table-column type="selection" width="60" align="center">
          </el-table-column>
          <el-table-column label="子类名称" align="center" prop="attachData" />
          <el-table-column label="安全分级" align="center" prop="securityLevelName" />
          <el-table-column label="建议防护措施" prop="protectMethodName" width="200">
            <!-- 自定义标题样式 -->
            <template slot="header">
              <div style="text-align: center;">建议防护措施</div>
            </template>
            <!-- 内容保持默认靠左 -->
            <template slot-scope="scope">
              <el-tag class="tagsBox custom-plain-tag" v-for="item in scope.row.protectMethodNameList" :key="item"
                :style="{
                  '--tag-color': colorFn(item),
                  '--tag-rgb': hexToRgb(colorFn(item))
                }" plain>
                {{ item }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="数据持有者" align="center" prop="dataOwner" />
          <el-table-column label="确认防护措施" align="center" prop="confirmProtectMethod" width="200">
            <template slot-scope="scope">
              <el-tag class="tagsBox custom-plain-tag" v-for="item in scope.row.confirmProtectMethodList" :key="item"
                :style="{
                  '--tag-color': colorFn(item),
                  '--tag-rgb': hexToRgb(colorFn(item))
                }" plain>
                {{ item }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="来源" align="center" prop="dataSource">
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
    <el-dialog :title="addOrEdit.title" v-loading="importDataLoading" :top="tagsShow ? '15vh' : '8vh'"
      :visible.sync="addOrEdit.show" width="700px" append-to-body :close-on-click-modal="addOrEdit.flag == 3">
      <el-form :model="addOrEditDataRuls" size="medium" v-if="addOrEdit.show" :rules="addOrEditRules" ref="addOrEdit"
        label-width="120px" style="padding-right: 60px;">
        <el-form-item label="子类名称" prop="attachData">
          <el-input v-model="addOrEditDataRuls.attachData" :disabled="addOrEdit.flag == 3"
            @input="sonNameTestingFn(addOrEditDataRuls.attachData)" maxlength="50" placeholder="请输入子类名称"></el-input>
        </el-form-item>
        <el-form-item class="addSelectClass" label="所属父类" prop="categoryId">
          <el-select ref="addSelectRef" v-model="addNodeName" :disabled="addOrEdit.flag == 3" filterable
            :filter-method="handleAddSelectInput">
            <el-option style="height: 100%; padding: 0" value="">
              <el-tree :data="categoryList" :props="defaultProps" :expand-on-click-node="true"
                :filter-node-method="filterNode" ref="treeSelect" node-key="id" highlight-current
                @node-click="addHandleNodeClick" />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="addSelectClass" prop="minSecurityLevel" label="安全分级">
          <el-select v-model="addOrEditDataRuls.minSecurityLevel" placeholder="全部" :disabled="addOrEdit.flag == 3">
            <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="addSelectClass" prop="minSecurityLevel" label="建议防护措施">
          <el-select v-model="addOrEditDataRuls.minSecurityLevel" :disabled="true" placeholder="全部">
            <el-option v-for="item in protectMethodIdList" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictValue">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="addSelectClass" prop="dataOwner" label="数据持有者">
          <el-select v-model="addOrEditDataRuls.dataOwner" placeholder="全部" :disabled="addOrEdit.flag == 3">
            <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.userName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="addSelectClass" prop="confirmProtectMethod" label="确认防护措施">
          <el-select v-model="addOrEditDataRuls.confirmProtectMethod" multiple placeholder="全部"
            :disabled="addOrEdit.flag == 3">
            <el-option v-for="item in confirmProtectMethodList" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictLabel">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="子类描述" prop="additional">
          <el-input v-model="addOrEditDataRuls.additional" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }"
            :disabled="addOrEdit.flag == 3" maxlength="500" placeholder="请输入子类描述"></el-input>
        </el-form-item>
        <el-form-item v-if="true" class="addSelectClass AiStudesCont" label="特征标签" prop="tags">
          <div class="tagsClass" :style="tagsShow ? heightSmall : heightBig" style="width: 100%;">
            <el-tag v-for="(tag, index) in tags" type="info" size="small" :key="tag + index" class="mx-1"
              :closable="addOrEdit.flag !== 3" @close="handleClose(tag, index)" style="margin: 0 10px;">
              {{ tag }}
            </el-tag>
            <el-input class="input-new-tag" v-if="inputVisible && countIs40" maxlength="10" v-model="inputValue"
              ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm">
            </el-input>
            <el-button v-if="!inputVisible && countIs40 && addOrEdit.flag != 3" class="button-new-tag" size="small"
              @click="showInput">+ 新增</el-button>
          </div>
          <el-button class="button-new-tag" size="small" v-show="tags.length > 10" @click="tagsShow = !tagsShow">{{
            tagsShow ? '展开' : '收起' }}</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain v-if="addOrEdit.flag == 1 || addOrEdit.flag == 2" @click="addSubmitForm">确
          定</el-button>
        <el-button @click="addCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {
  listByDataType
} from "@/api/dictData";
import {
  addAttachData,
  editAttachData,
  selectUserListAll,
  deleteAttachData,
} from "@/api/standard";
import { treeListI, getAttachData, attachStatus, nameTesting, getFrameworks } from "@/api/system/protectCategory";
export default {
  name: "ProtectTableField",
  components: { Treeselect },
  dicts: ['sys_risk_level'],
  data() {
    return {
      heightSmall: {
        height: '75px',
        overflowY: 'auto'
      },
      heightBig: {
        height: '180px',
        overflowY: 'auto'
      },
      inputVisible: false,
      countIs40: true,// 数量是否小于40
      tagsShow: false,
      inputValue: '',
      categoryName: '',
      debounceTimeout: null,//防抖动
      treeOptions: [],
      protectMethodIdList: [],
      confirmProtectMethodList: [],
      addOrEdit: {
        title: '新增',
        show: false,
        flag: 1,// 1新增 2编辑 3查看
      },
      treeLoading: false,
      tags: [],
      // 表单校验
      addOrEditRules: {
        categoryId: [
          {
            required: true, message: "请选择所属父级", trigger: "blur"
          }
        ],
        minSecurityLevel: [
          { required: true, message: "请选择安全分级", trigger: "blur" },
        ],
        dataOwner: [
          { required: true, message: "请选择数据持有者", trigger: "blur" },
        ],
        attachData: [
          { required: true, message: "请输入子类名称", trigger: "blur" }
        ],
        tags: [
          { validator: this.tagsRlues, trigger: 'blur', required: true, }
        ]
      },
      treeID: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryId: '',//左侧树id
        name: '',//子类名称
        dataSourceId: '',//来源
        levelId: [],//安全级别，
        dataSource: '',
      },
      addOrEditDataRuls: {
        additional: '',
        attachData: '',
        categoryId: '',
        minSecurityLevel: null,
        dataOwner: '',
      },
      importDataLoading: false,
      filterName: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      isName: true,
      Loading: false,
      sourceList: [
        {
          value: 1,
          label: '内置'
        },
        {
          value: 2,
          label: '自定义'
        },
      ],
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 数据库字段名表格数据
      protectTableFieldList: [],
      categoryList: [],
      yuanCategoryList: [],
      userList: [],
      categoryListEdit: null,
      addNodeName: "",
    };
  },
  watch: {
    filterName(val) {
      this.$refs.tree.filter(val);
    },
    tags: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val.length >= 40) {
          this.countIs40 = false
          this.$modal.msgWarning("学习内容最多定义40个标签");
        } else {
          this.countIs40 = true
        }
        if (val.length >= 10) {
          this.tagsShow = false
        } else {
          this.tagsShow = true
        }
      }
    }
  },
  created() {
    if (this.$route.query && this.$route.query.id) {
      this.queryParams.categoryId = this.$route.query.id * 1
    }
    this.gettreeOptionsList(this.$route.query.id)
    this.getDictData()
    this.getSelectUserListAll()
  },
  methods: {
    // 判断是否为根节点
    isRootNode(data) {
      return data.parentId === 0 || !data.parentId;
    },

    // 跳转到菜单编辑页面
    goToMenuEdit(data) {
      this.$router.push({
        path: '/editMenu',
        query: { id: data.id }
      });
    },

    //  字典数据
    getDictData() {
      listByDataType({ type: 'sys_protect_method' }).then(res => {
        this.protectMethodIdList = res.data;
      })
      listByDataType({ type: 'sys_confirm_protect_method' }).then(res => {
        this.confirmProtectMethodList = res.data;
      })
    },
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
    //  获取用户列表
    getSelectUserListAll() {
      selectUserListAll().then(res => {
        this.userList = res.data;
      })
    },
    // 自定义校验规则
    tagsRlues(rule, value, callback) {
      if (this.tags.length < 5) {
        callback(new Error("特征标签需要至少填写5个！"));
      } else {
        callback();
      }
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        if (this.tags.includes(inputValue)) {
          this.$message({ message: '该标签已存在', type: 'warning' })
        } else {
          this.tags.push(inputValue);
        }
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    addFn() {
      this.addOrEdit.flag = 1
      this.addOrEdit.title = '新增'
      this.addOrEdit.show = true
      this.addOrEditDataRuls = {}
      this.addOrEditDataRuls.dataOwner = this.$store.state.user.name
      this.tagsShow = true
      this.tags = []
      this.addNodeName = ''
    },
    /** 新增确定方法 */
    async addSubmitForm() {
      this.$refs["addOrEdit"].validate(async (valid) => {
        let params = {
          attachData: this.addOrEditDataRuls.attachData,
          categoryId: this.addOrEditDataRuls.categoryId,
          minSecurityLevel: this.addOrEditDataRuls.minSecurityLevel,
          attachDescribe: this.addOrEditDataRuls.additional,
          featureLabel: this.tags.join(),
          confirmProtectMethod: this.addOrEditDataRuls.confirmProtectMethod.join(),
          dataOwner: this.addOrEditDataRuls.dataOwner,
          protectMethod: this.addOrEditDataRuls.minSecurityLevel,

        }
        if (valid) {
          this.importDataLoading = true
          await this.rulsNameIsRight(this.addOrEditDataRuls.categoryId, params.attachData, this.addOrEditDataRuls.id)
          if (!this.isName) {
            this.$modal.msgError("子类名称重复,请更改");
            this.importDataLoading = false
            return
          }
          if (this.addOrEditDataRuls.id != null) {
            params.id = this.addOrEditDataRuls.id
            editAttachData(params).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.getList();
              this.addOrEdit.show = false
              this.importDataLoading = false
            })
              .catch((err) => {
                this.importDataLoading = false
              })
          } else {
            addAttachData(params).then((response) => {
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
      return null;
    },

    addHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
        if (parentLabels) {
          this.addNodeName = parentLabels.join('-') + '-' + node.categoryName;
        } else {
          this.addNodeName = node.categoryName + '-';
        }
        this.addOrEditDataRuls.categoryId = node.id
        this.$refs.addSelectRef.blur()
      }
    },

    // 处理添加选择框的输入事件
    handleAddSelectInput(value) {
      if (this.$refs.treeSelect) {
        this.$refs.treeSelect.filter(value);
      }
    },
    editFn(row) {
      this.addOrEdit.flag = 2
      this.addOrEditDataRuls = JSON.parse(JSON.stringify(row))
      this.addOrEditDataRuls.minSecurityLevel = row.minSecurityLevel + ''
      this.tags = row.featureLabel ? row.featureLabel.split(',') : []
      this.addOrEditDataRuls.confirmProtectMethod = Array.isArray(row.confirmProtectMethod)
        ? row.confirmProtectMethod
        : (row.confirmProtectMethod ? row.confirmProtectMethod.split(',') : []);
      this.addOrEdit.show = true
      this.addOrEdit.title = '编辑'
      this.addNodeName = row.owner
      this.tagsShow = false
      this.$set(this.addOrEditDataRuls, 'additional', row.attachDescribe)
    },
    lookFn(row) {
      this.addOrEdit.flag = 3
      this.addOrEditDataRuls = row
      this.addOrEditDataRuls.additional = row.attachDescribe
      this.addOrEditDataRuls.minSecurityLevel = row.minSecurityLevel + ''
      this.tags = row.featureLabel ? row.featureLabel.split(',') : []
      this.addNodeName = row.owner
      this.addOrEdit.show = true
      this.addOrEdit.title = '查看'
      this.tagsShow = false
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
            ids: ids.join(',')
          }
          if (flag == '启用') {
            data.enable = true
            attachStatus(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.handleQuery();
              }
            })
          } else if (flag == '禁用') {
            data.enable = false
            attachStatus(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.handleQuery();
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
            deleteAttachData(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.handleQuery();
              }
            })
          } else {
            this.$message({ message: '未知异常', type: 'warning' })
          }
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
    gettreeOptionsList(id) {
      this.Loading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        if (response.data.length > 0) {
          if (!id) {
            this.queryParams.categoryId = response.data[0].id;
          }
          this.getProtectCategory(this.queryParams.categoryId);
        } else {
          this.Loading = false

        }
      });
    },
    sonNameTestingFn(val) {
      this.addOrEditDataRuls.attachData = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    // tags 关闭方法
    handleClose(tag, index) {
      this.tags.splice(index, 1);
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
      if (data.addEdit) {
        return
      } else {
        this.treeID = data.id;
        this.handleQuery();
      }
    },

    // 定时器，防抖使用
    inputSearch(data) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleQuery()
      }, 500);
    },
    selectProjectIdChange(val) {
      this.handleQuery()
    },
    dataSourceIdIdChange(val) {
      this.sourceList.forEach((item) => {
        if (val == item.value)
          this.queryParams.dataSource = item.label
      })
      this.handleQuery()
    },
    getProtectCategory(key) {
      this.treeLoading = true
      let data = {
        parentId: key,
        ifAddParent: 1,
      };
      treeListI(data).then((resp) => {
        this.categoryList = resp.data
        this.yuanCategoryList = resp.data
        if (resp.data.length == 0) {
          this.Loading = false
        } else {
          this.treeID = this.categoryList[0].id;
          this.$nextTick(function () {
            if (this.$refs.tree) {
              this.$refs.tree.setCurrentKey(this.treeID);
              this.$refs.tree.setCurrentKey(this.treeID);
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
        nodeId: this.treeID,
        levelId: this.queryParams.levelId.length ? this.queryParams.levelId.join() : '-1',
        confirmProtectMethod: this.queryParams.confirmProtectMethod.length ? this.queryParams.confirmProtectMethod.join() : '',
        dataSourceId: this.queryParams.dataSourceId ? this.queryParams.dataSourceId : 0,
      }
      getAttachData(params).then((response) => {
        this.protectTableFieldList = response.data.rows;
        this.protectTableFieldList.forEach((item) => {
          if (item.protectMethodName) {
            item.protectMethodNameList = item.protectMethodName.split(',');
          }
          if (item.confirmProtectMethod) {
            item.confirmProtectMethodList = item.confirmProtectMethod.split(',');
          }
        })
        this.total = response.data.total;
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
      this.treeID = this.categoryList[0].id
      this.$refs.tree.setCurrentKey(this.treeID);
      this.resetForm("queryParams");
      this.queryParams.dataSource = ''
      this.handleQuery();
    },
    async rulsNameIsRight(nodeId, name, id) {
      let params = {
        nodeId,
        name,
        id
      }
      let res = await nameTesting(params).then(res => {
        this.isName = res.data
      })
        .catch(err => {
          this.importDataLoading = true

        })
    },
  },
};
</script>

<style scoped>
.el-popup-parent--hidden /deep/ .el-loading-mask {
  background: "rgba(0, 0, 0, 0.7)" !important;
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

.AiStudesCont /deep/ .el-form-item__content {
  display: flex;
  justify-content: space-between;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.tagsClass {
  transition: all .5s ease-in-out;
}

.tagsClass::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tagsClass::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.tagsClass::-webkit-scrollbar-track {
  border-radius: 10px;
}

.searchBtn {
  margin-left: auto;
  height: 100%;
}

.searchBtn /deep/ .el-form-item__content {
  margin-left: 225px
}

.yuanDataClass {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
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

.tagsBox {
  /* border: none; */
  /* color: white; */
  /* border: none; */
  /* justify-content: space-between; */
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

.addNode {
  input {
    height: 23px;
    line-height: 23px;
  }
}

.node-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  line-height: 28px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
</style>