import sys
import os
import json, imp, ast
import configparser
from functools import wraps
import pymongo
from bson.objectid import ObjectId
from bson.json_util import dumps
from pymongo import MongoClient

import flask_restplus

from flask import Blueprint, request, abort, Response, jsonify, url_for, session
from flask import current_app as app
from flask_restplus import Api, Resource, fields, reqparse
from DbHelper import DbHelper

DEBUG = True

blueprint = Blueprint('db',__name__,url_prefix='/api/db')
api = Api(blueprint)
ns = api.namespace('db',description='Simple Flask Ldap App')


add_user_model = api.model("add_user_model", {
    "firstName": fields.String("firstName"),
    "lastName": fields.String("lastName"),
    "dob": fields.String("dob"),
    "email": fields.String("email"),
    "country": fields.String("country"),
    "passwordHash": fields.String("passwordHash")
})



utils = imp.load_source('*', './db/utils.py')

@ns.route("/<collection>")
class Home(Resource):
    # method_decorators=[must_auth]
    def get(self, collection=None):
        """
        Function to get the dbs.
        """
        try:
            if collection is None:
                return Response('Collection name cannot be null', status = 500)
            dbhelper =DbHelper(collectionName=collection)
            q_params = utils.parse_q_params(request.query_string)
            if q_params:
                query = {k: ObjectId(v) if isinstance(v, str) and k=='_id' else v for k, v in q_params.items()}
                records_fetched = dbhelper.collection.find(query)
                if records_fetched.count() > 0:
                    return Response(dumps(records_fetched),status = 200)
                else:
                    return "No Records found", 404
            else:
                if dbhelper.collection.find().count > 0:
                    return Response(dumps(dbhelper.collection.find()), mimetype='application/json')
                else:
                    return jsonify([])
        except:
            raise #return "", 500

    #@api.expect(add_user_model)    
    def post(self, collection=None):
        """
        Function to add new db(s).
        """
        try:
            if collection is None:
                return Response('Collection name cannot be null', status = 500)
            dbhelper =DbHelper(collectionName=collection)
            try:
                valuestr = json.dumps(request.get_json(),separators=(',',':'), sort_keys=True)
                body = json.loads(valuestr)
            except:
                return Response("Request cannot be parsed as json", 500)

            if '_id' in body: del body['_id']

            record_created = dbhelper.collection.insert(body)

            if isinstance(record_created, list):
                return Response(json.dumps([str(v) for v in record_created]), status=201, mimetype = 'application/json')
            else:
                return Response(json.dumps(str(record_created)), status=201, mimetype = 'application/json')
        except:
            raise #return "", 500

    #@api.expect(add_user_model)    
    def put(self, collection=None,_id=None):
        """
        Function to update a db.
        """
        try:
            if collection is None:
                return Response('Collection name cannot be null', status = 500)
            dbhelper =DbHelper(collectionName=collection)
            q_params = utils.parse_q_params(request.query_string)

            try:
                valuestr = json.dumps(request.get_json(),separators=(',',':'), sort_keys=True)
                body = json.loads(valuestr)
            except:
                return Response("Request cannot be parsed as json", 500)
            if q_params and q_params.get('_id'):
                if '_id' in body: del body['_id']
                records_updated = dbhelper.collection.update_one({"_id": ObjectId(q_params.get('_id'))}, {"$set" : body})
            else:
                return Response("ObjectId not provided", 404)

            if records_updated.modified_count > 0:
                return Response(json.dumps("Updated {} items!".format(records_updated.modified_count)), status=200, mimetype = 'application/json')
            else:
                return "", 404
        except:
            raise #return "", 500

    
    def delete(self, collection=None, _id=None):
        """
        Function to delete a db.
        """
        try:
            if collection is None:
                return Response('Collection name cannot be null', status = 500)
            dbhelper =DbHelper(collectionName=collection)
            q_params = utils.parse_q_params(request.query_string)

            if q_params and q_params.get('_id'):
                delete_user = dbhelper.collection.delete_one({"_id": ObjectId(q_params.get('_id'))})
                if delete_user.deleted_count > 0 :
                    return Response("Deleted {} items!".format(delete_user.deleted_count), status=204, mimetype = 'application/json')
                else:
                    return Response("Record not found", 404)
            else:
                return Response("ObjectId not provided", 404)
        except:
            raise #return "", 500


