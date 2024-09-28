from flask import Flask
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from routes import overlay_routes

app = Flask(__name__)

# MongoDB connection string
uri = "mongodb+srv://gangeswaran375:38Ayd3LcCvSXBIsv@overlay.wfnw7.mongodb.net/?retryWrites=true&w=majority&appName=overlay"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Test MongoDB connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

app.config['db'] = client.overlay  

# Allow CORS for frontend communication
CORS(app, origins=['http://localhost:3000'])  

app.register_blueprint(overlay_routes)

# Test database connection route
@app.route('/test_db_connection', methods=['GET'])
def test_db_connection():
    try:
        db = app.config['db']
        overlays = list(db.overlays.find())
        
        for overlay in overlays:
            overlay['_id'] = str(overlay['_id'])

        return {"status": "success", "data": overlays}, 200
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
