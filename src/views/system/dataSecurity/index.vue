<template>
    <div class="app-container data-security-page">
        <div class="page-header">
            <div class="page-header__main">
                <div class="page-header__heading">
                    <div class="page-header__title">第三级系统数据安全基本要求</div>
                    <div class="page-header__subtitle">基于 GA/T 2380-2026《网络安全等级保护数据安全基本要求》第六章</div>
                </div>
                <div class="page-header__operations">
                    <label class="form-label">所属标准</label>
                    <el-select v-model="selectedStandard" class="standard-select" filterable size="small"
                        placeholder="请选择所属标准" @change="handleStandardChange">
                        <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName"
                            :value="String(item.id)" />
                    </el-select>
                </div>
            </div>
        </div>

        <el-row :gutter="20" class="page-layout">
            <el-col :span="5" :xs="24" class="page-layout__left">
                <el-card shadow="never" class="left-panel-card" v-loading="systemListLoading">
                    <div class="system-list">
                        <div v-for="item in systemList" :key="item.id"
                            :class="['system-card', { 'is-active': item.id === activeSystemId }]"
                            @click="handleSystemSelect(item)">
                            <div class="system-card__title">
                                <div class="system-card__title-main">
                                    <div class="system-card__icon">
                                        <i :class="item.icon"></i>
                                    </div>
                                    <span>{{ item.name }}</span>
                                </div>
                            </div>
                            <div class="system-card__desc">{{ item.description }}</div>
                            <div class="system-card__meta">
                                <span>{{ item.ip }}</span>
                                <span class="system-card__dot"></span>
                                <span>{{ item.databaseType }}</span>
                            </div>
                            <div class="system-card__tags">
                                <el-tag v-for="tag in item.tags" :key="tag.text" size="mini" effect="plain"
                                    :class="['system-card__tag', `system-card__tag--${tag.theme}`]">
                                    {{ tag.text }}
                                </el-tag>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="19" :xs="24" class="page-layout__right">
                <el-card shadow="never" class="summary-card">
                    <div class="summary-stat-list">
                        <div v-for="stat in activeSystemSummaryStats" :key="stat.label" class="summary-stat-item">
                            <div class="summary-stat-item__label">{{ stat.label }}</div>
                            <div :class="['summary-stat-item__value', `summary-stat-item__value--${stat.theme}`]">{{
                                stat.value }}</div>
                        </div>
                    </div>
                </el-card>

                <el-card shadow="never" class="detail-card">
                    <div slot="header" class="detail-card__header">
                        <div class="detail-card__title">合规条目详情</div>
                        <div class="detail-card__toolbar">
                            <div class="detail-card__progress-text">{{ detailProgress.completed }} / {{
                                detailProgress.total }}</div>
                            <el-progress :percentage="progressPercent" :show-text="false" :stroke-width="8"
                                color="#3b82f6" class="detail-card__progress" />
                            <el-button size="mini" plain icon="el-icon-download" disabled>暂不提供下载</el-button>
                        </div>
                    </div>

                    <div class="detail-card__body" v-loading="tabsLoading">
                        <el-tabs v-model="activeTab" class="security-tabs" @tab-click="handleTabChange">
                            <el-tab-pane v-for="tab in securityTabs" :key="tab.id" :label="tab.label"
                                :name="tab.id"></el-tab-pane>
                        </el-tabs>

                        <div class="security-content">
                            <div class="security-tree-panel" v-loading="treeLoading">
                                <el-tree ref="clauseTree" :data="currentTreeData" node-key="id" highlight-current
                                    :expand-on-click-node="false" :current-node-key="activeTreeNodeId" empty-text="暂无数据"
                                    @node-click="handleTreeNodeClick">
                                    <span slot-scope="{ node, data }" class="security-tree-node">
                                        <span class="security-tree-node__left">
                                            <span class="security-tree-node__code">{{ data.code }}</span>
                                            <span class="security-tree-node__label">{{ data.label }}</span>
                                        </span>
                                        <span class="security-tree-node__right">
                                            <template v-if="node.level > 1">
                                                <el-tag size="mini" type="success" class="tree-stat-tag">{{
                                                    data.stats.ok }}</el-tag>
                                                <el-tag size="mini" type="warning" class="tree-stat-tag">{{
                                                    data.stats.partial }}</el-tag>
                                                <el-tag size="mini" type="danger" class="tree-stat-tag">{{
                                                    data.stats.risk }}</el-tag>
                                                <el-tag size="mini" type="info" class="tree-stat-tag">{{
                                                    data.stats.na }}</el-tag>
                                            </template>
                                            <span class="tree-total">{{ getNodeTotal(data) }}项</span>
                                        </span>
                                    </span>
                                </el-tree>
                            </div>

                            <div class="security-detail-panel" v-loading="detailLoading">
                                <template v-if="hasNodeDetail">
                                    <div class="security-detail-panel__header">
                                        <div class="security-detail-panel__title">{{ currentNodeDetail.title }}</div>
                                        <div class="security-detail-panel__desc">{{ currentNodeDetail.description }}
                                        </div>
                                    </div>

                                    <el-collapse v-model="activeCollapseNames" class="security-collapse">
                                        <el-collapse-item v-for="item in currentNodeDetail.items" :key="item.id"
                                            :name="item.id">
                                            <template slot="title">
                                                <div class="collapse-title">
                                                    <div class="collapse-title__main">
                                                        <span class="collapse-title__badge">{{ item.sort }}</span>
                                                        <span class="collapse-title__text">{{ item.title }}</span>
                                                    </div>
                                                    <div v-if="getClauseResultOption(item.id)"
                                                        class="collapse-title__meta">
                                                        <span
                                                            :class="['collapse-result-pill', `collapse-result-pill--${getClauseResultOption(item.id).type}`]">
                                                            <i :class="getClauseResultOption(item.id).icon"></i>
                                                            <span>{{ getClauseResultOption(item.id).label }}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </template>
                                            <div class="collapse-content" v-loading="getClauseState(item.id).loading">
                                                <div class="clause-form">
                                                    <div class="clause-form__section">
                                                        <div class="clause-form__label">
                                                            <i class="el-icon-s-operation"></i>
                                                            <span>合规说明 / 整改记录</span>
                                                        </div>
                                                        <el-input v-model="getClauseState(item.id).note" type="textarea"
                                                            :rows="3" resize="none"
                                                            placeholder="请输入该小项的合规情况说明、整改措施或其他备注..." />
                                                    </div>

                                                    <div class="clause-form__section">
                                                        <div class="clause-form__label">
                                                            <i class="el-icon-picture-outline"></i>
                                                            <span>图片证据 / 截图</span>
                                                        </div>
                                                        <div class="clause-form__upload-box">
                                                            <i class="el-icon-plus"></i>
                                                            <span>添加图片</span>
                                                        </div>
                                                    </div>

                                                    <div class="clause-form__section">
                                                        <div class="clause-form__label">
                                                            <i class="el-icon-document"></i>
                                                            <span>文件附件</span>
                                                        </div>
                                                        <el-button plain size="small" class="clause-form__attach-btn">
                                                            <i class="el-icon-plus"></i>
                                                            <span>添加附件</span>
                                                        </el-button>
                                                    </div>

                                                    <div class="clause-form__section clause-form__section--custom-upload">
                                                        <div class="clause-form__label">
                                                            <i class="el-icon-picture-outline"></i>
                                                            <span>图片证据 / 截图</span>
                                                            <span class="clause-form__label-hint">{{ imageUploadHint }}</span>
                                                        </div>
                                                        <div class="clause-image-list">
                                                            <div v-for="image in getClauseState(item.id).imageList"
                                                                :key="image.uid" class="clause-image-card"
                                                                @click="handleImagePreview(image)">
                                                                <img :src="image.url" :alt="image.name"
                                                                    class="clause-image-card__img">
                                                                <button type="button" class="clause-image-card__remove"
                                                                    @click.stop="removeClauseImage(item.id, image.uid)">
                                                                    <i class="el-icon-close"></i>
                                                                </button>
                                                            </div>
                                                            <el-upload v-if="!isClauseUploadLimitReached(item.id, 'image')" :ref="`imageUpload-${item.id}`"
                                                                class="clause-upload" action="#"
                                                                :auto-upload="false" :show-file-list="false" multiple
                                                                :limit="uploadLimits.imageCount"
                                                                accept="image/*"
                                                                :on-exceed="() => handleClauseUploadExceed('image')"
                                                                :on-change="(file, fileList) => handleImageUploadChange(file, fileList, item.id)">
                                                                <div class="clause-form__upload-box">
                                                                    <i class="el-icon-plus"></i>
                                                                    <span>添加图片</span>
                                                                </div>
                                                            </el-upload>
                                                        </div>
                                                    </div>

                                                    <div class="clause-form__section clause-form__section--custom-upload">
                                                        <div class="clause-form__label">
                                                            <i class="el-icon-document"></i>
                                                            <span>文件附件</span>
                                                            <span class="clause-form__label-hint">{{ fileUploadHint }}</span>
                                                        </div>
                                                        <div class="clause-file-list"
                                                            v-if="getClauseState(item.id).fileList.length">
                                                            <div v-for="file in getClauseState(item.id).fileList"
                                                                :key="file.uid" class="clause-file-item">
                                                                <div class="clause-file-item__main">
                                                                    <div class="clause-file-item__badge">FILE</div>
                                                                    <div class="clause-file-item__meta">
                                                                        <div class="clause-file-item__name">{{ file.name }}</div>
                                                                        <div class="clause-file-item__size">{{ formatFileSize(file.size) }}</div>
                                                                    </div>
                                                                </div>
                                                                <button type="button" class="clause-file-item__remove"
                                                                    @click="removeClauseFile(item.id, file.uid)">
                                                                    <i class="el-icon-close"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <el-upload v-if="!isClauseUploadLimitReached(item.id, 'file')" :ref="`fileUpload-${item.id}`" class="clause-upload"
                                                            action="#"
                                                            :auto-upload="false" :show-file-list="false" multiple
                                                            :limit="uploadLimits.fileCount"
                                                            :on-exceed="() => handleClauseUploadExceed('file')"
                                                            :on-change="(file, fileList) => handleFileUploadChange(file, fileList, item.id)">
                                                            <el-button plain size="small" class="clause-form__attach-btn">
                                                                <i class="el-icon-plus"></i>
                                                                <span>添加附件</span>
                                                            </el-button>
                                                        </el-upload>
                                                    </div>

                                                    <div class="clause-form__section clause-form__section--last">
                                                        <div class="clause-form__label">
                                                            <i class="el-icon-star-off"></i>
                                                            <span>结果判定</span>
                                                        </div>
                                                        <div class="result-button-group">
                                                            <button v-for="option in resultOptions" :key="option.value"
                                                                type="button"
                                                                :class="['result-button', `result-button--${option.type}`, { 'is-active': getClauseState(item.id).result === option.value }]"
                                                                @click="setClauseResult(item.id, option.value)">
                                                                <i :class="option.icon"></i>
                                                                <span>{{ option.label }}</span>
                                                            </button>
                                                        </div>
                                                        <div class="clause-form__submit">
                                                            <el-button type="primary" size="small" plain
                                                                :loading="getClauseState(item.id).submitting"
                                                                @click="submitClauseItem(item)">
                                                                保存
                                                            </el-button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </el-collapse-item>
                                    </el-collapse>
                                </template>
                                <el-empty v-else description="请选择左侧内容"></el-empty>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-dialog :visible.sync="imagePreviewVisible" append-to-body width="720px"
            custom-class="clause-image-preview-dialog">
            <img v-if="imagePreviewUrl" :src="imagePreviewUrl" alt="preview" class="clause-image-preview">
        </el-dialog>
    </div>
