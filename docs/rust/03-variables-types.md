---
title: 3.变量与类型
slug: '3'
mapShort: 变量
description: 深入理解 Rust 变量的默认不可变、mutable 与 shadowing 的差异，掌握标量/复合类型，以及"几乎所有东西都是表达式"这一核心思维。
keywords: [Rust, 变量, let, mut, shadowing, i32, 类型系统]
tags: [Rust]
---

# 阶段 3：变量与类型

## 🎯 学习目标

- 建立"Rust 变量默认不可变"的肌肉记忆
- 分清 **mut 可变** vs **shadowing 遮蔽**——两者看着像，实际语义完全不同
- 掌握 Rust 的基本类型体系：整数 / 浮点 / 布尔 / 字符 / 元组 / 数组
- 理解"表达式 vs 语句"，为后面写 `match`、闭包打下思维基础

---

## 🍔 一句话比喻

> Rust 的 `let` 就像**给盒子贴标签**：
> - `let mut x = 1;` = 贴了标签，还允许你**换掉里面的东西**（同一个盒子）
> - `let x = 1; let x = 2;` = **完全换一个新盒子**，只是名字相同，旧盒子还在（只是再也拿不到了）
>
> 这个差别看着微小，实际决定了你能不能理解 Rust 后面的 move / borrow。

---

## 一、let 与不可变性

Rust 变量**默认不可变**：

```rust
let x = 5;
x = 6; // ❌ 编译错误：cannot assign twice to immutable variable
```

要能改，显式加 `mut`：

```rust
let mut x = 5;
x = 6; // ✅
```

:::tip 为什么默认不可变？
不可变 = 并发安全 = 编译器更容易优化。这是 Rust 从设计上把"函数式风格"作为默认值的取舍，习惯之后回不去。
:::

---

## 二、Shadowing：重新声明同名变量

```rust
fn main() {
    let x = 5;        // x: i32
    let x = x + 1;    // 新的 x: i32，值 = 6
    let x = "hello";  // 再新的 x: &str ← 类型都变了，仍然合法！
    println!("{}", x); // hello
}
```

### ⚠️ Shadowing 与 `mut` 的本质差异

| 对比点 | `let mut` | Shadowing (`let x = ...` 多次) |
|---|---|---|
| 是否同一个变量 | ✅ 是 | ❌ 全新的变量（同名） |
| 能否改变**类型** | ❌ 只能同类型 | ✅ 可以变成不同类型 |
| 能否改变**所有权** | ❌ 只能同所有权 | ✅ 可以从"拥有"变成"借用" |
| 常见用途 | 循环计数器、累加 | 值逐步变换（parse → trim → to_lowercase） |

**典型 shadowing 场景**（把 String 变成 &str 再变成 i32）：

```rust
let input: String = String::from(" 42 ");
let input: &str = input.trim();       // String → &str，改变类型
let input: i32 = input.parse().unwrap(); // &str → i32，改变类型
println!("{}", input + 1);            // 43
```

---

## 三、标量类型

Rust 有 4 种"基本"标量：**整数、浮点、布尔、字符**。

### 整数

| 有符号 | 无符号 | 位数 |
|---|---|---|
| `i8` `i16` `i32` `i64` `i128` `isize` | `u8` `u16` `u32` `u64` `u128` `usize` | 8 ~ 128 位 |

- 默认类型：整数默认 **`i32`**，浮点默认 **`f64`**
- `usize` / `isize` 依赖平台（32 位系统 = 32 位，64 位系统 = 64 位），常用于**索引 / 长度**
- 溢出行为：debug 模式 panic，release 模式 wrap around
- 字面量支持分隔符：`let n = 1_000_000;` 更可读

:::warning 不要盲目模仿 C 用 `int`
Rust 没有 `int`。用 `i32`。索引 vector 用 `usize`，别混。
:::

### 浮点

```rust
let x: f64 = 3.14;  // 默认
let y: f32 = 2.5;
```

### 布尔

```rust
let t: bool = true;
```

只有 `true` / `false`，不能像 C 那样用 0/1 代替。

### 字符 `char`

```rust
let c: char = 'A';       // 单引号
let emoji: char = '🦀';   // Rust char 是 4 字节 Unicode，一个 emoji 就是一个 char
let s: &str = "胖头鱼";    // 双引号是字符串切片
```

:::info `char` vs `&str`
- `'A'` 是一个字符
- `"A"` 是**字符串**（哪怕只有一个字符），类型是 `&str`
- Rust 字符串底层是 UTF-8 字节，所以不能直接 `s[0]` 拿"字符"
:::

---

## 四、复合类型：元组与数组

### 元组 tuple —— 定长、异构

```rust
let tup: (i32, f64, char) = (500, 6.4, '🦀');
let (x, y, z) = tup;              // 解构
println!("{}", x);
println!("{}", tup.2);            // 索引访问
```

### 数组 array —— 定长、同类型、栈上

