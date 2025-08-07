<template>
    <div class="feature-management-container">
        <!-- 搜索区域卡片 -->
        <el-form :inline="true" :model="searchForm">
            <el-form-item label="特征名称:">
                <el-input v-model="searchForm.featureName" placeholder="请输入特征名称" clearable style="width: 200px;" />
            </el-form-item>
            <el-form-item label="特征类型:">
                <el-select v-model="searchForm.featureType" placeholder="请选择特征类型" clearable style="width: 180px;">
                    <el-option v-for="item in dict.type.sys_feature_type" :key="item.value" :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="来源:">
                <el-select v-model="searchForm.source" placeholder="请选择来源" clearable style="width: 180px;">
                    <el-option v-for="item in dict.type.sys_source" :key="item.value" :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <!-- <el-button type="primary" @click="handleSearch">
            <i class="el-icon-search"></i> 查询
          </el-button> -->
                <el-button @click="handleReset" style="margin-left: 10px;">
                    <i class="el-icon-refresh"></i> 重置
                </el-button>
            </el-form-item>
        </el-form>

        <!-- 操作按钮区域 -->
        <div class="operation-buttons">
            <el-button type="primary" @click="handleAdd">
                <!-- <i class="el-icon-plus"></i>  -->新增
            </el-button>
            <el-button type="primary" plain @click="handleDelete" :disabled="selectedRows.length === 0">
                <!-- <i class="el-icon-delete"></i>  -->删除
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
                        <el-input v-model="form.featureValue" placeholder="请输入正则表达式" />
                    </el-form-item>
                </el-form>
            </template>

            <template v-else-if="form.featureType == '2'">
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
                                <!-- 对照表表格 -->
                                <div class="table-container">
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
                                    <el-button icon="el-icon-plus" type="primary" @click="addMappingRow" size="small"
                                        :disabled="isView || !tempFeatureKey || !tempFeatureVal"
                                        tooltip="新增"></el-button>
                                    <el-button icon="el-icon-delete" type="danger" @click="deleteSelectedRows"
                                        size="small" :disabled="isView || selectedMappingRows.length === 0"
                                        tooltip="删除选中"></el-button>
                                    <el-button icon="el-icon-upload" type="warning" @click="handleImport" size="small"
                                        :disabled="isView" tooltip="导入"></el-button>
                                    <el-button icon="el-icon-download" type="success" @click="handleExport" size="small"
                                        :disabled="isView" tooltip="导出"></el-button>
                                    <el-button icon="el-icon-delete" type="info" @click="clearAllRows" size="small"
                                        :disabled="isView || form.mappingList.length === 0" tooltip="清空"></el-button>
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
                <el-button type="primary" @click="handleConfirm" v-if="!isView" size="small"
                    style="margin-left: 10px;">确认</el-button>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import { getPageListFeature, addFeature, getFeatureById, updateFeature, deleteFeature } from '@/api/system/systemPolicy'


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
            let params = {
                pageNum: this.pagination.currentPage,
                pageSize: this.pagination.pageSize,
                featureName: this.searchForm.featureName,
                featureType: this.searchForm.featureType,
                source: this.searchForm.source
            }
            const res = await getPageListFeature(params)
            this.tableData = res.data.records
            this.pagination.currentPage = res.data.pages
            this.pagination.pageSize = res.data.size
            this.pagination.total = res.data.total
            console.log('数据特征列表', res.data);
        },
        // 搜索
        handleSearch() {
            console.log('搜索条件：', this.searchForm)
            // 实际项目中这里会调用接口获取数据
        },
        // 重置搜索
        handleReset() {
            this.searchForm = {
                featureName: '',
                featureType: '',
                source: ''
            }
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
            this.drawerVisible = true
        },
        // 删除选中项
        async handleDelete() {
            try {
                // 使用await等待用户确认，避免回调嵌套
                await this.$confirm(
                    `确定要删除选中的${this.selectedRows.length}条数据吗?`,
                    '提示',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                );

                // 用户点击确定后执行删除逻辑
                const params = {
                    ids: this.selectedRows.map(item => item.id)
                }
                await deleteFeature(params);
                this.$message.success('删除成功');
                this.init();
                this.selectedRows = [];
                this.pagination.total = this.tableData.length;

            } catch (error) {
                // 用户点击取消或操作中断时执行
                // 排除因点击取消导致的错误提示
                if (error !== 'cancel') {
                    this.$message.error('删除失败：' + (error.message || '未知错误'));
                } else {
                    this.$message.info('已取消删除');
                }
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
            } else if (row.featureType == '2') {
                // 解析特征值为键值对
                this.form.mappingList = res.data.featureItemList
                this.form.featureValue = '' // 正则模式的特征值置空
            }
            this.mappingPagination.total = this.form.mappingList.length;
            this.tempFeatureKey = ''
            this.tempFeatureVal = ''
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
        addMappingRow() {
            if (this.tempFeatureKey && this.tempFeatureVal) {
                // 检查是否已存在相同的特征值
                const exists = this.form.mappingList.some(item => item.itemKey === this.tempFeatureKey)
                if (exists) {
                    this.$message.warning('该特征值已存在')
                    return
                }

                this.form.mappingList.push({
                    itemKey: this.tempFeatureKey,
                    itemVal: this.tempFeatureVal
                })
                this.tempFeatureKey = ''
                this.tempFeatureVal = ''
            } else {
                this.$message.warning('特征值和对照含义不能为空')
            }
            this.updateMappingTotal();
        },
        // 对照表：删除一行
        deleteMappingRow(index) {
            this.form.mappingList.splice(index, 1)
            this.updateMappingTotal();
        },
        // 确认提交
        async handleConfirm() {
            // 表单验证
            if (this.form.featureType === '1' && !this.form.featureValue) {
                this.$message.warning('请输入特征值')
                return
            }

            if (this.form.featureType === '2' && this.form.mappingList.length === 0) {
                this.$message.warning('请添加至少一条对照数据')
                return
            }


            // 实际项目中这里会调用保存接口
            if (this.form.id === '系统默认生成') {
                // 新增操作
                // 构建提交数据
                let submitData = {
                    featureName: this.form.featureName,
                    featureType: this.form.featureType,
                    featureSource: this.form.source,
                    featureDescribe: this.form.description,
                    featureItemList: this.form.featureType == '1'
                        ? [{ itemKey: this.form.featureValue }]
                        : this.form.mappingList
                }
                console.log('提交数据：', submitData)
                await addFeature(submitData)
                this.$message.success('新增成功')
                this.init()
            } else {
                // 编辑操作
                let submitData = {
                    id: this.form.id,
                    featureName: this.form.featureName,
                    featureType: this.form.featureType,
                    featureSource: this.form.source,
                    featureDescribe: this.form.description,
                    featureItemList: this.form.featureType == '1'
                        ? [{ itemKey: this.form.featureValue }]
                        : this.form.mappingList
                }
                console.log('提交数据：', submitData)
                await updateFeature(submitData)
                this.$message.success('编辑成功')
                this.init()
            }

            this.pagination.total = this.tableData.length
            this.drawerVisible = false
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
        handleCurrentChange(val) {
            this.pagination.currentPage = val
        },
        // 分页-改变页大小
        handleSizeChange(val) {
            this.pagination.pageSize = val
            this.pagination.currentPage = 1
        },
        // 新增：处理对照行选中事件
        handleMappingSelectionChange(val) {
            this.selectedMappingRows = val
        },
        // 新增：删除选中的对照行
        deleteSelectedRows() {
            this.$confirm(`确定要删除选中的${this.selectedMappingRows.length}条数据吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const keysToDelete = this.selectedMappingRows.map(item => item.itemKey)
                this.form.mappingList = this.form.mappingList.filter(
                    item => !keysToDelete.includes(item.itemKey)
                )
                this.selectedMappingRows = []
                this.updateMappingTotal();
                this.$message.success('删除成功')
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },
        // 新增：导入功能（示例实现）
        handleImport() {
            this.$message.info('导入功能待实现')
            // 实际实现可调用文件上传组件，解析文件内容后添加到mappingList
        },
        // 新增：导出功能（示例实现）
        handleExport() {
            if (this.form.mappingList.length === 0) {
                this.$message.warning('暂无数据可导出')
                return
            }
            const exportData = this.form.mappingList.map(item => `${item.key}=${item.val}`).join('\n')
            // 实际实现可使用文件下载库，将数据转为CSV/Excel格式
            this.$message.success('导出成功')
        },
        // 新增：清空所有对照行
        clearAllRows() {
            this.$confirm('确定要清空所有数据吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.form.mappingList = []
                this.selectedMappingRows = []
                this.updateMappingTotal();
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
        // 在添加、删除、清空等操作后更新总条数
        updateMappingTotal() {
            this.mappingPagination.total = this.form.mappingList.length;
            // 如果当前页数据为空且不是第一页，自动跳转到上一页
            if (this.form.mappingList.length === 0 && this.mappingPagination.currentPage > 1) {
                this.mappingPagination.currentPage--;
            }
        }
    },
    mounted() {
        this.init() // 初始化
    },

}
</script>

<style scoped>
.feature-management-container {
    padding: 20px;
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
    position: absolute;
    bottom: 6%;
    right: 2%;
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

.mapping-table-container {
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
</style>
