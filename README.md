# Mission Climat - Lysed - Server  

## Setup  

Create a `.env` file located at the root.    
Create a `gcredentials.json` at the root. You can generate your own from the google console in order to get the
google spreadsheet API ready, or ask the owner to send you the credentials.  

### Environment variables:  

AGGREGATOR_API_TOKEN = (ask an admin for the token)    
PORT = 4000 (you can change it)  
MONGODB_URI = mongodb://localhost:27017/your-db-name  
FRONTEND_URI = http://localhost:3000 (3000 or any other port your frontend is running on)  
FRONTEND_URL_SECURE = http://localhost:3000 (3000 or any other port your frontend is running on)  
SPREADSHEET_MASTER_ID = (ask an admin for the spreadsheet id) 
SECRET_SESSION = b4e610a38bb44e66ef61dbf42673aeba (can be any random string)  
GOOGLE_APPLICATION_CREDENTIALS = gcredentials.json   


## Scripts

`npm run dev` => to get the server running in dev mode.



## Deployment

(WIP)