from flask import Flask
from database import db
from models.user import User
from models.media import Media
from routes.auth import auth_bp
from routes.media import media_bp
from flask_jwt_extended import JWTManager

app = Flask(__name__)

# Database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///cloud_media.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# JWT
app.config["JWT_SECRET_KEY"] = "cloud-media-storage-secret-key"

# Initialize database
db.init_app(app)

# Initialize JWT
jwt = JWTManager(app)

# Register routes
app.register_blueprint(auth_bp)
app.register_blueprint(media_bp)

# Create tables
with app.app_context():
    db.create_all()


@app.route("/")
def home():
    return "Cloud Media Storage Service is running!"


if __name__ == "__main__":
    app.run(debug=True)