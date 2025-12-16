const boardArea = document.getElementById('boardArea');
const displayText = document.getElementById('displayText');
const speakBtn = document.getElementById('speakBtn');
const clearBtn = document.getElementById('clearBtn');
const backspaceBtn = document.getElementById('backspaceBtn');
const suggestionArea = document.getElementById('suggestionArea');

// --- Data Structures ---

// 50-on Columns
const columns = [
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['さ', 'し', 'す', 'せ', 'そ'],
    ['た', 'ち', 'つ', 'て', 'と'],
    ['な', 'に', 'ぬ', 'ね', 'の'],
    ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    ['ま', 'み', 'む', 'め', 'も'],
    ['や', '「', 'ゆ', '」', 'よ'],
    ['ら', 'り', 'る', 'れ', 'ろ'],
    ['わ', 'を', 'ん', 'ー', '、'],
    ['゛', '゜', '？', '！', '。']
];

// Flick Columns (10-key)
const flickColumns = [
    { char: 'あ', sub: ['い', 'う', 'え', 'お'] },
    { char: 'か', sub: ['き', 'く', 'け', 'こ'] },
    { char: 'さ', sub: ['し', 'す', 'せ', 'そ'] },
    { char: 'た', sub: ['ち', 'つ', 'て', 'と'] },
    { char: 'な', sub: ['に', 'ぬ', 'ね', 'の'] },
    { char: 'は', sub: ['ひ', 'ふ', 'へ', 'ほ'] },
    { char: 'ま', sub: ['み', 'む', 'め', 'も'] },
    { char: 'や', sub: ['「', 'ゆ', '」', 'よ'] },
    { char: 'ら', sub: ['り', 'る', 'れ', 'ろ'] },
    { char: 'わ', sub: ['を', 'ん', 'ー', '、'] },
    { char: '゛', sub: ['゜', '？', '！', '。'] },
    { char: '削除', action: 'backspace' }
];

// Vocabulary
const vocabulary = [
    'ありがとう', 'ごめんなさい', 'はい', 'いいえ', 'おねがいします',
    'トイレ', 'おみず', 'おちゃ', 'ごはん', 'おなかすいた',
    'のどかわいた', 'あつい', 'さむい', 'いたい', 'かゆい',
    'きもちわるい', 'ねむい', 'おきたい', 'ねたい', 'テレビ',
    'ラジオ', 'おんがく', 'でんき', 'けして', 'つけて',
    'あけて', 'しめて', 'とって', 'まって', 'きて',
    'いく', 'いかない', 'すき', 'きらい', 'うれしい',
    'かなしい', 'たのしい', 'つらい', 'しんどい', 'だいじょうぶ',
    'おはよう', 'こんにちは', 'こんばんは', 'おやすみ', 'さようなら',
    'またね', 'げんき', 'どうしたの', 'なに', 'どこ',
    'いつ', 'だれ', 'なぜ', 'どうして', 'これ',
    'それ', 'あれ', 'どれ', 'ここ', 'そこ',
    'あそこ', 'わたし', 'あなた', 'みんな', 'せんせい',
    'かんごしさん', 'ヘルパーさん', 'おかあさん', 'おとうさん', 'かぞく',
    'ともだち', 'めがね', 'リモコン', 'ティッシュ', 'タオル',
    'ふとん', 'まくら', 'くすり', 'のみたい', 'たべたい',
    'いきたい', 'かえりたい', 'やすみたい', 'おふろ', 'きがえ',
    'はみがき', 'かおあらう', 'てをあらう', 'うがい', 'さんぽ',
    'くるまいす', 'ベッド', 'エアコン', 'せんぷうき', 'ストーブ',
    'まど', 'ドア', 'カーテン', 'カレンダー', 'とけい'
];

// --- State ---
let currentInputMode = '50on'; // '50on' or 'flick'
let isEditMode = false;
let currentEditingIndex = -1;

// --- Elements ---
const inputModeSelect = document.getElementById('inputModeSelect');
const flickPopup = document.getElementById('flickPopup');

