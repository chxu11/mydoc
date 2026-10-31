---
title: 5.函数与递归
slug: '5'
mapShort: 函数
description: 用 def 把一段逻辑收成可复用的黑盒（参数、返回值、作用域约定），再把它推向递归：基例、缩小、调用栈，以及汉诺塔 / 目录树 / 分形树三个必须亲手写的例子。
keywords: [Python, 函数, def, 参数, 返回值, 递归, base case, 调用栈, 尾递归, 汉诺塔, 分形]
tags: [Python]
concepts: [recursion]
---

# 阶段 5：函数与递归 · 把问题变成更小的自己

## 🎯 学习目标

- 写出签名清晰的函数：位置参数 / 强制具名参数 / 默认值 / 返回值
- 说清递归三要素：**基例**、**每次真的缩小**、**基例可达**
- 理解调用栈在替你记什么，以及为什么 Python **不做尾调用优化**
- 亲手写三个递归：阶乘、汉诺塔、目录树；分清 fib(35) 的「次数」与「深度」

---

## 🍔 一句话比喻

> 递归不是"函数没完没了地调用自己"，而是**把问题缩小成同一个问题的更小规模**，一直缩到它小得可以直接回答，再原路把答案带回来。
>
> 想知道这栋楼有多高，你不必从头量：只要问「1 楼到 27 楼多高」加上「27 楼到楼顶多高」——后一个问题还是同一个问题，只是更小。

---

## 一、先把函数三件套补齐

阶段 3 讲过 `def` 的语法，但一直没正经写函数。补上三条约定，它们比语法重要：

```python
def area(width, height=1):      # height 有默认值
    return width * height
```

| 部位 | 约定 | 反面样子 |
|---|---|---|
| 名字 | 动词短语：`load_config` / `count_words` | `config`、`data2` |
| 出口 | `return` 是给**下一个函数**用的 | 只 `print`，外面拿不到值 |
| 默认值 | 只在**定义那一刻求值一次** | `def f(lst=[])` 三只手共用同一个列表 |

最后一条是阶段 3 埋的雷，函数一多必踩：可变默认参数不是"每次调用新建一个"，
而是所有调用共用定义时创建的那一个。标准写法是 `lst=None` + 函数体内 `if lst is None: lst = []`。

### 位置参数 vs 关键字参数

```python
def create_user(name, age, *, city="未知"):
    return f"{name}/{age}/{city}"

create_user("Ada", 36, city="London")    # ✓
create_user("Ada", 36, "London")         # ✗ TypeError: city 只能具名传
```

`*` 之后的参数**必须**写名字。多参数函数一旦要加布尔开关（`send_mail=False`），
这个写法能让每个调用点自己解释自己，不用回头翻签名。

---

## 二、递归的三要素

```python
def fact(n: int) -> int:
    if n <= 1:                 # ① 基例：小到不用再拆
        return 1
    return n * fact(n - 1)     # ② 缩小：同一个问题，规模更小
```

三条检查，缺一条就是事故：

1. **有基例**——不然函数永远在拆
2. **每次调用规模真的变小**——`fact(n - 1)` 里那个 `-1` 就是全部
3. **基例可达**——最阴的一种错：把基例写成 `n == 1`，于是 `fact(0)` 走到 `-1`、`-3`、`-5`……一路冲向负无穷，永远碰不到 1

第三条炸的时候长这样：

```text
RecursionError: maximum recursion depth exceeded
```

CPython 的默认上限 `sys.getrecursionlimit()` 是 **1000**。它是保险丝，不是路障：
真撞上了，先回去检查上面三条，而不是把上限调到 100000。

---

## 三、栈在替你记笔记

`fact(4)` 在机器里是这样展开的：

```text
fact(4)              记着：回来要 ×4
 └ fact(3)           记着：回来要 ×3
    └ fact(2)        记着：回来要 ×2
       └ fact(1) → 1        ← 基例，不再往下拆
       回 1 × 2 = 2
    回 2 × 3 = 6
 回 6 × 4 = 24
```

每一层"我还没算完，先把 n 和回来要做的动作记在卡片上"——这张卡片就是**栈帧**。
**递归深度 = 同时攥在手里的卡片数**，也就是栈占用。

### 尾递归在 Python 里救不了你

```python
def fact(n, acc=1):
    if n <= 1:
        return acc
    return fact(n - 1, n * acc)     # 结果已经带进参数，不需要"回来再乘"
```

