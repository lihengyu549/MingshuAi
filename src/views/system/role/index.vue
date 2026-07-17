<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-card class="search-card" shadow="never">
          <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
            label-width="88px">
            <el-form-item :label="$t('role.roleName')" prop="roleName">
              <el-input v-model="queryParams.roleName" :placeholder="$t('role.inputRoleName')" clearable
                style="width: 240px" @change="handleQuery" />
            </el-form-item>
            <!-- <el-form-item :label="$t('role.roleKey')" prop="roleKey">
              <el-input v-model="queryParams.roleKey" placeholder="请输入权限字符" clearable style="width: 240px"
                @change="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item :label="$t('status')" prop="status">
              <el-select v-model="queryParams.status" placeholder="角色状态" clearable style="width: 240px"
                @change="handleQuery">
                <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item> -->
            <!-- <el-form-item :label="$t('createdTime')">
              <el-date-picker v-model="dateRange" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
                range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                @change="handleQuery"></el-date-picker>
            </el-form-item> -->
          </el-form>
        </el-card>
        <div class="search-actions">
          <el-button type="primary" plain icon="el-icon-plus" @click="handleAdd" v-hasPermi="['system:role:add']">{{
            $t('add') }}</el-button>
          <!-- <el-button type="success" plain icon="el-icon-edit" :disabled="single" @click="handleUpdate"
            v-hasPermi="['system:role:edit']">{{ $t('edit') }}</el-button> -->
          <el-button type="danger" plain icon="el-icon-delete" :disabled="multiple" @click="handleDelete"
            v-hasPermi="['system:role:remove']">{{ $t('delete') }}</el-button>
          <!-- <el-button type="warning" plain icon="el-icon-download" @click="handleExport"
            v-hasPermi="['system:role:export']">{{ $t('export') }}</el-button> -->
        </div>
        <el-card class="table-card" shadow="never">
          <el-table v-loading="loading" class="tableBox" :data="roleList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <!-- <el-table-column label="角色编号" prop="roleId" width="120" /> -->
            <el-table-column :label="$t('role.roleName')" prop="roleName" align="center"
              :show-overflow-tooltip="true" />
            <!-- <el-table-column :label="$t('role.roleKey')" prop="roleKey" align="center" :show-overflow-tooltip="true" /> -->
            <!-- <el-table-column :label="$t('role.roleSort')" prop="roleSort" width="100" /> -->
            <!-- <el-table-column :label="$t('status')" align="center" width="100">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.status" active-value="0" inactive-value="1"
                  @change="handleStatusChange(scope.row)"></el-switch>
              </template>
            </el-table-column> -->
            <el-table-column :label="$t('createdTime')" align="center" prop="createTime">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.createTime) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('operation')" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope" v-if="scope.row.roleId !== 1">
                <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                  v-hasPermi="['system:role:edit']">{{ $t('edit') }}</el-button>
                <el-button size="mini" type="text" class="text-danger" icon="el-icon-delete"
                  @click="handleDelete(scope.row)" v-hasPermi="['system:role:remove']">{{ $t('delete') }}</el-button>
                <!-- <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)"
                  v-hasPermi="['system:role:edit']">
                  <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="handleDataScope" icon="el-icon-circle-check"
                      v-hasPermi="['system:role:edit']">数据权限</el-dropdown-item>
                    <el-dropdown-item command="handleAuthUser" icon="el-icon-user"
                      v-hasPermi="['system:role:edit']">分配用户</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown> -->
              </template>
            </el-table-column>
          </el-table>
          <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :page-size.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="dialogTitle" class="dialog-form" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-position="top">
        <el-form-item :label="$t('role.roleName')" prop="roleName">
          <el-input v-model="form.roleName" :placeholder="$t('role.inputRoleName')" />
        </el-form-item>
        <!-- <el-form-item prop="roleKey">
          <span slot="label">
            <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            权限字符
          </span>
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('status')">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item :label="$t('role.menuPermission')">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">{{
            $t('role.expandCollapse')
          }}</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">{{ $t('role.selectAll')
          }}</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">{{
            $t('role.checkStrictly') }}</el-checkbox>
          <div class="menu-tree-container">
            <el-tree class="tree-border" :data="menuOptions" show-checkbox ref="menu" node-key="id"
              :check-strictly="!form.menuCheckStrictly" :empty-text="$t('role.loading')"
              :props="defaultProps"></el-tree>
          </div>
        </el-form-item>
        <el-form-item :label="$t('role.remark')">
          <el-input v-model="form.remark" type="textarea" :placeholder="$t('role.inputContent')"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitForm">{{ $t('confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色数据权限对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="openDataScope" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item :label="$t('role.roleName')">
          <el-input v-model="form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('role.roleKey')">
          <el-input v-model="form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('role.dataScope')">
          <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
            <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label"
              :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('role.dataPermission')" v-show="form.dataScope == 2">
          <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">{{
            $t('role.expandCollapse')
          }}</el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">{{ $t('role.selectAll')
          }}</el-checkbox>
          <el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">{{
            $t('role.checkStrictly') }}</el-checkbox>
          <el-tree class="tree-border" :data="deptOptions" show-checkbox default-expand-all ref="dept" node-key="id"
            :check-strictly="!form.deptCheckStrictly" :empty-text="$t('role.loading')" :props="defaultProps"></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitDataScope">{{ $t('confirm') }}</el-button>
        <el-button @click="cancelDataScope">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRole, getRole, delRole, addRole, updateRole, dataScope, changeRoleStatus, deptTreeSelect } from "@/api/system/role";
