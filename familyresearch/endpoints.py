import datetime
from collections import defaultdict
from typing import Optional

from bson import ObjectId
from flask import Blueprint, request
from mongoengine import Q

from familyresearch.models import (Person, AdvancedDate, ResearchProject, ResearchNote, get_gender_value, Relationship,
    get_date_qualifier_value, PersonLink)
import re
import shortuuid

endpoints = Blueprint('endpoints', __name__)


def format_is_alive(is_alive: Optional[bool]):
    if is_alive is None:
        return 'unknown'
    return 'yes' if is_alive else 'no'


def parse_is_alive(is_alive: Optional[str]):
    if is_alive is None:
        return None
    if is_alive.lower() == 'yes':
        return True
    if is_alive.lower() == 'no':
        return False
    if is_alive.lower() == 'unknown':
        return None
    raise ValueError(f'Unknown value {is_alive}')


def find_people(note_content):
    search_regexp = re.compile(r'\(/people/([a-f\d]{24})\)')
    return [ObjectId(person_id) for person_id in search_regexp.findall(note_content)]


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
        {"$group": {"_id": "$research_project", "count": {"$sum": 1}}},
    ]
    docs = ResearchNote.objects().aggregate(note_count_pipeline)
    counts = {doc['_id']: doc['count'] for doc in docs}

    return {
        'projects': [
            {
                'projectId': str(project.id),
                'projectDisplayName': project.name,
                'nNotes': counts.get(project.id, 0)
            } for project in ResearchProject.objects()
        ]
    }


@endpoints.get('/projects/<project_id>')
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
                'lastUpdate': note.last_update.isoformat()
            } for note in project_notes
        ]
    }


@endpoints.put('/projects/<project_id>/notes/create')
def create_note(project_id):
    d = request.json
    note_content = d['content']
    note = ResearchNote(
        research_project=project_id,
        content=note_content,
        people=find_people(note_content)
    ).save()
    return {
        'noteId': str(note.id)
    }


@endpoints.post('/projects/<project_id>/notes/<note_id>')
def update_note(project_id, note_id):
    d = request.json
    note_content = d['content']
    ResearchNote.objects(id=note_id).modify(content=note_content,
                                            people=find_people(note_content),
                                            last_update=datetime.datetime.utcnow())
    return {}, 204


@endpoints.get('/projects/<project_id>/notes/<note_id>')
def get_note(project_id, note_id):
    note = ResearchNote.objects(id=note_id).get()
    return {
        'noteId': str(note.id),
        'content': note.content,
        'created': note.created.isoformat(),
        'lastUpdate': note.last_update.isoformat()
    }


def render_advanced_date(advanced_date: AdvancedDate):
    if not advanced_date:
        return {}
    return {
        'year': advanced_date.year,
        'month': advanced_date.month,
        'day': advanced_date.day,
        'qualifier': advanced_date.get_qualifier_display(),
    }


def render_people_for_list(query):
    people = [
            deep_remove_empty_values({
                'personId': str(person.id),
                'personDisplayName': person.display_name,
                'birth': {
                    'date': render_advanced_date(person.birth_date)
                },
                'isAlive': format_is_alive(person.is_alive),
                'death': {
                    'date': render_advanced_date(person.death_date),
                }
            })
            for person in query
        ]
    people.sort(key=lambda p: (p['personDisplayName'].split(" ")[-1], p['personDisplayName']))
    return {'people': people}


@endpoints.get('/people')
def list_people():
    return render_people_for_list(Person.objects())


@endpoints.put('/people/create')
def create_person():
    d = request.json
    display_name = d['personDisplayName']
    person = Person(display_name=display_name).save()
    return {
        'personId': str(person.id),
        'personDisplayName': display_name
    }


