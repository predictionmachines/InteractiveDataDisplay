requirejs.config({
    baseUrl: ".",
    paths: {
        "jquery": "../../ext/jquery/dist/jquery",
        "idd": "../../dist/idd.min",
        "idd-css": "../../dist/idd",
        "css": "../../ext/require-css/css",
        "chartViewer": "../../dist/chartViewer",
        "chartViewer-css": "../../dist/chartViewer",
        "jquery-ui": "../../ext/jqueryui/jquery-ui",
        "rx": "../../ext/rxjs/dist/rx.all"
    }
});

require(["main"]);