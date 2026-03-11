
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/coordtransform/01coordTransform3dscene
        // -- 3D scene coordinate transform --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
container: "map", // Container id
    scene: {  // Scene settings
        gridHelper: { visible: true } // Whether to show grid helper
    }
})
const sun = new THREE.Mesh(
    new THREE.SphereGeometry( 0.5, 16, 16 ),
    new THREE.MeshBasicMaterial( { color: 0xff0000 } )
)
sun.position.set(-1, 0, -1);
app.scene.add( sun );
const earth = new THREE.Mesh(
    new THREE.SphereGeometry( 0.3, 16, 16 ),
    new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
)
earth.position.set(4, 0, 0);
sun.add( earth );
const moon = new THREE.Mesh(
    new THREE.SphereGeometry( 0.1, 16, 16 ),
    new THREE.MeshBasicMaterial( { color: 0x00ffff } )
)
moon.position.set(-1, 0, 0);
earth.add( moon );
// 
let angleSunEarth = 0;
let angleEarthMoon = 0;
app.signal.onAppUpdate.add(() => {
    angleSunEarth += 0.01; // Rotation speed
    earth.position.x = 4 * Math.cos(angleSunEarth);
    earth.position.z = 4 * Math.sin(angleSunEarth);
     // Moon orbits Earth
     angleEarthMoon += 0.03; // Moon orbit speed
     moon.position.x =  1 * Math.cos(angleEarthMoon);
     moon.position.z = 1 * Math.sin(angleEarthMoon);
     //
     showCoordInfo(moon, true)
})
// Add coordinate info
const showCoordInfo = (mesh, isUpdate, radius, bkColor) => {
    let localPosition = mesh.position.clone();
    let worldPositon = mesh.localToWorld(localPosition.clone());
    let screen = app.project(worldPositon.x, worldPositon.y, worldPositon.z);
    let ndc = app.screenToNdc(screen.x, screen.y)
    let info = `Local: ${localPosition.x.toFixed(1)},${localPosition.y.toFixed(1)},${localPosition.z.toFixed(1)}<br/>`
    info += `World: ${worldPositon.x.toFixed(1)},${worldPositon.y.toFixed(1)},${worldPositon.z.toFixed(1)}<br/>`
    info += `Screen: ${screen.x.toFixed(1)},${screen.y.toFixed(1)}<br/>`
    info += `NDC: ${ndc.x.toFixed(1)},${ndc.y.toFixed(1)}<br/>`
    if (isUpdate) {
        mesh.popup.setHTML(info);
        return;
    }
    let popup = new vjmap3d.Popup2D({
        backgroundColor: bkColor,
        closeButton: false,
    })
    popup.setPosition([0, radius, 0]); // Position 
    popup.setHTML(info);
    popup.setOpacity("0.6")
    popup.addTo(mesh, app)
    mesh.popup = popup;
}
showCoordInfo(moon, false, 0.1, "#00ffff")


    }
    catch (e) {
        console.error(e);
    }
};