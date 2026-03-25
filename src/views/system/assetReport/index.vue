<template>
  <div class="app-container">
    <div class="page-header">
      <h2><b>安全合规报告</b></h2>
      <div class="header-operations">
        <!-- 所属标准下拉框 -->
        <label class="form-label">所属标准</label>
        <el-select v-model="categoryId" placeholder="所属标准" size="small" style="margin-right: 10px;">
          <el-option v-for="item in standardOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <!-- 导出报告按钮 -->
        <el-button icon="el-icon-download" size="small" class="export-btn">
          导出报告
        </el-button>
      </div>
    </div>

    <!-- ========== 统计卡片区域 ========== -->
    <el-row :gutter="20" class="stats-row">
      <!-- 数据源总数 -->
      <el-col :span="6">
        <el-card class="stat-card stat-card-blue" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">数据源总数</div>
              <count-to :start-val="0" :end-val="statsData.dataSourceCount" :duration="2000" :autoplay="true" class="stat-value" />
            </div>
            <div class="stat-icon stat-icon-blue">
              <i class="el-icon-coin"></i>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 业务系统数量 -->
      <el-col :span="6">
        <el-card class="stat-card stat-card-purple" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">业务系统数量</div>
              <count-to :start-val="0" :end-val="statsData.businessSystemCount" :duration="2000" :autoplay="true" class="stat-value" />
            </div>
            <div class="stat-icon stat-icon-purple">
              <i class="el-icon-s-platform"></i>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 字段总数 -->
      <el-col :span="6">
        <el-card class="stat-card stat-card-green" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">字段总数</div>
              <count-to :start-val="0" :end-val="statsData.fieldCount" :duration="2000" :autoplay="true" class="stat-value" />
            </div>
            <div class="stat-icon stat-icon-green">
              <i class="el-icon-s-grid"></i>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 文件总数 -->
      <el-col :span="6">
        <el-card class="stat-card stat-card-red" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-label">文件总数</div>
              <count-to :start-val="0" :end-val="statsData.fileCount" :duration="2000" :autoplay="true" class="stat-value" />
            </div>
            <div class="stat-icon stat-icon-red">
              <i class="el-icon-document"></i>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ========== 数据资产分布 ========== -->
    <el-card class="chart-card" shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <span class="title-bar" style="background:#5470c6;"></span>
          数据资产分布
        </span>
      </div>
      <div id="assetDistributionChart" style="height: 350px;"></div>
    </el-card>

    <!-- ========== 数据增长趋势 ========== -->
    <el-card class="chart-card" shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <span class="title-bar" style="background:#91cc75;"></span>
          数据增长趋势
        </span>
      </div>
      <div id="growthTrendChart" style="height: 350px;"></div>
    </el-card>

    <!-- ========== 数据分类分布 + 数据分级分布 ========== -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <span class="title-bar" style="background:#5470c6;"></span>
              数据分类分布
            </span>
            <el-link type="primary" :underline="false" size="small" @click="classificationBack" :disabled="isClassificationRoot" class="back-link">
              返回上级
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
              数据分级分布
            </span>
          </div>
          <div id="levelDistributionChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ========== 业务系统分级热力图 ========== -->
    <el-card class="chart-card" shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <span class="title-bar" style="background:#fac858;"></span>
          业务系统分级热力图
        </span>
      </div>
      <div id="heatmapChart" style="height: 400px;"></div>
    </el-card>

    <!-- ========== 业务系统分类占比 ========== -->
    <el-card class="chart-card" shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <span class="title-bar" style="background:#73c0de;"></span>
          业务系统分类占比
        </span>
      </div>
      <div id="systemCategoryChart" style="height: 350px;"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import CountTo from 'vue-count-to'
