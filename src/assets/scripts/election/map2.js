/*jshint undef:true browser:true devel:true*/
/*global define */

define(['underscore', 'd3v2', 'election/tooltip'], function(_, d3, Tooltip){

  var Map = function(options) {
    this._overlay = options.overlay;

    this.projection = d3.geo.albersUsa()
      .scale(options.scale)
      .translate(options.translate);

    this.path = d3.geo.path().projection(this.projection);

    this.svg = d3.select(options.target).call(
      d3.behavior.zoom()
        .translate(this.projection.translate())
        .scale(this.projection.scale())
        .on('zoom', this.rescale.bind(this))
    );
    this.startLoading(options.translate);

    this.counties = this.svg.append('svg:g')
      .attr('id', 'counties');

    this.states = this.svg.append('svg:g')
      .attr('id', 'states');

    this.json = {};
    this.tooltip = new Tooltip(this.svg, {});
    /* loading the json should only be done once. */
    d3.json('data/us-counties.json', function(jsonCounties) {
      d3.json('data/us-states.json', function(jsonStates) {
        this.json.counties = jsonCounties;
        this.json.states   = jsonStates;
        this.stopLoading();
        this.render();
      }.bind(this));
    }.bind(this));

  };

  Map.prototype.startLoading = function(translate) {
    var p = 'M ' + translate[0].toString() + ' ' + (translate[1] - 10).toString() +
            ' a 10 10 0 1 0 1 0 Z';

    var ring = this.svg.append('svg:circle')
          .attr('class', 'spinner')
          .style('fill', 'none')
          .style('stroke', '#C0C0C0')
          .style('stroke-width', 6)
          .attr('r', 10)
          .attr('cx', translate[0])
          .attr('cy', translate[1]);

    var spinner = this.svg.append('svg:circle')
          .attr('class', 'spinner')
          .attr('r', 4)
          .style('fill', '#e0e0e0')
          .style('stroke', 'none')
          .style('stroke-width', 0);

    spinner.append('svg:animateMotion')
      .attr('path', p)
      .attr('rotate', 'auto')
      .attr('dur', '0.75s')
      .attr('repeatCount', 'indefinite');
  };

  Map.prototype.stopLoading = function() {
    this.svg.selectAll('.spinner').remove();
  };

  Object.defineProperty(Map.prototype, 'overlay', {
    /* get the selected overlay */
    get: function() {
      return this._overlay;
    },
    /* change the selected overlay and redraw the map */
    set: function(value) {
      if (this._overlay !== value) {
        this._overlay = value;
        this.tooltip.hide();
        this.tooltip.reset();
        this.render();
      }
    },
    enumerable:   false,
    configurable: false
  });

  /* draw the map and apply the selected overlay */
  Map.prototype.render = function() {
    var self = this;
    var noop = function() {};

    var o = this.overlay;

    this.counties.selectAll('path')
      .data(this.json.counties.features)
      .enter()
        .append('svg:path')
          .attr('d', this.path)
          .attr('class', 'county')
          .attr('id', function(d) { return 'county-fips-' + d.id; });

    this.counties.selectAll('path')
      .data(this.json.counties.features)
      .on('mouseover', function(d, i) {
        return o.mouseOver ? o.mouseOver(this, d, i, self) : null;
      })
      .on('mouseout', function(d, i) {
        return o.mouseOut ? o.mouseOut(this, d, i, self) : null;
      })
      .on('mousemove', function(d, i) {
        return o.mouseMove ? o.mouseMove(this, d, i, self) : null;
      })
      .transition().duration(1000)
      .style('fill',           o.fill ? o.fill.bind(o) : noop)
      .style('fill-opacity',   o.fillOpacity ? o.fillOpacity.bind(o) : noop)
      .style('stroke',         o.stroke ? o.stroke.bind(o) : noop)
      .style('stroke-opacity', o.strokeOpacity ? o.strokeOpacity.bind(o) : noop);

    this.states.selectAll('path')
      .data(this.json.states.features)
      .enter()
        .append('svg:path')
          .attr('d', this.path)
          .attr('class', 'state')
          .on('mouseout', this.tooltip.hide.bind(this.tooltip));
  };

  /* rescale the map in response to a scroll or zoom event. */
  Map.prototype.rescale = function() {
    if (d3.event) {
      this.projection
        .translate(d3.event.translate)
        .scale(d3.event.scale);
    }

    this.svg.selectAll('path.county').attr('d', this.path);
    this.svg.selectAll('path.state').attr('d', this.path);

  };


  return Map;
});
