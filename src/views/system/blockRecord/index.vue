<template>
  <div class='content'>
    <!-- <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
      <span style="padding-right: 10px; padding-top: 7px;">IP过滤:</span>
      <el-input class="sousuo" placeholder="请输入站点名" v-model="keyword" @keyup.enter.native="search" />
      <el-button style="margin-left: 10px;">搜索</el-button>
      <span style="margin:0  10px 0 10px; padding-top: 7px; color: #1890ff;">高级搜索</span>
    </div> -->
    <el-table v-loading="loading" class="porTal" ref="multipleTable" :data="tableData" tooltip-effect="dark"
      style="width: 100%">
      <el-table-column width="55"></el-table-column>
      <el-table-column label="开始时间" width="225" align="center">
        <template slot-scope="scope">{{ scope.row.starTime }}</template>
      </el-table-column>
      <el-table-column label="项目名称" width="120">
        <template slot-scope="scope">{{ scope.row.projectName }}</template>
      </el-table-column>
      <el-table-column label="代理网站" width="200" align="center" prop="proxySiteUrl" />
      <el-table-column label="IP" width="125" align="center" prop="ip" />
      <el-table-column label="url" width="225" align="center" prop="uri" show-overflow-tooltip />
      <!-- <el-table-column label="站点" width="400" align="center" prop="siteAlias" /> -->
      <el-table-column label="封锁原因" width="150" align="center">
        <template slot-scope="scope">{{ scope.row.blockingReason }}</template>
      </el-table-column>
      <el-table-column label="封锁时长" width="150" align="center">
        <template slot-scope="scope">{{ scope.row.blockingTime }}秒</template>
      </el-table-column>
      <el-table-column prop="" label="状态" align="center" width="150">
        <template slot-scope="scope">
          <span style="color: red;" v-if="scope.row.blockingStatus">封锁中</span>
          <span v-else>已解封</span>
        </template>
      </el-table-column>
      <el-table-column label="IP归属地" width="150" align="center" prop="ipCountry" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button @click="whiteUrlClick(scope.row.uri)" style="color: #1890ff;font-size: 14px;" size="mini"
            type="text">URL加白</el-button>
          <span style="padding:0 10px 0 10px;">|</span>
          <el-button @click="blackListClick(scope.row.ip)" style="color: #1890ff;font-size: 14px;" class="shezhi"
            size="mini" type="text">拉黑IP</el-button>
          <span style="padding:0 10px 0 10px;">|</span>
          <el-button @click="deblockingIp(scope.row.ip)" style="color: #1890ff;font-size: 14px;" class="shezhi"
            size="mini" type="text">解封IP</el-button>
          <span style="padding:0 10px 0 10px;">|</span>
          <el-button style="color: #1890ff;font-size: 14px; cursor: pointer;" class="shezhi" size="mini" type="text"
            @click="particulars(scope.row)">详情</el-button>
          <span style="padding:0 10px 0 10px;">|</span>
          <el-button style="color: #1890ff;font-size: 14px; cursor: pointer;" class="shezhi" size="mini" type="text"
            @click="HTTPCli(scope.row)">HTTP</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.page
      " :page-size.sync="queryParams.pageSize" @pagination="getList" />
    <!-- 详情 -->
    <el-dialog width="30%" title="详情" :close-on-click-modal="false" :visible.sync="particularsVisible" append-to-body>
      <div class="xiangqing">
        <div class="shijian">
          <div style="width: 50%; ">
            <span style="padding:0 30px 0 10px; font-weight: 700; ">时间</span>
            <span>{{ particularsTab.starTime }}</span>
          </div>
          <div style="width: 50%; ">
            <span style="padding:0 30px 0 10px; font-weight: 700; ">攻击IP</span>
            <a @click="blackListClick(particularsTab.ip)" style="color: #1890ff;">{{ particularsTab.ip }}</a>
          </div>
        </div>
        <div class="shijian1">
          <div style="width: 50%; ">
            <span style="padding:0 30px 0 10px; font-weight: 700; ">类型</span>
            <span>{{ particularsTab.type }}</span>
          </div>
          <div style="width: 50%; ">
            <span style="padding:0 30px 0 10px; font-weight: 700; ">过滤器</span>
            <span>{{ particularsTab.filter }}</span>
          </div>
        </div>
      </div>
      <div style="margin: 20px  0 10px 10px; font-weight: 700;">URI地址</div>
      <div class="dizhi">{{ particularsTab.uri }}</div>

      <div style="margin: 20px  0 10px 10px; font-weight: 700;">User-Agent</div>
      <div class="dizhi">{{ particularsTab.userAgent }}</div>

      <div style=" display: flex;justify-content: space-between;">
        <div style="margin: 20px  0 10px 10px; font-weight: 700;">过滤规则</div>
        <div style="margin: 20px  10px 10px 10px; font-weight: 700; color: #1890ff; cursor: pointer;"
          @click="whiteUrlClick(particularsTab.uri)">
          URL加白</div>
      </div>
      <div class="dizhi">{{ particularsTab.filterRule }}</div>

      <div style="margin: 20px  0 10px 10px; font-weight: 700;">传入值</div>
      <div class="dizhi">{{ particularsTab.incomingValue }}</div>

      <div style="margin: 20px  0 10px 10px; font-weight: 700;">风险值</div>
      <div class="dizhi">{{ particularsTab.riskValue }}</div>
    </el-dialog>

    <el-dialog title="加入URL白名单" style="margin-top: 15vh;" append-to-body :close-on-click-modal="false"
      :visible.sync="whiteVisible" width="20%">
      <div style="display: flex;">
        <i class="el-icon-question custom-icon1"></i>
        <span style="font-size: 15px;padding-left: 10px;;">加入URL白名单后此URL将不再进行防护，是否继续操作？</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="whiteVisible = false">取 消</el-button>
        <el-button type="primary" plain @click="reqWhiteList()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 黑名单 -->
    <el-dialog title="加入IP黑名单" append-to-body :close-on-click-modal="false" :visible.sync="blacklistVisible" width="20%">
      <div style="display: flex;">
        <i class="el-icon-warning-outline custom-icon1"></i>
        <span style="font-size: 15px;padding-left: 10px;">是否将 {{ blackIp }} 添加到黑名单</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="blacklistVisible = false">取 消</el-button>
        <el-button type="primary" plain @click="requireBlack(blackIp)">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="解封IP" append-to-body :close-on-click-modal="false" :visible.sync="deblockingVisible" width="20%">
      <div style="display: flex;">
        <i class="el-icon-warning-outline custom-icon1"></i>
        <span style="font-size: 15px;padding-left: 10px;">是否将 {{ lockIp }} 解封</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deblockingVisible = false">取 消</el-button>
        <el-button type="primary" plain @click="requirelockIp(lockIp)">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog width="40%" title="HTTP详情" :close-on-click-modal="false" :visible.sync="HTTPVisible" append-to-body>
      <pre class="wenben">       {{ particularsTab.httpLog }}</pre>
    </el-dialog>
  </div>
