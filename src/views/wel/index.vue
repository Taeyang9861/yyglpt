<template>
  <h2>应用管理平台</h2>
</template>

<script>
  import {mapGetters} from "vuex";

  export default {
    name: "wel",
    data() {
      return {
        activeNames: ['1', '2', '3', '5'],
        logActiveNames: ['23']
      };
    },
    computed: {
      ...mapGetters(["userInfo"]),
    },
    methods: {
      handleChange(val) {
        window.console.log(val);
      }
    },
  };
</script>

<style>
  .el-font-size {
    font-size: 14px;
  }
</style>

