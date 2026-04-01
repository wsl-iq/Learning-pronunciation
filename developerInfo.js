const developerInfoBtn = document.getElementById('developerInfoBtn');
const developerModal = document.getElementById('developerInfo');
const closeBtn = developerModal.querySelector('.modal-close');

// فتح النافذة
developerInfoBtn.addEventListener('click', () => {
    developerModal.style.display = 'block';
});

// إغلاق بزر X
closeBtn.addEventListener('click', () => {
    developerModal.style.display = 'none';
});

// إغلاق عند الضغط خارج النافذة
window.addEventListener('click', (e) => {
    if (e.target === developerModal) {
        developerModal.style.display = 'none';
    }
});