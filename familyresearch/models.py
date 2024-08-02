import time

from familyresearch import db
import datetime

gender_choices = ((0, 'female'), (1, 'male'), (2, 'other'))

role_choices = ['parent', 'partner', 'sibling']

research_tags_choices = {
    'undocumented': 'No solid evidence found yet for the existence of this person or the family connections',
    'horizon': 'family members information fully or partially missing'
}


def get_choice_value(s, choices):
    if s == 'unknown':
        return None
    return next(pair for pair in choices if pair[1] == s)[0]


def get_gender_value(s):
    return get_choice_value(s, gender_choices)


date_qualifier_choices = ((0, 'exact'),
                          (1, 'about'),
                          (2, 'before'),
                          (3, 'after'))


def get_date_qualifier_value(s):
    return get_choice_value(s, date_qualifier_choices)


class AdvancedDate(db.EmbeddedDocument):
    day = db.IntField()
    month = db.IntField()
    year = db.IntField()
    qualifier = db.IntField(choices=date_qualifier_choices, default=0)
    note = db.StringField()


class Place(db.EmbeddedDocument):
    display_name = db.StringField()
    note = db.StringField()


class PersonLink(db.EmbeddedDocument):
    id = db.StringField()
    url = db.StringField()
    description = db.StringField()
    created = db.DateTimeField(default=datetime.datetime.utcnow)


class ResearchProject(db.Document):
    name = db.StringField()
    created_on = db.DateTimeField(default=datetime.datetime.utcnow)


class Person(db.Document):
    created = db.DateTimeField(default=datetime.datetime.utcnow)
    last_update = db.DateTimeField(default=datetime.datetime.utcnow)

    display_name = db.StringField()
    display_name_note = db.StringField()
    birth_date = db.EmbeddedDocumentField(AdvancedDate)
    birth_place = db.EmbeddedDocumentField(Place)

    is_alive = db.BooleanField()
    death_date = db.EmbeddedDocumentField(AdvancedDate)
    death_place = db.EmbeddedDocumentField(Place)
    cause_of_death = db.StringField()
    cause_of_death_note = db.StringField()
    burial_place = db.StringField()

    gender = db.IntField(choices=gender_choices)

    links = db.EmbeddedDocumentListField(PersonLink)

    overview_note = db.StringField()

    projects = db.ListField(db.LazyReferenceField(ResearchProject))


class Relationship(db.Document):
    person1 = db.LazyReferenceField(Person)
    person2 = db.LazyReferenceField(Person)
    person2_role = db.StringField(choice=role_choices)
    relationship_option = db.StringField()
    created = db.DateTimeField(default=datetime.datetime.utcnow)
    since = db.EmbeddedDocumentField(AdvancedDate)  # think of these as marriage and divorce date
    until = db.EmbeddedDocumentField(AdvancedDate)


class ResearchNote(db.Document):
    research_project = db.LazyReferenceField(ResearchProject)
    created = db.DateTimeField(default=datetime.datetime.utcnow)
    last_update = db.DateTimeField(default=datetime.datetime.utcnow)
    people = db.ListField(db.LazyReferenceField(Person))
    sticky = db.BooleanField(default=False)
    content = db.StringField()


class ResearchTask(db.Document):
    project = db.LazyReferenceField(ResearchProject, required=True)
    task = db.StringField()
    person = db.LazyReferenceField(Person)
    note = db.LazyReferenceField(ResearchNote)
    priority = db.IntField(default=time.time_ns() // 1000)
    created = db.DateTimeField(default=datetime.datetime.utcnow)
