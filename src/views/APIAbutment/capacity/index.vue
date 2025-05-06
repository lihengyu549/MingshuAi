<template>
  <div class="app-container">
    <header>
      授权信息
    </header>
    <el-form :model="ApiForm" ref="ApiForm" size="small" label-width="auto" :rules="apiRules"
      style="margin-top: 30px; width: 600px;">
      <el-form-item label="标准名称" prop="categoryId">
        <el-select v-model="ApiForm.categoryId" class="serachInput" placeholder="全部" style="margin-right: 20px">
          <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
          </el-option>
        </el-select>
        <span>行业id：{{ ApiForm.categoryId }}</span>
      </el-form-item>
      <el-form-item label="授权地址" prop="bbb">
        <el-input v-model="ApiForm.businessName" placeholder="请输入数据源名称" />
      </el-form-item>
      <el-form-item label="accessKey" prop="businessName">
        <el-input v-model="ApiForm.businessName" disabled placeholder="请输入数据源名称" />
      </el-form-item>
      <el-form-item label="sercertKey" prop="businessName">
        <el-input v-model="ApiForm.businessName" disabled placeholder="请输入数据源名称" />
      </el-form-item>
      <el-form-item label-width="0">
        <el-button type="primary" @click="onSubmit">更新授权</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getFrameworks, } from "@/api/system/protectCategory";

export default {
  name: 'capacity',
  data() {
    return {
      ApiForm: {},
      treeOptions: [],
      apiRules: {
        categoryId: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
        ],
        bbb: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
        ],
      }
    }
  },
  created() {
    this.gettreeOptionsList();
  },
  methods: {
    onSubmit(){
      this.$modal.msgSuccess("更新成功");
    },
    gettreeOptionsList() {
      this.Loading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        if (response.data.length > 0) {
          this.queryParams.categoryId = response.data[0].id;
          this.getProtectCategory(this.queryParams.categoryId);
        }
      });
    },
  }
}
</script>

<style lang="scss" scoped>
header {
  padding: 30px 20px;
  font-size: 20px;
  background-color: #f2f2f2;
}
.serachInput{
  width: 60%;
}
</style>
