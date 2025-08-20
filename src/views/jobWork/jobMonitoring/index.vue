<template>
  <div class="task-progress-container">
    <!-- 任务基本信息 -->
    <el-card class="task-info-card" shadow="hover">
      <div class="task-info">
        <p class="task-name"><span>任务名称</span>：{{ tasksName }}</p>
        <div class="other-info">
          <p><span>开始时间</span>：{{ startTime }}</p>
          <p><span>结束时间</span>：{{ overTime }}</p>
          <p><span>运行时间</span>：{{ runTime }}</p>
          <p><span>运行状态</span>：
            <el-tag :type="statusType">{{ statusName }}</el-tag>
          </p>
        </div>
      </div>
    </el-card>

    <!-- 整体进度条 -->
    <el-card class="progress-card" shadow="hover">
      <div class="progress-info">
        <span>整体进度</span>
        <div class="custom-progress-container">
          <el-progress :percentage="progressPercent ? progressPercent : 0" :format="progressFormat"
            :status="progressPercent === 100 ? 'success' : undefined">
          </el-progress>
        </div>
      </div>
    </el-card>

    <!-- 标签与内容区域 -->
    <el-card class="tab-card" shadow="hover">
      <el-tabs v-model="activeTab">
        <!-- 实时日志（修改后） -->
        <el-tab-pane label="实时日志" name="realtime">
          <div class="log-container">
            <!-- 左侧垂直线（时间线主线） -->
            <div class="timeline-line-s"></div>
            <!-- 实时日志列表 -->
            <div class="log-list">
              <div v-for="(log, index) in realtimeLogs" :key="index" class="log-item">
                <!-- 时间线圆点（与垂直线对齐） -->
                <span class="timeline-dot"></span>
                <!-- 日志内容（匹配图片字体样式） -->
                <span class="log-content">{{ log.text }}</span>
              </div>
              <!-- 新增：数据处理中提示项 -->
              <div v-if="status == 'RUNNING'" class="log-item processing-item">
                <span class="timeline-dot"></span>
                <span class="log-content">
                  数据处理中
                  <i class="el-icon-loading loading-icon"></i>
                </span>
              </div>
              <!-- 空日志提示 -->
              <!-- <div v-if="realtimeLogs.length === 0 && socketConnected" class="empty-log">
                <i class="el-icon-loading"></i>
                等待日志更新...
              </div> -->
            </div>
          </div>
        </el-tab-pane>

        <!-- 分析日志（修改后） -->
        <el-tab-pane label="分析日志" name="analysis">
          <div class="analysis-log-container">
            <!-- 数据存在时渲染时间线 -->
            <div v-if="Object.keys(analysisLogs).length > 0">
              <!-- 左侧垂直线（时间线主线） -->
              <div class="timeline-line"></div>
              <!-- 分析日志列表 -->
              <div class="analysis-list">
                <div class="analysis-item">
                  <span class="timeline-dot"></span>
                  <span class="analysis-label">过滤脏数据字段数量:</span>
                  <span class="analysis-value">{{ analysisLogs.dirtyDataNum || "暂无" }}</span>
                </div>
                <div class="analysis-item">
                  <span class="timeline-dot"></span>
                  <span class="analysis-label">命中匹配规则字段数量:</span>
                  <span class="analysis-value">{{ analysisLogs.classificationNum || "暂无" }}</span>
                </div>
                <div class="analysis-item">
                  <span class="timeline-dot"></span>
                  <span class="analysis-label">AI注释填充情况:</span>
                  <span class="analysis-value">{{ analysisLogs.aiNoteFilling || "暂无" }}</span>
                </div>
                <div class="analysis-item">
                  <span class="timeline-dot"></span>
                  <span class="analysis-label">分类情况:</span>
                  <span class="analysis-value">{{ analysisLogs.classification || "暂无" }}</span>
                </div>
                <div class="analysis-item">
                  <span class="timeline-dot"></span>
                  <span class="analysis-label">样本特征提取数量:</span>
                  <span class="analysis-value">{{ analysisLogs.featureDataNum || "暂无" }}</span>
                </div>
              </div>
            </div>
            <!-- 空状态 -->
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
import { getAnalyseLog } from "@/api/system/protectCategory"
export default {
  name: 'TaskProgress',
  data() {
    return {
      routeData: this.$route.query || {},
      // 任务基本信息
      tasksName: '',
      startTime: '',
      overTime: '',
      runTime: '',
      status: '',
      statusName: '',
      // 进度条数据
      progressTotal: 0,
      progressCurrent: 0,
      // tab控制
      activeTab: 'realtime',
      // 实时日志
      realtimeLogs: [],
      socket: null,
      socketConnected: false,
      // 分析日志（默认数据匹配图片）
      analysisLogs: {}
    };
  },
  computed: {
    // 进度条百分比
    progressPercent() {
      return Math.round((this.progressCurrent / this.progressTotal) * 100);
    },
    // 进度条文本格式化
    progressFormat() {
      return () => `${this.progressCurrent}/${this.progressTotal} (${this.progressPercent}%)`;
    },
    // 状态标签类型
    statusType() {
      if (this.status === 'RUNNING' || this.status === 'PAUSEDING' || this.status === 'KILLEDING') {
        return 'primary';
      } else if (this.status === 'COMPLETE' || this.status === 'PAUSED' || this.status === 'KILLED') {
        return 'success';
      } else if (this.status === 'ERR') {
        return 'danger';
      } else {
        return 'info';
      }
    }
  },
  mounted() {
    this.initTaskInfo();
    this.initWebSocket();
    this.getAnalysisLogs();
  },
  beforeDestroy() {
    // 关闭WebSocket连接
    if (this.socket) {
      this.socket.close(1000, '页面销毁，主动关闭连接');
    }
  },
  methods: {
    // 初始化任务基本信息
    initTaskInfo() {
      this.tasksName = this.routeData.tasksName;
      this.status = this.routeData.maskComplete;
      this.statusName = this.routeData.causeDescription;
      this.startTime = this.routeData.startTime;
      this.overTime = this.routeData.overTime;
      this.runTime = this.routeData.runTime;

      console.log('this.routeData', this.routeData);
    },
    // 生成UUID
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    // 初始化WebSocket
    initWebSocket() {
      // 如果状态不是执行中，则不连接WebSocket
      if (this.routeData.maskComplete !== "RUNNING") {
        return;
      }
      const uuid = this.generateUUID();
      // 从cookie获取Admin-Token
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
      };
      const token = getCookie('Admin-Token');
      // 处理token为空的情况，避免传递无效子协议
      const protocols = token ? [`${token}`] : [];

      // 仅获取当前URL的IP/域名（不包含端口）
      const currentUrl = new URL(window.location.href);
      const hostName = currentUrl.hostname; // 只取主机名（IP或域名），不含端口
      //本地：192.168.7.84
      this.socket = new WebSocket(
        `ws://192.168.7.84:8080/system/websocket/${this.routeData.id}/${uuid}`,  // 本地
        // `wss://${hostName}:443/prod-api/system/websocket/${this.routeData.id}/${uuid}`,  // 线上
        protocols  // 只有当token存在时才传递子协议
      );

      // 连接成功
      this.socket.onopen = () => {
        console.log('WebSocket连接成功');
        this.socketConnected = true;
        this.socket.send(JSON.stringify({
          event: 'subscribe',
          data: { taskId: this.$route.params.taskId || this.routeData.id }
        }));
      };
      // 接收消息
      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // 新增实时日志
          this.realtimeLogs.push({ text: message.text });
          this.scrollToBottom();
          // 更新进度与状态
          this.progressCurrent = message.progressCurrent;
          this.progressTotal = message.progressTotal;
          this.runTime = message.runTime;
          this.status = message.status;
          this.statusName = message.statusName;
          this.startTime = message.startTime;
          this.overTime = message.overTime;
        } catch (e) {
          console.error('解析WebSocket消息失败:', e);
        }
      };

      // 连接断开
      this.socket.onclose = (event) => {
        console.log('WebSocket连接断开:', event.reason);
        this.socketConnected = false;
        // 自动重连
        if (!event.wasClean) {
          setTimeout(() => this.initWebSocket(), 3000);
        }
      };

      // 连接错误
      this.socket.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.$message.error('日志连接异常，请刷新页面重试');
      };
    },
    // 获取分析日志（修复数据赋值错误）
    getAnalysisLogs() {
      const params = {
        id: Number(this.routeData.id)
      }
      getAnalyseLog(params).then((res) => {
        if (res.code === 200) {
          // 修正：将数据赋值给analysisLogs（原代码为analysisLog
          this.analysisLogs = res.data;
        }
      }).catch((err) => {
        console.error('获取分析日志失败：', err);
        this.$message.error('获取分析日志失败，请稍后重试');
      })
    },
    // 刷新分析日志
    handleRefresh() {
      this.getAnalysisLogs();
    },
    // 返回上一页
    handleReturn() {
      this.$router.back();
    },
    // 时间格式化
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
    // 日志容器滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const logContainer = this.$el.querySelector('.log-container');
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight;
        }
      });
    },
  }
};
</script>

