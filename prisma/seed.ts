import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: 'hashed_password', // In real app, this should be properly hashed
    },
  });

  // Create some public prompts
  const publicPrompts = [
    {
      title: 'Professional Email Writer',
      content: 'Write a professional email that is {tone} in tone, regarding {subject}. The email should be addressed to {recipient} and should include {key_points}.',
      category: 'Business',
      tags: ['email', 'professional', 'communication'],
      isPublic: true,
    },
    {
      title: 'Code Refactoring Assistant',
      content: 'Analyze this {language} code and suggest refactoring improvements focusing on {focus_areas}. Consider aspects like readability, performance, and best practices.',
      category: 'Programming',
      tags: ['coding', 'refactoring', 'best-practices'],
      isPublic: true,
    },
    {
      title: 'Blog Post Outline Generator',
      content: 'Create a detailed outline for a blog post about {topic}. The post should target {audience} and include sections for introduction, main points, and conclusion.',
      category: 'Content Creation',
      tags: ['blogging', 'writing', 'content-strategy'],
      isPublic: true,
    },
    {
      title: 'Product Description Writer',
      content: 'Write a compelling product description for {product_name}. Highlight its {features} and explain how it benefits {target_audience}. Include relevant keywords for SEO.',
      category: 'Marketing',
      tags: ['ecommerce', 'copywriting', 'marketing'],
      isPublic: true,
    },
    {
      title: 'Technical Documentation Template',
      content: 'Create a technical documentation template for {project_type}. Include sections for setup instructions, API documentation, and troubleshooting guides.',
      category: 'Documentation',
      tags: ['technical-writing', 'documentation', 'developer-tools'],
      isPublic: true,
    }
  ];

  // Insert all prompts
  for (const prompt of publicPrompts) {
    await prisma.prompt.create({
      data: {
        ...prompt,
        userId: demoUser.id
      }
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