export default {
  name: 'DataAssetReport',
  dicts: ['sys_normal_disable'],
  components: {
    CountTo
  },
  data() {
    return {
      categoryId: '',
      standardOptions: [
        { value: '1', label: '国家标准' },
        { value: '2', label: '行业标准' },
        { value: '3', label: '企业标准' },
      ],
      statsData: {
        dataSourceCount: 6,
        businessSystemCount: 9,
        fieldCount: 5585,
        fileCount: 3140
      },
      charts: {},
      classificationRoot: [
        { name: '个人信息', value: 920 },
        { name: '交易数据', value: 760 },
        { name: '行为数据', value: 610 },
        { name: '设备信息', value: 420 },
        { name: '运维日志', value: 350 },
        { name: '监控指标', value: 300 },
        { name: '配置数据', value: 260 }
      ],
      classificationChildren: {
        '个人信息': [
          { name: '姓名', value: 240 },
          { name: '身份证', value: 210 },
          { name: '联系方式', value: 180 },
          { name: '住址', value: 150 },
          { name: '账户', value: 140 },
          { name: '人脸', value: 120 }
        ],
        '交易数据': [
          { name: '订单', value: 220 },
          { name: '支付', value: 200 },
          { name: '退款', value: 160 },
          { name: '对账', value: 100 },
          { name: '发票', value: 80 },
          { name: '结算', value: 70 }
        ],
        '行为数据': [
          { name: '点击', value: 180 },
          { name: '浏览', value: 160 },
          { name: '搜索', value: 120 },
          { name: '收藏', value: 90 },
          { name: '分享', value: 60 },
          { name: '下载', value: 50 }
        ],
        '设备信息': [
          { name: '设备ID', value: 150 },
          { name: '操作系统', value: 110 },
          { name: '浏览器', value: 80 },
          { name: '分辨率', value: 50 },
          { name: '网络', value: 30 },
          { name: '位置信息', value: 25 }
        ],
        '运维日志': [
          { name: '应用日志', value: 140 },
          { name: '访问日志', value: 110 },
          { name: '安全日志', value: 60 },
          { name: '错误日志', value: 25 },
          { name: '审计日志', value: 15 },
          { name: '系统日志', value: 10 }
        ],
        '监控指标': [
          { name: 'CPU', value: 90 },
          { name: '内存', value: 80 },
          { name: '磁盘', value: 60 },
          { name: '网络', value: 40 },
          { name: 'IO', value: 30 },
          { name: '延迟', value: 20 }
        ],
        '配置数据': [
          { name: '参数', value: 120 },
          { name: '开关', value: 70 },
          { name: '映射', value: 30 },
          { name: '规则', value: 25 },
          { name: '策略', value: 15 },
          { name: '模板', value: 10 }
        ]
      },
      classificationStack: [],
      classificationCurrent: []
    };
  },
  created() {
    this.loadStatsData();
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
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
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    loadStatsData() {
      return;
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
        legend: { data: ['字段数量', '文件数量'], top: 10, icon: 'roundRect' },
        grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['客户中心库', '订单交易库', '支付结算库', '营销活动库', '风控审计库', '日志分析库'],
          axisLine: { lineStyle: { color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        yAxis: { 
          name: '数量',
          nameTextStyle: { color: '#999', padding: [0, 20, 0, 0] },
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        series: [
          {
            name: '字段数量',
            type: 'bar',
            barWidth: 15,
            itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
            data: [1580, 1230, 980, 760, 620, 410]
          },
          {
            name: '文件数量',
            type: 'bar',
            barWidth: 15,
            itemStyle: { color: '#8bb4f6', borderRadius: [4, 4, 0, 0] },
            data: [850, 690, 520, 450, 380, 240]
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
        legend: { data: ['累计字段数量', '累计文件数量'], top: 10, icon: 'emptyCircle' },
        grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
          axisLine: { lineStyle: { color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        yAxis: { 
          name: '数量',
          nameTextStyle: { color: '#999', padding: [0, 20, 0, 0] },
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#eef0f6' } },
          axisLabel: { color: '#666' }
        },
        series: [
          {
            name: '累计字段数量',
            type: 'line',
            symbol: 'emptyCircle',
            symbolSize: 6,
            data: [4200, 5000, 5600, 6500, 7300, 8200],
            areaStyle: { color: 'rgba(59, 130, 246, 0.1)' },
            itemStyle: { color: '#3b82f6' }
          },
          {
            name: '累计文件数量',
            type: 'line',
            symbol: 'emptyCircle',
            symbolSize: 6,
            data: [2050, 2300, 2500, 2750, 3000, 3300],
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
      this.classificationCurrent = this.classificationRoot.slice(0);
      this.updateClassificationChart(this.classificationCurrent);
      chart.off('click');
      chart.on('click', (params) => {
        const name = params.name;
        const children = this.classificationChildren[name];
        if (children && children.length) {
          this.classificationStack.push(this.classificationCurrent.slice(0));
          this.classificationCurrent = children.slice(0);
          this.updateClassificationChart(this.classificationCurrent);
        }
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
            name: '数据量',
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
            name: '数据分级',
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
            label: { show: true, formatter: '{b}' },
            data: [
              { value: 1048, name: '1级 (公开)', itemStyle: { color: '#bbf7d0' } },
              { value: 735, name: '2级 (内部)', itemStyle: { color: '#fcd34d' } },
              { value: 580, name: '3级 (敏感)', itemStyle: { color: '#fbbf24' } },
              { value: 484, name: '4级 (重要)', itemStyle: { color: '#fca5a5' } },
              { value: 300, name: '5级 (核心)', itemStyle: { color: '#f87171' } }
            ]
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

      const levels = ['1级', '2级', '3级', '4级', '5级'];
      const systems = ['日志分析库', '风控审计库', '营销活动库', '支付结算库', '订单交易库', '客户中心库'];
      const rawData = [
        [130, 210, 170, 80, 20],
        [65, 120, 170, 140, 90],
        [95, 180, 200, 110, 35],
        [80, 160, 220, 130, 40],
        [100, 190, 260, 140, 45],
        [120, 240, 310, 150, 60]
      ];
      const data = [];
      for (let i = 0; i < systems.length; i++) {
        for (let j = 0; j < levels.length; j++) {
          data.push([j, i, rawData[i][j]]);
        }
      }

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
            name: '数据量',
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
      
      const categories = ['个人信息类', '交易类', '行为类', '日志类', '主数据类'];
      const systems = ['日志分析库', '风控审计库', '营销活动库', '支付结算库', '订单交易库', '客户中心库'];
      
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
        series: [
          {
            name: '个人信息类',
            type: 'bar',
            stack: 'total',
            barWidth: 15,
            itemStyle: { color: '#dbeafe' },
            data: [35, 45, 110, 30, 70, 220]
          },
          {
            name: '交易类',
            type: 'bar',
            stack: 'total',
            barWidth: 15,
            itemStyle: { color: '#bfdbfe' },
            data: [20, 55, 60, 210, 280, 80]
          },
          {
            name: '行为类',
            type: 'bar',
            stack: 'total',
            barWidth: 15,
            itemStyle: { color: '#93c5fd' },
            data: [110, 65, 180, 110, 140, 90]
          },
          {
            name: '日志类',
            type: 'bar',
            stack: 'total',
            barWidth: 15,
            itemStyle: { color: '#60a5fa' },
            data: [260, 215, 60, 90, 90, 55]
          },
          {
            name: '主数据类',
            type: 'bar',
            stack: 'total',
            barWidth: 15,
            itemStyle: { color: '#3b82f6' },
            data: [25, 40, 35, 50, 55, 50]
          }
        ]
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
