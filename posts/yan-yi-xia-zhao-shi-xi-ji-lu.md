---
title: '研一下找实习记录'
date: 2025-06-10 20:19:29
tags: [求职]
published: true
hideInList: true
feature: 
isTop: false
---
# 研一下找实习记录
## 考虑岗位
深度学习相关（AIGC、CV、图像处理）、测开
## 05.30 Calix 测试开发 base 南京
### 流程：电话面 + 线下面试（两组技术 + 一组HR面）
### 实习内容：测试开发，主要是网络通信网络层和链路层，搭建拓扑、编写测试脚本、case 开发
### 面试经过
* 电话面：主要问了学没学过计网、能实习几个月，介绍了业务情况
* 项目面：问了做的两个项目，没有很深入地问，主要是我在讲，面试官不懂深度学习相关算法
* 八股+手撕：
    * 主要问了计网和一点点 Linux：MAC 地址和 IP 地址、报文结构、ARP 协议、LAN 和公网、L2 &      L3 转发的区别；mcp、ls 等基础命令
    * 项目补充：问了卷积层（感受野）、Transformer 的结构，比较简单，面试官确实不怎么接触深度学习
    * 手撕：反转链表、Python os 输出目录下的文件
* Hr 面：确认是否可以实习 6 个月、再次介绍业务情况
### 感受 & 结果：体验不错，面试官人都很好。因为是外企，基本是955的工作模式，拿到 offer，但考虑到时间太长，最后拒绝
## 06.10 炙石科技 AIGC base 北京
### 流程：Boss 直聘上直接约了线上面试，只有一轮技术面
### 实习内容：照片编辑
### 面试经过
* 自我介绍
* 项目：挑一个做过的项目介绍一下，直接开共享对着小论文讲。因为是 AIGC 岗，加上讲的项目有关扩散模型，面试官针对 SD 提了几个问题：
    * DDPM 的参数化，是否均值和方差都需要参数化 
    * 对 SD 是否了解
    * SD3 的流匹配，是否真的更快，和此前 DDPM 的区别
    * text 经过 CLIP 编码后的处理，为什么 work
    * ControlNet 在 DiT 架构下表现不好，为什么
* 手撕：
    * 寻找数组中第 K 个最大元素，要求计算复杂度低
  ```Python
    import sys
    import random

    # --- 快速排序 ---
    def quick_select(nums, k):
        # 第 k 大，相当于排序后索引为 len(nums) - k 的元素（升序）
        target_idx = len(nums) - k
    
        def partition(left, right):
            # 随机选择 pivot 避免最坏情况 O(N^2)
            pivot_idx = random.randint(left, right)
            pivot = nums[pivot_idx]
        
            # 把 pivot 换到最右边
            nums[pivot_idx], nums[right] = nums[right], nums[pivot_idx]
        
            store_idx = left
            for i in range(left, right):
                if nums[i] < pivot:
                    nums[store_idx], nums[i] = nums[i], nums[store_idx]
                    store_idx += 1
                
            # 把 pivot 换回来
            nums[store_idx], nums[right] = nums[right], nums[store_idx]
            return store_idx

        left, right = 0, len(nums) - 1
        while left <= right:
            pivot_index = partition(left, right)
            if pivot_index == target_idx:
                return nums[pivot_index]
            elif pivot_index < target_idx:
                left = pivot_index + 1
            else:
                right = pivot_index - 1
            
        return -1

    # --- 输入输出 ---
    if __name__ == "__main__":
        try:
            # 读取所有行
            lines = sys.stdin.readlines()
        
            # 第一行：数组元素
            # 第二行：k
        
            if len(lines) >= 2:
                # 1. 处理数组输入
                # strip() 去掉换行符, split() 按空格切分
                nums_str = lines[0].strip()
                nums = list(map(int, nums_str.split()))
            
                # 2. 处理 k 输入
                k = int(lines[1].strip())
            
                # 3. 调用函数
                result = quick_select(nums, k)
            
                # 4. 打印结果
                print(result)
            
        except Exception as e:
            pass
  ```
    * 数学题（其实是信息论）：称重问题
### 感受 & 结果：涉及的大多数问题基本了解，但后面几个关于工程实践的确实没接触过，心态有些爆炸，然后手撕也寄了（只说了可以用排序做，后面提示之后再写一直被边界卡壳，面试结束复盘一眼看破，麻了...）
### 总结：LeetCode 还是要多刷，面试官给的手撕其实不难，但是确实经验不足，压力有点大导致没思路
## 06.17 博世中国 自动驾驶 ——> 雷达信号处理 base 上海 & 苏州
### 5月底就投了，期间hr多次电话，拖了小半个月安排了线上面试，应该只有一轮
### 实习内容：一直投递的是 DL + 自动驾驶，但最后分配的岗位是雷达信号处理，当时面试邮件里面也没有写清楚，面试中才得知被换岗了，比较糟糕的体验
### 面试经过
* 英文自我介绍
* 项目：基本没怎么问，针对第二个项目提了一嘴为什么选用 UNet
* 画风突变：问了一下雷达探测的相关方法，这时才知道被换岗了，完全没了解过雷达，就直接向面试官说了一下自己的通信背景，虽然通感一体化涉及到雷达，但原理还是有很多不同的，说了一下 ISAC 里面目标检测的方法。然后问了几个雷达波形，没了解过，又问了做没做过链路级的仿真，没做过，只有本科大作业的程度。最后说了一下业务需求，是一个预研的信号处理岗，无感。
### 感受 & 结果：体验一般，最后才知道被换岗，有点无语
## 06.18 焦点科技 多模态 base 南京
### 流程
### 实习内容：文本、图像、视频多模态
### 面试经过
* 自我介绍
* 项目：非常奇怪，不是很懂面试官注意的点，一直揪着第一个项目问，中间穿插问了很多通信的知识，面试官好像有通信背景，但是不怎么懂，提问的问题非常奇怪。第二个项目，面试官应该也不懂扩散模型，多模态岗位居然对扩散模型不了解，当时很无语，然后让我讲一下薛定谔桥，那我讲理论他也听不懂...
* DL 相关问题
    * 有没有接触混合精度训练
    * Transformer 中残差连接和 FFN 是怎么协同配合的
    * FFN 为什么要先升维后降维
    * 多头注意力机制？为什么要采用多个头
    * 位置编码的作用
    * 正弦位置编码和可学习位置编码的优缺点
    * 可以接受的最大文本序列是多少
    * L1 正则化和 L2 正则化
由于自己没怎么深入了解过大语言模型，因此一些相关问题没答上来...
### 感受 & 结果：体验相当糟糕，面试官专业度相当不足，并且语言组织能力很差
### 总结：Transformer 的八股还要多看，特别是位置编码部分，RNN、LSTM 这种比较古老的网络也要看

    