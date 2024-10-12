from flask import Flask, request, jsonify
import firebase

app = Flask(__name__)

# API Route to add a new recipe to Firestore
@app.route('/add_recipe', methods=['POST'])
def add_recipe():
    try:
        # Get the JSON data from the request
        recipe_data = request.json

        # Print for debugging purposes (optional)
        print(f"Received recipe data: {recipe_data}")

        # Add the recipe to Firestore
        result = firebase.add_recipe_to_db(recipe_data)
        
        # Print Firestore result for debugging
        print(f"Firestore result: {result}")

        return jsonify(result), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
