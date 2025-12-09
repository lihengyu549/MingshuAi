<template>
    <div class="app-container" v-loading="mainLoading">
        <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small"
            :inline="true" label-width="auto">
            <el-form-item label="数据集名称" prop="dataSetName">
                <el-input v-model="queryParams.dataSetName" @input="inputSearch" placeholder="请输入数据集名称" clearable
                    @keyup.enter.native="handleQuery" />
            </el-form-item>
            <el-form-item label="数据集类型" prop="dataSetType">
                <el-select clearable v-model="queryParams.dataSetType" @change="inputSearch" placeholder="请选择数据集类型">
                    <el-option v-for="item in dict.type.sys_data_set" :key="item.value" :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <!-- <el-form-item class="searchBtn" label-width="0"> -->
            <!-- <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button> -->
            <!-- </el-form-item> -->
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
            <el-table-column label="数据集名称" prop="dataSetName" align="center" width="300" show-overflow-tooltip>
                <template slot-scope="scope">
                    <span @click="handleEdit(scope.row)" style="cursor: pointer; color: #409eff;">
                        <svg-icon icon-class="dataset" style="font-size: 16px; margin-right: 5px;" />
                        {{ scope.row.dataSetName }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="数据集类型" align="center" prop="dataSetType" width="300" show-overflow-tooltip />
            <el-table-column label="数据量" align="center" prop="dataSize" width="300" show-overflow-tooltip />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" @click="handlePreview(scope.row)">查看</el-button>
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
                        <el-form-item label="数据集名称" prop="dataSetName">
                            <el-input v-model="dialogData.dataSetName" placeholder="请输入数据集名称"
                                :disabled="isViewMode"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="数据集类型" prop="dataSetType">
                            <el-select clearable v-model="dialogData.dataSetType" placeholder="请选择数据集类型"
                                :disabled="isViewMode">
                                <el-option v-for="item in dict.type.sys_data_set" :key="item.value" :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="选择内容" prop="dataContent">
                    <el-select v-model="dialogData.dataContent" multiple clearable filterable placeholder="请选择内容"
                        :disabled="isViewMode">
                        <el-option v-for="item in sourceContentList" :key="item.id" :label="item.tasksName"
                            :value="item.id"></el-option>
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
import { getDataSetList, getDatabasesProxyByIssue, addDataSet, updateDataSet, deleteDataSetByIds } from "@/api/system/modelPage";

export default {
    name: "DataManagement",
    dicts: ['sys_data_set'],
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
                dataSetType: '',
                dataSetName: '',
            },
            // 表单数据
            dialogData: {
                dataSetName: '',       // 数据集名称
                dataSetType: '',       // 数据集类型（字典表维护）
                dataContent: []      // 选择内容（多选）
            },
            // 防抖定时器
            debounceTimeout: null,
            // 表单校验规则
            dialogDataRules: {
                dataSetName: [
                    { required: true, message: "请输入数据集名称", trigger: "blur" }
                ],
                dataSetType: [
                    { required: true, message: "请选择数据集类型", trigger: "blur" }
                ],
                dataContent: [
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

    },
    mounted() {
        this.getList();
        this.getDatabasesProxyByIssueFn();
    },
    methods: {
        /**
         * 获取选择内容列表
         * 接口对接位置：请在下方调用实际接口
         */
        getDatabasesProxyByIssueFn() {
            // 接口调用示例（请替换为实际接口）
            // 获取选择内容列表接口
            try {
                getDatabasesProxyByIssue().then(res => {
                    this.sourceContentList = res.data;
                });
            } catch (error) {
                console.log('error', error);
            }

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
            try {
                getDataSetList(this.queryParams).then(res => {
                    if (res.code === 200) {
                        this.proxysList = res.data.records;
                        this.total = res.data.total;
                        this.queryParams.pageNum = res.data.pages;
                        this.queryParams.pageSize = res.data.size;
                        this.loading = false;
                    }
                });
            } catch (error) {
                console.log('error', error);
            }
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

        // 编辑按钮操作
        handleEdit(row) {
            this.dialogData = JSON.parse(JSON.stringify(row));
            this.dialogDataShow = true;
            this.title = "编辑数据集";
            this.isViewMode = false;
        },

        /** 查看按钮操作 */
        handlePreview(row) {
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
                        datasetName: this.dialogData.dataSetName,
                        datasetType: this.dialogData.dataSetType,
                        databaseProxyListId: this.dialogData.dataContent
                    };
                    try {
                        // 根据是否有ID判断是新增还是编辑
                        if (this.dialogData.id) {
                            // 更新数据集
                            data.id = this.dialogData.id;
                            await updateDataSet(data);
                            this.$message.success("修改成功");
                        } else {
                            // 新增数据集
                            await addDataSet(data);
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
                deleteDataSetByIds({ ids: this.ids }).then(res => {
                    if (res.code === 200) {
                        this.getList();
                    }
                });
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
