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
                            <el-tab-pane v-for="tab in securityTabs" :key="tab.value" :label="tab.label"
                                :name="tab.value"></el-tab-pane>
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
                                                        <el-input v-model="getClauseState(item.id).gradeItemExplain" type="textarea"
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

                                                    <div
                                                        class="clause-form__section clause-form__section--custom-upload">
                                                        <div class="clause-form__label">
                                                            <i class="el-icon-picture-outline"></i>
                                                            <span>图片证据 / 截图</span>
                                                            <span class="clause-form__label-hint">{{ imageUploadHint
                                                                }}</span>
                                                        </div>
                                                        <div class="clause-image-list">
                                                            <div v-for="image in getClauseState(item.id).imageList"
                                                                :key="image.key" class="clause-image-card"
                                                                @click="handleImagePreview(image)">
                                                                <img :src="getResourcePreviewUrl(image)" :alt="image.name"
                                                                    class="clause-image-card__img">
                                                                <button type="button" class="clause-image-card__remove"
                                                                    @click.stop="removeClauseImage(item.id, image.key)">
                                                                    <i class="el-icon-close"></i>
                                                                </button>
                                                            </div>
                                                            <el-upload
                                                                v-if="!isClauseUploadLimitReached(item.id, 'image')"
                                                                :ref="`imageUpload-${item.id}`" class="clause-upload"
                                                                action="#" :auto-upload="false" :show-file-list="false"
                                                                multiple :limit="uploadLimits.imageCount"
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

                                                    <div
                                                        class="clause-form__section clause-form__section--custom-upload">
                                                        <div class="clause-form__label">
                                                            <i class="el-icon-document"></i>
                                                            <span>文件附件</span>
                                                            <span class="clause-form__label-hint">{{ fileUploadHint
                                                                }}</span>
                                                        </div>
                                                        <div class="clause-file-list"
                                                            v-if="getClauseState(item.id).fileList.length">
                                                            <div v-for="file in getClauseState(item.id).fileList"
                                                                :key="file.key" class="clause-file-item">
                                                                <div class="clause-file-item__main">
                                                                    <div class="clause-file-item__badge">FILE</div>
                                                                    <div class="clause-file-item__meta">
                                                                        <div class="clause-file-item__name">{{ file.name
                                                                            }}</div>
                                                                        <div class="clause-file-item__size">{{
                                                                            file.sizeName || formatFileSize(file.size) }}</div>
                                                                    </div>
                                                                </div>
                                                                <button type="button" class="clause-file-item__remove"
                                                                    @click="removeClauseFile(item.id, file.key)">
                                                                    <i class="el-icon-close"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <el-upload v-if="!isClauseUploadLimitReached(item.id, 'file')"
                                                            :ref="`fileUpload-${item.id}`" class="clause-upload"
                                                            action="#" :auto-upload="false" :show-file-list="false"
                                                            multiple :limit="uploadLimits.fileCount"
                                                            :on-exceed="() => handleClauseUploadExceed('file')"
                                                            :on-change="(file, fileList) => handleFileUploadChange(file, fileList, item.id)">
                                                            <el-button plain size="small"
                                                                class="clause-form__attach-btn">
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
                                                                :class="['result-button', `result-button--${option.type}`, { 'is-active': getClauseState(item.id).gradeItemResult === option.value }]"
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
            :title="imagePreviewName || '图片预览'" custom-class="clause-image-preview-dialog">
            <img v-if="imagePreviewUrl" :src="imagePreviewUrl" alt="preview" class="clause-image-preview">
        </el-dialog>
    </div>
</template>

