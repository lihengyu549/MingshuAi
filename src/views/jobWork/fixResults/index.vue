<template>
    <div class="container" v-loading="loading">
        <!-- 顶部标题和按钮区域 -->
        <el-card class="top-section" shadow="never">
            <h2><el-tag type="info" style="font-size: 18px;">ID：{{ row.id }}</el-tag> {{ titleText }}</h2>
            <div class="top-buttons">
                <el-button plain @click="handleReturn">{{ $t('return') }}</el-button>
                <el-button @click="handleNext('0')">{{ $t('previous') }}</el-button>
                <el-button @click="handleNext('1')">{{ $t('next') }}</el-button>
                <el-button type="primary" plain @click="handleManualConfirm">{{ $t('fixResults.top.manualConfirm')
                    }}</el-button>
            </div>
        </el-card>

        <!-- 下方左右分栏区域 -->
        <div class="content-section">
            <div class="left-section">
                <el-card class="box-card" shadow="never" style="border: none;">
                    <template v-if="isFileSource">
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.fileType') }}：</label>
                            <div class="info-content">{{ row.fileFormat || '--' }}</div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.fileSize') }}：</label>
                            <div class="info-content">{{ row.fileSizeName || '--' }}</div>
                        </div>
                        <!-- <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.uploadTime') }}：</label>
                            <div class="info-content">{{ row.createTime || '--' }}</div>
                        </div> -->
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.fileSummary') }}：</label>
                            <div class="info-content">{{ row.fileContext || '--' }}</div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.filePath') }}：</label>
                            <div class="info-content">{{ row.filePath || '--' }}</div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.fieldRemark') }}：</label>
                            <div class="info-content">{{ row.fieldRemark || '--' }}</div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.aiFieldRemark') }}：</label>
                            <div class="info-content">{{ row.craftRemark || '--' }}</div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.fieldTopic') }}：</label>
                            <div class="info-content">
                                <el-tag v-for="tag in (row.fieldTopic ? JSON.parse(row.fieldTopic) : [])" :key="tag"
                                    style="margin-right: 5px; border-radius: 8px;">{{ tag ||
                                        '--' }}</el-tag>
                            </div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.dataPath') }}：</label>
                            <div class="info-content">
                                {{ row.businessName + ' / ' + row.databaseName + ' / ' + row.tableName }}
                            </div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.tableRemark') }}：</label>
                            <div class="info-content">
                                {{ row.tableRemark || '--' }}
                            </div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.aiTableRemark') }}：</label>
                            <div class="info-content">{{ row.tableCraftRemark || '--' }}</div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.tableTopic') }}：</label>
                            <div class="info-content">
                                <el-tag type="success" v-for="tag in (row.tableTopic ? JSON.parse(row.tableTopic) : [])"
                                    :key="tag" style="margin-right: 5px; border-radius: 8px;">{{ tag ||
                                        '--' }}</el-tag>
                            </div>
                        </div>
                        <!-- <div class="info-item">
                        <label class="info-label">所属库：</label>
                        <div class="info-content">{{ row.databaseName }}</div>
                    </div> -->
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.samplePreview') }}：</label>
                            <div class="info-content">
                                <el-tooltip placement="bottom" effect="light">
                                    <div slot="content">
                                        <el-table :data="row.sampleList" height="250" border class="tableCla"
                                            style="width: 100%">
                                            <el-table-column type="index" :label="$t('index')" width="50" />
                                            <el-table-column prop="value" :label="$t('fieldValue')" width="100"
                                                show-overflow-tooltip>
                                            </el-table-column>
                                        </el-table>
                                    </div>
                                    <el-button size="mini" type="text">{{ $t('view') }}</el-button>
                                </el-tooltip>
                            </div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.top.sampleFeature') }}：</label>
                            <div class="info-content">
                                <el-tag type="info" style="margin-right: 5px; border-radius: 8px;">{{
                                    row.regularExpression
                                    ||
                                    '--' }}</el-tag>
                            </div>
                        </div>
                    </template>

                </el-card>
                <el-card shadow="never" style="margin-top: 20px; border-radius: 10px;">
                    <Title :title="$t('fixResults.sections.reasoningProcess')"></Title>
                    <el-card class="box-card" shadow="never" v-for="(item, index) in row.inferenceProcessList"
                        :key="index" style="margin-bottom: 20px;">
                        <template slot="header">
                            <span class="header-name">{{ item.name }}</span>
                            <span class="header-confidence">{{
                                `${$t('fixResults.sections.currentConfidence')}：${item.value * 100}%` }}</span>
                        </template>
                        <div class="info-item">
                            <label class="info-label"><svg-icon icon-class="home-aiAuto"
                                    style="font-size: 18px; margin-right: 10px; flex-shrink: 0;" />{{
                                        $t('fixResults.sections.aiReasoning') }}：</label>
                            <div class="info-content">{{ item.text }}</div>
                        </div>
                    </el-card>

                    <el-card class="box-card" shadow="never" style="margin-top: 20px;">
                        <template slot="header">
                            <span class="header-name">{{ $t('fixResults.sections.finalGrade') }}：{{
                                row.securityLevelName }}</span>
                            <el-tag size="small" type="primary" color="#ffc5e0"
                                style="border-radius: 8px; float: inline-end; color: #dc478f;">{{
                                    $t('fixResults.sections.higherLevelRule') }}</el-tag>
                        </template>
                        <div class="info-item">
                            <label class="info-label"><svg-icon icon-class="home-aiAuto"
                                    style="font-size: 18px; margin-right: 10px; flex-shrink: 0;" />{{
                                        $t('fixResults.sections.aiReasoning') }}：</label>
                            <div class="info-content">
                                {{ row.dynamicGrading }}<br />
                                <template v-if="row.oldSecurityLevel || row.newSecurityLevel || row.piiLevel">
                                    {{ $t('fixResults.sections.classificationResult') }}<el-tag size="small"
                                        type="primary" style="border-radius: 8px;">{{
                                            row.oldSecurityLevel }}{{ $t('fixResults.texts.level') }}</el-tag>，
                                    <template v-if="row.newSecurityLevel">
                                        {{ $t('fixResults.texts.dynamicRuleTriggered') }}<el-tag size="small"
                                            type="success" style="border-radius: 8px;">{{
                                                row.newSecurityLevel }}{{ $t('fixResults.texts.level') }}</el-tag>
                                    </template>
                                    <template v-else>
                                        {{ $t('fixResults.texts.dynamicRuleNotTriggered') }}
                                    </template>。
                                    <template v-if="row.piiLevel">
                                        {{ $t('fixResults.texts.piiResultLevel') }}<el-tag size="small" type="info"
                                            style="border-radius: 8px;">{{
                                                row.piiLevel }}{{ $t('fixResults.texts.level') }}</el-tag>
                                    </template>
                                    <template v-else>
                                        {{ $t('fixResults.texts.piiNotEnabled') }}
                                    </template>
                                </template>
                            </div>
                        </div>
                    </el-card>
                </el-card>
            </div>

            <div class="right-section">
                <el-card class="box-card" shadow="never">
                    <Title :title="$t('fixResults.sections.manualReview')" iconClass="seal"></Title>
                    <div class="audit-status">
                        <span>{{ row.confirm == '1' ? $t('fixResults.texts.confirmed') :
                            $t('fixResults.texts.unconfirmed')
                            }}</span>
                        <el-badge is-dot></el-badge>
                    </div>
                    <div class="info-container" style="margin-top: 20px;">
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.sections.classificationResult') }}：</label>
                            <div class="info-content">{{ row.categoryName || '--' }}</div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.sections.gradingResult') }}：</label>
                            <div class="info-content">
                                <el-tag :style="getRiskStyle(Number(row.securityLevel))">{{ row.securityLevelName ||
                                    '--'
                                    }}</el-tag>
                            </div>
                        </div>
                        <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.sections.overallConfidence') }}：</label>
                            <div class="info-content">
                                <el-progress :percentage="Number(row.confidenceScore) * 100"></el-progress>
                            </div>
                        </div>
                        <!-- <div class="info-item">
                            <label class="info-label">{{ $t('fixResults.sections.piiReview') }}：</label>
                            <div class="info-content">{{ row.piiDetectionName || '--' }}</div>
                        </div> -->
                        <div class="info-item">
                            <el-button type="primary" plain class="full-width-btn" @click="handleModifyResult">{{
                                $t('fixResults.sections.modifyResult') }}</el-button>
                        </div>
                    </div>
                </el-card>

                <el-card class="box-card" shadow="never" style="margin-top: 20px;">
                    <Title :title="$t('fixResults.sections.aiSuggestedCategory')" iconClass="suggest"></Title>
                    <template v-if="row.suggestClassifyJson">
                        <el-card
                            style="padding: 20px; line-height: 1.8; border-radius: 10px; background-color: rgb(249 249 250);"
                            shadow="never">
                            <h4 style="margin: 0 0 15px 0; font-size: 14px; font-weight: bold;"><svg-icon
                                    icon-class="dot" style="margin-right: 5px;" />{{
                                        row.suggestClassifyJson.categoryName }}</h4>
                            <p
                                style="margin: 0 0 15px 0; font-size: 12px; color: #606266; text-align: left; text-indent: 24px;">
                                {{ row.suggestClassifyJson.categoryDescription }}
                            </p>
                            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold;"><svg-icon
                                    icon-class="star-hollow" style="margin-right: 5px;" />{{
                                        $t('fixResults.sections.recommendationReason') }}:</h5>
                            <p style="margin: 0; font-size: 12px; color: #606266; text-align: left; text-indent: 24px;">
                                {{ row.suggestClassifyJson.createReason }}
                            </p>
                        </el-card>
                    </template>
                    <template v-else>
                        <div
                            style="text-align: center; padding: 40px 20px; background-color: rgb(249 249 250); border-radius: 10px;">
                            <div style="margin-bottom: 15px; color: #c0c4cc;">
                                <svg-icon icon-class="info" style="font-size: 32px;" />
                            </div>
                            <p style="font-size: 14px; color: #606266; margin: 0;">{{
                                $t('fixResults.sections.noSuggestedCategory') }}</p>
                            <p style="font-size: 12px; color: #909399; margin-top: 8px;">{{
                                $t('fixResults.sections.noSuggestedCategoryDesc') }}</p>
                        </div>
                    </template>
                </el-card>
            </div>
        </div>

        <el-dialog class="addMsg" :title="$t('fixResults.dialog.title')" :visible.sync="dialogVisible" width="700px">
            <el-form :model="resultForm" ref="resultForm" size="small" label-width="auto" label-position="top">
                <el-form-item :label="$t('fixResults.dialog.category')" class="addSelectClass">
                    <el-select ref="resultSelectRef" v-model="resultFormNodeName" filterable
                        :filter-method="handleSearch" clearable @focus="clearResultFilter">
                        <el-option style="height: 100%; padding: 0" value="">
                            <el-tree :data="categoryList" :props="defaultProps" filterable :expand-on-click-node="true"
                                :filter-node-method="filterNode" ref="treeSelectSec" node-key="id" highlight-current
                                @node-click="resultHandleNodeClick" />
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('fixResults.dialog.securityLevel')" class="addSelectClass"
                    prop="securityLevel">
                    <el-select v-model="resultForm.securityLevel" disabled :placeholder="$t('pleaseSelect')">
                        <el-option v-for="item in levelOptions" :key="item.value" :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('fixResults.dialog.piiReview')" class="addSelectClass" prop="piiDetection">
                    <el-select ref="piiSelectRef" v-model="piiNodeName" clearable>
                        <el-option style="height: 100%; padding: 0" value="">
                            <el-tree :data="piiList" :props="defaultProps" :expand-on-click-node="true"
                                :filter-node-method="filterNode" ref="treeSelect" node-key="id" highlight-current
                                @node-click="piiHandleNodeClick" />
                        </el-option>
                    </el-select>
                </el-form-item>
                <!-- <el-form-item label="识别方式" prop="detectionProcess">
                    <el-input v-model="resultForm.detectionProcess" type="textarea"
                        :autosize="{ minRows: 3, maxRows: 10 }" maxlength="500" placeholder="请输入识别方式"></el-input>
                </el-form-item> -->
            </el-form>
            <template #footer>
                <span>
                    <el-button type="primary" plain @click="updataResultFn">{{ $t('confirm') }}</el-button>
                    <el-button @click="updataResultCanelFn">{{ $t('cancel') }}</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { getCategoryAttachData, updateFiledRule, confirmIds } from "@/api/system/proxys";
