<template>
    <div class="model-config-page">
        <!-- 页面标题区域 -->
        <div class="page-header">
            <h2 style="padding-top: 10px;">模型配置</h2>
        </div>

        <div class="model-config-container">
            <!-- 左侧菜单区域 -->
            <div class="left-sidebar">
                <!-- 搜索框 -->
                <div style="padding: 5%;">
                    <el-input placeholder="搜索模型..." v-model="searchKeyword" clearable class="search-input">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>

                <!-- 菜单列表 -->
                <el-menu :default-active="activeModel" class="model-menu" background-color="#fff" text-color="#333"
                    active-text-color="#409EFF" @select="handleMenuSelect">
                    <el-menu-item v-for="model in filteredModels" :key="model.name" :index="model.name"
                        :style="{ backgroundColor: activeModel === model.id ? '#eaf1ff' : '' }">
                        <svg-icon
                            :icon-class="model.label == 'Ollama' ? 'robDog' : model.label == '阿里云百炼' ? 'alybl' : 'deepseek'"
                            style="margin-right: 10px;"></svg-icon>
                        <span>{{ model.label }}</span>{{ model.enabled }}
                        <!-- 左侧菜单开关 - 调整为内部显示ON/OFF -->
                        <el-switch v-model="model.enabled" active-color="#13ce66" inactive-color="#e9ecef"
                            active-text="ON" inactive-text="OFF" class="inner-text-switch" style="margin-left: auto;"
                            @change="handleModelSwitch(model)" :disabled="model.enabled"></el-switch>
                    </el-menu-item>
                </el-menu>
            </div>

            <!-- 右侧内容区域 -->
            <div class="right-content">
                <div class="content-header">
                    <i class="el-icon-menu"></i>
                    <span>{{ currentModel.label || '请选择模型' }}</span>
                    <!-- 右侧主开关 - 调整为内部显示ON/OFF -->
                    <el-switch v-model="currentModel.enabled" active-color="#13ce66" inactive-color="#e9ecef"
                        class="inner-text-switch" style="margin-left: auto;"
                        @change="handleMainSwitchChange"></el-switch>
                </div>

                <!-- 表单内容 -->
                <el-form label-width="100px" class="config-form" :disabled="!currentModel.enabled">
                    <el-form-item label="接口地址">
                        <el-input v-model="currentModel.apiUrl" placeholder="请输入接口地址" style="width: 100%;"></el-input>
                    </el-form-item>
                    <el-form-item v-if="currentModel.name == 'aliyun' || currentModel.name == 'deepseek'" label="API密钥">
                        <el-input v-model="currentModel.apiKey" placeholder="请输入API密钥" type="password"
                            style="width: 100%;"></el-input>
                    </el-form-item>

                    <el-form-item label="模型名称">
                        <el-select v-model="currentModel.modelName" placeholder="请选择模型" style="width: 70%;">
                            <el-option v-for="item in currentModel.availableModels" :key="item.value"
                                :label="item.label" :value="item.value"></el-option>
                        </el-select>
                        <el-button type="primary" style="margin-left: 10px;" @click="refreshModelList(currentModel.id)">
                            刷新模型列表
                        </el-button>
                    </el-form-item>

                    <el-form-item v-if="currentModel.name == 'ollama'" label="模型特性">
                        <el-switch v-model="currentModel.thinkingMode" active-color="#13ce66" class="model-switch"
                            inactive-color="#e9ecef" active-text="深度思考" style="margin-left: auto;"></el-switch>
                        <el-tooltip content="深度思考模式让模型在回答前进行推理分析，提供更详细的思考过程" placement="top"
                            transition="el-fade-in-linear">
                            <svg-icon icon-class="bulb" style="margin-left: 10px;"></svg-icon>
                        </el-tooltip>
                    </el-form-item>

                    <el-form-item label="模型温度">
                        <div class="slider-container">
                            <el-slider v-model="currentModel.temperature" :max="1" :min="0" :step="0.1" show-tooltip
                                style="flex: 1;" class="temperature"></el-slider>
                            <!-- .toFixed(1) -->
                            <span class="slider-value">{{ currentModel.temperature }}</span>
                            <el-tooltip content="控制模型输出的随机性和创造性。较低的值（0.1-0.3）产生更确定性的回答，较高的值（0.7-1.0）产生更创造性的回答"
                                placement="top" transition="el-fade-in-linear">
                                <svg-icon icon-class="bulb" style="margin-left: 10px;"></svg-icon>
                            </el-tooltip>
                        </div>
                    </el-form-item>

                    <el-form-item label="请求超时">
                        <div class="slider-container">
                            <el-slider v-model="currentModel.timeout" :max="300" :min="30" :step="30" show-tooltip
                                style="flex: 1;" class="timeout"></el-slider>
                            <span class="slider-value">
                                {{ formatTimeout(currentModel.timeout) }}
                            </span>
                            <el-tooltip content="设置API请求的最大等待时间。如果请求超过此时间仍未响应，将自动中断连接。建议根据网络环境和任务复杂度调整" placement="top"
                                transition="el-fade-in-linear">
                                <svg-icon icon-class="bulb" style="margin-left: 10px;"></svg-icon>
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

                    <el-form-item>
                        <el-button type="primary" @click="handleTest" :disabled="!currentModel.enabled">
                            测试连接
                        </el-button>
                        <el-button type="success" style="margin-left: 10px;" @click="handleSave">
                            保存配置
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
import { getAiConfigList, getAiConfigById, onOffAiConfig, updateAiConfigById, getAiModelList, testConnection } from "@/api/system/modelPage";
export default {
    name: 'ModelConfig',
    data() {
        return {
            // 搜索关键词
            searchKeyword: '',
            // 当前激活的模型ID
            activeModel: '',
            // 模型列表数据
            models: [
            ],
            // 超时选项
            timeoutOptions: [
                { label: '30秒', value: 30 },
                { label: '60秒', value: 60 },
                { label: '2分钟', value: 120 },
                { label: '5分钟', value: 300 }
            ]
        };
    },
    computed: {
        // 过滤后的模型列表
        filteredModels() {
            if (!this.searchKeyword) {
                return this.models;
            }
            const keyword = this.searchKeyword.toLowerCase();
            return this.models.filter(model =>
                model.name.toLowerCase().includes(keyword)
            );
        },
        // 当前选中的模型
        currentModel() {
            return this.models.find(model => model.name === this.activeModel) || {};
        }
    },
    methods: {
        // 初始化
        async init() {
            // 初始化当前模型的列表
            let src = await getAiConfigList()
            this.models = []
            src.data.forEach(item => {
                this.models.push({
                    id: item.id,
                    label: item.label,
                    name: item.provider,
                    enabled: item.status == '1' ? true : false,
                    apiUrl: item.aiAddress,
                    apiKey: item.apiKey,
                    thinkingMode: item.thinkingMode,
                    modelName: item.modelName,
                    availableModels: [],
                    temperature: item.temperature,
                    timeout: item.timeOut,
                })
            })
            this.activeModel = src.data.find(item => item.status == '1').provider
        },
        // 处理菜单选择
        async handleMenuSelect(val) {
            let id = this.models.find(model => model.name === val).id
            let src = await getAiConfigById(id)
            const models = this.models.find(item => item.name == val);
            if (models) {
                Object.assign(models, {
                    id: src.data.id,
                    label: src.data.label,
                    name: src.data.provider,
                    // enabled: src.data.status == '1' ? true : false,
                    apiUrl: src.data.aiAddress,
                    apiKey: src.data.apiKey,
                    thinkingMode: src.data.thinkingMode,
                    modelName: src.data.modelName,
                    availableModels: src.data.availableModels,
                    temperature: src.data.temperature,
                    timeout: src.data.timeOut
                });
            }
            this.activeModel = val;
        },
        // 处理模型开关变化
        async handleModelSwitch(model) {
            if (model.enabled) {
                // 请求接口
                let src = await onOffAiConfig(model.id)
                this.init()
                // 当当前模型开关开启时，关闭其他模型的开关
                // this.models.forEach(m => {
                //     if (m.id !== model.id) {
                //         m.enabled = false;
                //     }
                // });
            } else {
                // 阻止关闭已开启的开关
                model.enabled = true;
            }
        },
        // 处理主开关变化
        handleMainSwitchChange(enabled) {
            this.currentModel.enabled = enabled;
        },
        // 刷新模型列表
        async refreshModelList(id) {
            // 显示加载提示
            const loadingInstance = this.$loading({
                lock: true,
                text: '正在刷新模型列表...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            try {
                // 调用API获取模型列表
                const response = await getAiModelList(id);
                // 假设接口返回格式为 { data: [{name: "模型名称", value: "模型值"}, ...] }
                if (response && response.data && Array.isArray(response.data)) {
                    // 处理接口返回的模型列表
                    const modelList = response.data.map(item => ({
                        label: item.name || item.modelName || item.label, // 根据实际字段调整
                        value: item.value || item.modelId || item.id      // 根据实际字段调整
                    }));

                    // 更新当前模型的可用模型列表
                    this.currentModel.availableModels = modelList;

                    // 如果有可用模型，默认选择第一个
                    if (modelList.length > 0) {
                        this.currentModel.selectedModel = modelList[0].value;
                    }

                    this.$message.success('模型列表刷新成功');
                } else {
                    this.$message.warning('获取模型列表失败：返回数据格式不正确');
                }
            } catch (error) {
                console.error('刷新模型列表出错:', error);
                this.$message.error('刷新模型列表失败：' + (error.message || '未知错误'));
            } finally {
                // 无论请求成功或失败，都关闭加载提示
                loadingInstance.close();
            }
        },
        // 格式化超时显示
        formatTimeout(seconds) {
            if (seconds >= 60) {
                return `${seconds / 60}分钟`;
            }
            return `${seconds}秒`;
        },
        // 设置超时时间
        setTimeout(value) {
            this.currentModel.timeout = value;
        },
        // 测试连接
        async handleTest() {
            // 创建加载实例并保存
            const loadingInstance = this.$loading({
                lock: true,
                text: '正在测试连接...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            try {
                // 调用测试连接接口

                const model = {
                    id: this.currentModel.id,
                    provider: this.currentModel.label,
                    name: this.currentModel.provider,
                    enabled: this.currentModel.enabled,
                    aiAddress: this.currentModel.apiUrl,
                    apiKey: this.currentModel.apiKey,
                    thinkingMode: this.currentModel.thinkingMode,
                    modelName: this.currentModel.modelName,
                    availableModels: this.currentModel.availableModels,
                    temperature: this.currentModel.temperature,
                    timeOut: this.currentModel.timeout
                }
                const response = await testConnection(model);

                // 根据接口返回的状态码判断连接是否成功
                if (response && response.code === 200) { // 假设成功状态码为200
                    this.$message.success('连接测试成功');
                } else {
                    // 连接失败，显示错误信息
                    const errorMsg = response.message || '连接测试失败';
                    this.$message.error(errorMsg);
                }
            } catch (error) {
                // 处理异常情况
                console.error('测试连接出错:', error);
                this.$message.error('连接测试失败：' + (error.message || '未知错误'));
            } finally {
                // 无论连接成功或失败，都关闭加载提示
                loadingInstance.close();
            }
        },
        // 保存配置
        async handleSave() {//分钟转化为秒
            await updateAiConfigById(this.currentModel)
            this.$message.success('配置保存成功');
        }
    },
    async created() {
        this.init()
    },
    mounted() {
    }
};
</script>

<style scoped>
/* 样式部分保持不变 */
.model-config-page {
    padding: 20px;
    background-color: #f5f7fa;
    height: 100vh;
    box-sizing: border-box;
}

.page-header {
    margin-bottom: 20px;
}

.page-header h2 {
    font-size: 18px;
    color: #333;
    margin: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #e6e6e6;
}

.model-config-container {
    display: flex;
    height: calc(100% - 40px);
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.left-sidebar {
    width: 260px;
    border-right: 1px solid #e6e6e6;
    display: flex;
    flex-direction: column;
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


/deep/.inner-text-switch .el-switch__label.el-switch__label--left {
    position: absolute;
    left: 8px;
    width: 100%;
    height: 100%;
    font-size: 14px;
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
    width: 100%;
    height: 100%;
    font-size: 14px;
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

/deep/.model-switch .el-switch__label {
    display: block;
}

/deep/.slider-container .el-slider__bar {
    background-color: #dfe4ed;
}

/deep/.slider-container .temperature .el-slider__button {
    border: solid 2px #1890ff;
    background-color: #1890ff;
}

/deep/.slider-container .timeout .el-slider__button {
    border: solid 2px #ff4949;
    background-color: #ff4949;
}


.model-menu .el-switch__label {
    position: absolute;
    display: none;
    color: #fff;
}

.el-switch__core {
    background-color: rgba(166, 166, 166, 1);
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
</style>