// --- Initialization & Mode Switching ---

function initBoard() {
    boardArea.innerHTML = '';
    boardArea.style.display = 'grid'; // Ensure visible

    if (currentInputMode === 'flick') {
        initFlickBoard();
    } else {
        init50onBoard();
    }
    updateSuggestions();
}

function init50onBoard() {
    boardArea.className = 'view-area board-grid';
    boardArea.style.gridTemplateColumns = `repeat(${columns.length}, 1fr)`;
    boardArea.style.gridTemplateRows = 'repeat(5, 1fr)';
    boardArea.style.gridAutoFlow = 'column';

    columns.forEach((col) => {
        col.forEach((char) => {
            const btn = document.createElement('div');
            btn.className = 'char-btn';
            btn.textContent = char;
            addTouchListener(btn, () => handleInput(char));
            boardArea.appendChild(btn);
        });
    });
}

function initFlickBoard() {
    boardArea.className = 'view-area board-grid flick-mode';
    boardArea.style.gridTemplateColumns = 'repeat(3, 1fr)';
    boardArea.style.gridTemplateRows = 'repeat(4, 1fr)';
    boardArea.style.gridAutoFlow = 'row';

    flickColumns.forEach((item) => {
        const btn = document.createElement('div');
        btn.className = 'flick-key';

        if (item.action === 'backspace') {
            btn.innerHTML = `<span>⌫</span>`;
            btn.style.backgroundColor = '#ed8936';
            btn.style.color = 'white';
            addTouchListener(btn, () => {
                displayText.value = displayText.value.slice(0, -1);
                updateSuggestions();
            });
        } else {
            btn.innerHTML = `
                <span>${item.char}</span>
                <div class="sub-chars">${item.sub[1] || ''} ${item.sub[2] || ''} ${item.sub[3] || ''}</div>
            `;
            addFlickListener(btn, item);
        }
        boardArea.appendChild(btn);
    });
}

if (inputModeSelect) {
    inputModeSelect.addEventListener('change', (e) => {
        currentInputMode = e.target.value;
        initBoard();
    });
}

// --- Input Handling ---

function handleInput(char) {
    speakChar(char);
    if (char === '゛' || char === '゜') {
        addDakuten(char);
    } else {
        displayText.value += char;
    }
    scrollToEnd();
    updateSuggestions();
}

// Duplicate speakChar removed

function addDakuten(type) {
    const lastChar = displayText.value.slice(-1);
    if (!lastChar) return;

    const dakutenMap = {
        'か': 'が', 'き': 'ぎ', 'く': 'ぐ', 'け': 'げ', 'こ': 'ご',
        'さ': 'ざ', 'し': 'じ', 'す': 'ず', 'せ': 'ぜ', 'そ': 'ぞ',
        'た': 'だ', 'ち': 'ぢ', 'つ': 'づ', 'て': 'で', 'と': 'ど',
        'は': 'ば', 'ひ': 'び', 'ふ': 'ぶ', 'へ': 'べ', 'ほ': 'ぼ',
        'う': 'ヴ'
    };
    const handakutenMap = {
        'は': 'ぱ', 'ひ': 'ぴ', 'ふ': 'ぷ', 'へ': 'ぺ', 'ほ': 'ぽ'
    };

    let newChar = lastChar;
    if (type === '゛' && dakutenMap[lastChar]) {
        newChar = dakutenMap[lastChar];
    } else if (type === '゜' && handakutenMap[lastChar]) {
        newChar = handakutenMap[lastChar];
    }

    if (newChar !== lastChar) {
        displayText.value = displayText.value.slice(0, -1) + newChar;
    }
}

