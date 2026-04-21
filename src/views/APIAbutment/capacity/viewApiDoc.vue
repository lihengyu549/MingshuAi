<template>
    <el-drawer :title="$t('capacity.apiDocument')" :visible="visible" size="100%" :with-header="true"
        @close="handleClose">
        <div class="api-document-container">
            <div class="api-list-container">
                <el-menu :default-active="activeApiIndex" class="api-menu" @select="handleApiSelect">
                    <el-menu-item v-for="(api, index) in apiData" :key="index" :index="index.toString()">
                        <el-tag :type="getMethodTagType(api.method)" style="margin-right: 10px;">{{ api.method
                        }}</el-tag>
                        <span class="api-name">{{ api.name }}</span>
                    </el-menu-item>
                </el-menu>
            </div>

            <div class="api-detail-container">
                <div v-if="currentApi" class="api-detail-content">
                    <div class="api-basic-info">
                        <h2>{{ currentApi.name }}</h2>
                        <div class="api-request-info">
                            <el-tag :type="getMethodTagType(currentApi.method)" style="margin-right: 10px;">
                                {{ currentApi.method }}
                            </el-tag>
                            <span class="request-url">{{ currentApi.url }}</span>
                        </div>
                    </div>

                    <el-card class="api-section">
                        <div slot="header">
                            <h3>{{ $t('capacity.requestParams') }}</h3>
                        </div>
                        <div v-if="currentApi.params.path.length > 0" class="param-section">
                            <h4>{{ $t('capacity.pathParams') }}</h4>
                            <el-table :data="currentApi.params.path" border size="small" class="api-params-table">
                                <el-table-column prop="name" :label="$t('capacity.paramName')"
                                    width="150"></el-table-column>
                                <el-table-column prop="type" :label="$t('type')" width="100"></el-table-column>
                                <el-table-column prop="required" :label="$t('required')" width="80">
                                    <template slot-scope="scope">{{ scope.row.required ? $t('yes') : $t('no')
                                    }}</template>
                                </el-table-column>
                                <el-table-column prop="description" :label="$t('description')"></el-table-column>
                            </el-table>
                        </div>
                        <div v-else-if="currentApi.params.query.length > 0" class="param-section">
                            <h4>{{ $t('capacity.queryParams') }}</h4>
                            <el-table :data="currentApi.params.query" border size="small" class="api-params-table">
                                <el-table-column prop="name" :label="$t('capacity.paramName')"
                                    width="150"></el-table-column>
                                <el-table-column prop="type" :label="$t('type')" width="100"></el-table-column>
                                <el-table-column prop="required" :label="$t('required')" width="80">
                                    <template slot-scope="scope">{{ scope.row.required ? $t('yes') : $t('no')
                                    }}</template>
                                </el-table-column>
                                <el-table-column prop="description" :label="$t('description')"></el-table-column>
                            </el-table>
                        </div>

                        <div class="param-section">
                            <h4>{{ $t('capacity.headerParams') }}</h4>
                            <template v-if="currentApi.params.header.length">
                                <el-table :data="currentApi.params.header" border size="small" class="api-params-table">
                                    <el-table-column prop="name" :label="$t('capacity.paramName')"
                                        width="150"></el-table-column>
                                    <el-table-column prop="type" :label="$t('type')" width="100"></el-table-column>
                                    <el-table-column prop="required" :label="$t('required')" width="80">
                                        <template slot-scope="scope">{{ scope.row.required ? $t('yes') : $t('no')
                                        }}</template>
                                    </el-table-column>
                                    <el-table-column prop="description" :label="$t('description')"></el-table-column>
                                </el-table>
                            </template>
                            <template v-else>
                                <p class="empty-text">{{ $t('capacity.noHeaderParams') }}</p>
                            </template>
                        </div>

                        <div class="param-section">
                            <h4>{{ $t('capacity.bodyParams') }}</h4>
                            <template v-if="currentApi.params.body.length">
                                <el-table :data="currentApi.params.body" border size="small" class="api-params-table">
                                    <el-table-column prop="name" :label="$t('capacity.paramName')"
                                        width="150"></el-table-column>
                                    <el-table-column prop="type" :label="$t('type')" width="100"></el-table-column>
                                    <el-table-column prop="required" :label="$t('required')" width="80">
                                        <template slot-scope="scope">{{ scope.row.required ? $t('yes') : $t('no')
                                        }}</template>
                                    </el-table-column>
                                    <el-table-column prop="description" :label="$t('description')"></el-table-column>
                                </el-table>

                                <span v-if="currentApi.dataType" class="body-data-type-tag">
                                    {{ $t('capacity.requestDataType') }}: {{ currentApi.dataType }}
                                </span>
                            </template>
                            <template v-else>
                                <p class="empty-text">{{ $t('capacity.noBodyParams') }}</p>
                            </template>
                        </div>
                    </el-card>

                    <el-card class="api-section">
                        <div slot="header">
                            <h3>{{ $t('capacity.requestExample') }}</h3>
                        </div>
                        <template v-if="currentApi.requestExample">
                            <pre class="code-block"><code>{{ currentApi.requestExample }}</code></pre>
                        </template>
                        <template v-else>
                            <p class="empty-text">{{ $t('capacity.noRequestExample') }}</p>
                        </template>
                    </el-card>

                    <el-card class="api-section">
                        <div slot="header">
                            <h3>{{ $t('capacity.responseExample') }}</h3>
                        </div>
                        <template v-if="currentApi.responseExample">
                            <pre class="code-block"><code>{{ currentApi.responseExample }}</code></pre>
                        </template>
                        <template v-else>
                            <p class="empty-text">{{ $t('capacity.noResponseExample') }}</p>
                        </template>
                    </el-card>

                    <el-card class="api-section">
                        <div slot="header">
                            <h3>{{ $t('capacity.responseDataStructure') }}</h3>
                        </div>
                        <template v-if="currentApi.responseStructure.length">
                            <el-table :data="currentApi.responseStructure" border size="small" class="api-params-table">
                                <el-table-column prop="field" :label="$t('capacity.paramName')"
                                    width="120"></el-table-column>
                                <el-table-column prop="type" :label="$t('type')" width="100"></el-table-column>
                                <el-table-column prop="required" :label="$t('required')" width="80">
                                    <template slot-scope="scope">{{ scope.row.required ? $t('yes') : $t('no')
                                    }}</template>
                                </el-table-column>
                                <el-table-column prop="constraint" :label="$t('capacity.constraint')"
                                    width="100"></el-table-column>
                                <el-table-column prop="chineseName" :label="$t('capacity.chineseName')"
                                    width="120"></el-table-column>
                                <el-table-column prop="description" :label="$t('description')"></el-table-column>
                            </el-table>
                        </template>
                        <template v-else>
                            <p class="empty-text">{{ $t('capacity.noResponseDataStructure') }}</p>
                        </template>
                    </el-card>
                </div>
                <div v-else class="api-empty-state">
                    {{ $t('capacity.pleaseSelectApi') }}
                </div>
            </div>
        </div>
    </el-drawer>
