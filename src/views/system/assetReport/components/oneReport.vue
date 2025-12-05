<template>
    <div v-loading="echarsLoding">
        <div class="box1 page-break">
            <div class="head">
                <div>数据资产概况</div>
                <div>01</div>
            </div>
            <el-table :data="allData.dataAssetStatistics" id="table" class="tableBox" ref="tableRef">
                <el-table-column label="数据源（个）" align="center" prop="datasourceCount" show-overflow-tooltip />
                <el-table-column label="数据库（个）" align="center" prop="databaseCount" show-overflow-tooltip />
                <el-table-column label="数据表（张）" align="center" prop="dataTableCount" show-overflow-tooltip />
                <el-table-column label="字段（个）" align="center" prop="dataFieldCount" show-overflow-tooltip />
                <el-table-column label="数据总量（MB）" align="center" prop="dataMB" show-overflow-tooltip />
            </el-table>
            <div class="ul_box">
                <div style="display: flex; justify-content: space-between;">
                    <div style="margin-right: 20px;">
                        <h4 style="color: #696969;margin: 10px 0;text-align: left;font-weight: 500;">字段数TOP5</h4>
                        <ul>
                            <li v-for="(item, i) in allData.fieldTop" :key="i"
                                :class="{ 'even': i % 2 === 0, 'odd': i % 2 !== 0 }">
                                <span :class="i >= 3 ? 'pentagon' : `pentagon${i + 1}`"> <span>{{ i + 1 }}</span></span>
                                <span class="sort-name-count">
                                    <span> {{ item.sourceName }}</span>
                                    <span style="float: right;"> {{ item.fieldCount }}</span>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div style="margin-right: 20px;">
                        <h4 style="color: #696969;margin: 10px 0;text-align: left;">表数量TOP5</h4>
                        <ul>
                            <li v-for="(item, i) in allData.tableTop" :key="i"
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
                        <h4 style="color: #696969;margin: 10px 0;text-align: left;">数据量TOP5</h4>
                        <ul>
                            <li v-for="(item, i) in allData.dataSizeTop" :key="i"
                                :class="{ 'even': i % 2 === 0, 'odd': i % 2 !== 0 }">
                                <span :class="i >= 3 ? 'pentagon' : `pentagon${i + 1}`"> <span>{{ i + 1 }}</span></span>
                                <span class="sort-name-count">
                                    <span> {{ item.sourceName }}</span>
                                    <span style="float: right;"> {{ item.count }}</span>
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
                    <div id="lineGraph" class="leftEchartsBoxBig"></div>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <div class="main_body">
                    <div class="titleBox_echarts">
                        <div class="title">数据库类型统计</div>
                    </div>
                    <div id="SJKEcharts" class="leftEchartsBoxBig"></div>
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
                            <div class="title">噪音数据过滤比例</div>
                        </div>
                        <div id="funnelEcharts" class="leftEchartsBox"></div>
                    </div>
                    <div class="main_body_02">
                        <div class="titleBox_echarts">
                            <div class="title">AI语义填充概况</div>
                        </div>
                        <el-card class="box-card">
                            <div style="height: 80px; font-weight: 600;font-size: 18px;">字段注释覆盖情况</div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div>原生注释缺失占比></div>
                                    <span style="font-weight: 600;">{{ allData.fieldRemarkCoverage &&
                                        allData.fieldRemarkCoverage.oldAnnotationProportion ?
                                        allData.fieldRemarkCoverage.oldAnnotationProportion : '' }}</span>
                                </div>
                                <div>
                                    <div>AI语义填充数量></div>
                                    <span style="font-weight: 600;">{{ allData.fieldRemarkCoverage &&
                                        allData.fieldRemarkCoverage.AIAnnotationNum ?
                                        allData.fieldRemarkCoverage.AIAnnotationNum : '' }}</span>
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
                        <div class="title">数据分类分布</div>
                    </div>
                    <el-breadcrumb style="margin-top: 20px;margin-left: 20px;" separator-class="el-icon-arrow-right">
                        <el-breadcrumb-item @click.native="goBack(item, index)" class="breadcrumbItem"
                            v-for="(item, index) in breadcrumbList">{{
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
        <div class="box1 page-break">
            <div class="head">
                <div>个人信息统计</div>
                <div>03</div>
            </div>
            <div>
                <el-table :data="allData.personalDataPercent" height="120" :border="false" ref="tableRef">
                    <el-table-column align="center" show-overflow-tooltip prop="personalDataValue"
                        label="个人信息条数"></el-table-column>
                    <el-table-column align="center" show-overflow-tooltip prop="noPersonalDataValue"
                        label="未成年人信息条数"></el-table-column>
                    <el-table-column align="center" show-overflow-tooltip prop="ordinaryPersonalDataValue"
                        label="一般个人信息字段"></el-table-column>
                    <el-table-column align="center" show-overflow-tooltip prop="sensitivePersonalDataValue"
                        label="敏感个人信息字段" />
                </el-table>
                <div class="main_body">
                    <div class="titleBox_echarts">
                        <div class="title">个人信息新增趋势（最近6个月）</div>
                    </div>
                    <div id="lineGraphGEREN" class="leftEchartsBoxBig"></div>
                </div>
                <div class="main_body">
                    <div class="titleBox_echarts">
                        <div class="title">个人信息分布</div>
                    </div>
                    <div id="gerenxinxifenbu" :style="height" class="leftEchartsBoxlang"></div>
                </div>
                <div class="main_body">
                    <div class="titleBox_echarts">
                        <div class="title">个人信息字段占比</div>
                    </div>
                    <div id="gerenxinxiziduan" class="leftEchartsBoxBig"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { listNew } from "@/api/data";
import * as echarts from "echarts";
import "echarts-wordcloud";
export default {
    name: "oneReport",
    props: {
        value: Number
    },
    watch: {
        value: {
            handler(val) {
                // Convert to number before using
                this.getlistNewFn(Number(val))
            },
        },
    },
    //   dicts: ['sys_normal_disable'],
    data() {
        return {
            echarsLoding: false,
            height: '',
            // 查询参数
            queryParams: {
                categoryId: '',
            },
            activeName: 'first',
            allData: {},
            breadcrumbList: [{ name: '首层', id: 0 }],
            currentLevel: 0,
            lineGraphChart: null,
            SJKEchartsChart: null,
            funnelEchartsChart: null,
            radarEchartsChart: null,
            confidenceLevelChart: null,
            dataDistributionChart: null,
            sensitiveDataChart: null,
            lineGraphGERENChart: null,
            gerenxinxifenbuChart: null,
            gerenxinxiziduanChart: null,
            dataClassificationChart: null,
        }
    },
    created() {
    },
    mounted() {
        // let timer = setInterval(() => {
        //     if (this.value) {
        //         this.getlistNewFn()
        //         clearInterval(timer)
        //     }
        // }, 1000)
    },
    methods: {
        init() {
            this.earchsInit()
            this.SJKEchartsEchartsFn()
            this.funnelEchartsFn()
            this.radarEchartsFn()
            this.confidenceLevelEchartsFn()
            this.dataDistributionEchartsFn()
            this.sensitiveDataEchartsFn()
            this.lineGraphGERENInit()
            this.gerenxinxifenbuFn()
            this.gerenxinxiziduanEchartsFn()
            this.dataClassificationEchartsFn()
        },
        dataClassificationEchartsFn() {
            let _this = this
            var chartDom = document.getElementById('dataClassification');
            this.dataClassificationChart = echarts.init(chartDom);
            var option;
            let nameList = this.allData.dataClassDistribution.map(item => item.name)
            option = {
                xAxis: {},
                yAxis: {
                    data: nameList
                },
                dataGroupId: '',
                animationDurationUpdate: 500,
                series: {
                    type: 'bar',
                    id: 'sales',
                    data: this.allData.dataClassDistribution,
                }
            };
            _this.dataClassificationChart.on('click', function (event) {
                if (event.data) {
                    var subData = event.data.child;
                    if (!event.data.child) {
                        return;
                    } else {
                        _this.breadcrumbList.push(event.data)
                    }
                    _this.dataClassificationChart.setOption({
                        yAxis: {
                            data: subData.map(function (item) {
                                return item.name;
                            })
                        },
                        series: {
                            type: 'bar',
                            id: 'sales',
                            dataGroupId: subData.dataGroupId,
                            data: subData.map(function (item) {
                                return item;
                            }),
                            universalTransition: {
                                enabled: true,
                                divideShape: 'clone'
                            }
                        }
                    });
                }
            });
            option && _this.dataClassificationChart.setOption(option);
        },
        getlistNewFn() {
            // 销毁
            this.destroyCharts()
            this.echarsLoding = true
            listNew({ categoryId: this.value }).then(res => {
                this.allData = res.data
                if (this.allData.personalDataDistribution && this.allData.personalDataDistribution.databaseProxyNames && this.allData.personalDataDistribution.databaseProxyNames.length) {
                    // 基本高度200
                    let height = this.allData.personalDataDistribution.databaseProxyNames.length * 50 + 200
                    // height:300px
                    this.height = `height:${height}px`
                }
                setTimeout(() => {
                    this.init()
                    this.echarsLoding = false
                }, 1000);
            })
        },
        earchsInit() {
            var chartDom = document.getElementById('lineGraph');
            this.lineGraphChart = echarts.init(chartDom);
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
                        data: this.allData.dataGrowthTrend.monthNames,
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
                        data: this.allData.dataGrowthTrend.dataNum
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
                        data: this.allData.dataGrowthTrend.dataSize
                    }
                ]
            };
            option && this.lineGraphChart.setOption(option);
        },
        SJKEchartsEchartsFn() {
            var chartDom = document.getElementById('SJKEcharts');
            this.SJKEchartsChart = echarts.init(chartDom);
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
                grid: {
                    bottom: '510',
                },
                legend: {
                    bottom: 0,
                    left: 'center',
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['50%', '70%'],
                        width: '100%',
                        data: this.allData.dataTypeTop,
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

            option && this.SJKEchartsChart.setOption(option);
        },
        funnelEchartsFn() {
            var chartDom = document.getElementById('funnelEcharts');
            this.funnelEchartsChart = echarts.init(chartDom);
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
                        data: this.allData.dirtyDataPercent
                    }
                ]
            };
            option && this.funnelEchartsChart.setOption(option);
        },
        radarEchartsFn() {
            var chartDom = document.getElementById('radarEcharts');
            this.radarEchartsChart = echarts.init(chartDom);
            var option;
            option = {
                toolbox: {
                    show: false,
                },
                radar: {
                    // shape: 'circle',
                    indicator: this.allData.classifyReasonPercent.indicator
                },
                series: [
                    {
                        type: 'radar',
                        data: [
                          {  value: this.allData.classifyReasonPercent.total}
                        ]
                    }
                ]
            };

            option && this.radarEchartsChart.setOption(option);

        },
        confidenceLevelEchartsFn() {
            var chartDom = document.getElementById('confidenceLevel');
            this.confidenceLevelChart = echarts.init(chartDom);
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
                        data: this.allData.confidenceLevelPercent,
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

            option && this.confidenceLevelChart.setOption(option);
        },
        // 渲染图表的通用函数
        renderChart(params) {
            // const myChart = echarts.init(document.getElementById('dataClassification'));
            const option = {
                xAxis: { type: 'value' },
                yAxis: {
                    type: 'category',
                    data: params.child.map(item => item.name)
                },
                series: [
                    {
                        type: 'bar',
                        data: params.child.map(item => item),
                        label: { show: true, position: 'right' }, // 显示数值标签

                        itemStyle: {
                        }
                    }
                ]
            };
            this.dataClassificationChart.setOption(option);
        },
        findNodeWithId(nodes, id) {
            // 遍历当前节点数组
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                // 检查当前节点的id是否为目标id
                if (node.id === id) {
                    return node;
                }
                // 如果当前节点有子节点，递归遍历子节点
                if (node.child && node.child.length > 0) {
                    const result = this.findNodeWithId(node.child, id);
                    if (result) { // 如果在子树中找到目标节点，返回结果
                        return result;
                    }
                }
            }

            // 如果当前节点数组中没有找到目标节点，返回null
            return null;
        },
        goBack(item, index) {
            if (item.id == 0) {
                this.breadcrumbList = [{ name: '首层', id: 0 }]
                let params = { child: this.allData.dataClassDistribution }
                this.renderChart(params)
            } else if (!item.child) {
                return
            }
            else {
                this.breadcrumbList.splice(index + 1, 1)
                let params = this.findNodeWithId(this.allData.dataClassDistribution, item.id)
                this.renderChart(params)
            }
        },
        dataDistributionEchartsFn() {
            var chartDom = document.getElementById('dataDistribution');
            this.dataDistributionChart = echarts.init(chartDom);
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
                        data: this.allData.dataLevelDistribution
                    }
                ]
            };

            option && this.dataDistributionChart.setOption(option);
        },
        sensitiveDataEchartsFn() {
            var chartDom = document.getElementById('sensitiveData');
            this.sensitiveDataChart = echarts.init(chartDom);
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
                        data: this.allData.sensitiveDataPercent,
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

            option && this.sensitiveDataChart.setOption(option);
        },
        lineGraphGERENInit() {
            var chartDom = document.getElementById('lineGraphGEREN');
            this.lineGraphGERENChart = echarts.init(chartDom);
            var option;

            option = {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999'
                        }
                    }
                },
                toolbox: {
                    show: false,
                    feature: {
                        dataView: { show: true, readOnly: false },
                        magicType: { show: true, type: ['line', 'bar'] },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                legend: {
                    bottom: 'bottom',
                    data: this.allData.personalDataDistributionNewTrends.namelist
                },
                xAxis: [
                    {
                        type: 'category',
                        data: this.allData.personalDataDistributionNewTrends.monthNames,
                        axisPointer: {
                            type: 'shadow'
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: '',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    },
                    {
                        type: 'value',
                        name: '',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    },
                    {
                        type: 'value',
                        name: '',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }
                ],
                series: [
                    {
                        name: this.allData.personalDataDistributionNewTrends.namelist[0],
                        type: 'bar',
                        tooltip: {
                            valueFormatter: function (value) {
                                return value;
                            }
                        },
                        data: this.allData.personalDataDistributionNewTrends.opdCountList
                    },
                    {
                        name: this.allData.personalDataDistributionNewTrends.namelist[1],
                        type: 'bar',
                        tooltip: {
                            valueFormatter: function (value) {
                                return value;
                            }
                        },
                        data: this.allData.personalDataDistributionNewTrends.spdCountList
                    },
                    {
                        name: this.allData.personalDataDistributionNewTrends.namelist[2],
                        type: 'line',
                        yAxisIndex: 1,
                        tooltip: {
                            valueFormatter: function (value) {
                                return value;
                            }
                        },
                        data: this.allData.personalDataDistributionNewTrends.piiDetectionCountList
                    },
                    {
                        name: this.allData.personalDataDistributionNewTrends.namelist[3],
                        type: 'line',
                        yAxisIndex: 1,
                        tooltip: {
                            valueFormatter: function (value) {
                                return value;
                            }
                        },
                        data: this.allData.personalDataDistributionNewTrends.nonageCountList
                    }
                ]
            };

            option && this.lineGraphGERENChart.setOption(option);
        },
        gerenxinxifenbuFn() {
            var chartDom = document.getElementById('gerenxinxifenbu');
            this.gerenxinxifenbuChart = echarts.init(chartDom);
            var option;
            const seriesLabel = {
                show: true
            };
            option = {
                title: {
                    text: ''
                },
                tooltip: {
                    show: false,
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: this.allData.personalDataDistribution.namelist,
                    bottom: 'bottom'
                },
                grid: {
                    left: 200
                },
                toolbox: {
                    show: false,
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'value',
                    name: '',
                    axisLabel: {
                        formatter: '{value}'
                    }
                },
                yAxis: {
                    type: 'category',
                    inverse: true,
                    data: this.allData.personalDataDistribution.databaseProxyNames,
                    axisLabel: {
                        formatter: function (value) {
                            return value;
                        },
                        margin: 20,
                    }
                },
                series: [
                    {
                        name: this.allData.personalDataDistribution.namelist[0],
                        type: 'bar',
                        data: this.allData.personalDataDistribution.ordinaryPersonalData,
                        label: seriesLabel,
                    },
                    {
                        name: this.allData.personalDataDistribution.namelist[1],
                        type: 'bar',
                        label: seriesLabel,
                        data: this.allData.personalDataDistribution.sensitivePersonalData
                    },
                    {
                        name: this.allData.personalDataDistribution.namelist[2],
                        type: 'bar',
                        label: seriesLabel,
                        data: this.allData.personalDataDistribution.piiPersonalData
                    },
                    {
                        name: this.allData.personalDataDistribution.namelist[3],
                        type: 'bar',
                        label: seriesLabel,
                        data: this.allData.personalDataDistribution.nonageCountList
                    }
                ]
            };

            option && this.gerenxinxifenbuChart.setOption(option);
        },
        gerenxinxiziduanEchartsFn() {
            var chartDom = document.getElementById('gerenxinxiziduan');
            this.gerenxinxiziduanChart = echarts.init(chartDom);
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
                        data: this.allData.personalDataFieldPercent,
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

            option && this.gerenxinxiziduanChart.setOption(option);
        },
        destroyCharts() {
            if (this.lineGraphChart) {
                this.lineGraphChart.dispose()
            }
            if (this.SJKEchartsChart) {
                this.SJKEchartsChart.dispose()
            }
            if (this.funnelEchartsChart) {
                this.funnelEchartsChart.dispose()
            }
            if (this.radarEchartsChart) {
                this.radarEchartsChart.dispose()
            }
            if (this.confidenceLevelChart) {
                this.confidenceLevelChart.dispose()
            }
            if (this.dataDistributionChart) {
                this.dataDistributionChart.dispose()
            }
            if (this.sensitiveDataChart) {
                this.sensitiveDataChart.dispose()
            }
            if (this.lineGraphGERENChart) {
                this.lineGraphGERENChart.dispose()
            }
            if (this.gerenxinxifenbuChart) {
                this.gerenxinxifenbuChart.dispose()
            }
            if (this.gerenxinxiziduanChart) {
                this.gerenxinxiziduanChart.dispose()
            }
            if (this.dataClassificationChart) {
                this.dataClassificationChart.dispose()
            }
        }
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
        font-size: 26px;
        color: #01a7f0;
        align-items: center;
        border-bottom: 3px solid #01a7f0;
        padding: 10px 0;
    }

    td {
        color: #01a7f0;
        font-weight: 600;
        font-size: 18px;
    }

    .ul_box {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
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
    font-weight: 700;
    width: 100%;
    text-align: left;
    line-height: 20px;
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
    text-align: left;
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

.leftEchartsBoxlang {
    width: 100%;
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

.breadcrumbItem:hover {
    cursor: pointer;
}
</style>