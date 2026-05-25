<template>
    <div class="app-container">
        <el-row :gutter="20">
            <!-- 左侧菜单区域 -->
            <el-col :span="5" :xs="24">
                <el-card shadow="never" class="left-sidebar-card">
                    <div class="left-sidebar">
                        <!-- 搜索框 -->
                        <div style="padding: 5%;">
                            <el-input :placeholder="$t('textModel.searchModel') || '搜索模型...'" v-model="searchKeyword" clearable class="search-input">
                                <i slot="prefix" class="el-input__icon el-icon-search"></i>
                            </el-input>
                        </div>

                        <!-- 菜单列表 -->
                        <el-menu :default-active="activeModel" class="model-menu" background-color="#fff"
                            text-color="#333" active-text-color="#409EFF" @select="handleMenuSelect">
                            <el-menu-item v-for="model in filteredModels" :key="model.name" :index="model.name"
                                :style="{ backgroundColor: activeModel === model.name ? '#eaf1ff' : '' }">
                                <svg-icon icon-class="local" style="margin-right: 10px;"></svg-icon>
                                <span>{{ model.label }}</span>
                                <!-- 左侧菜单开关 -->
                                <el-switch v-model="model.enabled" active-color="#13ce66" inactive-color="#e9ecef"
                                    class="inner-text-switch"
                                    style="margin-left: auto;" @change="handleModelSwitch(model)"></el-switch>
                            </el-menu-item>
                        </el-menu>
                    </div>
                </el-card>
            </el-col>
            <!-- 右侧内容区域 -->
            <el-col :span="19" :xs="24">
                <el-card shadow="never" class="right-content-card">
                    <div class="right-content">
                        <div class="content-header">
                            <svg-icon icon-class="local" style="margin-right: 10px;"></svg-icon>
                            <span>{{ currentModel.label }}</span>
                            <!-- 右侧主开关 - 调整为内部显示ON/OFF，右侧开关只读展示 -->
                            <el-switch v-model="currentModel.enabled" active-color="#13ce66" inactive-color="#e9ecef"
                                class="inner-text-switch" style="margin-left: auto;" disabled></el-switch>
                        </div>

                        <!-- 表单内容 -->
                        <el-form label-width="100px" class="config-form" :disabled="!currentModel.enabled">
                            <el-form-item :label="$t('textModel.interfaceAddress') || '接口地址'">
                                <el-input v-model="currentModel.apiUrl" :placeholder="$t('textModel.inputInterfaceAddress') || '请输入接口地址'"
                                    style="width: 100%;"></el-input>
                            </el-form-item>

                            <el-form-item :label="$t('textModel.accuracy') || '精确度'">
                                <el-radio-group v-model="currentModel.accuracy" size="small" class="custom-radio-group">
                                    <el-radio-button label="1">{{ $t('textModel.balanced') || '平衡' }}</el-radio-button>
                                    <el-radio-button label="2">{{ $t('textModel.precise') || '精准' }}</el-radio-button>
                                </el-radio-group>
                            </el-form-item>

                            <el-form-item :label="$t('textModel.requestTimeout') || '请求超时'">
                                <div class="slider-container">
                                    <el-slider v-model="currentModel.timeout" :max="300" :min="30" :step="30"
                                        show-tooltip style="flex: 1;" class="timeout"></el-slider>
                                    <span class="slider-value">
                                        {{ formatTimeout(currentModel.timeout) }}
                                    </span>
                                    <el-tooltip :content="$t('textModel.requestTimeoutTooltip') || '设置请求超时时间'"
                                        placement="top" transition="el-fade-in-linear">
                                        <svg-icon icon-class="dengpao" style="margin-left: 10px;"></svg-icon>
                                    </el-tooltip>
                                </div>
                                <div class="timeout-buttons">
                                    <el-button v-for="btn in timeoutOptions" :key="btn.value"
                                        :type="currentModel.timeout === btn.value ? 'danger' : 'default'" size="mini"
                                        @click="setTimeout(btn.value)">
                                        {{ btn.label }}
                                    </el-button>
                                </div>
                            </el-form-item>
                        </el-form>

                        <!-- 新增按钮容器 -->
                        <div class="button-container">
                            <el-button plain @click="handleTest" :disabled="!currentModel.enabled">{{ $t('textModel.testConnection') || '测试连接' }}</el-button>
                            <el-button type="primary" plain style="margin-left: 10px;" @click="handleSave" :disabled="!currentModel.enabled">{{ $t('textModel.saveConfig') || '保存配置' }}</el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { getAiConfigList, updateAiConfigById, testConnection } from "@/api/system/modelPage";

