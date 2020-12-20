window.onload = function () {
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d");
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;

    const fontSize = 12;
    ctx.font = `${fontSize}px Langar`;
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.lineWidth = 1;
    

    function drawGrid(ctx, color, stepX, stepY) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;

        for (let i = stepX + 0.5; i < canvas.width; i += stepX) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }

        for (let i = stepY + 0.5; i < canvas.height; i += stepY) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
    }

    drawGrid(ctx, "rgb(50, 50, 50)", 10, 10);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    let originX = -(canvas.width / 2);
    let originY = canvas.height / 2;

    let mapData;
    function saveMapData() {
        mapData = ctx.getImageData(originX, originY, -originX, -originY);
    }
    function restoreMapData() {
        ctx.putImageData(mapData, originX, originY);
    }

    function getMousePos(e) {
        let bound = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - bound.left) * (canvas.width / bound.width) + originX,
            y: (e.clientY - bound.top) * (canvas.height / bound.height) - originY
        };
    }

    canvas.addEventListener('mousemove', function (e) {
        let mousePos = getMousePos(e);
        document.getElementById("coordinate").innerHTML = mousePos.x + ',' + mousePos.y;
    }, false);


    // draw map
    function toRadian(degree) {
        degree -= 90;
        degree *= Math.PI / 180;
        return degree;
    }

    function getXY(angle, start_x, start_y, length) {
        angle = toRadian(angle);
        const x = parseInt(start_x + length * Math.cos(angle));
        const y = parseInt(start_y + length * Math.sin(angle));
        return { x: x, y: y };
    }

    function drawIsland(ctx, x, y, text) {
        // draw circle
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(x, y, 5, toRadian(0), toRadian(360));
        ctx.fill();

        //draw name
        ctx.fillStyle = "yellow";
        ctx.textBaseline = "bottom";
        ctx.fillText(text, x, y - 5);

        //draw coordinate
        ctx.fillStyle = "white";
        ctx.textBaseline = "top";
        const coordinate = "(" + x + ", " + y + ")";
        ctx.fillText(coordinate, x, y + 5);
    }

    function drawPath(ctx, angle, start_x, start_y, distance) {

        // draw line
        ctx.strokeStyle = "white";
        let xy = getXY(angle, start_x, start_y, distance);
        let x = xy.x;
        let y = xy.y;
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(x, y);
        ctx.stroke();

        // draw angle sign
        ctx.fillStyle = "white";
        xy = getXY(angle, start_x, start_y, distance / 2);
        x = xy.x;
        y = xy.y;

        let angleBack;
        if (angle >= 180) {
            angleBack = angle - 180;
        } else {
            angleBack = angle + 180;
        }

        let text1, text2;
        if (x > start_x) {
            text1 = `${angle} >`;
            text2 = `${angleBack} <`;
        } else if (x < start_x) {
            text1 = `${angle} <`;
            text2 = `${angleBack} >`;
        } else if (y > start_y) {
            text1 = `${angle} >`;
            text2 = `${angleBack} <`;
        } else {
            text1 = `${angle} <`;
            text2 = `${angleBack} >`;
        }

        ctx.translate(x, y);
        ctx.rotate(toRadian(Math.min(angle, angleBack)));
        ctx.textBaseline = "bottom";
        ctx.fillText(text1, 0, 0);
        ctx.textBaseline = "top";
        ctx.fillText(text2, 0, 0);
        ctx.rotate(-toRadian(Math.min(angle, angleBack)));
        ctx.translate(-x, -y);
    }

    drawIsland(ctx, 0, 0, "START");
    drawPath(ctx, 104, 0, 0, 100);

};