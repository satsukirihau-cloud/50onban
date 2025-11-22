const boardArea = document.getElementById('boardArea');
const displayText = document.getElementById('displayText');
const speakBtn = document.getElementById('speakBtn');
const clearBtn = document.getElementById('clearBtn');
const backspaceBtn = document.getElementById('backspaceBtn');

// Data structure for the board
// Columns from Left to Right
const columns = [
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['さ', 'し', 'す', 'せ', 'そ'],
    ['た', 'ち', 'つ', 'て', 'と'],
    ['な', 'に', 'ぬ', 'ね', 'の'],
    ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    ['ま', 'み', 'む', 'め', 'も'],
    ['や', '「', 'ゆ', '」', 'よ'], // Adjusted Ya-column
    ['ら', 'り', 'る', 'れ', 'ろ'],
    ['わ', 'を', 'ん', 'ー', '、'], // Adjusted Wa-column
    ['゛', '゜', '？', '！', '。']  // Extras
];

const suggestionArea = document.getElementById('suggestionArea');

// Vocabulary for predictive text (~100 care/daily words)
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

function initBoard() {
    // Clear existing
    boardArea.innerHTML = '';
    boardArea.style.display = 'grid'; // Ensure it's visible

    // Set grid columns based on data length
    boardArea.style.gridTemplateColumns = `repeat(${columns.length}, 1fr)`;

    columns.forEach((col, colIndex) => {
        col.forEach((char, rowIndex) => {
            const btn = document.createElement('div');
            btn.className = 'char-btn';
            btn.textContent = char;

            // Use the helper for consistent touch handling
            addTouchListener(btn, () => {
                handleInput(char);
            });

            boardArea.appendChild(btn);
        });
    });

    // Apply column flow
    boardArea.style.gridAutoFlow = 'column';
    updateSuggestions();
}

function handleInput(char) {
    // Sound feedback
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
    // Cancel previous speech to avoid queue buildup
    speechSynthesis.cancel();
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = 'ja-JP';
    uttr.rate = 1.2; // Slightly faster for feedback
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

    // Simple matching: words that start with the last few characters
    // For simplicity, let's match based on the last 1-3 characters entered
    // But typically, prediction works on the whole current "sentence" or just the last word.
    // Since there are no spaces, we'll try to match the *end* of the current text with the *start* of vocabulary words?
    // Or just simple "contains" or "starts with" if the text is short?

    // Let's assume the user clears text often or we match against the *last entered sequence*.
    // A common simple strategy for these boards is: match words that START with the last character(s).

    const lastChar = currentText.slice(-1);
    if (!lastChar) return;

    // Filter words that start with the last character
    // (Improvement: match last 2 chars if possible, etc.)
    const matches = vocabulary.filter(word => word.startsWith(lastChar));

    // Also, if the text *is* a prefix of a word (e.g. "あり" -> "ありがとう")
    // We should check if the *entire* current text (or suffix of it) matches.
    // Let's try to find words that start with the suffix of the current text.
    // We'll check suffixes of length 1 to 4.

    let suggestions = [];

    for (let len = Math.min(currentText.length, 5); len > 0; len--) {
        const suffix = currentText.slice(-len);
        const found = vocabulary.filter(word => word.startsWith(suffix) && word !== suffix);
        suggestions = [...suggestions, ...found];
    }

    // Deduplicate
    suggestions = [...new Set(suggestions)];

    // Limit to top 10
    suggestions.slice(0, 10).forEach(word => {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = word;
        addTouchListener(chip, () => {
            // Append the rest of the word
            // We need to know which part matched.
            // Simplified: just replace the matching suffix or append?
            // Usually, we replace the typed part with the full word.

            // Find the longest matching suffix again to replace correctly
            let matchLen = 0;
            for (let len = Math.min(currentText.length, word.length); len > 0; len--) {
                if (word.startsWith(currentText.slice(-len))) {
                    matchLen = len;
                    break;
                }
            }

            const newText = currentText.slice(0, -matchLen) + word;
            displayText.value = newText;
            speakChar(word); // Speak the full word
            updateSuggestions();
            scrollToEnd();
        });
        suggestionArea.appendChild(chip);
    });
}

