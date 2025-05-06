<template>
  <div class="content" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.98)">
    <div class="headerview">
      <div><img src="../assets/indexImg/jiqiren-2.png" alt="" style="width: 50px;height: 50px;"></div>
      <div style="margin-top: 10px;">Hi，欢迎来到明数AI分类分级平台！</div>
      <p>可持续化运营，只需4步！</p>
      <div class="card_box">
        <el-card class="box-card" v-for="item in cardList" :key="item.id">
          <div class="text item">
            <p>{{ 'Setp' + item.id }}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3>{{ item.title }}</h3>
              <el-button type="text">{{ item.btnText }}</el-button>
            </div>
            <span style="font-size: 12px; color: #aaaaaa;">{{ item.msg }}</span>
          </div>
        </el-card>
      </div>
    </div>
    <div class="main">
      <div class="main_left">
        <div class="main_head">
          <div class="line"></div>
          <div>参考标准</div>
        </div>
        <div class="main_body">
          <div class="main_body_head">
            <div class="yuan1 yuan">国标</div>
            <div class="yuan2 yuan">行标</div>
            <div class="yuan3 yuan">团标</div>
            <div class="yuan4 yuan">地标</div>
            <div class="yuan5 yuan">企标</div>
          </div>
          <div class="main_body_body">
            <el-table :data="tableData" :stripe="false" style="width: 100%">
              <el-table-column prop="aaa1" label="标准类型" width="80" align="center" />
              <el-table-column prop="aaa2" label="标准编号" width="100" align="center" />
              <el-table-column prop="aaa3" label="标准名称" align="center" />
              <el-table-column prop="aaa4" label="实施时间" width="120" align="center" />

              <el-table-column prop="aaa5" label="来源" width="80" align="center" />

              <el-table-column prop="aaa6" label="行业类别" width="100" align="center" />

            </el-table>

          </div>
        </div>
      </div>
      <div class="main_right">
        <div class="main_head">
          <div class="line"></div>
          <div>数据库统计 TOP3</div>
        </div>
        <div class="main_body">
          <div class="main_body_head">
            <img src="../assets/indexImg/mysql-3.png" class="yuanimg" alt="">
            <img src="../assets/indexImg/pgsql.png" class="yuanimg" alt="">
            <img src="../assets/indexImg/Oracle.png" class="yuanimg" alt="">
            <img src="../assets/indexImg/damengshujuku2.png" class="yuanimg" alt="">
            <img src="../assets/indexImg/ziyuan.png" class="yuanimg" alt="">
            <img src="../assets/indexImg/excel.png" class="yuanimg" alt="">
          </div>
          <div class="main_body_body">
            <el-table :data="tableRightData" :stripe="false" style="width: 100%">
              <el-table-column prop="aaa1" label="数据库类型" width="100" align="center" />
              <el-table-column prop="aaa3" label="主机" align="center" />
              <el-table-column prop="aaa2" label="端口" width="100" align="center" />
              <el-table-column prop="aaa4" label="数据库数量" width="120" align="center" />
              <el-table-column prop="aaa5" label="表数量" width="80" align="center" />
              <el-table-column prop="aaa6" label="字段数量" width="100" align="center" />
            </el-table>
          </div>
        </div>
      </div>
      
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
  data() {
    return {
      tableData: [
        {
          aaa1: '国标',
          aaa2: 'GB/T xxxx',
          aaa3: '《数据安全分类分级》',
          aaa4: '2024年1月1日',
          aaa5: 'xx',
          aaa6: '通用',
          aaa7: '',
          aaa8: '',
        },
        {
          aaa1: '国标',
          aaa2: 'GB/T xxxx',
          aaa3: '《数据安全分类分级》',
          aaa4: '2024年1月1日',
          aaa5: 'xx',
          aaa6: '通用',
          aaa7: '',
          aaa8: '',
        },
        {
          aaa1: '国标',
          aaa2: 'GB/T xxxx',
          aaa3: '《数据安全分类分级》',
          aaa4: '2024年1月1日',
          aaa5: 'xx',
          aaa6: '通用',
          aaa7: '',
          aaa8: '',
        },
        {
          aaa1: '国标',
          aaa2: 'GB/T xxxx',
          aaa3: '《数据安全分类分级》',
          aaa4: '2024年1月1日',
          aaa5: 'xx',
          aaa6: '通用',
          aaa7: '',
          aaa8: '',
        },
      ],
      tableRightData: [
        {
          aaa1: '国标',
          aaa2: 'GB/T xxxx',
          aaa3: '《数据安全分类分级》',
          aaa4: '2024年1月1日',
          aaa5: 'xx',
          aaa6: '通用',
          aaa7: '',
          aaa8: '',
        },
        {
          aaa1: '国标',
          aaa2: 'GB/T xxxx',
          aaa3: '《数据安全分类分级》',
          aaa4: '2024年1月1日',
          aaa5: 'xx',
          aaa6: '通用',
          aaa7: '',
          aaa8: '',
        },
        {
          aaa1: '国标',
          aaa2: 'GB/T xxxx',
          aaa3: '《数据安全分类分级》',
          aaa4: '2024年1月1日',
          aaa5: 'xx',
          aaa6: '通用',
          aaa7: '',
          aaa8: '',
        },
        {
          aaa1: '国标',
          aaa2: 'GB/T xxxx',
          aaa3: '《数据安全分类分级》',
          aaa4: '2024年1月1日',
          aaa5: 'xx',
          aaa6: '通用',
          aaa7: '',
          aaa8: '',
        },
      ],
      loading: false,
      serverNum: "",
      cardList: [
        {
          id: 1,
          title: '标准制订',
          msg: '参考国标/行标制订企业标准',
          btnText: '去制订',
        },

        {
          id: 2,
          title: '标准制订',
          msg: '参考国标/行标制订企业标准',
          btnText: '去制订',
        },

        {
          id: 3,
          title: '标准制订',
          msg: '参考国标/行标制订企业标准',
          btnText: '去制订',
        },

        {
          id: 4,
          title: '标准制订',
          msg: '参考国标/行标制订企业标准',
          btnText: '去制订',
        },

      ],
      projectNum: "",
      apiNum: "",
      // 服务器信息
      server: [],
      indexData: {},
      fieldSort: '',
    };
  },
  watch: {
    $route() {
      this.$router.go()
    }
  },

  created() {
    this.loading = true;
    // this.openLoading();
    this.getStatistics();
    this.getList();
  },

  methods: {
    projecBtn() {
      return
      this.$router.push({ path: '/systemInfo/monitor' });
    },
    projecBtn() {
      return
      this.$router.push({ path: '/systemInfo/project' });
    },
    apiBtn() {
      return
      this.$router.push({ path: '/systemInfo/api' });
    },
    goData() {
      this.$router.push({ path: '/data' });
    },
    getStatistics() {
      getStatisticsI().then((res) => {
        this.indexData = res.data
        this.apiNum = res.data.apiNum;
        this.projectNum = res.data.projectNum;
        this.serverNum = res.data.serverNum;
        let publishedFieldNum = parseFloat(res.data.publishedFieldNum) || 0
        let fieldNum = parseFloat(res.data.fieldNum) || 0
        this.fieldSort = ((publishedFieldNum / fieldNum * 100) || 0).toFixed(2)
      });
    },
    /** 查询服务器信息 */
    getList() {
      //  this.$modal.closeLoading();
      this.loading = true;
      getServer().then((response) => {
        this.server = response.data;
        this.loading = false;
      });
    },
    // 打开加载层
    openLoading() {
      this.$modal.loading("正在加载服务监控数据，请稍候！");
    },
  },
};
</script>
<style scoped>
/* @import url(); 引入公共css类 */
.content{
  background-color: #fafafc;
}
.headerview {
  height: 400px;
  margin-top: 10px;
  padding: 25px 50px 0px 50px;
}

