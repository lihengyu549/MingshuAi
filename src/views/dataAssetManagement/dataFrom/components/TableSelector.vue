<template>
    <div class="main_div">
        <div class="canChoose">
            <el-card class="left-panel">
                <div slot="header" class="clearfix">可选</div>
                <div class="canChoose_main">
                    <div class="canChoose_left">
                        <!-- 全选复选框 -->
                        <div class="check-item">
                            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
                                @change="handleCheckAllChange">
                                全选
                            </el-checkbox>
                        </div>

                        <!-- 数据库列表 - 复选框与文本完全分离 -->
                        <div v-for="item in returnArr" :key="item.value" class="check-item">
                            <div class="check-item-inner">
                                <!-- 复选框单独存在，只负责勾选逻辑 -->
                                <el-checkbox :indeterminate="item.isBanxuan" v-model="item.checked"
                                    @change="handleCheckboxClick(item, $event)">
                                </el-checkbox>

                                <!-- 文本内容单独存在，只负责展示表名，添加高亮状态 -->
                                <span class="database-name" :class="{ 'database-name-active': item.isActive }"
                                    @click="handleDatabaseNameClick(item)">
                                    {{ item.name }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="canChoose_right">
                        <el-input style="margin-bottom: 10px;" placeholder="请输入表名" v-model="searchQuery"
                            @input="inputSearch" clearable>
                            <i slot="prefix" class="el-input__icon el-icon-search"></i>
                        </el-input>

                        <!-- 新增中间列表全选按钮 -->
                        <el-button type="text" style="margin-bottom: 10px; padding: 0; align-self: flex-end;"
                            @click="handleMiddleListCheckAll">
                            {{ isMiddleListAllChecked ? '取消全选' : '全选' }}
                        </el-button>

                        <!-- 表名列表容器 -->
                        <div class="table-list-container">
                            <!-- 空状态提示 - 放在前面确保优先显示 -->
                            <div v-if="checkListChildAll.length === 0" class="empty-state">
                                请选择左侧数据库查看表
                            </div>

                            <!-- 表名列表 - 只有当有数据时才显示 -->
                            <RecycleScroller v-else :items="checkListChildAll" :item-size="30" class="table-scroller"
                                key-field="value">
                                <template #default="{ item }">
                                    <el-checkbox v-model="item.checked" @change="handleCheckedChildChange(item, $event)"
                                        :label="item.tableName" :key="item.value" class="inline-checkbox">
                                        {{ item.tableName }}
                                    </el-checkbox>
                                </template>
                            </RecycleScroller>
                        </div>
                    </div>
                </div>
            </el-card>
        </div>

        <div class="dowmChoose">
            <el-card class="right-panel">
                <div slot="header" class="clearfix">
                    <span>
                        已选
                        <span class="right-panel-text">{{ selectedDisplayText }}</span>
                    </span>
                    <el-button style="float: right; padding: 3px 0;color: blue;" type="text" @click="clearSelection">
                        清空
                    </el-button>
                </div>
                <ul>
                    <li v-for="item in checkList" :key="item">
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
import { getDatabaseTableNameList } from "@/api/system/proxys";

export default {
    name: "TableSelector",
    components: {
        RecycleScroller
    },
    props: {
        scanContentTreeData: { // 总库名
            type: Array,
            default: () => []
        },
        treeCheckedData: { // 已选表名
            type: Array,
            default: []
        },
        databaseTableNameParama: { // 数据库表名传参
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            checkAll: false,
            checkList: [], // 已选数据库库名
            databaseTableNameP: { ...this.databaseTableNameParama, databaseName: "" },
            isIndeterminate: false,
            checkListChild: [], // 已选子列表表名
            checkListChildAll: [], // 子列表所有表名
            searchQuery: '', // 查询表名
            serchListChildAll: [], // 查询后子列表所有表名
            returnArr: [], // 汇总数据
            isMiddleListAllChecked: false // 中间列表全选状态
        };
    },
    mounted() {
        // 初始化数据库列表，添加isActive属性用于高亮显示
        this.returnArr = this.scanContentTreeData.map(item => ({
            name: item.label,
            checked: false,
            isBanxuan: false,
            value: item.value,
            children: [],
            isActive: false // 用于标识是否被点击激活（高亮）
        }));
    },
    computed: {
        // 完全选中的数据源数量
        fullSelectedDbs() {
            return this.returnArr.filter(db =>
                db.children.length > 0 &&
                db.checked &&
                db.children.every(table => table.checked)
            ).length;
        },

        // 部分选中的数据源
        partialSelectedDbs() {
            return this.returnArr.filter(db => {
                const hasCheckedTables = db.children.some(table => table.checked);
                const isFullSelected = db.children.length > 0 && db.children.every(table => table.checked);
                return hasCheckedTables && !isFullSelected;
            });
        },

        // 部分选中数据源的总表数
        partialSelectedTables() {
            return this.partialSelectedDbs.reduce((total, db) => {
                return total + db.children.filter(table => table.checked).length;
            }, 0);
        },

        // 已选文本展示内容
        selectedDisplayText() {
            const fullCount = this.fullSelectedDbs;
            const partialCount = this.partialSelectedDbs.length;
            const partialTableCount = this.partialSelectedTables;

            if (fullCount === 0 && partialCount === 0) {
                return '(未选择数据)';
            } else if (partialCount === 0) {
                return `(${fullCount}个数据源)`;
            } else if (fullCount === 0) {
                return `(${partialCount}个数据源中的${partialTableCount}张表)`;
            } else {
                return `(${fullCount}个数据源 + ${partialCount}个数据源中的${partialTableCount}张表)`;
            }
        },

        // 已选表数量
        selectedTableCount() {
            return this.returnArr.reduce((total, db) => {
                if (db.children && db.children.length) {
                    return total + db.children.filter(table => table.checked).length;
                }
                return total;
            }, 0);
        }
    },
    methods: {
        // 全选复选框事件
        handleCheckAllChange(checked) {
            this.isIndeterminate = false;

            if (checked) {
                // 全选：加载所有表并选中，但不在中间列表展示
                const fetchPromises = this.returnArr.map(item =>
                    this.fetchTableNames(item.name).then(() => {
                        item.checked = true;
                        item.isActive = false; // 全选时不高亮任何单个数据库
                        item.children.forEach(table => table.checked = true);
                    })
                );

                Promise.all(fetchPromises).then(() => {
                    // 全选时清空中间列表，不展示任何表
                    this.checkListChildAll = [];
                    this.serchListChildAll = [];
                    this.updateCheckList();
                    this.updateMiddleListCheckAllStatus(); // 更新中间列表全选状态
                });
            } else {
                // 取消全选：清除所有选中状态和中间列表
                this.returnArr.forEach(item => {
                    item.checked = false;
                    item.isBanxuan = false;
                    item.isActive = false;
                    item.children.forEach(table => table.checked = false);
                });
                this.checkListChildAll = [];
                this.serchListChildAll = [];
                this.updateCheckList();
                this.updateMiddleListCheckAllStatus(); // 更新中间列表全选状态
            }
        },

        // 点击数据库名称 - 只展示表，不勾选，添加高亮
        async handleDatabaseNameClick(item) {
            // 移除所有数据库的高亮状态
            this.returnArr.forEach(db => db.isActive = false);
            // 为当前点击的数据库添加高亮状态
            item.isActive = true;

            // 加载表数据
            await this.fetchTableNames(item.name);

            // 只展示当前库的表
            const database = this.returnArr.find(ele => ele.name === item.name);
            if (database && database.children) {
                this.checkListChildAll = [...database.children];
                this.serchListChildAll = [...database.children];
                this.updateMiddleListCheckAllStatus(); // 更新中间列表全选状态
            }
        },

        // 点击复选框 - 勾选/取消勾选
        async handleCheckboxClick(item, checked) {
            const database = this.returnArr.find(ele => ele.name === item.name);
            database.checked = checked;
            database.isBanxuan = false;

            if (checked) {
                // 勾选：加载表并全选，同时高亮当前数据库
                this.returnArr.forEach(db => db.isActive = false);
                database.isActive = true;

                await this.fetchTableNames(item.name);
                database.children.forEach(table => table.checked = true);
                this.checkListChildAll = [...database.children];
                this.serchListChildAll = [...database.children];
            } else {
                // 取消勾选：只取消表的选中状态，保留中间列表展示（由激活状态决定）
                if (database.children) {
                    database.children.forEach(table => table.checked = false);
                }
                // 移除这行错误的过滤逻辑：不再从中间列表删除数据
                // this.checkListChildAll = this.checkListChildAll.filter(
                //     table => table.databaseName !== database.name
                // );
                // 如果当前取消勾选的是激活状态的数据库，保持列表展示
                if (database.isActive) {
                    this.checkListChildAll = [...database.children];
                    this.serchListChildAll = [...database.children];
                }
            }

            this.updateCheckList();
            this.updateCheckAllStatus();
        },

        // 子表勾选变化
        handleCheckedChildChange(item, checked) {
            const database = this.returnArr.find(ele => ele.name === item.databaseName);
            const checkedChildren = database.children.filter(child => child.checked);

            // 更新数据库的选中状态
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
            this.updateCheckAllStatus();
            this.updateMiddleListCheckAllStatus(); // 更新中间列表全选状态
        },

        // 清空选择
        clearSelection() {
            this.checkAll = false;
            this.isIndeterminate = false;
            this.returnArr.forEach(database => {
                database.checked = false;
                database.isBanxuan = false;
                database.isActive = false; // 清空高亮状态
                database.children.forEach(table => table.checked = false);
            });
            this.checkList = [];
            this.checkListChildAll = [];
            this.serchListChildAll = [];
            this.isMiddleListAllChecked = false; // 重置中间列表全选状态
        },

        // 搜索表名
        inputSearch(val) {
            this.checkListChildAll = this.serchListChildAll.filter(item =>
                item.tableName.includes(val)
            );
            this.updateMiddleListCheckAllStatus(); // 更新中间列表全选状态
        },

        // 更新全选按钮状态
        updateCheckAllStatus() {
            const allChecked = this.returnArr.every(db => db.checked);
            const someChecked = this.returnArr.some(db => db.checked || db.isBanxuan);
            this.checkAll = allChecked;
            this.isIndeterminate = someChecked && !allChecked;
        },

        // 获取表名列表
        async fetchTableNames(databaseName) {
            const database = this.returnArr.find(ele => ele.name === databaseName);
            if (database && database.children && database.children.length > 0) {
                return; // 已加载过，直接返回
            }

            // 请求表数据
            this.databaseTableNameP.databaseName = databaseName;
            const res = await getDatabaseTableNameList(this.databaseTableNameP);
            const tables = res.data.map(item => ({
                databaseName: item.databaseName,
                tableName: item.tableName,
                value: item.parentID,
                checked: false // 初始不选中
            }));

            if (database) {
                database.children = tables;
            }
        },

        // 更新已选列表
        updateCheckList() {
            this.checkList = this.returnArr.filter(database => {
                if (database.checked) return true;
                if (database.isBanxuan) {
                    return database.children.some(child => child.checked);
                }
                return false;
            }).map(database => database.name);
        },

        // 中间列表全选/取消全选
        handleMiddleListCheckAll() {
            if (this.checkListChildAll.length === 0) return;

            // 切换全选状态
            const newCheckedState = !this.isMiddleListAllChecked;

            // 只对当前展示的表（包括筛选后的）进行操作
            this.checkListChildAll.forEach(item => {
                item.checked = newCheckedState;
                // 同步更新对应数据库的状态
                const database = this.returnArr.find(ele => ele.name === item.databaseName);
                if (database) {
                    const checkedChildren = database.children.filter(child => child.checked);
                    const totalChildren = database.children.length;

                    // 更新数据库的选中状态
                    if (checkedChildren.length === 0) {
                        database.checked = false;
                        database.isBanxuan = false;
                    } else if (checkedChildren.length === totalChildren) {
                        database.checked = true;
                        database.isBanxuan = false;
                    } else {
                        database.checked = false;
                        database.isBanxuan = true;
                    }
                }
            });

            this.isMiddleListAllChecked = newCheckedState;
            this.updateCheckList();
            this.updateCheckAllStatus();
        },

        // 更新中间列表全选状态
        updateMiddleListCheckAllStatus() {
            if (this.checkListChildAll.length === 0) {
                this.isMiddleListAllChecked = false;
                return;
            }
            // 检查当前展示的所有表是否都被选中
            this.isMiddleListAllChecked = this.checkListChildAll.every(item => item.checked);
        }
    },
    watch: {
        // 监听中间列表数据变化，更新全选状态
        checkListChildAll: {
            handler() {
                this.updateMiddleListCheckAllStatus();
            },
            deep: true
        }
    }
};
</script>

<style scoped>
.main_div {
    width: 100%;
    height: 600px;
    display: flex;
}

/* 滚动条样式 */
/deep/ ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

/deep/::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 4px;
    transition: all .2s ease-in-out;
}

