import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

import usrLogin

# Creds and initalization
cred_obj = firebase_admin.credentials.Certificate('./src/recipe-4b027-firebase-adminsdk-4h100-3197c008ab.json')
recipieApp = firebase_admin.initialize_app(cred_obj)

# Starting db
db = firestore.client()

user_ref = db.collection("Users").document("leUser")
user_ref.set({"Username": "John", "UID": 1, "Points": 0, "Addr": "123 Main St"})

recipie_ref = db.collection("Recipies").document("daRecpies")
recipie_ref.set({"Recipie Name": "Butterscotch", 
                 "Cusine Type": "Korean",
                "Description" : "A discreiption",
                "Recipie ID" : 1,
                "Difficulty": "Easy",
                "Ingredients": {"Eggo",
                                "Potato",
                                "Cheese"}, 
                "Steps": {"1) Do this",
                        "2) Do that",
                        "3) Do that"}
                        })

rewardo = ["$10 Card", "$100 Card"]
rAmount = [10, 2]
rCost   = [500, 10000]

# Ignore the fact that this may be abuseable
# There might be a better way to search databases without inserting the db idk
# Adds points to a user
def addPoints(morePoints, UserId):
    #user_ref = db.collection("Users") # Heres how you do querys https://firebase.google.com/docs/firestore/query-data/queries
    temp = readPoints(UserId)
    user_ref.update({"Points": temp + morePoints})


# Ive declared that mobile integration never lmao :DD
def login(email, display, addr, pass1):
    # https://github.com/firebase/firebaseui-web
    usrLogin.main(email, display, addr, pass1)
    
# Takes in username and address of new user and adds to database
# Ignore dupes cuz uh im not paid enough for this
def addUser(Username, Addr):
    size = user_ref.__sizeof__
    newUser = {"Username": Username, "UID": size+1, "Points": 0, "Addr": Addr}


# Extra feature
#def addRecipie():
#    #TODO

# takes in userId parameters, and what recipie to add to user account points
def recipieCompleted(UserId, RecipieNum):
    temp = recipie_ref.whereEqualTo("Recipie ID", RecipieNum)
    if (temp == "Easy"):
        addPoints(100)
    elif (temp == "Medium"):
        addPoints(200)
    elif (temp == "Hard"):
        addPoints(500)

# determines how many points a user has
def readPoints(UserId):
    userPoints = user_ref.whereEqualTo("UID", UserId)
    return userPoints

# Add later or smth
#def editRedeemables():
    # TODO



# Takes user and how many points the item is and then returns true or false if they can redeem such a item
# Removes the card from redeem pool if completed sucesfully
def redeemPoints(UserId, cardPointAmt):
    userPoints = readPoints(UserId)
    if (userPoints >= cardPointAmt):
        if (cardPointAmt == 500):
            rAmount[0] = rAmount[0] - 1
        else:
            rAmount[1] = rAmount[1] - 1

        addPoints(cardPointAmt * -1, UserId)

        return True
    else:
        return False










