from flask import Flask
from flask_cors import CORS
from flask_mongoengine import MongoEngine

db = MongoEngine()


def create_app(config=None):
    app = Flask(__name__)
    app.config.update(config or {})
    CORS(app, origins='*', vary_header=True)

    # set up database
    # if 'MONGODB_SETTINGS' not in app.config:
    #     app.config['MONGODB_SETTINGS'] = {
    #         'host': os.environ['MONGO_CONNECTION_STRING'],
    #         'tz_aware': True
    #     }
    # db.init_app(app)

    from .endpoints import endpoints
    app.register_blueprint(endpoints, url_prefix='/api')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        # check for an authenicat

        return app.send_static_file("index.html")

    return app
