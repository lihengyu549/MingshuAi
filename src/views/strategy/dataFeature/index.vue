<template>
    <div class="app-container">
        <!-- 搜索区域卡片 -->
        <el-card shadow="never" class="searchCard">
            <el-form :inline="true" :model="searchForm" class="yuanDataClass">
                <el-form-item label="特征名称">
                    <el-input v-model="searchForm.featureName" placeholder="请输入特征名称" clearable @input="handleSearch" />
                </el-form-item>
                <el-form-item label="特征类型">
                    <el-select v-model="searchForm.featureType" placeholder="请选择特征类型" clearable @change="handleSearch">
                        <el-option v-for="item in dict.type.sys_feature_type" :key="item.value" :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="来源">
                    <el-select v-model="searchForm.source" placeholder="请选择来源" clearable @change="handleSearch">
                        <el-option v-for="item in dict.type.sys_source" :key="item.value" :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 操作按钮区域 -->
        <div class="operation-buttons">
            <el-button type="primary" plain @click="handleAdd">
                <i class="el-icon-plus"></i> 新增
            </el-button>
            <el-button type="danger" plain @click="handleDelete" :disabled="selectedRows.length === 0">
                <i class="el-icon-close"></i> 删除
            </el-button>
        </div>

        <!-- 数据表格 -->
        <el-card shadow="never" class="table-card">
            <el-table v-loading="loading" :data="tableData" class="tableBox" style="width: 100%;"
                @selection-change="handleSelectionChange">
                <template slot="empty">
                    <el-empty description="暂无数据"></el-empty>
                </template>
                <el-table-column type="selection" align="center" width="45" />
                <el-table-column prop="featureName" label="特征名称" width="160" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <svg-icon icon-class="zhiwen" style="font-size: 16px; margin-right: 5px;" />
                        {{ scope.row.featureName }}
                    </template>
                </el-table-column>
                <el-table-column prop="featureTypeName" align="center" label="特征类型" width="100" show-overflow-tooltip />
                <el-table-column prop="featureSourceName" align="center" label="来源" width="120" show-overflow-tooltip />
                <el-table-column prop="featureDescribe" align="center" label="描述" min-width="200"
                    show-overflow-tooltip />
                <el-table-column prop="updateTime" align="center" label="更新时间" width="160" show-overflow-tooltip />
                <el-table-column align="center" label="操作" width="120" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
                        <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <Pagination v-show="pagination.total > 0" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :page.sync="pagination.currentPage"
                :limit.sync="pagination.pageSize" :total="pagination.total" size="small" />
        </el-card>

        <!-- 抽屉：查看/编辑 -->
        <Drawer v-loading="drawerLoading" title="数据特征" :visible.sync="drawerVisible" direction="rtl" size="35%"
            :before-close="handleDrawerClose" :wrapperClosable="false">
            <!-- 根据特征类型动态渲染不同表单 -->
            <template v-if="form.featureType == '1'">
                <el-form slot="body" :model="form" label-width="100px" :disabled="isView" size="small"
                    class="feature-form" label-position="top" :rules="rules">
                    <Title title="基本信息"></Title>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="编号:" prop="id">
                                <el-input class="form-input" v-model="form.id" disabled />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="名称:" prop="featureName">
                                <el-input class="form-input" v-model="form.featureName" placeholder="请输入名称" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="类型:" prop="featureType">
                                <el-select v-model="form.featureType" placeholder="请选择特征类型" @change="handleTypeChange"
                                    class="form-input">
                                    <el-option v-for="item in dict.type.sys_feature_type" :key="item.value"
                                        :label="item.label" :value="item.value">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="来源:" prop="source">
                                <el-select v-model="form.source" placeholder="请选择来源" class="form-input">
                                    <el-option v-for="item in dict.type.sys_source" :key="item.value"
                                        :label="item.label" :value="item.value">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="描述:" prop="description">
                        <el-input type="textarea" v-model="form.description" placeholder="请输入描述" rows="3" />
                    </el-form-item>
                    <el-form-item label="特征值:" prop="featureValue">
                        <el-input type="textarea" v-model="form.featureValue" placeholder="请输入正则表达式" rows="3" />
                    </el-form-item>
                </el-form>
            </template>

            <template v-else-if="form.featureType == '2' || form.featureType == '3'">
                <el-form slot="body" :model="form" label-width="100px" :disabled="isView" size="small"
                    class="feature-form" :rules="rules" label-position="top">
                    <Title title="基本信息"></Title>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="编号:" prop="id">
                                <el-input class="form-input" v-model="form.id" disabled />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="名称:" prop="featureName">
                                <el-input class="form-input" v-model="form.featureName" placeholder="请输入名称" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="类型:" prop="featureType">
                                <el-select v-model="form.featureType" placeholder="请选择特征类型" @change="handleTypeChange"
                                    class="form-input">
                                    <el-option v-for="item in dict.type.sys_feature_type" :key="item.value"
                                        :label="item.label" :value="item.value">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="来源:" prop="source">
                                <el-select v-model="form.source" placeholder="请选择来源" class="form-input">
                                    <el-option v-for="item in dict.type.sys_source" :key="item.value"
                                        :label="item.label" :value="item.value">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="描述:" prop="description">
                        <el-input type="textarea" v-model="form.description" placeholder="请输入描述" rows="3" />
                    </el-form-item>
                    <el-form-item label="特征值:" prop="mappingList">
                        <div class="mapping-table-container">
                            <!-- 新增：表格与右侧按钮组容器 -->
                            <div class="table-with-actions">
                                <!-- 对照表表格 && 数据字典表 -->
                                <div class="table-container">
                                    <template v-if="form.featureType == '2'">
                                        <div style="display: flex; justify-content: space-between;">
                                            <el-input v-model="tempFeatureKey" placeholder="请输入特征值" :disabled="isView"
                                                style="width: 48%;" />
                                            <el-input v-model="tempFeatureVal" placeholder="请输入对照含义" :disabled="isView"
                                                style="width: 48%;" />
                                        </div>
                                        <el-table :data="currentMappingPageData" style="margin-top: 10px; width: 100%"
                                            size="small" @selection-change="handleMappingSelectionChange">
                                            <!-- 新增：复选框列 -->
                                            <el-table-column type="selection" width="45" />
                                            <el-table-column prop="itemKey" label="特征值" width="180" />
                                            <el-table-column prop="itemValue" label="对照含义" min-width="180" />
                                        </el-table>
                                    </template>
                                    <template v-else-if="form.featureType == '3'">
                                        <div style="display: flex; justify-content: space-between;">
                                            <el-input v-model="tempFeatureKey" placeholder="请输入表名" :disabled="isView"
                                                style="width: 24%;" />
                                            <el-input v-model="tempFeatureVal" placeholder="请输入表注释" :disabled="isView"
                                                style="width: 24%;" />
                                            <el-input v-model="tempFeatureName" placeholder="请输入字段名称" :disabled="isView"
                                                style="width: 24%;" />
                                            <el-input v-model="tempFeatureType" placeholder="请输入字段注释" :disabled="isView"
                                                style="width: 24%;" />
                                        </div>
                                        <el-table :data="currentMappingPageData" style="margin-top: 10px; width: 100%"
                                            size="small" @selection-change="handleMappingSelectionChange">
                                            <!-- 新增：复选框列 -->
                                            <el-table-column type="selection" width="45" />
                                            <el-table-column prop="tableName" label="表名" width="180" />
                                            <el-table-column prop="tableRemark" label="表注释" min-width="180" />
                                            <el-table-column prop="fieldName" label="字段名称" min-width="180" />
                                            <el-table-column prop="fieldRemark" label="字段注释" min-width="180" />
                                        </el-table>
                                    </template>

                                    <!-- 还原样式的提示条 -->
                                    <div class="import-format-tip"
                                        style="margin: 15px 0; padding: 10px; line-height: 1.5; font-size: 12px; color: #666; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px;">
                                        <i class="el-icon-warning-outline" type="info" />
                                        支持UTF-8编码的txt文件,每行一条请用英文逗号分隔关键字和对照值, 例如:{{ form.featureType == '3' ?
                                            '表名,表注释,字段名称,字段注释' : '特征值,对照含义' }}
                                    </div>

                                    <!-- 对照表分页 -->
                                    <div class="mapping-pagination" style="margin-top: 10px; text-align: right;">
                                        <Pagination v-show="mappingPagination.total > 0"
                                            @size-change="handleMappingSizeChange"
                                            @current-change="handleMappingCurrentChange"
                                            :page.sync="mappingPagination.currentPage"
                                            :page-size.sync="mappingPagination.pageSize"
                                            :total="mappingPagination.total" size="small" />
                                    </div>
                                </div>

                                <!-- 右侧竖排按钮组 -->
                                <div class="vertical-actions">
                                    <svg-icon icon-class="plus-circle" @click="addMappingRow"
                                        :class="{ 'icon-disabled': isView || !tempFeatureKey || !tempFeatureVal }"
                                        class="icon"
                                        @click.native="(isView || !tempFeatureKey || !tempFeatureVal) && $event.stopPropagation()" />
                                    <svg-icon icon-class="删除" @click="deleteSelectedRows"
                                        :class="{ 'icon-disabled': isView || selectedMappingRows.length === 0 }"
                                        class="icon"
                                        @click.native="(isView || selectedMappingRows.length === 0) && $event.stopPropagation()" />
                                    <svg-icon icon-class="导入" @click="handleImport" :class="{ 'icon-disabled': isView }"
                                        class="icon" @click.native="isView && $event.stopPropagation()" />
                                    <svg-icon icon-class="导出" @click="handleExport"
                                        :class="{ 'icon-disabled': isView || form.id == '系统默认生成' }" class="icon"
                                        @click.native="isView && $event.stopPropagation()" />
                                    <svg-icon icon-class="清空" @click="clearAllRows"
                                        :class="{ 'icon-disabled': isView || form.mappingList.length === 0 }"
                                        class="icon"
                                        @click.native="(isView || form.mappingList.length === 0) && $event.stopPropagation()" />
                                </div>
                            </div>

                            <!-- 原有新增行输入框 -->
                            <div class="table-hint" v-if="form.mappingList.length === 0">
                                <span>暂无数据，请点击"添加"按钮新增</span>
                            </div>
                        </div>
                    </el-form-item>
                </el-form>
            </template>

            <!-- 抽屉底部按钮 -->
            <div slot="footer" class="drawer-footer">
                <el-button @click="handleCancel" size="small">取消</el-button>
                <el-button type="primary" plain @click="handleConfirm" v-if="!isView" size="small"
                    style="margin-left: 10px;">确认</el-button>
            </div>
        </Drawer>
    </div>
