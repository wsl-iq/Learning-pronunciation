for(let i = 0; i < 100; i++) {
    element.style.left = i + 'px';
}

element.style.transform = 'translateX(100px)';
window.addEventListener('scroll', _.throttle(() => {
}, 100));