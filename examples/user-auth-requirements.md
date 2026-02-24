# 用户认证系统需求文档

## 1. 项目概述

构建一个完整的用户认证系统，支持用户注册、登录、密码管理等核心功能。

## 2. 功能需求

### 2.1 用户注册

**功能描述**：
- 用户可以使用邮箱和密码注册新账号
- 系统验证邮箱格式和密码强度
- 注册成功后发送验证邮件

**验收标准**：
- [ ] 邮箱格式验证（正则表达式）
- [ ] 密码强度检查（至少 8 位，包含大小写字母和数字）
- [ ] 邮箱唯一性检查
- [ ] 密码使用 bcrypt 加密存储（salt rounds = 10）
- [ ] 返回 201 状态码和用户信息（不含密码）
- [ ] 错误情况返回适当的错误信息

**API 设计**：
```
POST /api/auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "张三"
}

Response (201):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "张三",
  "createdAt": "2024-01-01T00:00:00.000Z"
}

Response (400):
{
  "error": "Email already exists"
}
```

### 2.2 用户登录

**功能描述**：
- 用户使用邮箱和密码登录
- 登录成功返回 JWT token
- 支持 refresh token 机制

**验收标准**：
- [ ] 验证邮箱和密码
- [ ] 密码错误 5 次后锁定账户 15 分钟
- [ ] 返回 access token（有效期 1 小时）
- [ ] 返回 refresh token（有效期 7 天）
- [ ] Token 使用 RS256 算法签名

**API 设计**：
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "张三"
  }
}

Response (401):
{
  "error": "Invalid credentials"
}

Response (429):
{
  "error": "Account locked. Try again in 15 minutes"
}
```

### 2.3 Token 刷新

**功能描述**：
- 使用 refresh token 获取新的 access token
- 无需重新输入密码

**验收标准**：
- [ ] 验证 refresh token 有效性
- [ ] 返回新的 access token
- [ ] 可选：返回新的 refresh token（token rotation）

**API 设计**：
```
POST /api/auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGc..."
}

Response (200):
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

### 2.4 用户登出

**功能描述**：
- 使当前 token 失效
- 清除服务端 session（如果使用）

**API 设计**：
```
POST /api/auth/logout
Authorization: Bearer <access_token>

Response (200):
{
  "message": "Logged out successfully"
}
```

### 2.5 密码重置

**功能描述**：
- 用户忘记密码时可以重置
- 通过邮件发送重置链接

**验收标准**：
- [ ] 生成唯一的重置 token（有效期 1 小时）
- [ ] 发送重置邮件
- [ ] 验证 token 并更新密码
- [ ] 重置后使所有现有 token 失效

**API 设计**：
```
POST /api/auth/forgot-password
Content-Type: application/json

Request:
{
  "email": "user@example.com"
}

Response (200):
{
  "message": "Password reset email sent"
}

---

POST /api/auth/reset-password
Content-Type: application/json

Request:
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePass123"
}

Response (200):
{
  "message": "Password reset successfully"
}
```

### 2.6 获取当前用户信息

**功能描述**：
- 通过 token 获取当前登录用户信息

**API 设计**：
```
GET /api/auth/me
Authorization: Bearer <access_token>

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "张三",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 3. 数据模型

### User 表

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  email_verified BOOLEAN DEFAULT FALSE,
  locked_until TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### RefreshToken 表

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

### PasswordResetToken 表

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
```

## 4. 技术要求

### 4.1 后端技术栈
- **运行时**: Node.js 18+
- **框架**: Express 4.x
- **语言**: TypeScript 5.x
- **数据库**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **认证**: jsonwebtoken, bcrypt
- **验证**: zod
- **测试**: Vitest, Supertest

### 4.2 安全要求
- 密码使用 bcrypt 加密（salt rounds = 10）
- JWT 使用 RS256 算法（非对称加密）
- 实施 rate limiting（登录接口：5 次/分钟）
- 所有敏感操作记录审计日志
- 防止 SQL 注入（使用 ORM 参数化查询）
- 防止 XSS 攻击（输入验证和输出转义）
- 实施 CORS 策略
- 使用 helmet 中间件增强安全性

