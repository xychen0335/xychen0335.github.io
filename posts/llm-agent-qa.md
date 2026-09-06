---
title: 'LLM & Agent 基础'
date: 2026-09-06 16:06:25
tags: [LLM,Agent,大模型]
category: 学习
published: true
hideInList: false
feature: 
isTop: false
---

# LLM & Agent 基础

## 大模型八股

### Q1：绝对位置编码和相对位置编码？多模态位置编码？

### A1：

* 绝对位置编码：给序列中的每个位置索引 $i$ 分配一个固定的向量 $P_i$，并将其直接加到输入的 Embedding 上，

$$
Input = Embedding(Token) + P_i,
$$

常见方式有正弦位置编码和可学习位置编码，优点是实现简单、表现稳定，缺点是外推性差、缺乏平移不变性。

* 相对位置编码：不直接修改 Input Embedding，而是在计算 Attention 时，加入两个 Token 之间的相对距离信息，即在计算 Query ($Q$) 和 Key ($K$) 的点积时，加入一个表示距离的项。

$$
Attention(Q_i, K_j) \approx Q_i K_j^T + \text{Bias}(j-i),
$$

优点是外推性好，缺点是计算复杂度高。

* RoPE：旋转位置编码是绝对位置编码（给每个位置赋予旋转角度），但在数学性质上实现了相对位置编码的效果。根据特征维度两两分组，每一对都看成一个二维向量，在二维平面里做旋转。通过将向量旋转一个角度 $\theta \times i$ 来编码绝对位置 $i$。当计算 $Q$ 和 $K$ 的内积时，绝对位置 $i$ 和 $j$ 会相互抵消，只留下相对距离 $(i-j)$。如果把每两个维度组成一个复数，RoPE 本质上可以看成把这个复数乘上一个和位置相关的相位因子。这样不同位置就对应不同相位旋转。最后 $QK^T$里就会显式体现相对位移信息。RoPE 具有优越外推性和平移不变性，适合长上下文。

$$
R(i)^T R(j) = f(i-j).
$$

### Q2：大模型为什么要用 Decoder-Only 的架构？

### A2：

* 训练效率与规模化（Scaling Law）：Decoder-Only 架构主要利用下三角掩码（Causal Mask）进行自回归训练。相比 Encoder-Decoder（如 T5），在相同参数量和计算量下，Decoder-Only 在大规模数据上的预训练效率更高，且更符合缩放定律，能通过提高模型大小、堆算力和数据换取更强的性能。
* 任务统一性（In-context Learning）： 这种架构将所有任务都视为“下一个词预测”问题。这种预训练目标与推理时的生成任务完全一致，减少了预训练和下游任务之间的差异，统一了理解和生成两类任务，极大地激发了模型的 Zero-shot 和 Few-shot 能力。
* 计算缓存（KV Cache）：在推理阶段，Decoder-Only 架构可以利用 KV Cache 技术缓存之前 Token 的 Key 和 Value 矩阵，从而显著降低长序列生成的计算复杂度，提高推理速度。
* 注意力矩阵：双向注意力矩阵往往是低秩（存在信息冗余）的，而 Causal Attention（因果注意力） 的注意力矩阵是下三角矩阵，必然是满秩的，表达能力更强。
* Encoder-Only（例如 BERT）：采用了双向注意力机制，训练时看见了全局信息，更适合做理解型任务如分类和识别，而不适合生成任务。
* Encoder-Decoder（例如 T5）：需要维护两个模块（编码器和解码器），参数利用率差、训练效率低，长文本扩展困难。

### Q3：多模态大模型中 ViT 的原理以及主流的 MLLM？

### A3：

* ViT 原理

  * Patch Partition：为了将图像转化为 Token，需要对图像进行切块；
  * Linear Projection：展平 Patch，并经过线形层映射从而将图像数据的维度与 LLM 的输入对齐，实际上，Patch Partition + Linear Projection 可以用一层卷积层实现；
  * 位置编码，Attention+MLP 构成的 Transformer Encoder。
* LLaVA

  * 预训练：目前多模态大模型主流采用了 CLIP 模型及其变体的 ViT 作为视觉编码器。CLIP 基于对比学习进行预训练，其核心机制是将图像和文本分别映射到同一个共享特征空间，通过最大化匹配图文对的余弦相似度，并最小化不匹配对的相似度，从而实现视觉与文本特征的语义对齐；
  * 对齐微调：ViT $\rightarrow$ Projector (Merger) $\rightarrow$ LLM，冻结 ViT 的参数，只训练中间的投影层（通常为一层或两层线性层）。
