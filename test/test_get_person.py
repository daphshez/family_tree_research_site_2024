import datetime

from familyresearch.models import Person, AdvancedDate, Place, ResearchProject, ResearchNote
from . import client


def test_get_empty_person(client):
    person = Person(
        created_on=datetime.datetime(2024, 1, 2, 3, 4, 5),
        last_modified=datetime.datetime(2024, 10, 11, 12, 13, 14),
    ).save()

    r = client.get(f'/people/{person.id}')
    assert r.status_code == 200, r.text
    assert r.json == {
        'personId': str(person.id),
        'createdOn': '2024-01-02T03:04:05+00:00',
        'lastModifiedOn': '2024-10-11T12:13:14+00:00',
    }


def test_get_person(client):
    person = Person(
        created_on=datetime.datetime(2024, 1, 2, 3, 4, 5),
        last_modified=datetime.datetime(2024, 10, 11, 12, 13, 14),
        display_name='Somebody Someone',
        display_name_note='name note',
        birth_date=AdvancedDate(year=1900,
                                month=1,
                                day_of_month=1,
                                note='birth date note'),
        birth_place=Place(display_name='Barnet UK', note='birth place note'),
        is_alive=0,
        is_alive_note='is alive note',
        death_date=AdvancedDate(year=2000,
                                month=2,
                                day_of_month=2,
                                qualifier=2,
                                note='death date note'),
        death_place=Place(display_name='Somewhere', note='death place note'),
        cause_of_death=1,
        cause_of_death_note='cause of death note',
        gender=0,
        gender_note='gender note',
        person_note='person note'
    ).save()

    r = client.get(f'/people/{person.id}')
    assert r.status_code == 200, r.text
    assert r.json == {
        'personId': str(person.id),
        'createdOn': '2024-01-02T03:04:05+00:00',
        'lastModifiedOn': '2024-10-11T12:13:14+00:00',
        'personDisplayName': 'Somebody Someone',
        'personDisplayNameNote': 'name note',
        'birth': {
            'date': {
                'year': 1900, 'month': 1, 'day': 1, 'qualifier': 'exact',
                'note': 'birth date note'
            },
            'place': {
                'displayName': 'Barnet UK', 'note': 'birth place note'
            }
        },
        'death': {
            'isAlive': 'no',
            'isAliveNote': 'is alive note',
            'date': {
                'year': 2000, 'month': 2, 'day': 2, 'qualifier': 'before',
                'note': 'death date note'
            },
            'place': {
                'displayName': 'Somewhere', 'note': 'death place note'
            },
            'cause': 'natural',
            'causeNote': 'cause of death note'
        },
        'gender': 'female',
        'genderNote': 'gender note',
        'note': 'person note',

    }


# test projects

def test_get_person_with_relations(client):
    person1 = Person(display_name='Person 1').save()
    person2 = Person(display_name='Person 2').save()
    person3 = Person(
        related_people=[
            Person.RelatedPerson(
                other_person=person1.id,
                other_person_display_name=person1.display_name,
                their_role=1,
                note='Unwed'
            ),
            Person.RelatedPerson(
                other_person=person2.id,
                other_person_display_name=person2.display_name,
                their_role=2,
                relationship_type=2
            ),
        ]
    ).save()

    r = client.get(f'/people/{person3.id}')
    assert r.status_code == 200, r.text
    assert r.json['relations'] == [
        {
            'personId': str(person1.id),
            'personDisplayName': 'Person 1',
            'otherPersonRole': 'partner',
            'note': 'Unwed'
        },
        {
            'personId': str(person2.id),
            'personDisplayName': 'Person 2',
            'otherPersonRole': 'parent',
            'relationshipType': 'adoptive'
        },
    ]


def test_person_with_projects(client):
    t1 = datetime.datetime(2024, 1, 1, 0, 0, 0)
    t2 = t1 + datetime.timedelta(hours=1)

    person1 = Person(display_name='Person 1').save()
    person2 = Person(display_name='Person 2').save()

    project1 = ResearchProject(name='Project 1').save()

    # simple case
    ResearchNote(research_project=project1,
                 project_name=project1.name,
                 people=[person1, person2],
                 last_modified=t1,
                 note='Project 1 Note 1').save()

    ResearchNote(research_project=project1,
                 project_name=project1.name,
                 people=[person1, person2],
                 last_modified=t2,
                 note='Project 1 Note 2').save()

    project2 = ResearchProject(name='Project 2').save()

    # reverse order
    ResearchNote(research_project=project2,
                 project_name=project2.name,
                 people=[person1],
                 last_modified=t2,
                 note='Project 2 Note 1').save()

    ResearchNote(research_project=project2,
                 project_name=project2.name,
                 people=[person1, person2],
                 last_modified=t1,
                 note='Project 2 Note 2').save()

    project3 = ResearchProject(name='Project 3').save()

    # don't include if user doesn't appear
    ResearchNote(research_project=project3,
                 project_name=project3.name,
                 people=[person2],
                 last_modified=t2,
                 note='Project 3 Note 1').save()

    r = client.get(f'/people/{person1.id}')
    assert r.status_code == 200, r.text
    assert r.json['projects'] == [
        {
            'projectId': str(project1.id),
            'projectDisplayName': 'Project 1',
            'projectNote': {
                'note': 'Project 1 Note 2',
                'lastModifiedOn': '2024-01-01T01:00:00+00:00'
            }
        },
        {
            'projectId': str(project2.id),
            'projectDisplayName': 'Project 2',
            'projectNote': {
                'note': 'Project 2 Note 1',
                'lastModifiedOn': '2024-01-01T01:00:00+00:00'
            }
        }
    ]
