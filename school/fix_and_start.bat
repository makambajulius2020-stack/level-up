#!/bin/bash
# Quick fix script for Smart School App

echo "🔧 Fixing Smart School App Issues..."

# Navigate to project directory
cd "C:\Users\MARY\Desktop\school\school"

# Clear any cached files
echo "🧹 Clearing cache..."
rm -rf node_modules/.vite
rm -rf dist

# Install dependencies if needed
echo "📦 Checking dependencies..."
npm install

# Start the development server
echo "🚀 Starting development server..."
npm start

