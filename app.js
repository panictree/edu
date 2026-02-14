// -----------------------------
// Utilities
// -----------------------------

const NumberService = {
    toWords(n) {
        return window.numberToWords?.toWords(n) ?? String(n);
    }
};

function createEmptyApp() {
    return {
        ui: null,
        question: '',
        answer: {}
    };
}

// -----------------------------
// Time Logic
// -----------------------------

const TimeLogic = {
    hourWords: ["una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce"],

    minuteWords: [
        "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
        "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte",
        "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve",
        "treinta", "treinta y uno", "treinta y dos", "treinta y tres", "treinta y cuatro", "treinta y cinco", "treinta y seis", "treinta y siete", "treinta y ocho", "treinta y nueve",
        "cuarenta", "cuarenta y uno", "cuarenta y dos", "cuarenta y tres", "cuarenta y cuatro", "cuarenta y cinco", "cuarenta y seis", "cuarenta y siete", "cuarenta y ocho", "cuarenta y nueve",
        "cincuenta", "cincuenta y uno", "cincuenta y dos", "cincuenta y tres", "cincuenta y cuatro", "cincuenta y cinco", "cincuenta y seis", "cincuenta y siete", "cincuenta y ocho", "cincuenta y nueve"
    ],

    getEnglish(h, m) {
        const nextH = (h % 12) + 1;
        const toW = (n) => NumberService.toWords(n);
        const fmtM = (mins) => {
            if (mins === 15) return "a quarter";
            if (mins === 30) return "half";
            const word = toW(mins);
            return mins % 5 === 0 ? word : `${word} minutes`;
        };

        if (m === 0) return `${toW(h)} o'clock`;
        return m <= 30
            ? `${fmtM(m)} past ${toW(h)}`
            : `${fmtM(60 - m)} to ${toW(nextH)}`;
    },

    getSpanish(h, m) {
        const nextH = (h % 12) + 1;
        const getHStr = (val) => (val === 1 ? "la una" : `las ${this.hourWords[val - 1]}`);

        if (m === 0) return `${getHStr(h)} en punto`;
        if (m === 15) return `${getHStr(h)} y cuarto`;
        if (m === 30) return `${getHStr(h)} y media`;
        if (m === 45) return `${getHStr(nextH)} menos cuarto`;

        return m < 30
            ? `${getHStr(h)} y ${this.minuteWords[m]}`
            : `${getHStr(nextH)} menos ${this.minuteWords[60 - m]}`;
    }
};

// -----------------------------
// Modules
// -----------------------------

const Modules = {
    multiplication: {
        label: 'Multiplication',
        generate() {
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 10) + 1;

            return {
                ui: 'text',
                question: `${a} × ${b}`,
                answer: { value: a * b }
            };
        }
    },

    numbers: {
        label: 'Numbers Practice',
        generate() {
            const n = Math.floor(Math.random() * 101);

            return {
                ui: 'text',
                question: n,
                answer: { value: NumberService.toWords(n) }
            };
        }
    },

    clock: {
        label: 'Telling Time',
        generate() {
            const h = Math.floor(Math.random() * 12) + 1;
            const m = Math.floor(Math.random() * 60);

            return {
                ui: 'clock',
                hAngle: (h * 30) + (m * 0.5),
                mAngle: m * 6,
                question: '',
                answer: {
                    en: TimeLogic.getEnglish(h, m),
                    es: TimeLogic.getSpanish(h, m)
                }
            };
        }
    }
};

// -----------------------------
// App Shell
// -----------------------------

function AppShell() {
    return {
        currentModule: null,
        currentApp: createEmptyApp(),
        revealed: false,
        menuOpen: false,
        search: '',

        get modulesList() {
            return Object.entries(Modules).map(([id, m]) => ({
                id,
                label: m.label
            }));
        },

        get filteredModules() {
            return this.modulesList.filter(m =>
                m.label.toLowerCase().includes(this.search.toLowerCase())
            );
        },

        get currentLabel() {
            if (!this.currentModule) return 'Select Module';
            return Modules[this.currentModule]?.label ?? 'Select Module';
        },

        handleClickOutside() {
            if (this.menuOpen) {
                this.menuOpen = false;
                this.search = '';
            }
        },

        selectModule(id) {
            if (!Modules[id]) return;

            this.currentModule = id;
            this.menuOpen = false;
            this.search = '';
            this.next();
        },

        darkMode: false,

        toggleTheme() {
            this.darkMode = !this.darkMode;
            document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
        },

        next() {
            this.revealed = false;

            const module = Modules[this.currentModule];
            if (!module) {
                console.warn(`Unknown module: ${this.currentModule}`);
                this.currentApp = createEmptyApp();
                return;
            }

            try {
                this.currentApp = module.generate();
            } catch (e) {
                console.error('Generator failed:', e);
                this.currentApp = createEmptyApp();
            }
        }
    };
}

PetiteVue.createApp({ AppShell }).mount();