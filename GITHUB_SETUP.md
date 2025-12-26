# How to Push Code to GitHub

## Step-by-Step Guide

### 1. Initialize Git Repository

```bash
# Navigate to project root
cd C:\Users\ASUS\Desktop\foodie

# Initialize git repository
git init
```

### 2. Add All Files

```bash
# Add all files (except those in .gitignore)
git add .
```

### 3. Create Initial Commit

```bash
# Create your first commit
git commit -m "Initial commit: MERN stack food delivery app"
```

### 4. Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `foodie` (or any name you prefer)
4. Description: `Food Delivery Website using MERN Stack`
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

### 5. Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/foodie.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/foodie.git
```

### 6. Push to GitHub

```bash
# Rename default branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

### 7. Verify

Go to your GitHub repository page and verify all files are uploaded.

## Important Notes

### ✅ Files That Will Be Pushed:
- All source code (backend/, frontend/)
- Configuration files (package.json, etc.)
- Documentation (README.md, etc.)
- .gitignore files

### ❌ Files That Will NOT Be Pushed (Protected by .gitignore):
- `node_modules/` - Dependencies (too large, install with npm)
- `.env` - Environment variables (contains secrets!)
- `build/` - Build outputs
- Log files

## Quick Commands Summary

```bash
# Initialize
git init
git add .
git commit -m "Initial commit: MERN stack food delivery app"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/foodie.git
git branch -M main
git push -u origin main
```

## Future Updates

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

## Troubleshooting

### If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/foodie.git
```

### If you get authentication errors:
- Use GitHub Personal Access Token instead of password
- Or set up SSH keys

### To check what will be committed:
```bash
git status
```

## Security Reminder

⚠️ **NEVER commit .env files!** They contain:
- JWT_SECRET
- MongoDB connection strings
- API keys

The `.gitignore` file is already configured to exclude these.

