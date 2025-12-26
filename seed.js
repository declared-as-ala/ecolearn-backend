const mongoose = require('mongoose');
require('dotenv').config();

const Lesson = require('./models/Lesson');
const Game = require('./models/Game');

// Sample Lessons
const lessons = [
  {
    title: "Introduction to Recycling",
    description: "Learn the basics of recycling and why it's important for our planet",
    content: `
      <h2>What is Recycling?</h2>
      <p>Recycling is the process of converting waste materials into new materials and objects. It helps reduce the consumption of fresh raw materials, energy usage, air pollution, and water pollution.</p>
      
      <h3>Why Recycle?</h3>
      <ul>
        <li>Reduces waste in landfills</li>
        <li>Conserves natural resources</li>
        <li>Saves energy</li>
        <li>Protects wildlife</li>
        <li>Reduces pollution</li>
      </ul>
      
      <h3>What Can Be Recycled?</h3>
      <p>Common recyclable materials include:</p>
      <ul>
        <li>Paper and cardboard</li>
        <li>Plastic bottles and containers</li>
        <li>Glass bottles and jars</li>
        <li>Metal cans</li>
        <li>Electronics</li>
      </ul>
      
      <h3>How to Start Recycling</h3>
      <p>Start by setting up separate bins for different materials at home. Make sure to clean items before recycling them!</p>
    `,
    videoUrl: "https://www.youtube.com/embed/BxKfpt70rLI",
    category: "recycling",
    difficulty: "beginner",
    duration: 10,
    points: 20,
    order: 1,
    isActive: true
  },
  {
    title: "Water Conservation",
    description: "Discover ways to save water and protect this precious resource",
    content: `
      <h2>Why Save Water?</h2>
      <p>Water is essential for all life on Earth. Even though 70% of our planet is covered in water, only 1% is fresh water that we can use!</p>
      
      <h3>Simple Ways to Save Water</h3>
      <ul>
        <li>Turn off the tap while brushing your teeth</li>
        <li>Take shorter showers</li>
        <li>Fix leaky faucets</li>
        <li>Use a bucket instead of a hose to wash the car</li>
        <li>Collect rainwater for plants</li>
      </ul>
      
      <h3>Water Facts</h3>
      <ul>
        <li>A dripping faucet can waste 3,000 gallons per year</li>
        <li>Taking a 5-minute shower uses about 10-25 gallons</li>
        <li>Washing dishes by hand uses more water than a dishwasher</li>
      </ul>
      
      <h3>Your Impact</h3>
      <p>Every drop counts! By saving water, you're helping ensure there's enough for everyone, including plants and animals.</p>
    `,
    videoUrl: "https://www.youtube.com/embed/oW-iuvNn3g4",
    category: "water",
    difficulty: "beginner",
    duration: 12,
    points: 20,
    order: 2,
    isActive: true
  },
  {
    title: "Renewable Energy",
    description: "Learn about solar, wind, and other clean energy sources",
    content: `
      <h2>What is Renewable Energy?</h2>
      <p>Renewable energy comes from natural sources that are constantly replenished, like sunlight, wind, and water. Unlike fossil fuels, renewable energy doesn't run out!</p>
      
      <h3>Types of Renewable Energy</h3>
      <ul>
        <li><strong>Solar Energy:</strong> Energy from the sun, captured using solar panels</li>
        <li><strong>Wind Energy:</strong> Energy from wind, captured using wind turbines</li>
        <li><strong>Hydroelectric Energy:</strong> Energy from flowing water</li>
        <li><strong>Geothermal Energy:</strong> Energy from heat inside the Earth</li>
      </ul>
      
      <h3>Why Renewable Energy?</h3>
      <ul>
        <li>Doesn't pollute the air</li>
        <li>Reduces greenhouse gases</li>
        <li>Creates jobs</li>
        <li>Never runs out</li>
      </ul>
      
      <h3>What You Can Do</h3>
      <p>Even as a kid, you can help! Turn off lights when not needed, use natural light during the day, and encourage your family to use energy-efficient appliances.</p>
    `,
    videoUrl: "https://www.youtube.com/embed/1kUE0BZtTRc",
    category: "energy",
    difficulty: "intermediate",
    duration: 15,
    points: 30,
    order: 3,
    isActive: true
  },
  {
    title: "Protecting Biodiversity",
    description: "Understand the importance of protecting different species and ecosystems",
    content: `
      <h2>What is Biodiversity?</h2>
      <p>Biodiversity means the variety of life on Earth - all the different plants, animals, and microorganisms that make up our natural world.</p>
      
      <h3>Why is Biodiversity Important?</h3>
      <ul>
        <li>Each species has a role in the ecosystem</li>
        <li>Biodiversity provides us with food, medicine, and materials</li>
        <li>Healthy ecosystems clean our air and water</li>
        <li>Biodiversity makes our planet beautiful and interesting</li>
      </ul>
      
      <h3>Threats to Biodiversity</h3>
      <ul>
        <li>Habitat destruction</li>
        <li>Pollution</li>
        <li>Climate change</li>
        <li>Overhunting and overfishing</li>
      </ul>
      
      <h3>How to Help</h3>
      <ul>
        <li>Plant native flowers and trees</li>
        <li>Create a bird feeder</li>
        <li>Reduce, reuse, and recycle</li>
        <li>Learn about local wildlife</li>
        <li>Support conservation efforts</li>
      </ul>
    `,
    videoUrl: "https://www.youtube.com/embed/GK_vRtHJZu4",
    category: "biodiversity",
    difficulty: "intermediate",
    duration: 14,
    points: 30,
    order: 4,
    isActive: true
  },
  {
    title: "Climate Change Basics",
    description: "Learn what climate change is and how we can help fight it",
    content: `
      <h2>What is Climate Change?</h2>
      <p>Climate change refers to long-term changes in temperature and weather patterns. While climate change is natural, human activities have accelerated it significantly.</p>
      
      <h3>Causes of Climate Change</h3>
      <ul>
        <li>Burning fossil fuels (coal, oil, gas)</li>
        <li>Deforestation</li>
        <li>Industrial activities</li>
        <li>Agriculture</li>
      </ul>
      
      <h3>Effects of Climate Change</h3>
      <ul>
        <li>Rising temperatures</li>
        <li>Melting ice caps</li>
        <li>Rising sea levels</li>
        <li>Extreme weather events</li>
        <li>Changes in animal habitats</li>
      </ul>
      
      <h3>What Can We Do?</h3>
      <ul>
        <li>Walk or bike instead of driving</li>
        <li>Plant trees</li>
        <li>Use less electricity</li>
        <li>Eat more plant-based foods</li>
        <li>Spread awareness</li>
      </ul>
      
      <h3>Remember</h3>
      <p>Every small action counts! Together, we can make a big difference for our planet.</p>
    `,
    videoUrl: "https://www.youtube.com/embed/G4H1N_yXBiA",
    category: "climate",
    difficulty: "intermediate",
    duration: 16,
    points: 30,
    order: 5,
    isActive: true
  }
];

