
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/069threeWebglmaterialscubemaprefraction
        // --materials_cubemap_refraction--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_cubemap_refraction
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
                far: 100000,
                position: [0, 0, - 4000 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        init();
        
        function init() {
        
            camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100000 );
            camera.position.z = - 4000;
        
            //
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const r = assetsPath + 'textures/cube/Park3Med/';
        
            const urls = [
                r + 'px.jpg', r + 'nx.jpg',
                r + 'py.jpg', r + 'ny.jpg',
                r + 'pz.jpg', r + 'nz.jpg'
            ];
        
            const textureCube = new THREE.CubeTextureLoader().load( urls );
            textureCube.mapping = THREE.CubeRefractionMapping;
        
            scene.background = textureCube;
        
            // LIGHTS
        
            const ambient = new THREE.AmbientLight( 0xffffff, 3.5 );
            scene.add( ambient );
        
            // material samples
        
            const cubeMaterial3 = new THREE.MeshPhongMaterial( { color: 0xccddff, envMap: textureCube, refractionRatio: 0.98, reflectivity: 0.9 } );
            const cubeMaterial2 = new THREE.MeshPhongMaterial( { color: 0xccfffd, envMap: textureCube, refractionRatio: 0.985 } );
            const cubeMaterial1 = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.98 } );
        
        
            const loader = new PLYLoader();
            loader.load(assetsPath +  'models/ply/binary/Lucy100k.ply', function ( geometry ) {
        
                createScene( geometry, cubeMaterial1, cubeMaterial2, cubeMaterial3 );
        
            } );
        
        
        }
        
        function createScene( geometry, m1, m2, m3 ) {
        
            geometry.computeVertexNormals();
        
            const s = 1.5;
        
            let mesh = new THREE.Mesh( geometry, m1 );
            mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
            scene.add( mesh );
        
            mesh = new THREE.Mesh( geometry, m2 );
            mesh.position.x = - 1500;
            mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
            scene.add( mesh );
        
            mesh = new THREE.Mesh( geometry, m3 );
            mesh.position.x = 1500;
            mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
            scene.add( mesh );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};