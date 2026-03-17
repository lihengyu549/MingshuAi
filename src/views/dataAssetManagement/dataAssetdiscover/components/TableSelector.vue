<template>
    <div class="main_div">
        <div class="canChoose">
            <el-card class="left-panel">
                <div slot="header" class="clearfix">{{ $t('dataAssetdiscover.tableSelector.optional') }}</div>
                <div class="canChoose_main">
                    <div class="canChoose_left">
                        <!-- 全选复选框 -->
                        <div class="check-item">
                            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
                                @change="handleCheckAllChange">
                                {{ $t('dataAssetdiscover.tableSelector.selectAll') }}
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
                        <el-input style="margin-bottom: 10px;" :placeholder="$t('dataAssetdiscover.tableSelector.pleaseInputTableName')" v-model="searchQuery"
                            @input="inputSearch" clearable>
                            <i slot="prefix" class="el-input__icon el-icon-search"></i>
                        </el-input>

                        <!-- 新增中间列表全选按钮 -->
                        <el-button type="text" style="margin-bottom: 10px; padding: 0; align-self: flex-end;"
                            @click="handleMiddleListCheckAll">
                            {{ isMiddleListAllChecked ? $t('dataAssetdiscover.tableSelector.cancelSelectAll') : $t('dataAssetdiscover.tableSelector.selectAll') }}
                        </el-button>

                        <!-- 表名列表容器 -->
                        <div class="table-list-container">
                            <!-- 空状态提示 - 放在前面确保优先显示 -->
                            <div v-if="checkListChildAll.length === 0" class="empty-state">
                                {{ $t('dataAssetdiscover.tableSelector.selectLeftDatabase') }}
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

        <!-- 右侧已选区域优化 -->
        <div class="dowmChoose">
            <el-card class="right-panel">
                <div slot="header" class="clearfix" style="display: flex; justify-content: space-between;">

                    <span>
                        {{ $t('dataAssetdiscover.tableSelector.selected') }}
                        <span class="right-panel-text">{{ selectedDisplayText }}</span>
                    </span>
                    <el-button style="padding: 3px 0;color: #3b82f6;" type="text" @click="clearSelection">
                        {{ $t('dataAssetdiscover.tableSelector.clear') }}
                    </el-button>
                </div>

                <!-- 已选数据库列表 -->
                <div class="selected-db-container">
                    <ul class="selected-db-list">
                        <li v-for="db in formattedSelectedDatabases" :key="db.name" class="selected-db-item">
                            <!-- 数据库名称与状态标识 -->
                            <div class="db-header">
                                <span class="db-name">{{ db.name }}</span>
                                <span class="db-status" :class="db.statusClass">
                                    {{ db.statusText }}
                                </span>
                            </div>

                            <!-- 部分选中时显示表名摘要 -->
                            <div v-if="!db.isFullSelected" class="partial-tables">
                                <span class="table-item" v-for="(table, index) in db.displayTables"
                                    :key="table.tableName">
                                    {{ table.tableName }}
                                    <template v-if="index < db.displayTables.length - 1">、</template>
                                </span>
                                <template v-if="db.hiddenTableCount > 0">
                                    <span class="more-tip">...{{ $t('dataAssetdiscover.tableSelector.andTables', { count: db.hiddenTableCount }) }}</span>
                                </template>
                            </div>
                        </li>
                    </ul>

                    <!-- 空状态 -->
                    <div v-if="formattedSelectedDatabases.length === 0" class="selected-empty">
                        <div class="empty-icon">
                            <i class="el-icon-document-empty"></i>
                        </div>
                        <div class="empty-text">{{ $t('dataAssetdiscover.tableSelector.noSelectedData') }}</div>
                    </div>
                </div>
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
        scanContentTreeData: {
            type: Array,
            default: () => []
        },
        treeCheckedData: {
            type: Array,
            default: []
        },
        databaseTableNameParama: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            checkAll: false,
            checkList: [],
            databaseTableNameP: { ...this.databaseTableNameParama, databaseName: "" },
            isIndeterminate: false,
            checkListChild: [],
            checkListChildAll: [],
            searchQuery: '',
            serchListChildAll: [],
            returnArr: [],
            isMiddleListAllChecked: false
        };
    },
    mounted() {
        // 初始化数据库列表，确保所有属性都是响应式的
        this.returnArr = this.scanContentTreeData.map(item => ({
            name: item.label,
            checked: false,
            isBanxuan: false,
            value: item.value,
            children: [],
            isActive: false
        }));

        // 处理treeCheckedData的回显 - 使用nextTick确保DOM更新后执行
        this.$nextTick(() => {
            this.handleTreeCheckedDataEcho();
        });
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
                return `(${this.$t('dataAssetdiscover.tableSelector.noSelectedData')})`;
            } else if (partialCount === 0) {
                return `(${fullCount}${this.$t('dataAssetdiscover.tableSelector.allTablesInDb')})`;
            } else if (fullCount === 0) {
                return `(${partialCount}${this.$t('dataAssetdiscover.tableSelector.partialTables', { count: partialTableCount })})`;
            } else {
                return `(${fullCount}${this.$t('dataAssetdiscover.tableSelector.allTablesInDb')}+${partialCount}${this.$t('dataAssetdiscover.tableSelector.partialTables', { count: partialTableCount })})`;
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
        },
        // 格式化已选数据库数据
        formattedSelectedDatabases() {
            return this.returnArr
                .filter(db => {
                    const hasSelectedTables = db.children.some(table => table.checked);
                    return hasSelectedTables;
                })
                .map(db => {
                    const selectedTables = db.children.filter(table => table.checked);
                    const isFullSelected = selectedTables.length === db.children.length;
                    const maxDisplay = 3; // 最多显示3张表名

                    return {
                        name: db.name,
                        isFullSelected,
                        selectedTables,
                        // 显示的表名（最多3个）
                        displayTables: selectedTables.slice(0, maxDisplay),
                        // 隐藏的表数量
                        hiddenTableCount: selectedTables.length > maxDisplay
                            ? selectedTables.length - maxDisplay
                            : 0,
                        // 状态样式与文本
                        statusClass: isFullSelected ? 'status-full' : 'status-partial',
                        statusText: isFullSelected ? this.$t('dataAssetdiscover.tableSelector.allTables') : `${selectedTables.length}${this.$t('dataAssetdiscover.tableSelector.tables')}`
                    };
                });
        }
    },
    methods: {
        // 处理treeCheckedData的回显
        async handleTreeCheckedDataEcho() {
            console.log('处理treeCheckedData回显:', this.$props);

            // 检查treeCheckedData是否有值
            if (!this.treeCheckedData || this.treeCheckedData.length === 0) {
                return;
            }

            // 解析数据，按数据库分组
            const dbTableMap = new Map();
            this.treeCheckedData.forEach(item => {
                const [databaseName, tableName] = item.split('-');
                if (!dbTableMap.has(databaseName)) {
                    dbTableMap.set(databaseName, new Set());
                }
                dbTableMap.get(databaseName).add(tableName);
            });

            // 找到需要处理的数据库
            const databasesToProcess = [];
            this.returnArr.forEach(db => {
                if (dbTableMap.has(db.name)) {
                    databasesToProcess.push(db);
                }
            });

            // 批量加载所有需要的表数据
            await Promise.all(databasesToProcess.map(db =>
                this.fetchTableNamesForEcho(db.name)
            ));

            // 记录第一个选中或半选的数据库
            let firstSelectedDatabase = null;

            // 使用Vue的响应式更新方式设置状态
            this.$set(this, 'returnArr', this.returnArr.map(db => {
                const selectedTables = dbTableMap.get(db.name);

                // 如果这个数据库没有需要选中的表，保持原样
                if (!selectedTables || db.children.length === 0) {
                    return db;
                }

                // 创建新的数据库对象，确保响应式更新
                const updatedDb = {
                    ...db,
                    children: db.children.map(table => ({
                        ...table,
                        checked: selectedTables.has(table.tableName)
                    }))
                };

                // 计算选中状态
                const checkedCount = updatedDb.children.filter(t => t.checked).length;
                const totalCount = updatedDb.children.length;

                // 设置正确的选中和半选状态
                updatedDb.checked = checkedCount === totalCount;
                updatedDb.isBanxuan = checkedCount > 0 && checkedCount < totalCount;

                // 记录第一个有选中表的数据库
                if (!firstSelectedDatabase && checkedCount > 0) {
                    firstSelectedDatabase = updatedDb;
                }

                return updatedDb;
            }));

            // 默认展示第一个选中或半选的数据库
            if (firstSelectedDatabase) {
                // 使用Vue的方式更新状态
                this.$set(this, 'returnArr', this.returnArr.map(db => ({
                    ...db,
                    isActive: db.name === firstSelectedDatabase.name
                })));

                // 设置中间列表数据
                this.$set(this, 'checkListChildAll', [...firstSelectedDatabase.children]);
                this.$set(this, 'serchListChildAll', [...firstSelectedDatabase.children]);
                this.updateMiddleListCheckAllStatus();
            }

            // 更新所有相关状态
            this.updateCheckList();
            this.updateCheckAllStatus();
        },

        // 为回显专门的fetchTableNames方法，避免覆盖状态
        async fetchTableNamesForEcho(databaseName) {
            const database = this.returnArr.find(ele => ele.name === databaseName);
            if (!database) return;

            // 只在没有子表数据时才加载
            if (!database.children || database.children.length === 0) {
                // 请求表数据
                this.databaseTableNameP.databaseName = databaseName;
                const res = await getDatabaseTableNameList(this.databaseTableNameP);

                // 创建表数据
                const tables = res.data.map(item => ({
                    databaseName: item.databaseName,
                    tableName: item.tableName,
                    value: item.parentID,
                    checked: false,
                    schemaName: item.schemaName
                }));

                // 使用Vue的方式更新，确保响应式
                const updatedDb = { ...database, children: tables };
                this.$set(this, 'returnArr', this.returnArr.map(db =>
                    db.name === databaseName ? updatedDb : db
                ));
            }
        },
        // 全选复选框事件
        handleCheckAllChange(checked) {
            this.isIndeterminate = false;

            if (checked) {
                // 全选：加载所有表并选中，但不在中间列表展示
                const fetchPromises = this.returnArr.map(item =>
                    this.fetchTableNames(item.name).then(() => {
                        item.checked = true;
                        item.isActive = false;
                        item.children.forEach(table => table.checked = true);
                    })
                );

                Promise.all(fetchPromises).then(() => {
                    // 全选时清空中间列表，不展示任何表
                    this.checkListChildAll = [];
                    this.serchListChildAll = [];
                    this.updateCheckList();
                    this.updateMiddleListCheckAllStatus();
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
                this.updateMiddleListCheckAllStatus();
            }
        },

        // 点击数据库名称 - 只展示表，不勾选，添加高亮
        async handleDatabaseNameClick(item) {
            // 移除所有数据库的高亮状态
            this.returnArr.forEach(db => db.isActive = false);
            // 为当前点击的数据库添加高亮状态
            item.isActive = true;

            // 找到对应的数据库对象
            const database = this.returnArr.find(ele => ele.name === item.name);

            // 检查是否需要加载表数据
            if (database && (!database.children || database.children.length === 0)) {
                // 保存当前的选中状态映射（如果有）
                const checkedTablesMap = new Map();
                if (database.children) {
                    database.children.forEach(table => {
                        if (table.checked) {
                            checkedTablesMap.set(table.tableName, true);
                        }
                    });
                }

                // 加载表数据
                await this.fetchTableNames(item.name);

                // 恢复选中状态
                if (database.children && checkedTablesMap.size > 0) {
                    database.children.forEach(table => {
                        if (checkedTablesMap.has(table.tableName)) {
                            table.checked = true;
                        }
                    });
                }
            }

            // 只展示当前库的表，确保表的选中状态正确保留
            if (database && database.children) {
                // 直接使用children数组，保留其中的checked状态
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
            // 查找对应的数据库对象
            let database;
            if (item.databaseName != item.schemaName) {
                database = this.returnArr.find(ele => ele.name === item.schemaName);
            } else {
                database = this.returnArr.find(ele => ele.name === item.databaseName);
            }
            // 获取该数据库下所有被选中的表
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
            this.updateMiddleListCheckAllStatus();
        },

        // 清空选择
        clearSelection() {
            this.checkAll = false;
            this.isIndeterminate = false;
            this.returnArr.forEach(database => {
                database.checked = false;
                database.isBanxuan = false;
                database.isActive = false;
                database.children.forEach(table => table.checked = false);
            });
            this.checkList = [];
            this.checkListChildAll = [];
            this.serchListChildAll = [];
            this.isMiddleListAllChecked = false;
        },

        // 搜索表名
        inputSearch(val) {
            this.checkListChildAll = this.serchListChildAll.filter(item =>
                item.tableName.includes(val)
            );
            this.updateMiddleListCheckAllStatus();
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

            // 创建新的表数据数组
            const tables = res.data.map(item => ({
                databaseName: item.databaseName,
                tableName: item.tableName,
                value: item.parentID,
                checked: false, // 默认为未选中
                schemaName: item.schemaName
            }));

            if (database) {
                // 存储新的表数据
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
        handleMiddleListCheckAll() {
            if (this.checkListChildAll.length === 0) return;
            const newCheckedState = !this.isMiddleListAllChecked;
            this.checkListChildAll.forEach(item => {
                item.checked = newCheckedState;
                const database = this.returnArr.find(ele => ele.name === item.databaseName);
                if (database) {
                    const checkedChildren = database.children.filter(child => child.checked);
                    const totalChildren = database.children.length;
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
}

.canChoose {
    width: 65%;
    height: 100%;
    margin-right: 20px;
}

.canChoose_main {
    height: calc(100% - 40px);
    display: flex;
}

.canChoose_left {
    height: 100%;
    overflow-y: auto;
    width: 45%;
    border-right: 2px solid #c7c7c7;
    padding: 0 10px;
}

.check-item {
    margin: 5px 0;
}

.check-item-inner {
    display: flex;
    align-items: center;
    padding: 4px 6px;
    border-radius: 4px;
}

.database-name {
    margin-left: 8px;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
}

.database-name-active {
    color: #3b82f6;
    font-weight: 500;
}

.check-item-inner:has(.database-name-active) {
    background-color: #ecf5ff;
}

.database-name:hover {
    color: #3b82f6;
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
    display: flex;
    flex-direction: column;
}

.table-list-container {
    flex: 1;
    border-radius: 4px;
    overflow: hidden;
    min-height: 0;
    position: relative;
}

.table-scroller {
    height: 100%;
    overflow-y: auto;
}

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
}

.dowmChoose {
    width: 35%;
    height: 100%;
}

.dowmChoose .el-card /deep/ .el-card__body {
    max-height: 534px;
    overflow-y: auto;
    padding: 15px;
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

/* 右侧已选列表核心样式优化 */
.selected-stats {
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f5;
    margin-bottom: 15px;
}

.stats-text {
    color: #666;
    font-size: 14px;
    font-weight: 500;
}

.selected-db-container {
    width: 100%;
}

.selected-db-list {
    width: 100%;
}

.selected-db-item {
    background-color: #f9fafb;
    border-radius: 6px;
    padding: 12px 15px;
    margin-bottom: 10px;
    transition: all 0.2s ease;
}

.selected-db-item:hover {
    background-color: #f0f2f5;
}

.db-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.db-name {
    font-weight: 500;
    color: #303133;
    font-size: 14px;
}

.db-status {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
}

.status-full {
    background-color: #ecfdf5;
    color: #059669;
    border: 1px solid #d1fae5;
}

.status-partial {
    background-color: #fff7e6;
    color: #d97706;
    border: 1px solid #fde68a;
}

.partial-tables {
    font-size: 13px;
    color: #666;
    line-height: 1.6;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.table-item {
    white-space: nowrap;
}

.more-tip {
    color: #909399;
    font-size: 12px;
}

/* 空状态优化 */
.selected-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #909399;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 15px;
    color: #dcdfe6;
}

.empty-text {
    font-size: 14px;
}
</style>