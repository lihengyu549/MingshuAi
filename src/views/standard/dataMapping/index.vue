<template>
  <div class="app-container" v-loading="Loading">
    <el-form slot="body" ref="dataBaselineForm" :model="dataBaselineForm" label-width="120px" label-position="top">
      <!-- 数据来源 -->
      <Title title="数据来源" iconClass="databaseSolid"></Title>
      <el-form-item label="">
        <span class="label-text">请选择数据的产生方式/获取方式（可多选）</span>
        <div class="checkbox-two-per-line">
          <el-checkbox v-model="dataBaselineForm.systemGather">系统采集</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.systemProduction">系统生产</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.artificialFillIn">人工填报</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.dealBuy">交换购买</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.shareExchange">共享交换</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.other">其他</el-checkbox>
        </div>
      </el-form-item>
      <el-form-item label="其他数据来源" v-if="dataBaselineForm.other">
        <el-input v-model="dataBaselineForm.otherInput" placeholder="请输入其他数据来源" maxlength="30"></el-input>
      </el-form-item>

      <!-- 单位间数据流转情况 -->
      <Title title="单位间数据流转情况" iconClass="circulation"></Title>
      <!-- 数据来源单位 -->
      <el-form-item label="数据来源单位">
        <div v-for="(item, index) in dataBaselineForm.dataSources" :key="index" class="flow-unit-item">
          <el-input v-model="item.content" placeholder="请输入来源单位" maxlength="30"></el-input>
          <el-button @click="handleRemoveFlowUnit(index)" type="text" icon="el-icon-remove-outline"
            :disabled="dataBaselineForm.dataSources.length <= 1" style="color: #dcdfe6; font-size: 18px;"></el-button>
        </div>
        <el-button @click="handleAddFlowUnit" type="text" icon="el-icon-plus">添加来源单位</el-button>
      </el-form-item>

      <!-- 数据流出单位 -->
      <el-form-item label="数据流出单位">
        <div v-for="(item, index) in dataBaselineForm.dataflow" :key="index" class="flow-unit-item">
          <el-input v-model="item.content" placeholder="请输入流出单位" maxlength="30"></el-input>
          <el-button @click="handleRemoveFlowOutUnit(index)" type="text" icon="el-icon-remove-outline"
            :disabled="dataBaselineForm.dataflow.length <= 1" style="color: #dcdfe6; font-size: 18px;"></el-button>
        </div>
        <el-button @click="handleAddFlowOutUnit" type="text" icon="el-icon-plus">添加流出单位</el-button>
      </el-form-item>

      <!-- 与其他数据处理者的交互 -->
      <Title title="与其他数据处理者的交互" iconClass="peoplesBlue"></Title>
      <span class="label-text">请选择与其他数据的交互类型（可多选）</span>
      <el-form-item label="">
        <div class="interaction-checkbox">
          <el-checkbox v-model="dataBaselineForm.externalProvisionBox"
            :disabled="dataBaselineForm.noInteraction">对外提供给</el-checkbox>
          <el-input v-model="dataBaselineForm.externalProvision" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.externalProvisionBox"></el-input>
          <el-checkbox v-model="dataBaselineForm.entrustBox" :disabled="dataBaselineForm.noInteraction">委托</el-checkbox>
          <el-input v-model="dataBaselineForm.entrust" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.entrustBox"></el-input>
          <el-checkbox v-model="dataBaselineForm.jointDisposalBox"
            :disabled="dataBaselineForm.noInteraction">与....共同处理</el-checkbox>
          <el-input v-model="dataBaselineForm.jointDisposal" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.jointDisposalBox"></el-input>
          <el-checkbox v-model="dataBaselineForm.noInteraction" @change="handleNoInteractionChange">无交互</el-checkbox>
        </div>
      </el-form-item>

      <!-- 数据存储位置-云类型 -->
      <Title title="数据存储位置" iconClass="storage"></Title>
      <span class="label-text">云类型（可多选）</span>
      <el-form-item label="">
        <div class="interaction-checkbox">
          <el-checkbox v-model="dataBaselineForm.privateCloudBox">私有云</el-checkbox>
          <el-input v-model="dataBaselineForm.privateCloud" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.privateCloudBox"></el-input>
          <el-checkbox v-model="dataBaselineForm.publicCloudBox">公有云</el-checkbox>
          <el-input v-model="dataBaselineForm.publicCloud" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.publicCloudBox"></el-input>
          <el-checkbox v-model="dataBaselineForm.mixtureCloudBox">混合云</el-checkbox>
          <el-input v-model="dataBaselineForm.mixtureCloud" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.mixtureCloudBox"></el-input>
          <el-checkbox v-model="dataBaselineForm.governmentCloudBox">政务云</el-checkbox>
          <el-input v-model="dataBaselineForm.governmentCloud" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.governmentCloudBox"></el-input>
          <el-checkbox v-model="dataBaselineForm.noCloudComputingPlatformBox">非云计算平台</el-checkbox>
          <el-input v-model="dataBaselineForm.noCloudComputingPlatform" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.noCloudComputingPlatformBox"></el-input>
        </div>
      </el-form-item>

      <!-- 数据存储位置-机房类型 -->
      <span class="label-text">机房类型（可多选）</span>
      <el-form-item label="">
        <div class="interaction-checkbox">
          <el-checkbox v-model="dataBaselineForm.thisUnitMachineRoomBox">本单位机器机房</el-checkbox>
          <el-input v-model="dataBaselineForm.thisUnitMachineRoom" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.thisUnitMachineRoomBox"></el-input>
          <el-checkbox v-model="dataBaselineForm.outerUnitMachineRoomBox">外部单位机器机房</el-checkbox>
          <el-input v-model="dataBaselineForm.outerUnitMachineRoom" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.outerUnitMachineRoomBox"></el-input>
          <el-checkbox v-model="dataBaselineForm.thirdPartyTrusteeshipMachineRoomBox">第三方托管机房</el-checkbox>
          <el-input v-model="dataBaselineForm.thirdPartyTrusteeshipMachineRoom" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.thirdPartyTrusteeshipMachineRoomBox"></el-input>
        </div>
      </el-form-item>

      <!-- 数据存储位置-存储地域 -->
      <span class="label-text">存储地域（可多选）</span>
      <el-form-item label="">
        <div class="interaction-checkbox">
          <el-checkbox v-model="dataBaselineForm.domesticBox">境内</el-checkbox>
          <el-input v-model="dataBaselineForm.domestic" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.domesticBox"></el-input>
          <el-checkbox v-model="dataBaselineForm.overseasBox">境外</el-checkbox>
          <el-input v-model="dataBaselineForm.overseas" placeholder="请输入具体对象" maxlength="30"
            v-if="dataBaselineForm.overseasBox"></el-input>
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
import { getCategoryAttachDataFeelBottomByCategoryId, addOrUpdateDataFeelBottomByCategoryId } from "@/api/system/protectCategory";
export default {
  name: 'dataMapping',
  props: {
  },
  data() {
    return {
      Loading: false,
      query: {},
      dataBaselineForm: {
        id: '',
        systemGather: false, // 系统采集
        systemProduction: false, // 系统生产
        artificialFillIn: false, // 人工填报
        dealBuy: false, // 交换购买
        shareExchange: false, // 共享交换
        other: false, // 其他
        otherInput: '', // 其他数据来源
        externalProvisionBox: false, // 与其他数据处理者的交互-对外提供给
        externalProvision: '', // 与其他数据处理者的交互-对外提供给-具体对象
        entrustBox: false, // 与其他数据处理者的交互-委托
        entrust: '', // 与其他数据处理者的交互-委托-具体对象
        jointDisposalBox: false, // 与其他数据处理者的交互-与...共同处理
        jointDisposal: '', // 与其他数据处理者的交互-与...共同处理-具体对象
        noInteraction: false, // 与其他数据处理者的交互-无交互
        privateCloudBox: false, // 数据存储位置-云类型-私有云
        privateCloud: '', // 数据存储位置-云类型-私有云-具体对象
        publicCloudBox: false, // 数据存储位置-云类型-公有云
        publicCloud: '', // 数据存储位置-云类型-公有云-具体对象
        mixtureCloudBox: false, // 数据存储位置-云类型-混合云
        mixtureCloud: '', // 数据存储位置-云类型-混合云-具体对象
        governmentCloudBox: false, // 数据存储位置-云类型-政务云
        governmentCloud: '', // 数据存储位置-云类型-政务云-具体对象
        noCloudComputingPlatformBox: false, // 数据存储位置-云类型-非云计算平台
        noCloudComputingPlatform: '', // 数据存储位置-云类型-非云计算平台-具体对象
        thisUnitMachineRoomBox: false, // 数据存储位置-机房类型-本单位机器机房
        thisUnitMachineRoom: '', // 数据存储位置-机房类型-本单位机器机房-具体对象
        outerUnitMachineRoomBox: false, // 数据存储位置-机房类型-外部单位机器机房
        outerUnitMachineRoom: '', // 数据存储位置-机房类型-外部单位机器机房-具体对象
        thirdPartyTrusteeshipMachineRoomBox: false, // 数据存储位置-机房类型-第三方托管机房
        thirdPartyTrusteeshipMachineRoom: '', // 数据存储位置-机房类型-第三方托管机房-具体对象
        domesticBox: false, // 数据存储位置-存储地域-境内
        domestic: '', // 数据存储位置-存储地域-境内-具体对象
        overseasBox: false, // 数据存储位置-存储地域-境外
        overseas: '', // 数据存储位置-存储地域-境外-具体对象
        dataSources: [{ content: '' }], // 数据来源单位，移除id字段
        dataflow: [{ content: '' }], // 数据流出单位，移除id字段
      },
    }
  },
  watch: {
    // 监听与其他数据处理者的交互选项变化，自动清除输入内容
    'dataBaselineForm.externalProvisionBox'(val) {
      if (!val) {
        this.dataBaselineForm.externalProvision = '';
      }
    },
    'dataBaselineForm.entrustBox'(val) {
      if (!val) {
        this.dataBaselineForm.entrust = '';
      }
    },
    'dataBaselineForm.jointDisposalBox'(val) {
      if (!val) {
        this.dataBaselineForm.jointDisposal = '';
      }
    },

    // 监听云类型选项变化，自动清除输入内容
    'dataBaselineForm.privateCloudBox'(val) {
      if (!val) {
        this.dataBaselineForm.privateCloud = '';
      }
    },
    'dataBaselineForm.publicCloudBox'(val) {
      if (!val) {
        this.dataBaselineForm.publicCloud = '';
      }
    },
    'dataBaselineForm.mixtureCloudBox'(val) {
      if (!val) {
        this.dataBaselineForm.mixtureCloud = '';
      }
    },
    'dataBaselineForm.governmentCloudBox'(val) {
      if (!val) {
        this.dataBaselineForm.governmentCloud = '';
      }
    },
    'dataBaselineForm.noCloudComputingPlatformBox'(val) {
      if (!val) {
        this.dataBaselineForm.noCloudComputingPlatform = '';
      }
    },

    // 监听机房类型选项变化，自动清除输入内容
    'dataBaselineForm.thisUnitMachineRoomBox'(val) {
      if (!val) {
        this.dataBaselineForm.thisUnitMachineRoom = '';
      }
    },
    'dataBaselineForm.outerUnitMachineRoomBox'(val) {
      if (!val) {
        this.dataBaselineForm.outerUnitMachineRoom = '';
      }
    },
    'dataBaselineForm.thirdPartyTrusteeshipMachineRoomBox'(val) {
      if (!val) {
        this.dataBaselineForm.thirdPartyTrusteeshipMachineRoom = '';
      }
    },

    // 监听存储地域选项变化，自动清除输入内容
    'dataBaselineForm.domesticBox'(val) {
      if (!val) {
        this.dataBaselineForm.domestic = '';
      }
    },
    'dataBaselineForm.overseasBox'(val) {
      if (!val) {
        this.dataBaselineForm.overseas = '';
      }
    },

    // 监听其他数据来源选项变化
    'dataBaselineForm.other'(val) {
      if (!val) {
        this.dataBaselineForm.otherInput = '';
      }
    }
  },
  created() {
    // 初始化时，根据路由参数设置表单数据
    if (this.$route.query.row) {
      this.query = JSON.parse(JSON.stringify(this.$route.query.row));
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    //初始化请求摸底数据
    async initData() {
      if (this.query.id) {
        try {
          const res = await getCategoryAttachDataFeelBottomByCategoryId({ categoryId: this.query.id });
          if (res.code === 200) {
            console.log('数据摸底详情:', res.data);
            this.dataBaselineForm = {
              id: res.data.id,
              systemGather: res.data.systemGather === '1', // 系统采集
              systemProduction: res.data.systemProduction === '1', // 系统生产
              artificialFillIn: res.data.artificialFillIn === '1', // 人工填报
              dealBuy: res.data.dealBuy === '1', // 交换购买
              shareExchange: res.data.shareExchange === '1', // 共享交换
              other: res.data.other != '-1' && res.data.other != null ? true : false, // 其他
              otherInput: res.data.other != '-1' && res.data.other != null ? res.data.other : '', // 其他数据来源
              externalProvisionBox: res.data.externalProvision != '-1' && res.data.externalProvision != null ? true : false, // 与其他数据处理者的交互-对外提供给
              externalProvision: res.data.externalProvision != '-1' && res.data.externalProvision != null ? res.data.externalProvision : '', // 与其他数据处理者的交互-对外提供给-具体对象
              entrustBox: res.data.entrust != '-1' && res.data.entrust != null ? true : false, // 与其他数据处理者的交互-委托
              entrust: res.data.entrust != '-1' && res.data.entrust != null ? res.data.entrust : '', // 与其他数据处理者的交互-委托-具体对象
              jointDisposalBox: res.data.jointDisposal != '-1' && res.data.jointDisposal != null ? true : false, // 与其他数据处理者的交互-与...共同处理
              jointDisposal: res.data.jointDisposal != '-1' && res.data.jointDisposal != null ? res.data.jointDisposal : '', // 与其他数据处理者的交互-与...共同处理-具体对象
              noInteraction: res.data.noInteraction === '1', // 与其他数据处理者的交互-无交互
              privateCloudBox: res.data.privateCloud != '-1' && res.data.privateCloud != null ? true : false, // 数据存储位置-云类型-私有云
              privateCloud: res.data.privateCloud != '-1' && res.data.privateCloud != null ? res.data.privateCloud : '', // 数据存储位置-云类型-私有云-具体对象
              publicCloudBox: res.data.publicCloud != '-1' && res.data.publicCloud != null ? true : false, // 数据存储位置-云类型-公有云
              publicCloud: res.data.publicCloud != '-1' && res.data.publicCloud != null ? res.data.publicCloud : '', // 数据存储位置-云类型-公有云-具体对象
              mixtureCloudBox: res.data.mixtureCloud != '-1' && res.data.mixtureCloud != null ? true : false, // 数据存储位置-云类型-混合云
              mixtureCloud: res.data.mixtureCloud != '-1' && res.data.mixtureCloud != null ? res.data.mixtureCloud : '', // 数据存储位置-云类型-混合云-具体对象
              governmentCloudBox: res.data.governmentCloud != '-1' && res.data.governmentCloud != null ? true : false, // 数据存储位置-云类型-政务云
              governmentCloud: res.data.governmentCloud != '-1' && res.data.governmentCloud != null ? res.data.governmentCloud : '', // 数据存储位置-云类型-政务云-具体对象
              noCloudComputingPlatformBox: res.data.noCloudComputingPlatform != '-1' && res.data.noCloudComputingPlatform != null ? true : false, // 数据存储位置-云类型-非云计算平台
              noCloudComputingPlatform: res.data.noCloudComputingPlatform != '-1' && res.data.noCloudComputingPlatform != null ? res.data.noCloudComputingPlatform : '', // 数据存储位置-云类型-非云计算平台-具体对象
              thisUnitMachineRoomBox: res.data.thisUnitMachineRoom != '-1' && res.data.thisUnitMachineRoom != null ? true : false, // 数据存储位置-机房类型-本单位机器机房
              thisUnitMachineRoom: res.data.thisUnitMachineRoom != '-1' && res.data.thisUnitMachineRoom != null ? res.data.thisUnitMachineRoom : '', // 数据存储位置-机房类型-本单位机器机房-具体对象
              outerUnitMachineRoomBox: res.data.outerUnitMachineRoom != '-1' && res.data.outerUnitMachineRoom != null ? true : false, // 数据存储位置-机房类型-外部单位机器机房
              outerUnitMachineRoom: res.data.outerUnitMachineRoom != '-1' && res.data.outerUnitMachineRoom != null ? res.data.outerUnitMachineRoom : '', // 数据存储位置-机房类型-外部单位机器机房-具体对象
              thirdPartyTrusteeshipMachineRoomBox: res.data.thirdPartyTrusteeshipMachineRoom != '-1' && res.data.thirdPartyTrusteeshipMachineRoom != null ? true : false, // 数据存储位置-机房类型-第三方托管机房
              thirdPartyTrusteeshipMachineRoom: res.data.thirdPartyTrusteeshipMachineRoom != '-1' && res.data.thirdPartyTrusteeshipMachineRoom != null ? res.data.thirdPartyTrusteeshipMachineRoom : '', // 数据存储位置-机房类型-第三方托管机房-具体对象
              domesticBox: res.data.domestic != '-1' && res.data.domestic != null ? true : false, // 数据存储位置-存储地域-境内
              domestic: res.data.domestic != '-1' && res.data.domestic != null ? res.data.domestic : '', // 数据存储位置-存储地域-境内-具体对象
              overseasBox: res.data.overseas != '-1' && res.data.overseas != null ? true : false, // 数据存储位置-存储地域-境外
              overseas: res.data.overseas != '-1' && res.data.overseas != null ? res.data.overseas : '', // 数据存储位置-存储地域-境外-具体对象
              dataSources: res.data.dataSources.length > 0  ? res.data.dataSources : [{ content: '' }], // 来源单位
              dataflow: res.data.dataflow.length > 0  ? res.data.dataflow : [{ content: '' }], // 流出单位
            }
          }
        } catch (error) {
          console.error('获取数据摸底详情失败:', error);
        }
      }
    },
    // 处理无交互复选框变化
    handleNoInteractionChange(val) {
      if (val) {
        // 勾选无交互时，清空并禁用其他三个选项
        this.dataBaselineForm.externalProvisionBox = false;
        this.dataBaselineForm.externalProvision = '';
        this.dataBaselineForm.entrustBox = false;
        this.dataBaselineForm.entrust = '';
        this.dataBaselineForm.jointDisposalBox = false;
        this.dataBaselineForm.jointDisposal = '';
      }
    },

    // 添加来源单位
    handleAddFlowUnit() {
      // 检查最后一个单位是否填写
      const lastIndex = this.dataBaselineForm.dataSources.length - 1;
      const lastContent = this.dataBaselineForm.dataSources[lastIndex].content.trim();

      if (!lastContent) {
        this.$message.warning('请完善当前单位信息后再添加');
        return;
      }

      // 检查是否有重复单位（通过content对比，排除最后一个元素本身）
      const hasDuplicate = this.dataBaselineForm.dataSources.some(
        (item, index) => index !== lastIndex && item.content.trim() === lastContent
      );

      if (hasDuplicate) {
        this.$message.warning('存在重复的单位，请修改后再添加');
        return;
      }

      this.dataBaselineForm.dataSources.push({
        content: '' // 新增项不包含id
      });
    },

    // 删除来源单位
    handleRemoveFlowUnit(index) {
      this.dataBaselineForm.dataSources.splice(index, 1);
    },

    // 添加流出单位
    handleAddFlowOutUnit() {
      // 检查最后一个单位是否填写
      const lastIndex = this.dataBaselineForm.dataflow.length - 1;
      const lastContent = this.dataBaselineForm.dataflow[lastIndex].content.trim();

      if (!lastContent) {
        this.$message.warning('请完善当前单位信息后再添加');
        return;
      }

      // 检查是否有重复单位（通过content对比，排除最后一个元素本身）
      const hasDuplicate = this.dataBaselineForm.dataflow.some(
        (item, index) => index !== lastIndex && item.content.trim() === lastContent
      );

      if (hasDuplicate) {
        this.$message.warning('存在重复的单位，请修改后再添加');
        return;
      }

      this.dataBaselineForm.dataflow.push({
        content: ''
      });
    },

    // 删除流出单位
    handleRemoveFlowOutUnit(index) {
      this.dataBaselineForm.dataflow.splice(index, 1);
    },

    // 提交表单
    async handleSubmit() {
      // 先验证单位信息
      let isUnitValid = true;

      // 验证数据来源单位
      this.dataBaselineForm.dataSources.forEach((item) => {
        if (!item.content.trim()) {
          isUnitValid = false;
        }
      });

      // 验证数据流出单位
      this.dataBaselineForm.dataflow.forEach((item) => {
        if (!item.content.trim()) {
          isUnitValid = false;
        }
      });

      if (!isUnitValid) {
        this.$message.warning('请完善所有单位信息');
        return;
      }

      // 检查数据来源至少选择一项
      const hasDataSource = this.dataBaselineForm.systemGather ||
        this.dataBaselineForm.systemProduction ||
        this.dataBaselineForm.artificialFillIn ||
        this.dataBaselineForm.dealBuy ||
        this.dataBaselineForm.shareExchange ||
        this.dataBaselineForm.other;

      if (!hasDataSource) {
        this.$message.warning('请至少选择一种数据来源');
        return;
      }

      // 其他验证逻辑... 无输入值存-1
      console.log('表单提交', this.dataBaselineForm);
      const params = {
        id: this.dataBaselineForm.id,
        categoryDataId: this.query.id,
        systemGather: this.dataBaselineForm.systemGather ? '1' : '0',
        systemProduction: this.dataBaselineForm.systemProduction ? '1' : '0',
        artificialFillIn: this.dataBaselineForm.artificialFillIn ? '1' : '0',
        dealBuy: this.dataBaselineForm.dealBuy ? '1' : '0',
        shareExchange: this.dataBaselineForm.shareExchange ? '1' : '0',
        other: this.dataBaselineForm.other ? this.dataBaselineForm.otherInput : '-1',
        externalProvision: this.dataBaselineForm.externalProvisionBox ? this.dataBaselineForm.externalProvision : '-1',
        entrust: this.dataBaselineForm.entrustBox ? this.dataBaselineForm.entrust : '-1',
        jointDisposal: this.dataBaselineForm.jointDisposalBox ? this.dataBaselineForm.jointDisposal : '-1',
        noInteraction: this.dataBaselineForm.noInteractionBox ? '1' : '0',
        privateCloud: this.dataBaselineForm.privateCloudBox ? this.dataBaselineForm.privateCloud : '-1',
        publicCloud: this.dataBaselineForm.publicCloudBox ? this.dataBaselineForm.publicCloud : '-1',
        mixtureCloud: this.dataBaselineForm.mixtureCloudBox ? this.dataBaselineForm.mixtureCloud : '-1',
        governmentCloud: this.dataBaselineForm.governmentCloudBox ? this.dataBaselineForm.governmentCloud : '-1',
        noCloudComputingPlatform: this.dataBaselineForm.noCloudComputingPlatformBox ? this.dataBaselineForm.noCloudComputingPlatform : '-1',
        thisUnitMachineRoom: this.dataBaselineForm.thisUnitMachineRoomBox ? this.dataBaselineForm.thisUnitMachineRoom : '-1',
        outerUnitMachineRoom: this.dataBaselineForm.outerUnitMachineRoomBox ? this.dataBaselineForm.outerUnitMachineRoom : '-1',
        thirdPartyTrusteeshipMachineRoom: this.dataBaselineForm.thirdPartyTrusteeshipMachineRoomBox ? this.dataBaselineForm.thirdPartyTrusteeshipMachineRoom : '-1',
        domestic: this.dataBaselineForm.domesticBox ? this.dataBaselineForm.domestic : '-1',
        overseas: this.dataBaselineForm.overseasBox ? this.dataBaselineForm.overseas : '-1',
        dataSources: this.dataBaselineForm.dataSources,
        dataflow: this.dataBaselineForm.dataflow,
      }
      try {
        const res = await addOrUpdateDataFeelBottomByCategoryId(params);
        if (res.code === 200) {
          this.$message.success('提交成功');
          this.$router.back();
        } else {
          this.$message.error(res.msg || '提交失败');
        }
      } catch (error) {
        this.$message.error('提交失败');
      }
    },

    // 重置表单
    handleReset() {
      this.$refs.dataBaselineForm.resetFields();
      // 重置自定义的数组等数据
      this.dataBaselineForm.dataSources = [{ content: '' }];
      this.dataBaselineForm.dataflow = [{ content: '' }];
      this.$router.back();
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