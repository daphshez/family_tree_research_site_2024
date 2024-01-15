from familyresearch import db
import datetime


class AdvancedDate(db.EmbeddedDocument):
    day_of_month = db.IntField()
    month = db.IntField()
    year = db.IntField()
    qualifier = db.IntField(choices=((0, 'exact'),
                                     (1, 'about'),
                                     (2, 'before'),
                                     (3, 'after')), default=0)
    note = db.StringField()


class Place(db.EmbeddedDocument):
    display_name = db.StringField()
    note = db.StringField()


class ResearchProject(db.Document):
    name = db.StringField()


class Person(db.Document):
    created_on = db.DateTimeField(default=datetime.datetime.utcnow)
    last_modified = db.DateTimeField(default=datetime.datetime.utcnow)

    class RelatedPerson(db.EmbeddedDocument):
        other_person = db.ObjectIdField()
        other_person_display_name = db.StringField()
        their_role = db.IntField(choices=((1, 'partner'),
                                          (2, 'parent'),
                                          (3, 'child')))
        relationship_type = db.IntField(choices=((1, 'birth'),
                                                 (2, 'adoptive'),
                                                 (3, 'step')))
        note = db.StringField()

    class FieldNote(db.EmbeddedDocument):
        field_name = db.StringField()
        note = db.StringField()

    display_name = db.StringField()
    display_name_note = db.StringField()
    birth_date = db.EmbeddedDocumentField(AdvancedDate)
    birth_place = db.EmbeddedDocumentField(Place)

    is_alive = db.IntField(choices=((0, 'no'), (1, 'yes'), (2, 'unknown')))
    is_alive_note = db.StringField()
    death_date = db.EmbeddedDocumentField(AdvancedDate)
    death_place = db.EmbeddedDocumentField(Place)
    cause_of_death = db.IntField(choices=((1, 'natural'), ))
    cause_of_death_note = db.StringField()

    gender = db.IntField(choices=( (0, 'female'), (1, 'male'), (2, 'other')))
    gender_note = db.StringField()

    person_note = db.StringField()
    related_people = db.EmbeddedDocumentListField(RelatedPerson)


class ResearchNote(db.Document):
    research_project = db.LazyReferenceField(ResearchProject)
    project_name = db.StringField()
    created_on = db.DateTimeField(default=datetime.datetime.utcnow)
    last_modified = db.DateTimeField(default=datetime.datetime.utcnow)
    people = db.ListField(db.LazyReferenceField(Person))

    note = db.StringField()