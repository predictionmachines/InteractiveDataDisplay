/// <reference path="../../typings/jquery/jquery.d.ts" />
module InteractiveDataDisplay {
    export function PersistentViewState() {
        var that = this;

        var callbacks = [];

        function raisePropertyChanged(propName, extraData?) {
            //alert('raisePropertyChanged');
            for (var i = 0; i < callbacks.length; ++i)
                callbacks[i](that, propName, extraData);
        }

        this.subscribe = function (callback) {
            callbacks.push(callback);
            return function () {
                var i = callbacks.indexOf(callback);
                if (i >= 0)
                    callbacks.splice(i, 1);
            }
        }

        var HasPropertyInStorage = function (property) {
            return property != null && property != undefined && property != "undefined";
        };
        
        var plotRect = sessionStorage.getItem("plotRect");
        var _plotRect = HasPropertyInStorage(plotRect) ? JSON.parse(plotRect) : undefined;
        Object.defineProperty(this, "plotRect", {
            get: function () { return _plotRect; },
            set: function (value) {
                if (value == _plotRect) return;
                _plotRect = value;
                sessionStorage.setItem("plotRect", JSON.stringify(_plotRect));
                raisePropertyChanged("plotRect");
            },
            configurable: false,
            enumerable: true
        });

        var isAutoFit = sessionStorage.getItem("isAutoFit");
        var _isAutoFit = HasPropertyInStorage(isAutoFit) ? JSON.parse(isAutoFit) : true;
        Object.defineProperty(this, "isAutoFit", {
            get: function () { return _isAutoFit; },
            set: function (value) {
                if (value == _isAutoFit) return;
                _isAutoFit = value;
                sessionStorage.setItem("isAutoFit", JSON.stringify(_isAutoFit));
                raisePropertyChanged("isAutoFit");
            },
            configurable: false,
            enumerable: true
        });

        var selectedPlots = sessionStorage.getItem("selectedPlots");
        var _selectedPlots = HasPropertyInStorage(selectedPlots) ? JSON.parse(selectedPlots) : [];
        Object.defineProperty(this, "selectedPlots", {
            get: function () { return _selectedPlots; },
            set: function (value) {
                if (value == _selectedPlots) return;
                _selectedPlots = value;
                sessionStorage.setItem("selectedPlots", JSON.stringify(_selectedPlots));
                raisePropertyChanged("selectedPlots");
            },
            configurable: false,
            enumerable: true
        });

        var probes = sessionStorage.getItem("probes");
        var _probesViewModel = HasPropertyInStorage(probes) ? new ProbesVM(JSON.parse(probes)) : new ProbesVM(undefined);//undefined;
        _probesViewModel.subscribe(function (args) {
            sessionStorage.setItem("probes", JSON.stringify(_probesViewModel.getProbes()));
            raisePropertyChanged("probes");
        });
        Object.defineProperty(this, "probesViewModel", {
            get: function () { return _probesViewModel; },
            configurable: false,
            enumerable: true
        });

        var isLegendShown = sessionStorage.getItem("isLegendShown");
        var _isLegendShown = HasPropertyInStorage(isLegendShown) ? JSON.parse(isLegendShown) : false;
        Object.defineProperty(this, "isLegendShown", {
            get: function () {
                return _isLegendShown;
            },
            set: function (value) {
                if (value == _isLegendShown) return;
                _isLegendShown = value;
                sessionStorage.setItem("isLegendShown", JSON.stringify(_isLegendShown));
                raisePropertyChanged("isLegendShown");
            },
            configurable: false,
            enumerable: true
        });

        var isNavigationPanelOpen = sessionStorage.getItem("isNavigationPanelOpen");
        var _isNavigationPanelOpen = HasPropertyInStorage(isNavigationPanelOpen) ? JSON.parse(isNavigationPanelOpen) : false;
        Object.defineProperty(this, "isNavigationPanelOpen", {
            get: function () {
                return _isNavigationPanelOpen;
            },
            set: function (value) {
                if (value == _isNavigationPanelOpen) return;
                _isNavigationPanelOpen = value;
                sessionStorage.setItem("isNavigationPanelOpen", JSON.stringify(_isNavigationPanelOpen));
                raisePropertyChanged("isNavigationPanelOpen");
            },
            configurable: false,
            enumerable: true
        });

        var isLogAxis = sessionStorage.getItem("isLogAxis")
        var _isLogAxis = HasPropertyInStorage(isLogAxis) ? JSON.parse(isLogAxis) : 0;
        Object.defineProperty(this, "isLogAxis", {
            get: function () { return _isLogAxis; },
            set: function (value) {
                if (value == _isLogAxis) return;
                _isLogAxis = value;
                sessionStorage.setItem("isLogAxis", JSON.stringify(_isLogAxis));
                raisePropertyChanged("isLogAxis");
            },
            configurable: false,
            enumerable: true
        });

        var mapType = sessionStorage.getItem("mapType");
        var _mapType = HasPropertyInStorage(mapType) ? JSON.parse(mapType) : undefined;
        Object.defineProperty(this, "mapType", {
            get: function () { return _mapType; },
            set: function (value) {
                if (value == _mapType) return;
                _mapType = value;
                sessionStorage.setItem("mapType", JSON.stringify(_mapType));
                raisePropertyChanged("mapType");
            },
            configurable: false,
            enumerable: true
        });


        var xDataTransform = sessionStorage.getItem("xDataTransform");
        var _xDataTransform = HasPropertyInStorage(xDataTransform) ? JSON.parse(xDataTransform) : undefined;
        Object.defineProperty(this, "xDataTransform", {
            get: function () { return _xDataTransform; },
            set: function (value) {
                if (value == _xDataTransform) return;
                _xDataTransform = value;
                sessionStorage.setItem("xDataTransform", JSON.stringify(_xDataTransform));
                raisePropertyChanged("xDataTransform");
            },
            configurable: false,
            enumerable: true
        });

        var yDataTransform = sessionStorage.getItem("yDataTransform");
        var _yDataTransform = HasPropertyInStorage(yDataTransform) ? JSON.parse(yDataTransform) : undefined;
        Object.defineProperty(this, "yDataTransform", {
            get: function () { return _yDataTransform; },
            set: function (value) {
                if (value == _yDataTransform) return;
                _yDataTransform = value;
                sessionStorage.setItem("yDataTransform", JSON.stringify(_yDataTransform));
                raisePropertyChanged("yDataTransform");
            },
            configurable: false,
            enumerable: true
        });
       
        var _uncertaintyRange = {};
        Object.defineProperty(this, "uncertaintyRange", {
            get: function () { return _uncertaintyRange; },
            set: function (value) {
                if (value == _uncertaintyRange) return;
                _uncertaintyRange = value;
                raisePropertyChanged("uncertaintyRange");
            },
            configurable: false,
            enumerable: true
        });
    }

