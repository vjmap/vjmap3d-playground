
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/090threeWebglmaterialsmaterialstextureRotation
        // --materials_texture_rotation--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_texture_rotation
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
                far: 1000,
                position: [ 10, 15, 25 ]
            },
            control: {
                minDistance: 20,
                maxDistance: 50,
                maxPolarAngle:  Math.PI / 2
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mesh;
        
        let gui;
        
        const API = {
            offsetX: 0,
            offsetY: 0,
            repeatX: 0.25,
            repeatY: 0.25,
            rotation: Math.PI / 4, // positive is counterclockwise
            centerX: 0.5,
            centerY: 0.5
        };
        
        init();
        
        function init() {
        
            scene.add( camera );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            
            const geometry = new THREE.BoxGeometry( 10, 10, 10 );
        
            new THREE.TextureLoader().load(assetsPath + 'textures/uv_grid_opengl.jpg', function ( texture ) {
        
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                texture.colorSpace = THREE.SRGBColorSpace;
        
                //texture.matrixAutoUpdate = false; // default true; set to false to update texture.matrix manually
        
                const material = new THREE.MeshBasicMaterial( { map: texture } );
        
                mesh = new THREE.Mesh( geometry, material );
                scene.add( mesh );
        
                updateUvTransform();
        
                initGui();
        
            } );
        
          
        
        }
        
        function updateUvTransform() {
        
            const texture = mesh.material.map;
        
            if ( texture.matrixAutoUpdate === true ) {
        
                texture.offset.set( API.offsetX, API.offsetY );
                texture.repeat.set( API.repeatX, API.repeatY );
                texture.center.set( API.centerX, API.centerY );
                texture.rotation = API.rotation; // rotation is around center
        
            } else {
        
                // setting the matrix uv transform directly
                //texture.matrix.setUvTransform( API.offsetX, API.offsetY, API.repeatX, API.repeatY, API.rotation, API.centerX, API.centerY );
        
                // another way...
                texture.matrix
                    .identity()
                    .translate( - API.centerX, - API.centerY )
                    .rotate( API.rotation )					// I don't understand how rotation can preceed scale, but it seems to be required...
                    .scale( API.repeatX, API.repeatY )
                    .translate( API.centerX, API.centerY )
                    .translate( API.offsetX, API.offsetY );
        
            }
        
        
        }
        
        function initGui() {
        
            gui = new GUI();
        
            gui.add( API, 'offsetX', 0.0, 1.0 ).name( 'offset.x' ).onChange( updateUvTransform );
            gui.add( API, 'offsetY', 0.0, 1.0 ).name( 'offset.y' ).onChange( updateUvTransform );
            gui.add( API, 'repeatX', 0.25, 2.0 ).name( 'repeat.x' ).onChange( updateUvTransform );
            gui.add( API, 'repeatY', 0.25, 2.0 ).name( 'repeat.y' ).onChange( updateUvTransform );
            gui.add( API, 'rotation', - 2.0, 2.0 ).name( 'rotation' ).onChange( updateUvTransform );
            gui.add( API, 'centerX', 0.0, 1.0 ).name( 'center.x' ).onChange( updateUvTransform );
            gui.add( API, 'centerY', 0.0, 1.0 ).name( 'center.y' ).onChange( updateUvTransform );
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};