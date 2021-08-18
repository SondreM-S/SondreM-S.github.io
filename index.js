const puppeteer = require("puppeteer"); // Create puppeteer variable for handling puppeteer control
const express = require("express");
const app = express()
const port = 21030 // port for running the express server (?) 
const fs = require("fs") // Used for reading the files in directory
var BABYLON = require("babylonjs");
const cors = require("cors");
width = 400
height = 400

// require('jsdom-global')()
// var gl = require("gl")(1000, 1000, { preserveDrawingBuffer: true });
// PNG = require('pngjs').PNG
// png = new PNG({
//   width: width,
//   height: height
// })
// path = 'out3.png'

function resolve(data){
    console.log(data)
}
const arguments = process.argv;
console.log(arguments)

app.use(cors())


app.get('/getDigi', function(req, res) {
    
    // Launching the Puppeteer controlled headless browser and navigate to the Digimon website
    puppeteer.launch().then(async function(browser) {
        const page = await browser.newPage();
        await page.goto('http://digidb.io/digimon-list/');
        
        // Targeting the DOM Nodes that contain the Digimon names
        const digimonNames = await page.$$eval('#digiList tbody tr td:nth-child(2) a', function(digimons) {
            // Mapping each Digimon name to an array
            return digimons.map(function(digimon) {
                return digimon.innerText;
            });
        });
        
        // Closing the Puppeteer controlled headless browser
        await browser.close();
        
        // Sending the Digimon names to Postman
        res.send(digimonNames);
    });
});

app.get("/", (req, res) => {
    console.log("puppeteer api, runPup for rendering");
})

// app.post

app.post('/runPup', function(req, res) {
    
    // Launching the Puppeteer controlled headless browser
    puppeteer.launch().then(async function(browser, req, res) {
        (async (req, res) => {
            console.log("req is found as: "+req)
            console.log("res is found as: "+res)
            // // Don't disable the gpu
            let args = puppeteer.defaultArgs().filter(arg => arg !== '--disable-gpu');
            // // Run in non-headless mode
            args = args.filter(arg => arg !== '--headless'); // Makes the engine NOT headless, comment out to make headless
            // // Use desktop graphics
            args.push("--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--enable-oop-rasterization", "--flag-switches-begin", "--ignore-gpu-blocklist", "--flag-switches-end", "--origin-trial-disabled-features=SecurePaymentConfirmation")
            
            const browser = await puppeteer.launch({headless: false, ignoreDefaultArgs: false, args}) // Launch the chromium browser
            const page = await browser.newPage();
            await page.setViewport({ width: 3000, height: 3000, deviceScaleFactor: 1})
            await page.goto("http://127.0.0.1:21025/index2.html") // Goto the puppeteer screenshot page
            
            console.log("Awaiting model completion");
            await page.exposeFunction('screenshot', async (e) => { // Function called when scene is ready
                // Captures a screenshot and rotates the model
                console.log("Starting renders")
                
                // Make loop for running through all fabrics in model
                const fabrics = fs.readdirSync("./models/Materials/Fabrics/")
                console.log("Name: ")
                const model = await page.evaluate(() => { // Fetch name of current model for use in naming of .png
                  return getModelName().split(".")[0];
                });
        
                const start = Date.now()
                for (const file in fabrics) { // Fabrics in fabrics folder
                  fabric = fabrics[file]; 
                  // set the new file on all fabrics (name of folder)
                  await page.evaluate((fabric) => {
                    changeMaterial(`./models/Materials/Fabrics/${fabric}`);
                  }, fabric)
                  await page.screenshot({ path: `./Screenshots/test_${model}_${fabric}.png`, omitBackground: true})
                }
        
                await page.evaluate(
                  "BABYLON.Engine.LastCreatedScene.activeCamera.alpha = -1.4;"
                  );

                await page.evaluate(() => { // Run JS code in brackets
                BABYLON.Engine.LastCreatedScene.activeCamera.alpha = -1.0;
                });
        
                const stop = Date.now()
                const time = (stop - start)/1000 // ms to s
                console.log(`The headless run used ${time}s to complete. With 6 images that's ${time / 6}s per image.`)
                await browser.close().then(console.log("Completed puppeteer script"));
            });
            

            const dimensions = await page.evaluate(() => {
                return {
                  width: document.documentElement.clientWidth,
                  height: document.documentElement.clientHeight,
                  deviceScaleFactor: window.devicePixelRatio,
                };
            });

            function delay(time) {
                return new Promise(function(resolve) { 
                    setTimeout(resolve, time)
                });
            }
        })() // End of the puppeteer async function
    });
});

