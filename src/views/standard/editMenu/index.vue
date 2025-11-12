<template>
    <div class="app-container" v-loading="loading">
        <div class="page-title">分类管理</div>
        <!-- 新增搜索和展开控件区域 -->
        <div class="tree-controls">
            <el-input v-model="searchKeyword" placeholder="搜索节点名称" clearable size="small" class="search-input"
                @input="handleSearch"></el-input>
            <el-button type="primary" plain size="small" @click="toggleExpandAll">
                {{ isAllExpanded ? '一键折叠' : '一键展开' }}
            </el-button>
        </div>
        <div class="tree-container" v-loading="treeLoading">
            <el-tree :indent="8" :data="filteredCategoryList" :props="defaultProps"
                :default-expanded-keys="[currentNodeId]" :current-node-key="currentNodeId" :expand-on-click-node="false"
                ref="tree" node-key="id" highlight-current @node-click="handleNodeClick" :expanded="isAllExpanded">
                <!-- 控制全部展开/折叠 -->
                <!-- 树节点内容保持不变 -->
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span class="node-label" :title="node.label">{{ node.label }}</span>
                    <span class="node-actions">
                        <el-button type="text" v-show="data.nodeLayerIndex !== 3" size="mini" class="action-btn add-btn"
                            @click.stop="() => openAddEditDialog(data, 'add')">
                            增加
                        </el-button>
                        <el-button type="text" v-show="data.nodeLayerIndex !== 0" size="mini"
                            class="action-btn edit-btn" @click.stop="() => openAddEditDialog(data, 'edit')">
                            编辑
                        </el-button>
                        <el-button type="text" v-show="data.nodeLayerIndex !== 0" size="mini"
                            class="action-btn delete-btn" @click.stop="() => remove(node, data)">
                            删除
                        </el-button>
                    </span>
                </span>
            </el-tree>
        </div>
        <div class="page-actions">
            <el-button type="primary" plain @click="goBack">返回</el-button>
        </div>

        <!-- 新增/编辑分类Dialog -->
        <el-dialog class="edit-menu-dialog" title="编辑分类" :visible.sync="dialogVisible" width="500px"
            :before-close="handleDialogClose" :close-on-click-modal="false">
            <el-form ref="categoryForm" :model="formData" :rules="formRules" label-width="100px" class="category-form"
                label-position="top">
                <!-- 名称输入框 -->
                <el-form-item label="名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入分类名称" maxlength="15" show-word-limit
                        size="small"></el-input>
                </el-form-item>

                <!-- 描述输入框 -->
                <el-form-item label="描述" prop="categoryDescribe">
                    <el-input v-model="formData.categoryDescribe" placeholder="请输入分类描述（可选）" maxlength="255"
                        show-word-limit type="textarea" rows="3" size="small"></el-input>
                </el-form-item>

                <!-- 特征标签组件 -->
                <el-form-item label="主题词表" prop="coreTags">
                    <el-tag v-for="(tag, index) in formData.coreTags" :key="index" closable :disable-transitions="false"
                        @close="handleTagClose('coreTags', index)">
                        {{ tag }}
                    </el-tag>
                    <el-input v-if="formData.coreTagsInputVisible" v-model="formData.coreTagsInputValue" ref="coreTagsInput" size="small"
                        @blur="handleInputBlur('coreTags')" @keyup.enter="handleInputConfirm('coreTags')" placeholder="请输入标签"></el-input>
                    <el-button v-else size="small" icon="el-icon-plus" @click="handleInputShow('coreTags')" type="text">
                        新增
                    </el-button>
                    <div class="tag-count-tip" v-if="formData.coreTags.length > 0">
                        已选择 {{ formData.coreTags.length }}/40 个标签
                    </div>
                </el-form-item>
                
                <!-- 核心主题词组件 -->
                <!-- <el-form-item label="核心主题词" prop="coreTopic">
                    <el-tag v-for="(tag, index) in formData.coreTopic" :key="index" closable :disable-transitions="false"
                        @close="handleTagClose('coreTopic', index)">
                        {{ tag }}
                    </el-tag>
                    <el-input v-if="formData.coreTopicInputVisible" v-model="formData.coreTopicInputValue" ref="coreTopicInput" size="small"
                        @blur="handleInputBlur('coreTopic')" @keyup.enter="handleInputConfirm('coreTopic')" placeholder="请输入核心主题词"></el-input>
                    <el-button v-else size="small" icon="el-icon-plus" @click="handleInputShow('coreTopic')" type="text">
                        新增
                    </el-button>
                    <div class="tag-count-tip" v-if="formData.coreTopic.length > 0">
                        已选择 {{ formData.coreTopic.length }}/40 个核心主题词
                    </div>
                </el-form-item> -->
                
                <!-- 入口词组件 -->
                <!-- <el-form-item label="入口词" prop="entryTerm">
                    <el-tag v-for="(tag, index) in formData.entryTerm" :key="index" closable :disable-transitions="false"
                        @close="handleTagClose('entryTerm', index)">
                        {{ tag }}
                    </el-tag>
                    <el-input v-if="formData.entryTermInputVisible" v-model="formData.entryTermInputValue" ref="entryTermInput" size="small"
                        @blur="handleInputBlur('entryTerm')" @keyup.enter="handleInputConfirm('entryTerm')" placeholder="请输入入口词"></el-input>
                    <el-button v-else size="small" icon="el-icon-plus" @click="handleInputShow('entryTerm')" type="text">
                        新增
                    </el-button>
                    <div class="tag-count-tip" v-if="formData.entryTerm.length > 0">
                        已选择 {{ formData.entryTerm.length }}/40 个入口词
                    </div>
                </el-form-item> -->
                
                <!-- 关联词组件 -->
                <!-- <el-form-item label="关联词" prop="relatedTerms">
                    <el-tag v-for="(tag, index) in formData.relatedTerms" :key="index" closable :disable-transitions="false"
                        @close="handleTagClose('relatedTerms', index)">
                        {{ tag }}
                    </el-tag>
                    <el-input v-if="formData.relatedTermsInputVisible" v-model="formData.relatedTermsInputValue" ref="relatedTermsInput" size="small"
                        @blur="handleInputBlur('relatedTerms')" @keyup.enter="handleInputConfirm('relatedTerms')" placeholder="请输入关联词"></el-input>
                    <el-button v-else size="small" icon="el-icon-plus" @click="handleInputShow('relatedTerms')" type="text">
                        新增
                    </el-button>
                    <div class="tag-count-tip" v-if="formData.relatedTerms.length > 0">
                        已选择 {{ formData.relatedTerms.length }}/40 个关联词
                    </div>
                </el-form-item> -->
                
                <!-- 反向参照组件 -->
                <!-- <el-form-item label="反向参照" prop="reverseRef">
                    <el-tag v-for="(tag, index) in formData.reverseRef" :key="index" closable :disable-transitions="false"
                        @close="handleTagClose('reverseRef', index)">
                        {{ tag }}
                    </el-tag>
                    <el-input v-if="formData.reverseRefInputVisible" v-model="formData.reverseRefInputValue" ref="reverseRefInput" size="small"
                        @blur="handleInputBlur('reverseRef')" @keyup.enter="handleInputConfirm('reverseRef')" placeholder="请输入反向参照"></el-input>
                    <el-button v-else size="small" icon="el-icon-plus" @click="handleInputShow('reverseRef')" type="text">
                        新增
                    </el-button>
                    <div class="tag-count-tip" v-if="formData.reverseRef.length > 0">
                        已选择 {{ formData.reverseRef.length }}/40 个反向参照
                    </div>
                </el-form-item> -->
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" plain @click="submitAddEditForm">保存</el-button>
                <el-button size="small" @click="dialogVisible = false">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { addCategory, updateCategory, deleteCategory } from "@/api/standard";
