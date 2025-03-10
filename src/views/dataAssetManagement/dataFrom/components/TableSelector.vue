<template>
    <div class="main_div">
        <div class="canChoose">
            <div style="height: 20px;">可选</div>
            <div class="canChoose_main">
                <div class="canChoose_left">
                    <el-tree ref="tree" :data="options" show-checkbox node-key="value" :default-expanded-keys="[]"
                        :default-checked-keys="[]" :props="defaultProps" :check-strictly="true"
                        :render-content="renderContent" @check="leftTreeCheckFn"
                        @node-click="leftTreeClickFn">
                    </el-tree>
                </div>
                <div class="canChoose_right">
                    <el-input style="margin-bottom: 10px;" placeholder="请输入表名" v-model="searchQuery" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-checkbox style="padding: 5px;" v-show="middleCheckVisible" v-model="checkAllMiddle"
                        :indeterminate="isIndeterminate" @change="handleMiddleCheckAllChange">
                        全选
                    </el-checkbox>
                    <el-checkbox-group class="centerCheckedBox" v-model="checkedTables"
                        @change="handleCheckedTablesChange">
                        <el-checkbox v-for="table in filteredTables" :value="table.value" :label="table.label" :key="table.value">{{
                            table.label
                            }}</el-checkbox>
                    </el-checkbox-group>
                </div>
            </div>
        </div>
        <div class="dowmChoose"></div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            middleCheckVisible: false, // 新增属性，控制中间全选复选框的显示与隐藏
            checkAllMiddle: false, // 中间全选框
            isIndeterminate: false, // 中间半选数据
            checkedTables: [], // 中间绑定数据展示用
            allCheckedTables:[],// 所有中间绑定的数据
            filteredTables: [],// 中间数据
            searchQuery: '',// 中间搜索绑定值
            options: [
                { value: '0', label: '全选', parentID: '0', },
                {
                    value: '1',
                    label: 'kms',
                    children: [
                        { value: 'kms_certificate', label: 'kms_certificate', count: 200, parentID: '1', },
                        { value: 'ksm_config', label: 'ksm_config', count: 300, parentID: '1', },
                        { value: 'ksm_dcit', label: 'ksm_dcit', count: 200, parentID: '1', },
                        { value: 'kms_hadoop_key', label: 'kms_hadoop_key', count: 200, parentID: '1', },
                        { value: 'kms_key_pair', label: 'kms_key_pair', count: 200, parentID: '1', }
                    ]
                },
                {
                    value: '2',
                    label: 'scheduler',
                    children: [
                        { value: 'scheduler_task', label: 'scheduler_task', count: 200, parentID: '2', },
                        { value: 'scheduler_log', label: 'scheduler_log', count: 200, parentID: '2', }
                    ]
                },
                {
                    value: '3',
                    label: 'uim',
                    children: [
                        { value: 'uim_user', label: 'uim_user', count: 200, parentID: '3', },
                        { value: 'uim_role', label: 'uim_role', count: 200, parentID: '3', }
                    ]
                },
                {
                    value: '4',
                    label: 'sem',
                    children: [
                        { value: 'sem_data', label: 'sem_data', count: 200, parentID: '4', },
                        { value: 'sem_config', label: 'sem_config', count: 200, parentID: '4', }
                    ]
                },
                {
                    value: '5',
                    label: 'demo',
                    children: [
                        { value: 'demo_table', label: 'demo_table', count: 200, parentID: '5', }
                    ]
                }
            ],
            defaultProps: {
                children: 'aaa',
                label: 'label'
            },
            indeterminateKeys: [] // 用于存储半选状态的节点
        };
    },
    methods: {
        // 渲染树lebel节点
        renderContent(h, { node, data, store }) {
            const indeterminate = this.indeterminateKeys.includes(data.value);
            if (data.value === '0') {
                return (
                    <span class="custom-tree-node">
                        <span>{node.label}</span>
                    </span>
                );
            } else {
                return (
                    <span class="custom-tree-node">
                        <span>{node.label}</span>
                        <span class="expand-icon-box"><i class="el-icon-arrow-right expand-icon"></i></span>
                    </span>);
            }
        },
        // 共两个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、树目前的选中状态对象
        leftTreeCheckFn(data, node) {
            let nodes = this.$refs.tree.getNode(data.value); // nodeKey 是节点的 key 值
            console.log(nodes);
            
            if(data.value !== '0'){
                // 直接将数据推送到右侧展示 // 并将当前节点下的所有子节点选中
                this.checkedTables = data.children.map(item=>item.value)
                this.checkAllMiddle = true
            }else {

            }
            
            nodes = this.$refs.tree.getNode('0'); // nodeKey 是节点的 key 值
            // 获取所有子节点的 value 值（不包括全选节点）
            const allNodeValues = this.getAllNodeValues().filter(value => value !== '0');
            const checkedKeys = this.$refs.tree.getCheckedKeys().filter(value => value !== '0');
            if (checkedKeys.length > 0 && checkedKeys.length < allNodeValues.length) {
                // 如果选中的节点数量大于0且小于所有节点的数量，则将全选改为半选状态
                nodes.indeterminate = true;
            } else if (checkedKeys.length === allNodeValues.length) {
                // 如果选中的节点数量等于所有节点的数量，则将全选改为选中状态
                nodes.indeterminate = false;
                nodes.checked = true
            } else {
                nodes.indeterminate = false;
                nodes.checked = false
                // 如果没有任何节点被选中，则将全选改为非选中状态
            }
        },
        // flag 为0 左侧数据  // flag为1：中间数据
        getAllNodeValues(flag) {
            // 获取所有节点的value值
            const allValues = [];
            const options = flag ? this.filteredTables : this.options;
            const traverse = (nodes) => {
                nodes.forEach(node => {
                    allValues.push(node.value);
                });
            };
            traverse(options);
            return allValues;
        },
        // 树节点点击事件
        leftTreeClickFn(data, parmas, node) {
            if (data.value !== '0') {
                this.filteredTables = data.children
                this.middleCheckVisible = true
            }
        },
        handleMiddleCheckAllChange(value) {
            if (value) {
                this.checkedTables = this.tables.map(table => table.value);
                this.tables.forEach(table => {
                    table.checked = true;
                });
            } else {
                this.checkedTables = [];
                this.tables.forEach(table => {
                    table.checked = false;
                });
            }
        },
        handleCheckedTablesChange(value) {
            this.selectedItems = this.tables.filter(table => value.includes(table.value)).map(table => ({
                value: table.value,
                label: table.label,
                fieldCount: parseInt(table.label.match(/\d+/)[0]) || 0
            }));

        },

    }
};
</script>

<style scoped>
/* 添加一些基本的样式 */
.main_div {
    width: 100%;
    height: 600px;
    display: flex;
}

.canChoose {
    width: 65%;
    height: 100%;
    margin-right: 40px;
}

.canChoose_main {
    border: 2px solid #c7c7c7;
    height: calc(100% - 20px);
    display: flex;
}

.canChoose_left {
    height: 100%;
    width: 45%;
    border-right: 2px solid #c7c7c7;
}

/deep/.el-tree-node {
    border-bottom: 2px solid #c7c7c7;
    height: 40px;

}

/deep/.custom-tree-node {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

/deep/.el-tree-node__content {
    height: 100%;
}

/deep/.expand-icon {
    cursor: pointer;
}

/deep/.expand-icon-box {
    text-align: right;
    margin-right: 20px;
}

.canChoose_right {
    padding: 5px;
    box-sizing: border-box;
    flex: 1;
}

.centerCheckedBox {
    display: flex;
    flex-direction: column;
}

.centerCheckedBox /deep/.el-checkbox {
    padding: 5px;
}

.dowmChoose {
    width: 33%;
    height: 100%;
    background-color: rgb(162, 0, 255);
}
</style>