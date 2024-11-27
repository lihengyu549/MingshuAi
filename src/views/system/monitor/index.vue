<template>
  <div class="app-container">
    <div class="cont">
      <el-form ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item class="dashboard-tool" label="项目">
          <el-select size="mini" v-model="currentServer" placeholder="请选择" @change="serverChange($event)">
            <el-option v-for="item in serviceOptions" :key="item.id" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <div class="block">
          <el-date-picker size="mini" prefix-icon="el-icon-date" :clearable="false" v-model="range" type="datetimerange"
            :picker-options="pickerOptions" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期"
            align="right">
          </el-date-picker>
        </div>
      </el-form>
    </div>

    <div class="cont-mian">
      <el-row>
        <!-- <el-col :span="24" class="concent" tabIndex="1">
        <el-form :inline="true" :model="queryParams" class="demo-form-inline">
          <el-form-item label="实例">
            <el-select size="mini" v-model="instanceValue" placeholder="全部">
              <el-option label="全部" value="shanghai"></el-option>
              <el-option
                v-for="item in instanceOptions"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="端点">
            <el-select size="mini" v-model="endpointValue" placeholder="全部">
              <el-option label="全部" value="shanghai"></el-option>

              <el-option
                v-for="item in endpointOptions"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="事件类型">
            <el-select
              size="mini"
              v-model="formInline.region"
              placeholder="全部"
            >
              <el-option label="全部" value="shanghai"></el-option>
              <el-option label="正常" value="beijing"></el-option>
              <el-option label="异常" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <div>
              <el-pagination :total="1" layout="prev, pager, next">
              </el-pagination>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              style="width: 130px; height: 30px; line-height: 10px"
              type="primary"
              @click="onSubmit"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>

        <time-line :timelineData="timelineData" :activeYear="2021" ></time-line>
      </el-col> -->

        <el-col :span="24" class="footer" tabIndex="1">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="概览分析" name="overview">
              <my-overview v-if="showSon" :timeHorizonC="timeHorizon" :currentServerC="currentServer"
                :currView="activeName"></my-overview>
            </el-tab-pane>
            <el-tab-pane label="实例" name="instance">
              <my-instance :currView="activeName" :timeHorizonC="timeHorizon" :currentServerC="currentServer"
                :currentServerIdC="currentServerId"></my-instance>
            </el-tab-pane>
            <!-- <el-tab-pane label="端点" name="endpoint">
              <my-endpoint
                :currView="activeName"
                :timeHorizonC="timeHorizon"
                :currentServerC="currentServer"
                :currentServerIdC="currentServerId"
              ></my-endpoint>
            </el-tab-pane> -->
            <el-tab-pane label="拓扑图" name="topology">
              <my-topology :currView="activeName" :timeHorizonC="timeHorizon" :currentServerC="currentServer"
                :currentServerIdC="currentServerId"></my-topology>
            </el-tab-pane>
            <el-tab-pane label="调用链查询" name="trace">
              <my-trace :currView="activeName" :timeHorizonC="timeHorizon" :currentServerC="currentServer"
                :currentServerIdC="currentServerId"></my-trace>
            </el-tab-pane>
            <!-- <el-tab-pane label="跟踪" name="six">
            <my-trace-profiling></my-trace-profiling>
          </el-tab-pane>
          <el-tab-pane label="eBPF 分析" name="seven">
            <my-eBPF-Profiling></my-eBPF-Profiling>
          </el-tab-pane>
          <el-tab-pane label="日志" name="eight">角色管理</el-tab-pane> -->
            <!-- <el-tab-pane >
                <div slot="label">
                    <i ><svg t="1670823762355" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1341" width="15" height="15"><path d="M930.909091 884.363636 930.909091 0 232.727273 0 232.727273 93.090909 837.818182 93.090909 837.818182 884.363636Z" p-id="1342"></path><path d="M93.090909 149.410909l0 864.814545C93.090909 1019.624727 97.373091 1024 102.679273 1024l678.958545 0C786.990545 1024 791.272727 1019.671273 791.272727 1014.225455L791.272727 149.410909C791.272727 144.011636 786.990545 139.636364 781.684364 139.636364L102.679273 139.636364C97.373091 139.636364 93.090909 143.965091 93.090909 149.410909zM186.181818 279.272727l512 0 0 46.545455L186.181818 325.818182 186.181818 279.272727zM186.181818 418.909091l512 0 0 46.545455L186.181818 465.454545 186.181818 418.909091zM186.181818 558.545455l512 0 0 46.545455L186.181818 605.090909 186.181818 558.545455zM186.181818 698.181818l512 0 0 46.545455L186.181818 744.727273 186.181818 698.181818zM186.181818 837.818182l325.818182 0 0 46.545455L186.181818 884.363636 186.181818 837.818182z" p-id="1343"></path></svg></i>
                </div>
            </el-tab-pane> -->
          </el-tabs>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