import { treeListI } from "@/api/system/protectCategory";
export default {
    name: "MenuEdit",
    data() {
        return {
            loading: false,
            treeLoading: false,
            categoryList: [],
            yuanCategoryList: [],
            filteredCategoryList: [], // 用于搜索过滤后的列表
            currentNodeId: '', // 当前点击的节点ID
            topId: '', // 最上层节点ID
            defaultProps: {
                children: "children",
                label: "label"
            },
            searchKeyword: '', // 搜索关键词
            isAllExpanded: false, // 控制全部展开/折叠状态
            isShowingWarning: false, // 控制未展开提示的显示频率

            // 新增Dialog相关数据
            dialogVisible: false, // Dialog显示状态
            formType: 'add', // 表单类型：add-新增，edit-编辑
            formData: {
                name: '', // 分类名称
                categoryDescribe: '', // 分类描述
                coreTags: [], // 特征标签列表
                coreTagsInputVisible: false, // 特征标签输入框显示状态
                coreTagsInputValue: '', // 特征标签输入框值
                coreTopic: [], // 核心主题词列表
                coreTopicInputVisible: false, // 核心主题词输入框显示状态
                coreTopicInputValue: '', // 核心主题词输入框值
                entryTerm: [], // 入口词列表
                entryTermInputVisible: false, // 入口词输入框显示状态
                entryTermInputValue: '', // 入口词输入框值
                relatedTerms: [], // 关联词列表
                relatedTermsInputVisible: false, // 关联词输入框显示状态
                relatedTermsInputValue: '', // 关联词输入框值
                reverseRef: [], // 反向参照列表
                reverseRefInputVisible: false, // 反向参照输入框显示状态
                reverseRefInputValue: '', // 反向参照输入框值
                parentId: '', // 父节点ID（新增时使用）
                id: '' // 分类ID（编辑时使用）
            },
            // 表单校验规则
            formRules: {
                name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { max: 15, message: '名称长度不能超过15个字符', trigger: 'blur' }
                ],
                categoryDescribe: [
                    { max: 255, message: '描述长度不能超过255个字符', trigger: 'blur' }
                ],
                coreTags: [
                    {
                        validator: (rule, value, callback) => {
                            if (value.length > 40) {
                                callback(new Error('特征标签数量不能超过40个'));
                            } else {
                                callback();
                            }
                        },
                        trigger: 'change'
                    }
                ],
                coreTopic: [
                    {
                        validator: (rule, value, callback) => {
                            if (value.length > 40) {
                                callback(new Error('核心主题词数量不能超过40个'));
                            } else {
                                callback();
                            }
                        },
                        trigger: 'change'
                    }
                ],
                entryTerm: [
                    {
                        validator: (rule, value, callback) => {
                            if (value.length > 40) {
                                callback(new Error('入口词数量不能超过40个'));
                            } else {
                                callback();
                            }
                        },
                        trigger: 'change'
                    }
                ],
                relatedTerms: [
                    {
                        validator: (rule, value, callback) => {
                            if (value.length > 40) {
                                callback(new Error('关联词数量不能超过40个'));
                            } else {
                                callback();
                            }
                        },
                        trigger: 'change'
                    }
                ],
                reverseRef: [
                    {
                        validator: (rule, value, callback) => {
                            if (value.length > 40) {
                                callback(new Error('反向参照数量不能超过40个'));
                            } else {
                                callback();
                            }
                        },
                        trigger: 'change'
                    }
                ]
            }
        };
    },
    created() {
        if (this.$route.query && this.$route.query.id) {
            this.currentNodeId = this.$route.query.id * 1;
            this.getTreeData(this.currentNodeId);
        } else {
            this.$message.error("未找到菜单数据");
            this.goBack();
        }
    },
    methods: {
        goBack() {
            this.$router.push({
                path: 'standard/jobMonitoring',
                query: this.$route.query.queryParams || {}
            });
        },
        // 查找节点的最顶层祖先id
        findTopNodeId(node) {
            // 顶层节点的判定：nodeLayerIndex为0（根据现有代码中节点层级判断逻辑）
            if (node.nodeLayerIndex === 0) {
                return node.id;
            }
            // 递归查找父节点
            const parentNode = this.findParentNode(this.categoryList, node.parentId);
            if (parentNode) {
                return this.findTopNodeId(parentNode);
            }
            // 容错处理：如果找不到父节点，默认当前节点所在树的顶层节点（通常是初始加载的根节点）
            return this.categoryList.length > 0 ? this.categoryList[0].id : '';
        },
        // 辅助方法：根据parentId在树形结构中查找父节点
        findParentNode(nodes, parentId) {
            for (const node of nodes) {
                if (node.id === parentId) {
                    return node;
                }
                if (node.children && node.children.length) {
                    const found = this.findParentNode(node.children, parentId);
                    if (found) {
                        return found;
                    }
                }
            }
            return null;
        },
        getTreeData(id) {
            this.treeLoading = true;
            let data = {
                parentId: id,
                ifAddParent: 1,
            };
            treeListI(data).then((resp) => {
                this.categoryList = resp.data;
                this.yuanCategoryList = JSON.parse(JSON.stringify(resp.data));
                if (this.categoryList.length > 0) {
                    let tempList = JSON.parse(JSON.stringify(this.categoryList));
                    for (let item of tempList) {
                        // 假设接口返回的标签字段为coreTags，若字段名不同需修改
                        item.coreTags = item.coreTags || [];
                        item.categoryDescribe = item.categoryDescribe || '';
                        item.label = item.categoryName;
                    }
                    this.categoryList = this.handleTree(tempList, "id");
                    this.filteredCategoryList = [...this.categoryList]; // 初始化过滤列表
                }
                this.treeLoading = false;
            }).catch(() => {
                this.treeLoading = false;
            });
        },
        handleTree(data, id = 'id', parentId = 'parentId', children = 'children') {
            const config = {
                id: id,
                parentId: parentId,
                childrenList: children
            };
            const nodeIds = {};
            const tree = [];
            for (const node of data) {
                nodeIds[node[config.id]] = node;
            }
            for (const node of data) {
                const parent = nodeIds[node[config.parentId]];
                if (parent) {
                    parent[config.childrenList] = parent[config.childrenList] || [];
                    parent[config.childrenList].push(node);
                } else {
                    tree.push(node);
                }
            }
            return tree;
        },
        handleNodeClick(data) {
            this.currentNodeId = data.id;
        },

        // ---------------------- 新增/编辑Dialog相关方法 ----------------------
        /**
         * 打开新增/编辑Dialog
         * @param {Object} data - 节点数据
         * @param {String} type - 表单类型：add/edit
         */
        openAddEditDialog(data, type) {
            // 新增时校验节点是否展开
            if (type === 'add' && !this.$refs.tree.getNode(data.id).expanded) {
                if (!this.isShowingWarning) {
                    this.$message({
                        type: 'warning',
                        message: '当前节点未展开，请展开后再添加子节点',
                    });
                    this.isShowingWarning = true;
                    setTimeout(() => {
                        this.isShowingWarning = false;
                    }, 1000);
                }
                return;
            }

            // 重置表单
            this.$refs.categoryForm && this.$refs.categoryForm.resetFields();
            this.formType = type;
            this.formData.parentId = data.id;
            this.topId = this.findTopNodeId(data);

            if (type === 'add') {
                // 新增初始化
                this.formData = {
                    name: '',
                    categoryDescribe: '',
                    coreTags: [],
                    coreTagsInputVisible: false,
                    coreTagsInputValue: '',
                    coreTopic: [],
                    coreTopicInputVisible: false,
                    coreTopicInputValue: '',
                    entryTerm: [],
                    entryTermInputVisible: false,
                    entryTermInputValue: '',
                    relatedTerms: [],
                    relatedTermsInputVisible: false,
                    relatedTermsInputValue: '',
                    reverseRef: [],
                    reverseRefInputVisible: false,
                    reverseRefInputValue: '',
                    parentId: data.id,
                    id: ''
                };
                this.dialogVisible = true;
            } else {
                // 编辑回显数据 - 从coreKeyWords解析四个字段
                // 定义解析逗号分隔字符串的辅助函数
                const parseCommaSeparated = (str) => {
                    return str && typeof str === 'string' && str.length > 0 ? 
                           str.split(',').map(tag => tag.trim()).filter(tag => tag) : 
                           [];
                };
                
                // 从coreKeyWords解析数据
                let coreTopic = [];
                let entryTerm = [];
                let relatedTerms = [];
                let reverseRef = [];
                
                if (data.coreKeyWords && typeof data.coreKeyWords === 'string') {
                    try {
                        const parsed = JSON.parse(data.coreKeyWords);
                        // 确保每个字段都是逗号分隔的字符串格式
                        coreTopic = parseCommaSeparated(parsed.coreTopic || '');
                        entryTerm = parseCommaSeparated(parsed.entryTerm || '');
                        relatedTerms = parseCommaSeparated(parsed.relatedTerms || '');
                        reverseRef = parseCommaSeparated(parsed.reverseRef || '');
                    } catch (e) {
                        console.error('解析coreKeyWords失败:', e);
                    }
                }
                
                this.formData = {
                    name: data.categoryName || '',
                    categoryDescribe: data.categoryDescribe || '',
                    coreTags: data.coreTags && data.coreTags.length > 0 ? data.coreTags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
                    coreTagsInputVisible: false,
                    coreTagsInputValue: '',
                    coreTopic: coreTopic,
                    coreTopicInputVisible: false,
                    coreTopicInputValue: '',
                    entryTerm: entryTerm,
                    entryTermInputVisible: false,
                    entryTermInputValue: '',
                    relatedTerms: relatedTerms,
                    relatedTermsInputVisible: false,
                    relatedTermsInputValue: '',
                    reverseRef: reverseRef,
                    reverseRefInputVisible: false,
                    reverseRefInputValue: '',
                    parentId: data.parentId,
                    id: data.id
                };
                this.dialogVisible = true;
            }

            // 确保Dialog渲染后再聚焦（如需）
            this.$nextTick(() => {
                this.$refs.categoryForm && this.$refs.categoryForm.$el.querySelector('input')?.focus();
            });
        },

        /**
         * 关闭Dialog前重置状态
         */
        handleDialogClose() {
            this.dialogVisible = false;
            setTimeout(() => {
                this.$refs.categoryForm && this.$refs.categoryForm.resetFields();
            }, 300);
        },

        // ---------------------- 标签相关方法 ----------------------
        /**
         * 显示标签输入框
         * @param {String} field - 字段名称
         */
        handleInputShow(field) {
            this.formData[`${field}InputVisible`] = true;
            this.$nextTick(() => {
                this.$refs[`${field}Input`]?.focus();
            });
        },

        /**
         * 标签输入框失焦处理
         * @param {String} field - 字段名称
         */
        handleInputBlur(field) {
            if (this.formData[`${field}InputValue`].trim()) {
                this.handleInputConfirm(field);
            } else {
                this.formData[`${field}InputVisible`] = false;
            }
        },

        /**
         * 标签输入框确认（回车）
         * @param {String} field - 字段名称
         */
        handleInputConfirm(field) {
            const inputValue = this.formData[`${field}InputValue`].trim();
            const fieldLabels = {
                coreTags: '特征标签',
                coreTopic: '核心主题词',
                entryTerm: '入口词',
                relatedTerms: '关联词',
                reverseRef: '反向参照'
            };
            
            if (inputValue && !this.formData[field].includes(inputValue)) {
                // 校验标签数量
                if (this.formData[field].length >= 40) {
                    this.$message.warning(`${fieldLabels[field]}数量不能超过40个`);
                    return;
                }
                this.formData[field].push(inputValue);
            }
            this.formData[`${field}InputValue`] = '';
            this.formData[`${field}InputVisible`] = false;
        },

        /**
         * 删除标签
         * @param {String} field - 字段名称
         * @param {Number} index - 标签索引
         */
        handleTagClose(field, index) {
            this.formData[field].splice(index, 1);
        },

        // ---------------------- 表单提交相关方法 ----------------------
        /**
         * 提交新增/编辑表单
         */
        async submitAddEditForm() {
            // 表单校验
            this.$refs.categoryForm.validate(async (isValid) => {
                if (!isValid) return;

                this.loading = true;
                try {
                    // 构造接口参数 - 只保存coreKeyWords字段
                    const params = {
                        categoryName: this.formData.name,
                        categoryDescribe: this.formData.categoryDescribe,
                        coreTags: this.formData.coreTags.join(','),
                        // 将四个字段合并为coreKeyWords，每个字段的值为逗号分隔的字符串
                        coreKeyWords: JSON.stringify({
                            coreTopic: this.formData.coreTopic.join(','),
                            entryTerm: this.formData.entryTerm.join(','),
                            relatedTerms: this.formData.relatedTerms.join(','),
                            reverseRef: this.formData.reverseRef.join(',')
                        }),
                        parentId: this.formData.parentId,
                        topId: this.topId
                    };

                    if (this.formType === 'edit') {
                        // 编辑：添加ID
                        params.id = this.formData.id;
                        await updateCategory(params);
                        this.$message.success('更新成功');
                    } else {
                        // 新增
                        await addCategory(params);
                        this.$message.success('添加成功');
                    }

                    // 关闭Dialog并刷新树
                    this.dialogVisible = false;
                    this.getTreeData(this.$route.query.id);
                } catch (error) {
                    this.$message.error('操作失败：' + (error.message || '未知错误'));
                } finally {
                    this.loading = false;
                }
            });
        },

        // ---------------------- 原有方法保持不变 ----------------------
        handleSearch() {
            if (!this.searchKeyword.trim()) {
                this.filteredCategoryList = [...this.categoryList];
                return;
            }
            const filtered = this.filterNodes(JSON.parse(JSON.stringify(this.categoryList)), this.searchKeyword.trim());
            this.filteredCategoryList = filtered;
        },
        filterNodes(nodes, keyword) {
            return nodes.filter(node => {
                const isNodeMatch = node.label && node.label.includes(keyword);
                if (isNodeMatch) {
                    return true;
                }
                if (node.children && node.children.length) {
                    node.children = this.filterNodes(node.children, keyword);
                }
                const hasMatchedChildren = node.children && node.children.length > 0;
                return hasMatchedChildren;
            });
        },
        toggleExpandAll() {
            this.isAllExpanded = !this.isAllExpanded;
            this.setAllNodesExpanded(this.filteredCategoryList, this.isAllExpanded);
        },
        setAllNodesExpanded(nodes, expanded) {
            nodes.forEach(node => {
                const treeNode = this.$refs.tree.getNode(node.id);
                if (treeNode) {
                    treeNode.expanded = expanded;
                }
                if (node.children && node.children.length) {
                    this.setAllNodesExpanded(node.children, expanded);
                }
            });
        },
        getAllNodeIds() {
            const ids = [];
            const collectIds = (nodes) => {
                nodes.forEach(node => {
                    if (node.id) {
                        ids.push(node.id);
                    }
                    if (node.children && node.children.length) {
                        collectIds(node.children);
                    }
                });
            };
            collectIds(this.categoryList);
            return ids;
        },
        async remove(node, data) {
            this.$confirm(`确定删除当前节点及其下所有子节点吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                this.loading = true;
                try {
                    await deleteCategory({ id: data.id });
                    const parent = node.parent;
                    const children = parent.data.children || parent.data;
                    const index = children.findIndex(d => d.id === data.id);
                    children.splice(index, 1);
                    this.$message.success('删除成功');
                    this.getTreeData(this.$route.query.id);
                } catch (error) {
                    this.$message.error('删除失败：' + (error.message || '未知错误'));
                } finally {
                    this.loading = false;
                }
            });
        }
    }
};
</script>
<style scoped>
/* 新增样式 */
.tree-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
    justify-content: flex-end;
}

.search-input {
    width: 240px;
}

/* Dialog表单样式 */
.category-form {
    margin-bottom: 0;
}

.tag-count-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
}

.el-tag {
    margin-right: 8px;
    margin-bottom: 8px;
}

.dialog-footer {
    text-align: right;
}

/* 原有样式保持不变 */
.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #26244ce0;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
}

.page-actions {
    margin-top: 20px;
    text-align: right;
}

.back-btn {
    border-color: #26244ce0;
    color: #26244ce0;
    transition: all 0.3s ease;
}

.back-btn:hover {
    background-color: #f5f5f7;
}

.tree-container {
    background: #fff;
    padding: 20px;
    border-radius: 6px;
    min-height: 500px;
}

.custom-tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 4px 0;
}

.node-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
    line-height: 28px;
    color: #333;
    transition: color 0.2s;
}

.node-label:hover {
    color: #26244ce0;
}

.custom-tree-node:hover .node-actions {
    visibility: visible;
}

.node-actions {
    display: flex;
    gap: 8px;
    margin-left: 8px;
    visibility: hidden;
}

.action-btn {
    color: #26244ce0 !important;
    padding: 0 6px;
    height: 28px;
    line-height: 28px;
    font-size: 12px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.action-btn:hover {
    background-color: #f0f0f5;
    color: #1a1938 !important;
}

::v-deep .el-tree-node__content {
    height: 36px;
    align-items: center;
}

::v-deep .el-tree-node:focus>.el-tree-node__content {
    background-color: #f5f5f7;
}

::v-deep .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
    background-color: #f0f0f5;
    color: #26244ce0;
    font-weight: 500;
}

.edit-menu-dialog /deep/.el-dialog__body {
    padding: 30px;
}

.edit-menu-dialog /deep/.el-dialog__title {
    font-weight: bold;
}

.edit-menu-dialog /deep/.el-dialog__header {
    border-bottom: 1px solid #e6e6e6;
}

.edit-menu-dialog /deep/.el-dialog {
    border-radius: 10px;
}
</style>