"use strict";

var canvas;
var gl;

var primitiveType;
var offset = 0;
var count = 12;

var colorUniformLocation;
var translation = [200, 200, 0]; //top-left of rectangle
var angle = 0;
var angleInRadians = 0;
var scale = [1.0, 1.0, 1.0]; //default scale
var matrix;
var matrixLocation;
var translationMatrix;
var rotationMatrix;
var scaleMatrix;
var moveOriginMatrix; //move origin to 'center' of the letter as center of rotation
var projectionMatrix;

var movement = 1;
var currentposition = 0;
var scalefactor = 0.005;
var currentscale = 0.005;
var middlewidth = 0;

window.onload = function init() {
	canvas = document.getElementById("gl-canvas");

	gl = canvas.getContext('webgl2');
	if (!gl) alert("WebGL 2.0 isn't available");

	//
	//  Configure WebGL
	//
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 0.0);

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.enable(gl.BLEND);
	gl.disable(gl.DEPTH_TEST);

	//  Load shaders and initialize attribute buffers
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// Load the data into the GPU
	var letterbuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, letterbuffer);


	// Associate out shader variables with our data buffer

	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	function radToDeg(r) {
		return r * 180 / Math.PI;
	}

	function degToRad(d) {
		return d * Math.PI / 180;
	}

	colorUniformLocation = gl.getUniformLocation(program, "u_color");

	matrixLocation = gl.getUniformLocation(program, "u_matrix");
	middlewidth = Math.floor(gl.canvas.width / 2);

	primitiveType = gl.TRIANGLES;
	render(); //default render
}

function render() {
	currentposition += movement;
	currentscale += scalefactor;

	if (currentposition > (middlewidth / 4)) {
		currentposition = middlewidth / 4;
		movement = -movement;

	};
	if (currentposition < 0) {
		currentposition = 0;
		movement = -movement;
	};

	if (currentscale > 2) {
		currentscale = 2.0;
		scalefactor = -scalefactor;
	};

	if (currentscale < 0.05) {
		currentscale = 0.05;
		scalefactor = -scalefactor;
	};

	angle += 1.0;

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	drawletterD();
	drawletterI();

	requestAnimationFrame(render); //refresh

}

function drawletterD() {
	count = 156; //number of vertices 
	translation = [middlewidth - 130, gl.canvas.height / 2 - 90, 0];

	angleInRadians = 360 - (angle * Math.PI / 180); //rotating counter clockwise

	setGeometry(gl, 1);

	matrix = m4.projection(gl.canvas.width, gl.canvas.height, 400);
	matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
	matrix = m4.xRotate(matrix, angleInRadians);
	matrix = m4.yRotate(matrix, angleInRadians);
	matrix = m4.zRotate(matrix, angleInRadians);
	matrix = m4.scale(matrix, currentscale, currentscale, currentscale);
	matrix = m4.translate(matrix, currentposition - 65, currentposition - 90, currentposition);

	//set color
	gl.uniform4f(colorUniformLocation, 0, 0.67, 0.11, 0.35);

	// Set the matrix.
	gl.uniformMatrix4fv(matrixLocation, false, matrix);

	//gl.clear( gl.COLOR_BUFFER_BIT );
	gl.drawArrays(primitiveType, offset, count);


}

function drawletterI() {
	count = 108; //number of vertices 

	setGeometry(gl, 2);

	translation = [middlewidth + 100, gl.canvas.height / 2 - 90, 0];

	angleInRadians = (angle * Math.PI / 180); //rotating counter clockwise

	matrix = m4.projection(gl.canvas.width, gl.canvas.height, 400);
	matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
	matrix = m4.xRotate(matrix, angleInRadians);
	matrix = m4.yRotate(matrix, angleInRadians);
	matrix = m4.zRotate(matrix, angleInRadians);
	matrix = m4.scale(matrix, currentscale, currentscale, currentscale);
	matrix = m4.translate(matrix, currentposition - 50, currentposition - 90, currentposition);

	//set color
	gl.uniform4f(colorUniformLocation, 0.96, 0, 0.68, 0.35);

	// Set the matrix.
	gl.uniformMatrix4fv(matrixLocation, false, matrix);

	//gl.clear( gl.COLOR_BUFFER_BIT );
	gl.drawArrays(primitiveType, offset, count);


}

