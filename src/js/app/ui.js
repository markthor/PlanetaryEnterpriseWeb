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
            let $building_elem = $(this);
            let player = getParentPlayer($building_elem);
            let buildingName = $building_elem.attr("data-building");
            let building = engine.getBuilding(buildingName);

            if (($building_elem).hasClass("disabled")) {
                return;
            }

            let $popover_elem = $building_elem.find(".popover");

            // Show popover instead of adding building if popover exists
            if ($popover_elem.length) {
                $("#overlay").css("display", "block");
                $popover_elem.css("display", "flex");
            } else {
                // Check if remove mode is active
                if ($building_elem.find(".remove-mode").length) {
                    engine.removeBuilding(player, building);
                } else {
                    engine.addBuilding(player, building);
                }
            }

            renderUI();
        });

        // Click listener for custom mine popover
        $("[data-contract-resource]").click(function(event) {
            event.stopPropagation();

            let $resource_elem = $(this);
            let player = getParentPlayer($resource_elem);
            let resource = engine.getResource($resource_elem.attr("data-contract-resource"));

            let removeModeActive = $(".js-remove-mode-toggle").hasClass("remove-mode");

            if (removeModeActive) {
                engine.removeGovernmentContract(player, resource);
            } else {
                engine.buyGovernmentContract(player, resource);
            }

            $resource_elem.closest(".popover").css("display", "none");
            $("#overlay").css("display", "none");
            renderUI();
        });
    }

    function registerMenuClickListeners() {
        $(".js-settings").click(function() {
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

        // Toggle button for "remove mode"
        $(".js-remove-mode-toggle").click(function() {
            $(this).toggleClass("remove-mode");

            let removeModeActive = $(this).hasClass("remove-mode");

            $(".building-count").each(function(){
                if (removeModeActive) {
                    $(this).addClass("remove-mode");
                } else {
                    $(this).removeClass("remove-mode");
                }
            });

            ui.render();
        })
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
        });

        // Render score
        $(".js-player-score").each(function() {
            $(this).text(engine.getScore(getParentPlayer($(this))) + "p");
        });

        // Render income
        $(".js-player-income").each(function() {
            $(this).text(engine.getIncome(getParentPlayer($(this))) + "$");
        });

        // Render buildings
        $("[data-building]").each(function() {
            let $building_elem = $(this);
            let player = getParentPlayer($building_elem);
            let buildingName = $building_elem.attr("data-building");
            let building = engine.getBuilding(buildingName);
            let price = engine.getBuildingPrice(player, building);
            let count = player.buildings.filter(name => name === buildingName).length;

            // Update building prices
            $building_elem.find(".building-price").each(function() {
                $(this).text(price + "$");
            });

            // Update building counts
            $building_elem.find(".building-count").each(function(){
                $count_elem = $(this);
                $count_elem.text(count);

                if (count == 0) {
                    $count_elem.addClass("hidden");

                    // Disable non-existent buildings when remove mode is active
                    if ($count_elem.hasClass("remove-mode")) {
                        $building_elem.addClass("disabled");
                    } else {
                        $building_elem.removeClass("disabled");
                    }
                } else {
                    $count_elem.removeClass("hidden");
                }
            });
        });

        // Render government contracts
        $("[data-contract-resource]").each(function() {
            let $resource_elem = $(this);
            let $checkmark_elem = $resource_elem.parent().find(".building-demand");
            let resource_name =$resource_elem.attr("data-contract-resource");
            let player = getParentPlayer($resource_elem);

            // Show or hide checkmark depending on whether it's been bought or not
            if (player.governmentContracts[resource_name]["enabled"]) {
                $checkmark_elem.removeClass("hidden");
            } else {
                $checkmark_elem.addClass("hidden");
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

        switch(weatherState) {
            case 0: $(".js-weather-icon").attr("src", "resources/icons/weather/Cloudy.svg"); break;
            case 1: $(".js-weather-icon").attr("src", "resources/icons/weather/PartlyCloudy.svg"); break;
            case 2: $(".js-weather-icon").attr("src", "resources/icons/weather/Sunny.svg"); break;
            default:
                break;
        }
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

        initializePartials('app', ['app', 'overlay', 'header', 'footer', 'market', 'players', 'player', 'building', 'resource', 'gov_contract']);
        initializeTemplates();
        registerClickListeners();
        renderUI();
    }

    return {
        initialize: initialize,
        render: renderUI
    }
});