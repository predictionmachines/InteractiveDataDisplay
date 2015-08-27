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
            expect(typeof data.f !== 'undefined').toBeTruthy();
            expect(data.x.length, 3);
            expect(data.y.length, 2);
            expect(data.f.length, 3);
            for (var i = 0; i < 3; i++) {
                expect(data.f[i].length).toBe(2);
                expect(data.x[i]).toBeEqualEps(i + 1);
                for (var j = 0; j < 2; j++) {
                    expect(data.f[i][j]).toBeEqualEps(data.x[i] * data.y[j]);
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
        expect(typeof data.f === 'undefined').toBeTruthy();

        div = $("<div><p>\n" +
            "f 1 2 3\n" +
            " 0.1\t0.1 0.2     0.3  \n" +
            "0.2\t0.2  0.4  0.6\n\n</p><div>");
        data = InteractiveDataDisplay.readCsv2d(div);
        expect(typeof data.x === 'undefined').toBeTruthy();
        expect(typeof data.y === 'undefined').toBeTruthy();
        expect(typeof data.f === 'undefined').toBeTruthy();
    });
});
