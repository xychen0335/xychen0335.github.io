---
title: 'LeetCode 刷题记录'
date: 2025-06-12 03:05:23
tags: [求职]
published: true
hideInList: false
feature: 
isTop: false
---
# LeetCode 刷题记录
基于《代码随想录》和 LeetCode Hot 100.
语言：Python 3
## 数组
* 前缀和：根据原始的数组 $v[i]$ 计算前缀和数组 $pre\_sum[i]=\sum_{j=0}^{i}v[j]$ ，典型应用如**区间和**类型题目；类似的后缀和为 $suffix\_sum[i]=\sum_{j=i}^{n-1}v[j]$
* 二分法：有序、无重复元素
## 双指针
常用于遍历，典型应用如反转字符串、链表
例子：
  ```
  # 接雨水--方法 1
  class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        # 维护一个前缀
        pre_max = [0] * n 
        # 维护一个后缀
        suf_max = [0] * n
        # 时间复杂度 O(n), 空间复杂度 O(n)
        pre_max[0] = height[0]
        suf_max[-1] = height[-1]
        for i in range(1, n):
            pre_max[i] = max(pre_max[i-1], height[i])
        for i in range(n-2, -1, -1):
            suf_max[i] = max(suf_max[i+1], height[i])
        ans = 0
        for h, pre, suf in zip(height, pre_max, suf_max):
            ans += min(pre, suf) - h
        return ans
  ```
  ```
  # 接雨水--方法 2 双指针
  class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        ans = 0
        left = 0
        right = n-1
        pre_max = suf_max = 0
        # 时间复杂度 O(n), 空间复杂度 O(1)
        while left < right:
            pre_max = max(pre_max, height[left])
            suf_max = max(suf_max, height[right])
            if pre_max < suf_max:
                ans += pre_max - height[left]
                left += 1
            else:
                ans += suf_max - height[right]
                right -= 1 
        return ans
  ```
## 滑动窗口
寻找子数组或子串
## 哈希表
依靠 key 访问 value，用于判断一个元素是否在集合中，Python 3 与之对应的三种数据结构：
* List
* **Set**
* **Dict**✅
## 链表
## 栈
## 队列
## 二叉树
## 图
## 排序
* 快速排序
* 堆排序
## 回溯
本质是穷举，用于解决**组合问题、切割问题、子集问题、排列问题、棋盘问题**。
## 动态规划