* BLIP -- Qformer 与 LLaVA 直接将全量视觉特征进行简单线性映射不同，BLIP-2 引入了轻量级的 Q-Former（Querying Transformer） 作为 bridge，旨在提取浓缩的、与文本强相关的视觉特征，从而大幅降低大语言模型的计算压力。

  * 整体信息流为：$\text{ViT} \rightarrow \text{Q-Former} \rightarrow \text{全连接层 (Linear Layer)} \rightarrow \text{LLM}$；
  * Q-Former 结构： Q-Former 初始化了一组固定数量的可学习查询向量（Learnable Queries，通常为 32 个）。这些 Queries 之间通过自注意力（Self-Attention）进行交互，并通过交叉注意力（Cross-Attention）与冻结的视觉编码器提取的图像 Patch 特征进行交互，从而“主动查询”并吸取视觉信息，还可以通过自注意力与文本输入进行交互；
  * 第一阶段训练（视觉-语言表征对齐）：冻结视觉编码器，单独对 Q-Former 进行第一阶段预训练。通过图文对比学习 (ITC)、图文匹配 (ITM) 和基于图像的文本生成 (ITG) 三个任务，强制这 32 个 Queries 提取出最符合文本语义的浓缩视觉特征；
  * 第二阶段训练（视觉-语言生成对齐）：连接视觉编码器和 LLM（均冻结），仅仅训练 Q-Former 和它后面的一个线性投影层。将 Q-Former 输出的 32 个浓缩 Token 通过线性层映射到 LLM 的文本 Embedding 空间并输入到 LLM，让 LLM 能够理解这些视觉特征并生成回答。
* Qwen-VL

  * DeepStack (跨层融合，Qwen3-VL)：借鉴 DeepStack 机制，从视觉编码器的不同层（三个不同层级）提取特征，merger 将特征投影为可视化的 tokens，并采用残差连接的方式将其注入到 LLM 的前三层中。这加强了视觉与语言的对齐，保留了从低层到高层的丰富视觉信息；
  * Interleaved MRoPE (交错式多模态旋转位置编码，Qwen3-VL)：原始的 MRoPE 中，嵌入维度被划分为时间 (t)、高度 (h) 和垂直 (w) 子空间，每个子空间分配不同的旋转频率，导致频谱不平衡。重新设计了位置编码，将时间 (t)、水平 (h) 和垂直 (w) 分量交错分布，确保每个时空轴在低频和高频频段均有统一的表示，解决了频谱不平衡问题，显著提升了长视频理解能力；
  * Explicit Video Timestamps (基于文本的显式视频时间戳，Qwen3-VL)：不再用绝对时间位置编码，因为将时间位置 ID 直接绑定于绝对时间会产生过大且稀疏的时间 ID，从而降低模型理解长时间上下文的能力。同时该方案下的有效学习需要在不同帧率（fps）上进行广泛且均匀分布的采样，显著增加了训练数据构建的成本。采用基于文本标记的时间编码策略，每个视频时间补丁前置时间戳，从而使模型可以更高效、精确地感知时间信息。
  * 动态分辨率：引入 2D-RoPE，用于建模图像的二维位置信息；推理时，不同分辨率的图像会被打包成一个序列；引入 token 压缩，即在 ViT 后加一个 MLP 将 $2\times 2$ 的相邻 token 合并为 1 个。
  * 动态 FPS：
  * 训练 pipeline：
    - Pre-Training: 视觉语言对齐 ——> 多模态预训练 ——> 长上下文预训练 ——> 超长上下文适应
    - Post-Training: SFT ——> 知识蒸馏 ——> 强化学习

### Q4：目前常用的视觉编码器，SigLIP 的改进？

### A4：

基本原理：文本和图像分别经过编码器 $f_{txt}$ 和 $g_{img}$ 得到各自的 embedding 即 $T_e$、$I_e$。对 $T_e$ 和 $I_e$ 计算余弦相似度。

* CLIP: 假设 $batch\_size=N$, 每个 $batch$ 有 $N$ 张图片和 $N$ 条文本，则可以形成 $N\times N$ 的相似度矩阵。将图文匹配视作一个 $N$ 分类问题，使用基于 softmax 的对比损失函数。依赖 $batch$ 的大小。

```Python
# image_encoder - ResNet or Vision Transformer 
# text_encoder - CBOW or Text Transformer 
# I[n, h, w, c] - minibatch of aligned images 
# T[n, l] - minibatch of aligned texts 
# W_i[d_i, d_e] - learned proj of image to embed 
# W_t[d_t, d_e] - learned proj of text to embed 
# t - learned temperature parameter

# extract feature representations of each modality
I_f = image_encoder(I)
T_f = text_encoder(T)

I_e = l2_normalize(np.dot(I_f, W_i), axis=1) 
T_e = l2_normalize(np.dot(T_f, W_t), axis=1)  

# scaled pairwise cosine similarities [n, n] 
logits = np.dot(I_e, T_e.T) * np.exp(t)  

# symmetric loss function 
labels = np.arange(n) 
loss_i = cross_entropy_loss(logits, labels, axis=0) 
loss_t = cross_entropy_loss(logits, labels, axis=1) 
loss = (loss_i + loss_t)/2
```

