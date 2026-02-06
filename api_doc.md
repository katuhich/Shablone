# Документация API

## Создать шаблон

- Метод - `POST`
- URL - `/api/template`
- Вернет - JSON `{ template_id: 1}`

## Получить шаблон

- Метод - `GET`
- URL - `/api/template/<int:template_id>`
- Вернет - JSON 
```json
{ 
  "template_id": 1,
  "width": "200px",
  "height": "200px",
  "images": [
    {
      "id": 1,
      "url": "/api/image/1",
      "z-index": "3",
      "width": "100px",
      "height": "100px",
      "margin-top": "0px",
      "margin-left": "0px"
    },
    {
      "id": 2,
      "url": "/api/image/2",
      "z-index": "4",
      "width": "50px",
      "height": "60px",
      "margin-top": "70px",
      "margin-left": "80px"
    }
  ],  
  "annotations":[
    {
      "text": "wello world",
      "z-index": "5",
      "font-size": "2em",
      "background-color": "#dadada",
      "width": "80px",
      "height": "35px",
      "margin-top": "0px",
      "margin-left": "0px",
      "word-wrap": "break-word"
    },
    {
      "text": "wello world2",
      "z-index": "6",
      "font-size": "2em",
      "background-color": "#dadada",
      "width": "90px",
      "height": "40px",
      "margin-top": "10px",
      "margin-left": "10px",
      "word-wrap": "break-word"
    }
  ]
}
```

## Изменить шаблон

- Метод - `PATCH`
- URL - `/api/template/<int:template_id>`
- Content - JSON
```json
{ 
  "template_id": 1,
  "width": "100px",
  "height": "35px",
  "images": [
    {
      "id": 1,
      "url": "/api/image/1",
      "z-index": "3",
      "width": "100px",
      "height": "35px",
      "margin-top": "0px",
      "margin-left": "0px"
    },
    {
      "id": 2,
      "url": "/api/image/2",
      "z-index": "4",
      "width": "80px",
      "height": "35px",
      "margin-top": "10px",
      "margin-left": "10px"
    }
  ],  
  "annotations":[
    {
      "text": "wello world",
      "z-index": "5",
      "font-size": "2em",
      "background-color": "#dadada",
      "width": "80px",
      "height": "35px",
      "margin-top": "0px",
      "margin-left": "0px",
      "word-wrap": "break-word"
    },
    {
      "text": "wello world2",
      "z-index": "6",
      "font-size": "2em",
      "background-color": "#dadada",
      "width": "90px",
      "height": "40px",
      "margin-top": "10px",
      "margin-left": "10px",
      "word-wrap": "break-word"
    }
  ]
}
```
- Вернет - то, что в content

## Загрузить изображение

- Метод - `POST`
- URL - `/api/image`
- Content - изображение
- Вернет - JSON 
```json
{ 
    "url": "/api/image/1",
}
```

## Получить изображение

- Метод - `GET`
- URL - `/api/image/<int:image_id>`
- Вернет - изображение
