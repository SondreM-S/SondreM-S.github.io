width = 1000
height = 1000
require('jsdom-global')()
var gl = require('gl')(width, height); //headless-gl
path = 'out2.png'
 
PNG = require('pngjs').PNG
fs = require('fs')
png = new PNG({
  width: width,
  height: height
})
 
var BABYLON = require("babylonjs");
 
var engine = new BABYLON.Engine(gl, true, {
  disableWebGL2Support: true
});
var scene = new BABYLON.Scene(engine);
var box = BABYLON.MeshBuilder.CreateBox('box', {
  size: 1,
  faceColor: BABYLON.Color3.Red()
}, scene)
var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 180 * 20, Math.PI / 180 * 70, 5, BABYLON.Vector3.Zero(), scene);
var ground = BABYLON.Mesh.CreateGround('ground', 10, 10, 20, this.scene);
var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
light2.diffuse = new BABYLON.Color3(0,1,1)
// This is where you create and manipulate meshes
fs.exists('grass-old.jpg', (exists) => {
  if (exists) {
    console.log('grass-old.jpg exists')
  } else {
    console.log('grass-old.jpg exists')
  }
})
console.log("Importing test mesh")
// Test import
const files = fs.readdirSync("./Models/")
console.log(files)
try{
BABYLON.SceneLoader.ImportMesh("","https://raw.githubusercontent.com/SondreM-S/Test-Page/main/","test_chair.babylon",
    scene,
    function(newMeshes){
      console.log("Inside importing mesh function")

    });
console.log("Completed test import")

}catch(err){
    console.log("Test import error found: "+err)
}

 
var texture = new BABYLON.Texture('grass-old.jpg', scene)
ground.diffuseTexture = texture
console.log(texture.isBlocking)
console.log(texture.isReadyOrNotBlocking())
console.log(texture.isReady())
 
scene.onAfterRenderObservable.add(() => {
  // create a pixel buffer of the correct size
  pixels = new Uint8Array(4 * width * height)
 
  // read back in the pixel buffer
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
 
  // lines are vertically flipped in the FBO / need to unflip them
  var i, j
  for (j = 0; j <= height; j++) {
    for (i = 0; i <= width; i++) {
      k = j * width + i
      r = pixels[4 * k]
      g = pixels[4 * k + 1]
      b = pixels[4 * k + 2]
      a = pixels[4 * k + 3]
 
      m = (height - j + 1) * width + i
      png.data[4 * m] = r
      png.data[4 * m + 1] = g
      png.data[4 * m + 2] = b
      png.data[4 * m + 3] = a
    }
  }
  // Now write the png to disk
  stream = fs.createWriteStream(path)
  png.pack().pipe(stream)
})
 
scene.render()