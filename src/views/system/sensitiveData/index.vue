<template>
    <div class="sensitive-data-risk-assessment">
        <!-- 页面标题与操作区 -->
        <div class="page-header">
            <h2><b>敏感数据安全风险评估报告</b></h2>
            <div class="header-operations">
                <!-- 所属标准下拉框 -->
                <label class="form-label">所属标准</label>
                <el-select v-model="selectedStandard" placeholder="所属标准" class="standard-select" size="small">
                    <el-option label="国标-GB-0197" value="gb0197"></el-option>
                    <el-option label="行业标准-HY-2023" value="hy2023"></el-option>
                    <el-option label="企业标准-QY-001" value="qy001"></el-option>
                    <el-option label="自定义标准" value="custom"></el-option>
                </el-select>

                <!-- 导出清单按钮 -->
                <el-button icon="el-icon-download" @click="handleExport" size="small" class="export-btn">
                    导出清单
                </el-button>
            </div>
        </div>

        <!-- 卡片容器 -->
        <div class="card-container">
            <!-- 卡片1：数据源列表 -->
            <el-card class="assessment-card data-source-card">
                <div slot="header" class="card-header">
                    <h3><svg-icon icon-class="databaseSolid" style="margin-right: 5px;" />数据源列表</h3>
                    <span class="card-header-span">共 {{ dataSourceList.length }} 条数据,点击查看详细数据分类和风险情况</span>
                </div>

                <!-- 数据源表格 -->
                <el-table :data="dataSourceList" stripe @row-click="handleDataSourceClick" style="width: 100%;"
                    size="small">
                    <el-table-column prop="name" align="center" label="数据源名称" min-width="200"></el-table-column>
                    <el-table-column prop="systemName" align="center" label="业务系统名称" min-width="200"></el-table-column>
                    <el-table-column prop="categoryCount" align="center" label="敏感分类数" width="100"></el-table-column>
                    <el-table-column align="center" label="风险统计" width="200">
                        <template slot-scope="scope">
                            <div class="risk-stats">
                                <span class="risk-level"
                                    :style="{ backgroundColor: getRiskColor(scope.row.highestRiskLevel) }">
                                    {{ scope.row.riskText }}
                                </span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="操作" width="100">
                        <template slot-scope="scope">
                            <el-button type="text" @click.stop="handleViewDetails(scope.row)" class="view-details-btn"
                                size="small">
                                查看详情
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>

            <!-- 卡片2：敏感数据安全风险清单（包含所有敏感信息） -->
            <el-card class="assessment-card risk-list-card" v-if="showRiskDetails">
                <div slot="header" class="card-header list-header">
                    <div>
                        <h3>敏感数据安全风险清单</h3>
                        <span class="card-header-span">数据源：{{ currentDataSource.name }}</span>
                    </div>
                    <el-button type="text" icon="el-icon-close" @click="showRiskDetails = false" class="close-btn"
                        size="mini"></el-button>
                </div>

                <!-- 筛选和搜索区域 -->
                <div class="filter-section">
                    <div class="filter-tags">
                        <el-tag v-for="tag in filterTags" :key="tag.value"
                            :class="{ 'active-tag': activeFilter === tag.value }" @click="handleFilter(tag.value)"
                            size="medium">
                            {{ tag.label }}
                        </el-tag>
                    </div>

                    <el-input placeholder="搜索数据分类..." v-model="searchKeyword" prefix-icon="el-icon-search"
                        class="category-search" @input="handleSearch" size="small"></el-input>
                </div>

                <!-- 敏感分类列表（包含所有分类，不再单独排除手机号信息） -->
                <div class="sensitive-categories">
                    <div class="category-item" v-for="category in filteredCategories" :key="category.id">
                        <div class="category-header">
                            <!-- 修改分类标题布局 -->
                            <div class="category-title-row">
                                <h2 class="full-path">{{ category.fullPath }}</h2>
                            </div>
                            <div class="category-tags-row">
                                <el-tag class="security-level"
                                    :style="{ backgroundColor: getRiskColor(category.securityLevel) }" size="mini">
                                    {{ category.securityLevelText }}
                                </el-tag>
                                <el-tag class="protection-status"
                                    :type="category.protectionStatus === '已防护' ? 'success' : 'warning'" size="mini">
                                    {{ category.protectionStatus }}
                                </el-tag>
                            </div>
                        </div>

                        <div class="category-description">
                            <strong>分类描述：</strong><br>
                            <span>{{ category.description }}</span>
                        </div>

                        <div class="legal-basis">
                            <strong>法规依据：</strong><br>
                            <span>{{ category.legalBasis }}</span>
                        </div>

                        <div class="database-filter">
                            <strong>涉及数据库：</strong><br>
                            <el-tag v-for="db in category.databases" :key="db.id" @click="handleDatabaseFilter(db.id)"
                                class="database-tag" size="mini">
                                {{ db.name }}
                            </el-tag>
                        </div>

                        <el-table :data="category.fields" style="width: 100%; margin-top: 10px;" size="mini">
                            <el-table-column prop="absolutePath" align="center" label="数据表名称" min-width="220"></el-table-column>
                            <el-table-column prop="comment" align="center" label="字段名称" width="130"></el-table-column>
                            <el-table-column prop="comment" align="center" label="字段注释" width="130"></el-table-column>
                            <el-table-column prop="sampleValue" align="center" label="样本值" width="180"></el-table-column>
                            <el-table-column prop="riskSuggestion" align="center" label="风险处置建议" width="160"></el-table-column>
                            <!-- 是否脱敏列 - 下拉框 -->
                            <el-table-column prop="isDesensitized" label="是否脱敏" align="center" width="100">
                                <template slot-scope="scope">
                                    <el-select v-model="scope.row.isDesensitized" size="mini"
                                        @change="handleDesensitizeChange(scope.row, scope.$index)" style="width: 100%;">
                                        <el-option label="是" value="是"></el-option>
                                        <el-option label="否" value="否"></el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <!-- 证明材料列 - 上传按钮 -->
                            <el-table-column prop="proofMaterial" label="证明材料" align="center" width="130">
                                <template slot-scope="scope">
                                    <el-upload class="upload-btn" action="#"
                                        :on-change="handleFileUpload(scope.row, scope.$index)" :auto-upload="true"
                                        :show-file-list="false">
                                        <el-button size="mini" type="text">上传</el-button>
                                    </el-upload>
                                </template>
                            </el-table-column>
                            <el-table-column prop="isEncrypted" label="是否加密" align="center" width="100">
                                <template slot-scope="scope">
                                    <div style="display: flex; align-items: center; justify-content: center;">
                                        <i
                                            :class="scope.row.isEncrypted ? 'el-icon-success' : 'el-icon-error'" 
                                            style="margin-right: 5px;" 
                                        />
                                        {{ scope.row.isEncrypted ? '是' : '否' }}
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </el-card>

            <!-- 卡片3：整改建议 -->
            <el-card class="assessment-card suggestions-card">
                <div slot="header" class="card-header">
                    <h3>整改建议</h3>
                    <span class="card-header-span">根据《信息安全技术 敏感个人信息处理规则》及数据敏感程度，建议按以下优先级实施防护措施：</span>
                </div>
                <div class="card-content">
                    <div class="suggestion-content">
                        <div class="priority-high">
                            <h4 class="red"><i class="el-icon-warning" style="margin-right: 5px;"></i><b>高优先级:</b></h4>
                            <span><i class="el-icon-success red" style="margin-right: 5px;"></i>对所有xxx类、xxx类实施AES-256加密存储</span><br>
                            <span><i class="el-icon-success red" style="margin-right: 5px;"></i>对所有xxx类、xxx类实施AES-256加密存储</span><br>
                        </div>

                        <div class="priority-high">
                            <h4 class="blue"><i class="el-icon-date" style="margin-right: 5px;"></i><b>长期措施:</b></h4>
                            <span><i class="el-icon-success blue" style="margin-right: 5px;"></i>对所有xxx类、xxx类实施AES-256加密存储</span><br>
                            <span><i class="el-icon-success blue" style="margin-right: 5px;"></i>对所有xxx类、xxx类实施AES-256加密存储</span><br>
                        </div>
                    </div>
                </div>
            </el-card>

            <!-- 卡片4：评估总结 -->
            <el-card class="assessment-card summary-card">
                <div slot="header" class="card-header">
                    <h3>评估总结</h3>
                </div>
                <div class="card-content">
                    <div class="summary-content">
                        <p>本次敏感数据安全风险评估共涉及8个核心业务系统，识别出32类敏感信息，其中：</p>

                        <div class="summary-stats">
                            <div class="stat-item">5级-核心数据：15类</div>
                            <div class="stat-item">4级-重要数据：17类</div>
                            <div class="stat-item">已防护数据：8类</div>
                            <div class="stat-item">未防护数据：24类</div>
                        </div>

                        <p>评估发现，目前有24项敏感信息未实施有效的加密和脱敏保护，存在较高的数据安全风险。</p>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SensitiveDataRiskAssessment',
    data() {
        return {
            selectedStandard: '', // 所属标准下拉框选中值
            dataSourceList: [
                {
                    id: 1,
                    name: '用户管理系统',
                    systemName: 'CRM系统',
                    categoryCount: 5,
                    highestRiskLevel: 2,
                    riskText: '2级-内部公开 * 2'
                },
                {
                    id: 2,
                    name: '订单管理系统',
                    systemName: 'ERP系统',
                    categoryCount: 8,
                    highestRiskLevel: 5,
                    riskText: '5级-核心数据 * 3'
                },
                {
                    id: 3,
                    name: '客户服务系统',
                    systemName: '客服平台',
                    categoryCount: 6,
                    highestRiskLevel: 4,
                    riskText: '4级-重要数据 * 3'
                },
                {
                    id: 4,
                    name: '人力资源系统',
                    systemName: 'HRM系统',
                    categoryCount: 7,
                    highestRiskLevel: 3,
                    riskText: '3级-机密数据 * 3'
                }
            ],

            filterTags: [
                { label: '全部', value: 'all' },
                { label: '5级-核心数据', value: 'level5' },
                { label: '4级-重要数据', value: 'level4' },
                { label: '3级-机密数据', value: 'level3' },
                { label: '2级-内部公开', value: 'level2' },
                { label: '未防护项', value: 'unprotected' },
                { label: '已防护项', value: 'protected' }
            ],

            activeFilter: 'all',
            searchKeyword: '',
            showRiskDetails: false,
            currentDataSource: null,
            sensitiveCategories: [],
            filteredCategories: []
        };
    },
    methods: {
        // 处理脱敏状态变更
        handleDesensitizeChange(row, index) {
            console.log(`字段 ${row.absolutePath} 脱敏状态变更为: ${row.isDesensitized}`);
            // 这里可以添加保存状态的逻辑
        },

        // 处理文件上传
        handleFileUpload(row, index) {
            return (file, fileList) => {
                console.log(`为字段 ${row.absolutePath} 上传证明材料:`, file.name);
                // 这里可以添加文件上传的逻辑
                row.proofFiles.push({
                    name: file.name,
                    url: '#' // 实际项目中替换为文件的URL
                });
            };
        },
        // 导出清单
        handleExport() {
            this.$message.success('正在导出所有数据源的风险清单...');
        },

        // 点击数据源行
        handleDataSourceClick(row) {
            this.currentDataSource = row;
            this.loadRiskDetails(row.id);
            this.showRiskDetails = true;
        },

        // 查看详情
        handleViewDetails(row) {
            this.currentDataSource = row;
            this.loadRiskDetails(row.id);
            this.showRiskDetails = true;
        },

        // 获取风险等级颜色
        getRiskColor(level) {
            const colors = {
                5: '#F56C6C', // 深红色
                4: '#FF9800', // 橙红色
                3: '#FB8C00', // 橙色
                2: '#FFC107', // 黄色
                1: '#4CAF50'  // 绿色
            };
            return colors[level] || '#9E9E9E';
        },

        // 加载风险详情数据
        loadRiskDetails(dataSourceId) {
            this.sensitiveCategories = [
                {
                    id: 1,
                    fullPath: '身份证信息',
                    securityLevel: 5,
                    securityLevelText: '5级-核心数据',
                    protectionStatus: '未防护',
                    description: '包含公民身份号码、姓名、性别、民族、出生日期等身份识别信息，属于敏感个人信息，泄露可能导致个人权益受到严重损害。',
                    legalBasis: '国标-GB-0197，《个人信息保护法》第28条',
                    databases: [
                        { id: 1, name: '用户中心数据库' },
                        { id: 2, name: '订单系统数据库' }
                    ],
                    fields: [
                        {
                            absolutePath: 'id_card_number',
                            comment: '公民身份证号码',
                            sampleValue: '110101199008101123',
                            riskSuggestion: '脱敏 加密',
                            isDesensitized: '否',
                            proofFiles: [],
                            isEncrypted: false
                        },
                        {
                            absolutePath: 'full_name',
                            comment: '用户真实姓名',
                            sampleValue: '张三',
                            riskSuggestion: '脱敏',
                            isDesensitized: '否',
                            proofFiles: [],
                            isEncrypted: false
                        }
                    ]
                },
                {
                    id: 2,
                    fullPath: '手机号码信息',
                    securityLevel: 2,
                    securityLevelText: '2级-内部公开',
                    protectionStatus: '未防护',
                    description: '包含用户手机号码、通话记录等通信信息，属于敏感个人信息，可能被用于诈骗等非法活动。',
                    legalBasis: '国标-GB-0197，《个人信息保护法》第28条',
                    databases: [
                        { id: 1, name: '用户中心数据库' }
                    ],
                    fields: [
                        {
                            absolutePath: 'phone_number',
                            comment: '手机号码',
                            sampleValue: '13800138000',
                            riskSuggestion: '脱敏 加密',
                            isDesensitized: '否',
                            proofFiles: [],
                            isEncrypted: false
                        }
                    ]
                },
                {
                    id: 3,
                    fullPath: '银行卡信息',
                    securityLevel: 5,
                    securityLevelText: '5级-核心数据',
                    protectionStatus: '已防护',
                    description: '包含银行卡号、开户行、卡片类型等金融信息，泄露可能导致财产损失。',
                    legalBasis: '国标-GB-0197，《个人信息保护法》第28条',
                    databases: [
                        { id: 3, name: '支付系统数据库' }
                    ],
                    fields: [
                        {
                            absolutePath: 'card_number',
                            comment: '银行卡号',
                            sampleValue: '6222021234567890123',
                            riskSuggestion: '脱敏 加密',
                            isDesensitized: '是',
                            proofFiles: [
                                { name: '银行卡脱敏证明.png', url: '#' }
                            ],
                            isEncrypted: true
                        }
                    ]
                }
            ];

            this.filteredCategories = [...this.sensitiveCategories];
        },

        // 处理过滤
        handleFilter(value) {
            this.activeFilter = value;
            this.filterCategories();
        },

        // 处理搜索
        handleSearch() {
            this.filterCategories();
        },

        // 过滤分类数据
        filterCategories() {
            let result = [...this.sensitiveCategories];

            if (this.searchKeyword) {
                const keyword = this.searchKeyword.toLowerCase();
                result = result.filter(category =>
                    category.fullPath.toLowerCase().includes(keyword) ||
                    category.description.toLowerCase().includes(keyword)
                );
            }

            if (this.activeFilter === 'level5') {
                result = result.filter(category => category.securityLevel === 5);
            } else if (this.activeFilter === 'level4') {
                result = result.filter(category => category.securityLevel === 4);
            } else if (this.activeFilter === 'level3') {
                result = result.filter(category => category.securityLevel === 3);
            } else if (this.activeFilter === 'level2') {
                result = result.filter(category => category.securityLevel === 2);
            } else if (this.activeFilter === 'unprotected') {
                result = result.filter(category => category.protectionStatus === '未防护');
            } else if (this.activeFilter === 'protected') {
                result = result.filter(category => category.protectionStatus === '已防护');
            }

            this.filteredCategories = result;
        },

        // 数据库过滤
        handleDatabaseFilter(dbId) {
            this.$message.info(`已筛选出数据库ID为 ${dbId} 的所有字段`);
        }
    },
    computed: {

    },
    mounted() {
        this.loadRiskDetails(1);
    }
};
</script>

