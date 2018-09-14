var deck;
var demandCardsDrawn = 0;
var energy;
var iron;
var aluminium;
var carbon;
var steel;
var lithium;

var playerRed;
var playerGreen;
var playerBlue;
var playerYellow;

function resource(name, price, supply) {
    return {
        name: name,
        price: price,
        supply: supply,
        maxSupply: supply,
        demand: 0
    };
}

function getPrice(name){
    return name.price;
}

function getPrice(resource, amount){
    if(amount > resource.maxSupply) return "Illegal argument exception. name: " + resource + "amount: " + amount;  
    if(resource.supply >= amount) return amount * resource.price
    else return (amount - resource.supply) * (price + 1) + resource.supply * price;
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
        case "mineIron": adjustSupply(iron, 1); adjustSupply(energy, -1); break;
        case "mineAluminium": adjustSupply(aluminium, 1); adjustSupply(energy, -1); break;
        case "mineCarbon": adjustSupply(carbon, 1); adjustSupply(energy, -1); break;
        case "furnace":  adjustSupply(steel, 1); adjustSupply(energy, -1); adjustSupply(iron, -1); break;
        case "lab":  adjustSupply(lithium, 1); adjustSupply(aluminium, -1); adjustSupply(carbon, -1); break;
        case "fossilPowerPlant":  adjustSupply(energy, 3); adjustSupply(carbon, -1); break;
        case "geothermalPlant":  adjustSupply(energy, 2); break;
        case "windTurbine":  adjustSupply(energy, 1); break;
        default:
            return "Illegal argument exception. name: " + name;
            break;
    }
}

function buildBuilding(buildingName, carbonFabrication){
    if(carbonFabrication){
        switch (buildingName) {
            case "mineIron": 
            case "mineAluminium": 
            case "mineCarbon": 
            case "furnace": 
            case "lab": 
            case "fossilPowerPlant": 
                return adjustSupply(carbon, 3);
                break;
            case "geothermalPlant": 
                return adjustSupply(carbon, 6);
                break;
            case "windTurbine": 
                return adjustSupply(lithium) + adjustSupply(aluminium);
                break;
            case "supplyConnector":
                return adjustSupply(aluminium);
                break;
            case "constructionSite":
                return adjustSupply(carbon, 2);
                break;
            default:
                return "Illegal argument exception. name: " + name;
                break;
        }
    } else {
        switch (buildingName) {
            case "mineIron": 
            case "mineAluminium": 
            case "mineCarbon": 
            case "furnace": 
            case "lab": 
            case "fossilPowerPlant": 
                return adjustSupply(steel, 2);
                break;
            case "geothermalPlant": 
                return adjustSupply(steel, 4);
                break;
            case "windTurbine": 
                return adjustSupply(lithium) + adjustSupply(aluminium);
                break;
            case "supplyConnector":
                return adjustSupply(aluminium);
                break;
            case "constructionSite":
                return adjustSupply(steel);
                break;
            default:
                return "Illegal argument exception. name: " + name;
                break;
        }
    }
}

function getBuildingPrice(buildingName, carbonFabrication){
    if(carbonFabrication){
        switch (buildingName) {
            case "mineIron": 
            case "mineAluminium": 
            case "mineCarbon": 
            case "furnace": 
            case "lab": 
            case "fossilPowerPlant": 
                return getPrice(carbon, 3);
                break;
            case "geothermalPlant": 
                return getPrice(carbon, 6);
                break;
            case "windTurbine": 
                return getPrice(lithium) + getPrice(aluminium);
                break;
            case "supplyConnector":
                return getPrice(aluminium);
                break;
            case "constructionSite":
                return getPrice(carbon, 2);
                break;
            default:
                return "Illegal argument exception. name: " + name;
                break;
        }
    } else {
        switch (buildingName) {
            case "mineIron": 
            case "mineAluminium": 
            case "mineCarbon": 
            case "furnace": 
            case "lab": 
            case "fossilPowerPlant": 
                return getPrice(steel, 2);
                break;
            case "geothermalPlant": 
                return getPrice(steel, 4);
                break;
            case "windTurbine": 
                return getPrice(lithium) + getPrice(aluminium);
                break;
            case "supplyConnector":
                return getPrice(aluminium);
                break;
            case "constructionSite":
                return getPrice(steel);
                break;
            default:
                return "Illegal argument exception. name: " + name;
                break;
        }
    }
}

