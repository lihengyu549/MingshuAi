<template>
    <div class="app-container" v-loading="mainLoading">
        <el-card shadow="never" class="searchCard">
            <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small"
                :inline="true" label-width="auto" @submit.native.prevent>
                <el-form-item :label="$t('gradingScheme.schemeName')" prop="schemeName">
                    <el-input v-model="queryParams.schemeName" :placeholder="$t('gradingScheme.schemeName')" clearable
                        @change="handleQuery" />
                </el-form-item>
            </el-form>
        </el-card>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="medium" @click="handleAdd">{{ $t('gradingScheme.addScheme') }}</el-button>
            </el-col>
        </el-row>
        <el-card class="table-card" shadow="never">
            <el-table v-loading="loading" height="860px" class="tableBox" :data="list" ref="tableRef">
                <template slot="empty">
                    <el-empty :description="$t('noData')"></el-empty>
                </template>
                <el-table-column :label="$t('gradingScheme.schemeName')" align="left" width="220" prop="schemeName" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span style="display:inline-flex;align-items:center;">
                            <i class="el-icon-lock" style="font-size:16px;color:#64748b;margin-right:6px;"></i>
                            <span @click="handleEdit(scope.row)" style="cursor:pointer;color:#3b82f6;">{{ scope.row.schemeName }}</span>
                            <el-tag v-if="scope.row.schemeType == '0'" type="primary"
                                size="mini" effect="plain" style="margin-left:8px;">{{ $t('gradingScheme.defaultTag') }}</el-tag>
                        </span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('gradingScheme.schemeType')" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span>{{ getSchemeTypeLabel(scope.row.schemeType) }}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('gradingScheme.useCount')" align="center" width="120" prop="useCount" show-overflow-tooltip />
                <el-table-column :label="$t('updateTime')" align="center" prop="updateTime" show-overflow-tooltip />
                <el-table-column :label="$t('operation')" align="center" class-name="small-padding fixed-width">
                    <template slot-scope="scope">
                        <el-button type="text" :disabled="scope.row.schemeType == '0'" @click="handleDelete(scope.row)">{{ $t('delete') }}</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
                :page-size.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <el-dialog class="custom-dialog" :title="getDialogTitle()" :visible.sync="addVisible" append-to-body
            :close-on-click-modal="false" width="900px">
            <el-form :model="addForm" :rules="addRules" ref="addForm" label-width="100px" size="medium"
                label-position="top">
                <el-form-item :label="$t('gradingScheme.schemeName')" prop="schemeName">
                    <el-input v-model="addForm.schemeName" :placeholder="$t('gradingScheme.examplePlaceholder')" clearable :disabled="addForm.schemeType === '0'" />
                </el-form-item>
                <el-form-item :label="$t('gradingScheme.sensitiveDataDefinition')">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span>{{ $t('gradingScheme.securityLevelAtLeast') }}</span>
                        <el-input-number v-model="addForm.threshold" :min="0" :max="5" :step="1" />
                        <span>{{ $t('gradingScheme.sensitiveDataSuffix') }}</span>
                    </div>
                </el-form-item>
                <el-form-item :label="$t('gradingScheme.schemeDetails')">
                    <el-table :data="levelRows">
                        <el-table-column :label="$t('gradingScheme.levelNumber')" prop="level" width="100" align="center" />
                        <el-table-column :label="$t('gradingScheme.levelName')" align="center" width="150">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.name" />
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('gradingScheme.levelDefinition')" align="center">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.definition" :disabled="addForm.schemeType === '0'" />
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('gradingScheme.recommendedProtection')" align="center" width="200">
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.defaultProtectMethod" multiple placeholder="" :disabled="addForm.schemeType === '0'">
                                    <el-option v-for="item in confirmProtectMethodList" :key="item.dictValue" :label="getProtectMethodLabel(item.dictLabel)" :value="item.dictLabel"></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('enable')" width="120" align="center">
                            <template slot-scope="scope">
                                <el-switch v-model="scope.row.enabled" :disabled="scope.row.level === 0 || addForm.schemeType === '0'" />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">{{ $t('cancel') }}</el-button>
                <el-button type="primary" @click="submitAdd">{{ $t('gradingScheme.save') }}</el-button>
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
            addRules: {},
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
        this.addRules = {
            schemeName: [{
                required: true,
                message: this.$t('inputRequired', { field: this.$t('gradingScheme.schemeName') }),
                trigger: 'blur'
            }]
        }
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
        createDefaultLevels() {
            return [
                {
                    level: 0,
                    name: this.$t('gradingScheme.defaultLevels.level0.name'),
                    definition: this.$t('gradingScheme.defaultLevels.level0.definition'),
                    enabled: true,
                    defaultProtectMethod: []
                },
                {
                    level: 1,
                    name: this.$t('gradingScheme.defaultLevels.level1.name'),
                    definition: this.$t('gradingScheme.defaultLevels.level1.definition'),
                    enabled: true,
                    defaultProtectMethod: []
                },
                {
                    level: 2,
                    name: this.$t('gradingScheme.defaultLevels.level2.name'),
                    definition: this.$t('gradingScheme.defaultLevels.level2.definition'),
                    enabled: true,
                    defaultProtectMethod: ['DLP']
                },
                {
                    level: 3,
                    name: this.$t('gradingScheme.defaultLevels.level3.name'),
                    definition: this.$t('gradingScheme.defaultLevels.level3.definition'),
                    enabled: true,
                    defaultProtectMethod: ['DLP', '脱敏']
                },
                {
                    level: 4,
                    name: this.$t('gradingScheme.defaultLevels.level4.name'),
                    definition: this.$t('gradingScheme.defaultLevels.level4.definition'),
                    enabled: true,
                    defaultProtectMethod: ['脱敏', '加密', 'DLP']
                },
                {
                    level: 5,
                    name: this.$t('gradingScheme.defaultLevels.level5.name'),
                    definition: this.$t('gradingScheme.defaultLevels.level5.definition'),
                    enabled: true,
                    defaultProtectMethod: ['脱敏', '加密', 'DLP']
                }
            ]
        },
        getProtectMethodLabel(label) {
            const protectMethodMap = {
                脱敏: this.$t('gradingScheme.protectMasking'),
                加密: this.$t('gradingScheme.protectEncryption'),
                DLP: 'DLP'
            }
            return protectMethodMap[label] || label
        },
        getSchemeTypeLabel(schemeType) {
            return String(schemeType) === '0' ? this.$t('gradingScheme.defaultTag') : this.$t('gradingScheme.customType')
        },
        getDialogTitle() {
            const action = this.$t(this.addForm.id ? 'edit' : 'add')
            const scheme = this.$t('gradingScheme.scheme')
            return this.$i18n.locale === 'en' ? `${action} ${scheme}` : `${action}${scheme}`
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
            this.levelRows = this.createDefaultLevels()
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
            this.levelRows = levels.length ? levels : this.createDefaultLevels()
        },
        handleDelete(row) {
            this.$confirm(this.$t('gradingScheme.deleteConfirm'), this.$t('tip'), {
                confirmButtonText: this.$t('confirm'),
                cancelButtonText: this.$t('cancel'),
                type: 'warning'
            }).then(() => {
                deleteCategorySchema({ id: row.id }).then(() => {
                    this.$message.success(this.$t('deleteSuccess'))
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
                    this.$message.success(this.$t(this.addForm.id ? 'editSuccess' : 'addSuccess'))
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
