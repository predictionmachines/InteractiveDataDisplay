(function(window, undefined) {
    (function(factory) {
        // Define as an AMD module if possible
        if ( typeof define === 'function' && define.amd )
        {
            define( ['jquery', 'idd', 'css!idd-css', 'css!chartViewer-css', 'jquery-ui'], function($, InteractiveDataDisplay){
                var expr = factory ($, InteractiveDataDisplay);
                return {"ChartViewer" : expr.ChartViewer, "Plot": expr.Plot};
            });
        }
        else if (typeof exports === 'object') {
            // Node, CommonJS-like
            module.exports = factory(require('jquery'), require('underscore'));
        }
        else if ( window.jQuery && window.InteractiveDataDisplay )
        {
            console.error("chartViewer.umd.js cannot be used without RequireJS or CommonJS");
        }
    })
    (function($, InteractiveDataDisplay){ // factory, returns "{ChartViewer, Plot}"