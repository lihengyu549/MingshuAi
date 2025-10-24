<template>
    <div class="flow-chart-container">
        <div class="main-content">
            <div id="mindMapContainer">
            </div>
        </div>

        <!-- 右侧表单 -->
        <div class="form-container">
            <el-form ref="form" :model="form" label-width="80px" :rules="rules">
                <el-form-item label="企业名称" prop="enterpriseName">
                    <el-input v-model="form.enterpriseName"></el-input>
                </el-form-item>

                <el-form-item label="结构层级" prop="structureLevel">
                    <el-select v-model="form.structureLevel" placeholder="请选择结构层级">
                        <!-- <el-option label="2级" value="2"></el-option> -->
                        <el-option label="3级" value="3"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="form-buttons">
                <!-- 生成按钮添加禁用状态控制 -->
                <el-button type="primary" plain @click="handleGenerate" :disabled="!canGenerate || isGenerating"
                    :loading="isGenerating" :icon="generateIcon">生成</el-button>
                <el-button type="success" plain @click="handleSave" :disabled="!canSave">保存</el-button>
                <el-button type="warning" plain @click="handleCancel" :disabled="!canCancel">取消</el-button>
            </div>
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
import { generateStandard, saveGenerateStandard, cancelGenerateStandard } from '@/api/system/proxys'
import axios from 'axios'
export default {
    name: "FlowChart",
    data() {
        return {
            generate: null,
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
            // 存储最新收到的完整数据
            latestFullData: null,
            // 表单数据
            form: {
                enterpriseName: '',
                structureLevel: '3'
            },
            rules: {
                enterpriseName: [
                    { required: true, message: '请输入企业名称', trigger: 'blur' }
                ],
                structureLevel: [
                    { required: true, message: '请选择结构层级', trigger: 'change' }
                ]
            },
            // 状态变量
            canGenerate: false,
            canSave: false,
            canCancel: false,
            websocket: null,
            isGenerating: false,
            generateIcon: '',
            // 控制节点生成的状态
            isGeneratingNodes: false,
            nodeGenerationDelay: 0, // 增加节点生成间隔时间，让用户能看清逐个生成的效果
            batchUpdate: false,
            updateQueue: [],
            batchUpdateInterval: 100 // 批量更新间隔，可根据需要调整
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

        // 监听表单变化，当表单填写完整时允许生成
        this.$watch('form', (newVal) => {
            this.canGenerate = !!newVal.enterpriseName && !!newVal.structureLevel;
        }, { deep: true });
    },
    beforeDestroy() {
        // 组件销毁前关闭WebSocket连接
        if (this.websocket) {
            this.websocket.close();
        }
    },
    methods: {
        generateUniqueId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },

        updateMindMapWithNewData(data) {
            if (this.batchUpdate) {
                // 如果处于批量更新模式，加入队列
                this.updateQueue.push(data);
                return;
            }

            if (this.mindMap) {
                this.mindMap.setData(data);
            } else {
                this.mindMap = new MindMap({
                    el: document.getElementById("mindMapContainer"),
                    enableFreeDrag: true,
                    data: data,
                });
            }
        },

        // 递归比较并添加新节点 - 改进为严格按照层级顺序逐个生成
        async compareAndAddNodes(targetParent, sourceNodes, level = 1) {
            if (!sourceNodes || !sourceNodes.length || !this.isGenerating) return;

            // 先处理当前层级的所有节点
            for (let i = 0; i < sourceNodes.length; i++) {
                if (!this.isGenerating) break;

                const sourceNode = sourceNodes[i];
                // 优先通过uid判断，没有uid再结合文本和其他关键属性
                let existingNode = null;
                if (targetParent.children) {
                    existingNode = targetParent.children.find(child =>
                        (child.data.uid && sourceNode.data.uid && child.data.uid === sourceNode.data.uid) ||
                        (!child.data.uid && !sourceNode.data.uid && child.data.text === sourceNode.data.text)
                    );
                }

                let newNode;
                let isNewNode = false;

                if (!existingNode) {
                    isNewNode = true;
                    newNode = {
                        data: {
                            ...sourceNode.data,
                            // 保留原节点uid（如果有），增强唯一性
                            uid: sourceNode.data.uid || this.generateUniqueId()
                        },
                        children: []
                    };

                    if (!targetParent.children) {
                        targetParent.children = [];
                    }
                    targetParent.children.push(newNode);

                    // 更新思维导图
                    this.updateMindMapWithNewData(this.fullData);

                    // 等待渲染完成
                    await new Promise(resolve => setTimeout(resolve, 50));

                    // 将新节点居中显示
                    if (this.mindMap && this.mindMap.renderer) {
                        const node = this.mindMap.renderer.findNodeByUid(newNode.data.uid);
                        if (node && this.mindMap.renderer.moveNodeToCenter) {
                            this.mindMap.renderer.moveNodeToCenter(node);
                        }
                    }

                    // 等待动画完成
                    await new Promise(resolve => setTimeout(resolve, this.nodeGenerationDelay));
                } else {
                    newNode = existingNode;
                    // 同步更新已有节点的数据，避免数据不一致
                    newNode.data = { ...newNode.data, ...sourceNode.data };
                }

                // 递归处理子节点，确保层级顺序
                if (sourceNode.children && sourceNode.children.length) {
                    await this.compareAndAddNodes(newNode, sourceNode.children, level + 1);
                }
            }
        },

        // 处理WebSocket返回的完整数据，实现逐级逐个节点生成
        async processFullData(newData) {
            this.latestFullData = newData;

            if (this.isGeneratingNodes) {
                return;
            }

            this.isGeneratingNodes = true;
            // 关闭批量更新，确保逐个节点生成
            this.batchUpdate = false;
            this.updateQueue = [];

            try {
                if (newData.data && newData.data.text) {
                    this.fullData.data.text = newData.data.text;
                    // 更新根节点并居中
                    this.updateMindMapWithNewData(this.fullData);
                    await new Promise(resolve => setTimeout(resolve, this.nodeGenerationDelay));
                }

                // 严格按照层级顺序生成节点
                await this.compareAndAddNodes(this.fullData, newData.children || []);

                // 清理可能的重复节点
                this.cleanDuplicateNodes(this.fullData);
                this.updateMindMapWithNewData(this.fullData);

            } catch (error) {
                console.error('处理节点生成时出错:', error);
            } finally {
                this.isGeneratingNodes = false;
            }
        },
        cleanDuplicateNodes(node) {
            if (!node.children || node.children.length === 0) return;

            // 记录已存在的节点标识
            const existingIds = new Set();
            const uniqueChildren = [];

            node.children.forEach(child => {
                const identifier = child.data.uid || child.data.text;
                if (!existingIds.has(identifier)) {
                    existingIds.add(identifier);
                    uniqueChildren.push(child);
                    // 递归清理子节点
                    this.cleanDuplicateNodes(child);
                }
            });

            node.children = uniqueChildren;
        },


        loadNodesByBranch(originalData, currentData, branchIndex) {
            if (!originalData.children || !currentData.children) return;
            if (branchIndex < originalData.children.length) {
                const targetChild = originalData.children[branchIndex];
                const currentChild = currentData.children[branchIndex] || { data: { text: '新节点' }, children: [] };
                currentChild.data.uid = targetChild.data.uid || this.generateUniqueId();
                this.loadBranchRecursively(originalData, currentChild, targetChild, 1);
            }
        },

        loadBranchRecursively(originalData, currentData, branchNode, level, onComplete) {
            if (!branchNode) return;
            currentData.data = { ...currentData.data, ...branchNode.data };
            currentData.data.uid = currentData.data.uid || this.generateUniqueId();

            if (branchNode.children && branchNode.children.length > 0) {
                currentData.children = currentData.children || [];
                branchNode.children.forEach((child, index) => {
                    currentData.children[index] = currentData.children[index] || { data: { text: '子节点' }, children: [] };
                    this.loadBranchRecursively(originalData, currentData.children[index], child, level + 1, onComplete);
                });
            }

            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }
        },

        addBranchNode(targetData, nodeToAdd) {
            if (targetData.children) {
                targetData.children.push(nodeToAdd);
            } else {
                targetData.children = [nodeToAdd];
            }
        },

        moveNodeToCenter(nodeUid) {
            if (!nodeUid) return;
            const node = this.mindMap.renderer.findNodeByUid(nodeUid);
            if (node && this.mindMap.renderer.moveNodeToCenter) {
                this.mindMap.renderer.moveNodeToCenter(node);
            }
        },

        hideMenu() {
            this.show = false;
        },

        insertChild() {
            console.log("插入子节点");
            this.mindMap.execCommand("INSERT_CHILD_NODE", this.currentNode);
            this.hideMenu();
        },

        insertSibling() {
            this.mindMap.execCommand("INSERT_NODE", this.currentNode);
            this.hideMenu();
        },

        insertParent() {
            this.mindMap.execCommand("INSERT_PARENT_NODE", this.currentNode);
            this.hideMenu();
        },

        deleteNode() {
            this.mindMap.execCommand("REMOVE_NODE", this.currentNode);
            this.hideMenu();
        },

        moveUp() {
            this.mindMap.execCommand("UP_NODE", this.currentNode);
            this.hideMenu();
        },

        moveDown() {
            this.mindMap.execCommand("DOWN_NODE", this.currentNode);
            this.hideMenu();
        },

        // 生成按钮事件
        async handleGenerate() {
            this.isGenerating = true;
            this.generateIcon = '';
            this.canSave = false;
            this.canCancel = false;

            // 将根节点名称改为企业名称
            this.fullData.data.text = this.form.enterpriseName;
            this.updateMindMapWithNewData(this.fullData);

            try {
                // 发送HTTP请求
                generateStandard({
                    enterpriseName: this.form.enterpriseName,
                    structureLevel: this.form.structureLevel
                }).then(response => {
                    this.generate = response.data;
                    if (response.code !== 200) {
                        this.$message.error('请求失败，状态码: ' + response.code);
                        this.cleanupGeneration(false);
                    } else {
                        this.$message.success('生成请求已发送，正在生成数据...');
                    }
                }).catch(error => {
                    console.error('生成请求出错:', error);
                    this.$message.error('生成请求失败，请重试');
                    this.cleanupGeneration(false);
                });

                // 建立WebSocket连接
                new Promise(resolve => {
                    this.connectWebSocket(resolve);
                }).catch(error => {
                    console.error('WebSocket连接出错:', error);
                    this.$message.error('WebSocket连接失败');
                });

            } catch (error) {
                console.error('生成过程出错:', error);
                this.$message.error('生成失败，请重试');
                this.cleanupGeneration();
            }
        },

        // 清理生成状态的方法
        cleanupGeneration(isSuccess = false) {
            this.isGenerating = false;
            this.isGeneratingNodes = false; // 停止节点生成
            if (isSuccess) {
                this.generateIcon = 'el-icon-success';
                setTimeout(() => {
                    this.generateIcon = '';
                }, 3000);
            } else {
                this.generateIcon = '';
                if (this.websocket) {
                    this.websocket.close();
                    this.websocket = null;
                }
            }
        },

        // 获取当前用户名的方法
        getUserName() {
            try {
                const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
                if (userInfo) {
                    const user = JSON.parse(userInfo);
                    return user.username || user.userName || user.loginName || user.name;
                }
                if (this.$store && this.$store.getters && this.$store.getters.username) {
                    return this.$store.getters.username;
                }
            } catch (error) {
                console.error('获取用户名失败:', error);
            }
            return null;
        },

        // 建立WebSocket连接的方法
        connectWebSocket(resolve) {
            const currentUser = this.getUserName() || 'admin';
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
            // const wsUrl = `ws://192.168.7.84:8080/system/generateWebSocket/${currentUser}/${this.fullData.data.text}`; //本地
            const wsUrl = `wss://${hostName}:443/system/generateWebSocket/${currentUser}/${this.fullData.data.text}`; // 线上

            this.websocket = new WebSocket(
                wsUrl,
                protocols
            );

            // 连接成功
            this.websocket.onopen = () => {
                console.log('WebSocket连接已建立');
                this.$message.success('开始接收思维导图数据...');
                resolve();
            };

            // 接收消息
            this.websocket.onmessage = (event) => {
                try {
                    console.log('收到WebSocket数据:', event.data);
                    
                    // 检查返回值是否为'执行完成'
                    if (event.data === '执行完成') {
                        console.log('收到执行完成信号，准备关闭连接');
                        this.$message.success('思维导图生成完成');
                        
                        // 恢复按钮状态
                        this.cleanupGeneration(true);
                        this.canSave = true;
                        this.canCancel = true;
                        this.isGeneratingNodes = false;
                        
                        // 关闭WebSocket连接
                        if (this.websocket) {
                            this.websocket.close();
                            this.websocket = null;
                        }
                        return;
                    }
                    
                    const data = JSON.parse(event.data);
                    console.log('解析后的数据:', data);

                    // 处理结束标识
                    if (data && data.isCompleted) {
                        this.$message.success('思维导图生成完成');
                        this.cleanupGeneration(true);
                        this.canSave = true;
                        this.canCancel = true;
                        return;
                    }

                    // 处理完整数据，实现逐级逐个节点生成
                    if (data) {
                        this.processFullData(data);
                    } else {
                        console.warn('收到空数据');
                    }
                } catch (error) {
                    console.error('解析WebSocket数据出错:', error);
                    console.error('原始数据:', event.data);
                    this.$message.warning('数据格式可能不匹配，继续等待...');
                }
            };

            // 连接关闭
            this.websocket.onclose = () => {
                console.log('WebSocket连接已关闭');
                if (this.isGenerating) {
                    this.$message.warning('数据传输已结束');
                    this.isGenerating = false;
                }
            };

            // 连接错误
            this.websocket.onerror = (error) => {
                console.error('WebSocket错误:', error);
                this.$message.error('连接出错，请重试');
                this.cleanupGeneration(false);
                this.canSave = false;
                this.canCancel = false;
            };
        },

        // 保存按钮事件
        handleSave() {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    try {

                        const response = await saveGenerateStandard({id: this.generate.id});

                        if (response.data.success) {
                            this.$message.success('保存成功');
                        } else {
                            this.$message.error('保存失败: ' + (response.data.message || '未知错误'));
                        }
                    } catch (error) {
                        console.error('保存请求出错:', error);
                        this.$message.error('保存失败，请重试');
                    }
                } else {
                    console.log('表单验证失败');
                    return false;
                }
            });
        },

        async handleCancel() {
            try {
                const response = await cancelGenerateStandard({id: this.generate.id});
                if (response.data.success) {
                    this.$message.success('取消成功');
                } else {
                    this.$message.error('取消失败: ' + (response.data.message || '未知错误'));
                }
            } catch (error) {
                console.error('取消请求出错:', error);
                this.$message.error('取消失败，请重试');
            }
            this.canGenerate = false;
            this.canSave = false;
            this.canCancel = false;
            if (this.websocket) {
                this.websocket.close();
                this.websocket = null;
            }
            this.isGenerating = false;
            this.isGeneratingNodes = false;
            // 重置思维导图
            this.fullData = {
                data: {
                    text: "根节点",
                },
                children: [],
            };
            this.updateMindMapWithNewData(this.fullData);
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
}

.main-content {
    flex: 1;
    overflow: hidden;
}

.form-container {
    width: 300px;
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