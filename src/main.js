import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Vue from 'vue'

import '@fontsource/noto-sans-sc/100.css';
import '@fontsource/noto-sans-sc/200.css';
import '@fontsource/noto-sans-sc/300.css';
import '@fontsource/noto-sans-sc/400.css';
import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/600.css';
import '@fontsource/noto-sans-sc/700.css';
import '@fontsource/noto-sans-sc/800.css';
import '@fontsource/noto-sans-sc/900.css';

import Cookies from 'js-cookie'

import Element from 'element-ui'
import './assets/styles/element-variables.scss'

import '@/assets/styles/index.scss' // global css
import '@/assets/styles/ruoyi.scss' // ruoyi css
import 'regenerator-runtime/runtime'
import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

import './assets/icons' // icon
import './permission' // permission control
import { getDicts } from "@/api/system/dict/data";
import { getConfigKey } from "@/api/system/config";
import { parseTime, resetForm, addDateRange, selectDictLabel, selectDictLabels, handleTree } from "@/utils/ruoyi";
// 分页组件
import Pagination from "@/components/Pagination";
// 自定义表格工具组件
import RightToolbar from "@/components/RightToolbar"
// 富文本组件
import Editor from "@/components/Editor"
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 字典标签组件
import DictTag from '@/components/DictTag'
// 头部标签组件
import VueMeta from 'vue-meta'
// 字典数据组件
import DictData from '@/components/DictData'

// 动态导入 components 目录下的所有 .vue 文件
const requireComponent = require.context(
  '@/components', // 组件目录
  true,           // 是否递归查找子目录
  /\.vue$/        // 匹配 .vue 文件
);

requireComponent.keys().forEach(fileName => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName);

  // 获取组件名（去除文件扩展名和路径）
  const componentName = fileName
    .split('/')
    .pop()
    .replace(/\.\w+$/, '');
  // 注册全局组件
  Vue.component(
    componentName,
    componentConfig.default || componentConfig
  );
});


import * as echarts from 'echarts';
Vue.prototype.$echarts = echarts;


// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.handleTree = handleTree
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

// 全局组件挂载
Vue.component('DictTag', DictTag)
Vue.component('Pagination', Pagination)
Vue.component('RightToolbar', RightToolbar)
Vue.component('Editor', Editor)
Vue.component('FileUpload', FileUpload)
Vue.component('ImageUpload', ImageUpload)
Vue.component('ImagePreview', ImagePreview)

Vue.use(directive)
Vue.use(plugins)
Vue.use(VueMeta)
DictData.install()
// 判断配置文件是否要引入mock
process.env.VUE_APP_MOCK == "true" && require('../mock/index')
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.config.errorHandler = (err, vm, info) => {
  if (err.message.includes('[ElementForm]unpected width')) {
    return; // 忽略此错误    可能在弹窗关闭时触发了表单的销毁逻辑，但某些布局计算仍在进行。
  }
  console.error(err); // 其他错误正常输出
};

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
