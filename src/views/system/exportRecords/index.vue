<template>
    <div class="export-records-page app-container">
        <el-card class="main-card">
            <div class="page-header">
                <h1 class="page-title">{{ $t('exportRecords.title') }}</h1>
                <div class="page-actions">
                    <el-input v-model="searchKeyword" :placeholder="$t('exportRecords.searchPlaceholder')"
                        prefix-icon="el-icon-search" class="search-input" @input="handleSearch"></el-input>
                    <el-button class="clear-btn" @click="clearAll">{{ $t('exportRecords.clearAll') }}</el-button>
                </div>
            </div>

            <div class="records-container">
                <div v-if="loading" class="loading-container">
                    <i class="el-icon-loading"></i> {{ $t('loading') }}
                </div>
                <div v-else-if="filteredRecords.length === 0" class="empty-container">
                    <i class="el-icon-document"></i>
                    <p>{{ $t('exportRecords.emptyText') }}</p>
                </div>
                <div v-else class="records-list">
                    <div v-for="record in filteredRecords" :key="record.id" class="record-item" :class="{
                        'record-selected': selectedRecord && selectedRecord.id === record.id,
                        'record-completed': record.status === '3'
                    }" @click="selectRecord(record)">
                        <div class="file-icon">
                            <svg-icon icon-class="file" class="icon" />
                        </div>
                        <div class="file-info">
                            <div class="file-name">{{ record.fileName }}</div>
                            <div class="file-status">
                                <!-- 导出超时 -->
                                <span v-if="record.status === '5'" class="status-timeout">
                                    <el-tag type="danger">{{ $t('exportRecords.statusTimeout') }}</el-tag>
                                </span>
                                <!-- 导出失败 -->
                                <span v-else-if="record.status === '4'" class="status-failed">
                                    <el-tag type="danger">{{ $t('exportRecords.statusFailed') }}</el-tag>
                                </span>
                                <!-- 导出完成 -->
                                <span v-else-if="record.status === '3'" class="status-completed">
                                    {{ record.fileSizeName }} · {{ record.createTime }}
                                </span>
                            </div>
                        </div>
                        <div class="file-actions">
                            <el-button v-if="record.status === '3'" type="text" icon="el-icon-download"
                                class="action-btn download-btn" @click.stop="downloadFile(record)"></el-button>
                            <el-button type="text" icon="el-icon-close" class="action-btn delete-btn"
                                @click.stop="deleteRecord(record)"></el-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 返回按钮 -->
            <div class="back-button">
                <el-button type="primary" plain @click="goBack">{{ $t('return') }}</el-button>
            </div>
        </el-card>

    </div>
</template>

<script>
import { downloadById, listAll, removeById, removeByAll } from "@/api/system/protectTableField";
export default {
    name: 'ExportRecords',
    data() {
        return {
            loading: false,
            searchKeyword: '',
            allRecords: [],
            selectedRecord: null
        }
    },
    computed: {
        filteredRecords() {
            if (!this.searchKeyword) {
                return this.allRecords
            }
            return this.allRecords.filter(record =>
                record.fileName.toLowerCase().includes(this.searchKeyword.toLowerCase())
            )
        }
    },
    mounted() {
        this.fetchAllRecords()
    },
    methods: {
        async fetchAllRecords() {
            this.loading = true
            try {
                const response = await listAll()
                this.allRecords = response.data || []
            } catch (error) {
                console.error('获取导出记录失败:', error)
                this.$message.error(this.$t('exportRecords.fetchFailed'))
            } finally {
                this.loading = false
            }
        },
        handleSearch() {
            // 搜索功能通过计算属性自动实现
        },
        selectRecord(record) {
            this.selectedRecord = record
        },
        downloadFile(record) {
            if (record.status !== '3') {
                this.$message.warning(this.$t('exportRecords.completedOnlyDownload'))
                return
            }
            try {
                downloadById({ id: record.id }).then(response => {
                    // 创建一个Blob对象
                    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    // 创建一个URL对象
                    const url = window.URL.createObjectURL(blob);
                    // 创建一个a标签并设置href属性
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = record.fileName; // 设置下载后的文件名
                    // 将a标签添加到DOM中
                    document.body.appendChild(link);
                    // 触发点击事件
                    link.click();
                    // 移除a标签
                    document.body.removeChild(link);
                    // 释放URL对象
                    window.URL.revokeObjectURL(url);
                    this.loading = false;
                    this.$message.success(this.$t('exportRecords.exportSuccess'));
                })
            } catch (error) {
                console.error('下载文件失败:', error)
                this.$message.error(this.$t('exportRecords.downloadFailed'))
            }
        },
        deleteRecord(record) {
            this.$confirm(this.$t('exportRecords.deleteConfirm'), this.$t('tip'), {
                confirmButtonText: this.$t('confirm'),
                cancelButtonText: this.$t('cancel'),
                type: 'warning'
            }).then(async () => {
                try {
                    await removeById({ id: record.id })
                    this.allRecords = this.allRecords.filter(r => r.id !== record.id)
                    this.$message.success(this.$t('deleteSuccess'))
                } catch (error) {
                    console.error('删除失败:', error)
                    this.$message.error(this.$t('exportRecords.deleteFailed'))
                }
            }).catch(() => { })
        },
        clearAll() {
            if (this.allRecords.length === 0) {
                this.$message.info(this.$t('exportRecords.noRecordsToClear'))
                return
            }

            this.$confirm(this.$t('exportRecords.clearAllConfirm'), this.$t('tip'), {
                confirmButtonText: this.$t('confirm'),
                cancelButtonText: this.$t('cancel'),
                type: 'warning'
            }).then(async () => {
                try {
                    await removeByAll()

                    this.allRecords = []
                    this.selectedRecord = null
                    this.$message.success(this.$t('exportRecords.clearAllSuccess'))
                } catch (error) {
                    console.error('清除失败:', error)
                    this.$message.error(this.$t('exportRecords.clearFailed'))
                }
            }).catch(() => { })
        },
        goBack() {
            this.$router.go(-1)
        }
    }
}
</script>

