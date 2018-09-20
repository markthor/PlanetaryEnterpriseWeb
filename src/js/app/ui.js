define(["jquery", "app/engine"], function($, engine) {

    function registerMarketClickListeners() {
        // Power
        $( ".box-item--power .box-item-buttons .plus" ).click(function() {
            engine.adjustSupply(engine.getResource("power"), 1);
            renderUI();
        });
        $( ".box-item--power .box-item-buttons .minus" ).click(function() {
            engine.adjustSupply(engine.getResource("power"), -1);
            renderUI();
        });

        // Iron
        $( ".box-item--iron .box-item-buttons .plus" ).click(function() {
            engine.adjustSupply(engine.getResource("iron"), 1);
            renderUI();
        });
        $( ".box-item--iron .box-item-buttons .minus" ).click(function() {
            engine.adjustSupply(engine.getResource("iron"), -1);
            renderUI();
        });

        // Aluminium
        $( ".box-item--aluminium .box-item-buttons .plus" ).click(function() {
            engine.adjustSupply(engine.getResource("aluminium"), 1);
            renderUI();
        });
        $( ".box-item--aluminium .box-item-buttons .minus" ).click(function() {
            engine.adjustSupply(engine.getResource("aluminium"), -1);
            renderUI();
        });

        // Carbon
        $( ".box-item--carbon .box-item-buttons .plus" ).click(function() {
            engine.adjustSupply(engine.getResource("carbon"), 1);
            renderUI();
        });
        $( ".box-item--carbon .box-item-buttons .minus" ).click(function() {
            engine.adjustSupply(engine.getResource("carbon"), -1);
            renderUI();
        });

        // Steel
        $( ".box-item--steel .box-item-buttons .plus" ).click(function() {
            engine.adjustSupply(engine.getResource("steel"), 1);
            renderUI();
        });
        $( ".box-item--steel .box-item-buttons .minus" ).click(function() {
            engine.adjustSupply(engine.getResource("steel"), -1);
            renderUI();
        });

        // Lithium
        $( ".box-item--lithium .box-item-buttons .plus" ).click(function() {
            engine.adjustSupply(engine.getResource("lithium"), 1);
            renderUI();
        });
        $( ".box-item--lithium .box-item-buttons .minus" ).click(function() {
            engine.adjustSupply(engine.getResource("lithium"), -1);
            renderUI();
        });
    }

    function registerPlayerClickListeners() {
        $(".box-item--player-red .box-item-player-header .debt img").click(function() {
            engine.toggleDebt(engine.getPlayer("red"));
            renderUI();
        });

        $(".box-item--player-blue .box-item-player-header .debt img").click(function() {
            engine.toggleDebt(engine.getPlayer("blue"));
            renderUI();
        });

        $(".box-item--player-green .box-item-player-header .debt img").click(function() {
            engine.toggleDebt(engine.getPlayer("green"));
            renderUI();
        });

        $(".box-item--player-yellow .box-item-player-header .debt img").click(function() {
            engine.toggleDebt(engine.getPlayer("yellow"));
            renderUI();
        });
    }

    function registerBuildingClickListeners() {
        $("[data-building]").click(function() {
            let $player_elem = $(this).parents("[data-player]");
            let player = engine.getPlayer($player_elem.attr("data-player"));
            var building = engine.getBuilding($(this).attr("data-building"));

            if ($(this).parents(".box-item-player-content-buildings").length) {
                engine.addBuilding(player, building);
            } else {
                engine.removeBuilding(player, building);
            }
            renderUI();
        });

        $("[data-upgrade]").click(function() {
            let $player_elem = $(this).parents("[data-player]");
            let player = engine.getPlayer($player_elem.attr("data-player"));
            let technologyName = $(this).attr("data-upgrade");
            var technology = engine.getTechnology(technologyName);

            engine.toggleTechnology(player, technology);
            renderUI();
        });
    }

    function registerProduceClickListener() {
        $(".box-produce").click(function() {
            engine.produce();
            engine.drawDemandCard();
            renderUI();
        });
    }

    function registerClickListeners() {
        registerMarketClickListeners();
        registerPlayerClickListeners();
        registerBuildingClickListeners();
        registerProduceClickListener();
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

        $demand_power.text(demandText(engine.getResource("power").demand));
        $demand_iron.text(demandText(engine.getResource("iron").demand));
        $demand_aluminium.text(demandText(engine.getResource("aluminium").demand));
        $demand_carbon.text(demandText(engine.getResource("carbon").demand));
        $demand_steel.text(demandText(engine.getResource("steel").demand));
        $demand_lithium.text(demandText(engine.getResource("lithium").demand));
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

        $price_power.text(priceText(engine.getResource("power").price));
        $price_iron.text(priceText(engine.getResource("iron").price));
        $price_aluminium.text(priceText(engine.getResource("aluminium").price));
        $price_carbon.text(priceText(engine.getResource("carbon").price));
        $price_steel.text(priceText(engine.getResource("steel").price));
        $price_lithium.text(priceText(engine.getResource("lithium").price));
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

        $supply_power.text(supplyText(engine.getResource("power").supply));
        $supply_iron.text(supplyText(engine.getResource("iron").supply));
        $supply_aluminium.text(supplyText(engine.getResource("aluminium").supply));
        $supply_carbon.text(supplyText(engine.getResource("carbon").supply));
        $supply_steel.text(supplyText(engine.getResource("steel").supply));
        $supply_lithium.text(supplyText(engine.getResource("lithium").supply));

    }

    function renderPlayerIncome() {
        let incomeText = function(income) {
            return income + "$";
        }

        let $income_red = $(".box-item--player-red .income");
        let $income_blue = $(".box-item--player-blue .income");
        let $income_green = $(".box-item--player-green .income");
        let $income_yellow = $(".box-item--player-yellow .income");

        $income_red.text(incomeText(engine.getIncome(engine.getPlayer("red"))));
        $income_blue.text(incomeText(engine.getIncome(engine.getPlayer("blue"))));
        $income_green.text(incomeText(engine.getIncome(engine.getPlayer("green"))));
        $income_yellow.text(incomeText(engine.getIncome(engine.getPlayer("yellow"))));
    }

    function renderPlayerDebt() {
        let debtText = function(debt) {
            return debt + "$";
        }

        let $debt_red = $(".box-item--player-red .debt .center div");
        let $debt_blue = $(".box-item--player-blue .debt .center div");
        let $debt_green = $(".box-item--player-green .debt .center div");
        let $debt_yellow = $(".box-item--player-yellow .debt .center div");

        $debt_red.text(debtText(engine.getPlayer("red").debt));
        $debt_blue.text(debtText(engine.getPlayer("blue").debt));
        $debt_green.text(debtText(engine.getPlayer("green").debt));
        $debt_yellow.text(debtText(engine.getPlayer("yellow").debt));

        if (engine.getPlayer("red").accumulateDebt) {
            $(".box-item--player-red .debt img").removeClass("disabled"); 
        } else {
            $(".box-item--player-red .debt img").addClass("disabled"); 
        }

        if (engine.getPlayer("blue").accumulateDebt) {
            $(".box-item--player-blue .debt img").removeClass("disabled"); 
        } else {
            $(".box-item--player-blue .debt img").addClass("disabled"); 
        }

        if (engine.getPlayer("green").accumulateDebt) {
            $(".box-item--player-green .debt img").removeClass("disabled"); 
        } else {
            $(".box-item--player-green .debt img").addClass("disabled"); 
        }

        if (engine.getPlayer("yellow").accumulateDebt) {
            $(".box-item--player-yellow .debt img").removeClass("disabled"); 
        } else {
            $(".box-item--player-yellow .debt img").addClass("disabled"); 
        }
    }

    function renderUpgrades() {
        let toggleUpgrades = function(playerName) {
            let player = engine.getPlayer(playerName);
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
            let player = engine.getPlayer($player_elem.attr("data-player"));
            let buildingName = $(this).attr("data-building");
            let buildingPrice = engine.getBuildingPrice(player, engine.getBuilding(buildingName));

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
            let player = engine.getPlayer($player_elem.attr("data-player"));
            let buildingName = $(this).attr("data-upgrade");
            let buildingPrice = engine.getBuildingPrice(player, engine.getTechnology(buildingName));
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

    function initialize() {
        console.log("Initializing UI...");

        registerClickListeners();
        renderUI();
    }

    return {
        initialize: initialize
    }
});