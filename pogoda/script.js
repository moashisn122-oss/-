// Настройки приложения
const apiKey = "9948c1b823285668bcdce9ebb40f7018";
const currentWeather = document.getElementById("current-weather");
const hourlyForecast = document.getElementById("hourly-forecast");
const dailyForecast = document.getElementById("daily-forecast");
const monthlyForecast = document.getElementById("monthly-forecast");
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const geoBtn = document.getElementById("geo-btn");
const suggestions = document.getElementById("suggestions");
const loading = document.getElementById("loading");
const clock = document.getElementById("clock");
const weatherAnimation = document.getElementById("weather-animation");
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeModal = document.getElementById("close-modal");
const themeToggle = document.getElementById("theme-toggle");
const themeButtons = document.querySelectorAll(".theme-btn");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const soundToggle = document.getElementById("sound-toggle");

// Ползунки интенсивности
const cloudIntensity = document.getElementById("cloud-intensity");
const rainIntensity = document.getElementById("rain-intensity");
const snowIntensity = document.getElementById("snow-intensity");
const cloudValue = document.getElementById("cloud-value");
const rainValue = document.getElementById("rain-value");
const snowValue = document.getElementById("snow-value");

// Звуки погоды
const rainSound = document.getElementById("rain-sound");
const thunderSound = document.getElementById("thunder-sound");
const windSound = document.getElementById("wind-sound");
const snowSound = document.getElementById("snow-sound");

// Текущие настройки
let currentTheme = localStorage.getItem("theme") || "dark";
let isDarkMode = currentTheme === "dark" || currentTheme === "ocean";
let currentTimezone = 0;
let currentWeatherCondition = "";
let currentCity = "";
let isSoundEnabled = localStorage.getItem("sound-enabled") === "false" ? false : true;

// Настройки интенсивности
let animationSettings = {
    clouds: parseInt(localStorage.getItem("cloud-intensity")) || 5,
    rain: parseInt(localStorage.getItem("rain-intensity")) || 5,
    snow: parseInt(localStorage.getItem("snow-intensity")) || 5
};

// Устанавливаем значения ползунков
cloudIntensity.value = animationSettings.clouds;
rainIntensity.value = animationSettings.rain;
snowIntensity.value = animationSettings.snow;
cloudValue.textContent = animationSettings.clouds;
rainValue.textContent = animationSettings.rain;
snowValue.textContent = animationSettings.snow;

// Устанавливаем тему при загрузке
document.documentElement.setAttribute("data-theme", currentTheme);
themeToggle.checked = isDarkMode;
soundToggle.checked = isSoundEnabled;

// Устанавливаем активный класс для кнопок тем
themeButtons.forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.theme === currentTheme) {
        btn.classList.add("active");
    }
});

// Функция для транслитерации
function transliterate(text) {
    const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        ' ': '-'
    };
    return text.toLowerCase().split('').map(char => translitMap[char] || char).join('');
}

// Функция для отображения времени в часовом поясе города
function updateClock(timezoneOffset) {
    const now = new Date();
    const localTime = new Date(now.getTime() + (timezoneOffset * 1000));

    const hours = String(localTime.getUTCHours()).padStart(2, '0');
    const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(localTime.getUTCSeconds()).padStart(2, '0');

    clock.textContent = `🕒 ${hours}:${minutes}:${seconds}`;
}

// Обновляем время каждую секунду
let clockInterval;
function startClock(timezoneOffset) {
    if (clockInterval) clearInterval(clockInterval);
    updateClock(timezoneOffset);
    clockInterval = setInterval(() => updateClock(timezoneOffset), 1000);
}

// Функция для отображения загрузки
function showLoading() {
    currentWeather.innerHTML = '<div class="loading"></div>';
    hourlyForecast.innerHTML = '';
    dailyForecast.innerHTML = '';
    monthlyForecast.innerHTML = '';
}

