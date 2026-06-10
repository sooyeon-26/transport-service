from pathlib import Path
import joblib
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from preprocess import preprocess

MODEL_PATH = Path(__file__).resolve().parent / "bus_crowding_model.pkl"
MAX_TRAIN_ROWS = 200_000


def train():
    df = preprocess()
    full_rows = len(df)
    if len(df) > MAX_TRAIN_ROWS:
        df = df.sample(MAX_TRAIN_ROWS, random_state=42)

    features = ["route", "station", "dayType", "hour", "isWeekend", "passengers", "alightPassengers"]
    target = "crowding"

    x = df[features]
    y = df[target]

    preprocessor = ColumnTransformer(
        transformers=[
            ("category", OneHotEncoder(handle_unknown="ignore"), ["route", "station", "dayType"]),
            ("number", "passthrough", ["hour", "isWeekend", "passengers", "alightPassengers"]),
        ]
    )

    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", RandomForestClassifier(n_estimators=160, random_state=42, class_weight="balanced")),
        ]
    )

    if len(df) >= 20 and y.nunique() > 1:
        x_train, x_test, y_train, y_test = train_test_split(
            x,
            y,
            test_size=0.25,
            random_state=42,
            stratify=y,
        )
        model.fit(x_train, y_train)
        report = classification_report(y_test, model.predict(x_test), zero_division=0)
    else:
        model.fit(x, y)
        report = "샘플 데이터가 작아 전체 데이터로 학습했습니다."

    artifact = {
        "model": model,
        "features": features,
        "trainingRows": len(df),
        "sourceRows": full_rows,
        "routes": sorted(df["route"].unique().tolist()),
        "stations": sorted(df["station"].unique().tolist()),
    }
    joblib.dump(artifact, MODEL_PATH)
    return report


if __name__ == "__main__":
    print(train())
    print(f"saved: {MODEL_PATH}")
