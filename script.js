document.addEventListener('DOMContentLoaded', function() {
  
  // --- 1. OTENTIKASI & ROLE CHECK ---
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

  // --- 2. FUNGSI KHUSUS ADMIN ---
  function viewLocalStorage() {
    let tableHTML = '<table class="modal-table"><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      let value = localStorage.getItem(key);
      try {
        value = JSON.stringify(JSON.parse(value), null, 2);
      } catch (e) { /* Biarkan sebagai teks biasa */ }
      tableHTML += `<tr><td>${key}</td><td><pre>${value}</pre></td></tr>`;
    }
    tableHTML += '</tbody></table>';
    openModal({ title: "Isi LocalStorage", contentHTML: tableHTML, confirmText: "Tutup" });
  }
  
  function manageUsers() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let tableHTML = '<table class="modal-table"><thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Aksi</th></tr></thead><tbody>';
    users.forEach(user => {
      const isCurrentUser = user.email === currentUser.email;
      const deleteButton = isCurrentUser 
        ? `<button class="btn btn-disabled" disabled>Hapus</button>`
        : `<button class="btn btn-danger btn-small delete-user-btn" data-email="${user.email}">Hapus</button>`;
      const editButton = `<button class="btn btn-small edit-user-btn" data-email="${user.email}" style="margin-right: 5px;">Edit</button>`;
      
      tableHTML += `<tr><td>${user.username}</td><td>${user.email}</td><td>${user.role}</td><td>${editButton}${deleteButton}</td></tr>`;
    });
    tableHTML += '</tbody></table>';
    openModal({
      title: "Kelola Pengguna", contentHTML: tableHTML, confirmText: "Tutup",
      onRender: () => {
        document.querySelectorAll('.delete-user-btn').forEach(button => {
          button.addEventListener('click', function() {
            const userEmail = this.getAttribute('data-email');
            if (confirm(`Yakin ingin menghapus user: ${userEmail}?`)) deleteUser(userEmail);
          });
        });
        document.querySelectorAll('.edit-user-btn').forEach(button => {
          button.addEventListener('click', function() {
            const userEmail = this.getAttribute('data-email');
            editUser(userEmail);
          });
        });
      }
    });
  }

  function deleteUser(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    localStorage.setItem('users', JSON.stringify(users.filter(user => user.email !== email)));
    manageUsers(); // Refresh the list
    showNotification(`User ${email} berhasil dihapus.`, '#f85149');
  }

  function editUser(email) {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userToEdit = users.find(user => user.email === email);
      if (!userToEdit) return;

      document.getElementById('modal').classList.remove('show'); // Tutup modal daftar user

      // Buka modal baru untuk edit
      let editFormHTML = `
        <div class="input-group">
          <label for="edit-username">Username</label>
          <input type="text" id="edit-username" value="${userToEdit.username}">
        </div>
        <div class="input-group">
          <label for="edit-email">Email</label>
          <input type="email" id="edit-email" value="${userToEdit.email}">
        </div>
        <div class="input-group">
            <label for="edit-role">Role</label>
            <select id="edit-role" class="input-group">
                <option value="user" ${userToEdit.role === 'user' ? 'selected' : ''}>User</option>
                <option value="admin" ${userToEdit.role === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-secondary);">Catatan: Password tidak dapat diubah dari panel ini.</p>
      `;

      setTimeout(() => { // Beri jeda agar modal sebelumnya tertutup sempurna
        openModal({
          title: "Edit Pengguna", contentHTML: editFormHTML,
          confirmText: "Simpan", cancelText: "Batal",
          onConfirm: () => {
            const newData = {
              username: document.getElementById('edit-username').value,
              email: document.getElementById('edit-email').value,
              role: document.getElementById('edit-role').value,
            };
            updateUser(email, newData);
          },
          onCancel: () => manageUsers() // Buka kembali daftar user jika dibatalkan
        });
      }, 300);
  }
  
  function updateUser(originalEmail, newData) {
      let users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(user => user.email === originalEmail);

      if (userIndex !== -1) {
          const isEmailTaken = users.some((user, index) => user.email === newData.email && index !== userIndex);
          if (isEmailTaken) {
              showNotification(`Email ${newData.email} sudah digunakan!`, '#f85149');
              manageUsers();
              return;
          }

          users[userIndex] = { ...users[userIndex], ...newData };
          
          if (currentUser.email === originalEmail) {
              const updatedCurrentUser = { ...currentUser, ...newData };
              localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
          }

          localStorage.setItem('users', JSON.stringify(users));
          showNotification(`Data untuk ${originalEmail} berhasil diperbarui.`, '#3fb950');
      }
      manageUsers(); // Refresh daftar pengguna
  }
  
  // --- 3. PENGATURAN UI UTAMA ---
  const menuToggle = document.getElementById('menuToggle');
  const dropdownMenu = document.getElementById('dropdownMenu');
  menuToggle.addEventListener('click', () => { dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex'; });
  window.addEventListener('click', (e) => { if (menuToggle && !menuToggle.parentElement.contains(e.target)) dropdownMenu.style.display = 'none'; });

  const modeToggle = document.getElementById('modeToggle');
  const modeIcon = document.getElementById('modeIcon');
  function applyTheme(theme) {
    if (theme === 'dark') { document.body.classList.add('dark-mode'); if(modeIcon) modeIcon.src = 'sun.png'; }
    else { document.body.classList.remove('dark-mode'); if(modeIcon) modeIcon.src = 'moon.png'; }
  }
  if(modeToggle) {
    modeToggle.addEventListener('click', () => {
      const newTheme = document.body.classList.toggle('dark-mode') ? 'dark' : 'light';
      localStorage.setItem('mode', newTheme);
      applyTheme(newTheme);
    });
  }
  applyTheme(localStorage.getItem('mode') || 'light');
  
  function openModal(options) {
      const modal = document.getElementById('modal');
      const modalTitle = modal.querySelector('.modal-title');
      const modalBody = modal.querySelector('.modal-body');
      const modalFooter = modal.querySelector('.modal-footer');
      modalBody.innerHTML = "";
      modalFooter.innerHTML = "";
      if (modalTitle) modalTitle.textContent = options.title || " ";
      
      let content = options.contentHTML || `<p>${options.message || ''}</p>`;
      
      if (options.input) {
        content += `<input type="text" id="modal-input" class="modal-input" value="${options.defaultValue || ''}" placeholder="${options.placeholder || ''}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: transparent; color: var(--text-color); margin-top: 10px;">`;
      }
      modalBody.innerHTML = content;

      if (options.confirmText) {
          const confirmBtn = document.createElement('button');
          confirmBtn.textContent = options.confirmText;
          confirmBtn.className = 'btn btn-primary';
          confirmBtn.onclick = () => {
              const inputValue = options.input ? document.getElementById('modal-input').value : null;
              modal.classList.remove('show');
              if (options.onConfirm) options.onConfirm(inputValue);
          };
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
      if (options.input) document.getElementById('modal-input').focus();
      if (options.onRender) options.onRender();
  }
  window.openLogoutModal = (e) => { e.preventDefault(); document.getElementById('logoutModal').style.display = 'flex'; };
  window.closeLogoutModal = () => { document.getElementById('logoutModal').style.display = 'none'; };
  window.logout = () => { localStorage.removeItem('currentUser'); window.location.href = "logout.html"; };

  // --- 4. ELEMEN & STATE APLIKASI DZIKIR ---
  const dzikirTypeSelect = document.getElementById('dzikir-type');
  const dzikirDisplay = document.getElementById('dzikir-display');
  const targetCountInput = document.getElementById('target-count');
  const counterDisplay = document.getElementById('counter');
  const currentCountDisplay = document.getElementById('current-count');
  const targetDisplayValue = document.getElementById('target-display-value');
  const progressBar = document.getElementById('progress-bar');
  const countButton = document.getElementById('count-btn');
  const resetButton = document.getElementById('reset-btn');
  const saveButton = document.getElementById('save-btn');
  const notification = document.getElementById('notification');
  const addDzikirBtn = document.getElementById('add-dzikir-btn');
  const editDzikirBtn = document.getElementById('edit-dzikir-btn');
  const deleteDzikirBtn = document.getElementById('delete-dzikir-btn');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');

  let count = 0, targetCount = 0;
  let dzikirHistory = JSON.parse(localStorage.getItem('dzikirHistory')) || [];

  const radius = progressBar ? progressBar.r.baseVal.value : 0;
  const circumference = 2 * Math.PI * radius;
  if(progressBar) progressBar.style.strokeDasharray = `${circumference} ${circumference}`;

  // --- 5. FUNGSI INTI APLIKASI DZIKIR ---
  function loadCustomDzikir() {
    const customDzikir = JSON.parse(localStorage.getItem('customDzikir')) || [];
    customDzikir.forEach(dzikir => {
      const option = document.createElement('option');
      option.value = dzikir.value;
      option.textContent = dzikir.text;
      dzikirTypeSelect.appendChild(option);
    });
  }
  
  function saveCustomDzikir() {
    const customOptions = [];
    for (let i = 0; i < dzikirTypeSelect.options.length; i++) {
      const option = dzikirTypeSelect.options[i];
      if (!option.hasAttribute('data-default')) {
        customOptions.push({ value: option.value, text: option.textContent });
      }
    }
    localStorage.setItem('customDzikir', JSON.stringify(customOptions));
  }
  
  if (dzikirTypeSelect) {
    for(let i=0; i < dzikirTypeSelect.options.length; i++){
      if(dzikirTypeSelect.options[i].value !== 'ListDzikir') {
        dzikirTypeSelect.options[i].setAttribute('data-default', 'true');
      }
    }
    loadCustomDzikir();
  }

  function updateDisplay() {
      if (!counterDisplay) return;
      counterDisplay.textContent = count;
      currentCountDisplay.textContent = count;
      targetDisplayValue.textContent = targetCount;
      const offset = circumference - (count / targetCount) * circumference;
      if(progressBar) progressBar.style.strokeDashoffset = (targetCount > 0 && count > 0) ? Math.max(0, offset) : circumference;
  }

  function updateButtonsState() {
    if (!countButton) return;
    const isReady = dzikirTypeSelect.value !== "ListDzikir" && parseInt(targetCountInput.value) > 0;
    [countButton, resetButton, saveButton].forEach(btn => {
        isReady ? btn.classList.remove('btn-disabled') : btn.classList.add('btn-disabled');
    });
  }

  function showNotification(message, color) {
    notification.textContent = message;
    notification.style.backgroundColor = color;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
  }

  // --- 6. EVENT LISTENERS ---
  if(dzikirTypeSelect){
    dzikirTypeSelect.addEventListener('change', function() {
      dzikirDisplay.textContent = this.options[this.selectedIndex].text;
      targetCountInput.value = '';
      targetCount = 0;
      count = 0;
      updateDisplay();
      updateButtonsState();
    });
  }

  if(targetCountInput){
    targetCountInput.addEventListener('input', function() {
        targetCount = parseInt(this.value) || 0;
        count = 0;
        updateDisplay();
        updateButtonsState();
    });
  }
  
  if(countButton) countButton.addEventListener('click', function() {
      if (this.classList.contains('btn-disabled')) return;
      if (targetCount > 0 && count >= targetCount) return;
      count++;
      updateDisplay();
      if (count === targetCount) showNotification('Alhamdulillah, target tercapai!', '#3fb950');
  });
  
  if(resetButton) resetButton.addEventListener('click', function() {
      if (this.classList.contains('btn-disabled')) return;
      count = 0;
      updateDisplay();
      showNotification('Penghitung direset.', '#58a6ff');
  });

  if(saveButton) saveButton.addEventListener('click', function() {
      if (this.classList.contains('btn-disabled')) return;
      const session = {
          id: Date.now(),
          type: dzikirDisplay.textContent, count: count, target: targetCount,
          date: new Date().toLocaleString('id-ID')
      };
      dzikirHistory.unshift(session);
      localStorage.setItem('dzikirHistory', JSON.stringify(dzikirHistory));
      showNotification('Sesi berhasil disimpan!', '#3fb950');
  });

  if(clearHistoryBtn) clearHistoryBtn.addEventListener('click', () => {
    if(confirm('Yakin ingin menghapus seluruh riwayat dzikir?')) {
      localStorage.removeItem('dzikirHistory');
      dzikirHistory = [];
      showNotification('Semua riwayat berhasil dihapus', '#f85149');
    }
  });
  
  if(exportPdfBtn) exportPdfBtn.addEventListener('click', () => {
    if (dzikirHistory.length === 0) return showNotification("Tidak ada riwayat untuk diekspor!", "#e3b341");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.autoTable({
      head: [["No", "Jenis Dzikir", "Hitungan", "Target", "Tanggal"]],
      body: dzikirHistory.map((s, i) => [i + 1, s.type, s.count, s.target || "∞", s.date]),
    });
    doc.save("riwayat_dzikir.pdf");
  });
  
  if(addDzikirBtn) addDzikirBtn.addEventListener('click', () => {
    openModal({
      title: "Tambah Dzikir Baru", input: true, placeholder: "Contoh: Shalawat Jibril",
      confirmText: "Simpan", cancelText: "Batal",
      onConfirm: (value) => {
        if (value && value.trim() !== "") {
          const newOption = document.createElement('option');
          newOption.value = value.trim().toLowerCase();
          newOption.textContent = value.trim();
          dzikirTypeSelect.appendChild(newOption);
          saveCustomDzikir();
          showNotification('Dzikir baru berhasil ditambahkan!', '#3fb950');
        } else {
          showNotification('Nama dzikir tidak boleh kosong!', '#f85149');
        }
      }
    });
  });

  if(editDzikirBtn) editDzikirBtn.addEventListener('click', () => {
    const selectedOption = dzikirTypeSelect.options[dzikirTypeSelect.selectedIndex];
    if (!selectedOption || selectedOption.value === 'ListDzikir') return showNotification('Pilih dzikir yang ingin diubah.', '#e3b341');
    if (selectedOption.hasAttribute('data-default')) return showNotification('Dzikir bawaan tidak dapat diubah.', '#f85149');
    openModal({
      title: "Edit Dzikir", input: true, defaultValue: selectedOption.textContent,
      confirmText: "Update", cancelText: "Batal",
      onConfirm: (value) => {
        if (value && value.trim() !== "") {
          selectedOption.value = value.trim().toLowerCase();
          selectedOption.textContent = value.trim();
          dzikirDisplay.textContent = value.trim();
          saveCustomDzikir();
          showNotification('Dzikir berhasil diperbarui!', '#3fb950');
        }
      }
    });
  });

  if(deleteDzikirBtn) deleteDzikirBtn.addEventListener('click', () => {
    const selectedOption = dzikirTypeSelect.options[dzikirTypeSelect.selectedIndex];
    if (!selectedOption || selectedOption.value === 'ListDzikir') return showNotification('Pilih dzikir yang ingin dihapus.', '#e3b341');
    if (selectedOption.hasAttribute('data-default')) return showNotification('Dzikir bawaan tidak dapat dihapus.', '#f85149');
    if(confirm(`Yakin ingin menghapus dzikir "${selectedOption.textContent}"?`)){
      selectedOption.remove();
      dzikirTypeSelect.selectedIndex = 0;
      dzikirDisplay.textContent = 'Pilih Dzikir & Target untuk memulai';
      saveCustomDzikir();
      showNotification('Dzikir berhasil dihapus!', '#f85149');
    }
  });

  if(document.getElementById('counter')) {
    updateDisplay();
    updateButtonsState();
  }
});