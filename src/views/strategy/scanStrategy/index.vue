<template>
  <div class="app-container">
    <el-card class="card" shadow="never">
      <template slot="header">
        <span class="title">
          <div class="blue-circle"></div><span>噪音数据过滤</span>
        </span>
      </template>
      <div class="contBox">
        <el-row :gutter="16">
          <el-col :span="8">
            <div class="switch-card">
              <div class="switch-content">
                <div class="switch-label">
                  <div class="label-text">{{ allData.DirtyData.DirtyData1.label }}</div>
                </div>
                <el-switch v-model="allData.DirtyData.DirtyData1.state" active-color="#009dff"
                  inactive-color="#e0e0e0"></el-switch>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="switch-card">
              <div class="switch-content">
                <div class="switch-label">
                  <div class="label-text">{{ allData.DirtyData.DirtyData2.label }}</div>
                </div>
                <el-switch v-model="allData.DirtyData.DirtyData2.state" active-color="#009dff"
                  inactive-color="#e0e0e0"></el-switch>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="switch-card">
              <div class="switch-content">
                <div class="switch-label">
                  <div class="label-text">
                    <span>{{ allData.DirtyData.DirtyData3.label }}</span>
                    <el-input v-model="allData.DirtyData.DirtyData3.value" size="mini"
                      :disabled="!allData.DirtyData.DirtyData3.state" style="width: 60px;margin-left: 10px;"
                      @input="handleDirtyDataInput"></el-input>
                    <span style="margin-left: 4px;">%</span>
                  </div>
                </div>
                <el-switch v-model="allData.DirtyData.DirtyData3.state" active-color="#009dff"
                  inactive-color="#e0e0e0"></el-switch>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <div class="switch-card">
              <div class="switch-content">
                <div class="switch-label">
                  <div class="label-text">{{ allData.DirtyData.DirtyData4.label }}</div>
                  <div class="label-desc">包含主键，外键，编码方式等</div>
                </div>
                <el-switch v-model="allData.DirtyData.DirtyData4.state" active-color="#009dff"
                  inactive-color="#e0e0e0"></el-switch>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="switch-card">
              <div class="switch-content">
                <div class="switch-label">
                  <div class="label-text">{{ allData.DirtyData.DirtyData5.label }}</div>
                  <div class="label-desc">包含前端配置，系统参数等</div>
                </div>
                <el-switch v-model="allData.DirtyData.DirtyData5.state" active-color="#009dff"
                  inactive-color="#e0e0e0"></el-switch>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="switch-card">
              <div class="switch-content">
                <div class="switch-label">
                  <div class="label-text">{{ allData.DirtyData.DirtyData6.label }}</div>
                  <div class="label-desc">包含备份字段，自定义字段等</div>
                </div>
                <el-switch v-model="allData.DirtyData.DirtyData6.state" active-color="#009dff"
                  inactive-color="#e0e0e0"></el-switch>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <el-card class="card" shadow="never">
      <template slot="header">
        <span class="title">
          <div class="blue-circle"></div><span>样本抽取</span>
        </span>
      </template>
      <div class="contBox">
        <span class="sample-label">抽样数量</span>
        <el-radio-group v-model="allData.SampleExtraction.value" class="sample-radio-group">
          <el-radio label="0" border>0</el-radio>
          <el-radio label="5" border>5</el-radio>
          <el-radio label="10" border>10</el-radio>
          <el-radio label="20" border>20</el-radio>
          <el-radio label="50" border>50</el-radio>
        </el-radio-group>
      </div>
    </el-card>
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

    <el-card class="card" shadow="never">
      <template slot="header">
        <span class="title">
          <div class="blue-circle"></div><span>敏感数据定义</span>
        </span>
      </template>
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
    </el-card>
    <div class="foot_btn">
      <el-button type="primary" plain @click="submit">确 定</el-button>
    </div>
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

.card {
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 15px;

  .el-card__header {
    padding: 15px;
    border-bottom: 1px solid #e2e8f0;
  }
}


.title {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.blue-circle {
  // width: 30px;
  // height: 30px;
  // background-color: rgb(19, 175, 247);
  // border-radius: 50%;
  // margin: 0 10px 0 20px;
}

.contBox {
  padding: 20px 0;
}

.switch-card {
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 70px;
}

.switch-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.switch-label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.label-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.sample-label {
  margin-right: 20px;
  font-size: 14px;
  color: #333;
}

.sample-radio-group {
  display: inline-flex;
  gap: 12px;

  ::v-deep .el-radio {
    width: 40px;
    height: 40px;
    margin-right: 0;
    border-radius: 50% !important;
    padding: 0;
    text-align: center;
    line-height: 40px;

    .el-radio__input {
      display: none !important;
    }

    .el-radio__label {
      padding: 0;
    }

    &.is-bordered {
      border: 1px solid #dcdfe6;
    }

    &.is-checked {
      border-color: #009dff;

      .el-radio__label {
        color: #009dff;
      }
    }
  }
}

.foot_btn {
  position: absolute;
  right: 37px;
  bottom: 24px;
}

.el-row {
  margin-top: 0;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>