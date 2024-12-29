<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <span style="display: inline-block;background-color: #eee; font-size: 14px; padding: 5px 10px;">所属框架</span>
          <el-select v-model="projectId" class="serachInput" @change="treeOptionsSelectChange" placeholder="全部"
            style="margin-bottom: 20px">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="head-container" v-loading="treeLoading">
          <el-tree :data="dataCategoryList" :props="dataDefaultProps" show-checkbox default-expand-all
            :expand-on-click-node="false" :filter-node-method="filterNode" ref="tree" node-key="id" @check="treeCheck"
            :highlightCurrent="isHighlight" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryParams" size="small" :inline="true" label-width="100px">
          <el-form-item label="分类" class="addSelectClass">
            <el-select ref="resultSelectRef" v-model="resultFormNodeName" @change="handleQuery">
              <el-option style="height: 100%; padding: 0" value="">
                <el-tree :data="categoryList" :props="defaultProps" :expand-on-click-node="true"
                  :filter-node-method="filterNode" ref="treeSelect" node-key="id" highlight-current
                  @node-click="resultHandleNodeClick" />
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="安全分级" prop="securityLevel">
            <el-select v-model="queryParams.securityLevel" clearable multiple @change="handleQuery" placeholder="全部">
              <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="来源业务系统" prop="businessName">
            <el-input v-model="queryParams.businessName" clearable @input="inputSearch" placeholder="请输入来源业务系统"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item>
            <!-- <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button> -->
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          </el-form-item>
          <div style="margin: 20px 20px 20px 0; display: flex;justify-content: flex-end;">
            <el-button type="primary" icon="el-icon-refresh" size="medium" @click="apiSumbit()">aip调用</el-button>
            <el-button type="primary" icon="el-icon-warning" size="medium" @click="downloadFile()">清单导出</el-button>
          </div>
        </el-form>

        <el-table v-loading="loading" :data="protectTableFieldList" @selection-change="handleSelectionChange"
          class="tableBox" ref="tableRef">
          <el-table-column type="selection" width="60" align="center" />
          <el-table-column label="字段名" align="center" prop="fieldName" show-overflow-tooltip />
          <el-table-column label="字段注释" align="center" prop="fieldRemark" show-overflow-tooltip />
          <el-table-column label="来源业务系统" align="center" prop="businessName" show-overflow-tooltip />
          <el-table-column label="数据源" align="center" prop="sourceName" show-overflow-tooltip />
          <el-table-column label="所属库" align="center" prop="databaseName" show-overflow-tooltip />
          <el-table-column label="所属表" align="center" prop="tableName" show-overflow-tooltip />
          <el-table-column label="分类" align="center" prop="categoryName" min-width="250" show-overflow-tooltip />
          <el-table-column label="安全分级" align="center" prop="securityLevelName" show-overflow-tooltip />
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
import VueJsonViewer from 'vue-json-viewer';
import 'vue-json-viewer/style.css'
import router from "@/router";
export default {
  name: "ProtectTableField",
  components: { Treeselect, VueJsonViewer },

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
      resultFormNodeName: '',
      Token: '',
      textarea: ``,
      copyable: { copyText: '复制', copiedText: '复制成功' },
      routeDataShow: false,
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
    // 左侧树下拉选change事件
    treeOptionsSelectChange(val) {
      this.routeDataShow = false
      this.httpDemo()
      this.getProtectCategory(val)
      this.getProtectCategoryQuery(val)
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
      });
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
        this.handleQuery();
      }else{
        this.protectTableFieldList =[]
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
    },
    getProtectCategory(key) {
      this.treeLoading = true
      let data = {
        projectId: key,
      };
      getDatabaseList(data).then((resp) => {
        this.dataCategoryList = resp.data
        if (resp.data.length == 0) {
          this.Loading = false
        } else {
          // for (let index in resp.data) {
          //   if (resp.data[index].parentId === 0) {
          //     this.dataCategoryList.splice(index, 1)
          //     break
          //   }
          // }
          // this.dataCategoryList.unshift({
          //   ancestors: "0",
          //   categoryDescribe: "",
          //   categoryName: "全部",
          //   id: 1340,
          //   minSecurityLevel: -1,
          //   nodeLayerIndex: 1,
          //   parentId: 0,
          // })
          this.$nextTick(function () {
            this.selectAllFirstLevelNodes(this.dataCategoryList)
            this.getList()
          });
          let tempList = JSON.parse(JSON.stringify(this.dataCategoryList))
          for (let item of tempList) {
            item.label = item.categoryName
          }
          this.dataCategoryList = this.handleTree(tempList, "id")
          this.categoryListEdit = this.handleTree(tempList, "id")
        }
      this.Loading = false
        this.treeLoading = false
      });
    },
    getList() {
      this.loading = true;
      let params = {
        tableIds: this.treeID,
        projectId: this.projectId,
        securityLevelIds: this.queryParams.securityLevel.length ? this.queryParams.securityLevel.join() : null,
        businessName: this.queryParams.businessName,
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        categoryId: this.queryParams.categoryId
      }
      listByPublished(params).then((response) => {
        if (response.code == 200 && response.rows) {
          this.protectTableFieldList = response.rows || [];
          this.total = response.total;
        }
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
      this.resultFormNodeName = '',
        this.queryParams.categoryId = ''
      this.resetForm("queryParams");
      this.handleQuery();
    },
    async downloadFile() {
      try {
        this.loading = true;
        const params = {
          tableIds: this.treeID,
          projectId: this.projectId,
          securityLevelIds: this.queryParams.securityLevel.length ? this.queryParams.securityLevel.join() : null,
          businessName: this.queryParams.businessName,
          pageNum: this.queryParams.pageNum,
          pageSize: this.queryParams.pageSize,
          categoryId: this.queryParams.categoryId
        };
        const res = await exportReport(params);
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
    getProtectCategoryQuery(key) {
      this.treeLoading = true
      let data = {
        parentId: key,
        needSub: 1,
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
          this.categoryList = this.handleTree(tempList, "id",)
          this.categoryListEdit = this.handleTree(tempList, "id")
        }
        this.Loading = false
        this.treeLoading = false
      });
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
        this.queryParams.categoryId = node.id
        this.$refs.resultSelectRef.blur()
        this.handleQuery()
      }
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.categoryName.indexOf(value) !== -1;
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
  height: calc(100% - 158px - 52px);
}

.apiDialogMain {
  padding: 20px;
}

.apiDialogMain_body /deep/ .jv-container {
  max-height: 350px;
  overflow-y: scroll;

}
</style>
