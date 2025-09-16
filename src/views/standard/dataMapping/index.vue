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
      <el-form-item label="数据来源单位">
        <div v-for="(item, index) in dataBaselineForm.dataFlowUnits" :key="index" class="flow-unit-item">
          <el-input v-model="item.unit" placeholder="请输入来源单位"></el-input>
          <el-button @click="index > 0 && handleRemoveFlowUnit(index)" type="text" icon="el-icon-remove-outline"
            style="color: #dcdfe6; font-size: 18px;"></el-button>
        </div>
        <el-button @click="handleAddFlowUnit" type="text" icon="el-icon-plus">添加来源单位</el-button>
      </el-form-item>

      <!-- 数据流出单位 -->
      <el-form-item label="数据流出单位">
        <div v-for="(item, index) in dataBaselineForm.dataFlowOutUnits" :key="index" class="flow-unit-item">
          <el-input v-model="item.unit" placeholder="请输入流出单位"></el-input>
          <el-button @click="index > 0 && handleRemoveFlowOutUnit(index)" type="text" icon="el-icon-remove-outline"
            style="color: #dcdfe6; font-size: 18px;"></el-button>
        </div>
        <el-button @click="handleAddFlowOutUnit" type="text" icon="el-icon-plus">添加流出单位</el-button>
      </el-form-item>

      <!-- 与其他数据处理者的交互 -->
      <Title title="与其他数据处理者的交互" iconClass="peoplesBlue"></Title>
      <span class="label-text">请选择与其他数据的交互类型（可多选）</span>
      <el-form-item label="" style="color: red;">
        <div class="interaction-checkbox">
          <el-checkbox v-model="dataBaselineForm.interaction.provide"
            :disabled="dataBaselineForm.interaction.noInteraction">对外提供</el-checkbox>
          <el-input v-model="dataBaselineForm.interaction.provideInput" placeholder="对外提供内容"
            v-if="dataBaselineForm.interaction.provide"></el-input>
          <el-checkbox v-model="dataBaselineForm.interaction.entrust"
            :disabled="dataBaselineForm.interaction.noInteraction">委托</el-checkbox>
          <el-input v-model="dataBaselineForm.interaction.entrustInput" placeholder="委托内容"
            v-if="dataBaselineForm.interaction.entrust"></el-input>
          <el-checkbox v-model="dataBaselineForm.interaction.processTogether"
            :disabled="dataBaselineForm.interaction.noInteraction">与...共同处理</el-checkbox>
          <el-input v-model="dataBaselineForm.interaction.processTogetherInput" placeholder="共同处理内容"
            v-if="dataBaselineForm.interaction.processTogether"></el-input>
          <el-checkbox v-model="dataBaselineForm.interaction.noInteraction"
            @change="handleNoInteractionChange">无交互</el-checkbox>
        </div>
      </el-form-item>

      <!-- 数据存储位置-云类型 -->
      <Title title="数据存储位置" iconClass="storage"></Title>
      <span class="label-text">云类型（可多选）</span>
      <el-form-item label="">
        <div class="interaction-checkbox">
          <el-checkbox v-model="dataBaselineForm.storage.cloud.privateCloud"
            :disabled="dataBaselineForm.storage.cloud.noCloud">私有云</el-checkbox>
          <el-input v-model="dataBaselineForm.storage.cloud.privateCloudInput" placeholder="私有云内容"
            v-if="dataBaselineForm.storage.cloud.privateCloud"></el-input>
          <el-checkbox v-model="dataBaselineForm.storage.cloud.publicCloud"
            :disabled="dataBaselineForm.storage.cloud.noCloud">公有云</el-checkbox>
          <el-input v-model="dataBaselineForm.storage.cloud.publicCloudInput" placeholder="公有云内容"
            v-if="dataBaselineForm.storage.cloud.publicCloud"></el-input>
          <el-checkbox v-model="dataBaselineForm.storage.cloud.hybridCloud"
            :disabled="dataBaselineForm.storage.cloud.noCloud">混合云</el-checkbox>
          <el-input v-model="dataBaselineForm.storage.cloud.hybridCloudInput" placeholder="混合云内容"
            v-if="dataBaselineForm.storage.cloud.hybridCloud"></el-input>
          <el-checkbox v-model="dataBaselineForm.storage.cloud.otherCloud"
            :disabled="dataBaselineForm.storage.cloud.noCloud">政务云</el-checkbox>
          <el-input v-model="dataBaselineForm.storage.cloud.otherCloudInput" placeholder="政务云内容"
            v-if="dataBaselineForm.storage.cloud.otherCloud"></el-input>
          <el-checkbox v-model="dataBaselineForm.storage.cloud.noCloud"
            @change="handleNoCloudChange">非云计算平台</el-checkbox>
        </div>
      </el-form-item>

      <!-- 数据存储位置-机房类型 -->
      <span class="label-text">机房类型（可多选）</span>
      <el-form-item label="">
        <div class="interaction-checkbox">
          <el-checkbox v-model="dataBaselineForm.storage.room.ownRoom"
            :disabled="dataBaselineForm.storage.room.noRoom">本单位机房</el-checkbox>
          <el-input v-model="dataBaselineForm.storage.room.ownRoomInput" placeholder="本单位机房内容"
            v-if="dataBaselineForm.storage.room.ownRoom"></el-input>
          <el-checkbox v-model="dataBaselineForm.storage.room.foreignRoom"
            :disabled="dataBaselineForm.storage.room.noRoom">外单位机房</el-checkbox>
          <el-input v-model="dataBaselineForm.storage.room.foreignRoomInput" placeholder="外单位机房内容"
            v-if="dataBaselineForm.storage.room.foreignRoom"></el-input>
          <el-checkbox v-model="dataBaselineForm.storage.room.thirdPartyRoom"
            :disabled="dataBaselineForm.storage.room.noRoom">第三方托管机房</el-checkbox>
          <el-input v-model="dataBaselineForm.storage.room.thirdPartyRoomInput" placeholder="第三方托管机房内容"
            v-if="dataBaselineForm.storage.room.thirdPartyRoom"></el-input>
          <!-- <el-checkbox v-model="dataBaselineForm.storage.room.noRoom" @change="handleNoRoomChange">无</el-checkbox> -->
        </div>
      </el-form-item>

      <!-- 数据存储位置-存储地域 -->
      <span class="label-text">存储地域（可多选）</span>
      <el-form-item label="">
        <div class="interaction-checkbox">
          <el-checkbox v-model="dataBaselineForm.storage.region.domestic" label="境内">境内</el-checkbox>
          <el-input v-model="dataBaselineForm.storage.region.domesticDetail" placeholder="境内内容"
            v-if="dataBaselineForm.storage.region.domestic"></el-input>
          <el-checkbox v-model="dataBaselineForm.storage.region.overseas" label="境外">境外</el-checkbox>
          <el-input v-model="dataBaselineForm.storage.region.overseasDetail" placeholder="境外内容"
            v-if="dataBaselineForm.storage.region.overseas"></el-input>
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
      dataBaselineForm: {
        dataSources: [], // 数据来源
        otherDataSource: '',
        dataFlowUnits: [{ unit: '' }], // 单位间数据流转-来源单位
        dataFlowOutUnits: [{ unit: '' }], // 单位间数据流转-流出单位
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
            noRoom: false,
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
    }
  },
  methods: {
    // 处理无交互复选框变化
    handleNoInteractionChange(val) {
      if (val) {
        this.dataBaselineForm.interaction.provide = false;
        this.dataBaselineForm.interaction.entrust = false;
        this.dataBaselineForm.interaction.processTogether = false;
        this.dataBaselineForm.interaction.provideInput = ''
        this.dataBaselineForm.interaction.entrustInput = ''
        this.dataBaselineForm.interaction.processTogetherInput = ''
      }
    },
    // 处理无云复选框变化
    handleNoCloudChange(val) {
      if (val) {
        this.dataBaselineForm.storage.cloud.privateCloud = false;
        this.dataBaselineForm.storage.cloud.publicCloud = false;
        this.dataBaselineForm.storage.cloud.hybridCloud = false;
        this.dataBaselineForm.storage.cloud.otherCloud = false;
        this.dataBaselineForm.storage.cloud.otherCloudInput = ''
        this.dataBaselineForm.storage.cloud.privateCloudInput = ''
        this.dataBaselineForm.storage.cloud.publicCloudInput = ''
        this.dataBaselineForm.storage.cloud.hybridCloudInput = ''
      }
    },
    // 处理无机房复选框变化
    // handleNoRoomChange(val) {
    //   if (val) {
    //     this.dataBaselineForm.storage.room.ownRoom = false;
    //     this.dataBaselineForm.storage.room.foreignRoom = false;
    //     this.dataBaselineForm.storage.room.thirdPartyRoom = false;
    //   }
    // },
    // 添加来源单位
    handleAddFlowUnit() {
      this.dataBaselineForm.dataFlowUnits.push({ unit: '' });
    },
    // 删除来源单位llll
    handleRemoveFlowUnit(index) {
      if (index > 0) {
        this.dataBaselineForm.dataFlowUnits.splice(index, 1);
      }
    },
    // 添加流出单位
    handleAddFlowOutUnit() {
      this.dataBaselineForm.dataFlowOutUnits.push({ unit: '' });
    },
    // 删除流出单位
    handleRemoveFlowOutUnit(index) {
      if (index > 0) {
        this.dataBaselineForm.dataFlowOutUnits.splice(index, 1);
      }
    },
    // 提交表单
    handleSubmit() {
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
      this.dataBaselineForm.dataFlowUnits = [{ unit: '' }];
      this.dataBaselineForm.dataFlowOutUnits = [{ unit: '' }];
      this.$router.back()
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