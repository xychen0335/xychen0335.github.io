---
title: 'Stable Diffusion: ControlNet'
date: 2025-06-08 22:24:42
tags: [GAI,Diffusion]
published: true
hideInList: false
feature: 
isTop: false
---
# ControlNet ([Zhang et al.](https://openaccess.thecvf.com/content/ICCV2023/html/Zhang_Adding_Conditional_Control_to_Text-to-Image_Diffusion_Models_ICCV_2023_paper.html), 2023)

## Main Idea

本质上是对预训练的 Stable Diffusion 模型进行微调，对于网络部分，其冻结预训练好的 SD 模型。并拷贝 SD 模型的编码器及中间层部分，之后输入条件图像（姿态、深度、草图、分割图等）进行训练，并通过零卷积将训练好的 ControlNet 编码器拼接到原始 SD 的解码器部分。

## Zero Conv

1 $\times$ 1 convolution layer，其中“零”的含义为**权重和偏置全部初始化为 0**，因此零卷积不会给网络添加噪声，初始时，控制模块的输出为零，主模型不受影响；训练后，控制模块学会提供有意义的条件信号。在训练中会出现“突然收敛”现象。

## CFG Resolution Weighting

 将条件图像首先添加到条件输出 $\epsilon_c$ 中，之后根据每个块的分辨率为 SD 和 ControlNet 之间的每个连接乘以一个权重 $\omega_i=64/h_i$（论文中设定的隐空间维度为 $64$ ）。