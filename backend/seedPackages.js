require('dotenv').config();
const mongoose = require('mongoose');
const Package = require('./models/Package');
const Service = require('./models/Service');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      console.error('No admin user found!');
      process.exit(1);
    }

    let tourService = await Service.findOne({ title: /tour packages/i });
    if (!tourService) {
      tourService = await Service.findOne();
    }

    const count = await Package.countDocuments();
    if (count > 0) {
      console.log(`Packages already exist (${count} items). Skipping re-seed.`);
      process.exit(0);
    }

    const packages = [
      {
        customId: 'PKG202600001',
        serviceCategory: tourService._id,
        service: tourService._id,
        vendor: admin._id,
        createdBy: admin._id,
        packageName: '4D/3N Kerala Grand Explorer (Kochi - Munnar - Alleppey)',
        title: 'Kerala Grand Explorer — Hills & Backwaters',
        packageDescription: 'Explore God\'s Own Country from the colonial spice port of Fort Kochi to the emerald tea plantations of Munnar and tranquil Alleppey houseboat cruise.',
        description: 'Explore God\'s Own Country from the colonial spice port of Fort Kochi to the emerald tea plantations of Munnar and tranquil Alleppey houseboat cruise.',
        duration: '4 Days / 3 Nights',
        price: 14999,
        originalPrice: 19999,
        discountPrice: 14999,
        priceType: 'Per Person',
        currency: 'INR',
        location: 'Kerala, India',
        destination: 'Kerala',
        isFeatured: true,
        isActive: true,
        status: 'Active',
        badge: 'Best Seller',
        images: [
          'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80'
        ],
        itinerary: [
          {
            day: 1,
            title: 'Kochi Arrival & Colonial Spice Heritage',
            description: 'Visit Chinese fishing nets, Mattancherry Dutch Palace, and Jew Town sunset promenade.',
            meals: 'Dinner Included',
            stay: 'Heritage Boutique Resort, Fort Kochi',
            activities: ['Chinese Fishing Nets', 'Spice Market Walk']
          },
          {
            day: 2,
            title: 'Scenic Drive to Munnar Tea Valleys',
            description: 'Ascend through Cheeyappara waterfalls to high-altitude tea plantations.',
            meals: 'Breakfast & Dinner',
            stay: 'Tea Valley Resort, Munnar',
            activities: ['Cheeyappara Falls', 'Tea Garden Walk']
          },
          {
            day: 3,
            title: 'Munnar Sightseeing & Wildlife Sanctuary',
            description: 'Explore Eravikulam National Park to spot Nilgiri Tahr and visit KDHP Tea Museum.',
            meals: 'Breakfast & Dinner',
            stay: 'Fog Mist Hillside Villa, Munnar',
            activities: ['Eravikulam Safari', 'Tea Museum Tasting']
          },
          {
            day: 4,
            title: 'Alleppey Backwater Private Houseboat',
            description: 'Cruise emerald backwaters of Vembanad lake on a luxury traditional houseboat with traditional Kerala cuisine.',
            meals: 'Breakfast, Lunch & Dinner',
            stay: 'Luxury Houseboat, Alleppey',
            activities: ['Backwater Cruise', 'Village Sunset Canoeing']
          }
        ]
      },
      {
        customId: 'PKG202600002',
        serviceCategory: tourService._id,
        service: tourService._id,
        vendor: admin._id,
        createdBy: admin._id,
        packageName: '3D/2N Munnar Mist & Tea Hills Escape',
        title: 'Munnar Mist & Tea Hills Escape',
        packageDescription: 'A refreshing mountain retreat visiting Mattupetty Dam, Top Station panorama, Eravikulam National Park, and luxury treehouse resorts.',
        description: 'A refreshing mountain retreat visiting Mattupetty Dam, Top Station panorama, Eravikulam National Park, and luxury treehouse resorts.',
        duration: '3 Days / 2 Nights',
        price: 11499,
        originalPrice: 15499,
        discountPrice: 11499,
        priceType: 'Per Person',
        currency: 'INR',
        location: 'Munnar, Kerala, India',
        destination: 'Munnar',
        isFeatured: true,
        isActive: true,
        status: 'Active',
        badge: 'Top Rated',
        images: [
          'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80'
        ],
        itinerary: [
          {
            day: 1,
            title: 'Munnar Arrival & Blossom Park',
            description: 'Check in to hillside resort, visit Blossom International Park and Munnar market.',
            meals: 'Dinner',
            stay: 'Tea Valley Resort',
            activities: ['Blossom Park', 'Spice Trail Walk']
          },
          {
            day: 2,
            title: 'Eravikulam National Park & Tea Museum',
            description: 'Morning safari in Rajamalai followed by aromatic tea factory tour.',
            meals: 'Breakfast & Dinner',
            stay: 'Tea Valley Resort',
            activities: ['Eravikulam Safari', 'KDHP Tea Museum']
          },
          {
            day: 3,
            title: 'Mattupetty Dam & Top Station',
            description: 'Speedboating at Mattupetty dam, Echo Point, and clouds vista at Top Station.',
            meals: 'Breakfast',
            stay: 'Check-out',
            activities: ['Speedboating', 'Top Station Trek']
          }
        ]
      },
      {
        customId: 'PKG202600003',
        serviceCategory: tourService._id,
        service: tourService._id,
        vendor: admin._id,
        createdBy: admin._id,
        packageName: '3D/2N Alleppey Luxury Backwater & Beach Cruise',
        title: 'Alleppey Luxury Backwater & Beach Cruise',
        packageDescription: 'Experience the Venice of the East with an overnight stay on a private deluxe houseboat followed by serene Marari beach relaxation.',
        description: 'Experience the Venice of the East with an overnight stay on a private deluxe houseboat followed by serene Marari beach relaxation.',
        duration: '3 Days / 2 Nights',
        price: 12999,
        originalPrice: 16999,
        discountPrice: 12999,
        priceType: 'Per Person',
        currency: 'INR',
        location: 'Alleppey, Kerala, India',
        destination: 'Alleppey',
        isFeatured: true,
        isActive: true,
        status: 'Active',
        badge: 'Romantic',
        images: [
          'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80'
        ],
        itinerary: [
          {
            day: 1,
            title: 'Houseboat Check-in & Backwater Cruise',
            description: 'Traditional welcome aboard luxury Kettuvallam with fresh Kerala fish fry lunch.',
            meals: 'Lunch & Dinner',
            stay: 'Private Deluxe Houseboat',
            activities: ['Backwater Cruising', 'Village Walk']
          },
          {
            day: 2,
            title: 'Marari Beach Relaxation & Sunset',
            description: 'Disembark at Alleppey jetty, drive to serene Marari beach for coconut groves and golden sands.',
            meals: 'Breakfast & Dinner',
            stay: 'Marari Beachfront Eco Resort',
            activities: ['Beach Walk', 'Ayurvedic Massage']
          },
          {
            day: 3,
            title: 'Alleppey Lighthouse & Departure',
            description: 'Visit historic 1862 Alleppey Lighthouse and coir craft village before departure.',
            meals: 'Breakfast',
            stay: 'Check-out',
            activities: ['Lighthouse Climb', 'Coir Making Tour']
          }
        ]
      },
      {
        customId: 'PKG202600004',
        serviceCategory: tourService._id,
        service: tourService._id,
        vendor: admin._id,
        createdBy: admin._id,
        packageName: '4D/3N Wayanad Rainforest, Treehouses & Safari',
        title: 'Wayanad Rainforest & Wildlife Sanctuary',
        packageDescription: 'Lush spice plantations, Banasura Sagar dam speedboating, prehistoric Edakkal caves, and luxury treehouse stay amidst misty rainforest canopy.',
        description: 'Lush spice plantations, Banasura Sagar dam speedboating, prehistoric Edakkal caves, and luxury treehouse stay amidst misty rainforest canopy.',
        duration: '4 Days / 3 Nights',
        price: 13999,
        originalPrice: 17999,
        discountPrice: 13999,
        priceType: 'Per Person',
        currency: 'INR',
        location: 'Wayanad, Kerala, India',
        destination: 'Wayanad',
        isFeatured: true,
        isActive: true,
        status: 'Active',
        badge: 'Adventure',
        images: [
          'https://images.unsplash.com/photo-1609946782782-b7e1b93f18e9?auto=format&fit=crop&w=1200&q=80'
        ],
        itinerary: [
          {
            day: 1,
            title: 'Arrival & Treehouse Check-in',
            description: 'Drive through Thamarassery ghat pass to canopy treehouse resort in Vythiri.',
            meals: 'Dinner',
            stay: 'Vythiri Rainforest Treehouse',
            activities: ['Canopy Walk', 'Plantation Tour']
          },
          {
            day: 2,
            title: 'Banasura Sagar Dam & Karlad Lake',
            description: 'Asia\'s largest earthen dam with islands speedboating and ziplining.',
            meals: 'Breakfast & Dinner',
            stay: 'Vythiri Rainforest Treehouse',
            activities: ['Speedboating', 'Zipline Adventure']
          },
          {
            day: 3,
            title: 'Edakkal Caves & Soochipara Falls',
            description: 'Neolithic petroglyph cave trek and swim at cascading three-tiered Soochipara falls.',
            meals: 'Breakfast & Dinner',
            stay: 'Boutique Coffee Estate Villa',
            activities: ['Cave Petroglyphs', 'Waterfall Trek']
          },
          {
            day: 4,
            title: 'Muthanga Wildlife Sanctuary Safari',
            description: 'Early morning forest jeep safari spotting wild elephants, deer, and exotic hornbills.',
            meals: 'Breakfast',
            stay: 'Check-out',
            activities: ['Wildlife Jeep Safari']
          }
        ]
      }
    ];

    await Package.insertMany(packages);
    console.log(`Successfully seeded ${packages.length} tour packages into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
