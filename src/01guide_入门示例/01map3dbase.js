
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/guide/01map3dbase
        // --创建3D应用--创建一个最基本功能的vjmap3D应用
        // 创建一个服务类，与服务连接
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            // 渲染参数
            render: {
                alpha: true,
                antialias: true
            },
            // 是否显示性能统计面板
            stat: {
                show: true,
                left: "0"
            },
            // 场景设置
            scene: {
                // 是否显示坐标网格
                gridHelper: {
                    visible: true,
                    // 网格大小（宽高）
                    args: [1000, 1000],
                    // 网格线单元格大小
                    cellSize: 1,
                    // 网格线单元格分组大小
                    sectionSize: 10
                }
            },
            // 相机设置
            camera: {
                // 是否显示视角指示器
                viewHelper: {
                    enable: true
                }
            },
            control: {
                //  左键用于平移 (同时右键将用于旋转) (默认)
                leftButtonPan: false
             },
        })
        let box = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshStandardMaterial({
            color: "#f00",
            side: THREE.DoubleSide
        });
        let mesh = new THREE.Mesh(box, material);
        app.scene.add(mesh);
    }
    catch (e) {
        console.error(e);
    }
};