温度系数用来控制分布，$t$ 越小，分布越尖锐，$t$ 越大，分布越平滑。可学习的温度系数用来在训练过程中自适应地平衡判别性和稳定性。$batch$ 越大，负样本多，需要更强区分，$t$ 要更小；有噪声正样本，$t$ 要更大，从而避免错误样本被强拉近，提高鲁棒性。

* SigLIP: 图文对是独立的，类似于二分类，损失函数是逐点的 sigmoid，对 $batch$ 的大小不敏感。简化了训练流程，训练压力小。在初始化时，许多负样本带来的严重不平衡主导损失，导致大量初始优化步骤试图纠正这种偏差。为缓解这一问题，SigLip 引入了一个额外的可学习偏差项 $b$，类似于温度 $t$ 。

$$
-\frac{1}{|\mathcal{B}|}\sum_{i=1}^{|\mathcal{B}|}\sum_{j=1}^{|\mathcal{B}|}\underbrace{\log\frac{1}{1+e^{z_{ij}(-t\mathbf{x}_i\cdot\mathbf{y}_j+b)}}}_{\mathcal{L}_{ij}}.
$$

### Q5：大模型微调的方式，区别？

### A5：可以分为全量微调及参数高效微调。

* 全量微调 (Full Fine-Tuning)：

  * 定义：对模型的所有参数进行更新；
  * 特点：性能通常更好，能最大程度拟合数据；
  * 缺点：资源消耗极大，且在数据量少时容易过拟合，容易发生灾难性遗忘（忘记通用知识）。
* 参数高效微调 (PEFT)：

  * 定义：冻结大部分预训练参数，仅通过训练少量的附加参数（Adapter）或低秩矩阵（LoRA）来适配下游任务；
  * 代表方法：LoRA、P-Tuning、Adapter；
  * 优势：显存占用极低，训练速度快，不易破坏原有知识，且便于多任务部署。

### Q6：LoRA 原理及超参数的选择？

### A6：

在适应特定任务时，大模型具有很低的内在维度，其虽然具有庞大的参数量，但在微调时权重变化的有效信息其实分布在一个非常低维的子空间中，因此可以假设其权重更新在适应过程中也具有很低的内在秩。

* 设原模型的权重为 $W$, 全量微调后的模型权重即为 $W+\Delta W$, 此时的 $\Delta$ 和 $W$ 一样大，参数量巨大，增加了微调的成本，为了高效化，LoRA 采用旁路更新，即冻结原模型的权重 $W$, 同时用两个极小的矩阵 $A$ 和 $B$ 相乘来近似 $\Delta W$,

