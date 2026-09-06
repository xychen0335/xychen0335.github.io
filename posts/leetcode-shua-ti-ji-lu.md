---
title: 'LeetCode 刷题记录'
date: 2025-06-12 03:05:23
tags: [求职]
category: 工作
published: true
hideInList: true
feature: 
isTop: false
---

# LeetCode 刷题记录

基于《代码随想录》、灵茶山艾府及 LeetCode Hot 100.

语言：Python 3

## 数组 & 矩阵 & 字符串

### 前缀和、后缀和、前缀积、后缀积

根据原始的数组 $v[i]$ 计算前缀和数组 $pre\_sum[i]=\sum_{j=0}^{i}v[j]$ ，典型应用如**区间和**类型题目；类似的后缀和为 $suffix\_sum[i]=\sum_{j=i}^{n-1}v[j]$。

#### 代码模版

```Python
# 前缀和
pre_sum = [0] * (len(nums) + 1)
for i in range(1, len(pre_sum)):
    pre_sum[i] = nums[i-1] + pre_sum[i-1]
# 后缀和
suffix_sum = [0] * (len(nums) + 1)
for i in range(len(nums) - 1, -1, -1):
    suffix_sum[i] = nums[i] + suffix_sum[i+1]
# 前缀积
pre_product = [1] * (len(nums) + 1)
for i in range(1, len(pre_product)):
    pre_product[i] = nums[i-1] * pre_product[i-1]
# 后缀积
suffix_product = [1] * (len(nums) + 1)
for i in range(len(nums) - 1, -1, -1):
    suffix_product[i] = nums[i] * suffix_product[i+1]

```

#### [303. 区域和检索 - 数组不可变](https://leetcode.cn/problems/range-sum-query-immutable/description/)

```Python
# 303. 区域和检索 - 数组不可变
class NumArray:
    def __init__(self, nums: List[int]):
        self.pre_sum = [0] * (len(nums) + 1)
        for i in range(1, len(self.pre_sum)):
            self.pre_sum[i] = nums[i-1] + self.pre_sum[i-1]
      
    def sumRange(self, left: int, right: int) -> int:
        return self.pre_sum[right + 1] - self.pre_sum[left]
```

#### [304. 二维区域和检索 - 矩阵不可变](https://leetcode.cn/problems/range-sum-query-2d-immutable/description/)

```Python
# 304. 二维区域和检索 - 矩阵不可变
class NumMatrix:
    def __init__(self, matrix: List[List[int]]):
        m = len(matrix)
        n = len(matrix[0])
        if m == 0 or n == 0:
            return
        self.presum = [[0] * (n+1) for _ in range(m+1)] 
        # 前缀和矩阵
        for i in range(1, m+1):
            for j in range(1, n+1):
                self.presum[i][j] = self.presum[i][j-1] + self.presum[i-1][j] + matrix[i-1][j-1] - self.presum[i-1][j-1]
      
    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
        return self.presum[row2+1][col2+1] - self.presum[row1][col2+1] - self.presum[row2+1][col1] + self.presum[row1][col1]
```

#### [56. 合并区间](https://leetcode.cn/problems/merge-intervals/description)

```Python
# 56. 合并区间
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        # 先按左端点排序，保证合并的区间一定是 intervals 中的连续子数组，无需更新左端点
        intervals.sort(key=lambda p : p[0])
        ans = []
        for p in intervals:
            if ans and p[0] <= ans[-1][1]: # 当前区间的左端点 <= 答案中最后一个区间的右端点时可以合并
                ans[-1][1] = max(ans[-1][1], p[1]) # 更新右端点的最大值
            else:
                ans.append(p)
        return ans
```

#### [238. 除自身以外数组的乘积](https://leetcode.cn/problems/product-of-array-except-self/description)

```Python
# 238. 除自身以外数组的乘积
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        # 维护前缀积和后缀积
        # pre[i] = nums[0] * nums[1] * ... * nums[i-1]
        pre = [1] * n 
        for i in range(1, n):
            pre[i] = pre[i - 1] * nums[i - 1]
        # suf[i] = nums[i+1] * nums[i+2] * ... * nums[n-1]
        suf = [1] * n  
        for i in range(n-2, -1, -1):
            suf[i] = suf[i + 1] * nums[i + 1]
        # ans[i] = pre[i-1] * suf[i+1]
        return [p * s for p, s in zip(pre, suf)]
```

### 矩阵遍历

