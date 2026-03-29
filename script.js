// ===== AUTH MANAGER INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o gerenciador de autenticação
    if (typeof AuthManager !== 'undefined') {
        window.authManager = new AuthManager();
    }
    
    // ✅ CORREÇÃO: Colocar o monitoramento DENTRO do DOMContentLoaded
    if (window.authManager) {
        // Sobrescrever o método handleSignOut para limpar os dados
        const originalHandleSignOut = window.authManager.handleSignOut;
        window.authManager.handleSignOut = function() {
            originalHandleSignOut.call(this);
            clearUserData();
        };
        
        // Verificar periodicamente o estado de autenticação
        setInterval(() => {
            if (window.authManager && !window.authManager.user && (Object.keys(carrinho).length > 0 || Object.keys(favoritos).length > 0)) {
                clearUserData();
            }
        }, 1000);
    }
    
    initAuthSync(); // ✅ Isso está correto
    
    // Inicializar sistema de créditos
    initCreditsSystem();
});

// ===== FUNÇÕES DE SINCRONIZAÇÃO =====
function initAuthSync() {
    // Usar BroadcastChannel se disponível para sincronização em tempo real
    if (typeof BroadcastChannel !== 'undefined') {
        try {
            const authChannel = new BroadcastChannel('auth_channel');
            
            authChannel.onmessage = (event) => {
                if (event.data.type === 'USER_CONFIRMED') {
                    console.log('Usuário confirmado em outra aba:', event.data.email);
                    
                    // Recarregar dados de autenticação
                    if (window.authManager) {
                        window.authManager.checkSession();
                    }
                    
                    // Mostrar notificação
                    showNotification(`Email ${event.data.email} confirmado com sucesso!`);
                }
            };
        } catch (e) {
            console.log('BroadcastChannel não suportado, usando fallback');
        }
    }
    
    // Verificar periodicamente se o email foi confirmado em outro dispositivo
    setInterval(() => {
        const emailConfirmed = localStorage.getItem('emailConfirmed');
        const userEmail = localStorage.getItem('userEmail');
        
        if (emailConfirmed === 'true' && userEmail) {
            console.log('Email confirmado em outro dispositivo:', userEmail);
            
            // Recarregar auth manager
            if (window.authManager) {
                window.authManager.checkSession();
            }
            
            // Limpar o flag após processamento
            localStorage.removeItem('emailConfirmed');
            localStorage.removeItem('userEmail');
            
            showNotification(`Email ${userEmail} confirmado com sucesso!`);
        }
    }, 2000);
}

// Função para limpar dados quando o usuário faz logout
function clearUserData() {
    carrinho = {};
    favoritos = {};
    updateCounters();
    renderCart();
    renderWishlist();
}

// ===== DATA AND INITIALIZATION =====
const produtos = {
    racao1: { nome: "Premium Dog Food", preco: 129.99, tipo: "food", img: "img/racao/racao1.jpg" },
    racao2: { nome: "Premium Cat Food", preco: 89.90, tipo: "food", img: "img/racao/racao3.jpg" },
    racao3: { nome: "Puppy Growth Food", preco: 99.99, tipo: "food", img: "img/racao/racao2.jpg" },
    racao4: { nome: "Light Diet Food", preco: 139.99, tipo: "food", img: "img/racao/racao4.jpg" },
    racao5: { nome: "Junior Bone Food", preco: 99.99, tipo: "food", img: "img/racao/racao5.jpg" },
    racao6: { nome: "Junior Vitality Food", preco: 99.99, tipo: "food", img: "img/racao/racao6.jpg" },
    roupa1: { nome: "Sport Set", preco: 79.99, tipo: "clothing", img: "img/roupas/cachorro-roupa.jpg" },
    roupa2: { nome: "Padded Jacket", preco: 89.99, tipo: "clothing", img: "img/roupas/fantasia.jpg" },
    roupa3: { nome: "Fun Costume", preco: 65.00, tipo: "clothing", img: "img/roupas/img-cat.jpg" }
};

// Conteúdos do site para a busca
const conteudosSite = {
    // Seções e páginas
    sections: [
        { id: "saude-pet", nome: "Pet Health", tipo: "section", descricao: "Health plans and veterinarian care" },
        { id: "moda-pet", nome: "Pet Fashion", tipo: "section", descricao: "Clothing and accessories for your pet" },
        { id: "nutricao-pet", nome: "Nutrition", tipo: "section", descricao: "Quality food and nutrition" },
        { id: "Trivia", nome: "Trivia", tipo: "section", descricao: "Interesting facts about pets" },
        { id: "services", nome: "Services", tipo: "section", descricao: "Bath, grooming and veterinarian consultation" }
    ],
    
    // Offered services
    services: [
        { id: "banho", nome: "Complete Bath", tipo: "service", descricao: "Hygienic bath and professional drying" },
        { id: "tosa", nome: "Premium Grooming", tipo: "service", descricao: "Machine grooming and personalized styling" },
        { id: "consulta", nome: "Veterinary Consultation", tipo: "service", descricao: "Complete check-up and vaccination" }
    ],
    
    // Health plans
    plans: [
        { id: "plan-basico", nome: "Basic Plan", tipo: "plan", descricao: "Monthly consultation and yearly vaccination", preco: "R$ 99,90/month" },
        { id: "plan-essencial", nome: "Essential Plan", tipo: "plan", descricao: "Laboratory tests included", preco: "R$ 179,90/month" },
        { id: "plan-premium", nome: "Premium Plan", tipo: "plan", descricao: "Free monthly bath and grooming", preco: "R$ 299,90/month" }
    ],
    
    // Trivia
    Trivia: [
        { id: "trivia1", nome: "Canine Hearing", tipo: "trivia", descricao: "Dogs hear sounds 4 times farther than humans" },
        { id: "trivia2", nome: "Feline Jump", tipo: "trivia", descricao: "Cats can jump up to 6 times their body height" },
        { id: "trivia3", nome: "Canine Sense of Smell", tipo: "trivia", descricao: "Dogs have a sense of smell 10,000 times stronger" }
    ]
};

