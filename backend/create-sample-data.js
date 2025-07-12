const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User.model');
const Tag = require('./models/Tag.model');
const Question = require('./models/Question.model');

const connectDB = require('./config/db');

async function createSampleData() {
    try {
        // Connect to database
        await connectDB();
        console.log('Connected to database');

        // Create sample user
        let sampleUser = await User.findOne({ username: 'sampleuser' });
        if (!sampleUser) {
            sampleUser = await User.create({
                username: 'sampleuser',
                email: 'sample@example.com',
                password: 'password123'
            });
            console.log('Created sample user:', sampleUser.username);
        } else {
            console.log('Sample user already exists:', sampleUser.username);
        }

        // Create sample tags
        const tagNames = ['javascript', 'react', 'nodejs', 'python', 'mongodb', 'typescript', 'nextjs'];
        const tags = [];
        for (const tagName of tagNames) {
            let tag = await Tag.findOne({ name: tagName });
            if (!tag) {
                tag = await Tag.create({ name: tagName });
                console.log('Created tag:', tag.name);
            } else {
                console.log('Tag already exists:', tag.name);
            }
            tags.push(tag._id);
        }

        // Check if questions already exist
        const existingQuestions = await Question.countDocuments();
        if (existingQuestions > 0) {
            console.log(`Found ${existingQuestions} existing questions`);
            return;
        }

        // Create sample questions
        const sampleQuestions = [
            {
                title: 'How to use React hooks effectively?',
                description: 'I\'m new to React and want to understand how to use hooks like useState and useEffect properly. Can someone explain with examples? I\'ve been trying to understand the dependency array but it\'s confusing.',
                author: sampleUser._id,
                tags: [tags[1]], // react
                views: 150,
                votes: 5
            },
            {
                title: 'MongoDB connection issues in Node.js',
                description: 'I\'m having trouble connecting to MongoDB from my Node.js application. The connection keeps timing out. Here\'s my code: mongoose.connect(uri). What am I doing wrong?',
                author: sampleUser._id,
                tags: [tags[2], tags[4]], // nodejs, mongodb
                views: 89,
                votes: 3
            },
            {
                title: 'JavaScript async/await best practices',
                description: 'What are the best practices for using async/await in JavaScript? I want to avoid common pitfalls and write clean code. Should I always use try-catch?',
                author: sampleUser._id,
                tags: [tags[0]], // javascript
                views: 234,
                votes: 8
            },
            {
                title: 'Python list comprehension vs for loops',
                description: 'When should I use list comprehension vs traditional for loops in Python? Which is more readable and performant? I\'m working on a data processing project.',
                author: sampleUser._id,
                tags: [tags[3]], // python
                views: 67,
                votes: 2
            },
            {
                title: 'TypeScript interface vs type',
                description: 'What\'s the difference between TypeScript interfaces and types? When should I use one over the other? I\'m confused about the syntax.',
                author: sampleUser._id,
                tags: [tags[5]], // typescript
                views: 120,
                votes: 6
            },
            {
                title: 'Next.js routing best practices',
                description: 'I\'m building a Next.js app and want to understand the best practices for routing. Should I use the app router or pages router? What about dynamic routes?',
                author: sampleUser._id,
                tags: [tags[6], tags[1]], // nextjs, react
                views: 95,
                votes: 4
            },
            {
                title: 'Error handling in async functions',
                description: 'How do I properly handle errors in async functions? I keep getting unhandled promise rejections. What\'s the best way to structure error handling?',
                author: sampleUser._id,
                tags: [tags[0], tags[2]], // javascript, nodejs
                views: 180,
                votes: 7
            }
        ];

        const createdQuestions = await Question.create(sampleQuestions);
        console.log(`Created ${createdQuestions.length} sample questions`);

        console.log('Sample data creation completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating sample data:', error);
        process.exit(1);
    }
}

createSampleData(); 