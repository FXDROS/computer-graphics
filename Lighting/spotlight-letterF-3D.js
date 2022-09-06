"use strict";

var canvas;
var gl;

var primitiveType;
var offset = 0;
var count = 44 * 6;


var angleCam = 0;
var angleFOV = 60;
var fRotationRadians = 0;

var matrix;

var translationMatrix;
var rotationMatrix;
var scaleMatrix;
var projectionMatrix;
var cameraMatrix;
var viewMatrix;
var viewProjectionMatrix;

var worldViewProjectionMatrix;
var worldInverseTransposeMatrix;
var worldInverseMatrix;
var worldMatrix;

var FOV_Radians; //field of view
var aspect; //projection aspect ratio
var zNear; //near view volume
var zFar;  //far view volume

var cameraPosition = [100, 150, 200]; //eye/camera coordinates
var UpVector = [0, 1, 0]; //up vector
var fPosition = [0, 35, 0]; //at 


var worldViewProjectionLocation;
var worldInverseTransposeLocation;
var colorLocation;
var lightWorldPositionLocation;
var worldLocation;
var shininessLocation;
var viewWorldPositionLocation;
var lightColorLocation;
var specularColorLocation;
var lightDirectionLocation;
var innerLimitLocation;
var outerLimitLocation;


var lightRotationX = 0;
var lightRotationY = 0;
var lightDirection = [0, 0, 1];
var lightPosition;
var innerLimit = 10;
var outerLimit = 20;
var shininess = 150;

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //  Configure WebGL

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);


    gl.enable(gl.CULL_FACE); //enable depth buffer
    gl.enable(gl.DEPTH_TEST);

    //initial default

    fRotationRadians = degToRad(0);
    FOV_Radians = degToRad(60);
    aspect = canvas.width / canvas.height;
    zNear = 1;
    zFar = 2000;

    innerLimit = degToRad(10);
    outerLimit = degToRad(20);

    projectionMatrix = m4.perspective(FOV_Radians, aspect, zNear, zFar); //setup perspective viewing volume

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
    worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
    colorLocation = gl.getUniformLocation(program, "u_color");
    lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
    worldLocation = gl.getUniformLocation(program, "u_world");
    shininessLocation = gl.getUniformLocation(program, "u_shininess");
    viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
    worldLocation = gl.getUniformLocation(program, "u_world");
    lightColorLocation = gl.getUniformLocation(program, "u_lightColor");
    specularColorLocation = gl.getUniformLocation(program, "u_specularColor");
    lightDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
    innerLimitLocation = gl.getUniformLocation(program, "u_innerLimit");
    outerLimitLocation = gl.getUniformLocation(program, "u_outerLimit");


    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var positionLocation = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);


    setGeometry(gl);


    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    // Associate out shader variables with our data buffer

    var normalLocation = gl.getAttribLocation(program, "a_normal");
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLocation);

    setNormals(gl);

    //update FOV
    var angleCamValue = document.getElementById("Cameravalue");
    angleCamValue.innerHTML = angleCam;
    document.getElementById("sliderCam").onchange = function (event) {
        angleCamValue.innerHTML = event.target.value;
        fRotationRadians = degToRad(event.target.value);
        render();
    };

    var rotateXValue = document.getElementById("XRotationvalue");
    rotateXValue.innerHTML = lightRotationX;
    document.getElementById("sliderXRotation").onchange = function (event) {
        rotateXValue.innerHTML = event.target.value;
        lightRotationX = event.target.value;
        render();
    };

    var rotateYValue = document.getElementById("YRotationvalue");
    rotateYValue.innerHTML = lightRotationY;
    document.getElementById("sliderYRotation").onchange = function (event) {
        rotateYValue.innerHTML = event.target.value;
        lightRotationY = event.target.value;
        render();
    };

    var innerValue = document.getElementById("Innervalue");
    innerValue.innerHTML = radToDeg(innerLimit);
    document.getElementById("sliderInner").onchange = function (event) {
        innerValue.innerHTML = event.target.value;
        innerLimit = radToDeg(event.target.value);
        render();
    };

    var outerValue = document.getElementById("Outervalue");
    outerValue.innerHTML = radToDeg(outerLimit);
    document.getElementById("sliderOuter").onchange = function (event) {
        outerValue.innerHTML = event.target.value;
        outerLimit = radToDeg(event.target.value);
        render();
    };

    primitiveType = gl.TRIANGLES;
    render(); //default render
}

