
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/contextmenu/01uicontextmenu
        // --创建上下文菜单--
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
        let box = new THREE.BoxGeometry(2, 2, 2)
        const material = new THREE.MeshStandardMaterial({
            color: '#0ff'
        });
        let mesh = new THREE.Mesh(box, material);
        mesh.position.set(0, 0, 0)
        let meshEnt = vjmap3d.Entity.fromObject3d(mesh);
        meshEnt.pointerEvents = true; // 实体允许事件，这样在此实体上面弹右键菜单才可以响应
        meshEnt.addTo(app);
        //
        let marker2d = new vjmap3d.Marker2D({
            color: vjmap3d.randHtmlColor()
        });
        marker2d.setPosition([2, 0, 1]);
        marker2d.addTo(app);
        //
        let isAllowShowMenu = true
        app.setMenu((event, object) => {
            if (!isAllowShowMenu) return;
            if (object) {
                // 如果点击在一个实体对象上面时
                return new vjmap3d.ContextMenu({
                    event: event.originalEvent,
                    theme: "dark", //light
                    width: "250px",
                    items: [
                        {type: 'custom', markup: `<span style="color: #00ffff; padding-left: 30px">实体右键菜单</span>`},
                        {
                            label: '编辑',
                            onClick: () => {
                                app.transformObject({
                                    target: object.target.node,
                                    clickNoSelfEntityExit: true,
                                    clickNoEntityExit: true,
                                });
                            }
                        },
                        {
                            label: '删除',
                            onClick: () => {
                                object.target.remove()
                            }
                        },
                    ]
                });
            } else {
                // 如果没有点击到东西时， 则弹出应用本身的菜单
                return new vjmap3d.ContextMenu({
                    event: event.originalEvent,
                    theme: "dark", //light
                    width: "250px",
                    items: [
                        {type: 'custom', markup: `<span style="color: #ffff00; padding-left: 30px">应用右键菜单</span>`},
                        {type: 'multi', items: [
                            {label: '放大', onClick: () => { app.cameraControl.dolly(3); }},
                            {label: '缩小', onClick: () => { app.cameraControl.dolly(-3); }},
                        ]},
                    ]
                });
            }
        })
        // marker属于div，右键菜单事件需要单独增加响应
        marker2d.getElement().addEventListener("contextmenu", event => {
            // @ts-ignore
            if (event.button != 2) return;//不是右键
            // 阻止地图默认右键菜单触发
            event.preventDefault();
            event.stopPropagation();
            new vjmap3d.ContextMenu({
                event: event,
                theme: "dark", //light
                width: "250px",
                items: [
                    {type: 'custom', markup: `<span style="color: #ff00ff; padding-left: 30px">标注Marker的右键菜单</span>`},
                    {
                        label: '允许拖动',
                        onClick: () => {
                            marker2d.setDraggable(true)
                        }
                    },
                    {
                        label: '不允许拖动',
                        onClick: () => {
                            marker2d.setDraggable(false)
                        }
                    }
                ]
            });
        })
        app.logInfo("请在相应的位置点击右键弹出右键菜单")
        
    }
    catch (e) {
        console.error(e);
    }
};