// Sample Games
const games = [
  {
    title: "Recycling Quiz",
    description: "Test your knowledge about recycling!",
    type: "quiz",
    category: "recycling",
    difficulty: "beginner",
    gameData: {
      questions: [
        {
          question: "Which of these items can be recycled?",
          options: ["Plastic bottle", "Used tissue", "Food scraps", "Broken glass"],
          correctAnswer: 0,
          explanation: "Plastic bottles can be recycled! Make sure to rinse them first."
        },
        {
          question: "What should you do before recycling a container?",
          options: ["Throw it away", "Rinse it clean", "Break it", "Nothing"],
          correctAnswer: 1,
          explanation: "Always rinse containers before recycling to prevent contamination."
        },
        {
          question: "How many times can glass be recycled?",
          options: ["Once", "Twice", "Unlimited times", "Never"],
          correctAnswer: 2,
          explanation: "Glass can be recycled unlimited times without losing quality!"
        },
        {
          question: "Which material takes the longest to decompose in a landfill?",
          options: ["Paper", "Plastic", "Food", "Glass"],
          correctAnswer: 1,
          explanation: "Plastic can take up to 1000 years to decompose, which is why recycling is so important!"
        },
        {
          question: "What is the recycling symbol called?",
          options: ["Recycle mark", "Mobius loop", "Green arrow", "Eco sign"],
          correctAnswer: 1,
          explanation: "The three arrows in a triangle is called the Mobius loop, the universal recycling symbol."
        }
      ]
    },
    points: 25,
    timeLimit: 0,
    isActive: true
  },
  {
    title: "Sort the Waste",
    description: "Drag and drop items into the correct recycling bins",
    type: "dragdrop",
    category: "recycling",
    difficulty: "beginner",
    gameData: {
      items: [
        { id: "1", label: "Plastic Bottle", category: "Recyclable" },
        { id: "2", label: "Banana Peel", category: "Compost" },
        { id: "3", label: "Glass Jar", category: "Recyclable" },
        { id: "4", label: "Newspaper", category: "Recyclable" },
        { id: "5", label: "Battery", category: "Hazardous" },
        { id: "6", label: "Aluminum Can", category: "Recyclable" },
        { id: "7", label: "Used Tissue", category: "Trash" },
        { id: "8", label: "Cardboard Box", category: "Recyclable" }
      ]
    },
    points: 30,
    timeLimit: 0,
    isActive: true
  },
  {
    title: "Water Saving Memory",
    description: "Match water-saving tips with their benefits",
    type: "memory",
    category: "water",
    difficulty: "beginner",
    gameData: {
      cards: [
        { id: "1", content: "Turn off tap", pair: "Saves 3 gallons" },
        { id: "2", content: "Saves 3 gallons", pair: "Turn off tap" },
        { id: "3", content: "Shorter showers", pair: "Saves 10 gallons" },
        { id: "4", content: "Saves 10 gallons", pair: "Shorter showers" },
        { id: "5", content: "Fix leaks", pair: "Saves 3,000 gallons/year" },
        { id: "6", content: "Saves 3,000 gallons/year", pair: "Fix leaks" },
        { id: "7", content: "Rainwater collection", pair: "Free water for plants" },
        { id: "8", content: "Free water for plants", pair: "Rainwater collection" }
      ]
    },
    points: 25,
    timeLimit: 0,
    isActive: true
  },
  {
    title: "Energy Choice Scenario",
    description: "Make the right choices to save energy!",
    type: "scenario",
    category: "energy",
    difficulty: "intermediate",
    gameData: {
      scenario: "You're getting ready for school in the morning. Your room has natural light coming through the window, but you also have a lamp on. What should you do?",
      choices: [
        {
          id: "1",
          text: "Turn off the lamp and use natural light",
          impact: 10,
          explanation: "Great choice! Using natural light saves electricity and is better for the environment."
        },
        {
          id: "2",
          text: "Keep both the lamp and natural light",
          impact: -5,
          explanation: "Using both wastes energy. Natural light is free and better for you!"
        },
        {
          id: "3",
          text: "Close the curtains and use only the lamp",
          impact: -10,
          explanation: "This wastes the most energy. Always use natural light when available!"
        }
      ]
    },
    points: 30,
    timeLimit: 0,
    isActive: true
  },
  {
    title: "Eco Challenge",
    description: "Complete these environmental challenges!",
    type: "challenge",
    category: "general",
    difficulty: "beginner",
    gameData: {
      challenge: "Complete these eco-friendly tasks this week:",
      tasks: [
        {
          id: "1",
          description: "Turn off all lights when leaving a room",
          points: 10
        },
        {
          id: "2",
          description: "Collect 5 plastic bottles for recycling",
          points: 15
        },
        {
          id: "3",
          description: "Take a 5-minute shorter shower",
          points: 10
        },
        {
          id: "4",
          description: "Plant a seed or care for a plant",
          points: 20
        },
        {
          id: "5",
          description: "Walk or bike instead of using a car",
          points: 15
        }
      ]
    },
    points: 40,
    timeLimit: 0,
    isActive: true
  },
  {
    title: "Climate Change Quiz",
    description: "Test your knowledge about climate change",
    type: "quiz",
    category: "climate",
    difficulty: "intermediate",
    gameData: {
      questions: [
        {
          question: "What is the main cause of climate change?",
          options: ["Natural cycles", "Human activities", "Animals", "Plants"],
          correctAnswer: 1,
          explanation: "While climate change is natural, human activities like burning fossil fuels have accelerated it significantly."
        },
        {
          question: "What can we do to reduce climate change?",
          options: ["Use more cars", "Plant trees", "Waste more energy", "Nothing"],
          correctAnswer: 1,
          explanation: "Planting trees helps absorb carbon dioxide from the atmosphere, fighting climate change!"
        },
        {
          question: "What happens when ice caps melt?",
          options: ["Nothing", "Sea levels rise", "It gets colder", "More ice forms"],
          correctAnswer: 1,
          explanation: "When ice caps melt, they add water to the oceans, causing sea levels to rise."
        },
        {
          question: "Which transportation method is best for the environment?",
          options: ["Car", "Bike", "Airplane", "All the same"],
          correctAnswer: 1,
          explanation: "Biking produces zero emissions and is great exercise too!"
        }
      ]
    },
    points: 30,
    timeLimit: 0,
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecolearn';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    await Lesson.deleteMany({});
    await Game.deleteMany({});
    console.log('Cleared existing lessons and games');

    // Insert lessons
    const insertedLessons = await Lesson.insertMany(lessons);
    console.log(`✅ Inserted ${insertedLessons.length} lessons`);

    // Insert games
    const insertedGames = await Game.insertMany(games);
    console.log(`✅ Inserted ${insertedGames.length} games`);

    console.log('\n🎉 Database seeded successfully!');
    console.log(`\nLessons created:`);
    insertedLessons.forEach(lesson => {
      console.log(`  - ${lesson.title} (${lesson.category})`);
    });
    console.log(`\nGames created:`);
    insertedGames.forEach(game => {
      console.log(`  - ${game.title} (${game.type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();