</template>

<script>
import { getFrameworks } from '@/api/system/protectCategory'

const createClauseDetail = (prefix, title, description, items) => ({
    title,
    description,
    items: items.map((item, index) => ({
        id: `${prefix}-${index + 1}`,
        sort: String.fromCharCode(65 + index),
        title: item.title,
        content: item.content
    }))
})

const createTreeStats = (ok, partial, risk, na) => ({ ok, partial, risk, na })

const createComplianceTabs = () => ({
    general: {
        tree: [
            {
                id: 'general-6.5',
                code: '6.5',
                label: '安全计算环境',
                stats: createTreeStats(2, 1, 0, 0),
                total: 14,
                children: [
                    {
                        id: 'general-6.5.1',
                        code: '6.5.1',
                        label: '身份鉴别',
                        stats: createTreeStats(1, 1, 0, 0),
                        total: 4,
                        detail: createClauseDetail(
                            'g-651',
                            '6.5.1 身份鉴别',
                            '针对一般数据处理系统，应围绕用户身份鉴别、账号生命周期与访问主体识别建立控制措施。',
                            [
                                {
                                    title: '应建立身份标识的唯一性规则',
                                    content: '对访问数据系统的账号进行唯一标识，确保账号、角色与岗位职责相匹配，并保留识别依据。'
                                },
                                {
                                    title: '应强化关键用户的鉴别强度',
                                    content: '对运维、审计、管理员等高权限账号采用多因素认证或等效增强身份鉴别措施。'
                                },
                                {
                                    title: '应规范账号的开通、停用与注销',
                                    content: '建立覆盖申请、审批、启用、停用和注销的账号流程，避免共享账号和长期闲置账号。'
                                }
                            ]
                        )
                    },
                    {
                        id: 'general-6.5.2',
                        code: '6.5.2',
                        label: '访问控制',
                        stats: createTreeStats(1, 0, 0, 0),
                        total: 7,
                        detail: createClauseDetail(
                            'g-652',
                            '6.5.2 访问控制',
                            '对于一般数据处理系统，访问控制要求应包括授权、最小权限、接口访问限制以及统一权限管理。',
                            [
                                {
                                    title: '应在通信前对参与数据流动的内外部接口进行授权',
                                    content: '建立接口调用前的访问授权流程，对接口身份、访问范围、请求频率和用途进行约束。'
                                },
                                {
                                    title: '应对数据源和数据存储系统的访问进行权限边界控制',
                                    content: '围绕导入导出、数据备份、数据发布及共享等环节设置差异化访问权限。'
                                },
                                {
                                    title: '应对数据访问接口与数据服务调用行为进行控制',
                                    content: '对查询、下载、写入、修改和删除等关键操作配置权限策略与审计留痕。'
                                },
                                {
                                    title: '应基于数据分类分级实施主体到客体的访问控制策略',
                                    content: '访问控制粒度应达到主体为用户或进程级，客体为接口、应用功能、文件和数据库表级。'
                                },
                                {
                                    title: '应定期对数据处理流程中的各类账号进行识别与梳理',
                                    content: '对僵尸账号、共享账号、过期账号和异常权限账号进行排查和整改。'
                                },
                                {
                                    title: '应对数据处理活动使用的数据收集、共享、发布、销毁工具的访问进行权限控制',
                                    content: '确保仅授权人员可以使用处理工具，并能追溯关键操作来源。'
                                },
                                {
                                    title: '应通过统一的权限管理平台对各类数据系统的访问权限进行管理',
                                    content: '统一维护角色、权限与资源映射关系，减少多系统重复授权与权限漂移风险。'
                                }
                            ]
                        )
                    },
                    {
                        id: 'general-6.5.3',
                        code: '6.5.3',
                        label: '安全审计',
                        stats: createTreeStats(0, 0, 0, 1),
                        total: 3,
                        detail: createClauseDetail(
                            'g-653',
                            '6.5.3 安全审计',
                            '针对数据处理活动，应记录关键访问行为、权限变更、接口调用与异常操作，支持追踪与责任认定。',
                            [
                                {
                                    title: '应记录关键数据访问与操作日志',
                                    content: '至少覆盖登录、查询、导出、修改、删除及权限变更等关键行为。'
                                },
                                {
                                    title: '应设置审计日志保护措施',
                                    content: '确保日志防篡改、可追溯，并设置适当的保留周期和访问控制。'
                                },
                                {
                                    title: '应支持异常行为识别和告警联动',
                                    content: '对高频下载、越权访问和异常时间段操作等行为进行识别和告警。'
                                }
                            ]
                        )
                    }
                ]
            },
            {
                id: 'general-6.6',
                code: '6.6',
                label: '数据源',
                stats: createTreeStats(1, 0, 0, 0),
                total: 3,
                children: [
                    {
                        id: 'general-6.6.1',
                        code: '6.6.1',
                        label: '采集管理',
                        stats: createTreeStats(1, 0, 0, 0),
                        total: 3,
                        detail: createClauseDetail(
                            'g-661',
                            '6.6.1 采集管理',
                            '一般数据采集应遵循合法、正当、必要原则，并对采集范围、用途和来源进行记录。',
                            [
                                {
                                    title: '应明确采集范围与用途',
                                    content: '对采集的数据项、采集来源和业务用途进行事前梳理与审批。'
                                },
                                {
                                    title: '应建立数据采集留痕机制',
                                    content: '保留采集时间、采集人、采集工具及目标数据集等记录，支持后续核验。'
                                }
                            ]
                        )
                    }
                ]
            }
        ]
    },
    important: {
        tree: [
            {
                id: 'important-7.2',
                code: '7.2',
                label: '重要数据识别',
                stats: createTreeStats(1, 0, 0, 0),
                total: 2,
                children: [
                    {
                        id: 'important-7.2.1',
                        code: '7.2.1',
                        label: '识别与认定',
                        stats: createTreeStats(1, 0, 0, 0),
                        total: 2,
                        detail: createClauseDetail(
                            'i-721',
                            '7.2.1 识别与认定',
                            '重要数据应结合行业要求、业务关键性、影响范围及敏感程度进行识别和认定。',
                            [
                                {
                                    title: '应建立重要数据识别标准',
                                    content: '依据业务连续性、社会影响、行业监管要求和敏感程度形成识别标准。'
                                },
                                {
                                    title: '应形成认定台账',
                                    content: '对重要数据目录、责任部门、责任人和处置要求建立完整台账并定期复核。'
                                }
                            ]
                        )
                    }
                ]
            },
            {
                id: 'important-7.3',
                code: '7.3',
                label: '重要数据全生命周期保护',
                stats: createTreeStats(0, 1, 0, 0),
                total: 3,
                children: [
                    {
                        id: 'important-7.3.2',
                        code: '7.3.2',
                        label: '共享与开放',
                        stats: createTreeStats(0, 1, 0, 0),
                        total: 3,
                        detail: createClauseDetail(
                            'i-732',
                            '7.3.2 共享与开放',
                            '重要数据在共享、交换和开放过程中，应建立审批、脱敏、审计和回收控制措施。',
                            [
                                {
                                    title: '应建立共享开放审批流程',
                                    content: '共享前对接收方资质、共享范围、使用场景和保存期限进行审批。'
                                },
                                {
                                    title: '应落实脱敏与最小化原则',
                                    content: '在满足业务需求前提下，优先采用脱敏、去标识化和最小必要共享策略。'
                                },
                                {
                                    title: '应留存共享操作日志与回收记录',
                                    content: '对共享对象、内容、时间及回收处置情况形成闭环记录。'
                                }
                            ]
                        )
                    }
                ]
            }
        ]
    }
})

