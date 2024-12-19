<template>
  <div class="content" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.98)">

    <!-- type="primary" -->
    <!-- style=" color: #fff; background-color: #409eff; border: 1px solid #409eff; border-radius: 5px; position: absolute; top: 16px;right: 1.5%;" -->
    <button class="btn btn-primary btn-ghost btn-shine" @click="goData">
      切换大屏
    </button>
    <div class="headerDiv">
      <div class="headerview">
        <div class="pic">
          <div class="pic-i">
            <svg t="1673574732973" class="icon" viewBox="0 0 1246 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              p-id="1379" width="25" height="25">
              <path
                d="M303.339977 664.942675l106.011591-276.040855h39.350086l112.971638 276.040855h-41.612716l-32.193289-83.618933h-115.431018l-30.311864 83.618933h-38.784428z m79.647033-113.352842h93.579424l-28.811641-76.44984q-13.182279-34.775639-19.576668-57.242078a351.974224 351.974224 0 0 1-14.879251 52.716819zM590.853841 664.942675V388.90182h104.130165q27.483576 0 41.99392 2.631537 20.339076 3.393945 34.074715 12.89945t22.134424 26.647387a84.578091 84.578091 0 0 1 8.37419 37.653114q0 35.20603-22.404955 59.590786t-80.962803 24.384757H627.387936v112.221527h-36.534095z m36.534095-144.796021h71.322031q35.402781 0 50.269735-13.182278t14.916142-37.087457q0-17.314038-8.755394-29.660127a40.936387 40.936387 0 0 0-23.068988-16.281098q-9.222676-2.45938-34.087012-2.459381H627.387936v98.670341zM854.278074 664.942675V388.90182h36.534095v276.040855h-36.534095z"
                fill="#ffffff" p-id="1380"></path>
              <path
                d="M914.938691 915.270707H623.108614a32.857322 32.857322 0 0 1 0-65.702347h291.830077c146.443805 0 265.613082-119.144683 265.613081-265.613081 0-133.728808-99.912328-247.020166-232.411446-263.522609l-23.364114-2.914365-4.734307-23.081285c-27.213044-132.560603-145.361678-228.722376-280.922724-228.722376-158.138159 0-286.788347 128.650188-286.788347 286.788347 0 3.209491 0.073781 6.62803 0.221344 10.772086l1.340362 37.739192-37.616223-3.910415a230.751365 230.751365 0 0 0-23.745317-1.22969c-125.071789 0-226.828653 101.756863-226.828653 226.828653s101.756863 226.828653 226.828653 226.828652h79.032189a32.857322 32.857322 0 0 1 0 65.702347h-79.032189C131.232537 915.270707 0.049188 784.03817 0.049188 622.739707c0-159.540006 128.379656-289.653525 287.255629-292.481812A352.515287 352.515287 0 0 1 863.205624 80.434035a353.941728 353.941728 0 0 1 115.775332 178.464938c153.858837 30.12741 267.223976 166.008176 267.223976 325.080899a331.290835 331.290835 0 0 1-331.266241 331.290835z"
                fill="#ffffff" p-id="1381"></path>
              <path
                d="M698.033638 1023.999914a32.734353 32.734353 0 0 1-22.195908-8.607831L532.505041 883.913607l135.684016-141.315997a32.857322 32.857322 0 0 1 47.39226 45.498537l-89.115648 92.829313 93.776174 86.016829a32.857322 32.857322 0 0 1-22.208205 57.057625z"
                fill="#ffffff" p-id="1382"></path>
            </svg>
          </div>
        </div>
        <div class="writing">
          <div class="wet-1">
            <!-- apiNum || 0  -->
            <a @click="apiBtn">{{ 200000 }}</a>

            <!-- <a href="http://localhost/systemInfo/api">{{ apiNum }}</a> -->
          </div>
          <div class="wet-2">
            <a @click="apiBtn">累计分析字段数量</a>
          </div>
          <!-- <div class="wet-3"> </div> -->
        </div>
      </div>
      <div class="headerview">
        <div class="pic-2">
          <div class="pic-i">
            <svg t="1673574894482" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              p-id="1379" width="25" height="25">
              <path
                d="M540.4 484.5V293.3c0-42.5 12-81.2 37.1-115.6 26.4-36 61.1-60.7 104.4-71.7 69.3-17.5 131.3-2.6 184 46.1 29.4 26.7 49 62.5 55.9 101.6 12.7 70.1-6.7 130.5-58.8 179.5-28.3 26.6-62.5 42.2-100.8 48.3-11 1.8-22.1 2.7-33.3 2.7-61.5 0.2-122.9 0.1-184.4 0.1l-4.1 0.2z m-56.5 0H294c-50 0-93.8-16.3-131-49.6-30.1-26.5-51-62-59.6-101.2-15.6-69.2 8.1-141.3 61.7-187.7 28.6-24.7 61.6-40 99-44.9 60.6-7.9 113.6 9 158.2 50.9 32.3 30.4 51.7 68 59 111.6 1.7 9.9 2.5 19.9 2.6 29.9 0.2 62.6 0.1 125.1 0.1 187.7l-0.1 3.3z m0 56.4v190.3c0.1 50-16.4 93.8-49.8 131-29.5 32.8-66.1 53.9-109.8 61-66.9 10.9-124.4-8.6-171.9-56.7-25.8-25.8-43.2-58.9-49.9-94.8-11.6-61 2.2-115.9 42.7-163.2 29.8-34.8 68-55.6 113-64.1 12.3-2.3 24.9-3.4 37.4-3.4h184.1l4.2-0.1z m56.5 2.2h191.5c38.8 0 74.8 9.8 107.4 31 40 26.1 67.1 62.1 79.3 108.2 16.3 61.3 5 117.9-33.4 168.5-26.4 34.7-61.3 57.5-103.4 68.9-20.8 5.8-42.5 7.7-64 5.6-73.1-7.6-125.8-45-158.9-110.3-10-19.6-15.3-40.7-17.6-62.6-0.7-6.9-0.9-13.8-0.9-20.8-0.1-61.7-0.1-123.4 0-185.2v-3.3z"
                fill="#ffffff" p-id="1380"></path>
            </svg>
          </div>
        </div>
        <div class="writing">
          <!-- projectNum -->
          <div class="wet-1"> <a @click="projecBtn">{{ 1200 }}</a></div>
          <div class="wet-2">
            <a @click="projecBtn">累计分析文件数量</a>
          </div>
          <!-- <div class="wet-3"> </div> -->
        </div>
      </div>
      <div class="headerview">
        <div class="pic-3">
          <div class="pic-i">
            <svg t="1673574938036" class="icon" viewBox="0 0 1068 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              p-id="1379" width="25" height="25">
              <path
                d="M502.784 909.57913v-113.619478H155.826087a129.113043 129.113043 0 0 1-129.113044-129.113043v-534.26087a129.113043 129.113043 0 0 1 129.113044-129.113043h756.869565a129.113043 129.113043 0 0 1 129.113044 129.113043v534.26087a129.113043 129.113043 0 0 1-129.113044 129.113043h-329.772522v113.574957h160.278261a40.069565 40.069565 0 0 1 0 80.13913h-400.695652a40.069565 40.069565 0 1 1 0-80.13913h160.278261zM155.826087 83.567304a48.973913 48.973913 0 0 0-48.973913 48.973913v534.26087a48.973913 48.973913 0 0 0 48.973913 48.973913h756.869565a48.973913 48.973913 0 0 0 48.973913-48.973913v-534.26087a48.973913 48.973913 0 0 0-48.973913-48.973913h-756.869565z m143.36 390.722783l-79.649391 151.81913a40.069565 40.069565 0 0 1-70.923131-37.264695l113.352348-216.019479a40.069565 40.069565 0 0 1 70.121739-1.469217l60.549565 104.314435L534.26087 186.857739a40.069565 40.069565 0 0 1 71.991652 0.133565l147.500521 303.682783 85.259131-122.12313a40.069565 40.069565 0 0 1 65.714087 45.857391l-124.349218 178.086956a40.069565 40.069565 0 0 1-68.87513-5.38713l-141.445565-291.172174-138.373565 282.35687a40.069565 40.069565 0 0 1-70.656 2.493217l-61.751653-106.406957z"
                fill="#ffffff" p-id="1380"></path>
            </svg>
          </div>
        </div>
        <div class="writing">
          <!-- serverNum -->
          <div class="wet-1"> <a @click="projecBtn">{{ 20 }}</a></div> 
          <div class="wet-2">
            <a @click="projecBtn">分类分级大模型调用次数</a>
          </div>
          <!-- <div class="wet-3"> </div> -->
        </div>
      </div>
    </div>
    <div>
      <my-indexlist></my-indexlist>
    </div>

    <div class="container" v-loading="loading">
      <el-row>
        <el-col :span="12" class="card-box" style="height: 295px !important">
          <el-card style="height: 295px !important">
            <div slot="header"><span>CPU</span></div>
            <div class="el-table el-table--enable-row-hover el-table--medium">
              <table cellspacing="0" style="width: 100%">
                <thead>
                  <tr>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">属性</div>
                    </th>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">值</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">核心数</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.cpu">
                        {{ server.cpu.cpuNum }}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">用户使用率</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.cpu">
                        {{ server.cpu.used }}%
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">系统使用率</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.cpu">
                        {{ server.cpu.sys }}%
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">当前空闲率</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.cpu">
                        {{ server.cpu.free }}%
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12" class="card-box" style="height: 295px !important">
          <el-card style="height: 295px !important">
            <div slot="header"><span>内存</span></div>
            <div class="el-table el-table--enable-row-hover el-table--medium">
              <table cellspacing="0" style="width: 100%">
                <thead>
                  <tr>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">属性</div>
                    </th>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">值</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">总内存</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.mem">
                        {{ server.mem.total }}G
                      </div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.jvm">
                        {{ server.jvm.total }}M
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">已用内存</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.mem">
                        {{ server.mem.used }}G
                      </div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.jvm">
                        {{ server.jvm.used }}M
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">剩余内存</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.mem">
                        {{ server.mem.free }}G
                      </div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.jvm">
                        {{ server.jvm.free }}M
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">使用率</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.mem" :class="{ 'text-danger': server.mem.usage > 80 }">
                        {{ server.mem.usage }}%
                      </div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.jvm" :class="{ 'text-danger': server.jvm.usage > 80 }">
                        {{ server.jvm.usage }}%
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12" class="card-box" style="height: 295px !important">
          <el-card style="height: 295px !important">
            <div slot="header"><span>GPU</span></div>
            <div class="el-table el-table--enable-row-hover el-table--medium">
              <table cellspacing="0" style="width: 100%">
                <thead>
                  <tr>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">显卡参数</div>
                    </th>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">值</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">显卡型号</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.gpus">
                        {{ server.gpus[0].name }}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">温度</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.gpus">
                        {{server.gpus[0].temperature }}°
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">利用率</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.gpus">
                        {{ server.gpus[0].utilization }}%
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">显存</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" v-if="server.gpus">
                        {{ server.gpus[0].memoryUtilization }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12" class="card-box">
          <el-card>
            <div slot="header">
              <span>磁盘状态</span>
            </div>
            <div class="el-table el-table--enable-row-hover el-table--medium">
              <table cellspacing="0" style="width: 100%">
                <thead>
                  <tr>
                    <th class="el-table__cell el-table__cell is-leaf">
                      <div class="cell">盘符路径</div>
                    </th>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">文件系统</div>
                    </th>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">盘符类型</div>
                    </th>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">总大小</div>
                    </th>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">可用大小</div>
                    </th>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">已用大小</div>
                    </th>
                    <th class="el-table__cell is-leaf">
                      <div class="cell">已用百分比</div>
                    </th>
                  </tr>
                </thead>
                <tbody v-if="server.sysFiles">
                  <tr v-for="(sysFile, index) in server.sysFiles" :key="index">
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ sysFile.dirName }}</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ sysFile.sysTypeName }}</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ sysFile.typeName }}</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ sysFile.total }}</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ sysFile.free }}</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ sysFile.used }}</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell" :class="{ 'text-danger': sysFile.usage > 80 }">
                        {{ sysFile.usage }}%
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import MyIndexlist from "@/components/IndexList/index";
import { getServer, getStatisticsI } from "@/api/monitor/server";

