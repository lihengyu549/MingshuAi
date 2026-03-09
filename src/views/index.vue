<template>
  <div class="app-container">
    <!-- 上方四个卡片 -->
    <div class="top-cards-wrapper">
      <el-card class="stat-card card1" shadow="hover">
        <div class="card-header-top">
          <div class="icon-wrapper dataAsset">
            <svg-icon icon-class="home-dataAsset" style="font-size: 24px;"></svg-icon>
          </div>
          <svg-icon icon-class="home-dataAsset-c" style="font-size: 58px; color: #e8eefb;"></svg-icon>
        </div>
        <p class="card-label">数据资产分布</p>
        <div class="card-metrics">
          <div class="metric-item dataAsset">
            <span class="metric-key">数据表</span>
            <count-to :start-val="0" :end-val="cardData.dataTable" :duration="2000" class="metric-value" />
          </div>
          <div class="metric-item dataAsset">
            <span class="metric-key">文件数</span>
            <count-to :start-val="0" :end-val="cardData.fileNum" :duration="2000" class="metric-value" />
          </div>
        </div>
        <div class="scan-progress-wrapper">
          <el-progress :percentage="cardData.scanPercentage" :show-text="false" />
          <div class="scan-progress-text">
            <span class="scan-label">扫描进度</span>
            <span class="scan-percentage">{{ cardData.scanPercentage }}%</span>
          </div>
        </div>
      </el-card>

      <!-- 卡片2：敏感数据库 -->
      <el-card class="stat-card card2" shadow="hover">
        <div class="card-header-top">
          <div class="icon-wrapper sensitiveData">
            <svg-icon icon-class="home-sensitiveData" style="font-size: 24px;"></svg-icon>
          </div>
          <svg-icon icon-class="home-sensitiveData-c" style="font-size: 58px; color: #f4eafd;"></svg-icon>
        </div>
        <p class="card-label">敏感数据库 (L3/L4)</p>
        <div class="card-metrics">
          <div class="metric-item sensitiveData">
            <span class="metric-key">敏感字段</span>
            <count-to :start-val="0" :end-val="cardData.sensitiveField" :duration="2000" class="metric-value" />
          </div>
          <div class="metric-item sensitiveData">
            <span class="metric-key">敏感文件</span>
            <count-to :start-val="0" :end-val="cardData.sensitiveFile" :duration="2000" class="metric-value" />
          </div>
        </div>
        <div class="card-description">占总资产约：{{ cardData.assetRatio }}%</div>
      </el-card>

      <!-- 卡片3：AI自动化归档 -->
      <el-card class="stat-card card3" shadow="hover">
        <div class="card-header-top">
          <div class="icon-wrapper aiAuto">
            <svg-icon icon-class="home-aiAuto" style="font-size: 24px;"></svg-icon>
          </div>
          <svg-icon icon-class="home-aiAuto-c" style="font-size: 58px; color: #e8eefb;"></svg-icon>
        </div>
        <p class="card-label">AI 自动化归档</p>
        <div class="card-metrics">
          <div class="metric-item aiAuto">
            <span class="metric-key">覆盖率</span>
            <count-to :start-val="0" :end-val="cardData.aiCoverage" :duration="2000" class="metric-value" />
          </div>
          <div class="metric-item aiAuto">
            <span class="metric-key">节省工时</span>
            <count-to :start-val="0" :end-val="cardData.aiSaveTime" :duration="2000" class="metric-value" />
          </div>
        </div>
        <div class="card-description">人工分析单条数据约3-10分钟，AI分析仅10-60秒</div>
      </el-card>

      <!-- 卡片4：资计分析资产 -->
      <el-card class="stat-card card4" shadow="hover">
        <div class="card-header-top">
          <div class="icon-wrapper analysis">
            <svg-icon icon-class="home-analysis" style="font-size: 24px;"></svg-icon>
          </div>
          <svg-icon icon-class="home-analysis-c" style="font-size: 58px; color: #f9f0e5;"></svg-icon>
        </div>
        <p class="card-label">资计分析资产</p>
        <div class="card-metrics">
          <div class="metric-item analysis">
            <span class="metric-key">字段</span>
            <count-to :start-val="0" :end-val="cardData.analysisField" :duration="2000" class="metric-value" />
          </div>
          <div class="metric-item analysis">
            <span class="metric-key">文件</span>
            <count-to :start-val="0" :end-val="cardData.analysisFile" :duration="2000" class="metric-value" />
          </div>
        </div>
        <div class="card-description">高置信度 {{ cardData.analysisConfidence }}% · 人工复核 {{ cardData.analysisReview }}%</div>
      </el-card>
    </div>

    <!-- 下方两个大卡片 -->
    <div class="bottom-cards-wrapper">
      <el-row :gutter="16" style="height: 100%;">
        <!-- 左侧：任务监控 -->
        <el-col :xs="24" :lg="16" style="height: 100%; margin-bottom: 0;">
          <el-card class="monitor-card" shadow="hover">
            <div slot="header" class="monitor-header">
              <span class="monitor-title">
                <svg-icon icon-class="home-taskIcon" style="font-size: 22px;"></svg-icon>
                任务监控
              </span>
              <span class="header-link">实时流传输中</span>
            </div>

            <div class="monitor-content">
              <!-- 左侧：表格和步骤 -->
              <div class="monitor-left">
                <!-- 表格部分 -->
                <div class="table-section">
                  <h4 class="section-title">正在处理的表</h4>
                  <div class="table-item-wrapper">
                    <transition name="slide-up" mode="out-in">
                      <span :key="taskMonitor.currentTableIndex" class="table-item-name">{{ taskMonitor.tableNames[taskMonitor.currentTableIndex] }}</span>
                    </transition>
                    <span class="table-dot"></span>
                  </div>
                </div>

                <!-- 步骤部分 -->
                <div class="steps-section">
                  <div class="steps-wrapper">
                    <div class="step-item">
                      <div class="step-item-content">
                        <i :class="['step-icon', taskMonitor.taskSteps.step1.icon, taskMonitor.taskSteps.step1.iconClass]"></i>
                        <div class="step-text-wrapper">
                          <span class="step-text-main">{{ taskMonitor.taskSteps.step1.textMain }}</span>
                          <span class="step-text-sub">{{ taskMonitor.taskSteps.step1.textSub }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="step-item">
                      <div class="step-item-content">
                        <i :class="['step-icon', taskMonitor.taskSteps.step2.icon, taskMonitor.taskSteps.step2.iconClass]"></i>
                        <div class="step-text-wrapper">
                          <span class="step-text-main">{{ taskMonitor.taskSteps.step2.textMain }}</span>
                          <span class="step-text-sub">{{ taskMonitor.taskSteps.step2.textSub }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="step-item">
                      <div class="step-item-content">
                        <i :class="['step-icon', taskMonitor.taskSteps.step3.icon, taskMonitor.taskSteps.step3.iconClass]"></i>
                        <div class="step-text-wrapper">
                          <span class="step-text-main">{{ taskMonitor.taskSteps.step3.textMain }}</span>
                          <span class="step-text-sub">{{ taskMonitor.taskSteps.step3.textSub }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="step-item">
                      <div class="step-item-content">
                        <i :class="['step-icon', taskMonitor.taskSteps.step4.icon, taskMonitor.taskSteps.step4.iconClass]"></i>
                        <div class="step-text-wrapper">
                          <span class="step-text-main">{{ taskMonitor.taskSteps.step4.textMain }}</span>
                          <span class="step-text-sub">{{ taskMonitor.taskSteps.step4.textSub }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="step-item">
                      <div class="step-item-content">
                        <i :class="['step-icon', taskMonitor.taskSteps.step5.icon, taskMonitor.taskSteps.step5.iconClass]"></i>
                        <div class="step-text-wrapper">
                          <span class="step-text-main">{{ taskMonitor.taskSteps.step5.textMain }}</span>
                          <span class="step-text-sub">{{ taskMonitor.taskSteps.step5.textSub }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="step-item">
                      <div class="step-item-content">
                        <i :class="['step-icon', taskMonitor.taskSteps.step6.icon, taskMonitor.taskSteps.step6.iconClass]"></i>
                        <div class="step-text-wrapper">
                          <span class="step-text-main">{{ taskMonitor.taskSteps.step6.textMain }}</span>
                          <span class="step-text-sub">{{ taskMonitor.taskSteps.step6.textSub }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右侧：进度条和时间轴 -->
              <div class="monitor-right">
                <!-- 进度条部分 -->
                <div class="progress-section" style="flex-shrink: 0; display: flex; flex-direction: column;">
                  <div class="progress-box">
                    <span class="progress-title">整体进度</span>
                    <span class="progress-info">{{ taskMonitor.progressCurrent }}/{{ taskMonitor.progressTotal }} ({{ taskMonitor.progressPercent }}%)</span>
                  </div>
                  <el-progress :percentage="taskMonitor.progressPercent" color="#409EFF" :show-text="false" :stroke-width="12"></el-progress>
                </div>

                <!-- 时间轴部分 -->
                <div class="timeline-section">
                  <div class="timeline-wrapper">
                    <div v-for="(item, index) in displayTimelineData" :key="index" class="timeline-item">
                      <div class="timeline-dot" :class="{ 'timeline-dot-active': item.isActive }">
                        <i v-if="item.isActive" class="el-icon-loading"></i>
                      </div>
                      <div class="timeline-connector" v-if="index < displayTimelineData.length - 1"></div>
                      <div class="timeline-text-wrapper">
                        <span class="timeline-text">{{ item.text }}</span>
                        <span v-if="item.time" class="timeline-time">{{ item.time }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：任务队列 -->
        <el-col :xs="24" :lg="8" style="height: 100%; margin-bottom: 0;">
          <el-card class="queue-card" shadow="hover">
            <div slot="header" class="queue-header">
              <span class="queue-title">
                任务队列
              </span>
            </div>

            <div class="queue-body-wrapper">
              <div class="queue-content">
                <div class="queue-item" v-for="(item, index) in queueData" :key="index">
                  <div class="queue-item-header">
                    <span class="queue-item-title">{{ item.title }}</span>
                    <el-tag :type="item.status" size="small" style="border: none; border-radius: 10px;">{{ item.statusText }}</el-tag>
                  </div>
                  <span class="queue-item-info">{{ item.infoLabel }}：{{ item.infoValue }}</span>
                </div>
              </div>
              <el-button type="text" class="queue-footer" @click="seeAll">查看全部结果</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  name: 'Dashboard',
  components: {
    CountTo
  },
  data() {
    return {
      cardData: {
        scanPercentage: 50,
        dataTable: 5809,
        fileNum: 12400,
        sensitiveField: 24900,
        sensitiveFile: 3210,
        assetRatio: 18.2,
        aiCoverage: 98.5,
        aiSaveTime: 3400,
        analysisField: 8321,
        analysisFile: 1560,
        analysisConfidence: 80,
        analysisReview: 20
      },
      taskMonitor: {
        tableNames: ['vehicle_telemetry', 'user_behavior_log', 'transaction_record'],
        currentTableIndex: 0,
        progressCurrent: 2,
        progressTotal: 3,
        progressPercent: 66,
        taskSteps: {
          step1: { icon: 'skip-icon', iconClass: 'el-icon-circle-close', textMain: '数据识别', textSub: '2024-01-15 10:30:00' },
          step2: { icon: 'success-icon', iconClass: 'el-icon-circle-check', textMain: '值质量检查', textSub: '2024-01-15 10:31:00' },
          step3: { icon: 'skip-icon', iconClass: 'el-icon-circle-close', textMain: '数据检测', textSub: '2024-01-15 10:32:00' },
          step4: { icon: 'success-icon', iconClass: 'el-icon-circle-check', textMain: 'AI 分析打标', textSub: '2024-01-15 10:33:00' },
          step5: { icon: 'processing-icon', iconClass: 'el-icon-loading', textMain: '个人信息匹配', textSub: '正在处理...' },
          step6: { icon: 'skip-icon', iconClass: 'el-icon-circle-close', textMain: '样本特征提取', textSub: '等待中' }
        },
        timelineData: [
          { text: '喀音数据过滤字段数量', time: '2024-01-15 10:30:00' },
          { text: '命中匹配规则字段数量', time: '2024-01-15 10:31:00' },
          { text: '语义填充情况', time: '2024-01-15 10:32:00' },
          { text: '分类情况', time: '2024-01-15 10:33:00' },
          { text: '样本特征提取数量', time: '2024-01-15 10:34:00' }
        ]
      },
      isConnected: false,
      ws: null,
      queueData: [
        { title: '敏感字段查询检', status: 'warning', statusText: '执行中', infoLabel: '字段信息', infoValue: 128 },
        { title: '未脱敏检查', status: 'success', statusText: '执行完成', infoLabel: '字段信息', infoValue: 45 },
        { title: '数据导出审批', status: 'info', statusText: '等待中', infoLabel: '字段信息', infoValue: 0 },
        { title: '异常行为分析', status: 'info', statusText: '等待中', infoLabel: '字段数量', infoValue: '50GB' },
        { title: 'API权限审计', status: 'info', statusText: '等待中', infoLabel: '字段数量', infoValue: 12 }
      ]
    }
  },
  computed: {
    displayTimelineData() {
      if (this.isConnected) {
        return [...this.taskMonitor.timelineData, { text: '正在执行中...', time: '', isActive: true }]
      }
      return this.taskMonitor.timelineData
    }
  },
  mounted() {
    // this.startTableRotation()
    // this.connectWebSocket()
  },
  beforeDestroy() {
    // this.stopTableRotation()
    // this.disconnectWebSocket()
  },
  methods: {
    seeAll() {
      this.$router.push({
        path: 'classificationTask/hierarchicalTask',
      })
    },
    startTableRotation() {
      this.tableTimer = setInterval(() => {
        this.taskMonitor.currentTableIndex = (this.taskMonitor.currentTableIndex + 1) % this.taskMonitor.tableNames.length
      }, 3000)
    },
    stopTableRotation() {
      if (this.tableTimer) {
        clearInterval(this.tableTimer)
      }
    },
    connectWebSocket() {
      this.ws = new WebSocket('ws://localhost:8080/ws/dashboard')
      this.ws.onopen = () => {
        this.isConnected = true
      }
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'cardData') {
          this.cardData = data.value
        } else if (data.type === 'timeline') {
          this.taskMonitor.timelineData = data.value
        } else if (data.type === 'currentStep') {
          this.taskMonitor.timelineData.push({
            text: '正在执行中...',
            time: '',
            isActive: true
          })
        }
      }
      this.ws.onclose = () => {
        this.isConnected = false
      }
      this.ws.onerror = () => {
        this.isConnected = false
      }
    },
    disconnectWebSocket() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }
    }
  }
}
</script>

<style scoped>
/* ========== 上方四个卡片样式 ========== */
.top-cards-wrapper {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-card {
  width: 24%;
  transition: all 0.3s ease;
  border-radius: 10px;
}

.stat-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
}

.stat-card .svg-icon {
  transition: color 0.3s ease;
}

.card1:hover .svg-icon {
  color: #d4e4fc !important;
}

.card2:hover .svg-icon {
  color: #e8d4fb !important;
}

.card3:hover .svg-icon {
  color: #d4e4fc !important;
}

.card4:hover .svg-icon {
  color: #f5e3cd !important;
}

.stat-card /deep/ .el-card__header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.stat-card /deep/ .el-card__body {
  padding: 20px;
}

.card-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 8px;
}

.dataAsset {
  background: #eff6ff;
}

.sensitiveData {
  background: #faf5ff;
}

.aiAuto {
  background: #eff6ff;
}

.analysis {
  background: #fff7ed;
}

.card-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.card-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.metric-item {
  padding: 10px 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-key {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.card-description {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.scan-progress-wrapper {
  width: 100%;
}

.scan-progress-wrapper .el-progress {
  width: 100%;
}

.scan-progress-wrapper .el-progress-bar__outer {
  border-radius: 4px;
}

.scan-progress-wrapper .el-progress-bar__inner {
  border-radius: 4px;
}

.scan-progress-text {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
}

.scan-label {
  color: #606266;
}

.scan-percentage {
  color: #303133;
  font-weight: 500;
}

/* ========== 下方卡片样式 ========== */
.bottom-cards-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.monitor-card,
.queue-card {
  border-radius: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.monitor-card:hover,
.queue-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
}

.monitor-card /deep/ .el-card__header,
.queue-card /deep/ .el-card__header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.monitor-card /deep/ .el-card__body,
.queue-card /deep/ .el-card__body {
  flex: 1;
  padding: 0px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.queue-body-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.queue-body-wrapper .queue-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.queue-body-wrapper .queue-footer {
  flex-shrink: 0;
}

.monitor-header,
.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor-title,
.queue-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.monitor-title i,
.queue-title i {
  font-size: 18px;
}

.header-link {
  font-size: 12px;
}

/* ========== 任务监控内容 ========== */
.monitor-content {
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  /* gap: 20px; */
  height: 100%;
  background-color: #f8fafc;
  overflow: hidden;
}

.monitor-left,
.monitor-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.monitor-left {
  padding: 15px;
  background: white;
  overflow-y: auto;
}

.monitor-right {
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.monitor-left::-webkit-scrollbar,
.monitor-right::-webkit-scrollbar {
  width: 6px;
}

.monitor-left::-webkit-scrollbar-thumb,
.monitor-right::-webkit-scrollbar-thumb {
  background: #d3d4d6;
  border-radius: 3px;
}

.progress-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.progress-title {
  font-weight: 600;
  font-size: 16px;
}

.progress-info {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

/* 时间轴部分 */
.section-title {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  margin: 0 0 10px 0;
}

/* 表格部分 */
.table-section {
  flex-shrink: 0;
}

.table-item-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background-color: #eff6ff;
  border-radius: 8px;
  font-size: 14px;
  color: #409eff;
}

.table-dot {
  width: 8px;
  height: 8px;
  background-color: #1d4ed8;
  border-radius: 50%;
  flex-shrink: 0;
}

.table-item-name {
  font-weight: 500;
  color: #1d4ed8;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter {
  transform: translateY(10px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* 步骤部分 */
.steps-section {
  flex-shrink: 0;
}

.steps-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #606266;
  margin-bottom: 10px;
}

.step-item-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.step-text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-text-main {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.step-text-sub {
  font-size: 11px;
  color: #909399;
}

.step-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.skip-icon,
.success-icon,
.processing-icon {
  font-size: 16px;
}

.skip-icon {
  background-color: #f5f7fa;
  color: #909399;
}

.success-icon {
  background-color: #f0f9ff;
  color: #67c23a;
}

.processing-icon {
  background-color: #fef3c7;
  color: #e6a23c;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}


/* 时间轴部分 */
.timeline-section {
  flex: 1;
  min-height: 0;
  padding: 20px;
  overflow-y: auto;
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.timeline-wrapper {
  position: relative;
  padding-left: 20px;
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 20px;
  font-size: 12px;
  color: #606266;
  padding-left: 20px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-connector {
  position: absolute;
  left: -13px;
  top: 16px;
  height: calc(100% + 20px);
  width: 2px;
  background: rgba(59, 130, 246, 0.3);
  z-index: 0;
}

.timeline-dot {
  position: absolute;
  left: -17px;
  top: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
  border: none;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.timeline-dot-active {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-dot-active .el-icon-loading {
  font-size: 8px;
  color: white;
}

.timeline-text-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timeline-time {
  font-size: 11px;
  color: #909399;
}

.timeline-text {
  line-height: 1.5;
  padding-top: 2px;
}

/* ========== 任务队列样式 ========== */
.queue-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.queue-item {
  padding: 12px;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.queue-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.queue-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.queue-item-info {
  font-size: 12px;
  color: #909399;
  display: block;
}

.queue-footer {
  text-align: center;
  padding: 20px;
  font-size: 12px;
  cursor: pointer;
}

/* ========== 响应式布局 ========== */
@media (max-width: 1400px) {
  .monitor-content {
    grid-template-columns: 1fr;
  }
}
</style>