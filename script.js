document.addEventListener('DOMContentLoaded', function() {
  // ===================================================================
  // BAGIAN PENTING: PENGECEKAN ROLE & OTENTIKASI PENGGUNA
  // ===================================================================
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // 1. Jika tidak ada yang login, langsung tendang ke halaman login
  if (!currentUser) {
    window.location.href = "login.html";
    return; // Hentikan sisa script agar tidak error
  }

  // 2. Jika yang login adalah 'admin', tampilkan panel admin
  if (currentUser.role === 'admin') {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
      adminPanel.style.display = 'block'; // 'block' akan membuatnya terlihat
    }
    
    // Pasang fungsi ke tombol-tombol admin
    const viewStorageBtn = document.getElementById('view-storage-btn');
    const manageUsersBtn = document.getElementById('manage-users-btn');

    if (viewStorageBtn) {
      viewStorageBtn.addEventListener('click', viewLocalStorage);
    }
    if (manageUsersBtn) {
      manageUsersBtn.addEventListener('click', manageUsers);
    }
  }

  // ===================================================================
  // FUNGSI-FUNGSI KHUSUS ADMIN
  // ===================================================================

  // Fungsi untuk melihat semua isi LocalStorage
  function viewLocalStorage() {
    const storageData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        storageData[key] = JSON.parse(localStorage.getItem(key));
      } catch (e) {
        storageData[key] = localStorage.getItem(key);
      }
    }
    const formattedData = JSON.stringify(storageData, null, 2);
    openModal({
        title: "Isi LocalStorage",
        contentHTML: `<pre style="text-align: left; white-space: pre-wrap; word-break: break-all;">${formattedData}</pre>`,
        confirmText: "Tutup"
    });
  }
  
  // Fungsi untuk menampilkan daftar user dan tombol hapus
  function manageUsers() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    let userListHTML = '<ul style="list-style: none; padding: 0; text-align: left;">';
    users.forEach(user => {
      const isCurrentUser = user.email === currentUser.email;
      const deleteButton = isCurrentUser 
        ? `<button class="delete-user-btn" data-email="${user.email}" disabled title="Tidak dapat menghapus diri sendiri">Hapus</button>`
        : `<button class="delete-user-btn btn-danger" data-email="${user.email}">Hapus</button>`;

      userListHTML += `
        <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
          <span><strong>${user.username}</strong> (${user.role})</span>
          ${deleteButton}
        </li>`;
    });
    userListHTML += '</ul>';
    
    openModal({
        title: "Kelola Pengguna",
        contentHTML: userListHTML,
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

  // Fungsi untuk menghapus user dari LocalStorage
  function deleteUser(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.filter(user => user.email !== email);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    manageUsers(); // Refresh daftar user di modal
    showNotification(`User ${email} berhasil dihapus.`, '#e74c3c');
  }


  // ===================================================================
  // SISA KODE (SEMUA FUNGSI NORMAL APLIKASI)
  // ===================================================================

  const menuToggle = document.getElementById('menuToggle');
  const dropdownMenu = document.getElementById('dropdownMenu');
  menuToggle.addEventListener('click', () => {
    const isVisible = dropdownMenu.style.display === 'flex';
    dropdownMenu.style.display = isVisible ? 'none' : 'flex';
    dropdownMenu.style.flexDirection = 'column';
  });
  window.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
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
  applyTheme(localStorage.getItem('mode'));
  
  // Fungsi Modal yang lebih fleksibel
  function openModal(options) {
      const modal = document.getElementById('modal');
      const modalTitle = modal.querySelector('.modal-title');
      const modalBody = modal.querySelector('.modal-body');
      const modalFooter = modal.querySelector('.modal-footer');
      modalBody.innerHTML = "";
      modalFooter.innerHTML = "";
      if (modalTitle) modalTitle.textContent = options.title || " ";
      if (options.message) modalBody.innerHTML = `<p>${options.message}</p>`;
      if (options.contentHTML) modalBody.innerHTML = options.contentHTML;
      let inputElem = null;
      if (options.input) {
          inputElem = document.createElement('input');
          inputElem.type = "text";
          inputElem.value = options.defaultValue || "";
          inputElem.style.cssText = "width: 95%; padding: 10px; border-radius: 5px; border: 1px solid #555; background: #333; color: white;";
          modalBody.appendChild(inputElem);
      }
      if (options.confirmText) {
          const confirmBtn = document.createElement('button');
          confirmBtn.textContent = options.confirmText;
          confirmBtn.className = 'btn-primary';
          confirmBtn.onclick = () => {
              modal.classList.remove('show');
              if (options.onConfirm) options.onConfirm(inputElem ? inputElem.value : null);
          };
          modalFooter.appendChild(confirmBtn);
      }
      if (options.cancelText) {
          const cancelBtn = document.createElement('button');
          cancelBtn.textContent = options.cancelText;
          cancelBtn.className = 'btn-secondary';
          cancelBtn.onclick = () => {
              modal.classList.remove('show');
              if (options.onCancel) options.onCancel();
          };
          modalFooter.appendChild(cancelBtn);
      }
      modal.classList.add('show');
      if (options.onRender) options.onRender();
  }
  window.openModal = openModal;
  
  window.openLogoutModal = (e) => {
      if (e) e.preventDefault();
      document.getElementById('logoutModal').style.display = 'flex';
  };
  window.closeLogoutModal = () => {
      document.getElementById('logoutModal').style.display = 'none';
  };
  window.logout = () => {
      localStorage.removeItem('currentUser');
      window.location.href = "logout.html";
  };
  
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
  progressBar.style.strokeDashoffset = circumference;

  function updateDisplay() {
      counterDisplay.textContent = count;
      currentCountDisplay.textContent = count;
      targetDisplayValue.textContent = targetCount;
      const offset = circumference - (count / targetCount) * circumference;
      progressBar.style.strokeDashoffset = (targetCount > 0) ? Math.max(0, offset) : circumference;
  }

  function updateButtonsState() {
    const isReady = dzikirTypeSelect.value !== "ListDzikir" && parseInt(targetCountInput.value) > 0;
    [countButton, resetButton, saveButton].forEach(btn => {
        isReady ? btn.classList.remove('btn-disabled') : btn.classList.add('btn-disabled');
    });
  }

  dzikirTypeSelect.addEventListener('change', function() {
      dzikirDisplay.textContent = this.options[this.selectedIndex].text;
      updateButtonsState();
  });

  targetCountInput.addEventListener('input', function() {
      targetCount = parseInt(this.value) || 0;
      count = 0;
      updateDisplay();
      updateButtonsState();
  });

  addDzikirBtn.addEventListener('click', () => { /* ... logika tambah dzikir ... */ });
  editDzikirBtn.addEventListener('click', () => { /* ... logika edit dzikir ... */ });
  deleteDzikirBtn.addEventListener('click', () => { /* ... logika hapus dzikir ... */ });
  
  clearHistoryBtn.addEventListener('click', () => {
    if(confirm('Yakin ingin menghapus seluruh riwayat?')){
      localStorage.removeItem('dzikirHistory');
      dzikirHistory = [];
      showNotification('Semua riwayat berhasil dihapus', '#e74c3c');
    }
  });

  countButton.addEventListener('click', function() {
      if (this.classList.contains('btn-disabled')) return;
      if (targetCount > 0 && count >= targetCount) {
          showNotification('Target sudah tercapai!', '#f39c12');
          return;
      }
      count++;
      updateDisplay();
      if (count === targetCount) {
          showNotification('Alhamdulillah, target tercapai!', '#2ecc71');
      }
  });
  
  resetButton.addEventListener('click', function() {
      if (this.classList.contains('btn-disabled')) return;
      count = 0;
      updateDisplay();
      showNotification('Penghitung direset.', '#3498db');
  });

  saveButton.addEventListener('click', function() {
      if (this.classList.contains('btn-disabled')) return;
      const session = {
          id: Date.now(),
          type: dzikirDisplay.textContent,
          count: count,
          target: targetCount,
          date: new Date().toLocaleString('id-ID')
      };
      dzikirHistory.unshift(session);
      localStorage.setItem('dzikirHistory', JSON.stringify(dzikirHistory));
      showNotification('Sesi berhasil disimpan!', '#2ecc71');
  });

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