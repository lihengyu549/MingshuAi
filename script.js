const fs = require('fs');

let content = fs.readFileSync('src/views/system/role/index.vue', 'utf-8');

// Template replacements
content = content.replace(/label="角色名称"/g, ':label="$t(\'role.roleName\')"');
content = content.replace(/placeholder="请输入角色名称"/g, ':placeholder="$t(\'role.inputRoleName\')"');
content = content.replace(/>新增</g, '>{{ $t(\'add\') }}<');
content = content.replace(/>修改</g, '>{{ $t(\'edit\') }}<');
content = content.replace(/>删除</g, '>{{ $t(\'delete\') }}<');
content = content.replace(/>导出</g, '>{{ $t(\'export\') }}<');
content = content.replace(/label="显示顺序"/g, ':label="$t(\'role.roleSort\')"');
content = content.replace(/label="权限字符"/g, ':label="$t(\'role.roleKey\')"');
content = content.replace(/label="状态"/g, ':label="$t(\'status\')"');
content = content.replace(/label="创建时间"/g, ':label="$t(\'createdTime\')"');
content = content.replace(/label="操作"/g, ':label="$t(\'operation\')"');
content = content.replace(/>确 定</g, '>{{ $t(\'confirm\') }}<');
content = content.replace(/>取 消</g, '>{{ $t(\'cancel\') }}<');
content = content.replace(/>展开\/折叠</g, '>{{ $t(\'role.expandCollapse\') }}<');
content = content.replace(/>全选\/全不选</g, '>{{ $t(\'role.selectAll\') }}<');
content = content.replace(/>父子联动</g, '>{{ $t(\'role.checkStrictly\') }}<');
content = content.replace(/empty-text="加载中，请稍候"/g, ':empty-text="$t(\'role.loading\')"');
content = content.replace(/label="菜单权限"/g, ':label="$t(\'role.menuPermission\')"');
content = content.replace(/label="描述"/g, ':label="$t(\'role.remark\')"');
content = content.replace(/placeholder="请输入内容"/g, ':placeholder="$t(\'role.inputContent\')"');
content = content.replace(/label="权限范围"/g, ':label="$t(\'role.dataScope\')"');
content = content.replace(/label="数据权限"/g, ':label="$t(\'role.dataPermission\')"');
content = content.replace(/:title="title"/g, ':title="dialogTitle"');

// JS replacements
const scriptStart = content.indexOf('export default {');
if (scriptStart !== -1) {
    const head = content.substring(0, scriptStart);
    let tail = content.substring(scriptStart);
    
    const consts = `const createDataScopeOptions = vm => [
  { value: "1", label: vm.$t('role.dataScopeAll') },
  { value: "2", label: vm.$t('role.dataScopeCustom') },
  { value: "3", label: vm.$t('role.dataScopeDept') },
  { value: "4", label: vm.$t('role.dataScopeDeptAndChild') },
  { value: "5", label: vm.$t('role.dataScopeSelf') }
];

const createRules = vm => ({
  roleName: [
    { required: true, message: vm.$t('role.validation.roleNameRequired'), trigger: "blur" }
  ],
  roleKey: [
    { required: true, message: vm.$t('role.validation.roleKeyRequired'), trigger: "blur" }
  ],
  roleSort: [
    { required: true, message: vm.$t('role.validation.roleSortRequired'), trigger: "blur" }
  ]
});\n\n`;
    tail = consts + tail;
    
    tail = tail.replace(/title: "",/g, 'titleKey: "",');
    tail = tail.replace(/dataScopeOptions: \[[\s\S]*?\]\s*,/g, 'dataScopeOptions: createDataScopeOptions(this),');
    tail = tail.replace(/rules: \{[\s\S]*?\}\s*(?=};)/g, 'rules: createRules(this)');
    
    tail = tail.replace(/this\.title = "添加角色";/g, 'this.titleKey = "role.addRole";');
    tail = tail.replace(/this\.title = "修改角色";/g, 'this.titleKey = "role.editRole";');
    tail = tail.replace(/this\.title = "分配数据权限";/g, 'this.titleKey = "role.assignDataScope";');

    tail = tail.replace(/let text = row\.status === "0" \? "启用" : "停用";\s*this\.\$modal\.confirm\('确认要"' \+ text \+ '""' \+ row\.roleName \+ '"角色吗？'\)/g,
                  'let text = row.status === "0" ? "enable" : "disable";\n      let action = this.$t(text);\n      this.$modal.confirm(this.$t(\'role.confirmStatusChange\', { action, name: row.roleName }))');
    tail = tail.replace(/this\.\$modal\.msgSuccess\(text \+ "成功"\);/g, 'this.$modal.msgSuccess(this.$t(\'role.statusChangeSuccess\', { action }));');
    
    tail = tail.replace(/this\.\$modal\.confirm\('是否确认删除角色编号为"' \+ roleIds \+ '"的数据项？'\)/g,
                  'this.$modal.confirm(this.$t(\'role.confirmDelete\', { name: row.roleName || roleIds }))');
    
    tail = tail.replace(/this\.\$modal\.msgSuccess\("修改成功"\);/g, 'this.$modal.msgSuccess(this.$t(\'role.editSuccess\'));');
    tail = tail.replace(/this\.\$modal\.msgSuccess\("新增成功"\);/g, 'this.$modal.msgSuccess(this.$t(\'role.addSuccess\'));');
    tail = tail.replace(/this\.\$modal\.msgSuccess\("删除成功"\);/g, 'this.$modal.msgSuccess(this.$t(\'role.deleteSuccess\'));');

    content = head + tail;
}

const computedWatch = `  computed: {
    dialogTitle() {
      return this.titleKey ? this.$t(this.titleKey) : ''
    }
  },
  watch: {
    '$i18n.locale'() {
      this.dataScopeOptions = createDataScopeOptions(this)
      this.rules = createRules(this)
    }
  },`;

content = content.replace('  created() {', computedWatch + '\n  created() {');

fs.writeFileSync('src/views/system/role/index.vue', content, 'utf-8');
