var deck;
var demandCardsDrawn = 0;
var power;
var iron;
var aluminium;
var carbon;
var steel;
var lithium;

var playerRed;
var playerGreen;
var playerBlue;
var playerYellow;

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

function getMultipleDemand(){
    cards = [];
    do{
        drawn = getDemand();
        cards.push(drawn);
    } while(drawn === "interest")
    return cards;
}

function getDemand() {
    total = getTotal(deck)
    if (total === 0) {
        return "nothing"
    }
    demandCardsDrawn++;
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
    return total
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
        addDebt(player, demandCardsDrawn);
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
    resources = [];
    player.buildings.forEach(function(building) {
        revenue = getBuildingRevenue(building, getMarket());
        if(revenue > 0){
            resources = resources.concat(EBuilding.properties[building].produce);
        }
    });
    return resources;
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
        power: jQuery.extend(true, {}, power),
        iron: jQuery.extend(true, {}, iron),
        aluminium: jQuery.extend(true, {}, aluminium),
        carbon: jQuery.extend(true, {}, carbon),
        steel: jQuery.extend(true, {}, steel),
        lithium: jQuery.extend(true, {}, lithium)
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
    deck = {};
    deck.steel = 3;
    deck.lithium = 4;
    deck.carbon = 4;
    deck.iron = 4;
    deck.aluminium = 4;
    deck.power = 7;
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
    console.log("Initializing...");

    initializeResources();
    initializeDemandDeck();
    initializePlayers();
}

//
// UI CODE BELOW
//

