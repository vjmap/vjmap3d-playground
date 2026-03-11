
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/loader/00resourcemodelviewer
        // -- Model viewer: drag and drop model into scene to view
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true }, // Whether to show grid helper
    },
    stat: {
        show: true,
        left: "0"
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    }
})
// Load plugin
await vjmap3d.ResManager.loadExtensionLoader();
await vjmap3d.ResManager.loadExtensionIfcLoader();

// Drag and drop support
const dropZone = document.getElementById('map');
// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('dragover');
    }, false);
});

// Handle dropped files
dropZone.addEventListener('drop', handleDrop, false);

app.logInfo("Drag model into scene. W=translate, E=rotate, R=scale, X/Y/Z=toggle axis; right-click or Enter to finish", "success", 30000)
async function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    // Get file extension
    let ext = files[0].name.substring(files[0].name.indexOf(".") + 1).toLowerCase()
    // Only handle the first file for this example
    if (files.length > 0) {
        const file = files[0];
        const url = URL.createObjectURL(file);
        
        let ent = await vjmap3d.ResManager.loadModel(url, {
            splitSubEntity: true,
            size:  5,
            //anchor: "front-bottom",
            position: app.unproject(e.x, e.y), // Drop position
            fileType: ext
        });
        ent.addTo(app);

        // Property panel
        const ui = await app.getConfigPane()
        ui.setVisible(true);
        let config = vjmap3d.makeObject3DUiConfig(ent.node)
        ui.appendChild(config)

        // Edit
        let options = {
            target: ent.node,
            clickNoSelfEntityExit: false,
            clickNoEntityExit: false, 
            rightClickConfirmExit: true // Right-click to exit edit
        }
        await app.transformObject(options)

        ui.setVisible(false);
    }
} 


    }
    catch (e) {
        console.error(e);
    }
};