<style lang="scss" scoped>
.export-records-page {
    width: 100%;
    background-color: #f8fafc;

    .main-card {
        height: calc(100vh - 100px);
        max-height: calc(100vh - 100px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border-radius: 10px;

        ::v-deep .el-card__body {
            height: 100%;
            max-height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            padding: 24px;
        }
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        .page-title {
            font-size: 24px;
            font-weight: 500;
            color: #000000;
            margin: 0;
        }

        .page-actions {
            display: flex;
            gap: 12px;

            .search-input {
                width: 280px;

                ::v-deep .el-input__inner {
                    border-radius: 4px;
                    border-color: #d9d9d9;

                    &:focus {
                        border-color: #1890ff;
                    }
                }
            }

            .clear-btn {
                color: #1890ff;
                border-color: #1890ff;

                &:hover {
                    color: #40a9ff;
                    border-color: #40a9ff;
                }
            }
        }
    }

    .records-container {
        flex: 1;
        min-height: 0;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .loading-container,
        .empty-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 100px 0;
            color: #999999;

            i {
                font-size: 48px;
                margin-bottom: 16px;
            }

            p {
                font-size: 14px;
                margin: 0;
            }
        }

        .records-list {
            flex: 1;
            min-height: 0;
            overflow: auto;

            .record-item {
                display: flex;
                align-items: center;
                padding: 16px 24px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: background-color 0.2s;

                &:hover {
                    background-color: #fafafa;
                }

                &.record-selected {
                    background-color: #e6f4ff;
                }

                &.record-completed {
                    &.record-selected {
                        background-color: #e6f4ff;
                    }
                }

                .file-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    background-color: #e3f2fd;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 16px;
                    flex-shrink: 0;

                    .icon {
                        width: 24px;
                        height: 24px;
                        color: #1890ff;
                    }
                }

                .file-info {
                    flex: 1;
                    min-width: 0;

                    .file-name {
                        font-size: 14px;
                        color: #000000;
                        margin-bottom: 4px;
                        word-break: break-all;
                    }

                    .file-status {
                        font-size: 13px;

                        .status-timeout {
                            color: #fa8c16;
                        }

                        .status-failed {
                            color: #f5222d;
                        }

                        .status-completed {
                            color: #999999;
                        }
                    }
                }

                .file-actions {
                    display: flex;
                    gap: 8px;

                    .action-btn {
                        padding: 8px;
                        font-size: 16px;

                        &.download-btn {
                            color: #999999;

                            &:hover {
                                color: #1890ff;
                            }
                        }

                        &.delete-btn {
                            color: #999999;

                            &:hover {
                                color: #f5222d;
                            }
                        }
                    }
                }
            }
        }
    }

    .back-button {
        position: fixed;
        bottom: 40px;
        right: 40px;
        z-index: 100;

        .el-button {
            padding: 12px 24px;
            font-size: 14px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
    }
}
</style>