它在数学上确实不需要卡片（这种"调用是最后一步"的形式叫**尾调用**），
可 CPython **至今不做尾调用优化**——Guido 的态度是明确的取舍：留着完整栈帧，
对调试、异常回溯、装饰器都更有用。所以上面这个版本 `fact(3000)` 照样爆栈。

真要在 Python 里做深递推，只有一条正路：**改成 `while` 循环**，自己拿变量记账。
`sys.setrecursionlimit()` 只是把悬崖往后挪，不是把路修平。

---

## 四、三个值得亲手写一遍的递归

### 1. 汉诺塔：递归最好懂的形状

规则：n 片按大小叠在 A 柱，搬到 C 柱，一次只能搬一片，大盘上不许压小盘。

```python
def hanoi(n, src="A", dst="C", via="B"):
    if n == 0:
        return
    hanoi(n - 1, src, via, dst)      # ① 把上面 n-1 片当整体挪到中转柱
    print(f"{src} → {dst}")          # ② 挪当前最大的一片
    hanoi(n - 1, via, dst, src)      # ③ 把 n-1 片搬回来压上去
```

核心动作是**「把 n-1 当成一个整体搬走」**：你不需要知道那 n-1 片具体怎么走，
只要相信子调用会办对——这正是递归省事的地方，也是它难想的地方。

步数满足 $T(n) = 2T(n-1) + 1$，解出 $T(n) = 2^n - 1$。64 片就是
18,446,744,073,709,551,615 步，一秒一步也要约 5800 亿年。

### 2. 目录树：递归最实用的形状

文件系统本身就是**递归定义**的数据：目录里装着文件和目录。所以遍历它，递归是最贴合的写法。

```python
from pathlib import Path

def tree(p, depth=0):
    yield "  " * depth + p.name
    if p.is_dir():
        for child in sorted(p.iterdir()):
            yield from tree(child, depth + 1)     # ← 把子调用产出的每一项透传出去

print("\n".join(tree(Path("."))))
```

`yield from` 是递归生成器的标配：写成 `yield tree(...)` 只会交出一个个生成器对象，
而不是里面的内容。

:::warning 目录树可能成环
`is_dir()` 会跟随符号链接，一个指回上层的软链就能让递归转不完。
真要写工具，得用已访问集合 `(st_dev, st_ino)` 去重，或者干脆用 `os.walk(followlinks=False)`（默认就是不跟随）。
:::

### 3. 分形树：递归画出来的图

```python
import turtle

def branch(t, length, depth):
    if depth == 0 or length < 2:     # 基例：细到看不见就停
        return
    t.forward(length)
    t.left(25)
    branch(t, length * 0.75, depth - 1)
    t.right(50)
    branch(t, length * 0.75, depth - 1)
    t.left(25)
    t.back(length)                   # ← 栈的"回来"这一步，在图上是真的画出来的

t = turtle.Turtle(); t.left(90)
branch(t, 90, 8)
```

