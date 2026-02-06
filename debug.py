import requests

url = 'https://sokolov.ru/jewelry-catalog/earrings/silver/'

response = requests.get(url)
print(response.text)
