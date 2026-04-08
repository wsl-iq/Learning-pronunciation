self.onmessage = function(e) {
    let result = heavyCalculation(e.data);
    self.postMessage(result);
};
const worker = new Worker('worker.js');
worker.postMessage(data);
worker.onmessage = (e) => {
    console.log('Result:', e.data);
};
function heavyCalculation(input) {
    let result = 0;
    for (let i = 0; i < 1e9; i++) {
        result += Math.sqrt(i + input);
    }
    return result;
}