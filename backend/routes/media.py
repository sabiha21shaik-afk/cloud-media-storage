from flask import Blueprint, request, jsonify, send_file
from database import db
from models.media import Media
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import uuid

media_bp = Blueprint("media", __name__)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@media_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():

    if "file" not in request.files:
        return jsonify({"message": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"message": "No file selected"}), 400

    user_id = int(get_jwt_identity())

    original_filename = file.filename

    file_extension = os.path.splitext(original_filename)[1]

    unique_filename = str(uuid.uuid4()) + file_extension

    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    file.save(file_path)

    file_size = os.path.getsize(file_path)

    new_media = Media(
        filename=original_filename,
        file_type=file.content_type or "unknown",
        file_size=file_size,
        file_path=file_path,
        user_id=user_id
    )

    db.session.add(new_media)
    db.session.commit()

    return jsonify({
        "message": "File uploaded successfully",
        "file": {
            "id": new_media.id,
            "filename": new_media.filename,
            "file_type": new_media.file_type,
            "file_size": new_media.file_size,
            "user_id": new_media.user_id
        }
    }), 201


@media_bp.route("/files", methods=["GET"])
@jwt_required()
def get_user_files():

    user_id = int(get_jwt_identity())

    files = Media.query.filter_by(user_id=user_id).all()

    file_list = []

    for media in files:
        file_list.append({
            "id": media.id,
            "filename": media.filename,
            "file_type": media.file_type,
            "file_size": media.file_size,
            "user_id": media.user_id
        })

    return jsonify({
        "user_id": user_id,
        "files": file_list
    }), 200


@media_bp.route("/download/<int:file_id>", methods=["GET"])
@jwt_required()
def download_file(file_id):

    user_id = int(get_jwt_identity())

    media = Media.query.filter_by(
        id=file_id,
        user_id=user_id
    ).first()

    if not media:
        return jsonify({"message": "File not found"}), 404

    if not os.path.exists(media.file_path):
        return jsonify({
            "message": "File does not exist on server"
        }), 404

    return send_file(
        media.file_path,
        as_attachment=True,
        download_name=media.filename
    )


@media_bp.route("/files/<int:file_id>", methods=["DELETE"])
@jwt_required()
def delete_file(file_id):

    user_id = int(get_jwt_identity())

    media = Media.query.filter_by(
        id=file_id,
        user_id=user_id
    ).first()

    if not media:
        return jsonify({"message": "File not found"}), 404

    if os.path.exists(media.file_path):
        os.remove(media.file_path)

    db.session.delete(media)
    db.session.commit()

    return jsonify({
        "message": "File deleted successfully",
        "file_id": file_id
    }), 200