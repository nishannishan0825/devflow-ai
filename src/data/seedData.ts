import type {
  StudyTask,
  CodingProblem,
  SmartNote,
  NoteCategory,
  FocusSession,
  ActivityItem,
  AppSettings,
} from '../types';

export const initialCategories: NoteCategory[] = [
  { id: 'cat-1', name: 'DSA Cheatsheet', color: 'purple' },
  { id: 'cat-2', name: 'System Design', color: 'blue' },
  { id: 'cat-3', name: 'Algorithms', color: 'cyan' },
  { id: 'cat-4', name: 'Interview Prep', color: 'amber' },
  { id: 'cat-5', name: 'Daily Dev Log', color: 'emerald' },
];

export const initialTasks: StudyTask[] = [
  {
    id: 'task-1',
    title: 'Arrays & Hashing Patterns',
    description: 'Solve prefix sum and hash map frequency bucket problems',
    durationMinutes: 120,
    durationLabel: '2h',
    day: 'Mon',
    date: '2026-10-06',
    type: 'DSA',
    priority: 'high',
    completed: true,
    completedAt: '2026-10-06T11:30:00.000Z',
    createdAt: '2026-10-05T09:00:00.000Z',
  },
  {
    id: 'task-2',
    title: 'LeetCode 75 Warmup (3 Easy)',
    description: 'Two Sum, Valid Anagram, Contains Duplicate',
    durationMinutes: 90,
    durationLabel: '1.5h',
    day: 'Mon',
    date: '2026-10-06',
    type: 'Practice',
    priority: 'medium',
    completed: true,
    completedAt: '2026-10-06T15:45:00.000Z',
    createdAt: '2026-10-05T09:10:00.000Z',
  },
  {
    id: 'task-3',
    title: 'Two Pointers Pattern (3Sum & Container)',
    description: 'Master left-right pointers and opposite direction scan',
    durationMinutes: 90,
    durationLabel: '1.5h',
    day: 'Tue',
    date: '2026-10-07',
    type: 'DSA',
    priority: 'high',
    completed: true,
    completedAt: '2026-10-07T14:00:00.000Z',
    createdAt: '2026-10-05T10:00:00.000Z',
  },
  {
    id: 'task-4',
    title: 'System Design: Rate Limiter Architecture',
    description: 'Token bucket vs Leaky bucket with Redis implementation',
    durationMinutes: 60,
    durationLabel: '1h',
    day: 'Tue',
    date: '2026-10-07',
    type: 'Study',
    priority: 'medium',
    completed: true,
    completedAt: '2026-10-07T18:00:00.000Z',
    createdAt: '2026-10-05T10:05:00.000Z',
  },
  {
    id: 'task-5',
    title: 'Sliding Window (Minimum Window Substring)',
    description: 'Solve variable size and fixed size window problems',
    durationMinutes: 120,
    durationLabel: '2h',
    day: 'Wed',
    date: '2026-10-08',
    type: 'DSA',
    priority: 'high',
    completed: true,
    completedAt: '2026-10-08T16:20:00.000Z',
    createdAt: '2026-10-05T10:10:00.000Z',
  },
  {
    id: 'task-6',
    title: 'Mock Behavioral & System Architecture Prep',
    description: 'STAR method answers for past engineering leadership',
    durationMinutes: 60,
    durationLabel: '1h',
    day: 'Wed',
    date: '2026-10-08',
    type: 'Interview',
    priority: 'medium',
    completed: false,
    createdAt: '2026-10-05T10:15:00.000Z',
  },
  {
    id: 'task-7',
    title: 'Binary Search in Rotated Sorted Array',
    description: 'Understand inflection points and conditional bounds',
    durationMinutes: 120,
    durationLabel: '2h',
    day: 'Thu',
    date: '2026-10-09',
    type: 'DSA',
    priority: 'high',
    completed: true,
    completedAt: '2026-10-09T17:00:00.000Z',
    createdAt: '2026-10-05T10:20:00.000Z',
  },
  {
    id: 'task-8',
    title: 'LeetCode Medium Daily Grind ×2',
    description: 'Search in 2D Matrix & Koko Eating Bananas',
    durationMinutes: 120,
    durationLabel: '2h',
    day: 'Thu',
    date: '2026-10-09',
    type: 'Practice',
    priority: 'medium',
    completed: true,
    completedAt: '2026-10-09T20:30:00.000Z',
    createdAt: '2026-10-05T10:25:00.000Z',
  },
  {
    id: 'task-9',
    title: 'Linked List Reversal & Fast/Slow Pointers',
    description: 'Reverse Linked List II, LRU Cache structure',
    durationMinutes: 120,
    durationLabel: '2h',
    day: 'Fri',
    date: '2026-10-10',
    type: 'DSA',
    priority: 'high',
    completed: true,
    completedAt: '2026-10-10T16:00:00.000Z',
    createdAt: '2026-10-05T10:30:00.000Z',
  },
  {
    id: 'task-10',
    title: 'Weekly Knowledge Consolidation & Flashcards',
    description: 'Review Anki decks for Big-O and Tree Traversals',
    durationMinutes: 60,
    durationLabel: '1h',
    day: 'Fri',
    date: '2026-10-10',
    type: 'Review',
    priority: 'low',
    completed: false,
    createdAt: '2026-10-05T10:35:00.000Z',
  },
  {
    id: 'task-11',
    title: 'Binary Trees & BFS/DFS Deep Dive',
    description: 'Level order traversal, Lowest Common Ancestor, Max Path Sum',
    durationMinutes: 180,
    durationLabel: '3h',
    day: 'Sat',
    date: '2026-10-11',
    type: 'DSA',
    priority: 'high',
    completed: false,
    createdAt: '2026-10-05T10:40:00.000Z',
  },
  {
    id: 'task-12',
    title: 'Weekly Biweekly Contest Simulation',
    description: 'Timed contest simulation with 4 algorithmic problems',
    durationMinutes: 120,
    durationLabel: '2h',
    day: 'Sat',
    date: '2026-10-11',
    type: 'Practice',
    priority: 'high',
    completed: false,
    createdAt: '2026-10-05T10:45:00.000Z',
  },
  {
    id: 'task-13',
    title: 'Dynamic Programming: Knapsack & Subsequences',
    description: '0/1 Knapsack, Coin Change, Longest Common Subsequence',
    durationMinutes: 90,
    durationLabel: '1.5h',
    day: 'Sun',
    date: '2026-10-12',
    type: 'DSA',
    priority: 'high',
    completed: false,
    createdAt: '2026-10-05T10:50:00.000Z',
  },
  {
    id: 'task-14',
    title: 'Weekly Roadmap Planning & Backlog Grooming',
    description: 'Review strengths/weaknesses and set next sprint goals',
    durationMinutes: 30,
    durationLabel: '30m',
    day: 'Sun',
    date: '2026-10-12',
    type: 'Planning',
    priority: 'low',
    completed: false,
    createdAt: '2026-10-05T10:55:00.000Z',
  },
];

