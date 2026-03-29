// auth-manager.js - CONFIGURADO PARA Your SITE

// SUA URL DA API - Você precisa criar uma API na Vercel!
// Por enquanto, vamos usar localStorage e depois você migra para a API
const API_URL = 'https://seu-backend.vercel.app/api'; // MUDAR DEPOIS

class AuthManager {
    constructor() {
        this.user = null;
        this.profile = null;
        this.init();
    }

    async init() {
        console.log('AuthManager initializing...');
        
        // Verificar se há usuário salvo no localStorage
        await this.checkLocalStorage();
        
        // Atualizar UI
        this.updateUI();
    }

    async checkLocalStorage() {
        try {
            const savedUser = localStorage.getItem('currentUser');
            const savedProfile = localStorage.getItem('userProfile');
            
            if (savedUser) {
                this.user = JSON.parse(savedUser);
                this.profile = savedProfile ? JSON.parse(savedProfile) : null;
                console.log('Usuário encontrado:', this.user.email);
            }
        } catch (error) {
            console.error('Erro:', error);
            this.user = null;
            this.profile = null;
        }
    }

    // ========== FUNÇÕES PRINCIPAIS ==========
    
    async signIn(email, password) {
        try {
            console.log('Attempting login...');
            
            // Para AGORA: usar localStorage
            // DEPOIS: substituir por chamada à API
            
            const savedUser = localStorage.getItem('users') ? 
                JSON.parse(localStorage.getItem('users')).find(u => u.email === email && u.password === password) : null;
            
            if (savedUser) {
                this.user = {
                    id: savedUser.id,
                    email: savedUser.email,
                    nome: savedUser.nome,
                    avatar: savedUser.avatar,
                    nivel: savedUser.nivel || 1,
                    credits: savedUser.credits || 50
                };
                
                this.profile = {
                    id: savedUser.id,
                    nome: savedUser.nome,
                    avatar: savedUser.avatar || 'cachorro',
                    nivel: savedUser.nivel || 1,
                    email: savedUser.email,
                    credits: savedUser.credits || 50
                };
                
                localStorage.setItem('currentUser', JSON.stringify(this.user));
                localStorage.setItem('userProfile', JSON.stringify(this.profile));
                localStorage.setItem('userCredits', (savedUser.credits || 50).toString());
                
                console.log('✅ Login successful:', this.user.email);
                
                await this.checkAndAwardCredits();
                this.updateUI();
                return { success: true, user: this.user };
            }
            
            return { success: false, error: 'Email or password incorrect' };
            
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async signUp(email, password, name, avatar = 'cachorro') {
        try {
            console.log('Attempting signup...');
            
            // Verificar se usuário já existe
            const users = localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')) : [];
            const userExists = users.find(u => u.email === email);
            
            if (userExists) {
                return { success: false, error: 'Este email já está cadastrado' };
            }
            
            // Criar novo usuário
            const newUser = {
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                email: email,
                password: password,
                nome: name,
                avatar: avatar,
                nivel: 1,
                credits: 50,
                created_at: new Date().toISOString()
            };
            
            // Salvar usuário
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            this.user = {
                id: newUser.id,
                email: newUser.email,
                nome: newUser.nome,
                avatar: newUser.avatar,
                nivel: newUser.nivel,
                credits: newUser.credits
            };
            
            this.profile = {
                id: newUser.id,
                nome: newUser.nome,
                avatar: newUser.avatar,
                nivel: newUser.nivel,
                email: newUser.email,
                credits: newUser.credits
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.user));
            localStorage.setItem('userProfile', JSON.stringify(this.profile));
            localStorage.setItem('userCredits', '50');
            localStorage.setItem('isNewUser', 'true');
            
            console.log('✅ Signup completed:', this.user.email);
            
            this.updateUI();
            return { success: true, user: this.user };
            
        } catch (error) {
            console.error('❌ Signup error:', error);
            return { success: false, error: error.message };
        }
    }

    async signInAsGuest() {
        try {
            const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const guestName = this.generateGuestName();
            const guestAvatar = this.getRandomAvatar();
            
            this.user = {
                id: guestId,
                email: `${guestId}@guest.luckpet.com`,
                nome: guestName,
                avatar: guestAvatar,
                isGuest: true,
                nivel: 1,
                credits: 25
            };
            
            this.profile = {
                id: guestId,
                nome: guestName,
                avatar: guestAvatar,
                nivel: 1,
                email: `${guestId}@guest.luckpet.com`,
                isGuest: true,
                credits: 25
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.user));
            localStorage.setItem('userProfile', JSON.stringify(this.profile));
            localStorage.setItem('isGuest', 'true');
            localStorage.setItem('guestProfile', JSON.stringify(this.profile));
            localStorage.setItem('userCredits', '25');
            localStorage.setItem('isNewUser', 'true');
            
            console.log('✅ Guest login:', this.user.nome);
            
            this.updateUI();
            return { success: true, user: this.user, isGuest: true };
            
        } catch (error) {
            console.error('❌ Login error como convidado:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const isGuest = this.isGuestUser();
            
            if (isGuest) {
                const userCredits = localStorage.getItem('userCredits');
                
                localStorage.removeItem('isGuest');
                localStorage.removeItem('guestProfile');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('userProfile');
                localStorage.removeItem('guestLoginTime');
                localStorage.removeItem('isNewUser');
                
                // Manter carrinho e favoritos do convidado
                // localStorage.removeItem('carrinho');
                // localStorage.removeItem('favoritos');
                
                if (userCredits) {
                    localStorage.setItem('userCredits', userCredits);
                }
            } else {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('userProfile');
            }
            
            this.user = null;
            this.profile = null;
            
            console.log('✅ Logout successful');
            this.updateUI();
            
            // Redirecionar para página inicial
            window.location.href = 'https://projeto-luckpet.vercel.app/';
            
        } catch (error) {
            console.error('❌ Error logging out:', error);
        }
    }

    async checkAndAwardCredits() {
        try {
            const isNewUser = localStorage.getItem('isNewUser');
            
            if (isNewUser === 'true' && this.user) {
                const initialCredits = this.user.isGuest ? 25 : 50;
                
                localStorage.setItem('userCredits', initialCredits.toString());
                localStorage.removeItem('isNewUser');
                
                console.log(`✅ ${initialCredits} LuckCoins concedidos:`, this.user.email);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao conceder créditos:', error);
            return false;
        }
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        
        if (this.user && this.profile) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                this.updateUserAvatar();
                this.updateUserName();
                this.updateUserCredits();
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    updateUserAvatar() {
        if (!this.profile) return;
        
        const avatarImg = document.querySelector('.user-avatar');
        const profileAvatar = document.querySelector('.profile-avatar');
        
        const avatarMap = {
            'cachorro': 'cachorro.jpg',
            'gato': 'gato.jpg',
            'coelho': 'coelho.jpg',
            'pássaro': 'passaro.jpg'
        };
        
        const avatarFileName = avatarMap[this.profile.avatar] || 'cachorro.jpg';
        const avatarPath = `../img/avatares/${avatarFileName}`;
        
        if (avatarImg) {
            avatarImg.src = avatarPath;
            avatarImg.alt = this.profile.nome;
            avatarImg.onerror = function() {
                this.src = '../img/avatares/cachorro.jpg';
            };
        }
        
        if (profileAvatar) {
            profileAvatar.src = avatarPath;
            profileAvatar.alt = this.profile.nome;
            profileAvatar.onerror = function() {
                this.src = '../img/avatares/cachorro.jpg';
            };
        }
    }

    updateUserName() {
        if (!this.profile) return;
        
        const userName = document.querySelector('.user-name');
        const profileName = document.querySelector('.profile-name');
        const profileLevel = document.querySelector('.profile-level');
        
        if (userName) userName.textContent = this.profile.nome;
        if (profileName) profileName.textContent = this.profile.nome;
        if (profileLevel) profileLevel.textContent = `Nível ${this.profile.nivel}`;
    }
    
    updateUserCredits() {
        const userCreditsElement = document.getElementById('userCredits');
        if (userCreditsElement) {
            const userCredits = localStorage.getItem('userCredits') || '0';
            userCreditsElement.textContent = userCredits;
        }
    }

    generateGuestName() {
        const names = [
            'Amigo Pet', 'Explorador', 'Aventureiro', 'Curioso', 'Visitante',
            'Amigo dos Bichos', 'PetLover', 'Mimi', 'Tobby', 'Luna', 'Thor', 'Mel',
            'Bob', 'Lucky', 'Charlie', 'Bella', 'Max', 'Lucy', 'Buddy', 'Daisy'
        ];
        const randomName = names[Math.floor(Math.random() * names.length)];
        return `${randomName}#${Math.floor(Math.random() * 1000)}`;
    }

    getRandomAvatar() {
        const avatars = ['cachorro', 'gato', 'coelho', 'pássaro'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    isGuestUser() {
        return localStorage.getItem('isGuest') === 'true';
    }

    getGuestProfile() {
        const guestProfile = localStorage.getItem('guestProfile');
        return guestProfile ? JSON.parse(guestProfile) : null;
    }

    getCurrentUser() {
        return this.user;
    }

    getCurrentProfile() {
        return this.profile;
    }
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando AuthManager...');
    
    // Criar instância global
    window.authManager = new AuthManager();
    
    // Configurar toggle do dropdown
    const userToggle = document.getElementById('userToggle');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userToggle && userDropdown) {
        userToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.authManager.signOut();
        });
    }
});

// Funções globais
window.refreshAuth = function() {
    if (window.authManager) {
        window.authManager.updateUI();
    }
};

window.closeWelcome = function() {
    const welcomeSection = document.getElementById('welcome-credits');
    if (welcomeSection) {
        welcomeSection.style.display = 'none';
    }
};
