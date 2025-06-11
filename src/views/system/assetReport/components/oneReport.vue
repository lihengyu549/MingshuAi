<template>
    <div>
        <div class="box1 page-break">
            <div class="head">
                <div>数据资产概况</div>
                <div>01</div>
            </div>
            <el-table :data="tableData" id="table" class="tableBox" ref="tableRef">
                <el-table-column label="数据源（个）" align="center" prop="datasourceCount" show-overflow-tooltip />
                <el-table-column label="数据库（个）" align="center" prop="databaseCount" show-overflow-tooltip />
                <el-table-column label="数据表（张）" align="center" prop="dataTableCount" show-overflow-tooltip />
                <el-table-column label="字段（个）" align="center" prop="dataFieldCount" show-overflow-tooltip />
                <el-table-column label="数据总量（MB）" align="center" prop="dataFieldCount" show-overflow-tooltip />
            </el-table>

            <div class="ul_box">
                <div style="display: flex; justify-content: space-between;">
                    <div style="margin-right: 20px;">
                        <h4 style="color: #696969;margin: 10px 0;">字段数TOP5</h4>
                        <ul>
                            <li v-for="(item, i) in datasourceTop" :key="i"
                                :class="{ 'even': i % 2 === 0, 'odd': i % 2 !== 0 }">
                                <span :class="i >= 3 ? 'pentagon' : `pentagon${i + 1}`"> <span>{{ i + 1 }}</span></span>
                                <span class="sort-name-count">
                                    <span> {{ item.source_name }}</span>
                                    <span style="float: right;"> {{ item.item_count }}</span>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div style="margin-right: 20px;">
                        <h4 style="color: #696969;margin: 10px 0;">表数量TOP5</h4>
                        <ul>
                            <li v-for="(item, i) in tableTop" :key="i"
                                :class="{ 'even': i % 2 === 0, 'odd': i % 2 !== 0 }">
                                <span :class="i >= 3 ? 'pentagon' : `pentagon${i + 1}`"> <span>{{ i + 1 }}</span></span>
                                <span class="sort-name-count">
                                    <span> {{ item.sourceName }}</span>
                                    <span style="float: right;"> {{ item.tableCount }}</span>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="color: #696969;margin: 10px 0;">数据量TOP5</h4>
                        <ul>
                            <li v-for="(item, i) in fieldTop" :key="i"
                                :class="{ 'even': i % 2 === 0, 'odd': i % 2 !== 0 }">
                                <span :class="i >= 3 ? 'pentagon' : `pentagon${i + 1}`"> <span>{{ i + 1 }}</span></span>
                                <span class="sort-name-count">
                                    <span> {{ item.sourceName }}</span>
                                    <span style="float: right;"> {{ item.fieldCount }}</span>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getFrameworks, dashboardList } from "@/api/system/protectCategory";
import * as echarts from "echarts";
import "echarts-wordcloud";
export default {
    name: "oneReport",
    //   dicts: ['sys_normal_disable'],
    data() {
        return {
            echarsLoding: false,
            // 查询参数
            queryParams: {
                categoryId: '',
            },
            activeName: 'first',
            allData: {},
            treeOptions: [],
            tableData: [{ id: 1, datasourceCount: 1, databaseCount: 1, dataTableCount: 1, dataFieldCount: 1, dataCount: 1 }],
            datasourceTop: [{ id: 1, source_name: '1', item_count: 1 }],
            tableTop: [{ id: 1, sourceName: '1', tableCount: 1 }],
            fieldTop: [{ id: 1, sourceName: '1', fieldCount: 1 }],
        }
    },
    created() {
    },
    mounted() {
        // this.earchsInit()
    },
    methods: {
        earchsInit() {
            var chartDom = document.getElementById('main');
            var myChart = echarts.init(chartDom);
            var option;
            const categories = (function () {
                let now = new Date();
                let res = [];
                return [];
            })();
            const categories2 = (function () {
                let res = [];
                return [];
            })();
            const data = (function () {
                let res = [];
                return res;
            })();
            const data2 = (function () {
                let res = [];
                return res;
            })();
            option = {
                title: {
                    text: 'Dynamic Data'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#283b56'
                        }
                    }
                },
                legend: {},
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { readOnly: false },
                        restore: {},
                        saveAsImage: {}
                    }
                },
                dataZoom: {
                    show: false,
                    start: 0,
                    end: 100
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: true,
                        data: categories
                    },
                    {
                        type: 'category',
                        boundaryGap: true,
                        data: categories2
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        scale: true,
                        name: 'Price',
                        max: 30,
                        min: 0,
                        boundaryGap: [0.2, 0.2]
                    },
                    {
                        type: 'value',
                        scale: true,
                        name: 'Order',
                        max: 1200,
                        min: 0,
                        boundaryGap: [0.2, 0.2]
                    }
                ],
                series: [
                    {
                        name: 'Dynamic Bar',
                        type: 'bar',
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: data
                    },
                    {
                        name: 'Dynamic Line',
                        type: 'line',
                        data: data2
                    }
                ]
            };
            option && myChart.setOption(option);
        },
    }
};
</script>
<style scoped lang="scss">
.box1 {
    width: 100%;
    padding: 0 15px;

    .head {
        display: flex;
        justify-content: space-between;
        font-size: 20px;
        color: #3871ff;
        align-items: center;
        font-weight: 600;
        border-bottom: 1px solid #3871ff;
        padding: 10px 0;
    }

    td {
        color: #3871ff;
        font-weight: 600;
        font-size: 18px;
    }

    .ul_box {
        display: flex;
        justify-content: space-between;
    }

    .ul_box div {
        flex: 1;
        margin-right: 20px;
    }

    .ul_box div:last-child {
        margin-right: 0;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    ul li {
        padding: 8px;
        border-bottom: 1px solid #ddd;
    }

    ul li.even {
        background-color: #f2f4f8;
    }

    ul li.odd {
        background-color: #ffffff;
    }
}

.pentagon1 {
    display: inline-block;
    color: #fff;
    width: 25px;
    height: 25px;
    background: #1890ff;
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    transition: all 0.3s ease;
    line-height: 25px;
    text-align: center;
}

.pentagon2 {
    display: inline-block;
    color: #fff;
    width: 25px;
    height: 25px;
    background: #07aac8;
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    transition: all 0.3s ease;
    line-height: 25px;
    text-align: center;

    span {
        color: #fff;
        font-size: 16px;
        /* 如果文字会旋转,可以添加以下样式保持文字方向 */
        transform: rotate(0deg);
    }
}

.pentagon3 {
    display: inline-block;
    color: #fff;
    width: 25px;
    height: 25px;
    background: #9640ff;
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    transition: all 0.3s ease;
    line-height: 25px;
    text-align: center;

    span {
        color: #fff;
        font-size: 16px;
        /* 如果文字会旋转,可以添加以下样式保持文字方向 */
        transform: rotate(0deg);
    }
}

.pentagon {
    display: inline-block;
    color: #fff;
    width: 25px;
    height: 25px;
    background: #a6b2d4;
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    transition: all 0.3s ease;
    line-height: 25px;
    text-align: center;

    span {
        color: #fff;
        font-size: 16px;
        /* 如果文字会旋转,可以添加以下样式保持文字方向 */
        transform: rotate(0deg);
    }
}
</style>