
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/040threeWebglLensflares
        // --lensflares--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lensflares
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1, 
                far: 15000,
                position: [ 0, 0, 250 ]
            },
            control: {
                enable: true,
            
            }, postProcess: {
                enable: false,
                renderTargetOptions: {
                    multisampling: 0
                }
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        init();
        
        function init() {
            
            scene.background = new THREE.Color().setHSL( 0.51, 0.4, 0.01, THREE.SRGBColorSpace );
            scene.fog = new THREE.Fog( scene.background, 3500, 15000 );
        
            // world
        
            const s = 250;
        
            const geometry = new THREE.BoxGeometry( s, s, s );
            const material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 50 } );
        
            for ( let i = 0; i < 3000; i ++ ) {
        
                const mesh = new THREE.Mesh( geometry, material );
        
                mesh.position.x = 8000 * ( 2.0 * Math.random() - 1.0 );
                mesh.position.y = 8000 * ( 2.0 * Math.random() - 1.0 );
                mesh.position.z = 8000 * ( 2.0 * Math.random() - 1.0 );
        
                mesh.rotation.x = Math.random() * Math.PI;
                mesh.rotation.y = Math.random() * Math.PI;
                mesh.rotation.z = Math.random() * Math.PI;
        
                mesh.matrixAutoUpdate = false;
                mesh.updateMatrix();
        
                scene.add( mesh );
        
            }
        
        
            // lights
        
            const dirLight = new THREE.DirectionalLight( 0xffffff, 0.15 );
            dirLight.position.set( 0, - 1, 0 ).normalize();
            dirLight.color.setHSL( 0.1, 0.7, 0.5 );
            scene.add( dirLight );
        
            // lensflares
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
           
            const textureFlare0 = vjmap3d.ResManager.loadTextureLinear( assetsPath + 'textures/lensflare/lensflare0.png' );
            const textureFlare3 = vjmap3d.ResManager.loadTextureLinear( assetsPath + 'textures/lensflare/lensflare3.png' );
        
            addLight( 0.55, 0.9, 0.5, 5000, 0, - 1000 );
            addLight( 0.08, 0.8, 0.5, 0, 0, - 1000 );
            addLight( 0.995, 0.5, 0.9, 5000, 5000, - 1000 );
        
            function addLight( h, s, l, x, y, z ) {
        
                const light = new THREE.PointLight( 0xffffff, 1.5, 2000, 0 );
                light.color.setHSL( h, s, l );
                light.position.set( x, y, z );
                scene.add( light );
        
                const lensflare = new Lensflare();
                lensflare.addElement( new LensflareElement( textureFlare0, 700, 0, light.color ) );
                lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.6 ) );
                lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7 ) );
                lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.9 ) );
                lensflare.addElement( new LensflareElement( textureFlare3, 70, 1 ) );
                light.add( lensflare );
        
            }
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};