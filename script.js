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

    // RSVP & Wishes logic with Google Sheets
    const rsvpForm = document.getElementById('rsvp-form');
    const wishesList = document.getElementById('wishes-list');
    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbziMiqwoPIM_eXMRYdgTQpWYuqu-iACV1Sef-Z2nYOSUYRKRvGp5cUbOEvwcxN9JPfBYw/exec';

    function loadWishes() {
        wishesList.innerHTML = '<p style="color:#fff; text-align:center;">Memuat ucapan...</p>';
        fetch(SCRIPT_URL)
            .then(res => res.json())
            .then(data => {
                wishesList.innerHTML = '';
                if(data.length === 0) {
                    wishesList.innerHTML = '<p style="color:#aaa; text-align:center;">Belum ada ucapan. Jadilah yang pertama!</p>';
                } else {
                    data.forEach(row => {
                        if(row.Name && row.Message) {
                            addWishToDOM(row.Name, row.Attendance, row.Message);
                        }
                    });
                }
            })
            .catch(err => {
                wishesList.innerHTML = '<p style="color:#ff6b6b; text-align:center;">Gagal memuat ucapan.</p>';
            });
    }

    loadWishes();

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitBtn.innerText = 'Mengirim...';
        submitBtn.disabled = true;

        const name = document.getElementById('name').value;
        const message = document.getElementById('message').value;
        const attendance = document.getElementById('attendance').value;

        const payload = {
            name: name,
            attendance: attendance,
            message: message
        };

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            }
        })
        .then(res => res.json())
        .then(data => {
            submitBtn.innerText = 'Kirim Ucapan';
            submitBtn.disabled = false;
            
            if(data.result === 'success') {
                addWishToDOM(name, attendance, message);
                rsvpForm.reset();
                alert('Terima kasih! Ucapan Anda telah berhasil dikirim.');
            } else {
                alert('Terjadi kesalahan. Silakan coba lagi.');
            }
        })
        .catch(err => {
            submitBtn.innerText = 'Kirim Ucapan';
            submitBtn.disabled = false;
            alert('Gagal mengirim. Pastikan koneksi internet lancar.');
        });
    });

    function addWishToDOM(name, attendance, message) {
        if(wishesList.querySelector('p')) {
            const p = wishesList.querySelector('p');
            if(p.innerText.includes('Belum ada ucapan')) p.remove();
        }

        const icon = attendance === 'Hadir' ? 'fa-check-circle' : 'fa-times-circle';
        
        const wishHtml = `
            <div class="wish-item" data-aos="fade-up">
                <p class="wish-name">${name}</p>
                <p class="wish-attendance"><i class="fas ${icon}"></i> ${attendance}</p>
                <p class="wish-text">"${message}"</p>
            </div>
        `;
        wishesList.insertAdjacentHTML('afterbegin', wishHtml);
    }
});
