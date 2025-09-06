# 🤝 Contributing to TapNGo Pay

Thank you for your interest in contributing to TapNGo Pay! This document provides guidelines and information for contributors.

## 📋 **Table of Contents**

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 **Code of Conduct**

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@tapngo.app](mailto:conduct@tapngo.app).

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and Yarn
- Git
- MongoDB (local or cloud)
- Basic knowledge of React, Next.js, and Solidity

### **Fork and Clone**
```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR_USERNAME/tapngo.git
cd tapngo
git remote add upstream https://github.com/henrysammarfo/tapngo.git
```

## 🛠️ **Development Setup**

### **1. Install Dependencies**
```bash
yarn install
```

### **2. Environment Configuration**
```bash
# Frontend
cd packages/nextjs
cp .env.example .env.local
# Configure Clerk keys and API URLs

# Backend
cd packages/backend
cp env.example .env
# Configure MongoDB and service APIs

# Hardhat
cd packages/hardhat
yarn generate  # Generate deployer account
```

### **3. Start Development Environment**
```bash
# Terminal 1: Local blockchain
yarn chain

# Terminal 2: Deploy contracts
yarn deploy

# Terminal 3: Backend API
cd packages/backend && yarn start

# Terminal 4: Frontend
yarn start
```

## 📝 **Contributing Guidelines**

### **Types of Contributions**
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🧪 Test coverage
- 🎨 UI/UX enhancements
- 🔒 Security improvements

### **Before You Start**
1. Check existing issues and pull requests
2. Create an issue for significant changes
3. Discuss major changes with maintainers
4. Ensure your changes align with project goals

## 🔄 **Pull Request Process**

### **1. Create a Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### **2. Make Changes**
- Write clean, readable code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed

### **3. Commit Changes**
```bash
git add .
git commit -m "feat: add NFC payment functionality"
```

**Commit Message Format:**
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### **4. Push and Create PR**
```bash
git push origin feature/your-feature-name
```

Create a pull request with:
- Clear title and description
- Reference related issues
- Screenshots for UI changes
- Test instructions

## 🐛 **Issue Reporting**

### **Bug Reports**
Use the bug report template and include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### **Feature Requests**
Use the feature request template and include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Additional context

## 📏 **Coding Standards**

### **Frontend (Next.js/React)**
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines

```typescript
// Good example
const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  amount, 
  onPayment 
}) => {
  const [loading, setLoading] = useState(false);
  
  const handlePayment = async () => {
    setLoading(true);
    try {
      await onPayment(amount);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment}
      disabled={loading}
      className="btn btn-primary"
    >
      {loading ? 'Processing...' : `Pay ₵${amount}`}
    </button>
  );
};
```

### **Backend (Node.js/Express)**
- Use async/await for asynchronous operations
- Implement proper error handling
- Validate all inputs
- Use middleware for common functionality
- Follow RESTful API conventions

```javascript
// Good example
const createPayment = async (req, res) => {
  try {
    const { amount, recipient, message } = req.body;
    
    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount' 
      });
    }
    
    // Process payment
    const payment = await paymentService.create({
      amount,
      recipient,
      message,
      userId: req.user.id
    });
    
    res.status(201).json({ 
      success: true, 
      data: payment 
    });
  } catch (error) {
    console.error('Payment creation failed:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};
```

### **Smart Contracts (Solidity)**
- Use Solidity 0.8.20+
- Implement proper access controls
- Add comprehensive comments
- Use events for important state changes
- Follow OpenZeppelin standards

```solidity
// Good example
contract PaymentRouter {
    event PaymentProcessed(
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes32 indexed paymentId
    );
    
    function processPayment(
        address to,
        uint256 amount,
        bytes32 paymentId
    ) external onlyAuthorized {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        // Process payment logic
        _transfer(msg.sender, to, amount);
        
        emit PaymentProcessed(msg.sender, to, amount, paymentId);
    }
}
```

## 🧪 **Testing**

### **Frontend Testing**
```bash
# Run frontend tests
cd packages/nextjs
yarn test

# Run with coverage
yarn test:coverage
```

### **Backend Testing**
```bash
# Run backend tests
cd packages/backend
yarn test

# Run integration tests
yarn test:integration
```

### **Smart Contract Testing**
```bash
# Run contract tests
cd packages/hardhat
yarn test

# Run with gas reporting
yarn test:gas
```

### **Test Coverage Requirements**
- Frontend: Minimum 80% coverage
- Backend: Minimum 85% coverage
- Smart Contracts: Minimum 90% coverage

## 📚 **Documentation**

### **Code Documentation**
- Add JSDoc comments for functions
- Include inline comments for complex logic
- Update README for new features
- Maintain API documentation

### **Documentation Types**
- **README**: Project overview and setup
- **API Docs**: Backend endpoint documentation
- **Contract Docs**: Smart contract documentation
- **User Guide**: End-user instructions
- **Developer Guide**: Technical implementation details

## 🔍 **Code Review Process**

### **Review Checklist**
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

### **Review Timeline**
- Initial review within 48 hours
- Follow-up reviews within 24 hours
- Merge after approval from maintainers

## 🏷️ **Release Process**

### **Versioning**
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### **Release Steps**
1. Update version numbers
2. Update CHANGELOG.md
3. Create release notes
4. Tag the release
5. Deploy to production

## 🆘 **Getting Help**

### **Resources**
- **Documentation**: [docs.tapngo.app](https://docs.tapngo.app)
- **Discord**: [Join our community](https://discord.gg/tapngo)
- **GitHub Discussions**: [Ask questions](https://github.com/henrysammarfo/tapngo/discussions)

### **Contact**
- **Email**: dev@tapngo.app
- **Twitter**: [@TapNGoPay](https://twitter.com/TapNGoPay)
- **LinkedIn**: [TapNGo Pay](https://linkedin.com/company/tapngo-pay)

## 🎉 **Recognition**

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Social media acknowledgments

## 📄 **License**

By contributing to TapNGo Pay, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to the future of payments! 🚀**