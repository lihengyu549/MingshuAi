<template>
    <div class="main_div">
        <div class="canChoose">
            <!-- 右侧已选列表 -->
            <el-card class="left-panel">
                <div style="height: 20px;">可选</div>
                <div class="canChoose_main">
                    <div class="canChoose_left">
                        <el-tree ref="tree" :data="options" show-checkbox node-key="value" :default-expand-all="true"
                            :default-checked-keys="[]" :props="defaultProps" :expand-on-click-node="false"
                             @node-click="leftTreeClickFn">
                        </el-tree>
                    </div>
                    <div class="canChoose_right">
                        <el-input style="margin-bottom: 10px;" placeholder="请输入表名" v-model="searchQuery" clearable>
                            <i slot="prefix" class="el-input__icon el-icon-search"></i>
                        </el-input>
                        <div id="aaa"></div>
                    </div>
                </div>

            </el-card>
        </div>
        <div class="dowmChoose">
            <!-- 右侧已选列表 -->
            <el-card class="right-panel">
                <div slot="header" class="clearfix">
                    <span>已选 ({{ selectedCount }}张数据表 + {{ fieldCount }}个字段)</span>
                    <el-button style="float: right; padding: 3px 0" type="text" @click="clearSelection">清空</el-button>
                </div>
                <ul>
                    <li v-for="item in options" v-show="isShowFn(item.value)" :key="item.label">
                        {{ item.label }}
                        <el-button type="text" icon="el-icon-close" @click="removeItemByLabel(item.label)"></el-button>
                    </li>
                </ul>
            </el-card>
        </div>
    </div>
</template>

<script>
import { tree } from 'd3';

export default {
    data() {
        return {
            middleCheckVisible: false, // 新增属性，控制中间全选复选框的显示与隐藏
            checkAllMiddle: false, // 中间全选框
            isIndeterminate: false, // 中间半选数据
            checkedTables: [], // 中间绑定数据展示用
            allCheckedTables: [],// 所有中间绑定的数据
            filteredTables: [],// 中间数据
            searchQuery: '',// 中间搜索绑定值
            options: [
                {
                    value: '0',
                    label: '全选',
                    children: [
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
                    ]
                }
            ],
            defaultProps: {
                children: 'children',
                label: 'label'
            },
            indeterminateKeys: [], // 用于存储半选状态的节点
            selectedItems: [], // 右侧数据】
            selectedItemsChild: [],// 右侧数据的子节点数据
        };
    },
    mounted() {
        this.init()
    },
    computed: {
        selectedCount() {
            return this.selectedItems.length;
        },
        fieldCount() {
            return this.selectedItemsChild.reduce((total, item) => total + item.count, 0);
        },
    },
    watch: {
        filteredTables: {
            handler(newVal) {
                console.log(newVal);

            },
            deep: true // 深度监听
        }
    },
    methods: {
        init(){
            this.$nextTick(()=>{
                let aaa = document.getElementById('aaa')
                const {left,top} = aaa.getBoundingClientRect()
                let treeNode = document.querySelectorAll('.el-tree-node__children')
                let padding = document.querySelectorAll('.el-tree-node__content')
                                
                padding.forEach((item, index)=>{
                    item.style.paddingLeft = 0
                })
                treeNode.forEach((item, index)=>{
                    if(index > 0){
                        item.style.left = left + 'px'
                        item.style.top = top + 'px'
                        item.style.position = 'fixed'
                        item.style.visibility = 'hidden'
                    }
                })
            })
        },
        isShowFn(id) {
            if (this.$refs.tree) {
                const checkedData = this.$refs.tree.getCheckedNodes();// 选中数据
                const CheckedNodes = this.$refs.tree.getHalfCheckedNodes();//半选数据
            } else {
                return false
            }

        },
        // 获取 value 不等于 0 的所有 children
        getChildren(options) {
            return options.reduce((acc, item) => {
                if (item.value !== '0' && item.children) {
                    acc.push(...item.children);
                }
                return acc;
            }, []);
        },
        // flag 为0 左侧数据  // flag为1：中间数据
        getAllNodeValues() {
            // 获取所有节点的value值
            const allValues = [];
            const options = this.options;
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
                let index
                this.options[0].children.forEach((item,i)=>{
                    if(item.value === data.value){
                        index = i
                    }
                })
                if(index !== undefined){
                    let showtrue = document.querySelector('.el-tree-node__children').childNodes
                    showtrue.forEach((item, i)=>{
                        if(index == i){
                            item.querySelector('.el-tree-node__children').style.visibility = 'initial'
                        }else {
                            item.querySelector('.el-tree-node__children').style.visibility = 'hidden'
                        }
})
                }
                // let treeNode = document.querySelectorAll('.el-tree-node__children')
                // treeNode.forEach((item, index)=>{
                //     if(index > 0 ){
                //         if(item.value!==)
                //         item.style.visibility = 'hidden'
                //     }
                // })
            }
        },        clearSelection() {
            this.checkedTables = [];
            this.selectedItems = [];
            this.checkAllMiddle = false;
            this.checkedOptions = [];
            this.options.forEach(option => {
                option.children.forEach(child => {
                    child.checked = false;
                });
            });
        },
        /**
     * 根据标签移除对应的子节点
     * 通过标签找到父节点，然后移除该父节点下的所有子节点
     * @param {string} label - 父节点的标签
     */
        removeItemByLabel(label) {
            // 根据标签找到对应的父节点
            const parentOption = this.options.find(option => option.label === label);
            if (parentOption) {
                // 遍历父节点的所有子节点并移除它们
                parentOption.children.forEach(child => {
                    this.removeItem(child);
                });
            }
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
    height: calc(100%);
    display: flex;
    /* 添加内边距 */
}

.canChoose_left {
    height: 100%;
    width: 45%;
    border-right: 2px solid #c7c7c7;
}

/deep/.el-tree-node {
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

.left-panel /deep/.el-card__body {
    height: 100%;
}

.canChoose_right {
    padding: 0 20px;
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
}

.left-panel {
    flex: 1;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    height: 100%;
    background-color: #fff;
    margin-right: 10px;
    /* 添加右侧间距 */
}

.right-panel {
    height: 100%;
}
/deep/ .el-tree-node__expand-icon,/deep/.expand-icon-box{
    display: none;
}
</style>