<template>
  <div class="virtual-tree">
    <RecycleScroller
      class="virtual-tree-scroller"
      :items="visibleNodes"
      :item-size="rowHeight"
      key-field="key"
      :buffer="200"
      emit-update
    >
      <template #default="{ item }">
        <div
          :class="[
            'virtual-tree-row',
            { 'is-current': highlightCurrent && currentNodeKeyInner === item.key }
          ]"
          :style="{ paddingLeft: `${baseIndent + Math.max(item.level - 1, 0) * indent}px` }"
          @click="handleRowClick(item)"
        >
          <span
            class="virtual-tree-expand"
            :class="{ 'is-expanded': item.expanded, 'is-placeholder': !item.childNodes.length }"
            @click.stop="toggleExpand(item)"
          >
            <i v-if="item.childNodes.length" class="el-icon-caret-right" />
          </span>
          <el-checkbox
            v-if="shouldShowCheckbox(item)"
            v-model="item.checked"
            :indeterminate="item.indeterminate"
            :disabled="item.disabled"
            class="virtual-tree-checkbox"
            @change="handleCheckChange(item, $event)"
            @click.native.stop
          />
          <div class="virtual-tree-content">
            <TreeNodeRender
              v-if="renderContent"
              :render-content="renderContent"
              :node="item"
              :store="store"
            />
            <span v-else class="virtual-tree-label">{{ item.label }}</span>
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const TreeNodeRender = {
  name: 'TreeNodeRender',
  functional: true,
  props: {
    renderContent: {
      type: Function,
      required: true
    },
    node: {
      type: Object,
      required: true
    },
    store: {
      type: Object,
      required: true
    }
  },
  render(h, ctx) {
    return ctx.props.renderContent(h, {
      node: ctx.props.node,
      data: ctx.props.node.data,
      store: ctx.props.store
    })
  }
}

