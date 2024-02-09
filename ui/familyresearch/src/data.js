
export const PEOPLE_DATA = {
     '1': {
      'personId': '1', 
      'personDisplayName': 'Charles Windsor',
      'createdOn': 'todo',
      'lastModifiedOn': 'todo',
      'birth': {
          'date': {
               'year': 1948, 'month': 11, 'day': 14
          },
          'place': {
               'displayName': 'London, England, UK',
               'note': 'Buckingham Palace'
          } 
      },
      'death': {
          isAlive: true
      },
      gender: 'male',
      note: 'todo',
      relations: [
          {
               personId: '9',
               personDisplayName: 'Elisabeth Windsor',
               otherPersonRole: 'parent'
          },
          {
               personId: '3',
               personDisplayName: 'Diana Spencer',
               otherPersonRole: 'partner',
               relationshipOption: 'divorced'
          }
      ]
   },
   '3': {
       'personId': '3', 'personDisplayName': 'Diana Spencer'
   },
   '2': {
       'personId': '2', 'personDisplayName': 'Camilla Rosemary Shand',
   },
   '4': {
       'personId': '4', 'personDisplayName': 'William Windsor',
   },
   '5': {
        'personId': '5', 'personDisplayName': 'Harry Windsor'
   },
   '6': {
        'personId': '6', 'personDisplayName': 'Catherine Middleton'
   },
   '7': {
        'personId': '7', 'personDisplayName': 'George Windsor',
   },
   '8': {
        'personId': '8', 'personDisplayName': 'Charlotte Widsor'
   },
   '9': {
      'personId': '9', 'personDisplayName': 'Elisabeth Widsor'
   }
};


export const PROJECTS_DATA = {
     "1": {
          projectId: "1",
          projectDisplayName: 'Yomtov Kahan Descendents',
          notes: {
               "1": 
               {
                    noteId: "1",
                    content: "**This is the note**",
                    created: "2024-01-01T00:00:00Z",
                    lastUpdate: "2024-01-01T00:00:00Z"
               }
          }
     },
     "2": {
          projectId: 2,
          projectDisplayName: 'Shatz'
     }
}

