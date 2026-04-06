self.onmessage = function(e) {
    let result = heavyCalculation(e.data);
    self.postMessage(result);
};

const worker = new Worker('worker.js');
worker.postMessage(data);
worker.onmessage = (e) => {
    console.log('نتيجة:', e.data);
};