</template>
<script>
import {
  getBlockListI,
  unlockIPI,
  lockIpI,
  addWhiteUrlI,
} from "@/api/system/blockRecord";
export default {
  name: '',
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data () {
    return {
      lockIp: '',
      deblockingVisible: false,
      whiteUrl: '',
      blackIp: '',
      blacklistVisible: false,
      HTTPVisible: false,
      whiteVisible: false,
      particularsVisible: false,
      loading: false,
      total: 0,
      queryParams: {
        page: 1,
        pageSize: 10,
        ip: "",
        serachUrl: "",
        userAgent: "",
      },
      keyword: "",
      switchVal: true,
      checked: true,
      currentPage: 4,
      tableData: [],
      particularsTab: {}


    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    requirelockIp (ip) {
      let data = { ip: ip }
      unlockIPI(data).then((res => {
        if (res.code == 200) {
          this.$message({
            message: res.msg,
            duration: 3000,
            type: 'success'
          });
          this.tableData.blockingStatus = true

          this.getList()
          this.deblockingVisible = false
        } else {
          this.$message.error({
            message: res.msg,
            duration: 3000,
          });
          this.deblockingVisible = false
        }

      }))
    },
    //解封ip
    deblockingIp (ip) {
      this.lockIp = ip
      this.deblockingVisible = true

    },

    // 添加url白名单
    reqWhiteList () {
      let data = {
        url: this.whiteUrl
      }
      addWhiteUrlI(data).then((res => {
        if (res.code == 200) {
          this.$message({
            message: "已添加到白名单",
            duration: 3000,
            type: 'success'
          });
          this.whiteVisible = false

        } else {
          this.$message.error({
            message: res.msg,
            duration: 3000,
          });
        }
      }))
    },
    // 确定加入黑名单
    requireBlack (ip) {
      let data = { ip: ip }
      lockIpI(data).then((res => {
        if (res.code == 200) {
          this.$message({
            message: "已添加到黑名单",
            duration: 3000,
            type: 'success'
          });
          this.blacklistVisible = false
        } else {
          this.$message.error({
            message: res.msg,
            duration: 3000,
          });

        }

      }))


    },
    blackListClick (i) {
      this.blackIp = i
      this.blacklistVisible = true

    },
    HTTPCli (row) {
      this.particularsTab = row
      this.HTTPVisible = true
    },
    whiteUrlClick (url) {
      this.whiteUrl = url
      this.whiteVisible = true
    },
    particulars (row) {
      this.particularsTab = row

      this.particularsVisible = true

    },
    /** 查询项目列表列表 */
    getList () {
      this.loading = true;
      getBlockListI(this.queryParams).then((response) => {
        if (JSON.stringify(response.data) == "{}") {
          this.tableData = []
          this.total = 1
        } else {
          this.tableData = response.data.data;
          this.total = response.data.page.total;
        }
      });
      this.loading = false;
    },
    // 搜索
    search () {
      // console.log(`Searching for ${this.keyword}`);
      // 执行搜索操作，可以发送请求到后端获取数据
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created () {
    this.getList()
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted () {
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
.wenben {
  width: 100%;
  text-indent: -7ch;
  white-space: pre-wrap;
  background-color: #f6f6f6;
  border: 1px solid #eee;
  border-radius: 5px;
}

.custom-icon1 {
  font-size: 2em;
  color: #f89d42;
  /* 修改为你需要的颜色 */
}

.dizhi {
  width: 100%;
  line-height: 40px;
  background-color: #f6f6f6;
  border-radius: 5px;
  padding-left: 10px;
}

.shijian {
  display: flex;
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid #eee;
}

.shijian1 {
  display: flex;
  height: 40px;
  line-height: 40px;
}

.xiangqing {
  width: 100%;
  height: 80px;
  border: 1px solid #eee;
}

.sousuo {
  width: 200px;
}

.custom-icon {
  font-size: 1.25em;
  color: #f89d42;
  /* 修改为你需要的颜色 */
}

/* @import url(); 引入公共css类 */
.porTal /deep/ .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #1890ff;
  border-color: #1890ff;
}

.porTal /deep/ .el-checkbox__input.is-checked+.el-checkbox__label {
  color: #1890ff;
  /* 修改此处的颜色 */
}

.red {
  color: red;
}

.content {
  margin-top: 20px;
}
</style>
