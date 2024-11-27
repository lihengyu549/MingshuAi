<template>
  <div class="content">
    <div class="tab-layout">
      <div class="header">
        <a href=""
          >eBPF Profiling support services written in C, C++, Golang, and Rust.
          SkyWalking Rover provides this profiling capability</a
        >
      </div>

      <div class="body" tabIndex="1">
        <div class="flex-h">
          <span class="flex-p">eBPF Profiling</span>

          <div class="flex-btn">
            
            <el-button
            type="primary"
              style="width: 72px; height: 24px; line-height: 5px; padding: 1px"
              >新建任务</el-button
            >
          </div>
          

        </div>

        <div class="body-content">
          <div class="list">
            <div class="profile-task-list">
              <div class="profile-t-tool">任务列表</div>

              <div class="list-l">
                <div class="ell">GET:/songs</div>
                <span class="tag"> 2022-12-12 14:30:52</span>
              </div>
            </div>
          </div>
          
          
          <div class="item">
            <div class="profile-trace-detail-wrapper">
              <div class="mini">
                <el-select
                  style="width: 400px; height: 15px"
                  v-model="value"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>

               


              </div>

               <el-button
                type="primary"
                style="
                  width: 100px;
                  height: 24px;
                  line-height: 5px;
                  padding: 1px;
                  margin-top: 22px;
                "
                >点击选择进程</el-button
              >
              <el-button
                type="primary"
                style="
                  width: 48px;
                  height: 24px;
                  line-height: 5px;
                  padding: 1px;
                  margin-top: 22px;
                "
                >分析</el-button
              >

              

              
            </div>

            
          
          
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "my-eBPF-Profiling",
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
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
    setCellStyle({ row, column, rowIndex, columnIndex }) {
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
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style scoped>
.flex-btn{
  position: absolute;
  float: right;
  right: 20px;
  top: 0px;

}
.flex-p{
  margin: 0;
  padding-left: 10px;
}
.mini {
  margin-right: 10px;
}
.profile-trace-detail-wrapper {
  /* display: flex; */
  padding: 5px 0 5px 5px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 90px;
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
  border: 1px solid #ededed;
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
  margin-right: 4px;
  width: 300px;
  height: 96%;
  border-right: 1px solid #e5e5e5;
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
  height: 35px;
  line-height: 35px;
  border-bottom: 1px solid #dcdfe6;
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
