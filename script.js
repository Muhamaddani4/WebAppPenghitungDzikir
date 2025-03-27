document.querySelectorAll('nav ul li a').forEach(function(link) {
  link.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
  link.addEventListener('mousedown', function(e) {
    if (e.button === 2) { // Tombol kanan mouse
      e.preventDefault();
    }
  });
});

const modeToggle = document.getElementById('modeToggle');
const modeIcon = document.getElementById('modeIcon');
const currentMode = localStorage.getItem('mode') || 'light';

// Fungsi untuk memperbarui ikon dengan animasi
function updateIcon() {
  if (document.body.classList.contains('dark-mode')) {
    modeIcon.src = 'moon.png'; // Gambar ikon matahari untuk mode terang
  } else {
    modeIcon.src = 'sun.png'; // Gambar ikon bulan untuk mode gelap
  }
  // Tambahkan animasi rotasi
  modeIcon.classList.add('rotate');
  setTimeout(() => {
    modeIcon.classList.remove('rotate');
  }, 500); // Waktu animasi sesuai dengan CSS transition
}

// Set mode awal dari localStorage
if (currentMode === 'dark') {
  document.body.classList.add('dark-mode');
}
updateIcon();

// Event listener untuk toggle mode
modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('mode', 'dark');
  } else {
    localStorage.setItem('mode', 'light');
  }
  updateIcon();
});

    // Modal Logout functions
    function openLogoutModal() {
      document.getElementById('logoutModal').style.display = 'flex';
    }
    function closeLogoutModal() {
      document.getElementById('logoutModal').style.display = 'none';
    }
    function logout() {
      // Hapus data login jika diperlukan, lalu redirect
      localStorage.removeItem('currentUser');
      window.location.href = "logout.html"; // atau proses logout lainnya
    }
    
     // Cek apakah pengguna sudah login; jika tidak, alihkan ke login.html
    if(!localStorage.getItem('currentUser')){
      window.location.href = "login.html";
    }
    
    // Fungsi modal untuk aksi dengan animasi
    function openModal(options) {
      const modal = document.getElementById('modal');
      const modalBody = modal.querySelector('.modal-body');
      const modalFooter = modal.querySelector('.modal-footer');
      modalBody.innerHTML = "";
      modalFooter.innerHTML = "";
      if(options.message) {
        const p = document.createElement('p');
        p.textContent = options.message;
        modalBody.appendChild(p);
      }
      let inputElem = null;
      if(options.input) {
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
        if(options.onConfirm) {
          options.onConfirm(inputElem ? inputElem.value : null);
        }
      });
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = options.cancelText || "Batal";
      cancelBtn.classList.add('cancel');
      cancelBtn.addEventListener('click', function() {
        modal.classList.remove('show');
        if(options.onCancel) options.onCancel();
      });
      modalFooter.appendChild(confirmBtn);
      modalFooter.appendChild(cancelBtn);
      modal.classList.add('show');
    }

    // Elemen UI
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
    const logoutBtn = document.getElementById('logout-btn');

    // Variabel state
    let count = 0;
    let targetCount = 0;
    let dzikirHistory = JSON.parse(localStorage.getItem('dzikirHistory')) || [];

    // Fungsi notifikasi
    function showNotification(message, color) {
      notification.textContent = message;
      notification.style.backgroundColor = color || '#2ecc71';
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }

    // Fungsi partikel
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
        setTimeout(() => { particle.remove(); }, (animDuration + animDelay) * 1000);
      }
    }

    // Fungsi ripple
    function addRippleEffect(button) {
      button.classList.add('clicked');
      setTimeout(() => { button.classList.remove('clicked'); }, 700);
    }

    // Fungsi update tampilan hitungan
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

    // Fungsi update status tombol (menambahkan/menghapus kelas btn-disabled)
    function updateButtonsState() {
      const isDzikirSelected = (dzikirTypeSelect.value && dzikirTypeSelect.value !== "ListDzikir");
      const targetValid = (parseInt(targetCountInput.value) > 0);
      if(isDzikirSelected && targetValid) {
        countButton.classList.remove("btn-disabled");
        resetButton.classList.remove("btn-disabled");
        saveButton.classList.remove("btn-disabled");
      } else {
        countButton.classList.add("btn-disabled");
        resetButton.classList.add("btn-disabled");
        saveButton.classList.add("btn-disabled");
      }
    }

    // Reset count dan target jika pengguna mengubah dropdown
    dzikirTypeSelect.addEventListener('change', function() {
      dzikirDisplay.textContent = this.options[this.selectedIndex].text;
      count = 0;
      targetCount = 0;
      targetCountInput.value = "";
      updateDisplay();
      updateButtonsState();
    });

    // Reset count saat target berubah
    targetCountInput.addEventListener('input', function() {
      targetCount = parseInt(this.value) || 0;
      count = 0;
      targetDisplay.textContent = targetCount;
      updateDisplay();
      updateButtonsState();
    });

    // Tombol Tambah Dzikir
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

    // Tombol Edit Dzikir
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

    // Tombol Hapus Dzikir
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

    // Tombol Hapus Riwayat Dzikir
    clearHistoryBtn.addEventListener('click', function() {
      openModal({
        message: "Anda yakin ingin menghapus seluruh riwayat dzikir?",
        input: false,
        confirmText: "Hapus Riwayat",
        onConfirm: function() {
          dzikirHistory = [];
          localStorage.removeItem('dzikirHistory');
          updateHistoryList();
          showNotification("Riwayat dzikir berhasil dihapus!", "#27ae60");
        }
      });
    });

    // Tombol Hitung (+1)
    countButton.addEventListener('click', function() {
      if(this.classList.contains("btn-disabled")) {
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
          setTimeout(() => {
            createParticles(Math.random() * containerRect.width, Math.random() * containerRect.height, 10,
              ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6']);
          }, i * 200);
        }
      }
    });

    // Tombol Reset
    resetButton.addEventListener('click', function() {
      if(this.classList.contains("btn-disabled")) {
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
      if(this.classList.contains("btn-disabled")) {
        openModal({
          message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!",
          input: false,
          confirmText: "OK"
        });
        return;
      }
      const dzikirText = dzikirDisplay.textContent;
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth()+1}-${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}`;
      const session = {
        id: Date.now(),
        type: dzikirText,
        count: count,
        target: targetCount,
        date: formattedDate
      };
      dzikirHistory.unshift(session);
      localStorage.setItem('dzikirHistory', JSON.stringify(dzikirHistory));
      updateHistoryList();
      addRippleEffect(saveButton);
      const buttonRect = saveButton.getBoundingClientRect();
      const containerRect = document.querySelector('.container').getBoundingClientRect();
      const x = buttonRect.left + buttonRect.width / 2 - containerRect.left;
      const y = buttonRect.top + buttonRect.height / 2 - containerRect.top;
      createParticles(x, y, 12, ['#2ecc71', '#27ae60', '#82E0AA']);
      showNotification(`Sesi dzikir ${dzikirDisplay.textContent} berhasil disimpan!`, "#2ecc71");
    });

    // Tombol Export ke PDF
    exportPdfBtn.addEventListener('click', function() {
      if(dzikirHistory.length === 0) {
        openModal({
          message: "Tidak ada data riwayat untuk diekspor!",
          input: false,
          confirmText: "OK"
        });
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const columns = ["Jenis Dzikir", "Hitungan", "Target", "Tanggal"];
      const rows = dzikirHistory.map(session => [
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

    // Tombol Logout
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('currentUser');
      window.location.href = "login.html";
    });

    // Fungsi update riwayat dzikir
    function updateHistoryList() {
      historyList.innerHTML = '';
      dzikirHistory.slice(0, 10).forEach(session => {
        const historyItem = document.createElement('li');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `<div>${session.type} - ${session.count}/${session.target || '∞'}</div>
                                 <div>${session.date}</div>`;
        historyList.appendChild(historyItem);
      });
    }

    updateDisplay();
    updateHistoryList();
    updateButtonsState();

    // Menonaktifkan copy dan context menu agar teks tidak bisa disalin
    document.addEventListener('copy', function(e) {
      e.preventDefault();
    });
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });

    // Dukungan keyboard
    document.addEventListener('keydown', function(event) {
      if (event.key === ' ' || event.key === 'ArrowUp') {
        if(!countButton.classList.contains("btn-disabled")){
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
        if(!resetButton.classList.contains("btn-disabled")){
          resetButton.click();
        } else {
          openModal({
            message: "Silakan pilih jenis dzikir dan isi target jumlah terlebih dahulu!",
            input: false,
            confirmText: "OK"
          });
        }
      } else if (event.key === 's' || event.key === 'S') {
        if(!saveButton.classList.contains("btn-disabled")){
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