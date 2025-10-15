<template>
    <div class="id-card-page">
        <div class="left-section">
            <h3>{{ row.fieldName }}</h3>
            <el-card class="box-card" shadow="never">
                <div slot="header" class="clearfix">
                    <h4>基本信息</h4>
                </div>
                <el-form :model="row" label-width="120px">
                    <el-form-item label="字段注释：">
                        <el-input v-model="row.fieldRemark" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="AI字段注释：">
                        <el-input v-model="row.craftRemark" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="所属表名：">
                        <el-input v-model="row.tableName" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="AI表注释：">
                        <el-input v-model="row.craftTableRemark" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="所属库：">
                        <el-input v-model="row.databaseName" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="样本抽样：">
                        <el-button type="text" @click="handleSampleView">查看</el-button>
                    </el-form-item>
                    <el-form-item label="属性类型：">
                        <el-input v-model="row.attributeType" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="核心标签：">
                        <el-tag v-for="tag in JSON.parse(row.coreTags)" :key="tag">{{ tag || '无' }}</el-tag>
                    </el-form-item>
                </el-form>
            </el-card>

            <el-card class="box-card" shadow="never" style="margin-top: 20px;">
                <div slot="header" class="clearfix">
                    <h4>推理过程</h4>
                </div>
                <el-table :data="row.inferenceProcessList" border style="width: 100%">
                    <el-table-column prop="name" label="名称" width="120"></el-table-column>
                    <el-table-column prop="value" label="当前置信度："></el-table-column>
                    <el-table-column prop="text" label="推荐过程："></el-table-column>
                </el-table>

                <el-card class="box-card" shadow="never" style="margin-top: 20px;">
                    <div slot="header" class="clearfix">
                        <h4>最终定级：{{ row.securityLevel }}</h4>
                    </div>
                    <el-form :model="finalRating" label-width="120px">
                        <el-form-item label="推理过程：">
                            {{ `分类级别为${row.oldSecurityLevel}级，${row.newSecurityLevel ?
                                `触发动态安全分级规则，分类级别调整为${row.newSecurityLevel}级` : '未触发动态安全分级规则'}。${row.piiLevel ?
                                    `个人信息识别结果为${row.piiLevel}级` : '未开启个人信息识别'}` }}
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-card>
        </div>

        <div class="right-section">
            <div class="top-buttons">
                <el-button @click="handlePrev">上一个</el-button>
                <el-button @click="handleNext">下一个</el-button>
                <el-button type="primary" @click="handleManualConfirm">人工确认</el-button>
            </div>

            <el-card class="box-card" shadow="never" style="margin-top: 20px;">
                <div slot="header" class="clearfix">
                    <h4>人工审核</h4>
                </div>
                <div class="audit-status">
                    <span>待审核</span>
                    <el-badge is-dot></el-badge>
                </div>
                <el-form :model="auditResult" label-width="120px" style="margin-top: 20px;">
                    <el-form-item label="分类结果：">
                        {{ row.categoryName }}
                    </el-form-item>
                    <el-form-item label="定级结果：">
                        <el-tag type="warning">{{ row.securityLevelName }}</el-tag>
                    </el-form-item>
                    <el-form-item label="综合置信度：">
                        <el-progress :percentage="row.confidenceScore"></el-progress>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleModifyResult">修改结果</el-button>
                    </el-form-item>
                </el-form>
            </el-card>

            <el-card class="box-card" shadow="never" style="margin-top: 20px;">
                <div slot="header" class="clearfix">
                    <h4>AI建议分类</h4>
                </div>
                <div class="ai-suggestion">
                    <img src="https://via.placeholder.com/100" alt="暂无数据" style="display: block; margin: 0 auto;">
                    <p style="text-align: center; margin-top: 10px;">暂无数据</p>
                </div>
            </el-card>
        </div>
        <el-dialog title="结果修改" :visible.sync="dialogVisible" width="400px">
            <el-form :model="form" label-width="80px">
                <el-form-item label="分类" required>
                    <el-input v-model="form.classification" placeholder="请输入分类"></el-input>
                </el-form-item>
                <el-form-item label="安全分级" required>
                    <el-select v-model="form.securityLevel" multiple disabled>
                        <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">返回</el-button>
                <el-button type="primary" @click="handleConfirm">确认</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
     dicts: ['sys_risk_level'],
    data() {
        return {
            dialogVisible: true,
            form: {
                classification: '业务-合同-客户信息',
                securityLevel: '3级'
            },
            row: this.$route.query.row,
            finalRating: {
                inferenceProcess: '分类级别为 3级，触发动态安全分级规则，分类级别调整为 4级，个人信息识别结果为 5级'
            },
            auditResult: {
                classificationResult: '客户>个人>个人自然属性>个人财产信息'
            }
        };
    },
    created() {
        console.log('row', this.row);
    },
    methods: {
        handleConfirm() {
            // 点击确认后的逻辑，比如提交表单数据等
            console.log('确认修改，分类：', this.form.classification, '，安全分级：', this.form.securityLevel);
            this.dialogVisible = false;
        },
        handleSampleView() {
            // 样本抽样查看点击事件
            console.log('样本抽样查看');
        },
        handlePrev() {
            // 上一个点击事件
            console.log('上一个');
        },
        handleNext() {
            // 下一个点击事件
            console.log('下一个');
        },
        handleManualConfirm() {
            // 人工确认点击事件
            console.log('人工确认');
        },
        handleModifyResult() {
            // 修改结果点击事件
            console.log('修改结果');
        }
    }
};
</script>

<style scoped>
.id-card-page {
    display: flex;
    justify-content: space-between;
    padding: 20px;
}

.left-section {
    width: 65%;
}

.right-section {
    width: 32%;
}

.top-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.audit-status {
    display: flex;
    align-items: center;
}

.audit-status .el-badge {
    margin-left: 5px;
}

.ai-suggestion {
    padding: 20px;
    text-align: center;
}
</style>