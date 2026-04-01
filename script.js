// ========================================
// IPA Trainer - Full Application with Font Awesome Icons & Responsive Design
// ========================================

class IPATrainer {
    constructor() {
        // DOM Elements
        this.wordInput = document.getElementById('wordInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultCard = document.getElementById('resultCard');
        this.wordDisplay = document.getElementById('wordDisplay');
        this.ipaDisplay = document.getElementById('ipaDisplay');
        this.playSoundBtn = document.getElementById('playSoundBtn');
        this.recordBtn = document.getElementById('recordBtn');
        this.startSymbol = document.getElementById('startSymbol');
        this.middleSymbol = document.getElementById('middleSymbol');
        this.endSymbol = document.getElementById('endSymbol');
        this.symbolsGrid = document.getElementById('symbolsGrid');
        
        // Data
        this.ipaData = null;
        this.currentWord = '';
        this.currentIPA = '';
        this.userHistory = this.loadHistory();
        this.quizQuestions = [];
        this.currentQuiz = null;
        this.trainingQuestions = [];
        this.currentTraining = 0;
        this.trainingScore = 0;
        this.screenManager = null;
        
        // Initialize
        this.init();
    }
    
    async init() {
        await this.loadIPAData();
        this.setupEventListeners();
        this.loadSuggestions();
        this.updateUI();
        this.setupSpeechRecognition();
        this.checkBrowserSupport();
        this.initScreenManager();
    }
    
    initScreenManager() {
        // Wait for screen manager if it exists
        if (window.screenManager) {
            this.screenManager = window.screenManager;
            this.setupResponsiveListeners();
        } else {
            // Create a simple fallback
            this.setupSimpleResponsive();
        }
    }
    
    setupResponsiveListeners() {
        // Listen to device changes
        window.addEventListener('deviceChange', (e) => {
            this.adjustForDevice(e.detail.device.type);
        });
        
        // Listen to orientation changes
        window.addEventListener('orientationChange', (e) => {
            this.adjustForOrientation(e.detail.newOrientation);
        });
    }
    
    setupSimpleResponsive() {
        // Simple resize handler as fallback
        const handleResize = () => {
            const width = window.innerWidth;
            if (width <= 768) {
                document.body.classList.add('device-mobile');
                document.body.classList.remove('device-desktop');
            } else {
                document.body.classList.add('device-desktop');
                document.body.classList.remove('device-mobile');
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
    }
    
    adjustForDevice(deviceType) {
        switch(deviceType) {
            case 'mobile':
                this.enableMobileMode();
                break;
            case 'tablet':
                this.enableTabletMode();
                break;
            default:
                this.enableDesktopMode();
        }
    }
    
    adjustForOrientation(orientation) {
        if (orientation === 'landscape' && window.innerWidth <= 768) {
            document.body.classList.add('landscape-mobile');
            const resultCard = document.querySelector('.result-card');
            if (resultCard) {
                resultCard.style.maxHeight = '60vh';
                resultCard.style.overflowY = 'auto';
            }
        } else {
            document.body.classList.remove('landscape-mobile');
            const resultCard = document.querySelector('.result-card');
            if (resultCard) {
                resultCard.style.maxHeight = 'none';
                resultCard.style.overflowY = 'visible';
            }
        }
    }
    
    enableMobileMode() {
        // Adjust touch targets
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.minHeight = '44px';
        });
        
        // Adjust font sizes
        document.body.style.fontSize = '14px';
        
        // Stack breakdown cards vertically
        const breakdownContainer = document.querySelector('.breakdown-container');
        if (breakdownContainer) {
            breakdownContainer.style.flexDirection = 'column';
            breakdownContainer.style.gap = '15px';
        }
        
        // Hide arrows on mobile
        const arrows = document.querySelectorAll('.breakdown-arrow');
        arrows.forEach(arrow => {
            arrow.style.display = 'none';
        });
        
        // Make tabs scrollable horizontally
        const tabsHeader = document.querySelector('.tabs-header');
        if (tabsHeader) {
            tabsHeader.style.overflowX = 'auto';
            tabsHeader.style.flexWrap = 'nowrap';
            tabsHeader.style.WebkitOverflowScrolling = 'touch';
        }
    }
    
    enableTabletMode() {
        document.body.style.fontSize = '15px';
        
        const breakdownContainer = document.querySelector('.breakdown-container');
        if (breakdownContainer) {
            breakdownContainer.style.flexDirection = 'row';
            breakdownContainer.style.gap = '10px';
        }
        
        const arrows = document.querySelectorAll('.breakdown-arrow');
        arrows.forEach(arrow => {
            arrow.style.display = 'block';
        });
    }
    
    enableDesktopMode() {
        document.body.style.fontSize = '16px';
        
        const breakdownContainer = document.querySelector('.breakdown-container');
        if (breakdownContainer) {
            breakdownContainer.style.flexDirection = 'row';
            breakdownContainer.style.gap = '20px';
        }
        
        const arrows = document.querySelectorAll('.breakdown-arrow');
        arrows.forEach(arrow => {
            arrow.style.display = 'block';
        });
        
        const tabsHeader = document.querySelector('.tabs-header');
        if (tabsHeader) {
            tabsHeader.style.overflowX = 'visible';
            tabsHeader.style.flexWrap = 'wrap';
        }
    }
    
    async loadIPAData() {
        try {
            const response = await fetch('data/ipa.json');
            this.ipaData = await response.json();
            this.loadDictionary();
        } catch (error) {
            console.error('Error loading IPA data:', error);
            this.useFallbackData();
        }
    }
    
    useFallbackData() {
        this.ipaData = {
            vowels: [
                { symbol: 'iː', description: 'صوت طويل مثل see', examples: ['see', 'bee'], type: 'vowel' },
                { symbol: 'ɪ', description: 'صوت قصير مثل sit', examples: ['sit', 'big'], type: 'vowel' },
                { symbol: 'æ', description: 'صوت مثل cat', examples: ['cat', 'hat'], type: 'vowel' }
            ],
            consonants: [
                { symbol: 'θ', description: 'صوت بين الأسنان مثل think', examples: ['think', 'three'], type: 'consonant' },
                { symbol: 'ð', description: 'صوت مجهور مثل this', examples: ['this', 'mother'], type: 'consonant' },
                { symbol: 'ʃ', description: 'صوت ش مثل she', examples: ['she', 'fish'], type: 'consonant' }
            ],
            diphthongs: [
                { symbol: 'eɪ', description: 'صوت مزدوج مثل say', examples: ['say', 'day'], type: 'diphthong' }
            ]
        };
    }
    
    setupEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchWord());
        this.wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWord();
        });
        this.playSoundBtn?.addEventListener('click', () => this.playPronunciation());
        this.recordBtn?.addEventListener('click', () => this.openRecordModal());
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Dictionary filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.filterDictionary(btn.dataset.filter));
        });
        
        // Reset history
        const resetBtn = document.getElementById('resetHistory');
        resetBtn?.addEventListener('click', () => this.resetHistory());
        
        // Start quiz
        const startQuizBtn = document.getElementById('startQuiz');
        startQuizBtn?.addEventListener('click', () => this.startQuiz());
        
        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.closest('.modal')));
        });
    }
    
    async searchWord() {
        const word = this.wordInput.value.trim().toLowerCase();
        if (!word) {
            this.showNotification('الرجاء إدخال كلمة', 'warning');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const ipa = await this.fetchIPA(word);
            if (ipa) {
                this.currentWord = word;
                this.currentIPA = ipa;
                this.displayResult(word, ipa);
                this.saveToHistory(word, ipa);
                this.updateUI();
                this.showNotification('تم العثور على الكلمة!', 'success');
            } else {
                this.showNotification('لم يتم العثور على الكلمة', 'error');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('حدث خطأ في البحث', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async fetchIPA(word) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (response.ok) {
                const data = await response.json();
                const phonetic = data[0]?.phonetics.find(p => p.text)?.text;
                if (phonetic) return phonetic;
            }
        } catch (error) {
            console.log('API failed, using local data');
        }
        
        return this.getLocalIPA(word);
    }
    
    getLocalIPA(word) {
        const localWords = {
            'think': '/θɪŋk/',
            'this': '/ðɪs/',
            'cat': '/kæt/',
            'dog': '/dɒɡ/',
            'fish': '/fɪʃ/',
            'house': '/haʊs/',
            'beautiful': '/ˈbjuːtɪfəl/',
            'phone': '/fəʊn/'
        };
        return localWords[word] || null;
    }
    
    displayResult(word, ipa) {
        this.resultCard.style.display = 'block';
        this.wordDisplay.textContent = word;
        this.ipaDisplay.textContent = ipa;
        
        const parsed = this.parseIPA(ipa);
        this.startSymbol.textContent = parsed.start || '-';
        this.middleSymbol.textContent = parsed.middle || '-';
        this.endSymbol.textContent = parsed.end || '-';
        
        this.displayExamples(parsed);
        this.displaySymbolsGrid(parsed.symbols);
        
        this.resultCard.scrollIntoView({ behavior: 'smooth' });
    }
    
    parseIPA(ipaString) {
        const cleanIPA = ipaString.replace(/[\/\[\]]/g, '');
        const symbols = cleanIPA.split('');
        
        const processedSymbols = [];
        for (let i = 0; i < symbols.length; i++) {
            if (i < symbols.length - 1 && this.isDiphthong(symbols[i] + symbols[i + 1])) {
                processedSymbols.push(symbols[i] + symbols[i + 1]);
                i++;
            } else {
                processedSymbols.push(symbols[i]);
            }
        }
        
        return {
            full: ipaString,
            clean: cleanIPA,
            symbols: processedSymbols,
            start: processedSymbols[0],
            middle: processedSymbols.slice(1, -1).join(''),
            end: processedSymbols[processedSymbols.length - 1]
        };
    }
    
    isDiphthong(symbol) {
        const diphthongs = ['eɪ', 'aɪ', 'ɔɪ', 'əʊ', 'aʊ', 'ɪə', 'eə', 'ʊə'];
        return diphthongs.includes(symbol);
    }
    
    displayExamples(parsed) {
        const startExample = this.getExampleForSymbol(parsed.start);
        const middleExample = this.getExampleForSymbol(parsed.middle?.[0]);
        const endExample = this.getExampleForSymbol(parsed.end);
        
        const startExampleEl = document.getElementById('startExample');
        const middleExampleEl = document.getElementById('middleExample');
        const endExampleEl = document.getElementById('endExample');
        
        if (startExampleEl) startExampleEl.textContent = startExample ? `مثال: ${startExample}` : '';
        if (middleExampleEl) middleExampleEl.textContent = middleExample ? `مثال: ${middleExample}` : '';
        if (endExampleEl) endExampleEl.textContent = endExample ? `مثال: ${endExample}` : '';
    }
    
    getExampleForSymbol(symbol) {
        if (!symbol) return null;
        
        const vowel = this.ipaData?.vowels?.find(v => v.symbol === symbol);
        if (vowel?.examples?.[0]) return vowel.examples[0];
        
        const consonant = this.ipaData?.consonants?.find(c => c.symbol === symbol);
        if (consonant?.examples?.[0]) return consonant.examples[0];
        
        const diphthong = this.ipaData?.diphthongs?.find(d => d.symbol === symbol);
        if (diphthong?.examples?.[0]) return diphthong.examples[0];
        
        return null;
    }
    
    displaySymbolsGrid(symbols) {
        if (!this.symbolsGrid) return;
        
        this.symbolsGrid.innerHTML = '';
        symbols.forEach(symbol => {
            const card = document.createElement('div');
            card.className = 'symbol-card';
            const type = this.getSymbolType(symbol);
            const typeIcon = type === 'متحرك' ? '<i class="fas fa-vowel-sign"></i>' : 
                            type === 'ساكن' ? '<i class="fas fa-consonant"></i>' : 
                            '<i class="fas fa-link"></i>';
            card.innerHTML = `
                <span>${symbol}</span>
                <small>${typeIcon} ${type}</small>
            `;
            card.addEventListener('click', () => this.showSymbolDetails(symbol));
            this.symbolsGrid.appendChild(card);
        });
    }
    
    getSymbolType(symbol) {
        if (this.ipaData?.vowels?.some(v => v.symbol === symbol)) return 'متحرك';
        if (this.ipaData?.consonants?.some(c => c.symbol === symbol)) return 'ساكن';
        if (this.ipaData?.diphthongs?.some(d => d.symbol === symbol)) return 'مزدوج';
        return 'رمز';
    }
    
    showSymbolDetails(symbol) {
        const symbolData = this.findSymbolData(symbol);
        if (!symbolData) return;
        
        const modal = document.getElementById('symbolModal');
        const modalSymbol = document.getElementById('modalSymbol');
        const modalDescription = document.getElementById('modalDescription');
        const modalExamples = document.getElementById('modalExamples');
        const modalPlaySound = document.getElementById('modalPlaySound');
        
        modalSymbol.innerHTML = `<i class="fas fa-microphone-alt"></i> /${symbol}/`;
        modalDescription.textContent = symbolData.description;
        
        modalExamples.innerHTML = symbolData.examples
            .map(ex => `<li><i class="fas fa-language"></i> ${ex}</li>`)
            .join('');
        
        modalPlaySound.onclick = () => this.playSymbolSound(symbol);
        
        this.openModal(modal);
    }
    
    findSymbolData(symbol) {
        const vowel = this.ipaData?.vowels?.find(v => v.symbol === symbol);
        if (vowel) return vowel;
        
        const consonant = this.ipaData?.consonants?.find(c => c.symbol === symbol);
        if (consonant) return consonant;
        
        const diphthong = this.ipaData?.diphthongs?.find(d => d.symbol === symbol);
        if (diphthong) return diphthong;
        
        return {
            description: 'رمز صوتي',
            examples: [this.currentWord]
        };
    }
    
    playPronunciation() {
        if (!this.currentWord) return;
        
        const utterance = new SpeechSynthesisUtterance(this.currentWord);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        
        this.animatePlayButton();
    }
    
    playSymbolSound(symbol) {
        const utterance = new SpeechSynthesisUtterance();
        const example = this.getExampleForSymbol(symbol);
        
        if (example) {
            utterance.text = example;
        } else {
            utterance.text = symbol;
        }
        
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
    
    animatePlayButton() {
        const btn = this.playSoundBtn;
        if (btn) {
            btn.classList.add('bounce');
            setTimeout(() => btn.classList.remove('bounce'), 500);
        }
    }
    
    setupSpeechRecognition() {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (window.SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = false;
        }
    }
    
    openRecordModal() {
        if (!this.currentWord) {
            this.showNotification('الرجاء البحث عن كلمة أولاً', 'warning');
            return;
        }
        
        const modal = document.getElementById('recordModal');
        const recordWord = document.getElementById('recordWord');
        recordWord.textContent = this.currentWord;
        
        const startBtn = document.getElementById('startRecording');
        startBtn.onclick = () => this.startRecording();
        
        this.openModal(modal);
    }
    
    startRecording() {
        if (!this.recognition) {
            this.showNotification('المتصفح لا يدعم التسجيل الصوتي', 'error');
            return;
        }
        
        const animation = document.getElementById('recordAnimation');
        if (animation) animation.style.display = 'block';
        
        this.recognition.onresult = (event) => {
            const spoken = event.results[0][0].transcript.toLowerCase();
            const isCorrect = spoken === this.currentWord.toLowerCase();
            
            const resultDiv = document.getElementById('recordResult');
            if (resultDiv) {
                resultDiv.style.display = 'block';
                resultDiv.className = `record-result ${isCorrect ? 'correct' : 'incorrect'}`;
                resultDiv.innerHTML = isCorrect 
                    ? '<i class="fas fa-check-circle"></i> رائع! النطق صحيح!' 
                    : `<i class="fas fa-times-circle"></i> النطق غير صحيح. قلتَ: "${spoken}"`;
            }
            
            if (isCorrect) {
                this.addPoints(10);
            }
            
            if (animation) animation.style.display = 'none';
        };
        
        this.recognition.start();
    }
    
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabId}Panel`);
        });
        
        if (tabId === 'training') this.loadTraining();
        if (tabId === 'dictionary') this.loadDictionary();
        if (tabId === 'history') this.loadHistoryPanel();
    }
    
    loadTraining() {
        this.generateTrainingQuestions();
        this.currentTraining = 0;
        this.trainingScore = 0;
        this.displayTrainingQuestion();
    }
    
    generateTrainingQuestions() {
        const allSymbols = [
            ...(this.ipaData?.vowels || []),
            ...(this.ipaData?.consonants || []),
            ...(this.ipaData?.diphthongs || [])
        ];
        
        const shuffled = [...allSymbols].sort(() => 0.5 - Math.random());
        this.trainingQuestions = shuffled.slice(0, 10).map(symbol => ({
            symbol: symbol.symbol,
            description: symbol.description,
            examples: symbol.examples || []
        }));
        
        const totalSpan = document.getElementById('totalQuestions');
        if (totalSpan) totalSpan.textContent = this.trainingQuestions.length;
    }
    
    displayTrainingQuestion() {
        if (this.currentTraining >= this.trainingQuestions.length) {
            this.completeTraining();
            return;
        }
        
        const question = this.trainingQuestions[this.currentTraining];
        const currentSpan = document.getElementById('currentQuestion');
        const scoreSpan = document.getElementById('trainingScore');
        const playBtn = document.getElementById('playTrainingSound');
        const optionsGrid = document.getElementById('trainingOptions');
        const feedback = document.getElementById('trainingFeedback');
        const nextBtn = document.getElementById('nextTrainingQuestion');
        
        if (currentSpan) currentSpan.textContent = this.currentTraining + 1;
        if (scoreSpan) scoreSpan.textContent = this.trainingScore;
        
        if (optionsGrid) optionsGrid.innerHTML = '';
        if (feedback) feedback.innerHTML = '';
        if (nextBtn) nextBtn.style.display = 'none';
        
        if (playBtn) {
            playBtn.onclick = () => this.playSymbolSound(question.symbol);
        }
        
        const correctSymbol = question.symbol;
        const allSymbols = [
            ...(this.ipaData?.vowels || []).map(v => v.symbol),
            ...(this.ipaData?.consonants || []).map(c => c.symbol),
            ...(this.ipaData?.diphthongs || []).map(d => d.symbol)
        ];
        
        const wrongOptions = allSymbols
            .filter(s => s !== correctSymbol)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        const options = [correctSymbol, ...wrongOptions].sort(() => 0.5 - Math.random());
        
        if (optionsGrid) {
            options.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerHTML = `<i class="fas fa-microphone-alt"></i> ${option}`;
                btn.onclick = () => this.checkTrainingAnswer(option, correctSymbol);
                optionsGrid.appendChild(btn);
            });
        }
    }
    
    checkTrainingAnswer(selected, correct) {
        const feedback = document.getElementById('trainingFeedback');
        const nextBtn = document.getElementById('nextTrainingQuestion');
        
        if (selected === correct) {
            if (feedback) {
                feedback.innerHTML = '<i class="fas fa-check-circle"></i> إجابة صحيحة! +10 نقاط';
                feedback.className = 'training-feedback success';
            }
            this.trainingScore += 10;
            this.addPoints(10);
            
            const scoreSpan = document.getElementById('trainingScore');
            if (scoreSpan) scoreSpan.textContent = this.trainingScore;
        } else {
            if (feedback) {
                feedback.innerHTML = `<i class="fas fa-times-circle"></i> خطأ! الإجابة الصحيحة هي ${correct}`;
                feedback.className = 'training-feedback error';
            }
        }
        
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent.includes(correct)) {
                btn.classList.add('correct');
            } else if (btn.textContent.includes(selected) && selected !== correct) {
                btn.classList.add('wrong');
            }
        });
        
        if (nextBtn) {
            nextBtn.style.display = 'block';
            nextBtn.onclick = () => {
                this.currentTraining++;
                this.displayTrainingQuestion();
            };
        }
    }
    
    completeTraining() {
        const container = document.querySelector('.training-container');
        if (container) {
            const percentage = Math.round(this.trainingScore / (this.trainingQuestions.length * 10) * 100);
            container.innerHTML = `
                <div class="training-complete">
                    <i class="fas fa-trophy" style="font-size: 4rem; color: var(--primary); margin-bottom: 20px;"></i>
                    <h2>اكتمل التدريب!</h2>
                    <p><i class="fas fa-star"></i> نقاطك: ${this.trainingScore}/${this.trainingQuestions.length * 10}</p>
                    <p><i class="fas fa-percent"></i> نسبة النجاح: ${percentage}%</p>
                    <button onclick="location.reload()" class="btn-primary">
                        <i class="fas fa-redo-alt"></i> تدريب جديد
                    </button>
                </div>
            `;
        }
    }
    
    loadDictionary() {
        const grid = document.getElementById('dictionaryGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        const allSymbols = [
            ...(this.ipaData?.vowels || []).map(s => ({ ...s, category: 'vowel' })),
            ...(this.ipaData?.consonants || []).map(s => ({ ...s, category: 'consonant' })),
            ...(this.ipaData?.diphthongs || []).map(s => ({ ...s, category: 'diphthong' }))
        ];
        
        allSymbols.forEach(symbol => {
            const categoryIcon = symbol.category === 'vowel' ? '<i class="fas fa-vowel-sign"></i>' :
                                symbol.category === 'consonant' ? '<i class="fas fa-consonant"></i>' :
                                '<i class="fas fa-link"></i>';
            
            const card = document.createElement('div');
            card.className = 'dictionary-card';
            card.innerHTML = `
                <div class="dictionary-symbol">${categoryIcon} ${symbol.symbol}</div>
                <div class="dictionary-description">${symbol.description || 'رمز صوتي'}</div>
                <div class="dictionary-examples">
                    <i class="fas fa-list"></i> أمثلة: ${symbol.examples?.slice(0, 2).join(', ') || 'غير متوفر'}
                </div>
                <button class="dictionary-play" data-symbol="${symbol.symbol}">
                    <i class="fas fa-volume-up"></i> استمع
                </button>
            `;
            
            const playBtn = card.querySelector('.dictionary-play');
            playBtn.addEventListener('click', () => this.playSymbolSound(symbol.symbol));
            
            grid.appendChild(card);
        });
    }
    
    filterDictionary(category) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
        
        const cards = document.querySelectorAll('.dictionary-card');
        cards.forEach(card => {
            if (category === 'all') {
                card.style.display = 'block';
            } else {
                const symbolText = card.querySelector('.dictionary-symbol')?.textContent || '';
                const symbol = symbolText.replace(/[^a-zəɪʊɔːɑːθðʃʒŋ]/gi, '');
                const symbolData = this.findSymbolData(symbol);
                const matches = category === 'vowel' ? symbolData?.type === 'vowel' :
                               category === 'consonant' ? symbolData?.type === 'consonant' :
                               symbolData?.type === 'diphthong';
                card.style.display = matches ? 'block' : 'none';
            }
        });
    }
    
    startQuiz() {
        const quizType = document.getElementById('quizType')?.value || 'multiple';
        this.generateQuizQuestions(quizType);
        this.displayQuizQuestion();
    }
    
    generateQuizQuestions(type) {
        const words = this.loadWordsData();
        const shuffled = [...words].sort(() => 0.5 - Math.random());
        this.quizQuestions = shuffled.slice(0, 5).map(word => ({
            type: type,
            word: word.word,
            ipa: word.ipa,
            options: this.generateOptions(word.ipa, words)
        }));
        
        this.currentQuiz = {
            questions: this.quizQuestions,
            current: 0,
            score: 0
        };
    }
    
    loadWordsData() {
        return [
            { word: 'think', ipa: '/θɪŋk/' },
            { word: 'this', ipa: '/ðɪs/' },
            { word: 'cat', ipa: '/kæt/' },
            { word: 'dog', ipa: '/dɒɡ/' },
            { word: 'fish', ipa: '/fɪʃ/' },
            { word: 'house', ipa: '/haʊs/' },
            { word: 'beautiful', ipa: '/ˈbjuːtɪfəl/' }
        ];
    }
    
    generateOptions(correctIPA, words) {
        const wrong = words
            .filter(w => w.ipa !== correctIPA)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.ipa);
        
        return [correctIPA, ...wrong].sort(() => 0.5 - Math.random());
    }
    
    displayQuizQuestion() {
        const content = document.getElementById('quizContent');
        const results = document.getElementById('quizResults');
        
        if (!this.currentQuiz || this.currentQuiz.current >= this.currentQuiz.questions.length) {
            this.showQuizResults();
            return;
        }
        
        if (results) results.style.display = 'none';
        
        const question = this.currentQuiz.questions[this.currentQuiz.current];
        this.currentWord = question.word;
        
        if (question.type === 'multiple') {
            if (content) {
                content.innerHTML = `
                    <div class="quiz-question">
                        <div class="quiz-audio">
                            <button onclick="window.ipaTrainer.playPronunciation()" class="audio-btn">
                                <i class="fas fa-headphones"></i> استمع للنطق
                            </button>
                        </div>
                        <p><i class="fas fa-question-circle"></i> اختر الرمز الصحيح للكلمة: <strong>${question.word}</strong></p>
                        <div class="quiz-options">
                            ${question.options.map(opt => `
                                <button onclick="window.ipaTrainer.checkQuizAnswer('${opt}')" class="option-btn">
                                    <i class="fas fa-microphone-alt"></i> ${opt}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } else if (question.type === 'writing') {
            if (content) {
                content.innerHTML = `
                    <div class="quiz-question">
                        <div class="quiz-audio">
                            <button onclick="window.ipaTrainer.playPronunciation()" class="audio-btn">
                                <i class="fas fa-headphones"></i> استمع للنطق
                            </button>
                        </div>
                        <p><i class="fas fa-pen"></i> اكتب الرمز الصوتي للكلمة: <strong>${question.word}</strong></p>
                        <input type="text" id="quizAnswer" class="quiz-input" placeholder="مثال: /θɪŋk/">
                        <button onclick="window.ipaTrainer.checkWritingAnswer()" class="quiz-submit">
                            <i class="fas fa-check"></i> تحقق
                        </button>
                    </div>
                `;
            }
        }
    }
    
    checkQuizAnswer(selected) {
        const question = this.currentQuiz.questions[this.currentQuiz.current];
        const isCorrect = selected === question.ipa;
        
        if (isCorrect) {
            this.currentQuiz.score += 10;
            this.addPoints(10);
            this.showNotification('إجابة صحيحة! +10 نقاط', 'success');
        } else {
            this.showNotification(`خطأ! الإجابة الصحيحة: ${question.ipa}`, 'error');
        }
        
        this.currentQuiz.current++;
        this.displayQuizQuestion();
    }
    
    checkWritingAnswer() {
        const input = document.getElementById('quizAnswer');
        const answer = input?.value.trim();
        const question = this.currentQuiz.questions[this.currentQuiz.current];
        
        const isCorrect = answer === question.ipa;
        
        if (isCorrect) {
            this.currentQuiz.score += 10;
            this.addPoints(10);
            this.showNotification('إجابة صحيحة! +10 نقاط', 'success');
        } else {
            this.showNotification(`خطأ! الإجابة الصحيحة: ${question.ipa}`, 'error');
        }
        
        this.currentQuiz.current++;
        this.displayQuizQuestion();
    }
    
    showQuizResults() {
        const content = document.getElementById('quizContent');
        const results = document.getElementById('quizResults');
        
        if (content) content.innerHTML = '';
        if (results) {
            const percentage = Math.round((this.currentQuiz.score / (this.currentQuiz.questions.length * 10)) * 100);
            results.style.display = 'block';
            results.innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-trophy" style="font-size: 3rem; color: var(--primary); margin-bottom: 15px;"></i>
                    <h3>نتيجة الاختبار</h3>
                    <p><i class="fas fa-star"></i> النقاط: ${this.currentQuiz.score}/${this.currentQuiz.questions.length * 10}</p>
                    <p><i class="fas fa-percent"></i> نسبة النجاح: ${percentage}%</p>
                    ${percentage >= 70 ? '<p><i class="fas fa-medal"></i> ممتاز! أنت تتقدم بشكل رائع</p>' : '<p><i class="fas fa-book"></i> واصل التدريب، أنت في الطريق الصحيح</p>'}
                    <button onclick="window.ipaTrainer.startQuiz()" class="btn-primary">
                        <i class="fas fa-play"></i> اختبار جديد
                    </button>
                </div>
            `;
        }
        
        this.saveQuizResult(this.currentQuiz.score, percentage);
    }
    
    loadHistory() {
        const saved = localStorage.getItem('ipa_trainer_history');
        return saved ? JSON.parse(saved) : {
            searches: [],
            quizResults: [],
            totalPoints: 0,
            correctAnswers: 0,
            trainingSessions: 0
        };
    }
    
    saveToHistory(word, ipa) {
        this.userHistory.searches.unshift({
            word: word,
            ipa: ipa,
            date: new Date().toISOString()
        });
        
        if (this.userHistory.searches.length > 50) {
            this.userHistory.searches = this.userHistory.searches.slice(0, 50);
        }
        
        this.saveHistory();
    }
    
    saveQuizResult(score, percentage) {
        this.userHistory.quizResults.unshift({
            score: score,
            percentage: percentage,
            date: new Date().toISOString()
        });
        
        this.userHistory.totalPoints += score;
        
        if (percentage >= 70) {
            this.userHistory.correctAnswers++;
        }
        
        this.saveHistory();
    }
    
    addPoints(points) {
        this.userHistory.totalPoints += points;
        this.saveHistory();
        this.updateUI();
    }
    
    saveHistory() {
        localStorage.setItem('ipa_trainer_history', JSON.stringify(this.userHistory));
    }
    
    loadHistoryPanel() {
        const searchedWordsCount = document.getElementById('searchedWordsCount');
        const correctAnswersCount = document.getElementById('correctAnswersCount');
        const successRate = document.getElementById('successRate');
        const trainingSessions = document.getElementById('trainingSessions');
        const searchHistoryList = document.getElementById('searchHistoryList');
        const quizHistoryList = document.getElementById('quizHistoryList');
        
        if (searchedWordsCount) searchedWordsCount.textContent = this.userHistory.searches.length;
        if (correctAnswersCount) correctAnswersCount.textContent = this.userHistory.correctAnswers;
        if (trainingSessions) trainingSessions.textContent = this.userHistory.trainingSessions;
        
        const rate = this.userHistory.quizResults.length > 0 
            ? Math.round(this.userHistory.quizResults.reduce((sum, r) => sum + r.percentage, 0) / this.userHistory.quizResults.length)
            : 0;
        if (successRate) successRate.textContent = `${rate}%`;
        
        if (searchHistoryList) {
            searchHistoryList.innerHTML = this.userHistory.searches.slice(0, 20).map(item => `
                <div class="history-item">
                    <span class="history-word"><i class="fas fa-language"></i> ${item.word}</span>
                    <span class="history-ipa"><i class="fas fa-microphone-alt"></i> ${item.ipa}</span>
                    <span class="history-date"><i class="fas fa-calendar-alt"></i> ${new Date(item.date).toLocaleDateString('ar')}</span>
                </div>
            `).join('') || '<div class="history-item"><i class="fas fa-info-circle"></i> لا يوجد سجل بحث بعد</div>';
        }
        
        if (quizHistoryList) {
            quizHistoryList.innerHTML = this.userHistory.quizResults.slice(0, 20).map(item => `
                <div class="history-item">
                    <span><i class="fas fa-star"></i> نقاط: ${item.score}</span>
                    <span><i class="fas fa-percent"></i> نسبة: ${item.percentage}%</span>
                    <span class="history-date"><i class="fas fa-calendar-alt"></i> ${new Date(item.date).toLocaleDateString('ar')}</span>
                </div>
            `).join('') || '<div class="history-item"><i class="fas fa-info-circle"></i> لا يوجد سجل اختبارات بعد</div>';
        }
        
        const vowelsProgress = document.getElementById('vowelsProgress');
        const consonantsProgress = document.getElementById('consonantsProgress');
        const vowelsPercent = document.getElementById('vowelsPercent');
        const consonantsPercent = document.getElementById('consonantsPercent');
        
        const vowelProgress = Math.min(100, Math.floor(this.userHistory.correctAnswers * 5));
        const consonantProgress = Math.min(100, Math.floor(this.userHistory.totalPoints / 10));
        
        if (vowelsProgress) vowelsProgress.style.width = `${vowelProgress}%`;
        if (consonantsProgress) consonantsProgress.style.width = `${consonantProgress}%`;
        if (vowelsPercent) vowelsPercent.textContent = `${vowelProgress}%`;
        if (consonantsPercent) consonantsPercent.textContent = `${consonantProgress}%`;
    }
    
    resetHistory() {
        if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
            this.userHistory = {
                searches: [],
                quizResults: [],
                totalPoints: 0,
                correctAnswers: 0,
                trainingSessions: 0
            };
            this.saveHistory();
            this.loadHistoryPanel();
            this.updateUI();
            this.showNotification('تم مسح السجل بنجاح', 'success');
        }
    }
    
    updateUI() {
        const totalPoints = document.getElementById('totalPoints');
        const userLevel = document.getElementById('userLevel');
        
        if (totalPoints) totalPoints.textContent = this.userHistory.totalPoints;
        
        if (userLevel) {
            const points = this.userHistory.totalPoints;
            let levelIcon = '';
            let levelText = '';
            
            if (points < 100) {
                levelIcon = '<i class="fas fa-seedling"></i> ';
                levelText = 'مبتدئ';
            } else if (points < 300) {
                levelIcon = '<i class="fas fa-graduation-cap"></i> ';
                levelText = 'متعلم';
            } else if (points < 600) {
                levelIcon = '<i class="fas fa-chart-line"></i> ';
                levelText = 'متقدم';
            } else {
                levelIcon = '<i class="fas fa-crown"></i> ';
                levelText = 'خبير';
            }
            
            userLevel.innerHTML = levelIcon + levelText;
        }
    }
    
    loadSuggestions() {
        const suggestions = ['think', 'this', 'cat', 'dog', 'fish', 'house', 'beautiful', 'phone'];
        const container = document.getElementById('searchSuggestions');
        
        if (container) {
            container.innerHTML = suggestions.map(word => `
                <span class="suggestion-chip" onclick="document.getElementById('wordInput').value='${word}'; window.ipaTrainer.searchWord()">
                    <i class="fas fa-search"></i> ${word}
                </span>
            `).join('');
        }
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        }
    }
    
    openModal(modal) {
        if (modal) {
            modal.classList.add('active');
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal);
            });
        }
    }
    
    closeModal(modal) {
        if (modal) modal.classList.remove('active');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i> ';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i> ';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i> ';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i> ';
        }
        
        notification.innerHTML = icon + message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: inherit;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showLoading(show) {
        const searchBtn = this.searchBtn;
        if (searchBtn) {
            if (show) {
                searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري البحث...';
                searchBtn.disabled = true;
            } else {
                searchBtn.innerHTML = '<i class="fas fa-search"></i> <span>بحث</span>';
                searchBtn.disabled = false;
            }
        }
    }
    
    checkBrowserSupport() {
        if (!window.SpeechSynthesis) {
            this.showNotification('المتصفح لا يدعم خاصية النطق', 'warning');
        }
        
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            this.showNotification('المتصفح لا يدعم خاصية التسجيل', 'warning');
        }
    }
}

