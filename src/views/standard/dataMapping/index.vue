<template>
  <div class="app-container" v-loading="Loading">
    <el-form slot="body" ref="dataBaselineForm" :model="dataBaselineForm" label-width="120px" label-position="top">
      <!-- 数据来源 -->
      <Title title="数据来源" iconClass="databaseSolid"></Title>
      <el-form-item label="">
        <span class="label-text">请选择数据的产生方式/获取方式（可多选）</span>
        <el-checkbox-group v-model="dataBaselineForm.dataSources" class="checkbox-two-per-line"
          @change="handleDataSourceChange">
          <el-checkbox label="1" class="checkbox-item">系统采集</el-checkbox>
          <el-checkbox label="2" class="checkbox-item">系统生产</el-checkbox>
          <el-checkbox label="3" class="checkbox-item">人工填报</el-checkbox>
          <el-checkbox label="4" class="checkbox-item">交换购买</el-checkbox>
          <el-checkbox label="5" class="checkbox-item">共享交换</el-checkbox>
          <el-checkbox label="6" class="checkbox-item">其他</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="其他数据来源" v-if="dataBaselineForm.dataSources.includes('6')">
        <el-input v-model="dataBaselineForm.otherDataSource" placeholder="请输入其他数据来源"></el-input>
      </el-form-item>

      <!-- 单位间数据流转情况 -->
      <Title title="单位间数据流转情况" iconClass="circulation"></Title>
      <!-- 数据来源单位 -->
      <el-form-item label="数据来源单位" :error="sourceUnitError" :prop="'dataFlowUnits.' + activeSourceIndex + '.unit'">
        <div v-for="(item, index) in dataBaselineForm.dataFlowUnits" :key="item.id" class="flow-unit-item">
          <el-input v-model="item.unit" placeholder="请输入来源单位"
            @blur="checkDuplicateUnit('dataFlowUnits', index)"></el-input>
          <el-button @click="handleRemoveFlowUnit(index)" type="text" icon="el-icon-remove-outline"
            :disabled="dataBaselineForm.dataFlowUnits.length <= 1" style="color: #dcdfe6; font-size: 18px;"></el-button>
        </div>
        <el-button @click="handleAddFlowUnit" type="text" icon="el-icon-plus">添加来源单位</el-button>
      </el-form-item>

      <!-- 数据流出单位 -->
      <el-form-item label="数据流出单位" :error="outUnitError" :prop="'dataFlowOutUnits.' + activeOutIndex + '.unit'">
        <div v-for="(item, index) in dataBaselineForm.dataFlowOutUnits" :key="item.id" class="flow-unit-item">
          <el-input v-model="item.unit" placeholder="请输入流出单位"
            @blur="checkDuplicateUnit('dataFlowOutUnits', index)"></el-input>
          <el-button @click="handleRemoveFlowOutUnit(index)" type="text" icon="el-icon-remove-outline"
            :disabled="dataBaselineForm.dataFlowOutUnits.length <= 1"
            style="color: #dcdfe6; font-size: 18px;"></el-button>
        </div>
        <el-button @click="handleAddFlowOutUnit" type="text" icon="el-icon-plus">添加流出单位</el-button>
      </el-form-item>

      <!-- 其他内容保持不变 -->
      <!-- 与其他数据处理者的交互 -->
      <Title title="与其他数据处理者的交互" iconClass="peoplesBlue"></Title>
      <span class="label-text">请选择与其他数据的交互类型（可多选）</span>
      <el-form-item label="" style="color: red;">
        <div class="interaction-checkbox">
          <template v-for="(item, key) in interactionOptions">
            <el-checkbox :key="`interaction-checkbox-${key}`" v-model="dataBaselineForm.interaction[key]"
              :disabled="dataBaselineForm.interaction.noInteraction">
              {{ item.label }}
            </el-checkbox>
            <el-input :key="`interaction-input-${key}`" v-model="dataBaselineForm.interaction[item.inputKey]"
              :placeholder="item.placeholder" v-if="dataBaselineForm.interaction[key]"></el-input>
          </template>
          <el-checkbox v-model="dataBaselineForm.interaction.noInteraction"
            @change="handleNoInteractionChange">无交互</el-checkbox>
        </div>
      </el-form-item>

      <!-- 数据存储位置-云类型 -->
      <Title title="数据存储位置" iconClass="storage"></Title>
      <span class="label-text">云类型（可多选）</span>
      <el-form-item label="">
        <div class="interaction-checkbox">
          <template v-for="(item, key) in cloudOptions">
            <el-checkbox :key="`cloud-checkbox-${key}`" v-model="dataBaselineForm.storage.cloud[key]"
              :disabled="dataBaselineForm.storage.cloud.noCloud">
              {{ item.label }}
            </el-checkbox>
            <el-input :key="`cloud-input-${key}`" v-model="dataBaselineForm.storage.cloud[item.inputKey]"
              :placeholder="item.placeholder" v-if="dataBaselineForm.storage.cloud[key]"></el-input>
          </template>
          <el-checkbox v-model="dataBaselineForm.storage.cloud.noCloud"
            @change="handleNoCloudChange">非云计算平台</el-checkbox>
        </div>
      </el-form-item>

      <!-- 数据存储位置-机房类型 -->
      <span class="label-text">机房类型（可多选）</span>
      <el-form-item label="">
        <div class="interaction-checkbox">
          <template v-for="(item, key) in roomOptions">
            <el-checkbox :key="`room-checkbox-${key}`" v-model="dataBaselineForm.storage.room[key]">
              {{ item.label }}
            </el-checkbox>
            <el-input :key="`room-input-${key}`" v-model="dataBaselineForm.storage.room[item.inputKey]"
              :placeholder="item.placeholder" v-if="dataBaselineForm.storage.room[key]"></el-input>
          </template>
        </div>
      </el-form-item>

      <!-- 数据存储位置-存储地域 -->
      <span class="label-text">存储地域（可多选）</span>
      <el-form-item label="">
        <div class="interaction-checkbox">
          <template v-for="(item, key) in regionOptions">
            <el-checkbox :key="`region-checkbox-${key}`" v-model="dataBaselineForm.storage.region[key]">
              {{ item.label }}
            </el-checkbox>
            <el-input :key="`region-input-${key}`" v-model="dataBaselineForm.storage.region[item.inputKey]"
              :placeholder="item.placeholder" v-if="dataBaselineForm.storage.region[key]"></el-input>
          </template>
        </div>
      </el-form-item>
    </el-form>

    <div slot="footer" style="text-align: right;">
      <el-button @click="handleReset">返回</el-button>
      <el-button type="primary" plain @click="handleSubmit">确认</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dataMapping',
  props: {
  },
  data() {
    return {
      Loading: false,
      sourceUnitError: '',
      outUnitError: '',
      activeSourceIndex: 0,
      activeOutIndex: 0,
      dataBaselineForm: {
        dataSources: [], // 数据来源
        otherDataSource: '',
        // 修改数据结构，增加唯一标识id
        dataFlowUnits: [{ id: this.generateId(), unit: '' }], // 单位间数据流转-来源单位
        dataFlowOutUnits: [{ id: this.generateId(), unit: '' }], // 单位间数据流转-流出单位
        interaction: {
          noInteraction: false,
          provide: false,
          entrust: false,
          processTogether: false,
          provideInput: '',
          entrustInput: '',
          processTogetherInput: ''
        },
        storage: {
          cloud: {
            noCloud: false,
            privateCloud: false,
            publicCloud: false,
            hybridCloud: false,
            otherCloud: false,
            privateCloudInput: '',
            publicCloudInput: '',
            hybridCloudInput: '',
            otherCloudInput: '',
          },
          room: {
            ownRoom: false,
            foreignRoom: false,
            thirdPartyRoom: false,
            ownRoomInput: '',
            foreignRoomInput: '',
            thirdPartyRoomInput: ''
          },
          region: {
            domestic: false,
            overseas: false,
            domesticDetail: '',
            overseasDetail: ''
          },
        }
      },
      // 交互选项配置
      interactionOptions: {
        provide: {
          label: '对外提供',
          inputKey: 'provideInput',
          placeholder: '对外提供内容'
        },
        entrust: {
          label: '委托',
          inputKey: 'entrustInput',
          placeholder: '委托内容'
        },
        processTogether: {
          label: '与...共同处理',
          inputKey: 'processTogetherInput',
          placeholder: '共同处理内容'
        }
      },
      // 云类型选项配置
      cloudOptions: {
        privateCloud: {
          label: '私有云',
          inputKey: 'privateCloudInput',
          placeholder: '私有云内容'
        },
        publicCloud: {
          label: '公有云',
          inputKey: 'publicCloudInput',
          placeholder: '公有云内容'
        },
        hybridCloud: {
          label: '混合云',
          inputKey: 'hybridCloudInput',
          placeholder: '混合云内容'
        },
        otherCloud: {
          label: '政务云',
          inputKey: 'otherCloudInput',
          placeholder: '政务云内容'
        }
      },
      // 机房类型选项配置
      roomOptions: {
        ownRoom: {
          label: '本单位机房',
          inputKey: 'ownRoomInput',
          placeholder: '本单位机房内容'
        },
        foreignRoom: {
          label: '外单位机房',
          inputKey: 'foreignRoomInput',
          placeholder: '外单位机房内容'
        },
        thirdPartyRoom: {
          label: '第三方托管机房',
          inputKey: 'thirdPartyRoomInput',
          placeholder: '第三方托管机房内容'
        }
      },
      // 存储地域选项配置
      regionOptions: {
        domestic: {
          label: '境内',
          inputKey: 'domesticDetail',
          placeholder: '境内内容'
        },
        overseas: {
          label: '境外',
          inputKey: 'overseasDetail',
          placeholder: '境外内容'
        }
      }
    }
  },
  watch: {
    // 监听交互选项变化，自动清除输入内容
    'dataBaselineForm.interaction': {
      deep: true,
      handler(val) {
        Object.keys(this.interactionOptions).forEach(key => {
          if (!val[key]) {
            val[this.interactionOptions[key].inputKey] = ''
          }
        })
      }
    },
    // 监听云类型选项变化，自动清除输入内容
    'dataBaselineForm.storage.cloud': {
      deep: true,
      handler(val) {
        Object.keys(this.cloudOptions).forEach(key => {
          if (!val[key]) {
            val[this.cloudOptions[key].inputKey] = ''
          }
        })
      }
    },
    // 监听机房类型选项变化，自动清除输入内容
    'dataBaselineForm.storage.room': {
      deep: true,
      handler(val) {
        Object.keys(this.roomOptions).forEach(key => {
          if (!val[key]) {
            val[this.roomOptions[key].inputKey] = ''
          }
        })
      }
    },
    // 监听存储地域选项变化，自动清除输入内容
    'dataBaselineForm.storage.region': {
      deep: true,
      handler(val) {
        Object.keys(this.regionOptions).forEach(key => {
          if (!val[key]) {
            val[this.regionOptions[key].inputKey] = ''
          }
        })
      }
    }
  },
  methods: {
    // 生成唯一ID
    generateId() {
      return Date.now() + Math.floor(Math.random() * 1000);
    },

    // 检查重复单位
    checkDuplicateUnit(type, index) {
      const units = this.dataBaselineForm[type];
      const currentUnit = units[index].unit.trim();
      const errorKey = type === 'dataFlowUnits' ? 'sourceUnitError' : 'outUnitError';
      const activeIndexKey = type === 'dataFlowUnits' ? 'activeSourceIndex' : 'activeOutIndex';

      this[activeIndexKey] = index;

      if (!currentUnit) {
        this[errorKey] = '单位名称不能为空';
        return false;
      }

      // 检查重复
      const hasDuplicate = units.some((item, i) => {
        return i !== index && item.unit.trim() === currentUnit;
      });

      if (hasDuplicate) {
        this[errorKey] = '存在重复的单位名称';
        return false;
      }

      this[errorKey] = '';
      return true;
    },

    // 处理无交互复选框变化
    handleNoInteractionChange(val) {
      if (val) {
        Object.keys(this.interactionOptions).forEach(key => {
          this.dataBaselineForm.interaction[key] = false;
          this.dataBaselineForm.interaction[this.interactionOptions[key].inputKey] = '';
        });
      }
    },

    // 处理无云复选框变化
    handleNoCloudChange(val) {
      if (val) {
        Object.keys(this.cloudOptions).forEach(key => {
          this.dataBaselineForm.storage.cloud[key] = false;
          this.dataBaselineForm.storage.cloud[this.cloudOptions[key].inputKey] = '';
        });
      }
    },

    // 添加来源单位
    handleAddFlowUnit() {
      // 检查最后一个单位是否填写
      const lastUnit = this.dataBaselineForm.dataFlowUnits[this.dataBaselineForm.dataFlowUnits.length - 1];
      if (!this.checkDuplicateUnit('dataFlowUnits', this.dataBaselineForm.dataFlowUnits.length - 1)) {
        this.$message.warning('请完善当前单位信息后再添加');
        return;
      }

      this.dataBaselineForm.dataFlowUnits.push({
        id: this.generateId(),
        unit: ''
      });
    },

    // 删除来源单位
    handleRemoveFlowUnit(index) {
      this.dataBaselineForm.dataFlowUnits.splice(index, 1);
      // 重新检查是否有重复
      this.dataBaselineForm.dataFlowUnits.forEach((_, i) => {
        this.checkDuplicateUnit('dataFlowUnits', i);
      });
    },

    // 添加流出单位
    handleAddFlowOutUnit() {
      // 检查最后一个单位是否填写
      const lastUnit = this.dataBaselineForm.dataFlowOutUnits[this.dataBaselineForm.dataFlowOutUnits.length - 1];
      if (!this.checkDuplicateUnit('dataFlowOutUnits', this.dataBaselineForm.dataFlowOutUnits.length - 1)) {
        this.$message.warning('请完善当前单位信息后再添加');
        return;
      }

      this.dataBaselineForm.dataFlowOutUnits.push({
        id: this.generateId(),
        unit: ''
      });
    },

    // 删除流出单位
    handleRemoveFlowOutUnit(index) {
      this.dataBaselineForm.dataFlowOutUnits.splice(index, 1);
      // 重新检查是否有重复
      this.dataBaselineForm.dataFlowOutUnits.forEach((_, i) => {
        this.checkDuplicateUnit('dataFlowOutUnits', i);
      });
    },

    // 提交表单
    handleSubmit() {
      // 先验证单位信息
      let isUnitValid = true;

      this.dataBaselineForm.dataFlowUnits.forEach((_, i) => {
        if (!this.checkDuplicateUnit('dataFlowUnits', i)) {
          isUnitValid = false;
        }
      });

      this.dataBaselineForm.dataFlowOutUnits.forEach((_, i) => {
        if (!this.checkDuplicateUnit('dataFlowOutUnits', i)) {
          isUnitValid = false;
        }
      });

      if (!isUnitValid) {
        return;
      }

      this.$refs.dataBaselineForm.validate((valid) => {
        if (valid) {
          console.log('表单提交', this.dataBaselineForm);
          // 这里可以添加提交到后端的逻辑
        } else {
          console.log('表单验证失败');
          return false;
        }
      });
    },

    // 重置表单
    handleReset() {
      this.$refs.dataBaselineForm.resetFields();
      // 重置自定义的数组等数据
      this.dataBaselineForm.dataFlowUnits = [{ id: this.generateId(), unit: '' }];
      this.dataBaselineForm.dataFlowOutUnits = [{ id: this.generateId(), unit: '' }];
      this.sourceUnitError = '';
      this.outUnitError = '';
      this.$router.back();
    },

    // 数据来源变化处理
    handleDataSourceChange(val) {
      console.log('val', val);
      console.log('this.dataBaselineForm.dataSources', this.dataBaselineForm.dataSources);
    },
  },
}
</script>

<style scoped>
.checkbox-two-per-line {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.flow-unit-item {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;

  &>.el-button {
    margin-left: 20px;
  }
}

.interaction-checkbox {
  display: flex;
  flex-direction: column;

  &>.el-input--medium {
    margin-left: 20px;
  }
}

.label-text {
  color: #8f97a1;
  font-size: 12px;
}
</style>