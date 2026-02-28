import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');

const sampleProjects = [
  {
    id: uuidv4(),
    title: "Futuristic City Animation",
    category: "3D Animation",
    description: "A stunning cinematic journey through a futuristic metropolis, showcasing advanced architectural design and dynamic camera movements.",
    challenge: "Creating a believable futuristic cityscape with intricate details while maintaining performance and visual clarity.",
    solution: "Utilized modular architecture, optimized LOD systems, and strategic lighting to create depth while keeping render times manageable.",
    tools: ["Blender", "After Effects", "Unreal Engine", "DaVinci Resolve"],
    thumbnailUrl: "",
    previewVideoUrl: "",
    fullVideoUrl: "https://vimeo.com/123456789",
    featured: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: "Product Launch Motion Graphics",
    category: "Motion",
    description: "Dynamic motion graphics for a tech product launch, featuring sleek animations and modern typography.",
    challenge: "Creating engaging motion graphics that highlight product features while maintaining brand consistency.",
    solution: "Developed a cohesive visual language with smooth transitions, kinetic typography, and strategic use of color and timing.",
    tools: ["Cinema 4D", "After Effects", "Illustrator"],
    thumbnailUrl: "",
    previewVideoUrl: "",
    fullVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    featured: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: "Brand Identity Animation",
    category: "Branding",
    description: "Animated brand identity package including logo reveals, typography animations, and brand guidelines.",
    challenge: "Translating static brand elements into dynamic, engaging animations that maintain brand integrity.",
    solution: "Created fluid animations that respect brand guidelines while adding movement and energy to static assets.",
    tools: ["After Effects", "Illustrator", "Photoshop"],
    thumbnailUrl: "",
    previewVideoUrl: "",
    fullVideoUrl: "https://vimeo.com/987654321",
    featured: false,
    order: 3,
    createdAt: new Date().toISOString()
  }
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Seed projects
    const projectsPath = path.join(DATA_DIR, 'projects.json');
    await fs.writeFile(projectsPath, JSON.stringify(sampleProjects, null, 2));
    console.log(`✅ Created ${sampleProjects.length} sample projects`);

    // Initialize empty messages
    const messagesPath = path.join(DATA_DIR, 'messages.json');
    await fs.writeFile(messagesPath, JSON.stringify([], null, 2));
    console.log('✅ Initialized messages.json');

    // Initialize settings
    const settingsPath = path.join(DATA_DIR, 'settings.json');
    const settings = {
      heroTitle: "ELIZAVETA ANTONIUK",
      heroSubtitle: "Creating high-end visual experiences",
      aboutBio: "I'm a passionate 3D Animator and Motion Designer with years of experience creating stunning visual content for brands and agencies worldwide. I specialize in bringing ideas to life through cutting-edge animation and design.",
      stats: {
        projects: 47,
        clients: 32,
        years: 5
      },
      socialLinks: {
        behance: "https://behance.net",
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com"
      },
      colorPrimary: "#7B2FF7",
      colorAccent: "#FF2FD1",
      adminEmail: process.env.ADMIN_EMAIL || "admin@example.com"
    };
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    console.log('✅ Created settings.json');

    // Initialize visits
    const visitsPath = path.join(DATA_DIR, 'visits.json');
    await fs.writeFile(visitsPath, JSON.stringify([], null, 2));
    console.log('✅ Initialized visits.json');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Note: Sample projects have placeholder video URLs.');
    console.log('   Upload actual thumbnails and preview videos through the Admin Panel.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
