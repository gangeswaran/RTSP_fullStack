from flask import Blueprint, request, jsonify, current_app
from bson.objectid import ObjectId
import datetime

overlay_routes = Blueprint('overlay_routes', __name__)

def validate_overlay(data):
    if not isinstance(data, dict):
        return False
    return (
        'position' in data and
        'size' in data and
        'content' in data and
        isinstance(data['position'], dict) and
        'x' in data['position'] and
        'y' in data['position'] and
        isinstance(data['size'], dict) and
        'width' in data['size'] and
        'height' in data['size']
    )

# Create Overlay
@overlay_routes.route('/overlays', methods=['POST'])
def create_overlay():
    db = current_app.config['db']
    data = request.json

    if not validate_overlay(data):
        return jsonify({'message': 'Invalid data: Missing required fields or wrong format.'}), 400

    overlay = {
        'position': data['position'],
        'size': data['size'],
        'content': data['content'],
        'created_at': datetime.datetime.utcnow()  # Add timestamp
    }

    try:
        result = db.overlays.insert_one(overlay)
        return jsonify({'message': 'Overlay created successfully', '_id': str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({'message': 'Failed to create overlay', 'error': 'Internal server error.'}), 500

# Read Overlays
@overlay_routes.route('/overlays', methods=['GET'])
def get_overlays():
    db = current_app.config['db']
    overlays = list(db.overlays.find())

    for overlay in overlays:
        overlay['_id'] = str(overlay['_id'])

    return jsonify(overlays), 200

# Update Overlay
@overlay_routes.route('/overlays/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    db = current_app.config['db']
    data = request.json

    if not validate_overlay(data):
        return jsonify({'message': 'Invalid data: Missing required fields or wrong format.'}), 400

    overlay_to_update = db.overlays.find_one({'_id': ObjectId(overlay_id)})
    if overlay_to_update is None:
        return jsonify({'message': 'Overlay not found'}), 404

    # Include position updates
    updated_overlay_data = {
        'position': data['position'],  # Ensure position is updated
        'size': data['size'],
        'content': data['content']
    }

    try:
        db.overlays.update_one({'_id': ObjectId(overlay_id)}, {'$set': updated_overlay_data})
        return jsonify({'message': 'Overlay updated successfully', 'overlay': updated_overlay_data}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to update overlay', 'error': 'Internal server error.'}), 500

# Delete Overlay
@overlay_routes.route('/overlays/<overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    db = current_app.config['db']

    overlay_to_delete = db.overlays.find_one({'_id': ObjectId(overlay_id)})
    if overlay_to_delete is None:
        return jsonify({'message': 'Overlay not found'}), 404

    try:
        db.overlays.delete_one({'_id': ObjectId(overlay_id)})
        return jsonify({'message': 'Overlay deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to delete overlay', 'error': 'Internal server error.'}), 500
