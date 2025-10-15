<template>
    <div class="mindmap-page">
        <div class="mindmap-container">
            <mindmap :nodes="nodes" :connections="connections" :options="mindmapOptions" class="custom-mindmap">
            </mindmap>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 核心：优化布局参数，解决节点混乱
            mindmapOptions: {
                layout: 'hierarchical', // 强制层级布局（关键！）
                direction: 'right',      // 从左到右排列（符合阅读习惯）
                zoom: 0.6,               // 初始缩放比例（六级节点建议偏小）
                levelDistance: 220,      // 层级间距（增大，避免重叠）
                siblingDistance: 50,     // 同层级节点间距（增大，避免拥挤）
                nodeWidth: 180,          // 节点宽度（固定，确保文本完整显示）
                nodeHeight: 50,          // 节点高度（固定，统一视觉效果）
                lineWidth: 2,            // 连接线宽度
                lineColor: '#ccc',       // 连接线颜色（浅灰更清晰）
                defaultNodeColor: '#42b983'
            },

            // 严格规范的六级节点数据（父级ID关联清晰）
            nodes: [
                // 根节点（不计入级别，仅作为起点）
                { id: 0, text: '中心主题', color: '#2c3e50', fontSize: 16 },

                // 第1级（根节点的直接子节点）
                { id: 1, text: '第一分类', parent: 0, color: '#3498db' },
                { id: 2, text: '第二分类', parent: 0, color: '#e74c3c' },
                { id: 3, text: '第三分类', parent: 0, color: '#f39c12' },

                // 第2级（关联第1级）
                { id: 4, text: '第一分类-子项1', parent: 1, color: '#3498db' },
                { id: 5, text: '第一分类-子项2', parent: 1, color: '#3498db' },
                { id: 6, text: '第二分类-子项1', parent: 2, color: '#e74c3c' },
                { id: 7, text: '第三分类-子项1', parent: 3, color: '#f39c12' },

                // 第3级（关联第2级）
                { id: 8, text: '第一子项-细节1', parent: 4, color: '#3498db' },
                { id: 9, text: '第一子项-细节2', parent: 4, color: '#3498db' },
                { id: 10, text: '第二子项-细节1', parent: 5, color: '#3498db' },
                { id: 11, text: '第二分类-细节1', parent: 6, color: '#e74c3c' },

                // 第4级（关联第3级）
                { id: 12, text: '细节1-元素1', parent: 8, color: '#3498db' },
                { id: 13, text: '细节1-元素2', parent: 8, color: '#3498db' },
                { id: 14, text: '细节2-元素1', parent: 9, color: '#3498db' },
                { id: 15, text: '第二分类-元素1', parent: 11, color: '#e74c3c' },

                // 第5级（关联第4级）
                { id: 16, text: '元素1-属性1', parent: 12, color: '#3498db' },
                { id: 17, text: '元素1-属性2', parent: 12, color: '#3498db' },
                { id: 18, text: '元素2-属性1', parent: 13, color: '#3498db' },
                { id: 19, text: '第二元素-属性1', parent: 15, color: '#e74c3c' },

                // 第6级（关联第5级）
                { id: 20, text: '属性1-特征1', parent: 16, color: '#3498db' },
                { id: 21, text: '属性1-特征2', parent: 16, color: '#3498db' },
                { id: 22, text: '属性2-特征1', parent: 17, color: '#3498db' },
                { id: 23, text: '第二属性-特征1', parent: 19, color: '#e74c3c' }
            ],

            connections: [] // 自动生成，无需手动配置
        }
    },
    methods: {
    }
}
</script>

<style scoped>
.mindmap-page {
    background-color: #f9f9f9;
    box-sizing: border-box;
    font-family: "Microsoft YaHei", sans-serif;
}

.mindmap-container {
    width: 100%;
    /* 足够高的容器，避免节点被截断 */
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    /* 允许滚动，避免节点超出容器 */
}

.custom-mindmap {
    width: 100%;
    height: 100%;
}

.controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
}

.btn {
    padding: 8px 16px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn:hover {
    background-color: #35956d;
}
</style>