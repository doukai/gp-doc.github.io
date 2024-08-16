---
sidebar_position: 2
---

# 授权(Authorization)

授权 (Authorization) 是在用户通过身份验证后, 决定其对资源或操作访问权限的过程. 授权确保用户只能访问或操作其被授予权限的部分, 授权是确保系统安全的重要机制, 防止未授权用户访问敏感数据或执行关键操作

[**Graphence**](https://github.com/doukai/graphence) 使用 [Casbin](https://casbin.org/) 作为授权管理器, Casbin 是一个支持多种访问控制模型 (如 ACL, RBAC, ABAC) 的开源授权框架, 具有灵活的策略管理, 跨语言支持, 高性能和强可扩展性等特点. 它适用于各种复杂权限管理需求, 提供丰富的存储适配器和简洁的 API

## 授权模型

[**Graphence**](https://github.com/doukai/graphence) 默认使用 [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) 作为授权模型

```graphql
"用户"
type User {
  "姓名"
  name: String!
  "账号"
  login: String!
  "组"
  groups: [Group]
  "角色"
  roles: [Role]
  "租户"
  realm: Realm
}

"角色"
type Role {
  "名称"
  name: String!
  "用户"
  users: [User]
  "组"
  groups: [Group]
  "组合"
  composites: [Role]
  "权限"
  permissions: [Permission]
  "租户"
  realm: Realm
}

"组"
type Group {
  "名称"
  name: String!
  "上级"
  parent: Group
  "下级"
  subGroups: [Group]
  "用户"
  users: [User]
  "角色"
  roles: [Role]
  "租户"
  realm: Realm
}

"租户"
type Realm {
  "名称"
  name: String!
}

"权限"
type Permission {
  "名称"
  name: ID!
  "字段"
  field: String!
  "实体"
  type: String!
  "权限类型"
  permissionType: PermissionType!
  "角色"
  roles: [Role]
  "租户"
  realm: Realm
}

"权限类型"
enum PermissionType {
  "读取"
  READ
  "写入"
  WRITE
}
```

在 RBAC (Role-Based Access Control) 模型中, 用户, 角色, 资源, 权限和用户组是五个核心元素. 它们相互关联, 共同构成了访问控制的基础. 下面分别介绍它们的作用:

### 1. 用户 (User)

**用户**是系统中的主体, 通常代表实际的个人, 服务账号或其他实体. 在 RBAC 模型中, 用户并不会直接被赋予权限, 而是通过被分配一个或多个角色来获得相应的权限. 用户的主要作用是执行系统中的操作, 并通过角色来确定其可以执行哪些操作或访问哪些资源

### 2. 角色 (Role)

**角色**是权限的集合, 它代表系统中的某种功能或职责. 每个角色与一组特定的权限关联, 用户通过被赋予角色来获得这些权限. 角色的主要作用是简化权限管理, 通过角色的配置, 可以灵活调整和控制用户的权限, 而无需逐个管理用户与权限的关系

### 3. 资源 (Resource)

**资源**是系统中的受保护对象, 用户可以访问或操作的 GraphQL 对象(Object)和字段(Field)

### 4. 权限 (Permission)

**权限**是对资源的访问或操作权利, 与读取(READ), 写入(WRITE)操作相关联. 每个角色与一组权限关联, 角色决定了用户可以执行哪些操作或访问哪些资源. 权限的主要作用是控制用户对资源的访问, 确保系统的安全性和操作的合法性

### 5. 用户组 (Group)

**用户组**是用户的集合, 代表具有相似访问需求的一组用户. 在某些 RBAC 实现中, 用户组可以简化用户的角色分配. 通过将角色赋予用户组, 而不是单独的用户, 系统管理员可以更有效地管理和调整大规模用户的权限配置. 用户组的主要作用是为具有相同职责或权限要求的用户群体提供统一的权限管理

### 作用关系

- **用户**通过**用户组**或直接分配获得一个或多个**角色**
- **角色**与一组**权限**关联, 定义了用户可以对哪些**资源**执行哪些操作
- **资源**受到**权限**的保护, 确保只有特定角色的用户才能访问或操作

通过这些元素的组合, RBAC 模型提供了一个灵活而强大的访问控制机制, 使得权限管理更加简化, 高效, 尤其在复杂系统或大型组织中尤为有效

## 模型配置

[授权模型](#授权模型)需要转换为 Casbin 的[模型配置(Model)](https://casbin.org/zh/docs/syntax-for-models)后生效. Casbin 支持多种访问控制模型 (如 ACL, RBAC, ABAC), 可以根据不同场景灵活配置[模型文件](https://casbin.org/zh/docs/supported-models)

基于租户架构的 RBAC 模型配置:

```conf title="model.conf"
[request_definition]
r = sub, dom, obj, act

[policy_definition]
p = sub, dom, obj, act

[role_definition]
g = _, _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub, r.dom) && r.dom == p.dom && r.obj == p.obj && r.act == p.act || r.sub == "U::1"
```

_`[matchers]` 配置中 `|| r.sub == "U::1"` 表示初始管理员可以跳过授权拦截, 为开发环境提供便利_

- `U::`(用户前缀): `U::1` 表示 `id = 1` 的用户
- `R::`(角色前缀): `R::1` 表示 `id = 1` 的角色
- `G::`(用户组前缀): `G::1` 表示 `id = 1` 的用户组

## 权限字符串

[**Graphence**](https://github.com/doukai/graphence) 通过权限字符串控制对象和字段的访问, 权限字符串格式: `对象名::字段名::操作`

例:

1. 读取用户名: `User::name::READ`
2. 写入角色名: `Role::name::WRITE`

使用配置 `security.buildPermission` 自动生成权限字符串, Graphence 通过 Object 和 Field 的定义自动生成对应的权限字符串

```conf
security {
  buildPermission = true
}
```

## 授权拦截

未授权的查询和变更都会被 Graphence 自动拦截和屏蔽

例: 用户拥有 `Product` 对象的权限:

- `Product::name::READ`,
- `Product::price::READ`,
- `Product::price::WRITE`

查询时, 由于没有 `id` 字段的 `READ` 权限, `id` 字段将会被屏蔽

```graphql
{
  roductList {
    // highlight-start
    id
    // highlight-end
    name
    price
  }
}
```

```json
{
  "data": {
    "roductList": [
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

变更时, 由于没有 `name` 字段的 `WRITE` 权限, `name` 参数将会被拦截

```graphql
{
  roduct(
    // highlight-start
    name: "Notebook"
    // highlight-end
    price: 1000.00
    where: { id: { name: { opr: EQ, val: "Laptop" } } }
  ) {
    id
    name
    price
  }
}
```

```json
{
  "data": {
    "roduct": {
      // highlight-start
      "name": "Laptop",
      // highlight-end
      "price": 1000.99
    }
  }
}
```

## 配置权限

通过对角色(Role)增加或删除权限(Permission)控制对资源的访问

例: 为角色(`id = 1`) 添加对 `User` 对象 `name` 字段的 `READ` 权限

```graphql
mutation {
  role(
    permissions: [{ where: { name: { val: "User::name::READ" } } }]
    where: { id: { val: "1" } }
  ) @merge {
    name
    permissions {
      name
    }
  }
}
```

## 配置角色

通过对用户(User)或用户组(Group)增加或删除角色(Role)获得访问权限(Permission)

例: 为用户(`id = 1`) 添加角色(`id = 1`) 获得对 `User` 对象 `name` 字段的 `READ` 权限

```graphql
mutation {
  user(roles: [{ where: { id: { val: "1" } } }], where: { id: { val: "1" } })
    @merge {
    name
    roles {
      name
    }
  }
}
```

## 角色组合

通过对角色(Role)增加或删除其他角色(Role)组合角色权限

例: 为角色(`id = 1`) 添加组合角色(`id = 2`), 角色(`id = 1`)将继承角色(`id = 2`)拥有的权限

```graphql
mutation {
  role(
    composites: [{ where: { id: { val: "2" } } }]
    where: { id: { val: "1" } }
  ) @merge {
    name
    composites {
      name
    }
  }
}
```
