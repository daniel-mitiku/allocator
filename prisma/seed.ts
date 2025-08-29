import { PrismaClient, SystemRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Ensure a default college exists, as User model requires collegeId
  let defaultCollege = await prisma.college.findFirst({
    where: { name: "Default College" },
  });

  if (!defaultCollege) {
    defaultCollege = await prisma.college.create({
      data: {
        name: "Default College",
        code: "DEF",
        description: "Default college for initial setup",
        // Assuming a user with ADMIN role might eventually be linked,
        // but for now, we just need the college itself.
        // If your College model requires a userId, you'll need to create a dummy user first.
        // Based on your schema:
        // user        User         @relation("CollegeUser", fields: [userId], references: [id])
        // userId      String       @unique @db.ObjectId
        // This means a College needs a User. Let's create a placeholder user for the college.
      },
    });
    console.log(`Created default college: ${defaultCollege.name}`);
  }

  // Create or update the admin user
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123"; // IMPORTANT: In a real application, hash this password!

  // Check if an admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    // Update existing admin user's role and college if needed
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        name: "Admin User",
        systemRole: SystemRole.SUPER_ADMIN,
        collegeId: defaultCollege.id,
      },
    });
    console.log(`Updated existing admin user: ${adminEmail}`);
  } else {
    // Create new admin user
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin User",
        // In a real app, hash this password (e.g., using bcrypt)
        // For this demo, we'll keep it as a simple string comparison in auth.ts
        // This 'password' field is not directly in your User model for authentication,
        // it's handled by the CredentialsProvider in auth.ts.
        // We are setting the systemRole and linking to a college.
        systemRole: SystemRole.SUPER_ADMIN,
        collegeId: defaultCollege.id,
        // Ensure that the User model's 'preferenceToken' default is handled by Prisma
      },
    });
    console.log(`Created new admin user: ${adminEmail}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
