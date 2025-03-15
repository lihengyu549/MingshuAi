<template>
  <div class="app-container">
    扫描策略
  </div>
</template>

<script>
import { treeselect as menuTreeselect, roleMenuTreeselect } from "@/api/system/menu";
import { listDataQueryUrl } from "@/api/system/dict/data";

export default {
  name: "matchingStrategy",
  // dicts: ['sys_normal_disable'],
  data() {
      return {

      };
  },
  created() {
    this.getlistData()
  },
  methods: {
    getlistData() {
      listDataQueryUrl('sys_scan_tactics').then(res=>{
      console.log(res);
      
    })
    }
  }
};
</script>