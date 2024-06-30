
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/interaction/05interactiontoolfunc
        // --绘图编辑拾取函数--
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
        let firstEntity;
        for(let i = 0; i < 3; i++) {
            let box = new THREE.BoxGeometry(Math.random() * 3 + 0.5, Math.random() * 3 + 0.5, Math.random() * 3 + 0.5)
            const material = new THREE.MeshStandardMaterial({
                color: vjmap3d.randColor()
            });
            let mesh = new THREE.Mesh(box, material);
            mesh.position.copy(vjmap3d.toVector3(vjmap3d.randPoint3D({maxX: 5, maxY: 2, maxZ: 5, minX: -5, minY: -2, minZ: -5})))
            let entity = vjmap3d.Entity.fromObject3d(mesh);
            entity.addTo(app);
            if (i == 0) firstEntity = entity;
        }
        const ui = await app.getConfigPane({ title: "工具", style: { width: "250px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.addButton("第一个实体变换", async () => {
            app.logInfo("请按Enter确定，或ESC取消操作")
            let options = {
                target: firstEntity.node,
                clickNoSelfEntityExit: false,
                clickNoEntityExit: false,
                transformSize: 1,
            }
            let res = await app.transformObject(options)
            console.log(res)
            app.logInfo("实体变换操作完成", "success")
        })
        gui.addButton("选择多个进行变换", async () => {
            app.logInfo("请左键选择要变换的对象，右键结束确定选择")
            app.setCurrentTool(); // 取消之前的工具操作
            let res = await app.pickEntity({
                rightClickConfirm: true,
                highlightUseBoxHelper: true
            });
            if (res.entities?.length == 0) return;
            let entities = res.entities || [];
            let positions = entities.map(p => p.position.clone())
            let options = {
                target: entities[entities.length - 1].position,
                pressEKeyModeRotate: false,
                pressRKeyModeScale: false,
                clickEntityAttach: false,
                clickNoSelfEntityExit: false,
                clickNoEntityExit: false,
                rightClickConfirmExit: true,
                editAsCommand: true,
                dragCallBack: (param) => {
                    if (param.isReset) {
                        // 重新开始了
                        positions = entities.map(p => p.position.clone())
                    } else if (param.isOnceFinish && param.command) {
                        // 一次完成，加入命令
                        for(let n = 0; n < entities.length; n++) {
                            param.command.addCommand(new vjmap3d.SetPositionCommand(entities[n].node, entities[n].position, positions[n]));
                        }
                    }
                    res.entities?.forEach(ent => {
                      ent.position.add(param.deltaPosition)
                    })
                    for(let n = 0; n < entities.length; n++) {
                        entities[n].position.copy(positions[n].clone().add(param.deltaPosition));
                    }
                },
                // onExitCallBack(node, context) {
                //     if (node.id != "edit") return;
                //     app.setCurrentTool()
                // },
            }
            await app.transformObject(options)
            res.clearHighlight();
        })
        gui.addButton("自定义绘制多边形", async () => {
            app.logInfo("绘制过程中按 Ctrl+I 输入坐标，右键弹出菜单", 5000)
            let lastPoint;
            let polygon = await app.actionDrawPolygon({
                isAddToApp: true,
                //pointMaxCount: 3, // 三个点结束
                updateCoordinate(point, isMoveing, data) {
                    let text;
                    text = `当前坐标：${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}`
                    if (!isMoveing) {
                        lastPoint = point;
                    }
                    if (lastPoint) {
                        text += `
        距离上一个点: ${point.distanceTo(lastPoint).toFixed(2)}`
                    }
                    app.popup2d.show()
                    app.popup2d.setHTML(text)
                    app.popup2d.setPosition(point)
                },
                onKeyUp(info, context) {
                    let isCtrl = vjmap3d.isCtrlKeyDown(info);
                    let keyCode = vjmap3d.eventKeyCode(info) ;
                    if (isCtrl && keyCode == 73) {
                        // Ctrl + I
                        let info = prompt("请输入坐标，格式x,y,z如 10,0,20");
                        let pts = info?.split(",").map(p => +p);
                        // @ts-ignore
                        context.addPoint(new THREE.Vector3().fromArray(pts))
                    }
                },
                onContextMenu(info, context) {
                    new vjmap3d.ContextMenu({
                        // @ts-ignore
                        event: info.event.originalEvent,
                        theme: "dark", //light
                        width: "250px",
                        items: [
                            {
                                label: '取消',
                                onClick: () => {
                                        context.cancel()
                                }
                            }
                        ]
                    });
                },
                onComplete() {
                    app.popup2d.hide()
                }
            })
            console.log(polygon)
            if (polygon.isCancel) {
                app.logInfo("取消绘制", "warn")
            } else {
                app.logInfo("绘制完成", "success")
            }
        });
        gui.addButton("编辑绘制的第一个多边形", async () => {
            let res = await app.actionDrawEdit({
                editEntity: app.getDrawLayer()?.polygons(),
                editIndex: 0,
                //editShowVertex: false,
                onUnEditEntity(ent, ctx) {
                    ctx.complete()
                }
            })
            console.log(res)
            app.logInfo("编辑完成", "success")
        });
        gui.addButton("第一个多边形显示或隐藏", async () => {
            let  polygons = app.getDrawLayer()?.polygons()
            let data = polygons.getData()
            data[0].hidden = !data[0].hidden;
            polygons.setData(data)
        });
        gui.addButton("删除第一个多边形", async () => {
            let  layer = app.getDrawLayer()
            layer.deletePolygonData({
                id: "0",
                coordinates: []
            })
        });
        gui.addButton("更新第一个多边形坐标", async () => {
            let  layer = app.getDrawLayer()
            layer.updatePolygonData({
                id: "0",
                coordinates: [vjmap3d.randPoint3D(),vjmap3d.randPoint3D(), vjmap3d.randPoint3D()]
            })
        });
        gui.addButton("给定坐标进行编辑坐标", async () => {
            let data = [];
            data.push({
                coordinates: [vjmap3d.randPoint3D(), vjmap3d.randPoint3D(), vjmap3d.randPoint3D()],
                color: "#00ff00",
                lineWidth: 3,
                dashScale: 2,
                dashOffset: 0,
                dashSize: 3,
                gapSize: 3,
                dashed: true
            })
            let polylines = new vjmap3d.PolylinesEntity({
                data: data
            })
            polylines.addTo(app)
            await app.actionDrawEdit({
                editEntity: polylines,
                queryEntities: [polylines],
                editIndex: 0,
                onUnEditEntity(ent, ctx) {
                   ctx.complete()
                }
            })
            console.log(polylines.getData())
            polylines.remove();
            app.logInfo("完成", "success")
        });
        gui.addButton("选择对象进行删除", async () => {
            app.logInfo("选择要删除的对象，按右键进行删除")
            let res = await app.actionPickSelect({
                onPointerMove(info, context, oldHover, newHover) {
                    if (oldHover?.target == newHover?.target) return;
                    if (oldHover?.target) oldHover.target.selected = false;
                    if (newHover?.target) newHover.target.selected = true;
                },
            });
            if (res.isCancel || !res.select) return;
            res.select.target.remove()
        });
        gui.addButton("选择物体移动", async () => {
            app.logInfo("请选择物体，按右键结果选择，移动位置按 Ctrl+I 可输入坐标", 5000)
            let res = await app.actionPickSelect({
                onPointerMove(info, context, oldHover, newHover) {
                    if (oldHover?.target == newHover?.target) return;
                    if (oldHover?.target) oldHover.target.selected = false;
                    if (newHover?.target) newHover.target.selected = true;
                }
            });
            if (res.isCancel || !res.select) return;
            let ent = res.select.target;
            let pos = ent.position.clone()
            let ptRes = await app.actionDrawPoint({
                updateCoordinate(point, isMoveing, data, symbol) {
                    ent.position.copy(point)
                },onKeyUp(info, context) {
                    let isCtrl = vjmap3d.isCtrlKeyDown(info);
                    let keyCode = vjmap3d.eventKeyCode(info) ;
                    if (isCtrl && keyCode == 73) {
                        // Ctrl + I
                        let info = prompt("请输入坐标，格式x,y,z如 10,0,20");
                        let pts = info?.split(",").map(p => +p);
                        // @ts-ignore
                        context.addPoint(new THREE.Vector3().fromArray(pts))
                    }
                }
            })
            ent.selected = false;
            if(ptRes.isCancel) {
                ent.position.copy(pos)
                app.logInfo("取消", "warn")
            } else {
                app.logInfo("完成", "success")
            }
        });
        gui.addButton("绘制矩形", async () => {
            let rect = new vjmap3d.PolylinesEntity({
                data: []
            })
            let ptRes1 = await app.actionDrawPoint();
            console.log(ptRes1)
            if (ptRes1.isCancel) return
            let pt = ptRes1.data.position
            rect.setData([{
                coordinates: [pt, pt, pt, pt, pt]
            }])
            rect.addTo(app)
            let ptRes2 = await app.actionDrawPoint({
                updateCoordinate(point, isMoveing, data, symbol) {
                    let pt2 = [pt[0], pt[1], point.z]
                    let pt3 = point.toArray();
                    let pt4 = [point.x, point.y, pt[2]]
                    rect.setData([{
                        coordinates: [pt, pt2, pt3, pt4, pt]
                    }])
                },
            })
            console.log(ptRes2)
            let data = rect.getData()[0];
            rect.remove()
            if (ptRes2.isCancel) {
                return
            }
            let drawLayer = app.getDrawLayer("", {});
            drawLayer.addPolylineData(data)
        });
        gui.toJson().forEach(c => ui.appendChild(c));
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};