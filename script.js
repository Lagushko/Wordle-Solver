document.addEventListener("DOMContentLoaded", function() {
    const gridContainer = document.querySelector(".grid");
    const lettersInput = document.querySelector(".input-box");
    const grid = document.querySelector(".grid");

    let allRows = 6;
    const colors = ["rgb(211, 211, 211)", "rgb(231, 205, 90)", "rgb(91, 221, 91)"];

    let darkMode = false;
    const lightModeSettings = {
        true: [
            "rgb(40, 43, 48)",
            "dark-filter",
            "2.5px 2.5px 0px black",
            "rgb(117, 155, 212)",
            "rgb(255, 255, 255)",
            "rgb(69, 73, 80)",
            "invert(0.8)",
            "invert(1)"
        ],
        false: [
            "#dde9ff",
            "light-filter",
            "2.5px 2.5px 0px white",
            "#486bac",
            "rgb(0, 0, 0)",
            "rgb(255, 255, 255)",
            "invert(0.2)",
            "invert(0)"
        ],
    }

    const dictionariesData = {};
    const dictionariesLinks = {
        "English": "https://drive.google.com/uc?export=download&id=1jcGhip9aYhaWIXrdlrrt8LTbTDBZJjkN",
        "Russian": "https://drive.google.com/uc?export=download&id=1SGMM6Y9wIysTDyegI-tMKcX1YceFjHyh",
        "Ukrainian": "https://drive.google.com/uc?export=download&id=1b_RNL61B1qLXzsw6aap1xc-Jr032me8D",
        "Spanish": "https://drive.google.com/uc?export=download&id=1HSWutzlfovv4iOaQKrQv0RNk1t2if1Il",
        "French": "https://drive.google.com/uc?export=download&id=1_EeOJwmreVKfWPY7VYd15-uQvbR0gW1l"
    };

    const bestSymbolsTable = {
        "English": "ETAOINSHRDLCUMWFGYPBVKJXQZ",
        "Russian": "ОЕФИНТСРВЛКМДПУЯЫЬГЗБЧЙХЖШЮЦЩЭФЪЁ",
        "Ukrainian": "ОЕНАІТРЛСВКМДПЯГЗУЧЇЙБХЖШЄЮЦФЩЬҐ",
        "Spanish": "EAOSRNIDLCTUMPBGVYQHFZJÑXKW",
        "French": "ESAITNRULODCMPVQFBGHJXYKZ",
        "German": "ENIRSATDHLUGCOBMFZKWVJYPXQ",
        "Italian": "EAIONLRTSCMPVDGBFUHZQXYJKW",
        "Portuguese": "AEOSRIDMUNTCLVPBFHGQJXZKYW",
        "Polish": "AEONWSZICLRDUMPTYKGJBHFVQX",
        "Turkish": "AEİNRLOKMTUDYŞGZBCÇSHPVFJÖÜ",
        "Dutch": "ENITRAOSHDLGUKMPBVWCFJYZXQ",
        "Swedish": "EANTRSLDOKMGVFHBPUYCJÅÄÖXQZ",
        "Hungarian": "EAOTINRSKLDMVGBFUHJYPZCÖÜŐÁÉÍŰ",
        "Unknown": ";*&$+!?>%<\\'-.=/:",
    };

    let currentSearch = [];



    function generateGrid(width = 5, columnsChange = false) {
        const existingValues = columnsChange ? [] : Array.from(gridContainer.querySelectorAll("input"))
            .map(input => input.value);
        const existingColors = columnsChange ? [] : Array.from(gridContainer.querySelectorAll(".cell"))
            .map(cell => cell.style.backgroundColor);

        gridContainer.innerHTML = "";
        gridContainer.style.gridTemplateColumns = `repeat(${width}, 1fr)`;

        const totalCells = width * allRows;
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.style.backgroundColor = existingColors[i] || lightModeSettings[darkMode][5];

            const input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("maxlength", "1");
            input.value = existingValues[i] || "";
            input.disabled = true;

            if (input.value.trim() !== "") {
                addColorChanger(cell);
            }

            input.addEventListener("input", (e) => {
                if (i < width*11) {
                    e.target.value = e.target.value.toUpperCase();
                    cell.style.backgroundColor = colors[0];
                    updateInputStates();
                    if (allRows < 12) checkAndAddRow(width);

                    const inputs = Array.from(gridContainer.querySelectorAll("input"));
                    if (i < inputs.length - 1) {
                        inputs[i + 1].focus();
                    }

                    if (!cell.querySelector(".color-changer")) {
                        addColorChanger(cell);
                    }
                }
                else {
                    e.target.value = ""
                }
            });

            input.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && !e.target.value && i > 0) {
                    let prevInput = gridContainer.querySelectorAll("input")[i - 1];
                    prevInput.value = "";
                    prevInput.focus();
                    const prevCell = gridContainer.querySelectorAll(".cell")[i - 1];
                    prevCell.style.backgroundColor = lightModeSettings[darkMode][5];
                    const colorChangerToRemove = prevCell.querySelector(".color-changer");
                    if (colorChangerToRemove) {
                        prevCell.removeChild(colorChangerToRemove);
                    }
                    updateInputStates();
                }
                checkAndRemoveRow(width);

                const inputs = Array.from(gridContainer.querySelectorAll("input"));
                if (e.key === "Backspace" && i > 0 && e.target.value) {
                    inputs[i].value = "";
                    const currentColorChanger = cell.querySelector(".color-changer");
                    if (currentColorChanger) {
                        cell.removeChild(currentColorChanger);
                    }
                } else if (e.key === "Backspace" && i > 0 && !e.target.value) {
                    inputs[i - 1].focus();
                }
            });

            cell.appendChild(input);
            gridContainer.appendChild(cell);
        }
        updateInputStates();

        let x = calculateX(width);
        applyStyles(x);
    }
    function addColorChanger(cell) {
        const colorChanger = document.createElement("div");
        colorChanger.classList.add("color-changer");
        colorChanger.addEventListener("click", () => {
            let currentColorIndex = colors.indexOf(cell.style.backgroundColor);
            let nextColorIndex = (currentColorIndex + 1) % colors.length;
            cell.style.backgroundColor = colors[nextColorIndex];
        });
        cell.appendChild(colorChanger);

        colorChanger.style.zIndex = 2
    }
    function updateInputStates() {
        const inputs = Array.from(gridContainer.querySelectorAll("input"));

        document.querySelectorAll(".cell-indicator").forEach(el => el.remove());

        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
        }

        for (let i = 0; i < inputs.length; i++) {
            if (i === 0 || inputs[i - 1].value) {
                if (!inputs[i].value) {
                    inputs[i].disabled = false;
                    inputs[i].focus();

                    let parent = inputs[i].parentElement;
                    let indicator = document.createElement("div");
                    indicator.classList.add("cell-indicator");
                    indicator.style.backgroundColor = lightModeSettings[darkMode][0];
                    parent.appendChild(indicator);

                    break;
                }
            }
        }
    }
    function checkAndAddRow(width) {
        const lastRowInputs = Array.from(gridContainer.querySelectorAll(".cell input")).slice(-width);
        if (lastRowInputs.some(input => input.value !== "")) {
            allRows++;
            generateGrid(width);
        }
    }
    function checkAndRemoveRow(width) {
        if (allRows <= 6) return;
        const secondLastRowInputs = Array.from(gridContainer.querySelectorAll(".cell input")).slice(-(2 * width), -width);
        if (secondLastRowInputs.every(input => input.value === "")) {
            allRows--;
            generateGrid(width);
        }
    }
    function calculateX(value) {
        let width = window.innerWidth;
        let x = 62.5;
        while (x * value + (x / 10) * (value + 1) + 18.75 * 2 > width) {
            x -= 0.1;
            x = Math.round(x * 10) / 10;
        }
        return x;
    }
    function applyStyles(x) {
        document.querySelectorAll(".cell").forEach(cell => {
            cell.style.width = `${x}px`;
            cell.style.height = `${x}px`;
            cell.style.borderRadius = `${x / 10}px`;
            cell.style.fontSize = `${x * 0.48}px`;
        });
        
        document.querySelectorAll(".cell input").forEach(input => {
            input.style.fontSize = `${x * 0.48}px`;
        });
        
        if (grid) {
            grid.style.gap = `${x / 10}px`;
        }
    }

    lettersInput.addEventListener("input", () => {
        let value = parseInt(lettersInput.value);
        if (isNaN(value) || value < 1) {
            value = 5;
        }
        allRows = 6;
        generateGrid(value, true);
    });
    window.addEventListener("resize", () => {
        let value = parseInt(lettersInput.value) || 5;
        let x = calculateX(value);
        applyStyles(x);
    });
    document.querySelector(".clear-btn").addEventListener("click", () => {
        document.querySelector(".download-btn").style.opacity = 0;

        document.querySelectorAll(".cell").forEach(cell => {
            cell.style.backgroundColor = lightModeSettings[darkMode][5];
            cell.querySelector("input").value = "";
            const colorChangerToRemove = cell.querySelector(".color-changer");
            if (colorChangerToRemove) {
                cell.removeChild(colorChangerToRemove);
            }
        });
        allRows = 6;
        currentSearch = [];
        generateGrid(parseInt(lettersInput.value) || 5);

        const resultsContainer = document.querySelector(".results");
        resultsContainer.innerHTML = "";
        document.querySelector(".results-header p").textContent = "Found words (0):";
    });



    async function loadAllDictionaries() {
        const promises = Object.entries(dictionariesLinks).map(async ([language, url]) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to load ${language} dictionary`);
                const text = await response.text();
                dictionariesData[language] = text.split("\n").map(word => word.trim().toUpperCase());
            } catch (error) {
                console.error(`Error loading ${language} dictionary:`, error);
                dictionariesData[language] = [];
            }
        });

        await Promise.all(promises);
        console.log("All dictionaries loaded:", dictionariesData);
    }
    async function loadDictionary(language) {
        const filePath = `dictionaries/${language}.txt`;
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error("Dictionary file not found");
            const text = await response.text();

            return text.split("\n").map(word => word.trim().toUpperCase());
        } catch (error) {
            console.error("Error loading dictionary:", error);
            return [];
        }
    }
    function getGridWords() {
        const gridCells = document.querySelectorAll(".cell");
        const letters = parseInt(document.querySelector(".input-box").value) || 5;
        const gridData = [];

        for (let row = 0; row < allRows; row++) {
            const wordData = [];

            for (let col = 0; col < letters; col++) {
                const index = row * letters + col;
                const inputElement = gridCells[index].querySelector("input");
                const letter = inputElement.value || "";
                const color = gridCells[index].style.backgroundColor;

                wordData.push([letter, color]);
            }
            gridData.push(wordData);
        }

        return gridData;
    }
    function findBestWords(variants, language) {
        const bestSymbols = bestSymbolsTable[language];

        let best = Array(5).fill(null).map(() => [Infinity, -Infinity, null]);

        for (const word of variants) {
            const uniqueChars = new Set(word).size;
            const indexSum = [...word].reduce((sum, char) => sum + bestSymbols.indexOf(char), 0);

            const candidate = [indexSum, uniqueChars, word];

            for (let i = 0; i < best.length; i++) {
                if (
                    uniqueChars > best[i][1] ||
                    (uniqueChars === best[i][1] && indexSum < best[i][0])
                ) {
                    if (!best.some(item => item && item[2] === candidate[2])) {
                        best.splice(i, 0, candidate);
                        best.pop();
                        break;
                    }
                }
            }
        }

        const top = best.map(([_, __, word]) => word).filter(Boolean);
        console.log(top);
        return top;
    }
    async function solve(gridWords, wordLength, limit=true) {
        const language = document.querySelector(".dropdown").value;
        const dictionary = await loadDictionary(language);
        const whiteLetters = new Set();
        const validWords = [];

        gridWords.forEach(letters => {
            letters.forEach(([symbol, color]) => {
                if (color === colors[0]) whiteLetters.add(symbol);
            });
        });

        for (let word of dictionary.filter(w => w.length === wordLength)) {
            let valid = true;
            let wordChars = word.split("");
        
            for (let letters of gridWords) {
                let tempChars = [...wordChars];
        
                for (let [num, [symbol, color]] of letters.entries()) {
                    if (color === colors[0]) {
                        if (tempChars.includes(symbol)) {
                            valid = false;
                            break;
                        }
                    } else if (color === colors[1]) {
                        let index = tempChars.indexOf(symbol);
                        if (index === -1 || word[num] === symbol) {
                            valid = false;
                            break;
                        }
                        tempChars.splice(index, 1);
                    } else if (color === colors[2]) {
                        if (word[num] !== symbol) {
                            valid = false;
                            break;
                        }
                    }
                }
                if (!valid) break;
            }
        
            if (valid) {
                validWords.push(word);
                if (validWords.length >= 1000 && limit) break;
            }
        }

        const bestWords = findBestWords(validWords, language);

        return { validWords, bestWords };
    }
    function getEvenlyDistributedWords(words, totalWords = 1000) {
        if (words.length <= totalWords) {
            return words;
        }

        const firstWords = words.slice(0, 5);
        const remainingWords = words.slice(5);
    
        const step = Math.floor(remainingWords.length / (totalWords - 5));
        
        const distributedWords = [];
        for (let i = 0; i < totalWords - 5; i++) {
            distributedWords.push(remainingWords[i * step]);
        }
    
        return firstWords.concat(distributedWords);
    }
    function animateWordCount(targetCount, duration = 500) {
        const label = document.querySelector(".results-header p");
        let startTime = performance.now();

        function updateCount(currentTime) {
            let elapsedTime = currentTime - startTime;
            let progress = Math.min(elapsedTime / duration, 1);

            let value = Math.floor(targetCount * Math.sqrt(progress));
            label.textContent = `Found words (${value ? value : 0}):`;

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                label.textContent = `Found words (${targetCount ? targetCount : 0}):`;
            }
        }

        requestAnimationFrame(updateCount);
    }
    function addWordToResults(word, isBest = false, index = 0) {
        const resultsContainer = document.querySelector(".results");

        const wordElement = document.createElement("span");
        wordElement.textContent = word;
        wordElement.classList.add("word");

        wordElement.style.backgroundColor = isBest ? "#2773FF" : "#FF8C00";

        if (index < 100) {
            wordElement.style.opacity = "0";
            resultsContainer.appendChild(wordElement);

            setTimeout(() => {
                wordElement.style.opacity = "1";
            }, Math.min(2000, 100 + index * 5));
        } else {
            wordElement.style.opacity = "1";
            resultsContainer.appendChild(wordElement);
        }
    }

    document.querySelector(".search-btn").addEventListener("click", async () => {
        const gridWords = getGridWords();
        const wordLength = parseInt(document.querySelector(".input-box").value) || 5;

        const { validWords, bestWords } = await solve(gridWords, wordLength, limit=false);
        currentSearch = [
            ...bestWords,
            ...validWords.filter(word => !bestWords.includes(word))
        ];

        if (currentSearch.length > 0) {
            document.querySelector(".download-btn").style.opacity = 1;
        } else {
            document.querySelector(".download-btn").style.opacity = 0;
        }

        const displayWords = getEvenlyDistributedWords(currentSearch);

        const resultsContainer = document.querySelector(".results");
        resultsContainer.scrollTop = 0;
        resultsContainer.innerHTML = "";

        displayWords.forEach((word, i) => 
            addWordToResults(word, bestWords.includes(word), i)
        );

        setTimeout(() => animateWordCount(displayWords.length, 500), 50);
    });
    document.querySelector(".download-btn").addEventListener("click", () => {
        if (currentSearch.length > 0) {
            let fileContent = currentSearch.join("\n");
            let blob = new Blob([fileContent], { type: "text/plain" });
            let link = document.createElement("a");

            link.href = URL.createObjectURL(blob);
            link.download = "words.txt";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            currentSearch = [];
            document.querySelector(".download-btn").style.opacity = 0;
        }
    });



    document.querySelector(".light-btn").addEventListener("click", () => {
        darkMode = !darkMode;

        document.querySelector("body").style.backgroundColor = lightModeSettings[darkMode][0];
        document.querySelectorAll(".icon-buttons img").forEach(function (btn) {
            btn.classList.remove(darkMode ? "light-filter" : "dark-filter");
            btn.classList.add(lightModeSettings[darkMode][1]);
            btn.addEventListener('mouseenter', () => {
                btn.style.filter = lightModeSettings[darkMode][6];
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.filter = '';
            });
        });
        document.querySelector(".info-menu-content").style.backgroundColor = lightModeSettings[darkMode][0];
        document.querySelector(".info-menu-content").style.color = lightModeSettings[darkMode][4];
        document.querySelector(".title").style.textShadow = lightModeSettings[darkMode][2];
        document.querySelector(".instructions").style.color = lightModeSettings[darkMode][3];
        document.querySelectorAll(".settings label").forEach(function(label) {
            label.style.color = lightModeSettings[darkMode][4];
        });
        document.querySelector(".dropdown").style.backgroundColor = lightModeSettings[darkMode][5];
        document.querySelector(".input-box").style.backgroundColor = lightModeSettings[darkMode][5];
        document.querySelector(".dropdown").style.color = lightModeSettings[darkMode][4];
        document.querySelector(".input-box").style.color = lightModeSettings[darkMode][4];
        document.querySelectorAll(".cell").forEach(function(cell) {
            if (!colors.includes(cell.style.backgroundColor)) {
                cell.style.backgroundColor = lightModeSettings[darkMode][5];
            }
        });
        document.querySelector(".cell-indicator").style.backgroundColor = lightModeSettings[darkMode][0];
        document.querySelector(".results-header p").style.color = lightModeSettings[darkMode][4];
        document.querySelector(".results").style.backgroundColor = lightModeSettings[darkMode][5];
        document.querySelector(".copy-mark").style.color = lightModeSettings[darkMode][4];

        // document.querySelector(".light-btn").style.filter = lightModeSettings[darkMode][6];
        // document.querySelector(".light-btn").addEventListener('mouseleave', () => {
        //     btn.style.filter = lightModeSettings[!darkMode][7];
        // });
    });
    document.querySelector('.info-btn').addEventListener("click", () => {
        const menu = document.querySelector('.info-menu');
        menu.classList.add('show');
    });
    
    document.querySelector('.info-close-btn').addEventListener("click", () => {
        const menu = document.querySelector('.info-menu');
        menu.classList.remove('show');
    });



    // function resizeText() {
    //     const menu = document.querySelector('.info-menu-content');
    //     const instructions = document.querySelector('.instructions');
    
    //     const menuWidth = menu.clientWidth;
    //     const menuHeight = menu.clientHeight;
    
    //     let fontSize = Math.min(menuWidth / 30, menuHeight / 30);

    //     fontSize = Math.max(6, Math.min(fontSize, 20));
    
    //     instructions.style.fontSize = fontSize + 'px';
    // }

    // window.addEventListener('resize', resizeText);
    // window.addEventListener('load', resizeText);
    
    
    // loadAllDictionaries();

    generateGrid(5);

    document.querySelector(".current-year").textContent = new Date().getFullYear();
});