$$
W^{'} = W + \frac{\alpha}{r}(B\times A),
$$

其中 $dim(B)=d\times r$, $dim(A)=r\times d$, $r$ 是一个很小的秩, 通过这种操作使得原本需要 $d\times d$ 的参数量压缩到了 $2\times d\times r$。

* LoRA 原论文的结论是应用在注意力层的 $q_{proj}, v_{proj}$ 最高效。为了提高效果，可以额外应用在注意力层的 $k_{proj}, o_{proj}$ 及所有 FFN 层（包括 $gate_{proj}, up_{proj}, down_{proj}$）。
* LoRA 的设计是一种隐式的正则化，其参数量很小，在数据量不大的情况下可以防止过拟合。
* LoRA 超参数的选择：
  * init：对 $A$ 使用随机高斯初始化，$B$ 使用零初始化，因此在开始阶段需要满足 $BA=0$，此外根据链式法则 $A$ 随机高斯初始化可以保证 $B$ 获得梯度从而进行更新；
  * $r$：原论文的结论是在秩很小即 $r$ 取 1-8 时效果已经很好，提高到 $r=64$ 性能反而下降。通常从 8 或 16 开始测试；
  * $\alpha$：其实是缩放系数，本质和学习率相同，为了简化一般取 $\alpha=r$, 或者取 $\alpha=2r$, 这可以让模型更倾向于使用 LoRA 学到的新知识。

### Q7：MoE 架构与 Dense 架构？

### A7：

MoE（混和专家）架构将 FFN 层拆分成 $N$ 个独立的小 FFN 网络，输入 token 经过路由器输出一个权重向量，之后根据门控机制选择（Top-k，稀疏激活）去哪几个专家。

* Dense 架构：对于输入的每一个 Token，模型都会激活网络中的所有参数参与计算，无论输入简单还是复杂，计算量是固定的。
  * 优势：训练稳定、微调简单；
  * 劣势：推理成本高，特别是在规模变大时。存在遗忘问题。
* MoE 架构：将模型中的 FFN 层拆分成多个专家。对于每一个 Token，通过一个路由决定它去哪几个专家那里处理。特点是稀疏激活。虽然模型总参数量巨大，但处理每个词时，只用了很少一部分参数。
  * 优势：推理效率高、训练速度快、扩展性强；
  * 劣势：训练困难，需要解决负载均衡问题。显存占用大，微调困难。

### Q8：什么是 KV Cache？它是如何加速推理的？

### A8：

* 背景： 在生成式模型的推理阶段，生成第 $t$ 个 Token 时，需要计算 $Q_t, K_t, V_t$。计算 Attention 时，需要 $Q_t$ 与之前所有时刻的 $K_{1:t}$ 和 $V_{1:t}$ 进行交互。
* 原理： 由于之前时刻的 $K$ 和 $V$ 已经在之前的步骤中计算过了，且权重 $W_k, W_v$ 是固定的，因此 $K_{1:t-1}$ 和 $V_{1:t-1}$ 是不会变的。
* 实现： 每次推理只计算当前 Token 的 $K_t, V_t$，然后将其拼接到缓存（Cache）中，下次推理直接取用。
* 收益： 避免了重复计算，单步生成时 Attention 的复杂度从 $O(N^2)$ 降低到 $O(N)$，显著提升推理速度。

### Q9：什么是 RLHF？

### A9：

基于人类反馈的强化学习。利用人类偏好信号，通过强化学习对预训练语言模型进行对齐优化，使模型输出更符合人类期望。

### Q10：PPO、DPO、GRPO 的原理和区别？

### A10：

#### 1. 原理

* **PPO (近端策略优化)**：经典的 Actor-Critic 强化学习框架。它通过奖励模型（RM）打分，利用价值模型（Critic）预测基线来计算**优势函数（Advantage）**，在最大化奖励的同时，使用 KL 散度限制模型的更新幅度（Proximal），防止策略崩溃。
* **DPO (直接偏好优化)**：将强化学习转化成**有监督对比学习**。它基于 Bradley-Terry 偏好假设，通过数学推导把奖励模型直接融进了语言模型的概率分布中。直接拿人类标好的“好/坏回答对”进行交叉熵训练，拉大好坏回答的生成概率差。
* **GRPO (组相对策略优化)**：抛弃 Critic 模型的轻量化 PPO。针对同一个提示词，让模型生成 $G$ 个回答（Group），用规则或 RM 打分后，直接计算这组分数的**均值和标准差（Z-score 标准化）**。这个相对得分直接作为优势函数来更新模型。

#### 2. 区别

##### 基线 (Baseline) 与优势估计的方式

* **PPO**：依靠训练一个庞大的 **Critic 模型** 来预测预期收益作为基线。难度大，极不稳定。
* **DPO**：**不需要基线**。它跳过了奖励计算，直接在静态数据集上做概率的相对对比。
* **GRPO**：用**组内平均分**作为基线。通过多次采样求均值，用时间换空间。

##### 训练模式与探索能力

* **DPO** 是**离线学习 (Offline)**：训练时不生成新文本，只看死数据。**缺点**：上限被数据集锁死，模型无法通过试错产生“顿悟”或学会长逻辑推理。
* **PPO** 和 **GRPO** 是**在线学习 (Online)**：训练时模型需要自己实时生成文本去“试错”并接受打分。**优点**：具备探索能力，理论上限极高，是训练模型推理能力的核心。
* **PPO** 和 **GRPO** 都是典型的 **Online & On-policy** 算法。它们在训练时必须自己生成数据，且只能用当前策略刚生成的数据来更新自己，因此探索能力强、上限高，代价是训练成本高昂，因为旧数据无法复用。**DPO** 则是 **Offline & Off-policy** 算法。它直接利用别人或老模型生成好的静态偏好数据集进行对比学习，不需要实时生成数据，因此训练极其高效、稳定，但缺陷是缺乏探索能力，容易受限于数据集的分布。

##### 显存开销与工程复杂度

* **PPO**：需要同时运行 4 个模型（Actor、Reference、Reward、Critic），显存和通信开销较大。
* **DPO**：仅需运行 2 个模型（Actor、Reference），且不需要实时生成（省去 KV Cache 开销），工程实现最简单。
* **GRPO**：通常只需运行 2 个模型（Actor、Reference），外加轻量级的规则校验器。省去了 Critic 模型的巨大开销，腾出的显存可用于支撑极长的上下文生成。

#### 3. On-policy 和 Off-policy 的区别

* On-policy 用当前策略产生数据并训练当前策略。
* Off-policy 可以用旧策略或其他策略的数据来训练当前策略。

### Q11：SFT 的损失函数是什么？为什么不用 MSE ？

### A11：

* 损失函数为交叉熵损失，具体来说是 Token-level Cross Entropy。
* LLM 训练时本质是在做分类任务，预测下一个 token 可以视为词表大小 C 的多分类问题。对于分类任务，模型输出一个概率分布，交叉熵更适合衡量两个概率分布的相似度。另一方面，交叉熵损失配合 softmax 的梯度更加稳定，训练高效。
* 交叉熵损失提高正确 token 的 logit，压低所有其他 token 的 logit。即训练过程中在做正确 token 和所有其他 token 的对比，类似于对比学习中的正样本和负样本。

### Q12：PPO、DPO、GRPO 的损失函数推导？

### A12：

### Q13：Thinking Model 怎么训练？

### A13：

* 用思维链（Chain-of-Thought）数据做监督微调
* 使用强化学习进一步优化

### Q14：强化学习中 KL 散度的作用？

### A14:

* 防止模型崩坏，不让模型偏离语言分布太远，避免 reward hacking。
* 稳定训练，KL 项相当于添加了一个正则约束，限制每一步更新的幅度，使训练更加平滑。
* 保留模型通识能力。

### Q15：采样温度的作用？采样策略？

### A15：

* 采样温度：作用于 softmax 之前，采样温度通过对 logits 进行缩放来控制概率分布的平滑程度，温度越高，分布越平坦、随机性越强；温度越低，分布越尖锐。
* 采样策略：
  * 贪婪采样：选最大概率 token，稳定但多样性差；
  * 随机采样：按概率分布采样，多样性好但不确定；
  * Top-k：只从概率最高的 k 个 token 采样，固定数量裁剪，采样空间固定，生成过程稳定可控；
  * Top-p：选最小 token 集合，使概率和 ≥ p，动态裁剪，自适应分布，生成更自然。

### Q16：DeepSpeed 的原理？

### A16：

* ZeRO
  * Stage 1：优化器分片
  * Stage 2：梯度分片
  * Stage 3：参数分片
* Offload：将数据、梯度、优化器状态等下沉到CPU内存或硬盘上
* Gradient Checkpoint：在反向传播时重新计算深度神经网络的中间值（而通常情况是在前向传播时存储的），用时间换空间

### Q17：Flash Attention 的原理？

### A17：

### Q18：1 B 模型训练和推理分别占用多少显存？

### A18：

* 训练（全参）：
  * FP32:
    * 权重：$1\times 4 = 4$ G
    * 梯度：$1\times 4 = 4$ G
    * 优化器：$(1+1)\times 4 = 8$ G
    * 优化器（8 bit）: $(1+1)\times 4 / 4 = 1$ G
      共 16 G
  * FP16 / BF16:
    * 权重：$1\times 2 = 2$ G
    * 梯度：$1\times 2 = 2$ G
    * 优化器：$(1+1)\times 4 = 8$ G
      共 12 G
* 推理
  * FP32:
    * 权重：$1\times 4 = 4$ G
    * KV cache：$KV cache ≈ 2 × layers × seq\_len × hidden_dim × 4 bytes$ G
  * FP16 / BF16:
    * 权重：$1\times 2 = 2$ G
    * kV cache：$KV cache ≈ 2 × layers × seq\_len × hidden_dim × 2 bytes$ G

### Q19：大模型训练的并行策略？

### A19：

* 数据并行（DP）：切分数据
* 模型并行
  * 张量并行（TP）：把一层里的矩阵切开，分给多卡计算
  * 流水线并行（PP）：不同 GPU 放不同层

### Q20：RAG（检索增强生成）的流程？

### A20：

* 文档处理 -- 离线
  * 文档收集（PDF / 网页 / 数据库）
  * 文本清洗（去噪、分段）
  * Chunk 切分（很关键）
  * Embedding（向量化）
  * 存入向量数据库（FAISS / Milvus）
* Query 处理 -- 在线
  * 用户输入问题 -- Query embedding
* 检索 -- 从向量库找最相关内容
  * 相似度搜索（余弦相似度 / 内积）
  * Top-k 召回

### Q21：Qwen3.5 有哪些改进？

### A21：

* 原生多模态：通过早期文本-视觉融合与扩展的视觉/STEM/视频数据实现原生多模态。
* 门控注意力：在标准的注意力输出之后，加了一个数据依赖的 Sigmoid 门控（Gate）。
  * 消除 Attention Sink（注意力汇聚）现象 -- 把大量的注意力分数分配给句子的第一个 Token；
  * 提升训练稳定性与效率，加了门控后，模型训练变得非常稳定，可以使用更大的学习率进行训练，收敛速度更快；
  * 引入非线性与稀疏性。
* Agent：
  * 构建了可扩展的异步强化学习框架，支持 Qwen3.5 全尺寸模型，并全面覆盖文本、多模态及多轮交互场景。框架面向原生智能体工作流设计，能够实现稳定、无缝的多轮环境交互；
  * 对各类 RL 任务和环境的全面扩展。模型效果随 RL Environment scaling 带来增益。

### Q22：On Policy Distillation 的原理？

### A22：

### Q23：DeepSeek V4 的改进？

### A23：

### Q24：Kimi K3 的改进？

### A24：

---

## Agent 八股

### Q1：Function Calling, MCP, Skills 的定义与区别？

### A1：

Function Calling 是执行工具，MCP 是工具接入协议，Skills 是任务级能力封装。

* Function Calling：LLM 将非结构化需求转化为结构化输出调用外部 API，本质上是模型执行工具调用，可控性好。
* MCP：模型上下文协议。一个统一的工具/数据接入协议，以一致的方式将各种数据源、工具和功能连接到 AI 模型。本质上是工具标准化接口层，用于解决模型如何连接工具生态。
* Skills：把多个工具 + prompt + 推理流程封装成一个能力。任务级抽象 + 工作流，让用户可以用自然语言定义可以可复用的任务流程，用于解决模型如何完成复杂任务。

三者是层次化的关系，$Skills \rightarrow MCP \rightarrow Function\ Calling$。

### Q2：Harness Engineering？

### A2：

* PE：通过设计 prompt（提示词）来引导模型输出更符合预期。使用 few-shot, zero-shot, chain-of-thought, role prompting, output format约束（JSON、结构化）控制模型行为。
* CE：关注如何在有限的上下文窗口中，选择、组织并注入与用户任务高度相关的信息，从而让大模型在合理的边界内做出最佳推理与执行。
* HE：除了模型以外的组件都可以被称为 Harness。不仅关注上下文，更关注 Agent 的稳定运行，它为 Agent 搭建了完整的运行空间，设计了它的能力结构、协作机制和反馈闭环，让它在特定领域里稳定地产生高质量结果。

### Q3：Skills 的优势？

### A3：

渐进批露。分层上下文加载机制，目的是“解决技能数量多导致上下文窗口爆炸”的问题。它让每个 Skill 的内容按需加载，而非一次性全部塞进系统提示词。

### Q4：如何避免大模型的幻觉？

### A4：

* 训练层面：引入 RLHF / RLAIF 对齐真实偏好。
* 应用层面：
  * 优化 Prompt；
  * RAG（检索增强）；
  * 先检索再生成、工具调用。

### Q5：Agent 的记忆系统？

### A5：

Agent 的记忆系统解决“上下文窗口有限、多轮任务需要跨会话保留信息”的问题，通常按时效与用途分层。

* 工作记忆（Working Memory）：当前对话上下文、工具调用中间结果、本轮任务状态，直接放在 Context Window 中，容量有限、读写最快。
* 短时 / 情景记忆（Episodic Memory）：记录一次任务或一轮交互的轨迹（做了什么、调用了哪些工具、结果如何），用于反思与回溯。
* 长时 / 语义记忆（Semantic Memory）：把可复用知识、用户偏好、领域事实写入向量库或 KV 存储，通过检索（RAG）按需注入上下文。
* 程序记忆（Procedural Memory）：沉淀为可复用的 Skills / Prompt / 工作流，让 Agent 学会“怎么做”，而不只是“知道什么”。
* 读写机制：写入（提炼、摘要、结构化落库）、检索（相似度 / 关键词 / 时间衰减）、更新（冲突覆盖、版本化）、遗忘（TTL、重要性打分、压缩）。核心原则是：热数据进上下文，冷数据进外部存储，按需召回。

### Q6：Agent 的上下文管理？

### A6：

上下文管理的目标是在有限窗口内最大化任务相关信息的信噪比，避免上下文爆炸和注意力稀释。

* 分层注入：系统 Prompt / Skills 摘要常驻；详细 Skill 内容、工具 Schema、检索结果按需加载（渐进披露）。
* 压缩与摘要：对历史多轮对话做滚动摘要（Conversation Summarization），保留决策、约束、未完成目标，丢掉冗余闲聊。
* 窗口策略：滑动窗口（保留最近 N 轮）、或“最近消息 + 关键摘要 + 检索片段”的混合拼装。
* 结构化状态：把任务进度、待办、工具结果写成显式 State（JSON / Scratchpad），而不是纯自然语言堆叠，便于截断与恢复。
* 工具结果治理：对长输出做截断、摘要或落盘后只回传路径/关键字段，防止单次工具返回占满上下文。
* 与记忆系统的关系：上下文管理是“当前窗口怎么排版”，记忆系统是“窗口外信息怎么存取”；好的 Agent 是两者协同——先检索/回忆，再精排进窗口。

### Q7：Agent 自进化？

### A7：

自进化指 Agent 在部署后能根据反馈持续改进策略、记忆与能力，而不只依赖一次性离线训练。

* 反思闭环（Reflection）：执行后自评对错与原因（Self-Critique），把失败案例写入记忆，下次规避同类错误。
* 经验沉淀：将成功轨迹蒸馏成 Skill / Prompt / 规则；将用户纠正转化为偏好或约束更新。
* 记忆进化：对长时记忆做增删改查与去重；用重要性、使用频率、时效性做遗忘与巩固。
* 策略进化：通过在线 RL（如 GRPO）、偏好学习或人类反馈微调模型；或在不改权重的情况下进化 Harness（更好的路由、工具选择、重试策略）。
* 能力扩展：自动发现/注册新工具，合成新 Skill，扩展 MCP 接入面。
* 边界：自进化需要可验证反馈（单元测试、规则校验、人类确认），否则容易 reward hacking 或把错误经验固化进记忆。

### Q8：多 Agent 的编排？

### A8：

多 Agent 编排解决单 Agent 能力边界问题：把复杂任务拆给角色不同的 Agent，由编排层负责分工、通信与收敛。

* 常见拓扑：
  * 流水线（Pipeline）：串行交接，适合确定性流程（检索 → 分析 → 写作）；
  * 层级（Hierarchical）：Supervisor / Manager 拆解任务、分配 Worker、汇总结果；
  * 对等协作（Peer / Swarm）：多个 Agent 互相讨论或投票，适合开放式问题；
  * 路由（Router）：入口 Agent 按意图分流到专精 Agent。
* 通信方式：共享黑板（Shared State）、消息传递（Message Passing）、工具调用式委派（把子 Agent 当 Tool）。
* 编排关注点：任务分解粒度、角色与权限隔离、冲突消解（谁最终拍板）、终止条件（最大轮数 / 达成共识 / 验收通过）、可观测性（轨迹与成本追踪）。
* 与单 Agent 的取舍：多 Agent 提升分工与并行，但增加延迟、token 成本和协调失败风险；简单任务优先单 Agent + Skills，复杂长链路再上多 Agent。

### Q9：Agent 的工作模式（ReAct 等）？

### A9：

Agent 的工作模式描述的是“推理—行动—反馈”如何组织成可循环的控制流，不同模式在规划深度、工具调用频率和纠错能力上有取舍。下面前三类（ReAct / Plan-and-Execute / Reflection）是当前主流与面试重点，其余作补充了解。

* ⭐ **ReAct（Reason + Act）**：交替输出 Thought（推理）与 Action（工具调用），再根据 Observation（环境反馈）继续循环，直到给出 Final Answer。优点是边想边做、可纠偏；缺点是步数多、上下文易膨胀，规划不够全局。
* ⭐ **Plan-and-Execute**：先一次性或分阶段生成完整计划（Plan），再按步骤执行（Execute），执行中可按需重规划。优点是目标清晰、适合长任务；缺点是初始计划可能过时，需要 Replan 机制兜底。
* ⭐ **Reflection**：在 ReAct 或执行之后增加自评与反思，把失败原因写入记忆，指导下一次重试。偏“事后纠错”，适合可验证任务（代码、刷题、检索对错）。
* CoT / ToT：
  * Chain-of-Thought：单路径逐步推理，偏“想清楚再答”，本身不一定调工具；
  * Tree-of-Thoughts：多路径搜索与剪枝，适合开放式难题，成本更高。
* Function Calling / Tool-use：模型直接产出结构化工具调用（JSON Schema），Harness 负责执行并回填结果；可与 ReAct 结合——ReAct 提供控制流，Function Calling 提供接口形态。
* CodeAct：把行动统一成写/跑代码（而不是分散的 API 调用），用代码作为通用动作空间，表达力强，适合数据分析、文件操作类任务。
* 选型直觉：短链路工具任务用 ReAct / Function Calling；长链路多步骤用 Plan-and-Execute；需要强纠错与自进化加 Reflection；强搜索空间用 ToT；动作高度异构时优先 CodeAct。

### Q10：Loop Engineering？


### Q11：Graph Engineerung？

---


## Transformer 八股

### Q1：Transformer 在计算点积时，为什么要缩放，为什么要除以 $\sqrt d$ ？

### A1：

* 防止点积数值过大（方差过大）导致 Softmax 饱和后出现梯度消失，保持训练稳定。
* 假设 q、k 服从独立的标准正态分布，

$$
Var(Q\cdot K)=\sum_{i=1}^{d}Var(q_ik_i),\\
\frac{Var(Q\cdot K)}{\sqrt{d}}=1.
$$

即除以 $\sqrt d$ 可以使得点积的方差归一化为 1，保持数值分布的稳定。

### Q2：多头注意力机制如何在数学上被实现，它如何改进自注意力机制的性能？

### A2：

多头注意力机制的核心思想是将输入的 $Q, K, V$ 映射到多个不同的低维子空间中并行计算注意力，最后将结果拼接。这相当于让模型从“不同的角度”观察序列。

假设模型维度为 $d_{model}$，头数为 $h$，每个头的维度为 $d_k = d_{model} / h$。

* 线性投影与分头：首先，对于第 $i$ 个头（$i=1, ..., h$），使用独立的权重矩阵 $W_i^Q, W_i^K, W_i^V \in \mathbb{R}^{d_{model} \times d_k}$ 对输入进行线性变换：

$$
Q_i = Q W_i^Q, \quad K_i = K W_i^K, \quad V_i = V W_i^V.
$$

* 独立计算注意力：在每个子空间内单独计算注意力输出 $head_i$：

$$
\text{head}_i = \text{Attention}(Q_i, K_i, V_i) = \text{softmax}\left(\frac{Q_i K_i^T}{\sqrt{d_k}}\right) V_i.
$$

* 拼接与融合：将所有头的输出拼接（Concat），并通过输出权重矩阵 $W^O \in \mathbb{R}^{d_{model} \times d_{model}}$ 进行线性变换，得到最终结果：

$$
\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \dots, \text{head}_h) W^O.
$$

