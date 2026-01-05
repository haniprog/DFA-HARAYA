/* ===== CONSTANTS ===== */
const NEGATIONS = ["not", "didnt", "didn't", "never", "no", "doesn't", "doesnt"];
const PHYSICAL_ACTIONS = [
    "touch","touched","hit","hits","punch","punched","slap","slapped",
    "kick","kicked","push","pushed","pull","pulled","grab","grabbed",
    "choke","choked","assault","assaulted","block","blocked",
    "hawakan","pahipo","hinipuan","sinapak","sinuntok"
];
const VERBAL_ACTIONS = [
    "follow","followed", "follows", "following", "stare","staring","stared","catcall","catcalled",
    "whistle","whistled", "whistles", "approach", "approaches", "approached","comment","commented",
    "harass","harassed"
];
const FEAR_WORDS = [
    "scared","afraid","uncomfortable","unsafe","anxious","terrified",
    "nervous","panic","panicked"
];

const LEGAL_KEYWORDS = [
    {
        keywords: ["hit", "hits", "slap", "slaps", "punch", "punched", "punches", "push", "pushed", "pushes", "kick", "hurt"],
        category: "Harassment",
        law: "RA 9262 (VAWC)",
        reason: "Physical violence or force against a person constitutes harassment and abuse."
    },
    {
        keywords: ["touch", "touched", "touching", "touches", "grab", "grabs", "grabbed", "hold", "holds", "held", "drag", "drags", "dragged"],
        category: "Harassment",
        law: "RA 11313 (Safe Spaces Act)",
        reason: "Unwanted physical contact is explicitly prohibited in public and private spaces."
    },
    {
        keywords: ["stare", "stares", "staring", "looked", "looks", "looking", "gaze", "gazed", "gazing"],
        category: "Potential Harassment",
        law: "RA 11313",
        reason: "Persistent or unwanted staring can cause discomfort and intimidation."
    },
    {
        keywords: ["follow", "following", "follows", "followed", "trailed"],
        category: "Potential Harassment",
        law: "RA 11313",
        reason: "Being followed in public spaces may indicate threatening behavior."
    },
    {
        keywords: ["uncomfortable", "scared", "afraid", "unsafe"],
        category: "Potential Harassment",
        law: "RA 11313",
        reason: "Victim discomfort is a critical indicator of unsafe interaction."
    }
];

/* ===== PREPROCESSOR ===== */

function extractTriggers(tokens) {
    const triggers = [];

    tokens.forEach(token => {
        LEGAL_KEYWORDS.forEach(entry => {
            if (entry.keywords.includes(token)) {
                triggers.push({
                    word: token,
                    category: entry.category,
                    law: entry.law,
                    reason: entry.reason
                });
            }
        });
    });

    return triggers;
}


