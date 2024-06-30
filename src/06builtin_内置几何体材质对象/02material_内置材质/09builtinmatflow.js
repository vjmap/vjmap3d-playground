
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/material/09builtinmatflow
        // --移动的纹理材质--
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
        let width = 10, height = 5;
        const geometry = new THREE.PlaneGeometry(width, height)
        let ArrowRight = vjmap3d.render2d.Path.extend({
            type: "arrowRight",
            shape: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            buildPath(ctx, shape) {
                let x = shape.x;
                let y = shape.y;
                let height = shape.height;
                let width = shape.width;
                // @ts-ignore
                let x1 = parseInt(x + width - 36);
                // @ts-ignore
                let y1 = parseInt(y + height / 5);
                // @ts-ignore
                let y2 = parseInt(y + (height / 5) * 4);
                ctx.moveTo(x, y1);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x1, y);
                ctx.lineTo(x + width, y + height / 2);
                ctx.lineTo(x1, y + height);
                ctx.lineTo(x1, y2);
                ctx.lineTo(x, y2);
                ctx.closePath();
            }
        });
        let arrows = []
        for(let i = 0; i < 5; i++) {
            arrows.push(new ArrowRight({
                // @ts-ignore
                shape: {
                    x: 0,
                    y: i * 100,
                    cx: 250,
                    cy: 25,
                    width: 50,
                    height: 60
                },
                style: {
                    fill: "#00ffff"
                }
            }));
        }
        let mat = vjmap3d.createRenderElementFlowMaterial(app, {
            geometryWidth: width,
            geometryHeight: height,
            flowDirection: "horizon",
            flowSpeed: -0.1,
            element: [
                new vjmap3d.render2d.Rect({
                    shape: {
                        x: 0,
                        y: 0,
                        width: 1000,
                        height: 1000 * height / width
                    },
                    style: {
                        fill: "#00023D"
                    }
                }),
                ...arrows
            ]
        });
        let mesh = new THREE.Mesh(geometry, mat);
        app.scene.add(mesh);
        
    }
    catch (e) {
        console.error(e);
    }
};