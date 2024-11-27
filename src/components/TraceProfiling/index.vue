<template>
  <div class="content">
    <div class="tab-layout">
      <div class="header">
        <a href="">eBPF Profiling support services written in C, C++, Golang, and Rust.
          SkyWalking Rover provides this profiling capability</a>
      </div>

      <div class="body" tabIndex="1">
        <div class="flex-h">
          <span class="grey">端点名称:</span>
          <div class="inp">
            <el-input size="mini" style="width: 250px; height: 15px" v-model="input"></el-input>
          </div>
          <div class="search-btn">
            <el-button type="primary" style="width: 48px; height: 24px; line-height: 5px; padding: 1px">搜索</el-button>

            <el-button style="width: 72px; height: 24px; line-height: 5px; padding: 1px">新建任务</el-button>
          </div>
        </div>

        <div class="body-content">
          <div class="list">
            <div class="profile-task-list">
              <div class="profile-t-tool">任务列表</div>

              <div class="list-l">
                <div class="ell">GET:/songs</div>
                <div class="list-icon">
                  <i><svg t="1670926480805" class="icon" viewBox="0 0 1024 1024" version="1.1"
                      xmlns="http://www.w3.org/2000/svg" p-id="1039" width="13" height="13">
                      <path d="M896 320 576 320 576 64 640 64 640 256 896 256Z" p-id="1040"></path>
                      <path
                        d="M790.992461 754.013594l186.402874 186.402874-40.72896 40.72896-186.402874-186.402874 40.72896-40.72896Z"
                        p-id="1041"></path>
                      <path
                        d="M686.592 844.8c-83.2 0-153.6-70.4-153.6-153.6s70.4-153.6 153.6-153.6 153.6 70.4 153.6 153.6C833.792 774.4 769.792 844.8 686.592 844.8zM686.592 601.6c-51.2 0-89.6 38.4-89.6 89.6s38.4 89.6 89.6 89.6 89.6-38.4 89.6-89.6S731.392 601.6 686.592 601.6z"
                        p-id="1042"></path>
                      <path
                        d="M640 1024 187.392 1024C110.592 1024 64 953.6 64 870.4L64 129.216C64 54.656 110.592 0 187.392 0l441.6 0L960 249.6 960 640l-64 0L896 275.2 609.792 64l-422.4 0C142.592 64 128 97.728 128 133.44L128 876.8C128 921.6 142.592 960 187.392 960L640 960 640 1024z"
                        p-id="1043"></path>
                      <path d="M192 192l256 0 0 64-256 0 0-64Z" p-id="1044"></path>
                      <path d="M192 320l320 0 0 64-320 0 0-64Z" p-id="1045"></path>
                      <path d="M192 448l384 0 0 64-384 0 0-64Z" p-id="1046"></path>
                    </svg></i>
                </div>

                <span class="tag"> 2022-12-12 14:30:52</span>
              </div>
            </div>

            <div class="profile-task-list">
              <div class="profile-t-tool">任务列表</div>

              <div class="list-l">
                <div class="ell-1">GET:/songs</div>
                <span class="tag">13 ms</span>
                <span class="tag-1"> 2022-12-12 14:30:52</span>
              </div>
            </div>
          </div>
          <div class="item">
            <div class="profile-trace-detail-wrapper">
              <div class="mini">
                <el-select style="width: 300px; height: 15px" size="mini" v-model="value" placeholder="请选择">
                  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>

              <div class="mini">
                <el-select size="mini" style="width: 170px; height: 15px" v-model="value" placeholder="请选择">
                  <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>

              <el-button type="primary" style="
                    width: 48px;
                    height: 24px;
                    line-height: 5px;
                    padding: 1px;
                    margin-top: 2px;
                  ">搜索</el-button>
            </div>

            <div class="trace">
              <el-table class="elTable" :data="gridData" :header-cell-style="{ height: '20px', }" :cell-style="setCellStyle">
                <el-table-column prop="date" label=" Span" width="300">
                </el-table-column>
                <el-table-column prop="name" label="Start Time" width="150">
                </el-table-column>
                <el-table-column prop="address" label="Exec(ms)" width="80">
                </el-table-column>
                <el-table-column label="Exec(%)" width="100">
                  <div class="Num">
                    <el-progress :text-inside="true" :show-text="false" :percentage="50"
                      color="rgb(191, 153, 248)"></el-progress>
                  </div>
                </el-table-column>
                <el-table-column prop="address" label="Self(ms)" width="100">
                </el-table-column>
                <el-table-column prop="address" label="API" width="120">
                </el-table-column>
                <el-table-column prop="address" label="Service" width="150">
                </el-table-column>
                <el-table-column label="Operation" width="150">

                  <span>查看</span>


                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "my-trace-profiling",
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data () {
    return {
      gridData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "20",
        },
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "20",
        },
      ],
      options: [
        {
          value: "选项1",
          label: "黄金糕",
        },
        {
          value: "选项2",
          label: "双皮奶",
        },
        {
          value: "选项3",
          label: "蚵仔煎",
        },
        {
          value: "选项4",
          label: "龙须面",
        },
        {
          value: "选项5",
          label: "北京烤鸭",
        },
      ],
      value: "",
      input: "",
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    setCellStyle ({ row, column, rowIndex, columnIndex }) {
      let that = this;
      // let columns = [0]; //想要改变列的索引
      let rowIndexs = [0];
      if (rowIndexs.indexOf(rowIndex) > -1) {
        //有出现的话就返回center
        return "color:#409eff";
      } else {
        return "text-align:left"; //没有的话就返回left
      }
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created () { },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted () { },
  beforeCreate () { }, //生命周期 - 创建之前
  beforeMount () { }, //生命周期 - 挂载之前
  beforeUpdate () { }, //生命周期 - 更新之前
  updated () { }, //生命周期 - 更新之后
  beforeDestroy () { }, //生命周期 - 销毁之前
  destroyed () { }, //生命周期 - 销毁完成
  activated () { }, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style scoped>
.mini {
  margin-right: 10px;
}

.profile-trace-detail-wrapper {
  display: flex;
  padding: 5px 0 5px 5px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 40px;
}

.tag-1 {
  color: #a7aebb;
  position: absolute;
  left: 50px;
  top: 25px;
  padding-right: 5px;
  padding-left: 5px;
}

.ell-1 {
  font-size: 12px;
  padding: 5px;
  color: #409eff;
}

.profile-task-list {
  height: 400px;
}

.list-icon {
  position: absolute;
  right: 10px;
  top: 10px;
}

.tag {
  color: #a7aebb;
  position: absolute;
  left: 0px;
  top: 25px;
  padding-right: 5px;
  padding-left: 5px;
}

.ell {
  font-size: 12px;
  padding: 5px;
}

.list-l {
  border-bottom: 1px solid #ededed;
  margin-bottom: 2px;
  position: relative;
  border-radius: 3px;
  color: #2c3e50;
  width: 297px;
  height: 50px;
  background-color: #fff;
  margin-left: 2px;
}

.profile-t-tool {
  padding: 5px 10px;
  font-weight: 700;
  border-right: 1px solid rgba(0, 0, 0, 0.07);
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  background: #f3f4f9;
}

.item {
  width: 100%;
  height: 100%;
  /* background-color: rgb(9, 165, 226); */
}

.list {
  width: 300px;
  height: 100%;
}

.body-content {
  height: 100%;
  display: flex;
  /* justify-content: center; */
}

.inp {
  margin-right: 15px;
}

.flex-h {
  line-height: 25px;
  padding: 10px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  flex-direction: row;
}

.grey {
  color: #a7aebb;
  margin-right: 5px;
}

.body:focus {
  border: 1px solid #409eff;
}

.body {
  transform: translate3d(3px, 10px, 0px);
  width: 99.7%;
  /* margin-right: 5px; */
  height: 910px;
  margin-bottom: 15px;
  border-radius: 5px;
  /* background-color: rgb(24, 204, 228); */
}

.header {
  font-size: 14px;
  color: #fff;
  background-color: rgb(64, 158, 255);
  padding: 0 20px 0 10px;
  width: 100%;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  overflow: auto;
}

.content {
  font-size: 12px;
  color: #2c3e50;
}
</style>
