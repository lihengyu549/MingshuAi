<template>
  <div class="app-container">
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item :label="$t('dict.dictName')" prop="dictName">
          <el-input v-model="queryParams.dictName" :placeholder="$t('dict.inputDictName')" clearable style="width: 240px"
            @change="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('dict.dictType')" prop="dictType">
          <el-input v-model="queryParams.dictType" :placeholder="$t('dict.inputDictType')" clearable style="width: 240px"
            @change="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('status')" prop="status">
          <el-select v-model="queryParams.status" :placeholder="$t('dict.dictStatus')" clearable style="width: 240px"
            @change="handleQuery">
            <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item :label="$t('createdTime')">
          <el-date-picker v-model="dateRange" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
            range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" @change="handleQuery"></el-date-picker>
        </el-form-item> -->
      </el-form>
    </el-card>
    <div class="search-actions">
      <el-row :gutter="10" class="mb8">
        <!-- <el-col :span="1.5">
          <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
            v-hasPermi="['system:dict:add']">{{ $t('add') }}</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
            v-hasPermi="['system:dict:edit']">{{ $t('edit') }}</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
            v-hasPermi="['system:dict:remove']">{{ $t('delete') }}</el-button>
        </el-col> -->
        <el-col :span="1.5">
          <el-button type="info" plain icon="el-icon-download" @click="handleExport"
            v-hasPermi="['system:dict:export']">{{ $t('export') }}</el-button>
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button type="danger" plain icon="el-icon-refresh" size="mini" @click="handleRefreshCache"
            v-hasPermi="['system:dict:remove']">刷新缓存</el-button>
        </el-col> -->
      </el-row>
    </div>
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="typeList" class="tableBox" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="字典编号" align="center" prop="dictId" /> -->
        <el-table-column :label="$t('dict.dictName')" align="center" prop="dictName" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('dict.dictType')" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <router-link :to="'/system/dict-data/index/' + scope.row.dictId" class="link-type">
              <span>{{ scope.row.dictType }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dict.dictStatus')" align="center" prop="status">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <!-- <el-table-column :label="$t('dict.remark')" align="center" prop="remark" :show-overflow-tooltip="true" /> -->
        <el-table-column :label="$t('createdTime')" align="center" prop="createTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operation')" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
              v-hasPermi="['system:dict:edit']">{{ $t('edit') }}</el-button>
            <el-button size="mini" type="text" class="text-danger" icon="el-icon-delete"
              @click="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']">{{ $t('delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
        :page-size.sync="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="dialogTitle" class="custom-dialog" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('dict.dictName')" prop="dictName">
          <el-input v-model="form.dictName" :placeholder="$t('dict.inputDictName')" />
        </el-form-item>
        <el-form-item :label="$t('dict.dictType')" prop="dictType">
          <el-input v-model="form.dictType" :placeholder="$t('dict.inputDictType')" />
        </el-form-item>
        <el-form-item :label="$t('status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('dict.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :placeholder="$t('dict.inputContent')"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitForm">{{ $t('confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listType, getType, delType, addType, updateType, refreshCache } from "@/api/system/dict/type";

const createRules = vm => ({
  dictName: [
    { required: true, message: vm.$t('dict.validation.dictNameRequired'), trigger: "blur" }
  ],
  dictType: [
    { required: true, message: vm.$t('dict.validation.dictTypeRequired'), trigger: "blur" }
  ]
});

export default {
  name: "Dict",
  dicts: ['sys_normal_disable'],
  data() {
    return {
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
      // 字典表格数据
      typeList: [],
      // 弹出层标题
      titleKey: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dictName: undefined,
        dictType: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: createRules(this)};
  },
  computed: {
    dialogTitle() {
      return this.titleKey ? this.$t(this.titleKey) : ''
    }
  },
  watch: {
    '$i18n.locale'() {
      this.rules = createRules(this)
    }
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      listType(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.typeList = response.rows;
        this.total = response.total;
        this.loading = false;
      }
      );
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        dictId: undefined,
        dictName: undefined,
        dictType: undefined,
        status: "0",
        remark: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.titleKey = "dict.addDictType";
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.dictId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const dictId = row.dictId || this.ids
      getType(dictId).then(response => {
        this.form = response.data;
        this.open = true;
        this.titleKey = "dict.editDictType";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.dictId != undefined) {
            updateType(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('dict.editSuccess'));
              this.open = false;
              this.getList();
            });
          } else {
            addType(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('dict.addSuccess'));
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const dictIds = row.dictId || this.ids;
      this.$modal.confirm(this.$t('dict.confirmDeleteDictType', { ids: dictIds })).then(function () {
        return delType(dictIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$t('dict.deleteSuccess'));
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/dict/type/export', {
        ...this.queryParams
      }, `type_${new Date().getTime()}.xlsx`)
    },
    /** 刷新缓存按钮操作 */
    handleRefreshCache() {
      refreshCache().then(() => {
        this.$modal.msgSuccess("刷新成功");
        this.$store.dispatch('dict/cleanDict');
      });
    }
  }
};
</script>
<style scoped>
.search-card {
  border-radius: 10px;
  margin-bottom: 20px;

  .el-form-item {
    margin-bottom: 0;
  }
}

.search-actions {
  gap: 12px;
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

.tableBox {
  overflow-y: auto;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #e2e8f0;
}

.custom-dialog {
  .el-dialog {
    border-radius: 10px;
  }

  .el-dialog__header {
    border-bottom: 1px solid #e2e8f0;
  }
}

.text-danger {
  color: #F56C6C;
}

.text-danger:hover {
  color: #f96c6c9a;
}
</style>