// import MyeBPFProfiling from "@/components/eBPFProfiling/index";
// import MyTraceProfiling from "@/components/TraceProfiling/index";
import MyTrace from "@/components/Trace/index";
import MyTopology from "@/components/Topology/index";
import MyEndpoint from "@/components/Endpoint/index";
import MyInstance from "@/components/Instance/index";
import Overview from "@/components/Overview/index";
// import TimeLine from "@/components/TimeLine/index"
import { Service, getIpsI, Instance, Endpoint } from "@/api/system/monitor";
export default {
  name: "Project",
  components: {
    // "my-eBPF-Profiling": MyeBPFProfiling,
    // "my-trace-profiling": MyTraceProfiling,

    "my-trace": MyTrace,
    "my-topology": MyTopology,
    "my-endpoint": MyEndpoint,
    "my-instance": MyInstance,
    "my-overview": Overview,

    // "time-line":TimeLine
  },

  data () {
    return {
      input: "",
      showSon: false,
      timeHorizon: [],
      pickerOptions: {
        disabledDate (time) {
          // 禁用以后的时间
          return time.getTime() > Date.now() - 8.64e6;
        },

        shortcuts: [
          {
            text: "最近一周",
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick (picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },

      range: [new Date().getTime() - 1800 * 1000, new Date()],

      activeName: "overview",

      //       timelineData: [
      //   {
      //     year: 2022
      //   },
      //   {
      //     year: 2021
      //   },
      //   {
      //     year: 2020
      //   },
      //   {
      //     year: 2019
      //   },
      //   {
      //     year: 2018
      //   }
      // ],
      formInline: {
        region: "",
      },

      // 实例列表
      instanceValue: "",
      instanceOptions: [
        {
          id: "",
          value: "",
          label: "",
        },
      ],
      // 端点列表
      endpointValue: "",
      endpointOptions: [
        {
          id: "",
          value: "",
          label: "",
        },
      ],

      //服务列表下拉框
      serviceOptions: [
        {
          id: "",
          value: "",
          label: "",
        },
      ],
      list: {},
      currentServerId: "",
      currentServer: "",
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 项目列表表格数据
      projectList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        url: null,
      },
    };
  },
  watch: {
    range (newval) {
      if (!newval) {
        this.timeHorizon = JSON.parse(JSON.stringify(this.timeHorizon));
        this.timeHorizon[0] = parseInt(new Date().getTime() / 1000 - 1800);
        this.timeHorizon[1] = parseInt(new Date().getTime() / 1000);
        // this.range = [new Date().getTime() - 1800 * 1000, new Date()]
      } else {
        if (this.range[1].getTime() - this.range[0].getTime() < 60000) {
          this.timeHorizon = JSON.parse(JSON.stringify(this.timeHorizon));
          this.timeHorizon[0] = parseInt(this.range[0].getTime() / 1000 - 60);
          this.timeHorizon[1] = parseInt(this.range[1].getTime() / 1000);
        } else {
          this.timeHorizon = JSON.parse(JSON.stringify(this.timeHorizon));
          this.timeHorizon[0] = parseInt(this.range[0].getTime() / 1000);
          this.timeHorizon[1] = parseInt(this.range[1].getTime() / 1000);
        }
      }

      // this.timeHorizon = JSON.parse(JSON.stringify(this.timeHorizon));
      // this.timeHorizon[0] = parseInt(this.range[0].getTime() / 1000)
      // this.timeHorizon[1] = parseInt(this.range[1].getTime() / 1000);
    },

    // $route(to, from) {
    //   if (to.path == "/Index") {
    //     if (this.$route.query.id) {
    //       this.currentServer = this.$route.query.name;
    //       this.currentServerId = this.$route.query.id;
    //     }
    //     // this.queryParams.pageNum = 1;
    //     this.serviceList();
    //   }
    // },
  },
  mounted () {
    let uri = window.location.search.substring(1);
    let params = new URLSearchParams(uri);
    //如果有页面请求路径页面，则跳转
    if (params.get("to") === "path")
      this.handleClick({ paneName: "trace" }, null);
  },
  created () {
    this.timeHorizon[0] = Math.floor(new Date().getTime() / 1000 - 1800);
    this.timeHorizon[1] = Math.floor(new Date().getTime() / 1000);

    this.serviceList();

    // this.instanceList();
    // this.endpointList();
  },
  methods: {
    handleClose (done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
          this.ruleForm.name = "";
        })
        .catch((_) => { });
    },
    serBtn () {
      this.centerDialogVisible = true;
    },
    timeFormat (value) {
      let date = new Date(value);
      let y = date.getFullYear();
      let MM = date.getMonth() + 1;
      MM = MM < 10 ? "0" + MM : MM;
      let d = date.getDate();
      d = d < 10 ? "0" + d : d;
      let h = date.getHours();
      h = h < 10 ? "0" + h : h;
      let m = date.getMinutes();
      m = m < 10 ? "0" + m : m;
      let s = date.getSeconds();
      s = s < 10 ? "0" + s : s;
      // return y + "-" + MM + "-" + d + " " + h + ":" + m +":" + s;
      return y + "-" + MM + "-" + d + " " + h + m;
    },
    serverChange (value) {
      var obj = {};
      obj = this.serviceOptions.find(function (i) {
        return i.custom_value === value;
      });

      // if (obj != undefined) {
      // console.log(obj);
      // }
      // console.log(obj);
      this.currentServerId = obj.id;
      // console.log("401------");
    },
    //tabs页面
    handleClick (tab, event) {
      this.activeName = tab.paneName;
    },
    // 端点
    // endpointList() {
    //   this.loading = true;
    //   Endpoint().then((res) => {
    //     this.endpointOptions = res.data.pods;
    //   });
    // },
    //实例
    // instanceList() {
    //   this.loading = true;
    //   Instance().then((res) => {
    //     this.instanceOptions = res.data.pods;
    //   });
    // },
    //服务列表
    serviceList () {
      this.loading = true;
      Service().then((res) => {
        this.serviceOptions = res.data;
        if (this.serviceOptions.length > 0) {
          this.currentServer = this.serviceOptions[0].value;
          this.currentServerId = this.serviceOptions[0].id;
          if (this.$route.query.agentServerId) {
            var obj = {};
            let custom_value = this.$route.query.agentServerId
            obj = this.serviceOptions.find(function (i) {
              return i.custom_value == custom_value;
            });
            if (obj) {
              this.currentServerId = obj.id;
              this.currentServer = this.$route.query.agentServerId;
            }
          }
        }

        this.showSon = true;
      });
    },
    // onSubmit() {

    // },
  },
};
</script>
<style scoped>
/* .log /deep/.el-dialog {
  width: 100%;
  -webkit-box-shadow: 0 0px 0px rgb(0 0 0 / 0%);
  margin: 0 !important;
}
.log /deep/.el-dialog__header {
  padding-top: 30px;
} */
.log /deep/.el-dialog__body {
  padding: 10px 20px;
}

