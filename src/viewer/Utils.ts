/// <reference path="ChartViewer.ts" />
module InteractiveDataDisplay {
    export type Map = {
        [key: string]: any;
    }

    /**
     * Synchronizes properties of bagB with properties of bagA:
     * 1) if (k,vB) of bagB such that (k,vA) belongs to bagA then
     * 1.1) if vB = null, (k,vA) goes to the output bag;
     * 1.2) else (k, replace(k, vA, vB)) goes to the output;
     * 2) if (k,vB) of bagB such that there is no (k,vA) in bagA then (k, add(k, vB)) goes to the output;
     * 3) if (k,vA) of bagA such that there is no (k,vB) in bagB then remove(k, vA) is called and it is missing in the output.
     */
    export function updateBag(bagA: Map, bagB: Map, replace: (key: string, prev: any, curr: any) => any, add: (key: string, val: any) => any, remove: (key: string, val: any) => void): Map {
        var output = {};
        for (var k in bagB) {
            var vA = bagA[k];
            var vB = bagB[k];
            if (typeof (vB) == "undefined") continue;
            if (typeof (vA) != "undefined") { // case 1
                if (vB == null) { // case 1.1
                    output[k] = vA;
                }
                else { // case 1.2
                    output[k] = replace(k, vA, vB);
                }
            }
            else { // case 2
                output[k] = add(k, vB);
            }
        }
        for (var k in bagA) {
            var vA = bagA[k];
            var vB = bagB[k];
            if (typeof (vA) == "undefined") continue;
            if (typeof (vB) == "undefined") { // case 3
                remove(k, vA);
            }
        }
        return output;
    }

    export function getTitle(def: PlotInfo, seriesName: string) {
        if (def.titles && typeof def.titles[seriesName] != "undefined")
            return def.titles[seriesName];
        return seriesName;
    }

    export function updateProp(propName, obj1, obj2) {
        if (obj1[propName] === obj2[propName]) {
            return true;
        } else {
            obj1[propName] = obj2[propName];
            return false;
        }
    }

    export function isNumber(obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    }

    export function isString(obj) {
        return obj === obj + "";
    }
    export function isStringOrNumber(obj) {
        return isNumber(obj) || isString(obj)
    }

    export function deepCopyJS(obj) {
        var type = typeof obj;
        if (type !== 'object' || obj == null) {
            //basic types here
            return obj;
        } else if (InteractiveDataDisplay.Utils.isArray(obj)) {
            var result = [];
            for (var i = 0; i < obj.length; i++)
                result.push(deepCopyJS(obj[i]));
            return result;
        } else {
            var result1 = {};
            for (var prop in obj) {
                result1[prop] = deepCopyJS(obj[prop]);
            }
            return result1;
        }
    }

    export function syncProps(obj1, obj2) {
        var wasUpdated = false;

        for (var key in obj2) {
            if (obj1[key] === undefined || (isStringOrNumber(obj1[key]) && !isStringOrNumber(obj2[key]))) {
                obj1[key] = deepCopyJS(obj2[key]);
                if (!wasUpdated)
                    wasUpdated = true;
            } else if (isStringOrNumber(obj2[key])) {
                var wasUpdatedloc = !updateProp(key, obj1, obj2);
                if (!wasUpdated)
                    wasUpdated = wasUpdatedloc;
            } else {
                var wasUpdatedloc = syncProps(obj1[key], obj2[key]);
                if (!wasUpdated)
                    wasUpdated = wasUpdatedloc;
            }
        }

        var unpresentedProperties = [];
        for (var prop in obj1) {
            if (prop === "d3Graphs" || prop === "isPresented")
                continue;

            var isPresented = false;
            for (var key in obj2) {
                if (key === prop) {
                    isPresented = true;
                    break;
                }
            }
            if (!isPresented) {
                unpresentedProperties.push(prop);

                if (!wasUpdated)
                    wasUpdated = true;
            }
        }

        unpresentedProperties.forEach(function (prop) {
            delete obj1[prop];
        });

        for (var i = 0; i < obj1.length; i++) {
            if (obj1[i] == undefined && typeof obj1 != "function") {
                obj1.splice(i, 1);
                i--;
            }
        }        

        //TODO: remove unpresented dataKeys
        return wasUpdated;
    }

    export declare function readCsv(jqPlotDiv);
}