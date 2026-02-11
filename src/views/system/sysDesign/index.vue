<template>
  <div class="app-container">
    <!-- LOGO设计 -->
    <el-card class="module-card" shadow="never">
      <template slot="header">
        <div class="module-title">
          <i class="el-icon-picture" style="color: #3B82F6; font-size: 20px;"></i>
          <span>LOGO设计</span>
        </div>
      </template>
      <div class="contBox">
        <el-form :model="formData" ref="formData" class="formDataClass" size="small" label-width="120px">
          <el-form-item label="产品名称" prop="appTitle">
            <el-input v-model="formData.appTitle" placeholder="数据安全预警管理中心" clearable />
          </el-form-item>
          <el-form-item label="产品LOGO" prop="appFacvion">
            <div class="upload-area">
              <div class="thumbnail-wrapper" v-if="fileList.length > 0 && fileList[0].url">
                <img :src="fileList[0].url" class="thumbnail" />
              </div>
              <el-upload class="upload-demo" action="" :on-remove="handleRemove" :file-list="fileList" ref="uploadRef"
                :show-file-list="false" :multiple="false" :limit="1" :on-change="handleFileChange"
                :on-exceed="handleFileExceed" accept=".jpg,.jpeg,.png,.JPG,.JPEG,.PNG,.ico" :auto-upload="false"
                :http-request="submit">
                <el-button size="small" type="info" icon="el-icon-upload2">点击上传</el-button>
              </el-upload>
            </div>
          </el-form-item>
          <el-form-item label="图标预览" prop="preview">
            <div class="preview-area">
              <div :class="['preview-item', themeMode === 'light' ? 'active' : '']" @click="themeMode = 'light'">
                <div class="preview-label">浅色模式</div>
                <div class="preview-box light-mode">
                  <i class="el-icon-user-solid" style="font-size: 24px; color: #3B82F6;"></i>
                </div>
              </div>
              <div :class="['preview-item', themeMode === 'dark' ? 'active' : '']" @click="themeMode = 'dark'">
                <div class="preview-label">深色模式</div>
                <div class="preview-box dark-mode">
                  <i class="el-icon-user-solid" style="font-size: 24px; color: #ffffff;"></i>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 主题设计 -->
    <el-card class="module-card" shadow="never">
      <template slot="header">
        <div class="module-title">
          <i class="el-icon-brush" style="color: #3B82F6; font-size: 20px;"></i>
          <span>主题设计</span>
        </div>
      </template>
      <div class="contBox">
        <el-form :model="colorForm" ref="colorForm" class="formDataClass" size="small" label-width="120px">
          <el-form-item label="主题色" prop="color">
            <div class="color-picker-area">
              <div v-for="(color, index) in themeColors" :key="index"
                :class="['color-circle', colorForm.color === color ? 'selected' : '']"
                :style="{ backgroundColor: color }" @click="selectColor(color)"></div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 技术支持 -->
    <el-card class="module-card" shadow="never">
      <template slot="header">
        <div class="module-title">
          <i class="el-icon-phone" style="color: #3B82F6; font-size: 20px;"></i>
          <span>技术支持</span>
        </div>
      </template>
      <div class="contBox">
        <el-form :model="technologyData" ref="technologyData" class="formDataClass" size="small" label-width="120px">
          <el-form-item label="技术支持邮箱" prop="email">
            <el-input v-model="technologyData.email" placeholder="jzhiming@qq.com" clearable />
          </el-form-item>
          <el-form-item label="技术支持电话" prop="phone">
            <el-input v-model="technologyData.phone" placeholder="18310408043" clearable />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 底部按钮 -->
    <div class="foot_btn">
      <el-button type="primary" plain @click="submit">保存配置</el-button>
    </div>
  </div>
</template>

<script>
import { updateInterfaceDesign } from "@/api/system/menu";
import store from '@/store'

export default {
  name: "sysDesign",
  data() {
    return {
      cardLoading: false,
      formData: {
        appTitle: '数据安全预警管理中心',
      },
      colorForm: {
        color: '#3B82F6'
      },
      technologyData: {
        email: 'jzhiming@qq.com',
        phone: '18310408043',
      },
      fileList: [],
      themeMode: 'light',
      themeColors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#6B7280']
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
        }
      })
    },
    handleFileExceed(files, fileList) {
      this.$refs.uploadRef.clearFiles();
      this.$nextTick(() => {
        this.$refs.uploadRef.handleStart(files[0]);
      });
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },
    selectColor(color) {
      this.colorForm.color = color;
    }
  }
};
</script>

<style scoped lang="scss">
.title {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  padding: 16px 24px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e5e7eb;

  span {
    margin-left: 10px;
  }
}

.contBox {
  padding: 32px 24px;
}

.card-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 800px;

  ::v-deep .el-card__body {
    padding: 0;
  }
}

.module-card {
  margin-bottom: 20px;
  border-radius: 10px;

  &:last-of-type {
    margin-bottom: 80px;
  }
}

.module-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  padding: 10px;

  i {
    margin-right: 8px;
  }

  span {
    font-weight: 600;
  }
}

.formDataClass {
  max-width: 600px;
}

::v-deep .formDataClass .el-form-item__label {
  text-align: left;
  padding-right: 12px;
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.thumbnail-wrapper {
  width: 50px;
  height: 50px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.thumbnail {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-area {
  display: flex;
  gap: 16px;
}

.preview-item {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s;
  background: white;

  &:hover {
    border-color: #3B82F6;
  }

  &.active {
    border-color: #3B82F6;
    background-color: #eff6ff;
  }
}

.preview-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.preview-box {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;

  &.light-mode {
    background-color: white;
    border: 1px solid #e5e7eb;
  }

  &.dark-mode {
    background-color: #1f2937;
  }
}

.color-picker-area {
  display: flex;
  gap: 12px;
}

.color-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;

  &:hover {
    transform: scale(1.1);
  }

  &.selected {
    transform: scale(1.15);
    box-shadow: 0 0 0 2px white, 0 0 0 4px #3B82F6;
  }
}

.foot_btn {
  position: absolute;
  right: 24px;
  bottom: 24px;
}
</style>