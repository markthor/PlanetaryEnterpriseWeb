requirejs.config({
    baseUrl: 'js/libs',
    paths: {
        app: "../app",
        jquery: "jquery-3.3.1.min",
        handlebars: "handlebars-v4.0.12",
        plotly: "plotly-latest.min"
    }
});

requirejs(["app/main"]);