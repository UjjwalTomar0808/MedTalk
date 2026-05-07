import os
import warnings
import pickle
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Fix Keras/TF conflicts and threading issues
os.environ["SHAP_DISABLE_GPU"] = "1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["KERAS_BACKEND"] = "torch"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMBA_NUM_THREADS"] = "1"
warnings.filterwarnings("ignore")
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import shap
from transformers import pipeline

app = FastAPI(title="Diabetes AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
model = None
storyteller = None

@app.on_event("startup")
def load_models():
    global model, storyteller
    print("Loading ML models...")
    try:
        # We assume the model is in the parent directory
        model_path = os.path.join(os.path.dirname(__file__), "..", "diabetes_rf_model.pkl")
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        
    try:
        storyteller = pipeline("summarization", model="facebook/bart-large-cnn", framework="pt")
        print("BART pipeline loaded successfully.")
    except Exception as e:
        print(f"Error loading BART pipeline: {e}")

class PatientData(BaseModel):
    age: float
    bmi: float
    HbA1c_level: float
    blood_glucose_level: float
    hypertension: int
    heart_disease: int
    gender: str
    smoking_history: str

class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

@app.post("/api/analyze")
def analyze_patient(data: PatientData):
    global model, storyteller
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    # Create dataframe for prediction
    input_dict = data.dict()
    X_input = pd.DataFrame([input_dict])

    # Make Prediction
    try:
        prediction = model.predict(X_input)[0]
        probability = model.predict_proba(X_input)[0][1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    result = "Diabetic" if prediction == 1 else "Non-Diabetic"

    # Risk level
    if probability >= 0.8:
        risk_level = "HIGH RISK"
        risk_color = "🔴"
    elif probability >= 0.6:
        risk_level = "MODERATE-HIGH RISK"
        risk_color = "🟠"
    elif probability >= 0.4:
        risk_level = "MODERATE RISK"
        risk_color = "🟡"
    else:
        risk_level = "LOW RISK"
        risk_color = "🟢"

    # SHAP
    sorted_exp = {}
    shap_values_list = []
    try:
        preprocessor = model.named_steps["preprocessor"]
        classifier = model.named_steps["classifier"]
        X_transformed = preprocessor.transform(X_input)

        ohe = preprocessor.named_transformers_["cat"]
        ohe_features = list(ohe.get_feature_names_out(["gender", "smoking_history"]))
        num_features = preprocessor.transformers_[0][2]
        all_features = num_features + ohe_features

        explainer = shap.TreeExplainer(classifier)
        shap_values_result = explainer.shap_values(X_transformed)
        
        # Determine the shape and extract class 1 securely
        if isinstance(shap_values_result, list):
            # For random forest, it often returns a list of arrays (one per class)
            shap_class1 = shap_values_result[1][0]
        elif len(shap_values_result.shape) == 3:
            # (1, num_features, 2)
            shap_class1 = shap_values_result[0][:, 1]
        elif len(shap_values_result.shape) == 2:
            # (1, num_features)
            shap_class1 = shap_values_result[0]
        else:
            shap_class1 = shap_values_result[0]

        explanation = {feature: float(shap_class1[i]) for i, feature in enumerate(all_features)}
        sorted_exp = dict(sorted(explanation.items(), key=lambda x: abs(x[1]), reverse=True))

        for feat, val in explanation.items():
            shap_values_list.append({"feature": feat, "impact": val})

    except Exception as e:
        print(f"SHAP Error: {e}")

    # Recommendations
    recommendations = []
    if 'HbA1c_level' in sorted_exp and sorted_exp['HbA1c_level'] > 0.1:
        if data.HbA1c_level >= 6.5:
            recommendations.append("🔴 URGENT: HbA1c in diabetic range - immediate medical intervention needed")
        elif data.HbA1c_level >= 5.7:
            recommendations.append("🟠 CRITICAL: HbA1c in prediabetic range - lifestyle changes and monitoring required")
        else:
            recommendations.append("🟡 MONITOR: HbA1c approaching concerning levels - preventive measures recommended")

    if 'blood_glucose_level' in sorted_exp and sorted_exp['blood_glucose_level'] > 0.05:
        if data.blood_glucose_level >= 200:
            recommendations.append("🔴 URGENT: Blood glucose in diabetic range - immediate medical attention")
        elif data.blood_glucose_level >= 140:
            recommendations.append("🟠 CRITICAL: Blood glucose in prediabetic range - dietary intervention needed")

    if 'bmi' in sorted_exp and sorted_exp['bmi'] > 0.05:
        if data.bmi >= 30:
            recommendations.append("🟠 WEIGHT MANAGEMENT: BMI indicates obesity - structured weight loss program recommended")
        elif data.bmi >= 25:
            recommendations.append("🟡 WEIGHT MANAGEMENT: BMI indicates overweight - moderate weight loss beneficial")

    if 'hypertension' in sorted_exp and sorted_exp['hypertension'] > 0.05:
        recommendations.append("🟠 CARDIOVASCULAR: Hypertension present - blood pressure management crucial")

    if 'age' in sorted_exp and data.age > 45:
        recommendations.append("🟡 AGE FACTOR: Age increases diabetes risk - enhanced monitoring recommended")

    recommendations.append("📋 GENERAL: Regular exercise (150 min/week moderate intensity)")
    recommendations.append("🥗 DIET: Low-carb, high-fiber diet with portion control")
    recommendations.append("📊 MONITORING: Regular blood glucose and HbA1c testing")
    recommendations.append("🚭 LIFESTYLE: Avoid smoking, limit alcohol consumption")

    # BART Story
    story = ""
    try:
        if storyteller is not None:
            factors_text = ", ".join([f"{k} (impact: {v:.3f})" for k, v in list(sorted_exp.items())[:5]]) if sorted_exp else "N/A"
            raw_text = f"""
            CLINICAL ANALYSIS SUMMARY:
            The machine learning model predicted that this {data.age}-year-old patient is {result} with a {probability:.1%} probability of diabetes.
            KEY CLINICAL FINDINGS:
            - HbA1c Level: {data.HbA1c_level}%
            - Blood Glucose: {data.blood_glucose_level} mg/dL
            - BMI: {data.bmi}
            - Hypertension: {'Present' if data.hypertension == 1 else 'Absent'}
            - Heart Disease: {'Present' if data.heart_disease == 1 else 'Absent'}
            FEATURE IMPACT ANALYSIS:
            The most significant contributing factors to the diabetes prediction were: {factors_text}.
            CLINICAL INTERPRETATION:
            This patient shows multiple risk factors for diabetes.
            """
            story = storyteller(raw_text, max_length=120, min_length=30, do_sample=False)[0]["summary_text"]
    except Exception as e:
        print(f"BART Error: {e}")
        story = f"The model predicted that the patient is {result} with a probability of {probability:.2f}."

    return {
        "probability": float(probability),
        "result": result,
        "risk_level": risk_level,
        "shap_values": shap_values_list,
        "clinical_story": story,
        "recommendations": recommendations,
        "context": {
            "probability": float(probability),
            "sorted_exp": sorted_exp,
            "X_input": input_dict
        }
    }

@app.post("/api/chat")
def chat_with_assistant(chat_data: ChatMessage):
    # Stubbed fallback implementation for followup_engine since it's missing
    message = chat_data.message.lower()
    prob = chat_data.context.get("probability", 0) if chat_data.context else 0
    
    if "risk" in message:
        return {"reply": f"Based on the analysis, your diabetes risk probability is {prob*100:.1f}%. I recommend consulting an endocrinologist if this is above 60%."}
    elif "hba1c" in message:
        return {"reply": "HbA1c is your average blood sugar over 2-3 months. Normal is < 5.7%. Above 6.5% indicates diabetes."}
    elif "bmi" in message:
        return {"reply": "BMI is a measure of body fat. A BMI above 30 indicates obesity, which significantly increases diabetes risk."}
    else:
        return {"reply": f"I understand you're asking about '{chat_data.message}'. As an AI assistant, I suggest taking the comprehensive recommendations from your dashboard and discussing them with a healthcare provider."}