### 4.3 性能要求
- API 响应时间 < 200ms (P95)
- 支持 1000 并发用户
- 数据库查询优化（使用索引）
- Token 验证使用缓存（Redis）

## 5. 测试要求

### 5.1 单元测试
- 密码加密和验证逻辑
- Token 生成和验证逻辑
- 输入验证逻辑
- 覆盖率 > 80%

### 5.2 集成测试
- 所有 API 端点
- 数据库操作
- 错误处理
- 边界条件

### 5.3 测试场景
```typescript
describe('User Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data')
    it('should reject duplicate email')
    it('should reject weak password')
    it('should reject invalid email format')
  })

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials')
    it('should reject wrong password')
    it('should lock account after 5 failed attempts')
    it('should return valid JWT tokens')
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token')
    it('should reject expired refresh token')
    it('should reject invalid refresh token')
  })

  describe('POST /api/auth/forgot-password', () => {
    it('should send reset email for existing user')
    it('should not reveal if email exists (security)')
  })

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token')
    it('should reject expired token')
    it('should reject used token')
  })
})
```

## 6. 错误处理

### 6.1 错误码定义
```typescript
enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
}
```

### 6.2 错误响应格式
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect",
    "details": {}
  }
}
```

## 7. 环境变量

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Security
BCRYPT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=15m

# Rate Limiting
RATE_LIMIT_WINDOW=1m
RATE_LIMIT_MAX_REQUESTS=5
```

## 8. 项目结构

```
src/
├── modules/
│   └── auth/
│       ├── auth.controller.ts      # 路由处理
│       ├── auth.service.ts         # 业务逻辑
│       ├── auth.validation.ts      # 输入验证
│       ├── auth.types.ts           # 类型定义
│       └── __tests__/
│           ├── auth.service.test.ts
│           └── auth.integration.test.ts
├── middleware/
│   ├── auth.middleware.ts          # JWT 验证中间件
│   ├── rate-limit.middleware.ts    # 限流中间件
│   └── error-handler.middleware.ts # 错误处理
├── utils/
│   ├── jwt.util.ts                 # JWT 工具
│   ├── password.util.ts            # 密码工具
│   └── email.util.ts               # 邮件工具
├── prisma/
│   ├── schema.prisma               # 数据库模型
│   └── migrations/                 # 数据库迁移
└── app.ts                          # 应用入口
```

## 9. 实现步骤建议

### Phase 1: 基础设施
1. 设置 TypeScript + Express 项目
2. 配置 Prisma 和数据库
3. 创建数据模型和迁移
4. 设置测试环境

### Phase 2: 核心认证
1. 实现密码加密工具
2. 实现 JWT 工具
3. 实现用户注册 API
4. 实现用户登录 API
5. 编写单元测试

### Phase 3: Token 管理
1. 实现 refresh token 机制
2. 实现 token 验证中间件
3. 实现登出功能
4. 编写集成测试

### Phase 4: 密码管理
1. 实现忘记密码功能
2. 实现密码重置功能
3. 集成邮件服务
4. 编写测试

### Phase 5: 安全加固
1. 实现账户锁定机制
2. 实现 rate limiting
3. 添加安全中间件（helmet, cors）
4. 安全审计

### Phase 6: 优化和文档
1. 性能优化（缓存、索引）
2. 错误处理完善
3. API 文档（OpenAPI/Swagger）
4. 部署文档

## 10. 验收标准

- [ ] 所有 API 端点正常工作
- [ ] 单元测试覆盖率 > 80%
- [ ] 集成测试通过
- [ ] 安全检查通过（OWASP Top 10）
- [ ] 性能测试达标（< 200ms）
- [ ] API 文档完整
- [ ] 代码审查通过
- [ ] 部署到测试环境成功

## 11. 参考资源

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
