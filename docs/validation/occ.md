---
sidebar_position: 3
---

# 乐观锁(OCC)

乐观锁是一种并发控制机制, 用于在多线程环境下防止数据冲突. 它假设多个事务在访问同一数据时不会相互干扰, 因此允许并发操作, 但在提交更新时会进行冲突检测. 每次更新数据时, 增加版本号. 提交更新时, 检查数据库中的版本号是否与读取时一致, 若一致则更新, 否则拒绝更新并提示冲突

## 开启乐观锁

使用 `mutation.occ` 配置乐观锁是否生效, 每次变更时设置版本字段(version)来校验乐观锁

```conf title="application.conf"
mutation {
    occ = true
}
```

测试

```graphql
mutation {
  user(
    id: "3"
    name: "Charlie"
    email: "charlie@example.com"
    userType: VIP
    // highlight-start
    version: 0
    // highlight-end
  ) {
    id
    name
  }
}
```

当变更版本(version)与数据库不一致时, 返回错误

```json
{
  "errors": [
    {
      "message": "-40900: resource has been updated",
      "locations": null,
      "path": null,
      "extensions": {
        "timestamp": "2024-08-02T20:57:11.3909765",
        "code": -40900
      }
    }
  ]
}
```