<style lang="scss" scoped>
::v-deep .el-card {
    box-shadow: none;
}

/* 样式部分保持不变 */
.form-label {
    font-weight: 600;
    color: #26244ce0;
    font-size: 14px;
    margin-right: 10px;
}

.sensitive-data-risk-assessment {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eaeaea;
}

.page-header h2 {
    color: #333;
    font-size: 20px;
    margin: 0;
}

.header-operations {
    display: flex;
    align-items: center;
}

.standard-select {
    width: 180px;
    margin-right: 15px;
}

.export-btn {
    margin-left: 0;
    background-color: #263fa8;
    color: #fff;
    font-weight: 600;
    border-radius: 8px;
}

.classification-badge {
    margin-bottom: 20px;
}

.card-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 20px;
}

.assessment-card {
    border-radius: 4px;
    // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header {
    padding: 12px 15px;
    // background-color: #f5f7fa;
    // border-bottom: 1px solid #eaeaea;
}
.card-header-span{
    font-size: 12px;
    color: #6e7481;
}

.card-header h3 {
    color: #333;
    font-size: 15px;
    font-weight: 600;
    margin: 0;
    margin-bottom: 10px;
}

/* 卡片布局设置 - 移除了手机号信息卡片 */
.data-source-card {
    grid-column: 1 / 3;
    grid-row: 1;
}

