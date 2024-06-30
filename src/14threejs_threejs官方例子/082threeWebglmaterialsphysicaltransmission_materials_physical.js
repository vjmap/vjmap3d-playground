
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/082threeWebglmaterialsphysicaltransmission
        // --materials_physical_transmission--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_physical_transmission
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
                far: 2000,
                position: [0, 0, 120]
            },
            control: {
                minDistance: 10,
                maxDistance: 150
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        const params = {
            color: 0xffffff,
            transmission: 1,
            opacity: 1,
            metalness: 0,
            roughness: 0,
            ior: 1.5,
            thickness: 0.01,
            specularIntensity: 1,
            specularColor: 0xffffff,
            envMapIntensity: 1,
            lightIntensity: 1,
            exposure: 1
        };
        
        
        let mesh;
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        const hdrEquirect = vjmap3d.LoadManager.hdrLoader
            .setPath(assetsPath + 'textures/equirectangular/' )
            .load( 'royal_esplanade_1k.hdr', function () {
        
                hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
        
                init();
        
            } );
        
        function init() {
        
            renderer.shadowMap.enabled = true;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = params.exposure;
        
        
            scene.background = hdrEquirect;
        
            //
        
            const geometry = new THREE.SphereGeometry( 20, 64, 32 );
        
            const texture = new THREE.CanvasTexture( generateTexture() );
            texture.magFilter = THREE.NearestFilter;
            texture.wrapT = THREE.RepeatWrapping;
            texture.wrapS = THREE.RepeatWrapping;
            texture.repeat.set( 1, 3.5 );
        
            const material = new THREE.MeshPhysicalMaterial( {
                color: params.color,
                metalness: params.metalness,
                roughness: params.roughness,
                ior: params.ior,
                alphaMap: texture,
                envMap: hdrEquirect,
                envMapIntensity: params.envMapIntensity,
                transmission: params.transmission, // use material.transmission for glass materials
                specularIntensity: params.specularIntensity,
                specularColor: params.specularColor,
                opacity: params.opacity,
                side: THREE.DoubleSide,
                transparent: true
            } );
        
            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
           
            //
        
            const gui = new GUI();
        
            gui.addColor( params, 'color' )
                .onChange( function () {
        
                    material.color.set( params.color );
        
                } );
        
            gui.add( params, 'transmission', 0, 1, 0.01 )
                .onChange( function () {
        
                    material.transmission = params.transmission;
        
                } );
        
            gui.add( params, 'opacity', 0, 1, 0.01 )
                .onChange( function () {
        
                    material.opacity = params.opacity;
        
                } );
        
            gui.add( params, 'metalness', 0, 1, 0.01 )
                .onChange( function () {
        
                    material.metalness = params.metalness;
        
                } );
        
            gui.add( params, 'roughness', 0, 1, 0.01 )
                .onChange( function () {
        
                    material.roughness = params.roughness;
        
                } );
        
            gui.add( params, 'ior', 1, 2, 0.01 )
                .onChange( function () {
        
                    material.ior = params.ior;
        
                } );
        
            gui.add( params, 'thickness', 0, 5, 0.01 )
                .onChange( function () {
        
                    material.thickness = params.thickness;
        
                } );
        
            gui.add( params, 'specularIntensity', 0, 1, 0.01 )
                .onChange( function () {
        
                    material.specularIntensity = params.specularIntensity;
                    
        
                } );
        
            gui.addColor( params, 'specularColor' )
                .onChange( function () {
        
                    material.specularColor.set( params.specularColor );
        
                } );
        
            gui.add( params, 'envMapIntensity', 0, 1, 0.01 )
                .name( 'envMap intensity' )
                .onChange( function () {
        
                    material.envMapIntensity = params.envMapIntensity;
        
                } );
        
            gui.add( params, 'exposure', 0, 1, 0.01 )
                .onChange( function () {
        
                    renderer.toneMappingExposure = params.exposure;
        
                } );
        
            gui.open();
        
        }
        
        
        //
        
        function generateTexture() {
        
            const canvas = document.createElement( 'canvas' );
            canvas.width = 2;
            canvas.height = 2;
        
            const context = canvas.getContext( '2d' );
            context.fillStyle = 'white';
            context.fillRect( 0, 1, 2, 1 );
        
            return canvas;
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};