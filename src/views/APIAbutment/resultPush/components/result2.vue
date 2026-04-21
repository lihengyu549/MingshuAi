<template>
    <div v-loading="loading">
        <div class="mainBox">
            <div class="leftBox">
                <div class="leftBox_header">{{ $t('resultPush.available') }}</div>
                <div class="leftBox_body">
                    <el-table ref="resultTable" :data="paginatedTableData" border style="width: 100%"
                        :element-loading-text="$t('loading')" :height="420" size="small"
                        @selection-change="handleSelectionChange">
                        <template slot="empty">
                            <el-empty :description="$t('noData')"></el-empty>
                        </template>
                        <el-table-column type="selection" width="55"></el-table-column>
                        <el-table-column :label="$t('resultPush.dataPath')" prop="dataPath"
                            align="center"></el-table-column>
                        <el-table-column :label="$t('resultPush.fieldName')" prop="fieldName"
                            align="center"></el-table-column>
                        <el-table-column :label="$t('resultPush.fieldRemark')" prop="fileRemark"
                            align="center"></el-table-column>
                        <el-table-column :label="$t('resultPush.aiFieldRemark')" prop="fileAiRemark"
                            align="center"></el-table-column>
                        <el-table-column :label="$t('resultPush.sample')" align="center" prop="sampleData"
                            show-overflow-tooltip>
                            <template slot-scope="scope">
                                <el-tooltip placement="bottom" effect="light">
                                    <div slot="content">
                                        <el-table :data="scope.row.sampleList" height="250" border class="tableCla"
                                            style="width: 100%">
                                            <el-table-column type="index" :label="$t('resultPush.index')" width="50" />
                                            <el-table-column prop="value" :label="$t('resultPush.fieldValue')"
                                                width="100" show-overflow-tooltip />
                                        </el-table>
                                    </div>
                                    <el-button size="mini" type="text">{{ $t('view') }}</el-button>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('resultPush.sampleFeature')" prop="regularExpression"
                            align="center"></el-table-column>
                    </el-table>
                    <pagination :current-page="currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize"
                        :pagerCount="5" layout="total, sizes, prev, pager, next" :total="total"
                        style="margin-top: 10px; text-align: right;" size="small" @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"></pagination>
                </div>
            </div>
            <div class="rightBox">
                <div class="rightBox_header">
                    <span>{{ $t('resultPush.selectedCount', { count: lastChildList.length }) }}</span>
                    <span class="reset" @click="emptyFn">{{ $t('clean') }}</span>
                </div>
                <div class="rightBox_body">
                    <div v-for="(item, index) in lastChildList" :key="item.id" class="childList">
                        <span class="data-path" :title="item.dataPath">{{ item.dataPath }}</span>
                        <span class="field-name" :title="item.fieldName">{{ item.fieldName }}</span>
                        <i class="el-icon-error" @click="deleteChildFn(item, index)"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { selectFieldIdByDatabaseId } from "@/api/APIAbutment";