function scrollToEnd() {
    displayText.scrollTop = displayText.scrollHeight;
}

// Helper to add touch-friendly listeners
function addTouchListener(element, handler) {
    // Use pointerdown for immediate response on modern devices
    // Prevent default to stop potential double-firing or scrolling issues on buttons
    element.addEventListener('pointerdown', (e) => {
        e.preventDefault(); // Prevent mouse emulation and scrolling (since we are no-scroll)
        handler(e);
    });
}

// Settings Logic
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const fontSelect = document.getElementById('fontSelect');
const colorSelect = document.getElementById('colorSelect');

// Use click for Settings to avoid accidental triggers, or pointerdown if requested.
// User said "Settings button cannot be changed on iPad", so let's try pointerdown to ensure it catches.
addTouchListener(settingsBtn, () => {
    settingsModal.style.display = 'flex';
});

addTouchListener(closeSettingsBtn, () => {
    settingsModal.style.display = 'none';
});

// Modal background click
window.addEventListener('pointerdown', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

fontSelect.addEventListener('change', (e) => {
    document.body.style.fontFamily = e.target.value;
});

const displayTextColor = document.getElementById('displayTextColor');
const boardTextColor = document.getElementById('boardTextColor');

const displayTextSize = document.getElementById('displayTextSize');
const boardFontSize = document.getElementById('boardFontSize');
const displayTextBgColor = document.getElementById('displayTextBgColor');
const boardBgColor = document.getElementById('boardBgColor');

// Display Text Settings
displayTextSize.addEventListener('input', (e) => {
    displayText.style.fontSize = `${e.target.value}rem`;
});

displayTextBgColor.addEventListener('input', (e) => {
    displayText.style.backgroundColor = e.target.value;
});

displayTextColor.addEventListener('input', (e) => {
    displayText.style.color = e.target.value;
});

// Board Settings
boardFontSize.addEventListener('input', (e) => {
    const size = e.target.value;
    // Update CSS variable or direct style for all char-btns
    const btns = document.querySelectorAll('.char-btn');
    btns.forEach(btn => {
        btn.style.fontSize = `${size}vmin`;
    });
});

boardBgColor.addEventListener('input', (e) => {
    const color = e.target.value;
    const btns = document.querySelectorAll('.char-btn');
    btns.forEach(btn => {
        btn.style.backgroundColor = color;
    });
});

boardTextColor.addEventListener('input', (e) => {
    const color = e.target.value;
    const btns = document.querySelectorAll('.char-btn');
    btns.forEach(btn => {
        btn.style.color = color;
    });
});

// Full Screen Logic
const fullScreenBtn = document.getElementById('fullScreenBtn');

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            alert('このブラウザでは全画面表示がサポートされていないか、制限されています。');
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

addTouchListener(fullScreenBtn, () => {
    toggleFullScreen();
});

// Update button text based on state (optional but good for debugging/UX)
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullScreenBtn.textContent = '解除';
        fullScreenBtn.style.backgroundColor = '#ed8936'; // Orange for exit
    } else {
        fullScreenBtn.textContent = '切り替え';
        fullScreenBtn.style.backgroundColor = 'var(--primary-color)'; // Blue for enter
    }
});

// Mode Selection Logic
// Mode Selection Logic
const modeItems = document.querySelectorAll('.mode-item');
const pictureAreaContainer = document.getElementById('pictureAreaContainer');
const pictureArea = document.getElementById('pictureArea');

// Edit Mode Elements
const editModeToggle = document.getElementById('editModeToggle');
const editCardModal = document.getElementById('editCardModal');
const closeEditCardBtn = document.getElementById('closeEditCardBtn');
const cardLabelInput = document.getElementById('cardLabelInput');
const iconGrid = document.getElementById('iconGrid');
const saveCardBtn = document.getElementById('saveCardBtn');

