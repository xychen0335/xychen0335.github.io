---
title: 'Agent 驱动的科研流水线：基于 AgentScope 的自动化训练平台实践'
tags: [Agent, Harness 工程, AutoResearch]
category: 工作
published: true
hideInList: false
feature: 
isTop: false
---
# Agent 驱动的科研流水线：基于 AgentScope 的自动化训练平台实践

想象一个研究者的日常：拿到一篇论文，要在几天内判断它值不值得复现、能不能复现、指标能不能打过。你要读论文、找仓库、搭环境、跑 baseline、读日志、改脚本、再跑、再读日志……如果这中间有一大半可以交给 Agent，你最想让它替你完成哪一步？

这篇文章分享我们搭建的自动化训练与研究平台的实践。它不是项目文档，而是拆解一个核心问题：**当 Agent 要执行「论文分析 → 论文复现 → 知识沉淀」这种长程任务时，运行时该怎么设计**。全文围绕四个主题：AgentScope 的基本用法、持久化、Skills 编排、配套工具，最后讲这个流水线的闭环——Skill 自进化与模板固化。

## 1. 我们的愿景

从算法工程师的角度来看，现如今复现一篇论文已并不困难，这项工作的目的不是期望 Agent 可以替代这一环节，而是希望 Agent 可以替我们留下一篇论文最核心的思想，沉淀出相关的产物和可复用的模版。对于这个任务，其真实链路大概如下：

```text
论文分析 → 仓库发现 → 数据预处理 → 编写代码及脚本 → baseline 复现
        → 指标评估 → 优化迭代 → 收尾报告
```

它有三个让普通 Agent 应用「失效」的特点：

- **长程**：一次任务动辄几十分钟到数小时，Agent 必须记得住自己进行到哪一步、下一步该做什么，服务重启了也不能失忆。
- **昂贵**：每一步都可能牵涉申请 GPU、启动训练实例、投递命令、释放资源，动作错了就是浪费时间和资源。
- **易幻觉**：虽然目前的模型能力已经相当强大，但在长程任务中偶发的幻觉仍难以避免。幻觉一次，可能浪费一次完整的训练循环。

结论很直接：为了应对这类任务，Agent 需要一个**会记住的运行时、有知识的技能库、被约束的工具边界**。我们把它拆成三根支柱：

1. **持久化状态机**统一编排长程任务；
2. **多阶段 Skills 流水线 + 配套工具组**约束 Agent 行为，跑出高效的 Agent Loop；
3. **知识沉淀闭环**：复现轨迹蒸馏为可验证的经验，写回技能库并固化训练模板，让平台越用越快。

## 2. AgentScope 基本用法

### 2.1 业务与框架分离

官方 Agent Service 是完整服务形态，它的 API、会话模型、存储接口和我们已经定型的前端接口不一致。实践中，AgentScope 只负责最核心的部分：Agent 装配、推理、工具执行、权限判定。这可以保证「事件转换、会话存储、审批网关、工具注册、技能路由」这些业务边界全部由我们自己掌握。

### 2.2 一次 turn 的生命周期

每一轮用户消息进来，运行时做四件事：

1. **恢复状态**：从持久化快照恢复 AgentState（上下文、summary、已激活的工具组）；
2. **装配 Agent**：注入系统提示词、模型客户端、Toolkit（编码工具 + 业务工具 + 技能加载器）；
3. **消费 reply_stream**：AgentScope 以异步事件流产出文本、思考块和工具调用，我们把它映射成自己的协议事件（`message.delta`、`tool.started`、`approval.requested`……）实时推给前端；
4. **落库**：消息、事件、工具调用审计、状态快照全部持久化。

Agent 装配的骨架大致是这样：

```python
agent = Agent(
    name="AutoTraining",
    system_prompt=system_prompt,
    model=model_client,
    toolkit=toolkit,
    state=state,
    context_config=ContextConfig(
        trigger_ratio=0.8,   # 上下文占用达到 80% 触发压缩
        reserve_ratio=0.1,   # 压缩后保留 10% 的关键内容
    ),
    react_config=ReActConfig(max_iters=99999999),
)
```

## 3. 持久化：长任务的「记忆」到底该存什么

