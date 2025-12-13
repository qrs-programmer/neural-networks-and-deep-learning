from nn import mnist_loader
from nn import optimized_network

training_data, validation_data, test_data = mnist_loader.load_data_wrapper()

net = optimized_network.Network([784, 30, 10])
net.SGD(training_data, 30, 10, 3.3, test_data=test_data)

net.save("models/model.npz")
