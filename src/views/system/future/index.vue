<template>
    <div v-if="showPlaceholder">
        <h1 class="page-placeholder__title">敬请期待</h1>
    <!-- <p class="page-placeholder__text">我们正在努力开发中，请稍后再来访问该页面。</p> -->
    </div>
    <div v-else>
      <router-view></router-view>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PagePlaceholder',
    data() {
      return {
        showPlaceholder: true
      };
    },
    mounted() {
      // 后端接口获取开发状态，根据需要决定是否展示页面
      this.checkDevelopmentStatus();
    },
    methods: {
      checkDevelopmentStatus() {
        // 这里可以发起后端接口请求，获取该页面的开发状态
        // 如果正在开发中，不展示页面，而是展示占位符
        // 如果已经开发完成，展示正常的页面内容
        // 这里只是一个示例，返回一个假的开发状态
        const isUnderDevelopment = true; 
        this.showPlaceholder = isUnderDevelopment;
      }
    }
  };
  </script>
  <style>
.page-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f7f7f7;
  font-family: sans-serif;
}

.page-placeholder__title {
   margin-top: 10%;
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
}

.page-placeholder__text {
  font-size: 1.5rem;
  color: #666;
}
</style>
