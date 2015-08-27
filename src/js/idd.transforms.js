InteractiveDataDisplay = typeof InteractiveDataDisplay == 'undefined' ? {} : InteractiveDataDisplay;
 
InteractiveDataDisplay.DataTransform = function (dataToPlot, plotToData, domain, type) {
    this.dataToPlot = dataToPlot;
    this.plotToData = plotToData;

    this.domain = domain || {
        isInDomain: function (value) {
            return true;
        }
    };

    this.type = type;
};

var mercator_maxPhi = 85.05112878; //87.1147576363384; // deg
var mercator_R = mercator_maxPhi / Math.log(Math.tan(mercator_maxPhi * Math.PI / 360.0 + Math.PI / 4));
InteractiveDataDisplay.mercatorTransform = new InteractiveDataDisplay.DataTransform(
    function (phi_deg) {
        if (phi_deg >= -mercator_maxPhi && phi_deg <= mercator_maxPhi)
            return mercator_R * Math.log(Math.tan(Math.PI * (phi_deg + 90) / 360));
        else return phi_deg;
    },
    function (y) {
        if (-mercator_maxPhi <= y && y <= mercator_maxPhi) {
            return 360 * Math.atan(Math.exp(y / mercator_R)) / Math.PI - 90;
        }
        return y;
    },
    undefined,
    "mercator"
);


Math.LOGE10 = Math.log(10);

InteractiveDataDisplay.logTransform = new InteractiveDataDisplay.DataTransform(
    function (x_d) {
        return Math.log(x_d) / Math.LOGE10;
    },
    function (x_p) {
        return Math.pow(10, x_p);
    },
    { isInDomain: function (x) { return x > 0; } },
    "log10"
);