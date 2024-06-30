
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/013threeWebglGeometryColors
        // --geometry_colors--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_colors
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xffffff,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 20,
                near: 1,
                far: 10000,
                position: [ 0, 0, 1800  ]
            }
        })
        let scene = app.scene, camera = app.camera
        
        init();
        
        function init() {
        
            const light = new THREE.DirectionalLight( 0xffffff, 3 );
            light.position.set( 0, 0, 1 );
            scene.add( light );
        
            // shadow
        
            const canvas = document.createElement( 'canvas' );
            canvas.width = 128;
            canvas.height = 128;
        
            const context = canvas.getContext( '2d' );
            const gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
            gradient.addColorStop( 0.1, 'rgba(210,210,210,1)' );
            gradient.addColorStop( 1, 'rgba(255,255,255,1)' );
        
            context.fillStyle = gradient;
            context.fillRect( 0, 0, canvas.width, canvas.height );
        
            const shadowTexture = new THREE.CanvasTexture( canvas );
        
            const shadowMaterial = new THREE.MeshBasicMaterial( { map: shadowTexture } );
            const shadowGeo = new THREE.PlaneGeometry( 300, 300, 1, 1 );
        
            let shadowMesh;
        
            shadowMesh = new THREE.Mesh( shadowGeo, shadowMaterial );
            shadowMesh.position.y = - 250;
            shadowMesh.rotation.x = - Math.PI / 2;
            scene.add( shadowMesh );
        
            shadowMesh = new THREE.Mesh( shadowGeo, shadowMaterial );
            shadowMesh.position.y = - 250;
            shadowMesh.position.x = - 400;
            shadowMesh.rotation.x = - Math.PI / 2;
            scene.add( shadowMesh );
        
            shadowMesh = new THREE.Mesh( shadowGeo, shadowMaterial );
            shadowMesh.position.y = - 250;
            shadowMesh.position.x = 400;
            shadowMesh.rotation.x = - Math.PI / 2;
            scene.add( shadowMesh );
        
            const radius = 200;
        
            const geometry1 = new THREE.IcosahedronGeometry( radius, 1 );
        
            const count = geometry1.attributes.position.count;
            geometry1.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( count * 3 ), 3 ) );
        
            const geometry2 = geometry1.clone();
            const geometry3 = geometry1.clone();
        
            const color = new THREE.Color();
            const positions1 = geometry1.attributes.position;
            const positions2 = geometry2.attributes.position;
            const positions3 = geometry3.attributes.position;
            const colors1 = geometry1.attributes.color;
            const colors2 = geometry2.attributes.color;
            const colors3 = geometry3.attributes.color;
        
            for ( let i = 0; i < count; i ++ ) {
        
                color.setHSL( ( positions1.getY( i ) / radius + 1 ) / 2, 1.0, 0.5, THREE.SRGBColorSpace );
                colors1.setXYZ( i, color.r, color.g, color.b );
        
                color.setHSL( 0, ( positions2.getY( i ) / radius + 1 ) / 2, 0.5, THREE.SRGBColorSpace );
                colors2.setXYZ( i, color.r, color.g, color.b );
        
                color.setRGB( 1, 0.8 - ( positions3.getY( i ) / radius + 1 ) / 2, 0, THREE.SRGBColorSpace );
                colors3.setXYZ( i, color.r, color.g, color.b );
        
            }
        
            const material = new THREE.MeshPhongMaterial( {
                color: 0xffffff,
                flatShading: true,
                vertexColors: true,
                shininess: 0
            } );
        
            const wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } );
        
            let mesh = new THREE.Mesh( geometry1, material );
            let wireframe = new THREE.Mesh( geometry1, wireframeMaterial );
            mesh.add( wireframe );
            mesh.position.x = - 400;
            mesh.rotation.x = - 1.87;
            scene.add( mesh );
        
            mesh = new THREE.Mesh( geometry2, material );
            wireframe = new THREE.Mesh( geometry2, wireframeMaterial );
            mesh.add( wireframe );
            mesh.position.x = 400;
            scene.add( mesh );
        
            mesh = new THREE.Mesh( geometry3, material );
            wireframe = new THREE.Mesh( geometry3, wireframeMaterial );
            mesh.add( wireframe );
            scene.add( mesh );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};