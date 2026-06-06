from flask_socketio import SocketIO

# Create an uninitialized SocketIO object
socketio = SocketIO(cors_allowed_origins="*")

def emit_update(event_name, data):
    """
    Helper function to emit real-time updates to all connected clients.
    event_name: e.g. 'product_updated', 'order_status_changed'
    """
    try:
        socketio.emit(event_name, data)
    except Exception as e:
        print(f"Error emitting websocket event {event_name}: {e}")