### Q3：MQA, GQA, MLA 的区别？

### A3：

* MQA：多个 Q 对应同一组 K/V
* GQA：把 head 分组，每组共享一组 K/V
* MLA：把 K/V 投影到 latent 空间

### Q4：Transformer 为什么需要位置编码？

### A4：

* 解决无序性：Transformer 的核心组件 Self-Attention 具有置换不变性。在计算注意力权重 $Softmax(QK^T)$ 时，交换输入 Token 的顺序，输出结果的对应值不会改变，仅仅是顺序改变，即 Self-Attention 对顺序不敏感。
* 引入序列信息：自然语言是高度依赖语序的。位置编码将位置信息注入到 Input Embedding 中，使模型能够感知 Token 的绝对位置或相对顺序。

### Q5：FFN（前馈神经网络）层的作用？引入门控层？

### A5：

* 引入非线性：Attention 操作主要由线性变换和矩阵乘法组成（除了 Softmax），FFN 中的激活函数（如 GeLU, SiLU）为模型引入了非线性能力，使其能拟合更复杂的函数。
* 记忆与知识存储：FFN 层充当了 Key-Value 记忆网络的作用。Attention 层负责从上下文中“抽取”信息（Token 间的关系），而 FFN 层负责“存储”事实性知识和语言模式。
* 升维增加容量：FFN 通常将维度放大 4 倍（$d \rightarrow 4d \rightarrow d$），增加了模型的参数容量。
* 门控层：
  * 引入了更多非线性，增强模型的表达能力；
  * 防止“神经元死亡”，梯度更平滑，使得训练更稳定、收敛速度更快；
  * 门控本质是一种局部注意力机制，在维度上解决“哪些特征在当前上下文中更有用”。