@endpoints.get('/people/<person_id>')
def get_person(person_id):
    def reverse_role(r):
        if r == 'parent': return 'child'
        if r == 'child': return 'parent'
        return r

    relations = [
        {
            'personId': str(r.person1.id) if str(r.person2.id) == person_id else str(r.person2.id),
            'otherPersonRole': reverse_role(r.person2_role) if str(r.person2.id) == person_id else r.person2_role,
            'relationshipOption': r.relationship_option
        } for r in
        Relationship.objects(Q(person1=person_id) | Q(person2=person_id))
    ]

    required_ids = {person_id} | {p['personId'] for p in relations}
    people = {str(person.id): person for person in Person.objects(id__in=required_ids)}
    person = people[person_id]

    for r in relations:
        r['personDisplayName'] = people[r['personId']].display_name

    notes_by_project = defaultdict(list)
    for note in ResearchNote.objects(people=person_id):
        notes_by_project[str(note.research_project.id)].append(
            {
                'noteId': str(note.id),
                'content': note.content,
                'created': note.created.isoformat(),
                'lastUpdate': note.last_update.isoformat()
            }
        )

    projects = [
        {
            'projectId': str(project.id),
            'projectDisplayName': project.name,
            'notes': notes_by_project[str(project.id)]
        }
        for project in ResearchProject.objects(id__in=notes_by_project.keys())
    ]

    return deep_remove_empty_values({
        'personId': str(person.id),
        'personDisplayName': person.display_name,
        'personDisplayNameNote': person.display_name_note,
        'birth': {
            'date': render_advanced_date(person.birth_date),
            'dateNote': person.birth_date.note,
            'place': {
                'displayName': person.birth_place.display_name,
            } if person.birth_place else {},
            'placeNote': person.birth_place.note if person.birth_place else None,
        },
        'isAlive': format_is_alive(person.is_alive),
        'death': {
            'date': render_advanced_date(person.death_date),
            'dateNote': person.death_date.note,
            'place': {
                'displayName': person.death_place.display_name,
            } if person.death_place else {},
            'placeNote': person.death_place.note if person.death_place else None,
        },
        'gender': person.get_gender_display(),
        'created': person.created.isoformat(),
        'lastUpdate': person.last_update.isoformat(),
        'relations': relations,
        'projects': projects,
        'links': [
            {
                'id': link.id,
                'url': link.url,
                'description': link.description
            } for link in person.links
        ]
    })


@endpoints.post('/people/<person_id>')
def update_person(person_id):
    d = request.json
    update = {}
    if 'personDisplayName' in d:
        update['set__display_name'] = d['personDisplayName']
    if 'birth' in d:
        if 'date' in d['birth']:
            update['set__birth_date__day'] = d['birth']['date'].get('day')
            update['set__birth_date__month'] = d['birth']['date'].get('month')
            update['set__birth_date__year'] = d['birth']['date'].get('year')
            if 'qualifier' in d['birth']['date']:
                update['set__birth_date__qualifier'] = get_date_qualifier_value(d['birth']['date']['qualifier'])
        if 'dateNote' in d['birth']:
            update['set__birth_date__note'] = d['birth']['dateNote']
        if 'place' in d['birth']:
            update['set__birth_place__display_name'] = d['birth']['place']['displayName']
        if 'placeNote' in d['birth']:
            update['set__birth_place__note'] = d['birth']['placeNote']
    if 'isAlive' in d:
        update['set__is_alive'] = parse_is_alive(d['isAlive'])
    if 'death' in d:
        if 'date' in d['death']:
            update['set__death_date__day'] = d['death']['date'].get('day')
            update['set__death_date__month'] = d['death']['date'].get('month')
            update['set__death_date__year'] = d['death']['date'].get('year')
            if 'qualifier' in d['death']['date']:
                update['set__death_date__qualifier'] = get_date_qualifier_value(d['death']['date']['qualifier'])
            if 'dateNote' in d['death']:
                update['set__death_date__note'] = d['death']['dateNote']
        if 'place' in d['death']:
            update['set__death_place__display_name'] = d['death']['place']['displayName']
        if 'placeNote' in d['death']:
            update['set__death_place__note'] = d['death']['placeNote']
    if 'gender' in d:
        update['set__gender'] = get_gender_value(d['gender'])

    print(d)
    print(update)
    Person.objects(id=person_id).modify(**update)

    return {}


@endpoints.post('/people/relations')
def add_relationship():
    d = request.json
    Relationship(person1=d['personId'],
                 person2=d['otherPersonId'],
                 person2_role=d['otherPersonRole'],
                 relationship_option=d['relationshipOption']).save()
    return {}, 204


@endpoints.delete('/people/relations')
def add_relationships():
    d = request.json
    person1 = ObjectId(d['person1'])
    person2 = ObjectId(d['person2'])
    Relationship.objects(
        (Q(person1=person1) & Q(person2=person2)) |
        (Q(person1=person2) & Q(person2=person1))
    ).delete()
    return {}, 204


@endpoints.post('/people/search')
def search_people():
    raw_search_term = request.json['searchTerm'].upper()
    max_results = request.json['maxResults']
    search_term = "".join(d for d in raw_search_term if str.isupper(d))
    r = re.compile(f'.*{search_term}.*', re.IGNORECASE)
    query = Person.objects(display_name=r)
    if max_results:
        query = query.limit(max_results)

    return render_people_for_list(query)


@endpoints.post('/people/<person_id>/links/add')
def add_links(person_id):
    d = request.json
    url = d['url']
    description = d['description']
    Person.objects(id=person_id).modify(links__push=PersonLink(
        id=shortuuid.uuid(),
        url=url,
        description=description
    ))
    return {}, 204


@endpoints.delete('/people/<person_id>/links/<link_id>')
def remove_link(person_id, link_id):
    Person.objects(id=person_id).modify(__raw__={
        '$pull': { 'links.id': link_id}
    })
    return {}, 204