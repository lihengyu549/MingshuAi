<template>
  <div class="app-container user-page">
    <el-row :gutter="20" class="page-layout">
      <el-col :span="5" :xs="24">
        <el-card class="left-card" shadow="never">
          <div class="left-card__header">
            <div class="left-card__title">组织架构</div>
          </div>
          <div class="left-card__desc">支持部门新增、重命名、移动与删除</div>
          <div class="left-card__stats">
            <div class="left-card__stat">
              <div class="left-card__stat-label">部门数量</div>
              <div class="left-card__stat-value">{{ Array.isArray(deptOptions) ? deptOptions.length : 0 }}</div>
            </div>
            <div class="left-card__stat">
              <div class="left-card__stat-label">用户数量</div>
              <div class="left-card__stat-value">{{ total }}</div>
            </div>
          </div>
          <div class="left-card__actions">
            <el-button type="primary" plain @click="handleDeptAddChild">新增下级</el-button>
            <el-button type="primary" plain @click="handleDeptRename">重命名</el-button>
            <el-button type="primary" plain @click="handleDeptMove">移动部门</el-button>
            <el-button type="danger" plain @click="handleDeptDelete">删除部门</el-button>
          </div>
          <div class="tree-container">
            <el-tree class="deptTree" ref="tree" :data="deptOptions" :props="defaultProps" :expand-on-click-node="false"
              node-key="id" default-expand-all highlight-current @node-click="handleNodeClick">
              <span class="dept-tree-node" slot-scope="{ node, data }">
                <span class="dept-tree-node__left">
                  <template v-if="node.level === 1">
                    <svg-icon icon-class="dunpai-2" class="dept-tree-node__icon dept-tree-node__icon--root" />
                  </template>
                  <template v-else>
                    <svg-icon :icon-class="node.expanded ? 'openFile' : 'closeFile'" class="dept-tree-node__icon" />
                  </template>
                  <span class="dept-tree-node__label" :title="node.label">{{ node.label }}</span>
                </span>
                <span class="dept-tree-node__count">{{ data.userCount || data.count || (Array.isArray(data.children) ?
                  data.children.length : 0) }}</span>
              </span>
            </el-tree>
          </div>
        </el-card>
      </el-col>

      <el-col :span="19" :xs="24">
        <el-collapse-transition>
          <div v-show="showSearch" class="search-wrapper">
            <el-card class="search-card" shadow="never">
              <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="68px">
                <el-form-item :label="$t('user.userName')" prop="userName">
                  <el-input v-model="queryParams.userName" :placeholder="$t('user.inputUserName')" clearable
                    style="width: 240px" @change="handleQuery" />
                </el-form-item>
                <el-form-item :label="$t('user.phoneNumber')" prop="phonenumber">
                  <el-input v-model="queryParams.phonenumber" :placeholder="$t('user.inputPhoneNumber')" clearable
                    style="width: 240px" @change="handleQuery" />
                </el-form-item>
                <el-form-item :label="$t('status')" prop="status">
                  <el-select v-model="queryParams.status" :placeholder="$t('user.statusPlaceholder')" clearable
                    style="width: 240px" @change="handleQuery">
                    <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label"
                      :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </el-collapse-transition>

        <el-card class="table-card" shadow="never">
          <div class="table-card-content">
            <div class="table-header">
              <div class="table-header__title">{{ currentDeptName }}</div>
              <div class="table-header__sub">共 {{ total }} 个用户</div>
            </div>
            <div class="table-toolbar">
              <div class="toolbar-group">
                <el-button v-hasPermi="['system:user:add']" type="primary" plain icon="el-icon-plus" @click="handleAdd">
                  {{ $t('add') }}
                </el-button>
                <el-button v-hasPermi="['system:user:remove']" type="danger" plain icon="el-icon-delete"
                  :disabled="multiple" @click="handleDelete">
                  {{ $t('delete') }}
                </el-button>
              </div>
              <div class="toolbar-group toolbar-group-right">
                <el-button type="text" size="medium" @click="toggleFilters" style="color: #7c8592;">
                  <svg-icon icon-class="过滤" />
                  {{ showSearch ? '收起筛选' : '展开筛选' }}
                </el-button>
              </div>
            </div>

            <el-table v-loading="loading" class="tableBox" style="flex: 1;" height="100%" :data="userList"
              @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="50" align="center" />
              <!-- <el-table-column :label="$t('user.userId')" align="center" key="userId" prop="userId" v-if="columns[0].visible" /> -->
              <el-table-column v-if="columns[1].visible" key="userName" :label="$t('user.userName')" align="center"
                prop="userName" :show-overflow-tooltip="true" />
              <!-- <el-table-column :label="$t('user.nickName')" align="center" key="nickName" prop="nickName" v-if="columns[2].visible"
              :show-overflow-tooltip="true" /> -->
              <!-- <el-table-column :label="$t('user.deptName')" align="center" key="deptName" prop="dept.deptName" v-if="columns[3].visible"
              :show-overflow-tooltip="true" /> -->
              <el-table-column v-if="columns[4].visible" key="phonenumber" :label="$t('user.phoneNumber')"
                align="center" prop="phonenumber" width="120">
                <template slot-scope="scope">
                  <span>{{ scope.row.phonenumber || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('user.role')" prop="remark" align="center">
                <template slot-scope="scope">
                  <span>{{ scope.row.remark || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('user.deptName')" prop="dept.deptName" align="center">
                <template slot-scope="scope">
                  <el-tag type="primary">{{ scope.row.dept ? scope.row.dept.deptName : '-' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column v-if="columns[5].visible" key="status" :label="$t('status')" align="center">
                <template slot-scope="scope">
                  <span
                    :class="[
                      'status-pill',
                      scope.row.status === '0' ? 'status-pill--enable' : 'status-pill--disable'
                    ]"
                  >
                    <span class="status-pill__dot"></span>
                    <span>{{ scope.row.status === '0' ? $t('enable') : $t('disable') }}</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column v-if="columns[6].visible" :label="$t('createdTime')" align="center" prop="createTime"
                width="160">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('operation')" align="center" width="260"
                class-name="small-padding fixed-width">
                <template v-if="scope.row.userId !== 1" slot-scope="scope">
                  <el-button v-hasPermi="['system:user:edit']" size="mini" type="text" icon="el-icon-edit"
                    @click="handleUpdate(scope.row)">
                    {{ $t('edit') }}
                  </el-button>
                  <el-button v-hasPermi="['system:user:remove']" size="mini" type="text" class="text-danger"
                    icon="el-icon-delete" @click="handleDelete(scope.row)">
                    {{ $t('delete') }}
                  </el-button>
                  <el-button v-hasPermi="['system:user:resetPwd']" size="mini" type="text" icon="el-icon-key"
                    @click="handleResetPwd(scope.row)">
                    {{ $t('resetPassword') }}
                  </el-button>

                  <!-- <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)"
                  v-hasPermi="['system:user:resetPwd', 'system:user:edit']">
                  <el-button size="mini" type="text" icon="el-icon-d-arrow-right">{{ $t('more') }}</el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="handleResetPwd" icon="el-icon-key"
                      v-hasPermi="['system:user:resetPwd']">{{ $t('resetPassword') }}</el-dropdown-item>
                    <el-dropdown-item command="handleAuthRole" icon="el-icon-circle-check"
                      v-hasPermi="['system:user:edit']">{{ $t('user.assignRole') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown> -->
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
              :page-size.sync="queryParams.pageSize" @pagination="getList" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="dialogTitle" class="custom-dialog" :visible.sync="open" width="600px" append-to-body
      :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-position="top">
        <el-row>
          <el-col>
            <el-form-item :label="$t('user.userName')" prop="userName">
              <el-input v-model="form.userName" :placeholder="$t('user.inputUserName')" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item :label="$t('user.phoneNumber')" prop="phonenumber">
              <el-input v-model="form.phonenumber" :placeholder="$t('user.inputPhoneNumber')" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('user.nickName')" prop="nickName">
              <el-input v-model="form.nickName" :placeholder="$t('user.inputNickName')" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('user.deptName')" prop="deptId">
              <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" :placeholder="$t('user.selectDept')" />
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row>
          <el-col>
            <el-form-item :label="$t('user.role')" prop="roleIds">
              <el-select v-model="form.roleIds" multiple :placeholder="$t('user.selectRole')" style="width: 100%"
                @change="handleRoleSelectChange">
                <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId"
                  :disabled="item.status == 1" />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item :label="$t('user.email')" prop="email">
              <el-input v-model="form.email" :placeholder="$t('user.inputEmail')" maxlength="50" />
            </el-form-item>
          </el-col> -->
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="所属部门" prop="deptId">
              <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" :placeholder="$t('user.selectDept')" />
              <div v-if="form.userId === undefined" class="form-tip">默认建议在当前选中部门下新增用户，便于后续直接归档到组织架构。</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.userId !== undefined">
          <el-col>
            <el-form-item :label="$t('status')" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('user.sex')">
              <el-select v-model="form.sex" :placeholder="$t('user.selectSex')">
                <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('status')">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('user.post')">
              <el-select v-model="form.postIds" multiple :placeholder="$t('user.selectPost')">
                <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName" :value="item.postId"
                  :disabled="item.status == 1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('user.remark')">
              <el-input v-model="form.remark" type="textarea" :placeholder="$t('user.inputRemark')"></el-input>
            </el-form-item>
          </el-col>
        </el-row> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('confirm') }}</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="uploadTitle" :visible.sync="upload.open" width="400px" append-to-body
      :close-on-click-modal="false">
      <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          {{ $t('user.uploadTextPrefix') }}<em>{{ $t('user.clickUpload') }}</em>
        </div>
        <div slot="tip" class="el-upload__tip text-center">
          <div slot="tip" class="el-upload__tip">
            <el-checkbox v-model="upload.updateSupport" />
            {{ $t('user.updateExistingData') }}
          </div>
          <span>{{ $t('user.importFileTip') }}</span>
          <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline;"
            @click="importTemplate">
            {{ $t('downloadTemplate') }}
          </el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitFileForm">{{ $t('confirm') }}</el-button>
        <el-button @click="upload.open = false">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUser, getUser, delUser, addUser, updateUser, resetUserPwd, deptTreeSelect } from '@/api/system/user'
import { getToken } from '@/utils/auth'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const createColumns = vm => [
  { key: 0, label: vm.$t('user.userId'), visible: true },
  { key: 1, label: vm.$t('user.userName'), visible: true },
  { key: 2, label: vm.$t('user.nickName'), visible: true },
  { key: 3, label: vm.$t('user.deptName'), visible: true },
  { key: 4, label: vm.$t('user.phoneNumber'), visible: true },
  { key: 5, label: vm.$t('status'), visible: true },
  { key: 6, label: vm.$t('createdTime'), visible: true }
]

const createRules = vm => ({
  userName: [
    { required: true, message: vm.$t('user.validation.userNameRequired'), trigger: 'blur' },
    { min: 2, max: 20, message: vm.$t('user.validation.userNameLength', { min: 2, max: 20 }), trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: vm.$t('user.validation.nickNameRequired'), trigger: 'blur' }
  ],
  phonenumber: [
    {
      required: false,
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: vm.$t('user.validation.phoneNumberInvalid'),
      trigger: 'blur'
    }
  ],
  roleIds: [
    { required: true, message: vm.$t('user.validation.roleRequired'), trigger: 'change' }
  ],
  deptId: [
    { required: true, message: '所属部门不能为空', trigger: 'change' }
  ],
  password: [
    { required: true, message: vm.$t('user.validation.passwordRequired'), trigger: 'blur' },
    { min: 5, max: 20, message: vm.$t('user.validation.passwordLength', { min: 5, max: 20 }), trigger: 'blur' }
  ],
  email: [
    {
      type: 'email',
      message: vm.$t('user.validation.emailInvalid'),
      trigger: ['blur', 'change']
    }
  ]
})

export default {
  name: 'User',
  dicts: ['sys_normal_disable', 'sys_user_sex'],
  components: { Treeselect },
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: false,
      currentDeptName: '全部用户',
      total: 0,
      userList: [],
      titleKey: '',
      deptOptions: undefined,
      open: false,
      initPassword: undefined,
      dateRange: [],
      postOptions: [],
      roleOptions: [],
      form: {},
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      upload: {
        open: false,
        titleKey: '',
        isUploading: false,
        updateSupport: 0,
        headers: { Authorization: 'Bearer ' + getToken() },
        url: process.env.VUE_APP_BASE_API + '/system/user/importData'
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined
      },
      columns: createColumns(this),
      rules: createRules(this)
    }
  },
  computed: {
    dialogTitle() {
      return this.titleKey ? this.$t(this.titleKey) : ''
    },
    uploadTitle() {
      return this.upload.titleKey ? this.$t(this.upload.titleKey) : ''
    }
  },
  watch: {
    '$i18n.locale'() {
      this.columns = createColumns(this)
      this.rules = createRules(this)
    }
  },
  created() {
    this.getList()
    this.getDeptTree()
    this.getConfigKey('sys.user.initPassword').then(response => {
      this.initPassword = response.msg
    })
  },
  methods: {
    toggleFilters() {
      this.showSearch = !this.showSearch
    },
    getList() {
      this.loading = true
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.userList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    getDeptTree() {
      deptTreeSelect().then(response => {
        this.deptOptions = response.data
      })
    },
    handleDeptAddChild() {
      this.$message.info('功能开发中')
    },
    handleDeptRename() {
      this.$message.info('功能开发中')
    },
    handleDeptMove() {
      this.$message.info('功能开发中')
    },
    handleDeptDelete() {
      this.$message.info('功能开发中')
    },
    handleNodeClick(data) {
      this.queryParams.deptId = data.id
      this.currentDeptName = data.label || '全部用户'
      this.handleQuery()
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: '0',
        remark: undefined,
        postIds: [],
        roleIds: []
      }
      this.resetForm('form')
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.queryParams.deptId = undefined
      this.currentDeptName = '全部用户'
      if (this.$refs.tree) {
        this.$refs.tree.setCurrentKey(null)
      }
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleCommand(command, row) {
      switch (command) {
        case 'handleResetPwd':
          this.handleResetPwd(row)
          break
        case 'handleAuthRole':
          this.handleAuthRole(row)
          break
        default:
          break
      }
    },
    handleAdd() {
      this.reset()
      getUser().then(response => {
        this.postOptions = response.posts
        this.roleOptions = response.roles
        this.open = true
        this.titleKey = 'user.titleAdd'
        this.form.password = this.initPassword
        this.form.deptId = this.queryParams.deptId
      })
    },
    handleUpdate(row) {
      this.reset()
      const userId = row.userId || this.ids
      getUser(userId).then(response => {
        this.form = response.data
        this.postOptions = response.posts
        this.roleOptions = response.roles
        this.$set(this.form, 'postIds', response.postIds)
        this.$set(this.form, 'roleIds', response.roleIds)
        this.open = true
        this.titleKey = 'user.titleEdit'
        this.form.password = ''
      })
    },
    handleResetPwd(row) {
      this.$prompt(this.$t('user.resetPasswordPrompt', { name: row.userName }), this.$t('tip'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: this.$t('user.validation.passwordLength', { min: 5, max: 20 })
      }).then(({ value }) => {
        resetUserPwd(row.userId, value).then(() => {
          this.$modal.msgSuccess(this.$t('user.resetPasswordSuccess', { password: value }))
        })
      }).catch(() => { })
    },
    handleAuthRole(row) {
      const userId = row.userId
      this.$router.push('/system/user-auth/role/' + userId)
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.form.nickName = this.form.userName
        if (this.form.userId !== undefined) {
          updateUser(this.form).then(() => {
            this.$modal.msgSuccess(this.$t('user.updateSuccess'))
            this.open = false
            this.getList()
          })
          return
        }
        addUser(this.form).then(() => {
          this.$modal.msgSuccess(this.$t('user.addSuccess'))
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const userIds = row.userId || this.ids
      this.$modal.confirm(this.$t('user.confirmDelete', { ids: userIds }))
        .then(() => delUser(userIds))
        .then(() => {
          this.getList()
          this.$modal.msgSuccess(this.$t('user.deleteSuccess'))
        })
        .catch(() => { })
    },
    handleExport() {
      this.download('system/user/export', {
        ...this.queryParams
      }, `user_${new Date().getTime()}.xlsx`)
    },
    handleImport() {
      this.upload.titleKey = 'user.importUser'
      this.upload.open = true
    },
    importTemplate() {
      this.download('system/user/importTemplate', {}, `user_template_${new Date().getTime()}.xlsx`)
    },
    handleFileUploadProgress() {
      this.upload.isUploading = true
    },
    handleFileSuccess(response) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert(
        "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>',
        this.$t('importResult'),
        { dangerouslyUseHTMLString: true }
      )
      this.getList()
    },
    submitFileForm() {
      this.$refs.upload.submit()
    },
    handleRoleSelectChange(value) {
      if (value && value.length > 1) {
        this.form.roleIds = [value[value.length - 1]]
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.page-layout {
  display: flex;
  align-items: stretch;
  flex: 1;
  overflow: hidden;
}

.page-layout>.el-col {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}

.left-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.left-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2a37;
}

.left-card__desc {
  font-size: 12px;
  color: #909399;
  margin-bottom: 16px;
}

.left-card__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.left-card__stat {
  border-radius: 12px;
  padding: 14px 16px;
  background: #f7f9fc;
}

.left-card__stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.left-card__stat-label {
  font-size: 13px;
  color: #7c8592;
  margin-bottom: 10px;
}

.left-card {
  border-radius: 10px;
  height: 100%;
  max-height: 100%;
  overflow: auto;

  ::v-deep .el-card__body {
    height: 100%;
    max-height: 100%;
    overflow: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
}

.left-card__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.left-card__actions ::v-deep .el-button {
  width: 100%;
  border-radius: 10px;
}

.left-card__actions ::v-deep .el-button+.el-button {
  margin-left: 0;
}

.left-card__actions ::v-deep .el-button--primary.is-plain {
  background: #eff6ff;
  border-color: #dbeafe;
  color: #3b82f6;
}

.left-card__actions ::v-deep .el-button--danger.is-plain {
  background: #fef2f2;
  border-color: #fee2e2;
  color: #ef4444;
}

.search-card {
  border-radius: 10px;

  .el-form-item {
    margin-bottom: 0;
  }
}

.search-wrapper {
  margin-bottom: 20px;
}

.tree-container {
  background: #f7f9fc;
  border-radius: 12px;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.deptTree {
  height: 100%;
  overflow-y: auto;
}

.deptTree ::v-deep .el-tree-node__content {
  height: 44px;
  border-radius: 10px;
  margin-bottom: 6px;
  padding: 0 12px;
}

.deptTree ::v-deep .el-tree-node__content:hover {
  background: #eff6ff;
}

.deptTree ::v-deep .el-tree-node.is-current>.el-tree-node__content {
  background: #eff6ff;
}

.dept-tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.dept-tree-node__left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.dept-tree-node__icon {
  font-size: 16px;
  color: #909399;
  margin-right: 8px;
  flex-shrink: 0;
}

.dept-tree-node__icon--root {
  color: #409EFF;
}

.dept-tree-node__label {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dept-tree-node__count {
  font-size: 12px;
  color: #6b7280;
  background: #eef2ff;
  border-radius: 999px;
  padding: 2px 10px;
  flex-shrink: 0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.status-pill__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-pill--enable {
  color: #16a34a;
  background: #eaf7ee;
}

.status-pill--enable .status-pill__dot {
  background: #16a34a;
}

.status-pill--disable {
  color: #f59e0b;
  background: #fff7e6;
}

.status-pill--disable .status-pill__dot {
  background: #f59e0b;
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #7c8592;
  line-height: 18px;
}

.table-card {
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  ::v-deep .el-card__body {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.table-card-content {
  padding: 0 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.table-header {
  margin-top: 20px;
}

.table-header__title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2a37;
  line-height: 22px;
}

.table-header__sub {
  margin-top: 4px;
  font-size: 12px;
  color: #7c8592;
  line-height: 18px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-group-right {
  margin-left: auto;
}

.tableBox {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.custom-dialog {
  ::v-deep .el-dialog {
    border-radius: 10px;
  }

  ::v-deep .el-dialog__header {
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
