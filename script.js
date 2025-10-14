document.addEventListener('DOMContentLoaded', function() {
  // --- Mengecek Role User dan Menampilkan Tombol Admin ---
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // Jika tidak ada user yang login, tendang ke halaman login
  if (!currentUser) {
    window.location.href = "login.html";
    return; // Hentikan eksekusi script selanjutnya
  }

  // Jika user adalah admin, tampilkan tombolnya dan tambahkan event listener
  if (currentUser.role === 'admin') {
    const viewStorageBtn = document.getElementById('view-storage-btn');
    if (viewStorageBtn) {
      viewStorageBtn.style.display = 'inline-block';
      viewStorageBtn.addEventListener('click', viewLocalStorage);
    }
  }

  // --- Fungsi untuk Melihat LocalStorage (KHUSUS ADMIN) ---
  function viewLocalStorage() {
    // Kumpulkan semua data dari localStorage
    const storageData = {
      users: JSON.parse(localStorage.getItem('users')) || [],
      dzikirHistory: JSON.parse(localStorage.getItem('dzikirHistory')) || [],
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
      mode: localStorage.getItem('mode') || 'light'
    };

    // Format data menjadi JSON yang mudah dibaca
    const formattedData = JSON.stringify(storageData, null, 2);

    // Gunakan modal yang sudah ada untuk menampilkan data
    const modal = document.getElementById('modal');
    const modalBody = modal.querySelector('.modal-body');
    const modalFooter = modal.querySelector('.modal-footer');

    // Kosongkan konten modal sebelumnya
    modalBody.innerHTML = '';
    modalFooter.innerHTML = '';

    // Buat elemen <pre> agar format JSON tetap rapi
    const pre = document.createElement('pre');
    pre.style.textAlign = 'left';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.wordBreak = 'break-all';
    pre.textContent = formattedData;
    modalBody.appendChild(pre);

    // Tambahkan tombol tutup
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Tutup';
    closeBtn.classList.add('cancel'); // Pakai style tombol batal
    closeBtn.onclick = () => modal.classList.remove('show');
    modalFooter.appendChild(closeBtn);

    // Tampilkan modal
    modal.classList.add('show');
  }

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

  function openModal(options) {
    const modal = document.getElementById('modal');
    const modalBody = modal.querySelector('.modal-body');
    const modalFooter = modal.querySelector('.modal-footer');
    modalBody.innerHTML = "";
    modalFooter.innerHTML = "";
    if (options.message) {
      const p = document.createElement('p');
      p.textContent = options.message;
      modalBody.appendChild(p);
    }
    let inputElem = null;
    if (options.input) {
      inputElem = document.createElement('input');
      inputElem.type = "text";
      inputElem.value = options.defaultValue || "";
      modalBody.appendChild(inputElem);
    }
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = options.confirmText || "Simpan";
    confirmBtn.classList.add('confirm');
    confirmBtn.addEventListener('click', function() {
      modal.classList.remove('show');
      if (options.onConfirm) {
        options.onConfirm(inputElem ? inputElem.value : null);
      }
    });
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = options.cancelText || "Batal";
    cancelBtn.classList.add('cancel');
    cancelBtn.addEventListener('click', function() {
      modal.classList.remove('show');
      if (options.onCancel) options.onCancel();
    });
    modalFooter.appendChild(confirmBtn);
    modalFooter.appendChild(cancelBtn);
    modal.classList.add('show');
  }
  window.openModal = openModal;

  // --- Elemen UI dan Variabel State ---
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
      message: "Masukkan teks dzikir baru:",
      input: true,
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
      message: "Edit teks dzikir:",
      input: true,
      defaultValue: currentText,
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
      message: "Anda yakin ingin menghapus dzikir ini?",
      input: false,
      confirmText: "Hapus",
      onConfirm: function() {
        dzikirTypeSelect.remove(selectedIndex);
        dzikirTypeSelect.selectedIndex = 0;
        dzikirDisplay.textContent = dzikirTypeSelect.options[0].text;
        showNotification("Dzikir berhasil dihapus!", "#27ae60");
        updateButtonsState();
      }
    });
  });

  // Event listener untuk tombol hapus semua riwayat
  clearHistoryBtn.addEventListener('click', function() {
    if (confirm('Anda yakin ingin menghapus seluruh riwayat dzikir?')) {
      dzikirHistory = [];
      localStorage.removeItem('dzikirHistory');
      showNotification("Hapus semua riwayat☑️");
      // Panggil fungsi untuk memperbarui tampilan riwayat jika ada
      if (typeof updateHistoryDisplay === "function") {
        updateHistoryDisplay();
      }
    }
  });

  countButton.addEventListener('click', function() {
    if (this.classList.contains("btn-disabled")) {
      openModal({
        message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!",
        input: false,
        confirmText: "OK"
      });
      return;
    }
    if (targetCount > 0 && count >= targetCount) {
      showNotification(`Anda telah mencapai target ${targetCount} kali. Silakan reset untuk memulai lagi.`, "#f39c12");
      return;
    }
    count++;
    counterDisplay.classList.add('counter-animation');
    setTimeout(() => {
      counterDisplay.classList.remove('counter-animation');
    }, 500);
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
        setTimeout(() => {
          createParticles(Math.random() * containerRect.width, Math.random() * containerRect.height, 10,
            ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6']);
        }, i * 200);
      }
    }
  });

  resetButton.addEventListener('click', function() {
    if (this.classList.contains("btn-disabled")) {
      openModal({
        message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!",
        input: false,
        confirmText: "OK"
      });
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


  // Tombol Simpan Sesi
  saveButton.addEventListener('click', function() {
    if (this.classList.contains("btn-disabled")) {
      openModal({
        message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!",
        input: false,
        confirmText: "OK"
      });
      return;
    }

    const loadingOverlay = document.getElementById('loading');
    // Tampilkan overlay loading
    loadingOverlay.style.display = 'flex';

    // Simulasikan proses penyimpanan selama 2 detik
    setTimeout(() => {
      try {
        // Lakukan penyimpanan sesi
        const dzikirText = dzikirDisplay.textContent;
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}`;
        const session = {
          id: Date.now(),
          type: dzikirText,
          count: count,
          target: targetCount,
          date: formattedDate
        };
        dzikirHistory.unshift(session);
        localStorage.setItem('dzikirHistory', JSON.stringify(dzikirHistory));

        // Pastikan fungsi updateHistoryList() telah didefinisikan
        if (typeof updateHistoryList === "function") {
          updateHistoryList();
        }

        addRippleEffect(saveButton);

        // Tampilkan notifikasi setelah proses penyimpanan selesai
        showNotification("Berhasil Simpan sesi Dzikir", "#2ecc71");

      } catch (error) {
        console.error("Error saat menyimpan sesi:", error);
        showNotification("Terjadi error saat menyimpan sesi", "#e74c3c");
      } finally {
        // Pastikan overlay loading disembunyikan
        loadingOverlay.style.display = 'none';
      }
    }, 2000);
  });

  exportPdfBtn.addEventListener('click', function() {
    if (dzikirHistory.length === 0) {
      openModal({
        message: "Tidak ada data riwayat untuk diekspor!",
        input: false,
        confirmText: "OK"
      });
      return;
    }
    const {
      jsPDF
    } = window.jspdf;
    const doc = new jsPDF();
    // Tambahkan kolom "No" di awal
    const columns = ["No", "Jenis Dzikir", "Hitungan", "Target", "Tanggal"];
    // Sertakan nomor urut di setiap baris
    const rows = dzikirHistory.map((session, index) => [
      index + 1,
      session.type,
      session.count,
      session.target || "∞",
      session.date
    ]);
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 20,
    });
    doc.save("riwayat_dzikir.pdf");
  });

  // Fungsi updateHistoryList yang mungkin belum ada
  function updateHistoryList() {
    // Fungsi ini dikosongkan karena tidak ada elemen 'history-list' di index.html
    // Jika ada, logikanya akan ditaruh di sini.
  }

  updateDisplay();
  updateHistoryList();
  updateButtonsState();

  document.addEventListener('copy', function(e) {
    e.preventDefault();
  });
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === ' ' || event.key === 'ArrowUp') {
      if (!countButton.classList.contains("btn-disabled")) {
        countButton.click();
      } else {
        openModal({
          message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!",
          input: false,
          confirmText: "OK"
        });
      }
      event.preventDefault();
    } else if (event.key === 'r' || event.key === 'R') {
      if (!resetButton.classList.contains("btn-disabled")) {
        resetButton.click();
      } else {
        openModal({
          message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!",
          input: false,
          confirmText: "OK"
        });
      }
    } else if (event.key === 's' || event.key === 'S') {
      if (!saveButton.classList.contains("btn-disabled")) {
        saveButton.click();
      } else {
        openModal({
          message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!",
          input: false,
          confirmText: "OK"
        });
      }
    }
  });
});