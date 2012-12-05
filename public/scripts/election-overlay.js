/*jshint undef:true browser:true devel:true*/
/*global d3 _ */

(function() {
  var ElectionOverlay = function(data, options) {
    this.name    = '2012 Presidental Election';
    this.options = options || {};
    this._data   = data;
    this.parties = {
      dem: {label: 'Obama',   color: '#000088'},
      gop: {label: 'Romney',  color: '#880000'},
      lib: {label: 'Johnson', color: '#daca00'},
      grn: {label: 'Stein',   color: '#008800'},
      jp:  {label: 'Goode',   color: '#880088'},
      psl: {label: 'Lindsay', color: '#ff8800'},
      npd: {label: 'Other',   color: '#c0c0c0'}
    };

    this.maxTotal = 0;

    /* calculate total number of voters for each county, and pre-compute
     * how to color this county. */
    _(this._data).each(function(votes, fips) {

      if (!votes.total) {
        this._data[fips].total = _(votes).reduce(function(total, voteCount) {
          return total + voteCount;
        });
      }

      if (!votes.color) {
        this._data[fips].color = (
          Math.floor(255 * votes.gop / votes.total) << 16 |
          Math.floor(255 * (votes.total - votes.gop - votes.dem) / votes.total) << 8 |
          Math.floor(255 * votes.dem / votes.total) << 0
        );
      }

      this.maxTotal = Math.max(this.maxTotal, votes.total);
    }, this);


    this.heightScale = d3.scale.log()
      .domain([1, this.maxTotal])
      .range([1, 25]);
  };

  ElectionOverlay.prototype.data = function(fips) {
    return this._data[Number(fips)];
  };

  ElectionOverlay.prototype.color = function(feature) {
    var votes = this.data(feature.id);
    return votes ? votes.color : 0xc0c0c0;
  };

  ElectionOverlay.prototype.height = function(feature) {
    var data = this.data(feature.id);
    return data ? this.heightScale(data.total) : 1;
  };

  window.ElectionOverlay = ElectionOverlay;

})();
