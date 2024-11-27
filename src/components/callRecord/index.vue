<template>
  <div class="content">
    <div class="tab-layout">
      <div class="trace" v-loading="screenLoading">
        <div class="trace-t">
          <div>
            <el-table :data="tracesList">
              <el-table-column prop="apiStartTime" label="调用时间"></el-table-column>
              <el-table-column prop="apiPath" label="接口名称"></el-table-column>
              <el-table-column prop="httpMethod" label="请求方法"></el-table-column>
              <el-table-column prop="apiDuration" label="耗时">
                <template slot-scope="scope">
                  <div>{{ scope.row.apiDuration }}ms</div>
                </template>
              </el-table-column>
              <el-table-column prop="" label="操作">
                <template slot-scope="scope">
                  <a style="color: #409eff;" @click="TracesClk(scope.row)">详情</a>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <pagination class="totalTion" v-show="totalCount > 0" :total="totalCount" :page.sync="curNum"
            :limit.sync="queryParams.pageSize" :page-size="20" @pagination="handleCurrentChange"
            @current-change="handleCurrentChange">
          </pagination>
        </div>
      </div>
      <el-dialog class="log" title="详情" :visible.sync="detailsVisible" width="100%" :modal="false"
        v-loading="fullscreenLoading">
        <div>
          <div class="tilDiv">
            <div style="width: 50%; ">
              <span>调用时间: </span>
              <span> {{ apiStartTime }} </span>
            </div>
            <div style="width: 50%">
              <span>接口名称: </span>
              <span>{{ apiPath }}</span>
            </div>
          </div>
          <div class="tilDiv">
            <div style="width: 50%">
              <span>请求方法: </span>
              <span>{{ httpMethod }}</span>
            </div>
            <div style="width: 50%">
              <span>耗时: </span>
              <span>{{ apiDuration }}ms</span>
            </div>
          </div>
        </div>
        <el-table :data="tracesForm">
          <el-table-column label="调用栈">
            <template slot-scope="scope">
              {{ scope.row.endpointName }}
            </template>
          </el-table-column>
          <el-table-column label="组件">
            <template slot-scope="scope">
              {{ scope.row.layer }} -{{ scope.row.component }}
            </template>
          </el-table-column>
          <el-table-column label="扩展信息" style="height: 20px;">
            <template slot-scope="scope" v-if="(scope.row && scope.row.tags && scope.row.tags.length > 0)">
              <el-popover placement="top-start" width="400" trigger="hover">
                <a class="coy" @click="copyClick(scope.row.tags)">一键复制</a>
                <div class="tabDiv">
                  <div v-for="(item, index) in scope.row.tags" :key="index">
                    {{ item.key }}:{{ item.value }}
                  </div>
                </div>
                <div slot="reference">
                  <div class="tabDiv1">
                    <div v-for="(item, index) in scope.row.tags" :key="index">
                      {{ item.key }}:{{ item.value }}
                    </div>
                  </div>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="时间轴 (ms)">
            <template slot-scope="scope">
              <el-progress class="proDiv" :text-inside="true" :show-text="true"
                :percentage="(scope.row.endTime - scope.row.startTime)" :format="format"
                color="rgb(184, 233, 134)"></el-progress>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<script>
