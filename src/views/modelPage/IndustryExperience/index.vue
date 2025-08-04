<template>
    <div class="page-container">
        <!-- 带文字标签的下拉选择 -->
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
        </el-row>

        <!-- 主要内容区域分为两块：左侧Tab内容区，右侧编辑区 -->
        <el-row :gutter="20" style="margin-top: 16px;">
            <!-- 左侧Tab和列表区域 -->
            <el-col :span="18">
                <!-- Tab 切换 -->
                <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
                    <el-tab-pane v-for="item in dict.type.sys_industry_type" :key="item.value" :label="item.label"
                        :name="item.label">
                        <!-- 列表形式展示，替代原来的表格 -->
                        <div v-loading="loading" class="list-container">
                            <div class="list-item" v-for="(item, index) in listData" :key="index"
                                @click="handleRowClick(item)"
                                :class="{ 'active': selectedRow && selectedRow.id === item.id }">
                                <span class="list-desc">{{ item.content }}</span>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-col>

            <!-- 右侧编辑区 - 作为独立的一块内容 -->
            <el-col :span="6">
                <div class="right-panel">
                    <!-- 顶部操作按钮 -->
                    <div class="header">
                        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
                            新增
                        </el-button>
                        <el-button icon="el-icon-edit" @click="handleEdit" v-if="selectedRow" />
                        <el-button icon="el-icon-delete" type="danger" @click="handleDelete(selectedRow)"
                            v-if="selectedRow" />
                    </div>

                    <!-- 文本编辑区 -->
                    <el-input type="textarea" :rows="22" v-model="formContent" placeholder="请输入内容"
                        style="margin-top: 16px;" />

                    <!-- 底部操作按钮 -->
                    <div class="footer">
                        <el-button @click="handleCancel">取消</el-button>
                        <el-button type="primary" @click="handleSave">保存</el-button>
                    </div>
                </div>
            </el-col>
        </el-row>
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
            standardOptions: [
            ],
            selectedStandard: '', // 绑定值

            // Tab 相关
            activeTab: '', // 默认激活 Tab
            // 列表数据
            listData: [
            ],

            loading: false,
            selectedRow: null, // 当前选中行数据
            formContent: '', // 右侧编辑区内容
            isEdit: false // 标记新增/编辑状态
        }
    },
    methods: {
        // 初始化
        async init() {
            let response = await getCategoryList()
            this.standardOptions = response.data
            this.selectedStandard = this.standardOptions[0].categoryName
            this.activeTab = this.dict.type.sys_industry_type[0].label
            this.fetchListData(this.standardOptions[0].id, this.dict.type.sys_industry_type[0].value)
        },
        // 请求列表数据
        async fetchListData(id, val) {
            this.loading = true
            let res = {
                categoryId: id,
                dicType: val
            }
            setTimeout(async () => {
                const list = await getCategoryLowerDataByType(res)
                console.log('list', list);
                this.listData = list.data
                // 模拟数据加载
                this.loading = false
            }, 500)
        },
        // select change事件
        handleStandardChange(e) {
            const id = this.standardOptions.find(item => item.categoryName === e).id
            const val = this.dict.type.sys_industry_type.find(item => item.label === this.activeTab).value
            this.fetchListData(id, val)
        },
        // Tab 切换事件
        async handleTabClick() {
            let id = this.standardOptions.find(item => item.categoryName === this.selectedStandard).id
            await getDicts('sys_industry_type')
            // 加载对应的数据
            const val = this.dict.type.sys_industry_type.find(item => item.label === this.activeTab).value
            this.fetchListData(id, val)
        },

        // 列表项点击事件
        handleRowClick(row) {
            this.selectedRow = row
            this.formContent = row.content
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
                this.selectedRow = null
                this.formContent = ''
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

        // 保存按钮（移除校验）
        async handleSave() {
            // 不再验证格式，任何字符串都可以保存
            // 简单解析：如果包含=，则分割为code和desc，否则全部作为code
            let parsedData = {}
            if (this.isEdit) {
                parsedData = { //编辑
                    id: this.selectedRow.id,
                    content: this.formContent,
                }
                await updateCategoryLowerDataById(parsedData)
                this.fetchListData(this.selectedRow.categoryId, this.selectedRow.dicType)
                // 编辑逻辑：更新选中行
                this.$message.success('编辑成功')
            } else {
                parsedData = { //新增
                    categoryId: this.standardOptions.find(item => item.categoryName === this.selectedStandard).id,
                    dicType: this.dict.type.sys_industry_type.find(item => item.label === this.activeTab).value,
                    content: this.formContent,
                }
                // 新增逻辑：检查编码唯一性并添加
                await addCategoryLowerData(parsedData)
                this.fetchListData(this.standardOptions.find(item => item.categoryName === this.selectedStandard).id, this.dict.type.sys_industry_type.find(item => item.label === this.activeTab).value)
                this.$message.success('新增成功')
            }

            // 重置状态
            this.selectedRow = null
            this.formContent = ''
            this.isEdit = false
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
</style>