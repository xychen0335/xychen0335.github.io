---
title: '从 Wasserstein 梯度流到扩散（桥）模型'
date: 2025-06-01 21:19:31
tags: [GAI,Diffusion,Optimal Transport]
published: true
hideInList: false
feature: 
isTop: false
---
# 	Wasserstein Gradient Flow AND Diffusion Models

## Continuity Equation

$$
\partial_t\mu_t+\mathrm{div}(\mu_tv_t)=0,
$$

Eq.1 称为**连续性方程**，用来描述质量守恒、电荷守恒、概率密度守恒。利用 Eq.1 可以推导 Wasserstein 梯度：

$$
\nabla_{\mathcal{W}}\mathcal{F}(\mu)=\nabla\delta\mathcal{F}(\mu),
$$

使用 ODE / PDE 对梯度流进行描述如下：

$$
\begin{aligned}
&\underbrace{\dot{x_t}=-\nabla_{\mathcal{W}}\mathcal{F}(\mu)(x_t)}_{vector\ field},\\
&\partial_t\mu_t=\mathrm{div}\left(\mu_t\nabla_{\mathcal{W}}\mathcal{F}(\mu_t)\right).
\end{aligned}
$$

Eq.3 即为 Wasserstein 梯度流。

常用的泛函 / 变分导数：

* 负熵——$\mathcal{F}(\mu)=-\mathcal{En}(\mu)=\displaystyle{\int} \mu \log\mu \rightarrow \delta\mathcal{F}(\mu)=\log\mu+1$

* $\mathrm{KL}$ 散度——$\mathcal{F}(\mu)=\displaystyle{\int} \mu \log\displaystyle{\frac{\mu}{\pi}} \rightarrow \delta\mathcal{F}(\mu)=\log\displaystyle{\frac{\mu}{\pi}}+1$

* $\mathcal{F}(\mu)=\displaystyle{\int} U(\mu) \rightarrow \delta\mathcal{F}(\mu)=U^{'}\circ\mu$

## FPE AND SDE

对于 Eq.2，取能量泛函为 $\mathrm{KL}(\mu||\pi)$，$\pi\sim exp(-\mathrm{V})$，$\mathrm{V}$可以理解为势能，此时能量泛函即为自由能，有如下式子：
$$
\begin{aligned}
& \partial_t\mu_t=\Delta\mu_t+\mathrm{div}(\mu_t\nabla \mathrm{V}),\\
& \underbrace {dX_t=-\nabla V(X_t)dt+\sqrt{2}dB_t}_{Langevin\ Diffusion}.
\end{aligned}
$$

Eq.3 即为 **福克-普朗克方程**（Fokker-Planck Equation, FPE）。其用来描述 SDE 的概率密度演化。

对于一个一般的 SDE:

$$
dx_t = f(x_t,t)dt+g(x_t,t)dw_t,
$$

其对应的 PDE 为：

$$
\partial_t\mu_t=-\mathrm{div}(f(x,t)\mu_t)+\frac{1}{2}\Delta[g^2(x,t)\mu_t].
$$

## Example

### VP-SDE (DDPM)
$$
dx_t = -\frac{1}{2}\beta_tx_tdt+\sqrt{\beta_t}dw_t,
$$

其对应梯度流的能量泛函为$\mathrm{KL}(\mu||\mathcal{N}(x;0,\mathrm{I}))$。

注：$\beta_t$只是时间缩放因子，并不会影响实际的能量泛函。


### Heat Equation

$$
dx_t = \sqrt{2}dw_t,
$$

其对应梯度流的能量泛函为负熵。

### Rectified Flow

$$
dX_t = (X_1-X_0)d_t,
$$

直流（整流）可以理解为 $X_1$ 和 $X_0$ 之间的线性插值，其对应 ODE 要解决的速度场可以定义为：

$$
v^X_t(x)=\mathbb{E}[X_1-X_0|X=x].
$$

事实上，其对应常值能量泛函——Wasserstein 空间中的测地线。

### Schrodinger Bridge

考虑**配对数据**（满足两端为 Dirac delta 边界条件）的 $Gaussian\ Schrodinger\ Bridge$：
$$
\min_{\mathbb{Q}\in\mathcal{P}(p_{\mathrm{data}},p_{\mathrm{prior}})}D_{\mathrm{KL}}(\mathbb{Q}\mid\mid\mathbb{P}),
$$
参考过程 $\mathbb{P}$ 为标准布朗运动，其解为一对 $\mathrm{Forward-Backward}\ \mathrm{SDE}$：
$$
\begin{aligned}
dx_t &= \frac{x_1-x_t}{1-t}dt+dw_t\rightarrow\mathcal{F}(\mu)=\mathrm{KL}(\mu||\mathcal{N}(x;x_1,(1-t)\mathrm{I})),\\
dx_t &= \frac{x_t-x_0}{t}dt+dw_t\rightarrow\mathcal{F}(\mu)=\mathrm{KL}(\mu||\mathcal{N}(x;x_0,t\mathrm{I})).
\end{aligned}
$$

前向过程时间 $t\rightarrow T=1$ 以及后向过程时间 $t\rightarrow 0$，两端退化为 Dirac delta 分布（Bridge-TTS, [Zhu et al., 2023](https://arxiv.org/abs/2312.03491)）。
