---
sidebar_position: 2
---

# 唯一性校验(unique)

唯一性校验是一种用于确保数据集中的特定字段值在整个数据集中是唯一的验证方法. 这通常用于数据库表中的字段, 如用户注册系统中的用户名或电子邮件地址, 以确保每个记录的该字段值不重复

## 定义唯一字段

使用 `@options` 指令, 设置 `unique: true`

例: 规定用户名不可重复

```graphql
"用户"
type User {
  "用户ID"
  id: ID
  "用户名"
  name: String! @options(unique: true) @jsonSchema(minLength: 6, maxLength: 12)
  "电子邮箱"
  email: String
  "联系方式"
  phoneNumbers: [String!]
  "用户类型"
  userType: UserType!
  "订单"
  orders: [Order!]
}
```

测试

```graphql
mutation {
  user(name: "Charlie", email: "charlie@example.com", userType: VIP) {
    id
    name
  }
}
```

返回唯一性校验错误

```json
{
  "errors": [
    {
      "message": "-40901: existed unique values",
      "locations": null,
      "path": ["name"],
      "extensions": {
        "timestamp": "2024-08-01T16:02:44.226237",
        "code": -40901
      }
    }
  ]
}
```
