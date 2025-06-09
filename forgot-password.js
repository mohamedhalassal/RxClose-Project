/**
 * RxClose Forgot Password System
 * Frontend JavaScript for handling password reset flow
 */

class ForgotPasswordManager {
    constructor() {
        this.baseURL = 'http://localhost:5000/api/users';
        this.currentStep = 1;
        this.userEmail = '';
        this.resetCode = '';
        
        this.initializeElements();
        this.attachEventListeners();
        this.setupCodeInputs();
    }

    initializeElements() {
        // Forms
        this.emailForm = document.getElementById('emailForm');
        this.verificationForm = document.getElementById('verificationForm');
        this.passwordForm = document.getElementById('passwordForm');
        
        // Inputs
        this.emailInput = document.getElementById('email');
        this.newPasswordInput = document.getElementById('newPassword');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        
        // Buttons
        this.sendCodeBtn = document.getElementById('sendCodeBtn');
        this.verifyCodeBtn = document.getElementById('verifyCodeBtn');
        this.resetPasswordBtn = document.getElementById('resetPasswordBtn');
        this.backToEmailBtn = document.getElementById('backToEmailBtn');
        this.backToCodeBtn = document.getElementById('backToCodeBtn');
        this.resendCodeLink = document.getElementById('resendCode');
        
        // UI Elements
        this.alertContainer = document.getElementById('alertContainer');
        this.emailDisplay = document.getElementById('emailDisplay');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        
        // Code inputs
        this.codeInputs = [
            document.getElementById('code1'),
            document.getElementById('code2'),
            document.getElementById('code3'),
            document.getElementById('code4'),
            document.getElementById('code5'),
            document.getElementById('code6')
        ];
    }

    attachEventListeners() {
        // Form submissions
        this.emailForm.addEventListener('submit', (e) => this.handleEmailSubmit(e));
        this.verificationForm.addEventListener('submit', (e) => this.handleVerificationSubmit(e));
        this.passwordForm.addEventListener('submit', (e) => this.handlePasswordSubmit(e));
        
        // Navigation buttons
        this.backToEmailBtn.addEventListener('click', () => this.goToStep(1));
        this.backToCodeBtn.addEventListener('click', () => this.goToStep(2));
        this.resendCodeLink.addEventListener('click', (e) => this.handleResendCode(e));
        
        // Password confirmation validation
        this.confirmPasswordInput.addEventListener('input', () => this.validatePasswordMatch());
    }

