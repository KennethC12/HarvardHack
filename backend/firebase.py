import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate('./recipe-4b027-firebase-adminsdk-4h100-3197c008ab.json')
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Add recipe to Firestore
def add_recipe_to_db(recipe_data):
    try:
        # Prepare the recipe document data
        recipe_ref = db.collection("Recipies").document(f"Recipie_{recipe_data['Recipie ID']}")
        
        recipe_ref.set({
            "Recipie Name": recipe_data["Recipie Name"],
            "Description": recipe_data["Description"],
            "Recipie ID": recipe_data["Recipie ID"],
            "Difficulty": recipe_data["Difficulty"],
            "Ingredients": recipe_data["Ingredients"],  # List of ingredients
            "Steps": recipe_data["Steps"],  # List of steps
        })
        
        return {"success": True, "id": recipe_data["Recipie ID"]}
    except Exception as e:
        return {"success": False, "error": str(e)}
