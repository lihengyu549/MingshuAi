<template>
  <div :class="{ 'hidden': hidden }" class="pagination-container">
    <el-pagination v-bind="$attrs" v-on="$listeners" :background="background" :current-page.sync="currentPage"
      :page-size.sync="pageSize" :layout="layout" :page-sizes="pageSizes" :pager-count="pagerCount" :total="total"
      @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>
</template>

<script>
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'Pagination',
  props: {
    total: {
      required: true,
      type: Number
    },
    page: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 20
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 50]
      }
    },
    pagerCount: {
      type: Number,
      default: document.body.clientWidth < 992 ? 5 : 7
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },
  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.$emit('update:page', val)
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      if (this.currentPage * val > this.total) {
        this.currentPage = 1
      }
      this.$emit('pagination', { page: this.currentPage, pageSize: val })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleCurrentChange(val) {
      this.$emit('pagination', { page: val, pageSize: this.pageSize })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    }
  }
}
</script>

<style scoped>
.pagination-container {
  padding: 32px 16px;
  display: flex;
  justify-content: flex-end;
}

.pagination-container.hidden {
  display: none;
}

/* 页码按钮样式 */
.pagination-container /deep/ .el-pager li {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  margin: 0 4px;
  background-color: #ffffff;
  color: #606266;
  font-weight: 500;
  min-width: 32px;
  height: 32px;
  line-height: 30px;
}

.pagination-container /deep/ .el-pager li:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.pagination-container /deep/ .el-pager li.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
}

/* 上一页下一页按钮样式 */
.pagination-container /deep/ .el-pagination button {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background-color: #ffffff;
  color: #606266;
  font-weight: 500;
  height: 32px;
  min-width: 32px;
}

.pagination-container /deep/ .el-pagination button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
</style>
