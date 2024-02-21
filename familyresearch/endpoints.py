import datetime

from flask import Blueprint, request

from familyresearch.models import Person, AdvancedDate, ResearchProject, ResearchNote

endpoints = Blueprint('endpoints', __name__)


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


@endpoints.post('/login')
def login():
    return {
        'token': 'mysecrettoken',
        'username': 'user123',
        'email': 'user123@gmail.com'
    }


@endpoints.put('/projects/create')
def create_project():
    d = request.json
    project_display_name = d['projectDisplayName']
    project = ResearchProject(name=project_display_name).save()
    return {
        'projectId': str(project.id),
        'projectDisplayName': project_display_name
    }


@endpoints.get('/projects')
def list_projects():
    note_count_pipeline = [
        {"$group": {"research_project": "$research_project", "count": {"$sum": 1}}},
    ]
    docs = ResearchProject.objects().aggregate(note_count_pipeline)
    counts = {doc['research_project']: doc['count'] for doc in docs}

    return {
        'projects': [
            {
                'projectId': str(project.id),
                'projectDisplayName': project.name,
                'nNotes': counts.get(project.id, 0)
            } for project in ResearchProject.objects()
        ]
    }


@endpoints.get('/projects/<str:projectId>')
def get_project(project_id):
    project = ResearchProject.objects(id=project_id).get()
    project_notes = ResearchNote.objects(research_project=project_id)
    return {
        'projectId': str(project.id),
        'projectDisplayName': project.name,
        'notes': [
            {
                'noteId': str(note.id),
                'content': note.content,
                'created': note.created.isoformat(),
                'lastUpdated': note.last_updated.isoformat()
            } for note in project_notes
        ]
    }


@endpoints.put('/projects/<str:project_id>/notes/create')
def create_note(project_id):
    d = request.json
    note_content = d['content']
    # todo: extract people
    note = ResearchNote(
        research_project=project_id,
        content=note_content
    ).save()
    return {
        'noteId': str(note.id)
    }


@endpoints.post('/projects/<str:projectId>/notes/<str:note_id>')
def update_note(project_id, note_id):
    d = request.json
    note_content = d['content']
    ResearchNote.objects(id=note_id).modify(content=note_content,
                                            last_updated=datetime.datetime.utcnow())
    return "", 204


@endpoints.post('/projects/<str:projectId>/notes/<str:note_id>')
def get_note(project_id, note_id):
    note = ResearchNote(id=note_id).get()
    return {
        'noteId': str(note.id),
        'content': note.content,
        'created': note.created.isoformat(),
        'lastUpdated': note.last_updated.isoformat()
    }

# @endpoints.put('/people/create')
# def create_person():
#     json = request.json
#
#
# @endpoints.get('/people')
# def list_people():
#     return {
#         'people': [
#             {
#                 'personId': str(person.id),
#                 'personDisplayName': person.display_name,
#             }
#             for person in Person.objects()
#         ]
#     }
#
#
# @endpoints.get('/people/<person_id>')
# def get_person(person_id):
#     person = Person.objects.get(id=person_id)
#
#     pipeline = [
#         {
#             '$match': {
#                 "people": person.id,
#             }
#         },
#         {
#             '$sort': {'last_modified': -1}
#         },
#         {
#             '$group': {
#                 '_id': '$research_project',
#                 'note': {'$first': '$$CURRENT'},
#             }
#         },
#
#     ]
#
#     project_notes = ResearchNote.objects().aggregate(pipeline)
#
#     def render_advanced_date(advanced_date: AdvancedDate):
#         if not advanced_date:
#             return {}
#         return {
#             'year': advanced_date.year,
#             'month': advanced_date.month,
#             'day': advanced_date.day_of_month,
#             'qualifier': advanced_date.get_qualifier_display(),
#             'note': advanced_date.note
#         }
#
#     return deep_remove_empty_values({
#         'personId': str(person.id),
#         'personDisplayName': person.display_name,
#         'personDisplayNameNote': person.display_name_note,
#         'birth': {
#             'date': render_advanced_date(person.birth_date),
#             'place': {
#                 'displayName': person.birth_place.display_name,
#                 'note': person.birth_place.note
#             } if person.birth_place else {}
#         },
#         'death': {
#             'isAlive': person.get_is_alive_display(),
#             'isAliveNote': person.is_alive_note,
#             'date': render_advanced_date(person.death_date),
#             'place': {
#                 'displayName': person.death_place.display_name,
#                 'note': person.death_place.note
#             } if person.death_place else {},
#             'cause': person.get_cause_of_death_display(),
#             'causeNote': person.cause_of_death_note
#         },
#         'gender': person.get_gender_display(),
#         'genderNote': person.gender_note,
#         'note': person.person_note,
#         'relations': [
#             {
#                 'personId': str(relation.other_person),
#                 'personDisplayName': relation.other_person_display_name,
#                 'otherPersonRole': relation.get_their_role_display(),
#                 'relationshipType': relation.get_relationship_type_display(),
#                 'note': relation.note
#             } for relation in person.related_people
#         ],
#         'projects': [{
#             'projectId': str(doc['_id']),
#             'projectDisplayName': doc['note']['project_name'],
#             'projectNote': {
#                 'note': doc['note']['note'],
#                 'lastModifiedOn': doc['note']['last_modified'].isoformat()
#             }
#         } for doc in project_notes],
#         'createdOn': person.created_on.isoformat(),
#         'lastModifiedOn': person.last_modified.isoformat(),
#
#     })
