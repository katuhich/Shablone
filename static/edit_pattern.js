let canvas;
let ctx;
let hostname;
let port;
let parts;
let template_id;
let canvas_data;
let selectedIndex = -1; // Индекс выбранного
let dragStartX, dragStartY; // Начальные координаты перетаскивания
const resizeHandleSize = 10; // Размер элементов для изменения размера

// после загрузки окна
window.onload = function(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    hostname = window.location.hostname;
    port = window.location.port;
    parts = window.location.href.split('/')
    template_id = parts[parts.length - 1];
    if (template_id==='') template_id = parts[parts.length - 2];
    // Массив для хранения текстов
    canvas_data = {
        id: template_id,
        width: canvas.width,
        height: canvas.height,
        color: "#ffffff",
        entities: []
    };
    
    document.getElementById('canvas-width').value = canvas.width;
    document.getElementById('canvas-height').value = canvas.height;
    
    // при изменении ширины хослта
    document.getElementById('canvas-width').addEventListener('input', () => {
        canvas_data.width = parseInt(document.getElementById('canvas-width').value);
        drawObjects();
    });
    
    // при изменении высоты хоста
    document.getElementById('canvas-height').addEventListener('input', () => {
        canvas_data.height = parseInt(document.getElementById('canvas-height').value);
        drawObjects();
    });
    
    // при измененении цвета фона хоста
    document.getElementById('canvas-color').addEventListener('input', () => {
        canvas_data.color = document.getElementById('canvas-color').value;
        drawObjects();
    });
    
    // при изменении текста текста
    document.getElementById('text-input').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            canvas_data.entities[selectedIndex].text = event.target.value;
            drawObjects();
        }
    });
    
    // при изменении горизонтальной координаты текста
    document.getElementById('text-x').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            const newX = parseFloat(event.target.value);
            if (!isNaN(newX)) {
                canvas_data.entities[selectedIndex].x = newX;
                drawObjects();
            }
        }
    });
    
    
    // при изменении вертикальной координаты текста
    document.getElementById('text-y').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            const newY = parseFloat(event.target.value);
            if (!isNaN(newY)) {
                canvas_data.entities[selectedIndex].y = newY;
                drawObjects();
            }
        }
    });
    
    // при изменении размера текста
    document.getElementById('font-size').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            const newFontSize = parseInt(event.target.value);
            if (!isNaN(newFontSize)) {
                canvas_data.entities[selectedIndex].fontSize = newFontSize;
                drawObjects();
            }
        }
    });
 
    // при изменении жирности текста
    document.getElementById('font').addEventListener('change', (event) => {
        if (selectedIndex !== -1) {
            canvas_data.entities[selectedIndex].font = event.target.value;
            drawObjects();
        }
    });

    // при изменении жирности текста
    document.getElementById('font-weight').addEventListener('change', (event) => {
        if (selectedIndex !== -1) {
            canvas_data.entities[selectedIndex].fontWeight = event.target.value;
            console.log(event.target.value);
            drawObjects();
        }
    });

    
    // при изменении цвета текста
    document.getElementById('text-color').addEventListener('change', (event) => {
        if (selectedIndex !== -1) {
            canvas_data.entities[selectedIndex].color = event.target.value;
            drawObjects();
        }
    });


    // при изменении горизонтальной координаты изображения
    document.getElementById('image-x').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            const newX = parseFloat(event.target.value);
            if (!isNaN(newX)) {
                canvas_data.entities[selectedIndex].x = newX;
                drawObjects();
            }
        }
    });


    // при изменении вертикальной координаты изображения
    document.getElementById('image-y').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            const newY = parseFloat(event.target.value);
            if (!isNaN(newY)) {
                canvas_data.entities[selectedIndex].y = newY;
                drawObjects();
            }
        }
    });

    // при изменении ширины изображения
    document.getElementById('image-width').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            const newX = parseFloat(event.target.value);
            if (!isNaN(newX)) {
                canvas_data.entities[selectedIndex].width = newX;
                drawObjects();
            }
        }
    });


    // при изменении высоты изображения
    document.getElementById('image-height').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            const newY = parseFloat(event.target.value);
            if (!isNaN(newY)) {
                canvas_data.entities[selectedIndex].height = newY;
                drawObjects();
            }
        }
    });

    document.getElementById('image-shadow').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            console.log(event.target.checked)
            canvas_data.entities[selectedIndex].shadow = event.target.checked;
            drawObjects();
        }
    });


    // при опускании ЛКМ на холсте
    canvas.addEventListener('mousedown', (event) => {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;
        if (selectedIndex !== -1 && canvas_data.entities[selectedIndex].type === 'image'){
            const image = canvas_data.entities[selectedIndex];
            const handleIndex = getResizeHandleIndex(mouseX, mouseY, image);
            if (handleIndex !== -1) {
                dragStartX = mouseX;
                dragStartY = mouseY;
                canvas.addEventListener('mousemove', resizeImage);
                canvas.addEventListener('mouseup', () => {
                    canvas.removeEventListener('mousemove', resizeImage);
                    if (selectedIndex !== -1 && canvas_data.entities[selectedIndex].type === 'image'){
                        const image = canvas_data.entities[selectedIndex];
                        if (image.width < 0){
                            image.x += image.width;
                            image.width *= -1;
                        }
                        if (image.height < 0){
                            image.y += image.height;
                            image.height *= -1;
                        }
                    }
                });
                return
            }
        }
        
        selectedIndex = canvas_data.entities.findIndex(entity => {
            const textWidth = ctx.measureText(entity.text).width;
            if (entity.type === 'text')
                return mouseX >= entity.x && mouseX <= entity.x + textWidth && mouseY >= entity.y - entity.fontSize && mouseY <= entity.y;
            else if (entity.type === 'image')
                return mouseX >= entity.x && mouseX <= entity.x + entity.width && mouseY >= entity.y && mouseY <= entity.y + entity.height;
        });

        if (selectedIndex !== -1) {
            const entity = canvas_data.entities[selectedIndex];
            document.getElementById('canvas-property-panel').style.display = 'none'
            
            if(entity.type === 'text'){
                document.getElementById('image-properties-panel').style.display = 'none'
                document.getElementById('text-properties-panel').style.display = 'block'
                document.getElementById('text-input').value = entity.text;
                document.getElementById('text-x').value = entity.x;
                document.getElementById('text-y').value = entity.y;
                document.getElementById('font').value = entity.font;
                document.getElementById('font-size').value = entity.fontSize;
                document.getElementById('font-weight').value = entity.fontWeight;
                document.getElementById('text-color').value = entity.color;
            }
            else if(entity.type === 'image'){
                document.getElementById('image-properties-panel').style.display = 'block'
                document.getElementById('text-properties-panel').style.display = 'none'
                document.getElementById('image-x').value = entity.x;
                document.getElementById('image-y').value = entity.y;
                document.getElementById('image-height').value = entity.height;
                document.getElementById('image-width').value = entity.width;
                console.log(entity.shadow);
                document.getElementById('image-shadow').checked = entity.shadow;
            }

            dragStartX = mouseX;
            dragStartY = mouseY;
            canvas.addEventListener('mousemove', moveObject);
            canvas.addEventListener('mouseup', () => {
                canvas.removeEventListener('mousemove', moveObject);
            });

        }
        else{
            document.getElementById('canvas-property-panel').style.display = 'block'
            document.getElementById('text-properties-panel').style.display = 'none'
            document.getElementById('image-properties-panel').style.display = 'none'
        }
        drawObjects();
    });

    // при клике по кнопке Редактировать холст
    document.getElementById('edit-canvas-btn').addEventListener('click', () => {
        document.getElementById('canvas-property-panel').style.display = 'block'
        document.getElementById('text-properties-panel').style.display = 'none'
    });
    
    // при клике по кнопке добавить текст
    document.getElementById('add-text-btn').addEventListener('click', () => {
        addText(100, 100, 'Новый текст', 24, 'normal', "#000000");
    });
    
    // приклике по кнопке добавить картинку
    document.getElementById('add-img-btn').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    // при выборе изображения
    document.getElementById('file-input').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const image = new Image();
            image.src = URL.createObjectURL(file);
    
            image.onload = function() {
    
                const width = this.width > canvas.width ? canvas.width : this.width;
                const height = this.height > canvas.height ? canvas.height : this.height;

                const formData = new FormData();
                formData.append('image', file);
    
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/image', true);
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
                xhr.onload = function() {
                    const jsonResponse = JSON.parse(xhr.responseText);
                    if (xhr.status === 200) {
                        addImg(0,0,`api/image/${jsonResponse.image}`,width,height,jsonResponse.image)
                    } else {
                        console.error('Произошла ошибка при загрузке изображения:', xhr.status, jsonResponse);
                    }
                };
    
                xhr.onerror = function() {
                    console.error('Произошла ошибка при отправке запроса');
                };
    
                xhr.send(formData);
            };
        }
    });

    // при клике по кнопке сохранить
    document.getElementById('save-btn').addEventListener('click', () => {
        const xhr = new XMLHttpRequest();
        xhr.open("PATCH", `http://${hostname}:${port}/api/template/${template_id}`);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.onload = () => {
            if (xhr.status !== 200) {
                console.error(`Error: ${xhr.status}`);
            }
        };
        xhr.send(JSON.stringify(canvas_data));
    });

    // при клике по кнопке скачать архив
    document.getElementById('download-zip-btn').addEventListener('click', () => {
        fetch(`http://${hostname}:${port}/api/template/${template_id}/zip`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        alert(errorData.error);
                        throw new Error('Network response was not ok: ' + errorData.error);
                    });
                }
                return response.blob(); // Получаем Blob из ответа
            })
            .then(blob => {
                const link = document.createElement('a'); // Создаем элемент ссылки
                link.href = window.URL.createObjectURL(blob); // Создаем URL для Blob
                link.download = 'archive.zip'; // Указываем имя файла для скачивания
                link.click(); // Программно кликаем на ссылку, чтобы инициировать скачивание
                window.URL.revokeObjectURL(link.href); // Освобождаем URL
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    });

    document.getElementById('delete-text').addEventListener('click', function() {
        if (selectedIndex >= 0 && selectedIndex < canvas_data.entities.length) {
            canvas_data.entities.splice(selectedIndex, 1);
            selectedIndex = -1;
            document.getElementById('canvas-property-panel').style.display = 'block'
            document.getElementById('text-properties-panel').style.display = 'none'
            document.getElementById('image-properties-panel').style.display = 'none'
            drawObjects();
        }
    });

    document.getElementById('delete-image').addEventListener('click', function() {
        if (selectedIndex >= 0 && selectedIndex < canvas_data.entities.length) {
            canvas_data.entities.splice(selectedIndex, 1);
            selectedIndex = -1;
            document.getElementById('canvas-property-panel').style.display = 'block'
            document.getElementById('text-properties-panel').style.display = 'none'
            document.getElementById('image-properties-panel').style.display = 'none'
            drawObjects();
        }
    });

    document.getElementById('add_product').addEventListener('click', function() {
        addImg(0, 0, "/api/image/product.png", 100, 100, "product.png");
    });

    fetchData(`http://${hostname}:${port}/api/template/${template_id}/`, loadTemplate)
}



