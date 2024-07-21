Hello, this is happyCloud! where your files are safe 


	## https://github.com/S4kit/HappyCloud

 
To use this application follow my instructions.

**Suggested Requirements**


PHP >= 8.2
Laravel >= 11.X
NPM & Node.js



**Installing depandencies**


I- Laravel Installlation

1. go to the folder (cd HappyCloud)
2. go to the backend folder (called happycloud)
3. write compose install
4. create your own .env ( cp .env.example .env )
5. php artisan key:generate
6. clear any cache view config for safe & no problem deploy 
php artisan cache:clear
php artisan view:clear
php artisan config:clear
7. php artisan migrate (migrate the database)
8. php artisan db:seed (allows you to create the admin user which creds[ test_user:abcabc ]
9. php artisan serv to start the server (make sure it goes on localhost:8000)

II- React Installation

1. go to the frontend folder (called frontend)
2. install dependencies: npm install (incase problems use --legacy-peer-deps parameter)
3. npm start

III- Get into the application using localhost:3000/login