import { updateResultByFile, selectLastOrNextByFileId } from "@/api/system/unstructured"
import {
    treeListI, getProtectTableFieldById
} from "@/api/system/protectCategory"
import { getCategorySchemaLevelList } from "@/api/data"
export default {
    dicts: [],
    data() {
        return {
            loading: false,
            dialogVisible: false,
            row: null,
            finalRating: {
                inferenceProcess: '分类级别为 3级，触发动态安全分级规则，分类级别调整为 4级，个人信息识别结果为 5级'
            },
            auditResult: {
                classificationResult: '客户>个人>个人自然属性>个人财产信息'
            },
            categoryList: [],
            defaultProps: {
                children: "children",
                label: "label"
            },
            resultForm: {
                categoryId: '',
                securityLevel: '',
                id: '',
                piiDetection: '',
                classificationLogic: '',
            },
            resultFormNodeName: '',
            levelOptions: [],
            piiNodeName: '',
            piiList: [],
            originalQueryParams: null
        };
    },
    created() {
        this.row = this.$route.query.row || null;
        this.categoryList = this.$route.query.categoryList || [];
        if (this.$route.query.queryParams) {
            const { pageNum, pageSize, ...rest } = this.$route.query.queryParams;
            this.originalQueryParams = { ...rest };
        }
        this.getPiiList()
    },
    watch: {
        'resultForm.categoryId'(val) {
            this.fetchLevelOptions(val)
        }
    },
    computed: {
        isFileSource() {
            return this.$route.query.queryParams.sourceType === 'FILE_CATALOGUE' || this.$route.query.queryParams.sourceType === 'FILE_SERVER';
        },
        titleText() {
            return this.row.id + ' ' + (this.isFileSource ? this.row.fileName : this.row.fieldName);
        }
    },
    methods: {
        fetchLevelOptions(categoryId) {
            const params = {}
            if (categoryId) params.projectId = categoryId
            getCategorySchemaLevelList(params).then(res => {
                const payload = res && res.data ? res.data : res
                const list = payload.records || payload.rows || payload.list || payload || []
                this.levelOptions = list.map(it => ({
                    value: it.level,
                    label: it.levelName
                }))
            })
        },
        getRiskStyle(level) {
            const styles = {
                1: { color: '#16a34a', backgroundColor: '#f0fdf4', border: 'none' },
                2: { color: '#f97316', backgroundColor: '#fff7ed', border: 'none' },
                3: { color: '#c2410c', backgroundColor: '#ffedd5', border: 'none' },
                4: { color: '#dc2626', backgroundColor: '#fee2e2', border: 'none' },
                5: { color: '#991b1b', backgroundColor: '#fecaca', border: 'none' }
            };
            return styles[level] || { color: '#6b7280', backgroundColor: '#f3f4f6', border: 'none' };
        },
        getPiiList(key) {
            this.treeLoading = true
            let data = {
                parentId: 1,
                needSub: 1,
                ifAddUnclassified: 2
            };
            treeListI(data).then((resp) => {
                this.piiList = resp.data
                this.yuanCategoryList = resp.data
                if (resp.data.length == 0) {
                    this.Loading = false
                } else {
                    let tempList = JSON.parse(JSON.stringify(this.piiList))
                    for (let item of tempList) {
                        item.label = item.categoryName
                    }
                    this.piiList = this.handleTree(tempList, "id")
                    this.categoryListEdit = this.handleTree(tempList, "id")
                }
                this.Loading = false
                this.treeLoading = false
            });
        },
        updataResultFn() {
            this.updataLoading = true
            console.log('resultForm', this.row);
            let params = {
                reasoningProcess: this.resultForm.reasoningProcess,
                tableFieldIds: [this.row.id],
                categoryId: this.resultForm.categoryId,
                securityLevel: this.resultForm.securityLevel,
                auditRecommendation: this.resultForm.auditRecommendation,
                confidenceLevel: this.resultForm.confidenceLevel,
                piiDetection: this.resultForm.piiDetection,
                detectionProcess: this.resultForm.detectionProcess,
            }
            updateFiledRule(params).then(res => {
                if (res.code == 200) {
                    this.row = res.data;
                    this.$message({
                        message: res.msg,
                        type: 'success'
                    })
                }
                this.dialogVisible = false
                this.resultFormNodeName = ''
                this.resetForm('resultForm')
                this.updataLoading = false
            })
                .catch(err => {
                    this.dialogVisible = false
                })

            // this.handleNext('2')
        },
        updataResultCanelFn() {
            this.dialogVisible = false
            this.resultFormNodeName = ''
            this.piiNodeName = ''
            this.resetForm('resultForm')
        },
        // 递归函数，查找父节点的 label 并返回完整的路径
        findParentLabelsById(tree, nodeId, path = []) {
            if (!Array.isArray(tree)) {
                return null;
            }
            for (const node of tree) {
                if (node.children && node.children.length > 0) {
                    for (const child of node.children) {
                        if (child.id === nodeId) {
                            return [...path, node.label];
                        }
                    }
                    const found = this.findParentLabelsById(node.children, nodeId, [...path, node.label]);
                    if (found) {
                        return found;
                    }
                }
            }
            return null; // 如果没有找到，返回 null
        },
        resultHandleNodeClick(node) {
            if (node.children && node.children.length > 0) {
                node.disabled = true;
            } else {
                const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
                if (parentLabels) {
                    this.resultFormNodeName = parentLabels.join('-') + '-' + node.categoryName;
                } else {
                    this.resultFormNodeName = node.categoryName;
                }
                this.resultForm.categoryId = node.id
                this.$refs.resultSelectRef.blur()
                getCategoryAttachData({ categoryId: node.id, piiId: this.resultForm.piiDetection }).then(res => {
                    this.resultForm.securityLevel = res.data.minSecurityLevel + ''
                })
            }
        },
        piiHandleNodeClick(node) {
            if (node.children && node.children.length > 0) {
                node.disabled = true;
            } else {
                const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
                if (parentLabels) {
                    this.piiNodeName = parentLabels.join('-') + '-' + node.categoryName;
                } else {
                    this.piiNodeName = node.categoryName;
                }
                this.resultForm.piiDetection = node.id
                this.$refs.piiSelectRef.blur()
                getCategoryAttachData({ piiId: node.id, categoryId: this.resultForm.categoryId }).then(res => {
                    this.resultForm.securityLevel = res.data.minSecurityLevel + ''

                })
            }
        },
        filterNode(value, data, node) {
            if (!value) return true; // 无搜索值时显示所有节点

            // 1. 检查当前节点是否匹配
            const isCurrentMatch = data.label && data.label.toLowerCase().includes(value.toLowerCase());
            if (isCurrentMatch) return true;

            // 2. 检查所有父节点是否有匹配（确保子节点在父节点匹配时显示）
            let parent = node.parent;
            while (parent) {
                if (parent.data?.label && parent.data.label.toLowerCase().includes(value.toLowerCase())) {
                    return true;
                }
                parent = parent.parent;
            }

            // 3. 检查所有子节点是否有匹配（确保父节点在子节点匹配时显示）
            const hasMatchingChild = (children) => {
                if (!children || !children.length) return false;
                return children.some(child => {
                    // 子节点自身匹配
                    if (child.label && child.label.toLowerCase().includes(value.toLowerCase())) {
                        return true;
                    }
                    // 递归检查子节点的后代
                    return hasMatchingChild(child.children);
                });
            };

            return hasMatchingChild(data.children);
        },
        handleSearch(val) {
            this.$refs.treeSelectSec.filter(val);
        },
        clearResultFilter() {
            this.$refs.treeSelectSec.filter('');
        },
        handleConfirm() {
            // 点击确认后的逻辑，比如提交表单数据等
            console.log('确认修改，分类：', this.resultFormNodeName, '，安全分级：', this.securityLevel);
            this.dialogVisible = false;
        },
        handleNext(lastOrNext) {
            // 上||下一个点击事件
            // 参数说明：0-上一个，1-下一个，2-当前
            this.loading = true;
            const queryParams = this.$route.query.queryParams || {};
            const params = {
                ...queryParams,
                securityLevelIds: Array.isArray(queryParams.securityLevel) ? [...queryParams.securityLevel] : [],
                securityLevel: queryParams.securityLevel?.toString() || '',
                id: this.row?.id || '',
                lastOrNext: lastOrNext || '0'
            };
            getProtectTableFieldById(params).then(res => {
                this.handleNextResponse(res, lastOrNext);
            }).catch(() => {
                this.loading = false;
                this.$message({
                    message: this.$t('fixResults.messages.loadFailed'),
                    type: 'error'
                });
            });
        },
        handleNextResponse(res, lastOrNext) {
            if (!res) {
                console.error('API返回数据格式异常');
                this.loading = false;
                return;
            }

            if (res.code === 200 && res.data) {
                if (this.isFileSource && res.data.sampleData) {
                    try {
                        const parsedData = JSON.parse(res.data.sampleData);
                        if (Array.isArray(parsedData)) {
                            res.data.sampleList = parsedData.map(item => ({ key: Object.keys(item)[0], value: Object.values(item)[0] }));
                        }
                    } catch (e) {
                        res.data.sampleList = [];
                    }
                } else if (res.data.sampleData) {
                    try {
                        res.data.sampleList = JSON.parse(res.data.sampleData).map(item => ({ value: item }));
                    } catch (e) {
                        res.data.sampleList = [];
                    }
                }

                if (res.data.inferenceProcessList) {
                    res.data.inferenceProcessList = res.data.inferenceProcessList.map(item => ({
                        ...item,
                        expanded: this.isAllReasoningExpanded
                    }));
                }

                this.row = res.data;
                this.$route.query.queryParams.pageNum = res.data.pageNum;
                this.$route.query.queryParams.pageSize = res.data.pageSize;

                if (res.data.reasoningProcess !== undefined) {
                    this.resultForm.reasoningProcess = res.data.reasoningProcess;
                }

                if (lastOrNext === '0') {
                    this.$message({
                        message: this.$t('fixResults.messages.switchedPrevious'),
                        type: 'success'
                    });
                } else if (lastOrNext === '1') {
                    this.$message({
                        message: this.$t('fixResults.messages.switchedNext'),
                        type: 'success'
                    });
                } else if (lastOrNext === '2') {
                    this.$message({
                        message: this.$t('fixResults.messages.refreshedCurrent'),
                        type: 'success'
                    });
                }
            } else {
                let message;
                switch (lastOrNext) {
                    case '0':
                        message = this.$t('fixResults.messages.noPrevious');
                        break;
                    case '1':
                        message = this.$t('fixResults.messages.noNext');
                        break;
                    case '2':
                        message = this.$t('fixResults.messages.currentUnavailable');
                        break;
                    default:
                        message = this.$t('fixResults.messages.operationFailed');
                }
                this.$message({
                    message: message,
                    type: 'warning'
                });
            }
            this.loading = false;
        },
        handleManualConfirm() {
            // 人工确认点击事件
            confirmIds([this.row?.id]).then(res => {
                if (res.code === 200) {
                    this.$message({
                        message: this.$t('fixResults.messages.manualConfirmSuccess'),
                        type: 'success'
                    });
                    // 刷新当前数据
                    this.handleNext('2');
                } else {
                    this.$message({
                        message: res.msg || this.$t('fixResults.messages.manualConfirmFailed'),
                        type: 'error'
                    });
                }
            }).catch(error => {
                this.$message({
                    message: this.$t('fixResults.messages.manualConfirmRequestFailed'),
                    type: 'error'
                });
            });

        },
        handleReturn() {
            const paramsToSave = this.originalQueryParams || this.$route.query.queryParams || {};
            sessionStorage.setItem('viewResults_queryParams', JSON.stringify(paramsToSave));
            sessionStorage.setItem('prevPage', 'fixResults');
            this.$router.push({
                path: '/classificationTask/viewResults',
                query: {
                    drawerData: this.$route.query.drawerData,
                    queryParams: paramsToSave
                }
            });
        },
        handleModifyResult() {
            // 修改结果点击事件 - 将当前行数据复制到表单
            this.resultForm = {
                categoryId: this.row.categoryId || '',
                securityLevel: this.row.securityLevel || '',
                id: this.row.id || '',
                piiDetection: this.row.piiDetection || '',
                classificationLogic: ''
            };
            // 如果有分类信息，设置显示名称
            if (this.row.categoryName) {
                this.resultFormNodeName = this.row.categoryName;
            }
            // 如果有个人信息识别信息，设置显示名称
            if (this.row.piiDetection) {
                this.piiNodeName = this.row.piiDetectionName;
            }
            this.dialogVisible = true;
        }
    }
};
</script>

