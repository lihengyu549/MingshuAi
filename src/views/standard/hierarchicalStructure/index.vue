<template>
    <div class="flow-chart-container">
        <div id="mindMapContainer">
            <el-button type="primary" @click="startStepLoad">分步加载</el-button>
        </div>
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
            waitUid: '', // 等待移动到中心的节点UID
            fullData: {
                data: {
                    text: "根节点",
                },
                children: [],
            },
        };
    },
    mounted() {
        this.mindMap = new MindMap({
            el: document.getElementById("mindMapContainer"),
            enableFreeDrag: true,
            data: this.fullData,
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
        
        // 监听数据变化详情事件，获取新创建的节点
        this.mindMap.on('data_change_detail', (list) => {
            try {
                // 过滤出所有新创建的节点
                const createdNodes = list.filter((item) => {
                    return item.action === 'create';
                });
                
                // 获取最后创建的节点
                if (createdNodes.length > 0) {
                    const lastCreate = createdNodes[createdNodes.length - 1];
                    const uid = lastCreate.data && lastCreate.data.data ? lastCreate.data.data.uid : null;
                    
                    if (uid) {
                        
                        // 尝试立即找到节点并移动到中心
                        setTimeout(() => {
                            const node = this.mindMap.renderer && this.mindMap.renderer.findNodeByUid ? 
                                this.mindMap.renderer.findNodeByUid(uid) : null;
                            
                            if (node) {
                                // 节点已渲染，直接移动到中心
                                if (this.mindMap.renderer && this.mindMap.renderer.moveNodeToCenter) {
                                    this.mindMap.renderer.moveNodeToCenter(node);
                                }
                            } else {
                                // 节点尚未渲染，保存UID等待渲染完成
                                this.waitUid = uid;
                            }
                        }, 100); // 短暂延迟，确保节点可能已渲染
                    }
                }
            } catch (error) {
                console.error('处理data_change_detail事件时出错:', error);
            }
        });
        
        // 监听节点树渲染完成事件
        this.mindMap.on('node_tree_render_end', () => {
            try {
                if (this.waitUid) {
                    const uid = this.waitUid;
                    this.waitUid = '';
                    
                    const node = this.mindMap.renderer && this.mindMap.renderer.findNodeByUid ? 
                        this.mindMap.renderer.findNodeByUid(uid) : null;
                    
                    if (node) {
                        if (this.mindMap.renderer && this.mindMap.renderer.moveNodeToCenter) {
                            this.mindMap.renderer.moveNodeToCenter(node);
                        }
                    }
                }
            } catch (error) {
                console.error('处理node_tree_render_end事件时出错:', error);
            }
        });
    },
    methods: {
        startStepLoad() {
            // 创建新的结构数据，为每个节点添加唯一的UID
            this.fullData = {
                data: {
                    text: "根节点",
                    uid: this.generateUniqueId()
                },
                children: [
                    {
                        data: {
                            text: "子节点1",
                            uid: this.generateUniqueId()
                        },
                        children: [
                            {
                                data: {
                                    text: "分支节点1",
                                    uid: this.generateUniqueId()
                                },
                            },
                            {
                                data: {
                                    text: "分支节点2",
                                    uid: this.generateUniqueId()
                                },
                            },
                        ],
                    },
                    {
                        data: {
                            text: "子节点2",
                            uid: this.generateUniqueId()
                        },
                        children: [
                            {
                                data: {
                                    text: "分支节点3",
                                    uid: this.generateUniqueId()
                                },
                            },
                            {
                                data: {
                                    text: "分支节点4",
                                    uid: this.generateUniqueId()
                                },
                            },
                        ],
                    },
                ],
            };
            
            // 将新结构数据加载到思维导图中
            this.updateMindMapWithNewData(this.fullData);
        },
        
        // 生成唯一ID的方法
        generateUniqueId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },
        
        // 使用新数据更新思维导图 - 按分支逐步展示
        updateMindMapWithNewData(data) {
            try {
                this.waitUid = ''; // 清空等待的UID
                
                // 先创建一个只有根节点的数据结构
                const rootOnlyData = {
                    data: JSON.parse(JSON.stringify(data.data)),
                    children: []
                };
                
                // 先加载根节点
                if (this.mindMap && this.mindMap.updateData && typeof this.mindMap.updateData === 'function') {
                    this.mindMap.updateData(rootOnlyData);
                } else if (this.mindMap && this.mindMap.renderer && this.mindMap.renderer.setData) {
                    this.mindMap.renderer.setData(rootOnlyData);
                    if (this.mindMap.render && typeof this.mindMap.render === 'function') {
                        this.mindMap.render();
                    }
                } else {
                    console.error('无法更新思维导图数据：缺少必要的方法');
                    return;
                }
                
                // 延迟开始加载分支
                setTimeout(() => {
                    this.loadNodesByBranch(data, rootOnlyData, 0);
                }, 300);
            } catch (error) {
                console.error('更新思维导图数据时出错:', error);
            }
        },
        
        // 按照分支加载节点
        loadNodesByBranch(originalData, currentData, branchIndex) {
            // 如果没有更多分支需要加载，则结束
            if (!originalData.children || branchIndex >= originalData.children.length) {
                // 所有节点加载完成后，延迟一小段时间，确保最后的节点都已渲染
                setTimeout(() => {
                    // 尝试调整整体布局，确保所有节点可见
                    if (this.mindMap && this.mindMap.renderer && this.mindMap.renderer.fit) {
                        this.mindMap.renderer.fit();
                    }
                }, 500);
                return;
            }
            
            // 获取当前要加载的分支
            const currentBranch = originalData.children[branchIndex];
            
            // 为每个节点添加parentUid，方便定位父节点
            const addParentUids = (nodes, parentUid) => {
                nodes.forEach(node => {
                    node.parentUid = parentUid;
                    if (node.children && node.children.length > 0) {
                        addParentUids(node.children, node.data.uid);
                    }
                });
            };
            
            // 为根节点的子节点添加parentUid
            addParentUids(originalData.children, originalData.data.uid);
            
            // 加载当前分支的所有节点
            this.loadBranchRecursively(originalData, currentData, currentBranch, 0, () => {
                // 当前分支加载完成后，延迟加载下一个分支
                setTimeout(() => {
                    this.loadNodesByBranch(originalData, currentData, branchIndex + 1);
                }, 1000); // 分支之间的间隔时间
            });
        },
        
        // 递归加载单个分支的所有节点
        loadBranchRecursively(originalData, currentData, branchNode, level, onComplete) {
            // 深拷贝当前数据
            const updatedData = JSON.parse(JSON.stringify(this.mindMap.getData()));
            
            // 查找父节点并添加当前节点
            this.addBranchNode(updatedData, branchNode);
            
            // 更新数据
            if (this.mindMap && this.mindMap.updateData) {
                this.mindMap.updateData(updatedData);
            } else if (this.mindMap && this.mindMap.renderer && this.mindMap.renderer.setData) {
                this.mindMap.renderer.setData(updatedData);
                if (this.mindMap.render) {
                    this.mindMap.render();
                }
            }
            
            
            // 如果当前节点有子节点，递归加载子节点
            if (branchNode.children && branchNode.children.length > 0) {
                // 创建一个子节点加载的递归函数
                const loadChildNodes = (childIndex) => {
                    if (childIndex >= branchNode.children.length) {
                        // 所有子节点加载完成
                        if (onComplete) {
                            onComplete();
                        }
                        return;
                    }
                    
                    const childNode = branchNode.children[childIndex];
                    setTimeout(() => {
                        this.loadBranchRecursively(originalData, updatedData, childNode, level + 1, () => {
                            // 当前子节点及其所有后代加载完成后，加载下一个子节点
                            loadChildNodes(childIndex + 1);
                        });
                    }, 500); // 同一层级节点之间的间隔
                };
                
                // 开始加载子节点
                loadChildNodes(0);
            } else {
                // 没有子节点，当前分支加载完成
                if (onComplete) {
                    onComplete();
                }
            }
        },
        
        // 将分支节点添加到数据中
        addBranchNode(targetData, nodeToAdd) {
            const nodeMap = new Map();
            
            // 构建节点映射
            function buildNodeMap(node) {
                nodeMap.set(node.data.uid, node);
                if (node.children) {
                    node.children.forEach(child => buildNodeMap(child));
                }
            }
            
            buildNodeMap(targetData);
            
            // 找到父节点
            const parentUid = nodeToAdd.parentUid;
            const parentNode = nodeMap.get(parentUid);
            
            if (parentNode) {
                // 确保父节点有children数组
                if (!parentNode.children) {
                    parentNode.children = [];
                }
                
                // 检查节点是否已存在
                const existingNode = parentNode.children.find(child => child.data.uid === nodeToAdd.data.uid);
                if (!existingNode) {
                    // 创建新节点的副本，不包含children（子节点会在后续步骤中添加）
                    const newNode = JSON.parse(JSON.stringify(nodeToAdd));
                    newNode.children = []; // 清空子节点，避免一次性加载所有层级
                    parentNode.children.push(newNode);
                }
            }
        },
        
        // 将指定节点移动到画布中心（备用方法，当事件监听方式失败时使用）
        moveNodeToCenter(nodeUid) {
            if (!nodeUid || !this.mindMap || !this.mindMap.renderer) {
                return;
            }
            
            try {
                const node = this.mindMap.renderer.findNodeByUid(nodeUid);
                if (node && this.mindMap.renderer.moveNodeToCenter) {
                    this.mindMap.renderer.moveNodeToCenter(node);
                }
            } catch (error) {
                console.error('备用方法移动节点到中心时出错:', error);
            }
        },
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
