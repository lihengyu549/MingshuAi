<template>
  <div class="content">
    <el-card class="card" shadow="never">
      <template slot="header">
        <span class="title">
          {{ $t('systemInformation.productInfo') }}
        </span>
      </template>
      <div class="contBox">
        <div class="title_txt">
          <p class="text">{{ $t('systemInformation.productName') }}</p>
          <span style="color:#545454 ;">{{ $store.state.user.projectData.projectName }}</span>
        </div>
        <div class="title_txt">
          <p class="text">{{ $t('systemInformation.systemVersion') }}</p>
          <span style="color:#545454 ;">V1.0</span>
        </div>
      </div>
    </el-card>

    <el-card class="card" shadow="never">
      <template slot="header">
        <span class="title">
          {{ $t('systemInformation.licenseInfo') }}
        </span>
      </template>
      <div class="contBox">
        <div class="title_txt">
          <p class="text">{{ $t('systemInformation.authorizedUnit') }}</p>
          <span style="color:#545454 ;">{{ unit }}</span>
        </div>
        <div class="title_txt">
          <p class="text">{{ $t('systemInformation.certStatus') }}</p>
          <span style="color:#545454 ;">{{ certificate }}</span>
        </div>
        <div class="title_txt">
          <p class="text">{{ $t('systemInformation.authTime') }}</p>
          <span style="color:#545454 ;">{{ satrtTiem }} {{ $t('systemInformation.start') }}</span> ——
          <span style="color:#545454 ;">{{ endTiem }} {{ $t('systemInformation.end') }}</span>
        </div>
        <div class="title_txt">
          <p class="text">{{ $t('systemInformation.currentMachineCode') }}</p>
          <el-input v-model="machineNum" disabled class="machine-input machine-input-disabled">
            <template slot="suffix">
              <span class="copy-btn" @click="outerBtn">{{ $t('systemInformation.copy') }}</span>
            </template>
          </el-input>
        </div>
        <div class="title_txt">
          <p class="text">{{ $t('systemInformation.authFunctions') }}</p>
          <span style="color:#545454 ; margin-right: 10px;">{{ $t('systemInformation.aiDataMarking') }}</span>
        </div>
      </div>
    </el-card>

    <el-card class="card" shadow="never">
      <template slot="header">
        <span class="title">
          {{ $t('systemInformation.uploadNewLicense') }}
        </span>
      </template>
      <div class="contBox">
        <div class="icptxt">
          <div class="upload_calss">
            <el-upload :action="upload.url" :name="'license'" :headers="upload.headers" ref="upload"
              :auto-upload="false" :multiple="true" :limit="1" :on-exceed="handleExceed" :on-success="handleSuccess"
              :before-upload="beforeUpload" :file-list="fileList" drag>
              <i>
                <svg-icon class="filePic" slot="prefix" icon-class="file" />
              </i>
              <div>{{ $t('systemInformation.clickOrDrag') }}</div>
              <div class="el-upload__text">{{ $t('systemInformation.fileSizeLimit') }}</div>
              <el-button type="primary" plain @click="submitUpload" style="margin-top: 20px;">{{ $t('systemInformation.clickToUpload') }}</el-button>
            </el-upload>
          </div>
        </div>
      </div>
    </el-card>

    <!-- <el-card class="card" shadow="never">
      <template slot="header">
        <span class="title">
          {{ $t('systemInformation.techSupport') }}
        </span>
      </template>
      <div class="contBox">
        <div class="title_txt">
          <p class="text">{{ $t('systemInformation.supportEmail') }}</p>
          <span style="color:#545454 ; margin-right: 20px;">{{ $store.state.user.projectData.email || 'support@demo.com'
          }}</span>
        </div>
        <div class="title_txt">
          <p class="text">{{ $t('systemInformation.supportPhone') }}</p>
          <span style="color:#545454 ; margin-right: 20px;">{{ $store.state.user.projectData.phone || '400-000-0000'
          }}</span>
        </div>
      </div>
    </el-card> -->
  </div>
