define(["jquery", "handlebars", "app/engine"], function($, Handlebars, engine) {

    // Get engine player variable from ancestor in DOM
    var getParentPlayer = function($elem) {
        let $player_elem = $elem.parents(".player[data-player]");
        return engine.getPlayer($player_elem.attr("data-player"));
    }

    // Get engine resource variable from ancestor in DOM
    var getParentResource = function($elem) {
        let $resource_elem = $elem.parents(".resource[data-resource]");
        return engine.getResource($resource_elem.attr("data-resource"));
    }

    function registerResourceClickListeners() {

        // Click listener for supply +/- buttons
        $(".js-resource-buttons [data-val]").click(function() {
            engine.adjustSupply(getParentResource($(this)), $(this).data("val"));
            renderUI();
        });
    }

    function registerPlayerClickListeners() {

        // Click listener for buildings
        $("[data-building]").click(function() {
            let player = getParentPlayer($(this));
            let buildingName = $(this).attr("data-building");
            let building = engine.getBuilding(buildingName);

            // Case for bottom building pane
            if ($(this).parents(".js-player-content-buildings").length) {
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

    }

    function registerMenuClickListeners() {
        $(".js-settings").click(function () {
            var setPlayerName = function(player, text) {
                var name = prompt("Enter name for player: " + text);
                if (name && name.trim() != "") {
                    player.name = name;
                }
            }
    
            setPlayerName(engine.getPlayer("red"), "Red");
            setPlayerName(engine.getPlayer("blue"), "Blue");
            setPlayerName(engine.getPlayer("green"), "Green");
            setPlayerName(engine.getPlayer("yellow"), "Yellow");
    
            ui.render();
        });
    }

    function registerProduceClickListener() {

        // Click listener for overlay
        $("#overlay").click(function() {
            $(".popover").css("display", "none");
            $("#popup").css("display", "none");
            $(this).css("display", "none");
        });

        $(".js-produce").click(function() {
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
                $(this).text(engine.getIncome(engine.getPlayer($player_elem.attr("data-player"))) + "$");
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
        registerMenuClickListeners();
        registerResourceClickListeners();
        registerPlayerClickListeners();
        registerProduceClickListener();
    }

    function renderResources() {

        // Render demand
        $(".js-resource-demand").each(function() {
            let resource = getParentResource($(this));
            let $child_elems = $(this).find(".js-item-template");

            for (i = 0; i < resource.maxDemand; i++) {
                if (resource.demand > i) {
                    $child_elems.eq(i).removeClass("item-template--hidden");
                } else {
                    $child_elems.eq(i).addClass("item-template--hidden");
                }
            }
        });

        // Render supply
        $(".js-resource-supply").each(function() {
            let resource = getParentResource($(this));
            let $child_elems = $(this).find(".js-item-template");

            for (i = 0; i < resource.maxSupply; i++) {
                if (resource.supply > i) {
                    $child_elems.eq(i).removeClass("item-template--inactive");
                } else {
                    $child_elems.eq(i).addClass("item-template--inactive");
                }
            }
        });

        // Render price
        $(".js-resource-price").each(function() {
            $(this).text(getParentResource($(this)).price + "$");
        });
    }

    function renderPlayers() {

        // Render name
        $(".js-player-name").each(function() {
            $(this).text(getParentPlayer($(this)).name);
        })

        // Render income
        $(".js-player-income").each(function() {
            $(this).text(engine.getIncomeFromBuildings(getParentPlayer($(this))) + "$");
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

            // Applies to buildings that are in player inventories (already purchased)
            $(this).find(".building-count-new").each(function(){
                let buildingCount = player.buildings.filter(name => name === buildingName).length;
                
                $(this).text(buildingCount);
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

    function renderFooter() {
        weatherState = engine.getWeather();

        var weatherDescription = (function(weatherState) {
            switch(weatherState) {
                case 0: return "Cloudy";
                case 1: return "Partly cloudy";
                case 2: return "Sunny";
                default:
                    console.error("Illegal argument exception. Unexpected weatherState " + weatherState);
                    break;
            }
        })(weatherState);
        
        $(".js-weather").text("Weather: " + weatherDescription);
        $(".js-weather-icon").attr("src", "resources/icons/weather/PartlyCloudy.svg");
    }

    function renderUI() {
        renderResources();
        renderPlayers();
        renderFooter();
    }

    function initializeTemplates() {
        $(".js-resource-demand .js-item-template").each(function() {
            let resource = getParentResource($(this));

            if (resource.maxDemand - 1 > 1) {
                // Clone template until maxDemand is reached
                for (i = 0; i < resource.maxDemand - 1; i++) {
                    $(this).clone().appendTo($(this).parent());
                }
            }
        });
        $(".js-resource-supply .js-item-template").each(function() {
            let resource = getParentResource($(this));

            if (resource.maxSupply - 1 > 1) {
                // Clone template until maxSupply is reached
                for (i = 0; i < resource.maxSupply - 1; i++) {
                    $(this).clone().appendTo($(this).parent());
                }
            }
        });
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
        initializeTemplates();
        registerClickListeners();
        renderUI();
    }

    return {
        initialize: initialize,
        render: renderUI
    }
});