function updateSuggestions() {
    const currentText = displayText.value;
    suggestionArea.innerHTML = '';
    if (!currentText) return;

    let suggestions = [];
    for (let len = Math.min(currentText.length, 5); len > 0; len--) {
        const suffix = currentText.slice(-len);
        const found = vocabulary.filter(word => word.startsWith(suffix) && word !== suffix);
        suggestions = [...suggestions, ...found];
    }
    suggestions = [...new Set(suggestions)];

    suggestions.slice(0, 10).forEach(word => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = word;
        addTouchListener(chip, () => {
            let matchLen = 0;
            for (let len = Math.min(currentText.length, word.length); len > 0; len--) {
                if (word.startsWith(currentText.slice(-len))) {
                    matchLen = len;
                    break;
                }
            }
            const newText = currentText.slice(0, -matchLen) + word;
            displayText.value = newText;
            speakChar(word);
            updateSuggestions();
            scrollToEnd();
        });
        suggestionArea.appendChild(chip);
    });
}

function scrollToEnd() {
    displayText.scrollTop = displayText.scrollHeight;
}

function addTouchListener(element, handler) {
    element.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        handler(e);
    });
}

// --- Flick/Tap Logic ---

function addFlickListener(element, item) {
    // Changed to Tap-Select interaction
    addTouchListener(element, (e) => {
        // Show Popup centered on the key
        showFlickPopup(element, item);
    });
}

function showFlickPopup(targetElement, item) {
    if (!flickPopup) return;

    // Get target element position
    const rect = targetElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    flickPopup.style.display = 'grid';
    flickPopup.style.left = `${centerX}px`;
    flickPopup.style.top = `${centerY}px`;

    // Populate items
    const map = {
        center: item.char,
        left: item.sub[0] || '',
        top: item.sub[1] || '',
        right: item.sub[2] || '',
        bottom: item.sub[3] || ''
    };

    ['center', 'left', 'top', 'right', 'bottom'].forEach(dir => {
        const el = flickPopup.querySelector(`.${dir}`);
        if (el) {
            el.textContent = map[dir];
            // Clone to remove old listeners
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);

            if (map[dir]) {
                addTouchListener(newEl, (e) => {
                    e.stopPropagation(); // Prevent closing immediately
                    handleInput(map[dir]);
                    hideFlickPopup();
                });
            }
        }
    });
}

function hideFlickPopup() {
    if (flickPopup) flickPopup.style.display = 'none';
}

function updateFlickPopupState(direction) {
    // Not used in Tap-Select
}

// --- Settings & Controls ---

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const fontSelect = document.getElementById('fontSelect');
const displayTextSize = document.getElementById('displayTextSize');
const boardFontSize = document.getElementById('boardFontSize');
const displayTextBgColor = document.getElementById('displayTextBgColor');
const boardBgColor = document.getElementById('boardBgColor');
const displayTextColor = document.getElementById('displayTextColor');
const boardTextColor = document.getElementById('boardTextColor');
const fullScreenBtn = document.getElementById('fullScreenBtn');

// addTouchListener(settingsBtn, () => settingsModal.style.display = 'flex'); // Moved to voice loading logic
addTouchListener(closeSettingsBtn, () => settingsModal.style.display = 'none');

// Close popup on outside click
window.addEventListener('pointerdown', (event) => {
    if (flickPopup && flickPopup.style.display !== 'none') {
        if (!flickPopup.contains(event.target) && !event.target.closest('.flick-key')) {
            hideFlickPopup();
        }
    }
    if (event.target === settingsModal) settingsModal.style.display = 'none';
    if (event.target === editCardModal) editCardModal.style.display = 'none';
});

fontSelect.addEventListener('change', (e) => document.body.style.fontFamily = e.target.value);

displayTextSize.addEventListener('input', (e) => displayText.style.fontSize = `${e.target.value}rem`);
displayTextBgColor.addEventListener('input', (e) => displayText.style.backgroundColor = e.target.value);
displayTextColor.addEventListener('input', (e) => displayText.style.color = e.target.value);

boardFontSize.addEventListener('input', (e) => {
    const size = e.target.value;
    document.querySelectorAll('.char-btn').forEach(btn => btn.style.fontSize = `${size}vmin`);
});

boardBgColor.addEventListener('input', (e) => {
    const color = e.target.value;
    document.querySelectorAll('.char-btn').forEach(btn => btn.style.backgroundColor = color);
});

