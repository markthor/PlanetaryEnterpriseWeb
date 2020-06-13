define(["jquery", "app/weather"], function($, weather) {

    //#region Properties

    var deck;
    var power = {};
    var iron = {};
    var aluminium = {};
    var carbon = {};
    var steel = {};
    var chemicals = {};

    var playerRed = {};
    var playerGreen = {};
    var playerBlue = {};
    var playerYellow = {};

    var numberOfRoundsWithAdditionalIncome = 6;
    var additionalIncome = 20;
    var roundNumber;

    var starIncomeRequirement = 40;

    var EDevelopment = {
        MineIron: "mineIron",
        MineCarbon: "mineCarbon",
        MineAluminium: "mineAluminium",
        Furnace: "furnace",
        Lab: "lab",
        SolarPanels: "solarPanels",
        GeothermalPlant: "geothermalPlant",
        FossilPowerPlant: "fossilPowerPlant",
        SupplyConnector: "supplyConnector",
        ConstructionSite: "constructionSite",
        CarbonFabrication: "carbonFabrication",
        FusionReactor: "fusionReactor",
        GovernmentContracts: "governmentContracts",
        QuantumCommunication: "quantumCommunication",
        CloudSeedingRockets: "cloudSeedingRockets",
        NuclearDetonation: "nuclearDetonation",
        properties: {
            "mineIron": { produce: "iron", consume: ["power"], requiresPower: true, sortPriority: 0 },
            "mineCarbon": { produce: "carbon", consume: ["power"], requiresPower: true, sortPriority: 2 },
            "mineAluminium": { produce: "aluminum", consume: ["power"], requiresPower: true, sortPriority: 1 },
            "furnace": { produce: "steel", consume: ["power", "iron"], requiresPower: true, sortPriority: 3 },
            "lab": { produce: "chemicals", consume: ["iron", "carbon"], requiresPower: false, sortPriority: 4 },
            "solarPanels": { produce: "", consume: [], requiresPower: false, sortPriority: 5 },
            "geothermalPlant": { produce: ["power", "power"], consume: [], requiresPower: false, sortPriority: 6 },
            "fossilPowerPlant": { produce: ["power", "power", "power"], consume: ["carbon"], requiresPower: false, sortPriority: 7 },
            "supplyConnector": { produce: "", consume: [], requiresPower: false, sortPriority: 8 },
            "constructionSite": { produce: "", consume: [], requiresPower: false, sortPriority: 9 },
            "carbonFabrication": { produce: "", consume: [], requiresPower: false, sortPriority: 10 },
            "fusionReactor": { produce: "", consume: [], requiresPower: false, sortPriority: 11 },
            "governmentContracts": { produce: "", consume: [], requiresPower: false, sortPriority: 12 },
            "quantumCommunication": { produce: "", consume: [], requiresPower: false, sortPriority: 13},
            "cloudSeedingRockets": { produce: "", consume: [], requiresPower: false, sortPriority: 14 },
            "nuclearDetonation": { produce: "", consume: [], requiresPower: false, sortPriority: 15 }
        }
    }

    //#endregion

    //#region Initialize

    function initializeResources(){
        power = resource("power", 3, 8, randomIntInRange(2,6));
        iron = resource("iron", 6, 5, randomIntInRange(2,4));
        aluminium = resource("aluminium", 6, 5, randomIntInRange(2,4));
        carbon = resource("carbon", 6, 5, randomIntInRange(2,4));
        steel = resource("steel", 12, 5, randomIntInRange(2,5));
        chemicals = resource("chemicals", 18, 3, randomIntInRange(1,3));
    }

    function initializeDemandDeck() {
        deck = {cardsDrawn: 0};
        deck.steel = 4;
        deck.chemicals = 4;
        deck.carbon = 4;
        deck.iron = 4;
        deck.aluminium = 4;
        deck.power = 6;
        deck.firstCard = getDemand();
        deck.secondCard = getDemand();
    }

    function initializePlayers(){
        playerRed = player("red");
        playerBlue = player("blue");
        playerGreen = player("green");
        playerYellow = player("yellow");
    }

    function initialize(){
        console.log("Initializing engine...");

        initializeResources();
        initializeDemandDeck();
        initializePlayers();

        updateSolarPanelsProduction();

        loanAvailable = 0;
        roundNumber = 1;
    }

    //#endregion

    //#region Models

    function player(color){
        return {
            color: color,
            name: "Player",
            buildings: [],
            stars: 0
        };
    }

    function resource(name, price, maxSupply, supply) {
        if(!supply) {
            supply = maxSupply;
        }
        return {
            name: name,
            price: price,
            supply: supply,
            maxSupply: maxSupply,
            demand: 0,
            maxDemand: 6
        };
    }

    //#endregion

    //#region Logic

    function produce(){
        calculateStars()

        market = {
            power: $.extend(true, {}, power),
            iron: $.extend(true, {}, iron),
            aluminium: $.extend(true, {}, aluminium),
            carbon: $.extend(true, {}, carbon),
            steel: $.extend(true, {}, steel),
            chemicals: $.extend(true, {}, chemicals)
        }

        updateMarket(playerRed, market);
        updateMarket(playerBlue, market);
        updateMarket(playerGreen, market);
        updateMarket(playerYellow, market);
        correctAllPrices();

        adjustSupplyForDemand();

        popDemandCard();
        if(drawDemandTwice()) {
            popDemandCard(); //Again
        }

        weather.advanceRound();
        updateSolarPanelsProduction();
        
        roundNumber++;
    }

    //#region Price
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

    function correctAllPrices() {
        correctPrice(power);
        correctPrice(iron);
        correctPrice(aluminium);
        correctPrice(carbon);
        correctPrice(steel);
        correctPrice(chemicals);
    }

    function correctPrice(resource) {
        if(resource.price < 1) {
            resource.price = 1;
            resource.supply = resource.maxSupply;
        }
    }


    //#endregion

    //#region Supply

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

    function adjustSupplyForDemand(){
        adjustSupply(power, -power.demand);
        adjustSupply(iron, -iron.demand);
        adjustSupply(carbon, -carbon.demand);
        adjustSupply(aluminium, -aluminium.demand);
        adjustSupply(steel, -steel.demand);
        adjustSupply(chemicals, -chemicals.demand);
    }

    //#endregion

    //#region Developments

    function produceForBuilding(buildingName, player){
        if(doesPlayerHaveDevelopment(player, EDevelopment.FusionReactor)) {
            switch (buildingName) {
            case EDevelopment.MineIron: adjustSupplyNoRestrictions(iron, 1); break;
            case EDevelopment.MineAluminium: adjustSupplyNoRestrictions(aluminium, 1); break;
            case EDevelopment.MineCarbon: adjustSupplyNoRestrictions(carbon, 1); break;
            case EDevelopment.Furnace:  adjustSupplyNoRestrictions(steel, 1); adjustSupplyNoRestrictions(iron, -1); break;
            case EDevelopment.Lab:  adjustSupplyNoRestrictions(chemicals, 1); adjustSupplyNoRestrictions(aluminium, -1); adjustSupplyNoRestrictions(carbon, -1); break;
            case EDevelopment.FossilPowerPlant:  adjustSupplyNoRestrictions(power, 3); adjustSupplyNoRestrictions(carbon, -1); break;
            case EDevelopment.GeothermalPlant:  adjustSupplyNoRestrictions(power, 2); break;
            case EDevelopment.SolarPanels:  adjustSupplyNoRestrictions(power, getWeather()); break;
            default:
                console.error("Illegal argument exception. name: " + name);
                break;
            }
        } else {
            switch (buildingName) {
            case EDevelopment.MineIron: adjustSupplyNoRestrictions(iron, 1); adjustSupplyNoRestrictions(power, -1); break;
            case EDevelopment.MineAluminium: adjustSupplyNoRestrictions(aluminium, 1); adjustSupplyNoRestrictions(power, -1); break;
            case EDevelopment.MineCarbon: adjustSupplyNoRestrictions(carbon, 1); adjustSupplyNoRestrictions(power, -1); break;
            case EDevelopment.Furnace:  adjustSupplyNoRestrictions(steel, 1); adjustSupplyNoRestrictions(power, -1); adjustSupplyNoRestrictions(iron, -1); break;
            case EDevelopment.Lab:  adjustSupplyNoRestrictions(chemicals, 1); adjustSupplyNoRestrictions(aluminium, -1); adjustSupplyNoRestrictions(carbon, -1); break;
            case EDevelopment.FossilPowerPlant:  adjustSupplyNoRestrictions(power, 3); adjustSupplyNoRestrictions(carbon, -1); break;
            case EDevelopment.GeothermalPlant:  adjustSupplyNoRestrictions(power, 2); break;
            case EDevelopment.SolarPanels:  adjustSupplyNoRestrictions(power, getWeather()); break;
            default:
                console.error("Illegal argument exception. name: " + name);
                break;
            }
        }
    }

    function modifyBuilding(player, buildingName, add){
        multiplier = -1;
        if(!add) multiplier = 1;
        if(doesPlayerHaveDevelopment(player, EDevelopment.CarbonFabrication)){
            switch (buildingName) {
                case EDevelopment.MineIron: 
                case EDevelopment.MineAluminium: 
                case EDevelopment.MineCarbon: 
                case EDevelopment.Furnace: 
                case EDevelopment.Lab: 
                case EDevelopment.FossilPowerPlant: 
                    adjustSupply(carbon, 3 * multiplier);
                    break;
                case EDevelopment.GeothermalPlant: 
                    adjustSupply(chemicals, 2 * multiplier); adjustSupply(carbon, 1 * multiplier);
                    break;
                case EDevelopment.SolarPanels: 
                    adjustSupply(carbon, 3 * multiplier);
                    break;
                case EDevelopment.SupplyConnector:
                    adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EDevelopment.ConstructionSite:
                    adjustSupply(carbon, 2 * multiplier);
                    break;
                case EDevelopment.CarbonFabrication:
                    adjustSupply(chemicals, 1 * multiplier); adjustSupply(carbon, 3 * multiplier);
                    break;
                case EDevelopment.FusionReactor:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.GovernmentContracts:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.QuantumCommunication:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.CloudSeedingRockets:
                    cloudSeedingRockets();
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.NuclearDetonation:
                    nuclearDetonation();
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                default:
                    console.error("Illegal argument exception. buildingName: " + buildingName);
                    break;
            }
        } else {
            switch (buildingName) {
                case EDevelopment.MineIron: 
                case EDevelopment.MineAluminium: 
                case EDevelopment.MineCarbon: 
                case EDevelopment.Furnace: 
                case EDevelopment.Lab: 
                case EDevelopment.FossilPowerPlant: 
                    adjustSupply(steel, 2 * multiplier);
                    break;
                case EDevelopment.GeothermalPlant: 
                    adjustSupply(chemicals, 2 * multiplier); adjustSupply(steel, 1 * multiplier);
                    break;
                case EDevelopment.SolarPanels: 
                    adjustSupply(steel, 2 * multiplier);
                    break;
                case EDevelopment.SupplyConnector:
                    adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EDevelopment.ConstructionSite:
                    adjustSupply(steel, 1 * multiplier);
                    break;
                case EDevelopment.CarbonFabrication:
                    adjustSupply(chemicals, 1 * multiplier); adjustSupply(carbon, 3 * multiplier);
                    break;
                case EDevelopment.FusionReactor:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.GovernmentContracts:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.QuantumCommunication:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.CloudSeedingRockets:
                    cloudSeedingRockets();
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.NuclearDetonation:
                    nuclearDetonation();
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                default:
                    console.error("Illegal argument exception. buildingName: " + buildingName);
                    break;
            }
        }
    }

    function getBuildingPrice(player, buildingName){
        if(doesPlayerHaveDevelopment(player, EDevelopment.CarbonFabrication)){
            switch (buildingName) {
                case EDevelopment.MineIron:
                case EDevelopment.MineAluminium:
                case EDevelopment.MineCarbon:
                case EDevelopment.Furnace:
                case EDevelopment.Lab:
                case EDevelopment.FossilPowerPlant:
                    return getPrice(carbon, 3);
                case EDevelopment.GeothermalPlant:
                    return getPrice(chemicals, 2) + getPrice(carbon);
                case EDevelopment.SolarPanels:
                    return getPrice(carbon, 3);
                case EDevelopment.SupplyConnector:
                    return getPrice(aluminium);
                case EDevelopment.ConstructionSite:
                    return getPrice(carbon, 2);
                case EDevelopment.CarbonFabrication:
                    return getPrice(chemicals) + getPrice(carbon, 3);
                case EDevelopment.FusionReactor:
                    return getPrice(chemicals)
                case EDevelopment.GovernmentContracts:
                    return getPrice(chemicals)
                case EDevelopment.QuantumCommunication:
                    return getPrice(chemicals)
                case EDevelopment.CloudSeedingRockets:
                    return getPrice(chemicals)
                case EDevelopment.NuclearDetonation:
                    return getPrice(chemicals)
                default:
                    exception ="Illegal argument exception. buildingName: " + buildingName;
                    console.error(exception);
                    return exception;
            }
        } else {
            switch (buildingName) {
                case EDevelopment.MineIron: 
                case EDevelopment.MineAluminium: 
                case EDevelopment.MineCarbon: 
                case EDevelopment.Furnace: 
                case EDevelopment.Lab: 
                case EDevelopment.FossilPowerPlant: 
                    return getPrice(steel, 2);
                case EDevelopment.GeothermalPlant: 
                    return getPrice(chemicals, 2) + getPrice(steel);
                case EDevelopment.SolarPanels: 
                    return getPrice(steel, 2);
                case EDevelopment.SupplyConnector:
                    return getPrice(aluminium);
                case EDevelopment.ConstructionSite:
                    return getPrice(steel);
                case EDevelopment.CarbonFabrication:
                    return getPrice(chemicals) + getPrice(carbon, 3);
                case EDevelopment.FusionReactor:
                    return getPrice(chemicals)
                case EDevelopment.GovernmentContracts:
                    return getPrice(chemicals)
                case EDevelopment.QuantumCommunication:
                    return getPrice(chemicals)
                case EDevelopment.CloudSeedingRockets:
                    return getPrice(chemicals)
                case EDevelopment.NuclearDetonation:
                    return getPrice(chemicals)
                default:
                    exception = "Illegal argument exception. buildingName: " + buildingName;
                    console.error(exception);
                    return exception;
            }
        }
    }

    function getBuildingRevenue(buildingName, market, player){
        if(EDevelopment.properties[buildingName].requiresPower && !doesPowerConsumingBuildingsProduce(player, market)) {
            return 0;
        } else {
            return getBuildingRevenueNoRestrictions(buildingName, market, player);
        }
    }
    

    function getBuildingRevenueNoRestrictions(buildingName, market, player){
        var revenue = 0;
        if(doesPlayerHaveDevelopment(player, EDevelopment.FusionReactor)) {
            switch (buildingName) {
                case EDevelopment.MineIron: revenue = getPrice(market.iron); break;
                case EDevelopment.MineAluminium: revenue = getPrice(market.aluminium); break;
                case EDevelopment.MineCarbon: revenue = getPrice(market.carbon); break;
                case EDevelopment.Furnace: revenue = getPrice(market.steel) - getPrice(iron); break;
                case EDevelopment.Lab: revenue = getPrice(market.chemicals) - getPrice(market.carbon) - getPrice(market.aluminium); break;
                case EDevelopment.FossilPowerPlant: revenue = getPrice(market.power) * 3 - getPrice(carbon); break;
                case EDevelopment.GeothermalPlant: revenue = getPrice(market.power) * 2; break;
                case EDevelopment.SolarPanels: revenue = getPrice(market.power) * getWeather();; break;
                case EDevelopment.SupplyConnector: revenue = 0; break;
                case EDevelopment.ConstructionSite: revenue = 0; break;
                case EDevelopment.CarbonFabrication: revenue = 0; break;
                case EDevelopment.FusionReactor: revenue = 0; break;
                case EDevelopment.GovernmentContracts: revenue = 0; break;
                case EDevelopment.QuantumCommunication: revenue = 0; break;
                case EDevelopment.CloudSeedingRockets: revenue = 0; break;
                case EDevelopment.NuclearDetonation: revenue = 0; break;
                default:
                    console.error("Illegal argument exception. name: " + buildingName);
                    break;
            }
        } else {
            switch (buildingName) {
                case EDevelopment.MineIron: revenue = getPrice(market.iron) - getPrice(market.power); break;
                case EDevelopment.MineAluminium: revenue = getPrice(market.aluminium) - getPrice(market.power); break;
                case EDevelopment.MineCarbon: revenue = getPrice(market.carbon) - getPrice(market.power); break;
                case EDevelopment.Furnace: revenue = getPrice(market.steel) - getPrice(market.power) - getPrice(iron); break;
                case EDevelopment.Lab: revenue = getPrice(market.chemicals) - getPrice(market.carbon) - getPrice(market.aluminium); break;
                case EDevelopment.FossilPowerPlant: revenue = getPrice(market.power) * 3 - getPrice(carbon); break;
                case EDevelopment.GeothermalPlant: revenue = getPrice(market.power) * 2; break;
                case EDevelopment.SolarPanels: revenue = getPrice(market.power) * getWeather(); break;
                case EDevelopment.SupplyConnector: revenue = 0; break;
                case EDevelopment.ConstructionSite: revenue = 0; break;
                case EDevelopment.CarbonFabrication: revenue = 0; break;
                case EDevelopment.FusionReactor: revenue = 0; break;
                case EDevelopment.GovernmentContracts: revenue = 0; break;
                case EDevelopment.QuantumCommunication: revenue = 0; break;
                case EDevelopment.CloudSeedingRockets: revenue = 0; break;
                case EDevelopment.NuclearDetonation: revenue = 0; break;
                default:
                    console.error("Illegal argument exception. name: " + buildingName);
                    break;
            }
        }
        
        if(revenue < 0) return 0;
        return revenue;
    }

    function doesPlayerHaveDevelopment(player, development){
        if(player.buildings.includes(development)){
            return true;
        }
        else {
            return false;
        }
    }

    function doesPowerConsumingBuildingsProduce(player, market) {
        if(!doesPlayerHaveDevelopment(player, EDevelopment.FusionReactor)) {
            return true;
        }

        var totalRevenueOfPowerProducingBuildings = 0;
        player.buildings.forEach(function(building) {
            if(EDevelopment.properties[building].requiresPower) {
                totalRevenueOfPowerProducingBuildings += getBuildingRevenueNoRestrictions(building, market, player);
            }
        });

        return (totalRevenueOfPowerProducingBuildings - getPrice(chemicals, 1) > 0);
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
            i = EDevelopment.properties[a].sortPriority;
            j = EDevelopment.properties[b].sortPriority;

            return i - j;
        });
    }

    function getIncomeFromBuildings(player){
        var revenue = 0;
        player.buildings.forEach(function(building) {
            revenue += getBuildingRevenue(building, getMarket(), player);
        });
        if(doesPlayerHaveDevelopment(player, EDevelopment.FusionReactor) && doesPowerConsumingBuildingsProduce(player, getMarket())) {
            revenue -= getPrice(chemicals, 1);
        }
        return revenue;
    }

    function getIncome(player){
        var revenue = getIncomeFromBuildings(player);
        if(roundNumber <= numberOfRoundsWithAdditionalIncome) {
            revenue += additionalIncome;
        }
        return revenue;
    }

    function cloudSeedingRockets() {
        weather.cloudSeedingRockets();
        updateSolarPanelsProduction();
    }

    function nuclearDetonation() {
        weather.nuclearDetonation();
        updateSolarPanelsProduction();
    }

    function calculateStars(){
        listOfplayerIncome = [[playerRed, getIncomeFromBuildings(playerRed)],[playerBlue, getIncomeFromBuildings(playerBlue)],[playerGreen, getIncomeFromBuildings(playerGreen)],[playerYellow, getIncomeFromBuildings(playerYellow)]]
        listOfplayerIncome.sort((a, b) => (a[1] > b[1]) ? -1 : 1)

        if(listOfplayerIncome[0][1] != listOfplayerIncome[1][1]){
            if(listOfplayerIncome[0][1] > starIncomeRequirement){
                listOfplayerIncome[0][0].stars++
            }
        }
    }

    //#endregion

    //#region Market

    function updateMarket(player, market){
        player.buildings.forEach(buildingName => {
            buildingRevenue = getBuildingRevenue(buildingName, market, player);
            if(buildingRevenue > 0){
                    produceForBuilding(buildingName, player);
            }
        });
        if(doesPlayerHaveDevelopment(player, EDevelopment.FusionReactor) && doesPowerConsumingBuildingsProduce(player, market)) {
            adjustSupply(chemicals, -1);
        }
    }

    function getMarket(){
        return {
            power: power,
            iron: iron,
            aluminium: aluminium,
            carbon: carbon,
            steel: steel,
            chemicals: chemicals
        }
    }

    //#endregion

    //#region Resources

    function getProducedResources(player){
        resources = [];
        player.buildings.forEach(function(building) {
            revenue = getBuildingRevenue(building, getMarket(), player);
            if(revenue > 0){
                resources = resources.concat(EDevelopment.properties[building].produce);
            }
        });
        sortResources(resources)
        return resources;
    }

    function getConsumedResources(player){
        var resources = [];
        var nuclearReactorActivated = false;
        player.buildings.forEach(function(building) {
            revenue = getBuildingRevenue(building, getMarket(), player);
            if(revenue > 0){
                if(doesPlayerHaveDevelopment(player, EDevelopment.FusionReactor) && EDevelopment.properties[building].requiresPower){
                    resources = resources.concat(EDevelopment.properties[building].consume.filter(resource => resource !== "power"));
                    nuclearReactorActivated = true;
                } else {
                    resources = resources.concat(EDevelopment.properties[building].consume);
                }
            }
        });
        if(nuclearReactorActivated){
            resources.push("chemicals")
        }
        sortResources(resources)
        return resources;
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
            case "chemicals": return 6
            default:
                console.error("Illegal argument exception. name: " + resourceName);
                break;
        }
    }

    //#endregion

    //#region Weather

    function getWeather() {
        return weather.getWeather();
    }

    function peakWeather() {
        return weather.peakWeather();
    }

    function updateSolarPanelsProduction() {
        var currentWeather = getWeather();
        if(currentWeather === 0) {
            EDevelopment.properties[EDevelopment.SolarPanels].produce = "";
        }
        else if(currentWeather === 1) {
            EDevelopment.properties[EDevelopment.SolarPanels].produce = ["power"];
        }
        else if(currentWeather === 2) {
            EDevelopment.properties[EDevelopment.SolarPanels].produce = ["power", "power"];
        }
    }

    //#endregion

    //#region Auxiliary

    function randomIntInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //#endregion

    //#endregion

    //#region Demand

    function peekFirstDemandCard() {
        return deck.firstCard;
    }

    function peekSecondDemandCard() {
        return deck.secondCard;
    }

    function popDemandCard() {
        modifyDemandState(deck.firstCard);
        deck.firstCard = deck.secondCard;
        deck.secondCard = getDemand();
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
        temp += deck.chemicals
        if(randomInt < temp) {
            deck.chemicals = deck.chemicals - 1;
            return "chemicals"
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
            case "chemicals": chemicals.demand++; break;
            default: break;
        }
    }

    function drawDemandTwice() {
        return roundNumber < 4;
    }

    function getTotal(deck) {
        total = 0
        total += deck.steel
        total += deck.chemicals
        total += deck.carbon
        total += deck.iron
        total += deck.aluminium
        total += deck.power

        return total
    }

    //#endregion

    //#region API Layer

    /**
     * Returns an object that acts as the interface of the engine to the UI.
     */
    return {
        initialize: initialize,
        produce: produce,
        peekFirstDemandCard: peekFirstDemandCard,
        peekSecondDemandCard: peekSecondDemandCard,
        drawDemandTwice: drawDemandTwice,
        addBuilding: addBuilding,
        removeBuilding: removeBuilding,
        adjustSupply: adjustSupply,
        getIncome: getIncome,
        getIncomeFromBuildings: getIncomeFromBuildings,
        getBuildingPrice: getBuildingPrice,
        getConsumedResources: getConsumedResources,
        getProducedResources: getProducedResources,
        getWeather: getWeather,
        peakWeather: peakWeather,
        getRoundNumber: function() {
            return roundNumber;
        },
        getLoanAvailable: function() {
            return loanAvailable;
        },

        getResource: function(resourceName) {
            switch(resourceName) {
                case "power": return power;
                case "iron": return iron;
                case "aluminium": return aluminium;
                case "carbon": return carbon;
                case "steel": return steel;
                case "chemicals": return chemicals;
                default:
                    console.error("Illegal argument exception. name: " + resourceName);
                    break;
            }
        },
        getBuilding: function(buildingName) {
            switch(buildingName) {
                case "mineIron": return EDevelopment.MineIron;
                case "mineCarbon": return EDevelopment.MineCarbon;
                case "mineAluminium": return EDevelopment.MineAluminium;
                case "furnace": return EDevelopment.Furnace;
                case "lab": return EDevelopment.Lab;
                case "solarPanels": return EDevelopment.SolarPanels;
                case "geothermalPlant": return EDevelopment.GeothermalPlant;
                case "fossilPowerPlant": return EDevelopment.FossilPowerPlant;
                case "supplyConnector": return EDevelopment.SupplyConnector;
                case "constructionSite": return EDevelopment.ConstructionSite;
                case "carbonFabrication": return EDevelopment.CarbonFabrication;
                case "fusionReactor": return EDevelopment.FusionReactor;
                case "governmentContracts": return EDevelopment.GovernmentContracts;
                case "quantumCommunication": return EDevelopment.QuantumCommunication;
                case "cloudSeedingRockets": return EDevelopment.CloudSeedingRockets;
                case "nuclearDetonation": return EDevelopment.NuclearDetonation;
                default:
                    console.error("Illegal argument exception. name: " + buildingName);
                    break;
            }
        },

        getTechnology: function(technologyName){
            return "carbonFabrication";
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
        }
    };

    //#endregion
});