<script>
import {
    getFrameworks, getGradeSecurityProtectionTypeByDatabaseId, getTreeGradeSecurityProtectionByDatabaseId
    , getGradeSecurityProtectionItemByParentId, saveGradeSecurityProtectionItem
    , getDataSourceListByProjectId, deleteGradeSecurityProtectionItemFile
} from '@/api/system/protectCategory'

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
            imagePreviewName: '',
            uploadLimits: {
                imageCount: 5,
                imageSize: 5,
                fileCount: 5,
                fileSize: 10
            },
            resultOptions: [
                { label: '符合', value: 'compliant', type: 'success', icon: 'el-icon-check' },
                { label: '部分符合', value: 'partialCompliant', type: 'warning', icon: 'el-icon-time' },
                { label: '不符合', value: 'nonCompliant', type: 'danger', icon: 'el-icon-close' },
                { label: '不适用', value: 'notApplicable', type: 'info', icon: 'el-icon-minus' }
            ]
        }
    },
    created() {
        this.query = this.normalizeRouteRow(this.$route.query.row)
        this.selectedStandard = this.$route.query.projectId
            ? String(this.$route.query.projectId)
            : this.query.projectId
                ? String(this.query.projectId)
                : this.$route.query.categoryId
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
        buildUploadKey(prefix = 'upload', item = {}) {
            const name = item.name || 'file'
            const size = this.toNumber(item.size)
            const url = item.url || item.previewUrl || item.localUrl || item.imgUrl || item.fileUrl || item.filePath || ''
            const lastModified = item.lastModified || ''
            return `${prefix}-${name}-${size}-${lastModified}-${url || this.buildUploadUid(prefix)}`
        },
        isLocalResourceUrl(url = '') {
            const source = String(url || '').trim()
            return source.startsWith('blob:') || source.startsWith('data:')
        },
        resolveResourceUrl(url = '') {
            const source = String(url || '').trim()
            if (!source) return ''
            if (/^(https?:)?\/\//i.test(source) || source.startsWith('blob:') || source.startsWith('data:')) {
                return source
            }
            return `${window.location.origin}/${source.replace(/^\/+/, '')}`
        },
        normalizeUploadImage(item = {}) {
            const sourceUrl = item.url || item.previewUrl || item.localUrl || item.imgUrl || item.fileUrl || item.filePath || item.downloadUrl || item.path || (item.response && item.response.url) || ''
            const isLocalUrl = this.isLocalResourceUrl(sourceUrl)
            return {
                key: item.key || this.buildUploadKey('image', item),
                name: item.name || 'image.png',
                size: this.toNumber(item.size),
                sizeName: item.sizeName || '',
                url: isLocalUrl ? '' : sourceUrl,
                previewUrl: this.resolveResourceUrl(sourceUrl),
                localUrl: isLocalUrl ? sourceUrl : '',
                raw: item.raw || null
            }
        },
        normalizeUploadFile(item = {}) {
            const sourceUrl = item.url || item.imgUrl || item.fileUrl || item.filePath || item.downloadUrl || item.path || ''
            const isLocalUrl = this.isLocalResourceUrl(sourceUrl)
            return {
                key: item.key || this.buildUploadKey('file', item),
                name: item.name || 'file',
                size: this.toNumber(item.size),
                sizeName: item.sizeName || '',
                url: isLocalUrl ? '' : sourceUrl,
                previewUrl: this.resolveResourceUrl(sourceUrl),
                localUrl: isLocalUrl ? sourceUrl : '',
                raw: item.raw || null
            }
        },
        getResourcePreviewUrl(resource = {}) {
            return resource.previewUrl || this.resolveResourceUrl(resource.url || resource.imgUrl || '')
        },
        normalizeRawList(value) {
            if (Array.isArray(value)) {
                return value
            }
            if (typeof value === 'string' && value) {
                try {
                    const parsed = JSON.parse(value)
                    return Array.isArray(parsed) ? parsed : []
                } catch (error) {
                    return []
                }
            }
            return []
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
                const payload = this.extractResponseData(response) || {}
                const list = this.extractList(payload, ['records', 'rows', 'list'])
                this.treeOptions = list
                const hasSelectedStandard = this.treeOptions.some(item => String(item.id) === this.selectedStandard)
                if (!hasSelectedStandard) {
                    this.selectedStandard = this.treeOptions.length ? String(this.treeOptions[0].id) : ''
                }
            } catch (error) {
                this.treeOptions = []
                this.selectedStandard = ''
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
                const response = await getDataSourceListByProjectId({
                    projectId: this.selectedStandard
                })
                const payload = this.extractResponseData(response) || {}
                const list = this.extractList(payload, ['dataSourceList', 'databaseList', 'systems', 'list']).map((item, index) => this.normalizeDataSourceItem(item, index))
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
            const stats = this.getSystemSummaryStats(system)
            const findValueByTheme = (theme) => {
                const target = stats.find(item => item.theme === theme)
                return target ? this.toNumber(target.value) : 0
            }
            return {
                completed: this.toNumber(system.okCount || findValueByTheme('success')),
                total: this.toNumber(
                    (system.generalClauseCount || findValueByTheme('primary')) +
                    (system.importantClauseCount || findValueByTheme('purple'))
                )
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
        normalizeTagList(tags = []) {
            return (Array.isArray(tags) ? tags : []).map((tag, index) => {
                if (typeof tag === 'string') {
                    return {
                        text: tag,
                        theme: index % 2 === 0 ? 'blue' : 'purple'
                    }
                }
                return {
                    text: tag.text || tag.label || tag.name || `标签${index + 1}`,
                    theme: tag.theme || (index % 2 === 0 ? 'blue' : 'purple')
                }
            })
        },
        normalizeDataSourceItem(item = {}, index = 0) {
            return {
                ...item,
                id: String(item.id || item.databaseId || item.dataSourceId || item.value || `database-${index + 1}`),
                name: item.name || item.databaseName || item.dataSourceName || item.sourceName || item.label || `数据源${index + 1}`,
                description: item.description || item.remark || item.comment || '暂无描述',
                ip: item.ip || item.host || item.address || item.url || '--',
                databaseType: item.databaseType || item.dbType || item.typeName || item.type || '--',
                icon: item.icon || 'el-icon-cpu',
                tags: this.normalizeTagList(item.tags)
            }
        },
        normalizeTabs(list = []) {
            return (Array.isArray(list) ? list : []).map((item, index) => {
                const value = String(item.value ?? item.type ?? item.id ?? item.tabId ?? item.code ?? index + 1)
                return {
                    ...item,
                    id: value,
                    value,
                    label: item.label || item.name || item.tabName || item.title || `标签${index + 1}`
                }
            })
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
                    code: item.gradeSerial || item.code || item.nodeCode || item.serialNo || '',
                    label: item.gradeName || item.label || item.name || item.title || `节点${index + 1}`,
                    description: item.gradeDescribe || item.description || item.remark || '',
                    total: this.toNumber(item.count ?? item.total ?? item.totalCount ?? item.itemCount),
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
                id: String(item.id || item.gradeItemId || item.itemId || item.detailId || item.clauseId || `${this.activeTreeNodeId}-${index + 1}`),
                sort: item.gradeItemSort || item.sort || item.serialNo || String(index + 1),
                title: item.gradeItemName || item.name || item.label || `条目${index + 1}`,
                defaultResult: item.gradeItemResult || item.result || item.resultValue || item.status || '',
                gradeItemExplain: item.gradeItemExplain || item.note || item.remark || '',
                gradeItemResult: item.gradeItemResult || item.result || item.resultValue || item.status || '',
                imageList: this.normalizeRawList(item.gradeItemPictureList || item.pictureFileList || item.imageList),
                fileList: this.normalizeRawList(item.gradeItemFileList || item.fileAttachmentList || item.fileList)
            }))
        },
        normalizeNodeDetail(payload = {}, node = {}) {
            const detailSource = payload.detail || payload.nodeDetail || payload
            const itemList = this.extractList(detailSource, ['items', 'clauses'])
            return {
                title: detailSource.gradeName || detailSource.title || detailSource.label || node.label || '',
                description: detailSource.gradeDescribe || detailSource.description || detailSource.remark || detailSource.content || node.description || '',
                items: this.normalizeDetailItems(itemList)
            }
        },
        createClauseState(item = {}) {
            return {
                loading: false,
                loaded: false,
                submitting: false,
                gradeItemExplain: item.gradeItemExplain || '',
                gradeItemResult: item.gradeItemResult || item.defaultResult || item.result || '',
                defaultResult: item.gradeItemResult || item.defaultResult || item.result || '',
                imageList: Array.isArray(item.imageList) ? item.imageList.map(image => this.normalizeUploadImage(image)) : [],
                fileList: Array.isArray(item.fileList) ? item.fileList.map(file => this.normalizeUploadFile(file)) : [],
                raw: { ...item }
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
                const response = await getGradeSecurityProtectionTypeByDatabaseId({
                    databaseId: this.activeSystemId
                })
                const payload = this.extractResponseData(response) || {}
                this.securityTabs = this.normalizeTabs(this.extractList(payload, ['types', 'tabs', 'list', 'rows', 'records']))
                const progress = this.normalizeProgress(payload)
                this.detailProgress = progress.total ? progress : this.createProgressFallback()
                this.activeTab = this.securityTabs.length ? this.securityTabs[0].value : ''
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
                const response = await getTreeGradeSecurityProtectionByDatabaseId({
                    databaseId: this.activeSystemId,
                    type: this.activeTab,
                    parentId: 0
                })
                const payload = this.extractResponseData(response) || {}
                this.treeNodes = this.normalizeTreeNodes(this.extractList(payload, ['tree', 'nodes', 'children', 'list', 'rows', 'records']))
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
                this.activeTreeNodeId = data.id
                await this.loadTreeChildren(data, node)
                return
            }
            await this.loadNodeDetail(data)
        },
        async loadTreeChildren(data, node) {
            this.clearDetailPanel()
            this.activeTreeNodeId = data.id
            if (data.childrenLoaded) {
                node.expanded = !node.expanded
                return
            }
            this.treeLoading = true
            try {
                const response = await getTreeGradeSecurityProtectionByDatabaseId({
                    databaseId: this.activeSystemId,
                    type: this.activeTab,
                    parentId: data.id
                })
                const payload = this.extractResponseData(response) || {}
                const children = this.normalizeTreeNodes(this.extractList(payload, ['tree', 'nodes', 'children', 'list', 'rows', 'records']))
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
                const response = await getGradeSecurityProtectionItemByParentId({
                    databaseId: this.activeSystemId,
                    type: this.activeTab,
                    parentId: data.id
                })
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
            this.imagePreviewUrl = this.getResourcePreviewUrl(image)
            this.imagePreviewName = image.name || '图片预览'
            this.imagePreviewVisible = !!this.imagePreviewUrl
        },
        handleImageUploadChange(file, fileList, itemId) {
            const state = this.getClauseState(itemId)
            const appendList = Array.isArray(fileList) && fileList.length ? fileList : [file]
            let exceedCountLimit = false
            appendList.forEach((currentFile) => {
                const rawFile = currentFile && currentFile.raw ? currentFile.raw : currentFile
                if (!rawFile) {
                    return
                }
                const nextKey = this.buildUploadKey('image', rawFile)
                if (state.imageList.some(image => image.key === nextKey)) {
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
                    key: nextKey,
                    name: rawFile.name,
                    size: rawFile.size,
                    previewUrl: URL.createObjectURL(rawFile),
                    localUrl: '',
                    raw: rawFile
                }))
            })
            if (exceedCountLimit) {
                this.handleClauseUploadExceed('image')
            }
            this.clearUploadRef(`imageUpload-${itemId}`)
        },
        async removeClauseImage(itemId, imageKey) {
            await this.removeClauseResource(itemId, imageKey, 'image')
        },
        handleFileUploadChange(file, fileList, itemId) {
            const state = this.getClauseState(itemId)
            const appendList = Array.isArray(fileList) && fileList.length ? fileList : [file]
            let exceedCountLimit = false
            appendList.forEach((currentFile) => {
                const rawFile = currentFile && currentFile.raw ? currentFile.raw : currentFile
                if (!rawFile) {
                    return
                }
                const nextKey = this.buildUploadKey('file', rawFile)
                if (state.fileList.some(fileItem => fileItem.key === nextKey)) {
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
                    key: nextKey,
                    name: rawFile.name,
                    size: rawFile.size,
                    previewUrl: '',
                    localUrl: '',
                    raw: rawFile
                }))
            })
            if (exceedCountLimit) {
                this.handleClauseUploadExceed('file')
            }
            this.clearUploadRef(`fileUpload-${itemId}`)
        },
        async removeClauseFile(itemId, fileKey) {
            await this.removeClauseResource(itemId, fileKey, 'file')
        },
        removeClauseResourceFromState(state, resourceKey, type) {
            const listKey = type === 'image' ? 'imageList' : 'fileList'
            const currentList = Array.isArray(state[listKey]) ? state[listKey] : []
            const currentResource = currentList.find(item => item.key === resourceKey)
            const previewUrl = currentResource ? this.getResourcePreviewUrl(currentResource) : ''
            if (previewUrl && String(previewUrl).startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl)
            }
            state[listKey] = currentList.filter(item => item.key !== resourceKey)
        },
        buildDeleteClauseResourcePayload(itemId, resource = {}) {
            return {
                id: itemId,
                url: resource.url || ''
            }
        },
        async removeClauseResource(itemId, resourceKey, type = 'file') {
            const state = this.getClauseState(itemId)
            const listKey = type === 'image' ? 'imageList' : 'fileList'
            const currentList = Array.isArray(state[listKey]) ? state[listKey] : []
            const currentResource = currentList.find(item => item.key === resourceKey)
            if (!currentResource) {
                return
            }
            if (!currentResource.url) {
                this.removeClauseResourceFromState(state, resourceKey, type)
                return
            }
            const resourceLabel = type === 'image' ? '图片' : '文件'
            try {
                await this.$confirm(`确认删除该${resourceLabel}吗？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                await deleteGradeSecurityProtectionItemFile(this.buildDeleteClauseResourcePayload(itemId, currentResource))
                if (this.activeDetailNode && this.activeDetailNode.id) {
                    await this.loadNodeDetail(this.activeDetailNode)
                } else {
                    this.removeClauseResourceFromState(state, resourceKey, type)
                }
                this.$message.success('删除成功')
            } catch (error) {
                if (error === 'cancel' || error === 'close') {
                    return
                }
                console.error(`Failed to delete ${resourceLabel}:`, error)
            }
        },
        setClauseResult(itemId, result) {
            const state = this.getClauseState(itemId)
            state.gradeItemResult = state.gradeItemResult === result ? '' : result
        },
        getClauseResultOption(itemId) {
            const state = this.getClauseState(itemId)
            const resultValue = state.gradeItemResult
            return this.resultOptions.find(option => option.value === resultValue) || null
        },
        buildClauseSubmitPayload(item, state) {
            const formData = new FormData()
            formData.append('id', String(state.raw.id || state.raw.gradeItemId || item.id || ''))
            formData.append('gradeItemExplain', state.gradeItemExplain != null ? String(state.gradeItemExplain) : '')
            formData.append('gradeItemResult', state.gradeItemResult || '')
            state.imageList.forEach((image) => {
                if (image && image.raw) {
                    formData.append('pictureFileList', image.raw)
                }
            })
            state.fileList.forEach((fileItem) => {
                if (fileItem && fileItem.raw) {
                    formData.append('fileAttachmentList', fileItem.raw)
                }
            })
            return formData
        },
        async submitClauseItem(item) {
            const state = this.getClauseState(item.id)
            if (state.submitting) {
                return
            }
            state.submitting = true
            try {
                await saveGradeSecurityProtectionItem(this.buildClauseSubmitPayload(item, state))
                state.defaultResult = state.gradeItemResult || ''
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

::v-deep .clause-image-preview-dialog {
    border-radius: 18px;
    overflow: hidden;
}

::v-deep .clause-image-preview-dialog .el-dialog__header {
    padding: 18px 20px 14px;
    border-bottom: 1px solid #eef2f8;
}

::v-deep .clause-image-preview-dialog .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
}

::v-deep .clause-image-preview-dialog .el-dialog__body {
    padding: 20px;
    background: #fff;
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
