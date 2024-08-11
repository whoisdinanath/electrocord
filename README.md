# Electrocord

Electrocord is a dynamic, real-time communication platform designed to facilitate seamless interaction and resource sharing among students. This project was developed to fulfill the course objectives of the Database Management System by a team of three members from the Department of Electronics and Computer Engineering, Thapathali Campus, IOE, Nepal.

## Team Members

- [Dinanath Padhya](https://github.com/whoisdinanath)
- [Jenish Pant](https://github.com/monoastro)
- [Krishna Acharya](https://github.com/diodehub)

## Project Overview

Electrocord is a comprehensive communication platform featuring user management, channel management, resource sharing, and real-time chat functionalities. It is built with a robust backend using Node.js and Express.js, a dynamic frontend using ReactJs and NextJs, and PostgreSQL for database management.

## Key Features

### User Management
Electrocord provides a robust user management system, allowing users to:
- Register
- Log in
- Customize profiles

### Channel Management
Admins can create, delete, and manage channels dedicated to specific topics or interests, promoting organized discussions and content sharing.

### Resource Sharing
Electrocord supports the sharing of various resources, including files and links, making it an ideal platform for collaboration and information exchange.

### Real-Time Communication
With real-time chat capabilities, users/students can communicate instantly, enhancing the flow of conversations and interactions.

### Database Management
Electrocord incorporates database management concepts, offering a practical learning experience for users interested in database administration and operations.

## Prerequisites

- Node.js installed on your machine
- A modern web browser

## Installation

Follow these steps to set up Electrocord on your local machine:

1. Clone the repository to your local machine:
    ```bash
    git clone https://github.com/whoisdinanath/Electrocord.git
    ```

2. Create a PostgreSQL database and run the SQL queries provided in the `models/completeDatabase.sql` file to set up the required tables and data.

3. Create a `.env` file in the root directory of the project and add the environment variables listed in the `.env.example` file.

4. Install the project dependencies:
    ```bash
    npm install
    ```

5. Start the server:
    ```bash
    npm start
    ```

## Usage

After successfully starting the server, open your preferred web browser and go to `http://localhost:5000` or the port you set in `.env`. From here, you can register a new account or log in with an existing one to explore all the features Electrocord has to offer.
All the API endpoints are available at respective routes, and you can access them using tools like Postman or Insomnia.


## Issues Encountered

- **No ORM Allowed**: The project required us to use raw SQL queries instead of an ORM, which made the database operations more complex and time-consuming.
- **Real-Time Communication**: Implementing real-time chat functionality using WebSockets was challenging due to the need for efficient message handling and synchronization.
- **User Authentication**: Ensuring secure user authentication and session management was crucial to protect user data and privacy.
- **Short Timeframe**: Developing a feature-rich communication platform within a limited timeframe required careful planning and prioritization of tasks.

## Contributing

We welcome contributions to Electrocord! If you have suggestions for improvements or encounter any issues, please feel free to open an issue or submit a pull request.

## License

Electrocord is released under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code as per the license conditions.


## Acknowledgments

- Thanks to all the team members and contributors who have helped in building and refining Electrocord.
- Special thanks to the open-source community for providing the tools and libraries that make projects like this possible.

Enjoy using Electrocord, and happy communicating!

## Additional Information

### Project Architecture

Electrocord is designed with a modular architecture to ensure scalability and maintainability. Below is an overview of the major components:

- **Backend**: Built with Node.js and Express.js, it handles API requests, authentication, and real-time communication using WebSockets.
- **Frontend**: Developed with ReactJs and NextJs, it provides a responsive and intuitive user interface.
- **Database**: PostgreSQL is used to manage user data, channel information, and chat messages, ensuring data integrity and efficient retrieval.

### Future Enhancements

We plan to add the following features to enhance the functionality of Electrocord:
- **Push Notifications**: Real-time notifications for new messages and channel updates.
- **Video and Voice Chat**: Integrate WebRTC for seamless video and voice communication.
- **Advanced Search**: Implement full-text search to improve the discoverability of messages and resources.
- **Mobile Application**: Develop a mobile version of Electrocord using React Native for better accessibility on the go.

For detailed information on the project and its development, please visit the project repositories:
- [Electrocord Backend](https://github.com/whoisdinanath/electrocord.git)
- [Electrocord Frontend](https://github.com/monoastro/sia.git)

The project is live at:
- [Electrocord Backend](https://electrocord.onrender.com)
- [Electrocord Frontend](https://sia-electrocord.vercel.app)

By continuously improving Electrocord, we aim to create a powerful platform that enhances student collaboration and communication.
