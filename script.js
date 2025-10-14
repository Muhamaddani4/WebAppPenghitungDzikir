document.addEventListener('DOMContentLoaded', function() {
  // ===================================================================
  // BAGIAN PENTING: PENGECEKAN ROLE & OTENTIKASI PENGGUNA
  // ===================================================================
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  if (currentUser.role === 'admin') {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.style.display = 'flex';
    
    document.getElementById('view-storage-btn')?.addEventListener('click', viewLocalStorage);
    document.getElementById('manage-users-btn')?.addEventListener('click', manageUsers);
  }

  // ===================================================================
  // FUNGSI-FUNGSI KHUSUS ADMIN (DENGAN TAMPILAN MODAL BARU)
  // ===================================================================
  function viewLocalStorage() {
    let tableHTML = '<table class="modal-table"><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      let value = localStorage.getItem(key);
      try { // Coba format JSON agar rapi
        const parsed = JSON.parse(value);
        value = JSON.stringify(parsed, null, 2);
      } catch (e) { /* Biarkan sebagai teks biasa */ }
      
      tableHTML += `<tr><td>${key}</td><td><pre>${value}</pre></td></tr>`;
    }
    tableHTML += '</tbody></table>';
    
    openModal({
        title: "Isi LocalStorage",
        contentHTML: tableHTML,
        confirmText: "Tutup"
    });
  }
  
  function manageUsers() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let tableHTML = '<table class="modal-table"><thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Aksi</th></tr></thead><tbody>';
    users.forEach(user => {
      const isCurrentUser = user.email === currentUser.email;
      const deleteButton = isCurrentUser 
        ? `<button class="btn btn-disabled" disabled>Hapus</button>`
        : `<button class="btn btn-danger delete-user-btn" data-email="${user.email}">Hapus</button>`;

      tableHTML += `<tr>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${deleteButton}</td>
        </tr>`;
    });
    tableHTML += '</tbody></table>';
    
    openModal({
        title: "Kelola Pengguna",
        contentHTML: tableHTML,
        confirmText: "Tutup",
        onRender: () => {
          document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.addEventListener('click', function() {
              const userEmail = this.getAttribute('data-email');
              if (confirm(`Yakin ingin menghapus user: ${userEmail}?`)) {
                deleteUser(userEmail);
              }
            });
          });
        }
    });
  }

  function deleteUser(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.filter(user => user.email !== email);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    manageUsers();
    showNotification(`User ${email} berhasil dihapus.`, '#f85149');
  }

  // ===================================================================
  // SISA KODE (SEMUA FUNGSI NORMAL APLIKASI)
  // ===================================================================
  const menuToggle = document.getElementById('menuToggle');
  const dropdownMenu = document.getElementById('dropdownMenu');
  menuToggle.addEventListener('click', () => {
    dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
  });
  window.addEventListener('click', (e) => {
    if (!menuToggle.parentElement.contains(e.target)) {
      dropdownMenu.style.display = 'none';
    }
  });

  const modeToggle = document.getElementById('modeToggle');
  const modeIcon = document.getElementById('modeIcon');
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      modeIcon.src = 'sun.png';
    } else {
      document.body.classList.remove('dark-mode');
      modeIcon.src = 'moon.png';
    }
  }
  modeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('mode', isDarkMode ? 'dark' : 'light');
    applyTheme(isDarkMode ? 'dark' : 'light');
  });
  applyTheme(localStorage.getItem('mode') || 'light');
  
  function openModal(options) {
      const modal = document.getElementById('modal');
      const modalTitle = modal.querySelector('.modal-title');
      const modalBody = modal.querySelector('.modal-body');
      const modalFooter = modal.querySelector('.modal-footer');
      modalBody.innerHTML = "";
      modalFooter.innerHTML = "";
      if (modalTitle) modalTitle.textContent = options.title || " ";
      if (options.contentHTML) modalBody.innerHTML = options.contentHTML;
      if (options.confirmText) {
          const confirmBtn = document.createElement('button');
          confirmBtn.textContent = options.confirmText;
          confirmBtn.className = 'btn btn-primary';
          confirmBtn.onclick = () => { modal.classList.remove('show'); if (options.onConfirm) options.onConfirm(); };
          modalFooter.appendChild(confirmBtn);
      }
      if (options.cancelText) {
          const cancelBtn = document.createElement('button');
          cancelBtn.textContent = options.cancelText;
          cancelBtn.className = 'btn';
          cancelBtn.onclick = () => { modal.classList.remove('show'); if (options.onCancel) options.onCancel(); };
          modalFooter.appendChild(cancelBtn);
      }
      modal.classList.add('show');
      if (options.onRender) options.onRender();
  }
  window.openModal = openModal;
  
  window.openLogoutModal = (e) => { e.preventDefault(); document.getElementById('logoutModal').style.display = 'flex'; };
  window.closeLogoutModal = () => { document.getElementById('logoutModal').style.display = 'none'; };
  window.logout = () => { localStorage.removeItem('currentUser'); window.location.href = "logout.html"; };
  
  const dzikirTypeSelect = document.getElementById('dzikir-type');
  const dzikirDisplay = document.getElementById('dzikir-display');
  const addDzikirBtn = document.getElementById('add-dzikir-btn');
  const editDzikirBtn = document.getElementById('edit-dzikir-btn');
  const deleteDzikirBtn = document.getElementById('delete-dzikir-btn');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const targetCountInput = document.getElementById('target-count');
  const counterDisplay = document.getElementById('counter');
  const currentCountDisplay = document.getElementById('current-count');
  const targetDisplayValue = document.getElementById('target-display-value');
  const progressBar = document.getElementById('progress-bar');
  const countButton = document.getElementById('count-btn');
  const resetButton = document.getElementById('reset-btn');
  const saveButton = document.getElementById('save-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  const notification = document.getElementById('notification');
  let count = 0;
  let targetCount = 0;
  let dzikirHistory = JSON.parse(localStorage.getItem('dzikirHistory')) || [];
  
  const radius = progressBar.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  progressBar.style.strokeDasharray = `${circumference} ${circumference}`;

  function updateDisplay() {
      counterDisplay.textContent = count;
      currentCountDisplay.textContent = count;
      targetDisplayValue.textContent = targetCount;
      const offset = circumference - (count / targetCount) * circumference;
      progressBar.style.strokeDashoffset = (targetCount > 0 && count > 0) ? Math.max(0, offset) : circumference;
  }

  function updateButtonsState() {
    const isReady = dzikirTypeSelect.value !== "ListDzikir" && parseInt(targetCountInput.value) > 0;
    [countButton, resetButton, saveButton].forEach(btn => {
        isReady ? btn.classList.remove('btn-disabled') : btn.classList.add('btn-disabled');
    });
  }

  dzikirTypeSelect.addEventListener('change', function() {
      dzikirDisplay.textContent = this.options[this.selectedIndex].text;
      if (!targetCountInput.value) targetCountInput.value = 33; // Default target
      targetCount = parseInt(targetCountInput.value);
      count = 0;
      updateDisplay();
      updateButtonsState();
  });

  targetCountInput.addEventListener('input', function() {
      targetCount = parseInt(this.value) || 0;
      count = 0;
      updateDisplay();
      updateButtonsState();
  });

  clearHistoryBtn.addEventListener('click', () => {
    if(confirm('Yakin ingin menghapus seluruh riwayat dzikir?')) {
      localStorage.removeItem('dzikirHistory');
      dzikirHistory = [];
      showNotification('Semua riwayat berhasil dihapus', '#f85149');
    }
  });

  countButton.addEventListener('click', function() {
      if (this.classList.contains('btn-disabled')) return;
      if (targetCount > 0 && count >= targetCount) return;
      count++;
      updateDisplay();
      if (count === targetCount) showNotification('Alhamdulillah, target tercapai!', '#3fb950');
  });
  
  resetButton.addEventListener('click', function() {
      if (this.classList.contains('btn-disabled')) return;
      count = 0;
      updateDisplay();
      showNotification('Penghitung direset.', '#58a6ff');
  });

  saveButton.addEventListener('click', function() { /* ... logika simpan ... */ });
  exportPdfBtn.addEventListener('click', () => { /* ... logika export pdf ... */ });

  function showNotification(message, color) {
    notification.textContent = message;
    notification.style.backgroundColor = color;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
  }

  updateDisplay();
  updateButtonsState();
});