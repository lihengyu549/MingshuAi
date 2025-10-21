<template>
    <div class="mindmap-container">
        <div class="mindmap-wrapper">
            <!-- 根节点 -->
            <div v-if="rootVisible" class="node root-node" :style="{ left: rootLeft + 'px', top: rootTop + 'px' }">
                <div class="node-content">{{ rootDisplayText }}</div>
            </div>

            <!-- 连接线容器 -->
            <div class="connections-container">
                <!-- 使用唯一ID作为key -->
                <div v-for="connection in displayedConnections" :key="connection.id">
                    <div class="connection-line" :style="connection.style"></div>
                </div>
            </div>

            <!-- 子节点容器 -->
            <div class="nodes-container">
                <!-- 同样使用唯一ID作为key -->
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
            // 根节点配置
            rootLeft: 50,
            rootTop: 200,
            rootLabel: '设计一个新的智能家居产品',
            rootDisplayText: '',
            rootVisible: false,

            // 节点和连接线数据（增加唯一ID）
            allNodes: [],
            allConnections: [],
            displayedNodes: [],
            displayedConnections: [],

            // 动画状态控制
            currentTextIndex: 0,
            currentNodeIndex: 0
        }
    },
    mounted() {
        // 重置ID计数器
        nodeId = 0
        connectionId = 0

        // 初始化数据
        this.initData()
        // 开始动画
        this.startAnimation()
    },
    methods: {
        // 初始化思维导图数据
        initData() {
            // 树形数据
            const treeData = {
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
                                    { label: '功能设计', children: [
                                        { label: '语音识别', children: [] },
                                        { label: '语音合成', children: [
                                            { label: '自然语言处理', children: [] },
                                            { label: '语音合成引擎', children: [
                                                { label: '文本到语音转换', children: [] },
                                                { label: '语音合成算法', children: [] }
                                            ] }
                                        ] },
                                        { label: '智能控制', children: [] }
                                    ] },
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

            // 解析树形结构生成节点和连接线
            this.parseTreeData(
                treeData.children,
                1,  // 从第一级子节点开始
                this.rootLeft + 250,  // 一级节点起始left位置
                this.rootTop,         // 根节点top位置
                this.rootTop + 25     // 根节点连接线起点（中心）
            )
        },

        // 解析树形数据
        parseTreeData(children, level, startLeft, parentTop, connectY) {
            if (!children || children.length === 0) return

            // 层级配置
            const levelConfig = [
                { width: 100, height: 36, gap: 40, bgColor: '#409EFF', textColor: '#fff' }, // 1级节点（蓝色）
                { width: 220, height: 36, gap: 30, bgColor: '#67C23A', textColor: '#fff' }, // 2级节点（绿色）
                { width: 120, height: 36, gap: 20, bgColor: '#fff', border: '1px solid #ddd', textColor: '#333' },  // 3级节点
                { width: 100, height: 32, gap: 15, bgColor: '#F56C6C', textColor: '#fff' },  // 4级节点（红色）
                { width: 100, height: 32, gap: 15, bgColor: '#E6A23C', textColor: '#fff' },  // 5级节点（黄色）
                { width: 100, height: 32, gap: 15, bgColor: '#909399', textColor: '#fff' }  // 6级节点（灰色）
            ]

            const config = levelConfig[level - 1]
            if (!config) return

            // 计算总高度和起始位置
            const totalHeight = (config.height + config.gap) * children.length - config.gap
            const startTop = parentTop - totalHeight / 2

            // 处理每个子节点
            children.forEach((child, index) => {
                const nodeTop = startTop + index * (config.height + config.gap)

                // 添加节点 - 增加唯一ID
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

                // 添加连接线 - 增加唯一ID
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
                        startLeft + config.width + 120,
                        nodeTop + config.height / 2,
                        nodeTop + config.height / 2
                    )
                }
            })
        },

        // 开始动画
        startAnimation() {
            setTimeout(() => {
                this.rootVisible = true
                this.animateRootText()
            }, 500)
        },

        // 根节点文字动画
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

        // 逐个显示子节点
        animateNextNode() {
            if (this.currentNodeIndex < this.allNodes.length) {
                const node = { ...this.allNodes[this.currentNodeIndex] }
                this.displayedNodes.push(node)

                this.addConnectionsForNode(this.currentNodeIndex)
                this.animateNodeText(this.currentNodeIndex)
                this.currentNodeIndex++
            }
        },

        // 为节点添加连接线
        addConnectionsForNode(nodeIndex) {
            const start = nodeIndex * 2
            if (this.allConnections[start]) {
                this.displayedConnections.push(this.allConnections[start])
            }
            if (this.allConnections[start + 1]) {
                this.displayedConnections.push(this.allConnections[start + 1])
            }
        },

        // 节点文字动画
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
        }
    }
}
</script>

<style scoped>
.mindmap-container {
    width: 100%;
    overflow-x: auto;
    padding: 40px;
    background-color: #f9f9f9;
    min-height: 500px;
}

.mindmap-wrapper {
    position: relative;
    height: 400px;
    min-width: 1600px;
}

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