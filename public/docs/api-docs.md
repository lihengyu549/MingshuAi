# API接口文档

## 1. 用户登录接口

**接口名称**: 用户登录

**请求方法**: POST

**请求地址**: https://api.example.com/v1/auth/login

**请求数据类型**: application/json

**请求参数**:

### Header参数
|参数名|类型|必填|说明|
|---|---|---|---|
| Content-Type | string | 是 | application/json |
| Accept | string | 否 | application/json |

### Body参数
|参数名|类型|必填|说明|
|---|---|---|---|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| remember | boolean | 否 | 是否记住登录状态 |

**请求示例**:
```json
{
  "username": "admin",
  "password": "123456",
  "remember": true
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    }
  }
}
```

**响应数据结构**:
|字段名|类型|说明|
|---|---|---|
| code | integer | 状态码 |
| message | string | 响应消息 |
| data.token | string | 访问令牌 |
| data.user.id | integer | 用户ID |
| data.user.username | string | 用户名 |
| data.user.email | string | 邮箱地址 |

---

## 2. 获取用户信息接口

**接口名称**: 获取用户信息

**请求方法**: GET

**请求地址**: https://api.example.com/v1/user/profile

**请求数据类型**: application/json

**请求参数**:

### Header参数
|参数名|类型|必填|说明|
|---|---|---|---|
| Authorization | string | 是 | Bearer token |
| Accept | string | 否 | application/json |

### Body参数
无

**请求示例**:
```json
// GET请求无请求体
```

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**响应数据结构**:
|字段名|类型|说明|
|---|---|---|
| code | integer | 状态码 |
| message | string | 响应消息 |
| data.id | integer | 用户ID |
| data.username | string | 用户名 |
| data.email | string | 邮箱地址 |
| data.avatar | string | 头像URL |
| data.created_at | string | 创建时间 |

---

## 3. 创建用户接口

**接口名称**: 创建用户

**请求方法**: POST

**请求地址**: https://api.example.com/v1/user/create

**请求数据类型**: application/json

**请求参数**:

### Header参数
|参数名|类型|必填|说明|
|---|---|---|---|
| Content-Type | string | 是 | application/json |
| Authorization | string | 是 | Bearer token |

### Body参数
|参数名|类型|必填|说明|
|---|---|---|---|
| username | string | 是 | 用户名，长度3-20字符 |
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码，长度6-20字符 |
| role | string | 否 | 用户角色，默认user |

**请求示例**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "123456",
  "role": "user"
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "用户创建成功",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**响应数据结构**:
|字段名|类型|说明|
|---|---|---|
| code | integer | 状态码 |
| message | string | 响应消息 |
| data.id | integer | 用户ID |
| data.username | string | 用户名 |
| data.email | string | 邮箱地址 |
| data.role | string | 用户角色 |
| data.created_at | string | 创建时间 |

---

## 4. 更新用户信息接口

**接口名称**: 更新用户信息

**请求方法**: PUT

**请求地址**: https://api.example.com/v1/user/{id}

**请求数据类型**: application/json

**请求参数**:

### Header参数
|参数名|类型|必填|说明|
|---|---|---|---|
| Content-Type | string | 是 | application/json |
| Authorization | string | 是 | Bearer token |

### Body参数
|参数名|类型|必填|说明|
|---|---|---|---|
| username | string | 否 | 用户名 |
| email | string | 否 | 邮箱地址 |
| avatar | string | 否 | 头像URL |

**请求示例**:
```json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "updateduser",
    "email": "updated@example.com",
    "avatar": "https://example.com/new-avatar.jpg",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**响应数据结构**:
|字段名|类型|说明|
|---|---|---|
| code | integer | 状态码 |
| message | string | 响应消息 |
| data.id | integer | 用户ID |
| data.username | string | 用户名 |
| data.email | string | 邮箱地址 |
| data.avatar | string | 头像URL |
| data.updated_at | string | 更新时间 |

---

## 5. 删除用户接口

**接口名称**: 删除用户

**请求方法**: DELETE

**请求地址**: https://api.example.com/v1/user/{id}

**请求数据类型**: application/json

**请求参数**:

### Header参数
|参数名|类型|必填|说明|
|---|---|---|---|
| Authorization | string | 是 | Bearer token |

### Body参数
无

**请求示例**:
```json
// DELETE请求无请求体
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**响应数据结构**:
|字段名|类型|说明|
|---|---|---|
| code | integer | 状态码 |
| message | string | 响应消息 |
| data | null | 无返回数据 | 