---
title: 'Define Your Agent：Pi Harness'
date: 2026-08-16 04:50:00
tags: [Agent, Harness 工程, 架构]
category: 工作
published: true
hideInList: false
feature: 
isTop: false
---
# Define Your Agent：Pi Harness

Pi 默认没有 MCP、subagent、权限弹窗、plan mode、todo list 和后台 Bash。它甚至明确告诉用户：需要这些能力，就写 extension，或者安装别人做好的 package。

这不是功能没做完，而是 Pi 最重要的产品判断。Coding agent 的能力越多，模型看见的工具、规则和隐式状态就越多。系统看起来更强，行为却更难解释。Pi 选择保留一个小而透明的核心，把工作流交还给用户。

它真正想解决的问题不是“怎样内置更多功能”，而是三个更基础的问题：

1. 怎样精确控制模型每次看见的上下文；
2. 怎样让同一套 agent loop 服务于 CLI、TUI、SDK 和其他应用；
3. 怎样让 agent 在不修改核心的前提下，逐步长成适合个人和项目的形状。

第三个问题由 extension 回答。Pi 把工具、事件、上下文、会话和 UI 的控制点暴露给 TypeScript 模块。用户可以在不修改核心的前提下实现 plan mode、subagent、权限确认和自己的工作流。理解这一点，才能理解 Pi 为什么保持小核心，同时提供一套覆盖整个运行过程的 extension API。

## 一、Pi 的整体思想：核心只提供机制

Pi 的仓库不是一个巨大的 CLI，而是几层边界清楚的包：

| 层 | 主要职责 |
|---|---|
| `pi-ai` | 统一不同模型供应商的消息、流式输出、tool call、reasoning、用量和成本 |
| `pi-agent-core` | agent loop、工具执行、消息队列、状态与事件流 |
| `pi-coding-agent` | 会话、上下文、compaction、资源加载、extension 与编码工具 |
| `pi-tui` | 终端交互与增量渲染 |

最内层的 loop 并不认识 Git、计划模式、子 agent 或某个特定 UI。它只做一件事：调用模型，执行工具，把结果放回上下文，直到模型停止调用工具。

```text
用户消息
   ↓
模型流式响应
   ↓
是否包含 tool call？ ── 否 ──→ 结束
   │
   是
   ↓
校验参数 → 执行工具 → 生成 tool result
   │
   └──────────────────────→ 下一轮模型调用
```

外层的 `AgentSession` 才负责把这个循环变成 coding agent：它加载项目规则，管理会话树，处理自动压缩、错误重试、模型切换和 extension 事件，并把运行过程持久化。interactive、print、JSON 和 RPC 模式都复用这一层，只替换输入输出。

这种拆分的价值不在于目录整齐，而在于控制隐式行为。模型调用前发生了什么、工具调用后发生了什么，都能在一个明确的边界里找到。要加工作流，优先写成资源或 extension，而不是继续膨胀 loop。

## 二、agent loop：两层循环和两种插话

Pi 的 `agent-loop.ts` 有内外两层循环。

内层循环处理模型与工具之间的往返。只要模型还在发 tool call，或用户有 steering message 等待注入，就继续下一轮。外层循环处理 follow-up：模型原本已经准备结束，但队列里又来了一个后续请求，于是开启新的工作段。

这对应用户在 agent 工作时发送消息的两种语义：

- **steer**：在当前工作尚未结束时，于下一次模型调用前插入，改变当前方向；
- **follow-up**：等待当前工作自然结束，再作为后续任务执行。

很多 agent 把“用户又发了一条消息”当成简单的数组追加。Pi 把时机做成显式语义，因为两者对模型的含义完全不同。正在重构时发一句“先别改接口”，应该进入当前循环；发一句“完成后再补测试”，更适合排在后面。

工具执行也保持类似的克制。多个 tool call 默认可以并行执行，但最终写入上下文的 tool result 仍按 assistant 消息中的调用顺序排列。完成顺序服务于实时 UI，来源顺序服务于稳定上下文。只要其中一个工具声明必须串行，整批调用就退回顺序执行。

loop 对外发出 `message_start`、`message_update`、`tool_execution_start`、`turn_end` 等事件。TUI、会话持久化和 extension 订阅同一条事件流，不需要把显示逻辑塞进推理循环。Pi 因而可以保留一个很小的 loop，同时让外层看到足够细的运行状态。

## 三、上下文管理：存下来的历史不等于发给模型的上下文

Pi 对上下文的核心判断是：**会话历史、agent 内部消息和供应商请求不是同一个东西。**

一次请求大致经过下面的转换：

