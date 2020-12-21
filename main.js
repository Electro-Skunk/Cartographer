window.onload = function () {

    //cd C:\Users\osooni\Documents\Coding\GitHub\Cartographer
    //python -m http.server
    //http://127.0.0.1:8000/main.html

    // 캔버스 정의
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

    // 배경화면 하단 아래 방위 표시
    const compassImg = new Image();
    compassImg.onload = function () {
        ctx.drawImage(compassImg, canvasWidth / 2 - 103, canvasHeight / 2 - 100, 100, 100);
    }
    compassImg.src = "img/compass.png";


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


    // 쿠키 가져와서 전부 그리기
    (function loadFromCookies() {
        // islands
        let regExp = new RegExp("islands=(\\[{\\S+}\\])", "g");
        let cookie = document.cookie.replace(regExp, "$1");

        console.log("document.cookie =", document.cookie);
        console.log("cookie =", cookie);

        if (cookie == null || cookie.length == 0) {
            let startIsle = new Island(0, 0, "START", "green");
            islands.push(startIsle);
            document.cookie = "islands=" + JSON.stringify(islands);
            cookie = document.cookie.replace(regExp, "$1");
        }
        islands = JSON.parse(cookie);
        islands = islands.map(isle => Object.assign(new Island(), isle));

        // courses
        regExp = new RegExp("courses=[{\S+}]", "g");
        cookie = document.cookie.match(regExp);

        if (cookie != null) {
            courses = JSON.parse(cookie);
            courses = courses.map(course => Object.assign(new Course(), course));
        }

        console.log("islands =", islands);
        console.log("courses =", courses);
    }());

    (function drawAll() {
        islands.forEach(isle => {
            isle.draw();
            console.log("isle =", isle);

            const selectIsle = document.getElementsByClassName("selectIsle");
            console.log("selectIsle =", selectIsle);
            [...selectIsle].forEach(select => {
                const option = document.createElement("option");
                option.value = `${isle.x} ${isle.y} ${isle.text} ${isle.color}`;
                option.innerHTML = isle.text;
                select.appendChild(option);
            });
        });

        [...courses].forEach(course => {
            course.draw();

            const selectCourse = document.getElementsByClassName("selectCourse");
            [...selectCourse].forEach(select => {
                const option = document.createElement("option");
                option.value = `${degree} ${startX} ${startY} ${distance} ${departure} ${destination}`;
                option.innerHTML = `${departure} to ${destination}`;
                select.appendChild(option);
            });
        });
    }());

    // 쿠키 지우기
    function deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
    }
    deleteCookie("islands");
    deleteCookie("courses");

    // html 버튼 조작 시 발생하는 이벤트들

    // create new course submit
    const createNewCourse = document.getElementById("createNewCourse");
    createNewCourse.addEventListener("submit", function (e) {
        e.preventDefault();

        const startIsle = document.getElementById("selectStartIsle").value.split(" ");
        const startX = parseInt(startIsle[0]);
        const startY = parseInt(startIsle[1]);
        const startIsleName = parseInt(startIsle[2]);
        const newIsleName = document.getElementById("newIsleName").value;
        const newIsleColor = document.getElementById("isleColor").value;
        const degree = parseInt(document.getElementById("newAngle").value);
        const distance = parseInt(document.getElementById("newDistance").value) * 100;
        const x = getXY(degree, startX, startY, distance).x;
        const y = getXY(degree, startX, startY, distance).y;

        const newIsle = new Island(x, y, newIsleName, newIsleColor);
        const newCourse = new Course(degree, startX, startY, distance, startIsleName, newIsleName);
        islands.push(newIsle);
        courses.push(newCourse);
        document.cookie = "islands=" + JSON.stringify(islands);
        document.cookie = "courses=" + JSON.stringify(courses);
    })


    // map 이름 또는 seed 번호 출력
    const mapNameIn = document.getElementById("mapNameIn");
    mapNameIn.addEventListener("change", function () {
        const mapNameOut = document.getElementById("mapNameOut");
        mapNameOut.innerHTML = "#" + mapNameIn.value;
    }, false);

    // toggle
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