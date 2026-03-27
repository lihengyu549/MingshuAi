<template>
    <div class="app-container" v-loading="mainLoading">
        <el-card shadow="never" class="searchCard">
            <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small"
                :inline="true" label-width="auto">
                <el-form-item label="方案名称" prop="schemeName">
                    <el-input v-model="queryParams.schemeName" placeholder="方案名称" clearable
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
            </el-form>
        </el-card>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="medium" @click="handleAdd">新增方案</el-button>
            </el-col>
        </el-row>
        <el-card class="table-card" shadow="never">
            <el-table v-loading="loading" height="860px" class="tableBox" :data="list" ref="tableRef">
                <template slot="empty">
                    <el-empty description="暂无数据"></el-empty>
                </template>
                <el-table-column label="方案名称" align="left" width="220" prop="schemeName" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span style="display:inline-flex;align-items:center;">
                            <i class="el-icon-lock" style="font-size:16px;color:#64748b;margin-right:6px;"></i>
                            <span v-if="scope.row.schemeType != '0'" @click="handleEdit(scope.row)" style="cursor:pointer;color:#3b82f6;">{{ scope.row.schemeName }}</span>
                            <span v-else style="color:#334155;cursor:not-allowed;">{{ scope.row.schemeName }}</span>
                            <el-tag v-if="scope.row.schemeType == '0'" type="primary"
                                size="mini" effect="plain" style="margin-left:8px;">默认</el-tag>
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="方案类型" align="center" prop="schemeTypeName" show-overflow-tooltip />
                <el-table-column label="引用次数" align="center" width="120" prop="useCount" show-overflow-tooltip />
                <el-table-column label="更新时间" align="center" prop="updateTime" show-overflow-tooltip />
                <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                    <template slot-scope="scope">
                        <el-button type="text" :disabled="scope.row.schemeType == '0'" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
                :page-size.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <el-dialog class="custom-dialog" :title="'新增方案'" :visible.sync="addVisible" append-to-body
            :close-on-click-modal="false" width="900px">
            <el-form :model="addForm" :rules="addRules" ref="addForm" label-width="100px" size="medium"
                label-position="top">
                <el-form-item label="方案名称" prop="schemeName">
                    <el-input v-model="addForm.schemeName" placeholder="如：数据安全分级方案" clearable />
                </el-form-item>
                <el-form-item label="敏感数据定义">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span>安全分级大于等于</span>
                        <el-input-number v-model="addForm.threshold" :min="0" :max="5" :step="1" />
                        <span>的数据定义为敏感数据</span>
                    </div>
                </el-form-item>
                <el-form-item label="方案细则">
                    <el-table :data="levelRows">
                        <el-table-column label="分级数字" prop="level" width="100" align="center" />
                        <el-table-column label="分级名称" align="center" width="150">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.name" />
                            </template>
                        </el-table-column>
                        <el-table-column label="分级定义" align="center">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.definition" />
                            </template>
                        </el-table-column>
                        <el-table-column label="启用" width="120" align="center">
                            <template slot-scope="scope">
                                <el-switch v-model="scope.row.enabled" :disabled="scope.row.level === 0" />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取消</el-button>
                <el-button type="primary" @click="submitAdd">保存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getCategorySchemaList, addCategorySchema, updateCategorySchema, deleteCategorySchema } from '@/api/standard/index'
