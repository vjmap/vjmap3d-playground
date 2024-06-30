
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/08builtinobjmeasureruler
        // --测量标尺--
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
        {
            let lineStart = new THREE.Vector3(-3, 0, -6);
            let lineEnd = new THREE.Vector3(2, 0, 3);
            vjmap3d.creataMeasureRuler(app, {
                startPoint: lineStart,
                endPoint: lineEnd
            })
        }
        {
            let lineStart = new THREE.Vector3(5, 0, 5);
            let lineEnd = new THREE.Vector3(5, 5, 5);
            vjmap3d.creataMeasureRuler(app, {
                startPoint: lineStart,
                endPoint: lineEnd,
                planePoint: [4, 0, 5],
                showTextCb(ptStart, ptEnd, dist, fractionDigits) {
                    return `${dist.toFixed(fractionDigits ?? 2)} 米`
                },
            })
        }
        {
            let lineStart = new THREE.Vector3(-17, 0, -6);
            let lineEnd = new THREE.Vector3(-3, 6, -19);
            let ent = vjmap3d.creataMeasureRuler(app, {
                startPoint: lineStart,
                endPoint: lineEnd,
                textAngleCb(ptStart, ptEnd, quat) {
                    return [{
                        axis: "x",
                        angle: Math.PI
                    }]
                }
            })
        }
        const ui = await app.getConfigPane({ title: "绘制", style: { width: "250px"}});
        ui.appendChild({
            type: "button",
            label: '绘制标尺',
            value: async ()=>{
                let line = await app.actionDrawLineSting({
                    pointMaxCount: 2
                });
                if (line.isCancel) return;
                let lineClr = vjmap3d.randColor();
                let arrowClr = vjmap3d.randColor();
                let txtClr = vjmap3d.randColor();
                let sideLineClr = vjmap3d.randColor();
                let ruler = vjmap3d.creataMeasureRuler(app, {
                    startPoint: line.data.coordinates[0],
                    endPoint: line.data.coordinates[1],
                    rulerLineStyle: {
                        color: lineClr,
                    },
                    arrowStyle: {
                        color: arrowClr,
                    },
                    sideLineStyle: {
                        color: sideLineClr
                    },
                    textStyle: {
                        color: txtClr,
                        billboard: false
                    }
                })
            }
        })
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};