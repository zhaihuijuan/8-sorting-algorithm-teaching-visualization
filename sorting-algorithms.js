/**
 * 排序算法引擎 - 实现8种排序算法和统计功能
 * Sorting Algorithms Engine - Implements 8 sorting algorithms and statistics
 */

class SortingEngine {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.array = [];
        this.originalArray = [];
        this.stats = {
            comparisons: 0,
            swaps: 0,
            startTime: 0,
            elapsedTime: 0,
            pointers: {}
        };
        this.isPaused = false;
        this.isRunning = false;
        this.isStopped = false;
        this.currentAlgorithm = null;
        this.speed = 50; // 默认速度50ms
        this.teachingMode = false; // 教学模式
        this.allElementsSorted = false; // 防止重复标记已排序
        this.sortingInBackground = false; // 后台排序标志
        
        // 当前步骤信息，供教学模式使用
        this.currentStepType = null;
        this.currentStepParams = {};
        
        // 暂停恢复相关
        this.pauseResolve = null;
        this.pausePromise = null;
        
        // 实时耗时更新定时器
        this.statsUpdateTimer = null;
    }
    
    /**
     * 设置数组
     * @param {Array} array - 要排序的数组
     */
    setArray(array) {
        this.array = [...array];
        this.originalArray = [...array];
        this.resetStats();
    }
    
    /**
     * 设置教学模式
     * @param {boolean} enabled - 是否启用教学模式
     */
    setTeachingMode(enabled) {
        this.teachingMode = enabled;
    }
    
    /**
     * 教学模式步骤提示
     * @param {string} stepType - 步骤类型
     * @param {Object} params - 步骤参数
     * @returns {Promise} 用户确认的Promise
     */
    async teachingStep(stepType, params = {}) {
        if (!this.teachingMode || this.isStopped) return true;
        
        // 获取步骤描述和解释
        const stepDescription = this.getStepDescription(stepType, params);
        const explanation = this.getStepExplanation(stepType, params);
        
        // 更新当前步骤显示
        if (window.uiHandler) {
            window.uiHandler.updateCurrentStep(stepDescription);
        }
        
        // 显示教学提示并等待用户确认
        if (window.uiHandler && window.uiHandler.showTeachingStepPrompt) {
            try {
                const shouldContinue = await window.uiHandler.showTeachingStepPrompt(stepDescription, explanation);
                if (!shouldContinue) {
                    this.teachingMode = false; // 用户选择关闭教学模式
                    // 不要设置 isStopped = true，让排序继续在后台执行
                    // 设置后台排序标志
                    this.sortingInBackground = true;
                    
                    // 通知UI更新状态显示
                    if (window.uiHandler && window.uiHandler.updateBackgroundSortingStatus) {
                        window.uiHandler.updateBackgroundSortingStatus(true);
                    }
                    
                    // 重要：即使用户关闭教学模式，也要返回true让排序继续在后台执行
                    return true;
                }
                return shouldContinue;
            } catch (error) {
                console.error('Teaching step error:', error);
                return true; // 出错时继续执行
            }
        }
        
        return true;
    }
    
    /**
     * 获取步骤描述
     * @param {string} stepType - 步骤类型
     * @param {Object} params - 步骤参数
     * @returns {string} 步骤描述
     */
    getStepDescription(stepType, params) {
        if (window.languageManager) {
            return window.languageManager.getStepDescription(stepType, params);
        }
        return `${stepType}: ${JSON.stringify(params)}`;
    }
    
    /**
     * 更新详细步骤描述
     * @param {string} stepType - 详细步骤类型
     * @param {Object} params - 步骤参数
     */
    updateDetailedStep(stepType, params = {}) {
        // 存储当前步骤信息，供教学模式使用
        this.currentStepType = stepType;
        this.currentStepParams = params;
        
        if (window.languageManager && window.uiHandler) {
            const detailedDescription = window.languageManager.getDetailedStepDescription(stepType, params);
            
            // 获取对应的代码行
            const codeLine = this.getCodeLineForStep(stepType, params);
            const codeExplanation = this.getCodeExplanation(stepType, params);
            
            // 调用UIHandler的updateCurrentStep方法
            window.uiHandler.updateCurrentStep(detailedDescription, codeLine, codeExplanation);
        }
    }
    
    /**
     * 获取步骤对应的代码行
     * @param {string} stepType - 步骤类型
     * @param {Object} params - 步骤参数
     * @returns {string} 对应的代码行
     */
    getCodeLineForStep(stepType, params = {}) {
        // 获取当前算法和语言
        const currentAlgorithm = this.currentAlgorithm || 'bubbleSort';
        const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'zh';
        
        // 从语言管理器获取代码行
        if (window.languageManager) {
            const codeLines = window.languageManager.getAlgorithmCodeLines(currentAlgorithm);
            const lineNumbers = window.languageManager.getCodeLineNumbers(currentAlgorithm, stepType);
            
            if (codeLines && lineNumbers && lineNumbers.length > 0) {
                const lineIndex = lineNumbers[0];
                if (lineIndex < codeLines.length) {
                    let codeLine = codeLines[lineIndex].trim();
                    
                    // 替换参数占位符
                    Object.entries(params).forEach(([key, value]) => {
                        const placeholder = `{${key}}`;
                        codeLine = codeLine.replace(new RegExp(placeholder, 'g'), value);
                    });
                    
                    return codeLine;
                }
            }
        }
        
        // 回退到原有的代码行映射
        const codeLines = {
            // 冒泡排序代码行
            'comparing_positions': 'if (arr[j] > arr[j + 1]) {',
            'swapping_values': '[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];',
            'round_complete': '// 第 {round} 轮完成',
            'bubble_summary': 'if (!swapped) break;',
            
            // 选择排序代码行
            'selection_summary': 'if (arr[j] < arr[minIndex]) { minIndex = j; }',
            
            // 插入排序代码行
            'extracting_for_insertion': 'let current = arr[{index}];',
            'moving_element_right': 'arr[j + 1] = arr[j];',
            'finding_insertion_position': 'arr[j + 1] = current;',
            'insertion_summary': '// 插入元素到正确位置',
            
            // 归并排序代码行
            'merging_ranges': 'merge(left, right)',
            'merging_smaller_value': 'result.push(left[i++]);',
            'merge_summary': 'return merge(left, right);',
            
            // 快速排序代码行
            'selecting_pivot': 'const pivot = arr[high];',
            'pivot_in_place': 'return i + 1;',
            'quick_summary': 'quickSort(arr, low, pivotIndex - 1);',
            
            // 堆排序代码行
            'extract_heap_max': '[arr[0], arr[i]] = [arr[i], arr[0]];',
            'heapify_structure': 'heapify(arr, n, largest);',
            'heap_summary': 'heapify(arr, i, 0);',
            
            // 计数排序代码行
            'counting_summary': 'arr[index++] = i + min;',
            
            // 基数排序代码行
            'radix_summary': 'countingSortByDigit(arr, exp);'
        };
        
        let codeLine = codeLines[stepType] || `// ${stepType}`;
        
        // 替换参数占位符
        Object.entries(params).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            codeLine = codeLine.replace(new RegExp(placeholder, 'g'), value);
        });
        
        return codeLine;
    }
    
    /**
     * 获取代码解释
     * @param {string} stepType - 步骤类型
     * @param {Object} params - 步骤参数
     * @returns {string} 代码解释
     */
    getCodeExplanation(stepType, params = {}) {
        const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'zh';
        
        const explanations = {
            zh: {
                'comparing_positions': '比较相邻元素的大小',
                'swapping_values': '交换两个元素的位置',
                'round_complete': '当前轮次排序完成',
                'bubble_summary': '如果没有交换，说明数组已排序',
                'selection_summary': '寻找未排序部分的最小值',
                'extracting_for_insertion': '提取当前要插入的元素',
                'moving_element_right': '将较大元素向右移动',
                'finding_insertion_position': '将元素插入到正确位置',
                'insertion_summary': '插入排序的核心操作',
                'merging_ranges': '合并两个已排序的子数组',
                'merging_smaller_value': '选择较小的元素放入结果',
                'merge_summary': '归并排序的分治策略',
                'selecting_pivot': '选择基准元素进行分区',
                'pivot_in_place': '基准元素已就位，返回分区点',
                'quick_summary': '递归排序左右子数组',
                'extract_heap_max': '提取堆顶最大元素',
                'heapify_structure': '调整堆结构保持堆性质',
                'heap_summary': '重新堆化剩余元素',
                'counting_summary': '根据计数重构排序数组',
                'radix_summary': '按当前位数进行计数排序'
            },
            en: {
                'comparing_positions': 'Compare adjacent elements',
                'swapping_values': 'Swap two elements',
                'round_complete': 'Current round completed',
                'bubble_summary': 'If no swaps, array is sorted',
                'selection_summary': 'Find minimum in unsorted part',
                'extracting_for_insertion': 'Extract element to insert',
                'moving_element_right': 'Move larger element right',
                'finding_insertion_position': 'Insert element at correct position',
                'insertion_summary': 'Core operation of insertion sort',
                'merging_ranges': 'Merge two sorted subarrays',
                'merging_smaller_value': 'Select smaller element for result',
                'merge_summary': 'Divide and conquer strategy',
                'selecting_pivot': 'Select pivot for partitioning',
                'pivot_in_place': 'Pivot in place, return partition point',
                'quick_summary': 'Recursively sort left and right subarrays',
                'extract_heap_max': 'Extract maximum from heap top',
                'heapify_structure': 'Adjust heap structure to maintain heap property',
                'heap_summary': 'Re-heapify remaining elements',
                'counting_summary': 'Reconstruct sorted array from counts',
                'radix_summary': 'Counting sort by current digit'
            }
        };
        
        const langExplanations = explanations[currentLang] || explanations.zh;
        return langExplanations[stepType] || (currentLang === 'zh' ? '执行排序算法的一步' : 'Execute one step of sorting algorithm');
    }
    
    /**
     * 获取步骤解释
     * @param {string} stepType - 步骤类型
     * @param {Object} params - 步骤参数
     * @returns {string} 详细解释
     */
    getStepExplanation(stepType, params) {
        const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'zh';
        
        const explanations = {
            zh: {
                comparing: `正在比较两个元素的大小。比较操作是排序算法的基础，通过比较我们可以确定元素的相对顺序。当前比较 ${params.value1} 和 ${params.value2}，如果 ${params.value1} > ${params.value2}，则需要交换位置。`,
                swapping: `交换两个元素的位置。交换操作将较大的元素向右移动，较小的元素向左移动，这样逐步建立有序序列。当前交换位置 ${params.pos1} 和 ${params.pos2} 的元素。`,
                moving: `将元素移动到正确的位置。在插入排序等算法中，我们需要为新元素找到合适的插入位置，并将其他元素相应地移动。`,
                partitioning: `分区操作是快速排序的核心。选择一个基准元素，将数组分为两部分：小于基准的元素放在左边，大于基准的元素放在右边。`,
                merging: `合并操作将两个已排序的子数组合并成一个有序数组。这是归并排序的关键步骤，体现了分治算法的思想。`,
                heapifying: `堆化操作维护堆的性质。在堆排序中，我们需要确保父节点总是大于（或小于）其子节点，这样才能正确提取最大（或最小）元素。`,
                counting: `计数排序通过统计每个元素出现的次数来排序。这是一种非比较排序算法，时间复杂度可以达到线性。`,
                digitSort: `基数排序按位排序，从最低位到最高位依次处理。每一位的排序都使用稳定的排序算法，确保整体结果的正确性。`
            },
            en: {
                comparing: `Comparing two elements to determine their relative order. Comparison is the foundation of sorting algorithms. Currently comparing ${params.value1} and ${params.value2}, if ${params.value1} > ${params.value2}, we need to swap them.`,
                swapping: `Swapping two elements to move larger elements right and smaller elements left, gradually building the sorted sequence. Currently swapping elements at positions ${params.pos1} and ${params.pos2}.`,
                moving: `Moving an element to its correct position. In algorithms like insertion sort, we need to find the right insertion point for new elements and move other elements accordingly.`,
                partitioning: `Partitioning is the core of quick sort. We select a pivot element and divide the array into two parts: elements smaller than pivot go left, larger elements go right.`,
                merging: `Merging combines two sorted subarrays into one sorted array. This is the key step in merge sort, demonstrating the divide-and-conquer approach.`,
                heapifying: `Heapifying maintains the heap property. In heap sort, we ensure that parent nodes are always greater (or smaller) than their children to correctly extract maximum (or minimum) elements.`,
                counting: `Counting sort works by counting occurrences of each element. This is a non-comparison sorting algorithm that can achieve linear time complexity.`,
                digitSort: `Radix sort processes digits from least to most significant. Each digit position uses a stable sorting algorithm to ensure overall correctness.`
            }
        };
        
        const langExplanations = explanations[currentLang] || explanations.zh;
        return langExplanations[stepType] || (currentLang === 'zh' ? '执行排序算法的一步' : 'Execute one step of sorting algorithm');
    }
    
    /**
     * 重置统计数据
     */
    resetStats() {
        this.stats = {
            comparisons: 0,
            swaps: 0,
            startTime: 0,
            elapsedTime: 0,
            pointers: {}
        };
        // 停止定时器
        this.stopStatsTimer();
        this.updateStats();
    }
    
    /**
     * 更新统计显示
     */
    updateStats() {
        // 如果正在排序，实时计算耗时
        if (this.isRunning && this.stats.startTime > 0) {
            this.stats.elapsedTime = Date.now() - this.stats.startTime;
        }
        
        if (this.visualizer && this.visualizer.updateStats) {
            this.visualizer.updateStats(this.stats);
        }
    }
    
    /**
     * 开始实时耗时更新
     */
    startStatsTimer() {
        if (this.statsUpdateTimer) {
            clearInterval(this.statsUpdateTimer);
        }
        
        this.statsUpdateTimer = setInterval(() => {
            if (this.isRunning && !this.isPaused && this.stats.startTime > 0) {
                this.stats.elapsedTime = Date.now() - this.stats.startTime;
                this.updateStats();
            }
        }, 100); // 每100ms更新一次耗时
    }
    
    /**
     * 停止实时耗时更新
     */
    stopStatsTimer() {
        if (this.statsUpdateTimer) {
            clearInterval(this.statsUpdateTimer);
            this.statsUpdateTimer = null;
        }
    }
    
    /**
     * 暂停排序
     */
    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.stopStatsTimer(); // 暂停时停止耗时更新
            this.pausePromise = new Promise(resolve => {
                this.pauseResolve = resolve;
            });
        }
    }
    
    /**
     * 继续排序
     */
    resume() {
        if (this.isPaused && this.pauseResolve) {
            this.isPaused = false;
            this.startStatsTimer(); // 继续时重新开始耗时更新
            this.pauseResolve();
            this.pauseResolve = null;
            this.pausePromise = null;
        }
    }
    
    /**
     * 停止排序
     */
    stop() {
        this.isStopped = true;
        this.isRunning = false;
        this.stopStatsTimer(); // 停止时清除定时器
        if (this.isPaused) {
            this.resume(); // 恢复以便停止
        }
    }
    
    /**
     * 重置到初始状态
     */
    reset() {
        // 强制停止排序
        this.isStopped = true;
        this.isRunning = false;
        this.isPaused = false;
        
        // 清除定时器
        this.stopStatsTimer();
        
        // 如果有暂停的Promise，解析它以便停止
        if (this.pauseResolve) {
            this.pauseResolve();
            this.pauseResolve = null;
            this.pausePromise = null;
        }
        
        // 恢复数组到初始状态
        this.array = [...this.originalArray];
        this.resetStats();
        this.allElementsSorted = false; // 重置排序完成标志
        this.sortingInBackground = false; // 重置后台排序标志
        
        // 清除当前步骤信息，防止残留状态
        this.currentStepType = null;
        this.currentStepParams = {};
        
        // 重置可视化器
        if (this.visualizer) {
            this.visualizer.reset(); // 这会清除所有状态包括sortedIndices
            this.visualizer.renderArray(this.array);
        }
        
        // 重置教学模式相关状态
        this.teachingMode = false;
        
        // 不要自动重置 isStopped 标志
        // 让下次调用 sort() 方法时再重置，确保重置操作完全完成
    }
    
    /**
     * 延迟函数，支持暂停
     * @param {number} ms - 延迟毫秒数
     */
    async delay(ms = this.speed) {
        if (this.isStopped) return;
        
        if (this.isPaused) {
            await this.pausePromise;
        }
        
        if (this.isStopped) return;
        
        return new Promise(resolve => {
            const timeoutId = setTimeout(() => {
                if (!this.isStopped) {
                    resolve();
                }
            }, ms);
            
            // 如果在延迟期间被停止，立即清除定时器并解析
            const checkInterval = setInterval(() => {
                if (this.isStopped) {
                    clearTimeout(timeoutId);
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 5); // 更频繁的检查，提高响应性
            
            // 确保在延迟完成后清除检查间隔
            setTimeout(() => {
                clearInterval(checkInterval);
            }, ms + 10);
        });
    }
    
    /**
     * 比较两个元素
     * @param {number} i - 第一个元素索引
     * @param {number} j - 第二个元素索引
     * @returns {boolean} 比较结果
     */
    async compare(i, j) {
        if (this.isStopped) return false;
        
        // 更新详细步骤描述
        this.updateDetailedStep('comparing_positions', {
            value1: this.array[i],
            value2: this.array[j],
            pos1: i,
            pos2: j
        });
        
        // 教学模式提示
        if (this.teachingMode) {
            const shouldContinue = await this.teachingStep('comparing', {
                value1: this.array[i],
                value2: this.array[j],
                pos1: i,
                pos2: j
            });
            if (!shouldContinue) return false;
        }
        
        this.stats.comparisons++;
        this.stats.pointers = { i, j };
        this.updateStats();
        
        if (this.visualizer) {
            // 先清除之前的高亮
            this.visualizer.clearActiveHighlights();
            // 使用新的比较高亮方法
            this.visualizer.highlightComparison(i, j);
            await this.delay();
        }
        
        return this.array[i] > this.array[j];
    }
    
    /**
     * 交换两个元素
     * @param {number} i - 第一个元素索引
     * @param {number} j - 第二个元素索引
     */
    async swap(i, j) {
        if (this.isStopped) return;
        
        if (i !== j) {
            // 更新详细步骤描述
            this.updateDetailedStep('swapping_values', {
                value1: this.array[i],
                value2: this.array[j],
                pos1: i,
                pos2: j
            });
            
            // 教学模式提示
            if (this.teachingMode) {
                const shouldContinue = await this.teachingStep('swapping', {
                    value1: this.array[i],
                    value2: this.array[j],
                    pos1: i,
                    pos2: j
                });
                if (!shouldContinue) return;
            }
            
            this.stats.swaps++;
            this.updateStats();
            
            if (this.visualizer) {
                // 先清除之前的高亮
                this.visualizer.clearActiveHighlights();
                // 使用新的交换高亮方法
                this.visualizer.highlightSwap(i, j);
                await this.delay();
            }
            
            // 执行交换
            [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
            
            if (this.visualizer) {
                this.visualizer.renderArray(this.array, true); // 保留状态
                await this.delay(this.speed / 2);
            }
        }
    }
    
    /**
     * 标记元素为已排序
     * @param {number|Array} indices - 索引或索引数组
     */
    async markSorted(indices) {
        if (this.isStopped) return;
        
        const indexArray = Array.isArray(indices) ? indices : [indices];
        
        if (this.visualizer) {
            this.visualizer.markAsSorted(indexArray);
            await this.delay(this.speed / 2);
        }
    }
    
    /**
     * 冒泡排序
     */
    async bubbleSort() {
        this.currentAlgorithm = 'bubbleSort';
        const n = this.array.length;
        
        for (let i = 0; i < n - 1 && !this.isStopped; i++) {
            let swapped = false;
            
            for (let j = 0; j < n - i - 1 && !this.isStopped; j++) {
                if (await this.compare(j, j + 1)) {
                    await this.swap(j, j + 1);
                    swapped = true;
                }
            }
            
            // 每轮结束后，最后一个元素确实已经在正确位置，可以标记为已排序
            await this.markSorted(n - i - 1);
            
            // 更新轮次完成的详细步骤描述
            this.updateDetailedStep('round_complete', {
                round: i + 1,
                value: this.array[n - i - 1]
            });
            
            if (!swapped) {
                // 如果没有交换，说明剩余元素都已排序完成
                this.updateDetailedStep('bubble_summary', {});
                for (let k = 0; k < n - i - 1; k++) {
                    if (this.visualizer && this.visualizer.sortedIndices && !this.visualizer.sortedIndices.has(k)) {
                        await this.markSorted(k);
                    }
                }
                break;
            }
        }
        
        // 标记第一个元素为已排序（如果还没有标记）
        if (!this.isStopped && this.visualizer && this.visualizer.sortedIndices && !this.visualizer.sortedIndices.has(0)) {
            await this.markSorted(0);
        }
    }
    
    /**
     * 选择排序
     */
    async selectionSort() {
        this.currentAlgorithm = 'selectionSort';
        const n = this.array.length;
        
        for (let i = 0; i < n - 1 && !this.isStopped; i++) {
            let minIndex = i;
            
            // 找到最小元素的索引
            for (let j = i + 1; j < n && !this.isStopped; j++) {
                if (await this.compare(minIndex, j)) {
                    minIndex = j;
                }
            }
            
            // 交换最小元素到正确位置
            if (minIndex !== i) {
                await this.swap(i, minIndex);
            }
            
            // 标记当前位置为已排序
            await this.markSorted(i);
            
            // 更新选择排序的详细步骤描述
            this.updateDetailedStep('selection_summary', {
                value: this.array[i]
            });
        }
        
        // 标记最后一个元素为已排序
        if (!this.isStopped) {
            await this.markSorted(n - 1);
        }
    }
    
    /**
     * 插入排序
     */
    async insertionSort() {
        this.currentAlgorithm = 'insertionSort';
        const n = this.array.length;
        
        // 第一个元素默认已排序
        await this.markSorted(0);
        
        for (let i = 1; i < n && !this.isStopped; i++) {
            const currentValue = this.array[i];
            let j = i;
            
            // 更新提取元素的详细步骤描述
            this.updateDetailedStep('extracting_for_insertion', {
                index: i,
                value: currentValue
            });
            
            // 将当前元素插入到正确位置
            while (j > 0 && !this.isStopped) {
                if (await this.compare(j - 1, j)) {
                    // 更新移动元素的详细步骤描述
                    this.updateDetailedStep('moving_element_right', {
                        value: this.array[j - 1]
                    });
                    
                    await this.swap(j - 1, j);
                    j--;
                } else {
                    break;
                }
            }
            
            // 更新找到插入位置的详细步骤描述
            this.updateDetailedStep('finding_insertion_position', {
                index: j,
                value: this.array[j]
            });
            
            // 标记当前位置为已排序
            await this.markSorted(i);
            
            // 更新插入排序的总结描述
            this.updateDetailedStep('insertion_summary', {
                value: this.array[j]
            });
        }
    }
    
    /**
     * 归并排序
     */
    async mergeSort() {
        this.currentAlgorithm = 'mergeSort';
        await this.mergeSortHelper(0, this.array.length - 1);
        
        // 归并排序完成后，所有元素都已经在正确位置，逐个标记为已排序
        if (!this.isStopped && this.visualizer && this.visualizer.sortedIndices) {
            for (let i = 0; i < this.array.length; i++) {
                if (!this.visualizer.sortedIndices.has(i)) {
                    await this.markSorted(i);
                    await this.delay(this.speed / 4); // 快速标记
                }
            }
        }
    }
    
    /**
     * 归并排序辅助函数
     * @param {number} left - 左边界
     * @param {number} right - 右边界
     */
    async mergeSortHelper(left, right) {
        if (left >= right || this.isStopped) return;
        
        const mid = Math.floor((left + right) / 2);
        
        await this.mergeSortHelper(left, mid);
        await this.mergeSortHelper(mid + 1, right);
        await this.merge(left, mid, right);
    }
    
    /**
     * 归并操作
     * @param {number} left - 左边界
     * @param {number} mid - 中间位置
     * @param {number} right - 右边界
     */
    async merge(left, mid, right) {
        if (this.isStopped) return;
        
        // 更新合并区间的详细步骤描述
        this.updateDetailedStep('merging_ranges', {
            left: left,
            mid: mid,
            mid1: mid + 1,
            right: right
        });
        
        const leftArray = this.array.slice(left, mid + 1);
        const rightArray = this.array.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArray.length && j < rightArray.length && !this.isStopped) {
            this.stats.comparisons++;
            this.updateStats();
            
            if (leftArray[i] <= rightArray[j]) {
                this.array[k] = leftArray[i];
                // 更新合并较小值的详细步骤描述
                this.updateDetailedStep('merging_smaller_value', {
                    value: leftArray[i]
                });
                i++;
            } else {
                this.array[k] = rightArray[j];
                // 更新合并较小值的详细步骤描述
                this.updateDetailedStep('merging_smaller_value', {
                    value: rightArray[j]
                });
                j++;
            }
            
            if (this.visualizer) {
                this.visualizer.highlightPosition(k);
                this.visualizer.renderArray(this.array, true); // 保留状态
                await this.delay();
            }
            
            k++;
        }
        
        // 复制回原数组
        while (i < leftArray.length && !this.isStopped) {
            this.array[k] = leftArray[i];
            this.updateDetailedStep('merging_smaller_value', {
                value: leftArray[i]
            });
            if (this.visualizer) {
                this.visualizer.highlightPosition(k);
                this.visualizer.renderArray(this.array, true); // 保留状态
                await this.delay();
            }
            i++;
            k++;
        }
        
        while (j < rightArray.length && !this.isStopped) {
            this.array[k] = rightArray[j];
            this.updateDetailedStep('merging_smaller_value', {
                value: rightArray[j]
            });
            if (this.visualizer) {
                this.visualizer.highlightPosition(k);
                this.visualizer.renderArray(this.array, true); // 保留状态
                await this.delay();
            }
            j++;
            k++;
        }
        
        // 更新归并排序的总结描述
        this.updateDetailedStep('merge_summary', {});
        
        // 标记合并区域（但不是整个数组时不标记为最终排序）
        // 只有在完全完成时才在主函数中标记
    }
    
    /**
     * 快速排序
     */
    async quickSort() {
        this.currentAlgorithm = 'quickSort';
        await this.quickSortHelper(0, this.array.length - 1);
        
        // 快速排序完成后，所有元素都已经在正确位置，逐个标记为已排序
        if (!this.isStopped && this.visualizer && this.visualizer.sortedIndices) {
            for (let i = 0; i < this.array.length; i++) {
                if (!this.visualizer.sortedIndices.has(i)) {
                    await this.markSorted(i);
                    await this.delay(this.speed / 4); // 快速标记
                }
            }
        }
    }
    
    /**
     * 快速排序辅助函数
     * @param {number} low - 低位索引
     * @param {number} high - 高位索引
     */
    async quickSortHelper(low, high) {
        if (low < high && !this.isStopped) {
            const pivotIndex = await this.partition(low, high);
            
            await this.quickSortHelper(low, pivotIndex - 1);
            await this.quickSortHelper(pivotIndex + 1, high);
        }
        
        // 注意：不要在这里标记单个元素为已排序
        // 只有在整个排序完成后才能确定元素在最终位置
    }
    
    /**
     * 快速排序分区操作
     * @param {number} low - 低位索引
     * @param {number} high - 高位索引
     * @returns {number} 基准元素的最终位置
     */
    async partition(low, high) {
        if (this.isStopped) return low;
        
        const pivot = this.array[high];
        let i = low - 1;
        
        // 更新选择基准的详细步骤描述
        this.updateDetailedStep('selecting_pivot', {
            pivot: pivot
        });
        
        // 高亮基准元素
        if (this.visualizer) {
            this.visualizer.highlightPivot(high);
        }
        
        for (let j = low; j < high && !this.isStopped; j++) {
            this.stats.comparisons++;
            this.stats.pointers = { i: i + 1, j, pivot: high };
            this.updateStats();
            
            if (this.array[j] < pivot) {
                i++;
                if (i !== j) {
                    await this.swap(i, j);
                }
            }
            
            if (this.visualizer) {
                this.visualizer.highlightComparison(j, high);
                await this.delay();
            }
        }
        
        // 将基准元素放到正确位置
        if (i + 1 !== high) {
            await this.swap(i + 1, high);
        }
        
        // 更新基准就位的详细步骤描述
        this.updateDetailedStep('pivot_in_place', {
            pivot: pivot
        });
        
        // 更新快速排序的总结描述
        this.updateDetailedStep('quick_summary', {
            pivot: pivot
        });
        
        // 注意：不要在这里标记基准元素为已排序
        // 基准元素虽然在正确位置，但整个数组还没排序完成
        // 只有在整个排序完成后才标记为绿色
        
        return i + 1;
    }
    
    /**
     * 堆排序
     */
    async heapSort() {
        this.currentAlgorithm = 'heapSort';
        const n = this.array.length;
        
        // 更新开始构建堆的步骤描述
        this.updateDetailedStep('heapify_structure', {
            parentValue: 'building max heap'
        });
        
        // 构建最大堆
        for (let i = Math.floor(n / 2) - 1; i >= 0 && !this.isStopped; i--) {
            // 更新堆化结构调整的详细步骤描述
            this.updateDetailedStep('heapify_structure', {
                parentValue: this.array[i]
            });
            await this.heapify(n, i);
            
            // 添加延迟以便观察堆化过程
            await this.delay(this.speed / 2);
        }
        
        // 更新开始提取元素的步骤描述
        this.updateDetailedStep('extract_heap_max', {
            value: 'starting extraction phase'
        });
        
        // 逐个提取元素
        for (let i = n - 1; i > 0 && !this.isStopped; i--) {
            // 更新提取堆顶最大值的详细步骤描述
            this.updateDetailedStep('extract_heap_max', {
                value: this.array[0]
            });
            
            await this.swap(0, i);
            await this.markSorted(i);
            
            // 更新重新堆化的步骤描述
            this.updateDetailedStep('heapify_structure', {
                parentValue: this.array[0]
            });
            
            await this.heapify(i, 0);
            
            // 更新堆排序的总结描述
            this.updateDetailedStep('heap_summary', {});
            
            // 添加延迟以便观察提取过程
            await this.delay(this.speed / 2);
        }
        
        if (!this.isStopped) {
            await this.markSorted(0);
            // 最终完成步骤描述
            this.updateDetailedStep('heap_summary', {});
        }
    }
    
    /**
     * 堆化操作
     * @param {number} n - 堆大小
     * @param {number} i - 根节点索引
     */
    async heapify(n, i) {
        if (this.isStopped) return;
        
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < n) {
            this.stats.comparisons++;
            this.updateStats();
            
            // 更新比较步骤描述
            this.updateDetailedStep('comparing_positions', {
                value1: this.array[left],
                value2: this.array[largest],
                pos1: left,
                pos2: largest
            });
            
            if (this.array[left] > this.array[largest]) {
                largest = left;
            }
        }
        
        if (right < n) {
            this.stats.comparisons++;
            this.updateStats();
            
            // 更新比较步骤描述
            this.updateDetailedStep('comparing_positions', {
                value1: this.array[right],
                value2: this.array[largest],
                pos1: right,
                pos2: largest
            });
            
            if (this.array[right] > this.array[largest]) {
                largest = right;
            }
        }
        
        if (largest !== i) {
            // 更新堆化结构调整的详细步骤描述
            this.updateDetailedStep('heapify_structure', {
                parentValue: this.array[largest]
            });
            
            await this.swap(i, largest);
            await this.heapify(n, largest);
        }
    }
    
    /**
     * 计数排序
     */
    async countingSort() {
        this.currentAlgorithm = 'countingSort';
        const n = this.array.length;
        const max = Math.max(...this.array);
        const min = Math.min(...this.array);
        const range = max - min + 1;
        
        // 创建计数数组
        const count = new Array(range).fill(0);
        
        // 更新开始计数阶段的步骤描述
        this.updateDetailedStep('counting_summary', {
            value: 'starting counting phase',
            index: 0
        });
        
        // 计数阶段
        for (let i = 0; i < n && !this.isStopped; i++) {
            count[this.array[i] - min]++;
            
            // 更新计数步骤描述
            this.updateDetailedStep('counting_summary', {
                value: this.array[i],
                index: i
            });
            
            if (this.visualizer) {
                this.visualizer.highlightPosition(i);
                await this.delay();
            }
        }
        
        // 更新开始重构阶段的步骤描述
        this.updateDetailedStep('counting_summary', {
            value: 'starting reconstruction phase',
            index: 0
        });
        
        // 重构数组阶段
        let index = 0;
        for (let i = 0; i < range && !this.isStopped; i++) {
            while (count[i] > 0 && !this.isStopped) {
                const value = i + min;
                this.array[index] = value;
                
                // 更新重构数组步骤描述
                this.updateDetailedStep('counting_summary', {
                    value: value,
                    index: index
                });
                
                if (this.visualizer) {
                    this.visualizer.renderArray(this.array, true); // 保留状态
                    this.visualizer.highlightPosition(index);
                    await this.delay();
                }
                
                await this.markSorted(index);
                index++;
                count[i]--;
            }
        }
        
        // 更新计数排序的总结描述
        this.updateDetailedStep('counting_summary', {});
    }
    
    /**
     * 基数排序
     */
    async radixSort() {
        this.currentAlgorithm = 'radixSort';
        const max = Math.max(...this.array);
        
        // 更新开始基数排序的步骤描述
        this.updateDetailedStep('radix_summary', {
            digit: 'starting radix sort'
        });
        
        // 对每一位进行计数排序
        for (let exp = 1; Math.floor(max / exp) > 0 && !this.isStopped; exp *= 10) {
            // 更新基数排序步骤描述
            const digit = Math.log10(exp) + 1;
            this.updateDetailedStep('radix_summary', {
                digit: digit
            });
            
            await this.countingSortByDigit(exp);
            
            // 添加延迟以便观察每一位的排序过程
            await this.delay();
        }
        
        // 基数排序完成后，所有元素都已经在正确位置，逐个标记为已排序
        if (!this.isStopped) {
            // 更新基数排序的总结描述
            this.updateDetailedStep('radix_summary', {});
            
            for (let i = 0; i < this.array.length; i++) {
                if (!this.visualizer.sortedIndices.has(i)) {
                    await this.markSorted(i);
                    await this.delay(this.speed / 4); // 快速标记
                }
            }
        }
    }
    
    /**
     * 按位数进行计数排序
     * @param {number} exp - 当前位数的权重
     */
    async countingSortByDigit(exp) {
        if (this.isStopped) return;
        
        const n = this.array.length;
        const output = new Array(n);
        const count = new Array(10).fill(0);
        
        // 更新开始按位计数的步骤描述
        const currentDigit = Math.log10(exp) + 1;
        this.updateDetailedStep('radix_summary', {
            digit: currentDigit,
            phase: 'counting'
        });
        
        // 计数
        for (let i = 0; i < n; i++) {
            const digit = Math.floor(this.array[i] / exp) % 10;
            count[digit]++;
            
            // 更新计数步骤描述
            this.updateDetailedStep('radix_summary', {
                value: this.array[i],
                digit: digit
            });
            
            if (this.visualizer) {
                this.visualizer.highlightPosition(i);
                await this.delay(this.speed / 2);
            }
        }
        
        // 累积计数
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        // 更新开始构建输出数组的步骤描述
        this.updateDetailedStep('radix_summary', {
            digit: currentDigit,
            phase: 'building output'
        });
        
        // 构建输出数组
        for (let i = n - 1; i >= 0 && !this.isStopped; i--) {
            const digit = Math.floor(this.array[i] / exp) % 10;
            output[count[digit] - 1] = this.array[i];
            count[digit]--;
            
            // 更新基数排序步骤描述
            this.updateDetailedStep('radix_summary', {
                value: this.array[i],
                digit: digit
            });
            
            if (this.visualizer) {
                this.visualizer.highlightPosition(i);
                await this.delay();
            }
        }
        
        // 更新开始复制回原数组的步骤描述
        this.updateDetailedStep('radix_summary', {
            digit: currentDigit,
            phase: 'copying back'
        });
        
        // 复制回原数组
        for (let i = 0; i < n && !this.isStopped; i++) {
            this.array[i] = output[i];
            
            // 更新数组重构步骤描述
            this.updateDetailedStep('radix_summary', {
                value: output[i],
                index: i
            });
            
            if (this.visualizer) {
                this.visualizer.renderArray(this.array, true); // 保留状态
                this.visualizer.highlightPosition(i);
                await this.delay();
            }
        }
        
        // 完成当前位数排序的步骤描述
        this.updateDetailedStep('radix_summary', {
            digit: currentDigit,
            phase: 'completed'
        });
    }
    
    /**
     * 执行指定的排序算法
     * @param {string} algorithm - 算法名称
     */
    async sort(algorithm) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isStopped = false;
        this.isPaused = false;
        this.allElementsSorted = false; // 重置完成标志
        this.stats.startTime = Date.now();
        this.stats.elapsedTime = 0;
        
        // 开始实时耗时更新
        this.startStatsTimer();
        
        try {
            switch (algorithm) {
                case 'bubbleSort':
                    await this.bubbleSort();
                    break;
                case 'selectionSort':
                    await this.selectionSort();
                    break;
                case 'insertionSort':
                    await this.insertionSort();
                    break;
                case 'mergeSort':
                    await this.mergeSort();
                    break;
                case 'quickSort':
                    await this.quickSort();
                    break;
                case 'heapSort':
                    await this.heapSort();
                    break;
                case 'countingSort':
                    await this.countingSort();
                    break;
                case 'radixSort':
                    await this.radixSort();
                    break;
                default:
                    console.error('Unknown sorting algorithm:', algorithm);
            }
        } catch (error) {
            console.error('Sorting error:', error);
        } finally {
            this.isRunning = false;
            this.stats.elapsedTime = Date.now() - this.stats.startTime;
            
            // 停止实时耗时更新
            this.stopStatsTimer();
            
            // 最后更新一次统计
            this.updateStats();
            
            // 确保所有元素都标记为已排序（只在排序成功完成且非教学模式时）
            if (!this.isStopped && this.visualizer && !this.allElementsSorted && !this.teachingMode) {
                // 清除所有活跃状态
                this.visualizer.clearActiveHighlights();
                
                // 标记所有元素为已排序
                const allIndices = Array.from({ length: this.array.length }, (_, i) => i);
                this.visualizer.markAsSorted(allIndices);
                this.allElementsSorted = true;
            }
        }
    }
}

// 导出类供其他模块使用
window.SortingEngine = SortingEngine;