export default {
    name: "resultPushResult",
    props: {
        id: {
            type: [String, Number],
            default: ''
        },
        databaseId: {
            type: [String, Number],
            default: ''
        },
    },
    data() {
        return {
            loading: false,
            lastChildList: [],
            selectedList: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
            sourceTableData: {
                list: [],
                page: { records: [], total: 0, current: 1, size: 10 }
            }
        }
    },
    computed: {
        pageData() {
            return this.sourceTableData.page || {}
        },
        parsedTableData() {
            return this.pageData.records || []
        },
        paginatedTableData() {
            return this.parsedTableData
        }
    },
    watch: {
        pageData: {
            handler(newVal) {
                if (newVal && typeof newVal === 'object') {
                    this.total = newVal.total || 0
                    this.currentPage = newVal.current || 1
                    this.pageSize = newVal.size || 10
                }
            },
            immediate: true,
            deep: true
        },
        selectedList: {
            handler(newVal) {
                if (newVal && Array.isArray(newVal)) {
                    this.lastChildList = [...newVal]
                }
            },
            immediate: true,
            deep: true
        },
        parsedTableData: {
            handler() {
                this.$nextTick(() => {
                    this.initCheckedRows()
                })
            },
            immediate: true
        }
    },
    mounted() {
        this.getTableData()
    },
    methods: {
        getTableData() {
            if (!this.databaseId) return

            this.loading = true
            selectFieldIdByDatabaseId({
                id: this.id || '',
                databaseId: this.databaseId,
                pageNum: this.currentPage,
                pageSize: this.pageSize
            }).then(res => {
                if (this.databaseId) {
                    const data = res.data || {
                        list: [],
                        page: { records: [], total: 0, current: 1, size: 10 }
                    }

                    if (data.page && data.page.records) {
                        data.page.records = data.page.records.map(item => {
                            if (item.sampleData) {
                                try {
                                    const sampleList = JSON.parse(item.sampleData)
                                    item.sampleList = Array.isArray(sampleList) ? sampleList.map(value => ({ value })) : []
                                } catch (e) {
                                    item.sampleList = []
                                }
                            } else {
                                item.sampleList = []
                            }
                            return item
                        })
                    }

                    this.sourceTableData = data
                    this.$nextTick(() => {
                        this.initCheckedRows()
                    })
                }
                this.loading = false
            }).catch(() => {
                this.loading = false
            })
        },
        initCheckedRows() {
            const selectedIds = this.selectedList.map(item => item.id)
            if (selectedIds.length === 0) return

            const checkedRows = this.parsedTableData.filter(row => selectedIds.includes(row.id))

            checkedRows.forEach(row => {
                this.$refs.resultTable?.toggleRowSelection(row, true)
            })
        },
        handleSelectionChange(selectedRows) {
            const selectedIds = selectedRows.map(item => item.id)
            const currentPageIds = this.parsedTableData.map(item => item.id)

            this.lastChildList = this.lastChildList.filter(item => {
                const isInCurrentPage = currentPageIds.includes(item.id)

                if (isInCurrentPage) {
                    return selectedIds.includes(item.id)
                }
                return true
            })

            selectedRows.forEach(row => {
                if (!this.lastChildList.find(item => item.id === row.id)) {
                    this.lastChildList.push(row)
                }
            })

            this.selectedList = [...this.lastChildList]
            this.$emit('selection-change', this.lastChildList)
        },
        deleteChildFn(row, index) {
            this.$refs.resultTable?.toggleRowSelection(row, false)
            this.lastChildList.splice(index, 1)
        },
        emptyFn() {
            this.lastChildList = []
            this.selectedList = []
            this.$refs.resultTable?.clearSelection()
        },
        handleSizeChange(val) {
            this.pageSize = val
            this.currentPage = 1
            this.getTableData()
        },
        handleCurrentChange(val) {
            this.currentPage = val
            this.getTableData()
        }
    }
};
</script>

<style scoped lang="scss">
.mainBox {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .leftBox {
        flex: 1;
        margin-right: 20px;

        .leftBox_header {
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .leftBox_body {
            border: 1px solid #ccc;
            padding: 10px;
            height: 500px;
            box-sizing: border-box;
        }
    }

    .rightBox {
        width: 35%;

        .rightBox_header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 10px;

            .reset {
                color: #0600ff;
                cursor: pointer;
            }
        }

        .rightBox_body {
            height: 500px;
            border: 1px solid #c4c4c4;
            overflow-y: auto;
            padding: 10px;
            box-sizing: border-box;
        }
    }
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
    background-color: #0003;
    border-radius: 10px;
    transition: all .2s ease-in-out;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-track {
    border-radius: 10px;
}

.childList {
    border: 1px solid #ccc;
    padding: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        border-color: #707276;
    }

    .data-path {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 8px;
    }

    .field-name {
        width: 80px;
        flex-shrink: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 8px;
    }

    .el-icon-error {
        font-size: 18px;
        color: #ff4d4f;
        cursor: pointer;
        flex-shrink: 0;

        &:hover {
            color: #ff7875;
        }
    }
}

.childList+.childList {
    margin-top: 10px;
}

::v-deep .el-table th {
    background-color: #f5f5f5;
    font-weight: 600;
}

::v-deep .el-table td {
    vertical-align: middle;
}
</style>
