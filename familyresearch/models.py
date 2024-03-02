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

    class RelatedPerson(db.EmbeddedDocument):
        other_person = db.ObjectIdField()
        other_person_display_name = db.StringField()
        their_role = db.IntField(choices=((1, 'partner'),
                                          (2, 'parent'),
                                          (3, 'child')))
        relationship_type = db.IntField(choices=((1, 'birth'),
                                                 (2, 'adoptive'),
                                                 (3, 'step')))

    display_name = db.StringField()
    display_name_note = db.StringField()
    birth_date = db.EmbeddedDocumentField(AdvancedDate)
    birth_place = db.EmbeddedDocumentField(Place)

    is_alive = db.BooleanField()
    death_date = db.EmbeddedDocumentField(AdvancedDate)
    death_place = db.EmbeddedDocumentField(Place)
    cause_of_death = db.StringField()
    cause_of_death_note = db.StringField()

    gender = db.IntField(choices=gender_choices)

    related_people = db.EmbeddedDocumentListField(RelatedPerson)

    links = db.EmbeddedDocumentListField(PersonLink)

    overview_note = db.StringField()

    research_tag = db.StringField(choices=research_tags_choices.keys())
    research_tag_note = db.StringField()
    research_tag_last_update = db.DateTimeField()


class Relationship(db.Document):
    person1 = db.LazyReferenceField(Person)
    person2 = db.LazyReferenceField(Person)
    person2_role = db.StringField(choice=role_choices)
    relationship_option = db.StringField()
    created = db.DateTimeField(default=datetime.datetime.utcnow)


class ResearchNote(db.Document):
    research_project = db.LazyReferenceField(ResearchProject)
    created = db.DateTimeField(default=datetime.datetime.utcnow)
    last_update = db.DateTimeField(default=datetime.datetime.utcnow)
    people = db.ListField(db.LazyReferenceField(Person))
    sticky = db.BooleanField(default=False)
    content = db.StringField()
