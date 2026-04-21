<template>
    <div v-loading="loading" :element-loading-text="$t('sensitiveData.loadingText')"
        class="sensitive-sensitive-data-risk-assessment">
        <div class="page-header">
            <h2><b>{{ $t('sensitiveData.title') }}</b></h2>
            <div class="header-operations">
                <label class="form-label">{{ $t('sensitiveData.standardBelong') }}</label>
                <el-select v-model="categoryId" :placeholder="$t('sensitiveData.standardBelong')"
                    class="standard-select" size="small" @change="handleCategoryChange">
                    <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
                    </el-option>
                </el-select>

                <el-button icon="el-icon-download" @click="handleExport" size="small" class="export-btn">
                    {{ $t('sensitiveData.exportList') }}
                </el-button>
            </div>
        </div>

        <div class="card-container">
            <el-card class="assessment-card data-source-card">
                <div slot="header" class="card-header">
                    <h3><svg-icon icon-class="databaseSolid" style="margin-right: 5px;" />{{
                        $t('sensitiveData.dataSourceList') }}</h3>
                    <span class="card-header-span">{{ $t('sensitiveData.totalDataSources', {
                        count:
                        dataSourceList.length }) }}</span>
                </div>

                <el-table :data="dataSourceList" stripe style="width: 100%;" size="small">
                    <template slot="empty">
                        <el-empty :description="$t('noData')"></el-empty>
                    </template>
                    <el-table-column prop="sourceName" align="center" :label="$t('sensitiveData.dataSourceName')"
                        width="200"></el-table-column>
                    <el-table-column prop="businessName" align="center" :label="$t('sensitiveData.businessSystemName')"
                        min-width="200"></el-table-column>
                    <el-table-column align="center" :label="$t('sensitiveData.riskStatistics')" min-width="200">
                        <template slot-scope="scope">
                            <div class="risk-stats">
                                <el-tag :style="getRiskStyle(Number(item.securityLevel))"
                                    v-for="(item, index) in scope.row.riskStatistics" :key="index"
                                    class="risk-level-tag">
                                    {{ item.securityLevelName + ' * ' + item.num }}
                                </el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" :label="$t('operation')" width="100">
                        <template slot-scope="scope">
                            <el-button type="text" @click.stop="handleViewDetails(scope.row)" class="view-details-btn"
                                size="small">
                                <i class="el-icon-view"></i>
                                {{ $t('sensitiveData.viewDetails') }}
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>

            <el-card class="assessment-card risk-list-card" v-if="showRiskDetails">
                <div slot="header" class="card-header list-header">
                    <div>
                        <h3><svg-icon icon-class="tag" style="margin-right: 5px;" />{{ $t('sensitiveData.riskList') }}
                        </h3>
                        <span class="card-header-span">{{ $t('sensitiveData.dataSourcePrefix', {
                            name:
                            currentDataSource.sourceName
                            }) }}</span>
                    </div>
                    <el-button type="text" icon="el-icon-close" @click="showRiskDetails = false" class="close-btn"
                        size="mini">{{
                            $t('sensitiveData.closeDetails') }}</el-button>
                </div>

                <div class="filter-section">
                    <div class="filter-header">
                        <span class="filter-label">{{ $t('sensitiveData.filter') }}：</span>
                        <el-input :placeholder="$t('sensitiveData.searchDataCategory')" v-model="searchKeyword"
                            prefix-icon="el-icon-search" class="category-search" @input="handleSearch" size="small"
                            clearable></el-input>
                    </div>

                    <div class="filter-tags-container">
                        <div class="filter-group">
                            <span class="filter-group-label">{{ $t('sensitiveData.riskLevel') }}：</span>
                            <div class="filter-tags level-filter">
                                <el-tag v-for="tag in levelFilterTags" :key="tag.value"
                                    :class="{ 'active-tag': levelFilterValue === tag.value }"
                                    @click="toggleLevelFilter(tag.value)" size="medium">
                                    {{ tag.label }}
                                </el-tag>
                            </div>
                        </div>

                        <div class="filter-group">
                            <span class="filter-group-label">{{ $t('sensitiveData.protectionStatus') }}：</span>
                            <div class="filter-tags status-filter">
                                <el-tag v-for="tag in statusFilterTags" :key="tag.value"
                                    :class="{ 'active-tag': statusFilterValue === tag.value }"
                                    @click="toggleStatusFilter(tag.value)" size="medium">
                                    {{ tag.label }}
                                </el-tag>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="sensitive-categories">
                    <div class="category-item" v-for="category in filteredCategories" :key="category.id">
                        <div class="category-header">
                            <div class="category-title-row">
                                <h2 class="full-path">{{ category.attachDataName }}</h2>
                            </div>
                            <div class="category-tags-row">
                                <el-tag class="security-level" :style="getRiskStyle(category.securityLevel)"
                                    size="mini">
                                    {{ category.securityLevelName }}
                                </el-tag>
                                <el-tag class="protection-status"
                                    :type="category.protectionMeasure === '1' ? 'success' : 'warning'" size="mini">
                                    <i
                                        :class="category.protectionMeasure === '1' ? 'el-icon-success' : 'el-icon-warning'"></i>{{
                                            getProtectionStatusText(category.protectionMeasure) }}
                                </el-tag>
                            </div>
                        </div>

                        <div class="category-description">
                            <p><strong>{{ $t('sensitiveData.categoryDescription') }}：</strong></p>
                            <span>{{ category.attachDataDescribe }}</span>
                        </div>

                        <div class="legal-basis">
                            <p><strong>{{ $t('sensitiveData.legalBasis') }}：</strong></p>
                            <span><svg-icon icon-class="law" style="margin-right: 5px;" />{{ category.regulatoryBasis
                                }}</span>
                        </div>

                        <div class="database-filter">
                            <p><strong>{{ $t('sensitiveData.relatedDatabases') }}：</strong></p>
                            <el-tag v-for="(db, index) in category.databaseNameList" :key="index"
                                @click="handleDatabaseFilter(db)"
                                :class="['database-tag', { 'active-tag': activeDatabaseId === db }]" size="medium">
                                {{ db }}
                            </el-tag>
                        </div>

                        <el-table :data="category.fields" style="width: 100%; margin-top: 10px;" size="mini">
                            <template slot="empty">
                                <el-empty :description="$t('noData')"></el-empty>
                            </template>
                            <el-table-column prop="tableName" align="center" :label="$t('sensitiveData.dataTableName')"
                                min-width="220"></el-table-column>
                            <el-table-column prop="fieldRemark" align="center" :label="$t('sensitiveData.fieldRemark')"
                                show-overflow-tooltip></el-table-column>
                            <el-table-column prop="dataValue" align="center" :label="$t('sensitiveData.sampleValue')"
                                width="180"></el-table-column>
                            <el-table-column prop="riskDisposeSuggest"
                                :label="$t('sensitiveData.riskDisposeSuggestion')" width="160">
                                <template slot="header">
                                    <div style="text-align: center;">{{ $t('sensitiveData.suggestedProtection') }}</div>
                                </template>
                                <template slot-scope="scope">
                                    <div v-if="scope.row.riskDisposeSuggest.length > 0">
                                        <el-tag v-for="suggestion in scope.row.riskDisposeSuggest" :key="suggestion"
                                            class="risk-tag"
                                            :class="{ 'tm-tag': isDesensitizeSuggestion(suggestion), 'jm-tag': isEncryptSuggestion(suggestion) }"
                                            size="mini">
                                            {{ getSuggestionLabel(suggestion) }}
                                        </el-tag>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="isMask" :label="$t('sensitiveData.isDesensitized')" align="center"
                                width="100">
                                <template slot-scope="scope">
                                    <el-select v-model="scope.row.isMask" size="mini"
                                        @change="handleDesensitizeChange(scope.row, scope.$index)" style="width: 100%;">
                                        <el-option :label="$t('yes')" value="1"></el-option>
                                        <el-option :label="$t('no')" value="0"></el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column prop="proofMaterial" :label="$t('sensitiveData.proofMaterial')"
                                align="center" width="200">
                                <template slot-scope="scope">
                                    <div class="proof-upload-container">
                                        <el-upload class="upload-btn" action="#" :auto-upload="false"
                                            :before-upload="beforeUpload"
                                            :on-change="handleFileUpload(scope.row, scope.$index)"
                                            :show-file-list="false">
                                            <el-button size="mini" icon="el-icon-upload" type="text">
                                                {{ scope.row.proofUrl ? $t('reupload') : $t('upload') }}
                                            </el-button>
                                        </el-upload>

                                        <el-image v-if="getProofUrl(scope.row.fieldId)"
                                            :src="getProofUrl(scope.row.fieldId)"
                                            :preview-src-list="[getProofUrl(scope.row.fieldId)]" class="proof-thumbnail"
                                            fit="cover" @error="handleImageError(scope.row.fieldId)"></el-image>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="isEncrypt" :label="$t('sensitiveData.isEncrypted')" align="center"
                                width="100">
                                <template slot-scope="scope">
                                    <div style="display: flex; align-items: center; justify-content: center;">
                                        <i :class="scope.row.isEncrypt == '1' ? 'el-icon-success' : 'el-icon-error'"
                                            style="margin-right: 5px;" />
                                        {{ scope.row.isEncrypt == '1' ? $t('yes') : $t('no') }}
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <Pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                        :current-page="pagination.currentPage" :page-sizes="[5, 10, 15, 20]"
                        :page-size="pagination.pageSize" layout="total, sizes, prev, pager, next, jumper"
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
            categoryId: 0,
            treeOptions: [],
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
            pagination: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            }
        };
    },
    computed: {
        levelFilterTags() {
            return [
                { label: this.$t('sensitiveData.levelTags.level5'), value: 'level5' },
                { label: this.$t('sensitiveData.levelTags.level4'), value: 'level4' },
                { label: this.$t('sensitiveData.levelTags.level3'), value: 'level3' },
                { label: this.$t('sensitiveData.levelTags.level2'), value: 'level2' }
            ]
        },
        statusFilterTags() {
            return [
                { label: this.$t('sensitiveData.unprotectedItem'), value: 'unprotected' },
                { label: this.$t('sensitiveData.protectedItem'), value: 'protected' }
            ]
        }
    },
    created() {
        this.gettreeOptionsList()
    },
    mounted() {
    },
    methods: {
        getProofUrl(fieldId) {
            const item = this.proofUrlList.find(item => item.fieldId === fieldId);
            return item ? item.url : null;
        },
        handleImageError(fieldId) {
            this.$message.error(this.$t('sensitiveData.imageLoadFailed'));
            this.proofUrlList = this.proofUrlList.filter(item => item.fieldId !== fieldId);
        },
        getProtectionStatusText(value) {
            return value === '1' ? this.$t('sensitiveData.protected') : this.$t('sensitiveData.unprotected')
        },
        isDesensitizeSuggestion(value) {
            return value === '脱敏' || value === this.$t('sensitiveData.desensitize')
        },
        isEncryptSuggestion(value) {
            return value === '加密' || value === this.$t('sensitiveData.encrypt')
        },
        getSuggestionLabel(value) {
            if (value === '脱敏') return this.$t('sensitiveData.desensitize')
            if (value === '加密') return this.$t('sensitiveData.encrypt')
            return value
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
        getSensitiveDataList(categoryId) {
            try {
                listSensitiveDataRiskAssessmentReport({ categoryId: categoryId }).then((response) => {
                    this.dataSourceList = response.data.dataSourceList;
                });
            } catch (error) {
                console.error('获取敏感数据列表失败', error);
            }
        },
        handleDesensitizeChange(row, index) {
            const params = {
                fieldId: row.fieldId,
                isMask: row.isMask
            }
            try {
                changeIsMask(params).then((response) => {
                    if (response.code === 200) {
                        this.$message.success(this.$t('sensitiveData.desensitizeStatusUpdatedSuccess'));
                        this.loadRiskDetails(this.datasourceId);
                    }
                });
            } catch (error) {
                this.$message.error(this.$t('sensitiveData.updateDesensitizeStatusFailed'));
            }
        },
        beforeUpload() {
            return false;
        },

        handleFileUpload(row, index) {
            return (file, fileList) => {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
                if (!allowedTypes.includes(file.raw.type)) {
                    this.$message.error(this.$t('sensitiveData.imageOnlyUpload'));
                    return false;
                }

                const maxSize = 5 * 1024 * 1024;
                if (file.raw.size > maxSize) {
                    this.$message.error(this.$t('sensitiveData.fileSizeLimit5MB'));
                    return false;
                }

                const formData = new FormData();
                formData.append('file', file.raw);
                formData.append('fieldId', row.fieldId);

                const loading = this.$loading({
                    lock: true,
                    text: this.$t('sensitiveData.uploadingProofMaterial'),
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });

                uploadEvidentiaryMaterialFile(formData).then((response) => {
                    loading.close();
                    if (response.code === 200) {
                        this.$message.success(this.$t('sensitiveData.proofMaterialUploadSuccess'));
                        const existingIndex = this.proofUrlList.findIndex(item => item.fieldId === row.fieldId);

                        if (existingIndex !== -1) {
                            this.proofUrlList[existingIndex].url = response.msg;
                        } else {
                            this.proofUrlList.push({
                                fieldId: row.fieldId,
                                url: response.msg
                            });
                        }

                        this.loadRiskDetails(this.datasourceId);
                    }
                }).catch(error => {
                    loading.close();
                    this.$message.error(this.$t('sensitiveData.proofMaterialUploadFailed'));
                });
            };
        },
        handleExport() {
            this.$message.success(this.$t('sensitiveData.exportingAllDataSourceRiskList'));
        },

        handleViewDetails(row) {
            this.currentDataSource = row;
            this.datasourceId = row.datasourceId;
            this.pagination.currentPage = 1;
            this.levelFilterValue = '';
            this.statusFilterValue = '';
            this.searchKeyword = '';
            this.activeDatabaseId = null;
            this.loadRiskDetails(row.datasourceId);
            this.showRiskDetails = true;
        },

        getRiskStyle(level) {
            const styles = {
                1: { color: '#16a34a', backgroundColor: '#f0fdf4', border: 'none' },
                2: { color: '#f97316', backgroundColor: '#fff7ed', border: 'none' },
                3: { color: '#c2410c', backgroundColor: '#ffedd5', border: 'none' },
                4: { color: '#dc2626', backgroundColor: '#fee2e2', border: 'none' },
                5: { color: '#991b1b', backgroundColor: '#fecaca', border: 'none' }
            };
            return styles[level] || { color: '#6b7280', backgroundColor: '#f3f4f6', border: 'none' };
        },

        loadRiskDetails(dataSourceId) {
            this.loading = true;
            const params = {
                datasourceId: dataSourceId,
                pageNum: this.pagination.currentPage,
                pageSize: this.pagination.pageSize,
                level: this.levelFilterValue ?
                    {
                        'level5': 5,
                        'level4': 4,
                        'level3': 3,
                        'level2': 2
                    }[this.levelFilterValue]
                    : '',
                protectionMeasure: this.statusFilterValue ?
                    this.statusFilterValue === 'protected' ? '1' : '0'
                    : '',
                categoryName: this.searchKeyword || '',
            };

            try {
                getViewDetails(params).then((response) => {
                    this.sensitiveCategories = response.data.pageInfo;
                    this.filteredCategories = [...this.sensitiveCategories];
                    this.pagination.total = response.data.total;
                    this.pagination.currentPage = response.data.pageNum;
                    this.pagination.pageSize = response.data.pageSize;
                    this.loading = false;
                });
            } catch (error) {
                console.error('获取风险详情失败', error);
                this.loading = false;
                this.sensitiveCategories = [];
                this.filteredCategories = [];
                this.pagination.total = 0;
            }
        },

        toggleLevelFilter(value) {
            if (this.levelFilterValue === value) {
                this.levelFilterValue = '';
            } else {
                this.levelFilterValue = value;
            }
            this.pagination.currentPage = 1;
            this.loadRiskDetails(this.datasourceId);
        },

        toggleStatusFilter(value) {
            if (this.statusFilterValue === value) {
                this.statusFilterValue = '';
            } else {
                this.statusFilterValue = value;
            }
            this.pagination.currentPage = 1;
            this.loadRiskDetails(this.datasourceId);
        },

        handleSearch() {
            this.pagination.currentPage = 1;
            this.loadRiskDetails(this.datasourceId);
        },

        handleDatabaseFilter(dbName) {
            this.activeDatabaseId = this.activeDatabaseId === dbName ? null : dbName;

            if (this.activeDatabaseId) {
                this.filteredCategories = this.sensitiveCategories.map(category => {
                    const filteredFields = category.fields.filter(field =>
                        field.databaseName === dbName
                    );
                    return {
                        ...category,
                        fields: filteredFields
                    };
                }).filter(category =>
                    category.fields.length > 0
                );
                this.$message.info(this.$t('sensitiveData.filteredDatabaseFields', { name: dbName }));
            } else {
                this.filteredCategories = [...this.sensitiveCategories];
                this.$message.info(this.$t('sensitiveData.canceledDatabaseFilter'));
            }
        },

        handleSizeChange(val) {
            this.pagination.pageSize = val;
            this.pagination.currentPage = 1;
            this.loadRiskDetails(this.datasourceId);
        },

        handleCurrentChange(val) {
            this.pagination.currentPage = val;
            this.loadRiskDetails(this.datasourceId);
        }
    },
};
</script>

