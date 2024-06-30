
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/loader/04resourceload3ds
        // --加载3ds文件--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true }, // 是否显示坐标网格
                background: {
                    isHdr: true,
                    url: env.assetsPath + "skybox/skybox_512px.hdr"
                },
                environmentSameAsBackground: true,
            },
            stat: {
                show: true,
                left: "0"
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        await vjmap3d.ResManager.loadExtensionLoader();
        let loader = vjmap3d.ResManager.getLoader("3ds");
        loader?.setResourcePath("https://vjmap.com/map3d/resources/models/portalgun/textures/");
        const normal = vjmap3d.ResManager.loadTexture( 'https://vjmap.com/map3d/resources/models/portalgun/textures/normal.jpg' );
        let ent = await vjmap3d.ResManager.loadModel("https://vjmap.com/map3d/resources/models/portalgun/portalgun.3ds", {
            splitSubEntity: true,
            anchor: "front-bottom-right",
            position: [0, 0, 0],
            onLoad: (object) => {
                object.traverse( function ( child ) {
                    if ( child.isMesh ) {
                        child.material.specular.setScalar( 0.1 );
                        child.material.normalMap = normal;
                    }
                } );
            }
        });
        ent.addTo(app);
        app.cameraControl.rotateTo( 0,  Math.PI / 2, true );
        app.cameraControl.fitToBox(ent.node, true, { paddingLeft: 0.2, paddingRight: 0.2, paddingBottom: 0.2, paddingTop: 0.2 })
    }
    catch (e) {
        console.error(e);
    }
};