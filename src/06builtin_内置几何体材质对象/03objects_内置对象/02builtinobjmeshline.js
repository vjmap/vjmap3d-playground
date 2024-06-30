
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/02builtinobjmeshline
        // --Mesh线MeshLine--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            },
            control: { leftButtonPan: true } // 设置为左键用于旋转 (同时右键将用于平移) 和地图2d使用习惯一样
        })
        const tdtVecUrl =
            "https://t3.tianditu.gov.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}&tk=7baeffb96bf61861b302d0f963cfda66";
        const tdtAnnoUrl = `https://t3.tianditu.gov.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}&tk=7baeffb96bf61861b302d0f963cfda66`;
        let provider = new vjmap3d.MapProvider(
            [
                {
                    url: tdtVecUrl
                },
                {
                    url: tdtAnnoUrl
                }
            ],
            {
                rootTile: [10, 836, 446],
                colorFilter: {
                    inVerseColor: true,
                    bright: 1.2,
                    contrast: 1,
                    saturation: 1,
                    monochromeColor: "#4586b6"
                }
            }
        );
        let mapviewEnt = new vjmap3d.MapViewEntity({
            provider,
            baseScale: 100,
        });
        mapviewEnt.addTo(app);
        let res = await vjmap3d.httpHelper.get(env.assetsPath + "json/szmapdata.json");
        let linePrimary = res.data.features;
        let positions = [];
        let colors = [];
        for (var i = 0; i < linePrimary.length; i++) {
            const item = linePrimary[i];
            const points = [];
            item.geometry.coordinates.forEach(ln => {
                points.push(mapviewEnt.lngLatToWorld(ln));
            });
            let lineColor = "#ffff00";
            if (item.properties.highway === "primary") {
                lineColor = "#7eff10";
            } else if (item.properties.highway === "tertiary") {
                lineColor = "#0eeeee";
            } else if (item.properties.highway === "secondary") {
                lineColor = "#ffffff";
            } else {
                lineColor = "#ff0ffe";
            }
            positions.push(points);
            colors.push(lineColor);
        }
        for (let n = 0; n < positions.length; n++) {
            let mesh_line = new vjmap3d.MeshLineGeometry();
            mesh_line.setPoints(positions[n], null, false);
            //
            let texture = vjmap3d.ResManager.loadTexture(env.assetsPath + "textures/roadline.png");
            texture.wrapS = THREE.RepeatWrapping;
            let meshline_material = new vjmap3d.MeshLineMaterial({
                map: texture,
                useMap: true,
                color: new THREE.Color(colors[n]),
                transparent: true,
                resolution: app.commonUniforms.resolution,
                time: app.commonUniforms.time,
                sizeAttenuation: false,
                lineWidth: 20,
                depthTest: true,
                side: THREE.DoubleSide,
                repeat: new THREE.Vector2(1, 1),
                speed: new THREE.Vector2(1, 0),
                fog: false
            });
            let trail_mesh = new vjmap3d.MeshLine(mesh_line, meshline_material); 
            app.scene.add(trail_mesh);
        }
        app.cameraControl.loadState({
            cameraTarget: new THREE.Vector3(-40, 0, -30),
            cameraPosition: new THREE.Vector3(-40, 8, -30)
        })
    }
    catch (e) {
        console.error(e);
    }
};