export default {
    name: 'gradingScheme',
    data() {
        return {
            mainLoading: false,
            loading: false,
            showSearch: true,
            addVisible: false,
            addForm: {
                id: null,
                schemeName: '',
                schemeType: '1',
                threshold: 0
            },
            addRules: {
                schemeName: [{ required: true, message: '请输入方案名称', trigger: 'blur' }]
            },
            levelRows: [],
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                schemeName: ''
            },
            list: [],
            total: 0,
        }
    },
    created() {
        this.getList()
    },
    methods: {
        toBool(v) {
            return v === '1' || v === 1 || v === true
        },
        toFlag(b) {
            return b ? '1' : '0'
        },
        handleQuery() {
            this.queryParams.pageNum = 1
            this.getList()
        },
        getList() {
            this.loading = true
            const params = {
                schemeName: this.queryParams.schemeName,
                pageNum: this.queryParams.pageNum,
                pageSize: this.queryParams.pageSize
            }
            getCategorySchemaList(params).then(res => {
                const payload = res && res.data ? res.data : res
                const rows = payload.records || payload.rows || payload.list || []
                this.list = rows.map(item => ({ ...item }))
                this.total = (typeof payload.total !== 'undefined' ? payload.total : (payload.count || rows.length))
                this.loading = false
            }).catch(() => {
                this.list = []
                this.total = 0
                this.loading = false
            })
        },
        handleAdd() {
            this.addVisible = true
            this.addForm = { id: null, schemeName: '', schemeType: '1', threshold: 0 }
            this.levelRows = [
                { level: 0, name: '0级-未分级', definition: '未定义分级的数据', enabled: true },
                { level: 1, name: '1级-公开数据', definition: '可公开或可被公众知悉，安全受损通常不影响国家安全及公众权益。', enabled: true },
                { level: 2, name: '2级-内部数据', definition: '面向受限对象内部使用的数据，安全受损可能造成轻微影响，但一般不影响国家安全。', enabled: true },
                { level: 3, name: '3级-敏感数据', definition: '机关关键或重要业务多使用，按需知悉访问，安全受损会对个人隐私或合法权益造成明显影响。', enabled: true },
                { level: 4, name: '4级-重要数据', definition: '重要核心业务场景使用，需严格知悉与访问控制，安全受损将对公众权益或企业收益造成严重影响。', enabled: true },
                { level: 5, name: '5级-核心数据', definition: '关键核心节点业务使用且对特定人开放，安全受损会对公众权益造成重大影响。', enabled: true }
            ]
        },
        handleEdit(row) {
            this.addVisible = true
            this.addForm = {
                id: row.id || null,
                schemeName: row.schemeName || '',
                schemeType: this.toBool(row.schemeType) ? '1' : '0',
                threshold: Number(row.sensitiveDataLevel || 0)
            }
            const levels = (row.categorySchemeLevelList || []).map(it => ({
                level: it.level,
                name: it.levelName,
                definition: it.levelDefinition,
                enabled: this.toBool(it.status)
            }))
            if (levels.length) this.levelRows = levels
        },
        handleDelete(row) {
            this.$confirm('确定删除该方案吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteCategorySchema({ id: row.id }).then(() => {
                    this.$message.success('已删除')
                    this.getList()
                })
            }).catch(() => { })
        },
        submitAdd() {
            this.$refs.addForm.validate(valid => {
                if (!valid) return
                const payload = {
                    id: this.addForm.id || undefined,
                    schemeName: this.addForm.schemeName,
                    schemeType: this.addForm.schemeType,
                    useCount: 0,
                    sensitiveDataLevel: String(this.addForm.threshold),
                    categorySchemeLevelList: this.levelRows.map(r => ({
                        level: r.level,
                        levelName: r.name,
                        levelDefinition: r.definition,
                        status: this.toFlag(r.enabled)
                    }))
                }
                const req = this.addForm.id ? updateCategorySchema(payload) : addCategorySchema(payload)
                req.then(() => {
                    this.$message.success('已保存')
                    this.addVisible = false
                    this.getList()
                })
            })
        }
    }
}
</script>

<style scoped>
::v-deep .searchCard {
    border-radius: 10px;
    margin-bottom: 30px;
}

::v-deep .searchCard .el-card__body {
    padding: 24px;
}

.yuanDataClass {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
}

.yuanDataClass ::v-deep .el-form-item {
    width: 30%;
    margin-bottom: 0px;
}

.yuanDataClass ::v-deep .el-form-item__label {
    width: 25%;
}

.yuanDataClass ::v-deep .el-form-item__content {
    width: 75%;
}

.yuanDataClass ::v-deep .el-select {
    width: 100%;
}

.table-card {
    margin-top: 20px;
    border-radius: 10px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.table-card ::v-deep.el-card__body {
    padding: 0 !important;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.tableBox {
    border: none;
    border-radius: 0;
    border-bottom: 1px solid #e2e8f0;
}

.tableBox ::v-deep.el-table__body-wrapper::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.tableBox ::v-deep.el-table__body-wrapper::-webkit-scrollbar-thumb {
    background-color: #0003;
    transition: all .2s ease-in-out;
}

.tableBox ::v-deep.el-table__body-wrapper::-webkit-scrollbar-track {
    border-radius: 10px;
}

.custom-dialog {
    .el-dialog {
        border-radius: 10px;
    }

    .el-dialog__header {
        border-bottom: 1px solid #e6e6e6;
    }
}
</style>
