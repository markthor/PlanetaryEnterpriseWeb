deck = initializeDemandDeck()

for(i = 0; i < 50; i++) {
    print(getDemand(deck))
}

function initializeDemandDeck() {
    deck = new Object();
    deck.steel = 3;
    deck.lithium = 4;
    deck.carbon = 4;
    deck.iron = 4;
    deck.aluminium = 4;
    deck.energy = 7;
    deck.interest = 6;
    return deck;
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
    return "IllegalStateException"
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