import pytest as pytest
from mongoengine.connection import _get_db
from mongomock import MongoClient

from familyresearch import create_app


@pytest.fixture
def client():
    app = create_app({
        'MONGODB_SETTINGS': {
            'mongo_client_class': MongoClient,
            'tz_aware': True
        },
        'TESTING': True
    })
    client = app.test_client()
    with client, app.app_context():
        yield client

    db = _get_db()
    db.client.drop_database(db)
