from flask import Flask, jsonify
from flask_restx import Api, Resource, reqparse
import json
from datetime import datetime

app = Flask(__name__)
api = Api(app, version='1.0', title='History API',
          description='A simple API to query historical events')

# Load data from the JSON file
with open('history_in_today.json', 'r', encoding='utf-8') as f:
    history_data = json.load(f)

# Define a parser for query parameters
parser = reqparse.RequestParser()
parser.add_argument('type', type=int, help='Type of event to filter (1: major events, 2: births, 3: deaths)', required=False)

@api.route('/history/today')
class HistoryToday(Resource):
    @api.doc('get_history_today')
    @api.expect(parser)
    def get(self):
        """Query historical events that happened today"""
        args = parser.parse_args()
        event_type = args.get('type')
        
        # Get today's date
        today = datetime.now()
        today_month_day = (today.month, today.day)
        
        # Filter events based on today's month and day
        filtered_events = [
            event for event in history_data
            if (int(event['month']), int(event['day'])) == today_month_day
            and (event_type is None or event['type'] == event_type)
        ]
        
        return jsonify(filtered_events)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
