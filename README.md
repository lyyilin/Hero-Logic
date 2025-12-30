# ⚔️ Hero Logic - 勇者逻辑冒险

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

> **“把编程逻辑化作战斗指令，让每一行代码都成为斩向魔王的利刃。”**

**Hero Logic** 是一款专为编程初学者设计的“游戏化编程学习工具”。它通过“勇者斗恶龙”的游戏场景，将抽象的编程概念（顺序、分支、循环）包装成直观的“战斗流程图”。学习者无需背诵枯燥的语法，只需通过拖拽积木和连接逻辑线，即可理解编程的核心本质。

---

## ✨ 核心特性

- **🕹️ 拖拽式逻辑建模**：使用类似流程图的界面，直观地构建战斗逻辑。
- **🧙 编程概念具象化**：
  - **顺序执行**：攻击指令的先后顺序。
  - **If 条件判断**：根据怪兽血量或自身法力值决定下一步行动。
  - **While 循环**：通过连线回溯实现“只要怪兽还活着就持续攻击”的循环逻辑。
- **🐍 实时代码映射**：内置实时 Python 代码生成引擎，让用户在构建图形逻辑的同时，直观看到对应的工业级代码。
- **🎮 沉浸式战斗反馈**：实时渲染战斗画面，血条（HP）、法力值（MP）以及战斗日志会根据你编写的逻辑实时变化。
- **🌌 科技感 UI 设计**：深色实验室风格界面，配合动态发光连线与网格背景，极具视觉冲击力。

---

## 🚀 关卡设计

项目内置了 4 个渐进式挑战，引导学习者由浅入深：

1.  **第一课：顺序执行** - 学习最基础的程序流。
2.  **第二课：If 分支** - 引入条件判断，处理不同的战斗状态。
3.  **第三课：While 循环** - 学习如何通过循环处理高血量的敌人。
4.  **第四课：高级法术逻辑** - 综合运用法力值管理（蓄力与奥义）完成复杂的逻辑闭环。

---

## 🛠️ 技术栈

- **Core**: React 19 (Hooks, Functional Components)
- **Styling**: Tailwind CSS (Modern Grid, Dark Mode)
- **Icons**: Lucide React
- **Engine**: 自研轻量级流程图引擎 + 状态机执行器

---

## 📦 快速开始

### 本地开发

1. 克隆仓库：
   ```bash
   git clone https://github.com/your-username/hero-logic.git
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 运行项目：
   ```bash
   npm start
   ```

### 部署到 GitHub Pages

项目支持静态部署。运行 `npm run build` 后，将生成的 `dist` 目录上传至 GitHub Pages 或 Vercel 即可。

---

## 💡 如何玩转 Hero Logic？

1. **拖拽积木**：从左侧库中点击你需要的逻辑块（如“普通攻击”或“怪兽活着吗？”）。
2. **建立连接**：点击积木边缘的圆点，拉出连线指向下一个目标积木。
   - 🟡 **黄色积木**：有两个输出桩（Yes/No），用于实现分支逻辑。
   - 🔵 **蓝色/红色积木**：通常只有一个输出桩（Next）。
3. **运行逻辑**：点击右上角的 **"Run Execution"**，观察勇者的战斗表现！
4. **观察代码**：留意右侧的 Python 视图，看看你的流程图是如何转化为真实代码的。

---

## 🤝 贡献与反馈

如果你有任何改进建议或发现了 Bug，欢迎提交 Issue 或 Pull Request。

- **如果你喜欢这个项目，请给它一个 ⭐️ Star！这对我很有帮助！**

---

## 📜 许可证

本项目采用 [MIT License](LICENSE) 开源。

---

*“逻辑是勇者的盾牌，代码是勇者的长剑。”—— 祝你在 Hero Logic 的世界中冒险愉快！*
