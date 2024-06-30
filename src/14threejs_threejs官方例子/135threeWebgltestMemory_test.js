
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/135threeWebgltestMemory
        // --test_memory--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_test_memory
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false
            },
            scene: {
                background: 0xffffff,
                defaultLights: false
            },
            camera: {
                fov: 60,
                near: 1,
                far: 10000,
                position: [ 0, 0, 200   ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        app.signal.onAppUpdate.add(animate)
        
        function createImage() {
        
            const canvas = document.createElement( 'canvas' );
            canvas.width = 256;
            canvas.height = 256;
        
            const context = canvas.getContext( '2d' );
            context.fillStyle = 'rgb(' + Math.floor( Math.random() * 256 ) + ',' + Math.floor( Math.random() * 256 ) + ',' + Math.floor( Math.random() * 256 ) + ')';
            context.fillRect( 0, 0, 256, 256 );
        
            return canvas;
        
        }
        
        //
        
        function animate() {
        
            const geometry = new THREE.SphereGeometry( 50, Math.random() * 64, Math.random() * 32 );
        
            const texture = new THREE.CanvasTexture( createImage() );
        
            const material = new THREE.MeshBasicMaterial( { map: texture, wireframe: true } );
        
            const mesh = new THREE.Mesh( geometry, material );
        
            scene.add( mesh );
        
            renderer.render( scene, camera );
        
            scene.remove( mesh );
        
            // clean up
        
            geometry.dispose();
            material.dispose();
            texture.dispose();
        
        }
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};