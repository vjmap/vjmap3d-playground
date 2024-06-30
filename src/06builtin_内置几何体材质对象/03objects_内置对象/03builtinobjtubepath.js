
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/03builtinobjtubepath
        // --管道PathTube--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let texture = new THREE.TextureLoader().load(env.assetsPath + "textures/diffuse.jpg", () => {
            texture.wrapS = THREE.RepeatWrapping;
        });
        let outMaterial = new THREE.MeshPhongMaterial({
            color: 0x7dffeb,
            map: texture,
            side: THREE.FrontSide
        });
        let texture2 = new THREE.TextureLoader().load(env.assetsPath + "textures/uv_grid_opengl.jpg", () => {
            texture2.wrapS = THREE.RepeatWrapping;
        });
        let innerMaterial = new THREE.MeshPhongMaterial({
            map: texture2,
            side: THREE.FrontSide
        });
        let opts = {
            data: [
                {
                    paths: [
                        [3, 0, 2],
                        [-10, 0.5, -5],
                        [-12, 0, 3],
                        [-5, 2, 4]
                    ],
                    name: "path1",
                },
                {
                    paths: [
                        [3, 0, 2],
                        [12, 0, -3],
                        [15, 3, 4]
                    ],
                    name: "path2",
                },
                {
                    paths: [
                        [2, 1, 10],
                        [-1, 0, 11],
                        [3, 0, 2]
                    ],
                    name: "path3",
                }
            ],
            nodeRadius: 0.5,
            innerSideMaterial: innerMaterial,
            outerMaterial: outMaterial,
            sect: {
                shape: "arch"
            }
        }
        let pathTube = new vjmap3d.PathTubeEntities(opts);
        pathTube.addTo(app);
        // 
        for(let n = 0; n < pathTube.entity.childrens.length; n++) {
            let ent = pathTube.entity.childrens[n];
            ent.add(vjmap3d.EventModule, {
                clickHighlight: true,
                highlightOpacity: 0.2,
                hoverSelect: true,
                // @ts-ignore
                hoverHtmlText: ent.node.isNode ? 
               `节点：关联${ent.node.userData.dataIndexs} 条路径`:
                opts.data[ent.node.userData.dataIndex].name,
                popupOptions: {
                    anchor: "bottom"
                }
            });
        }
    }
    catch (e) {
        console.error(e);
    }
};