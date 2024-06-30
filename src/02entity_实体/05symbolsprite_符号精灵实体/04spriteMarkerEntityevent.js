
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/04spriteMarkerEntityevent
        // --渲染材质事件效果绘制创建精灵标记实体--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg.png");
        // 创建一个文字按钮1
        let button1 = new vjmap3d.render2d.Text({
            style: {
                x: 40,
                y: 12,
                text: '查看详情',
                fill: "#0ff",
                font: '14px Arial',
                verticalAlign: "top",
                align: "center"
            }
        })
        // 创建一个文字按钮2
        let button2 = new vjmap3d.render2d.Text({
            style: {
                x: 40,
                y: 38,
                text: '点击跳转',
                fill: "#BDFFAB",
                font: '14px Arial',
                verticalAlign: "top",
                align: "center"
            }
        })
        let spriteMarker = new vjmap3d.SpriteMarkerEntity(
        {
            position: [-2, 0, 1], // 位置 
            sizeAttenuation: false, // 固定像素大小，不随相机变化
            anchorX: "center",  // x对齐方式
            anchorY: "bottom", // y对齐方式
            renderTexture: {
                autoCanvasSize: false,
                canvasWidth: 80, // 像素宽，这里是根据底图的像素宽高定的
                canvasHeight: 80, // 像素高，这里是根据底图的像素宽高定的
                sharedCanvas: false,
                elements: [
                    new vjmap3d.render2d.Image({
                        style: {
                            x: 0,
                            y: 0,
                            image: image,
                            width: 80, // 像素宽，这里是图片像素宽高定的
                            height: 80 // 像素高，这里是图片像素宽高定的
                        }
                    }),
                    button1,
                    button2
                ]
            }
        });
        // 响应文字按钮1的相关事件
        button1.on("mouseover", function() {
            button1.attr("style", {
                fill: "#ff0"
            });
            spriteMarker.refreshRenderTexture();
            app.setCursor("pointer")
        });
        button1.on("mouseout", function() {
            button1.attr("style", {
                fill: "#0ff"
            });
            spriteMarker.refreshRenderTexture();
            app.setCursor("")
        });
        button1.on("mouseup", function() {
            app.logInfo("您点击了 查看详情 ", 2000)
        });
        //
        // 响应文字按钮2的相关事件
        button2.on("mouseover", function() {
            button2.attr("style", {
                fill: "#ff0"
            });
            spriteMarker.refreshRenderTexture();
            app.setCursor("pointer")
        });
        button2.on("mouseout", function() {
            button2.attr("style", {
                fill: "#BDFFAB"
            });
            spriteMarker.refreshRenderTexture();
            app.setCursor("")
        });
        button2.on("mouseup", function() {
            app.logInfo("您点击了 点击跳转 ", 2000)
        });
        //
        // 增加spriteMarker至应用
        spriteMarker.addTo(app);
        spriteMarker.pointerEvents = true; // 允许事件交互
        // 响应spriteMarker的相关事件，并且向RenderTexture的元素进行派发事件
        spriteMarker.on("mousemove", e => {
            spriteMarker.dispatchRenderTextureEvent("mousemove", e?.intersection?.uv);
        });
        spriteMarker.on("mouseup", e => {
            spriteMarker.dispatchRenderTextureEvent("mouseup", e?.intersection?.uv);
        });
        spriteMarker.on("mouseout", e => {
            spriteMarker.dispatchRenderTextureEvent("mouseout");
        });
        
    }
    catch (e) {
        console.error(e);
    }
};