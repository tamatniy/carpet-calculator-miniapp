// Telegram Mini App - Калькулятор ковров
// Основная логика приложения

class CarpetCalculator {
    constructor() {
        this.currentStep = 'main';
        this.data = {
            package: null,
            pile: null,
            length: null,
            width: null,
            odorRemoval: false,
            orderNumber: ''
        };
        
        this.prices = {
            standard: {
                short: 10,
                long: 11
            },
            premium: {
                short: 13,
                long: 15
            }
        };
        
        this.odorRemovalPrice = 25;
        
        this.init();
    }
    
    init() {
        // Инициализация Telegram Web App
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
            
            // Настройка темы
            this.setupTheme();
            
            // Проверяем, открыто ли приложение в Telegram
            if (window.Telegram.WebApp.initData) {
                // Приложение открыто в Telegram
                document.getElementById('telegram-open-btn').style.display = 'none';
            } else {
                // Приложение открыто в браузере, показываем кнопку
                document.getElementById('telegram-open-btn').style.display = 'block';
            }
        } else {
            // Telegram Web App не доступен
            document.getElementById('telegram-open-btn').style.display = 'block';
        }
        
        this.bindEvents();
        this.showScreen('main');
    }
    
    setupTheme() {
        const theme = window.Telegram.WebApp.colorScheme;
        if (theme === 'dark') {
            document.documentElement.style.setProperty('--bg-primary', '#1e1e1e');
            document.documentElement.style.setProperty('--bg-secondary', '#2d2d2d');
            document.documentElement.style.setProperty('--text-primary', '#ffffff');
            document.documentElement.style.setProperty('--text-secondary', '#a0a0a0');
            document.documentElement.style.setProperty('--border-color', '#404040');
        }
    }
    
    bindEvents() {
        // Главный экран
        document.getElementById('start-btn').addEventListener('click', () => {
            this.showScreen('package');
        });
        
        // Выбор пакета
        document.querySelectorAll('[data-package]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const packageType = e.currentTarget.dataset.package;
                console.log('Package selected:', packageType);
                this.selectPackage(packageType);
            });
        });
        
        // Выбор типа ворса
        document.querySelectorAll('[data-pile]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const pileType = e.currentTarget.dataset.pile;
                console.log('Pile selected:', pileType);
                this.selectPile(pileType);
            });
        });
        
        // Ввод размеров
        document.getElementById('length').addEventListener('input', () => {
            this.updateDimensions();
        });
        
        document.getElementById('width').addEventListener('input', () => {
            this.updateDimensions();
        });
        
        // Дополнительная услуга
        document.getElementById('odor-removal').addEventListener('change', (e) => {
            this.data.odorRemoval = e.target.checked;
        });
        
        // Номер заказа
        document.getElementById('order-number').addEventListener('input', (e) => {
            this.data.orderNumber = e.target.value;
        });
        
        // Кнопки навигации
        document.getElementById('back-to-main').addEventListener('click', () => {
            this.showScreen('main');
        });
        
        document.getElementById('back-to-package').addEventListener('click', () => {
            this.showScreen('package');
        });
        
        document.getElementById('back-to-pile').addEventListener('click', () => {
            this.showScreen('pile');
        });
        
        document.getElementById('back-to-dimensions').addEventListener('click', () => {
            this.showScreen('dimensions');
        });
        
        document.getElementById('back-to-extra').addEventListener('click', () => {
            this.showScreen('extra');
        });
        
        // Кнопки "Далее"
        document.getElementById('next-to-extra').addEventListener('click', () => {
            if (this.validateDimensions()) {
                this.showScreen('extra');
            }
        });
        
        document.getElementById('next-to-order').addEventListener('click', () => {
            this.showScreen('order');
        });
        
        // Расчёт
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculate();
        });
        
        // Результат
        document.getElementById('new-calculation').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('share-result').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Share button event triggered');
            this.shareResult();
        });
    }
    
    showScreen(screenName) {
        // Скрыть все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показать нужный экран
        document.getElementById(`${screenName}-screen`).classList.add('active');
        this.currentStep = screenName;
        
        // Обновить цены в зависимости от выбранного пакета
        if (screenName === 'pile' && this.data.package) {
            this.updatePrices();
        }
    }
    
    selectPackage(packageType) {
        console.log('selectPackage called with:', packageType);
        this.data.package = packageType;
        
        // Убрать выделение с других кнопок
        document.querySelectorAll('[data-package]').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Выделить выбранную кнопку
        const selectedBtn = document.querySelector(`[data-package="${packageType}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
            console.log('Package button selected:', packageType);
        } else {
            console.error('Package button not found:', packageType);
        }
        
        // Перейти к следующему шагу сразу
        console.log('Switching to pile screen');
        this.showScreen('pile');
    }
    
    selectPile(pileType) {
        console.log('selectPile called with:', pileType);
        this.data.pile = pileType;
        
        // Убрать выделение с других кнопок
        document.querySelectorAll('[data-pile]').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Выделить выбранную кнопку
        const selectedBtn = document.querySelector(`[data-pile="${pileType}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
            console.log('Pile button selected:', pileType);
        } else {
            console.error('Pile button not found:', pileType);
        }
        
        // Перейти к следующему шагу сразу
        console.log('Switching to dimensions screen');
        this.showScreen('dimensions');
    }
    
    updatePrices() {
        const shortPrice = this.prices[this.data.package].short;
        const longPrice = this.prices[this.data.package].long;
        
        document.getElementById('short-price').textContent = `${shortPrice} руб/м²`;
        document.getElementById('long-price').textContent = `${longPrice} руб/м²`;
    }
    
    updateDimensions() {
        const length = parseFloat(document.getElementById('length').value) || 0;
        const width = parseFloat(document.getElementById('width').value) || 0;
        
        this.data.length = length;
        this.data.width = width;
        
        if (length > 0 && width > 0) {
            const area = length * width;
            document.getElementById('area-value').textContent = area.toFixed(1);
            document.getElementById('area-display').style.display = 'block';
            
            // Активировать кнопку "Далее"
            document.getElementById('next-to-extra').disabled = false;
        } else {
            document.getElementById('area-display').style.display = 'none';
            document.getElementById('next-to-extra').disabled = true;
        }
    }
    
    validateDimensions() {
        const length = this.data.length;
        const width = this.data.width;
        
        if (!length || !width || length <= 0 || width <= 0) {
            this.showError('Пожалуйста, введите корректные размеры ковра');
            return false;
        }
        
        if (length > 50 || width > 50) {
            this.showError('Размеры ковра не могут превышать 50 метров');
            return false;
        }
        
        return true;
    }
    
    calculate() {
        // Проверяем все необходимые данные
        if (!this.data.package || !this.data.pile) {
            this.showError('Пожалуйста, выберите пакет услуг и тип ворса');
            return;
        }
        
        if (!this.validateDimensions()) {
            return;
        }
        
        const area = this.data.length * this.data.width;
        const pricePerSquareMeter = this.prices[this.data.package][this.data.pile];
        let totalPrice = area * pricePerSquareMeter;
        
        if (this.data.odorRemoval) {
            totalPrice += this.odorRemovalPrice;
        }
        
        // Обновить результат
        this.updateResult(area, totalPrice);
        
        // Показать экран результата
        this.showScreen('result');
    }
    
    updateResult(area, totalPrice) {
        document.getElementById('result-order').textContent = this.data.orderNumber || 'Не указан';
        
        const packageNames = {
            standard: 'Стандартный',
            premium: 'Премиум'
        };
        document.getElementById('result-package').textContent = packageNames[this.data.package];
        
        const pileNames = {
            short: 'Короткий',
            long: 'Длинный'
        };
        document.getElementById('result-pile').textContent = pileNames[this.data.pile];
        
        document.getElementById('result-area').textContent = `${area.toFixed(1)} м²`;
        
        document.getElementById('result-extra').textContent = this.data.odorRemoval ? 'Удаление запаха — да' : 'Нет';
        
        document.getElementById('result-total').textContent = `${Math.round(totalPrice)} рублей`;
    }
    
    shareResult() {
        console.log('Share button clicked');
        
        const area = this.data.length * this.data.width;
        const pricePerSquareMeter = this.prices[this.data.package][this.data.pile];
        let totalPrice = area * pricePerSquareMeter;
        
        if (this.data.odorRemoval) {
            totalPrice += this.odorRemovalPrice;
        }
        
        const packageNames = {
            standard: 'Стандартный',
            premium: 'Премиум'
        };
        
        const pileNames = {
            short: 'Короткий',
            long: 'Длинный'
        };
        
        const shareText = `🧩 Расчёт стоимости чистки ковра

Номер заказа: ${this.data.orderNumber || 'Не указан'}
Пакет услуг: ${packageNames[this.data.package]}
Тип ворса: ${pileNames[this.data.pile]}
Площадь: ${area.toFixed(1)} м²
Доп.услуга: ${this.data.odorRemoval ? 'Удаление запаха — да' : 'Нет'}
Итоговая стоимость: ${Math.round(totalPrice)} рублей

Рассчитано в Telegram Mini App "Калькулятор ковров"`;

        console.log('Share text:', shareText);

        if (window.Telegram && window.Telegram.WebApp) {
            console.log('Telegram WebApp available');
            try {
                // Попробуем отправить данные
                window.Telegram.WebApp.sendData(JSON.stringify({
                    type: 'calculation_result',
                    data: {
                        orderNumber: this.data.orderNumber,
                        package: packageNames[this.data.package],
                        pile: pileNames[this.data.pile],
                        area: area.toFixed(1),
                        odorRemoval: this.data.odorRemoval,
                        totalPrice: Math.round(totalPrice)
                    }
                }));
                console.log('Data sent successfully');
                this.showMessage('Результат отправлен в чат!');
            } catch (error) {
                console.error('Ошибка отправки:', error);
                this.fallbackShare(shareText);
            }
        } else {
            console.log('Telegram WebApp not available, using fallback');
            this.fallbackShare(shareText);
        }
    }
    
    fallbackShare(shareText) {
        console.log('Using fallback share method');
        // Fallback для браузера
        if (navigator.share) {
            console.log('Using navigator.share');
            navigator.share({
                title: 'Расчёт стоимости чистки ковра',
                text: shareText
            }).then(() => {
                console.log('Share successful');
                this.showMessage('Результат поделен!');
            }).catch((error) => {
                console.error('Share failed:', error);
                this.copyToClipboard(shareText);
            });
        } else {
            console.log('Navigator.share not available, copying to clipboard');
            this.copyToClipboard(shareText);
        }
    }
    
    copyToClipboard(text) {
        console.log('Copying to clipboard');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Clipboard write successful');
                this.showMessage('Результат скопирован в буфер обмена!');
            }).catch((error) => {
                console.error('Clipboard write failed:', error);
                this.legacyCopyToClipboard(text);
            });
        } else {
            console.log('Modern clipboard API not available, using legacy method');
            this.legacyCopyToClipboard(text);
        }
    }
    
    legacyCopyToClipboard(text) {
        console.log('Using legacy copy method');
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                console.log('Legacy copy successful');
                this.showMessage('Результат скопирован в буфер обмена!');
            } else {
                console.log('Legacy copy failed');
                this.showMessage('Не удалось скопировать результат. Попробуйте выделить текст вручную.');
            }
        } catch (error) {
            console.error('Legacy copy error:', error);
            this.showMessage('Ошибка при копировании. Попробуйте выделить текст вручную.');
        }
    }
    
    reset() {
        this.data = {
            package: null,
            pile: null,
            length: null,
            width: null,
            odorRemoval: false,
            orderNumber: ''
        };
        
        // Сбросить форму
        document.getElementById('length').value = '';
        document.getElementById('width').value = '';
        document.getElementById('odor-removal').checked = false;
        document.getElementById('order-number').value = '';
        document.getElementById('area-display').style.display = 'none';
        document.getElementById('next-to-extra').disabled = true;
        
        // Убрать выделение с кнопок
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        this.showScreen('main');
    }
    
    showError(message) {
        // Простое уведомление об ошибке
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.showAlert(message);
        } else {
            alert(message);
        }
    }
    
    showMessage(message) {
        // Простое уведомление
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.showAlert(message);
        } else {
            alert(message);
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new CarpetCalculator();
});

// Глобальная функция для открытия Mini App
function openMiniApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        // Если открыто в Telegram, просто скрываем кнопку
        document.getElementById('telegram-open-btn').style.display = 'none';
    } else {
        // Если открыто в браузере, показываем инструкцию
        alert('Для полной функциональности откройте это приложение через Telegram бота:\n\n1. Найдите вашего бота в Telegram\n2. Отправьте команду /start\n3. Нажмите на кнопку "Калькулятор ковров"');
    }
}

// Обработка ошибок
window.addEventListener('error', (e) => {
    console.error('Ошибка приложения:', e.error);
});

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', (e) => {
    console.error('Необработанная ошибка промиса:', e.reason);
});
