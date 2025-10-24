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
                <el-button type="primary" @click="handleGenerate" :disabled="!canGenerate || isGenerating"
                    :loading="isGenerating" :icon="generateIcon">生成</el-button>
                <el-button type="success" @click="handleSave" :disabled="!canSave">保存</el-button>
                <el-button type="warning" @click="handleCancel" :disabled="!canCancel">取消</el-button>
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
import { generateStandard } from '@/api/system/proxys'
import axios from 'axios' // 补充axios引入，原代码handleSave使用了axios
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
            canGenerate: false, // 控制生成按钮是否可点击
            canSave: false,     // 控制保存按钮是否可点击
            canCancel: false,   // 控制取消按钮是否可点击
            websocket: null,    // WebSocket实例
            isGenerating: false, // 标记是否正在生成中
            generateIcon: '',   // 生成按钮图标
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

        // 处理WebSocket返回的增量数据
        addMindMapData(data) {
            if (data && data.data) {
                data.data.uid = this.generateUniqueId();

                if (data.isRoot) {
                    this.fullData = data;
                    this.updateMindMapWithNewData(this.fullData);
                } else {
                    this.addBranchNode(this.fullData, data);
                    this.updateMindMapWithNewData(this.fullData);
                }
            }
        },

        loadNodesByBranch(originalData, currentData, branchIndex) {
            // 原有逻辑：根据分支索引加载节点
            if (!originalData.children || !currentData.children) return;
            if (branchIndex < originalData.children.length) {
                const targetChild = originalData.children[branchIndex];
                const currentChild = currentData.children[branchIndex] || { data: { text: '新节点' }, children: [] };
                currentChild.data.uid = targetChild.data.uid || this.generateUniqueId();
                this.loadBranchRecursively(originalData, currentChild, targetChild, 1);
            }
        },

        loadBranchRecursively(originalData, currentData, branchNode, level, onComplete) {
            // 原有逻辑：递归加载分支节点
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
            // 原有逻辑：将指定UID的节点移动到中心
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

        // 生成按钮事件 - 修改根节点名称，同时发送请求和建立websocket连接（分开执行）
        async handleGenerate() {
            this.isGenerating = true;
            this.generateIcon = ''; // 重置图标
            // 禁用保存和取消按钮
            this.canSave = false;
            this.canCancel = false;

            // 将根节点名称改为企业名称
            this.fullData.data.text = this.form.enterpriseName;
            this.updateMindMapWithNewData(this.fullData);

            try {
                // 1. 发送HTTP请求（单独处理）
                generateStandard({
                    enterpriseName: this.form.enterpriseName,
                    structureLevel: this.form.structureLevel
                }).then(response => {
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

                // 2. 建立WebSocket连接（单独处理，不等待请求完成）
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
            if (isSuccess) {
                // 生成成功，显示success图标
                this.generateIcon = 'el-icon-success';
                // 3秒后恢复默认状态
                setTimeout(() => {
                    this.generateIcon = '';
                }, 3000);
                // 成功时不立即关闭连接，让WebSocket正常完成通信
            } else {
                // 生成失败，清空图标
                this.generateIcon = '';
                // 失败时才关闭连接
                if (this.websocket) {
                    this.websocket.close();
                    this.websocket = null;
                }
            }
        },

        // 获取当前用户名的方法
        getUserName() {
            try {
                // 从localStorage或sessionStorage中获取用户信息
                const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
                if (userInfo) {
                    const user = JSON.parse(userInfo);
                    return user.username || user.userName || user.loginName || user.name;
                }
                // 或者从store中获取
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
            // 获取当前用户名（从localStorage或sessionStorage中获取，这里假设用户名存储在token相关字段中）
            const currentUser = this.getUserName() || 'admin'; // 默认为admin
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
            // 使用固定的WebSocket连接地址
            const currentUrl = new URL(window.location.href);
            const hostName = currentUrl.hostname; // 只取主机名（IP或域名），不含端口
            const wsUrl = `ws://192.168.7.84:8080/system/generateWebSocket/${currentUser}`; //本地
            // const wsUrl = `wss://${hostName}:443/system/generateWebSocket/${currentUser}`; // 线上

            this.websocket = new WebSocket(
                wsUrl,
                protocols
            );

            // 连接成功
            this.websocket.onopen = () => {
                console.log('WebSocket连接已建立');
                this.$message.success('开始接收思维导图数据...');
                resolve(); // 通知Promise连接已建立
            };

            // 接收消息
            this.websocket.onmessage = (event) => {
                try {
                    console.log('收到WebSocket数据:', event.data);
                    // 正确解析JSON数据
                    const data = JSON.parse(event.data);
                    console.log('解析后的数据:', data);

                    // 处理结束标识 - 这是特定信息，收到后关闭连接并启用按钮
                    if (data && data.isCompleted) {
                        this.$message.success('思维导图生成完成');
                        // 生成成功，显示success图标并清理状态
                        this.cleanupGeneration(true);
                        // 启用保存和取消按钮
                        this.canSave = true;
                        this.canCancel = true;
                        return;
                    }

                    // 增量更新思维导图
                    if (data) {
                        this.addMindMapData(data);
                    } else {
                        console.warn('收到空数据');
                    }
                } catch (error) {
                    console.error('解析WebSocket数据出错:', error);
                    console.error('原始数据:', event.data);
                    // 只显示错误，不关闭连接
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

        // 保存按钮事件 - 验证并提交表单
        handleSave() {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    try {
                        // 发送保存请求（根据实际后端地址修改）
                        const response = await axios.post('/api/save-form', this.form);

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

        handleCancel() {
            this.$refs.form.resetFields();
            this.canGenerate = false;
            this.canSave = false;
            this.canCancel = false;
            // 关闭WebSocket连接
            if (this.websocket) {
                this.websocket.close();
                this.websocket = null;
            }
            this.isGenerating = false;
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