// Making Express listen on port 7000
app.listen(21030, function() {
  console.log('Running on port 21030.');
});

app.get("/testGL", (req, res) => { // Run entire page setup using gl plugin (Abandoned as this too failed to enable GPU usage)
    console.log("Testing the headless-gl rendering method");
     
    var engine = new BABYLON.Engine(gl, true, {
      disableWebGL2Support: true
    });
    const createScene = function () {
        const scene = new BABYLON.Scene(engine); // Scene = level/world/scene using set up "engine"
        engine.enableOfflineSupport = false; // For 3D models, disables offline file errors
        scene.clearColor = new BABYLON.Color4(0,0,0,0); //Draws the background as white before everything else
        
        let modelName = "";
        let meshCollect = []; // List of mesh components
        let toggleGroups = []; // List of list with hideable components

        // Orbiting camera
        const camera = new BABYLON.ArcRotateCamera("arcCamera", 
            BABYLON.Tools.ToRadians(-120), // Alpha rotation
            BABYLON.Tools.ToRadians(60), // Beta rotation
            3.0,  // Radius from rotation entity
            new BABYLON.Vector3(0, 0.5, 0), // Entity to orbit
            scene) // Sets up a orbiting camera 
        camera.lowerRadiusLimit = 2;
        // camera.position = new BABYLON.Vector3(-1.18183, 1.3636, -2.02970); // Point the camera to the model (not scaled automatically)
        camera.wheelPrecision = 50; // Increases the precision of the scrolling zoom
        // camera.wheelDeltaPercentage = true;

        // camera.attachControl(canvas, true); // Allows camera input in game loop

        const lightPos = new BABYLON.Vector3(5, 2, -2)
        const lightState = 2; // State mangager for setting lights

        // Generate lights
        const light = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), scene); // Ambien light (above)

        light.intensity = 0.7; // Ambient light
        light.setEnabled(true);
        //var shadowGenerator4 = new BABYLON.ShadowGenerator(2048*2, light);
        //shadowGenerator4.useCloseExponentialShadowMap = true;

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        this.changeMaterial = function(img){ // Gerneralised funciton for changing material
            meshColl = this.getMeshCollect;
            return new Promise((resolve, reject) => {
                const mat = new BABYLON.PBRMaterial("pbr", scene); // Set default materialtype in case default material does not work (.dwg source)
                const texture = new BABYLON.Texture(img, scene, false, false, 10, function() {
                    // mat.bumpTexture = newMat;
                    mat.albedoTexture = texture; // Apply texture
                    mat.albedoTexture.uScale = 1; // Scale texture
                    mat.albedoTexture.vScake = 1; // Scale texture
                    mat.metallic = 0.1; // Set metallic reflection
                    mat.roughness = 1; // Set roughness for ammount of reflection
        
                    meshCollect.filter(checkNull).forEach(function(mesh){ // Function for going over each part of the model (Checknull removes null components)
                        if (mesh.name != null){ // If mesh has name        
        
                            // Reads the name of each part and changes the material if a fabric is found
                            if(mesh.name.split("_")[1] == "Metal"){
                                // Metal found, add shiny metal effect, else remove all shine
                            }else if(mesh.name.split("_")[1] == "Fabric"){
                                // Fabric found
                                mesh.material = mat; // Apply material to mesh
                            }
                            else{ //Anything but fabrics and metals
                                try{
                                    // Do nothing
                                }catch(err){
                                    reject("Error in material set: \n"+err)
                                }
                            }
                        }
                    })
                }); // texture loaded and texture function has completed
                resolve()
            })
        }

        this.toggleComponent = function(meshGroup) { // Toggle the given meshGroup (component) generating buttons automatically
            meshGroup.filter(checkNull).forEach(function(mesh){
                mesh.setEnabled(mesh.isEnabled() ? false : true); 
            })
        };

        this.takeScreenshot = function(){ // Take screenshot of current babylonjs canvas view and make .jpg to download
            BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera,
                {width: 5000, height: 5000, precision: 1}, // Size of image
                undefined, // SuccessCalback
                'image/png', // MimeType
                8, // Samples
                false, // AntiAliasing
                'Screenshot.png' // Filename and type
                )
        }
 
        this.exportModel = function(){ // Export and download current mesh
            meshCollect.shift()
            // console.log(meshCollect);
            const meshes = meshCollect.slice(31, 100);
            console.log(meshes);    
            // var obj = BABYLON.OBJExport.OBJ(box, false, "", true);

            // console.log(obj);
            // const obj = BABYLON.OBJExport.OBJ(meshes, false, "", true);
            // const mtl = OBJExport.MTL(array_Meshes)

            // const names = ['object.obj', 'material.mtl']
            // const blobs = [new Blob([obj], { type: 'octet/stream' }), new Blob([mtl], { type: 'octet/stream' })]
            // downloadBlob(BABYLON.GLTF2Export.GLTFAsync(meshes, "objExport.obj"));
            // BABYLON.GLTF2Export.GLTFAsync(scene, "gltfExport.gltf");
            // gltf.downloadFiles();

            // Initializer code...
            BABYLON.GLTF2Export.GLBAsync(scene, "fileName").then((glb) => {
                glb.downloadFiles();
            });
        }

        function checkNull(mesh) {
            return mesh.material != null;
        }

        // Function to download data to a file
        this.downloadBlob = function(blob, fileName) {
            let link = document.createElement('a');
            document.body.appendChild(link);
            link.setAttribute("type", "hidden");
            link.download = fileName;
            let mimeType = { type: "text/plain" };
        
            link.href = window.URL.createObjectURL(new Blob([blob], mimeType));
            link.click();
        }


        this.cleanScene = function(){ // Function for removing all elements of a scene (All meshes in meshCollect)
            meshCollect.forEach(function(mesh){ // Every mesh in meshCollect
                mesh.dispose();
                mesh = null; // Get garbage collector to pick up the mesh 
            })
        }

        this.loadModel = function(model){
            // Remove old mesh in model
            cleanScene();

            BABYLON.SceneLoader.ImportMesh("","Models/", 
            model,
            scene,
            function(newMeshes){ // newMeshes is an array of all submeshes

                modelName = model
                toggleGroups = [];
                newMeshes.filter(checkNull).forEach(function(mesh){
                    // For every component(mesh) in model
                    mesh.receiveShadows = true; // Allow mesh to have shadows
                    
                    if (mesh.material.name != null){                   
                        // Reads the name of each part and changes the material if a fabric is found
                        if(mesh.name.split("_")[1] == "Metal"){
                            // Metal found, add shiny metal effect, else remove all shine
                            mesh.material.metallic = 5;
                            // mesh.material.ref
                            mesh.material.roughness = 0.4;
                        }else if(mesh.name.split("_")[1] == "Fabric"){
                            // Fabric found
                            mesh.material.metallic = 0.1;
                            mesh.material.roughness = 1;
                        }
                        else{
                            try{
                                mesh.material.metallic = null;
                                mesh.material.roughness = 0.5;
                            }catch(err){
                                console.log("Error in material set: \n"+err)
                            }
                        }
                    }
    
                    // Generate buttons for toggling visibility of components based on group names
                    // Add component totoggleable list list
                    toggleable = mesh.name.split("_")[2].split(".")[0];
                    if (toggleable=="True"){
                        // Either create list to append to toggleGroup list or append to existing list
                        gName = mesh.name.split("_")[0]; //Group (component) name, eg. Armrest, tablePlate etc...
                        // Check first component of all list in toggleGroups, if no match is found, create new list and append to toggleGroups
                        let found = 0; // Boolean to see if mesh group already added or not
                        toggleGroups.forEach(function(meshGroup){
                            // For each meshGroup, check first element name and compare with mesh element name
                            listGName = meshGroup[0].name.split("_")[0]; // First element name
                            if (listGName == gName){
                                found = 1; // Match found
                                meshGroup.push(mesh);
                            }
                        })
                        if (found == 0){ // No group found
                            tempArr = [];
                            tempArr.push(mesh);
                            toggleGroups.push(tempArr);
                        }
                    }else if(toggleable=="False"){
                        // Component not toggleable, do nothing
                    }else{
                        // Found error in Sketchup export, no visibility toggle found
                    }
                })
            })
        }
    
        this.removeAllChildNodes = function (parent){
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
        }
        
        this.getModelName = () => modelName;
        
        this.getMeshCollect = () => meshCollect;
        
        // Load in 3D model (name, folder, .babylon file,)
        // BABYLON.SceneLoader.ImportMesh("","Models/","EkornesSofa.babylon.json",
        // BABYLON.SceneLoader.ImportMesh("","Models/","EkornesSofa2-1.babylon.json",
        console.log("Importing test mesh")
        // Test import
        const files = fs.readdirSync("./Models/")
        console.log(files)
        try{
        BABYLON.SceneLoader.ImportMesh("","https://raw.githubusercontent.com/SondreM-S/Test-Page/main/","test_chair.babylon",
            scene,
            function(newMeshes) {console.log("in test import")
        });
        console.log("Completed test import")
        
        }catch(err){
            console.log("Test import error found: "+err)
        }


        console.log("Importing mesh")
        try{
            BABYLON.SceneLoader.ImportMesh("","https://raw.githubusercontent.com/SondreM-S/Test-Page/main/","test_chair.babylon",
            scene,
            function(newMeshes) { // newMeshes is an array of all submeshes
                console.log("Inside importing mesh function")
                toggleGroups = [];
                meshCollect = newMeshes;
                modelName = "Kinnarps_lowback (2).babylon";
                newMeshes.filter(checkNull).forEach(function(mesh){
                    // For every component(mesh) in model
                    // add components into array, this allows one to create a new mesh with the complete chair (for shadows, it is not ideal for manipulation)
                    //subCSG.push(BABYLON.CSG.FromMesh(mesh)); // Add to CSG array to be combined after loop
                    mesh.receiveShadows = true;
                    
                    if (mesh.material.name != null){                   
                        // Reads the name of each part and changes the material if a fabric is found
                        if(mesh.name.split("_")[1] == "Metal"){
                            // Metal found, add shiny metal effect, else remove all shine
                            mesh.material.metallic = 5;
                            // mesh.material.ref
                            mesh.material.roughness = 0.4;
                        }else if(mesh.name.split("_")[1] == "Fabric"){
                            // Fabric found
                            mesh.material.metallic = 0.1;
                            mesh.material.roughness = 1;
                        }
                        else{
                            try{
                                mesh.material.metallic = null;
                                mesh.material.roughness = 0.5;
                            }catch(err){
                                console.log("Error in material set: \n"+err)
                            }
                        }
                    }
                    
                    // Generate buttons for toggling visibility of components based on group names
                    // Add component totoggleable list list
                    toggleable = mesh.name.split("_")[2].split(".")[0];
                    if (toggleable=="True"){
                        // Either create list to append to toggleGroup list or append to existing list
                        gName = mesh.name.split("_")[0]; //Group (component) name, eg. Armrest, tablePlate etc...
                        // Check first component of all list in toggleGroups, if no match is found, create new list and append to toggleGroups
                        let found = 0; // Boolean to see if mesh group already added or not
                        toggleGroups.forEach(function(meshGroup){
                            // For each meshGroup, check first element name and compare with mesh element name
                            listGName = meshGroup[0].name.split("_")[0]; // First element name
                            if (listGName == gName){
                                found = 1; // Match found
                                meshGroup.push(mesh);
                            }
                        })
                        if (found == 0){ // No group found
                            tempArr = [];
                            tempArr.push(mesh);
                            toggleGroups.push(tempArr);
                        }
                    }else if(toggleable=="False"){
                        // Component not toggleable, do nothing
                    }else{
                        // Found error in Sketchup export, no visibility toggle found
                    }
                })
                console.log("passed createMesh")
            });

        }catch(err){
            console.log("Error in createMesh: \n"+err)
        }
        console.log("Returning scene")

        return scene;
    }
    const scene = createScene();
    const width = 400;
    const height = 400;
    const png = new PNG({
        width: width,
        height: height
      })

      scene.executeWhenReady(function () {
          engine.runRenderLoop(function () {
              scene.render();
            });
            console.log("Taking screenshot")
            
            takeScreenshot(); // Calls the screenshot funciton from the index.js file
        });
         firstbool = true
        // Create gameloop
        engine.runRenderLoop(function(){
            //var subMesh = scene.getMeshByName("Modelz")
            //console.log(subMesh);
            scene.render(); // Render the visible image (last step in loop)
            if (firstbool) {
                firstbool = false
                // create a pixel buffer of the correct size
                console.log("After Render, running png")
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
            }
    }); // Babylon runs loop at 60fps by default (if possible)


    ////////////////////////////////////////////////////////////////////////////////
})

