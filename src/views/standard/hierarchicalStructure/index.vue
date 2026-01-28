<template>
    <div class="app-container">
        <!-- 首屏输入区域 -->
        <div class="input-section" :class="{ 'fade-out': !showInputSection }">
            <div class="input-tip"><img :src="$store.state.user.projectData.img"
                    class="sidebar-logo" />请您输入需要定制分类标准的企业名称。</div>
            <div class="input-wrapper" @click="focusInput" :class="{ 'input-focus': isInputFocused }">
                <el-input ref="enterpriseInput" v-model="form.enterpriseName" class="enterprise-name-input"
                    placeholder="给 MingShu 发送消息" :class="{ 'input-focus': isInputFocused }"
                    @focus="isInputFocused = true" @blur="isInputFocused = false" clearable></el-input>
                <el-button type="primary" @click="handleSend" :disabled="!form.enterpriseName.trim() || isSending"
                    :loading="isSending" size="small" class="send-btn">
                    <i class="el-icon-arrow-up" v-if="!isSending"></i>
                </el-button>
            </div>
        </div>

        <!-- 生成后区域（左侧画布+右侧聊天框） -->
        <div class="flow-chart-container" :class="{ 'fade-in': showChatSection }">
            <div class="main-content">
                <div id="mindMapContainer">
                </div>
            </div>
            <!-- 右侧聊天框（替代原表单） -->
            <div class="chat-container">
                <!-- 聊天记录区域 -->
                <div class="chat-messages" ref="chatScroll">
                    <!-- 聊天消息项 -->
                    <div v-for="(msg, index) in chatMessages" :key="index" :class="['chat-item', msg.type]">
                        <div class="chat-avatar">
                            <!-- 左侧(AI/系统)使用项目logo -->
                            <img v-if="msg.type !== 'user'" :src="$store.state.user.projectData.img"
                                class="avatar-img" />
                            <!-- 右侧(用户)使用用户头像 -->
                            <img v-else :src="$store.state.user.avatar" class="avatar-img" />
                        </div>
                        <div class="chat-bubble">
                            {{ msg.content }}
                            <template v-if="msg.content.includes('请稍等') && isGenerating">
                                <svg-icon iconClass="loading"
                                    style="width: 20px; height: 20px; margin-left: 5px; animation: spin 1s linear infinite;" />
                            </template>
                        </div>
                    </div>
                </div>

                <!-- 输入框和嵌入按钮 -->
                <div class="chat-input-container">
                    <el-input v-model="chatInput" placeholder="给MingShu发送指令"
                        :disabled="isGenerating || generationCompleted" @keyup.enter.native="sendChatMessage"
                        style="position: relative;">
                        <!-- 正在生成时显示停止按钮 -->
                        <template v-if="isGenerating" slot="append">
                            <el-button type="danger" circle @click="handleTermination"
                                :disabled="!isGenerating || generationCompleted" :loading="isTerminating" size="small">
                                <i class="el-icon-switch-button"></i>
                            </el-button>
                        </template>

                        <!-- 生成完成后显示保存和取消按钮 -->
                        <template v-else-if="!isGenerating && generationCompleted" slot="append">
                            <el-button type="success" circle @click="handleSave" :disabled="!canSave" size="small">
                                <i class="el-icon-folder-checked"></i>
                            </el-button>
                            <el-button type="warning" circle @click="handleCancel" :disabled="!canCancel" size="small">
                                <i class="el-icon-back"></i>
                            </el-button>
                        </template>

                        <!-- 正常情况下显示发送按钮 -->
                        <template v-else slot="append">
                            <el-button type="primary" circle @click="sendChatMessage" size="small">
                                <i class="el-icon-arrow-up"></i>
                            </el-button>
                        </template>
                    </el-input>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MindMap from "simple-mind-map";
