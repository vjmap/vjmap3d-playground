
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/04builtinobjextrudemesh
        // --挤出模型ExtrudeMesh--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let texture = vjmap3d.ResManager.loadTexture(env.assetsPath + "textures/uv_grid_opengl.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        const material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            map: texture,
            transparent: true,
            opacity: 1.0
        });
        // 挤出路径的点位置    转弯半径   转弯分段数     当前点的缩放            取个名字
        let paths = [
            {
                vector3: [-3, 0, 0],
                radius: 0.5,
                segments: 2,
                scale: { x: 1, y: 1 }
            },
            {
                vector3: [3, 0, 0],
                radius: 0.5,
                segments: 2,
                scale: { x: 1, y: 1 }
            },{
                vector3: [0, 0, 5],
                radius: 0.5,
                segments: 2,
                scale: { x: 1, y: 1 }
            }
        ];
        const extrudeMesh = new vjmap3d.ExtrudeMesh(
            {
                paths: paths, // 自动生成路径的
                shapePath:[[-0.5, 0], [0.5, 0], [0.25, 0.5], [-0.25, 0.5], [-0.5, 0]],// 被拉伸成模型的平面路径
                closed: false, // 是否闭合路径
            },
            material
        );
        app.scene.add(extrudeMesh);
        // 创建一个平面的道路
        let texture2 = vjmap3d.ResManager.loadTexture(env.assetsPath + "textures/road1.png");
        texture2.wrapS = THREE.RepeatWrapping;
        const material2 = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            map: texture2,
            transparent: true,
            opacity: 1.0
        });
        let paths2 = [
            {
                vector3: [-10, 0, 0],
                radius: 0.5,
                segments: 6,
                scale: { x: 1, y: 1 }
            },
            {
                vector3: [-5, 0, 0],
                radius: 0.5,
                segments: 6,
                scale: { x: 1, y: 1 }
            },{
                vector3: [-8, 0, 5],
                radius: 0.5,
                segments: 6,
                scale: { x: 1, y: 1 }
            }
        ];
        const extrudeMesh2 = new vjmap3d.ExtrudeMesh(
            {
                paths: paths2, // 自动生成路径的
                shapePath:[[-0.5, 0], [0.5, 0]],// 被拉伸成模型的平面路径
                closed: false, // 是否闭合路径
            },
            material2
        );
        app.scene.add(extrudeMesh2);
    }
    catch (e) {
        console.error(e);
    }
};