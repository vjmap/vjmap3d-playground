
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/070threeWebglmaterialscubemapmipmaps
        // --materials_cubemap_mipmaps--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_cubemap_mipmaps
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 1,
                far: 10000,
                position: [0, 0, 500]
            },
            control: {
               minPolarAngle: Math.PI / 4,
               maxPolarAngle: Math.PI / 1.5
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        init();
        
        //load customized cube texture
        async function loadCubeTextureWithMipmaps() {
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const path = assetsPath + 'textures/cube/angus/';
            const format = '.jpg';
            const mipmaps = [];
            const maxLevel = 8;
        
            async function loadCubeTexture( urls ) {
        
                return new Promise( function ( resolve ) {
        
                    new THREE.CubeTextureLoader().load( urls, function ( cubeTexture ) {
        
                        resolve( cubeTexture );
        
                    } );
        
        
                } );
        
            }
        
            // load mipmaps
            const pendings = [];
        
            for ( let level = 0; level <= maxLevel; ++ level ) {
        
                const urls = [];
        
                for ( let face = 0; face < 6; ++ face ) {
        
                    urls.push( path + 'cube_m0' + level + '_c0' + face + format );
        
                }
        
                const mipmapLevel = level;
        
                pendings.push( loadCubeTexture( urls ).then( function ( cubeTexture ) {
        
                    mipmaps[ mipmapLevel ] = cubeTexture;
        
                } ) );
        
            }
        
            await Promise.all( pendings );
        
            const customizedCubeTexture = mipmaps.shift();
            customizedCubeTexture.mipmaps = mipmaps;
            customizedCubeTexture.colorSpace = THREE.SRGBColorSpace;
            customizedCubeTexture.minFilter = THREE.LinearMipMapLinearFilter;
            customizedCubeTexture.magFilter = THREE.LinearFilter;
            customizedCubeTexture.generateMipmaps = false;
            customizedCubeTexture.needsUpdate = true;
        
            return customizedCubeTexture;
        
        }
        
        function init() {
        
        
            loadCubeTextureWithMipmaps().then( function ( cubeTexture ) {
        
                //model
                const sphere = new THREE.SphereGeometry( 100, 128, 128 );
        
                //manual mipmaps
                let material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: cubeTexture } );
                material.name = 'manual mipmaps';
        
                let mesh = new THREE.Mesh( sphere, material );
                mesh.position.set( 100, 0, 0 );
                scene.add( mesh );
        
        
                //webgl mipmaps
                material = material.clone();
                material.name = 'auto mipmaps';
        
                const autoCubeTexture = cubeTexture.clone();
                autoCubeTexture.mipmaps = [];
                autoCubeTexture.generateMipmaps = true;
                autoCubeTexture.needsUpdate = true;
        
                material.envMap = autoCubeTexture;
        
                mesh = new THREE.Mesh( sphere, material );
                mesh.position.set( - 100, 0, 0 );
                scene.add( mesh );
        
            } );
        
        
            app.logInfo("Left: webgl generated mipmaps; Right: manual mipmaps", 30000)
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};