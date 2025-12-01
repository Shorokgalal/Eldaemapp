#!/bin/bash

# Deploy Firestore Rules to Firebase
# Run this script to update your Firestore security rules

echo "🔥 Deploying Firestore Rules to Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI is not installed."
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null
then
    echo "❌ Not logged in to Firebase."
    echo "Run: firebase login"
    exit 1
fi

# Deploy rules
echo "Deploying firestore.rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
else
    echo "❌ Failed to deploy Firestore rules."
    exit 1
fi
