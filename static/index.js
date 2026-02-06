const hostname = window.location.hostname;
const port = window.location.port;
const apiUrl = `http://${hostname}:${port}/api/`;

window.onload = function(){
    console.log('window.onload');
    // Код для обработки нажатия на кнопку открытия модального окна
    document.getElementById('openModalBtn').addEventListener('click', function() {
        document.getElementById('myModal').style.display = 'block';
    });

    document.getElementById('createPattern').addEventListener('click', function() {
    const brand = document.getElementById('brand').value
    const metaltype = document.getElementById('metaltype').value
    const productsubtype = document.getElementById('productsubtype').value
    const xhr = new XMLHttpRequest();
        xhr.open("POST", document.URL+"/api/template");
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        // const body = JSON.stringify({});
        xhr.onload = () => {
            if (xhr.status == 200) {
            const json_response = JSON.parse(xhr.responseText);
            window.location.href = document.URL+"/template/"+json_response['template_id'];
            } else {
            console.log(`Error: ${xhr.status}`);
            }
        };
        xhr.send(JSON.stringify({
            "brand_id":brand,
            "metal_type_id":metaltype,
            "product_subtype_id":productsubtype,
        }));
    });


    // Функция для загрузки данных JSON из API
    function fetchData(url, callback, elementId) {
        fetch(url)
            .then(response => response.json())
            .then(data => callback(data, elementId))
            .catch(error => console.error('Ошибка загрузки данных:', error));
    }

    // Функция для заполнения выпадающего списка
    function loadComboBox(jsonData, elementId) {
        const dropdown = document.getElementById(elementId);
        
        // Очистка списка перед добавлением новых элементов
        dropdown.innerHTML = '';
        const empty = document.createElement('option');
        empty.textContent = '';
        dropdown.appendChild(empty);
        
        // Добавление элементов из JSON в список
        jsonData.entities.forEach(entity => {
            const option = document.createElement('option');
            option.value = entity.id;
            option.textContent = entity.name;
            dropdown.appendChild(option);
        });
    }



    function loadTemplates(data){
        const content = document.getElementById('templates');
        content.innerHTML = '';
        console.log(data)
        data['entities'].forEach(template=>{
            
            const div_template = document.createElement('div');
            div_template.classList.add('shablone_image');
            div_template.id = `template_${template.id}`;
            div_template.style.backgroundImage = `url('/api/template/${template.id}/image/')`;

            const a_template = document.createElement('a');
            a_template.href = `http://${hostname}:${port}/template/${template.id}/`
            a_template.appendChild(div_template);

            const button_element = document.createElement('button');
            // button_element.innerHTML = 'D';
            button_element.classList.add('deletetemplate');
            // button_element.innerHTML = '<img src="image/delete.png"/>';
            button_element.id = template.id;
            button_element.addEventListener('click', (event) => {
            console.log(event);

            function refresh_templates(){
                getTemplates(loadTemplates);
            }

            const options = {
                method: 'DELETE', // Метод запроса DELETE
            };
            const url = `http://${hostname}:${port}/api/template/${template.id}`;
            fetch(url, options)
                .then(response => response.json())
                .then(data => refresh_templates())
                .catch(error => console.error('Ошибка загрузки данных:', error));
            });

            const div_content_element = document.createElement('div');
            div_content_element.classList.add('shablone');
            div_content_element.appendChild(button_element);
            div_content_element.appendChild(a_template);
            
            content.appendChild(div_content_element);
        });
    }

    // Код для обработки нажатия на кнопку закрытия модального окна
    document.getElementById('closeModalBtn').addEventListener('click', function() {
        document.getElementById('myModal').style.display = 'none';
    });

    function getTemplates(callback){
        params = [];
        const filters = ['brand', 'product_subtype', 'metal_type'];
        filters.forEach(filter =>{
            const combobox = document.getElementById(`${filter}_filter`);
            if(combobox.value){
            params.push(`${filter}_id=${combobox.value}`);
            }
        });
        let url = `http://${hostname}:${port}/api/template/`
        if(params.length > 0)
            url += `?${params.join('&')}`

        console.log(url)
        fetch(url)
            .then(response => response.json())
            .then(data => callback(data))
            .catch(error => console.error('Ошибка загрузки данных:', error));
        }    


    function loadProductSubType(event, element_id){
        const product_type = event.target.value;
        const request = `${apiUrl}productsubtype` + (product_type == "" ? "" : `?product_type=${product_type}`);
        fetchData(request, loadComboBox, element_id);
    }

    document.getElementById('brand_filter').addEventListener('change', (event) => { getTemplates(loadTemplates); });
    document.getElementById('product_subtype_filter').addEventListener('change', (event) => { getTemplates(loadTemplates); });
    document.getElementById('product_type_filter').addEventListener('change', (event) => { loadProductSubType(event, 'product_subtype_filter'); });
    document.getElementById('metal_type_filter').addEventListener('change', (event) => { getTemplates(loadTemplates); });

    document.getElementById('producttype').addEventListener('change', (event) => { loadProductSubType(event,'productsubtype'); });

    // Загрузка данных для страницы

    getTemplates(loadTemplates);

    fetchData(apiUrl+'brand', loadComboBox, 'brand');
    fetchData(apiUrl+'productsubtype', loadComboBox, 'productsubtype');
    fetchData(apiUrl+'producttype', loadComboBox, 'producttype');
    fetchData(apiUrl+'metaltype', loadComboBox, 'metaltype');

    fetchData(apiUrl+'brand', loadComboBox, 'brand_filter');
    fetchData(apiUrl+'productsubtype', loadComboBox, 'product_subtype_filter');
    fetchData(apiUrl+'producttype', loadComboBox, 'product_type_filter');
    fetchData(apiUrl+'metaltype', loadComboBox, 'metal_type_filter');
}