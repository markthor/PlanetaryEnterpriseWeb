define(["jquery", "handlebars", "app/engine"], function($, Handlebars, engine) {

    // Get engine player variable from ancestor in DOM
    var getParentPlayer = function($elem) {
        let $player_elem = $elem.parents(".player-container[data-player]");
        return engine.getPlayer($player_elem.attr("data-player"));
    }

    // Get engine resource variable from ancestor in DOM
    var getParentResource = function($elem) {
        let $resource_elem = $elem.parents(".resource-container[data-resource]");
        return engine.getResource($resource_elem.attr("data-resource"));
    }

    function registerResourceClickListeners() {

        // Click listener for supply +/- buttons
        $(".box-item-buttons [data-val]").click(function() {
            engine.adjustSupply(getParentResource($(this)), $(this).data("val"));
            renderUI();
        });
    }

    function registerPlayerClickListeners() {

        // Click listener for debt img
        $(".debt img").click(function() {
            engine.toggleDebt(getParentPlayer($(this)));
            renderUI();
        });

        // Click listener for buildings
        $("[data-building]").click(function() {
            let player = getParentPlayer($(this));
            let buildingName = $(this).attr("data-building");
            let building = engine.getBuilding(buildingName);

            // Case for bottom building pane
            if ($(this).parents(".box-item-player-content-buildings").length) {
                // Disabled if not enough connectors
                if ($(this).hasClass("disabled")) {
                    return;
                }

                let $popover_elem = $(this).find(".popover");

                // Show popover instead of adding building if popover exists
                if ($popover_elem.length) {
                    $("#overlay").css("display", "block");
                    $popover_elem.css("display", "flex");
                } else {
                    engine.addBuilding(player, building);
                }
            // Case for buildings in player inventory
            } else {
                engine.removeBuilding(player, building);
            }
            renderUI();
        });

        // Click listener for custom mine popover
        $("[data-mine]").click(function(event) {
            event.stopPropagation();
            let player = getParentPlayer($(this));
            let building = engine.getBuilding($(this).attr("data-mine"));
            engine.addBuilding(player, building);

            $(this).parents(".popover").css("display", "none");
            $("#overlay").css("display", "none");
            renderUI();
        });

        // Click listener for technology
        $("[data-technology]").click(function() {
            let technology = engine.getTechnology($(this).attr("data-technology"));

            engine.toggleTechnology(getParentPlayer($(this)), technology);
            renderUI();
        });
    }

    function registerProduceClickListener() {

        // Click listener for overlay
        $("#overlay").click(function() {
            $(".popover").css("display", "none");
            $("#popup").css("display", "none");
            $(this).css("display", "none");
        });

        $("#produceBtn").click(function() {
            var firstDemandCard = engine.peekFirstDemandCard();
            var secondDemandCard = engine.peekSecondDemandCard();
            var demandString;
            if(engine.drawDemandTwice()) {
                demandString = "Demand: " + firstDemandCard + " and " + secondDemandCard;
            } else {
                demandString = "Demand: " + firstDemandCard;
            }

            $(".prod-table__column__content").each(function() {
                let $player_elem = $(this).parents(".prod-table__column[data-player]");
                $(this).text(engine.getIncomeOrDebt(engine.getPlayer($player_elem.attr("data-player"))) + "$");
            });

            // Set player names
            $(".prod-table__column__header .name").each(function() {
                let $player_elem = $(this).parents(".prod-table__column[data-player]");
                $(this).text(engine.getPlayer($player_elem.attr("data-player")).name);
            });
            
            $("#overlay").css("display", "block");
            $("#popup").css("display", "flex");
            $("#popup .prod-demand h1").text(demandString);
        });

        $("#popup .prod-buttons__produce").click(function() {
            $("#popup").css("display", "none");
            $("#overlay").css("display", "none");
            engine.produce();
            renderUI();
        });

        $("#popup .prod-buttons__cancel").click(function() {
            $("#popup").css("display", "none");
            $("#overlay").css("display", "none");
        });
    }

    function registerClickListeners() {
        registerResourceClickListeners();
        registerPlayerClickListeners();
        registerProduceClickListener();
    }

    function renderResources() {

        // Render demand
        $(".box-item-demand p").each(function() {
            $(this).text("Demand: " + getParentResource($(this)).demand);
        });

        // Render price
        $(".box-item-price h2").each(function() {
            $(this).text(getParentResource($(this)).price + "$");
        });

        // Render supply
        $(".box-item-supply").each(function() {
            let resource = getParentResource($(this));
            let $child_elems = $(this).find(".supply-template");

            for (i = 0; i < resource.maxSupply; i++) {
                if (resource.supply > i) {
                    $child_elems.eq(i).removeClass("supply-template--inactive");
                } else {
                    $child_elems.eq(i).addClass("supply-template--inactive");
                }
            }
        });
    }

    function renderPlayers() {

        // Render name
        $(".player-container .header .name").each(function() {
            $(this).text(getParentPlayer($(this)).name);
        })

        // Render income
        $(".income").each(function() {
            $(this).text(engine.getIncome(getParentPlayer($(this))) + "$");
        });

        // Render debt
        $(".debt .center div").each(function() {
            let player = getParentPlayer($(this));
            let $img_elem = $(this).parents(".debt").find("img");

            $(this).text(player.debt + "$");
            if (player.accumulateDebt) {
                $img_elem.removeClass("disabled");
            } else {
                $img_elem.addClass("disabled");
            }
        });

        // Render buildings
        $("[data-building]").each(function() {
            let player = getParentPlayer($(this));
            let buildingName = $(this).attr("data-building");
            let building = engine.getBuilding(buildingName);
            let price = engine.getBuildingPrice(player, building);

            // Applies to buildings in bottom pane that can be purchased
            $(this).find(".building-price").each(function() {
                $(this).text(price + "$");
                if (!engine.playerHasEnoughConnectors(player) && buildingName !== "supplyConnector") {
                    $(this).parents(".building-row").addClass("disabled");
                } else {
                    $(this).parents(".building-row").removeClass("disabled");
                }
            });
            // Applies to buildings that are in player inventories (already purchased)
            $(this).find(".building-count").each(function(){
                let buildingCount = player.buildings.filter(name => name === buildingName).length;
                
                $(this).text(buildingCount);
                if (buildingCount > 0) {
                    $(this).parents(".building-row").removeClass("disabled");
                } else {
                    $(this).parents(".building-row").addClass("disabled");
                }
            });
        });

        // Render technology
        $("[data-technology]").each(function() {
            let player = getParentPlayer($(this));
            let technology = engine.getTechnology($(this).attr("data-technology"));
            let price = engine.getBuildingPrice(player, technology);
            let $price_elem = $(this).find(".building-price");

            $price_elem.text(price + "$");
            if (player[technology]) {
                $(this).removeClass("disabled");
                $price_elem.addClass("hidden");
            } else {
                $(this).addClass("disabled");
                $price_elem.removeClass("hidden");
            }
        });
    }

    function renderUI() {
        renderResources();
        renderPlayers();

        $(".js-round-number").text("Round: " + engine.getRoundNumber());
        $(".js-loan-available").text("Loan available: " + engine.getLoanAvailable() + "$");
    }

    function initializeSupplyTemplates() {
        $(".supply-template").each(function() {
            let resource = getParentResource($(this));

            if (resource.maxSupply - 1 > 1) {
                // Clone template until maxSupply is reached
                for (i = 0; i < resource.maxSupply - 1; i++) {
                    $(this).clone().appendTo($(this).parent());
                }
            }
        });
    }

    function initializePlayers() {
        var setPlayerName = function(player, text) {
            var name = prompt("Enter name for player: " + text);
            if (name && name.trim() != "") {
                player.name = name;
            }
        }

        var setPlayerDebt = function(player) {
            var debt = prompt("Enter debt for player: " + player.name);
            if (debt) {
                player.debt = parseInt(debt);
            }
        }

        setPlayerName(engine.getPlayer("red"), "Red");
        setPlayerName(engine.getPlayer("blue"), "Blue");
        setPlayerName(engine.getPlayer("green"), "Green");
        setPlayerName(engine.getPlayer("yellow"), "Yellow");

        setPlayerDebt(engine.getPlayer("red"));
        setPlayerDebt(engine.getPlayer("blue"));
        setPlayerDebt(engine.getPlayer("green"));
        setPlayerDebt(engine.getPlayer("yellow"));

        ui.render();
    }

    function initializePartials(mainPartial, partials) {
        partials.forEach(function(partial) {
            var html = $.ajax({
                type: 'GET',
                url: '/partials/' + partial + '.html?v=' + Math.random() * 10,
                async: false
            }).responseText;
            Handlebars.registerPartial(partial, html);
        })
        $('body').html(Handlebars.compile('{{> ' + mainPartial + '}}')());
    }

    function initialize() {
        console.log('Initializing UI...');

        initializePartials('app', ['app', 'overlay', 'header', 'footer', 'market', 'players', 'player', 'building', 'resource']);
        initializeSupplyTemplates();
        registerClickListeners();
        renderUI();
    }

    return {
        initialize: initialize,
        initializePlayers: initializePlayers,
        render: renderUI
    }
});