<template>
  <div class="app-container main">
    <div class="writeBgc">
      <div style="display: flex;justify-content: space-between;align-items: center;padding: 10px;">
        <div style="height: 36px;display: flex;">
          <span class="selectLabel">所属框架</span>
          <el-select v-model="queryParams.categoryId" class="serachInput" @change="treeOptionsSelectChange"
              placeholder="全部">
              <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
              </el-option>
            </el-select>
        </div>
        <div style="height: 100%;"><el-button type="primary" size="medium" @click="editFn(scope.row)">导出报告</el-button></div>
      </div>
      <div class="hede_bgc"><div class="hede_bgc-text">数据资产概览  分类分级报告</div> </div>
    </div>
  </div>
</template>

<script>
import { listPost, getPost, delPost, addPost, updatePost } from "@/api/system/post";
import { getFrameworks } from "@/api/system/protectCategory";
export default {
  name: "Post",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      // 查询参数
      queryParams: {
        categoryId:'',
      },
      treeOptions:[]
      }
  },
  created() {
    this.gettreeOptionsList();
  },
  methods: {
    
    gettreeOptionsList() {
      this.Loading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        if (response.data.length > 0) {
          this.queryParams.categoryId = response.data[0].id;
        }
      });
    },
    
    // 左侧树下拉选change事件
    treeOptionsSelectChange(val) {
    },
  }
};
</script>
<style scoped>
.main {
  background-color: #eee;
  height: 100vh;
}

.writeBgc {
  background-color: #fff;
  width: 60%;
  margin: 0 auto;
}
.selectLabel{
  display: inline-block;
  padding: 10px;
  background-color: #eee;
  height: 36px;
  font-size: 14px;
  color: rgb(39, 39, 39);
}

.hede_bgc{
  width: 100%;
  height: 180px;
  background: url('../../../assets/images/assetReportBgc.png');
  background-size: 100% 100%; /* 修改背景图大小 */
  background-position: 0 60%;
  background-repeat: no-repeat;
  position: relative; /* 添加相对定位 */
}

.hede_bgc-text {
  font-size: 48px;
  text-align: center;
  width: 100%;
  position: absolute; /* 使用绝对定位 */
  top: 50%; /* 调整文字垂直位置 */
  left: 50%; /* 调整文字水平位置 */
  transform: translate(-50%, -50%); /* 使文字居中 */
  color: white; /* 设置文字颜色 */
  z-index: 1; /* 确保文字在背景图上面 */
}
</style>