const createSystemList = () => ([
    {
        id: 'sys-1',
        name: '核心交易数据库',
        icon: 'el-icon-cpu',
        description: '承载支付、结算与账务处理的核心生产数据。',
        ip: '10.20.2.36',
        databaseType: 'PostgreSQL 15',
        tags: [
            { text: '一般数据', theme: 'blue' },
            { text: '重要数据', theme: 'purple' }
        ],
        summaryStats: [
            { label: '一般数据合规条目', value: 3, theme: 'primary' },
            { label: '重要数据合规条目', value: 1, theme: 'purple' },
            { label: '符合', value: 1, theme: 'success' },
            { label: '部分符合', value: 0, theme: 'warning' },
            { label: '不符合', value: 0, theme: 'danger' },
            { label: '不适用', value: 0, theme: 'muted' }
        ],
        complianceTabs: createComplianceTabs()
    },
    {
        id: 'sys-2',
        name: '用户管理系统',
        icon: 'el-icon-user-solid',
        description: '支撑账户生命周期、权限分配和身份校验。',
        ip: '10.20.2.31',
        databaseType: 'MySQL 8.0',
        tags: [
            { text: '一般数据', theme: 'blue' },
            { text: '重要数据', theme: 'purple' }
        ],
        summaryStats: [
            { label: '一般数据合规条目', value: 4, theme: 'primary' },
            { label: '重要数据合规条目', value: 0, theme: 'purple' },
            { label: '符合', value: 2, theme: 'success' },
            { label: '部分符合', value: 1, theme: 'warning' },
            { label: '不符合', value: 0, theme: 'danger' },
            { label: '不适用', value: 1, theme: 'muted' }
        ],
        complianceTabs: createComplianceTabs()
    },
    {
        id: 'sys-3',
        name: '日志分析平台',
        icon: 'el-icon-s-data',
        description: '聚合审计日志、应用日志和安全事件日志。',
        ip: '10.20.2.32',
        databaseType: 'Elasticsearch 8.x',
        tags: [
            { text: '一般数据', theme: 'blue' },
            { text: '重要数据', theme: 'purple' }
        ],
        summaryStats: [
            { label: '一般数据合规条目', value: 2, theme: 'primary' },
            { label: '重要数据合规条目', value: 2, theme: 'purple' },
            { label: '符合', value: 1, theme: 'success' },
            { label: '部分符合', value: 1, theme: 'warning' },
            { label: '不符合', value: 0, theme: 'danger' },
            { label: '不适用', value: 0, theme: 'muted' }
        ],
        complianceTabs: createComplianceTabs()
    },
    {
        id: 'sys-4',
        name: '数据备份系统',
        icon: 'el-icon-copy-document',
        description: '负责生产数据的备份归档与恢复演练。',
        ip: '10.20.2.33',
        databaseType: 'MinIO',
        tags: [
            { text: '一般数据', theme: 'blue' },
            { text: '重要数据', theme: 'purple' }
        ],
        summaryStats: [
            { label: '一般数据合规条目', value: 2, theme: 'primary' },
            { label: '重要数据合规条目', value: 1, theme: 'purple' },
            { label: '符合', value: 1, theme: 'success' },
            { label: '部分符合', value: 0, theme: 'warning' },
            { label: '不符合', value: 1, theme: 'danger' },
            { label: '不适用', value: 0, theme: 'muted' }
        ],
        complianceTabs: createComplianceTabs()
    },
    {
        id: 'sys-5',
        name: 'API 网关系统',
        icon: 'el-icon-s-promotion',
        description: '统一承载服务编排、接口鉴权与访问路由能力。',
        ip: '10.20.2.34',
        databaseType: 'Kong 3.x',
        tags: [
            { text: '一般数据', theme: 'blue' },
            { text: '重要数据', theme: 'purple' }
        ],
        summaryStats: [
            { label: '一般数据合规条目', value: 3, theme: 'primary' },
            { label: '重要数据合规条目', value: 0, theme: 'purple' },
            { label: '符合', value: 2, theme: 'success' },
            { label: '部分符合', value: 0, theme: 'warning' },
            { label: '不符合', value: 0, theme: 'danger' },
            { label: '不适用', value: 1, theme: 'muted' }
        ],
        complianceTabs: createComplianceTabs()
    }
])

const MOCK_TAB_LABELS = {
    general: '一般数据合规要求',
    important: '重要数据合规要求'
}

const MOCK_RESULT_VALUES = ['success', 'warning', 'danger', 'info']
const MOCK_IMAGE_SIZE = 14131
const MOCK_FILE_SIZE = 14131

const createMockImageDataUrl = (label = '证据') => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="14" fill="#f4f7ff"/>
  <rect x="12" y="12" width="96" height="96" rx="10" fill="#ffffff" stroke="#d9e3f5"/>
  <path d="M28 80l18-18 12 12 20-24 14 18v16H28z" fill="#bcd1ff"/>
  <circle cx="45" cy="42" r="8" fill="#7ea6ff"/>
  <text x="60" y="98" text-anchor="middle" font-size="12" fill="#6b7a90">${label}</text>
</svg>
`)}`

const createMockImageItem = (suffix = '1') => ({
    uid: `mock-image-${suffix}`,
    name: `123-${suffix}.png`,
    size: MOCK_IMAGE_SIZE,
    url: createMockImageDataUrl(`证据${suffix}`)
})

const createMockFileItem = (suffix = '1') => ({
    uid: `mock-file-${suffix}`,
    name: suffix === '1' ? '123.png' : `附件-${suffix}.pdf`,
    size: MOCK_FILE_SIZE
})
const MOCK_STANDARD_OPTIONS = [
    { id: 'mock-standard-1', categoryName: '默认所属标准' }
]

