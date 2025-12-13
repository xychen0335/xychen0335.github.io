---
title: 'AIGC——扩散模型总结'
date: 2025-06-20 00:22:06
tags: []
published: true
hideInList: false
feature: 
isTop: false
---
# AIGC——扩散模型总结



## Q 1: DDPM 的算法原理？

扩散模型包括前向过程和反向过程。无论是前向还是反向过程都是一个参数化的马尔可夫链，前向过程通过不断添加噪声将数据分布转换为简单先验分布，反向过程用来生成数据，通过变分推断进行建模和求解。

## Q 2: VAE 和 Diffusion Models 中的重参数技巧？

* VAE 
	* 在编码器部分，根据分布 $x$ 采样得到随机变量 $z$，$z$ 属于隐空间，
	$$
	z = \mu + \sigma \epsilon
	$$
	其中 $\mu$ 和 $\sigma$ 是可学习的参数。
	* 解码器部分，根据 $z$ 进行数据重构。

* DMs
$$
q(x_t|x_0) = \mu_tx_0 + \sigma_t\epsilon
$$

## Q 3: DDPM 前向过程中如何加噪？

要添加不同尺度的噪声，前期添加的噪声小，因为如果加噪太多，会使得数据产生突变，导致反向还原比较困难；后期数据本身已经接近随机噪声，为了提高扩散效率，加更多的噪声以获取更大的变化幅度。

## Q 4: 变分推断？

优化目标为最大化对数似然，即最小化负对数似然，通过优化变分下界来近似实现。

## Q 5: DMs 与 VAE 的区别和联系？

* 区别：DDPM 正向过程没有学习参数，正向过程逐步破坏所有关于输入的信息，最终的分布是一个标准高斯分布。但是 VAE 中的隐随机变量 $z$ 包含关于 $x$ 的一些信息。
* 联系：反向过程都是通过对潜在变量进行采样，用神经网络将其转化为数据；有相应的正向过程，将数据转化为一系列的潜在表征；训练目标类似——优化对数似然并通过变分下界实现。

## Q 6: DDIM 怎么加速采样？

前向过程是非马尔可夫过程——直接建模 $q(x_t|x_0)$ 而不依赖于 $q(x_t|x_{t-1})$。与 DDPM 的训练完全相同，采样时采用时间步的子序列。

$$
\boldsymbol{x}_{t-1}=\sqrt{\alpha_{t-1}}\underbrace{\left(\frac{\boldsymbol{x}_t-\sqrt{1-\alpha_t}\epsilon_\theta^{(t)}(\boldsymbol{x}_t)}{\sqrt{\alpha_t}}\right)}_{\text{predicted }\boldsymbol{x}_0}+\underbrace{\sqrt{1-\alpha_{t-1}-\sigma_t^2}\cdot\epsilon_\theta^{(t)}(\boldsymbol{x}_t)}_{\text{direction pointing to }\boldsymbol{x}_t}+\underbrace{\sigma_t\epsilon_t}_{\text{random noise}}
$$

## Q 7: 扩散模型条件注入的方式？

* classifier-guidance
* classifier-free guidance

## Q 8: Stable Diffusion 如何注入文本信息？

通过 text encoder 对文本信息编码，之后通过 Cross-Attention 机制引入文本信息到 Diffusion 中。

## Q 9: Latent Diffusion 有什么改进？

通过 VAE 将像素空间映射到隐空间，降低计算开销，例如 $512\times512$ 的大图可以减小到 $64\times64$。

## Q 10: 时间步 timesteps 是怎么添加到扩散模型中的？

采用 Transformer 中的位置编码，将时间步进行编码后与输入数据相加。 

## Q 11: Classifier-free guidance 的原理？

* classifier-guidance 的缺点：需要额外训练一个分类器，该分类器与扩散模型是分离的。

* 原理：在训练期间对条件进行随机丢弃，相当于训练了两个模型：无条件生成的模型与带条件引导的模型，NFE = 2 ，
  $$
  \widetilde{\epsilon}_\theta(z_\lambda,c) = (1+\omega)\epsilon_\theta(z_\lambda,c)-\omega\epsilon_\theta(z_\lambda).
  $$
* CFG 中的 guidance scale 是一个超参数，其值越高，生成的图像质量越高且贴近条件，但会降低多样性。

## Q 12: Stable Diffusion 的微调？

* LoRA
* Dreambooth

## Q 13: VAE 生成的图像为什么是模糊的？如何减轻模糊性？

原因：

* VAE 学习的图像是高维图像，VAE 先将高维图像压缩到低维隐空间，之后复原回原空间。一些图像细节并不是低维流形，很难用低数据量描述。
* 重参数化技巧。隐变量的采样分为两个步骤，首先从已知简分布中采样得到一个噪声，之后对噪声进行变换和缩放得到最终的隐变量采样。这个过程会引入近似误差导致生成图像的模糊。
* KL 散度正则化。VAE 在训练中通过最大化一个变分下界来学习生成图像的分布。这个下界中包含一个 KL 散度项，用于约束生成的隐变量分布与预设的先验分布之间的差异。KL 散度会使图像的细节信息被平滑化。

解决方法：

* 增加模型复杂度
* 使用更复杂的先验分布
* 引入正则化方法
  
## Q 14: Stable Diffusion 可能会出现细节信息失真？

* 重参数化假设
* 编码器-解码器的结构会有信息损失
* 变分推断

## Q 15: DiT 中注入条件的方式？

* adaLN-zero block：最后输出的线性层权重初始化为 0，类似于 ResNet ，这使得网络在初始时为恒等映射。回归 scale 和 shift ，同时在残差模块之前再回归一个 scale
* Incontext-conditioning：将时间和条件作为额外的 token 添加到输入序列
* Cross-attention：将时间和条件的嵌入连接到一个长度为 2 的序列，与图像 token 序列分开。在多头自注意力模块后添加一个额外的多头交叉注意力模块

## Q 16: FLUX 相比 SD3 的改进？

* 采用双流+单流架构：前几层对文本和图像特征进行独立处理，后几层合并为统一流，增强跨模态对齐
* 引入了旋转位置编码（RoPE），通过旋转矩阵的方式将位置信息融入自注意力机制中，在长序列场景下表现更好

## Q 17: 为什么需要位置编码？

* 自注意力对输入序列的位置不敏感
* 序列数据依赖顺序信息，如文本序列中的单词位置会影响语义
* 扩散模型的 backbone 是时间依赖的，需要通过位置编码嵌入时间步

  
