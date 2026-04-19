/**
 * UI控制器 - 负责用户界面交互和动画控制
 * UI Handler - Handles user interface interactions and animation control
 */

class Visualizer {
    constructor(container) {
        this.container = container || document.getElementById('array-container');
        this.bars = [];
        this.activeIndices = new Set();
        this.sortedIndices = new Set();
        this.pivotIndex = -1;
        this.maxValue = 100;
        
        // 6种状态定义
        this.states = {
            WAITING: 'waiting',      // 待排 - 青色
            COMPARING: 'comparing',  // 比较 - 黄色
            MOVING: 'moving',        // 移动 - 蓝色
            INSERTING: 'inserting',  // 待插 - 青色
            SWAPPING: 'swapping',    // 交换 - 红色
            COMPLETED: 'completed',  // 完成 - 绿色
            MARKED: 'marked'         // 标记 - 紫色
        };
        
        // 状态颜色映射 - 优化的颜色方案
        this.stateColors = {
            [this.states.WAITING]: 'linear-gradient(135deg, #87ceeb 0%, #5dade2 100%)',      // 亮浅蓝色 - 待排
            [this.states.COMPARING]: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',   // 黄色 - 比较
            [this.states.MOVING]: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',      // 蓝色 - 移动
            [this.states.INSERTING]: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',   // 红色 - 待插
            [this.states.SWAPPING]: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',    // 红色 - 交换
            [this.states.COMPLETED]: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',   // 亮深绿色 - 已排
            [this.states.MARKED]: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)'       // 紫色 - 标记
        };
        
        // 状态阴影映射 - 清晰边缘的轻微阴影效果
        this.stateShadows = {
            [this.states.WAITING]: '0 1px 3px rgba(135, 206, 235, 0.2)',      // 轻微浅蓝色阴影
            [this.states.COMPARING]: '0 1px 3px rgba(255, 193, 7, 0.3)',      // 轻微黄色阴影
            [this.states.MOVING]: '0 1px 3px rgba(0, 123, 255, 0.3)',         // 轻微蓝色阴影
            [this.states.INSERTING]: '0 2px 4px rgba(220, 53, 69, 0.3)',      // 轻微红色阴影 - 待插
            [this.states.SWAPPING]: '0 2px 4px rgba(220, 53, 69, 0.3)',       // 轻微红色阴影 - 交换
            [this.states.COMPLETED]: '0 1px 3px rgba(39, 174, 96, 0.2)',      // 轻微深绿色阴影
            [this.states.MARKED]: '0 1px 3px rgba(156, 39, 176, 0.3)'         // 轻微紫色阴影
        };
        
        // 状态文本映射（中英文）
        this.stateTexts = {
            zh: {
                [this.states.WAITING]: '待排',
                [this.states.COMPARING]: '比较',
                [this.states.MOVING]: '移动',
                [this.states.INSERTING]: '待插',
                [this.states.SWAPPING]: '交换',
                [this.states.COMPLETED]: '完成',
                [this.states.MARKED]: '标记'
            },
            en: {
                [this.states.WAITING]: 'Wait',
                [this.states.COMPARING]: 'Comp',
                [this.states.MOVING]: 'Move',
                [this.states.INSERTING]: 'Insert',
                [this.states.SWAPPING]: 'Swap',
                [this.states.COMPLETED]: 'Done',
                [this.states.MARKED]: 'Mark'
            }
        };
        
        // 状态文本颜色映射 - 与状态颜色保持一致的亮色
        this.stateTextColors = {
            [this.states.WAITING]: '#87ceeb',      // 亮浅蓝色文字
            [this.states.COMPARING]: '#ffeb3b',    // 亮黄色文字
            [this.states.MOVING]: '#2196f3',       // 亮蓝色文字
            [this.states.INSERTING]: '#dc3545',    // 红色文字 - 待插
            [this.states.SWAPPING]: '#dc3545',     // 红色文字 - 交换（与待插同色）
            [this.states.COMPLETED]: '#27ae60',    // 亮深绿色文字
            [this.states.MARKED]: '#9c27b0'        // 紫色文字
        };
        
