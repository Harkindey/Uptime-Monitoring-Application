# Uptime Monitoring Application
    1. The API listens on a PORT and accepts incoming HTTP request for 
        POST, GET, PUT, DELETE and HEAD.
    2. The API allows a client to connect then create a new user, 
        then edit and delete that user.
    3. The API allows a user to "sign in" which gives them a token 
        that they can use for subsequent authenticted request.
    4. The API allows the user to "sign out" which invalidates their token.
    5. The API allows a signed-in user to use their token to create a new "check".
    6. the API allows a signed-in user to edit or delete any of their checks.
    7. In the background, workers perform all the "checks" at the appropriate times, 
        and send alerts to the users when a check changes its state from "up" to "down",
        or visa versa.
