deck = new object();
var energy;
var iron;
var aluminium;
var carbon;
var steel;
var lithium;


function initialize(){
    energy = new resource("energy", 1, 10);
    iron = new resource("iron", 2, 5);
    aluminium = new resource("aluminium", 2, 5);
    carbon = new resource("carbon", 2, 5);
    steel = new resource("steel", 4, 7);
    lithium = new resource("lithium", 6, 4);
}

function getPrice(){

}

function resource(name, price, supply){
    resource = new object();
    resource.name = name;
    resource.price = price;
    resource.supply = supply;
    resource.maxSupply = supply;
    return resource;
}