// Categories for search suggestions
const categorias = {
    alimento: "Food",
    clothing: "Clothing & Accessories",
    service: "Services",
    plan: "Health Plans",
    trivia: "Trivia"
};

let carrinho = {};
let favoritos = {};
let currentSlide = 0;
let carouselInterval;

// ===== SISTEMA DE CRÉDITOS LUCKPET =====
let userCredits = 0;
let appliedCredits = 0;

// Inicializar créditos do usuário
function initCreditsSystem() {
    // Verificar se o usuário está logado
    if (window.authManager && window.authManager.user) {
        loadUserCredits();
        
        // Verificar se é um novo usuário (primeiro acesso)
        const isNewUser = localStorage.getItem('isNewUser');
        if (isNewUser === 'true') {
            showWelcomeCredits();
            localStorage.removeItem('isNewUser');
        }
    }
}

// Carregar créditos do usuário
function loadUserCredits() {
    // Simulando carregamento de créditos (em um sistema real, viria do backend)
    const savedCredits = localStorage.getItem('userCredits');
    
    if (savedCredits) {
        userCredits = parseInt(savedCredits);
    } else {
        // Novo usuário - definir créditos iniciais (alterado de 100 para 50)
        userCredits = 50;
        localStorage.setItem('userCredits', userCredits);
        localStorage.setItem('isNewUser', 'true');
    }
    
    updateCreditsDisplay();
}

// Atualizar exibição de créditos
function updateCreditsDisplay() {
    const creditsElement = document.getElementById('userCredits');
    const cartCreditsElement = document.getElementById('cartCreditsBalance');
    
    if (creditsElement) {
        creditsElement.textContent = userCredits;
    }
    
    if (cartCreditsElement) {
        cartCreditsElement.textContent = userCredits;
    }
}

