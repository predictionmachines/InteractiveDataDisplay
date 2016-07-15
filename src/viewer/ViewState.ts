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

        var _axisTransform = undefined;
       
        Object.defineProperty(this, "axisTransform", {
            get: function () { return _axisTransform; },
            set: function (value) {
                if (value == _axisTransform) return;
                _axisTransform = value;
                raisePropertyChanged("axisTransform");
            },
            configurable: false,
            enumerable: true
        });

        var _plotRect = undefined;
        Object.defineProperty(this, "plotRect", {
            get: function () { return _plotRect; },
            set: function (value) {
                if (value == _plotRect) return;
                _plotRect = value;
                raisePropertyChanged("plotRect");
            },
            configurable: false,
            enumerable: true
        });

        var _mapType = undefined;
        Object.defineProperty(this, "mapType", {
            get: function () { return _mapType; },
            set: function (value) {
                if (value == _mapType) return;
                _mapType = value;
                raisePropertyChanged("mapType");
            },
            configurable: false,
            enumerable: true
        });

        var _isAutoFit = undefined;
        Object.defineProperty(this, "isAutoFit", {
            get: function () { return _isAutoFit; },
            set: function (value) {
                if (value == _isAutoFit) return;
                _isAutoFit = value;
                raisePropertyChanged("isAutoFit");
            },
            configurable: false,
            enumerable: true
        });

        var _isLogData = {};
        Object.defineProperty(this, "isLogData", {
            get: function () { return _isLogData; },
            configurable: false,
            enumerable: true
        });
        this.setLogDataForPlot = function (plotId, value) {
            _isLogData[plotId] = value;
            raisePropertyChanged("isLogData", { id: plotId });
        }

        var _selectedPlots = undefined;
        Object.defineProperty(this, "selectedPlots", {
            get: function () { return _selectedPlots; },
            set: function (value) {
                if (value == _selectedPlots) return;
                _selectedPlots = value;
                raisePropertyChanged("selectedPlots");
            },
            configurable: false,
            enumerable: true
        });

        var _xAxisTitle = undefined;
        Object.defineProperty(this, "xAxisTitle", {
            get: function () { return _xAxisTitle; },
            set: function (value) {
                if (value == _xAxisTitle) return;
                _xAxisTitle = value;
                raisePropertyChanged("xAxisTitle");
            },
            configurable: false,
            enumerable: true
        });

        var _yAxisTitle = undefined;
        Object.defineProperty(this, "yAxisTitle", {
            get: function () { return _yAxisTitle; },
            set: function (value) {
                if (value == _yAxisTitle) return;
                _yAxisTitle = value;
                raisePropertyChanged("yAxisTitle");
            },
            configurable: false,
            enumerable: true
        });

        var _probesViewModel = undefined;
        Object.defineProperty(this, "probesViewModel", {
            get: function () { return _probesViewModel; },
            configurable: false,
            enumerable: true
        });

        this.initProbes = function (probes) {
            if (_probesViewModel === undefined) {
                _probesViewModel = new ProbesVM(probes);

                _probesViewModel.subscribe(function (args) {
                    raisePropertyChanged("probes");
                });
            }
            else {
                throw "Probes are already initialized";
            }
        }

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