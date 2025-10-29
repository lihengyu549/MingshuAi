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
                        <el-option label="3级" value="3"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="form-buttons top-buttons">
                <el-button type="primary" plain @click="handleGenerate" :disabled="!canGenerate || isGenerating"
                    :loading="isGenerating" :icon="generateIcon">生成</el-button>
                <el-button type="danger" plain @click="handleTermination" :disabled="!isGenerating"
                    :loading="isTerminating">停止</el-button>
            </div>
            <div class="form-buttons bottom-buttons">
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
import { generateStandard, saveGenerateStandard, cancelGenerateStandard, terminationGenerateStandard } from '@/api/system/proxys'
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
            isTerminating: false,
            generateIcon: '',
            // 控制节点生成的状态
            isGeneratingNodes: false,
            nodeGenerationDelay: 500,
            batchUpdate: false,
            updateQueue: [],
            batchUpdateInterval: 100,
            // 逐字显示相关变量
            typingQueue: [], // 等待逐字显示的节点队列
            currentTypingNode: null, // 当前正在逐字显示的节点
            typingSpeed: 50, // 打字速度，毫秒/字
            typingComplete: true // 标记当前是否有正在进行的打字动画
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
        if (this.batchUpdateTimer) {
            clearInterval(this.batchUpdateTimer);
            this.batchUpdateTimer = null;
        }
    },
    methods: {
        // 初始化批量更新处理器
        initBatchUpdateProcessor() {
            // 清除已存在的定时器
            if (this.batchUpdateTimer) {
                clearInterval(this.batchUpdateTimer);
            }

            // 设置新的定时器来处理更新队列
            this.batchUpdateTimer = setInterval(() => {
                if (this.updateQueue.length > 0) {
                    // 获取队列中的最新数据
                    const latestData = this.updateQueue.pop();
                    // 清空队列，只应用最新的更新
                    this.updateQueue = [];

                    // 应用更新
                    if (this.mindMap) {
                        // 使用requestAnimationFrame确保DOM更新更流畅
                        requestAnimationFrame(() => {
                            this.mindMap.setData(latestData);
                        });
                    }
                }
            }, this.batchUpdateInterval);
        },

        // 优化的思维导图更新方法，减少闪烁
        updateMindMapWithNewData(data) {
            // 存储最新数据以供参考
            this.latestFullData = data;

            if (this.batchUpdate) {
                // 如果处于批量更新模式，加入队列并返回
                this.updateQueue.push(data);
                return;
            }

            if (this.mindMap) {
                // 使用requestAnimationFrame来优化渲染
                requestAnimationFrame(() => {
                    try {
                        // 使用增量更新而非全量更新
                        // 检查是否可以使用更细粒度的更新方法
                        if (this.mindMap.updateData && typeof this.mindMap.updateData === 'function') {
                            this.mindMap.updateData(data);
                        } else {
                            // 回退到setData方法，但尝试减少闪烁
                            this.mindMap.setData(data);
                        }
                    } catch (error) {
                        console.error('更新思维导图数据时出错:', error);
                        // 出错时强制更新
                        this.mindMap.setData(data);
                    }
                });
            } else {
                // 初始化思维导图
                this.mindMap = new MindMap({
                    el: document.getElementById("mindMapContainer"),
                    enableFreeDrag: true,
                    data: data,
                });

                // 初始化批量更新处理器
                this.initBatchUpdateProcessor();
            }
        },

        // 逐字显示节点文本
        typeWriter(nodeData, fullText, currentLength = 0) {
            if (!this.isGenerating) {
                // 如果生成已停止，直接显示完整文本
                nodeData.text = fullText;
                this.updateMindMapWithNewData(this.fullData);
                this.currentTypingNode = null;
                this.processNextInTypingQueue();
                return;
            }

            // 保存原始文本引用，用于恢复
            if (!nodeData.originalText) {
                nodeData.originalText = fullText;
            }

            // 显示当前长度的文本
            nodeData.text = fullText.substring(0, currentLength + 1);
            this.updateMindMapWithNewData(this.fullData);

            // 如果还没显示完，继续显示下一个字符
            if (currentLength + 1 < fullText.length) {
                setTimeout(() => {
                    this.typeWriter(nodeData, fullText, currentLength + 1);
                }, this.typingSpeed);
            } else {
                // 显示完成，处理下一个节点
                this.currentTypingNode = null;
                // 短暂延迟后处理下一个节点，让用户看清当前节点
                setTimeout(() => {
                    this.processNextInTypingQueue();
                }, 300);
            }
        },

        // 处理打字队列中的下一个节点
        processNextInTypingQueue() {
            if (this.typingQueue.length > 0 && !this.currentTypingNode && this.isGenerating) {
                const nextItem = this.typingQueue.shift();
                this.currentTypingNode = nextItem.nodeData;

                // 将节点居中显示
                if (this.mindMap && this.mindMap.renderer && nextItem.uid) {
                    try {
                        const node = this.mindMap.renderer.findNodeByUid(nextItem.uid);
                        if (node && this.mindMap.renderer.moveNodeToCenter) {
                            this.mindMap.renderer.moveNodeToCenter(node);
                        }
                    } catch (error) {
                        console.error('居中节点时出错:', error);
                    }
                }

                // 开始逐字显示
                this.typeWriter(nextItem.nodeData, nextItem.fullText);
            } else if (this.typingQueue.length === 0) {
                this.typingComplete = true;
            }
        },

        // 递归比较并添加新节点 - 严格按照层级顺序逐个生成
        async compareAndAddNodes(targetParent, sourceNodes, level = 1) {
            if (!sourceNodes || !sourceNodes.length || !this.isGenerating) return;

            // 先处理当前层级的所有节点
            for (let i = 0; i < sourceNodes.length; i++) {
                if (!this.isGenerating) break;

                const sourceNode = sourceNodes[i];
                // 确保sourceNode和sourceNode.data存在
                if (!sourceNode || !sourceNode.data) {
                    console.warn('跳过无效节点:', sourceNode);
                    continue;
                }

                // 优先通过uid判断
                let existingNode = null;
                if (targetParent.children && sourceNode.data.uid) {
                    existingNode = targetParent.children.find(child =>
                        child.data && child.data.uid === sourceNode.data.uid
                    );
                }

                let newNode;
                let isNewNode = false;

                if (!existingNode) {
                    isNewNode = true;
                    // 创建新节点，先设置为空文本，等待逐字显示
                    newNode = {
                        data: {
                            ...sourceNode.data,
                            text: "" // 先显示空文本
                        },
                        children: []
                    };

                    if (!targetParent.children) {
                        targetParent.children = [];
                    }
                    targetParent.children.push(newNode);

                    // 更新思维导图，显示空节点
                    this.updateMindMapWithNewData(this.fullData);
                    await new Promise(resolve => setTimeout(resolve, 100));

                    // 将新节点加入打字队列
                    this.typingQueue.push({
                        nodeData: newNode.data,
                        fullText: sourceNode.data.text || "新节点",
                        uid: sourceNode.data.uid
                    });

                    // 如果当前没有正在打字的节点，立即开始处理队列
                    if (this.typingComplete) {
                        this.typingComplete = false;
                        this.processNextInTypingQueue();
                    }

                    // 等待当前节点打字完成后再继续
                    await new Promise(resolve => {
                        const checkTypingComplete = () => {
                            if (!this.currentTypingNode || this.currentTypingNode !== newNode.data) {
                                resolve();
                            } else {
                                setTimeout(checkTypingComplete, 100);
                            }
                        };
                        checkTypingComplete();
                    });

                } else {
                    newNode = existingNode;
                    // 同步更新已有节点的数据，避免数据不一致
                    if (newNode.data) {
                        newNode.data = { ...newNode.data, ...sourceNode.data };
                    } else {
                        newNode.data = { ...sourceNode.data };
                    }
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
                // 根节点直接显示完整文本，不应用逐字效果
                if (newData.data && newData.data.text) {
                    this.fullData.data.text = newData.data.text;
                    this.fullData.data.uid = newData.data.uid || this.fullData.data.uid;
                    this.updateMindMapWithNewData(this.fullData);
                }

                // 严格按照层级顺序生成子节点（应用逐字效果）
                await this.compareAndAddNodes(this.fullData, newData.children || []);

                // 清理可能的重复节点
                this.cleanDuplicateNodes(this.fullData);
                this.updateMindMapWithNewData(this.fullData);

            } catch (error) {
                console.error('处理节点生成时出错:', error);
            } finally {
                this.isGeneratingNodes = false;
                // 如果所有节点处理完但队列中还有未处理的，继续处理
                if (this.typingQueue.length > 0) {
                    this.processNextInTypingQueue();
                }
            }
        },
        cleanDuplicateNodes(node) {
            // 确保node存在
            if (!node || !node.children || node.children.length === 0) return;

            // 记录已存在的节点标识，使用uid
            const existingIds = new Set();
            const uniqueChildren = [];

            node.children.forEach(child => {
                // 确保child和child.data存在
                if (!child || !child.data) {
                    console.warn('跳过无效的子节点:', child);
                    return;
                }

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
                currentChild.data.uid = targetChild.data.uid; // 使用后端返回的uid
                this.loadBranchRecursively(originalData, currentChild, targetChild, 1);
            }
        },

        loadBranchRecursively(originalData, currentData, branchNode, level, onComplete) {
            // 确保必要的参数存在
            if (!branchNode || !currentData) return;

            // 确保数据对象存在
            currentData.data = currentData.data || {};
            if (branchNode.data) {
                currentData.data = { ...currentData.data, ...branchNode.data };
                // 仅当branchNode.data.uid存在时才设置
                if (branchNode.data.uid) {
                    currentData.data.uid = branchNode.data.uid;
                }
            }

            if (branchNode.children && branchNode.children.length > 0) {
                currentData.children = currentData.children || [];
                branchNode.children.forEach((child, index) => {
                    // 确保子节点对象存在
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
            // 清空打字队列
            this.typingQueue = [];
            this.currentTypingNode = null;
            this.typingComplete = true;

            // 根节点直接显示完整文本，不做逐字处理
            this.fullData.data.text = this.form.enterpriseName || "根节点";
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

        // 停止按钮事件
        async handleTermination() {
            if (!this.generate || !this.generate.id) {
                this.$message.warning('没有正在生成的任务');
                return;
            }

            this.isTerminating = true;
            try {
                const response = await terminationGenerateStandard({ id: this.generate.id });
                this.$message.success('已发送停止请求');
                // 接口发送成功后立即断开websocket
                if (this.websocket) {
                    this.websocket.close();
                }
            } catch (error) {
                console.error('停止请求出错:', error);
                this.$message.error('停止请求失败，请重试');
            } finally {
                this.isTerminating = false;
                this.cleanupGeneration(false);
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
            const wsUrl = `ws://192.168.7.84:8080/system/generateWebSocket/${currentUser}/${this.form.enterpriseName}`; //本地
            // const wsUrl = `wss://${hostName}:443/system/generateWebSocket/${currentUser}/${this.form.enterpriseName}`; // 线上

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

                        const response = await saveGenerateStandard({ id: this.generate.id });

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
                const response = await cancelGenerateStandard({ id: this.generate.id });
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
            // 清空打字队列
            this.typingQueue = [];
            this.currentTypingNode = null;
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
.flow-chart-container {
    width: 100%;
    height: 96vh;
    position: relative;
    overflow: hidden;
    display: flex;
}

#mindMapContainer {
    width: 100%;
    height: 100%;
    background-color: white !important;
}

#mindMapContainer * {
    margin: 0;
    padding: 0;
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
    display: flex;
    flex-direction: column;
}

.form-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.top-buttons {
    margin-top: 20px;
}

.bottom-buttons {
    margin-top: auto;
    margin-bottom: 20px;
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