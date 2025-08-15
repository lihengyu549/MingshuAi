<template>
  <div class="task-progress-container">
    <!-- 任务基本信息 -->
    <el-card class="task-info-card" shadow="hover">
      <div class="task-info">
        <!-- 放大加粗的任务名称 -->
        <p class="task-name"><span>任务名称</span>：{{ taskName }}</p>
        <!-- 其他信息放到第二行 -->
        <div class="other-info">
          <p><span>开始时间</span>：{{ startTime }}</p>
          <p><span>结束时间</span>：{{ endTime || '执行中' }}</p>
          <p><span>运行时间</span>：{{ runTime }}</p>
          <p><span>运行状态</span>：
            <el-tag :type="status === '执行中' ? 'warning' : 'success'">{{ status }}</el-tag>
          </p>
        </div>
      </div>
    </el-card>

    <!-- 整体进度条 -->
    <el-card class="progress-card" shadow="hover">
      <div class="progress-info">
        <span>整体进度</span>
        <!-- 自定义进度条容器 -->
        <div class="custom-progress-container">
          <el-progress :percentage="progressPercent" :format="progressFormat"
            :status="progressPercent === 100 ? 'success' : ''"></el-progress>
        </div>
      </div>
    </el-card>

    <!-- 标签与内容区域 -->
    <el-card class="tab-card" shadow="hover">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="实时日志" name="realtime">
          <div class="log-container" v-infinite-scroll="loadMoreRealtimeLogs"
            infinite-scroll-disabled="infiniteScrollDisabled" infinite-scroll-distance="10">
            <p v-for="(log, index) in realtimeLogs" :key="index" class="log-item"
              :class="{ 'warning-log': log.includes('警告'), 'error-log': log.includes('错误') }">{{ log }}</p>

            <div v-if="loadingMore" class="loading-indicator">
              <el-loading-spinner></el-loading-spinner>
              <span>加载更多日志...</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="分析日志" name="analysis">
          <div class="analysis-log-container">
            <el-table :data="analysisLogs" border style="width: 100%;" v-if="analysisLogs.length > 0">
              <el-table-column prop="time" label="时间" width="180">
              </el-table-column>
              <el-table-column prop="level" label="级别" width="100">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.level === 'ERROR' ? 'danger' : 'info'">
                    {{ scope.row.level }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="日志内容">
              </el-table-column>
            </el-table>

            <div v-else class="empty-state">
              <el-empty description="暂无分析日志数据"></el-empty>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 操作按钮 -->
    <div class="button-group">
      <el-button type="primary" @click="handleReturn">返回</el-button>
      <el-button type="warning" @click="handleRefresh" v-if="activeTab === 'analysis'">
        <i class="el-icon-refresh"></i> 刷新
      </el-button>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
export default {
  name: 'TaskProgress',
  data() {
    return {
      // 任务基本信息
      taskName: '',
      startTime: '',
      endTime: '',
      runTime: '',
      status: '',

      // 进度条数据
      progressTotal: 12,
      progressCurrent: 7,

      // tab控制
      activeTab: 'realtime',

      // 实时日志
      realtimeLogs: [],
      socket: null,
      hasMoreRealtimeLogs: true,
      pageSize: 10,
      currentPage: 1,
      loadingMore: false,
      infiniteScrollDisabled: false,

      // 分析日志
      analysisLogs: []
    };
  },
  computed: {
    // 进度条百分比计算
    progressPercent() {
      return Math.round((this.progressCurrent / this.progressTotal) * 100);
    },
    // 进度条显示文本格式化
    progressFormat() {
      return () => `${this.progressCurrent}/${this.progressTotal} (${this.progressPercent}%)`;
    }
  },
  mounted() {
    // 初始化任务基本信息
    this.initTaskInfo();
    // 初始化WebSocket连接
    this.initWebSocket();
    // 获取分析日志
    this.getAnalysisLogs();
    // 模拟进度更新
    this.startProgressSimulation();
  },
  beforeDestroy() {
    // 关闭WebSocket连接
    if (this.socket) {
      this.socket.disconnect();
    }
    // 清除定时器
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
  },
  methods: {
    // 初始化任务基本信息
    initTaskInfo() {
      this.taskName = 'ERP系统数据分类分级处理';
      this.startTime = '2025-08-15 09:30:00';
      this.runTime = '00:25:36';
      this.status = '执行中';
    },

    // 初始化WebSocket
    initWebSocket() {
      // 连接WebSocket服务器
      this.socket = io('ws://your-server-address/ws/task-logs');

      // 连接成功
      this.socket.on('connect', () => {
        console.log('WebSocket连接成功');
        // 发送任务ID订阅特定任务的日志
        this.socket.emit('subscribe', { taskId: this.$route.params.taskId });
      });

      // 接收实时日志
      this.socket.on('realtimeLog', (data) => {
        this.realtimeLogs.push(`[${this.formatTime(new Date())}] ${data.message}`);
        // 自动滚动到底部
        this.scrollToBottom();
      });

      // 接收进度更新
      this.socket.on('progressUpdate', (data) => {
        this.progressCurrent = data.current;
        this.progressTotal = data.total;
        this.runTime = data.runTime;

        // 如果任务完成
        if (data.current === data.total) {
          this.status = '已完成';
          this.endTime = this.formatTime(new Date());
        }
      });

      // 连接断开
      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket连接断开:', reason);
        // 如果不是手动断开，尝试重连
        if (reason !== 'io client disconnect') {
          this.socket.connect();
        }
      });
    },

    // 加载更多实时日志（无限滚动逻辑）
    loadMoreRealtimeLogs() {
      if (!this.hasMoreRealtimeLogs || this.loadingMore) return;

      this.loadingMore = true;
      this.infiniteScrollDisabled = true;

      // 模拟从服务器加载历史日志
      setTimeout(() => {
        this.currentPage++;
        // 实际应用中这里应该通过WebSocket或API请求历史日志
        const historyLogs = [];
        for (let i = 0; i < this.pageSize; i++) {
          const time = new Date(Date.now() - (this.currentPage * 100000 + i * 10000));
          historyLogs.push(`[${this.formatTime(time)}] 历史日志记录 ${(this.currentPage - 1) * this.pageSize + i + 1}`);
        }

        // 向数组头部添加历史日志（因为是加载更早的日志）
        this.realtimeLogs.unshift(...historyLogs);

        // 假设最多加载5页历史数据
        if (this.currentPage >= 5) {
          this.hasMoreRealtimeLogs = false;
        }

        this.loadingMore = false;
        this.infiniteScrollDisabled = false;
      }, 1000);
    },

    // 获取分析日志
    getAnalysisLogs() {
      this.$axios.get(`/api/tasks/${this.$route.params.taskId}/analysis-logs`)
        .then((res) => {
          if (res.data.code === 200) {
            this.analysisLogs = res.data.data;
          }
        })
        .catch((err) => {
          console.error('获取分析日志失败：', err);
          this.$message.error('获取分析日志失败，请稍后重试');
        });
    },

    // 刷新分析日志
    handleRefresh() {
      this.getAnalysisLogs();
    },

    // 返回按钮事件
    handleReturn() {
      this.$router.back();
    },

    // 格式化时间
    formatTime(date) {
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-');
    },

    // 滚动到最新日志
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$el.querySelector('.log-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    // 模拟进度更新（实际项目中可删除，由WebSocket推送）
    startProgressSimulation() {
      this.progressTimer = setInterval(() => {
        if (this.progressCurrent < this.progressTotal) {
          this.progressCurrent++;
          // 更新运行时间
          const [hours, minutes, seconds] = this.runTime.split(':').map(Number);
          let totalSeconds = hours * 3600 + minutes * 60 + seconds + 10;
          const newHours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
          totalSeconds %= 3600;
          const newMinutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
          const newSeconds = (totalSeconds % 60).toString().padStart(2, '0');
          this.runTime = `${newHours}:${newMinutes}:${newSeconds}`;
        } else {
          clearInterval(this.progressTimer);
        }
      }, 5000);
    }
  }
};
</script>

