define(["jquery"], function($) {
    var weatherState = randomIntInRange(0,2);
    var previousStates = [];
    var cloudSeedingRocketStates = 0;
    var nuclearDetonationState = false;

    var c = 0.5

    // Public functions

    function cloudSeedingRockets() {
        if(nuclearDetonationState) {
            nuclearDetonationState = false;
        }
        cloudSeedingRocketStates = 3;
    }

    function nuclearDetonation() {
        nuclearDetonationState = true;
    }

    function getWeather() {
        if(nuclearDetonationState) {
            return 0;
        }
        if(cloudSeedingRocketStates > 0) {
            return 2;
        }
        return weatherState;
    }

    function advanceRound() {
        var previousState = weatherState;
        var totalZeroes = totalNumberOfPreviousStatesOf(0);
        var totalTwos = totalNumberOfPreviousStatesOf(2);
        var diff = Math.abs(totalTwos - totalZeroes);
        var mostTwos = totalTwos > totalZeroes;
        var mostZeroes = totalZeroes > totalTwos;

        if(weatherState === 0) {
            var k = numberOfPreviousStatesOf(weatherState)
            if(mostZeroes) {
                k = k + (diff * c)
            }
            if(roll(k)) {
                weatherState = 1
            }
        }
        else if(weatherState === 2) {
            var k = numberOfPreviousStatesOf(weatherState)
            if(mostTwos) {
                k = k + (diff * c)
            }
            if(roll(k)) {
                weatherState = 1
            }
        }
        else if(weatherState === 1) {
            if(roll(numberOfPreviousStatesOf(weatherState))) {
                if(mostZeroes) {
                    if(roll(diff)) {
                        weatherState = 2;
                    } else {
                        weatherState = 0;
                    }
                }
                if(mostTwos) {
                    if(roll(diff)) {
                        weatherState = 0;
                    } else {
                        weatherState = 2;
                    }
                }
                if(totalTwos === totalZeroes) {
                    if(roll(diff)) {
                        weatherState = 0;
                    } else {
                        weatherState = 2;
                    }
                }
            }
        }

        previousStates.push(previousState);
        if(nuclearDetonationState) {
            nuclearDetonationState = false;
        }
        cloudSeedingRocketStates -= 1
    }

    // Private functions

    function resetWeather() {
        var weatherState = randomIntInRange(0,2);
        var previousStates = [];
        var cloudSeedingRocketStates = 0;
        var nuclearDetonation = false;
    }

    function printWeatherState() {
        console.log(`Weather state is ${getWeather()}`)
    }

    function randomIntInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function roll(k) {
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

    // for(l = 0; l < 10; l++) {
    //     var track = [0,0,0];
    //     resetWeather();
    //     for(j = 0; j < 25; j++) {
    //         track[weatherState]++;
    //         advanceRound();
    //     }
    //     console.log(track)
    // }

    /**
     * Returns an object that acts as the interface of the engine to the UI.
     */
    return {
        cloudSeedingRockets: cloudSeedingRockets,
        nuclearDetonation: nuclearDetonation,
        getWeather: getWeather,
        advanceRound: advanceRound
    };
});