</template>

<script>
import { getPageListFeature, addFeature, getFeatureById, updateFeature, deleteFeature, getFeatureItemListByFeatureId, addFeatureItem, deleteFeatureItem, deleteFeatureItemAll, importFeatureItem, exportFeatureItem, verifyFeatureName } from '@/api/system/systemPolicy'
export default {
    name: 'DataFeature',
    dicts: ['sys_feature_type', 'sys_source'],
    data() {
        return {
            // 遮罩层
            loading: false,
            // 明确初始化drawerLoading为false
            drawerLoading: false,
            // 搜索表单
            searchForm: {
                featureName: '',
                featureType: '',
                source: ''
            },
            // 表格数据
            tableData: [],
            // 分页
            pagination: {
                currentPage: 1,
                pageSize: 10,
                total: 0
            },
            // 选中的行
            selectedRows: [],
            // 抽屉控制
            drawerVisible: false,
            isView: false, // 是否为“查看”模式（true: 只读；false: 可编辑）
            // 表单数据（抽屉用）
            form: {
                id: '系统默认生成',
                featureName: '',
                source: '1',
                featureType: '1',
                description: '',
                featureValue: '',
                mappingList: [] // 对照表专用：存储键值对
            },
            // 临时变量（对照表动态行）
            tempFeatureKey: '',
            tempFeatureVal: '',
            tempFeatureName: '',
            tempFeatureType: '',
            rules: {
                id: { required: true, message: '请输入id', trigger: 'blur' },
                featureName: { required: true, message: '请输入名称', trigger: 'blur' },
                source: { required: true, message: '请输入来源', trigger: 'blur' },
                featureType: { required: true, message: '请输入类型', trigger: 'blur' },
                description: { required: true, message: '请输入描述', trigger: 'blur' },
                featureValue: { required: true, message: '请输入特征值', trigger: 'blur' },
            },
            // 新增：存储选中的对照行
            selectedMappingRows: [],
            // 对照表分页配置
            mappingPagination: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            },
        }
    },
    // 添加beforeCreate钩子以确保属性可用性
    beforeCreate() {
        // 确保this.drawerLoading已被定义
        this._data = this._data || {};
        this._data.drawerLoading = false;
    },
    computed: {
        // 计算当前页的对照表数据
        currentMappingPageData() {
            const start = (this.mappingPagination.currentPage - 1) * this.mappingPagination.pageSize
            const end = start + this.mappingPagination.pageSize
            return this.form.mappingList.slice(start, end)
        }
    },
    methods: {
        // 初始化
        async init() {
            this.loading = true; // 开始加载时显示loading
            try {
                let params = {
                    pageNum: this.pagination.currentPage,
                    pageSize: this.pagination.pageSize,
                    featureName: this.searchForm.featureName,
                    featureType: this.searchForm.featureType,
                    source: this.searchForm.source
                };
                const res = await getPageListFeature(params);
                this.tableData = res.data.records;
                this.pagination.pageSize = res.data.size;
                this.pagination.total = res.data.total;
            } catch (error) {
                this.$message.error('数据加载失败：' + (error.message || '未知错误'));
                this.tableData = []; // 加载失败时清空表格
                this.pagination.total = 0;
            } finally {
                this.loading = false; // 无论成功失败都关闭loading
            }
        },
        // 搜索
        handleSearch() {
            this.init()
        },
        // 重置搜索
        handleReset() {
            this.searchForm = {
                featureName: '',
                featureType: '',
                source: ''
            }
            this.init()
        },
        // 新增
        handleAdd() {
            this.isView = false
            this.form = {
                id: '系统默认生成',
                featureName: '',
                source: '1',
                featureType: '1',
                description: '',
                featureValue: '',
                mappingList: []
            }
            this.tempFeatureKey = ''
            this.tempFeatureVal = ''
            this.tempFeatureName = ''
            this.tempFeatureType = ''
            this.mappingPagination = {
                currentPage: 1,
                pageSize: 5,
                total: 0
            }
            this.drawerVisible = true
        },
        // 删除选中项
        async handleDelete() {
            try {
                await this.$confirm(
                    `确定要删除选中的${this.selectedRows.length}条数据吗?`,
                    '提示',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                );

                this.loading = true; // 开始删除操作时显示loading
                const params = {
                    ids: this.selectedRows.map(item => item.id)
                };
                await deleteFeature(params);
                this.$message.success('删除成功');
                await this.init(); // 重新加载数据
                this.selectedRows = [];
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error('删除失败：' + (error.message || '未知错误'));
                } else {
                    this.$message.info('已取消删除');
                }
            } finally {
                this.loading = false; // 无论成功失败都关闭loading
            }
        },
        // 表格多选事件
        handleSelectionChange(val) {
            this.selectedRows = val
        },
        // 查看
        handleView(row) {
            this.isView = true
            this.setFormData(row)
            this.drawerVisible = true
        },
        // 编辑
        handleEdit(row) {
            this.isView = false
            this.setFormData(row)
            this.drawerVisible = true
        },
        // 填充表单数据
        async setFormData(row) {
            const res = await getFeatureById({ featureId: row.id })
            this.form.id = res.data.id
            this.form.featureName = res.data.featureName
            this.form.source = res.data.featureSource
            this.form.featureType = res.data.featureType
            this.form.description = res.data.featureDescribe

            if (row.featureType == '1') {
                this.form.featureValue = res.data.featureValue
                this.form.mappingList = [] // 清空对照表数据
            } else if (row.featureType == '2' || row.featureType == '3') {
                // 解析特征值为键值对
                this.getFeatureItemListByFeatureId(row)
                this.form.featureValue = '' // 正则模式的特征值置空
            }
            this.mappingPagination.total = this.form.mappingList.length;
            this.tempFeatureKey = ''
            this.tempFeatureVal = ''
            this.tempFeatureName = ''
            this.tempFeatureType = ''
        },
        // 查询对照表数据
        async getFeatureItemListByFeatureId(row) {
            const params = {
                featureId: row.id,
                pageNum: 1,
                pageSize: 10,
                featureType: row.featureType
            }
            const res = await getFeatureItemListByFeatureId(params)
            this.form.mappingList = res.data.records
            this.mappingPagination.total = res.data.total
            this.mappingPagination.pageSize = res.data.size
            // 如果当前页数据为空且不是第一页，自动跳转到上一页
            if (this.form.mappingList.length === 0 && this.mappingPagination.currentPage > 1) {
                this.mappingPagination.currentPage--;
            }
        },
        // 类型改变时处理
        handleTypeChange(type) {
            // 切换类型时清空导入的数据
            this.form.mappingList = [];
            this.mappingPagination.total = 0;
            this.mappingPagination.currentPage = 1;

            if (type === '1') {
                this.form.featureValue = '';
            } else if (type === '2' || type === '3') {
                this.form.featureValue = '';
                this.tempFeatureKey = '';
                this.tempFeatureVal = '';
                this.tempFeatureName = '';
                this.tempFeatureType = '';
            }
        },
        // 对照表：新增一行
        async addMappingRow() {
            // 基础校验：输入是否为空
            if (this.form.featureType === '2') {
                // 当featureType为2时，只校验前两个值
                if (!this.tempFeatureKey || !this.tempFeatureVal) {
                    this.$message.warning('特征值、对照含义不能为空');
                    return;
                }
            } else if (this.form.featureType === '3') {
                // 当featureType为3时，校验所有四个值
                if (!this.tempFeatureKey || !this.tempFeatureVal || !this.tempFeatureName || !this.tempFeatureType) {
                    this.$message.warning('表名、表注释、字段名、字段备注不能为空');
                    return;
                }
            }
            // 添加重复检查逻辑
            let isDuplicate = false;
            if (this.form.featureType === '3') {
                // 对于类型3，检查同一个表名下是否有重复的字段名
                isDuplicate = this.form.mappingList.some(item =>
                    item.tableName === this.tempFeatureKey && item.fieldName === this.tempFeatureName
                );
                if (isDuplicate) {
                    this.$message.warning(`表名"${this.tempFeatureKey}"下已存在字段"${this.tempFeatureName}"，同一个表名下不能有重复字段`);
                    return;
                }
            } else {
                // 对于其他类型，检查itemKey是否重复
                isDuplicate = this.form.mappingList.some(item =>
                    item.itemKey === this.tempFeatureKey
                );
                if (isDuplicate) {
                    this.$message.warning('已存在相同的特征值，请不要重复添加');
                    return;
                }
            }

            this.form.mappingList.push(
                this.form.featureType === '3' ? {
                    tableName: this.tempFeatureKey,
                    tableRemark: this.tempFeatureVal,
                    fieldName: this.tempFeatureName,
                    fieldRemark: this.tempFeatureType
                } : {
                    itemKey: this.tempFeatureKey,
                    itemValue: this.tempFeatureVal,
                }
            );
            this.mappingPagination.total = this.form.mappingList.length;

            // 统一清空输入
            this.tempFeatureKey = '';
            this.tempFeatureVal = '';
            this.tempFeatureName = '';
            this.tempFeatureType = '';
        },
        // 确认提交
        async handleConfirm() {
            // 表单验证
            if (this.form.featureType === '1' && !this.form.featureValue) {
                this.$message.warning('请输入特征值')
                return
            }

            if ((this.form.featureType === '2' || this.form.featureType === '3') && this.form.mappingList.length === 0) {
                this.$message.warning('请添加至少一条对照数据')
                return
            }

            this.loading = true;

            // 实际项目中这里会调用保存接口
            if (this.form.id === '系统默认生成') {
                // 验证特征名称是否存在
                const params = { featureName: this.form.featureName }
                try {
                    await verifyFeatureName(params)
                } catch (error) {
                    this.$message.error(error.message || '未知错误')
                    this.loading = false;
                    return
                }
                // 新增操作
                // 构建提交数据
                let submitData = {
                    featureName: this.form.featureName,
                    featureType: this.form.featureType,
                    featureSource: this.form.source,
                    featureDescribe: this.form.description,
                    [this.form.featureType == '3' ? 'featureDataDictionariesList' : 'featureItemList']: this.form.featureType == '1'
                        ? [{ itemKey: this.form.featureValue }]
                        : this.form.mappingList
                }
                await addFeature(submitData)
                this.$message.success('新增成功')
                this.init()
            } else {
                // 验证特征名称是否存在
                const params = { id: this.form.id, featureName: this.form.featureName }
                try {
                    await verifyFeatureName(params)
                } catch (error) {
                    this.$message.error(error.message || '未知错误')
                    this.loading = false;
                    return
                }
                // 编辑操作
                let submitData = {
                    id: this.form.id,
                    featureName: this.form.featureName,
                    featureType: this.form.featureType,
                    featureSource: this.form.source,
                    featureDescribe: this.form.description,
                    [this.form.featureType == '3' ? 'featureDataDictionariesList' : 'featureItemList']: this.form.featureType == '1'
                        ? [{ itemKey: this.form.featureValue }]
                        : this.form.mappingList
                }
                await updateFeature(submitData)
                this.$message.success('编辑成功')
                this.init()
            }

            this.pagination.total = this.tableData.length
            this.drawerVisible = false
            this.loading = false;
        },
        // 取消按钮处理
        handleCancel() {
            this.clearUploadedData();
            this.drawerVisible = false;
        },
        // 抽屉关闭前的处理
        handleDrawerClose(done) {
            this.clearUploadedData();
            done();
        },
        // 清空上传的数据
        clearUploadedData() {
            this.form.mappingList = [];
            this.mappingPagination = {
                currentPage: 1,
                pageSize: 5,
                total: 0
            };
            this.tempFeatureKey = '';
            this.tempFeatureVal = '';
            this.tempFeatureName = '';
            this.tempFeatureType = '';
        },
        // 分页-改变页码
        async handleCurrentChange(val) {
            this.pagination.currentPage = val;
            this.loading = true; // 切换页码时显示loading
            try {
                await this.init(); // 复用init方法加载数据
            } finally {
                this.loading = false;
            }
        },
        // 分页-改变页大小
        async handleSizeChange(val) {
            this.pagination.pageSize = val;
            this.pagination.currentPage = 1;
            this.loading = true; // 改变页大小时显示loading
            try {
                await this.init(); // 复用init方法加载数据
            } finally {
                this.loading = false;
            }
        },
        // 对照表分页-改变页码
        handleMappingCurrentChange(val) {
            this.mappingPagination.currentPage = val;
        },
        // 对照表分页-改变页大小
        handleMappingSizeChange(val) {
            this.mappingPagination.pageSize = val;
            this.mappingPagination.currentPage = 1;
        },
        // 处理对照行选中事件
        handleMappingSelectionChange(val) {
            this.selectedMappingRows = val
        },
        // 删除选中的对照行
        deleteSelectedRows() {
            this.$confirm(`确定要删除选中的${this.selectedMappingRows.length}条数据吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 获取选中行的唯一标识（根据实际数据结构调整）
                const selectedIds = this.selectedMappingRows.map(item => {
                    // 对于不同特征类型使用不同的唯一标识组合
                    if (this.form.featureType === '3') {
                        return `${item.tableName}-${item.fieldName}`;
                    }
                    return item.itemKey;
                });

                // 过滤掉选中的行，只保留未选中的数据
                this.form.mappingList = this.form.mappingList.filter(item => {
                    const itemId = this.form.featureType === '3'
                        ? `${item.tableName}-${item.fieldName}`
                        : item.itemKey;
                    return !selectedIds.includes(itemId);
                });

                // 更新分页信息
                this.mappingPagination.total = this.form.mappingList.length;
                // 重置选中状态
                this.selectedMappingRows = [];
                // 如果当前页数据为空且不是第一页，自动跳转到上一页
                if (this.currentMappingPageData.length === 0 && this.mappingPagination.currentPage > 1) {
                    this.mappingPagination.currentPage--;
                }

                this.$message.success('删除成功');
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        // 清空所有对照行
        clearAllRows() {
            this.$confirm('确定要清空所有数据吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 直接清空本地表格数据
                this.form.mappingList = [];
                // 重置分页信息
                this.mappingPagination = {
                    currentPage: 1,
                    pageSize: 5,
                    total: 0
                };
                // 重置选中状态
                this.selectedMappingRows = [];

                this.$message.success('清空成功');
            }).catch(() => {
                this.$message.info('已取消清空');
            });
        },
        // 导入功能实现
        handleImport() {
            if (this.isView) return; // 查看模式下不执行

            // 检查是否已选择特征类型
            if (!['2', '3'].includes(this.form.featureType)) {
                this.$message.warning('请先选择特征类型（2或3）');
                return;
            }

            // 创建隐藏的文件选择input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.txt'; // 只接受txt文件
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);

            // 监听文件选择事件
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) {
                    document.body.removeChild(fileInput);
                    return;
                }

                // 校验文件大小（不超过1MB）
                if (file.size > 1 * 1024 * 1024) {
                    this.$message.error('文件大小不能超过1MB');
                    document.body.removeChild(fileInput);
                    return;
                }

                try {
                    // 设置加载状态为true，显示遮罩
                    this.drawerLoading = true;

                    // 读取文件内容
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const content = event.target.result;
                            const lines = content.split('\n');
                            const newData = [];

                            // 根据featureType解析不同格式的数据
                            if (this.form.featureType === '2') {
                                // 特征类型2：每行格式为"特征值,对照含义"
                                lines.forEach((line, index) => {
                                    const trimmedLine = line.trim();
                                    if (trimmedLine) {
                                        const parts = trimmedLine.split(',');
                                        if (parts.length >= 2) {
                                            newData.push({
                                                itemKey: parts[0].trim(),
                                                itemValue: parts.slice(1).join(',').trim()
                                            });
                                        } else {
                                            this.$message.warning(`第${index + 1}行格式不正确，已跳过`);
                                        }
                                    }
                                });
                            } else if (this.form.featureType === '3') {
                                // 特征类型3：每行格式为"表名,表注释,字段名称,字段注释"
                                lines.forEach((line, index) => {
                                    const trimmedLine = line.trim();
                                    if (trimmedLine) {
                                        const parts = trimmedLine.split(',');
                                        if (parts.length >= 4) {
                                            newData.push({
                                                tableName: parts[0].trim(),
                                                tableRemark: parts[1].trim(),
                                                fieldName: parts[2].trim(),
                                                fieldRemark: parts.slice(3).join(',').trim()
                                            });
                                        } else {
                                            this.$message.warning(`第${index + 1}行格式不正确，已跳过`);
                                        }
                                    }
                                });
                            }

                            // 添加去重逻辑
                            const uniqueData = [];
                            let duplicateCount = 0;

                            // 创建现有数据的索引，用于快速查找重复项
                            const existingDataIndex = new Map();

                            if (this.form.featureType === '2') {
                                // 对于类型2，基于itemKey创建索引
                                this.form.mappingList.forEach(item => {
                                    existingDataIndex.set(item.itemKey, true);
                                });
                            } else if (this.form.featureType === '3') {
                                // 对于类型3，基于tableName和fieldName的组合创建索引
                                this.form.mappingList.forEach(item => {
                                    const key = `${item.tableName}_${item.fieldName}`;
                                    existingDataIndex.set(key, true);
                                });
                            }

                            // 对新数据进行去重
                            if (this.form.featureType === '2') {
                                // 类型2：检查itemKey是否重复
                                const tempMap = new Map();
                                newData.forEach(item => {
                                    // 检查是否与现有数据重复
                                    if (existingDataIndex.has(item.itemKey)) {
                                        duplicateCount++;
                                        return;
                                    }
                                    // 检查是否与新数据内部重复
                                    if (!tempMap.has(item.itemKey)) {
                                        tempMap.set(item.itemKey, true);
                                        uniqueData.push(item);
                                    } else {
                                        duplicateCount++;
                                    }
                                });
                            } else if (this.form.featureType === '3') {
                                // 类型3：检查tableName和fieldName的组合是否重复
                                const tempMap = new Map();
                                newData.forEach(item => {
                                    const key = `${item.tableName}_${item.fieldName}`;
                                    // 检查是否与现有数据重复
                                    if (existingDataIndex.has(key)) {
                                        duplicateCount++;
                                        return;
                                    }
                                    // 检查是否与新数据内部重复
                                    if (!tempMap.has(key)) {
                                        tempMap.set(key, true);
                                        uniqueData.push(item);
                                    } else {
                                        duplicateCount++;
                                    }
                                });
                            }

                            // 如果所有数据都是重复的，直接提示
                            if (uniqueData.length === 0) {
                                this.$message.warning(`导入的${newData.length}条数据全部已存在，未添加新数据`);
                                this.drawerLoading = false;
                                return;
                            }

                            // 处理大量数据时使用requestAnimationFrame避免卡顿
                            let currentIndex = 0;
                            const batchSize = 100; // 每次处理100条数据

                            const processBatch = () => {
                                const endIndex = Math.min(currentIndex + batchSize, uniqueData.length);
                                for (let i = currentIndex; i < endIndex; i++) {
                                    this.form.mappingList.push(uniqueData[i]);
                                }
                                currentIndex = endIndex;

                                if (currentIndex < uniqueData.length) {
                                    requestAnimationFrame(processBatch);
                                } else {
                                    // 全部处理完成后更新分页
                                    this.mappingPagination.total = this.form.mappingList.length;
                                    this.mappingPagination.currentPage = 1; // 重置到第一页

                                    // 显示导入结果提示
                                    let message = `成功导入${uniqueData.length}条数据`;
                                    if (duplicateCount > 0) {
                                        message += `，跳过了${duplicateCount}条重复数据`;
                                    }
                                    this.$message.success(message);

                                    // 数据处理完成，设置加载状态为false
                                    this.drawerLoading = false;
                                }
                            };

                            // 开始分批处理数据
                            processBatch();

                        } catch (error) {
                            this.$message.error('文件解析失败: ' + error.message);
                            // 处理失败，设置加载状态为false
                            this.drawerLoading = false;
                        }
                    };

                    reader.onerror = () => {
                        this.$message.error('文件读取失败');
                        // 读取失败，设置加载状态为false
                        this.drawerLoading = false;
                    };

                    reader.readAsText(file, 'UTF-8'); // 明确指定UTF-8编码

                } catch (error) {
                    this.$message.error('导入失败: ' + error.message);
                    // 导入异常，设置加载状态为false
                    this.drawerLoading = false;
                } finally {
                    document.body.removeChild(fileInput);
                }
            };

            // 触发文件选择对话框
            fileInput.click();
        },
        // 导出功能（保留原功能）
        handleExport() {
            // 原导出功能实现
            if (this.isView || this.form.id === '系统默认生成') return;

            const params = {
                id: this.form.id,
                featureType: this.form.featureType
            };

            exportFeatureItem(params).then(res => {
                // 修改MIME类型为Excel格式
                const blob = new Blob([res], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                // 修改文件扩展名为.xlsx
                a.download = `${this.form.featureName}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.$message.success('导出成功');
            }).catch(error => {
                this.$message.error('导出失败: ' + (error.message || '未知错误'));
            });
        }
    },
    mounted() {
        this.init()
    }
}
</script>

