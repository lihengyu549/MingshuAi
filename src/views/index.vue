<template>
  <div class="content" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.98)">
    <div class="headerview">
      <div><img src="../assets/indexImg/jiqiren-2.png" alt="" style="width: 50px;height: 50px;"></div>
      <div style="margin-top: 10px;">Hi，欢迎来到明数AI分类分级平台！</div>
      <p style="margin: 16px 0;">可持续化运营，只需4步！</p>
      <div class="card_box">
        <el-card class="box-card" v-for="item in cardList" :key="item.id">
          <div class="text item">
            <p>{{ 'Setp' + item.id }}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3>{{ item.title }}</h3>
              <el-button type="text" @click="routerPush(item)">{{ item.btnText }}</el-button>
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
            <div v-for="item in yuanList" class="yuan" @click="yuanClick(item)" :style="item.bgcColor">{{ item.text }}
            </div>
            <!-- <div class="yuan2 yuan">行标</div>
            <div class="yuan3 yuan">团标</div>
            <div class="yuan4 yuan">地标</div>
            <div class="yuan5 yuan">企标</div> -->
          </div>
          <div class="main_body_body">
            <el-table :data="tableData" :stripe="false" style="width: 100%">
              <el-table-column prop="current" label="标准类型" width="80" align="center" show-overflow-tooltip />
              <el-table-column prop="standardId" label="标准编号" width="100" align="center" show-overflow-tooltip />
              <el-table-column prop="categoryName" label="标准名称" align="center" />
              <el-table-column prop="implementTime" label="实施时间" width="120" align="center" show-overflow-tooltip />

              <el-table-column prop="dataSource" label="来源" width="80" align="center" show-overflow-tooltip />

              <el-table-column prop="industryCategory" label="行业类别" width="100" align="center" show-overflow-tooltip />

            </el-table>

          </div>
        </div>
      </div>
      <div class="main_right">
        <div class="main_head">
          <div class="line"></div>
          <div>数据库统计 TOP5</div>
        </div>
        <div class="main_body">
          <div class="main_body_head">
            <img v-for="item in yuanImgList" @click="yuanImgClick(item)" :src="item.src" class="yuanimg" alt="">
            <!-- <img src="../assets/indexImg/pgsql.png" class="yuanimg" alt="">
            <img src="../assets/indexImg/Oracle.png" class="yuanimg" alt="">
            <img src="../assets/indexImg/damengshujuku2.png" class="yuanimg" alt="">
            <img src="../assets/indexImg/ziyuan.png" class="yuanimg" alt="">
            <img src="../assets/indexImg/excel.png" class="yuanimg" alt=""> -->
          </div>
          <div class="main_body_body">
            <el-table :data="tableRightData" :stripe="false" style="width: 100%">
              <el-table-column prop="databaseType" label="数据库类型" width="100" align="center" show-overflow-tooltip />
              <el-table-column prop="targetIp" label="主机" align="center" show-overflow-tooltip />
              <el-table-column prop="targetPort" label="端口" width="100" align="center" show-overflow-tooltip />
              <el-table-column prop="databaseNum" label="数据库数量" width="120" align="center" show-overflow-tooltip />
              <el-table-column prop="tableNum" label="表数量" width="80" align="center" show-overflow-tooltip />
              <el-table-column prop="fieldCount" label="字段数量" width="100" align="center" show-overflow-tooltip />
            </el-table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import MyIndexlist from "@/components/IndexList/index";
import { getReferenceStandard, getDatabaseStatistics } from "@/api/monitor/server";

export default {
  name: "Server",
  components: {
    "my-indexlist": MyIndexlist,
  },
  data() {
    return {
      tableData: [
      ],
      yuanImgList: [
        {
          src: require('@/assets/indexImg/mysql-3.png'),
          value: 'MYSQL',
        },

        {
          src: require('@/assets/indexImg/pgsql.png'),
          value: 'POSTGRESQL'
        },

        {
          src: require('@/assets/indexImg/Oracle.png'),
          value: 'ORACLE'
        },

        {
          src: require('@/assets/indexImg/damengshujuku2.png'),
          value: 'DM'
        },

        {
          src: require('@/assets/indexImg/ziyuan.png'),
          value: 'SQL_SERVER'
        },

        {
          src: require('@/assets/indexImg/excel.png'),
          value: 'Excel'
        },
      ],
      yuanList: [
        {
          text: '国标',
          bgcColor: 'backgroundColor: #fbf4f5;',
          value: '0'
        },
        {
          text: '行标',
          bgcColor: 'backgroundColor: #e1bee7;',
          value: '1'
        },
        {
          text: '团标',
          bgcColor: 'backgroundColor:#ffe0b2;',
          value: '2'
        },
        {
          text: '地标',
          bgcColor: 'backgroundColor:#b2ebf2;',
          value: '3'
        },
        {
          text: '企标',
          bgcColor: 'backgroundColor:#b3e5fc;',
          value: '4'
        },
      ],
      tableRightData: [
      ],
      loading: false,
      serverNum: "",
      cardList: [
        {
          id: 1,
          title: '标准制订',
          msg: '参考国标/行标制订企业标准',
          btnText: '去制订',
          path: '/standard/management',
        },

        {
          id: 2,
          title: '数据源发现',
          msg: '手动/自动发现网络中不同类型数据库',
          btnText: '去发现',
          path: '/dataAssetManagement/dataAssetdiscover',
        },

        {
          id: 3,
          title: 'AI推理&审核',
          msg: 'Qwen3/Deepseek双模可选进行AI打标',
          btnText: '分类分级',
          path: '/hierarchicalTask',
        },

        {
          id: 4,
          title: 'API对接',
          msg: '赋能AI分类分级能力/推送AI分析结果',
          btnText: '快速接入',
          path: '/',
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
    this.init()
  },

  methods: {
    async init() {
      await this.getStatistics();
      await this.getList();
      this.loading = false;
    },
    yuanClick(row) {
      this.getStatistics(row.value)
    },
    yuanImgClick(row) {
      this.getList(row.value)
    },
    routerPush(item) {
      this.$router.push({ path: item.path });
    },
    goData() {
      this.$router.push({ path: '/data' });
    },
    getStatistics(type) {
      getReferenceStandard({ standardType: type ?? '' }).then((res) => {
        this.tableData = res.data.list
      });
    },
    /** 查询服务器信息 */
    getList(type) {
      getDatabaseStatistics({ databaseType: type || '' }).then((response) => {
        this.tableRightData = response.data.list;
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
.content {
  background-color: #fafafc;
}

.headerview {
  height: 380px;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1),
    /* 底部阴影 */
    0 2px 4px rgba(0, 0, 0, 0.08);
  /* 浮动效果的阴影 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* 添加过渡效果 */
}

.main_right {
  width: 47%;
  background-color: #fff;
  margin-left: 30px;
  padding: 20px 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1),
    /* 底部阴影 */
    0 2px 4px rgba(0, 0, 0, 0.08);
  /* 浮动效果的阴影 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* 添加过渡效果 */
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
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3),
    /* 右下方向的阴影 */
    -2px -2px 5px rgba(255, 255, 255, 0.7);
  /* 左上方向的阴影 */
}

.yuan:hover {
  cursor: pointer;
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
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3),
    /* 右下方向的阴影 */
    -2px -2px 5px rgba(255, 255, 255, 0.7);
  /* 左上方向的阴影 */
}

.yuanimg:hover {
  cursor: pointer;
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
