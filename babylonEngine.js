window.addEventListener("DOMContentLoaded", function() { 
    var canvas = document.getElementById("canvas1"); // Bring in the canvas made in canvas id, canvas is the window for the application(?)
    var engine = new BABYLON.Engine(canvas, true);

    var meshCollect = []; // List of mesh components
    var toggleGroups = []; // List of list with hideable components

    var createScene = function () {
        var scene = new BABYLON.Scene(engine); // Scene = level/world/scene using set up "engine"
        engine.enableOfflineSupport = false; // For 3D models, disables offline file errors
        scene.clearColor = new BABYLON.Color3.White(); //Draws the background as white before everything else
        //var box = BABYLON.MeshBuilder.CreateBox("Box", {size: 0.10}, scene); // Set box in scene

        // Orbiting camera
        var camera = new BABYLON.ArcRotateCamera("arcCamera", 
            BABYLON.Tools.ToRadians(-120), // Alpha rotation
            BABYLON.Tools.ToRadians(60), // Beta rotation
            3.0,  // Radius from rotation entity
            new BABYLON.Vector3(0, 0.5, 0), // Entity to orbit
            scene) // Sets up a orbiting camera 
        camera.lowerRadiusLimit = 2;
        // camera.position = new BABYLON.Vector3(-1.18183, 1.3636, -2.02970); // Point the camera to the model (not scaled automatically)
        camera.wheelPrecision = 50; // Increases the precision of the scrolling zoom
        // camera.wheelDeltaPercentage = true;

        camera.attachControl(canvas, true); // Allows camera input in game loop

        var lightPos = new BABYLON.Vector3(5, 2, -2)
        var lightState = 2; // State mangager for setting lights

        // Generate lights
        var light0  = new BABYLON.PointLight("pointLight0", new BABYLON.Vector3( -0.1, 0.1, 0), scene);
        var light1 = new BABYLON.PointLight("pointLight1", new BABYLON.Vector3(50, 10, -50), scene);
        var light2 = new BABYLON.PointLight("pointLight2", new BABYLON.Vector3(-50, 10, -50), scene);
        var light3 = new BABYLON.PointLight("pointLight3", new BABYLON.Vector3( 0, 3, 10), scene);
        var light4 = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), scene); // Ambien light (above)
        
        light0.parent = camera; // Attaches the light to the camera position and direction (With the setup offsett eg. 10 units over camera)
        light0.diffuse = new BABYLON.Color3(1,1,1); // White light
        light0.intensity = 8;
        light0.shadowMinZ = 0.1;
        light0.shadowMaxZ = 10;
        light0.setEnabled(false);
        var shadowGenerator0 = new BABYLON.ShadowGenerator(2048*2, light0); // First attempt at enabling shadow casting on model between components (1024 gives resolution of shadow(?))
        shadowGenerator0.usePoissonSampling = true;
        // Setup action manager which looks for user actions like pushed spacebar and runs chosen function. Eg. Turn light on or off

        light1.diffuse = new BABYLON.Color3(1,1,1); // White light
        //light1.parent = camera; // Attaches the light to the camera position and direction (With the setup offsett eg. 10 units over camera)
        light1.intensity = 6000;
        light1.shadowMinZ = 0.1;
        light1.shadowMaxZ = 100;
        //light1.autoUpdateExtends = true;
        //light1.shadowOrthoScale = 1.5;
        light1.setEnabled(false);

        var shadowGenerator1 = new BABYLON.ShadowGenerator(2048*2, light1); // First attempt at enabling shadow casting on model between components (1024 gives resolution of shadow(?))

        light2.diffuse = new BABYLON.Color3(1,1,1); // White light
        //light1.parent = camera; // Attaches the light to the camera position and direction (With the setup offsett eg. 10 units over camera)
        light2.intensity = 6000;
        light2.shadowMinZ = 0.1;
        light2.shadowMaxZ = 100;
        //light1.autoUpdateExtends = true;
        //light1.shadowOrthoScale = 1.5;
        light2.setEnabled(false);

        var shadowGenerator2 = new BABYLON.ShadowGenerator(2048*2, light2); // First attempt at enabling shadow casting on model between components (1024 gives resolution of shadow(?))

        light3.diffuse = new BABYLON.Color3(1,1,1); // White light
        //light3.parent = camera; // Attaches the light to the camera position and direction (With the setup offsett eg. 10 units over camera)
        light3.intensity = 60;
        light3.shadowMinZ = 0.1;
        light3.shadowMaxZ = 100;
        //light3.autoUpdateExtends = true;
        //light3.shadowOrthoScale = 1.5;
        light3.setEnabled(false);

        var shadowGenerator3 = new BABYLON.ShadowGenerator(2048*2, light3); // First attempt at enabling shadow casting on model between components (1024 gives resolution of shadow(?))

        light4.intensity = 0.7; // Ambient light
        light4.setEnabled(true);
        //var shadowGenerator4 = new BABYLON.ShadowGenerator(2048*2, light4);

        shadowGenerator0.useCloseExponentialShadowMap = true; // Enable shadow casting(?)
        shadowGenerator1.useCloseExponentialShadowMap = true; // Enable shadow casting(?)
        shadowGenerator2.useCloseExponentialShadowMap = true; // Enable shadow casting(?)
        shadowGenerator3.useCloseExponentialShadowMap = true; // Enable shadow casting(?)
        //shadowGenerator4.useCloseExponentialShadowMap = true;

        ////////////////////////////////////////////////////////////////////////////////////////////

        // Functions for button functionality
        this.changeLight = function(){
            if(lightState == 2){lightState = 0}
            else{lightState++};
            
            light0.setEnabled(lightState == 0); // Set to other boolean than current for light state (on/off)
            light1.setEnabled(lightState == 1); // Set to other boolean than current for light state (on/off)
            light2.setEnabled(lightState == 1); // Set to other boolean than current for light state (on/off)
            light3.setEnabled(lightState == 1); // Set to other boolean than current for light state (on/off)
            light4.setEnabled(lightState == 2); 
        }

        this.changeFabric = function(){
            meshCollect.filter(checkNull).forEach(function(mesh){ // Function for going over each part of the model
                if (mesh.material.name != null){
                    console.log("Found mat: "+mesh.name); 
                    
                    // Reads the name of each part and changes the material if a fabric is found
                    if(mesh.name.substring(0,5) == "metal"){
                        // Metal found, add shiny metal effect, else remove all shine
                        mesh.material.metallic = 5;
                        mesh.material.roughness = 0.4;
                    }else if(mesh.material.name.substring(0,5) == "Captu"){
                        // Fabric found
                        console.log("Found fabric: "+mesh.material.name); 
                        // mesh.material.metallic = 1;
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
            })
        }

        this.changeMaterial = function(img){
            // console.log(img)
            meshCollect.filter(checkNull).forEach(function(mesh){ // Function for going over each part of the model (Checknull removes null components)
                if (mesh.material.name != null){                    
                    // Reads the name of each part and changes the material if a fabric is found
                    if(mesh.name.substring(0,5) == "metal"){
                        // Metal found, add shiny metal effect, else remove all shine
                    }else if(mesh.material.name.substring(0,5) == "Captu"){
                        // Fabric found
                        // console.log("Found fabric: "+mesh.material.name); 
                        var mat = mesh.material;
                        var newMat = new BABYLON.Texture(img, scene);
                        mat.albedoTexture = newMat;
                        mesh.material = mat;
                    }
                    else{
                        try{

                        }catch(err){
                            console.log("Error in material set: \n"+err)
                        }
                    }
                }
            })
        }

        this.toggleComponent = function(num) {
            if(num == 0){ //Armrest
                meshCollect.filter(checkNull).forEach(function(mesh){
                    if (mesh.name != null){                    
                        // Reads the name of each part and hides the headrest
                        if(mesh.name.substring(0,5) == "Armre"){
                            // Metal found, add shiny metal effect, else remove all shine
                            mesh.setEnabled((mesh.isEnabled() ? false : true)); 
                        }
                    }
                })
            }else if(num == 1){ // Headrest
                meshCollect.filter(checkNull).forEach(function(mesh){
                    if (mesh.name != null){                    
                        // Reads the name of each part and hides the headrest
                        if(mesh.name.substring(0,5) == "Headr"){
                            // Metal found, add shiny metal effect, else remove all shine
                            mesh.setEnabled((mesh.isEnabled() ? false : true)); 
                        }
                    }
                })
            }

        };

        this.toggleComponent1 = function(meshGroup) { // Toggle the given meshGroup (component)
            meshGroup.filter(checkNull).forEach(function(mesh){
                mesh.setEnabled(mesh.isEnabled() ? false : true); 
            })
        };

        this.takeScreenshot = function(){ // Take screenshot of current babylonjs canvas view and make .jpg to download
            BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, {width: 1500, height: 1500, precision: 1},
                undefined, // SuccessCalback
                'image/jpg', // MimeType
                8, // Samples
                false, // AntiAliasing
                'screenshot.jpg' // Filename and type
                )
        }

        this.exportModel = function(){ // Export and download current mesh
            BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, 2500);
        }

        function checkNull(mesh) {
            return mesh.material != null;
        }

        


        //shadowGenerator.useBlurExponentialShadowMap = true
        //shadowGenerator.bias = 0.1
        //shadowGenerator.forceBackFacesOnly = false
        var subMesh = []; // Array of meshes in the model (broken up components) 
        var subCSG = []; // Array for storing CSGs from each array mesh. These will be combined to a single model
        var meshCSG = null;
        var arrL;
        // Load in 3D model (name, folder, .babylon file,)
        BABYLON.SceneLoader.ImportMesh("","Models/","Kinnarps_lowback.babylon.json",
        scene,
        function(newMeshes){ // newMeshes is an array of all submeshes
            newMeshes.filter(checkNull).forEach(function(mesh){
                // For every component(mesh) in model
                //subMesh = mesh;
                // add components into array, this allows one to create a new mesh with the complete chair (for shadows, it is not ideal for manipulation)
                //subMesh = newMeshes; // Add to submesh array
                //consol.log(mesh);
                //subCSG.push(BABYLON.CSG.FromMesh(mesh)); // Add to CSG array to be combined after loop
                meshCSG = newMeshes;
                meshCollect = newMeshes;
                shadowGenerator0.getShadowMap().renderList.push(mesh);
                mesh.receiveShadows = true;
                shadowGenerator1.getShadowMap().renderList.push(mesh);
                mesh.receiveShadows = true;
                shadowGenerator2.getShadowMap().renderList.push(mesh);
                mesh.receiveShadows = true;
                shadowGenerator3.getShadowMap().renderList.push(mesh);
                mesh.receiveShadows = true;
                //shadowGenerator4.getShadowMap().renderList.push(mesh);
                mesh.receiveShadows = true;
                
                if (mesh.material.name != null){                   
                    // Reads the name of each part and changes the material if a fabric is found
                    if(mesh.name.substring(0,5) == "metal"){
                        // Metal found, add shiny metal effect, else remove all shine
                        mesh.material.metallic = 5;
                        // mesh.material.ref
                        mesh.material.roughness = 0.4;
                    }else if(mesh.material.name.substring(0,5) == "Captu"){
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
            // Use toggleGroups to generate buttons
            toggleGroups.forEach(function(meshGroup){
                //Generate HTML button
                let btn = document.createElement("button");
                btn.innerHTML = meshGroup[0].name.split("_")[0];
                btn.classList.add("button");
                btn.onclick = function(){
                    toggleComponent1(meshGroup);
                }
                var divComp = document.getElementById("component-control"); // Pointer to correct div 
                divComp.appendChild(btn);
            })
        });
        

        return scene;
    }
    var scene = createScene();
    
    // Create gameloop
    engine.runRenderLoop(function(){
        //var subMesh = scene.getMeshByName("Modelz")
        //console.log(subMesh);
        scene.render(); // Render the visible image (last step in loop)
    }); // Babylon runs loop at 60fps by default (if possible)
});