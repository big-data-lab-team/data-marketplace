<h1>Data Market</h1>

<h1>HOW TO: (Make sure you have root or admin access)</h1>
<ul>
  
    The API and the UI are two separate application:
    put datamarket folder, included in the www/ directory, in your machine localhost www web directory
  
  <strong>Run these commands to install npm and node:</strong>
 
    npm install npm@latest -g
    npm install node@latest -g
  
  <strong>You can also Download and install from (If the previous step did not work):</strong>
  
    https://nodejs.org/en/download/current/
    
  <strong>Clone this repository:</strong>
  
    git clone https://github.com/wassimsabra/data-marketplace.git
    cd data-marketplace
    The cloned repo contain the database sql script you will need it in the next step
    
  <strong>Assuming you have MySQL server installed execute the following commands:</strong>
      
      Run this query: 
      source $PATH\datacoin.sql
      NOTE: ($PATH = path of the sql script where the this repo was cloned on your local machine)
      You should be logged in to the mysql server and the command line is ready to process queries(mysql> )
  
  <strong>Database Configuration:</strong>
      
      Database configuration are present in /controllers/mysql.js 
      You can modify it if you want to change the username, password, or database name, 
      according to your MySQL server configuration.

  <strong>Now you should have the source code and the database setup on your machine</strong>
  
  <strong>In the cloned repo on your local machine run:</strong>
  
      npm install (To install all the required dependencies)
      node app.js (To run the actual app)
     
  <strong>The app should be now running on your local host and ready to receive API calls</strong>
  
      All API calls are defined here: https://app.swaggerhub.com/apis/wassimsabra/DATACOIN/1.0.0

</ul>
