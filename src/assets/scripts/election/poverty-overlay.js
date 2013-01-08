/*jshint undef:true browser:true devel:true*/
/*global define */

define(['d3v2', 'underscore'], function(d3, _) {
  var PovertyOverlay = function(data, options) {
    this.name    = '2010 Poverty Levels';
    this.options = options || {};
    this._data   = data;

    this.colorScale = d3.scale.pow()
      .exponent(0.5)
      .domain([0.0, 100.0])
      .range(['#00ff00', '#ff0000']);
  };

  PovertyOverlay.prototype.data = function(fips) {
    return this._data[Number(fips)];
  };

  PovertyOverlay.prototype.color = function(fips) {
    var rate = this.data(fips);
    return d3.rgb(rate !== undefined ? this.colorScale(rate) : "#c0c0c0");
  };

  PovertyOverlay.prototype.fill = function(d, i) {
    return this.color(d.id);
  };

  PovertyOverlay.prototype.fillOpacity = function(d, i) {
    return 1.0;
  };

  PovertyOverlay.prototype.stroke = function(d, i) {
    return this.color(d.id).darker(0.25);
  };

  PovertyOverlay.prototype.strokeOpacity = function(d, i) {
    return 1.0;
  };

  PovertyOverlay.prototype.mouseOver = function(node, d, i, map) {
    d3.select(node)
      .style('fill', this.color(d.id).brighter(0.75));

    var rate = this.data(d.id);

    map.tooltip.show({
      x: d3.event.x || d3.event.layerX,
      y: d3.event.y || d3.event.layerY,
      title: d.properties.name + " County",
      lines: [{label: 'Poverty Rate:', value: (rate || "--") }],
      format: function(n) {
        return typeof(n) == typeof(2) ? n + '%' : n;
      }
    });
  };

  PovertyOverlay.prototype.mouseOut = function(node, d, i, map) {
    d3.select(node)
      .style('fill', this.color(d.id));
  };

  PovertyOverlay.prototype.mouseMove = function(node, d, i, map) {
    map.tooltip.move(
      d3.event.x || d3.event.layerX,
      d3.event.y || d3.event.layerY
    );
  };

  return PovertyOverlay;
});
