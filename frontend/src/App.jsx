import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:5000";

// Demo storage limit
const STORAGE_LIMIT = 100 * 1024 * 1024; // 100 MB

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("sabiha21shaik@gmail.com");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("access_token") || ""
  );

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // LOGIN / REGISTER
  // -----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      if (!isLogin) {
        const response = await axios.post(`${API_URL}/register`, {
          name,
          email,
          password,
        });

        setMessage(
          response.data.message || "Registration successful. Please login."
        );

        setIsLogin(true);
        setPassword("");
      } else {
        const response = await axios.post(`${API_URL}/login`, {
          email,
          password,
        });

        const accessToken = response.data.access_token;

        localStorage.setItem("access_token", accessToken);
        setToken(accessToken);
        setMessage("Login successful!");
        setPassword("");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // GET FILES
  // -----------------------------

  const fetchFiles = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFiles(
        Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.files)
          ? response.data.files
          : []
      );
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [token]);

  // -----------------------------
  // UPLOAD FILE
  // -----------------------------

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(
        response.data.message || "File uploaded successfully!"
      );

      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById("fileInput");
      if (fileInput) {
        fileInput.value = "";
      }

      fetchFiles();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "File upload failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // DOWNLOAD FILE
  // -----------------------------

  const handleDownload = async (file) => {
    try {
      const response = await axios.get(
        `${API_URL}/download/${file.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.filename);

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage("Download failed.");
    }
  };

  // -----------------------------
  // DELETE FILE
  // -----------------------------

  const handleDelete = async (fileId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${API_URL}/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message || "File deleted successfully."
      );

      fetchFiles();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Delete failed."
      );
    }
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setToken("");
    setFiles([]);
    setMessage("");
  };

  // -----------------------------
  // FILE TYPE
  // -----------------------------

  const getFileCategory = (fileType, filename) => {
    const type = (fileType || "").toLowerCase();
    const name = (filename || "").toLowerCase();

    if (
      type.includes("image") ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)
    ) {
      return "Images";
    }

    if (
      type.includes("video") ||
      /\.(mp4|avi|mov|mkv|webm)$/i.test(name)
    ) {
      return "Videos";
    }

    if (
      type.includes("audio") ||
      /\.(mp3|wav|ogg|m4a)$/i.test(name)
    ) {
      return "Audio";
    }

    if (
      type.includes("pdf") ||
      type.includes("document") ||
      type.includes("text") ||
      /\.(pdf|doc|docx|txt|ppt|pptx|xls|xlsx)$/i.test(name)
    ) {
      return "Documents";
    }

    return "Other";
  };

  // -----------------------------
  // FILE ICON
  // -----------------------------

  const getFileIcon = (file) => {
    const fileCategory = getFileCategory(
      file.file_type,
      file.filename
    );

    if (fileCategory === "Images") return "🖼️";
    if (fileCategory === "Videos") return "🎬";
    if (fileCategory === "Audio") return "🎵";
    if (fileCategory === "Documents") return "📄";

    return "📁";
  };

  // -----------------------------
  // FILE SIZE
  // -----------------------------

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) {
      return "0 Bytes";
    }

    const units = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return (
      (bytes / Math.pow(1024, index)).toFixed(2) +
      " " +
      units[index]
    );
  };

  // -----------------------------
  // STATISTICS
  // -----------------------------

  const totalStorage = useMemo(() => {
    return files.reduce(
      (total, file) =>
        total + Number(file.file_size || 0),
      0
    );
  }, [files]);

  const storagePercentage = Math.min(
    (totalStorage / STORAGE_LIMIT) * 100,
    100
  );

  const imageCount = files.filter(
    (file) =>
      getFileCategory(
        file.file_type,
        file.filename
      ) === "Images"
  ).length;

  const documentCount = files.filter(
    (file) =>
      getFileCategory(
        file.file_type,
        file.filename
      ) === "Documents"
  ).length;

  const videoCount = files.filter(
    (file) =>
      getFileCategory(
        file.file_type,
        file.filename
      ) === "Videos"
  ).length;

  // -----------------------------
  // SEARCH + CATEGORY FILTER
  // -----------------------------

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.filename
      .toLowerCase()
      .includes(search.toLowerCase());

    const fileCategory = getFileCategory(
      file.file_type,
      file.filename
    );

    const matchesCategory =
      category === "All" ||
      fileCategory === category;

    return matchesSearch && matchesCategory;
  });

  // -----------------------------
  // LOGIN / REGISTER SCREEN
  // -----------------------------

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">

          <div className="logo-circle">
            ☁️
          </div>

          <h1>CloudNest</h1>

          <p className="auth-subtitle">
            Smart Cloud Media Storage
          </p>

          <div className="auth-tabs">
            <button
              className={isLogin ? "active-tab" : ""}
              onClick={() => {
                setIsLogin(true);
                setMessage("");
              }}
            >
              Login
            </button>

            <button
              className={!isLogin ? "active-tab" : ""}
              onClick={() => {
                setIsLogin(false);
                setMessage("");
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            {!isLogin && (
              <div className="input-group">
                <label>Full Name</label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <button
              className="main-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login to CloudNest"
                : "Create Account"}
            </button>

          </form>

          {message && (
            <div className="message">
              {message}
            </div>
          )}

          <p className="auth-footer">
            Secure • Simple • Smart
          </p>

        </div>
      </div>
    );
  }

  // -----------------------------
  // DASHBOARD
  // -----------------------------

  return (
    <div className="dashboard">

      {/* HEADER */}

      <header className="topbar">

        <div className="brand">
          <div className="brand-icon">
            ☁️
          </div>

          <div>
            <h2>CloudNest</h2>
            <span>Smart Cloud Storage</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      <main className="main-content">

        {/* WELCOME */}

        <section className="welcome-section">

          <div>
            <h1>Welcome to your Cloud ☁️</h1>

            <p>
              Store, manage and access your files
              securely from one place.
            </p>
          </div>

        </section>

        {/* MESSAGE */}

        {message && (
          <div className="dashboard-message">
            {message}
          </div>
        )}

        {/* STAT CARDS */}

        <section className="stats-grid">

          <div className="stat-card purple">
            <div className="stat-icon">
              📁
            </div>

            <div>
              <span>Total Files</span>
              <strong>{files.length}</strong>
            </div>
          </div>

          <div className="stat-card blue">
            <div className="stat-icon">
              🖼️
            </div>

            <div>
              <span>Images</span>
              <strong>{imageCount}</strong>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              📄
            </div>

            <div>
              <span>Documents</span>
              <strong>{documentCount}</strong>
            </div>
          </div>

          <div className="stat-card pink">
            <div className="stat-icon">
              🎬
            </div>

            <div>
              <span>Videos</span>
              <strong>{videoCount}</strong>
            </div>
          </div>

        </section>

        {/* STORAGE USAGE */}

        <section className="storage-card">

          <div className="storage-header">

            <div>
              <h2>💾 Storage Usage</h2>

              <p>
                Monitor your cloud storage
              </p>
            </div>

            <div className="storage-numbers">
              <strong>
                {formatFileSize(totalStorage)}
              </strong>

              <span>
                / 100 MB
              </span>
            </div>

          </div>

          <div className="progress-container">

            <div
              className="progress-bar"
              style={{
                width: `${storagePercentage}%`,
              }}
            ></div>

          </div>

          <div className="storage-footer">

            <span>
              {storagePercentage.toFixed(1)}% used
            </span>

            <span>
              {formatFileSize(
                Math.max(
                  STORAGE_LIMIT - totalStorage,
                  0
                )
              )}{" "}
              remaining
            </span>

          </div>

        </section>

        {/* UPLOAD */}

        <section className="upload-card">

          <div className="upload-icon">
            ⬆️
          </div>

          <div className="upload-content">

            <h2>Upload New File</h2>

            <p>
              Select a file and upload it securely
              to your cloud storage.
            </p>

            <input
              id="fileInput"
              type="file"
              onChange={(e) =>
                setSelectedFile(
                  e.target.files[0]
                )
              }
            />

            {selectedFile && (
              <div className="selected-file">
                Selected:{" "}
                <strong>
                  {selectedFile.name}
                </strong>
              </div>
            )}

            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : "☁️ Upload File"}
            </button>

          </div>

        </section>

        {/* FILES SECTION */}

        <section className="files-section">

          <div className="files-header">

            <div>
              <h2>My Files</h2>

              <p>
                Manage your uploaded files
              </p>
            </div>

            <div className="file-count">
              {filteredFiles.length} files
            </div>

          </div>

          {/* SEARCH */}

          <div className="filter-row">

            <div className="search-box">
              🔎

              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div className="category-buttons">

              {[
                "All",
                "Documents",
                "Images",
                "Videos",
                "Audio",
                "Other",
              ].map((item) => (
                <button
                  key={item}
                  className={
                    category === item
                      ? "category-active"
                      : ""
                  }
                  onClick={() =>
                    setCategory(item)
                  }
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

          {/* FILE LIST */}

          {filteredFiles.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📂
              </div>

              <h3>No files found</h3>

              <p>
                Upload a file to see it here.
              </p>

            </div>

          ) : (

            <div className="file-list">

              {filteredFiles.map((file) => (

                <div
                  className="file-item"
                  key={file.id}
                >

                  <div className="file-info">

                    <div className="file-icon">
                      {getFileIcon(file)}
                    </div>

                    <div className="file-details">

                      <h3>
                        {file.filename}
                      </h3>

                      <p>
                        {getFileCategory(
                          file.file_type,
                          file.filename
                        )}{" "}
                        •{" "}
                        {formatFileSize(
                          file.file_size
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="file-actions">

                    <button
                      className="download-button"
                      onClick={() =>
                        handleDownload(file)
                      }
                    >
                      ⬇️ Download
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(file.id)
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

      <footer className="footer">
        CloudNest • Secure Cloud Media File Storage
      </footer>

    </div>
  );
}

export default App;