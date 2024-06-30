
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/047threeWebgllightrectarealight
        // --lights_rectarealight--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lights_rectarealight
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1, 
                far: 1000,
                position: [ 0, 5, - 15 ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let meshKnot;
        
        init();
        
        function init() {
            RectAreaLightUniformsLib.init();
        
            const rectLight1 = new THREE.RectAreaLight( 0xff0000, 5, 4, 10 );
            rectLight1.position.set( - 5, 5, 5 );
            scene.add( rectLight1 );
        
            const rectLight2 = new THREE.RectAreaLight( 0x00ff00, 5, 4, 10 );
            rectLight2.position.set( 0, 5, 5 );
            scene.add( rectLight2 );
        
            const rectLight3 = new THREE.RectAreaLight( 0x0000ff, 5, 4, 10 );
            rectLight3.position.set( 5, 5, 5 );
            scene.add( rectLight3 );
        
            scene.add( new RectAreaLightHelper( rectLight1 ) );
            scene.add( new RectAreaLightHelper( rectLight2 ) );
            scene.add( new RectAreaLightHelper( rectLight3 ) );
        
            const geoFloor = new THREE.BoxGeometry( 2000, 0.1, 2000 );
            const matStdFloor = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, roughness: 0.1, metalness: 0 } );
            const mshStdFloor = new THREE.Mesh( geoFloor, matStdFloor );
            scene.add( mshStdFloor );
        
            const geoKnot = new THREE.TorusKnotGeometry( 1.5, 0.5, 200, 16 );
            const matKnot = new THREE.MeshStandardMaterial( { color: 0xffffff, roughness: 0, metalness: 0 } );
            meshKnot = new THREE.Mesh( geoKnot, matKnot );
            meshKnot.position.set( 0, 5, 0 );
            scene.add( meshKnot );
        
            vjmap3d.Entity.attchObject(matKnot).addAction(({ elapsed }) => {
                meshKnot.rotation.y = elapsed;
            })
        
        }
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};