    export function TransientViewState() {
        var that = this;

        var callbacks = [];

        function raisePropertyChanged(propName, extraData?) {
            for (var i = 0; i < callbacks.length; ++i)
                callbacks[i](that, propName, extraData);
        }

        this.subscribe = function (callback) {
            callbacks.push(callback);
        }

        this.unsubscribe = function (callback) {
            callbacks = callbacks.filter(function (cb) {
                return cb !== callback;
            });
        }

        var _ranges = {};
        Object.defineProperty(this, "ranges", {
            get: function () { return _ranges; },
            configurable: false,
            enumerable: true
        });
        
        var _plotXFormatter = new InteractiveDataDisplay.AdaptiveFormatter(0, 1);
        Object.defineProperty(this, "plotXFormatter", {
            get: function () { return _plotXFormatter; },
            set: function (value) {
                if (value == _plotXFormatter) return;
                _plotXFormatter = value;
                raisePropertyChanged("plotXFormatter");
            },
            configurable: false,
            enumerable: true
        });

        var _plotYFormatter = new InteractiveDataDisplay.AdaptiveFormatter(0, 1);
        Object.defineProperty(this, "plotYFormatter", {
            get: function () { return _plotYFormatter; },
            set: function (value) {
                if (value == _plotYFormatter) return;
                _plotYFormatter = value;
                raisePropertyChanged("plotYFormatter");
            },
            configurable: false,
            enumerable: true
        });


        this.setRangesForPlot = function (plotId, value) {
            _ranges[plotId] = value;
            raisePropertyChanged("ranges", { id: plotId });
        }
    }
}