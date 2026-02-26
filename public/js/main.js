// Live order summary update on checkout page
document.addEventListener('DOMContentLoaded', () => {

  // ===== CHECKOUT: Live Summary =====
  const qtyInputs = document.querySelectorAll('.qty-input');
  const summaryItems = document.getElementById('summary-items');
  const summaryTotal = document.getElementById('summary-total');

  if (qtyInputs.length > 0) {
    const updateSummary = () => {
      let total = 0;
      let html = '';

      qtyInputs.forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
          const price = parseFloat(input.dataset.price);
          const name = input.dataset.name;
          const lineTotal = qty * price;
          total += lineTotal;
          html += `<div class="summary-item">
            <span>${name} ×${qty}</span>
            <span>${lineTotal} ر.س</span>
          </div>`;
        }
      });

      if (summaryItems) summaryItems.innerHTML = html || '<p style="color:#666;font-size:13px">لم تختر أي منتج بعد</p>';
      if (summaryTotal) summaryTotal.textContent = total + ' ر.س';
    };

    qtyInputs.forEach(input => {
      input.addEventListener('input', updateSummary);
    });
    updateSummary();
  }

  // ===== ADMIN: Update Order Status =====
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async function() {
      const orderId = this.dataset.id;
      const status = this.value;
      const badge = this.closest('tr')?.querySelector('.status-badge') ||
                    this.closest('.order-list-card')?.querySelector('.status-badge');

      try {
        const res = await fetch(`/admin/order/${orderId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) {
          if (badge) {
            badge.className = 'status-badge status-' + status;
            const labels = { pending: 'قيد الانتظار', processing: 'قيد التنفيذ', completed: 'مكتمل', cancelled: 'ملغي' };
            badge.textContent = labels[status] || status;
          }
          showToast('✅ تم تحديث حالة الطلب');
        }
      } catch (e) {
        showToast('❌ فشل في التحديث', true);
      }
    });
  });

  // ===== Toast Notification =====
  window.showToast = (msg, isError = false) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: ${isError ? '#e05252' : '#4a9c5d'}; color: #fff;
      padding: 12px 24px; border-radius: 10px; font-size: 14px;
      z-index: 9999; font-family: 'Tajawal', sans-serif;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3); transition: opacity 0.3s;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2500);
  };

  // ===== AUTH TABS =====
  const tabs = document.querySelectorAll('.tab');
  const forms = document.querySelectorAll('.auth-form');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.style.display = 'none');
      tab.classList.add('active');
      const target = document.getElementById('form-' + tab.dataset.tab);
      if (target) target.style.display = 'block';
    });
  });
});
