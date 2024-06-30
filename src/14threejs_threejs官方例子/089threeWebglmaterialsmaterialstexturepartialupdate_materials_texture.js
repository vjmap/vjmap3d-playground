
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/089threeWebglmaterialsmaterialstexturepartialupdate
        // --materials_texture_partialupdate--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_texture_partialupdate
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 0.01,
                far: 10,
                position: [ 0, 0, 2]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let dataTexture, diffuseMap;
        
        let last = 0;
        const position = new THREE.Vector2();
        const color = new THREE.Color();
        
        init();
        
        async function init() {
        
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const loader = new THREE.TextureLoader();
            diffuseMap = await loader.loadAsync(assetsPath + 'textures/floors/FloorsCheckerboard_S_Diffuse.jpg' );
            diffuseMap.colorSpace = THREE.SRGBColorSpace;
            diffuseMap.minFilter = THREE.LinearFilter;
            diffuseMap.generateMipmaps = false;
        
            const geometry = new THREE.PlaneGeometry( 2, 2 );
            const material = new THREE.MeshBasicMaterial( { map: diffuseMap } );
        
            const mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
            //
        
            const width = 32;
            const height = 32;
        
            const data = new Uint8Array( width * height * 4 );
            dataTexture = new THREE.DataTexture( data, width, height );
        
           
            app.signal.onAppUpdate.add(e => animate(e))
        
        }
        
        function animate(e) {
        
            const elapsedTime = e.elapsedTime;
        
            if ( elapsedTime - last > 0.1 ) {
        
                last = elapsedTime;
        
                position.x = ( 32 * THREE.MathUtils.randInt( 1, 16 ) ) - 32;
                position.y = ( 32 * THREE.MathUtils.randInt( 1, 16 ) ) - 32;
        
                // generate new color data
        
                updateDataTexture( dataTexture );
        
                // perform copy from src to dest texture to a random position
        
                renderer.copyTextureToTexture( dataTexture, diffuseMap, null, position );
        
            }
        
            renderer.render( scene, camera );
        
        }
        
        function updateDataTexture( texture ) {
        
            const size = texture.image.width * texture.image.height;
            const data = texture.image.data;
        
            // generate a random color and update texture data
        
            color.setHex( Math.random() * 0xffffff );
        
            const r = Math.floor( color.r * 255 );
            const g = Math.floor( color.g * 255 );
            const b = Math.floor( color.b * 255 );
        
            for ( let i = 0; i < size; i ++ ) {
        
                const stride = i * 4;
        
                data[ stride ] = r;
                data[ stride + 1 ] = g;
                data[ stride + 2 ] = b;
                data[ stride + 3 ] = 1;
        
            }
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};