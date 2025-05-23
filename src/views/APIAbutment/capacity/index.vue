<template>
  <div class="app-container">
    <div class="header">
      <el-button size="medium" type="primary" @click="addApiKeys()">创建API Key</el-button>
    </div>
    <el-table v-loading="loading" max-height="700px" class="tableBox" :data="tableList" ref="tableRef">
      <el-table-column label="API Key" width="300" align="center" prop="proxyToken">
        <template slot-scope="scope">
          <span>{{ scope.row.proxyToken }}</span>
        </template>
      </el-table-column>
      <el-table-column label="授信地址" width="230" align="center" prop="ip" />
      <el-table-column label="归属账号" width="180" align="center" prop="accountNumber" />
      <el-table-column label="描述" align="center" prop="userData" />
      <el-table-column label="调用次数" align="center" width="120" prop="callNum" />
      <el-table-column label="创建时间" align="center" width="180" prop="updateTime" />
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <template>
            <el-button size="mini" type="text" v-if="scope.row.passTextShow"
              @click="resultLookFn(scope.row)">查看</el-button>
            <el-button size="mini" type="text" v-else @click="copyApiKey(scope.row)">复制</el-button>
          </template>
          <el-button size="mini" type="text" @click="updataFn(scope.row)">更新</el-button>
          <el-button size="mini" type="text" @click="editFn(scope.row)">编辑</el-button>
          <el-button size="mini" type="text" @click="deleteFn(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <!-- 添加apikeys -->
    <el-dialog class="addMsg" title="创建API Key" v-loading="formLoading" :visible.sync="dialogShow" width="580px"
      append-to-body :close-on-click-modal="false">
      <el-form :model="ApiForm" ref="ApiForm" size="small" label-width="auto" :rules="apiRules"
        style="margin-top: 30px; width: 600px;">
        <!-- <el-form-item label="标准名称" prop="categoryId">
          <el-select v-model="ApiForm.categoryId" class="serachInput" placeholder="全部" style="margin-right: 20px">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
          <span>行业id：{{ ApiForm.categoryId }}</span>
        </el-form-item> -->
        <el-form-item label="所属账号" prop="accountNumber">
          <el-select v-model="ApiForm.accountNumber" placeholder="全部">
            <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.userName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="userData">
          <el-input v-model="ApiForm.userData" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="授信地址" prop="ip">
          <el-input v-model="ApiForm.ip" placeholder="请输入授信地址" />
          <div style="font-size: 12px; font-style: italic;">示例：192.168.1.1-200，多个IP以逗号隔开</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="closeFn">取消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getApiV1List, addApiV1, deleteApiV1, generateToken,updateApiV1 } from "@/api/APIAbutment";

import {
  selectUserListAll,
} from "@/api/standard";
export default {
  name: 'capacity',
  data() {
    return {
      tableList: [{ id: 1 }],
      loading: false,
      total: 0,
      dialogShow: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      userList:[],
      formLoading: false,
      ApiForm: {
        accountNumber:'',
        ip:'',
        userData:'',
      },
      apiRules: {
        accountNumber: [
          { required: true, message: "所属账号不能为空", trigger: "blur" },
        ],
        userData: [
          { required: true, message: "描述不能为空", trigger: "blur" },
        ],
        ip: [
          { required: true, message: "授信地址不能为空", trigger: "blur" },
        ],
      }
    }
  },
  created() {
    this.getList()
    this.getSelectUserListAll()
  },
  methods: {
    // 查询列表数据
    getList() {
      this.loading = true;
      getApiV1List(this.queryParams).then(response => {
        this.tableList = response.data.rows;
        for (let item of this.tableList) {
          item.oldKeys = item.proxyToken
          item.proxyToken = this.maskMiddleSix(item.oldKeys)
          item.passTextShow = true
        }
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 新增
    addApiKeys() {
      this.formReset()
      this.dialogShow = true
    },
    // 重置form数据
    formReset() {
      this.ApiForm.userData = ''
      this.ApiForm.accountNumber = ''
      this.ApiForm.ip = ''
    },
    // apikey中间数据加密
    maskMiddleSix(str) {
      // if (str.length !== 18) {
      //   return '未知key，请联系后台人员';
      // }
      if(!str || !str.length ){
        return ''
      }
      return str.slice(0, 13) + '******' + str.slice(19);
    },
    submitForm() {
      this.$refs["ApiForm"].validate(async (valid) => {
        if (valid) {
          this.formLoading = true
          let params = {
            accountNumber: this.ApiForm.accountNumber,
            userData: this.ApiForm.userData,
            ip: this.ApiForm.ip,
          }
          if (this.ApiForm.id != null) {
            params.id = this.ApiForm.id
            updateApiV1(params).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.getList();
              this.dialogShow = false
              this.formLoading = false
            })
              .catch((err) => {
                this.formLoading = false
              })
          } else {
            addApiV1(params).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.getList();
              this.dialogShow = false
              this.formLoading = false
            })
              .catch((err) => {
                this.formLoading = false
              })
          }
        } else {
          return false
        }
      });

    },
    closeFn() { 
      this.dialogShow = false
    },
    // 查看
    resultLookFn(row) {
      row.proxyToken = row.oldKeys
      row.passTextShow = false
    },
    // 复制
    copyApiKey(row) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(row.oldKeys)
          .then(() => {
            // alert('Text copied to clipboard!');
            this.$message.success('复制成功')
          })
          .catch(err => {
            // console.error('Failed to copy text: ', err);
            this.$message.error('复制失败')
          });
      } else {
        this.$message.error('当前浏览器不支持复制')
      }
    },
    //  更新
    updataFn(row) {
      this.$confirm('确定更新API Key吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          id: row.id,
        }
        this.loading = true;
        generateToken(data).then((res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success('更新成功')
            this.getList()
          }
        }))
          .catch(() => {
            this.loading = false;
          })

      }).catch(() => {
      });

    },
    //  编辑
    editFn(row) {
      this.formReset()
      this.ApiForm = JSON.parse(JSON.stringify(row))
      this.dialogShow = true
    },
    //  删除
    deleteFn(row) {
      this.$confirm('确定删除本条数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          ids: [row.id],
        }
        this.loading = true;
        deleteApiV1(data).then((res => {
          if (res.code == 200) {
            this.$message.success('操作成功')
            this.loading = false;
          }
        }))
          .catch(() => {
            this.loading = false;
          })
      }).catch(() => {
      });
    },
    //  获取用户列表
    getSelectUserListAll() {
      selectUserListAll().then(res => {
        this.userList = res.data;
      })
    },

  }
}
</script>

<style lang="scss" scoped>
.header {
  height: 100px;
  width: 100%;

  .el-button {
    margin-top: 50px;
  }
}

.tableBox {}

.addMsg ::v-deep .el-input {
  width: 80%;
}

.addMsg ::v-deep .el-select {
  width: 80%;
}

.addMsg .el-select ::v-deep .el-input {
  width: 100%;
}
</style>