.risk-list-card {
    grid-column: 1 / 3;
    grid-row: 2;
}

.suggestions-card {
    grid-column: 1;
    grid-row: 3;
}

.summary-card {
    grid-column: 2;
    grid-row: 3;
}

.risk-level {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 3px;
    color: #fff;
    font-size: 12px;
    font-weight: 500;
}

.view-details-btn {
    color: #409EFF;
    padding: 5px 0;
}

.close-btn {
    color: #F56C6C;
}

.filter-section {
    display: flex;
    margin: 15px 0;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.filter-tags .el-tag {
    cursor: pointer;
    color: #232b38;
    background-color: #e5e7eb;
    border: none;
    border-radius: 15px;
    line-height: 28px;
}

.active-tag {
    background-color: #263fa8 !important;
    color: white !important;
}

.category-search {
    width: 220px;
    margin-left: auto;
}

.category-item {
    margin-bottom: 20px;
    padding: 15px;
    // background-color: #f9f9f9;
    border-radius: 5px;
}

.category-title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.full-path {
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.security-level {
    color: white !important;
    font-size: 12px !important;
}

.category-description,
.legal-basis,
.database-filter {
    margin-bottom: 8px;
    line-height: 1.5;
    color: #666;
    font-size: 13px;
}

.database-tag {
    cursor: pointer;
    background-color: #e8f4fd;
    color: #409EFF;
    border-color: #b3d8ff;
    margin-right: 5px;
}

.card-content {
    line-height: 1.6;
    color: #666;
    font-size: 14px;
    padding: 5px 0;
}

.summary-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 8px 0;
}

.stat-item {
    background-color: #e8f4fd;
    padding: 4px 8px;
    border-radius: 3px;
    color: #409EFF;
    font-size: 12px;
}

@media (max-width: 1024px) {
    .card-container {
        grid-template-columns: 1fr;
    }

    .data-source-card,
    .risk-list-card,
    .suggestions-card,
    .summary-card {
        grid-column: 1;
    }

    .suggestions-card {
        grid-row: 3;
    }

    .summary-card {
        grid-row: 4;
    }
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-operations {
        margin-top: 10px;
        width: 100%;
        justify-content: flex-end;
    }

    .filter-section {
        flex-direction: column;
        align-items: flex-start;
    }

    .category-search {
        width: 100%;
        margin-left: 0;
        margin-top: 8px;
    }
}

.category-header {
    margin-bottom: 10px;
}

.category-title-row {
    margin-bottom: 5px; // 标题行与标签行之间的间距
}

.category-tags-row {
    display: flex;
    gap: 8px; // 标签之间的间距
    align-items: center;
}
.red{
    color: #ca3a31;
}
.blue{
    color: #4e80ee;
}
</style>