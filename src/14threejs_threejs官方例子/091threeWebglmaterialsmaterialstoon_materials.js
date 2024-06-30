
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/091threeWebglmaterialsmaterialstoon
        // --materials_toon--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_toon
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x444488,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1,
                far: 2500,
                position: [ 0.0, 400, 400 * 3.5]
            },
            control: {
                minDistance: 200,
                maxDistance: 2000
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let effect;
        let particleLight;
        
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
        const loader = new FontLoader();
        loader.load(assetsPath + 'fonts/gentilis_regular.typeface.json', function ( font ) {
        
            init( font );
        
        } );
        
        function init( font ) {
        
        
            // Materials
        
            const cubeWidth = 400;
            const numberOfSphersPerSide = 5;
            const sphereRadius = ( cubeWidth / numberOfSphersPerSide ) * 0.8 * 0.5;
            const stepSize = 1.0 / numberOfSphersPerSide;
        
            const geometry = new THREE.SphereGeometry( sphereRadius, 32, 16 );
        
            for ( let alpha = 0, alphaIndex = 0; alpha <= 1.0; alpha += stepSize, alphaIndex ++ ) {
        
                const colors = new Uint8Array( alphaIndex + 2 );
        
                for ( let c = 0; c <= colors.length; c ++ ) {
        
                    colors[ c ] = ( c / colors.length ) * 256;
        
                }
        
                const gradientMap = new THREE.DataTexture( colors, colors.length, 1, THREE.RedFormat );
                gradientMap.needsUpdate = true;
        
                for ( let beta = 0; beta <= 1.0; beta += stepSize ) {
        
                    for ( let gamma = 0; gamma <= 1.0; gamma += stepSize ) {
        
                        // basic monochromatic energy preservation
                        const diffuseColor = new THREE.Color().setHSL( alpha, 0.5, gamma * 0.5 + 0.1 ).multiplyScalar( 1 - beta * 0.2 );
        
                        const material = new THREE.MeshToonMaterial( {
                            color: diffuseColor,
                            gradientMap: gradientMap
                        } );
        
                        const mesh = new THREE.Mesh( geometry, material );
        
                        mesh.position.x = alpha * 400 - 200;
                        mesh.position.y = beta * 400 - 200;
                        mesh.position.z = gamma * 400 - 200;
        
                        scene.add( mesh );
        
                    }
        
                }
        
            }
        
            function addLabel( name, location ) {
        
                const textGeo = new TextGeometry( name, {
        
                    font: font,
        
                    size: 20,
                    depth: 1,
                    curveSegments: 1
        
                } );
        
                const textMaterial = new THREE.MeshBasicMaterial();
                const textMesh = new THREE.Mesh( textGeo, textMaterial );
                textMesh.position.copy( location );
                scene.add( textMesh );
        
            }
        
            addLabel( '-gradientMap', new THREE.Vector3( - 350, 0, 0 ) );
            addLabel( '+gradientMap', new THREE.Vector3( 350, 0, 0 ) );
        
            addLabel( '-diffuse', new THREE.Vector3( 0, 0, - 300 ) );
            addLabel( '+diffuse', new THREE.Vector3( 0, 0, 300 ) );
        
            particleLight = new THREE.Mesh(
                new THREE.SphereGeometry( 4, 8, 8 ),
                new THREE.MeshBasicMaterial( { color: 0xffffff } )
            );
            scene.add( particleLight );
        
            // Lights
        
            scene.add( new THREE.AmbientLight( 0xc1c1c1, 3 ) );
        
            const pointLight = new THREE.PointLight( 0xffffff, 2, 800, 0 );
            particleLight.add( pointLight );
        
            //
        
            effect = new OutlineEffect( renderer );
        
            
        
            app.signal.onAppRender.add(render)
        }
        
        
        
        function render() {
        
            const timer = Date.now() * 0.00025;
        
            particleLight.position.x = Math.sin( timer * 7 ) * 300;
            particleLight.position.y = Math.cos( timer * 5 ) * 400;
            particleLight.position.z = Math.cos( timer * 3 ) * 300;
        
            effect.render( scene, camera );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};