export const initialProblems: CodingProblem[] = [
  {
    id: 'prob-1',
    title: 'Two Sum',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'Easy',
    topic: 'Arrays',
    status: 'solved',
    acceptance: 52.4,
    notes: 'Use a hash map to store complement (target - num) with index in one pass O(N) time and O(N) space.',
    code: `def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    language: 'python',
    starred: true,
    solvedAt: '2026-10-09T14:20:00.000Z',
    createdAt: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'prob-2',
    title: 'Add Two Numbers',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/add-two-numbers/',
    difficulty: 'Medium',
    topic: 'Linked List',
    status: 'solved',
    acceptance: 43.1,
    notes: 'Keep track of carry while iterating through both linked lists. Dummy head simplifies construction.',
    code: `def addTwoNumbers(l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
    dummy = ListNode(0)
    curr = dummy
    carry = 0
    while l1 or l2 or carry:
        val1 = l1.val if l1 else 0
        val2 = l2.val if l2 else 0
        total = val1 + val2 + carry
        carry = total // 10
        curr.next = ListNode(total % 10)
        curr = curr.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next`,
    language: 'python',
    starred: false,
    solvedAt: '2026-10-09T16:00:00.000Z',
    createdAt: '2026-10-01T08:30:00.000Z',
  },
  {
    id: 'prob-3',
    title: 'Longest Substring Without Repeating Characters',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    status: 'solved',
    acceptance: 35.8,
    notes: 'Sliding window with hash map storing the last seen index of each character to jump left pointer.',
    code: `def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    max_len = 0
    left = 0
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
    language: 'python',
    starred: true,
    solvedAt: '2026-10-10T11:00:00.000Z',
    createdAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'prob-4',
    title: 'Median of Two Sorted Arrays',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
    difficulty: 'Hard',
    topic: 'Binary Search',
    status: 'attempted',
    acceptance: 39.2,
    notes: 'Binary search on partition of the smaller array to achieve O(log(min(m, n))) time.',
    code: `# Binary search on partition
def findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:
    # Ensure nums1 is the smaller array
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    # Implement partition logic...`,
    language: 'python',
    starred: true,
    createdAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'prob-5',
    title: 'Longest Palindromic Substring',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/longest-palindromic-substring/',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    status: 'solved',
    acceptance: 34.5,
    notes: 'Expand around center approach for odd and even length palindromes in O(N^2) time & O(1) space.',
    code: `def longestPalindrome(s: str) -> str:
    res = ""
    for i in range(len(s)):
        # Odd length
        l, r = i, i
        while l >= 0 and r < len(s) and s[l] == s[r]:
            if (r - l + 1) > len(res):
                res = s[l:r+1]
            l -= 1
            r += 1
        # Even length
        l, r = i, i + 1
        while l >= 0 and r < len(s) and s[l] == s[r]:
            if (r - l + 1) > len(res):
                res = s[l:r+1]
            l -= 1
            r += 1
    return res`,
    language: 'python',
    starred: false,
    solvedAt: '2026-10-08T18:30:00.000Z',
    createdAt: '2026-10-02T11:00:00.000Z',
  },
  {
    id: 'prob-6',
    title: 'Detect Cycle in a Directed Graph',
    platform: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/detect-cycle-in-a-graph/',
    difficulty: 'Medium',
    topic: 'Graphs',
    status: 'solved',
    acceptance: 42.0,
    notes: 'DFS with recursion stack tracker array or Kahn algorithm (topological sorting indegrees).',
    code: `def isCyclic(V: int, adj: list[list[int]]) -> bool:
    visited = [False] * V
    recStack = [False] * V
    
    def dfs(u):
        visited[u] = True
        recStack[u] = True
        for v in adj[u]:
            if not visited[v] and dfs(v):
                return True
            elif recStack[v]:
                return True
        recStack[u] = False
        return False
        
    for i in range(V):
        if not visited[i] and dfs(i):
            return True
    return False`,
    language: 'python',
    starred: true,
    solvedAt: '2026-10-09T19:00:00.000Z',
    createdAt: '2026-10-03T09:00:00.000Z',
  },
  {
    id: 'prob-7',
    title: 'Reverse Integer',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/reverse-integer/',
    difficulty: 'Medium',
    topic: 'Math',
    status: 'solved',
    acceptance: 28.7,
    notes: 'Extract digits modulo 10 and verify 32-bit signed integer boundary overflow limits.',
    code: `def reverse(x: int) -> int:
    sign = -1 if x < 0 else 1
    x = abs(x)
    rev = 0
    while x > 0:
        rev = rev * 10 + x % 10
        x //= 10
    rev *= sign
    if rev < -2**31 or rev > 2**31 - 1:
        return 0
    return rev`,
    language: 'python',
    starred: false,
    solvedAt: '2026-10-07T14:10:00.000Z',
    createdAt: '2026-10-03T10:00:00.000Z',
  },
  {
    id: 'prob-8',
    title: 'Kth Smallest Element in a BST',
    platform: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/find-k-th-smallest-element-in-bst/',
    difficulty: 'Medium',
    topic: 'Trees',
    status: 'solved',
    acceptance: 69.3,
    notes: 'In-order traversal yields sorted elements of BST. Stop at the k-th node.',
    code: `def kthSmallest(root: Optional[TreeNode], k: int) -> int:
    stack = []
    curr = root
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        k -= 1
        if k == 0:
            return curr.val
        curr = curr.right
    return -1`,
    language: 'python',
    starred: false,
    solvedAt: '2026-10-09T21:00:00.000Z',
    createdAt: '2026-10-04T12:00:00.000Z',
  },
  {
    id: 'prob-9',
    title: 'Trapping Rain Water',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/trapping-rain-water/',
    difficulty: 'Hard',
    topic: 'Two Pointers',
    status: 'revision',
    acceptance: 61.2,
    notes: 'Two pointer approach tracking max_left and max_right to compute trapped water in O(N) time O(1) space.',
    code: `def trap(height: list[int]) -> int:
    if not height: return 0
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    water = 0
    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            water += left_max - height[l]
        else:
            r -= 1
            right_max = max(right_max, height[r])
            water += right_max - height[r]
    return water`,
    language: 'python',
    starred: true,
    solvedAt: '2026-10-06T17:00:00.000Z',
    createdAt: '2026-10-04T15:00:00.000Z',
  },
  {
    id: 'prob-10',
    title: 'Top K Frequent Elements',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/top-k-frequent-elements/',
    difficulty: 'Medium',
    topic: 'Arrays',
    status: 'solved',
    acceptance: 63.8,
    notes: 'Bucket sort frequency array achieves linear O(N) time complexity.',
    code: `def topKFrequent(nums: list[int], k: int) -> list[int]:
    count = {}
    freq = [[] for _ in range(len(nums) + 1)]
    for n in nums:
        count[n] = 1 + count.get(n, 0)
    for n, c in count.items():
        freq[c].append(n)
    res = []
    for i in range(len(freq) - 1, 0, -1):
        for n in freq[i]:
            res.append(n)
            if len(res) == k:
                return res`,
    language: 'python',
    starred: false,
    solvedAt: '2026-10-10T15:30:00.000Z',
    createdAt: '2026-10-05T11:00:00.000Z',
  },
];

export const initialNotes: SmartNote[] = [
  {
    id: 'note-1',
    title: 'Binary Search Mastery & Edge Cases',
    category: 'Algorithms',
    tags: ['Binary Search', 'Templates', 'O(log n)'],
    pinned: true,
    createdAt: '2026-10-05T10:00:00.000Z',
    updatedAt: '2026-10-10T18:00:00.000Z',
    content: `# Binary Search Mastery & Edge Cases

Binary search is an optimal technique for search spaces with monotonic behavior.

## Core Templates

### Template 1: Exact Value Search
\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\`

### Template 2: Lower Bound (First occurrence >= target)
\`\`\`python
def lower_bound(arr, target):
    left, right = 0, len(arr)
    while left < right:
        mid = left + (right - left) // 2
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left
\`\`\`

## Key Takeaways
- Always compute \`mid = left + (right - left) // 2\` to prevent potential 32-bit integer overflow.
- Confirm monotonicity before applying binary search on answer patterns!
`,
  },
  {
    id: 'note-2',
    title: 'System Design: Scalable Rate Limiting',
    category: 'System Design',
    tags: ['Distributed Systems', 'Redis', 'Architecture'],
    pinned: true,
    createdAt: '2026-10-06T14:30:00.000Z',
    updatedAt: '2026-10-09T20:15:00.000Z',
    content: `# Scalable Rate Limiter Architecture

Rate limiting prevents cascading failures, DDoS spikes, and resource starvation.

## Common Algorithms

1. **Token Bucket**
   - Refills tokens at constant rate up to bucket capacity.
   - Allows brief burst traffic while enforcing average rate.
2. **Leaky Bucket**
   - Requests enter queue and are processed at fixed FIFO rate.
   - Smooths out bursts into steady flow.
3. **Sliding Window Log**
   - Keeps sorted timestamps in Redis sorted sets.
   - Very accurate but memory intensive.
4. **Sliding Window Counter**
   - Hybrid between fixed window and sliding window.
   - Low memory, smooth approximation.

## High Level Diagram

\`\`\`
Client -> API Gateway (Envoy / Kong) -> Redis Cluster (Lua Scripts) -> Microservices
\`\`\`

> Use Redis with Lua scripting to ensure atomic increments and window checks!
`,
  },
  {
    id: 'note-3',
    title: 'Dynamic Programming Patterns Cheatsheet',
    category: 'DSA Cheatsheet',
    tags: ['DP', 'Knapsack', 'LCS', 'Memoization'],
    pinned: false,
    createdAt: '2026-10-07T11:00:00.000Z',
    updatedAt: '2026-10-08T19:40:00.000Z',
    content: `# Dynamic Programming Patterns

## The 6 Standard DP Archetypes

1. **0/1 Knapsack**: Pick or skip items with bounded capacity.
2. **Unbounded Knapsack**: Pick items multiple times (e.g., Coin Change).
3. **Longest Common Subsequence (LCS)**: 2D matrix matching characters.
4. **Longest Increasing Subsequence (LIS)**: O(N log N) patience sorting or O(N^2) DP.
5. **Matrix Chain Multiplication / Interval DP**: Solve sub-ranges \`dp[i][j]\`.
6. **State Machine / Stock Trading**: State transitions between Hold, Free, Cooldown.

\`\`\`python
# Classic 0/1 Knapsack
dp = [0] * (capacity + 1)
for weight, value in items:
    for w in range(capacity, weight - 1, -1):
        dp[w] = max(dp[w], dp[w - weight] + value)
\`\`\`
`,
  },
];

export const initialFocusSessions: FocusSession[] = [
  {
    id: 'foc-1',
    mode: 'focus',
    durationMinutes: 25,
    completedAt: '2026-10-10T14:30:00.000Z',
    taskTitle: 'Binary Search in Rotated Sorted Array',
  },
  {
    id: 'foc-2',
    mode: 'focus',
    durationMinutes: 25,
    completedAt: '2026-10-10T15:05:00.000Z',
    taskTitle: 'Sliding Window Practice',
  },
  {
    id: 'foc-3',
    mode: 'shortBreak',
    durationMinutes: 5,
    completedAt: '2026-10-10T15:35:00.000Z',
  },
  {
    id: 'foc-4',
    mode: 'focus',
    durationMinutes: 25,
    completedAt: '2026-10-10T16:05:00.000Z',
    taskTitle: 'Linked List Reversal',
  },
];

export const initialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'problem_solved',
    title: 'Solved: Top K Frequent Elements',
    subtitle: 'LeetCode · Arrays · Medium',
    timestamp: '2026-10-10T15:30:00.000Z',
    tag: 'Medium',
    tagVariant: 'amber',
  },
  {
    id: 'act-2',
    type: 'task_completed',
    title: 'Completed Study Task',
    subtitle: 'Linked List Reversal & Fast/Slow Pointers (2h)',
    timestamp: '2026-10-10T16:00:00.000Z',
    tag: 'Study',
    tagVariant: 'purple',
  },
  {
    id: 'act-3',
    type: 'focus_completed',
    title: 'Completed Pomodoro Focus',
    subtitle: '25 min deep work session',
    timestamp: '2026-10-10T16:05:00.000Z',
    tag: 'Focus',
    tagVariant: 'blue',
  },
  {
    id: 'act-4',
    type: 'streak_milestone',
    title: 'Streak Milestone Reached!',
    subtitle: '7-day consecutive learning streak',
    timestamp: '2026-10-10T09:00:00.000Z',
    tag: 'Streak',
    tagVariant: 'emerald',
  },
  {
    id: 'act-5',
    type: 'problem_solved',
    title: 'Solved: Longest Substring Without Repeating Characters',
    subtitle: 'LeetCode · Sliding Window · Medium',
    timestamp: '2026-10-10T11:00:00.000Z',
    tag: 'Medium',
    tagVariant: 'amber',
  },
];

export const initialSettings: AppSettings = {
  profile: {
    name: 'Dev User',
    username: 'devuser',
    email: 'devuser@devflow.ai',
    location: 'San Francisco, CA',
    bio: 'Passionate developer & student grinding DSA and modern fullstack systems.',
    avatarText: 'D',
    plan: 'Pro Plan',
  },
  pomodoro: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    autoStartBreaks: false,
    autoStartFocus: false,
  },
  appearance: {
    darkMode: true,
    accentColor: 'purple',
    compactSidebar: false,
    animations: true,
    fontSize: 'Medium',
    language: 'English',
  },
  notifications: {
    dailyReminder: true,
    streakAlert: true,
    newContent: false,
    weeklyReport: true,
    browser: false,
  },
  ai: {
    autoHints: true,
    voiceEnabled: true,
    contextAware: true,
    learningMode: false,
    dataCollection: false,
    model: 'Balanced',
  },
};
