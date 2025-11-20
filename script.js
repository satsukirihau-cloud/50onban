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

    // Set grid columns based on data length
    boardArea.style.gridTemplateColumns = `repeat(${columns.length}, 1fr)`;

    columns.forEach((col, colIndex) => {
        col.forEach((char, rowIndex) => {
            const btn = document.createElement('div');
            btn.className = 'char-btn';
            btn.textContent = char;

            btn.addEventListener('click', () => {
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
        chip.addEventListener('click', () => {
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

// Event Listeners
clearBtn.addEventListener('click', () => {
    displayText.value = '';
    updateSuggestions();
});

backspaceBtn.addEventListener('click', () => {
    displayText.value = displayText.value.slice(0, -1);
    updateSuggestions();
});

speakBtn.addEventListener('click', () => {
    const text = displayText.value;
    if (!text) return;

    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = 'ja-JP';
    speechSynthesis.speak(uttr);
});

// Initialize
initBoard();
