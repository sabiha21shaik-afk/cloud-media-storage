from flask import Flask
from database import db
from models.user import User
from models.media import Media
from routes.auth import auth_bp
from routes.media import media_bp
from flask_jwt_extended import JWTManager
from flask_cors import CORS

app = Flask(__name__)

# -----------------------------
# Database Configuration
# -----------------------------
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///cloud_media.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# -----------------------------
# JWT Configuration
# -----------------------------
app.config["JWT_SECRET_KEY"] = "cloud-media-storage-secret-key"

# -----------------------------
# Initialize Extensions
# -----------------------------
db.init_app(app)
jwt = JWTManager(app)
CORS(app)

# -----------------------------
# Register Blueprints
# -----------------------------
app.register_blueprint(auth_bp)
app.register_blueprint(media_bp)

# -----------------------------
# Create Database Tables
# -----------------------------
with app.app_context():
    db.create_all()

# -----------------------------
# Home Route
# -----------------------------
@app.route("/")
def home():
    return "Cloud Media Storage Service is running!"

# -----------------------------
# Run Application
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)