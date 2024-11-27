import request from '@/utils/request'
import {stringify} from '@/utils/ruoyi'
// API监控服务列表
export function Service() {
  return request({
    url: '/system/monitor/serverList',
    method: 'get'
   
  })
}


// 实例列表
// export function Instance(data) {
//   return request({
//     url: '/graphql',
//     method: 'post',
//     headers: {
//       "Content-Type":"application/json",
//     },
//     data: {
//       "query": "query queryInstances($serviceId: ID!, $duration: Duration!) {\n  pods: listInstances(duration: $duration, serviceId: $serviceId) {\n    id\n    value: name\n    label: name\n    language\n    instanceUUID\n    attributes {\n      name\n      value\n    }\n  }\n  }",
//       "variables": {
//           "serviceId": "cnVveWktc3lzdGVt.1",
//           "duration": {
//               "start": "2022-12-05 1023",
//               "end": "2022-12-05 1053",
//               "step": "MINUTE"
//           }
//       }
//   }

//   })
// }

//端点列表

// export function Endpoint(data) {
//   return request({
//     url: '/graphql',
//     method: 'post',
//     headers: {
//       "Content-Type":"application/json",
//     },
//     data: 
//     {
//       "query": "query queryEndpoints($serviceId: ID!, $keyword: String!) {\n  pods: findEndpoint(serviceId: $serviceId, keyword: $keyword, limit: 20) {\n    id\n    value: name\n     label: name\n    }\n}",
//       "variables": {
//           "serviceId": "cnVveWktc3lzdGVt.1",
//           "duration": {
//               "start": "2022-12-05 1121",
//               "end": "2022-12-05 1151",
//               "step": "MINUTE"
//           },
//           "keyword": ""
//       }
//   }

//   })
// }

//服务平均响应时间

export function servicRespTimeI(data) {
  data['methodName']='service_resp_time'
  return request({
    url: '/system/monitor/queryServeData?id=service_resp_time',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}


//服务满意值数据

export function serviceApdexI(data) {
  data['methodName']='service_apdex'
  return request({
    url: '/system/monitor/queryServeData?id=service_apdex',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}


//服务响应时间百分比数据

export function servicePercentileI(data) {
  data['methodName']='service_percentile'
  return request({
    url: '/system/monitor/queryServeData?id=service_percentile',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}

//业务负载数据
export function serviceCpmI(data) {
  data['methodName']='service_cpm'
  return request({
    url: '/system/monitor/queryServeData?id=service_cpm',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}

//请求成功率数据

export function serviceSlaI(data) {
  data['methodName']='service_sla'
  return request({
    url: '/system/monitor/queryServeData?id=service_sla',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}

// 消息队列消耗计数
export function serviceMqConsumeCountI(data) {
  data['methodName']='service_mq_consume_count'
  return request({
    url: '/system/monitor/queryServeData?id=service_mq_consume_count',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}


// 消息队列平均消耗延时数据

export function serviceMqConsumeLatencyI(data) {
  data['methodName']='service_mq_consume_latency'
  return request({
    url: '/system/monitor/queryServeData?id=service_mq_consume_latency',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}


//服务实例负载
export function serviceInstanceCpmI(data) {
  data['methodName']='service_instance_cpm'
  return request({
    url: '/system/monitor/queryServeData?id=service_instance_cpm',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}



// 慢服务实例
export function serviceInstanceRespTimeI(data) {
  data['methodName']='service_instance_resp_time'
  return request({
    url: '/system/monitor/queryServeData?id=service_instance_resp_time',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}

// 服务实例成功率
export function serviceInstanceSlaI(data) {
  data['methodName']='service_instance_sla'
  return request({
    url: '/system/monitor/queryServeData?id=service_instance_sla',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}


// 当前服务端点负载
export function endpointCpmI(data) {
  data['methodName']='endpoint_cpm'
  return request({
    url: '/system/monitor/queryServeData?id=endpoint_cpm',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}

// 当前服务慢端点
export function endpointRespTimeI(data) {
  data['methodName']='endpoint_resp_time'
  return request({
    url: '/system/monitor/queryServeData?id=endpoint_resp_time',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}

// 当前服务成功率
export function endpointSlaI(data) {
  data['methodName']='endpoint_sla'
  return request({
    url: '/system/monitor/queryServeData?id=endpoint_sla',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}

// 实例列表
export function queryInstancesI(data) {
  return request({
    url: '/system/monitor/queryInstances',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}

// 服务实例行内指标数据（实例）
export function instancesListDataI(data) {
  return request({
    url: '/system/monitor/instancesListData',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}
// 查询服务拓扑
export function getServicesTopologyI(data) {
  return request({
    url: '/system/monitor/getServicesTopology',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data),
    loading: true

  })
}
// 服务端点列表（端点）
export function queryEndpointsI(data) {
  return request({
    url: '/system/monitor/queryEndpoints',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}
//服务端点行内指标数据（端点）
export function endpointsListDataI(data) {
  return request({
    url: '/system/monitor/endpointsListData',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}
//查询服务基础数据（首页）
export function queryServeBaseDataI(data) {
  return request({
    url: '/system/monitor/queryServeBaseData',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}
//  API调用记录查询
export function getApiRecordListI(data) {
  return request({
    url: '/system/api/list/record',
    method: 'get',
    params: data
  })
}
//  Trance列表查询
export function queryTracesListI(data) {
  return request({
    url: '/system/monitor/queryTracesList',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}
// Trance 查询TAG列表（Trance）
export function queryTraceTagKeysI(data) {
  return request({
    url: '/system/monitor/queryTraceTagKeys?key='+data['tagKey'].replaceAll(".",""),
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}
// 查询Trance信息（Trance）
export function queryTraceI(data) {
  return request({
    url: '/system/monitor/queryTrace',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)
  })
}
//首页服务列表
export function serverListI(data) {
  return request({
    url: '/system/monitor/serverList',
    method: 'get',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)

  })
}
// 首页首页服务列表折线图数据
export function serverListEchI(data) {
  return request({
    url: '/system/monitor/serverListData',
    method: 'post',
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)
  })
}
//获取添加服务时的一些IP
export function getIpsI(data) {
  return request({
    url: '/system/monitor/getIps',
    method: 'get',
   
    headers: {
      "Content-Type":"multipart/form-data; ",
    },
    data:stringify(data)
  })
}
