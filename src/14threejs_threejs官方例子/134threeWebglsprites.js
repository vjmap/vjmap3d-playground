
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/134threeWebglsprites
        // --sprites--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_sprites
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false,
                autoClear: false,
            },
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 60,
                near: 1,
                far: 2100,
                position: [ 0, 0, 1500   ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let cameraOrtho, sceneOrtho;
        
        let spriteTL, spriteTR, spriteBL, spriteBR, spriteC;
        
        let mapC;
        
        let group;
        
        init();
        
        function init() {
        
            const width = app.containerSize.width;
            const height = app.containerSize.height;
        
           
            cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
            cameraOrtho.position.z = 10;
        
            scene.fog = new THREE.Fog( 0x000000, 1500, 2100 );
        
            sceneOrtho = new THREE.Scene();
        
            // create sprites
        
            const amount = 200;
            const radius = 500;
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
        
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(assetsPath + 'textures/sprite0.png', createHUDSprites );
            const mapB = textureLoader.load(assetsPath +  'textures/sprite1.png' );
            mapC = textureLoader.load(assetsPath +  'textures/sprite2.png' );
        
            mapB.colorSpace = THREE.SRGBColorSpace;
            mapC.colorSpace = THREE.SRGBColorSpace;
        
            group = new THREE.Group();
        
            const materialC = new THREE.SpriteMaterial( { map: mapC, color: 0xffffff, fog: true } );
            const materialB = new THREE.SpriteMaterial( { map: mapB, color: 0xffffff, fog: true } );
        
            for ( let a = 0; a < amount; a ++ ) {
        
                const x = Math.random() - 0.5;
                const y = Math.random() - 0.5;
                const z = Math.random() - 0.5;
        
                let material;
        
                if ( z < 0 ) {
        
                    material = materialB.clone();
        
                } else {
        
                    material = materialC.clone();
                    material.color.setHSL( 0.5 * Math.random(), 0.75, 0.5 );
                    material.map.offset.set( - 0.5, - 0.5 );
                    material.map.repeat.set( 2, 2 );
        
                }
        
                const sprite = new THREE.Sprite( material );
        
                sprite.position.set( x, y, z );
                sprite.position.normalize();
                sprite.position.multiplyScalar( radius );
        
                group.add( sprite );
        
            }
        
            scene.add( group );
        
           
            app.signal.onContainerSizeChange.add(onWindowResize)
            app.signal.onAppRender.add(animate)
        }
        
        function createHUDSprites( texture ) {
        
            texture.colorSpace = THREE.SRGBColorSpace;
        
            const material = new THREE.SpriteMaterial( { map: texture } );
        
            const width = material.map.image.width;
            const height = material.map.image.height;
        
            spriteTL = new THREE.Sprite( material );
            spriteTL.center.set( 0.0, 1.0 );
            spriteTL.scale.set( width, height, 1 );
            sceneOrtho.add( spriteTL );
        
            spriteTR = new THREE.Sprite( material );
            spriteTR.center.set( 1.0, 1.0 );
            spriteTR.scale.set( width, height, 1 );
            sceneOrtho.add( spriteTR );
        
            spriteBL = new THREE.Sprite( material );
            spriteBL.center.set( 0.0, 0.0 );
            spriteBL.scale.set( width, height, 1 );
            sceneOrtho.add( spriteBL );
        
            spriteBR = new THREE.Sprite( material );
            spriteBR.center.set( 1.0, 0.0 );
            spriteBR.scale.set( width, height, 1 );
            sceneOrtho.add( spriteBR );
        
            spriteC = new THREE.Sprite( material );
            spriteC.center.set( 0.5, 0.5 );
            spriteC.scale.set( width, height, 1 );
            sceneOrtho.add( spriteC );
        
            updateHUDSprites();
        }
        
        function updateHUDSprites() {
        
            const width = app.containerSize.width / 2;
            const height = app.containerSize.height / 2;
            if (!spriteTL) return;
            spriteTL.position.set( - width, height, 1 ); // top left
            spriteTR.position.set( width, height, 1 ); // top right
            spriteBL.position.set( - width, - height, 1 ); // bottom left
            spriteBR.position.set( width, - height, 1 ); // bottom right
            spriteC.position.set( 0, 0, 1 ); // center
        
        }
        
        function onWindowResize() {
        
            const width = app.containerSize.width;
            const height = app.containerSize.height;
        
        
            cameraOrtho.left = - width / 2;
            cameraOrtho.right = width / 2;
            cameraOrtho.top = height / 2;
            cameraOrtho.bottom = - height / 2;
            cameraOrtho.updateProjectionMatrix();
        
            updateHUDSprites();
        
        }
        
        function animate() {
        
            const time = Date.now() / 1000;
        
            for ( let i = 0, l = group.children.length; i < l; i ++ ) {
        
                const sprite = group.children[ i ];
                const material = sprite.material;
                const scale = Math.sin( time + sprite.position.x * 0.01 ) * 0.3 + 1.0;
        
                let imageWidth = 1;
                let imageHeight = 1;
        
                if ( material.map && material.map.image && material.map.image.width ) {
        
                    imageWidth = material.map.image.width;
                    imageHeight = material.map.image.height;
        
                }
        
                sprite.material.rotation += 0.1 * ( i / l );
                sprite.scale.set( scale * imageWidth, scale * imageHeight, 1.0 );
        
                if ( material.map !== mapC ) {
        
                    material.opacity = Math.sin( time + sprite.position.x * 0.01 ) * 0.4 + 0.6;
        
                }
        
            }
        
            group.rotation.x = time * 0.5;
            group.rotation.y = time * 0.75;
            group.rotation.z = time * 1.0;
        
            renderer.clear();
            renderer.render( scene, camera );
            renderer.clearDepth();
            renderer.render( sceneOrtho, cameraOrtho );
        
        }
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};