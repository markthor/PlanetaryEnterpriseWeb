define(["jquery", "app/weather", "app/configuration"], function($, weather, _configuration) {

    //#region Properties

    var demandDeck;
    var supplyDeck;
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

    var roundNumber;

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
        CloudSeedingRockets: "cloudSeedingRockets",
        NuclearDetonation: "nuclearDetonation",
        Headquarter: "headquarter",
        properties: {
            "mineIron": { produce: "iron", consume: ["power"], requiresPower: true, sortPriority: 0 },
            "mineCarbon": { produce: "carbon", consume: ["power"], requiresPower: true, sortPriority: 2 },
            "mineAluminium": { produce: "aluminium", consume: ["power"], requiresPower: true, sortPriority: 1 },
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
            "cloudSeedingRockets": { produce: "", consume: [], requiresPower: false, sortPriority: 13 },
            "nuclearDetonation": { produce: "", consume: [], requiresPower: false, sortPriority: 14 },
            "headquarter": { produce: "", consume: [], requiresPower: false, sortPriority: 15 }
        }
    }

    var marketHistory = {};

    //#endregion

    //#region Initialize

    function initializeResources(){
        power = resource("power", 2, 8, randomIntInRange(2,6));
        iron = resource("iron", 6, 5, randomIntInRange(2,4));
        aluminium = resource("aluminium", 6, 5, 5);
        carbon = resource("carbon", 6, 5, randomIntInRange(2,4));
        steel = resource("steel", 12, 4, 4);
        chemicals = resource("chemicals", 18, 3, randomIntInRange(1,5));
    }

    function initializeDemandDeck() {
        demandDeck = {cardsDrawn: 0};
        demandDeck.steel = 4;
        demandDeck.chemicals = 4;
        demandDeck.carbon = 4;
        demandDeck.iron = 4;
        demandDeck.aluminium = 4;
        demandDeck.power = 6;
        demandDeck.firstCard = getDemand();
        demandDeck.secondCard = getDemand();
    }

    function initializeSupplyDeck() {
        supplyDeck = {cardsDrawn: 0};
        supplyDeck.steelShortage = 2;
        supplyDeck.chemicalsShortage = 2;
        supplyDeck.carbonShortage = 2;
        supplyDeck.ironShortage = 2;
        supplyDeck.aluminiumShortage = 2;
        supplyDeck.powerShortage = 3;
        supplyDeck.steelSurplus = 2;
        supplyDeck.chemicalsSurplus = 2;
        supplyDeck.carbonSurplus = 2;
        supplyDeck.ironSurplus = 2;
        supplyDeck.aluminiumSurplus = 2;
        supplyDeck.powerSurplus = 3;
        supplyDeck.firstCard = getSupply();
        supplyDeck.secondCard = getSupply();
    }

    function initializePlayers(){
        playerRed = player("red");
        playerBlue = player("blue");
        playerGreen = player("green");
        playerYellow = player("yellow");
    }

    function initializePlayerGovernmentContracts(){
        let obj = {};
        let resources = ["power", "iron", "aluminium", "carbon", "steel", "chemicals"];

        resources.forEach(function(resource) {
            obj[resource] = {
                "enabled": false,
                "modifier": 0 // How much effect the contract had on demand
            }
        });

        return obj;
    }

    function initialize(){
        console.log("Initializing engine...");

        initializeResources();
        initializeDemandDeck();
        initializeSupplyDeck();
        initializePlayers();

        updateSolarPanelsProduction();

        roundNumber = 1;

        saveMarketHistory();
    }

    //#endregion

    //#region Models

    function player(color){
        return {
            color: color,
            name: "Player",
            buildings: [],
            stars: 0,
            score: 0,
            governmentContracts: initializePlayerGovernmentContracts(),
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
            maxDemand: 1000
        };
    }

    //#endregion

    //#region Logic

    function produce(){
        playerRed.score += getIncomeFromBuildings(playerRed)
        playerBlue.score += getIncomeFromBuildings(playerBlue)
        playerGreen.score += getIncomeFromBuildings(playerGreen)
        playerYellow.score += getIncomeFromBuildings(playerYellow)

        playerRed.score += getHqScore(playerRed);
        playerBlue.score += getHqScore(playerBlue);
        playerGreen.score += getHqScore(playerGreen);
        playerYellow.score += getHqScore(playerYellow);

        marketCopy = getMarketCopy();

        updateMarket(playerRed, marketCopy);
        updateMarket(playerBlue, marketCopy);
        updateMarket(playerGreen, marketCopy);
        updateMarket(playerYellow, marketCopy);
        correctAllPrices();

        adjustSupplyForDemand();

        popDemandCard();
        if(drawDemandTwice()) {
            popDemandCard(); //Again
        }

        popSupplyCard();
        if(drawSupplyTwice()) {
            popSupplyCard(); //Again
        }

        weather.advanceRound();
        updateSolarPanelsProduction();
        
        roundNumber++;

        saveMarketHistory();
    }

    //#endregion

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

    function getPriceStatic(resource, amount){
        if(!amount) amount = 1;
        return getPrice(resource, 1) * amount;
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
            case EDevelopment.Lab:  adjustSupplyNoRestrictions(chemicals, 1); adjustSupplyNoRestrictions(iron, -1); adjustSupplyNoRestrictions(carbon, -1); break;
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
            case EDevelopment.Lab:  adjustSupplyNoRestrictions(chemicals, 1); adjustSupplyNoRestrictions(iron, -1); adjustSupplyNoRestrictions(carbon, -1); break;
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
                    adjustSupply(carbon, 4 * multiplier);
                    break;
                case EDevelopment.FossilPowerPlant: 
                    adjustSupply(carbon, 2 * multiplier); adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EDevelopment.GeothermalPlant: 
                    adjustSupply(carbon, 2 * multiplier); adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.SolarPanels: 
                    adjustSupply(carbon, 2 * multiplier); adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EDevelopment.SupplyConnector:
                    adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EDevelopment.ConstructionSite:
                    adjustSupply(carbon, 2 * multiplier);
                    break;
                case EDevelopment.CarbonFabrication:
                    adjustSupply(carbon, 2 * multiplier);
                    break;
                case EDevelopment.FusionReactor:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.GovernmentContracts:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.CloudSeedingRockets:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.NuclearDetonation:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.Headquarter:
                    adjustSupply(chemicals, 1 * multiplier); adjustSupply(carbon, 6 * multiplier);
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
                    adjustSupply(steel, 2 * multiplier);
                    break;
                case EDevelopment.FossilPowerPlant: 
                    adjustSupply(steel, 1 * multiplier); adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EDevelopment.GeothermalPlant: 
                    adjustSupply(steel, 1 * multiplier); adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.SolarPanels: 
                    adjustSupply(steel, 1 * multiplier); adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EDevelopment.SupplyConnector:
                    adjustSupply(aluminium, 1 * multiplier);
                    break;
                case EDevelopment.ConstructionSite:
                    adjustSupply(steel, 1 * multiplier);
                    break;
                case EDevelopment.CarbonFabrication:
                    adjustSupply(carbon, 2 * multiplier);
                    break;
                case EDevelopment.FusionReactor:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.GovernmentContracts:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.CloudSeedingRockets:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.NuclearDetonation:
                    adjustSupply(chemicals, 1 * multiplier);
                    break;
                case EDevelopment.Headquarter:
                    adjustSupply(chemicals, 1 * multiplier); adjustSupply(steel, 3 * multiplier);
                    break;
                default:
                    console.error("Illegal argument exception. buildingName: " + buildingName);
                    break;
            }
        }
    }

    function getBuildingPrice(player, buildingName){
        var currentMarket = getMarketAtStartOfCurrentRound();
        if(doesPlayerHaveDevelopment(player, EDevelopment.CarbonFabrication)){
            switch (buildingName) {
                case EDevelopment.MineIron:
                case EDevelopment.MineAluminium:
                case EDevelopment.MineCarbon:
                case EDevelopment.Furnace:
                case EDevelopment.Lab:
                    return getPriceStatic(currentMarket.carbon, 4);
                case EDevelopment.FossilPowerPlant:
                    return getPriceStatic(currentMarket.carbon, 2) + getPriceStatic(currentMarket.aluminium);
                case EDevelopment.GeothermalPlant:
                    return getPriceStatic(currentMarket.chemicals) + getPriceStatic(currentMarket.carbon, 2);
                case EDevelopment.SolarPanels:
                    return getPriceStatic(currentMarket.carbon, 2) + getPriceStatic(currentMarket.aluminium);
                case EDevelopment.SupplyConnector:
                    return getPriceStatic(currentMarket.aluminium);
                case EDevelopment.ConstructionSite:
                    return getPriceStatic(currentMarket.carbon, 2);
                case EDevelopment.CarbonFabrication:
                    return getPriceStatic(currentMarket.carbon, 2);
                case EDevelopment.FusionReactor:
                    return getPriceStatic(currentMarket.chemicals)
                case EDevelopment.GovernmentContracts:
                    return getPriceStatic(currentMarket.chemicals)
                case EDevelopment.CloudSeedingRockets:
                    return getPriceStatic(currentMarket.chemicals)
                case EDevelopment.NuclearDetonation:
                    return getPriceStatic(currentMarket.chemicals)
                case EDevelopment.Headquarter:
                    return getPriceStatic(currentMarket.chemicals) + getPriceStatic(currentMarket.carbon, 6);
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
                    return getPriceStatic(currentMarket.steel, 2);
                case EDevelopment.FossilPowerPlant: 
                    return getPriceStatic(currentMarket.steel, 1) + getPriceStatic(currentMarket.aluminium);
                case EDevelopment.GeothermalPlant: 
                return getPriceStatic(currentMarket.chemicals) + getPriceStatic(currentMarket.steel, 1);
                case EDevelopment.SolarPanels: 
                    return getPriceStatic(currentMarket.steel, 1) + getPriceStatic(currentMarket.aluminium); 
                case EDevelopment.SupplyConnector:
                    return getPriceStatic(currentMarket.aluminium);
                case EDevelopment.ConstructionSite:
                    return getPriceStatic(currentMarket.steel);
                case EDevelopment.CarbonFabrication:
                    return getPriceStatic(currentMarket.carbon, 2);
                case EDevelopment.FusionReactor:
                    return getPriceStatic(currentMarket.chemicals)
                case EDevelopment.GovernmentContracts:
                    return getPriceStatic(currentMarket.chemicals)
                case EDevelopment.CloudSeedingRockets:
                    return getPriceStatic(currentMarket.chemicals)
                case EDevelopment.NuclearDetonation:
                    return getPriceStatic(currentMarket.chemicals)
                case EDevelopment.Headquarter:
                    return getPriceStatic(currentMarket.chemicals) + getPriceStatic(currentMarket.steel, 3);
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
                case EDevelopment.Lab: revenue = getPrice(market.chemicals) - getPrice(market.carbon) - getPrice(market.iron); break;
                case EDevelopment.FossilPowerPlant: revenue = getPrice(market.power) * 3 - getPrice(carbon); break;
                case EDevelopment.GeothermalPlant: revenue = getPrice(market.power) * 2; break;
                case EDevelopment.SolarPanels: revenue = getPrice(market.power) * getWeather();; break;
                case EDevelopment.SupplyConnector: revenue = 0; break;
                case EDevelopment.ConstructionSite: revenue = 0; break;
                case EDevelopment.CarbonFabrication: revenue = 0; break;
                case EDevelopment.FusionReactor: revenue = 0; break;
                case EDevelopment.GovernmentContracts: revenue = 0; break;
                case EDevelopment.CloudSeedingRockets: revenue = 0; break;
                case EDevelopment.NuclearDetonation: revenue = 0; break;
                case EDevelopment.Headquarter: revenue = 0; break;
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
                case EDevelopment.Lab: revenue = getPrice(market.chemicals) - getPrice(market.carbon) - getPrice(market.iron); break;
                case EDevelopment.FossilPowerPlant: revenue = getPrice(market.power) * 3 - getPrice(carbon); break;
                case EDevelopment.GeothermalPlant: revenue = getPrice(market.power) * 2; break;
                case EDevelopment.SolarPanels: revenue = getPrice(market.power) * getWeather(); break;
                case EDevelopment.SupplyConnector: revenue = 0; break;
                case EDevelopment.ConstructionSite: revenue = 0; break;
                case EDevelopment.CarbonFabrication: revenue = 0; break;
                case EDevelopment.FusionReactor: revenue = 0; break;
                case EDevelopment.GovernmentContracts: revenue = 0; break;
                case EDevelopment.CloudSeedingRockets: revenue = 0; break;
                case EDevelopment.NuclearDetonation: revenue = 0; break;
                case EDevelopment.Headquarter: revenue = 0; break;
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

        //Handle developments with other effects when bought. higher order function maybe? Or specific buy methods for those developments, like for government contracts
        switch (buildingName) {
            case EDevelopment.CloudSeedingRockets:
                cloudSeedingRockets();
                break;
            case EDevelopment.NuclearDetonation:
                nuclearDetonation();
                break;
        }
    }

    function buyGovernmentContract(player, resource){
        // Ensure player has not already bought contract for given resource
        if (player.governmentContracts[resource.name].enabled) {
            console.log("Player " + player.name + " already has a govContract for " + resource.name);
            return;
        }

        var demandToAdd = 3;
        console.log("Current demand: " + resource.demand);
        resource.demand += 3
        console.log("New demand: " + resource.demand);

        // Keep track of which resource(s) contracts have been bought for
        player.governmentContracts[resource.name].enabled = true;

        // Keep track of how much the contract modified demand (for removal)
        player.governmentContracts[resource.name].modifier = demandToAdd;

        addBuilding(player, "governmentContracts")
    }

    function getHqScore(player){
        hqs = player.buildings.filter(building => building === EDevelopment.Headquarter).length;
        if (player.hqsScored === undefined) {
            player.hqsScored = 0;
        }
        hqsToScore = hqs - player.hqsScored;
        player.hqsScored = hqs;
        return hqsToScore * 80;
    }

    function removeGovernmentContract(player, resource){
        let contract = player.governmentContracts[resource.name];
        if (!contract.enabled) {
            console.log("Player " + player.name + " does not have a govContract for " + resource.name);
            return;
        }

        // Disable gov contract
        contract.enabled = false;

        // Remove the previously created demand and reset modifier
        resource.demand -= contract.modifier;
        contract.modifier = 0;

        // Remove building
        removeBuilding(player, "governmentContracts")
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
        if(roundNumber <= _configuration.numberOfRoundsWithAdditionalIncome) {
            revenue += _configuration.additionalIncome;
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

    function getMarketAtStartOfCurrentRound(){
        return getMarketHistory()[roundNumber];
    }

    function getMarketHistory(){
        return marketHistory;
    }

    function saveMarketHistory(){
        marketHistory[roundNumber] = getMarketCopy()
    }

    function getMarketCopy() {
        return {
            power: $.extend(true, {}, power),
            iron: $.extend(true, {}, iron),
            aluminium: $.extend(true, {}, aluminium),
            carbon: $.extend(true, {}, carbon),
            steel: $.extend(true, {}, steel),
            chemicals: $.extend(true, {}, chemicals)
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

    //#region Demand

    function peekFirstDemandCard() {
        return demandDeck.firstCard;
    }

    function peekSecondDemandCard() {
        return demandDeck.secondCard;
    }

    function popDemandCard() {
        modifyDemandState(demandDeck.firstCard);
        demandDeck.firstCard = demandDeck.secondCard;
        demandDeck.secondCard = getDemand();
    }

    function getDemand() {
        total = getTotalDemandDeck(demandDeck)
        if (total === 0) {
            return "nothing"
        }
        demandDeck.cardsDrawn++;
        randomInt = Math.floor(Math.random() * total);
        temp = 0
        temp += demandDeck.steel
        if(randomInt < temp) {
            demandDeck.steel = demandDeck.steel - 1;
            return "steel"
        }
        temp += demandDeck.chemicals
        if(randomInt < temp) {
            demandDeck.chemicals = demandDeck.chemicals - 1;
            return "chemicals"
        }
        temp += demandDeck.carbon
        if(randomInt < temp) {
            demandDeck.carbon = demandDeck.carbon - 1;
            return "carbon"
        }
        temp += demandDeck.iron
        if(randomInt < temp) {
            demandDeck.iron = demandDeck.iron - 1;
            return "iron"
        }
        temp += demandDeck.aluminium
        if(randomInt < temp) {
            demandDeck.aluminium = demandDeck.aluminium - 1;
            return "aluminium"
        }
        temp += demandDeck.power
        if(randomInt < temp) {
            demandDeck.power = demandDeck.power - 1;
            return "power"
        }
        exception = "IllegalStateException. Deck: " + demandDeck
        console.error(exception);
        return exception
    }

    function getTotalDemandDeck(deck) {
        return deck.steel + deck.chemicals + deck.carbon + deck.iron + deck.aluminium + deck.power;
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

    function getSupply() {
        total = getTotalSupplyDeck(supplyDeck)
        if (total === 0) {
            return "nothing"
        }
        supplyDeck.cardsDrawn++;
        randomInt = Math.floor(Math.random() * total);
        temp = 0
        temp += supplyDeck.steelShortage        
        if(randomInt < temp) {
            supplyDeck.steelShortage = supplyDeck.steelShortage - 1;
            return "steelShortage"
        }
        temp += supplyDeck.chemicalsShortage
        if(randomInt < temp) {
            supplyDeck.chemicalsShortage = supplyDeck.chemicalsShortage - 1;
            return "chemicalsShortage"
        }
        temp += supplyDeck.carbonShortage
        if(randomInt < temp) {
            supplyDeck.carbonShortage = supplyDeck.carbonShortage - 1;
            return "carbonShortage"
        }
        temp += supplyDeck.ironShortage
        if(randomInt < temp) {
            supplyDeck.ironShortage = supplyDeck.ironShortage - 1;
            return "ironShortage"
        }
        temp += supplyDeck.aluminiumShortage
        if(randomInt < temp) {
            supplyDeck.aluminiumShortage = supplyDeck.aluminiumShortage - 1;
            return "aluminiumShortage"
        }
        temp += supplyDeck.powerShortage
        if(randomInt < temp) {
            supplyDeck.powerShortage = supplyDeck.powerShortage - 1;
            return "powerShortage"
        }
        temp += supplyDeck.steelSurplus
        if(randomInt < temp) {
            supplyDeck.steelSurplus = supplyDeck.steelSurplus - 1;
            return "steelSurplus"
        }
        temp += supplyDeck.chemicalsSurplus

        if(randomInt < temp) {
            supplyDeck.chemicalsSurplus = supplyDeck.chemicalsSurplus - 1;
            return "chemicalsSurplus"
        }
        temp += supplyDeck.carbonSurplus
        if(randomInt < temp) {
            supplyDeck.carbonSurplus = supplyDeck.carbonSurplus - 1;
            return "carbonSurplus"
        }
        temp += supplyDeck.ironSurplus
        if(randomInt < temp) {
            supplyDeck.ironSurplus = supplyDeck.ironSurplus - 1;
            return "ironSurplus"
        }
        temp += supplyDeck.aluminiumSurplus
        if(randomInt < temp) {
            supplyDeck.aluminiumSurplus = supplyDeck.aluminiumSurplus - 1;
            return "aluminiumSurplus"
        }
        temp += supplyDeck.powerSurplus
        if(randomInt < temp) {
            supplyDeck.powerSurplus = supplyDeck.powerSurplus - 1;
            return "powerSurplus"
        }
        exception = "IllegalStateException. Deck: " + supplyDeck
        console.error(exception);
        return exception
    }

    function getTotalSupplyDeck(deck) {
        return deck.steelShortage + deck.chemicalsShortage + deck.carbonShortage + deck.ironShortage + deck.aluminiumShortage + deck.powerShortage + deck.steelSurplus + deck.chemicalsSurplus + deck.carbonSurplus + deck.ironSurplus + deck.aluminiumSurplus + deck.powerSurplus;
    }

    function peekFirstSupplyCard() {
        return supplyDeck.firstCard;
    }

    function peekSecondSupplyCard() {
        return supplyDeck.secondCard;
    }

    function popSupplyCard() {
        modifySupplyState(supplyDeck.firstCard);
        supplyDeck.firstCard = supplyDeck.secondCard;
        supplyDeck.secondCard = getSupply();
    }

    function modifySupplyState(card) {
        console.log("Modifying supply state for card: " + card);
        switch(card) {
            case "powerShortage": adjustSupply(power, -8); break;
            case "ironShortage": adjustSupply(iron, -6); break;
            case "aluminiumShortage": adjustSupply(aluminium, -6); break;
            case "carbonShortage": adjustSupply(carbon, -6); break;
            case "steelShortage": adjustSupply(steel, -4); break;
            case "chemicalsShortage": adjustSupply(chemicals, -4); break;
            case "powerSurplus": adjustSupply(power, 8); break;
            case "ironSurplus": adjustSupply(iron, 6); break;
            case "aluminiumSurplus": adjustSupply(aluminium, 6); break;
            case "carbonSurplus": adjustSupply(carbon, 6); break;
            case "steelSurplus": adjustSupply(steel, 4); break;
            case "chemicalsSurplus": adjustSupply(chemicals, 4); break;
            default: break;
        }
    }

    function drawDemandTwice() {
        return roundNumber < 4;
    }

    function drawSupplyTwice() {
        return roundNumber > 8;
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
        peekFirstSupplyCard: peekFirstSupplyCard,
        peekSecondSupplyCard: peekSecondSupplyCard,
        drawSupplyTwice: drawSupplyTwice,
        addBuilding: addBuilding,
        removeBuilding: removeBuilding,
        adjustSupply: adjustSupply,
        getIncome: getIncome,
        getIncomeFromBuildings: getIncomeFromBuildings,
        getBuildingPrice: getBuildingPrice,
        getConsumedResources: getConsumedResources,
        getProducedResources: getProducedResources,
        getWeather: getWeather,
        buyGovernmentContract: buyGovernmentContract,
        removeGovernmentContract: removeGovernmentContract,
        getMarketHistory: getMarketHistory,
        getRoundNumber: function() {
            return roundNumber;
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
                case "cloudSeedingRockets": return EDevelopment.CloudSeedingRockets;
                case "nuclearDetonation": return EDevelopment.NuclearDetonation;
                case "headquarter": return EDevelopment.Headquarter;
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
        },

        getScore: function(player) {
            return player.score;
        }
    };

    //#endregion
});