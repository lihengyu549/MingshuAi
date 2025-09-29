<template>
    <div v-loading="loading" element-loading-text="拼命加载中..." class="sensitive-sensitive-data-risk-assessment">
        <!-- 页面标题与操作区 -->
        <div class="page-header">
            <h2><b>敏感数据安全风险评估报告</b></h2>
            <div class="header-operations">
                <!-- 所属标准下拉框 -->
                <label class="form-label">所属标准</label>
                <el-select v-model="categoryId" placeholder="所属标准" class="standard-select" size="small"
                    @change="handleCategoryChange">
                    <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
                    </el-option>
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
                    <span class="card-header-span">共 {{ dataSourceList.length }} 个数据源，点击查看详细数据分类和风险情况</span>
                </div>

                <!-- 数据源表格 -->
                <el-table :data="dataSourceList" stripe style="width: 100%;" size="small">
                    <template slot="empty">
                        <el-empty description="暂无数据"></el-empty>
                    </template>
                    <el-table-column prop="sourceName" align="center" label="数据源名称" width="200"></el-table-column>
                    <el-table-column prop="businessName" align="center" label="业务系统名称"
                        min-width="200"></el-table-column>
                    <!-- <el-table-column prop="categoryCount" align="center" label="敏感分类数" width="100"></el-table-column> -->
                    <el-table-column align="center" label="风险统计" min-width="200">
                        <template slot-scope="scope">
                            <div class="risk-stats">
                                <span class="risk-level" v-for="(item, index) in scope.row.riskStatistics" :key="index"
                                    :style="{ backgroundColor: getRiskColor(Number(item.securityLevel)), marginRight: '5px' }">
                                    {{ item.securityLevelName + ' * ' + item.num }}
                                </span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" label="操作" width="100">
                        <template slot-scope="scope">
                            <el-button type="text" @click.stop="handleViewDetails(scope.row)" class="view-details-btn"
                                size="small">
                                <i class="el-icon-view"></i>
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
                        <h3><svg-icon icon-class="tag" style="margin-right: 5px;" />敏感数据安全风险清单</h3>
                        <span class="card-header-span">数据源：{{ currentDataSource.sourceName }}</span>
                    </div>
                    <el-button type="text" icon="el-icon-close" @click="showRiskDetails = false" class="close-btn"
                        size="mini">关闭详情</el-button>
                </div>

                <!-- 筛选和搜索区域 -->
                <div class="filter-section">
                    <el-input placeholder="搜索数据分类..." v-model="searchKeyword" prefix-icon="el-icon-search"
                        class="category-search" @input="handleSearch" size="small" clearable></el-input>

                    <!-- 风险等级筛选行 -->
                    <div class="filter-tags level-filter">
                        <el-tag v-for="tag in levelFilterTags" :key="tag.value"
                            :class="{ 'active-tag': levelFilterValue === tag.value }"
                            @click="toggleLevelFilter(tag.value)" size="medium">
                            {{ tag.label }}
                        </el-tag>
                    </div>

                    <!-- 防护状态筛选行 -->
                    <div class="filter-tags status-filter">
                        <el-tag v-for="tag in statusFilterTags" :key="tag.value"
                            :class="{ 'active-tag': statusFilterValue === tag.value }"
                            @click="toggleStatusFilter(tag.value)" size="medium">
                            {{ tag.label }}
                        </el-tag>
                    </div>
                </div>

                <!-- 敏感分类列表（包含所有分类，不再单独排除手机号信息） -->
                <div class="sensitive-categories">
                    <div class="category-item" v-for="category in filteredCategories" :key="category.id">
                        <div class="category-header">
                            <!-- 修改分类标题布局 -->
                            <div class="category-title-row">
                                <h2 class="full-path">{{ category.attachDataName }}</h2>
                            </div>
                            <div class="category-tags-row">
                                <el-tag class="security-level"
                                    :style="{ backgroundColor: getRiskColor(category.securityLevel) }" size="mini">
                                    {{ category.securityLevelName }}
                                </el-tag>
                                <el-tag class="protection-status"
                                    :type="category.protectionMeasure === '1' ? 'success' : 'warning'" size="mini">
                                    <i
                                        :class="category.protectionMeasure === '1' ? 'el-icon-success' : 'el-icon-warning'"></i>{{
                                            category.protectionMeasure === '1' ? '已防护' : '未防护' }}
                                </el-tag>
                            </div>
                        </div>

                        <div class="category-description">
                            <p><strong>分类描述：</strong></p>
                            <span>{{ category.attachDataDescribe }}</span>
                        </div>

                        <div class="legal-basis">
                            <p><strong>法规依据：</strong></p>
                            <span><svg-icon icon-class="law" style="margin-right: 5px;" />{{ category.regulatoryBasis
                                }}</span>
                        </div>

                        <div class="database-filter">
                            <p><strong>涉及数据库：</strong></p>
                            <el-tag v-for="(db, index) in category.databaseNameList" :key="index"
                                @click="handleDatabaseFilter(db)"
                                :class="['database-tag', { 'active-tag': activeDatabaseId === db }]" size="medium">
                                {{ db }}
                            </el-tag>
                        </div>

                        <el-table :data="category.fields" style="width: 100%; margin-top: 10px;" size="mini">
                            <template slot="empty">
                                <el-empty description="暂无数据"></el-empty>
                            </template>
                            <el-table-column prop="tableName" align="center" label="数据表名称"
                                min-width="220"></el-table-column>
                            <el-table-column prop="fieldName" align="center" label="字段名称" width="130"></el-table-column>
                            <el-table-column prop="fieldRemark" align="center" label="字段注释"
                                width="130"></el-table-column>
                            <el-table-column prop="dataValue" align="center" label="样本值" width="180"></el-table-column>
                            <el-table-column prop="riskDisposeSuggest" label="风险处置建议" width="160">
                                <template slot="header">
                                    <div style="text-align: center;">建议防护措施</div>
                                </template>
                                <template slot-scope="scope">
                                    <div v-if="scope.row.riskDisposeSuggest.length > 0">
                                        <el-tag v-for="suggestion in scope.row.riskDisposeSuggest" :key="suggestion"
                                            class="risk-tag"
                                            :class="{ 'tm-tag': suggestion === '脱敏', 'jm-tag': suggestion === '加密' }"
                                            size="mini">
                                            {{ suggestion }}
                                        </el-tag>
                                    </div>
                                </template>
                            </el-table-column>
                            <!-- 是否脱敏列 - 下拉框 -->
                            <el-table-column prop="isMask" label="是否脱敏" align="center" width="100">
                                <template slot-scope="scope">
                                    <el-select v-model="scope.row.isMask" size="mini"
                                        @change="handleDesensitizeChange(scope.row, scope.$index)" style="width: 100%;">
                                        <el-option label="是" value="1"></el-option>
                                        <el-option label="否" value="0"></el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <!-- 证明材料列 - 上传按钮 -->
                            <el-table-column prop="proofMaterial" label="证明材料" align="center" width="200">
                                <template slot-scope="scope">
                                    <div class="proof-upload-container">
                                        <el-upload class="upload-btn" action="#" :auto-upload="false"
                                            :before-upload="beforeUpload"
                                            :on-change="handleFileUpload(scope.row, scope.$index)"
                                            :show-file-list="false">
                                            <el-button size="mini" icon="el-icon-upload" type="text">
                                                {{ scope.row.proofUrl ? '重新上传' : '上传' }}
                                            </el-button>
                                        </el-upload>

                                        <!-- 新增缩略图展示区域 -->
                                        <el-image v-if="getProofUrl(scope.row.fieldId)"
                                            :src="getProofUrl(scope.row.fieldId)"
                                            :preview-src-list="[getProofUrl(scope.row.fieldId)]" class="proof-thumbnail"
                                            fit="cover" @error="handleImageError(scope.row.fieldId)"></el-image>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="isEncrypt" label="是否加密" align="center" width="100">
                                <template slot-scope="scope">
                                    <div style="display: flex; align-items: center; justify-content: center;">
                                        <i :class="scope.row.isEncrypt == '1' ? 'el-icon-success' : 'el-icon-error'"
                                            style="margin-right: 5px;" />
                                        {{ scope.row.isEncrypt == '1' ? '是' : '否' }}
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <!-- 分页 -->
                    <Pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                        :current-page="pagination.currentPage" :page-sizes="[5, 10, 15, 20]"
                        :limit="pagination.pageSize" layout="total, sizes, prev, pager, next, jumper"
                        :total="pagination.total">
                    </Pagination>
                </div>
            </el-card>

            <!-- 卡片3：整改建议 -->
            <!-- <el-card class="assessment-card suggestions-card">
                <div slot="header" class="card-header">
                    <h3><svg-icon icon-class="chuizi" style="margin-right: 5px;" />整改建议</h3>
                    <span class="card-header-span">根据《信息安全技术 敏感个人信息处理规则》及数据敏感程度，建议按以下优先级实施防护措施：</span>
                </div>
                <div class="card-content">
                    <div class="suggestion-content">
                        <div class="priority-high">
                            <h4 class="red"><i class="el-icon-warning" style="margin-right: 5px;"></i><b>高优先级:（30天内）</b>
                            </h4>
                            <span><i class="el-icon-success red"
                                    style="margin-right: 5px;"></i>对所有xxx类、xxx类实施AES-256加密存储</span><br>
                            <span><i class="el-icon-success red"
                                    style="margin-right: 5px;"></i>对xxx类、xxx类等敏感信息进行脱敏显示</span><br>
                        </div>

                        <div class="priority-high">
                            <h4 class="blue"><i class="el-icon-date" style="margin-right: 5px;"></i><b>长期措施（90天内）</b>
                            </h4>
                            <span><i class="el-icon-success blue"
                                    style="margin-right: 5px;"></i>部署数据安全管理平台，实现敏感数据自动识别和分类</span><br>
                            <span><i class="el-icon-success blue"
                                    style="margin-right: 5px;"></i>建立数据安全责任制，明确各部门数据保护职责</span><br>
                            <span><i class="el-icon-success blue"
                                    style="margin-right: 5px;"></i>定期开展数据安全培训，提高员工数据保护意识</span><br>
                            <span><i class="el-icon-success blue" style="margin-right: 5px;"></i>制定数据泄露应急响应预案</span><br>
                        </div>
                    </div>
                </div>
            </el-card> -->

            <!-- 卡片4：评估总结 -->
            <!-- <el-card class="assessment-card summary-card">
                <div slot="header" class="card-header">
                    <h3><svg-icon icon-class="flag" style="margin-right: 5px;" />评估总结</h3>
                </div>
                <div class="card-content">
                    <div class="summary-content">
                        <p>本次敏感数据安全风险评估共涉及8个核心业务系统，识别出32类敏感信息，其中5级-核心数据15类，4级-重要数据17类。评估发现，目前有3项敏感信息未实施有效的加密和脱敏保护，存在较高的数据安全风险，不符合《xxxxx》的相关要求。

                            主要问题包括：
                            xxxx类、xxx类等4级-重要数据未进行脱敏展示
                            部分系统中的5级-核心数据采用明文存储，未实施加密保护
                            建议按照优先级尽快实施相应的防护措施。确保在90天内完成所有敏感信息的安全保护，符合相关法律法规要求。</p>
                    </div>
                </div>
            </el-card> -->
        </div>
    </div>
