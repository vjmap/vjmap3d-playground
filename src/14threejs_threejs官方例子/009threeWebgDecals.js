
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/009threeWebgDecals
        // --decals--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_decals
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1,
                far: 1000,
                position: [ 0, 0, 120  ]
            },
            control: {
                minDistance: 50,
                maxDistance: 200
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        let modelEntity;
        let mesh;
        let line;
        
        const intersection = {
            intersects: false,
            point: new THREE.Vector3(),
            normal: new THREE.Vector3()
        };
        const decalDiffuse = vjmap3d.ResManager.loadTexture(assetsPath + 'textures/decal/decal-diffuse.png' );
        decalDiffuse.colorSpace = THREE.SRGBColorSpace;
        const decalNormal = vjmap3d.ResManager.loadTexture(assetsPath + 'textures/decal/decal-normal.jpg' );
        
        const decalMaterial = new THREE.MeshPhongMaterial( {
            specular: 0x444444,
            map: decalDiffuse,
            normalMap: decalNormal,
            normalScale: new THREE.Vector2( 1, 1 ),
            shininess: 30,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: - 4,
            wireframe: false
        } );
        
        const decals = [];
        let mouseHelper;
        const position = new THREE.Vector3();
        const orientation = new THREE.Euler();
        const size = new THREE.Vector3( 10, 10, 10 );
        
        const params = {
            minScale: 10,
            maxScale: 20,
            rotate: true,
            clear: function () {
        
                removeDecals();
        
            }
        };
        
        init();
        
        function init() {
        
        
            scene.add( new THREE.AmbientLight( 0x666666 ) );
        
            const dirLight1 = new THREE.DirectionalLight( 0xffddcc, 3 );
            dirLight1.position.set( 1, 0.75, 0.5 );
            scene.add( dirLight1 );
        
            const dirLight2 = new THREE.DirectionalLight( 0xccccff, 3 );
            dirLight2.position.set( - 1, 0.75, - 0.5 );
            scene.add( dirLight2 );
        
            const geometry = new THREE.BufferGeometry();
            geometry.setFromPoints( [ new THREE.Vector3(), new THREE.Vector3() ] );
        
            line = new THREE.Line( geometry, new THREE.LineBasicMaterial() );
            scene.add( line );
        
            loadLeePerrySmith();
        
            mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 10 ), new THREE.MeshNormalMaterial() );
            mouseHelper.visible = false;
            scene.add( mouseHelper );
        
            app.signal.onMouseMove.add(e => {
                if (!(e.intersection  && e.entity == modelEntity)) return; // 如果没有相交或不在当前实体上
                let intersects = e.intersection
                const p = intersects.point;
                mouseHelper.position.copy( p );
                intersection.point.copy( p );
        
                const n = intersects.face.normal.clone();
                n.transformDirection(mesh.matrixWorld );
                n.multiplyScalar( 10 );
                n.add(intersects.point );
        
                intersection.normal.copy(intersects.face.normal );
                mouseHelper.lookAt( n );
        
                const positions = line.geometry.attributes.position;
                positions.setXYZ( 0, p.x, p.y, p.z );
                positions.setXYZ( 1, n.x, n.y, n.z );
                positions.needsUpdate = true;
            })
        
            app.signal.onMouseClick.add(e => {
                if (!(e.intersection  && e.entity == modelEntity)) return; // 如果没有相交或不在当前实体上
                shoot(e.intersection)
            })
        
        
            const gui = new GUI();
        
            gui.add( params, 'minScale', 1, 30 );
            gui.add( params, 'maxScale', 1, 30 );
            gui.add( params, 'rotate' );
            gui.add( params, 'clear' );
            gui.open();
        
        }
        
        async function loadLeePerrySmith() {
        
            const map = vjmap3d.ResManager.loadTexture( assetsPath + 'models/gltf/LeePerrySmith/Map-COL.jpg' );
            map.colorSpace = THREE.SRGBColorSpace;
            const specularMap = vjmap3d.ResManager.loadTexture(assetsPath +  'models/gltf/LeePerrySmith/Map-SPEC.jpg' );
            // 颜色空间需设置为 LinearSRGBColorSpace
            const normalMap = vjmap3d.ResManager.loadTextureLinear(assetsPath +  'models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg');
        
        
            modelEntity = await vjmap3d.ResManager.loadModel(assetsPath +  'models/gltf/LeePerrySmith/LeePerrySmith.glb')
            mesh = modelEntity.node.children[ 0 ].children[ 0 ];
            mesh.material = new THREE.MeshPhongMaterial( {
                specular: 0x111111,
                map: map,
                specularMap: specularMap,
                normalMap: normalMap,
                shininess: 25
            } );
            mesh.scale.set( 10, 10, 10 );
            modelEntity.addTo(app);
            modelEntity.pointerEvents = true;
        }
        
        function shoot(intersection) {
        
            position.copy( intersection.point );
            orientation.copy( mouseHelper.rotation );
        
            if ( params.rotate ) orientation.z = Math.random() * 2 * Math.PI;
        
            const scale = params.minScale + Math.random() * ( params.maxScale - params.minScale );
            size.set( scale, scale, scale );
        
            const material = decalMaterial.clone();
            material.color.setHex( Math.random() * 0xffffff );
        
            const m = new THREE.Mesh( new DecalGeometry(mesh, position, orientation, size ), material );
            m.renderOrder = decals.length; // give decals a fixed render order
        
            decals.push( m );
            scene.add( m );
        
        }
        
        function removeDecals() {
        
            decals.forEach( function ( d ) {
        
                scene.remove( d );
        
            } );
        
            decals.length = 0;
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};