</template>
<script>
import { getToken } from "@/utils/auth";
import { licenseVerifyI } from "@/api/system/systemInformation"
export default {
  name: '',
  components: {},
  data() {
    return {
      machineNum: '',
      upload: {
        headers: { Authorization: "Bearer " + getToken() },
        url: process.env.VUE_APP_BASE_API + "/system/license/set",
      },
      satrtTiem: "",
      endTiem: "",
      certificate: '',
      unit: '',
      fileList: []
    };
  },
  computed: {},
  watch: {},
  methods: {
    outerBtn() {
      const input = document.createElement("input");
      input.value = this.machineNum;
      document.body.appendChild(input);
      input.select();
      document.execCommand("Copy");
      document.body.removeChild(input);
      this.$message.success(this.$t('systemInformation.copySuccess'));
    },
    licenseVerify() {
      licenseVerifyI().then((res => {
        if (res.data.verify == true) {
          this.certificate = this.$t('systemInformation.available')
        } else {
          this.certificate = this.$t('systemInformation.expired')
        }
        this.machineNum = res.data.code
        this.endTiem = res.data.expiry
        this.satrtTiem = res.data.start
        this.unit = res.data.company
      }))
    },
    submitUpload() {
      this.$refs.upload.submit();
    },
    handleExceed(files, fileList) {
      this.$set(fileList[0], "raw", files[0]);
      this.$set(fileList[0], "name", files[0].name);
      this.$refs["upload"].clearFiles();
      this.$refs["upload"].handleStart(files[0]);
    },
    handleSuccess(res, file, fileList) {
      if (res.code == 200) {
        licenseVerifyI().then((res => {
          if (res.data.verify == true) {
            this.$message.success(this.$t('systemInformation.uploadSuccess'))
            location.reload();
          } else {
            this.$message.error(this.$t('systemInformation.fileExpired'))
          }
        }))
      } else {
        this.$message.error(this.$t('systemInformation.uploadFailed'))
      }
    },
    beforeUpload(file) {
      const isLt500k = file.size / 1024 < 500
      if (!isLt500k) {
        this.$message.error(this.$t('systemInformation.fileSizeError'))
      }
      return isLt500k
    }
  },
  created() {
    this.licenseVerify()
  },
  mounted() { },
  beforeCreate() { },
  beforeMount() { },
  beforeUpdate() { },
  updated() { },
  beforeDestroy() { },
  destroyed() { },
  activated() { },
}
</script>
<style scoped>
.content {
  padding: 40px;
  width: 100%;
}

.card {
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 15px;

  .el-card__header {
    padding: 15px;
    border-bottom: 1px solid #e2e8f0;
  }
}

.title {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.contBox {
  padding: 10px 0;
}

.filePic {
  margin-top: 30px;
  font-size: 40px;
  margin-bottom: 20px;
}

.upload_calss /deep/ .el-upload--text {
  width: 100%;
  background-color: #fafafa;

  .el-upload-dragger {
    width: 100%;
    height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

.icptxt {
  width: 100%;
}

.text {
  font-weight: 500;
  margin: 10px 10px 10px 0;
  color: #000;
  display: inline-block;
  width: 100px;
}

.machine-input {
  width: calc(100% - 120px);
  vertical-align: middle;
  height: 50px;
}

.machine-input /deep/ .el-input__inner {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 50px;
  line-height: 50px;
  padding: 8px 15px;
  padding-right: 50px;
}

.machine-input-disabled /deep/ .el-input__inner {
  background-color: #f5f7fa;
  color: #606266;
  cursor: default;
  user-select: text;
}

.machine-input-disabled /deep/ .el-input__suffix {
  pointer-events: auto;
  cursor: pointer;
}

.copy-btn {
  color: #349dff;
  cursor: pointer;
  font-size: 14px;
  line-height: 50px;
  padding-right: 15px;
}

.copy-btn:hover {
  color: #1a7fd9;
}
</style>
