// Admin page JS: fetch pending listings and allow approve/reject
const API_BASE = (window.location.hostname === 'localhost' ? 'http://localhost:4000' : '') || 'http://localhost:4000';

function notify(msg) {
  alert(msg);
}

async function loadPending() {
  const container = document.getElementById('admin-listings');
  const empty = document.getElementById('admin-empty');
  container.innerHTML = '';
  try {
    const res = await fetch(`${API_BASE}/api/pending-listings`);
    const list = await res.json();
    if (!list || list.length === 0) {
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    list.forEach(item => {
      const el = document.createElement('div');
      el.className = 'listing';
      el.innerHTML = `
        <div class="listing-info">
          <h3>${escapeHtml(item.name)} <small style="color:#666">${escapeHtml(item.specs || '')}</small></h3>
          <p>${escapeHtml(item.description || '')}</p>
          <div>价格: <strong>${escapeHtml(item.price || '')}</strong> • 地点: ${escapeHtml(item.location || '')}</div>
        </div>
        <div class="listing-actions">
          <span class="status-badge">${escapeHtml(item.status)}</span>
          <div style="margin-top:8px">
            <button class="btn btn-primary" data-id="${item.id}" onclick="approve(${item.id})">通过</button>
            <button class="btn btn-outline" data-id="${item.id}" onclick="reject(${item.id})">拒绝</button>
          </div>
        </div>
      `;
      container.appendChild(el);
    });
  } catch (e) {
    console.error(e);
    notify('无法加载待审核列表：' + e.message);
  }
}

function getAdminHeaders() {
  const token = document.getElementById('admin-token').value.trim();
  const name = document.getElementById('admin-name').value.trim();
  return {
    'Content-Type': 'application/json',
    'x-admin-token': token,
    'x-admin-name': name
  };
}

async function approve(id) {
  try {
    const res = await fetch(`${API_BASE}/api/listings/${id}/approve`, {
      method: 'POST',
      headers: getAdminHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      notify('审批失败：' + (err.error || res.statusText));
      return;
    }
    notify('已通过审核');
    loadPending();
  } catch (e) {
    notify('审批失败：' + e.message);
  }
}

async function reject(id) {
  const reason = prompt('请输入拒绝原因（可选）:') || '';
  try {
    const res = await fetch(`${API_BASE}/api/listings/${id}/reject`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json();
      notify('操作失败：' + (err.error || res.statusText));
      return;
    }
    notify('已拒绝');
    loadPending();
  } catch (e) {
    notify('操作失败：' + e.message);
  }
}

function escapeHtml(text) {
  if (!text && text !== 0) return '';
  return String(text).replace(/[&<>"']/g, function (m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m]; });
}

// 绑定按钮事件（如果页面中存在）
const reloadBtn = document.getElementById('reload-btn');
if (reloadBtn) reloadBtn.addEventListener('click', loadPending);

const closeBtn = document.getElementById('close-admin');
if (closeBtn) closeBtn.addEventListener('click', () => {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.style.display = 'none';
});

// 不在 DOMContentLoaded 自动加载，改为在面板显示时调用 loadPending()
window.adminLoadPending = loadPending;
 
