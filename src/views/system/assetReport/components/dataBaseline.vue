<template>
    <div class="dataBaseline" v-loading="Loading">
        <el-select v-model="selectedValue" class="select-top" placeholder="请选择" @change="handleSelectChange">
            <el-option v-for="item in selectOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-form slot="body" ref="dataBaselineForm" :model="dataBaselineForm" label-width="120px" label-position="top">
            <Title title="基础数据信息" iconClass="info"></Title>
            <!-- 基础数据信息 -->
            <el-form-item label="数据名称">
                <el-input v-model="dataBaselineForm.dataName" disabled></el-input>
            </el-form-item>
            <!-- 拟定数据级别（单选） -->
            <el-form-item label="拟定数据级别">
                <el-radio v-for="item in dict.type.sys_risk_level" v-model="dataBaselineForm.dataLevel" :key="item.value" :label="item.value" disabled>{{ item.label }}</el-radio>
            </el-form-item>
            <!-- 数据类别 -->
            <el-form-item label="数据类别">
                <el-input v-model="dataBaselineForm.dataType" disabled></el-input>
            </el-form-item>
            <!-- 数据安全责任部门 -->
            <el-form-item label="数据安全责任部门">
                <el-input v-model="dataBaselineForm.deptName" disabled></el-input>
            </el-form-item>
            <!-- 数据安全负责人 -->
            <el-form-item label="数据安全负责人">
                <el-input v-model="dataBaselineForm.dataOwner" disabled></el-input>
            </el-form-item>
            <!-- 个人信息涉及情况（多选） -->
            <el-form-item label="个人信息涉及情况">
                <div class="interaction-checkbox">
                    <el-checkbox v-model="dataBaselineForm.sensitivePersonalData" disabled>涉及敏感个人信息</el-checkbox>
                    <el-checkbox v-model="dataBaselineForm.noPersonalData" disabled>涉及未成年人的个人信息</el-checkbox>
                    <el-checkbox v-model="dataBaselineForm.ordinaryPersonalData" disabled>涉及一般个人信息</el-checkbox>
                    <el-checkbox v-model="dataBaselineForm.personalData" disabled>不涉及</el-checkbox>
                </div>
            </el-form-item>
            <!-- 数据总量 -->
            <el-form-item label="数据总量">
                数据总量：<el-tag type="primary"><b>{{ dataBaselineForm.dateSize }}</b></el-tag><br>
                涉及个人信息：<el-tag type="primary"><b>{{ dataBaselineForm.piiCount }}</b></el-tag>
            </el-form-item>
            <!-- 数据月增长量 -->
            <el-form-item label="数据月增长量">
                数据月增长量：<el-tag type="primary"><b>{{ dataBaselineForm.monthAmountOfIncrease }}</b></el-tag>
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
                <el-input v-model="dataBaselineForm.otherInput" disabled></el-input>
            </el-form-item>

            <!-- 单位间数据流转情况 -->
            <Title title="单位间数据流转情况" iconClass="circulation"></Title>
            <!-- 数据来源单位 -->
            <el-form-item label="数据来源单位">
                <div v-for="(item, index) in dataBaselineForm.dataSources" :key="index" class="flow-unit-item">
                    <el-input v-model="item.content" disabled></el-input>
                </div>
            </el-form-item>

            <!-- 数据流出单位 -->
            <el-form-item label="数据流出单位">
                <div v-for="(item, index) in dataBaselineForm.dataflow" :key="index" class="flow-unit-item">
                    <el-input v-model="item.content" disabled></el-input>
                </div>
            </el-form-item>

            <!-- 与其他数据处理者的交互 -->
            <Title title="与其他数据处理者的交互" iconClass="peoplesBlue"></Title>
            <span class="label-text">与其他数据的交互类型</span>
            <el-form-item label="">
                <div class="interaction-checkbox">
                    <el-checkbox v-model="dataBaselineForm.externalProvisionBox" disabled>对外提供给</el-checkbox>
                    <el-input v-model="dataBaselineForm.externalProvision" v-if="dataBaselineForm.externalProvisionBox"
                        disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.entrustBox" disabled>委托</el-checkbox>
                    <el-input v-model="dataBaselineForm.entrust" v-if="dataBaselineForm.entrustBox" disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.jointDisposalBox" disabled>与....共同处理</el-checkbox>
                    <el-input v-model="dataBaselineForm.jointDisposal" v-if="dataBaselineForm.jointDisposalBox"
                        disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.noInteraction" disabled>无交互</el-checkbox>
                </div>
            </el-form-item>

            <!-- 数据存储位置-云类型 -->
            <Title title="数据存储位置" iconClass="storage"></Title>
            <span class="label-text">云类型</span>
            <el-form-item label="">
                <div class="interaction-checkbox">
                    <el-checkbox v-model="dataBaselineForm.privateCloudBox" disabled>私有云</el-checkbox>
                    <el-input v-model="dataBaselineForm.privateCloud" v-if="dataBaselineForm.privateCloudBox"
                        disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.publicCloudBox" disabled>公有云</el-checkbox>
                    <el-input v-model="dataBaselineForm.publicCloud" v-if="dataBaselineForm.publicCloudBox"
                        disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.mixtureCloudBox" disabled>混合云</el-checkbox>
                    <el-input v-model="dataBaselineForm.mixtureCloud" v-if="dataBaselineForm.mixtureCloudBox"
                        disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.governmentCloudBox" disabled>政务云</el-checkbox>
                    <el-input v-model="dataBaselineForm.governmentCloud" v-if="dataBaselineForm.governmentCloudBox"
                        disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.noCloudComputingPlatformBox" disabled>非云计算平台</el-checkbox>
                    <el-input v-model="dataBaselineForm.noCloudComputingPlatform"
                        v-if="dataBaselineForm.noCloudComputingPlatformBox" disabled></el-input>
                </div>
            </el-form-item>

            <!-- 数据存储位置-机房类型 -->
            <span class="label-text">机房类型</span>
            <el-form-item label="">
                <div class="interaction-checkbox">
                    <el-checkbox v-model="dataBaselineForm.thisUnitMachineRoomBox" disabled>本单位机器机房</el-checkbox>
                    <el-input v-model="dataBaselineForm.thisUnitMachineRoom"
                        v-if="dataBaselineForm.thisUnitMachineRoomBox" disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.outerUnitMachineRoomBox" disabled>外部单位机器机房</el-checkbox>
                    <el-input v-model="dataBaselineForm.outerUnitMachineRoom"
                        v-if="dataBaselineForm.outerUnitMachineRoomBox" disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.thirdPartyTrusteeshipMachineRoomBox"
                        disabled>第三方托管机房</el-checkbox>
                    <el-input v-model="dataBaselineForm.thirdPartyTrusteeshipMachineRoom"
                        v-if="dataBaselineForm.thirdPartyTrusteeshipMachineRoomBox" disabled></el-input>
                </div>
            </el-form-item>

            <!-- 数据存储位置-存储地域 -->
            <span class="label-text">存储地域</span>
            <el-form-item label="">
                <div class="interaction-checkbox">
                    <el-checkbox v-model="dataBaselineForm.domesticBox" disabled>境内</el-checkbox>
                    <el-input v-model="dataBaselineForm.domestic" v-if="dataBaselineForm.domesticBox"
                        disabled></el-input>
                    <el-checkbox v-model="dataBaselineForm.overseasBox" disabled>境外</el-checkbox>
                    <el-input v-model="dataBaselineForm.overseas" v-if="dataBaselineForm.overseasBox"
                        disabled></el-input>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { getCategoryAttachDataByCategoryIds, listDataFeelBottomSurvey } from "@/api/system/protectCategory";
