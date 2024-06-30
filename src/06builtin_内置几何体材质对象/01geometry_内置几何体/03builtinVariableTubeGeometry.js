
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/geometry/03builtinVariableTubeGeometry
        // --变径管道--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let curve = new THREE.CatmullRomCurve3(
            [
                [10, 20, 16],
                [15, 10, 20],
                [10, 0, 36],
                [46, 30, 20],
                [85, 60, 63],
                [92, 20, 67],
                [10, 60, 56]
            ].map(el => new THREE.Vector3(...el))
        );
        let radiusArr = [];
        let valuesArr = [0, 10];
        let mapValuesArr = [1, 1.5];
        for (var a = 0; a < curve.getLength(); a++) {
            radiusArr.push([a, Math.random() * 20]);
        }
        const LUT = new Lut();
        let geo = new vjmap3d.VariableTubeGeometry(
            curve,
            radiusArr,
            20,
            valuesArr,
            mapValuesArr,
            LUT
        );
        let materialData = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            vertexColors: true
        });
        let mesh = new THREE.Mesh(geo, materialData);
        mesh.scale.set(0.3, 0.3, 0.3)
        mesh.position.set(-10, 0, -10)
        app.scene.add(mesh);
    }
    catch (e) {
        console.error(e);
    }
};