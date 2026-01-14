<template>
  <div class='content'>
    <div style="margin: 10% auto; width: 50%;  ">
      <h2>访问已被限制，请上传许可证后重新访问</h2>
      <div style="display: flex; justify-content: center;">
        <span>当前机器码:</span>
        <div class="txt_cal"> {{ machineNum }}</div>
        <a style="color: #349dff;" @click="outerBtn">一键复制</a>
      </div>
      <div style="margin-top: 30px;">
        <span class="hint">
          请复制机器码发给相关工作人员，用以申请该机器的访问许可证
        </span>
      </div>
      <div class="upload_calss">
        <el-upload :action="upload.url" :name="'license'" :headers="upload.headers" ref="upload" :auto-upload="false"
          :multiple="true" :limit="1" :on-exceed="handleExceed" :on-success="handleSuccess" :before-upload="beforeUpload"
          :file-list="fileList" drag>
          <i>
            <svg-icon class="filePic" slot="prefix" icon-class="file" />
          </i>
          <div>点击或将文件拖拽到这里上传</div>
          <div class="el-upload__text">文件大小不超过 500kb</div>
        </el-upload>
        <el-button @click="submitUpload" size="small" type="primary">点击上传</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { getToken } from "@/utils/auth";
import { licenseVerifyI } from "@/api/system/systemInformation"
import { getServerInfosI, licenseSetI } from "@/api/system/license"
import store from '@/store'
import router from '@/router'

export default {
  name: '',
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data () {
    return {
      upload: {
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/license/set",
      },
      machineNum: '',
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
      const testDiv = document.querySelector(".txt_cal"); // 获取需要复制文字的容器
      input.value = testDiv.innerText; // 设置复制内容
      document.body.appendChild(input); // 添加临时实例
      input.select(); // 选择实例内容
      document.execCommand("Copy"); // 执行复制
      document.body.removeChild(input); // 删除临时实例
      this.$message.success("复制成功！");
    },
    getServerInfos () {
      getServerInfosI().then((res => {
        this.machineNum = res.msg
      }))
    },
    submitUpload () {
      this.$refs.upload.submit();
    },
    handleExceed (files, fileList) {
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
            store.dispatch('GenerateRoutes').then(accessRoutes => {
              router.addRoutes(accessRoutes)
              this.$router.push({ path: '/index' })
            })
          } else {
            this.$message.error('文件已过期,请重新上传')
          }
        }))
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
    this.getServerInfos()
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
.txt_cal {
  /* margin-right: 2%; */
  display: inline-block;
  margin: 0 .625rem 0 .625rem;
  width: 300px;
  word-wrap: break-word;
  text-align: left;
}

.filePic {
  margin-top: 30px;
  font-size: 40px;
  margin-bottom: 20px;
}

.upload_calss /deep/.el-upload-list {
  margin-bottom: 10px;
}

.upload_calss /deep/ .el-upload {
  width: 100%;
}

.upload_calss /deep/ .el-upload-dragger {
  width: 100%;
  margin-top: 30px;
  background-color: #fafafa;

}

.hint {
  line-height: 2.5rem;
  padding: 10px;
  border: 1px solid #ffbbb7;
  border-radius: 5px;
  background-color: #fff1f0;
}

.content {
  text-align: center;
}

/* @import url(); 引入公共css类 */
</style>
