const fs = require("fs");
const path = require("path");
const Mock = require("mockjs"); //mockjs 导入依赖模块
const JSON5 = require("json5"); //json5的作用是可以解析json文件中的注释
//读取json文件
function getJsonFile(filePath) {
  //读取指定json文件
  var json = fs.readFileSync(path.resolve(__dirname, filePath), "utf-8");
  //解析并返回
  return JSON5.parse(json);
}
/**
 * 将字符串url转换为正则匹配
 * 转正则的原因：如果url是字符串类型，默认会完全匹配mock地址与应用请求地址，参数不同也会造成mock拦截失效，解决方式就是用正则匹配
 * @param {String} url 接口地址
 * @return {RegExp} 返回正则匹配规则
 */
 function regUrl(url) {
  console.log(url);
  let urlStr = '/dev-api'+url + '.*';
  return RegExp(urlStr);
}

function testData(){
  return  { "total": 6318, "rows": [{ "id": 5420, "projectId": 35, "tableId": 910, "fieldName": "id", "fieldType": "INT", "fieldRemark": "", "addTime": "2023-03-24T02:53:54.000+08:00", "securityLevel": 3, "securityRule": "[\"id\"]", "categoryId": 4, "databaseId": 117, "projectName": "444这是项目名称123123123", "tableName": "readme", "databaseName": null, "categoryName": "医疗应用数据总收入高" }], "code": 200, "msg": "查询成功" }

}
Mock.mock(regUrl('/system/protectTableField/list'),function (data) {
  console.log(data);
  console.log("命中方法");
  var data = Mock.mock({
    "total|1-200":12323,
    'rows|1-10': [{
      'id|+1': 1,
      'projectId|+1': 1,
      'tableId|+1': 1,
      'fieldName':'@word',
      'fieldType':'@word',
      'fieldRemark':'@csentence(1,10)',
      'addTime':'@datetime("yyyy-MM-ddTHH:mm:ss.s+08:00")',
      'securityLevel|1-5':1,
      'securityRule': '[\"id\"]' ,
      'categoryId|+1': 1,
      'databaseId|+1': 1,
      'projectName':'@csentence(1,10)',
      'tableName':'@csentence(1,10)',
      'databaseName':'@csentence(1,100)',
      'categoryName':'@csentence(1,10)',
  }]
});
console.log(data);
  //将json传入 Mock.mock 方法中，生成的数据返回给浏览器
  return data;
}
)
