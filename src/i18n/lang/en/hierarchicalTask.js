export default {
  search: {
    taskName: 'Task Name',
    taskNamePlaceholder: 'Please enter the task name',
    sourceType: 'Data Source Type',
    sourceTypePlaceholder: 'Please select the database type',
    businessName: 'Source Business System',
    businessNamePlaceholder: 'Please enter the source business system',
    framework: 'Classification Standard',
    frameworkPlaceholder: 'Please select the classification standard',
    executionStatus: 'Execution Status',
    executionStatusPlaceholder: 'Please select the execution status',
    publishStatus: 'Publish Status',
    publishStatusPlaceholder: 'Please select the publish status'
  },
  buttons: {
    addTask: 'Add Task',
    deleteTask: 'Delete Task',
    executeTask: 'Execute Task',
    pauseTask: 'Pause Task',
    terminateTask: 'Terminate Task',
    taskMonitoring: 'Task Monitoring',
    resultView: 'View Result',
    resultPublish: 'Publish Result',
    publishWithdraw: 'Withdraw Publish',
    save: 'Confirm'
  },
  titles: {
    basicInfo: 'Basic Information',
    enableFeatures: 'Enabled Features',
    executeScopeAndCycle: 'Execution Scope and Cycle',
    addTask: 'Add Task',
    editTask: 'Edit Task'
  },
  features: {
    aiTag: 'AI Classification Labeling',
    aiTagDesc: 'Intelligently label data based on field context',
    semanticFill: 'Semantic Filling',
    semanticFillDesc: 'Fill business semantics using field/table context',
    dirtyFilter: 'Noise Data Filtering',
    dirtyFilterDesc: 'Identify and filter invalid noise to improve classification quality',
    ruleMatch: 'Rule Matching Engine',
    ruleMatchDesc: 'Accurately match data through keywords and regex',
    piiReview: 'PIPL Compliance Review',
    piiReviewDesc: 'Intelligently identify personal sensitive information such as names and ID numbers',
    aiSuggest: 'AI Classification Suggestion',
    aiSuggestDesc: 'Provide intelligent suggestions for fields with unmatched factors',
    featureExtract: 'Sample Feature Extraction',
    featureExtractDesc: 'Extract key features from data samples'
  },
  form: {
    taskName: 'Task Name',
    taskNamePlaceholder: 'Please enter the task name',
    dataSourceName: 'Data Source Name',
    framework: 'Classification Framework',
    contentPlaceholder: 'Please select content',
    confidenceLevel: 'Confidence Level',
    confirmStatus: 'Confirmation Status',
    semanticFillStatus: 'Semantic Fill Status',
    classificationStatus: 'Classification Status',
    classificationReason: 'Classification Reason',
    executeCycle: 'Execution Cycle',
    anyTime: 'Any Time'
  },
  options: {
    confidence: {
      all: 'All',
      low: 'Low',
      high: 'High'
    },
    confirm: {
      all: 'All',
      unconfirmed: 'Unconfirmed',
      confirmed: 'Confirmed'
    },
    dataSourceType: {
      database: 'Database',
      file: 'Excel File'
    },
    publishStatus: {
      unpublished: 'Unpublished',
      published: 'Published'
    },
    executeStatus: {
      none: 'Not Started',
      stayExecute: 'Pending Execution',
      running: 'Running',
      complete: 'Completed',
      error: 'Failed',
      pausing: 'Pausing',
      paused: 'Paused',
      killing: 'Terminating',
      killed: 'Terminated'
    },
    scheduleType: {
      manual: 'Manual',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly'
    },
    weekDays: {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    },
    paddingStatus: {
      notStarted: 'Not Started',
      success: 'Success',
      failed: 'Failed'
    }
  },
  columns: {
    taskName: 'Task Name',
    dataSource: 'Data Source',
    sourceBusinessSystem: 'Source Business System',
    framework: 'Classification Standard',
    taskFieldCount: 'Field Count',
    taskFileCount: 'File Count',
    executionStatus: 'Execution Status',
    publishStatus: 'Publish Status',
    updateTime: 'Updated Time',
    taskActions: 'Task Actions',
    resultActions: 'Result Actions'
  },
  result: {
    fieldName: 'Field Name',
    fieldType: 'Field Type',
    fieldRemark: 'Field Remark',
    aiFieldRemark: 'AI Field Remark',
    sample: 'Sample',
    category: 'Category',
    classificationStatus: 'Classification Status',
    securityLevel: 'Security Level',
    confirmStatus: 'Confirmation Status',
    database: 'Database',
    table: 'Table',
    classificationReason: 'Classification Reason',
    confidenceLevel: 'Confidence Level',
    piiReview: 'PII Recognition',
    sourceBusinessSystem: 'Source Business System',
    resultEdit: 'Edit Result',
    reasoningProcess: 'Reasoning Process',
    reasoningProcessPlaceholder: 'Please enter the reasoning process',
    detectionMethod: 'Detection Method',
    detectionMethodPlaceholder: 'Please enter the detection method',
    confirmChecked: 'Confirm Checked Items',
    confirmFiltered: 'Confirm Filtered Items',
    cancelChecked: 'Cancel Checked Items',
    cancelFiltered: 'Cancel Filtered Items'
  },
  validation: {
    taskNameRequired: 'Task name cannot be empty',
    dataSourceRequired: 'Data source name cannot be empty',
    frameworkRequired: 'Classification framework cannot be empty',
    classificationLogicRequired: 'Classification logic cannot be empty',
    confidenceRequired: 'Confidence level cannot be empty',
    confirmRequired: 'Confirmation status cannot be empty',
    repetitionThresholdRequired: 'Please enter the sample repetition threshold',
    repetitionThresholdRange: 'Please enter a value between 1 and 100'
  },
  messages: {
    withdrawReleaseConfirm: 'Are you sure you want to withdraw the published result?',
    currentTaskWait: 'The current task is {status}. Please wait until the operation finishes before continuing',
    continueExecutionConfirm: 'The current task is paused. Are you sure you want to continue?',
    restartExecutionConfirm: 'The current task has been terminated. Are you sure you want to run it again?',
    rerunWarningConfirm: 'Before rerunning the task, please note that it may overwrite all results from the previous run on this data source',
    executeConfirm: 'Are you sure you want to execute the selected items?',
    addSuccess: 'Added successfully',
    editSuccess: 'Updated successfully',
    deleteSuccess: 'Deleted successfully',
    deleteStatusRestriction: 'Only tasks in Not Started, Completed, Failed, or Terminated status can be deleted. Current selection includes: {statuses}',
    deleteTaskWithResultsConfirm: 'Deleting the task will also delete all execution results associated with this data source. Continue?',
    deleteSelectedConfirm: 'Are you sure you want to delete the selected items?',
    selectAtLeastOne: 'Please select at least one record',
    cannotPublishWhenRunning: 'The current status is Running, so publishing is not allowed',
    cannotPauseInStatus: 'The current status is {status}, so pause cannot be performed',
    pauseTaskConfirm: 'Are you sure you want to pause this task?',
    cannotTerminateInStatus: 'The current status is {status}, so termination cannot be performed',
    terminateTaskConfirm: 'Are you sure you want to terminate this task?',
    cannotViewMonitoringInStatus: 'The current status is {status}, so task monitoring cannot be viewed'
  }
}
