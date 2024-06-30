
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/010threeWebglEffectsAnaglyph
        // --effects_anaglyph--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_effects_anaglyph
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false
            },
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 60,
                near: 0.01,
                far: 100,
                position: [ 0, 0, 3  ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let effect;
        
        const spheres = [];
        
        let mouseX = 0;
        let mouseY = 0;
        
        let windowHalfX = window.innerWidth / 2;
        let windowHalfY = window.innerHeight / 2;
        
        document.addEventListener( 'mousemove', onDocumentMouseMove );
        
        init();
        
        function init() {
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const path = assetsPath + 'textures/cube/pisa/';
            const format = '.png';
            const urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ];
        
            const textureCube = new THREE.CubeTextureLoader().load( urls );
            scene.background = textureCube;
        
            const geometry = new THREE.SphereGeometry( 0.1, 32, 16 );
            const material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
        
            for ( let i = 0; i < 500; i ++ ) {
        
                const mesh = new THREE.Mesh( geometry, material );
        
                mesh.position.x = Math.random() * 10 - 5;
                mesh.position.y = Math.random() * 10 - 5;
                mesh.position.z = Math.random() * 10 - 5;
        
                mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
        
                scene.add( mesh );
        
                spheres.push( mesh );
        
            }
           
            const width = app.containerSize.width || 2;
            const height = app.containerSize.height || 2;
        
            effect = new AnaglyphEffect( renderer );
            effect.setSize( width, height );
        
            //
        
            app.signal.onContainerSizeChange.add(() => {
                windowHalfX = app.containerSize.width / 2;
        		windowHalfY = app.containerSize.height / 2;
                effect.setSize( app.containerSize.width, app.containerSize.height );
            })
        }
        
        
        function onDocumentMouseMove( event ) {
        
            mouseX = ( event.clientX - windowHalfX ) / 100;
            mouseY = ( event.clientY - windowHalfY ) / 100;
        
        }
        
        app.signal.onAppRender.add(render);
        
        function render() {
        
            const timer = 0.0001 * Date.now();
        
            camera.position.x += ( mouseX - camera.position.x ) * .05;
            camera.position.y += ( - mouseY - camera.position.y ) * .05;
        
            camera.lookAt( scene.position );
        
            for ( let i = 0, il = spheres.length; i < il; i ++ ) {
        
                const sphere = spheres[ i ];
        
                sphere.position.x = 5 * Math.cos( timer + i );
                sphere.position.y = 5 * Math.sin( timer + i * 1.1 );
        
            }
        
            effect.render( scene, camera );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};