<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="数据库" prop="project">
        <el-select v-model="databaseName" filterable remote reserve-keyword placeholder="请输入数据库名称"
          :remote-method="databaseList" @change="databaseChange($event)">
          <el-option v-for="item in databaseTabList" :key="item.id" :label="item.targetDatabase" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>


      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <!-- <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button> -->
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:proxyUser:add']">新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:proxyUser:edit']"
        >修改</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:proxyUser:remove']">删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:proxyUser:export']"
        >导出</el-button>
      </el-col> -->
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>

    <el-table v-loading="loading" :data="proxyUserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <!-- <el-table-column label="代理id" align="center" prop="proxyInstanceId" /> -->
      <el-table-column label="数据库" align="center" prop="databaseName" />
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="用户密码" align="center" prop="">
        <template slot-scope="scope">
          <div>{{ scope.row.userPassword }}</div>
          <span v-if="scope.row.showTag == 1"><img @click="switchShowTagFunc(scope.row)"
              src="@/assets/images/hide-icon.png"></span>
          <span v-if="scope.row.showTag == 0">
            <img @click="switchShowTagFunc(scope.row)" src="@/assets/images/show-icon.png">
          </span>

        </template>
      </el-table-column>
      <el-table-column label="用户状态" align="center" prop="">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.userStatus" @change="handleSwitchChange(scope.row)" active-color="#1890ff"
            inactive-color="#999">
          </el-switch>
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="数据库权限"
        align="center"
        prop="databasePermission"
      /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:proxyUser:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:proxyUser:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :page-size.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改数据代理用户对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" @submit.native.prevent>


        <!-- <el-form-item label="代理id" prop="proxyInstanceId">
          <el-input v-model="form.proxyInstanceId" placeholder="请输入代理id" />
        </el-form-item> -->

        <el-form-item v-if="addDatabase" label="数据库" prop="proxyDatabaseIds">
          <el-select v-model="form.proxyDatabaseId" filterable remote reserve-keyword placeholder="请输入数据库名称"
            :remote-method="addDatabaseList" @change="addDatabaseChange($event)">
            <el-option v-for="item in addDatabaseTabList" :key="item.id" :label="item.targetDatabase" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="用户密码" prop="userPassword">
          <el-input type="password" v-model="form.userPassword" placeholder="请输入用户密码" />
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
import {
  searchDatabaseI,
  statusI,
  listProxyUser,
  getProxyUser,
  delProxyUser,
  addProxyUser,
  updateProxyUser,
  usersAddI
} from "@/api/system/proxyUser";
export default {
  name: "ProxyUser",
  data () {
    return {
      addDatabase: true,
      addDatabaseTabList: null,
      databaseTabList: [{ targetDatabase: "全部", id: 0 }],
      addDatabaseName: '',
      databaseName: "",
      databaseNameId: 0,
      addDatabaseNameId: 0,
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
      // 数据代理用户表格数据
      proxyUserList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        proxyInstanceId: null,
        userName: null,
        userPassword: null,
        userStatus: null,
        databasePermission: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
        ],
        addDatabaseName: [
          { required: true, message: "数据库名称不能为空", trigger: "blur" },
        ],
        proxyInstanceId: [
          { required: true, message: "代理id不能为空", trigger: "blur" },
        ],
        userPassword: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    $route (to, from) {
      if (to.path == "/risk/proxyUser") {
        if (this.$route.query.id) {
          this.databaseNameId = this.$route.query.id;
          this.databaseName = this.$route.query.name;
        }
        this.queryParams.pageNum = 1;
        this.getList();
      }
    }
  },
  created () {
    this.databaseName = '全部'
    if (this.$route.query.id) {
      this.databaseNameId = this.$route.query.id;
      this.databaseName = this.$route.query.name;
    }
    this.getList();
    this.searchDatabase("")
    // this.addSearchDatabase("")
  },
  methods: {
    switchShowTagFunc (row) {
      if (row.showTag == 1) {
        row.showTag = 0
        row.userPassword = '******'
      } else {
        row.showTag = 1
        row.userPassword = row.oldPassword
      }
    },
    addSearchDatabase (key) {
      if (key) {
        key = key.trim();
      }
      let data = {
        name: key
      }
      searchDatabaseI(data).then((res => {
        this.addDatabaseTabList = res.data

      }))

    },

    searchDatabase (key) {
      if (key) {
        key = key.trim();
      }
      let data = {
        name: key
      }
      searchDatabaseI(data).then((res => {
        this.databaseTabList = res.data
        if(this.addDatabaseTabList==null){
          this.addDatabaseTabList= JSON.parse(JSON.stringify(this.databaseTabList))
        }
        this.databaseTabList.unshift({ targetDatabase: "全部", id: 0 })
      }))

    },
    addDatabaseChange (value) {
      this.addDatabaseNameId = value
      this.form.proxyDatabaseId = value

    },

    databaseChange (value) {
      // this.databaseNameId=""
      this.databaseNameId = value

    },
    addDatabaseList (query) {
      if (query !== "") {
        setTimeout(() => {
          this.addSearchDatabase(query);
        }, 200);
      } else {
        this.addSearchDatabase("");
      }

    },
    databaseList (query) {
      if (query !== "") {
        setTimeout(() => {
          this.searchDatabase(query);
        }, 200);
      } else {
        this.searchDatabase("");
      }
    },
    handleSwitchChange (row) {
      row.userStatus = !row.userStatus
      if (row.userStatus == true) {
        this.$confirm('您是否要禁用此用户？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let status = 0
          let data = {
            id: row.id,
            status: status
          }
          statusI(data).then((res => {
            row.userStatus = false
            this.$message({
              message: res.msg,
              type: 'success'
            });
          }))

          // 用户点击确定按钮，执行相关操作
        }).catch(() => {
          // 用户点击了取消按钮，不做任何操作
        });
      } else {
        this.$confirm('您是否要开启此用户？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let status = 1
          let data = {
            id: row.id,
            status: status
          }
          statusI(data).then((res => {
            row.userStatus = true
            this.$message({
              message: res.msg,
              type: 'success'
            });
          }))
          // 用户点击确定按钮，执行相关操作
        }).catch(() => {
          // 用户点击了取消按钮，不做任何操作
        });
      }
    },
    /** 查询数据代理用户列表 */
    getList () {
      this.loading = true;
      if (this.databaseNameId == "0") {
        this.databaseNameId = 0
      }
      this.queryParams.proxyDatabaseId = this.databaseNameId;
      listProxyUser(this.queryParams).then((response) => {
        this.proxyUserList = response.rows;
        for (let item of this.proxyUserList) {
          item.showTag = 0
          item.oldPassword = item.userPassword
          item.userPassword = '******'
        }
        // for(let item in this.proxyUserList){
        //   this.proxyUserList[item].showTag=0
        // }
        this.total = response.total;
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
        proxyInstanceId: null,
        userName: null,
        userPassword: null,
        userStatus: "0",
        databasePermission: null,
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
      this.databaseName = "全部"
      this.databaseNameId=0
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.addDatabase = true
      this.reset();
      this.open = true;
      this.title = "添加数据代理用户";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.addDatabase = false
      this.reset();
      const id = row.id || this.ids;
      getProxyUser(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据代理用户";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateProxyUser(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            this.form.userStatus = null
            delete this.form.databasePermission
            delete this.form.id
            delete this.form.proxyInstanceId
            delete this.form.userStatus
            usersAddI(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除数据代理用户编号为"' + ids + '"的数据项？')
        .then(function () {
          return delProxyUser(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download(
        "system/proxyUser/export",
        {
          ...this.queryParams,
        },
        `proxyUser_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
