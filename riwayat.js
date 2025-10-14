document.addEventListener('DOMContentLoaded', function() {
  // Keamanan: Cek apakah user sudah login, jika belum, tendang ke halaman login
  if (!localStorage.getItem('currentUser')) {
    window.location.href = "login.html";
    return;
  }

  // Ambil elemen dari halaman
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  const emptyMessage = document.getElementById('empty-history-message');
  const historyControls = document.querySelector('.history-controls');

  // Ambil data riwayat dari localStorage
  let dzikirHistory = JSON.parse(localStorage.getItem('dzikirHistory')) || [];

  // Fungsi utama untuk menampilkan riwayat
  function renderHistory() {
    // Kosongkan daftar sebelum mengisi ulang
    historyList.innerHTML = '';

    // Cek apakah ada riwayat
    if (dzikirHistory.length === 0) {
      emptyMessage.style.display = 'block'; // Tampilkan pesan kosong
      historyControls.style.display = 'none'; // Sembunyikan tombol
    } else {
      emptyMessage.style.display = 'none'; // Sembunyikan pesan kosong
      historyControls.style.display = 'flex'; // Tampilkan tombol

      // Loop melalui setiap sesi dzikir dan buat elemen HTML-nya
      dzikirHistory.forEach(session => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        item.innerHTML = `
          <div class="history-item-details">
            <span class="dzikir-type">${session.type}</span>
            <span class="dzikir-stats">Jumlah: ${session.count} dari ${session.target || '∞'}</span>
            <span class="dzikir-date">Tanggal: ${session.date}</span>
          </div>
          <button class="btn btn-danger btn-small delete-btn" data-id="${session.id}">Hapus</button>
        `;
        historyList.appendChild(item);
      });
    }
  }

  // Event listener untuk menghapus satu item riwayat
  historyList.addEventListener('click', function(event) {
    const deleteButton = event.target.closest('.delete-btn');
    if (deleteButton) {
      const sessionId = parseInt(deleteButton.getAttribute('data-id'));
      // Konfirmasi sebelum menghapus
      if (confirm('Anda yakin ingin menghapus riwayat ini?')) {
        dzikirHistory = dzikirHistory.filter(session => session.id !== sessionId);
        localStorage.setItem('dzikirHistory', JSON.stringify(dzikirHistory));
        renderHistory(); // Perbarui tampilan
      }
    }
  });

  // Event listener untuk tombol "Hapus Semua Riwayat"
  clearHistoryBtn.addEventListener('click', function() {
    if (confirm('ANDA YAKIN INGIN MENGHAPUS SELURUH RIWAYAT DZIKIR?\nTindakan ini tidak bisa dibatalkan.')) {
      dzikirHistory = [];
      localStorage.removeItem('dzikirHistory');
      renderHistory(); // Perbarui tampilan
    }
  });

  // Event listener untuk tombol "Export ke PDF"
  exportPdfBtn.addEventListener('click', function() {
    if (dzikirHistory.length === 0) {
      alert("Tidak ada data riwayat untuk diekspor!");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const columns = ["No", "Jenis Dzikir", "Hitungan", "Target", "Tanggal"];
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
  
  // Panggil fungsi render untuk pertama kali saat halaman dimuat
  renderHistory();
});