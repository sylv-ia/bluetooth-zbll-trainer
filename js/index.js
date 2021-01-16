const randomFromArray = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

const cube = {
    colors: {
        'U': '#E5E521',
        'L': 'blue',
        'F': '#f03031',
        'R': '#2ac44b',
        'B': 'orange',
        'D': 'white'
    },
    init: () => {
        cube.stickers = [];

        for (let i = 0; i < 9; i++) {
            cube.stickers[i] = document.getElementById(`top${i + 1}`)
        }
        for (let i = 0; i < 9; i++) {
            cube.stickers[i + 9] = document.getElementById(`right${i + 1}`)
        }
        for (let i = 0; i < 9; i++) {
            cube.stickers[i + 18] = document.getElementById(`front${i + 1}`)
        }

        cube.cube = new Cube();

    },
    setUpCase: (turns, code = '') => {
        cube.cube.move(Cube.inverse(turns));
        cube.updateSVG();
        cube.currentCase = turns;
        cube.currentCode = code;
        cube.currentSet = code.split('-')[0];
    },
    reset: () => {
        cube.cube.identity();
        cube.updateSVG();
    },
    move: (turns) => {
        cube.cube.move(turns);
        if (turns != "U" && turns != "U'") {
            //cube.shouldUpdateSVG = false;
        }
        cube.updateSVG();
        cube.history = [...cube.history, ...turns.split(' ')];
    },
    updateSVG: () => {
        if (cube.shouldUpdateSVG) {
            const asString = cube.cube.asString();
            cube.stickers.forEach((sticker, i) => sticker.style.fill = cube.colors[asString[i]]);
        }
    },
    isSolved: () => (cube.cube.isSolved()),
    history: [],
    clearHistory: () => {
        cube.history = [];
    },
    shouldUpdateSVG: true,
    checkCommands: () => {
        const history = cube.history.slice().reverse();

        if (history[0] == 'U'
            && history[1] == 'U'
            && history[2] == 'U'
            && history[3] == 'U'
        ) {
            cube.shouldUpdateSVG = true;
            cube.reset();
            cube.setUpCase(cube.currentCase, cube.currentCode);
            cube.clearHistory();
            return;
        } else if (history[0] == 'D'
            && history[1] == 'D'
            && history[2] == 'D'
            && history[3] == 'D'
        ) {
            cube.shouldUpdateSVG = true;
            cube.clearHistory();
            cube.reset();
            randomFromSelected();
            clearMessage();
        }

    },
}

const setMessage = (message, positive) => {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    if (positive != null) {
        if (positive) {
            messageDiv.style.color = 'lime';
        } else {
            messageDiv.style.color = 'red';
        }
    }
}

const clearMessage = () => {
    const messageDiv = document.getElementById('message');
    messageDiv.style.opacity = 0;
    messageDiv.innerHTML = '.';
}

const randomFromSelected = () => {
    cube.reset()
    const algCode = randomFromArray(selected);
    const randomU = ' U '.repeat(Math.floor(Math.random() * 4));
    const alg = getAlg(algCode);
    cube.setUpCase(alg + randomU, algCode);
}

cube.init();

if (selected.length != 0) {
    randomFromSelected();
}

const connectButton = document.getElementById('connectButton');

const onConnect = () => {
    connectButton.innerHTML = 'connected';
    connectButton.style.borderColor = 'lime';
}

const onSolved = () => {
    setMessage('solved!', 1);
    document.getElementById('tempCounter').innerHTML++;
    cube.shouldUpdateSVG = true;
    cube.clearHistory();
    setTimeout(() => {
        randomFromSelected();
        clearMessage();
    }, 500);
}

const matchState = (cube, pattern) => {
    const state = cube.asString()
    console.log(state)
    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] != '.' && pattern[i] != state[i]) return false;
    }
    return true;
}

const onTwist = (turn) => {

    cube.move(turn);

    if ((setsConfig[cube.currentSet]
        && setsConfig[cube.currentSet].solveState
        && matchState(cube.cube, setsConfig[cube.currentSet].solveState))
        || cube.isSolved()) {
        onSolved()
    } else {
        cube.checkCommands();
    }

}

const onError = (error) => {
    console.log(error);
    connectButton.innerHTML = 'connect';
    connectButton.style.borderColor = 'white';

}

connectButton.addEventListener('click', () => {
    BtCube.connect(onConnect, onTwist, onError);
    connectButton.innerHTML = 'connecting...';
})