// Функция для отображения текущей погоды
function displayCurrentWeather(data) {
    const { name } = data;
    const { temp, feels_like, humidity, pressure } = data.main;
    const { description, icon } = data.weather[0];
    const { speed, deg } = data.wind;
    const { sunrise, sunset } = data.sys;
    const timezone = data.timezone || 0;

    currentTimezone = timezone;
    currentCity = name;
    currentWeatherCondition = description;

    const sunriseTime = new Date((sunrise + timezone) * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date((sunset + timezone) * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const windDirection = getWindDirection(deg);

    currentWeather.innerHTML = `
        <div class="city-name">${name}</div>
        <div class="weather-main">
            <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
            <div class="temperature">${Math.round(temp)}°C</div>
        </div>
        <div class="description">${description}</div>
        <div class="details">
            <div class="detail">
                <div class="detail-label"><i class="fas fa-thermometer-half"></i> Ощущается</div>
                <div class="detail-value">${Math.round(feels_like)}°C</div>
            </div>
            <div class="detail">
                <div class="detail-label"><i class="fas fa-tint"></i> Влажность</div>
                <div class="detail-value">${humidity}%</div>
            </div>
            <div class="detail">
                <div class="detail-label"><i class="fas fa-wind"></i> Ветер</div>
                <div class="detail-value">${speed} м/с<br><small>${windDirection}</small></div>
            </div>
            <div class="detail">
                <div class="detail-label"><i class="fas fa-gauge-high"></i> Давление</div>
                <div class="detail-value">${Math.round(pressure * 0.75)} мм</div>
            </div>
            <div class="detail">
                <div class="detail-label"><i class="fas fa-sun"></i> Восход</div>
                <div class="detail-value">${sunriseTime}</div>
            </div>
            <div class="detail">
                <div class="detail-label"><i class="fas fa-moon"></i> Закат</div>
                <div class="detail-value">${sunsetTime}</div>
            </div>
        </div>
    `;

    // Обновляем анимацию погоды
    updateWeatherAnimation(description);

    // Обновляем звуки погоды
    updateWeatherSounds(description);

    // Запускаем часы
    startClock(timezone);
}

// Функция для обновления анимации погоды
function updateWeatherAnimation(weatherCondition) {
    weatherAnimation.innerHTML = '';

    if (weatherCondition.includes("дождь") || weatherCondition.includes("rain")) {
        createRain(animationSettings.rain);
    } else if (weatherCondition.includes("снег") || weatherCondition.includes("snow")) {
        createSnow(animationSettings.snow);
    } else if (weatherCondition.includes("облачн") || weatherCondition.includes("cloud")) {
        createClouds(animationSettings.clouds);
    } else if (weatherCondition.includes("ясно") || weatherCondition.includes("clear")) {
        createSun();
    } else if (weatherCondition.includes("гроза") || weatherCondition.includes("thunderstorm")) {
        createClouds(animationSettings.clouds);
        createLightning();
    } else if (weatherCondition.includes("ветер") || weatherCondition.includes("wind")) {
        createClouds(animationSettings.clouds);
        createWindEffect(animationSettings.clouds / 2);
    }
}

// Функция для обновления звуков погоды
function updateWeatherSounds(weatherCondition) {
    if (!isSoundEnabled) {
        rainSound.pause();
        thunderSound.pause();
        windSound.pause();
        snowSound.pause();
        return;
    }

    rainSound.pause();
    thunderSound.pause();
    windSound.pause();
    snowSound.pause();

    if (weatherCondition.includes("дождь") || weatherCondition.includes("rain")) {
        rainSound.volume = 0.3;
        rainSound.play();
    } else if (weatherCondition.includes("гроза") || weatherCondition.includes("thunderstorm")) {
        thunderSound.volume = 0.2;
        thunderSound.play();
    } else if (weatherCondition.includes("ветер") || weatherCondition.includes("wind")) {
        windSound.volume = 0.2;
        windSound.play();
    } else if (weatherCondition.includes("снег") || weatherCondition.includes("snow")) {
        snowSound.volume = 0.2;
        snowSound.play();
    }
}

// Функция для создания облаков
function createClouds(intensity) {
    const count = Math.floor(intensity * 2);
    for (let i = 0; i < count; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        const size = Math.random() * 60 + 40;
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size / 2}px`;
        cloud.style.top = `${Math.random() * 60 + 10}vh`;
        cloud.style.left = `${Math.random() * 100}vw`;
        cloud.style.animationDuration = `${Math.random() * 20 + 20}s`;
        cloud.style.animationDelay = `${Math.random() * 10}s`;
        cloud.style.opacity = Math.random() * 0.3 + 0.5;
        weatherAnimation.appendChild(cloud);
    }
}

// Функция для создания дождя
function createRain(intensity) {
    const count = Math.floor(intensity * 4);
    for (let i = 0; i < count; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 100}vw`;
        drop.style.top = `${Math.random() * -100}px`;
        drop.style.animationDuration = `${Math.random() * 0.5 + 0.3}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.height = `${Math.random() * 15 + 10}px`;
        drop.style.opacity = Math.random() * 0.5 + 0.3;
        weatherAnimation.appendChild(drop);
    }
}

// Функция для создания снега
function createSnow(intensity) {
    const count = Math.floor(intensity * 3);
    for (let i = 0; i < count; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.innerHTML = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
        flake.style.left = `${Math.random() * 100}vw`;
        flake.style.top = `${Math.random() * -100}px`;
        flake.style.animationDuration = `${Math.random() * 3 + 2}s`;
        flake.style.animationDelay = `${Math.random() * 3}s`;
        flake.style.fontSize = `${Math.random() * 12 + 8}px`;
        flake.style.opacity = Math.random() * 0.5 + 0.5;
        weatherAnimation.appendChild(flake);
    }
}

// Функция для создания солнца
function createSun() {
    const sunContainer = document.createElement('div');
    sunContainer.style.position = 'absolute';
    sunContainer.style.top = '20vh';
    sunContainer.style.left = 'calc(50vw - 30px)';

    const sun = document.createElement('div');
    sun.className = 'sun';
    sunContainer.appendChild(sun);

    const rays = document.createElement('div');
    rays.className = 'sun-ray';
    sun.appendChild(rays);

    weatherAnimation.appendChild(sunContainer);
}

// Функция для создания молнии
function createLightning() {
    const lightning = document.createElement('div');
    lightning.className = 'lightning';
    lightning.style.left = `${Math.random() * 100}vw`;
    lightning.style.animationDuration = `${Math.random() * 0.5 + 0.2}s`;
    lightning.style.animationDelay = `${Math.random() * 2}s`;
    weatherAnimation.appendChild(lightning);

    // Добавляем вспышку экрана
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = 'rgba(255, 255, 255, 0.1)';
    flash.style.zIndex = '1000';
    flash.style.pointerEvents = 'none';
    flash.style.animation = 'flash 0.3s ease-out';
    document.body.appendChild(flash);

    setTimeout(() => {
        flash.remove();
    }, 300);
}

// Добавляем анимацию вспышки
const style = document.createElement('style');
style.textContent = `
    @keyframes flash {
        0% { opacity: 0.5; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Функция для создания эффекта ветра
function createWindEffect(intensity) {
    const count = Math.floor(intensity);
    for (let i = 0; i < count; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        const size = Math.random() * 40 + 20;
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size / 2}px`;
        cloud.style.top = `${Math.random() * 40 + 20}vh`;
        cloud.style.left = `${Math.random() * 100}vw`;
        cloud.style.animationDuration = `${Math.random() * 10 + 5}s`;
        cloud.style.animationDelay = `${Math.random() * 2}s`;
        cloud.style.opacity = Math.random() * 0.4 + 0.3;
        cloud.style.filter = 'blur(2px)';
        weatherAnimation.appendChild(cloud);
    }
}

// Функция для отображения прогноза по часам
function displayHourlyForecast(hourlyData, timezoneOffset) {
    hourlyForecast.innerHTML = '';

    const now = new Date();
    const localTime = new Date(now.getTime() + (timezoneOffset * 1000));
    const today = localTime.getDate();

    const todayForecast = hourlyData.filter(item => {
        const date = new Date(item.dt * 1000 + (timezoneOffset * 1000));
        return date.getDate() === today;
    });

    todayForecast.sort((a, b) => a.dt - b.dt);

    todayForecast.forEach(item => {
        const date = new Date(item.dt * 1000 + (timezoneOffset * 1000));
        const hour = date.getHours();
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        const description = item.weather[0].description;

        const hourCard = document.createElement('div');
        hourCard.className = 'hour-card';
        hourCard.innerHTML = `
            <div class="hour-time">${hour}:00</div>
            <img class="hour-icon" src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
            <div class="hour-temp">${temp}°C</div>
        `;
        hourlyForecast.appendChild(hourCard);
    });
}

// Функция для отображения прогноза на неделю
function displayDailyForecast(dailyData, timezoneOffset) {
    dailyForecast.innerHTML = '';

    dailyData.forEach(item => {
        const date = new Date(item.dt * 1000 + (timezoneOffset * 1000));
        const day = date.toLocaleDateString('ru-RU', { weekday: 'short' });
        const dayMonth = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        const tempMin = Math.round(item.main.temp_min);
        const tempMax = Math.round(item.main.temp_max);
        const icon = item.weather[0].icon;
        const description = item.weather[0].description;

        const dailyCard = document.createElement('div');
        dailyCard.className = 'daily-card';
        dailyCard.innerHTML = `
            <div class="daily-date">${day}, ${dayMonth}</div>
            <img class="daily-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
            <div class="daily-temp">
                <span class="daily-temp-max">${tempMax}°C</span>
                <span class="daily-temp-min">${tempMin}°C</span>
            </div>
        `;
        dailyForecast.appendChild(dailyCard);
    });
}

// Функция для отображения прогноза на месяц
function displayMonthlyForecast(forecastData, timezoneOffset) {
    monthlyForecast.innerHTML = '';

    // Группируем данные по дням (берем только дневные прогнозы)
    const dailyForecasts = [];
    for (let i = 0; i < forecastData.length; i += 8) {
        dailyForecasts.push(forecastData[i]);
    }

    // Берем первые 30 дней
    const monthlyData = dailyForecasts.slice(0, 30);

    monthlyData.forEach(item => {
        const date = new Date(item.dt * 1000 + (timezoneOffset * 1000));
        const day = date.getDate();
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        const description = item.weather[0].description;

        const monthlyCard = document.createElement('div');
        monthlyCard.className = 'monthly-card';
        monthlyCard.innerHTML = `
            <div class="monthly-date">${day}</div>
            <img class="monthly-icon" src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
            <div class="monthly-temp">${temp}°C</div>
        `;
        monthlyForecast.appendChild(monthlyCard);
    });
}

// Функция для определения направления ветра
function getWindDirection(deg) {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
}

// Функция для отображения ошибки
function showError(message) {
    currentWeather.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
    hourlyForecast.innerHTML = '';
    dailyForecast.innerHTML = '';
    monthlyForecast.innerHTML = '';
}

// Функция для поиска городов
async function searchCities(query) {
    if (!query.trim()) {
        suggestions.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
        );
        const data = await response.json();
        displaySuggestions(data);
    } catch (error) {
        console.error("Ошибка при поиске городов:", error);
    }
}

// Функция для отображения подсказок
function displaySuggestions(cities) {
    if (cities.length === 0) {
        suggestions.style.display = 'none';
        return;
    }

    suggestions.innerHTML = '';
    cities.forEach(city => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = `${city.name}, ${city.country}`;
        item.addEventListener('click', () => {
            cityInput.value = city.name;
            suggestions.style.display = 'none';
            getWeather(city.name, city.lat, city.lon);
        });
        suggestions.appendChild(item);
    });
    suggestions.style.display = 'block';
}

// Функция для получения погоды и прогноза
async function getWeather(city, lat = null, lon = null) {
    showLoading();

    try {
        let currentData, forecastData, timezoneOffset = 0;

        if (lat && lon) {
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ru`
            );
            currentData = await currentResponse.json();

            if (currentResponse.ok) {
                timezoneOffset = currentData.timezone || 0;

                const forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ru`
                );
                forecastData = await forecastResponse.json();
            } else {
                showError("Не удалось получить погоду для этого города.");
                return;
            }
        } else {
            const normalizedCity = city.toLowerCase().trim();
            if (cityCoordinates[normalizedCity]) {
                const { lat: cityLat, lon: cityLon } = cityCoordinates[normalizedCity];
                await getWeather(city, cityLat, cityLon);
                return;
            }

            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`
            );
            currentData = await currentResponse.json();

            if (currentResponse.ok) {
                timezoneOffset = currentData.timezone || 0;

                const forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=ru`
                );
                forecastData = await forecastResponse.json();
            } else {
                showError("Город не найден. Попробуйте другой.");
                return;
            }
        }

        displayCurrentWeather(currentData);

        if (forecastData && forecastData.list) {
            displayHourlyForecast(forecastData.list, timezoneOffset);
            displayDailyForecast(forecastData.list, timezoneOffset);
            displayMonthlyForecast(forecastData.list, timezoneOffset);
        }

    } catch (error) {
        showError("Произошла ошибка. Попробуйте позже.");
        console.error(error);
    }
}

// Словари для известных городов
const cityCoordinates = {
    "ишим": { lat: 56.1167, lon: 69.5, name: "Ишим" },
    "москва": { lat: 55.7558, lon: 37.6173, name: "Москва" },
    "санкт-петербург": { lat: 59.9343, lon: 30.3351, name: "Санкт-Петербург" },
    "екaтеринбург": { lat: 56.8519, lon: 60.6122, name: "Екатеринбург" },
    "новосибирск": { lat: 55.0084, lon: 82.9357, name: "Новосибирск" },
    "казань": { lat: 55.7955, lon: 49.1064, name: "Казань" },
    "нижний новгород": { lat: 56.3269, lon: 44.0075, name: "Нижний Новгород" },
    "челябинск": { lat: 55.1644, lon: 61.4368, name: "Челябинск" },
    "омск": { lat: 54.9924, lon: 73.3686, name: "Омск" },
    "самара": { lat: 53.2000, lon: 50.1500, name: "Самара" },
    "ростов-на-дону": { lat: 47.2225, lon: 39.7206, name: "Ростов-на-Дону" },
    "уфа": { lat: 54.7351, lon: 55.9587, name: "Уфа" },
    "красноярск": { lat: 56.0184, lon: 92.8672, name: "Красноярск" },
    "воронеж": { lat: 51.6608, lon: 39.2003, name: "Воронеж" },
    "пермь": { lat: 58.0105, lon: 56.2294, name: "Пермь" },
    "волгоград": { lat: 48.7080, lon: 44.5133, name: "Волгоград" },
};

// Обработчики событий для поиска
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
        suggestions.style.display = 'none';
    } else {
        showError("Пожалуйста, введите название города.");
    }
});

geoBtn.addEventListener("click", getUserLocation);

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
            suggestions.style.display = 'none';
        } else {
            showError("Пожалуйста, введите название города.");
        }
    }
});

cityInput.addEventListener("input", () => {
    const query = cityInput.value.trim();
    if (query.length > 2) {
        searchCities(query);
    } else {
        suggestions.style.display = 'none';
    }
});

// Скрываем подсказки при клике вне поля ввода
document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
        suggestions.style.display = 'none';
    }
});

// Обработчики для вкладок
tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(`${btn.dataset.tab}-forecast`).classList.add("active");
    });
});

// Обработчики для модального окна настроек
settingsBtn.addEventListener("click", () => {
    settingsModal.style.display = "flex";
});

closeModal.addEventListener("click", () => {
    settingsModal.style.display = "none";
});

// Закрытие модального окна при клике вне его
settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = "none";
    }
});

// Переключение темы (темная/светлая)
themeToggle.addEventListener("change", () => {
    isDarkMode = themeToggle.checked;
    if (isDarkMode) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
    }
    updateThemeButtons();
});

// Выбор темы
themeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        themeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentTheme = btn.dataset.theme;
        document.documentElement.setAttribute("data-theme", currentTheme);
        localStorage.setItem("theme", currentTheme);
        isDarkMode = currentTheme === "dark" || currentTheme === "ocean";
        themeToggle.checked = isDarkMode;
    });
});

// Функция для обновления активных кнопок тем
function updateThemeButtons() {
    themeButtons.forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.theme === currentTheme) {
            btn.classList.add("active");
        }
    });
}

// Обработчики для ползунков интенсивности
cloudIntensity.addEventListener("input", () => {
    animationSettings.clouds = parseInt(cloudIntensity.value);
    cloudValue.textContent = animationSettings.clouds;
    localStorage.setItem("cloud-intensity", animationSettings.clouds);
    updateWeatherAnimation(currentWeatherCondition);
});

rainIntensity.addEventListener("input", () => {
    animationSettings.rain = parseInt(rainIntensity.value);
    rainValue.textContent = animationSettings.rain;
    localStorage.setItem("rain-intensity", animationSettings.rain);
    updateWeatherAnimation(currentWeatherCondition);
});

snowIntensity.addEventListener("input", () => {
    animationSettings.snow = parseInt(snowIntensity.value);
    snowValue.textContent = animationSettings.snow;
    localStorage.setItem("snow-intensity", animationSettings.snow);
    updateWeatherAnimation(currentWeatherCondition);
});

// Переключение звука
soundToggle.addEventListener("change", () => {
    isSoundEnabled = soundToggle.checked;
    localStorage.setItem("sound-enabled", isSoundEnabled);
    updateWeatherSounds(currentWeatherCondition);
});

// Функция для получения геолокации
function getUserLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeather(null, latitude, longitude);
            },
            (error) => {
                console.error("Ошибка геолокации:", error);
                showError("Не удалось определить ваше местоположение. Попробуйте ввести город вручную.");
            }
        );
    } else {
        showError("Геолокация не поддерживается вашим браузером.");
    }
}

// Автоматически загружаем погоду для Ишима при открытии страницы
// (Но теперь это отключено, так как сначала показываем экран приветствия)