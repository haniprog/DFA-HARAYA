/* ===== CONSTANTS ===== */
const NEGATIONS = ["not", "didnt", "didn't", "never", "no"];
const PHYSICAL_ACTIONS = [
    "touch","touched","hit","hitten","punch","punched","slap","slapped",
    "kick","kicked","push","pushed","pull","pulled","grab","grabbed",
    "choke","choked","assault","assaulted","block","blocked",
    "hawakan","pahipo","sinapak","sinuntok"
];
const VERBAL_ACTIONS = [
    "follow","followed","stare","staring","stared","catcall","catcalled",
    "whistle","whistled","approach","approached","comment","commented",
    "harass","harassed"
];
const FEAR_WORDS = [
    "scared","afraid","uncomfortable","unsafe","anxious","terrified",
    "nervous","panic","panicked"
];

/* ===== PREPROCESSOR ===== */
function preprocessInput(text) {
    const rawTokens = text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/);

    let tokens = [];

    for (let i = 0; i < rawTokens.length; i++) {
        const word = rawTokens[i];
        // Skip physical actions if negated
        if (
            PHYSICAL_ACTIONS.includes(word) &&
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
        if (PHYSICAL_ACTIONS.includes(word)) flags.physical = true;
        if (VERBAL_ACTIONS.includes(word)) flags.verbal = true;
        if (FEAR_WORDS.includes(word)) flags.fear = true;
    });
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

/* ===== UI CONNECTION ===== */
document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.querySelector(".analyze-btn");
    const speakBtn = document.querySelector(".speak-btn");
    const clearBtn = document.querySelector(".clear-btn");
    const textarea = document.querySelector("textarea");
    const classificationEl = document.querySelector(".classification");
    const actionList = document.querySelector(".right ul");

    /* --- ANALYZE BUTTON --- */
    analyzeBtn.addEventListener("click", () => {
        processInput(textarea.value);
    });

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

    /* --- CLEAR BUTTON --- */
    clearBtn.addEventListener("click", () => {
        textarea.value = "";
        classificationEl.innerText = "System Response will appear here";
        actionList.innerHTML = "";
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