<style scoped>
/* 基础容器样式 */
.task-progress-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 卡片通用样式 */
.task-info-card,
.progress-card,
.tab-card {
  margin-bottom: 20px;
  background-color: #fff;
  position: relative;
}

/* 任务信息样式 */
.task-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px 0;
}

.task-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.other-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 40px;
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

/* 进度条样式 */
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

.custom-progress-container {
  width: 100%;
}

/* 覆盖Element UI进度条样式 */
/deep/ .el-progress {
  position: relative;
  padding-top: 20px;
}

/deep/ .el-progress__text {
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
  font-size: 14px;
  color: #606266;
}

/deep/ .el-progress-bar__outer {
  height: 10px !important;
  width: 100%;
}

/deep/ .el-progress-bar {
  padding-right: 0;
}

/* --------------- 实时日志样式（统一时间线）--------------- */
.log-container {
  height: 400px;
  overflow-y: auto;
  padding: 10px 20px;
  background-color: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  /* position: relative; */
  /* 隐藏滚动条（可选） */
  scrollbar-width: none;
}

.log-container::-webkit-scrollbar {
  display: none;
}

/* 时间线主线（垂直线） */
.timeline-line-s,
.timeline-line {
  position: absolute;
  left: 25px;
  /* 与圆点中心对齐 */
  top: 10px;
  bottom: 10px;
  width: 2px;
  background-color: #1890ff;
  /* 浅灰色主线 */
}