// (async () => {

//     // // Don't disable the gpu
//     let args = puppeteer.defaultArgs().filter(arg => arg !== '--disable-gpu');
//     // // Run in non-headless mode
//     args = args.filter(arg => arg !== '--headless'); // Makes the engine NOT headless, comment out to make headless
//     // // Use desktop graphics
//     args.push("--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--enable-oop-rasterization", "--flag-switches-begin", "--ignore-gpu-blocklist", "--flag-switches-end", "--origin-trial-disabled-features=SecurePaymentConfirmation")

//     const browser = await puppeteer.launch({headless: true, ignoreDefaultArgs: true, args}) // Launch the chromium browser
//     const page = await browser.newPage();
//     await page.setViewport({ width: 3000, height: 3000, deviceScaleFactor: 1})
    
//     console.log("Awaiting model completion");
//     await page.exposeFunction('screenshot', async (e) => { // Function called when scene is ready
//         // Captures a screenshot and rotates the model
//         console.log("Starting renders")
        
//         // Make loop for running through all fabrics in model
//         const fabrics = fs.readdirSync("./models/Materials/Fabrics/")
//         console.log("Name: ")
//         const model = await page.evaluate(() => { // Fetch name of current model for use in naming of .png
//           return getModelName().split(".")[0];
//         });