长程 Agent 最反直觉的一点是：**恢复一个会话，需要的不是聊天记录，而是执行态**——当前上下文、summary、已经激活的工具组、正在等待的审批。我们把这套「记忆」拆成三层：

| 存储                     | 承载什么                                                                | 为什么                                 |
| ------------------------ | ----------------------------------------------------------------------- | -------------------------------------- |
| MySQL                    | 会话、消息、事件、工具调用审计、审批记录、状态快照                      | 可审计、可长查询，是应用事实源         |
| Agent Workspace 下的文件 | 每个复现任务的`RUN_STATE.json`、`scores.jsonl`、`summary.json` 等 | 状态机真相源，Agent 与开发者都能直接读 |
| SSE 事件总线             | 实时推送 + 按事件游标恢复                                               | 前端流式体验，断线可续                 |

### 3.1 状态快照：不重放历史，直接恢复现场

关键机制是**AgentState 快照**：每轮结束（或每 N 次工具调用）把 `agent.state.model_dump(mode="json")` 整体序列化进数据库，下一轮直接从快照恢复，而不是把历史消息重新喂一遍。

### 3.2 维护一个复现链路的状态机

为了协调各阶段，Agent 通过工具维护一个状态机（3 阶段）。状态被写入到当前 session 的 `RUN_STATE.json` 中，便于各阶段的交接和恢复。

## 4. Agentic Workflow 与 Skills 编排：把知识从模型里拿出来

### 4.1 System Prompt

赋予 Agent 复现助手的人格，告知其可以使用的工具，并明确工作方式和执行边界。

### 4.2 AgentScope 的技能读取

为了保证自动论文复现过程有序、可维护，系统将复现流程拆分为一组阶段性 Skills。每个 Skill 封装特定阶段的操作规范、工具使用方式、输入输出契约以及下一阶段路由规则。**Agent 通过 AgentScope 内置的 SkillViewer 工具按需检索**。

```python
toolkit = Toolkit(
    tools=basic_tools,
    skills_or_loaders=[
        LocalSkillLoader(str(path), scan_subdir=False)
        for path in skill_paths
    ],
    tool_groups=tool_groups,
)
```

### 4.3 入口技能 + 多阶段「任务技能」

整个链路的技能库包含入口技能和多个任务技能：

- 入口技能负责各阶段技能的调度，相当于 **Planner**。
- 各阶段技能均声明线性地状态转移，配合状态机自然地衔接，形成一条严密的流水线，大致如下：

```text
paper-ingest → repo-discovery → data-preprocessing → entrypoint-authoring → reproduce-baseline → auto-search-loop → finalize
```

每个 SKILL.md 只说下面几件事：**进入这个阶段做什么、参考什么、产物是什么、哪些事绝对不能做**。把容易幻觉的地方配合工具变成硬约束，使 Agent 在探索任务的同时也拥有我们希望的稳定性。

## 5. 配套工具：Agent 的能力边界

### 5.1 工具规格与框架解耦

所有业务工具先定义成**框架无关的规格**（名字、描述、风险等级、入参 schema、handler、所属组），AgentScope 适配层再动态生成工具类。这进一步使得框架与业务解耦，后续如果更换框架也也更容易迁移。

### 5.2 审批网关：读自动，写审批

工具按风险分级：`read` 级自动执行；写操作返回 ASK，AgentScope 在真正调用前弹出审批卡，前端展示工具名、参数和风险，用户批准后由后台线程继续消费 reply_stream。核心逻辑很薄：

```python
async def check_permissions(self, tool_input, context):
    if is_read:
        return PermissionDecision(behavior=ALLOW, message="read-only tool")
    return PermissionDecision(behavior=ASK, message="write tool requires approval")
```

### 5.3 工作区沙箱：能跑动，但出不了圈

编码能力直接用 AgentScope 内置的 `Bash / Read / Write / Edit / Grep / Glob`，全部限制在会话工作区内。当然，这些工具也有着一定的权限策略：

- **远程执行拦截**：`curl url | sh` 这种即使没有越界路径也永不自动放行；
- **危险命令兜底**：`rm -rf /etc` 这类由框架的 bypass-immune 检测前置拦截，优先级高于一切白名单。

### 5.4 工具组：按阶段打开能力

