<template>
  <div class="app-container">
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item :label="$t('operlog.systemModule')" prop="title">
          <el-input v-model="queryParams.title" :placeholder="$t('operlog.inputSystemModule')" clearable style="width: 240px;"
            @change="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('operlog.operator')" prop="operName">
          <el-input v-model="queryParams.operName" :placeholder="$t('operlog.inputOperator')" clearable style="width: 240px;"
            @change="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('operlog.type')" prop="businessType">
          <el-select v-model="queryParams.businessType" :placeholder="$t('operlog.operType')" clearable style="width: 240px"
            @change="handleQuery">
            <el-option v-for="dict in dict.type.sys_oper_type" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('operlog.status')" prop="status">
          <el-select v-model="queryParams.status" :placeholder="$t('operlog.operStatus')" clearable style="width: 240px"
            @change="handleQuery">
            <el-option v-for="dict in dict.type.sys_common_status" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="操作时间">
          <el-date-picker v-model="dateRange" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
            range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" @change="handleQuery"></el-date-picker>
        </el-form-item> -->
      </el-form>
    </el-card>
    <div class="search-actions">
      <el-row :gutter="10" class="mb8">
        <!-- <el-col :span="1.5">
          <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
            v-hasPermi="['system:operlog:remove']">{{ $t('delete') }}</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="danger" plain icon="el-icon-delete" size="mini" @click="handleClean"
            v-hasPermi="['system:operlog:remove']">{{ $t('clean') }}</el-button>
        </el-col> -->
        <el-col :span="1.5">
          <el-button type="info" plain icon="el-icon-download" @click="handleExport"
            v-hasPermi="['system:operlog:export']">{{ $t('export') }}</el-button>
        </el-col>
      </el-row>
    </div>
    <el-card class="table-card" shadow="never">
      <el-table ref="tables" v-loading="loading" class="tableBox" :data="list" @selection-change="handleSelectionChange"
        :default-sort="defaultSort" @sort-change="handleSortChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="$t('operlog.operDate')" align="center" prop="operTime" sortable="custom"
          :sort-orders="['descending', 'ascending']" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.operTime) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="日志编号" align="center" prop="operId" /> -->
        <el-table-column :label="$t('operlog.systemModule')" align="center" prop="title" />
        <el-table-column :label="$t('operlog.operType')" align="center" prop="businessType">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_oper_type" :value="scope.row.businessType" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('operlog.requestMethod')" align="center" prop="requestMethod" />
        <el-table-column :label="$t('operlog.operator')" align="center" prop="operName" :show-overflow-tooltip="true" sortable="custom"
          :sort-orders="['descending', 'ascending']" width="100" />
        <el-table-column :label="$t('operlog.host')" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('operlog.operStatus')" align="center" prop="status">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_common_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row, scope.index)"
              v-hasPermi="['system:operlog:query']">详细</el-button>
          </template>
        </el-table-column> -->
      </el-table>

      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
        :page-size.sync="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 操作日志详细 -->
    <el-dialog :title="$t('operlog.operDetails')" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('operlog.operModule') + '：'">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
            <el-form-item :label="$t('operlog.loginInfo') + '：'">{{ form.operName }} / {{ form.operIp }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('operlog.requestAddress') + '：'">{{ form.operUrl }}</el-form-item>
            <el-form-item :label="$t('operlog.requestMethod') + '：'">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('operlog.operMethod') + '：'">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('operlog.requestParams') + '：'">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('operlog.returnParams') + '：'">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('operlog.operStatus') + '：'">
              <div v-if="form.status === 0">{{ $t('operlog.normal') }}</div>
              <div v-else-if="form.status === 1">{{ $t('operlog.failed') }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('operlog.operTime') + '：'">{{ parseTime(form.operTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('operlog.errorInfo') + '：'" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">{{ $t('operlog.close') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list, delOperlog, cleanOperlog } from "@/api/system/operlog";

export default {
  name: "Operlog",
  dicts: ['sys_oper_type', 'sys_common_status'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: { prop: 'operTime', order: 'descending' },
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        operName: undefined,
        businessType: undefined,
        status: undefined
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询登录日志 */
    getList() {
      this.loading = true;
      list(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.list = response.rows;
        this.total = response.total;
        this.loading = false;
      }
      );
    },
    // 操作日志类型字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.dict.type.sys_oper_type, row.businessType);
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
      this.queryParams.pageNum = 1;
      this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order)
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.operId)
      this.multiple = !selection.length
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /** 详细按钮操作 */
    handleView(row) {
      this.open = true;
      this.form = row;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const operIds = row.operId || this.ids;
      this.$modal.confirm(this.$t('operlog.confirmDelete', { ids: operIds })).then(function () {
        return delOperlog(operIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$t('operlog.deleteSuccess'));
      }).catch(() => { });
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$modal.confirm(this.$t('operlog.confirmClean')).then(function () {
        return cleanOperlog();
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$t('operlog.cleanSuccess'));
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/operlog/export', {
        ...this.queryParams
      }, `operlog_${new Date().getTime()}.xlsx`)
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
</style>
