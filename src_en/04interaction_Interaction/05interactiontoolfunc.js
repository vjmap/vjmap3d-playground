
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
        // -- Draw, edit, pick functions --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    stat: { show: true, left: "0" },
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
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
const ui = await app.getConfigPane({ title: "Tools", style: { width: "250px"}});
let gui = new vjmap3d.UiPanelJsonConfig();
gui.addButton("Transform first entity", async () => {
    app.logInfo("Press Enter to confirm, ESC to cancel")
    let options = {
        target: firstEntity.node,
        clickNoSelfEntityExit: false,
        clickNoEntityExit: false,
        transformSize: 1,
    }
    let res = await app.transformObject(options)
    console.log(res)
    app.logInfo("Transform done", "success")
})
gui.addButton("Select multiple to transform", async () => {
    app.logInfo("Left-click to select, right-click to confirm")
    app.setCurrentTool(); // Cancel previous tool
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
                // Reset
                positions = entities.map(p => p.position.clone())
            } else if (param.isOnceFinish && param.command) {
                // Done once, add command
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
gui.addButton("Custom draw polygon", async () => {
    app.logInfo("Ctrl+I to enter coords, right-click for menu", 5000)
    let lastPoint;
    let polygon = await app.actionDrawPolygon({
        isAddToApp: true,
        //pointMaxCount: 3, // End after 3 points
        updateCoordinate(point, isMoveing, data) {
            let text;
            text = `Position: ${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}`
            if (!isMoveing) {
                lastPoint = point;
            }
            if (lastPoint) {
                text += `
Distance from last: ${point.distanceTo(lastPoint).toFixed(2)}`
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
                let info = prompt("Enter coords, format x,y,z e.g. 10,0,20");
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
                        label: 'Cancel',
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
        app.logInfo("Draw cancelled", "warn")
    } else {
        app.logInfo("Draw complete", "success")
    }
});
gui.addButton("Edit first polygon", async () => {
    let res = await app.actionDrawEdit({
        editEntity: app.getDrawLayer()?.polygons(),
        editIndex: 0,
        //editShowVertex: false,
        onUnEditEntity(ent, ctx) {
            ctx.complete()
        }
    })
    console.log(res)
    app.logInfo("Edit complete", "success")
});
gui.addButton("Show/hide first polygon", async () => {
    let  polygons = app.getDrawLayer()?.polygons()
    let data = polygons.getData()
    data[0].hidden = !data[0].hidden;
    polygons.setData(data)
});
gui.addButton("Delete first polygon", async () => {
    let  layer = app.getDrawLayer()
    layer.deletePolygonData({
        id: "0",
        coordinates: []
    })
});
gui.addButton("Update first polygon coords", async () => {
    let  layer = app.getDrawLayer()
    layer.updatePolygonData({
        id: "0",
        coordinates: [vjmap3d.randPoint3D(),vjmap3d.randPoint3D(), vjmap3d.randPoint3D()]
    })
});
gui.addButton("Edit coords at given position", async () => {
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
    app.logInfo("Done", "success")
});
gui.addButton("Select object to delete", async () => {
    app.logInfo("Select object to delete, right-click to delete")
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
gui.addButton("Select and move object", async () => {
    app.logInfo("Select object (right-click to confirm), Ctrl+I to enter position", 5000)
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
                let info = prompt("Enter coords, format x,y,z e.g. 10,0,20");
                let pts = info?.split(",").map(p => +p);
                // @ts-ignore
                context.addPoint(new THREE.Vector3().fromArray(pts))
            }
        }
    })
    ent.selected = false;
    if(ptRes.isCancel) {
        ent.position.copy(pos)
        app.logInfo("Cancelled", "warn")
    } else {
        app.logInfo("Done", "success")
    }
});
gui.addButton("Draw rectangle", async () => {
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


const sendKeyUp = (keyCode) => {
    let mod = app.getModule(vjmap3d.InputModule)
    mod.manager.dispatch(null, {
        type: "keyup",
        originalEvent: {
            keyCode: keyCode
        }
    })
}
// To cancel pick (e.g. on button click), send ESC
// sendKeyUp(27) // Send ESC
    }
    catch (e) {
        console.error(e);
    }
};