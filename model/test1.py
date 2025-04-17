import requests

url = "http://127.0.0.1:8000/predict"
headers = {"Content-Type": "application/json"}
data = {"text": "The accused threatened the victim with a knife and stole valuables."}

response = requests.post(url, json=data, headers=headers)

print("Response Status Code:", response.status_code)
print("Response JSON:", response.json())
