document.addEventListener('DOMContentLoaded', function() {
  
  // --- 1. OTENTIKASI & ROLE CHECK ---
  // Bagian ini memastikan hanya user yang sudah login yang bisa akses
  // dan menampilkan panel admin jika rolenya 'admin'.
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  if (currentUser.role === 'admin') {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.style.display = 'block';
    
    document.getElementById('view-storage-btn')?.addEventListener('click', viewLocalStorage);
    document.getElementById('manage-users-btn')?.addEventListener('click', manageUsers);
  }

  // --- 2. FUNGSI KHUSUS ADMIN ---
  // Fungsi untuk menampilkan modal LocalStorage dan Kelola User.
  function viewLocalStorage() {
    let tableHTML = '<table class="modal-table"><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      let value = localStorage.getItem(key);
      try {
        value = JSON.stringify(JSON.parse(value), null, 2);
      } catch (e) { /* Biarkan teks biasa */ }
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
        : `<button class="btn btn-danger delete-user-btn" data-email="${user.email}">Hapus</button>`;
      tableHTML += `<tr><td>${user.username}</td><td>${user.email}</td><td>${user.role}</td><td>${deleteButton}</td></tr>`;
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
      }
    });
  }

  function deleteUser(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    localStorage.setItem('users', JSON.stringify(users.filter(user => user.email !== email)));
    manageUsers();
    showNotification(`User ${email} berhasil dihapus.`, '#f85149');
  }

  // --- 3. PENGATURAN UI UTAMA (NAVBAR & MODAL) ---
  const menuToggle = document.getElementById('menuToggle');
  const dropdownMenu = document.getElementById('dropdownMenu');
  menuToggle.addEventListener('click', () => {
    dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
  });
  window.addEventListener('click', (e) => {
    if (!menuToggle.parentElement.contains(e.target)) dropdownMenu.style.display = 'none';
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
    const newTheme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('mode', newTheme);
    applyTheme(newTheme);
  });
  applyTheme(localStorage.getItem('mode') || 'light');
  
  function openModal(options) {
      const modal = document.getElementById('modal');
      modal.querySelector('.modal-title').textContent = options.title || " ";
      modal.querySelector('.modal-body').innerHTML = options.contentHTML || `<p>${options.message || ''}</p>`;
      const footer = modal.querySelector('.modal-footer');
      footer.innerHTML = "";
      if (options.confirmText) {
          const confirmBtn = document.createElement('button');
          confirmBtn.textContent = options.confirmText;
          confirmBtn.className = 'btn btn-primary';
          confirmBtn.onclick = () => { modal.classList.remove('show'); if (options.onConfirm) options.onConfirm(); };
          footer.appendChild(confirmBtn);
      }
      modal.classList.add('show');
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
  
  // Tombol Aksi
  const addDzikirBtn = document.getElementById('add-dzikir-btn');
  const editDzikirBtn = document.getElementById('edit-dzikir-btn');
  const deleteDzikirBtn = document.getElementById('delete-dzikir-btn');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');

  // Variabel State
  let count = 0;
  let targetCount = 0;
  let dzikirHistory = JSON.parse(localStorage.getItem('dzikirHistory')) || [];

  // Setup Progress Bar Melingkar (SVG)
  const radius = progressBar.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  progressBar.style.strokeDasharray = `${circumference} ${circumference}`;

  // --- 5. FUNGSI INTI APLIKASI DZIKIR ---
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

  function showNotification(message, color) {
    notification.textContent = message;
    notification.style.backgroundColor = color;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
  }

  // --- 6. EVENT LISTENERS UNTUK SEMUA TOMBOL ---
  dzikirTypeSelect.addEventListener('change', function() {
      dzikirDisplay.textContent = this.options[this.selectedIndex].text;
      if (!targetCountInput.value) targetCountInput.value = 33;
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
      showNotification('Sesi berhasil disimpan!', '#3fb950');
  });

  clearHistoryBtn.addEventListener('click', () => {
    if(confirm('Yakin ingin menghapus seluruh riwayat dzikir?')) {
      localStorage.removeItem('dzikirHistory');
      dzikirHistory = [];
      showNotification('Semua riwayat berhasil dihapus', '#f85149');
    }
  });
  
  exportPdfBtn.addEventListener('click', () => {
    if (dzikirHistory.length === 0) {
      return showNotification("Tidak ada riwayat untuk diekspor!", "#e3b341");
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.autoTable({
      head: [["No", "Jenis Dzikir", "Hitungan", "Target", "Tanggal"]],
      body: dzikirHistory.map((s, i) => [i + 1, s.type, s.count, s.target || "∞", s.date]),
    });
    doc.save("riwayat_dzikir.pdf");
  });
  
  // Note: Fungsi untuk Tambah, Edit, Hapus Dzikir belum dibuatkan modalnya.
  // Jika diperlukan, bisa ditambahkan dengan memanggil openModal().
  addDzikirBtn.addEventListener('click', () => alert('Fitur "Tambah Dzikir" belum diimplementasikan.'));
  editDzikirBtn.addEventListener('click', () => alert('Fitur "Edit Dzikir" belum diimplementasikan.'));
  deleteDzikirBtn.addEventListener('click', () => alert('Fitur "Hapus Dzikir" belum diimplementasikan.'));

  // Inisialisasi tampilan awal
  updateDisplay();
  updateButtonsState();
});