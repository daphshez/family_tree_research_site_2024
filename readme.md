                                                                                                                                            

Web application for managing family history research. 

To run: 

- Backend: run familyresearch.__init__ through the IDE or command line.
 
  Set up the environment variable `MONGO_CONNECTION_STRING`.

- Frontend: 

  If you just cloned the repository, go ti ui/familysearch and run `npm install`

  Then you can run the development server with `npm run dev`

  (You will obviously need your backend running, see above)

  You can build the project `npm run build`, which will install it in the static assets
  directory of the backend project, so if you run the server and point the browser
  at http://127.0.0.1:5000, you should be able to use the built version.
  

- Logging in: 

  No authentication actually implemented on the backend! You can enter any username and password.