/* .log /deep/.el-dialog__footer {
  text-align: right;
} */

.serIpt {
  width: 230px;
}

.serClass {
  color: #fff;
  left: 280px;
  height: 27px;
  font-size: 14px;
  position: absolute;
  top: 7px;
  background-color: #409eff;
  padding: 4px 8px 0px 8px;
  border-radius: 5px;
}

.cont {
  position: fixed !important;
  z-index: 1000;
  width: 100%;
  /* height: 200px; */
  background-color: #fff;
  /* margin-bottom: 10px; */
  top: 50px;
}

.cont-mian /deep/ .el-tabs__header {
  position: fixed !important;
  /* left: 0; */
  z-index: 1000;
  width: 100%;
  margin: -1px 0 15px !important;
  background-color: #fff;
  padding-left: 20px;
}

.cont-mian /deep/ .el-tabs__nav-wrap::after {
  height: 0;

}

.cont-mian /deep/ .el-tabs__content {
  /* background-color: #F0F2F5; */
}


.app-container {
  position: relative;
  /* overflow: auto; */
  /* background-color: #F0F2F5; */
  padding: 0;

}

.block {
  right: 5%;
  position: absolute;
  top: 9px;
}

/* .footer:focus {
  border: 1px solid #409eff;
} */

.footer {
  margin-top: 49px;
  width: 100%;
  height: 100%;
  padding: 10px;
  padding-left: 0;
  padding-right: 0;
  border-radius: 3px;
}

.el-carousel__item h3 {
  color: #475669;
  font-size: 18px;
  opacity: 0.75;
  line-height: 100px;
  margin: 0 !important;
}

.dashboard-tool {
  padding: 5px;
  width: 100%;
  margin: 0px !important;
}

.concent:focus {
  border: 1px solid #409eff;
}

.concent {
  transform: translate3d(10px, 10px, 0px);
  width: 100%;
  height: 90px;
  padding: 10px;
  background: #fff;
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
}
</style>
