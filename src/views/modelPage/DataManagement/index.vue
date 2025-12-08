<template>
    <div class="app-container" v-loading="mainLoading">
        <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small"
            :inline="true" label-width="auto">
            <el-form-item label="数据集名称" prop="taskName">
                <el-input v-model="queryParams.taskName" @input="inputSearch" placeholder="请输入数据源名称" clearable
                    @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="数据集类型" prop="pushType">
                <el-select clearable v-model="queryParams.pushType" @change="inputSearch" placeholder="请选择数据库类型">
                    <el-option v-for="item in pushList" :key="item.dictValue" :label="item.dictLabel"
                        :value="item.dictValue">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item class="searchBtn" label-width="0">
                <!-- <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button> -->
            </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="medium" @click="handleAdd">新增数据集</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-close" size="medium" @click="deleteFn">删除数据集</el-button>
            </el-col>
        </el-row>
        <el-table v-loading="loading" height="700px" class="tableBox" :data="proxysList"
            @selection-change="handleSelectionChange" ref="tableRef">
            <template slot="empty">
                <el-empty description="暂无数据"></el-empty>
            </template>
            <el-table-column type="selection" width="60" align="center" />
            <el-table-column label="数据集名称" prop="taskName" align="center" width="250" show-overflow-tooltip>
                <template slot-scope="scope">
                    <svg-icon icon-class="dataset" style="font-size: 16px; margin-right: 5px;" />
                    {{ scope.row.taskName }}
                </template>
            </el-table-column>
            <el-table-column label="数据集类型" align="center" prop="pushTypeName" width="250" show-overflow-tooltip />
            <el-table-column label="数据量" align="center" prop="sourceName" width="250" show-overflow-tooltip />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" @click="handleEdit(scope.row)">查看</el-button>
                </template>
            </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize" @pagination="getList" />
        <el-dialog :title="title" class="addMsg" v-loading="dialogLoading" :visible.sync="dialogDataShow" append-to-body
            :close-on-click-modal="false" width="700px">
            <el-form class="dialogForm" :rules="dialogDataRules" :model="dialogData" size="medium" ref="dialogData"
                :inline="true" label-width="110px" label-position="top">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="数据集名称" prop="taskName">
                            <el-input v-model="dialogData.taskName" placeholder="请输入数据集名称"
                                :disabled="isViewMode"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="数据集类型" prop="pushType">
                            <el-select clearable v-model="dialogData.pushType" placeholder="请选择数据集类型"
                                :disabled="isViewMode">
                                <el-option v-for="item in pushList" :key="item.dictValue" :label="item.dictLabel"
                                    :value="item.dictValue">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="选择内容" prop="sourceName">
                    <el-select v-model="dialogData.sourceName" multiple clearable filterable placeholder="请选择内容"
                        :disabled="isViewMode">
                        <el-option v-for="item in sourceContentList" :key="item.value" :label="item.label"
                            :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" plain @click="submitFormFn" v-if="!isViewMode">确 定</el-button>
                <el-button @click="importcancel">取 消</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
// 导入API接口（请根据实际接口文件路径修改）
// import {
//   getResultPushList,    // 获取数据集列表
//   addResultPush,        // 新增数据集
//   updateResultPush,     // 更新数据集
//   deleteResultPush,     // 删除数据集
//   pushResult,           // 推送数据集
//   getStandardList,      // 获取分类分级标准列表
//   listByDataType        // 获取字典数据列表
// } from "@/api/system/modelPage";