function render() {
    // Compute the camera's matrix using look at.
    cameraMatrix = m4.lookAt(cameraPosition, fPosition, UpVector);

    // Make a view matrix from the camera matrix
    viewMatrix = m4.inverse(cameraMatrix);

    // Compute a view projection matrix
    viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    worldMatrix = m4.yRotation(fRotationRadians);

    // Multiply the matrices.
    worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    worldInverseMatrix = m4.inverse(worldMatrix);
    worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    // Set the matrices
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

    // Set the color to use
    gl.uniform4fv(colorLocation, [0, 0.87, 1, 1]); // blue

    // set the light position.
    lightPosition = [40, 60, 120];
    gl.uniform3fv(lightWorldPositionLocation, lightPosition);

    // set the camera/view position
    gl.uniform3fv(viewWorldPositionLocation, cameraPosition);

    // set the shininess
    gl.uniform1f(shininessLocation, shininess);

    // set the spotlight uniforms

    // since we don't have a plane like most spotlight examples
    // let's point the spot light at the F
    {
        var lmat = m4.lookAt(lightPosition, fPosition, UpVector);
        lmat = m4.multiply(m4.xRotation(lightRotationX), lmat);
        lmat = m4.multiply(m4.yRotation(lightRotationY), lmat);
        // get the zAxis from the matrix
        // negate it because lookAt looks down the -Z axis
        lightDirection = [-lmat[8], -lmat[9], -lmat[10]];
    }

    gl.uniform3fv(lightDirectionLocation, lightDirection);
    gl.uniform1f(innerLimitLocation, Math.cos(innerLimit));
    gl.uniform1f(outerLimitLocation, Math.cos(outerLimit));

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(primitiveType, offset, count);

}

function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}


// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
    var positions =
        new Float32Array([
            // D letter

            // middle column front
            70, 0, 0,
            70, 150, 0,
            100, 0, 0,
            70, 150, 0,
            100, 150, 0,
            100, 0, 0,

            // top rung top
            70, 0, 0,
            100, 0, 0,
            100, 0, 30,
            70, 0, 0,
            100, 0, 30,
            70, 0, 30,

            // middle column left
            70, 0, 0,
            70, 0, 30,
            70, 150, 30,
            70, 0, 0,
            70, 150, 30,
            70, 150, 0,

            // middle column back
            70, 0, 30,
            100, 0, 30,
            70, 150, 30,
            70, 150, 30,
            100, 0, 30,
            100, 150, 30,

            // top rung bottom
            70, 150, 0,
            100, 150, 0,
            100, 150, 30,
            70, 150, 0,
            100, 150, 30,
            70, 150, 30,

            // middle column right
            100, 0, 30,
            100, 0, 0,
            100, 150, 30,
            100, 150, 30,
            100, 0, 0,
            100, 150, 0,

            // bottom horizontal front 
            100, 120, 0,
            100, 150, 0,
            135, 120, 0,
            100, 150, 0,
            135, 150, 0,
            135, 120, 0,

            // bottom horizontal top
            100, 120, 0,
            135, 120, 0,
            135, 120, 30,
            100, 120, 0,
            135, 120, 30,
            100, 120, 30,

            // bottom horizontal back
            100, 150, 30,
            100, 120, 30,
            135, 150, 30,
            100, 120, 30,
            135, 120, 30,
            135, 150, 30,

            // bottom horizontal bottom
            100, 150, 0,
            135, 150, 0,
            135, 150, 30,
            100, 150, 0,
            135, 150, 30,
            100, 150, 30,

            // bottom curve front
            135, 120, 0,
            135, 150, 0,
            145, 110, 0,
            135, 150, 0,
            185, 110, 0,
            145, 110, 0,

            // bottom curve top
            135, 120, 0,
            145, 110, 0,
            135, 120, 30,
            145, 110, 0,
            145, 110, 30,
            135, 120, 30,

            // bottom curve back
            135, 150, 30,
            135, 120, 30,
            185, 110, 30,
            135, 120, 30,
            145, 110, 30,
            185, 110, 30,

            // bottom curve bottom
            185, 110, 0,
            135, 150, 0,
            185, 110, 30,
            135, 150, 0,
            185, 110, 30,
            135, 150, 30,

            // belly back
            185, 110, 30,
            145, 110, 30,
            145, 40, 30,
            185, 110, 30,
            145, 40, 30,
            185, 40, 30,

            // belly bottom
            145, 40, 0,
            145, 40, 30,
            145, 110, 0,
            145, 40, 30,
            145, 110, 30,
            145, 110, 0,

            // belly front
            145, 40, 0,
            145, 110, 0,
            185, 40, 0,
            145, 110, 0,
            185, 110, 0,
            185, 40, 0,

            // belly top
            185, 40, 30,
            185, 40, 0,
            185, 110, 30,
            185, 40, 0,
            185, 110, 0,
            185, 110, 30,

            // top curve top
            135, 0, 0,
            185, 40, 0,
            185, 40, 30,
            135, 0, 0,
            185, 40, 30,
            135, 0, 30,

            // top curve front
            135, 0, 0,
            135, 30, 0,
            185, 40, 0,
            135, 30, 0,
            145, 40, 0,
            185, 40, 0,

            // top curve bottom
            145, 40, 0,
            135, 30, 0,
            135, 30, 30,
            145, 40, 0,
            135, 30, 30,
            145, 40, 30,


            // top curve back
            135, 30, 30,
            135, 0, 30,
            185, 40, 30,
            135, 30, 30,
            185, 40, 30,
            145, 40, 30,

            // top horizontal bottom
            100, 30, 0,
            135, 30, 0,
            135, 30, 30,
            100, 30, 0,
            135, 30, 30,
            100, 30, 30,

            // top horizontal front
            100, 0, 0,
            100, 30, 0,
            135, 0, 0,
            100, 30, 0,
            135, 30, 0,
            135, 0, 0,

            // top horizontal top
            100, 0, 0,
            135, 0, 0,
            135, 0, 30,
            100, 0, 0,
            135, 0, 30,
            100, 0, 30,

            // top horizontal back
            70, 30, 30,
            70, 0, 30,
            135, 0, 30,
            70, 30, 30,
            135, 0, 30,
            135, 30, 30,


            // I letter
            // top rung front
            0, 0, 0,
            0, 30, 0,
            60, 30, 0,
            60, 30, 0,
            60, 0, 0,
            0, 0, 0,

            // middle column front
            45, 30, 0,
            15, 30, 0,
            15, 120, 0,
            15, 120, 0,
            45, 120, 0,
            45, 30, 0,

            // bottom rung front
            0, 120, 0,
            0, 150, 0,
            60, 120, 0,
            60, 120, 0,
            0, 150, 0,
            60, 150, 0,

            // top rung back
            0, 30, 30,
            0, 0, 30,
            60, 30, 30,
            60, 0, 30,
            60, 30, 30,
            0, 0, 30,

            // middle column back
            15, 30, 30,
            45, 30, 30,
            15, 120, 30,
            45, 30, 30,
            45, 120, 30,
            15, 120, 30,

            // bottom rung back
            0, 150, 30,
            0, 120, 30,
            60, 120, 30,
            60, 150, 30,
            0, 150, 30,
            60, 120, 30,

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
        ]);

    // Center the F around the origin and Flip it around. We do this because
    // we're in 3D now with and +Y is up where as before when we started with 2D
    // we had +Y as down.

    // We could do by changing all the values above 
    // We could also do it with a matrix at draw time but you should
    // never do stuff at draw time if you can do it at init time.
    var matrix = m4.xRotation(Math.PI),
        matrix = m4.translate(matrix, -50, -75, -15);

    for (var ii = 0; ii < positions.length; ii += 3) {
        var vector = m4.transformPoint(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
        positions[ii + 0] = vector[0];
        positions[ii + 1] = vector[1];
        positions[ii + 2] = vector[2];
    }
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function setNormals(gl) {
    var normals = new Float32Array([
        // D letter

        // middle column front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // top rung top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // middle column left
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        // middle column back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top rung bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // middle column right
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom horizontal front 
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // bottom horizontal top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // bottom horizontal back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // bottom horizontal bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // bottom curve front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // bottom curve top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // bottom curve back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // bottom curve bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // belly back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // belly bottom
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        // belly front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // belly top
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // top curve top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // top curve front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // top curve bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // top curve back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top horizontal bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // top horizontal front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // top horizontal top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // top horizontal back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // I letter
        // top rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // middle column front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // bottom rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // top rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // middle column back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // bottom rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top rung top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // bottom rung top left
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // bottom rung top right
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // top rung bottom left
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // top rung bottom right
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // bottom rung bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // top rung left
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        // bottom rung left
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        // middle column left
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        // top rung right
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom rung right
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // middle column right
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,]);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}