// Initialize app when DOM is ready
let ipaTrainer;
document.addEventListener('DOMContentLoaded', () => {
    ipaTrainer = new IPATrainer();
    window.ipaTrainer = ipaTrainer;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.innerHTML = savedTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        }
    }
});

// Add CSS animations for notifications and responsive behavior
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .training-complete {
        text-align: center;
        padding: 40px;
    }
    
    .training-complete h2 {
        margin-bottom: 20px;
    }
    
    .training-complete p {
        margin-bottom: 20px;
        font-size: 1.2rem;
    }
    
    /* Custom vowel and consonant icons */
    .fa-vowel-sign, .fa-consonant {
        font-family: 'Inter', monospace;
        font-weight: 700;
        font-size: 0.8rem;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
    }
    
    .fa-vowel-sign::before {
        content: "A";
    }
    
    .fa-consonant::before {
        content: "B";
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .symbol-card small {
            font-size: 0.6rem;
        }
        
        .dictionary-card {
            padding: 15px;
        }
        
        .quiz-options {
            grid-template-columns: 1fr;
        }
        
        .stat-card {
            padding: 15px;
        }
        
        .stat-icon i {
            font-size: 1.5rem;
        }
        
        .stat-number {
            font-size: 1.2rem;
        }
    }
    
    @media (max-width: 480px) {
        .btn-primary, .audio-btn, .record-btn {
            padding: 8px 12px;
            font-size: 0.85rem;
        }
        
        .symbol-card {
            padding: 6px 10px;
        }
        
        .hero-section h2 {
            font-size: 1.5rem;
        }
        
        .hero-section p {
            font-size: 0.9rem;
        }
    }
    
    /* Landscape mode on mobile */
    body.landscape-mobile .result-card {
        max-height: 60vh;
        overflow-y: auto;
    }
    
    /* Touch device optimizations */
    body.touch-device button,
    body.touch-device .clickable {
        min-height: 44px;
        cursor: pointer;
    }
    
    /* Performance optimization for mobile */
    @media (max-width: 768px) {
        .gradient-bg {
            display: none;
        }
    }
    
    /* RTL icon adjustments */
    i, .fas, .far, .fab {
        margin-left: 6px;
    }
    
    [dir="rtl"] i, [dir="rtl"] .fas, [dir="rtl"] .far, [dir="rtl"] .fab {
        margin-left: 0;
        margin-right: 6px;
    }
    
    /* Loading spinner */
    .fa-spinner {
        animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    /* Bounce animation for buttons */
    .bounce {
        animation: bounce 0.5s ease;
    }
    
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    /* Correct/Wrong button states */
    .option-btn.correct {
        background: var(--success);
        border-color: var(--success);
        color: white;
    }
    
    .option-btn.correct i {
        color: white;
    }
    
    .option-btn.wrong {
        background: var(--error);
        border-color: var(--error);
        color: white;
    }
    
    .option-btn.wrong i {
        color: white;
    }
`;
document.head.appendChild(style);


// developerInfo

function showDeveloperInfo() {
    const modal = document.getElementById('developerInfoModal');
    if (modal) {
        modal.innerHTML = `
            <div class="developer-info-content">
                <h2><i class="fas fa-user"></i> معلومات المطور</h2>
                <p><i class="fas fa-id-badge"></i> الاسم: محمد الباقر</p>
                <p><i class="fas fa-envelope"></i> البريد الإلكتروني: <a href="mailto:muhammad.albaqer@example.com">muhammad.albaqer@example.com</a></p>
            </div>
        `;
        modal.style.display = 'block';
    }
}