<style scoped>
.page-title {
    font-size: 18px;
    color: #333;
    margin-bottom: 15px;
    font-weight: 600;
}



.operation-buttons {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
}

.searchCard {
    border-radius: 10px;
    margin-bottom: 20px;
}

.table-card {
    border-radius: 10px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.table-card ::v-deep .el-card__body {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.tableBox {
    overflow-y: auto;
    border: none;
    border-radius: 0;
    border-bottom: 1px solid #e2e8f0;
}

/* 抽屉样式 */
::v-deep .el-drawer__body {
    padding: 20px;
    overflow-y: auto;
}


.feature-form {
    margin-top: 10px;
}

.feature-form .el-form-item {
    margin-bottom: 15px;
}

.mapping-table-container,
.table-container {
    width: 100%;
}

.table-hint {
    text-align: center;
    padding: 20px;
    color: #999;
    font-size: 14px;
}

.drawer-footer {
    text-align: right;
    margin-top: 10px;
}


.delete-btn {
    color: #F56C6C;
}

.yuanDataClass /deep/ .el-form-item {
    width: 30%;
    margin-bottom: 0;
}

.yuanDataClass /deep/ .el-form-item__label {
    /* width: 25%; */
}

.yuanDataClass /deep/ .el-form-item__content {
    width: 75%;
}

.yuanDataClass /deep/ .el-select {
    width: 100%;
}

.form-input {
    width: 95%;
}

/* 表格与按钮组容器 */
.table-with-actions {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    justify-content: space-evenly;
}

/* 右侧竖排按钮组样式 */
.vertical-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* 按钮提示样式 */
.vertical-actions .el-button {
    position: relative;
}

.vertical-actions .el-button:hover::after {
    content: attr(tooltip);
    position: absolute;
    right: 30px;
    white-space: nowrap;
    background: #333;
    color: #fff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}


.el-divider--horizontal {
    margin: 10px 0;
    height: 3px;
}

.el-divider--horizontal::before {
    content: "";
    /* 伪元素必须设置content属性 */
    position: absolute;
    /* 设置定位使top/left生效 */
    top: 0;
    left: 0;
    height: 3px;
    width: 10%;
    background-color: #009dff;
}

.mapping-pagination .pagination-container {
    position: relative;
    right: -3%;
}

.icon {
    width: 1.5em;
    height: 1.5em;
    margin: 6px auto;
    cursor: pointer;
}

.icon-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}
</style>