**换乘点**：这里的"缩 0.75、分两叉"和数学线[分形](/docs/math/7)里的自相似是同一条规则——
Koch 曲线是 `draw(n-1)` 调 4 次、每次缩 1/3，维数 $\log 4/\log 3 \approx 1.26$。
想直观感受临界值，把[实验室 · 分形树](/lab#tree)的长度比拖到 0.5 上下：
小于 0.5 总枝长收敛，大于 0.5 越分越密糊成一团——支气管、血管树、河流支流都选在收敛那一侧。
上面这段 turtle 代码用的 0.75 正落在发散那一侧，它之所以停得下来，靠的是 `length < 2` 这条**工程基例**（画到像素级就收手）。

---

## 五、次数 ≠ 深度：fib 的两本账

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

- `fib(35)` 的**调用次数**约 3000 万次（$2F_{n+1}-1$ 这个量级），**递归深度**却只有 35。
- 一张缓存能把次数从指数压回线性：

```python
from functools import cache      # 3.9+；更早的版本用 lru_cache(maxsize=None)

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

- 但 `@cache` 治的是**重复计算**，治不了**深栈**：`hanoi(30)` 要跑 $2^{30}-1$ 步，深度却只有 31；
  而一个每层只调一次的 `f(10000)` 次数不多，照样爆栈。两本账要分开算。

---

## 六、什么时候**不该**用递归

| 情况 | 更好的写法 |
|---|---|
| 深度可能上千 | `while` 循环，或显式用一个 `list` 当栈自己管 |
| 只是顺序遍历一个线性序列 | `for` |
| 代码要给别人读，且递归要多背一层栈 | 摊平成循环 |
| **数据本身是递归的**：目录、JSON、HTML/DOM、表达式 AST、组织树 | 递归，而且是最省力的写法 |

口诀：**数据是递归的，代码就该是递归的**；数据是一条线，就别硬套递归。

:::tip 递归有一位孪生兄弟
数学归纳法的"基础步 + 归纳步"，和递归的"基例 + 缩小"是同构的：
你证明 $P(k) \to P(k+1)$，程序写 `f(k) 由 f(k-1) 推出`。
见[高斯求和与数学归纳法](/docs/math/5)，以及反方向的[分形 · 自相似](/docs/math/7)。
:::

---

## ✅ 阶段 5 总结

1. 函数只做一件事：名字是动词，`return` 给机器用，`print` 给人看；可变默认参数一律 `None` + 内构造
2. 递归三要素：**有基例**、**每次真的缩小**、**基例可达**——第三条最容易翻车
3. 栈替你记"回来以后要做什么"；Python 有意不做尾调用优化，深递推只能改循环
4. 次数与深度是两本账：`@cache` 治次数，治不了深度
5. 数据是递归的（目录 / JSON / 组件树），代码写成递归最省力；线性数据别硬套

**下一步**：阶段 6（面向对象与模块包）还在路上，可以先回 [Python 介绍](../python/01-python-intro.md) 对照学习地图自查；
想验证递归换来的直觉，去[数学 · 分形](/docs/math/7) 看同一条规则怎么长成一条曲线，或直接拖 [实验室 · 分形树](/lab#tree)。

---

## 💡 动手练习

<details>
<summary>练习 1：找出会爆栈的那一个</summary>

下面三个阶乘实现，哪些在 `n = 5` 时会 `RecursionError`？为什么？

```python
def a(n):
    if n == 0:
        return 1
    return n * a(n - 2)

def b(n):
    if n <= 0:
        return 1
    return n * b(n - 1)

def c(n, acc=1):
    if n == 0:
        return acc
    return c(n, acc * n)      # 看着像尾递归
```

**答案**：`a` 和 `c` 都会爆。

- `a`：5 → 3 → 1 → −1 → −3……步长是 2，永远落在奇数上，碰不到基例 `n == 0`（要素 ③ 基例可达）。
- `b`：正常，`n <= 0` 把 0 和负数都接住了。
- `c`：递归调用传的是 `c(n, ...)`，**n 一点没变小**，只是 acc 在长（要素 ② 每次真的缩小）。
  这是"加了累加参数就以为变成尾递归优化"的经典错觉——何况 Python 本来也不做那个优化。

</details>

<details>
<summary>练习 2：统计目录里所有 .py 文件</summary>

写一个 `count_py(path)`，递归统计目录及其所有子目录里 `.py` 文件的个数，并说清你的**基例**是什么。

```python
from pathlib import Path

def count_py(p):
    if p.is_file():                       # 基例：不是目录，最多算 1
        return 1 if p.suffix == ".py" else 0
    return sum(count_py(child) for child in p.iterdir() if not child.is_symlink())
```

要点：基例是"这是一个文件"，缩小是"进入子目录（规模更小的同一问题）"；
`is_symlink()` 那道过滤是为了不让软链把目录变成环。拿本项目的 `docs/` 跑一遍，
再把返回的个数和 [知识地图](/map) 上亮着的站点数对一对——差的那几个就是 `intro/`、`docusaurus/`
这类没进线路的辅助页。

</details>

<details>
<summary>练习 3：汉诺塔的两本账</summary>

1. 手动列出 `hanoi(3)` 的全部 7 步移动。
2. `hanoi(30)` 的**递归深度**是多少？**调用次数**是多少？

**答案**：

1. A→C、A→B、C→B、A→C、B→A、B→C、A→C（等价解法不止一种，但步数一定是 $2^3-1 = 7$）。
2. 深度 31（30 层"先把 n-1 挪开"的嵌套 + 一层 `n == 0`）；次数 $2^{30}-1 \approx 1.07\times10^9$ 次调用。
   深度很浅、次数极多——所以它**不会爆栈**，只是慢：这正是要把"次数"和"深度"分开算的理由。

</details>
