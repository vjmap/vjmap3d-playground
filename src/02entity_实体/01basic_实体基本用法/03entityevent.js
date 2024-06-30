
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/basic/03entityevent
        // --实体响应事件--通过增加事件模块给实体增加事件
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let box = new THREE.BoxGeometry(2, 2, 2)
        const material = new THREE.MeshStandardMaterial({
            color: "#0f0",
            side: THREE.DoubleSide
        });
        let mesh = new THREE.Mesh(box, material);
        let entity = vjmap3d.Entity.fromObject3d(mesh);
        entity.addTo(app);
        // 事件增加方式一：增加一个事件模块
        entity.add(vjmap3d.EventModule, {
            clickHighlight: true,
            highlightOpacity: 0.2,
            hoverSelect: true,
            hoverHtmlText: "我是MeshEntity",
            popupOptions: {
                anchor: "bottom"
            },
            clickCallback: (ent, isClick) => {
                if (!isClick) return;
                app.logInfo(`您点击了我`)
            }
        });
        // 事件增加方式二 通过监听事件
        let box2 = new THREE.BoxGeometry(1, 1, 1)
        const material2 = new THREE.MeshStandardMaterial({
            color: "#f00",
            side: THREE.DoubleSide
        });
        let mesh2 = new THREE.Mesh(box2, material2);
        let entity2 = vjmap3d.Entity.fromObject3d(mesh2);
        entity2.position.set(-3, 2, -3)
        entity2.addTo(app);
        entity2.pointerEvents = true; // 允许监听事件
        let onMouseEnterCancelCb = entity2.signal.onMouseEnter.add(() => entity2.outline = true)
        let onMouseLeaveCancelCb =  entity2.signal.onMouseLeave.add(() => entity2.outline = false)
        let control = new vjmap3d.ButtonGroupControl({
            buttons: [
                {
                    id: "id1",
                    html: "移除事件",
                    title: "移除事件",
                    style: {
                        width: "90px"
                    },
                    onclick: async () => {
                       entity.removeModule(vjmap3d.EventModule);
                       onMouseEnterCancelCb();
                       onMouseLeaveCancelCb();
                       app.logInfo(`移除事件后，将不会响应事件`)
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