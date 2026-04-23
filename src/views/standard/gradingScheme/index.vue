<template>
    <div class="app-container" v-loading="mainLoading">
        <el-card shadow="never" class="searchCard">
            <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small"
                :inline="true" label-width="auto" @submit.native.prevent>
                <el-form-item label="方案名称" prop="schemeName">
                    <el-input v-model="queryParams.schemeName" placeholder="方案名称" clearable
                        @change="handleQuery" />
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
                            <span @click="handleEdit(scope.row)" style="cursor:pointer;color:#3b82f6;">{{ scope.row.schemeName }}</span>
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
                    <el-input v-model="addForm.schemeName" placeholder="如：数据安全分级方案" clearable :disabled="addForm.schemeType === '0'" />
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
                                <el-input v-model="scope.row.definition" :disabled="addForm.schemeType === '0'" />
                            </template>
                        </el-table-column>
                        <el-table-column label="建议防护措施" align="center" width="200">
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.defaultProtectMethod" multiple placeholder="" :disabled="addForm.schemeType === '0'">
                                    <el-option v-for="item in confirmProtectMethodList" :key="item.dictValue" :label="item.dictLabel" :value="item.dictLabel"></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="启用" width="120" align="center">
                            <template slot-scope="scope">
                                <el-switch v-model="scope.row.enabled" :disabled="scope.row.level === 0 || addForm.schemeType === '0'" />
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
    dicts: ['safe_method_type'],
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
            confirmProtectMethodList: []
        }
    },
    created() {
        this.getDicts("sys_confirm_protect_method").then(response => {
            this.confirmProtectMethodList = response.data;
        });
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
                { level: 0, name: '未分级', definition: '未定义分级的数据', enabled: true, defaultProtectMethod: [] },
                { level: 1, name: '1级-公开可披露', definition: '一般可被公众获知或使用，数据安全遭到破坏后，对个人隐私或企业合法权益无影响或仅造成微弱影响，不涉及国家安全与公众权益风险。', enabled: true, defaultProtectMethod: [] },
                { level: 2, name: '2级-内部一般', definition: '一般业务数据，通常对内部管理等受限对象开放，不宜广泛公开。数据安全遭到破坏后，会对个人隐私或企业合法权益造成轻微影响，但不影响国家安全与公众权益。', enabled: true, defaultProtectMethod: ['DLP'] },
                { level: 3, name: '3级-内部敏感', definition: '关键或重要业务数据，仅对 “必须知悉” 的特定人员开放访问。数据安全遭到破坏后，会对公众权益造成轻微影响，或对个人隐私/企业合法权益造成较重影响，但不影响国家安全。', enabled: true, defaultProtectMethod: ['DLP', '脱敏'] },
                { level: 4, name: '4级-重要敏感', definition: '核心节点类机构的重要业务数据，仅对 “必须知悉” 的特定人员开放访问。数据安全遭到破坏后，会对公众权益造成一般影响，或对个人隐私/企业合法权益造成严重影响，但不影响国家安全。', enabled: true, defaultProtectMethod: ['脱敏', '加密', 'DLP'] },
                { level: 5, name: '5级-核心敏感', definition: '核心节点类机构的关键业务数据，仅对 “必须知悉” 的特定人员开放访问。一旦数据安全遭到破坏，将对国家安全或公众权益造成严重影响。', enabled: true, defaultProtectMethod: ['脱敏', '加密', 'DLP'] }
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
                enabled: this.toBool(it.status),
                defaultProtectMethod: it.defaultProtectMethod ? it.defaultProtectMethod.split(',') : []
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
                        status: this.toFlag(r.enabled),
                        defaultProtectMethod: r.defaultProtectMethod ? r.defaultProtectMethod.join(',') : ''
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
