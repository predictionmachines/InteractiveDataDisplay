/// <reference path="../ext/jasmine/jasmine.js" />
/// <reference path="../ext/jquery/dist/jquery.min.js" />
/// <reference path="../dist/idd.js" />

// quick reference for Jasmine framework:
// http://pivotal.github.com/jasmine/ 
// https://github.com/pivotal/jasmine/wiki 

describe('Utility function', function () {
    beforeEach(function () {
        jasmine.addMatchers({
            toBeEqualEps: function () {
                return {
                    compare: function(actual, expected) {
                        return {
                            pass: Math.abs(actual - expected) < 1e-12
                        }
                    }
                }
            }
        });
    });

    it('InteractiveDataDisplay.readCsv2d() parses content of <div> as 2d csv table', function () {
        var parseDiv = function (div) {
            var data = InteractiveDataDisplay.readCsv2d(div);
            expect(typeof data.x !== 'undefined').toBeTruthy();
            expect(typeof data.y !== 'undefined').toBeTruthy();
            expect(typeof data.values !== 'undefined').toBeTruthy();
            expect(data.x.length, 3);
            expect(data.y.length, 2);
            expect(data.values.length, 3);
            for (var i = 0; i < 3; i++) {
                expect(data.values[i].length).toBe(2);
                expect(data.x[i]).toBeEqualEps(i + 1);
                for (var j = 0; j < 2; j++) {
                    expect(data.values[i][j]).toBeEqualEps(data.x[i] * data.y[j]);
                }
            }
            for (var j = 0; j < 2; j++) {
                expect(data.y[j]).toBeEqualEps(0.1 * (j + 1));
            }
        };

        parseDiv($("<div>\n" +
        "f 1 2 3\n" +
        " 0.1\t0.1 0.2     0.3  \n" +
        "0.2\t0.2  0.4  0.6\n\n<div>"));
        parseDiv($("<div>" +
        "f 1 2 3\n" +
        " 0.1\t0.1 0.2     0.3  \n" +
        "0.2\t0.2  0.4  0.6<div>"));

        parseDiv($("<div>" +
        "f 1 2 3\n" +
        " 0.1\t0.1 0.2     0.3  \n" +
        "0.2\t0.2  0.4  0.6<div>"));

        parseDiv($("<div><p>hello</p>\n" +
        "f 1 2 3\n" +
        " 0.1\t0.1 0.2     0.3  \n" +
        "0.2\t0.2  0.4  0.6\n\n<p>hello</p><div>"));

        parseDiv($("<div><p>hello</p>\n" +
        "f 1 2 3\n" +
        " 0.1\t0.1 0.2     0.3  \n" +
        "0.2\t0.2  0.4  0.6\n\n<p>hello</p>\n0.2 0.2  0.4  0.6\n\n<div>"));
    });

    it('InteractiveDataDisplay.readCsv2d() properly handles when content of <div> is empty or incorrect', function () {
        var div = $("<div>\n\n\n<div>");
        var data = InteractiveDataDisplay.readCsv2d(div);
        expect(typeof data.x === 'undefined').toBeTruthy();
        expect(typeof data.y === 'undefined').toBeTruthy();
        expect(typeof data.values === 'undefined').toBeTruthy();

        div = $("<div><p>\n" +
            "f 1 2 3\n" +
            " 0.1\t0.1 0.2     0.3  \n" +
            "0.2\t0.2  0.4  0.6\n\n</p><div>");
        data = InteractiveDataDisplay.readCsv2d(div);
        expect(typeof data.x === 'undefined').toBeTruthy();
        expect(typeof data.y === 'undefined').toBeTruthy();
        expect(typeof data.values === 'undefined').toBeTruthy();
    });

    it('InteractiveDataDisplay.Utils.generateNextIntId() returns reproducible sequence of unique for the idd instance int IDs', function () {
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        function arraysAreEqual(arr1, arr2) {
            if (!arr1 || !arr2)
                return false;
            
            if (arr1.length != arr2.length)
                return false;

            for (var i = 0, l = arr1.length; i < l; i++) {
                if (arr1[i] != arr2[i]) {
                    return false;
                }
            }
            return true;
        }

        expect(InteractiveDataDisplay.Utils.resetLastUsedIntId() === 0).toBeTruthy();

        var uniqueIntIDs1 = [];
        for (var i = 0; i < 5; i++) {
            uniqueIntIDs1.push(InteractiveDataDisplay.Utils.generateNextIntId());
        }

        for (var i = 0; i < 5; i++) {
            expect(typeof uniqueIntIDs1[i] === 'number').toBeTruthy();

        }

        expect(arraysAreEqual(uniqueIntIDs1.filter(onlyUnique), uniqueIntIDs1)).toBeTruthy();
        

        expect(InteractiveDataDisplay.Utils.resetLastUsedIntId() === 0).toBeTruthy();

        var uniqueIntIDs2 = [];
        for (var i = 0; i < 5; i++) {
            uniqueIntIDs2.push(InteractiveDataDisplay.Utils.generateNextIntId());
        }

        for (var i = 0; i < 5; i++) {
            expect(typeof uniqueIntIDs2[i] === 'number').toBeTruthy();

        }

        expect(arraysAreEqual(uniqueIntIDs2.filter(onlyUnique), uniqueIntIDs2)).toBeTruthy();

        expect(arraysAreEqual(uniqueIntIDs1, uniqueIntIDs2)).toBeTruthy();
    })

    it('InteractiveDataDisplay.Utils.base64toByteArray() decodes correctly', function () {
        var encoded = "SGVsbG8gd29ybGQhIDEyMw==" // "Hello world! 123" ASCII encoding
        var data = InteractiveDataDisplay.Utils.base64toByteArray(encoded);
        var str = String.fromCharCode.apply(null, data)
        expect(str.length == ("Hello world! 123".length)).toBeTruthy();
        expect(str == "Hello world! 123").toBeTruthy();        
    });

    it('InteractiveDataDisplay.Utils.byteArrayToTypedArray() decodes int16 array', function () {
        var encoded = "AAABAAIAAwAEAAUABgAHAAgACQA=" // [0;1;...;8;9] int16 array
        var data = InteractiveDataDisplay.Utils.base64toByteArray(encoded);
        var typedArray = InteractiveDataDisplay.Utils.byteArrayToTypedArray(data, "int16")
        expect(typedArray.length == 10).toBeTruthy();
        for(var i=0;i<10;i++) {
            expect(typedArray[i] == i).toBeTruthy();        
        }
    });

    it('InteractiveDataDisplay.Utils.byteArrayToTypedArray() decodes int32 array', function () {
        var encoded = "AAAAAP////8CAAAA/f///wQAAAD7////BgAAAPn///8IAAAA9////w==" // [|0; -1; 2; -3; 4; -5; 6; -7; 8; -9|] int32 array
        var data = InteractiveDataDisplay.Utils.base64toByteArray(encoded);
        var typedArray = InteractiveDataDisplay.Utils.byteArrayToTypedArray(data, "int32")
        expect(typedArray.length == 10).toBeTruthy();
        for(var i=0;i<10;i++) {
            var sign = i%2==0 ? 1 : -1
            expect(typedArray[i] == i*sign).toBeTruthy();        
        }
    });

    it('InteractiveDataDisplay.Utils.byteArrayToTypedArray() decodes float32 array', function () {
        var encoded = "AAAAAAAAgL8AAABAAABAwAAAgEAAAKDAAADAQAAA4MAAAABBAAAQwQ==" // [|0.0f; -1.0f; 2.0f; -3.0f; 4.0f; -5.0f; 6.0f; -7.0f; 8.0f; -9.0f|] float32 array
        var data = InteractiveDataDisplay.Utils.base64toByteArray(encoded);
        var typedArray = InteractiveDataDisplay.Utils.byteArrayToTypedArray(data, "float32")
        expect(typedArray.length == 10).toBeTruthy();
        for(var i=0;i<10;i++) {
            var sign = i%2==0 ? 1 : -1
            expect(typedArray[i] == i*sign).toBeTruthy();        
        }
    });

    it('InteractiveDataDisplay.Utils.byteArrayToTypedArray() decodes float64 array', function () {
        var encoded = "AAAAAAAAAAAAAAAAAADwvwAAAAAAAABAAAAAAAAACMAAAAAAAAAQQAAAAAAAABTAAAAAAAAAGEAAAAAAAAAcwAAAAAAAACBAAAAAAAAAIsA=" // [|0.0; -1.0; 2.0; -3.0; 4.0; -5.0; 6.0; -7.0; 8.0; -9.0|] float64 array
        var data = InteractiveDataDisplay.Utils.base64toByteArray(encoded);
        var typedArray = InteractiveDataDisplay.Utils.byteArrayToTypedArray(data, "float64")
        expect(typedArray.length == 10).toBeTruthy();
        for(var i=0;i<10;i++) {
            var sign = i%2==0 ? 1 : -1
            expect(typedArray[i] == i*sign).toBeTruthy();        
        }
    });
    
});
