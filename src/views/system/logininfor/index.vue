<template>
  <div class="app-container">
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <!-- <el-form-item label="登录地址" prop="ipaddr">
          <el-input v-model="queryParams.ipaddr" placeholder="请输入登录地址" clearable style="width: 240px;"
            @change="handleQuery" />
        </el-form-item> -->
        <el-form-item :label="$t('logininfor.userName')" prop="userName">
          <el-input v-model="queryParams.userName" :placeholder="$t('logininfor.inputUserName')" clearable style="width: 240px;"
            @change="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('logininfor.loginStatus')" prop="status">
          <el-select v-model="queryParams.status" :placeholder="$t('logininfor.loginStatus')" clearable style="width: 240px"
            @change="handleQuery">
            <el-option v-for="dict in dict.type.sys_common_status" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="登录时间">
          <el-date-picker v-model="dateRange" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
            range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" @change="handleQuery"></el-date-picker>
        </el-form-item> -->
      </el-form>
    </el-card>
    <div class="search-actions">
      <el-row :gutter="10" class="mb8">
        <!-- <el-col :span="1.5">
          <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
            v-hasPermi="['system:logininfor:remove']">{{ $t('delete') }}</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="danger" plain icon="el-icon-delete" size="mini" @click="handleClean"
            v-hasPermi="['system:logininfor:remove']">{{ $t('clean') }}</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="primary" plain icon="el-icon-unlock" size="mini" :disabled="single" @click="handleUnlock"
            v-hasPermi="['system:logininfor:unlock']">{{ $t('unlock') }}</el-button>
        </el-col> -->
        <el-col :span="1.5">
          <el-button type="info" plain icon="el-icon-download" @click="handleExport"
            v-hasPermi="['system:logininfor:export']">{{ $t('export') }}</el-button>
        </el-col>
      </el-row>
    </div>
    <el-card class="table-card" shadow="never">
      <el-table ref="tables" v-loading="loading" class="tableBox" :data="list" @selection-change="handleSelectionChange"
        :default-sort="defaultSort" @sort-change="handleSortChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="访问编号" align="center" prop="infoId" /> -->
        <el-table-column :label="$t('logininfor.userName')" align="center" prop="userName" width="300" :show-overflow-tooltip="true"
          sortable="custom" :sort-orders="['descending', 'ascending']" />
        <el-table-column :label="$t('logininfor.ipAddress')" align="center" prop="ipaddr" width="260" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('logininfor.loginStatus')" align="center" prop="status">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_common_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="描述" align="center" prop="msg" /> -->
        <el-table-column :label="$t('logininfor.accessTime')" align="center" prop="accessTime" sortable="custom"
          :sort-orders="['descending', 'ascending']">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.accessTime) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
        :page-size.sync="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script>
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from "@/api/system/logininfor";

export default {
  name: "Logininfor",
  dicts: ['sys_common_status'],
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
      // 选择用户名
      selectName: "",
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: { prop: 'loginTime', order: 'descending' },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        ipaddr: undefined,
        userName: undefined,
        status: undefined
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true;
      list(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.list = response.rows;
        this.total = response.total;
        this.loading = false;
      }
      );
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
      this.ids = selection.map(item => item.infoId)
      this.single = selection.length != 1
      this.multiple = !selection.length
      this.selectName = selection.map(item => item.userName);
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const infoIds = row.infoId || this.ids;
      this.$modal.confirm(this.$t('logininfor.confirmDelete', { ids: infoIds })).then(function () {
        return delLogininfor(infoIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$t('logininfor.deleteSuccess'));
      }).catch(() => { });
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$modal.confirm(this.$t('logininfor.confirmClean')).then(function () {
        return cleanLogininfor();
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$t('logininfor.cleanSuccess'));
      }).catch(() => { });
    },
    /** 解锁按钮操作 */
    handleUnlock() {
      const username = this.selectName;
      this.$modal.confirm(this.$t('logininfor.confirmUnlock', { username: username })).then(function () {
        return unlockLogininfor(username);
      }).then(() => {
        this.$modal.msgSuccess(this.$t('logininfor.unlockSuccess', { username: username }));
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/logininfor/export', {
        ...this.queryParams
      }, `logininfor_${new Date().getTime()}.xlsx`)
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