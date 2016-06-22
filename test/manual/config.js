requirejs.config({
    baseUrl: ".",
    paths: {
        "jquery": "../../ext/jquery/dist/jquery",
        "css": "../../ext/require-css/css",
        "idd": "../../dist/idd",
        "idd-css": "../../dist/idd",
        "jquery-ui": "../../ext/jqueryui/jquery-ui",
        "rx": "../../ext/rxjs/dist/rx.all",
    }
});

require(["main"]);