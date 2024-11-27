<template>
  <div class='content'>
    <div style="color: #ccc;float: right;padding-right: 10px;padding-top: 50px; z-index: 999; "><span
        style="font-size: 14px;">当前深度：</span><el-select size="mini" v-model="levelSelect" @change="levelChange">
        <el-option v-for="item in levelList" :key="item" :value="item">
        </el-option>
      </el-select></div>
    <div style="height:calc(100vh - 10px);">
      <RelationGraph ref="seeksRelationGraph" :options="graphOptions" :on-node-click="onNodeClick"
        :on-line-click="onLineClick" />
    </div>
  </div>
</template>

<script>
import RelationGraph from 'relation-graph'
import { getServicesTopologyI } from "@/api/system/monitor";
export default {
  name: 'my-topology',
  components: { RelationGraph },
  data () {
    return {
      // 当前tab页名称
      name: 'topology',
      currViewC: '',
      serverId: '',
      levelSelect: 1,
      levelList: [1, 2, 3, 4, 5],
      isShowCodePanel: false,
      graphOptions: {
        defaultNodeColor: 'rgba(238, 178, 94, 1)',
        defaultNodeShape: 0,
        allowSwitchLineShape: true,
        allowSwitchJunctionPoint: true,
        defaultNodeBorderWidth: 0,
        defaultLineShape: 1,
        defaultJunctionPoint: 'border',
        // 子组件跟随父组件移动
        "isMoveByParentNode": false,
        "allowShowMiniToolBar": false,
        // 这里可以参考"Graph 图谱"中的参数进行设置
        'layouts': [
          {
            "label": "中心",
            // "layoutName": "force",
            "layoutClassName": "seeks-layout-center",
            "defaultExpandHolderPosition": "hide",
            "defaultJunctionPoint": "border",
            distance_coefficient: 0.7,
            // 固定中性布局
            "layoutName": "center",
            "layoutClassName": "seeks-layout-center",
            // "distance_coefficient": 5
          }
        ],
        // 箭头样式
        "defaultLineMarker": {
          "markerWidth": 10,
          "markerHeight": 10,
          "refX": 6,
          "refY": 6,
          "data": "M2,2 L10,6 L2,10 L6,6 L2,2"
        },
      }
    };
  },
  props: {
    timeHorizonC: {
      type: Array,
      default () {
        return [];
      },
    },
    currentServerC: {
      type: String,
      default () {
        return "";
      },
    },
    currentServerIdC: {
      type: String,
      default () {
        return "";
      },
    },
    // 当前tab的视图名称
    currView: {
      type: String,
      default () {
        return "";
      },
    },
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {
    currView: {
      handler (newVal, oldVal) {
        this.currViewC = newVal
        if (this.name == this.currViewC) {
          this.showSeeksGraph();
        }
      }
    },
    timeHorizonC () {
      if (this.name == this.currViewC) {
        this.showSeeksGraph();
      }
    },
    currentServerIdC: {
      handler (newVal, oldVal) {
        this.serverId = newVal;
        if (this.name == this.currViewC) {
          this.showSeeksGraph();
        }
      }
    },
  },
  //方法集合
  methods: {
    showSeeksGraph (query) {
      // var __graph_json_data = {
      //   rootId: 'a',
      //   nodes: [
      //     {
      //       id: 'a', text: 'A', borderColor: 'yellow',
      //       'innerHTML': '<div><div style="padding-top: 35%;">侯亮平</div><div style="margin-top: 50%;font-size: 19px;">侯亮平2</div></div>'
      //     },
      //     { id: 'b', text: 'B', color: '#43a2f1', fontColor: 'yellow' },
      //     { id: 'c', text: 'C', nodeShape: 1, width: 80, height: 60 },
      //     { id: 'e', text: 'E', nodeShape: 0, width: 150, height: 150 }
      //   ],
      //   links: [
      //     { from: 'a', to: 'b', text: '关系1', color: '#43a2f1' },
      //     { from: 'a', to: 'c', text: '关系2' },
      //     { from: 'a', to: 'e', text: '关系3' },
      //     { from: 'b', to: 'e', color: '#67C23A' }
      //   ]
      // }
      // this.$refs.seeksRelationGraph.setJsonData(__graph_json_data, (seeksRGGraph) => {
      //   // Called when the relation-graph is completed 
      // })
      let data = {
        serverId: this.serverId,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
        level: this.levelSelect,
      };
      getServicesTopologyI(data).then(resp => {
        // 以上数据中的node和link可以参考"Node节点"和"Link关系"中的参数进行配置 
        if (!resp.data.hasOwnProperty('rootId')) {
          resp.data.rootId = "root"
          resp.data.nodes = [{
            id: '', color: "rgba(70, 166, 255, 1)",
          },]
          resp.data.links = []
        }
        // if (resp.data) {
        for (let item of resp.data.nodes) {
          item.innerHTML = "<div style=\"\"><div style=\"background-repeat: no-repeat;background-size:70% 60%;height:80px;width:80px;border-radius: 50%;background-image: url('" + require('@/assets/images/technologies/' + item.type.toUpperCase() + ".png") + "');background-position: top center;padding-top: 60%;font-size: 12px; color:#bcbcbc;\">" + item.type + "</div><div style=\"margin-top: 15%;font-size: 15px;\">" + item.text + "</div></div>"
        }
        // }

        this.$refs.seeksRelationGraph.setJsonData(resp.data, (seeksRGGraph) => {
          // Called when the relation-graph is completed 
        })
      })
    },
    onNodeClick (nodeObject, $event) {
    },
    onLineClick (lineObject, $event) {
    },
    levelChange (value) {
      this.levelSelect = value
      this.showSeeksGraph()
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created () {
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted () {
    this.currViewC = this.currView
    this.serverId = this.currentServerIdC
    if (this.name == this.currViewC) {
      this.showSeeksGraph();
    }
  },
  beforeCreate () { }, //生命周期 - 创建之前
  beforeMount () { }, //生命周期 - 挂载之前
  beforeUpdate () { }, //生命周期 - 更新之前
  updated () { }, //生命周期 - 更新之后
  beforeDestroy () { }, //生命周期 - 销毁之前
  destroyed () { }, //生命周期 - 销毁完成
  activated () { }, //如果页面有keep-alive缓存功能，这个函数会触发
}
</script>
<style scoped>
/* @import url(); 引入公共css类 */


.content {
  /* height: 2000px; */
  background-color: #fff;
}

/* 修改拓扑图背景颜色 */
.content /deep/ .rel-map[data-v-2964abc9] {
  background-color: transparent;
  /* margin-top: -1000.996px !important; */
  /* transform: scale(0.8, 0.8) !important; */
  /*  margin-left: 0px !important;
  margin-left: -353.61px !important;
  background-color: transparent !important;
  transform: scale(0.45, 0.45) !important; */
}

.c-my-node {
  background-position: center center;
  background-size: 100%;
  border: #1eff00 solid 2px;
  height: 80px;
  width: 80px;
  border-radius: 40px;
}

.c-node-name {
  width: 160px;
  color: #1eff00;
  margin-left: -40px;
  text-align: center;
  margin-top: 85px;
}

.content /deep/ .c-rg-link-text {
  fill: rgb(161, 161, 161) !important;
  font-size: 14px;
  /* color: #ededed !important; */
}

.content /deep/ .rel-node-checked {
  box-shadow: 0px 0px 10px rgb(102, 96, 96) !important;
}

.content /deep/ .rel-node {
  background-color: rgb(0, 0, 0) !important;
}
</style>
