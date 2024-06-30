
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/063threeWebglmaterialsblending
        // --materials_blending--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_blending
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 1,
                far: 1000,
                position: [ 0, 0, 600 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mapBg;
        
        const textureLoader = new THREE.TextureLoader();
        
        init();
        
        function init() {
        
        
            const canvas = document.createElement( 'canvas' );
            const ctx = canvas.getContext( '2d' );
            canvas.width = canvas.height = 128;
            ctx.fillStyle = '#ddd';
            ctx.fillRect( 0, 0, 128, 128 );
            ctx.fillStyle = '#555';
            ctx.fillRect( 0, 0, 64, 64 );
            ctx.fillStyle = '#999';
            ctx.fillRect( 32, 32, 32, 32 );
            ctx.fillStyle = '#555';
            ctx.fillRect( 64, 64, 64, 64 );
            ctx.fillStyle = '#777';
            ctx.fillRect( 96, 96, 32, 32 );
        
            mapBg = new THREE.CanvasTexture( canvas );
            mapBg.colorSpace = THREE.SRGBColorSpace;
            mapBg.wrapS = mapBg.wrapT = THREE.RepeatWrapping;
            mapBg.repeat.set( 64, 32 );
        
            scene.background = mapBg;
        
            // OBJECTS
        
            const blendings = [
                { name: 'No', constant: THREE.NoBlending },
                { name: 'Normal', constant: THREE.NormalBlending },
                { name: 'Additive', constant: THREE.AdditiveBlending },
                { name: 'Subtractive', constant: THREE.SubtractiveBlending },
                { name: 'Multiply', constant: THREE.MultiplyBlending }
            ];
        
            const assignSRGB = ( texture ) => {
        
                texture.colorSpace = THREE.SRGBColorSpace;
        
            };
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            
            const map0 = textureLoader.load(assetsPath +  'textures/uv_grid_opengl.jpg', assignSRGB );
            const map1 = textureLoader.load(assetsPath +  'textures/sprite0.jpg', assignSRGB );
            const map2 = textureLoader.load(assetsPath +  'textures/sprite0.png', assignSRGB );
            const map3 = textureLoader.load(assetsPath +  'textures/lensflare/lensflare0.png', assignSRGB );
            const map4 = textureLoader.load(assetsPath +  'textures/lensflare/lensflare0_alpha.png', assignSRGB );
        
            const geo1 = new THREE.PlaneGeometry( 100, 100 );
            const geo2 = new THREE.PlaneGeometry( 100, 25 );
        
            addImageRow( map0, 300 );
            addImageRow( map1, 150 );
            addImageRow( map2, 0 );
            addImageRow( map3, - 150 );
            addImageRow( map4, - 300 );
        
            function addImageRow( map, y ) {
        
                for ( let i = 0; i < blendings.length; i ++ ) {
        
                    const blending = blendings[ i ];
        
                    const material = new THREE.MeshBasicMaterial( { map: map } );
                    material.transparent = true;
                    material.blending = blending.constant;
        
                    const x = ( i - blendings.length / 2 ) * 110;
                    const z = 0;
        
                    let mesh = new THREE.Mesh( geo1, material );
                    mesh.position.set( x, y, z );
                    scene.add( mesh );
        
                    mesh = new THREE.Mesh( geo2, generateLabelMaterial( blending.name ) );
                    mesh.position.set( x, y - 75, z );
                    scene.add( mesh );
        
                }
        
            }
        
            app.sceneEntity.addAction(() => {
                const time = Date.now() * 0.00025;
                const ox = ( time * - 0.01 * mapBg.repeat.x ) % 1;
                const oy = ( time * - 0.01 * mapBg.repeat.y ) % 1;
                
                mapBg.offset.set( ox, oy );
            })
        
        }
        
        function generateLabelMaterial( text ) {
        
            const canvas = document.createElement( 'canvas' );
            const ctx = canvas.getContext( '2d' );
            canvas.width = 128;
            canvas.height = 32;
        
            ctx.fillStyle = 'rgba( 0, 0, 0, 0.95 )';
            ctx.fillRect( 0, 0, 128, 32 );
        
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12pt arial';
            ctx.fillText( text, 10, 22 );
        
            const map = new THREE.CanvasTexture( canvas );
            map.colorSpace = THREE.SRGBColorSpace;
        
            const material = new THREE.MeshBasicMaterial( { map: map, transparent: true } );
        
            return material;
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};