
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/linepoly/04polygontexture
        // --多边形实体材质--给多边形创建材质
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            stat: {
                show: true,
                left: "0"
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        
        let data = [];
        data.push({
            coordinates: [[7, 0, 3], [-4, -2, -2], [-5, 0, 3], [6, -2, 7]],
            color: "#f00"
        })
        
        let elements = [];
        let canvasWidth = 1600;
        let canvasHeight = 800; // 这个比例根据坐标的长高比来决定
        
        let img = await vjmap3d.loadImage(env.assetsPath + "textures/diffuse.jpg")
        var pattern = new vjmap3d.render2d.Pattern(img, 'repeat');
        elements.push(new vjmap3d.render2d.Rect({
            shape: {
                x: 0,
                y: 0,
                width: canvasWidth,
                height: canvasHeight
            },
            style: {
                fill: pattern // "#16417C" // 背景图案填充或纯色
            }
        }))
        elements.push(new vjmap3d.render2d.Text({
            style: {
                x: canvasWidth / 2,
                y: canvasHeight / 2,
                text: "唯杰地图VJMAP",
                fill: "#EB3324",
                font: canvasWidth / 15 + 'px Arial',
                verticalAlign: "middle",
                align: "center",
            }
        }))
        // 做为2d绘图渲染材质使用
        let renderTexture = vjmap3d.createRender2dTexture({
            autoCanvasSize: false, // 是否根据绘制的内容计算渲染的大小
            sharedCanvas: true, // 是否为了提高效率共享一个canvas
            canvasWidth: canvasWidth, // 像素宽，这里是根据底图的像素宽高定的
            canvasHeight: canvasHeight, // 像素高，这里是根据底图的像素宽高定的
            elements: elements,
        });
        let texture = renderTexture.texture();
        
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        // Y轴翻转下
        texture.flipY = false;
        // 设置纹理中心点
        texture.center.set(0.5, 0.5)
        // 设置旋转角度 
        texture.rotation = 30 * Math.PI / 180;
        let polygons = new vjmap3d.PolygonsEntity({ //PolygonsEntity
            data: data,
            style: {
                vertexColors: false,
                map: texture
            },
            highlightStyle: {
                color: "#0D2547" // 高亮时颜色
            }
        })
        polygons.addTo(app)
        
        //
        polygons.pointerEvents = true; // 允许事件交互
        polygons.on("mouseover", e => {
            if (e?.intersection?.faceIndex !== undefined) {
                let itemData = polygons.getItemDataByFaceIndex(e?.intersection?.faceIndex);
                if (itemData && itemData.id) polygons.setItemHighlight(itemData.id, true)
            }
        })
        polygons.on("mouseout", e => {
            polygons.clearHighlight()
        })
    }
    catch (e) {
        console.error(e);
    }
};