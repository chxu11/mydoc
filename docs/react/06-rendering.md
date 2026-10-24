---
title: 6.渲染技巧
slug: '6'
mapShort: 渲染
description: 掌握条件渲染、列表与 key，为 TodoList 实战铺垫；理解为什么 key 不能用 index。
keywords: [React, 条件渲染, 列表渲染, key]
tags: [前端]
---
# 阶段6:条件渲染与列表渲染

## 🎯 学习目标
掌握根据条件显示不同内容的技巧,学会渲染数组数据,为开发TodoList做准备。

---

## 一、条件渲染:根据条件显示不同内容

### 方式1:if-else (在函数体里判断)

```javascript
import { useState } from 'react';

function Welcome() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 方式1:用if-else决定返回什么
  if (isLoggedIn) {
    return (
      <div>
        <h2>欢迎回来!</h2>
        <button onClick={() => setIsLoggedIn(false)}>
          退出登录
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <h2>请先登录</h2>
        <button onClick={() => setIsLoggedIn(true)}>
          登录
        </button>
      </div>
    );
  }
}

export default Welcome;
```

**适用场景**: 两个分支差异很大,返回完全不同的结构

---

### 方式2:三元运算符 (推荐,简洁)

```javascript
import { useState } from 'react';

function StatusMessage() {
  const [isOnline, setIsOnline] = useState(true);
  
  return (
    <div style={{ padding: '20px' }}>
      {/* 语法: {条件 ? 真的内容 : 假的内容} */}
      <h2>
        用户状态: {isOnline ? '🟢 在线' : '⚫ 离线'}
      </h2>
      
      <button 
        onClick={() => setIsOnline(!isOnline)}
        style={{
          padding: '10px 20px',
          backgroundColor: isOnline ? '#f44336' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {isOnline ? '下线' : '上线'}
      </button>
    </div>
  );
}

export default StatusMessage;
```

**适用场景**: 只有小部分内容不同

---

### 方式3:逻辑与 && (只显示或不显示)

```javascript
import { useState } from 'react';

function Notification() {
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const [messageCount, setMessageCount] = useState(5);
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>我的消息</h2>
      
      {/* 语法: {条件 && 要显示的内容} */}
      {/* 条件为true时显示,为false时不显示 */}
      {hasNewMessage && (
        <div style={{ 
          backgroundColor: '#ffeb3b', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          ⚠️ 你有 {messageCount} 条新消息!
        </div>
      )}
      
      <button onClick={() => setHasNewMessage(!hasNewMessage)}>
        {hasNewMessage ? '清除通知' : '模拟新消息'}
      </button>
    </div>
  );
}

export default Notification;
```

**适用场景**: 满足条件才显示,不满足就什么都不显示

---

### 方式4:变量存储JSX

```javascript
import { useState } from 'react';

function Dashboard() {
  const [role, setRole] = useState('user');  // user, admin, guest
  
  // 根据角色决定显示什么
  let content;
  if (role === 'admin') {
    content = <div>🔑 管理员面板:可以删除用户</div>;
  } else if (role === 'user') {
    content = <div>👤 普通用户:可以查看内容</div>;
  } else {
    content = <div>👁️ 游客:只能浏览</div>;
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>权限系统演示</h2>
      
      {/* 显示根据角色确定的内容 */}
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        {content}
      </div>
      
      {/* 切换角色按钮 */}
      <button onClick={() => setRole('admin')} style={{ marginRight: '10px' }}>
        切换到管理员
      </button>
      <button onClick={() => setRole('user')} style={{ marginRight: '10px' }}>
        切换到用户
      </button>
      <button onClick={() => setRole('guest')}>
        切换到游客
      </button>
    </div>
  );
}

export default Dashboard;
```

**适用场景**: 有3个以上分支,逻辑复杂

---

## 二、列表渲染:显示数组数据

### 基本语法:用 map() 方法