/deep/::-webkit-scrollbar-thumb:hover {
    background-color: #a8a8a8;
}

/deep/::-webkit-scrollbar-track {
    background-color: #f5f5f5;
    border-radius: 4px;
}

ul {
    padding: 0;
    margin: 0;
    list-style: none;
}

li {
    padding: 0;
    margin: 0;
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
    height: calc(100% - 40px);
    /* 调整高度计算，留出卡片头部空间 */
    display: flex;
}

.canChoose_left {
    height: 100%;
    overflow-y: auto;
    /* 确保左侧列表有滚动条 */
    width: 45%;
    border-right: 2px solid #c7c7c7;
    padding: 0 10px;
}

/* 复选框与文本分离的样式 */
.check-item {
    margin: 5px 0;
}

.check-item-inner {
    display: flex;
    align-items: center;
    padding: 4px 6px;
    border-radius: 4px;
}

/* 数据库名称样式 */
.database-name {
    margin-left: 8px;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
}

/* 高亮样式 - 点击后激活 */
.database-name-active {
    color: #409EFF;
    font-weight: 500;
}

/* 包含高亮数据库的行样式 */
.check-item-inner:has(.database-name-active) {
    background-color: #ecf5ff;
}

.database-name:hover {
    color: #409EFF;
}

.left-panel /deep/.el-card__body {
    height: 100%;
    padding: 10px;
}

.canChoose_right {
    padding: 0 20px;
    box-sizing: border-box;
    flex: 1;
    height: 100%;
    /* 确保右侧容器有明确高度 */
    display: flex;
    flex-direction: column;
    /* 使用flex布局确保高度正确计算 */
}

/* 表列表容器和滚动设置 */
.table-list-container {
    flex: 1;
    /* 占满剩余空间 */
    border-radius: 4px;
    overflow: hidden;
    min-height: 0;
    /* 允许容器小于内容高度 */
    position: relative;
    /* 为绝对定位的空状态做准备 */
}

/* 确保虚拟滚动容器有正确的滚动设置 */
.table-scroller {
    height: 100%;
    overflow-y: auto;
}

/* 空状态样式 - 确保始终可见 */
.empty-state {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    margin: 0;
    z-index: 1;
    /* 确保在内容之上 */
}

.dowmChoose {
    width: 35%;
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
}

.right-panel {
    height: 100%;
}

.right-panel-text {
    color: #c4c4c4;
    margin-left: 5px;
}

.inline-checkbox {
    width: 100%;
    margin: 3px 0;
    padding: 2px 0;
}
</style>