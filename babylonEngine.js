window.addEventListener("DOMContentLoaded", function() { 
    const canvas = document.getElementById("canvas1"); // Bring in the canvas made in canvas id, canvas is the window for the application(?)
    const engine = new BABYLON.Engine(canvas, true);

    let cameraStatus = false
    let meshCollect = []; // List of mesh components
    let toggleGroups = []; // List of list with hideable components

    const createScene = function () {
        const scene = new BABYLON.Scene(engine); // Scene = level/world/scene using set up "engine"
        engine.enableOfflineSupport = false; // For 3D models, disables offline file errors
        scene.clearColor = new BABYLON.Color3.White(); //Draws the background as white before everything else

        // Orbiting camera
        const camera = new BABYLON.ArcRotateCamera("arcCamera", 
            BABYLON.Tools.ToRadians(-120), // Alpha rotation
            BABYLON.Tools.ToRadians(60), // Beta rotation
            3.0,  // Radius from rotation entity
            new BABYLON.Vector3(0, 0.5, 0), // Entity to orbit
            scene) // Sets up a orbiting camera 
        camera.lowerRadiusLimit = 2;
        camera.setPosition(new BABYLON.Vector3(-1.2, 1.5, -1.23));
        // camera.position = new BABYLON.Vector3(-1.18183, 1.3636, -2.02970); // Point the camera to the model (not scaled automatically)
        camera.wheelPrecision = 50; // Increases the precision of the scrolling zoom
        // camera.wheelDeltaPercentage = true;

        // camera.attachControl(canvas, true); // Allows camera input in game loop

        // Generate lights

        const light = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), scene); // Ambien light (above)
        

        light.intensity = 0.7; // Ambient light
        light.setEnabled(true);
        //var shadowGenerator4 = new BABYLON.ShadowGenerator(2048*2, light);
        //shadowGenerator4.useCloseExponentialShadowMap = true;

        ////////////////////////////////////////////////////////////////////////////////////////////

        this.changeMaterial = function(img){ // Gerneralised funciton for changing material
            // console.log(img)
            meshCollect.filter(checkNull).forEach(function(mesh){ // Function for going over each part of the model (Checknull removes null components)
                if (mesh.name != null){ // If mesh has name        
                    // Reads the name of each part and changes the material if a fabric is found
                    if(mesh.name.split("_")[1] == "Metal"){
                        // Metal found, add shiny metal effect, else remove all shine
                    }else if(mesh.name.split("_")[1] == "Fabric"){
                        // Fabric found
                        // console.log("Found fabric: "+mesh.material.name); 
                        
                        const mat = new BABYLON.PBRMaterial("pbr", scene); // Set default materialtype in case default material does not work (.dwg source)
                        const newMat = new BABYLON.Texture(img, scene); // Find desired texture image
                        // mat.bumpTexture = newMat;
                        mat.albedoTexture = newMat; // Apply texture
                        mat.albedoTexture.uScale = 1; // Scale texture
                        mat.albedoTexture.vScake = 1; // Scale texture
                        mat.metallic = 0.1; // Set metallic reflection
                        mat.roughness = 1; // Set roughness for ammount of reflection
                        mesh.material = mat; // Apply material to mesh
                    }
                    else{ //Anything but fabrics and metals
                        try{
                            // Do nothing
                        }catch(err){
                            console.log("Error in material set: \n"+err)
                        }
                    }
                }
            })
        }

        this.toggleComponent1 = function(num) { // Old code for toggling components, using hardcoded component names
            if(num == 0){ //Armrest
                meshCollect.filter(checkNull).forEach(function(mesh){
                    if (mesh.name != null){                    
                        // Reads the name of each part and hides the headrest
                        if(mesh.name.substring(0,5) == "Armre"){
                            // Metal found, add shiny metal effect, else remove all shine
                            mesh.setEnabled((mesh.isEnabled() ? false : true)); 
                            meshExp = mesh;
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
            }else if(num == 2){ //Toggle tests
                // const browser = await puppeteer.launch({});
                // const page = await browser.newPage();
                // await page.goto("https://playground.babylonjs.com/frame.html#PN1NNI#1");
                // page.evaluate("BABYLON.Engine.LastCreatedScene.activeCamera.alpha = 1.4;");
                // await page.screenshot({path: './public/example.png'});
            }

        };

        this.toggleComponent = function(meshGroup) { // Toggle the given meshGroup (component) generating buttons automatically
            meshGroup.filter(checkNull).forEach(function(mesh){
                mesh.setEnabled(mesh.isEnabled() ? false : true); 
            })
        };

        this.takeScreenshot = function(callback){ // Take screenshot of current babylonjs canvas view and make .jpg to download
            BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera,
                {width: 2500, height: 2500, precision: 1}, // Size of image
                callback, // SuccessCalback
                'image/png', // MimeType
                8, // Samples
                false, // AntiAliasing
                'Screenshot.png' // Filename and type
                )
            console.log("Inside screenshot function");
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

        this.moveCamera = (direction) => {
            // Function for changing the camera position and direction
            if (direction === "Front") {camera.setPosition(new BABYLON.Vector3(0, 1, -1.93))};
            if (direction === "Iso") {camera.setPosition(new BABYLON.Vector3(-1.2, 1.5, -1.23))};
            if (direction === "Back") {camera.setPosition(new BABYLON.Vector3(0, 1, 1.93))};

            console.log(`Direction: ${direction}`);
        }

        
        this.freeCamera = () => {
            // camera.attachControl(canvas, true); // Allows camera input in game loop
            if (cameraStatus){camera.detachControl();} // Remove camera control
            else{camera.attachControl(canvas, true);} // Add camera control
            cameraStatus = !cameraStatus;
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
            //Remove current buttons from component control by removing all elements in div
            const divParent = document.getElementById("component-control");
            removeAllChildNodes(divParent);

            // Remove old mesh in model
            cleanScene();

            BABYLON.SceneLoader.ImportMesh("","Models/", 
            model,
            scene,
            function(newMeshes){ // newMeshes is an array of all submeshes
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
                // Use toggleGroups to generate buttons
                meshCollect = newMeshes;
                if (toggleGroups.length != 0){// Add component control text div 
                    const divComp = document.getElementById("component-control"); // Pointer to correct div 
                    const header = document.createElement("h2");
                    const text = document.createTextNode("Component Control");
                    header.appendChild(text);
                    divComp.appendChild(header);

                    toggleGroups.forEach(function(meshGroup){
                        //Generate HTML button
                        let btn = document.createElement("button");
                        btn.id = "compContButton";
                        btn.innerHTML = meshGroup[0].name.split("_")[0];
                        btn.classList.add("button");
                        btn.onclick = function(){
                            toggleComponent(meshGroup);
                        }
                        divComp.appendChild(btn);
                    })
                }
            })
        }
    


        this.removeAllChildNodes = function (parent){
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
        }


        //shadowGenerator.useBlurExponentialShadowMap = true
        //shadowGenerator.bias = 0.1
        //shadowGenerator.forceBackFacesOnly = false

        // Load in 3D model (name, folder, .babylon file,)
        // BABYLON.SceneLoader.ImportMesh("","Models/","EkornesSofa.babylon.json",
        // BABYLON.SceneLoader.ImportMesh("","Models/","EkornesSofa2-1.babylon.json",
        BABYLON.SceneLoader.ImportMesh("","Models/","Kinnarps_lowback.babylon.json",
        scene,
        function(newMeshes){ // newMeshes is an array of all submeshes
            toggleGroups = [];
            newMeshes.filter(checkNull).forEach(function(mesh){
                // For every component(mesh) in model
                //subMesh = mesh;
                // add components into array, this allows one to create a new mesh with the complete chair (for shadows, it is not ideal for manipulation)
                //subMesh = newMeshes; // Add to submesh array
                //consol.log(mesh);
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

            // Use toggleGroups to generate buttons
            meshCollect = newMeshes;
            if (toggleGroups.length != 0){
            // Add component control text div 
            const divComp = document.getElementById("component-control"); // Pointer to correct div 
            const header = document.createElement("h2");
            const text = document.createTextNode("Component Control");
            header.appendChild(text);
            divComp.appendChild(header);

                toggleGroups.forEach(function(meshGroup){
                    //Generate HTML button
                    let btn = document.createElement("button");
                    btn.id = "compContButton";
                    btn.innerHTML = meshGroup[0].name.split("_")[0];
                    btn.classList.add("button");
                    btn.onclick = function(){
                        toggleComponent(meshGroup);
                    }
                    divComp.appendChild(btn);
                })
            }
        });



        

        return scene;
    }
    const scene = createScene();
    
    // Create gameloop
    engine.runRenderLoop(function(){
        //var subMesh = scene.getMeshByName("Modelz")
        //console.log(subMesh);
        scene.render(); // Render the visible image (last step in loop)
    }); // Babylon runs loop at 60fps by default (if possible)
});