```javascript
function FruitList() {
  const fruits = ['苹果', '香蕉', '橙子', '葡萄'];
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>水果列表</h2>
      <ul>
        {/* 用map把数组转成JSX */}
        {fruits.map((fruit, index) => (
          <li key={index}>{fruit}</li>
        ))}
      </ul>
    </div>
  );
}

export default FruitList;
```

**运行结果**:
```
水果列表
• 苹果
• 香蕉
• 橙子
• 葡萄
```

**解释**:
- `map()` 遍历数组,返回新数组
- `key={index}` 给每个元素唯一标识(必须加!)

---

### 什么是 key? 为什么必须加?

**比喻**: key就像学号,用来区分每个学生

```javascript
// ❌ 没有key:React不知道哪个是哪个,更新时可能出错
{fruits.map(fruit => <li>{fruit}</li>)}

// ✅ 有key:React能准确识别每个元素
{fruits.map((fruit, index) => <li key={index}>{fruit}</li>)}
```

**key的规则**:
1. 必须唯一(在当前列表内)
2. 稳定(不会变)
3. 优先用数据的id,没有id才用index

```javascript
// ✅ 最佳实践:用数据本身的唯一id
const todos = [
  { id: 1, text: '学习' },
  { id: 2, text: '运动' },
  { id: 3, text: '睡觉' }
];

{todos.map(todo => (
  <li key={todo.id}>{todo.text}</li>  // 用id做key
))}

// ⚠️ 可用但不推荐:用index(删除元素时可能有问题)
{todos.map((todo, index) => (
  <li key={index}>{todo.text}</li>
))}
```

---

### 实战案例1:渲染对象数组

```javascript
import { useState } from 'react';

function StudentList() {
  const [students] = useState([
    { id: 1, name: '小明', age: 18, grade: 90 },
    { id: 2, name: '小红', age: 19, grade: 85 },
    { id: 3, name: '小刚', age: 18, grade: 92 }
  ]);
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>学生信息</h2>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        border: '1px solid #ddd'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>姓名</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>年龄</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>成绩</th>
          </tr>
        </thead>
        <tbody>
          {/* 渲染每一行 */}
          {students.map(student => (
            <tr key={student.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {student.name}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {student.age}
              </td>
              <td style={{ 
                padding: '10px', 
                border: '1px solid #ddd',
                color: student.grade >= 90 ? 'green' : 'black'  // 90分以上绿色
              }}>
                {student.grade}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentList;
```

---

### 实战案例2:可删除的列表

```javascript
import { useState } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, text: '买菜', completed: false },
    { id: 2, text: '洗衣服', completed: true },
    { id: 3, text: '写代码', completed: false }
  ]);
  
  // 删除任务
  const handleDelete = (id) => {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
  };
  
  // 切换完成状态
  const handleToggle = (id) => {
    const newTasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };  // 只改completed
      }
      return task;
    });
    setTasks(newTasks);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>任务列表</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li 
            key={task.id}
            style={{
              padding: '15px',
              marginBottom: '10px',
              backgroundColor: '#f9f9f9',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {/* 左侧:文字 */}
            <span 
              onClick={() => handleToggle(task.id)}
              style={{ 
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? '#999' : '#333',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {task.completed ? '✓ ' : '○ '}
              {task.text}
            </span>
            
            {/* 右侧:删除按钮 */}
            <button 
              onClick={() => handleDelete(task.id)}
              style={{
                padding: '5px 10px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
      
      {/* 显示任务统计 */}
      <p style={{ color: '#666', marginTop: '20px' }}>
        总共 {tasks.length} 个任务, 
        已完成 {tasks.filter(t => t.completed).length} 个
      </p>
    </div>
  );
}

export default TaskList;
```

**运行结果**:
- 显示3个任务
- 点击任务文字 → 切换完成/未完成(加删除线)
- 点击删除按钮 → 任务消失

---

## 三、结合条件渲染和列表渲染

### 实战案例3:过滤后的列表

