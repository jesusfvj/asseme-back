I have updated the information based on your request. Here's the revised information for the Muze backend application:

# ASSEME - Backend Application

ASSEME's backend application is built with Node.js and MongoDB. It serves as the server-side component for the ASSEME GIF application, handling user authentication, data storage, and API endpoints. Cloudinary is utilized as a service for file storage that can be managed from the backend with Node.js. Nodemailer is used for sending emails, and Multer is employed for handling file uploads.

## Installation and Setup

Before running the ASSEME backend application, make sure you have Node.js and npm (Node Package Manager) installed on your machine. Additionally, you'll need to set up a MongoDB database and obtain Cloudinary API credentials.

1. Clone the repository:

```shell
git clone https://github.com/jesusfvj/asseme-back.git
```

2. Install the dependencies:

```shell
npm install
```

3. Set up environment variables:

   Create a `.env` file in the project's root directory and include the following variables:

   - `PORT`: The port number for the server to listen on.
   - `MONGODB_URL`: The connection URL for your MongoDB database.
   - `PASS`: The password required for Nodemailer.
   - `CLOUD_NAME`: Your Cloudinary cloud name.
   - `API_KEY`: Your Cloudinary API key.
   - `API_SECRET`: Your Cloudinary API secret.
   - `TOKEN_SECRET`: A secret key used for JWT token generation.

   > Remember to fill in the values for these variables and include them in the `.env` file.

4. Start the server:

```shell
npm start
```

The ASSEME backend application is now up and running.

## Cloudinary

Cloudinary is a service for file storage that allows you to easily manage and manipulate media assets such as images and videos. In the context of the ASSEME backend application, Cloudinary is used to handle the upload and download of GIFs and meme files. With the provided Cloudinary API credentials, the ASSEME backend can seamlessly interact with the Cloudinary service to store and retrieve these media assets.

## Nodemailer

Nodemailer is a module for Node.js that enables easy email sending. In the ASSEME backend application, Nodemailer is utilized to send emails for various functionalities. By configuring the email transport and using the provided SMTP credentials (including the PASS variable), Nodemailer facilitates the seamless delivery of emails to users.

## Multer

Multer is a middleware for handling multipart/form-data, which is commonly used for file uploads. In the ASSEME backend application, Multer is employed to handle the uploading of GIF and meme files. It integrates with the Express framework to simplify the process of handling file uploads, ensuring that the uploaded files are properly stored and accessible for further processing.

## Dependencies

ASSEME backend relies on the following dependencies:

| Dependency    | Version   |
| ------------- | --------- |
| bcryptjs      | ^2.4.3    |
| cloudinary    | ^1.37.0   |
| cors          | ^2.8.5    |
| dotenv        | ^16.0.3   |
| express       | ^4.18.2   |
| fs-extra      | ^11.1.1   |
| helmet        | ^7.0.0    |
| jsonwebtoken  | ^9.0.0    |
| mongoose      | ^7.2.0    |
| multer        | ^1.4.5-lts

.1 |
| nodemailer    | ^6.9.2    |
| nodemon       | ^2.0.22   |
| uuidv4        | ^6.2.13   |

Please ensure that you have these dependencies installed to run the ASSEME backend application successfully.

## Contributing

We welcome contributions to the ASSEME backend application! If you find any bugs or have suggestions for improvements, please feel free to open issues or submit pull requests in the [GitHub repository](https://github.com/your-username/asseme-backend).

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

Thank you for using the ASSEME backend application!