<style lang="scss" scoped>
.sensitive-sensitive-data-risk-assessment {
    padding: 40px;
}

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

.risk-level-tag {
    margin-right: 5px;
}

.risk-level-tag:last-child {
    margin-right: 0;
}

.view-details-btn {
    color: #3b82f6;
    padding: 5px 0;
}

.close-btn {
    color: #F56C6C;
}

.filter-section {
    margin: 15px 0;
    padding: 12px 15px;
    // background-color: #f9fafb;
    // border-radius: 6px;
    // border: 1px solid #f0f2f5;
}

.filter-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 10px;
}


.filter-tags-container {
    // display: flex;
    // flex-wrap: wrap;
    // gap: 15px;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 0;
}

.filter-group-label,
.filter-label {
    font-weight: 600;
    color: #4e5969;
    white-space: nowrap;
    font-size: 14px;
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}


.filter-tags .el-tag,
.database-tag {
    cursor: pointer;
    color: #232b38;
    background-color: #e5e7eb;
    border: none;
    border-radius: 15px;
    line-height: 28px;
    transition: all 0.2s ease;
}

.filter-tags .el-tag:hover,
.database-filter .el-tag:hover {
    background-color: #d1d5db;
}

.database-tag {
    margin-left: 5px;
}

.active-tag {
    background-color: #263fa8 !important;
    color: white !important;
}

.category-search {
    flex: 1;
    min-width: 200px;
}

@media (max-width: 768px) {
    .filter-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .filter-tags-container {
        flex-direction: column;
        gap: 10px;
    }

    .filter-group {
        flex-direction: column;
        align-items: flex-start;
    }
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
    color: #3b82f6;
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
