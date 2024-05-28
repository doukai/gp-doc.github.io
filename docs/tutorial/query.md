---
sidebar_position: 3
---

# 查询(query)
快速浏览查询示例.

## 基本查询

### 1. 查询前5个用户
```graphql
query {
  userList(first: 5){
    name
    email
    userType
  }
}
```

```json
{
  "data": {
    "userList": [
      {
        "name": "Alice",
        "email": "alice@example.com",
        "userType": "VIP"
      },
      {
        "name": "Bob",
        "email": "bob@example.com",
        "userType": "REGULAR"
      },
      {
        "name": "Charlie",
        "email": "charlie@example.com",
        "userType": "VIP"
      },
      {
        "name": "Diana",
        "email": "diana@example.com",
        "userType": "REGULAR"
      },
      {
        "name": "Edward",
        "email": "edward@example.com",
        "userType": "VIP"
      }
    ]
  }
}
```

### 2. 查询名为Bob的用户
```graphql
query {
  user(name: {opr: EQ, val: "Bob"}){
    name
    email
    userType
  }
}
```

```json
{
  "data": {
    "user": {
      "name": "Bob",
      "email": "bob@example.com",
      "userType": "REGULAR"
    }
  }
}
```

### 3. 查询所有会员用户
```graphql
query {
  userList(userType: {opr: EQ, val: VIP}){
    name
  }
}
```

```json
{
  "data": {
    "userList": [
      {
        "name": "Alice"
      },
      {
        "name": "Charlie"
      },
      {
        "name": "Edward"
      },
      {
        "name": "George"
      },
      {
        "name": "Ian"
      },
      {
        "name": "Kyle"
      },
      {
        "name": "Mike"
      },
      {
        "name": "Oliver"
      },
      {
        "name": "Quentin"
      },
      {
        "name": "Steve"
      }
    ]
  }
}
```

### 4. 查询价格大于200的产品列表
```graphql
query {
  productList(price: {opr: GT, val: 200}){
    name
    price
  }
}
```

```json
{
  "data": {
    "productList": [
      {
        "name": "Laptop",
        "price": 999.99
      },
      {
        "name": "Phone",
        "price": 499.99
      },
      {
        "name": "Tablet",
        "price": 299.99
      }
    ]
  }
}
```

### 5. 查询产品列表, 价格由高到低
```graphql
query {
  productList(orderBy: {price: DESC}){
    name
    price
  }
}
```

```json
{
  "data": {
    "productList": [
      {
        "name": "Laptop",
        "price": 999.99
      },
      {
        "name": "Phone",
        "price": 499.99
      },
      {
        "name": "Tablet",
        "price": 299.99
      },
      {
        "name": "Monitor",
        "price": 199.99
      },
      {
        "name": "Keyboard",
        "price": 49.99
      }
    ]
  }
}
```

### 6. 查询价格在300以内, 价格最高的产品
```graphql
query {
  product(price: {opr: LTE, val:300}){
    name
    priceMax
  }
}
```

```json
{
  "data": {
    "product": {
      "name": "Tablet",
      "priceMax": 299.99
    }
  }
}
```

### 7. 分组查询普通用户和会员用户的数量
```graphql
query {
  userList(groupBy: ["userType"]){
    userType
    idCount
  }
}
```

```json
{
  "data": {
    "userList": [
      {
        "userType": "VIP",
        "idCount": 10
      },
      {
        "userType": "REGULAR",
        "idCount": 10
      }
    ]
  }
}
```