//         const start = Date.now()
//         for (const file in fabrics) { // Fabrics in fabrics folder
//           fabric = fabrics[file]; 
//           // set the new file on all fabrics (name of folder)
//           await page.evaluate((fabric) => {
//             changeMaterial(`./models/Materials/Fabrics/${fabric}`);
//           }, fabric)
//           await page.screenshot({ path: `./headless/screenshots/test_${model}_${fabric}.png`, omitBackground: true})
//         }

//         await page.evaluate(
//           "BABYLON.Engine.LastCreatedScene.activeCamera.alpha = -1.4;"
//           );
//           await page.evaluate(() => { // Run JS code in brackets
//             BABYLON.Engine.LastCreatedScene.activeCamera.alpha = -1.0;
//           });

//         const stop = Date.now()
//         const time = (stop - start)/1000 // ms to s
//         console.log(`The headless run used ${time}s to complete. With 6 images that's ${time / 6}s per image.`)
//         // await browser.close();
//     });
    
//     await page.goto("http://127.0.0.1:21025/index2.html")
    
//     const dimensions = await page.evaluate(() => {
//         return {
//           width: document.documentElement.clientWidth,
//           height: document.documentElement.clientHeight,
//           deviceScaleFactor: window.devicePixelRatio,
//         };
//     });

