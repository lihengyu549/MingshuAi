export default {
  search: {
    taskName: '任务名称',
    taskNamePlaceholder: '请输入任务名称',
    sourceType: '数据源类型',
    sourceTypePlaceholder: '请选择数据库类型',
    businessName: '来源业务系统',
    businessNamePlaceholder: '请输入来源业务系统',
    framework: '分类分级标准',
    frameworkPlaceholder: '请选择分类分级标准',
    executionStatus: '执行状态',
    executionStatusPlaceholder: '请选择执行状态',
    publishStatus: '发布状态',
    publishStatusPlaceholder: '请选择发布状态'
  },
  buttons: {
    addTask: '新增任务',
    deleteTask: '删除任务',
    executeTask: '执行任务',
    pauseTask: '暂停任务',
    terminateTask: '终止任务',
    taskMonitoring: '任务监控',
    resultView: '结果查看',
    resultPublish: '结果发布',
    publishWithdraw: '发布撤回',
    save: '确定'
  },
  titles: {
    basicInfo: '基本信息',
    enableFeatures: '启用功能',
    executeScopeAndCycle: '执行范围与周期',
    addTask: '添加任务',
    editTask: '编辑任务'
  },
  features: {
    aiTag: 'AI分类打标',
    aiTagDesc: '结合字段上下文对数据进行智能打标',
    semanticFill: '语义填充',
    semanticFillDesc: '结合字段/表上下文信息填充业务语义',
    semanticCaching: '语义缓存',
    semanticCachingDesc: '开启语义缓存加速，提升处理效率',
    dirtyFilter: '噪音数据过滤',
    dirtyFilterDesc: '识别并过滤无效干扰数据，保障数据分类质量',
    ruleMatch: '匹配规则引擎',
    ruleMatchDesc: '通过关键字和正则对数据进行精准匹配',
    piiReview: '个保法合规审查',
    piiReviewDesc: '智能识别姓名、身份证号等个人敏感信息',
    aiSuggest: 'AI分类建议',
    aiSuggestDesc: '对未匹配因子的字段，提供智能建议',
    featureExtract: '样本特征提取',
    featureExtractDesc: '从数据样本中提取关键特征',
    dynamicRating: '动态定级',
    dynamicRatingDesc: '依据数据内容动态调整安全/敏感等级'
  },
  form: {
    taskName: '任务名称',
    taskNamePlaceholder: '请输入任务名称',
    dataSourceName: '数据源名称',
    framework: '分类分级标准',
    contentPlaceholder: '请选择内容',
    confidenceLevel: '置信度',
    confirmStatus: '确认状态',
    semanticFillStatus: '语义填充状态',
    classificationStatus: '分类状态',
    classificationReason: '归类原因',
    executeCycle: '执行周期',
    anyTime: '任意时间点'
  },
  options: {
    confidence: {
      all: '全部',
      low: '低',
      high: '高'
    },
    confirm: {
      all: '全部',
      unconfirmed: '未确认',
      confirmed: '已确认'
    },
    dataSourceType: {
      database: '数据库',
      file: 'Excel表',
      api: 'API',
      fileCatalogue: '文件目录',
      fileServer: '文件服务器'
    },
    publishStatus: {
      unpublished: '未发布',
      published: '已发布'
    },
    executeStatus: {
      none: '未开始',
      stayExecute: '待执行',
      running: '执行中',
      complete: '执行完成',
      error: '执行失败',
      pausing: '正在暂停中',
      paused: '暂停成功',
      killing: '正在终止中',
      killed: '终止成功'
    },
    scheduleType: {
      manual: '手动',
      daily: '每天',
      weekly: '每周',
      monthly: '每月'
    },
    weekDays: {
      monday: '周一',
      tuesday: '周二',
      wednesday: '周三',
      thursday: '周四',
      friday: '周五',
      saturday: '周六',
      sunday: '周日'
    },
    paddingStatus: {
      notStarted: '未开始',
      success: '成功',
      failed: '失败'
    }
  },
  columns: {
    taskName: '任务名称',
    dataSource: '数据源',
    sourceBusinessSystem: '来源业务系统',
    framework: '分类分级标准',
    taskFieldCount: '任务字段数',
    taskFileCount: '任务文件数',
    executionStatus: '执行状态',
    publishStatus: '发布状态',
    updateTime: '更新时间',
    taskActions: '任务操作',
    resultActions: '结果操作'
  },
  result: {
    fieldName: '字段名',
    fieldType: '字段类型',
    fieldRemark: '字段注释',
    aiFieldRemark: 'AI字段注释',
    sample: '样本',
    category: '分类',
    classificationStatus: '分类状态',
    securityLevel: '安全分级',
    confirmStatus: '确认状态',
    database: '所属库',
    table: '所属表',
    classificationReason: '归类原因',
    confidenceLevel: '置信度',
    piiReview: '个人信息识别',
    sourceBusinessSystem: '来源业务系统',
    resultEdit: '结果修改',
    reasoningProcess: '推理过程',
    reasoningProcessPlaceholder: '请输入推理过程',
    detectionMethod: '识别方式',
    detectionMethodPlaceholder: '请输入识别方式',
    confirmChecked: '确认勾选项',
    confirmFiltered: '确认过滤项',
    cancelChecked: '取消勾选项',
    cancelFiltered: '取消过滤项'
  },
  validation: {
    taskNameRequired: '任务名称不能为空',
    dataSourceRequired: '数据源名称不能为空',
    frameworkRequired: '分类分级标准不能为空',
    classificationLogicRequired: '分类逻辑不能为空',
    confidenceRequired: '置信度不能为空',
    confirmRequired: '确认状态不能为空',
    repetitionThresholdRequired: '请输入样本重复率阈值',
    repetitionThresholdRange: '请输入1-100之间的数值'
  },
  messages: {
    withdrawReleaseConfirm: '确定撤回已发布的结果？',
    currentTaskWait: '当前任务{status}，请等待操作完成后再执行',
    continueExecutionConfirm: '当前任务已暂停，确定继续执行？',
    restartExecutionConfirm: '当前任务已终止，确定重新执行？',
    rerunWarningConfirm: '重新执行任务前，⚠️ 请注意任务细节，否则可能将会覆盖该数据源上一次执行的所有结果',
    executeConfirm: '确定执行所选中的项吗',
    addSuccess: '新增成功',
    editSuccess: '修改成功',
    deleteSuccess: '删除成功',
    deleteStatusRestriction: '仅未开始、执行完成、执行失败、终止成功状态的任务可以删除，当前选中包含：{statuses}',
    deleteTaskWithResultsConfirm: '删除任务，将会删除数据源所关联的所有执行结果,确定删除吗',
    deleteSelectedConfirm: '确定删除所选中的项吗',
    selectAtLeastOne: '至少选择一条数据',
    cannotPublishWhenRunning: '当前状态为运行中，无法发布',
    cannotPauseInStatus: '当前状态为{status}，无法执行暂停操作',
    pauseTaskConfirm: '确定暂停任务吗',
    cannotTerminateInStatus: '当前状态为{status}，无法执行终止操作',
    terminateTaskConfirm: '确定终止任务吗',
    cannotViewMonitoringInStatus: '当前状态为{status}，无法查看任务监控'
  }
}
