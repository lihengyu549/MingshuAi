<template>
  <div class="app-container" v-loading="loading">
    <div class="page-header">
      <h2><b>{{ $t('assetReport.title') }}</b></h2>
      <div class="header-operations">
        <label class="form-label">{{ $t('assetReport.standardBelong') }}</label>
        <el-select v-model="categoryId" :placeholder="$t('assetReport.standardBelong')" size="small"
          style="margin-right: 10px;">
          <el-option v-for="item in standardOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-button icon="el-icon-download" size="small" class="export-btn">
          {{ $t('assetReport.exportReport') }}
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card stat-card-blue" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">{{ $t('assetReport.dataSourceCount') }}</div>
              <count-to :start-val="0" :end-val="statsData.dataSourceCount" :duration="2000" :autoplay="true"
                class="stat-value" />
            </div>
            <div class="stat-icon stat-icon-blue">
              <i class="el-icon-coin"></i>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card stat-card-purple" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">{{ $t('assetReport.businessSystemCount') }}</div>
              <count-to :start-val="0" :end-val="statsData.businessSystemCount" :duration="2000" :autoplay="true"
                class="stat-value" />
            </div>
            <div class="stat-icon stat-icon-purple">
              <i class="el-icon-s-platform"></i>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card stat-card-green" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">{{ $t('assetReport.fieldCount') }}</div>
              <count-to :start-val="0" :end-val="statsData.fieldCount" :duration="2000" :autoplay="true"
                class="stat-value" />
            </div>
            <div class="stat-icon stat-icon-green">
              <i class="el-icon-s-grid"></i>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card stat-card-red" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">{{ $t('assetReport.fileCount') }}</div>
              <count-to :start-val="0" :end-val="statsData.fileCount" :duration="2000" :autoplay="true"
                class="stat-value" />
            </div>
            <div class="stat-icon stat-icon-red">
              <i class="el-icon-document"></i>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card" shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <span class="title-bar" style="background:#5470c6;"></span>
          {{ $t('assetReport.assetDistribution') }}
        </span>
      </div>
      <div id="assetDistributionChart" style="height: 350px;"></div>
    </el-card>

    <el-card class="chart-card" shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <span class="title-bar" style="background:#91cc75;"></span>
          {{ $t('assetReport.growthTrend') }}
        </span>
      </div>
      <div id="growthTrendChart" style="height: 350px;"></div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <span class="title-bar" style="background:#5470c6;"></span>
              {{ $t('assetReport.classificationDistribution') }}
            </span>
            <el-link type="primary" :underline="false" size="small" @click="classificationBack"
              :disabled="isClassificationRoot" class="back-link">
              {{ $t('backToParent') }}
            </el-link>
          </div>
          <div id="classificationChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <span class="title-bar" style="background:#ee6666;"></span>
              {{ $t('assetReport.dataLevelDistribution') }}
            </span>
          </div>
          <div id="levelDistributionChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card" shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <span class="title-bar" style="background:#fac858;"></span>
          {{ $t('assetReport.businessSystemLevelHeatmap') }}
        </span>
      </div>
      <div id="heatmapChart" style="height: 400px;"></div>
    </el-card>

    <el-card class="chart-card" shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <span class="title-bar" style="background:#73c0de;"></span>
          {{ $t('assetReport.businessSystemCategoryProportion') }}
        </span>
      </div>
      <div id="systemCategoryChart" style="height: 350px;"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { getSafetyComplianceReport } from '@/api/data'