// Mostrar boas-vindas com créditos
function showWelcomeCredits() {
    const welcomeSection = document.getElementById('welcome-credits');
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
        
        // Rolar suavemente para a seção
        setTimeout(() => {
            welcomeSection.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    }
}

// Fechar mensagem de boas-vindas
function closeWelcome() {
    const welcomeSection = document.getElementById('welcome-credits');
    if (welcomeSection) {
        welcomeSection.style.display = 'none';
    }
}

// Adicionar créditos ao usuário
function addCredits(amount) {
    userCredits += amount;
    localStorage.setItem('userCredits', userCredits);
    updateCreditsDisplay();
    showNotification(`+${amount} LuckCoins adicionados à sua conta!`);
}

// Remover créditos do usuário
function deductCredits(amount) {
    if (userCredits >= amount) {
        userCredits -= amount;
        localStorage.setItem('userCredits', userCredits);
        updateCreditsDisplay();
        return true;
    }
    return false;
}

// Verificar se o usuário tem créditos suficientes
function hasEnoughCredits(amount) {
    return userCredits >= amount;
}

// Aplicar créditos no carrinho
function applyCreditsToCart(amount) {
    const total = calculateCartTotal();
    const maxApplicable = Math.min(userCredits, total);
    
    if (amount > maxApplicable) {
        amount = maxApplicable;
    }
    
    appliedCredits = amount;
    updateCartCreditsDisplay();
    
    return amount;
}

// Atualizar exibição de créditos no carrinho
function updateCartCreditsDisplay() {
    const creditsInput = document.getElementById('useCredits');
    const creditsDiscount = document.getElementById('creditsDiscount');
    const finalTotal = document.getElementById('finalTotal');
    const creditsApplication = document.getElementById('creditsApplication');
    const setMaxCredits = document.getElementById('setMaxCredits');
    
    if (!creditsInput || !creditsDiscount || !finalTotal) return;
    
    const total = calculateCartTotal();
    const maxApplicable = Math.min(userCredits, total);
    
    // Atualizar o valor máximo do input
    creditsInput.max = maxApplicable;
    
    // Atualizar o botão de máximo
    if (setMaxCredits) {
        setMaxCredits.onclick = function() {
            creditsInput.value = maxApplicable;
            applyCreditsToCart(maxApplicable);
            updateCartCreditsDisplay();
        };
    }
    
    // Atualizar desconto e total final
    creditsDiscount.textContent = `R$ ${appliedCredits.toFixed(2)}`;
    finalTotal.textContent = `Total com desconto: R$ ${(total - appliedCredits).toFixed(2)}`;
    
    // Mostrar/ocultar seção de créditos conforme necessário
    if (creditsApplication) {
        if (userCredits > 0 && total > 0) {
            creditsApplication.style.display = 'block';
        } else {
            creditsApplication.style.display = 'none';
        }
    }
}

// Configurar eventos para aplicação de créditos
function setupCreditsEvents() {
    const creditsInput = document.getElementById('useCredits');
    if (!creditsInput) return;
    
    creditsInput.addEventListener('input', function() {
        const amount = parseInt(this.value) || 0;
        applyCreditsToCart(amount);
    });
    
    creditsInput.addEventListener('change', function() {
        const amount = parseInt(this.value) || 0;
        applyCreditsToCart(amount);
    });
}

// ===== VERIFICAÇÃO DE LOGIN PARA FAVORITOS E CARRINHO =====
function checkAuthBeforeAction(actionType, callback) {
    if (window.authManager && window.authManager.user) {
        // Usuário está logado, executar a ação
        if (typeof callback === 'function') {
            callback();
        }
    } else {
        // Usuário não está logado, mostrar alerta e redirecionar
        showLoginAlert(actionType);
    }
}

function showLoginAlert(actionType) {
    // Remover alertas existentes
    const existingAlert = document.querySelector('.login-alert-overlay');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Criar elemento de alerta estilizado
    const alertOverlay = document.createElement('div');
    alertOverlay.className = 'login-alert-overlay';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'login-alert-box';
    
    alertBox.innerHTML = `
        <div class="login-alert-icon">
            <i class="fas fa-exclamation-circle"></i>
        </div>
        <h3>Acesso Restrito</h3>
        <p>Você precisa estar logado para usar essa função. Crie sua conta grátis e aproveite todos os benefícios!</p>
        <div class="login-alert-buttons">
            <button class="btn-secondary" id="loginAlertCancel">Cancelar</button>
            <a href="formulario/login.html" class="btn-primary">Fazer Login</a>
        </div>
    `;
    
    alertOverlay.appendChild(alertBox);
    document.body.appendChild(alertOverlay);
    
    // Adicionar estilos dinamicamente se não existirem
    if (!document.querySelector('#loginAlertStyles')) {
        const styles = document.createElement('style');
        styles.id = 'loginAlertStyles';
        styles.textContent = `
            .login-alert-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                padding: 20px;
            }
            
            .login-alert-box {
                background: white;
                border-radius: 16px;
                padding: 30px;
                text-align: center;
                max-width: 400px;
                width: 100%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                animation: alertFadeIn 0.3s ease;
            }
            
            @keyframes alertFadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            .login-alert-icon {
                font-size: 48px;
                color: #ff9800;
                margin-bottom: 15px;
            }
            
            .login-alert-box h3 {
                margin: 0 0 15px 0;
                color: #2c3e50;
                font-size: 22px;
            }
            
            .login-alert-box p {
                color: #7f8c8d;
                margin-bottom: 25px;
                line-height: 1.5;
            }
            
            .login-alert-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
            }
            
            .login-alert-buttons .btn-secondary {
                background: #6c757d;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 600;
            }
            
            .login-alert-buttons .btn-primary {
                background: var(--primary);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                text-decoration: none;
                font-weight: 600;
            }
            
            @media (max-width: 480px) {
                .login-alert-buttons {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Configurar evento para o botão Cancelar
    const cancelBtn = document.getElementById('loginAlertCancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            alertOverlay.remove();
        });
    }
    
    // Fechar o alerta ao clicar fora da caixa
    alertOverlay.addEventListener('click', function(e) {
        if (e.target === alertOverlay) {
            alertOverlay.remove();
        }
    });
    
    // Fechar com a tecla ESC
    const closeOnEsc = function(e) {
        if (e.key === 'Escape') {
            alertOverlay.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    
    document.addEventListener('keydown', closeOnEsc);
}

// ===== SISTEMA DE PESQUISA =====
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchInput || !searchBtn || !searchSuggestions) return;
    
    // Função para mostrar sugestões
    function showSuggestions() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm.length === 0) {
            searchSuggestions.classList.remove('active');
            return;
        }
        
        // Buscar produtos
        const productResults = Object.entries(produtos).filter(([id, product]) => {
            return product.nome.toLowerCase().includes(searchTerm) || 
                   product.tipo.toLowerCase().includes(searchTerm);
        });
        
        // Buscar seções do site
        const sectionResults = conteudosSite.sections.filter(section => {
            return section.nome.toLowerCase().includes(searchTerm) || 
                   section.descricao.toLowerCase().includes(searchTerm);
        });
        
        // Buscar serviços
        const serviceResults = conteudosSite.services.filter(service => {
            return service.nome.toLowerCase().includes(searchTerm) || 
                   service.descricao.toLowerCase().includes(searchTerm);
        });
        
        // Buscar plans
        const planResults = conteudosSite.plans.filter(plan => {
            return plan.nome.toLowerCase().includes(searchTerm) || 
                   plan.descricao.toLowerCase().includes(searchTerm);
        });
        
        // Buscar Trivia
        const curiosityResults = conteudosSite.Trivia.filter(curiosity => {
            return curiosity.nome.toLowerCase().includes(searchTerm) || 
                   curiosity.descricao.toLowerCase().includes(searchTerm);
        });
        
        // Combinar todos os resultados
        const allResults = [
            ...sectionResults.map(item => ({ ...item, categoria: 'section' })),
            ...serviceResults.map(item => ({ ...item, categoria: 'service' })),
            ...planResults.map(item => ({ ...item, categoria: 'plan' })),
            ...curiosityResults.map(item => ({ ...item, categoria: 'trivia' })),
            ...productResults.map(([id, product]) => ({ 
                id, 
                nome: product.nome, 
                tipo: product.tipo, 
                descricao: product.descricao, 
                preco: `R$ ${product.preco.toFixed(2)}`,
                categoria: 'produto'
            }))
        ];
        
        if (allResults.length === 0) {
            searchSuggestions.innerHTML = '<div class="search-suggestion">Nenhum resultado encontrado</div>';
            searchSuggestions.classList.add('active');
            return;
        }
        
        // Agrupar resultados por categoria
        const groupedResults = {};
        allResults.forEach(result => {
            if (!groupedResults[result.categoria]) {
                groupedResults[result.categoria] = [];
            }
            groupedResults[result.categoria].push(result);
        });
        
        // Limitar a 3 resultados por categoria
        Object.keys(groupedResults).forEach(key => {
            groupedResults[key] = groupedResults[key].slice(0, 3);
        });
        
        let html = '';
        
        // Site sections
        if (groupedResults['section'] && groupedResults['section'].length > 0) {
            html += '<div class="search-category-title">Site Sections</div>';
            groupedResults['section'].forEach(item => {
                html += `
                    <div class="search-suggestion" data-section="${item.id}">
                        <div><i class="fas fa-folder"></i> ${item.nome}</div>
                        <small>${item.descricao}</small>
                    </div>
                `;
            });
        }
        
        // Services
        if (groupedResults['service'] && groupedResults['service'].length > 0) {
            html += '<div class="search-category-title">Services</div>';
            groupedResults['service'].forEach(item => {
                html += `
                    <div class="search-suggestion" data-service="${item.id}">
                        <div><i class="fas fa-concierce-bell"></i> ${item.nome}</div>
                        <small>${item.descricao}</small>
                    </div>
                `;
            });
        }
        
        // Health plans
        if (groupedResults['plan'] && groupedResults['plan'].length > 0) {
            html += '<div class="search-category-title">Health Plans</div>';
            groupedResults['plan'].forEach(item => {
                html += `
                    <div class="search-suggestion" data-plan="${item.id}">
                        <div><i class="fas fa-heartbeat"></i> ${item.nome}</div>
                        <small>${item.descricao} - ${item.preco}</small>
                    </div>
                `;
            });
        }
        
        // Trivia
        if (groupedResults['trivia'] && groupedResults['trivia'].length > 0) {
            html += '<div class="search-category-title">Trivia</div>';
            groupedResults['trivia'].forEach(item => {
                html += `
                    <div class="search-suggestion" data-trivia="${item.id}">
                        <div><i class="fas fa-lightbulb"></i> ${item.nome}</div>
                        <small>${item.descricao}</small>
                    </div>
                `;
            });
        }
        
        // Produtos
        if (groupedResults['produto'] && groupedResults['produto'].length > 0) {
            html += '<div class="search-category-title">Produtos</div>';
            groupedResults['produto'].forEach(item => {
                html += `
                    <div class="search-suggestion" data-product="${item.id}">
                        <div><i class="fas fa-shopping-bag"></i> ${item.nome}</div>
                        <small>${item.preco} • ${categorias[item.tipo] || item.tipo}</small>
                    </div>
                `;
            });
        }
        
        searchSuggestions.innerHTML = html;
        searchSuggestions.classList.add('active');
        
        // Adicionar eventos de clique nas sugestões
        document.querySelectorAll('.search-suggestion[data-product]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                const productId = this.getAttribute('data-product');
                if (productId && produtos[productId]) {
                    searchInput.value = produtos[productId].nome;
                    searchSuggestions.classList.remove('active');
                    
                    // Scroll para a seção de produtos
                    scrollParasection('nutricao-pet');
                    
                    // Destacar o produto após um pequeno delay
                    setTimeout(() => {
                        highlightProduct(productId);
                    }, 800);
                }
            });
        });
        
        // Adicionar eventos para seções
        document.querySelectorAll('.search-suggestion[data-section]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                searchInput.value = this.querySelector('div').textContent;
                searchSuggestions.classList.remove('active');
                scrollParasection(sectionId);
            });
        });
        
        // Adicionar eventos para serviços
        document.querySelectorAll('.search-suggestion[data-service]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                const serviceId = this.getAttribute('data-service');
                searchInput.value = this.querySelector('div').textContent;
                searchSuggestions.classList.remove('active');
                
                // Abrir modal de agendamento
                document.getElementById('serviceType').value = serviceId;
                document.getElementById('bookingModal').classList.add('active');
            });
        });
        
        // Adicionar eventos para plans
        document.querySelectorAll('.search-suggestion[data-plan]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                searchInput.value = this.querySelector('div').textContent;
                searchSuggestions.classList.remove('active');
                scrollParasection('saude-pet');
            });
        });
        
        // Adicionar eventos para Trivia
        document.querySelectorAll('.search-suggestion[data-trivia]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                searchInput.value = this.querySelector('div').textContent;
                searchSuggestions.classList.remove('active');
                scrollParasection('Trivia');
            });
        });
    }
    
    // Função para scroll suave até uma seção
    function scrollParasection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Função para destacar um produto
    function highlightProduct(productId) {
        const productElement = document.querySelector(`[data-product="${productId}"]`);
        if (productElement) {
            // Encontrar o card pai do produto
            const productCard = productElement.closest('.product-card');
            if (productCard) {
                productCard.classList.add('highlight-product');
                
                // Scroll para o produto
                productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Remover o destaque após 3 segundos
                setTimeout(() => {
                    productCard.classList.remove('highlight-product');
                }, 3000);
            }
        }
    }
    
    // Event listeners
    searchInput.addEventListener('input', showSuggestions);
    
    searchInput.addEventListener('focus', function() {
        if (this.value.length > 0) {
            showSuggestions();
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.classList.remove('active');
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    searchBtn.addEventListener('click', performSearch);
    
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm.length < 1) {
            showNotification('Digite algo para pesquisar', true);
            return;
        }
        
        // Buscar em todos os conteúdos
        const allResults = [
            ...conteudosSite.sections,
            ...conteudosSite.services,
            ...conteudosSite.plans,
            ...conteudosSite.Trivia,
            ...Object.entries(produtos).map(([id, product]) => ({ 
                id,
                nome: product.nome, 
                tipo: product.tipo, 
                descricao: product.descricao,
                categoria: 'produto'
            }))
        ];
        
        const results = allResults.filter(item => {
            return item.nome.toLowerCase().includes(searchTerm) || 
                   (item.descricao && item.descricao.toLowerCase().includes(searchTerm)) ||
                   item.tipo.toLowerCase().includes(searchTerm);
        });
        
        if (results.length === 0) {
            showNotification('Nenhum resultado encontrado para: ' + searchTerm, true);
            return;
        }
        
        showNotification(`Encontrados ${results.length} resultados para: ${searchTerm}`);
        searchSuggestions.classList.remove('active');
        
        // Encontrar o melhor resultado para navegação
        let bestMatch = null;
        
        // Priorizar produtos primeiro
        const productResults = results.filter(result => result.categoria === 'produto');
        if (productResults.length > 0) {
            bestMatch = productResults[0];
        } 
        // Depois seções
        else {
            const sectionResults = results.filter(result => 
                result.id && document.getElementById(result.id)
            );
            if (sectionResults.length > 0) {
                bestMatch = sectionResults[0];
            }
            // Se não encontrar nada específico, ir para a seção de produtos
            else {
                bestMatch = { id: 'nutricao-pet' };
            }
        }
        
        // Navegar para o melhor resultado
        if (bestMatch.id) {
            // Se for um produto, mostrar na seção de produtos
            if (bestMatch.categoria === 'produto') {
                scrollParasection('nutricao-pet');
                
                // Destacar o produto após um pequeno delay
                setTimeout(() => {
                    highlightProduct(bestMatch.id);
                }, 800);
            } 
            // Se for uma seção, serviço, plan ou trivia
            else {
                scrollParasection(bestMatch.id);
                
                // Se for um serviço, abrir o modal de agendamento
                if (bestMatch.tipo === 'service') {
                    setTimeout(() => {
                        document.getElementById('serviceType').value = bestMatch.id;
                        document.getElementById('bookingModal').classList.add('active');
                    }, 1000);
                }
            }
        }
    }
}

// ===== INITIALIZATION FUNCTIONS =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carrinho e favoritos do localStorage APENAS se o usuário estiver logado
    try {
        if (window.authManager && window.authManager.user) {
            carrinho = JSON.parse(localStorage.getItem('carrinho')) || {};
            favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};
        } else {
            // Se não estiver logado, limpar os contadores
            carrinho = {};
            favoritos = {};
            updateCounters();
        }
    } catch (e) {
        console.error("Erro ao carregar dados do localStorage:", e);
        carrinho = {};
        favoritos = {};
    }
    
    // Inicializar componentes
    initCarousel();
    initModals();
    initEventListeners();
    initScrollAnimations();
    initSearch(); // Sistema de busca melhorado
    updateCounters();
    renderCart();
    renderWishlist();
    
    // Inicializar sistema de créditos
    setupCreditsEvents();
    
    // Scroll para o topo
    window.scrollTo(0, 0);
});

// ===== ANIMAÇÕES DE SCROLL =====
function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    
    // Verificar se as seções já estão visíveis no carregamento
    checkVisibility();
    
    // Adicionar o event listener para scroll
    window.addEventListener('scroll', checkVisibility);
    
    function checkVisibility() {
        const triggerBottom = window.innerHeight * 0.85;
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            
            if (sectionTop < triggerBottom) {
                section.classList.add('visible');
            }
        });
    }
}

// ===== SCROLL SUAVE PARA SEÇÕES =====
function initSmoothScroll() {
    // Adicionar evento de clique para as categorias
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== SISTEMA DE CARRINHO =====
function addToCart(productId, price) {
    checkAuthBeforeAction('cart', function() {
        // Código original da função addToCart
        if (!produtos[productId]) {
            showNotification("Produto não encontrado!", true);
            return;
        }
        
        if (!carrinho[productId]) {
            carrinho[productId] = {
                quantidade: 1,
                total: price,
                ...produtos[productId]
            };
        } else {
            carrinho[productId].quantidade++;
            carrinho[productId].total = carrinho[productId].quantidade * price;
        }
        
        // Atualizar localStorage
        try {
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
        } catch (e) {
            console.error("Erro ao salvar no localStorage:", e);
        }
        
        // Atualizar interface
        updateCounters();
        renderCart();
        
        // Mostrar notificação
        showNotification(`${produtos[productId].nome} adicionado ao carrinho!`);
    });
}

function removeFromCart(productId, price) {
    if (carrinho[productId]) {
        if (carrinho[productId].quantidade > 1) {
            carrinho[productId].quantidade--;
            carrinho[productId].total = carrinho[productId].quantidade * price;
        } else {
            delete carrinho[productId];
        }
        
        // Atualizar localStorage
        try {
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
        } catch (e) {
            console.error("Erro ao salvar no localStorage:", e);
        }
        
        // Atualizar interface
        updateCounters();
        renderCart();
        
        // Mostrar notificação
        showNotification(`${produtos[productId].nome} removido do carrinho!`, true);
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    // Se não estiver logado, mostrar carrinho vazio
    if (!window.authManager || !window.authManager.user) {
        cartItems.innerHTML = '<p class="wishlist-empty">Faça login para ver seu carrinho</p>';
        cartTotal.textContent = 'Subtotal: R$ 0,00';
        return;
    }
    
    if (Object.keys(carrinho).length === 0) {
        cartItems.innerHTML = '<p class="wishlist-empty">Seu carrinho está vazio</p>';
        cartTotal.textContent = 'Subtotal: R$ 0,00';
        
        // Ocultar seção de créditos se o carrinho estiver vazio
        const creditsApplication = document.getElementById('creditsApplication');
        if (creditsApplication) {
            creditsApplication.style.display = 'none';
        }
        return;
    }
    
    let html = '';
    let total = 0;
    
    for (const [id, item] of Object.entries(carrinho)) {
        total += item.total;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.img}" alt="${item.nome}" loading="lazy">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nome}</div>
                    <div class="cart-item-price">R$ ${item.total.toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="removeFromCart('${id}', ${item.preco})">-</button>
                        <span>${item.quantidade}</span>
                        <button class="quantity-btn" onclick="addToCart('${id}', ${item.preco})">+</button>
                    </div>
                    <div class="remove-btn" onclick="removeAllFromCart('${id}')">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            </div>
        `;
    }
    
    cartItems.innerHTML = html;
    cartTotal.textContent = `Subtotal: R$ ${total.toFixed(2)}`;
    
    // Atualizar informações de créditos
    updateCreditsDisplay();
    updateCartCreditsDisplay();
}

function removeAllFromCart(productId) {
    if (carrinho[productId]) {
        delete carrinho[productId];
        
        // Atualizar localStorage
        try {
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
        } catch (e) {
            console.error("Erro ao salvar no localStorage:", e);
        }
        
        // Atualizar interface
        updateCounters();
        renderCart();
        
        // Mostrar notificação
        showNotification(`${produtos[productId].nome} removido do carrinho!`, true);
    }
}

// Calcular total do carrinho
function calculateCartTotal() {
    let total = 0;
    for (const productId in carrinho) {
        total += carrinho[productId].total;
    }
    return total;
}

// ===== SISTEMA DE FAVORITOS =====
function toggleWishlist(productId) {
    checkAuthBeforeAction('wishlist', function() {
        // Código original da função toggleWishlist
        if (!produtos[productId]) {
            showNotification("Produto não encontrado!", true);
            return;
        }
        
        if (favoritos[productId]) {
            delete favoritos[productId];
            showNotification(`${produtos[productId].nome} removido dos favoritos!`, true);
        } else {
            favoritos[productId] = produtos[productId];
            showNotification(`${produtos[productId].nome} adicionado aos favoritos!`);
        }
        
        // Atualizar localStorage
        try {
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
        } catch (e) {
            console.error("Erro ao salvar no localStorage:", e);
        }
        
        // Atualizar interface
        updateCounters();
        renderWishlist();
        updateWishlistButtons();
    });
}

function renderWishlist() {
    const wishlistItems = document.getElementById('wishlistItems');
    const wishlistEmpty = document.getElementById('wishlistEmpty');
    
    if (!wishlistItems || !wishlistEmpty) return;
    
    // Se não estiver logado, mostrar favoritos vazios
    if (!window.authManager || !window.authManager.user) {
        wishlistItems.innerHTML = '';
        wishlistEmpty.classList.remove('hidden');
        wishlistEmpty.textContent = 'Faça login para ver seus favoritos';
        return;
    }
    
    if (Object.keys(favoritos).length === 0) {
        wishlistItems.innerHTML = '';
        wishlistEmpty.classList.remove('hidden');
        wishlistEmpty.textContent = 'Você ainda não tem favoritos';
        return;
    }
    
    wishlistEmpty.classList.add('hidden');
    
    let html = '';
    
    for (const [id, item] of Object.entries(favoritos)) {
        html += `
            <div class="wishlist-item">
                <div class="wishlist-item-image">
                    <img src="${item.img}" alt="${item.nome}" loading="lazy">
                </div>
                <div class="wishlist-item-info">
                    <div class="wishlist-item-title">${item.nome}</div>
                    <div class="wishlist-item-price">R$ ${item.preco.toFixed(2)}</div>
                </div>
                <div class="wishlist-item-actions">
                    <button class="btn-cart" onclick="addToCart('${id}', ${item.preco})">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <div class="remove-btn" onclick="toggleWishlist('${id}')">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            </div>
        `;
    }
    
    wishlistItems.innerHTML = html;
}

function updateWishlistButtons() {
    document.querySelectorAll('.product-wishlist, .btn-wishlist').forEach(btn => {
        const productId = btn.dataset.product;
        if (favoritos[productId]) {
            btn.classList.add('active');
            btn.querySelector('i').className = 'fas fa-heart';
        } else {
            btn.classList.remove('active');
            btn.querySelector('i').className = 'far fa-heart';
        }
    });
}

// ===== CONTADORES =====
function updateCounters() {
    // Se não estiver logado, zerar os contadores
    if (!window.authManager || !window.authManager.user) {
        const cartCountElement = document.getElementById('cartCount');
        const wishlistCountElement = document.getElementById('wishlistCount');
        
        if (cartCountElement) cartCountElement.textContent = '0';
        if (wishlistCountElement) wishlistCountElement.textContent = '0';
        return;
    }
    
    // Contador do carrinho
    const cartCount = Object.values(carrinho).reduce((total, item) => total + item.quantidade, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) cartCountElement.textContent = cartCount;
    
    // Contador de favoritos
    const wishlistCount = Object.keys(favoritos).length;
    const wishlistCountElement = document.getElementById('wishlistCount');
    if (wishlistCountElement) wishlistCountElement.textContent = wishlistCount;
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

// ===== CARROSSEL =====
function initCarousel() {
    const carouselInner = document.getElementById('carouselInner');
    const carouselItems = carouselInner ? carouselInner.querySelectorAll('.carousel-item') : [];
    const carouselDots = document.getElementById('carouselDots');
    
    if (!carouselInner || carouselItems.length === 0) return;
    
    // Criar dots de navegação
    if (carouselDots) {
        carouselItems.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            carouselDots.appendChild(dot);
        });
    }
    
    // Iniciar autoplay (sem botões de navegação)
    startCarousel();
}

