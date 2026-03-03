<template>
  <div class="sidebar-logo-container" :class="{ 'collapse': collapse }"
    :style="{ backgroundColor: $store.state.user.projectData.themeColor || $store.state.settings.bgcColor }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="defaultLogo" class="sidebar-logo" />
        <h1 v-else class="sidebar-title"
          :style="{ color: sideTheme === 'theme-dark' ? variables.logoTitleColor : variables.logoLightTitleColor }">{{
            title }} </h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="defaultLogo" class="sidebar-logo" />
        <div class="logo-text">
          <!-- <h1 class="sidebar-title"
            :style="{ color: sideTheme === 'theme-dark' ? variables.logoTitleColor : variables.logoLightTitleColor }">{{
              title }} </h1> -->
          <h1 class="logo-h1">DataGuard</h1>
          <span class="sidebar-title">{{ title }}</span>
        </div>
      </router-link>
    </transition>
  </div>
</template>

<script>
import logoImg from '@/assets/logo/logo.png'
import variables from '@/assets/styles/variables.scss'

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    variables() {
      return variables;
    },
    sideTheme() {
      return this.$store.state.settings.sideTheme
    },
    defaultLogo() {
      const img = this.$store.state.user.projectData.img
      return (!img.includes('null')) ? img : '/docs/logo.svg'
    }
  },
  mounted() {
  },
  data() {
    return {
      title: this.$store.state.user.projectData.projectName,
      // title: '明数Ai分类分级平台',
      logo: logoImg
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 95px;
  // line-height: 50px;
  background: #2b2f3a;
  text-align: center;
  overflow: hidden;
  padding: 24px 20px;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex !important;
    align-items: center;
    justify-content: center;

    & .sidebar-logo {
      width: 40px;
      height: 40px;
      vertical-align: middle;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-right: 10px;
    }

    & .logo-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      margin-left: 0px;
    }

    & .logo-h1 {
      margin: 0;
      font-weight: 900;
      font-size: 16px;
      line-height: 1.2;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #9ba9bd;
      font-weight: 600;
      font-size: 10px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
