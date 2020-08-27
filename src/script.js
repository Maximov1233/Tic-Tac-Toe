const canvas = document.querySelector('canvas'),
    context = canvas.getContext('2d');

const walls = document.querySelector('#walls'),
    collision = document.querySelector('#collision'),
    button = document.querySelector('button');

const cellSize = 20,
    cellMargin =  2,
    foodColor = '#E93323',
    snakeColor = '#6FDA40',
    freeColor = 'transparent';

const rows = 34,
    columns = 70;

const gamePadding = 0;

const startCoolDown = 150,
    levelCoolDown = 0.4;

let snakeLength = 1;

let wall = true;

canvas.width = cellSize * columns + (columns - 1) * cellMargin + 2 * gamePadding;
canvas.height = cellSize * rows + (rows - 1) * cellMargin + 2 * gamePadding;

const drawRect = (param) => { // draws the blocks of game
    context.beginPath();
    context.rect(param.x, param.y, param.width, param.height);
    context.fillStyle = param.fillColor;
    context.fill();
};

const clearCanvas = () => { // clears the canvas' context
    context.clearRect(0, 0, canvas.width, canvas.height);
};

const createGameMap = (rows, columns) => { // creates map by adding rows and columns
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

const getRandomFreeCell = (map, isSnake) => { // gets random cell
    const freeCells = [];
    if (isSnake) { // to find the center of canvas to set snake there
        for (const cell of map.flat()) {
            if (cell.x === 35 && cell.y === 17) { // center of the canvas
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

const drawGameMap = (map) => { // sets parameters by each sell and calls function that draws them
    for (const cell of map.flat()) {
        const param = {
            x: gamePadding + cell.x * (cellSize + cellMargin),
            y: gamePadding + cell.y * (cellSize + cellMargin),
            width: cellSize,
            height: cellSize,
            fillColor: freeColor,
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
    if ((x < 0) || (x >= columns) || (y < 0) || (y >= rows)) { // snake isn't standing out of canvas
        if (walls.checked) { // if we set to go through the walls
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

const moveSnake = () => {  // moves the snake 
    for (let i = snake.length - 1; i > 0; i--) { // moves all snake cells towards in one block
        snake[i] = snake[i - 1];
    }

    if (snakeDirection === 'left') { // now the head cell has two blocks (tail, head). Here it goes depending on pressed arrow
        snake[0] = getCell(snake[0].x - 1, snake[0].y);
    } else if (snakeDirection === 'right') {
        snake[0] = getCell(snake[0].x + 1, snake[0].y);
    } else if (snakeDirection === 'up') {
        snake[0] = getCell(snake[0].x, snake[0].y - 1);
    } else if (snakeDirection === 'down') {
        snake[0] = getCell(snake[0].x, snake[0].y + 1);
    }

    if (snake[0] !== undefined) { // deletes all snake cells and adds the latest version

        for (const cell of map.flat()) {
            cell.snake = false;
        }

        for (const cell of snake) {
            cell.snake = true;
        }
    }
};

const showState = () => { // showing the score and difficulty right now
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText(`Очки: ${snake.length * 5}. Сложность: ${snakeLength}`, 10, 30);
};

const drawPaused = () => { // opens when player loses
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    context.fill();

    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText(`Очки: ${snake.length * 5}. Конец игры`, canvas.width / 2, canvas.height / 2);

};

const init = () => { // starting function
    button.innerHTML = 'Начать';
    map = createGameMap(rows, columns);
    const cell = getRandomFreeCell(map, true);
    snake = [cell];
    snakeLength = 1;
    cell.snake = true;

    snakeDirection = 'up',
        nextSnakeDirection = 'up';

    play = true;
    wall = true;
    coolDown = startCoolDown;
    getRandomFreeCell(map).food = true;
    requestAnimationFrame(loop);
};

let prevTick = 0,
    play = true,
    coolDown = startCoolDown;

const loop = (timestamp) => { // constantly-loading function
    requestAnimationFrame(loop);
    clearCanvas();

    if (prevTick + coolDown <= timestamp && play) {
        let isEnd = false;
        prevTick = timestamp;
        snakeDirection = nextSnakeDirection;
        moveSnake();
        if (snake[0] === undefined) { // game over
            isEnd = true;
            playSound("dead");
        } else {
            const head = snake[0],
                tail = snake[snake.length - 1];

            if (head.food) { // snake has eaten the food
                head.food = false;
                playSound("eat");
                snake.push(tail);
                getRandomFreeCell(map).food = true;
                coolDown -= levelCoolDown;
                snakeLength++;
            } else {
                for (let i = 1; i < snake.length; i++) {
                    if (snake[i] === snake[0]) { // checks if head met it's cell
                        if (!collision.checked) {
                            isEnd = true;
                            playSound("dead");
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

    if (!play) {
        drawPaused();
        walls.removeAttribute('disabled');
        collision.removeAttribute('disabled');
        button.innerHTML = 'Начать заново';
    }
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
    if (play) {
        requestAnimationFrame(loop);
        walls.setAttribute('disabled', 'true');
        collision.setAttribute('disabled', 'true');
    } else {
        init();
    }
});