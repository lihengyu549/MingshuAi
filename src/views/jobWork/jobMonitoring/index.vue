<template>
  <div class="task-progress-container">
    <!-- 任务基本信息 -->
    <el-card class="task-info-card" shadow="hover">
      <div class="task-info">
        <p class="task-name"><span>任务名称</span>：{{ tasksName }}</p>
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
        <div class="custom-progress-container">
          <el-progress :percentage="progressPercent" :format="progressFormat"
            :status="progressPercent === 100 ? 'success' : undefined">
          </el-progress>
        </div>
      </div>
    </el-card>

    <!-- 标签与内容区域 -->
    <el-card class="tab-card" shadow="hover">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="实时日志" name="realtime">
          <div class="log-container">
            <div class="log-timeline"></div>
            <div class="log-list">
              <!-- 修改日志项展示，直接显示text字段 -->
              <div v-for="(log, index) in realtimeLogs" :key="index" class="log-item">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-content">{{ log.text }}</span>
              </div>
              <div v-if="realtimeLogs.length === 0 && socketConnected" class="empty-log">
                <i class="el-icon-loading"></i>
                等待日志更新...
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="分析日志" name="analysis">
          <div class="analysis-log-container">
            <el-table :data="analysisLogs" border style="width: 100%;" v-if="analysisLogs.length > 0">
              <el-table-column prop="time" label="时间" width="180"></el-table-column>
              <el-table-column prop="level" label="级别" width="100">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.level === 'ERROR' ? 'danger' : 'info'">
                    {{ scope.row.level }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="日志内容"></el-table-column>
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
export default {
  name: 'TaskProgress',
  data() {
    return {
      routeData: this.$route.query || {},
      // 任务基本信息
      tasksName: '',
      startTime: '',
      endTime: '',
      runTime: '',
      status: '',

      // 进度条数据
      progressTotal: 0,
      progressCurrent: 0,

      // tab控制
      activeTab: 'realtime',

      // 实时日志：【核心变更】
      realtimeLogs: [], // 日志数据结构改为：[{time, tableName, status}]
      socket: null,
      socketConnected: false, // 标记WebSocket是否已连接
      // 移除手动加载相关变量（无需无限滚动）
      // hasMoreRealtimeLogs: true,
      // pageSize: 10,
      // currentPage: 1,
      // loadingMore: false,
      // infiniteScrollDisabled: false,

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
      this.tasksName = this.routeData.tasksName;
      // this.startTime = '2025-08-15 09:30:00';
      // this.endTime = this.routeData.endTime || '';
      // this.runTime = '00:25:36';
      // this.status = '执行中';
      console.log('this.routeData', this.routeData);
    },

    // 【核心变更】初始化WebSocket：处理后端返回的结构化日志
    initWebSocket() {
      // 1. 使用原生WebSocket建立连接
      this.socket = new WebSocket(`ws://192.168.7.84:8080/system/websocket/${this.routeData.id}`);

      // 2. 连接成功处理（对应原connect事件）
      this.socket.onopen = () => {
        console.log('WebSocket连接成功');
        this.socketConnected = true;
        // 发送订阅请求（原生WebSocket使用send发送JSON字符串）
        this.socket.send(JSON.stringify({
          event: 'subscribe',
          data: { taskId: this.$route.params.taskId || this.routeData.id }
        }));
      };

      // 3. 接收消息处理（原生WebSocket需手动区分事件类型）
      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // 根据消息中的event字段区分不同类型
          switch (message.event) {
            case 'realtimeLog':
              // 处理实时日志（保持原逻辑）
              const logData = {
                time: message.data.time || this.formatTime(new Date()),
                tableName: message.data.tableName || message.data.table,
                status: message.data.status || message.data.message
              };
              this.realtimeLogs.push(logData);
              this.scrollToBottom();
              break;

            case 'progressUpdate':
              // 处理进度更新（保持原逻辑）
              this.progressCurrent = message.data.current;
              this.progressTotal = message.data.total;
              this.runTime = message.data.runTime;
              this.status = message.data.status;
              this.startTime = message.data.startTime;
              this.endTime = message.data.endTime;
              if (message.data.current === message.data.total) {
                this.status = '已完成';
                this.endTime = this.formatTime(new Date());
              }
              break;

            default:
              console.log('收到未知类型消息:', message);
          }
        } catch (e) {
          console.error('解析WebSocket消息失败:', e, event.data);
        }
      };

      // 4. 连接断开处理（对应原disconnect事件）
      this.socket.onclose = (event) => {
        console.log('WebSocket连接断开:', event.reason);
        this.socketConnected = false;
        // 非手动关闭时尝试重连
        if (!event.wasClean) {
          setTimeout(() => {
            this.initWebSocket(); // 重连
          }, 3000);
        }
      };

      // 5. 错误处理（对应原error事件）
      this.socket.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.$message.error('日志连接异常，请刷新页面重试');
      };
    },


    // 获取分析日志
    getAnalysisLogs() {
      // this.$axios.get(`/api/tasks/${this.$route.params.taskId}/analysis-logs`)
      //   .then((res) => {
      //     if (res.data.code === 200) {
      //       this.analysisLogs = res.data.data;
      //     }
      //   })
      //   .catch((err) => {
      //     console.error('获取分析日志失败：', err);
      //     this.$message.error('获取分析日志失败，请稍后重试');
      //   });
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

    // 【核心优化】自动滚动到底部：确保新日志显示在视图内
    scrollToBottom() {
      this.$nextTick(() => {
        const logContainer = this.$el.querySelector('.log-container');
        if (logContainer) {
          // 滚动到容器底部（scrollHeight是总高度，scrollTop设为总高度即可）
          logContainer.scrollTop = logContainer.scrollHeight;
        }
      });
    },
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

/* 1. 日志容器：固定高度，隐藏滚动条（可选），相对定位用于节点条 */
.log-container {
  height: 400px;
  overflow-y: auto;
  padding: 10px 20px;
  background-color: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  position: relative;
  /* 隐藏滚动条（美观，可选） */
  scrollbar-width: none;
  /* Firefox */
}

.log-container::-webkit-scrollbar {
  display: none;
  /* Chrome/Safari */
}

/* 2. 左侧节点条：垂直时间线，固定位置 */
.log-timeline {
  position: absolute;
  left: 25px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background-color: #e4e7ed;
  /* 灰色主线 */
}

/* 3. 日志列表：向右偏移，给节点条留空间 */
.log-list {
  margin-left: 40px;
  /* 偏移量 = 节点条宽度 + 间距 */
}

/* 4. 单个日志项：垂直间距，相对定位用于节点点 */
.log-item {
  margin-bottom: 20px;
  padding-left: 15px;
  position: relative;
  line-height: 1.8;
}

/* 日志项左侧的节点点（与时间线对齐） */
.log-item::before {
  content: '';
  position: absolute;
  left: -5px;
  /* 与时间线对齐 */
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #1890ff;
  /* 蓝色节点（参考图风格） */
  z-index: 1;
}

/* 5. 日志时间：固定宽度，灰色字体（参考图样式） */
.log-time {
  display: inline-block;
  width: 180px;
  /* 固定时间宽度，确保内容对齐 */
  color: #606266;
  font-size: 13px;
}

/* 6. 日志内容：默认字体，表名与状态区分 */
.log-content {
  font-size: 13px;
  color: #303133;
}

/* 日志状态：可加浅色背景突出（参考图“打标完成”样式） */
.log-status {
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #f0f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-size: 12px;
}

/* 7. 空日志提示：居中显示 */
.empty-log {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 13px;
}
</style>
