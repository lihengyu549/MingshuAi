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
                            <span>{{ model.label }}</span>
                            <!-- 左侧菜单开关 - 调整为内部显示ON/OFF -->
                            <el-switch v-model="model.enabled" active-color="#13ce66" inactive-color="#e9ecef"
                                active-text="ON" inactive-text="OFF" class="inner-text-switch"
                                style="margin-left: auto;" @change="handleModelSwitch(model)"></el-switch>
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
                            <el-input v-model="currentModel.apiUrl" placeholder="请输入接口地址"
                                style="width: 100%;"></el-input>
                        </el-form-item>

                        <el-form-item v-if="currentModel.id == 'aliyun' || currentModel.id == 'deepseek'" label="API密钥">
                            <el-input v-model="currentModel.apiKey" placeholder="请输入API密钥" type="password"
                                style="width: 100%;"></el-input>
                        </el-form-item>

                        <el-form-item label="模型名称">
                            <el-select v-model="currentModel.modelName" placeholder="请选择模型" style="width: 70%;">
                                <el-option v-for="item in currentModel.availableModels" :key="item.value"
                                    :label="item.label" :value="item.value"></el-option>
                            </el-select>
                            <el-button type="primary" style="margin-left: 10px;" @click="refreshModelList">
                                刷新模型列表
                            </el-button>
                        </el-form-item>

                        <el-form-item v-if="currentModel.id == 'ollama'" label="模型特性">
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
                                <el-tooltip content="设置API请求的最大等待时间。如果请求超过此时间仍未响应，将自动中断连接。建议根据网络环境和任务复杂度调整"
                                    placement="top" transition="el-fade-in-linear">
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
import { getAiConfigList, getAiConfigById } from "@/api/system/modelPage";
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
                // {
                //     id: 'ollama',
                //     name: 'Ollama',
                //     enabled: true,
                //     apiUrl: 'http://localhost:11434/api/',
                //     apiKey: '',
                //     selectedModel: '',
                //     availableModels: [],
                //     temperature: 0.7,
                //     timeout: 60,
                //     teX: false
                // },
                // {
                //     id: 'aliyun',
                //     name: '阿里云百炼',
                //     enabled: false,
                //     apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/',
                //     apiKey: '',
                //     selectedModel: '',
                //     availableModels: [],
                //     temperature: 0.7,
                //     timeout: 120
                // },
                // {
                //     id: 'deepseek',
                //     name: 'Deepseek深度求索',
                //     enabled: false,
                //     apiUrl: 'https://api.deepseek.com/v1/',
                //     apiKey: '',
                //     selectedModel: '',
                //     availableModels: [],
                //     temperature: 0.7,
                //     timeout: 120
                // }
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
        // 处理菜单选择
        async handleMenuSelect(val) {
            let id = this.models.find(model => model.name === val).id
            let src = await getAiConfigById(id)
            console.log('src.data', src.data);
            const models = this.models.find(item => item.name == val);
            if (models) {
                Object.assign(models, {
                    id: src.data.id,
                    label: src.data.label,
                    name: src.data.provider,
                    enabled: src.data.status == '1',
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
        handleModelSwitch(model) {
            if (model.enabled) {
                // 当当前模型开关开启时，关闭其他模型的开关
                this.models.forEach(m => {
                    if (m.id !== model.id) {
                        m.enabled = false;
                    }
                });
            }
            // 更新当前模型的开关状态
            this.models.forEach(m => {
                if (m.id === model.id) {
                    m.enabled = model.enabled;
                }
            });
        },
        // 处理主开关变化
        handleMainSwitchChange(enabled) {
            this.currentModel.enabled = enabled;
        },
        // 刷新模型列表
        refreshModelList() {
            // 模拟API请求获取模型列表
            const loadingInstance = this.$loading({
                lock: true,
                text: '正在刷新模型列表...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            setTimeout(() => {
                // 根据不同模型返回不同的可用模型列表
                let modelList = [];
                switch (this.currentModel.id) {
                    case 'ollama':
                        modelList = [
                            { label: 'llama3', value: 'llama3' },
                            { label: 'gemma', value: 'gemma' },
                            { label: 'mistral', value: 'mistral' }
                        ];
                        break;
                    case 'aliyun':
                        modelList = [
                            { label: 'qwen-turbo', value: 'qwen-turbo' },
                            { label: 'qwen-plus', value: 'qwen-plus' }
                        ];
                        break;
                    case 'deepseek':
                        modelList = [
                            { label: 'deepseek-chat', value: 'deepseek-chat' },
                            { label: 'deepseek-coder', value: 'deepseek-coder' }
                        ];
                        break;
                }

                this.currentModel.availableModels = modelList;
                if (modelList.length > 0) {
                    this.currentModel.selectedModel = modelList[0].value;
                }
                this.$message.success('模型列表刷新成功');
                loadingInstance.close(); // 手动关闭加载提示
            }, 1000);
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
        handleTest() {
            // 创建加载实例并保存
            const loadingInstance = this.$loading({
                lock: true,
                text: '正在测试连接...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            setTimeout(() => {
                // 关闭加载实例
                loadingInstance.close();
                this.$message.success('连接测试成功');
            }, 1500);
        },
        // 保存配置
        handleSave() {//分钟转化为秒
            this.$message.success('配置保存成功');
        }
    },
    async created() {
        // 初始化当前模型的列表
        let src = await getAiConfigList()
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
    mounted() {
    }
};
</script>

<style scoped>
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