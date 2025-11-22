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

function speakChar(text) {
    speechSynthesis.cancel();
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = 'ja-JP';
    uttr.rate = 1.2;
    speechSynthesis.speak(uttr);
}

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

// --- Flick Logic ---

function addFlickListener(element, item) {
    let startX, startY;
    let isFlicking = false;
    let activeDirection = 'center';

    element.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        isFlicking = true;
        activeDirection = 'center';
        showFlickPopup(e.clientX, e.clientY, item);
        element.setPointerCapture(e.pointerId);
    });

    element.addEventListener('pointermove', (e) => {
        if (!isFlicking) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const threshold = 30;

        if (distance < threshold) {
            activeDirection = 'center';
        } else {
            const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
            if (angle >= -45 && angle < 45) activeDirection = 'right';
            else if (angle >= 45 && angle < 135) activeDirection = 'bottom';
            else if (angle >= -135 && angle < -45) activeDirection = 'top';
            else activeDirection = 'left';
        }
        updateFlickPopupState(activeDirection);
    });

    element.addEventListener('pointerup', (e) => {
        if (!isFlicking) return;
        isFlicking = false;
        element.releasePointerCapture(e.pointerId);
        hideFlickPopup();

        let inputChar = item.char;
        if (activeDirection === 'left') inputChar = item.sub[0];
        else if (activeDirection === 'top') inputChar = item.sub[1];
        else if (activeDirection === 'right') inputChar = item.sub[2];
        else if (activeDirection === 'bottom') inputChar = item.sub[3];

        if (inputChar) handleInput(inputChar);
    });

    element.addEventListener('pointercancel', () => {
        isFlicking = false;
        hideFlickPopup();
    });
}

function showFlickPopup(x, y, item) {
    if (!flickPopup) return;
    flickPopup.style.display = 'grid';
    flickPopup.style.left = `${x}px`;
    flickPopup.style.top = `${y - 50}px`;

    flickPopup.querySelector('.center').textContent = item.char;
    flickPopup.querySelector('.left').textContent = item.sub[0] || '';
    flickPopup.querySelector('.top').textContent = item.sub[1] || '';
    flickPopup.querySelector('.right').textContent = item.sub[2] || '';
    flickPopup.querySelector('.bottom').textContent = item.sub[3] || '';

    updateFlickPopupState('center');
}

function hideFlickPopup() {
    if (flickPopup) flickPopup.style.display = 'none';
}

function updateFlickPopupState(direction) {
    if (!flickPopup) return;
    flickPopup.querySelectorAll('.flick-item').forEach(el => el.classList.remove('active'));
    const target = flickPopup.querySelector(`.${direction}`);
    if (target && target.textContent) target.classList.add('active');
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

addTouchListener(settingsBtn, () => settingsModal.style.display = 'flex');
addTouchListener(closeSettingsBtn, () => settingsModal.style.display = 'none');

window.addEventListener('pointerdown', (event) => {
    if (event.target === settingsModal) settingsModal.style.display = 'none';
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

addTouchListener(speakBtn, () => {
    const text = displayText.value;
    if (text) {
        const uttr = new SpeechSynthesisUtterance(text);
        uttr.lang = 'ja-JP';
        speechSynthesis.speak(uttr);
    }
});

// --- Picture Mode ---

const modeItems = document.querySelectorAll('.mode-item');
const pictureAreaContainer = document.getElementById('pictureAreaContainer');
const pictureArea = document.getElementById('pictureArea');
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
