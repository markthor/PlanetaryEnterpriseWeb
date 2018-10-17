define(["jquery"], function ($) {
    var geothermalTilesSettings = {};
    var ironTilesSettings = {};
    var aluminiumTilesSettings = {};
    var carbonTilesSettings = {};
    var lithiumTilesSettings = {};
    var numberOfTiles;

    var map;

    function createTilesSettings(minimumAmount, maximumAmount, supply) {
        return {
            minimumAmount: minimumAmount,
            maximumAmount: maximumAmount
        };
    }

    function initializeTileSettings(numberOfPlayers) {
        if (numberOfPlayers == 4) {
            geothermalTilesSettings = createTilesSettings(2, 3);
            ironTilesSettings = createTilesSettings(3, 4);
            aluminiumTilesSettings = createTilesSettings(3, 4);
            carbonTilesSettings = createTilesSettings(3, 4);
            lithiumTilesSettings = createTilesSettings(1, 1);
            numberOfTiles = 21;
        }
        if (numberOfPlayers == 3) {
            geothermalTilesSettings = createTilesSettings(2, 2);
            ironTilesSettings = createTilesSettings(3, 3);
            aluminiumTilesSettings = createTilesSettings(3, 3);
            carbonTilesSettings = createTilesSettings(3, 3);
            lithiumTilesSettings = createTilesSettings(1, 1);
            numberOfTiles = 16;
        }
    }

    function getRandomNumberOfTiles(tileSetting) {
        var min = tileSetting.minimumAmount;
        var max = tileSetting.maximumAmount;

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateMap() {
        map = {
            iron: getRandomNumberOfTiles(ironTilesSettings),
            aluminium: getRandomNumberOfTiles(aluminiumTilesSettings),
            carbon: getRandomNumberOfTiles(carbonTilesSettings),
            geothermal: getRandomNumberOfTiles(geothermalTilesSettings),
            lithium: getRandomNumberOfTiles(lithiumTilesSettings),
            desert: 0
        };
        map.desert = numberOfTiles - getNumberOfTilesInMap(map);
    }

    function getMap() {
        return map;
    }

    function getNumberOfTilesInMap(map) {
        var total = 0;
        total += map.iron;
        total += map.aluminium;
        total += map.carbon;
        total += map.geothermal;
        total += map.lithium;
        total += map.desert;
        return total;
    }

    return {
        initializeTileSettings: initializeTileSettings,
        generateMap: generateMap,
        getMap: getMap
    };
});
