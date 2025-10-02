# Secure Staff Portal Authentication

## 🔐 **Server-Side Authentication Implementation**

The staff portal now uses **server-side authentication** to keep passwords completely secure and out of client-side code.

## ✅ **Security Features**

### **Password Protection**
- ✅ **Server-side only**: Password never sent to browser
- ✅ **Environment variable**: Stored securely in `STAFF_PASSWORD`
- ✅ **Session-based**: Uses HTTP-only cookies for authentication
- ✅ **Automatic expiration**: Sessions expire after 8 hours
- ✅ **Secure cookies**: HttpOnly, Secure, SameSite=Strict

### **Authentication Flow**
1. **Login**: Password sent to `/api/staff-auth` (server-side verification)
2. **Session**: Server creates secure HTTP-only cookie
3. **Verification**: `/api/verify-session` checks cookie validity
4. **Logout**: Cookie cleared on logout

## 🚀 **Setup Instructions**

### **1. Environment Variables**

#### **Local Development (.env):**
```bash
STAFF_PASSWORD=YourSecurePassword123!
```

#### **Netlify Production:**
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add `STAFF_PASSWORD` with your secure password
3. Redeploy your site

### **2. Password Requirements**
- **Minimum 8 characters**
- **Mix of letters, numbers, symbols**
- **Different from development password**
- **Changed regularly**

## 🔒 **Security Benefits**

### **Before (Client-side):**
❌ Password visible in browser dev tools  
❌ Password in JavaScript source code  
❌ Anyone can inspect and find password  
❌ No session management  

### **After (Server-side):**
✅ Password never leaves server  
✅ Password not in client-side code  
✅ Secure session management  
✅ Automatic session expiration  
✅ HTTP-only cookies prevent XSS  

## 📋 **API Endpoints**

### **Authentication**
- **POST** `/api/staff-auth` - Login/logout
- **GET** `/api/verify-session` - Check session status

### **Ticket Management**
- **POST** `/api/verify-ticket` - Verify ticket code
- **POST** `/api/redeem-ticket` - Mark ticket as redeemed

## 🛡️ **Security Best Practices**

### **Password Management**
1. **Use strong passwords**: 12+ characters with mixed case, numbers, symbols
2. **Change regularly**: Update password every 3-6 months
3. **Different environments**: Use different passwords for dev/prod
4. **Don't share**: Never share passwords in code or documentation

### **Session Security**
1. **Automatic expiration**: Sessions expire after 8 hours
2. **Secure cookies**: HttpOnly prevents JavaScript access
3. **HTTPS only**: Secure flag ensures HTTPS transmission
4. **SameSite protection**: Prevents CSRF attacks

### **Production Deployment**
1. **Environment variables**: Store password in Netlify environment variables
2. **HTTPS required**: Ensure site uses HTTPS
3. **Monitor access**: Check logs for failed authentication attempts
4. **Regular updates**: Keep dependencies updated

## 🧪 **Testing Security**

### **Verify Password Security**
1. **Check dev tools**: Password should NOT be visible in JavaScript
2. **Check network**: Password sent to server, not stored client-side
3. **Test expiration**: Session should expire after 8 hours
4. **Test logout**: Cookie should be cleared on logout

### **Test Commands**
```bash
# Check environment variable is set
echo $STAFF_PASSWORD

# Test authentication API
curl -X POST https://your-site.com/api/staff-auth \
  -H "Content-Type: application/json" \
  -d '{"password":"your_password"}'
```

## 🚨 **Security Warnings**

### **What This Protects Against**
✅ **Casual inspection**: Users can't see password in dev tools  
✅ **Source code leaks**: Password not in client-side code  
✅ **Basic attacks**: Session-based authentication  
✅ **XSS attacks**: HttpOnly cookies prevent access  

### **What This Doesn't Protect Against**
⚠️ **Man-in-the-middle**: Use HTTPS in production  
⚠️ **Server compromise**: If server is compromised, password is exposed  
⚠️ **Brute force**: Consider rate limiting for production  
⚠️ **Social engineering**: Train staff on password security  

## 📊 **Security Level Assessment**

| Feature | Security Level | Notes |
|---------|---------------|-------|
| Password Storage | ✅ **High** | Server-side only |
| Session Management | ✅ **High** | HTTP-only cookies |
| Transport Security | ⚠️ **Medium** | Requires HTTPS |
| Brute Force Protection | ⚠️ **Low** | Consider rate limiting |
| Overall Security | ✅ **Good** | Suitable for small events |

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"Server configuration error"**
   - Check `STAFF_PASSWORD` environment variable is set
   - Verify variable name is exactly `STAFF_PASSWORD`

2. **Session not persisting**
   - Check browser allows cookies
   - Verify HTTPS is enabled in production
   - Check cookie settings in browser dev tools

3. **Authentication fails**
   - Verify password matches environment variable
   - Check for typos in password
   - Ensure environment variable is deployed

### **Debug Steps**
1. Check browser network tab for API calls
2. Verify environment variables in Netlify dashboard
3. Check server logs for authentication errors
4. Test with curl commands

---

## 🎯 **Quick Setup Checklist**

- [ ] Set `STAFF_PASSWORD` in `.env` file
- [ ] Add `STAFF_PASSWORD` to Netlify environment variables
- [ ] Deploy to production
- [ ] Test login functionality
- [ ] Verify password not visible in dev tools
- [ ] Test session expiration
- [ ] Train staff on new authentication

Your staff portal is now properly secured! 🔐
