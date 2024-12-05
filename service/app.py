import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from flask_cors import CORS
from dateutil import parser
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)  # Allow all origins

# Configure the database connection using environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{os.getenv('DB_USERNAME')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:3306/{os.getenv('DB_NAME')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the Task model
class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    entity = db.Column(db.String(255), nullable=False)
    taskType = db.Column(db.String(255), nullable=False)
    time = db.Column(db.Time, nullable=False)
    contactPerson = db.Column(db.String(255), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    phoneNumber = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(10), nullable=False, default='Open')

# Test route to check if the server is running
@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Success!'})

# Route to get all tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.all()
        return jsonify([{
            'id': task.id,
            'date': task.date.isoformat(),
            'entity': task.entity,
            'taskType': task.taskType,
            'time': task.time.isoformat(),
            'contactPerson': task.contactPerson,
            'notes': task.notes,
            'phoneNumber': task.phoneNumber,
            'status': task.status
        } for task in tasks])
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve tasks', 'message': str(e)}), 500

# Route to add a new task
@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.json
    try:
        # Validate required fields
        required_fields = ['date', 'entity', 'taskType', 'time', 'contactPerson']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': 'Missing required fields', 'fields': missing_fields}), 400

        # Parse date
        parsed_date = parser.isoparse(data['date']).date()

        # Parse time from HH:mm format
        parsed_time = datetime.strptime(data['time'], '%H:%M:%S').time()  # Updated for HH:mm:ss format

        new_task = Task(
            date=parsed_date,
            entity=data['entity'],
            taskType=data['taskType'],
            time=parsed_time,
            contactPerson=data['contactPerson'],
            notes=data.get('notes', ''),
            phoneNumber=data.get('phoneNumber', ''),
            status=data.get('status', 'Open')
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'message': 'Task created', 'id': new_task.id}), 201
    except ValueError as ve:
        return jsonify({'error': 'Invalid date or time format', 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to create task', 'message': str(e)}), 500

# Route to update a task
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json
    try:
        # Validate required fields
        required_fields = ['date', 'entity', 'taskType', 'time', 'contactPerson']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': 'Missing required fields', 'fields': missing_fields}), 400

        # Parse date and time
        task.date = parser.isoparse(data['date']).date()
        task.entity = data['entity']
        task.taskType = data['taskType']
        task.time = datetime.strptime(data['time'], '%H:%M:%S').time()  # Updated for HH:mm:ss format
        task.contactPerson = data['contactPerson']
        task.notes = data.get('notes', task.notes)
        task.phoneNumber = data.get('phoneNumber', task.phoneNumber)
        task.status = data.get('status', task.status)

        db.session.commit()
        return jsonify({'message': 'Task updated'})
    except ValueError as ve:
        return jsonify({'error': 'Invalid date or time format', 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to update task', 'message': str(e)}), 500

# Route to delete a task
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted'})
    except Exception as e:
        return jsonify({'error': 'Failed to delete task', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
