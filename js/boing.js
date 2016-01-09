/*jslint browser: true*/
/*global THREE, requestAnimationFrame*/
"use strict";
// Returns a random integer between min (included) and max (excluded)
// // Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}


//#########################################################################################
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( {  color: 0x000000/* color: 0xffffff*/ } ) );
scene.add( particleLight );
// Lights
scene.add( new THREE.AmbientLight( 0xcccccc ) );
/*var directionalLight = new THREE.DirectionalLight( 0xeeeeee );
  directionalLight.position.x = Math.random() - 0.5;
  directionalLight.position.y = Math.random() - 0.5;
  directionalLight.position.z = Math.random() - 0.5;
  directionalLight.position.normalize();
  scene.add( directionalLight );
*/
var pointLight = new THREE.PointLight( 0xffffff, 4 );
particleLight.add( pointLight );

scene.add( new THREE.AxisHelper(50) ); // frame of reference

var loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = true;

loader.load(
    // resource URL
    'models/boing_centered2.dae',
    // Function when resource is loaded
    function ( collada ) {
        var dae = collada.scene;
        dae.scale.set(3.5,3.5,3.5);
        var box = new THREE.Box3().setFromObject( dae ); // compute the bounding box of the model

        dae.name = "boingball";

        box.center( dae.position ); // set dae.position to be the center of the bounding box
        dae.position.set(50,50,100);//x,z,y- if you think in blender dimensions ;

        Object.defineProperty(dae, 'mydx', {
            enumerable: false,
            configurable: false,
            writable: true,
            value: 0.5
        });
        Object.defineProperty(dae, 'mydy', {
            enumerable: false,
            configurable: false,
            writable: true,
            value: 0.5
        });
        Object.defineProperty(dae, 'mydz', {
            enumerable: false,
            configurable: false,
            writable: true,
            value: 0.1
        });
        Object.defineProperty(dae, 'myBounds', {
            enumerable: false,
            configurable: false,
            writable: true,
            value: box
        });

        scene.add( collada.scene );
    },
    // Function called when download progresses
    function ( xhr ) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    }
);

camera.position.x = 0;//window.innerWidth / 32;
camera.position.y = 0;//window.innerHeight / 32;
camera.position.z = 200;
camera.lookAt(0,0,0);

var vFOV = camera.fov * Math.PI / 180;        // convert vertical fov to radians
var myaspect = window.innerWidth / window.innerHeight;

var render = function () {
    var boing = scene.getObjectByName("boingball");
    var myheight = 2 * Math.tan( vFOV / 2 ) * (camera.position.z); // visible height
    var mywidth = myheight * myaspect;                  // visible width
    requestAnimationFrame( render );

    if(boing === undefined) {
        return;
    }

    myheight = 2 * Math.tan( vFOV / 2 ) * (camera.position.z - boing.position.z); // visible height
    mywidth = myheight * myaspect;                  // visible width

    boing.rotation.x += 0.05;
    boing.rotation.y += 0.01;

    boing.position.x += boing.mydx;
    boing.position.y += boing.mydy;
    //boing.position.z += boing.mydz;

    if(boing.position.z >= 100 || boing.position.z < 1){
        boing.mydz = -boing.mydz;
    }

    if((Math.floor(boing.position.x + (boing.myBounds.max.x - boing.myBounds.min.x)) >=  Math.floor(mywidth/2)) ||
       (Math.floor(boing.position.x - (boing.myBounds.max.x - boing.myBounds.min.x)) < -Math.floor(mywidth/2))){
        boing.mydx = -boing.mydx;
    }

    if(Math.floor(boing.position.y + (boing.myBounds.max.y - boing.myBounds.min.y)) >= Math.floor(myheight/2) ||
       Math.floor(boing.position.y- (boing.myBounds.max.y - boing.myBounds.min.y)) < -Math.floor(myheight/2)){
        boing.mydy = -boing.mydy;
    }


      //if(Math.round(boing.position.y) % 10 === 0){
      //  console.log("x",boing.position.x, (boing.myBounds.max.x - boing.myBounds.min.x), mywidth);
      //  console.log("y",boing.position.y, (boing.myBounds.max.y - boing.myBounds.min.y), myheight);
      //}


    renderer.render(scene, camera);
};

render();
