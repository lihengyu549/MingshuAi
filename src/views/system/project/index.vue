<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-select v-model="queryParams.categoryId" class="serachInput" @change="treeOptionsSelectChange"
            placeholder="全部" style="margin-bottom: 20px">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
          <el-button type="primary" size="mini" @click="importCli">框架导入</el-button>
        </div>
        <div class="head-container" v-loading="treeLoading">
          <el-tree :data="categoryList" :props="defaultProps" :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" node-key="id" highlight-current @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryParams" size="small" :inline="true" v-show="showSearch"
          label-width="90px">
          <el-form-item label="子类名称" prop="name">
            <el-input v-model="queryParams.name" @input="inputSearch" placeholder="请输入子类名称" clearable
              @keyup.enter.native="handleQuery" />
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
              <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <!-- <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button> -->
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          </el-form-item>
          <div style="margin: 20px 0 20px 25px;">
            <el-button type="primary" icon="el-icon-plus" size="medium" @click="addFn">新增</el-button>
            <el-button type="primary" icon="el-icon-delete" size="medium" @click="enabledFn('删除')">删除</el-button>
            <el-button type="primary" icon="el-icon-refresh" size="medium" @click="enabledFn('启用')">启用</el-button>
            <el-button type="primary" icon="el-icon-warning" size="medium" @click="enabledFn('禁用')">禁用</el-button>
          </div>
        </el-form>
        <el-table v-loading="loading" :data="protectTableFieldList" ref="tableRef" class="tableBox">
          <!-- <el-table-column width="55" align="center" /> -->
          <el-table-column type="selection" width="60" align="center">
          </el-table-column>
          <el-table-column label="子类名称" align="center" prop="attachData" />
          <el-table-column label="安全分级" align="center" prop="securityLevelName" />
          <el-table-column label="来源" align="center" prop="dataSource">
          </el-table-column>
          <el-table-column label="状态" align="center" prop="state">
            <template slot-scope="scope">
              <span>
                {{ scope.row.enable ? '启用' : '禁用' }}
              </span>
            </template>
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
    <el-dialog title="导入框架" v-loading="importDataLoading" :visible.sync="importData.importShow" width="700px"
      append-to-body :close-on-click-modal="false">
      <el-form class="importForm" :rules="importDataRules" :model="importData" size="medium" ref="importData"
        :inline="true" label-width="120px">
        <el-form-item label="框架名称" prop="categoryName">
          <el-input v-model="importData.categoryName" @input="nameTestingFn(importData.categoryName)" maxlength="50"
            placeholder="请输入框架名称"></el-input>
        </el-form-item>
        <el-form-item label="导入框架" prop="importFile">
          <el-input v-model="importData.importFile" readonly placeholder="支持EXCEL格式文件导入（.xls, .xlsx)"></el-input>
        </el-form-item>
        <el-form-item class="uploadClass">
          <el-upload class="upload-demo" :limit="1" :file-list="importData.fileList" :auto-upload="false"
            :http-request="submitForm" action="" accept=".xls,.xlsx" :show-file-list="false"
            :on-change="handleFileChange" :on-exceed="handleFileExceed">
            <el-button size="mini" type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <el-button style="margin-left: 100px;" size="small" type="text" @click="downloadFile" id="btnDownload" icon="el-icon-download">样例下载</el-button>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="importcancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 新增编辑框 -->
    <el-dialog :title="addOrEdit.title" v-loading="importDataLoading" :visible.sync="addOrEdit.show" width="700px"
      append-to-body :close-on-click-modal="addOrEdit.flag == 3">
      <el-form :model="addOrEditDataRuls" size="medium" v-if="addOrEdit.show" :rules="addOrEditRules" ref="addOrEdit"
        label-width="120px" style="padding-right: 60px;">
        <el-form-item label="子类名称" prop="attachData">
          <el-input v-model="addOrEditDataRuls.attachData" :disabled="addOrEdit.flag == 3" @input="sonNameTestingFn(addOrEditDataRuls.attachData)" maxlength="50" placeholder="请输入子类名称"></el-input>
        </el-form-item>
        <el-form-item class="addSelectClass" label="所属父类" prop="categoryId">
          <el-select ref="addSelectRef" v-model="addNodeName" :disabled="addOrEdit.flag == 3">
            <el-option style="height: 100%; padding: 0" value="">
              <el-tree :data="categoryList" :props="defaultProps" :expand-on-click-node="true"
                :filter-node-method="filterNode" ref="treeSelect" node-key="id" highlight-current
                @node-click="addHandleNodeClick" />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="addSelectClass" prop="minSecurityLevel" label="安全分级">
          <el-select v-model="addOrEditDataRuls.minSecurityLevel" placeholder="全部" :disabled="addOrEdit.flag == 3">
            <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="false" class="addSelectClass" label="AI自学习内容">
          <el-tag v-for="(tag, index) in tags" :key="tag.name" class="mx-1" closable @close="handleClose(tag, index)"
            :type="tag.type" style="margin: 0 10px;">
            {{ tag.name }}
          </el-tag>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="addOrEdit.flag == 1 || addOrEdit.flag == 2" @click="addSubmitForm">确
          定</el-button>
        <el-button @click="addCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { treeListI, categoryImport, getAttachData, attachStatus, forceLogout, updataAttach, nameTesting, addData, getFrameworks } from "@/api/system/protectCategory";
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
      debounceTimeout: null,//防抖动
      treeOptions: [],
      addOrEdit: {
        title: '新增',
        show: false,
        flag: 1,// 1新增 2编辑 3查看
      },
      treeLoading: false,
      tags: [
        { name: '标签一', type: 'info' },
        { name: '标签二', type: 'info' },
        { name: '标签三', type: 'info' },
        { name: '标签四', type: 'info' },
        { name: '标签五', type: 'info' }
      ],
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
        attachData: [
          { required: true, message: "请输入子类名称", trigger: "blur" }
        ],
      },
      // 表单校验
      importDataRules: {
        categoryName: [
          {
            required: true, message: "请输入框架名称", trigger: "blur"
          }
        ],
        importFile: [
          { required: true, message: "请选择导入框架文件", trigger: "blur" },
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
        attachData: '',
        categoryId: '',
        minSecurityLevel: null,
      },
      importDataLoading: false,
      filterName: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      isName: true,
      Loading: false,
      url:`${process.env.VUE_APP_BASE_API}/static/file/auth.zip`,
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
          value: -1,
          label: "全部"
        },
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
      addNodeName: "",
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
  methods: {
    addFn() {
      this.addOrEdit.flag = 1
      this.addOrEdit.title = '新增'
      this.addOrEdit.show = true
      this.addOrEditDataRuls = {}
      this.addNodeName = ''
    },
    clearAddFromData() {
      this.addOrEditDataRuls.attachData = ''
      this.addOrEditDataRuls.categoryId = ''
      this.addOrEditDataRuls.minSecurityLevel = null
      this.addOrEditDataRuls.id = ''
    },
    /** 新增确定方法 */
    async addSubmitForm() {
      this.$refs["addOrEdit"].validate(async (valid) => {
        let params = {
          name: this.addOrEditDataRuls.attachData,
          nodeId: this.addOrEditDataRuls.categoryId,
          securityLevel: this.addOrEditDataRuls.minSecurityLevel,
          additional:this.addNodeName
        }
        if (valid) {
          this.importDataLoading = true
          await this.rulsNameIsRight(this.addOrEditDataRuls.categoryId, params.name)
          if (!this.isName) {
            this.$modal.msgError("框架名称重复,请更改");
            this.importDataLoading = false
            return
          }
          if (this.addOrEditDataRuls.id != null) {
            params.id = this.addOrEditDataRuls.id
            updataAttach(params).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.getList();
              this.addOrEdit.show = false
              this.importDataLoading = false
            })
            .catch((err)=>{
              this.importDataLoading = false
            })
          } else {
            addData(params).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.getList();
              this.addOrEdit.show = false
              this.importDataLoading = false
            })
            .catch((err)=>{
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
      return null; // 如果没有找到，返回 null
    },

    addHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
        if (parentLabels) {
          this.addNodeName = parentLabels.join('-') + '-' + node.categoryName ;
        } else {
          this.addNodeName = node.categoryName + '-';
        }
        this.addOrEditDataRuls.categoryId = node.id
        this.$refs.addSelectRef.blur()
      }
    },
    editFn(row) {
      this.addOrEdit.flag = 2
      this.addOrEditDataRuls = JSON.parse(JSON.stringify(row))
      this.addOrEdit.show = true
      this.addOrEdit.title = '编辑'
      this.addNodeName = row.owner
      // this.yuanCategoryList.forEach(item => {
      //   if (this.addOrEditDataRuls.categoryId == item.id) {
      //     this.addNodeName = item.categoryName
      //   }
      // });
    },
    lookFn(row) {
      this.addOrEdit.flag = 3
      this.addOrEditDataRuls = row
      this.addNodeName = row.owner
      this.addOrEdit.show = true
      this.addOrEdit.title = '查看'
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
      this.getProtectCategory(val)
    },
    gettreeOptionsList() {
      this.Loading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        this.queryParams.categoryId = response.data[0].id
        this.getProtectCategory(this.queryParams.categoryId)
      });
    },
    // // 文件上传前钩子
    // importFileBeforeUpload(val) {
    //   this.importData.importFile = val.name
    //   this.importData.fileList.push(val)

    //   // 暂时禁止上传，等接口
    //   return false
    // },
    handleFileChange(file, fileList) {
      this.importData.importFile = file.raw.name
      this.importData.fileList = fileList;
    },
    handleFileExceed(files, fileList){
      this.importData.importFile = files[0].name
      this.importData.fileList = fileList;
    },
    // 导入取消
    importcancel() {
      this.importData.categoryName = ''
      this.importData.importFile = ''
      this.importData.fileList = []
      this.importData.importShow = false
    },
    importCli() {
      this.importData.importShow = true
    },

    nameTestingFn(val) {
      this.importData.categoryName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
      // nameTesting().then(res=>{
      //   console.log(res);
      // })
    },
    sonNameTestingFn(val) {
      this.addOrEditDataRuls.attachData = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    // tags 关闭方法
    handleClose(tag, index) {
      this.tags.splice(index, 1);
    },
    // jumpApi(url, id) {
    //   const routeData = this.$router.resolve({
    //     path: "/systemInfo/api",
    //     query: { id: id, url: url },
    //   });
    //   window.open(routeData.href, '_blank')
    // },
    timeFormat(value) {
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      return y + "-" + MM + "-" + d + " " + h + ":" + m;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.categoryName.indexOf(value) !== -1;
    },
    handleNodeClick(data) {
      this.treeID = data.id;
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
        parentId: key
      };
      treeListI(data).then((resp) => {
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
        levelId:this.queryParams.levelId.length?this.queryParams.levelId.join():'-1',
        dataSourceId:this.queryParams.dataSourceId?this.queryParams.dataSourceId:0,
      }
      getAttachData(params).then((response) => {
        this.protectTableFieldList = response.data.rows;
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
      // this.$refs.tree.setCurrentKey(null);
      this.treeID = this.categoryList[0].id
      this.resetForm("queryParams");
      this.handleQuery();
    },
    async rulsNameIsRight(id, name) {
      let params = {
        nodeId: id,
        name,
      }
      let res = await nameTesting(params)
      this.isName = res.data
    },
    /** 提交按钮 */
    async submitForm() {
      this.$refs["importData"].validate(async (valid) => {
        if (valid) {
          this.importDataLoading = true
          await this.rulsNameIsRight(0, this.importData.categoryName)
          if (!this.isName) {
            this.$modal.msgError("子类名称重复");
            this.importDataLoading = false
            return
          }
          const formData = new FormData();
          // 将文件数组添加到 FormData 对象中
          formData.append('file', this.importData.fileList[0].raw);
          formData.append('categoryName', this.importData.categoryName);
          await categoryImport(formData).then(res=>{
            this.messsucc(res,'导入条目数量共');
            // this.getList();
            this.importData.categoryName = ''
            this.importData.importFile = ''
            this.importData.fileList = []
            this.importData.importShow = false
            this.gettreeOptionsList()
            this.importDataLoading = false
          })
          .catch((err) =>{
            this.importDataLoading = false
          })

        }
      });
    },
    downloadFile() {
      const link = document.createElement('a');
      link.href = '/file.xlsx'; // 替换为你的文件路径
      link.download = '分类分级框架模板.xlsx'; // 设置下载后的文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // /** 导出按钮操作 */
    // handleExport() {
    //   this.download(
    //     "system/protectTableField/export",
    //     {
    //       ...this.queryParams,
    //     },
    //     `protectTableField_${new Date().getTime()}.xlsx`
    //   );
    // },
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
</style>