import { treeselect as menuTreeselect, roleMenuTreeselect } from "@/api/system/menu";

const createDataScopeOptions = vm => [
  { value: "1", label: vm.$t('role.dataScopeAll') },
  { value: "2", label: vm.$t('role.dataScopeCustom') },
  { value: "3", label: vm.$t('role.dataScopeDept') },
  { value: "4", label: vm.$t('role.dataScopeDeptAndChild') },
  { value: "5", label: vm.$t('role.dataScopeSelf') }
];

const createRules = vm => ({
  roleName: [
    { required: true, message: vm.$t('role.validation.roleNameRequired'), trigger: "blur" }
  ],
  roleKey: [
    { required: true, message: vm.$t('role.validation.roleKeyRequired'), trigger: "blur" }
  ],
  roleSort: [
    { required: true, message: vm.$t('role.validation.roleSortRequired'), trigger: "blur" }
  ]
});

export default {
  name: "Role",
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
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      titleKey: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      menuExpand: false,
      menuNodeAll: false,
      deptExpand: true,
      deptNodeAll: false,
      // 日期范围
      dateRange: [],
      // 数据范围选项
      dataScopeOptions: createDataScopeOptions(this),
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: createRules(this)
    };
  },
  computed: {
    dialogTitle() {
      return this.titleKey ? this.$t(this.titleKey) : ''
    }
  },
  watch: {
    '$i18n.locale'() {
      this.dataScopeOptions = createDataScopeOptions(this)
      this.rules = createRules(this)
    }
  },
  created() {
    this.getList();
  },
  methods: {
    filterVisibleTree(tree) {
      if (!Array.isArray(tree)) {
        return [];
      }
      return tree.reduce((result, node) => {
        if (node && node.hidden === true) {
          return result;
        }
        result.push({
          ...node,
          children: this.filterVisibleTree(node && node.children)
        });
        return result;
      }, []);
    },
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      listRole(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.roleList = response.rows;
        this.total = response.total;
        this.loading = false;
      }
      );
    },
    /** 查询菜单树结构 */
    getMenuTreeselect() {
      menuTreeselect().then(response => {
        this.menuOptions = this.filterVisibleTree(response.data);
      });
    },
    // 所有菜单节点数据
    getMenuAllCheckedKeys() {
      // 目前被选中的菜单节点
      let checkedKeys = this.$refs.menu.getCheckedKeys();
      // 半选中的菜单节点
      let halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    },
    // 所有部门节点数据
    getDeptAllCheckedKeys() {
      // 目前被选中的部门节点
      let checkedKeys = this.$refs.dept.getCheckedKeys();
      // 半选中的部门节点
      let halfCheckedKeys = this.$refs.dept.getHalfCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect(roleId) {
      return roleMenuTreeselect(roleId).then(response => {
        this.menuOptions = this.filterVisibleTree(response.menus);
        return response;
      });
    },
    /** 根据角色ID查询部门树结构 */
    getDeptTree(roleId) {
      return deptTreeSelect(roleId).then(response => {
        this.deptOptions = response.depts;
        return response;
      });
    },
    // 角色状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "enable" : "disable";
      let action = this.$t(text);
      this.$modal.confirm(this.$t('role.confirmStatusChange', { action, name: row.roleName })).then(function () {
        return changeRoleStatus(row.roleId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(this.$t('role.statusChangeSuccess', { action }));
      }).catch(function () {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.openDataScope = false;
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.menuExpand = false,
        this.menuNodeAll = false,
        this.deptExpand = true,
        this.deptNodeAll = false,
        this.form = {
          roleId: undefined,
          roleName: undefined,
          roleKey: undefined,
          roleSort: 0,
          status: "0",
          menuIds: [],
          deptIds: [],
          menuCheckStrictly: true,
          deptCheckStrictly: true,
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.roleId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleDataScope":
          this.handleDataScope(row);
          break;
        case "handleAuthUser":
          this.handleAuthUser(row);
          break;
        default:
          break;
      }
    },
    // 树权限（展开/折叠）
    handleCheckedTreeExpand(value, type) {
      if (type == 'menu') {
        let treeList = this.menuOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value;
        }
      } else if (type == 'dept') {
        let treeList = this.deptOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.dept.store.nodesMap[treeList[i].id].expanded = value;
        }
      }
    },
    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value, type) {
      if (type == 'menu') {
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions : []);
      } else if (type == 'dept') {
        this.$refs.dept.setCheckedNodes(value ? this.deptOptions : []);
      }
    },
    // 树权限（父子联动）
    handleCheckedTreeConnect(value, type) {
      if (type == 'menu') {
        this.form.menuCheckStrictly = value ? true : false;
      } else if (type == 'dept') {
        this.form.deptCheckStrictly = value ? true : false;
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.getMenuTreeselect();
      this.open = true;
      this.titleKey = "role.addRole";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const roleId = row.roleId || this.ids
      const roleMenu = this.getRoleMenuTreeselect(roleId);
      getRole(roleId).then(response => {
        this.form = response.data;
        this.open = true;
        this.$nextTick(() => {
          roleMenu.then(res => {
            let checkedKeys = res.checkedKeys
            checkedKeys.forEach((v) => {
              this.$nextTick(() => {
                if (this.$refs.menu.getNode(v)) {
                  this.$refs.menu.setChecked(v, true, false);
                }
              })
            })
          });
        });
        this.titleKey = "role.editRole";
      });
    },
    /** 选择角色权限范围触发 */
    dataScopeSelectChange(value) {
      if (value !== '2') {
        this.$refs.dept.setCheckedKeys([]);
      }
    },
    /** 分配数据权限操作 */
    handleDataScope(row) {
      this.reset();
      const deptTreeSelect = this.getDeptTree(row.roleId);
      getRole(row.roleId).then(response => {
        this.form = response.data;
        this.openDataScope = true;
        this.$nextTick(() => {
          deptTreeSelect.then(res => {
            this.$refs.dept.setCheckedKeys(res.checkedKeys);
          });
        });
        this.titleKey = "role.assignDataScope";
      });
    },
    /** 分配用户操作 */
    handleAuthUser: function (row) {
      const roleId = row.roleId;
      this.$router.push("/system/role-auth/user/" + roleId);
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        this.form.roleKey = this.form.roleName
        if (valid) {
          if (this.form.roleId != undefined) {
            this.form.menuIds = this.getMenuAllCheckedKeys();
            updateRole(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('role.editSuccess'));
              this.open = false;
              this.getList();
            });
          } else {
            this.form.menuIds = this.getMenuAllCheckedKeys();
            addRole(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('role.addSuccess'));
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 提交按钮（数据权限） */
    submitDataScope: function () {
      if (this.form.roleId != undefined) {
        this.form.deptIds = this.getDeptAllCheckedKeys();
        dataScope(this.form).then(response => {
          this.$modal.msgSuccess(this.$t('role.editSuccess'));
          this.openDataScope = false;
          this.getList();
        });
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const roleIds = row.roleId || this.ids;
      this.$modal.confirm(this.$t('role.confirmDelete', { name: row.roleName || roleIds })).then(function () {
        return delRole(roleIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$t('role.deleteSuccess'));
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/role/export', {
        ...this.queryParams
      }, `role_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
<style scoped>
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

.text-danger {
  color: #F56C6C;
}

.text-danger:hover {
  color: #f96c6c9a;
}

.menu-tree-container {
  max-height: 300px;
  overflow-y: auto;
}

.dialog-form {
  .el-dialog {
    border-radius: 10px;
  }

  .el-dialog__header {
    border-bottom: 1px solid #e2e8f0;
  }
}
</style>
