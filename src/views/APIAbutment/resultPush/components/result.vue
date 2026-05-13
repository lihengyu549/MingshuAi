<template>
  <div v-loading="loading">
    <div class="mainBox">
      <div class="leftBox">
        <div class="leftBox_header">{{ $t('resultPush.available') }}</div>
        <div class="leftBox_body">
          <el-tree
            ref="resultTree"
            :props="defaultProps"
            :data="treeData"
            show-checkbox
            node-key="id"
            @check="handleCheckChange"
          />
        </div>
      </div>
      <div class="rightBox">
        <div class="rightBox_header">
          <span>{{ $t('resultPush.selectedCount', { count: lastChildList.length }) }}</span>
          <span class="reset" @click="emptyFn">{{ $t('clean') }}</span>
        </div>
        <div class="rightBox_body">
          <div v-for="(item, index) in lastChildList" :key="item.id" class="childList">
            <span>{{ item.categoryName }}</span>
            <i class="el-icon-error" @click="deleteChildFn(item, index)"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "resultPushResult",
  props: {
    treeData: {
      type: Array,
      default: () => [],
    },
    checkList: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      loading: false,
      defaultProps: {
        label: 'categoryName',
        children: 'children',
        disabled: this.checkNodeDisabled
      },
      lastChildList: [],
    }
  },
  mounted() {
    if (this.checkList && this.checkList.length) {
      this.$refs.resultTree.setCheckedKeys(this.checkList, true)
      this.lastChildList = this.$refs.resultTree.getCheckedNodes().filter(item => !item.children || item.children.length === 0)
    }
  },
  methods: {
    checkNodeDisabled(data, node) {
      // isChecked 为 '0' 或者 0 或者 false 时，视为不可选；否则可选
      if (data.isChecked === '0' || data.isChecked === 0 || data.isChecked === false) {
        return true
      }
      return false
    },
    handleCheckChange(arrData, treeData) {
      this.lastChildList = treeData.checkedNodes.filter(item => !item.children || item.children.length === 0)
    },
    deleteChildFn(row, index) {
      this.$refs.resultTree.setChecked(row.id, false)
      this.lastChildList.splice(index, 1)
    },
    emptyFn() {
      this.lastChildList = []
      this.$refs.resultTree.setCheckedKeys(this.treeData, false)
    }
  }
};
</script>

<style scoped lang="scss">
.mainBox {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .leftBox {
    flex: 1;
    margin-right: 20px;

    .leftBox_header {
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 10px;
    }

    .leftBox_body {
      border: 1px solid #ccc;
      height: 500px;
      overflow-y: auto;
    }
  }

  .rightBox {
    width: 35%;

    .rightBox_header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 10px;

      .reset {
        color: #0600ff;
      }
    }

    .rightBox_body {
      height: 500px;
      border: 1px solid #c4c4c4;
      overflow-y: auto;
      padding: 10px;
    }
  }
}

.rightBox_body :v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.rightBox_body :v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.rightBox_body :v-deep .el-table__body-wrapper::-webkit-scrollbar-track {
  border-radius: 10px;
}

.leftBox_body :v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.leftBox_body :v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.leftBox_body :v-deep .el-table__body-wrapper::-webkit-scrollbar-track {
  border-radius: 10px;
}

.childList {
  border: 1px solid #ccc;
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .el-icon-error {
    font-size: 18px;
  }
}

.childList + .childList {
  margin-top: 10px;
}
</style>
