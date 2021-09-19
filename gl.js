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

var gl;
var program;

var batches = [];

var mvMat;
var pMat;

function destroyBatches () {
  for (var i = 0, b; b = batches[i]; ++i) {
    b.destroy();
  }
  batches = [];
}

function makeFractal (depth) {
  destroyBatches();

  matrices = getMatrices();
  transforms = getTransformations([], matrices, depth);

  var cubes = [];
  for (var i = 0, tr; tr = transforms[i]; ++i) {
    var cube = createCube();
    for (var j = 0, m; m = tr[j]; ++j) {
      cube = transformCube(cube, m);
    }
    cubes.push(cube);
  }

  var batchSize = 1024;

  for (var i = 0; i < cubes.length; i += batchSize) {

    var geom = cubes[i];
    for (var j = i + 1; j < i + batchSize && j < cubes.length; ++j) {
      geom = mergeGeoms(geom, cubes[j]);
    }
    batches.push(new Batch(
      geom.vertices,
      geom.normals,
      geom.indexes
    ));
  }

  drawScene();
}


function initgl () {
  var canvas = document.getElementById("ifs-canvas");
  try {
    gl = canvas.getContext("experimental-webgl");
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.width = canvas.width;
    gl.height = canvas.height;
  } catch (e) {
    // TODO: error msg;
    alert ("Webgl is not working!");
  }
}

function getShader (domId) {
  var tag = document.getElementById(domId);
  var shaderSrc = tag.firstChild.textContent;

  var shader;
  if (tag.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (tag.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, shaderSrc);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // TODO: error msg;
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function initMatrixes () {
  mvMat = mat4.create();
  mat4.identity(mvMat);

  pMat = mat4.create();
  mat4.identity(pMat);
}

function initShaders () {

  var fragmentShader = getShader("shader-fs");
  var vertexShader = getShader("shader-vs");

  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // TODO: error msg;
    alert("Could not initialise shaders");
  }

  gl.useProgram(program);

  program.vPos = gl.getAttribLocation(program, "vPos");
  gl.enableVertexAttribArray(program.vPos);

  program.vNor = gl.getAttribLocation(program, "vNor");
  gl.enableVertexAttribArray(program.vNor);

  program.mvMat = gl.getUniformLocation(program, "mvMat");
  program.pMat = gl.getUniformLocation(program, "pMat");
}

function initScene () {
  mat4.perspective(
    45.0,
    gl.width / gl.height,
    0.1, 100.0, pMat
  );
  mat4.translate(mvMat, [0.0, 0.0, -5.0]);

  gl.uniformMatrix4fv(program.mvMat, false, mvMat);
  gl.uniformMatrix4fv(program.pMat, false, pMat);
}

function rotateCamera (rotX, rotY) {
  mat4.identity(mvMat);

  mat4.translate(mvMat, [0.0, 0.0, -5.0]);
  mat4.rotate(mvMat, Math.PI * 2 * rotY / 360, [1, 0, 0]);
  mat4.rotate(mvMat, Math.PI * 2 * rotX / 360, [0, 1, 0]);

  gl.uniformMatrix4fv(program.mvMat, false, mvMat);
  drawScene();
}

function drawScene () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (var i = 0, b; b = batches[i]; ++i) {
    b.draw(program.vPos, program.vNor);
  }
  gl.flush();
}

function main () {
  initgl();
  initMatrixes();
  initShaders();

  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  initScene();
  initUi();

  //makeFractal();
  drawScene();
}
