define(function (require) {
    var engine = require('app/engine');
    var ui = require('app/ui');

    engine.initialize();
    ui.initialize();

    window.engine = engine;
    window.ui = ui;
});