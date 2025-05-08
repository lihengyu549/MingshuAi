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
              <el-upload class="upload-demo" action="" :on-remove="handleRemove" :file-list="fileList"
                list-type="picture" :multiple="false" :limit="1" :on-change="handleFileChange"
                :on-exceed="handleFileExceed" :auto-upload="false" :http-request="submitForm">
                <el-button size="small" type="primary">点击上传</el-button>
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
              <el-color-picker v-model="colorForm.color" @change="changeColor"  show-alpha :predefine="predefineColors">
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
            <el-form-item label="邮箱地址" prop="emil">
              <el-input v-model="technologyData.emil" placeholder="请输入邮箱地址" clearable />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="technologyData.phone" placeholder="请输入联系电话" clearable />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="foot_btn">
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { treeselect as menuTreeselect, roleMenuTreeselect } from "@/api/system/menu";
import { listByTacticsQueryUrl, updateByTactics } from "@/api/system/dict/data";
import store from '@/store'
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
      technologyData:{
        emil:'',
        phone:'',
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
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    submit() {
      store.dispatch('settings/setBgcColor', 'red')
      console.log();
      
      return
      updateByTactics(this.allData).then(res => {
        if (res.code == 200) {
          this.$message({
            message: '修改成功',
            type: 'success'
          });
          this.getlistData()
        }
      })
    },

    /** 提交按钮 */
    async submitForm() {
      this.$refs["addForm"].validate(async (valid) => {
        if (valid) {
          if (!await this.getNameTestingFn()) {
            return
          }
          this.formLoading = true
          const formData = new FormData();
          if (this.form.id) {
            formData.append('id', this.form.id || '');
          }
          // 将文件数组添加到 FormData 对象中
          if (this.fileList && this.fileList.length) {
            formData.append('file', this.fileList[0].raw);
          }
          formData.append('file', this.fileList[0].raw);
          formData.append('categoryName', this.form.categoryName);
          formData.append('inner', this.form.inner || '');
          formData.append('standardId', this.form.standardId);
          formData.append('standardType', this.form.standardType);
          formData.append('implementTime', this.form.implementTime);
          formData.append('source', this.form.source);
          formData.append('industryCategory', this.form.industryCategory);
          await categoryImport(formData).then(res => {
            this.messsucc(res, '导入条目数量共');
            // this.getList();
            this.fileList = []
            this.reset()
            this.open = false
            this.gettreeOptionsList()
            this.formLoading = false
          })
            .catch((err) => {
              this.formLoading = false
            })

        }
      });
    },

    handleFileExceed(files, fileList) {
      this.$refs.uploadRef.clearFiles();
      this.$nextTick(() => {
        this.$refs.uploadRef.handleStart(files[0]); // 开始上传新文件
      });
    },
    handleFileChange(file, fileList) {
      this.form.importFile = file.name
      this.fileList = fileList;
    },
    changeColor(val){
      if(val == null) {
        this.colorForm.color = 'rgb(0, 84, 217);'
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