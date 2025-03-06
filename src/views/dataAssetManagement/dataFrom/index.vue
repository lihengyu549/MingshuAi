<template>
    <div class="app-container">
      数据源
    </div>
  </template>
  
  <script>
  import { treeselect as menuTreeselect, roleMenuTreeselect } from "@/api/system/menu";
  
  export default {
    name: "matchingStrategy",
    dicts: ['sys_normal_disable'],
    data() {
        return {

        };
    },
    created() {
    },
    methods: {
    }
  };
  </script>