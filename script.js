document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS
    AOS.init({
        once: true,
        offset: 50,
    });

    const btnOpen = document.getElementById('btn-open');
    const coverPage = document.getElementById('cover-page');
    const mainContent = document.getElementById('main-content');
    const btnMusic = document.getElementById('btn-music');
    const bgMusic = document.getElementById('bg-music');
    const musicIcon = btnMusic.querySelector('i');

    let isPlaying = false;

    // Dynamic Guest Name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to') || urlParams.get('kepada');
    if (guestName) {
        document.getElementById('guest-name').innerText = guestName;
        // Optionally set the input form name automatically
        document.getElementById('name').value = guestName;
    }

    // Open Invitation
    btnOpen.addEventListener('click', () => {
        coverPage.classList.add('slide-up');
        document.body.classList.remove('locked-scroll');
        
        setTimeout(() => {
            mainContent.classList.remove('hidden');
            coverPage.style.display = 'none';
            btnMusic.classList.remove('hidden');
            
            // Re-trigger AOS
            AOS.refresh();
        }, 1000); 
    });

    // Music Control
    btnMusic.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicIcon.classList.remove('spin');
        } else {
            bgMusic.play();
            musicIcon.classList.add('spin');
        }
        isPlaying = !isPlaying;
    });

    // Countdown Timer targeting Resepsi (21 Juni 2026, 08:00 WITA = 00:00 UTC)
    // WITA is UTC+8, so 08:00 WITA = 00:00 UTC
    const targetDate = new Date("Jun 21, 2026 08:00:00 GMT+0800").getTime();

    const updateCountdown = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(updateCountdown);
            document.getElementById("days").innerText = "00";
            document.getElementById("hours").innerText = "00";
            document.getElementById("minutes").innerText = "00";
            document.getElementById("seconds").innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = days.toString().padStart(2, '0');
        document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
    }, 1000);

    // Copy to Clipboard
    const copyBtns = document.querySelectorAll('.btn-copy');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const rek = btn.getAttribute('data-rek');
            navigator.clipboard.writeText(rek).then(() => {
                const originalText = btn.innerHTML;
                btn.innerHTML = `<i class="fas fa-check"></i> Tersalin!`;
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            });
        });
    });

    // Mock RSVP Submission
    const rsvpForm = document.getElementById('rsvp-form');
    const wishesList = document.getElementById('wishes-list');

    addWish('Rina & Keluarga', 'Hadir', 'Selamat menempuh hidup baru Anisa & Surya! Semoga samawa.');

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const message = document.getElementById('message').value;
        const attendance = document.getElementById('attendance').value;

        addWish(name, attendance, message);
        rsvpForm.reset();
        alert('Terima kasih! Ucapan Anda telah terkirim.');
    });

    function addWish(name, attendance, message) {
        const wishHtml = `
            <div class="wish-item" data-aos="fade-up">
                <p class="wish-name">${name}</p>
                <p class="wish-attendance"><i class="fas fa-check-circle"></i> ${attendance}</p>
                <p class="wish-text">"${message}"</p>
            </div>
        `;
        wishesList.insertAdjacentHTML('afterbegin', wishHtml);
    }
});