```rust
let a: [i32; 5] = [1, 2, 3, 4, 5];
let b = [3; 5];                   // [3, 3, 3, 3, 3]
println!("{}", a[0]);
println!("{}", a.len());
```

:::warning 数组越界
debug 模式 panic，不是未定义行为。Rust 会检查边界。
:::

大多数时候你会用 **`Vec<T>`**（堆上动态数组），这在阶段 8 会详细讲。

---

## 五、表达式 vs 语句：Rust 的思维差异

**这是很多人从 C/JS 转过来时最不适应的点。**

Rust 里**几乎所有东西都是表达式（expression）**——表达式会返回一个值。

| 表达式（有返回值） | 语句（无返回值） |
|---|---|
| `1 + 2` | `let x = 5;` |
| `if cond { 1 } else { 2 }` | `loop { break; }` |
| `match x { ... }` | 循环标签 `continue 'a;` |
| 块 `{ 42 }` | 空结构体定义 |

因此你可以这样写：

```rust
let number = if true { 5 } else { 6 };  // ✅ if 是表达式
```

对比 JS/C 里 `if` 是语句，必须写 `? :` 三元。Rust 不需要三元，因为 `if/else` 天然就是三元。

:::danger 加分号的坑
```rust
let x = {
    let y = 3;
    y + 1    // ← 没分号 = 表达式 = 4
};           // x = 4

let z = {
    let y = 3;
    y + 1;   // ← 加了分号 = 语句 = ()（unit）
};
// z 类型变成 ()，不再是 i32
```

**Rust 函数最后一个表达式不要加分号**，否则返回值变成 `()`。这是新手第一大坑。
:::

---

## 六、类型注解与推断

Rust 有强大的类型推断：

```rust
let x = 5;                 // 推断为 i32
let v = vec![1, 2, 3];     // Vec<i32>
```

但有些情况必须显式：

```rust
// ❌ 无法推断，因为没有实际使用
let x;
// ✅ 显式标注
let x: i32 = "hello".len() as i32;
```

`as` 是 Rust 里**唯一**的类型转换关键字，**没有隐式转换**：

```rust
let a: i32 = 100;
let b: u8 = a as u8;      // 必须显式
// let c: u8 = a;         // ❌ 编译错误
```

---

## 七、常量 const 与 static

```rust
const MAX_POINTS: u32 = 100_000;   // 编译期常量，必须有类型
static Greeting: &str = "Hi";      // 有固定内存地址，生命周期整个程序
```

`const` vs `let`：

| | `let` | `const` |
|---|---|---|
| 可变性 | 可加 `mut` | 永远不可变 |
| 出现位置 | 函数内也可 | 一般在全局 |
| 内联 | 有栈槽 | 每个使用点内联展开 |

---

## ✅ 阶段 3 总结

1. **默认不可变**是 Rust 的哲学；要 `mut` 必须显式声明
2. **Shadowing ≠ mut**：shadowing 是新变量、可以改类型；mut 是同变量、不能改类型
3. **整数默认 i32，浮点默认 f64，`char` 是 Unicode 4 字节**
4. **一切皆表达式**：`if`、`match`、块都能返回值——最后一个表达式不要加分号
5. **`as` 是唯一转换关键字**，没有隐式类型转换

**下一步**：进入[阶段 4：所有权（Ownership）](../rust/04-ownership.md)——这是 Rust **真正意义上**与其他语言的转折点，也是编译错误 90% 的源头。

---

## 💡 动手练习

<details>
<summary>练习 1：观察 mut 与 shadowing 的差异（点击展开参考答案）</summary>

```rust
fn main() {
    // 1. 用 mut：类型必须是同一个
    let mut n = 5;
    n = n + 1;
    // n = "hello"; // ❌ 类型不匹配

    // 2. 用 shadowing：可以换类型
    let n = 5;
    let n = "hello";  // ✅ 全新变量
    let n = n.len();  // ✅ 又变回 usize
    println!("{}", n);
}
```
</details>

<details>
<summary>练习 2：温度转换（华氏度 → 摄氏度）用表达式写法</summary>

```rust
fn main() {
    let f: f64 = 98.6;
    // if 是表达式，块返回值不加分号
    let desc = if f > 100.0 { "发烧" } else { "正常" };
    let c = (f - 32.0) * 5.0 / 9.0;
    println!("{:.1}°F → {:.1}°C, 状态: {}", f, c, desc);
    // 输出：98.6°F → 37.0°C, 状态: 正常
}
```
</details>

<details>
<summary>练习 3：故意制造 E0308 类型错误并修复</summary>

```rust
fn main() {
    let x: u8 = 200;
    let y: u8 = 100;
    // let sum: u8 = x + y; // ❌ debug 模式会 panic: attempt to add with overflow
    let sum: u16 = x as u16 + y as u16; // ✅ 提升类型再相加
    println!("{}", sum); // 300
}
```
</details>
