<template>
    <div class="app-container" v-loading="loading">
        <div class="tree-container" v-loading="treeLoading">
            <el-tree :indent="8" :data="categoryList" :props="defaultProps" :default-expanded-keys="[currentNodeId]"
                :current-node-key="currentNodeId" :expand-on-click-node="false" ref="tree" node-key="id"
                highlight-current @node-click="handleNodeClick">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span class="node-label" v-if="!data.addEdit" :title="node.label">{{ node.label }}</span>
                    <el-input id="addNode" class="addNode" v-else v-model="nodeLabel"
                        @blur="addEditNodeFn(node, data)"></el-input>
                    <span>
                        <el-button type="text" v-show="!data.addEdit && data.nodeLayerIndex !== 3" size="mini"
                            @click.stop="() => append(data, node)">
                            增加
                        </el-button>
                        <el-button type="text" v-show="!data.addEdit && data.nodeLayerIndex !== 0" size="mini"
                            @click.stop="() => editNode(data)">
                            编辑
                        </el-button>
                        <el-button type="text" v-show="!data.addEdit && data.nodeLayerIndex !== 0" size="mini"
                            @click.stop="() => remove(node, data)">
                            删除
                        </el-button>
                    </span>
                </span>
            </el-tree>
        </div>
        <div class="page-header">
            <el-button type="primary" plain @click="goBack">返回</el-button>
            <!-- 移除保存按钮 -->
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
            // 移除modifiedNodes数组
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

        // 修改删除方法，直接调用接口
        async remove(node, data) {
            this.$confirm(`确定删除当前节点及其下所有子节点吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                this.loading = true;
                try {
                    // 先调用删除接口
                    await deleteCategory({ id: data.id });

                    // 接口调用成功后再从界面移除
                    const parent = node.parent;
                    const children = parent.data.children || parent.data;
                    const index = children.findIndex(d => d.id === data.id);
                    children.splice(index, 1);

                    this.$message.success('删除成功');
                    // 重新加载树数据
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

        // 修改编辑和添加完成方法，直接调用接口
        async addEditNodeFn(node, data) {
            if (!this.nodeLabel && data.addEdit) {
                this.$message({
                    type: 'warning',
                    message: '节点名称不能为空',
                });
                // 恢复原始状态
                if (!data.id) {
                    // 如果是新节点且未输入内容，则移除
                    const parent = node.parent;
                    const children = parent.data.children || parent.data;
                    const index = children.findIndex(d => d === data);
                    children.splice(index, 1);
                }
                return;
            }

            this.loading = true;
            try {
                // 取消编辑状态
                this.$set(data, 'addEdit', false);

                // 更新节点名称
                data.label = this.nodeLabel;
                data.categoryName = this.nodeLabel;

                this.nodeLabel = '';
                const params = {
                    categoryName: data.label,
                    parentId: data.parentId,
                    id: data.id || null,
                    topId: this.currentNodeId // 根节点ID
                };

                if (params.id) {
                    // 已有节点，调用更新接口
                    await updateCategory(params);
                    this.$message.success('更新成功');
                } else {
                    // 新节点，调用添加接口
                    await addCategory(params);
                    this.$message.success('添加成功');
                }

                // 重新加载树数据
                this.getTreeData(this.$route.query.id);
            } catch (error) {
                this.$message.error('操作失败：' + (error.message || '未知错误'));
            } finally {
                this.loading = false;
            }
        }

        // 移除saveChanges方法
    }
};
</script>

<style scoped>
.page-header {
    margin-bottom: 20px;
    float: right;
}

.tree-container {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    min-height: 500px;
}

.custom-tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.node-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
    line-height: 28px;
}

.addNode {
    input {
        height: 23px;
        line-height: 23px;
        width: 180px;
    }
}
</style>