document.addEventListener('DOMContentLoaded', function() {
  
  // --- 1. OTENTIKASI & ROLE CHECK ---
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  if (currentUser.role === 'admin') {
    document.getElementById('admin-panel')?.style.display = 'flex';
    document.getElementById('view-storage-btn')?.addEventListener('click', viewLocalStorage);
    document.getElementById('manage-users-btn')?.addEventListener('click', manageUsers);
  }

  // --- 2. FUNGSI KHUSUS ADMIN ---
  function viewLocalStorage() { /* ... fungsi tetap sama ... */ }
  function manageUsers() { /* ... fungsi tetap sama ... */ }
  function deleteUser(email) { /* ... fungsi tetap sama ... */ }
  
  // --- 3. PENGATURAN UI UTAMA ---
  const menuToggle = document.getElementById('menuToggle');
  const dropdownMenu = document.getElementById('dropdownMenu');
  menuToggle.addEventListener('click', () => { dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex'; });
  window.addEventListener('click', (e) => { if (!menuToggle.parentElement.contains(e.target)) dropdownMenu.style.display = 'none'; });

  const modeToggle = document.getElementById('modeToggle');
  const modeIcon = document.getElementById('modeIcon');
  function applyTheme(theme) {
    if (theme === 'dark') { document.body.classList.add('dark-mode'); modeIcon.src = 'sun.png'; }
    else { document.body.classList.remove('dark-mode'); modeIcon.src = 'moon.png'; }
  }
  modeToggle.addEventListener('click', () => {
    const newTheme = document.body.classList.toggle('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('mode', newTheme);
    applyTheme(newTheme);
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
      
      let content = options.contentHTML || `<p>${options.message || ''}</p>`;
      
      if (options.input) {
        content += `<input type="text" id="modal-input" class="modal-input" value="${options.defaultValue || ''}" placeholder="${options.placeholder || ''}">`;
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

  const radius = progressBar.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  progressBar.style.strokeDasharray = `${circumference} ${circumference}`;

  // --- 5. FUNGSI INTI APLIKASI DZIKIR ---
  
  // --- FUNGSI MANAJEMEN DAFTAR DZIKIR ---
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
      // Hanya simpan jika bukan opsi default (yang tidak punya atribut data-default)
      if (!option.hasAttribute('data-default')) {
        customOptions.push({ value: option.value, text: option.textContent });
      }
    }
    localStorage.setItem('customDzikir', JSON.stringify(customOptions));
  }
  
  // Menandai opsi default agar tidak bisa diubah/dihapus
  for(let i=0; i < dzikirTypeSelect.options.length; i++){
    if(dzikirTypeSelect.options[i].value !== 'ListDzikir') {
      dzikirTypeSelect.options[i].setAttribute('data-default', 'true');
    }
  }
  
  loadCustomDzikir(); // Panggil fungsi untuk memuat dzikir kustom

  // --- FUNGSI TAMPILAN & NOTIFIKASI ---
  function updateDisplay() { /* ... fungsi tetap sama ... */ }
  function updateButtonsState() { /* ... fungsi tetap sama ... */ }
  function showNotification(message, color) { /* ... fungsi tetap sama ... */ }

  // --- 6. EVENT LISTENERS ---
  dzikirTypeSelect.addEventListener('change', function() {
    dzikirDisplay.textContent = this.options[this.selectedIndex].text;
    // PERUBAHAN: Target dikosongkan agar diisi manual
    targetCountInput.value = '';
    targetCount = 0;
    count = 0;
    updateDisplay();
    updateButtonsState();
  });

  targetCountInput.addEventListener('input', function() { /* ... fungsi tetap sama ... */ });
  countButton.addEventListener('click', function() { /* ... fungsi tetap sama ... */ });
  resetButton.addEventListener('click', function() { /* ... fungsi tetap sama ... */ });
  saveButton.addEventListener('click', function() { /* ... fungsi tetap sama ... */ });
  clearHistoryBtn.addEventListener('click', () => { /* ... fungsi tetap sama ... */ });
  exportPdfBtn.addEventListener('click', () => { /* ... fungsi tetap sama ... */ });

  // --- EVENT LISTENERS BARU UNTUK MANAJEMEN DZIKIR ---
  addDzikirBtn.addEventListener('click', () => {
    openModal({
      title: "Tambah Dzikir Baru",
      input: true,
      placeholder: "Contoh: Shalawat Jibril",
      confirmText: "Simpan",
      cancelText: "Batal",
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

  editDzikirBtn.addEventListener('click', () => {
    const selectedOption = dzikirTypeSelect.options[dzikirTypeSelect.selectedIndex];
    if (!selectedOption || selectedOption.value === 'ListDzikir') {
      return showNotification('Pilih dzikir yang ingin diubah.', '#e3b341');
    }
    if (selectedOption.hasAttribute('data-default')) {
      return showNotification('Dzikir bawaan tidak dapat diubah.', '#f85149');
    }
    openModal({
      title: "Edit Dzikir",
      input: true,
      defaultValue: selectedOption.textContent,
      confirmText: "Update",
      cancelText: "Batal",
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

  deleteDzikirBtn.addEventListener('click', () => {
    const selectedOption = dzikirTypeSelect.options[dzikirTypeSelect.selectedIndex];
    if (!selectedOption || selectedOption.value === 'ListDzikir') {
      return showNotification('Pilih dzikir yang ingin dihapus.', '#e3b341');
    }
    if (selectedOption.hasAttribute('data-default')) {
      return showNotification('Dzikir bawaan tidak dapat dihapus.', '#f85149');
    }
    if(confirm(`Yakin ingin menghapus dzikir "${selectedOption.textContent}"?`)){
      selectedOption.remove();
      dzikirTypeSelect.selectedIndex = 0;
      dzikirDisplay.textContent = 'Pilih Dzikir & Target untuk memulai';
      saveCustomDzikir();
      showNotification('Dzikir berhasil dihapus!', '#f85149');
    }
  });

  updateDisplay();
  updateButtonsState();
});