function startCarousel() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 5000);
}

function stopCarousel() {
    clearInterval(carouselInterval);
}

function goToSlide(index) {
    const carouselInner = document.getElementById('carouselInner');
    const carouselItems = carouselInner ? carouselInner.querySelectorAll('.carousel-item') : [];
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (carouselItems.length === 0) return;
    
    if (index >= carouselItems.length) index = 0;
    if (index < 0) index = carouselItems.length - 1;
    
    carouselInner.style.transform = `translateX(-${index * 100}%)`;
    
    // Atualizar dots
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    currentSlide = index;
    
    // Reiniciar o carousel ao interagir manualmente
    stopCarousel();
    startCarousel();
}

function nextSlide() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    goToSlide(currentSlide + 1);
}

function prevSlide() {
    goToSlide(currentSlide - 1);
}

// ===== MODAIS =====
function initModals() {
    // Modal do carrinho - MODIFICADO para verificar autenticação
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (!window.authManager || !window.authManager.user) {
                showLoginAlert('cart');
            } else {
                document.getElementById('cartModal').classList.add('active');
            }
        });
    }
    
    const closeCartModal = document.getElementById('closeCartModal');
    if (closeCartModal) {
        closeCartModal.addEventListener('click', () => {
            document.getElementById('cartModal').classList.remove('active');
        });
    }
    
    const viewCartBtn = document.getElementById('viewCartBtn');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!window.authManager || !window.authManager.user) {
                showLoginAlert('cart');
            } else {
                document.getElementById('cartModal').classList.add('active');
            }
        });
    }
    
    // Modal de favoritos - MODIFICADO para verificar autenticação
    const wishlistIcon = document.getElementById('wishlistIcon');
    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (!window.authManager || !window.authManager.user) {
                showLoginAlert('wishlist');
            } else {
                document.getElementById('wishlistModal').classList.add('active');
            }
        });
    }
    
    const closeWishlistModal = document.getElementById('closeWishlistModal');
    if (closeWishlistModal) {
        closeWishlistModal.addEventListener('click', () => {
            document.getElementById('wishlistModal').classList.remove('active');
        });
    }
    
    // Modal de agendamento (não precisa de autenticação para visualizar)
    document.querySelectorAll('[data-service]').forEach(btn => {
        btn.addEventListener('click', () => {
            const service = btn.dataset.service;
            document.getElementById('serviceType').value = service;
            document.getElementById('bookingModal').classList.add('active');
        });
    });
    
    const closeBookingModal = document.getElementById('closeBookingModal');
    if (closeBookingModal) {
        closeBookingModal.addEventListener('click', () => {
            document.getElementById('bookingModal').classList.remove('active');
        });
    }
    
    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ===== FORMULÁRIOS =====
