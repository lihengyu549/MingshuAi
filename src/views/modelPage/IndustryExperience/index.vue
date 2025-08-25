<template>
    <div class="page-container">
        <!-- 带文字标签的下拉选择和经验引用按钮 -->
        <el-row :gutter="20" style="margin-bottom: 16px;">
            <el-col :span="2">
                <label class="label-text">所属标准</label>
            </el-col>
            <el-col :span="6">
                <el-select v-model="selectedStandard" placeholder="请选择" @change="handleStandardChange($event)"
                    style="width: 100%;">
                    <el-option v-for="item in standardOptions" :key="item.id" :label="item.categoryName"
                        :value="item.categoryName" />
                </el-select>
            </el-col>
            <el-col :span="2">
                <el-dropdown @command="handleReferenceItemClick">
                    <el-button type="primary" plain>
                        经验引用
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <!-- 循环动态生成下拉项 -->
                        <el-dropdown-item v-for="item in referenceOptions" :key="item.id" :command="item.id">
                            {{ item.name }} <!-- 显示选项名称 -->
                        </el-dropdown-item>
                        <!-- 可选：添加固定的自定义选项 -->
                        <!-- <el-dropdown-item divided command="custom">自定义引用</el-dropdown-item> -->
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-row>

        <!-- 主要内容区域：Tab内容区 -->
        <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
            <el-tab-pane v-for="item in dict.type.sys_industry_type" :key="item.value" :label="item.label"
                :name="item.label">
                <!-- 根据Tab名称显示不同表格 -->
                <div v-loading="loading" class="table-container">
                    <!-- 拼音对照表或英文对照表 - 双列表格 -->
                    <el-table v-if="activeTab === '拼音对照表' || activeTab === '英文对照表'" :data="tableData" border
                        style="width: 100%">
                        <el-table-column prop="featureValue" label="特征值">
                        </el-table-column>
                        <el-table-column prop="meaning" label="对照含义">
                        </el-table-column>
                    </el-table>

                    <!-- 数据字典 - 四列表格 -->
                    <el-table v-if="activeTab === '数据字典'" :data="tableData" border style="width: 100%">
                        <el-table-column prop="tableName" label="表名">
                        </el-table-column>
                        <el-table-column prop="tableComment" label="表注释">
                        </el-table-column>
                        <el-table-column prop="fieldName" label="字段名称">
                        </el-table-column>
                        <el-table-column prop="fieldComment" label="字段注释">
                        </el-table-column>
                    </el-table>

                    <!-- 其他类型保持列表形式 -->
                    <div v-else class="list-container">
                        <div class="list-item" v-for="(item, index) in listData" :key="index"
                            @click="handleRowClick(item)"
                            :class="{ 'active': selectedRow && selectedRow.id === item.id }">
                            <span class="list-desc">{{ item.content }}</span>
                        </div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>


