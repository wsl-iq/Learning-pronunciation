//  ┏──────────────────────────────────────┓
//  ┃ script.js                            ┃
//  ┣────────────┳─────────────────────────┫
//  ┃ Developer  │ Mohammed Al-Baqer       ┃
//  ┃ Copyright  │ Copyright (c) 2025-2026 ┃
//  ┗────────────┻─────────────────────────┛

class IPATrainer {
    constructor() {
        // DOM Elements - Main
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
        
        // Sidebar Elements
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.sidebarClose = document.getElementById('sidebarClose');
        
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
        this.currentPage = 'home';
        this.allSymbolsForDictionary = []; // تخزين جميع الرموز للقاموس
        
        // Initialize
        this.init();
    }
    
    async init() {
        await this.loadIPAData();
        this.setupEventListeners();
        this.setupSidebar();
        this.setupPageNavigation();
        this.loadSuggestions();
        this.updateUI();
        this.setupSpeechRecognition();
        this.checkBrowserSupport();
        this.loadSavedSettings();
        this.setupResponsive();
        this.setupDictionaryFilters(); // إعداد فلاتر القاموس
    }
    
    setupSidebar() {
        // Open sidebar
        this.menuToggle?.addEventListener('click', () => {
            this.sidebar.classList.add('open');
            this.sidebarOverlay.classList.add('active');
            this.menuToggle.classList.add('active');
        });
        
        // Close sidebar
        const closeSidebar = () => {
            this.sidebar.classList.remove('open');
            this.sidebarOverlay.classList.remove('active');
            this.menuToggle.classList.remove('active');
        };
        
        this.sidebarClose?.addEventListener('click', closeSidebar);
        this.sidebarOverlay?.addEventListener('click', closeSidebar);
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });
    }
    
    setupPageNavigation() {
        // Navigation menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.dataset.page;
                if (pageId) {
                    this.navigateToPage(pageId);
                    // Close sidebar on mobile
                    if (window.innerWidth <= 768) {
                        this.sidebar.classList.remove('open');
                        this.sidebarOverlay.classList.remove('active');
                    }
                }
            });
        });
        
        // Theme switcher
        const themeBtns = document.querySelectorAll('.theme-btn');
        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.setTheme(theme);
                
                // Update active state
                themeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                localStorage.setItem('theme', theme);
            });
        });
    }
    
    navigateToPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            localStorage.setItem('lastPage', pageId);
        }
        
        // Load specific page content if needed
        if (pageId === 'training') {
            this.loadTraining();
        } else if (pageId === 'dictionary') {
            this.loadDictionary();
        } else if (pageId === 'history') {
            this.loadHistoryPanel();
        }
    }
    
    setTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
    
    loadSavedSettings() {
        // Load theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
            const themeBtns = document.querySelectorAll('.theme-btn');
            themeBtns.forEach(btn => {
                if (btn.dataset.theme === savedTheme) {
                    btn.classList.add('active');
                }
            });
        }
        
        // Load last page
        const lastPage = localStorage.getItem('lastPage');
        if (lastPage && lastPage !== 'home') {
            this.navigateToPage(lastPage);
        }
    }
    
    setupResponsive() {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width > 768 && this.sidebar.classList.contains('open')) {
                // Optional: auto close sidebar on desktop
            }
        };
        
        window.addEventListener('resize', handleResize);
    }
    
    async loadIPAData() {
        try {
            const response = await fetch('data/ipa.json');
            this.ipaData = await response.json();
            this.prepareDictionaryData(); // تجهيز بيانات القاموس
        } catch (error) {
            console.error('Error loading IPA data:', error);
            this.useFallbackData();
            this.prepareDictionaryData();
        }
    }
    
    prepareDictionaryData() {
        // تجهيز جميع الرموز للقاموس مع تصنيفها الصحيح
        this.allSymbolsForDictionary = [];
        
        // إضافة الحروف المتحركة
        if (this.ipaData?.vowels) {
            this.ipaData.vowels.forEach(s => {
                this.allSymbolsForDictionary.push({
                    ...s,
                    category: 'vowel',
                    categoryName: 'حرف متحرك'
                });
            });
        }
        
        // إضافة الحروف الساكنة
        if (this.ipaData?.consonants) {
            this.ipaData.consonants.forEach(s => {
                this.allSymbolsForDictionary.push({
                    ...s,
                    category: 'consonant',
                    categoryName: 'حرف ساكن'
                });
            });
        }
        
        // إضافة الأصوات المزدوجة
        if (this.ipaData?.diphthongs) {
            this.ipaData.diphthongs.forEach(s => {
                this.allSymbolsForDictionary.push({
                    ...s,
                    category: 'diphthong',
                    categoryName: 'صوت مزدوج'
                });
            });
        }
    }
    
    useFallbackData() {
        this.ipaData = {
            vowels: [
                { symbol: 'iː', description: 'صوت طويل مثل see', examples: ['see', 'bee'], type: 'vowel' },
                { symbol: 'ɪ', description: 'صوت قصير مثل sit', examples: ['sit', 'big'], type: 'vowel' },
                { symbol: 'e', description: 'صوت مثل bed', examples: ['bed', 'red'], type: 'vowel' },
                { symbol: 'æ', description: 'صوت مثل cat', examples: ['cat', 'hat'], type: 'vowel' },
                { symbol: 'ɑː', description: 'صوت طويل مثل car', examples: ['car', 'star'], type: 'vowel' },
                { symbol: 'ɒ', description: 'صوت قصير مثل hot', examples: ['hot', 'dog'], type: 'vowel' },
                { symbol: 'ɔː', description: 'صوت طويل مثل saw', examples: ['saw', 'law'], type: 'vowel' },
                { symbol: 'ʊ', description: 'صوت قصير مثل book', examples: ['book', 'look'], type: 'vowel' },
                { symbol: 'uː', description: 'صوت طويل مثل food', examples: ['food', 'moon'], type: 'vowel' },
                { symbol: 'ʌ', description: 'صوت قصير مثل cup', examples: ['cup', 'sun'], type: 'vowel' },
                { symbol: 'ɜː', description: 'صوت طويل مثل bird', examples: ['bird', 'her'], type: 'vowel' },
                { symbol: 'ə', description: 'صوت schwa مثل about', examples: ['about', 'sofa'], type: 'vowel' }
            ],
            consonants: [
                { symbol: 'p', description: 'صوت انفجاري مثل pen', examples: ['pen', 'paper'], type: 'consonant' },
                { symbol: 'b', description: 'صوت انفجاري مجهور مثل book', examples: ['book', 'baby'], type: 'consonant' },
                { symbol: 't', description: 'صوت انفجاري مثل tea', examples: ['tea', 'table'], type: 'consonant' },
                { symbol: 'd', description: 'صوت انفجاري مجهور مثل dog', examples: ['dog', 'door'], type: 'consonant' },
                { symbol: 'k', description: 'صوت انفجاري مثل cat', examples: ['cat', 'kite'], type: 'consonant' },
                { symbol: 'g', description: 'صوت انفجاري مجهور مثل go', examples: ['go', 'big'], type: 'consonant' },
                { symbol: 'f', description: 'صوت احتكاكي مثل fish', examples: ['fish', 'phone'], type: 'consonant' },
                { symbol: 'v', description: 'صوت احتكاكي مجهور مثل voice', examples: ['voice', 'very'], type: 'consonant' },
                { symbol: 'θ', description: 'صوت بين الأسنان مثل think', examples: ['think', 'three'], type: 'consonant' },
                { symbol: 'ð', description: 'صوت مجهور مثل this', examples: ['this', 'mother'], type: 'consonant' },
                { symbol: 's', description: 'صوت صفير مثل see', examples: ['see', 'sun'], type: 'consonant' },
                { symbol: 'z', description: 'صوت صفير مجهور مثل zoo', examples: ['zoo', 'zero'], type: 'consonant' },
                { symbol: 'ʃ', description: 'صوت ش مثل she', examples: ['she', 'fish'], type: 'consonant' },
                { symbol: 'ʒ', description: 'صوت مجهور مثل vision', examples: ['vision', 'measure'], type: 'consonant' },
                { symbol: 'h', description: 'صوت هوائي مثل hat', examples: ['hat', 'house'], type: 'consonant' },
                { symbol: 'm', description: 'صوت أنفي مثل man', examples: ['man', 'mother'], type: 'consonant' },
                { symbol: 'n', description: 'صوت أنفي مثل no', examples: ['no', 'name'], type: 'consonant' },
                { symbol: 'ŋ', description: 'صوت أنفي مثل sing', examples: ['sing', 'ring'], type: 'consonant' },
                { symbol: 'l', description: 'صوت جانبي مثل love', examples: ['love', 'light'], type: 'consonant' },
                { symbol: 'r', description: 'صوت لثوي مثل red', examples: ['red', 'run'], type: 'consonant' },
                { symbol: 'j', description: 'صوت شبه صامت مثل yes', examples: ['yes', 'you'], type: 'consonant' },
                { symbol: 'w', description: 'صوت شبه صامت مثل we', examples: ['we', 'water'], type: 'consonant' },
                { symbol: 'tʃ', description: 'صوت مركب مثل church', examples: ['church', 'chair'], type: 'consonant' },
                { symbol: 'dʒ', description: 'صوت مركب مجهور مثل judge', examples: ['judge', 'job'], type: 'consonant' }
            ],
            diphthongs: [
                { symbol: 'eɪ', description: 'صوت مزدوج مثل say', examples: ['say', 'day'], type: 'diphthong' },
                { symbol: 'aɪ', description: 'صوت مزدوج مثل my', examples: ['my', 'eye'], type: 'diphthong' },
                { symbol: 'ɔɪ', description: 'صوت مزدوج مثل boy', examples: ['boy', 'toy'], type: 'diphthong' },
                { symbol: 'əʊ', description: 'صوت مزدوج مثل go', examples: ['go', 'no'], type: 'diphthong' },
                { symbol: 'aʊ', description: 'صوت مزدوج مثل now', examples: ['now', 'how'], type: 'diphthong' },
                { symbol: 'ɪə', description: 'صوت مزدوج مثل here', examples: ['here', 'near'], type: 'diphthong' },
                { symbol: 'eə', description: 'صوت مزدوج مثل hair', examples: ['hair', 'care'], type: 'diphthong' },
                { symbol: 'ʊə', description: 'صوت مزدوج مثل pure', examples: ['pure', 'cure'], type: 'diphthong' }
            ]
        };
    }

    loadHomophones() {
        return [
            {
                group: 'to / too / two',
                words: [
                    { word: 'to', ipa: '/tuː/', category: 'homophone' },
                    { word: 'too', ipa: '/tuː/', category: 'homophone' },
                    { word: 'two', ipa: '/tuː/', category: 'homophone' }
                ]
            },
            {
                group: 'there / their / they\'re',
                words: [
                    { word: 'there', ipa: '/ðɛər/', category: 'homophone' },
                    { word: 'their', ipa: '/ðɛər/', category: 'homophone' },
                    { word: "they're", ipa: '/ðɛər/', category: 'homophone' }
                ]
            },
            {
                group: 'see / sea',
                words: [
                    { word: 'see', ipa: '/siː/', category: 'homophone' },
                    { word: 'sea', ipa: '/siː/', category: 'homophone' }
                ]
            },
            {
                group: 'be / bee',
                words: [
                    { word: 'be', ipa: '/biː/', category: 'homophone' },
                    { word: 'bee', ipa: '/biː/', category: 'homophone' }
                ]
            },
            {
                group: 'knight / night',
                words: [
                    { word: 'knight', ipa: '/naɪt/', category: 'homophone' },
                    { word: 'night', ipa: '/naɪt/', category: 'homophone' }
                ]
            },
            {
                group: 'right / write',
                words: [
                    { word: 'right', ipa: '/raɪt/', category: 'homophone' },
                    { word: 'write', ipa: '/raɪt/', category: 'homophone' }
                ]
            },
            {
                group: 'new / knew',
                words: [
                    { word: 'new', ipa: '/njuː/', category: 'homophone' },
                    { word: 'knew', ipa: '/njuː/', category: 'homophone' }
                ]
            },
            {
                group: 'no / know',
                words: [
                    { word: 'no', ipa: '/nəʊ/', category: 'homophone' },
                    { word: 'know', ipa: '/nəʊ/', category: 'homophone' }
                ]
            }
        ];
    }

    setupEventListeners() {
        this.searchBtn?.addEventListener('click', () => this.searchWord());
        this.wordInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWord();
        });
        this.playSoundBtn?.addEventListener('click', () => this.playPronunciation());
        this.recordBtn?.addEventListener('click', () => this.openRecordModal());
        
        // Training
        const nextBtn = document.getElementById('nextTrainingQuestion');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentTraining++;
                this.displayTrainingQuestion();
            });
        }
        
        // Quiz
        const startQuizBtn = document.getElementById('startQuiz');
        startQuizBtn?.addEventListener('click', () => this.startQuiz());
        
        // Reset history
        const resetBtn = document.getElementById('resetHistory');
        resetBtn?.addEventListener('click', () => this.resetHistory());
        
        // Report issue
        const reportBtn = document.getElementById('reportIssueBtn');
        const reportModal = document.getElementById('reportModal');
        const submitIssue = document.getElementById('submitIssue');
        
        reportBtn?.addEventListener('click', () => this.openModal(reportModal));
        
        submitIssue?.addEventListener('click', () => {
            const description = document.getElementById('issueDescription')?.value;
            if (description) {
                this.showNotification('تم استلام البلاغ، شكراً لك!', 'success');
                this.closeModal(reportModal);
                document.getElementById('issueDescription').value = '';
            } else {
                this.showNotification('الرجاء كتابة وصف المشكلة', 'warning');
            }
        });
        
        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.closest('.modal')));
        });
    }
    
    setupDictionaryFilters() {
        // إعداد أزرار تصفية القاموس
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterDictionary(filter);
                
                // تحديث حالة active
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
            });
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
                this.updateAchievements();
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
            'phone': '/fəʊn/',
            'hello': '/həˈləʊ/',
            'world': '/wɜːld/',
            'apple': '/ˈæpəl/',
            'car': '/kɑː/',
            'book': '/bʊk/',
            'school': '/skuːl/',
            'mother': '/ˈmʌðə/',
            'father': '/ˈfɑːðə/',
            'water': '/ˈwɔːtə/',
            'sun': '/sʌn/',
            'moon': '/muːn/',
            'computer': '/kəmˈpjuːtə/',
            'language': '/ˈlæŋɡwɪdʒ/',
            'music': '/ˈmjuːzɪk/',
            'friend': '/frɛnd/',
            'family': '/ˈfæmɪli/',
            'love': '/lʌv/',
            'happy': '/ˈhæpi/',
            'sad': '/sæd/',
            'angry': '/ˈæŋɡri/',
            'excited': '/ɪkˈsaɪtɪd/',
            'bored': '/bɔːd/',
            'tired': '/ˈtaɪəd/',
            'strong': '/strɒŋ/',
            'weak': '/wiːk/',
            'fast': '/fæst/',
            'slow': '/sləʊ/',
            'ugly': '/ˈʌɡli/',
            'big': '/bɪɡ/',
            'small': '/smɔːl/',
            'hot': '/hɒt/',
            'cold': '/kəʊld/',
            'new': '/njuː/',
            'old': '/əʊld/',
            'boy': '/bɔɪ/',
            'toy': '/tɔɪ/',
            'say': '/seɪ/',
            'day': '/deɪ/',
            'my': '/maɪ/',
            'eye': '/aɪ/',
            'go': '/ɡəʊ/',
            'no': '/nəʊ/',
            'now': '/naʊ/',
            'how': '/haʊ/',
            'here': '/hɪə/',
            'near': '/nɪə/',
            'hair': '/heə/',
            'care': '/keə/',
            'pure': '/pjʊə/',
            'cure': '/kjʊə/'
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
        const cleanIPA = ipaString.replace(/[\/\[\]ˈˌ]/g, '');
        const symbols = [];
        
        // تحليل الرموز مع مراعاة الأصوات المزدوجة
        for (let i = 0; i < cleanIPA.length; i++) {
            // التحقق من الأصوات المزدوجة (حرفين)
            if (i < cleanIPA.length - 1) {
                const twoChars = cleanIPA[i] + cleanIPA[i + 1];
                if (this.isDiphthong(twoChars)) {
                    symbols.push(twoChars);
                    i++;
                    continue;
                }
            }
            
            // التحقق من الرموز مع علامة الطول (ː)
            if (i < cleanIPA.length - 1 && cleanIPA[i + 1] === 'ː') {
                symbols.push(cleanIPA[i] + 'ː');
                i++;
                continue;
            }
            
            symbols.push(cleanIPA[i]);
        }
        
        return {
            full: ipaString,
            clean: cleanIPA,
            symbols: symbols,
            start: symbols[0] || '-',
            middle: symbols.slice(1, -1).join('') || '-',
            end: symbols[symbols.length - 1] || '-'
        };
    }
    
    isDiphthong(symbol) {
        const diphthongs = ['eɪ', 'aɪ', 'ɔɪ', 'əʊ', 'aʊ', 'ɪə', 'eə', 'ʊə', 'ju', 'ɔr', 'ɛr', 'ɪr', 'ʊr'];
        return diphthongs.includes(symbol) || 
               (this.ipaData?.diphthongs?.some(d => d.symbol === symbol) || false);
    }
    
    displayExamples(parsed) {
        const startExample = this.getExampleForSymbol(parsed.start);
        const middleSymbols = parsed.middle !== '-' ? parsed.middle.split('').filter(s => s) : [];
        const middleExample = middleSymbols.length > 0 ? this.getExampleForSymbol(middleSymbols[0]) : null;
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
        
        if (modalSymbol) modalSymbol.innerHTML = `<i class="fas fa-microphone-alt"></i> /${symbol}/`;
        if (modalDescription) modalDescription.textContent = symbolData.description;
        
        if (modalExamples) {
            modalExamples.innerHTML = symbolData.examples
                .map(ex => `<li><i class="fas fa-language"></i> ${ex}</li>`)
                .join('');
        }
        
        if (modalPlaySound) {
            modalPlaySound.onclick = () => this.playSymbolSound(symbol);
        }
        
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
        if (recordWord) recordWord.textContent = this.currentWord;
        
        const startBtn = document.getElementById('startRecording');
        if (startBtn) startBtn.onclick = () => this.startRecording();
        
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
        
        this.recognition.onerror = () => {
            if (animation) animation.style.display = 'none';
            this.showNotification('حدث خطأ في التسجيل', 'error');
        };
        
        this.recognition.start();
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
                    <button onclick="window.ipaTrainer.loadTraining()" class="btn-primary">
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
        
        if (this.ipaData?.homophones && this.ipaData.homophones.length > 0) {
            this.ipaData.homophones.forEach(group => {
                const mainWord = group.word;
                const homophonesList = group.homophones.join('، ');
                const ipa = this.getLocalIPA(mainWord) || this.fetchIPASync(mainWord) || '/?/';
                allSymbols.push({
                    symbol: ipa,
                    description: `كلمات متشابهة النطق: ${mainWord} = ${homophonesList}`,
                    examples: [mainWord, ...group.homophones],
                    type: 'homophone',
                    category: 'homophone'
                });
            });
        }
        
        allSymbols.forEach(symbol => {
            let categoryIcon;
            switch(symbol.category) {
                case 'vowel':
                    categoryIcon = '<i class="fas fa-vowel-sign"></i>';
                    break;
                case 'consonant':
                    categoryIcon = '<i class="fas fa-consonant"></i>';
                    break;
                case 'diphthong':
                    categoryIcon = '<i class="fas fa-link"></i>';
                    break;
                case 'homophone':
                    categoryIcon = '<i class="fas fa-similar"></i>';
                    break;
                default:
                    categoryIcon = '<i class="fas fa-microphone-alt"></i>';
            }
            
            const card = document.createElement('div');
            card.className = 'dictionary-card';
            card.setAttribute('data-category', symbol.category);
            card.setAttribute('data-symbol', symbol.symbol);
            card.innerHTML = `
                <div class="dictionary-symbol">${categoryIcon} ${symbol.symbol}</div>
                <div class="dictionary-description">${symbol.description || 'رمز صوتي'}</div>
                <div class="dictionary-examples">
                    <i class="fas fa-list"></i> ${symbol.examples?.slice(0, 3).join(' / ') || 'غير متوفر'}
                </div>
                <button class="dictionary-play" data-symbol="${symbol.symbol}">
                    <i class="fas fa-volume-up"></i> استمع
                </button>
            `;
            
            const playBtn = card.querySelector('.dictionary-play');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (symbol.category === 'homophone') {
                    const word = symbol.examples[0];
                    const utterance = new SpeechSynthesisUtterance(word);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.9;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterance);
                } else {
                    this.playSymbolSound(symbol.symbol);
                }
            });
            
            card.addEventListener('click', () => this.showSymbolDetails(symbol.symbol));
            grid.appendChild(card);
        });
    }

    fetchIPASync(word) {
        const localWords = {
            'sea': '/siː/',
            'see': '/siː/',
            'be': '/biː/',
            'bee': '/biː/',
            'to': '/tuː/',
            'too': '/tuː/',
            'two': '/tuː/',
            'there': '/ðɛər/',
            'their': '/ðɛər/',
            "they're": '/ðɛər/',
            'flower': '/ˈflaʊə/',
            'flour': '/ˈflaʊə/',
            'knight': '/naɪt/',
            'night': '/naɪt/',
            'right': '/raɪt/',
            'write': '/raɪt/',
            'rite': '/raɪt/',
            'pair': '/peə/',
            'pear': '/peə/',
            'pare': '/peə/'
        };
        return localWords[word] || null;
    }
    
    filterDictionary(category) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
        
        const cards = document.querySelectorAll('.dictionary-card');
        
        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            if (category === 'all') {
                card.style.display = 'block';
            } else {
                card.style.display = cardCategory === category ? 'block' : 'none';
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
    
    generateOptions(correctIPA, allWords) {
        const otherIPAs = allWords
            .map(w => w.ipa)
            .filter(ipa => ipa !== correctIPA)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        return [correctIPA, ...otherIPAs].sort(() => 0.5 - Math.random());
    }

    loadWordsData() {
        return [
            { word: 'think', ipa: '/θɪŋk/' },
            { word: 'this', ipa: '/ðɪs/' },
            { word: 'cat', ipa: '/kæt/' },
            { word: 'dog', ipa: '/dɒɡ/' },
            { word: 'fish', ipa: '/fɪʃ/' },
            { word: 'house', ipa: '/haʊs/' },
            { word: 'beautiful', ipa: '/ˈbjuːtɪfəl/' },
            { word: 'phone', ipa: '/fəʊn/' },
            { word: 'mother', ipa: '/ˈmʌðə/' },
            { word: 'father', ipa: '/ˈfɑːðə/' },
            { word: 'school', ipa: '/skuːl/' },
            { word: 'apple', ipa: '/ˈæpəl/' },
            { word: 'car', ipa: '/kɑː/' },
            { word: 'book', ipa: '/bʊk/' },
            { word: 'water', ipa: '/ˈwɔːtə/' },
            { word: 'sun', ipa: '/sʌn/' },
            { word: 'moon', ipa: '/muːn/' },
            { word: 'boy', ipa: '/bɔɪ/' },
            { word: 'toy', ipa: '/tɔɪ/' },
            { word: 'say', ipa: '/seɪ/' },
            { word: 'my', ipa: '/maɪ/' },
            { word: 'go', ipa: '/ɡəʊ/' },
            { word: 'now', ipa: '/naʊ/' },
            { word: 'here', ipa: '/hɪə/' },
            { word: 'hair', ipa: '/heə/' },
            { word: 'pure', ipa: '/pjʊə/' }
        ];
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
        
        if (question.type === 'multiple') {
            if (content) {
                content.innerHTML = `
                    <div class="quiz-question">
                        <div class="quiz-audio">
                            <button onclick="window.ipaTrainer.playQuizWord('${question.word}')" class="audio-btn">
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
                            <button onclick="window.ipaTrainer.playQuizWord('${question.word}')" class="audio-btn">
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
    
    playQuizWord(word) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
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
        this.updateAchievements();
    }
    
    addPoints(points) {
        this.userHistory.totalPoints += points;
        this.saveHistory();
        this.updateUI();
        this.updateAchievements();
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
        const diphthongsProgress = document.getElementById('diphthongsProgress');
        const vowelsPercent = document.getElementById('vowelsPercent');
        const consonantsPercent = document.getElementById('consonantsPercent');
        const diphthongsPercent = document.getElementById('diphthongsPercent');
        
        const vowelProgress = Math.min(100, Math.floor(this.userHistory.correctAnswers * 5));
        const consonantProgress = Math.min(100, Math.floor(this.userHistory.totalPoints / 10));
        const diphthongProgress = Math.min(100, Math.floor(this.userHistory.totalPoints / 8));
        
        if (vowelsProgress) vowelsProgress.style.width = `${vowelProgress}%`;
        if (consonantsProgress) consonantsProgress.style.width = `${consonantProgress}%`;
        if (diphthongsProgress) diphthongsProgress.style.width = `${diphthongProgress}%`;
        if (vowelsPercent) vowelsPercent.textContent = `${vowelProgress}%`;
        if (consonantsPercent) consonantsPercent.textContent = `${consonantProgress}%`;
        if (diphthongsPercent) diphthongsPercent.textContent = `${diphthongProgress}%`;
        
        this.updateAchievements();
    }
    
    updateAchievements() {
        const achievements = {
            firstSearch: this.userHistory.searches.length >= 1,
            firstQuiz: this.userHistory.quizResults.length >= 1,
            expert: this.userHistory.totalPoints >= 500
        };
        
        const achievementsGrid = document.getElementById('achievementsGrid');
        if (achievementsGrid) {
            const achievementCards = achievementsGrid.querySelectorAll('.achievement-card');
            
            if (achievementCards[0]) {
                if (achievements.firstSearch) {
                    achievementCards[0].classList.remove('locked');
                    achievementCards[0].classList.add('unlocked');
                    achievementCards[0].innerHTML = '<i class="fas fa-star"></i><span>أول بحث</span><i class="fas fa-check-circle"></i>';
                }
            }
            
            if (achievementCards[1]) {
                if (achievements.firstQuiz) {
                    achievementCards[1].classList.remove('locked');
                    achievementCards[1].classList.add('unlocked');
                    achievementCards[1].innerHTML = '<i class="fas fa-trophy"></i><span>أول اختبار</span><i class="fas fa-check-circle"></i>';
                }
            }
            
            if (achievementCards[2]) {
                if (achievements.expert) {
                    achievementCards[2].classList.remove('locked');
                    achievementCards[2].classList.add('unlocked');
                    achievementCards[2].innerHTML = '<i class="fas fa-crown"></i><span>خبير الأصوات</span><i class="fas fa-check-circle"></i>';
                }
            }
        }
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
            this.updateAchievements();
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
        const suggestions = ['think', 'this', 'cat', 'dog', 'fish', 'house', 'beautiful', 'phone', 'hello', 'world', 'boy', 'my', 'go'];
        const container = document.getElementById('searchSuggestions');
        
        if (container) {
            container.innerHTML = suggestions.map(word => `
                <span class="suggestion-chip" onclick="document.getElementById('wordInput').value='${word}'; window.ipaTrainer.searchWord()">
                    <i class="fas fa-search"></i> ${word}
                </span>
            `).join('');
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
            z-index: 1100;
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



let ipaTrainer;
document.addEventListener('DOMContentLoaded', () => {
    ipaTrainer = new IPATrainer();
    window.ipaTrainer = ipaTrainer;
    
    // التحقق من وجود اسم المستخدم
    const userName = localStorage.getItem('userName');
    if (!userName) {
        document.getElementById('nameModal').classList.add('active');
    } else {
        const greetingText = document.getElementById('greetingText');
        if (greetingText) {
            greetingText.innerHTML = `<i class="fas fa-hand-peace"></i> مرحباً ${userName} في IPA Trainer`;
        }
    }
    
    // حفظ اسم المستخدم
    document.getElementById('saveUserNameBtn')?.addEventListener('click', () => {
        const nameInput = document.getElementById('userNameInput');
        const name = nameInput?.value.trim();
        if (name) {
            localStorage.setItem('userName', name);
            document.getElementById('nameModal').classList.remove('active');
            const greetingText = document.getElementById('greetingText');
            if (greetingText) {
                greetingText.innerHTML = `<i class="fas fa-hand-peace"></i> مرحباً ${name} في IPA Trainer`;
            }
        }
    });
});


//document.getElementById('changeNameBtn')?.addEventListener('click', () => {
//    const currentName = localStorage.getItem('userName') || '';
//    const newName = prompt('أدخل اسمك الجديد:', currentName);
//    if (newName) {
//        localStorage.setItem('userName', newName.trim());
//        const greetingText = document.getElementById('greetingText');
//        if (greetingText) {
//            greetingText.innerHTML = `<i class="fas fa-hand-peace"></i> مرحباً ${newName.trim()} في IPA Trainer`;
//        }
//    }
//});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .bounce {
        animation: bounce 0.5s ease;
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
    
    .record-result {
        margin-top: 15px;
        padding: 10px;
        border-radius: 8px;
        text-align: center;
    }
    
    .record-result.correct {
        background: var(--success);
        color: white;
    }
    
    .record-result.incorrect {
        background: var(--error);
        color: white;
    }
    
    .record-animation {
        text-align: center;
        padding: 20px;
    }
    
    .mic-icon i {
        font-size: 3rem;
        animation: pulse 1s infinite;
    }
    
    .sound-waves {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
        margin-top: 15px;
    }
    
    .sound-waves span {
        width: 4px;
        height: 20px;
        background: var(--primary);
        border-radius: 2px;
        animation: wave 1s infinite ease-in-out;
    }
    
    .sound-waves span:nth-child(2) { animation-delay: 0.1s; height: 30px; }
    .sound-waves span:nth-child(3) { animation-delay: 0.2s; height: 40px; }
    .sound-waves span:nth-child(4) { animation-delay: 0.3s; height: 30px; }
    
    @keyframes wave {
        0%, 100% { height: 20px; }
        50% { height: 50px; }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .fa-spinner {
        animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .dictionary-card {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .dictionary-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    
    .option-btn.correct {
        background: #10b981 !important;
        color: white !important;
        border-color: #10b981 !important;
    }
    
    .option-btn.wrong {
        background: #ef4444 !important;
        color: white !important;
        border-color: #ef4444 !important;
    }
    
    .training-feedback.success {
        color: #10b981;
    }
    
    .training-feedback.error {
        color: #ef4444;
    }
    
    /* ===== إصلاح حقل الاسم في النافذة المنبثقة (Modal) ===== */
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 2000;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
    }
    
    .modal.active {
        display: flex;
    }
    
    .modal-content {
        background: var(--bg-primary);
        border-radius: 20px;
        width: 90%;
        max-width: 450px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 35px rgba(0, 0, 0, 0.3);
        animation: modalFadeIn 0.3s ease;
    }
    
    @keyframes modalFadeIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--border-color);
        background: var(--bg-secondary);
        border-radius: 20px 20px 0 0;
    }
    
    .modal-header h3 {
        margin: 0;
        font-size: 1.3rem;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-primary);
    }
    
    .modal-header h3 i {
        color: var(--primary);
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.2s;
        line-height: 1;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .modal-close:hover {
        background: var(--hover-bg);
        color: var(--text-primary);
    }
    
    .modal-body {
        padding: 24px;
    }
    
    .modal-body p {
        margin-bottom: 15px;
        color: var(--text-primary);
    }
    
    /* تنسيق حقل الإدخال داخل المودال */
    .modal-body input,
    .modal-body textarea {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid var(--border-color);
        border-radius: 12px;
        background: var(--input-bg);
        color: var(--text-primary);
        font-size: 1rem;
        font-family: inherit;
        transition: all 0.2s;
        box-sizing: border-box;
    }
    
    .modal-body input:focus,
    .modal-body textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    
    .modal-body input {
        text-align: right;
        direction: rtl;
    }
    
    /* تنسيق الزر داخل المودال */
    .modal-body .btn-primary {
        width: 100%;
        margin-top: 15px;
        padding: 12px;
        font-size: 1rem;
    }
    
    /* نافذة الاسم - تحسينات إضافية */
    #nameModal .modal-content {
        max-width: 400px;
    }
    
    #userNameInput {
        font-size: 1.1rem;
        text-align: center !important;
        letter-spacing: 0.5px;
    }
    
    /* منع overflow في الصفحات الصغيرة */
    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
            margin: 20px;
        }
        
        .modal-body {
            padding: 20px;
        }
    }
`;
document.head.appendChild(style);