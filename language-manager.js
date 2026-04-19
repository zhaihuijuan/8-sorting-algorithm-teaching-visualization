/**
 * 语言管理器 - 负责多语言支持和界面文本切换
 * Language Manager - Handles multilingual support and interface text switching
 */

class LanguageManager {
    constructor() {
        this.currentLanguage = 'zh'; // 默认中文
        this.translations = {
            zh: {
                // 页面标题和基础文本
                pageTitle: '八大排序算法可视化',
                
                // 控制面板文本
                algorithmLabel: '排序算法:',
                arraySizeLabel: '数组大小:',
                sortSpeedLabel: '排序速度:',
                speedUnit: 'ms(柱体移动一次耗时)',
                displayModeLabel: '显示模式:',
                
                // 按钮文本
                generateArray: '生成新数组',
                startSort: '开始排序',
                pauseSort: '暂停',
                resumeSort: '继续',
                resetSort: '重置',
                complexityCompare: '复杂度对比',
                teachingMode: '教学模式',
                languageToggle: '中文',
                
                // 工具提示
                tooltips: {
                    generateArray: '生成随机数组',
                    startSort: '开始排序动画',
                    pauseSort: '暂停排序',
                    resumeSort: '继续排序',
                    resetSort: '重置到初始状态',
                    complexityCompare: '查看算法复杂度对比表',
                    teachingMode: '启用教学模式',
                    languageToggle: '切换语言'
                },
                
                // 算法名称
                algorithms: {
                    bubbleSort: '冒泡排序',
                    selectionSort: '选择排序',
                    insertionSort: '插入排序',
                    mergeSort: '归并排序',
                    quickSort: '快速排序',
                    heapSort: '堆排序',
                    countingSort: '计数排序',
                    radixSort: '基数排序'
                },
                
                // 显示模式
                displayModes: {
                    steps: '步骤说明',
                    code: '带注释的代码'
                },
                
                // 信息面板标题
                algorithmInfoTitle: '算法信息',
                statsTitle: '实时统计',
                codeTitle: '算法代码',
                stepsTitle: '当前步骤',
                
                // 统计标签
                stats: {
                    comparisons: '比较次数',
                    swaps: '交换次数',
                    elapsedTime: '耗时',
                    sortedCount: '已排序',
                    pointerPosition: '指针位置'
                },
                
                // 颜色图例
                colorLegend: {
                    title: '颜色含义'
                },
                
                // 复杂度相关
                complexity: {
                    timeComplexityTitle: '时间复杂度:',
                    timeBest: '最好情况:',
                    timeAverage: '平均情况:',
                    timeWorst: '最坏情况:',
                    spaceComplexityTitle: '空间复杂度:',
                    stabilityTitle: '稳定性:',
                    stable: '稳定',
                    unstable: '不稳定'
                },
                
                // 默认消息
                defaultMessages: {
                    selectAlgorithm: '请选择一个排序算法查看详细信息。',
                    readyToSort: '准备开始排序...',
                    selectAlgorithmCode: '// 选择一个算法查看代码'
                },
                
                // 状态文本
                states: {
                    waiting: '待排',
                    comparing: '比较',
                    moving: '移动',
                    inserting: '待插',
                    swapping: '交换',
                    completed: '完成',
                    marked: '标记'
                },
                
                // 算法代码（中文注释版本）
                algorithmCodes: {
                    bubbleSort: `// 冒泡排序 - Bubble Sort
function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            // 比较相邻元素
            if (arr[j] > arr[j + 1]) {
                // 交换元素
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        // 如果没有交换，数组已排序
        if (!swapped) break;
    }
    return arr;
}`,
                    selectionSort: `// 选择排序 - Selection Sort
function selectionSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        // 找到最小元素的索引
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        // 交换最小元素到正确位置
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
    }
    return arr;
}`,
                    insertionSort: `// 插入排序 - Insertion Sort
function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let current = arr[i];
        let j = i - 1;
        
        // 将当前元素插入到正确位置
        while (j >= 0 && arr[j] > current) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = current;
    }
    return arr;
}`,
                    mergeSort: `// 归并排序 - Merge Sort
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;
    
    // 合并两个有序数组
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    
    return result.concat(left.slice(i), right.slice(j));
}`,
                    quickSort: `// 快速排序 - Quick Sort
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // 分区操作
        const pivotIndex = partition(arr, low, high);
        
        // 递归排序左右子数组
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}`,
                    heapSort: `// 堆排序 - Heap Sort
function heapSort(arr) {
    const n = arr.length;
    
    // 构建最大堆
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // 逐个提取元素
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
    return arr;
}

function heapify(arr, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
    }
}`,
                    countingSort: `// 计数排序 - Counting Sort
function countingSort(arr) {
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    const range = max - min + 1;
    const count = new Array(range).fill(0);
    
    // 计数
    for (let i = 0; i < arr.length; i++) {
        count[arr[i] - min]++;
    }
    
    // 重构数组
    let index = 0;
    for (let i = 0; i < range; i++) {
        while (count[i] > 0) {
            arr[index++] = i + min;
            count[i]--;
        }
    }
    return arr;
}`,
                    radixSort: `// 基数排序 - Radix Sort
function radixSort(arr) {
    const max = Math.max(...arr);
    
    // 对每一位进行计数排序
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        countingSortByDigit(arr, exp);
    }
    return arr;
}

function countingSortByDigit(arr, exp) {
    const n = arr.length;
    const output = new Array(n);
    const count = new Array(10).fill(0);
    
    // 计数
    for (let i = 0; i < n; i++) {
        const digit = Math.floor(arr[i] / exp) % 10;
        count[digit]++;
    }
    
    // 累积计数
    for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }
    
    // 构建输出数组
    for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    
    // 复制回原数组
    for (let i = 0; i < n; i++) {
        arr[i] = output[i];
    }
}`
                },
                
                // 模态框
                modal: {
                    algorithmIntro: '算法介绍',
                    complexityComparison: '算法复杂度对比表',
                    understood: '我已了解',
                    close: '关闭'
                },
                
                // 算法详细信息
                algorithmDetails: {
                    bubbleSort: {
                        description: '冒泡排序是一种简单的排序算法，通过重复遍历数组，比较相邻元素并交换位置来排序。',
                        workingPrinciple: '比较相邻的元素，如果顺序错误就交换它们，重复这个过程直到没有需要交换的元素。',
                        useCases: '适用于小规模数据排序，教学演示',
                        advantages: ['实现简单', '稳定排序', '原地排序'],
                        disadvantages: ['时间复杂度高', '效率低下', '不适合大数据'],
                        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
                        spaceComplexity: 'O(1)',
                        stable: true
                    },
                    selectionSort: {
                        description: '选择排序通过在未排序部分找到最小元素，然后将其放到已排序部分的末尾。',
                        workingPrinciple: '每次从未排序的部分选择最小的元素，将其与未排序部分的第一个元素交换。',
                        useCases: '内存受限的环境，小规模数据',
                        advantages: ['实现简单', '原地排序', '交换次数少'],
                        disadvantages: ['时间复杂度高', '不稳定', '不适合大数据'],
                        timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
                        spaceComplexity: 'O(1)',
                        stable: false
                    },
                    insertionSort: {
                        description: '插入排序通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。',
                        workingPrinciple: '将数组分为已排序和未排序两部分，每次取未排序部分的第一个元素插入到已排序部分的正确位置。',
                        useCases: '小规模数据，部分有序数据，在线算法',
                        advantages: ['实现简单', '稳定排序', '原地排序', '对部分有序数据效率高'],
                        disadvantages: ['时间复杂度高', '不适合大数据'],
                        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
                        spaceComplexity: 'O(1)',
                        stable: true
                    },
                    mergeSort: {
                        description: '归并排序采用分治法，将数组分成两半，分别排序后再合并。',
                        workingPrinciple: '递归地将数组分成两半，直到每部分只有一个元素，然后将这些部分合并成有序数组。',
                        useCases: '大规模数据，需要稳定排序，外部排序',
                        advantages: ['稳定排序', '时间复杂度稳定', '适合大数据'],
                        disadvantages: ['需要额外空间', '不是原地排序'],
                        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
                        spaceComplexity: 'O(n)',
                        stable: true
                    },
                    quickSort: {
                        description: '快速排序使用分治法，选择一个基准元素，将数组分为小于和大于基准的两部分，然后递归排序。',
                        workingPrinciple: '选择基准元素，将数组分区，使得基准左边的元素都小于基准，右边的都大于基准，然后递归处理两个分区。',
                        useCases: '大规模数据，一般用途排序，系统排序',
                        advantages: ['平均性能优秀', '原地排序', '实际应用广泛'],
                        disadvantages: ['最坏情况性能差', '不稳定', '递归深度可能很大'],
                        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
                        spaceComplexity: 'O(log n)',
                        stable: false
                    },
                    heapSort: {
                        description: '堆排序利用堆这种数据结构设计的排序算法，将数组构建成最大堆，然后逐个提取最大元素。',
                        workingPrinciple: '构建最大堆，将堆顶（最大元素）与末尾元素交换，然后重新调整堆，重复此过程。',
                        useCases: '需要稳定时间复杂度，内存受限环境',
                        advantages: ['时间复杂度稳定', '原地排序', '不受输入数据影响'],
                        disadvantages: ['不稳定', '常数因子较大', '缓存性能差'],
                        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
                        spaceComplexity: 'O(1)',
                        stable: false
                    },
                    countingSort: {
                        description: '计数排序是非比较排序，通过统计每个元素出现的次数来排序，适用于整数且范围不大的情况。',
                        workingPrinciple: '统计每个元素的出现次数，然后根据计数信息重构有序数组。',
                        useCases: '整数排序，范围较小的数据，基数排序的子过程',
                        advantages: ['线性时间复杂度', '稳定排序', '不基于比较'],
                        disadvantages: ['需要额外空间', '只适用于整数', '范围受限'],
                        timeComplexity: { best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n+k)' },
                        spaceComplexity: 'O(k)',
                        stable: true
                    },
                    radixSort: {
                        description: '基数排序是非比较排序，按照数字的每一位进行排序，从最低位到最高位依次排序。',
                        workingPrinciple: '将整数按位数切割成不同的数字，然后按每个位数分别比较排序。',
                        useCases: '大量整数排序，字符串排序，多关键字排序',
                        advantages: ['线性时间复杂度', '稳定排序', '适合大量数据'],
                        disadvantages: ['需要额外空间', '只适用于整数', '位数影响性能'],
                        timeComplexity: { best: 'O(d(n+k))', average: 'O(d(n+k))', worst: 'O(d(n+k))' },
                        spaceComplexity: 'O(n+k)',
                        stable: true
                    }
                },
                
                // 步骤描述模板
                stepDescriptions: {
                    comparing: '比较: {value1} 与 {value2}',
                    swapping: '交换: 位置 {pos1} 和 {pos2}',
                    moving: '移动: 将 {value} 移动到位置 {pos}',
                    partitioning: '分区: 基准 {pivot}，左区间 [{left}, {right}]',
                    merging: '合并: 区间 [{left}, {mid}] 和 [{mid1}, {right}]',
                    heapifying: '堆化: 调整位置 {pos}',
                    counting: '计数: 统计元素 {value}',
                    digitSort: '按第 {digit} 位排序',
                    completed: '{algorithm} 排序完成！',
                    paused: '排序已暂停',
                    resumed: '继续排序...',
                    reset: '已重置到初始状态'
                },
                
                // 详细步骤描述模板
                detailedStepDescriptions: {
                    comparing_values: '比较: <span class="highlight-value">{value1}</span> 与 <span class="highlight-value">{value2}</span>',
                    comparing_positions: '比较: <span class="highlight-value">{value1}</span>（位置<span class="highlight-index">{pos1}</span>）与 <span class="highlight-value">{value2}</span>（位置<span class="highlight-index">{pos2}</span>）',
                    swapping_positions: '交换: 位置 <span class="highlight-index">{pos1}</span> 和 <span class="highlight-index">{pos2}</span>',
                    swapping_values: '交换: <span class="highlight-value">{value1}</span> 和 <span class="highlight-value">{value2}</span> 的位置',
                    extracting_for_insertion: '提取索引<span class="highlight-index">{index}</span>的值<span class="highlight-value">{value}</span>，准备插入到左侧有序区间',
                    finding_insertion_position: '找到合适位置：索引<span class="highlight-index">{index}</span>，将值<span class="highlight-value">{value}</span>插入',
                    moving_element_right: '将<span class="highlight-value">{value}</span>向右移动一位',
                    moving_element_position: '将元素从位置<span class="highlight-index">{fromPos}</span>移动到位置<span class="highlight-index">{toPos}</span>',
                    selecting_pivot: '选择基准值<span class="highlight-value">{pivot}</span>，开始分区操作',
                    pivot_in_place: '基准值<span class="highlight-value">{pivot}</span>已就位，左侧都小于基准，右侧都大于基准',
                    merging_ranges: '合并区间<span class="highlight-range">[{left}-{mid}]</span>和<span class="highlight-range">[{mid1}-{right}]</span>',
                    merging_smaller_value: '将较小值<span class="highlight-value">{value}</span>放入合并结果',
                    heapify_structure: '调整堆结构，确保父节点<span class="highlight-value">{parentValue}</span>大于子节点',
                    extract_heap_max: '提取堆顶最大值<span class="highlight-value">{value}</span>到已排序区域',
                    round_complete: '第<span class="highlight-round">{round}</span>轮完成，最大值<span class="highlight-value">{value}</span>已就位',
                    bubble_summary: '通过重复交换相邻的逆序元素将最大值"冒泡"到末尾',
                    selection_summary: '在未排序区域找到最小值<span class="highlight-value">{value}</span>，放到已排序区域末尾',
                    insertion_summary: '将元素<span class="highlight-value">{value}</span>插入到已排序区域的正确位置',
                    merge_summary: '递归分治：先分解为小数组，再合并为有序数组',
                    quick_summary: '选择基准<span class="highlight-value">{pivot}</span>分区，递归排序左右子数组',
                    heap_summary: '构建最大堆，重复提取堆顶元素到已排序区域',
                    counting_summary: '统计每个值的出现次数，按顺序重构数组',
                    radix_summary: '按位排序，从最低位到最高位逐位处理'
                }
            },
            
            en: {
                // Page title and basic text
                pageTitle: 'Eight Sorting Algorithms Visualization',
                
                // Control panel text
                algorithmLabel: 'Algorithm:',
                arraySizeLabel: 'Array Size:',
                sortSpeedLabel: 'Sort Speed:',
                speedUnit: 'ms(time per bar movement)',
                displayModeLabel: 'Display Mode:',
                
                // Button text
                generateArray: 'Generate Array',
                startSort: 'Start Sort',
                pauseSort: 'Pause',
                resumeSort: 'Resume',
                resetSort: 'Reset',
                complexityCompare: 'Complexity Compare',
                teachingMode: 'Teaching Mode',
                languageToggle: 'English',
                
                // Tooltips
                tooltips: {
                    generateArray: 'Generate random array',
                    startSort: 'Start sorting animation',
                    pauseSort: 'Pause sorting',
                    resumeSort: 'Resume sorting',
                    resetSort: 'Reset to initial state',
                    complexityCompare: 'View algorithm complexity comparison',
                    teachingMode: 'Enable teaching mode',
                    languageToggle: 'Switch language'
                },
                
                // Algorithm names
                algorithms: {
                    bubbleSort: 'Bubble Sort',
                    selectionSort: 'Selection Sort',
                    insertionSort: 'Insertion Sort',
                    mergeSort: 'Merge Sort',
                    quickSort: 'Quick Sort',
                    heapSort: 'Heap Sort',
                    countingSort: 'Counting Sort',
                    radixSort: 'Radix Sort'
                },
                
                // Display modes
                displayModes: {
                    steps: 'Step Description',
                    code: 'Annotated Code'
                },
                
                // Info panel titles
                algorithmInfoTitle: 'Algorithm Info',
                statsTitle: 'Real-time Stats',
                codeTitle: 'Algorithm Code',
                stepsTitle: 'Current Step',
                
                // Stats labels
                stats: {
                    comparisons: 'Comparisons',
                    swaps: 'Swaps',
                    elapsedTime: 'Time',
                    sortedCount: 'Sorted',
                    pointerPosition: 'Pointer Position'
                },
                
                // Color legend
                colorLegend: {
                    title: 'Color Legend'
                },
                
                // Complexity related
                complexity: {
                    timeComplexityTitle: 'Time Complexity:',
                    timeBest: 'Best Case:',
                    timeAverage: 'Average Case:',
                    timeWorst: 'Worst Case:',
                    spaceComplexityTitle: 'Space Complexity:',
                    stabilityTitle: 'Stability:',
                    stable: 'Stable',
                    unstable: 'Unstable'
                },
                
                // Default messages
                defaultMessages: {
                    selectAlgorithm: 'Please select a sorting algorithm to view details.',
                    readyToSort: 'Ready to start sorting...',
                    selectAlgorithmCode: '// Select an algorithm to view code'
                },
                
                // State texts
                states: {
                    waiting: 'Wait',
                    comparing: 'Comp',
                    moving: 'Move',
                    inserting: 'Insert',
                    swapping: 'Swap',
                    completed: 'Done',
                    marked: 'Mark'
                },
                
                // Algorithm codes (English comments version)
                algorithmCodes: {
                    bubbleSort: `// Bubble Sort - 冒泡排序
function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            // Compare adjacent elements
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        // If no swaps occurred, array is sorted
        if (!swapped) break;
    }
    return arr;
}`,
                    selectionSort: `// Selection Sort - 选择排序
function selectionSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        // Find the index of minimum element
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        // Swap minimum element to correct position
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
    }
    return arr;
}`,
                    insertionSort: `// Insertion Sort - 插入排序
function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let current = arr[i];
        let j = i - 1;
        
        // Insert current element into correct position
        while (j >= 0 && arr[j] > current) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = current;
    }
    return arr;
}`,
                    mergeSort: `// Merge Sort - 归并排序
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;
    
    // Merge two sorted arrays
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    
    return result.concat(left.slice(i), right.slice(j));
}`,
                    quickSort: `// Quick Sort - 快速排序
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // Partition operation
        const pivotIndex = partition(arr, low, high);
        
        // Recursively sort left and right subarrays
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}`,
                    heapSort: `// Heap Sort - 堆排序
function heapSort(arr) {
    const n = arr.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // Extract elements one by one
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
    return arr;
}

function heapify(arr, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
    }
}`,
                    countingSort: `// Counting Sort - 计数排序
function countingSort(arr) {
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    const range = max - min + 1;
    const count = new Array(range).fill(0);
    
    // Count occurrences
    for (let i = 0; i < arr.length; i++) {
        count[arr[i] - min]++;
    }
    
    // Reconstruct array
    let index = 0;
    for (let i = 0; i < range; i++) {
        while (count[i] > 0) {
            arr[index++] = i + min;
            count[i]--;
        }
    }
    return arr;
}`,
                    radixSort: `// Radix Sort - 基数排序
function radixSort(arr) {
    const max = Math.max(...arr);
    
    // Perform counting sort for each digit
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        countingSortByDigit(arr, exp);
    }
    return arr;
}

function countingSortByDigit(arr, exp) {
    const n = arr.length;
    const output = new Array(n);
    const count = new Array(10).fill(0);
    
    // Count occurrences
    for (let i = 0; i < n; i++) {
        const digit = Math.floor(arr[i] / exp) % 10;
        count[digit]++;
    }
    
    // Cumulative count
    for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }
    
    // Build output array
    for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    
    // Copy back to original array
    for (let i = 0; i < n; i++) {
        arr[i] = output[i];
    }
}`
                },
                
                // Modal
                modal: {
                    algorithmIntro: 'Algorithm Introduction',
                    complexityComparison: 'Algorithm Complexity Comparison',
                    understood: 'Got it',
                    close: 'Close'
                },
                
                // Algorithm detailed information
                algorithmDetails: {
                    bubbleSort: {
                        description: 'Bubble sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
                        workingPrinciple: 'Compare adjacent elements and swap them if they are in wrong order. Repeat this process until no swaps are needed.',
                        useCases: 'Small datasets, educational purposes',
                        advantages: ['Simple implementation', 'Stable sorting', 'In-place sorting'],
                        disadvantages: ['High time complexity', 'Inefficient', 'Not suitable for large datasets'],
                        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
                        spaceComplexity: 'O(1)',
                        stable: true
                    },
                    selectionSort: {
                        description: 'Selection sort finds the minimum element from unsorted part and puts it at the beginning of sorted part.',
                        workingPrinciple: 'Find the minimum element in unsorted array and swap it with the first element of unsorted part.',
                        useCases: 'Memory-constrained environments, small datasets',
                        advantages: ['Simple implementation', 'In-place sorting', 'Minimum number of swaps'],
                        disadvantages: ['High time complexity', 'Unstable', 'Not suitable for large datasets'],
                        timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
                        spaceComplexity: 'O(1)',
                        stable: false
                    },
                    insertionSort: {
                        description: 'Insertion sort builds the final sorted array one item at a time by inserting each element into its proper position.',
                        workingPrinciple: 'Take elements from unsorted part and insert them into correct position in sorted part.',
                        useCases: 'Small datasets, partially sorted data, online algorithms',
                        advantages: ['Simple implementation', 'Stable sorting', 'In-place sorting', 'Efficient for small datasets'],
                        disadvantages: ['High time complexity', 'Not suitable for large datasets'],
                        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
                        spaceComplexity: 'O(1)',
                        stable: true
                    },
                    mergeSort: {
                        description: 'Merge sort uses divide-and-conquer approach to sort arrays by dividing them into halves and merging them back.',
                        workingPrinciple: 'Recursively divide array into halves until each part has one element, then merge them back in sorted order.',
                        useCases: 'Large datasets, stable sorting required, external sorting',
                        advantages: ['Stable sorting', 'Consistent time complexity', 'Good for large datasets'],
                        disadvantages: ['Requires extra space', 'Not in-place'],
                        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
                        spaceComplexity: 'O(n)',
                        stable: true
                    },
                    quickSort: {
                        description: 'Quick sort uses divide-and-conquer by selecting a pivot element and partitioning array around it.',
                        workingPrinciple: 'Choose pivot element, partition array so elements smaller than pivot are on left and larger on right, then recursively sort partitions.',
                        useCases: 'Large datasets, general-purpose sorting, system sorting',
                        advantages: ['Excellent average performance', 'In-place sorting', 'Widely used'],
                        disadvantages: ['Poor worst-case performance', 'Unstable', 'Deep recursion possible'],
                        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
                        spaceComplexity: 'O(log n)',
                        stable: false
                    },
                    heapSort: {
                        description: 'Heap sort uses heap data structure to sort arrays by building max heap and extracting maximum elements.',
                        workingPrinciple: 'Build max heap, swap root (maximum) with last element, reduce heap size and heapify, repeat.',
                        useCases: 'Consistent time complexity needed, memory-constrained environments',
                        advantages: ['Consistent time complexity', 'In-place sorting', 'Not affected by input data'],
                        disadvantages: ['Unstable', 'Large constant factors', 'Poor cache performance'],
                        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
                        spaceComplexity: 'O(1)',
                        stable: false
                    },
                    countingSort: {
                        description: 'Counting sort is non-comparison sorting that counts occurrences of each element to sort integers within a range.',
                        workingPrinciple: 'Count occurrences of each element, then reconstruct sorted array based on counts.',
                        useCases: 'Integer sorting, small range data, subroutine for radix sort',
                        advantages: ['Linear time complexity', 'Stable sorting', 'Non-comparison based'],
                        disadvantages: ['Requires extra space', 'Only for integers', 'Range limited'],
                        timeComplexity: { best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n+k)' },
                        spaceComplexity: 'O(k)',
                        stable: true
                    },
                    radixSort: {
                        description: 'Radix sort is non-comparison sorting that sorts integers by processing individual digits from least to most significant.',
                        workingPrinciple: 'Sort by each digit position using stable sorting algorithm, starting from least significant digit.',
                        useCases: 'Large integer datasets, string sorting, multi-key sorting',
                        advantages: ['Linear time complexity', 'Stable sorting', 'Good for large datasets'],
                        disadvantages: ['Requires extra space', 'Only for integers', 'Performance depends on digit count'],
                        timeComplexity: { best: 'O(d(n+k))', average: 'O(d(n+k))', worst: 'O(d(n+k))' },
                        spaceComplexity: 'O(n+k)',
                        stable: true
                    }
                },
                
                // Step description templates
                stepDescriptions: {
                    comparing: 'Comparing: {value1} vs {value2}',
                    swapping: 'Swapping: positions {pos1} and {pos2}',
                    moving: 'Moving: {value} to position {pos}',
                    partitioning: 'Partitioning: pivot {pivot}, range [{left}, {right}]',
                    merging: 'Merging: ranges [{left}, {mid}] and [{mid1}, {right}]',
                    heapifying: 'Heapifying: adjusting position {pos}',
                    counting: 'Counting: element {value}',
                    digitSort: 'Sorting by digit {digit}',
                    completed: '{algorithm} sorting completed!',
                    paused: 'Sorting paused',
                    resumed: 'Resuming sort...',
                    reset: 'Reset to initial state'
                },
                
                // Detailed step description templates
                detailedStepDescriptions: {
                    comparing_values: 'Comparing: <span class="highlight-value">{value1}</span> vs <span class="highlight-value">{value2}</span>',
                    comparing_positions: 'Comparing: <span class="highlight-value">{value1}</span> (position <span class="highlight-index">{pos1}</span>) vs <span class="highlight-value">{value2}</span> (position <span class="highlight-index">{pos2}</span>)',
                    swapping_positions: 'Swapping: positions <span class="highlight-index">{pos1}</span> and <span class="highlight-index">{pos2}</span>',
                    swapping_values: 'Swapping: <span class="highlight-value">{value1}</span> and <span class="highlight-value">{value2}</span> positions',
                    extracting_for_insertion: 'Extracting value <span class="highlight-value">{value}</span> at index <span class="highlight-index">{index}</span>, preparing to insert into sorted left region',
                    finding_insertion_position: 'Found suitable position: index <span class="highlight-index">{index}</span>, inserting value <span class="highlight-value">{value}</span>',
                    moving_element_right: 'Moving <span class="highlight-value">{value}</span> one position to the right',
                    moving_element_position: 'Moving element from position <span class="highlight-index">{fromPos}</span> to position <span class="highlight-index">{toPos}</span>',
                    selecting_pivot: 'Selecting pivot value <span class="highlight-value">{pivot}</span>, starting partition operation',
                    pivot_in_place: 'Pivot value <span class="highlight-value">{pivot}</span> is in place, left side smaller, right side larger',
                    merging_ranges: 'Merging ranges <span class="highlight-range">[{left}-{mid}]</span> and <span class="highlight-range">[{mid1}-{right}]</span>',
                    merging_smaller_value: 'Placing smaller value <span class="highlight-value">{value}</span> into merge result',
                    heapify_structure: 'Adjusting heap structure, ensuring parent node <span class="highlight-value">{parentValue}</span> is greater than children',
                    extract_heap_max: 'Extracting heap maximum <span class="highlight-value">{value}</span> to sorted region',
                    round_complete: 'Round <span class="highlight-round">{round}</span> complete, maximum value <span class="highlight-value">{value}</span> is in place',
                    bubble_summary: 'Repeatedly swapping adjacent out-of-order elements to "bubble" the maximum to the end',
                    selection_summary: 'Finding minimum value <span class="highlight-value">{value}</span> in unsorted region, placing at end of sorted region',
                    insertion_summary: 'Inserting element <span class="highlight-value">{value}</span> into correct position in sorted region',
                    merge_summary: 'Divide and conquer: first decompose into small arrays, then merge into sorted array',
                    quick_summary: 'Select pivot <span class="highlight-value">{pivot}</span> for partitioning, recursively sort left and right subarrays',
                    heap_summary: 'Build max heap, repeatedly extract heap top element to sorted region',
                    counting_summary: 'Count occurrences of each value, reconstruct array in order',
                    radix_summary: 'Sort by digits, processing from least to most significant digit'
                }
            }
        };
        
        // 代码行映射 - 将步骤类型映射到对应的代码行号
        this.codeLineMapping = {
            zh: {
                bubbleSort: {
                    comparing_positions: [7], // if (arr[j] > arr[j + 1])
                    swapping_values: [9], // [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
                    round_complete: [13], // if (!swapped) break
                    bubble_summary: [13] // if (!swapped) break
                },
                selectionSort: {
                    comparing_positions: [7], // if (arr[j] < arr[minIndex])
                    swapping_values: [12], // [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
                    selection_summary: [7] // if (arr[j] < arr[minIndex])
                },
                insertionSort: {
                    extracting_for_insertion: [3], // let current = arr[i]
                    moving_element_right: [7], // arr[j + 1] = arr[j]
                    finding_insertion_position: [10], // arr[j + 1] = current
                    insertion_summary: [6] // while (j >= 0 && arr[j] > current)
                },
                mergeSort: {
                    merging_ranges: [8], // return merge(left, right)
                    merging_smaller_value: [17], // result.push(left[i++])
                    merge_summary: [8] // return merge(left, right)
                },
                quickSort: {
                    selecting_pivot: [9], // const pivot = arr[high]
                    pivot_in_place: [19], // return i + 1
                    quick_summary: [5] // quickSort(arr, low, pivotIndex - 1)
                },
                heapSort: {
                    extract_heap_max: [10], // [arr[0], arr[i]] = [arr[i], arr[0]]
                    heapify_structure: [25], // heapify(arr, n, largest)
                    heap_summary: [11] // heapify(arr, i, 0)
                },
                countingSort: {
                    counting_summary: [16] // arr[index++] = i + min
                },
                radixSort: {
                    radix_summary: [6] // countingSortByDigit(arr, exp)
                }
            },
            en: {
                bubbleSort: {
                    comparing_positions: [7], // if (arr[j] > arr[j + 1])
                    swapping_values: [9], // [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
                    round_complete: [13], // if (!swapped) break
                    bubble_summary: [13] // if (!swapped) break
                },
                selectionSort: {
                    comparing_positions: [7], // if (arr[j] < arr[minIndex])
                    swapping_values: [12], // [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
                    selection_summary: [7] // if (arr[j] < arr[minIndex])
                },
                insertionSort: {
                    extracting_for_insertion: [3], // let current = arr[i]
                    moving_element_right: [7], // arr[j + 1] = arr[j]
                    finding_insertion_position: [10], // arr[j + 1] = current
                    insertion_summary: [6] // while (j >= 0 && arr[j] > current)
                },
                mergeSort: {
                    merging_ranges: [8], // return merge(left, right)
                    merging_smaller_value: [17], // result.push(left[i++])
                    merge_summary: [8] // return merge(left, right)
                },
                quickSort: {
                    selecting_pivot: [9], // const pivot = arr[high]
                    pivot_in_place: [19], // return i + 1
                    quick_summary: [5] // quickSort(arr, low, pivotIndex - 1)
                },
                heapSort: {
                    extract_heap_max: [10], // [arr[0], arr[i]] = [arr[i], arr[0]]
                    heapify_structure: [25], // heapify(arr, n, largest)
                    heap_summary: [11] // heapify(arr, i, 0)
                },
                countingSort: {
                    counting_summary: [16] // arr[index++] = i + min
                },
                radixSort: {
                    radix_summary: [6] // countingSortByDigit(arr, exp)
                }
            }
        };
        
        // 绑定语言切换事件
        this.bindEvents();
    }
    
