<h1>Data Market</h1>

<ul>
  <strong>Requirements</strong>
     
     Root or Admin access
     Node JS installed
     
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

  <strong>Move /datamarket folder from the directory /www/datamarket/ to your public web server directory </strong>
    
        (ex. /var/www/html/ in Ubuntu)
</ul>