.timeline-line-s {
  left: 26px;
}

/* 日志列表（向右偏移） */
.log-list {
  margin-left: 36px;
  /* 偏移量=主线宽度+圆点直径+间距 */
}

/* 单个日志项 */
.log-item {
  margin-bottom: 25px;
  /* 垂直间距，匹配图片 */
  line-height: 1.8;
  position: relative;
}

/* 时间线圆点（蓝色实心圆） */
.timeline-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #1890ff;
  /* 蓝色圆点，匹配图片 */
  position: absolute;
  left: -36px;
  /* 与列表偏移量对应，左移对齐主线 */
  top: 8px;
  /* 垂直居中 */
  z-index: 1;
  border: 3px solid white;
}

/* 日志内容（匹配图片字体样式） */
.log-content {
  font-size: 14px;
  /* 统一字体大小 */
  color: #303133;
  /* 统一字体颜色 */
  word-break: break-all;
}

/* 新增：处理中样式 */
.processing-item {
  opacity: 0.8;
}

.loading-icon {
  margin-left: 8px;
  animation: rotating 1.5s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 空日志提示 */
.empty-log {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}

/* --------------- 分析日志样式（与实时日志统一）--------------- */
.analysis-log-container {
  height: 400px;
  overflow-y: auto;
  padding: 10px 20px;
  background-color: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  position: relative;
  /* 隐藏滚动条（可选） */
  scrollbar-width: none;
}

.analysis-log-container::-webkit-scrollbar {
  display: none;
}

/* 分析日志列表 */
.analysis-list {
  margin-left: 36px;
  /* 与实时日志偏移量一致 */
}

/* 单个分析项 */
.analysis-item {
  margin-bottom: 25px;
  /* 垂直间距，与实时日志一致 */
  line-height: 1.8;
  position: relative;
  font-size: 14px;
  /* 统一字体大小 */
}

/* 分析日志标签 */
.analysis-label {
  color: #303133;
  margin-right: 8px;
}

/* 分析日志数值 */
.analysis-value {
  color: #303133;
  /* 与标签同色，匹配图片 */
  word-break: break-all;
}

/* 空状态 */
.empty-state {
  padding: 40px 0;
  text-align: center;
}

/* 操作按钮 */
.button-group {
  margin-top: 10px;
  text-align: right;
}

/* 标签页内容间距 */
/deep/ .el-tabs__content {
  margin-top: 15px;
}
</style>