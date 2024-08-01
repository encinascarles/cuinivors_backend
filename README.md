# Cuinivors Backend

Welcome to Cuinivors Backend! This project serves as the backend for a recipe sharing app, originally created for what is now TiberiFamiliar. Although it has been deprecated in favor of using Next.js server actions, it remains a valuable learning experience, especially in the realm of unit testing.

## Overview

Cuinivors Backend is built using Express and MongoDB, providing robust backend support for a recipe sharing application. The project includes comprehensive unit tests written with Mocha to ensure code reliability and maintainability.

## Features

- **Express**: Utilized to build a fast and scalable server-side application.
- **MongoDB**: Employed for efficient and flexible data storage.
- **Mocha**: Used for unit testing to ensure code correctness.
- **Learning Experience**: Provided a deep dive into backend development and unit testing.

## Getting Started

To get a local copy of the project up and running, follow these simple steps.

### Prerequisites

- Node.js (v14 or above)
- npm or yarn
- MongoDB (local or remote instance)

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/cuinivors_backend.git
    ```
2. Navigate to the project directory:
    ```sh
    cd cuinivors_backend
    ```
3. Install dependencies:
    ```sh
    npm install
    ```
    or
    ```sh
    yarn install
    ```

### Setting Up MongoDB

Ensure you have a MongoDB instance running. You can use a local instance or a cloud-based service like MongoDB Atlas. Update the MongoDB connection string in your environment variables.

Create a `.env` file in the project root and add your MongoDB connection string:
```sh
MONGODB_URI=your_mongodb_connection_string
```

### Running the Application

To start the development server, run:
```sh
npm start
```
or
```sh
yarn start
```

The server will start on [http://localhost:3000](http://localhost:3000).

### Running Tests

To run unit tests using Mocha, execute:
```sh
npm test
```
or
```sh
yarn test
```

## Learnings

This project was primarily built as a learning exercise. Here are some of the key areas I focused on:

- **Express**: Gaining hands-on experience with building server-side applications using Express.
- **MongoDB**: Understanding how to interact with MongoDB for data storage and retrieval.
- **Unit Testing with Mocha**: Learning the importance and implementation of unit tests to ensure code reliability.
- **Backend Development**: Improving skills in structuring and organizing a backend project for scalability and maintainability.

## Contributing

Since this project is deprecated, contributions are not expected. However, if you have suggestions or improvements, feel free to open an issue or submit a pull request.