<style scoped>
.container {
    padding: 40px;
}

/* 顶部标题和按钮区域样式 */
.top-section {
    margin-bottom: 20px;
    border-radius: 10px;
    border: 1px solid #ebeef5;
}

.top-section /deep/ .el-card__header,
.top-section /deep/ .el-card__body {
    padding: 20px;
}

.top-section /deep/ .el-card__body {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.top-section h2 {
    margin: 0;
}

/* 内容区域左右分栏 */
.content-section {
    display: flex;
    justify-content: space-between;
}

.left-section {
    width: 65%;
}

.right-section {
    width: 32%;
}

.top-buttons {
    display: flex;
    gap: 10px;
}

.audit-status {
    display: flex;
    align-items: center;
}

.audit-status .el-badge {
    margin-left: 5px;
}

.el-progress {
    line-height: 2.3;
}

/* 信息项样式 */
.info-item {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    align-items: center;
    margin: 5px 0;
}

.info-label {
    width: 120px;
    font-weight: 500;
    text-align: left;
}

.info-content {
    flex: 1;
}

.info-label,
.info-content {
    font-size: 12px;
    line-height: 24px;
    color: #909399;
}

.addMsg /deep/.el-dialog {
    border-radius: 10px;
}

.addMsg /deep/.el-dialog__header {
    border-bottom: 1px solid #e6e6e6;
}

.addMsg /deep/.el-dialog__title {
    font-weight: bold;
}

.addMsg /deep/.el-form-item__content {
    padding-right: 15px;
}

.addMsg /deep/.el-select--medium,
.addMsg /deep/.el-select--small {
    width: 100%;
}

.addMsg /deep/.el-dialog__body {
    padding: 30px;
}

.addMsg /deep/ .el-dialog:not(.is-fullscreen) {
    margin-top: 10% !important;
}

.addMsg /deep/ .el-dialog__body {
    padding-bottom: 0;

}

.addMsg /deep/ .el-dialog__footer {
    padding-bottom: 32px;

}

.addMsg /deep/ .el-form-item__label {
    text-align: left;
}

.addMsg /deep/ .el-select--medium {
    width: 100%;
}

.box-card {
    border-radius: 10px;
    border: 1px solid #e2e8f0;

    ::v-deep .el-card__body {
        padding: 20px;
    }

    ::v-deep .el-card__header {
        background-color: #fafafa;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}

.header-name {
    font-weight: bold;
    font-size: 14px;
}

.header-confidence {
    font-size: 12px;
    color: #909399;
    float: inline-end;
}

.full-width-btn {
    width: 100%;
    border: none;
    font-weight: 500;
    border-radius: 5px;
}
</style>
