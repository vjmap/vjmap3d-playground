
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/interaction/04interactiontool
        // --绘图编辑拾取工具--
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
        for(let i = 0; i < 3; i++) {
            let box = new THREE.BoxGeometry(Math.random() * 3 + 0.5, Math.random() * 3 + 0.5, Math.random() * 3 + 0.5)
            const material = new THREE.MeshStandardMaterial({
                color: vjmap3d.randColor()
            });
            let mesh = new THREE.Mesh(box, material);
            mesh.position.copy(vjmap3d.toVector3(vjmap3d.randPoint3D({maxX: 5, maxY: 2, maxZ: 5, minX: -5, minY: -2, minZ: -5})))
            let entity = vjmap3d.Entity.fromObject3d(mesh);
            entity.addTo(app);
        }
        const ui = await app.getConfigPane({ title: "工具", style: { width: "250px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.addButton("绘制点", () => {
            app.setCurrentTool("draw.drawpoint", {
                color: 0xffffff,
                size: 20
            })
        })
        gui.addButton("绘制线", () => {
            app.setCurrentTool("draw.drawline", {
                color: Math.random() * 0xffffff,
                lineWidth: +((Math.random() * 6).toFixed(0)) + 1
            })
        })
        gui.addButton("绘制多边形", () => {
            app.setCurrentTool("draw.drawpolygon", {
                color: Math.random() * 0xffffff
            })
        })
        gui.addButton("编辑形状", () => {
            app.setCurrentTool("draw.drawedit")
        })
        gui.addButton("控制物体变换", () => {
            app.setCurrentTool("transform")
        })
        gui.addButton("拾取对象", () => {
            let opts = {
                pickCallBack: (param) => {
                    console.log(param.oldPick)
                    console.log(param.curPick)
                    if (param.curPick) app.logInfo("拾取到了", "success")
                }
            }
            app.setCurrentTool("pick", opts)
        })
        gui.addButton("取消操作", () => {
            app.setCurrentTool("default")
        })
        gui.toJson().forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};