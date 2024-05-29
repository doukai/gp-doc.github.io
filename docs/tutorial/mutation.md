---
sidebar_position: 4
---

# 变更(mutation)
快速浏览变更示例.

变更包含新增(Insert)和更新(Update)两种操作, 在GraphQL的基础之上, 我们规定:

1. 每个Object**有且仅有1个ID类型的字段**
2. 在变更时, 如果ID类型的字段为空, 则新增, ID字段由数据库自动生成
3. 在变更时, 如果ID类型的字段不为空, 则由数据库判断, 数据库包含该值时更新, 反之则进行新增

另外, 查询(query)字段时, 是并行执行, 而**变更(mutation)字段时, 是线性执行, 一个接着一个**

## 基本变更
变更单个: 类型名 => camelCase (例: User => user)

变更列表: 类型名 => camelCase + List (例: User => userList)

### 1. 新增用户Uma
```graphql
mutation {
  user(name: "Uma" email: "uma@example.com" userType: VIP phoneNumbers: ["13918124629", "18536492446"]) {
    id
    name
    email
    phoneNumbers
    userType
  }
}
```
数据库自动生成id
```json
{
  "data": {
    "user": {
    // highlight-start
      "id": "21",
    // highlight-end
      "name": "Uma",
      "email": "uma@example.com",
      "phoneNumbers": [
        "13918124629",
        "18536492446"
      ],
      "userType": "VIP"
    }
  }
}
```

### 2. 新增用户Victor和Wendy
```graphql
mutation {
  userList(list: [
    {name: "Victor" email: "victor@example.com" userType: REGULAR phoneNumbers: ["17250165257", "15548312357"]},
    {id: "23" name: "Wendy" email: "wendy@example.com" userType: VIP phoneNumbers: ["19703870624"]}
  ]) {
    id
    name
    email
    phoneNumbers
    userType
  }
}
```
Victor的id由数据库生成, Wendy的id是变更时指定
```json
{
  "data": {
    "userList": [
      {
        // highlight-start
        "id": "22",
        // highlight-end
        "name": "Victor",
        "email": "victor@example.com",
        "phoneNumbers": [
          "17250165257",
          "15548312357"
        ],
        "userType": "REGULAR"
      },
      {
        // highlight-start
        "id": "23",
        // highlight-end
        "name": "Wendy",
        "email": "wendy@example.com",
        "phoneNumbers": [
          "19703870624"
        ],
        "userType": "VIP"
      }
    ]
  }
}
```

### 3. 新增用户Xander, 同时购买新增的产品Mouse
```graphql
mutation {
  user(name: "Xander" email: "xander@example.com" userType: REGULAR 
    orders: [{items: [{product: {name: "Mouse" price: 25.99} quantity: 2}]}]
  ) {
    id
    name
    email
    userType
    orders {
      items {
        product {
          name
        }
        quantity
      }
    }
  }
}
```
数据库自动生成id
```json
{
  "data": {
    "user": {
      "id": "24",
      "name": "Xander",
      "email": "xander@example.com",
      "userType": "REGULAR",
      "orders": [
        {
          "items": [
            {
              "product": {
                "name": "Mouse"
              },
              "quantity": 2
            }
          ]
        }
      ]
    }
  }
}
```

```graphql
query {
  productList {
    id
    name
    price
  }
}
```
新增产品Mouse
```json
{
  "data": {
    "productList": [
      {
        "id": "1",
        "name": "Laptop",
        "price": 999.99
      },
      {
        "id": "2",
        "name": "Phone",
        "price": 499.99
      },
      {
        "id": "3",
        "name": "Tablet",
        "price": 299.99
      },
      {
        "id": "4",
        "name": "Monitor",
        "price": 199.99
      },
      {
        "id": "5",
        "name": "Keyboard",
        "price": 49.99
      },
    // highlight-start
      {
        "id": "6",
        "name": "Mouse",
        "price": 25.99
      }
    // highlight-end
    ]
  }
}
```

## 更新
### 1. 通过ID类型字段更新Uma的用户类型
```graphql
mutation {
  user(id: "21" name: "Uma" userType: REGULAR) {
    id
    name
    userType
  }
}
```

```json
{
  "data": {
    "user": {
      "id": "21",
      "name": "Uma",
    // highlight-start
      "userType": "REGULAR"
    // highlight-end
    }
  }
}
```

### 2. 通过where字段更新Uma的用户类型
有些时候Object中存在非空字段, 例如User的name字段, 需要在更新时额外输入, 此时可以使用where字段进行更新
```graphql
mutation {
  user(userType: VIP where: {id: {opr: EQ val: "21"}}) {
    id
    name
    userType
  }
}
```

```json
{
  "data": {
    "user": {
      "id": "21",
      "name": "Uma",
    // highlight-start
      "userType": "VIP"
    // highlight-end
    }
  }
}
```