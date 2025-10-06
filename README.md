# Mactrons Weatherings 🌦️

[](https://opensource.org/licenses/MIT)
[](https://react.dev/)
[](https://nodejs.org/)

A modern, full-stack weather application providing real-time global weather data, detailed forecasts, and personalized features through a clean, intuitive interface.

## About The Project

**Mactrons Weatherings** is more than just a weather app; it's a complete weather experience. Built with React and Node.js, it offers a fast, responsive, and visually appealing way to get the weather information you need. From dynamic, weather-responsive backgrounds to an AI-powered chatbot, this application is designed for both casual users and weather enthusiasts.

-----

## ✨ Features

  * **Real-Time Weather Data:** Instantly access current temperature, humidity, wind speed, visibility, and weather conditions for any city.
  * **7-Day Forecast:** Plan your week with a detailed 7-day weather forecast.
  * **Today's Highlights:** Get crucial insights at a glance, including **AQI**, **UV Index**, **Wind Speed**, and **Feels Like** temperature.
  * **Global City Search:** Find weather information for any city in the world with a powerful search feature.
  * **User Profiles:** Create an account to save your favorite locations for quick access.
  * **AI Chatbot:** Ask the integrated chatbot for weather information in a conversational way.
  * **Dynamic Backgrounds:** The app's background changes based on the current weather conditions and time of day (day/night).
  * **Fully Responsive:** A seamless experience across desktops, tablets, and mobile devices.

-----

## 🛠️ Tech Stack

This project is built with a modern, full-stack architecture.

### Frontend

  * **React.js**: A JavaScript library for building user interfaces.
  * **React Router**: For client-side navigation.
  * **Lucide-React**: Beautiful and consistent icons.
  * **CSS3**: Advanced styling with custom properties and responsive design.

### Backend

  * **Node.js**: JavaScript runtime for the server.
  * **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
  * **MongoDB**: NoSQL database for storing user data and saved locations.
  * **Dotenv**: For managing environment variables.

### APIs

  * **OpenWeatherMap API**: For fetching real-time weather data and forecasts.

-----

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:

  * [Node.js](https://nodejs.org/) (which includes npm)
  * [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/K-PranavEswar/mactrons-weather.git
    cd mactrons-weather
    ```

2.  **Setup the Backend Server:**

      * Navigate to the server directory:
        ```sh
        cd server
        ```
      * Install server dependencies:
        ```sh
        npm install
        ```
      * Create a `.env` file in the `/server` directory and add your environment variables:
        ```env
        MONGO_URI=your_mongodb_connection_string
        API_KEY=your_openweathermap_api_key
        PORT=5000
        ```
      * Start the backend server:
        ```sh
        node server.js
        ```
        Your backend should now be running on `http://localhost:5000`.

3.  **Setup the Frontend Client:**

      * Open a **new terminal** and navigate to the project's root directory.
      * Install client dependencies:
        ```sh
        npm install
        ```
      * Start the React development server:
        ```sh
        npm start
        ```

4.  **View the Application:**
    Open your browser and navigate to `http://localhost:3000`.

-----

## 🔮 Future Roadmap

  * **Weather Alerts & Notifications:** Implement push notifications for severe weather alerts.
  * **Interactive Maps:** Integrate a map layer to visualize weather patterns.
  * **Historical Weather Data:** Allow users to look up past weather conditions.
  * **Accessibility Improvements:** Enhance the app to be fully accessible (WAI-ARIA).

-----

## 👨‍💻 Author

**Pranav Eswar**

  * **LinkedIn**: [https://www.linkedin.com/in/k-pranav-eswar1/](https://www.linkedin.com/in/k-pranav-eswar1/)
  * **GitHub**: [https://github.com/K-PranavEswar](https://github.com/K-PranavEswar)

-----

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
