import datetime
from collections import defaultdict
from typing import Optional

from bson import ObjectId
from flask import Blueprint, request
from mongoengine import Q
from werkzeug.exceptions import BadRequest

from familyresearch.family_relationships import add_other_parent, infer_siblings
from familyresearch.models import (Person, AdvancedDate, ResearchProject, ResearchNote, get_gender_value, Relationship,
                                   get_date_qualifier_value, PersonLink, role_choices, ResearchTask)
import re
import shortuuid

# from familyresearch.reingold_tilford import Node, ReingoldTilford
from tree_layout.walker1991 import Node, Walker1991

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
    count_pipeline = [
        {"$group": {"_id": "$research_project", "count": {"$sum": 1}}},
    ]
    note_counts = {doc['_id']: doc['count'] for doc in ResearchNote.objects().aggregate(count_pipeline)}
    task_counts = {doc['_id']: doc['count'] for doc in ResearchTask.objects().aggregate(count_pipeline)}
    return {
        'projects': [
            {
                'projectId': str(project.id),
                'projectDisplayName': project.name,
                'nNotes': note_counts.get(project.id, 0),
                'nTasks': task_counts.get(project.id, 0)
            } for project in ResearchProject.objects()
        ]
    }


@endpoints.get('/projects/<project_id>')
def get_project(project_id):
    project = ResearchProject.objects(id=project_id).get()
    project_notes = ResearchNote.objects(research_project=project_id).order_by('-sticky', '-last_update')
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
    sticky = d.get('sticky', False)
    note = ResearchNote(
        research_project=project_id,
        content=note_content,
        sticky=sticky,
        people=find_people(note_content),
    ).save()
    return {
        'noteId': str(note.id)
    }


@endpoints.post('/projects/<project_id>/notes/<note_id>')
def update_note(project_id, note_id):
    d = request.json
    note_content = d['content']
    sticky = d.get('sticky', False)
    ResearchNote.objects(id=note_id).modify(content=note_content,
                                            sticky=sticky,
                                            people=find_people(note_content),
                                            last_update=datetime.datetime.utcnow())
    return {}