export default {
    name: "DataManagement",
    data() {
        return {
            // 遮罩层
            loading: false,
            mainLoading: false,
            dialogLoading: false,
            // 选中数组
            ids: [],
            // 显示搜索条件
            showSearch: true,
            // 总条数
            total: 0,
            // 数据集表格数据
            proxysList: [],
            // 弹出层标题
            title: "",
            // 是否显示弹出层
            dialogDataShow: false,
            // 当前是否为查看模式
            isViewMode: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                pushType: '',
                taskName: '',
            },
            // 表单数据
            dialogData: {
                taskName: '',       // 数据集名称
                pushType: '',       // 数据集类型（字典表维护）
                sourceName: []      // 选择内容（多选）
            },
            // 防抖定时器
            debounceTimeout: null,
            // 表单校验规则
            dialogDataRules: {
                taskName: [
                    { required: true, message: "请输入数据集名称", trigger: "blur" }
                ],
                pushType: [
                    { required: true, message: "请选择数据集类型", trigger: "blur" }
                ],
                provider: [
                    { required: true, message: "请选择内容", trigger: "blur" }
                ],
            },
            // 数据字典列表
            providerList: [],   // 对接厂商列表
            pushList: [],       // 推送类型列表
            standardList: [],   // 分类分级标准列表
            sourceContentList: [], // 选择内容列表
        };
    },
    computed: {
    },
    created() {
        // 初始化数据
        this.getDictDataFn();
        this.getStandardListFn();
        this.getSourceContentListFn();
    },
    mounted() {
        this.getList();
    },
    methods: {


        /**
         * 获取字典数据
         * 接口对接位置：请在下方调用实际接口
         */
        getDictDataFn() {
            // 接口调用示例（请替换为实际接口）
            /*
            // 获取对接厂商字典
            listByDataType({ type: 'sys_provider_type' }).then(res => {
                this.providerList = res.data;
            });
            // 获取推送类型字典
            listByDataType({ type: 'sys_push_type' }).then(res => {
                this.pushList = res.data;
            });
            */
        },

        /**
         * 获取分类分级标准列表
         * 接口对接位置：请在下方调用实际接口
         */
        getStandardListFn() {
            // 接口调用示例（请替换为实际接口）
            /*
            getStandardList().then(res => {
                this.standardList = res.data.map(item => {
                    return { ...item, categoryName: item.categoryName, id: item.id + '' }
                });
            });
            */
        },

        /**
         * 获取选择内容列表
         * 接口对接位置：请在下方调用实际接口
         */
        getSourceContentListFn() {
            // 接口调用示例（请替换为实际接口）
            /*
            // 获取选择内容列表接口
            getSourceContentList().then(res => {
                this.sourceContentList = res.data;
            });
            */

            // 模拟数据（测试用，实际对接时删除）
            this.sourceContentList = [
                { value: 'content1', label: '内容1' },
                { value: 'content2', label: '内容2' },
                { value: 'content3', label: '内容3' },
                { value: 'content4', label: '内容4' },
                { value: 'content5', label: '内容5' },
                { value: 'content6', label: '内容6' },
            ];
        },

        // 关闭新增/编辑/查看对话框
        importcancel() {
            this.dialogDataShow = false;
            this.isViewMode = false; // 重置查看模式标志
        },

        // 定时器，搜索防抖
        inputSearch(data) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.handleQuery();
            }, 500); // 防抖时间间隔：500毫秒
        },

        /**
         * 查询数据集列表
         * 接口对接位置：请在下方调用实际接口
         */
        getList() {
            this.loading = true;
            // 接口调用示例（请替换为实际接口）
            /*
            getResultPushList(this.queryParams).then(res => {
                this.proxysList = res.data.rows;
                this.total = res.data.total;
                this.loading = false;
            });
            */
            // 模拟数据（测试用，实际对接时删除）
            setTimeout(() => {
                this.proxysList = [];
                this.total = 0;
                this.loading = false;
            }, 500);
        },

        /** 搜索按钮操作 */
        handleQuery() {
            this.queryParams.pageNum = 1;
            this.getList();
        },

        /** 重置按钮操作 */
        resetQuery() {
            this.resetForm("queryForm");
            this.handleQuery();
        },

        // 多选框选中数据
        handleSelectionChange(selection) {
            this.ids = selection.map(item => item.id);
        },

        /** 新增按钮操作 */
        handleAdd() {
            this.resetAddData();
            this.dialogDataShow = true;
            this.title = "新增数据集";
            this.isViewMode = false;
        },

        /** 查看按钮操作 */
        handleEdit(row) {
            this.dialogData = JSON.parse(JSON.stringify(row));
            this.dialogDataShow = true;
            this.title = "查看数据集";
            this.isViewMode = true;
        },

        /**
         * 表单提交
         * 接口对接位置：请在下方调用实际接口
         */
        async submitFormFn() {
            this.$refs["dialogData"].validate(async valid => {
                if (valid) {
                    this.dialogLoading = true;

                    let data = {
                        ...this.dialogData
                    };

                    try {
                        // 根据是否有ID判断是新增还是编辑
                        if (this.dialogData.id) {
                            // 更新数据集
                            /*
                            await updateResultPush(data);
                            this.$modal.msgSuccess("修改成功");
                            */
                            this.$message.success("修改成功");
                        } else {
                            // 新增数据集
                            /*
                            await addResultPush(data);
                            this.$modal.msgSuccess("新增成功");
                            */
                            this.$message.success("新增成功");
                        }

                        this.dialogDataShow = false;
                        this.getList();
                    } catch (error) {
                        console.error("操作失败:", error);
                    } finally {
                        this.dialogLoading = false;
                    }
                }
            });
        },

        /**
         * 删除数据集
         * 接口对接位置：请在下方调用实际接口
         */
        deleteFn() {
            if (this.ids.length === 0) {
                this.$message.warning('请至少选择一条数据');
                return;
            }

            this.$confirm(`确定删除选中的${this.ids.length}条数据集吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 接口调用示例（请替换为实际接口）
                /*
                deleteResultPush({ ids: this.ids }).then(res => {
                    if (res.code === 200) {
                        this.$message.success(res.msg);
                        this.getList();
                    }
                });
                */
                // 模拟删除（测试用，实际对接时删除）
                this.$message.success('删除成功');
                this.getList();
            }).catch(() => {
                // 取消删除操作
            });
        },

        /**
         * 重置新增表单数据
         */
        resetAddData() {
            this.dialogData = {
                taskName: '',
                pushType: '',
                sourceName: [],
                id: ''
            };
            // 重置表单验证
            if (this.$refs.dialogData) {
                this.$refs.dialogData.resetFields();
            }
        },
    }
};
</script>
<style>
input[aria-hidden=true] {
    display: none !important;
}
</style>
<style scoped>
.yuanDataClass {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
}

.yuanDataClass /deep/ .el-form-item {
    width: 30%;
}

.yuanDataClass /deep/ .el-form-item__label {
    width: 25%;
}

.yuanDataClass /deep/ .el-form-item__content {
    width: 75%;
}

.yuanDataClass /deep/ .el-select {
    width: 100%;
}

.dialogForm .el-form-item {
    width: 100%;
}

.dialogForm .el-form-item /deep/ .el-form-item__content {
    width: 100%;
    padding-right: 15px;
}

.dialogForm .el-form-item /deep/ .el-select {
    width: 100%;
}

.searchBtn {
    /* margin-left: auto; */
    height: 100%;
}

.tableBox {
    height: calc(100% - 36px - 50px -51px);
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar-thumb {
    background-color: #0003;
    border-radius: 10px;
    transition: all .2s ease-in-out;
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar-track {
    border-radius: 10px;
}

.addMsg ::v-deep .el-input {
    width: 100%;
}

.addMsg ::v-deep .el-select {
    width: 100%;
}

.addMsg .el-select ::v-deep .el-input {
    width: 100%;
}

.addMsg ::v-deep.el-dialog {
    border-radius: 10px;
}

.addMsg ::v-deep.el-dialog__header {
    border-bottom: 1px solid #e6e6e6;
}

.addMsg ::v-deep.el-dialog__title {
    font-weight: bold;
}

.addMsg ::v-deep.el-dialog__body {
    padding: 30px;
}

.addMsg ::v-deep.el-form {
    margin-bottom: 0;
}
</style>
