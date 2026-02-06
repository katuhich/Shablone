from peewee import SqliteDatabase, Model, TextField, ForeignKeyField

db = SqliteDatabase('db.db')


class Table(Model):
    
    class Meta:
        database = db


class MetalType(Table):
    name = TextField()


class Brand(Table):
    name = TextField()


class ProductType(Table):
    name = TextField()


class ProductSubtype(Table):
    name = TextField()
    product_type = ForeignKeyField(ProductType)


class Template(Table):
    json = TextField(default='{"width": 500, "height": 700, "color": "#ffffff", "entities": []}')
    brand = ForeignKeyField(Brand)
    metal_type = ForeignKeyField(MetalType)
    product_subtype = ForeignKeyField(ProductSubtype)

class Image(Table):
    pass

class Product(Table):
    product_subtype = ForeignKeyField(ProductSubtype)
    brand = ForeignKeyField(Brand)
    metal_type = ForeignKeyField(MetalType)
    url = TextField()

db.connect()
db.create_tables([MetalType, Brand, ProductType, ProductSubtype, Template, Image, Product])
db.close()