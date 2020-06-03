var weatherState = randomIntInRange(0,2);
var previousStates = [];

// Public functions

function getWeather() {
    return weatherState;
}

function advanceRound() {
    var previousState = weatherState;

    if(weatherState === 0 || weatherState === 2) {
        if(changeState(numberOfPreviousStatesOf(weatherState))) {
            weatherState = 1
        }
    }
    else if(weatherState === 1) {
        if(changeState(numberOfPreviousStatesOf(weatherState))) {
            var totalZeroes = totalNumberOfPreviousStatesOf(0);
            var totalTwos = totalNumberOfPreviousStatesOf(2);
            var diff = Math.abs(totalTwos - totalZeroes)
            if(totalZeroes > totalTwos) {
                if(changeState(diff)) {
                    weatherState = 2;
                } else {
                    weatherState = 0;
                }
            }
            if(totalTwos > totalZeroes) {
                if(changeState(diff)) {
                    weatherState = 0;
                } else {
                    weatherState = 2;
                }
            }
            if(totalTwos === totalZeroes) {
                if(changeState(diff)) {
                    weatherState = 0;
                } else {
                    weatherState = 2;
                }
            }
        }
    }

    previousStates.push(previousState);
}

// Private functions

function printWeatherState() {
    console.log(`Weather state is ${weatherState}`)
}

function randomIntInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function changeState(k) {
    var rand = Math.random();
    var threshold = 1 / (2 + k);
    return rand > threshold;
}

function numberOfPreviousStatesOf(state) {
    var result = 0
    for(i = 0; i < previousStates.length; i++) {
        if(previousStates[previousStates.length - 1 - i] === state) {
            result++;
        } else {
            return result;
        }
    }
    return result;
}

function totalNumberOfPreviousStatesOf(state) {
    var result = 0
    for(i = 0; i < previousStates.length; i++) {
        if(previousStates[previousStates.length - 1 - i] === state) {
            result++;
        }
    }
    return result;
}