import { PrismaClient, Role, InquiryStatus, VerificationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing records in reverse dependency order
  await prisma.review.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.providerPhoto.deleteMany();
  await prisma.service.deleteMany();
  await prisma.providerCategory.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // 1. Seed Categories
  console.log('--> Seeding Categories...');
  const categoriesData = [
    { name: 'Electrician', icon: 'flash_on' },
    { name: 'Plumber', icon: 'plumbing' },
    { name: 'Tutor', icon: 'school' },
    { name: 'Mechanic', icon: 'build' },
    { name: 'Cleaner', icon: 'cleaning_services' },
    { name: 'AC Technician', icon: 'ac_unit' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories.push(created);
  }

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 2. Seed Admin User
  console.log('--> Seeding Admin...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      phone: '+8801700000000',
      email: 'admin@localconnect.com',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
  });

  // 3. Seed Buyer Users
  console.log('--> Seeding Buyers...');
  const buyersData = [
    { name: 'Rahim Chowdhury', phone: '+8801811111111', email: 'rahim@gmail.com' },
    { name: 'Sadia Islam', phone: '+8801822222222', email: 'sadia@gmail.com' },
    { name: 'Tanvir Hossain', phone: '+8801833333333', email: 'tanvir@gmail.com' },
    { name: 'Nusrat Jahan', phone: '+8801844444444', email: 'nusrat@gmail.com' },
    { name: 'Fahim Ahmed', phone: '+8801855555555', email: 'fahim@gmail.com' },
  ];

  const buyers = [];
  for (const b of buyersData) {
    const buyer = await prisma.user.create({
      data: {
        ...b,
        passwordHash: defaultPasswordHash,
        role: Role.BUYER,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(b.name)}`,
      },
    });
    buyers.push(buyer);
  }

  // 4. Seed Provider Users & Profiles
  console.log('--> Seeding Providers & Profiles...');
  const providersSeed = [
    {
      name: 'Karim Rahman',
      phone: '+8801911111111',
      email: 'karim.electric@gmail.com',
      businessName: 'Karim Electrical Solutions',
      description: 'Expert home and commercial electrician with over 8 years of experience. Quick response for emergency short circuits and wiring.',
      city: 'Dhaka',
      area: 'Gulshan',
      whatsapp: '+8801911111111',
      verificationStatus: VerificationStatus.VERIFIED,
      categoryName: 'Electrician',
      services: [
        { name: 'Full House Wiring Check', priceMin: 1500, priceMax: 3000, unit: 'per visit' },
        { name: 'Circuit Breaker Installation', priceMin: 500, priceMax: 1000, unit: 'per unit' },
        { name: 'Fan & Light Fitting', priceMin: 300, priceMax: 600, unit: 'per item' },
      ],
      photos: [
        { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80', isCover: true },
        { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80', isCover: false },
      ],
    },
    {
      name: 'Salam Plumbers',
      phone: '+8801922222222',
      email: 'salam.pipe@gmail.com',
      businessName: 'Salam Plumbing & Sanitary Works',
      description: 'Professional pipe leak repair, bathroom fitting installations, and water pump servicing across Dhanmondi.',
      city: 'Dhaka',
      area: 'Dhanmondi',
      whatsapp: '+8801922222222',
      verificationStatus: VerificationStatus.VERIFIED,
      categoryName: 'Plumber',
      services: [
        { name: 'Bathroom Tap Repair', priceMin: 400, priceMax: 800, unit: 'per fixture' },
        { name: 'Water Tank Cleaning', priceMin: 2000, priceMax: 4000, unit: 'per tank' },
      ],
      photos: [
        { url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80', isCover: true },
      ],
    },
    {
      name: 'Ayesha Siddiqua',
      phone: '+8801933333333',
      email: 'ayesha.tutor@gmail.com',
      businessName: 'Ayesha Academic Coaching (Math & Physics)',
      description: 'BUET graduate offering specialized Mathematics and Physics tutoring for Class 8 to HSC students.',
      city: 'Dhaka',
      area: 'Uttara',
      whatsapp: '+8801933333333',
      verificationStatus: VerificationStatus.VERIFIED,
      categoryName: 'Tutor',
      services: [
        { name: 'SSC Physics & Math Home Tutoring', priceMin: 8000, priceMax: 12000, unit: 'per month' },
        { name: 'HSC Higher Math Tutoring', priceMin: 10000, priceMax: 15000, unit: 'per month' },
      ],
      photos: [
        { url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80', isCover: true },
      ],
    },
    {
      name: 'Babul Auto Care',
      phone: '+8801944444444',
      email: 'babul.auto@gmail.com',
      businessName: 'Babul Motorbike & Auto Repair',
      description: 'Comprehensive motorbike tuning, brake overhaul, engine servicing, and emergency roadside help.',
      city: 'Dhaka',
      area: 'Mirpur',
      whatsapp: '+8801944444444',
      verificationStatus: VerificationStatus.PENDING,
      categoryName: 'Mechanic',
      services: [
        { name: 'Bike Full Engine Tuning', priceMin: 1200, priceMax: 2500, unit: 'per service' },
        { name: 'Oil & Filter Replacement', priceMin: 300, priceMax: 500, unit: 'per service' },
      ],
      photos: [
        { url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80', isCover: true },
      ],
    },
    {
      name: 'CleanHome BD',
      phone: '+8801955555555',
      email: 'cleanhome@gmail.com',
      businessName: 'CleanHome Professional Deep Cleaning',
      description: 'Sofa cleaning, carpet deep clean, kitchen degreasing, and full flat deep cleaning services.',
      city: 'Dhaka',
      area: 'Banani',
      whatsapp: '+8801955555555',
      verificationStatus: VerificationStatus.VERIFIED,
      categoryName: 'Cleaner',
      services: [
        { name: '3-Bedroom Flat Deep Cleaning', priceMin: 5000, priceMax: 9000, unit: 'per apartment' },
        { name: 'Sofa Set Shampoo Cleaning', priceMin: 1500, priceMax: 3000, unit: 'per set' },
      ],
      photos: [
        { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80', isCover: true },
      ],
    },
    {
      name: 'ChillPoint AC',
      phone: '+8801966666666',
      email: 'chillpoint@gmail.com',
      businessName: 'ChillPoint AC Servicing & Gas Refill',
      description: 'Master technicians for Split & Window AC jet wash, master servicing, leak detection, and Freon gas refill.',
      city: 'Chittagong',
      area: 'Agrabad',
      whatsapp: '+8801966666666',
      verificationStatus: VerificationStatus.VERIFIED,
      categoryName: 'AC Technician',
      services: [
        { name: 'AC Master Jet Wash', priceMin: 800, priceMax: 1200, unit: 'per AC unit' },
        { name: 'AC Gas Top Up (R410a/R22)', priceMin: 2000, priceMax: 3500, unit: 'per unit' },
      ],
      photos: [
        { url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80', isCover: true },
      ],
    },
    {
      name: 'Sylhet Tech Care',
      phone: '+8801977777777',
      email: 'sylhet.tech@gmail.com',
      businessName: 'Sylhet Home Electrical & AC Care',
      description: 'All-in-one electrical and cooling appliance repairs for residences and offices in Zindabazar.',
      city: 'Sylhet',
      area: 'Zindabazar',
      whatsapp: '+8801977777777',
      verificationStatus: VerificationStatus.UNVERIFIED,
      categoryName: 'Electrician',
      services: [
        { name: 'IPS Wiring & Setup', priceMin: 1500, priceMax: 3500, unit: 'per setup' },
      ],
      photos: [
        { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', isCover: true },
      ],
    },
  ];

  const providerProfiles = [];

  for (const prov of providersSeed) {
    const user = await prisma.user.create({
      data: {
        name: prov.name,
        phone: prov.phone,
        email: prov.email,
        passwordHash: defaultPasswordHash,
        role: Role.PROVIDER,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(prov.name)}`,
      },
    });

    const category = categories.find((c) => c.name === prov.categoryName) || categories[0];

    const profile = await prisma.providerProfile.create({
      data: {
        userId: user.id,
        businessName: prov.businessName,
        description: prov.description,
        city: prov.city,
        area: prov.area,
        whatsapp: prov.whatsapp,
        verificationStatus: prov.verificationStatus,
        categories: {
          create: [{ categoryId: category.id }],
        },
        services: {
          create: prov.services,
        },
        photos: {
          create: prov.photos,
        },
      },
    });

    providerProfiles.push(profile);
  }

  // 5. Seed Inquiries & Reviews
  console.log('--> Seeding Inquiries & Reviews...');

  // Inquiry 1: Completed with review
  const inq1 = await prisma.inquiry.create({
    data: {
      buyerId: buyers[0].id,
      providerId: providerProfiles[0].id, // Karim Electrical
      message: 'Hello Karim bhai, my main circuit breaker keeps tripping. Are you available today at 4 PM in Gulshan 2?',
      status: InquiryStatus.COMPLETED,
    },
  });

  const rev1 = await prisma.review.create({
    data: {
      inquiryId: inq1.id,
      buyerId: buyers[0].id,
      providerId: providerProfiles[0].id,
      rating: 5,
      comment: 'Excellent work! Karim arrived within 30 minutes and fixed the wiring fault quickly.',
    },
  });

  // Update provider rating stats
  await prisma.providerProfile.update({
    where: { id: providerProfiles[0].id },
    data: { ratingAvg: 5.0, ratingCount: 1 },
  });

  // Inquiry 2: Completed WITHOUT review (so review flow can be tested)
  await prisma.inquiry.create({
    data: {
      buyerId: buyers[1].id,
      providerId: providerProfiles[0].id,
      message: 'Need help installing 3 ceiling fans in our new apartment.',
      status: InquiryStatus.COMPLETED,
    },
  });

  // Inquiry 3: Pending
  await prisma.inquiry.create({
    data: {
      buyerId: buyers[1].id,
      providerId: providerProfiles[1].id, // Salam Plumbers
      message: 'Hi, our bathroom faucet is leaking heavily. Can someone come take a look tomorrow morning?',
      status: InquiryStatus.PENDING,
    },
  });

  // Inquiry 4: Accepted
  await prisma.inquiry.create({
    data: {
      buyerId: buyers[2].id,
      providerId: providerProfiles[2].id, // Ayesha Tutor
      message: 'Looking for a home tutor for my HSC examinee brother in Uttara sector 4.',
      status: InquiryStatus.ACCEPTED,
    },
  });

  // 6. Seed Favorites
  console.log('--> Seeding Favorites...');
  await prisma.favorite.create({
    data: {
      userId: buyers[0].id,
      providerId: providerProfiles[0].id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyers[0].id,
      providerId: providerProfiles[4].id,
    },
  });

  console.log('✅ Database seeding finished successfully!\n');
  console.log('=====================================================');
  console.log('🔑 SEEDED TEST CREDENTIALS FOR QUICK TESTING:');
  console.log('=====================================================');
  console.log('1. BUYER Account:');
  console.log('   Phone:    +8801811111111');
  console.log('   Password: password123');
  console.log('   Name:     Rahim Chowdhury');
  console.log('-----------------------------------------------------');
  console.log('2. PROVIDER Account:');
  console.log('   Phone:    +8801911111111');
  console.log('   Password: password123');
  console.log('   Business: Karim Electrical Solutions');
  console.log('-----------------------------------------------------');
  console.log('3. ADMIN Account:');
  console.log('   Phone:    +8801700000000');
  console.log('   Password: password123');
  console.log('=====================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
