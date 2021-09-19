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

/**
 * Batch
 */
function Batch(vertices, normals, faces) {
  this.vertices = this.genBuffer(
    vertices, 3, gl.ARRAY_BUFFER, Float32Array
  );
  this.normals = this.genBuffer(
    normals, 3, gl.ARRAY_BUFFER, Float32Array
  );
  this.faces = this.genBuffer(
    faces, 1, gl.ELEMENT_ARRAY_BUFFER,  Uint16Array
  );
}

Batch.prototype.genBuffer = function (
    data, itemSize, bufferType, dataType) {

  var buffer = gl.createBuffer();

  gl.bindBuffer(bufferType, buffer);
  gl.bufferData(bufferType, new dataType(data), gl.STATIC_DRAW);

  buffer.itemSize = itemSize;
  buffer.numItems = data.length / itemSize;

  return buffer;
}

Batch.prototype.draw = function (posParam, norParam) {
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
  gl.vertexAttribPointer(
    posParam, this.vertices.itemSize, gl.FLOAT, false, 0, 0
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, this.normals);
  gl.vertexAttribPointer(
    norParam, this.normals.itemSize, gl.FLOAT, false, 0, 0
  );
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.faces);

  gl.drawElements(gl.TRIANGLES, this.faces.numItems, gl.UNSIGNED_SHORT, 0);
}

Batch.prototype.destroy = function () {
  gl.deleteBuffer(this.vertices);
  gl.deleteBuffer(this.normals);
  gl.deleteBuffer(this.faces);
}