boardTextColor.addEventListener('input', (e) => {
    const color = e.target.value;
    document.querySelectorAll('.char-btn').forEach(btn => btn.style.color = color);
});

// Full Screen
if (fullScreenBtn) {
    addTouchListener(fullScreenBtn, () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error: ${err.message}`);
                alert('全画面表示がサポートされていないか、制限されています。');
            });
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fullScreenBtn.textContent = '解除';
            fullScreenBtn.style.backgroundColor = '#ed8936';
        } else {
            fullScreenBtn.textContent = '切り替え';
            fullScreenBtn.style.backgroundColor = 'var(--primary-color)';
        }
    });
}

// Controls
addTouchListener(clearBtn, () => {
    displayText.value = '';
    updateSuggestions();
});

addTouchListener(backspaceBtn, () => {
    displayText.value = displayText.value.slice(0, -1);
    updateSuggestions();
});

// --- AudioController Class ---

class AudioController {
    constructor() {
        this.ctx = null;
        this.voices = [];
        this.currentVoice = null;
        this.isUnlocked = false;
        this.voicesLoaded = false;
    }

    init() {
        // Voice loading listeners
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
        this.loadVoices();

        // Polling loop for voices
        const interval = setInterval(() => {
            if (this.voicesLoaded) clearInterval(interval);
            else this.loadVoices();
        }, 500);

        // Invisible Unlock Strategy
        const unlockEvents = ['touchstart', 'touchend', 'click', 'keydown'];
        const unlockHandler = () => {
            if (!this.isUnlocked) {
                this.unlock();
                // We keep trying until strictly unlocked or just run once? 
                // Let's run once per event type to be safe, then remove.
            }
        };
        unlockEvents.forEach(evt => {
            document.body.addEventListener(evt, unlockHandler, { capture: true, once: true });
        });
    }

    async unlock() {
        if (this.isUnlocked && this.ctx && this.ctx.state === 'running') return;

        console.log("AudioController: Attempting Unlock...");

        // 1. AudioContext
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext && !this.ctx) {
                this.ctx = new AudioContext();
            }
            if (this.ctx) {
                if (this.ctx.state === 'suspended') {
                    await this.ctx.resume();
                }
                const buffer = this.ctx.createBuffer(1, 1, 22050);
                const source = this.ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(this.ctx.destination);
                if (source.start) source.start(0);
                else source.noteOn(0);
            }
        } catch (e) {
            console.error("AudioController: Context Error", e);
        }

        // 2. SpeechSynthesis (Critical for iOS)
        this.speakInternal(' ', true);

        this.isUnlocked = true;
    }

    loadVoices() {
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) return;

        this.voices = voices;
        this.voicesLoaded = true;
        this.updateVoiceSelect();
    }

    updateVoiceSelect() {
        const select = document.getElementById('voiceSelect');
        if (!select) return;

        const jaVoices = this.voices.filter(v => v.lang.includes('ja') || v.lang.includes('JP'));
        const savedVoiceName = localStorage.getItem('selectedVoice');

        select.innerHTML = '';

        // Default
        const defOpt = document.createElement('option');
        defOpt.value = 'default';
        defOpt.textContent = '標準 (システム設定)';
        select.appendChild(defOpt);

        jaVoices.forEach(voice => {
            const opt = document.createElement('option');
            opt.value = voice.name;
            let label = voice.name;
            if (label.includes('Siri')) label = `Siri (${label})`;
            else if (label.includes('Google')) label = `Google (${label})`;
            opt.textContent = label;
            select.appendChild(opt);
        });

        // Restore
        let target = 'default';
        if (savedVoiceName && jaVoices.find(v => v.name === savedVoiceName)) {
            target = savedVoiceName;
            this.currentVoice = jaVoices.find(v => v.name === savedVoiceName);
        } else {
            this.currentVoice = null;
        }
        select.value = target;
    }

    setVoice(voiceName) {
        if (voiceName === 'default') {
            this.currentVoice = null;
        } else {
            this.currentVoice = this.voices.find(v => v.name === voiceName);
        }
        localStorage.setItem('selectedVoice', voiceName);
        this.speak('音声を変更しました');
    }

    speak(text) {
        // Ensure unlocked if it somehow wasn't (e.g. programmatic call without interaction)
        if (!this.isUnlocked) this.unlock();
        this.speakInternal(text, false);
    }

    speakInternal(text, isUnlock = false) {
        speechSynthesis.cancel();
        if (speechSynthesis.paused) speechSynthesis.resume();

        const uttr = new SpeechSynthesisUtterance(text);
        uttr.lang = 'ja-JP';
        uttr.rate = 1.0;

        if (isUnlock) uttr.volume = 0;
        else uttr.volume = 1;

        if (this.currentVoice) {
            uttr.voice = this.currentVoice;
        } else {
            // Smart default fallback
            const best = this.voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
            if (best) uttr.voice = best;
        }

        uttr.onerror = (e) => console.error("Speech Error:", e);

        // iOS Garbage Collection Fix
        window.activeUtterance = uttr;
        uttr.onend = () => { window.activeUtterance = null; };

        speechSynthesis.speak(uttr);
    }
}

const audioCtrl = new AudioController();
audioCtrl.init();

// --- Settings and UI Connections ---

// Re-connect Settings Button (Critical Fix)
if (settingsBtn) {
    addTouchListener(settingsBtn, () => {
        settingsModal.style.display = 'flex';
        audioCtrl.loadVoices(); // Refresh voices when opening settings
    });
}

// Connect Voice Select
const voiceSelect = document.getElementById('voiceSelect'); // Re-declare voiceSelect here
if (voiceSelect) {
    voiceSelect.addEventListener('change', (e) => {
        audioCtrl.setVoice(e.target.value);
    });
}

// Manual Unlock (Fallback)
const unlockSpeechBtn = document.getElementById('unlockSpeech');
if (unlockSpeechBtn) {
    unlockSpeechBtn.addEventListener('click', () => {
        audioCtrl.unlock();
        audioCtrl.speak('音声出力を有効にしました');
        unlockSpeechBtn.textContent = '有効化されました！';
        unlockSpeechBtn.style.backgroundColor = '#48bb78';
        setTimeout(() => {
            unlockSpeechBtn.textContent = '音声出力を有効にする (iOS用)';
            unlockSpeechBtn.style.backgroundColor = '#ed8936';
        }, 2000);
    });
}

// Hook into global handler or specific buttons
// (Note: speakChar global proxy)
function speakChar(text) {
    audioCtrl.speak(text);
}


// --- Picture Mode ---

const modeItems = document.querySelectorAll('.mode-item');
const editModeToggle = document.getElementById('editModeToggle');
const editCardModal = document.getElementById('editCardModal');
const closeEditCardBtn = document.getElementById('closeEditCardBtn');
const cardLabelInput = document.getElementById('cardLabelInput');
const iconGrid = document.getElementById('iconGrid');
const saveCardBtn = document.getElementById('saveCardBtn');
const gridSizeSelect = document.getElementById('gridSizeSelect');

const presetIcons = [
    { id: 'none', icon: '', label: '文字のみ' },
    { id: 'meal', icon: 'assets/icon_meal.png', label: '食事' },
    { id: 'toilet', icon: 'assets/icon_toilet.png', label: 'トイレ' },
    { id: 'bath', icon: 'assets/icon_bath.png', label: 'お風呂' },
    { id: 'sleep', icon: 'assets/icon_sleep.png', label: '睡眠' },
    { id: 'tv', icon: 'assets/icon_tv.png', label: 'テレビ' },
    { id: 'health', icon: 'assets/icon_health.png', label: '体調' },
    { id: 'suction', icon: 'assets/icon_suction.png', label: '吸引' },
    { id: 'pain', icon: 'assets/icon_pain.png', label: '痛い' },
    { id: 'board', icon: 'assets/icon_board.png', label: '文字盤' },
    { id: 'call', icon: 'assets/icon_call.png', label: 'コール' }
];

let currentCards = [
    { ...presetIcons[1] },
    { ...presetIcons[2] },
    { ...presetIcons[3] },
    { ...presetIcons[4] },
    { ...presetIcons[5] },
    { ...presetIcons[6] }
];

function updateGridSize(sizeStr) {
    const [cols, rows] = sizeStr.split('x').map(Number);
    const totalCards = cols * rows;
    pictureArea.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    pictureArea.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    if (currentCards.length < totalCards) {
        for (let i = currentCards.length; i < totalCards; i++) {
            const presetIndex = (i % (presetIcons.length - 1)) + 1;
            currentCards.push({ ...presetIcons[presetIndex] });
        }
    } else if (currentCards.length > totalCards) {
        currentCards = currentCards.slice(0, totalCards);
    }
    initPictureMode();
}

if (gridSizeSelect) {
    gridSizeSelect.addEventListener('change', (e) => updateGridSize(e.target.value));
}

function initPictureMode() {
    pictureArea.innerHTML = '';
    currentCards.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'picture-card';
        if (isEditMode) card.classList.add('editing');

        const hasIcon = item.icon && item.icon !== '';
        if (!hasIcon) card.classList.add('text-only');

        card.innerHTML = `
            <img src="${item.icon}" alt="${item.label}" onerror="this.style.display='none'; this.parentElement.classList.add('text-only');">
            <span>${item.label}</span>
        `;

        addTouchListener(card, () => {
            if (isEditMode) {
                openEditModal(index);
            } else {
                speakChar(item.label);
                displayText.value += item.label;
                scrollToEnd();
            }
        });
        pictureArea.appendChild(card);
    });
}

if (editModeToggle) {
    editModeToggle.addEventListener('change', (e) => {
        isEditMode = e.target.checked;
        initPictureMode();
    });
}

function openEditModal(index) {
    currentEditingIndex = index;
    const card = currentCards[index];
    cardLabelInput.value = card.label;
    iconGrid.innerHTML = '';

    presetIcons.forEach(icon => {
        const option = document.createElement('div');
        option.className = 'icon-option';
        if (icon.icon === card.icon) option.classList.add('selected');

        if (icon.id === 'none') {
            option.innerHTML = `<div style="font-size: 0.8rem; font-weight: bold;">文字のみ</div>`;
        } else {
            option.innerHTML = `<img src="${icon.icon}" alt="${icon.label}">`;
        }

        addTouchListener(option, () => {
            document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
        option.dataset.iconPath = icon.icon;
        iconGrid.appendChild(option);
    });
    editCardModal.style.display = 'flex';
}

if (saveCardBtn) {
    saveCardBtn.addEventListener('click', () => {
        if (currentEditingIndex === -1) return;
        const newLabel = cardLabelInput.value;
        const selectedOption = document.querySelector('.icon-option.selected');
        const newIcon = selectedOption ? selectedOption.dataset.iconPath : currentCards[currentEditingIndex].icon;

        currentCards[currentEditingIndex] = {
            ...currentCards[currentEditingIndex],
            label: newLabel,
            icon: newIcon
        };
        editCardModal.style.display = 'none';
        initPictureMode();
    });
}

if (closeEditCardBtn) addTouchListener(closeEditCardBtn, () => editCardModal.style.display = 'none');
window.addEventListener('pointerdown', (event) => {
    if (event.target === editCardModal) editCardModal.style.display = 'none';
});

modeItems.forEach(item => {
    addTouchListener(item, () => {
        modeItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const mode = item.dataset.mode;
        boardArea.style.display = 'none';
        pictureAreaContainer.style.display = 'none';

        if (mode === 'kana') {
            boardArea.style.display = 'grid';
        } else {
            pictureAreaContainer.style.display = 'flex';
            initPictureMode();
        }
    });
});

// --- Start ---
initBoard();
if (gridSizeSelect) updateGridSize(gridSizeSelect.value);
