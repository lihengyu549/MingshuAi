<template>
    <div class="main_div">
        <div class="canChoose">
            <!-- 右侧已选列表 -->
            <el-card class="left-panel">
                <div style="height: 20px;">可选</div>
                <div class="canChoose_main">
                    <div class="canChoose_left">
                        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
                            @change="handleCheckAllChange">全选</el-checkbox>
                        <el-checkbox-group v-model="checkList" @change="handleCheckedChangeGroup">
                            <el-checkbox v-for="item in returnArr" :label="item.name" :key="item.value"
                                class="inline-checkbox" @change="handleCheckedChange(item, $event)"
                                :indeterminate="item.isBanxuan">
                                {{ item.name }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </div>
                    <div class="canChoose_right">
                        <el-input style="margin-bottom: 10px;" placeholder="请输入表名" v-model="searchQuery"
                            @input="inputSearch" clearable>
                            <i slot="prefix" class="el-input__icon el-icon-search"></i>
                        </el-input>
                        <!-- 使用 RecycleScroller 替换原来的 el-checkbox-group -->
                        <RecycleScroller :items="checkListChildAll" :item-size="30"
                            style="max-height: calc(100% - 70px); overflow: auto;" key-field="value">
                            <!-- 每个列表项的高度，根据实际情况调整 -->
                            <template #default="{ item }">
                                <el-checkbox v-model="item.checked" @change="handleCheckedChildChange(item, $event)"
                                    :label="item.tableName" :key="item.value" class="inline-checkbox">
                                    {{ item.tableName }}
                                </el-checkbox>
                            </template>
                        </RecycleScroller>
                    </div>
                </div>
            </el-card>
        </div>
        <div class="dowmChoose">
            <!-- 右侧已选列表 -->
            <el-card class="right-panel">
                <div slot="header" class="clearfix">
                    <span>
                        已选
                        <span v-if="isAllTablesSelected" class="right-panel-text">(所有数据源)</span>
                        <span v-else class="right-panel-text">({{ tableNum }}张表)</span>
                    </span>
                    <el-button style="float: right; padding: 3px 0;color: blue;" type="text"
                        @click="clearSelection">清空</el-button>
                </div>
                <ul>
                    <li v-for="item in checkList" :key="item.value">
                        <span style="line-height: 20px;">{{ item }}</span>
                    </li>
                </ul>
            </el-card>
        </div>
    </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import {
    getDatabaseTableNameList
} from "@/api/system/proxys";
export default {
    name: "TableSelector",
    components: {
        RecycleScroller
    },
    props: {
        scanContentTreeData: { //总库名
            type: Array,
            default: () => []
        },
        treeCheckedData: { //已选表名
            type: Array,
            default: []
        },
        databaseTableNameParama: { //数据库表名传参
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            checkAll: false,
            checkList: [], //已选数据库库名
            databaseTableNameP: { ...this.databaseTableNameParama, databaseName: "" }, //数据库表名传参
            databaseTableNameList: [],//数据库表名列表
            isIndeterminate: false,
            // 表明列表属性
            checkListChild: [], //已选子列表表名
            checkListChildAll: [], //子列表所有表名
            searchQuery: '', //查询表名
            serchListChildAll: [], //查询后子列表所有表名

            selectedItemsChild: [],// 右侧数据的子节点数据
            selectedItemsParent: [],// 右側父節點
            selectedItemsChildCount: [],// 右側增加的无用数据展示

            //汇总数据
            returnArr: []
        };
    },
    created() {
    },
    mounted() {
        this.returnArr = this.scanContentTreeData.map(item => {
            return {
                name: item.label,//左侧label
                checked: false,// 是否选中
                isBanxuan: false,//是否半选
                value: item.value,
                children: []
            }
        })
    },
    computed: {
        tableNum() {
            const count = (items) => {
                return items.reduce((total, item) => {
                    const isLeafNode = !item.children || item.children.length === 0;
                    const currentCount = isLeafNode && item.checked ? 1 : 0;
                    const childrenCount = item.children ? count(item.children) : 0;
                    return total + currentCount + childrenCount;
                }, 0);
            };
            return count(this.returnArr);
        },
        isAllTablesSelected() {
            return this.returnArr.every(database => {
                return database.checked && database.children.every(table => table.checked);
            });
        }
    },
    watch: {
    },
    methods: {
        handleCheckAllChange(val) {
            this.checkList = val ? this.scanContentTreeData.map(item => item.label) : [];
            this.isIndeterminate = false;

            // 更新 returnArr 中每个数据库的 checked 状态
            this.returnArr.forEach(database => {
                database.checked = val;
                database.isBanxuan = false;
                if (!val) {
                    database.children = [];
                }
            });

            // 清空中间列表
            this.checkListChildAll = [];
            this.serchListChildAll = [];

            // 强制更新计算属性
            this.$forceUpdate();
        },
        // flag 为0 左侧数据  // flag为1：中间数据
        // 树节点点击事件
        clearSelection() {
            this.checkList = [];
            this.checkListChild = [];
            this.checkAll = false;
            this.returnArr.forEach(database => {
                database.checked = false;
                database.isBanxuan = false;
                database.children = [];
            });
            this.checkListChildAll = [];
            this.serchListChildAll = [];
            this.$forceUpdate();
        },
        inputSearch(val) {
            this.checkListChildAll = this.serchListChildAll.filter(item => {
                return item.tableName.indexOf(val) !== -1;
            })
        },
        handleCheckedChangeGroup(val) {
            let checkedCount = val.length;
            this.checkAll = checkedCount === this.scanContentTreeData.length;
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.scanContentTreeData.length;
        },
        async handleCheckedChange(val, e) {
            const database = this.returnArr.find(ele => ele.name === val.name);
            database.isBanxuan = false;
            if (e) {
                // 清空中间列表
                this.checkListChildAll = [];
                this.serchListChildAll = [];

                await this.fetchTableNames(val.name);
                database.checked = true;
                database.children.forEach(table => {
                    table.checked = true;
                });
                this.checkListChild = this.checkListChildAll.filter(item => item.databaseName === val.name).map(item => item.tableName);
            } else {
                database.checked = false;
                database.children = [];
                this.checkListChild = this.checkListChild.filter(item => item.databaseName !== val.name);
                this.checkListChildAll = this.checkListChildAll.filter(item => item.databaseName !== val.name);
                this.serchListChildAll = this.serchListChildAll.filter(item => item.databaseName !== val.name);
            }
            this.updateCheckList();
            this.$forceUpdate();
        },
        handleCheckedChildChange(item, e) {
            const database = this.returnArr.find(ele => ele.name === item.databaseName);
            const checkedChildren = database.children.filter(child => child.checked);
            if (checkedChildren.length === 0) {
                database.checked = false;
                database.isBanxuan = false;
            } else if (checkedChildren.length === database.children.length) {
                database.checked = true;
                database.isBanxuan = false;
            } else {
                database.checked = false;
                database.isBanxuan = true;
            }
            this.updateCheckList();

            // 重新计算全选按钮的状态
            const allChecked = this.returnArr.every(database => database.checked);
            const someChecked = this.returnArr.some(database => database.checked || database.isBanxuan);
            this.checkAll = allChecked;
            this.isIndeterminate = someChecked && !allChecked;

            this.$forceUpdate();
        },
        async fetchTableNames(databaseName) {
            this.databaseTableNameP.databaseName = databaseName;
            let res = await getDatabaseTableNameList(this.databaseTableNameP);
            const tables = res.data.map((item) => {
                return {
                    databaseName: item.databaseName,
                    tableName: item.tableName,
                    value: item.parentID,
                    checked: false
                }
            });
            const database = this.returnArr.find(ele => ele.name === databaseName);
            database.children = tables;
            // 只保留当前点击库的表列表
            this.checkListChildAll = tables;
            this.serchListChildAll = [...tables];
        },
        updateCheckList() {
            this.checkList = this.returnArr.filter(database => {
                return database.children.some(child => child.checked);
            }).map(database => database.name);
        }

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

.inline-checkbox {
    width: 100%;
    margin: 3px 0;
}
</style>