<style scoped>
.task-progress-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.task-info-card,
.progress-card,
.tab-card {
  margin-bottom: 20px;
  background-color: #fff;
}

.task-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 40px;
  padding: 10px 0;
}

.task-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.task-info span {
  font-weight: 500;
  color: #303133;
}

.progress-info {
  padding: 10px 0;
  width: 100%;
}

.progress-info span {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  display: inline-block;
}

/* 自定义进度条样式 - 将文本放在进度条上方右侧 */
.custom-progress-container {
  width: 100%;
}

/* 使用深度选择器覆盖Element UI默认样式 */
/deep/ .el-progress {
  position: relative;
  padding-top: 20px;
  /* 为上方的文本预留空间 */
}

/deep/ .el-progress__text {
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
  /* 移除默认margin */
  font-size: 14px;
  color: #606266;
}

/deep/ .el-progress__bar {
  width: 100%;
}

.log-container,
.analysis-log-container {
  height: 400px;
  overflow-y: auto;
  padding: 10px;
  background-color: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.log-item {
  margin: 0 0 8px 0;
  line-height: 1.6;
  font-size: 13px;
  color: #303133;
  word-break: break-all;
}

.warning-log {
  color: #e6a23c;
}

.error-log {
  color: #f56c6c;
}

.loading-indicator {
  text-align: center;
  padding: 10px;
  color: #606266;
}

.loading-indicator .el-loading-spinner {
  display: inline-block;
  margin-right: 8px;
}

.button-group {
  margin-top: 10px;
  text-align: right;
}

.empty-state {
  padding: 40px 0;
}

/deep/ .el-tabs__content {
  margin-top: 15px;
}

/deep/ .el-progress-bar__outer {
  height: 10px !important;
  width: 100%;
}

/deep/ .el-progress-bar {
  padding-right: 0;
}

.task-info {
  display: flex;
  flex-direction: column;
  /* 改为垂直布局 */
  gap: 15px;
  /* 名称和其他信息之间的间距 */
  padding: 15px 0;
}

.task-name {
  font-size: 18px;
  /* 放大字体 */
  font-weight: bold;
  /* 加粗 */
  margin: 0;
  color: #303133;
}

.other-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 40px;
  /* 保持原有水平间距 */
}

.other-info p {
  line-height: 28px;
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.other-info span {
  font-weight: 500;
  color: #303133;
}
</style>
