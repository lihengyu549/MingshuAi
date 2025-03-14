<template>
    <div class="main_div">
        <div class="canChoose">
            <!-- 右侧已选列表 -->
            <el-card class="left-panel">
                <div style="height: 20px;">可选</div>
                <div class="canChoose_main">
                    <div class="canChoose_left">
                        <el-tree ref="tree" :data="options" show-checkbox node-key="value" :default-expand-all="true"
                            :default-checked-keys="treeCheckedData" :props="defaultProps" :expand-on-click-node="false"
                            @node-click="leftTreeClickFn" filter :filter-node-method="filterNode"
                            @check="leftTreeCheckFn">
                            <div slot-scope="{ node }" class="tree-node">
                                <el-tooltip :content="node.label" :disabled="isShowTooltip" :open-delay="300"
                                    placement="top" effect="dark">
                                    <span class="over-ellipsis" @mouseover="mouseOver($event)">
                                        {{ node.label }}
                                    </span>
                                </el-tooltip>
                            </div>
                        </el-tree>
                    </div>
                    <div class="canChoose_right">
                        <el-input style="margin-bottom: 10px;" placeholder="请输入表名" v-model="searchQuery"
                            @input="inputSearch" clearable>
                            <i slot="prefix" class="el-input__icon el-icon-search"></i>
                        </el-input>
                        <div id="treeChildrenNode" style="margin-top: 20px;"></div>
                    </div>
                </div>

            </el-card>
        </div>
        <div class="dowmChoose">
            <!-- 右侧已选列表 -->
            <el-card class="right-panel">
                <div slot="header" class="clearfix">
                    <span>已选 <span class="right-panel-text">({{ selectedItemsParent.length }}张表 + {{ fieldCount
                            }}个字段)</span></span>
                    <el-button style="float: right; padding: 3px 0;color: blue;" type="text"
                        @click="clearSelection">清空</el-button>
                </div>
                <ul>
                    <li v-for="item in selectedItemsParent" :key="item.value">
                        {{ item.label }}
                        <div>
                            <span style="margin-right: 10px;">已选{{ item.checkedCount }}张表</span>
                            <el-button type="text" icon="el-icon-close" @click="removeItemByLabel(item)"></el-button>
                        </div>
                    </li>
                </ul>
            </el-card>
        </div>
    </div>
</template>

<script>
import { tree } from 'd3';

