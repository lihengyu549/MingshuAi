<template>
    <div class="dataBaseline" v-loading="Loading">
        <el-select v-model="selectedValue" class="select-top" placeholder="请选择">
            <el-option v-for="item in selectOptions" :key="item.value" :label="item.label"
                :value="item.value"></el-option>
        </el-select>
        <el-form slot="body" ref="dataBaselineForm" :model="dataBaselineForm" label-width="120px" label-position="top">
            <Title title="基础数据信息" iconClass="info"></Title>
            <!-- 基础数据信息 -->
            <el-form-item label="数据名称">
                <el-input v-model="formData.dataName" disabled></el-input>
            </el-form-item>
            <!-- 拟定数据级别（单选） -->
            <el-form-item label="拟定数据级别">
                <el-radio label="一般数据" disabled>一般数据</el-radio>
                <el-radio label="重要及以上数据" disabled>重要及以上数据</el-radio>
            </el-form-item>
            <!-- 数据类别 -->
            <el-form-item label="数据类别">
                <el-input v-model="formData.dataCategory" disabled></el-input>
            </el-form-item>
            <!-- 数据安全责任部门 -->
            <el-form-item label="数据安全责任部门">
                <el-input v-model="formData.dataSecurityDept" disabled></el-input>
            </el-form-item>
            <!-- 数据安全负责人 -->
            <el-form-item label="数据安全负责人">
                <el-input v-model="formData.dataSecurityPerson" disabled></el-input>
            </el-form-item>
            <!-- 个人信息涉及情况（多选） -->
            <el-form-item label="个人信息涉及情况">
                <div class="interaction-checkbox">
                    <el-checkbox disabled>涉及敏感个人信息</el-checkbox>
                    <el-checkbox disabled>涉及未成年人的个人信息</el-checkbox>
                    <el-checkbox disabled>涉及一般个人信息</el-checkbox>
                    <el-checkbox disabled>不涉及</el-checkbox>
                </div>
            </el-form-item>
            <!-- 数据总量 -->
            <el-form-item label="数据总量">
                数据总量：<el-tag type="primary"><b>{{ formData.dataTotal || '200GB' }}</b></el-tag><br>
                涉及个人信息：<el-tag type="primary"><b>{{ formData.personalInfoCount || '10万条' }}</b></el-tag>
            </el-form-item>
            <!-- 数据月增长量 -->
            <el-form-item label="数据月增长量">
                数据月增长量：<el-tag type="primary"><b>{{ formData.monthlyGrowth || '10GB' }}</b></el-tag>
            </el-form-item>

            <!-- 数据来源 -->
            <Title title="数据来源" iconClass="databaseSolid"></Title>
            <el-form-item label="">
                <span class="label-text">数据的产生方式/获取方式</span>
                <div class="checkbox-two-per-line">
                    <el-checkbox v-model="dataBaselineForm.systemGather" disabled>系统采集</el-checkbox>
                    <el-checkbox v-model="dataBaselineForm.systemProduction" disabled>系统生产</el-checkbox>
                    <el-checkbox v-model="dataBaselineForm.artificialFillIn" disabled>人工填报</el-checkbox>
                    <el-checkbox v-model="dataBaselineForm.dealBuy" disabled>交换购买</el-checkbox>
                    <el-checkbox v-model="dataBaselineForm.shareExchange" disabled>共享交换</el-checkbox>
                    <el-checkbox v-model="dataBaselineForm.other" disabled>其他</el-checkbox>
                </div>
            </el-form-item>
            <el-form-item label="其他数据来源" v-if="dataBaselineForm.other">
                <el-input v-model="dataBaselineForm.otherInput" placeholder="其他数据来源" disabled></el-input>
            </el-form-item>

            <!-- 单位间数据流转情况 -->
            <Title title="单位间数据流转情况" iconClass="circulation"></Title>
            <!-- 数据来源单位 -->
            <el-form-item label="数据来源单位">
                <div v-for="(item, index) in dataBaselineForm.dataSources" :key="index" class="flow-unit-item">
                    <el-input v-model="item.content" placeholder="来源单位" disabled></el-input>
                </div>
            </el-form-item>

            <!-- 数据流出单位 -->
            <el-form-item label="数据流出单位">
                <div v-for="(item, index) in dataBaselineForm.dataflow" :key="index" class="flow-unit-item">
                    <el-input v-model="item.content" placeholder="流出单位" disabled></el-input>
                </div>
            </el-form-item>

            <!-- 与其他数据处理者的交互 -->
            <Title title="与其他数据处理者的交互" iconClass="peoplesBlue"></Title>
            <span class="label-text">与其他数据的交互类型</span>
            <el-form-item label="">
                <div class="interaction-checkbox">
                    <el-checkbox v-model="dataBaselineForm.externalProvisionBox" disabled>对外提供给</el-checkbox>
                    <el-input v-model="dataBaselineForm.externalProvision" placeholder="具体对象"
                        v-if="dataBaselineForm.externalProvisionBox" disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.entrustBox" disabled>委托</el-checkbox>
                    <el-input v-model="dataBaselineForm.entrust" placeholder="具体对象" v-if="dataBaselineForm.entrustBox"
                        disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.jointDisposalBox" disabled>与....共同处理</el-checkbox>
                    <el-input v-model="dataBaselineForm.jointDisposal" placeholder="具体对象"
                        v-if="dataBaselineForm.jointDisposalBox" disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.noInteraction" disabled>无交互</el-checkbox>
                </div>
            </el-form-item>

            <!-- 数据存储位置-云类型 -->
            <Title title="数据存储位置" iconClass="storage"></Title>
            <span class="label-text">云类型</span>
            <el-form-item label="">
                <div class="interaction-checkbox">
                    <el-checkbox v-model="dataBaselineForm.privateCloudBox" disabled>私有云</el-checkbox>
                    <el-input v-model="dataBaselineForm.privateCloud" placeholder="具体对象"
                        v-if="dataBaselineForm.privateCloudBox" disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.publicCloudBox" disabled>公有云</el-checkbox>
                    <el-input v-model="dataBaselineForm.publicCloud" placeholder="具体对象"
                        v-if="dataBaselineForm.publicCloudBox" disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.mixtureCloudBox" disabled>混合云</el-checkbox>
                    <el-input v-model="dataBaselineForm.mixtureCloud" placeholder="具体对象"
                        v-if="dataBaselineForm.mixtureCloudBox" disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.governmentCloudBox" disabled>政务云</el-checkbox>
                    <el-input v-model="dataBaselineForm.governmentCloud" placeholder="具体对象"
                        v-if="dataBaselineForm.governmentCloudBox" disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.noCloudComputingPlatformBox" disabled>非云计算平台</el-checkbox>
                    <el-input v-model="dataBaselineForm.noCloudComputingPlatform" placeholder="具体对象"
                        v-if="dataBaselineForm.noCloudComputingPlatformBox" disabled></el-input>
                </div>
            </el-form-item>

            <!-- 数据存储位置-机房类型 -->
            <span class="label-text">机房类型</span>
            <el-form-item label="">
                <div class="interaction-checkbox">
                    <el-checkbox v-model="dataBaselineForm.thisUnitMachineRoomBox" disabled>本单位机器机房</el-checkbox>
                    <el-input v-model="dataBaselineForm.thisUnitMachineRoom" placeholder="具体对象"
                        v-if="dataBaselineForm.thisUnitMachineRoomBox" disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.outerUnitMachineRoomBox" disabled>外部单位机器机房</el-checkbox>
                    <el-input v-model="dataBaselineForm.outerUnitMachineRoom" placeholder="具体对象"
                        v-if="dataBaselineForm.outerUnitMachineRoomBox" disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.thirdPartyTrusteeshipMachineRoomBox"
                        disabled>第三方托管机房</el-checkbox>
                    <el-input v-model="dataBaselineForm.thirdPartyTrusteeshipMachineRoom" placeholder="具体对象"
                        v-if="dataBaselineForm.thirdPartyTrusteeshipMachineRoomBox" disabled></el-input>
                </div>
            </el-form-item>

            <!-- 数据存储位置-存储地域 -->
            <span class="label-text">存储地域</span>
            <el-form-item label="">
                <div class="interaction-checkbox">
                    <el-checkbox v-model="dataBaselineForm.domesticBox" disabled>境内</el-checkbox>
                    <el-input v-model="dataBaselineForm.domestic" placeholder="具体对象" v-if="dataBaselineForm.domesticBox"
                        disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.overseasBox" disabled>境外</el-checkbox>
                    <el-input v-model="dataBaselineForm.overseas" placeholder="具体对象" v-if="dataBaselineForm.overseasBox"
                        disabled></el-input>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { getCategoryAttachDataFeelBottomByCategoryId } from "@/api/system/protectCategory";
