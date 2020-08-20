const canvas = document.querySelector('canvas'),
    context = canvas.getContext('2d');

const walls = document.querySelector('#walls'),
    collision = document.querySelector('#collision'),
    button = document.querySelector('button');


const cellSize = 30,
    cellMargin = 2,
    foodColor = 'green',
    snakeColor = 'grey',
    freeColor = 'rgba(0, 0, 0, 0.3)';

const rows = 20,
    columns = 20;

const gamePadding = 5;

const startCoolDown = 250,
    levelCoolDown = 2;

let snakeLength = 1;

let wall = true;

canvas.width = cellSize * columns + (columns - 1) * cellMargin + 2 * gamePadding;
canvas.height = cellSize * rows + (rows - 1) * cellMargin + 2 * gamePadding;

const drawRect = (param) => {
    context.beginPath();
    context.rect(param.x, param.y, param.width, param.height);
    context.fillStyle = param.fillColor;
    context.fill();
};

const clearCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
};

const createGameMap = (columns, rows) => {
    const map = [];

    for (let x = 0; x < columns; x++) {
        const row = [];

        for (let y = 0; y < rows; y++) {
            row.push({
                x: x,
                y: y,
                snake: false,
                food: false
            });
        }

        map.push(row);
    }
    return map;
};

const getRandomFreeCell = (map, isSnake) => {
    const freeCells = [];
    if (isSnake) {
        console.log('a');
        for (const cell of map.flat()) {
        
            if (cell.x === 10 && cell.y === 10) {
                console.log(cell);
                return cell;
            }
        }
    } else {
        for (const cell of map.flat()) {
        

            if (cell.snake || cell.food) {
                continue;
            }
            freeCells.push(cell);
        }
    
        const index = Math.floor(Math.random() * freeCells.length);
        return freeCells[index];
    }
};

const drawGameMap = (map) => {
    for (const cell of map.flat()) {
        const param = {
            x: gamePadding + cell.x * (cellSize + cellMargin),
            y: gamePadding + cell.y * (cellSize + cellMargin),
            width: cellSize,
            height: cellSize,
            fillColor: freeColor
        };

        if (cell.food) {
            param.fillColor = foodColor;
        }

        if (cell.snake) {
            param.fillColor = snakeColor;
        }

        drawRect(param);
    }
};

const getCell = (x, y) => {
    if ((x < 0) || (x >= columns) || (y < 0) || (y >= rows)) {
        if (walls.checked) {
            if (x < 0) x += rows;
            if (x >= columns) x -= columns;
            if (y < 0) y += rows;
            if (y >= rows) y -= rows;
        } else {
            wall = false;
        }
    }

    for (const cell of map.flat()) {
        if (cell.x === x && cell.y === y) {
            return cell;
        }
    }
};

const moveSnake = () => {
    
    for (let i = snake.length - 1; i > 0; i--) {
        snake[i] = snake[i - 1];
    }

    // if (snake.length === 4) {
    //     console.log(snake);
    // }

    if (snakeDirection === 'left') {
        snake[0] = getCell(snake[0].x - 1, snake[0].y);
    } else if (snakeDirection === 'right') {
        snake[0] = getCell(snake[0].x + 1, snake[0].y);
    } else if (snakeDirection === 'up') {
        snake[0] = getCell(snake[0].x, snake[0].y - 1);
    } else if (snakeDirection === 'down') {
        snake[0] = getCell(snake[0].x, snake[0].y + 1);
    }

    if (snake[0] !== undefined) {

        for (const cell of map.flat()) {
            cell.snake = false;
        }

        for (const cell of snake) {
            cell.snake = true;
        }
    }
};

const showState = () => {
    context.fillStyle = 'black';
    context.font = '20px Arial';
    context.fillText(`Очки: ${snake.length * 5}. Сложность: ${snakeLength}`, 10, 30);
};

const drawPaused = () => {
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    context.fill();

    context.fillStyle = 'black';
    context.font = '20px Arial';
    context.fillText(`Очки: ${snake.length * 5}. Конец игры`, canvas.width / 2, canvas.height / 2);
};

// const init = () => {
//     map = createGameMap(rows, columns);
//     const cell = getRandomFreeCell(map, true);
//     snake = [cell];

//     cell.snake = true;

//     snakeDirection = 'up',
//         nextSnakeDirection = 'up';

//     play = true;
//     wall = true;
//     coolDown = startCoolDown;
//     getRandomFreeCell(map).food = true;
// };

// init();

let prevTick = 0,
    play = true,
    coolDown = startCoolDown;

const loop = (timestamp) => {

    requestAnimationFrame(loop);
    clearCanvas();

    if (prevTick + coolDown <= timestamp && play) {
        let isEnd = false;
        prevTick = timestamp;
        snakeDirection = nextSnakeDirection;
        moveSnake();
        if (snake[0] === undefined) {
            isEnd = true;
        } else {
            const head = snake[0],
                tail = snake[snake.length - 1];

            if (head.food) {
                head.food = false;
                snake.push(tail);

                getRandomFreeCell(map).food = true;
                coolDown -= levelCoolDown;
                snakeLength++;
            } else {
                for (let i = 1; i < snake.length; i++) {
                    if (snake[i] === snake[0]) {
                        if (!collision.checked) {
                            isEnd = true;
                        }
                        break;
                    }
                }
            }
        }

        if (isEnd || !wall) play = false;
    }

    drawGameMap(map);
    showState();

    if (!play) drawPaused();
};

let map = createGameMap(rows, columns);

getRandomFreeCell(map).food = true;

const cell = getRandomFreeCell(map, true);
let snake = [cell];

cell.snake = true;

let snakeDirection = 'up',
    nextSnakeDirection = 'up';


document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        if (snake.length === 1 || snakeDirection === 'left' || snakeDirection === 'right') {
            nextSnakeDirection = 'up';
        }
    } else if (e.key === 'ArrowDown') {
        if (snake.length === 1 || snakeDirection === 'left' || snakeDirection === 'right') {
            nextSnakeDirection = 'down';
        }
    } else if (e.key === 'ArrowLeft') {
        if (snake.length === 1 || snakeDirection === 'up' || snakeDirection === 'down') {
            nextSnakeDirection = 'left';
        }
    } else if (e.key === 'ArrowRight') {
        if (snake.length === 1 || snakeDirection === 'up' || snakeDirection === 'down') {
            nextSnakeDirection = 'right';
        }
    } else if (e.key === 'Enter') {
        if (play) return;
        if (!play) play = true;
        init();
    }
});

button.addEventListener('click', () => {
    requestAnimationFrame(loop);
});