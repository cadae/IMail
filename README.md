# IMail
IMail

## Frontend
1. Install [Node JS](https://nodejs.org/en/download/) 
2. Install the required modules
   `npm install`
3. Run frontend on port 3000
   `npm run dev`

Additional steps before runing:
1. Register as Google developer and create and application and enable Gmail API access to the application [Gmail API Quickstart](https://developers.google.com/gmail/api/quickstart/nodejs)
2. Replace the Client ID and API key in the gmail_controller.js in public/js/controllers

Note: All requests send to IRIS at port 52774, change it before you run the application

## IRIS 
1. Create a Namespace 
2. Import EmailIntel.xml which includes all classes and interoperability.
3. Create a Web appication in IRIS using class RESTOperations.cls

## Google Colab
1. Open the Email_Intelligence.ipynb on Google Colab.
2. The training required dataset (Enron and Apache) is available at [Google Drive](https://drive.google.com/file/d/1dhuyFJenfWrqqeXOxjWLqcgALNShpoS6/view?usp=sharing)

Upload the dataset to Google drive and change the pd.read_csv() to your directory in Google Drive (recommanded)

3. Select Runtime as Python 3 and GPU.
4. Run all code cells in order (important) up until the Evaluation section (if you just want to get the model file, don't have to do any evalutaion of the model)

Instructions/explainations of each cell are provided in the ipynb file.

Additional steps may require if you want to use [Google Cloud Bucket](https://cloud.google.com/storage/docs/json_api/v1/buckets)

## Model Serving
1. Install Python 3.6 (It's very important that you have installed the correct version of Python)
2. Install all required libraries

   `pip install tensorflow`
   
   `pip install flask`
   
   `pip install bert-tensorflow`
   
   `pip install pandas`
   
   `pip install scikit-learn`
   
3. have your trained model in the correct folder and change the OUTPUT_DIR in the serving.py to your location

Recommond to download BERT base model to local as well so that you don't have to re-download the model every time it runs.

Download every files in the Google Bucket after the initial training, for example:

checkpoint

graph.pbtxt

model.ckpt-4503.data-00000-of-00001

model.ckpt-4503.index

model.ckpt-4503.meta
   
3. Execute the serving.py
It will start listening on port 5000
## Serving Route:
1. POST to http://localhost:5000/predict

Make prediction

Request body contains json with the following format:

`{
    "raw": "String that you want to classify"
}`

2. POST to http://localhost:5000/train

Incremental training

Request body contains json with the following format: 

`{
    "text":["The phone I was purchasing yesterday on the website got a great discount","Purchasing phones from our website now and you can get a great discount"],
    "spam":[0,1]
}`
