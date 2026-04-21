<template>
  <div class="app-container">
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
        <el-form-item :label="$t('menu.menuName')" prop="menuName">
          <el-input v-model="queryParams.menuName" :placeholder="$t('menu.inputMenuName')" clearable @change="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('menu.status')" prop="status">
          <el-select v-model="queryParams.status" :placeholder="$t('menu.menuStatus')" clearable @change="handleQuery">
            <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    <div class="search-actions">
      <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
        v-hasPermi="['system:menu:add']">{{ $t('add') }}</el-button>
      <el-button type="info" plain icon="el-icon-sort" size="mini" @click="toggleExpandAll">{{ $t('menu.expandCollapse') }}</el-button>
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </div>
    <el-card class="table-card" shadow="never">
      <el-table v-if="refreshTable" v-loading="loading" class="tableBox" :data="menuList" row-key="menuId"
        :default-expand-all="isExpandAll" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
        <el-table-column prop="menuName" :label="$t('menu.menuName')" :show-overflow-tooltip="true" width="160"></el-table-column>
        <el-table-column prop="icon" :label="$t('menu.icon')" align="center" width="100">
          <template slot-scope="scope">
            <svg-icon :icon-class="scope.row.icon" />
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" :label="$t('menu.sort')" width="60"></el-table-column>
        <el-table-column prop="perms" :label="$t('menu.permissionMark')" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="component" :label="$t('menu.componentPath')" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="status" :label="$t('menu.status')" width="80">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('createdTime')" align="center" prop="createTime">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('operation')" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
              v-hasPermi="['system:menu:edit']">{{ $t('edit') }}</el-button>
            <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row)"
              v-hasPermi="['system:menu:add']">{{ $t('add') }}</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
              v-hasPermi="['system:menu:remove']">{{ $t('delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('menu.parentMenu')" prop="parentId">
              <treeselect v-model="form.parentId" :options="menuOptions" :normalizer="normalizer" :show-count="true"
                :placeholder="$t('menu.selectParentMenu')" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('menu.menuType')" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">{{ $t('menu.dir') }}</el-radio>
                <el-radio label="C">{{ $t('menu.menu') }}</el-radio>
                <el-radio label="F">{{ $t('menu.btn') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.menuType != 'F'">
            <el-form-item :label="$t('menu.menuIcon')" prop="icon">
              <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
                <IconSelect ref="iconSelect" @selected="selected" />
                <el-input slot="reference" v-model="form.icon" :placeholder="$t('menu.clickToSelectIcon')" readonly>
                  <svg-icon v-if="form.icon" slot="prefix" :icon-class="form.icon" class="el-input__icon"
                    style="height: 32px;width: 16px;" />
                  <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('menu.menuName')" prop="menuName">
              <el-input v-model="form.menuName" :placeholder="$t('menu.inputMenuName')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('menu.displaySort')" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="isFrame">
              <span slot="label">
                <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                是否外链
              </span>
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">{{ $t('menu.yes') }}</el-radio>
                <el-radio label="1">{{ $t('menu.no') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="path">
              <span slot="label">
                <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                路由地址
              </span>
              <el-input v-model="form.path" :placeholder="$t('menu.inputRoutePath')" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="component">
              <span slot="label">
                <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                组件路径
              </span>
              <el-input v-model="form.component" :placeholder="$t('menu.inputComponentPath')" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'M'">
            <el-form-item prop="perms">
              <el-input v-model="form.perms" :placeholder="$t('menu.inputPermissionChar')" maxlength="100" />
              <span slot="label">
                <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                权限字符
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="query">
              <el-input v-model="form.query" :placeholder="$t('menu.inputRouteParams')" maxlength="255" />
              <span slot="label">
                <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                路由参数
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="isCache">
              <span slot="label">
                <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                是否缓存
              </span>
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">{{ $t('menu.cache') }}</el-radio>
                <el-radio label="1">{{ $t('menu.noCache') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="visible">
              <span slot="label">
                <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                显示状态
              </span>
              <el-radio-group v-model="form.visible">
                <el-radio v-for="dict in dict.type.sys_show_hide" :key="dict.value" :label="dict.value">{{ dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="status">
              <span slot="label">
                <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                菜单状态
              </span>
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">{{
                  dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitForm">{{ $t('confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMenu, getMenu, delMenu, addMenu, updateMenu } from "@/api/system/menu";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";

const createRules = vm => ({
  menuName: [
    { required: true, message: vm.$t('menu.validation.menuNameRequired'), trigger: "blur" }
  ],
  orderNum: [
    { required: true, message: vm.$t('menu.validation.orderNumRequired'), trigger: "blur" }
  ],
  path: [
    { required: true, message: vm.$t('menu.validation.pathRequired'), trigger: "blur" }
  ]
});

export default {
  name: "Menu",
  dicts: ['sys_show_hide', 'sys_normal_disable'],
  components: { Treeselect, IconSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 菜单表格树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      titleKey: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部折叠
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        menuName: undefined,
        visible: undefined
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
    // 选择图标
    selected(name) {
      this.form.icon = name;
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      listMenu(this.queryParams).then(response => {
        this.menuList = this.handleTree(response.data, "menuId");
        this.loading = false;
      });
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children
      };
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      listMenu().then(response => {
        this.menuOptions = [];
        const menu = { menuId: 0, menuName: '主类目', children: [] };
        menu.children = this.handleTree(response.data, "menuId");
        this.menuOptions.push(menu);
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: "M",
        orderNum: undefined,
        isFrame: "1",
        isCache: "0",
        visible: "0",
        status: "0"
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null && row.menuId) {
        this.form.parentId = row.menuId;
      } else {
        this.form.parentId = 0;
      }
      this.open = true;
      this.titleKey = "menu.addMenu";
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      getMenu(row.menuId).then(response => {
        this.form = response.data;
        this.open = true;
        this.titleKey = "menu.editMenu";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.menuId != undefined) {
            updateMenu(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('menu.editSuccess'));
              this.open = false;
              this.getList();
            });
          } else {
            addMenu(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('menu.addSuccess'));
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$modal.confirm(this.$t('menu.confirmDelete', { name: row.menuName })).then(function () {
        return delMenu(row.menuId);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$t('menu.deleteSuccess'));
      }).catch(() => { });
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