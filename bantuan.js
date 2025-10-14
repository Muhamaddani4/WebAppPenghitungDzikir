document.addEventListener('DOMContentLoaded', function() {
    // Keamanan: Cek apakah user sudah login
    if (!localStorage.getItem('currentUser')) {
        window.location.href = "login.html";
        return;
    }

    // --- PENGATURAN EMAILJS: GANTI DENGAN KUNCI ANDA ---
    // Pastikan kamu sudah mengisi semua kunci dari akun EmailJS-mu
    const EMAILJS_PUBLIC_KEY = "Tw7sl_LV4OeiEicKp";
    const EMAILJS_SERVICE_ID = "service_o1ce0f6";
    const EMAILJS_TEMPLATE_ID = "template_y185231";

    // Inisialisasi EmailJS dengan Public Key Anda
    // Cek dulu apakah library emailjs sudah ada
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    } else {
        console.error("EmailJS SDK tidak ditemukan. Pastikan sudah di-load di bantuan.html");
    }

    const contactForm = document.getElementById('contact-form');
    const submitButton = document.getElementById('submit-button'); // Pastikan ID ini ada di HTML
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Ubah teks tombol dan nonaktifkan
            submitButton.textContent = 'Mengirim...';
            submitButton.disabled = true;

            // Siapkan parameter agar cocok dengan template baru di EmailJS
            const templateParams = {
                from_name: document.getElementById('contact-name').value,
                subject: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value,
            };
            
            // Kirim email menggunakan EmailJS
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    alert('Pesan berhasil terkirim! Terima kasih.');
                    contactForm.reset(); // Kosongkan form
                }, function(error) {
                    console.log('FAILED...', error);
                    alert('Maaf, terjadi kesalahan. Pastikan kunci EmailJS sudah benar dan coba lagi.');
                })
                .finally(function() {
                    // Kembalikan tombol ke keadaan semula
                    submitButton.textContent = 'Kirim Pesan';
                    submitButton.disabled = false;
                });
        });
    }
});