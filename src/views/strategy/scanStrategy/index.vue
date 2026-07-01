<template>
  <div class="app-container">
    <el-card class="enhance-card" shadow="never">
      <template slot="header">
        <div class="enhance-header">
          <div class="enhance-title">
            <svg-icon iconClass="表格" style="font-size: 20px;"></svg-icon>
            <span class="enhance-text">增强设置</span>
          </div>
          <div class="enhance-desc">统一管理控制参数、匹配规则等配置，提升数据识别配置的准确性与可维护性。</div>
          <div class="enhance-tabbar">
            <div class="enhance-tab" :class="{ active: activeTab === 'control' }" @click="setTab('control')">
              控制参数
            </div>
            <div class="enhance-tab" :class="{ active: activeTab === 'matching' }" @click="setTab('matching')">
              匹配规则
            </div>
          </div>
        </div>
      </template>

      <div class="enhance-body">
        <div v-show="activeTab === 'control'" class="enhance-panel">
          <el-card class="card" shadow="never">
            <template slot="header">
              <span class="title">
                <div class="icon">
                  <svg-icon icon-class="scanStrategy-1" style="font-size: 20px;"></svg-icon>
                </div><span>{{ $t('scanStrategy.dirtyDataFilter') }}</span>
              </span>
            </template>
            <div class="contBox">
              <el-row :gutter="16">
                <el-col :span="8">
                  <div class="switch-card">
                    <div class="switch-content">
                      <div class="switch-label">
                        <div class="label-text">{{ allData.DirtyData.DirtyData8.label }}</div>
                      </div>
                      <el-switch v-model="allData.DirtyData.DirtyData8.state" active-color="#009dff"
                        inactive-color="#e0e0e0"></el-switch>
                    </div>
                  </div>
                </el-col>
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
              </el-row>
              <el-row :gutter="16">
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
                <el-col :span="8">
                  <div class="switch-card">
                    <div class="switch-content">
                      <div class="switch-label">
                        <div class="label-text">{{ allData.DirtyData.DirtyData4.label }}</div>
                        <div class="label-desc">{{ $t('scanStrategy.containsKeyEtc') }}</div>
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
                        <div class="label-text">{{ allData.DirtyData.DirtyData7.label }}</div>
                        <div class="label-desc">{{ $t('scanStrategy.duplicateTableStructure') }}</div>
                      </div>
                      <el-switch v-model="allData.DirtyData.DirtyData7.state" active-color="#009dff"
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
                        <div class="label-text">{{ allData.DirtyData.DirtyData6.label }}</div>
                        <div class="label-desc">{{ $t('scanStrategy.containsBackupEtc') }}</div>
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
                <div class="icon">
                  <svg-icon icon-class="scanStrategy-2" style="font-size: 20px;"></svg-icon>
                </div><span>{{ $t('scanStrategy.sampleExtraction') }}</span>
              </span>
            </template>
            <div class="contBox">
              <span class="sample-label">{{ $t('scanStrategy.sampleCount') }}</span>
              <el-radio-group v-model="allData.SampleExtraction.value" class="sample-radio-group">
                <el-radio label="0" border>0</el-radio>
                <el-radio label="5" border>5</el-radio>
                <el-radio label="10" border>10</el-radio>
                <el-radio label="20" border>20</el-radio>
                <el-radio label="50" border>50</el-radio>
                <el-radio label="100" border>100</el-radio>
                <el-radio label="200" border>200</el-radio>
                <el-radio label="500" border>500</el-radio>
                <el-radio label="1000" border>1000</el-radio>
              </el-radio-group>
            </div>
          </el-card>
          <el-card class="card" shadow="never">
            <template slot="header">
              <span class="title">
                <div class="icon">
                  <i class="el-icon-coin" style="font-size: 20px; color: #2563eb;"></i>
                </div><span>{{ $t('scanStrategy.semanticCache') }}</span>
              </span>
            </template>
            <div class="contBox semantic-cache-box">
              <div class="semantic-cache-label">
                <div class="label-text">{{ $t('scanStrategy.similarityThreshold') }}</div>
                <div class="label-desc">{{ $t('scanStrategy.semanticCacheDesc') }}</div>
              </div>
              <div class="semantic-cache-slider">
                <el-slider v-model="allData.SemanticCache.value" :min="0" :max="100" style="flex: 1;"></el-slider>
                <div class="slider-tip">
                  <el-tag size="small" type="warning" effect="plain" class="min-tag">{{ $t('scanStrategy.minSetting')
                  }}</el-tag>
                  <span class="tip-text">{{ $t('scanStrategy.disallowSaveBelow') }}</span>
                </div>
              </div>
              <div class="semantic-cache-input">
                <el-input-number v-model="allData.SemanticCache.value" :min="0" :max="100" controls-position="right"
                  size="small" style="width: 100px;"></el-input-number>
                <span class="percent-sign">%</span>
              </div>
            </div>
          </el-card>

          <!-- 分类推理 -->
          <!-- <el-card class="card" shadow="never">
      <template slot="header">
        <span class="title">
          <div class="icon">
            <svg-icon icon-class="scanStrategy-5" style="font-size: 20px;"></svg-icon>
          </div><span>{{ $t('scanStrategy.classificationInference') }}</span>
        </span>
      </template>
      <div class="contBox semantic-cache-box" style="justify-content: space-between;">
        <div class="semantic-cache-label">
          <div class="label-text">{{ $t('scanStrategy.classificationInference') }}</div>
          <div class="label-desc">{{ $t('scanStrategy.classificationInferenceDesc') }}</div>
        </div>
        <el-switch v-model="allData.ClassificationInference.state" active-color="#009dff" inactive-color="#e0e0e0">
        </el-switch>
      </div>
    </el-card> -->

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

          <!-- <el-card class="card" shadow="never">
      <template slot="header">
        <span class="title">
          <div class="icon">
            <svg-icon icon-class="scanStrategy-3" style="font-size: 20px;"></svg-icon>
          </div><span>敏感数据定义</span>
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
    </el-card> -->

          <!--
    <el-card class="card" shadow="never">
      <template slot="header">
        <span class="title">
          <div class="icon">
            <svg-icon icon-class="scanStrategy-4" style="font-size: 20px;"></svg-icon>
          </div><span>安全分级管理</span>
        </span>
      </template>
      <el-table :data="allData.SecurityLevelList.sysRiskLevel" style="width: 100%">
        <el-table-column prop="dictValue" label="分级数字" align="center" />
        <el-table-column label="分级名称" align="center">
          <template slot-scope="scope">
            <el-input size="small" v-if="editingIndex === scope.$index" v-model="scope.row.dictLabel" placeholder="请输入"></el-input>
            <span v-else>{{ scope.row.dictLabel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分级定义" align="center">
          <template slot-scope="scope">
            <el-input size="small" v-if="editingIndex === scope.$index" v-model="scope.row.remark" placeholder="请输入" />
            <span v-else>{{ scope.row.remark }}</span>
          </template>
        </el-table-column>
        <el-table-column label="启用状态" width="150" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :disabled="scope.row.dictLabel === '未分级'" active-color="#009dff" inactive-color="#e0e0e0"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.dictLabel === '未分级'">-</span>
            <template v-else>
              <el-button v-if="editingIndex === scope.$index" type="text" size="small" @click="cancelEdit">取消</el-button>
              <el-button v-else type="text" size="small" @click="handleEdit(scope.$index)">编辑</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    -->

          <div class="foot_btn">
            <el-button type="primary" plain @click="submit">{{ $t('confirm') }}</el-button>
          </div>
        </div>

        <div v-show="activeTab === 'matching'" class="enhance-panel matching-panel">
          <matching-strategy v-if="activeTab === 'matching'" class="matching-strategy-page" ref="matchingStrategyRef" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { listByTacticsQueryUrl, updateByTactics } from "@/api/system/dict/data";
import MatchingStrategy from "@/views/strategy/matchingStrategy/index.vue";
export default {
  name: "scanStrategy",
  dicts: ['sys_risk_level'],
  components: { MatchingStrategy },
  data() {
    return {
      value: true,
      value2: true,
      value3: true,
      radio: 20,
      activeTab: "control",
      sys_risk_levelList: ['1', '2', '3', '4', '5'],
      editingIndex: -1,
      allData: {
        DirtyData: {
          DirtyData1: {},
          DirtyData2: {},
          DirtyData3: {},
          DirtyData4: {},
          DirtyData5: {},
          DirtyData6: {},
          DirtyData7: {},
          DirtyData8: {},
        },
        SensitiveData: {},
        SampleExtraction: {},
        DataTableQualityScore: {},
        SemanticCache: {},
        ClassificationInference: {},
        SecurityLevelList: {
          sysRiskLevel: []
        }
        // 噪音数据过滤
      },
      cardLoading: false,
    };
  },
  created() {
    this.getlistData()
  },
  methods: {
    setTab(tab) {
      this.activeTab = tab;
      if (tab === "control") {
        this.getlistData();
      }
    },
    handleEdit(index) {
      this.editingIndex = index;
    },
    cancelEdit() {
      this.editingIndex = -1;
      this.getlistData();
    },
    numInputFn() {
      let value = this.allData.DataTableQualityScore.value.replace(/[^0-9]/g, ''); // 移除非数字字符
      this.allData.DataTableQualityScore.value = value; // 更新输入框的值
    },
    numBlurFn() {
      if (this.allData.DataTableQualityScore.value > 100) {
        this.allData.DataTableQualityScore.value = 100
        this.$message({
          message: this.$t('scanStrategy.inputRangeWarning'),
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
            message: this.$t('scanStrategy.pleaseInputValue'),
            type: 'warning'
          });
          return false;
        }
        // 验证格式：数字(0-100)+必须的百分号
        const regex = /^(100|[1-9]?[0-9])(%)$/;
        if (!regex.test(value)) {
          this.$message({
            message: this.$t('scanStrategy.invalidPercentFormat'),
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
        const nextData = (res && res.data) ? res.data : {}
        const dirtyData = nextData.DirtyData || {}
        if (!dirtyData.DirtyData8) {
          dirtyData.DirtyData8 = { label: '', state: false, value: '' }
        }
        nextData.DirtyData = dirtyData
        this.allData = nextData
        if (res.code == 200) {
          if (nextData.SecurityLevelList && nextData.SecurityLevelList.sysRiskLevel) {
            nextData.SecurityLevelList.sysRiskLevel.forEach(item => {
              item.status = item.status == '0' ? true : false
            })
          }
          this.cardLoading = false
        }
      })
    },
    submit() {
      // 验证语义缓存的阈值
      if (this.allData.SemanticCache && this.allData.SemanticCache.value < 60) {
        this.$message({
          message: this.$t('scanStrategy.semanticCacheMinWarning'),
          type: 'warning'
        });
        return;
      }

      // 验证DirtyData3输入格式
      if (!this.dirtyDataValueValidate()) {
        return;
      }
      this.editingIndex = -1
      const submitData = {
        ...this.allData,
        SecurityLevelList: {
          sysRiskLevel: (this.allData.SecurityLevelList.sysRiskLevel || []).map(item => ({
            ...item,
            status: item.status ? '0' : '1'
          }))
        }
      }
      updateByTactics(submitData).then(res => {
        if (res.code == 200) {
          this.$message({
            message: this.$t('scanStrategy.updateSuccess'),
            type: 'success'
          });
          this.getlistData()
        }
      }).catch(err => {
        this.getlistData()
      })
    }
  }
};
</script>
<style scoped lang="scss">
.app-container {
  height: calc(100vh - 124px);
  min-height: 600px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.enhance-card {
  border-radius: 12px;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  ::v-deep .el-card__header {
    padding: 24px 24px 0;
    border-bottom: 0;
  }

  ::v-deep .el-card__body {
    padding: 16px 24px 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}

.enhance-header {
  padding: 0 0 14px;
  border-bottom: 1px solid #e2e8f0;
}

.enhance-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.enhance-panel {
  height: 100%;
  min-height: 0;
  overflow: auto;
}

.matching-panel {
  display: flex;
  overflow: hidden;
}

.matching-strategy-page {
  flex: 1;
  height: 100%;
  min-height: 0;
}

.enhance-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.enhance-text {
  font-size: 20px;
  font-weight: 600;
}


.enhance-desc {
  margin-top: 8px;
  font-size: 13px;
  color: #94a3b8;
}

.enhance-tabbar {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.enhance-tab {
  height: 36px;
  line-height: 36px;
  padding: 0 18px;
  border-radius: 6px;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.enhance-tab.active {
  background: #e6f2ff;
  color: #2563eb;
}

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

.icon {
  padding: 5px;
  background-color: #eff6ff;
  border-radius: 10px;
  margin-right: 10px;
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

.semantic-cache-box {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 10px 0;
}

.semantic-cache-label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 250px;
}

.semantic-cache-slider {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.slider-tip {
  display: flex;
  align-items: center;
  gap: 10px;
}

.min-tag {
  background-color: #fff7e6;
  border-color: #ffd591;
  color: #fa8c16;
}

.tip-text {
  font-size: 12px;
  color: #999;
}

.semantic-cache-input {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  /* 匹配滑块高度使之居中对齐 */
  margin-bottom: 30px;
  /* 抵消底部 tip 带来的高度差，保持与滑块本身对齐 */
}

.percent-sign {
  color: #666;
  font-size: 14px;
}

.foot_btn {
  display: flex;
  justify-content: flex-end;
}

.el-row {
  margin-top: 0;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
