// ===== 聊天系统 =====

let chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
let isTyping = false;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initChat();
    loadChatMessages();
});

// ===== 初始化聊天系统 =====
function initChat() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-message-btn');

    // 发送按钮事件
    sendBtn.addEventListener('click', function() {
        sendMessage();
    });

    // 回车键发送消息
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 输入框内容变化事件
    chatInput.addEventListener('input', function() {
        const message = this.value.trim();
        if (message && !isTyping) {
            showTypingIndicator();
        } else if (!message && isTyping) {
            hideTypingIndicator();
        }
    });
}

// ===== 发送消息 =====
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();

    if (!message) {
        showNotification('请输入消息内容', 'warning');
        return;
    }

    // 检查是否已登录
    if (!isLoggedIn()) {
        showNotification('请先登录才能使用聊天功能', 'warning');
        closeModal('chat-modal');
        showModal('login-modal');
        return;
    }

    // 创建消息对象
    const messageObj = {
        id: Date.now(),
        text: message,
        sender: getCurrentUser().name,
        senderId: getCurrentUser().id,
        timestamp: new Date().toISOString(),
        type: 'user'
    };

    // 添加到消息列表
    chatMessages.push(messageObj);
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));

    // 显示消息
    displayMessage(messageObj);

    // 清空输入框
    chatInput.value = '';
    hideTypingIndicator();

    // 模拟对方回复（演示用）
    setTimeout(() => {
        simulateReply(message);
    }, 1000 + Math.random() * 2000);
}

// ===== 显示消息 =====
function displayMessage(messageObj) {
    const chatMessagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    const time = new Date(messageObj.timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (messageObj.type === 'user') {
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div>${escapeHtml(messageObj.text)}</div>
            <div class="message-time">${time}</div>
        `;
    } else if (messageObj.type === 'other') {
        messageDiv.className = 'message other-message';
        messageDiv.innerHTML = `
            <div><strong>${escapeHtml(messageObj.sender)}</strong></div>
            <div>${escapeHtml(messageObj.text)}</div>
            <div class="message-time">${time}</div>
        `;
    } else if (messageObj.type === 'system') {
        messageDiv.className = 'message system-message';
        messageDiv.innerHTML = `<div>${escapeHtml(messageObj.text)}</div>`;
    }

    chatMessagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// ===== 加载聊天消息 =====
function loadChatMessages() {
    const chatMessagesContainer = document.getElementById('chat-messages');
    
    // 清空现有消息
    chatMessagesContainer.innerHTML = '';

    // 显示欢迎消息
    const welcomeMessage = {
        type: 'system',
        text: '欢迎使用Group 6二手电动车交易平台聊天系统！'
    };
    displayMessage(welcomeMessage);

    // 加载历史消息
    chatMessages.forEach(message => {
        displayMessage(message);
    });
}

// ===== 模拟对方回复 =====
function simulateReply(userMessage) {
    const replies = [
        '您好！我对这辆车很感兴趣，能详细介绍一下吗？',
        '价格还能再优惠一些吗？',
        '车况怎么样？有没有维修记录？',
        '什么时候可以看车？',
        '支持分期付款吗？',
        '这辆车跑了多少公里？',
        '电池还能用多久？',
        '有发票和合格证吗？',
        '可以试骑一下吗？',
        '包过户吗？'
    ];

    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    const replyMessage = {
        id: Date.now(),
        text: randomReply,
        sender: '卖家',
        senderId: 'seller',
        timestamp: new Date().toISOString(),
        type: 'other'
    };

    chatMessages.push(replyMessage);
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    displayMessage(replyMessage);
}

// ===== 显示正在输入指示器 =====
function showTypingIndicator() {
    if (isTyping) return;
    
    isTyping = true;
    const chatMessagesContainer = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message system-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<div>对方正在输入...</div>';
    
    chatMessagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

// ===== 隐藏正在输入指示器 =====
function hideTypingIndicator() {
    if (!isTyping) return;
    
    isTyping = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// ===== 滚动到底部 =====
function scrollToBottom() {
    const chatMessagesContainer = document.getElementById('chat-messages');
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// ===== HTML转义 =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== 清空聊天记录 =====
function clearChatHistory() {
    if (confirm('确定要清空所有聊天记录吗？')) {
        chatMessages = [];
        localStorage.removeItem('chatMessages');
        loadChatMessages();
        showNotification('聊天记录已清空', 'info');
    }
}

// ===== 导出聊天记录 =====
function exportChatHistory() {
    if (chatMessages.length === 0) {
        showNotification('没有聊天记录可导出', 'warning');
        return;
    }

    const chatData = {
        exportTime: new Date().toISOString(),
        totalMessages: chatMessages.length,
        messages: chatMessages
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('聊天记录已导出', 'success');
}

// ===== 聊天功能增强 =====

// 添加表情支持
function addEmoji(emoji) {
    const chatInput = document.getElementById('chat-input');
    chatInput.value += emoji;
    chatInput.focus();
}

// 添加常用回复
function addQuickReply(reply) {
    const chatInput = document.getElementById('chat-input');
    chatInput.value = reply;
    chatInput.focus();
}

// 搜索聊天记录
function searchChatHistory(keyword) {
    if (!keyword.trim()) return [];
    
    return chatMessages.filter(message => 
        message.text.toLowerCase().includes(keyword.toLowerCase())
    );
}

// ===== 聊天统计 =====
function getChatStats() {
    const userMessages = chatMessages.filter(msg => msg.type === 'user').length;
    const otherMessages = chatMessages.filter(msg => msg.type === 'other').length;
    const totalMessages = chatMessages.length;
    
    return {
        userMessages,
        otherMessages,
        totalMessages,
        chatDuration: chatMessages.length > 0 ? 
            new Date(chatMessages[chatMessages.length - 1].timestamp) - new Date(chatMessages[0].timestamp) : 0
    };
}

// ===== 导出函数 =====
window.clearChatHistory = clearChatHistory;
window.exportChatHistory = exportChatHistory;
window.addEmoji = addEmoji;
window.addQuickReply = addQuickReply;
window.searchChatHistory = searchChatHistory;
window.getChatStats = getChatStats;
