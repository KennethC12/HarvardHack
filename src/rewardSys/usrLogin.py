# Login Stuff

import firebase_admin
from firebase_admin import credentials, auth
import firebase

def main(email1, display_name_in, address, password1):
    # Path to your service account key JSON file
    cred = credentials.Certificate('./src/recipe-4b027-firebase-adminsdk-4h100-3197c008ab.json')

    # Initialize the Firebase app
    firebase_admin.initialize_app(cred)

    user = auth.create_user(
    email= email1,
    email_verified=False,
    password=password1,
    display_name= display_name_in,
    usr_addr = address,
    disabled=False
    )
    firebase.addUser(user.display_name, user.user_addr)


