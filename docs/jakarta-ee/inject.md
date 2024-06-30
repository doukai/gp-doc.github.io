---
sidebar_position: 1
---

# 依赖注入

依赖注入作为实现关系解偶和控制反转的一种设计模式已经成为Java开发的核心特性

著名的[Spring](https://spring.io/)框架最早就是以实现依赖注入而闻名, 随着时间的推移, Spring已经发展为一个庞然大物, 它变得无所不能的同时失去最开始的轻量级特性, 以[Spring Boot](https://spring.io/projects/spring-boot)为例, 由于依赖关系的复杂性和不同类库的的版本兼容问题, 每一个新版本的升级对于用户而言都已经成为了难于逾越的鸿沟

对反射技术的过度使用是Spring的另一个问题, 它使运行时的性能开销越来越大, 同时过多的程序逻辑和依赖关系隐藏在了运行时当中, 使得调试变得十分困难, 也无法使用编译器和IDE的错误检查, 更成为了Java Native化([GraalVM](https://www.graalvm.org/))的严重阻碍

基于以上背景, Graphoenix对依赖注入, 切面编程, 环境配置等Java企业级特性提供轻量级实现: [Nozdormu](https://github.com/doukai/nozdormu), 遵循最新的 [Jakarta Inject](https://github.com/jakartaee/inject) 和 [Jakarta CDI](https://jakarta.ee/specifications/cdi/4.1/jakarta-cdi-spec-4.1) 协议

Nozdormu的设计目标:
1. 保持轻量级: 只实现必要的企业级Java特性，不做过多的拓展, 保持简洁和低依赖
2. 运行时无反射: 把运行时的动态逻辑前移到编译阶段, 通过Annotation Processing在编译阶段完成IOC和AOP

最后Nozdormu可以被任何基于[Jakarta Inject](https://github.com/jakartaee/inject) 和 [Jakarta CDI](https://jakarta.ee/specifications/cdi/4.1/jakarta-cdi-spec-4.1) 协议的技术框架替换


