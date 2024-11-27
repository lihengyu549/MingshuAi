<template>
  <div class='content'>
    <h4 class="tit_div">产品信息</h4>
    <hr style="border: 1px solid #F5F5F5; ">
    <div style="margin-bottom: 20px;">
      <div class="title_txt">
        <p class="text" style=" ">产品名称</p>
        <span style="color:#545454 ;">DSM数据安全地图</span>
      </div>

      <!-- <div class="title_txt">
        <p class="text">产品型号</p>
        <span style="color:#545454 ;">高级版</span>
      </div> -->
      <div class="title_txt">
        <p class="text">系统版本</p>
        <span style="color:#545454 ;">V6.8</span>
      </div>
    </div>
    <hr style="border: 1px solid #F5F5F5  ; ">
    <h4 class="tit_div">许可证信息</h4>
    <hr style="border: 1px solid #F5F5F5  ; ">
    <div style="margin-bottom: 30px;">
      <div class="title_txt">
        <p class="text">被授权单位</p>
        <span style="color:#545454 ;">{{ unit }}</span>
      </div>
      <div class="title_txt">
        <p class="text">证书状态</p>
        <span style="color:#545454 ;">{{ certificate }}</span>
      </div>
      <div class="title_txt">
        <p class="text">授权时间</p>
        <span style="color:#545454 ;">{{ satrtTiem }} 起</span> ——
        <span style="color:#545454 ;">{{ endTiem }} 止</span>

      </div>

      <!-- <div class="title_txt">
        <p class="text">授权升级时间</p>
        <span style="color:#545454 ;">-</span>
      </div>

      <div class="title_txt">
        <p class="text">授权升级版本</p>
        <span style="color:#545454 ;">-</span>
      </div> -->

      <div class="title_txt" style="display: flex; ">
        <p class="text">当前机器码</p>
        <span class="title_txt1">
          <div class="txt_jiqi" style="">{{ machineNum }}</div>
          <a style="color: #349dff;height: 25px; " @click="outerBtn">复制</a>
        </span>
      </div>

      <div class="title_txt">
        <p class="text">授权功能</p>
        <span style="color:#545454 ; margin-right: 10px;">API安全管理平台</span>
        <span style="color:#545454 ;">敏感数据治理平台</span>
        <!-- <br>
        <span style="color:#545454 ;margin-left: 247px;">敏感数据治理平台</span> -->
      </div>
      <hr style="border: 1px solid #F5F5F5  ; margin-top: 30px; ">
      <!-- <div class="title_txt">
        <p class="text">授权扫描</p>
        <span style="color:#545454 ;">基 Web 洞扫描</span>
        <br>
        <span style="color:#545454 ;margin-left: 247px;">基础服务漏洞扫描</span>
        <br>
        <span style="color:#545454 ;margin-left: 247px;">域名资产发现</span>
        <br>
        <span style="color:#545454 ;margin-left: 247px;">主机资产监控</span>
        <br>
        <span style="color:#545454 ;margin-left: 247px;">特定服务扫描</span>
        <br>
        <span style="color:#545454 ;margin-left: 247px;">被动Web扫描(代理)</span>
        <br>
        <span style="color:#545454 ;margin-left: 247px;">被动Web扫描(日志)</span>


      </div> -->
      <!-- <div class="title_txt">
        <p class="text">扩展管理平台授权功能</p>
        <span style="color:#545454 ;">消息达</span>
      </div> -->
      <!-- <div class="title_txt">
        <p class="text">最大并发任务数</p>
        <span style="color:#545454 ;">10</span>
      </div> -->
      <!-- <div class="title_txt">
        <p class="text">最大引擎节点数</p>
        <span style="color:#545454 ;">1</span>
      </div> -->

    </div>
    <div class="icptxt">
      <div class="tit_div" style="margin-right: 10px;">上传新许可证</div>
      <div class=" upload_calss">
        <el-upload :action="upload.url" :name="'license'" :headers="upload.headers" ref="upload" :auto-upload="false"
          :multiple="true" :limit="1" :on-exceed="handleExceed" :on-success="handleSuccess" :before-upload="beforeUpload"
          :file-list="fileList" drag>
          <i>
            <svg-icon class="filePic" slot="prefix" icon-class="file" />
          </i>
          <!-- <el-button size="small" type="primary">点击上传</el-button> -->
          <div>点击或将文件拖拽到这里上传</div>
          <div class="el-upload__text">文件大小不超过 500kb</div>
        </el-upload>
        <el-button style="float: right;" @click="submitUpload" size="small" type="primary">点击上传</el-button>
      </div>
    </div>
    <h4 class="tit_div">技术支持</h4>
    <hr style="border: 1px solid #F5F5F5  ; ">
    <div>
      <div class="title_txt">
        <p class="text">技术支持邮箱</p>
        <span style="color:#545454 ; margin-right: 20px;">liuy@4star.net.cn</span>
      </div>
      <div class="title_txt">
        <p class="text">技术支持电话</p>
        <span style="color:#545454 ; margin-right: 20px;">010-64927864</span>
      </div>
    </div>
    <!-- <div > -->

  </div>