</template>

<script>
import { getFrameworks, listSensitiveDataRiskAssessmentReport, getViewDetails, changeIsMask, uploadEvidentiaryMaterialFile } from "@/api/system/protectCategory";
export default {
    name: 'SensitiveDataRiskAssessment',
    data() {
        return {
            dataSourceList: [],

            // 风险等级筛选标签（移除"全部"）
            levelFilterTags: [
                { label: '5级-核心数据', value: 'level5' },
                { label: '4级-重要数据', value: 'level4' },
                { label: '3级-机密数据', value: 'level3' },
                { label: '2级-内部公开', value: 'level2' }
            ],
            // 防护状态筛选标签
            statusFilterTags: [
                { label: '未防护项', value: 'unprotected' },
                { label: '已防护项', value: 'protected' }
            ],

            categoryId: 0,
            treeOptions: [],
            // 单选筛选值存储
            levelFilterValue: '',
            statusFilterValue: '',
            searchKeyword: '',
            showRiskDetails: false,
            currentDataSource: null,
            sensitiveCategories: [],
            filteredCategories: [],
            activeDatabaseId: null,
            datasourceId: null,
            proofUrlList: [],
            loading: false,
            // 分页参数
            pagination: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            }
        };
    },
    computed: {

    },
    created() {
        this.gettreeOptionsList()
    },
    mounted() {
    },
    methods: {
        // 获取图片URL的方法
        getProofUrl(fieldId) {
            const item = this.proofUrlList.find(item => item.fieldId === fieldId);
            return item ? item.url : null;
        },
        // 图片加载失败处理
        handleImageError(fieldId) {
            this.$message.error('图片加载失败');
            // 可以在这里移除无效的URL记录
            this.proofUrlList = this.proofUrlList.filter(item => item.fieldId !== fieldId);
        },
        handleCategoryChange(val) {
            this.categoryId = val
            this.getSensitiveDataList(this.categoryId)
        },
        gettreeOptionsList() {
            getFrameworks().then((response) => {
                this.treeOptions = response.data
                if (response.data.length > 0) {
                    this.categoryId = response.data[0].id;
                }
                this.getSensitiveDataList(response.data[0].id)
            });
        },
        // 敏感数据列表
        getSensitiveDataList(categoryId) {
            try {
                listSensitiveDataRiskAssessmentReport({ categoryId: categoryId }).then((response) => {
                    this.dataSourceList = response.data.dataSourceList;
                });
            } catch (error) {
                console.error('获取敏感数据列表失败', error);
            }
        },
        // 处理脱敏状态变更
        handleDesensitizeChange(row, index) {
            const params = {
                fieldId: row.fieldId,
                isMask: row.isMask
            }
            try {
                changeIsMask(params).then((response) => {
                    if (response.code === 200) {
                        this.$message.success('脱敏状态更新成功');
                        // 刷新列表数据
                        this.loadRiskDetails(this.datasourceId);
                    }
                });
            } catch (error) {
                this.$message.error('更新脱敏状态失败');
            }
            // 这里可以添加保存状态的逻辑
        },
        // 阻止默认上传行为
        beforeUpload() {
            return false;
        },

        // 处理文件上传
        handleFileUpload(row, index) {
            return (file, fileList) => {
                // 定义允许的图片类型
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
                // 检查文件类型是否在允许列表中
                if (!allowedTypes.includes(file.raw.type)) {
                    this.$message.error('只能上传图片文件（JPG、PNG、GIF、BMP、WEBP）');
                    return false;
                }

                // 限制文件大小为5M
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.raw.size > maxSize) {
                    this.$message.error('文件大小不能超过5MB');
                    return false;
                }

                // 创建FormData对象
                const formData = new FormData();
                formData.append('file', file.raw);
                formData.append('fieldId', row.fieldId);

                // 显示上传中状态
                const loading = this.$loading({
                    lock: true,
                    text: '正在上传证明材料...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });

                // 调用上传接口
                uploadEvidentiaryMaterialFile(formData).then((response) => {
                    loading.close();
                    if (response.code === 200) {
                        this.$message.success('证明材料上传成功');

                        // 查找proofUrlList中是否已存在相同fieldId的条目
                        const existingIndex = this.proofUrlList.findIndex(item => item.fieldId === row.fieldId);

                        if (existingIndex !== -1) {
                            // 如果存在，替换该条目的URL
                            this.proofUrlList[existingIndex].url = response.msg;
                        } else {
                            // 如果不存在，添加新条目
                            this.proofUrlList.push({
                                fieldId: row.fieldId,
                                url: response.msg
                            });
                        }

                        this.loadRiskDetails(this.datasourceId);
                    }
                }).catch(error => {
                    loading.close();
                    this.$message.error('证明证明材料上传失败，请稍后重试');
                });
            };
        },
        // 导出清单
        handleExport() {
            this.$message.success('正在导出所有数据源的风险清单...');
        },

        // 查看详情
        handleViewDetails(row) {
            this.currentDataSource = row;
            this.datasourceId = row.datasourceId;
            // 重置分页和筛选条件
            this.pagination.currentPage = 1;
            this.levelFilterValue = '';
            this.statusFilterValue = '';
            this.searchKeyword = '';
            this.activeDatabaseId = null;
            this.loadRiskDetails(row.datasourceId);
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

        // 加载风险详情数据（添加分页和筛选参数）
        loadRiskDetails(dataSourceId) {
            this.loading = true;
            // 构建筛选参数
            const params = {
                datasourceId: dataSourceId,
                pageNum: this.pagination.currentPage,
                pageSize: this.pagination.pageSize,
                // 风险等级筛选（转换为数字，空则不筛选）
                level: this.levelFilterValue ?
                    {
                        'level5': 5,
                        'level4': 4,
                        'level3': 3,
                        'level2': 2
                    }[this.levelFilterValue]
                    : '',
                // 防护状态筛选（空则不筛选）
                protectionMeasure: this.statusFilterValue ?
                    this.statusFilterValue === 'protected' ? '1' : '0'
                    : '',
                // 搜索关键词
                categoryName: this.searchKeyword || '',
                // 数据库筛选（空字符串表示不筛选）
                // databaseName: this.activeDatabaseId || ''
            };

            try {
                getViewDetails(params).then((response) => {
                    // 保存原始数据并初始化过滤结果
                    this.sensitiveCategories = response.data.pageInfo;
                    this.filteredCategories = [...this.sensitiveCategories];
                    // 更新分页总数
                    this.pagination.total = response.data.total;
                    // 初始化分页
                    this.pagination.currentPage = response.data.pageNum;
                    this.pagination.pageSize = response.data.pageSize;
                    this.loading = false;
                });
            } catch (error) {
                console.error('获取风险详情失败', error);
                this.loading = false;
                // 错误处理：清空数据避免筛选异常
                this.sensitiveCategories = [];
                this.filteredCategories = [];
                this.pagination.total = 0;
            }
        },

        // 切换风险等级筛选（单选）
        toggleLevelFilter(value) {
            // 如果点击已选中的值，则取消选择
            if (this.levelFilterValue === value) {
                this.levelFilterValue = '';
            } else {
                // 否则选中当前值
                this.levelFilterValue = value;
            }
            // 重置页码为1
            this.pagination.currentPage = 1;
            this.loadRiskDetails(this.datasourceId);
        },

        // 切换防护状态筛选（单选）
        toggleStatusFilter(value) {
            // 如果点击已选中的值，则取消选择
            if (this.statusFilterValue === value) {
                this.statusFilterValue = '';
            } else {
                // 否则选中当前值
                this.statusFilterValue = value;
            }
            // 重置页码为1
            this.pagination.currentPage = 1;
            this.loadRiskDetails(this.datasourceId);
        },

        // 处理搜索
        handleSearch() {
            // 重置页码为1
            this.pagination.currentPage = 1;
            this.loadRiskDetails(this.datasourceId);
        },

        // 数据库过滤
        handleDatabaseFilter(dbName) {
            // 切换选中状态
            this.activeDatabaseId = this.activeDatabaseId === dbName ? null : dbName;

            if (this.activeDatabaseId) {
                // 筛选当前分类中字段所属数据库匹配的记录
                this.filteredCategories = this.sensitiveCategories.map(category => {
                    // 过滤字段列表，只保留匹配当前数据库名的字段
                    const filteredFields = category.fields.filter(field =>
                        field.databaseName === dbName
                    );
                    // 返回新的分类对象，保持其他属性不变，只更新fields
                    return {
                        ...category,
                        fields: filteredFields
                    };
                }).filter(category =>
                    // 过滤掉字段列表为空的分类
                    category.fields.length > 0
                );
                this.$message.info(`已筛选出数据库为 ${dbName} 的所有字段`);
            } else {
                // 取消筛选，恢复原始数据
                this.filteredCategories = [...this.sensitiveCategories];
                this.$message.info('已取消数据库筛选');
            }
        },

        // 分页大小改变
        handleSizeChange(val) {
            this.pagination.pageSize = val;
            this.pagination.currentPage = 1; // 重置页码为1
            this.loadRiskDetails(this.datasourceId);
        },

        // 当前页码改变
        handleCurrentChange(val) {
            this.pagination.currentPage = val;
            this.loadRiskDetails(this.datasourceId);
        }
    },
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

.card-header-span {
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
    grid-column: 1 / 3; // 改为跨两列
    grid-row: 3; // 放在第3行
}

.summary-card {
    grid-column: 1 / 3; // 改为跨两列
    grid-row: 4; // 放在第4行
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
    flex-direction: column;
    margin: 15px 0;
    gap: 10px;
    align-items: flex-start;
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
}

.filter-tags .el-tag,
.database-tag {
    cursor: pointer;
    color: #232b38;
    background-color: #e5e7eb;
    border: none;
    border-radius: 15px;
    line-height: 28px;
}

.database-tag {
    margin-left: 5px;
}

.active-tag {
    background-color: #263fa8 !important;
    color: white !important;
}

.category-search {
    width: 100%;
    margin-top: 5px;
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

.red {
    color: #ca3a31;
}

.blue {
    color: #4e80ee;
}

.risk-tag {
    font-weight: 600;
    border-radius: 5px;
    margin-right: 5px;
    border: none;
}

.tm-tag {
    color: #263fa8;
    background-color: #dee9fc;
}

.jm-tag {
    color: #6326a2;
    background-color: #f1e8fd;
}

/* 证明材料上传容器 - 使按钮和缩略图并排显示 */
.proof-upload-container {
    display: flex;
    align-items: center;
    gap: 8px;
    /* 按钮和缩略图之间的间距 */
    justify-content: center;
    /* 水平居中对齐 */
}

/* 缩略图样式 */
.proof-thumbnail {
    width: 40px;
    height: 40px;
    margin-left: 10px;
    /* 与上传按钮保持距离 */
    cursor: pointer;
    /* 提示可点击查看大图 */
    /* 移除可能的hover效果 */
    transition: none;
    transform: none !important;
}
</style>