var m4 = { 						//setup 4x4 transformation matrix object

	projection: function (width, height, depth) {
		// Note: This matrix flips the Y axis so 0 is at the top.
		return [
			2 / width, 0, 0, 0,
			0, -2 / height, 0, 0,
			0, 0, 2 / depth, 0,
			-1, 1, 0, 1,
		];
	},

	translation: function (tx, ty, tz) {
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			tx, ty, tz, 1,
		];
	},

	xRotation: function (angleInRadians) {
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);

		return [
			1, 0, 0, 0,
			0, c, s, 0,
			0, -s, c, 0,
			0, 0, 0, 1,
		];
	},

	yRotation: function (angleInRadians) {
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);

		return [
			c, 0, -s, 0,
			0, 1, 0, 0,
			s, 0, c, 0,
			0, 0, 0, 1,
		];
	},

	zRotation: function (angleInRadians) {
		var c = Math.cos(angleInRadians);
		var s = Math.sin(angleInRadians);

		return [
			c, s, 0, 0,
			-s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		];
	},

	scaling: function (sx, sy, sz) {
		return [
			sx, 0, 0, 0,
			0, sy, 0, 0,
			0, 0, sz, 0,
			0, 0, 0, 1,
		];
	},

	multiply: function (a, b) {
		var b00 = b[0 * 4 + 0];
		var b01 = b[0 * 4 + 1];
		var b02 = b[0 * 4 + 2];
		var b03 = b[0 * 4 + 3];
		var b10 = b[1 * 4 + 0];
		var b11 = b[1 * 4 + 1];
		var b12 = b[1 * 4 + 2];
		var b13 = b[1 * 4 + 3];
		var b20 = b[2 * 4 + 0];
		var b21 = b[2 * 4 + 1];
		var b22 = b[2 * 4 + 2];
		var b23 = b[2 * 4 + 3];
		var b30 = b[3 * 4 + 0];
		var b31 = b[3 * 4 + 1];
		var b32 = b[3 * 4 + 2];
		var b33 = b[3 * 4 + 3];
		var a00 = a[0 * 4 + 0];
		var a01 = a[0 * 4 + 1];
		var a02 = a[0 * 4 + 2];
		var a03 = a[0 * 4 + 3];
		var a10 = a[1 * 4 + 0];
		var a11 = a[1 * 4 + 1];
		var a12 = a[1 * 4 + 2];
		var a13 = a[1 * 4 + 3];
		var a20 = a[2 * 4 + 0];
		var a21 = a[2 * 4 + 1];
		var a22 = a[2 * 4 + 2];
		var a23 = a[2 * 4 + 3];
		var a30 = a[3 * 4 + 0];
		var a31 = a[3 * 4 + 1];
		var a32 = a[3 * 4 + 2];
		var a33 = a[3 * 4 + 3];

		return [
			b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
			b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
			b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
			b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
			b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
			b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
			b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
			b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
			b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
			b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
			b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
			b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
			b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
			b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
			b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
			b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
		];
	},

	translate: function (m, tx, ty, tz) {
		return m4.multiply(m, m4.translation(tx, ty, tz));
	},

	xRotate: function (m, angleInRadians) {
		return m4.multiply(m, m4.xRotation(angleInRadians));
	},

	yRotate: function (m, angleInRadians) {
		return m4.multiply(m, m4.yRotation(angleInRadians));
	},

	zRotate: function (m, angleInRadians) {
		return m4.multiply(m, m4.zRotation(angleInRadians));
	},

	scale: function (m, sx, sy, sz) {
		return m4.multiply(m, m4.scaling(sx, sy, sz));
	},
};