export default {
  name: "Server",
  components: {
    "my-indexlist": MyIndexlist,
  },
  data () {
    return {
      loading: false,
      serverNum: "",
      projectNum: "",
      apiNum: "",
      // 服务器信息
      server: [],
    };
  },
  watch: {
    $route () {
      this.$router.go()
    }
  },

  created () {
    this.loading = true;
    // this.openLoading();
    this.getStatistics();
    this.getList();
  },

  methods: {
    projecBtn () {
      this.$router.push({ path: '/systemInfo/monitor' });
    },
    projecBtn () {
      this.$router.push({ path: '/systemInfo/project' });
    },
    apiBtn () {
      this.$router.push({ path: '/systemInfo/api' });
    },
    goData () {
      this.$router.push({ path: '/data' });
    },
    getStatistics () {
      getStatisticsI().then((res) => {
        this.apiNum = res.data.apiNum;
        this.projectNum = res.data.projectNum;
        this.serverNum = res.data.serverNum;
      });
    },
    /** 查询服务器信息 */
    getList () {
      //  this.$modal.closeLoading();
      this.loading = true;
      getServer().then((response) => {
        this.server = response.data;
        this.loading = false;
      });
    },
    // 打开加载层
    openLoading () {
      this.$modal.loading("正在加载服务监控数据，请稍候！");
    },
  },
};
</script>
<style scoped>
/* @import url(); 引入公共css类 */
.container {
  padding-top: 25px;
  width: 100%;
}

