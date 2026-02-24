<template>
  <div class="title">
    <div class="basic-info-title">
      <svg-icon v-if="iconClass != ''" :icon-class="iconClass"></svg-icon>
      {{ label }}
      <slot></slot>
    </div>
    <!-- <el-divider style="margin: 10px 0;"></el-divider> -->
  </div>

</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '基本信息'
    },
    iconClass: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      label: this.title
    }
  }

}
</script>

<style scoped>
.title {
  margin: 20px 0;
}

.basic-info-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.basic-info-title::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  margin-right: 10px;
  vertical-align: inherit;
  border-radius: 2px;
}

.el-divider--horizontal {
  margin: 10px 0;
  height: 3px;
}

.el-divider--horizontal::before {
  content: "";
  /* 伪元素必须设置content属性 */
  position: absolute;
  /* 设置定位使top/left生效 */
  top: 0;
  left: 0;
  height: 3px;
  width: 10%;
  background-color: #009dff;
}
</style>