```text
Session entries
   ↓ 选择当前分支、应用 compaction
AgentMessage[]
   ↓ transformContext：裁剪、注入或重排
AgentMessage[]
   ↓ convertToLlm：过滤 UI 消息、转换自定义消息
通用 LLM Message[]
   ↓ provider adapter
Anthropic / OpenAI / Google 请求
```

这几层如果混在一起，短期代码更少，长期却很难回答一个关键问题：模型这一次到底看见了什么？Pi 让每一层拥有单独职责。

### 系统提示词只描述当前真实能力

Pi 的 system prompt 不是一块长期不变的巨型文本。`buildSystemPrompt()` 根据当前启用的工具构造工具列表和规则，再附加项目 context、skill 摘要与工作目录。

如果当前没有 `bash`，相关指引不该继续出现。如果 extension 增加了工具，它可以同时贡献 tool snippet 和使用规则。系统提示词描述的是本次运行的真实能力，不是产品所有可能能力的全集。

项目规则来自 `AGENTS.md`、`AGENTS.override.md` 或 `CLAUDE.md`。Pi 从全局 agent 目录开始，再沿当前工作目录的祖先逐级加载。规则因此具有作用域：全局偏好在外层，仓库约束和子目录约束在更具体的位置。

项目本地的 extension、settings 和 `.agents/skills` 只有在项目被信任后才加载。这里的 trust 解决的是“是否执行仓库提供的动态配置”，不是完整的工具权限系统。Pi 默认仍拥有启动进程的用户权限。

### Skill 使用渐进式披露

Skill 并不会把完整说明全部塞进 system prompt。启动时只扫描名称、description 和路径；任务匹配后，模型再通过 `read` 加载完整 `SKILL.md`。

```text
常驻上下文：skill 名称 + 触发描述 + 文件位置
任务触发后：完整说明 + 所需 references/scripts/assets
```

这是一种很实用的 context engineering。几十个 skill 可以同时可用，但不会共同占满上下文窗口。代价是 description 必须写准，而且模型有时可能没有主动读取完整说明，因此 Pi 也提供 `/skill:name` 做显式调用。

### AgentMessage 与供应商消息分开

`AgentMessage` 可以包含普通 user/assistant/toolResult，也可以包含 Bash 执行、branch summary、compaction summary 和 extension 自定义消息。UI 需要这些类型，会话恢复也需要，但模型供应商只认识有限的 message role。

`convertToLlm()` 是最后一道投影：

- 普通消息原样保留；
- Bash 执行转成带命令和输出的 user message；
- branch/compaction summary 包在明确的 summary 标记里；
- 标记为排除的本地命令不进入模型上下文；
- 纯 UI 或纯 extension 状态可以完全过滤。

这使 Pi 能保存比模型上下文更丰富的事实，同时避免把显示状态误当成提示词。

## 四、会话不是消息数组，而是一棵可压缩的树

Pi 把会话存成 JSONL。每条 entry 有自己的 `id` 和 `parentId`，所以同一个文件天然是一棵树，而不是只能向后追加的一条 messages 数组。

```text
user A → assistant B → user C → assistant D
                    └→ user C' → assistant D'
```

`/tree` 会移动当前 leaf，在同一个 session 中继续另一条路线；`/fork` 从旧的用户消息创建新 session；`/clone` 则复制当前活动分支。历史没有因为回退而消失，当前上下文只选择 root 到 leaf 的一条路径。

这比线性历史更符合 coding agent 的真实工作方式。一次修复可能尝试 A，失败后回到共同祖先改走 B。若只允许删除旧消息，失败路径里的调查结论也会一起丢失；若把两条路径全部发给模型，又会制造互相矛盾的上下文。

Pi 允许在切换分支时总结被放弃的路线，把“尝试了什么、为什么不采用、读过和改过哪些文件”挂到新位置。失败分支于是从噪声变成可利用的经验。

### Compaction 是检查点，不是删除历史

当上下文接近窗口上限时，Pi 根据

```text
contextTokens > contextWindow - reserveTokens
```

触发自动 compaction。它从后往前保留最近一段消息，把更早内容总结成结构化状态：目标、约束、进度、关键决策、下一步，以及累计读写过的文件。

新的 compaction entry 可以直接保存 `retainedTail`。这样它本身就是一个上下文检查点：恢复时读取 summary、保留尾部和之后的新消息，无须重新遍历更老的历史。

```text
完整历史：   A B C D E F G H
                         ↓ compact
模型上下文：Summary(A-D) + E F G H
磁盘历史：   A B C D E F G H + CompactionEntry
```

