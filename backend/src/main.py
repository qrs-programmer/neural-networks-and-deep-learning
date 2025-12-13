from nn import mnist_loader
from nn import network
from nn import optimized_network
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    pixels: list[float]

net = optimized_network.Network([784, 30, 10])
net.load("models/model.npz")

@app.post("/predict")
def predict(req: PredictRequest):
    x = np.array(req.pixels)

    if x.shape[0] != 784:
        return {"error": "Expected 784 inputs"}

    digit = net.predict(x)
    return {"digit": digit}

# def computeEfficiencyUpdgrade(original_times, optimized_times):
#     avg_orig = sum(original_times) / len(original_times)
#     avg_opt  = sum(optimized_times) / len(optimized_times)
#     speedup = avg_orig / avg_opt
#     percent = (speedup - 1) * 100
#     print(f"Speedup factor: {speedup:.2f}x")
#     print(f"Efficiency improvement: {percent:.2f}%")

# training_data, validation_data, test_data = mnist_loader.load_data_wrapper()
# original_times = []
# optimized_times = []

# print("Original Network: \n-----------------------------------------")
# net = network.Network([784, 30, 10])
# original_times = net.SGD(training_data, 30, 10, 3.3, test_data=test_data)

# print("Optimized Network: \n-----------------------------------------")
# net = optimized_network.Network([784, 30, 10])
# optimized_times = net.SGD(training_data, 30, 10, 3.3, test_data=test_data)

# print("Efficiency Upgrade: \n-----------------------------------------")
# computeEfficiencyUpdgrade(original_times, optimized_times)


