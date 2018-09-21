define(["jquery"], function($) {
    var deck;
    var power = {};
    var iron = {};
    var aluminium = {};
    var carbon = {};
    var steel = {};
    var lithium = {};

    var playerRed = {};
    var playerGreen = {};
    var playerBlue = {};
    var playerYellow = {};

    var EBuilding = {
        MineIron: "mineIron",
        MineCarbon: "mineCarbon",
        MineAluminium: "mineAluminium",
        Furnace: "furnace",
        Lab: "lab",
        WindTurbine: "windTurbine",
        GeothermalPlant: "geothermalPlant",
        FossilPowerPlant: "fossilPowerPlant",
        SupplyConnector: "supplyConnector",
        ConstructionSite: "constructionSite",
        properties: {
            "mineIron": { produce: "iron", sortPriority: 0 },
            "mineCarbon": { produce: "carbon", sortPriority: 2 },
            "mineAluminium": { produce: "aluminum", sortPriority: 1 },
            "furnace": { produce: "steel", sortPriority: 3 },
            "lab": { produce: "lithium", sortPriority: 4 },
            "windTurbine": { produce: "power", sortPriority: 5 },
            "geothermalPlant": { produce: ["power", "power"], sortPriority: 6 },
            "fossilPowerPlant": { produce: ["power", "power", "power"], sortPriority: 7 },
            "supplyConnector": { produce: "", sortPriority: 8 },
            "constructionSite": { produce: "", sortPriority: 9 }
        }
    }

    var ETechnology = {
        MarketManipulator: "marketManipulator",
        CarbonFabrication: "carbonFabrication",
        DenseConnector: "denseConnector"
    }

    function resource(name, price, supply) {
        return {
            name: name,
            price: price,
            supply: supply,
            maxSupply: supply,
            demand: 0
        };
    }

    function getPrice(resource, amount){
        if(!amount) amount = 1;

        if(amount > resource.maxSupply * 2) {
            exception = "Illegal argument exception. name: " + resource + "amount: " + amount;
            console.error(exception);
            return exception;
        }
        if(resource.supply >= amount) return amount * resource.price
        else return (amount - resource.supply) * (resource.price + 1) + resource.supply * resource.price;
    }

    function adjustSupply(resource, amount) {
        if (amount < 0) {
            if(-amount < resource.supply) {
                resource.supply += amount;
            } else {
                resource.price += 1 + Math.floor((-amount - resource.supply) / resource.maxSupply);
                resource.supply = resource.maxSupply - ((-amount - resource.supply) % resource.maxSupply);
            }
        } else if (amount > 0) {
            if(amount <= resource.maxSupply - resource.supply) {
                resource.supply += amount;
            } else {
                resource.price -= 1 + Math.floor((amount - (resource.maxSupply - resource.supply)) / resource.maxSupply);
                resource.supply = (amount - (resource.maxSupply - resource.supply)) % resource.maxSupply;
                if(resource.price < 1) {
                    resource.price = 1;
                    resource.supply = resource.maxSupply;
                }
            }
        }
    }

    function produceForBuilding(buildingName){
        switch (buildingName) {
            case EBuilding.MineIron: adjustSupply(iron, 1); adjustSupply(power, -1); break;
            case EBuilding.MineAluminium: adjustSupply(aluminium, 1); adjustSupply(power, -1); break;
            case EBuilding.MineCarbon: adjustSupply(carbon, 1); adjustSupply(power, -1); break;
            case EBuilding.Furnace:  adjustSupply(steel, 1); adjustSupply(power, -1); adjustSupply(iron, -1); break;
            case EBuilding.Lab:  adjustSupply(lithium, 1); adjustSupply(aluminium, -1); adjustSupply(carbon, -1); break;
            case EBuilding.FossilPowerPlant:  adjustSupply(power, 3); adjustSupply(carbon, -1); break;
            case EBuilding.GeothermalPlant:  adjustSupply(power, 2); break;
            case EBuilding.WindTurbine:  adjustSupply(power, 1); break;
            default:
                console.error("Illegal argument exception. name: " + name);
                break;
        }
    }

    function toggleCarbonFabrication(player){
        if(player.carbonFabrication){
            player.carbonFabrication = false;
            modifyTechnology(ETechnology.CarbonFabrication, false);
        } else {
            player.carbonFabrication = true;
            modifyTechnology(ETechnology.CarbonFabrication, true);
        }
    }

    function toggleDenseConnector(player){
        if(player.denseConnector){
            player.denseConnector = false;
            modifyTechnology(ETechnology.DenseConnector, false);
        } else {
            player.denseConnector = true;
            modifyTechnology(ETechnology.DenseConnector, true);
        }
    }

    function toggleMarketManipulator(player){
        if(player.marketManipulator){
            player.marketManipulator = false;
            modifyTechnology(ETechnology.MarketManipulator, false);
        } else {
            player.marketManipulator = true;
            modifyTechnology(ETechnology.MarketManipulator, true);
        }
    }

    function modifyTechnology(technologyName, add){
        multiplier = -1;
        if(!add) multiplier = 1;
        switch (technologyName) {
            case ETechnology.CarbonFabrication:
                adjustSupply(lithium, 1 * multiplier); adjustSupply(carbon, 3 * multiplier);
                break;
            case ETechnology.DenseConnector:
                adjustSupply(steel, 1 * multiplier)
                break;
            case ETechnology.MarketManipulator:
                adjustSupply(lithium, 1 * multiplier);
                break;
            default:                 
                console.error("Illegal argument exception. technologyName: " + technologyName);
                break;
        }
    }

    function modifyBuilding(player, buildingName, add){
        multiplier = -1;
        if(!add) multiplier = 1;
        if(player.carbonFabrication){
            switch (buildingName) {
                case EBuilding.MineIron: 
                case EBuilding.MineAluminium: 
                case EBuilding.MineCarbon: 
                case EBuilding.Furnace: 
                case EBuilding.Lab: 
                case EBuilding.FossilPowerPlant: 
                    adjustSupply(carbon, 3 * multiplier);
                    break;
                case EBuilding.GeothermalPlant: 
                    adjustSupply(carbon, 6 * multiplier);
                    break;
                case EBuilding.WindTurbine: 
                    adjustSupply(lithium, 1 * multiplier); adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EBuilding.SupplyConnector:
                    if(player.denseConnector) adjustSupply(iron, 1 * multiplier)
                    else adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EBuilding.ConstructionSite:
                    adjustSupply(carbon, 2 * multiplier);
                    break;
                default:
                    console.error("Illegal argument exception. buildingName: " + buildingName);
                    break;
            }
        } else {
            switch (buildingName) {
                case EBuilding.MineIron: 
                case EBuilding.MineAluminium: 
                case EBuilding.MineCarbon: 
                case EBuilding.Furnace: 
                case EBuilding.Lab: 
                case EBuilding.FossilPowerPlant: 
                    adjustSupply(steel, 2 * multiplier);
                    break;
                case EBuilding.GeothermalPlant: 
                    adjustSupply(steel, 4 * multiplier);
                    break;
                case EBuilding.WindTurbine: 
                    adjustSupply(lithium, 1 * multiplier); adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EBuilding.SupplyConnector:
                    if(player.denseConnector) adjustSupply(iron, 1 * multiplier)
                    else adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EBuilding.ConstructionSite:
                    adjustSupply(steel, 1 * multiplier);
                    break;
                default:
                    console.error("Illegal argument exception. buildingName: " + buildingName);
                    break;
            }
        }
    }

    function getBuildingPrice(player, buildingName){
        if(player.carbonFabrication){
            switch (buildingName) {
                case EBuilding.MineIron: 
                case EBuilding.MineAluminium: 
                case EBuilding.MineCarbon: 
                case EBuilding.Furnace: 
                case EBuilding.Lab: 
                case EBuilding.FossilPowerPlant: 
                    return getPrice(carbon, 3);
                case EBuilding.GeothermalPlant: 
                    return getPrice(carbon, 6);
                case EBuilding.WindTurbine: 
                    return getPrice(lithium) + getPrice(aluminium);
                case EBuilding.SupplyConnector:
                    if(player.denseConnector) return getPrice(iron);
                    else return getPrice(aluminium);
                case EBuilding.ConstructionSite:
                    return getPrice(carbon, 2);
                case ETechnology.CarbonFabrication:
                    return getPrice(lithium) + getPrice(carbon, 3);
                case ETechnology.DenseConnector:
                    return getPrice(steel)
                case ETechnology.MarketManipulator:
                    return getPrice(lithium)
                default:
                    exception ="Illegal argument exception. buildingName: " + buildingName;
                    console.error(exception);
                    return exception;
            }
        } else {
            switch (buildingName) {
                case EBuilding.MineIron: 
                case EBuilding.MineAluminium: 
                case EBuilding.MineCarbon: 
                case EBuilding.Furnace: 
                case EBuilding.Lab: 
                case EBuilding.FossilPowerPlant: 
                    return getPrice(steel, 2);
                case EBuilding.GeothermalPlant: 
                    return getPrice(steel, 4);
                case EBuilding.WindTurbine: 
                    return getPrice(lithium) + getPrice(aluminium);
                case EBuilding.SupplyConnector:
                    if(player.denseConnector) return getPrice(iron);
                    else return getPrice(aluminium);
                case EBuilding.ConstructionSite:
                    return getPrice(steel);
                case ETechnology.CarbonFabrication:
                    return getPrice(lithium) + getPrice(carbon, 3);
                case ETechnology.DenseConnector:
                    return getPrice(steel)
                case ETechnology.MarketManipulator:
                    return getPrice(lithium)
                default:
                    exception = "Illegal argument exception. buildingName: " + buildingName;
                    console.error(exception);
                    return exception;
            }
        }
    }

    function getBuildingRevenue(buildingName, market){
        revenue = 0;
        switch (buildingName) {
            case EBuilding.MineIron: revenue = getPrice(market.iron) - getPrice(market.power); break;
            case EBuilding.MineAluminium: revenue = getPrice(market.aluminium) - getPrice(market.power); break;
            case EBuilding.MineCarbon: revenue = getPrice(market.carbon) - getPrice(market.power); break;
            case EBuilding.Furnace: revenue = getPrice(market.steel) - getPrice(market.power) - getPrice(iron); break;
            case EBuilding.Lab: revenue = getPrice(market.lithium) - getPrice(market.carbon) - getPrice(market.aluminium); break;
            case EBuilding.FossilPowerPlant: revenue = getPrice(market.power) * 3 - getPrice(carbon); break;
            case EBuilding.GeothermalPlant: revenue = getPrice(market.power) * 2; break;
            case EBuilding.WindTurbine: revenue = getPrice(market.power); break;
            case EBuilding.SupplyConnector: revenue = 0; break;
            case EBuilding.ConstructionSite: revenue = 0; break;
            default:
                console.error("Illegal argument exception. name: " + buildingName);
                break;
        }
        if(revenue < 0) return 0;
        return revenue;
    }

    function player(color){
        return {
            color: color,
            debt: 0,
            accumulateDebt: false,
            buildings: [],
            carbonFabrication: false,
            denseConnector: false,
            marketManipulator: false
        };
    }

    function addDebt(player, amount){
        player.debt += amount;
    }

    function addBuilding(player, buildingName){
        player.buildings.push(buildingName);
        modifyBuilding(player, buildingName, true);
        sortBuildings(player);
    }

    function removeBuilding(player, buildingName){
        index = player.buildings.indexOf(buildingName);
        if(index > -1){
            player.buildings.splice(index, 1);
            modifyBuilding(player, buildingName, false);
            sortBuildings(player);
        } else {
            console.error("Invalid argument exception. player: " + player + ", buildingName: " + buildingName);
        }
    }

    function sortBuildings(player){
        player.buildings.sort(function(a, b){
            i = EBuilding.properties[a].sortPriority;
            j = EBuilding.properties[b].sortPriority;

            return i - j;
        });
    }

    function drawDemandCard(){
        return getDemand();
    }

    function getDemand() {
        total = getTotal(deck)
        if (total === 0) {
            return "nothing"
        }
        deck.cardsDrawn++;
        deck.debtToBeGained++;
        randomInt = Math.floor(Math.random() * total);
        temp = 0
        temp += deck.steel
        if(randomInt < temp) {
            deck.steel = deck.steel - 1;
            steel.demand++;
            return "steel"
        }
        temp += deck.lithium
        if(randomInt < temp) {
            deck.lithium = deck.lithium - 1;
            lithium.demand++;
            return "lithium"
        }
        temp += deck.carbon
        if(randomInt < temp) {
            deck.carbon = deck.carbon - 1;
            carbon.demand++;
            return "carbon"
        }
        temp += deck.iron
        if(randomInt < temp) {
            deck.iron = deck.iron - 1;
            iron.demand++;
            return "iron"
        }
        temp += deck.aluminium
        if(randomInt < temp) {
            deck.aluminium = deck.aluminium - 1;
            aluminium.demand++;
            return "aluminium"
        }
        temp += deck.power
        if(randomInt < temp) {
            deck.power = deck.power - 1;
            power.demand++;
            return "power"
        }
        temp += deck.interest
        if(randomInt < temp) {
            deck.interest = deck.interest - 1;
            interest();
            return "interest"
        }
        temp += deck.funding
        if(randomInt < temp) {
            deck.funding = deck.funding - 1;
            deck.debtToBeGained = deck.debtToBeGained + 3
            return "funding"
        }
        exception = "IllegalStateException. Deck: " + deck
        console.error(exception);
        return exception
    }

    function getTotal(deck) {
        total = 0
        total += deck.steel
        total += deck.lithium
        total += deck.carbon
        total += deck.iron
        total += deck.aluminium
        total += deck.power
        total += deck.interest
        total += deck.funding
        return total
    }

    function getDebtToBeAccumulatedThisRound(deck){
        return deck.debtToBeGained;
    }

    function toggleDebt(player){
        player.accumulateDebt = !player.accumulateDebt;
    }

    function interest(){
        playerRed.debt += Math.floor(playerRed.debt / 5);
        playerBlue.debt += Math.floor(playerBlue.debt / 5);
        playerGreen.debt += Math.floor(playerGreen.debt / 5);
        playerYellow.debt += Math.floor(playerYellow.debt / 5);
    }

    function updateMarket(player, market){
        if (!player.accumulateDebt){
            player.buildings.forEach(buildingName => {
                buildingRevenue = getBuildingRevenue(buildingName, market);
                if(buildingRevenue > 0 ){
                    produceForBuilding(buildingName);
                }
            });
        } else{
            addDebt(player, deck.debtToBeGained);
        }
    }

    function getMarket(){
        return {
            power: power,
            iron: iron,
            aluminium: aluminium,
            carbon: carbon,
            steel: steel,
            lithium: lithium
        }
    }

    function getProducedResources(player){
        if(!player.accumulateDebt){
            resources = [];
            player.buildings.forEach(function(building) {
                revenue = getBuildingRevenue(building, getMarket());
                if(revenue > 0){
                    resources = resources.concat(EBuilding.properties[building].produce);
                }
            });
            return resources;
        } else return [];
    }

    function getIncome(player){
        revenue = 0;
        player.buildings.forEach(function(building) {
            revenue += getBuildingRevenue(building, getMarket());
        });
        return revenue;
    }

    function adjustSupplyForDemand(){
        adjustSupply(power, -power.demand);
        adjustSupply(iron, -iron.demand);
        adjustSupply(carbon, -carbon.demand);
        adjustSupply(aluminium, -aluminium.demand);
        adjustSupply(steel, -steel.demand);
        adjustSupply(lithium, -lithium.demand);
    }

    function produce(){
        market = {
            power: $.extend(true, {}, power),
            iron: $.extend(true, {}, iron),
            aluminium: $.extend(true, {}, aluminium),
            carbon: $.extend(true, {}, carbon),
            steel: $.extend(true, {}, steel),
            lithium: $.extend(true, {}, lithium)
        }

        updateMarket(playerRed, market);
        updateMarket(playerBlue, market);
        updateMarket(playerGreen, market);
        updateMarket(playerYellow, market);

        adjustSupplyForDemand();

        playerRed.accumulateDebt = false;
        playerBlue.accumulateDebt = false;
        playerGreen.accumulateDebt = false;
        playerYellow.accumulateDebt = false;
    }

    function initializeResources(){
        power = resource("power", 1, 10);
        iron = resource("iron", 2, 5);
        aluminium = resource("aluminium", 2, 5);
        carbon = resource("carbon", 2, 5);
        steel = resource("steel", 4, 7);
        lithium = resource("lithium", 6, 4);
    }

    function initializeDemandDeck() {
        deck = {cardsDrawn: 0, debtToBeGained: 0};
        deck.steel = 4;
        deck.lithium = 4;
        deck.carbon = 4;
        deck.iron = 4;
        deck.aluminium = 4;
        deck.power = 6;
        deck.interest = 5;
        deck.funding = 3;
        return deck;
    }

    function initializePlayers(){
        playerRed = player("red");
        playerGreen = player("green");
        playerBlue = player("blue");
        playerYellow = player("yellow");
    }

    function initialize(){
        console.log("Initializing engine...");

        initializeResources();
        initializeDemandDeck();
        initializePlayers();
    }


    return {
        initialize: initialize,
        produce: produce,
        drawDemandCard, drawDemandCard,
        addBuilding: addBuilding,
        removeBuilding: removeBuilding,
        adjustSupply: adjustSupply,
        toggleDebt: toggleDebt,
        getIncome: getIncome,
        getBuildingPrice: getBuildingPrice,
        getDeck: function() {
            return deck;
        },
        getResource: function(resourceName) {
            switch(resourceName) {
                case "power": return power;
                case "iron": return iron;
                case "aluminium": return aluminium;
                case "carbon": return carbon;
                case "steel": return steel;
                case "lithium": return lithium;
                default:
                    console.error("Illegal argument exception. name: " + resourceName);
                    break;
            }
        },
        getBuilding: function(buildingName) {
            switch(buildingName) {
                case "mineIron": return EBuilding.MineIron;
                case "mineCarbon": return EBuilding.MineCarbon;
                case "mineAluminium": return EBuilding.MineAluminium;
                case "furnace": return EBuilding.Furnace;
                case "lab": return EBuilding.Lab;
                case "windTurbine": return EBuilding.WindTurbine;
                case "geothermalPlant": return EBuilding.GeothermalPlant;
                case "fossilPowerPlant": return EBuilding.FossilPowerPlant;
                case "supplyConnector": return EBuilding.SupplyConnector;
                case "constructionSite": return EBuilding.ConstructionSite;
                default:
                    console.error("Illegal argument exception. name: " + buildingName);
                    break;
            }
        },
        getTechnology: function(technologyName) {
            switch(technologyName) {
                case "carbonFabrication": return ETechnology.CarbonFabrication;
                case "denseConnector": return ETechnology.DenseConnector;
                case "marketManipulator": return ETechnology.MarketManipulator;
                default:
                    console.error("Illegal argument exception. name: " + technologyName);
                    break;
            }
        },
        getPlayer: function(playerName) {
            switch(playerName) {
                case "red": return playerRed;
                case "blue": return playerBlue;
                case "green": return playerGreen;
                case "yellow": return playerYellow;
                default:
                    console.error("Illegal argument exception. name: " + playerName);
                    break;
                
            }
        },
        toggleTechnology: function(player, technology) {
            switch(technology) {
                case ETechnology.MarketManipulator: toggleMarketManipulator(player); break;
                case ETechnology.CarbonFabrication: toggleCarbonFabrication(player); break;
                case ETechnology.DenseConnector: toggleDenseConnector(player); break;
                default:
                    console.error("Illegal argument exception. name: " + technology);
                    break;
            }
        }
    };

});