
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/camera/01cameracontrol
        // --相机控制操作--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
        container: "map", // 容器id
            scene: {  // 场景设置
                gridHelper: { visible: true } // 是否显示坐标网格
            }
        })
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry( 1, 1, 1 ),
            new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
        );
        app.scene.add( mesh );
        let cameraControls = app.cameraControl;
        const ui = await app.getConfigPane({ title: "相机操作", style: { width: "250px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.add(cameraControls, "enabled")
        gui.add(cameraControls, "verticalDragToForward")
        gui.add(cameraControls, "dollyToCursor")
        gui.add(cameraControls, "dollyDragInverted")
        gui.addButton('rotate theta 45deg' , () => cameraControls.rotate( 45 * THREE.MathUtils.DEG2RAD, 0, true ));
        gui.addButton('rotate theta -90deg' , () => cameraControls.rotate( - 90 * THREE.MathUtils.DEG2RAD, 0, true ));
        gui.addButton('rotate theta 360deg' , () => cameraControls.rotate( 360 * THREE.MathUtils.DEG2RAD, 0, true ));
        gui.addButton('rotate phi 20deg' , () => cameraControls.rotate( 0, 20 * THREE.MathUtils.DEG2RAD, true ));
        gui.addButton('pan( 0, 1 )' , () => cameraControls.pan(   1,   0, true));
        gui.addButton('pan( -1, -1 )' , () => cameraControls.pan( - 1, - 1, true ));
        gui.addButton('dolly  1' , () => cameraControls.dolly(   1, true ));
        gui.addButton('dolly -1' , () => cameraControls.dolly( - 1, true ));
        gui.addButton('zoom `camera.zoom / 2`' , () => cameraControls.zoom( app.camera.zoom / 2, true ));
        gui.addButton('move to( 3, 5, 2 )' , () => cameraControls.moveTo( 3, 5, 2, true ));
        gui.addButton('fit to the bounding box of the mesh' , () => cameraControls.fitToBox( mesh, true ))
        gui.addButton('move to ( -5, 2, 1 )' , () => cameraControls.setPosition( - 5, 2, 1, true ));
        gui.addButton('look at ( 3, 0, -3 )' , () => cameraControls.setTarget( 3, 0, -3, true ));
        gui.addButton('move to ( 1, 2, 3 ), look at ( 1, 1, 0 )' , () => cameraControls.setLookAt( 1, 2, 3, 1, 1, 0, true ));
        gui.addButton('move to somewhere between ( -2, 0, 0 ) -> ( 1, 1, 0 ) and ( 0, 2, 5 ) -> ( -1, 0, 0 )' , () => cameraControls.lerpLookAt( - 2, 0, 0, 1, 1, 0, 0, 2, 5, - 1, 0, 0, Math.random(), true ));
        gui.addButton('shake' , () => cameraControls.shake( 1000, 10, 1, false ));
        gui.addButton('reset' , () => cameraControls.reset( true ));
        let state;
        gui.addButton('saveState' , () => state = cameraControls.saveState());
        gui.addButton('loadState' , () => {if(state) cameraControls.loadState( state )});
        gui.toJson().forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};