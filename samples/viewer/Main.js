require.config({
    baseUrl: "../../",
    paths: {
        "jquery": "ext/jquery/dist/jquery",
        "idd": "dist/idd.min",
        "idd-css": "dist/idd",
        "css": "ext/require-css/css",
        "chartViewer": "dist/chartViewer",
        "jquery-ui": "ext/jqueryui/jquery-ui",
        "rx": "ext/rxjs/dist/rx.all"
    },
});
require(["../../dist/chartViewer"], function (Charting) {
    var chartViewer = Charting.ChartViewer;
    var plot = Charting.Plot;
    chartViewer.show(document.getElementById("chart"), {
        "elem1": plot.line({
            x: [1, 2, 3, 4],
            y: [1, 4, 6, 9],
            thickness: 3,
            displayName: "y[x]",
            titles: {
                x: "w", y: "c"
            }
        }),
        "elem2": plot.markers({
            x: [1, 2, 3, 4],
            y: [1, 4, 6, 9],
            shape: plot.MarkerShape.Cross,
            size: 8,
            color: "red",
            displayName: "mark"
        }),
        "elem3": plot.heatmap({
            x: [-1, 0, 1, -1, 0, 1, -1, 0, 1],
            y: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
            values: [0.1, 0.2, 0.23, -0.5, 0.1, 0.2, -0.2, 0.4, 0.3],
            colorPalette: "red, purple",
            displayName: "map"
        })
    });
});