import { getFrameworks } from '@/api/system/protectCategory'
import CountTo from 'vue-count-to'
export default {
  name: 'DataAssetReport',
  dicts: ['sys_normal_disable'],
  components: {
    CountTo
  },
  data() {
    return {
      loading: false,
      categoryId: '',
      standardOptions: [],
      statsData: {
        dataSourceCount: 0,
        businessSystemCount: 0,
        fieldCount: 0,
        fileCount: 0
      },
      charts: {},
      reportData: null,
      classificationTree: [],
      classificationStack: [],
      classificationCurrent: []
    };
  },
  created() {
    this.loadStatsData();
  },
  mounted() {
    this.$nextTick(() => {
      this.fetchFrameworkOptions();
      this.initCharts();
      // this.fetchReportData();
    });
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.dispose();
    });
  },
  computed: {
    isClassificationRoot() {
      return this.classificationStack.length === 0;
    }
  },
  watch: {
    categoryId() {
      this.fetchReportData();
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    loadStatsData() {
      return;
    },

    fetchFrameworkOptions() {
      getFrameworks().then((response) => {
        const list = (response && response.data) ? response.data : [];
        this.standardOptions = list.map(it => ({
          value: String(it.id),
          label: it.categoryName
        }));
        if (!this.categoryId && this.standardOptions.length) {
          this.categoryId = String(this.standardOptions[0].value);
        }
      });
    },

    fetchReportData() {
      this.loading = true;
      getSafetyComplianceReport({ categoryId: this.categoryId })
        .then(res => {
          const data = res && (res.data || res);
          if (data) this.applyReportData(data);
          this.loading = false;
        })
        .catch(() => {
          const fallback = {
            categoryId: this.categoryId,
            stats: { dataSourceCount: 0, businessSystemCount: 0, fieldCount: 0, fileCount: 0 },
            assetDistribution: { systems: [] },
            growthTrend: { x: [], fields: [], files: [] },
            classification: [],
            levelDistribution: [],
            heatmap: { levels: [], systems: [], matrix: [] },
            systemCategory: { categories: [], systems: [], series: [] }
          };
          this.applyReportData(fallback);
          this.loading = false;
        });
    },

    applyReportData(data) {
      this.reportData = data;
      if (data.stats) this.statsData = Object.assign({}, this.statsData, data.stats);
      // 支持多层分类树（最多6层），兼容旧结构
      let classificationTree = null;
      if (Array.isArray(data.classification)) {
        classificationTree = data.classification;
      } else if (data.classification && Array.isArray(data.classification.tree)) {
        classificationTree = data.classification.tree;
      } else if (data.classification && data.classification.root) {
        // 兼容旧结构：{ root: [{name,value}], children: { [name]: [...] } }
        const childrenMap = data.classification.children || {};
        const build = (list, depth = 1) => {
          if (!Array.isArray(list)) return [];
          return list.map(item => {
            const ch = childrenMap[item.name] || [];
            return {
              name: item.name,
              value: item.value,
              children: depth >= 6 ? [] : build(ch, depth + 1)
            };
          });
        };
        classificationTree = build(data.classification.root, 1);
      }
      if (classificationTree) {
        this.classificationTree = classificationTree;
        this.classificationStack = [];
        this.classificationCurrent = this.classificationTree.slice(0);
        if (this.charts.classification) this.updateClassificationChart(this.classificationCurrent);
      }
      if (data.assetDistribution && data.assetDistribution.systems && this.charts.assetDistribution) {
        const names = data.assetDistribution.systems.map(i => i.name);
        const fields = data.assetDistribution.systems.map(i => i.fields);
        const files = data.assetDistribution.systems.map(i => i.files);
        this.charts.assetDistribution.setOption({
          xAxis: { data: names },
          series: [
            { name: this.$t('assetReport.fieldQuantity'), data: fields },
            { name: this.$t('assetReport.fileQuantity'), data: files }
          ]
        });
      }
      if (data.growthTrend && this.charts.growthTrend) {
        this.charts.growthTrend.setOption({
          xAxis: { data: data.growthTrend.x || [] },
          series: [
            { name: this.$t('assetReport.cumulativeFieldCount'), data: data.growthTrend.fields || [] },
            { name: this.$t('assetReport.cumulativeFileCount'), data: data.growthTrend.files || [] }
          ]
        });
      }
      if (data.levelDistribution && this.charts.levelDistribution) {
        const seriesData = (data.levelDistribution || []).map(i => ({ name: i.level, value: i.value }));
        this.charts.levelDistribution.setOption({ series: [{ name: this.$t('assetReport.dataLevel'), data: seriesData }] });
      }
      if (data.heatmap && this.charts.heatmap) {
        const levels = data.heatmap.levels || [];
        const systems = data.heatmap.systems || [];
        const matrix = data.heatmap.matrix || [];
        const flat = [];
        for (let i = 0; i < systems.length; i++) {
          for (let j = 0; j < levels.length; j++) {
            const v = matrix[i] && matrix[i][j] ? matrix[i][j] : 0;
            flat.push([j, i, v]);
          }
        }
        let vmax = 0;
        flat.forEach(d => { if (d[2] > vmax) vmax = d[2]; });
        this.charts.heatmap.setOption({
          tooltip: {
            position: 'top',
            formatter: (p) => `${systems[p.data[1]]} - ${levels[p.data[0]]}: ${p.data[2]}`
          },
          xAxis: { data: levels },
          yAxis: { data: systems },
          visualMap: { max: vmax || 1 },
          series: [{ data: flat }]
        });
      }
      if (data.systemCategory && this.charts.systemCategory) {
        const systems = data.systemCategory.systems || [];
        const rawSeries = data.systemCategory.series || [];
        const legendNames = rawSeries.map(s => s.name);
        const series = rawSeries.map(s => ({
          name: s.name,
          type: 'bar',
          stack: 'total',
          barWidth: 15,
          data: s.data
        }));
        this.charts.systemCategory.setOption({
          legend: { data: legendNames },
          yAxis: { data: systems },
          series
        });
      }
    },

    initCharts() {
      this.initAssetDistributionChart();
      this.initGrowthTrendChart();
      this.initClassificationChart();
      this.initLevelDistributionChart();
      this.initHeatmapChart();
      this.initSystemCategoryChart();
    },

    // 数据资产分布 - 柱状图
    initAssetDistributionChart() {
      const dom = document.getElementById('assetDistributionChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      this.charts.assetDistribution = chart;
      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: [this.$t('assetReport.fieldQuantity'), this.$t('assetReport.fileQuantity')], top: 10, icon: 'roundRect' },
        grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
        xAxis: {
          type: 'category',
          data: [],
          axisLine: { lineStyle: { color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          name: this.$t('assetReport.quantity'),
          nameTextStyle: { color: '#999', padding: [0, 20, 0, 0] },
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        series: [
          {
            name: this.$t('assetReport.fieldQuantity'),
            type: 'bar',
            barWidth: 15,
            itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
            data: []
          },
          {
            name: this.$t('assetReport.fileQuantity'),
            type: 'bar',
            barWidth: 15,
            itemStyle: { color: '#8bb4f6', borderRadius: [4, 4, 0, 0] },
            data: []
          }
        ]
      });
    },

    // 数据增长趋势 - 折线图
    initGrowthTrendChart() {
      const dom = document.getElementById('growthTrendChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      this.charts.growthTrend = chart;
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: {
          data: [this.$t('assetReport.cumulativeFieldCount'), this.$t('assetReport.cumulativeFileCount')],
          top: 10,
          icon: 'emptyCircle'
        },
        grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          axisLine: { lineStyle: { color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          name: this.$t('assetReport.quantity'),
          nameTextStyle: { color: '#999', padding: [0, 20, 0, 0] },
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        series: [
          {
            name: this.$t('assetReport.cumulativeFieldCount'),
            type: 'line',
            symbol: 'emptyCircle',
            symbolSize: 6,
            data: [],
            areaStyle: { color: 'rgba(59, 130, 246, 0.1)' },
            itemStyle: { color: '#3b82f6' }
          },
          {
            name: this.$t('assetReport.cumulativeFileCount'),
            type: 'line',
            symbol: 'emptyCircle',
            symbolSize: 6,
            data: [],
            areaStyle: { color: 'rgba(139, 180, 246, 0.1)' },
            itemStyle: { color: '#8bb4f6' }
          }
        ]
      });
    },

    initClassificationChart() {
      const dom = document.getElementById('classificationChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      this.charts.classification = chart;
      this.classificationStack = [];
      this.classificationCurrent = (this.classificationTree || []).slice(0);
      this.updateClassificationChart(this.classificationCurrent);
      chart.off('click');
      chart.on('click', (params) => {
        const name = params.name;
        const node = (this.classificationCurrent || []).find(n => n.name === name);
        const children = node && Array.isArray(node.children) ? node.children : [];
        if (!children || children.length === 0) return;
        this.classificationStack.push(this.classificationCurrent.slice(0));
        this.classificationCurrent = children.slice(0);
        this.updateClassificationChart(this.classificationCurrent);
      });
    },

    updateClassificationChart(list) {
      const names = list.slice(0, 5).map(i => i.name);
      const values = list.slice(0, 5).map(i => i.value);
      this.charts.classification.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '8%', bottom: '5%', top: '5%', containLabel: true },
        xAxis: {
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          type: 'category',
          inverse: true,
          data: names,
          axisLine: { lineStyle: { color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        series: [
          {
            name: this.$t('assetReport.dataVolume'),
            type: 'bar',
            barWidth: 15,
            itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] },
            label: { show: true, position: 'right', color: '#666' },
            data: values
          }
        ]
      });
    },

    classificationBack() {
      if (this.classificationStack.length > 0) {
        this.classificationCurrent = this.classificationStack.pop();
        this.updateClassificationChart(this.classificationCurrent);
      }
    },

    // 数据分级分布 - 环形饼图
    initLevelDistributionChart() {
      const dom = document.getElementById('levelDistributionChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      this.charts.levelDistribution = chart;
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: '5%', top: 'center', icon: 'roundRect' },
        series: [
          {
            name: this.$t('assetReport.dataLevel'),
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
            label: { show: true, formatter: '{b}' },
            data: []
          }
        ]
      });
    },

    // 业务系统分级热力图
    initHeatmapChart() {
      const dom = document.getElementById('heatmapChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      this.charts.heatmap = chart;

      const levels = [];
      const systems = [];
      const data = [];

      chart.setOption({
        tooltip: {
          position: 'top',
          formatter: (p) => `${systems[p.data[1]]} - ${levels[p.data[0]]}: ${p.data[2]}`
        },
        grid: { top: '5%', left: '10%', right: '5%', bottom: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: levels,
          splitArea: { show: true },
          axisLine: { lineStyle: { color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          type: 'category',
          data: systems,
          splitArea: { show: true },
          axisLine: { lineStyle: { color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        visualMap: {
          min: 0,
          max: 350,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%',
          itemWidth: 15,
          inRange: {
            color: ['#fee2e2', '#fca5a5', '#ef4444', '#b91c1c']
          }
        },
        series: [
          {
            name: this.$t('assetReport.dataVolume'),
            type: 'heatmap',
            data: data,
            label: { show: true, color: '#333' },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.4)' }
            }
          }
        ]
      });
    },

    // 业务系统分类占比 - 堆叠条形图
    initSystemCategoryChart() {
      const dom = document.getElementById('systemCategoryChart');
      if (!dom) return;
      const chart = echarts.init(dom);
      this.charts.systemCategory = chart;

      const categories = [];
      const systems = [];

      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: categories, top: 10, icon: 'roundRect' },
        grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
        xAxis: {
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          type: 'category',
          inverse: true,
          data: systems,
          axisLine: { lineStyle: { color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        series: []
      });
    },

    handleResize() {
      Object.values(this.charts).forEach(chart => {
        if (chart) chart.resize();
      });
    }
  }
};
</script>

<style scoped>
.app-container {
  padding: 40px;
  height: 100%;
}

/* ===== 页面头部 ===== */
.form-label {
  font-weight: 600;
  color: #26244ce0;
  font-size: 14px;
  margin-right: 10px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eaeaea;
}

.page-header h2 {
  color: #333;
  font-size: 20px;
  margin: 0;
}

.header-operations {
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-btn {
  border-radius: 8px;
  border-color: #d0d5e8;
  color: #555;
  font-weight: 600;
}

.export-btn {
  background-color: #3b82f6;
  color: #fff;
  font-weight: 600;
  border-radius: 8px;
  border-color: #3b82f6;
}

/* ===== 统计卡片 ===== */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  border: none;
}

.stat-card-blue {
  background: linear-gradient(135deg, #e8f0fe 0%, #dce8fd 100%);
}

.stat-card-purple {
  background: linear-gradient(135deg, #f0e8fe 0%, #e8dcfd 100%);
}

.stat-card-green {
  background: linear-gradient(135deg, #e8fef0 0%, #dcfde8 100%);
}

.stat-card-red {
  background: linear-gradient(135deg, #fee8e8 0%, #fddcdc 100%);
}

.stat-card>>>.el-card__body {
  padding: 18px 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: #222;
  line-height: 1;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.stat-icon-blue {
  background: #4f7cff;
  color: #fff;
}

.stat-icon-purple {
  background: #8b5cf6;
  color: #fff;
}

.stat-icon-green {
  background: #22c55e;
  color: #fff;
}

.stat-icon-red {
  background: #ef4444;
  color: #fff;
}

/* ===== 图表卡片 ===== */
.chart-card {
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #eef0f6;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  gap: 8px;
}

.title-bar {
  display: inline-block;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}

.back-link {
  font-size: 12px;
  padding: 2px 10px;
  background: #f0f5ff;
  border-radius: 6px;
  border: 1px solid #d0dcf5;
}

.form-label {
  font-weight: 600;
  color: #26244ce0;
  font-size: 14px;
  margin-right: 10px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
}

.page-header h2 {
  color: #333;
  font-size: 20px;
  margin: 0;
}

.header-operations {
  display: flex;
  align-items: center;
}

.export-btn {
  margin-left: 0;
  background-color: #3b82f6;
  color: #fff;
  font-weight: 600;
  border-radius: 8px;
}
</style>
