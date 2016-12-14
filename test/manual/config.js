requirejs.config({
    baseUrl: ".",
    paths: {
        "jquery": "../../ext/jquery/dist/jquery",
        "css": "../../ext/require-css/css",
        "idd": "../../dist/idd",
        "idd-css": "../../dist/idd",
        "jquery-ui": "../../ext/jqueryui/jquery-ui",
        "rx": "../../ext/rxjs/dist/rx.all",
        "svg": "../../ext/svg.js/dist/svg.min",
        "filesaver": "../../ext/FileSaver.js/FileSaver.min",
        "jquery-mousewheel": "../../ext/jquery-mousewheel/jquery.mousewheel.min"
    }
});

require(["main"]);