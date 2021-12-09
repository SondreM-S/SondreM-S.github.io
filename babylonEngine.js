window.addEventListener("DOMContentLoaded", function() { 
    const canvas = document.getElementById("canvas1"); // Bring in the canvas made in canvas id, canvas is the window for the application(?)
    const engine = new BABYLON.Engine(canvas, true);    
    
    
    const createScene = function () {
        const scene = new BABYLON.Scene(engine); // Scene = level/world/scene using set up "engine"
        engine.enableOfflineSupport = false; // For 3D models, disables offline file errors
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); //Draws the background as transparent before everything else
        
        // Semi global variables that i hate that i have, but haven't prioritized finding other solutions for yet, shrinks over time.
        let modelName = ""; // Name of the currently used model
        let current_model_json = {}; // Json to contain the description and textures for the current model, set by model_json and buttons
        let cameraStatus = false // Toggles the ability to move the camera freely 
        let meshCollect = []; // List of mesh components
        let toggleGroups = []; // List of list with hideable components (Not necesarry after JSON implementation)

        
        // // Babylonjs built-in 'sphere' shape. Usefull for debugging positions
        // var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5, segments: 32}, scene);

        // // Move the sphere upward 1/2 its height
        // sphere.position.x = 0;
        // sphere.position.y = 1;
        // sphere.position.z = 0;

        // Orbiting camera
        const camera = new BABYLON.ArcRotateCamera("arcCamera", 
            BABYLON.Tools.ToRadians(-120), // Alpha rotation
            BABYLON.Tools.ToRadians(60), // Beta rotation
            3.0,  // Radius from rotation entity
            new BABYLON.Vector3(0, 0.5, 0), // Entity to orbit
            scene) // Sets up a orbiting camera 
        camera.lowerRadiusLimit = 2;
        camera.setPosition(new BABYLON.Vector3(0, 1.377, -2.88));
        camera.fov = BABYLON.Tools.ToRadians(35) // Sets the default fov ot match Sketchups 35°
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

        this.changeMaterial = function(img){ // Function for changing all fabrics in model to the selected img (url), 
            // Todo: Add component variable to specify which component to change texture to (by component name) as well as component type (fabric, metal etc...)
            // Todo: Add metallic and roughness values as an input for custom material type based on JSON info.
            meshColl = this.getMeshCollect;
            // img = "Models/Materials/Fabrics/capture_01.jpg";
            return new Promise((resolve, reject) => {
                const mat = new BABYLON.PBRMaterial("pbr", scene); // Set default materialtype in case default material does not work (.dwg source)
                // console.log("Applying texture from: "+img);

                // TODO: Make a XMLHttpRequest for the image in order to work around CORS block, allowing for using textures outside local files

                const texture = new BABYLON.Texture(img, scene, false, false, 11, function() {
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
                                mesh.material.metallic = 0.8;
                                mesh.material.roughness = 0.4;
                            }else if(mesh.name.split("_")[1] == "Fabric"){
                                // Fabric found
                                mesh.material = mat; // Apply material to mesh
                            }
                            else{ //Anything but fabrics and metals
                                try{
                                    mesh.material.metallic = null;
                                    mesh.material.roughness = 0.5;
                                }catch(err){
                                    reject("Error in material set: \n"+err)
                                }
                            }
                        }
                    })
                }); // Find desired texture image
                resolve()
            })
        }

        this.toggleComponent1 = function(num) { // OLD code for toggling components, using hardcoded component names
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

        this.toggleComponent = (meshGroup, set_to = null) => { // Toggle the given meshGroup (component) generating buttons automatically
            if (set_to === null){ // Change from current configuration
                meshGroup.filter(checkNull).forEach(function(mesh){
                    mesh.setEnabled(mesh.isEnabled() ? false : true); 
                })
            }else if (set_to === true){ // Toggle on
                meshGroup.filter(checkNull).forEach(function(mesh){
                    mesh.setEnabled(true); 
                })
            }else if (set_to === false) { // Toggle off
                meshGroup.filter(checkNull).forEach(function(mesh){
                    mesh.setEnabled(false); 
                })
            }else{
                console.log("Incorrect input to toggleComponent")
            }
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
        }

        this.runHeadlessRender = () => {
            // Function for sending the current model and setting to the headless renderer for rendering all 
            const url = "127.0.0.1:21030/runPup"
            const Data = {
                renderFile: "Kinnarps_chair",
                materialFolder: "Fabrics"
            }
            const otherPram={
                headers:{
                    "content-type":"application/json; charset=UTF-8"
                },
                body:Data,
                method:"POST"
            };
            
            fetch(url, otherPram)
            .then(data=>{
                console.log("data: ");
                console.log(data);})
            .then(res=>{console.log(res)})
            .catch(error=>console.log(error))
            // simpleFunc("Simple function works")
        }
 
        this.exportModel = () => { // Export and download current scene as gltf (Or glb if .GLBAsync() is used)
            meshCollect.shift()
            // console.log(meshCollect);
            model_name = getModelName().split(".")[0]; // Get name of model and removing .babylonjs.json
            console.log(`Exporting model: ${model_name}.glb`)

            let options = { // meshes to not be exported ( hidden headrest, models etc.)
                shouldExportNode: function (node) {
                    return node.isEnabled(); // All invisible entities should not be exported
                },
                // shouldExportNode: function (node) {
                //     return node !== visible_meshes[1]
                // },
            }
            BABYLON.GLTF2Export.GLBAsync(scene, `${model_name}.glb`, options).then((gltf) => { 
                // When finished exporting, download
                gltf.downloadFiles();
            });
            // Method for exporting in .obj format, which does not by default have materials, and will not let you keep component names
            // downloadBlob([BABYLON.OBJExport.OBJ(meshCollect, false, "", true)], "objExport.obj"); // Making object and inserting it into downloadBlob
        }
         
        this.exportModelFull = () => { // Export and download current scene as gltf (Or glb if .GLBAsync() is used)
            meshCollect.shift()
            // console.log(meshCollect);
            model_name = getModelName().split(".")[0]; // Get name of model and removing .babylonjs.json
            console.log(`Exporting model: ${model_name}.glb`)

            BABYLON.GLTF2Export.GLBAsync(scene, `${model_name}.glb`).then((gltf) => { 
                // When finished exporting, download
                gltf.downloadFiles();
            });
            // Method for exporting in .obj format, which does not by default have materials, and will not let you keep component names
            // downloadBlob([BABYLON.OBJExport.OBJ(meshCollect, false, "", true)], "objExport.obj"); // Making object and inserting it into downloadBlob

        }

        this.moveCamera = (direction) => {
            // Function for changing the camera position and direction
            if (direction === "Front") {camera.setPosition(new BABYLON.Vector3(0, 1, -1.93))};
            if (direction === "Iso") {camera.setPosition(new BABYLON.Vector3(-1.2, 1.5, -1.23))};
            if (direction === "Back") {camera.setPosition(new BABYLON.Vector3(0, 1, 1.93))};
            camera.target = new BABYLON.Vector3(0, 0.5, 0);
        }

        this.setCamera = (cam_pos, tar_pos, fov=35) => {
            // Function for setting camera based on input values
            // camera.setPosition(new BABYLON.Vector3(0, 1, -1.93)
            x = cam_pos["x"];
            y = cam_pos["y"];
            z = cam_pos["z"];
            x_t = tar_pos["x"];
            y_t = tar_pos["y"];
            z_t = tar_pos["z"];
            camera.setPosition(new BABYLON.Vector3(x, y, z))
            camera.setTarget(new BABYLON.Vector3(x_t, y_t, z_t))
            camera.fov = BABYLON.Tools.ToRadians(fov);
        }
        
        
        this.freeCamera = () => {
            if (cameraStatus){camera.detachControl()} // Remove camera control
            else{camera.attachControl(canvas, true)} // Add camera control
            camera.setTarget(new BABYLON.Vector3(0, 0.5, 0));
            cameraStatus = !cameraStatus;
            camera.fov = 0.610865 // 35 degree fov to match sketchup view. Helps when making translation algorithm.
        }

        const getPos = (obj) => obj.position; // Function for getting position of object

        this.getModelName = () => modelName; // Function for reading the name of the currently viewed model


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

        this.cleanScene = () => { // Function for removing all elements of a scene (All meshes in meshCollect)
            meshCollect.forEach(function(mesh){ // Every mesh in meshCollect
                mesh.dispose();
                mesh = null; // Get garbage collector to pick up the mesh 
            })
        }

        this.loadModel = function(model){
            //Remove current buttons from component control by removing all elements in div
            // const divParent = document.getElementById("component-control");
            const divCam = document.getElementById("mod-camera-control");
            const feature_div = document.getElementById("feature_div");
            // Function for removing all elements in selected div
            removeAllChildNodes(divCam);
            removeAllChildNodes(feature_div);

            // Remove old mesh in model
            cleanScene();

            // Import mesh (model) with function to be run when import is done
            BABYLON.SceneLoader.ImportMesh("","Models/", 
            model,
            scene,
            function(newMeshes){ // newMeshes is an array of all submeshes
                toggleGroups = [];
                modelName = model;
                newMeshes.filter(checkNull).forEach(function(mesh){
                    // For every component(mesh) in model
                    mesh.receiveShadows = true; // Allow mesh to have shadows
                    
                    if (mesh.material.name != null){                   
                        // Reads the name of each part and changes the material if a fabric is found
                        try{
                            if(mesh.name.split("_")[1] == "Metal"){
                                // Metal found, add shiny metal effect, else remove all shine
                                mesh.material.metallic = 0.8;
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
                        }catch(err){
                            console.log("Error split material\n"+err)
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
            
                // Use toggleGroups to generate buttons for component control
                meshCollect = newMeshes;
                // Generate all necesarry buttons based on model JSON
                console.log("Adding buttons")
                // console.log(modelName.split(".")[0])
                // console.log("/Models/"+modelName.split(".")[0]+"_proper.json")
                // console.log("/Models/Kinnarps_lowback_proper.json")
                const raw_json = ("/Models/"+modelName.split(".")[0]+"_proper.json")
                // const raw_json = "/Models/Kinnarps_lowback_proper.json";
                let request = new XMLHttpRequest();
                request.responseType = 'json';
                request.open('GET', raw_json);
                request.onload = function() { // When json has been received
                    const model_json = request.response;

                    // Make the current_model_json for storing the current model setup
                    current_model_json = fillCMJ(model_json);

                    // Setup button(s) of toggleable components (and materials)

                    // For each part of features inn json
                    const toggleDivComp = document.getElementById("feature_div"); // Pointer to correct div 
                    const h2 = document.createElement("h2");
                    const divText = document.createTextNode("Features")
                    h2.appendChild(divText);
                    toggleDivComp.appendChild(h2);
                    // Read the amount of features
                    features = model_json["feature_configuration"]["preview"]["features"]; // Array of features in model_json
                    Object.keys(features).forEach(function(feature){ // For each feature, add drop down with each feature option
                        // Make drop down div and element
                        const dropDown = document.createElement("div"); // Make div to contain feature drop down (both visible button  and dropped selection)
                        // dropDown.classList.add("panel"); // dropdown classtype
                        dropDown.classList.add("dropdown");
                        dropDown.classList.add("panel");
                        const dropDownCont = document.createElement("div"); // Make the div inside the dropdown div to hold the (the selection that pops up below button)
                        dropDownCont.classList.add("dropdown-content");
                        const dropDownBtn = document.createElement("button"); // The visible button that on hover shows the selection
                        dropDownBtn.classList.add("button")
                        dropDownBtn.innerHTML = features[feature]["name"];
                        // dropDownBtn.onclick = function(){
                        //     console.log("clicked function dropdown");
                        // }
                        Object.keys(features[feature]["options"]).forEach((option) => { // For each option in each feature
                            const dropOption = document.createElement("a"); // Add to selection in drop down (What you click on, eg. With Headrest)
                            const linkText = document.createTextNode(features[feature]["options"][option]["name"]); // Text to fill selection 
                            dropOption.href = "#"; // The url the link goes to. # means no link (?)
                            
                            dropOption.onclick = () => { // When button is clicked
                                // Copy the feature id from the model_json to cmj
                                // Clicked "With Headrest", from "Headrest", id: "withhead", in current_model_json set component variants options #X where X is the matching MJ feature id with cmj feature number
                                // Step 1. Match component name with feature name in MJ
                                this.handleButton(features[feature], features[feature]["options"][option], current_model_json) // Entire feature json for finding variables, and the specific choice
                                this.updateModel(current_model_json, model_json)
                            };
                            
                            // dropOption.onclick = featureParser(features[feature][options][option]["id"]); // on click, set the feature id to every matching component and run update on model
                            // Add Thumbnail image
                            const thumbnail = document.createElement("img") // HTML image based on JSON link
                            thumbnail.src = features[feature]["options"][option]["image"];
                            dropOption.appendChild(thumbnail)
                            dropOption.appendChild(linkText);
                            dropDownCont.appendChild(dropOption);
                            // Make button and add to feature drop down
                        })
                        dropDown.appendChild(dropDownBtn);
                        dropDown.appendChild(dropDownCont);
                        toggleDivComp.appendChild(dropDown);
                    })
                    
                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Camera buttons
                    const camDivComp = document.getElementById("mod-camera-control"); // Pointer to correct div 

                    // Read the amount of Views
                    views = model_json["feature_configuration"]["preview"]["views"];
                    Object.keys(views).forEach(view => { // Loop over each view
                        const cam_pos = views[view]["view"]["eye"]
                        const target_pos = views[view]["view"]["target"]

                        // Make button with name and input set
                        //Generate HTML button
                        let btn = document.createElement("button");
                        const name = views[view]["name"]
                        btn.id = "CamViewButton";
                        btn.innerHTML = name;
                        btn.classList.add("button");
                        btn.onclick = function(){
                            setCamera(cam_pos, target_pos);
                        }
                        camDivComp.appendChild(btn);
                    });
                    // Apply the first view by clicking the first button in the div (probably front?)
                    document.getElementById("CamViewButton").click();

                    // Set the current version of the model based on the current_model_json
                    setModelJson(current_model_json);

                    // Update model based on the current setup in current_model_json, comparing it to model_json["components"]
                    updateModel(current_model_json, model_json);

                }
                request.send();
            })
        }

        this.handleButton = (feature, option, cmj) => { // Entire selected feature json, the selected option of the feature, and the current_model_json structure
            // Function for handling the button presses of the buttons generated by the json
            Object.keys(cmj["components"]).every((component) => {
                // return dictates if outer loop should continue or break. (if true, continue, if false break outer loop)
                return Object.keys(cmj["components"][component]["features"]).every((feature_n) => { // Run through inner feature loop untill match found or loop complete
                    if (cmj["components"][component]["features"][feature_n] === feature["id"]){
                        // "feature" dictates the option location (number) to update from MJ
                        cmj["components"][component]["variants"]["options"][feature_n] = option["id"];
                        return true;
                    }else{
                        // console.log("no match yet, running loop again")
                        return true;
                    }
                })
                
            })            
        };


        this.updateModel = (cmj, model_json, changed_components = null) => {
            // Compare the current_model_json component status with the preset combinations in the model_json and update
            //cmj = current_model_json
            if (changed_components === null) { // If initial fill has been completed and everything should be updated
                // For every component in current_model_json_stat
                Object.keys(cmj["components"]).forEach((component) => { 
                    //grab component name and compare to model_json conponents
                    const comp_name = cmj["components"][component]["name"];
                    const comp_ref_list = model_json["feature_configuration"]["preview"]["components"]; // array of all components in model_json

                    let found_bool = false; // bool to keep track on if component was found or not
                    Object.keys(comp_ref_list).every((comp_ref) =>{
                        const comp_ref_name = comp_ref_list[comp_ref]["name"];
                        // If correct component has been found in ref list
                        if (comp_ref_name === comp_name){
                            //compare to the component variants
                            Object.keys(comp_ref_list[comp_ref]["variants"]).every((option_var) =>{
                                // Make strings of the option array of both jsons and compare in full 
                                curr_option_str = JSON.stringify(cmj["components"][component]["variants"]["options"]);
                                mod_option_str = JSON.stringify(comp_ref_list[comp_ref]["variants"][option_var]["options"]);
                                if (curr_option_str === mod_option_str){ // If the options match                  
                                    texture_url = comp_ref_list[comp_ref]["variants"][option_var]["texture"];
                                    if (typeof texture_url !== "undefined"){ // if no undefined
                                        // console.log(texture_url)
                                        // Set the found texture to the cmj
                                        cmj["components"][component]["variants"]["texture"] = texture_url;
                                        // Update the model mesh texture based on the mesh name
                                        changeMaterial(texture_url);
                                    }
                                    const comp_mesh = [];
                                    meshCollect.forEach((mesh) => { // Collect all meshes with the matching name and add to comp_mesh array
                                        if (mesh.name.split("_")[0] === comp_name){
                                            comp_mesh.push(mesh)
                                        }
                                    });
                                    toggleComponent(comp_mesh, true); // Toggle all meshes in array
                                    found_bool = true;
                                    return false; // End matching loop
                                }
                                else{ // Not matching
                                    return true; // Continue loop untill match or loop complete
                                }
                            });
                            if (found_bool){ // Match was found, apply texture and stop comp_ref_list loop
                                return false;}
                            }else{
                                // No variant match was found
                            return true} // continue for each loop
                    });

                    if (found_bool === false) { // If no matching feature was found, hide component (in order to reduce size on json)
                        const comp_mesh = [];
                        meshCollect.forEach((mesh) => { // Collect all meshes with the matching name and add to comp_mesh array
                            if (mesh.name.split("_")[0] === comp_name){
                                comp_mesh.push(mesh);
                            }
                        });
                        toggleComponent(comp_mesh, false); // Toggle all meshes in array
                    }
                });
            }

        };     

        this.setModelJson = (curr_mod_json) => { // Function for setting the model components after the current model json
            // For every component in currentModelJson
            // console.log("currModJson");
            // console.log(JSON.stringify(curr_mod_json));
            Object.keys(curr_mod_json["components"]).forEach(function(component){ // For each feature, add drop down with each feature option
                // console.log(currModJson["components"][component]);
                const comp_name = curr_mod_json["components"][component]["name"]; // Component name
                // default_model_json["components"][component]["variants"] = default_model_json["components"][component]["variants"][0];
            });
        };

        this.fillCMJ = (model_json) => { // Function for initial fill of current_model_json using the model_json
            console.log("Filling current_model_json")
            const default_model_json = {"components": {}};
            // copy without reference from the model json to be the default settings for the chair
            default_model_json["components"] = JSON.parse(JSON.stringify(model_json))["feature_configuration"]["preview"]["components"];
            // remove all but the first choice for of the component to set the first choice as default
            Object.keys(default_model_json["components"]).forEach(function(component){ // For each feature, add drop down with each feature option
                default_model_json["components"][component]["variants"] = default_model_json["components"][component]["variants"][0];
            });
            return default_model_json
        };

        this.removeAllChildNodes = function (parent){
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            };
        };

        // Load in 3D model (name, folder, .babylon file,)
        // BABYLON.SceneLoader.ImportMesh("","Models/","EkornesSofa.babylon.json",
        // BABYLON.SceneLoader.ImportMesh("","Models/","EkornesSofa2-1.babylon.json",
        this.loadModel('Kinnarps_lowback.babylon.json') // load the default model when the page is opened

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