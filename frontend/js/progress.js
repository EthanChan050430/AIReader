/**
 * 进度分析管理器 - 处理全面总结和真伪鉴定的步骤显示
 */

class ProgressManager {
    constructor() {
        this.currentSteps = [];
        this.currentStepData = {};
        this.activeStep = 0;
        this.analysisType = null;
        this.setupMarkdown();
        this.bindEvents();
    }

    /**
     * 配置 Markdown 渲染器
     */
    setupMarkdown() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                highlight: function(code, lang) {
                    if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (ex) {
                            console.warn('代码高亮失败:', ex);
                        }
                    }
                    return code;
                },
                breaks: true,
                gfm: true,
                sanitize: false
            });
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 返回按钮
        document.getElementById('backToWelcomeBtn')?.addEventListener('click', () => {
            this.returnToWelcome();
        });
    }

    /**
     * 开始分析流程
     * @param {string} type - 分析类型 ('comprehensive' 或 'fact-checking')
     */
    startAnalysis(type) {
        this.analysisType = type;
        this.currentStepData = {};
        this.activeStep = 0;

        // 显示进度界面
        this.showProgressScreen();

        // 初始化步骤
        this.initializeSteps(type);
        
        // 渲染步骤卡片
        this.renderSteps();

        // 更新标题
        const titles = {
            'comprehensive': '全面总结分析',
            'fact-checking': '真伪鉴定分析'
        };
        document.getElementById('progressTitle').textContent = titles[type] || '正在分析...';
    }

    /**
     * 初始化步骤配置
     * @param {string} type - 分析类型
     */
    initializeSteps(type) {
        const stepConfigs = {
            'comprehensive': [
                {
                    id: 1,
                    title: '问题分析',
                    description: '分析文章的主要内容和结构',
                    icon: '🔍'
                },
                {
                    id: 2,
                    title: '搜索结果',
                    description: '提取关键词和重要信息点',
                    icon: '🌐'
                },
                {
                    id: 3,
                    title: '深度分析',
                    description: '深入思考文章主旨和内涵',
                    icon: '🔬'
                },
                {
                    id: 4,
                    title: '结果汇总',
                    description: '综合前面所有分析形成总结',
                    icon: '✅'
                }
            ],
            'fact-checking': [
                {
                    id: 1,
                    title: '问题分析',
                    description: '解析文章内容和关键声明',
                    icon: '📖'
                },
                {
                    id: 2,
                    title: '搜索结果',
                    description: '提取需要验证的关键词',
                    icon: '🔑'
                },
                {
                    id: 3,
                    title: '深度分析',
                    description: '搜索相关资料进行对比验证',
                    icon: '🔍'
                },
                {
                    id: 4,
                    title: '结果汇总',
                    description: '基于搜索结果进行真伪判定',
                    icon: '⚖️'
                }
            ]
        };

        this.currentSteps = stepConfigs[type] || [];
    }

    /**
     * 渲染步骤卡片
     */
    renderSteps() {
        const container = document.getElementById('analysisSteps');
        if (!container) return;

        container.innerHTML = '';

        this.currentSteps.forEach((step, index) => {
            const stepCard = this.createStepCard(step, index);
            container.appendChild(stepCard);
        });
    }

    /**
     * 创建步骤卡片
     * @param {Object} step - 步骤配置
     * @param {number} index - 步骤索引
     */
    createStepCard(step, index) {
        const card = document.createElement('div');
        card.className = 'analysis-step-card';
        card.dataset.step = step.id;

        const status = this.getStepStatus(index);
        const iconClass = this.getIconClass(status);
        const statusText = this.getStatusText(status);

        card.innerHTML = `
            <div class="step-card-header" onclick="progressManager.toggleStepDetail(${step.id})">
                <div class="step-icon ${status}">
                    ${status === 'processing' ? '<i class="fas fa-spinner"></i>' : step.icon}
                </div>
                <div class="step-info">
                    <h3 class="step-title">${step.title}</h3>
                    <p class="step-description">${step.description}</p>
                </div>
                <div class="step-status ${status}">
                    <i class="fas ${iconClass}"></i>
                    <span>${statusText}</span>
                </div>
            </div>
            <div class="step-progress-bar">
                <div class="step-progress-fill" style="width: ${this.getStepProgress(index)}%"></div>
            </div>
        `;

        // 添加点击事件
        card.addEventListener('click', () => {
            if (this.currentStepData[step.id]) {
                this.showStepDetail(step.id);
            }
        });

        // 如果步骤有数据，添加可点击样式
        if (this.currentStepData[step.id]) {
            card.style.cursor = 'pointer';
            card.title = '点击查看详细内容';
        }

        return card;
    }

    /**
     * 获取步骤状态
     * @param {number} index - 步骤索引
     */
    getStepStatus(index) {
        const stepId = index + 1;
        
        // 如果步骤数据中标记为完成，则显示完成状态
        if (this.currentStepData[stepId]?.complete) {
            console.log(`步骤 ${stepId} (索引 ${index}) 状态: completed (数据标记)`);
            return 'completed';
        }
        
        // 如果是当前正在处理的步骤
        if (index === this.activeStep) {
            console.log(`步骤 ${stepId} (索引 ${index}) 状态: processing (活跃步骤)`);
            return 'processing';
        }
        
        // 如果步骤索引小于当前活跃步骤，则为完成状态
        if (index < this.activeStep) {
            console.log(`步骤 ${stepId} (索引 ${index}) 状态: completed (小于活跃步骤)`);
            return 'completed';
        }
        
        // 其他情况为等待状态
        console.log(`步骤 ${stepId} (索引 ${index}) 状态: pending`);
        return 'pending';
    }

    /**
     * 获取状态图标
     * @param {string} status - 状态
     */
    getIconClass(status) {
        const icons = {
            'pending': 'fa-clock',
            'processing': 'fa-spinner fa-spin',
            'completed': 'fa-check'
        };
        return icons[status];
    }

    /**
     * 获取状态文本
     * @param {string} status - 状态
     */
    getStatusText(status) {
        const texts = {
            'pending': '等待中',
            'processing': '进行中',
            'completed': '完成'
        };
        return texts[status];
    }

    /**
     * 获取步骤进度百分比
     * @param {number} index - 步骤索引
     */
    getStepProgress(index) {
        const stepId = index + 1;
        
        // 如果步骤数据中标记为完成，则100%
        if (this.currentStepData[stepId]?.complete) {
            return 100;
        }
        
        // 如果是当前正在处理的步骤且有内容，则显示50%
        if (index === this.activeStep && this.currentStepData[stepId]?.content) {
            return 75;
        }
        
        // 如果是当前正在处理的步骤但没有内容，则显示25%
        if (index === this.activeStep) {
            return 25;
        }
        
        // 如果步骤索引小于当前活跃步骤，则为100%
        if (index < this.activeStep) {
            return 100;
        }
        
        // 其他情况为0%
        return 0;
    }

    /**
     * 更新步骤内容
     * @param {number} stepId - 步骤ID
     * @param {string} content - 步骤内容
     * @param {string} type - 内容类型 ('content', 'thinking', 'complete')
     */
    updateStep(stepId, content, type = 'content') {
        console.log(`更新步骤 ${stepId}, 类型: ${type}, 内容长度: ${content.length}`);
        
        if (!this.currentStepData[stepId]) {
            this.currentStepData[stepId] = {
                content: '',
                thinking: '',
                complete: false
            };
        }

        if (type === 'content') {
            this.currentStepData[stepId].content += content;
        } else if (type === 'thinking') {
            this.currentStepData[stepId].thinking += content;
        } else if (type === 'complete') {
            this.currentStepData[stepId].complete = true;
            console.log(`步骤 ${stepId} 标记为完成，当前步骤数据:`, this.currentStepData[stepId]);
        }

        // 更新UI
        this.updateStepUI(stepId);
    }

    /**
     * 完成当前步骤，进入下一步
     */
    completeCurrentStep() {
        // 标记当前步骤为完成状态
        const currentStepId = this.activeStep + 1;
        console.log(`完成当前步骤: ${currentStepId}, 总步骤数: ${this.currentSteps.length}, 当前活跃步骤: ${this.activeStep}`);
        
        if (this.currentStepData[currentStepId]) {
            this.currentStepData[currentStepId].complete = true;
        }
        
        // 只有当不是最后一步时才推进到下一步
        if (this.activeStep < this.currentSteps.length - 1) {
            this.activeStep++;
            console.log(`推进到下一步: ${this.activeStep + 1}`);
        } else {
            console.log(`已到达最后一步，不再推进`);
        }
        
        // 重新渲染步骤
        this.renderSteps();
    }

    /**
     * 更新步骤UI
     * @param {number} stepId - 步骤ID
     */
    updateStepUI(stepId) {
        const card = document.querySelector(`[data-step="${stepId}"]`);
        if (!card) return;

        // 如果步骤有内容，添加可点击样式
        if (this.currentStepData[stepId]?.content) {
            card.style.cursor = 'pointer';
            card.title = '点击查看详细内容';
            card.classList.add('has-content');
        }

        // 更新进度条
        const progressFill = card.querySelector('.step-progress-fill');
        const stepIndex = this.currentSteps.findIndex(step => step.id === stepId);
        if (progressFill && stepIndex !== -1) {
            progressFill.style.width = this.getStepProgress(stepIndex) + '%';
        }
    }

    /**
     * 显示步骤详情
     * @param {number} stepId - 步骤ID
     */
    showStepDetail(stepId) {
        const stepData = this.currentStepData[stepId];
        if (!stepData || !stepData.content) {
            showNotification('该步骤暂无内容', 'info');
            return;
        }

        const step = this.currentSteps.find(s => s.id === stepId);
        if (!step) return;

        // 设置模态框标题
        document.getElementById('stepDetailTitle').textContent = step.title;

        // 渲染内容
        const contentContainer = document.getElementById('stepDetailContent');
        let fullContent = '';

        // 添加思考过程（如果有）
        if (stepData.thinking) {
            fullContent += `
                <div class="thinking-section">
                    <h4>💭 思考过程</h4>
                    <div class="thinking-content">
                        ${this.renderMarkdown(stepData.thinking)}
                    </div>
                </div>
                <hr style="margin: 2rem 0; border: 1px solid var(--border-color);">
            `;
        }

        // 添加主要内容
        fullContent += `
            <div class="main-content">
                ${this.renderMarkdown(stepData.content)}
            </div>
        `;

        contentContainer.innerHTML = fullContent;

        // 显示模态框
        document.getElementById('stepDetailModal').style.display = 'flex';
        
        // 重新初始化代码高亮
        if (typeof hljs !== 'undefined') {
            setTimeout(() => {
                contentContainer.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }, 100);
        }
    }

    /**
     * 切换步骤详情显示
     * @param {number} stepId - 步骤ID
     */
    toggleStepDetail(stepId) {
        event.stopPropagation();
        this.showStepDetail(stepId);
    }

    /**
     * 渲染 Markdown 内容
     * @param {string} content - 原始内容
     */
    renderMarkdown(content) {
        console.log('渲染Markdown内容，原始长度:', content.length);
        console.log('marked可用:', typeof marked !== 'undefined');
        console.log('content前100字符:', content.substring(0, 100));
        
        if (typeof marked !== 'undefined') {
            try {
                // 尝试不同的marked API
                let rendered;
                if (typeof marked.parse === 'function') {
                    rendered = marked.parse(content);
                } else if (typeof marked === 'function') {
                    rendered = marked(content);
                } else {
                    console.error('marked API不可用');
                    return this.simpleMarkdownParse(content);
                }
                
                console.log('Markdown渲染成功，HTML长度:', rendered.length);
                console.log('rendered前100字符:', rendered.substring(0, 100));
                return rendered;
            } catch (error) {
                console.error('Markdown渲染失败:', error);
                return this.simpleMarkdownParse(content);
            }
        }
        console.log('marked不可用，使用简单Markdown解析');
        return this.simpleMarkdownParse(content);
    }

    /**
     * 简单的Markdown解析器（后备方案）
     * @param {string} content - 原始内容
     */
    simpleMarkdownParse(content) {
        return content
            // 标题
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // 粗体
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 斜体
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // 代码块
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // 行内代码
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // 列表项
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            // 换行
            .replace(/\n/g, '<br>')
            // 包装列表项
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }

    /**
     * 显示进度界面
     */
    showProgressScreen() {
        // 隐藏其他界面
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('chatScreen').style.display = 'none';
        
        // 显示进度界面
        const progressScreen = document.getElementById('progressScreen');
        progressScreen.style.display = 'block';
        progressScreen.classList.add('animate-fade-in');
    }

    /**
     * 返回欢迎界面
     */
    returnToWelcome() {
        document.getElementById('progressScreen').style.display = 'none';
        document.getElementById('welcomeScreen').style.display = 'block';
        
        // 重置状态
        this.currentSteps = [];
        this.currentStepData = {};
        this.activeStep = 0;
        this.analysisType = null;
    }

    /**
     * 处理流式响应
     * @param {Object} data - 响应数据
     */
    handleStreamData(data) {
        console.log('进度管理器收到数据:', data);
        
        switch (data.type) {
            case 'step_start':
                console.log(`开始步骤 ${data.step}`);
                this.activeStep = data.step - 1;
                this.renderSteps();
                break;
                
            case 'content':
                console.log(`步骤 ${data.step || this.activeStep + 1} 收到内容`);
                this.updateStep(data.step || this.activeStep + 1, data.content, 'content');
                break;
                
            case 'thinking':
                console.log(`步骤 ${data.step || this.activeStep + 1} 收到思考内容`);
                this.updateStep(data.step || this.activeStep + 1, data.content, 'thinking');
                break;
                
            case 'step_complete':
                console.log(`步骤 ${data.step || this.activeStep + 1} 完成`);
                const completedStepId = data.step || this.activeStep + 1;
                this.updateStep(completedStepId, '', 'complete');
                
                // 推进到下一步（如果不是最后一步）
                this.completeCurrentStep();
                break;
                
            case 'analysis_complete':
            case 'verification_complete':
                console.log('分析完成');
                // 确保最后一步也标记为完成
                const lastStepId = this.currentSteps.length;
                if (!this.currentStepData[lastStepId]?.complete) {
                    this.updateStep(lastStepId, '', 'complete');
                    this.renderSteps();
                }
                showNotification('分析完成！点击步骤查看详细结果', 'success');
                break;
                
            case 'error':
                console.error('分析过程中出现错误:', data.message);
                showNotification(data.message || '分析过程中出现错误', 'error');
                break;
                
            default:
                console.log('未处理的数据类型:', data.type);
        }
    }
}

// 关闭步骤详情模态框的全局函数
function closeStepDetail() {
    document.getElementById('stepDetailModal').style.display = 'none';
}

// 全局进度管理器实例
window.progressManager = new ProgressManager();
