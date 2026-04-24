export default {
  scheme: '方案',
  schemeName: '方案名称',
  addScheme: '新增方案',
  defaultTag: '默认',
  schemeType: '方案类型',
  customType: '自定义',
  useCount: '引用次数',
  sensitiveDataDefinition: '敏感数据定义',
  securityLevelAtLeast: '安全分级大于等于',
  sensitiveDataSuffix: '的数据定义为敏感数据',
  schemeDetails: '方案细则',
  levelNumber: '分级数字',
  levelName: '分级名称',
  levelDefinition: '分级定义',
  recommendedProtection: '建议防护措施',
  save: '保存',
  deleteConfirm: '确定删除该方案吗？',
  saved: '已保存',
  examplePlaceholder: '如：数据安全分级方案',
  protectMasking: '脱敏',
  protectEncryption: '加密',
  defaultLevels: {
    level0: {
      name: '未分级',
      definition: '未定义分级的数据'
    },
    level1: {
      name: '1级-公开可披露',
      definition: '一般可被公众获知或使用，数据安全遭到破坏后，对个人隐私或企业合法权益无影响或仅造成微弱影响，不涉及国家安全与公众权益风险。'
    },
    level2: {
      name: '2级-内部一般',
      definition: '一般业务数据，通常对内部管理等受限对象开放，不宜广泛公开。数据安全遭到破坏后，会对个人隐私或企业合法权益造成轻微影响，但不影响国家安全与公众权益。'
    },
    level3: {
      name: '3级-内部敏感',
      definition: '关键或重要业务数据，仅对 “必须知悉” 的特定人员开放访问。数据安全遭到破坏后，会对公众权益造成轻微影响，或对个人隐私/企业合法权益造成较重影响，但不影响国家安全。'
    },
    level4: {
      name: '4级-重要敏感',
      definition: '核心节点类机构的重要业务数据，仅对 “必须知悉” 的特定人员开放访问。数据安全遭到破坏后，会对公众权益造成一般影响，或对个人隐私/企业合法权益造成严重影响，但不影响国家安全。'
    },
    level5: {
      name: '5级-核心敏感',
      definition: '核心节点类机构的关键业务数据，仅对 “必须知悉” 的特定人员开放访问。一旦数据安全遭到破坏，将对国家安全或公众权益造成严重影响。'
    }
  }
}
