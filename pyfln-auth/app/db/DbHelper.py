from flask import current_app
from pymongo import MongoClient
import string

class DbHelper:
    def __init__(self, dbName=None, collectionName=None):
        if collectionName is None:
            raise 'The collection Name cannot be null'
        else:
            self.collection_name = collectionName
        self.db_host = current_app.config['DATABASE_HOSTNAME']
        self.db_port = current_app.config['DATABASE_PORT']
        if dbName is None:
            self.db_name = current_app.config['DATABASE_NAME']
        self.client = MongoClient(self.db_host,int(self.db_port.strip(string.ascii_letters)))
        self.db = self.client[self.db_name]
        self.collection = self.db[self.collection_name]