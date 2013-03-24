var assert = require('assert');

describe('Test Require Option', function () {
    describe('.signature', function () {
        it('on Object should equal "Cafe Mocha"', function () {
            Object.signature.should.equal('Cafe Mocha');
        });
    });
});

