
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/plugins/52pluginalgmodel
        // --三维模型生成二维CAD图--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            },
            control: {
                initState: {
                    cameraTarget: new THREE.Vector3(0.1, 0, 2),
        			cameraPosition: new THREE.Vector3(-2 ,2, 0),
                }
            }
        })
        let amLib = await vjmap3d.loadPluginAlgorithm();
        let silhouette = new THREE.Mesh( new THREE.BufferGeometry(), new THREE.MeshBasicMaterial( {
            color: '#eee',
            polygonOffset: true,
            polygonOffsetFactor: 3,
            polygonOffsetUnits: 3,
            side: THREE.DoubleSide,
        } ) );
        let outlines = new THREE.LineSegments( new THREE.BufferGeometry(), new THREE.LineBasicMaterial( { color: 0x030303 } ) );
        app.scene.add( outlines, silhouette );
        let ent = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/soldier.glb", {
            splitSubEntity: true,
            position: [0, 1, 0],
            rotation: [Math.PI / 2, 0, 0]
        });
        ent.addTo(app);
        //
        app.logInfo("正在根据三维模型生成二维平面图... (生成完成后可的右上角导出成dwg图)", 10000)
        let model = ent.node;
        let task = amLib.createProjectionTask({
            model,
            silhouette, 
            outlines, 
            updateProgressCb: (name, progress) => console.log(name, progress),
            updateVisible: undefined,
            ANGLE_THRESHOLD: 50
        });
        await task.promise();
        //
        let positions = outlines.geometry.attributes.position.array;
        let entitys = []
        for(let n = 0; n < positions.length; n+=6) {
            let start = [positions[n], positions[n + 2]];
            let end = [positions[n + 3], positions[n + 5]];
            if (vjmap3d.approxArrayEquals(start, end)) continue; // 两点重合
            entitys.push({
                typename: "DbLine",
                start: start,
                end: end,
            })
        }
        console.log(entitys)
        let doc = app.svc.toDbDoc({
            entitys
        })
        //console.log(doc)
        let control = new vjmap3d.ButtonGroupControl({
            buttons: [
                {
                    id: "export",
                    html: "导出成CAD图",
                    title: "把生成的平面图导出成cad图",
                    style: {
                        width: "130px"
                    },
                    onclick: async () => {
                        let res = await app.svc.updateMap({
                            mapid: "silhouette_demo",
                            filedoc: doc,
                            mapopenway: vjmap.MapOpenWay.Memory,
                            style: {
                                backcolor: 0 // 如果div背景色是浅色，则设置为oxFFFFFF
                            }
                        })
                        let href = `${app.svc.baseUrl()}_cloud/#/map/${res.mapid}?version=${res.version}&mapopenway=Memory&vector=false&isFitMap=true`
                        window.open(href)
                    }
                }
            ]
        });
        app.addControl(control, "top-right");
    }
    catch (e) {
        console.error(e);
    }
};