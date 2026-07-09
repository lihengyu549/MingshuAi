<template>
  <div class="cockpit" v-loading="loading">
    <div class="page-header">
      <h2><b>数据安全驾驶舱</b></h2>
      <div class="header-operations">
        <label class="form-label">所属标准</label>
        <el-select v-model="categoryId" placeholder="所属标准" size="small" class="standard-select">
          <el-option v-for="item in standardOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
    </div>

    <el-row :gutter="16" class="section top-section" type="flex" align="stretch">
      <el-col :span="18">
        <el-row :gutter="16" type="flex" align="stretch" class="top-left-row">
          <el-col :span="8" class="top-col">
            <el-card class="panel-card top-card hoverable" shadow="never">
              <div class="top-card-header">
                <div class="top-card-icon top-card-icon-blue">
                  <svg-icon iconClass="数据总量" />
                </div>
                <div class="top-card-head">
                  <div class="top-card-title">数据总量</div>
                  <div class="top-card-sub">当前纳管数据资产规模</div>
                </div>
              </div>
              <div class="summary-metrics">
                <div class="summary-metric">
                  <div class="summary-value">
                    <count-to :start-val="0" :end-val="dataView.summary.objectCount" :duration="1500" />
                  </div>
                  <div class="summary-key">纳管对象</div>
                  <div class="summary-subkey">字段+文件</div>
                </div>
                <div class="summary-metric">
                  <div class="summary-value">
                    <count-to :start-val="0" :end-val="dataView.summary.capacityGB" :duration="1500" />
                    <span class="summary-unit">GB</span>
                  </div>
                  <div class="summary-key">总容量</div>
                  <div class="summary-subkey">存储占用</div>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="16" class="top-col">
            <el-card class="panel-card top-card hoverable source-combined-card" shadow="never">
              <div class="source-split">
                <div class="source-pane">
                  <div class="top-card-header">
                    <div class="top-card-icon top-card-icon-gray">
                      <i class="el-icon-coin"></i>
                    </div>
                    <div class="top-card-head">
                      <div class="top-card-title">结构化数据源</div>
                    </div>
                  </div>
                  <div class="source-main">
                    <div class="source-main-value">
                      <count-to :start-val="0" :end-val="dataView.structured.sourceCount" :duration="1500" />
                      <span class="source-unit">个</span>
                    </div>
                    <div class="source-sub">
                      {{ dataView.structured.sizeGB }}GB · {{ dataView.structured.fieldCount }}字段
                    </div>
                  </div>
                  <div class="badge-row">
                    <span class="warn-badge">
                      <span class="warn-dot"></span>
                      {{ dataView.structured.sensitiveLabel }} {{ dataView.structured.sensitivePercent }}%
                    </span>
                  </div>
                </div>
                <div class="source-divider"></div>
                <div class="source-pane">
                  <div class="top-card-header">
                    <div class="top-card-icon top-card-icon-gray">
                      <i class="el-icon-folder"></i>
                    </div>
                    <div class="top-card-head">
                      <div class="top-card-title">非结构化数据源</div>
                    </div>
                  </div>
                  <div class="source-main">
                    <div class="source-main-value">
                      <count-to :start-val="0" :end-val="dataView.unstructured.sourceCount" :duration="1500" />
                      <span class="source-unit">个</span>
                    </div>
                    <div class="source-sub">
                      {{ dataView.unstructured.sizeGB }}GB · {{ dataView.unstructured.fileCount }}个文件
                    </div>
                  </div>
                  <div class="badge-row">
                    <span class="warn-badge">
                      <span class="warn-dot"></span>
                      {{ dataView.unstructured.sensitiveLabel }} {{ dataView.unstructured.sensitivePercent }}%
                    </span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <el-col :span="6" class="top-right-col">
        <div class="top-right-stack">
          <el-card class="panel-card mini-stat-card hoverable" shadow="never">
            <div class="mini-stat">
              <div class="mini-left">
                <div class="mini-icon" :style="{ color: '#5b5cf6' }">
                  <svg-icon iconClass="qwen" class-name="mini-svg" />
                </div>
                <div class="mini-info">
                  <div class="mini-title">{{ dataView.rightCards.identify.title }}</div>
                  <div class="mini-desc">由Qwen完成</div>
                </div>
              </div>
              <div class="mini-value">
                <count-to :start-val="0" :end-val="dataView.rightCards.identify.value" :duration="1500" />
              </div>
            </div>
          </el-card>
          <el-card class="panel-card mini-stat-card hoverable" shadow="never">
            <div class="mini-stat">
              <div class="mini-left">
                <div class="mini-icon" :style="{ color: '#5b5cf6' }">
                  <svg-icon iconClass="deepseek" class-name="mini-svg" />
                </div>
                <div class="mini-info">
                  <div class="mini-title">{{ dataView.rightCards.review.title }}</div>
                  <div class="mini-desc">由Deepseek完成</div>
                </div>
              </div>
              <div class="mini-value">
                <count-to :start-val="0" :end-val="dataView.rightCards.review.value" :duration="1500" />
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="section middle-section" :style="middleSectionStyle" type="flex" align="stretch">
      <el-col :span="12" class="middle-col">
        <el-card ref="assetMapCard" class="panel-card hoverable" shadow="never">
          <div slot="header" class="panel-header">
            <div class="panel-title">
              数据资产地图<span v-if="mapPathText" class="panel-path"> / {{ mapPathText }}</span>
            </div>
            <div class="panel-actions">
              <div class="map-legend">
                <div class="legend-item">
                  <span class="legend-dot blue"></span>
                  <span>数据占比</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot red"></span>
                  <span>敏感数据占比</span>
                </div>
              </div>
              <el-button v-if="mapPath.length" type="primary" plain size="small" icon="el-icon-arrow-left"
                @click="handleMapBack" style="border-radius: 10px;">
                返回
              </el-button>
            </div>
          </div>

          <div class="asset-map-body" :style="middleBodyStyle">
            <div class="asset-tile-grid">
              <div v-for="item in currentMapTiles" :key="item.id"
                :class="['asset-tile', 'hoverable-tile', { 'asset-tile-drillable': item.hasChildren }]"
                @click="handleMapTileClick(item)">
                <div class="tile-title">{{ item.title }}</div>
                <div class="tile-ratios">
                  <div class="tile-ratio">
                    <span class="tile-ratio-value tile-blue">{{ item.ratio }}%</span>
                  </div>
                  <div class="tile-ratio">
                    <span class="tile-ratio-value tile-red">{{ item.sensitiveRatio }}%</span>
                  </div>
                </div>
                <div class="tile-desc" v-show="item.desc != ''">子类涉及：{{ item.desc }}</div>
                <div class="tile-footer">
                  <div class="tile-tags">
                    <span v-if="item.sourceTags && item.sourceTags.length" class="source-tag">{{ item.sourceTags[0].label }}</span>
                    <span v-else class="source-tag">暂无数据</span>
                    <span v-if="item.moreCount" class="more-tag">+{{ item.moreCount }}</span>
                  </div>
                  <div v-if="item.hasChildren" class="tile-arrow">
                    <i class="el-icon-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="middle-col">
        <el-card ref="levelCard" class="panel-card hoverable" shadow="never">
          <div slot="header" class="panel-header">
            <div class="panel-title">数据等级分布</div>
            <div class="panel-actions">
              <span class="hint-badge">
                <span class="warn-dot orange"></span>
                敏感分级：{{ levelLegendText }}
              </span>
            </div>
          </div>

          <div class="level-dist" :style="middleBodyStyle">
            <div class="level-bars">
              <div ref="levelChart" class="level-chart"></div>
              <div class="chart-tip">点击条形图筛选右侧表格</div>
            </div>

            <div class="level-table">
              <div class="level-table-head">
                <div class="level-table-title">分类明细</div>
                <span v-if="selectedLevelName" class="level-table-tag">{{ selectedLevelName }}</span>
              </div>
              <el-table ref="levelTableRef" :data="levelTableData" size="mini" height="100%" class="cockpit-table"
                :header-cell-style="{ background: '#f7f9fc' }" :row-style="getLevelTableRowStyle">
                <template slot="empty">
                  <el-empty :description="$t('noData')"></el-empty>
                </template>
                <el-table-column prop="category" label="数据类别" min-width="120" />
                <el-table-column prop="count" label="数量" width="90" />
                <!-- <el-table-column label="占比" width="70">
                  <template slot-scope="{ row }">
                    <span class="ratio-text">{{ row.ratio }}%</span>
                  </template>
                </el-table-column> -->
                <el-table-column label="数据源" min-width="140">
                  <template slot-scope="{ row }">
                    <div class="table-sources">
                      <span v-if="row.sources && row.sources.length" class="table-source-tag">{{ row.sources[0].label }}</span>
                      <span v-if="row.moreCount" class="table-more-tag">+{{ row.moreCount }}</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="panel-card hoverable section bottom-section" shadow="never">
      <div slot="header" class="panel-header">
        <div class="panel-title">敏感数据风险清单</div>
      </div>
      <el-table :data="sensitiveData" class="cockpit-table risk-table" :header-cell-style="{ background: '#f7f9fc' }">
        <el-table-column label="数据源名称" width="300">
          <template slot-scope="{ row }">
            <div class="source-name-cell">
              <div class="source-icon">
                <i class="el-icon-coin"></i>
              </div>
              <span class="source-link">{{ row.sourceName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="系统名称" width="150">
          <template slot-scope="{ row }">
            <span class="system-pill"><i class="el-icon-sunny"></i> {{ row.systemName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="风险统计" min-width="260">
          <template slot-scope="{ row }">
            <div class="risk-tags">
              <el-tag v-for="(t, idx) in row.riskStats" :key="idx" class="risk-level-tag"
                :style="getHomeRiskStyle(t.level)">
                {{ t.label }} * {{ t.value }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="所属部门" min-width="180">
          <template slot-scope="{ row }">
            <div class="dept-cell">
              <i class="el-icon-office-building"></i>
              <span>{{ row.dept }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="数据安全负责人" width="150">
          <template slot-scope="{ row }">
            <div class="owner-cell">
              <span class="owner-avatar">{{ (row.owner || '').slice(0, 1) }}</span>
              <span>{{ row.owner }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="{ row }">
            <el-button class="action-btn" @click="handleCompleteList(row)">完整清单 <i
                class="el-icon-arrow-right"></i></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import * as echarts from 'echarts'
import { getFrameworks, listSensitiveDataRiskAssessmentReport, getTopDataJson, getLeftDataJson, getRightLevel, getRightDataJson } from '@/api/system/protectCategory'
export default {
  name: 'Dashboard',
  components: {
    CountTo
  },
  data() {
    return {
      loading: false,
      loadingCount: 0,
      categoryId: '',
      standardOptions: [],
      dataView: {
        summary: {
          objectCount: 0,
          capacityGB: 0
        },
        structured: {
          sourceCount: 0,
          sizeGB: 0,
          fieldCount: 0,
          sensitiveLabel: '',
          sensitivePercent: 0
        },
        unstructured: {
          sourceCount: 0,
          sizeGB: 0,
          fileCount: 0,
          sensitiveLabel: '',
          sensitivePercent: 0
        },
        rightCards: {
          identify: {
            title: '识别数量',
            value: 0
          },
          review: {
            title: '审查数量',
            value: 0
          }
        }
      },
      dataAssetMap: [],
      levelChartData: {
        levelLegend: [],
        levels: []
      },
      levelTableData: [],
      sensitiveData: [],
      mapPath: [],
      selectedLevelId: '',
      selectedLevelName: '',
      middleBodyHeight: 0,
      middleSectionHeight: 0,
      levelTableRowHeight: 0,
      charts: {
        level: null
      }
    }
  },
  computed: {
    currentMapTiles() {
      return Array.isArray(this.dataAssetMap) ? this.dataAssetMap : []
    },
    mapPathText() {
      if (!Array.isArray(this.mapPath) || !this.mapPath.length) return ''
      return this.mapPath.map(i => i.title).filter(Boolean).join(' / ')
    },
    maxLevelValue() {
      const list = (this.levelChartData && Array.isArray(this.levelChartData.levels)) ? this.levelChartData.levels : []
      let max = 0
      list.forEach(i => {
        const v = Number(i.value) || 0
        if (v > max) max = v
      })
      return max || 1
    },
    selectedLevelIndex() {
      const list = (this.levelChartData && Array.isArray(this.levelChartData.levels)) ? this.levelChartData.levels : []
      return list.findIndex(i => String(i.id) === String(this.selectedLevelId))
    },
    levelLegendText() {
      const list = (this.levelChartData && Array.isArray(this.levelChartData.levelLegend)) ? this.levelChartData.levelLegend : []
      return list.filter(Boolean).join(' · ')
    },
    middleBodyStyle() {
      if (!this.middleBodyHeight) return {}
      return {
        height: `${this.middleBodyHeight}px`
      }
    },
    middleSectionStyle() {
      if (!this.middleSectionHeight) return {}
      return {
        height: `${this.middleSectionHeight}px`
      }
    }
  },
  watch: {
    categoryId() {
      this.handleCategoryChange()
    },
    selectedLevelId() {
      this.updateLevelChart()
    }
  },
  mounted() {
    this.fetchFrameworkOptions()
    this.$nextTick(() => {
      this.syncMiddleBodyHeight()
      this.initLevelChart()
      window.addEventListener('resize', this.handleResize)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.charts.level) this.charts.level.dispose()
  },
  methods: {
    fetchFrameworkOptions() {
      getFrameworks().then((response) => {
        const list = (response && response.data) ? response.data : []
        this.standardOptions = list.map(it => ({
          value: String(it.id),
          label: it.categoryName
        }))
        if (!this.categoryId && this.standardOptions.length) {
          this.categoryId = String(this.standardOptions[0].value)
        }
      })
    },
    handleCategoryChange() {
      this.mapPath = []
      this.selectedLevelId = ''
      this.selectedLevelName = ''
      this.levelTableData = []
      this.fetchDataView()
      this.fetchDataAssetMap()
      this.fetchLevelDistribution()
      this.fetchSensitiveData()
    },
    handleMapTileClick(item) {
      if (!item || !item.id) return
      if (!item.hasChildren) return
      this.mapPath = [...this.mapPath, { id: item.id, title: item.title }]
      this.fetchDataAssetMap(item.id)
    },
    handleMapBack() {
      const next = Array.isArray(this.mapPath) ? this.mapPath.slice(0, -1) : []
      this.mapPath = next
      const parentId = next.length ? next[next.length - 1].id : ''
      this.fetchDataAssetMap(parentId)
    },
    handleSelectLevel(level) {
      if (!level || !level.id) return
      const nextId = String(level.id)
      if (nextId === String(this.selectedLevelId)) return
      this.selectedLevelId = nextId
      this.selectedLevelName = level.name || ''
      this.fetchLevelTableData(nextId, { levelName: this.selectedLevelName })
    },
    fetchDataAssetMap(parentId = '') {
      const categoryId = this.categoryId
      if (!categoryId) {
        this.dataAssetMap = []
        return
      }
      const targetParentId = parentId || categoryId
      this.loadingCount += 1
      this.loading = true
      getLeftDataJson({
        categoryId,
        parentId: targetParentId
      }).then((response) => {
        let payload = response && response.data ? response.data : {}
        if (typeof payload === 'string') {
          try {
            payload = JSON.parse(payload)
          } catch (e) {
            payload = {}
          }
        }
        let rows = []
        if (Array.isArray(payload)) {
          rows = payload
        } else if (Array.isArray(payload.data)) {
          rows = payload.data
        } else if (Array.isArray(payload.rows)) {
          rows = payload.rows
        } else if (Array.isArray(payload.list)) {
          rows = payload.list
        }
        this.dataAssetMap = rows.map(item => {
          const rawTags = Array.isArray(item.sourceTags)
            ? item.sourceTags
            : (Array.isArray(item.labelList) ? item.labelList : [])
          const sourceTags = rawTags.map(tag => {
            if (tag && typeof tag === 'object') {
              return { label: tag.label || tag.name || tag.title || '' }
            }
            return { label: tag || '' }
          }).filter(tag => tag.label)
          return {
            id: item.id,
            title: item.title || item.name || item.categoryName || '',
            ratio: Number(item.ratio != null ? item.ratio : item.dataRatio) || 0,
            sensitiveRatio: Number(item.sensitiveRatio != null ? item.sensitiveRatio : item.sensitiveDataRatio) || 0,
            desc: item.desc || item.description || '',
            sourceTags,
            moreCount: Number(item.moreCount != null ? item.moreCount : item.more) || 0,
            hasChildren: Boolean(item.hasChildren)
          }
        })
        this.$nextTick(() => {
          this.syncMiddleBodyHeight()
        })
      }).finally(() => {
        this.loadingCount = Math.max(this.loadingCount - 1, 0)
        if (!this.loadingCount) this.loading = false
      })
    },
    initLevelChart() {
      const dom = this.$refs.levelChart
      if (!dom) return
      if (this.charts.level) this.charts.level.dispose()
      const chart = echarts.init(dom)
      this.charts.level = chart
      chart.off('click')
      chart.on('click', (params) => {
        const levels = (this.levelChartData && Array.isArray(this.levelChartData.levels)) ? this.levelChartData.levels : []
        const level = typeof params.dataIndex === 'number' ? levels[params.dataIndex] : null
        if (level) this.handleSelectLevel(level)
      })
      this.updateLevelChart()
    },
    requestLevelChartData(categoryId) {
      return getRightLevel({ categoryId })
    },
    requestLevelTableData(levelId, categoryId) {
      const raw = String(levelId)
      const matched = raw.match(/\d+/)
      const level = matched ? Number(matched[0]) : Number(levelId)
      return getRightDataJson({
        categoryId,
        level: Number.isFinite(level) ? level : levelId
      })
    },
    normalizeLevelChartData(payload) {
      let data = payload && payload.data ? payload.data : payload
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          data = {}
        }
      }
      const rawLegend = Array.isArray(data && data.levelLegend)
        ? data.levelLegend
        : (Array.isArray(data && data.sensitiveLevels) ? data.sensitiveLevels : (Array.isArray(data && data.legend) ? data.legend : []))
      const levelLegend = typeof rawLegend === 'string'
        ? rawLegend.split(/[,，;；|·]/).map(s => String(s).trim()).filter(Boolean)
        : rawLegend
      const rawLevels = Array.isArray(data && data.levels)
        ? data.levels
        : (Array.isArray(data && data.list) ? data.list : (Array.isArray(data && data.data) ? data.data : []))
      const levels = rawLevels.map((item, index) => {
        const value = Number(item.value != null ? item.value : (item.count != null ? item.count : item.num)) || 0
        const percentText = item.percent != null ? String(item.percent) : ''
        return {
          id: String(item.level != null ? item.level : (item.securityLevel != null ? item.securityLevel : (item.id || item.levelId || item.securityLevelId || item.code || index))),
          name: item.name || item.securityLevelName || item.levelName || item.label || '',
          value,
          percentText: value === 0 && percentText ? `暂无数据 ${percentText}` : percentText,
          tooltip: item.tooltip || item.tip || ''
        }
      })
      return {
        levelLegend,
        levels
      }
    },
    getDefaultLevel(levels) {
      if (!Array.isArray(levels) || !levels.length) return null
      const parsed = levels.map((item, index) => {
        const idMatch = String(item.id).match(/\d+/)
        const nameMatch = String(item.name || '').match(/^\s*(\d+)/)
        const rank = idMatch ? Number(idMatch[0]) : (nameMatch ? Number(nameMatch[1]) : null)
        return { item, index, rank: Number.isFinite(rank) ? rank : null }
      })
      parsed.sort((a, b) => {
        const ar = a.rank
        const br = b.rank
        if (ar != null && br != null) return br - ar
        if (ar != null) return -1
        if (br != null) return 1
        return a.index - b.index
      })
      const hit = parsed.find(i => (Number(i.item.value) || 0) > 0)
      return hit ? hit.item : null
    },
    fetchLevelDistribution() {
      const categoryId = this.categoryId
      if (!categoryId) {
        this.levelChartData = { levelLegend: [], levels: [] }
        this.levelTableData = []
        this.selectedLevelId = ''
        this.selectedLevelName = ''
        return Promise.resolve()
      }
      this.loadingCount += 1
      this.loading = true
      return this.requestLevelChartData(categoryId).then((response) => {
        const chartData = this.normalizeLevelChartData(response)
        this.levelChartData = chartData
        const defaultLevel = this.getDefaultLevel(chartData.levels)
        if (!defaultLevel || !defaultLevel.id) {
          this.selectedLevelId = ''
          this.selectedLevelName = ''
          this.levelTableData = []
          return null
        }
        this.selectedLevelId = String(defaultLevel.id)
        this.selectedLevelName = defaultLevel.name || ''
        return this.fetchLevelTableData(defaultLevel.id, {
          manageLoading: false,
          levelName: this.selectedLevelName
        })
      }).finally(() => {
        this.loadingCount = Math.max(this.loadingCount - 1, 0)
        if (!this.loadingCount) this.loading = false
      })
    },
    fetchLevelTableData(levelId, options = {}) {
      const { manageLoading = true, levelName = '' } = options
      if (!levelId) {
        this.levelTableData = []
        this.levelTableRowHeight = 0
        return Promise.resolve([])
      }
      if (levelName) this.selectedLevelName = levelName
      if (manageLoading) {
        this.loadingCount += 1
        this.loading = true
      }
      return this.requestLevelTableData(levelId, this.categoryId).then((response) => {
        const data = response && response.data ? response.data : response
        const list = Array.isArray(data)
          ? data
          : (Array.isArray(data && data.data) ? data.data : (Array.isArray(data && data.list) ? data.list : (Array.isArray(data && data.details) ? data.details : [])))
        const normalized = list.map((row) => {
          const rawSources = Array.isArray(row.sources)
            ? row.sources
            : (Array.isArray(row.sourceList) ? row.sourceList : (Array.isArray(row.dataSources) ? row.dataSources : []))
          const sources = rawSources.map(s => {
            if (s && typeof s === 'object') return { label: s.label || s.name || s.title || '' }
            return { label: s || '' }
          }).filter(s => s.label)
          return {
            category: row.category || row.categoryName || row.classificationName || '',
            count: Number(row.count != null ? row.count : (row.num != null ? row.num : row.total)) || 0,
            ratio: Number(row.ratio != null ? row.ratio : (row.percent != null ? row.percent : row.rate)) || 0,
            sources,
            moreCount: Number(row.moreCount != null ? row.moreCount : (row.more != null ? row.more : row.moreNum)) || 0
          }
        })
        this.levelTableData = normalized
        this.$nextTick(() => {
          this.syncLevelTableRowHeight()
        })
        return normalized
      }).finally(() => {
        if (manageLoading) {
          this.loadingCount = Math.max(this.loadingCount - 1, 0)
          if (!this.loadingCount) this.loading = false
        }
      })
    },
    syncMiddleBodyHeight() {
      const mapCard = this.$refs.assetMapCard && this.$refs.assetMapCard.$el
      const levelCard = this.$refs.levelCard && this.$refs.levelCard.$el
      if (!mapCard || !levelCard) return
      const tile = mapCard.querySelector('.asset-tile')
      if (!tile) return
      const tileHeight = tile.offsetHeight || 0
      if (!tileHeight) return
      const rows = 3
      const gap = 14
      const gridHeight = Math.max(tileHeight * rows + gap * (rows - 1), 0)
      const header1 = mapCard.querySelector('.el-card__header')
      const header2 = levelCard.querySelector('.el-card__header')
      const headerHeight = Math.max(header1 ? header1.offsetHeight : 0, header2 ? header2.offsetHeight : 0)
      const bodyPadding = 32
      this.middleBodyHeight = gridHeight
      this.middleSectionHeight = headerHeight + bodyPadding + gridHeight
      this.$nextTick(() => {
        if (this.charts.level) this.charts.level.resize()
        this.syncLevelTableRowHeight()
      })
    },
    syncLevelTableRowHeight() {
      const tableVm = this.$refs.levelTableRef
      const tableEl = tableVm && tableVm.$el
      if (!tableEl) return
      const bodyWrapper = tableEl.querySelector('.el-table__body-wrapper')
      if (!bodyWrapper) return
      const bodyHeight = bodyWrapper.clientHeight || 0
      const count = Array.isArray(this.levelTableData) ? this.levelTableData.length : 0
      if (!bodyHeight || !count) {
        this.levelTableRowHeight = 0
        return
      }
      const nextHeight = Math.floor(bodyHeight / 5)
      this.levelTableRowHeight = nextHeight
    },
    getLevelTableRowStyle() {
      if (!this.levelTableRowHeight) return {}
      return { height: `${this.levelTableRowHeight}px` }
    },
    updateLevelChart() {
      if (!this.charts.level) return
      const levels = (this.levelChartData && Array.isArray(this.levelChartData.levels)) ? this.levelChartData.levels : []
      const names = levels.map(i => i.name)
      const values = levels.map(i => Number(i.value) || 0)
      const max = this.maxLevelValue
      const getBarColor = (dataIndex) => (dataIndex === this.selectedLevelIndex ? '#5b5cf6' : '#d9dde6')
      this.charts.level.setOption({
        grid: { left: '6%', right: '12%', top: '10%', bottom: '10%', containLabel: true },
        tooltip: {
          trigger: 'item',
          formatter: (p) => {
            const item = levels[p.dataIndex] || {}
            const levelName = item.name || p.name || ''
            const value = Number(item.value != null ? item.value : p.value) || 0
            const tooltipText = item.tooltip || `${levelName}\n${value} 项 | 点击查看详情`
            return String(tooltipText).replace(/\n/g, '<br/>')
          }
        },
        xAxis: {
          type: 'value',
          max,
          splitNumber: 5,
          axisLabel: { color: '#98a2b3' },
          axisLine: { lineStyle: { color: '#eef0f6' } },
          splitLine: { lineStyle: { color: '#eef0f6' } }
        },
        yAxis: {
          type: 'category',
          data: names,
          inverse: true,
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { show: false }
        },
        series: [
          {
            type: 'bar',
            data: values,
            barWidth: 18,
            itemStyle: {
              borderRadius: [6, 6, 6, 6],
              color: (p) => getBarColor(p.dataIndex)
            },
            label: {
              show: true,
              position: [0, -18],
              distance: 0,
              align: 'left',
              verticalAlign: 'bottom',
              color: '#2c3e50',
              fontWeight: 700,
              fontSize: 12,
              formatter: (p) => p.name
            }
          },
          {
            type: 'bar',
            data: values,
            barWidth: 18,
            silent: true,
            barGap: '-100%',
            itemStyle: {
              color: 'transparent'
            },
            label: {
              show: true,
              position: 'right',
              distance: 8,
              formatter: (p) => {
                const item = levels[p.dataIndex] || {}
                const text = item.percentText || ''
                if (!text) return ''
                const key = p.dataIndex === this.selectedLevelIndex ? 'selected' : 'normal'
                return `{${key}|${text}}`
              },
              rich: {
                selected: {
                  color: '#5b5cf6',
                  fontWeight: 700,
                  fontSize: 12
                },
                normal: {
                  color: '#d9dde6',
                  fontWeight: 700,
                  fontSize: 12
                }
              }
            }
          }
        ]
      })
    },
    handleResize() {
      this.syncMiddleBodyHeight()
    },
    fetchSensitiveData() {
      const categoryId = this.categoryId
      if (!categoryId) {
        this.sensitiveData = []
        return
      }
      this.loadingCount += 1
      this.loading = true
      listSensitiveDataRiskAssessmentReport({ categoryId }).then((response) => {
        const payload = response && response.data ? response.data : {}
        const list = Array.isArray(payload.dataSourceList) ? payload.dataSourceList : []
        this.sensitiveData = list.map((it) => {
          const riskList = Array.isArray(it.riskStatistics) ? it.riskStatistics : []
          return {
            datasourceId: it.datasourceId,
            sourceName: it.sourceName,
            systemName: it.businessName,
            riskStats: riskList.map(r => ({
              label: r.securityLevelName,
              value: r.num,
              level: Number(r.securityLevel)
            })),
            dept: it.dept || it.deptName || it.securityDept || it.securityDeptName || '--',
            owner: it.ownerUserName || it.responsiblePerson || it.principal || '--'
          }
        })
      }).finally(() => {
        this.loadingCount = Math.max(this.loadingCount - 1, 0)
        if (!this.loadingCount) this.loading = false
      })
    },
    fetchDataView() {
      const categoryId = this.categoryId
      this.loadingCount += 1
      this.loading = true
      getTopDataJson({ categoryId: categoryId }).then((response) => {
        const payload = response && response.data ? response.data : {}
        let data = payload && (payload.data || payload.topDataJson || payload.result) ? (payload.data || payload.topDataJson || payload.result) : payload
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data)
          } catch (e) {
            data = {}
          }
        }
        if (!data || typeof data !== 'object') data = {}
        const toNumber = (v) => {
          const n = Number(v)
          return Number.isFinite(n) ? n : 0
        }
        const summary = data.summary || data.summaryData || data.summaryInfo || {}
        this.dataView.summary = {
          objectCount: toNumber(summary.objectCount || summary.objectNum || summary.totalObjectCount),
          capacityGB: toNumber(summary.capacityGB || summary.capacity || summary.totalCapacityGB)
        }
        const structured = data.structured || data.structuredData || {}
        this.dataView.structured = {
          sourceCount: toNumber(structured.sourceCount || structured.sourceNum || structured.count),
          sizeGB: toNumber(structured.sizeGB || structured.capacityGB || structured.size),
          fieldCount: toNumber(structured.fieldCount || structured.fieldNum || structured.fields),
          sensitiveLabel: structured.sensitiveLabel || this.dataView.structured.sensitiveLabel,
          sensitivePercent: toNumber(structured.sensitivePercent || structured.sensitiveRate || structured.percent)
        }
        const unstructured = data.unstructured || data.unstructuredData || {}
        this.dataView.unstructured = {
          sourceCount: toNumber(unstructured.sourceCount || unstructured.sourceNum || unstructured.count),
          sizeGB: toNumber(unstructured.sizeGB || unstructured.capacityGB || unstructured.size),
          fileCount: toNumber(unstructured.fileCount || unstructured.fileNum || unstructured.files),
          sensitiveLabel: unstructured.sensitiveLabel || this.dataView.unstructured.sensitiveLabel,
          sensitivePercent: toNumber(unstructured.sensitivePercent || unstructured.sensitiveRate || unstructured.percent)
        }
        const rightCards = (data.rightCards && typeof data.rightCards === 'object') ? data.rightCards : {}
        const identifyItem = rightCards.identify || {}
        const reviewItem = rightCards.review || {}
        this.dataView.rightCards = {
          identify: {
            title: identifyItem.title || '识别数量',
            value: toNumber(identifyItem.value)
          },
          review: {
            title: reviewItem.title || '审查数量',
            value: toNumber(reviewItem.value)
          }
        }
      }).finally(() => {
        this.loadingCount = Math.max(this.loadingCount - 1, 0)
        if (!this.loadingCount) this.loading = false
      })
    },
    getHomeRiskStyle(level) {
      const styles = {
        1: { color: '#16a34a', backgroundColor: '#f0fdf4', border: 'none' },
        2: { color: '#f97316', backgroundColor: '#fff7ed', border: 'none' },
        3: { color: '#c2410c', backgroundColor: '#ffedd5', border: 'none' },
        4: { color: '#dc2626', backgroundColor: '#fee2e2', border: 'none' },
        5: { color: '#7c3aed', backgroundColor: '#f3e8ff', border: 'none' }
      }
      return styles[level] || { color: '#64748b', backgroundColor: '#f8fafc', border: 'none' }
    },
    handleCompleteList(row) {
      this.$router.push({
        path: '/serverPrewies/sensitiveData',
        query: { categoryId: this.categoryId }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.cockpit {
  padding: 40px;
  background: #f5f7fb;
}

.section {
  margin-bottom: 16px;
}

.middle-section {
  height: clamp(28rem, 60vh, 42rem);
  overflow: hidden;
}

.top-section {
  align-items: stretch;
}

.top-left-row {
  height: 100%;
}

.top-col {
  display: flex;
}

.top-right-col {
  display: flex;
}

.top-right-stack {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.middle-col {
  display: flex;
  height: 100%;
  min-height: 0;
}

.middle-col>.panel-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.middle-col>.panel-card ::v-deep.el-card__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.panel-card {
  border-radius: 12px;
  border: 1px solid rgba(225, 232, 245, 0.8);
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.04);
}

.panel-card ::v-deep.el-card__body {
  padding: 16px;
}

.panel-card ::v-deep.el-card__header {
  border-bottom: none;
  padding: 14px 16px 10px;
}

.hoverable {
  transition: box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
}

.hoverable:hover {
  box-shadow: 0 10px 26px rgba(18, 27, 66, 0.10);
  border-color: rgba(171, 195, 255, 0.65);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #222;
}

.form-label {
  font-weight: 600;
  color: #26244ce0;
  font-size: 14px;
  margin-right: 10px;
}

.header-operations {
  display: flex;
  align-items: center;
}

.standard-select {
  width: 240px;
}

.top-section .panel-card ::v-deep.el-card__body {
  padding: 18px 18px 14px;
}

.top-card {
  flex: 1;
  height: 100%;
}

.top-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.top-card-icon-blue {
  background: #eef5ff;
  color: #3b82f6;
}

.top-card-icon-gray {
  background: #f4f7ff;
  color: #2c3e50;
}

.top-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #15162b;
  line-height: 1.2;
}

.top-card-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #7b879f;
}

.summary-metrics {
  margin-top: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.summary-value {
  font-size: 24px;
  font-weight: 800;
  color: #222;
  line-height: 1;
}

.summary-unit {
  font-size: 14px;
  font-weight: 700;
  margin-left: 4px;
  color: #222;
}

.summary-key {
  margin-top: 20px;
  font-size: 12px;
  color: #1f2a44;
  font-weight: 700;
}

.summary-subkey {
  margin-top: 2px;
  font-size: 12px;
  color: #90a0b7;
}

.source-main {
  margin-top: 14px;
}

.source-split {
  height: 100%;
  display: flex;
  align-items: stretch;
}

.source-pane {
  flex: 1;
  min-width: 0;
  padding: 0 1.2rem;
  display: flex;
  flex-direction: column;
}

.source-pane:first-child {
  padding-left: 0;
}

.source-pane:last-child {
  padding-right: 0;
}

.source-divider {
  width: 1px;
  background: #eef0f6;
  align-self: stretch;
  margin: 0 0.2rem;
}

.source-main-value {
  font-size: 28px;
  font-weight: 800;
  color: #15162b;
  line-height: 1;
}

.source-unit {
  font-size: 12px;
  font-weight: 700;
  margin-left: 4px;
  color: #15162b;
}

.source-arrow {
  font-size: 12px;
  margin-left: 2px;
  color: #15162b;
}

.source-sub {
  margin-top: 8px;
  font-size: 12px;
  color: #6c7a90;
}

.badge-row {
  margin-top: 12px;
}

.warn-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 18px;
  background: #fff4f4;
  color: #ff4d4f;
  font-size: 12px;
  font-weight: 700;
}

.warn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4d4f;
}

.warn-dot.orange {
  background: #c2410c;
}

.mini-stat-card {
  flex: 1;
  height: 100%;
}

.mini-stat-card ::v-deep.el-card__body {
  padding: 16px 18px;
  height: 100%;
}

.mini-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.mini-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mini-icon {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mini-svg {
  font-size: 2rem;
}

.mini-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.375rem;
  min-width: 0;
}

.mini-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2a44;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-desc {
  color: #93a3bb;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}


.mini-value {
  display: flex;
  align-items: center;
  font-size: clamp(1.5rem, 2vw, 1.875rem);
  font-weight: 800;
  color: #5b5cf6;
  line-height: 1;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 14px;
  font-weight: 800;
  color: #1f2a44;
}

.panel-path {
  margin-left: 10px;
  font-size: 12px;
  color: #3b82f6;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.map-legend {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #e7ebf5;
  border-radius: 18px;
  font-size: 12px;
  color: #1f2a44;
  font-weight: 700;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
  white-space: nowrap;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.blue {
  background: #2f63ff;
}

.legend-dot.red {
  background: #ff4d4f;
}

.asset-map-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.asset-tile-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.asset-tile {
  border: 1px solid #eef0f6;
  border-radius: 12px;
  background: #fafbff;
  padding: 14px 14px 12px;
  min-height: calc(210px - 2.9em);
  display: flex;
  flex-direction: column;
  cursor: default;
  transition: box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.asset-tile-drillable {
  cursor: pointer;
}

.asset-tile-drillable:hover {
  border-color: #a8c5ff;
  box-shadow: 0 10px 22px rgba(18, 27, 66, 0.08);
  transform: translateY(-2px);
}

.tile-title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  text-align: center;
  margin-top: 2px;
}

.tile-ratios {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 14px;
}

.tile-ratio-value {
  font-size: 14px;
  font-weight: 800;
}

.tile-blue {
  color: #2f63ff;
}

.tile-red {
  color: #ff4d4f;
}

.tile-desc {
  margin-top: 10px;
  font-size: 12px;
  color: #8a98b2;
  line-height: 1.45;
  height: calc(1.45em * 2);
  max-height: calc(1.45em * 2);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.tile-footer {
  margin-top: auto;
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  min-height: 28px;
}

.tile-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
  justify-content: center;
  width: 100%;
}

.source-tag {
  background: #eaf0ff;
  color: #2f63ff;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.more-tag {
  background: #f2f5ff;
  color: #6b7280;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  white-space: nowrap;
}

.tile-arrow {
  position: absolute;
  right: 0;
  top: 50%;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #edf2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2f63ff;
  flex-shrink: 0;
  opacity: 0;
  transform: translate(4px, -50%);
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.asset-tile-drillable:hover .tile-arrow {
  opacity: 1;
  transform: translate(0, -50%);
}

.hint-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 18px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  font-size: 12px;
  font-weight: 700;
}

.level-dist {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  height: 100%;
}

.level-bars {
  flex: 1 1 0;
  min-width: 0;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.level-chart {
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: auto;
}

.level-table {
  flex: 1 1 0;
  padding-left: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.chart-tip {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: #98a2b3;
  line-height: 1.2;
}

.level-table-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.level-table-title {
  font-size: 13px;
  font-weight: 800;
  color: #1f2a44;
}

.level-table-tag {
  background: #eaf0ff;
  color: #2f63ff;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 700;
}

.cockpit-table {
  flex: 1;
}

.cockpit-table ::v-deep.el-table {
  height: 100%;
}

.cockpit-table ::v-deep.el-table__row td {
  border-bottom: 1px solid #eef0f6;
}

.cockpit-table ::v-deep.el-table__header-wrapper th {
  border-bottom: 1px solid #eef0f6;
  color: #7b879f;
  font-weight: 700;
}

.cockpit-table ::v-deep.el-table__body tr:hover>td {
  background: #fbfcff;
}

.ratio-text {
  color: #2f63ff;
  font-weight: 800;
}

.table-sources {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.table-source-tag {
  background: #eaf0ff;
  color: #2f63ff;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  white-space: nowrap;
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.table-more-tag {
  background: #f2f5ff;
  color: #6b7280;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  white-space: nowrap;
}

.bottom-section ::v-deep.el-card__body {
  padding: 0;
}

.bottom-section ::v-deep.el-table {
  border-radius: 12px;
}

.source-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.source-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f5ff;
  color: #5b5cf6;
}

.source-link {
  font-weight: 700;
  color: #2f63ff;
}

.system-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0px 10px;
  border-radius: 14px;
  border: 1px solid #fde68a;
  background: #fff7e6;
  color: #fa8c16;
  font-size: 12px;
}

.risk-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.risk-level-tag {
  margin-right: 0;
  font-size: 12px;
  font-weight: 500;
  border: none;
}

.dept-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #7b879f;
  font-weight: 700;
}

.owner-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1f2a44;
  font-weight: 800;
}

.owner-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #2f63ff;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.action-btn {
  border-radius: 16px;
  border: 1px solid #2cc98d;
  color: #2cc98d;
  background: #f4fffb;
  font-weight: 800;
  padding: 8px 14px;
}

.action-btn:hover {
  background: #e9fff7;
  border-color: #2cc98d;
  color: #2cc98d;
}
</style>
