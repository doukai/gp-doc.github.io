---
sidebar_position: 4
---

# 变更(mutation)

快速浏览变更示例

## 变更

### **变更接口**

| 接口名     | 类型     | 参数                                     | 说明     | 示例 (Type=User) |
| ---------- | -------- | ---------------------------------------- | -------- | ---------------- |
| (type)     | (Type)   | [(Type)MutationArguments](#变更参数)     | 变更单条 | user             |
| (type)List | [(Type)] | [(Type)ListMutationArguments](#变更参数) | 变更列表 | userList         |

#### **变更逻辑**

变更包含新增和更新两种操作, 根据 `ID` 字段区分, 逻辑如下

| 变更参数是否存在 `ID` 字段 | 数据库是否存在 `ID` 字段 | 数据库操作 | `ID` 字段操作   |
| ------------------------ | ---------------------- | ---------- | ------------- |
| 是                       | 是                     | 更新       | --            |
| 是                       | 否                     | 新增       | 数据库保存 ID |
| 否                       | --                     | 新增       | 数据库生成 ID |

### 变更单条

使用字段同名参数变更内容

例: 新增用户 Uma

```graphql
mutation {
  user(
    name: "Uma"
    email: "uma@example.com"
    userType: VIP
    phoneNumbers: ["13918124629", "18536492446"]
  ) {
    id
    name
    email
    phoneNumbers
    userType
  }
}
```

数据库自动生成 id

```json
{
  "data": {
    "user": {
      // highlight-start
      "id": "21",
      // highlight-end
      "name": "Uma",
      "email": "uma@example.com",
      "phoneNumbers": ["13918124629", "18536492446"],
      "userType": "VIP"
    }
  }
}
```

### 变更列表

使用 [`list`](#变更参数) 参数变更多个对象

例: 新增用户 Victor 和 Wendy

```graphql
mutation {
  userList(
    list: [
      {
        name: "Victor"
        email: "victor@example.com"
        userType: REGULAR
        phoneNumbers: ["17250165257", "15548312357"]
      }
      {
        id: "23"
        name: "Wendy"
        email: "wendy@example.com"
        userType: VIP
        phoneNumbers: ["19703870624"]
      }
    ]
  ) {
    id
    name
    email
    phoneNumbers
    userType
  }
}
```

Victor 的 id 由数据库生成, Wendy 的 id 是变更时指定

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
        "phoneNumbers": ["17250165257", "15548312357"],
        "userType": "REGULAR"
      },
      {
        // highlight-start
        "id": "23",
        // highlight-end
        "name": "Wendy",
        "email": "wendy@example.com",
        "phoneNumbers": ["19703870624"],
        "userType": "VIP"
      }
    ]
  }
}
```

### 关联变更

使用字段同名参数变更关联对象, 关联对象不存在时新增对象

例: 新增用户 Xander, 同时在订单中新增产品 Mouse

```graphql
mutation {
  user(
    name: "Xander"
    email: "xander@example.com"
    userType: REGULAR
    orders: [
      { items: [{ product: { name: "Mouse", price: 25.99 }, quantity: 2 }] }
    ]
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
{
  productList {
    id
    name
    price
  }
}
```

例: 新增产品 Mouse

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

---

## 更新

### 使用 `ID` 字段参数更新

例: 通过 `ID` 字段参数更新 Uma 的用户类型

```graphql
mutation {
  user(id: "21", name: "Uma", userType: REGULAR) {
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

### 使用 `where` 参数更新

有时 Object 中存在非空字段, 例如 User 的 name 字段, 需在更新时额外输入, 此时可使用 [`where`](#变更参数) 参数更新

例: 通过 `where` 参数更新 Uma 的用户类型

```graphql
mutation {
  user(userType: VIP, where: { id: { opr: EQ, val: "21" } }) {
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

---

## 删除

使用 `isDeprecated: true` 删除对象

例: 删除用户 Wendy

```graphql
mutation {
  user(isDeprecated: true, where: { id: { opr: EQ, val: "23" } }) {
    id
    name
  }
}
```

```json
{
  "data": {
    "user": null
  }
}
```

---

## 合并对象数组

对象数组[Object]除全量变更外, 有时需要添加或移除元素, 使用 `@merge` 指令进行元素数组合并

例: 查询 Diana 的订单

```graphql
{
  user(name: { opr: EQ, val: "Diana" }) {
    name
    orders {
      id
      items {
        id
        product {
          name
        }
        quantity
      }
    }
  }
}
```

```json
{
  "data": {
    "user": {
      "name": "Diana",
      "orders": [
        {
          // highlight-start
          "id": "4",
          // highlight-end
          "items": [
            {
              "id": "6",
              "product": {
                "name": "Laptop"
              },
              "quantity": 1
            },
            {
              "id": "7",
              "product": {
                "name": "Phone"
              },
              "quantity": 1
            },
            {
              "id": "8",
              "product": {
                "name": "Tablet"
              },
              "quantity": 1
            }
          ]
        }
      ]
    }
  }
}
```

### 增加

例: Diana 的订单增加 2 个 Keyboard

使用 `where: {id: {opr: EQ, val: "4"}}` 选择 Diana 的订单, 使用 `where: {id: {opr: EQ, val: "5"}}` 选择 Keyboard

`where` 参数除了作为更新条件之外, 还可通过 `ID` 字段参数选择对象

```graphql
mutation {
  order(
    items: [{ product: { where: { id: { opr: EQ, val: "5" } } }, quantity: 2 }]
    where: { id: { opr: EQ, val: "4" } }
  ) @merge {
    id
    items {
      id
      product {
        name
      }
      quantity
    }
  }
}
```

```json
{
  "data": {
    "order": {
      "id": "4",
      "items": [
        {
          "id": "6",
          "product": {
            "name": "Laptop"
          },
          "quantity": 1
        },
        {
          "id": "7",
          "product": {
            "name": "Phone"
          },
          "quantity": 1
        },
        {
          "id": "8",
          "product": {
            "name": "Tablet"
          },
          "quantity": 1
        },
        // highlight-start
        {
          "id": "10",
          "product": {
            "name": "Keyboard"
          },
          "quantity": 2
        }
        // highlight-end
      ]
    }
  }
}
```

### 移除

例: 移除 Diana 的订单中的 Tablet

使用 `where: {id: {opr: EQ, val: "4"}}` 选择 Diana 的订单, 使用 `where: {id: {opr: EQ, val: "8"}}` 选择 Tablet 所在的订单项, 使用 `isDeprecated: true` 移除元素

```graphql
mutation {
  order(
    items: [{ isDeprecated: true, where: { id: { opr: EQ, val: "8" } } }]
    where: { id: { opr: EQ, val: "4" } }
  ) @merge {
    id
    items {
      id
      product {
        name
      }
      quantity
    }
  }
}
```

```json
{
  "data": {
    "order": {
      "id": "4",
      "items": [
        {
          "id": "6",
          "product": {
            "name": "Laptop"
          },
          "quantity": 1
        },
        {
          "id": "7",
          "product": {
            "name": "Phone"
          },
          "quantity": 1
        },
        {
          "id": "10",
          "product": {
            "name": "Keyboard"
          },
          "quantity": 2
        }
      ]
    }
  }
}
```

---

## **变更参数**

| 参数名       | 类型                                                             | 默认值 | 说明                                                        | SQL 示例 (x=10 y=5)                                                                                                                          |
| ------------ | ---------------------------------------------------------------- | ------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| (field)      | Scalar/Enum/[(Object)Input](#objectinput-参数)                   | 无     | 变更字段                                                    | INSERT INTO t ( id, field ) VALUES ( 'x', 'y' ) ON DUPLICATE KEY UPDATE t.id = VALUES ( t.id ), t.field = VALUES ( t.field )                 |
| input        | [(Object)Input](#objectinput-参数)                               | 无     | 变更对象(把所有字段封装在对象内变更, 常用于 `$变量` 的使用) | 同上                                                                                                                                         |
| list         | [[(Object)Input](#objectinput-参数)]                             | 无     | 变更对象列表                                                | INSERT INTO t ... ON DUPLICATE KEY UPDATE ...; INSERT INTO t ... ON DUPLICATE KEY UPDATE ...; INSERT INTO t ... ON DUPLICATE KEY UPDATE ...; |
| where        | [(Object)Expression](/docs/tutorial/query#objectexpression-参数) | 无     | 更新条件                                                    | UPDATE t SET field = 'z' WHERE id = 'x'                                                                                                      |
| isDeprecated | Boolean                                                          | false  | 删除标记( `@merge` 指令存在时表示从数组中移除)              |                                                                                                                                              |

#### (Object)Input 参数

| 参数名       | 类型                                                             | 默认值 | 说明                                           | SQL 示例                                                                                                                     |
| ------------ | ---------------------------------------------------------------- | ------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| (field)      | Scalar/Enum/[(Object)Input](#objectinput-参数)                   | 无     | 变更字段                                       | INSERT INTO t ( id, field ) VALUES ( 'x', 'y' ) ON DUPLICATE KEY UPDATE t.id = VALUES ( t.id ), t.field = VALUES ( t.field ) |
| where        | [(Object)Expression](/docs/tutorial/query#objectexpression-参数) | 无     | 更新条件                                       | UPDATE t SET field = 'z' WHERE id = 'x'                                                                                      |
| isDeprecated | Boolean                                                          | false  | 删除标记( `@merge` 指令存在时表示从数组中移除) |                                                                                                                              |
