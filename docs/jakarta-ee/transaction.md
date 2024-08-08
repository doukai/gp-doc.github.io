---
sidebar_position: 4
---

# 事务(transaction)

事务是一组操作的集合, 这些操作作为一个单元执行, 确保数据的一致性和完整性. Graphoenix 根据 [Jakarta Transactions](https://jakarta.ee/specifications/transactions/2.0/jakarta-transactions-spec-2.0) 协议对事务进行管理

## 事务注解

使用 [`@Transactional`](#transactional) 注解声明事务

```java
@GraphQLApi
@ApplicationScoped
public class SystemApi {

    @Mutation
    // highlight-start
    @Transactional
    // highlight-end
    public RegisterResult register(RegisterInput registerInput) {
        // ...
    }

}
```

### @Transactional

| 属性           | 类型              | 默认值   | 说明                                        |
| -------------- | ----------------- | -------- | ------------------------------------------- |
| value          | [TxType](#txtype) | REQUIRED | 事务传播类型                                |
| rollbackOn     | Class[]           | --       | 需要回滚的异常类, 优先级低于 dontRollbackOn |
| dontRollbackOn | Class[]           | --       | 不需要回滚的异常类, 优先级高于 rollbackOn   |

### TxType

| 类型          | 说明                                                                                                                                                                                                                                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQUIRED      | 如果在事务上下文之外调用, 拦截器必须开始新的 Jakarta Transactions 事务, 托管 bean 方法的执行必须在此事务上下文内继续, 并且事务必须由拦截器完成 <br/>如果在事务上下文内调用, 托管 bean 方法的执行必须在此事务上下文内继续                                                                                                         |
| REQUIRES_NEW  | 如果在事务上下文之外调用, 拦截器必须开始新的 Jakarta Transactions 事务, 托管 bean 方法的执行必须在此事务上下文内继续, 并且事务必须由拦截器完成 <br/>如果在事务上下文内调用, 则必须暂停当前事务上下文, 开始新的 Jakarta Transactions 事务, 托管 bean 方法的执行必须在此事务上下文内继续, 事务必须完成, 并且必须恢复先前暂停的事务 |
| MANDATORY     | 如果在事务上下文之外调用, 则必须抛出嵌套 TransactionalException 的 TransactionRequiredException <br/>如果在事务上下文内调用, 则托管 bean 方法将在该上下文中继续执行                                                                                                                                                              |
| SUPPORTS      | 如果在事务上下文之外调用, 则托管 bean 方法的执行必须在事务上下文之外继续 <br/>如果在事务上下文内调用, 则托管 bean 方法的执行必须在该事务上下文内继续                                                                                                                                                                             |
| NOT_SUPPORTED | 如果在事务上下文之外调用, 则托管 bean 方法的执行必须在事务上下文之外继续 <br/>如果在事务上下文内调用, 则必须暂停当前事务上下文, 然后托管 bean 方法的执行必须在事务上下文之外继续, 并且之前暂停的事务必须在方法执行完成后由暂停它的拦截器恢复                                                                                     |
| NEVER         | 如果在事务上下文之外调用, 则托管 bean 方法执行必须在事务上下文之外继续 <br/>如果在事务上下文内调用, 则必须抛出嵌套 TransactionalException 的 InvalidTransactionException                                                                                                                                                         |
