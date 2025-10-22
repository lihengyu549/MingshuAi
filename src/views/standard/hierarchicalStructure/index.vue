<template>
    <div class="flow-chart-container">
        <div id="mindMapContainer"></div>
        <!-- 右键菜单 -->
        <div class="context-menu" v-show="show" :style="{ left: left + 'px', top: top + 'px' }">
            <div class="menu-item" @click="insertChild" v-if="type === 'node'">
                插入子节点
            </div>
            <div class="menu-item" @click="insertSibling" v-if="type === 'node' && !isRoot">
                插入同级节点
            </div>
            <div class="menu-item" @click="insertParent" v-if="type === 'node' && !isRoot">
                插入父节点
            </div>
            <div class="menu-item" @click="deleteNode" v-if="type === 'node' && !isRoot">
                删除节点
            </div>
            <div class="menu-item" @click="moveUp" v-if="type === 'node' && !isRoot && !isFirst">
                上移节点
            </div>
            <div class="menu-item" @click="moveDown" v-if="type === 'node' && !isRoot && !isLast">
                下移节点
            </div>
        </div>
    </div>
</template>

<script>
import MindMap from "simple-mind-map";
import "simple-mind-map/dist/simpleMindMap.esm.css";
export default {
    name: "FlowChart",
    data() {
        return {
            mindMap: null,
            // 右键菜单相关数据
            type: "", // 当前右键点击的类型
            currentNode: null, // 当前右键点击的节点
            left: 0, // 菜单显示的位置
            top: 0,
            show: false, // 是否显示菜单
            isRoot: false, // 是否是根节点
            isFirst: false, // 是否是同级第一个节点
            isLast: false, // 是否是同级最后一个节点
        };
    },
    mounted() {
        this.mindMap = new MindMap({
            el: document.getElementById("mindMapContainer"),
            enableFreeDrag: true,
            data: {
                data: {
                    text: "根节点",
                },
                children: [
                    {
                        data: {
                            text: "子节点1",
                        },
                        children: [
                            {
                                data: {
                                    text: "分支节点1",
                                },
                            },
                            {
                                data: {
                                    text: "分支节点2",
                                },
                            },
                        ],
                    },
                    {
                        data: {
                            text: "子节点2",
                        },
                        children: [
                            {
                                data: {
                                    text: "分支节点3",
                                },
                            },
                            {
                                data: {
                                    text: "分支节点4",
                                },
                            },
                        ],
                    },
                ],
            },
        });

        // 监听节点右键事件
        this.mindMap.on("node_contextmenu", (e, node) => {
            e.preventDefault();
            this.type = "node";
            this.left = e.clientX + 10;
            this.top = e.clientY + 10;
            this.show = true;
            this.currentNode = node;

            // 判断节点类型
            this.isRoot = node.isRoot;
            if (!this.isRoot) {
                const siblings = node.parent.children;
                this.isFirst = siblings[0] === node;
                this.isLast = siblings[siblings.length - 1] === node;
            }
        });

        // 点击其他区域隐藏菜单
        this.mindMap.on("node_click", this.hideMenu);
        this.mindMap.on("draw_click", this.hideMenu);
    },
    methods: {
        // 隐藏菜单
        hideMenu() {
            this.show = false;
            this.left = 0;
            this.top = 0;
            this.type = "";
            this.currentNode = null;
        },
        // 插入子节点
        insertChild() {
            console.log("插入子节点");
            this.mindMap.execCommand("INSERT_CHILD_NODE", this.currentNode);
            this.hideMenu();
        },
        // 插入同级节点
        insertSibling() {
            this.mindMap.execCommand("INSERT_NODE", this.currentNode);
            this.hideMenu();
        },
        // 插入父节点
        insertParent() {
            this.mindMap.execCommand("INSERT_PARENT_NODE", this.currentNode);
            this.hideMenu();
        },
        // 删除节点
        deleteNode() {
            this.mindMap.execCommand("REMOVE_NODE", this.currentNode);
            this.hideMenu();
        },
        // 上移节点
        moveUp() {
            this.mindMap.execCommand("UP_NODE", this.currentNode);
            this.hideMenu();
        },
        // 下移节点
        moveDown() {
            this.mindMap.execCommand("DOWN_NODE", this.currentNode);
            this.hideMenu();
        },
    },
};
</script>

<style lang="scss" scoped>
#mindMapContainer {
    width: 100%;
    height: 100%;
}

#mindMapContainer * {
    margin: 0;
    padding: 0;
}

.flow-chart-container {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
}

.context-menu {
    position: fixed;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    padding: 5px 0;
    z-index: 1000;

    .menu-item {
        padding: 7px 16px;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        transition: all 0.3s;

        &:hover {
            background: #f5f5f5;
        }
    }
}
</style>