function initForms() {
    // Formulário de agendamento
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const serviceType = document.getElementById('serviceType').value;
            const petType = document.getElementById('petType').value;
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;
            
            if (!serviceType || !petType || !date || !time) {
                showNotification('Por favor, preencha todos os campos', true);
                return;
            }
            
            showNotification(`Agendamento confirmado para ${serviceType} (${petType}) em ${date} às ${time}`);
            document.getElementById('bookingModal').classList.remove('active');
            bookingForm.reset();
        });
    }
    
    // Formulário de feedback
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const userName = document.getElementById('userName').value;
            const userComment = document.getElementById('userComment').value;
            const rating = document.querySelector('input[name="rating"]:checked');
            
            if (!userName || !rating) {
                showNotification('Por favor, preencha pelo menos o nome e a avaliação', true);
                return;
            }
            
            showNotification('Obrigado pela sua avaliação!');
            feedbackForm.reset();
            
            // Reset stars
            document.querySelectorAll('input[name="rating"]').forEach(input => {
                input.checked = false;
            });
        });
    }
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Botões de carrinho
    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.dataset.product;
            const price = parseFloat(btn.dataset.price);
            addToCart(productId, price);
        });
    });
    
    // Botões de favoritos
    document.querySelectorAll('.product-wishlist, .btn-wishlist').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.dataset.product;
            toggleWishlist(productId);
        });
    });
    
    // Pausar carrossel ao passar o mouse
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        heroCarousel.addEventListener('mouseenter', stopCarousel);
        heroCarousel.addEventListener('mouseleave', startCarousel);
    }
    
    // Inicializar sistemas
    initSmoothScroll();
    initForms();
    updateWishlistButtons();
}