export default {
    name: 'VisualModel',
    data() {
        return {
            searchKeyword: '',
            activeModel: '',
            models: [],
            timeoutOptions: [
                { label: this.$t('textModel.seconds30') || '30秒', value: 30 },
                { label: this.$t('textModel.seconds60') || '1分钟', value: 60 },
                { label: this.$t('textModel.minutes2') || '2分钟', value: 120 },
                { label: this.$t('textModel.minutes5') || '5分钟', value: 300 }
            ]
        };
    },
    computed: {
        filteredModels() {
            if (!this.searchKeyword) {
                return this.models;
            }
            const keyword = this.searchKeyword.toLowerCase();
            return this.models.filter(model =>
                model.name.toLowerCase().includes(keyword) || model.label.toLowerCase().includes(keyword)
            );
        },
        currentModel() {
            return this.models.find(model => model.name === this.activeModel) || {};
        }
    },
    methods: {
        formatTimeout(seconds) {
            if (seconds >= 60) {
                return `${seconds / 60}${this.$t('textModel.minutes') || '分钟'}`;
            }
            return `${seconds}${this.$t('textModel.seconds') || '秒'}`;
        },
        setTimeout(value) {
            this.currentModel.timeout = value;
        },
        async init() {
            try {
                let params = {
                    aiType: '2'
                }
                let src = await getAiConfigList(params)
                this.models = []
                if (src && src.data) {
                    src.data.forEach(item => {
                        this.models.push({
                            id: item.id,
                            label: item.provider,
                            name: item.provider,
                            enabled: item.status == '1' ? true : false,
                            apiUrl: item.aiAddress,
                            accuracy: item.accuracy,
                            timeout: item.timeout || 30
                        })
                    })
                    const activeItem = src.data.find(item => item.status == '1');
                    if (activeItem) {
                        this.activeModel = activeItem.provider;
                    } else if (this.models.length > 0) {
                        this.activeModel = this.models[0].name;
                    }
                }
            } catch (e) {
                console.error(e);
            }
        },
        async handleMenuSelect(val) {
            this.activeModel = val;
            const selectedModel = this.models.find(m => m.name === val);
            if (selectedModel && !selectedModel.enabled) {
                this.models.forEach(m => m.enabled = false);
                selectedModel.enabled = true;
                // await onOffAiConfig(selectedModel.id);
            }
        },
        handleModelSwitch(model) {
            if (model.enabled) {
                this.models.forEach(m => {
                    if (m.id !== model.id) {
                        m.enabled = false;
                    }
                });
            } else {
                model.enabled = true;
            }
        },
        async handleTest() {
            const loadingInstance = this.$loading({
                lock: true,
                text: this.$t('textModel.testingConnection') || '正在测试连接...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            try {
                const model = {
                    id: this.currentModel.id,
                    provider: this.currentModel.name,
                    enabled: this.currentModel.enabled,
                    aiAddress: this.currentModel.apiUrl,
                    accuracy: this.currentModel.accuracy,
                    timeOut: this.currentModel.timeout,
                    aiType: '2',
                }
                const response = await testConnection(model);
                if (response && response.code === 200) {
                    this.$message.success(this.$t('textModel.connectionSuccess') || '连接测试成功');
                } else {
                    const errorMsg = response.message || this.$t('textModel.connectionFailed') || '连接测试失败';
                    this.$message.error(errorMsg);
                }
            } catch (error) {
                console.error('测试连接出错:', error);
                this.$message.error((this.$t('textModel.connectionFailed') || '连接测试失败：') + (error.message || this.$t('textModel.unknownError') || '未知错误'));
            } finally {
                loadingInstance.close();
            }
        },
        async handleSave() {
            let response = {
                id: this.currentModel.id,
                aiAddress: this.currentModel.apiUrl,
                accuracy: this.currentModel.accuracy,
                timeOut: this.currentModel.timeout,
                aiType: '2',
            }
            try {
                await updateAiConfigById(response)
                this.init()
                this.$message.success(this.$t('textModel.saveSuccess') || '配置保存成功');
            } catch (error) {
                console.error(error);
                this.$message.error(this.$t('textModel.saveFailed') || '保存失败');
            }
        }
    },
    created() {
        this.init();
    }
};
</script>

<style scoped>
.left-sidebar-card {
    width: 100%;
    border-radius: 10px;
    height: 100%;
    display: flex;
    flex-direction: column;

    .el-card__body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 0;
    }
}

