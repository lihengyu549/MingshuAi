<template>
  <div class="app-container">
    <el-card class="card-box" v-loading="cardLoading">
      <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>LOGO设计</span>
        </h4>
        <div class="contBox">
          <el-form :model="formData" ref="formData" class="formDataClass" size="small" label-width="auto">
            <el-form-item label="产品标题" prop="appTitle">
              <el-input v-model="formData.appTitle" placeholder="请输入产品标题" clearable />
            </el-form-item>
            <el-form-item label="产品LOGO" prop="appFacvion">
              <el-upload class="upload-demo" action="" :on-remove="handleRemove" :file-list="fileList" ref="uploadRef"
                list-type="picture" :multiple="false" :limit="1" :on-change="handleFileChange"
                :on-exceed="handleFileExceed" accept=".jpg,.jpeg,.png,.JPG,.JPEG,.PNG,.ico" :auto-upload="false"
                :http-request="submit">
                <el-button size="small" type="primary" plain>点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>主题设计</span>
        </h4>
        <div class="contBox">
          <el-form :model="colorForm" ref="colorForm" class="formDataClass" size="small" label-width="auto">
            <el-form-item label="颜色选择" prop="color">
              <el-color-picker v-model="colorForm.color" @change="changeColor" show-alpha :predefine="predefineColors">
              </el-color-picker>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div>
        <h4 class="title">
          <div class="blue-circle"></div><span>技术支持</span>
        </h4>
        <div class="contBox">
          <el-form :model="technologyData" ref="technologyData" class="formDataClass" size="small" label-width="auto">
            <el-form-item label="邮箱地址" prop="email">
              <el-input v-model="technologyData.email" placeholder="请输入邮箱地址" clearable />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="technologyData.phone" placeholder="请输入联系电话" clearable />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="foot_btn">
        <el-button type="primary" plain @click="submit">确 定</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { updateInterfaceDesign } from "@/api/system/menu";
import store from '@/store'
import { getInterfaceDesignById } from "@/api/system/menu";
export default {
  name: "sysDesign",
  // dicts: ['sys_normal_disable'],
  data() {
    return {
      cardLoading: false,
      formData: {
        appTitle: '',
      },
      colorForm: {
        color: ''
      },
      technologyData: {
        email: '',
        phone: '',
      },
      fileList: [
        // { name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100' },
      ],
      color: 'rgba(255, 69, 0, 0.68)',
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577'
      ]
    };
  },
  created() {
    if (this.$store.state.user.projectData.id) {
      this.formData.appTitle = this.$store.state.user.projectData.projectName
      this.fileList = [{ name: this.$store.state.user.projectData.imgName || '项目图标', url: this.$store.state.user.projectData.img }]
      this.colorForm.color = this.$store.state.user.projectData.themeColor
      this.technologyData.email = this.$store.state.user.projectData.email
      this.technologyData.phone = this.$store.state.user.projectData.phone
    }

  },
  methods: {
    handleRemove(file, fileList) {
    },
    submit() {
      store.dispatch('settings/setBgcColor', 'red')
      const formData = new FormData();
      formData.append('file', this.fileList.length ? this.fileList[0].raw : null);
      formData.append('file', this.fileList.length ? this.fileList[0].name : '项目图标');
      formData.append('id', 1);
      formData.append('projectName', this.formData.appTitle);
      formData.append('themeColor', this.colorForm.color);
      formData.append('email', this.technologyData.email);
      formData.append('phone', this.technologyData.phone);
      updateInterfaceDesign(formData).then(res => {
        if (res.code === 200) {
          this.$modal.msgSuccess(res.msg);
          getInterfaceDesignById().then(res => {
            if (res.code === 200) {
              res.data.img = window.location.origin + '/' + res.data.img
              this.$store.commit('SET_PROJECT', res.data);
            }
          })
        }
      })
    },

    handleFileExceed(files, fileList) {
      this.$refs.uploadRef.clearFiles();
      this.$nextTick(() => {
        this.$refs.uploadRef.handleStart(files[0]); // 开始上传新文件
      });
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },
    changeColor(val) {
      if (val == null) {
        this.$message.warning('颜色不可以为透明')
        this.colorForm.color = 'rgb(0, 84, 217)'
        return
      }
    }
  }
};
</script>
<style scoped lang="scss">
.app-container {
  overflow-y: auto;

  ::v-deep ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::v-deep ::-webkit-scrollbar-thumb {
    background-color: #0003;
    border-radius: 10px;
    transition: all .2s ease-in-out;
  }

  ::v-deep ::-webkit-scrollbar-track {
    border-radius: 10px;
  }
}


.title {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
  font-size: 18px;
  padding: 20px 15px;
  background-color: #ebebebc2;
}

.blue-circle {
  // width: 30px;
  // height: 30px;
  // background-color: rgb(19, 175, 247);
  // border-radius: 50%;
  // margin: 0 10px 0 20px;
}

.contBox {
  padding: 40px 20px;
}

.card-box {
  height: 810px;
  overflow-y: auto;
  position: relative;
  padding: 0;

  ::v-deep .el-card__body {
    padding: 0;
  }
}

.foot_btn {
  position: absolute;
  right: 37px;
  bottom: 24px;
}

.formDataClass {
  width: 40%;
}
</style>