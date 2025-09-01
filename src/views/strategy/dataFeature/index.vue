<template>
    <div class="feature-management-container">
        <!-- 搜索区域卡片 -->
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
            <!-- <el-form-item>
                <el-button type="primary" @click="handleSearch">
                    <i class="el-icon-search"></i> 查询
                </el-button>
                <el-button @click="handleReset" style="margin-left: 10px;">
                    <i class="el-icon-refresh"></i> 重置
                </el-button>
            </el-form-item> -->
        </el-form>

        <!-- 操作按钮区域 -->
        <div class="operation-buttons">
            <el-button type="primary" plain @click="handleAdd">
                <i class="el-icon-plus"></i> 新增
            </el-button>
            <el-button type="primary" plain @click="handleDelete" :disabled="selectedRows.length === 0">
                <i class="el-icon-delete"></i> 删除
            </el-button>
        </div>

        <!-- 数据表格 -->
        <el-table v-loading="loading" :data="tableData" style="width: 100%;" @selection-change="handleSelectionChange"
            size="small">
            <el-table-column type="selection" width="45" />
            <el-table-column prop="id" label="特征编号" width="120" />
            <el-table-column prop="featureName" label="特征名称" width="160" />
            <el-table-column prop="featureTypeName" label="特征类型" width="100" />
            <!-- <el-table-column prop="featureValue" label="特征值" min-width="180" /> -->
            <el-table-column prop="featureSourceName" label="来源" width="120" />
            <el-table-column prop="featureDescribe" label="描述" min-width="200" />
            <el-table-column prop="updateTime" label="更新时间" width="160" />
            <el-table-column label="操作" width="120" fixed="right">
                <template slot-scope="scope">
                    <el-button type="text" size="small" @click="handleView(scope.row)" class="view-btn">查看</el-button>
                    <el-button type="text" size="small" @click="handleEdit(scope.row)" class="edit-btn">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
            <Pagination v-show="pagination.total > 0" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :page.sync="pagination.currentPage"
                :limit.sync="pagination.pageSize" :total="pagination.total" size="small" />
        </div>

        <!-- 抽屉：查看/编辑 -->
        <el-drawer title="数据特征" :visible.sync="drawerVisible" direction="rtl" size="35%"
            :before-close="handleDrawerClose" :wrapperClosable="false">
            <!-- 根据特征类型动态渲染不同表单 -->
            <template v-if="form.featureType == '1'">
                <el-form :model="form" label-width="100px" :disabled="isView" size="small" class="feature-form"
                    label-position="top" :rules="rules">
                    <div class="basic-info-title">基本信息</div>
                    <el-divider style="margin: 10px 0;"></el-divider>
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
                <el-form :model="form" label-width="100px" :disabled="isView" size="small" class="feature-form"
                    :rules="rules" label-position="top">
                    <div class="basic-info-title">基本信息</div>
                    <el-divider style="margin: 10px 0;"></el-divider>
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
                                        <el-table :data="form.mappingList" style="margin-top: 10px; width: 100%"
                                            size="small" @selection-change="handleMappingSelectionChange">
                                            <!-- 新增：复选框列 -->
                                            <el-table-column type="selection" width="45" />
                                            <el-table-column prop="itemKey" label="特征值" width="180" />
                                            <el-table-column prop="itemValue" label="对照含义" min-width="180" />
                                            <!-- 已删除原有操作列 -->
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
                                        <el-table :data="form.mappingList" style="margin-top: 10px; width: 100%"
                                            size="small" @selection-change="handleMappingSelectionChange">
                                            <!-- 新增：复选框列 -->
                                            <el-table-column type="selection" width="45" />
                                            <el-table-column prop="tableName" label="表名" width="180" />
                                            <el-table-column prop="tableRemark" label="表注释" min-width="180" />
                                            <el-table-column prop="fieldName" label="字段名称" min-width="180" />
                                            <el-table-column prop="fieldRemark" label="字段注释" min-width="180" />
                                            <!-- 已删除原有操作列 -->
                                        </el-table>
                                    </template>

                                    <!-- 还原样式的提示条 -->
                                    <div class="import-format-tip"
                                        style="margin: 15px 0; padding: 10px; line-height: 1.5; font-size: 12px; color: #666; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px;">
                                        <i class="el-icon-warning-outline" type="info" />
                                        支持UTF-8编码的txt文件,每行一条请用英文逗号分隔关键字和对照值, 例如: sz,市值
                                    </div>

                                    <!-- 对照表分页 -->
                                    <div class="mapping-pagination" style="margin-top: 10px; text-align: right;">
                                        <Pagination v-show="mappingPagination.total > 0"
                                            @size-change="handleMappingSizeChange"
                                            @current-change="handleMappingCurrentChange"
                                            :page.sync="mappingPagination.currentPage"
                                            :limit.sync="mappingPagination.pageSize" :total="mappingPagination.total"
                                            size="small" />
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
                                    <svg-icon icon-class="导入" @click="handleImport"
                                        :class="{ 'icon-disabled': false }" class="icon"
                                        @click.native="isView && $event.stopPropagation()" />
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
            <div class="drawer-footer">
                <el-button @click="drawerVisible = false" size="small">取消</el-button>
                <el-button type="primary" plain @click="handleConfirm" v-if="!isView" size="small"
                    style="margin-left: 10px;">确认</el-button>
            </div>
        </el-drawer>
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
            // 搜索表单
            searchForm: {
                featureName: '',
                featureType: '',
                source: ''
            },
            // 表格数据
            tableData: [
            ],
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
                // mappingList: { required: true, message: '请输入特征值', trigger: 'change' },
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
                // this.pagination.currentPage = res.data.pageNum;
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
            // 实际项目中这里会调用接口获取数据
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
            // this.mappingPagination.currentPage = res.data.pageNum
            this.mappingPagination.pageSize = res.data.size
            // 如果当前页数据为空且不是第一页，自动跳转到上一页
            if (this.form.mappingList.length === 0 && this.mappingPagination.currentPage > 1) {
                this.mappingPagination.currentPage--;
            }
        },
        // 类型改变时处理
        handleTypeChange(type) {
            if (type === '正则') {
                this.form.mappingList = []
            } else if (type === '对照表') {
                this.form.featureValue = ''
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

            // 校验：特征值是否已存在（统一判断条件）
            // const exists = this.form.mappingList.some(item =>
            //     item.tableName === this.tempFeatureKey || item.itemKey === this.tempFeatureKey
            // );
            // if (exists) {
            //     this.$message.warning('该特征值已存在');
            //     return;
            // }

            // 构造通用参数（提取公共逻辑）
            const commonParams = {
                id: this.form.id == '系统默认生成' ? null : this.form.id,
                featureType: this.form.featureType
            };

            // 根据 featureType 差异化处理
            let requestParams;
            switch (this.form.featureType) {
                case '1':
                case '2':
                    requestParams = {
                        ...commonParams,
                        itemKey: this.tempFeatureKey,
                        itemValue: this.tempFeatureVal
                    };
                    break;
                case '3':
                    requestParams = {
                        ...commonParams,
                        tableName: this.tempFeatureKey,
                        tableRemark: this.tempFeatureVal,
                        fieldName: this.tempFeatureName,
                        fieldRemark: this.tempFeatureType
                    };
                    break;
                default:
                    this.$message.warning('无效的特征类型');
                    return;
            }

            // 调用接口或本地添加（统一逻辑）
            if (this.form.id !== '系统默认生成') {
                await addFeatureItem(requestParams);
                this.getFeatureItemListByFeatureId(this.form);
            } else {
                this.form.mappingList.push(
                    this.form.featureType === '3' ? requestParams : {
                        itemKey: requestParams.itemKey,
                        itemValue: requestParams.itemValue,
                    }
                );
            }
            // 统一清空输入（减少重复代码）
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
                    const res = await verifyFeatureName(params)
                    // 如果返回500，提示并终止执行
                    // if (res.code === 500) {
                    //     this.$message.warning('特征名称已存在')
                    //     return
                    // }
                } catch (error) {
                    // this.$message.error(error.message || '未知错误')
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
                        ? [{ tableName: this.form.featureValue }]
                        : this.form.mappingList
                }
                console.log('提交数据：', submitData)
                await addFeature(submitData)
                this.$message.success('新增成功')
                this.init()
            } else {
                // 验证特征名称是否存在
                const params = { id: this.form.id, featureName: this.form.featureName }
                try {
                    const res = await verifyFeatureName(params)
                    // 如果返回500，提示并终止执行
                    // if (res.code === 500) {
                    //     this.$message.warning('特征名称已存在')
                    //     return
                    // }
                } catch (error) {
                    // this.$message.error(error.message || '未知错误')
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
                        ? [{ tableName: this.form.featureValue }]
                        : this.form.mappingList
                }
                console.log('提交数据：', submitData)
                await updateFeature(submitData)
                this.$message.success('编辑成功')
                this.init()
            }

            this.pagination.total = this.tableData.length
            this.drawerVisible = false
            this.loading = false;
        },
        // 抽屉关闭前的处理
        handleDrawerClose(done) {
            this.$confirm('确定要关闭吗？未保存的数据将丢失。')
                .then(_ => {
                    done()
                })
                .catch(_ => { })
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
        // 新增：处理对照行选中事件
        handleMappingSelectionChange(val) {
            this.selectedMappingRows = val
        },
        // 新增：删除选中的对照行
        async deleteSelectedRows() {
            this.$confirm(`确定要删除选中的${this.selectedMappingRows.length}条数据吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const keysToDelete = this.selectedMappingRows.map(item => item.id)
                const params = {
                    ids: keysToDelete,
                    featureType: this.form.featureType
                }
                await deleteFeatureItem(params)
                this.selectedMappingRows = []
                this.getFeatureItemListByFeatureId(this.form);
                this.$message.success('删除成功')
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },
        // 新增：导入功能（示例实现）
        // 导入功能实现（仅发送文件流给后端）
        handleImport() {
            // 创建隐藏的文件选择input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.txt'; // 只接受txt文件
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);

            // 监听文件选择事件
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    document.body.removeChild(fileInput);
                    return;
                }

                // 校验文件大小（示例：不超过10MB）
                if (file.size > 10 * 1024 * 1024) {
                    this.$message.error('文件大小不能超过10MB');
                    document.body.removeChild(fileInput);
                    return;
                }

                try {
                    // 创建FormData对象，用于传输文件
                    const formData = new FormData();
                    // 追加文件流（注意：后端接口需对应此参数名，如"file"）
                    formData.append('file', file);
                    // 追加特征类型（根据后端需求传递，如当前编辑的特征类型）
                    if (this.form.featureType) {
                        formData.append('featureType', this.form.featureType);
                    }
                    // 追加特征ID（根据后端需求传递，如当前编辑的特征ID）
                    if (this.form.id && this.form.id !== '系统默认生成') {
                        formData.append('id', this.form.id);
                    }

                    // 发送文件流到后端（假设后端导入接口为importFeatureItem）
                    await importFeatureItem(formData);

                    // 导入成功后刷新对照表数据
                    this.getFeatureItemListByFeatureId(this.form);
                    this.$message.success('导入成功');
                } catch (error) {
                    this.$message.error('导入失败：' + (error.message || '未知错误'));
                } finally {
                    document.body.removeChild(fileInput);
                }
            };

            // 触发文件选择
            fileInput.click();
        },
        // 新增：导出功能（示例实现）
        // 导出功能实现
        handleExport() {
            if (this.form.mappingList.length === 0) {
                this.$message.warning('暂无数据可导出');
                return;
            }

            try {
                // 准备请求参数
                const requestData = {
                    id: this.form.id, // 假设特征ID存储在form中
                    featureType: this.form.featureType, // 要导出的映射列表
                };

                // 调用导出接口
                exportFeatureItem(requestData).then(response => {
                    // 创建Blob对象 - 使用Excel的MIME类型
                    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                    // 创建下载链接
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    // 文件名使用标准Excel扩展名.xlsx
                    a.download = `${this.form.featureName || '特征'}_对照表.xlsx`;
                    document.body.appendChild(a);

                    // 触发下载并清理
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    this.$message.success('导出成功');
                }).catch(error => {
                    this.$message.error('导出失败：' + error.message);
                });
            } catch (error) {
                this.$message.error('导出失败：' + error.message);
            }
        },
        // 新增：清空所有对照行
        async clearAllRows() {
            this.$confirm('确定要清空所有数据吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const params = {
                    id: this.form.id,
                    featureType: this.form.featureType
                }
                await deleteFeatureItemAll(params)
                this.form.mappingList = []
                this.selectedMappingRows = []
                this.getFeatureItemListByFeatureId(this.form);
                this.$message.success('清空成功')
            }).catch(() => {
                this.$message.info('已取消清空')
            })
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
    },
    mounted() {
        this.init() // 初始化
    },

}
</script>

<style scoped>
.feature-management-container {
    padding: 40px;
    background-color: #ffffff;
    min-height: 100vh;
    box-sizing: border-box;
}

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

.pagination-container {
    margin-top: 15px;
    text-align: right;
    /* position: absolute;
    bottom: 6%;
    right: 2%; */
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

/* 操作按钮样式 */

.view-btn {
    color: #409EFF;
}

.edit-btn {
    color: #67C23A;
}

.delete-btn {
    color: #F56C6C;
}

/deep/.el-drawer__header {
    color: #000000;
    font-size: 18px;
    background-color: rgb(230, 242, 255);
    font-weight: bold;
    padding-bottom: 20px;
    margin-bottom: 0;
}

.yuanDataClass /deep/ .el-form-item {
    width: 30%;
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

.basic-info-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
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
