window.onload = function () {

    //cd C:\Users\osooni\Documents\Coding\GitHub\Mapping-Deep
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

    function drawIsland(ctx, x, y, text, color = "green") {
        // draw circle
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(x, y, 5, toRadian(0), toRadian(360));
        ctx.fill();

        //draw name
        ctx.fillStyle = color;
        ctx.textBaseline = "bottom";
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillText(text, x, y - 5);

        //draw coordinate
        ctx.fillStyle = "white";
        ctx.textBaseline = "top";
        const coordinate = "(" + x + ", " + y + ")";
        ctx.font = `normal ${fontSize}px Arial`;
        ctx.fillText(coordinate, x, y + 5);
    }

    function drawPath(ctx, degree, start_x, start_y, distance) {

        // draw line
        ctx.strokeStyle = "white";
        let x = getXY(degree, start_x, start_y, distance).x;
        let y = getXY(degree, start_x, start_y, distance).y;
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(x, y);
        ctx.stroke();

        // draw angle sign
        ctx.fillStyle = "white";
        x = getXY(degree, start_x, start_y, distance / 2).x;
        y = getXY(degree, start_x, start_y, distance / 2).y;

        let degreeBack;
        if (degree >= 180) {
            degreeBack = degree - 180;
        } else {
            degreeBack = degree + 180;
        }

        let text1, text2;
        if (x > start_x) {
            text1 = `${degree} >`;
            text2 = `${degreeBack} <`;
        } else if (x < start_x) {
            text1 = `${degree} <`;
            text2 = `${degreeBack} >`;
        } else if (y > start_y) {
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


    console.log("document.cookie =", document.cookie);


    // 쿠키 가져와서 전부 그리기
    function drawAll() {
        let regExp = new RegExp("island_?([A-Za-z0-9_ ]+)=(-?\\d+) (-?\\d+) (#\\w+)", "g");
        let cookies = document.cookie.match(regExp);

        if (cookies == null) {
            document.cookie = "island_START=0 0 #FFFF00";
            cookies = document.cookie.match(regExp);
        }

        cookies.forEach(cookie => {
            const text = cookie.replace(regExp, "$1");
            const x = parseInt(cookie.replace(regExp, "$2"));
            const y = parseInt(cookie.replace(regExp, "$3"));
            const color = cookie.replace(regExp, "$4");
            drawIsland(ctx, x, y, text, color);

            const selectIsle = document.getElementsByClassName("selectIsle");
            [...selectIsle].forEach(select => {
                const option = document.createElement("option");
                option.value = `${text} ${x} ${y}`;
                option.innerHTML = text;
                select.appendChild(option);
            });
        });

        regExp = new RegExp("path_?([A-Za-z0-9_ ]+)-([A-Za-z0-9_ ]+)=(\\d+) (-?\\d+) (-?\\d+) (\\d+)", "g");
        cookies = document.cookie.match(regExp);

        if (cookies != null) {
            cookies.forEach(cookie => {
                const departure = cookie.replace(regExp, "$1");
                const destination = cookie.replace(regExp, "$2");
                const degree = parseInt(cookie.replace(regExp, "$3"));
                const start_x = parseInt(cookie.replace(regExp, "$4"));
                const start_y = parseInt(cookie.replace(regExp, "$5"));
                const distance = parseInt(cookie.replace(regExp, "$6")) * 100;
                drawPath(ctx, degree, start_x, start_y, distance);

                const selectPath = document.getElementsByClassName("selectPath");
                [...selectPath].forEach(select => {
                    const option = document.createElement("option");
                    option.value = `${departure}-${destination} ${degree} ${start_x} ${start_y} ${distance}`;
                    option.innerHTML = `${departure} > ${destination}`;
                    select.appendChild(option);
                });
            });
        }
    }
    drawAll();



    // 쿠키 지우기
    function deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
    }


    // html 버튼 조작 시 발생하는 이벤트들

    // create new course submit
    const createNewCourse = document.getElementById("createNewCourse");
    createNewCourse.addEventListener("submit", function (e) {
        e.preventDefault();

        const startIsle = document.getElementById("selectStartIsle").value.split(" ");
        const startIsleName = startIsle[0];
        const start_x = parseInt(startIsle[1]);
        const start_y = parseInt(startIsle[2]);
        const newIsleName = document.getElementById("newIsleName").value;
        const isleColor = document.getElementById("isleColor").value;
        const degree = parseInt(document.getElementById("newAngle").value);
        const distance = parseInt(document.getElementById("newDistance").value) * 100;
        const x = getXY(degree, start_x, start_y, distance).x;
        const y = getXY(degree, start_x, start_y, distance).y;

        document.cookie = `island_${newIsleName}=${x} ${y} ${isleColor}`;
        document.cookie = `path_${startIsleName}-${newIsleName}=${degree} ${start_x} ${start_y} ${distance}`;
    })


    // map 이름 또는 seed 번호 출력
    const mapNameIn = document.getElementById("mapNameIn");
    mapNameIn.addEventListener("change", function () {
        const mapNameOut = document.getElementById("mapNameOut");
        mapNameOut.innerHTML = "#" + mapNameIn.value;
    }, false);

    // toggle
    const main = document.getElementById("main");
    const paths = document.getElementById("paths");
    const islands = document.getElementById("islands");
    const diaries = document.getElementById("diaries");
    main.style.display = "block";
    paths.style.display = "none";
    islands.style.display = "none";
    diaries.style.display = "none";

    const mainButton = document.getElementById("mainButton");
    mainButton.addEventListener("click", function () {
        paths.style.display = "none";
        islands.style.display = "none";
        diaries.style.display = "none";
        if (main.style.display == "none") {
            main.style.display = "block";
        } else {
            main.style.display = "none";
        }
    }, false);

    const pathsButton = document.getElementById("pathsButton");
    pathsButton.addEventListener("click", function () {
        main.style.display = "none";
        islands.style.display = "none";
        diaries.style.display = "none";
        if (paths.style.display == "none") {
            paths.style.display = "block";
        } else {
            paths.style.display = "none";
        }
    }, false);

    const islandsButton = document.getElementById("islandsButton");
    islandsButton.addEventListener("click", function () {
        main.style.display = "none";
        paths.style.display = "none";
        diaries.style.display = "none";
        if (islands.style.display == "none") {
            islands.style.display = "block";
        } else {
            islands.style.display = "none";
        }
    }, false);

    const diariesButton = document.getElementById("diariesButton");
    diariesButton.addEventListener("click", function (e) {
        main.style.display = "none";
        paths.style.display = "none";
        islands.style.display = "none";
        if (diaries.style.display == "none") {
            diaries.style.display = "block";
        } else {
            diaries.style.display = "none";
        }
    }, false);


}