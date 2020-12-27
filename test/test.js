window.onload = function () {

    //cd C:\Users\osooni\Documents\Coding\GitHub\Cartographer
    //python -m http.server
    //http://127.0.0.1:8000/main.html

    // [main themes]
    // {sub themes}
    // notes


    // [canvas]

    // {define canvas}
    const imgCanvas = document.getElementById("imgCanvas");
    const imgCtx = imgCanvas.getContext("2d");
    // imgCanvas.style.display = "none";
    imgCanvas.style.backgroundColor = "skyblue";

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.style.backgroundColor = "beige";
    ctx.globalCompositeOperation = "source-over";
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

    // {background img - user screenshot}
    function imgResizing(img) {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const scaleX = canvas.width / imgWidth;
        const scaleY = canvas.height / imgHeight;
        let scale = (scaleX < scaleY) ? scaleX : scaleY;
        if (scale > 1) {
            scale = 1;
        }
        img.width = scale * imgWidth;
        img.height = scale * imgHeight;
    }

    function imgSlicing(img) {
        const scale = img.width / img.height;
        if (scale > 1.7) {
            imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
            imgCanvas.width = img.width;
            imgCanvas.height = img.height;
            imgCtx.drawImage(img, 0, 0);
            let imgData = imgCtx.getImageData(img.width * 0.3, 0, img.width * 0.7, img.height);
            imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
            imgCanvas.width = imgData.width;
            imgCanvas.height = imgData.height;
            imgCtx.putImageData(imgData, 0, 0);
        }
    }

    function imgStore() {
        let dataURL = imgCanvas.toDataURL("img/jpeg");
        localStorage.setItem("map", dataURL);
    }


    // {canvas drawing functions}
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
        constructor(x, y, text, color) {
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

    class Course {
        constructor(degree, startX, startY, distance, departure, destination) {
            this.degree = degree;
            this.startX = startX;
            this.startY = startY;
            this.distance = distance;
            this.departure = departure;
            this.destination = destination;
        }

        draw() {
            // draw line
            ctx.strokeStyle = "white";
            let x = getXY(this.degree, this.startX, this.startY, this.distance).x;
            let y = getXY(this.degree, this.startX, this.startY, this.distance).y;
            ctx.beginPath();
            ctx.moveTo(this.startX, this.startY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // draw angle sign
            ctx.fillStyle = "white";
            x = getXY(this.degree, this.startX, this.startY, this.distance / 2).x;
            y = getXY(this.degree, this.startX, this.startY, this.distance / 2).y;

            let degreeBack;
            if (this.degree >= 180) {
                degreeBack = this.degree - 180;
            } else {
                degreeBack = this.degree + 180;
            }

            let text1, text2;
            if (x > this.startX) {
                text1 = `${this.degree} >`;
                text2 = `${degreeBack} <`;
            } else if (x < this.startX) {
                text1 = `${this.degree} <`;
                text2 = `${degreeBack} >`;
            } else if (y > this.startY) {
                text1 = `${this.degree} >`;
                text2 = `${degreeBack} <`;
            } else {
                text1 = `${this.degree} <`;
                text2 = `${degreeBack} >`;
            }

            ctx.translate(x, y);
            ctx.rotate(toRadian(Math.min(this.degree, degreeBack)));
            ctx.textBaseline = "bottom";
            ctx.fillText(text1, 0, 0);
            ctx.textBaseline = "top";
            ctx.fillText(text2, 0, 0);
            ctx.rotate(-toRadian(Math.min(this.degree, degreeBack)));
            ctx.translate(-x, -y);
        }
    }

    let islands = [];
    let courses = [];
    const img = new Image();
    const drawObjs = [];

    // localStorage.removeItem("islands");
    // localStorage.removeItem("courses");
    // localStorage.removeItem("map");
    console.log(localStorage);

    // [run once for every window.onload]

    (function loadFromStorage() {
        //background map
        const map = localStorage.getItem("map");
        if (map != null) {
            img.src = map;
            imgResizing(img)
            drawObjs.push(img);
        }

        // islands
        islands = localStorage.getItem("islands");
        islands = JSON.parse(islands);

        if (islands == null || islands.length == 0) {
            let startIsle = new Island(0, 0, "START", "green");
            islands = [];
            islands.push(startIsle);
            localStorage.setItem("islands", JSON.stringify(islands));
            drawObjs.push(startIsle);
        }

        islands = islands.map(isle => Object.assign(new Island(), isle));
        islands.forEach(isle => {
            drawObjs.push(isle);

            const selectIsle = document.getElementsByClassName("selectIsle");
            for (let select of selectIsle) {
                const option = document.createElement("option");
                option.value = JSON.stringify(isle);
                option.innerHTML = isle.text;
                select.appendChild(option);
            }
        });

        // courses
        courses = localStorage.getItem("courses");
        courses = JSON.parse(courses);

        if (courses != null) {
            courses = courses.map(course => Object.assign(new Course(), course));
            courses.forEach(course => {
                drawObjs.push(course);

                const selectCourse = document.getElementsByClassName("selectCourse");
                for (let select of selectCourse) {
                    const option = document.createElement("option");
                    option.value = JSON.stringify(course);
                    option.innerHTML = `${course.departure} to ${course.destination}`;
                    select.appendChild(option);
                };
            });
        } else {
            courses = [];
        }
    }());

    (function drawAll() {
        img.onload = function () {
            drawObjs.forEach(obj => {
                if (obj instanceof Island || obj instanceof Course) {
                    obj.draw();
                } else {
                    ctx.drawImage(obj, -(obj.width / 2), -(obj.height / 2), obj.width, obj.height);
                }
            });
        }
    }());


    // [html button events]

    // {get user screenshot, set as canvas background}
    const mapImg = document.getElementById("mapImg");
    mapImg.addEventListener("change", function (e) {
        if (mapImg.files && mapImg.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    imgResizing(img);
                    imgSlicing(img);
                    imgStore();
                    window.location.reload();
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(e.target.files[0])
        } else {
            console.log("file didn't seleted")
        }
    }, false);

    // {create new course submit}
    const createNewCourse = document.getElementById("createNewCourse");
    createNewCourse.addEventListener("submit", function (e) {
        e.preventDefault();

        let startIsle = document.getElementById("selectStartIsle").value;
        console.log(startIsle);
        startIsle = JSON.parse(startIsle);
        console.log(startIsle);
        startIsle = Object.assign(new Island(), startIsle);
        console.log(startIsle);
        const newIsleName = document.getElementById("newIsleName").value;
        const newIsleColor = document.getElementById("isleColor").value;
        const degree = parseInt(document.getElementById("newAngle").value);
        const distance = parseInt(document.getElementById("newDistance").value);
        const x = getXY(degree, startIsle.x, startIsle.y, distance).x;
        console.log(degree, startIsle.x, startIsle.y, distance);
        console.log(x);
        const y = getXY(degree, startIsle.x, startIsle.y, distance).y;
        console.log(y);

        const newIsle = new Island(x, y, newIsleName, newIsleColor);
        const newCourse = new Course(degree, startIsle.x, startIsle.y, distance, startIsle.text, newIsleName);
        islands.push(newIsle);
        courses.push(newCourse);
        localStorage.setItem("islands", JSON.stringify(islands));
        localStorage.setItem("courses", JSON.stringify(courses));
        window.location.reload();
    })

    // {toggle}
    const main = document.getElementById("main");
    const draw = document.getElementById("draw");
    const check = document.getElementById("check");
    const write = document.getElementById("write");
    main.style.display = "block";
    draw.style.display = "none";
    check.style.display = "none";
    write.style.display = "none";

    const mainButton = document.getElementById("mainButton");
    mainButton.addEventListener("click", function () {
        draw.style.display = "none";
        check.style.display = "none";
        write.style.display = "none";
        if (main.style.display == "none") {
            main.style.display = "block";
        } else {
            main.style.display = "none";
        }
    }, false);

    const drawButton = document.getElementById("drawButton");
    drawButton.addEventListener("click", function () {
        main.style.display = "none";
        check.style.display = "none";
        write.style.display = "none";
        if (draw.style.display == "none") {
            draw.style.display = "block";
        } else {
            draw.style.display = "none";
        }
    }, false);

    const checkButton = document.getElementById("checkButton");
    checkButton.addEventListener("click", function () {
        main.style.display = "none";
        draw.style.display = "none";
        write.style.display = "none";
        if (check.style.display == "none") {
            check.style.display = "block";
        } else {
            check.style.display = "none";
        }
    }, false);

    const writeButton = document.getElementById("writeButton");
    writeButton.addEventListener("click", function (e) {
        main.style.display = "none";
        draw.style.display = "none";
        check.style.display = "none";
        if (write.style.display == "none") {
            write.style.display = "block";
        } else {
            write.style.display = "none";
        }
    }, false);


}