<template>
    <div class="flow-chart-container">
        <div class="main-content">
            <div id="mindMapContainer">
                <el-button type="primary" @click="startStepLoad">分步加载</el-button>
            </div>
        </div>

        <!-- 右侧表单 -->
        <div class="form-container">
            <el-form ref="form" :model="form" label-width="80px" :rules="rules">
                <el-form-item label="企业名称" prop="companyName">
                    <el-input v-model="form.companyName"></el-input>
                </el-form-item>

                <el-form-item label="结构层级" prop="structureLevel">
                    <el-select v-model="form.structureLevel" placeholder="请选择结构层级">
                        <el-option label="2级" value="2"></el-option>
                        <el-option label="3级" value="3"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="form-buttons">
                <el-button type="primary" @click="handleGenerate">生成</el-button>
                <el-button type="success" @click="handleSave">保存</el-button>
                <el-button type="warning" @click="handleCancel">取消</el-button>
            </div>
        </div>

        <!-- 右键菜单 -->
        <div class="context-menu" v-show="show" :style="{ left: left + 'px', top: top + 'px' }">
            <!-- 原有右键菜单内容保持不变 -->
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
            type: "",
            currentNode: null,
            left: 0,
            top: 0,
            show: false,
            isRoot: false,
            isFirst: false,
            isLast: false,
            waitUid: '',
            fullData: {
                data: {
                    text: "根节点",
                },
                children: [],
            },
            // 表单数据
            form: {
                companyName: '',
                structureLevel: ''
            },
            rules: {
                companyName: [
                    { required: true, message: '请输入企业名称', trigger: 'blur' }
                ],
                structureLevel: [
                    { required: true, message: '请选择结构层级', trigger: 'change' }
                ]
            }
        };
    },
    // mounted方法保持不变
    mounted() {
        // 原有代码保持不变
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
            // 原有代码保持不变
            try {
                const createdNodes = list.filter((item) => {
                    return item.action === 'create';
                });

                if (createdNodes.length > 0) {
                    const lastCreate = createdNodes[createdNodes.length - 1];
                    const uid = lastCreate.data && lastCreate.data.data ? lastCreate.data.data.uid : null;

                    if (uid) {
                        setTimeout(() => {
                            const node = this.mindMap.renderer && this.mindMap.renderer.findNodeByUid ?
                                this.mindMap.renderer.findNodeByUid(uid) : null;

                            if (node) {
                                if (this.mindMap.renderer && this.mindMap.renderer.moveNodeToCenter) {
                                    this.mindMap.renderer.moveNodeToCenter(node);
                                }
                            } else {
                                this.waitUid = uid;
                            }
                        }, 100);
                    }
                }
            } catch (error) {
                console.error('处理data_change_detail事件时出错:', error);
            }
        });

        // 监听节点树渲染完成事件
        this.mindMap.on('node_tree_render_end', () => {
            // 原有代码保持不变
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
        // 原有方法保持不变
        startStepLoad() {
            // 原有代码...
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

            this.updateMindMapWithNewData(this.fullData);
        },

        generateUniqueId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },

        updateMindMapWithNewData(data) {
            // 原有代码...
        },

        loadNodesByBranch(originalData, currentData, branchIndex) {
            // 原有代码...
        },

        loadBranchRecursively(originalData, currentData, branchNode, level, onComplete) {
            // 原有代码...
        },

        addBranchNode(targetData, nodeToAdd) {
            // 原有代码...
        },

        moveNodeToCenter(nodeUid) {
            // 原有代码...
        },

        hideMenu() {
            // 原有代码...
        },

        insertChild() {
            // 原有代码...
        },

        insertSibling() {
            // 原有代码...
        },

        insertParent() {
            // 原有代码...
        },

        deleteNode() {
            // 原有代码...
        },

        moveUp() {
            // 原有代码...
        },

        moveDown() {
            // 原有代码...
        },

        // 表单按钮事件处理方法
        handleGenerate() {
            // 生成按钮点击事件
            console.log('生成按钮点击', this.form);
            // 可以根据表单数据生成对应的思维导图结构
        },
        handleSave() {
            // 保存按钮点击事件
            console.log('保存按钮点击', this.form);
            // 可以保存表单数据和当前思维导图状态
        },
        handleCancel() {
            // 取消按钮点击事件
            console.log('取消按钮点击');
            // 重置表单
            this.form = {
                companyName: '',
                structureLevel: ''
            };
        }
    },
};
</script>

<style lang="scss" scoped>
#mindMapContainer {
    width: 100%;
    height: 100%;
    background-color: white !important;
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
    display: flex;
    /* 使用flex布局 */
}

.main-content {
    flex: 1;
    /* 主内容区域占满剩余空间 */
    overflow: hidden;
}

.form-container {
    width: 300px;
    /* 表单宽度固定 */
    padding: 20px;
    border-left: 1px solid #e5e5e5;
    background-color: #fff;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
}

.form-buttons {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
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