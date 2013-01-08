/*jshint undef:true browser:true devel:true*/
/*global define*/

define(['d3v2', 'underscore'], function(d3, _) {

  var RaceOverlay = function(data, options) {
    this.name    = '2000 Census - Race';
    this.options = options;
    this._data   = data;
    this.categories = {
      white:    { label: 'White',    color: '#a0a0a0'},
      black:    { label: 'Black',    color: '#0000aa'},
      hispanic: { label: 'Hispanic', color: '#aa0000'},
      asian:    { label: 'Asian',    color: '#00aa00'},
      'native': { label: 'Native American',           color: '#010101'},
      hawaiian: { label: 'Hawaiian/Pacific Islander', color: '#aaaa00'},
      other:    { label: 'Other',       color: '#00aaaa'},
      multi:    { label: 'Multiracial', color: '#aa00aa'}
    };

    /* calculate the total number of people for each county, and pre-compute
     * how to color this county */
    _(this._data).each(function(breakdown, fips) {
      this._data[fips].total = _(breakdown).reduce(function(total, count) {
        return total + count;
      }, 0);

      this._data[fips].color = this.computeColor(breakdown);
    }, this);

  };

  RaceOverlay.prototype.data = function(fips) {
    return this._data[Number(fips)];
  };

  RaceOverlay.prototype.color = function(fips) {
    var d = this.data(fips);
    return d ? d.color : d3.rgb(0xc0, 0xc0, 0xc0);
  };

  RaceOverlay.prototype.fill = function(d, i) {
    return this.color(d.id);
  };

  RaceOverlay.prototype.fillOpacity = function(d, i) {
    return 1.0;
  };

  RaceOverlay.prototype.stroke = function(d, i) {
    return this.color(d.id).darker(0.25);
  };

  RaceOverlay.prototype.strokeOpacity = function(d, i) {
    return 1.0;
  };


  RaceOverlay.prototype.mouseOver = function(node, d, i, map) {
    d3.select(node)
      .style('fill', this.color(d.id).brighter(0.75));

    var data = this.data(d.id);

    if (data) {

      var lines = _(this.categories).map(function(row, abbr){
        return { label: row.label,
                 color: row.color,
                 value: data[abbr],
                 total: data.total
               };
      });

      map.tooltip.show({
        x: d3.event.x || d3.event.layerX,
        y: d3.event.y || d3.event.layerY,
        title: d.properties.name + " County",
        lines: lines,
        bars:  true,
        format: d3.format(',')
      });
    } else {
      map.tooltip.hide();
    }
  };

  RaceOverlay.prototype.mouseOut = function(node, d, i, map) {
    d3.select(node)
      .style('fill', this.color(d.id));
  };

  RaceOverlay.prototype.mouseMove = function(node, d, i, map) {
    map.tooltip.move(
      d3.event.x || d3.event.layerX,
      d3.event.y || d3.event.layerY
    );
  };


  RaceOverlay.prototype.computeColor = function(data) {

    var hsl = _(this.categories).reduce(function(hsl, row, abbr) {
      var color  = d3.hsl(row.color);
      var weight = data[abbr] / data.total;

      hsl.h += color.h * weight;
      hsl.s += color.s * weight;
      hsl.l += color.l * weight;

      return hsl;
    }, {h: 0, s: 0, l: 0}, this);

    return d3.hsl(hsl.h, hsl.s, hsl.l);
  };

  return RaceOverlay;
});

