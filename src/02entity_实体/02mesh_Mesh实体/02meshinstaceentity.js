
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/mesh/02meshinstaceentity
        // --实例化Mesh实体--批量化创建Mesh实体
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
        // 生成资源加载生成一个mesh
        let mesh = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/car.glb", {
            toEntity: false
        });
        // 根据这个mesh生成多个实例对象。这里模拟生成10000个
        let instances = [];
        for(let i = 0; i < 100; i++) {
            for(let j = 0; j < 100; j++) {
                instances.push({
                    position: new THREE.Vector3(i - 50, 0, j - 50),
                    rotation: new THREE.Vector3(0, Math.random() * Math.PI, 0),
                    scale: Math.random() * 0.5 + 0.5,
                    color: vjmap3d.randColor(),
                    card: j * 100 + i
                })
            }
        }
        // 创建mesh实例化对象
        let instanceMesh = new vjmap3d.InstancedMeshEntity({
            mesh: mesh,
            maxCapacity: 100 * 100,
            instances
        })
        instanceMesh.addTo(app)
        //
        // 设置实体能响应鼠标事件
        instanceMesh.pointerEvents = true;
        let index; // 当前鼠标在的数组索引
        let popup;
        const cancelSelect = () => {
            // 取消之前的选择
            if (index !== undefined) {
                // 取消之前的高亮
                instanceMesh.setInstanceHighlight(index, null)
                //instanceMesh.setInstanceSelected(index, false)  // 用选择的话，用这个，不用上面的
            }
            if (popup) {
                popup.remove();
                popup = null;
            }
        }
        instanceMesh.on("mouseover", e => {
            cancelSelect();
            if (e.intersection.object.isInstancedMesh) {
                // 获取当前的数组索引
                index = e.intersection.instanceId;
                // 设置高亮
                instanceMesh.setInstanceHighlight(index, "#777");
                //instanceMesh.setInstanceSelected(index, true); // 用选择的话，用这个，不用上面的
                let box3d = instanceMesh.getInstanceBox3(instanceMesh.getIdByIndex(index));
                if (!popup) {
                popup = new vjmap3d.Popup2D({
                    backgroundColor: "#A0FFA0",
                    closeButton: false
                })
                popup.addTo(app);
                }
                let position = vjmap3d.getObjectAnchorPoint(box3d, 'middle-top');
                popup.setPosition(position); // 设置位置 
                popup.setHTML(`第 ${instances[index].card} 辆`);
            } 
        })
        instanceMesh.on("mouseout", e => {
            cancelSelect();
        })
        
    }
    catch (e) {
        console.error(e);
    }
};