function setGeometry(gl, shape) {
	switch (shape) {
		case 1:
			// Fill the buffer with the values that define a letter 'D'.
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array([
					// middle column front
					15, 0, 0,
					45, 0, 0,
					15, 150, 0,
					15, 150, 0,
					45, 0, 0,
					45, 150, 0,

					// middle column back
					15, 0, 30,
					45, 0, 30,
					15, 150, 30,
					15, 150, 30,
					45, 0, 30,
					45, 150, 30,

					// middle column left
					15, 0, 0,
					15, 0, 30,
					15, 150, 30,
					15, 0, 0,
					15, 150, 30,
					15, 150, 0,

					// middle column right
					45, 0, 30,
					45, 0, 0,
					45, 150, 30,
					45, 150, 30,
					45, 0, 0,
					45, 150, 0,

					// top rung top
					15, 0, 0,
					45, 0, 0,
					45, 0, 30,
					15, 0, 0,
					45, 0, 30,
					15, 0, 30,

					// top rung bottom
					15, 150, 0,
					45, 150, 0,
					45, 150, 30,
					15, 150, 0,
					45, 150, 30,
					15, 150, 30,

					// top horizontal front
					45, 0, 0,
					45, 30, 0,
					80, 0, 0,
					80, 0, 0,
					80, 30, 0,
					45, 30, 0,

					// top horizontal back
					45, 0, 30,
					45, 30, 30,
					80, 0, 30,
					80, 0, 30,
					80, 30, 30,
					45, 30, 30,

					// top horizontal top
					45, 0, 0,
					80, 0, 0,
					80, 0, 30,
					45, 0, 0,
					80, 0, 30,
					45, 0, 30,

					// top horizontal bottom
					45, 30, 0,
					80, 30, 0,
					80, 30, 30,
					45, 30, 0,
					80, 30, 30,
					45, 30, 30,

					// top curve front
					80, 0, 0,
					130, 40, 0,
					90, 40, 0,
					80, 0, 0,
					80, 30, 0,
					90, 40, 0,

					// top curve top
					80, 0, 0,
					130, 40, 0,
					130, 40, 30,
					80, 0, 0,
					130, 40, 30,
					80, 0, 30,

					// top curve back
					80, 0, 30,
					130, 40, 30,
					90, 40, 30,
					80, 0, 30,
					80, 30, 30,
					90, 40, 30,

					// top curve bottom
					80, 30, 0,
					90, 40, 0,
					90, 40, 30,
					80, 30, 0,
					80, 30, 30,
					90, 40, 30,

					// belly front
					90, 40, 0,
					130, 40, 0,
					90, 110, 0,
					130, 40, 0,
					130, 110, 0,
					90, 110, 0,

					// belly back
					90, 40, 30,
					130, 40, 30,
					90, 110, 30,
					130, 40, 30,
					130, 110, 30,
					90, 110, 30,

					// belly bottom
					90, 40, 0,
					90, 110, 0,
					90, 110, 30,
					90, 40, 0,
					90, 40, 30,
					90, 110, 30,

					// belly top
					130, 40, 0,
					130, 110, 0,
					130, 110, 30,
					130, 40, 0,
					130, 40, 30,
					130, 110, 30,

					// bottom curve front
					80, 150, 0,
					130, 110, 0,
					90, 110, 0,
					80, 150, 0,
					80, 120, 0,
					90, 110, 0,

					// bottom curve back
					80, 150, 30,
					130, 110, 30,
					90, 110, 30,
					80, 150, 30,
					80, 120, 30,
					90, 110, 30,

					// bottom curve bottom
					80, 150, 0,
					130, 110, 0,
					130, 110, 30,
					80, 150, 0,
					80, 150, 30,
					130, 110, 30,

					// bottom curve top
					80, 120, 0,
					90, 110, 0,
					90, 110, 30,
					80, 120, 0,
					80, 120, 30,
					90, 110, 30,

					// bottom horizontal front 
					45, 150, 0,
					45, 120, 0,
					80, 120, 0,
					80, 120, 0,
					80, 150, 0,
					45, 150, 0,

					// bottom horizontal back
					45, 150, 30,
					45, 120, 30,
					80, 150, 30,
					80, 150, 30,
					80, 120, 30,
					45, 120, 30,

					// bottom horizontal top
					45, 120, 0,
					80, 120, 0,
					80, 120, 30,
					45, 120, 0,
					80, 120, 30,
					45, 120, 30,

					// bottom horizontal bottom
					45, 150, 0,
					80, 150, 0,
					80, 150, 30,
					45, 150, 0,
					80, 150, 30,
					45, 150, 30,

				]),
				gl.STATIC_DRAW
			);

			break;
		case 2:
			// Fill the buffer with the values that define a letter 'I'.
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array([
					// top rung front
					0, 0, 0,
					0, 30, 0,
					60, 30, 0,
					60, 30, 0,
					60, 0, 0,
					0, 0, 0,

					// middle column front
					15, 30, 0,
					45, 30, 0,
					15, 120, 0,
					15, 120, 0,
					45, 30, 0,
					45, 120, 0,

					// bottom rung front
					0, 120, 0,
					0, 150, 0,
					60, 120, 0,
					60, 120, 0,
					60, 150, 0,
					0, 150, 0,

					// top rung back
					0, 30, 30,
					0, 0, 30,
					60, 30, 30,
					60, 0, 30,
					60, 30, 30,
					0, 0, 30,

					// middle column back
					45, 30, 30,
					15, 30, 30,
					15, 120, 30,
					45, 30, 30,
					15, 120, 30,
					45, 120, 30,

					// bottom rung back
					0, 150, 30,
					0, 120, 30,
					60, 120, 30,
					60, 150, 30,
					60, 120, 30,
					0, 150, 30,

					// top rung top
					0, 0, 0,
					60, 0, 0,
					60, 0, 30,
					0, 0, 0,
					60, 0, 30,
					0, 0, 30,

					// bottom rung top left
					0, 120, 0,
					15, 120, 0,
					15, 120, 30,
					0, 120, 0,
					15, 120, 30,
					0, 120, 30,

					// bottom rung top right
					45, 120, 0,
					60, 120, 0,
					60, 120, 30,
					45, 120, 0,
					60, 120, 30,
					45, 120, 30,

					// top rung bottom left
					15, 30, 0,
					0, 30, 0,
					15, 30, 30,
					15, 30, 30,
					0, 30, 0,
					0, 30, 30,

					// top rung bottom right
					60, 30, 0,
					45, 30, 0,
					60, 30, 30,
					60, 30, 30,
					45, 30, 0,
					45, 30, 30,

					// bottom rung bottom
					60, 150, 0,
					0, 150, 0,
					60, 150, 30,
					60, 150, 30,
					0, 150, 0,
					0, 150, 30,

					// top rung left
					0, 0, 0,
					0, 0, 30,
					0, 30, 30,
					0, 0, 0,
					0, 30, 30,
					0, 30, 0,

					// bottom rung left
					0, 120, 0,
					0, 120, 30,
					0, 150, 30,
					0, 120, 0,
					0, 150, 30,
					0, 150, 0,

					// middle column left
					15, 30, 0,
					15, 30, 30,
					15, 120, 30,
					15, 30, 0,
					15, 120, 30,
					15, 120, 0,

					// top rung right
					60, 0, 30,
					60, 0, 0,
					60, 30, 30,
					60, 30, 30,
					60, 0, 0,
					60, 30, 0,

					// bottom rung right
					60, 120, 30,
					60, 120, 0,
					60, 150, 30,
					60, 150, 30,
					60, 120, 0,
					60, 150, 0,

					// middle column right
					45, 30, 30,
					45, 30, 0,
					45, 120, 30,
					45, 120, 30,
					45, 30, 0,
					45, 120, 0,
				]),
				gl.STATIC_DRAW);

			break;

	}
}