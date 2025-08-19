<template>
  <el-drawer v-bind="$attrs" v-on="$listeners" :title="title" :visible="visible" direction="rtl" :size="size">
    <slot name="body">
    </slot>
    <slot name="footer">
    </slot>
  </el-drawer>
</template>

<script>
export default {
  name: 'Drawer',
  props: {
    // 控制抽屉显隐，父组件通过 :visible.sync 传递
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '打开抽屉'
    },
    size: {
      type: String,
      default: '40%'
    },
  },
  data() {
    return {
      label: '',
    }
  },
  methods: {
    
  }
}
</script>

<style scoped>
/* 可根据需求自定义样式 */
/deep/.el-drawer__header {
  padding-bottom: 20px;
  margin-bottom: 0;
  background-color: rgb(230, 242, 255);
}

/deep/.el-drawer__header> :first-child {
  font-size: 18px;
  color: black;
  font-weight: bold;
}

/deep/.el-drawer__body {
  padding: 40px;
}
</style>