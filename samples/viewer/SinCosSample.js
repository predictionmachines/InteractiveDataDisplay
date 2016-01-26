/// <reference path="../../src/jquery/jquery.d.ts"/>
$(function () {
    var N = 1000;
    var x = Array(N), sy = Array(N), cy = Array(N);
    for (var i = 0; i < N; i++) {
        x[i] = 2 * Math.PI * i / (N - 1);
        sy[i] = Math.sin(x[i]);
        cy[i] = Math.cos(x[i]);
    }
    var cv = ChartViewer.show(document.getElementById("chart"), {
        "sin": Plot.line({ x: x, y: sy, stroke: "red", thickness: 2.0, displayName: "sin(x)" }),
        "cos": Plot.line({ x: x, y: cy, stroke: "blue", thickness: 2.0, displayName: "cos(x)" }),
    });
    function animate(phase) {
        for (var i = 0; i < N; i++) {
            cy[i] = Math.cos(x[i] + phase);
        }
        cv.update({
            sin: Plot.line({ x: x, y: sy, stroke: 'red', thickness: 2.0, displayName: "sin(x)" }),
            cos: Plot.line({ x: x, y: cy, stroke: "blue", thickness: 2.0, displayName: "cos(x + " + phase + ")" }),
        });
        window.setTimeout(animate, 0, phase + 0.03);
    }
    window.setTimeout(animate, 0, 0.03);
});
