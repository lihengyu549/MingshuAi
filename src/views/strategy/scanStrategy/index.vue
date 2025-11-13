<template>
  <div class="app-container">
    <el-card class="card-box" v-loading="cardLoading">
      <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>噪音数据过滤</span>
        </h4>
        <div class="contBox">
          <el-row>
            <el-col :span="12">
              <el-switch v-model="allData.DirtyData.DirtyData1.state" active-color="#009dff" inactive-color="#e0e0e0"
                :active-text="allData.DirtyData.DirtyData1.label"></el-switch>
            </el-col>
            <el-col :span="12">
              <el-switch v-model="allData.DirtyData.DirtyData2.state" active-color="#009dff" inactive-color="#e0e0e0"
                :active-text="allData.DirtyData.DirtyData2.label"></el-switch>
            </el-col>
          </el-row>
          <el-row style="display: flex; align-items: center;">
            <el-col :span="12">
              <el-switch v-model="allData.DirtyData.DirtyData3.state" active-color="#009dff" inactive-color="#e0e0e0"
                :active-text="allData.DirtyData.DirtyData3.label">
              </el-switch>
              <el-input v-model="allData.DirtyData.DirtyData3.value" size="mini"
                :disabled="!allData.DirtyData.DirtyData3.state" style="width: 20%;margin-left: 10px;"
                @input="handleDirtyDataInput"></el-input>
              <el-tooltip class="item" effect="dark" content="样本重复率" placement="top-start">
                <svg-icon icon-class="dengpao" style="margin-left:8px;" />
              </el-tooltip>
            </el-col>
            <el-col :span="12">
              <el-switch v-model="allData.DirtyData.DirtyData4.state" active-color="#009dff" inactive-color="#e0e0e0"
                :active-text="allData.DirtyData.DirtyData4.label"></el-switch>
                <el-tooltip class="item" effect="dark" content="包含主键，外键，编码方式等" placement="top-start">
                <svg-icon icon-class="dengpao" style="margin-left:8px;" />
              </el-tooltip>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-switch v-model="allData.DirtyData.DirtyData5.state" active-color="#009dff" inactive-color="#e0e0e0"
                :active-text="allData.DirtyData.DirtyData5.label"></el-switch>
                <el-tooltip class="item" effect="dark" content="包含前端配置，系统参数等" placement="top-start">
                <svg-icon icon-class="dengpao" style="margin-left:8px;" />
              </el-tooltip>
            </el-col>
            <el-col :span="12">
              <el-switch v-model="allData.DirtyData.DirtyData6.state" active-color="#009dff" inactive-color="#e0e0e0"
                :active-text="allData.DirtyData.DirtyData6.label"></el-switch>
                <el-tooltip class="item" effect="dark" content="包含备份字段，自定义字段等" placement="top-start">
                <svg-icon icon-class="dengpao" style="margin-left:8px;" />
              </el-tooltip>
            </el-col>
          </el-row>
        </div>
      </div>
      <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>样本抽取</span>
        </h4>
        <div class="contBox" style="display: flex;justify-content: flex-start;align-items: center;">
          <span style="margin-right: 20px;height: 28.5px;">抽样数量</span>
          <el-radio-group v-model="allData.SampleExtraction.value">
            <el-radio label="0">0</el-radio>
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
                <el-option v-for="item in sys_risk_levelList" :key="item" :label="item" :value="item">
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
      sys_risk_levelList: ['1', '2', '3', '4', '5'],
      allData: {
        DirtyData: {
          DirtyData1: {},
          DirtyData2: {},
          DirtyData3: {},
          DirtyData4: {},
          DirtyData5: {},
          DirtyData6: {},
        },
        SensitiveData: {},
        SampleExtraction: {},
        DataTableQualityScore: {},
        // 噪音数据过滤
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
    // 处理DirtyData3输入
    handleDirtyDataInput() {
      let value = this.allData.DirtyData.DirtyData3.value;
      // 只保留数字和百分号
      value = value.replace(/[^0-9%]/g, '');
      // 确保百分号只在最后一位
      if (value.indexOf('%') > -1 && value.indexOf('%') < value.length - 1) {
        value = value.replace(/%/g, '');
      }
      // 提取数字部分
      const numPart = value.replace('%', '');
      // 确保数字部分不超过100
      if (numPart && parseInt(numPart) > 100) {
        value = '100';
      }
      // 确保以百分号结尾
      if (numPart && !value.endsWith('%')) {
        value = value + '%';
      }
      this.allData.DirtyData.DirtyData3.value = value;
    },
    // 验证DirtyData3输入格式
    dirtyDataValueValidate() {
      // 只有当开关打开时才需要验证
      if (this.allData.DirtyData.DirtyData3.state) {
        const value = this.allData.DirtyData.DirtyData3.value;
        if (!value) {
          this.$message({
            message: '请输入数值',
            type: 'warning'
          });
          return false;
        }
        // 验证格式：数字(0-100)+必须的百分号
        const regex = /^(100|[1-9]?[0-9])(%)$/;
        if (!regex.test(value)) {
          this.$message({
            message: '此位置不规则，请输入0-100的数字加上%',
            type: 'warning'
          });
          return false;
        }
      }
      return true;
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
      // 验证DirtyData3输入格式
      if (!this.dirtyDataValueValidate()) {
        return;
      }
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

.el-row {
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>