# Violence Detection System

This repository contains a complete Violence Detection System. It includes a **React** frontend, a **Flask** backend, and a deep learning model built using **VGG19** and **Bidirectional LSTM**. The system can detect violent activity in videos and provide real-time predictions.

## Adding Images

To include images in the documentation, upload the image files to the repository and reference them using Markdown syntax:

```markdown
![Web-App Layout](Violence_Detection_system
/vc-output1.png)
```

For example:

```markdown

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Setup](#setup)
- [Usage](#usage)
- [Model Details](#model-details)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Real-time violence detection** using state-of-the-art deep learning techniques.
- Interactive and user-friendly **React** frontend.
- Robust backend powered by **Flask**.
- Pretrained model utilizing **VGG19** for feature extraction and **Bidirectional LSTM** for temporal analysis.
- Supports video file uploads for prediction.

---

## Architecture

1. **Frontend**: Built with React, the frontend allows users to upload videos and view the prediction results in an intuitive interface.
2. **Backend**: Flask API manages video uploads, processes requests, and interacts with the model for predictions.
3. **Model**: The violence detection model uses:
   - **VGG19**: For spatial feature extraction from video frames.
   - **Bidirectional LSTM**: For temporal sequence modeling across frames.

---

## Setup

### Prerequisites
Ensure you have the following installed on your system:
- Python (>=3.8)
- Node.js (>=14.x)
- npm (>=6.x)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/violence-detection-system.git
   cd violence-detection-system/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The React app should now be accessible at `http://localhost:3000`.

---

## Usage

1. Run the backend server using the steps in the [Backend Setup](#backend-setup).
2. Start the frontend server using the steps in the [Frontend Setup](#frontend-setup).
3. Open the React app in your browser.
4. Upload a video file to see predictions.

---

## Model Details

- **Base Model**: VGG19
  - Pretrained on ImageNet for feature extraction.
- **Sequence Model**: Bidirectional LSTM
  - Trained on sequential frame data for temporal context.
- **Input**: Extracted frames from the uploaded video.
- **Output**: Probability of violence detected in the video.

---

## File Structure

```
violence-detection-system/
├── my-app/                 # React frontend files
│   ├── node_modules/       # Frontend dependencies
│   ├── public/             # Static files for React
│   ├── src/                # React source files
│   ├── package.json        # Frontend configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── postcss.config.js   # PostCSS configuration
├── Violence_Detection_system/
│   ├── app.py              # Flask backend application
│   ├── attention_layer.py  # Custom attention layer implementation
│   ├── model.h5            # Pretrained VGG19 + BiLSTM model
│   ├── ModelWeights.h5     # Additional model weights
│   ├── test.py             # Script for testing the model
│   └── venv/               # Python virtual environment
├── .gitignore              # Git ignored files and folders
├── .gitattributes          # Git attributes
└── README.md               # Project documentation
```

---

## Contributing

Contributions are welcome! Follow these steps to contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add a feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---


![File Structure](images/file-structure.png)
```