两点很重要。

第一，压缩只改变“模型下一次看什么”，不会销毁原始会话。第二，Pi 不会在 tool result 中间切断上下文，超长单 turn 还会单独处理其前缀，避免留下没有对应 tool call 的孤立结果。

Compaction 也不是封闭实现。Extension 可以在 `session_before_compact` 拦截默认流程，取消压缩，修改摘要提示，换用另一模型，或把领域状态写进 `details`。上下文策略本身就是扩展点。

## 五、Extension 是 Pi 的关键设计

Pi 没有内置 plan mode，但仓库里有一份完整的 plan mode extension。它注册 `/plan` 命令和快捷键，切换可用工具，在 `tool_call` 阶段拦截危险命令，在 `before_agent_start` 阶段注入规则，用 `appendEntry()` 保存状态，再用 TUI widget 显示任务进度。

这说明 extension 不是一个附带的插件入口。它是 Pi 把产品功能留给用户定义的主要机制。

### 5.1 Extension 从声明变成运行时行为

Extension 是一个 TypeScript factory。Pi 用 `jiti` 加载 `.ts` 或 `.js` 文件，再把 `ExtensionAPI` 传给 factory：

```ts
export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		// 在工具执行前检查或阻止调用
	});

	pi.registerTool({
		name: "my_tool",
		// parameters、execute 和 renderer
	});
}
```

`ExtensionAPI` 同时提供注册和运行时操作。Extension 可以注册工具、命令、快捷键、CLI flag、provider 和 renderer，也可以发送消息、切换工具、切换模型、执行命令、触发 compaction 和读写会话状态。

加载过程分成几步：

```text
全局目录、项目目录、package、CLI 参数
                  ↓
          ResourceLoader 发现入口
                  ↓
       加载 factory，收集注册项
                  ↓
        ExtensionRunner 持有实例
                  ↓
 AgentSession 绑定工具、会话、模型和 UI
```

这个顺序把声明和运行环境分开。Extension 加载时登记 handlers 和工具。`AgentSession` 创建后，`ExtensionRunner` 才获得当前会话、模型、工具和 UI 的操作能力。

执行 `/reload` 时，Pi 关闭旧 extension runtime，重新加载资源并创建新的 runner。旧 context 会失效，避免 extension 在 reload 或会话切换后继续操作过期对象。

### 5.2 Event 覆盖整个运行过程

Pi 的 event 不只是完成后的通知。很多 event 允许 extension 改写或阻止下一步：

```text
用户输入
  ↓ input
skill 和 template 展开
  ↓ before_agent_start
构造 system prompt 和本轮消息
  ↓ context
构造发给模型的消息
  ↓ before_provider_request
调用 provider
  ↓ tool_call
执行工具
  ↓ tool_result
写回消息和会话
  ↓ agent_end
```

`input` 可以改写输入或直接处理请求。`before_agent_start` 可以注入消息或替换本轮 system prompt。`context` 可以在每次模型调用前过滤、重排或增加消息。`tool_call` 可以阻止工具执行，`tool_result` 可以改写返回给模型的内容。`session_before_compact` 还可以取消默认压缩或提交自己的 summary。

`ExtensionRunner` 按加载顺序执行 handlers。前一个 extension 对上下文或请求体的修改，会成为后一个 extension 的输入。Extension 因此可以组合，加载顺序也会影响最终行为。

### 5.3 Plan mode 由多个控制点组成

官方 plan mode 示例先保存当前工具列表，再关闭 `edit` 和 `write`。它通过 `tool_call` handler 限制 `bash`，只允许 allowlist 中的命令。`before_agent_start` handler 注入模式规则，`context` handler 在退出后清理旧消息。

Plan mode 还需要持久状态和 UI。Extension 注册 `/plan`、`/todos` 和快捷键，用 `appendEntry()` 把开关、计划项和执行状态写进 session JSONL，再用 status 和 widget 呈现进度。

所以 plan mode 不是一段 prompt。它同时改变工具策略、上下文、会话状态和交互界面。Pi 核心没有定义 `PlanMode` 类型，但 extension API 已经提供了实现它所需的控制点。

同样的接口还能实现其他功能：

- permission gate 在 `tool_call` 阶段检查 Bash，并通过 `ctx.ui` 请求确认。
- protected paths 在写操作发生前检查路径。
- subagent 注册一个工具，再启动独立的 Pi 进程并汇总结果。
- custom provider 注册模型目录、鉴权方式或自己的 stream handler。
- Gondolin extension 把内置工具和 shell 命令送入 Linux micro-VM。

