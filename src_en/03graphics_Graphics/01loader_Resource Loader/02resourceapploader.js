
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/loader/02resourceapploader
        // -- App initial resource loading --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
container: "map", // Container id
    scene: {  // Scene settings
        gridHelper: { visible: true } // Whether to show grid helper
    }
})
const resources = [
    {
      name: "car",
      url: env.assetsPath + "models/car.glb",
      type: "model"
    },
    {
        name: "soldier",
        url: env.assetsPath + "models/soldier.glb",
        type: "model"
    },
    {
        name: "skybox",
        type: "hdr",
        url: env.assetsPath + "skybox/skybox_512px.hdr",
      },
  ];
  let allResources = await app.loadResources(resources, {
      showShadertoy: false,
      showHtml: true
  });
 // Background and environment
 app.setBackgroundEnvironment({
    background: {
        texture: allResources.getResource("skybox")
    },
    environmentSameAsBackground: false
});
// Get resource by name
let soldier = allResources.getResource("soldier");
soldier.addTo(app);
let car = allResources.getResource("car");
car.position.set(2, 0, 2)
car.addTo(app)

    }
    catch (e) {
        console.error(e);
    }
};