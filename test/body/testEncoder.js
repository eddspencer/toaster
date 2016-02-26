const expect = require('chai').expect;
const Encoder = require('../../body/Encoder');

describe('Encoder', function () {

  debugger;

  const encoder = new Encoder({
    threshold: 0.6
  });

  beforeEach(function() {
    encoder.reset();
  });

  it('should handle empty case', function () {
    expect(encoder.read()).to.equal(0);
  });


  it('should handle simple case', function () {
    encoder.addRaw(0.5);
    expect(encoder.read()).to.equal(0.5);
  });

  it('should smooth out values', function () {
    encoder.addRaw([0.5, 1, 0.5, 2]);
    expect(encoder.read()).to.equal(1);
  });
  
  it('should not tick on first value', function () {
    encoder.addRaw(1.0);
    expect(encoder.ticks()).to.equal(0);
  });

  it('should process ticks correctlys', function () {
    encoder.addRaw(0.1);
    expect(encoder.ticks(), "Initial").to.equal(0);
    encoder.addRaw(0.8);
    expect(encoder.ticks(), "One tick").to.equal(1);
    encoder.addRaw(0.2);
    expect(encoder.ticks(), "One tock").to.equal(1);
    encoder.addRaw(0.5);
    expect(encoder.ticks(), "Too small").to.equal(1);
    encoder.addRaw(0.9);
    expect(encoder.ticks(), "Two ticks").to.equal(2);
  });

  it('should handle if no new raw values are added between reads', function () {
    encoder.addRaw(0);
    expect(encoder.ticks()).to.equal(0);
    encoder.addRaw(0.8);
    expect(encoder.ticks(), "First").to.equal(1);
    expect(encoder.ticks(), "Second").to.equal(1);
  });


});