这些功能不需要各自修改 agent loop。`pi-agent-core` 保持通用，`pi-coding-agent` 通过 extension 增加具体工作流。

### 5.4 Resource 和 package 各有自己的职责

Context file、prompt template、skill、extension 和 package 解决不同问题：

| 机制 | 职责 |
|---|---|
| Context file | 提供当前目录始终生效的项目事实和规则 |
| Prompt template | 展开一段重复使用的请求 |
| Skill | 按需加载一套领域说明和配套文件 |
| Extension | 改变工具、事件、上下文、会话、provider 和 UI 行为 |
| Pi package | 打包并分发 extension、skill、prompt 和 theme |

Extension 还能通过 `resources_discover` 动态贡献 skill、prompt 和 theme 路径。Package 则负责分发，可以从 npm、Git 或本地路径安装。项目 settings 可以固定 package 来源和 ref。

Skill 告诉模型怎样完成一类任务。Extension 改变 agent 能做什么，以及什么时候允许它做。Package 把这些资源交给其他用户和项目。

## 六、正在形成的 durable harness

仓库中还有另一条更底层的设计线：`packages/agent/src/harness` 正在把 agent 运行扩展为可恢复的耐久状态机。

这套接口把持久数据分成几类：

- **entries**：对话树上的消息、compaction 和自定义内容；
- **records**：operation、tool start、queue、usage 等运行记录；
- **lanes**：指向同一棵树不同 leaf 的命名游标；
- **facts**：session name、label 等最新值。

工具还能声明 `replay: "safe" | "never"`。其意图很明确：进程若在外部效果之后崩溃，恢复逻辑必须知道工具能否重放，不能默认再执行一次。

不过，以当前仓库代码为准，这一层仍是正在建设的接口。`AgentHarness` 已经定义了 `prompt()`、`resume()`、`compact()`、lane 和 operation 类型，但主要方法仍返回 `HarnessNotImplemented`。因此，不能把 durable program counter、崩溃恢复和多 lane 描述成 Pi CLI 已经完整交付的能力。

这套未完成接口仍值得看。它说明 Pi 想把现在的“可检查会话”继续推进到“可恢复执行”：不仅知道模型过去说过什么，还知道一次 operation 做到了哪一步，以及外部 effect 是否允许再次发生。

## 七、极简设计的代价

Pi 的设计不是无条件更好，它只是把复杂度放在不同位置。

首先，默认不带 permission system 意味着责任落到运行环境。Project trust 只控制是否加载仓库提供的动态资源，不限制 `bash`、文件系统、网络和凭据访问。需要强隔离时，应使用容器、micro-VM 或独立 sandbox。

其次，extension 拥有完整进程权限。它能让 Pi 快速适应工作流，也能执行任意代码。第三方 package 不是“提示词素材”，而是需要像依赖一样审查的程序。

最后，渐进式披露依赖资源描述质量。Skill description 写得含糊，模型就可能不加载；compaction summary 漏掉关键决策，后续工作就会建立在不完整状态上。Pi 给了用户控制上下文的能力，但没有替用户做完上下文设计。

这些限制与 Pi 的原则是一致的：机制保持透明，策略由使用者选择。它不会假装一个默认工作流适合所有人。

## 结语：可塑性比功能数量更重要

Pi 最值得借鉴的不是某个工具或 TUI，而是它对 agent harness 边界的判断。

模型调用只接收经过投影的上下文；历史保存在可分支的会话树中；compaction 生成可恢复的检查点。Extension 再接入输入、模型请求、工具、会话和 UI，package 负责分发这些能力。核心不需要预先知道用户最终会加入哪种工作流。

如果把 coding agent 看成一个长期使用的工作环境，这比堆功能更有价值。Pi 保持默认行为有限，同时让每个用户决定需要哪些工具、策略和交互。

这就是 Pi 的“Define Your Agent”：从一个小内核出发，用 extension 定义自己的 agent。

## 参考资料

- [Pi Agent Harness](https://github.com/earendil-works/pi)：Pi Agent 的官方仓库。
- [What I learned building an opinionated and minimal coding agent](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)：Pi 原始设计思路。
- [Sessions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md) 与 [Compaction](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/compaction.md)：会话树和上下文压缩。
- [Extensions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md)、[Skills](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md) 与 [Packages](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md)：Pi 的扩展与分发机制。
- [Extension loader](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/loader.ts) 与 [Extension runner](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/runner.ts)：extension 的加载、注册和事件执行。
- [Plan mode extension](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/plan-mode) 与 [Subagent extension](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/subagent)：复杂工作流如何在核心之外实现。
