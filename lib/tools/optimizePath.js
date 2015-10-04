(function() {
  var calculateCurvature, optimizePath, sign;

  sign = function(x) {
    if (typeof x === 'number') {
      if (x) {
        if (x < 0) {
          return -1;
        } else {
          return 1;
        }
      } else if (x === x) {
        return 0;
      } else {
        return NaN;
      }
    } else {
      return NaN;
    }
  };

  calculateCurvature = function(p1, p2, p3) {
    var crossZ, k, phi, r1, r2;
    r1 = {
      x: p2.x - p1.x,
      y: p2.y - p1.y
    };
    r2 = {
      x: p2.x - p3.x,
      y: p2.y - p3.y
    };
    crossZ = r1.x * r2.y - r2.x * r1.y;
    if (crossZ === 0) {
      crossZ = 1;
    }
    phi = sign(crossZ) * Math.acos((r1.x * r2.x + r1.y * r2.y) / (Math.sqrt(r1.x * r1.x + r1.y * r1.y) * Math.sqrt(r2.x * r2.x + r2.y * r2.y)));
    k = 2 / Math.tan(phi / 2);

    /*
    k is always positive, as acos maps to 0 to pi, but it is important to also consider
    negative phi's. On a Line all curvature fluctations should nearly cancel themselves out
    the sign can be calculated using the cross product where the direction of the
    z component determines the sign
                 |       0        |
        a x b =  |       0        |  => sign ( ax by - bx ay)
                 | ax by - bx ay  |
     */
    return k;
  };

  optimizePath = function(action) {
    var curvatureThreshold, i, j, k, last, newPath, path, ref;
    curvatureThreshold = 0.08;
    path = action.events;
    newPath = [path[0]];
    last = 0;
    for (i = j = 0, ref = path.length - 2; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      k = calculateCurvature(path[last], path[i], path[i + 1]);
      if (Math.abs(k) > curvatureThreshold) {
        last = i;
        newPath.push(path[i]);
      }
    }
    newPath.push(path[path.length - 1]);
    action.events = newPath;
    return action;
  };

  module.exports = optimizePath;

}).call(this);
