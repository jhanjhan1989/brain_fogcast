# GitHub Authentication Setup

You're getting permission denied because your SSH key isn't configured. Here are two ways to fix it:

---

## Option 1: Use HTTPS with Personal Access Token (Easiest)

### Step 1: Change remote to HTTPS
```bash
git remote set-url origin https://github.com/jhanjhan1989/brain_fogcast.git
```

### Step 2: Create Personal Access Token
1. Go to GitHub → Settings → Developer settings
2. Click "Personal access tokens" → "Tokens (classic)"
3. Click "Generate new token (classic)"
4. Give it a name like "brain_fogcast_deploy"
5. Check the "repo" scope (full control of private repositories)
6. Click "Generate token"
7. **COPY THE TOKEN** (you won't see it again!)

### Step 3: Push with token
```bash
git push
```
When prompted:
- Username: `jhanjhan1989`
- Password: paste your token (not your GitHub password!)

---

## Option 2: Set Up SSH Key (More Secure)

### Step 1: Generate SSH key
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
Press Enter 3 times (default location, no passphrase)

### Step 2: Copy your public key
```bash
type ~/.ssh/id_ed25519.pub
```
Copy the entire output (starts with `ssh-ed25519`)

### Step 3: Add to GitHub
1. Go to GitHub → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Title: "My Computer"
4. Paste the key
5. Click "Add SSH key"

### Step 4: Test it
```bash
ssh -T git@github.com
```
Should say: "Hi jhanjhan1989! You've successfully authenticated..."

### Step 5: Push
```bash
git push
```

---

## Quick Fix Commands

If you want to use HTTPS right now:
```bash
git remote set-url origin https://github.com/jhanjhan1989/brain_fogcast.git
git push
```
Then use your Personal Access Token as the password.

---

## After Authentication Works

Once you can push, continue with deployment:
1. Push your code: `git push`
2. Deploy backend on Railway
3. Deploy frontend on Vercel

See DEPLOYMENT_GUIDE.md for full deployment instructions.
