
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/052threeWebglloaderTextureDds
        // --loader_texture_dds--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_loader_texture_dds
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 0.1, 
                far: 100,
                position: [ 0, 0, 15 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        const meshes = [];
        
        init();
        
        function init() {
        
            
            const geometry = new THREE.BoxGeometry( 2, 2, 2 );
        
            /*
            This is how compressed textures are supposed to be used:
        
            DXT1 - RGB - opaque textures
            DXT3 - RGBA - transparent textures with sharp alpha transitions
            DXT5 - RGBA - transparent textures with full alpha range
            */
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
        
            const loader = new DDSLoader();
        
            const map1 = loader.load(assetsPath + 'textures/compressed/disturb_dxt1_nomip.dds' );
            map1.minFilter = map1.magFilter = THREE.LinearFilter;
            map1.anisotropy = 4;
            map1.colorSpace = THREE.SRGBColorSpace;
        
            const map2 = loader.load(assetsPath +  'textures/compressed/disturb_dxt1_mip.dds' );
            map2.anisotropy = 4;
            map2.colorSpace = THREE.SRGBColorSpace;
        
            const map3 = loader.load(assetsPath +  'textures/compressed/hepatica_dxt3_mip.dds' );
            map3.anisotropy = 4;
            map3.colorSpace = THREE.SRGBColorSpace;
        
            const map4 = loader.load(assetsPath +  'textures/compressed/explosion_dxt5_mip.dds' );
            map4.anisotropy = 4;
            map4.colorSpace = THREE.SRGBColorSpace;
        
            const map5 = loader.load(assetsPath +  'textures/compressed/disturb_argb_nomip.dds' );
            map5.minFilter = map5.magFilter = THREE.LinearFilter;
            map5.anisotropy = 4;
            map5.colorSpace = THREE.SRGBColorSpace;
        
            const map6 = loader.load(assetsPath +  'textures/compressed/disturb_argb_mip.dds' );
            map6.anisotropy = 4;
            map6.colorSpace = THREE.SRGBColorSpace;
        
            const map7 = loader.load( assetsPath + 'textures/compressed/disturb_dx10_bc6h_signed_nomip.dds' );
            map7.anisotropy = 4;
        
            const map8 = loader.load(assetsPath +  'textures/compressed/disturb_dx10_bc6h_signed_mip.dds' );
            map8.anisotropy = 4;
        
            const map9 = loader.load(assetsPath +  'textures/compressed/disturb_dx10_bc6h_unsigned_nomip.dds' );
            map9.anisotropy = 4;
        
            const map10 = loader.load(assetsPath +  'textures/compressed/disturb_dx10_bc6h_unsigned_mip.dds' );
            map10.anisotropy = 4;
        
        
            const cubemap1 = loader.load(assetsPath +  'textures/compressed/Mountains.dds', function ( texture ) {
        
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearFilter;
                texture.mapping = THREE.CubeReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;
                material1.needsUpdate = true;
        
            } );
        
            const cubemap2 = loader.load(assetsPath +  'textures/compressed/Mountains_argb_mip.dds', function ( texture ) {
        
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearFilter;
                texture.mapping = THREE.CubeReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;
                material5.needsUpdate = true;
        
            } );
        
            const cubemap3 = loader.load(assetsPath +  'textures/compressed/Mountains_argb_nomip.dds', function ( texture ) {
        
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearFilter;
                texture.mapping = THREE.CubeReflectionMapping;
                texture.colorSpace = THREE.SRGBColorSpace;
                material6.needsUpdate = true;
        
            } );
        
            const material1 = new THREE.MeshBasicMaterial( { map: map1, envMap: cubemap1 } );
            const material2 = new THREE.MeshBasicMaterial( { map: map2 } );
            const material3 = new THREE.MeshBasicMaterial( { map: map3, alphaTest: 0.5, side: THREE.DoubleSide } );
            const material4 = new THREE.MeshBasicMaterial( { map: map4, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
            const material5 = new THREE.MeshBasicMaterial( { envMap: cubemap2 } );
            const material6 = new THREE.MeshBasicMaterial( { envMap: cubemap3 } );
            const material7 = new THREE.MeshBasicMaterial( { map: map5 } );
            const material8 = new THREE.MeshBasicMaterial( { map: map6 } );
            const material9 = new THREE.MeshBasicMaterial( { map: map7 } );
            const material10 = new THREE.MeshBasicMaterial( { map: map8 } );
            const material11 = new THREE.MeshBasicMaterial( { map: map9 } );
            const material12 = new THREE.MeshBasicMaterial( { map: map10 } );
        
            let mesh = new THREE.Mesh( new THREE.TorusGeometry(), material1 );
            mesh.position.x = - 10;
            mesh.position.y = - 2;
            scene.add( mesh );
            meshes.push( mesh );
        
            mesh = new THREE.Mesh( geometry, material2 );
            mesh.position.x = - 6;
            mesh.position.y = - 2;
            scene.add( mesh );
            meshes.push( mesh );
        
            mesh = new THREE.Mesh( geometry, material3 );
            mesh.position.x = - 6;
            mesh.position.y = 2;
            scene.add( mesh );
            meshes.push( mesh );
        
            mesh = new THREE.Mesh( geometry, material4 );
            mesh.position.x = - 10;
            mesh.position.y = 2;
            scene.add( mesh );
            meshes.push( mesh );
        
            mesh = new THREE.Mesh( geometry, material5 );
            mesh.position.x = - 2;
            mesh.position.y = 2;
            scene.add( mesh );
            meshes.push( mesh );
        
            mesh = new THREE.Mesh( geometry, material6 );
            mesh.position.x = - 2;
            mesh.position.y = - 2;
            scene.add( mesh );
            meshes.push( mesh );
        
            mesh = new THREE.Mesh( geometry, material7 );
            mesh.position.x = 2;
            mesh.position.y = - 2;
            scene.add( mesh );
            meshes.push( mesh );
        
            mesh = new THREE.Mesh( geometry, material8 );
            mesh.position.x = 2;
            mesh.position.y = 2;
            scene.add( mesh );
            meshes.push( mesh );
        
            mesh = new THREE.Mesh( geometry, material9 );
            mesh.position.x = 6;
            mesh.position.y = - 2;
            scene.add( mesh );
            meshes.push( mesh );
        
            mesh = new THREE.Mesh( geometry, material10 );
            mesh.position.x = 6;
            mesh.position.y = 2;
            scene.add( mesh );
            meshes.push( mesh );
        
            mesh = new THREE.Mesh( geometry, material11 );
            mesh.position.x = 10;
            mesh.position.y = - 2;
            scene.add( mesh );
            meshes.push( mesh );
        
            mesh = new THREE.Mesh( geometry, material12 );
            mesh.position.x = 10;
            mesh.position.y = 2;
            scene.add( mesh );
            meshes.push( mesh );
        
        
            app.on("onAppUpdate", animate)
        }
        
        
        function animate() {
        
            const time = Date.now() * 0.001;
        
            for ( let i = 0; i < meshes.length; i ++ ) {
        
                const mesh = meshes[ i ];
                mesh.rotation.x = time;
                mesh.rotation.y = time;
        
            }
        
        }
    }
    catch (e) {
        console.error(e);
    }
};