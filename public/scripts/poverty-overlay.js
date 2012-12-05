/*jshint undef:true browser:true devel:true*/
/*global d3 _ */

(function() {

  var PovertyOverlay = function(data, options) {
    this.name    = '2010 Poverty Levels';
    this.options = options || {};
    this._data   = data;
    this.scale   = d3.scale.pow()
      .exponent(0.5)
      .domain([0.0, 100.0])
      .range([0, 255]);
  };

  PovertyOverlay.prototype.data = function(fips) {
    return this._data[Number(fips)];
  };

  PovertyOverlay.prototype.color = function(feature) {
    var rate = this.data(feature.id);
    var scaled = rate === undefined ? null : this.scale(rate);
    return scaled === null ? 0xc0c0c0 : (
      (scaled) << 16 | (255 - scaled) << 8 | 0
    );
  };

  PovertyOverlay.prototype.height = function(feature) {
    return 1.0;
  };

  window.PovertyOverlay = PovertyOverlay;

})();
