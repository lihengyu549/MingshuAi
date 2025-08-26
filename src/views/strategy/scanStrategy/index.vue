<template>
  <div class="app-container">
    <el-card class="card-box" v-loading="cardLoading">
      <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>脏数据识别</span>
        </h4>
        <div class="contBox" style="display: flex;justify-content: flex-start;align-items: center;">
          <div style="width: 20%; display: flex; justify-content: flex-start;align-items: center;">
            <el-switch v-model="allData.DirtyData.DirtyData1.state" active-color="#009dff"
              inactive-color="#e0e0e0"></el-switch>
            <div style="margin-left: 15px;">{{ allData.DirtyData.DirtyData1.label }}</div>
          </div>
          <div style="width: 20%; display: flex; justify-content: flex-start;align-items: center;">
            <el-switch v-model="allData.DirtyData.DirtyData2.state" active-color="#009dff"
              inactive-color="#e0e0e0"></el-switch>
            <div style="margin-left: 15px;">{{ allData.DirtyData.DirtyData2.label }}</div>
          </div>
          <div style="width: 20%; display: flex; justify-content: flex-start;align-items: center;">
            <el-switch v-model="allData.DirtyData.DirtyData3.state" active-color="#009dff"
              inactive-color="#e0e0e0"></el-switch>
            <div style="margin:0 15px;">{{ allData.DirtyData.DirtyData3.label }}</div>
            <el-input :disabled="!allData.DirtyData.DirtyData3.state" v-model="allData.DirtyData.DirtyData3.value"
              style="width: 20%;"></el-input>
          </div>
        </div>
      </div>
      <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>样本抽取</span>
        </h4>
        <div class="contBox" style="display: flex;justify-content: flex-start;align-items: center;">
          <span style="margin-right: 20px;height: 28.5px;">抽样数量</span>
          <el-radio-group v-model="allData.SampleExtraction.value">
            <el-radio label="5">5</el-radio>
            <el-radio label="10">10</el-radio>
            <el-radio label="20">20</el-radio>
            <el-radio label="50">50</el-radio>
          </el-radio-group>
        </div>
      </div>
      <!-- <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>数据表质量评分</span>
        </h4>
        <div class="contBox" style="display: flex;justify-content: flex-start;align-items: center;">
          <div>及格分</div>
          <el-input v-model="allData.DataTableQualityScore.value" style="width: 5%; margin: 0 20px;"
            @input="numInputFn($event)" @blur="numBlurFn($event)"></el-input>
          <div> <i class="el-icon-warning"></i>输入范围在0 ~ 100之间，低于及格分的数据表不会进行打标</div>
        </div>
      </div> -->

      <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>敏感数据定义</span>
        </h4>
        <div class="contBox" style="display: flex;justify-content: flex-start;align-items: center;">
          <div>
            <span>
              安全分级大于等于
              <el-select v-model="allData.SensitiveData.value" placeholder="请选择">
                <el-option v-for="item in sys_risk_levelList" :key="item" :label="item"
                  :value="item">
                </el-option>
              </el-select>
              的数据定义敏感数据
            </span>
          </div>
        </div>
      </div>
      <div class="foot_btn">
        <el-button type="primary" plain @click="submit">确 定</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { treeselect as menuTreeselect, roleMenuTreeselect } from "@/api/system/menu";
import { listByTacticsQueryUrl, updateByTactics } from "@/api/system/dict/data";

export default {
  name: "matchingStrategy",
  // dicts: ['sys_normal_disable'],
  data() {
    return {
      value: true,
      value2: true,
      value3: true,
      radio: 20,
      sys_risk_levelList:['1','2','3','4','5'],
      allData: {
        DirtyData: {
          DirtyData1: {},
          DirtyData2: {},
          DirtyData3: {},
        },
        SensitiveData:{},
        SampleExtraction: {},
        DataTableQualityScore: {},
      },
      cardLoading: false,
    };
  },
  created() {
    this.getlistData()
  },
  methods: {
    numInputFn() {
      let value = this.allData.DataTableQualityScore.value.replace(/[^0-9]/g, ''); // 移除非数字字符
      this.allData.DataTableQualityScore.value = value; // 更新输入框的值
    },
    numBlurFn() {
      if (this.allData.DataTableQualityScore.value > 100) {
        this.allData.DataTableQualityScore.value = 100
        this.$message({
          message: '输入范围在0 ~ 100之间',
          type: 'warning'
        });
      }
    },
    getlistData() {
      listByTacticsQueryUrl('sys_scan_tactics').then(res => {
        this.cardLoading = true
        if (res.code == 200) {
          this.allData = res.data
          this.cardLoading = false
        }
      })
    },
    submit() {
      updateByTactics(this.allData).then(res => {
        if (res.code == 200) {
          this.$message({
            message: '修改成功',
            type: 'success'
          });
          this.getlistData()
        }
      })
    }
  }
};
</script>
<style scoped lang="scss">
.app-container {
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
  font-size: 18px;
  padding: 20px 15px;
  background-color: #ebebebc2;
}

.blue-circle {
  // width: 30px;
  // height: 30px;
  // background-color: rgb(19, 175, 247);
  // border-radius: 50%;
  // margin: 0 10px 0 20px;
}

.contBox {
  padding: 40px 20px;
}

.card-box {
  height: 810px;
  overflow-y: auto;
  position: relative;
  padding: 0;

  ::v-deep .el-card__body {
    padding: 0;
  }
}

.foot_btn {
  position: absolute;
  right: 37px;
  bottom: 24px;
}
</style>