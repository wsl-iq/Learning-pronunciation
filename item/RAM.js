let cache = new WeakMap();
element.removeEventListener('click', handler);
function animate() {
    requestAnimationFrame(animate);
}