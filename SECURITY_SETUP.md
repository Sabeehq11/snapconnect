# 🔒 SnapConnect Security Setup

## ⚠️ CRITICAL SECURITY ISSUE FOUND & FIXED

Your Supabase credentials were hardcoded and **ARE EXPOSED IN GIT HISTORY**. This guide will help you secure everything properly.

## 🚨 **IMMEDIATE ACTIONS REQUIRED:**

### 1. **Rotate Your Supabase Keys (URGENT!)**
Since your keys are in git history, they're compromised:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your SnapConnect project
3. Go to **Settings** → **API**
4. Click **"Reset API Key"** to generate new credentials
5. Copy the new URL and anon key

### 2. **Create Your .env File**
```bash
# In your project root, create .env file:
cp env.template .env
```

Then edit `.env` with your **NEW** credentials:
```env
SUPABASE_URL=https://your-new-project-url.supabase.co
SUPABASE_ANON_KEY=your_new_anon_key_here
```

### 3. **Clean Git History (CRITICAL)**
Your old credentials are in git history. Choose one option:

#### Option A: BFG Repo Cleaner (Recommended)
```bash
# Install BFG
winget install BFG-Repo-Cleaner

# Clean credentials from history
bfg --replace-text=replacements.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

Create `replacements.txt`:
```
YOUR-OLD-SUPABASE-URL=REMOVED-SUPABASE-URL
YOUR-OLD-SUPABASE-KEY=REMOVED-SUPABASE-KEY
```

#### Option B: git filter-repo
```bash
pip install git-filter-repo
git filter-repo --replace-text replacements.txt
```

#### Option C: Nuclear Option (Start Fresh)
If you want to be 100% sure:
1. Create a new repository
2. Copy your files (except .git folder)
3. Initialize new git repo
4. Commit with .env file excluded

## ✅ **SECURITY FIXES IMPLEMENTED:**

### **Code Changes:**
- ✅ **Removed hardcoded credentials** from `lib/supabase.js`
- ✅ **Added environment validation** - app won't start without .env
- ✅ **Created secure fallback system**
- ✅ **Added helpful error messages**

### **Git Security:**
- ✅ **Bulletproof .gitignore** - blocks all secret files
- ✅ **Environment template** - safe setup guide
- ✅ **Multiple security patterns** - prevents accidental commits

### **Project Structure:**
```
snapconnect/
├── .env                 # ❌ NEVER COMMIT (in .gitignore)
├── env.template         # ✅ Safe template to commit
├── .gitignore           # ✅ Bulletproof security rules
├── lib/supabase.js      # ✅ No hardcoded credentials
└── SECURITY_SETUP.md    # ✅ This guide
```

## 🧪 **Testing After Setup:**

1. **Create .env file** with new credentials
2. **Restart Expo**: `npx expo start --clear`
3. **App should start** with validation messages
4. **Test Supabase connection** - should show "✅ Configured"

## 🛡️ **Future Security Best Practices:**

### **DO:**
- ✅ Always use environment variables
- ✅ Add new secrets to .gitignore first
- ✅ Use different keys for development/production
- ✅ Rotate keys regularly
- ✅ Review git diffs before committing

### **DON'T:**
- ❌ Never hardcode API keys
- ❌ Never commit .env files
- ❌ Never share credentials in chat/email
- ❌ Never use production keys in development
- ❌ Never ignore security warnings

## 🚨 **If Keys Are Already Compromised:**

1. **Rotate immediately** in Supabase dashboard
2. **Check access logs** for suspicious activity
3. **Update security policies** if needed
4. **Monitor usage** for next few days
5. **Consider additional authentication** layers

## 🆘 **Emergency Contacts:**

If you suspect unauthorized access:
1. **Disable API keys** immediately in Supabase
2. **Change your Supabase account password**
3. **Enable 2FA** on your Supabase account
4. **Review all project access logs**

## ✅ **Verification Checklist:**

- [ ] New Supabase keys generated
- [ ] .env file created with new keys
- [ ] App starts without errors
- [ ] Git history cleaned (BFG/filter-repo)
- [ ] Old keys disabled in Supabase
- [ ] Team members notified of key rotation

Your app is now secure! 🔒 