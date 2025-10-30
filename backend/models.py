from datetime import datetime
from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
db = client.task_tracker

class Task:
    @staticmethod
    def create_task(task_data):
        task = {
            'title': task_data['title'],
            'description': task_data.get('description', ''),
            'priority': task_data['priority'],
            'due_date': task_data['due_date'],
            'status': task_data.get('status', 'todo'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        return db.tasks.insert_one(task)
    
    @staticmethod
    def get_all_tasks(filters=None, sort_by=None):
        query = {}
        if filters:
            if 'status' in filters and filters['status']:
                query['status'] = filters['status']
            if 'priority' in filters and filters['priority']:
                query['priority'] = filters['priority']
        
        tasks = db.tasks.find(query)
        
        if sort_by == 'due_date':
            tasks = tasks.sort('due_date', 1)
        elif sort_by == 'priority':
            priority_order = {'High': 1, 'Medium': 2, 'Low': 3}
            # This requires more complex sorting, so we'll do it in Python for simplicity
            tasks = list(tasks)
            tasks.sort(key=lambda x: priority_order.get(x['priority'], 4))
            return tasks
        
        return list(tasks)
    
    @staticmethod
    def update_task(task_id, update_data):
        update_data['updated_at'] = datetime.utcnow()
        return db.tasks.update_one(
            {'_id': task_id},
            {'$set': update_data}
        )
    
    @staticmethod
    def get_task_by_id(task_id):
        from bson.objectid import ObjectId
        return db.tasks.find_one({'_id': ObjectId(task_id)})
    
    @staticmethod
    def get_insights():
        from datetime import datetime, timedelta
        
        # Get all tasks
        all_tasks = list(db.tasks.find())
        
        if not all_tasks:
            return {
                'total_tasks': 0,
                'summary': 'No tasks found. Add some tasks to get insights!'
            }
        
        # Count by status
        status_count = {}
        for task in all_tasks:
            status = task['status']
            status_count[status] = status_count.get(status, 0) + 1
        
        # Count by priority
        priority_count = {}
        for task in all_tasks:
            priority = task['priority']
            priority_count[priority] = priority_count.get(priority, 0) + 1
        
        # Find due soon tasks (within 3 days)
        due_soon_count = 0
        today = datetime.utcnow()
        three_days_later = today + timedelta(days=3)
        
        for task in all_tasks:
            if 'due_date' in task and task['due_date']:
                due_date = datetime.strptime(task['due_date'], '%Y-%m-%d')
                if today <= due_date <= three_days_later and task['status'] != 'done':
                    due_soon_count += 1
        
        # Generate AI-style summary
        total_tasks = len(all_tasks)
        open_tasks = status_count.get('todo', 0) + status_count.get('in_progress', 0)
        most_common_priority = max(priority_count.items(), key=lambda x: x[1])[0] if priority_count else 'None'
        
        if open_tasks == 0:
            summary = "Great job! You have no pending tasks."
        else:
            summary = f"You have {open_tasks} open tasks"
            if most_common_priority != 'None':
                summary += f" — most are {most_common_priority} priority"
            if due_soon_count > 0:
                summary += f" and {due_soon_count} are due soon"
            summary += "."
        
        return {
            'total_tasks': total_tasks,
            'status_count': status_count,
            'priority_count': priority_count,
            'due_soon_count': due_soon_count,
            'summary': summary
        }