    setupCodeInputs() {
        this.codeInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                // Only allow numbers
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                
                // Auto-focus next input
                if (e.target.value && index < this.codeInputs.length - 1) {
                    this.codeInputs[index + 1].focus();
                }
                
                // Auto-submit when all fields are filled
                if (this.getVerificationCode().length === 6) {
                    setTimeout(() => this.handleVerificationSubmit(null), 100);
                }
            });
            
            input.addEventListener('keydown', (e) => {
                // Backspace navigation
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    this.codeInputs[index - 1].focus();
                }
            });
            
            // Paste handling
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedText = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
                
                for (let i = 0; i < pastedText.length && i < 6; i++) {
                    this.codeInputs[i].value = pastedText[i];
                }
                
                if (pastedText.length === 6) {
                    setTimeout(() => this.handleVerificationSubmit(null), 100);
                }
            });
        });
    }

    async handleEmailSubmit(e) {
        if (e) e.preventDefault();
        
        const email = this.emailInput.value.trim();
        if (!email) {
            this.showAlert('يرجى إدخال بريدك الإلكتروني', 'danger');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showAlert('يرجى إدخال بريد إلكتروني صحيح', 'danger');
            return;
        }

        this.setLoading(true);
        
        try {
            const response = await fetch(`${this.baseURL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                this.userEmail = email;
                this.emailDisplay.textContent = email;
                this.showAlert(data.message, 'success');
                this.goToStep(2);
            } else {
                this.showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('حدث خطأ في الشبكة. يرجى المحاولة لاحقاً', 'danger');
        } finally {
            this.setLoading(false);
        }
    }

    async handleVerificationSubmit(e) {
        if (e) e.preventDefault();
        
        const code = this.getVerificationCode();
        if (code.length !== 6) {
            this.showAlert('يرجى إدخال رمز التحقق كاملاً', 'danger');
            return;
        }

        this.resetCode = code;
        this.setLoading(true);
        
        try {
            const response = await fetch(`${this.baseURL}/verify-reset-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.userEmail,
                    resetCode: code
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert(data.message, 'success');
                this.goToStep(3);
            } else {
                this.showAlert(data.message, 'danger');
                this.clearCodeInputs();
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('حدث خطأ في الشبكة. يرجى المحاولة لاحقاً', 'danger');
            this.clearCodeInputs();
        } finally {
            this.setLoading(false);
        }
    }

    async handlePasswordSubmit(e) {
        e.preventDefault();
        
        const newPassword = this.newPasswordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;

        if (newPassword.length < 6) {
            this.showAlert('كلمة المرور يجب أن تحتوي على الأقل 6 أحرف', 'danger');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showAlert('كلمتا المرور غير متطابقتين', 'danger');
            return;
        }

        this.setLoading(true);
        
        try {
            const response = await fetch(`${this.baseURL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.userEmail,
                    resetCode: this.resetCode,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert(data.message, 'success');
                this.goToStep('success');
            } else {
                this.showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('حدث خطأ في الشبكة. يرجى المحاولة لاحقاً', 'danger');
        } finally {
            this.setLoading(false);
        }
    }

    async handleResendCode(e) {
        e.preventDefault();
        
        if (!this.userEmail) {
            this.showAlert('حدث خطأ. يرجى البدء من جديد', 'danger');
            this.goToStep(1);
            return;
        }

        this.showAlert('جاري إعادة إرسال الرمز...', 'info');
        
        // Re-send code using the same email endpoint
        try {
            const response = await fetch(`${this.baseURL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: this.userEmail })
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('تم إعادة إرسال الرمز بنجاح', 'success');
                this.clearCodeInputs();
            } else {
                this.showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('حدث خطأ في إعادة الإرسال', 'danger');
        }
    }

    goToStep(step) {
        // Hide all step contents
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });

        // Reset step indicators
        document.querySelectorAll('.step').forEach(stepEl => {
            stepEl.classList.remove('active', 'completed');
            stepEl.classList.add('inactive');
        });

        document.querySelectorAll('.step-line').forEach(line => {
            line.classList.remove('active');
        });

        if (step === 'success') {
            document.getElementById('successContent').classList.add('active');
            // Mark all steps as completed
            for (let i = 1; i <= 3; i++) {
                document.getElementById(`step${i}`).classList.remove('inactive');
                document.getElementById(`step${i}`).classList.add('completed');
                if (i < 3) {
                    document.getElementById(`line${i}`).classList.add('active');
                }
            }
        } else {
            // Show current step content
            document.getElementById(`step${step}Content`).classList.add('active');
            
            // Update step indicators
            for (let i = 1; i <= 3; i++) {
                const stepEl = document.getElementById(`step${i}`);
                const lineEl = document.getElementById(`line${i}`);
                
                if (i < step) {
                    stepEl.classList.remove('inactive', 'active');
                    stepEl.classList.add('completed');
                    if (lineEl) lineEl.classList.add('active');
                } else if (i === step) {
                    stepEl.classList.remove('inactive', 'completed');
                    stepEl.classList.add('active');
                } else {
                    stepEl.classList.remove('active', 'completed');
                    stepEl.classList.add('inactive');
                }
            }
        }

        this.currentStep = step;
        this.clearAlerts();

        // Focus appropriate input
        setTimeout(() => {
            if (step === 1) {
                this.emailInput.focus();
            } else if (step === 2) {
                this.codeInputs[0].focus();
            } else if (step === 3) {
                this.newPasswordInput.focus();
            }
        }, 100);
    }

    getVerificationCode() {
        return this.codeInputs.map(input => input.value).join('');
    }

    clearCodeInputs() {
        this.codeInputs.forEach(input => {
            input.value = '';
        });
        this.codeInputs[0].focus();
    }

    validatePasswordMatch() {
        const newPassword = this.newPasswordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;
        
        if (confirmPassword && newPassword !== confirmPassword) {
            this.confirmPasswordInput.setCustomValidity('كلمتا المرور غير متطابقتين');
        } else {
            this.confirmPasswordInput.setCustomValidity('');
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showAlert(message, type) {
        this.clearAlerts();
        
        const alertEl = document.createElement('div');
        alertEl.className = `alert alert-${type} alert-dismissible fade show`;
        alertEl.innerHTML = `
            <i class="fas fa-${this.getAlertIcon(type)} ms-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        this.alertContainer.appendChild(alertEl);
        
        // Auto-remove success and info alerts after 5 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (alertEl.parentNode) {
                    alertEl.remove();
                }
            }, 5000);
        }
    }

    getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            danger: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    clearAlerts() {
        this.alertContainer.innerHTML = '';
    }

    setLoading(isLoading) {
        const buttons = [this.sendCodeBtn, this.verifyCodeBtn, this.resetPasswordBtn];
        
        if (isLoading) {
            this.loadingSpinner.style.display = 'block';
            buttons.forEach(btn => {
                if (btn) {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin ms-2"></i> جاري المعالجة...';
                }
            });
        } else {
            this.loadingSpinner.style.display = 'none';
            
            // Restore button texts
            if (this.sendCodeBtn) {
                this.sendCodeBtn.disabled = false;
                this.sendCodeBtn.innerHTML = '<i class="fas fa-paper-plane ms-2"></i> إرسال رمز التحقق';
            }
            
            if (this.verifyCodeBtn) {
                this.verifyCodeBtn.disabled = false;
                this.verifyCodeBtn.innerHTML = '<i class="fas fa-check ms-2"></i> التحقق من الرمز';
            }
            
            if (this.resetPasswordBtn) {
                this.resetPasswordBtn.disabled = false;
                this.resetPasswordBtn.innerHTML = '<i class="fas fa-key ms-2"></i> تغيير كلمة المرور';
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ForgotPasswordManager();
});

// Handle browser back button
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.step) {
        const manager = window.forgotPasswordManager;
        if (manager) {
            manager.goToStep(e.state.step);
        }
    }
}); 