考虑到各阶段完成的任务不一致，工具不是一次全开的，多个 tools 按照职责分组。`basic` 组常驻，其余按阶段激活（指引 Agent 调用 `reset_tools` 切换），激活状态随快照持久化：

| 工具组                  | 负责什么                                           |
| ----------------------- | -------------------------------------------------- |
| debug-session           | 训练实例生命周期：创建、启动、投递命令、日志、停止 |
| reproduction-state      | 状态机推进、打分、事件记录                         |
| reproduction-controller | 复现执行控制器：单一入口编排验证、执行、轮询       |
| reproduction-artifacts  | 产物校验、worktree 快照与回滚                      |
| reproduction-finalize   | 收尾：summary 最终化、报告生成                     |

这样设计的好处是：**技能决定 Agent「该怎么做」，工具组决定它「现在能做什么」**，两者配合，Agent Loop 既高效又被约束在正确轨道上。

## 6. 闭环的最后一环：Skill 自进化与模板固化

前面的设计解决「Agent 能跑通一次」，这一节解决更重要的问题：**跑通一次之后，下次同类任务能不能更快？**

### 6.1 复现轨迹蒸馏为可复用的 Skill

每次复现完成，平台可以做一次「知识提取」：把论文/仓库的事实（facts）和固定 commit 的代码（pinned worktree）作为输入，蒸馏出一个可复用的 Skill，该 Skill 包含论文/仓库的应用场景、核心想法、可调整参数和**真实代码锚点**。

这个蒸馏过程的关键不是「生成」，而是「可验证」。我们设了一组硬性 Gate：

- 每个「核心想法」必须同时追溯到来源证据和至少一个真实代码锚点；
- 找不到实现的内容标记 `code_unverified`，不得伪装成已提取能力；
- 不虚构代码、symbol、行号、参数默认值或复现结论；
- 结构化参数表（ParamSchema）只能依据真实入口选择 `yaml_patch` / `env` / `cli_arg`，不能猜。

### 6.2 自进化经验单元：exploit 与 explore

更进一步，我们把「轨迹 → 经验单元」做成自进化机制。每次运行的轨迹被蒸馏成两类单元：

- **exploit**：被验证有效的做法——「HF Trainer 仓库接入时，用 `TrainingArguments(**yaml)` 而不是改 Trainer 源码」；
- **explore**：被验证的死路——「DeepSpeed ZeRO-3 下直接在 wrapper 里 `torch.save(model)` 会存出分片不完整的 checkpoint」。

两类单元都要经过**因果校验**：exploit 是否真的提升了后续结果，explore 是否在别的仓库上复现过同样的失败——只在一处仓库出现的失败，可能是偶发环境问题，不能晋升为经验。所以体系里**禁止「只增不减」**：经验单元有 nursery / promote / evict 生命周期，负面证据可以降级或淘汰。

写回也有边界：经验永远不碰状态机、控制器、评分逻辑这些**裁判**。进化不能修改裁判，否则整个闭环就失去了客观性。

### 6.3 模板固化：把验证过的跑法存下来

闭环的最后一步是模板。复现成功后，平台把验证过的 worktree、setup 脚本、训练/推理配置固化成「训练模板」；如果之前提取过 Skill，模板和 Skill 会互相绑定。下一次同类任务可以从模板直接起跑，而不是从零搭环境。

到这里，完整闭环成立：

```text
论文分析 → 论文复现 → 知识沉淀（Skill 提取 + 经验单元）
   → 技能库/训练模板进化 → 下一次任务更快、更少幻觉
```

## 7. 总结

1. **长程 Agent 任务 = 状态机 + 技能 + 工具约束**。状态机管「进行到哪」，技能管「该怎么做」，工具组管「现在能做什么」，三者缺一不可。
2. **Agent 框架解耦**。框架与业务层分离。事件、存储、审批这些业务边界在自己手里，框架负责 Agent 装配、推理与工具执行，替换成本最低。
3. **持久化保存「执行态」而不是「聊天记录」**。状态快照 + 事件游标 + 可重建缓存剥离，是无状态服务支撑长任务的关键。
4. **自进化闭环的底线是「可验证」**。轨迹蒸馏成经验单元、因果校验、禁止只增不减、进化不碰裁判——没有这几条，技能库只会越进化越脏。
