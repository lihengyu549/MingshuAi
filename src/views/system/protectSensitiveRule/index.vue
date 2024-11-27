<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="规则名" prop="sensitiveName">
        <el-input v-model="queryParams.sensitiveName" placeholder="请输入规则名" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="规则等级" prop="sensitiveLevel">
        <!-- <el-input
          v-model="queryParams.sensitiveLevel"
          placeholder="请输入规则等级"
          clearable
          @keyup.enter.native="handleQuery"
        /> -->
        <el-select @change="tableChange($event)" v-model="queryParams.sensitiveLevel" placeholder="全部">
          <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="sensitiveRemark">
        <el-input v-model="queryParams.sensitiveRemark" placeholder="请输入备注" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:protectSensitiveRule:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:protectSensitiveRule:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:protectSensitiveRule:edit']">修改</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" @click="oneClickClear">一键清空</el-button>
      </el-col>



      <!-- <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['system:protectSensitiveRule:export']">导出</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="protectSensitiveRuleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="规则名" align="center" prop="sensitiveName" />
      <el-table-column label="规则等级" align="center" prop="sensitiveLevel" />
      <el-table-column label="脱敏规则" align="center" prop="maskRule" />
      <el-table-column label="备注" align="center" prop="sensitiveRemark" />
      <el-table-column label="状态" align="center" prop="enableStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.enableStatus">启用</span>
          <span v-else>禁用</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:protectSensitiveRule:edit']">修改</el-button>

          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:protectSensitiveRule:remove']">删除</el-button>


        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改打标规则对话框 -->
    <el-dialog class="addDialog" :title="title" :close-on-click-modal="false" :visible.sync="open" width="40%"
      append-to-body>
      <el-form ref="form" :model="form" :rules="rules" @submit.native.prevent>
        <el-form-item label="规则名" prop="sensitiveName">
          <div class="serclass">
            <el-input v-model="form.sensitiveName" placeholder="请输入规则名" />
          </div>
        </el-form-item>
        <el-form-item label="规则等级" prop="sensitiveLevel">
          <!-- <el-input v-model="form.sensitiveLevel" placeholder="请输入规则等级" /> -->
          <el-select class="selectClass" width="100%" v-model="form.sensitiveLevel" placeholder="请选择">
            <el-option v-for="item in securityOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="字段名匹配规则" prop="keyRule">
          <div class="fielRul">
            <a class="btn1" @click="fieldCli()">添加</a>
            <div class="fieldName">
              <div class="div1" v-for="item, index in fieldNameRule" :key="index">
                <span class="spRul">*</span>
                <el-input class="textarea" type="textarea" v-model="fieldNameRule[index]" />
                <a class="btn" @click="deletfield(index)">删除</a>
              </div>
              <!-- <el-input v-model="form.keyRule"  /> -->
            </div>
          </div>
        </el-form-item>
        <el-form-item label="记录匹配规则" prop="valueRule">
          <div class="fielRul">
            <a class="btn1" @click="remberCli()">添加</a>
            <div class="fieldName">
              <div class="div1" v-for="item, index in remberNameRule" :key="index">
                <span class="spRul">*</span>
                <el-input class="textarea" type="textarea" v-model="remberNameRule[index]" />
                <a class="btn" @click="deletCli(index)">删除</a>
              </div>
            </div>
          </div>
          <!-- <el-input v-model="form.valueRule" type="textarea" placeholder="请输入内容" /> -->
        </el-form-item>
        <el-form-item label="脱敏规则">
          <div class="serclass">
            <el-input v-model="form.maskRule" placeholder="请输入脱敏规则" />
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="sensitiveRemark">
          <div class="serclass">
            <el-input v-model="form.sensitiveRemark" placeholder="请输入备注" />
          </div>
        </el-form-item>

        <el-form-item label="状态" prop="sensitiveRemark">
          <div class="serclass">
            <el-switch v-model="form.enableStatus" active-text="启用" inactive-text="禁用">
            </el-switch>
          </div>
        </el-form-item>
        <ul>
          <li style="color: red;">
            注意:如果您不了解正则表达式,请不要随意修改规则内容
          </li>
          <li>
            您可以添加或修改规则内容,但请使用正则表达式
          </li>
          <li> 脱敏规则:用于指定一个规则，将应用程序通过数据库查询时，将敏感字段使用'*'号代替。</li>
          <ol>
            <li>全部替换 <br>
              规则：ALL，即数据返回时全部为*号</li>
            <li>区间替换 <br>

              区间替换格式为：开头保留位数:结尾保留位数，如2:2表示将开头保留2位，末尾保留2位。<br>
              例：
              规则2:1表示将开头保留2位，末尾保留1位。
              原数据为：中华人民
              打码数据为：**人*</li>
          </ol>
        </ul>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listProtectSensitiveRule, getProtectSensitiveRule, delProtectSensitiveRule, addProtectSensitiveRule, updateProtectSensitiveRule, markingClearI } from "@/api/system/protectSensitiveRule";

