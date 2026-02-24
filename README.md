# 🌸 Iris Flower Classifier — Cloud ML Deployment

![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

> A full-stack cloud-based Machine Learning application that trains, deploys, and serves an Iris flower classification model via REST API — deployed entirely on Google Cloud Platform.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend** | https://storage.googleapis.com/iris-frontend-vaishnavi-488407/index.html |
| **API Health** | https://iris-api-oc24zgbr5a-el.a.run.app/health |
| **API Predict** | https://iris-api-oc24zgbr5a-el.a.run.app/predict |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   GCP Cloud Storage                      │
│         index.html  •  style.css  •  script.js           │
│    https://storage.googleapis.com/iris-frontend-vaishnavi│
└──────────────────────┬───────────────────────────────────┘
                       │ HTTP POST /predict
                       ▼
┌──────────────────────────────────────────────────────────┐
│                   GCP Cloud Run                          │
│              Flask REST API  (app.py)                    │
│         https://iris-api-oc24zgbr5a-el.a.run.app         │
└──────────────────────┬───────────────────────────────────┘
                       │ loads model
                       ▼
┌──────────────────────────────────────────────────────────┐
│                   GCP Cloud Storage                      │
│         iris_model.pkl  •  target_names.pkl              │
└──────────────────────────────────────────────────────────┘
         ↑
         │ auto-deploy on every git push
┌────────┴─────────────────────────────────────────────────┐
│                   GitHub Actions CI/CD                   │
│     Build → Test → Dockerize → Deploy to Cloud Run       │
└──────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- 🧠 **ML Model** — Random Forest Classifier trained on the Iris dataset with ~100% accuracy
- 🚀 **REST API** — Flask API containerized with Docker and deployed on GCP Cloud Run
- 🎨 **Beautiful Frontend** — Interactive UI with sliders, presets, and animated results
- 🔄 **CI/CD Pipeline** — GitHub Actions automatically builds and deploys on every push to `main`
- 📊 **Cloud Logging** — All predictions logged to GCP Cloud Logging for monitoring
- 🔒 **CORS Enabled** — Frontend can securely call the API from any origin
- 📦 **Model Storage** — Model files stored on GCP Cloud Storage, loaded at runtime

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **ML Training** | Python, scikit-learn, Google Colab |
| **Backend API** | Python, Flask, Gunicorn |
| **Containerization** | Docker |
| **Model Storage** | GCP Cloud Storage |
| **API Hosting** | GCP Cloud Run |
| **Frontend Hosting** | GCP Cloud Storage (Static Website) |
| **CI/CD** | GitHub Actions |
| **Monitoring** | GCP Cloud Logging |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |

---

## 📁 Project Structure

```
ml-model-deployment/
│
├── 📂 model/
│   ├── train_model.ipynb       # Google Colab training notebook
│   ├── iris_model.pkl          # Trained Random Forest model
│   └── target_names.pkl        # Class label names
│
├── 📂 api/
│   ├── app.py                  # Flask REST API
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Container configuration
│
├── 📂 frontend/
│   ├── index.html              # Main HTML page
│   ├── style.css               # Styles and animations
│   └── script.js               # API calls and UI logic
│
├── 📂 .github/
│   └── 📂 workflows/
│       └── deploy.yml          # GitHub Actions CI/CD pipeline
│
└── README.md
```

---

## 🚀 API Reference

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "model": "iris-classifier",
  "status": "healthy"
}
```

### Predict Species
```http
POST /predict
Content-Type: application/json
```

**Request Body:**
```json
{
  "features": [5.1, 3.5, 1.4, 0.2]
}
```
> Features order: `[sepal_length, sepal_width, petal_length, petal_width]` (all in cm)

**Response:**
```json
{
  "class": "setosa",
  "confidence": 100.0,
  "prediction": 0,
  "probabilities": {
    "setosa": 100.0,
    "versicolor": 0.0,
    "virginica": 0.0
  }
}
```

---

## 🌺 Sample Inputs

| Species | Sepal L | Sepal W | Petal L | Petal W |
|---|---|---|---|---|
| 🌸 **Setosa** | 5.1 | 3.5 | 1.4 | 0.2 |
| 💜 **Versicolor** | 6.0 | 2.9 | 4.5 | 1.5 |
| 🌿 **Virginica** | 6.7 | 3.1 | 5.6 | 2.4 |

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.10+
- Docker
- Google Cloud SDK
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/vaishnavi10200/ml-model-deployment.git
cd ml-model-deployment
```

### 2. Run API Locally
```bash
cd api
pip install -r requirements.txt
export BUCKET_NAME=your-gcp-bucket-name
python app.py
```
API runs at: `http://localhost:8080`

### 3. Run Frontend Locally
Open `frontend/index.html` with Live Server in VS Code.

### 4. Run with Docker
```bash
cd api
docker build -t iris-api .
docker run -p 8080:8080 -e BUCKET_NAME=your-bucket iris-api
```

---

## 🔄 CI/CD Pipeline

Every push to `main` automatically triggers:

```
Push to main
     │
     ▼
① Checkout code
     │
     ▼
② Authenticate to GCP
     │
     ▼
③ Build Docker image → push to GCR
     │
     ▼
④ Verify image exists
     │
     ▼
⑤ Deploy to Cloud Run
     │
     ▼
⑥ Deploy frontend to Cloud Storage
     │
     ▼
✅ Live in ~3 minutes!
```

### GitHub Secrets Required

| Secret | Description |
|---|---|
| `GCP_SA_KEY` | GCP Service Account JSON key |
| `GCP_PROJECT_ID` | Your GCP project ID |
| `BUCKET_NAME` | Model storage bucket name |
| `FRONTEND_BUCKET` | Frontend hosting bucket name |

---

## 📊 Model Performance

| Metric | Score |
|---|---|
| **Algorithm** | Random Forest (100 estimators) |
| **Test Accuracy** | ~97-100% |
| **Dataset** | Iris (150 samples, 3 classes) |
| **Features** | 4 (sepal/petal length & width) |
| **Classes** | Setosa, Versicolor, Virginica |

---

## ☁️ GCP Services Used

| Service | Purpose |
|---|---|
| **Cloud Run** | Serverless container hosting for Flask API |
| **Cloud Storage** | Model file storage + frontend static hosting |
| **Cloud Build** | Docker image building |
| **Container Registry** | Docker image storage |
| **Cloud Logging** | API request and prediction logging |
| **IAM** | Service account permissions management |

---

## 📈 Monitoring

View live logs in GCP Console → **Logging** → **Logs Explorer**:

```
resource.type="cloud_run_revision"
resource.labels.service_name="iris-api"
```

---

## 👩‍💻 Author

**Vaishnavi** — [@vaishnavi10200](https://github.com/vaishnavi10200)

---

<div align="center">
  Built with ❤️ using GCP Cloud Run • Flask • scikit-learn • GitHub Actions
</div>