// ===== FUNÇÕES ADICIONAIS PARA GERENCIAR LOGIN/LOGOUT =====
// Função para limpar dados quando o usuário faz logout
function clearUserData() {
    carrinho = {};
    favoritos = {};
    updateCounters();
    renderCart();
    renderWishlist();
}

// Monitorar mudanças no estado de autenticação
if (window.authManager) {
    // Sobrescrever o método handleSignOut para limpar os dados
    const originalHandleSignOut = window.authManager.handleSignOut;
    window.authManager.handleSignOut = function() {
        originalHandleSignOut.call(this);
        clearUserData();
    };
    
    // Verificar periodicamente o estado de autenticação
    setInterval(() => {
        if (window.authManager && !window.authManager.user && (Object.keys(carrinho).length > 0 || Object.keys(favoritos).length > 0)) {
            clearUserData();
        }
    }, 1000);
}

// ===== CARREGAMENTO SOB DEMANDA PARA RAÇÕES - SIMPLIFICADO =====
document.addEventListener('DOMContentLoaded', function() {
    const loadMoreBtn = document.getElementById('load-more-racao');
    const racaoGrid = document.getElementById('racao-grid');
    
    if (!loadMoreBtn || !racaoGrid) {
        console.log('Elementos não encontrados');
        return;
    }
    
    console.log('Botão e grid encontrados, inicializando...');
    
    // Remover o botão "Carregar Mais" conforme solicitado
    loadMoreBtn.style.display = 'none';
});