.pic-i {
  position: absolute;
  /* width: 80%;
  height: 80%; */
  /* background-color: #fff; */
  top: 55%;
  left: 48%;
  transform: translateY(-50%) translateX(-50%);
}

.writing {
  /* width: 50px; */
  padding-left: 12%;
  border-left: 1px dashed #eee;
  height: 55px;
  /* position: absolute; */
  /* background-color: #f23; */
  position: absolute;
  margin: auto;
  top: 0;
  left: 50%;
  bottom: 0;
  /* margin-left: 40px; */
}
.writing div {
  width: 200px;
}

.pic-3 {
  border: 3px solid #eeeeee;
  border-radius: 50%;
  position: relative;
  width: 60px;
  height: 60px;
  background-image: linear-gradient(rgb(5, 135, 211), rgb(0, 247, 255));
  position: absolute;
  margin: auto;
  top: 0;
  left: 20%;
  bottom: 0;
}

.pic-4 {
  border: 3px solid #eeeeee;
  border-radius: 50%;
  position: relative;
  width: 60px;
  height: 60px;
  background-image: linear-gradient(rgb(8, 150, 245), rgb(0, 238, 255));
  position: absolute;
  margin: auto;
  top: 0;
  left: 20%;
  bottom: 0;
}

.pic-5 {
  border: 3px solid #eeeeee;
  border-radius: 50%;
  position: relative;
  width: 60px;
  height: 60px;
  background-image: linear-gradient(rgb(11, 150, 92), rgb(12, 248, 158));
  position: absolute;
  margin: auto;
  top: 0;
  left: 20%;
  bottom: 0;
}

