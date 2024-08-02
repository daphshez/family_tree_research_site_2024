from flask import Flask
from flask_cors import CORS
from flask_mongoengine import MongoEngine
import os

from werkzeug.exceptions import NotFound

db = MongoEngine()

def deep_remove_empty_values(d: dict) -> dict:
    def internal_for_lists(l: list) -> list:
        result = []
        for v in l:
            if type(v) == dict:
                v = internal_for_dicts(v)
            if type(v) == list:
                v = internal_for_lists(v)
            if v is not None and v != [] and v != {}:
                result.append(v)
        return result

    def internal_for_dicts(d: dict) -> dict:
        result = {}
        for k, v in d.items():
            if type(v) == dict:
                v = internal_for_dicts(v)
            if type(v) == list:
                v = internal_for_lists(v)
            if v is not None and v != [] and v != {}:
                result[k] = v
        return result

    return internal_for_dicts(d)

def create_app(config=None):
    app = Flask(__name__)
    app.config.update(config or {})
    CORS(app, origins='*', vary_header=True)

    # set up database
    if 'MONGODB_SETTINGS' not in app.config:
        app.config['MONGODB_SETTINGS'] = {
            'host': os.environ['MONGO_CONNECTION_STRING'],
            'tz_aware': True
        }
    db.init_app(app)

    from familyresearch.endpoints import endpoints
    app.register_blueprint(endpoints, url_prefix='/api')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        print(path)
        if path.startswith('api'):
            raise NotFound()
        return app.send_static_file("index.html")

    return app


if __name__ == '__main__':
    create_app().run(debug=True)