from flask import Flask, request, jsonify
from flask_cors import CORS
from models import Task
from bson.objectid import ObjectId
from bson.errors import InvalidId
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super(JSONEncoder, self).default(obj)

app.json_encoder = JSONEncoder

@app.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['title', 'priority', 'due_date']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        if data['priority'] not in ['Low', 'Medium', 'High']:
            return jsonify({'error': 'Priority must be Low, Medium, or High'}), 400
        
        # Create task
        result = Task.create_task(data)
        
        return jsonify({
            'message': 'Task created successfully',
            'task_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        # Get query parameters
        status = request.args.get('status')
        priority = request.args.get('priority')
        sort_by = request.args.get('sort_by')
        
        filters = {}
        if status:
            filters['status'] = status
        if priority:
            filters['priority'] = priority
        
        tasks = Task.get_all_tasks(filters, sort_by)
        
        # Convert ObjectId to string for JSON serialization
        for task in tasks:
            task['_id'] = str(task['_id'])
        
        return jsonify(tasks), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/tasks/<task_id>', methods=['PATCH'])
def update_task(task_id):
    try:
        data = request.get_json()
        
        # Check if task exists
        task = Task.get_task_by_id(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Validate status if provided
        if 'status' in data and data['status'] not in ['todo', 'in_progress', 'done']:
            return jsonify({'error': 'Status must be todo, in_progress, or done'}), 400
        
        # Validate priority if provided
        if 'priority' in data and data['priority'] not in ['Low', 'Medium', 'High']:
            return jsonify({'error': 'Priority must be Low, Medium, or High'}), 400
        
        # Update task
        result = Task.update_task(ObjectId(task_id), data)
        
        if result.modified_count > 0:
            return jsonify({'message': 'Task updated successfully'}), 200
        else:
            return jsonify({'message': 'No changes made'}), 200
            
    except InvalidId:
        return jsonify({'error': 'Invalid task ID'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/insights', methods=['GET'])
def get_insights():
    try:
        insights = Task.get_insights()
        return jsonify(insights), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)