export default {
    name: 'dataBaseline',
    props: {
    },
    data() {
        return {
            Loading: false,
            dataBaselineForm: {
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
                dataSources: [{ content: '' }], // 数据来源单位
                dataflow: [{ content: '' }], // 数据流出单位
            },

            // 下拉选项
            selectOptions: [
                { label: "员工信息", value: "employee" },
                { label: "其他信息", value: "other" },
                // 可根据需求添加更多选项
            ],
            // 当前选中的下拉值
            selectedValue: "employee",
            // 不同选项对应的表单数据（这里仅为示例结构，需根据实际业务补充）
            formDataMap: {
                employee: {
                    dataName: "员工信息",
                    dataCategory: "经营-人力数据",
                    dataSecurityDept: "IT",
                    dataSecurityPerson: "张三",
                    dataTotal: "200GB",
                    personalInfoCount: "10万条",
                    monthlyGrowth: "10GB",
                    // 其他员工信息相关字段...
                },
                other: {
                    dataName: "其他信息",
                    dataCategory: "其他分类",
                    dataSecurityDept: "其他部门",
                    dataSecurityPerson: "李四",
                    dataTotal: "100GB",
                    personalInfoCount: "5万条",
                    monthlyGrowth: "5GB",
                    // 其他信息相关字段...
                },
            },
            // 用于表单双向绑定的当前数据
            formData: {},
        }
    },
    watch: {
        selectedValue(newVal) {
            this.formData = this.formDataMap[newVal] || {};
        },
    },
    created() {
    },
    mounted() {
        this.initData();
    },
    methods: {
        //初始化请求摸底数据
        initData() {
            // if (this.query.id) {
            //     try {
            //         const res = await getCategoryAttachDataFeelBottomByCategoryId({ categoryId: this.query.categoryId });
            //         if (res.code === 200) {
            //             console.log('数据摸底详情:', res.data);
            //             this.dataBaselineForm = {
            //                 systemGather: res.data.systemGather === '1', // 系统采集
            //                 systemProduction: res.data.systemProduction === '1', // 系统生产
            //                 artificialFillIn: res.data.artificialFillIn === '1', // 人工填报
            //                 dealBuy: res.data.dealBuy === '1', // 交换购买
            //                 shareExchange: res.data.shareExchange === '1', // 共享交换
            //                 other: res.data.other != '' ? true : false, // 其他
            //                 otherInput: res.data.other != '' ? res.data.other : '', // 其他数据来源
            //                 externalProvisionBox: res.data.externalProvision != '' ? true : false, // 与其他数据处理者的交互-对外提供给
            //                 externalProvision: res.data.externalProvision != '' ? res.data.externalProvision : '', // 与其他数据处理者的交互-对外提供给-具体对象
            //                 entrustBox: res.data.entrust != '' ? true : false, // 与其他数据处理者的交互-委托
            //                 entrust: res.data.entrust != '' ? res.data.entrust : '', // 与其他数据处理者的交互-委托-具体对象
            //                 jointDisposalBox: res.data.jointDisposal != '' ? true : false, // 与其他数据处理者的交互-与...共同处理
            //                 jointDisposal: res.data.jointDisposal != '' ? res.data.jointDisposal : '', // 与其他数据处理者的交互-与...共同处理-具体对象
            //                 noInteraction: res.data.noInteraction === '1', // 与其他数据处理者的交互-无交互
            //                 privateCloudBox: res.data.privateCloud != '' ? true : false, // 数据存储位置-云类型-私有云
            //                 privateCloud: res.data.privateCloud != '' ? res.data.privateCloud : '', // 数据存储位置-云类型-私有云-具体对象
            //                 publicCloudBox: res.data.publicCloud != '' ? true : false, // 数据存储位置-云类型-公有云
            //                 publicCloud: res.data.publicCloud != '' ? res.data.publicCloud : '', // 数据存储位置-云类型-公有云-具体对象
            //                 mixtureCloudBox: res.data.mixtureCloud != '' ? true : false, // 数据存储位置-云类型-混合云
            //                 mixtureCloud: res.data.mixtureCloud != '' ? res.data.mixtureCloud : '', // 数据存储位置-云类型-混合云-具体对象
            //                 governmentCloudBox: res.data.governmentCloud != '' ? true : false, // 数据存储位置-云类型-政务云
            //                 governmentCloud: res.data.governmentCloud != '' ? res.data.governmentCloud : '', // 数据存储位置-云类型-政务云-具体对象
            //                 noCloudComputingPlatformBox: res.data.noCloudComputingPlatform != '' ? true : false, // 数据存储位置-云类型-非云计算平台
            //                 noCloudComputingPlatform: res.data.noCloudComputingPlatform != '' ? res.data.noCloudComputingPlatform : '', // 数据存储位置-云类型-非云计算平台-具体对象
            //                 thisUnitMachineRoomBox: res.data.thisUnitMachineRoom != '' ? true : false, // 数据存储位置-机房类型-本单位机器机房
            //                 thisUnitMachineRoom: res.data.thisUnitMachineRoom != '' ? res.data.thisUnitMachineRoom : '', // 数据存储位置-机房类型-本单位机器机房-具体对象
            //                 outerUnitMachineRoomBox: res.data.outerUnitMachineRoom != '' ? true : false, // 数据存储位置-机房类型-外部单位机器机房
            //                 outerUnitMachineRoom: res.data.outerUnitMachineRoom != '' ? res.data.outerUnitMachineRoom : '', // 数据存储位置-机房类型-外部单位机器机房-具体对象
            //                 thirdPartyTrusteeshipMachineRoomBox: res.data.thirdPartyTrusteeshipMachineRoom != '' ? true : false, // 数据存储位置-机房类型-第三方托管机房
            //                 thirdPartyTrusteeshipMachineRoom: res.data.thirdPartyTrusteeshipMachineRoom != '' ? res.data.thirdPartyTrusteeshipMachineRoom : '', // 数据存储位置-机房类型-第三方托管机房-具体对象
            //                 domesticBox: res.data.domestic != '' ? true : false, // 数据存储位置-存储地域-境内
            //                 domestic: res.data.domestic != '' ? res.data.domestic : '', // 数据存储位置-存储地域-境内-具体对象
            //                 overseasBox: res.data.overseas != '' ? true : false, // 数据存储位置-存储地域-境外
            //                 overseas: res.data.overseas != '' ? res.data.overseas : '', // 数据存储位置-存储地域-境外-具体对象
            //                 dataSources: res.data.dataSources || [], // 来源单位
            //                 dataflow: res.data.dataflow || [], // 流出单位
            //             }
            //         }
            //     } catch (error) {
            //         console.error('获取数据摸底详情失败:', error);
            //     }
            // }
        },
    },
}
</script>

<style scoped lang="scss">
.dataBaseline {
    width: 100%;
    padding: 15px;
}

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

.select-top {
    width: 100%;
}

::v-deep .select-top .el-input__inner {
    border: none;
    border-radius: 0;
    border-bottom: 3px solid #01a7f0;
    color: #01a7f0;
    font-size: 18px;
}
</style>