.right-content-card {
    flex: 1;
    border-radius: 10px;
    height: 100%;
    display: flex;
    flex-direction: column;

    .el-card__body {
        height: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 0;
    }
}

.left-sidebar {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

.model-menu {
    border-right: none;
    flex: 1;
    overflow-y: auto;
}

.el-menu-item {
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 50px;
}

.right-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    position: relative;
    height: 100%;
    box-sizing: border-box;
}

.content-header {
    display: flex;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #e6e6e6;
    margin-bottom: 20px;
}

.content-header i {
    margin-right: 8px;
    color: #409EFF;
}

.content-header span {
    font-size: 16px;
    font-weight: 500;
}

.config-form {
    margin-top: 20px;
    max-width: 100%;
}

.slider-container {
    display: flex;
    align-items: center;
    width: 100%;
}

.slider-value {
    margin-left: 15px;
    min-width: 60px;
    text-align: center;
}

.timeout-buttons {
    margin-top: 10px;
    display: flex;
    gap: 8px;
}

.custom-radio-group .el-radio-button {
    margin-right: 15px;
}

/deep/ .custom-radio-group .el-radio-button__inner {
    border: 1px solid #dcdfe6;
    border-radius: 4px !important;
    box-shadow: none !important;
    padding: 9px 20px;
    color: #606266;
}

/deep/ .custom-radio-group .el-radio-button.is-active .el-radio-button__inner {
    border-color: #409EFF;
    color: #409EFF;
    background-color: #fff;
}

/deep/ .custom-radio-group .el-radio-button.is-disabled .el-radio-button__inner {
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #c0c4cc;
}

/deep/.el-switch__label * {
    line-height: 2;
    font-size: 12px;
}

/deep/.slider-container .el-slider__bar {
    background-color: #dfe4ed;
}

/deep/.slider-container .timeout .el-slider__button {
    border: solid 2px #ff4949;
    background-color: #ff4949;
}

/deep/.inner-text-switch .el-switch__label.el-switch__label--left {
    position: absolute;
    left: 8px;
    top: -2px;
    width: 100%;
    height: 100%;
    color: #bdb5b5;
    text-align: center;
    z-index: 1;
    transition: opacity 0.3s;
}

/deep/.inner-text-switch .el-switch__core {
    width: 45px !important;
}

/deep/.inner-text-switch .el-switch__label.el-switch__label--right {
    position: absolute;
    left: -18px;
    top: -2px;
    width: 100%;
    height: 100%;
    color: #fff;
    text-align: center;
    z-index: 1;
    transition: opacity 0.3s;
}

/deep/.el-switch__label {
    display: none;
}

/deep/.el-switch__label.is-active {
    display: block;
}

.el-switch__core {
    background-color: rgba(166, 166, 166, 1);
}

.model-menu .el-switch__label {
    position: absolute;
    display: none;
    color: #fff;
}

.model-menu .el-switch__label--left {
    z-index: 9;
    left: 20px;
}

.model-menu .el-switch__label--right {
    z-index: 9;
    left: 4px;
}

.model-menu .el-switch__label.is-active {
    display: block;
}

.model-menu .el-switch .el-switch__core,
.el-switch .el-switch__label {
    width: 60px !important;
}

::v-deep .el-row {
    display: flex;
    align-items: stretch;
    flex: 1;
    overflow: hidden;
}

::v-deep .el-col {
    display: flex;
    flex-direction: column;
    max-height: 100%;
    overflow: hidden;
}

.button-container {
    position: absolute;
    right: 20px;
    bottom: 20px;
    display: flex;
    justify-content: flex-end;
    padding-top: 15px;
    background: linear-gradient(transparent, #fff 20%);
}
</style>
