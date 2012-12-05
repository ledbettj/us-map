/*jshint undef:true browser:true devel:true, jquery:true */
/*global THREE d3 _*/

(function() {
  var Map = function(params) {
    this.loadOptions(params || {});
    this.createScene();
    this.loadData('/data/us-counties.json');
    this.handleMouse();
  };

  Map.prototype.resize = function(width, height) {
    this.width  = width;
    this.height = height;

    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
  };

  Map.prototype.loadOptions = function(opts) {
    this._overlay   = opts.overlay;
    this.width      = opts.width      || 800;
    this.height     = opts.height     || 600;
    this.container  = opts.target     || document.body;
    this.projection = opts.projection ||
      d3.geo.albersUsa()
      .translate([300, 0]);

    this.axes = !!opts.axes;

    if (!this._overlay) {
      throw new Error("ArgumentError: must provide an overlay");
    }
  };

  Map.prototype.createScene = function() {

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColorHex(0x303030, 1.0);
    this.renderer.shadowMap = true;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 10000);
    this.scene  = new THREE.Scene();

    this.scene.add(this.camera);

    this.camera.position.z = 800;
    this.camera.position.x = 0;
    this.camera.position.y = 800;

    this.camera.lookAt(this.scene.position);
    //this.controls = new THREE.TrackballControls(this.camera);

    var light = new THREE.PointLight(0xFFFFFF);
    light.position.x = 0;
    light.position.y = 800;
    light.position.z = 800;
    light.castShadow = true;

    this.scene.add(light);

    if (this.axes) {
      /* draw axes for debuggering */
      var mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
      var geo = new THREE.Geometry();
      geo.vertices.push(new THREE.Vector3(-10000, 0, 0));
      geo.vertices.push(new THREE.Vector3( 10000, 0, 0));

      this.scene.add(new THREE.Line(geo, mat));

      geo = new THREE.Geometry();
      mat = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      geo.vertices.push(new THREE.Vector3(0, -10000, 0));
      geo.vertices.push(new THREE.Vector3(0,  10000, 0));

      this.scene.add(new THREE.Line(geo, mat));

      geo = new THREE.Geometry();
      mat = new THREE.LineBasicMaterial({ color: 0x0000ff });
      geo.vertices.push(new THREE.Vector3(0, 0, -10000));
      geo.vertices.push(new THREE.Vector3(0, 0,  10000));

      this.scene.add(new THREE.Line(geo, mat));
      this.allMeshes = [];
    }

  };


  Map.prototype.loadData = function(url) {

    if (this.data) {
      for(var i = 0; i < this.data.length; ++i) {
        this.renderFeature(this.data[i]);
      }
      return;
    }

    d3.json(url, function(json) {
      this.data = json.features;

      for(var i = 0; i < this.data.length; ++i) {
        this.renderFeature(this.data[i]);
      }
    }.bind(this));

  };

  Map.prototype.handleMouse = function() {
    var fov = this.camera.fov;
    var dragging = false;
    var sx, sy;

    window.onmousedown = function(event) {
      if (event.button === 0) {
        dragging = true;
        sx = event.clientX;
        sy = event.clientY;
      }
    };

    window.onmousemove = function(event) {
      if (dragging) {
        var dx = -(event.clientX - sx);
        var dy = -(event.clientY - sy);

        this.scene.position.x += dx;
        this.scene.position.z += dy;

        this.camera.position.x += dx;
        this.camera.position.z += dy;

        sx = event.clientX;
        sy = event.clientY;
      }
    }.bind(this);

    window.onmouseup = function(event) {
      if (event.button === 0) {
        dragging = false;
      }
    };

    function mousewheel(event) {
      fov = Math.max(fov - event.wheelDeltaY * 0.025, 1);

      this.camera.projectionMatrix = new THREE.Matrix4().makePerspective(
        fov, this.width / this.height, 0.1, 10000
      );

    }

    window.addEventListener('DOMMouseWheel', mousewheel.bind(this), false);
    window.addEventListener('mousewheel',    mousewheel.bind(this), false);


  };


  Map.prototype.render = function() {
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  };


  Map.prototype.run = function() {
    var animate = function(t) {
      this.render();
      //this.controls.update();
      window.requestAnimationFrame(animate, this.renderer.domElement);
    }.bind(this);

    animate(new Date().getTime());
  };

  Map.prototype.renderFeature = function(feature) {
    var meshes = [];

    switch(feature.geometry.type) {
    case 'Polygon':
      meshes = [this.meshFromPolygon(feature)];
      break;
    case 'MultiPolygon':
      meshes = this.meshesFromMultiPolygon(feature);
      break;
    default:
      console.warn("Unknown geometry type:", feature.geometry.type);
      break;
    }

    for(var i = 0; i < meshes.length; ++i) {
      var m = meshes[i];
      m.castShadow    = true;
      m.receiveShadow = true;
      m.rotation.x = Math.PI / 2;
      m.translateZ(50);
      m.translateX(-290);
      m.translateY(this.overlay.height(feature));
      m.feature = feature;
      this.scene.add(m);
    }
  };


  Map.prototype.meshFromPolygon = function(feature) {
    var rings = this.ringsFromPolygon(feature.geometry.coordinates);
    var shape = new THREE.Shape(rings[0]);
    var mesh;

    shape.holes = rings.slice(1).map(function(r) {
      return new THREE.Shape(r);
    });

    mesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        amount: this.overlay.height(feature),
        bevelEnabled: false
      }),
      new THREE.MeshLambertMaterial({
        color: this.overlay.color(feature)
      })
    );

    return mesh;
  };

  Map.prototype.meshesFromMultiPolygon = function(feature) {
    var polys  = this.polysFromMultiPolygon(feature.geometry.coordinates);
    var meshes = [];
    var rings, shape, mesh;

    for(var i = 0; i < polys; ++i) {
      rings = polys[i];
      shape = new THREE.Shape(rings[0]);

      shape.holes = rings.slice(1).map(function(r) {
        return new THREE.Shape(r);
      });

      mesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
          amount: this.overlay.height(feature),
          bevelEnabled: false
        }),
        new THREE.MeshLambertMaterial({
          color: this.overlay.color(feature)
        })
      );

      meshes.push(mesh);
    }

    return meshes;
  };

  Map.prototype.ringsFromPolygon = function(coordList) {
    var rings   = [];
    var current = [];
    var last;

    for(var i = 0; i < coordList.length; ++i) {
      var ring = coordList[i];
      current  = [];
      last     = [-Infinity, -Infinity];

      for(var j = 0; j < ring.length; ++j) {
        var coords = this.projection(ring[j]);
        if (coords[0] != last[0] || coords[1] != last[1]) {
          current.push(new THREE.Vector2(coords[0], coords[1]));
          last = coords;
        }
      }
      rings.push(current);
    }

    return rings;
  };

  Map.prototype.polysFromMultiPolygon = function(coordList) {
    var polys = [];
    for(var i = 0; i < coordList.length; ++i) {
      polys.push(this.ringsFromPolygon(coordList[i]));
    }

    return polys;
  };


  Map.prototype.updateColors = function() {
    _(this.scene.children).each(function(item) {
      if (item.feature) {
        item.material.color = new THREE.Color(this.overlay.color(item.feature));
      }
    }.bind(this));
  };


  Object.defineProperty(Map.prototype, 'overlay', {
    get: function() {
      return this._overlay;
    },
    set: function(value) {
      if (value !== this._overlay) {
        this._overlay = value;
        this.updateColors();
      }
    }
  });

  window.Map = Map;

})();