export default {
    name: "TableSelector",
    props: {
        scanContentTreeData: {
            type: Array,
            default: [],
        },
        treeCheckedData:{
            type: Array,
            default: [],
        }
    },
    data() {
        return {
            defaultArr: [],
            isShowTooltip: false,
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
            selectedItemsParent: [],// 右側父節點
            selectedItemsChildCount: [],// 右側傻逼阿季增加的无用数据展示
        };
    },
    created() {
        this.options[0].children.push(...this.scanContentTreeData);
    },
    mounted() {
        this.init()
    },
    computed: {
        fieldCount() {
            return this.selectedItemsChild.reduce((total, item) => total + parseInt(item.count), 0);
        },
    },
    watch: {

    },
    methods: {
        init() {
            this.$nextTick(() => {
                let treeChildrenNode = document.getElementById('treeChildrenNode')
                const { left, top } = treeChildrenNode.getBoundingClientRect()
                let treeNode = document.querySelectorAll('.el-tree-node__children')
                let padding = document.querySelectorAll('.el-tree-node__content')
                padding.forEach((item, index) => {
                    item.style.paddingLeft = 0
                })
                treeNode.forEach((item, index) => {
                    if (index > 0) {
                        item.style.left = left + 'px'
                        item.style.top = top + 'px'
                        item.style.position = 'fixed'
                        item.style.visibility = 'hidden'
                        item.style.width = '253px'
                        item.style.maxHeight = '521px'

                    }
                })
                let stateList = {
                    checkedNodes: [],
                    halfCheckedNodes: []
                }
                stateList.checkedNodes = this.$refs.tree.getCheckedNodes()
                stateList.halfCheckedNodes = this.$refs.tree.getHalfCheckedNodes()
                this.leftTreeCheckFn(null, stateList)
            })
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
                this.options[0].children.forEach((item, i) => {
                    if (item.value === data.value) {
                        index = i
                    }
                })
                if (index !== undefined) {
                    let showtrue = document.querySelector('.el-tree-node__children').childNodes
                    showtrue.forEach((item, i) => {
                        if (index == i) {
                            item.querySelector('.el-tree-node__children').style.visibility = 'initial'
                        } else {
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
        },
        clearSelection() {
            this.selectedItemsParent = []
            this.selectedItemsChild = []
            this.$refs.tree.setCheckedKeys([])
        },
        /**
     * 根据标签移除对应的子节点
     * 通过标签找到父节点，然后移除该父节点下的所有子节点
     * @param {string} value - 父节点
     */
        removeItemByLabel(value) {
            this.$refs.tree.setChecked(value, false)
            let ids = value.children.forEach(item => this.$refs.tree.setChecked(item.value, false))
            stateList = {
                checkedNodes: [],
                halfCheckedNodes: []
            }
            let stateList = this.$refs.tree.getHalfCheckedNodes().concat(...this.$refs.tree.getCheckedNodes())
            stateList.checkedNodes = this.$refs.tree.getCheckedNodes()
            stateList.halfCheckedNodes = this.$refs.tree.getHalfCheckedNodes()
            this.leftTreeCheckFn(null, stateList)
        },
        leftTreeCheckFn(data, stateList) {
            let parentList = []
            let sonList = []
            sonList = stateList.checkedNodes
            parentList = stateList.checkedNodes.concat(stateList.halfCheckedNodes);
            if (data && data.value == '0' && parentList.length === 0) {
                this.defaultArr = []
            }

            this.selectedItemsParent = parentList.filter(item => {
                if (item.children && item.children.length && item.value !== '0') {
                    return item
                }
            })
            this.selectedItemsChild = sonList.filter(item => {
                if (item.parentID) {
                    return item
                }
            })
            // 示例：获取特定父节点下的被选中子节点
            this.selectedItemsParent.forEach((item) => {
                item.checkedCount = this.getCheckedChildrenByParent(item.value, sonList).length;
            })
        },
        inputSearch(val) {
            this.$refs.tree.filter(val);
        },
        filterNode(value, data) {
            if (!value) return true;
            if (data.children) {
                return true
            } else {
                return data.label.indexOf(value) !== -1;
            }
        },
        /**
         * 获取特定节点下的被选中子节点
         * @param {string} parentId - 父节点的 value
         * @param {Array} checkedNodes - 所有被选中的节点
         * @returns {Array} - 特定节点下的被选中子节点
         */
        getCheckedChildrenByParent(parentId, checkedNodes) {
            return checkedNodes.filter(node => node.parentID === parentId);
        },
        mouseOver(event) {
            //在data里边记得要定义一个isShowTooltip默认为false
            this.isShowTooltip =
                event.currentTarget.scrollWidth <= event.currentTarget.clientWidth;
            // console.log("222");
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

/deep/ ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

/deep/::-webkit-scrollbar-thumb {
    background-color: #0003;
    border-radius: 10px;
    transition: all .2s ease-in-out;
}

/deep/::-webkit-scrollbar-track {
    border-radius: 10px;
}

ul {
    padding: 0;
    /* 移除内边距 */
    margin: 0;
    /* 移除外边距 */
    list-style: none;
    /* 移除项目符号 */
}

li {
    padding: 0;
    /* 如果需要，也可以移除列表项的内边距 */
    margin: 0;
    /* 如果需要，也可以移除列表项的外边距 */
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.canChoose {
    width: 65%;
    height: 100%;
    margin-right: 20px;
}

.canChoose_main {
    height: calc(100%);
    display: flex;
    /* 添加内边距 */
}

.canChoose_left {
    height: 100%;
    overflow-y: auto;
    width: 45%;
    border-right: 2px solid #c7c7c7;
}

.canChoose_left /deep/ .el-tree-node__children {
    height: 534px;
    overflow-y: auto;
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
    padding: 10px;
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
    width: 40%;
    height: 100%;
}

.dowmChoose .el-card /deep/ .el-card__body {
    max-height: 534px;
    overflow-y: auto;
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

/deep/ .el-tree-node__expand-icon,
/deep/.expand-icon-box {
    display: none;
}

.right-panel-text {
    color: #c4c4c4;
    margin-left: 5px;
}

.tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    /* padding-right: 8px; */
}

.over-ellipsis {
    display: block;
    width: 140PX;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    -webkit-line-clamp: 1;
}
</style>