.pic-2 {
  border: 3px solid #eeeeee;
  border-radius: 50%;
  position: relative;
  width: 60px;
  height: 60px;
  background-image: linear-gradient(rgb(8, 31, 245), rgb(0, 238, 255));
  position: absolute;
  margin: auto;
  top: 0;
  left: 20%;
  bottom: 0;
}

.pic {
  border: 3px solid #eeeeee;
  border-radius: 50%;
  position: relative;
  width: 60px;
  height: 60px;
  background-image: linear-gradient(rgb(0, 174, 255), rgb(12, 181, 248));
  position: absolute;
  margin: auto;
  top: 0;
  left: 20%;
  bottom: 0;
}

.headerview {
  border: 1px solid #e6ebf5;
  position: relative;
  width: 45%;
  height: 100%;
  background-color: #fff;
  border-radius: 5px;
  margin: 0 20px 0 20px;

  display: flex;
  justify-content: space-evenly;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.headerview:first-child {
  margin-left: 0;
}

.headerview:nth-last-child(1) {
  margin-right: 0;
}

.headerDiv {
  display: flex;
  margin-left: 17px;
  justify-content: center;
  width: 99%;
  height: 100px;
  /* background-color: #fff; */
  top: 70px;

  /* position: absolute; */
  /* left: 50%; */
  /* transform: translateY(-50%) translateX(-50%); */
  /* border-radius: 10px; */
}

.content {
  /* background-color: #eeeeee; */
  /* height: 900px; */
  position: relative;
  padding: 20px;
}

.wet-1 {
  width: 100px;
  text-align: center;
  font-size: 30px;
  /* padding-left: 10px; */
}

.wet-2 {
  font-size: 18px;
  width: 100px;
  text-align: center;
  /* padding-left: 15px; */
  /* background-color: rgba(255, 255, 255, 0.8); */
}

.wet-3 {
  font-size: 10px;
  padding-left: 15px;
}


.btn {
  float: right;
  border: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  width: 100px;
  height: 30px;
  border-radius: 5px;
  background: linear-gradient(90deg, #03a9f4, #41f4dc, #dbefe9, #03a9f4);
  background-size: 400%;
  cursor: pointer;
  position: relative;
  z-index: 10;
  font-size: 17px;
}

.btn:before {
  animation: sun 8s infinite;
}

.btn::before {
  content: "";
  position: absolute;
  top: 5px;
  left: 6px;
  bottom: 5px;
  right: 6px;
  background: linear-gradient(90deg, #03a9f4, #41f4dc, #dbefe9, #03a9f4);
  background-size: 400%;
  border-radius: 5px;
  filter: blur(8px);
  z-index: -1;
}

.btn:hover::before {
  animation: sun 3s infinite;
}

/* c3动画更改背景位置 */
@keyframes sun {
  100% {
    background-position: -400% 0;
  }
}

@-ms-keyframes sun {
  100% {
    background-position: -400% 0;
  }
}

@-webkit-keyframes sun {
  100% {
    background-position: -400% 0;
  }
}
</style>
