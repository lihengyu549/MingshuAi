<template>
    <el-drawer title="API接口文档" :visible="visible" :size="'100%'" :with-header="true" @close="handleClose">
        <div class="api-document-container">
            <!-- 左侧API列表 -->
            <div class="api-list-container">
                <el-menu :default-active="activeApiIndex" class="api-menu" @select="handleApiSelect">
                    <el-menu-item v-for="(api, index) in apiData" :key="index" :index="index.toString()">
                        <el-tag :type="api.method == 'POST' ? 'success' : api.method == 'GET' ? 'primary' : api.method == 'PUT' ? 'warning' : api.method == 'DELETE' ? 'danger' : 'info'" style="margin-right: 10px;">{{ api.method }}</el-tag>
                        <span class="api-name">{{ api.name }}</span>
                    </el-menu-item>
                </el-menu>
            </div>

            <!-- 右侧API详情 -->
            <div class="api-detail-container">
                <div v-if="currentApi" class="api-detail-content">
                    <!-- API基本信息 -->
                    <div class="api-basic-info">
                        <h2>{{ currentApi.name }}</h2>
                        <div class="api-request-info">
                            <el-tag :type="currentApi.method == 'POST' ? 'success' : currentApi.method == 'GET' ? 'primary' : currentApi.method == 'PUT' ? 'warning' : currentApi.method == 'DELETE' ? 'danger' : 'info'" style="margin-right: 10px;">{{ currentApi.method }}</el-tag>
                            <span class="request-url">{{ currentApi.url }}</span>
                            <span class="request-type" v-if="currentApi.dataType">数据类型: {{ currentApi.dataType }}</span>
                        </div>
                    </div>

                    <!-- 请求参数 -->
                    <el-card class="api-section">
                        <div slot="header">
                            <h3>请求参数</h3>
                        </div>
                        <!-- Header参数 -->
                        <div class="param-section">
                            <h4>Header参数</h4>
                            <template v-if="currentApi.params.header.length">
                                <el-table :data="currentApi.params.header" border size="small" class="api-params-table">
                                    <el-table-column prop="name" label="参数名" width="150"></el-table-column>
                                    <el-table-column prop="type" label="类型" width="100"></el-table-column>
                                    <el-table-column prop="required" label="必填" width="80">
                                        <template slot-scope="scope">{{ scope.row.required ? '是' : '否' }}</template>
                                    </el-table-column>
                                    <el-table-column prop="description" label="说明"></el-table-column>
                                </el-table>
                            </template>
                            <template v-else>
                                <p class="empty-text">无Header参数</p>
                            </template>
                        </div>
                        <!-- Body参数 -->
                        <div class="param-section">
                            <h4>Body参数</h4>
                            <template v-if="currentApi.params.body.length">
                                <el-table :data="currentApi.params.body" border size="small" class="api-params-table">
                                    <el-table-column prop="name" label="参数名" width="150"></el-table-column>
                                    <el-table-column prop="type" label="类型" width="100"></el-table-column>
                                    <el-table-column prop="required" label="必填" width="80">
                                        <template slot-scope="scope">{{ scope.row.required ? '是' : '否' }}</template>
                                    </el-table-column>
                                    <el-table-column prop="description" label="说明"></el-table-column>
                                </el-table>
                                <span class="body-data-type-tag" v-if="currentApi.dataType">请求数据类型: {{
                                    currentApi.dataType }}</span>
                            </template>
                            <template v-else>
                                <p class="empty-text">无Body参数</p>
                            </template>
                        </div>
                    </el-card>

                    <!-- 请求示例 -->
                    <el-card class="api-section">
                        <div slot="header">
                            <h3>请求示例</h3>
                        </div>
                        <template v-if="currentApi.requestExample">
                            <pre class="code-block"><code>{{ currentApi.requestExample }}</code></pre>
                        </template>
                        <template v-else>
                            <p class="empty-text">无请求示例</p>
                        </template>
                    </el-card>

                    <!-- 响应示例 -->
                    <el-card class="api-section">
                        <div slot="header">
                            <h3>响应示例</h3>
                        </div>
                        <template v-if="currentApi.responseExample">
                            <pre class="code-block"><code>{{ currentApi.responseExample }}</code></pre>
                        </template>
                        <template v-else>
                            <p class="empty-text">无响应示例</p>
                        </template>
                    </el-card>

                    <!-- 响应数据结构 -->
                    <el-card class="api-section">
                        <div slot="header">
                            <h3>响应数据结构</h3>
                        </div>
                        <template v-if="currentApi.responseStructure.length">
                            <el-table :data="currentApi.responseStructure" border size="small" class="api-params-table">
                                <el-table-column prop="field" label="字段名" width="180"></el-table-column>
                                <el-table-column prop="type" label="类型" width="100"></el-table-column>
                                <el-table-column prop="description" label="说明"></el-table-column>
                            </el-table>
                        </template>
                        <template v-else>
                            <p class="empty-text">无响应数据结构说明</p>
                        </template>
                    </el-card>
                </div>
                <div v-else class="api-empty-state">
                    请选择一个API接口查看详情
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script>
export default {
    name: 'ApiDocumentDrawer',
    props: {
        // 接收的md文件解析后的数据
        apiData: {
            type: Array,
            required: true,
            default: () => []
        },
        // 控制抽屉显示/隐藏
        visible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            activeApiIndex: '0', // 当前选中的API索引
            currentApi: null // 当前展示的API详情
        };
    },
    watch: {
        // 当apiData变化时，初始化显示第一个API
        apiData: {
            immediate: true,
            handler() {
                if (this.apiData && this.apiData.length > 0) {
                    this.currentApi = this.apiData[0];
                }
            }
        },
        // 当visible变化时，如果显示则选中第一个API
        visible(val) {
            if (val && this.apiData && this.apiData.length > 0) {
                this.activeApiIndex = '0';
                this.currentApi = this.apiData[0];
            }
        }
    },
    methods: {
        // 处理API选择
        handleApiSelect(index) {
            this.activeApiIndex = index;
            this.currentApi = this.apiData[index];
        },
        // 处理抽屉关闭
        handleClose() {
            this.$emit('update:visible', false);
        },
        // 根据请求方法获取对应的样式类
        getMethodClass(method) {
            switch (method.toUpperCase()) {
                case 'GET':
                    return 'method-get';
                case 'POST':
                    return 'method-post';
                case 'PUT':
                    return 'method-put';
                case 'DELETE':
                    return 'method-delete';
                default:
                    return 'method-default';
            }
        }
    }
};
</script>