// ===== FUNÇÕES ADICIONAIS PARA OS NOVOS PRODUTOS =====
function initEventListenersForNewElements() {
    console.log('Inicializando event listeners para novos produtos...');
    
    // Botões de carrinho - usar event delegation
    document.querySelectorAll('#racao-grid .btn-cart').forEach(btn => {
        // Remover qualquer evento anterior para evitar duplicação
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = this.dataset.product;
            const price = parseFloat(this.dataset.price);
            
            // Verificar autenticação antes de adicionar ao carrinho
            if (window.authManager && window.authManager.user) {
                if (typeof addToCart === 'function') {
                    addToCart(productId, price);
                } else {
                    console.log('Produto adicionado ao carrinho:', productId, price);
                    showNotification('Produto adicionado ao carrinho!');
                }
            } else {
                // Se não estiver logado, mostrar o alerta de login
                showLoginAlert('cart');
            }
        });
    });
    
    // Botões de favoritos - usar event delegation
    document.querySelectorAll('#racao-grid .product-wishlist, #racao-grid .btn-wishlist').forEach(btn => {
        // Remover qualquer evento anterior para evitar duplicação
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = this.dataset.product;
            
            // Verificar autenticação antes de adicionar aos favoritos
            if (window.authManager && window.authManager.user) {
                if (typeof toggleWishlist === 'function') {
                    toggleWishlist(productId);
                } else {
                    const heartIcon = this.querySelector('i');
                    if (heartIcon.classList.contains('far')) {
                        heartIcon.className = 'fas fa-heart';
                        showNotification('Produto adicionado aos favoritos!');
                    } else {
                        heartIcon.className = 'far fa-heart';
                        showNotification('Produto removido dos favoritos!');
                    }
                }
            } else {
                // Se não estiver logado, mostrar o alerta de login
                showLoginAlert('wishlist');
            }
        });
    });
}

