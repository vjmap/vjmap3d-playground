
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/073threeWebglmaterialsdisplacementmap
        // --materials_displacementmap--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_displacementmap
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 75,
                near: 0.1,
                far: 100,
                position: [ 0, 0, 2.5 ]
            },
            control: {
                minDistance: 20,
                maxDistance: 100
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let textureEquirec, textureCube;
        let sphereMesh, sphereMaterial, params;
        
        init();
        
        function init() {
        
            // Textures
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const loader = new THREE.CubeTextureLoader();
            loader.setPath(assetsPath + 'textures/cube/Bridge2/' );
        
            textureCube = loader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );
        
            const textureLoader = new THREE.TextureLoader();
        
            textureEquirec = textureLoader.load(assetsPath + 'textures/2294472375_24a3b8ef46_o.jpg' );
            textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
            textureEquirec.colorSpace = THREE.SRGBColorSpace;
        
            scene.background = textureCube;
        
            //
        
            const geometry = new THREE.IcosahedronGeometry( 1, 15 );
            sphereMaterial = new THREE.MeshBasicMaterial( { envMap: textureCube } );
            sphereMesh = new THREE.Mesh( geometry, sphereMaterial );
            scene.add( sphereMesh );
        
           
        
            params = {
                Cube: function () {
        
                    scene.background = textureCube;
        
                    sphereMaterial.envMap = textureCube;
                    sphereMaterial.needsUpdate = true;
        
                },
                Equirectangular: function () {
        
                    scene.background = textureEquirec;
        
                    sphereMaterial.envMap = textureEquirec;
                    sphereMaterial.needsUpdate = true;
        
                },
                Refraction: false,
                backgroundRotationX: false,
                backgroundRotationY: false,
                backgroundRotationZ: false,
                syncMaterial: false
            };
        
            const gui = new GUI( { width: 300 } );
            gui.add( params, 'Cube' );
            gui.add( params, 'Equirectangular' );
            gui.add( params, 'Refraction' ).onChange( function ( value ) {
        
                if ( value ) {
        
                    textureEquirec.mapping = THREE.EquirectangularRefractionMapping;
                    textureCube.mapping = THREE.CubeRefractionMapping;
        
                } else {
        
                    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
                    textureCube.mapping = THREE.CubeReflectionMapping;
        
                }
        
                sphereMaterial.needsUpdate = true;
        
            } );
            gui.add( params, 'backgroundRotationX' );
            gui.add( params, 'backgroundRotationY' );
            gui.add( params, 'backgroundRotationZ' );
            gui.add( params, 'syncMaterial' );
            gui.open();
        
         
            app.on("onAppUpdate", animate)
        }
        
        //
        
        function animate() {
        
            if ( params.backgroundRotationX ) {
        
                scene.backgroundRotation.x += 0.001;
        
            }
        
            if ( params.backgroundRotationY ) {
        
                scene.backgroundRotation.y += 0.001;
        
            }
        
            if ( params.backgroundRotationZ ) {
        
                scene.backgroundRotation.z += 0.001;
        
            }
        
            if ( params.syncMaterial ) {
        
                sphereMesh.material.envMapRotation.copy( scene.backgroundRotation );
        
            }
        
            camera.lookAt( scene.position );
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};