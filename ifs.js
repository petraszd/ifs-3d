/*
 * Copyright (c) 2010 Petras Zdanavicius
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

function createCube() {
  var vertices = [
    // Front face
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    1.0,  1.0,  1.0,
    1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0,  1.0,  1.0,
    1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
  ];
  var normals = [
    // Front face
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,

    // Back face
    0.0,  0.0, -1.0,
    0.0,  0.0, -1.0,
    0.0,  0.0, -1.0,
    0.0,  0.0, -1.0,

    // Top face
    0.0,  1.0,  0.0,
    0.0,  1.0,  0.0,
    0.0,  1.0,  0.0,
    0.0,  1.0,  0.0,

    // Bottom face
    0.0, -1.0,  0.0,
    0.0, -1.0,  0.0,
    0.0, -1.0,  0.0,
    0.0, -1.0,  0.0,

    // Right face
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,

    // Left face
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ];
  var indexes = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];
  return {
    'vertices': vertices,
    'indexes': indexes,
    'normals': normals
  };
}

function transformCube (cube, matrix) {
  var verts = cube.vertices;
  var norms = cube.normals;

  var posM = matrix[0];
  var normM = matrix[1];

  for (var i = 0; i < verts.length; i += 3) {
    var temp = [verts[i], verts[i+1], verts[i+2]];
    mat4.multiplyVec3(posM, temp);
    verts[i] = temp[0];
    verts[i+1] = temp[1];
    verts[i+2] = temp[2];

    temp = [norms[i], norms[i+1], norms[i+2]];
    mat4.multiplyVec3(normM, temp);
    vec3.normalize(temp);
    norms[i] = temp[0];
    norms[i+1] = temp[1];
    norms[i+2] = temp[2];
  }
  return cube;
}

function mergeGeoms (geom1, geom2) {
  var geom2indexes = geom2.indexes;
  var delta = parseInt(geom1.vertices.length / 3, 10);
  for (var i = 0; i < geom2indexes.length; ++i) {
    geom2indexes[i] += delta;
  }
  return {
    'vertices': geom1.vertices.concat(geom2.vertices),
    'indexes': geom1.indexes.concat(geom2.indexes),
    'normals': geom1.normals.concat(geom2.normals)
  };
}

function getTransformations(transforms, matrices, levels) {
  for (var level = 0; level <= levels; ++level) {
    var newTransforms = [];
    for (var i = 0, m; m = matrices[i]; ++i) {
      if (transforms.length == 0) {
        newTransforms.push([m]);
      } else {
        for (var j = 0, t; t = transforms[j]; ++j) {
          var newT = t.slice();
          newT.push(m);
          newTransforms.push(newT);
        }
      }
    }
    transforms = newTransforms;
  }
  return transforms;
}
