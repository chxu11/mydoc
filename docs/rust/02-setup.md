---
title: 2.环境搭建
slug: '2'
mapShort: 环境
description: 从零安装 Rust 工具链（rustup / cargo）、配置 VS Code + rust-analyzer，跑通 Hello, World 与第一次 cargo run。
keywords: [Rust, rustup, cargo, VS Code, rust-analyzer, 环境搭建]
tags: [Rust]
---

# 阶段 2：环境搭建

## 🎯 学习目标

- 一条命令装好 Rust 工具链（rustup + cargo + rustc）
- 理解 rustup / cargo / rustc 三者分工，不再混淆
- 配置编辑器（VS Code + rust-analyzer），获得即时错误提示
- 跑通第一个 `cargo run` 项目

---

## 🍔 一句话理解三件套

> - **rustup** = 应用商店，管版本、切 nightly、装卸工具
> - **cargo** = 项目管家，创建 / 构建 / 测试 / 发布一条龙
> - **rustc** = 编译器本尊，平时不直接调，都是 cargo 在幕后帮你喊它

---

## 一、安装 Rust

### macOS / Linux

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Windows

到 [rustup.rs](https://rustup.rs/) 下载 `rustup-init.exe`，双击一路 Next（默认即可）。

装完打开**新终端**验证：

```bash
rustc --version
cargo --version
```

看到类似 `rustc 1.8x.0 (...)` 就成功。

:::tip 国内加速
如果 `cargo build` 拉依赖慢，把 crates.io 换成 RUST 社区镜像：在 `~/.cargo/config.toml` 里加 `rsproxy.cn` 源，具体配置见文末。
:::

---

## 二、创建第一个项目

```bash
cargo new hello_rust
cd hello_rust
cargo run
```

预期输出：

```
   Compiling hello_rust v0.1.0 (...)
    Finished dev [unoptimized + debuginfo] target(s)
     Running `target/debug/hello_rust`
Hello, world!
```

`cargo new` 会帮你生成：

```
hello_rust/
├── Cargo.toml      # 项目清单，类似 package.json
├── src/
│   └── main.rs     # 入口，可执行文件项目用 main.rs
└── .gitignore
```

---

## 三、rustup 常用操作

| 想做什么 | 命令 |
|---|---|
| 更新到最新稳定版 | `rustup update stable` |
| 切换到 nightly（用 unstable 特性） | `rustup default nightly` |
| 只在本项目锁 nightly | 项目根放 `rust-toolchain.toml` 写 `channel = "nightly"` |
| 添加交叉编译目标 | `rustup target add wasm32-unknown-unknown` |
| 卸载 | `rustup self uninstall` |

---

## 四、编辑器配置（VS Code）

1. 装扩展：**rust-analyzer**（官方推荐，比旧版 `Rust` 扩展快很多）
2. `settings.json` 建议加：

```json
{
  "editor.formatOnSave": true,
  "rust-analyzer.check.command": "clippy"
}
```

3. 装格式化工具（一次性）：

```bash
rustup component add rustfmt clippy
```

保存文件即自动 `cargo fmt`，写错代码左侧实时标红。

---

## 五、常见坑

:::warning 装完 rustup 命令找不到
99% 是没**新开终端**。rustup 会把 `~/.cargo/bin` 追加到 PATH，旧终端不会自动 reload。
:::

:::warning Windows 提示缺少 `link.exe`
Rust 依赖 MSVC 链接器。安装 Visual Studio Build Tools，勾选 "C++ 桌面开发" 即可。
:::

:::warning 用 sudo 装 rust 的东西
不需要。rustup 全部装在 `$HOME`，用 `sudo` 反而会污染 root。
:::

---

## 六、国内镜像配置（可选，加速明显）

编辑 `~/.cargo/config.toml`：

```toml
[source.crates-io]
replace-with = 'rsproxy'

[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"

[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"

[net]
git-fetch-with-cli = true
```

---

## ✅ 阶段 2 总结

1. **rustup 管版本，cargo 管项目，rustc 管编译**，各司其职
2. VS Code + rust-analyzer 是当下最省心的 Rust 编辑器组合
3. 装好后立刻配国内镜像，否则第一次 `cargo build` 会慢到怀疑人生

**下一步**：环境装好，进入[阶段 3：变量与类型](../rust/03-variables-types.md)——默认不可变、`mut` 与 shadowing 的差别，以及"几乎所有东西都是表达式"这个思维转弯。

---

## 💡 动手练习

1. `cargo new --lib mylib` 建一个库项目，观察和 `--bin` 项目结构有什么不同
2. 故意把 `fn main()` 改成 `fn Main()`，看 rustc 报什么错（提前适应 Rust 的错误信息密度）
3. 运行 `cargo clippy`，看看它对你 `Hello, world` 项目有没有建议