export default {
  name: "ProtectSensitiveRule",
  data () {
    return {
      remberNameRule: {},
      fieldNameRule: {},
      securityOptions: [
        {
          value: 1,
          label: "1"
        }, {
          value: 2,
          label: "2"
        }, {
          value: 3,
          label: "3"
        }, {
          value: 4,
          label: "4"
        }, {
          value: 5,
          label: "5"
        }],
      ruleId: 0,
      options: [
        {
          id: 0,
          label: "全部"
        }, {
          id: 1,
          label: "1"
        }, {
          id: 2,
          label: "2"
        }, {
          id: 3,
          label: "3"
        }, {
          id: 4,
          label: "4"
        }, {
          id: 5,
          label: "5"
        }],
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
      // 打标规则表格数据
      protectSensitiveRuleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        sensitiveName: null,
        sensitiveLevel: null,
        sensitiveRemark: null,
        enableStatus: true
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        sensitiveName: [
          { required: true, message: "规则名不能为空", trigger: "blur" }
        ],
        sensitiveLevel: [
          { required: true, message: "规则等级不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created () {
    this.getList();
    this.queryParams.sensitiveLevel = ''
  },
  methods: {
    // 一键清空
    oneClickClear () {
      this.$confirm('此操作将永久清空列表, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        markingClearI().then((res => {
          this.$message({
            type: 'success',
            message: res.msg
          });
        }))
      }).catch(() => {
      });
    },
    //禁用
    forbidden (row) {
      console.log(row);

    },

    fieldCli () {
      this.fieldNameRule.unshift('')
    },
    deletfield (i) {
      this.fieldNameRule.splice(i, 1)
    },
    deletCli (i) {
      this.remberNameRule.splice(i, 1)
    },
    remberCli () {
      if (this.remberNameRule == null) {
        this.remberNameRule = []
      }
      this.remberNameRule.unshift('')

    },
    tableChange (val) {
      this.ruleId = val
    },
    /** 查询打标规则列表 */
    getList () {
      this.loading = true;
      if (this.ruleId == "0") {
        this.queryParams.sensitiveLevel = null
      }
      listProtectSensitiveRule(this.queryParams).then(response => {
        this.protectSensitiveRuleList = response.rows;
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
        sensitiveName: null,
        sensitiveLevel: null,
        keyRule: null,
        valueRule: null,
        sensitiveRemark: null,
        enableStatus: true
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
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.fieldNameRule = []
      this.remberNameRule = []
      this.fieldNameRule.unshift('')
      this.remberNameRule.unshift('')
      this.title = "添加打标规则";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      if (this.remberNameRule == '') {
        this.remberNameRule = []
        this.remberNameRule.unshift('')
      }
      const id = row.id || this.ids
      getProtectSensitiveRule(id).then(response => {
        this.form = response.data;
        this.fieldNameRule = JSON.parse(this.form.keyRule)
        this.remberNameRule = JSON.parse(this.form.valueRule)
        this.open = true;
        this.title = "修改打标规则";
      });
    },
    /** 提交按钮 */
    submitForm () {



      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.keyRule = JSON.stringify(this.fieldNameRule)
          this.form.valueRule = JSON.stringify(this.remberNameRule)
          if (this.fieldNameRule !== null && this.fieldNameRule.length > 0) {
            for (let i = 0; i < this.fieldNameRule.length; i++) {
              if (this.fieldNameRule[i] == '' || this.fieldNameRule[i] == null) {
                this.$message.error(`字段名匹配规则的第${i + 1}个框不能为空`);
                return
              }
            }
          }
          if (this.remberNameRule !== null && this.remberNameRule.length > 0) {
            for (let i = 0; i < this.remberNameRule.length; i++) {
              if (this.remberNameRule[i] == '' || this.remberNameRule[i] == null) {
                this.$message.error(`记录匹配规则的第${i + 1}个框不能为空`);
                return
              }
            }
          }
          if (this.form.id != null) {
            updateProtectSensitiveRule(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addProtectSensitiveRule(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除打标规则编号为"' + ids + '"的数据项？').then(function () {
        return delProtectSensitiveRule(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/protectSensitiveRule/export', {
        ...this.queryParams
      }, `protectSensitiveRule_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
<style scoped>
.textarea {
  word-wrap: break-word !important;
  word-break: normal !important;
  margin-bottom: 2px;

}


.textarea /deep/ .el-textarea__inner {
  max-height: 49px !important;
}


.addDialog /deep/ .el-select {
  /* width:520px; */
  width: 78%;
}

.addDialog /deep/ .selectClass {
  /* width: 520px; */
  width: 80%;

}

.addDialog /deep/ .el-input--medium {
  /* width: 520px; */
  width: 80%;

}

.addDialog /deep/ .el-form-item__label {
  width: 110px !important;
}

.addDialog /deep/ .el-form-item__content {
  margin-left: 110px !important;
}

.btn {
  border: 0;
  color: #409eff;
  text-align: right;
  padding-left: 20px;


}

.btn1 {
  color: #409eff;
  text-align: right;
  margin-left: 90%;
}

.fieldName {
  height: 150px !important;
  overflow: auto !important;

}

.div1 {
  position: relative;
  /* width: 581px; */
  width: 80%;


}

.spRul {
  color: #ff4949;
  width: 5px;
  height: 5px;
  /* margin-right: 5px; */
  float: left;
  margin-top: 10px;
  margin-left: 5px;
  /* position: absolute;
  left: -14px;
  z-index: 999;
  top: 10px; */


}

.fielRul {
  margin-left: -10px;
}

.serclass /deep/ .el-input {
  width: 64% !important;

}

.fielRul ::-webkit-scrollbar {
  width: 10px;
}

.fielRul ::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 5px;
}

.fielRul ::-webkit-scrollbar-track {
  background-color: #f2f2f2;
}
</style>