        // 柱子状态映射
        this.barStates = new Map(); // index -> state
    }
    
    /**
     * 渲染数组为柱状图
     * @param {Array} array - 要渲染的数组
     * @param {boolean} preserveStates - 是否保留当前状态（颜色等）
     */
    renderArray(array, preserveStates = false) {
        if (!this.container) return;
        
        // 保存当前状态
        const currentSortedIndices = preserveStates ? new Set(this.sortedIndices) : new Set();
        const currentActiveIndices = preserveStates ? new Set(this.activeIndices) : new Set();
        const currentPivotIndex = preserveStates ? this.pivotIndex : -1;
        const currentBarStates = preserveStates ? new Map(this.barStates) : new Map();
        
        this.container.innerHTML = '';
        this.bars = [];
        this.maxValue = Math.max(...array);
        
        const containerHeight = this.container.clientHeight - 80; // 增加更多空间显示状态文本
        
        // 固定容器宽度基于40个柱体的参考尺寸
        const referenceBarCount = 40;
        const referenceBarWidth = 20;
        const barGap = 2;
        const fixedTotalWidth = referenceBarCount * referenceBarWidth + (referenceBarCount - 1) * barGap;
        
        // 根据当前数组大小计算柱体宽度
        const barWidth = Math.max(8, (fixedTotalWidth - (array.length - 1) * barGap) / array.length);
        
        // 设置容器的固定宽度
        this.container.style.width = `${fixedTotalWidth}px`;
        this.container.style.margin = '0 auto'; // 居中显示
        
        array.forEach((value, index) => {
            const bar = this.createBar(value, index, barWidth, containerHeight);
            this.container.appendChild(bar);
            this.bars.push(bar);
        });
        
        // 恢复状态
        if (preserveStates) {
            this.sortedIndices = currentSortedIndices;
            this.activeIndices = currentActiveIndices;
            this.pivotIndex = currentPivotIndex;
            this.barStates = currentBarStates;
            
            // 重新应用状态
            this.barStates.forEach((state, index) => {
                if (this.bars[index]) {
                    this.setBarState(index, state);
                }
            });
        } else {
            // 如果不保留状态，确保清除所有状态集合
            this.sortedIndices.clear();
            this.activeIndices.clear();
            this.pivotIndex = -1;
            this.barStates.clear();
        }
    }
    
    /**
     * 创建单个柱子元素
     * @param {number} value - 柱子的值
     * @param {number} index - 柱子的索引
     * @param {number} width - 柱子宽度
     * @param {number} maxHeight - 最大高度
     * @returns {HTMLElement} 柱子元素
     */
    createBar(value, index, width, maxHeight) {
        const bar = document.createElement('div');
        const height = (value / this.maxValue) * maxHeight;
        
        bar.className = 'array-bar';
        bar.style.cssText = `
            width: ${width}px;
            height: ${height}px;
            background: ${this.stateColors[this.states.WAITING]};
            margin: 0 1px;
            border-radius: 4px 4px 0 0;
            border: 2px solid rgba(255, 255, 255, 0.3);
            position: relative;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            box-shadow: ${this.stateShadows[this.states.WAITING]};
            flex-shrink: 0;
        `;
        
        // 设置初始状态
        this.barStates.set(index, this.states.WAITING);
        
        // 顶部数值 - 根据柱子宽度调整字体大小
        const valueLabel = document.createElement('div');
        valueLabel.className = 'bar-value';
        valueLabel.textContent = value;
        const fontSize = Math.max(10, Math.min(12, width * 0.6)); // 根据宽度自适应字体大小
        valueLabel.style.cssText = `
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            color: #ffffff;
            font-size: ${fontSize}px;
            font-weight: bold;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            white-space: nowrap;
        `;
        
        // 底部索引 - 根据柱子宽度调整字体大小
        const indexLabel = document.createElement('div');
        indexLabel.className = 'bar-index';
        indexLabel.textContent = index;
        const indexFontSize = Math.max(8, Math.min(10, width * 0.5)); // 索引字体稍小
        indexLabel.style.cssText = `
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            color: #b0b0b0;
            font-size: ${indexFontSize}px;
            white-space: nowrap;
        `;
        
        // 状态文本 - 根据柱子宽度调整字体大小，使用对应的状态颜色
        const statusLabel = document.createElement('div');
        statusLabel.className = 'bar-status';
        const statusFontSize = Math.max(7, Math.min(9, width * 0.4)); // 状态文字稍大一些
        const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'zh';
        statusLabel.textContent = this.stateTexts[currentLang][this.states.WAITING];
        statusLabel.style.cssText = `
            position: absolute;
            bottom: -55px;
            left: 50%;
            transform: translateX(-50%);
            color: ${this.stateTextColors[this.states.WAITING]};
            font-size: ${statusFontSize}px;
            font-weight: bold;
            white-space: nowrap;
            text-align: center;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        `;
        
        bar.appendChild(valueLabel);
        bar.appendChild(indexLabel);
        bar.appendChild(statusLabel);
        
        return bar;
    }
    
    /**
     * 设置柱子状态
     * @param {number} index - 柱子索引
     * @param {string} state - 状态
     */
    setBarState(index, state) {
        if (!this.bars[index] || !this.states[state.toUpperCase()]) return;
        
        const bar = this.bars[index];
        const stateKey = this.states[state.toUpperCase()];
        
        // 更新状态映射
        this.barStates.set(index, stateKey);
        
        // 更新柱子样式
        bar.style.background = this.stateColors[stateKey];
        bar.style.boxShadow = this.stateShadows[stateKey];
        
        // 更新状态文本和颜色
        const statusLabel = bar.querySelector('.bar-status');
        if (statusLabel) {
            const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'zh';
            statusLabel.textContent = this.stateTexts[currentLang][stateKey];
            statusLabel.style.color = this.stateTextColors[stateKey]; // 设置对应的状态颜色
        }
        
        // 根据状态设置变换效果
        switch (stateKey) {
            case this.states.COMPARING:
            case this.states.MOVING:
            case this.states.INSERTING:
                bar.style.transform = 'translateY(-5px)';
                break;
            case this.states.SWAPPING:
                bar.style.transform = 'translateY(-8px) scale(1.05)';
                break;
            case this.states.MARKED:
                bar.style.transform = 'translateY(-3px)';
                break;
            default:
                bar.style.transform = 'translateY(0)';
        }
    }
    
    /**
     * 批量设置柱子状态
     * @param {Array} indices - 柱子索引数组
     * @param {string} state - 状态
     */
    setBarStates(indices, state) {
        indices.forEach(index => this.setBarState(index, state));
    }
    
    /**
     * 重置柱子到待排状态
     * @param {number} index - 柱子索引
     */
    resetBarState(index) {
        this.setBarState(index, this.states.WAITING);
    }
    
    /**
     * 重置所有柱子到待排状态
     */
    resetAllBarStates() {
        for (let i = 0; i < this.bars.length; i++) {
            this.resetBarState(i);
        }
        this.barStates.clear();
    }
    /**
     * 高亮比较中的元素
     * @param {number} i - 第一个元素索引
     * @param {number} j - 第二个元素索引
     */
    highlightComparison(i, j) {
        // 设置比较状态
        this.setBarState(i, this.states.COMPARING);
        this.setBarState(j, this.states.COMPARING);
        
        // 添加箭头指示
        this.addArrow(i);
        this.addArrow(j);
        
        this.activeIndices.add(i);
        this.activeIndices.add(j);
    }
    
    /**
     * 高亮交换中的元素
     * @param {number} i - 第一个元素索引
     * @param {number} j - 第二个元素索引
     */
    highlightSwap(i, j) {
        // 设置交换状态
        this.setBarState(i, this.states.SWAPPING);
        this.setBarState(j, this.states.SWAPPING);
        
        // 添加箭头指示
        this.addArrow(i);
        this.addArrow(j);
        
        this.activeIndices.add(i);
        this.activeIndices.add(j);
    }
    
    /**
     * 高亮移动中的元素
     * @param {number} index - 元素索引
     */
    highlightMove(index) {
        this.setBarState(index, this.states.MOVING);
        this.addArrow(index);
        this.activeIndices.add(index);
    }
    
    /**
     * 高亮插入位置
     * @param {number} index - 元素索引
     */
    highlightInsertion(index) {
        this.setBarState(index, this.states.INSERTING);
        this.addArrow(index);
        this.activeIndices.add(index);
    }
    
    /**
     * 高亮单个位置（兼容旧方法）
     * @param {number} index - 元素索引
     */
    highlightPosition(index) {
        this.setBarState(index, this.states.MARKED);
    }
    
    /**
     * 高亮基准元素
     * @param {number} index - 基准元素索引
     */
    highlightPivot(index) {
        this.setBarState(index, this.states.MARKED);
        this.addArrow(index);
        this.pivotIndex = index;
    }
    
    /**
     * 标记元素为已排序
     * @param {number|Array} indices - 索引或索引数组
     */
    markAsSorted(indices) {
        const indexArray = Array.isArray(indices) ? indices : [indices];
        
        indexArray.forEach(index => {
            this.setBarState(index, this.states.COMPLETED);
            this.sortedIndices.add(index);
            
            // 移除箭头（已排序元素不需要箭头）
            const arrow = this.bars[index]?.querySelector('.arrow');
            if (arrow) {
                arrow.remove();
            }
        });
    }
    
    /**
     * 添加红色箭头指示
     * @param {number} index - 元素索引
     */
    addArrow(index) {
        if (!this.bars[index]) return;
        
        // 移除已存在的箭头
        const existingArrow = this.bars[index].querySelector('.arrow');
        if (existingArrow) {
            existingArrow.remove();
        }
        
        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        arrow.innerHTML = '▲';
        arrow.style.cssText = `
            position: absolute;
            bottom: -35px;
            left: 50%;
            transform: translateX(-50%);
            color: #dc3545;
            font-size: 14px;
            animation: bounce 0.6s ease-in-out infinite alternate;
        `;
        
        this.bars[index].appendChild(arrow);
        
        // 添加弹跳动画
        if (!document.querySelector('#bounce-animation')) {
            const style = document.createElement('style');
            style.id = 'bounce-animation';
            style.textContent = `
                @keyframes bounce {
                    0% { transform: translateX(-50%) translateY(0); }
                    100% { transform: translateX(-50%) translateY(-5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * 清除活跃元素的高亮效果（保留已排序元素的颜色）
     */
    clearActiveHighlights() {
        this.activeIndices.forEach(index => {
            if (this.bars[index] && !this.sortedIndices.has(index)) {
                // 重置为待排状态
                this.setBarState(index, this.states.WAITING);
                
                // 移除箭头
                const arrow = this.bars[index].querySelector('.arrow');
                if (arrow) {
                    arrow.remove();
                }
            }
        });
        
        // 清除基准元素高亮（但保持已排序状态）
        if (this.pivotIndex >= 0 && this.bars[this.pivotIndex] && !this.sortedIndices.has(this.pivotIndex)) {
            this.setBarState(this.pivotIndex, this.states.WAITING);
            
            const arrow = this.bars[this.pivotIndex].querySelector('.arrow');
            if (arrow) {
                arrow.remove();
            }
        }
        
        this.activeIndices.clear();
        this.pivotIndex = -1;
        
        // 确保已排序的元素保持完成状态
        this.sortedIndices.forEach(index => {
            if (this.bars[index]) {
                this.setBarState(index, this.states.COMPLETED);
            }
        });
    }
    
    /**
     * 清除所有高亮效果（包括已排序元素）
     */
    clearHighlights() {
        this.bars.forEach((bar, index) => {
            this.setBarState(index, this.states.WAITING);
            
            // 移除箭头
            const arrow = bar.querySelector('.arrow');
            if (arrow) {
                arrow.remove();
            }
        });
        
        this.activeIndices.clear();
        this.sortedIndices.clear();
        this.pivotIndex = -1;
    }
    
    /**
     * 重置所有状态
     */
    reset() {
        // 清除所有状态集合
        this.sortedIndices.clear();
        this.activeIndices.clear();
        this.pivotIndex = -1;
        
        // 重置所有柱子状态
        this.resetAllBarStates();
        
        // 移除所有箭头
        this.bars.forEach((bar) => {
            const arrow = bar.querySelector('.arrow');
            if (arrow) {
                arrow.remove();
            }
        });
    }
    
    /**
     * 格式化耗时显示 - 固定位置版本
     * @param {number} elapsedTime - 耗时（毫秒）
     * @returns {string} 格式化后的耗时字符串
     */
    formatElapsedTime(elapsedTime) {
        if (elapsedTime < 1000) {
            // 小于1秒时，毫秒部分固定3位，右对齐
            return `${elapsedTime.toString().padStart(3, ' ')}ms`;
        }
        
        const seconds = Math.floor(elapsedTime / 1000);
        const milliseconds = elapsedTime % 1000;
        
        if (seconds < 60) {
            // 1-59秒：秒部分固定2位，毫秒部分固定3位
            const secPart = seconds.toString().padStart(2, ' ');
            const msPart = milliseconds.toString().padStart(3, '0');
            return `${secPart}s+${msPart}ms`;
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        // 1分钟以上：分钟固定2位，秒固定2位，毫秒固定3位
        const minPart = minutes.toString().padStart(2, ' ');
        const secPart = remainingSeconds.toString().padStart(2, '0');
        const msPart = milliseconds.toString().padStart(3, '0');
        
        if (remainingSeconds === 0 && milliseconds === 0) {
            return `${minPart}m+00s+000ms`;
        } else if (milliseconds === 0) {
            return `${minPart}m+${secPart}s+000ms`;
        } else if (remainingSeconds === 0) {
            return `${minPart}m+00s+${msPart}ms`;
        } else {
            return `${minPart}m+${secPart}s+${msPart}ms`;
        }
    }

    /**
     * 更新统计显示
     * @param {Object} stats - 统计数据
     */
    updateStats(stats) {
        const elements = {
            'comparison-count': stats.comparisons,
            'swap-count': stats.swaps,
            'elapsed-time': this.formatElapsedTime(stats.elapsedTime),
            'sorted-count': this.sortedIndices.size
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // 更新指针信息
        this.updatePointers(stats.pointers);
    }
    
    /**
     * 更新指针显示
     * @param {Object} pointers - 指针对象
     */
    updatePointers(pointers) {
        const pointerContainer = document.getElementById('pointer-values');
        if (!pointerContainer) return;
        
        pointerContainer.innerHTML = '';
        
        Object.entries(pointers).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                const pointerDiv = document.createElement('div');
                pointerDiv.style.cssText = `
                    display: inline-block;
                    margin: 2px 8px;
                    padding: 2px 8px;
                    background: rgba(74, 158, 255, 0.2);
                    border-radius: 4px;
                    font-size: 12px;
                `;
                pointerDiv.textContent = `${key}: ${value}`;
                pointerContainer.appendChild(pointerDiv);
            }
        });
    }
    

}

class UIHandler {
    constructor() {
        this.visualizer = new Visualizer();
        this.sortingEngine = new SortingEngine(this.visualizer);
        
        // 确保语言管理器已初始化
        this.languageManager = window.languageManager;
        if (!this.languageManager) {
            console.error('Language manager not found, creating new instance');
            this.languageManager = new LanguageManager();
            window.languageManager = this.languageManager;
        }
        
        this.currentAlgorithm = 'bubbleSort';
        this.arraySize = 30;
        this.speed = 50;
        this.displayMode = 'steps';
        this.teachingMode = false;
        this.isModalOpen = false;
        
        // 持久化教学弹窗相关属性
        this.persistentTeachingModal = null;
        this.continueStepBtn = null;
        this.currentOperationText = null;
        this.algorithmExplanationText = null;
        this.currentTeachingPromiseResolve = null; // 用于解析待处理的教学Promise
        
        this.array = [];
        
        this.init();
    }
    
    /**
     * 初始化UI控制器
     */
    init() {
        this.bindEvents();
        this.generateNewArray();
        this.updateAlgorithmInfo();
        
        // 监听语言切换事件
        document.addEventListener('languageChanged', (event) => {
            this.updateAlgorithmInfo();
        });
    }
    
    /**
     * 绑定所有事件监听器
     */
    bindEvents() {
        // 控制按钮事件
        document.getElementById('generate-array')?.addEventListener('click', () => this.generateNewArray());
        document.getElementById('start-sort')?.addEventListener('click', () => this.startSorting());
        document.getElementById('pause-sort')?.addEventListener('click', () => this.pauseSorting());
        document.getElementById('resume-sort')?.addEventListener('click', () => this.resumeSorting());
        document.getElementById('reset-sort')?.addEventListener('click', () => this.resetSorting());
        document.getElementById('complexity-compare')?.addEventListener('click', () => this.showComplexityComparison());
        document.getElementById('teaching-mode')?.addEventListener('click', () => this.toggleTeachingMode());
        
        // 参数控制事件
        document.getElementById('algorithm-select')?.addEventListener('change', (e) => {
            this.changeAlgorithm(e.target.value);
            // 用户主动切换算法时显示介绍弹窗
            this.showAlgorithmInfo(e.target.value);
        });
        document.getElementById('array-size')?.addEventListener('input', (e) => this.changeArraySize(parseInt(e.target.value)));
        document.getElementById('sort-speed')?.addEventListener('input', (e) => this.changeSpeed(parseInt(e.target.value)));
        
        // 显示模式切换事件 - 确保正确绑定
        const displayModeSelect = document.getElementById('display-mode');
        if (displayModeSelect) {
            displayModeSelect.addEventListener('change', (e) => {
                console.log('Display mode select changed:', e.target.value); // 调试日志
                this.changeDisplayMode(e.target.value);
            });
        } else {
            console.warn('Display mode select not found'); // 调试日志
        }
        
        // 确保语言管理器已经设置好事件绑定
        // (语言管理器会在自己的构造函数中处理事件绑定)
        
        // 模态框事件
        this.bindModalEvents();
        
        // 窗口大小变化事件
        window.addEventListener('resize', () => {
            if (this.array.length > 0) {
                this.visualizer.renderArray(this.array);
            }
        });
    }
    
    /**
     * 绑定模态框事件
     */
    bindModalEvents() {
        // 模态框事件现在在显示时动态绑定，这里不需要预先绑定
        // 这样可以避免事件冲突和绑定失效的问题
    }
    
    /**
     * 生成新的随机数组
     */
    generateNewArray() {
        // 先停止任何正在进行的排序
        if (this.sortingEngine.isRunning) {
            this.sortingEngine.stop();
        }
        
        this.array = Array.from({ length: this.arraySize }, () => 
            Math.floor(Math.random() * 90) + 10
        );
        
        this.sortingEngine.setArray(this.array);
        
        // 确保完全重置可视化器状态
        this.visualizer.reset(); // 先重置状态
        this.visualizer.renderArray(this.array); // 然后渲染数组
        
        // 清除代码高亮
        this.clearCodeHighlighting();
        
        // 重置按钮状态
        this.setButtonStates('ready');
        
        this.updateCurrentStep(this.languageManager.getText('defaultMessages.readyToSort'));
    }
    
    /**
     * 开始排序
     */
    async startSorting() {
        // 确保排序引擎的教学模式状态与UI同步
        if (this.sortingEngine) {
            this.sortingEngine.setTeachingMode(this.teachingMode);
            this.sortingEngine.sortingInBackground = false; // 重置后台排序标志
        }
        
        // 直接开始排序，不显示任何弹窗
        this.setButtonStates('sorting');
        const algorithmName = this.languageManager.getText(`algorithms.${this.currentAlgorithm}`);
        this.updateCurrentStep(`开始执行${algorithmName}...`);
        
        try {
            await this.sortingEngine.sort(this.currentAlgorithm);
            
            // 检查是否在后台排序完成
            if (this.sortingEngine.sortingInBackground) {
                const currentLang = this.languageManager.getCurrentLanguage();
                const completedMessage = currentLang === 'zh' ? 
                    `${algorithmName}完成！数组已完全排序。(后台执行完成)` :
                    `${algorithmName} completed! Array is fully sorted. (Background execution completed)`;
                this.updateCurrentStep(completedMessage);
            } else {
                this.updateCurrentStep(`${algorithmName}完成！数组已完全排序。`);
            }
        } catch (error) {
            console.error('Sorting error:', error);
            this.updateCurrentStep('排序过程中出现错误');
        } finally {
            this.setButtonStates('completed');
            // 重置后台排序标志
            if (this.sortingEngine) {
                this.sortingEngine.sortingInBackground = false;
            }
        }
    }
    
    /**
     * 暂停排序
     */
    pauseSorting() {
        this.sortingEngine.pause();
        this.setButtonStates('paused');
        this.updateCurrentStep('排序已暂停');
    }
    
    /**
     * 继续排序
     */
    resumeSorting() {
        this.sortingEngine.resume();
        this.setButtonStates('sorting');
        this.updateCurrentStep('继续排序...');
    }
    
    /**
     * 重置排序
     */
    resetSorting() {
        // 强制停止排序引擎
        if (this.sortingEngine) {
            this.sortingEngine.reset();
        }
        
        // 重置教学模式相关状态
        if (this.sortingEngine) {
            this.sortingEngine.sortingInBackground = false;
        }
        
        // 确保关闭任何打开的模态框
        this.closeAllModals();
        
        // 如果教学模式开启且有持久化弹窗，重置弹窗内容但不关闭
        if (this.teachingMode && this.persistentTeachingModal) {
            const currentLang = this.languageManager.getCurrentLanguage();
            this.updatePersistentTeachingModal(
                currentLang === 'zh' ? '等待排序开始...' : 'Waiting for sorting to start...',
                currentLang === 'zh' ? '点击"开始排序"后，这里将显示每一步的详细解释。' : 'Detailed explanations for each step will be shown here after clicking "Start Sorting".'
            );
            
            // 禁用继续按钮
            if (this.continueStepBtn) {
                this.continueStepBtn.disabled = true;
                this.continueStepBtn.style.opacity = '0.6';
                this.continueStepBtn.style.cursor = 'not-allowed';
            }
        }
        
        // 确保数组显示正确 - 先重置可视化器
        if (this.visualizer && this.array) {
            this.visualizer.reset();
            this.visualizer.renderArray(this.array);
        }
        
        // 重置UI状态 - 在可视化器重置之后进行，确保状态正确
        this.setButtonStates('ready');
        
        // 强制更新当前步骤显示 - 使用 setTimeout 确保在所有异步操作完成后执行
        setTimeout(() => {
            const readyMessage = this.languageManager.getText('defaultMessages.readyToSort');
            this.updateCurrentStep(readyMessage);
            
            // 额外保险：直接更新DOM元素，确保显示正确
            const stepElement = document.getElementById('current-step');
            if (stepElement && !stepElement.textContent.includes(readyMessage)) {
                stepElement.textContent = readyMessage;
            }
        }, 200); // 增加延迟时间，确保所有重置操作完成
    }
    
    /**
     * 关闭所有模态框
     */
    closeAllModals() {
        this.isModalOpen = false;
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    /**
     * 切换算法
     * @param {string} algorithm - 算法名称
     */
    changeAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;
        
        // 清除代码高亮
        this.clearCodeHighlighting();
        
        this.updateAlgorithmInfo();
        // 注意：不要在这里自动显示介绍弹窗
        // 只有在用户主动切换算法时才显示（在事件监听器中处理）
    }
    
    /**
     * 改变数组大小
     * @param {number} size - 新的数组大小
     */
    changeArraySize(size) {
        this.arraySize = Math.max(5, Math.min(70, size));
        document.getElementById('array-size-value').textContent = this.arraySize;
        this.generateNewArray();
    }
    
    /**
     * 改变排序速度
     * @param {number} speed - 新的速度值
     */
    changeSpeed(speed) {
        this.speed = Math.max(5, Math.min(300, speed));
        const speedUnit = this.languageManager.getText('speedUnit');
        document.getElementById('sort-speed-value').textContent = `${this.speed}${speedUnit}`;
        
        // 更新排序引擎的速度
        if (this.sortingEngine) {
            this.sortingEngine.speed = this.speed;
        }
    }
    
    /**
     * 改变显示模式
     * @param {string} mode - 显示模式
     */
    changeDisplayMode(mode) {
        console.log('Changing display mode to:', mode); // 调试日志
        this.displayMode = mode;
        
        // 根据显示模式更新界面
        switch (mode) {
            case 'steps':
                // 步骤说明模式 - 根据当前语言显示对应的步骤描述
                const currentLang = this.languageManager.getCurrentLanguage();
                const modeMessage = currentLang === 'zh' ? 
                    '步骤说明模式已启用 - 将显示详细的操作步骤' : 
                    'Step description mode enabled - detailed operation steps will be shown';
                this.updateCurrentStep(modeMessage);
                break;
                
            case 'code':
                // 代码模式 - 显示当前执行的代码行，注释根据语言显示
                const codeModeMessage = this.languageManager.getCurrentLanguage() === 'zh' ? 
                    '代码显示模式已启用 - 将显示当前执行的代码行' : 
                    'Code display mode enabled - current executing code line will be shown';
                this.updateCurrentStep(codeModeMessage);
                break;
                
            default:
                this.updateCurrentStep('显示模式已更新');
        }
        
        console.log('Display mode changed to:', mode);
        
        // 触发显示模式切换事件，供其他组件监听
        document.dispatchEvent(new CustomEvent('displayModeChanged', {
            detail: { mode: mode }
        }));
    }
    
    /**
     * 显示当前执行的代码行
     * @param {string} codeLine - 当前执行的代码行
     * @param {string} explanation - 代码解释（可选）
     */
    showCurrentCodeLine(codeLine, explanation = '') {
        if (this.displayMode !== 'code') return;
        
        const stepElement = document.getElementById('current-step');
        if (stepElement) {
            let content = `
                <div style="font-family: monospace; font-size: 14px; line-height: 1.6; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <div style="color: #ffc107; font-weight: bold; margin-bottom: 8px;">正在执行:</div>
                    <div style="color: #ffffff; background: rgba(255,193,7,0.1); padding: 8px; border-radius: 4px;">
                        ${codeLine}
                    </div>
            `;
            
            if (explanation) {
                content += `
                    <div style="color: #b0b0b0; font-size: 12px; margin-top: 10px; font-family: 'Segoe UI', sans-serif;">
                        <strong>说明:</strong> ${explanation}
                    </div>
                `;
            }
            
            content += '</div>';
            stepElement.innerHTML = content;
        }
    }
    
    /**
     * 更新后台排序状态显示
     * @param {boolean} isBackgroundSorting - 是否在后台排序
     */
    updateBackgroundSortingStatus(isBackgroundSorting) {
        if (isBackgroundSorting) {
            const algorithm = this.languageManager.getText(`algorithms.${this.currentAlgorithm}`);
            const currentLang = this.languageManager.getCurrentLanguage();
            const message = currentLang === 'zh' ? 
                `${algorithm}正在后台执行中... (已关闭教学模式)` :
                `${algorithm} is running in background... (Teaching mode disabled)`;
            
            // 更新当前步骤显示
            const stepElement = document.getElementById('current-step');
            if (stepElement) {
                stepElement.innerHTML = `
                    <div style="color: #ffc107; font-weight: bold; padding: 10px; background: rgba(255, 193, 7, 0.1); border-radius: 8px; border-left: 4px solid #ffc107;">
                        <span style="margin-right: 8px;">⚡</span>${message}
                    </div>
                `;
            }
        }
    }

    /**
     * 切换教学模式
     */
    async toggleTeachingMode() {
        if (this.teachingMode) {
            // 关闭教学模式
            this.teachingMode = false;
            this.closePersistentTeachingModal();
        } else {
            // 开启教学模式
            this.teachingMode = true;
            await this.showTeachingModeIntroduction();
        }
        
        // 更新按钮状态
        this.updateTeachingModeButton();
        
        // 更新排序引擎的教学模式状态
        if (this.sortingEngine) {
            this.sortingEngine.setTeachingMode(this.teachingMode);
            // 重置后台排序标志
            if (this.teachingMode) {
                this.sortingEngine.sortingInBackground = false;
            }
        }
        
        // 显示教学模式状态提示
        const statusMessage = this.teachingMode ?
            (this.languageManager.getCurrentLanguage() === 'zh' ? '教学模式已开启：每步排序将显示详细解释' : 'Teaching mode enabled: detailed explanations will be shown for each step') :
            (this.languageManager.getCurrentLanguage() === 'zh' ? '教学模式已关闭：排序将连续执行' : 'Teaching mode disabled: sorting will run continuously');
        
        this.updateCurrentStep(statusMessage);
    }
    
    /**
     * 更新教学模式按钮状态
     */
    updateTeachingModeButton() {
        const button = document.getElementById('teaching-mode');
        if (button) {
            button.style.background = this.teachingMode ? 
                'linear-gradient(135deg, #28a745 0%, #20c997 100%)' :
                'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
            
            // 更新按钮文本
            const spans = button.querySelectorAll('span');
            if (spans.length >= 2) {
                spans[1].textContent = this.teachingMode ? 
                    (this.languageManager.getCurrentLanguage() === 'zh' ? '教学模式 (开启)' : 'Teaching Mode (ON)') :
                    this.languageManager.getText('teachingMode');
            }
        }
    }
    
    /**
     * 显示教学模式介绍弹窗
     * @returns {Promise} 介绍弹窗关闭的Promise
     */
    showTeachingModeIntroduction() {
        return new Promise((resolve) => {
            const currentLang = this.languageManager.getCurrentLanguage();
            const title = currentLang === 'zh' ? '教学模式介绍' : 'Teaching Mode Introduction';
            const instructions = currentLang === 'zh' ? 
                '教学模式说明：\n• 排序过程将逐步执行\n• 每一步都会显示详细解释\n• 点击"继续"按钮进入下一步\n• 可随时关闭教学模式恢复连续执行' :
                'Teaching Mode Instructions:\n• Sorting will execute step by step\n• Detailed explanations will be shown for each step\n• Click "Continue" button to proceed to next step\n• You can disable teaching mode anytime to resume continuous execution';
            
            // 创建介绍弹窗
            const introModal = document.createElement('div');
            introModal.id = 'teaching-intro-modal';
            introModal.className = 'teaching-prompt';
            introModal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 450px;
                max-width: 90vw;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #4a9eff;
                border-radius: 15px;
                padding: 25px;
                z-index: 2000;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
                color: white;
                animation: fadeInScale 0.3s ease-out;
            `;
            
            introModal.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4a9eff; margin: 0 0 15px 0; font-size: 20px;">📚 ${title}</h2>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="white-space: pre-line; line-height: 1.6; margin: 0; font-size: 14px;">${instructions}</p>
                </div>
                <div style="text-align: center;">
                    <button id="understand-btn" style="
                        background: linear-gradient(135deg, #4a9eff 0%, #0078d4 100%);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        padding: 12px 24px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
                        transition: all 0.3s ease;
                    ">${currentLang === 'zh' ? '我知道了' : 'Got it'}</button>
                </div>
            `;
            
            // 添加动画样式
            if (!document.querySelector('#teaching-modal-animations')) {
                const style = document.createElement('style');
                style.id = 'teaching-modal-animations';
                style.textContent = `
                    @keyframes fadeInScale {
                        0% { 
                            opacity: 0;
                            transform: translate(-50%, -50%) scale(0.8);
                        }
                        100% { 
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1);
                        }
                    }
                    @keyframes fadeOutScale {
                        0% { 
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1);
                        }
                        100% { 
                            opacity: 0;
                            transform: translate(-50%, -50%) scale(0.8);
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // 创建背景遮罩
            const backdrop = document.createElement('div');
            backdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                z-index: 1999;
            `;
            
            document.body.appendChild(backdrop);
            document.body.appendChild(introModal);
            
            // 绑定关闭事件
            const understandBtn = introModal.querySelector('#understand-btn');
            
            const closeIntroduction = () => {
                introModal.style.animation = 'fadeOutScale 0.3s ease-in';
                backdrop.style.opacity = '0';
                backdrop.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    if (introModal.parentElement) {
                        introModal.remove();
                    }
                    if (backdrop.parentElement) {
                        backdrop.remove();
                    }
                    // 介绍弹窗关闭后，显示持久化教学步骤弹窗
                    this.showPersistentTeachingModal();
                    resolve();
                }, 300);
            };
            
            understandBtn.addEventListener('click', closeIntroduction);
            
            // 按钮悬停效果
            understandBtn.addEventListener('mouseenter', () => {
                understandBtn.style.transform = 'translateY(-2px)';
                understandBtn.style.boxShadow = '0 6px 20px rgba(74, 158, 255, 0.4)';
            });
            
            understandBtn.addEventListener('mouseleave', () => {
                understandBtn.style.transform = 'translateY(0)';
                understandBtn.style.boxShadow = '0 4px 15px rgba(74, 158, 255, 0.3)';
            });
        });
    }
    
    /**
     * 显示持久化教学步骤弹窗
     */
    showPersistentTeachingModal() {
        // 如果已经存在持久化弹窗，先移除
        this.closePersistentTeachingModal();
        
        const currentLang = this.languageManager.getCurrentLanguage();
        const title = currentLang === 'zh' ? '教学步骤' : 'Teaching Steps';
        
        // 创建持久化教学弹窗
        this.persistentTeachingModal = document.createElement('div');
        this.persistentTeachingModal.id = 'persistent-teaching-modal';
        this.persistentTeachingModal.className = 'teaching-prompt';
        this.persistentTeachingModal.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 420px;
            max-width: 90vw;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #28a745;
            border-radius: 15px;
            padding: 20px;
            z-index: 2000;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
            color: white;
            animation: slideInFromRight 0.3s ease-out;
        `;
        
        this.persistentTeachingModal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color: #28a745; margin: 0; font-size: 16px;">🎓 ${title}</h3>
                <button id="close-persistent-teaching-btn" style="
                    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                    border: none;
                    border-radius: 6px;
                    color: white;
                    padding: 4px 8px;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: bold;
                ">${currentLang === 'zh' ? '关闭教学模式' : 'Close Teaching'}</button>
            </div>
            <div id="current-operation-section" style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                <h4 style="color: #4a9eff; margin: 0 0 8px 0; font-size: 14px;">${currentLang === 'zh' ? '当前操作：' : 'Current Operation:'}</h4>
                <p id="current-operation-text" style="font-weight: bold; margin: 0; font-size: 13px; line-height: 1.4; color: #ffffff;">
                    ${currentLang === 'zh' ? '等待排序开始...' : 'Waiting for sorting to start...'}
                </p>
            </div>
            <div id="algorithm-explanation-section" style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="color: #ffc107; margin: 0 0 8px 0; font-size: 14px;">${currentLang === 'zh' ? '算法解释：' : 'Algorithm Explanation:'}</h4>
                <p id="algorithm-explanation-text" style="line-height: 1.4; margin: 0; font-size: 12px; color: #b0b0b0;">
                    ${currentLang === 'zh' ? '开始排序后，这里将显示每一步的详细解释。' : 'Detailed explanations for each step will be shown here after sorting starts.'}
                </p>
            </div>
            <div style="display: flex; gap: 8px;">
                <button id="continue-step-btn" style="
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    border: none;
                    border-radius: 6px;
                    color: white;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-size: 13px;
                    flex: 1;
                    font-weight: bold;
                " disabled>${currentLang === 'zh' ? '继续下一步' : 'Continue Next Step'}</button>
            </div>
        `;
        
        document.body.appendChild(this.persistentTeachingModal);
        
        // 绑定关闭按钮事件
        const closeBtn = this.persistentTeachingModal.querySelector('#close-persistent-teaching-btn');
        closeBtn.addEventListener('click', () => {
            this.teachingMode = false;
            this.updateTeachingModeButton();
            
            // 如果有待解析的教学Promise，先解析它以让排序继续
            if (this.currentTeachingPromiseResolve) {
                this.currentTeachingPromiseResolve(false); // 返回false表示教学模式被关闭
                this.currentTeachingPromiseResolve = null;
            }
            
            // 更新排序引擎状态
            if (this.sortingEngine) {
                this.sortingEngine.setTeachingMode(false);
                // 如果排序正在进行，设置后台排序标志
                if (this.sortingEngine.isRunning) {
                    this.sortingEngine.sortingInBackground = true;
                }
            }
            
            // 显示后台排序状态
            if (this.sortingEngine && this.sortingEngine.isRunning) {
                this.updateBackgroundSortingStatus(true);
            }
            
            this.closePersistentTeachingModal();
            
            // 更新状态提示
            const statusMessage = this.languageManager.getCurrentLanguage() === 'zh' ? 
                '教学模式已关闭：排序将连续执行' : 
                'Teaching mode disabled: sorting will run continuously';
            this.updateCurrentStep(statusMessage);
        });
        
        // 存储继续按钮的引用，供后续使用
        this.continueStepBtn = this.persistentTeachingModal.querySelector('#continue-step-btn');
        this.currentOperationText = this.persistentTeachingModal.querySelector('#current-operation-text');
        this.algorithmExplanationText = this.persistentTeachingModal.querySelector('#algorithm-explanation-text');
    }
    
    /**
     * 关闭持久化教学步骤弹窗
     */
    closePersistentTeachingModal() {
        if (this.persistentTeachingModal && this.persistentTeachingModal.parentElement) {
            this.persistentTeachingModal.style.animation = 'slideOutToRight 0.3s ease-in';
            setTimeout(() => {
                if (this.persistentTeachingModal && this.persistentTeachingModal.parentElement) {
                    this.persistentTeachingModal.remove();
                }
                this.persistentTeachingModal = null;
                this.continueStepBtn = null;
                this.currentOperationText = null;
                this.algorithmExplanationText = null;
                this.currentTeachingPromiseResolve = null; // 清除Promise引用
            }, 300);
        }
    }
    
    /**
     * 更新持久化教学弹窗内容
     * @param {string} stepDescription - 步骤描述
     * @param {string} explanation - 详细解释
     */
    updatePersistentTeachingModal(stepDescription, explanation) {
        if (!this.persistentTeachingModal || !this.teachingMode) return;
        
        // 更新当前操作文本
        if (this.currentOperationText) {
            this.currentOperationText.textContent = stepDescription;
        }
        
        // 更新算法解释文本
        if (this.algorithmExplanationText) {
            this.algorithmExplanationText.textContent = explanation;
        }
        
        // 同时更新底部的"当前步骤"显示，确保代码显示模式正常工作
        // 这里需要获取当前的代码行信息
        if (this.sortingEngine && this.sortingEngine.currentStepType && this.sortingEngine.currentStepParams) {
            const codeLine = this.sortingEngine.getCodeLineForStep(this.sortingEngine.currentStepType, this.sortingEngine.currentStepParams);
            const codeExplanation = this.sortingEngine.getCodeExplanation(this.sortingEngine.currentStepType, this.sortingEngine.currentStepParams);
            
            // 更新底部步骤显示，确保代码模式正常工作
            this.updateCurrentStep(stepDescription, codeLine, codeExplanation);
        } else {
            // 如果没有代码信息，只更新步骤描述
            this.updateCurrentStep(stepDescription);
        }
        
        // 启用继续按钮
        if (this.continueStepBtn) {
            this.continueStepBtn.disabled = false;
            this.continueStepBtn.style.opacity = '1';
            this.continueStepBtn.style.cursor = 'pointer';
        }
    }
    
    /**
     * 显示教学步骤提示（新版本 - 使用持久化弹窗）
     * @param {string} stepDescription - 步骤描述
     * @param {string} explanation - 详细解释
     * @returns {Promise} 用户确认的Promise
     */
    showTeachingStepPrompt(stepDescription, explanation) {
        return new Promise((resolve) => {
            // 如果没有持久化弹窗或教学模式已关闭，直接继续
            if (!this.persistentTeachingModal || !this.teachingMode) {
                resolve(true);
                return;
            }
            
            // 更新持久化弹窗内容，同时更新底部步骤显示以支持代码模式
            this.updatePersistentTeachingModal(stepDescription, explanation);
            
            // 存储resolve函数，以便在教学模式关闭时能够解析Promise
            this.currentTeachingPromiseResolve = resolve;
            
            // 绑定继续按钮事件（每次都重新绑定以避免重复绑定）
            if (this.continueStepBtn) {
                // 移除之前的事件监听器
                const newContinueBtn = this.continueStepBtn.cloneNode(true);
                this.continueStepBtn.parentNode.replaceChild(newContinueBtn, this.continueStepBtn);
                this.continueStepBtn = newContinueBtn;
                
                // 添加新的事件监听器
                this.continueStepBtn.addEventListener('click', () => {
                    // 禁用按钮，等待下一步
                    this.continueStepBtn.disabled = true;
                    this.continueStepBtn.style.opacity = '0.6';
                    this.continueStepBtn.style.cursor = 'not-allowed';
                    
                    // 清除resolve引用
                    this.currentTeachingPromiseResolve = null;
                    resolve(true);
                });
            }
        });
    }
    
    /**
     * 设置按钮状态
     * @param {string} state - 状态：ready, sorting, paused, completed
     */
    setButtonStates(state) {
        const buttons = {
            start: document.getElementById('start-sort'),
            pause: document.getElementById('pause-sort'),
            resume: document.getElementById('resume-sort'),
            reset: document.getElementById('reset-sort'),
            generate: document.getElementById('generate-array')
        };
        
        switch (state) {
            case 'ready':
                buttons.start.disabled = false;
                buttons.pause.disabled = true;
                buttons.resume.classList.add('hidden');
                buttons.pause.classList.remove('hidden');
                buttons.reset.disabled = false;
                buttons.generate.disabled = false;
                break;
                
            case 'sorting':
                buttons.start.disabled = true;
                buttons.pause.disabled = false;
                buttons.resume.classList.add('hidden');
                buttons.pause.classList.remove('hidden');
                buttons.reset.disabled = true;
                buttons.generate.disabled = true;
                break;
                
            case 'paused':
                buttons.start.disabled = true;
                buttons.pause.classList.add('hidden');
                buttons.resume.classList.remove('hidden');
                buttons.reset.disabled = false;
                buttons.generate.disabled = true;
                break;
                
            case 'completed':
                buttons.start.disabled = false;
                buttons.pause.disabled = true;
                buttons.resume.classList.add('hidden');
                buttons.pause.classList.remove('hidden');
                buttons.reset.disabled = false;
                buttons.generate.disabled = false;
                break;
        }
    }
    
    /**
     * 更新当前步骤显示
     * @param {string} step - 步骤描述
     * @param {string} codeLine - 当前执行的代码行（可选）
     * @param {string} codeExplanation - 代码解释（可选）
     */
    updateCurrentStep(step, codeLine = '', codeExplanation = '') {
        const stepElement = document.getElementById('current-step');
        if (!stepElement) return;
        
        // 根据显示模式决定显示内容
        switch (this.displayMode) {
            case 'steps':
                // 步骤说明模式 - 显示步骤描述（已经根据当前语言生成）
                stepElement.innerHTML = step;
                break;
                
            case 'code':
                // 代码模式 - 显示当前执行的代码行
                if (codeLine) {
                    const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'zh';
                    const executingText = currentLang === 'zh' ? '正在执行:' : 'Executing:';
                    const explanationText = currentLang === 'zh' ? '说明:' : 'Explanation:';
                    
                    stepElement.innerHTML = `
                        <div style="font-family: monospace; font-size: 14px; line-height: 1.6; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <div style="color: #ffc107; font-weight: bold; margin-bottom: 8px;">${executingText}</div>
                            <div style="color: #ffffff; background: rgba(255,193,7,0.1); padding: 8px; border-radius: 4px; font-family: 'Consolas', 'Monaco', monospace;">
                                ${codeLine}
                            </div>
                            ${codeExplanation ? `
                                <div style="color: #b0b0b0; font-size: 12px; margin-top: 10px; font-family: 'Segoe UI', sans-serif;">
                                    <strong>${explanationText}</strong> ${codeExplanation}
                                </div>
                            ` : ''}
                        </div>
                    `;
                } else {
                    const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'zh';
                    const codeModeText = currentLang === 'zh' ? '代码显示模式' : 'Code Display Mode';
                    const waitingText = currentLang === 'zh' ? 
                        '等待排序开始，将显示当前执行的代码行...' : 
                        'Waiting for sorting to start, current executing code line will be shown...';
                    
                    stepElement.innerHTML = `
                        <div style="font-family: monospace; font-size: 14px; line-height: 1.6; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; border-left: 4px solid #4a9eff;">
                            <div style="color: #4a9eff; font-weight: bold;">${codeModeText}</div>
                            <div style="color: #b0b0b0; margin-top: 8px;">${waitingText}</div>
                        </div>
                    `;
                }
                break;
                
            default:
                stepElement.innerHTML = step;
        }
        
        // 更新算法代码区域的高亮显示
        this.updateCodeHighlighting(codeLine);
    }
    
    /**
     * 更新算法代码区域的高亮显示
     * @param {string} currentCodeLine - 当前执行的代码行
     */
    updateCodeHighlighting(currentCodeLine = '') {
        const codeElement = document.getElementById('algorithm-code');
        if (!codeElement || !this.languageManager) return;
        
        // 获取当前算法的代码行
        const codeLines = this.languageManager.getAlgorithmCodeLines(this.currentAlgorithm);
        if (!codeLines || codeLines.length === 0) return;
        
        // 清除之前的高亮并重新渲染
        codeElement.innerHTML = '';
        
        // 为每一行创建span元素
        codeLines.forEach((line, index) => {
            const lineElement = document.createElement('span');
            lineElement.className = 'code-line';
            lineElement.setAttribute('data-line', index);
            lineElement.textContent = line;
            
            // 设置基础样式
            lineElement.style.cssText = `
                display: block;
                padding: 2px 5px;
                margin: 1px 0;
                border-radius: 3px;
                transition: all 0.3s ease;
                position: relative;
                line-height: 1.4;
            `;
            
            // 如果当前行匹配正在执行的代码行，添加高亮
            if (currentCodeLine && line.trim() && currentCodeLine.includes(line.trim())) {
                lineElement.classList.add('highlighted');
                lineElement.style.cssText += `
                    background: linear-gradient(90deg, rgba(255, 193, 7, 0.3) 0%, rgba(255, 193, 7, 0.1) 100%);
                    border-left: 3px solid #ffc107;
                    transform: translateX(3px);
                    box-shadow: 0 0 10px rgba(255, 193, 7, 0.2);
                `;
                
                // 移除自动滚动功能，保持代码框静止
                // 用户可以手动滚动查看高亮的代码行
            }
            
            codeElement.appendChild(lineElement);
        });
    }
    
    /**
     * 清除代码高亮
     */
    clearCodeHighlighting() {
        const codeElement = document.getElementById('algorithm-code');
        if (!codeElement) return;
        
        const highlightedLines = codeElement.querySelectorAll('.highlighted');
        highlightedLines.forEach(line => {
            line.classList.remove('highlighted');
            line.style.background = '';
            line.style.borderLeft = '';
            line.style.transform = '';
            line.style.boxShadow = '';
        });
    }
    
    /**
     * 更新算法信息显示
     */
    updateAlgorithmInfo() {
        const algorithmInfo = this.languageManager.getAlgorithmInfo(this.currentAlgorithm);
        
        // 更新时间复杂度
        document.getElementById('time-best').textContent = algorithmInfo.timeComplexity?.best || '-';
        document.getElementById('time-average').textContent = algorithmInfo.timeComplexity?.average || '-';
        document.getElementById('time-worst').textContent = algorithmInfo.timeComplexity?.worst || '-';
        
        // 更新空间复杂度
        document.getElementById('space-complexity').textContent = algorithmInfo.spaceComplexity || '-';
        
        // 更新稳定性
        const stabilityText = algorithmInfo.stable ? 
            this.languageManager.getText('complexity.stable') : 
            this.languageManager.getText('complexity.unstable');
        document.getElementById('stability').textContent = stabilityText;
        
        // 更新算法描述
        document.getElementById('algorithm-description').textContent = algorithmInfo.description || 
            this.languageManager.getText('defaultMessages.selectAlgorithm');
        
        // 更新算法代码
        this.updateAlgorithmCode();
    }
    
    /**
     * 更新算法代码显示
     */
    updateAlgorithmCode() {
        const codeElement = document.getElementById('algorithm-code');
        if (!codeElement) return;
        
        // 使用语言管理器获取当前语言的代码
        const code = this.languageManager.getAlgorithmCode(this.currentAlgorithm);
        
        // 如果是默认消息，直接显示文本
        if (code === this.languageManager.getText('defaultMessages.selectAlgorithmCode')) {
            codeElement.textContent = code;
            return;
        }
        
        // 分行显示代码，为高亮功能做准备
        const codeLines = code.split('\n');
        codeElement.innerHTML = '';
        
        codeLines.forEach((line, index) => {
            const lineElement = document.createElement('span');
            lineElement.className = 'code-line';
            lineElement.setAttribute('data-line', index);
            lineElement.textContent = line;
            
            // 设置基础样式
            lineElement.style.cssText = `
                display: block;
                padding: 2px 5px;
                margin: 1px 0;
                border-radius: 3px;
                transition: all 0.3s ease;
                position: relative;
                line-height: 1.4;
            `;
            
            codeElement.appendChild(lineElement);
        });
    }
    
    /**
     * 显示复杂度对比表
     */
    showComplexityComparison() {
        const modal = document.getElementById('complexity-modal');
        const container = document.getElementById('complexity-table-container');
        
        if (!modal || !container) {
            console.error('复杂度对比模态框元素不存在');
            return;
        }
        
        // 获取复杂度数据
        const comparisonData = this.languageManager.getComplexityComparisonData();
        
        // 创建颜色图例
        const colorLegend = this.createComplexityColorLegend();
        
        // 创建表格
        const table = this.createComplexityTable(comparisonData);
        
        // 更新模态框内容
        container.innerHTML = '';
        container.appendChild(colorLegend);  // 先添加图例
        container.appendChild(table);        // 再添加表格
        
        // 更新模态框标题
        const modalTitle = document.getElementById('complexity-modal-title');
        if (modalTitle) {
            modalTitle.textContent = this.languageManager.getText('modal.complexityComparison');
        }
        
        // 显示模态框
        modal.style.display = 'block';
        this.isModalOpen = true;
        
        // 重新绑定关闭事件
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeModal(modal);
        }
        
        // 点击模态框外部关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        };
    }
    
    /**
     * 创建复杂度颜色编码图例
     * @returns {HTMLElement} 图例元素
     */
    createComplexityColorLegend() {
        const currentLang = this.languageManager.getCurrentLanguage();
        const title = currentLang === 'zh' ? '复杂度颜色编码' : 'Complexity Color Coding';
        
        const legend = document.createElement('div');
        legend.className = 'complexity-color-legend';
        legend.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin: 20px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            border-left: 4px solid #4a9eff;
        `;
        
        // 图例标题
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        titleElement.style.cssText = `
            width: 100%;
            color: #4a9eff;
            margin-bottom: 10px;
            font-size: 16px;
            margin-top: 0;
        `;
        legend.appendChild(titleElement);
        
        // 颜色映射定义
        const colorMappings = [
            { complexity: 'O(1)', color: '#28a745', label: { zh: '常数时间', en: 'Constant Time' } },
            { complexity: 'O(n)', color: '#17a2b8', label: { zh: '线性时间', en: 'Linear Time' } },
            { complexity: 'O(n log n)', color: '#20c997', label: { zh: '对数线性', en: 'Linearithmic' } },
            { complexity: 'O(n²)', color: '#fd7e14', label: { zh: '平方时间', en: 'Quadratic Time' } },
            { complexity: 'O(log n)', color: '#6f42c1', label: { zh: '对数时间', en: 'Logarithmic Time' } },
            { complexity: 'O(n+k), O(d(n+k))', color: '#ffc107', label: { zh: '特殊复杂度', en: 'Special Complexity' } }
        ];
        
        // 创建图例项
        colorMappings.forEach(mapping => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
            `;
            
            // 颜色方块
            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.cssText = `
                width: 16px;
                height: 16px;
                border-radius: 3px;
                background: ${mapping.color};
                flex-shrink: 0;
            `;
            
            // 文本说明
            const label = document.createElement('span');
            label.textContent = `${mapping.complexity} - ${mapping.label[currentLang]}`;
            label.style.color = '#b0b0b0';
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);
        });
        
        return legend;
    }
    
    /**
     * 显示算法介绍弹窗
     * @param {string} algorithm - 算法名称
     */
    showAlgorithmInfo(algorithm) {
        const modal = document.getElementById('algorithm-modal');
        const modalContent = document.getElementById('modal-content');
        const modalTitle = document.getElementById('modal-title');
        
        if (!modal || !modalContent || !modalTitle) {
            console.error('算法介绍模态框元素不存在');
            return;
        }
        
        const algorithmInfo = this.languageManager.getAlgorithmInfo(algorithm);
        
        // 更新模态框标题
        modalTitle.textContent = `${algorithmInfo.name} - ${this.languageManager.getText('modal.algorithmIntro')}`;
        
        // 创建模态框内容
        modalContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #4a9eff; margin-bottom: 10px;">算法描述</h3>
                <p style="line-height: 1.6; color: #b0b0b0;">${algorithmInfo.description}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #4a9eff; margin-bottom: 10px;">工作原理</h3>
                <p style="line-height: 1.6; color: #b0b0b0;">${algorithmInfo.workingPrinciple}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #4a9eff; margin-bottom: 10px;">适用场景</h3>
                <p style="line-height: 1.6; color: #b0b0b0;">${algorithmInfo.useCases}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h3 style="color: #28a745; margin-bottom: 10px;">优点</h3>
                    <ul style="color: #b0b0b0; line-height: 1.6;">
                        ${algorithmInfo.advantages.map(advantage => `<li>${advantage}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3 style="color: #dc3545; margin-bottom: 10px;">缺点</h3>
                    <ul style="color: #b0b0b0; line-height: 1.6;">
                        ${algorithmInfo.disadvantages.map(disadvantage => `<li>${disadvantage}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                <h3 style="color: #ffc107; margin-bottom: 10px;">复杂度分析</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: #b0b0b0;">
                    <div><strong>最好情况:</strong> ${algorithmInfo.timeComplexity?.best || '-'}</div>
                    <div><strong>平均情况:</strong> ${algorithmInfo.timeComplexity?.average || '-'}</div>
                    <div><strong>最坏情况:</strong> ${algorithmInfo.timeComplexity?.worst || '-'}</div>
                    <div><strong>空间复杂度:</strong> ${algorithmInfo.spaceComplexity || '-'}</div>
                    <div><strong>稳定性:</strong> ${algorithmInfo.stable ? '稳定' : '不稳定'}</div>
                </div>
            </div>
        `;
        
        // 显示模态框
        modal.style.display = 'block';
        this.isModalOpen = true;
        
        // 重新绑定关闭事件（确保能正确关闭）
        const closeBtn = modal.querySelector('.close');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        
        // 移除旧的事件监听器并添加新的
        if (closeBtn) {
            closeBtn.onclick = () => this.closeModal(modal);
        }
        
        if (modalCloseBtn) {
            modalCloseBtn.onclick = () => this.closeModal(modal);
        }
        
        // 点击模态框外部关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        };
    }
    createComplexityTable(data) {
        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            overflow: hidden;
        `;
        
        // 创建表头
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.style.cssText = `
            background: linear-gradient(135deg, #4a9eff 0%, #0078d4 100%);
            color: white;
        `;
        
        const headers = [
            this.languageManager.getCurrentLanguage() === 'zh' ? '算法' : 'Algorithm',
            this.languageManager.getCurrentLanguage() === 'zh' ? '最好情况' : 'Best Case',
            this.languageManager.getCurrentLanguage() === 'zh' ? '平均情况' : 'Average Case',
            this.languageManager.getCurrentLanguage() === 'zh' ? '最坏情况' : 'Worst Case',
            this.languageManager.getCurrentLanguage() === 'zh' ? '空间复杂度' : 'Space Complexity',
            this.languageManager.getCurrentLanguage() === 'zh' ? '稳定性' : 'Stability'
        ];
        
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.cssText = `
                padding: 15px 10px;
                text-align: left;
                font-weight: bold;
                border-bottom: 2px solid rgba(255, 255, 255, 0.2);
            `;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 创建表体
        const tbody = document.createElement('tbody');
        
        data.forEach((algorithm, index) => {
            const row = document.createElement('tr');
            row.style.cssText = `
                background: ${index % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)'};
                transition: background-color 0.3s ease;
            `;
            
            // 鼠标悬停效果
            row.addEventListener('mouseenter', () => {
                row.style.background = 'rgba(74, 158, 255, 0.2)';
            });
            
            row.addEventListener('mouseleave', () => {
                row.style.background = index % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)';
            });
            
            // 添加数据单元格
            const cells = [
                algorithm.name,
                algorithm.timeBest,
                algorithm.timeAverage,
                algorithm.timeWorst,
                algorithm.spaceComplexity,
                algorithm.stable
            ];
            
            cells.forEach((cellText, cellIndex) => {
                const td = document.createElement('td');
                td.textContent = cellText;
                td.style.cssText = `
                    padding: 12px 10px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    font-family: ${cellIndex > 0 && cellIndex < 5 ? 'monospace' : 'inherit'};
                    color: ${this.getComplexityColor(cellText, cellIndex)};
                    font-weight: ${cellIndex === 0 ? 'bold' : 'normal'};
                `;
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        
        // 添加表格说明
        const note = document.createElement('div');
        note.style.cssText = `
            margin-top: 15px;
            padding: 10px;
            background: rgba(255, 193, 7, 0.1);
            border-left: 4px solid #ffc107;
            border-radius: 5px;
            font-size: 14px;
            color: #b0b0b0;
        `;
        
        const noteText = this.languageManager.getCurrentLanguage() === 'zh' ? 
            '说明：n表示数组大小，k表示数据范围，d表示数字位数。时间复杂度中的O表示大O记号。' :
            'Note: n represents array size, k represents data range, d represents number of digits. O in time complexity represents Big O notation.';
        
        note.textContent = noteText;
        
        const container = document.createElement('div');
        container.appendChild(table);
        container.appendChild(note);
        
        return container;
    }
    
    /**
     * 获取复杂度对应的颜色
     * @param {string} cellText - 单元格文本
     * @param {number} cellIndex - 单元格索引
     * @returns {string} 颜色值
     */
    getComplexityColor(cellText, cellIndex) {
        // 算法名称列 - 白色
        if (cellIndex === 0) {
            return '#ffffff';
        }
        
        // 稳定性列 - 绿色/红色
        if (cellIndex === 5) {
            return (cellText.includes('稳定') || cellText.includes('Stable')) && !cellText.includes('不') && !cellText.includes('Un') ? 
                '#28a745' : '#dc3545';
        }
        
        // 复杂度列 (1-4) - 根据复杂度类型着色
        if (cellIndex >= 1 && cellIndex <= 4) {
            // O(1) - 最优 - 绿色
            if (cellText.includes('O(1)')) {
                return '#28a745';
            }
            // O(n) - 线性 - 蓝色
            if (cellText.includes('O(n)') && !cellText.includes('log') && !cellText.includes('²')) {
                return '#17a2b8';
            }
            // O(n log n) - 对数线性 - 青色
            if (cellText.includes('O(n log n)') || cellText.includes('O(n·log n)')) {
                return '#20c997';
            }
            // O(n²) - 平方 - 橙色
            if (cellText.includes('O(n²)') || cellText.includes('O(n^2)')) {
                return '#fd7e14';
            }
            // O(log n) - 对数 - 紫色
            if (cellText.includes('O(log n)')) {
                return '#6f42c1';
            }
            // 包含k或d的复杂度 - 黄色
            if (cellText.includes('k') || cellText.includes('d')) {
                return '#ffc107';
            }
        }
        
        // 默认白色
        return '#ffffff';
    }
    
    /**
     * 关闭模态框
     * @param {HTMLElement} modal - 模态框元素
     */
    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            this.isModalOpen = false;
        }
    }
}

// 页面加载完成后初始化UI控制器
document.addEventListener('DOMContentLoaded', () => {
    // 确保语言管理器先初始化
    if (!window.languageManager) {
        console.log('Initializing language manager...');
        window.languageManager = new LanguageManager();
    }
    
    // 稍微延迟初始化UI控制器，确保所有依赖都已准备好
    setTimeout(() => {
        console.log('Initializing UI handler...');
        window.uiHandler = new UIHandler();
        
        // 确保语言管理器的事件绑定正确设置
        if (window.languageManager) {
            console.log('Setting up language manager events...');
            window.languageManager.setupLanguageToggle();
        }
        
        // 设置显示模式事件
        const displayMode = document.getElementById('display-mode');
        if (displayMode && window.uiHandler) {
            console.log('Setting up display mode...');
            displayMode.addEventListener('change', (e) => {
                console.log('Display mode changed to:', e.target.value);
                window.uiHandler.changeDisplayMode(e.target.value);
            });
        }
    }, 100);
});