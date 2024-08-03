---
sidebar_position: 4
---

# 事务(transaction)

事务是一组操作的集合, 这些操作作为一个单元执行, 确保数据的一致性和完整性. Graphoenix 根据 [Jakarta Transactions](https://jakarta.ee/specifications/transactions/2.0/jakarta-transactions-spec-2.0) 协议对事务进行管理, 在单体架构下执行本地事务(ACID), 在微服务架构下对跨服务的调用执行事务补偿(TCC)

```mermaid
flowchart LR
    micro1{{微服务1}}
    micro2{{微服务2}}
    micro3{{微服务3}}
    success1(成功)
    success2(成功)
    success3(成功)
    error1(异常)
    error2(异常)
    error3(异常)
    db1[(MySQL)]
    db2[(Postgre)]
    db3[(MongoDB)]
    error1 == 事务补偿 ==> micro2 & micro3
    micro1 -- 调用 --> micro2 --> success2
    micro2 -.-> error2 -. 回滚 .-> db2
    error2 -.-> error1

    micro1 -.-> error1 -. 回滚 .-> db1
    micro1 --> success1 -- 提交 --> db1

    success2 -- 调用 --> micro3 --> success3 -- 提交 --> db3
    success2 -- 提交 --> db2
    micro3 -.-> error3 -. 回滚 .-> db3
    error3 -.-> error1
```