@endpoints.get('/projects/<project_id>/notes/<note_id>')
def get_note(project_id, note_id):
    note = ResearchNote.objects(id=note_id).get()
    return {
        'noteId': str(note.id),
        'content': note.content,
        'created': note.created.isoformat(),
        'lastUpdate': note.last_update.isoformat(),
        'sticky': note.sticky
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


def render_a_person_for_list(person: Person):
    name_parts = person.display_name.split(' ')
    return deep_remove_empty_values({
        'personId': str(person.id),
        'personDisplayName': person.display_name,
        'name': {
            'first': name_parts[0],
            'last': name_parts[-1]
        },
        'birth': {
            'date': render_advanced_date(person.birth_date)
        },
        'isAlive': format_is_alive(person.is_alive),
        'death': {
            'date': render_advanced_date(person.death_date),
        }
    })


def render_people_for_list(query):
    people = [render_a_person_for_list(person) for person in query]
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

    relations_docs = Relationship.objects(Q(person1=person_id) | Q(person2=person_id))

    relations = [
        {
            'personId': str(r.person1.id) if str(r.person2.id) == person_id else str(r.person2.id),
            'otherPersonRole': reverse_role(r.person2_role) if str(r.person2.id) == person_id else r.person2_role,
            'relationshipOption': r.relationship_option
        } for r in relations_docs
    ]

    relations += infer_siblings(person_id, relations_docs)

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

    tasks = [
        {
            'taskId': str(task.id),
            'projectId': str(task.project.id),
            'task': task.task
        }
        for task in ResearchTask.objects(person=person_id).order_by('priority')
    ]

    if tasks:
        task_projects = {str(project.id): project.name for project in
                         ResearchProject.objects(id__in=list({t['projectId'] for t in tasks}))}
        for t in tasks:
            t['projectName'] = task_projects[t['projectId']]

    p = deep_remove_empty_values({
        'personId': str(person.id),
        'personDisplayName': person.display_name,
        'personDisplayNameNote': person.display_name_note,
        'birth': {
            'date': render_advanced_date(person.birth_date),
            'dateNote': person.birth_date.note if person.birth_date else None,
            'place': {
                'displayName': person.birth_place.display_name,
            } if person.birth_place else {},
            'placeNote': person.birth_place.note if person.birth_place else None,
        },
        'isAlive': format_is_alive(person.is_alive),
        'death': {
            'date': render_advanced_date(person.death_date),
            'dateNote': person.death_date.note if person.death_date else None,
            'place': {
                'displayName': person.death_place.display_name,
            } if person.death_place else {},
            'placeNote': person.death_place.note if person.death_place else None,
            'cause': person.cause_of_death,
            'causeNote': person.cause_of_death_note,
            'burialPlace': person.burial_place
        },
        'gender': person.get_gender_display(),
        'created': person.created.isoformat(),
        'lastUpdate': person.last_update.isoformat(),
        'relations': relations,
        'projects': projects,
        'links': [
            {
                'linkId': link.id,
                'url': link.url,
                'description': link.description
            } for link in person.links

        ],
        'overviewNote': person.overview_note,
        'tasks': tasks
    })
    print(p)
    return p


@endpoints.post('/people/<person_id>')
def update_person(person_id):
    d = request.json
    update = {}
    if 'personDisplayName' in d:
        update['set__display_name'] = d['personDisplayName']
    if 'personDisplayNameNote' in d:
        update['set__display_name_note'] = d['personDisplayNameNote']
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
        if 'cause' in d['death']:
            update['set__cause_of_death'] = d['death']['cause']
        if 'causeNote' in d['death']:
            update['set__cause_of_death_note'] = d['death']['causeNote']
        if 'burialPlace' in d['death']:
            update['set__burial_place'] = d['death']['burialPlace']
    if 'gender' in d:
        update['set__gender'] = get_gender_value(d['gender'])
    if 'overviewNote' in d:
        update['set__overview_note'] = d['overviewNote']

    update['set__last_update'] = datetime.datetime.utcnow()

    Person.objects(id=person_id).modify(**update)

    return {}


@endpoints.post('/people/relations')
def add_relationship():
    d = request.json
    person1, person2, role, options = (d['personId'], d['otherPersonId'], d['otherPersonRole'], d['relationshipOption'])
    if role not in role_choices + ['child']:
        raise BadRequest()
    if role == 'child':
        role = 'parent'
        person1, person2 = person2, person1

    Relationship(person1=person1,
                 person2=person2,
                 person2_role=role,
                 relationship_option=options).save()

    if role == 'parent':
        add_other_parent(person2, person1, options)

    return {}


@endpoints.delete('/people/relations')
def delete_relationships():
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
    link_id = shortuuid.uuid()
    Person.objects(id=person_id).modify(push__links=PersonLink(
        id=link_id,
        url=url,
        description=description
    ))
    return {'linkId': link_id}


@endpoints.delete('/people/<person_id>/links/<link_id>')
def remove_link(person_id, link_id):
    # todo: make it work with modify...
    r = Person.objects(id=person_id).modify(__raw__={
        '$pull': {'links': {'id': link_id}}
    })
    # print(link_id)
    # person = Person.objects(id=person_id).get()
    # person.links = [link for link in person.links if link.id != link_id]
    # person.save()
    return {}, 204


@endpoints.get('/projects/<project_id>/tasks')
def get_tasks(project_id):
    tasks = ResearchTask.objects(project=project_id).order_by('priority')
    people_id = list({task.person.id for task in tasks if task.person})
    people = {person.id: render_a_person_for_list(person) for person in Person.objects(id__in=people_id)}
    return {
        'tasks': [
            deep_remove_empty_values({
                'taskId': str(task.id),
                'task': task.task,
                'person': people[task.person.id] if task.person else None,
                'priority': task.priority,
                'created': task.created.isoformat()
            })
            for task in tasks
        ]
    }


@endpoints.post('/projects/<project_id>/tasks')
def create_task(project_id):
    d = request.json
    task = ResearchTask(
        project=project_id,
        task=d.get('task'),
        person=d.get('personId'),
        note=d.get('noteId')
    ).save()
    print("Task created", task)
    return {'taskId': str(task.id)}


@endpoints.put('/projects/<project_id>/tasks/<task_id>')
def update_task(project_id, task_id):
    d = request.json

    update = {}
    if 'personId' in d:
        update['set__person'] = d['personId']
    if 'task' in d:
        update['set__task'] = d['task']
    if 'noteId' in d:
        update['set__note'] = d['noteId']
    if 'priority' in d:
        update['set__priority'] = d['priority']

    print(update)
    r = ResearchTask.objects(id=task_id).modify(**update)
    print(r)
    return {}


@endpoints.delete('/projects/<project_id>/tasks/<task_id>')
def delete_task(project_id, task_id):
    ResearchTask.objects(id=task_id).delete()
    return {}


# todo: add spouses to tree
#       add ancestors to tree
#       support for minimum x and y

@endpoints.get('/trees')
def get_tree():
    # tree_type = 'pure-descendants'
    root = request.args['root']
    node_width = int(request.args['nodeWidth'])
    node_height = int(request.args['nodeHeight'])
    sibling_distance = int(request.args['siblingDistance'])
    subtree_distance = int(request.args['subtreeDistance'])
    generation_distance = int(request.args['generationDistance'])

    parent_to_children = get_all_pure_descendant_ids(root)  # maps parent id to a list of children id

    all_people_ids = [child
                      for children in parent_to_children.values()
                      for child in children] + [root]
    all_people = {str(person.id): person for person in Person.objects(id__in=all_people_ids)}

    tree_nodes = {root: Node(value=all_people[root].display_name,
                             width=node_width)}  # maps a person id to the person's node

    def recursive_add_children_to_tree(person_id):
        for child_id in parent_to_children[person_id]:
            tree_nodes[child_id] = Node(value=all_people[child_id].display_name,
                                        width=node_width,
                                        parent=tree_nodes[person_id])
            recursive_add_children_to_tree(child_id)

    recursive_add_children_to_tree(root)


    rt = Walker1991(sibling_separation=sibling_distance,
                    subtree_separation=subtree_distance,
                    level_separation=generation_distance,
                    node_height=node_height)
    rt.tree_position(tree_nodes[root])

    output_people = []
    for person in all_people.values():
        output_person = render_a_person_for_list(person)
        output_person['x'] = tree_nodes[str(person.id)].x
        output_person['y'] = tree_nodes[str(person.id)].y
        # output_person['y'] = 20 + tree_nodes[str(person.id)].level * (node_height + generation_distance)
        output_person['children'] = parent_to_children[str(person.id)]
        output_people.append(output_person)

    return {
        'people': output_people
    }


def get_all_pure_descendant_ids(root: str) -> dict[str, list[str]]:
    # returns a map from a person id, to the ids of all their children
    descendants = defaultdict(list)
    curr_gen_ids = [root]
    while curr_gen_ids:
        for relation in Relationship.objects(person2__in=curr_gen_ids, person2_role='parent'):
            descendants[str(relation.person2.id)].append(str(relation.person1.id))
        curr_gen_ids = [child
                        for parent in curr_gen_ids
                        for child in descendants[parent]]
    return descendants
