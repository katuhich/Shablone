import PIL.Image
from flask import Flask, request, render_template, abort, jsonify, send_file
from models import Brand, ProductSubtype, ProductType, Template, Image, MetalType, Product
import os
import zipfile
import subprocess
import requests
import shutil
from flask import json
import PIL
from fonts import font



json.provider.DefaultJSONProvider.ensure_ascii = False
app = Flask(__name__)


@app.route('/template/<int:template_id>/')
def upload(template_id):
  return render_template('edit_pattern.html', template_id=template_id)

@app.route('/edit/')
def edit():
  # return render_template('canvas.html')
  return render_template('index_copy.html')


@app.route('/')
def hello():
  return render_template('index.html')

def run_cmd(cmd):
  print(f"\033[96m{cmd}\033[0m")
  subprocess.check_output(cmd, shell=True)

def reset_metadata(image_path):
  image = PIL.Image.open(image_path)
  data = list(image.getdata())
  image_without_metadata = PIL.Image.new(image.mode, image.size)
  image_without_metadata.putdata(data)
  image_without_metadata.save(image_path, format="PNG", optimize=True, quality=95)

def generate_cmd_by_image(entity: dict, result_path):

  if entity['type'] == 'image':
    try:
      image_path = os.path.join('images', f'{int(entity["id"])}.png')
    except:
      image_path = os.path.join('image', str(entity["id"]))
  elif entity['type'] == 'product':
    image_path = os.path.join('products', f'{int(entity["id"])}.png')

  image_path = os.path.join(os.getcwd(), image_path).replace("\\", "\\\\")
  tmp_path = 'tmp.png'
  size = f'{entity["width"]}x{entity["height"]}'
  loc = f'+{entity["x"]}+{entity["y"]}'

  if entity.get("shadow", False):

    # Отрисовка тени
    run_cmd(f'copy "{image_path}" "{tmp_path}"')
    reset_metadata(tmp_path)
    radius = 10
    run_cmd(f'magick "{tmp_path}" -resize {size}\\!  -background none -shadow 50x{radius}+0+0 "{tmp_path}"')
    run_cmd(f'magick "{result_path}" -colorspace sRGB "{tmp_path}" -colorspace sRGB -geometry +{entity["x"]-radius-5}+{entity["y"]-radius-5} -composite "{result_path}"')

  # Отрисовка изображения
  run_cmd(f'copy "{image_path}" "{tmp_path}"')
  reset_metadata(tmp_path)
  run_cmd(f'magick "{tmp_path}" -resize {size}\\! "{tmp_path}"')
  run_cmd(f'magick "{result_path}" -colorspace sRGB "{tmp_path}" -colorspace sRGB -geometry {loc} -composite "{result_path}"')

def generate_cmd_by_text(entity: dict, result_path):
  font_ttf = font.get_path(entity["font"])
  fontSize = entity["fontSize"]
  color = entity["color"]
  loc = f'+{entity["x"]}+{entity["y"]}'
  text = entity["text"]
  weight = f'-stroke "{color}" -strokewidth 1' if entity["fontWeight"] == 'bold' else ''
  cmd = f'magick "{result_path}" -font "{font_ttf}" -pointsize {fontSize} {weight} -fill "{color}" -annotate {loc} "{text}" "{result_path}"'
  print(f"\033[96m{cmd}\033[0m")
  subprocess.check_output(cmd, shell=True)

def generate_template(template: Template):

  if not template.json:
    return

  path = os.path.join('projects', f'{template.id}')
  if not os.path.exists(path):
    os.mkdir(path)
    os.mkdir(os.path.join(path, 'tmp'))

  json_text = template.json.replace('True', 'true').replace('False', 'false')
  print(f"\033[95m{json_text}\033[0m")
  params: dict = json.loads(json_text)
  result_path = os.path.join(os.getcwd(), path, "result.png").replace("\\", "\\\\")
  cmd = f'magick -size {params["width"]}x{params["height"]} xc:{params["color"]} "{result_path}"'
  print(f"\033[96m{cmd}\033[0m")
  subprocess.check_output(cmd, shell=True)

  for entity in params['entities']:
    if entity['type'] in ['image', 'product']:
      generate_cmd_by_image(entity, result_path)
    elif entity['type'] == 'text':
      generate_cmd_by_text(entity, result_path)