function renderExplanation(triggers) {
    const reportList = document.querySelector(".report-list");
    reportList.innerHTML = "";

    if (triggers.length === 0) {
        reportList.innerHTML = "<li>No legally significant indicators detected.</li>";
        return;
    }

    triggers.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>Detected Word:</strong> "${t.word}"<br>
            <strong>Classification:</strong> ${t.category}<br>
            <strong>Legal Basis:</strong> ${t.law}<br>
            <em>${t.reason}</em>
        `;
        reportList.appendChild(li);
    });
}


// Helper: match tokens against action lists and handle simple inflections
function tokenMatchesList(token, list) {
    return list.some(action => token === action || token.startsWith(action));
}

function preprocessInput(text) {
    const rawTokens = text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/);

    let tokens = [];

    for (let i = 0; i < rawTokens.length; i++) {
        const word = rawTokens[i];
        // Skip physical actions if negated (handles inflected forms like "touching")
        if (
            tokenMatchesList(word, PHYSICAL_ACTIONS) &&
            i > 0 &&
            NEGATIONS.includes(rawTokens[i - 1])
        ) continue;
        tokens.push(word);
    }

    return tokens;
}

/* ===== DFA ANALYSIS ===== */
function analyzeTokens(tokens) {
    let flags = { physical: false, verbal: false, fear: false };
    tokens.forEach(word => {
        if (tokenMatchesList(word, PHYSICAL_ACTIONS)) flags.physical = true;
        if (tokenMatchesList(word, VERBAL_ACTIONS)) flags.verbal = true;
        if (tokenMatchesList(word, FEAR_WORDS)) flags.fear = true;
    });
    console.log('analyzeTokens ->', { tokens, flags });
    return flags;
}

/* ===== CLASSIFICATION ===== */
function classify(flags) {
    if (flags.physical) return "🚨 Harassment";
    if (flags.verbal || flags.fear) return "⚠ Potential Harassment";
    return "✅ Safe Interaction";
}

/* ===== RESPONSE SYSTEM ===== */
function getResponse(category) {
    if (category.includes("Harassment")) {
        return {
            actions: [
                "Move to a safe and populated area immediately",
                "Seek help from authorities or security personnel",
                "Contact a trusted person",
                "Document the incident when it is safe"
            ],
            calm:
                "You are not at fault. What happened is serious, and your safety comes first. Take slow breaths and focus on getting help."
        };
    }
    if (category.includes("Potential")) {
        return {
            actions: [
                "Trust your instincts and remain alert",
                "Create distance from the person if possible",
                "Stay near other people or security",
                "Seek help if the behavior continues or escalates"
            ],
            calm:
                "Feeling uncomfortable is valid. You are allowed to prioritize your safety and boundaries."
        };
    }
    return {
        actions: [
            "No immediate threat detected",
            "Remain aware of your surroundings"
        ],
        calm: "You are safe right now. Take a slow breath and ground yourself."
    };
}

/* ===== PAGE NAVIGATION ===== */
function showHome() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const home = document.getElementById('home');
    if (home) home.classList.add('active');
}

function showAbout() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const about = document.getElementById('about');
    if (about) about.classList.add('active');
}

window.showHome = showHome;
window.showAbout = showAbout;

/* ===== UI CONNECTION ===== */
document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.querySelector(".analyze-btn");
    const speakBtn = document.querySelector(".speak-btn");
    const clearBtn = document.querySelector(".clear-btn");
    const aboutBtn = document.querySelector(".about-btn");
    const aboutClose = document.querySelector(".about-close");
    const aboutOverlay = document.querySelector('.about-overlay');
    const textarea = document.querySelector("textarea");
    const classificationEl = document.querySelector(".classification");
    const actionList = document.querySelector(".right ul");
    const reportList = document.querySelector(".report-list");

    // Wire About button
    if (aboutBtn) {
        aboutBtn.addEventListener('click', showAbout);
    }
    if (aboutClose) {
        aboutClose.addEventListener('click', showHome);
    }
    if (aboutOverlay) {
        aboutOverlay.addEventListener('click', (e) => {
            if (e.target === aboutOverlay) showHome();
        });
    }

    /* --- ANALYZE BUTTON --- */
    // Debug helper: log clicks to see where events land
    document.addEventListener('click', (e) => {
        console.log('Document click:', { x: e.clientX, y: e.clientY, target: e.target });
    });

    if (analyzeBtn) {
        analyzeBtn.style.pointerEvents = 'auto';
        analyzeBtn.tabIndex = analyzeBtn.tabIndex || 0;

        analyzeBtn.addEventListener("pointerdown", (e) => {
            console.log('Analyze pointerdown', { target: e.target, elemAtPoint: document.elementFromPoint(e.clientX, e.clientY) });
            analyzeBtn.classList.add('debug-active');
            setTimeout(() => analyzeBtn.classList.remove('debug-active'), 200);
        });

        // Disable analyze button when there's no input; update on textarea changes
        function updateAnalyzeState() {
            const hasText = textarea.value && textarea.value.trim().length > 0;
            analyzeBtn.disabled = !hasText;
            if (hasText) {
                analyzeBtn.classList.remove('disabled');
            } else {
                analyzeBtn.classList.add('disabled');
            }
        }

        // initialize and listen for changes
        updateAnalyzeState();
        textarea.addEventListener('input', updateAnalyzeState);

        analyzeBtn.addEventListener("click", () => {
            const text = textarea.value.trim();
            if (!text) {
            textarea.focus();
            return;
            }

    // Run DFA / main classification
            processInput(text);

    // Tokenize input for explanation panel
            const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];

    // Extract legally significant words
            const triggers = extractTriggers(tokens);

    // Render explanation panel (bottom)
            renderExplanation(triggers);
        });


    } else {
        console.warn("Analyze button not found at DOMContentLoaded; adding delegated handler.");
        document.addEventListener("click", (e) => {
            if (e.target && e.target.matches(".analyze-btn")) {
                console.log('Delegated analyze click');
                processInput(textarea.value);
            }
        });
    }

    /* --- SPEECH-TO-TEXT BUTTON --- */
    speakBtn.addEventListener("click", () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US"; // or "fil-PH" for Tagalog
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textarea.value = transcript;
            processInput(transcript); // auto-analyze after speaking
        };

        recognition.onerror = (event) => {
            alert("Error occurred in speech recognition: " + event.error);
        };

        recognition.start();
    });

    /* --- CLEAR BUTTON --- 
    clearBtn.addEventListener("click", () => {
    textarea.value = "";

    classification.textContent = "No analysis yet.";
    classification.className = "classification";

    actionsList.innerHTML = "";
    actionsList.innerHTML = "<li>No recommendations yet.</li>";

    // CLEAR EXPLANATION PANEL
    const reportList = document.querySelector(".report-list");
    reportList.innerHTML = "<li>No analysis yet.</li>";

    textarea.focus();
}); */

    clearBtn.addEventListener("click", () => {
    // Clear the textarea
    textarea.value = "";

    // Reset classification panel
    classificationEl.textContent = "No analysis yet.";
    classificationEl.className = "classification";

    // Reset recommended actions panel
    actionList.innerHTML = "<li>No recommendations yet.</li>";

    // Reset legal explanation panel
    reportList.innerHTML = "<li>No analysis yet.</li>";

    // Focus back on textarea
    textarea.focus();
});

    /* --- PROCESS INPUT FUNCTION --- */
    function processInput(text) {
        const tokens = preprocessInput(text);
        const flags = analyzeTokens(tokens);
        const category = classify(flags);
        const response = getResponse(category);

        classificationEl.innerText = category;

        actionList.innerHTML = "";
        response.actions.forEach(action => {
            const li = document.createElement("li");
            li.textContent = action;
            actionList.appendChild(li);
        });

        const calm = document.createElement("p");
        calm.style.marginTop = "12px";
        calm.textContent = "💗 " + response.calm;
        actionList.appendChild(calm);
    }
});