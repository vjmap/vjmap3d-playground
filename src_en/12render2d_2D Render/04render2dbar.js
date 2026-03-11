
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/render2d/04render2dbar
        // -- 2D bar chart --
let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
let app = new vjmap3d.App(svc, {
    container: "map", // Container id
    scene: {
        gridHelper: { visible: true } // Whether to show grid helper
    },
    camera: {  // Camera settings
        viewHelper: { enable: true, position: "leftBottom" } // Whether to show view helper
    },
    control: { leftButtonPan: true } // Left rotate, right pan
})
let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg2.png");
let elements = [];
// Add image as background
elements.push(new vjmap3d.render2d.Image({
    style: {
        x: 0,
        y: 0,
        image: image,
        width: 400, // Pixel width
        height: 400 // Pixel height
    }
}))

 // Monthly temperature data
 var temperatureData = [2, 5, 10, 15, 20, 25, 26, 28, 22, 16, 10, 5];

 // Chart config
 var barWidth = 20;
 var barGap = (400 - 12 * barWidth) / 13; // Bar gap
 var baseHeight = 300;
 var axisHeight = 20;
 var axisMargin = 10;
 var colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#D4A373', '#B7E4C7', '#C44536'];
 var duration = 1000;

 // X axis
 var xAxis = new vjmap3d.render2d.Line({
     shape: {
         x1: 0,
         y1: baseHeight + axisMargin,
         x2: 400,
         y2: baseHeight + axisMargin
     },
     style: {
         stroke: '#000',
         lineWidth: 2
     }
 });
 elements.push(xAxis);

 // Bars and animation
 temperatureData.forEach(function (temp, index) {
     var rect = new vjmap3d.render2d.Rect({
         shape: {
             x: (index + 1) * barGap + index * barWidth,
             y: baseHeight,
             width: barWidth,
             height: 0 // Initial height
         },
         style: {
             fill: colors[index % colors.length]
         }
     });

     elements.push(rect);

     // Animation
     rect.animate('shape', false)
         .when(duration, {
             y: baseHeight - temp * 10,
             height: temp * 10
         })
         .start();

     // Interaction
     rect.on('mouseover', function () {
         rect.attr({
             style: {
                 fill: 'rgba(255,0,0,0.5)'
             }
         });
         app.setCursor("pointer")
     });

     rect.on('mouseout', function () {
         rect.attr({
             style: {
                 fill: colors[index % colors.length]
             }
         });
         app.setCursor("")
     });

     rect.on('click', function () {
        app.logInfo('Temperature in ' + months[index] + ': ' + temp + '°C', "success")
     });
 });

 // Month labels
 var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
 months.forEach(function (month, index) {
     var text = new vjmap3d.render2d.Text({
         style: {
             text: month,
             x: (index + 1) * barGap + index * barWidth + barWidth / 2,
             y: baseHeight + axisHeight + axisMargin,
             textAlign: 'center',
             textVerticalAlign: 'top',
             fontSize: 14,
             fill: '#000'
         }
     });
     elements.push(text);
 });
// Use via canvas
let canvas = document.createElement("canvas");
canvas.width = 400;
canvas.height = 400;
let render = vjmap3d.render2d.init(canvas);
let group = new vjmap3d.render2d.Group();
render.add(group);
for(let n = 0; n < elements.length; n++) {
    group.add(elements[n])
}
let marker = new vjmap3d.Marker2D({
    element: canvas,
    anchor: "bottom"
})
marker.setPosition(0, 0, 5);
marker.addTo(app);
    


    }
    catch (e) {
        console.error(e);
    }
};