<script>
import { getCategoryLowerDataByType, getCategoryList, addCategoryLowerData, deleteCategoryLowerDataById, updateCategoryLowerDataById } from "@/api/system/IndustryExperience";
import { getDicts } from "@/api/system/dict/data";
export default {
    dicts: ['sys_industry_type'],
    name: 'IndustryExperience',
    data() {
        return {
            // 所属标准下拉选项
            standardOptions: [],
            selectedStandard: '', // 绑定值

            // Tab 相关
            activeTab: '', // 默认激活 Tab
            // 列表数据
            listData: [],
            // 表格数据
            tableData: [],

            loading: false,
            selectedRow: null, // 当前选中行数据
            formContent: '', // 右侧编辑区内容
            isEdit: false, // 标记新增/编辑状态
            referenceOptions: [
                {
                    id: 1,
                    name: '引用1'
                },
                {
                    id: 2,
                    name: '引用2'
                },
                {
                    id: 3,
                    name: '引用3'
                }
            ],// 经验引用下拉选项
        }
    },
    methods: {
        // 初始化
        async init() {
            let response = await getCategoryList()
            this.standardOptions = response.data
            this.selectedStandard = this.standardOptions[0]?.categoryName || ''
            this.activeTab = this.dict.type.sys_industry_type[0]?.label || ''
            if (this.standardOptions[0]?.id && this.dict.type.sys_industry_type[0]?.value) {
                this.fetchListData(this.standardOptions[0].id, this.dict.type.sys_industry_type[0].value)
            }

            // 假设获取经验引用选项的接口为 getReferenceOptions()
            const refResponse = await getReferenceOptions(); // 自定义接口，需实际实现
            this.referenceOptions = refResponse.data; // 假设返回格式：[{id: 1, name: '引用1'}, ...]

            if (this.standardOptions[0]?.id && this.dict.type.sys_industry_type[0]?.value) {
                this.fetchListData(this.standardOptions[0].id, this.dict.type.sys_industry_type[0].value);
            }
        },
        // 请求列表数据
        async fetchListData(id, val) {
            this.loading = true
            let resParams = {
                categoryId: id,
                dicType: val
            }
            try {
                const response = await getCategoryLowerDataByType(resParams)
                // 根据当前tab类型转换数据格式
                if (this.activeTab === '拼音对照表' || this.activeTab === '英文对照表') {
                    // 转换为双列表格数据格式
                    this.tableData = response.data.map(item => {
                        // 这里假设content格式为"特征值=对照含义"，可根据实际格式调整
                        const [featureValue, meaning] = item.content.split('=')
                        return {
                            id: item.id,
                            featureValue: featureValue || item.content,
                            meaning: meaning || '',
                            categoryId: item.categoryId,
                            dicType: item.dicType
                        }
                    })
                } else if (this.activeTab === '数据字典') {
                    // 转换为四列表格数据格式
                    this.tableData = response.data.map(item => {
                        // 这里假设content格式为"表名,表注释,字段名称,字段注释"，可根据实际格式调整
                        const [tableName, tableComment, fieldName, fieldComment] = item.content.split(',')
                        return {
                            id: item.id,
                            tableName: tableName || '',
                            tableComment: tableComment || '',
                            fieldName: fieldName || '',
                            fieldComment: fieldComment || '',
                            categoryId: item.categoryId,
                            dicType: item.dicType
                        }
                    })
                } else {
                    // 保持原列表数据格式
                    this.listData = response.data
                }
            } catch (error) {
                console.error('获取数据失败', error)
            } finally {
                this.loading = false
            }
        },
        // select change事件
        handleStandardChange(e) {
            const id = this.standardOptions.find(item => item.categoryName === e)?.id
            const val = this.dict.type.sys_industry_type.find(item => item.label === this.activeTab)?.value
            if (id && val) {
                this.fetchListData(id, val)
            }
        },
        // Tab 切换事件
        async handleTabClick() {
            let id = this.standardOptions.find(item => item.categoryName === this.selectedStandard)?.id
            await getDicts('sys_industry_type')
            // 加载对应的数据
            const val = this.dict.type.sys_industry_type.find(item => item.label === this.activeTab)?.value
            if (id && val) {
                this.fetchListData(id, val)
            }
        },

        // 列表项点击事件
        handleRowClick(row) {
            this.selectedRow = row
            // 根据不同表格类型设置表单内容
            if (this.activeTab === '拼音对照表' || this.activeTab === '英文对照表') {
                this.formContent = `${row.featureValue}=${row.meaning}`
            } else if (this.activeTab === '数据字典') {
                this.formContent = `${row.tableName},${row.tableComment},${row.fieldName},${row.fieldComment}`
            } else {
                this.formContent = row.content
            }
            this.isEdit = true
        },

        // 新增按钮
        handleCreate() {
            this.selectedRow = null
            this.formContent = ''
            this.isEdit = false
        },

        // 编辑按钮
        handleEdit() {
            // 编辑逻辑已在handleRowClick中处理
        },

        // 删除按钮
        async handleDelete(row) {
            this.$confirm('确认删除这条记录吗？', '提示', {
                type: 'warning'
            }).then(async () => {
                const id = {
                    id: row.id
                }
                await deleteCategoryLowerDataById(id)
                this.fetchListData(row.categoryId, row.dicType)
                // 重置状态
                this.selectedRow = null
                this.formContent = ''
                this.isEdit = false
                this.$message.success('删除成功')
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },

        // 取消按钮
        handleCancel() {
            this.selectedRow = null
            this.formContent = ''
            this.isEdit = false
        },

        // 保存按钮
        async handleSave() {
            let parsedData = {}
            if (this.isEdit) {
                parsedData = { //编辑
                    id: this.selectedRow.id,
                    content: this.formContent,
                }
                await updateCategoryLowerDataById(parsedData)
                this.fetchListData(this.selectedRow.categoryId, this.selectedRow.dicType)
                this.$message.success('编辑成功')
            } else {
                parsedData = { //新增
                    categoryId: this.standardOptions.find(item => item.categoryName === this.selectedStandard)?.id,
                    dicType: this.dict.type.sys_industry_type.find(item => item.label === this.activeTab)?.value,
                    content: this.formContent,
                }
                await addCategoryLowerData(parsedData)
                this.fetchListData(
                    this.standardOptions.find(item => item.categoryName === this.selectedStandard)?.id,
                    this.dict.type.sys_industry_type.find(item => item.label === this.activeTab)?.value
                )
                this.$message.success('新增成功')
            }

            // 重置状态
            this.selectedRow = null
            this.formContent = ''
            this.isEdit = false
        },

        // 经验引用按钮点击事件
        // 处理经验引用下拉项点击
        handleReferenceItemClick(command) {
            switch (command) {
                case 'ref1':
                    this.$message.info('执行引用经验 1 的逻辑');
                    break;
                case 'ref2':
                    this.$message.info('执行引用经验 2 的逻辑');
                    break;
                case 'ref3':
                    this.$message.info('执行引用经验 3 的逻辑');
                    break;
                case 'custom':
                    this.$message.info('打开自定义引用对话框');
                    // 可在此处打开弹窗让用户输入自定义内容
                    break;
                default:
                    break;
            }
        },

    },
    created() {
        this.init()
    },
}
</script>

<style scoped>
.page-container {
    padding: 20px;
}

.label-text {
    line-height: 36px;
    font-weight: 500;
}

.right-panel {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 16px;
    height: calc(100% - 40px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.header,
.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer {
    margin-top: 16px;
}

/* 列表样式 */
.list-container {
    margin-top: 10px;
}

.list-item {
    padding: 10px 15px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.list-item:last-child {
    border-bottom: none;
}

.list-item.active {
    background-color: #f5f7fa;
}

.list-code {
    font-weight: 500;
    min-width: 150px;
}

.list-desc {
    flex: 1;
    margin-left: 15px;
    color: #606266;
}

/* 表格样式 */
.table-container {
    margin-top: 10px;
}
</style>