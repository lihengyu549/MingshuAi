<template>
  <div id="app">
    <router-view />
    <theme-picker />
  </div>
</template>

<script>
import ThemePicker from "@/components/ThemePicker";
import { getInterfaceDesignById } from "@/api/system/menu";
export default {
  name: "App",
  components: { ThemePicker },
  metaInfo () {
    return {
      title: this.$store.state.settings.dynamicTitle && this.$store.state.settings.title,
      titleTemplate: title => {
        return title ? `${title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE
      }
    }
  },
  created() {
  },
  mounted() { 
    this.getInterfaceDesignByIdFn()
  },
  methods: { 
    getInterfaceDesignByIdFn(){
      getInterfaceDesignById().then(res => {
        let facvionEl = document.getElementById('facicon')
        if(res.data.img && !res.data.img.includes('null')){
          res.data.img = window.location.origin + '/' + res.data.img
        }else{
          res.data.img = '/docs/logo.svg'
        }
        facvionEl.href = res.data.img //动态浏览器图标
        document.title = res.data.projectName
        this.$store.commit('SET_PROJECT', res.data);
      })
    } 
  } 
};
</script>
<style scoped>
#app .theme-picker {
  display: none;
}
</style>