export default {
  name: 'VirtualTree',
  components: {
    RecycleScroller,
    TreeNodeRender
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    props: {
      type: Object,
      default: () => ({})
    },
    currentNodeKey: {
      type: [String, Number],
      default: ''
    },
    expandOnClickNode: {
      type: Boolean,
      default: true
    },
    filterNodeMethod: {
      type: Function,
      default: null
    },
    nodeKey: {
      type: String,
      default: 'id'
    },
    highlightCurrent: {
      type: Boolean,
      default: false
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    checkStrictly: {
      type: Boolean,
      default: false
    },
    accordion: {
      type: Boolean,
      default: false
    },
    defaultCheckedKeys: {
      type: Array,
      default: () => []
    },
    renderContent: {
      type: Function,
      default: null
    },
    checkboxVisibleMethod: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      rowHeight: 42,
      indent: 18,
      baseIndent: 8,
      filterValue: '',
      currentNodeKeyInner: this.currentNodeKey,
      store: {
        root: {
          childNodes: []
        },
        nodesMap: {}
      }
    }
  },
  computed: {
    childrenKey() {
      return this.props.children || 'children'
    },
    labelKey() {
      return this.props.label || 'label'
    },
    disabledKey() {
      return this.props.disabled || 'disabled'
    },
    visibleNodes() {
      const result = []
      const traverse = nodes => {
        nodes.forEach(node => {
          if (!node.visible) return
          result.push(node)
          const shouldShowChildren = this.filterValue ? true : node.expanded
          if (shouldShowChildren && node.childNodes.length > 0) {
            traverse(node.childNodes)
          }
        })
      }
      traverse(this.store.root.childNodes || [])
      return result
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.rebuildTree()
      }
    },
    currentNodeKey(val) {
      this.currentNodeKeyInner = val
    },
    defaultCheckedKeys() {
      this.applyDefaultCheckedKeys()
    }
  },
  created() {
    this.rebuildTree()
  },
  methods: {
    rebuildTree() {
      const previousStateMap = {}
      Object.keys(this.store.nodesMap || {}).forEach(key => {
        const node = this.store.nodesMap[key]
        previousStateMap[key] = {
          expanded: !!node.expanded,
          checked: !!node.checked,
          indeterminate: !!node.indeterminate
        }
      })

      const root = { level: 0, data: null, key: '__root__', parent: null, childNodes: [] }
      const nodesMap = {}
      const createNode = (item, level, parent) => {
        const key = item[this.nodeKey]
        const previous = previousStateMap[String(key)] || {}
        const node = {
          key,
          id: key,
          label: item[this.labelKey],
          data: item,
          level,
          parent,
          childNodes: [],
          expanded: previous.expanded || false,
          checked: previous.checked || false,
          indeterminate: previous.indeterminate || false,
          visible: true,
          disabled: !!item[this.disabledKey]
        }
        nodesMap[String(key)] = node
        const children = Array.isArray(item[this.childrenKey]) ? item[this.childrenKey] : []
        node.childNodes = children.map(child => createNode(child, level + 1, node))
        return node
      }

      root.childNodes = (this.data || []).map(item => createNode(item, 1, root))
      this.store = {
        root,
        nodesMap
      }
      this.applyDefaultCheckedKeys()
      this.filter(this.filterValue)
    },
    applyDefaultCheckedKeys() {
      if (!Array.isArray(this.defaultCheckedKeys) || this.defaultCheckedKeys.length === 0) return
      this.setCheckedKeys(this.defaultCheckedKeys)
    },
    getNode(nodeId) {
      return this.store.nodesMap[String(nodeId)] || null
    },
    setCurrentKey(nodeId) {
      this.currentNodeKeyInner = nodeId
    },
    filter(value) {
      this.filterValue = value || ''
      const matcher = this.filterNodeMethod
      const visit = node => {
        const selfMatch = matcher ? matcher(this.filterValue, node.data) : true
        const childMatch = node.childNodes.some(child => visit(child))
        node.visible = !this.filterValue ? true : (selfMatch || childMatch)
        return node.visible
      }
      ;(this.store.root.childNodes || []).forEach(node => visit(node))
    },
    setChecked(nodeId, checked, deep = !this.checkStrictly) {
      const node = this.getNode(nodeId)
      if (!node || node.disabled) return
      this.updateNodeChecked(node, checked, deep)
      this.syncParentCheckState(node.parent)
    },
    setCheckedKeys(keys) {
      const checkedSet = new Set((keys || []).map(key => String(key)))
      Object.values(this.store.nodesMap).forEach(node => {
        node.checked = false
        node.indeterminate = false
      })
      const rootNodes = this.store.root.childNodes || []
      const visit = node => {
        const shouldCheck = checkedSet.has(String(node.key))
        node.checked = shouldCheck
        node.indeterminate = false
        if (!this.checkStrictly && node.childNodes.length > 0) {
          node.childNodes.forEach(child => visit(child))
          if (shouldCheck) {
            this.updateChildrenChecked(node, true)
          }
        } else {
          node.childNodes.forEach(child => visit(child))
        }
      }
      rootNodes.forEach(node => visit(node))
      rootNodes.forEach(node => this.syncParentCheckState(node))
    },
    getCheckedKeys(includeHalfChecked = false) {
      return Object.values(this.store.nodesMap)
        .filter(node => node.checked || (includeHalfChecked && node.indeterminate))
        .map(node => node.key)
    },
    getCheckedNodes(leafOnly = false, includeHalfChecked = false) {
      return Object.values(this.store.nodesMap)
        .filter(node => {
          const checkedMatch = node.checked || (includeHalfChecked && node.indeterminate)
          if (!checkedMatch) return false
          if (leafOnly) return node.childNodes.length === 0
          return true
        })
        .map(node => node.data)
    },
    shouldShowCheckbox(node) {
      if (!this.showCheckbox) return false
      if (typeof this.checkboxVisibleMethod !== 'function') return true
      return this.checkboxVisibleMethod(node.data, node)
    },
    updateChildrenChecked(node, checked) {
      node.childNodes.forEach(child => {
        if (!child.disabled) {
          child.checked = checked
          child.indeterminate = false
        }
        this.updateChildrenChecked(child, checked)
      })
    },
    syncParentCheckState(node) {
      let current = node
      while (current && current.level > 0) {
        const effectiveChildren = current.childNodes.filter(child => !child.disabled)
        if (effectiveChildren.length > 0) {
          const allChecked = effectiveChildren.every(child => child.checked)
          const anyChecked = effectiveChildren.some(child => child.checked || child.indeterminate)
          current.checked = allChecked
          current.indeterminate = !allChecked && anyChecked
        }
        current = current.parent
      }
    },
    updateNodeChecked(node, checked, deep) {
      node.checked = checked
      node.indeterminate = false
      if (!this.checkStrictly && deep) {
        this.updateChildrenChecked(node, checked)
      }
    },
    emitCheck(node) {
      const checkedNodes = this.getCheckedNodes()
      const checkedKeys = this.getCheckedKeys()
      const halfCheckedNodes = this.getCheckedNodes(false, true).filter(
        item => !checkedNodes.some(checkedItem => String(checkedItem[this.nodeKey]) === String(item[this.nodeKey]))
      )
      const halfCheckedKeys = this.getCheckedKeys(true).filter(
        key => !checkedKeys.map(item => String(item)).includes(String(key))
      )
      this.$emit('check', node.data, {
        checkedNodes,
        checkedKeys,
        halfCheckedNodes,
        halfCheckedKeys
      })
    },
    handleCheckChange(node, checked) {
      this.updateNodeChecked(node, checked, !this.checkStrictly)
      this.syncParentCheckState(node.parent)
      this.emitCheck(node)
    },
    toggleExpand(node) {
      if (!node.childNodes.length) return
      if (!node.expanded && this.accordion && node.parent && node.parent.childNodes) {
        node.parent.childNodes.forEach(sibling => {
          if (sibling.key !== node.key) {
            sibling.expanded = false
          }
        })
      }
      node.expanded = !node.expanded
    },
    handleRowClick(node) {
      this.currentNodeKeyInner = node.key
      if (this.expandOnClickNode && node.childNodes.length) {
        this.toggleExpand(node)
      }
      this.$emit('node-click', node.data, node)
    }
  }
}
</script>

<style scoped lang="scss">
.virtual-tree {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.virtual-tree-scroller {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow-x: hidden;
}

.virtual-tree-row {
  display: flex;
  align-items: center;
  min-height: 42px;
  border-radius: 10px;
  cursor: pointer;
  box-sizing: border-box;
}

.virtual-tree-row:hover {
  background-color: #f8fafc;
}

.virtual-tree-row.is-current {
  background-color: #eff6ff;
  color: #3b84f6;
}

.virtual-tree-expand {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.virtual-tree-expand.is-expanded {
  transform: rotate(90deg);
}

.virtual-tree-expand.is-placeholder {
  visibility: hidden;
}

.virtual-tree-checkbox {
  margin-right: 7px;
  flex-shrink: 0;
}

.virtual-tree-content {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.virtual-tree-label {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