### Q6：层归一化的形式，为什么要用 LN 层而不用 BN 层？

### A6：

* 形式： 对每一个样本，计算其在特征维度上的均值 $\mu$ 和方差 $\sigma^2$，进行归一化：

$$
LN(x) = \frac{x-\mu}{\sqrt{\sigma^2 + \epsilon}} \times \gamma + \beta.
$$

* 为什么不用 BN (批归一化)层：
  * 变长序列问题： NLP 任务中 Batch 内的句子长度不一，需要 Padding。BN 是在 Batch 维度计算统计量，Padding Token 会导致统计出的均值和方差不准确，影响模型性能；
  * Batch Size 依赖： BN 依赖较大的 Batch Size 才能估算准确的统计量，而大模型由于显存限制，Batch Size 往往较小；
  * 训练与推理一致性： LN 对每个样本独立计算，推理时不需要依赖训练时的统计量，更适合 RNN/Transformer 这种序列模型。
* RMSNorm：去掉了层归一化中的平移（即减均值），且偏置为 0，计算复杂度更低且效果与层归一化持平。

### Q7：残差连接的作用？

### A7：

* 缓解梯度消失/爆炸：深度网络中，反向传播的梯度连乘容易导致梯度消失。残差连接 $x + f(x)$ 使得梯度可以直接通过“恒等映射”路径无损地反向传播到浅层，使深层网络的训练成为可能。
* 解决退化问题：理论上层数越多效果越好，但实际中会变差。残差连接保证了模型至少可以学到恒等映射，即表现不会比浅层模型更差。

