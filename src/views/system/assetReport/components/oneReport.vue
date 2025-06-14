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
            <div style="margin-top: 15px;">
                <div class="main_body">
                    <div class="titleBox_echarts">
                        <div class="title">数据增长趋势（最近6个月）</div>
                    </div>
                    <div id="lineGraph" class="leftEchartsBox"></div>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <div class="main_body">
                    <div class="titleBox_echarts">
                        <div class="title">数据库类型统计</div>
                    </div>
                    <div id="SJKEcharts" class="leftEchartsBox"></div>
                </div>
            </div>
        </div>
        <div class="box1 page-break">
            <div class="head">
                <div>分类分级统计</div>
                <div>02</div>
            </div>
            <div>
                <div class="fenleifenji">
                    <div class="main_body_02">
                        <div class="titleBox_echarts">
                            <div class="title">脏数据清洗比例</div>
                        </div>
                        <div id="funnelEcharts" class="leftEchartsBox"></div>
                    </div>
                    <div class="main_body_02">
                        <div class="titleBox_echarts">
                            <div class="title">AI数据填充概况</div>
                        </div>
                        <el-card class="box-card">
                            <div style="height: 80px; font-weight: 600;font-size: 18px;">字段注释覆盖情况</div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div>原生注释缺失占比></div>
                                    <span style="font-weight: 600;">32%</span>
                                </div>
                                <div>
                                    <div>AI填充注释数量></div>
                                    <span style="font-weight: 600;">400个</span>
                                </div>
                            </div>
                        </el-card>
                    </div>
                    <div class="main_body_02">
                        <div class="titleBox_echarts">
                            <div class="title">归类原因</div>
                        </div>
                        <div id="radarEcharts" class="leftEchartsBox"></div>
                    </div>
                    <div class="main_body_02">
                        <div class="titleBox_echarts">
                            <div class="title">置信度占比</div>
                        </div>
                        <div id="confidenceLevel" class="leftEchartsBox"></div>
                    </div>
                </div>
                <div class="main_body">
                    <div class="titleBox_echarts">
                        <div class="title">数据分类分布(可下钻)</div>
                    </div>
                    <el-breadcrumb style="margin-top: 20px;margin-left: 20px;" separator-class="el-icon-arrow-right">
                        <el-breadcrumb-item @click.native="goBack(index)" v-for="(item, index) in breadcrumbList">{{
                            item.name }}</el-breadcrumb-item>
                    </el-breadcrumb>
                    <!-- <el-button type="text" id="back-btn">返回</el-button> -->
                    <div id="dataClassification" class="leftEchartsBoxBig"></div>
                </div>
                <div class="main_body">
                    <div class="titleBox_echarts">
                        <div class="title">数据分级分布</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div id="dataDistribution" class="leftEchartsBox"></div>
                        <div id="sensitiveData" class="leftEchartsBox"></div>
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
            breadcrumbList: [{ name: '首层' }],
            arr: [
                {
                    categories: ['系统运维', '客户', '经营', '业务'],
                    data: [40, 30, 20, 10]
                },
                {
                    categories: ['客户A信息', '客户B信息', '客户C信息'],
                    data: [15, 12, 8]
                },
                {
                    categories: ['电话', '邮箱', '微信'],
                    data: [7, 5, 3]
                },
            ],
            currentLevel: 0
        }
    },
    created() {
    },
    mounted() {
        this.earchsInit()
        this.SJKEchartsEchartsFn()
        this.funnelEchartsFn()
        this.radarEchartsFn()
        this.confidenceLevelEchartsFn()
        this.dataClassificationEchartsFn()
        this.dataDistributionEchartsFn()
        this.sensitiveDataEchartsFn()
    },
    methods: {
        earchsInit() {
            var chartDom = document.getElementById('lineGraph');
            var myChart = echarts.init(chartDom);
            var option;
            option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999'
                        }
                    }
                },
                grid: {
                    right: '50',
                },
                legend: {
                    bottom: '5%',
                    data: ['新增字段数', '数据总量（MB）']
                },
                xAxis: [
                    {
                        type: 'category',
                        data: ['一月', '二月'],
                        axisPointer: {
                            type: 'shadow'
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        min: 0,
                    },
                    {
                        type: 'value',
                        min: 0,
                    }
                ],
                series: [
                    {
                        name: '新增字段数',
                        type: 'bar',
                        tooltip: {
                            valueFormatter: function (value) {
                                return value;
                            }
                        },
                        data: [1, 2, 3, 4, 5]
                    },
                    {
                        name: '数据总量（MB）',
                        type: 'line',
                        yAxisIndex: 1,
                        tooltip: {
                            valueFormatter: function (value) {
                                return value;
                            }
                        },
                        data: [1, 2, 3, 4, 5]
                    }
                ]
            };
            option && myChart.setOption(option);
        },
        SJKEchartsEchartsFn() {
            var chartDom = document.getElementById('SJKEcharts');
            var myChart = echarts.init(chartDom);
            var option;

            option = {
                title: {
                    textStyle: {
                        fontSize: '14'
                    }
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'vertical',
                    bottom: 'bottom'
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['50%', '70%'],
                        width: '100%',
                        data: [{
                            name: 'Excel', value: 100
                        }],
                        label: {
                            alignTo: 'edge',
                            minMargin: 5,
                            edgeDistance: 10,
                            lineHeight: 15,
                            rich: {
                                time: {
                                    fontSize: 10,
                                    color: '#999'
                                }
                            }
                        }
                    }
                ]
            };

            option && myChart.setOption(option);
        },
        funnelEchartsFn() {
            var chartDom = document.getElementById('funnelEcharts');
            var myChart = echarts.init(chartDom);
            var option;
            option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}'
                },
                toolbox: {
                    show: false,
                    feature: {
                        dataView: { readOnly: false },
                        restore: {},
                        saveAsImage: {}
                    }
                },
                series: [
                    {
                        type: 'funnel',
                        left: '10%',
                        top: 60,
                        bottom: 60,
                        width: '60%',
                        min: 0,
                        max: 100,
                        minSize: '0%',
                        maxSize: '100%',
                        sort: 'descending',
                        gap: 2,
                        label: {
                            position: 'right'
                        },
                        labelLine: {
                            length: 30,
                            lineStyle: {
                                width: 1,
                                type: 'solid'
                            }
                        },
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 1
                        },
                        emphasis: {
                            label: {
                                fontSize: 20
                            }
                        },
                        data: [
                            {
                                name: "字段总数100%",
                                value: 100
                            },

                            {
                                name: "样本值为空",
                                value: 80
                            },

                            {
                                name: "样本过于单一",
                                value: 60
                            },

                            {
                                name: "样本重复率过高",
                                value: 40
                            },

                            {
                                name: "有效字段90.27%",
                                value: 20
                            }
                        ]
                    }
                ]
            };
            option && myChart.setOption(option);
        },
        radarEchartsFn() {
            var chartDom = document.getElementById('radarEcharts');
            var myChart = echarts.init(chartDom);
            var option;
            option = {
                legend: {
                },
                toolbox: {
                    show: false,
                },
                radar: {
                    // shape: 'circle',
                    indicator: [
                        { name: '脏数据识别', max: 65 },
                        { name: '表继承', max: 65 },
                        { name: '策略匹配', max: 65 },
                        { name: 'AI推理', max: 65 },
                    ]
                },
                series: [
                    {
                        name: 'Budget vs spending',
                        type: 'radar',
                        data: [
                            {
                                value: [20, 30, 40, 22],
                            }
                        ]
                    }
                ]
            };

            option && myChart.setOption(option);

        },
        confidenceLevelEchartsFn() {
            var chartDom = document.getElementById('confidenceLevel');
            var myChart = echarts.init(chartDom);
            var option;
            option = {
                title: {
                    textStyle: {
                        fontSize: '14'
                    }
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'vertical',
                    bottom: 'bottom'
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['50%', '70%'],
                        width: '100%',
                        data: [
                            {
                                name: '高', value: 100
                            }, {
                                name: '低', value: 80
                            },
                        ],
                        label: {
                            alignTo: 'edge',
                            minMargin: 5,
                            edgeDistance: 10,
                            lineHeight: 15,

                            rich: {
                                time: {
                                    fontSize: 10,
                                    color: '#999'
                                }
                            }
                        }
                    }
                ]
            };

            option && myChart.setOption(option);
        },
        // 渲染图表的通用函数
        renderChart(categories, data) {
            const myChart = echarts.init(document.getElementById('dataClassification'));
            const option = {
                xAxis: { type: 'value' },
                yAxis: {
                    type: 'category',
                    data: categories
                },
                series: [
                    {
                        type: 'bar',
                        data: data,
                        label: { show: true, position: 'right' }, // 显示数值标签

                        itemStyle: {
                            color: '#009dff' // 所有柱子的颜色设置为红色
                        }
                    }
                ]
            };
            myChart.setOption(option);
        },
        goBack(index) {
            debugger
            if (index == this.arr.length || this.currentLevel == index) {
                return
            } else if (index == 0) {
                this.breadcrumbList = [{ name: '首层' }]
            }
            else {
                this.breadcrumbList.splice(index + 1, 1)
            }
            this.currentLevel = index
            this.renderChart(this.arr[index].categories, this.arr[index].data)
        },
        dataClassificationEchartsFn() {
            // 初始化 ECharts 实例
            const myChart = echarts.init(document.getElementById('dataClassification'));
            const backBtn = document.getElementById('');
            // 当前层级标记（1=一级，2=二级，3=三级）
            // 初始渲染一级数据
            this.renderChart(this.arr[0].categories, this.arr[0].data);
            // 图表点击事件：实现下钻
            myChart.on('click', (params) => {
                if (this.currentLevel == this.arr.length - 1) {
                    return
                }
                // 一级 → 二级（客户信息）
                ++this.currentLevel;
                this.breadcrumbList.push(params)
                this.renderChart(this.arr[this.currentLevel].categories, this.arr[this.currentLevel].data);
            });
        },
        dataDistributionEchartsFn() {
            var chartDom = document.getElementById('dataDistribution');
            var myChart = echarts.init(chartDom);
            var option;

            option = {
                legend: {
                    bottom: 'bottom'
                },
                toolbox: {
                    show: false,
                    feature: {
                        mark: { show: true },
                        dataView: { show: true, readOnly: false },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                series: [
                    {
                        name: 'Nightingale Chart',
                        type: 'pie',
                        radius: [10, 50],
                        center: ['50%', '40%'],
                        roseType: 'area',
                        itemStyle: {
                            borderRadius: 8
                        },
                        data: [
                            { name: '一级', value: 19 },
                            { name: '二级', value: 29 },
                            { name: '三级', value: 39 },
                            { name: '四级', value: 49 },
                        ]
                    }
                ]
            };

            option && myChart.setOption(option);
        },

        sensitiveDataEchartsFn() {
            var chartDom = document.getElementById('sensitiveData');
            var myChart = echarts.init(chartDom);
            var option;

            option = {
                title: {
                    textStyle: {
                        fontSize: '14'
                    }
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'vertical',
                    bottom: 'bottom'
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['50%', '70%'],
                        width: '100%',
                        data: this.allData.sensitiveDataProportion,
                        label: {
                            alignTo: 'edge',
                            minMargin: 5,
                            edgeDistance: 10,
                            lineHeight: 15,
                            rich: {
                                time: {
                                    fontSize: 10,
                                    color: '#999'
                                }
                            }
                        }
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

.main_body_02 {
    width: 45%;
}

.title {
    border-left: 8px solid #01a7f0;
    padding-left: 15px;
    height: 20px;
    font-weight: 600;
}


.titleBox_echarts {
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #e7f0f7;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

.body_main {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-top: 10px;

    .main_box {
        width: 23%;
    }

    .main_boxFlex {
        width: 50%;
    }
}


.leftEchartsBox {
    width: 100%;
    height: 215px;
    background-color: #fff;
    margin-bottom: 15px;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
}

.leftEchartsBoxBig {
    width: 100%;
    height: 320px;
    background-color: #fff;
    margin-bottom: 15px;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
}

.fenleifenji {
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.box-card {
    height: 215px;
    padding: 10px 15px;
}

#back-btn {
    display: none;
}
</style>