const cloneMockData = (data) => JSON.parse(JSON.stringify(data))

const mockRequest = (data, delay = 180) => new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            code: 200,
            data: cloneMockData(data)
        })
    }, delay)
})

const findMockNodeById = (list = [], id) => {
    for (let i = 0; i < list.length; i += 1) {
        const item = list[i]
        if (String(item.id) === String(id)) {
            return item
        }
        if (Array.isArray(item.children) && item.children.length) {
            const target = findMockNodeById(item.children, id)
            if (target) {
                return target
            }
        }
    }
    return null
}

const toMockTreeNode = (node = {}) => ({
    id: node.id,
    code: node.code,
    label: node.label,
    total: node.total,
    stats: node.stats || createTreeStats(0, 0, 0, 0),
    hasChildren: Array.isArray(node.children) && node.children.length > 0,
    children: [],
    clickAction: Array.isArray(node.children) && node.children.length > 0 ? 'children' : 'detail'
})

const getMockProgress = (system = {}) => {
    const stats = Array.isArray(system.summaryStats) ? system.summaryStats : []
    const findValueByTheme = (theme) => {
        const target = stats.find(item => item.theme === theme)
        return target ? Number(target.value || 0) : 0
    }
    const general = Number(system.generalClauseCount || findValueByTheme('primary') || 0)
    const important = Number(system.importantClauseCount || findValueByTheme('purple') || 0)
    const total = general + important
    const completed = Number(system.okCount || findValueByTheme('success') || 0)
    return {
        completedCount: completed,
        totalCount: total
    }
}

const buildMockDataBlocks = () => {
    const sourceSystems = createSystemList()
    const defaultStandardId = MOCK_STANDARD_OPTIONS[0] && MOCK_STANDARD_OPTIONS[0].id
    const systemListByStandard = {
        [defaultStandardId]: sourceSystems.map((system) => {
            const { complianceTabs, ...rest } = system
            return rest
        })
    }
    const securityOverviewBySystem = {}
    const treeSourceBySystemTab = {}
    const nodeDetailBySystemTabNode = {}
    const collectNodeMocks = (nodes = [], systemId, tabId) => {
        ; (Array.isArray(nodes) ? nodes : []).forEach((node) => {
            const detail = node.detail || {}
            const detailItems = Array.isArray(detail.items) ? detail.items : []
            if (detailItems.length || detail.title || detail.description) {
                nodeDetailBySystemTabNode[systemId][tabId][node.id] = {
                    title: detail.title || node.label || '',
                    description: detail.description || '',
                    items: detailItems.map((item, index) => ({
                        ...item,
                        result: item.result || MOCK_RESULT_VALUES[index % MOCK_RESULT_VALUES.length],
                        note: item.note || '',
                        imageList: [createMockImageItem(index + 1)],
                        fileList: [createMockFileItem(index + 1)]
                    }))
                }
            }
            if (Array.isArray(node.children) && node.children.length) {
                collectNodeMocks(node.children, systemId, tabId)
            }
        })
    }

    sourceSystems.forEach((system) => {
        const tabsConfig = system.complianceTabs || {}
        const tabIds = Object.keys(tabsConfig)
        securityOverviewBySystem[system.id] = {
            tabs: tabIds.map((tabId) => ({
                id: tabId,
                label: tabsConfig[tabId].label || MOCK_TAB_LABELS[tabId] || tabId
            })),
            progress: getMockProgress(system)
        }
        treeSourceBySystemTab[system.id] = {}
        nodeDetailBySystemTabNode[system.id] = {}
        tabIds.forEach((tabId) => {
            const tree = Array.isArray(tabsConfig[tabId].tree) ? tabsConfig[tabId].tree : []
            treeSourceBySystemTab[system.id][tabId] = tree
            nodeDetailBySystemTabNode[system.id][tabId] = {}
            collectNodeMocks(tree, system.id, tabId)
        })
    })

    return {
        systemListByStandard,
        securityOverviewBySystem,
        treeSourceBySystemTab,
        nodeDetailBySystemTabNode
    }
}

const {
    systemListByStandard: MOCK_SYSTEM_LIST_BY_STANDARD,
    securityOverviewBySystem: MOCK_SECURITY_OVERVIEW_BY_SYSTEM,
    treeSourceBySystemTab: MOCK_TREE_SOURCE_BY_SYSTEM_TAB,
    nodeDetailBySystemTabNode: MOCK_NODE_DETAIL_BY_SYSTEM_TAB_NODE
} = buildMockDataBlocks()

const createEmptyMockDetail = () => ({
    title: '',
    description: '',
    items: []
})

const mockFetchSystemList = (standardId = '') => {
    const fallbackStandardId = MOCK_STANDARD_OPTIONS[0] && MOCK_STANDARD_OPTIONS[0].id
    return mockRequest({
        list: (MOCK_SYSTEM_LIST_BY_STANDARD[standardId] || MOCK_SYSTEM_LIST_BY_STANDARD[fallbackStandardId] || [])
    })
}

const mockFetchSecurityTabs = (systemId = '') => {
    return mockRequest(
        MOCK_SECURITY_OVERVIEW_BY_SYSTEM[systemId] || {
            tabs: [],
            progress: {
                completedCount: 0,
                totalCount: 0
            }
        }
    )
}

const mockFetchTreeNodes = (systemId = '', tabId, parentId = '') => {
    const tree = (((MOCK_TREE_SOURCE_BY_SYSTEM_TAB[systemId] || {})[tabId]) || [])
    const sourceList = parentId
        ? ((findMockNodeById(tree, parentId) || {}).children || [])
        : tree
    return mockRequest({
        nodes: sourceList.map(toMockTreeNode)
    })
}

const mockFetchNodeDetail = (systemId = '', tabId, nodeId) => {
    const detail = ((((MOCK_NODE_DETAIL_BY_SYSTEM_TAB_NODE[systemId] || {})[tabId]) || {})[nodeId]) || createEmptyMockDetail()
    return mockRequest({
        detail
    })
}

const mockSubmitClauseForm = (payload = {}) => mockRequest({
    success: true,
    ...payload
}, 260)

