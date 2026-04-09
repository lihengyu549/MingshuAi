<template>
    <div class="app-container" v-loading="mainLoading">
        <el-card class="search-card" shadow="never">
            <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small"
                :inline="true" label-width="auto">
                <el-form-item label="任务名称" prop="modelTaskName">
                    <el-input v-model="queryParams.modelTaskName" @input="inputSearch" placeholder="请输入数据源名称" clearable
                        @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item label="训练状态 " prop="modelTrainingStatus">
                    <el-select clearable v-model="queryParams.modelTrainingStatus" @change="inputSearch"
                        placeholder="请选择训练状态">
                        <el-option v-for="item in dict.type.sys_model_drill" :key="item.value" :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="数据集 " prop="dataSetId">
                    <el-select clearable v-model="queryParams.dataSetId" @change="inputSearch" placeholder="请选择数据集">
                        <el-option v-for="item in dataSetList" :key="item.id" :label="item.dataSetName" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </el-card>
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="medium" @click="handleAdd">新增任务</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="el-icon-close" size="medium" @click="deleteFn">删除任务 </el-button>
            </el-col>
        </el-row>
        <el-card class="table-card" shadow="never">
            <el-table v-loading="loading" class="tableBox" :data="proxysList"
            @selection-change="handleSelectionChange" ref="tableRef">
            <template slot="empty">
                <el-empty description="暂无数据"></el-empty>
            </template>
            <el-table-column type="selection" width="60" align="center" />
            <el-table-column label="任务名称" prop="modelTaskName" align="left" width="200" show-overflow-tooltip>
                <template slot-scope="scope">
                    <span @click="handleEdit(scope.row)" style="cursor: pointer; color: #409eff;">
                        <svg-icon icon-class="dataset" style="font-size: 16px; margin-right: 5px;" />
                        {{ scope.row.modelTaskName }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="基座类型" align="center" prop="modelBase" width="150" show-overflow-tooltip />
            <el-table-column label="训练方法" align="center" prop="modelTrainingMethod" width="150" show-overflow-tooltip />
            <el-table-column label="训练状态" align="center" prop="modelTrainingStatusName" width="150" show-overflow-tooltip />
            <el-table-column label="数据集" align="center" prop="dataSetId" width="150" show-overflow-tooltip>
                <template slot-scope="scope">
                    {{ scope.row.dataSet ? scope.row.dataSet.dataSetName : '-' }}
                </template>
            </el-table-column>
            <el-table-column label="产出模型名称" align="center" prop="modelOutputName" width="300" show-overflow-tooltip />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="200">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" @click="startTraining(scope.row)" :disabled="scope.row.modelTrainingStatus == '2'">开始训练</el-button>
                    <el-button size="mini" type="text" @click="stopTraining(scope.row)" :disabled="scope.row.modelTrainingStatus != '2'">终止训练</el-button>
                </template>
            </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :pageSize.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <Drawer :title="title" v-loading="dialogLoading" :visible.sync="dialogDataShow" append-to-body
            :close-on-click-modal="false">
            <el-form slot="body" class="dialogForm" :rules="dialogDataRules" :model="dialogData" size="medium"
                ref="dialogData" :inline="true" label-width="110px" label-position="top">
                <Title title="基本信息" />
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="任务名称" prop="modelTaskName">
                            <el-input v-model="dialogData.modelTaskName" placeholder="请输入任务名称"
                                :disabled="isViewMode"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="训练方式" prop="modelTrainingMethod">
                            <el-select clearable v-model="dialogData.modelTrainingMethod" placeholder="请选择训练方式"
                                :disabled="true">
                                <el-option label="SFT微调训练" value="SFT微调训练"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="基座模型" prop="modelBase">
                            <el-select clearable v-model="dialogData.modelBase" placeholder="请选择基座模型"
                                :disabled="true">
                                <el-option label="Qwen3-4B" value="Qwen3-4B"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="训练数据集" prop="dataSetId">
                            <el-select clearable v-model="dialogData.dataSetId" placeholder="请选择训练数据集"
                                :disabled="isViewMode">
                                <el-option v-for="item in dataSetList" :key="item.id" :label="item.dataSetName"
                                    :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="模型导出名称" prop="modelOutputName">
                    <el-input v-model="dialogData.modelOutputName" placeholder="请输入模型导出名称"
                        :disabled="true"></el-input>
                </el-form-item>
                <Title title="参数配置">
                    <el-button type="text" icon="el-icon-refresh-right" size="mini" style="float: inline-end;"
                        @click="resetParam">恢复默认配置</el-button>
                </Title>
                <el-form-item prop="modelParameterConfigJson">
                    <el-table :data="dialogData.modelParameterConfigJson" style="width: 100%">
                        <template slot="empty">
                            <el-empty description="暂无数据"></el-empty>
                        </template>
                        <el-table-column label="参数名称" prop="paramName" align="center" width="150"
                            show-overflow-tooltip />
                        <el-table-column label="配置" prop="paramValue" align="center" width="150">
                            <template slot-scope="scope">
                                <!-- 根据参数类型动态渲染输入组件 -->
                                <el-select v-if="scope.row.type === 'select'" v-model="scope.row.paramValue" 
                                    placeholder="请选择配置" :disabled="isViewMode" style="width: 100%;">
                                    <el-option 
                                        v-for="option in scope.row.options" 
                                        :key="option.value" 
                                        :label="option.label" 
                                        :value="option.value">
                                    </el-option>
                                </el-select>
                                <el-input v-else v-model="scope.row.paramValue" 
                                    placeholder="请输入配置" 
                                    :disabled="isViewMode"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="说明" prop="paramDesc" align="center" min-width="150"
                            show-overflow-tooltip />
                    </el-table>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" plain @click="submitFormFn" v-if="!isViewMode">确 定</el-button>
                <el-button @click="importcancel">取 消</el-button>
            </div>
        </Drawer>
    </div>
</template>

<script>
// 导入API接口
import {
    getModelDrillList,    // 获取模型列表
    getModelDrillById,    // 获取模型钻取详情
    addModelDrill,        // 新增模型钻取
    updateModelDrill,     // 更新模型钻取
    deleteModelDrillByIds, // 批量删除模型钻取
    startDrillById,        // 开启训练
    finishDrillById,       // 终止训练
    getDataSetListByAll    // 获取所有数据集列表
} from "@/api/system/modelPage";

export default {
    name: "ModelTuning",
    dicts: ['sys_model_drill'],
    data() {
        return {
            // 遮罩层
            loading: false,
            mainLoading: false,
            dialogLoading: false,
            dataSetList: [],    // 所有数据集列表
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
                modelTaskName: '',
                modelTrainingStatus: '',
                dataSetId: '',
            },
            // 表单数据
            dialogData: {
                modelTaskName: '',       // 数据集名称
                modelTrainingMethod: 'SFT微调训练',       // 数据集类型（字典表维护）
                modelBase: 'Qwen3-4B',     // 选择内容
                dataSetId: '',     // 选择内容
                modelOutputName: '',     // 选择内容
                modelParameterConfigJson: [] // 参数配置
            },
            // 防抖定时器
            debounceTimeout: null,
            // 表单校验规则
            dialogDataRules: {
                modelTaskName: [
                    { required: true, message: "请输入任务名称", trigger: "blur" }
                ],
                modelTrainingMethod: [
                    { required: true, message: "请选择训练方式", trigger: "blur" }
                ],
                modelBase: [    
                    { required: true, message: "请选择基座模型", trigger: "blur" }
                ],
                dataSetId: [
                    { required: true, message: "请选择训练数据集", trigger: "blur" }
                ],
                modelOutputName: [
                    { required: true, message: "请输入模型导出名称", trigger: "blur" }
                ],
            },
            // 数据字典列表
            providerList: [],   // 对接厂商列表
            pushList: [],       // 推送类型列表
            standardList: [],   // 分类分级标准列表
            defaultParamList: [
                { paramName: "batch_size", paramValue: "16", paramDesc: "批次大小，代表模型训练过程中，模型更新模型参数的数据步长", type: "input" },
                { paramName: "learning_rate", paramValue: "0.00001", paramDesc: "学习率，代表每次更新数据的增量参数权重，学习率数值越大参数更新越快，可能导致模型训练不稳定", type: "input" },
                {
                    paramName: "lr_scheduler_type", paramValue: "linear", paramDesc: "学习率调整策略，选择不同的学习率策略，动态地改变模型在训练过程中的学习率", type: "select", options: [
                        { label: "linear", value: "1" },
                    ]
                },
                { paramName: "max_length", paramValue: "8192", paramDesc: "序列长度，单个训练数据样本的最大长度，超出配置长度将丢弃", type: "input" },
                { paramName: "weight_decay", paramValue: "0.01", paramDesc: "权重衰减，用于在优化过程中对模型参数施加L2正则化，防止过拟合", type: "input" }
            ]
        };
    },
    computed: {
    },
    created() {
    },
    mounted() {
        this.getList();
        this.getDataSetListByAllFn();
    },
    methods: {
        /**
         * 获取所有数据集列表
         */
        getDataSetListByAllFn() {
            getDataSetListByAll().then(res => {
                if (res.code === 200) {
                    this.dataSetList = res.data;
                }
            }).catch(error => {
                console.error("获取所有数据集列表失败:", error);
            });
        },
        /**
         * 新增参数
         */
        resetParam() {
            // 使用Vue.set或展开运算符确保响应式更新
            this.dialogData.modelParameterConfigJson = JSON.parse(JSON.stringify(this.defaultParamList));
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
         * 查询模型列表
         */
        getList() {
            this.loading = true;
            // 调用获取模型列表接口
            getModelDrillList(this.queryParams).then(res => {
                if (res.code === 200) {
                    this.proxysList = res.data.records;
                    this.total = res.data.total;
                }
                this.loading = false;
            }).catch(error => {
                console.error("获取模型列表失败:", error);
                this.loading = false;
            });
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
            this.resetParam();
            const now = new Date();
            const dateStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
            const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
            this.dialogData.modelOutputName = `MingShu_${dateStr}_${timeStr}`;
            this.dialogDataShow = true;
            this.title = "新增数据集";
            this.isViewMode = false;
        },
        
        /** 编辑按钮操作 */
        handleEdit(row) {
            this.resetAddData();
            // 复制行数据到对话框数据
            this.dialogData = JSON.parse(JSON.stringify(row));
            // 确保modelParameterConfigJson存在且为数组
            if (!this.dialogData.modelParameterConfigJson) {
                this.dialogData.modelParameterConfigJson = [];
            }
            this.dialogDataShow = true;
            this.title = "编辑数据集";
            this.isViewMode = false;
        },
        
        /** 查看按钮操作 */
        handleView(row) {
            this.resetAddData();
            // 复制行数据到对话框数据
            this.dialogData = JSON.parse(JSON.stringify(row));
            // 确保modelParameterConfigJson存在且为数组
            if (!this.dialogData.modelParameterConfigJson) {
                this.dialogData.modelParameterConfigJson = [];
            }
            this.dialogDataShow = true;
            this.title = "查看数据集";
            this.isViewMode = true;
        },

        /** 开始训练按钮操作 */
        startTraining(row) {
            this.$confirm(`确定开始训练任务"${row.modelTaskName}"吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                startDrillById(row.id).then(res => {
                    if (res.code === 200) {
                        this.$message.success("开始训练成功");
                        this.getList();
                    } else {
                        this.$message.error("开始训练失败：" + res.msg);
                    }
                }).catch(error => {
                    console.error("开始训练失败:", error);
                    this.$message.error("开始训练失败");
                });
            }).catch(() => {
                // 取消操作
            });
        },

        /** 终止训练按钮操作 */
        stopTraining(row) {
            this.$confirm(`确定终止训练任务"${row.modelTaskName}"吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 调用终止训练接口
                finishDrillById(row.id).then(res => {
                    if (res.code === 200) {
                        this.$message.success("终止训练成功");
                        this.getList();
                    } else {
                        this.$message.error("终止训练失败：" + res.msg);
                    }
                }).catch(error => {
                    console.error("终止训练失败:", error);
                    this.$message.error("终止训练失败");
                }); 
            }).catch(() => {
                // 取消操作
            });
        },

        /**
         * 表单提交
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
                            // 更新模型
                            await updateModelDrill(data);
                            this.$message.success("修改成功");
                        } else {
                            // 新增模型
                            await addModelDrill(data);
                            this.$message.success("新增成功");
                        }

                        this.dialogDataShow = false;
                        this.getList();
                    } catch (error) {
                        console.error("操作失败:", error);
                        this.$message.error("操作失败");
                    } finally {
                        this.dialogLoading = false;
                    }
                }
            });
        },

        /**
         * 删除模型
         */
        deleteFn() {
            if (this.ids.length === 0) {
                this.$message.warning('请至少选择一条数据');
                return;
            }

            this.$confirm(`确定删除选中的${this.ids.length}条模型吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // 调用批量删除接口
                deleteModelDrillByIds({ ids: this.ids }).then(res => {
                    if (res.code === 200) {
                        this.$message.success(res.msg || '删除成功');
                        this.getList();
                    } else {
                        this.$message.error(res.msg || '删除失败');
                    }
                }).catch(error => {
                    console.error("删除模型失败:", error);
                    this.$message.error("删除失败");
                });
            }).catch(() => {
                // 取消删除操作
            });
        },

        /**
         * 重置新增表单数据
         */
        resetAddData() {
            this.dialogData = {
                modelTaskName: '',
                modelTrainingMethod: 'SFT微调训练',
                modelBase: 'Qwen3-4B',
                dataSetId: '',
                modelOutputName: '',
                modelParameterConfigJson: [],
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
<style scoped>
.search-card {
  border-radius: 10px;
  margin-bottom: 20px;

  .el-form-item {
    margin-bottom: 0;
  }
}

.table-card {
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .el-card__body {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.tableBox {
  overflow-y: auto;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #e2e8f0;
}

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

.dialog-footer {
    text-align: right;
}
</style>
