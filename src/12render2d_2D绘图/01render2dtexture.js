
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/render2d/01render2dtexture
        // --2D绘图引擎--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            },
            control: { leftButtonPan: true } // 设置为左键用于旋转 (同时右键将用于平移) 和地图2d使用习惯一样
        })
        let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg2.png");
        let elements = [];
        // 增加image做为底图
        elements.push(new vjmap3d.render2d.Image({
            style: {
                x: 0,
                y: 0,
                image: image,
                width: 270, // 像素宽，这里是图片像素宽高定的
                height: 250 // 像素高，这里是图片像素宽高定的
            }
        }))
        elements.push(new vjmap3d.render2d.Text({
            style: {
                x: 138,
                y: 100,
                text: "VJMAP",
                fill: "#0ff",
                font: '50px Arial',
                verticalAlign: "middle",
                align: "center",
            }
        }))
        // 做为2d绘图渲染材质使用
        let renderTexture = vjmap3d.createRender2dTexture({
            autoCanvasSize: false, // 是否根据绘制的内容计算渲染的大小
            sharedCanvas: true, // 是否为了提高效率共享一个canvas
            canvasWidth: 270, // 像素宽，这里是根据底图的像素宽高定的
            canvasHeight: 250, // 像素高，这里是根据底图的像素宽高定的
            elements: elements,
        });
        let geoW = 2, geoH = 2;
        let geom = new THREE.PlaneGeometry(geoW, geoH);
        let mat = new THREE.MeshStandardMaterial({
            map: renderTexture.texture(),
            transparent: true
        })
        let mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(0, 1, 0);
        app.scene.add(mesh);
        // 通过`canvas`使用
        let canvas = document.createElement("canvas");
        canvas.width = 270;
        canvas.height = 250;
        let render = vjmap3d.render2d.init(canvas);
        let group = new vjmap3d.render2d.Group();
        render.add(group);
        for(let n = 0; n < elements.length; n++) {
            group.add(elements[n])
        }
        let marker = new vjmap3d.Marker2D({
            element: canvas,
            anchor: "bottom"
        })
        marker.setPosition(-5, 0, 3);
        marker.addTo(app);
        
    }
    catch (e) {
        console.error(e);
    }
};