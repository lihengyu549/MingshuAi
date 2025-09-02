<template>
    <div class="app-container" v-loading="loading">
        <div class="page-title">分类管理</div>
        <div class="tree-container" v-loading="treeLoading">
            <el-tree :indent="8" :data="categoryList" :props="defaultProps" :default-expanded-keys="[currentNodeId]"
                :current-node-key="currentNodeId" :expand-on-click-node="false" ref="tree" node-key="id"
                highlight-current @node-click="handleNodeClick">
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
            currentNodeId: '',
            nodeLabel: '',
            defaultProps: {
                children: "children",
                label: "label"
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
            this.$router.go(-1);
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
                    id: data.id || null,
                    topId: this.currentNodeId
                };

                if (params.id) {
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
        }
    }
};
</script>

<style scoped>
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
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
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

.node-actions {
    display: flex;
    gap: 8px;
    margin-left: 8px;
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

/* 优化树节点连接线样式 */
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