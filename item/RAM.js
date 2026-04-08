let cache = new WeakMap();
function expensiveComputation(input) {
    if (cache.has(input)) {
        console.log('Cache hit');
        return cache.get(input);
    }
element.removeEventListener('click', handler);

function animate() {
    requestAnimationFrame(animate);

}
    console.log('Performing expensive computation');
    let result = 0;
    for (let i = 0; i < 1e6; i++) {
        result += Math.sqrt(i + input);
    }
    cache.set(input, result);
    return result;
}