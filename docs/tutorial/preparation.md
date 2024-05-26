---
sidebar_position: 2
---

# 准备工作
在开始之前, 我们先花一点时间准备客户端工具, 了解预备知识和生成示例数据.

### 工具
可以直接访问内置的客户端工具: http://localhost:8906/
![graphiQL](./img/graphiQL.png "graphiQL")

也推荐使用全平台的GraphQL客户端: https://altairgraphql.dev/
![Altair](https://altairgraphql.dev/assets/img/app-shot.png "Altair")

### 预备知识
如果还没有基本的GrapQL知识, 可以先去[GraphQL 官网](https://graphql.org/)([中文站](https://graphql.cn/))了解基础概念.

[GraphQL 生态](https://www.howtographql.com/)

[Awesome list of GraphQL](https://github.com/chentsulin/awesome-graphql/)

### 示例数据
最后我们使用[变更](/docs/guide/mutation)来初始化一些示例数据, 变更的详细内容会在后面的示例里更详细的说明.
```graphql
mutation {
  userList(list: [
    { id: "1", name: "Alice", email: "alice@example.com", userType: VIP },
    { id: "2", name: "Bob", email: "bob@example.com", userType: REGULAR },
    { id: "3", name: "Charlie", email: "charlie@example.com", userType: VIP },
    { id: "4", name: "Diana", email: "diana@example.com", userType: REGULAR }
  ]){
    id
  }
  productList(list: [
    { id: "1", name: "Laptop", price: 999.99 },
    { id: "2", name: "Phone", price: 499.99 },
    { id: "3", name: "Tablet", price: 299.99 },
    { id: "4", name: "Monitor", price: 199.99 },
    { id: "5", name: "Keyboard", price: 49.99 }
  ]){
    id
  }
  orderList(list: [
    {
      id: "1",
      user: { where: { id: {val : "1"} } },
      items: [
        { id: "1", product: { where: { id: {val : "1"} } }, quantity: 1 },
        { id: "2", product: { where: { id: {val : "3"} } }, quantity: 2 }
      ]
    },
    {
      id: "2",
      user: { where: { id: {val : "2"} } },
      items: [
        { id: "3", product: { where: { id: {val : "2"} } }, quantity: 1 }
      ]
    },
    {
      id: "3",
      user: { where: { id: {val : "3"} } },
      items: [
        { id: "4", product: { where: { id: {val : "4"} } }, quantity: 2 },
        { id: "5", product: { where: { id: {val : "5"} } }, quantity: 3 }
      ]
    },
    {
      id: "4",
      user: { where: { id: {val : "4"} } },
      items: [
        { id: "6", product: { where: { id: {val : "1"} } }, quantity: 1 },
        { id: "7", product: { where: { id: {val : "2"} } }, quantity: 1 },
        { id: "8", product: { where: { id: {val : "3"} } }, quantity: 1 }
      ]
    }
  ]){
    id
  }
}
```

复制以上内容到客户端执行即可
![example data](./img/mutationExampleData.png "example data")

