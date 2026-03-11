
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/material/01builtinmattextflow
        // -- Text scroll material --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
// Vertical text scroll
let geoW = 10, geoH = 10 / 2;
let geom = new THREE.PlaneGeometry(geoW, geoH);
let mat = vjmap3d.createTextFlowMaterial(app, {
    geometryWidth: geoW,
    geometryHeight: geoH,
    flowDirection: "vertical",
    flowSpeed: 0.03,
    text: `Spring is one of the most beautiful and lively seasons of the year. In this season, nature brings us many surprises and joys. I like to walk in the park and enjoy the scenery there.
Entering the park, you will see a path winding into the distance. The path is lined with all kinds of trees—tall plane trees and low peach and pear trees. They have put out fresh green leaves that gleam in the sunlight, as if announcing the arrival of spring.
Walking along the path, you will see a sea of blooming flowers: red roses, purple lavender, yellow sunflowers and more. They compete in beauty and fragrance. In this sea of flowers you can smell a variety of scents that lift the spirit.
The park also has structures and facilities: a small lake with ducks and fish, a pavilion for rest and viewing, and play equipment such as swings and slides for children.
Spring is a season of life and hope. We can feel the wonder and charm of nature. Let us enjoy the beauty of spring together!`,
    fill: "#FF1285",
    font: "30px sans-serif",
    padding: [5, 5, 5, 5],
    backgroundColor: "#FFFE91",
    lineHeight: 50,
    width: 300,
    overflow: "break"
});
let mesh = new THREE.Mesh(geom, mat);
mesh.position.set(0, 0, 0);
mesh.rotateY(Math.PI / 16);
app.scene.add(mesh);
// Horizontal scroll text
let geoW2 = 20, geoH2 = 20 / 5;
let geom2 = new THREE.PlaneGeometry(geoW2, geoH2);
let mat2 = vjmap3d.createTextFlowMaterial(app, {
    geometryWidth: geoW2,
    geometryHeight: geoH2,
    flowDirection: "horizon",
    flowSpeed: 0.03,
    text: `Spring is one of the most beautiful and lively seasons. In this season, nature brings us many surprises and joys. I like to walk in the park and enjoy the scenery there.`,
    fill: "#16417C",
    font: "30px sans-serif",
    padding: [5, 5, 5, 5],
    backgroundColor: "#00ff00",
    lineHeight: 50
});
let mesh2 = new THREE.Mesh(geom2, mat2);
mesh2.position.set(-5, 0, -10);
app.scene.add(mesh2);

    }
    catch (e) {
        console.error(e);
    }
};