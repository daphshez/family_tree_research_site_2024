from collections import defaultdict

from familyresearch import deep_remove_empty_values
from familyresearch.models import Relationship, Person, AdvancedDate

import calendar


def create_gedcom(json_data):
    gedcom_lines = {}
    family_records = {}

    # Process each person from the JSON data
    for person in json_data:
        person_id = person.get("personId")
        first_name = person.get("firstName")
        last_name = person.get("lastName")
        mother_id = person.get("motherPersonId")
        father_id = person.get("fatherPersonId")
        sex = person.get('sex')

        # Individual record
        gedcom_lines[person_id] = []
        gedcom_lines[person_id].append(f"0 @I{person_id}@ INDI")
        gedcom_lines[person_id].append(f"1 NAME {first_name} /{last_name}/")
        if sex:
            gedcom_lines[person_id].append(f"1 SEX {sex}")

        if 'birth' in person:
            gedcom_lines[person_id].append("1 BIRT")
            if 'date' in person['birth']:
                gedcom_lines[person_id].append(f"2 DATE {person['birth']['date']}")
            if 'place' in person['birth']:
                gedcom_lines[person_id].append(f"2 PLAC {person['birth']['place']}")

        if 'death' in person:
            gedcom_lines[person_id].append("1 DEAT")
            if 'date' in person['death']:
                gedcom_lines[person_id].append(f"2 DATE {person['death']['date']}")
            if 'place' in person['death']:
                gedcom_lines[person_id].append(f"2 PLAC {person['death']['place']}")
        elif 'isAlive' in person and not person['isAlive']:
            gedcom_lines[person_id].append("1 DEAT Y")

        # Create family records
        if mother_id or father_id:
            family_id = f"F{mother_id}_{father_id}"
            gedcom_lines[person_id].append(f"1 FAMC @F{family_id}@")
            if family_id not in family_records:
                family_records[family_id] = []
                family_records[family_id].append(f"0 @F{family_id}@ FAM")
                if father_id:
                    family_records[family_id].append(f"1 HUSB @I{father_id}@")
                if mother_id:
                    family_records[family_id].append(f"1 WIFE @I{mother_id}@")

            family_records[family_id].append(f"1 CHIL @I{person_id}@")

        partners = [(wife, person_id) for wife in person.get('wives') or []]
        partners += [(person_id, husband) for husband in person.get('husbands') or []]
        for wife, husband in partners:
            family_id = f"F{wife}_{husband}"
            if family_id not in family_records:
                family_records[family_id] = [f"0 @F{family_id}@ FAM",
                                             f"1 HUSB @I{husband}@",
                                             f"1 WIFE @I{wife}@"]
            gedcom_lines[person_id].append(f"1 FAMS @F{family_id}@")

    # Combine individual and family records
    all_lines = ["0 HEAD",
                 "1 SOUR DaphnaShezaf",
                 "2 VERS 1.0",
                 "2 NAME DaphnaShezaf",
                 "1 GEDC",
                 "2 VERS 7.0",
                 "2 FORM LINEAGE-LINKED"]

    for lines in gedcom_lines.values():
        all_lines.extend(lines)
    for lines in family_records.values():
        all_lines.extend(lines)

    all_lines.append("0 TRLR")

    return "\n".join(all_lines)


def prepare_for_create_gedcom(project_id: str):
    def to_gedcom_sex(v):
        if v == 0:
            return 'F'
        if v == 1:
            return 'M'
        return 'U'

    def first_name(s):
        return s.rpartition(' ')[0]

    def last_name(s):
        return s.rpartition(' ')[-1]

    def to_gedcom_date(advanced_date: AdvancedDate):
        if not advanced_date:
            return None

        if advanced_date.qualifier == 1:
            s = 'About '
        elif advanced_date.qualifier == 2:
            s = 'Before '
        elif advanced_date.qualifier == 3:
            s = 'After '
        else:
            s = ''

        if advanced_date.day:
            s += f'{advanced_date.day} '
        if advanced_date.month:
            s += calendar.month_abbr[advanced_date.month] + " "
        if advanced_date.year:
            s += f'{advanced_date.year}'

        return s.strip()

    people = {str(person.id): person for person in Person.objects(projects=project_id)}

    children = defaultdict(list)
    parents = defaultdict(list)
    partners = defaultdict(list)

    for relation in Relationship.objects():
        if str(relation.person1.id) in people and str(relation.person2.id) in people:
            if relation.person2_role == 'parent':
                children[str(relation.person2.id)].append(str(relation.person1.id))
                parents[str(relation.person1.id)].append(str(relation.person2.id))
            if relation.person2_role == 'partner':
                partners[str(relation.person2.id)].append(str(relation.person1.id))
                partners[str(relation.person1.id)].append(str(relation.person2.id))

            # todo: deal with siblings with no known parents?

    json_data = []

    for person_id, person in people.items():
        person = people[person_id]

        mother_id, father_id = None, None
        for parent_id in parents.get(person_id, []):
            parent = people[parent_id]
            parent_sex = to_gedcom_sex(parent.gender)
            if parent_sex == 'M':
                father_id = parent_id
            elif parent_sex == 'F':
                mother_id = parent_id
            else:
                raise ValueError(f'Cannot export parent with unknown sex to gedcom, parent_id={parent_id}')

        wives, husbands = [], []
        for partner_id in partners.get(person_id, []):
            partner = people[partner_id]
            partner_sex = to_gedcom_sex(partner.gender)
            my_sex = to_gedcom_sex(person.gender)
            if partner_sex not in ('M', 'F') or my_sex not in ('M', 'F'):
                raise ValueError(f'Cannot export partners with unknown sex to gedcom, {person_id} {partner_id}')
            if partner_sex == my_sex:
                if partner_id < person_id:  # for same-sex couples, we arbitrarily (but stably) assign HUSB and WIFE
                    wives.append(partner_id)
                else:
                    husbands.append(partner_id)
            else:
                if partner_sex == 'M':
                    husbands.append(partner_id)
                else:
                    wives.append(partner_id)

        json_person = deep_remove_empty_values({
            'personId': person_id,
            'firstName': first_name(person.display_name),
            'lastName': last_name(person.display_name),
            'sex': to_gedcom_sex(person.gender),
            'motherPersonId': mother_id,
            'fatherPersonId': father_id,
            'wives': wives,
            'husbands': husbands,
            'birth': {
                'date': to_gedcom_date(person.birth_date),
                'place': person.birth_place.display_name if person.birth_place else None
            },
            'isAlive': person.is_alive,
            'death': {
                'date': to_gedcom_date(person.death_date),
                'place': person.death_place.display_name if person.death_place else None
            }

        })

        json_data.append(json_person)

    return json_data
