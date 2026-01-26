<template>
  <div class="content">
    <div class="tab-layout" tabIndex="1">
      <div>
        <div class="flex-h">

          <el-form ref="queryForm" size="small" :inline="true" label-width="90px">

            <el-form-item label="实例:">
              <el-select clearable size="mini" v-model="InstancesValue" placeholder="全部">
                <el-option v-for="item in InstancesOptions" :key="item.id" :label="item.label" :value="item.id">
                </el-option>
              </el-select>

            </el-form-item>

            <el-form-item label="接口:">
              <el-select clearable size="mini" v-model="EndpointsValue" placeholder="全部">
                <el-option v-for="item in EndpointsOptions" :key="item.id" :label="item.label" :value="item.id">
                </el-option>
              </el-select>

            </el-form-item>

            <el-form-item label="状态:">
              <el-select size="mini" v-model="stateValue" @change="test1" placeholder="全部">
                <el-option v-for="item in stateOptions" :key="item" :label="item" :value="item">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="TranceId:">
              <el-input clearable size="mini" v-model="traceInput"></el-input>

            </el-form-item>


            <el-form-item label="持续时间:">
              <el-input type="number" size="mini" style="width: 130px" v-model="tiemInput" :min="0"></el-input>
              -
              <el-input :min="0" size="mini" style="width: 130px" v-model="input" type="number"></el-input>
            </el-form-item>

            <el-form-item label="标记:">
              <el-cascader size="mini" style="width: 100%" clearable filterable separator="=" v-model="serveVal"
                :options="signOptions" @change="signChg" :props="{ multiple: true }"></el-cascader>
            </el-form-item>

            <el-form-item>
              <el-button @click="search()" type="primary" icon="el-icon-search" size="mini">搜索</el-button>
              <!-- <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button> -->
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <div class="trace" v-loading="screenLoading">
      <div class="trace-t">
        <div>
          <el-table :data="tracesList">
            <el-table-column label="TranceId" align="center">
              <template slot-scope="scope">
                <div>{{ scope.row.traceIds[0] }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="apiStartTime" label="产生时间" align="center">
              <template slot-scope="scope">
                <div>{{ formatTime(scope.row.start) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="接口名称" align="center">
              <template slot-scope="scope">
                <div style="text-align: center;">{{ scope.row.endpointNames[0] }}</div>
              </template>
            </el-table-column>
            <el-table-column label="耗时" align="center">
              <template slot-scope="scope">
                <div>{{ scope.row.duration }}ms</div>
              </template>
            </el-table-column>
            <el-table-column prop="" label="操作" align="center">
              <template slot-scope="scope">
                <a style="color: #409eff;" @click="TracesClk(scope.row)">详情</a>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <pagination class="totalTion" v-show="totalCount > 0" :total="totalCount" :page.sync="curNum"
          :page-size.sync="queryParams.pageSize" :page-size="20" @pagination="handleCurrentChange"
          @current-change="handleCurrentChange">
        </pagination>
      </div>
    </div>

    <el-drawer class="log" title="详情" :wrapperClosable="true" :visible.sync="dialogVisible" width="98%" :modal="true"
      v-loading="fullscreenLoading">
      <div>
        <div class="tilDiv">
          <div style="width: 50%; white-space: nowrap; overflow: hidden;text-overflow: ellipsis;">
            <span>TranceId: </span>
            <span> {{ traceIds }} </span>
          </div>
          <div style="width: 50%; white-space: nowrap; overflow: hidden;text-overflow: ellipsis; ">
            <span>调用时间: </span>
            <span> {{ formatTime(apiStartTime) }} </span>
          </div>
        </div>

        <div class="tilDiv">
          <div style="width: 50%; white-space: nowrap; overflow: hidden;text-overflow: ellipsis;">
            <span>接口名称: </span>
            <span>{{ apiPath }}</span>
          </div>
          <div style="width: 50%;white-space: nowrap; overflow: hidden;text-overflow: ellipsis; ">
            <span>耗时: </span>
            <span>{{ apiDuration }}ms</span>
          </div>
        </div>
        <!-- <div class="tilDiv"> -->
        <!-- <div style="width: 50%">
            <span>请求方法: </span>
            <span>{{ httpMethod }}</span>
          </div> -->

        <!-- </div> -->
      </div>
      <el-table style="width: 98%; margin-left: 1%; " :data="tracesForm">
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
            <el-popover placement="top" offset="300" width="400" trigger="hover">
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
              :percentage="(scope.row.endTime - scope.row.startTime) >= 100 ? 100 : (scope.row.endTime - scope.row.startTime)"
              :format="format" color="rgb(184, 233, 134)" :max="100"></el-progress>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>

  <!-- <div class="log" tabIndex="1" v-if="viewLog" >

      <h1>hhhhhhh</h1>

    </div> -->
</template>

<script>
import treeStructure from "./treeStructure.vue";
import {
  queryInstancesI,
  queryEndpointsI,
  queryTraceTagKeysI,
  queryTracesListI,
  queryTraceI,
} from "@/api/system/monitor";
let id = 0;
export default {
  name: "my-trace",
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
      traceIds: '',
      apiStartTime: '',
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
      traList: true,
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
      currViewC: "",
      timeDuration: "",
      initialPoint: "",
      tracesOptions: [],
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
      name: "trace",
      statistics: false,

      tableData: [
        {
          date: "2016-05-02",
          name: "hah",
          address: "202222",
        },
      ],
      treeStu: false,
      tabulation: false,
      signOptions: [],

      stateValue: "全部",
      stateOptions: ["全部", "成功", "错误"],
      EndpointsOptions: [
        {
          value: "",
          label: "",
          id: 0
        },
      ],
      InstancesOptions: [
        {
          value: "",
          label: "",
          id: 0
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
    currView: {
      handler (newVal, oldVal) {
        this.currViewC = newVal;
        if (this.name == this.currViewC) {
          this.loadAllData();
        }
      },
    },
    timeHorizonC () {
      if (this.name == this.currViewC) {
        this.loadAllData();
      }
    },
    currentServerC: {
      handler (newVal, oldVal) {
        this.serverId = newVal;
        if (this.name == this.currViewC) {
          this.loadAllData();
        }
      },
    },
    currentServerIdC () {
      if (this.name == this.currViewC) {
        this.loadAllData();
      }
    },
  },
  mounted () {
    this.loadAllData();
  },
  //方法集合
  methods: {
    // convertPercent (val) {
    //   console.log(val);
    //   // 如果val值大于100，则返回100，否则返回原数值
    //   return val > 100 ? 100 : val
    // },
    copyClick (tags) {
      let content = ''
      for (let item of tags) {
        content = content + item.key + ":" + item.value + "\n"
      }
      this.$copyText(content).then(
        this.$message.success('复制成功！')
      );
    },
    format (percentage) {
      return percentage = `${percentage}ms`;
    },
    loadAllData () {
      this.fullscreenLoading = true;
      this.screenLoading = true;
      //  setTimeout(() => {
      //   this.fullscreenLoading = false;
      // console.log(this.name+"--"+this.currView+ "  "+this.currViewC)
      if (this.name == this.currViewC) {
        this.queryInstances();
        this.queryEndpoints();
        this.queryTraceTagKeys();
        // this.queryTrace();

        let data = {
          serviceId: this.currentServerIdC,
          pageNum: this.curNum,
          pageSize: 20,
          traceState: this.tranceStuts(this.stateValue),
          queryOrder: this.value,
          minTraceDuration: "",
          maxTraceDuration: "",
          traceId: "",
          endpointId: "",
          serviceInstanceId: "",
          startTime: this.timeHorizonC[0],
          endTime: this.timeHorizonC[1],
        };
        this.curNum = 1;
        this.maxPageNum = 1;
        this.totalCount = 20;
        this.queryTracesList(data);
      }
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

        this.treeData.name = this.tracesForm[0].endpointName;
        // this.treeData.name = this.tracesForm[0].traceId;
        // this.treeData.children[0].name = this.tracesForm[0].endpointName;
        this.serveCode = this.tracesForm[0].serviceCode;
        // this.treeData.children.tracesForm[0].serviceCode;
        // this.treeData.children[0].children = [];
        this.treeData.children = [];
        for (let i = 1; i < this.tracesForm.length; i++) {
          let item = {};
          item.name = this.tracesForm[i].endpointName;
          // this.treeData.children[0].children.push(item);
          this.treeData.children.push(item);
        }

        let selfTim = this.tracesForm[0].endTime - this.tracesForm[0].startTime;
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
      if ((this.InstancesValue = "全部")) {
        // this.InstancesValue = "All";
        let insVal = "All";
      }
      if ((this.EndpointsValue = "全部")) {
        // this.EndpointsValue = "All";
        let endVal = "All";
      }

      let data = {
        serviceId: this.currentServerIdC,
        pageNum: this.curNum,
        pageSize: 20,
        traceState: this.tranceStuts(this.stateValue),
        queryOrder: this.value,
        minTraceDuration: this.tiemInput,
        maxTraceDuration: this.input,
        traceId: this.traceInput,
        endpointId: this.endVal,
        serviceInstanceId: this.insVal,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      this.queryTracesList(data);
    },
    tranceStuts (name) {
      if (name == "全部") {
        return "ALL";
      }
      if (name == "成功") {
        return "SUCCESS";
      }
      if (name == "错误") {
        return "ERROR";
      }
    },
    // resetQuery () {
    //   this.InstancesValue = "全部"
    //   this.EndpointsValue = "全部"
    //   this.stateValue = "全部"

    // },

    //搜索
    search () {
      // debugger
      //  if ((this.InstancesValue = "全部")) {
      //   this.InstancesValue = "All";
      // }
      // if ((this.EndpointsValue = "全部")) {
      //   this.EndpointsValue = "All";
      // }
      let list = ''
      for (let item of this.serveVal) {
        list = list + item[1] + ','
      }
      let data = {
        pageNum: this.curNum,
        pageSize: 20,
        traceState: this.tranceStuts(this.stateValue),
        queryOrder: this.value,
        minTraceDuration: this.tiemInput,
        maxTraceDuration: this.input,
        traceId: this.traceInput,
        serviceId: this.currentServerIdC,
        // endpointId: this.EndpointsValue,
        endpointId: this.EndpointsValue,
        serviceInstanceId: this.InstancesValue,
        tags: list,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      this.queryTracesList(data);
      this.curNum = 1;
      this.maxPageNum = 1;
      this.totalCount = 20;

    },
    TracesClk (i) {
      this.traceIds = i.traceIds[0]
      this.fullscreenLoading = true;
      this.apiStartTime = i.start
      this.apiPath = i.endpointNames[0]
      this.httpMethod = i.httpMethod
      this.apiDuration = i.duration
      this.dialogVisible = true
      this.endpoint = i.endpointNames[0];
      this.initialPoint = i.start;
      this.timeDuration = i.duration;
      this.tracesValue = i.traceIds[0];
      this.tracesOptions = [];
      for (let item of i.traceIds) {
        this.tracesOptions.push(item);
      }
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
    test1 () { },

    signChg (value) { },

    // Trance 查询TAG列表（Trance）
    queryTraceTagKeys (val) {
      let data = {
        tagKey: this.signValue,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
      };
      queryTraceTagKeysI(data).then((res) => {
        this.signOptions = res.data;
      });
    },

    // Trance列表查询
    queryTracesList (data) {
      queryTracesListI(data).then((res) => {
        this.tracesList = res.data.values;
        console.log(this.tracesList);
        // debugger
        if (this.tracesList.length == 0) {
          this.curNum = 1;
          this.totalCount = 20;
          this.traList = false;
          this.treeStu = false;
          this.tabulation = false;
          this.statistics = false;
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
          // 判断第一页的情况
          if (this.curNum == 1 && this.totalCount == 20) {
            let num = this.tracesList.length;
            if (num >= 20) {
              //显示第二页页码
              this.totalCount = this.totalCount + 20;
              this.maxPageNum = Math.ceil(this.totalCount / 20);
            } else {
              this.totalCount = num;
            }
          }
          // 判断大于第一页的情况
          else if (this.curNum > 1 && this.totalCount > 20) {
            let num = this.tracesList.length;
            if (this.curNum >= this.maxPageNum) {
              if (num >= 20) {
                //显示第二页页码
                this.totalCount = this.totalCount + 20;
                this.maxPageNum = Math.ceil(this.totalCount / 20);
              }
            }
          }
        }

        // if (this.tracesList = []) {
        //   this.traList = false;
        //   this.treeStu = false;
        //   this.tabulation = false;
        //   this.statistics = false;

        this.fullscreenLoading = false;
        this.screenLoading = false;

        // }
      });
    },

    // 端点
    queryEndpoints () {
      let data = {
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
        serverId: this.currentServerIdC,
        keywork: "",
      };
      queryEndpointsI(data).then((res) => {
        this.EndpointsOptions = res.data;
        this.EndpointsOptions.unshift({ label: "全部", id: '' })
      });
    },

    // 实例
    queryInstances () {
      let data = {
        serverName: this.currentServerC,
        startTime: this.timeHorizonC[0],
        endTime: this.timeHorizonC[1],
        serverId: this.currentServerIdC,
      };
      queryInstancesI(data).then((res) => {
        this.InstancesOptions = res.data;
        this.InstancesOptions.unshift({ label: "全部", id: '' })
      });
    },
    traceList () {
      this.traList = true;

      this.obj = this.obj1;
      this.treeObj = this.obj2;
      this.tabObj = this.obj2;
      this.statObj = this.obj2;

      this.treeStu = false;
      this.tabulation = false;
      this.statistics = false;
    },

    treeStruc () {
      this.traList = false;

      this.obj = this.styObj;
      this.treeStu = true;
      this.treeObj = this.obj1;
      this.tabObj = this.obj2;
      this.statObj = this.obj2;

      this.tabulation = false;
      this.statistics = false;
    },
    tables () {
      this.traList = false;

      this.treeStu = false;
      this.tabulation = true;
      this.obj = this.styObj;
      this.treeObj = this.obj2;
      this.tabObj = this.obj1;
      this.statObj = this.obj2;
      this.statistics = false;
    },

    stat () {
      this.traList = false;
      this.treeStu = false;
      this.tabulation = false;
      this.statistics = true;
      this.obj = this.styObj;
      this.treeObj = this.obj2;
      this.tabObj = this.obj2;
      this.statObj = this.obj1;
    },
  },
};
</script>
<style scoped>
.log /deep/ .el-drawer__header {
  font-size: 25px;
  color: #000;
  font-weight: 700;
}

.log /deep/ .el-drawer__container .el-drawer {
  width: 60% !important;
  box-shadow: -6px 3px 21px 0px rgba(0, 0, 0, 0.13);
}


/* 
.log /deep/.el-dialog__header {
  padding-top: 30px;
}

.log /deep/.el-dialog__body {
  padding: 10px 20px;
}

.log /deep/.el-dialog__footer {
  text-align: right;
} */

.traceCenter {
  text-align: center;
  margin-top: 100px;
}

.listCenter {
  margin-top: 20px;
  text-align: center;
}

.Num {
  margin-top: 18px;
  width: 90%;
}

.traceCon {
  margin-top: 5px;
  display: flex;
  height: 40px;
  line-height: 40px;
  background-color: #f3f4f9;
}

.traceList {
  display: flex;
  height: 40px;
  line-height: 40px;
  background-color: #f3f4f9;
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
  top: 58px;
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
  margin-top: 0;
  margin-bottom: 5px;
}

.trace-detail {
  margin-top: 2px;
  border: 1px solid #e5e5e5;
  height: 100%;
  width: 100%;
  background-color: #fff;
}

.tag {
  position: absolute;
  left: 45px;
  top: 25px;
  padding-right: 5px;
  padding-left: 5px;
}

.grey-1 {
  text-align: center;
  margin-left: 5px;
  width: 35px;
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
  min-width: 1200px;
  font-size: 12px;
  height: 840px; */
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



.tab-layout {
  /* margin-top: 10px; */
  transform: translate3d(10px, 10px, 0px);
  width: 99%;
  padding: 5px;
  background: #fff;
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
  margin-bottom: 10px;
}

.log:focus {
  border: 1px solid #409eff;
}

/* .log {
  font-size: 14px;
  width: 100%;
  background: #fff;
  border-radius: 3px;
} */

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
  margin-top: 50px;
  padding-right: 10px;
}

.totalTion /deep/ .el-pagination__sizes {
  display: none;
}

.totalTion /deep/ .el-pagination__total {
  display: none;
}

.tilDiv {
  display: flex;
  font-size: 15px;
  justify-content: space-around;
  padding: 10px 0 10px 20px;


}

.coy {
  z-index: 999;
  position: absolute;
  top: 10px;
  right: 20px;
  color: #409eff;
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

.tabDiv1 {
  height: 40px !important;
  overflow: auto;
}

.tabDiv1::-webkit-scrollbar {
  width: 10px;
}

.tabDiv1::-webkit-scrollbar-thumb {
  background-color: #d8d8d8;
  border-radius: 5px;
}

.tabDiv1::-webkit-scrollbar-track {
  background-color: #f2f2f2;
}
</style>