export default {
    name: 'dataBaseline',
    dicts: ['sys_risk_level'],
    props: {
        categoryId: {
            type: [String, Number],
            default: ''
        }
    },
    data() {
        return {
            Loading: false,
            dataBaselineForm: {
                dataName: '', // 数据名称
                dataLevel: '', // 数据级别
                dataType: '', // 数据类别
                dataOwner: '', // 数据安全负责人
                deptName: '', // 数据安全责任部门
                noPersonalData: '', // 未成年信息
                ordinaryPersonalData: '', // 一般个人信息
                sensitivePersonalData: '', // 敏感个人信息
                personalData: '', // 不涉及
                dateSize: '', // 数据总量
                piiCount: '', // 个人信息条数
                monthAmountOfIncrease: '', // 数据月增长量
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
            selectOptions: [],
            // 当前选中的下拉值
            selectedValue: "",
            // 不同选项对应的表单数据（这里仅为示例结构，需根据实际业务补充）
            // 用于表单双向绑定的当前数据
        }
    },
    watch: {
        selectedValue(newVal) {
            // this.dataBaselineForm = this.formDataMap[newVal] || {};
        },
        categoryId(newVal) {
            this.getSelectList()
        }
    },
    created() {
    },
    mounted() {
        // 下拉框查询 等待父组件异步完成
        setTimeout(() => {
            this.getSelectList();
        }, 100);
    },
    methods: {
        // 下拉框查询
        getSelectList() {
            const params = {
                categoryId: this.categoryId
            }
            try {
                getCategoryAttachDataByCategoryIds(params).then((response) => {
                    if (response.code === 200) {
                        this.selectOptions = response.data;
                        this.selectedValue = response.data[0]?.id || '';
                        this.initData(response.data[0]?.id);
                    }
                });
            } catch (error) {
                console.error('下拉框查询失败:', error);
            }
        },
        // 下拉框选择变化时触发
        handleSelectChange(newVal) {
            this.selectedValue = newVal;
            this.initData(newVal);
        },
        //初始化请求摸底数据
        async initData(categoryDataId) {
            if (this.categoryId) {
                const params = {
                    categoryId: this.categoryId,
                    categoryDataId: categoryDataId
                }
                try {
                    const res = await listDataFeelBottomSurvey(params);
                    if (res.code === 200) {
                        this.dataBaselineForm = {
                            dataName: res.data.dataName, // 数据名称
                            dataLevel: res.data.dataLevel, // 数据级别
                            dataType: res.data.dataType, // 数据类别
                            dataOwner: res.data.dataOwner, // 数据安全负责人
                            deptName: res.data.deptName, // 数据安全责任部门
                            noPersonalData: res.data.noPersonalData === '1' ? true : false, // 未成年信息
                            ordinaryPersonalData: res.data.ordinaryPersonalData === '1' ? true : false, // 一般个人信息
                            sensitivePersonalData: res.data.sensitivePersonalData === '1' ? true : false, // 敏感个人信息
                            personalData: res.data.personalData === '1' ? true : false, // 不涉及
                            dateSize: res.data.dateSize, // 数据总量
                            piiCount: res.data.piiCount, // 个人信息条数
                            monthAmountOfIncrease: res.data.monthAmountOfIncrease, // 数据月增长量
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
                            dataSources: res.data.dataSources.length > 0 ? res.data.dataSources : [{ content: '' }], // 来源单位
                            dataflow: res.data.dataflow.length > 0 ? res.data.dataflow : [{ content: '' }], // 流出单位
                        }
                    }
                } catch (error) {
                    console.error('获取数据摸底详情失败:', error);
                    // 返回错误信息，确保函数总是有返回值
                    return { code: 500, message: '获取数据失败' };
                }
            }
            // 当this.categoryId为空时，返回空数据
            return { code: 200, data: null };
        },
        // 新增方法：获取所有下拉项的完整数据
        async getAllOptionsData() {
            try {
                this.Loading = true;
                // 1. 获取所有下拉选项
                const optionsRes = await getCategoryAttachDataByCategoryIds({
                    categoryId: this.categoryId
                });

                if (optionsRes.code !== 200) return [];

                // 2. 批量获取所有选项对应的数据
                const allData = [];
                for (const option of optionsRes.data) {
                    const dataRes = await listDataFeelBottomSurvey({
                        categoryId: this.categoryId,
                        categoryDataId: option.id
                    });

                    if (dataRes.code === 200) {
                        allData.push({
                            title: option.name, // 下拉项名称作为标题
                            formData: this.formatFormData(dataRes.data) // 格式化数据
                        });
                    }
                }
                return allData;
            } catch (error) {
                console.error('获取所有数据失败:', error);
                return [];
            } finally {
                this.Loading = false;
            }
        },

        // 复用数据格式化逻辑（从initData中提取）
        formatFormData(rawData) {
            return {
                dataName: rawData.dataName,
                dataLevel: rawData.dataLevel,
                // ... 其他字段（与initData中保持一致）
                dataSources: rawData.dataSources.length > 0 ? rawData.dataSources : [{ content: '' }],
                dataflow: rawData.dataflow.length > 0 ? rawData.dataflow : [{ content: '' }],
            };
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
        padding-left: 20px;
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