export default {
    name: 'DataSecurity',
    data() {
        return {
            query: {},
            treeOptions: [],
            selectedStandard: '',
            systemList: [],
            activeSystem: {},
            activeSystemId: '',
            securityTabs: [],
            activeTab: '',
            treeNodes: [],
            activeTreeNodeId: '',
            activeCollapseNames: [],
            clauseFormState: {},
            detailProgress: {
                completed: 0,
                total: 0
            },
            currentNodeDetail: {
                title: '',
                description: '',
                items: []
            },
            activeDetailNode: null,
            detailSelected: false,
            systemListLoading: false,
            tabsLoading: false,
            treeLoading: false,
            detailLoading: false,
            imagePreviewVisible: false,
            imagePreviewUrl: '',
            uploadLimits: {
                imageCount: 5,
                imageSize: 5,
                fileCount: 5,
                fileSize: 10
            },
            resultOptions: [
                { label: '符合', value: 'success', type: 'success', icon: 'el-icon-check' },
                { label: '部分符合', value: 'warning', type: 'warning', icon: 'el-icon-time' },
                { label: '不符合', value: 'danger', type: 'danger', icon: 'el-icon-close' },
                { label: '不适用', value: 'info', type: 'info', icon: 'el-icon-minus' }
            ]
        }
    },
    created() {
        this.query = this.normalizeRouteRow(this.$route.query.row)
        this.selectedStandard = this.$route.query.categoryId
            ? String(this.$route.query.categoryId)
            : this.query.categoryId
                ? String(this.query.categoryId)
                : ''
    },
    computed: {
        currentSystem() {
            return this.activeSystem && this.activeSystem.id
                ? this.activeSystem
                : this.systemList.find(item => item.id === this.activeSystemId) || this.systemList[0] || {}
        },
        activeSystemSummaryStats() {
            return this.getSystemSummaryStats(this.currentSystem)
        },
        currentTreeData() {
            return this.treeNodes
        },
        hasNodeDetail() {
            return this.detailSelected && (
                !!this.currentNodeDetail.title ||
                !!this.currentNodeDetail.description ||
                (Array.isArray(this.currentNodeDetail.items) && this.currentNodeDetail.items.length > 0)
            )
        },
        progressPercent() {
            if (!this.detailProgress.total) return 0
            return Math.round((this.detailProgress.completed / this.detailProgress.total) * 100)
        },
        imageUploadHint() {
            const { imageCount, imageSize } = this.uploadLimits
            return `最多${imageCount}张，每张不超过${imageSize}MB`
        },
        fileUploadHint() {
            const { fileCount, fileSize } = this.uploadLimits
            return `最多${fileCount}个，每个不超过${fileSize}MB`
        }
    },
    async mounted() {
        await this.loadStandardOptions()
        await this.loadSystemList()
    },
    methods: {
        normalizeRouteRow(row) {
            if (!row) {
                return {}
            }
            if (typeof row === 'string') {
                try {
                    return JSON.parse(row)
                } catch (error) {
                    return {}
                }
            }
            return JSON.parse(JSON.stringify(row))
        },
        extractResponseData(response) {
            return response && Object.prototype.hasOwnProperty.call(response, 'data') ? response.data : response
        },
        extractList(source, preferredKeys = []) {
            if (Array.isArray(source)) {
                return source
            }
            if (!source || typeof source !== 'object') {
                return []
            }
            const keys = [...preferredKeys, 'list', 'rows', 'records', 'items', 'tabs', 'tree', 'nodes']
            for (let i = 0; i < keys.length; i += 1) {
                const value = source[keys[i]]
                if (Array.isArray(value)) {
                    return value
                }
            }
            return []
        },
        toNumber(value) {
            const num = Number(value)
            return Number.isFinite(num) ? num : 0
        },
        toBoolean(value) {
            if (typeof value === 'boolean') return value
            if (typeof value === 'number') return value === 1
            if (typeof value === 'string') {
                return ['1', 'true', 'yes', 'y'].includes(value.toLowerCase())
            }
            return false
        },
        formatFileSize(size) {
            const fileSize = this.toNumber(size)
            if (!fileSize) return '0 B'
            if (fileSize < 1024) return `${fileSize} B`
            if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(1)} KB`
            return `${(fileSize / 1024 / 1024).toFixed(1)} MB`
        },
        buildUploadUid(prefix = 'upload') {
            return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
        },
        normalizeUploadImage(item = {}) {
            return {
                uid: item.uid || this.buildUploadUid('image'),
                name: item.name || 'image.png',
                size: this.toNumber(item.size),
                url: item.url || (item.response && item.response.url) || ''
            }
        },
        normalizeUploadFile(item = {}) {
            return {
                uid: item.uid || this.buildUploadUid('file'),
                name: item.name || 'file',
                size: this.toNumber(item.size),
                url: item.url || ''
            }
        },
        clearUploadRef(refName) {
            const target = this.$refs[refName]
            if (!target) return
            if (Array.isArray(target)) {
                target.forEach(item => item && item.clearFiles && item.clearFiles())
                return
            }
            if (target.clearFiles) {
                target.clearFiles()
            }
        },
        isImageFile(file = {}) {
            const fileType = String(file.type || '').toLowerCase()
            const fileName = String(file.name || '').toLowerCase()
            return fileType.startsWith('image/') || /\.(png|jpe?g|gif|bmp|webp|svg)$/.test(fileName)
        },
        isFileSizeAllowed(file = {}, limitMb = 0) {
            if (!limitMb) return true
            return this.toNumber(file.size) / 1024 / 1024 <= limitMb
        },
        handleClauseUploadExceed(type) {
            if (type === 'image') {
                this.$message.warning(`图片最多上传 ${this.uploadLimits.imageCount} 张`)
                return
            }
            this.$message.warning(`附件最多上传 ${this.uploadLimits.fileCount} 个`)
        },
        isClauseUploadLimitReached(itemId, type) {
            const state = this.getClauseState(itemId)
            const currentList = type === 'image' ? state.imageList : state.fileList
            const limit = type === 'image' ? this.uploadLimits.imageCount : this.uploadLimits.fileCount
            return currentList.length >= limit
        },
        async loadStandardOptions() {
            try {
                const response = await getFrameworks()
                const list = Array.isArray(response.data) ? response.data : []
                this.treeOptions = list.length ? list : cloneMockData(MOCK_STANDARD_OPTIONS)
                const hasSelectedStandard = this.treeOptions.some(item => String(item.id) === this.selectedStandard)
                if (!hasSelectedStandard) {
                    this.selectedStandard = this.treeOptions.length ? String(this.treeOptions[0].id) : ''
                }
            } catch (error) {
                this.treeOptions = cloneMockData(MOCK_STANDARD_OPTIONS)
                this.selectedStandard = this.treeOptions.length ? String(this.treeOptions[0].id) : ''
                console.error('Failed to load standard options:', error)
            }
        },
        async loadSystemList() {
            this.systemListLoading = true
            this.systemList = []
            this.activeSystem = {}
            this.activeSystemId = ''
            this.securityTabs = []
            this.activeTab = ''
            this.treeNodes = []
            this.detailProgress = {
                completed: 0,
                total: 0
            }
            this.clearDetailPanel()
            if (!this.selectedStandard) {
                this.systemListLoading = false
                return
            }
            try {
                const response = await mockFetchSystemList(this.selectedStandard)
                const payload = this.extractResponseData(response) || {}
                const list = this.extractList(payload, ['systems', 'list']).map(item => ({
                    ...item,
                    id: item.id || item.systemId || '',
                    name: item.name || item.systemName || '--'
                }))
                this.systemList = list
                const nextSystem = list[0] || {}
                this.activeSystem = nextSystem
                this.activeSystemId = nextSystem.id || ''
                if (this.activeSystemId) {
                    await this.reloadComplianceView()
                }
            } catch (error) {
                this.systemList = []
                this.activeSystem = {}
                this.activeSystemId = ''
                console.error('Failed to load system list:', error)
            } finally {
                this.systemListLoading = false
            }
        },
        async handleStandardChange() {
            await this.loadSystemList()
        },
        async handleSystemSelect(item) {
            this.activeSystem = item || {}
            this.activeSystemId = item && item.id ? item.id : ''
            await this.reloadComplianceView()
        },
        getSystemSummaryStats(system = {}) {
            if (Array.isArray(system.summaryStats) && system.summaryStats.length) {
                return system.summaryStats
            }

            return [
                { label: '一般数据合规条目', value: system.generalClauseCount || 0, theme: 'primary' },
                { label: '重要数据合规条目', value: system.importantClauseCount || 0, theme: 'purple' },
                { label: '符合', value: system.okCount || 0, theme: 'success' },
                { label: '部分符合', value: system.partialCount || 0, theme: 'warning' },
                { label: '不符合', value: system.riskCount || 0, theme: 'danger' },
                { label: '不适用', value: system.naCount || 0, theme: 'muted' }
            ]
        },
        createProgressFallback(system = this.currentSystem) {
            const progress = getMockProgress(system)
            return {
                completed: this.toNumber(progress.completedCount),
                total: this.toNumber(progress.totalCount)
            }
        },
        normalizeProgress(payload = {}) {
            const progress = payload.progress || payload.overallProgress || payload.summary || {}
            return {
                completed: this.toNumber(
                    progress.completedCount ??
                    progress.completed ??
                    payload.completedCount ??
                    payload.completed
                ),
                total: this.toNumber(
                    progress.totalCount ??
                    progress.total ??
                    payload.totalCount ??
                    payload.total
                )
            }
        },
        normalizeTabs(list = []) {
            return (Array.isArray(list) ? list : []).map((item, index) => ({
                ...item,
                id: String(item.id || item.tabId || item.code || index + 1),
                label: item.label || item.name || item.tabName || item.title || `标签${index + 1}`
            }))
        },
        normalizeStats(item = {}) {
            const stats = item.stats || item
            return {
                ok: this.toNumber(stats.ok ?? stats.successCount ?? stats.compliantCount),
                partial: this.toNumber(stats.partial ?? stats.warningCount ?? stats.partialCount),
                risk: this.toNumber(stats.risk ?? stats.dangerCount ?? stats.riskCount),
                na: this.toNumber(stats.na ?? stats.infoCount ?? stats.naCount)
            }
        },
        normalizeTreeNodes(list = []) {
            return (Array.isArray(list) ? list : []).map((item, index) => {
                const children = this.normalizeTreeNodes(item.children || [])
                return {
                    ...item,
                    id: String(item.id || item.nodeId || item.code || `node-${index + 1}`),
                    code: item.code || item.nodeCode || item.serialNo || '',
                    label: item.label || item.name || item.title || `节点${index + 1}`,
                    total: this.toNumber(item.total ?? item.totalCount ?? item.itemCount),
                    stats: this.normalizeStats(item),
                    hasChildren: item.hasChildren != null
                        ? this.toBoolean(item.hasChildren)
                        : this.toNumber(item.childCount) > 0,
                    children,
                    childrenLoaded: children.length > 0
                }
            })
        },
        normalizeDetailItems(list = []) {
            return (Array.isArray(list) ? list : []).map((item, index) => ({
                ...item,
                id: String(item.id || item.itemId || item.detailId || item.clauseId || `${this.activeTreeNodeId}-${index + 1}`),
                sort: item.sort || item.serialNo || String.fromCharCode(65 + index),
                title: item.title || item.name || item.label || `条目${index + 1}`,
                defaultResult: item.result || item.resultValue || item.status || '',
                note: item.note || item.remark || ''
            }))
        },
        normalizeNodeDetail(payload = {}, node = {}) {
            const detailSource = payload.detail || payload.nodeDetail || payload
            const itemList = this.extractList(detailSource, ['items', 'clauses'])
            return {
                title: detailSource.title || detailSource.label || node.label || '',
                description: detailSource.description || detailSource.remark || detailSource.content || '',
                items: this.normalizeDetailItems(itemList)
            }
        },
        createClauseState(item = {}) {
            return {
                loading: false,
                loaded: false,
                submitting: false,
                note: item.note || '',
                result: item.defaultResult || item.result || '',
                defaultResult: item.defaultResult || item.result || '',
                imageList: Array.isArray(item.imageList) ? item.imageList.map(image => this.normalizeUploadImage(image)) : [],
                fileList: Array.isArray(item.fileList) ? item.fileList.map(file => this.normalizeUploadFile(file)) : [],
                raw: {}
            }
        },
        clearDetailPanel() {
            this.activeTreeNodeId = ''
            this.activeCollapseNames = []
            this.activeDetailNode = null
            this.detailSelected = false
            this.currentNodeDetail = {
                title: '',
                description: '',
                items: []
            }
            this.clauseFormState = {}
        },
        async reloadComplianceView() {
            this.securityTabs = []
            this.activeTab = ''
            this.treeNodes = []
            this.detailProgress = this.createProgressFallback()
            this.clearDetailPanel()
            if (!this.activeSystemId) {
                return
            }
            await this.loadComplianceTabs()
        },
        async loadComplianceTabs() {
            this.tabsLoading = true
            try {
                const response = await mockFetchSecurityTabs(this.activeSystemId)
                const payload = this.extractResponseData(response) || {}
                this.securityTabs = this.normalizeTabs(this.extractList(payload, ['tabs']))
                const progress = this.normalizeProgress(payload)
                this.detailProgress = progress.total ? progress : this.createProgressFallback()
                this.activeTab = this.securityTabs.length ? this.securityTabs[0].id : ''
                if (this.activeTab) {
                    await this.loadTreeRoots()
                } else {
                    this.treeNodes = []
                }
            } catch (error) {
                this.securityTabs = []
                this.activeTab = ''
                this.treeNodes = []
                this.detailProgress = this.createProgressFallback()
                console.error('Failed to load compliance tabs:', error)
            } finally {
                this.tabsLoading = false
            }
        },
        async handleTabChange() {
            await this.loadTreeRoots()
        },
        async loadTreeRoots() {
            if (!this.activeTab) {
                this.treeNodes = []
                this.clearDetailPanel()
                return
            }
            this.treeLoading = true
            this.treeNodes = []
            this.clearDetailPanel()
            try {
                const response = await mockFetchTreeNodes(this.activeSystemId, this.activeTab, '')
                const payload = this.extractResponseData(response) || {}
                this.treeNodes = this.normalizeTreeNodes(this.extractList(payload, ['tree', 'nodes']))
            } catch (error) {
                this.treeNodes = []
                console.error('Failed to load root tree nodes:', error)
            } finally {
                this.treeLoading = false
            }
        },
        resolveNodeAction(node = {}) {
            return node.clickAction || node.requestType || node.actionType || node.nodeAction || ''
        },
        shouldRequestChildren(node = {}) {
            const action = String(this.resolveNodeAction(node)).toLowerCase()
            if (['children', 'child', 'loadchildren', 'next', 'sub', 'tree'].includes(action)) {
                return true
            }
            if (['detail', 'form', 'content', 'leaf'].includes(action)) {
                return false
            }
            if (node.hasChildren != null) {
                return this.toBoolean(node.hasChildren)
            }
            if (node.isLeaf != null) {
                return !this.toBoolean(node.isLeaf)
            }
            return this.toNumber(node.childCount) > 0
        },
        async handleTreeNodeClick(data, node) {
            this.activeTreeNodeId = data.id
            if (this.shouldRequestChildren(data)) {
                this.clearDetailPanel()
                this.activeTreeNodeId = data.id
                await this.loadTreeChildren(data, node)
                return
            }
            await this.loadNodeDetail(data)
        },
        async loadTreeChildren(data, node) {
            if (data.childrenLoaded) {
                node.expanded = !node.expanded
                return
            }
            this.treeLoading = true
            try {
                const response = await mockFetchTreeNodes(this.activeSystemId, this.activeTab, data.id)
                const payload = this.extractResponseData(response) || {}
                const children = this.normalizeTreeNodes(this.extractList(payload, ['tree', 'nodes']))
                this.$set(data, 'children', children)
                this.$set(data, 'childrenLoaded', true)
                this.$set(data, 'hasChildren', children.length > 0)
                this.$nextTick(() => {
                    node.expanded = true
                })
            } catch (error) {
                this.$set(data, 'children', [])
                this.$set(data, 'childrenLoaded', true)
                console.error('Failed to load child tree nodes:', error)
            } finally {
                this.treeLoading = false
            }
        },
        async loadNodeDetail(data) {
            this.detailLoading = true
            this.detailSelected = false
            this.activeDetailNode = data
            this.currentNodeDetail = {
                title: '',
                description: '',
                items: []
            }
            this.activeCollapseNames = []
            this.clauseFormState = {}
            try {
                const response = await mockFetchNodeDetail(this.activeSystemId, this.activeTab, data.id)
                const payload = this.extractResponseData(response) || {}
                this.currentNodeDetail = this.normalizeNodeDetail(payload, data)
                this.currentNodeDetail.items.forEach((item) => {
                    this.$set(this.clauseFormState, item.id, this.createClauseState(item))
                })
                this.detailSelected = true
            } catch (error) {
                this.detailSelected = false
                console.error('Failed to load node detail:', error)
            } finally {
                this.detailLoading = false
            }
        },
        getNodeTotal(node) {
            if (!node) return 0
            if (node.total != null) return node.total
            const stats = node.stats || {}
            return this.toNumber(stats.ok) + this.toNumber(stats.partial) + this.toNumber(stats.risk) + this.toNumber(stats.na)
        },
        getClauseState(itemId) {
            if (!this.clauseFormState[itemId]) {
                this.$set(this.clauseFormState, itemId, this.createClauseState())
            }
            return this.clauseFormState[itemId]
        },
        handleImagePreview(image) {
            this.imagePreviewUrl = image.url || ''
            this.imagePreviewVisible = !!this.imagePreviewUrl
        },
        handleImageUploadChange(file, fileList, itemId) {
            const state = this.getClauseState(itemId)
            const appendList = Array.isArray(fileList) && fileList.length ? fileList : [file]
            let exceedCountLimit = false
            appendList.forEach((currentFile) => {
                const rawFile = currentFile && currentFile.raw ? currentFile.raw : currentFile
                if (!rawFile || state.imageList.some(image => image.uid === currentFile.uid)) {
                    return
                }
                if (!this.isImageFile(rawFile)) {
                    this.$message.warning(`"${rawFile.name}" 不是图片文件，无法上传`)
                    return
                }
                if (!this.isFileSizeAllowed(rawFile, this.uploadLimits.imageSize)) {
                    this.$message.warning(`"${rawFile.name}" 超过 ${this.uploadLimits.imageSize}MB，无法上传`)
                    return
                }
                if (state.imageList.length >= this.uploadLimits.imageCount) {
                    exceedCountLimit = true
                    return
                }
                state.imageList.push(this.normalizeUploadImage({
                    uid: currentFile.uid,
                    name: rawFile.name,
                    size: rawFile.size,
                    url: URL.createObjectURL(rawFile)
                }))
            })
            if (exceedCountLimit) {
                this.handleClauseUploadExceed('image')
            }
            this.clearUploadRef(`imageUpload-${itemId}`)
        },
        removeClauseImage(itemId, imageUid) {
            const state = this.getClauseState(itemId)
            const removedImage = state.imageList.find(image => image.uid === imageUid)
            if (removedImage && String(removedImage.url || '').startsWith('blob:')) {
                URL.revokeObjectURL(removedImage.url)
            }
            state.imageList = state.imageList.filter(image => image.uid !== imageUid)
        },
        handleFileUploadChange(file, fileList, itemId) {
            const state = this.getClauseState(itemId)
            const appendList = Array.isArray(fileList) && fileList.length ? fileList : [file]
            let exceedCountLimit = false
            appendList.forEach((currentFile) => {
                const rawFile = currentFile && currentFile.raw ? currentFile.raw : currentFile
                if (!rawFile || state.fileList.some(fileItem => fileItem.uid === currentFile.uid)) {
                    return
                }
                if (!this.isFileSizeAllowed(rawFile, this.uploadLimits.fileSize)) {
                    this.$message.warning(`"${rawFile.name}" 超过 ${this.uploadLimits.fileSize}MB，无法上传`)
                    return
                }
                if (state.fileList.length >= this.uploadLimits.fileCount) {
                    exceedCountLimit = true
                    return
                }
                state.fileList.push(this.normalizeUploadFile({
                    uid: currentFile.uid,
                    name: rawFile.name,
                    size: rawFile.size
                }))
            })
            if (exceedCountLimit) {
                this.handleClauseUploadExceed('file')
            }
            this.clearUploadRef(`fileUpload-${itemId}`)
        },
        removeClauseFile(itemId, fileUid) {
            const state = this.getClauseState(itemId)
            state.fileList = state.fileList.filter(file => file.uid !== fileUid)
        },
        setClauseResult(itemId, result) {
            const state = this.getClauseState(itemId)
            state.result = result
        },
        getClauseResultOption(itemId) {
            const state = this.getClauseState(itemId)
            const resultValue = state.result || state.defaultResult
            return this.resultOptions.find(option => option.value === resultValue) || null
        },
        buildClauseSubmitPayload(item, state) {
            return {
                ...state.raw,
                categoryId: this.selectedStandard,
                standardId: this.selectedStandard,
                systemId: this.activeSystemId,
                databaseId: this.activeSystemId,
                tabId: this.activeTab,
                nodeId: this.activeDetailNode ? this.activeDetailNode.id : '',
                clauseId: item.id,
                itemId: item.id,
                note: state.note,
                result: state.result || state.defaultResult || '',
                imageList: state.imageList.map(image => ({
                    uid: image.uid,
                    name: image.name,
                    size: image.size,
                    url: image.url
                })),
                fileList: state.fileList.map(file => ({
                    uid: file.uid,
                    name: file.name,
                    size: file.size,
                    url: file.url
                }))
            }
        },
        async submitClauseItem(item) {
            const state = this.getClauseState(item.id)
            if (state.submitting) {
                return
            }
            state.submitting = true
            try {
                await mockSubmitClauseForm(this.buildClauseSubmitPayload(item, state))
                state.defaultResult = state.result || state.defaultResult
                this.$message.success('保存成功')
            } catch (error) {
                console.error('Failed to submit clause form:', error)
            } finally {
                state.submitting = false
            }
        }
    }
}
</script>

<style scoped>
.data-security-page {
    min-height: 0;
    background: #f5f7fb;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
}

.page-header {
    border-bottom: 1px solid #eaeaea;
    margin-bottom: 20px;
}

.page-header__main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.page-header__heading {
    min-width: 0;
}

.page-header__title {
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.3;
}

.page-header__subtitle {
    margin-top: 8px;
    font-size: 12px;
    color: #8a94a6;
}

.page-header__operations {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}

.form-label {
    font-size: 14px;
    color: #303133;
    white-space: nowrap;
}

.standard-select {
    width: 240px;
}

.page-layout {
    flex: 1;
    min-height: 0;
    display: flex;
}

@media (max-width: 768px) {
    .page-header__main {
        flex-direction: column;
        align-items: stretch;
    }

    .page-header__operations {
        width: 100%;
    }

    .standard-select {
        width: 100%;
    }
}

.page-layout__left,
.page-layout__right {
    min-height: 0;
}

.page-layout__left {
    display: flex;
}

.page-layout__right {
    display: flex;
    flex-direction: column;
}

.left-panel-card,
.summary-card,
.detail-card {
    border-radius: 16px;
    border: 1px solid #e6ebf5;
    box-shadow: none;
}

::v-deep .left-panel-card .el-card__body,
::v-deep .summary-card .el-card__body,
::v-deep .detail-card .el-card__body {
    padding: 20px;
}

.left-panel-card {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

::v-deep .left-panel-card .el-card__body {
    flex: 1;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}

.system-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
    min-height: 0;
    overflow: auto;
}

.system-card {
    padding: 16px;
    border: 1px solid #e8edf6;
    border-radius: 14px;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
}

.system-card:hover {
    border-color: #b8cdfd;
    box-shadow: 0 8px 20px rgba(52, 119, 246, 0.08);
}

.system-card.is-active {
    border-color: #97b8ff;
    box-shadow: 0 10px 24px rgba(72, 112, 255, 0.14);
    background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
}

.system-card__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.system-card__title-main {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
}

.system-card__icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: #edf3ff;
    color: #4f6ef7;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
}

.system-card__desc {
    margin-top: 10px;
    font-size: 12px;
    color: #8a94a6;
    line-height: 1.7;
}

.system-card__meta {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #7b8497;
}

.system-card__dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #d1d7e5;
}

.system-card__tags {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.system-card__tag {
    position: relative;
    border-radius: 999px;
    padding: 0 10px 0 20px;
}

.system-card__tag::before {
    content: '';
    position: absolute;
    left: 10px;
    top: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    transform: translateY(-50%);
}

.system-card__tag--blue {
    color: #4f6ef7;
    background: #eef2ff;
    border-color: #dbe3ff;
}

.system-card__tag--purple {
    color: #8b5cf6;
    background: #f3ecff;
    border-color: #e5d9ff;
}

.summary-card {
    margin-bottom: 20px;
    flex-shrink: 0;
}

.summary-stat-list {
    margin-top: 0;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
}

.summary-stat-item {
    padding: 16px 18px;
    border-radius: 14px;
    background: #fafbff;
    border: 1px solid #edf0f7;
}

.summary-stat-item__label {
    font-size: 12px;
    color: #8a94a6;
}

.summary-stat-item__value {
    margin-top: 10px;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
}

.summary-stat-item__value--primary {
    color: #4f6ef7;
}

.summary-stat-item__value--purple {
    color: #8b5cf6;
}

.summary-stat-item__value--success {
    color: #22c55e;
}

.summary-stat-item__value--warning {
    color: #f4b400;
}

.summary-stat-item__value--danger {
    color: #ef4444;
}

.summary-stat-item__value--muted {
    color: #9ca3af;
}

.detail-card {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}

::v-deep .detail-card .el-card__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.detail-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.detail-card__title {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
}

.detail-card__toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
}

.detail-card__progress-text {
    font-size: 14px;
    color: #6b7280;
}

.detail-card__progress {
    width: 140px;
}

.detail-card__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}

.security-tabs {
    margin-bottom: 16px;
    flex-shrink: 0;
}

::v-deep .security-tabs .el-tabs__nav-wrap::after {
    background-color: #edf1f8;
}

::v-deep .security-tabs .el-tabs__item {
    height: 44px;
    line-height: 44px;
    color: #75819a;
}

::v-deep .security-tabs .el-tabs__item.is-active {
    color: #4f6ef7;
    font-weight: 600;
}

::v-deep .security-tabs .el-tabs__active-bar {
    background-color: #4f6ef7;
}

.security-content {
    display: grid;
    grid-template-columns: 372px minmax(0, 1fr);
    border: 1px solid #edf1f7;
    border-radius: 16px;
    overflow: hidden;
    flex: 1;
    min-height: 0;
}

.security-tree-panel {
    padding: 14px 0;
    background: #fbfcff;
    border-right: 1px solid #edf1f7;
    min-height: 0;
    overflow: auto;
}

::v-deep .security-tree-panel .el-tree {
    background: transparent;
    min-width: 0;
}

::v-deep .security-tree-panel .el-tree-node__content {
    height: 48px;
    padding-right: 14px;
}

::v-deep .security-tree-panel .el-tree-node.is-current>.el-tree-node__content {
    background: #eef3ff;
    position: relative;
}

::v-deep .security-tree-panel .el-tree-node.is-current>.el-tree-node__content::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 999px;
    background: #4f6ef7;
}

.security-tree-node {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
}

.security-tree-node__left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.security-tree-node__code {
    color: #6b7280;
    font-weight: 600;
    flex-shrink: 0;
}

.security-tree-node__label {
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.security-tree-node__right {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.tree-stat-tag {
    position: relative;
    padding-left: 16px;
    border: none;
    border-radius: 16px;
    font-size: 11px;
}

.tree-stat-tag::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    transform: translateY(-50%);
}

.tree-total {
    font-size: 11px;
    color: #8a94a6;
    margin-left: 6px;
}

.security-detail-panel {
    padding: 24px;
    background: #fff;
    min-height: 0;
    overflow: auto;
}

.security-detail-panel__header {
    margin-bottom: 18px;
}

.security-detail-panel__title {
    font-size: 20px;
    font-weight: 700;
    color: #2f54eb;
    line-height: 1.3;
}

.security-detail-panel__desc {
    margin-top: 12px;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.9;
    padding-bottom: 16px;
    border-bottom: 1px solid #edf1f7;
}

.security-collapse {
    border-top: none;
    border-bottom: none;
}

::v-deep .security-collapse .el-collapse-item {
    margin-bottom: 14px;
    border: 1px solid #dbe4f3;
    border-radius: 16px;
    background: #fff;
    overflow: hidden;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

::v-deep .security-collapse .el-collapse-item.is-active {
    border-color: #5b7cff;
    box-shadow: 0 0 0 1px rgba(91, 124, 255, 0.08);
}

::v-deep .security-collapse .el-collapse-item__header {
    height: auto;
    min-height: 60px;
    line-height: 1.6;
    padding: 0 18px 0 16px;
    border: none;
    background: #fff;
}

::v-deep .security-collapse .el-collapse-item__wrap {
    border-top: 1px solid #eef2f8;
    border-bottom: none;
    margin: 0;
    background: #fff;
}

::v-deep .security-collapse .el-collapse-item__content {
    padding: 18px 20px 18px;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.9;
}

.collapse-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-width: 0;
    gap: 16px;
    padding: 14px 0;
}

.collapse-title__main {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    min-width: 0;
}

.collapse-title__badge {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #eef2ff;
    color: #4f6ef7;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
}

.collapse-title__text {
    color: #1f2937;
    font-size: 14px;
    font-weight: 600;
    min-width: 0;
}

.collapse-title__meta {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
}

.collapse-result-pill {
    height: 22px;
    padding: 0 10px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
}

.collapse-result-pill--success {
    color: #16a34a;
    background: #eaf8ef;
}

.collapse-result-pill--warning {
    color: #d97706;
    background: #fff3dc;
}

.collapse-result-pill--danger {
    color: #dc2626;
    background: #feecee;
}

.collapse-result-pill--info {
    color: #64748b;
    background: #f1f5f9;
}

.collapse-content {
    padding-left: 0;
}

.clause-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.clause-form__section {
    padding-top: 14px;
    border-top: 1px dashed #e8edf6;
}

.clause-form__section:first-child {
    padding-top: 0;
    border-top: none;
}

.clause-form__section--last {
    padding-bottom: 4px;
}

.clause-form>.clause-form__section:nth-child(2),
.clause-form>.clause-form__section:nth-child(3) {
    display: none;
}

.clause-form__section--custom-upload {
    padding-top: 0;
    border-top: none;
}

.clause-form__submit {
    margin-top: 14px;
    display: flex;
    justify-content: flex-end;
}

.clause-image-preview {
    width: 100%;
    display: block;
    border-radius: 12px;
}

.clause-form__label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: #475569;
    font-size: 14px;
    font-weight: 600;
}

.clause-form__label i {
    color: #7c8aa5;
}

.clause-form__label-hint {
    font-size: 12px;
    font-weight: 400;
    color: #8a94a6;
    line-height: 1.5;
}

::v-deep .clause-form .el-textarea__inner {
    min-height: 86px !important;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid #d7e0ef;
    background: #ffffff;
    color: #475569;
    box-shadow: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

::v-deep .clause-form .el-textarea__inner::placeholder {
    color: #b1bacb;
}

::v-deep .clause-form .el-textarea__inner:hover {
    border-color: #c4d2eb;
}

::v-deep .clause-form .el-textarea__inner:focus {
    border-color: #4f6ef7;
    background: #ffffff;
    box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.12);
}

.clause-image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.clause-upload {
    display: inline-flex;
}

.clause-image-card {
    position: relative;
    width: 72px;
    height: 72px;
    border-radius: 12px;
    border: 1px solid #d9e2f2;
    overflow: hidden;
    background: #f8fbff;
    cursor: pointer;
    flex-shrink: 0;
}

.clause-image-card__img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
}

.clause-image-card__remove {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.68);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.clause-image-card:hover .clause-image-card__remove {
    opacity: 1;
}

.clause-form__upload-box {
    width: 72px;
    height: 72px;
    border: 1px dashed #d9e2f2;
    border-radius: 12px;
    background: #f9fbff;
    color: #98a3b8;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.clause-form__upload-box:hover {
    border-color: #b7c8eb;
    color: #6b7a90;
}

.clause-form__upload-box i {
    font-size: 18px;
}

.clause-form__upload-box span {
    font-size: 12px;
}

.clause-form__attach-btn {
    height: 34px;
    padding: 0 16px;
    border-color: #dbe3f0;
    border-radius: 10px;
    color: #7c8aa5;
    background: #fff;
}

.clause-form__attach-btn i {
    margin-right: 4px;
}

.clause-file-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 12px;
}

.clause-file-item {
    min-height: 56px;
    border: 1px solid #e4e9f2;
    border-radius: 12px;
    background: #f8fafc;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.clause-file-item__main {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.clause-file-item__badge {
    font-size: 11px;
    font-weight: 700;
    color: #98a3b8;
    flex-shrink: 0;
}

.clause-file-item__meta {
    min-width: 0;
}

.clause-file-item__name {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    word-break: break-all;
}

.clause-file-item__size {
    margin-top: 4px;
    font-size: 12px;
    color: #98a3b8;
}

.clause-file-item__remove {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: #98a3b8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
}

.clause-file-item__remove:hover {
    color: #ef4444;
}

.result-button-group {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}

.result-button {
    height: 40px;
    border: 1px solid #d7e0ef;
    border-radius: 12px;
    background: #fff;
    color: #5f6b85;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.result-button:hover {
    border-color: #b8c7e2;
    transform: translateY(-1px);
}

.result-button--success.is-active {
    color: #10b981;
    background: #ecfdf5;
    border-color: #10b981;
    box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.08);
}

.result-button--warning.is-active {
    color: #f59e0b;
    background: #fffbeb;
    border-color: #f59e0b;
    box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.result-button--danger.is-active {
    color: #ef4444;
    background: #fef2f2;
    border-color: #ef4444;
    box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.08);
}

.result-button--info.is-active {
    color: #64748b;
    background: #f8fafc;
    border-color: #94a3b8;
    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.08);
}

@media screen and (max-width: 1440px) {
    .summary-stat-list {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .security-content {
        grid-template-columns: 332px minmax(0, 1fr);
    }
}

@media screen and (max-width: 1200px) {
    .data-security-page {
        height: auto;
        min-height: 100%;
        overflow: visible;
    }

    .page-layout {
        display: block;
        min-height: auto;
    }

    .page-layout__right {
        display: block;
    }

    .detail-card__header {
        flex-direction: column;
        align-items: flex-start;
    }

    .security-content {
        grid-template-columns: 1fr;
    }

    .security-tree-panel {
        border-right: none;
        border-bottom: 1px solid #edf1f7;
    }

    .result-button-group {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