### Q8：Pre-Norm 与 Post-Norm 的区别？

### A8：

* Post-Norm（BERT）： 先做 Attention/FFN，再做残差，最后做 LN。即 $x_{t+1} = LN(x_t + Sublayer(x_t))$。输出层的方差较大，梯度容易爆炸，需要精心设计的 Warm-up 策略才能收敛，收敛后可能泛化性稍好。
* Pre-Norm（GPT-2/3, LLaMA）： 先做 LN，再做 Attention/FFN，最后残差。即 $x_{t+1} = x_t + Sublayer(LN(x_t))$。梯度流更稳定，训练更稳定，不需要复杂的 Warm-up 即可训练极深的网络。目前大模型主流均采用 Pre-Norm。

## Python 八股

### Q1：Python 的装饰器有什么作用？

### A1：

Python 装饰器本质是一个高阶函数，它接收一个函数作为输入，返回一个增强后的函数。

### Q2：__init__ 的作用？

### A2：

* __init__()：用于类的初始化，负责初始化对象。
* __init__.py：是 Python 包的初始化文件，标识该目录是一个 Python 包。

### Q3：Python 全局解释器锁是什么？

### A3：

Python 的全局解释器锁（GIL, Global Interpreter Lock）是 CPython 中的一种机制，是一个全局互斥锁。它保证同一时刻只有一个线程执行 Python 字节码。主要目的是简化内存管理，但也限制了多线程在 CPU 密集型任务中的并行能力。