# FinSight – Fish Behavior Monitoring System

## Overview

FinSight is a mobile application developed to monitor fish behavior using artificial intelligence. The system analyzes fish videos and detects whether the behavior is normal or abnormal. If abnormal behavior is detected, the system further identifies whether the cause is stress or hunger.

The purpose of this project is to help aquarium owners easily monitor the health and behavior of their fish without constantly observing them manually.

The application is developed using React Native and Expo so that it can run on both Android and iOS devices.

---

## Features

* Upload or capture fish tank videos
* Detect fish behavior using AI models
* Classify behavior as **Normal or Abnormal**
* Identify the reason for abnormal behavior (**Stress or Hungry**)
* Provide simple recommendations based on the prediction
* Cross-platform mobile application

---

## Technologies Used

### Mobile Application

* React Native
* Expo
* Expo Router
* TypeScript

### Machine Learning

* Python
* TensorFlow / Keras
* OpenCV
* NumPy
* Scikit-learn

---

## AI Model Workflow

The system uses two machine learning models.

1. **Model 1 – Normal vs Abnormal Detection**

   The uploaded fish video is first analyzed to determine whether the fish behavior is normal or abnormal.

2. **Model 2 – Stress vs Hungry Detection**

   If abnormal behavior is detected, the system then determines whether the fish is stressed or hungry.

Workflow:

```
Fish Video
   ↓
Frame Extraction
   ↓
Model 1
(Normal vs Abnormal)
   ↓
If Abnormal
   ↓
Model 2
(Stress vs Hungry)
   ↓
Prediction Result
```

---

## Project Structure

```
app/                → Mobile application screens
assets/             → Images and static resources
constants/          → Application configuration
model1/             → Model 1 training files
model2/             → Model 2 training files
README.md           → Project documentation
package.json        → Project dependencies
```

---

## Installation

### 1. Clone the repository

```
git clone <repository_url>
```

### 2. Navigate to the project folder

```
cd FinSight-App
```

### 3. Install dependencies

```
npm install
```

or

```
bun install
```

### 4. Start the development server

```
npm start
```

---

## Running the Application

### On Mobile Device

1. Install **Expo Go** from the App Store or Google Play.
2. Run the project using:

```
npm start
```

3. Scan the QR code using Expo Go to open the application.

---

## Future Improvements

* Real-time fish monitoring using a live camera
* Notifications for abnormal fish behavior
* Integration with water quality sensors
* Improved AI model accuracy with larger datasets

---

## Author

This project was developed as part of the **FinSight – AI Fish Behavior Monitoring System**.
