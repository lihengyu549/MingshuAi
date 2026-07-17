<template>
    <div class="task-progress-container app-container">
        <!-- 顶部任务基本信息卡片 -->
        <div class="task-info-card">
            <div class="task-info">
                <div class="task-header">
                    <div class="task-header-left">
                        <p class="task-name">{{ $t('jobWorkMonitoring.taskName') }}：{{ tasksName }}</p>
                        <el-tag :type="statusType" class="status-tag">{{ statusName }}</el-tag>
                    </div>
                    <el-button type="primary" plain @click="handleReturn" icon="el-icon-back">{{ $t('return') }}</el-button>
                </div>
                <div class="other-info">
                    <div class="info-item">
                        <span class="info-label">{{ $t('jobWorkMonitoring.startTime') }}：{{ startTime }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">{{ $t('jobWorkMonitoring.endTime') }}：{{ overTime }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">{{ $t('jobWorkMonitoring.runTime') }}：{{ runTime }}</span>
                    </div>
                    <div class="force-terminate-btn">
                        <el-button type="danger" size="mini" @click="forceTerminateDialogVisible = true">{{
                            $t('jobWorkMonitoring.forceTerminate') }}</el-button>
                    </div>
                </div>
                <p v-if="status === 'ERR'" class="error-reason">
                    <span>{{ $t('jobWorkMonitoring.failureReason') }}</span>：
                    <span class="error-text">{{ errorReason || $t('jobWorkMonitoring.unknownError') }}</span>
                </p>
            </div>
        </div>

        <!-- 强制终止弹窗 -->
        <el-dialog class="custom-dialog" :title="$t('jobWorkMonitoring.forceTerminateTask')"
            :visible.sync="forceTerminateDialogVisible" width="500px" :close-on-click-modal="false">
            <div class="force-terminate-content">
                <p class="warning-message">
                    {{ $t('jobWorkMonitoring.forceTerminateWarning') }}
                </p>
                <el-checkbox v-model="forceTerminateConfirm">
                    {{ $t('jobWorkMonitoring.forceTerminateConfirm') }}
                </el-checkbox>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="forceTerminateDialogVisible = false">{{ $t('cancel') }}</el-button>
                <el-button type="danger" :disabled="!forceTerminateConfirm" @click="handleForceTerminate">{{
                    $t('jobWorkMonitoring.confirmTerminate') }}</el-button>
            </span>
        </el-dialog>

        <!-- 主体内容区：左右分布布局 -->
        <div class="main-content-wrapper">
            <!-- 左侧面板：表名轮播 + 处理步骤 -->
            <div class="left-panel">
                <!-- 表名轮播卡片 -->
                <div class="table-carousel-card">
                    <!-- <div class="card-header">
                        <span class="header-title">{{ $t('jobWorkMonitoring.currentProcessingTable') }}</span>
            <div class="header-divider"></div>
          </div> -->
                    <!-- 表名轮播容器 -->
                    <div ref="carouselContainer" class="carousel-container">
                        <div class="carousel-item prev" v-show="isTaskActive && prevTableName">
                            <div class="table-name-small">{{ prevTableName }}</div>
                        </div>
                        <div class="carousel-item current">
                            <div class="table-name-main">{{ isTaskActive ? currentTableName : (currentTableName ||
                                (isFileServerTask ? $t('jobWorkMonitoring.noProcessingFile') : $t('jobWorkMonitoring.noProcessingTable'))) }}</div>
                        </div>
                        <div class="carousel-item next" v-show="isTaskActive && nextTableName">
                            <div class="table-name-small">{{ nextTableName }}</div>
                        </div>
                    </div>

                </div>

                <!-- 处理步骤卡片 -->
                <div class="steps-card">
                    <div class="card-header">
                        <i class="el-icon-d-list"></i>
                        <span class="header-title">{{ $t('jobWorkMonitoring.processingSteps') }}</span>
                        <div class="header-divider"></div>
                    </div>
                    <div class="steps-list">
                        <div v-for="(step, index) in visibleProcessingSteps" :key="index" class="step-item"
                            :class="step.status">
                            <!-- 步骤状态指示器 -->
                            <div class="step-icon">
                                <i v-if="step.status === 'completed'" class="el-icon-success"></i>
                                <i v-else-if="step.status === 'processing'" class="el-icon-loading"></i>
                                <i v-else-if="step.status === 'skip'" class="el-icon-back"></i>
                                <i v-else class="el-icon-circle-close-outline"></i>
                            </div>
                            <!-- 步骤内容 -->
                            <div class="step-content">
                                <div class="step-name">{{ getStepLabel(step.name) }}</div>
                                <div v-if="step.status === 'completed'" class="step-time">{{ step.completedTime }}</div>
                                <div v-else-if="step.status === 'processing'" class="step-status">{{
                                    $t('jobWorkMonitoring.processing') }}</div>
                                <div v-else-if="step.status === 'error'" class="step-status">{{
                                    $t('jobWorkMonitoring.failed') }}</div>
                                <div v-else-if="step.status === 'skip'" class="step-status">{{
                                    $t('jobWorkMonitoring.skipped') }}</div>
                                <div v-else class="step-status">{{ $t('jobWorkMonitoring.pending') }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧面板：进度条 + 日志 -->
            <div class="right-panel">
                <!-- 整体进度条 -->
                <div class="progress-card">
                    <div class="progress-header">
                        <span class="progress-label">{{ progressText }}</span>
                        <span class="progress-text">{{ progressCurrent }}/{{ progressTotal }} ({{ progressPercent
                        }}%)</span>
                    </div>
                    <div class="custom-progress-container">
                        <el-progress
                            :percentage="progressPercent ? progressPercent : this.status === 'ERR' || this.status === 'PAUSED' ? 50 : this.status === 'COMPLETE' ? 100 : 0"
                            :format="progressFormat" :status="statusIcon">
                        </el-progress>
                    </div>
                </div>

                <!-- 日志标签页 -->
                <div class="tab-card">
                    <el-tabs v-model="activeTab">
                        <!-- AI视图 Tab -->
                        <el-tab-pane v-if="showAiVision" :label="$t('jobWorkMonitoring.aiVision')" name="ai-vision">
                            <div class="ai-vision-container">
                                <div class="ai-effect-wrapper">

                                    <!-- 动效画布区域 -->
                                    <div class="ai-canvas-container">
                                        <!-- 步骤1: 噪音数据过滤 - 粒子过滤动效 -->
                                        <div v-show="currentAnimationKey === 'noise-filter'" class="effect-panel noise-filter">
                                            <canvas ref="noiseCanvas" class="effect-canvas"></canvas>
                                            <div class="effect-overlay">
                                                <div class="filter-gate">
                                                    <div class="gate-line"></div>
                                                    <span class="gate-label">{{ $t('jobWorkMonitoring.aiFilter')
                                                        }}</span>
                                                    <div class="gate-line"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 步骤2: 语义填充 - 打字机动效 -->
                                        <div v-show="currentAnimationKey === 'semantic-fill'" class="effect-panel semantic-fill">
                                            <div class="typewriter-container">
                                                <div class="typewriter-line">
                                                    <span ref="typewriterText" class="typewriter-text">{{
                                                        displayedTypewriterText }}</span>
                                                    <span class="typewriter-cursor"
                                                        :class="{ blink: cursorBlink }"></span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 步骤3: 匹配规则 - 连线匹配动效 -->
                                        <div v-show="currentAnimationKey === 'rule-match'" class="effect-panel rule-match">
                                            <svg ref="matchSvg" class="match-svg" viewBox="0 0 800 300">
                                                <defs>
                                                    <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%"
                                                            style="stop-color:#3b82f6;stop-opacity:0.35" />
                                                        <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
                                                        <stop offset="100%"
                                                            style="stop-color:#3b82f6;stop-opacity:0.35" />
                                                    </linearGradient>
                                                    <filter id="glow">
                                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                        <feMerge>
                                                            <feMergeNode in="coloredBlur" />
                                                            <feMergeNode in="SourceGraphic" />
                                                        </feMerge>
                                                    </filter>
                                                </defs>
                                                <!-- 左侧数据节点 -->
                                                <g class="data-nodes">
                                                    <g v-for="(node, idx) in leftNodes" :key="'l' + idx"
                                                        class="node-group">
                                                        <circle :cx="80" :cy="50 + idx * 60" r="20" class="node-circle"
                                                            :class="{ active: node.matched }" />
                                                        <text :x="80" :y="55 + idx * 60" class="node-text">{{ node.label
                                                        }}</text>
                                                    </g>
                                                </g>
                                                <!-- 右侧规则节点 -->
                                                <g class="rule-nodes">
                                                    <g v-for="(node, idx) in rightNodes" :key="'r' + idx"
                                                        class="node-group">
                                                        <rect :x="680" :y="30 + idx * 60" width="80" height="40" rx="6"
                                                            class="rule-rect" :class="{ active: node.matched }" />
                                                        <text :x="720" :y="55 + idx * 60" class="node-text">{{
                                                            node.label }}</text>
                                                    </g>
                                                </g>
                                                <!-- 匹配连线 -->
                                                <g class="match-lines">
                                                    <path v-for="(line, idx) in matchLines" :key="'line' + idx"
                                                        :d="line.path" class="match-line"
                                                        :class="{ active: line.active }"
                                                        :style="{ animationDelay: idx * 0.2 + 's' }" />
                                                </g>
                                            </svg>
                                        </div>

                                        <!-- 步骤4: AI分类打标 - 替换为SVG机器人打标签动效，填满容器 -->
                                        <div v-show="currentAnimationKey === 'ai-classify'" class="effect-panel ai-classify">
                                            <svg class="robot-labeling-svg" viewBox="0 0 800 400"
                                                preserveAspectRatio="xMidYMid meet">
                                                <defs>
                                                    <!-- 渐变定义 -->
                                                    <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="0%"
                                                        y2="100%">
                                                        <stop offset="0%" style="stop-color:#94a3b8" />
                                                        <stop offset="100%" style="stop-color:#64748b" />
                                                    </linearGradient>
                                                    <linearGradient id="robotHeadGrad" x1="0%" y1="0%" x2="0%"
                                                        y2="100%">
                                                        <stop offset="0%" style="stop-color:#e2e8f0" />
                                                        <stop offset="100%" style="stop-color:#cbd5e1" />
                                                    </linearGradient>
                                                    <linearGradient id="conveyorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" style="stop-color:#475569" />
                                                        <stop offset="100%" style="stop-color:#334155" />
                                                    </linearGradient>
                                                    <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" style="stop-color:#f59e0b" />
                                                        <stop offset="100%" style="stop-color:#d97706" />
                                                    </linearGradient>
                                                    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" style="stop-color:#1e293b" />
                                                        <stop offset="100%" style="stop-color:#0f172a" />
                                                    </linearGradient>
                                                    <filter id="robotGlow" x="-50%" y="-50%" width="200%" height="200%">
                                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                        <feMerge>
                                                            <feMergeNode in="coloredBlur" />
                                                            <feMergeNode in="SourceGraphic" />
                                                        </feMerge>
                                                    </filter>
                                                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                                        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000"
                                                            flood-opacity="0.15" />
                                                    </filter>
                                                    <!-- 传送带裁剪区域 -->
                                                    <clipPath id="beltClip">
                                                        <rect x="30" y="290" width="740" height="50" rx="6" />
                                                    </clipPath>
                                                </defs>

                                                <!-- 背景 -->
                                                <rect x="0" y="0" width="800" height="400" fill="#f8fafc" />

                                                <!-- 地面 -->
                                                <rect x="0" y="340" width="800" height="60" fill="#e2e8f0" />

                                                <!-- 传送带 -->
                                                <g class="conveyor-belt">
                                                    <rect x="30" y="290" width="740" height="50"
                                                        fill="url(#conveyorGrad)" rx="6" />
                                                    <!-- 传送带内容裁剪：滚轮 + 条纹 -->
                                                    <g clip-path="url(#beltClip)">
                                                        <!-- 传送带滚轮 -->
                                                        <circle cx="80" cy="315" r="14" fill="#1e293b" />
                                                        <circle cx="200" cy="315" r="14" fill="#1e293b" />
                                                        <circle cx="320" cy="315" r="14" fill="#1e293b" />
                                                        <circle cx="480" cy="315" r="14" fill="#1e293b" />
                                                        <circle cx="640" cy="315" r="14" fill="#1e293b" />
                                                        <!-- 传送带条纹动画（上条） -->
                                                        <g class="belt-stripes">
                                                            <rect x="-10" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="30" y="297" width="20" height="3" fill="#64748b" />
                                                            <rect x="70" y="297" width="20" height="3" fill="#64748b" />
                                                            <rect x="110" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="150" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="190" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="230" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="270" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="310" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="350" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="390" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="430" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="470" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="510" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="550" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="590" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="630" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="670" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="710" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="750" y="297" width="20" height="3"
                                                                fill="#64748b" />
                                                        </g>
                                                        <!-- 传送带条纹动画（下条） -->
                                                        <g class="belt-stripes">
                                                            <rect x="-10" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="30" y="330" width="20" height="3" fill="#64748b" />
                                                            <rect x="70" y="330" width="20" height="3" fill="#64748b" />
                                                            <rect x="110" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="150" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="190" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="230" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="270" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="310" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="350" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="390" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="430" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="470" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="510" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="550" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="590" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="630" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="670" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="710" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                            <rect x="750" y="330" width="20" height="3"
                                                                fill="#64748b" />
                                                        </g>
                                                    </g>
                                                </g>

                                                <!-- 机器人主体 -->
                                                <g class="robot-group" filter="url(#shadow)">
                                                    <!-- 机器人底座 -->
                                                    <rect x="350" y="240" width="100" height="50" fill="#475569"
                                                        rx="6" />

                                                    <!-- 机器人身体 -->
                                                    <rect x="335" y="120" width="130" height="120"
                                                        fill="url(#robotBodyGrad)" rx="12" />

                                                    <!-- 胸部屏幕 -->
                                                    <rect x="355" y="140" width="90" height="80" fill="url(#screenGrad)"
                                                        rx="6" />
                                                    <!-- 屏幕处理指示器 -->
                                                    <g class="screen-content">
                                                        <rect x="365" y="155" width="70" height="8" fill="#10b981"
                                                            rx="3" class="process-bar bar-1" />
                                                        <rect x="365" y="168" width="55" height="8" fill="#10b981"
                                                            rx="3" class="process-bar bar-2" />
                                                        <rect x="365" y="181" width="40" height="8" fill="#3b82f6"
                                                            rx="3" class="process-bar bar-3" />
                                                        <rect x="365" y="194" width="25" height="8" fill="#3b82f6"
                                                            rx="3" class="process-bar bar-4" />
                                                    </g>

                                                    <!-- 机器人头部 -->
                                                    <rect x="355" y="50" width="90" height="70"
                                                        fill="url(#robotHeadGrad)" rx="10" />

                                                    <!-- 眼睛 -->
                                                    <circle cx="380" cy="85" r="12" fill="#1e293b" />
                                                    <circle cx="420" cy="85" r="12" fill="#1e293b" />
                                                    <circle cx="380" cy="85" r="6" fill="#3b82f6" class="eye-glow"
                                                        filter="url(#robotGlow)" />
                                                    <circle cx="420" cy="85" r="6" fill="#3b82f6" class="eye-glow"
                                                        filter="url(#robotGlow)" />

                                                    <!-- 天线 -->
                                                    <rect x="395" y="25" width="10" height="25" fill="#64748b" rx="3" />
                                                    <circle cx="400" cy="20" r="8" fill="#ef4444"
                                                        class="antenna-light" />

                                                    <!-- 左手臂 (静止) -->
                                                    <rect x="305" y="140" width="30" height="80" fill="#64748b"
                                                        rx="8" />
                                                    <circle cx="320" cy="230" r="15" fill="#475569" />

                                                    <!-- 右手臂 (打标动作) -->
                                                    <g class="robot-right-arm" :class="{ stamping: robotStamping }">
                                                        <rect x="465" y="140" width="30" height="80" fill="#64748b"
                                                            rx="8" />
                                                        <!-- 打标器 -->
                                                        <g class="stamp-tool">
                                                            <rect x="460" y="220" width="40" height="30" fill="#475569"
                                                                rx="4" />
                                                            <rect x="465" y="250" width="30" height="15" fill="#ef4444"
                                                                rx="2" />
                                                        </g>
                                                    </g>
                                                </g>

                                                <!-- 动态盒子 - 使用 box.x 直接定位，不用 CSS 动画 -->
                                                <g v-for="(box, idx) in labelingBoxes" :key="'box-' + box.id"
                                                    class="field-box-group" :class="{ stamped: box.stamped }">
                                                    <rect :x="box.x" y="215" width="100" height="70"
                                                        fill="url(#boxGrad)" rx="6" filter="url(#shadow)" />
                                                    <!-- 使用 foreignObject 支持文字自动换行 -->
                                                    <foreignObject :x="box.x + 5" y="220" width="90" height="60">
                                                        <div xmlns="http://www.w3.org/1999/xhtml"
                                                            style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 12px; font-weight: 600; color: #fff; word-break: break-all; overflow: hidden; line-height: 1.2; padding: 2px;">
                                                            {{ box.field }}
                                                        </div>
                                                    </foreignObject>
                                                    <!-- 将标签移动到盒子右上角位置 -->
                                                    <g v-if="box.stamped" class="stamp-label">
                                                        <rect :x="box.x + 100" y="195" width="60" height="24"
                                                            fill="#fff" stroke="#ef4444" stroke-width="2" rx="3"
                                                            :transform="`rotate(-12, ${box.x + 80}, 277)`" />
                                                        <text :x="box.x + 130" y="212" text-anchor="middle"
                                                            fill="#ef4444" font-size="10" font-weight="800"
                                                            :transform="`rotate(-12, ${box.x + 80}, 277)`">
                                                            {{ truncateLabel(box.label) }}
                                                        </text>
                                                    </g>
                                                </g>

                                                <!-- 状态文字 -->
                                                <text x="400" y="380" text-anchor="middle" fill="#64748b" font-size="14"
                                                    font-weight="500">{{ robotStatus }}</text>
                                            </svg>
                                        </div>

                                        <!-- 步骤5: 个人信息识别 - 扫描识别动效 -->
                                        <div v-show="currentAnimationKey === 'personal-scan'" class="effect-panel personal-scan">
                                            <div class="scan-area">
                                                <div class="data-rows">
                                                    <div v-for="(row, idx) in scanRows" :key="idx" class="data-row"
                                                        :class="{ scanned: row.scanned, highlighted: row.scanned && row.isPII }">
                                                        <span class="row-content">{{ row.content }}</span>
                                                        <span v-if="row.scanned && row.isPII" class="pii-badge">{{
                                                            row.piiType }}</span>
                                                    </div>
                                                </div>
                                                <!-- 确保只有一个扫描线元素，使用 v-if 控制显示 -->
                                                <div class="scan-line" :style="{ top: scanLinePosition + '%' }"></div>
                                            </div>
                                            <div class="pii-stats">
                                                <div class="stat-item">
                                                    <span class="stat-value">{{ piiStats.phone }}</span>
                                                    <span class="stat-label">{{ $t('jobWorkMonitoring.phone') }}</span>
                                                </div>
                                                <div class="stat-item">
                                                    <span class="stat-value">{{ piiStats.idCard }}</span>
                                                    <span class="stat-label">{{ $t('jobWorkMonitoring.idCard') }}</span>
                                                </div>
                                                <div class="stat-item">
                                                    <span class="stat-value">{{ piiStats.email }}</span>
                                                    <span class="stat-label">{{ $t('jobWorkMonitoring.email') }}</span>
                                                </div>
                                                <div class="stat-item">
                                                    <span class="stat-value">{{ piiStats.address }}</span>
                                                    <span class="stat-label">{{ $t('jobWorkMonitoring.address')
                                                        }}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 步骤6: 样本特征提取 - 神经网络动效 -->
                                        <div v-show="currentAnimationKey === 'feature-extract'" class="effect-panel feature-extract">
                                            <canvas ref="neuralCanvas" class="effect-canvas"></canvas>
                                            <div class="feature-output">
                                                <div class="output-label">{{ $t('jobWorkMonitoring.featureExtracted') }}
                                                    {{ featureDataNum || 0 }}</div>
                                                <div class="feature-bars">
                                                    <div v-for="(bar, idx) in featureBars" :key="idx"
                                                        class="feature-bar" :style="{ height: bar.height + '%' }"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div v-if="!currentAnimationKey" class="effect-panel no-animation-state">
                                            <el-empty :description="$t('jobWorkMonitoring.noAnimation')"></el-empty>
                                            <p v-if="currentProcessingStep" class="no-animation-step">
                                                {{ getStepLabel(currentProcessingStep.name) }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        <!-- 实时日志 Tab -->
                        <el-tab-pane :label="$t('jobWorkMonitoring.realtimeLog')" name="realtime">
                            <div class="log-container" ref="logContainer">
                                <div v-if="realtimeLogs.length" class="log-list">
                                    <div v-for="(log, index) in realtimeLogs" :key="index" class="log-item">
                                        <span class="timeline-dot"></span>
                                        <div class="timeline-connector" v-if="index < realtimeLogs.length - 1"></div>
                                        <p class="log-content">{{ log.text }}</p>
                                    </div>
                                </div>
                                <div v-else class="empty-state">
                                    <el-empty :description="$t('jobWorkMonitoring.noRealtimeLog')"></el-empty>
                                </div>
                            </div>
                        </el-tab-pane>

                        <!-- 分析日志 Tab -->
                        <el-tab-pane :label="$t('jobWorkMonitoring.analysisLog')" name="analysis">
                            <div class="analysis-log-container">
                                <div v-if="Object.keys(analysisLogs).length > 0" class="analysis-list">
                                    <div v-for="(value, key, index) in analysisLogs" :key="key" class="analysis-item">
                                        <span class="timeline-dot"></span>
                                        <!-- 每个分析项都有一个垂直线，连接到下一个点 -->
                                        <div class="timeline-connector"
                                            v-if="index < Object.keys(analysisLogs).length - 1"></div>
                                        <span class="analysis-label">{{ getLabelByKey(key) }}:</span>
                                        <span class="analysis-value">{{ analysisLogs[key] ||
                                            $t('jobWorkMonitoring.none') }}</span>
                                    </div>
                                </div>
                                <div v-else class="empty-state">
                                    <el-empty :description="$t('jobWorkMonitoring.noAnalysisLog')"></el-empty>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="button-group">
            <el-button @click="handleRefresh" v-if="activeTab === 'analysis'">
                <i class="el-icon-refresh"></i> {{ $t('refresh') }}
            </el-button>
        </div>
    </div>
</template>

<script>
import { getAnalyseLog, forcedTermination } from "@/api/system/protectCategory"
import { debounce } from '@/utils/index';

const getJobMonitoringRouteData = () => {
    const storedRouteData = sessionStorage.getItem('jobMonitoring_routeData');
    if (!storedRouteData) {
        return null;
    }
    try {
        return JSON.parse(storedRouteData);
    } catch (error) {
        console.error('Failed to parse jobMonitoring route data:', error);
        return null;
    }
};

export default {
    name: 'TaskProgress',
    data() {
        const routeData = getJobMonitoringRouteData() || this.$route.query || {};
        return {
            routeData,
            // 任务基本信息
            tasksName: '',
            startTime: '',
            overTime: '',
            runTime: '',
            status: '',
            statusName: '',
            errorReason: '',
            // 强制终止相关
            forceTerminateDialogVisible: false,
            forceTerminateConfirm: false,
            // 进度条数据
            progressTotal: 0,
            progressCurrent: 0,
            progressText: '',
            // 实时日志
            realtimeLogs: [],
            socket: null,
            socketConnected: false,
            // WebSocket错误提示标志
            showSocketError: true,
            // 分析日志
            analysisLogs: {},
            // 标签页
            activeTab: '',
            currentTableName: '',
            prevTableName: '',
            nextTableName: '',
            processingSteps: [
                { name: '语义填充', status: 'null', completedTime: '' },
                { name: '噪音数据过滤', status: 'null', completedTime: '' },
                { name: '匹配规则', status: 'null', completedTime: '' },
                { name: '个人信息识别', status: 'null', completedTime: '' },
                { name: 'AI分类打标', status: 'null', completedTime: '' },
                { name: '自动审查', status: 'null', completedTime: '' },
                { name: '样本特征提取', status: 'null', completedTime: '' },
            ],
            // AI动效相关数据
            animationId: null,
            typewriterText: '',           // 后端返回的完整源文本
            displayedTypewriterText: '',  // 打字机效果显示的文本
            typewriterIndex: 0,           // 当前打字位置
            typewriterCompleted: false,   // 打字机效果是否已完成
            cursorBlink: true,
            // 匹配规则数据
            leftNodes: [
                { label: this.$t('jobWorkMonitoring.fieldA'), matched: true },
                { label: this.$t('jobWorkMonitoring.fieldB'), matched: false },
                { label: this.$t('jobWorkMonitoring.fieldC'), matched: true },
                { label: this.$t('jobWorkMonitoring.fieldD'), matched: false },
            ],
            rightNodes: [
                { label: this.$t('jobWorkMonitoring.rule1'), matched: true },
                { label: this.$t('jobWorkMonitoring.rule2'), matched: true },
                { label: this.$t('jobWorkMonitoring.rule3'), matched: false },
                { label: this.$t('jobWorkMonitoring.rule4'), matched: false },
            ],
            matchLines: [
                { path: 'M100,50 Q400,20 680,50', active: true },
                { path: 'M100,110 Q400,80 680,110', active: false },
                { path: 'M100,170 Q400,140 680,170', active: true },
                { path: 'M100,230 Q400,200 680,230', active: false },
            ],
            labelingBoxes: [],
            nextBoxId: 1,
            robotStamping: false,
            robotStatus: this.$t('jobWorkMonitoring.robotWaiting'),
            fieldQueue: [],
            isProcessingField: false,
            // 个人信息扫描数据
            scanRows: [
                { content: 'user_id: 10086', scanned: false, isPII: false },
                { content: 'phone: 138****8888', scanned: false, isPII: true, piiType: '手机号' },
                { content: 'name: 张三', scanned: false, isPII: true, piiType: '姓名' },
                { content: 'email: test@mail.com', scanned: false, isPII: true, piiType: '邮箱' },
                { content: 'status: active', scanned: false, isPII: false },
                { content: 'id_card: 110***********1234', scanned: false, isPII: true, piiType: '身份证' },
                { content: 'address: 北京市***', scanned: false, isPII: true, piiType: '地址' },
                { content: 'level: VIP', scanned: false, isPII: false },
            ],
            scanLinePosition: -1, // 重置扫描位置为 -1 表示未开始
            piiStats: { phone: 0, idCard: 0, email: 0, address: 0 },
            // 特征提取数据
            featureBars: Array(20).fill(0).map(() => ({ height: Math.random() * 80 + 20 })),
            featureDataNum: 0,
            // 神经网络数据
            noiseAnimationId: null, // Added for specific animation cleanup
            neuralAnimationId: null, // Added for specific animation cleanup
            scanInterval: null, // Added for animation cleanup
            semanticInterval: null, // Added for animation cleanup
            tagInterval: null, // Added for animation cleanup
            matchInterval: null, // Added for animation cleanup
            labelingAnimationId: null, // 新增用于步骤4动画
            lastProcessedField: null, // 存储上一个处理的字段，用于避免重复处理
        };
    },
    computed: {
        progressPercent() {
            return Math.round((this.progressCurrent / this.progressTotal) * 100);
        },
        progressFormat() {
            return () => `${this.progressCurrent}/${this.progressTotal} (${this.progressPercent}%)`;
        },
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
        },
        statusIcon() {
            const statusMap = {
                'COMPLETE': 'success',
                'KILLED': 'success',
                'PAUSED': 'warning',
                'ERR': 'exception'
            };
            return statusMap[this.status];
        },
        isTaskActive() {
            return this.status === 'RUNNING' || this.status === 'PAUSEDING' || this.status === 'KILLEDING';
        },
        isFileServerTask() {
            return this.routeData.sourceType === 'FILE_CATALOGUE' || this.routeData.sourceType === 'FILE_SERVER';
        },
        showAiVision() {
            // Temporarily hide the AI vision tab.
            return false;
        },
        visibleProcessingSteps() {
            if (!this.isFileServerTask) {
                return this.processingSteps;
            }
            // 非结构化时，展示四步：语义缓存，AI分类打标，动态定级，样本特征提取
            const unstructuredSteps = [
                { name: '文本摘要', status: 'null', completedTime: '' },
                { name: '语义缓存', status: 'null', completedTime: '' },
                { name: 'AI分类打标', status: 'null', completedTime: '' },
                { name: '自动审查', status: 'null', completedTime: '' },
                { name: '样本特征提取', status: 'null', completedTime: '' }
            ];
            
            // 从 this.processingSteps 中同步状态（如果有的话），因为后端的步骤名称可能匹配
            return unstructuredSteps.map(step => {
                const existingStep = this.processingSteps.find(s => s.name === step.name);
                if (existingStep) {
                    return { ...existingStep };
                }
                return step;
            });
        },
        // 获取当前处理中的步骤索引
        currentStepIndex() {
            const steps = this.visibleProcessingSteps;
            const idx = steps?.findIndex(s => s.status === 'processing');
            return idx >= 0 ? idx : steps?.findIndex(s => s.status === 'pending');
        },
        currentProcessingStep() {
            const steps = this.visibleProcessingSteps || [];
            const processingStep = steps.find(s => s.status === 'processing');
            if (processingStep) {
                return processingStep;
            }
            return steps.find(s => s.status === 'pending') || null;
        },
        currentAnimationKey() {
            const stepName = this.currentProcessingStep && this.currentProcessingStep.name;
            return this.getAnimationKeyByStepName(stepName);
        },
        realtimeLogCount() {
            return this.realtimeLogs.length;
        },
    },
    watch: {
        status: {
            handler(newStatus) {
                const newTab = newStatus === 'RUNNING' && this.showAiVision ? 'ai-vision' : 'analysis';
                this.activeTab = newTab;
                if (newTab === 'analysis') {
                    this.getAnalysisLogs();
                }
            },
            immediate: true
        },
        activeTab(newTab) {
            if (newTab === 'analysis') {
                this.getAnalysisLogs();
            } else if (newTab === 'ai-vision' && this.showAiVision) {
                this.$nextTick(() => {
                    this.startAIAnimations();
                });
            } else if (newTab === 'realtime') {
                this.scrollToBottom();
            }
        },
        currentAnimationKey() {
            if (this.activeTab === 'ai-vision' && this.showAiVision) {
                this.$nextTick(() => {
                    this.startAIAnimations();
                });
            }
        },
        realtimeLogCount() {
            if (this.activeTab === 'realtime') {
                this.scrollToBottom();
            }
        }
    },
    mounted() {
        this.initTaskInfo();
        this.initWebSocket();
        this.getAnalysisLogs();
        this.$nextTick(() => {
            if (this.activeTab === 'ai-vision' && this.showAiVision) {
                this.startAIAnimations();
            }
        });
    },
    beforeRouteLeave(to, from, next) {
        sessionStorage.removeItem('jobMonitoring_routeData');
        next();
    },
    beforeDestroy() {
        this.stopAllAnimations();
        if (this.socket) {
            this.socket.close();
        }
    },
    methods: {
        handleForceTerminate() {
            console.log('执行强制终止操作')
            forcedTermination({
                id: this.routeData.id,
            }).then(res => {
                if (res.code === 200) {
                    this.$message({
                        message: this.$t('jobWorkMonitoring.forcedTerminationSuccess'),
                        type: 'success',
                    })
                } else {
                    this.$message({
                        message: res.msg || this.$t('jobWorkMonitoring.forcedTerminationFailed'),
                        type: 'danger',
                    })
                }
            })
            this.forceTerminateDialogVisible = false
            this.forceTerminateConfirm = false
        },
        generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        initTaskInfo() {
            this.tasksName = this.routeData.tasksName || this.$t('jobWorkMonitoring.unknownTask');
            this.startTime = this.routeData.startTime || '';
            this.overTime = this.routeData.overTime || '';
            this.runTime = this.routeData.runTime || '';
            this.status = this.routeData.maskComplete || '';
            this.errorReason = this.routeData.errorReason || '';
            this.statusName = this.routeData.maskStatusName || this.routeData.stateName || '';
            this.progressTotal = Number(this.routeData.progressTotal) || 0;
            this.progressCurrent = Number(this.routeData.progressCurrent) || 0;
        },
        initWebSocket() {
            if (this.routeData.maskComplete !== "RUNNING") {
                return;
            }
            const uuid = this.generateUUID();
            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
                return '';
            };
            const token = getCookie('Admin-Token');
            const protocols = token ? [`${token}`] : [];
            const currentUrl = new URL(window.location.href);
            const hostName = currentUrl.hostname;
            this.socket = new WebSocket(
                `wss://${hostName}:443/prod-api/system/websocket/${this.routeData.id}/${uuid}`, // 线上
                // `ws://192.168.7.51:8080/system/websocket/${this.routeData.id}/${uuid}`,  // 本地
                protocols  // 只有当token存在时才传递子协议
            );
            this.socket.onopen = () => {
                console.log('WebSocket连接成功');
                this.socketConnected = true;
                this.socket.send(JSON.stringify({
                    event: 'subscribe',
                    data: { taskId: this.$route.params.taskId || this.routeData.id }
                }));
            };
            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    // 添加空值判断，只推送非空内容
                    if (message.realtimeLogs && message.realtimeLogs.text.trim() !== '') {
                        this.realtimeLogs.push({ text: message.realtimeLogs?.text });
                    }
                    this.scrollToBottom();
                    // 任务信息更新
                    this.runTime = message.taskInfo?.runTime || this.runTime;
                    this.status = message.taskInfo?.status || this.status;
                    this.statusName = message.taskInfo?.statusName || this.statusName;
                    this.errorReason = message.taskInfo?.status === 'ERR' ? message.taskInfo?.errorReason || '' : '';
                    this.startTime = message.taskInfo?.startTime || this.startTime;
                    this.overTime = message.taskInfo?.overTime || this.overTime;
                    // 进度条更新
                    this.progressCurrent = message.realtimeLogs?.progressCurrent !== undefined ? message.realtimeLogs.progressCurrent : this.progressCurrent;
                    this.progressTotal = message.realtimeLogs?.progressTotal !== undefined ? message.realtimeLogs.progressTotal : this.progressTotal;
                    this.progressText = message.realtimeLogs?.progressText != '' ? message.realtimeLogs.progressText : this.$t('jobWorkMonitoring.overallProgress');
                    // 当前处理表更新（兼容缺失的前/后表名，以及不同命名）
                    const tc = message.tableCarousel || message.tablecarousel;
                    if (tc) {
                        const newPrev = tc.prevTableName ? tc.prevTableName : '';
                        const newCurrent = tc.currentTableName || '';
                        const newNext = tc.nextTableName ? tc.nextTableName : '';
                        const changed = newPrev !== this.prevTableName || newCurrent !== this.currentTableName || newNext !== this.nextTableName;
                        this.prevTableName = newPrev;
                        this.currentTableName = newCurrent;
                        this.nextTableName = newNext;
                        if (changed) {
                            this.rotateTable();
                        }
                    }
                    // 处理步骤更新
                    this.processingSteps = message.processingSteps ? message.processingSteps : this.processingSteps;
                    // 当是语义填充时，获取语义填充的内容
                    if (message.processingSteps && message.processingSteps.length > 0) {
                        let semanticFill = message.processingSteps.find(step => step.name === '语义填充') //语义填充
                        if (semanticFill && semanticFill.status === 'processing' && semanticFill.typewriterOutput && semanticFill.typewriterOutput !== '') {
                            // 只有当源文本发生变化时，才重新启动打字机动画
                            if (semanticFill.typewriterOutput !== this.typewriterText) {
                                this.typewriterText = semanticFill.typewriterOutput;
                                this.typewriterCompleted = false;
                                // 当前步骤命中语义类动画时，重启打字机动画
                                if (this.activeTab === 'ai-vision' && this.currentAnimationKey === 'semantic-fill') {
                                    this.restartTypewriterAnimation();
                                }
                            }
                        }

                        let aiClassify = message.processingSteps.find(step => step.name === 'AI分类打标') //AI分类打标
                        if (aiClassify && aiClassify.status === 'processing') {
                            // AI分类打标时，处理WebSocket返回的字段和标签数据
                            if (aiClassify.field) {
                                // 判断如果field和上一个一样的话，不执行
                                if (this.lastProcessedField === aiClassify.field) {
                                    // 相同字段，不处理
                                    // return; // 不要 return，否则后面的代码不执行
                                } else {
                                    // 更新上一个处理的字段
                                    this.lastProcessedField = aiClassify.field;
                                    // 使用队列方式添加字段，同时传递 label
                                    this.enqueueField(aiClassify.field, aiClassify.label);
                                }
                            }
                        }
                    }
                    // 特征提取数量更新
                    if (message.featureDataNum !== undefined) {
                        this.featureDataNum = message.featureDataNum;
                    }
                    // if (message.field || message.aiField) {
                    //     this.enqueueField(message.field || message.aiField);
                    // }
                } catch (e) {
                    console.error('解析WebSocket消息失败:', e);
                }
            };
            this.socket.onclose = (event) => {
                console.log('WebSocket连接断开:', event.reason);
                this.socketConnected = false;
                if (!event.wasClean) {
                    // 只在首次连接失败时显示错误提示
                    if (this.showSocketError) {
                        this.$message.error(this.$t('jobWorkMonitoring.logConnectionError'));
                        this.showSocketError = false;
                    }
                    setTimeout(() => this.initWebSocket(), 3000);
                }
            };
            this.socket.onerror = (error) => {
                console.error('WebSocket错误:', error);
                // 只记录日志，不重复显示错误提示
                // 错误提示会在onclose中统一处理
            };
        },
        rotateTable(newTableName) {
            // 应用动画类
            const carouselContainer = this.$refs.carouselContainer;
            if (carouselContainer) {
                carouselContainer.classList.add('carousel-container-animating');
                // 动画结束后移除类名
                setTimeout(() => {
                    carouselContainer.classList.remove('carousel-container-animating');
                }, 300);
            } else {
                // 找不到容器元素时，不更新表名，仅跳过动画
            }
        },

        enqueueField(fieldName, label) {
            if (!fieldName || typeof fieldName !== 'string') return;
            // 检查队列中是否已存在相同的字段
            const exists = this.fieldQueue.some(item => item.field === fieldName);
            if (exists) return;

            this.fieldQueue.push({ field: fieldName, label: label || '' });
            if (!this.isProcessingField && this.activeTab === 'ai-vision' && this.currentAnimationKey === 'ai-classify') {
                this.startAIClassifyAnimation();
            }
        },



        getAnalysisLogs: debounce(function () {
            const id = this.routeData.id || this.$route.params.taskId;
            if (!id) return;
            getAnalyseLog({ id }).then(res => {
                if (res.code === 200 && res.data) {
                    this.analysisLogs = this.formatAnalysisLogs(res.data);
                }
            }).catch(() => {
                this.$message.error(this.$t('jobWorkMonitoring.analysisLogFailed'));
            })
        }, 500),
        formatAnalysisLogs(logs) {
            if (!this.isFileServerTask) {
                return logs || {};
            }
            return {
                classification: logs && logs.classification ? logs.classification : ''
            };
        },
        handleRefresh() {
            this.getAnalysisLogs();
        },
        handleReturn() {
            sessionStorage.setItem('prevPage', 'jobMonitoring');
            sessionStorage.removeItem('jobMonitoring_routeData');
            this.$router.push({
                path: '/core/classificationTask/hierarchicalTask'
            });
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const logContainer = this.$refs.logContainer;
                if (logContainer) {
                    requestAnimationFrame(() => {
                        logContainer.scrollTop = logContainer.scrollHeight;
                    });
                }
            });
        },
        getLabelByKey(key) {
            const labelMap = {
                dirtyDataNum: this.$t('jobWorkMonitoring.analysisLabels.dirtyDataNum'),
                classification: this.$t('jobWorkMonitoring.analysisLabels.classification'),
                aiNoteFilling: this.$t('jobWorkMonitoring.analysisLabels.aiNoteFilling'),
                classificationNum: this.$t('jobWorkMonitoring.analysisLabels.classificationNum'),
                featureDataNum: this.$t('jobWorkMonitoring.analysisLabels.featureDataNum')
            };
            return labelMap[key] || key;
        },
        getStepLabel(name) {
            const i18nKey = `jobWorkMonitoring.stepLabels.${name}`;
            return this.$te(i18nKey) ? this.$t(i18nKey) : name;
        },
        getAnimationKeyByStepName(stepName) {
            const animationMap = {
                '噪音数据过滤': 'noise-filter',
                '语义填充': 'semantic-fill',
                '文本摘要': 'semantic-fill',
                '语义缓存': 'semantic-fill',
                '匹配规则': 'rule-match',
                'AI分类打标': 'ai-classify',
                '个人信息识别': 'personal-scan',
                '样本特征提取': 'feature-extract'
            };
            return stepName ? (animationMap[stepName] || '') : '';
        },
        // ========== AI动效方法 ==========
        stopAllAnimations() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            if (this.noiseAnimationId) {
                cancelAnimationFrame(this.noiseAnimationId);
                this.noiseAnimationId = null;
            }
            if (this.neuralAnimationId) {
                cancelAnimationFrame(this.neuralAnimationId);
                this.neuralAnimationId = null;
            }
            if (this.labelingAnimationId) {
                cancelAnimationFrame(this.labelingAnimationId);
                this.labelingAnimationId = null;
            }
            if (this.scanInterval) {
                clearInterval(this.scanInterval);
                this.scanInterval = null;
            }
            if (this.semanticInterval) {
                clearInterval(this.semanticInterval);
                this.semanticInterval = null;
            }
            if (this.tagInterval) {
                clearInterval(this.tagInterval);
                this.tagInterval = null;
            }
            if (this.matchInterval) {
                clearInterval(this.matchInterval);
                this.matchInterval = null;
            }
            this.isProcessingField = false;
            this.robotStamping = false;
        },
        startAIAnimations() {
            if (this.currentAnimationKey === 'personal-scan' && this.scanInterval) {
                return;
            }

            this.stopAllAnimations();

            switch (this.currentAnimationKey) {
                case 'noise-filter':
                    this.startNoiseFilterAnimation();
                    break;
                case 'semantic-fill':
                    this.startSemanticFillAnimation();
                    break;
                case 'rule-match':
                    this.startRuleMatchAnimation();
                    break;
                case 'ai-classify':
                    this.startAIClassifyAnimation();
                    break;
                case 'personal-scan':
                    this.startPersonalScanAnimation();
                    break;
                case 'feature-extract':
                    this.startFeatureExtractAnimation();
                    break;
                default:
                    break;
            }
        },
        // 步骤1: 噪音过滤动画
        startNoiseFilterAnimation() {
            const canvas = this.$refs.noiseCanvas;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);

            // 初始化粒子
            const particles = [];
            const particleCount = 60;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.offsetWidth * 0.3,
                    y: Math.random() * canvas.offsetHeight,
                    vx: 1 + Math.random() * 2,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: 3 + Math.random() * 4,
                    isNoise: Math.random() > 0.6,
                    opacity: 0.8,
                    filtered: false
                });
            }

            const filterX = canvas.offsetWidth * 0.5;

            const animate = () => {
                ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

                ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
                ctx.fillRect(filterX - 20, 0, 40, canvas.offsetHeight);

                ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
                ctx.lineWidth = 1;
                for (let y = 0; y < canvas.offsetHeight; y += 20) {
                    ctx.beginPath();
                    ctx.moveTo(filterX - 20, y);
                    ctx.lineTo(filterX + 20, y);
                    ctx.stroke();
                }

                particles.forEach((p, idx) => {
                    // 更新位置
                    p.x += p.vx;
                    p.y += p.vy;

                    // 检查是否到达过滤器
                    if (p.x > filterX - 10 && p.x < filterX + 10 && !p.filtered) {
                        if (p.isNoise) {
                            // 噪音粒子被过滤，向上或向下偏移
                            p.vy = (Math.random() > 0.5 ? 1 : -1) * 3;
                            p.vx = 0.2;
                            p.opacity = 0.3;
                            p.filtered = true;
                        } else {
                            // 正常粒子通过
                            p.filtered = true;
                        }
                    }

                    // 粒子超出画布则重置
                    if (p.x > canvas.offsetWidth || p.y < 0 || p.y > canvas.offsetHeight) {
                        p.x = Math.random() * canvas.offsetWidth * 0.2;
                        p.y = Math.random() * canvas.offsetHeight;
                        p.vx = 1 + Math.random() * 2;
                        p.vy = (Math.random() - 0.5) * 0.5;
                        p.opacity = 0.8;
                        p.filtered = false;
                        p.isNoise = Math.random() > 0.6;
                    }

                    ctx.beginPath();
                    if (p.isNoise) {
                        ctx.fillStyle = `rgba(220, 38, 38, ${p.opacity})`;
                    } else {
                        ctx.fillStyle = `rgba(22, 163, 74, ${p.opacity})`;
                    }
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();

                    // 绘制粒子尾迹
                    if (!p.filtered) {
                        ctx.beginPath();
                        ctx.strokeStyle = p.isNoise ?
                            `rgba(220, 38, 38, ${p.opacity * 0.4})` :
                            `rgba(22, 163, 74, ${p.opacity * 0.4})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p.x - 15, p.y);
                        ctx.stroke();
                    }
                });

                this.noiseAnimationId = requestAnimationFrame(animate);
            };

            animate();
        },
        // 步骤2: 语义填充动画
        startSemanticFillAnimation() {
            // 清除之前的定时器
            if (this.semanticInterval) {
                clearInterval(this.semanticInterval);
                this.semanticInterval = null;
            }

            // 如果没有源文本，显示默认文本并启动演示动画
            if (!this.typewriterText) {
                this.typewriterText = this.$t('jobWorkMonitoring.semanticFillDemo');
            }

            // 如果打字机已完成且数据没变，不重复执行
            if (this.typewriterCompleted && this.displayedTypewriterText === this.typewriterText) {
                return;
            }

            // 重置打字机状态
            this.displayedTypewriterText = '';
            this.typewriterIndex = 0;
            this.typewriterCompleted = false;

            // 启动打字机动画
            this.semanticInterval = setInterval(() => {
                if (this.typewriterIndex < this.typewriterText.length) {
                    this.displayedTypewriterText += this.typewriterText[this.typewriterIndex];
                    this.typewriterIndex++;
                } else {
                    clearInterval(this.semanticInterval);
                    this.semanticInterval = null;
                    this.typewriterCompleted = true;
                }
            }, 80);
        },

        restartTypewriterAnimation() {
            // 清除之前的定时器
            if (this.semanticInterval) {
                clearInterval(this.semanticInterval);
                this.semanticInterval = null;
            }
            // 重置状态并重新开始
            this.displayedTypewriterText = '';
            this.typewriterIndex = 0;

            this.typewriterCompleted = false;
            // 延迟一小段时间再开始，让用户能看到文本清空
            setTimeout(() => {
                if (this.currentAnimationKey === 'semantic-fill' && this.activeTab === 'ai-vision') {
                    this.startSemanticFillAnimation();
                }
            }, 100);
        },

        // 步骤3: 规则匹配动画
        startRuleMatchAnimation() {
            if (this.matchInterval) {
                clearInterval(this.matchInterval);
                this.matchInterval = null;
            }

            let currentLineIndex = 0;

            // 重置所有连线状态
            this.matchLines.forEach(line => line.active = false);
            this.leftNodes.forEach(node => node.matched = false);
            this.rightNodes.forEach(node => node.matched = false);

            this.matchInterval = setInterval(() => {
                if (currentLineIndex < this.matchLines.length) {
                    this.matchLines[currentLineIndex].active = true;
                    // 同时激活对应的节点
                    if (currentLineIndex < this.leftNodes.length) {
                        this.leftNodes[currentLineIndex].matched = true;
                    }
                    if (currentLineIndex < this.rightNodes.length) {
                        this.rightNodes[currentLineIndex].matched = true;
                    }
                    currentLineIndex++;
                } else {
                    // 重置并重新开始
                    currentLineIndex = 0;
                    this.matchLines.forEach(line => line.active = false);
                    this.leftNodes.forEach(node => node.matched = false);
                    this.rightNodes.forEach(node => node.matched = false);
                }
            }, 800);
        },

        startAIClassifyAnimation() {
            // 取消之前的动画
            if (this.labelingAnimationId) {
                cancelAnimationFrame(this.labelingAnimationId);
                this.labelingAnimationId = null;
            }
            this.robotStamping = false;

            // 如果队列为空，重置状态并等待
            if (!this.fieldQueue.length) {
                this.labelingBoxes = [];
                this.robotStatus = this.$t('jobWorkMonitoring.robotWaiting');
                this.isProcessingField = false;
                return;
            }

            // 从队列中取出一个字段
            const fieldData = this.fieldQueue.shift();
            const fieldName = fieldData.field;
            const fieldLabel = fieldData.label;

            this.isProcessingField = true;

            // 创建盒子，初始位置在左侧外面
            const box = {
                id: this.nextBoxId++,
                field: fieldName,
                label: fieldLabel,
                x: -120,  // 初始位置在左侧
                stamped: false
            };
            this.labelingBoxes = [box];
            this.robotStatus = this.$t('jobWorkMonitoring.fieldEntering', { field: fieldName });

            let startTime = null;
            const moveDuration = 1500; // 移动到机器人位置的时间
            const startX = -120;
            const targetX = 350; // 机器人位置

            const moveToRobot = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / moveDuration, 1);
                // 使用缓动函数
                const easeOut = 1 - Math.pow(1 - progress, 3);
                box.x = startX + (targetX - startX) * easeOut;
                // 更新盒子位置 - 使用新对象触发 Vue 响应式更新
                this.labelingBoxes = [{ ...box }];

                if (progress < 1) {
                    this.labelingAnimationId = requestAnimationFrame(moveToRobot);
                } else {
                    // 到达机器人位置，开始分析
                    this.robotStatus = this.$t('jobWorkMonitoring.fieldAnalyzing', { field: fieldName });
                    setTimeout(() => {
                        // 开始打标
                        this.robotStatus = this.$t('jobWorkMonitoring.fieldLabeling', { field: fieldName });
                        this.robotStamping = true;
                        setTimeout(() => {
                            // 打标完成
                            box.stamped = true;
                            this.labelingBoxes = [{ ...box }];
                            this.robotStamping = false;
                            this.robotStatus = this.$t('jobWorkMonitoring.fieldMarked', { field: fieldName });

                            // 等待一会儿后移出
                            setTimeout(() => {
                                this.robotStatus = this.$t('jobWorkMonitoring.fieldLeaving', { field: fieldName });
                                let moveOutStart = null;
                                const moveOutDuration = 1200;
                                const exitTargetX = 900; // 移出到右侧

                                const moveOut = (ts) => {
                                    if (!moveOutStart) moveOutStart = ts;
                                    const el = ts - moveOutStart;
                                    const prog = Math.min(el / moveOutDuration, 1);
                                    const easeIn = prog * prog;
                                    box.x = targetX + (exitTargetX - targetX) * easeIn;
                                    this.labelingBoxes = [{ ...box }];

                                    if (prog < 1) {
                                        this.labelingAnimationId = requestAnimationFrame(moveOut);
                                    } else {
                                        // 移出完成，处理下一个
                                        this.isProcessingField = false;
                                        if (this.fieldQueue.length) {
                                            setTimeout(() => this.startAIClassifyAnimation(), 500);
                                        } else {
                                            this.labelingBoxes = [];
                                            this.robotStatus = this.$t('jobWorkMonitoring.robotWaiting');
                                        }
                                    }
                                };
                                this.labelingAnimationId = requestAnimationFrame(moveOut);
                            }, 600);
                        }, 400);
                    }, 1000);
                }
            };

            this.labelingAnimationId = requestAnimationFrame(moveToRobot);
        },
        // 步骤5: 个人信息扫描动画
        startPersonalScanAnimation() {
            if (this.scanInterval) {
                clearInterval(this.scanInterval);
                this.scanInterval = null;
            }
            // 重置扫描位置为 -1 表示未开始
            this.scanLinePosition = -1;

            // 延迟一帧再开始，确保之前的清除生效
            this.$nextTick(() => {
                this.scanLinePosition = 0;
                this.piiStats = { phone: 0, idCard: 0, email: 0, address: 0 };
                this.scanRows = this.scanRows.map(r => ({ ...r, scanned: false }));

                this.scanInterval = setInterval(() => {
                    this.scanLinePosition += 2;

                    // 检查扫描到的行
                    const rowHeight = 100 / this.scanRows.length;
                    this.scanRows.forEach((row, idx) => {
                        const rowTop = idx * rowHeight;
                        if (this.scanLinePosition > rowTop && !row.scanned) {
                            row.scanned = true;
                            if (row.isPII) {
                                // 更新统计
                                if (row.piiType === '手机号') this.piiStats.phone++;
                                if (row.piiType === '身份证') this.piiStats.idCard++;
                                if (row.piiType === '邮箱') this.piiStats.email++;
                                if (row.piiType === '地址') this.piiStats.address++;
                            }
                        }
                    });

                    // 扫描完成后重置
                    if (this.scanLinePosition > 100) {
                        setTimeout(() => {
                            this.scanLinePosition = 0;
                            this.piiStats = { phone: 0, idCard: 0, email: 0, address: 0 };
                            this.scanRows = this.scanRows.map(r => ({ ...r, scanned: false }));
                        }, 500);
                    }
                }, 50);
            });
        },
        // 步骤6: 特征提取动画 - 神经网络
        startFeatureExtractAnimation() {
            const canvas = this.$refs.neuralCanvas;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);

            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;

            // 创建神经网络节点
            const layers = [4, 6, 8, 6, 4];
            const nodes = [];
            const layerSpacing = width / (layers.length + 1);

            layers.forEach((count, layerIdx) => {
                const nodeSpacing = height / (count + 1);
                for (let i = 0; i < count; i++) {
                    nodes.push({
                        x: layerSpacing * (layerIdx + 1),
                        y: nodeSpacing * (i + 1),
                        layer: layerIdx,
                        activation: 0,
                        pulsePhase: Math.random() * Math.PI * 2
                    });
                }
            });

            // 创建连接
            const connections = [];
            let nodeIndex = 0;
            for (let l = 0; l < layers.length - 1; l++) {
                const currentLayerStart = nodeIndex;
                const currentLayerEnd = nodeIndex + layers[l];
                const nextLayerStart = currentLayerEnd;
                const nextLayerEnd = nextLayerStart + layers[l + 1];

                for (let i = currentLayerStart; i < currentLayerEnd; i++) {
                    for (let j = nextLayerStart; j < nextLayerEnd; j++) {
                        connections.push({
                            from: i,
                            to: j,
                            signal: 0,
                            signalPhase: Math.random() * Math.PI * 2
                        });
                    }
                }
                nodeIndex = currentLayerEnd;
            }

            let time = 0;
            const animate = () => {
                ctx.clearRect(0, 0, width, height);
                time += 0.05;

                // 绘制连接
                connections.forEach(conn => {
                    const fromNode = nodes[conn.from];
                    const toNode = nodes[conn.to];

                    // 计算信号位置
                    conn.signal = (Math.sin(time * 2 + conn.signalPhase) + 1) / 2;

                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 + conn.signal * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(fromNode.x, fromNode.y);
                    ctx.lineTo(toNode.x, toNode.y);
                    ctx.stroke();

                    // 绘制信号点
                    const signalX = fromNode.x + (toNode.x - fromNode.x) * conn.signal;
                    const signalY = fromNode.y + (toNode.y - fromNode.y) * conn.signal;
                    ctx.beginPath();
                    ctx.fillStyle = `rgba(99, 102, 241, 0.9)`;
                    ctx.arc(signalX, signalY, 2, 0, Math.PI * 2);
                    ctx.fill();
                });

                // 绘制节点
                nodes.forEach(node => {
                    node.activation = (Math.sin(time * 3 + node.pulsePhase) + 1) / 2;

                    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 15);
                    gradient.addColorStop(0, `rgba(59, 130, 246, ${0.2 + node.activation * 0.3})`);
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    ctx.beginPath();
                    ctx.fillStyle = gradient;
                    ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.fillStyle = `rgba(99, 102, 241, ${0.7 + node.activation * 0.3})`;
                    ctx.arc(node.x, node.y, 5 + node.activation * 2, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.lineWidth = 1;
                    ctx.arc(node.x, node.y, 5 + node.activation * 2, 0, Math.PI * 2);
                    ctx.stroke();
                });

                this.neuralAnimationId = requestAnimationFrame(animate);
            };

            animate();

            // 更新特征条
            this.tagInterval = setInterval(() => {
                this.featureBars = this.featureBars.map(() => ({
                    height: 20 + Math.random() * 60
                }));
            }, 500);
        },
        // 截断标签文字
        truncateLabel(label) {
            if (!label) return 'LABEL';
            return label.length > 6 ? label.substring(0, 5) + '..' : label;
        }
    }
};
</script>

<style scoped>
.task-progress-container {
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 52px);
    min-height: 0;
    box-sizing: border-box;
    overflow: hidden;
}

.task-info-card {
    margin-bottom: 24px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
}

.task-info-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
}

.custom-dialog {
    .el-dialog {
        border-radius: 10px;
    }

    .el-dialog__header {
        border-bottom: 1px solid #e6e6e6;
    }
}

.task-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.task-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
}

.task-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.task-name {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: #111827;
    letter-spacing: -0.5px;
}

.status-tag {
    border-radius: 6px;
}

.other-info {
    display: flex;
    gap: 25px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #6b7280;
    font-weight: 500;
}

.info-value {
    font-size: 14px;
    color: #1f2937;
}

.error-reason {
    margin: 0;
    color: #dc2626;
    font-size: 14px;
    padding: 12px;
    background: #fef2f2;
    border-left: 3px solid #dc2626;
    border-radius: 4px;
}

.error-text {
    color: #dc2626;
    font-weight: 600;
}

.force-terminate-btn {
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.3s;
}

.other-info:hover .force-terminate-btn {
    opacity: 1;
}

.force-terminate-content {
    padding: 10px 0;
}

.warning-message {
    margin: 0 0 20px 0;
    color: #dc2626;
    font-size: 14px;
    padding: 12px;
    background: #fef2f2;
    border-left: 3px solid #dc2626;
    border-radius: 4px;
}

.main-content-wrapper {
    display: flex;
    flex: 1 1 0;
    gap: 24px;
    align-items: stretch;
    margin-bottom: 24px;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}

.left-panel {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
    min-height: 0;
}

.right-panel {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
    min-height: 0;
}

.table-carousel-card,
.steps-card,
.progress-card,
.tab-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.steps-card {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    height: 0;
    min-height: 0;
    overflow: hidden;
}

.tab-card {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    height: 0;
    min-height: 0;
    overflow: hidden;
}

/*CURRENT_CHANGE*/
.table-carousel-card {
    height: 140px;
    display: flex;
    flex-direction: column;
}

/*CURRENT_CHANGE*/
.progress-card {
    height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.table-carousel-card:hover,
.steps-card:hover,
.progress-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
}

.header-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.header-divider {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.2), transparent);
}

/*CURRENT_CHANGE*/
.carousel-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
}

/*CURRENT_CHANGE*/
.carousel-item {
    padding: 6px 12px;
    border-radius: 6px;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid #e5e7eb;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    min-width: 0;
}

/*CURRENT_CHANGE*/
.carousel-item.prev,
/*CURRENT_CHANGE*/
.carousel-item.next {
    background: #f9fafb;
    opacity: 0.5;
    padding: 4px 10px;
}

/*CURRENT_CHANGE*/
.carousel-item.current {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.08));
    border: 2px solid #3b82f6;
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.12);
    opacity: 1;
    padding: 8px 14px;
}

/* 轮播动画效果 - 在切换时应用 */
.carousel-container-animating .carousel-content {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-container-animating .carousel-item.prev {
    animation: slideOutUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.carousel-container-animating .carousel-item.current {
    animation: slideInFromBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.carousel-container-animating .carousel-item.next {
    animation: slideOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* 关键帧动画定义 */
@keyframes slideInFromBottom {
    0% {
        transform: translateY(100%);
        opacity: 0;
    }

    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideOutUp {
    0% {
        transform: translateY(0);
        opacity: 1;
    }

    100% {
        transform: translateY(-100%);
        opacity: 0;
    }
}

@keyframes slideOutDown {
    0% {
        transform: translateY(0);
        opacity: 1;
    }

    100% {
        transform: translateY(100%);
        opacity: 0;
    }
}

/*CURRENT_CHANGE*/
.table-name-small {
    font-size: 10px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

/*CURRENT_CHANGE*/
.table-name-main {
    font-size: 14px;
    font-weight: 700;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.steps-list {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    gap: 10px;
    height: 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding-right: 4px;
}

.step-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-item:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
}

.step-item.completed {
    background: #f0fdf4;
    border-color: #dcfce7;
}

.step-item.processing {
    background: #eff6ff;
    border-color: #dbeafe;
}

.step-item.error {
    background: #fef2f2;
    border-color: #fecaca;
}

.step-item.skip {
    background: #fefce8;
    border-color: #fef08a;
}

.step-item.pending {
    background: #f9fafb;
    border-color: #e5e7eb;
}

.step-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    font-size: 16px;
}

.step-item.completed .step-icon {
    color: #22c55e;
}

.step-item.processing .step-icon {
    color: #3b82f6;
}

.step-item.error .step-icon {
    color: #ef4444;
}

.step-item.skip .step-icon {
    color: #eab308;
}

.step-item.pending .step-icon {
    color: #d1d5db;
}

.step-content {
    flex: 1;
    min-width: 0;
}

.step-name {
    font-size: 13px;
    font-weight: 500;
    color: #111827;
    margin-bottom: 4px;
}

.step-time,
.step-status {
    font-size: 12px;
    color: #9ca3af;
}

/*CURRENT_CHANGE*/
.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

/*CURRENT_CHANGE*/
.progress-label {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/*CURRENT_CHANGE*/
.progress-text {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
}

.custom-progress-container {
    width: 100%;
}

/deep/ .el-progress {
    padding-top: 0;
}

/deep/ .el-progress__text {
    display: none;
}

/deep/ .el-progress-bar {
    padding-right: 0;
}

/deep/ .el-progress-bar__outer {
    height: 8px !important;
    background: #e5e7eb;
    border-radius: 4px;
}

/deep/ .el-progress-bar__bar {
    border-radius: 4px;
    background: linear-gradient(90deg, #3b82f6, #6366f1) !important;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/deep/ .el-tabs {
    color: #111827;
}

.tab-card /deep/ .el-tabs {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}

/deep/ .el-tabs__header {
    border-bottom: 1px solid #e5e7eb !important;
    margin: 0 0 20px 0 !important;
}

/deep/ .el-tabs__nav {
    border: none !important;
}

/deep/ .el-tabs__item {
    color: #6b7280 !important;
    font-size: 13px;
    font-weight: 500;
}

/deep/ .el-tabs__item.is-active {
    color: #3b82f6 !important;
}

/deep/ .el-tabs__active-bar {
    background: linear-gradient(90deg, #3b82f6, #6366f1) !important;
}

.tab-card /deep/ .el-tabs__content {
    flex: 1 1 0;
    height: 0;
    min-height: 0;
}

.tab-card /deep/ .el-tab-pane {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    height: 100%;
}

/* ========== AI视图样式 ========== */
.ai-vision-container {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 0;
    background: transparent;
    height: 100%;
}

.ai-effect-wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    min-height: 0;
    height: 100%;
}

/* 将深色头部改为浅色主题 */
.ai-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.ai-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    letter-spacing: 0.5px;
}

.ai-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #3b82f6;
    font-weight: 500;
    padding: 6px 14px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 20px;
    border: 1px solid rgba(59, 130, 246, 0.2);
}

.status-dot {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    animation: statusPulse 1.5s ease-in-out infinite;
}

@keyframes statusPulse {

    0%,
    100% {
        opacity: 1;
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
    }

    50% {
        opacity: 0.8;
        box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
    }
}

/* 将画布区域改为浅色背景 */
.ai-canvas-container {
    flex: 1;
    min-width: 0;
    min-height: 0;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02);
}

.effect-panel {
    width: 100%;
    height: 100%;
    position: relative;
}

.no-animation-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px;
}

.no-animation-step {
    margin: 0;
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
}

.effect-canvas {
    width: 100%;
    height: 100%;
}

/* 步骤1: 噪音过滤样式 */
.noise-filter .effect-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

.filter-gate {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.gate-line {
    width: 3px;
    height: 80px;
    background: linear-gradient(180deg, transparent, #3b82f6, transparent);
    border-radius: 2px;
}

/* 过滤器标签改为浅色 */
.gate-label {
    padding: 6px 16px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 20px;
    color: #3b82f6;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1px;
}

/* 步骤2: 语义填充样式 */
.semantic-fill {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.typewriter-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.typewriter-line {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 16px;
    color: #0f172a;
    padding: 16px 20px;
    background: rgba(99, 102, 241, 0.06);
    border: 1px solid rgba(99, 102, 241, 0.25);
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(99, 102, 241, 0.15);
    position: relative;
    overflow: hidden;
    width: 80%;
    max-width: 720px;
    text-align: left;
    min-height: 50px;
    word-wrap: break-word;
    word-break: break-all;
}

.typewriter-text {
    display: inline;
    background: linear-gradient(90deg, #0ea5e9, #6366f1, #22c55e);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.typewriter-cursor {
    display: inline-block;
    vertical-align: middle;
    width: 2px;
    height: 1.2em;
    background: #6366f1;
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
    margin-left: 2px;
}

.typewriter-cursor.blink {
    animation: cursorBlink 1s step-end infinite;
}

@keyframes cursorBlink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}

.semantic-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    width: 100%;
    max-width: 500px;
}

/* 语义单元格改为浅色 */
.semantic-cell {
    padding: 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    text-align: center;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.semantic-cell.filled {
    background: rgba(34, 197, 94, 0.08);
    border-color: rgba(34, 197, 94, 0.4);
}

.semantic-cell.filling {
    border-color: #3b82f6;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
}

.cell-text {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
    position: relative;
    z-index: 1;
}

.semantic-cell.filled .cell-text {
    color: #16a34a;
}

.fill-wave {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.15) 100%);
    animation: fillUp 0.8s ease-out forwards;
}

@keyframes fillUp {
    0% {
        transform: translateY(100%);
    }

    100% {
        transform: translateY(0);
    }
}

.ai-beam {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #3b82f6, transparent);
    animation: beamScan 2s linear infinite;
}

@keyframes beamScan {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

/* 步骤3: 规则匹配样式 */
.rule-match {
    padding: 20px;
}

.match-svg {
    width: 100%;
    height: 100%;
}

/* 节点样式改为浅色 */
.node-circle {
    fill: #ffffff;
    stroke: #cbd5e1;
    stroke-width: 2;
    transition: all 0.3s ease;
}

.node-circle.active {
    fill: rgba(59, 130, 246, 0.15);
    stroke: #3b82f6;
    filter: url(#glow);
}

.rule-rect {
    fill: #ffffff;
    stroke: #cbd5e1;
    stroke-width: 2;
    transition: all 0.3s ease;
}

.rule-rect.active {
    fill: rgba(34, 197, 94, 0.15);
    stroke: #22c55e;
    filter: url(#glow);
}

.node-text {
    fill: #475569;
    font-size: 12px;
    text-anchor: middle;
    font-weight: 500;
}

.match-line {
    stroke: #cbd5e1;
    stroke-width: 2;
    fill: none;
    stroke-dasharray: 8 4;
    opacity: 0.5;
    transition: all 0.3s ease;
    vector-effect: non-scaling-stroke;
}

.match-line.active {
    stroke: url(#matchGrad);
    stroke-width: 3;
    opacity: 1;
    stroke-linecap: round;
    stroke-dasharray: 28 12;
    animation: lineFlow 1s linear infinite;
}

@keyframes lineFlow {
    0% {
        stroke-dashoffset: 0;
    }

    100% {
        stroke-dashoffset: -20;
    }
}

/* 步骤4: AI分类样式 - SVG机器人打标签，填满容器 */
.ai-classify {
    width: 100%;
    height: 100%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
}

.robot-labeling-svg {
    height: 100%;
}

/* 传送带条纹动画 */
.belt-stripes {
    animation: beltMoveRight 2.2s linear infinite;
}

@keyframes beltMoveRight {
    0% {
        transform: translateX(0px);
    }

    100% {
        transform: translateX(32px);
    }
}

/* 眼睛发光动画 */
.eye-glow {
    animation: eyePulse 2s ease-in-out infinite;
}

@keyframes eyePulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.6;
    }
}

/* 天线灯闪烁 */
.antenna-light {
    animation: antennaFlash 1s ease-in-out infinite;
}

@keyframes antennaFlash {

    0%,
    100% {
        opacity: 1;
        fill: #ef4444;
    }

    50% {
        opacity: 0.4;
        fill: #fca5a5;
    }
}

/* 屏幕处理条动画 */
.process-bar {
    animation: processBarPulse 1.5s ease-in-out infinite;
}

.process-bar.bar-1 {
    animation-delay: 0s;
}

.process-bar.bar-2 {
    animation-delay: 0.2s;
}

.process-bar.bar-3 {
    animation-delay: 0.4s;
}

.process-bar.bar-4 {
    animation-delay: 0.6s;
}

@keyframes processBarPulse {

    0%,
    100% {
        opacity: 0.6;
    }

    50% {
        opacity: 1;
    }
}

/* 机器人手臂打标动作 */
.robot-right-arm {
    transition: transform 0.3s ease;
    transform-origin: 480px 140px;
}

.robot-right-arm.stamping {
    transform: rotate(15deg);
}

.robot-right-arm.stamping .stamp-tool {
    transform: translateY(10px);
}

.stamp-tool {
    transition: transform 0.3s ease;
}

/* 移除 CSS 动画，使用 JS 控制位置 */
.field-box-group {
    transition: none;
}

.field-box-group.stamped {
    /* 打标后的样式 */
}

.stamp-label {
    animation: stampAppear 0.3s ease forwards;
}

/* @keyframes stampAppear {
    0% {
        opacity: 0;
        transform: scale(0.5) rotate(-12deg);
    }

    100% {
        opacity: 1;
        transform: scale(1) rotate(-12deg);
    }
} */

/* 步骤5: 个人信息扫描样式 */
.personal-scan {
    display: flex;
    gap: 20px;
    padding: 20px;
}

/* 扫描区域改为浅色 */
.scan-area {
    flex: 1;
    position: relative;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.data-rows {
    padding: 16px;
}

.data-row {
    padding: 10px 16px;
    margin-bottom: 8px;
    background: #f8fafc;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    border: 1px solid transparent;
}

.data-row.scanned {
    background: #f1f5f9;
}

.data-row.highlighted {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.08);
}

.row-content {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    color: #64748b;
}

.data-row.highlighted .row-content {
    color: #d97706;
}

.pii-badge {
    padding: 2px 8px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border-radius: 10px;
    font-size: 10px;
    color: #ffffff;
    font-weight: 600;
    animation: badgePop 0.3s ease;
}

@keyframes badgePop {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

.scan-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #22c55e, transparent);
    box-shadow: 0 0 10px #22c55e, 0 0 20px #22c55e;
    transition: top 0.05s linear;
}

.scan-glow {
    position: absolute;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(180deg, rgba(34, 197, 94, 0.15), transparent);
    transition: top 0.05s linear;
    pointer-events: none;
}

/* 统计卡片改为浅色 */
.pii-stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 120px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #f59e0b;
}

.stat-label {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
}

/* 步骤6: 特征提取样式 */
.feature-extract {
    display: flex;
    gap: 20px;
    padding: 20px;
}

/* 神经网络画布改为浅色 */
.feature-extract .effect-canvas {
    flex: 1;
    border-radius: 8px;
    background: rgba(248, 250, 252, 0.8);
}

.feature-output {
    width: 150px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.output-label {
    text-align: center;
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* 特征条改为浅色背景 */
.feature-bars {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 4px;
    padding: 12px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.feature-bar {
    flex: 1;
    background: linear-gradient(180deg, #6366f1, #3b82f6);
    border-radius: 2px 2px 0 0;
    transition: height 0.3s ease;
    animation: barPulse 1s ease-in-out infinite;
}

@keyframes barPulse {

    0%,
    100% {
        opacity: 0.8;
    }

    50% {
        opacity: 1;
    }
}

/* 步骤指示器改为浅色 */
.step-indicators {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow-x: auto;
}

.indicator-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.indicator-item.active {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
}

.indicator-item.completed {
    background: rgba(34, 197, 94, 0.08);
    border-color: rgba(34, 197, 94, 0.3);
}

.indicator-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #cbd5e1;
    transition: all 0.3s ease;
}

.indicator-item.active .indicator-dot {
    background: #3b82f6;
    box-shadow: 0 0 8px #3b82f6;
}

.indicator-item.completed .indicator-dot {
    background: #22c55e;
}

.indicator-label {
    font-size: 11px;
    color: #64748b;
    font-weight: 500;
}

.indicator-item.active .indicator-label {
    color: #3b82f6;
}

.indicator-item.completed .indicator-label {
    color: #16a34a;
}

/* 日志容器样式 */
.log-container,
.analysis-log-container {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 20px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    position: relative;
}

.log-container::-webkit-scrollbar,
.analysis-log-container::-webkit-scrollbar {
    width: 6px;
}

.log-container::-webkit-scrollbar-track,
.analysis-log-container::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 3px;
}

.log-container::-webkit-scrollbar-thumb,
.analysis-log-container::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

.log-container::-webkit-scrollbar-thumb:hover,
.analysis-log-container::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}

.timeline-connector {
    position: absolute;
    left: -29px;
    top: 16px;
    height: calc(100% + 20px);
    width: 2px;
    background: rgba(59, 130, 246, 0.3);
    z-index: 0;
}

.log-item,
.analysis-item {
    position: relative;
    margin-bottom: 15px;
    padding-left: 15px;
}

.log-list,
.analysis-list {
    margin-left: 36px;
    position: relative;
    z-index: 1;
}

.log-item,
.analysis-item {
    margin-bottom: 20px;
    line-height: 1.6;
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.timeline-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #3b82f6;
    position: absolute;
    left: -33px;
    top: 6px;
    z-index: 2;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    flex-shrink: 0;
}

.log-content {
    font-size: 13px;
    color: #374151;
    word-break: break-all;
    margin: 0;
}

.processing-item {
    opacity: 0.9;
}

.loading-icon {
    margin-left: 6px;
    animation: rotating 1.5s linear infinite;
    color: #3b82f6;
}

@keyframes rotating {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.analysis-label {
    color: #1f2937;
    font-weight: 500;
    min-width: 160px;
}

.analysis-value {
    color: #3b82f6;
    font-weight: 600;
    word-break: break-all;
}

.empty-state {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 0;
    padding: 20px;
    text-align: center;
}

.empty-state /deep/ .el-empty {
    padding: 0;
}

.button-group {
    text-align: right;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    flex-shrink: 0;
}

/deep/ .el-button {
    border-radius: 6px;
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/deep/ .el-button--default {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    color: #374151;
}

/deep/ .el-button--default:hover {
    background: #f9fafb;
    border-color: #d1d5db;
}

@media (max-width: 1200px) {
    .main-content-wrapper {
        flex-direction: column;
    }

    .left-panel {
        width: 100%;
    }

    .tab-card {
        min-height: 536px;
    }

    .other-info {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
    }

    .step-indicators {
        flex-wrap: wrap;
    }
}
</style>