# AAAAAAAAAAAAAAAAAAAAAAPPPPPPPPPPPPPPPPPPPPPPPPPPIIIIIIIIIIIIIIIIIIIIIII



@app.route('/api/productsubtype/', methods=['GET'])
def get_product_subtypes():
  '''Получает подтипы по указанному фильтру'''
  product_subtypes = ProductSubtype.filter(**request.args)
  result = {'count':product_subtypes.count(), 'entities':[]}
  for item in product_subtypes:
    result['entities'].append({
      'id':item.id,
      'name':item.name,
      'producttype_id':item.product_type.id
    })
  return jsonify(result)

@app.route('/api/producttype/', methods=['GET'])
def get_product_types():
  '''Получает типы по указанному фильтру'''
  product_types = ProductType.filter()
  result = {'count':product_types.count(), 'entities':[]}
  for item in product_types:
    result['entities'].append({
      'id':item.id,
      'name':item.name
    })
  return jsonify(result)


@app.route('/api/brand/', methods=['GET'])
def get_brands():
  '''Получает бренды по указанному фильтру'''
  brands = Brand.filter()
  result = {'count':brands.count(), 'entities':[]}
  for item in brands:
    result['entities'].append({
      'id':item.id,
      'name':item.name
    })
  return jsonify(result)

@app.route('/api/metaltype/', methods=['GET'])
def get_metaltypes():
  '''Получает тип металла по указанному фильтру'''
  metal_types = MetalType.filter()
  result = {'count':metal_types.count(), 'entities':[]}
  for item in metal_types:
    result['entities'].append({
      'id':item.id,
      'name':item.name
    })
  return jsonify(result)

@app.route('/api/template/', methods=['GET', 'POST'])
def api_template():
  """Создает шаблон"""
  if request.method == 'POST':
    template = Template.create(**request.json)
    return jsonify({'template_id':template.id}), 200
  
  params = {}
  for key in ['brand_id', 'product_subtype_id', 'metal_type_id']:
    if key in request.args:
      params[key] = request.args[key]
  
  templates = []
  for template in Template.filter(**params):
    templates.append(
      {
        'id': template.id,
        'brand': template.brand_id,
        'metal_type': template.metal_type_id,
        'product_subtype': template.product_subtype_id,
      }
    )
  return jsonify({"count": len(templates), "entities": templates}), 200
  


@app.route('/api/template/<int:template_id>/', methods=['GET', 'PATCH', 'DELETE'])
def get_template(template_id):
  """Пролучить и обновить шаблон"""
  template = Template.get_or_none(id=template_id)
  if template is None:
    return jsonify({'error': 'Шаблон не найден'}), 400
  
  if request.method == 'PATCH':
    for entity in request.json['entities']:
      if entity['type'] == 'image' and 'image' in entity:
        del entity['image']
    template.json = str(request.json).replace("'",'"').replace('True', 'true').replace('False', 'false')
    template.save()
    generate_template(template)
  
  if request.method == 'DELETE':
    template.delete_instance()

  return template.json, 200

def zip_folder(folder_path, zip_path):
    # Создаем объект zip файла
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Проходим по всем директориям и файлам в указанной папке
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                # Получаем полный путь к файлу
                file_path = os.path.join(root, file)
                # Получаем относительный путь файла к архивируемой папке
                arcname = os.path.relpath(file_path, start=folder_path)
                # Добавляем файл в архив
                zipf.write(file_path, arcname)

def move_file(src_file, dest_dir):
    # Проверяем, существует ли исходный файл
    if not os.path.isfile(src_file):
        print(f'Исходный файл не существует: {src_file}')
        return

    # Проверяем, существует ли каталог назначения
    if not os.path.isdir(dest_dir):
        print(f'Каталог назначения не существует: {dest_dir}')
        return

    # Получаем имя файла из пути исходного файла
    file_name = os.path.basename(src_file)

    # Полный путь к новому файлу в каталоге назначения
    dest_file = os.path.join(dest_dir, file_name)

    try:
        # Перемещаем файл
        shutil.move(src_file, dest_file)
    except Exception as e:
        print(f'Ошибка при перемещении файла: {e}')

