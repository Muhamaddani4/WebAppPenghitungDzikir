document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('currentUser')) {
        window.location.href = "login.html";
        return;
    }

    // --- PENGATURAN EMAILJS: PASTIKAN INI SUDAH BENAR ---
    const EMAILJS_PUBLIC_KEY = "Z1VSwVF-QYVQAtt35";
    const EMAILJS_SERVICE_ID = "service_638wwob";
    const EMAILJS_TEMPLATE_ID = "template_nsnzq3x";

    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    } else {
        console.error("SDK EmailJS tidak ditemukan. Pastikan koneksi internet aktif dan script di bantuan.html sudah benar.");
        alert("Gagal memuat layanan pengiriman pesan. Periksa koneksi internet Anda.");
        return;
    }

    const contactForm = document.getElementById('contact-form');
    const submitButton = document.getElementById('submit-button');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            submitButton.textContent = 'Mengirim...';
            submitButton.disabled = true;

            const templateParams = {
                from_name: document.getElementById('contact-name').value,
                subject: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value,
            };
            
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    alert('Pesan berhasil terkirim! Terima kasih.');
                    contactForm.reset();
                }, function(error) {
                    console.log('FAILED...', error);
                    // Pesan error yang lebih detail
                    alert(`Maaf, terjadi kesalahan.\n\nError: ${JSON.stringify(error)}`);
                })
                .finally(function() {
                    submitButton.textContent = 'Kirim Pesan';
                    submitButton.disabled = false;
                });
        });
    }
});