</template>
<script>
import { getToken } from "@/utils/auth";
import { licenseVerifyI } from "@/api/system/systemInformation"
export default {
  name: '',
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data () {
    return {
      machineNum: '',
      upload: {
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/license/set",
      },
      satrtTiem: "",
      endTiem: "",
      certificate: '',
      unit: '',
      fileList: []
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    outerBtn () {
      // alert("复制按钮");
      const input = document.createElement("input"); // 创建input对象
      const testDiv = document.querySelector(".txt_jiqi"); // 获取需要复制文字的容器
      input.value = testDiv.innerText; // 设置复制内容
      document.body.appendChild(input); // 添加临时实例
      input.select(); // 选择实例内容
      document.execCommand("Copy"); // 执行复制
      document.body.removeChild(input); // 删除临时实例
      this.$message.success("复制成功！");
    },
    licenseVerify () {
      licenseVerifyI().then((res => {
        if (res.data.verify == true) {
          this.certificate = "可用"
        } else {
          this.certificate = "过期"
        }
        this.machineNum = res.data.code
        this.endTiem = res.data.expiry
        this.satrtTiem = res.data.start
        this.unit = res.data.company
      }))
    },
    submitUpload () {
      this.$refs.upload.submit();
    },
    handleExceed (files, fileList) {
      // this.$message.warning(`只能上传1个文件。`)
      this.$set(fileList[0], "raw", files[0]);
      this.$set(fileList[0], "name", files[0].name);
      this.$refs["upload"].clearFiles(); //清除文件
      this.$refs["upload"].handleStart(files[0]); //选择文件后的赋值方法
    },
    handleSuccess (res, file, fileList) {
      if (res.code == 200) {
        licenseVerifyI().then((res => {
          if (res.data.verify == true) {
            this.$message.success('文件上传成功。')
            location.reload();
          } else {
            this.$message.error('文件已过期,请重新上传')
            // location.reload();
          }
        }))
        // this.$message.success('文件上传成功。')
        // this.$router.push({ path: '/index' });

      } else {
        this.$message.error('上传文件失败。')
      }
    },
    beforeUpload (file) {
      // const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt500k = file.size / 1024 < 500
      // if (!isJPG) {
      //   this.$message.error('只能上传jpg/png文件。')
      // }
      if (!isLt500k) {
        this.$message.error('上传文件大小不能超过500kb。')
      }
      return isLt500k
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created () {
    this.licenseVerify()
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted () { },
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
.filePic {
  margin-top: 30px;
  font-size: 40px;
  margin-bottom: 20px;
}

.upload_calss /deep/ .el-upload-dragger {
  width: 600px;
  background-color: #fafafa;
  /* margin-top: 30px; */
}

.icptxt {
  display: flex;
}

.title_txt1 {
  display: flex;
  justify-content: center;
  /* width: 400px; */
  /* margin-left: 225px; */
  border: 1px solid #F5F5F5;
  padding: 5px;
  margin-top: 30px;
}

.txt_jiqi {
  color: #545454;
  margin-right: 20px;
  display: inline-block;
  width: 550px;
  word-wrap: break-word;
  text-align: left;
}

.text {
  /* font-size: 14px; */
  font-weight: 500;
  margin-right: 10px;
  /* padding-right: 80px; */
  color: #000;
  display: inline-block;
  /* width: 250px; */
  margin-bottom: 0;

}

.title_txt {
  margin-top: 10px;
}

.content {
  position: relative;
  padding: 20px;
  padding-left: 40px;
}

.tit_div {
  font-size: 18px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.65);
}

/* @import url(); 引入公共css类 */
</style>
