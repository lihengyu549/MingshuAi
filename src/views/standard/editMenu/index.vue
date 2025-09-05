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
                    <span class="node-label" v-if="!data.addEdit" :title="node.label">{{ node.label }}</span>
                    <el-input id="addNode" class="addNode" v-else v-model="nodeLabel"
                        @blur="addEditNodeFn(node, data)"></el-input>
                    <span class="node-actions">
                        <el-button type="text" v-show="!data.addEdit && data.nodeLayerIndex !== 3" size="mini"
                            class="action-btn add-btn" @click.stop="() => append(data, node)">
                            增加
                        </el-button>
                        <el-button type="text" v-show="!data.addEdit && data.nodeLayerIndex !== 0" size="mini"
                            class="action-btn edit-btn" @click.stop="() => editNode(data)">
                            编辑
                        </el-button>
                        <el-button type="text" v-show="!data.addEdit && data.nodeLayerIndex !== 0" size="mini"
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
            nodeLabel: '',
            defaultProps: {
                children: "children",
                label: "label"
            },
            searchKeyword: '', // 搜索关键词
            isAllExpanded: false // 控制全部展开/折叠状态
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
            this.$router.go(-1);
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
                        item.label = item.categoryName;
                    }
                    this.categoryList = this.handleTree(tempList, "id");
                    console.log('this.categoryList', this.categoryList);
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
            if (!data.addEdit) {
                this.currentNodeId = data.id;
            }
        },

        append(data, parentNode) {
            if (!parentNode.expanded) {
                this.$message({
                    type: 'warning',
                    message: '当前节点未展开，请展开后再添加子节点',
                });
            } else {
                // 获取顶层节点id并赋值给topId
                this.topId = this.findTopNodeId(data);

                const newChild = {
                    id: '',
                    label: '',
                    children: [],
                    addEdit: true,
                    parentId: data.id,
                    nodeLayerIndex: data.nodeLayerIndex ? data.nodeLayerIndex + 1 : 1
                };

                if (!data.children) {
                    this.$set(data, 'children', []);
                }

                data.children.push(newChild);
                this.$nextTick(() => {
                    let addNodeInput = document.getElementById('addNode');
                    if (addNodeInput) {
                        addNodeInput.focus();
                    }
                });
            }
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
        },

        editNode(data) {
            // 获取顶层节点id并赋值给topId
            this.topId = this.findTopNodeId(data);

            this.nodeLabel = data.label || '';
            this.$set(data, 'addEdit', true);
            this.$nextTick(() => {
                let addNodeInput = document.getElementById('addNode');
                if (addNodeInput) {
                    addNodeInput.focus();
                }
            });
        },

        async addEditNodeFn(node, data) {
            if (!this.nodeLabel && data.addEdit) {
                this.$message({
                    type: 'warning',
                    message: '节点名称不能为空',
                });
                if (!data.id) {
                    const parent = node.parent;
                    const children = parent.data.children || parent.data;
                    const index = children.findIndex(d => d === data);
                    children.splice(index, 1);
                }
                return;
            }

            this.loading = true;
            try {
                this.$set(data, 'addEdit', false);
                data.label = this.nodeLabel;
                data.categoryName = this.nodeLabel;

                this.nodeLabel = '';
                const params = {
                    categoryName: data.label,
                    parentId: data.parentId,
                    topId: this.topId
                };

                if (data.id) {
                    params.id = data.id;
                    await updateCategory(params);
                    this.$message.success('更新成功');
                } else {
                    await addCategory(params);
                    this.$message.success('添加成功');
                }

                this.getTreeData(this.$route.query.id);
            } catch (error) {
                this.$message.error('操作失败：' + (error.message || '未知错误'));
            } finally {
                this.loading = false;
            }
        },

        // 新增搜索处理方法
        handleSearch() {
            if (!this.searchKeyword.trim()) {
                // 如果搜索关键词为空，显示所有节点
                this.filteredCategoryList = [...this.categoryList];
                return;
            }

            // 深拷贝原始列表用于过滤操作，使用过滤函数获取结果
            const filtered = this.filterNodes(JSON.parse(JSON.stringify(this.categoryList)), this.searchKeyword.trim());
            this.filteredCategoryList = filtered;
        },

        // 递归过滤节点
        filterNodes(nodes, keyword) {
            return nodes.filter(node => {
                // 先判断当前节点是否匹配
                const isNodeMatch = node.label && node.label.includes(keyword);

                // 如果当前节点匹配，直接清空子节点并保留当前节点
                if (isNodeMatch) {
                    // 清空子节点，避免展示下级
                    // node.children = [];
                    return true;
                }

                // 当前节点不匹配时，继续过滤子节点
                if (node.children && node.children.length) {
                    node.children = this.filterNodes(node.children, keyword);
                }

                // 只有子节点有匹配项时才保留当前节点（用于展示路径）
                const hasMatchedChildren = node.children && node.children.length > 0;
                return hasMatchedChildren;
            });
        },

        // 新增一键展开/折叠方法
        toggleExpandAll() {
            this.isAllExpanded = !this.isAllExpanded;
            // 递归设置所有节点的展开状态
            this.setAllNodesExpanded(this.filteredCategoryList, this.isAllExpanded);
        },
        // 递归设置节点展开状态
        setAllNodesExpanded(nodes, expanded) {
            nodes.forEach(node => {
                // 通过节点的 $el 找到对应的树节点实例并设置展开状态
                const treeNode = this.$refs.tree.getNode(node.id);
                if (treeNode) {
                    treeNode.expanded = expanded;
                }
                // 递归处理子节点
                if (node.children && node.children.length) {
                    this.setAllNodesExpanded(node.children, expanded);
                }
            });
        },

        // 获取所有节点ID用于全展开
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

/* .expand-btn {
    color: #26244ce0 !important;
    padding: 0 12px;
} */

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

.addNode {
    input {
        height: 28px;
        line-height: 28px;
        width: 180px;
        border-radius: 4px;
        border-color: #dcdfe6;
        transition: border-color 0.2s;
    }

    input:focus {
        border-color: #26244ce0;
        box-shadow: 0 0 0 2px rgba(38, 36, 76, 0.1);
    }
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
</style>