    /**
     * 绑定语言切换相关事件
     */
    bindEvents() {
        // 等待DOM加载完成后绑定事件
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupLanguageToggle();
            });
        } else {
            // DOM已加载，立即设置
            this.setupLanguageToggle();
        }
        
        // 额外的安全措施：延迟绑定以确保所有元素都已加载
        setTimeout(() => {
            this.setupLanguageToggle();
        }, 100);
    }
    
    /**
     * 设置语言切换按钮事件
     */
    setupLanguageToggle() {
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            // 移除可能存在的旧事件监听器
            if (this.toggleLanguageHandler) {
                languageToggle.removeEventListener('click', this.toggleLanguageHandler);
            }
            
            // 创建绑定的事件处理器
            this.toggleLanguageHandler = (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('Language toggle clicked'); // 调试日志
                this.toggleLanguage();
            };
            
            // 添加新的事件监听器
            languageToggle.addEventListener('click', this.toggleLanguageHandler);
            console.log('Language toggle event bound successfully'); // 调试日志
        } else {
            console.warn('Language toggle button not found'); // 调试日志
        }
    }
    
    /**
     * 切换语言
     */
    toggleLanguage() {
        const oldLanguage = this.currentLanguage;
        this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
        console.log(`Language toggled from ${oldLanguage} to ${this.currentLanguage}`);
        
        this.updateAllTexts();
        
        // 更新页面标题
        document.title = this.getText('pageTitle');
        
        // 触发语言切换事件，供其他组件监听
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { 
                language: this.currentLanguage,
                previousLanguage: oldLanguage
            }
        }));
        
        console.log('Language toggle completed');
    }
    
    /**
     * 获取当前语言的文本
     * @param {string} key - 文本键名，支持点号分隔的嵌套键
     * @returns {string} 对应的文本
     */
    getText(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key; // 返回键名作为后备
            }
        }
        
        return value || key;
    }
    
    /**
     * 获取当前语言
     * @returns {string} 当前语言代码
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    /**
     * 设置语言
     * @param {string} language - 语言代码 ('zh' 或 'en')
     */
    setLanguage(language) {
        if (language in this.translations) {
            this.currentLanguage = language;
            this.updateAllTexts();
            document.title = this.getText('pageTitle');
        }
    }
    
    /**
     * 更新页面上所有的文本内容
     */
    updateAllTexts() {
        console.log('Updating all texts to language:', this.currentLanguage);
        
        // 更新页面标题
        document.title = this.getText('pageTitle');
        const pageTitleElement = document.getElementById('page-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = this.getText('pageTitle');
        }
        
        // 更新控制面板标签
        this.updateElementText('label[for="algorithm-select"]', 'algorithmLabel');
        this.updateElementText('label[for="array-size"]', 'arraySizeLabel');
        this.updateElementText('label[for="sort-speed"]', 'sortSpeedLabel');
        this.updateElementText('label[for="display-mode"]', 'displayModeLabel');
        
        // 更新按钮文本
        this.updateButtonText('generate-array', 'generateArray');
        this.updateButtonText('start-sort', 'startSort');
        this.updateButtonText('pause-sort', 'pauseSort');
        this.updateButtonText('resume-sort', 'resumeSort');
        this.updateButtonText('reset-sort', 'resetSort');
        this.updateButtonText('complexity-compare', 'complexityCompare');
        this.updateButtonText('teaching-mode', 'teachingMode');
        
        // 更新语言切换按钮
        const languageText = document.getElementById('language-text');
        if (languageText) {
            languageText.textContent = this.getText('languageToggle');
        }
        
        // 更新速度单位显示
        this.updateSpeedUnit();
        
        // 更新算法选择下拉框
        this.updateAlgorithmSelect();
        
        // 更新显示模式下拉框
        this.updateDisplayModeSelect();
        
        // 更新工具提示
        this.updateTooltips();
        
        // 更新信息面板标题
        this.updateElementText('#algorithm-info-title', 'algorithmInfoTitle');
        this.updateElementText('#stats-title', 'statsTitle');
        this.updateElementText('#code-title', 'codeTitle');
        this.updateElementText('#steps-title', 'stepsTitle');
        
        // 更新统计标签
        this.updateStatsLabels();
        
        // 更新复杂度标签
        this.updateComplexityLabels();
        
        // 更新默认消息
        this.updateDefaultMessages();
        
        // 更新颜色图例文本
        this.updateColorLegend();
        
        // 更新指针位置标签
        this.updatePointerPositionLabel();
        
        // 更新所有带有data-translate属性的元素 - 确保这个调用在最后
        this.updateDataTranslateElements();
        
        // 触发UI更新事件，让UI控制器更新算法信息
        if (window.uiHandler && typeof window.uiHandler.updateAlgorithmInfo === 'function') {
            window.uiHandler.updateAlgorithmInfo();
        }
        
        console.log('All texts updated successfully');
    }
    
    /**
     * 更新所有带有data-translate属性的元素
     */
    updateDataTranslateElements() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (key) {
                const text = this.getText(key);
                if (text !== key) { // 只有找到翻译时才更新
                    // 对于指针位置标签，需要添加冒号
                    if (key === 'stats.pointerPosition') {
                        element.textContent = text + ':';
                    } else {
                        element.textContent = text;
                    }
                }
            }
        });
    }
    
    /**
     * 更新颜色图例文本
     */
    updateColorLegend() {
        // 颜色含义标题现在通过data-translate属性自动更新，不需要手动更新
        
        const legendItems = document.querySelectorAll('.legend-item span');
        const stateKeys = ['waiting', 'comparing', 'moving', 'inserting', 'swapping', 'completed', 'marked'];
        
        legendItems.forEach((span, index) => {
            if (stateKeys[index]) {
                span.textContent = this.getText(`states.${stateKeys[index]}`);
            }
        });
        
        // 更新所有柱子的状态文本
        if (window.uiHandler && window.uiHandler.visualizer) {
            const visualizer = window.uiHandler.visualizer;
            visualizer.bars.forEach((bar, index) => {
                const statusLabel = bar.querySelector('.bar-status');
                if (statusLabel && visualizer.barStates.has(index)) {
                    const state = visualizer.barStates.get(index);
                    const stateKey = Object.keys(visualizer.states).find(key => visualizer.states[key] === state);
                    if (stateKey) {
                        statusLabel.textContent = this.getText(`states.${stateKey.toLowerCase()}`);
                    }
                }
            });
        }
    }
    
    /**
     * 更新速度单位显示
     */
    updateSpeedUnit() {
        const speedValueElement = document.getElementById('sort-speed-value');
        if (speedValueElement && window.uiHandler) {
            const currentSpeed = window.uiHandler.speed || 50;
            const speedUnit = this.getText('speedUnit');
            speedValueElement.textContent = `${currentSpeed}${speedUnit}`;
        }
    }
    
    /**
     * 更新指针位置标签
     */
    updatePointerPositionLabel() {
        // 指针位置标签现在通过data-translate属性自动更新，不需要手动更新
    }
    

    
    /**
     * 更新元素文本内容
     * @param {string} selector - CSS选择器
     * @param {string} textKey - 文本键名
     */
    updateElementText(selector, textKey) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = this.getText(textKey);
        }
    }
    
    /**
     * 更新按钮文本（保留图标）
     * @param {string} buttonId - 按钮ID
     * @param {string} textKey - 文本键名
     */
    updateButtonText(buttonId, textKey) {
        const button = document.getElementById(buttonId);
        if (button) {
            const spans = button.querySelectorAll('span');
            if (spans.length >= 2) {
                spans[1].textContent = this.getText(textKey);
            }
        }
    }
    
    /**
     * 更新算法选择下拉框
     */
    updateAlgorithmSelect() {
        const select = document.getElementById('algorithm-select');
        if (select) {
            const options = select.querySelectorAll('option');
            options.forEach(option => {
                const algorithmKey = option.value;
                if (this.getText(`algorithms.${algorithmKey}`)) {
                    option.textContent = this.getText(`algorithms.${algorithmKey}`);
                }
            });
        }
    }
    
    /**
     * 更新显示模式下拉框
     */
    updateDisplayModeSelect() {
        const select = document.getElementById('display-mode');
        if (select) {
            const options = select.querySelectorAll('option');
            options.forEach(option => {
                const modeKey = option.value;
                if (this.getText(`displayModes.${modeKey}`)) {
                    option.textContent = this.getText(`displayModes.${modeKey}`);
                }
            });
        }
    }
    
    /**
     * 更新工具提示
     */
    updateTooltips() {
        const tooltipElements = [
            { id: 'generate-array', key: 'tooltips.generateArray' },
            { id: 'start-sort', key: 'tooltips.startSort' },
            { id: 'pause-sort', key: 'tooltips.pauseSort' },
            { id: 'resume-sort', key: 'tooltips.resumeSort' },
            { id: 'reset-sort', key: 'tooltips.resetSort' },
            { id: 'complexity-compare', key: 'tooltips.complexityCompare' },
            { id: 'teaching-mode', key: 'tooltips.teachingMode' },
            { id: 'language-toggle', key: 'tooltips.languageToggle' }
        ];
        
        tooltipElements.forEach(({ id, key }) => {
            const element = document.getElementById(id);
            if (element) {
                const tooltip = element.querySelector('.tooltiptext');
                if (tooltip) {
                    tooltip.textContent = this.getText(key);
                }
            }
        });
    }
    
    /**
     * 更新统计标签
     */
    updateStatsLabels() {
        const statsLabels = document.querySelectorAll('.stat-label');
        const labelKeys = ['stats.comparisons', 'stats.swaps', 'stats.elapsedTime', 'stats.sortedCount'];
        
        statsLabels.forEach((label, index) => {
            if (labelKeys[index]) {
                label.textContent = this.getText(labelKeys[index]);
            }
        });
    }
    
    /**
     * 更新复杂度标签
     */
    updateComplexityLabels() {
        // 更新时间复杂度相关标签
        this.updateElementText('#time-complexity-label', 'complexity.timeComplexityTitle');
        this.updateElementText('#time-best-label', 'complexity.timeBest');
        this.updateElementText('#time-average-label', 'complexity.timeAverage');
        this.updateElementText('#time-worst-label', 'complexity.timeWorst');
        this.updateElementText('#space-complexity-label', 'complexity.spaceComplexityTitle');
        this.updateElementText('#stability-label', 'complexity.stabilityTitle');
    }
    
    /**
     * 更新默认消息
     */
    updateDefaultMessages() {
        const algorithmDescription = document.getElementById('algorithm-description');
        if (algorithmDescription && algorithmDescription.textContent.includes('请选择') || 
            algorithmDescription.textContent.includes('Please select')) {
            algorithmDescription.textContent = this.getText('defaultMessages.selectAlgorithm');
        }
        
        const currentStep = document.getElementById('current-step');
        if (currentStep && (currentStep.textContent.includes('准备开始') || 
            currentStep.textContent.includes('Ready to start'))) {
            currentStep.textContent = this.getText('defaultMessages.readyToSort');
        }
        
        const algorithmCode = document.getElementById('algorithm-code');
        if (algorithmCode && (algorithmCode.textContent.includes('选择一个算法') || 
            algorithmCode.textContent.includes('Select an algorithm'))) {
            algorithmCode.textContent = this.getText('defaultMessages.selectAlgorithmCode');
        }
    }
    
    /**
     * 获取算法信息的多语言文本
     * @param {string} algorithm - 算法名称
     * @returns {Object} 包含算法信息的对象
     */
    getAlgorithmInfo(algorithm) {
        const details = this.getText(`algorithmDetails.${algorithm}`);
        if (details && typeof details === 'object') {
            return {
                name: this.getText(`algorithms.${algorithm}`),
                description: details.description,
                workingPrinciple: details.workingPrinciple,
                useCases: details.useCases,
                advantages: details.advantages,
                disadvantages: details.disadvantages,
                timeComplexity: details.timeComplexity,
                spaceComplexity: details.spaceComplexity,
                stable: details.stable
            };
        }
        return {
            name: this.getText(`algorithms.${algorithm}`),
            description: this.getText('defaultMessages.selectAlgorithm')
        };
    }
    
    /**
     * 获取步骤描述的多语言文本
     * @param {string} stepType - 步骤类型
     * @param {Object} params - 步骤参数
     * @returns {string} 格式化的步骤描述
     */
    getStepDescription(stepType, params = {}) {
        const template = this.getText(`stepDescriptions.${stepType}`);
        if (!template) {
            return this.getText('defaultMessages.readyToSort');
        }
        
        // 替换模板中的占位符
        let description = template;
        Object.entries(params).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            description = description.replace(new RegExp(placeholder, 'g'), value);
        });
        
        return description;
    }
    
    /**
     * 获取详细步骤描述的多语言文本
     * @param {string} stepType - 详细步骤类型
     * @param {Object} params - 步骤参数
     * @returns {string} 格式化的详细步骤描述（包含HTML标记）
     */
    getDetailedStepDescription(stepType, params = {}) {
        const template = this.getText(`detailedStepDescriptions.${stepType}`);
        if (!template) {
            // 如果没有详细模板，回退到基础模板
            return this.getStepDescription(stepType, params);
        }
        
        // 替换模板中的占位符
        let description = template;
        Object.entries(params).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            description = description.replace(new RegExp(placeholder, 'g'), value);
        });
        
        return description;
    }
    
    /**
     * 获取算法代码的多语言版本（分行数组格式）
     * @param {string} algorithm - 算法名称
     * @returns {Array} 对应语言的算法代码行数组
     */
    getAlgorithmCodeLines(algorithm) {
        const code = this.getAlgorithmCode(algorithm);
        return code.split('\n');
    }
    
    /**
     * 获取步骤对应的代码行号
     * @param {string} algorithm - 算法名称
     * @param {string} stepType - 步骤类型
     * @returns {Array} 代码行号数组
     */
    getCodeLineNumbers(algorithm, stepType) {
        const mapping = this.codeLineMapping[this.currentLanguage];
        if (mapping && mapping[algorithm] && mapping[algorithm][stepType]) {
            return mapping[algorithm][stepType];
        }
        return [];
    }
    
    /**
     * 获取算法代码的多语言版本
     * @param {string} algorithm - 算法名称
     * @returns {string} 对应语言的算法代码
     */
    getAlgorithmCode(algorithm) {
        const codes = this.getText('algorithmCodes');
        if (codes && codes[algorithm]) {
            return codes[algorithm];
        }
        return this.getText('defaultMessages.selectAlgorithmCode');
    }
    
    /**
     * 获取复杂度对比表的数据
     * @returns {Array} 包含所有算法复杂度信息的数组
     */
    getComplexityComparisonData() {
        const algorithms = ['bubbleSort', 'selectionSort', 'insertionSort', 'mergeSort', 
                          'quickSort', 'heapSort', 'countingSort', 'radixSort'];
        
        return algorithms.map(algorithm => {
            const info = this.getAlgorithmInfo(algorithm);
            return {
                name: info.name,
                algorithm: algorithm,
                timeBest: info.timeComplexity?.best || '-',
                timeAverage: info.timeComplexity?.average || '-',
                timeWorst: info.timeComplexity?.worst || '-',
                spaceComplexity: info.spaceComplexity || '-',
                stable: info.stable ? this.getText('complexity.stable') : this.getText('complexity.unstable')
            };
        });
    }
}

// 创建全局语言管理器实例
console.log('Creating language manager instance...');
window.languageManager = new LanguageManager();

// 确保在DOM加载完成后再次设置事件绑定
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up language manager events...');
    if (window.languageManager) {
        window.languageManager.setupLanguageToggle();
    }
});