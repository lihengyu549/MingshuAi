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
              <div class="left-card__stat-value">{{ departmentsNum }}</div>
            </div>
            <div class="left-card__stat">
              <div class="left-card__stat-label">用户数量</div>
              <div class="left-card__stat-value">{{ userNum }}</div>
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
                <span class="dept-tree-node__count">{{ data.num || '0' }}</span>
              </span>
            </el-tree>
          </div>
        </el-card>
      </el-col>

      <el-col :span="19" :xs="24">
        <el-collapse-transition>
          <div v-show="showSearch" class="search-wrapper">
            <el-card class="search-card" shadow="never">
              <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="68px"
                style="display: flex;justify-content: space-around;">
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
              <el-table-column type="selection" width="50" align="left" />
              <!-- <el-table-column :label="$t('user.userId')" align="center" key="userId" prop="userId" v-if="columns[0].visible" /> -->
              <el-table-column v-if="columns[1].visible" key="userName" :label="$t('user.userName')" align="left"
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
              <el-table-column :label="$t('user.role')" prop="remark" align="left">
                <template slot-scope="scope">
                  <span>{{ scope.row.remark || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('user.deptName')" prop="dept.deptName" align="left">
                <template slot-scope="scope">
                  <el-tag type="primary">{{ scope.row.dept ? scope.row.dept.deptName : '-' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column v-if="columns[5].visible" key="status" :label="$t('status')" align="left">
                <template slot-scope="scope">
                  <span :class="[
                    'status-pill',
                    scope.row.status === '0' ? 'status-pill--enable' : 'status-pill--disable'
                  ]">
                    <span class="status-pill__dot"></span>
                    <span>{{ scope.row.status === '0' ? $t('enable') : $t('disable') }}</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column v-if="columns[6].visible" :label="$t('createdTime')" align="left" prop="createTime"
                width="160">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('operation')" align="left" width="260"
                class-name="small-padding fixed-width">
                <template slot-scope="scope">
                  <el-button v-hasPermi="['system:user:edit']" size="mini" type="text" @click="handleUpdate(scope.row)">
                    {{ $t('edit') }}
                  </el-button>
                  <el-button v-if="scope.row.userId !== 1" v-hasPermi="['system:user:remove']" size="mini" type="text"
                    class="text-danger" @click="handleDelete(scope.row)">
                    {{ $t('delete') }}
                  </el-button>
                  <!-- <el-button v-hasPermi="['system:user:resetPwd']" size="mini" type="text" icon="el-icon-key"
                    @click="handleResetPwd(scope.row)">
                    {{ $t('resetPassword') }}
                  </el-button> -->

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
              <el-input v-model="form.userName" :placeholder="$t('user.inputUserName')" maxlength="30"
                :disabled="isAdminEdit" />
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
                :disabled="isAdminEdit" @change="handleRoleSelectChange">
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
            <el-form-item label="密码" prop="password" :required="form.userId === undefined">
              <el-input v-model="form.password" placeholder="请输入密码" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="确认密码" prop="confirmPassword" :required="form.userId === undefined">
              <el-input v-model="form.confirmPassword" placeholder="请再次输入密码" type="password" maxlength="20"
                show-password />
                <span v-if="form.userId === undefined" class="form-tip">建议密码长度不能小于6位，不能包含空格。</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="所属部门" prop="deptId">
              <treeselect ref="deptIdSelect" v-model="form.deptId" class="dept-treeselect" :options="deptOptions"
                :normalizer="deptTreeNormalizer" :show-count="true" :default-expand-level="999"
                :placeholder="$t('user.selectDept')" @input="handleDeptChange" />
              <div v-if="form.userId === undefined" class="form-tip">默认建议在当前选中部门下新增用户，便于后续直接归档到组织架构。</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.userId !== undefined">
          <el-col>
            <el-form-item :label="$t('status')" prop="status">
              <el-select v-model="form.status" style="width: 100%" :disabled="isAdminEdit">
                <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
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

    <!-- <el-dialog title="修改密码" class="custom-dialog" :visible.sync="resetPwdDialog.open" width="560px" append-to-body
      :close-on-click-modal="false">
      <el-form ref="resetPwdFormRef" :model="resetPwdForm" :rules="resetPwdRules" label-position="top">
        <el-form-item label="目标用户">
          <el-input :value="resetPwdForm.userName" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetPwdForm.password" placeholder="请输入新密码" type="password" maxlength="20" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPwdForm.confirmPassword" placeholder="请再次输入新密码" type="password" maxlength="20"
            show-password />
        </el-form-item>
        <div class="form-tip">请输入新的登录密码，建议不少于 6 位。</div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeResetPwdDialog">{{ $t('cancel') }}</el-button>
        <el-button type="primary" :loading="resetPwdDialog.loading" @click="submitResetPwdDialog">{{ $t('confirm')
          }}</el-button>
      </div>
    </el-dialog> -->

    <el-dialog title="移动部门" class="custom-dialog" :visible.sync="deptMoveDialog.open" width="560px" append-to-body
      :close-on-click-modal="false">
      <el-form ref="deptMoveFormRef" :model="deptMoveForm" label-position="top">
        <el-form-item label="当前部门">
          <el-input :value="currentDeptName" disabled />
        </el-form-item>
        <el-form-item label="移动到" prop="parentId">
          <treeselect ref="deptMoveSelect" v-model="deptMoveForm.parentId" class="dept-treeselect"
            :options="deptMoveOptions" :normalizer="deptTreeNormalizer" :show-count="true" :default-expand-level="999"
            placeholder="请选择目标部门" />
          <div class="form-tip">移动部门后，其下所有子部门与用户会整体跟随，不会丢失数据。</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDeptMoveDialog">{{ $t('cancel') }}</el-button>
        <el-button type="primary" :loading="deptMoveDialog.loading" @click="submitDeptMoveDialog">{{ $t('confirm')
        }}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增下级部门" class="custom-dialog" :visible.sync="deptAddDialog.open" width="560px" append-to-body
      :close-on-click-modal="false">
      <el-form ref="deptAddFormRef" :model="deptAddForm" :rules="deptAddRules" label-position="top">
        <el-form-item label="上级部门">
          <el-input :value="currentDeptName" disabled />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="deptAddForm.deptName" placeholder="请输入部门名称" maxlength="30" />
          <div class="form-tip">新增后的部门会自动挂载到当前选中部门下，可继续用于用户分配与筛选。</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDeptAddDialog">{{ $t('cancel') }}</el-button>
        <el-button type="primary" :loading="deptAddDialog.loading" @click="submitDeptAddDialog">{{ $t('confirm')
        }}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="重命名部门" class="custom-dialog" :visible.sync="deptRenameDialog.open" width="560px" append-to-body
      :close-on-click-modal="false">
      <el-form ref="deptRenameFormRef" :model="deptRenameForm" :rules="deptRenameRules" label-position="top">
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="deptRenameForm.deptName" placeholder="请输入部门名称" maxlength="30" />
          <div class="form-tip">部门重命名后，右侧用户「所属部门」标签会同步更新。</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDeptRenameDialog">{{ $t('cancel') }}</el-button>
        <el-button type="primary" :loading="deptRenameDialog.loading" @click="submitDeptRenameDialog">{{ $t('confirm')
        }}</el-button>
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
import { listUser, getUser, delUser, addUser, updateUser, deptTreeSelect } from '@/api/system/user'
import { getDept, addDept, updateDept as updateDeptInfo, delDept, listDeptExcludeChild } from '@/api/system/dept'
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
    {
      validator: (rule, value, callback) => {
        const isEdit = vm.form && vm.form.userId !== undefined
        if (!isEdit && !value) {
          callback(new Error(vm.$t('user.validation.passwordRequired')))
          return
        }
        if (value && (value.length < 5 || value.length > 20)) {
          callback(new Error(vm.$t('user.validation.passwordLength', { min: 5, max: 20 })))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    {
      validator: (rule, value, callback) => {
        const isEdit = vm.form && vm.form.userId !== undefined
        const password = vm.form ? vm.form.password : ''
        if (!isEdit && !value) {
          callback(new Error('请再次输入密码'))
          return
        }
        if (isEdit && !password && !value) {
          callback()
          return
        }
        if (!value) {
          callback(new Error('请再次输入密码'))
          return
        }
        if (value !== password) {
          callback(new Error('两次输入密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
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
      selectedDept: null,
      departmentsNum: 0,
      userNum: 0,
      total: 0,
      userList: [],
      titleKey: '',
      deptOptions: undefined,
      deptMoveDialog: {
        open: false,
        loading: false
      },
      deptMoveOptions: [],
      deptMoveForm: {
        deptId: undefined,
        parentId: undefined
      },
      deptAddDialog: {
        open: false,
        loading: false
      },
      deptAddForm: {
        parentId: undefined,
        deptName: ''
      },
      deptAddRules: {
        deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }]
      },
      deptRenameDialog: {
        open: false,
        loading: false
      },
      deptRenameForm: {
        deptId: undefined,
        parentId: undefined,
        deptName: ''
      },
      deptRenameRules: {
        deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }]
      },
      // resetPwdDialog: {
      //   open: false,
      //   loading: false
      // },
      // resetPwdForm: {
      //   userId: undefined,
      //   userName: '',
      //   password: '',
      //   confirmPassword: ''
      // },
      // resetPwdRules: {
      //   password: [
      //     { required: true, message: '请输入新密码', trigger: 'blur' },
      //     { min: 6, max: 20, message: '密码长度必须介于 6 和 20 之间', trigger: 'blur' }
      //   ],
      //   confirmPassword: [
      //     { required: true, message: '请再次输入新密码', trigger: 'blur' },
      //     {
      //       validator: (rule, value, callback) => {
      //         if (!value) return callback()
      //         if (value !== this.resetPwdForm.password) return callback(new Error('两次输入密码不一致'))
      //         callback()
      //       },
      //       trigger: 'blur'
      //     }
      //   ]
      // },
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
    },
    isAdminEdit() {
      return this.form && this.form.userId !== undefined && String(this.form.userId) === '1'
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
        const data = response.data || {}
        const treeData = Array.isArray(data.deptTree) ? data.deptTree : (Array.isArray(data) ? data : [])
        this.deptOptions = treeData
        this.departmentsNum = data.departmentsNum !== undefined && data.departmentsNum !== null ? Number(data.departmentsNum) : 0
        this.userNum = data.userNum !== undefined && data.userNum !== null ? Number(data.userNum) : 0
      })
    },
    handleDeptAddChild() {
      const deptId = this.queryParams.deptId
      if (!deptId) {
        this.$modal.msgError('请先选择要新增下级的部门')
        return
      }
      this.deptAddForm = {
        parentId: deptId,
        deptName: ''
      }
      this.deptAddDialog.open = true
      this.$nextTick(() => {
        if (this.$refs.deptAddFormRef) {
          this.$refs.deptAddFormRef.clearValidate && this.$refs.deptAddFormRef.clearValidate()
        }
      })
    },
    handleDeptRename() {
      const deptId = this.queryParams.deptId
      if (!deptId) {
        this.$modal.msgError('请先选择要重命名的部门')
        return
      }
      this.deptRenameDialog.open = true
      this.deptRenameDialog.loading = true
      getDept(deptId)
        .then(res => {
          this.deptRenameForm = { ...res.data }
        })
        .finally(() => {
          this.deptRenameDialog.loading = false
          this.$nextTick(() => {
            if (this.$refs.deptRenameFormRef) {
              this.$refs.deptRenameFormRef.clearValidate && this.$refs.deptRenameFormRef.clearValidate()
            }
          })
        })
    },
    handleDeptMove() {
      const deptId = this.queryParams.deptId
      if (!deptId) {
        this.$modal.msgError('请先选择要移动的部门')
        return
      }
      if (this.isTopDept(deptId)) {
        this.$modal.msgError('顶层部门不允许移动')
        return
      }
      this.deptMoveDialog.open = true
      this.deptMoveDialog.loading = true
      Promise.all([getDept(deptId), listDeptExcludeChild(deptId)])
        .then(([deptRes, listRes]) => {
          this.deptMoveForm = { ...deptRes.data, parentId: undefined }
          this.deptMoveOptions = Array.isArray(listRes.data) ? listRes.data : []
        })
        .finally(() => {
          this.deptMoveDialog.loading = false
        })
    },
    async handleDeptDelete() {
      const deptId = this.queryParams.deptId
      if (!deptId) {
        this.$modal.msgError('请先选择要删除的部门')
        return
      }
      const hasUsers = await this.checkDeptHasUsers(deptId)
      if (hasUsers) {
        this.$modal.msgError('当前部门或子部门下仍存在用户，不允许删除')
        return
      }
      const deptName = this.currentDeptName || '当前部门'
      try {
        await this.$modal.confirm(`是否确认删除名称为“${deptName}”的部门？`)
      } catch (e) {
        return
      }
      try {
        await delDept(deptId)
      } catch (e) {
        this.$modal.msgError('当前部门或子部门下仍存在用户，不允许删除')
        return
      }
      this.$modal.msgSuccess('删除成功')
      this.removeDeptNodeAndPromoteChildren(deptId)
      this.queryParams.deptId = undefined
      this.currentDeptName = '全部用户'
      this.selectedDept = null
      if (this.$refs.tree) {
        this.$refs.tree.setCurrentKey(null)
      }
      this.getDeptTree()
      this.handleQuery()
    },
    handleNodeClick(data) {
      this.queryParams.deptId = data.id
      this.currentDeptName = data.label || '全部用户'
      this.selectedDept = data
      this.handleQuery()
    },
    closeDeptMoveDialog() {
      this.deptMoveDialog.open = false
      this.deptMoveDialog.loading = false
      this.deptMoveForm = { deptId: undefined, parentId: undefined }
      this.deptMoveOptions = []
    },
    isTopDept(deptId) {
      if (!Array.isArray(this.deptOptions)) return false
      return this.deptOptions.some(item => String(item.id) === String(deptId))
    },
    closeDeptAddDialog() {
      this.deptAddDialog.open = false
      this.deptAddDialog.loading = false
      this.deptAddForm = { parentId: undefined, deptName: '' }
      if (this.$refs.deptAddFormRef) {
        this.$refs.deptAddFormRef.resetFields && this.$refs.deptAddFormRef.resetFields()
      }
    },
    submitDeptAddDialog() {
      if (!this.$refs.deptAddFormRef) return
      this.$refs.deptAddFormRef.validate(valid => {
        if (!valid) return
        this.deptAddDialog.loading = true
        const keepId = this.deptAddForm.parentId
        addDept(this.deptAddForm)
          .then(() => {
            this.$modal.msgSuccess('新增成功')
            this.closeDeptAddDialog()
            this.getDeptTree()
            this.$nextTick(() => {
              if (this.$refs.tree) {
                this.$refs.tree.setCurrentKey(keepId)
              }
            })
          })
          .finally(() => {
            this.deptAddDialog.loading = false
          })
      })
    },
    closeDeptRenameDialog() {
      this.deptRenameDialog.open = false
      this.deptRenameDialog.loading = false
      this.deptRenameForm = { deptId: undefined, parentId: undefined, deptName: '' }
      if (this.$refs.deptRenameFormRef) {
        this.$refs.deptRenameFormRef.resetFields && this.$refs.deptRenameFormRef.resetFields()
      }
    },
    submitDeptRenameDialog() {
      if (!this.$refs.deptRenameFormRef) return
      this.$refs.deptRenameFormRef.validate(valid => {
        if (!valid) return
        this.deptRenameDialog.loading = true
        const keepId = this.deptRenameForm.deptId
        updateDeptInfo(this.deptRenameForm)
          .then(() => {
            this.$modal.msgSuccess('修改成功')
            if (String(this.queryParams.deptId) === String(keepId)) {
              this.currentDeptName = this.deptRenameForm.deptName
              if (this.selectedDept) {
                this.selectedDept.label = this.deptRenameForm.deptName
              }
            }
            this.closeDeptRenameDialog()
            this.getDeptTree()
            this.$nextTick(() => {
              if (this.$refs.tree) {
                this.$refs.tree.setCurrentKey(keepId)
              }
            })
          })
          .finally(() => {
            this.deptRenameDialog.loading = false
          })
      })
    },
    deptTreeNormalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id || node.deptId,
        label: node.label || node.deptName,
        children: node.children
      }
    },
    normalizeDeptValue(value) {
      if (Array.isArray(value)) {
        const lastValue = value[value.length - 1]
        return this.normalizeDeptValue(lastValue)
      }
      if (value && typeof value === 'object') {
        return value.id || value.deptId || value.value || value.key || undefined
      }
      return value
    },
    handleDeptChange(value) {
      this.form.deptId = this.normalizeDeptValue(value)
    },
    findDeptNodeById(list, id) {
      if (!Array.isArray(list)) return null
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        if (item && item.id === id) return item
        if (item && item.children) {
          const found = this.findDeptNodeById(item.children, id)
          if (found) return found
        }
      }
      return null
    },
    findDeptParentAndNode(list, id, parent = null) {
      if (!Array.isArray(list)) return null
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        if (item && item.id === id) {
          return { parent, node: item, index: i, rootList: list }
        }
        if (item && item.children) {
          const found = this.findDeptParentAndNode(item.children, id, item)
          if (found) return found
        }
      }
      return null
    },
    removeDeptNodeAndPromoteChildren(deptId) {
      const found = this.findDeptParentAndNode(this.deptOptions, deptId)
      if (!found) return
      const children = Array.isArray(found.node.children) ? found.node.children : []
      if (found.parent && Array.isArray(found.parent.children)) {
        found.parent.children.splice(found.index, 1, ...children)
        return
      }
      if (Array.isArray(found.rootList)) {
        found.rootList.splice(found.index, 1, ...children)
      }
    },
    isDeptDescendant(deptId, targetParentId) {
      const root = this.findDeptNodeById(this.deptOptions, deptId)
      if (!root) return false
      const ids = []
      const walk = n => {
        if (!n || !Array.isArray(n.children)) return
        n.children.forEach(child => {
          ids.push(String(child.id))
          walk(child)
        })
      }
      walk(root)
      return ids.includes(String(targetParentId))
    },
    hasUsersInSubtreeByTree(deptId) {
      const node = this.findDeptNodeById(this.deptOptions, deptId)
      if (!node) return false
      let hasAnyCountField = false
      let hasUsers = false
      const walk = n => {
        if (!n) return
        if (n.userCount !== undefined || n.count !== undefined) {
          hasAnyCountField = true
          const c = Number(n.userCount !== undefined ? n.userCount : n.count)
          if (!Number.isNaN(c) && c > 0) hasUsers = true
        }
        if (Array.isArray(n.children)) {
          n.children.forEach(walk)
        }
      }
      walk(node)
      return hasAnyCountField ? hasUsers : false
    },
    checkDeptHasUsers(deptId) {
      if (this.hasUsersInSubtreeByTree(deptId)) {
        return Promise.resolve(true)
      }
      return listUser({ pageNum: 1, pageSize: 1, deptId })
        .then(res => {
          return Number(res.total) > 0
        })
        .catch(() => true)
    },
    submitDeptMoveDialog() {
      const deptId = this.deptMoveForm.deptId || this.queryParams.deptId
      const parentId = this.deptMoveForm.parentId
      if (!deptId) {
        this.$modal.msgError('请先选择要移动的部门')
        return
      }
      if (!parentId) {
        this.$modal.msgError('请选择目标部门')
        return
      }
      if (String(parentId) === String(deptId)) {
        this.$modal.msgError('目标部门不能选择当前部门自己')
        return
      }
      if (this.isDeptDescendant(deptId, parentId)) {
        this.$modal.msgError('目标部门不能选择当前部门的子部门')
        return
      }
      this.deptMoveDialog.loading = true
      updateDeptInfo(this.deptMoveForm)
        .then(() => {
          this.$modal.msgSuccess('移动成功')
          const keepId = deptId
          this.closeDeptMoveDialog()
          this.getDeptTree()
          this.$nextTick(() => {
            if (this.$refs.tree) {
              this.$refs.tree.setCurrentKey(keepId)
            }
          })
        })
        .finally(() => {
          this.deptMoveDialog.loading = false
        })
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
        confirmPassword: undefined,
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
      this.selectedDept = null
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
    // handleCommand(command, row) {
    //   switch (command) {
    //     case 'handleResetPwd':
    //       this.handleResetPwd(row)
    //       break
    //     case 'handleAuthRole':
    //       this.handleAuthRole(row)
    //       break
    //     default:
    //       break
    //   }
    // },
    handleAdd() {
      this.reset()
      getUser().then(response => {
        this.postOptions = response.posts
        this.roleOptions = response.roles
        this.open = true
        this.titleKey = 'user.titleAdd'
        this.form.password = this.initPassword
        this.form.confirmPassword = this.initPassword
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
        this.form.confirmPassword = ''
      })
    },
    // handleResetPwd(row) {
    //   this.resetPwdDialog.open = true
    //   this.resetPwdDialog.loading = false
    //   this.resetPwdForm = {
    //     userId: row.userId,
    //     userName: row.userName,
    //     password: '',
    //     confirmPassword: ''
    //   }
    //   this.$nextTick(() => {
    //     if (this.$refs.resetPwdFormRef) {
    //       this.$refs.resetPwdFormRef.clearValidate && this.$refs.resetPwdFormRef.clearValidate()
    //     }
    //   })
    // },
    // closeResetPwdDialog() {
    //   this.resetPwdDialog.open = false
    //   this.resetPwdDialog.loading = false
    //   this.resetPwdForm = { userId: undefined, userName: '', password: '', confirmPassword: '' }
    //   if (this.$refs.resetPwdFormRef) {
    //     this.$refs.resetPwdFormRef.resetFields && this.$refs.resetPwdFormRef.resetFields()
    //   }
    // },
    // submitResetPwdDialog() {
    //   if (!this.$refs.resetPwdFormRef) return
    //   this.$refs.resetPwdFormRef.validate(valid => {
    //     if (!valid) return
    //     if (this.resetPwdForm.password !== this.resetPwdForm.confirmPassword) {
    //       this.$modal.msgError('两次输入密码不一致')
    //       return
    //     }
    //     this.resetPwdDialog.loading = true
    //     resetUserPwd(this.resetPwdForm.userId, this.resetPwdForm.password)
    //       .then(() => {
    //         this.$modal.msgSuccess('修改成功')
    //         this.closeResetPwdDialog()
    //       })
    //       .finally(() => {
    //         this.resetPwdDialog.loading = false
    //       })
    //   })
    // },
    handleAuthRole(row) {
      const userId = row.userId
      this.$router.push('/system/user-auth/role/' + userId)
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const payload = {
          ...this.form,
          deptId: this.normalizeDeptValue(this.form.deptId),
          nickName: this.form.userName
        }
        if (!Array.isArray(payload.postIds) || !payload.postIds.length) {
          delete payload.postIds
        }
        if (payload.userId !== undefined && !payload.password) {
          delete payload.password
        }
        delete payload.confirmPassword
        if (payload.userId !== undefined) {
          updateUser(payload).then(() => {
            this.$modal.msgSuccess(this.$t('user.updateSuccess'))
            this.open = false
            this.getList()
          })
          return
        }
        addUser(payload).then(() => {
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

.dept-treeselect {
  width: 100%;
}

::v-deep .dept-treeselect .vue-treeselect__control {
  height: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
}

::v-deep .dept-treeselect .vue-treeselect__value-container {
  display: flex;
  align-items: center;
  min-height: 38px;
}

::v-deep .dept-treeselect .vue-treeselect__placeholder,
::v-deep .dept-treeselect .vue-treeselect__single-value,
::v-deep .dept-treeselect .vue-treeselect__input {
  line-height: 38px !important;
}

::v-deep .dept-treeselect .vue-treeselect__input-container {
  display: flex;
  align-items: center;
  height: 38px;
  padding-top: 0 !important;
}

::v-deep .dept-treeselect input.vue-treeselect__input {
  height: 38px !important;
  line-height: 38px !important;
  padding: 0 !important;
  margin: 0 !important;
}

::v-deep .dept-treeselect .vue-treeselect__menu {
  padding: 6px;
}

::v-deep .dept-treeselect .vue-treeselect__option {
  margin: 2px 0;
  padding-top: 2px;
  padding-bottom: 2px;
  border-radius: 6px;
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
