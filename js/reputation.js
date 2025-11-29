// 前端用户信誉模块（演示用，本地存储）
(function(){
  // 将用户 id 映射为稳定的 0-100 信誉分（首次读时生成并保存到 localStorage）
  function hashString(s) {
    const str = String(s || '');
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function generateScoreFromId(id) {
    const h = hashString(id);
    // 生成 40 - 100 之间的演示分数，偏向中高
    return 40 + (h % 61);
  }

  function getStorageKey(userId) {
    return `reputation:${userId}`;
  }

  function getReputation(userId) {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw !== null) return Number(raw);
    const score = generateScoreFromId(userId);
    localStorage.setItem(key, String(score));
    return score;
  }

  function setReputation(userId, score) {
    const s = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    localStorage.setItem(getStorageKey(userId), String(s));
    return s;
  }

  function createReputationBadge(score) {
    const badge = document.createElement('span');
    badge.className = 'reputation-badge';
    badge.setAttribute('role', 'img');
    badge.setAttribute('aria-label', `信誉 ${score} 分，满分100`);
    badge.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:6px 8px;border-radius:14px;font-size:13px;font-weight:600;box-shadow:var(--shadow-sm);';

    // 颜色根据分数
    let color = '#f39c12';
    if (score >= 80) color = '#2ecc71';
    else if (score >= 60) color = '#f1c40f';
    else color = '#e74c3c';

    const star = document.createElement('span');
    star.textContent = '★';
    star.style.color = color;
    star.style.fontSize = '14px';

    const text = document.createElement('span');
    text.textContent = `${score}/100`;
    text.style.color = '#111';
    text.style.opacity = '0.95';

    // 简易进度条
    const barOuter = document.createElement('span');
    barOuter.style.cssText = 'display:inline-block;width:80px;height:6px;background:#eee;border-radius:6px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.05);';
    const barInner = document.createElement('span');
    barInner.style.cssText = `display:block;height:100%;width:${score}%;background:${color};transition:width .4s ease;`;
    barOuter.appendChild(barInner);

    badge.appendChild(star);
    badge.appendChild(text);
    badge.appendChild(barOuter);

    return badge;
  }

  function attachReputationToElement(element, userId) {
    if (!element) return null;
    const score = getReputation(userId);
    const existing = element.querySelector('.reputation-badge') || (element.id === 'user-reputation-badge' ? element.querySelector('.reputation-badge') : null);
    const badge = createReputationBadge(score);
    if (existing && existing.parentNode) {
      existing.parentNode.replaceChild(badge, existing);
      return badge;
    }
    // 如果 element 本身是容器，直接追加
    element.appendChild(badge);
    return badge;
  }

  // 导出到全局供其他模块调用
  window.reputation = {
    getReputation,
    setReputation,
    createReputationBadge,
    attachReputationToElement
  };

})();
