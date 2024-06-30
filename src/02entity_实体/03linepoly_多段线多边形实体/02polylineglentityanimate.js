
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/linepoly/02polylineglentityanimate
        // --Gl多段线动画-
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true }, // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        // 动画效果一，分段动画
        {
            let data = [];
            for(let k = 0; k < 100; k++) {
                data.push({
                    color: vjmap3d.randColor(),
                    coordinates: [vjmap3d.randPoint3D({minX: -40, maxX: -10}), vjmap3d.randPoint3D({minX: -30, maxX: 0}), vjmap3d.randPoint3D({minX: -30, maxX: 0})]
                })
            }
            // 
            let gllines = new vjmap3d.GlLinesEntity({ //PolygonsEntity
                data: data
            })
            gllines.addTo(app)
            gllines.bloom = true
            //
            for(let n = 0; n < data.length; n++) {
                data[n].paths = vjmap3d.lineSlice(data[n].coordinates, 2);
                data[n].curIndex = 0;
            }
            setInterval(()=> {
                for(let n = 0; n < data.length; n++) {
                    let item = data[n];
                    item.coordinates = item.paths[item.curIndex]
                    item.curIndex++;
                    if (item.curIndex >= item.paths.length) {
                        item.curIndex = 0
                    }
                }
                gllines.setData(data)
            }, 100)
        }
        // 动画效果二，延伸动画
        {
            let data = [];
            for(let k = 0; k < 20; k++) {
                data.push({
                    color: vjmap3d.randColor(),
                    coordinates: [vjmap3d.randPoint3D({minX: 0, maxX: 30}), vjmap3d.randPoint3D({minX: 0, maxX: 30}), vjmap3d.randPoint3D({minX: 0, maxX: 30})]
                })
            }
            for(let n = 0; n < data.length; n++) {
                data[n].paths = [...data[n].coordinates];
                data[n].curRatio = 0;
                data[n].coordinates = []
            }
            let gllines = new vjmap3d.GlLinesEntity({ //PolygonsEntity
                data: data
            })
            gllines.addTo(app)
            gllines.bloom = true
            setInterval(()=> {
                for(let n = 0; n < data.length; n++) {
                    let item = data[n];
                    item.coordinates = vjmap3d.interpolatePointsByRatio(item.paths, item.curRatio );
                    item.curRatio += 0.01;
                    if (item.curRatio >= 1) {
                        item.curRatio = 0
                    }
                }
                gllines.setData(data)
            }, 100)
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};