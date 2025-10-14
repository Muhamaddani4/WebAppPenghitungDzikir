document.addEventListener('DOMContentLoaded', function() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  // --- Blok Khusus Admin ---
  if (currentUser.role === 'admin') {
    const viewStorageBtn = document.getElementById('view-storage-btn');
    const manageUsersBtn = document.getElementById('manage-users-btn');

    if (viewStorageBtn) {
      viewStorageBtn.style.display = 'inline-block';
      viewStorageBtn.addEventListener('click', viewLocalStorage);
    }
    if (manageUsersBtn) {
      manageUsersBtn.style.display = 'inline-block';
      manageUsersBtn.addEventListener('click', manageUsers);
    }
  }

  // --- Fungsi untuk Melihat LocalStorage (Admin) ---
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
  
  // --- Fungsi Baru: Kelola User (Admin) ---
  function manageUsers() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    let userListHTML = '<ul style="list-style: none; padding: 0; text-align: left;">';
    users.forEach(user => {
      // Tombol hapus dinonaktifkan untuk admin yang sedang login
      const isCurrentUser = user.email === currentUser.email;
      const deleteButton = isCurrentUser 
        ? `<button class="delete-user-btn" data-email="${user.email}" disabled title="Tidak dapat menghapus diri sendiri">Hapus</button>`
        : `<button class="delete-user-btn" data-email="${user.email}">Hapus</button>`;

      userListHTML += `
        <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
          <span>
            <strong>${user.username}</strong> (${user.email}) - <em>${user.role}</em>
          </span>
          ${deleteButton}
        </li>`;
    });
    userListHTML += '</ul>';
    
    openModal({
        title: "Kelola Pengguna",
        contentHTML: userListHTML,
        confirmText: "Tutup",
        onRender: () => {
          // Tambahkan event listener setelah modal dirender
          document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.addEventListener('click', function() {
              const userEmail = this.getAttribute('data-email');
              if (confirm(`Yakin ingin menghapus user dengan email: ${userEmail}? Tindakan ini tidak bisa dibatalkan.`)) {
                deleteUser(userEmail);
              }
            });
          });
        }
    });
  }

  // --- Fungsi Baru: Hapus User (Admin) ---
  function deleteUser(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.filter(user => user.email !== email);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Refresh modal list
    manageUsers(); 
    showNotification(`User ${email} berhasil dihapus.`, '#e74c3c');
  }

  // --- (Sisa kode script.js kamu tetap sama persis seperti sebelumnya) ---
  // --- Pastikan untuk meng-copy sisa kode dari file script.js kamu yang lama ke sini ---
  
  // --- Setup Dropdown, Mode Toggle, dan Event Lain ---
  const menuToggle = document.getElementById('menuToggle');
  const dropdownMenu = document.getElementById('dropdownMenu');

  menuToggle.addEventListener('click', () => {
    dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
    dropdownMenu.style.flexDirection = 'column';
  });

  window.addEventListener('click', function(e) {
    if (!menuToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.style.display = 'none';
    }
  });

  document.querySelectorAll('nav ul li a').forEach(function(link) {
    link.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
    link.addEventListener('mousedown', function(e) {
      if (e.button === 2) {
        e.preventDefault();
      }
    });
  });

  const modeToggle = document.getElementById('modeToggle');
  const modeIcon = document.getElementById('modeIcon');
  const currentMode = localStorage.getItem('mode') || 'light';

  function updateIcon() {
    if (document.body.classList.contains('dark-mode')) {
      modeIcon.src = 'moon.png';
    } else {
      modeIcon.src = 'sun.png';
    }
    modeIcon.classList.add('rotate');
    setTimeout(() => {
      modeIcon.classList.remove('rotate');
    }, 500);
  }

  if (currentMode === 'dark') {
    document.body.classList.add('dark-mode');
  }
  updateIcon();

  modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('mode', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    updateIcon();
  });
  
  // --- Modal Logout & Modal Function ---
  function openLogoutModal(e) {
    if (e) e.preventDefault();
    document.getElementById('logoutModal').style.display = 'flex';
  }

  function closeLogoutModal() {
    document.getElementById('logoutModal').style.display = 'none';
  }

  function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = "logout.html";
  }
  window.openLogoutModal = openLogoutModal;
  window.closeLogoutModal = closeLogoutModal;
  window.logout = logout;

  // --- MODIFIKASI openModal agar lebih fleksibel ---
  function openModal(options) {
    const modal = document.getElementById('modal');
    const modalTitle = modal.querySelector('.modal-title'); // Asumsi ada elemen title
    const modalBody = modal.querySelector('.modal-body');
    const modalFooter = modal.querySelector('.modal-footer');
    
    // Reset
    modalBody.innerHTML = "";
    modalFooter.innerHTML = "";
    if(modalTitle) modalTitle.textContent = options.title || "Konfirmasi";

    // Konten bisa berupa teks atau HTML
    if (options.message) {
      const p = document.createElement('p');
      p.textContent = options.message;
      modalBody.appendChild(p);
    } else if (options.contentHTML) {
      modalBody.innerHTML = options.contentHTML;
    }

    let inputElem = null;
    if (options.input) {
      inputElem = document.createElement('input');
      inputElem.type = "text";
      inputElem.value = options.defaultValue || "";
      inputElem.style.width = '95%';
      inputElem.style.padding = '10px';
      modalBody.appendChild(inputElem);
    }
    
    // Hanya buat tombol jika ada teksnya
    if (options.confirmText) {
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = options.confirmText;
        confirmBtn.classList.add('confirm');
        confirmBtn.addEventListener('click', function() {
            modal.classList.remove('show');
            if (options.onConfirm) {
                options.onConfirm(inputElem ? inputElem.value : null);
            }
        });
        modalFooter.appendChild(confirmBtn);
    }

    if (options.cancelText) {
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = options.cancelText || "Batal";
        cancelBtn.classList.add('cancel');
        cancelBtn.addEventListener('click', function() {
            modal.classList.remove('show');
            if (options.onCancel) options.onCancel();
        });
        modalFooter.appendChild(cancelBtn);
    }
    
    modal.classList.add('show');
    
    // Jalankan callback setelah modal dirender (penting untuk event listener)
    if(options.onRender) {
      options.onRender();
    }
  }
  window.openModal = openModal;
  
  // Sisa kode... (sama seperti sebelumnya)
  const dzikirTypeSelect = document.getElementById('dzikir-type');
  const dzikirDisplay = document.getElementById('dzikir-display');
  const addDzikirBtn = document.getElementById('add-dzikir-btn');
  const editDzikirBtn = document.getElementById('edit-dzikir-btn');
  const deleteDzikirBtn = document.getElementById('delete-dzikir-btn');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const targetCountInput = document.getElementById('target-count');
  const counterDisplay = document.getElementById('counter');
  const currentCountDisplay = document.getElementById('current-count');
  const targetDisplay = document.getElementById('target-display');
  const progressBar = document.getElementById('progress-bar');
  const countButton = document.getElementById('count-btn');
  const resetButton = document.getElementById('reset-btn');
  const saveButton = document.getElementById('save-btn');
  const historyList = document.getElementById('history-list');
  const notification = document.getElementById('notification');
  const particlesContainer = document.getElementById('particles-container');
  const exportPdfBtn = document.getElementById('export-pdf-btn');

  let count = 0;
  let targetCount = 0;
  let dzikirHistory = JSON.parse(localStorage.getItem('dzikirHistory')) || [];

  function showNotification(message, color) {
    notification.textContent = message;
    notification.style.backgroundColor = color || '#2ecc71';
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  function createParticles(x, y, count, colors) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = `${x + (Math.random() * 60 - 30)}px`;
      particle.style.top = `${y + (Math.random() * 60 - 30)}px`;
      particle.style.width = `${Math.random() * 6 + 4}px`;
      particle.style.height = particle.style.width;
      const animDuration = Math.random() * 2 + 1;
      const animDelay = Math.random() * 0.5;
      particle.style.animation = `float ${animDuration}s ease-in ${animDelay}s 1`;
      particlesContainer.appendChild(particle);
      setTimeout(() => {
        particle.remove();
      }, (animDuration + animDelay) * 1000);
    }
  }

  function addRippleEffect(button) {
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 700);
  }

  function updateDisplay() {
    counterDisplay.textContent = count;
    currentCountDisplay.textContent = count;
    if (targetCount > 0) {
      const progressPercentage = (count / targetCount) * 100;
      progressBar.style.width = `${Math.min(progressPercentage, 100)}%`;
    } else {
      progressBar.style.width = '0%';
    }
  }

  function updateButtonsState() {
    const isDzikirSelected = (dzikirTypeSelect.value && dzikirTypeSelect.value !== "ListDzikir");
    const targetValid = (parseInt(targetCountInput.value) > 0);
    if (isDzikirSelected && targetValid) {
      countButton.classList.remove("btn-disabled");
      resetButton.classList.remove("btn-disabled");
      saveButton.classList.remove("btn-disabled");
    } else {
      countButton.classList.add("btn-disabled");
      resetButton.classList.add("btn-disabled");
      saveButton.classList.add("btn-disabled");
    }
  }

  dzikirTypeSelect.addEventListener('change', function() {
    dzikirDisplay.textContent = this.options[this.selectedIndex].text;
    count = 0;
    targetCount = 0;
    targetCountInput.value = "";
    updateDisplay();
    updateButtonsState();
  });

  targetCountInput.addEventListener('input', function() {
    targetCount = parseInt(this.value) || 0;
    count = 0;
    targetDisplay.textContent = targetCount;
    updateDisplay();
    updateButtonsState();
  });

  addDzikirBtn.addEventListener('click', function() {
    openModal({
      title: "Tambah Dzikir",
      message: "Masukkan teks dzikir baru:",
      input: true,
      confirmText: "Simpan",
      cancelText: "Batal",
      onConfirm: function(value) {
        if (value && value.trim() !== "") {
          const newDzikir = value.trim();
          const optionExists = Array.from(dzikirTypeSelect.options).some(
            opt => opt.value.toLowerCase() === newDzikir.toLowerCase()
          );
          if (optionExists) {
            showNotification("Dzikir tersebut sudah ada!", "#e74c3c");
          } else {
            const newOption = document.createElement('option');
            newOption.value = newDzikir;
            newOption.text = newDzikir;
            dzikirTypeSelect.appendChild(newOption);
            dzikirTypeSelect.value = newDzikir;
            dzikirDisplay.textContent = newDzikir;
            showNotification("Dzikir baru berhasil ditambahkan!", "#27ae60");
            updateButtonsState();
          }
        } else {
          showNotification("Teks dzikir tidak boleh kosong!", "#e74c3c");
        }
      }
    });
  });

  editDzikirBtn.addEventListener('click', function() {
    const selectedIndex = dzikirTypeSelect.selectedIndex;
    if (selectedIndex < 0) return;
    if (selectedIndex < 5) {
      showNotification("Dzikir default tidak dapat diedit!", "#e74c3c");
      return;
    }
    const currentText = dzikirTypeSelect.options[selectedIndex].text;
    openModal({
      title: "Edit Dzikir",
      message: "Edit teks dzikir:",
      input: true,
      defaultValue: currentText,
      confirmText: "Simpan",
      cancelText: "Batal",
      onConfirm: function(newText) {
        if (newText && newText.trim() !== "") {
          dzikirTypeSelect.options[selectedIndex].value = newText.trim();
          dzikirTypeSelect.options[selectedIndex].text = newText.trim();
          dzikirDisplay.textContent = newText.trim();
          showNotification("Dzikir berhasil diedit!", "#27ae60");
        } else {
          showNotification("Teks dzikir tidak boleh kosong!", "#e74c3c");
        }
      }
    });
  });

  deleteDzikirBtn.addEventListener('click', function() {
    const selectedIndex = dzikirTypeSelect.selectedIndex;
    if (selectedIndex < 0) return;
    if (selectedIndex < 5) {
      showNotification("Dzikir default tidak dapat dihapus!", "#e74c3c");
      return;
    }
    openModal({
      title: "Hapus Dzikir",
      message: "Anda yakin ingin menghapus dzikir ini?",
      input: false,
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: function() {
        dzikirTypeSelect.remove(selectedIndex);
        dzikirTypeSelect.selectedIndex = 0;
        dzikirDisplay.textContent = dzikirTypeSelect.options[0].text;
        showNotification("Dzikir berhasil dihapus!", "#27ae60");
        updateButtonsState();
      }
    });
  });

  clearHistoryBtn.addEventListener('click', function() {
    if (confirm('Anda yakin ingin menghapus seluruh riwayat dzikir?')) {
      dzikirHistory = [];
      localStorage.removeItem('dzikirHistory');
      showNotification("Hapus semua riwayat☑️");
      if (typeof updateHistoryDisplay === "function") {
        updateHistoryDisplay();
      }
    }
  });

  countButton.addEventListener('click', function() {
    if (this.classList.contains("btn-disabled")) {
      openModal({ message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!", input: false, confirmText: "OK" });
      return;
    }
    if (targetCount > 0 && count >= targetCount) {
      showNotification(`Anda telah mencapai target ${targetCount} kali. Silakan reset untuk memulai lagi.`, "#f39c12");
      return;
    }
    count++;
    counterDisplay.classList.add('counter-animation');
    setTimeout(() => { counterDisplay.classList.remove('counter-animation'); }, 500);
    updateDisplay();
    addRippleEffect(countButton);
    const buttonRect = countButton.getBoundingClientRect();
    const containerRect = document.querySelector('.container').getBoundingClientRect();
    const x = buttonRect.left + buttonRect.width / 2 - containerRect.left;
    const y = buttonRect.top + buttonRect.height / 2 - containerRect.top;
    createParticles(x, y, 8, ['#3498db', '#2980b9', '#85C1E9']);
    if (targetCount > 0 && count === targetCount) {
      showNotification(`Alhamdulillah! Anda telah mencapai target ${targetCount} kali.`, "#f39c12");
      countButton.classList.add("btn-disabled");
      countButton.style.opacity = "0.5";
      countButton.style.cursor = "not-allowed";
      for (let i = 0; i < 5; i++) {
        setTimeout(() => { createParticles(Math.random() * containerRect.width, Math.random() * containerRect.height, 10, ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6']); }, i * 200);
      }
    }
  });

  resetButton.addEventListener('click', function() {
    if (this.classList.contains("btn-disabled")) {
      openModal({ message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!", input: false, confirmText: "OK" });
      return;
    }
    count = 0;
    updateDisplay();
    countButton.classList.remove("btn-disabled");
    countButton.style.opacity = "1";
    countButton.style.cursor = "pointer";
    showNotification("Penghitung telah direset", "#e74c3c");
    addRippleEffect(resetButton);
  });

  saveButton.addEventListener('click', function() {
    if (this.classList.contains("btn-disabled")) {
      openModal({ message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!", input: false, confirmText: "OK" });
      return;
    }
    const loadingOverlay = document.getElementById('loading');
    loadingOverlay.style.display = 'flex';
    setTimeout(() => {
      try {
        const dzikirText = dzikirDisplay.textContent;
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}`;
        const session = { id: Date.now(), type: dzikirText, count: count, target: targetCount, date: formattedDate };
        dzikirHistory.unshift(session);
        localStorage.setItem('dzikirHistory', JSON.stringify(dzikirHistory));
        if (typeof updateHistoryList === "function") {
          updateHistoryList();
        }
        addRippleEffect(saveButton);
        showNotification("Berhasil Simpan sesi Dzikir", "#2ecc71");
      } catch (error) {
        console.error("Error saat menyimpan sesi:", error);
        showNotification("Terjadi error saat menyimpan sesi", "#e74c3c");
      } finally {
        loadingOverlay.style.display = 'none';
      }
    }, 2000);
  });

  exportPdfBtn.addEventListener('click', function() {
    if (dzikirHistory.length === 0) {
      openModal({ message: "Tidak ada data riwayat untuk diekspor!", input: false, confirmText: "OK" });
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const columns = ["No", "Jenis Dzikir", "Hitungan", "Target", "Tanggal"];
    const rows = dzikirHistory.map((session, index) => [ index + 1, session.type, session.count, session.target || "∞", session.date ]);
    doc.autoTable({ head: [columns], body: rows, startY: 20, });
    doc.save("riwayat_dzikir.pdf");
  });

  function updateHistoryList() { /* ... */ }

  updateDisplay();
  updateHistoryList();
  updateButtonsState();

  document.addEventListener('copy', e => e.preventDefault());
  document.addEventListener('contextmenu', e => e.preventDefault());

  document.addEventListener('keydown', function(event) {
    if (event.key === ' ' || event.key === 'ArrowUp') {
      if (!countButton.classList.contains("btn-disabled")) {
        countButton.click();
      } else {
        openModal({ message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!", input: false, confirmText: "OK" });
      }
      event.preventDefault();
    } else if (event.key === 'r' || event.key === 'R') {
      if (!resetButton.classList.contains("btn-disabled")) {
        resetButton.click();
      } else {
        openModal({ message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!", input: false, confirmText: "OK" });
      }
    } else if (event.key === 's' || event.key === 'S') {
      if (!saveButton.classList.contains("btn-disabled")) {
        saveButton.click();
      } else {
        openModal({ message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!", input: false, confirmText: "OK" });
      }
    }
  });
});