// Пример списка объектов
/*
{  
    "width": "200",
    "height": "200",
    "color": "#ffffff"
    "entities": [
        {
            "type":"image",
            "url": "/api/image/1",
            "width": 100,
            "height": 100,
            "x": 0,
            "y": 0
        },
        {
            "type":"text",
            "text": "wello world",
            "fontSize": 2,
            "x": 0,
            "y": 0
        }
    ]
}
 
*/


function fetchData(url, callback) {
    fetch(url)
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => console.error('Ошибка загрузки данных:', error));
}

function onShadow(){
    // Устанавливаем параметры тени
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Цвет тени (черный с прозрачностью)
    ctx.shadowBlur = 20; // Радиус размытия тени
    ctx.shadowOffsetX = 5; // Смещение тени по оси X
    ctx.shadowOffsetY = 5; // Смещение тени по оси Y
}

function offShadow(){
    // Устанавливаем параметры тени
    ctx.shadowColor = 'rgba(0, 0, 0, 0)'; // Цвет тени (черный с прозрачностью)
    ctx.shadowBlur = 0 // Радиус размытия тени
    ctx.shadowOffsetX = 0; // Смещение тени по оси X
    ctx.shadowOffsetY = 0; // Смещение тени по оси Y
}

function drawImage(entity, index){
    if ('image' in entity){
        if ('shadow' in entity && entity['shadow']){
            onShadow();
        }

        ctx.drawImage(entity.image, entity.x, entity.y, entity.width, entity.height);

        if ('shadow' in entity && entity['shadow']){
            offShadow();
        }
    }else{
        const image = new Image();
        image.onload = function(){
            if ('shadow' in entity && entity['shadow']){
                onShadow();
            }
            ctx.drawImage(image, entity.x, entity.y, entity.width, entity.height);
            if ('shadow' in entity && entity['shadow']){
                offShadow();
            }
            entity['image'] = image
        }
        image.src = `http://${hostname}:${port}/${entity.url}`;
    }
    if (selectedIndex === index){
        const handles = [
            { x: entity.x, y: entity.y}, // Верхний левый угол
            { x: entity.x + entity.width, y: entity.y}, // Верхний правый угол
            { x: entity.x + entity.width, y: entity.y + entity.height}, // Нижний правый угол
            { x: entity.x, y: entity.y + entity.height} // Нижний левый угол
        ];
        handles.forEach(handle => {
            ctx.beginPath();
            ctx.fillStyle = '#000000';
            ctx.arc(handle.x , handle.y, resizeHandleSize, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

function drawObjects() {
    
    document.getElementById('canvas-width').value = canvas_data.width;
    canvas.width = canvas_data.width;

    document.getElementById('canvas-height').value = canvas_data.height;
    canvas.height = canvas_data.height;

    document.getElementById("fieldId").style.margin = "50px 100px" //"calc((100lvh - " + canvas_data.height + ")/2)";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('canvas-color').value = canvas_data.color;
    canvas.style.backgroundColor = document.getElementById('canvas-color').value;

    canvas_data.entities.forEach((entity, index) => {

        switch (entity.type) {
            case 'text':
                ctx.fillStyle = entity.color;
                ctx.font = `${entity.fontWeight} ${entity.fontSize}px ${entity.font}`;
                ctx.fillText(entity.text, entity.x, entity.y);
                if (index === selectedIndex) {
                    ctx.strokeStyle = 'blue';
                    ctx.strokeRect(entity.x - 5, entity.y - entity.fontSize, ctx.measureText(entity.text).width + 10, entity.fontSize + 5);
                }
                break;
            case 'image':
                drawImage(entity, index);
                break;
        }
    });
}

function loadTemplate(jsonData) {
    canvas_data = jsonData;
    drawObjects();
}

function addText(x, y, text, fontSize, fontWeight, color) {
    const textObj = {
        type: 'text',
        color:color,
        text: text,
        font: 'Arial',
        fontSize: fontSize,
        fontWeight: fontWeight,
        x: x,
        y: y
    };
    canvas_data.entities.push(textObj);
    drawObjects();
}

function addImg(x, y, imgUrl, width, height, id){
    const imgObj = {
        type:"image",
        id:id,
        url: imgUrl,
        width: width,
        height: height,
        x: x,
        y: y
    };
    canvas_data.entities.push(imgObj);
    drawObjects();
}


function moveObject(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    const deltaX = mouseX - dragStartX;
    const deltaY = mouseY - dragStartY;
    canvas_data.entities[selectedIndex].x += deltaX;
    canvas_data.entities[selectedIndex].y += deltaY;
    dragStartX = mouseX;
    dragStartY = mouseY;
    drawObjects();
}

// Получение индекса элемента для изменения размера
function getResizeHandleIndex(x, y, entity) {
    const handles = [
        { x: entity.x, y: entity.y}, // Верхний левый угол
        { x: entity.x + entity.width, y: entity.y}, // Верхний правый угол
        { x: entity.x + entity.width, y: entity.y + entity.height}, // Нижний правый угол
        { x: entity.x, y: entity.y + entity.height} // Нижний левый угол
    ];
    for (let i = 0; i < handles.length; i++) {
        const handle = handles[i];
        const dx = handle.x - x;
        const dy = handle.y - y;
        if (Math.sqrt(dx * dx + dy * dy) <= resizeHandleSize) {
            return i;
        }
    }
    return -1;
}

// Функция для изменения размера картинки
function resizeImage(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    const selectedImage = canvas_data.entities[selectedIndex];
    const deltaX = mouseX - dragStartX;
    const deltaY = mouseY - dragStartY;
    const handleIndex = getResizeHandleIndex(mouseX, mouseY, selectedImage);
    if (handleIndex !== -1) {
        switch (handleIndex) {
            case 0: // Верхний левый угол
                selectedImage.x += deltaX;
                selectedImage.y += deltaY;
                selectedImage.width -= deltaX;
                selectedImage.height -= deltaY;
                break;
            case 1: // Верхний правый угол
                selectedImage.y += deltaY;
                selectedImage.width += deltaX;
                selectedImage.height -= deltaY;
                break;
            case 2: // Нижний правый угол
                selectedImage.width += deltaX;
                selectedImage.height += deltaY;
                break;
            case 3: // Нижний левый угол
                selectedImage.x += deltaX;
                selectedImage.width -= deltaX;
                selectedImage.height += deltaY;
                break;
        }
        drawObjects();
    }
    dragStartX = mouseX;
    dragStartY = mouseY;
}