<template>
  <el-drawer v-bind="$attrs" v-on="$listeners" :title="title" :visible="visible" direction="rtl" :size="size" :wrapper-closable="false">
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
/deep/ .el-drawer {
  border-radius: 10px;
}
/* 可根据需求自定义样式 */
/deep/.el-drawer__header {
  padding-bottom: 20px;
  margin-bottom: 0;
  border-bottom: 1px solid #e4e7ed;
}

/deep/.el-drawer__header> :first-child {
  font-size: 18px;
  color: black;
  font-weight: bold;
}

/deep/.el-drawer__body {
  padding: 20px;
}
/deep/.el-form-item__content {
  padding-right: 15px;
}
</style>