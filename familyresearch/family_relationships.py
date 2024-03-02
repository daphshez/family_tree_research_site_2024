import operator
from collections import Counter
from functools import reduce

from mongoengine import Q

from familyresearch.models import Relationship


def add_other_parent(parent, child, options):
    relevant_relations = Relationship.objects(
        # another parent to the same child
        (Q(person1=child) & Q(person2__ne=parent) & Q(person2_role='parent')) |
        # a partner to the parent
        ((Q(person1=parent) | Q(person2=parent)) & Q(person2_role='partner'))).all()

    to_compare = [r.person2_role for r in relevant_relations]

    if to_compare == ['partner']:
        r = relevant_relations[0]
        print(r.to_mongo(), parent, str(r.person2), str(r.person2) == parent)
        other_parent = r.person1 if str(r.person2.id) == parent else r.person2
        Relationship(person1=child,
                     person2=other_parent,
                     person2_role='parent',
                     relationship_option=options).save()


def infer_siblings(person_id, relations):
    parents = [r.person2 for r in relations if r.person2_role == 'parent' and str(r.person1.id) == person_id]
    if not parents:
        return []
    sibling_relations = [r for r in relations if r.person2_role == 'sibling']
    known_siblings = list({r.person1 for r in sibling_relations } | {r.person2 for r in sibling_relations})
    known_siblings += [person_id]

    siblings_relations = Relationship.objects(
        Q(person1__nin=known_siblings) &
        Q(person2_role='parent') &
        reduce(operator.or_, [Q(person2=parent) for parent in parents])
    )

    count = Counter(str(r.person1.id) for r in siblings_relations)

    inferred = [{
            'personId': str(person),
            'otherPersonRole': 'sibling' if count == 2 else 'sibling (half)',
            'inferred': True
        } for person, count in count.items()]

    return inferred