function getPlayer(playerName) {
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

function registerMarketClickListeners() {
    // Power
    $( ".box-item--power .box-item-buttons .plus" ).click(function() {
        adjustSupply(power, 1);
        renderUI();
    });
    $( ".box-item--power .box-item-buttons .minus" ).click(function() {
        adjustSupply(power, -1);
        renderUI();
    });

    // Iron
    $( ".box-item--iron .box-item-buttons .plus" ).click(function() {
        adjustSupply(iron, 1);
        renderUI();
    });
    $( ".box-item--iron .box-item-buttons .minus" ).click(function() {
        adjustSupply(iron, -1);
        renderUI();
    });

    // Aluminium
    $( ".box-item--aluminium .box-item-buttons .plus" ).click(function() {
        adjustSupply(aluminium, 1);
        renderUI();
    });
    $( ".box-item--aluminium .box-item-buttons .minus" ).click(function() {
        adjustSupply(aluminium, -1);
        renderUI();
    });

    // Carbon
    $( ".box-item--carbon .box-item-buttons .plus" ).click(function() {
        adjustSupply(carbon, 1);
        renderUI();
    });
    $( ".box-item--carbon .box-item-buttons .minus" ).click(function() {
        adjustSupply(carbon, -1);
        renderUI();
    });

    // Steel
    $( ".box-item--steel .box-item-buttons .plus" ).click(function() {
        adjustSupply(steel, 1);
        renderUI();
    });
    $( ".box-item--steel .box-item-buttons .minus" ).click(function() {
        adjustSupply(steel, -1);
        renderUI();
    });

    // Lithium
    $( ".box-item--lithium .box-item-buttons .plus" ).click(function() {
        adjustSupply(lithium, 1);
        renderUI();
    });
    $( ".box-item--lithium .box-item-buttons .minus" ).click(function() {
        adjustSupply(lithium, -1);
        renderUI();
    });
}

function registerPlayerClickListeners() {
    $(".box-item--player-red .box-item-player-header .debt img").click(function() {
        toggleDebt(playerRed)
        renderUI();
    });

    $(".box-item--player-blue .box-item-player-header .debt img").click(function() {
        toggleDebt(playerBlue)
        renderUI();
    });

    $(".box-item--player-green .box-item-player-header .debt img").click(function() {
        toggleDebt(playerGreen)
        renderUI();
    });

    $(".box-item--player-yellow .box-item-player-header .debt img").click(function() {
        toggleDebt(playerYellow)
        renderUI();
    });
}

function registerBuildingClickListeners() {
    $("[data-building]").click(function() {
        let $player_elem = $(this).parents("[data-player]");
        let player = getPlayer($player_elem.attr("data-player"));

        if ($(this).parents(".box-item-player-content-buildings").length) {
            addBuilding(player, $(this).attr("data-building"));
        } else {
            removeBuilding(player, $(this).attr("data-building"));
        }
        renderUI();
    });

    $("[data-upgrade]").click(function() {
        let $player_elem = $(this).parents("[data-player]");
        let player = getPlayer($player_elem.attr("data-player"));
        let buildingName = $(this).attr("data-upgrade");
        switch(buildingName) {
            case "marketManipulator": toggleMarketManipulator(player); break;
            case "carbonFabrication": toggleCarbonFabrication(player); break;
            case "denseConnector": toggleDenseConnector(player); break;
            default:
                console.error("Illegal argument exception. name: " + buildingName);
                break;
        }
        renderUI();
    });
}

function renderDemand() {
    var demandText = function(demand) {
        return "Demand: " + demand;
    }

    var $demand_power = $(".box-item--power .box-item-demand p");
    var $demand_iron = $(".box-item--iron .box-item-demand p");
    var $demand_aluminium = $(".box-item--aluminium .box-item-demand p");
    var $demand_carbon = $(".box-item--carbon .box-item-demand p");
    var $demand_steel = $(".box-item--steel .box-item-demand p");
    var $demand_lithium = $(".box-item--lithium .box-item-demand p");

    $demand_power.text(demandText(power.demand));
    $demand_iron.text(demandText(iron.demand));
    $demand_aluminium.text(demandText(aluminium.demand));
    $demand_carbon.text(demandText(carbon.demand));
    $demand_steel.text(demandText(steel.demand));
    $demand_lithium.text(demandText(lithium.demand));
}

function renderPrice() {
    var priceText = function(price) {
        return price + "$";
    }

    var $price_power = $(".box-item--power .box-item-price h2");
    var $price_iron = $(".box-item--iron .box-item-price h2");
    var $price_aluminium = $(".box-item--aluminium .box-item-price h2");
    var $price_carbon = $(".box-item--carbon .box-item-price h2");
    var $price_steel = $(".box-item--steel .box-item-price h2");
    var $price_lithium = $(".box-item--lithium .box-item-price h2");

    $price_power.text(priceText(power.price));
    $price_iron.text(priceText(iron.price));
    $price_aluminium.text(priceText(aluminium.price));
    $price_carbon.text(priceText(carbon.price));
    $price_steel.text(priceText(steel.price));
    $price_lithium.text(priceText(lithium.price));
}

function renderSupply() {
    var supplyText = function(demand) {
        return "Supply: " + demand;
    }
    var $supply_power = $(".box-item--power .box-item-supply p");
    var $supply_iron = $(".box-item--iron .box-item-supply p");
    var $supply_aluminium = $(".box-item--aluminium .box-item-supply p");
    var $supply_carbon = $(".box-item--carbon .box-item-supply p");
    var $supply_steel = $(".box-item--steel .box-item-supply p");
    var $supply_lithium = $(".box-item--lithium .box-item-supply p");

    $supply_power.text(supplyText(power.supply));
    $supply_iron.text(supplyText(iron.supply));
    $supply_aluminium.text(supplyText(aluminium.supply));
    $supply_carbon.text(supplyText(carbon.supply));
    $supply_steel.text(supplyText(steel.supply));
    $supply_lithium.text(supplyText(lithium.supply));

}

function renderPlayerIncome() {
    let incomeText = function(income) {
        return income + "$";
    }

    let $income_red = $(".box-item--player-red .income");
    let $income_blue = $(".box-item--player-blue .income");
    let $income_green = $(".box-item--player-green .income");
    let $income_yellow = $(".box-item--player-yellow .income");

    $income_red.text(incomeText(getIncome(playerRed)));
    $income_blue.text(incomeText(getIncome(playerBlue)));
    $income_green.text(incomeText(getIncome(playerGreen)));
    $income_yellow.text(incomeText(getIncome(playerYellow)));
}

function renderPlayerDebt() {
    let debtText = function(debt) {
        return debt + "$";
    }

    let $debt_red = $(".box-item--player-red .debt .center div");
    let $debt_blue = $(".box-item--player-blue .debt .center div");
    let $debt_green = $(".box-item--player-green .debt .center div");
    let $debt_yellow = $(".box-item--player-yellow .debt .center div");

    $debt_red.text(debtText(playerRed.debt));
    $debt_blue.text(debtText(playerBlue.debt));
    $debt_green.text(debtText(playerGreen.debt));
    $debt_yellow.text(debtText(playerYellow.debt));

    if (playerRed.accumulateDebt) {
        $(".box-item--player-red .debt img").removeClass("disabled"); 
    } else {
        $(".box-item--player-red .debt img").addClass("disabled"); 
    }

    if (playerBlue.accumulateDebt) {
        $(".box-item--player-blue .debt img").removeClass("disabled"); 
    } else {
        $(".box-item--player-blue .debt img").addClass("disabled"); 
    }

    if (playerGreen.accumulateDebt) {
        $(".box-item--player-green .debt img").removeClass("disabled"); 
    } else {
        $(".box-item--player-green .debt img").addClass("disabled"); 
    }

    if (playerYellow.accumulateDebt) {
        $(".box-item--player-yellow .debt img").removeClass("disabled"); 
    } else {
        $(".box-item--player-yellow .debt img").addClass("disabled"); 
    }
}

function renderUpgrades() {
    let toggleUpgrades = function(playerName) {
        let player = getPlayer(playerName);
        if (player.carbonFabrication) {
            $("[data-player='" + playerName + "'] [data-upgrade='carbonFabrication']").removeClass("disabled");
            $("[data-player='" + playerName + "'] [data-upgrade='carbonFabrication'] .building-price").addClass("hidden");
        } else {
            $("[data-player='" + playerName + "'] [data-upgrade='carbonFabrication']").addClass("disabled");
            $("[data-player='" + playerName + "'] [data-upgrade='carbonFabrication'] .building-price").removeClass("hidden");
        }

        if (player.denseConnector) {
            $("[data-player='" + playerName + "'] [data-upgrade='denseConnector']").removeClass("disabled");
            $("[data-player='" + playerName + "'] [data-upgrade='denseConnector'] .building-price").addClass("hidden");
        } else {
            $("[data-player='" + playerName + "'] [data-upgrade='denseConnector']").addClass("disabled");
            $("[data-player='" + playerName + "'] [data-upgrade='denseConnector'] .building-price").removeClass("hidden");
        }

        if (player.marketManipulator) {
            $("[data-player='" + playerName + "'] [data-upgrade='marketManipulator']").removeClass("disabled");
            $("[data-player='" + playerName + "'] [data-upgrade='marketManipulator'] .building-price").addClass("hidden");
        } else {
            $("[data-player='" + playerName + "'] [data-upgrade='marketManipulator']").addClass("disabled");
            $("[data-player='" + playerName + "'] [data-upgrade='marketManipulator'] .building-price").removeClass("hidden");
        }
    }
    toggleUpgrades("red");
    toggleUpgrades("blue");
    toggleUpgrades("green");
    toggleUpgrades("yellow");
}

function renderBuildings() {
    $("[data-building]").each(function() {
        let $player_elem = $(this).parents("[data-player]");
        let player = getPlayer($player_elem.attr("data-player"));
        let buildingName = $(this).attr("data-building");
        let buildingPrice = getBuildingPrice(player, buildingName);

        $(this).children(".building-price").text(buildingPrice + "$");
        $(this).children(".building-count").each(function(){
            let filter = function(name) {
                return name === buildingName;
            }
            let buildingCount = player.buildings.filter(filter).length;
            $(this).text(buildingCount);

            if (buildingCount > 0) {
                $(this).parents(".building-row").removeClass("disabled");
            } else {
                $(this).parents(".building-row").addClass("disabled");
            }
        });
    });
}

function renderUpgradePrices() {
    $("[data-upgrade]").each(function() {
        let $player_elem = $(this).parents("[data-player]");
        let player = getPlayer($player_elem.attr("data-player"));
        let buildingName = $(this).attr("data-upgrade");
        let buildingPrice = getBuildingPrice(player, buildingName);
        $(this).children(".building-price").text(buildingPrice + "$");
    });
}

function renderUI() {
    renderDemand();
    renderPrice();
    renderSupply();
    renderPlayerIncome();
    renderPlayerDebt();
    renderUpgrades();
    renderBuildings();
    renderUpgradePrices();
}

$(document).ready(function() {
    initialize();
    registerMarketClickListeners();
    registerPlayerClickListeners();
    registerBuildingClickListeners();
    renderUI();
});