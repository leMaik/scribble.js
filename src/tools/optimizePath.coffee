# calculates the sign of a number
# see: http://stackoverflow.com/questions/7624920/number-sign-in-javascript
sign = (x) ->
  if typeof x == 'number' then (if x then (if x < 0 then -1 else 1) else if x == x then 0 else NaN) else NaN

# calculates the [discrete] curvature of two connected line segments represented
# by their points p1-p2-p3 where (p1,p2) is the first line segment and (p2,p3) the second
calculateCurvature = (p1,p2,p3) ->
  # Idea from http://page.math.tu-berlin.de/~bobenko/Lehre/Skripte/KuF.pdf page 22
  # r1: direction of segment p1->p2
  # r2: direction of segmet p3->p2
  r1 = {x: p2.x-p1.x, y: p2.y-p1.y}
  r2 = {x: p2.x-p3.x, y: p2.y-p3.y}

  crossZ = r1.x * r2.y - r2.x * r1.y
  if crossZ == 0 then crossZ = 1

  # phi: angle of the two line segmets
  # k: curvature
  phi = sign(crossZ) * Math.acos((r1.x*r2.x+r1.y*r2.y) / ( Math.sqrt(r1.x*r1.x+r1.y*r1.y) * Math.sqrt(r2.x*r2.x+r2.y*r2.y) ))
  k = 2 / Math.tan(phi / 2)

  ###
  k is always positive, as acos maps to 0 to pi, but it is important to also consider
  negative phi's. On a Line all curvature fluctations should nearly cancel themselves out
  the sign can be calculated using the cross product where the direction of the
  z component determines the sign
               |       0        |
      a x b =  |       0        |  => sign ( ax by - bx ay)
               | ax by - bx ay  |
  ###

  return k

optimizePath = (action) ->
  curvatureThreshold = 0.08
  path = action.events
  newPath = [path[0]]
  last = 0;
  for i in [0...path.length-2]
    k = calculateCurvature path[last], path[i], path[i+1]

    if Math.abs(k)>curvatureThreshold
      last = i
      newPath.push path[i]

  newPath.push path[path.length-1]

  #console.log("optimizedPath\n points before opzimization: " + path.length + "\n points after opzimization: " + newPath.length);
  action.events = newPath
  return action

module.exports = optimizePath
