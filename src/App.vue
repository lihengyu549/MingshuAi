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
        facvionEl.href = res.data.img
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
