<template>
  <div class="app-container">
    <el-card class="card-box">
      <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>脏数据识别</span>
        </h4>
        <div class="contBox" style="display: flex;justify-content: flex-start;align-items: center;">
          <div style="width: 20%; display: flex; justify-content: flex-start;align-items: center;">
            <el-switch v-model="value" active-color="#009dff" inactive-color="#e0e0e0"></el-switch>
            <div style="margin-left: 15px;">样本全部为空</div>
          </div>
          <div style="width: 20%; display: flex; justify-content: flex-start;align-items: center;">
            <el-switch v-model="value2" active-color="#009dff" inactive-color="#e0e0e0"></el-switch>
            <div style="margin-left: 15px;">样本内容为单个字符或者数字</div>
          </div>
          <div style="width: 20%; display: flex; justify-content: flex-start;align-items: center;">
            <el-switch v-model="value3" active-color="#009dff" inactive-color="#e0e0e0"></el-switch>
            <div style="margin:0 15px;">样本重复率高于</div>
            <el-input :disabled="!value3" style="width: 20%;"></el-input>
          </div>
        </div>
      </div>
      <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>样本抽取</span>
        </h4>
        <div class="contBox" style="display: flex;justify-content: flex-start;align-items: center;">
          <span style="margin-right: 20px;">抽样数量</span>
          <el-radio-group v-model="radio">
            <el-radio :label="5">5</el-radio>
            <el-radio :label="10">10</el-radio>
            <el-radio :label="15">15</el-radio>
            <el-radio :label="20">20</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>数据表质量评分</span>
        </h4>
        <div class="contBox" style="display: flex;justify-content: flex-start;align-items: center;">
          <div>及格分</div>
          <el-input :disabled="!value3" style="width: 5%; margin: 0 20px;"></el-input>
          <div> <i class="el-icon-warning"></i>输入范围在30 ~ 100之间，低于及格分的数据表不会进行打标</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { treeselect as menuTreeselect, roleMenuTreeselect } from "@/api/system/menu";
import { listDataQueryUrl } from "@/api/system/dict/data";

export default {
  name: "matchingStrategy",
  // dicts: ['sys_normal_disable'],
  data() {
    return {
      value: true,
      value2: true,
      value3: true,
      radio: 20,
    };
  },
  created() {
    this.getlistData()
  },
  methods: {
    getlistData() {
      listDataQueryUrl('sys_scan_tactics').then(res => {
        console.log(res);

      })
    }
  }
};
</script>
<style scoped lang="scss">
.app-container{
  overflow-y: auto;
  ::v-deep ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::v-deep ::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

::v-deep ::-webkit-scrollbar-track {
  border-radius: 10px;
}
}


.title {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
  padding: 15px 0;
  background-color: #eff8fc;
}

.blue-circle {
  width: 30px;
  height: 30px;
  background-color: blue;
  border-radius: 50%;
  margin: 0 10px 0 20px;
}

.contBox {
  padding: 20px;
}
.card-box{
  height: 820px;
  overflow-y: auto;
}
</style>