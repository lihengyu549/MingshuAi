<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import  * as echarts from "echarts"
require("echarts/theme/macarons");
import { debounce } from "@/utils";

export default {
  props: {
    className: {
      type: String,
      default: "chart",
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "700px",
    },
    chartData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val);
      },
    },
  },
  mounted() {
    this.initChart();
    //是否需要自适应-加了防抖函数
    this.__resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize();
      }
    }, 100);
    window.addEventListener("resize", this.__resizeHandler);

    // 监听侧边栏的变化以实现自适应缩放
    const sidebarElm = document.getElementsByClassName("sidebar-container")[0];
    sidebarElm.addEventListener("transitionend", this.sidebarResizeHandler);
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    window.removeEventListener("resize", this.__resizeHandler);
    this.chart.dispose();
    this.chart = null;

    const sidebarElm = document.getElementsByClassName("sidebar-container")[0];
    sidebarElm.removeEventListener("transitionend", this.sidebarResizeHandler);
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, "macarons");
      this.setOptions(this.chartData);

      const nodes = this.chart._chartsViews[0]._data._graphicEls;
      let allNode = 0;
      for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        if (node === undefined) {
          continue;
        }
        allNode++;
      }

      const height = window.innerHeight;
      const width = window.innerWidth - 1000;
      const currentHeight = 85 * allNode;
      const currentWidth = 20 * allNode;
      const newHeight = Math.max(currentHeight, height);
      const newWidth = Math.max(currentWidth, width);
      const tree_ele = this.$el;
      // tree_ele.style.height = newHeight + 'px'; //设置高度自适应
      // tree_ele.style.width = newWidth + "px";
      //设置宽度自适应
      this.chart.resize();

      this.chart.on("click", this.chartData.clickCallback);
      //节点点击事件
    },
    setOptions(data) {
      this.chart.setOption({
        // series: [
        //  {
        //   name: "顿饭VN阿",
        //   type: "tree",
        //   orient: "LR", //竖向或水平  TB代表竖向 LR代表水平
        //   top: '10%',
        //   initialTreeDepth: 10, //树图初始展开的层级（深度）
        //   expandAndCollapse: true,  //点击节点时不收起子节点，default: true
        //   symbolSize: [135, 65],
        //   itemStyle: {
        //    color: 'transparent',
        //    borderWidth: 0,
        //   },
        //   lineStyle: {
        //    color: '#D5D5D5',
        //    width: 1,
        //    curveness: 1,
        //   },
        //   data: [data]
        //  }
        // ]

        series: [
          {
            type: "tree",
            data: [data],
            top: "5%",
            left: "30%",
            bottom: "2%",
            right: "10%",
            symbolSize: 7,
            // symbol: 'circle',
            symbol: "emptyCircle", // 空心
            // symbol: "circle",// 实心

            label: {
              position: "top",
              verticalAlign: "middle",
              align: "right",
              fontSize: 15,
              color: "#000", //文字颜色
            },
            zoom: 1, //当前视角的缩放比例
            roam: true, //是否开启平游或缩放
            scaleLimit: {
              //滚轮缩放的极限控制
              min: 0.5,
              max: 5,
            },

            itemStyle: {
              color: "pink",
              normal: {
                lineStyle: {
                  color: "#e5e5e5", //线的颜色
                },
              },
            },
            leaves: {
              label: {
                position: "right",
                verticalAlign: "middle",
                align: "left",
              },
            },
            itemStyle: {
              //每个节点得颜色
              borderColor: "#6e40aa",
            },
            emphasis: {
              focus: "descendant",
            },
            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750,
          },
        ],
      });
    },
    sidebarResizeHandler(e) {
      if (e.propertyName === "width") {
        this.__resizeHandler();
      }
    },
  },
};
</script>
