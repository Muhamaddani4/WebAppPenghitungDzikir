document.addEventListener('DOMContentLoaded', function() {
    // Keamanan: Cek apakah user sudah login
    if (!localStorage.getItem('currentUser')) {
        window.location.href = "login.html";
        return;
    }

    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // GANTI DENGAN ALAMAT EMAIL KAMU
        const yourEmail = "muhamaddani8768@gmail..com"; 
        
        const name = document.getElementById('contact-name').value;
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value;

        // Membuat body email
        const emailBody = `
Pesan dari: ${name}

Isi Pesan:
${message}
        `;

        // Membuat link mailto: yang akan membuka aplikasi email user
        const mailtoLink = `mailto:${yourEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        
        // Buka link di jendela baru
        window.location.href = mailtoLink;
    });
});