// Глобальные переменные
let amount = '100';
let fromCurrency = 'USD';
let toCurrency = 'KGS';
let result = null;
let rate = null;
let loading = false;
let conversionTimeout = null;

// Список валют
const currencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
    { code: 'KGS', name: 'Kyrgyz Som', flag: '🇰🇬' },
    { code: 'KZT', name: 'Kazakhstan Tenge', flag: '🇰🇿' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' }
];

// Элементы DOM
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const swapBtn = document.getElementById('swapBtn');
const convertBtn = document.getElementById('convertBtn');
const errorMessage = document.getElementById('errorMessage');
const resultContainer = document.getElementById('resultContainer');
const fromFlag = document.getElementById('fromFlag');
const toFlag = document.getElementById('toFlag');
const resultFromFlag = document.getElementById('resultFromFlag');
const resultToFlag = document.getElementById('resultToFlag');
const resultFromAmount = document.getElementById('resultFromAmount');
const resultToAmount = document.getElementById('resultToAmount');
const rateContainer = document.getElementById('rateContainer');
const rateValue = document.getElementById('rateValue');

// Инициализация
function init() {
    // Заполняем select элементы
    populateSelects();
    
    // Устанавливаем обработчики событий
    amountInput.addEventListener('input', handleAmountChange);
    fromCurrencySelect.addEventListener('change', handleFromCurrencyChange);
    toCurrencySelect.addEventListener('change', handleToCurrencyChange);
    swapBtn.addEventListener('click', swapCurrencies);
    convertBtn.addEventListener('click', convertCurrency);
    
    // Обновляем флаги
    updateFlags();
}

// Заполняем select элементы валютами
function populateSelects() {
    currencies.forEach(currency => {
        const optionFrom = document.createElement('option');
        optionFrom.value = currency.code;
        optionFrom.textContent = `${currency.code} - ${currency.name}`;
        fromCurrencySelect.appendChild(optionFrom);
        
        const optionTo = document.createElement('option');
        optionTo.value = currency.code;
        optionTo.textContent = `${currency.code} - ${currency.name}`;
        toCurrencySelect.appendChild(optionTo);
    });
    
    // Устанавливаем начальные значения
    fromCurrencySelect.value = fromCurrency;
    toCurrencySelect.value = toCurrency;
}

// Получение флага валюты
function getCurrencyFlag(code) {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.flag : '💱';
}

// Обновление флагов
function updateFlags() {
    fromFlag.textContent = getCurrencyFlag(fromCurrency);
    toFlag.textContent = getCurrencyFlag(toCurrency);
    resultFromFlag.textContent = getCurrencyFlag(fromCurrency);
    resultToFlag.textContent = getCurrencyFlag(toCurrency);
}

// Обработчик изменения суммы
function handleAmountChange(e) {
    amount = e.target.value;
    
    // Автоматическая конвертация с задержкой
    if (conversionTimeout) {
        clearTimeout(conversionTimeout);
    }
    
    if (amount && parseFloat(amount) > 0) {
        conversionTimeout = setTimeout(() => {
            convertCurrency();
        }, 500);
    }
}

// Обработчик изменения исходной валюты
function handleFromCurrencyChange(e) {
    fromCurrency = e.target.value;
    updateFlags();
    
    if (amount && parseFloat(amount) > 0) {
        if (conversionTimeout) {
            clearTimeout(conversionTimeout);
        }
        conversionTimeout = setTimeout(() => {
            convertCurrency();
        }, 500);
    }
}

// Обработчик изменения целевой валюты
function handleToCurrencyChange(e) {
    toCurrency = e.target.value;
    updateFlags();
    
    if (amount && parseFloat(amount) > 0) {
        if (conversionTimeout) {
            clearTimeout(conversionTimeout);
        }
        conversionTimeout = setTimeout(() => {
            convertCurrency();
        }, 500);
    }
}

// Обмен валют местами
function swapCurrencies() {
    const temp = fromCurrency;
    fromCurrency = toCurrency;
    toCurrency = temp;
    
    fromCurrencySelect.value = fromCurrency;
    toCurrencySelect.value = toCurrency;
    
    updateFlags();
    hideResult();
    hideError();
}

// Показать ошибку
function showError(message) {
    errorMessage.textContent = `⚠️ ${message}`;
    errorMessage.classList.remove('hidden');
}

// Скрыть ошибку
function hideError() {
    errorMessage.classList.add('hidden');
}

// Показать результат
function showResult() {
    resultContainer.classList.remove('hidden');
}

// Скрыть результат
function hideResult() {
    resultContainer.classList.add('hidden');
}

// Установить состояние загрузки
function setLoading(isLoading) {
    loading = isLoading;
    
    if (isLoading) {
        convertBtn.disabled = true;
        convertBtn.classList.add('loading');
        convertBtn.innerHTML = `
            <svg class="loading-icon" style="width: 1.25rem; height: 1.25rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Загрузка...
        `;
    } else {
        convertBtn.disabled = false;
        convertBtn.classList.remove('loading');
        convertBtn.textContent = 'Конвертировать';
    }
}

// Форматирование числа
function formatNumber(num) {
    return parseFloat(num).toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Конвертация валют
async function convertCurrency() {
    // Проверка суммы
    if (!amount || parseFloat(amount) <= 0) {
        showError('Введите корректную сумму');
        hideResult();
        return;
    }
    
    setLoading(true);
    hideError();
    
    try {
        // Запрос к API
        const response = await fetch(
            `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
        );
        
        if (!response.ok) {
            throw new Error('Ошибка сети');
        }
        
        const data = await response.json();
        
        // Проверка наличия валюты
        if (!data.rates[toCurrency]) {
            throw new Error('Валюта не найдена');
        }
        
        // Получаем курс
        const exchangeRate = data.rates[toCurrency];
        rate = exchangeRate;
        
        // Конвертируем
        const convertedAmount = (parseFloat(amount) * exchangeRate).toFixed(2);
        result = convertedAmount;
        
        // Отображаем результат
        displayResult();
        
    } catch (err) {
        console.error('Ошибка:', err);
        showError('Не удалось получить курс валют. Попробуйте снова.');
        hideResult();
    } finally {
        setLoading(false);
    }
}

// Отображение результата
function displayResult() {
    if (!result) return;
    
    // Обновляем флаги
    resultFromFlag.textContent = getCurrencyFlag(fromCurrency);
    resultToFlag.textContent = getCurrencyFlag(toCurrency);
    
    // Обновляем суммы
    resultFromAmount.textContent = `${formatNumber(amount)} ${fromCurrency}`;
    resultToAmount.textContent = `${formatNumber(result)} ${toCurrency}`;
    
    // Обновляем курс
    if (rate) {
        rateValue.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
        rateContainer.classList.remove('hidden');
    }
    
    // Показываем результат
    showResult();
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);