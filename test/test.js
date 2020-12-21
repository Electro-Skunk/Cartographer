window.onload = function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const canvasWidth = document.documentElement.clientWidth;
    const canvasHeight = document.documentElement.clientHeight - 56;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.translate(canvasWidth / 2, canvasHeight / 2);

    const fontSize = 12;
    ctx.font = `${fontSize}px Langar`;
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.lineWidth = 1;

    // 캔버스에서 해도 그릴 때 사용하는 함수들
    function toRadian(degree) {
        degree -= 90;
        degree *= Math.PI / 180;
        return degree;
    }

    function getXY(degree, start_x, start_y, distance) {
        radian = toRadian(degree);
        const x = parseInt(start_x + distance * Math.cos(radian));
        const y = parseInt(start_y + distance * Math.sin(radian));
        return {
            x: x,
            y: y
        };
    }

    class Island {
        constructor(x = 0, y = 0, text = "text", color = "green") {
            this.x = x;
            this.y = y;
            this.text = text;
            this.color = color;
        }
        draw() {
            // draw circle
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, 5, toRadian(0), toRadian(360));
            ctx.fill();

            //draw name
            ctx.fillStyle = this.color;
            ctx.textBaseline = "bottom";
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillText(this.text, this.x, this.y - 5);

            //draw coordinate
            ctx.fillStyle = "white";
            ctx.textBaseline = "top";
            const coordinate = "(" + this.x + ", " + this.y + ")";
            ctx.font = `normal ${fontSize}px Arial`;
            ctx.fillText(coordinate, this.x, this.y + 5);
        }
    }
    let a = new Island();
    a.draw();
    console.log(a);

    class Course {
        constructor(degree, startX, startY, distance, departure, destination) {
            this.degree = degree;
            this.startX = startX;
            this.startY = startY;
            this.distance = distance;
            this.departure = departure;
            this.destination = destination;
        }

        draw(degree, startX, startY, distance) {
            // draw line
            ctx.strokeStyle = "white";
            let x = getXY(degree, startX, startY, distance).x;
            let y = getXY(degree, startX, startY, distance).y;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // draw angle sign
            ctx.fillStyle = "white";
            x = getXY(degree, startX, startY, distance / 2).x;
            y = getXY(degree, startX, startY, distance / 2).y;

            let degreeBack;
            if (degree >= 180) {
                degreeBack = degree - 180;
            } else {
                degreeBack = degree + 180;
            }

            let text1, text2;
            if (x > startX) {
                text1 = `${degree} >`;
                text2 = `${degreeBack} <`;
            } else if (x < startX) {
                text1 = `${degree} <`;
                text2 = `${degreeBack} >`;
            } else if (y > startY) {
                text1 = `${degree} >`;
                text2 = `${degreeBack} <`;
            } else {
                text1 = `${degree} <`;
                text2 = `${degreeBack} >`;
            }

            ctx.translate(x, y);
            ctx.rotate(toRadian(Math.min(degree, degreeBack)));
            ctx.textBaseline = "bottom";
            ctx.fillText(text1, 0, 0);
            ctx.textBaseline = "top";
            ctx.fillText(text2, 0, 0);
            ctx.rotate(-toRadian(Math.min(degree, degreeBack)));
            ctx.translate(-x, -y);
        }
    }

    let islands = [];
    let courses = [];

    (function loadFromCookies() {
        let regExp = new RegExp("islands=(\\[{\\S+}\\])", "g");
        console.log("document.cookie =", document.cookie);
        let cookie = document.cookie.replace(regExp, "$1");

        if (cookie == null || cookie.length == 0) {
            let startIsle = new Island(0, 0, "START", "green");
            islands.push(startIsle);
            document.cookie = "islands=" + JSON.stringify(islands);
            cookie = document.cookie.replace(regExp, "$1");

            startIsle = new Island(100, 100, "another", "red");
            islands.push(startIsle);
            document.cookie = "islands=" + JSON.stringify(islands);
            cookie = document.cookie.replace(regExp, "$1");
        }
        console.log("cookie =", cookie);
        islands = JSON.parse(cookie);
        islands = islands.map(isle => Object.assign(new Island(), isle)); 
        console.log(islands);
    }());
    
    (function drawAll() {
        islands.forEach(isle => {
            isle.draw();

            const selectIsle = document.getElementsByClassName("selectIsle");
            console.log(selectIsle);
            selectIsle.forEach(select => {
                const option = document.createElement("option");
                option.value = `${isle.x} ${isle.y} ${isle.text} ${isle.color}`;
                option.innerHTML = isle.text;
                console.log(select);
                select.appendChild(option);
            });
        });

        regExp = new RegExp("courses=[{\S+}]", "g");
        cookie = document.cookie.match(regExp);

        if (cookie != null) {
            let array = JSON.parse(cookie);
            courses = Object.assign(Course, ...array);
            [...courses].forEach(course => {
                course.draw();

                const selectCourse = document.getElementsByClassName("selectCourse");
                [...selectCourse].forEach(select => {
                    const option = document.createElement("option");
                    option.value = `${degree} ${startX} ${startY} ${distance} ${departure} ${destination}`;
                    option.innerHTML = `${departure} to ${destination}`;
                    select.appendChild(option);
                });
            })
        }
    }());
}