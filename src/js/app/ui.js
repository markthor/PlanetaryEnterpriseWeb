define(["jquery", "app/engine"], function($, engine) {

    // Get engine player variable from ancestor in DOM
    var getParentPlayer = function($elem) {
        let $player_elem = $elem.parents("[data-player]");
        return engine.getPlayer($player_elem.attr("data-player"));
    }

    // Get engine resource variable from ancestor in DOM
    var getParentResource = function($elem) {
        let $resource_elem = $elem.parents("[data-resource]");
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
            let building = engine.getBuilding($(this).attr("data-building"));

            if ($(this).parents(".box-item-player-content-buildings").length) {
                engine.addBuilding(player, building);
            } else {
                engine.removeBuilding(player, building);
            }
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
        $(".box-produce").click(function() {
            engine.produce();
            engine.drawDemandCard();
            renderUI();
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
        $(".box-item-supply p").each(function() {
            $(this).text("Supply: " + getParentResource($(this)).supply);
        });
    }

    function renderPlayers() {

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

            $(this).find(".building-price").text(price + "$");
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
    }

    function initialize() {
        console.log("Initializing UI...");

        registerClickListeners();
        renderUI();
    }

    return {
        initialize: initialize,
        render: renderUI
    }
});