.main {
  width: 100%;
  display: flex;
}

.main_left {
  width: 47%;
  margin-left: 30px;
  background-color: #fff;
  padding: 20px 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), /* 底部阴影 */
              0 2px 4px rgba(0, 0, 0, 0.08); /* 浮动效果的阴影 */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 添加过渡效果 */
}

.main_right {
  width: 47%;
  background-color: #fff;
  margin-left: 30px;
  padding: 20px 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), /* 底部阴影 */
              0 2px 4px rgba(0, 0, 0, 0.08); /* 浮动效果的阴影 */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 添加过渡效果 */
}

.main_head {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.main_body {
  padding: 30px 20px;
}

.main_body_head {

  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.main_body_body {
  margin-top: 20px;
}

.yuan {
  font-weight: 600;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  margin-right: 20px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3), /* 右下方向的阴影 */
  -2px -2px 5px rgba(255, 255, 255, 0.7); /* 左上方向的阴影 */
}

.yuan1 {
  background-color: #fbf4f5;
}

.yuan2 {
  background-color: #e1bee7;
}

.yuan3 {
  background-color: #ffe0b2;
}

.yuan4 {
  background-color: #b2ebf2;
}

.yuan5 {
  background-color: #b3e5fc;
}

.card_box {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
}

.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}

.box-card {
  width: 22%;
  border-radius: 15px;
}

.line {
  width: 7px;
  height: 25px;
  background-color: #2e5cf5;
  margin-right: 7px;
}

.el-table /deep/ .el-table__cell {
  background-color: #fff;

}

.yuanimg {
  font-weight: 600;
  border-radius: 50%;
  padding: 10px;
  width: 60px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  margin-right: 20px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3), /* 右下方向的阴影 */
  -2px -2px 5px rgba(255, 255, 255, 0.7); /* 左上方向的阴影 */
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
