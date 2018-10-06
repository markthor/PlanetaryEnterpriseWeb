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

    var wasDebtAccumulatedLastRound = true;

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
            "mineIron": { produce: "iron", consume: ["power"], requiresPower: true, sortPriority: 0 },
            "mineCarbon": { produce: "carbon", consume: ["power"], requiresPower: true, sortPriority: 2 },
            "mineAluminium": { produce: "aluminum", consume: ["power"], requiresPower: true, sortPriority: 1 },
            "furnace": { produce: "steel", consume: ["power", "iron"], requiresPower: true, sortPriority: 3 },
            "lab": { produce: "lithium", consume: ["aluminium", "carbon"], requiresPower: false, sortPriority: 4 },
            "windTurbine": { produce: "power", consume: [], requiresPower: false, sortPriority: 5 },
            "geothermalPlant": { produce: ["power", "power"], consume: [], requiresPower: false, sortPriority: 6 },
            "fossilPowerPlant": { produce: ["power", "power", "power"], consume: ["carbon"], requiresPower: false, sortPriority: 7 },
            "supplyConnector": { produce: "", consume: [], requiresPower: false, sortPriority: 8 },
            "constructionSite": { produce: "", consume: [], requiresPower: false, sortPriority: 9 }
        }
    }

    var ETechnology = {
        MarketManipulator: "marketManipulator",
        CarbonFabrication: "carbonFabrication",
        NuclearReactors: "nuclearReactors"
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
        adjustSupplyNoRestrictions(resource, amount);
        correctPrice(resource);
    }

    /**
     * Adjust supply of a resource, while allowing the price of the resource to be below one. This function should only be called if the price is corrected afterwards.
     */
    function adjustSupplyNoRestrictions(resource, amount) {
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
            }
        }
    }

    function correctAllPrices() {
        correctPrice(power);
        correctPrice(iron);
        correctPrice(aluminium);
        correctPrice(carbon);
        correctPrice(steel);
        correctPrice(lithium);
    }

    function correctPrice(resource) {
        if(resource.price < 1) {
            resource.price = 1;
            resource.supply = resource.maxSupply;
        }
    }

    function produceForBuilding(buildingName, player){
        if(player.nuclearReactors) {
            switch (buildingName) {
            case EBuilding.MineIron: adjustSupplyNoRestrictions(iron, 1); break;
            case EBuilding.MineAluminium: adjustSupplyNoRestrictions(aluminium, 1); break;
            case EBuilding.MineCarbon: adjustSupplyNoRestrictions(carbon, 1); break;
            case EBuilding.Furnace:  adjustSupplyNoRestrictions(steel, 1); adjustSupplyNoRestrictions(iron, -1); break;
            case EBuilding.Lab:  adjustSupplyNoRestrictions(lithium, 1); adjustSupplyNoRestrictions(aluminium, -1); adjustSupplyNoRestrictions(carbon, -1); break;
            case EBuilding.FossilPowerPlant:  adjustSupplyNoRestrictions(power, 3); adjustSupplyNoRestrictions(carbon, -1); break;
            case EBuilding.GeothermalPlant:  adjustSupplyNoRestrictions(power, 2); break;
            case EBuilding.WindTurbine:  adjustSupplyNoRestrictions(power, 1); break;
            default:
                console.error("Illegal argument exception. name: " + name);
                break;
            }
        } else {
            switch (buildingName) {
            case EBuilding.MineIron: adjustSupplyNoRestrictions(iron, 1); adjustSupplyNoRestrictions(power, -1); break;
            case EBuilding.MineAluminium: adjustSupplyNoRestrictions(aluminium, 1); adjustSupplyNoRestrictions(power, -1); break;
            case EBuilding.MineCarbon: adjustSupplyNoRestrictions(carbon, 1); adjustSupplyNoRestrictions(power, -1); break;
            case EBuilding.Furnace:  adjustSupplyNoRestrictions(steel, 1); adjustSupplyNoRestrictions(power, -1); adjustSupplyNoRestrictions(iron, -1); break;
            case EBuilding.Lab:  adjustSupplyNoRestrictions(lithium, 1); adjustSupplyNoRestrictions(aluminium, -1); adjustSupplyNoRestrictions(carbon, -1); break;
            case EBuilding.FossilPowerPlant:  adjustSupplyNoRestrictions(power, 3); adjustSupplyNoRestrictions(carbon, -1); break;
            case EBuilding.GeothermalPlant:  adjustSupplyNoRestrictions(power, 2); break;
            case EBuilding.WindTurbine:  adjustSupplyNoRestrictions(power, 1); break;
            default:
                console.error("Illegal argument exception. name: " + name);
                break;
            }
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

    function toggleMarketManipulator(player){
        if(player.marketManipulator){
            player.marketManipulator = false;
            modifyTechnology(ETechnology.MarketManipulator, false);
        } else {
            player.marketManipulator = true;
            modifyTechnology(ETechnology.MarketManipulator, true);
        }
    }
    
    function toggleNuclearReactor(player){
        if(player.nuclearReactors){
            player.nuclearReactors = false;
            modifyTechnology(ETechnology.NuclearReactors, false);
        } else {
            player.nuclearReactors = true;
            modifyTechnology(ETechnology.NuclearReactors, true);
        }
    }

    function modifyTechnology(technologyName, add){
        multiplier = -1;
        if(!add) multiplier = 1;
        switch (technologyName) {
            case ETechnology.CarbonFabrication:
                adjustSupply(lithium, 1 * multiplier); adjustSupply(carbon, 3 * multiplier);
                break;
            case ETechnology.MarketManipulator:
                adjustSupply(lithium, 1 * multiplier);
                break;
            case ETechnology.NuclearReactors:
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
                    adjustSupply(lithium, 2 * multiplier); adjustSupply(carbon, 1 * multiplier);
                    break;
                case EBuilding.WindTurbine: 
                    adjustSupply(carbon, 3 * multiplier);
                    break;
                case EBuilding.SupplyConnector:
                    adjustSupply(aluminium, 1 * multiplier);
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
                    adjustSupply(lithium, 2 * multiplier); adjustSupply(steel, 1 * multiplier);
                    break;
                case EBuilding.WindTurbine: 
                    adjustSupply(steel, 2 * multiplier);
                    break;
                case EBuilding.SupplyConnector:
                    adjustSupply(aluminium, 1 * multiplier);
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
                    return getPrice(lithium, 2) + getPrice(carbon);
                case EBuilding.WindTurbine: 
                    return getPrice(carbon, 3);
                case EBuilding.SupplyConnector:
                    return getPrice(aluminium);
                case EBuilding.ConstructionSite:
                    return getPrice(carbon, 2);
                case ETechnology.CarbonFabrication:
                    return getPrice(lithium) + getPrice(carbon, 3);
                case ETechnology.MarketManipulator:
                    return getPrice(lithium)
                case ETechnology.NuclearReactors:
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
                    return getPrice(lithium, 2) + getPrice(steel);
                case EBuilding.WindTurbine: 
                    return getPrice(steel, 2);
                case EBuilding.SupplyConnector:
                    return getPrice(aluminium);
                case EBuilding.ConstructionSite:
                    return getPrice(steel);
                case ETechnology.CarbonFabrication:
                    return getPrice(lithium) + getPrice(carbon, 3);
                case ETechnology.MarketManipulator:
                    return getPrice(lithium)
                case ETechnology.NuclearReactors:
                    return getPrice(lithium)
                default:
                    exception = "Illegal argument exception. buildingName: " + buildingName;
                    console.error(exception);
                    return exception;
            }
        }
    }

    function getBuildingRevenue(buildingName, market, player){
        if(EBuilding.properties[buildingName].requiresPower && !doesPowerConsumingBuildingsProduce(player, market)) {
            return 0;
        } else {
            return getBuildingRevenueNoRestrictions(buildingName, market, player);
        }
    }
    

    function getBuildingRevenueNoRestrictions(buildingName, market, player){
        var revenue = 0;
        if(player.nuclearReactors) {
            switch (buildingName) {
                case EBuilding.MineIron: revenue = getPrice(market.iron); break;
                case EBuilding.MineAluminium: revenue = getPrice(market.aluminium); break;
                case EBuilding.MineCarbon: revenue = getPrice(market.carbon); break;
                case EBuilding.Furnace: revenue = getPrice(market.steel) - getPrice(iron); break;
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
        } else {
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
        }
        
        if(revenue < 0) return 0;
        return revenue;
    }

    function doesPowerConsumingBuildingsProduce(player, market) {
        if(!player.nuclearReactors) {
            return true;
        }

        var totalRevenueOfPowerProducingBuildings = 0;
        player.buildings.forEach(function(building) {
            if(EBuilding.properties[building].requiresPower) {
                totalRevenueOfPowerProducingBuildings += getBuildingRevenueNoRestrictions(building, market, player);
            }
        });

        return (totalRevenueOfPowerProducingBuildings - getPrice(lithium, 1) > 0);
    }

    function player(color){
        return {
            color: color,
            name: "Player",
            debt: 0,
            accumulateDebt: false,
            buildings: [],
            carbonFabrication: false,
            marketManipulator: false,
            nuclearReactors: false
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
        return deck.nextCard;
    }

    function getDemand() {
        total = getTotal(deck)
        if (total === 0) {
            return "nothing"
        }
        deck.cardsDrawn++;
        randomInt = Math.floor(Math.random() * total);
        temp = 0
        temp += deck.steel
        if(randomInt < temp) {
            deck.steel = deck.steel - 1;
            return "steel"
        }
        temp += deck.lithium
        if(randomInt < temp) {
            deck.lithium = deck.lithium - 1;
            return "lithium"
        }
        temp += deck.carbon
        if(randomInt < temp) {
            deck.carbon = deck.carbon - 1;
            return "carbon"
        }
        temp += deck.iron
        if(randomInt < temp) {
            deck.iron = deck.iron - 1;
            return "iron"
        }
        temp += deck.aluminium
        if(randomInt < temp) {
            deck.aluminium = deck.aluminium - 1;
            return "aluminium"
        }
        temp += deck.power
        if(randomInt < temp) {
            deck.power = deck.power - 1;
            return "power"
        }
        temp += deck.interest
        if(randomInt < temp) {
            deck.interest = deck.interest - 1;
            return "interest"
        }
        exception = "IllegalStateException. Deck: " + deck
        console.error(exception);
        return exception
    }

    function modifyDemandState(card) {
        switch(card) {
            case "power": power.demand++; break;
            case "iron": iron.demand++; break;
            case "aluminium": aluminium.demand++; break;
            case "carbon": carbon.demand++; break;
            case "steel":  steel.demand++; break;
            case "lithium": lithium.demand++; break;
            case "interest": interest(); break;
            default: break;
        }
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
                buildingRevenue = getBuildingRevenue(buildingName, market, player);
                if(buildingRevenue > 0){
                        produceForBuilding(buildingName, player);
                }
            });
            if(player.nuclearReactors && doesPowerConsumingBuildingsProduce(player, market)) {
                adjustSupply(lithium, -1);
            }
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
                revenue = getBuildingRevenue(building, getMarket(), player);
                if(revenue > 0){
                    resources = resources.concat(EBuilding.properties[building].produce);
                }
            });
            sortResources(resources)
            return resources;
        } else return [];
    }

    function getConsumedResources(player){
        if(!player.accumulateDebt){
            var resources = [];
            var nuclearReactorActivated = false;
            player.buildings.forEach(function(building) {
                revenue = getBuildingRevenue(building, getMarket(), player);
                if(revenue > 0){
                    if(player.nuclearReactors && EBuilding.properties[building].requiresPower){
                        resources = resources.concat(EBuilding.properties[building].consume.filter(resource => resource !== "power"));
                        nuclearReactorActivated = true;
                    } else {
                        resources = resources.concat(EBuilding.properties[building].consume);
                    }
                }
            });
            if(nuclearReactorActivated){
                resources.push("lithium")
            }
            sortResources(resources)
            return resources;
        } else return [];
    }

    function sortResources(resources){
        resources.sort(function(a, b){
            i = getResourceSortOrder(a);
            j = getResourceSortOrder(b);
             return i - j;
        });
    }

     function getResourceSortOrder(resourceName){
        switch (resourceName) {
            case "power": return 1
            case "iron": return 2
            case "aluminium": return 3
            case "carbon": return 4
            case "steel": return 5
            case "lithium": return 6
            default:
                console.error("Illegal argument exception. name: " + resourceName);
                break;
        }
    }

    function getIncome(player){
        var revenue = 0;
        player.buildings.forEach(function(building) {
            revenue += getBuildingRevenue(building, getMarket(), player);
        });
        if(player.nuclearReactors && doesPowerConsumingBuildingsProduce(player, getMarket())) {
            revenue -= getPrice(lithium, 1);
        }
        return revenue;
    }

    function getIncomeOrDebt(player){
        if(player.accumulateDebt) {
            return deck.debtToBeGained;
        } else {
            return getIncome(player);
        }
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
        correctAllPrices();

        adjustSupplyForDemand();

        adjustDebtToBeAccumulated();

        playerRed.accumulateDebt = false;
        playerBlue.accumulateDebt = false;
        playerGreen.accumulateDebt = false;
        playerYellow.accumulateDebt = false;

        modifyDemandState(drawDemandCard());
        deck.nextCard = getDemand();
    }

    function adjustDebtToBeAccumulated() {
        if(didAnyPlayerAccumulateDebt()) {
        	if(!wasDebtAccumulatedLastRound) {
        		deck.debtToBeGained++;
        	}
            wasDebtAccumulatedLastRound = true
        } else {
        	deck.debtToBeGained++;
            if(!wasDebtAccumulatedLastRound) {
                deck.debtToBeGained++;
            }
            wasDebtAccumulatedLastRound = false;
        }
    }

    function didAnyPlayerAccumulateDebt() {
        if(playerRed.accumulateDebt === true) {
            return true;
        }
        if(playerBlue.accumulateDebt === true) {
            return true;
        }
        if(playerGreen.accumulateDebt === true) {
            return true;
        }
        if(playerYellow.accumulateDebt === true) {
            return true;
        }
        return false;
    }

    function initializeResources(){
        power = resource("power", 1, 10);
        iron = resource("iron", 2, 5);
        aluminium = resource("aluminium", 2, 5);
        carbon = resource("carbon", 2, 5);
        steel = resource("steel", 4, 7);
        lithium = resource("lithium", 6, 3);
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
        deck.nextCard = getDemand();
        modifyDemandState(drawDemandCard());
        deck.nextCard = getDemand();
    }

    function initializePlayers(){
        playerRed = player("red");
        playerBlue = player("blue");
        playerGreen = player("green");
        playerYellow = player("yellow");
        playerRed.buildings.push(EBuilding.SupplyConnector);
        playerBlue.buildings.push(EBuilding.SupplyConnector);
        playerGreen.buildings.push(EBuilding.SupplyConnector);
        playerYellow.buildings.push(EBuilding.SupplyConnector);
    }

    function initialize(){
        console.log("Initializing engine...");

        initializeResources();
        initializeDemandDeck();
        initializePlayers();
    }

    function playerHasEnoughConnectors(player) {
        let connectorCount = player.buildings.filter(name => name === EBuilding.SupplyConnector).length;
        let buildingCount = player.buildings.filter(name => name !== EBuilding.SupplyConnector).length;
        
        return connectorCount >= buildingCount;
    }


    return {
        initialize: initialize,
        produce: produce,
        drawDemandCard, drawDemandCard,
        addBuilding: addBuilding,
        removeBuilding: removeBuilding,
        adjustSupply: adjustSupply,
        toggleDebt: toggleDebt,
        playerHasEnoughConnectors: playerHasEnoughConnectors,
        getIncome: getIncome,
        getIncomeOrDebt: getIncomeOrDebt,
        getBuildingPrice: getBuildingPrice,
        getConsumedResources: getConsumedResources,
        getProducedResources: getProducedResources,
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
                case "nuclearReactors": return ETechnology.NuclearReactors;
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
        addDebtRed: function(debt) {
    		addDebt(playerRed, debt);
    	},
    	addDebtBlue: function(debt) {
    		addDebt(playerBlue, debt);
    	},
    	 addDebtGreen: function(debt) {
    		addDebt(playerGreen, debt);
    	},
    	 addDebtYellow: function(debt) {
    		addDebt(playerYellow, debt);
    	},
        toggleTechnology: function(player, technology) {
            switch(technology) {
                case ETechnology.MarketManipulator: toggleMarketManipulator(player); break;
                case ETechnology.CarbonFabrication: toggleCarbonFabrication(player); break;
                case ETechnology.NuclearReactors: toggleNuclearReactor(player); break;
                default:
                    console.error("Illegal argument exception. name: " + technology);
                    break;
            }
        }
    };

});