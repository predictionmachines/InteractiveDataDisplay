describe('InteractiveDataDisplay.AdaptiveFormatter', function () {
    it('0.0000nn___  ->  0.nn x 10^-mmm in segment case', function () {   
        var format = new InteractiveDataDisplay.AdaptiveFormatter(0.000000001, 0.000003);
        expect(format.toString(0.00000003)).toBe('0.030e-6');
    });
    it('0.0000nn___  ->  0.nn x 10^-mmm in array case', function () {
        var array = [0.00000001, 0.000004, 0.0000054, 0.000005];
        var format = new InteractiveDataDisplay.AdaptiveFormatter(array);
        expect(format.toString(array[1])).toBe('4.00e-6');
    });

    it('nnnnn.nn__ -> nnnnn.nn in segment case', function () {
        var format = new InteractiveDataDisplay.AdaptiveFormatter(0.123423526264523, 0.25341234235234);
        expect(format.toString(0.13451525234235)).toBe('0.1345');
    });
    it('nnnnn.nn__ -> nnnnn.nn in array case', function () {
        var array = [0.12342342341235, 0.123532789847987, 0.123409898787, 0.2342634534523];
        var format = new InteractiveDataDisplay.AdaptiveFormatter(array);
        expect(format.toString(array[0])).toBe('0.1234');
    });

    it('nnnnn.___ -> nnnnn. in segment case', function () {
        var format = new InteractiveDataDisplay.AdaptiveFormatter(1234.23526264523, 2534.1234235234);
        expect(format.toString(1345.1525234235)).toBe('1345.');
    });
    it('nnnnn.___ -> nnnnn. in array case', function () {
        var array = [1234.2342341235, 1235.32789847987, 1234.09898787, 2342.634534523];
        var format = new InteractiveDataDisplay.AdaptiveFormatter(array);
        expect(format.toString(array[0])).toBe('1234.');
    });

    it('nnnnnn.___  ->  nnnn x 10^mmm in segment case', function () {
        var format = new InteractiveDataDisplay.AdaptiveFormatter(123412342343, 8768767643);
        expect(format.toString(13451525234235)).toBe('134.52e+11');
    });
    it('nnnnnn.___  ->  nnnn x 10^mmm in array case', function () {
        var array = [12342342341235, 123532789847987, 123409898787, 2342634534523];
        var format = new InteractiveDataDisplay.AdaptiveFormatter(array);
        expect(format.toString(array[0])).toBe('1.23e+13');
    });
});