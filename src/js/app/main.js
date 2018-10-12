define(function (require) {
    var engine = require('app/engine');
    var ui = require('app/ui');
    var mapGenerator = require('app/mapGenerator');

    engine.initialize();
    ui.initialize();

    window.engine = engine;
    window.ui = ui;
    window.mapGenerator = mapGenerator;
});