def get_product_from_entities(entities: list):
  for entity in entities:
    if entity['type'] == 'image' and entity['id'] == 'product.png':
      return entity

def rename_file(src_file, new_name):
    # Проверяем, существует ли исходный файл
    if not os.path.isfile(src_file):
        print(f'Исходный файл не существует: {src_file}')
        return

    # Получаем директорию исходного файла
    dir_name = os.path.dirname(src_file)

    # Полный путь к новому файлу
    new_file_path = os.path.join(dir_name, new_name)

    try:
        # Переименовываем файл
        os.rename(src_file, new_file_path)
    except Exception as e:
        print(f'Ошибка при переименовании файла: {e}')

@app.route('/api/template/<int:template_id>/zip/', methods=['GET'])
def get_template_zip(template_id):
  template = Template.get_by_id(template_id)
  products = Product.filter(
    product_subtype=template.product_subtype,
    brand=template.brand,
    metal_type=template.metal_type
  )

  params: dict = json.loads(template.json)
  entity = get_product_from_entities(params['entities'])
  if entity is None:
    return jsonify({'error': 'Для генерации изображений требуется разместить на холсте изделие!'}), 404
  
  entity['type'] = 'product'
  project_path = os.path.join(os.getcwd(), 'projects', f'{template.id}')
  shutil.rmtree(project_path)

  for product in products:
    response = requests.get(product.url)

    if response.status_code != 200:
      return jsonify({'error': f'Не удалось скачать {product.url}'}), 404
    
    image_path = os.path.join(os.getcwd(), 'products', f'{product.id}.png')
    with open(image_path, 'wb') as file:
      print(image_path)
      file.write(response.content)
    
    entity['id'] = product.id
    template.json = str(params).replace("'",'"')

    generate_template(template)
    rename_file(
      os.path.join(project_path, 'result.png'),
      os.path.join(project_path, f'{product.id}.png'),
    )
  
  zip_file_path = os.path.join(os.getcwd(), 'projects', f'{template.id}.zip')
  zip_folder(project_path, zip_file_path)   
  
  return send_file(
    path_or_file=zip_file_path,
    download_name='archive.zip',
    as_attachment=True
  )


@app.route('/api/template/<int:template_id>/image/', methods=['GET'])
def get_template_image(template_id):
  
  template = Template.get_or_none(id=template_id)
  if template is None:
    return jsonify({'error': 'Шаблон не найден'}), 400

  path = os.path.join(os.getcwd(), 'projects', f'{template.id}', 'result.png')
  if not os.path.exists(path):
    generate_template(template=template)

  return send_file(
    path_or_file=path,
    mimetype='image/png', 
    as_attachment=False
  )

@app.route('/api/image/', methods=['POST'])
def upload_file():
    """Загрузить изображения на сервер"""

    # Проверка наличия файла в запросе
    if 'image' not in request.files:
        return jsonify({'error': 'Файл в запросе не найден'}), 400

    file = request.files['image']

    image = Image.create()
    file.save(os.path.join('images', f'{image.id}.png'))


    return jsonify({'message': 'Всё прекрасно. Файл загружен.', 'image': image.id}), 200


@app.route('/api/image/<string:image_name>/', methods=['GET'])
def get_image_by_name(image_name):
  """Отправляет пользователю изображение"""
  
  return send_file(os.path.join('image',  image_name), mimetype='image/png', as_attachment=False)


@app.route('/api/image/<int:image_id>/', methods=['GET'])
def get_image_by_id(image_id):
  """Отправляет пользователю изображение"""
  
  image = Image.get_or_none(id=image_id)
  if image is None:
    return jsonify({'error': 'Image not found'}), 404
  
  # Отправляем временный файл в качестве ответа
  return send_file(os.path.join('images',  f'{image.id}.png'), mimetype='image/png', as_attachment=False)


if __name__ == '__main__':
  for path in ['images', 'projects', 'products']:
      if not os.path.exists(path):
        os.mkdir(path)

  app.run(debug=True)
