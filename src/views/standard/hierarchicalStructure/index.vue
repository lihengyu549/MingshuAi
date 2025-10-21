<template>
    <div class="mindmap-container">
        <div class="mindmap-wrapper"> <!-- 容器样式优化 -->
            <!-- 根节点 -->
            <div v-if="rootVisible" class="node root-node" :style="{ left: rootLeft + 'px', top: rootTop + 'px' }">
                <div class="node-content">{{ rootDisplayText }}</div>
            </div>

            <!-- 连接线和子节点容器（保持不变） -->
            <div class="connections-container">
                <div v-for="connection in displayedConnections" :key="connection.id">
                    <div class="connection-line" :style="connection.style"></div>
                </div>
            </div>
            <div class="nodes-container">
                <div v-for="node in displayedNodes" :key="node.id">
                    <div class="node child-node" :style="node.style" :class="node.levelClass">
                        <div class="node-content">{{ node.displayText }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
let nodeId = 0
let connectionId = 0

export default {
    name: 'MindMap',
    data() {
        return {
            // 根节点位置调整（left从50→100，避免过左）
            rootLeft: 100,
            rootTop: 300, // 垂直居中更合理
            rootLabel: '设计一个新的智能家居产品',
            rootDisplayText: '',
            rootVisible: false,

            allNodes: [],
            allConnections: [],
            displayedNodes: [],
            displayedConnections: [],
            currentTextIndex: 0,
            currentNodeIndex: 0
        }
    },
    mounted() {
        nodeId = 0
        connectionId = 0
        this.initData()
        this.startAnimation()
    },
    methods: {
        initData() {
            const treeData = { // 保持原数据结构
                label: '智能家居产品',
                children: [
                    { label: '用户需求', children: [] },
                    { label: '市场趋势', children: [] },
                    {
                        label: '技术特点',
                        children: [
                            {
                                label: '基于声控的智能家居产品',
                                children: [
                                    {
                                        label: '功能设计', children: [
                                            { label: '语音识别', children: [] },
                                            {
                                                label: '语音合成', children: [
                                                    { label: '自然语言处理', children: [] },
                                                    {
                                                        label: '语音合成引擎', children: [
                                                            { label: '文本到语音转换', children: [] },
                                                            { label: '语音合成算法', children: [] }
                                                        ]
                                                    }
                                                ]
                                            },
                                            { label: '智能控制', children: [] }
                                        ]
                                    },
                                    { label: '用户界面设计', children: [] },
                                    { label: '市场定位', children: [] }
                                ]
                            },
                            { label: '基于手势控制的智能家居产品', children: [] },
                            { label: '基于环境感知的智能家居产品', children: [] }
                        ]
                    },
                ]
            }

            this.rootLabel = treeData.label
            // 一级节点起始left调整（从250→200，避免过右）
            this.parseTreeData(
                treeData.children,
                1,
                this.rootLeft + 200, // 核心调整：减小一级节点起始left
                this.rootTop,
                this.rootTop + 25
            )
        },

        // 新增：递归计算节点总高度（含所有子节点）
        calculateNodeTotalHeight(node, level) {
            const levelConfig = [
                { width: 100, height: 36, gap: 40 },
                { width: 220, height: 36, gap: 30 },
                { width: 120, height: 36, gap: 20 },
                { width: 100, height: 32, gap: 15 },
                { width: 100, height: 32, gap: 15 },
                { width: 100, height: 32, gap: 15 }
            ]
            const config = levelConfig[level - 1]
            if (!config) return 0

            // 节点自身高度
            let totalHeight = config.height

            // 累加所有子节点的总高度（含子节点间隙）
            if (node.children && node.children.length > 0) {
                let childrenTotalHeight = 0
                node.children.forEach((child, index) => {
                    const childHeight = this.calculateNodeTotalHeight(child, level + 1)
                    childrenTotalHeight += childHeight
                    // 最后一个子节点不加间隙
                    if (index < node.children.length - 1) {
                        childrenTotalHeight += config.gap
                    }
                })
                // 总高度取自身高度和子节点总高度的最大值（确保能容纳子节点）
                totalHeight = Math.max(totalHeight, childrenTotalHeight)
            }

            return totalHeight
        },

        // 修改：基于总高度计算节点位置
        parseTreeData(children, level, startLeft, parentTop, connectY) {
            if (!children || children.length === 0) return

            const levelConfig = [
                { width: 100, height: 36, gap: 40, bgColor: '#409EFF', textColor: '#fff' },
                { width: 220, height: 36, gap: 35, bgColor: '#67C23A', textColor: '#fff' },
                { width: 120, height: 36, gap: 30, bgColor: '#fff', border: '1px solid #ddd', textColor: '#333' },
                { width: 100, height: 32, gap: 30, bgColor: '#F56C6C', textColor: '#fff' },
                { width: 100, height: 32, gap: 25, bgColor: '#E6A23C', textColor: '#fff' },
                { width: 100, height: 32, gap: 20, bgColor: '#909399', textColor: '#fff' }
            ]
            const config = levelConfig[level - 1]
            if (!config) return

            // 关键：计算每个子节点的总高度（含嵌套子节点）
            const childHeights = children.map(child =>
                this.calculateNodeTotalHeight(child, level + 1)
            )

            // 计算当前层级所有子节点的总占用高度（含间隙）
            const totalHeight = childHeights.reduce((sum, height, index) => {
                return sum + height + (index < children.length - 1 ? config.gap : 0)
            }, 0)

            // 起始位置垂直居中于父节点
            const startTop = parentTop - totalHeight / 2
            let currentTop = startTop // 累加当前位置

            children.forEach((child, index) => {
                const childTotalHeight = childHeights[index]
                // 修复：叶子节点不需要垂直居中偏移
                const isLeafNode = !child.children || child.children.length === 0
                const nodeTop = isLeafNode
                    ? currentTop
                    : currentTop + (childTotalHeight - config.height) / 2

                // 添加节点
                this.allNodes.push({
                    id: `node-${nodeId++}`,
                    label: child.label,
                    displayText: '',
                    level: level,
                    levelClass: `level-${level}`,
                    style: {
                        left: startLeft + 'px',
                        top: nodeTop + 'px',
                        width: config.width + 'px',
                        height: config.height + 'px',
                        backgroundColor: config.bgColor,
                        color: config.textColor,
                        border: config.border || 'none',
                        borderRadius: '6px'
                    },
                    connectY: nodeTop + config.height / 2
                })

                // 添加连接线（保持逻辑，但位置基于动态计算的nodeTop）
                const lineStartX = level === 1 ? this.rootLeft + 180 : startLeft - 120
                const lineEndX = startLeft - 10

                // 水平连接线
                this.allConnections.push({
                    id: `conn-${connectionId++}`,
                    style: {
                        top: connectY + 'px',
                        left: lineStartX + 'px',
                        width: (lineEndX - lineStartX) + 'px',
                        height: '2px',
                        backgroundColor: '#ccc'
                    }
                })

                // 垂直连接线
                if (Math.abs(connectY - (nodeTop + config.height / 2)) > 5) {
                    this.allConnections.push({
                        id: `conn-${connectionId++}`,
                        style: {
                            top: Math.min(connectY, nodeTop + config.height / 2) + 'px',
                            left: lineEndX + 'px',
                            width: '2px',
                            height: Math.abs(connectY - (nodeTop + config.height / 2)) + 'px',
                            backgroundColor: '#ccc'
                        }
                    })
                }

                // 递归处理子节点
                if (child.children && child.children.length > 0) {
                    this.parseTreeData(
                        child.children,
                        level + 1,
                        startLeft + config.width + 120, // 水平间距保持120px
                        nodeTop + config.height / 2,
                        nodeTop + config.height / 2
                    )
                }

                if (index < children.length - 1) {
                    currentTop += isLeafNode ? config.height + config.gap : childTotalHeight + config.gap;
                } else {
                    currentTop += childTotalHeight;
                }
            })
        },

        // 动画相关方法（保持不变）
        startAnimation() {
            setTimeout(() => {
                this.rootVisible = true
                this.animateRootText()
            }, 500)
        },
        animateRootText() {
            if (this.currentTextIndex < this.rootLabel.length) {
                this.rootDisplayText = this.rootLabel.substring(0, this.currentTextIndex + 1)
                this.currentTextIndex++
                setTimeout(this.animateRootText, 50)
            } else {
                this.currentTextIndex = 0
                setTimeout(this.animateNextNode, 1000)
            }
        },
        animateNextNode() {
            if (this.currentNodeIndex < this.allNodes.length) {
                const node = { ...this.allNodes[this.currentNodeIndex] }
                this.displayedNodes.push(node)
                this.addConnectionsForNode(this.currentNodeIndex)
                this.animateNodeText(this.currentNodeIndex)
                this.currentNodeIndex++
            }
        },
        addConnectionsForNode(nodeIndex) {
            const start = nodeIndex * 2
            if (this.allConnections[start]) {
                this.displayedConnections.push(this.allConnections[start])
            }
            if (this.allConnections[start + 1]) {
                this.displayedConnections.push(this.allConnections[start + 1])
            }
        },
        animateNodeText(nodeIndexInAll) {
            const node = this.displayedNodes[this.displayedNodes.length - 1]
            if (this.currentTextIndex < node.label.length) {
                node.displayText = node.label.substring(0, this.currentTextIndex + 1)
                this.currentTextIndex++
                setTimeout(() => this.animateNodeText(nodeIndexInAll), 100)
            } else {
                this.currentTextIndex = 0
                setTimeout(this.animateNextNode, 300)
            }
        },
    }
}
</script>

<style scoped>
.mindmap-container {
    width: 100%;
    overflow-x: auto;
    padding: 40px;
    background-color: #f9f9f9;
    min-height: 1600px;
    /* 增加最小高度，避免垂直拥挤 */
}

.mindmap-wrapper {
    position: relative;
    height: auto;
    /* 改为auto，适应内容高度 */
    min-width: 1200px;
    /* 减小最小宽度，避免一级节点超出 */
    padding-bottom: 50px;
    /* 增加底部 padding，防止末级节点被截断 */
}

/* 其他样式保持不变 */
.node {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    opacity: 0;
    animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.root-node {
    width: 180px;
    height: 50px;
    background-color: #6200ee;
    color: white;
    font-weight: bold;
    font-size: 16px;
    border-radius: 6px;
}

.child-node {
    font-size: 14px;
}

.node-content {
    padding: 0 10px;
    text-align: center;
    white-space: nowrap;
}

.connections-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.connection-line {
    position: absolute;
    transform-origin: left center;
    opacity: 0;
    animation: lineFadeIn 0.5s forwards;
}

@keyframes lineFadeIn {
    from {
        opacity: 0;
        width: 0;
    }

    to {
        opacity: 1;
    }
}
</style>