let isEditMode = false;
let currentEditingIndex = -1;

// Available Icons (Presets)
const presetIcons = [
    { id: 'none', icon: '', label: '文字のみ' }, // New "No Icon" option
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

// Grid Size Logic
const gridSizeSelect = document.getElementById('gridSizeSelect');

// Initial Cards (Default 3x2 = 6 cards)
let currentCards = [
    { ...presetIcons[1] }, // Meal
    { ...presetIcons[2] }, // Toilet
    { ...presetIcons[3] }, // Bath
    { ...presetIcons[4] }, // Sleep
    { ...presetIcons[5] }, // TV
    { ...presetIcons[6] }  // Health
];

function updateGridSize(sizeStr) {
    const [cols, rows] = sizeStr.split('x').map(Number);
    const totalCards = cols * rows;

    // Update Grid CSS
    pictureArea.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    pictureArea.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    // Resize currentCards array
    if (currentCards.length < totalCards) {
        // Add more cards (use presets or placeholders)
        for (let i = currentCards.length; i < totalCards; i++) {
            // Cycle through presets if we run out, skipping "none" if desired, or just looping
            // Start from index 1 to skip "none" for auto-fill
            const presetIndex = (i % (presetIcons.length - 1)) + 1;
            currentCards.push({ ...presetIcons[presetIndex] });
        }
    } else if (currentCards.length > totalCards) {
        // Trim array
        currentCards = currentCards.slice(0, totalCards);
    }

    initPictureMode();
}

gridSizeSelect.addEventListener('change', (e) => {
    updateGridSize(e.target.value);
});

function initPictureMode() {
    pictureArea.innerHTML = '';

    if (!currentCards || currentCards.length === 0) {
        console.error("No cards to render!");
        return;
    }

    currentCards.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'picture-card';
        if (isEditMode) card.classList.add('editing');

        // Check if icon exists and is not empty
        const hasIcon = item.icon && item.icon !== '';

        if (!hasIcon) {
            card.classList.add('text-only');
        }

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

// Initialize with default or selected value
updateGridSize(gridSizeSelect.value);
// Edit Mode Toggle
editModeToggle.addEventListener('change', (e) => {
    isEditMode = e.target.checked;
    initPictureMode(); // Re-render to update visuals/behavior
});

// Edit Modal Logic
function openEditModal(index) {
    currentEditingIndex = index;
    const card = currentCards[index];
    cardLabelInput.value = card.label;

    // Render Icon Grid
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
            // Deselect others
            document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            // Update temp state if needed, but we'll read from DOM on save
        });

        // Store icon path on element for retrieval
        option.dataset.iconPath = icon.icon;

        iconGrid.appendChild(option);
    });

    editCardModal.style.display = 'flex';
}

saveCardBtn.addEventListener('click', () => { // Use click for buttons usually
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

addTouchListener(closeEditCardBtn, () => {
    editCardModal.style.display = 'none';
});

// Close modal on outside click
window.addEventListener('pointerdown', (event) => {
    if (event.target === editCardModal) {
        editCardModal.style.display = 'none';
    }
});

initPictureMode();



modeItems.forEach(item => {
    addTouchListener(item, () => {
        // Remove active class from all
        modeItems.forEach(i => i.classList.remove('active'));
        // Add active class to clicked
        item.classList.add('active');

        const mode = item.dataset.mode;

        // Hide all views first
        boardArea.style.display = 'none';
        pictureAreaContainer.style.display = 'none';

        if (mode === 'kana') {
            boardArea.style.display = 'grid';
        } else {
            // Picture mode
            pictureAreaContainer.style.display = 'flex';
            // Ensure grid is refreshed/visible
            initPictureMode();
        }
    });
});

// Event Listeners for Controls
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
    if (!text) return;

    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = 'ja-JP';
    speechSynthesis.speak(uttr);
});

// Initialize
initBoard();
