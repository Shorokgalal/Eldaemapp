#!/bin/bash

# Migration Script for Voting System Updates
# This script helps migrate existing Firestore data to the new schema

echo "🚀 Eldaem App - Voting System Migration"
echo "========================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "📦 Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase."
    echo "🔑 Please run: firebase login"
    exit 1
fi

echo "✅ Logged in to Firebase"
echo ""

# Get current project
PROJECT=$(firebase use | grep "active project" | awk '{print $4}')
echo "📁 Current project: $PROJECT"
echo ""

echo "⚠️  MIGRATION STEPS REQUIRED"
echo "============================="
echo ""
echo "This migration requires manual steps in Firebase Console:"
echo ""
echo "1️⃣  UPDATE SUBSCRIPTIONS COLLECTION"
echo "   Go to: https://console.firebase.google.com/project/$PROJECT/firestore"
echo "   For each document in 'subscriptions' collection:"
echo "   - Add field: currentCycle = 1"
echo "   - Add field: cycleStartDate = [copy from joinedAt]"
echo ""
echo "2️⃣  UPDATE VOTES COLLECTION"
echo "   For each document in 'votes' collection:"
echo "   - Add field: cycleNumber = 1"
echo "   - Add field: subscriptionId = [find matching subscription]"
echo "   - Add field: hasReflection = false (or true if reflection exists)"
echo ""
echo "3️⃣  UPDATE FIRESTORE RULES"
echo "   Add this rule for renewals collection:"
echo ""
echo "   match /renewals/{renewalId} {"
echo "     allow read: if isAuthenticated();"
echo "     allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;"
echo "     allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;"
echo "   }"
echo ""
echo "4️⃣  DEPLOY UPDATED RULES"
echo "   Run: firebase deploy --only firestore:rules"
echo ""

read -p "Have you completed all the manual steps above? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled. Please complete the steps and run this script again."
    exit 1
fi

echo ""
echo "🎯 Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "1. Test joining a new goal"
    echo "2. Test voting on an existing goal"
    echo "3. Test reflection submission"
    echo "4. Verify 30-day cycle logic"
    echo ""
    echo "🎉 Your voting system is now updated!"
else
    echo ""
    echo "❌ Rule deployment failed. Please check the error above."
    exit 1
fi