// Função para fechar o alerta de login
function setupLoginAlertClose() {
    document.addEventListener('click', function(e) {
        // Fechar alerta ao clicar no botão Cancelar
        if (e.target.id === 'loginAlertCancel' || e.target.closest('#loginAlertCancel')) {
            const alertOverlay = document.querySelector('.login-alert-overlay');
            if (alertOverlay) {
                alertOverlay.remove();
            }
        }
        
        // Fechar alerta ao clicar fora da caixa
        if (e.target.classList.contains('login-alert-overlay')) {
            e.target.remove();
        }
    });
}

// Inicializar o fechamento do alerta quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    setupLoginAlertClose();
});

// ===== SISTEMA DE CONVIDADO INTEGRADO =====

// Modificar a função initCreditsSystem para incluir convidados
function initCreditsSystem() {
    // Verificar se é usuário logado OU convidado
    if ((window.authManager && window.authManager.user) || window.GuestMode.isGuestUser()) {
        loadUserCredits();
        
        // Verificar se é um novo usuário (primeiro acesso)
        const isNewUser = localStorage.getItem('isNewUser');
        if (isNewUser === 'true') {
            showWelcomeCredits();
            localStorage.removeItem('isNewUser');
        }
    }
}

// Modificar a função checkAuthBeforeAction para aceitar convidados
function checkAuthBeforeAction(actionType, callback) {
    if ((window.authManager && window.authManager.user) || window.GuestMode.isGuestUser()) {
        // Usuário está logado ou é convidado, executar a ação
        if (typeof callback === 'function') {
            callback();
        }
    } else {
        // Usuário não está logado, mostrar alerta e redirecionar
        showLoginAlert(actionType);
    }
}

// Modificar a função loadUserCredits para convidados
function loadUserCredits() {
    const savedCredits = localStorage.getItem('userCredits');
    
    if (savedCredits) {
        userCredits = parseInt(savedCredits);
    } else {
        // Definir créditos iniciais baseado no tipo de usuário
        if (window.GuestMode.isGuestUser()) {
            userCredits = 25; // Convidado ganha menos créditos
        } else {
            userCredits = 50; // Usuário registrado ganha mais
        }
        localStorage.setItem('userCredits', userCredits);
        localStorage.setItem('isNewUser', 'true');
    }
    
    updateCreditsDisplay();
}

// Modificar a função clearUserData para não limpar dados de convidado
function clearUserData() {
    // Só limpar se não for convidado
    if (!window.GuestMode.isGuestUser()) {
        carrinho = {};
        favoritos = {};
        updateCounters();
        renderCart();
        renderWishlist();
    }
}

// Nova função para carregar dados do convidado
function loadGuestData() {
    if (window.GuestMode.isGuestUser()) {
        try {
            carrinho = JSON.parse(localStorage.getItem('carrinho')) || {};
            favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};
            console.log('Dados do convidado carregados:', { carrinho, favoritos });
        } catch (e) {
            console.error("Erro ao carregar dados do convidado:", e);
            carrinho = {};
            favoritos = {};
        }
    }
}

// Modify DOMContentLoaded initialization
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar modo convidado primeiro
    if (window.GuestMode && window.GuestMode.initGuestMode) {
        window.GuestMode.initGuestMode();
    }
    
    // Carregar dados baseado no tipo de usuário
    if (window.GuestMode.isGuestUser()) {
        loadGuestData();
    } else if (window.authManager && window.authManager.user) {
        // Código existente para usuários logados
        try {
            carrinho = JSON.parse(localStorage.getItem('carrinho')) || {};
            favoritos = JSON.parse(localStorage.getItem('favoritos')) || {};
        } catch (e) {
            console.error("Erro ao carregar dados do localStorage:", e);
            carrinho = {};
            favoritos = {};
        }
    } else {
        // Se não estiver logado nem for convidado, limpar os contadores
        carrinho = {};
        favoritos = {};
    }
    
    // Resto do código de inicialização...
    initAuthSync();
    initCreditsSystem();
    updateCounters();
    renderCart();
    renderWishlist();
    // ... resto do código
});

// Modificar as funções de carrinho e favoritos para salvar no localStorage para convidados
function addToCart(productId, price) {
    checkAuthBeforeAction('cart', function() {
        if (!produtos[productId]) {
            showNotification("Produto não encontrado!", true);
            return;
        }
        
        if (!carrinho[productId]) {
            carrinho[productId] = {
                quantidade: 1,
                total: price,
                ...produtos[productId]
            };
        } else {
            carrinho[productId].quantidade++;
            carrinho[productId].total = carrinho[productId].quantidade * price;
        }
        
        // Salvar no localStorage (funciona para convidados e usuários logados)
        try {
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
        } catch (e) {
            console.error("Erro ao salvar no localStorage:", e);
        }
        
        updateCounters();
        renderCart();
        showNotification(`${produtos[productId].nome} adicionado ao carrinho!`);
    });
}

function toggleWishlist(productId) {
    checkAuthBeforeAction('wishlist', function() {
        if (!produtos[productId]) {
            showNotification("Produto não encontrado!", true);
            return;
        }
        
        if (favoritos[productId]) {
            delete favoritos[productId];
            showNotification(`${produtos[productId].nome} removido dos favoritos!`, true);
        } else {
            favoritos[productId] = produtos[productId];
            showNotification(`${produtos[productId].nome} adicionado aos favoritos!`);
        }
        
        // Salvar no localStorage (funciona para convidados e usuários logados)
        try {
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
        } catch (e) {
            console.error("Erro ao salvar no localStorage:", e);
        }
        
        updateCounters();
        renderWishlist();
        updateWishlistButtons();
    });
}


