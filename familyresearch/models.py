from familyresearch import db
import datetime

gender_choices = ((0, 'female'), (1, 'male'), (2, 'other'))


def get_choice_value(s, choices):
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


class Place(db.EmbeddedDocument):
    display_name = db.StringField()


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
    birth_date = db.EmbeddedDocumentField(AdvancedDate)
    birth_place = db.EmbeddedDocumentField(Place)

    is_alive = db.BooleanField()
    death_date = db.EmbeddedDocumentField(AdvancedDate)
    death_place = db.EmbeddedDocumentField(Place)

    gender = db.IntField(choices=gender_choices)

    related_people = db.EmbeddedDocumentListField(RelatedPerson)


class Relationship(db.Document):
    person1 = db.LazyReferenceField(Person)
    person2 = db.LazyReferenceField(Person)
    person2_role = db.StringField()  # choices?
    relationship_option = db.StringField()
    created = db.DateTimeField(default=datetime.datetime.utcnow)


class ResearchNote(db.Document):
    research_project = db.LazyReferenceField(ResearchProject)
    created = db.DateTimeField(default=datetime.datetime.utcnow)
    last_update = db.DateTimeField(default=datetime.datetime.utcnow)
    people = db.ListField(db.LazyReferenceField(Person))

    content = db.StringField()