#### [73. 矩阵置零](https://leetcode.cn/problems/set-matrix-zeroes/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 73. 矩阵置零
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        """
        row_has_zero = [0 in row for row in matrix]
        col_has_zero = [0 in col for col in zip(*matrix)]

        for i, row0 in enumerate(row_has_zero):
            for j, col0 in enumerate(col_has_zero):
                if row0 or col0:
                    matrix[i][j] = 0
```

#### [48. 旋转图像](https://leetcode.cn/problems/rotate-image/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 48. 旋转图像
# 将矩阵按照左上到右下的对角线进行镜像对称，之后反转每一行
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        """
        n = len(matrix)
        # 转置
        for i in range(n):
            for j in range(i, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        # 反转每一行
        for row in matrix:
            row.reverse()
```

```Python
# 逆时针旋转
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        """
        n = len(matrix)
        # 上下翻转
        matrix.reverse()
        # 转置
        for i in range(n):
            for j in range(i, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
```

#### [54. 螺旋矩阵](https://leetcode.cn/problems/spiral-matrix/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 54. 螺旋矩阵
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        m, n = len(matrix), len(matrix[0])
        ans = []
        # 定义 4 个边界
        upper_bound, lower_bound = 0, m - 1
        left_bound, right_bound = 0, n - 1
        while len(ans) < m * n:
            if upper_bound <= lower_bound:
                # 在顶部从左向右遍历
                for i in range(left_bound, right_bound + 1):
                    ans.append(matrix[upper_bound][i])
                # 顶部下移
                upper_bound += 1

            if left_bound <= right_bound:
                # 在右端从上往下遍历
                for j in range(upper_bound, lower_bound + 1):
                    ans.append(matrix[j][right_bound])
                # 右端左移 
                right_bound -= 1

            if upper_bound <= lower_bound:
                # 在底部从右向左遍历
                for i in range(right_bound, left_bound - 1, -1):
                    ans.append(matrix[lower_bound][i])
                # 底部上移
                lower_bound -= 1

            if left_bound <= right_bound:
                # 在左端从下往上遍历
                for j in range(lower_bound, upper_bound - 1, -1):
                    ans.append(matrix[j][left_bound])
                # 左端右移
                left_bound += 1

        return ans
```

#### [59. 螺旋矩阵 II](https://leetcode.cn/problems/spiral-matrix-ii/description/)

```Python
# 59. 螺旋矩阵 II
class Solution:
    def generateMatrix(self, n: int) -> List[List[int]]:
        matrix = [[0] * n for _ in range(n)]
        left, top = 0, 0
        right, bottom = n - 1, n - 1

        num = 1

        while num <= n * n:
            if top <= bottom:
                for i in range(left, right + 1):
                    matrix[top][i] = num
                    num += 1 
                top += 1
            if left <= right:
                for j in range(top, bottom + 1):
                    matrix[j][right] = num 
                    num += 1
                right -= 1
            if top <= bottom:
                for i in range(right, left - 1, -1):
                    matrix[bottom][i] = num 
                    num += 1
                bottom -= 1
            if left <= right:
                for j in range(bottom, top - 1, -1):
                    matrix[j][left] = num 
                    num += 1
                left += 1
        return matrix
```

### KMP

#### [28. 找出字符串中第一个匹配项的下标](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/)

```Python
# 28. 找出字符串中第一个匹配项的下标
class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        for i in range(len(haystack)):
            if haystack[i: i+len(needle)] == needle:
                return i
                break
        return -1
```

#### [165. 比较版本号](https://leetcode.cn/problems/compare-version-numbers/description/)

```Python
# 165. 比较版本号
# 方法一 库函数
class Solution:
    def compareVersion(self, version1: str, version2: str) -> int:
        a = map(int, version1.split('.'))
        b = map(int, version2.split('.'))
        for ver1, ver2 in zip_longest(a, b, fillvalue=0):
            if ver1 != ver2:
                return -1 if ver1 < ver2 else 1
        return 0
```

## 哈希表

依靠 key 访问 value，用于判断一个元素是否在集合中，Python 3 与之对应的三种数据结构：

* List
* **Set**
* **Dict**✅

#### [1. 两数之和](https://leetcode.cn/problems/two-sum/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 1. 两数之和
# 哈希--梦开始的地方
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        idx = {} # key 为元素，value 为下标
        for i, x in enumerate(nums):
            # 维护左（idx），枚举右
            if target - x in idx:
                return [idx[target - x], i]
            idx[x] = i
```

#### [242. 有效的字母异位词](https://leetcode.cn/problems/valid-anagram/description/)

```Python
# 242. 有效的字母异位词
# 方法 1 Counter
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        from collections import Counter
        count_s = Counter(s)
        count_t = Counter(t)
        return count_s == count_t
```

```Python
# 242. 有效的字母异位词
# 方法 2 defaultdict
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        from collections import defaultdict

        s_dict = defaultdict(int)
        t_dict = defaultdict(int)

        for item in s:
            s_dict[item] += 1

        for item in t:
            t_dict[item] += 1

        return s_dict == t_dict
```

#### [202. 快乐数](https://leetcode.cn/problems/happy-number/description/)

```Python
# 202. 快乐数
class Solution:
   def isHappy(self, n: int) -> bool:
       record = set()
       while n not in record: # 如果出现在了 record 中即出现重复，此时陷入循环，肯定不是欢乐数
           record.add(n)
           new_num = 0
           n_str = str(n)
           for i in n_str:
               new_num += int(i)**2
           if new_num == 1:
               return True
           else: 
               n = new_num
       return False
```

#### [454. 四数相加 II](https://leetcode.cn/problems/4sum-ii/description/)

```Python
# 454. 四数相加 II
class Solution:
    def fourSumCount(self, nums1: List[int], nums2: List[int], nums3: List[int], nums4: List[int]) -> int:
        from collections import defaultdict, Counter

        # rec, cnt = defaultdict(lambda: 0), 0

        # for i in nums1:
        #     for j in nums2:
        #         rec[i+j] += 1
      
        # for i in nums3:
        #     for j in nums4:
        #         cnt += rec[-i-j]
        #         # cnt += rec.get(-i-j, 0)
        # return cnt
        rec, cnt = Counter(), 0

        for i in nums1:
            for j in nums2:
                rec[i+j] += 1
      
        for i in nums3:
            for j in nums4:
                cnt += rec[-i-j]
        return cnt
```

#### [383. 赎金信](https://leetcode.cn/problems/ransom-note/description/)

```Python
# 383. 赎金信
class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        from collections import Counter

        cnt_r = Counter(ransomNote)
        cnt_m = Counter(magazine)

        for key in cnt_r:
            if cnt_m[key] < cnt_r[key]:
                return False
        return True
```

#### [49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 49. 字母异位词分组
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        d = defaultdict(list)
        # 异位词排序后相同，因此将排序后的字符串作为哈希表的 key
        for s in strs:
            sorted_s = ''.join(sorted(s))
            d[sorted_s].append(s)
        return list(d.values())
```

#### [128. 最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 128. 最长连续序列
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        ans = 0
        num_set = set(nums) # 把 nums 转为哈希集合

        for num in num_set:
            # 确保子序列的起点
            if num - 1 not in num_set:
                current_num = num
                current_list = 1

                while current_num + 1 in num_set:
                    # 不断寻找下一个数是否在集合中
                    current_num += 1
                    current_list += 1

                ans = max(ans, current_list)
      
        return ans
```

#### [560. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 560. 和为 K 的子数组
# 前缀和+哈希表
# 两次遍历
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        pre_sum = [0] * (len(nums) + 1)
        for i, x in enumerate(nums):
            pre_sum[i+1] = pre_sum[i] + x
        ans = 0
        cnt = defasult(int)
        for s in pre_sum:
            # 查找之前有多少个前缀和等于 pre_sum - k，如果存在，说明从那些位置到当前位置的子数组和为 k
            ans += cnt[pre_sum - k]
            cnt[pre_sum] += 1
        return ans
# 一次遍历
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        cnt = defaultdict(int)
        cnt[0] = 1  # pre_sum[0]=0 单独统计
        ans = pre_sum = 0
        for x in nums:
            pre_sum += x # 前缀和
            # 查找之前有多少个前缀和等于 pre_sum - k，如果存在，说明从那些位置到当前位置的子数组和为 k
            ans += cnt[pre_sum - k]
            cnt[pre_sum] += 1
        return ans
```

#### [523. 连续的子数组和](https://leetcode.cn/problems/continuous-subarray-sum/description/)

```Python
# 523. 连续的子数组和
class Solution:
    def checkSubarraySum(self, nums: List[int], k: int) -> bool:
        pre_sum = 0
        mod_index = defaultdict(int)
        mod_index[0] = -1

        for i, num in enumerate(nums):
            pre_sum += num
            mod = pre_sum % k

            if mod in mod_index:
                if i - mod_index[mod] > 1:
                    return True
            else:
                mod_index[mod] = i 
        return False
```

#### [287. 寻找重复数](https://leetcode.cn/problems/find-the-duplicate-number/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 287. 寻找重复数
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        # 原地哈希
        for x in nums:
            # 值对应下标
            idx = abs(x) - 1
            # 如果 nums[idx] 为负，说明出现重复
            if nums[idx] < 0:
                ans = abs(x)
            else:
                nums[idx] = -nums[idx]
        return ans 
```

## 双指针

常用于遍历，典型应用如反转字符串、链表。

对于列表，除非用来模拟栈，否则一般不使用 pop，多数情况下使用覆盖。

例子：

#### [26. 删除有序数组中的重复项](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/description/)

```Python
# 26. 删除有序数组中的重复项
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        if not nums:
            return 0

        n = len(nums)
        fast = slow = 1
        while fast < n:
            if nums[fast] != nums[fast-1]:
                # 保持 [0:slow] 中没有重复元素
                nums[slow] = nums[fast]
                slow += 1
            fast += 1
        return slow
```

#### [27. 移除元素](https://leetcode.cn/problems/remove-element/description/)

```Python
# 27. 移除元素
class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        fast = 0
        slow = 0
        while fast < len(nums):
            if nums[fast] != val:
                # 保持 [0:slow] 中没有 val
                nums[slow] = nums[fast]
                slow += 1
            fast += 1
        return slow
```

#### [283. 移动零](https://leetcode.cn/problems/move-zeroes/description)

```Python
# 283. 移动零
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        fast, slow = 0, 0
        # 相当于 27. 移除 0 之后再把后半段赋值为 0
        while fast < len(nums):
            if nums[fast] != 0:
                nums[slow] = nums[fast]
                slow += 1
            fast += 1
        for i in range(slow, len(nums)):
            nums[i] = 0
```

#### [88. 合并两个有序数组](https://leetcode.cn/problems/merge-sorted-array/description)

```Python
# 88. 合并两个有序数组
class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        """
        Do not return anything, modify nums1 in-place instead.
        """
        # 倒序双指针，防止覆盖，与合并有序链表思路相仿
        p1, p2, p = m - 1, n - 1, m + n - 1
        while p2 >= 0:
            if p1 >= 0 and nums1[p1] > nums2[p2]:
                nums1[p] = nums1[p1]
                p1 -= 1
            else:
                nums1[p] = nums2[p2]
                p2 -= 1
            p -= 1 # p 一直后退
```

#### [344. 反转字符串](https://leetcode.cn/problems/reverse-string/description/)

```Python
# 344. 反转字符串
class Solution:
    def reverseString(self, s: List[str]) -> None:
        """
        Do not return anything, modify s in-place instead.
        """
        left, right = 0, len(s) - 1
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1
        return s
```

#### [541. 反转字符串 II](https://leetcode.cn/problems/reverse-string-ii/description/)

```Python
# 541. 反转字符串 II
# 每计数到 2k 个，反转前 k 个
class Solution:
    def reverseStr(self, s: str, k: int) -> str:
        s = list(s)
        n = len(s)
        # 以 2k 为单位进行处理
        for i in range(0, n, 2*k):
            left = i
            right = min(i+k-1, n-1)
            while left < right:
                s[left], s[right] = s[right], s[left]
                left += 1
                right -= 1
        return ''.join(s)
```

#### [151. 反转字符串中的单词](https://leetcode.cn/problems/reverse-words-in-a-string/description/)

```Python
# 151. 反转字符串中的单词
class Solution:
    def reverseWords(self, s: str) -> str:
        list_s = s.split()
        fast_index = 0
        slow_index = len(list_s) - 1
        while fast_index < len(list_s) / 2:
            temp = list_s[fast_index]
            list_s[fast_index] = list_s[slow_index]
            list_s[slow_index] = temp
            fast_index += 1
            slow_index -= 1
        s_rev = ""
        for i in range(len(list_s)):
            if i != len(list_s) - 1:
                s_rev += list_s[i] + " "
            else:
                s_rev += list_s[i] 
        return s_rev

    # 方法二 反转字符串后再反转每个单词
    def reverseWords(self, s: str) -> str:
        list_s = s.split()
        list_s.reverse()
        s_rev = ""
        for i in range(len(list_s)):
            if i != len(list_s) - 1:
                s_rev += list_s[i] + " "
            else:
                s_rev += list_s[i]
        return s_rev
```

#### [125. 验证回文串](https://leetcode.cn/problems/valid-palindrome/description/)

```Python
# 125. 验证回文串
class Solution:
    def isPalindrome(self, s: str) -> bool:
        # 字符串的几个函数，ch.isalnum() 用于判断字符是否是字母或数字
        s_new = ''.join(ch for ch in s.lower() if ch.isalnum())
        i, j = 0, len(s_new) - 1
        while i < j:
            if s_new[i] == s_new[j]:
                i += 1
                j -= 1
            else:
                return False
        return True
```

#### [415. 字符串相加](https://leetcode.cn/problems/add-strings/description/)

```Python
# 415. 字符串相加
class Solution:
    def addStrings(self, num1: str, num2: str) -> str:
        i, j = len(num1) - 1, len(num2) - 1
        carry = 0
        ans = []

        while i >= 0 or j >= 0 or carry:
            if i >= 0:
                carry += int(num1[i])
                i -= 1
            if j >= 0:
                carry += int(num2[j])
                j -= 1

            ans.append(str(carry % 10))
            carry //= 10

        return ''.join(ans[::-1])
```

#### [165. 比较版本号](https://leetcode.cn/problems/compare-version-numbers/description/)

```Python
# 165. 比较版本号
# 方法二 双指针
class Solution:
    def compareVersion(self, version1: str, version2: str) -> int:
        i, j = 0, 0
        n, m = len(version1), len(version2)

        while i < n or j < m:
            x = 0
            while i < n and version1[i] != '.':
                x = x * 10 + int(version1[i])
                i += 1

            y = 0
            while j < m and version2[j] != '.':
                y = y * 10 + int(version2[j])
                j += 1

            # 比较当前段
            if x < y:
                return -1
            if x > y:
                return 1

            # 跳过 '.'
            i += 1
            j += 1

        return 0
```

#### [80. 删除有序数组中的重复项 II](https://leetcode.cn/problems/remove-duplicates-from-sorted-array-ii/description/)

```Python
# 80. 删除有序数组中的重复项 II
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        if not nums:
            return 0
        slow, fast = 0, 0
        cnt = 0
        while fast < len(nums):
            if nums[slow] != nums[fast]:
                slow += 1
                nums[slow] = nums[fast]
            elif slow < fast and cnt < 2:
                slow += 1
                nums[slow] = nums[fast]
            fast += 1
            cnt += 1
            if fast < len(nums) and nums[fast] != nums[fast - 1]:
                cnt = 0
        return slow + 1
```

#### [11. 盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 11. 盛最多水的容器
Class Solution:
    def maxArea(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        ans = 0
        while left < right:
            area = min(height[left], height[right]) * (right - l)
            ans = max(ans, area)
            if height[left] <= height[right]:
                left += 1
            else:
                right -= 1
        return ans
```

#### [167. 两数之和 II - 输入有序数组](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted/description/)

```Python
# 167. 两数之和 II - 输入有序数组
class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        left, right = 0, len(numbers) - 1
        while left < right:
            if numbers[left] + numbers[right] < target:
                left += 1
            elif numbers[left] + numbers[right] > target:
                right -= 1
            elif numbers[left] + numbers[right] == target:
                return [left+1, right+1]
```

#### [15. 三数之和](https://leetcode.cn/problems/3sum/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 15. 三数之和
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort() # 排序
        ans = []
        n = len(nums)
        for i in range(n - 2):
            x = nums[i]
            if i > 0 and x == nums[i - 1]:  # 跳过重复数字
                continue
            if x + nums[i + 1] + nums[i + 2] > 0:  # 优化一
                break
            if x + nums[-2] + nums[-1] < 0:  # 优化二
                continue
            j = i + 1
            k = n - 1
            while j < k:
                s = x + nums[j] + nums[k]
                if s > 0:
                    k -= 1
                elif s < 0:
                    j += 1
                else:  # 三数之和为 0
                    ans.append([x, nums[j], nums[k]])
                    j += 1 # 更新下标防止重复
                    while j < k and nums[j] == nums[j - 1]:  # 跳过重复数字
                        j += 1
                    k -= 1 # 更新下标防止重复
                    while k > j and nums[k] == nums[k + 1]:  # 跳过重复数字
                        k -= 1
        return ans
```

#### [42. 接雨水 [Hard]](https://leetcode.cn/problems/trapping-rain-water/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 42. 接雨水
# 方法一 前缀后缀数组 
class Solution:
    def trap(self, height: List[int]) -> int:
            n = len(height)
            ans = 0
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
            for h, pre, suf in zip(height, pre_max, suf_max):
                ans += min(pre, suf) - h
            return ans
```

```Python
# 42. 接雨水
# 方法二 双指针
class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        '''
        接水由较低的一边决定，water[i] = min(left_max, right_max) - height[i]
        left_max 和 right_max 代表相对于当前位置左右两边的最大档板
        维护最大前缀和最大后缀，比较最大前缀和最大后缀，那个小先计算哪边
        理论上，对于当前位置 i，根据公式，应当知道其左右两边的最大档板，但如果 i 位置的最大前缀小于当前维护的最大后缀，那也一定小于 i 位置实际上的最大后缀，反之同理，因此可以分开计算
        '''
        ans = pre_max = suf_max = 0
        # 相向左右指针
        left, right = 0, n-1
        # 时间复杂度 O(n), 空间复杂度 O(1)
        while left <= right:
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

#### [5. 最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 5. 最长回文子串
# 方法一 中心扩展法
class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        ans_left = ans_right = 0

        # 奇回文串
        for i in range(n):
            l = r = i
            while l >= 0 and r < n and s[l] == s[r]:
                l -= 1
                r += 1
            # 循环结束后，s[l+1] 到 s[r-1] 是回文串
            if r - l - 1 > ans_right - ans_left:
                ans_left, ans_right = l + 1, r  # 左闭右开区间

        # 偶回文串
        for i in range(n - 1):
            # 为了保证是偶回文串，初始时，r 在 l 右边一位
            l, r = i, i + 1
            while l >= 0 and r < n and s[l] == s[r]:
                l -= 1
                r += 1
            if r - l - 1 > ans_right - ans_left:
                ans_left, ans_right = l + 1, r  # 左闭右开区间

        return s[ans_left: ans_right]
```

## 滑动窗口

用于寻找最长、最短子数组或子串。

#### 代码模版

```Python
def slidingWindow(s: str):
    # 用合适的数据结构记录窗口中的数据，根据具体场景变通
    # 比如说，我想记录窗口中元素出现的次数，就用 map
    # 如果我想记录窗口中的元素和，就可以只用一个 int
    window = ...

    left, right = 0, 0
    while right < len(s):
        # c 是将移入窗口的字符
        c = s[right]
        window.add(c)
        # 增大窗口
        right += 1
        # 进行窗口内数据的一系列更新
        ...

        # *** debug 输出的位置 ***
        # 注意在最终的解法代码中不要 print
        # 因为 IO 操作很耗时，可能导致超时
        # print(f"window: [{left}, {right})")
        # ***********************

        # 判断左侧窗口是否要收缩
        while left < right and window needs shrink:
            # d 是将移出窗口的字符
            d = s[left]
            window.remove(d)
            # 缩小窗口
            left += 1
            # 进行窗口内数据的一系列更新
            ...
```

例子：

#### [209. 长度最小的子数组](https://leetcode.cn/problems/minimum-size-subarray-sum/description/)

```Python
# 209. 长度最小的子数组
class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        left = 0
        n = len(nums)
        cnt = 0
        ans = n+1
        for right, val in enumerate(nums):
                cnt += val
                while cnt >= target:
                    ans = min(ans, right-left+1)
                    cnt -= nums[left]
                    left += 1
        return ans if ans <= n else 0
```

#### [3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 3. 无重复字符的最长子串
# 写法一 计数
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        ans = 0
        left = 0
        cnt = Counter() # HashMap
        # 时间复杂度 O(n), 空间复杂度 O(1)
        for right, c in enumerate(s):
            cnt[c] += 1
            # 判断是否有重复
            while cnt[c] > 1:
                # 出现了重复，窗口左端需要收缩
                cnt[s[left]] -= 1
                left += 1
            ans = max(ans, right-left+1)
        return ans
# 写法二 哈希集合 保证无重复
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        ans = 0
        left = 0
        window = set()
        for right, c in enumerate(s):
            # 判断是否有重复
            while c in window:
                # 出现了重复，窗口左端需要收缩
                window.remove(s[left])
                left += 1
            window.add(c)
            ans = max(ans, right-left+1) # len(window) = right-left+1
        return ans
```

#### [438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 438. 找到字符串中所有字母异位词
# 方法一
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        cnt_p = Counter(p)
        left = 0
        ans = []
        for left in range(len(s) - len(p) + 1):
            seq = s[left:left + len(p)]
            if Counter(seq) == cnt_p: # 判断是否为异位词
                ans.append(left)
        return ans
```

```Python
# 438. 找到字符串中所有字母异位词
# 方法二 不定长滑窗
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        cnt = Counter(p)  # 统计 p 的每种字母的出现次数
        ans = []

        left = 0
        for right, c in enumerate(s):
            cnt[c] -= 1  # 右端点字母进入窗口
            while cnt[c] < 0:  # 字母 c 太多了
                cnt[s[left]] += 1  # 左端点字母离开窗口
                left += 1
            if right - left + 1 == len(p):  # t 和 p 的每种字母的出现次数都相同（证明见上）
                ans.append(left)  # t 左端点下标加入答案

        return ans
```

#### [76. 最小覆盖子串 [Hard]](https://leetcode.cn/problems/minimum-window-substring/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 76. 最小覆盖子串
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        cnt_s = Counter()
        cnt_t = Counter(t)
        # 时间复杂度 O(|\Sigma|m+n), 空间复杂度 O(|\Sigma|)
        ans_left, ans_right = -1, len(s)
        left = 0
        for right, c in enumerate(s):
            cnt_s[c] += 1
            while cnt_s >= cnt_t: # 覆盖--cnt_s 是 cnt_t 的超多重集
                if right - left < ans_right - ans_left: # 找到更短的子串
                    ans_left, ans_right = left, right
                cnt_s[s[left]] -= 1 # 左端点字母移出子串
                left += 1
        return "" if ans_left < 0 else s[ans_left: ans_right + 1]
```

## 二分查找

适用于有序或局部单调、无重复元素。

例子：

#### [35. 搜索插入位置 & 34. 在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/search-insert-position/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 35. 搜索插入位置
# 用于寻找元素出现的第一个位置 / 会被按顺序插入的位置
def searchInsert(nums: List[int], target: int) -> List[int]:
    left = 0
    right = len(nums) - 1 # [left, right] 左闭右闭区间
    # 闭区间写法
    # 时间复杂度 O(log n), 空间复杂度 O(1)
    while left <= right: # 边界条件：由于是闭区间，因此left == right 时还有一个元素
        mid = (left + right) // 2
        if nums[mid] < target:
            left = mid + 1 # 右半边：[mid+1, right]
        else:
            right = mid - 1 # 左半边：[left, mid-1]
    return left
```

```Python
# 开区间写法
def searchInsert(nums: List[int], target: int) -> List[int]:
    left = -1
    right = len(nums) # (left, right) 左开右开区间
    while left + 1 < right: 
        mid = (left + right) // 2
        if nums[mid] < target:
            left = mid # 右半边：(mid, right)
        else:
            right = mid # 左半边：(left, mid)
    return right
```

```Python
# 34. 在排序数组中查找元素的第一个和最后一个位置
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        start = searchInsert(nums, target)
        if start == len(nums) or nums[start] != target:
            return [-1, -1]
        end = searchInsert(nums, target+1) - 1 
        return [start, end]
```

#### [69. x 的平方根](https://leetcode.cn/problems/sqrtx/description/?envType=study-plan-v2&envId=top-interview-150)

```Python
# 69. x 的平方根
class Solution:
    def mySqrt(self, x: int) -> int:
        if x == 0:
            return 0
        left, right = 0, x + 1
        while left + 1 < right:
            mid = (left + right) // 2
            if mid * mid <= x:
                left = mid
            else:
                right = mid
        return left
```

#### [74. 搜索二维矩阵](https://leetcode.cn/problems/search-a-2d-matrix/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 74. 搜索二维矩阵
# 方法一 矩阵转为列表
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        nums = []
        m = len(matrix)
        n = len(matrix[0])
        for i in range(m):
            for j in range(n):
                nums.append(matrix[i][j])
        
        left, right = -1, m * n
        while left + 1 < right:
            mid = (left + right) // 2
            if nums[mid] < target:
                left = mid
            else:
                right = mid
        return right < m * n and nums[right] == target
```

```Python
# 74. 搜索二维矩阵
# 方法二 直接对矩阵进行二分查找
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        left, right = -1, m * n 
        while left + 1 < right:
            mid = (left + right) // 2
            # // n 和 % n 相当于一维到二维的映射，前者表示行号，后者表示列号
            val = matrix[mid // n][mid % n]
            if val == target:
                return True
            elif val < target:
                left = mid
            else:
                right = mid
        return False
```

#### [240. 搜索二维矩阵 II](https://leetcode.cn/problems/search-a-2d-matrix-ii/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 240. 搜索二维矩阵 II
# 方法一 逐行二分查找
class Solution:
    def lower_bound(self, nums, target):
        left, right = -1, len(nums)
        while left + 1 < right:
            mid = (left + right) // 2
            if nums[mid] < target:
                left = mid
            else:
                right = mid
        return right < len(nums) and nums[right] == target
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        for row in range(m):
            if self.lower_bound(matrix[row], target):
                return True
        return False
```

```Python
# 240. 搜索二维矩阵 II
# 方法二 排除法
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        i, j = 0, n - 1  # 从右上角开始
        while i < m and j >= 0:  # 还有剩余元素
            if matrix[i][j] == target:
                return True  # 找到 target
            if matrix[i][j] < target:
                i += 1  # 这一行剩余元素全部小于 target，排除
            else:
                j -= 1  # 这一列剩余元素全部大于 target，排除
        return False
```

#### [852. 山脉数组的峰顶索引](https://leetcode.cn/problems/peak-index-in-a-mountain-array/description/)

```Python
# 852. 山脉数组的峰顶索引
class Solution:
    def peakIndexInMountainArray(self, arr: List[int]) -> int:
        left, right = -1, len(arr)
        # 可以优化边界，left, right = 0, len(arr) - 2
        while left + 1 < right:
            mid = (left + right) // 2
            if arr[mid] < arr[mid + 1]:
                left = mid
            else:
                right = mid
        return right
```

#### [153. 寻找旋转排序数组中的最小值](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 153. 寻找旋转排序数组中的最小值
class Solution:
    def findMin(self, nums: List[int]) -> int:
        left = -1
        right = len(nums) - 1 # 边界如果是 len(nums) ，当旋转至列表反转时会溢出
        while left + 1 < right:
            mid = (left + right) // 2
            # “旋转”将数组分成了两段，两段均升序且左段元素大于右段元素，因此可以用 nums[-1] 来判断 mid 是在左段还是右段
            if nums[mid] < nums[-1]: # nums[mid] 在右段，nums[mid] 要么是最小值，要么在最小值的右边
                right = mid
            else: # 此时 nums 被分成两段，左段元素更大，nums[mid] 在左段，最小值在右段
                left = mid
        return nums[right]
```

#### [33. 搜索旋转排序数组](https://leetcode.cn/problems/search-in-rotated-sorted-array/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 33. 搜索旋转排序数组
# 方法一 一次二分
class Solution:
    def search(self, nums: List[int], target: int):
        left, right = -1, len(nums) - 1
        while left + 1 < right:
            mid = (left + right) // 2
            x = nums[mid]
            # 目标和 x 不在同一段
            if target > nums[-1] >= x: # 目标在第一段，x 在第二段
                right = mid
            elif x > nums[-1] >= target: # 目标在第二段，x 在第一段
                left = mid
            # 目标和 x 在同一段
            elif x >= target:
                right = mid
            else:
                left = mid
        return right if nums[right] == target else -1
```

```Python
# 33. 搜索旋转排序数组
# 方法二 两次二分--34. + 153.
class Solution:
    def findMin(self, nums: List[int]) -> int:
        left, right = -1, len(nums) - 1
        while left + 1 < right:
            mid = (left + right) // 2
            if nums[mid] < nums[-1]:
                right = mid
            else:
                left = mid
        return right

    def searchInsert(self, nums: List[int], left:int, right:int, target:int) -> int:
        while left + 1 < right:
            mid = (left + right) // 2
            if nums[mid] < target:
                left = mid
            else:
                right = mid
        return right if nums[right] == target else -1

    def search(self, nums: List[int], target: int) -> int:
        i = self.findMin(nums)
        if target > nums[-1]:
            return self.searchInsert(nums, -1, i, target)
        return self.searchInsert(nums, i-1, len(nums), target)
```

## 链表

前后指针、快慢指针。

例子：

### 链表基本操作 / 合并 / 反转链表

#### [160. 相交链表](https://leetcode.cn/problems/intersection-of-two-linked-lists/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        p, q = headA, headB
        while p is not q:
            # 如果 p 走到链表 A 末尾，就跳到链表 B 头继续走
            p = p.next if p else headB
            # 如果 q 走到链表 B 末尾，就跳到链表 A 头继续走
            q = q.next if q else headA
        return p
```

#### [24. 两两交换链表中的节点](https://leetcode.cn/problems/swap-nodes-in-pairs/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 24. 两两交换链表中的节点
class Solution:
    def swapPairs(self, head: Optional[ListNode]) -> Optional[ListNode]:
        dummy_head = ListNode(next=head)
        cur = dummy_head
        while cur.next and cur.next.next:
            tmp1 = cur.next
            tmp2 = cur.next.next.next

            cur.next = cur.next.next
            cur.next.next = tmp1
            tmp1.next = tmp2

            cur = cur.next.next

        return dummy_head.next
```

#### [21. 合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 21. 合并两个有序链表
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(-1)

        pre = dummy # 相当于建立一个结果链表
        while list1 and list2:
            if list1.val <= list2.val:
                pre.next = list1
                list1 = list1.next
            else:
                pre.next = list2
                list2 = list2.next
            pre = pre.next # 结果链表一直前进
  
        pre.next = list1 if list1 is not None else list2

        return dummy.next
```

#### [86. 分隔链表](https://leetcode.cn/problems/partition-list/description/)

```Python
# 86. 分隔链表
class Solution:
    def partition(self, head: Optional[ListNode], x: int) -> Optional[ListNode]:
        dummy1, dummy2 = ListNode(-1), ListNode(-1)

        p1, p2 = dummy1, dummy2

        p = head

        while p:
            if p.val < x:
                p1.next = p
                p1 = p1.next
            else:
                p2.next = p
                p2 = p2.next
            
            tmp = p.next # 如果不断开原来的连接，可能会出现环，最后一个节点可能指向前方某节点
            p.next = None
            p = tmp
        
        p1.next = dummy2.next
        return dummy1.next
```

#### [83. 删除排序链表中的重复元素](https://leetcode.cn/problems/remove-duplicates-from-sorted-list/description/)

```Python
class Solution:
    def deleteDuplicates(self, head: Optional[ListNode]) -> Optional[ListNode]:
        cur = head
        while cur and cur.next:
            val = cur.val
            if cur.next.val == val:
                cur.next = cur.next.next
            else:
                cur = cur.next
        return head
```

#### [82. 删除排序链表中的重复元素 II](https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/description/)

```Python
# 82. 删除排序链表中的重复元素 II
class Solution:
    def deleteDuplicates(self, head: Optional[ListNode]) -> Optional[ListNode]:
        cur = dummy = ListNode(next=head)
        while cur.next and cur.next.next:
            val = cur.next.val
            if cur.next.next.val == val: # 后两个节点值相同
                # 值等于 val 的节点全部删除
                while cur.next and cur.next.val == val:
                    cur.next = cur.next.next
            else:
                cur = cur.next
        return dummy.next
```

#### [2. 两数相加](https://leetcode.cn/problems/add-two-numbers/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 2. 两数相加
# 方法一 迭代
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        cur = dummy = ListNode()
        carry = 0
        while l1 or l2 or carry:
            if l1:
                carry += l1.val
                l1 = l1.next
            if l2:
                carry += l2.val
                l2 = l2.next
            cur.next = ListNode(carry % 10)
            carry //= 10
            cur = cur.next
        return dummy.next
```

#### [206. 反转链表](https://leetcode.cn/problems/reverse-linked-list/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 206. 反转链表
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        cur, pre = head, None
        while cur:
            # 记录 nxt，相当于锚点
            nxt = cur.next
            # 交换 cur 和 pre
            cur.next = pre
            pre = cur
            cur = nxt
        return pre
```

#### [92. 反转链表 II](https://leetcode.cn/problems/reverse-linked-list-ii/description/)

```Python
# 92. 反转链表 II
class Solution:
    def reverseBetween(self, head: Optional[ListNode], left: int, right: int) -> Optional[ListNode]:
        p0 = dummy = ListNode(next=head)
        for _ in range(left - 1):
            p0 = p0.next

        pre = None
        cur = p0.next
        for _ in range(right - left + 1):
            nxt = cur.next
            cur.next = pre
            pre = cur
            cur = nxt

        p0.next.next = cur
        p0.next = pre
        return dummy.next
```

#### [234. 回文链表](https://leetcode.cn/problems/palindrome-linked-list?envType=study-plan-v2&envId=top-100-liked)

```Python
# 234. 回文链表
class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        vals = []
        cur = head
        while cur is not None:
            vals.append(cur.val)
            cur = cur.next
        return vals == vals[::-1]
```

#### [25. K 个一组翻转链表 [Hard]](https://leetcode.cn/problems/reverse-nodes-in-k-group/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 25. K 个一组翻转链表
class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        n = 0
        cur = head
        # 先求链表长度
        while cur:
            n += 1
            cur = cur.next

        p0 = dummy = ListNode(next=head) # 哨兵节点
        pre = None
        cur = p0.next # cur 初始为头节点 

        while n >= k: # 判断是否还剩下 k 个节点
            n = n - k 
            for _ in range(k): # 反转链表
                nxt = cur.next
                cur.next = pre
                pre = cur
                cur = nxt

            '''
            p0.next 是当前组反转前的头，反转后的尾
            p0 为当前组反转后的尾
            '''
            nxt = p0.next # 与下一组进行衔接
            p0.next.next = cur # 当前组的尾接到下一组的开头 
            p0.next = pre # 前一段链表的尾接到当前组的新头
            p0 = nxt # 哨兵节点成为该组反转后的最后一个节点
        return dummy.next
```

#### [23. 合并 K 个升序链表 [Hard]](https://leetcode.cn/problems/merge-k-sorted-lists/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 23. 合并 K 个升序链表
ListNode.__lt__ = lambda a, b: a.val < b.val

class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        cur = dummy = ListNode()
        h = [head for head in lists if head]
        heapify(h)
        while h:
            node = heappop(h)
            if node.next:
                heappush(h, node.next)
            cur.next = node
            cur = cur.next
        return dummy.next
```

#### [146. LRU 缓存](https://leetcode.cn/problems/lru-cache/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 146. LRU 缓存
class Node:
    __slots__ = 'prev', 'next', 'key', 'value'

    def __init__(self, key=0, value=0):
        self.key = key 
        self.value = value

class LRUCache:

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.dummy = Node()
        self.dummy.prev = self.dummy 
        self.dummy.next = self.dummy 
        self.key_to_node = {}

    def get_node(self, key):
        if key not in self.key_to_node:
            return None 
        node = self.key_to_node[key]
        self.remove(node)
        self.push_front(node)
        return node
        
    def get(self, key: int) -> int:
        node = self.get_node(key)
        return node.value if node else -1 

    def put(self, key: int, value: int) -> None:
        node = self.get_node(key) 
        if node:
            node.value = value 
            return 
        self.key_to_node[key] = node = Node(key, value) 
        self.push_front(node)
        if len(self.key_to_node) > self.capacity:
            back_node = self.dummy.prev 
            del self.key_to_node[back_node.key]
            self.remove(back_node)
    
    def remove(self, x):
        x.prev.next = x.next 
        x.next.prev = x.prev 

    def push_front(self, x):
        x.prev = self.dummy 
        x.next = self.dummy.next 
        x.prev.next = x
        x.next.prev = x
```

### 快慢指针

#### [141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 141. 环形链表
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        fast = head
        slow = head
        while fast and fast.next:
            # 快指针比慢指针多移动一次
            fast = fast.next.next
            slow = slow.next
            if fast is slow:
                return True
        return False
```

#### [142. 环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 142. 环形链表 II
class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        fast = head
        slow = head

        while fast and fast.next:
            fast = fast.next.next
            slow = slow.next
            # 快慢指针相遇，移动头节点，头节点与慢指针在环的入口相遇
            if fast is slow:
                while slow is not head:
                    slow = slow.next
                    head = head.next
                return slow
        return None
```

#### [876. 链表的中间节点 &amp; 143. 重排链表](https://leetcode.cn/problems/reorder-list/description/)

```Python
class Solution:
    # 876. 链表的中间结点
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        return slow

    # 206. 反转链表
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        pre, cur = None, head
        while cur:
            nxt = cur.next
            cur.next = pre
            pre = cur
            cur = nxt
        return pre
      
    # 143. 重排链表
    def reorderList(self, head: Optional[ListNode]) -> None:
        mid = self.middleNode(head)
        head2 = self.reverseList(mid)
        while head2.next:
            nxt = head.next
            nxt2 = head2.next
            head.next = head2
            head2.next = nxt
            head = nxt
            head2 = nxt2
```

#### [148. 排序链表](https://leetcode.cn/problems/sort-list/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 148. 排序链表
# 链表的中间节点 + 合并两个有序链表 + 归并排序
class Solution:
    def middleNode(slef, head):
        slow = fast = head
        while fast and fast.next:
            pre = slow # 记录 slow 前一个节点
            slow = slow.next
            fast = fast.next.next
        pre.next = None # 断开 slow 前一个节点与 slow 的连接，分成两段链表
        return slow

    def mergeTwoLists(self, list1, list2):
        dummy = ListNode(-1)
        cur = dummy
        while list1 and list2:
            if list1.val < list2.val:
                cur.next = list1
                list1 = list1.next
            else:
                cur.next = list2
                list2 = list2.next
            cur = cur.next
        cur.next = list1 if list1 else list2
        return dummy.next

    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if head is None or head.next is None:
            return head
        head2 = self.middleNode(head)
        head = self.sortList(head)
        head2 = self.sortList(head2)
        return self.mergeTwoLists(head, head2)
```

#### [19. 删除链表的倒数第 N 个节点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 19. 删除链表的倒数第 N 个节点
# 双指针--前后指针
class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy_head = ListNode(next=head)
        fast = slow = dummy_head
        # 快指针先走 n 步
        for i in range(n+1):
            fast = fast.next

        while fast != None:
            slow = slow.next
            fast = fast.next

        slow.next = slow.next.next
        return dummy_head.next
```

#### [61. 旋转链表](https://leetcode.cn/problems/rotate-list/description/)

```Python
# 61. 旋转链表
class Solution:
    def rotateRight(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        if not head:
            return head
        n = 0
        cur = head
        while cur:
            n += 1
            cur = cur.next
        k %= n # 旋转次数大于链表长度 -- 取模
        fast, slow = head, head
        for i in range(k):
            fast = fast.next
        while fast.next:
            fast = fast.next
            slow = slow.next
        fast.next = head # 形成环
        fast = slow.next # 倒数第 k 个节点成为新的头节点
        slow.next = None # 断开环
        return fast
```

## 栈

* 后进先出、只允许在栈顶进行插入（入栈，Push）和删除（出栈，Pop）；
* 符号匹配问题、表达式求值与转换、模拟递归；
* 单调栈：栈中的元素从栈顶到栈底始终保持单调递增或递减。

例子：

#### [20. 有效的括号](https://leetcode.cn/problems/valid-parentheses/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
class Solution:
    def isValid(self, s: str) -> bool:
        if len(s) % 2 == 1:
            return False
      
        pairs ={
            "(":")",
            "[":"]",
            "{":"}"
        }
        stack = []

        for ch in s:
            if ch in pairs: # 字典检查的是 key
                stack.append(ch)
            elif not stack or pairs[stack.pop()] != ch:
                    return False

        return not stack
```

#### [394. 字符串解码](https://leetcode.cn/problems/decode-string/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
class Solution:
    def decodeString(self, s: str) -> str:
        stack = []
        cur = ""
        k = 0
        for c in s:
            if c.isdigit():
                k = k * 10 + int(c)
            # 左括号入栈，重置状态
            elif c == '[':
                stack.append((cur, k))
                cur = ""
                k = 0
            # 右括号出栈，更新结果
            elif c == ']':
                prev, times = stack.pop()
                cur = prev + cur * times
            else:
                cur += c 
        return cur
```

#### [150. 逆波兰表达式求值](https://leetcode.cn/problems/evaluate-reverse-polish-notation/description/?envType=study-plan-v2&envId=top-interview-150)

```Python
# 150. 逆波兰表达式求值
class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        stack = []
        for token in tokens:
            # 遇到数字入栈
            if len(token) > 1 or token[0].isdigit():
                stack.append(int(token))
                continue
            # 栈顶的两个数字进行计算
            x = stack.pop()

            if token == '+':
                stack[-1] += x
            elif token == '-':
                stack[-1] -= x
            elif token == '*':
                stack[-1] *= x
            else:
                stack[-1] = trunc(stack[-1] / x)
        
        return stack[0]
```

#### [3561. 移除相邻字符](https://leetcode.cn/problems/resulting-string-after-adjacent-removals/)

```Python
def is_consecutive(x, y):
    d = abs(ord(x) - ord(y))
    return d == 1 or d == 25

# 作业帮实习面试
class Solution:
    def resultingString(self, s: str) -> str:
        stack = []
        for c in s:
            if stack and is_consecutive(c, stack[-1]):
                stack.pop()
            else:
                stack.append(c)
        return ''.join(stack)
```

#### [739. 每日温度](https://leetcode.cn/problems/daily-temperatures/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 739. 每日温度
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        n = len(temperatures)
        ans = [0] * n
        stack = []
        # 时间复杂度 O(n), 空间复杂度 O(min(n, U))
        for i in range(n - 1, -1, -1):
            t = temperatures[i]
            while stack and t >= temperatures[stack[-1]]:
                stack.pop()
            if stack:
                ans[i] = stack[-1] - i
            stack.append(i)
        return ans
```

#### [42. 接雨水 [Hard]](https://leetcode.cn/problems/trapping-rain-water/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 42. 接雨水
# 方法三 单调栈
class Solution:
    def trap(self, height: List[int]) -> int:
        ans = 0
        stack = []
        for i, h in enumerate(height):
            while stack and height[stack[-1]] <= h:
                bottom_h = height[stack.pop()]
                if not stack:  # 栈是空的
                    break
                left = stack[-1]
                dh = min(height[left], h) - bottom_h  # 面积的高
                ans += dh * (i - left - 1)
            stack.append(i)
        return ans
```

#### [32. 最长有效括号 [Hard]](https://leetcode.cn/problems/longest-valid-parentheses/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 32. 最长有效括号
# 栈 + 暴力 -- 超时
class Solution:
    def isvalid(self, s):
        if len(s) % 2 != 0:
            return False
        stack = []
        pairs = {')' : '('}
        for c in s:
            if c == '(':
                stack.append(c)
            elif not stack or pairs[c] != stack.pop():
                return False
        return not stack
    def longestValidParentheses(self, s: str) -> int:
        n = len(s)
        max_len = 0
        for i in range(n):
            for j in range(i, n):
                if self.isvalid(s[i:j + 1]):
                    max_len = max(j - i + 1, max_len)
        return max_len
```

```Python
# 32. 最长有效括号
```

## 队列

* 特点是左进右出（先进后出）；
* 常用于广度优先搜索；
* 单调队列：从队首到队尾单调递增或递减。

例子：

#### [239. 滑动窗口最大值 [Hard]](https://leetcode.cn/problems/sliding-window-maximum/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 239. 滑动窗口最大值
# 暴力法：O(n^2) -- 通过不了
class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        ans = []
        for i in range(len(nums)-k+1):
            ans.append(max(nums[i:i+k]))
        return ans
# ---
# 单调队列：时间复杂度 O(n), 空间复杂度 O(k)
class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        ans = []
        q = deque() # 双端队列
        for i, x in enumerate(nums):
            # 入队
            while q and nums[q[-1]] <= x:
                q.pop()
            q.append(i)
            # 出队
            if i - q[0] >= k:
                q.popleft()
            if i >= k-1:
                ans.append(nums[q[0]])
        return ans
```

## 二叉树

例子：

### 递归

#### [104. 二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 104. 二叉树的最大深度
# DFS（深度优先搜索）
# 方法一 分解子问题
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        # 递归：时间复杂度 O(n), 空间复杂度 O(n)
        return max(self.maxDepth(root.left), self.maxDepth(root.right)) + 1
```

```Python
# 方法二 遍历
class Solution:
    def __init__(self):
        self.depth = 0
        self.ans = 0

    def maxDepth(self, root):
        self.traverse(root)
        return self.ans

    def traverse(self, root):
        if not root:
            return None
        self.depth += 1 # 进入节点
        if root.left is None and root.right is None:
            self.ans = max(self.ans, self.depth)
        self.traverse(root.left)
        self.traverse(root.right)
        self.depth -= 1 # 离开节点

```

#### [94. 二叉树的中序遍历](https://leetcode.cn/problems/binary-tree-inorder-traversal/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 94. 二叉树的中序遍历
# 方法一 递归
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        def dfs(node):
            if node is None:
                return 
            dfs(node.left) # 左
            ans.append(node.val) # 根，移到前面转为前序遍历，移到最后转为后序遍历
            dfs(node.right) # 右

        ans = []
        dfs(root)
        return ans
```

#### [226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 226. 翻转二叉树
# 方法一 分解子问题
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if root is None:
            return None
        # 分别翻转左子树和右子树
        left = self.invertTree(root.left) # 后序遍历
        right = self.invertTree(root.right)
        # 交换左子树和右子树
        root.left = right
        root.right = left
        return root
```

```Python
# 方法二 遍历
class Soution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        self.traverse(root)
        return root
    
    def traverse(self, root):
        if not root:
            return
        
        # 交换左右子树
        tmp = root.left
        root.left = root.right
        root.right = tmp

        # 遍历左右子树
        self.traverse(root.left)
        self.traverse(root.right)
```

#### [110. 平衡二叉树](https://leetcode.cn/problems/balanced-binary-tree/)

```Python
# 110. 平衡二叉树
class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        def get_height(node):
            if node is None:
                return 0
            left_height = get_height(node.left)
            if left_height == -1:
                return -1
            right_height = get_height(node.right)
            if right_height == -1 or abs(left_height - right_height) > 1:
                return -1
            return max(left_height, right_height) + 1
        return get_height(root) != -1
```

#### [100. 相同的树 &amp; 101. 对称二叉树](https://leetcode.cn/problems/symmetric-tree/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 100. 相同的树 
# 101. 对称二叉树
class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if p is None or q is None:
            return p is q
        # return p.val == q.val and self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right) 
        return p.val == q.val and self.isSameTree(p.left, q.right) and self.isSameTree(p.right, q.left)
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        return self.isSameTree(root.left, root.right)
```

#### [199. 二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/description/?envType=study-plan-v2&envId=top-100-liked)

```python
# 199. 二叉树的右视图
# 方法一 递归
class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        ans = []
        def f(node, depth):
            if node is None:
                return 
            if depth == len(ans): # 该深度首次遇到，对应节点在右视图
                ans.append(node.val) # 由于是右视图，因此先递归右子树保证首次遇到的是右边的节点
            f(node.right, depth+1)
            f(node.left, depth+1)
        f(root, 0)
        return ans
```

#### [105. 从前序与中序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 105. 从前序与中序遍历序列构造二叉树 
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        if not preorder:
            return None
        # preorder[0] 为根结点，类似的 postorder[-1] 为根结点
        left_size = inorder.index(preorder[0]) # 左子树的大小
        left = self.buildTree(preorder[1: 1 + left_size], inorder[:left_size])
        right = self.buildTree(preorder[1 + left_size:], inorder[1 + left_size:])
        return TreeNode(preorder[0], left, right)
```

#### [543. 二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 543. 二叉树的直径
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        self.ans = 0    

        def dfs(node):
            if not node:
                return 0
            
            left = dfs(node.left)
            right = dfs(node.right)

            self.ans = max(self.ans, left + right)
            return max(left, right) + 1

        dfs(root)
        return self.ans
```

#### [236. 二叉树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 236. 二叉树的最近公共祖先
class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if root in (None, p, q):
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right: # 左右都找到，当前节点是公共祖先
            return root
        return left or right # 只有左或右找到，返回对应节点
```

#### [437. 路径总和 III](https://leetcode.cn/problems/path-sum-iii/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 437. 路径总和 III
# 思路类似于和为 k 的子数组
class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        cnt = defaultdict(int)
        cnt[0] = 1
        ans = 0

        def dfs(node, s):
            if node is None:
                return 

            nonlocal ans
            s += node.val
            ans += cnt[s - targetSum]

            cnt[s] += 1
            dfs(node.left, s)
            dfs(node.right, s)
            cnt[s] -= 1

        dfs(root, 0)
        return ans
```

#### [124. 二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 124. 二叉树中的最大路径和
class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        ans = -inf 
        def dfs(node):
            if node is None:
                return 0 
            l_val = dfs(node.left)
            r_val = dfs(node.right)
            nonlocal ans 
            ans = max(ans, l_val + r_val + node.val)
            return max(max(l_val, r_val) + node.val, 0)
        dfs(root)
        return ans
```

### 迭代

#### [94. 二叉树的中序遍历](https://leetcode.cn/problems/binary-tree-inorder-traversal/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 94. 二叉树的中序遍历
# 方法二 迭代
class Solution:
    def inorderTraversal(self, root: TreeNode) -> List[int]:

        if not root:
            return []
        stack = []  # 不能提前将root节点加入stack中

        result = []
        cur = root
        while cur or stack:
            # 先迭代访问最底层的左子树节点
            if cur:   
                stack.append(cur)
                cur = cur.left
            # 到达最左节点后处理栈顶节点  
            else:
                cur = stack.pop()
                result.append(cur.val)
                # 取栈顶元素右节点
                cur = cur.right
        return result
```

#### [102. 二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 102. 二叉树的层序遍历
# BFS（广度优先搜索）
# 方法一 双数组
class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if root is None:
            return []
        ans = []
        cur = [root]
        while cur:
            nxt = [] # 下一层的节点
            vals = [] # 节点的值
            for node in cur:
                vals.append(node.val)
                if node.left:   
                    nxt.append(node.left)
                if node.right:  
                    nxt.append(node.right)
            cur = nxt # 更新节点
            ans.append(vals)
        return ans
```

```Python
# 102. 二叉树的层序遍历
# 方法二 队列
class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if root is None:
            return []
        ans = []
        q = deque([root])
        while q:
            vals = []
            for _ in range(len(q)):
                node = q.popleft()
                vals.append(node.val)
                if node.left:  q.append(node.left)
                if node.right: q.append(node.right)
            ans.append(vals)
        return ans
```

#### [103. 二叉树的锯齿形层序遍历](https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal/description/)

```Python
# 103. 二叉树的锯齿形层序遍历
# 与普通的层序遍历思路一样，区别在于添加答案时要注意 vals 的顺序
class Solution:
    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []
        ans = []
        q = deque([root])

        while q:
            vals = []
            for _ in range(len(q)):
                node = q.popleft()
                vals.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            ans.append(vals[::-1] if len(ans) % 2 else vals)
        return ans
```

### 二叉搜索树

#### [108. 将有序数组转换为二叉搜索树](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 108. 将有序数组转换为二叉搜索树
class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:
        def dfs(left, right):
            if left == right:
                return None
            m = (left + right) // 2
            return TreeNode(nums[m], dfs(left, m), dfs(m + 1, right))
        return dfs(0, len(nums))
```

#### [98. 验证二叉搜索树](https://leetcode.cn/problems/validate-binary-search-tree/description/?envType=study-plan-v2&envId=top-100-liked)

```python
# 98. 验证二叉搜索树
# 中序遍历
class Solution:
    pre = -inf
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        if root is None:
            return True
        if not self.isValidBST(root.left):  # 左
            return False
        if root.val <= self.pre:  # 中
            return False
        self.pre = root.val
        return self.isValidBST(root.right)  # 右

# 前序遍历
class Solution:
    def isValidBST(self, root: Optional[TreeNode], left = -inf, right = inf) -> bool:
        if root is None:
            return True
        x = root.val
        return left < x < right and \
        self.isValidBST(root.left, left, x) and \
        self.isValidBST(root.right, x, right)

# 后序遍历
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def dfs(node: Optional[TreeNode]) -> Tuple:
            if node is None:
                return inf, -inf
            l_min, l_max = dfs(node.left)
            r_min, r_max = dfs(node.right)
            x = node.val
            # 也可以在递归完左子树之后立刻判断，如果发现不是二叉搜索树，就不用递归右子树了
            if x <= l_max or x >= r_min:
                return -inf, inf
            return min(l_min, x), max(r_max, x)
        return dfs(root)[1] != inf
```

#### [230. 二叉搜索树中第 K 小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 230. 二叉搜索树中第 K 小的元素
# 方法一 中序遍历
class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        arr = []
        def inorder(node):
            if node is None:
                return
            inorder(node.left)
            arr.append(node.val)
            inorder(node.right)
        inorder(root)
        return arr[k-1]
```

## 堆

堆是一种**特殊的完全二叉树**结构，其每个节点的值大于等于（对应最大堆）或小于等于（对应最小堆）字节点的值，常用来解决 **Top-K** 问题。

例子：

#### [215. 数组中的第 K 个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 215. 数组中的第 K 个最大元素
# 方法一 堆 Python 标准库实现
import heapq # 默认是最小堆

class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []
        # 时间复杂度 O(nlogk), 空间复杂度 O(k)
        for num in nums:
            heapq.heappush(heap, num) # 入堆并维护堆，执行一次的时间复杂度为 logk
            if len(heap) > k:
                heapq.heappop(heap) # 出堆
        return heap[0] # 最小堆--第一个元素比其他 K-1 个元素都小
```

#### [347. 前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 347. 前 K 个高频元素
class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        # 时间复杂度 O(nlogk), 空间复杂度 O(n)
        cnt = {} 
        # 字典（哈希表）用来记录数字出现的频率--空间复杂度 O(n)
        for num in nums:
            cnt[num] = cnt.get(num, 0) + 1
        # count = collections.Counter(nums) # Python 自带计数器
        heap = []
        for key, val in cnt.items():
            heapq.heappush(heap, (val, key))  # 把 val 作为排序依据
            if len(heap) > k:
                heapq.heappop(heap) # 保证堆里只保留 top k 个最大频率
        return [item[1] for item in heap]
```

## 排序

#### 手撕快速排序

```Python
import random

class Solution:
    def sortArray(self, nums: List[int]) -> List[int]:
        def quicksort(left, right):
            # 递归终止条件：区间为空或只有一个元素
            if left >= right:
                return
            
            # 随机选择一个基准
            pivot_idx = random.randint(left, right)
            pivot = nums[pivot_idx]
            # 将 pivot 放到左端，避免干扰后续划分
            nums[left], nums[pivot_idx] = nums[pivot_idx], nums[left]
            
            # 双指针：两端向中间收缩
            i, j = left + 1, right
            
            while True:
                # 从左往右找第一个 >= pivot 的元素（应该放到右边）
                while i <= j and nums[i] < pivot:
                    i += 1
                # 从右往左找第一个 <= pivot 的元素（应该放到左边）
                while i <= j and nums[j] > pivot:
                    j -= 1
                if i >= j:
                    break
                # 维护循环不变量，交换错位的元素
                nums[i], nums[j] = nums[j], nums[i]
                i += 1
                j -= 1
            
            # <= pivot ｜ j 为基准的下标 ｜ >= pivot
            nums[left], nums[j] = nums[j], nums[left]
            
            # 递归排序左右两边
            quicksort(left, j - 1)
            quicksort(j + 1, right)
        
        quicksort(0, len(nums) - 1)
        return nums
```

#### [215. 数组中的第 K 个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 215. 数组中的第 K 个最大元素
# 方法二 快速选择
class Solution:
    def partition(self, nums: List[int], left: int, right: int) -> int:
            pivot_idx = random.randint(left, right)
            pivot = nums[pivot_idx]
            nums[left], nums[pivot_idx] = nums[pivot_idx], nums[left]
            i, j = left + 1, right
            
            while True:
                while i <= j and nums[i] < pivot:
                    i += 1
                while i <= j and nums[j] > pivot:
                    j -= 1
                if i >= j:
                    break
                nums[i], nums[j] = nums[j], nums[i]
                i += 1
                j -= 1

            nums[left], nums[j] = nums[j], nums[left]
            return j
    def findKthLargest(self, nums: List[int], k: int) -> int:
        n = len(nums)
        target_idx = n - k
        left, right = 0, n - 1
        while True:
            j = self.partition(nums, left, right) # 随机选一个 pivot，partition 会返回其在排序 nums 中的正确位置
            if j == target_idx:
                return nums[j]
            elif j < target_idx:
                # 第 k 大元素在 [j+1, right] 中
                left = j + 1
            else:
                # 第 k 大元素在 [left, j-1] 中
                right = j - 1
```

## 回溯

本质是穷举，用于解决**组合问题、切割问题、子集问题、排列问题、棋盘问题**。

回溯有一个**增量构造答案**的过程，这个过程通常用**递归**实现。

例子：

### 子集型

#### [78. 子集](https://leetcode.cn/problems/subsets/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 78. 子集
# 方法一 选或不选（输入视角）
class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        ans = []
        path = []
        # 时间复杂度 O(n2^n), 空间复杂度 O(n)
        def backtrack(i):
            if i == n:
                ans.append(path.copy())
                return
          
            # 不选 nums[i]
            backtrack(i + 1)

            # 选 nums[i]
            path.append(nums[i])
            backtrack(i + 1)
            path.pop() # 恢复现场

        backtrack(0)
        return ans
```

```Python
# 78. 子集
# 方法二 枚举哪一个（答案视角）
class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        ans = []
        path = []

        def backtrack(i: int) -> None:
            ans.append(path.copy())  # 复制 path
            for j in range(i, n):  # 枚举选择的数字
                path.append(nums[j])
                backtrack(j + 1)
                path.pop()  # 恢复现场

        backtrack(0)
        return ans
```

#### [17. 电话号码的字母组合](https://leetcode.cn/problems/letter-combinations-of-a-phone-number?envType=study-plan-v2&envId=top-100-liked)

```Python
MAPPING = "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"

class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        n = len(digits)
        if n == 0:
            return []
      
        ans = []
        path = [''] * n

        def backtrack(i):
            if i == n:
                ans.append(''.join(path))
                return 
            for c in MAPPING[int(digits[i])]:
                path[i] = c # 直接覆盖
                backtrack(i + 1)

        backtrack(0)
        return ans
```

#### [131. 分割回文串](https://leetcode.cn/problems/palindrome-partitioning/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 131. 分割回文串
# 方法一 选或不选
class Solution:
    def partition(self, s: str) -> List[List[str]]:
        n = len(s)
        ans = []
        path = []

        def backtrack(i, start):
            if i == n:
                ans.append(path.copy())
                return 
          
            if i < n - 1:
                backtrack(i + 1, start)
          
            t = s[start: i + 1]
            if t == t[::-1]:
                path.append(t)
                backtrack(i + 1, i + 1)
                path.pop()
          
        backtrack(0, 0)
        return ans
```

```Python
# 131. 分割回文串
# 方法二 枚举哪一个
class Solution:
    def partition(self, s: str) -> List[List[str]]:
        n = len(s)
        ans = []
        path = []

        # 考虑 s[i:] 怎么分割
        def backtrack(i):
            if i == n:  # s 分割完毕
                ans.append(path.copy())  # 复制 path
                return
            for j in range(i, n):  # 枚举子串的结束位置
                t = s[i: j + 1]  # 分割出子串 t
                if t == t[::-1]:  # 判断 t 是不是回文串
                    path.append(t)
                    # 考虑剩余的 s[j+1:] 怎么分割
                    backtrack(j + 1)
                    path.pop()  # 恢复现场

        backtrack(0)
        return ans
```

#### [93. 复原 IP 地址](https://leetcode.cn/problems/restore-ip-addresses/description/)

```Python
# 93. 复原 IP 地址
class Solution:
    def restoreIpAddresses(self, s: str) -> List[str]:
        n = len(s)
        ans = []
        path = [''] * 4

        # 分割 s[i] 到 s[n-1]，现在在第 j 段（j 从 0 开始）
        def dfs(i: int, j: int) -> None:
            # 剪枝：还剩下 n-i 个字符，需要分成 4-j 段，每段至少 1 个字符，至多 3 个字符，所以 4-j <= n-i <= (4-j)*3
            if not 4 - j <= n - i <= (4 - j) * 3:
                return

            if i == n:  # s 分割完毕
                ans.append('.'.join(path))
                return

            # 子串左端点为 i
            # 枚举子串右端点 right
            ip_val = 0
            for right in range(i, n):
                ip_val = ip_val * 10 + int(s[right])
                if ip_val > 255:  # 不合法
                    break
                path[j] = s[i: right + 1]  # 直接覆盖 path[j]，无需恢复现场
                dfs(right + 1, j + 1)
                if ip_val == 0:  # 前导零，对于后续循环不合法
                    break

        dfs(0, 0)
        return ans
```

### 组合型

#### [77. 组合](https://leetcode.cn/problems/combinations/)

```Python
# 77. 组合
# 方法一 选或不选
class Solution:
    def combine(self, n: int, k: int) -> List[List[int]]:
        path = []
        ans = []
        def backtrack(i):
            d = k - len(path)
            if d == 0:
                ans.append(path.copy)
                return 
    
            # 不选 i
            if i > d:
                backtrack(i-1)
    
            # 选 i
            path.append(i)
            backtrack(i-1)
            path.pop()
      
        backtrack(n)
        return ans
```

```Python
# 77. 组合
# 方法二 枚举哪一个
class Solution:
    def combine(self, n: int, k: int) -> List[List[int]]:
        path = []
        ans = []
        def backtrack(i):
            d = k - len(path)
            if d == 0:
                ans.append(path.copy())
                return
            # for j in range(i, 0, -1): # 未剪枝
            for j in range(i, d-1, -1):
                path.append(j)
                backtrack(j - 1)
                path.pop()
        backtrack(n)
        return ans
```

#### [39. 组合总和](https://leetcode.cn/problems/combination-sum/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 39. 组合总和
# 方法一 选或不选
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        ans = []
        path = []

        def backtrack(i, val):
            if val == 0:
                ans.append(path.copy())
                return 

            if i == len(candidates) or val < 0:
                return 

            backtrack(i + 1, val)

            path.append(candidates[i])
            backtrack(i, val - candidates[i])
            path.pop()

        backtrack(0, target)
        return ans
```

```Python
# 39. 组合总和
# 方法二 枚举哪一个
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        ans = []
        path = []

        def backtrack(i, _sum):
            if _sum == 0:
                ans.append(path.copy())
                return 
          
            for j in range(i, len(candidates)):
                if candidates[j] > _sum:
                    break
                path.append(candidates[j])
                backtrack(j, _sum - candidates[j])
                path.pop()

        backtrack(0, target)
        return ans
```

#### [22. 括号生成](https://leetcode.cn/problems/generate-parentheses/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        ans = []
        path = [''] * (n * 2)

        def backtrack(left, right):
            if right == n:
                ans.append(''.join(path))
                return 
            if left < n:
                path[left + right] = '('
                backtrack(left + 1, right)
            if right < left:
                path[left + right] = ')'
                backtrack(left, right + 1)
            
        backtrack(0, 0)
        return ans
```

### 排列型

#### [46. 全排列](https://leetcode.cn/problems/permutations/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 46. 全排列
class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        path = [0] * n 
        on_path = [False] * n 
        ans = []

        # 枚举 path[i] 填 nums 的哪一个数
        def backtrack(i):
            if i == n:
                ans.append(path.copy())
                return 
            for j, on in enumerate(on_path):
                if not on:
                    path[i] = nums[j] # 从没有选的数字中选一个
                    on_path[j] = True # 已选上
                    backtrack(i + 1)
                    on_path[j] = False # 恢复现场

        backtrack(0)
        return ans
```

## 贪心

#### [121. 买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 121. 买卖股票的最佳时机
# 方法一 贪心
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        ans = 0
        min_price = prices[0]
        for p in prices:
            ans = max(ans, p - min_price) # 更新答案
            min_price = min(min_price, p) # 维护最小买入价格
        return ans
```

#### [53. 最大子数组和](https://leetcode.cn/problems/maximum-subarray/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 53. 最大子数组和
# 方法一 前缀和 + 贪心
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        ans = -inf
        min_pre_sum = pre_sum = 0
        for x in nums:
            pre_sum += x  # 当前的前缀和
            ans = max(ans, pre_sum - min_pre_sum)  # 减去前缀和的最小值
            min_pre_sum = min(min_pre_sum, pre_sum)  # 维护前缀和的最小值
        return ans  
```

#### [179. 最大数](https://leetcode.cn/problems/largest-number/description/)

```Python
# 179. 最大数
```

#### [55. 跳跃游戏](https://leetcode.cn/problems/jump-game/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 55. 跳跃游戏
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        mx = 0
        for i, jump in enumerate(nums):
            if i > mx: # 无法到达 i
                return False
            mx = max(mx, i + jump) # 从 i 最右可以跳到 i + jump
        return True
```

## 动态规划

### 入门

#### [509. 斐波那契数](https://leetcode.cn/problems/fibonacci-number/description/)

```Python
# 509. 斐波那契数
# 方法一 动态规划
class Solution:
    def fib(self, n: int) -> int:
        if n == 0:
            return 0
        dp = [0] * (n+1)
        dp[0] = 0
        dp[1] = 1
        for i in range(2, n+1):
            dp[i] = dp[i-1] + dp[i-2]
        return dp[n]
```

```Python
# 方法二 递归
class Solution:
    def fib(self, n: int) -> int:
        if n < 2:
            return n
        return self.fib(n-1) + self.fib(n-2)
```

#### [118. 杨辉三角](https://leetcode.cn/problems/pascals-triangle/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 118. 杨辉三角
class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        # 把杨辉三角的每一排左对齐，每一排第一个和最后一个数都为 1
        ans = [[1] * (i + 1) for i in range(numRows)]
        for i in range(2, numRows):
            for j in range(1, i):
                ans[i][j] = ans[i - 1][j - 1] + ans[i - 1][j]
        return ans
```

#### [70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs?envType=study-plan-v2&envId=top-100-liked)

```Python
# 70. 爬楼梯
# 方法一 递归
class Solution:
    def climbStairs(self, n: int) -> int:
        # 时间复杂度 O(n), 空间复杂度 O(n)
        @cache # 记忆化搜索修饰器--原理是哈希表
        def dfs(i):
            if i <= 1:
                return 1
            return dfs(i - 1) + dfs(i - 2)
        return dfs(n)
```

#### [198. 打家劫舍](https://leetcode.cn/problems/house-robber/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 198. 打家劫舍
# 方法一 递归
class Solution:
    def rob(self, nums: List[int]) -> int:
        n = len(nums)
        @cache # 修饰符
        def dfs(i):
            if i < 0:
                return 0
            ans = max(dfs(i - 1), dfs(i - 2) + nums[i])
            return ans
        return dfs(n-1)
```

### 从递归到递推

对于动态规划问题，递归对应自顶向下的解法，其可以转化为自底向上的递推解法（dp table）。

#### [70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs?envType=study-plan-v2&envId=top-100-liked)

```Python
# 70. 爬楼梯
# 方法二 递推
class Solution:
    def climbStairs(self, n: int) -> int:
        dp = [0] * (n + 1)
        dp[0] = dp[1] = 1
        for i in range(2, n+1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]
```

```Python
# 70. 爬楼梯
# 递推 -- 空间压缩
class Solution:
    def climbStairs(self, n: int) -> int:
        dp_0 = dp_1 = 1
        for i in range(2, n+1):
            dp_new = dp_0 + dp_1
            dp_0 = dp1
            dp_1 = dp_new
        return dp_1
```

#### [322. 零钱兑换](https://leetcode.cn/problems/coin-change/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 322. 零钱兑换
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [amount + 1] * (amount + 1) # dp[i] 定义为金额为 i 时需要的最少硬币数

        dp[0] = 0

        for i in range(len(dp)):
            for coin in coins:
                if i - coin < 0:
                    continue
                dp[i] = min(dp[i], 1 + dp[i - coin])
        return -1 if dp[amount] == amount + 1 else dp[amount]
```

### 0-1 背包问题

0-1 背包：给定一组物品，每种物品都有自己的重量（Weight）和价值（Value），每种物品不重复。在限定的总重量（背包容量）内，选择若干个物品，使得背包内物品的总价值最大化，对于每个物品，因为只有选或不选两种情况，因此称为 0-1 背包。

* 至多装 x 容量，求方案数 / 最大价值和；
* 恰好装 x 容量，求方案数 / 最大 / 最小价值和；
* 至少装 x 容量，求方案数 / 最小价值和。

```Python
# 0-1 背包
# 递归 -- 记忆化搜索
def zero_one_knapsack(capacity: int, w: List[int], v: List[int]) -> int:
    n = len(w)

    @cache
    def dfs(i, c):
        if i < 0:
            return 0
        if c < w[i]:
            return dfs(i-1, c)
        return max(dfs(i-1, c), dfs(i-1, c-w[i]) + v[i])

    return dfs(n-1, capacity)
```

```Python
# 递推
def zero_one_knapsack(capacity: int, w: List[int], v: List[int]) -> int:
    n = len(w)
    dp = [[0] * (capacity+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for c in range(1, capacity+1):
            if c < w[i-1]:
                dp[i][c] = dp[i-1][c]
            else:
                dp[i][c] = max(dp[i-1][c], dp[i-1][c-w[i-1]] + v[i-1])
    return dp[n][capacity]
```

#### [416. 分割等和子集](https://leetcode.cn/problems/partition-equal-subset-sum/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 416. 分割等和子集
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        n = len(nums)
        total_num = sum(nums)
        if total_sum % 2 != 0:
            return False
        # 相当于背包容量
        target = total_sum // 2
        dp = [[False * (target + 1)] for _ in range(n + 1)]
        for i in range(n + 1):
            dp[i][0] = True
        for i in range(1, n + 1):
            for j in range(1, target + 1):
                if j - nums[i - 1] < 0: # 当前容量已经装不下 nums[i-1]
                    dp[i][j] = dp[i-1][j]
                else:
                    dp[i][j] = dp[i-1][j] or dp[i-1][j-nums[i-1]]
        return dp[n][target]
```

### 完全背包问题

完全背包：物品可以重复选。

* 至多装 x 容量，求方案数 / 最大价值和；
* 恰好装 x 容量，求方案数 / 最大 / 最小价值和；
* 至少装 x 容量，求方案数 / 最小价值和。

#### [279. 完全平方数](https://leetcode.cn/problems/perfect-squares/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 279. 完全平方数
N = 10**4
dp = [N] * (N + 1)

dp[0] = 0

for i in range(1, isqrt(N) + 1):
    for j in range(i * i, N + 1):
        dp[j] = min(dp[j], dp[j - i*i] + 1)

class Solution:
    def numSquares(self, n: int) -> int:
        return dp[n]
```

#### [518. 零钱兑换 II](https://leetcode.cn/problems/coin-change-ii/description/)

```Python
# 518. 零钱兑换 II
class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        n = len(coins)
        dp = [[0] * (amount + 1) for _ in range(n + 1)]
        for i in range(n + 1):
            dp[i][0] = 1
        
        for i in range(1, n + 1):
            for j in range(1, amount + 1):
                if j - coins[i - 1] >= 0:
                    dp[i][j] = dp[i-1][j] + dp[i][j - coins[i-1]]
                else:
                    dp[i][j] = dp[i-1][j]
            
        return dp[n][amount]
```

### 线性 DP 子数组 & 子序列问题

#### [300. 最长递增子序列](https://leetcode.cn/problems/longest-increasing-subsequence/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 300. 最长递增子序列
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        dp = [1] * len(nums) # dp[i] 定义为以 nums[i] 结尾的最长递增子序列
        for i in range(len(nums)):
            for j in range(i):
                # 若 nums[i] 可以接在 nums[j] 后面，形成更长的递增子序列
                if nums[i] > nums[j]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)
```

#### [1143. 最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 1143. 最长公共子序列
class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)] # dp 定义为 s1[0:i-1] 和 s2[0:j-1] 的 lcs 长度

        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i-1] == text2[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
                # 最后一个字符至少有一个不能同时选
                else:
                    dp[i][j] = max(dp[i][j-1], dp[i-1][j])
        return dp[m][n]
```

```Python
# 1143. 最长公共子序列
# 空间压缩
class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [0] * (n + 1)
        for i in range(m):
            pre = 0
            for j in range(n):
                tmp = dp[j + 1]
                if text1[i] == text2[j]:
                    dp[j + 1] = pre + 1 
                else:
                    dp[j + 1] = max(dp[j + 1], dp[j]) 
                pre = tmp 
        return dp[-1] 
```

#### [72. 编辑距离](https://leetcode.cn/problems/edit-distance/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 72. 编辑距离
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)] # dp 定义为把 s1 的前 i 个字符，变成 s2 的前 j 个字符，所需要的最少操作数
        for i in range(1, m + 1):
            dp[i][0] = i
        for j in range(1, n + 1):
            dp[0][j] = j
        
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i-1][j-1]
                # 关注最后一步 -- 删除、插入、替换
                else:
                    dp[i][j] = min(
                        dp[i-1][j] + 1,
                        dp[i][j-1] + 1,
                        dp[i-1][j-1] + 1
                    )
        return dp[m][n]
```

```Python
# 72. 编辑距离
# 空间压缩
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        dp = list(range(len(word2) + 1))
        for x in word1:
            pre = dp[0]
            dp[0] += 1
            for j in range(len(word2)):
                tmp = dp[j + 1]
                if x == word2[j]:
                    dp[j + 1] = pre
                else:
                    dp[j + 1] = min(dp[j + 1], dp[j], pre) + 1
                pre = tmp 
        return dp[-1]
```

#### [53. 最大子数组和](https://leetcode.cn/problems/maximum-subarray/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 53. 最大子数组和
# 方法二 动态规划
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        dp = [0] * len(nums) # dp[i] 定义为以 nums[i] 结尾的最大子数组和
        dp[0] = nums[0]

        for i in range(1, len(nums)):
            dp[i] = max(dp[i - 1], 0) + nums[i]
        return max(dp)
```

```Python
# 53. 最大子数组和
# 动态规划 -- 压缩空间
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        ans = dp = nums[0]

        for i in range(1, len(nums)):
            dp_new = max(dp + nums[i], nums[i])
            dp = dp_new
            ans = max(ans, dp)
        return ans
```

#### [1262. 可被三整除的最大和](https://leetcode.cn/problems/greatest-sum-divisible-by-three/description/)

```Python
# 1262. 可被三整除的最大和
class Solution:
    def maxSumDivThree(self, nums: List[int]) -> int:
        dp = [0, float('-inf'), float('-inf')] # dp[i] 代表“和 % 3 == i”的最大和

        for x in nums:
            new = dp.copy()
            for r in range(3):
                new[(r + x) % 3] = max(new[(r + x) % 3], dp[r] + x)
            dp = new
        
        return dp[0]
```

#### [152. 乘积最大子数组](https://leetcode.cn/problems/maximum-product-subarray/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        n = len(nums)
        dp_max = [0] * n 
        dp_min = [0] * n 
        dp_max[0] = dp_min[0] = nums[0]
        for i in range(1, n):
            x = nums[i]
            # 维护以 nums[i] 为右端点的最大、最小乘积子数组
            dp_max[i] = max(dp_max[i-1] * x, dp_min[i-1] * x, x)
            dp_min[i] = min(dp_max[i-1] * x, dp_min[i-1] * x, x)
        return max(dp_max)
```

### 多维 DP

#### [62. 不同路径](https://leetcode.cn/problems/unique-paths/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 62. 不同路径
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [[0] * (n + 1) for _ in range(m + 1)] # dp[i][j] 定义为到达 (i, j) 坐标的路径数
        dp[0][1] = 1
        for i in range(m):
            for j in range(n):
                # 只能向右或向下，因此要到达 (i, j)，来源于从左往右和自上向下两部分
                dp[i + 1][j + 1] = dp[i][j + 1] + dp[i + 1][j]
        return dp[m][n]
```

#### [63. 不同路径 II](https://leetcode.cn/problems/unique-paths-ii/description/)

```Python
# 63. 不同路径 II
class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:
        m, n = len(obstacleGrid), len(obstacleGrid[0])
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        dp[0][1] = 1
        for i in range(m):
            for j in range(n):
                # 排除障碍物
                if obstacleGrid[i][j] == 0:
                    dp[i+1][j+1] = dp[i][j+1] + dp[i+1][j]
        return dp[m][n]
```

#### [64. 最小路径和](https://leetcode.cn/problems/minimum-path-sum/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 64. 最小路径和
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        dp = [[inf] * (n + 1) for _ in range(m + 1)]
        for i, row in enumerate(grid):
            for j, x in enumerate(row):
                if i == j == 0:
                    dp[1][1] = x
                else:
                    dp[i + 1][j + 1] = min(dp[i + 1][j], dp[i][j + 1]) + x 
        return dp[m][n]
```

### 打家劫舍系列问题

#### [198. 打家劫舍](https://leetcode.cn/problems/house-robber/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 198. 打家劫舍
# 方法二 递推
class Solution:
    def rob(self, nums: List[int]) -> int:
        n = len(nums)
        dp = [0] * (n + 2) # dp[i] 定义为在前 i - 2 个房子中能偷到的最大金额
        for i in range(n):
            # 选或不选 nums[i]
            dp[i + 2] = max(dp[i + 1], dp[i] + nums[i])
        return dp[-1]
```

#### [213. 打家劫舍 II](https://leetcode.cn/problems/house-robber-ii/description/)

```Python
# 213. 打家劫舍 II
# 复用打家劫舍 -- 把环拆成两个线形 dp 问题
class Solution:
    def rob1(self, nums):
        n = len(nums)
        dp = [0] * (n + 2)
        for i in range(n):
            dp[i + 2] = max(dp[i] + nums[i], dp[i + 1])
        return dp[-1]
    '''
    转化为打家劫舍问题，由于 nums[0] 和 nums[1] 不能同时选，考虑选或不选 nums[0] 
    '''
    def rob(self, nums: List[int]) -> int:
        return max(nums[0] + self.rob1(nums[2:-1]), self.rob1(nums[1:]))
```

### 状态机 DP 股票系列问题

#### [121. 买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 121. 买卖股票的最佳时机
# 方法二 动态规划
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # 两个状态：持有或不持有股票
        # 答案为不持有股票时的最大值
        n = len(prices)
        dp = [[0] * 2 for _ in range(n + 1)]

        dp[0][0] = 0
        dp[0][1] = -inf

        for i in range(n):
            dp[i+1][0] = max(dp[i][0], dp[i][1] + prices[i])
            dp[i+1][1] = max(dp[i][1], -prices[i])

        return dp[n][0]
        '''
        # 空间优化后与贪心写法一致
        hold = -prices[0]
        no_hold = 0
        for price in prices:
            no_hold = max(no_hold, hold + price) # 抛出时收益最大
            hold = max(hold, -price) # 买入时花最少的钱
        return no_hold
        '''
```

#### [122. 买卖股票的最佳时机 II](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/description/)

```Python
# 122. 买卖股票的最佳时机 II
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        n = len(prices)
        dp = [[0] * 2 for _ in range(n + 1)]
        # dp[i][0] 表示前 i 天结束后，手里没有股票时的最大利润，dp[i][1] 表示前 i 天结束后，手里没有股票时的最大利润
        dp[0][1] = -inf 
        for i, p in enumerate(prices):
            dp[i+1][0] = max(dp[i][0], dp[i][1] + p) # 什么都不做或卖掉股票
            dp[i+1][1] = max(dp[i][1], dp[i][0] - p) # 什么都不做或买入股票
        return dp[n][0]
```

#### [714. 买卖股票的最佳时机含手续费](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/description/)

```Python
# 714. 买卖股票的最佳时机含手续费
class Solution:
    def maxProfit(self, prices: List[int], fee: int) -> int:
        n = len(prices)
        dp = [[0] * 2 for _ in range(n + 1)]
        dp[0][0] = 0
        dp[0][1] = -inf
        for i, p in enumerate(prices):
            dp[i+1][0] = max(dp[i][0], dp[i][1] + p - fee) # 额外减去手续费
            dp[i+1][1] = max(dp[i][1], dp[i][0] - p)
        return dp[n][0]
```

#### [309. 买卖股票的最佳时机含冷冻期](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-cooldown/description/)

```Python
# 309. 买卖股票的最佳时机含冷冻期
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        n = len(prices)
        dp = [[0] * 2 for _ in range(n + 2)]
        dp[1][1] = -inf
        for i, p in enumerate(prices):
            dp[i+2][0] = max(dp[i+1][0], dp[i+1][1] + p)
            dp[i+2][1] = max(dp[i+1][1], dp[i][0] - p) # 冷冻期
        return dp[-1][0]
```

### 区间 DP

#### [5. 最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 5. 最长回文子串
# 方法二 区间 DP
class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        dp = [[False] * n for _ in range(n)] # dp[i][j] 定义为区间 [i, j] 内的子串是否回文

        start = 0
        max_len = 1

        # 枚举长度
        for length in range(1, n+1):
            for i in range(n):
                # 区间 [i, j] 长度为 length
                j = i + length - 1
                if j >= n:
                    break
                # 长度为 1 时，一定为回文串
                if length == 1:
                    dp[i][j] = True
                # 长度为 2
                elif length == 2:
                    dp[i][j] = (s[i] == s[j])
                # 长度 >= 3
                else:
                    dp[i][j] = (s[i] == s[j]) and dp[i+1][j-1]

                # 更新答案
                if dp[i][j] and length > max_len:
                    max_len = length
                    start = i
        return s[start:start + max_len]
```

#### [516. 最长回文子序列](https://leetcode.cn/problems/longest-palindromic-subsequence/description/)

```Python
# 516. 最长回文子序列
```

### 树形 DP

## 图

#### [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 200. 岛屿数量
# 方法一 DFS
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        ans = 0
        m, n = len(grid), len(grid[0])

        # 岛屿数量 = 连通的陆地数

        def dfs(i, j):
            # 递归边界：越界或当前不是陆地
            if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != '1':
                return
            grid[i][j] = '2' # 标记已访问的陆地
            dfs(i, j - 1) # 向左走
            dfs(i, j + 1) # 向右走
            dfs(i - 1, j) # 向上走
            dfs(i + 1, j) # 向下走

        for i in range(m):
            for j in range(n):
                # 遍历到新的陆地，更新岛屿数量
                if grid[i][j] == '1':
                    dfs(i, j)
                    ans += 1
        return ans
```

```Python
# 200. 岛屿数量
# 方法二 BFS
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        ans = 0

        for i in range(m):
            for j in range(n):
                if grid[i][j] == '1':
                    ans += 1
                    queue = deque([(i, j)])
                    grid[i][j] = '2'  # 标记访问

                    while queue:
                        x, y = queue.popleft() # 出队
                        # 四个方向遍历
                        for nx, ny in [(x+1,y), (x-1,y), (x,y+1), (x,y-1)]: 
                            # 把周围连通的陆地全部找出来并入队
                            if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] == '1':
                                grid[nx][ny] = '2'
                                queue.append((nx, ny))
        return ans
```

#### [994. 腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/description/?envType=study-plan-v2&envId=top-100-liked)

```Python
# 994. 腐烂的橘子
# 多源 BFS
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        fresh = 0
        q = deque() # 直接用列表也可以
        # 先统计初始时新鲜的橘子和腐烂的橘子（入队）
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 1:
                    fresh += 1
                elif grid[i][j] == 2:
                    q.append((i, j))
        
        ans = 0
        while q and fresh:
            ans += 1 # 更新时间
            size = len(q)
            '''
            # q 为列表时的写法
            tmp = q
            q = []
            for x, y in tmp:
            '''
            for _ in range(size):
                x, y = q.popleft() # 出队
                # 四个方向遍历
                for i, j in [(x-1, y), (x+1, y), (x, y-1), (x, y+1)]: 
                    if 0 <= i < m and 0 <= j < n and grid[i][j] == 1:
                        # 新鲜橘子变为腐烂橘子
                        fresh -= 1
                        grid[i][j] = 2
                        q.append((i, j)) # 入队
        return -1 if fresh else ans
```

### 并查集

## 数学和技巧

## 算法相关手撕

### 大模型相关手撕

#### 1. 注意力机制

* 1.1 多头自注意力

```Python
# HuaWei
# numpy
import numpy as np

def softmax(x, axis=-1):
    m = np.max(x, axis=axis, keepdims=True)
    ex = np.exp(x - m)
    return ex / np.sum(ex, axis=axis, keepdims=True)

def MultiHeadAttention(x, wq, wk, wv, wo, num_heads, load_lora, r, A, B, mask=None):
    bs, seq_len, hidden_dim = x.shape
    assert hidden_dim % num_heads == 0
    d_k = hidden_dim // num_heads

    # 支持 LoRA
    if load_lora and A and B and A.size > 0 and B.size > 0:
        wq = wq + B @ A
        wk = wk + B @ A
        wv = wv + B @ A
        wo = wo + B @ A

    # 线性映射
    q = x @ wq
    k = x @ wk
    v = x @ wv

    # 分头
    q = q.reshape(bs, seq_len, num_heads, d_k).transpose(0, 2, 1, 3) # (bs, num_heads, seq_len, d_k)
    k = k.reshape(bs, seq_len, num_heads, d_k).transpose(0, 2, 1, 3)
    v = v.reshape(bs, seq_len, num_heads, d_k).transpose(0, 2, 1, 3)

    # 计算分数
    scores = q @ k.transpose(0, 1, 3, 2) * (d_k ** -0.5) # (bs, num_heads, seq_len, seq_len)

    # 因果掩码
    if mask is not None:
        causal_mask = np.tril(np.ones((seq_len, seq_len), dtype=np.float32))  # [seq_len,seq_len]
        causal_mask = causal_mask[None, None, :, :]                      # 广播
        scores = np.where(causal_mask == 1, scores, -np.inf)

    # 计算注意力，合并头，输出
    attn = softmax(scores, axis=-1)
    context = (attn @ v).transpose(0, 2, 1, 3).reshape(bs, seq_len, num_heads * d_k)
    return context @ wo
```

```Python
# Pytorch
import torch
import torch.nn as nn
import torch.nn.functional as F

class MultiHeadAttention(nn.Module):
    def __init__(self, hidden_dim, num_heads):
        super().__init__()
        self.num_heads = num_heads
        assert hidden_dim % self.num_heads == 0
        self.d_k = hidden_dim // self.num_heads
      
        # 定义四个线性变换
        self.W_q = nn.Linear(hidden_dim, hidden_dim)
        self.W_k = nn.Linear(hidden_dim, hidden_dim)
        self.W_v = nn.Linear(hidden_dim, hidden_dim)
        self.W_o = nn.Linear(hidden_dim, hidden_dim)
      
    def forward(self, x, mask=None):
        batch_size, seq_len, _ = x.shape
      
        # 1. 线性变换并切分为多头 (Batch, L, n_heads, d_k)
        # 2. 转置维度以便计算 (Batch, n_heads, L, d_k)
        q = self.W_q(x).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        k = self.W_k(x).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        v = self.W_v(x).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
      
        # 3. 计算 Scaled Dot-Product Attention
        # scores 维度: (Batch, n_heads, L_q, L_k)
        # q (Batch, n_heads, L_q, d_k), k^T (Batch, n_heads, d_k, L_k)
        scores = torch.matmul(q, k.transpose(-2, -1)) / (self.d_k ** 0.5)
      
        if mask is not None:
            causal_mask = torch.tril(torch.ones(seq_len, seq_len))
            causal_mask = causal_mask.unsqueeze(0).unsqueeze(0)
            scores = scores.masked_fill(causal_mask == 0, float('-inf'))
          
        attn = F.softmax(scores, dim=-1)
      
        # 4. 合并多头
        # (Batch, L, dim)
        context = torch.matmul(attn, v).transpose(1, 2).contiguous()
        context = context.view(batch_size, -1, self.num_heads * self.d_k)
      
        return self.W_o(context)
```

* 1.2 多头交叉注意力

```Python
import torch
import torch.nn as nn
import torch.functional as F

class MultiHeadCrossAttention(nn.Module):
    def __init__(self, num_heads, hidden_dim):
        super().__init__()
        self.num_heads = num_heads
        self.hidden_dim = hidden_dim
        assert self.hidden_dim % self.num_heads == 0
        self.d_k = self.hidden_dim // self.num_heads

        self.Wq = nn.Linear(self.hidden_dim, self.hidden_dim)
        self.Wk = nn.Linear(self.hidden_dim, self.hidden_dim)
        self.Wv = nn.Linear(self.hidden_dim, self.hidden_dim)
        self.Wo = nn.Linear(self.hidden_dim, self.hidden_dim)

    def forward(self, x_q, x_kv, mask=None):
        bs, l_q, _ = x_q.shape
        _, l_k, _ = x_kv.shape

        q = self.Wq(x_q).view(bs, -1, self.num_heads, self.d_k).transpose(1, 2)
        k = self.Wk(x_kv).view(bs, -1, self.num_heads, self.d_k).transpose(1, 2)
        v = self.Wv(x_kv).view(bs, -1, self.num_heads, self.d_k).transpose(1, 2)

        # (bs, num_heads, l_q, l_k)
        scores = torch.matmul(q, k.transpose(-2, -1)) * (self.d_k ** -0.5) 

        if mask is not None:
            scores = socres.masked_fill(mask == 0, float('-inf'))

        attn = F.softmax(scores, dim=-1)

        context = torch.matmul(attn, v).transpose(1, 2).contiguous()
        context = context.view(bs, -1, self.num_heads * self.d_k)

        return self.Wo(context)
```

* 1.3 分组查询注意力（GQA）

```Python
import torch
import torch.nn as nn
import torch.nn.functional as F

def repeat_kv(x, n_rep):
    bs, seq_len, num_kv_heads, head_dim = x.shape
    if n_rep == 1:
        return x
    return (
        x[:, :, :, None, :].expand(bs, seq_len, num_kv_heads, n_rep, head_dim).reshape(bs, seq_len, num_kv_heads * n_rep, head_dim)
    )

class GQA(nn.Module):
    def __init__(self, num_heads, num_kv_heads, hidden_dim):
        super().__init__()
        self.num_heads = num_heads
        self.num_kv_heads = num_kv_heads
        self.hidden_dim = hidden_dim
        assert self.hidden_dim % self.num_heads == 0
        assert self.num_heads % self.num_kv_heads == 0
        self.head_dim = self.hidden_dim // self.num_heads
        self.n_rep = self.num_heads // self.num_kv_heads
        
        self.Wq = nn.Linear(self.hidden_dim, self.hidden_dim)
        self.Wk = nn.Linear(self.hidden_dim, self.num_kv_heads * self.head_dim)
        self.Wv = nn.Linear(self.hidden_dim, self.num_kv_heads * self.head_dim)
        self.Wo = nn.Linear(self.hidden_dim, self.hidden_dim)

    def forward(self, x, mask=None):
        bs, seq_len, _ = x.shape

        q = self.Wq(x).view(bs, -1, self.num_heads, self.head_dim)
        k = self.Wk(x).view(bs, -1, self.num_kv_heads, self.head_dim)
        v = self.Wv(x).view(bs, -1, self.num_kv_heads, self.head_dim)

        q, k, v = (
            q.transpose(1, 2),
            repeat_kv(k, self.n_rep).transpose(1, 2),
            repeat_kv(v, self.n_rep).transpose(1, 2)
        )

        scores = torch.matmul(q, k.transpose(-2, -1)) * (self.head_dim ** -0.5)

        if mask is not None:
            causal_mask = torch.tril(torch.ones(seq_len, seq_len))
            causal_mask = causal_mask.unsqueeze(0).unsqueeze(0)
            scores = scores.masked_fill(causal_mask==0, float('-inf'))

        attn = F.softmax(scores, dim=-1)
        context = torch.matmul(attn, v).transpose(1, 2).contiguous()
        context = context.view(bs, -1, self.num_heads * self.head_dim)
        return self.Wo(context)
```

#### 2. 层归一化

```Python
import torch
import torch.nn as nn

class LayerNorm(nn.Module):
    def __init__(self, hidden_dim, eps=1e-5):
        super().__init__()
        self.eps = eps
        self.gamma = nn.Parameter(torch.ones(hidden_dim))
        self.beta = nn.Parameter(torch.zeros(hidden_dim))

    def forward(self, x):
        # LN 在最后一个维度（或指定的维度集合）做归一化
        mean = x.mean(dim=-1, keepdim=True)
        var = x.var(dim=-1, keepdim=True, unbiased=False)
      
        x_hat = (x - mean) / torch.sqrt(var + self.eps)
        return self.gamma * x_hat + self.beta

class RMSNorm(nn.Module):
    def __init__(self, hidden_dim, eps=1e-8):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(hidden_dim))

    def forward(self, x):
        rms = x.pow(2).mean(-1, keepdim=True)
        x = x * torch.rsqrt(rms + self.eps)
        return self.weight * x
```

#### 3. 批归一化

```Python
import torch
import torch.nn as nn

class BatchNorm2d(nn.Module):
    def __init__(self, num_features, eps=1e-5, momentum=0.1):
        super().__init__()
        self.eps = eps
        self.momentum = momentum
        # 可学习参数
        self.gamma = nn.Parameter(torch.ones(1, num_features, 1, 1))
        self.beta = nn.Parameter(torch.zeros(1, num_features, 1, 1))
        # 统计量（不参与梯度更新）
        self.register_buffer('running_mean', torch.zeros(1, num_features, 1, 1))
        self.register_buffer('running_var', torch.ones(1, num_features, 1, 1))

    def forward(self, x, training=True):
        if training:
            # BN 在 (B, H, W) 维度上算均值，保留 C 维度
            mean = x.mean(dim=(0, 2, 3), keepdim=True)
            var = x.var(dim=(0, 2, 3), keepdim=True, unbiased=False)
          
            # 更新指数移动平均
            self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * mean
            self.running_var = (1 - self.momentum) * self.running_var + self.momentum * var
        else:
            mean = self.running_mean
            var = self.running_var

        x_hat = (x - mean) / torch.sqrt(var + self.eps)
        return self.gamma * x_hat + self.beta
```

#### 4. Softmax 和交叉熵损失

```Python
import torch

def stable_softmax(logits, dim=-1):
    """
    数值稳定的 Softmax 实现
    """
    # 1. 减去最大值，防止 exp 溢出
    # keepdim=True 保证形状可以广播
    max_logits = torch.max(logits, dim=dim, keepdim=True)[0]
    exp_logits = torch.exp(logits - max_logits)
    
    # 2. 归一化
    sum_exp_logits = torch.sum(exp_logits, dim=dim, keepdim=True)
    probs = exp_logits / sum_exp_logits
    return probs

def cross_entropy_loss(logits, targets):
    """
    手写交叉熵 Loss
    logits: [batch, vocab]
    targets: [batch] 类别索引
    """
    batch_size = logits.shape[0]
    
    # 1. 数值稳定的 LogSoftmax
    # log(softmax(x)) = x - max(x) - log(sum(exp(x - max(x))))
    max_logits = torch.max(logits, dim=1, keepdim=True)[0]
    log_sum_exp = max_logits + torch.log(torch.sum(torch.exp(logits - max_logits), dim=1, keepdim=True))
    log_probs = logits - log_sum_exp
    
    # 2. NLL Loss (Negative Log Likelihood)
    # 取出目标类别对应的 log 概率
    # targets 需要 unsqueeze 才能 gather
    target_log_probs = log_probs.gather(1, targets.unsqueeze(1)).squeeze(1)
    
    # 3. 取平均
    loss = -torch.mean(target_log_probs)
    return loss
```

#### 5. 旋转位置编码

```Python
import torch

def precompute_freqs_cis(dim, max_seq_len, theta=10000.0, device=None, dtype=torch.float32):
    """
    预计算旋转角度的 cos 和 sin 值
    dim: 特征维度，必须是偶数
    max_seq_len: 最大序列长度
    theta: base 频率参数，通常为 10000

    返回:
        cos: (max_seq_len, dim//2)
        sin: (max_seq_len, dim//2)
    """
    assert dim % 2 == 0, "维度必须为偶数"

    # i = 0, 2, 4, ..., dim-2
    i = torch.arange(0, dim, 2, device=device, dtype=dtype)

    # freqs.shape = (dim//2,)
    freqs = 1.0 / (theta ** (i / dim))

    # t.shape = (max_seq_len,)
    t = torch.arange(max_seq_len, device=device, dtype=dtype)

    # angles.shape = (max_seq_len, dim//2)
    angles = torch.outer(t, freqs)

    cos = torch.cos(angles)
    sin = torch.sin(angles)
    return cos, sin

def apply_rotary_emb(x, cos, sin):
    """
    对输入张量 x 应用旋转位置编码

    x:
        - (seq_len, dim)
        - 或 (batch_size, seq_len, dim)
        - 或更高维 (..., seq_len, dim)
    cos, sin:
        - (seq_len, dim//2)

    返回:
        编码后的张量，形状与 x 相同
    """
    orig_shape = x.shape
    seq_len = x.shape[-2]
    d = x.shape[-1]
    assert d % 2 == 0 # 最后一维必须为偶数"
    assert cos.shape == (seq_len, d // 2)
    assert sin.shape == (seq_len, d // 2)

    # (..., seq_len, d) -> (..., seq_len, d//2, 2)
    x_reshaped = x.reshape(*orig_shape[:-1], d // 2, 2)

    # 取每对中的两个分量
    x_even = x_reshaped[..., 0]   # (..., seq_len, d//2)
    x_odd = x_reshaped[..., 1]    # (..., seq_len, d//2)

    # 为了和 batch/head 维广播对齐，把 cos/sin 扩成:
    # (1, ..., 1, seq_len, d//2)
    while cos.ndim < x_even.ndim:
        cos = cos.unsqueeze(0)
        sin = sin.unsqueeze(0)

    # 应用旋转
    rotated_even = x_even * cos - x_odd * sin
    rotated_odd = x_even * sin + x_odd * cos

    # (..., seq_len, d//2, 2)
    rotated = torch.stack([rotated_even, rotated_odd], dim=-1)

    # reshape 回原始形状
    return rotated.reshape(*orig_shape)
```

#### 6. LoRA

```Python
import torch
import torch.nn as nn
import torch.nn.init as init

class LoRA(nn.Module):
    def __init__(self, in_features, out_features, rank, alpha):
        super().__init__()
        self.rank = rank
        self.alpha = alpha
        self.scaling = alpha / rank if rank > 0 else 0.0

        self.base = nn.Linear(in_features, out_features, bias=False)
        for p in self.base.parameters():
            p.requires_grad = False

        if rank > 0:
            self.A = nn.Linear(in_features, rank, bias=False)
            self.B = nn.Linear(rank, out_features, bias=False)
            # 矩阵A高斯初始化
            init.normal_(self.A.weight, mean=0.0, std=0.02)
            # 矩阵B全0初始化
            init.zeros(self.B.weight)
        else:
            self.A = None
            self.B = None

    def forward(self, x):
        out = self.base(x)
        if self.rank > 0:
            out = out + self.B(self.A(x)) * self.scaling
        return out
```

#### 7. DPO 损失

```Python
import torch
import torch.nn.functional as F
 
def dpo_loss(pi_logps_w, pi_logps_l, ref_logps_w, ref_logps_l, beta=0.1):
    """
    DPO 损失
    Args:
        pi_logps_w: 当前策略下 winner 响应的对数概率
        pi_logps_l: 当前策略下 loser 响应的对数概率
        ref_logps_w: 参考策略下 winner 响应的对数概率
        ref_logps_l: 参考策略下 loser 响应的对数概率
        beta: 温度参数
    Returns:
        损失标量
    """
    # 计算对数比
    log_ratio_w = pi_logps_w - ref_logps_w
    log_ratio_l = pi_logps_l - ref_logps_l
    # 内部差值
    diff = beta * (log_ratio_w - log_ratio_l)
    # 损失 = -log(sigmoid(diff))
    loss = -F.logsigmoid(diff).mean()
    return loss
```

### 传统算法相关手撕

#### 1. 反向传播

#### 2. K-means

#### 3. KNN

#### 4. 线性回归

## ACM 模式--输入输出处理

### 基础输入输出

### 链表构造

```Python
# 定义链表
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
# 构建链表
def bulid_linked_list(arr, pos):
    dummy = ListNode(0)
    cur = dummy
    for val in arr:
        cur.next = ListNode(val)
        cur = cur.next
    return dummy.next

# 环形链表
def bulid_linked_list(arr, pos):
    dummy = ListNode(0)
    cur = dummy
    cycle_node = None

    for i, val in enumerate(arr):
        cur.next = ListNode(val)
        cur = cur.next
        if i == pos:
            cycle_node = cur
    if pos != -1:
        cur.next = cycle_node

    return dummy.next
```


### 二叉树构造

```Python
# 定义二叉树
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
# 构建二叉树
def build_tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    q = deque([root])
    i = 1
    while q and i < len(values):
        node = q.popleft()
        if values[i] is not None:
            node.left = TreeNode(values[i])
            q.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            q.append(node.right)
        i += 1
    return root
```
