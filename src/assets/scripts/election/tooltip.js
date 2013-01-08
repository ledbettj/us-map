/*jshint undef:true browser:true devel:true*/
/*global define */


define(['d3v2'], function(d3) {
  var Tooltip = function(svg, options) {

    this.options = {
      minWidth:    options.minWidth    || 180,
      minHeight:   options.minHeight   || 0,
      padding:     options.padding     || 12,
      arrowHeight: options.arrowHeight || 18,
      arrowWidth:  options.arrowWidth  || 8,
      yOffset:     options.yOffset     || 4
    };

    this.g = svg.append('svg:g')
      .attr('id', 'tooltip-group')
      .attr('transform', 'translate(-300)')
      .on('mouseover', this.hide.bind(this));

    this.background = this.g.append('svg:path')
      .attr('id', 'tooltip-background')
      .attr('d', 'M 0 0 l 100 0 l 0 56 l -100 0 l 0 -56');

    this.content = this.g.append('svg:g')
      .attr('id', 'tooltip-content');

    this.title = this.content.append('svg:text')
      .attr('id', 'tooltip-title')
      .attr('x', this.options.padding)
      .attr('y',  1.5 * this.options.padding);

  };

  Tooltip.prototype.show = function(params) {
    var boxWidth  = this.options.minWidth;
    var boxHeight = this.options.minHeight;
    var sel;

    if (params.bars) {
      var range = d3.scale.linear()
        .domain([0, params.lines[0].total])
        .range([0, 120]);

      var rightEdge = this.options.minWidth + this.options.padding;

      sel = this.content.selectAll('rect').data(params.lines);

      sel.enter().append('svg:rect')
        .attr('height', 16)
        .attr('y', function(d, i) { return this.options.padding + (i+1) * 16; }.bind(this))
        .attr('x', function(d, i) { return rightEdge - range(d.value); })
        .attr('width', function(d, i) { return range(d.value); })
        .style('fill', function(d) { return d.color; });

      sel.transition()
        .attr('x', function(d, i) { return rightEdge - range(d.value); })
        .attr('width', function(d, i) { return range(d.value); })
        .style('fill', function(d) { return d.color; });

      sel.exit().remove();

    }

    this.title.text(params.title);

    sel = this.content.selectAll('.tooltip-labels')
      .data(params.lines);

    sel.enter().append('svg:text')
      .attr('class', 'tooltip-labels')
      .attr('x', this.options.padding)
      .attr('y', function(d, i) { return 2 * this.options.padding + 16 * (i+1);}.bind(this));

    sel.text(function(d){ return d.label; });

    sel.exit().remove();

    sel = this.content.selectAll('.tooltip-values')
      .data(params.lines);

    sel.enter().append('svg:text')
      .attr('class', 'tooltip-values')
      .attr('x', boxWidth + this.options.padding)
      .attr('y', function(d, i) { return 2 * this.options.padding + 16 * (i+1);}.bind(this));

    sel.text(function(d){ return params.format ? params.format(d.value) : d.value; });

    sel.exit().remove();

    var bbox = this.content.node().getBBox();

    boxWidth  = Math.max(boxWidth, bbox.width)   + this.options.padding * 2;
    boxHeight = Math.max(boxHeight, bbox.height) + this.options.padding * 2;

    /* top and right of the tooltip */
    var boxPath = 'M 0 0 l %bw 0 l 0 %bh ';
    /* underside of tooltip, excluding arrow */
    boxPath += 'l ' + (-boxWidth + this.options.arrowWidth) + ' 0 ';
    /* arrow */
    boxPath += 'l -%aw %ah l 0 -%ah l 0 -%bh';

    boxPath = boxPath
      .replace(/%bw/g, boxWidth)
      .replace(/%bh/g, boxHeight)
      .replace(/%aw/g, this.options.arrowWidth)
      .replace(/%ah/g, this.options.arrowHeight);

    this.background.attr('d', boxPath);

    this.boxHeight = boxHeight;
    this.boxWidth  = boxWidth;
    this.move(params.x, params.y);
  };

  Tooltip.prototype.hide = function() {
    this.g.attr('transform', 'translate(-300)');
  };

  Tooltip.prototype.move = function(x, y) {
    this.g.attr(
      'transform',
      'translate(' + x + ',' +
        (y - this.boxHeight -
         this.options.arrowHeight -
         this.options.yOffset) + ')');
  };

  Tooltip.prototype.reset = function() {
    this.content.selectAll(".tooltip-labels, .tooltip-values, rect").remove();
  };

  return Tooltip;
});