<style scoped>
.api-document-container {
    display: flex;
    height: calc(100vh - 80px);
    overflow: hidden;
}

/* 左侧列表样式 */
.api-list-container {
    width: 280px;
    border-right: 1px solid #e6e6e6;
    height: 100%;
    overflow-y: auto;
}

.api-menu {
    border-right: none;
    height: 100%;
}

.api-menu.el-menu-item {
    padding: 0 15px;
    height: 60px;
    line-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.api-method {
    display: inline-block;
    width: 50px;
    text-align: center;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
    padding: 2px 0;
    margin-right: 10px;
}

/* 右侧详情样式 */
.api-detail-container {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    height: 100%;
}

.api-detail-content {
    max-width: 1000px;
    margin: 0 auto;
}

.api-basic-info h2 {
    margin-bottom: 15px;
    color: #333;
}

.api-request-info {
    margin-bottom: 30px;
    padding: 10px 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
}


.request-url {
    color: #1890ff;
    word-break: break-all;
    margin-right: 15px;
}

.request-type {
    color: #666;
    font-size: 14px;
}

.api-section {
    margin-bottom: 20px;
}

.api-section.el-card__header {
    padding: 10px 15px;
    border-bottom: 1px solid #e8e8e8;
}

.api-section h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
    font-weight: 500;
}

.api-section h4 {
    font-size: 14px;
    color: #666;
    margin: 15px 0 10px;
}

.api-params-table {
    margin-bottom: 15px;
}

.code-block {
    background-color: #f5f5f5;
    border-radius: 4px;
    padding: 15px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
}

.api-empty-state {
    text-align: center;
    padding: 50px 0;
    color: #999;
    font-size: 16px;
}

/* 请求方法样式 */
.method-get {
    background-color: #52c41a;
}

.method-post {
    background-color: #1890ff;
}

.method-put {
    background-color: #faad14;
}

.method-delete {
    background-color: #ff4d4f;
}

.method-default {
    background-color: #777;
}

.body-data-type-tag {
    display: block;
    margin-top: 10px;
    font-size: 14px;
    color: #666;
}

/* 新增/调整样式 */
.param-section {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #eee;
}

.param-section:last-child {
    border-bottom: none;
}

.empty-text {
    color: #999;
    padding: 10px 0;
    margin: 0;
}

.api-method {
    width: 55px;
    /* 调整方法标签宽度，避免文字溢出 */
}

.api-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    /* 让名称占满剩余空间 */
}

.api-menu .el-menu-item {
    display: flex;
    align-items: center;
}

.code-block {
    background-color: #f5f5f5;
    border-radius: 4px;
    padding: 15px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    font-family: monospace;
    /* 确保JSON格式显示正确 */
}
</style>