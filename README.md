# CodeInsightAPI

CodeInsight is the ultimate destination for code execution and analysis. Tailored for developers, this platform provides comprehensive support across various programming languages. With an intuitive interface and powerful features, users can execute code swiftly while scrutinizing its performance. CodeInsight enables users to uncover optimization prospects and enhancements effortlessly, offering a seamless experience where coding meets insight.

## Architecture

[![Architecture](https://imgur.com/5aCEC8e.png)](https://imgur.com/5aCEC8e.png)

## Requirements
- Redis
- PostgreSQL
- NodeJS

## Installation Guide

This section provides detailed instructions on how to set up and build the project for both development and production environments.

### Initial Setup

Before building the application for either development or production, follow these steps and make sure you have all requirements installed:

1. **Clone the Repository**: First, clone the repository to your local machine using Git:

   ```bash
   git clone https://github.com/kaldimitrov/CodeInsightAPI.git
   cd CodeInsightAPI
   ```

2. **Install Dependencies**: Once inside the project directory, install the necessary dependencies:

   ```bash
   npm install
   ```

3. **Setup Environment**: Once you've installed all the dependencies copy the example environment file and fill in your information:

    **Example** `.env` **file**:
    ```env
    APP_PORT=3000
    JWT_SECRET=JWT_SECRET
    REFRESH_TOKEN_SECRET=REFRESH_TOKEN_SECRET
    JWT_EXPIRATION=12h
    
    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USER=DB_USER
    DATABASE_PASSWORD=DB_PASSWORD
    DATABASE_NAME=DB_NAME
    
    REDIS_HOST=localhost
    REDIS_PORT=6379
    ```
4. **Run Migrations**: Once you have all of the environments, edit the `ormconfig.ts` with your database credentials. After doing that you can run the database migrations, which will create your database schema:

   ```bash
   npm run migration:up
   ```

### Development Mode

To get started with development mode, follow these steps:

1. **Start the Development Server**: After the dependencies are installed, start the development server:

   ```bash
    npm run start:dev
   ```

2. **Access the App**: The development server will start, with the default port 3000. Open your web browser and navigate to http://localhost:3000/documentation to see the list of all available endpoints. During development mode, any changes you make to the source code will automatically be reflected in the browser, thanks to NestJS’s hot module replacement.

### Building for Production

When you’re ready to build your app for production, follow these steps:

1. **Build the App**: First, build the app for production using the following command:

   ```bash
   npm run build
   ```

   This command will optimize your app for the best performance: the build is minified, and the filenames include hashes for efficient caching.

2. **Serve the App**: After the build is complete, you will be provided with a javascript file, which you can use to server the application through a proxy like nginx.

## License

This project is licensed under the MIT License. This implies that you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, given that you include the original copyright notice and the permission notice in all copies or substantial portions of the software. For more information, please see the [LICENSE](LICENSE) file in our project repository or visit the Open Source Initiative website.
