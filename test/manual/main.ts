

import Charting = require("../../dist/idd.umd");
Charting.InteractiveDataDisplay.show(document.getElementById("chart"), {
    "elem1": Charting.Plot.line({
        x: [1, 2, 3, 4],
        y: [1, 4, 6, 9],
        thickness: 3,
        displayName: "y[x]",
        titles: {
            x: "w", y: "c"
        }
    }),
    "elem2": Charting.Plot.markers({
        x: [1, 2, 3, 4],
        y: [1, 4, 6, 9],
        shape: Charting.Plot.MarkerShape.Cross,
        size: 8,
        color: "red",
        displayName: "mark"
    }),
    "elem3": Charting.Plot.heatmap({
        x: [-1, 0, 1, -1, 0, 1, -1, 0, 1],
        y: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
        values: [0.1, 0.2, 0.23, -0.5, 0.1, 0.2, -0.2, 0.4, 0.3],
        colorPalette: "red, purple",
        displayName: "map"
    })
});