// import VueClipBoard from 'vue-clipboard2'
import treeStructure from "./treeStructure.vue";
import { getApiRecordListI, queryTraceI } from "@/api/system/monitor";
let id = 0;
export default {
  name: "my-callRecord",
  props: {
    // selectRow: {
    //   type: Object,
    //   default() {
    //     return {};
    //   },
    // }
  },
  watch: {
    // selectRow: {
    //   handler(newVal, oldVal) {
    //     console.log(newVal);
    //     this.selectRow = newVal;
    //     // if (this.name == this.currViewC) {
    //       // this.loadAllData();
    //     // }
    //   },
    //   // deep: true
    // },
  },
  //import引入的组件需要注入到对象中才能使用
  components: {
    treeStructure,
  },
  data () {
    return {
      content: '',
      apiDuration: '',
      httpMethod: '',
      apiPath: '',
      apiStartTime: '',
      detailsVisible: false,
      queryParams: {
        pageNum: 1,
        pageSize: 20,
      },
      styObj: "",
      treeObj: "",
      tabObj: "",
      statObj: "",
      obj: {
        backgroundColor: "#409EFF",
      },
      obj1: {
        backgroundColor: "#409EFF",
      },
      obj2: {
        backgroundColor: "#b2b2b2",
      },
      screenLoading: false,
      fullscreenLoading: false,
      activities: [],
      traList: false,
      serveCode: "",

      reveal: true,
      succeed: "",
      curTrance: [],
      dialogVisible: false,
      // viewLog:true,
      treeData: {
        // name: "",

        // children: [
        //   {
        name: "",

        children: [
          // { name: "IScaleMap" },
          // { name: "LinearScale" },
          // { name: "LogScale" },
        ],
        //   },
        // ],
      },

      endpointSlaPer: 100,
      means: "",
      tracesForm: [],
      tracesStat: [],
      span: "",
      input: "",
      tiemInput: "",
      traceInput: "",
      timeDuration: "",
      initialPoint: "",
      tracesValue: "",
      totalCount: 20,
      endpoint: "",
      tracesList: [],
      detailList: [],
      maxPageNum: 1,
      curNum: 1,
      serveVal: "",
      signValue: "",
      signProps: {
        lazy: true,
        lazyLoad: this.lazyLoad,
      },
      EndpointsValue: "",
      InstancesValue: "",
      name: "callRecord",
      statistics: false,
      treeStu: false,
      tabulation: false,
      signOptions: [],

      stateValue: "全部",
      stateOptions: ["全部", "成功", "错误"],
      EndpointsOptions: [
        {
          value: "",
          label: "",
        },
      ],
      InstancesOptions: [
        {
          value: "",
          label: "",
        },
      ],
      options: ["BY_START_TIME", "BY_DURATION"],
      value: "BY_START_TIME",
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {
    signValue: {
      handler (newVal, oldVal) { },
    },
  },
  mounted () {
    // this.loadAllData();
  },
  //方法集合
  methods: {
    format (percentage) {
      return percentage = `${percentage}ms`;
    },
    copyClick (tags) {
      let content = ''
      for (let item of tags) {
        content = content + item.key + ":" + item.value + "\n"
      }
      this.$copyText(content).then(
        this.$message.success('复制成功！')
      );
    },
    loadAllData (row) {
      this.curNum = 1;
      this.tracesList = []
      this.selectRow = row;
      this.fullscreenLoading = true;
      this.screenLoading = true;
      let data = {
        projectId: this.selectRow.projectId,
        path: this.selectRow.patterns,
        pageSize: 20,
        pageNum: 1,
      };
      this.queryTracesList(data);
    },
    // 查询Trance信息（Trance）
    queryTrace () {
      let data = {
        traceId: this.tracesValue,
      };
      queryTraceI(data).then((res) => {
        this.span = res.data.values.length;
        this.tracesForm = res.data.values;
        this.tracesStat = res.data.values;
        let keyList = []; //b
        this.detailList = []; //a
        if (this.tracesForm.length == 0) {
          this.traList = false;
        }
        for (let i = 0; i < this.tracesStat.length; i++) {
          let newItem = this.tracesStat[i];
          let findIndex = keyList.indexOf(newItem.endpointName);
          if (findIndex == -1) {
            keyList.push(newItem.endpointName);
            newItem.num = 1;
            newItem.minTime = newItem.endTime - newItem.startTime;
            newItem.maxTime = newItem.minTime;
            newItem.sumTime = newItem.minTime;
            this.detailList.push(newItem);
          } else {
            let oldItem = this.detailList[findIndex];
            oldItem.num++;
            let newTime = newItem.endTime - newItem.startTime;
            if (oldItem.minTime > newTime) {
              oldItem.minTime = newTime;
            }
            if (oldItem.maxTime < newTime) {
              oldItem.maxTime = newTime;
            }
            oldItem.sumTime = oldItem.sumTime + newTime;
          }
        }
        if (this.tracesForm.length == 0) {
          this.treeData.name = ''
          this.serveCode = ''
        } else {
          this.treeData.name = this.tracesForm[0].endpointName;
          this.serveCode = this.tracesForm[0].serviceCode;
        }
        // this.treeData.name = this.tracesForm[0].traceId;
        // this.treeData.children[0].name = this.tracesForm[0].endpointName;
        // this.treeData.children.tracesForm[0].serviceCode;
        // this.treeData.children[0].children = [];
        this.treeData.children = [];
        for (let i = 1; i < this.tracesForm.length; i++) {
          let item = {};
          item.name = this.tracesForm[i].endpointName;
          // this.treeData.children[0].children.push(item);
          this.treeData.children.push(item);
        }

        if (this.tracesForm.length == 0) {
          let selfTim = 0
        } else {
          let selfTim = this.tracesForm[0].endTime - this.tracesForm[0].startTime;
        }
        // if (this.tracesForm.length > 0) {
        //   let per = this.tracesForm[0].endTime - this.tracesForm[0].startTime;
        //   for (let i = 0; i < this.tracesForm.length; i++) {
        //     let ms = parseInt(
        //       this.tracesForm[i].endTime - this.tracesForm[i].startTime
        //     );

        //     if (per == 0) {
        //       this.tracesForm[i].endpointSlaPer = 100;
        //     } else {
        //       this.tracesForm[i].endpointSlaPer = parseInt((ms / per) * 100);
        //     }
        //   }
        // }
        this.fullscreenLoading = false;
        this.screenLoading = false;
      });
    },
    handleCurrentChange (val) {
      this.curNum = val.page;
      this.fullscreenLoading = true;
      this.screenLoading = true;
      let data = {
        projectId: this.selectRow.projectId,
        path: this.selectRow.patterns,
        pageSize: 20,
        pageNum: val.page,
      };
      this.queryTracesList(data);
    },
    TracesClk (i) {
      this.fullscreenLoading = true;
      this.detailsVisible = false
      this.apiStartTime = i.apiStartTime
      this.apiPath = i.apiPath
      this.httpMethod = i.httpMethod
      this.apiDuration = i.apiDuration
      this.detailsVisible = true

      // this.screenLoading=true
      this.endpoint = i.httpMethod + i.apiPath;
      this.initialPoint = i.apiStartTime;
      this.timeDuration = i.apiDuration;
      this.tracesValue = i.apiId;
      this.queryTrace();
    },
    formatTime (i) {
      let date = new Date(parseInt(i));
      let YYYY = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let DD = date.getDate();
      DD = DD < 10 ? "0" + DD : DD;
      let hh = date.getHours();
      hh = hh < 10 ? "0" + hh : hh;
      let mm = date.getMinutes();
      mm = mm < 10 ? "0" + mm : mm;
      let ss = date.getSeconds();
      ss = ss < 10 ? "0" + ss : ss;
      return YYYY + "-" + MM + "-" + DD + " " + hh + ":" + mm + ":" + ss;
    },
    // Trance列表查询
    queryTracesList (data) {
      getApiRecordListI(data).then((res) => {
        this.tracesList = res.rows;
        // debugger
        this.maxPageNum = res.total / data.pageSize;
        this.totalCount = res.total;
        if (this.tracesList.length == 0) {
          this.traList = false;
          this.treeStu = false;
          this.tabulation = false;
          this.statistics = false;
          // this.tracesList.length = 0
          // this.fullscreenLoading = false;
        } else {
          this.traList = true;
          this.obj = this.obj1;
          this.treeObj = this.obj2;
          this.tabObj = this.obj2;
          this.statObj = this.obj2;
          this.treeStu = false;
          this.tabulation = false;
          this.statistics = false;
          // this.TracesClk(this.tracesList[0]);
        }
        this.fullscreenLoading = false;
        this.screenLoading = false;
      });
    },
  },
};
</script>
<style scoped>
.log /deep/.el-dialog {
  width: 100%;
  height: 100%;
  -webkit-box-shadow: 0 0px 0px rgb(0 0 0 / 0%);
  margin: 0 !important;
}

.log /deep/.el-dialog__header {
  padding-top: 30px;
}

.log /deep/.el-dialog__body {
  padding: 10px 20px;
}

.log /deep/.el-dialog__footer {
  text-align: right;
}

.Num {
  margin-top: 18px;
  width: 90%;
}

.trace-t-wrapper {
  overflow: auto;
  height: 97%;
}

.btn-s1 {
  margin-top: 1px;
  margin-right: 1px;
}

.btn-l:focus {
  /* border: 1px solid #409eff; */
  background-color: #409eff;
}

.btn-s {
  margin-top: 3px;
  margin-right: 1px;
}

.btn-l {
  margin-right: 10px;
  display: flex;
  justify-content: center;
  width: 80px;
  height: 24px;
  line-height: 24px;
  border: 0;
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.el-btn {
  display: flex;
  position: absolute;
  right: 0px;
  bottom: 8px;
}

.tag-1 {
  color: #2c3e50;
  margin-right: 10px;
}

.grey-2 {
  text-align: center;
  margin-left: 5px;
  margin-right: 5px;
  padding: 1px 5px 1px 5px;
  line-height: 15px;
  color: #eee;
  background-color: #40454e;
  border-radius: 5px;
}

.item {
  font-size: 12px;
  position: absolute;
  display: flex;
  top: 50px;
  justify-content: center;
}

.icon-1 {
  position: absolute;
  left: 313px;
  top: 32px;
}

.mt-0 {
  top: 23px;
  position: absolute;

  width: 300px;
  height: 30px;
  color: #448dfe;
  border: 1px solid #448dfe;
  border-radius: 3px;
}

.trace-log-btn {
  display: inline-block;
  width: 80px;
  height: 23px;
  position: absolute;
  right: 40px;
}

.trace-detail-wrapper {
  position: relative;
  font-size: 12px;
  padding: 5px 10px;
  border-bottom: 1px solid #eee;
  width: 100%;
  height: 80px;
}

.mb-5 {
  float: left;
  font-weight: 700;
  font-size: 14px;
  margin-top: 16px;
  margin-bottom: 5px;
}

.trace-detail {
  margin-top: 2px;
  border: 1px solid #e5e5e5;
  height: 99%;
  width: 100%;
  background-color: #fff;
}

.tag {
  position: absolute;
  left: 60px;
  top: 25px;
  padding-right: 5px;
  padding-left: 5px;
}

.grey-1 {
  text-align: center;
  margin-left: 5px;
  width: 45px;
  height: 15px;
  color: #eee;
  background-color: #40454e;
  border-radius: 5px;
}

.block {
  margin-top: 2px;
  height: 30px;
  display: flex;
}

.list:focus {
  background: #ededed;
}

.list:hover {
  background: #f5f5f5;
}

.list {
  cursor: pointer;
  margin-bottom: 2px;
  position: relative;
  border-radius: 3px;
  color: #2c3e50;
  width: 99%;
  height: 50px;
  background-color: #fff;
  margin-left: 2px;
}

.ell {
  font-size: 12px;
  padding: 5px;
  color: #448dfe;
}

.trace-t {
  /* width: 400px;
  margin-right: 2px; */
}

.el-select {
  display: inline-block;
  position: relative;
}

.trace {
  /* display: flex;
  width: 100%;
  overflow: hidden;
  min-width: 1200px;
  font-size: 12px;
  height: 100%; */
  /* background-color: rgba(196, 200, 225, 0.2); */
}

.tags-tip {
  font-size: 12px;
  color: #a7aebb;
  margin-left: 10px;
  display: inline-block;
}

.inp {
  display: inline-block;
  width: 270px;
}

.search-btn {
  cursor: pointer;
  width: 120px;
  position: absolute;
  top: 0;
  right: 10px;
}

.mr-10 {
  margin-right: 10px;
}

.grey {
  color: #a7aebb;
  font-size: 12px;
  margin-right: 5px;
}

.flex-h {
  display: flex;
  position: relative;
  margin: 5px;
}

.tab-layout:focus {
  border: 1px solid #409eff;
}

.tab-layout {
  /* margin-top: 10px; */
  transform: translate3d(10px, 10px, 0px);
  width: 100%;
  height: 98%;
  padding: 5px;
  background: #fff;
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
  margin-bottom: 10px;
}

.log:focus {
  border: 1px solid #409eff;
}

.log {
  font-size: 14px;
  width: 100%;
  background: #fff;
  border-radius: 3px;
}

.dialog {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;
}

.dialog-w {
  padding-left: 20px;
  display: flex;
  flex: 100%;
  line-height: 20px;
  margin-bottom: 10px;
  /* min-width: calc((100% - 10px) / 2); */
}

.dialogSer {
  width: 50%;
  color: #a7aebb;
}

.dialogDat {
  width: 50%;
  color: #606266;
}

.dialogSer-1 {
  /* margin-top: 20px;
  margin-bottom: 10px; */
  width: 50%;
  color: #606266;
  font-weight: 700;
}

.serBtn {
  text-align: center;
  width: 100%;
  height: 30px;
  line-height: 30px;
  background-color: #409eff;
  margin-top: 40px;
  border: 0;
  color: #fff;
  border-radius: 5px;
}

.serCode {
  margin-top: 20px;
  padding: 2px 8px;
  border: 1px solid;
  font-size: 11px;
  border-radius: 4px;
  display: inline-block;
  margin-left: 10px;
  color: #6e40aa;
}

.traceCod {
  margin-top: 20px;
}

.traceTime {
  position: relative;
}

.schedule {
  position: absolute;
  top: 46px;
  right: 13%;
}

.scheduleNum {
  margin-top: 20px;
}

.content {
  height: 100%;
  width: 97%;
}

/* .tabDiv:hover {
  width: 500px;
  height: 50px;
  background-color: #2c3e50;
} */

.tabDiv {
  /* width: 300px; */
  overflow: auto;
  /* height: 100px; */
  position: relative;

}

.tabDiv1 {
  height: 40px !important;
  overflow: hidden;
}

.coy {
  z-index: 999;
  position: absolute;
  top: 10px;
  right: 20px;
  color: #409eff;
}

.tilDiv {
  display: flex;
  font-size: 15px;
  justify-content: space-between;
  padding: 10px;
}

.proDiv /deep/ .el-progress-bar__outer {
  height: 30px !important;
  border-radius: 0px;
  backgroundColor: #fff !important;

}

.proDiv /deep/ .el-progress-bar__inner {
  /* height: 10px !important; */
  border-radius: 0px;
}

.proDiv /deep/ .el-progress-bar__innerText {
  color: #000;
}

.proDiv /deep/ .el-progress-bar__outer {
  backgroundColor: #fff !important;
}

.totalTion /deep/ .el-pagination__sizes {
  display: none;
}
</style>
