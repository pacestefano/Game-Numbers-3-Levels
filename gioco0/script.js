import { calculateMinMoves } from './minMovesCalculator.js';

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('gameBoard');
    const timerBar = document.getElementById('timerBar');
    const timerText = document.getElementById('timerText');
    const minMovesContainer = document.getElementById('minMovesContainer');
    const movesContainer = document.getElementById('movesContainer');
    const minMovesCounter = document.getElementById('minMovesCounter');
    const movesCounter = document.getElementById('movesCounter');
    const message = document.getElementById('message');
    const summary = document.getElementById('summary');
    const instructions = document.getElementById('instructions');
    const nextGameButton = document.getElementById('nextGameButton');
    const retryButton = document.getElementById('retryButton');
    const timeoutMessage = document.getElementById('timeoutMessage');
    const moveSound = document.getElementById('moveSound');
    const winSound = document.getElementById('winSound');
    const undoButton = document.getElementById('undoButton');
    const burgerMenu = document.getElementById('burgerMenu');
    const menuOptions = document.getElementById('menuOptions');
    const levelDisplay = document.getElementById('levelDisplay');

    let moveCount = 0;
    let timerInterval;
    let gameIndex = 0;
    let gamesData = [];
    let timerStarted = false;
    let draggedElement = null;
    let totalMoves;
    let moveHistory = [];
    let gameOver = false;
    let currentLevel = 'Base';

    const MAX_GAMES = 3;

    burgerMenu.addEventListener('click', () => {
        menuOptions.style.display = menuOptions.style.display === 'block' ? 'none' : 'block';
    });

    window.setLevel = function setLevel(level) {
        currentLevel = level;
        levelDisplay.textContent = `Livello: ${level}`;
        updateLevelColor(level);
        menuOptions.style.display = 'none';
        resetTimer();
        startGame();
    };

    function updateLevelColor(level) {
        switch (level) {
            case 'Medio':
                levelDisplay.style.color = 'orange';
                break;
            case 'Avanzato':
                levelDisplay.style.color = 'red';
                break;
            case 'Base':
            default:
                levelDisplay.style.color = 'black';
                break;
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        switch (currentLevel) {
            case 'Medio':
                timerText.textContent = '240 secondi';
                timerBar.style.width = '100%';
                break;
            case 'Avanzato':
                timerText.textContent = '120 secondi';
                timerBar.style.width = '100%';
                break;
            case 'Base':
            default:
                timerText.textContent = 'Nessun limite di tempo massimo';
                timerBar.style.width = '100%';
                break;
        }
    }

    function startGame() {
        moveCount = 0;
        moveHistory = [];
        gameOver = false;
        if (message) message.textContent = '';
        if (timeoutMessage) timeoutMessage.style.display = 'none';
        if (retryButton) retryButton.style.display = 'none';
        if (summary) summary.textContent = '';
        if (nextGameButton) nextGameButton.style.display = 'none';
        if (board) {
            board.innerHTML = '';
            board.classList.remove('win-animation');
        }
        if (timerText) timerText.textContent = '120 secondi';
        if (timerBar) timerBar.style.width = '100%';
        if (movesContainer) movesContainer.innerHTML = '';
        if (minMovesContainer) minMovesContainer.innerHTML = '';
        if (movesCounter) movesCounter.textContent = '0';
        if (minMovesCounter) minMovesCounter.textContent = '0';

        if (undoButton) {
            undoButton.classList.remove('active');
            undoButton.style.backgroundColor = '#d3d3d3';
            undoButton.style.cursor = 'not-allowed';
        }

        // Step 1: Generate solved puzzle with text coloring
        let solution = generateSolvedPuzzle();
        console.log("Generated solution: ", solution);
        let coloredCells = assignTextColorsToCells(solution);
        console.log("Colored cells before shuffle: ", coloredCells);

        // Step 2: Shuffle the numbers maintaining the text color
        let shuffledCells = shuffle(coloredCells);
        console.log("Shuffled cells: ", shuffledCells);

        const minMoves = getMinMovesForLevel(currentLevel);
        if (minMovesCounter) minMovesCounter.textContent = minMoves;
        totalMoves = minMoves;
        for (let i = 0; i < minMoves; i++) {
            let circle = document.createElement('div');
            circle.classList.add('circle', 'min-moves');
            minMovesContainer.appendChild(circle);
        }

        // Create the cells on the board with their text colors
        for (let i = 0; i < 3; i++) {
            createCell(shuffledCells[i * 3].number, shuffledCells[i * 3].color);
            createOperator("+");
            createCell(shuffledCells[i * 3 + 1].number, shuffledCells[i * 3 + 1].color);
            createOperator("=");
            createCell(shuffledCells[i * 3 + 2].number, shuffledCells[i * 3 + 2].color);
        }

        if (currentLevel !== 'Base') {
            startTimer();
        } else {
            timerText.textContent = 'Nessun limite di tempo massimo';
            timerBar.style.width = '100%';
        }
    }

    function generateSolvedPuzzle() {
        let numbers = [];
        while (numbers.length < 9) {
            let A = Math.floor(Math.random() * 9) + 1;
            let B = Math.floor(Math.random() * 9) + 1;
            let C = A + B;
            if (C <= 9) {
                numbers.push(A, B, C);
            }
        }
        console.log("Generated numbers for solved puzzle: ", numbers);
        return numbers.slice(0, 9);
    }

    function assignTextColorsToCells(numbers) {
        let colors = ['red', 'blue', 'green'];
        let coloredCells = [];
        for (let i = 0; i < 3; i++) {
            let color = colors[i];
            coloredCells.push({ number: numbers[i * 3], color: color });
            coloredCells.push({ number: numbers[i * 3 + 1], color: color });
            coloredCells.push({ number: numbers[i * 3 + 2], color: color });
        }
        console.log("Assigned colors to cells: ", coloredCells);
        return coloredCells;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        console.log("Shuffled array: ", array);
        return array;
    }

    function createCell(num, color) {
        let cell = document.createElement('div');
        cell.classList.add('cell');
        cell.textContent = num;
        cell.style.color = color;
        cell.draggable = true;
        cell.dataset.index = board.childElementCount;
        cell.addEventListener('dragstart', dragStart);
        cell.addEventListener('dragover', dragOver);
        cell.addEventListener('dragleave', dragLeave);
        cell.addEventListener('drop', drop);
        cell.addEventListener('touchstart', touchStart, { passive: false });
        cell.addEventListener('touchmove', touchMove, { passive: false });
        cell.addEventListener('touchend', touchEnd, { passive: false });
        if (board) board.appendChild(cell);
    }

    function createOperator(symbol) {
        let operator = document.createElement('div');
        operator.classList.add('operator');
        operator.textContent = symbol;
        if (board) board.appendChild(operator);
    }

    function dragStart(e) {
        if (gameOver) return;
        e.dataTransfer.setData('text/plain', e.target.dataset.index);
        e.target.classList.add('dragging');
        if (!timerStarted) {
            timerStarted = true;
        }

        if (undoButton) {
            undoButton.classList.add('active');
            undoButton.style.backgroundColor = '#4caf50';
            undoButton.style.cursor = 'pointer';
        }
    }

    function dragOver(e) {
        e.preventDefault();
        if (gameOver) return;
        e.target.classList.add('drop-target');
    }

    function dragLeave(e) {
        e.target.classList.remove('drop-target');
    }

    function drop(e) {
        e.preventDefault();
        if (gameOver) return;
        e.target.classList.remove('drop-target');
        const sourceIndex = e.dataTransfer.getData('text/plain');
        const target = e.target;
        if (target.classList.contains('cell')) {
            const targetIndex = target.dataset.index;
            const sourceCell = document.querySelector(`.cell[data-index='${sourceIndex}']`);

            saveMoveState();

            [sourceCell.textContent, target.textContent] = [target.textContent, sourceCell.textContent];
            [sourceCell.style.color, target.style.color] = [target.style.color, sourceCell.style.color];

            moveCount++;
            movesCounter.textContent = moveCount;
            let circle = document.createElement('div');
            circle.classList.add('circle', 'moves');
            if (moveCount > totalMoves) {
                circle.style.backgroundColor = 'red';
            }
            movesContainer.appendChild(circle);

            sourceCell.classList.remove('dragging');

            moveSound.play();
        }
        checkWin();
    }

    function touchStart(e) {
        if (gameOver) return;
        if (!timerStarted) {
            timerStarted = true;
        }
        const touch = e.touches[0];
        draggedElement = e.target;
        draggedElement.classList.add('dragging');
        draggedElement.dataset.draggingIndex = draggedElement.dataset.index;
        e.preventDefault();

        if (undoButton) {
            undoButton.classList.add('active');
            undoButton.style.backgroundColor = '#4caf50';
            undoButton.style.cursor = 'pointer';
        }
    }

    function touchMove(e) {
        e.preventDefault();
        if (gameOver) return;
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains('cell') && target !== draggedElement) {
            target.classList.add('drop-target');
        }
    }

    function touchEnd(e) {
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (gameOver) return;
        if (draggedElement && target && target.classList.contains('cell')) {
            if (target !== draggedElement) {
                const targetIndex = target.dataset.index;
                const sourceIndex = draggedElement.dataset.draggingIndex;
                const sourceCell = document.querySelector(`.cell[data-index='${sourceIndex}']`);

                saveMoveState();

                [sourceCell.textContent, target.textContent] = [target.textContent, sourceCell.textContent];
                [sourceCell.style.color, target.style.color] = [target.style.color, sourceCell.style.color];

                draggedElement.classList.remove('dragging');
                draggedElement.removeAttribute('data-dragging-index');

                moveCount++;
                movesCounter.textContent = moveCount;
                let circle = document.createElement('div');
                circle.classList.add('circle', 'moves');
                if (moveCount > totalMoves) {
                    circle.style.backgroundColor = 'red';
                }
                movesContainer.appendChild(circle);

                target.classList.remove('drop-target');

                moveSound.play();

                checkWin();
            }
        }
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
            draggedElement.removeAttribute('data-dragging-index');
            draggedElement = null;
        }
        document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
        e.preventDefault();
    }

    function saveMoveState() {
        const cells = Array.from(document.querySelectorAll('.cell')).map(cell => cell.textContent);
        const colors = Array.from(document.querySelectorAll('.cell')).map(cell => cell.style.color);
        moveHistory.push({ cells, colors, moveCount });
    }

    window.undoMove = function undoMove() {
        if (moveHistory.length === 0) return;

        const lastState = moveHistory.pop();
        const cells = document.querySelectorAll('.cell');
        lastState.cells.forEach((value, index) => {
            cells[index].textContent = value;
            cells[index].style.color = lastState.colors[index];
        });

        moveCount = lastState.moveCount;
        movesCounter.textContent = moveCount;

        if (movesContainer.lastChild) {
            movesContainer.removeChild(movesContainer.lastChild);
        }

        if (moveCount <= totalMoves) {
            movesContainer.querySelectorAll('.circle.moves').forEach(circle => {
                circle.style.backgroundColor = '#ffeb3b';
            });
        }

        checkWin(true);

        if (message && moveCount <= totalMoves) {
            message.textContent = '';
            gameOver = false;
        }
    }

    function checkWin(isUndo = false) {
        const cells = document.querySelectorAll('.cell');
        const values = Array.from(cells).map(cell => parseInt(cell.textContent));

        let correct = true;
        for (let i = 0; i < 3; i++) {
            const cell1 = cells[i * 3];
            const cell2 = cells[i * 3 + 1];
            const cell3 = cells[i * 3 + 2];

            if (values[i * 3] + values[i * 3 + 1] === values[i * 3 + 2]) {
                cell1.classList.add('correct');
                cell2.classList.add('correct');
                cell3.classList.add('correct');
            } else {
                cell1.classList.remove('correct');
                cell2.classList.remove('correct');
                cell3.classList.remove('correct');
                correct = false;
            }
        }

        if (correct && !isUndo) {
            if (moveCount <= totalMoves) {
                clearInterval(timerInterval);
                if (message) message.textContent = 'Puzzle Risolto';
                board.classList.add('win-animation');
                setTimeout(() => {
                    board.classList.remove('win-animation');
                    if (nextGameButton) nextGameButton.style.display = 'block';
                }, 1000);

                winSound.play();

                gamesData.push({
                    minMoves: parseInt(minMovesCounter.textContent),
                    actualMoves: moveCount,
                    timeSpent: 120 - parseInt(timerText.textContent)
                });

                gameIndex++;
                if (gameIndex < MAX_GAMES) {
                    currentLevel = getNextLevel(currentLevel);
                    levelDisplay.textContent = `Livello: ${currentLevel}`;
                    updateLevelColor(currentLevel);
                    setTimeout(startGame, 1000);
                } else {
                    showSummary();
                }
            }
        } else if (!isUndo && moveCount > totalMoves) {
            gameOver = true;
            if (message) message.textContent = 'Numero massimo di mosse superato. Annulla le ultime mosse e riprova.';
        }
    }

    function startTimer() {
        let timeRemaining;

        switch (currentLevel) {
            case 'Medio':
                timeRemaining = 240;
                break;
            case 'Avanzato':
                timeRemaining = 120;
                break;
            default:
                return;
        }

        timerInterval = setInterval(() => {
            timeRemaining--;
            let progress = (timeRemaining / (currentLevel === 'Medio' ? 240 : 120)) * 100;
            if (timerBar) timerBar.style.width = `${progress}%`;
            if (timerText) timerText.textContent = `${timeRemaining} secondi`;

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                if (timeoutMessage) timeoutMessage.style.display = 'block';
                if (retryButton) retryButton.style.display = 'block';
                gameOver = true;
            }
        }, 1000);
    }

    function getMinMovesForLevel(level) {
        switch (level) {
            case 'Medio':
                return 3;
            case 'Avanzato':
                return 2;
            case 'Base':
            default:
                return 4;
        }
    }

    function getNextLevel(currentLevel) {
        switch (currentLevel) {
            case 'Base':
                return 'Medio';
            case 'Medio':
                return 'Avanzato';
            case 'Avanzato':
                return 'Base';
            default:
                return 'Base';
        }
    }

    document.body.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    // Iniziare il gioco con il livello Base e impostare il timer correttamente
    updateLevelColor(currentLevel);
    resetTimer();
    startGame();
});
