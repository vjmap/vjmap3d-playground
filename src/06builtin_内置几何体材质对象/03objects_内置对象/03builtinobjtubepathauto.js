
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/03builtinobjtubepathauto
        // --自动生成三维管道--根据图中的数据或自定义数据自动生成三维管道
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: {
                    visible: true, // 网格大小（宽高）
                    args: [1000, 1000],
                    // 网格线单元格大小
                    cellSize: 10,
                    // 网格线单元格分组大小
                    sectionSize: 100
                } // 是否显示坐标网格
            },
            control: {
                initState: {
                    cameraTarget: new THREE.Vector3(207, 0, 35),
                    cameraPosition: new THREE.Vector3(121, 60, 68)
                }
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let texture = new THREE.TextureLoader().load(env.assetsPath + "textures/diffuse.jpg", () => {
            texture.wrapS = THREE.RepeatWrapping;
        });
        let outMaterial = new THREE.MeshPhongMaterial({
            color: 0x7dffeb,
            map: texture,
            side: THREE.FrontSide
        });
        let texture2 = new THREE.TextureLoader().load(env.assetsPath + "textures/uv_grid_opengl.jpg", () => {
            texture2.wrapS = THREE.RepeatWrapping;
        });
        let innerMaterial = new THREE.MeshPhongMaterial({
            color: 0x7dffeb,
            map: texture2,
            side: THREE.FrontSide
        });
        
        // 从图中获取三维坐标数据，也可以直接给坐标
        let mapid = "sys_tube"
        let style = await app.svc.createStyle({
            backcolor: 0,
        }, mapid, "v1")
        let tubeDatas = [];
        let query = await app.svc.conditionQueryFeature({
            mapid: mapid,
            version: "v1",
            layer: style.stylename,
            geom: true,
            condition: `name='2' or name='4'`,// 查找有高程值的多段线和三维多段线
            fields: "objectid,points,elevation",
            limit: 100000
        });
        let results = query.result;
        let box3d = new THREE.Box3();
        let allPts = []
        
        let lineDatas = []
        if (results && results.length > 0) {
            for(let n = 0; n < results.length; n++) {
                let linePoints =  results[n].points.split(";").map(p => vjmap3d.GeoPoint.fromString(p));
                // @ts-ignore
                linePoints = linePoints.map(p => vjmap3d.toVector3([p.x, p.z ?? results[n].elevation ?? 0, p.y]));
        
                lineDatas.push(linePoints)
        
                 // 记录下所有点坐标，用来计算范围
                allPts.push(...linePoints)
        
                tubeDatas.push({
                    paths: linePoints,
                    name:  results[n].objectid
                })
            }
        }
        
        
        // 获取数据范围
        box3d.setFromPoints(allPts)
        
        // 计算中心点
        let center = box3d.min.clone().add(box3d.max).multiplyScalar(0.5);
        
        // 因为业务数据有可能坐标很大或很小，所以对整个应用根据坐标范围对坐标进行一个平移和缩放
        app.centerOrigin = new THREE.Vector3(center.x, box3d.min.y, center.z);
        // 根据最大距离，缩放至宽度为500左右
        let dist = Math.max(box3d.max.x - box3d.min.x, box3d.max.z - box3d.min.z);
        app.scaleOrigin = 500 / dist;
        
        // 根据设置的平移和缩放量，重新计算下坐标
        for(let p of tubeDatas ) {
            p.paths = p.paths.map(t => vjmap3d.toWorld(t.toArray()).toArray())
        }
        
        let tubeEntity;
        let cancelActionCb;
        const createTubeEntity = (data, sect) => {
            if (tubeEntity) {
                // 如果之前实体创建了，先删除
                tubeEntity.entity.remove();
                tubeEntity = null;
            }
            if (cancelActionCb) {
                // 如果之前设置了纹理流动,先取消了
                cancelActionCb()
                cancelActionCb = null;
            }
            let opts = {
                data: data,
                // data: [
                //     {
                //         paths: [
                //             [3, 0, 2],
                //             [-10, 1.5, -5],
                //             [-12, 1.8, 3],
                //             [-5, 2, 4]
                //         ],
                //         name: "path1"
                //     },
                //     {
                //         paths: [
                //             [3, 0, 2],
                //             [12, 1.5, -3],
                //             [15, 3, 4]
                //         ],
                //         name: "path2"
                //     },
                //     {
                //         paths: [
                //             [2, 2, 10],
                //             [-1, 3, 11],
                //             [3, 0, 2]
                //         ],
                //         name: "path3"
                //     }
                // ,{
                //     paths: [
                //         [3, 5, 2],
                //         [3, 0, 2]
                //     ]
                // }
                // ],
                nodeRadius: 0.5,
                innerSideMaterial: innerMaterial,
                outerMaterial: outMaterial,
                sect: sect ?? {
                    shape: "arch",
                    rectWidth: 1,
                    rectHeight: 0.5
                },
                /** 建立拓扑关系策略（默认nodeIntersect） nodeIntersect 一条管道的始末节点与另一条相交时，自动把另一条拆成多段建立拓扑。nodeEqual 一条管道的始末节点与另一条管道的始末节点相等时建立拓扑，不会自动拆分 */
                topoStrategy: "nodeIntersect"
            }
            let pathTube = new vjmap3d.PathTubeEntities(opts);
            pathTube.addTo(app);
            // 
            for(let n = 0; n < pathTube.entity.childrens.length; n++) {
                let ent = pathTube.entity.childrens[n];
                ent.add(vjmap3d.EventModule, {
                    clickHighlight: true,
                    highlightOpacity: 0.2,
                    hoverSelect: true,
                    // @ts-ignore
                    hoverHtmlText: ent.node.isNode ? 
                   `节点：关联${ent.node.userData.dataIndexs} 条路径`:
                   pathTube.data[ent.node.userData.dataIndex].name,
                    popupOptions: {
                        anchor: "bottom"
                    }
                });
            }
        
            tubeEntity = pathTube;
        }
        
        createTubeEntity(tubeDatas)
        
        
        let marker2ds = []
        const showSectCoordMarker = (pt) => {
            if (!tubeEntity) return;
            if (marker2ds.length > 0 ) {
                marker2ds.forEach(m => m.remove());
                marker2ds = [];
            }
            let pts = tubeEntity.getSectPoints(pt);
            if (!pts) return;
            let points = [pts.posBase, pts.posLeft, pts.posLeftTop, pts.posTop, pts.posRightTop, pts.posRight]
            let clr = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"]
            for(let p  = 0; p < points.length; p++) {
                let marker2d = new vjmap3d.Marker2D({
                    color: clr[p],
                    allowOverlap: true
                });
                marker2d.setPosition(points[p]);
                marker2d.addTo(app);
                marker2ds.push(marker2d)
            }
        }
        // 鼠标控件
        let mousePositionControl = new vjmap3d.MousePositionControl({
            UnProjectModes: app.isMapMode ? [true] : [true],
            labelFormat: (x, y, z, _, retIntersectObject) => {
                let cad = vjmap3d.fromWorld([x, y, z]);
                return `${cad[0].toFixed(4)}, ${cad[2].toFixed(4)}, ${cad[1].toFixed(4)}`;
            }
        });
        app.addControl(mousePositionControl, "bottom-right");
        
        const ui = await app.getConfigPane({ title: "设置", style: { width: "250px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.addButton("拱形断面", () => {
            createTubeEntity(tubeDatas, {
                shape: "arch"
            })
        })
        gui.addButton("矩形断面", () => {
            createTubeEntity(tubeDatas, {
                shape: "rect"
            })
        })
        gui.addButton("矩形没顶面", () => {
            createTubeEntity(tubeDatas, {
                shape: "rectNoTop"
            })
        })
        gui.addButton("圆形断面", () => {
            createTubeEntity(tubeDatas, {
                shape: "circle"
            })
        })
        
        
        gui.addButton("纹理流动", () => {
            if (cancelActionCb) return;
            cancelActionCb = tubeEntity?.entity.addAction(() => {
                texture.offset.x += 0.02;
                texture2.offset.x += 0.02
            })
        })
        
        gui.addButton("纹理不流动", () => {
            if (!cancelActionCb) return;
            cancelActionCb()
            cancelActionCb = null;
        })
        
        
        gui.addButton("获取断面坐标", async () => {
            
            await app.actionDrawPoint({
                unprojectOpts: true, // 用场景中的数据来进行坐标投影
                updateCoordinate: pt => showSectCoordMarker(pt.toArray())
            })
            if (marker2ds.length > 0 ) {
                marker2ds.forEach(m => m.remove());
                marker2ds = [];
            }
        })
        
        let outMaterialShortestPath;
        let tubeShortestPath;
        let startMarker2d, endMarker2d;
        const showShortPath = (startPoint, endPoint) => {
            if (tubeShortestPath) {
                tubeShortestPath.remove()
            }
            if (!outMaterialShortestPath) {
                // 创建一个最短路径高亮的材质
                outMaterialShortestPath = new THREE.MeshPhongMaterial({
                    color: 0x00ff00,
                    map: texture,
                    side: THREE.FrontSide
                });
            }
        
            let sp = vjmap3d.findShortestPath(startPoint, endPoint,
                tubeEntity.inputData.map(d => ({
                    points: d.paths
                }))
            );
          
            let opts = {
                data: [
                    {
                        paths: sp.route,
                        name: "path1"
                    }
                ],
                nodeRadius: 0.5,
                innerSideMaterial: innerMaterial,
                outerMaterial: outMaterialShortestPath,
                // 断面比原来的稍大点
                sect: {
                    shape: "arch",
                    rectWidth: 1.2,
                    rectHeight: 0.6
                },
                /** 建立拓扑关系策略（默认nodeIntersect） nodeIntersect 一条管道的始末节点与另一条相交时，自动把另一条拆成多段建立拓扑。nodeEqual 一条管道的始末节点与另一条管道的始末节点相等时建立拓扑，不会自动拆分 */
                topoStrategy: "nodeEqual"
            }
            tubeShortestPath = new vjmap3d.PathTubeEntities(opts);
            tubeShortestPath.addTo(app);
        }
        
        // 移除最短路径
        const removeShortestPath = () => {
            if (startMarker2d) {
                startMarker2d.remove();
                startMarker2d = null;
            }
            if (endMarker2d) {
                endMarker2d.remove();
                endMarker2d = null;
            }
            if (tubeShortestPath) {
                tubeShortestPath.remove();
                tubeShortestPath = null;
            }
           
        }
        
        gui.addButton("查找最短路径", async () => {
            removeShortestPath();
        
            app.logInfo("请指定路径的开始点位置")
            let startPoint1 = await app.actionDrawPoint({
                unprojectOpts: true, // 用场景中的数据来进行坐标投影
            })
            if (startPoint1.isCancel) return;
        
        
            startMarker2d = new vjmap3d.Marker2D({
                color: 'red',
                allowOverlap: true
            });
            startMarker2d.setPosition(startPoint1.data.position);
            startMarker2d.addTo(app);
        
            app.logInfo("请指定路径的结束点位置")
            let endPoint1 = await app.actionDrawPoint({
                unprojectOpts: true, // 用场景中的数据来进行坐标投影
            })
            if (endPoint1.isCancel) return;
        
            endMarker2d = new vjmap3d.Marker2D({
                color: 'yellow',
                allowOverlap: true
            });
            endMarker2d.setPosition(endPoint1.data.position);
            endMarker2d.addTo(app);
        
            showShortPath(startPoint1.data.position, endPoint1.data.position)
        })
        
        gui.addButton("删除最短路径", async () => {
            removeShortestPath();
        });
        
        gui.toJson().forEach(c => ui.appendChild(c));
        
        
    }
    catch (e) {
        console.error(e);
    }
};