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

var isRotating = false;
var prevX = 0;
var prevY = 0;

var angleX = 0;
var angleY = 0;

function initUi () {
  var nav = $('#nav')
  nav.mousedown(function (e) {
    e.preventDefault();
    $('#arrows').show();
    isRotating = true;
    prevX = e.pageX;
    prevY = e.pageY;
  });
  var stopRotate = function (e) {
    $('#arrows').hide();
    isRotating = false;
  }
  nav.hover(function () {}, stopRotate);
  nav.mouseup(stopRotate);

  nav.mousemove(function (e) {
    e.preventDefault();
    if (isRotating) {
      angleY = (angleY + e.pageY - prevY) % 360;
      if (angleY < -180.0 || angleY > 180.0) {
        angleX = (angleX - e.pageX + prevX) % 360;
      } else {
        angleX = (angleX + e.pageX - prevX) % 360;
      }
      rotateCamera(angleX, angleY);
      prevX = e.pageX;
      prevY = e.pageY;
    }
  });

  $('#generate').click(function (e) {
    this.disabled = true;
    $('#working').show();

    setTimeout(function () {
      makeFractal(parseInt($('#depth').val(), 10));
      $('#working').hide();
      $('#generate').attr('disabled', '');
    }, 1);
  });

  $('#predefined a').click(function (e) {
    fillFromHash(this.href);
  });

  $('#depth').change(function (e) {
    var attr;
    if (this.value > 4) {
      attr = 'visible';
    } else {
      attr = 'hidden';
    }
    $('#message').css('visibility', attr);
  });

  if (location.hash) {
    fillFromHash();
  } else {
    $('#predefined a:first').click();
  }
  $('#generate').click();
}

function getMatrices () {
  var matrices = [];
  var hash = [];

  $('#ui div.matrix').each(function (index, div) {
    var active = $('input[type=checkbox]', div).attr('checked');
    if (!active) {
      return;
    }

    var inputs = $('input[type=text]', div);
    var values = [];
    for (var i = 0, input; input = inputs[i]; ++i) {
      var val = parseFloat(input.value)
      values.push(val);
      hash.push(val);
    }
    var posM = mat4.transpose(mat4.create(values));
    var normM = mat4.create(posM);
    normM[12] = 0.0;
    normM[13] = 0.0;
    normM[14] = 0.0;
    normM[15] = 1.0;
    matrices.push([posM, normM]);
  });

  location.hash = '#' + hash.join(',');
  return matrices;
}

function fillFromHash(hash) {
  $('#ui input[type=checkbox]').attr('checked', '');

  hash = hash || location.hash;
  var values = hash.substring(hash.indexOf('#') + 1).split(',');

  var divs = $('#ui div.matrix');

  for (var i = 0; i < values.length; i += 16) {
    var inputs = $('input', divs[i / 16]);
    for (var j = i; j < i + 16; ++j) {
      inputs[j - i].value = values[j];
    }
    inputs[inputs.length - 1].checked = 'checked';
  }
}