//       // await page.waitForNavigation({ waitUntil: 'networkidle2'});
    
//     // await Promise.all([
//       //     page._frameManager._mainFrame.waitForNavigation({timeout: 50000}),        
//       // ]);
//     function delay(time) {
//         return new Promise(function(resolve) { 
//             setTimeout(resolve, time)
//         });
//     }

      
//     await page.evaluate(() => {
//         // screenshotPromise.then(function(data) {
//           //     console.log(data);
//           //   });
//         let dcopy;
//           // takeScreenshot(data => {
//             //     resolve(data);
//             //     dcopy = data;
//             // })
//             // console.log(dcopy);
//     });
// })()

        
        // Code attempt to make Babylonjs make a render instead of grabbing a screenshot
      //###############################################################################
      //  await delay(1000);
      //###############################################################################
      // const grabButton = await page.evaluate(() => {
        //     const button = document.querySelector("screenshotBtn");
        //     return button;
        // });
    
      // const grabScene = await page.evaluate(() => {
      //     takeScreenshot();
      // });
  
      // grabScene;
      
      // var screenshotPromise = new Promise(function(resolve, reject) {
      //     takeScreenshot(data => {
        //       resolve(data);
        //     })
        //   });
        // console.log("Attempting screenshot")
        
        // /////////////////////////////////////////////////////////////////
        // await page.setRequestInterception(true); // Setup file catch
        
        // await page.evaluate(() => {
    //   takeScreenshot();
    // });

    // // const xRequest = await new Promise(resolve => {
    // //   page.on('request', interceptedRequest => {
    // //       interceptedRequest.abort();     //stop intercepting requests
    // //       resolve(interceptedRequest);
    // //   });
    // // });

    // // const request = require('request-promise');

    // // const options = {
    // //   encoding: null,
    // //   method: xRequest._method,
    // //   uri: xRequest._url,
    // //   body: xRequest._postData,
    // //   headers: xRequest._headers
    // // }
    
    // // /* add the cookies */
    // // const cookies = await page.cookies();
    // // options.headers.Cookie = cookies.map(ck => ck.name + '=' + ck.value).join(';');
    
    // // /* resend the request */
    // // const response = await request(options);

    // //////////////////////////////////////////////////////////

    // console.log("Screenshot attempted download")