import "simple-mind-map/dist/simpleMindMap.esm.css";
import { generateStandard, saveGenerateStandard, cancelGenerateStandard, terminationGenerateStandard } from '@/api/system/proxys'
export default {
    name: "FlowChart",
    data() {
        return {
            // 页面显示状态
            showInputSection: true,
            showChatSection: false,
            isInputFocused: false,

            // 生成状态标志
            generationCompleted: false,
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
            form: {
                enterpriseName: ''
            },
            // 状态变量
            canSave: false,
            canCancel: false,
            websocket: null,
            isGenerating: false,
            isTerminating: false,
            isSending: false,
            // 控制节点生成的状态
            isGeneratingNodes: false,
            nodeGenerationDelay: 500,
            batchUpdate: false,
            updateQueue: [],
            batchUpdateInterval: 100,
            // 数据处理队列，用于存放待处理的WebSocket数据
            dataProcessingQueue: [],
            // 逐字显示相关变量
            typingQueue: [], // 等待逐字显示的节点队列
            currentTypingNode: null, // 当前正在逐字显示的节点
            typingSpeed: 50, // 打字速度，毫秒/字
            typingComplete: true, // 标记当前是否有正在进行的打字动画

            // 聊天相关变量
            chatMessages: [],
            chatInput: '',
            enterpriseNameValid: false,

            processedNodeUids: new Set(),
            backendCompleted: false,
            isExpectedClose: false,
            isPageVisible: true,
            pendingWebSocketData: [], // 存储页面不可见时接收的数据
            pageVisibilityHandler: null,
        };
    },
    mounted() {
        this.mindMap = new MindMap({
            el: document.getElementById("mindMapContainer"),
            data: this.fullData,
            // notShowExpandBtn: true, //是否隐藏展开按钮
            isShowCreateChildBtnIcon: false, // 是否展示快捷添加子节点按钮
        });

        // 监听节点右键事件
        this.mindMap.on("node_contextmenu", (e, node) => {
            e.preventDefault();
            // 生成过程中不显示右键菜单
            if (this.isGenerating || this.isGeneratingNodes) {
                return;
            }
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
        // 所有节点双击编辑功能已暂时禁用
        /*
        //根节点和生成过程中的节点不可操作
        this.mindMap.on("node_dblclick", node => {
            // 判断是否是根节点或正在生成过程中
            
            if (node?.isRoot || this.isGenerating || this.isGeneratingNodes) {
                node.renderer.textEdit.hideEditTextBox(); // 隐藏文本编辑框（受限节点双击编辑操作失效）
                return;
            }
        })
        */
        this.mindMap.on("node_dblclick", node => {
            if (node && node.renderer && node.renderer.textEdit) {
                node.renderer.textEdit.hideEditTextBox(); // 隐藏文本编辑框,禁用所有节点的编辑功能
            }
            return;
        })

        // 点击其他区域隐藏菜单
        this.mindMap.on("node_click", this.hideMenu);
        this.mindMap.on("draw_click", this.hideMenu);

        // 监听数据变化详情事件，但禁用用户操作处理
        this.mindMap.on('data_change_detail', (list) => {
            try {
                // 用户操作已暂时禁用，不处理任何用户的创建、修改或删除操作
                /*
                // 仅当生成结束时才处理用户操作
                if (!this.isGenerating && !this.isGeneratingNodes) {
                    // 检查是否有创建、修改或删除操作
                    const userOperations = list.filter(item =>
                        item.action === 'create' || item.action === 'update' || item.action === 'delete'
                    );

                    if (userOperations.length > 0) {
                        console.log('检测到生成结束后的用户节点操作:', userOperations);
                        // 在这里添加您需要的处理逻辑
                        userOperations.forEach(operation => {
                            switch(operation.action) {
                                case 'create':
                                    console.log('用户创建了节点:', operation.data);
                                    // 处理创建操作
                                    break;
                                case 'update':
                                    console.log('用户修改了节点:', operation.data);
                                    // 处理修改操作
                                    break;
                                case 'delete':
                                    console.log('用户删除了节点:', operation.data);
                                    // 处理删除操作
                                    break;
                            }
                        });
                    }
                }
                */

                // 保留原有的创建节点处理逻辑
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
        this.initPageVisibilityListener();
    },
    beforeDestroy() {
        // 组件销毁前关闭WebSocket连接
        if (this.websocket) {
            this.isExpectedClose = true; // 标记为预期关闭
            this.websocket.close();
        }
        if (this.batchUpdateTimer) {
            clearInterval(this.batchUpdateTimer);
            this.batchUpdateTimer = null;
        }
        this.removePageVisibilityListener();
    },
    methods: {
        focusInput() {
            if (this.$refs.enterpriseInput) {
                this.$refs.enterpriseInput.focus();
            }
        },

        initPageVisibilityListener() {
            this.pageVisibilityHandler = () => {
                this.handleVisibilityChange();
            };
            document.addEventListener('visibilitychange', this.pageVisibilityHandler);
        },

        removePageVisibilityListener() {
            if (this.pageVisibilityHandler) {
                document.removeEventListener('visibilitychange', this.pageVisibilityHandler);
                this.pageVisibilityHandler = null;
            }
        },

        // 优化：页面不可见时不处理数据，避免UI卡顿
        async processFullData(newData) {
            if (!this.isPageVisible) {
                // console.log('[v0] 页面不可见，暂停处理数据，保留最新数据');
                // 如果页面不可见，我们只保留最新的数据，而不是实时更新
                // 后续页面可见时，可以选择直接更新最新数据，或按原逻辑处理
                // 当前策略是，页面不可见时，数据不更新，避免卡顿
                // this.latestFullData = newData; // 不再存储，因为页面不可见时不需要实时更新
                return; // 暂停处理
            }

            this.latestFullData = newData;

            // 如果当前正在处理数据，将新数据加入队列，避免打断正在进行的动画
            if (this.isGeneratingNodes || this.currentTypingNode || this.typingQueue.length > 0) {
                // 只保留最新的数据，避免队列过长
                this.dataProcessingQueue = [newData];
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
                    // 短暂延迟确保根节点渲染完成
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // 严格按照层级顺序生成子节点（应用逐字效果）
                await this.compareAndAddNodes(this.fullData, newData.children || []);

                // 等待所有打字动画完成后再进行清理
                await this.waitForAllTypingComplete();

                // 清理可能的重复节点
                this.cleanDuplicateNodes(this.fullData);
                this.updateMindMapWithNewData(this.fullData);

            } catch (error) {
                console.error('处理节点生成时出错:', error);
            } finally {
                const processNextBatch = async () => {
                    // 先等待所有打字动画完成
                    await this.waitForAllTypingComplete();

                    this.isGeneratingNodes = false;

                    // 如果队列中有数据，则继续处理
                    if (this.dataProcessingQueue.length > 0) {
                        const nextData = this.dataProcessingQueue.shift();
                        // 短暂延迟后处理下一批数据，保持动画流畅
                        setTimeout(() => {
                            // 对队列中的所有数据都使用processFullData处理，保持逐字动画效果
                            this.processFullData(nextData);
                        }, 100);
                    } else if (this.backendCompleted &&
                        this.typingQueue.length === 0 &&
                        !this.currentTypingNode) {
                        // console.log('[v0] processFullData 完成，检查是否触发完成回调');
                        this.onAllTypingComplete();
                    }
                };

                // 启动下一批数据处理
                processNextBatch();
            }
        },

        // 优化：处理打字队列中的下一个节点，如果页面不可见则直接显示完整文本
        processNextInTypingQueue() {
            if (this.typingQueue.length > 0 && !this.currentTypingNode) {
                const nextItem = this.typingQueue.shift();
                this.currentTypingNode = nextItem.nodeData;

                // 将节点居中显示
                if (this.mindMap && this.mindMap.renderer && nextItem.uid) {
                    try {
                        // 使用setTimeout确保节点已经渲染完成
                        setTimeout(() => {
                            const node = this.mindMap.renderer.findNodeByUid(nextItem.uid);
                            if (node && this.mindMap.renderer.moveNodeToCenter) {
                                this.mindMap.renderer.moveNodeToCenter(node);
                            }
                        }, 50);
                    } catch (error) {
                        console.error('居中节点时出错:', error);
                    }
                }

                // 开始逐字显示
                if (this.isPageVisible) {
                    this.typeWriter(nextItem.nodeData, nextItem.fullText);
                } else {
                    // 页面不可见，直接显示完整文本，不进行打字动画
                    // console.log('[v0] 页面不可见，直接显示完整文本');
                    nextItem.nodeData.text = nextItem.fullText;
                    this.updateMindMapWithNewData(this.fullData);
                    this.currentTypingNode = null; // 立即重置，以便下一个节点能尽快处理
                    this.processNextInTypingQueue(); // 立即处理下一个节点
                }
            } else if (this.typingQueue.length === 0 && !this.currentTypingNode) {
                this.typingComplete = true;

                // 只有在以下所有条件都满足时才认为真正完成:
                // 1. 后端已返回完成标识
                // 2. 打字队列为空
                // 3. 没有正在打字的节点
                // 4. 没有正在生成节点
                // 5. 数据处理队列为空
                if (this.backendCompleted &&
                    this.typingQueue.length === 0 &&
                    !this.currentTypingNode &&
                    !this.isGeneratingNodes &&
                    this.dataProcessingQueue.length === 0) {
                    // console.log('[v0] 所有条件满足，触发完成回调');
                    this.onAllTypingComplete();
                    return;
                }

                // 打字队列为空时，检查是否有等待处理的数据
                if (this.dataProcessingQueue.length > 0 && !this.isGeneratingNodes) {
                    const nextData = this.dataProcessingQueue.shift();
                    setTimeout(() => {
                        this.processFullData(nextData);
                    }, 100);
                }
            }
        },

        onAllTypingComplete() {
            // console.log('[v0] 所有打字动画完成回调');

            // 检查所有队列是否真的为空
            if (this.typingQueue.length > 0 ||
                this.dataProcessingQueue.length > 0 ||
                this.currentTypingNode !== null ||
                this.isGeneratingNodes) {
                // console.log('[v0] 还有任务未完成，跳过完成处理', {
                //     typingQueue: this.typingQueue.length,
                //     dataProcessingQueue: this.dataProcessingQueue.length,
                //     currentTypingNode: this.currentTypingNode,
                //     isGeneratingNodes: this.isGeneratingNodes
                // });
                return;
            }

            // 只有在后端真正完成时才显示完成消息
            if (this.backendCompleted && !this.generationCompleted) {
                // console.log('[v0] 后端已完成且所有队列为空，触发完成');
                this.triggerCompletion();
            }
        },

        // 优化：当页面不可见时，直接更新数据，不触发打字动画
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
                        console.error('更新数据时出错:', error);
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
                    enableKeyboard: false // 禁用所有键盘快捷键
                });

                // 初始化批量更新处理器
                this.initBatchUpdateProcessor();
            }
        },

        // 逐字显示节点文本
        typeWriter(nodeData, fullText, currentLength = 0) {
            if (!this.isGenerating && !this.backendCompleted) {
                // 只有在非后端完成且非生成中时才直接显示完整文本
                nodeData.text = fullText;
                this.updateMindMapWithNewData(this.fullData);
                this.currentTypingNode = null;
                this.processNextInTypingQueue();
                return;
            }

            // 显示当前长度的文本
            nodeData.text = fullText.substring(0, currentLength + 1);
            this.updateMindMapWithNewData(this.fullData);

            // 如果还没显示完，继续显示下一个字符
            if (currentLength + 1 < fullText.length) {
                let lastTime = performance.now();
                const animate = (currentTime) => {
                    if (currentTime - lastTime >= this.typingSpeed) {
                        this.typeWriter(nodeData, fullText, currentLength + 1);
                    } else {
                        requestAnimationFrame(animate);
                    }
                };
                requestAnimationFrame(animate);
            } else {
                // 显示完成，处理下一个节点
                this.currentTypingNode = null;
                // 短暂延迟后处理下一个节点，让用户看清当前节点
                setTimeout(() => {
                    this.processNextInTypingQueue();
                }, 300);
            }
        },

        // 递归比较并添加新节点 - 严格按照层级顺序逐个生成
        async compareAndAddNodes(targetParent, sourceNodes, level = 1) {
            if (!sourceNodes || !sourceNodes.length) return;

            // 先处理当前层级的所有节点
            for (let i = 0; i < sourceNodes.length; i++) {
                if (!this.isGenerating && !this.backendCompleted) break;

                const sourceNode = sourceNodes[i];
                // 确保sourceNode和sourceNode.data存在
                if (!sourceNode || !sourceNode.data) {
                    console.warn('跳过无效节点:', sourceNode);
                    continue;
                }

                const nodeUid = sourceNode.data.uid;

                if (nodeUid && this.processedNodeUids.has(nodeUid)) {
                    // 节点已处理，检查子节点
                    const existingNode = this.findNodeByUid(targetParent, nodeUid);
                    if (existingNode && sourceNode.children && sourceNode.children.length) {
                        await this.compareAndAddNodes(existingNode, sourceNode.children, level + 1);
                    }
                    continue;
                }

                // 查找已存在的节点
                let existingNode = null;
                if (targetParent.children && nodeUid) {
                    existingNode = targetParent.children.find(child =>
                        child.data && child.data.uid === nodeUid
                    );
                }

                // 如果没有uid，通过文本内容判断（不推荐，可能导致误判）
                if (!existingNode && targetParent.children && !nodeUid) {
                    existingNode = targetParent.children.find(child =>
                        child.data && child.data.text === sourceNode.data.text
                    );
                }

                let newNode;
                if (!existingNode) {
                    // 创建新节点，初始文本为空，等待打字队列处理
                    newNode = {
                        data: { ...sourceNode.data, text: "" },
                        children: []
                    };

                    // 确保targetParent有children数组
                    if (!targetParent.children) {
                        targetParent.children = [];
                    }

                    // 添加到父节点
                    targetParent.children.push(newNode);
                    this.updateMindMapWithNewData(this.fullData);
                    await new Promise(resolve => setTimeout(resolve, 50));

                    if (nodeUid) {
                        this.processedNodeUids.add(nodeUid);
                    }

                    // 将新节点加入打字队列
                    this.typingQueue.push({
                        nodeData: newNode.data,
                        fullText: sourceNode.data.text || "新节点",
                        uid: nodeUid
                    });

                    // 启动处理队列（确保当前节点开始处理）
                    if (this.typingQueue.length === 1 && !this.currentTypingNode) {
                        this.processNextInTypingQueue();
                    }

                    // 等待当前节点打字完成后再继续
                    await this.waitForNodeTypingComplete(newNode.data, sourceNode.data.text || "新节点");
                } else {
                    newNode = existingNode;

                    if (nodeUid && !this.processedNodeUids.has(nodeUid)) {
                        this.processedNodeUids.add(nodeUid);
                    }

                    // 只更新非文本属性，不重复添加到打字队列
                    if (newNode.data) {
                        const { text, ...otherProps } = sourceNode.data;
                        newNode.data = { ...newNode.data, ...otherProps };
                    }
                }

                // 递归处理子节点
                if (sourceNode.children && sourceNode.children.length) {
                    await this.compareAndAddNodes(newNode, sourceNode.children, level + 1);
                }
            }
        },

        findNodeByUid(parent, uid) {
            if (!parent || !uid) return null;

            if (parent.children) {
                for (const child of parent.children) {
                    if (child.data && child.data.uid === uid) {
                        return child;
                    }
                    const found = this.findNodeByUid(child, uid);
                    if (found) return found;
                }
            }
            return null;
        },

        waitForNodeTypingComplete(nodeData, targetText) {
            return new Promise(resolve => {
                const checkComplete = () => {
                    // 如果节点文本已完成或不再是当前打字节点，则完成
                    if (nodeData.text === targetText ||
                        (this.currentTypingNode !== nodeData && nodeData.text)) {
                        resolve();
                    } else {
                        setTimeout(checkComplete, 100);
                    }
                };
                checkComplete();
            });
        },

        async waitForAllTypingComplete() {
            return new Promise(resolve => {
                const checkComplete = () => {
                    if (this.typingQueue.length === 0 && !this.currentTypingNode) {
                        resolve();
                    } else {
                        // 如果还有打字队列，确保它在处理中
                        if (this.typingQueue.length > 0 && !this.currentTypingNode) {
                            this.processNextInTypingQueue();
                        }
                        setTimeout(checkComplete, 100);
                    }
                };
                checkComplete();
            });
        },

        // 直接更新完整数据，不触发打字动画
        updateFullDataWithoutAnimation(newData) {
            try {
                // console.log('[v0] 开始更新完整数据（无动画）');

                // 确保新数据存在
                if (!newData) {
                    console.warn('尝试更新空数据');
                    return;
                }

                // 根节点直接更新
                if (newData.data && newData.data.text) {
                    this.fullData.data.text = newData.data.text;
                    this.fullData.data.uid = newData.data.uid || this.fullData.data.uid;
                }

                // 递归更新子节点，直接显示完整文本
                this.updateNodesWithoutAnimation(this.fullData, newData.children || []);

                // 清理重复节点
                this.cleanDuplicateNodes(this.fullData);

                // 更新思维导图
                this.updateMindMapWithNewData(this.fullData);
                // console.log('[v0] 完整数据更新完成');

                // 重置相关状态，防止干扰
                this.isGeneratingNodes = false;
                this.typingQueue = [];
                this.currentTypingNode = null;

                // 清空处理队列，避免重复处理
                this.dataProcessingQueue = [];

                if (this.backendCompleted) {
                    // console.log('[v0] 检测到后端已完成且数据已直接更新，触发完成逻辑');
                    this.triggerCompletion();
                }

            } catch (error) {
                console.error('直接更新数据时出错:', error);
                // 出错时也重置状态，确保系统可以继续运行
                this.isGeneratingNodes = false;
                this.typingQueue = [];
                this.currentTypingNode = null;
            }
        },

        // 递归更新节点数据，不触发打字动画
        updateNodesWithoutAnimation(targetParent, sourceNodes) {
            if (!sourceNodes || !sourceNodes.length) return;

            // 确保目标父节点有children数组
            if (!targetParent.children) {
                targetParent.children = [];
            }

            // 为sourceNodes中的每个节点创建或更新对应节点
            sourceNodes.forEach(sourceNode => {
                if (!sourceNode || !sourceNode.data) return;

                // 查找对应的目标节点
                let targetNode = targetParent.children.find(child =>
                    child.data && child.data.uid === sourceNode.data.uid
                );

                if (!targetNode) {
                    // 创建新节点，直接显示完整文本
                    targetNode = {
                        data: { ...sourceNode.data },
                        children: []
                    };
                    targetParent.children.push(targetNode);
                } else {
                    // 更新已有节点的数据
                    targetNode.data = { ...targetNode.data, ...sourceNode.data };
                }

                // 递归处理子节点
                if (sourceNode.children && sourceNode.children.length) {
                    this.updateNodesWithoutAnimation(targetNode, sourceNode.children);
                }
            });
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

        // 初始化批量更新处理器
        initBatchUpdateProcessor() {
            if (this.batchUpdateInterval && !this.batchUpdateTimer) {
                this.batchUpdateTimer = setInterval(() => {
                    if (this.updateQueue.length > 0) {
                        const dataToUpdate = this.updateQueue.shift();
                        // 确保 MindMap 实例已加载
                        if (this.mindMap && this.mindMap.setData) {
                            // 在这里可以进行批量数据的合并或直接更新
                            // 如果 MindMap 支持增量更新，可以实现更优的性能
                            this.mindMap.setData(dataToUpdate);
                        }
                        if (this.updateQueue.length === 0) {
                            // 如果队列为空，可能需要一个回调或状态更新
                        }
                    }
                }, this.batchUpdateInterval);
            }
        },

        hideMenu() {
            this.show = false;
        },

        insertChild() {
            // 节点操作功能已暂时禁用
            /*
            // 生成过程中的节点不可操作
            if (this.isGenerating || this.isGeneratingNodes) {
                this.hideMenu();
                return;
            }

            // 复制当前节点的所有属性，除了名字
            if (this.currentNode && this.currentNode.nodeData.data) {
                // 创建新节点配置，复制原始节点的数据
                const newNodeConfig = JSON.parse(JSON.stringify(this.currentNode.nodeData.data));
                // 清空名字，使用默认名称

                // 使用自定义配置插入子节点
                this.mindMap.execCommand("INSERT_CHILD_NODE", false , [], {
                    type: newNodeConfig.type,
                    text: '新节点',
                });
            } else {
                // 回退到原始方法
                this.mindMap.execCommand("INSERT_CHILD_NODE", false , [], {
                    text: '新节点',
                });
            }
            */
            this.hideMenu();
        },

        insertSibling() {
            // 节点操作功能已暂时禁用
            /*
            // 生成过程中的节点不可操作
            if (this.isGenerating || this.isGeneratingNodes) {
                this.hideMenu();
                return;
            }

            // 复制当前节点的所有属性，除了名字
            if (this.currentNode && this.currentNode.nodeData.data) {
                // 创建新节点配置，复制原始节点的数据
                const newNodeConfig = JSON.parse(JSON.stringify(this.currentNode.nodeData.data));
                // 清空名字，使用默认名称

                // 使用自定义配置插入节点
                this.mindMap.execCommand("INSERT_NODE", false , [], {
                    type: newNodeConfig.type,
                    text: '新节点',
                });
            } else {
                // 回退到原始方法
                this.mindMap.execCommand("INSERT_NODE", false , [], {
                    text: '新节点',
                });
            }
            */
            this.hideMenu();
        },

        insertParent() {
            // 节点操作功能已暂时禁用
            /*
            // 生成过程中的节点不可操作
            if (this.isGenerating || this.isGeneratingNodes) {
                this.hideMenu();
                return;
            }

            // 复制当前节点的所有属性，除了名字
            if (this.currentNode && this.currentNode.nodeData.data) {
                // 创建新节点配置，复制原始节点的数据
                const newNodeConfig = JSON.parse(JSON.stringify(this.currentNode.nodeData.data));
                // 清空名字，使用默认名称

                // 使用自定义配置插入父节点
                this.mindMap.execCommand("INSERT_PARENT_NODE", false , [], {
                    type: newNodeConfig.type,
                    text: '新节点',
                });
            } else {
                // 回退到原始方法
                this.mindMap.execCommand("INSERT_PARENT_NODE", false , [], {
                    text: '新节点',
                });
            }
            */
            this.hideMenu();
        },

        deleteNode() {
            // 节点操作功能已暂时禁用
            /*
            // 生成过程中的节点不可操作
            if (this.isGenerating || this.isGeneratingNodes) {
                this.hideMenu();
                return;
            }
            this.mindMap.execCommand("REMOVE_NODE", this.currentNode);
            */
            this.hideMenu();
        },

        moveUp() {
            // 节点操作功能已暂时禁用
            /*
            // 生成过程中的节点不可操作
            if (this.isGenerating || this.isGeneratingNodes) {
                this.hideMenu();
                return;
            }
            this.mindMap.execCommand("UP_NODE", this.currentNode);
            */
            this.hideMenu();
        },

        moveDown() {
            // 节点操作功能已暂时禁用
            /*
            // 生成过程中的节点不可操作
            if (this.isGenerating || this.isGeneratingNodes) {
                this.hideMenu();
                return;
            }
            this.mindMap.execCommand("DOWN_NODE", this.currentNode);
            */
            this.hideMenu();
        },

        // 首屏发送按钮事件
        async handleSend() {
            if (!this.form.enterpriseName.trim() || this.isSending) {
                return;
            }

            // 设置发送中状态，防止重复点击
            this.isSending = true;
            this.addChatMessage('ai', '请您输入需要定制分类标准的企业名称');
            // 添加用户输入的企业名称到聊天记录
            this.addChatMessage('user', this.form.enterpriseName);

            try {
                // 发送HTTP请求验证企业名称
                const response = await generateStandard({
                    enterpriseName: this.form.enterpriseName,
                    structureLevel: '3' // 硬编码默认值，移除form.structureLevel
                });

                if (response.code === 200) {
                    this.generate = response.data;
                    this.enterpriseNameValid = true;

                    // 添加系统反馈
                    this.addChatMessage('ai', '用户输入的企业名称正确有效，继续生成分类分级标准');
                    this.addChatMessage('ai', `正在生成${this.form.enterpriseName}企业数据分类分级标准，请稍等`);

                    // 切换到聊天界面
                    this.switchToChatView();

                    // 开始生成过程
                    this.startGeneration();
                } else {
                    // 企业名称无效
                    this.enterpriseNameValid = false;
                    this.addChatMessage('ai', `错误: ${response.msg || '用户输入的企业名称无效，请重新输入正确有效的企业名称。'}`);
                    // 清空输入框
                    this.form.enterpriseName = '';
                }
            } catch (error) {
                console.error('验证企业名称出错:', error);
                this.addChatMessage('ai', '系统繁忙，请稍后重试。');
            } finally {
                // 无论成功失败，都重置发送状态
                this.isSending = false;
            }
        },

        // 切换到聊天视图
        switchToChatView() {
            this.showInputSection = false;
            setTimeout(() => {
                this.showChatSection = true;
                // 根节点直接显示完整文本
                this.fullData.data.text = this.form.enterpriseName || "根节点";
                this.updateMindMapWithNewData(this.fullData);
            }, 300);
        },

        // 开始生成过程
        startGeneration() {
            this.isGenerating = true;
            this.canSave = false;
            this.canCancel = false;

            // 清空打字队列
            this.typingQueue = [];
            this.currentTypingNode = null;
            this.typingComplete = true;

            this.processedNodeUids.clear();
            this.backendCompleted = false;
            this.isExpectedClose = false;
            this.pendingWebSocketData = []; // 清空积压数据

            // 建立WebSocket连接
            new Promise(resolve => {
                this.connectWebSocket(resolve);
            }).catch(error => {
                console.error('WebSocket连接出错:', error);
                this.addChatMessage('ai', '数据连接失败，请重试。');
            });
        },

        // 添加聊天消息
        addChatMessage(type, content) {
            this.chatMessages.push({
                type: type,  // 'user' 或 'ai'
                content: content,
                time: new Date()
            });
        },

        // 发送聊天消息
        sendChatMessage() {
            if (!this.chatInput.trim() || this.isGenerating || this.generationCompleted) {
                return;
            }

            const message = this.chatInput.trim();
            this.addChatMessage('user', message);
            this.chatInput = '';

            // 这里可以添加对用户指令的处理逻辑
            this.addChatMessage('ai', '收到指令，正在处理...');
        },

        // 滚动聊天记录到底部
        scrollToBottom() {
            if (this.$refs.chatScroll) {
                this.$refs.chatScroll.scrollTop = this.$refs.chatScroll.scrollHeight;
            }
        },

        // 停止按钮事件
        async handleTermination() {
            if (!this.generate || !this.generate.id) {
                this.addChatMessage('ai', '没有正在生成的任务');
                return;
            }

            this.isTerminating = true;
            try {
                const response = await terminationGenerateStandard({ id: this.generate.id });
                this.addChatMessage('ai', '生成分类分级任务已停止。');
                // 接口发送成功后立即断开websocket
                if (this.websocket) {
                    this.isExpectedClose = true; // 标记为预期关闭
                    this.websocket.close();
                }
            } catch (error) {
                console.error('停止请求出错:', error);
                this.addChatMessage('ai', '停止请求失败，请重试');
            } finally {
                this.isTerminating = false;
                this.cleanupGeneration(false);
                // 设置生成完成标志
                this.generationCompleted = true;
                this.canSave = true;
                this.canCancel = true;
            }
        },

        // 清理生成状态的方法
        cleanupGeneration(isSuccess = false) {
            this.isGenerating = false;
            this.isGeneratingNodes = false; // 停止节点生成
            if (!isSuccess) {
                if (this.websocket) {
                    this.isExpectedClose = true; // 标记为预期关闭
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
            // const wsUrl = `ws://192.168.7.84:8080/system/generateWebSocket/${currentUser}/${this.form.enterpriseName}`; //本地
            const wsUrl = `wss://${hostName}:443/prod-api/system/generateWebSocket/${currentUser}/${this.form.enterpriseName}`; // 线上

            this.websocket = new WebSocket(
                wsUrl,
                protocols
            );

            // 连接成功
            this.websocket.onopen = () => {
                console.log('WebSocket连接已建立');
                this.$message.success('开始接收数据...');
                resolve();
            };

            this.websocket.onmessage = (event) => {
                try {
                    // console.log('[v0] 收到WebSocket数据');
                    const data = JSON.parse(event.data);

                    // 检查是否是完成信号
                    if (data && (data.isCompleted === true || data.isCompleted === 'true')) {
                        this.handleBackendCompleted(data);
                        return;
                    }

                    // 处理正常数据
                    if (data) {
                        // 如果页面不可见，直接更新数据，不使用打字机效果
                        if (!this.isPageVisible) {
                            // console.log('[v0] 页面不可见，直接更新数据不使用打字机效果');
                            this.updateFullDataWithoutAnimation(data);
                        } else {
                            // 页面可见，使用正常的打字机效果
                            // console.log('[v0] 页面可见，使用打字机效果');
                            this.processFullData(data);
                        }
                    } else {
                        console.warn('收到空数据');
                    }
                } catch (error) {
                    console.error('解析WebSocket数据出错:', error);
                    console.error('原始数据:', event.data);
                }
            };

            // 连接关闭
            this.websocket.onclose = (event) => {
                console.log('WebSocket连接已关闭, code:', event.code, 'reason:', event.reason);

                // 如果是预期关闭，不做额外处理
                if (this.isExpectedClose) {
                    console.log('预期的WebSocket关闭');
                    return;
                }

                // 非预期关闭（可能是网络问题或服务器主动断开）
                if (this.backendCompleted) {
                    console.log('后端已完成，继续执行打字机效果');
                    // 不改变isGenerating状态，让打字机继续执行
                    return;
                }

                if (this.isGenerating) {
                    this.$message.warning('连接已断开');

                    // 如果有未处理完的数据，继续处理
                    if (this.latestFullData) {
                        console.log('连接断开，使用最新数据完成展示');
                        this.backendCompleted = true;

                        // 如果没有正在进行的打字任务，直接更新数据
                        if (this.typingQueue.length === 0 && !this.currentTypingNode && !this.isGeneratingNodes) {
                            this.updateFullDataWithoutAnimation(this.latestFullData);
                            // 延迟显示按钮，确保动画完整展示完毕后再出现按钮
                            setTimeout(() => {
                                this.generationCompleted = true;
                                this.isGenerating = false;
                                this.canSave = true;
                                this.canCancel = true;
                            }, 500);
                        }
                        // 否则让打字机继续执行完成
                    } else {
                        // 没有数据，直接结束
                        this.isGenerating = false;
                        // 延迟显示按钮，确保动画完整展示完毕后再出现按钮
                        setTimeout(() => {
                            this.generationCompleted = true;
                            this.canSave = true;
                            this.canCancel = true;
                        }, 500);
                    }
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

        handleBackendCompleted(data) {
            // console.log('[v0] 收到后端完成信号');
            this.backendCompleted = true;

            // 处理最后一批数据（如果有）
            if (data && data.data) {
                // console.log('[v0] 处理完成信号中的最后数据');
                // 根据页面可见性决定如何处理
                if (!this.isPageVisible) {
                    this.updateFullDataWithoutAnimation(data);
                    // updateFullDataWithoutAnimation 内部会检查并触发完成
                } else {
                    this.processFullData(data);
                    // processFullData 完成后会通过 onAllTypingComplete 触发
                }
            } else {
                // 没有额外数据，检查是否应该立即完成
                if (this.typingQueue.length === 0 &&
                    this.dataProcessingQueue.length === 0 &&
                    !this.currentTypingNode &&
                    !this.isGeneratingNodes) {
                    // console.log('[v0] 无额外数据且无待处理任务，立即完成');
                    this.triggerCompletion();
                }
            }
        },

        // 保存按钮事件
        handleSave() {
            this.saveData();
        },

        // 保存数据方法
        async saveData() {
            try {
                // 获取思维导图的最新完整数据，确保包含手动添加的节点
                let saveData = this.latestFullData;

                // 尝试从mindMap获取最新数据，优先使用getFullData方法
                if (this.mindMap && typeof this.mindMap.getFullData === 'function') {
                    saveData = this.mindMap.getFullData();
                    console.log('从mindMap获取的完整数据:', saveData);
                } else if (this.mindMap && typeof this.mindMap.getData === 'function') {
                    // 备选方案，使用getData方法
                    saveData = this.mindMap.getData();
                    console.log('从mindMap获取的数据:', saveData);
                } else if (!saveData) {
                    // 如果没有最新数据，使用当前显示的fullData
                    saveData = this.fullData;
                    console.log('使用当前显示的fullData:', saveData);
                }

                console.log('准备保存的数据:', saveData);
                const response = await saveGenerateStandard({ id: this.generate.id, treeStructureData: saveData });

                if (response.code === 200) {
                    this.$message.success('保存成功');
                    // 更新latestFullData为保存的数据，确保状态一致
                    this.latestFullData = saveData;
                    // 保存成功后跳转到管理页面
                    this.$router.push({ path: '/standard/jobMonitoring', query: { id: this.generate.id } });
                } else {
                    this.$message.error('保存失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('保存请求出错:', error);
                this.$message.error('保存失败，请重试');
            }
        },

        async handleCancel() {
            try {
                const response = await cancelGenerateStandard({ id: this.generate.id });
                if (response.data.success) {
                    this.addChatMessage('ai', '操作已取消');
                } else {
                    this.addChatMessage('ai', '取消失败: ' + (response.data.message || '未知错误'));
                }
            } catch (error) {
                console.error('取消请求出错:', error);
                this.addChatMessage('ai', '取消失败，请重试');
            }

            // 重置状态，返回到首屏
            this.resetToInitialState();
        },

        // 重置到初始状态
        resetToInitialState() {
            this.showChatSection = false;
            setTimeout(() => {
                this.showInputSection = true;
                this.chatMessages = [];
                this.canSave = false;
                this.canCancel = false;
                this.generationCompleted = false;
                this.enterpriseNameValid = false;

                if (this.websocket) {
                    this.isExpectedClose = true; // 标记为预期关闭
                    this.websocket.close();
                    this.websocket = null;
                }

                this.isGenerating = false;
                this.isGeneratingNodes = false;

                // 清空打字队列
                this.typingQueue = [];
                this.currentTypingNode = null;

                this.processedNodeUids.clear();
                this.backendCompleted = false;
                this.isExpectedClose = false;

                // 清空表单
                this.form.enterpriseName = '';

                // 重置思维导图
                this.fullData = {
                    data: {
                        text: "根节点",
                    },
                    children: [],
                };

                this.updateMindMapWithNewData(this.fullData);
            }, 300);
        },

        triggerCompletion() {
            if (this.generationCompleted) {
                // console.log('[v0] 已经完成，跳过重复触发');
                return;
            }

            // console.log('[v0] 触发生成完成');
            this.generationCompleted = true;
            this.isGenerating = false;
            this.canSave = true;
            this.canCancel = true;

            // 更新对话框消息
            // this.messages.push({ // 这是一个旧的聊天消息存储方式，需要适配到this.chatMessages
            //     role: 'assistant',
            //     content: '框架生成完成！您可以查看生成的内容。'
            // });
            this.addChatMessage('ai', '框架生成完成！您可以查看生成的内容。');

            this.$nextTick(() => {
                this.scrollToBottom();
            });
        },

        handleVisibilityChange() {
            this.isPageVisible = !document.hidden;
            // console.log('[v0] 页面可见性变化:', this.isPageVisible ? '可见' : '不可见');

            if (this.isPageVisible && this.backendCompleted) {
                // 确保所有队列都已清空
                if (this.typingQueue.length === 0 &&
                    this.dataProcessingQueue.length === 0 &&
                    !this.currentTypingNode &&
                    !this.isGeneratingNodes &&
                    !this.generationCompleted) {
                    // console.log('[v0] 页面重新可见，检测到应该完成，触发完成逻辑');
                    this.triggerCompletion();
                }
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.app-container {
    width: 100%;
    height: 96vh;
    position: relative;
    overflow: hidden;
    padding: 0;
}

/* 首屏输入区域样式 */
.input-section {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f8fafc;
    transition: opacity 0.3s ease-out;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
}

.input-section.fade-out {
    opacity: 0;
    pointer-events: none;
}

.input-tip {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
}

.sidebar-logo {
    width: 24px;
    height: 24px;
    margin-right: 8px;
}

.input-wrapper {
    width: 55%;
    height: 90px;
    max-width: 900px;
    border: 1px solid #f8fafc;
    border-radius: 15px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    cursor: text;
}

.input-wrapper.input-focus {
    border-color: #3b82f6;
    box-shadow: 0 10px 30px rgba(100, 181, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 主容器样式 */
.flow-chart-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    opacity: 0;
    transition: opacity 0.3s ease-in;
}

.flow-chart-container.fade-in {
    opacity: 1;
}

/* 思维导图容器样式 */
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
    border-right: 1px solid #e5e5e5;
}

/* 聊天容器样式 */
.chat-container {
    width: 360px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.chat-item {
    display: flex;
    margin-bottom: 20px;
    align-items: flex-start;
}

/* 用户消息样式 */
.chat-item.user {
    justify-content: flex-end;
}

.chat-item.user .chat-bubble {
    order: -1;
    margin-right: 8px;
}

/* AI消息样式 */
.chat-item.ai {
    justify-content: flex-start;
}

.chat-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin: 0 8px;
    border: 2px solid #e5e5e5;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.chat-bubble {
    padding: 10px 15px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.5;
    max-width: 70%;
}

.chat-item.user .chat-bubble {
    background-color: #64b5f6;
    color: #fff;
    border-top-right-radius: 4px;
}

.chat-item.ai .chat-bubble {
    background-color: #f5f5f5;
    color: #333;
    border-top-left-radius: 4px;
}

/* 聊天区域按钮样式 */
.chat-buttons {
    padding: 15px 20px;
    border-top: 1px solid #e5e5e5;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.stop-btn {
    width: 100%;
}

.enterprise-name-input {
    flex: 1;
    margin-right: 12px;
}

.enterprise-name-input::v-deep .el-input__inner {
    border: none;
    background-color: transparent;
    font-size: 16px;
    padding: 12px 0;
}

.enterprise-name-input::v-deep .el-input__inner::placeholder {
    color: #bdbdbd;
}

.send-btn {
    height: 40px;
    width: 40px;
    border-radius: 50%;
    min-width: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: #64b5f6 !important;
    border: none !important;
    transition: all 0.3s ease;
}

.send-btn:hover {
    background-color: #42a5f5 !important;
}

.send-btn::v-deep .el-icon-arrow-up::before {
    content: '\e6e1';
    font-weight: bold;
}

.send-btn::v-deep .el-icon-arrow-up {
    color: #ffffff;
    font-size: 18px;
}

.bottom-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

/* 聊天输入框样式 */
.chat-input-container {
    padding: 15px 20px;
}

.chat-input-container::v-deep .el-input__inner {
    border-radius: 15px 0px 0px 15px;
    height: 36px;
    border-right: none;
}

.chat-input-container::v-deep .el-input-group__append {
    border-radius: 0px 15px 15px 0px;
    border-left: none;
}

.chat-input-container .el-input__append .el-button {
    margin: 0 0 0 5px;
    height: 28px;
    width: 28px;
    padding: 0;
}

/* 右键菜单样式保留 */
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

/* 旋转动画关键帧 */
@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>