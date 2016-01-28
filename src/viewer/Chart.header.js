(function(window, undefined) {
    (function(factory) {
        // Define as an AMD module if possible
        if ( typeof define === 'function' && define.amd )
        {
            define( ['jquery', 'idd', 'css!idd-css', 'css!chartViewer', 'jquery-ui'], function($, InteractiveDataDisplay){
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
            var expr = factory( window.jQuery, window.InteractiveDataDisplay );
            window.ChartViewer = expr.ChartViewer;
            window.Plot = expr.Plot;
        }
    })
    (function($, InteractiveDataDisplay){ // factory, returns "{ChartViewer, Plot}"
