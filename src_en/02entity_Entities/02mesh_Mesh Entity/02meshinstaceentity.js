
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
        // -- Instanced mesh entity -- Batch create mesh entities
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    stat: {
        show: true,
        left: "0"
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
// Load a mesh from resources
let mesh = await vjmap3d.ResManager.loadModel(env.assetsPath + "models/car.glb", {
    toEntity: false
});
// Create multiple instances from this mesh (simulate 10000)
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
// Create instanced mesh entity
let instanceMesh = new vjmap3d.InstancedMeshEntity({
    mesh: mesh,
    maxCapacity: 100 * 100,
    instances
})
instanceMesh.addTo(app)
//
// Enable entity to respond to mouse events
instanceMesh.pointerEvents = true;
let index; // Current array index under mouse
let popup;
const cancelSelect = () => {
    // Clear previous selection
    if (index !== undefined) {
        // Clear previous highlight
        instanceMesh.setInstanceHighlight(index, null)
        //instanceMesh.setInstanceSelected(index, false)  // Use this for selection mode
    }
    if (popup) {
        popup.remove();
        popup = null;
    }
}
instanceMesh.on("mouseover", e => {
    cancelSelect();
    if (e.intersection.object.isInstancedMesh) {
        // Get current array index
        index = e.intersection.instanceId;
        // Set highlight
        instanceMesh.setInstanceHighlight(index, "#777");
        //instanceMesh.setInstanceSelected(index, true); // Use this for selection mode
        let box3d = instanceMesh.getInstanceBox3(instanceMesh.getIdByIndex(index));
        if (!popup) {
        popup = new vjmap3d.Popup2D({
            backgroundColor: "#A0FFA0",
            closeButton: false
        })
        popup.addTo(app);
        }
        let position = vjmap3d.getObjectAnchorPoint(box3d, 'middle-top');
        popup.setPosition(position); // Position
        popup.setHTML(`Vehicle #${instances[index].card}`);
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