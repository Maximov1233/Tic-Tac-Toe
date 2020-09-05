const cells = document.querySelectorAll('.cell'),
    cellsArr = Array.from(cells);

    console.log(cellsArr);


let crossCode = document.createElement('div');
crossCode.className = 'cross';

crossCode.innerHTML = `
    <div class="line"></div>
    <div class="line"></div>
`;

let circleCode = document.createElement('div');
circleCode.className = 'circle';

let move = true;

const checkTwoArrays = (arrPat, arrChck) => {
    for (const item of arrPat) {
        if (arrChck.includes(item)) {
            continue;
        } else {
            return false;
        }
    }
    return true;
};

const winCheck = (arr) => {
    const wins = [
        [0, 3, 6], // left straight

        [0, 1, 2], // top straight

        [2, 5, 8], // right straight
        
        [6, 7, 8], // bottom straight

        [0, 4, 8], // diagonal lefty

        [2, 4, 6], // diagonal righty

        [3, 4, 5], // horizontal straight

        [2, 5, 7], // vertical straight
    ];

    for (const win of wins) {
        if (checkTwoArrays(win, arr)) {
            return true;
        }
    }

    return false;
};

const win = () => {
    let takenCrossCells = [],
        takenCircleCells = [];
    for (const cell of cellsArr) {
        if (cell.children[0]) {
            const index = cellsArr.indexOf(cell);
            console.log(index);
            if (cell.children[0].classList.contains('cross')) {
                takenCrossCells.push(index);
            } else {
                takenCircleCells.push(index);
            }
        }
    }

    console.log(takenCrossCells, takenCircleCells);

    if (takenCrossCells.length >= 3 || takenCircleCells.length >= 3) {
        if (winCheck(takenCrossCells) ||winCheck(takenCircleCells)) {
            return true;
        }
    } 
};

const gameStart = (cell) => {
    if (!cell.children[0] && move) {
        const cross = crossCode.cloneNode(true);
        cell.append(cross);
        if (win()) {
            setTimeout(() => {
                alert('player wins');
            }, 400);      
        } else {
            move = !move;
        } 
    }
};

cells.forEach((cell) => {
    cell.addEventListener('click', () => {
        gameStart(cell);
        setTimeout(() => computerMove(), 3000); 
    });
});

const computerMove = () => {
    let freeCells = [];
    for (const cell of cells) {
        if (!cell.children[0]) freeCells.push(cell);
    }
    const cell = Math.floor(Math.random() * freeCells.length),
    circle = circleCode.cloneNode(true);
    freeCells[cell].append(circle);
    if (win()) {
        setTimeout(() => {
            alert('computer wins');
        }, 400);  
    } else {
        move = !move;
    }
};