</template>

<script>
export default {
    name: 'ApiDocumentDrawer',
    props: {
        apiData: {
            type: Array,
            required: true,
            default: () => []
        },
        visible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            activeApiIndex: '0',
            currentApi: null
        };
    },
    watch: {
        apiData: {
            immediate: true,
            handler() {
                if (this.apiData && this.apiData.length > 0) {
                    this.currentApi = this.apiData[0];
                }
            }
        },
        visible(val) {
            if (val && this.apiData && this.apiData.length > 0) {
                this.activeApiIndex = '0';
                this.currentApi = this.apiData[0];
            }
        }
    },
    methods: {
        handleApiSelect(index) {
            this.activeApiIndex = index;
            this.currentApi = this.apiData[index];
        },
        handleClose() {
            this.$emit('update:visible', false);
        },
        getMethodTagType(method) {
            switch ((method || '').toUpperCase()) {
                case 'POST':
                    return 'success';
                case 'GET':
                    return 'primary';
                case 'PUT':
                    return 'warning';
                case 'DELETE':
                    return 'danger';
                default:
                    return 'info';
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

.api-list-container {
    width: 280px;
    border-right: 1px solid #e6e6e6;
    height: 100%;
    overflow-y: auto;
    padding: 10px;
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
    color: #3b82f6;
    word-break: break-all;
    margin-right: 15px;
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
    font-family: monospace;
}

.api-empty-state {
    text-align: center;
    padding: 50px 0;
    color: #999;
    font-size: 16px;
}

.body-data-type-tag {
    display: block;
    margin-top: 10px;
    font-size: 14px;
    color: #666;
}

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

.api-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    font-weight: 500;
}

.api-menu .el-menu-item {
    display: flex;
    align-items: center;
    border-radius: 10px;
}

/deep/.el-drawer__header {
    padding-bottom: 20px;
    margin-bottom: 0;
    background-color: rgb(230, 242, 255);
}

/deep/.el-drawer__header> :first-child {
    font-size: 18px;
    color: black;
    font-weight: bold;
}
</style>
