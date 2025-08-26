<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px"
      @submit.native.prevent>
      <el-form-item label="行业分类" prop="categoryName">
        <!-- <el-input v-model="queryParams.categoryName" placeholder="请输入行业分类" clearable /> -->
      </el-form-item>
      <!-- <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item> -->
    </el-form>
    <!-- 
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:protectCategory:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:protectCategory:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:protectCategory:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:protectCategory:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->
    <el-table v-loading="loading" :data="protectCategoryList" row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <!-- <el-table-column width="100"></el-table-column> -->
      <el-table-column label="行业分类" align="center" prop="">
        <template slot-scope="scope">
          <div style="display: inline-block;text-align: left;width: 150px;">
            {{ scope.row.categoryName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button class="btn" size="mini" type="text" icon="el-icon-plus" @click="addSibling(scope.row.parentId)"
            v-hasPermi="['system:protectCategory:edit']">新增平级</el-button>
          <el-button class="btn" size="mini" type="text" icon="el-icon-finished" @click="addSibling(scope.row.id)"
            v-hasPermi="['system:protectCategory:edit']">新增下级</el-button>
          <el-button class="btn" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:protectCategory:edit']">修改</el-button>
          <el-button class="btn" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:protectCategory:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <!-- 添加或修改行业分类对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" @submit.native.prevent>
        <el-form-item label="行业分类" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入行业分类" @keyup.enter.native="submitForm" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import { listProtectCategory, getProtectCategory, deleteCategoryTree, addProtectCategory, updateProtectCategory, treeListI, insertCategoryTreeI } from "@/api/system/protectCategory";

export default {
  name: "ProtectCategory",
  data () {
    return {
      addEquativeId: '',
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 行业分类表格数据
      protectCategoryList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryName: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        categoryName: [
          { pattern: '[^ \x22]+', message: '行业分类称不能为空字符串' }
        ],
      }
    };
  },
  created () {
    this.getList();
  },

  // mounted() {
  //   axios.get('/system/protectCategory/list').then(res => {
  //     console.log(res);
  //   }).catch(err => {
  //     console.log(err);
  //   })
  // },
  methods: {

    //新增同级+下级
    addSibling (id) {
      if (id == 0) {
        this.title = "添加平级行业分类";
      } else {
        this.title = "添加下级行业分类";
      }
      this.addEquativeId = id
      this.reset();
      this.open = true;
    },


    /** 查询行业分类列表 */
    getList () {
      this.loading = true;
      treeListI(this.queryParams).then(response => {
        this.protectCategoryList = this.handleTree(response.data, "id");
        // this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },

    // 表单重置
    reset () {
      this.form = {
        id: null,
        categoryName: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    // handleSelectionChange(selection) {
    //   this.ids = selection.map(item => item.id)
    //   this.single = selection.length!==1
    //   this.multiple = !selection.length
    // },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "添加行业分类";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const id = row.id || this.ids
      getProtectCategory(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改行业分类";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateProtectCategory(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            let data = {
              categoryName: this.form.categoryName,
              parentId: this.addEquativeId
            }
            insertCategoryTreeI(data).then((res => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            }))
            //   addProtectCategory(this.form).then(response => {
            //     this.$modal.msgSuccess("新增成功");
            //     this.open = false;
            //     this.getList();
            //   });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      console.log(row);
      // const ids = row.id || this.ids;
      const ids = row.id;
      this.$modal.confirm('是否确认删除行业分类编号为"' + ids + '"的数据项？').then(function () {
        return deleteCategoryTree(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/protectCategory/export', {
        ...this.queryParams
      }, `protectCategory_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
<style scoped>
.btn {
  font-size: 14px;
}
</style>