function getBuildingRevenue(buildingName, market){
    revenue = 0;
    switch (buildingName) {
        case "mineIron": revenue = getPrice(market.iron) - getPrice(market.energy); break;
        case "mineAluminium": revenue = getPrice(market.aluminium) - getPrice(market.energy); break;
        case "mineCarbon": revenue = getPrice(market.carbon) - getPrice(market.energy); break;
        case "furnace": revenue = getPrice(market.steel) - getPrice(market.energy) - getPrice(iron); break;
        case "lab": revenue = getPrice(market.iron) - getPrice(market.energy); break;
        case "fossilPowerPlant": revenue = getPrice(market.energy) * 3 - getPrice(carbon); break;
        case "geothermalPlant": revenue = getPrice(market.energy) * 2; break;
        case "windTurbine": revenue = getPrice(market.energy); break;
        case "supplyConnector": revenue = 0; break;
        case "constructionSite": revenue = 0; break;
        default:
            return "Illegal argument exception. name: " + buildingName;
            break;
    }
    if(revenue < 0) return 0;
}

function player(color){
    return {
        color: color,
        debt: 0,
        accumulateDebt: false,
        buildings: []
    };
}

function addDebt(player, amount){
    player.debt += amount;
}

function addBuilding(player, buildingName){
    player.buildings.put(name);
}

function getDemand(deck) {
    total = getTotal(deck)
    if (total === 0) {
        return "nothing"
    }
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
    temp += deck.energy
    if(randomInt < temp) {
        deck.energy = deck.energy - 1;
        return "energy"
    }
    temp += deck.interest
    if(randomInt < temp) {
        deck.interest = deck.interest - 1;
        return "interest"
    }
    return "IllegalStateException. Deck: " + deck
}

function getTotal(deck) {
    total = 0
    total += deck.steel
    total += deck.lithium
    total += deck.carbon
    total += deck.iron
    total += deck.aluminium
    total += deck.energy
    total += deck.interest
    return total
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
    }
}

function getMarket(){
    return {
        energy: energy,
        iron: iron,
        aluminium: aluminium,
        carbon: carbon,
        steel: steel,
        lithium: lithium
    }
}

function getIncome(player){
    if(player.accumulateDebt) {
        addDebt(player, demandCardsDrawn);
        return demandCardsDrawn;
    } else{
        revenue = 0;
        player.buildings.forEach(function(building) {
            revenue += getBuildingRevenue(building, getMarket());
        });
        return revenue;
    }
}

function adjustSupplyForDemand(){
    adjustSupply(energy, -energy.demand);
    adjustSupply(iron, -iron.demand);
    adjustSupply(carbon, -carbon.demand);
    adjustSupply(aluminium, -aluminium.demand);
    adjustSupply(lithium, -lithium.demand);
}

function produce(){
    market = {
        energy: jQuery.extend(true, {}, energy),
        iron: jQuery.extend(true, {}, iron),
        aluminium: jQuery.extend(true, {}, aluminium),
        carbon: jQuery.extend(true, {}, carbon),
        steel: jQuery.extend(true, {}, steel),
        lithium: jQuery.extend(true, {}, lithium)
    }

    updateMarket(playerRed, market);
    updateMarket(playerBlue, market);
    updateMarket(playerGreen, market);
    updateMarket(playerRed, market);

    adjustSupplyForDemand();
}

function initializeResources(){
    energy = resource("energy", 1, 10);
    iron = resource("iron", 2, 5);
    aluminium = resource("aluminium", 2, 5);
    carbon = resource("carbon", 2, 5);
    steel = resource("steel", 4, 7);
    lithium = resource("lithium", 6, 4);
}

function initializeDemandDeck() {
    deck = {};
    deck.steel = 3;
    deck.lithium = 4;
    deck.carbon = 4;
    deck.iron = 4;
    deck.aluminium = 4;
    deck.energy = 7;
    deck.interest = 6;
    return deck;
}

function initializePlayers(){
    playerRed = player("red");
    playerGreen = player("green");
    playerBlue = player("blue");
    playerYellow = player("yellow");
}

function initialize(){
    initializeResources();
    initializeDemandDeck();
    initializePlayers();
}