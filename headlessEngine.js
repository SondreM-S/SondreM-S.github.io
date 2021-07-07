function runHeadless() {
    const browser = puppeteer.launch({});
    const page = browser.newPage();
    page.goto("https://playground.babylonjs.com/frame.html#PN1NNI#1");
    page.evaluate("BABYLON.Engine.LastCreatedScene.activeCamera.alpha = 1.4;");
    page.screenshot({path: './public/example.png'});
    console.log("Headlessrun complete");   // The function returns the product of p1 and p2
  }