```javascript
import { useState } from 'react';

function FilteredList() {
  const [products] = useState([
    { id: 1, name: 'iPhone', price: 6999, category: '电子' },
    { id: 2, name: '笔记本', price: 1500, category: '文具' },
    { id: 3, name: 'iPad', price: 3999, category: '电子' },
    { id: 4, name: '橡皮', price: 2, category: '文具' },
    { id: 5, name: 'MacBook', price: 12999, category: '电子' }
  ]);
  
  const [filter, setFilter] = useState('all');  // all, 电子, 文具
  
  // 根据filter过滤商品
  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    return product.category === filter;
  });
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>商品列表</h2>
      
      {/* 过滤按钮 */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: filter === 'all' ? '#4CAF50' : '#ddd',
            color: filter === 'all' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          全部
        </button>
        <button 
          onClick={() => setFilter('电子')}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: filter === '电子' ? '#4CAF50' : '#ddd',
            color: filter === '电子' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          电子产品
        </button>
        <button 
          onClick={() => setFilter('文具')}
          style={{
            padding: '8px 16px',
            backgroundColor: filter === '文具' ? '#4CAF50' : '#ddd',
            color: filter === '文具' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          文具
        </button>
      </div>
      
      {/* 显示过滤后的商品 */}
      {filteredProducts.length === 0 ? (
        // 没有商品时显示
        <p style={{ color: '#999' }}>没有找到商品</p>
      ) : (
        // 有商品时显示列表
        <div>
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              style={{
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{product.name}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                  分类: {product.category}
                </p>
              </div>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: 'bold',
                color: '#4CAF50',
                margin: 0
              }}>
                ¥{product.price}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {/* 显示数量 */}
      <p style={{ marginTop: '20px', color: '#666' }}>
        显示 {filteredProducts.length} / {products.length} 件商品
      </p>
    </div>
  );
}

export default FilteredList;
```

**运行结果**:
- 点击"全部" → 显示所有商品
- 点击"电子产品" → 只显示电子产品
- 点击"文具" → 只显示文具

---

## 四、列表常见操作汇总

### 1. 添加元素

```javascript
const [items, setItems] = useState([1, 2, 3]);

const addItem = () => {
  // 方式1:用扩展运算符
  setItems([...items, 4]);
  
  // 方式2:用concat
  setItems(items.concat(4));
};
```

### 2. 删除元素

```javascript
const deleteItem = (id) => {
  setItems(items.filter(item => item.id !== id));
};
```

### 3. 修改元素

```javascript
const updateItem = (id, newValue) => {
  setItems(items.map(item => 
    item.id === id ? { ...item, value: newValue } : item
  ));
};
```

### 4. 排序

```javascript
const sortByName = () => {
  const sorted = [...items].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  setItems(sorted);
};
```

---

## ✅ 阶段6总结

**你已经学会**:
1. ✓ 条件渲染的4种方式(if-else、三元、&&、变量)
2. ✓ 用map()渲染列表
3. ✓ key的作用和用法
4. ✓ 增删改查列表数据
5. ✓ 过滤和排序列表

**渲染快速参考**:

```javascript
// 条件渲染
{isTrue ? <A /> : <B />}      // 三元
{isTrue && <A />}              // 只显示或不显示

// 列表渲染
{array.map(item => (
  <div key={item.id}>{item.text}</div>
))}

// 空列表处理
{array.length === 0 ? <p>暂无数据</p> : <List />}
```

**验收标准**:
- 能根据State条件显示不同内容
- 能用map()渲染数组数据
- 能给列表项添加删除功能
- 理解key的作用

**下一步**:
现在你已经掌握了React的核心技能!下一阶段我们将**整合所有知识**,开发一个完整的TodoList应用!

---

## 💡 练习题

做一个 `UserManagement` 组件:
- 显示用户列表(姓名、年龄)
- 可以删除用户
- 可以按年龄过滤(显示18岁以上/以下)
- 用到:State、列表渲染、条件渲染、事件处理